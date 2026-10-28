// Explica-ho · estadístiques d'ús per al titular: peticions, tokens i cost per dia i per codi.
// Només amb la clau EXPLICA_ADMIN (mínim 16 caràcters) a la capçalera x-explica-admin. Sense la variable, no existeix.
import {env, json, store, getJSON, count, fingerprint} from "../lib/comu.js";

// Comparació sense fuites de temps: es comparen les empremtes, no els textos.
async function same(a, b) {
  const [x, y] = await Promise.all([fingerprint("adm:" + a), fingerprint("adm:" + b)]);
  let d = 0; for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

export default async (req, context) => {
  const admin = String(env("EXPLICA_ADMIN")).trim();
  if (!admin || admin.length < 16) return json(404, {error: "no"});
  if (req.method !== "GET") return json(405, {error: "metode"});
  const us = await store("explica-us");
  const day = new Date().toISOString().slice(0, 10);
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "?";
  const failKey = "fail/adm/" + await fingerprint("ip:" + ip) + "/" + day;
  if ((Number((await getJSON(us, failKey))?.n) || 0) >= 10) return json(429, {error: "intents"});
  if (!(await same((req.headers.get("x-explica-admin") || "").trim(), admin))) {
    await count(us, failKey, 11).catch(() => {});
    return json(401, {error: "clau"});
  }
  const dies = Math.min(400, Math.max(1, parseInt(new URL(req.url).searchParams.get("dies"), 10) || 31));
  const from = new Date(Date.now() - (dies - 1) * 86400 * 1000).toISOString().slice(0, 10);
  const {blobs} = await us.list({prefix: "estad/"});
  const out = [];
  for (const {key} of blobs) {
    const d = key.slice(6);
    if (d >= from) out.push({dia: d, ...((await getJSON(us, key)) || {})});
  }
  out.sort((a, b) => a.dia < b.dia ? 1 : -1);
  return json(200, {dies: out});
};

export const config = {path: "/api/estadistiques"};
