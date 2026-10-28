/* Albaranes · almacenamiento en el móvil (IndexedDB).
   Todo se guarda en el propio teléfono, así que la app funciona sin cobertura.
   Almacenes:
     albaranes  · cada albarán (borrador, pendiente de enviar, enviado…)
     clientes   · clientes usados, para autocompletar sin conexión
     kv         · ajustes y contador de numeración
*/

const NOMBRE = "albaranes-obra";
let conexion;

function abrir() {
  if (conexion) return conexion;
  conexion = new Promise((ok, ko) => {
    const r = indexedDB.open(NOMBRE, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      db.createObjectStore("albaranes", { keyPath: "id" });
      db.createObjectStore("clientes", { keyPath: "id" });
      db.createObjectStore("kv", { keyPath: "k" });
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => { conexion = null; ko(r.error); };
  });
  return conexion;
}

async function tx(store, modo, fn) {
  const db = await abrir();
  return new Promise((ok, ko) => {
    const t = db.transaction(store, modo);
    let resultado;
    const req = fn(t.objectStore(store));
    if (req) req.onsuccess = () => { resultado = req.result; };
    t.oncomplete = () => ok(resultado);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  });
}

export const todos = (store) => tx(store, "readonly", (s) => s.getAll());
export const obtener = (store, id) => tx(store, "readonly", (s) => s.get(id));
export const guardar = (store, obj) => tx(store, "readwrite", (s) => s.put(obj));
export const borrar = (store, id) => tx(store, "readwrite", (s) => s.delete(id));

export async function leerKV(k, porDefecto = null) {
  const r = await obtener("kv", k);
  return r ? r.v : porDefecto;
}
export const escribirKV = (k, v) => guardar("kv", { k, v });

/**
 * Reserva el siguiente número de albarán en una sola transacción
 * (dos albaranes nunca reciben el mismo número). Se reinicia cada año.
 */
export async function siguienteNumero(prefijo, anio) {
  const db = await abrir();
  return new Promise((ok, ko) => {
    const t = db.transaction("kv", "readwrite");
    const s = t.objectStore("kv");
    let numero;
    const r = s.get("contador");
    r.onsuccess = () => {
      const c = r.result?.v;
      const n = c && c.anio === anio ? c.n : 1;
      numero = `${prefijo}-${anio}-${String(n).padStart(4, "0")}`;
      s.put({ k: "contador", v: { anio, n: n + 1 } });
    };
    t.oncomplete = () => ok(numero);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  });
}

/** Pide al navegador que no borre los datos aunque falte espacio. */
export async function pedirPersistencia() {
  try { return await navigator.storage?.persist?.(); } catch { return false; }
}
