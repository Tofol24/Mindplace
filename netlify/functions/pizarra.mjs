// GET /api/pizarra?id=XXXXXXXXXX · devuelve el bloque cifrado de un enlace corto de la
// Pizarra, o 404 si no existe o ha caducado (ver netlify/lib/pizarra.mjs).
// Las subidas van por /api/pizarra-subir, con un límite propio más estricto.
import { getStore } from "@netlify/blobs";
import { CABECERAS, RE_ID, caducado, claveDato, claveIndice } from "../lib/pizarra.mjs";

export default async (req) => {
  if (req.method !== "GET") return new Response(null, { status: 405, headers: { ...CABECERAS, Allow: "GET" } });
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!RE_ID.test(id)) return new Response(null, { status: 400, headers: CABECERAS });
  const store = getStore("pizarra");
  const r = await store.getWithMetadata(claveDato(id));
  if (!r) return new Response(null, { status: 404, headers: CABECERAS });
  if (caducado(r.metadata)) {
    await store.delete(claveDato(id));
    if (r.metadata && typeof r.metadata.exp === "number") await store.delete(claveIndice(r.metadata.exp, id));
    return new Response(null, { status: 404, headers: CABECERAS });
  }
  return new Response(r.data, { status: 200, headers: { ...CABECERAS, "Content-Type": "text/plain; charset=utf-8" } });
};

// Sin regla de límite propia: leer es barato (un 404 si el id no existe) y así no se supera
// el número de reglas de límite del plan de Netlify. La subida sí tiene límite.
export const config = { path: "/api/pizarra" };
