/* Albaranes · conexión con Holded (lógica compartida por la función).
   ---------------------------------------------------------------------------
   Usa la API v2 de Holded (https://www.holded.com/developers):
     GET  /api/v2/contacts/search?name=   busca el cliente por nombre
     POST /api/v2/contacts                crea el cliente si no existe
     GET  /api/v2/waybills                comprueba si el albarán ya llegó
     POST /api/v2/waybills                crea el albarán
     POST /api/v2/waybills/{id}/attachments  adjunta el PDF firmado

   El envío es idempotente: cada albarán lleva un id local y el progreso
   (cliente, albarán creado, PDF adjunto) se guarda en un almacén. Si el móvil
   pierde la señal a medias, el reintento continúa donde se quedó y no crea
   albaranes duplicados en Holded.
*/

export const BASE = "https://api.holded.com/api/v2";

/** IVA permitido en la app → clave de impuesto de Holded. */
export const IMPUESTOS = { 21: "s_iva_21", 10: "s_iva_10" };

export class ErrorHolded extends Error {
  /** reintentar: true si es un fallo pasajero (red, 429, 5xx) y vale la pena volver a probar. */
  /** yaEnHolded: el albarán ya existe en Holded; corregirlo desde la app no tiene sentido. */
  constructor(mensaje, { status = 0, reintentar = false, yaEnHolded = false } = {}) {
    super(mensaje);
    this.status = status;
    this.reintentar = reintentar;
    this.yaEnHolded = yaEnHolded;
  }
}

const MENSAJES = {
  400: "Holded ha rechazado los datos del albarán",
  401: "La clave de la API de Holded no es válida",
  403: "La clave de Holded no tiene permiso (revisa los permisos de la clave: contactos y albaranes)",
  404: "Holded no encuentra el recurso",
  422: "Holded no acepta algún dato del albarán",
  429: "Holded está limitando las peticiones; se reintentará más tarde",
};

/** Cliente mínimo de la API de Holded. `fetch` se inyecta para poder probarlo. */
// Netlify corta la función a los 10 s; el progreso guardado permite seguir en el reintento.
export function crearClienteHolded({ apiKey, fetch = globalThis.fetch, timeoutMs = 8000 }) {
  async function llamar(metodo, ruta, { json, form, query } = {}) {
    const url = new URL(BASE + ruta);
    for (const [k, v] of Object.entries(query || {})) if (v != null && v !== "") url.searchParams.set(k, String(v));
    const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
    let body;
    if (json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
    if (form) body = form;
    let res;
    try {
      res = await fetch(url, { method: metodo, headers, body, signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new ErrorHolded("No se ha podido conectar con Holded", { reintentar: true });
    }
    const texto = await res.text();
    let datos = null;
    try { datos = texto ? JSON.parse(texto) : null; } catch { /* respuesta no JSON */ }
    if (!res.ok) {
      const base = MENSAJES[res.status] || `Holded ha respondido con un error (${res.status})`;
      const detalle = datos && typeof datos.detail === "string" ? `: ${datos.detail.slice(0, 300)}` : "";
      throw new ErrorHolded(base + detalle, { status: res.status, reintentar: res.status === 429 || res.status >= 500 });
    }
    return datos;
  }

  return {
    async buscarContactos(nombre, limit = 25) {
      const r = await llamar("GET", "/contacts/search", { query: { name: nombre.slice(0, 80), limit } });
      return Array.isArray(r?.items) ? r.items : [];
    },
    async crearContacto(c) {
      const r = await llamar("POST", "/contacts", { json: c });
      if (!r?.id) throw new ErrorHolded("Holded no ha devuelto el id del cliente creado", { reintentar: true });
      return r.id;
    },
    async listarAlbaranes(query) {
      const r = await llamar("GET", "/waybills", { query });
      return Array.isArray(r?.items) ? r.items : [];
    },
    async crearAlbaran(a) {
      const r = await llamar("POST", "/waybills", { json: a });
      if (!r?.id) throw new ErrorHolded("Holded no ha devuelto el id del albarán creado", { reintentar: true });
      return r.id;
    },
    async adjuntar(albaranId, bytes, nombreFichero) {
      const form = new FormData();
      form.append("file", new Blob([bytes], { type: "application/pdf" }), nombreFichero);
      return llamar("POST", `/waybills/${encodeURIComponent(albaranId)}/attachments`, { form });
    },
  };
}

// ---------------------------------------------------------------------------
// Validación de lo que llega del móvil
// ---------------------------------------------------------------------------

const ID = /^[A-Za-z0-9-]{8,64}$/;
const NUMERO = /^[A-Za-z0-9-]{1,30}$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_PDF_BASE64 = 4_000_000; // ~3 MB de PDF (el cuerpo de la función tiene límite de 6 MB)

/** YYYY-MM-DD que existe de verdad (rechaza 2026-02-31). */
export function fechaValida(f) {
  if (typeof f !== "string" || !FECHA.test(f)) return false;
  const [a, m, d] = f.split("-").map(Number);
  const x = new Date(Date.UTC(a, m - 1, d));
  return x.getUTCFullYear() === a && x.getUTCMonth() === m - 1 && x.getUTCDate() === d;
}

function diaMas(f, n) {
  const [a, m, d] = f.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

function texto(v, max, campo, { obligatorio = false } = {}) {
  if (v == null || v === "") {
    if (obligatorio) throw new ErrorHolded(`Falta ${campo}`, { status: 400 });
    return "";
  }
  if (typeof v !== "string") throw new ErrorHolded(`${campo} no es válido`, { status: 400 });
  const t = v.trim();
  if (obligatorio && !t) throw new ErrorHolded(`Falta ${campo}`, { status: 400 });
  if (t.length > max) throw new ErrorHolded(`${campo} es demasiado largo`, { status: 400 });
  return t;
}

function numero(v, { min, max, campo }) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new ErrorHolded(`${campo} no es válido`, { status: 400 });
  return n;
}

/** Comprueba y normaliza el albarán recibido. Lanza ErrorHolded(400) si algo no cuadra. */
export function validarAlbaran(b) {
  if (!b || typeof b !== "object") throw new ErrorHolded("Albarán vacío", { status: 400 });
  if (typeof b.id !== "string" || !ID.test(b.id)) throw new ErrorHolded("Id de albarán no válido", { status: 400 });
  if (typeof b.numero !== "string" || !NUMERO.test(b.numero)) throw new ErrorHolded("Número de albarán no válido", { status: 400 });
  if (!fechaValida(b.fecha)) throw new ErrorHolded("Fecha no válida", { status: 400 });
  const c = b.cliente || {};
  const cliente = {
    holdedId: typeof c.holdedId === "string" && /^[a-f0-9]{24}$/i.test(c.holdedId) ? c.holdedId : "",
    nombre: texto(c.nombre, 200, "el nombre del cliente", { obligatorio: true }),
    nif: texto(c.nif, 30, "el NIF"),
    telefono: texto(c.telefono, 40, "el teléfono"),
    email: texto(c.email, 200, "el email"),
    direccion: texto(c.direccion, 300, "la dirección"),
    poblacion: texto(c.poblacion, 120, "la población"),
    cp: texto(c.cp, 12, "el código postal"),
  };
  if (cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) throw new ErrorHolded("El email del cliente no es válido", { status: 400 });
  if (!Array.isArray(b.lineas) || !b.lineas.length) throw new ErrorHolded("El albarán no tiene líneas", { status: 400 });
  if (b.lineas.length > 100) throw new ErrorHolded("Demasiadas líneas", { status: 400 });
  const lineas = b.lineas.map((l, i) => {
    const iva = numero(l?.iva, { min: 0, max: 100, campo: `El IVA de la línea ${i + 1}` });
    if (!IMPUESTOS[iva]) throw new ErrorHolded(`IVA no permitido en la línea ${i + 1}`, { status: 400 });
    return {
      concepto: texto(l?.concepto, 300, `el concepto de la línea ${i + 1}`, { obligatorio: true }),
      cantidad: numero(l?.cantidad, { min: 0.0001, max: 1e6, campo: `La cantidad de la línea ${i + 1}` }),
      precio: numero(l?.precio, { min: 0, max: 1e7, campo: `El precio de la línea ${i + 1}` }),
      iva,
    };
  });
  let pdf = null;
  if (b.pdf != null) {
    if (typeof b.pdf !== "string" || b.pdf.length > MAX_PDF_BASE64 || !/^[A-Za-z0-9+/]+=*$/.test(b.pdf)) {
      throw new ErrorHolded("El PDF no es válido o es demasiado grande", { status: 400 });
    }
    pdf = b.pdf;
  }
  return {
    id: b.id,
    numero: b.numero,
    fecha: b.fecha,
    cliente,
    direccionObra: texto(b.direccionObra, 300, "la dirección de la obra"),
    trabajo: texto(b.trabajo, 4000, "la descripción del trabajo"),
    observaciones: texto(b.observaciones, 2000, "las observaciones"),
    firmante: texto(b.firmante, 120, "el nombre de quien firma"),
    lineas,
    pdf,
  };
}

// ---------------------------------------------------------------------------
// Envío
// ---------------------------------------------------------------------------

export function normalizarNombre(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
export function normalizarNif(s) {
  return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizarTelefono(s) {
  return String(s || "").replace(/\D/g, "").slice(-9);
}

/** Algún dato de contacto (email o teléfono) coincide: no basta con el nombre. */
function corroborado(c, cliente) {
  const email = String(cliente.email || "").trim().toLowerCase();
  const tel = normalizarTelefono(cliente.telefono);
  return (!!email && String(c.email || "").trim().toLowerCase() === email)
    || (tel.length === 9 && [c.mobile, c.phone].some((t) => normalizarTelefono(t) === tel));
}

/**
 * Elige, entre los contactos de Holded, el que corresponde al cliente (o null → se crea uno nuevo).
 * Dos personas pueden llamarse igual: el nombre solo no basta. Vale el NIF, o un único contacto
 * con el mismo nombre, sin otro NIF, y con el mismo email o teléfono. Ante la duda, contacto nuevo
 * (un duplicado se fusiona en Holded; un albarán en la ficha de otra persona expone sus datos).
 */
export function elegirContacto(candidatos, cliente) {
  const nombre = normalizarNombre(cliente.nombre);
  const nif = normalizarNif(cliente.nif);
  if (nif) {
    const porNif = candidatos.filter((c) => normalizarNif(c.code) === nif);
    if (porNif.length === 1) return porNif[0];
    if (porNif.length > 1) return null;
  }
  const mismos = candidatos.filter((c) => normalizarNombre(c.name) === nombre && !normalizarNif(c.code));
  const conDatos = mismos.filter((c) => corroborado(c, cliente));
  return conDatos.length === 1 ? conDatos[0] : null;
}

export function contactoParaHolded(cliente) {
  // Un CIF de empresa empieza por estas letras; DNI y NIE (o sin NIF) son personas.
  const c = { name: cliente.nombre, type: "client", is_person: !/^[ABCDEFGHJNPQRSUVW]\d/.test(normalizarNif(cliente.nif)) };
  if (cliente.nif) c.code = normalizarNif(cliente.nif);
  if (cliente.email) c.email = cliente.email;
  if (cliente.telefono) c.mobile = cliente.telefono;
  if (cliente.direccion || cliente.poblacion || cliente.cp) {
    c.bill_address = { address: cliente.direccion || null, city: cliente.poblacion || null, postal_code: cliente.cp || null, country_code: "ES" };
  }
  return c;
}

export function albaranParaHolded(a, contactId) {
  const partes = [];
  if (a.trabajo) partes.push(a.trabajo);
  if (a.direccionObra) partes.push(`Dirección de la obra: ${a.direccionObra}`);
  if (a.observaciones) partes.push(`Observaciones: ${a.observaciones}`);
  return {
    contact_id: contactId,
    contact_name: a.cliente.nombre,
    date: a.fecha,
    number: a.numero,
    description: partes.join("\n\n") || null,
    notes: `Creado desde la app de albaranes (ref. ${a.id})${a.firmante ? ` · Firmado por ${a.firmante}` : ""}`,
    currency: "EUR",
    language: "es",
    is_valued: true,
    tags: ["app-albaranes"],
    items: a.lineas.map((l) => ({ name: l.concepto, units: l.cantidad, price: l.precio, taxes: [IMPUESTOS[l.iva]] })),
  };
}

/** Lo que define el albarán en Holded (sin PDF ni firma): si cambia tras crearlo, ya no cuadra. */
export function huellaAlbaran(a) {
  const c = a.cliente;
  return JSON.stringify([
    a.numero, a.fecha, a.direccionObra, a.trabajo, a.observaciones,
    normalizarNombre(c.nombre), normalizarNif(c.nif), c.holdedId,
    a.lineas.map((l) => [l.concepto, l.cantidad, l.precio, l.iva]),
  ]);
}

/**
 * Envía un albarán validado a Holded.
 * `almacen` guarda el progreso: { leer(id) → estado|null, guardar(id, estado) } y, opcionalmente,
 * bloquear(id) → función para soltar | null si otro envío del mismo albarán está en marcha.
 * Devuelve { contactId, albaranId, adjunto }.
 */
export async function enviarAlbaran({ holded, almacen, albaran: a }) {
  // Dos envíos a la vez (dos móviles, pestañas o un reintento) leerían el mismo estado
  // y crearían dos albaranes: solo uno puede trabajar con cada id.
  const soltar = almacen.bloquear ? await almacen.bloquear(a.id) : null;
  if (almacen.bloquear && !soltar) {
    throw new ErrorHolded("Este albarán se está enviando ahora mismo; se reintentará", { status: 409, reintentar: true });
  }
  try {
    return await enviarSinBloqueo({ holded, almacen, albaran: a });
  } finally {
    if (soltar) await soltar().catch(() => {});
  }
}

async function enviarSinBloqueo({ holded, almacen, albaran: a }) {
  const estado = (await almacen.leer(a.id)) || {};
  const guardar = () => almacen.guardar(a.id, estado);
  const huella = huellaAlbaran(a);

  // Ya creado en Holded: no se puede cambiar desde aquí. Adjuntar un PDF corregido al
  // documento antiguo dejaría en Holded un albarán que no coincide con lo firmado.
  // También si un intento anterior se cortó al crearlo: puede existir con los datos de entonces.
  if ((estado.albaranId || estado.creando) && estado.huella && estado.huella !== huella) {
    throw new ErrorHolded(
      "Este albarán ya está creado en Holded con los datos anteriores y no se puede cambiar desde la app. "
      + "Corrígelo directamente en Holded o haz uno nuevo.",
      { status: 422, yaEnHolded: !!estado.albaranId },
    );
  }

  // Si el albarán se corrigió con otro cliente antes de llegar a crearse, se vuelve a buscar.
  // Email y teléfono también cuentan: sin NIF, son lo que distingue a dos clientes con el mismo nombre.
  const quien = [normalizarNombre(a.cliente.nombre), normalizarNif(a.cliente.nif), a.cliente.holdedId,
    String(a.cliente.email || "").trim().toLowerCase(), String(a.cliente.telefono || "").replace(/\D/g, "")].join("|");
  if (estado.contactId && !estado.albaranId && estado.quien !== quien) delete estado.contactId;

  if (!estado.contactId) {
    if (a.cliente.holdedId) {
      estado.contactId = a.cliente.holdedId;
    } else {
      const candidatos = await holded.buscarContactos(a.cliente.nombre, 100);
      const encontrado = elegirContacto(candidatos, a.cliente);
      estado.contactId = encontrado ? encontrado.id : await holded.crearContacto(contactoParaHolded(a.cliente));
    }
    estado.quien = quien;
    await guardar();
  }

  if (!estado.albaranId) {
    if (estado.creando) {
      // Un intento anterior se cortó justo al crear: puede que Holded sí lo creara.
      // ±1 día por si Holded guarda la fecha en UTC (medianoche en Madrid es el día anterior en UTC).
      const cercanos = await holded.listarAlbaranes({ contact_id: estado.contactId, start_date: diaMas(a.fecha, -1), end_date: diaMas(a.fecha, 1), limit: 200 });
      const ya = cercanos.find((w) => (w.document_number || w.number) === a.numero);
      if (ya) estado.albaranId = ya.id;
    }
    if (!estado.albaranId) {
      estado.creando = true;
      estado.huella = huella;
      await guardar();
      try {
        estado.albaranId = await holded.crearAlbaran(albaranParaHolded(a, estado.contactId));
      } catch (e) {
        // Rechazo claro (4xx): no se ha creado nada y el albarán se puede corregir.
        // Si no (red, 5xx), queda la duda y el reintento lo buscará antes de crear otro.
        if (e instanceof ErrorHolded && e.status >= 400 && e.status < 500 && !e.reintentar) {
          delete estado.creando;
          delete estado.huella;
          await guardar();
        }
        throw e;
      }
    }
    delete estado.creando;
    estado.huella = huella;
    await guardar();
  }

  if (!estado.adjunto && a.pdf) {
    const bytes = Buffer.from(a.pdf, "base64");
    try {
      await holded.adjuntar(estado.albaranId, bytes, `Albaran-${a.numero}-firmado.pdf`);
    } catch (e) {
      if (e instanceof ErrorHolded && !e.reintentar) {
        e.message = `El albarán ya está en Holded, pero no ha aceptado el PDF firmado (${e.message}). `
          + "Vuelve a intentarlo sin cambiar los datos, o adjunta el PDF a mano en Holded.";
        e.yaEnHolded = true;
      }
      throw e;
    }
    estado.adjunto = true;
    await guardar();
  }

  return { contactId: estado.contactId, albaranId: estado.albaranId, adjunto: !!estado.adjunto };
}

/** Contacto de Holded reducido a lo que necesita el móvil para autocompletar. */
export function contactoParaMovil(c) {
  const d = c.bill_address || {};
  return {
    holdedId: c.id,
    nombre: c.name || "",
    nif: c.code || "",
    telefono: c.mobile || c.phone || "",
    email: c.email || "",
    direccion: d.address || "",
    poblacion: d.city || "",
    cp: d.postal_code || "",
  };
}
