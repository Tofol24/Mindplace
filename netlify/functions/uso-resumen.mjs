// GET /api/uso-resumen?dias=90 · devuelve los recuentos por día.
// Requiere la cabecera «Authorization: Bearer <USO_CLAVE>» (variable de entorno
// de Netlify).
//
// Compactación idempotente: los eventos de días ya cerrados se guardan como un
// lote (lote/<día>/<huella>) que contiene la lista de sus claves, y después se
// borran. Cada día se cuenta sobre la UNIÓN de claves de sus lotes y de los
// eventos que queden: si un borrado falla o dos lecturas coinciden, una clave
// repetida no se cuenta dos veces y ninguna se pierde.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
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

function huella(claves) {
  return createHash("sha256").update(claves.slice().sort().join("\n")).digest("hex").slice(0, 20);
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

  // 1) Eventos sueltos agrupados por día.
  const sueltos = {};
  for (const { key } of (await store.list({ prefix: "ev/" })).blobs) {
    const d = diaDe(key);
    if (d) (sueltos[d] ||= []).push(key);
  }

  // 2) Días cerrados: se guardan como lote (clave determinista) y se borran los sueltos.
  for (const [d, claves] of Object.entries(sueltos)) {
    if (d >= hoy) continue;
    await store.setJSON(`lote/${d}/${huella(claves)}`, { claves });
    await enTandas(claves, 50, (k) => store.delete(k));
  }

  // 3) Recuento de cada día del rango sobre la unión de lotes + sueltos.
  const porDia = {};
  for (const [d, claves] of Object.entries(sueltos)) if (d >= desde && d <= hoy) (porDia[d] ||= new Set()) && claves.forEach((k) => porDia[d].add(k));
  const lotes = (await store.list({ prefix: "lote/" })).blobs.map((b) => b.key).filter((k) => {
    const d = k.split("/")[1];
    return d >= desde && d <= hoy;
  });
  await enTandas(lotes, 20, async (k) => {
    const doc = await store.get(k, { type: "json" });
    const d = k.split("/")[1];
    for (const c of doc?.claves || []) (porDia[d] ||= new Set()).add(c);
  });

  const resultado = {};
  for (const [d, set] of Object.entries(porDia)) resultado[d] = resumir([...set]);
  return json({ generado: new Date().toISOString(), hoy, desde, dias: resultado });
};

export const config = { path: "/api/uso-resumen" };
