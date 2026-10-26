// GET /api/uso-resumen?dias=90 · devuelve los recuentos por día.
// Requiere la cabecera «Authorization: Bearer <USO_CLAVE>» (variable de entorno
// de Netlify). Solo recorre los meses del periodo pedido. Hoy y ayer se cuentan
// en vivo; los días anteriores se cierran (ver cerrarDias en netlify/lib/uso.mjs).
// La limpieza de fondo la hace cada noche netlify/functions/uso-diario.mjs.
import { getStore } from "@netlify/blobs";
import { cerrarDias, diaMadrid, listar, primerDiaAbierto, resumir } from "../lib/uso.mjs";

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
  const abierto = primerDiaAbierto();
  const desde = diaMadrid(new Date(Date.now() - (dias - 1) * 86400000));
  const enRango = (d) => d >= desde && d <= hoy;
  const store = getStore("uso");

  const sueltos = {}, resumidos = new Set();
  for (const mes of meses(desde, hoy)) {
    const l = await listar(store, mes);
    for (const [d, c] of Object.entries(l.sueltos)) if (enRango(d)) sueltos[d] = c;
    for (const d of l.resumidos) if (enRango(d)) resumidos.add(d);
  }

  const resultado = await cerrarDias(store, sueltos, resumidos, abierto);
  for (const [d, claves] of Object.entries(sueltos)) if (d >= abierto) resultado[d] = resumir(claves);
  const porLeer = [...resumidos].filter((d) => !resultado[d]);
  for (let i = 0; i < porLeer.length; i += 20) {
    await Promise.all(porLeer.slice(i, i + 20).map(async (d) => {
      const doc = await store.get("dia/" + d, { type: "json" });
      if (doc) resultado[d] = doc;
    }));
  }

  return json({ generado: new Date().toISOString(), hoy, desde, dias: resultado });
};

export const config = { path: "/api/uso-resumen" };
