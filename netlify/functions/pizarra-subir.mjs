// POST /api/pizarra-subir · guarda el bloque cifrado de un enlace corto de la Pizarra
// (cuerpo: texto en base64url) y devuelve { id }. Ver netlify/lib/pizarra.mjs.
import { getStore } from "@netlify/blobs";
import { CABECERAS, CUOTA_DIA, MAX_BYTES, caducidad, claveDato, claveIndice, datosValidos, dia, nuevoId } from "../lib/pizarra.mjs";

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { ...CABECERAS, Allow: "POST" } });
  const largo = Number(req.headers.get("content-length") || 0);
  if (largo > MAX_BYTES + 100) return new Response(null, { status: 413, headers: CABECERAS });
  let datos = "";
  try { datos = (await req.text()).trim(); } catch { return new Response(null, { status: 400, headers: CABECERAS }); }
  if (datos.length > MAX_BYTES) return new Response(null, { status: 413, headers: CABECERAS });
  if (!datosValidos(datos)) return new Response(null, { status: 400, headers: CABECERAS });

  const store = getStore("pizarra");
  // Tope global diario (aproximado: varias subidas simultáneas pueden contarse a la vez).
  const ahora = Date.now();
  const kc = "cuota/" + dia(ahora);
  const cuota = (await store.get(kc, { type: "json" })) || { n: 0, bytes: 0 };
  if (cuota.n >= CUOTA_DIA.n || cuota.bytes + datos.length > CUOTA_DIA.bytes) {
    return new Response(null, { status: 429, headers: { ...CABECERAS, "Retry-After": "3600" } });
  }
  await store.setJSON(kc, { n: cuota.n + 1, bytes: cuota.bytes + datos.length });

  let id = nuevoId();
  for (let i = 0; i < 3 && (await store.getMetadata(claveDato(id))); i++) id = nuevoId();
  const exp = caducidad(ahora);
  await store.set(claveDato(id), datos, { metadata: { exp } });
  await store.set(claveIndice(exp, id), "");
  return Response.json({ id }, { status: 201, headers: CABECERAS });
};

// Más estricto que la lectura: un entrenador sube pocos planes por minuto.
export const config = {
  path: "/api/pizarra-subir",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
