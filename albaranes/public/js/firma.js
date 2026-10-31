/* Albaranes · lienzo para firmar con el dedo (albarán y consentimiento). */

import { h } from "./ui.js";

/** Copia la firma a 600 px de ancho: se ve bien en el PDF y pesa poco. */
function firmaReducida(canvas) {
  const ancho = Math.min(600, canvas.width);
  const alto = Math.round((canvas.height * ancho) / canvas.width);
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(canvas, 0, 0, ancho, alto);
  return c.toDataURL("image/png");
}

/**
 * Un lienzo de firma. Devuelve { canvas, borrar, hayTrazo(), imagen() }:
 * imagen() da la firma en PNG (data URL) lista para guardar y para el PDF.
 */
export function lienzoFirma(etiqueta = "Zona de firma") {
  const canvas = h("canvas", { class: "lienzo", "aria-label": etiqueta });
  let ctx;
  let trazo = false;
  let dibujando = false;
  const borrar = () => {
    const ratio = window.devicePixelRatio || 1;
    const ancho = canvas.clientWidth;
    const alto = canvas.clientHeight;
    canvas.width = Math.round(ancho * ratio);
    canvas.height = Math.round(alto * ratio);
    ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0b2340";
    trazo = false;
  };
  const punto = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener("pointerdown", (e) => {
    if (!ctx) borrar();
    dibujando = true;
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = punto(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    trazo = true;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dibujando) return;
    const [x, y] = punto(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  const fin = () => { dibujando = false; };
  canvas.addEventListener("pointerup", fin);
  canvas.addEventListener("pointercancel", fin);
  requestAnimationFrame(borrar);
  // Al girar el móvil cambia el tamaño: si aún no hay firma, se ajusta el lienzo.
  const alGirar = () => {
    if (!canvas.isConnected) { window.removeEventListener("resize", alGirar); return; }
    if (!trazo) borrar();
  };
  window.addEventListener("resize", alGirar);
  return { canvas, borrar, hayTrazo: () => trazo, imagen: () => firmaReducida(canvas) };
}
