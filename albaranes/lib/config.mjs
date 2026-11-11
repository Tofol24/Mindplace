/* Albaranes · valores iniciales de cada instalación.
   ---------------------------------------------------------------------------
   Un mismo código sirve a varios profesionales: cada uno con su sitio de
   Netlify. Sus variables de entorno APP_* dan los Ajustes de partida (tipo de
   actividad, datos del negocio, IVA, retención…), que el móvil guarda la
   primera vez y luego se cambian en Ajustes. No hay nada secreto: son los
   mismos datos que salen en el PDF.

     APP_PERFIL          oficio | servicios
     APP_DESTINO         holded | volcado (sin Holded: se exportan para el programa de facturación)
     APP_NEGOCIO_NOMBRE, APP_NEGOCIO_NIF, APP_NEGOCIO_DIRECCION,
     APP_NEGOCIO_TELEFONO, APP_NEGOCIO_EMAIL
     APP_TEXTO_EXENCION  mención del PDF si va exento de IVA
     APP_IVA             21 | 10 | 0 (exento)
     APP_RETENCION       0 | 7 | 15 (la que aplican las empresas)
     APP_SERVICIOS       «Primera visita: 60 | Sesión de seguimiento: 50»
     APP_PREFIJO         prefijo de la numeración (letras y números)
     APP_CONSENTIMIENTO  si → pedir el consentimiento RGPD en las primeras visitas (servicios)
     APP_COLEGIADO, APP_DPD, APP_HERRAMIENTA_ONLINE   datos del texto del consentimiento
*/

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const deLista = (v, permitidos) => {
  const n = Number(String(v ?? "").trim());
  return String(v ?? "").trim() !== "" && permitidos.includes(n) ? n : undefined;
};

/** Ajustes iniciales a partir de las variables de entorno (solo las que estén bien puestas). */
export function configInicial(env = {}) {
  const c = {};
  if (["oficio", "servicios"].includes(texto(env.APP_PERFIL, 20))) c.perfil = texto(env.APP_PERFIL, 20);
  if (["holded", "volcado"].includes(texto(env.APP_DESTINO, 20))) c.destino = texto(env.APP_DESTINO, 20);
  const negocio = {
    nombre: texto(env.APP_NEGOCIO_NOMBRE, 200),
    nif: texto(env.APP_NEGOCIO_NIF, 30),
    direccion: texto(env.APP_NEGOCIO_DIRECCION, 300),
    telefono: texto(env.APP_NEGOCIO_TELEFONO, 40),
    email: texto(env.APP_NEGOCIO_EMAIL, 200),
    textoExencion: texto(env.APP_TEXTO_EXENCION, 300),
  };
  // Si la instalación da su negocio, va entero: no se mezcla con los datos de otro profesional.
  if (Object.values(negocio).some(Boolean)) c.negocio = negocio;
  const iva = deLista(env.APP_IVA, [21, 10, 0]);
  if (iva !== undefined) c.ivaDefecto = iva;
  const ret = deLista(env.APP_RETENCION, [0, 7, 15]);
  if (ret !== undefined) c.retencionEmpresas = ret;
  const servicios = texto(env.APP_SERVICIOS, 2000).split("|").map((s) => s.trim()).filter(Boolean).slice(0, 8)
    .map((s) => /^(.*?)[\s:=;-]+(\d+(?:[.,]\d{1,2})?)\s*€?$/.exec(s))
    .filter(Boolean).map((m) => ({ nombre: m[1].trim().slice(0, 300), precio: Number(m[2].replace(",", ".")) }))
    .filter((s) => s.nombre);
  if (servicios.length) c.servicios = servicios;
  const prefijo = texto(env.APP_PREFIJO, 8).toUpperCase();
  if (/^[A-Z0-9]{1,8}$/.test(prefijo)) c.prefijo = prefijo;
  const consentimiento = {
    activo: ["si", "sí", "true", "1"].includes(texto(env.APP_CONSENTIMIENTO, 10).toLowerCase()),
    clave: "primera",
    colegiado: texto(env.APP_COLEGIADO, 40),
    dpd: texto(env.APP_DPD, 300),
    herramienta: texto(env.APP_HERRAMIENTA_ONLINE, 200),
  };
  if (consentimiento.activo || consentimiento.colegiado || consentimiento.dpd || consentimiento.herramienta) c.consentimiento = consentimiento;
  return c;
}
