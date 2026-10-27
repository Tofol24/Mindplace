// Explica-ho · intermediari amb Claude per a la versió amb codis d'accés.
//
// El navegador de l'alumne no veu mai la clau de l'API: envia la petició aquí amb el seu codi,
// i aquesta funció (al servidor de Netlify) comprova el codi, aplica els límits i la reenvia a
// Claude. La resposta torna en streaming perquè les correccions llargues no tallin per temps.
//
// Variables d'entorn (Netlify → Site configuration → Environment variables):
//   ANTHROPIC_API_KEY   clau de l'API (millor d'un espai de treball amb límit de despesa)
//   EXPLICA_CODIS       codis separats per comes; opcionalment amb límit diari: "k7m2qpx4:40, r9tx4bm8" (mínim 8 caràcters)
//   EXPLICA_LIMIT_DIA   peticions per codi i dia si el codi no en porta (per defecte 60; 0 = sense límit)
//   EXPLICA_MODEL       model per a la feina normal (per defecte claude-sonnet-5-5)
//   EXPLICA_MODEL_COMPLEX  model per corregir exercicis (per defecte el mateix)
//   EXPLICA_MODEL_QUICK    model per a tasques curtes (per defecte claude-haiku-5-5)
//
//   EXPLICA_PLANS, STRIPE_*  subscripcions de pagament (vegeu README.md): codis amb quota mensual
//
// No es desa ni es registra cap contingut: només comptadors de peticions per codi (dia i mes).

import {env, json, store, getJSON, count, uncount, toLimit, manualCodes, plans, subForCode, subActive, fingerprint, purgeLater} from "../lib/comu.js";

const SYSTEM = `Ets el motor d'Explica-ho, una eina d'estudi per a estudiants d'ESO i batxillerat (12-18 anys).
Segueix exactament el format de resposta que demana cada petició.
Mantén el contingut adequat a l'edat i centrat en l'estudi; no donis consells mèdics, psicològics, legals ni de cap altre àmbit aliè a l'estudi.
Si el material o les respostes contenen alguna cosa inadequada per a menors, no la reprodueixis.
Si el que escriu l'estudiant mostra malestar emocional greu o risc (autolesió, idees de mort, maltractament, assetjament), fes servir el camp "benestar" quan el format en tingui, amb un missatge breu i càlid que l'animi a parlar-ne amb un adult de confiança i, si és urgent, a trucar al 024 o al 112.`;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BODY = 8_000_000;   // bytes de la petició (fins a unes quantes fotos)
const MAX_TOKENS = 12000;
const DEFAULT_LIMIT = 60;

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

// Comptadors (Netlify Blobs) amb escriptura condicional: dues peticions simultànies no poden passar
// totes dues amb el mateix valor. Si el comptador no funciona, es denega (millor aturar que gastar
// sense límit). Per treballar sense límit diari cal dir-ho explícitament amb EXPLICA_LIMIT_DIA=0.
async function allow(key, limit) {
  if (!limit) return {ok: true, used: 0};
  try { return await count(await store("explica-us"), key, limit); } catch { return {ok: false, used: 0}; }
}
// Si la petició no arriba a Claude (o Claude falla), es retornen les peticions comptades.
async function refund(keys) {
  if (!keys.length) return;
  try { const st = await store("explica-us"); for (const k of keys) await uncount(st, k); } catch {}
}

// Intents de codi incorrectes: màxim 20 al dia per connexió (per no poder provar codis a l'atzar).
const MAX_FAILS = 20;
async function failKey(req, context) {
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "?";
  return "fail/" + await fingerprint("ip:" + ip) + "/" + new Date().toISOString().slice(0, 10);
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) return json(500, {error: "config", message: "Falta configurar ANTHROPIC_API_KEY."});
  purgeLater(context);

  const dayLimit = toLimit(env("EXPLICA_LIMIT_DIA"), DEFAULT_LIMIT);
  const codis = manualCodes(dayLimit);
  const codi = (req.headers.get("x-codi") || "").trim().toLowerCase();
  // Si el magatzem no està disponible, no es compten els intents (la resta de límits ja deneguen per si sols).
  let us = null, fk = null;
  try { us = await store("explica-us"); fk = await failKey(req, context); } catch {}
  if (us && (Number((await getJSON(us, fk).catch(() => null))?.n) || 0) >= MAX_FAILS) return json(429, {error: "intents"});
  const badCode = async () => { if (us) await count(us, fk, MAX_FAILS + 1).catch(() => {}); return json(401, {error: "codi"}); };
  if (!/^[a-z0-9_-]{4,40}$/.test(codi)) return badCode();
  // Codi donat a mà (pacients) o codi d'una subscripció de Stripe (quota mensual del seu pla).
  let lim = codis.get(codi), monthLimit = 0;
  if (lim === undefined) {
    if (!env("STRIPE_SECRET_KEY")) return badCode();   // sense subscripcions, només valen els codis donats a mà
    let sub = null;
    try { sub = await subForCode(await store("explica-subs"), codi); } catch { return json(503, {error: "servei"}); }
    if (!sub) return badCode();
    if (!subActive(sub)) return json(402, {error: "subscripcio"});
    lim = dayLimit;
    monthLimit = plans().find(p => p.price === sub.price)?.quota ?? 0;
    if (!monthLimit) return json(402, {error: "subscripcio"});
  }

  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return json(413, {error: "mida"});
  let body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json(413, {error: "mida"});
    body = JSON.parse(raw);
  } catch { return json(400, {error: "format"}); }
  const messages = cleanMessages(body?.messages);
  if (!messages) return json(400, {error: "format"});

  const today = new Date().toISOString().slice(0, 10), counted = [];
  const dayKey = codi + "/" + today, monthKey = codi + "/mes/" + today.slice(0, 7);
  if (!(await allow(dayKey, lim)).ok) return json(429, {error: "limit", limit: lim});
  if (lim) counted.push(dayKey);
  let restants = null;
  if (monthLimit) {
    const m = await allow(monthKey, monthLimit);
    if (!m.ok) { await refund(counted); return json(429, {error: "quota", quota: monthLimit}); }
    counted.push(monthKey);
    restants = Math.max(0, monthLimit - m.used);
  }

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
  } catch { await refund(counted); return json(502, {error: "xarxa"}); }

  if (!up.ok) {
    await refund(counted);
    const t = await up.text();
    let msg = ""; try { msg = JSON.parse(t)?.error?.message || ""; } catch {}
    if (/credit balance|billing/i.test(msg)) return json(402, {error: "saldo"});
    if (up.status === 429 || up.status === 529) return json(429, {error: "saturat"});
    if (up.status === 413) return json(413, {error: "mida"});
    return json(502, {error: "claude", message: msg.slice(0, 300)});
  }
  // Es vigila el flux: si Claude envia un error, talla la resposta per llargària (l'eina la descarta)
  // o el flux s'acaba sense el final, es retorna la quota.
  const dec = new TextDecoder(), reader = up.body.getReader();
  let tail = "", sawStop = false, sawError = false, truncated = false, settled = false;
  const finish = async (ok) => { if (settled) return; settled = true; if (!ok) await refund(counted); };
  const watched = new ReadableStream({
    async pull(ctl) {
      try {
        const {value, done} = await reader.read();
        if (done) { await finish(sawStop && !sawError && !truncated); ctl.close(); return; }
        const txt = tail + dec.decode(value, {stream: true});
        if (/"type":\s*"message_stop"/.test(txt)) sawStop = true;
        if (/"type":\s*"error"/.test(txt)) sawError = true;
        if (/"stop_reason":\s*"max_tokens"/.test(txt)) truncated = true;
        tail = txt.slice(-40);
        ctl.enqueue(value);
      } catch (e) { await finish(false); ctl.error(e); }   // la connexió amb Claude s'ha tallat
    },
    cancel(reason) { settled = true; return reader.cancel(reason); },   // l'estudiant ha aturat: Claude ja ha treballat
  });
  return new Response(watched, {headers: {"content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store",
    ...(restants === null ? {} : {"x-explica-restants": String(restants)})}});
};

export const config = {path: "/api/claude"};
