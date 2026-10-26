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
//   EXPLICA_PLANS, STRIPE_*  subscripcions de pagament (vegeu README.md): codis amb quota mensual
//
// No es desa ni es registra cap contingut: només comptadors de peticions per codi (dia i mes).

import {env, json, store, count, toLimit, manualCodes, plans, subForCode, subActive} from "../lib/comu.js";

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

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) return json(500, {error: "config", message: "Falta configurar ANTHROPIC_API_KEY."});

  const dayLimit = toLimit(env("EXPLICA_LIMIT_DIA"), DEFAULT_LIMIT);
  const codis = manualCodes(dayLimit);
  const codi = (req.headers.get("x-codi") || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{4,40}$/.test(codi)) return json(401, {error: "codi"});
  // Codi donat a mà (pacients) o codi d'una subscripció de Stripe (quota mensual del seu pla).
  let lim = codis.get(codi), monthLimit = 0;
  if (lim === undefined) {
    let sub = null;
    try { sub = await subForCode(await store("explica-subs"), codi); } catch { return json(503, {error: "servei"}); }
    if (!sub) return json(401, {error: "codi"});
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

  const today = new Date().toISOString().slice(0, 10);
  if (!(await allow(codi + "/" + today, lim)).ok) return json(429, {error: "limit", limit: lim});
  let restants = null;
  if (monthLimit) {
    const m = await allow(codi + "/mes/" + today.slice(0, 7), monthLimit);
    if (!m.ok) return json(429, {error: "quota", quota: monthLimit});
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
  } catch { return json(502, {error: "xarxa"}); }

  if (!up.ok) {
    const t = await up.text();
    let msg = ""; try { msg = JSON.parse(t)?.error?.message || ""; } catch {}
    if (/credit balance|billing/i.test(msg)) return json(402, {error: "saldo"});
    if (up.status === 429 || up.status === 529) return json(429, {error: "saturat"});
    if (up.status === 413) return json(413, {error: "mida"});
    return json(502, {error: "claude", message: msg.slice(0, 300)});
  }
  return new Response(up.body, {headers: {"content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store",
    ...(restants === null ? {} : {"x-explica-restants": String(restants)})}});
};

export const config = {path: "/api/claude"};
