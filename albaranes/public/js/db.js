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
    r.onsuccess = () => {
      const db = r.result;
      // iOS puede cerrar la base de datos con la app en segundo plano: se reabre en la próxima operación.
      db.onclose = () => { conexion = null; };
      db.onversionchange = () => { db.close(); conexion = null; };
      ok(db);
    };
    r.onerror = () => { conexion = null; ko(r.error); };
  });
  return conexion;
}

/** Ejecuta una operación; si la conexión estaba cerrada, la reabre y lo intenta una vez más. */
async function conReintento(fn) {
  try {
    return await fn(await abrir());
  } catch (e) {
    if (e?.name !== "InvalidStateError" && e?.name !== "UnknownError") throw e;
    conexion = null;
    return fn(await abrir());
  }
}

function tx(store, modo, fn) {
  return conReintento((db) => new Promise((ok, ko) => {
    const t = db.transaction(store, modo);
    let resultado;
    const req = fn(t.objectStore(store));
    if (req) req.onsuccess = () => { resultado = req.result; };
    t.oncomplete = () => ok(resultado);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  }));
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

/** Próximo número del año (cada año tiene su propio contador). */
export async function proximoDelAnio(anio) {
  return (await leerKV(`contador-${anio}`, 1)) || 1;
}
export const fijarProximoDelAnio = (anio, n) => escribirKV(`contador-${anio}`, n);

/**
 * Reserva el siguiente número de albarán en una sola transacción
 * (dos albaranes nunca reciben el mismo número). Cada año lleva su contador,
 * así que un albarán con fecha del año pasado no reinicia el del año actual.
 */
export function siguienteNumero(prefijo, anio) {
  return conReintento((db) => new Promise((ok, ko) => {
    const t = db.transaction("kv", "readwrite");
    const s = t.objectStore("kv");
    const clave = `contador-${anio}`;
    let numero;
    const r = s.get(clave);
    r.onsuccess = () => {
      const n = r.result?.v || 1;
      numero = `${prefijo}-${anio}-${String(n).padStart(4, "0")}`;
      s.put({ k: clave, v: n + 1 });
    };
    t.oncomplete = () => ok(numero);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  }));
}

/** Pide al navegador que no borre los datos aunque falte espacio. */
export async function pedirPersistencia() {
  try { return await navigator.storage?.persist?.(); } catch { return false; }
}
