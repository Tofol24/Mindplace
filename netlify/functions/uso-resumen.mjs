// GET /api/uso-resumen?dias=90 · devuelve los recuentos por día.
// Requiere la cabecera «Authorization: Bearer <USO_CLAVE>» (variable de entorno
// de Netlify).
//
// Cada día cerrado (anterior a hoy) se resume una sola vez en dia/<día>, un
// documento de tamaño fijo, y se borran sus eventos sueltos. El resumen se
// escribe con «solo si no existe»: si dos consultas coinciden, gana la primera
// y la otra lo lee; si un borrado falla, los eventos que quedan de un día ya
// resumido se borran sin volver a contarlos (los eventos se fechan al llegar,
// así que un día cerrado no recibe eventos nuevos). Solo se recorren los meses
// del periodo pedido.
import { getStore } from "@netlify/blobs";
import { diaDe, diaMadrid, resumir } from "../lib/uso.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(cuerpo, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function enTandas(lista, n, fn) {
  for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(fn));
}

/** Meses (AAAA-MM) entre dos días, ambos incluidos. */
function meses(desde, hasta) {
  const r = [];
  let [a, m] = desde.split("-").map(Number);
  const [a2, m2] = hasta.split("-").map(Number);
  while (a < a2 || (a === a2 && m <= m2)) {
    r.push(a + "-" + String(m).padStart(2, "0"));
    if (++m > 12) { m = 1; a++; }
  }
  return r;
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "GET") return json({ error: "Método no permitido" }, 405);

  const clave = process.env.USO_CLAVE;
  if (!clave) return json({ error: "Falta configurar USO_CLAVE en Netlify." }, 503);
  if ((req.headers.get("authorization") || "") !== "Bearer " + clave) return json({ error: "Clave incorrecta." }, 401);

  const url = new URL(req.url);
  const dias = Math.min(Math.max(parseInt(url.searchParams.get("dias") || "90", 10) || 90, 1), 400);
  const hoy = diaMadrid();
  const desde = diaMadrid(new Date(Date.now() - (dias - 1) * 86400000));
  const store = getStore("uso");
  const enRango = (d) => d >= desde && d <= hoy;

  // 1) Eventos sueltos y resúmenes de los meses del periodo.
  const sueltos = {}, resumidos = new Set();
  await enTandas(meses(desde, hoy), 6, async (mes) => {
    const [ev, dia] = await Promise.all([store.list({ prefix: "ev/" + mes }), store.list({ prefix: "dia/" + mes })]);
    for (const { key } of ev.blobs) { const d = diaDe(key); if (d && enRango(d)) (sueltos[d] ||= []).push(key); }
    for (const { key } of dia.blobs) { const d = key.slice(4); if (enRango(d)) resumidos.add(d); }
  });

  const resultado = {};
  // 2) Hoy: en vivo.
  if (sueltos[hoy]) resultado[hoy] = resumir(sueltos[hoy]);

  // 3) Días cerrados con eventos sueltos: se resumen (una sola vez) y se borran.
  const cerrados = Object.keys(sueltos).filter((d) => d < hoy);
  await enTandas(cerrados, 5, async (d) => {
    if (!resumidos.has(d)) {
      const res = await store.setJSON("dia/" + d, resumir(sueltos[d]), { onlyIfNew: true });
      resumidos.add(d);
      if (res && res.modified) resultado[d] = resumir(sueltos[d]);
    }
    await enTandas(sueltos[d], 50, (k) => store.delete(k));
  });

  // 4) Días ya resumidos.
  await enTandas([...resumidos].filter((d) => !resultado[d]), 20, async (d) => {
    const doc = await store.get("dia/" + d, { type: "json" });
    if (doc) resultado[d] = doc;
  });

  return json({ generado: new Date().toISOString(), hoy, desde, dias: resultado });
};

export const config = { path: "/api/uso-resumen" };
