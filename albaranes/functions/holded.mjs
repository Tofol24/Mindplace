// /api/holded/* · puente entre el móvil y Holded (ver lib/holded.mjs).
//   GET  /api/holded/estado         comprueba las claves y qué impuestos especiales hay en Holded
//   GET  /api/holded/clientes?q=    busca clientes en Holded para autocompletar
//   POST /api/holded/enviar         crea el albarán (y el cliente si hace falta)
//
// La clave de Holded nunca llega al móvil: vive en la variable HOLDED_API_KEY
// de Netlify. El móvil se identifica con la clave de la app (APP_CLAVE).
import { getStore } from "@netlify/blobs";
import { claveCorrecta, json } from "../lib/http.mjs";
import {
  ErrorHolded, MAX_PDF_BASE64, contactoParaMovil, crearClienteHolded, enviarAlbaran, validarAlbaran,
} from "../lib/holded.mjs";

// Al móvil le importa una cosa: si el problema es de ESTE albarán (hay que corregirlo:
// 400/422) o de la conexión (claves, permisos, Holded caído: el albarán sigue en cola).
function fallo(e) {
  if (e instanceof ErrorHolded) {
    const delAlbaran = e.status === 400 || e.status === 422;
    const status = delAlbaran ? 422 : e.reintentar ? 503 : 502;
    return json({ error: e.message, reintentar: e.reintentar, delAlbaran, yaEnHolded: !!e.yaEnHolded }, status);
  }
  console.error(e);
  return json({ error: "Error inesperado en el servidor", reintentar: true }, 500);
}

export default async (req) => {
  const ruta = new URL(req.url).pathname.replace(/\/+$/, "");
  const apiKey = process.env.HOLDED_API_KEY;
  // Primero la clave: sin ella no se dice nada de cómo está configurado el servidor.
  if (!claveCorrecta(req)) {
    return json({ error: "La clave de la app no es correcta", reintentar: false }, 401);
  }
  if (!apiKey) return json({ error: "Falta configurar HOLDED_API_KEY en Netlify", reintentar: false }, 500);
  const holded = crearClienteHolded({ apiKey });

  try {
    if (ruta === "/api/holded/estado" && req.method === "GET") {
      await holded.buscarContactos("a", 1);
      // Qué impuestos especiales hay disponibles, para avisar antes del primer envío.
      let impuestos = null;
      try {
        const i = await holded.impuestos();
        impuestos = { leidos: !i.sinLista, exento: !!i.iva[0], retencion: { 7: !!i.retencion[7], 15: !!i.retencion[15] } };
      } catch { /* la conexión va bien; los impuestos ya se comprobarán al enviar */ }
      return json({ ok: true, impuestos });
    }

    if (ruta === "/api/holded/clientes" && req.method === "GET") {
      const q = (new URL(req.url).searchParams.get("q") || "").trim();
      if (q.length < 2) return json({ clientes: [] });
      const items = await holded.buscarContactos(q.slice(0, 80), 10);
      return json({ clientes: items.map(contactoParaMovil) });
    }

    if (ruta === "/api/holded/enviar" && req.method === "POST") {
      const cuerpo = await req.text();
      if (cuerpo.length > MAX_PDF_BASE64 + 200_000) return json({ error: "El albarán es demasiado grande", reintentar: false, delAlbaran: true }, 413);
      let datos;
      try { datos = JSON.parse(cuerpo); } catch { return json({ error: "Datos no válidos", reintentar: false, delAlbaran: true }, 422); }
      const albaran = validarAlbaran(datos);
      // Consistencia fuerte: un reintento inmediato debe ver el progreso del intento anterior.
      const store = getStore({ name: "albaranes-holded", consistency: "strong" });
      const almacen = {
        leer: (id) => store.get(`alb/${id}`, { type: "json" }),
        guardar: (id, estado) => store.setJSON(`alb/${id}`, estado),
        // Cerrojo atómico (onlyIfNew / onlyIfMatch). Si una función murió sin soltarlo,
        // caduca a los 60 s: ninguna invocación dura tanto.
        bloquear: async (id) => {
          const clave = `cerrojo/${id}`;
          const ahora = Date.now();
          let r = await store.setJSON(clave, { desde: ahora }, { onlyIfNew: true });
          if (!r.modified) {
            const actual = await store.getWithMetadata(clave, { type: "json" });
            if (actual && ahora - Number(actual.data?.desde || 0) < 60_000) return null;
            r = actual
              ? await store.setJSON(clave, { desde: ahora }, { onlyIfMatch: actual.etag })
              : await store.setJSON(clave, { desde: ahora }, { onlyIfNew: true });
            if (!r.modified) return null;
          }
          return () => store.delete(clave);
        },
      };
      const r = await enviarAlbaran({ holded, almacen, albaran });
      return json({ ok: true, ...r });
    }

    return json({ error: "Ruta no encontrada", reintentar: false }, 404);
  } catch (e) {
    return fallo(e);
  }
};

export const config = {
  path: ["/api/holded/estado", "/api/holded/clientes", "/api/holded/enviar"],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
