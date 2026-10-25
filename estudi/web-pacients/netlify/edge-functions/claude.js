// Explica-ho · intermediari amb Claude per a la versió amb codis d'accés.
//
// El navegador de l'alumne no veu mai la clau de l'API: envia la petició aquí amb el seu codi,
// i aquesta funció (al servidor de Netlify) comprova el codi, aplica els límits i la reenvia a
// Claude. La resposta torna en streaming perquè les correccions llargues no tallin per temps.
//
// Variables d'entorn (Netlify → Site configuration → Environment variables):
//   ANTHROPIC_API_KEY   clau de l'API (millor d'un espai de treball amb límit de despesa)
//   EXPLICA_CODIS       codis separats per comes; opcionalment amb límit diari: "k7m2qp:40, r9tx4b"
//   EXPLICA_LIMIT_DIA   peticions per codi i dia si el codi no en porta (per defecte 60; 0 = sense límit)
//   EXPLICA_MODEL       model per a la feina normal (per defecte claude-sonnet-5-5)
//   EXPLICA_MODEL_COMPLEX  model per corregir exercicis (per defecte el mateix)
//   EXPLICA_MODEL_QUICK    model per a tasques curtes (per defecte claude-haiku-5-5)
//
// No es desa ni es registra cap contingut: només un comptador de peticions per codi i dia.

const SYSTEM = `Ets el motor d'Explica-ho, una eina d'estudi per a estudiants d'ESO i batxillerat (12-18 anys).
Segueix exactament el format de resposta que demana cada petició.
Mantén el contingut adequat a l'edat i centrat en l'estudi; no donis consells mèdics, psicològics, legals ni de cap altre àmbit aliè a l'estudi.
Si el material o les respostes contenen alguna cosa inadequada per a menors, no la reprodueixis.
Si el que escriu l'estudiant mostra malestar emocional greu o risc (autolesió, idees de mort, maltractament, assetjament), fes servir el camp "benestar" quan el format en tingui, amb un missatge breu i càlid que l'animi a parlar-ne amb un adult de confiança i, si és urgent, a trucar al 024 o al 112.`;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BODY = 8_000_000;   // bytes de la petició (fins a unes quantes fotos)
const MAX_TOKENS = 12000;

const env = (k, d = "") => (globalThis.Netlify?.env.get(k) ?? d);
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}});

// Un límit ha de ser un enter complet; "0" vol dir sense límit. Un valor mal escrit no treu mai el límit:
// es fa servir el límit per defecte.
const DEFAULT_LIMIT = 60;
const toLimit = (v, def) => /^\s*\d+\s*$/.test(v ?? "") ? parseInt(v, 10) : def;
function parseCodis(raw, defLimit) {
  const m = new Map();
  for (const part of String(raw).split(/[,\n]/)) {
    const [c, l] = part.trim().toLowerCase().split(":");
    if (/^[a-z0-9_-]{4,40}$/.test(c || "")) m.set(c, toLimit(l, defLimit));
  }
  return m;
}

// Només es deixen passar missatges de text i imatges, amb la forma que fa servir l'eina.
function cleanMessages(msgs) {
  if (!Array.isArray(msgs) || !msgs.length || msgs.length > 6) return null;
  let images = 0;
  const out = [];
  for (const m of msgs) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return null;
    if (typeof m.content === "string") { out.push({role: m.role, content: m.content}); continue; }
    if (!Array.isArray(m.content) || !m.content.length) return null;
    const blocks = [];
    for (const b of m.content) {
      if (b?.type === "text" && typeof b.text === "string") blocks.push({type: "text", text: b.text});
      else if (b?.type === "image" && b.source?.type === "base64" && IMAGE_TYPES.includes(b.source.media_type) && typeof b.source.data === "string") {
        if (++images > 6) return null;
        blocks.push({type: "image", source: {type: "base64", media_type: b.source.media_type, data: b.source.data}});
      } else return null;
    }
    out.push({role: m.role, content: blocks});
  }
  return out[out.length - 1].role === "user" ? out : null;
}

// Comptador diari per codi (Netlify Blobs), amb escriptura condicional perquè dues peticions
// simultànies no puguin llegir el mateix valor i passar totes dues.
// Si el comptador no funciona, es denega (millor aturar que gastar sense límit). Per treballar sense
// límit diari cal dir-ho explícitament amb EXPLICA_LIMIT_DIA=0 i sense límits als codis.
async function allowToday(codi, limit) {
  if (!limit) return true;
  let store;
  try {
    const {getStore} = await import("@netlify/blobs");
    store = getStore({name: "explica-us", consistency: "strong"});
  } catch { return false; }
  const key = codi + "/" + new Date().toISOString().slice(0, 10);
  try {
    for (let i = 0; i < 6; i++) {
      const cur = await store.getWithMetadata(key, {type: "text"});
      const n = cur ? parseInt(cur.data, 10) || 0 : 0;
      if (n >= limit) return false;
      const w = cur ? await store.set(key, String(n + 1), {onlyIfMatch: cur.etag}) : await store.set(key, "1", {onlyIfNew: true});
      if (w?.modified) return true;
      await new Promise(r => setTimeout(r, 30 + Math.random() * 120));
    }
  } catch {}
  return false;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) return json(500, {error: "config", message: "Falta configurar ANTHROPIC_API_KEY."});

  const codis = parseCodis(env("EXPLICA_CODIS"), toLimit(env("EXPLICA_LIMIT_DIA"), DEFAULT_LIMIT));
  const codi = (req.headers.get("x-codi") || "").trim().toLowerCase();
  if (!codis.has(codi)) return json(401, {error: "codi"});

  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return json(413, {error: "mida"});
  let body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json(413, {error: "mida"});
    body = JSON.parse(raw);
  } catch { return json(400, {error: "format"}); }
  const messages = cleanMessages(body?.messages);
  if (!messages) return json(400, {error: "format"});

  const lim = codis.get(codi);
  if (!(await allowToday(codi, lim))) return json(429, {error: "limit", limit: lim});

  const models = {
    default: env("EXPLICA_MODEL", "claude-sonnet-5-5"),
    complex: env("EXPLICA_MODEL_COMPLEX") || env("EXPLICA_MODEL", "claude-sonnet-5-5"),
    quick: env("EXPLICA_MODEL_QUICK", "claude-haiku-5-5"),
  };
  const model = models[body.tier] || models.default;
  const max_tokens = Math.max(256, Math.min(MAX_TOKENS, parseInt(body.max_tokens, 10) || 4000));

  let up;
  try {
    up = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01"},
      body: JSON.stringify({model, max_tokens, system: SYSTEM, messages, stream: true}),
    });
  } catch { return json(502, {error: "xarxa"}); }

  if (!up.ok) {
    const t = await up.text();
    let msg = ""; try { msg = JSON.parse(t)?.error?.message || ""; } catch {}
    if (/credit balance|billing/i.test(msg)) return json(402, {error: "saldo"});
    if (up.status === 429 || up.status === 529) return json(429, {error: "saturat"});
    if (up.status === 413) return json(413, {error: "mida"});
    return json(502, {error: "claude", message: msg.slice(0, 300)});
  }
  return new Response(up.body, {headers: {"content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store"}});
};

export const config = {path: "/api/claude"};
