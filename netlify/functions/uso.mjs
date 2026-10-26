// POST /api/uso · registra un evento anónimo de uso (ver netlify/lib/uso.mjs).
import { getStore } from "@netlify/blobs";
import { claveEvento } from "../lib/uso.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  let ev;
  try {
    const texto = await req.text();
    if (texto.length > 500) return new Response(null, { status: 413 });
    ev = JSON.parse(texto);
  } catch {
    return new Response(null, { status: 400 });
  }
  const clave = claveEvento(ev);
  if (!clave) return new Response(null, { status: 400 });
  await getStore("uso").set(clave, "");
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
};

export const config = { path: "/api/uso" };
