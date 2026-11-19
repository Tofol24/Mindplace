// Enlaces cortos de la Pizarra del entrenador.
// El navegador cifra el plan (AES-GCM) antes de subirlo; aquí solo llega un bloque
// ilegible. La clave para leerlo va en el #hash del enlace y nunca se envía al servidor.
// Cada bloque se borra a los 90 días (al leerlo caducado o en la limpieza diaria).

export const DIAS = 90;
export const MAX_BYTES = 300_000;
export const RE_ID = /^[A-Za-z0-9]{10}$/;
const RE_DATOS = /^[A-Za-z0-9_-]+$/;
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nuevoId() {
  const b = crypto.getRandomValues(new Uint8Array(10));
  let s = "";
  for (const x of b) s += ALFABETO[x % ALFABETO.length];
  return s;
}

// Contenido válido: base64 «url-safe» (lo que genera la pizarra), con un tamaño razonable.
export function datosValidos(t) {
  return typeof t === "string" && t.length >= 24 && t.length <= MAX_BYTES && RE_DATOS.test(t);
}

export const caducidad = (ahora = Date.now()) => ahora + DIAS * 86_400_000;
export const caducado = (meta, ahora = Date.now()) => !meta || typeof meta.exp !== "number" || meta.exp < ahora;
