// Enlaces cortos de la Pizarra del entrenador.
// El navegador cifra el plan (AES-GCM) antes de subirlo; aquí solo llega un bloque
// ilegible. La clave para leerlo va en el #hash del enlace y nunca se envía al servidor.
// Cada bloque se borra a los 90 días (al leerlo caducado o en la limpieza diaria).
//
// Claves en el almacén «pizarra»:
//   d/<id>                 el bloque cifrado (metadatos: { exp })
//   exp/<AAAA-MM-DD>/<id>  índice por día de caducidad, para limpiar sin leer cada bloque
//   cuota/<AAAA-MM-DD>     subidas y bytes del día (tope global contra abusos)

export const CABECERAS = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export const DIAS = 90;
export const MAX_BYTES = 100_000;           // un partido completo cifrado ocupa ~1-3 kB
export const CUOTA_DIA = { n: 3000, bytes: 30_000_000 };
export const RE_ID = /^[A-Za-z0-9]{10}$/;
const RE_DATOS = /^[A-Za-z0-9_-]+$/;
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nuevoId() {
  // 62 * 4 = 248: se descartan los bytes ≥ 248 para no sesgar el alfabeto
  let s = "";
  while (s.length < 10) {
    for (const x of crypto.getRandomValues(new Uint8Array(16))) if (x < 248 && s.length < 10) s += ALFABETO[x % 62];
  }
  return s;
}

// Contenido válido: base64 «url-safe» (lo que genera la pizarra), con un tamaño razonable.
export function datosValidos(t) {
  return typeof t === "string" && t.length >= 24 && t.length <= MAX_BYTES && RE_DATOS.test(t);
}

export const dia = (ms) => new Date(ms).toISOString().slice(0, 10);
export const caducidad = (ahora = Date.now()) => ahora + DIAS * 86_400_000;
export const caducado = (meta, ahora = Date.now()) => !meta || typeof meta.exp !== "number" || meta.exp < ahora;
export const claveDato = (id) => "d/" + id;
export const claveIndice = (exp, id) => "exp/" + dia(exp) + "/" + id;
