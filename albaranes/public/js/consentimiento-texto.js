/* Albaranes · texto del consentimiento RGPD para pacientes (atención psicológica).
   ---------------------------------------------------------------------------
   Es el documento del profesional («Consentimiento R.G.P.D. – Pacientes», en sus
   dos versiones: general y menores con tutores separados), con sus datos como
   huecos: salen de Ajustes (negocio y consentimiento), nunca del código.
   El texto que se firma se guarda entero con la firma: si este fichero cambia,
   los consentimientos ya firmados siguen mostrando lo que se firmó.
   Sin DOM: se puede probar con Node.
*/

export const TEXTO_VERSION = 1;

/** ¿Pide consentimiento esta línea? (un servicio cuyo nombre contiene la palabra clave de Ajustes). */
export function pideConsentimiento(lineas, clave) {
  const k = normalizar(clave);
  return !!k && (lineas || []).some((l) => normalizar(l.concepto).includes(k));
}

export const normalizar = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const digitos = (s) => String(s || "").replace(/\D/g, "").slice(-9);

/**
 * El consentimiento de este paciente, si ya lo firmó: mismo nombre y, si los dos tienen
 * teléfono, mismo teléfono (dos pacientes con el mismo nombre no se confunden).
 */
export function consentimientoDe(cliente, lista) {
  const n = normalizar(cliente?.nombre);
  if (!n) return null;
  const t = digitos(cliente?.telefono);
  return (lista || [])
    .filter((c) => normalizar(c.paciente?.nombre) === n && (!t || !digitos(c.paciente?.telefono) || digitos(c.paciente.telefono) === t))
    .sort((a, b) => String(b.firmadoEn).localeCompare(String(a.firmadoEn)))[0] || null;
}

/**
 * Apartados del texto con los datos del responsable.
 * r = { nombre, nif, direccion, telefono, email, dpd }
 * Devuelve [{ titulo, texto }]: el primero sin título (la introducción).
 */
export function apartados(r) {
  const R = r.nombre || "";
  const dpd = r.dpd ? ` Delegado de Protección de Datos: ${r.dpd}.` : "";
  return [
    { titulo: "", texto: "De conformidad con lo dispuesto en el Reglamento (UE) 679/2016, nuevo Reglamento general de protección de datos (RGPD), y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDPGDD), se le facilita la siguiente información del tratamiento de sus datos de carácter personal:" },
    { titulo: "RESPONSABLE", texto: `${R}, CIF: ${r.nif || ""}, Dir. Postal: ${r.direccion || ""}, Teléfono: ${r.telefono || ""}, Correo electrónico: ${r.email || ""}.${dpd}` },
    { titulo: "FINALIDAD", texto: `En ${R} tratamos la información que nos facilita para prestarle servicios de atención psicológica, incluyendo el diagnóstico y/o tratamiento psicológico, además de mantenerlo informado sobre cuestiones relativas a la atención y/o diagnóstico y/o tratamiento psicológico al que se haya sometido. No se elaborará ningún perfil comercial a partir de esta información. Los datos personales proporcionados se conservarán en su historial clínico durante un plazo mínimo de 5 años contados desde la fecha del alta de cada proceso asistencial. En cualquier caso, sus datos de carácter personal serán conservados mientras sean útiles para la finalidad indicada, y, en todo caso, durante los plazos legales y por el tiempo necesario para atender a posibles responsabilidades nacidas del tratamiento.` },
    { titulo: "LEGITIMACIÓN", texto: "El tratamiento de sus datos de carácter personal está basado en la ejecución de un contrato en el que el interesado es parte o para la aplicación, a petición de este, de medidas precontractuales. Además, debemos tratar sus datos para cumplir con una obligación legal aplicable al responsable del tratamiento. En cualquier caso, usted ha dado su consentimiento para tratar sus datos de carácter personal con uno o varios fines específicos de conformidad con lo dispuesto en el Reglamento (UE) 679/2016 (art. 6.1.A, B y C) y la LOPDPGDD. Resulta de aplicación la Ley 41/2002, de 14 de noviembre, básica reguladora de la autonomía del paciente y de los derechos y obligaciones en materia de información y documentación clínica en lo referente a los artículos 14-19 relativos al tratamiento de historiales clínicos. Resulta de aplicación la Ley 34/2002, de 11 de julio, de servicios de sociedad de la información y de comercio electrónico, artículos 20 y 21, para el envío de ofertas comerciales mediante telecomunicaciones. La oferta prospectiva de productos y servicios está basada en el consentimiento que se le solicita, sin que en ningún caso la retirada de este consentimiento condicione el contrato de adquisición de producto y/o prestación de servicio. Existe la obligación de facilitar los datos de carácter personal o, en caso contrario, no se puede prestar la atención y/o tratamiento psicológico solicitado." },
    { titulo: "DESTINATARIOS", texto: "Los datos no se comunicarán a ningún tercero ajeno a la entidad, salvo obligación legal. No obstante le informamos que terceros proveedores pueden tener acceso a sus datos personales, en calidad de encargados de tratamiento, en el marco de la prestación de un servicio para la entidad responsable del tratamiento. Además de lo anterior, la entidad podrá realizar cesiones o comunicaciones de datos personales a hospitales, entidades aseguradoras de salud y a la Administración Pública competente en la materia. No hay previsión de transferencia de datos a terceros países." },
    { titulo: "DERECHOS", texto: `Las personas interesadas tienen derecho a obtener el acceso a sus datos personales, así como a solicitar la rectificación de los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos que ya no sean necesarios para los fines que fueron recogidos. En determinadas circunstancias, los interesados pueden solicitar la limitación del tratamiento de sus datos, en cuyo caso únicamente los conservaremos para el ejercicio o defensa de reclamaciones. Asimismo, y por motivos relacionados con su situación particular, los interesados pueden oponerse al tratamiento de sus datos, en cuyo caso su información personal dejará de tratarse para aquellas finalidades respecto de las que haya manifestado su oposición. Cuando sea técnicamente posible, el interesado puede solicitar la portabilidad de sus datos a otro responsable del tratamiento. Para ejercitar estos derechos, de conformidad con la legislación vigente los interesados pueden dirigirse por correo postal, adjuntando copia de un documento acreditativo de su identidad (DNI), a ${R} en ${r.direccion || ""}, o al email: ${r.email || ""}. Usted tiene derecho a presentar una reclamación ante la autoridad de control: Agencia Española de Protección Datos (www.agpd.es). Procedencia de los datos de carácter personal: el propio interesado.` },
  ];
}

/**
 * Las dos casillas (se marcan solo si la persona lo pide: el consentimiento es expreso).
 * La versión de tutores separados habla solo de correo electrónico, como su documento.
 */
export function opciones(tipo, herramienta) {
  return [
    herramienta && { clave: "online", texto: `Marcando esta opción usted autoriza expresamente recibir las sesiones de atención psicológica mediante la Herramienta de Comunicaciones ${herramienta}. La presente herramienta de comunicaciones cuenta con un sistema de cifrado que garantiza la confidencialidad de las sesiones de atención psicológica recibidas.` },
    { clave: "informes", texto: `Marcando esta opción usted consiente expresamente el envío de informes y documentación de los servicios de atención psicológica prestados mediante correo electrónico${tipo === "separados" ? "" : " y/o WhatsApp"}.` },
  ].filter(Boolean);
}

/** Quién firma: el paciente, un representante legal o dos (tutores separados). */
export const TIPOS = {
  paciente: { nombre: "El paciente", firmas: 1 },
  representante: { nombre: "Un representante legal (menor)", firmas: 1 },
  separados: { nombre: "Dos representantes (tutores separados)", firmas: 2 },
};
