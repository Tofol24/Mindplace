/* Albaranes · cálculos de importes y formatos (compartidos por la app y el PDF). */

// 0 = exento (p. ej. servicios sanitarios, art. 20.Uno.3 de la Ley del IVA).
export const IVAS = [21, 10, 0];
export const etiquetaIva = (v) => (Number(v) === 0 ? "Exento" : `${v}%`);

// Retención de IRPF que aplica el cliente (empresas, mutuas…) sobre la base.
export const RETENCIONES = [0, 7, 15];
/** Un CIF de empresa o entidad empieza por estas letras; DNI y NIE son personas. */
export const esEmpresa = (nif) => /^[ABCDEFGHJNPQRSUVW]\d/.test(String(nif || "").toUpperCase().replace(/[^A-Z0-9]/g, ""));

export const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
// Hasta 4 decimales, como admite el servidor: el PDF no puede mostrar «0» con importe.
const cifra = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 4 });
export const formatoEuros = (n) => euros.format(n || 0);
export const formatoCantidad = (n) => cifra.format(n || 0);

export function importeLinea(l) {
  return redondear((Number(l.cantidad) || 0) * (Number(l.precio) || 0));
}

/** Base, cuota por tipo de IVA, retención de IRPF y total (lo que se cobra). */
export function totales(lineas, retencion = 0) {
  const porIva = new Map();
  for (const l of lineas) {
    const iva = Number(l.iva) || 0;
    porIva.set(iva, redondear((porIva.get(iva) || 0) + importeLinea(l)));
  }
  const desglose = [...porIva.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([iva, base]) => ({ iva, base, cuota: redondear((base * iva) / 100) }));
  const base = redondear(desglose.reduce((s, d) => s + d.base, 0));
  const cuota = redondear(desglose.reduce((s, d) => s + d.cuota, 0));
  const ret = Number(retencion) || 0;
  const cuotaRetencion = redondear((base * ret) / 100);
  return { desglose, base, cuota, retencion: ret, cuotaRetencion, total: redondear(base + cuota - cuotaRetencion) };
}

export function fechaLarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}
export function fechaCorta(iso) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
/** YYYY-MM-DD que existe de verdad (el selector de fecha de iOS puede dejarla vacía). */
export function fechaValida(f) {
  if (typeof f !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const [a, m, d] = f.split("-").map(Number);
  const x = new Date(a, m - 1, d);
  return x.getFullYear() === a && x.getMonth() === m - 1 && x.getDate() === d;
}

export function fechaCortaSegura(iso) {
  return fechaValida(iso) ? fechaCorta(iso) : "Sin fecha";
}

export function hoyISO() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

/** Teléfono en formato internacional para WhatsApp (España por defecto). */
export function telefonoWhatsApp(t) {
  let d = String(t || "").replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^[6789]\d{8}$/.test(d)) d = `34${d}`;
  return /^\d{8,15}$/.test(d) ? d : "";
}
