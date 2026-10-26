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
    if (typeof ev.t !== "string" || !ID.test(ev.t)) return null;
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
  return { entradas: { app: 0, inicio: 0, instalada: 0, dispositivos: 0, nuevos: 0 }, herramientas: {} };
}

function herramienta(res, id) {
  return (res.herramientas[id] ||= { abrir: 0, registros: 0, tiempo: { "0-1": 0, "1-3": 0, "3-10": 0, "10+": 0 } });
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
  if (!ID.test(sujeto)) return false;
  const h = herramienta(res, sujeto);
  if (e === "abrir") h.abrir += 1;
  else if (e === "registro") h.registros += Math.min(Number(detalle) || 0, 20);
  else if (e === "tiempo" && TRAMOS.includes(detalle)) h.tiempo[detalle] += 1;
  else return false;
  return true;
}

/** Agrupa claves de eventos por día. */
export function resumirClaves(claves) {
  const dias = {};
  for (const c of claves) {
    const dia = c.split("/")[1];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia || "")) continue;
    sumarClave((dias[dia] ||= diaVacio()), c);
  }
  return dias;
}

/** Suma el resumen b sobre a (para días compactados en varias tandas). */
export function fusionar(a, b) {
  const r = structuredClone(a || diaVacio());
  if (!b) return r;
  for (const k of Object.keys(r.entradas)) r.entradas[k] += b.entradas?.[k] || 0;
  for (const [id, h] of Object.entries(b.herramientas || {})) {
    const t = herramienta(r, id);
    t.abrir += h.abrir || 0;
    t.registros += h.registros || 0;
    for (const tr of TRAMOS) t.tiempo[tr] += h.tiempo?.[tr] || 0;
  }
  return r;
}
