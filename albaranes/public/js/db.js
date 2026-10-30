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

/** Suma los movimientos de un mismo artículo: dos líneas del mismo grifo son una sola resta. */
function agrupar(movimientos) {
  const porId = new Map();
  for (const m of movimientos) {
    if (!m.articuloId || !m.cantidad) continue;
    porId.set(m.articuloId, (porId.get(m.articuloId) || 0) + Number(m.cantidad));
  }
  return porId;
}

const r4 = (n) => Math.round(n * 10000) / 10000;

// Cada artículo se lee y se escribe una sola vez dentro de la transacción, así no se pisan.
function aplicarMovimientos(store, movimientos, ahora) {
  for (const [id, delta] of agrupar(movimientos)) {
    const r = store.get(id);
    r.onsuccess = () => {
      if (r.result) store.put({ ...r.result, stock: r4((Number(r.result.stock) || 0) + delta), actualizado: ahora });
    };
  }
}

function transaccion(stores, fn) {
  return conReintento((db) => new Promise((ok, ko) => {
    const t = db.transaction(stores, "readwrite");
    const resultado = { hecho: false };
    fn(t, resultado);
    t.oncomplete = () => ok(resultado.hecho);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  }));
}

/** Suma (o resta) unidades al stock de varios artículos en una sola transacción. */
export function moverStock(movimientos) {
  return transaccion(["articulos"], (t, res) => {
    aplicarMovimientos(t.objectStore("articulos"), movimientos, new Date().toISOString());
    res.hecho = true;
  });
}

/**
 * Guarda el albarán y mueve el stock a la vez (o nada). Con `siEstado`, solo si el
 * albarán guardado sigue en ese estado: así no se firma ni se descuenta dos veces.
 */
export function guardarAlbaranYStock(alb, movimientos, siEstado, { sinVolcar = false } = {}) {
  return transaccion(["albaranes", "articulos"], (t, res) => {
    const albaranes = t.objectStore("albaranes");
    const r = albaranes.get(alb.id);
    r.onsuccess = () => {
      if (siEstado && r.result && r.result.estado !== siEstado) return;
      // Reabrir un albarán ya volcado al programa de facturación dejaría allí los datos viejos.
      if (sinVolcar && r.result?.volcadoEn) return;
      albaranes.put(alb);
      aplicarMovimientos(t.objectStore("articulos"), movimientos, new Date().toISOString());
      res.hecho = true;
    };
  });
}

/** Guarda una compra en revisión solo si sigue existiendo y «revisar» (no la resucita ni la desregistra). */
export function guardarCompraEnRevision(compra) {
  return transaccion(["compras"], (t, res) => {
    const s = t.objectStore("compras");
    const r = s.get(compra.id);
    r.onsuccess = () => {
      if (!r.result || r.result.estado !== "revisar") return;
      s.put(compra);
      res.hecho = true;
    };
  });
}

/** Borra una compra; si estaba registrada, resta sus unidades del stock en la misma transacción. */
export function borrarCompra(id) {
  return transaccion(["compras", "articulos"], (t, res) => {
    const s = t.objectStore("compras");
    const r = s.get(id);
    r.onsuccess = () => {
      const c = r.result;
      if (!c) return;
      if (c.estado === "registrada") {
        aplicarMovimientos(t.objectStore("articulos"),
          c.lineas.filter((l) => l.alStock !== false).map((l) => ({ articuloId: l.articuloId, cantidad: -Number(l.cantidad) })),
          new Date().toISOString());
      }
      s.delete(id);
      res.hecho = true;
    };
  });
}

/**
 * Registra una compra en el catálogo en una sola transacción: crea los artículos
 * nuevos, actualiza coste y stock de los existentes y marca la compra como
 * registrada. Si la compra ya no está «revisar» (registrada en otra ventana), no hace nada.
 */
export function registrarCompra(compra, nuevos, cambios) {
  return transaccion(["compras", "articulos"], (t, res) => {
    const compras = t.objectStore("compras");
    const articulos = t.objectStore("articulos");
    const r = compras.get(compra.id);
    r.onsuccess = () => {
      if (!r.result || r.result.estado !== "revisar") return;
      const ahora = new Date().toISOString();
      for (const a of nuevos) articulos.put({ ...a, actualizado: ahora });
      for (const [id, c] of cambios) {
        const g = articulos.get(id);
        g.onsuccess = () => {
          if (!g.result) return;
          articulos.put({
            ...g.result,
            // El coste es el de la última compra: es lo que costará reponerlo.
            coste: c.coste || g.result.coste,
            ref: g.result.ref || c.ref || "",
            proveedor: c.proveedor || g.result.proveedor || "",
            stock: r4((Number(g.result.stock) || 0) + c.cantidad),
            actualizado: ahora,
          });
        };
      }
      compras.put(compra);
      res.hecho = true;
    };
  });
}
