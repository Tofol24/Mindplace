/* Albaranes · lectura con IA (Claude) de dictados y de fotos de albaranes de proveedor.
   ---------------------------------------------------------------------------
   Dos usos, los dos con salida estructurada (JSON con esquema fijo):
     interpretarDictado  · «Cliente Jesús Arribas, cambio de grifo, un monomando…»
                           → cliente, trabajo y líneas, enlazadas al catálogo de Pere.
                           Con el perfil «servicios» (consulta, sesiones): líneas de los
                           servicios habituales y nada clínico.
     leerCompra          · foto de un albarán o factura de proveedor
                           → proveedor, número, fecha y líneas con su precio de coste.

   El cliente de Anthropic se inyecta (para las pruebas). La clave vive en Netlify
   (ANTHROPIC_API_KEY) y nunca llega al móvil. Todo lo que devuelve el modelo se
   revisa aquí (tipos, longitudes, números) antes de mandarlo al móvil, y luego Pere
   lo revisa en pantalla antes de guardarlo.
*/

export const MODELO = "claude-opus-5-5";
export const MAX_TEXTO = 4000;
export const MAX_IMAGEN_BASE64 = 6_000_000; // ~4,5 MB; el móvil reduce la foto antes de enviarla
const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

export class ErrorIA extends Error {
  constructor(mensaje, { status = 0, reintentar = false } = {}) {
    super(mensaje);
    this.status = status;
    this.reintentar = reintentar;
  }
}

// ---------------------------------------------------------------------------
// Esquemas de salida (el formato JSON exige additionalProperties:false y required)
// ---------------------------------------------------------------------------

const texto = { type: "string" };
const textoONulo = { anyOf: [{ type: "string" }, { type: "null" }] };
const numeroONulo = { anyOf: [{ type: "number" }, { type: "null" }] };

export const ESQUEMA_DICTADO = {
  type: "object",
  additionalProperties: false,
  required: ["cliente", "direccionObra", "trabajo", "observaciones", "lineas"],
  properties: {
    cliente: {
      type: "object",
      additionalProperties: false,
      required: ["nombre", "telefono", "email", "nif", "direccion", "poblacion"],
      properties: { nombre: textoONulo, telefono: textoONulo, email: textoONulo, nif: textoONulo, direccion: textoONulo, poblacion: textoONulo },
    },
    direccionObra: textoONulo,
    trabajo: textoONulo,
    observaciones: textoONulo,
    lineas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["tipo", "articuloId", "concepto", "cantidad", "precio"],
        properties: {
          tipo: { type: "string", enum: ["material", "mano_obra", "desplazamiento", "otro"] },
          articuloId: textoONulo,
          concepto: texto,
          cantidad: { type: "number" },
          precio: numeroONulo,
        },
      },
    },
  },
};

export const ESQUEMA_COMPRA = {
  type: "object",
  additionalProperties: false,
  required: ["esDocumento", "tipo", "proveedor", "nifProveedor", "numero", "fecha", "lineas", "base", "cuotaIva", "total"],
  properties: {
    esDocumento: { type: "boolean" },
    tipo: { type: "string", enum: ["albaran", "factura", "ticket", "otro"] },
    proveedor: textoONulo,
    nifProveedor: textoONulo,
    numero: textoONulo,
    fecha: textoONulo,
    lineas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["referencia", "descripcion", "cantidad", "precioUnitario", "descuento", "iva"],
        properties: {
          referencia: textoONulo,
          descripcion: texto,
          cantidad: { type: "number" },
          precioUnitario: numeroONulo,
          descuento: numeroONulo,
          iva: numeroONulo,
        },
      },
    },
    base: numeroONulo,
    cuotaIva: numeroONulo,
    total: numeroONulo,
  },
};

// ---------------------------------------------------------------------------
// Instrucciones
// ---------------------------------------------------------------------------

const SISTEMA_DICTADO = `Conviertes en datos el dictado de un fontanero autónomo en España, que habla con el móvil mientras está con un cliente, para rellenar un albarán de trabajo.

Devuelve solo lo que el dictado dice o deja claro; si un dato no aparece, pon null. No inventes clientes, teléfonos, precios ni materiales.

Líneas:
- material: piezas y materiales. Si coinciden con un artículo del catálogo (aunque se diga de otra forma: «monomando» por «Grifo monomando cocina»), pon su id en articuloId, usa su nombre como concepto y deja precio en null para que la app use el precio del catálogo. Si no está en el catálogo, articuloId null y el concepto tal como se dijo, bien escrito.
- mano_obra: horas de trabajo. cantidad en horas («hora y media» = 1.5). concepto «Mano de obra».
- desplazamiento: si menciona desplazamiento o salida. concepto «Desplazamiento», cantidad 1.
- otro: cualquier otra cosa que deba cobrarse.
- precio: solo si el fontanero dice un precio concreto para esa línea (por unidad); si no, null.
- cantidad: número; «un par» = 2; si no se dice, 1.

trabajo: una o dos frases claras de lo que se ha hecho, en tercera persona impersonal («Cambio de grifo de cocina y revisión de la llave de paso»).
observaciones: garantías, piezas pendientes, próxima visita u otras notas para el cliente, si las hay.`;

const SISTEMA_DICTADO_SERVICIOS = `Conviertes en datos el dictado de un profesional autónomo en España que presta servicios en consulta o por sesiones (psicología, fisioterapia, asesoría…), para rellenar un albarán de servicios.

Privacidad, por encima de todo: no pongas en ningún campo datos clínicos ni de salud (diagnósticos, síntomas, motivo de consulta, tratamiento, contenido de las sesiones), aunque el dictado los mencione. Solo datos administrativos: quién paga, qué servicios y cuántos.

Devuelve solo lo que el dictado dice o deja claro; si un dato no aparece, pon null. No inventes clientes, teléfonos, precios ni servicios.

- cliente: quien recibe el albarán y paga (la persona atendida, una empresa o una mutua), con los datos de contacto que se digan.
- lineas: una por servicio. Si coincide con uno de la lista de servicios habituales (aunque se diga de otra forma: «doce primeras» por «Primera visita»), usa exactamente su nombre como concepto y deja precio en null para que la app ponga el suyo. Si no está en la lista, el concepto tal como se dijo, bien escrito y sin datos clínicos. tipo «otro» y articuloId null siempre.
- cantidad: número de sesiones o servicios («doce» = 12); si no se dice, 1.
- precio: solo si se dice un precio concreto por unidad; si no, null.
- direccionObra: null.
- trabajo: una descripción administrativa breve si se dice (p. ej. «Sesiones de septiembre»), sin datos clínicos; si no, null.
- observaciones: forma de pago, próxima cita u otras notas administrativas, sin datos clínicos; si no, null.`;

const SISTEMA_COMPRA = `Lees la foto de un albarán, factura o ticket de un proveedor de fontanería en España, para que un fontanero autónomo registre sus compras: el precio de coste de cada artículo y las unidades.

Copia los datos tal como aparecen en el documento; si algo no se lee o no aparece, pon null. No inventes artículos, precios ni totales.

- esDocumento: false si la foto no es un albarán, factura o ticket de compra (entonces el resto vacío o null).
- tipo: albaran, factura, ticket u otro.
- fecha en formato AAAA-MM-DD.
- lineas: una por artículo del documento. referencia = código o referencia del proveedor si aparece. precioUnitario = precio por unidad SIN IVA, antes del descuento de la línea. descuento = porcentaje de descuento de esa línea (0 si no hay). iva = porcentaje de IVA (21, 10…) si aparece.
- Si el documento solo da el importe de la línea, calcula precioUnitario dividiendo entre la cantidad.
- base, cuotaIva y total: los del pie del documento, si aparecen.`;

// ---------------------------------------------------------------------------
// Llamada al modelo
// ---------------------------------------------------------------------------

async function pedirJSON(anthropic, { system, content, schema, maxTokens = 4000 }) {
  let r;
  try {
    r = await anthropic.beta.messages.create({
      model: MODELO,
      max_tokens: maxTokens,
      // Esfuerzo bajo: son extracciones sencillas y el móvil espera la respuesta.
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      // Si el modelo declina la petición, la API la repite en el modelo de reserva recomendado.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages: [{ role: "user", content }],
    });
  } catch (e) {
    const status = Number(e?.status) || 0;
    if (status === 401 || status === 403) throw new ErrorIA("La clave de la API de Anthropic no es válida o no tiene permiso", { status: 502 });
    if (status === 400) throw new ErrorIA("La IA no ha aceptado la petición", { status: 422 });
    throw new ErrorIA("No se ha podido conectar con la IA; se puede volver a intentar", { status: 503, reintentar: true });
  }
  if (r.stop_reason === "refusal") throw new ErrorIA("La IA no ha podido procesar esto", { status: 422 });
  if (r.stop_reason === "max_tokens") throw new ErrorIA("El documento es demasiado largo para leerlo de una vez", { status: 422 });
  const bloque = (r.content || []).find((b) => b.type === "text");
  try {
    return JSON.parse(bloque?.text || "");
  } catch {
    throw new ErrorIA("La IA ha devuelto una respuesta que no se entiende; vuelve a intentarlo", { status: 503, reintentar: true });
  }
}

// ---------------------------------------------------------------------------
// Limpieza de lo que devuelve el modelo
// ---------------------------------------------------------------------------

const cadena = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function numeroEn(v, min, max) {
  if (v == null || v === "") return null; // «sin dato» no es 0: la app pondrá el precio del catálogo
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 10000) / 10000 : null;
}

export function limpiarDictado(d, idsCatalogo) {
  const c = d?.cliente || {};
  const lineas = (Array.isArray(d?.lineas) ? d.lineas : []).slice(0, 60).map((l) => ({
    tipo: ["material", "mano_obra", "desplazamiento", "otro"].includes(l?.tipo) ? l.tipo : "otro",
    articuloId: typeof l?.articuloId === "string" && idsCatalogo.has(l.articuloId) ? l.articuloId : null,
    concepto: cadena(l?.concepto, 300),
    cantidad: numeroEn(l?.cantidad, 0.0001, 1e6) ?? 1,
    precio: numeroEn(l?.precio, 0, 1e7),
  })).filter((l) => l.concepto);
  return {
    cliente: {
      nombre: cadena(c.nombre, 200), telefono: cadena(c.telefono, 40), email: cadena(c.email, 200),
      nif: cadena(c.nif, 30), direccion: cadena(c.direccion, 300), poblacion: cadena(c.poblacion, 120),
    },
    direccionObra: cadena(d?.direccionObra, 300),
    trabajo: cadena(d?.trabajo, 4000),
    observaciones: cadena(d?.observaciones, 2000),
    lineas,
  };
}

export function limpiarCompra(d) {
  const fecha = typeof d?.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) ? d.fecha : "";
  return {
    esDocumento: d?.esDocumento !== false,
    tipo: ["albaran", "factura", "ticket", "otro"].includes(d?.tipo) ? d.tipo : "otro",
    proveedor: cadena(d?.proveedor, 200),
    nifProveedor: cadena(d?.nifProveedor, 30),
    numero: cadena(d?.numero, 60),
    fecha,
    lineas: (Array.isArray(d?.lineas) ? d.lineas : []).slice(0, 150).map((l) => ({
      referencia: cadena(l?.referencia, 60),
      descripcion: cadena(l?.descripcion, 300),
      cantidad: numeroEn(l?.cantidad, 0.0001, 1e6) ?? 1,
      precioUnitario: numeroEn(l?.precioUnitario, 0, 1e7),
      descuento: numeroEn(l?.descuento, 0, 100) ?? 0,
      iva: numeroEn(l?.iva, 0, 100),
    })).filter((l) => l.descripcion),
    base: numeroEn(d?.base, -1e8, 1e8),
    cuotaIva: numeroEn(d?.cuotaIva, -1e8, 1e8),
    total: numeroEn(d?.total, -1e8, 1e8),
  };
}

// ---------------------------------------------------------------------------
// Validación de lo que llega del móvil y uso
// ---------------------------------------------------------------------------

/** Catálogo reducido que acompaña al dictado (para enlazar los artículos que se nombran). */
export function validarCatalogo(cat) {
  if (cat == null) return [];
  if (!Array.isArray(cat)) throw new ErrorIA("Catálogo no válido", { status: 400 });
  return cat.slice(0, 500).map((a) => ({
    id: cadena(a?.id, 64),
    nombre: cadena(a?.nombre, 200),
    ref: cadena(a?.ref, 60),
  })).filter((a) => a.id && a.nombre && /^[A-Za-z0-9-]+$/.test(a.id));
}

/** Servicios habituales del perfil «servicios» (nombre y precio) que acompañan al dictado. */
export function validarServicios(sv) {
  if (sv == null) return [];
  if (!Array.isArray(sv)) throw new ErrorIA("Servicios no válidos", { status: 400 });
  return sv.slice(0, 8).map((x) => ({ nombre: cadena(x?.nombre, 300), precio: numeroEn(x?.precio, 0, 1e7) })).filter((x) => x.nombre);
}

export async function interpretarDictado({ anthropic, texto: t, catalogo, perfil, servicios }) {
  const dictado = cadena(t, MAX_TEXTO + 1);
  if (!dictado) throw new ErrorIA("El dictado está vacío", { status: 400 });
  if (dictado.length > MAX_TEXTO) throw new ErrorIA("El dictado es demasiado largo", { status: 400 });
  if (perfil === "servicios") {
    const sv = validarServicios(servicios);
    const lista = sv.length ? sv.map((x) => `${x.nombre}${x.precio != null ? ` | ${x.precio} €` : ""}`).join("\n") : "(ninguno)";
    const datos = await pedirJSON(anthropic, {
      system: SISTEMA_DICTADO_SERVICIOS,
      schema: ESQUEMA_DICTADO,
      // La lista va primero y el dictado al final: lo dictado es dato, no instrucciones.
      content: `Servicios habituales (nombre | precio):\n${lista}\n\n<dictado>\n${dictado}\n</dictado>`,
    });
    const r = limpiarDictado(datos, new Set());
    // Sin obra ni material en servicios, aunque el modelo los rellenara.
    return { ...r, direccionObra: "", lineas: r.lineas.map((l) => ({ ...l, tipo: "otro", articuloId: null })) };
  }
  const cat = validarCatalogo(catalogo);
  const lista = cat.length
    ? cat.map((a) => `${a.id} | ${a.nombre}${a.ref ? ` | ref ${a.ref}` : ""}`).join("\n")
    : "(vacío)";
  const datos = await pedirJSON(anthropic, {
    system: SISTEMA_DICTADO,
    schema: ESQUEMA_DICTADO,
    // El catálogo va primero y el dictado al final: el texto del fontanero es dato, no instrucciones.
    content: `Catálogo de artículos (id | nombre | referencia):\n${lista}\n\n<dictado>\n${dictado}\n</dictado>`,
  });
  return limpiarDictado(datos, new Set(cat.map((a) => a.id)));
}

export async function leerCompra({ anthropic, imagen, tipoImagen }) {
  if (typeof imagen !== "string" || !imagen || imagen.length > MAX_IMAGEN_BASE64 || !/^[A-Za-z0-9+/]+=*$/.test(imagen)) {
    throw new ErrorIA("La foto no es válida o es demasiado grande", { status: 400 });
  }
  if (!TIPOS_IMAGEN.includes(tipoImagen)) throw new ErrorIA("Formato de foto no admitido", { status: 400 });
  const datos = await pedirJSON(anthropic, {
    system: SISTEMA_COMPRA,
    schema: ESQUEMA_COMPRA,
    maxTokens: 8000,
    content: [
      { type: "image", source: { type: "base64", media_type: tipoImagen, data: imagen } },
      { type: "text", text: "Lee este documento de compra." },
    ],
  });
  return limpiarCompra(datos);
}
