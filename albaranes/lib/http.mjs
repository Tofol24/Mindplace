/* Albaranes · utilidades comunes de las funciones de Netlify. */
import { createHash, timingSafeEqual } from "node:crypto";

export const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

const huella = (s) => createHash("sha256").update(String(s)).digest();

/** La clave que manda el móvil (cabecera x-clave-app) coincide con APP_CLAVE. */
export function claveCorrecta(req) {
  const recibida = req.headers.get("x-clave-app");
  const esperada = process.env.APP_CLAVE;
  return !!recibida && !!esperada && timingSafeEqual(huella(recibida), huella(esperada));
}
