/* Albaranes · almacenamiento en el móvil (IndexedDB).
   Todo se guarda en el propio teléfono, así que la app funciona sin cobertura.
   Almacenes:
     albaranes  · cada albarán (borrador, pendiente de enviar, enviado…)
     clientes   · clientes usados, para autocompletar sin conexión
     articulos  · catálogo: precio de coste, margen, precio de venta y stock
     compras    · albaranes y facturas de proveedor (con su foto, para el asesor)
     kv         · ajustes y contador de numeración
*/

const NOMBRE = "albaranes-obra";
let conexion;

function abrir() {
  if (conexion) return conexion;
  conexion = new Promise((ok, ko) => {
    const r = indexedDB.open(NOMBRE, 2);
    r.onupgradeneeded = (e) => {
      const db = r.result;
      if (e.oldVersion < 1) {
        db.createObjectStore("albaranes", { keyPath: "id" });
        db.createObjectStore("clientes", { keyPath: "id" });
        db.createObjectStore("kv", { keyPath: "k" });
      }
      if (e.oldVersion < 2) {
        // Versión 2: catálogo de artículos (coste, margen, stock) y compras a proveedores.
        db.createObjectStore("articulos", { keyPath: "id" });
        db.createObjectStore("compras", { keyPath: "id" });
      }
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

/**
 * Guarda un borrador solo si sigue siendo borrador. Una pantalla de edición abierta en
 * otra pestaña no puede pisar un albarán que ya se firmó. Devuelve false si no lo ha guardado.
 */
export function guardarBorrador(obj) {
  return conReintento((db) => new Promise((ok, ko) => {
    const t = db.transaction("albaranes", "readwrite");
    const s = t.objectStore("albaranes");
    let guardado = false;
    const r = s.get(obj.id);
    r.onsuccess = () => {
      if (!r.result || r.result.estado === "borrador") { s.put(obj); guardado = true; }
    };
    t.oncomplete = () => ok(guardado);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  }));
}

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

/** Suma (o resta) unidades al stock de varios artículos en una sola transacción. */
export function moverStock(movimientos) {
  const lista = movimientos.filter((m) => m.articuloId && m.cantidad);
  if (!lista.length) return Promise.resolve();
  return conReintento((db) => new Promise((ok, ko) => {
    const t = db.transaction("articulos", "readwrite");
    const s = t.objectStore("articulos");
    for (const m of lista) {
      const r = s.get(m.articuloId);
      r.onsuccess = () => {
        if (!r.result) return;
        const stock = Math.round(((Number(r.result.stock) || 0) + m.cantidad) * 10000) / 10000;
        s.put({ ...r.result, stock, actualizado: new Date().toISOString() });
      };
    }
    t.oncomplete = () => ok();
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  }));
}
