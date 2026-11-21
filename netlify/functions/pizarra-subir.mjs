// POST /api/pizarra-subir · guarda el bloque cifrado de un enlace corto de la Pizarra
// (cuerpo: texto en base64url) y devuelve { id }. Ver netlify/lib/pizarra.mjs.
import { getStore } from "@netlify/blobs";
import { SUBIDAS_DIA, USO, acceso, almacen, claveSubida, contar, obligatoria } from "../lib/pizarra-subs.mjs";
import { CABECERAS, CUOTA_DIA, MAX_BYTES, caducidad, claveDato, claveIndice, datosValidos, dia, nuevoId } from "../lib/pizarra.mjs";

// Reserva una subida en el tope global del día con escritura condicional (ETag):
// si dos subidas leen a la vez, una de las dos reintenta con el valor nuevo.
async function reservarCuota(store, bytes, ahora) {
  const kc = "cuota/" + dia(ahora);
  for (let i = 0; i < 6; i++) {
    const r = await store.getWithMetadata(kc, { type: "json" });
    const c = (r && r.data) || { n: 0, bytes: 0 };
    if (c.n >= CUOTA_DIA.n || c.bytes + bytes > CUOTA_DIA.bytes) return "lleno";
    const nuevo = { n: c.n + 1, bytes: c.bytes + bytes };
    let etag = r && r.etag;
    if (r && !etag) { const m = await store.getMetadata(kc); etag = m && m.etag; }
    // sin ETag disponible (p. ej. en el servidor local de pruebas) se escribe sin condición
    const w = !r ? await store.setJSON(kc, nuevo, { onlyIfNew: true })
      : etag ? await store.setJSON(kc, nuevo, { onlyIfMatch: etag })
      : await store.setJSON(kc, nuevo);
    if (w && w.modified) return "ok";
  }
  return "ocupado";
}

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { ...CABECERAS, Allow: "POST" } });
  const largo = Number(req.headers.get("content-length") || 0);
  if (largo > MAX_BYTES + 100) return new Response(null, { status: 413, headers: CABECERAS });
  let datos = "";
  try { datos = (await req.text()).trim(); } catch { return new Response(null, { status: 400, headers: CABECERAS }); }
  if (datos.length > MAX_BYTES) return new Response(null, { status: 413, headers: CABECERAS });
  if (!datosValidos(datos)) return new Response(null, { status: 400, headers: CABECERAS });

  // Sitio de pago (PIZARRA_SUSCRIPCION=si): los enlaces cortos son de la suscripción.
  if (obligatoria()) {
    let a = null;
    try { a = await acceso(req.headers.get("x-codigo")); } catch { return new Response(null, { status: 503, headers: { ...CABECERAS, "Retry-After": "5" } }); }
    if (!a) return Response.json({ error: "suscripcion" }, { status: 402, headers: CABECERAS });
    if (!(await contar(almacen(USO), claveSubida(a.huella), SUBIDAS_DIA)).ok) return new Response(null, { status: 429, headers: { ...CABECERAS, "Retry-After": "3600" } });
  }

  const store = getStore({ name: "pizarra", consistency: "strong" });
  const ahora = Date.now();
  const cuota = await reservarCuota(store, datos.length, ahora);
  if (cuota === "lleno") return new Response(null, { status: 429, headers: { ...CABECERAS, "Retry-After": "3600" } });
  if (cuota !== "ok") return new Response(null, { status: 503, headers: { ...CABECERAS, "Retry-After": "5" } });

  let id = nuevoId();
  for (let i = 0; i < 3 && (await store.getMetadata(claveDato(id))); i++) id = nuevoId();
  const exp = caducidad(ahora);
  // primero el índice: si después falla el bloque, la limpieza solo encontrará una entrada vacía
  await store.set(claveIndice(exp, id), "");
  await store.set(claveDato(id), datos, { metadata: { exp } });
  return Response.json({ id }, { status: 201, headers: CABECERAS });
};

// Límite por IP en el borde de Netlify (la IP no se guarda en ningún sitio).
// La lectura (/api/pizarra) no lleva regla propia, para no superar el número de reglas del plan.
export const config = {
  path: "/api/pizarra-subir",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
