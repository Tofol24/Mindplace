/* Albaranes · utilidades de interfaz compartidas por todas las pantallas. */

/** Crea un elemento. Los textos se ponen siempre como texto (nunca como HTML). */
export function h(tag, attrs = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "value") el.value = v;
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

export function campo(etiqueta, input, ayuda) {
  return h("label", { class: "campo" }, h("span", { class: "etq" }, etiqueta), input, ayuda && h("small", {}, ayuda));
}

let avisoTimer;
export function aviso(msg, tipo = "ok") {
  const el = document.getElementById("aviso");
  el.textContent = msg;
  el.className = `toast visible ${tipo}`;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => { el.className = "toast"; }, 3800);
}

export const num = (s) => {
  let t = String(s ?? "").replace(/\s/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", "."); // 1.234,50 → 1234.50
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
};
export const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
export const normal = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export const normalNif = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export const normalTel = (s) => String(s || "").replace(/\D/g, "").slice(-9);

/** Navega a una pantalla (si ya se está en ella, la vuelve a pintar). */
export function ir(ruta) {
  if (location.hash === `#${ruta}`) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = ruta;
}
