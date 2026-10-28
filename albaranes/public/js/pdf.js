/* Albaranes · PDF del albarán firmado (jsPDF, guardado en vendor/ para que
   funcione sin conexión). Devuelve un Blob listo para compartir o adjuntar. */

import { fechaCorta, formatoCantidad, formatoEuros, importeLinea, totales } from "./calculos.js";

const A4 = { w: 210, h: 297 };
const M = 15; // margen
const GRIS = [110, 110, 110];
const TINTA = [25, 25, 25];
const ACENTO = [12, 74, 110];

export function generarPDF(alb, negocio) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `Albarán ${alb.numero}`, subject: "Albarán de trabajo", creator: "App de albaranes" });
  let y = M;

  const texto = (t, x, yy, { size = 10, bold = false, color = TINTA, align = "left" } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(t), x, yy, { align });
  };
  const parrafo = (t, x, ancho, { size = 10, color = TINTA, interlineado = 4.6 } = {}) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    for (const linea of doc.splitTextToSize(String(t), ancho)) {
      sitio(interlineado);
      doc.text(linea, x, y);
      y += interlineado;
    }
  };
  // Salta de página si no cabe un bloque de alto h.
  const sitio = (h) => {
    if (y + h > A4.h - M - 8) {
      doc.addPage();
      y = M + 4;
    }
  };

  // --- Cabecera: negocio a la izquierda, número y fecha a la derecha ---
  texto(negocio.nombre || "Tu negocio", M, y + 5, { size: 15, bold: true, color: ACENTO });
  let yn = y + 11;
  for (const l of [negocio.nif && `NIF: ${negocio.nif}`, negocio.direccion, [negocio.telefono, negocio.email].filter(Boolean).join(" · ")].filter(Boolean)) {
    texto(l, M, yn, { size: 9, color: GRIS });
    yn += 4.4;
  }
  texto("ALBARÁN", A4.w - M, y + 5, { size: 18, bold: true, align: "right" });
  texto(`Nº ${alb.numero}`, A4.w - M, y + 12, { size: 11, bold: true, align: "right" });
  texto(`Fecha: ${fechaCorta(alb.fecha)}`, A4.w - M, y + 17.5, { size: 10, align: "right" });
  y = Math.max(yn, y + 22) + 4;
  doc.setDrawColor(...ACENTO);
  doc.setLineWidth(0.6);
  doc.line(M, y, A4.w - M, y);
  y += 7;

  // --- Cliente y dirección de la obra ---
  const c = alb.cliente;
  const colW = (A4.w - 2 * M - 6) / 2;
  const bloque = (titulo, lineas, x) => {
    let yy = y;
    texto(titulo.toUpperCase(), x, yy, { size: 8, bold: true, color: GRIS });
    yy += 5;
    lineas.filter(Boolean).forEach((l, i) => {
      doc.setFont("helvetica", i === 0 ? "bold" : "normal");
      doc.setFontSize(i === 0 ? 11 : 9.5);
      doc.setTextColor(...TINTA);
      for (const s of doc.splitTextToSize(l, colW)) { doc.text(s, x, yy); yy += 4.6; }
    });
    return yy;
  };
  const dirCliente = [c.direccion, [c.cp, c.poblacion].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const y1 = bloque("Cliente", [c.nombre, c.nif && `NIF: ${c.nif}`, dirCliente, [c.telefono, c.email].filter(Boolean).join(" · ")], M);
  const y2 = bloque("Dirección de la obra", [alb.direccionObra || dirCliente || "—"], M + colW + 6);
  y = Math.max(y1, y2) + 4;

  // --- Trabajo realizado ---
  if (alb.trabajo) {
    sitio(12);
    texto("TRABAJO REALIZADO", M, y, { size: 8, bold: true, color: GRIS });
    y += 5;
    parrafo(alb.trabajo, M, A4.w - 2 * M);
    y += 3;
  }

  // --- Tabla de líneas ---
  const cols = [
    { t: "Concepto", w: 92, a: "left" },
    { t: "Cant.", w: 18, a: "right" },
    { t: "Precio", w: 26, a: "right" },
    { t: "IVA", w: 14, a: "right" },
    { t: "Importe", w: 30, a: "right" },
  ];
  const cabeceraTabla = () => {
    sitio(14);
    doc.setFillColor(236, 242, 246);
    doc.rect(M, y - 4.5, A4.w - 2 * M, 7, "F");
    let x = M;
    for (const col of cols) {
      texto(col.t, col.a === "right" ? x + col.w - 2 : x + 2, y, { size: 9, bold: true, color: ACENTO, align: col.a });
      x += col.w;
    }
    y += 6;
  };
  cabeceraTabla();
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  for (const l of alb.lineas) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lineasConcepto = doc.splitTextToSize(l.concepto, cols[0].w - 4);
    const alto = lineasConcepto.length * 4.4 + 2;
    if (y + alto > A4.h - M - 8) { doc.addPage(); y = M + 4; cabeceraTabla(); }
    const valores = [null, formatoCantidad(l.cantidad), formatoEuros(l.precio), `${l.iva}%`, formatoEuros(importeLinea(l))];
    doc.setTextColor(...TINTA);
    lineasConcepto.forEach((s, i) => doc.text(s, M + 2, y + i * 4.4));
    let x = M;
    cols.forEach((col, i) => {
      if (i > 0) doc.text(valores[i], x + col.w - 2, y, { align: "right" });
      x += col.w;
    });
    y += alto;
    doc.line(M, y - 3, A4.w - M, y - 3);
  }
  y += 2;

  // --- Totales ---
  const t = totales(alb.lineas);
  const filaTotal = (etq, valor, { bold = false, size = 10 } = {}) => {
    sitio(7);
    texto(etq, A4.w - M - 40, y, { size, bold, align: "right" });
    texto(valor, A4.w - M - 2, y, { size, bold, align: "right" });
    y += size > 10 ? 7 : 5.5;
  };
  filaTotal("Base imponible", formatoEuros(t.base));
  for (const d of t.desglose) filaTotal(`IVA ${d.iva}% (sobre ${formatoEuros(d.base)})`, formatoEuros(d.cuota));
  doc.setDrawColor(...ACENTO);
  doc.line(A4.w - M - 90, y - 3.5, A4.w - M, y - 3.5);
  y += 1.5;
  filaTotal("TOTAL", formatoEuros(t.total), { bold: true, size: 12 });
  y += 3;

  // --- Observaciones ---
  if (alb.observaciones) {
    sitio(12);
    texto("OBSERVACIONES", M, y, { size: 8, bold: true, color: GRIS });
    y += 5;
    parrafo(alb.observaciones, M, A4.w - 2 * M, { size: 9.5 });
    y += 3;
  }

  // --- Firma ---
  sitio(48);
  y += 2;
  texto("CONFORME DEL CLIENTE", M, y, { size: 8, bold: true, color: GRIS });
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(M, y, 80, 32);
  if (alb.firma) {
    // Se encaja sin deformar dentro del recuadro de 78 × 30 mm.
    try {
      const p = doc.getImageProperties(alb.firma);
      const escala = Math.min(78 / p.width, 30 / p.height);
      const w = p.width * escala;
      const hh = p.height * escala;
      doc.addImage(alb.firma, "PNG", M + 1 + (78 - w) / 2, y + 1 + (30 - hh) / 2, w, hh, undefined, "FAST");
    } catch { /* firma ilegible: se deja el recuadro */ }
  }
  const xf = M + 86;
  let yf = y + 5;
  if (alb.firmante) { texto(alb.firmante, xf, yf, { size: 10, bold: true }); yf += 5; }
  if (alb.firmadoEn) {
    texto(`Firmado el ${new Date(alb.firmadoEn).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}`, xf, yf, { size: 9, color: GRIS });
    yf += 5;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.text(doc.splitTextToSize("El cliente da su conformidad al trabajo realizado y al material indicado en este albarán.", A4.w - M - xf), xf, yf);
  y += 36;

  // --- Pie en cada página ---
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    texto(`Albarán ${alb.numero} · Este documento no es una factura · Página ${p} de ${paginas}`, A4.w / 2, A4.h - 8, { size: 8, color: GRIS, align: "center" });
  }

  return doc.output("blob");
}

export function nombrePDF(alb) {
  return `Albaran-${alb.numero || "borrador"}.pdf`;
}
