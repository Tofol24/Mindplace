/* Albaranes · formato del volcado al programa de facturación.
   ---------------------------------------------------------------------------
   Convierte los albaranes firmados en:
     · albaranes.csv  una fila por albarán (emisor, cliente, totales, exención…)
     · lineas.csv     una fila por línea, enlazada con «albaran_id»
     · volcado.json   lo mismo en JSON, con números como números
   Formato pensado para importarlo en Access (u otro programa) y convertir los
   albaranes en facturas. Documentado columna a columna en VOLCADO.md: si se
   cambia algo aquí, se cambia allí y se sube FORMATO_VERSION.
   Sin DOM: se puede probar con Node.
*/

import { esEmpresa, importeLinea, redondear, totales } from "./calculos.js";

export const FORMATO_VERSION = 1;

// Mismo redondeo que el PDF y los totales (calculos.js): las líneas cuadran con la cabecera.
const r2 = (n) => redondear(Number(n) || 0);

/** Datos de un albarán listos para volcar (el mismo objeto alimenta CSV y JSON). */
export function datosVolcado(a) {
  const t = totales(a.lineas, a.retencion);
  const negocio = a.negocio || {};
  const c = a.cliente || {};
  const exento = a.lineas.some((l) => Number(l.iva) === 0);
  const baseExenta = r2(t.desglose.filter((d) => d.iva === 0).reduce((s, d) => s + d.base, 0));
  const textoExencion = exento ? (negocio.textoExencion || "Operación exenta de IVA.") : "";
  return {
    id: a.id,
    numero: a.numero,
    fecha: a.fecha,
    estado: a.estado,
    firmadoEn: a.firmadoEn || "",
    firmante: a.firmante || "",
    emisor: { nombre: negocio.nombre || "", nif: negocio.nif || "" },
    cliente: {
      nombre: c.nombre || "", nif: c.nif || "", esEmpresa: esEmpresa(c.nif), direccion: c.direccion || "", cp: c.cp || "",
      poblacion: c.poblacion || "", telefono: c.telefono || "", email: c.email || "",
    },
    descripcion: a.trabajo || "",
    observaciones: a.observaciones || "",
    baseImponible: t.base,
    baseExenta,
    baseSujeta: r2(t.base - baseExenta),
    cuotaIva: t.cuota,
    retencionPct: t.retencion,
    cuotaRetencion: t.cuotaRetencion,
    total: t.total,
    exento,
    textoExencion,
    // VeriFactu, causa de exención: E1 = exenta por el art. 20 de la Ley del IVA (p. ej. sanidad).
    // Solo se propone si la mención de la exención cita ese artículo; si no, la decide el programa.
    verifactuCausaExencion: exento && /\b20\b/.test(textoExencion) ? "E1" : "",
    volcadoEn: a.volcadoEn || "",
    lineas: a.lineas.map((l, i) => {
      const base = importeLinea(l);
      return {
        linea: i + 1,
        concepto: l.concepto,
        cantidad: Number(l.cantidad) || 0,
        precioUnitario: Number(l.precio) || 0,
        ivaPct: Number(l.iva) || 0,
        exento: Number(l.iva) === 0,
        base,
        cuotaIva: r2((base * (Number(l.iva) || 0)) / 100),
      };
    }),
  };
}

// --- CSV (mismo estilo que el de compras: «;», coma decimal, UTF-8 con BOM) ---

const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
// Un texto que empiece por = + - @ se abriría como fórmula en Excel: se neutraliza.
const texto = (v) => celda(/^[=+\-@\t\r]/.test(String(v ?? "")) ? `'${v}` : v);
const cifra = (n) => celda(String(r2(n)).replace(".", ","));
const cantidad = (n) => celda(String(Math.round((Number(n) || 0) * 10000) / 10000).replace(".", ","));
const sn = (b) => celda(b ? "S" : "N");
const fila = (celdas) => celdas.join(";");

export const COLUMNAS_ALBARANES = [
  "albaran_id", "numero", "fecha", "estado", "firmado_en", "firmante", "emisor_nombre", "emisor_nif",
  "cliente_nombre", "cliente_nif", "cliente_es_empresa", "cliente_direccion", "cliente_cp", "cliente_poblacion",
  "cliente_telefono", "cliente_email", "descripcion", "observaciones", "base_imponible", "base_exenta", "base_sujeta",
  "cuota_iva", "retencion_pct", "cuota_retencion", "total", "exento", "texto_exencion", "verifactu_causa_exencion", "volcado_en",
];
export const COLUMNAS_LINEAS = [
  "albaran_id", "numero", "fecha", "linea", "concepto", "cantidad", "precio_unitario", "iva_pct", "exento", "base_linea", "cuota_iva_linea",
];

export function csvAlbaranes(lista) {
  const filas = [fila(COLUMNAS_ALBARANES.map(celda))];
  for (const d of lista) {
    filas.push(fila([
      celda(d.id), texto(d.numero), celda(d.fecha), celda(d.estado), celda(d.firmadoEn), texto(d.firmante),
      texto(d.emisor.nombre), texto(d.emisor.nif), texto(d.cliente.nombre), texto(d.cliente.nif), sn(d.cliente.esEmpresa),
      texto(d.cliente.direccion), texto(d.cliente.cp), texto(d.cliente.poblacion), texto(d.cliente.telefono), texto(d.cliente.email),
      texto(d.descripcion), texto(d.observaciones), cifra(d.baseImponible), cifra(d.baseExenta), cifra(d.baseSujeta),
      cifra(d.cuotaIva), cifra(d.retencionPct), cifra(d.cuotaRetencion), cifra(d.total), sn(d.exento), texto(d.textoExencion),
      celda(d.verifactuCausaExencion), celda(d.volcadoEn),
    ]));
  }
  return "﻿" + filas.join("\r\n") + "\r\n";
}

export function csvLineas(lista) {
  const filas = [fila(COLUMNAS_LINEAS.map(celda))];
  for (const d of lista) {
    for (const l of d.lineas) {
      filas.push(fila([
        celda(d.id), texto(d.numero), celda(d.fecha), celda(l.linea), texto(l.concepto), cantidad(l.cantidad),
        cifra(l.precioUnitario), cifra(l.ivaPct), sn(l.exento), cifra(l.base), cifra(l.cuotaIva),
      ]));
    }
  }
  return "﻿" + filas.join("\r\n") + "\r\n";
}

export function jsonVolcado(lista, { exportadoEn = new Date().toISOString() } = {}) {
  return JSON.stringify({ formato: "albaranes-volcado", version: FORMATO_VERSION, exportadoEn, albaranes: lista }, null, 1);
}
