/* Albaranes · perfiles de profesión.
   ---------------------------------------------------------------------------
   Lo que cambia según a qué se dedica quien usa la app: textos, botones de
   líneas, pestañas y si hay dictado con IA. Se elige en Ajustes («Tipo de
   actividad»). Lo demás (sin conexión, firma, PDF, envío a Holded) es igual.
*/

export const PERFILES = {
  // Obras, reparaciones, instalaciones: material con stock, mano de obra y desplazamiento.
  oficio: {
    nombre: "Oficio (obras, reparaciones, instalaciones…)",
    lugar: "Dirección de la obra",
    seccionTrabajo: "Trabajo",
    trabajo: "Trabajo realizado",
    placeholderTrabajo: "Qué se ha hecho: avería, reparación, instalación…",
    ayudaTrabajo: "",
    seccionLineas: "Material y mano de obra",
    placeholderConcepto: "Concepto (p. ej. Grifo monomando)",
    placeholderObservaciones: "Garantía, piezas pendientes, próxima visita…",
    conformidad: "El cliente da su conformidad al trabajo realizado y al material indicado en este albarán.",
    asuntoPdf: "Albarán de trabajo",
    mensaje: "del trabajo realizado el",
    compras: true, // pestañas Compras y Catálogo, margen sobre el coste
    dictado: true,
    placeholderDictado: "Pulsa 🎤 y habla, o usa el micrófono del teclado. Ej.: «Cliente Jesús Arribas, teléfono 600 111 222. Cambio de grifo del baño: un grifo monomando, dos latiguillos y hora y media de mano de obra.»",
  },
  // Consulta y sesiones (psicología, fisioterapia, asesoría…): servicios con precio fijo.
  servicios: {
    nombre: "Servicios profesionales (consulta, sesiones…)",
    lugar: null, // no se pide dirección de la obra
    seccionTrabajo: "Servicio",
    trabajo: "Descripción (opcional)",
    placeholderTrabajo: "P. ej. sesiones del mes de septiembre",
    // En sanidad, que alguien sea cliente ya es un dato de salud: lo mínimo, y nada clínico.
    ayudaTrabajo: "No escribas datos clínicos ni diagnósticos: este texto sale en el PDF y en lo que exportes (Holded o tu programa de facturación).",
    seccionLineas: "Servicios",
    placeholderConcepto: "Concepto (p. ej. Sesión de seguimiento)",
    placeholderObservaciones: "Forma de pago, próxima cita…",
    conformidad: "Conforme con los servicios indicados en este albarán.",
    asuntoPdf: "Albarán de servicios",
    mensaje: "de los servicios del",
    compras: false,
    // El dictado se interpreta con IA fuera del móvil: con datos de pacientes, solo si se activa
    // a sabiendas en Ajustes («Dictado por voz con IA»).
    dictado: false,
    dictadoOpcional: true,
    placeholderDictado: "Pulsa 🎤 y habla. Ej.: «Mutua Balear, CIF G07046196. Doce primeras visitas y cuarenta y una sesiones de seguimiento.» Solo datos administrativos: nada clínico.",
  },
};

export const PERFIL_DEFECTO = "oficio";

/** Perfil por su clave (el de ajustes, o el que quedó guardado en un albarán firmado). */
export const perfil = (clave) => PERFILES[clave] || PERFILES[PERFIL_DEFECTO];

/**
 * Si se puede dictar (y mandar el texto a la IA). No mientras un móvil nuevo espera los Ajustes
 * de su instalación: podría ser de servicios sanitarios aunque aún se vea como «oficio».
 */
export const dictadoPermitido = (ajustes) => {
  const pf = perfil(ajustes?.perfil);
  return (pf.dictado || (pf.dictadoOpcional && ajustes?.dictadoServicios === true)) && ajustes?.configInstalacion !== "pendiente";
};

/** Servicios habituales del perfil «servicios»: botones «+ …» con su precio. */
export const SERVICIOS_DEFECTO = [
  { nombre: "Primera visita", precio: 60 },
  { nombre: "Sesión de seguimiento", precio: 50 },
];

/** «Nombre: precio» por línea → lista de servicios. Ignora líneas vacías o sin nombre. */
export function leerServicios(texto) {
  return String(texto || "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 8).map((l) => {
    const m = /^(.*?)[\s:=;-]+(\d+(?:[.,]\d{1,2})?)\s*€?$/.exec(l);
    return m ? { nombre: m[1].trim().slice(0, 300), precio: Number(m[2].replace(",", ".")) } : { nombre: l.slice(0, 300), precio: 0 };
  }).filter((s) => s.nombre);
}
export const escribirServicios = (lista) => (lista || []).map((s) => `${s.nombre}: ${String(s.precio).replace(".", ",")}`).join("\n");
