// /api/ia/* · lectura con IA (ver lib/ia.mjs).
//   POST /api/ia/dictado   { texto, catalogo, perfil, servicios } → datos para rellenar el albarán
//   POST /api/ia/compra    { imagen, tipoImagen }     → datos del albarán o factura del proveedor
//
// La clave de Anthropic vive en la variable ANTHROPIC_API_KEY de Netlify.
// El móvil se identifica con la clave de la app (APP_CLAVE), igual que con Holded.
import Anthropic from "@anthropic-ai/sdk";
import { claveCorrecta, json } from "../lib/http.mjs";
import { ErrorIA, MAX_IMAGEN_BASE64, interpretarDictado, leerCompra } from "../lib/ia.mjs";

export default async (req) => {
  if (!claveCorrecta(req)) return json({ error: "La clave de la app no es correcta", reintentar: false }, 401);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "Falta configurar ANTHROPIC_API_KEY en Netlify", reintentar: false }, 500);
  if (req.method !== "POST") return json({ error: "Método no permitido", reintentar: false }, 405);
  const ruta = new URL(req.url).pathname.replace(/\/+$/, "");

  const cuerpo = await req.text();
  if (cuerpo.length > MAX_IMAGEN_BASE64 + 100_000) return json({ error: "La foto es demasiado grande", reintentar: false }, 413);
  let datos;
  try { datos = JSON.parse(cuerpo); } catch { return json({ error: "Datos no válidos", reintentar: false }, 400); }

  // Sin reintentos automáticos: el móvil ya reintenta, y la función tiene poco tiempo.
  const anthropic = new Anthropic({ maxRetries: 0, timeout: 25_000 });
  try {
    if (ruta === "/api/ia/dictado") {
      return json({ ok: true, albaran: await interpretarDictado({ anthropic, texto: datos.texto, catalogo: datos.catalogo, perfil: datos.perfil, servicios: datos.servicios }) });
    }
    if (ruta === "/api/ia/compra") {
      return json({ ok: true, compra: await leerCompra({ anthropic, imagen: datos.imagen, tipoImagen: datos.tipoImagen }) });
    }
    return json({ error: "Ruta no encontrada", reintentar: false }, 404);
  } catch (e) {
    if (e instanceof ErrorIA) return json({ error: e.message, reintentar: e.reintentar }, e.status || 500);
    console.error(e);
    return json({ error: "Error inesperado en el servidor", reintentar: true }, 500);
  }
};

export const config = {
  path: ["/api/ia/dictado", "/api/ia/compra"],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
