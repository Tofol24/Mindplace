// /api/holded/* · puente entre el móvil y Holded (ver lib/holded.mjs).
//   GET  /api/holded/estado         comprueba la clave de la app y la de Holded
//   GET  /api/holded/clientes?q=    busca clientes en Holded para autocompletar
//   POST /api/holded/enviar         crea el albarán (y el cliente si hace falta)
//
// La clave de Holded nunca llega al móvil: vive en la variable HOLDED_API_KEY
// de Netlify. El móvil se identifica con la clave de la app (APP_CLAVE).
import { createHash, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";
import {
  ErrorHolded, MAX_PDF_BASE64, contactoParaMovil, crearClienteHolded, enviarAlbaran, validarAlbaran,
} from "../lib/holded.mjs";

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

const huella = (s) => createHash("sha256").update(String(s)).digest();
function claveCorrecta(recibida, esperada) {
  return !!recibida && !!esperada && timingSafeEqual(huella(recibida), huella(esperada));
}

function fallo(e) {
  if (e instanceof ErrorHolded) {
    const status = e.status === 400 ? 400 : e.reintentar ? 503 : 502;
    return json({ error: e.message, reintentar: e.reintentar }, status);
  }
  console.error(e);
  return json({ error: "Error inesperado en el servidor", reintentar: true }, 500);
}

export default async (req) => {
  const ruta = new URL(req.url).pathname.replace(/\/+$/, "");
  const apiKey = process.env.HOLDED_API_KEY;
  const claveApp = process.env.APP_CLAVE;
  if (!apiKey || !claveApp) {
    return json({ error: "Falta configurar HOLDED_API_KEY y APP_CLAVE en Netlify", reintentar: false }, 500);
  }
  if (!claveCorrecta(req.headers.get("x-clave-app"), claveApp)) {
    return json({ error: "La clave de la app no es correcta", reintentar: false }, 401);
  }
  const holded = crearClienteHolded({ apiKey });

  try {
    if (ruta === "/api/holded/estado" && req.method === "GET") {
      await holded.buscarContactos("a", 1);
      return json({ ok: true });
    }

    if (ruta === "/api/holded/clientes" && req.method === "GET") {
      const q = (new URL(req.url).searchParams.get("q") || "").trim();
      if (q.length < 2) return json({ clientes: [] });
      const items = await holded.buscarContactos(q.slice(0, 80), 10);
      return json({ clientes: items.map(contactoParaMovil) });
    }

    if (ruta === "/api/holded/enviar" && req.method === "POST") {
      const cuerpo = await req.text();
      if (cuerpo.length > MAX_PDF_BASE64 + 200_000) return json({ error: "El albarán es demasiado grande", reintentar: false }, 413);
      let datos;
      try { datos = JSON.parse(cuerpo); } catch { return json({ error: "Datos no válidos", reintentar: false }, 400); }
      const albaran = validarAlbaran(datos);
      const store = getStore("albaranes-holded");
      const almacen = {
        leer: (id) => store.get(`alb/${id}`, { type: "json" }),
        guardar: (id, estado) => store.setJSON(`alb/${id}`, estado),
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
