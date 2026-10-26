// POST /api/uso · registra eventos anónimos de uso (ver netlify/lib/uso.mjs).
// Acepta un evento o una lista de hasta 20 (la cola de lo guardado sin conexión).
import { getStore } from "@netlify/blobs";
import { claveEvento } from "../lib/uso.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  let ev;
  try {
    const texto = await req.text();
    if (texto.length > 4000) return new Response(null, { status: 413 });
    ev = JSON.parse(texto);
  } catch {
    return new Response(null, { status: 400 });
  }
  const lista = Array.isArray(ev) ? ev.slice(0, 20) : [ev];
  const claves = lista.map((e) => claveEvento(e)).filter(Boolean);
  if (!claves.length) return new Response(null, { status: 400 });
  const store = getStore("uso");
  await Promise.all(claves.map((c) => store.set(c, "")));
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
};

// Límite de envíos por IP en el borde de Netlify (la IP no se guarda en ningún sitio):
// frena scripts que intenten inflar los recuentos o llenar el almacén.
export const config = {
  path: "/api/uso",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
