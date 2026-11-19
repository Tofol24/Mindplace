// /api/pizarra · enlaces cortos cifrados de la Pizarra del entrenador (ver netlify/lib/pizarra.mjs).
//   POST (cuerpo: texto cifrado en base64url) → { id }
//   GET ?id=XXXXXXXXXX                        → el texto cifrado, o 404 si no existe o ha caducado
import { getStore } from "@netlify/blobs";
import { RE_ID, caducado, caducidad, datosValidos, nuevoId } from "../lib/pizarra.mjs";

const CABECERAS = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export default async (req) => {
  const store = getStore("pizarra");
  if (req.method === "POST") {
    let datos;
    try { datos = (await req.text()).trim(); } catch { return new Response(null, { status: 400, headers: CABECERAS }); }
    if (!datosValidos(datos)) return new Response(null, { status: datos && datos.length > 300_000 ? 413 : 400, headers: CABECERAS });
    let id = nuevoId();
    for (let i = 0; i < 3 && (await store.getMetadata(id)); i++) id = nuevoId();
    await store.set(id, datos, { metadata: { exp: caducidad() } });
    return Response.json({ id }, { status: 201, headers: CABECERAS });
  }
  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!RE_ID.test(id)) return new Response(null, { status: 400, headers: CABECERAS });
    const r = await store.getWithMetadata(id);
    if (!r) return new Response(null, { status: 404, headers: CABECERAS });
    if (caducado(r.metadata)) { await store.delete(id); return new Response(null, { status: 404, headers: CABECERAS }); }
    return new Response(r.data, { status: 200, headers: { ...CABECERAS, "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(null, { status: 405, headers: { ...CABECERAS, Allow: "GET, POST" } });
};

// Límite por IP en el borde de Netlify (la IP no se guarda en ningún sitio).
export const config = {
  path: "/api/pizarra",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
