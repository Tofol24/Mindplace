/* APRENS · contador anónimo de uso (lógica compartida por las funciones).
   ---------------------------------------------------------------------------
   Qué se guarda: solo recuentos. Cada evento es una clave vacía en Netlify
   Blobs cuyo nombre lleva toda la información:
       ev/<día>/<tipo>/<herramienta u origen>/<detalle>/<aleatorio>
   No se guarda IP, navegador, código de paciente ni nada que identifique a
   la persona. Las claves de días pasados se resumen en dia/<día> y se borran.

   Tipos de evento:
     entrada   · se abre la app o Mi espacio   (origen: app | inicio)
                 detalle = 3 cifras: instalada como app (1/0), primera entrada
                 del día en ese dispositivo (1/0), primera vez (1/0)
     abrir     · se abre una herramienta        (detalle: -)
     registro  · se guardan registros nuevos    (detalle: cuántos, 1–20)
     tiempo    · rato con la herramienta        (detalle: tramo de minutos)
*/

export const TIPOS = ["entrada", "abrir", "registro", "tiempo"];
export const ORIGENES = ["app", "inicio"];
export const TRAMOS = ["0-1", "1-3", "3-10", "10+"];
const ID = /^[a-z0-9_]{1,40}$/;
const RESERVADOS = new Set(["__proto__", "constructor", "prototype", "hasownproperty", "tostring", "valueof"]);
/** Id de herramienta aceptable: letras, cifras y _, sin nombres internos de JavaScript. */
export function idValido(t) { return typeof t === "string" && ID.test(t) && !RESERVADOS.has(t.toLowerCase()); }

/** Día natural en Mallorca (YYYY-MM-DD). */
export function diaMadrid(fecha = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(fecha);
}

function aleatorio() {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Valida un evento recibido y devuelve su clave, o null si no es válido. */
export function claveEvento(ev, fecha = new Date()) {
  if (!ev || typeof ev !== "object") return null;
  const e = ev.e;
  if (!TIPOS.includes(e)) return null;
  let sujeto, detalle;
  if (e === "entrada") {
    if (!ORIGENES.includes(ev.o)) return null;
    sujeto = ev.o;
    detalle = [ev.p, ev.d, ev.nv].map((x) => (x === 1 || x === true ? "1" : "0")).join("");
  } else {
    if (!idValido(ev.t)) return null;
    sujeto = ev.t;
    if (e === "abrir") detalle = "-";
    if (e === "registro") {
      const n = Number(ev.n);
      if (!Number.isInteger(n) || n < 1) return null;
      detalle = String(Math.min(n, 20));
    }
    if (e === "tiempo") {
      if (!TRAMOS.includes(ev.b)) return null;
      detalle = ev.b;
    }
  }
  return ["ev", diaMadrid(fecha), e, sujeto, detalle, aleatorio()].join("/");
}

/** Resumen vacío de un día. */
export function diaVacio() {
  return { entradas: { app: 0, inicio: 0, instalada: 0, dispositivos: 0, nuevos: 0 }, herramientas: Object.create(null) };
}

function herramienta(res, id) {
  if (!Object.hasOwn(res.herramientas, id)) res.herramientas[id] = { abrir: 0, registros: 0, tiempo: { "0-1": 0, "1-3": 0, "3-10": 0, "10+": 0 } };
  return res.herramientas[id];
}

/** Suma una clave de evento a un resumen de día. Devuelve false si no la entiende. */
export function sumarClave(res, clave) {
  const p = clave.split("/");
  if (p.length !== 6 || p[0] !== "ev") return false;
  const [, , e, sujeto, detalle] = p;
  if (e === "entrada") {
    if (!ORIGENES.includes(sujeto)) return false;
    res.entradas[sujeto] += 1;
    if (detalle[0] === "1") res.entradas.instalada += 1;
    if (detalle[1] === "1") res.entradas.dispositivos += 1;
    if (detalle[2] === "1") res.entradas.nuevos += 1;
    return true;
  }
  if (!idValido(sujeto)) return false;
  const h = herramienta(res, sujeto);
  if (e === "abrir") h.abrir += 1;
  else if (e === "registro") h.registros += Math.min(Number(detalle) || 0, 20);
  else if (e === "tiempo" && TRAMOS.includes(detalle)) h.tiempo[detalle] += 1;
  else return false;
  return true;
}

/** Día de una clave de evento, o null. */
export function diaDe(clave) {
  const d = String(clave).split("/")[1];
  return /^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d : null;
}

/** Resumen de un conjunto de claves (se espera que sean todas del mismo día). */
export function resumir(claves) {
  const res = diaVacio();
  for (const c of claves) sumarClave(res, c);
  return res;
}

/* ---------- Consolidación (compartida por /api/uso-resumen y la tarea diaria) ----------
   Un día se cierra cuando es anterior a AYER (margen de un día para eventos
   que llegan justo a medianoche). Al cerrarlo se escribe dia/<día> «solo si no
   existe» y se borran sus eventos sueltos; si ya existía, los restos se borran
   sin volver a contarse (los eventos se fechan al llegar: un día cerrado no
   recibe eventos nuevos). */

/** Resta días de calendario a una fecha AAAA-MM-DD (sin depender del cambio de hora). */
export function restarDias(dia, n) {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d - n)).toISOString().slice(0, 10);
}

/** Primer día que sigue «abierto» (ayer, en Mallorca). */
export function primerDiaAbierto(fecha = new Date()) {
  return restarDias(diaMadrid(fecha), 1);
}

async function enTandas(lista, n, fn) {
  for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(fn));
}

/**
 * Cierra los días anteriores a `abierto` que tengan eventos sueltos.
 * `sueltos` = { día: [claves] }. `resumidos` = Set de días con dia/<día>.
 * Devuelve { día: resumen } de los días que acaba de cerrar esta llamada.
 */
export async function cerrarDias(store, sueltos, resumidos, abierto) {
  const nuevos = {};
  const dias = Object.keys(sueltos).filter((d) => d < abierto);
  await enTandas(dias, 5, async (d) => {
    if (!resumidos.has(d)) {
      const resumen = resumir(sueltos[d]);
      const r = await store.setJSON("dia/" + d, resumen, { onlyIfNew: true });
      if (r && r.modified) nuevos[d] = resumen;
    }
    // Antes de borrar los eventos se comprueba que el resumen está guardado de
    // verdad (lectura con consistencia fuerte). Si no, se dejan para otra vez.
    const guardado = await store.get("dia/" + d, { type: "json", consistency: "strong" });
    if (!guardado) { delete nuevos[d]; return; }
    resumidos.add(d);
    await enTandas(sueltos[d], 50, (k) => store.delete(k));
  });
  return nuevos;
}

/** Lista eventos sueltos y días resumidos bajo un prefijo de fecha ("" = todos). */
export async function listar(store, prefijoFecha = "") {
  const [ev, dia] = await Promise.all([store.list({ prefix: "ev/" + prefijoFecha }), store.list({ prefix: "dia/" + prefijoFecha })]);
  const sueltos = {}, resumidos = new Set();
  for (const { key } of ev.blobs) { const d = diaDe(key); if (d) (sueltos[d] ||= []).push(key); }
  for (const { key } of dia.blobs) resumidos.add(key.slice(4));
  return { sueltos, resumidos };
}
