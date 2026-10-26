// GET /api/uso-resumen?dias=90 · devuelve los recuentos por día.
// Requiere la cabecera «Authorization: Bearer <USO_CLAVE>» (variable de entorno
// de Netlify). De paso compacta los días ya cerrados en dia/<día>.
import { getStore } from "@netlify/blobs";
import { diaMadrid, fusionar, resumirClaves } from "../lib/uso.mjs";

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

  // 1) Eventos sueltos: los de días cerrados se resumen y se borran; los de hoy se cuentan en vivo.
  const { blobs } = await store.list({ prefix: "ev/" });
  const porDia = {};
  for (const { key } of blobs) (porDia[key.split("/")[1]] ||= []).push(key);
  const resultado = {};
  for (const [dia, claves] of Object.entries(porDia)) {
    const resumen = resumirClaves(claves)[dia];
    if (dia < hoy) {
      const previo = await store.get("dia/" + dia, { type: "json" });
      await store.setJSON("dia/" + dia, fusionar(previo, resumen));
      await enTandas(claves, 50, (k) => store.delete(k));
    } else {
      resultado[dia] = fusionar(resultado[dia], resumen);
    }
  }

  // 2) Días ya resumidos dentro del rango pedido.
  const { blobs: resumenes } = await store.list({ prefix: "dia/" });
  const pedidos = resumenes.map((b) => b.key.slice(4)).filter((d) => d >= desde && d <= hoy);
  await enTandas(pedidos, 20, async (d) => {
    resultado[d] = fusionar(resultado[d], await store.get("dia/" + d, { type: "json" }));
  });

  return json({ generado: new Date().toISOString(), hoy, desde, dias: resultado });
};

export const config = { path: "/api/uso-resumen" };
