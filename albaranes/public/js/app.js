/* Albaranes de obra · app principal.
   ---------------------------------------------------------------------------
   Flujo: nuevo albarán → cliente, trabajo y líneas → firma del cliente →
   queda guardado en el móvil con su PDF → se envía a Holded en cuanto hay
   cobertura (o con el botón «Enviar ahora») → el PDF se comparte por WhatsApp
   o email desde el menú de compartir del móvil.

   Estados de un albarán:
     borrador   · se está escribiendo; se puede cambiar o borrar
     pendiente  · firmado y numerado; espera a enviarse a Holded
     error      · Holded lo ha rechazado (hay que revisar algo); no se reintenta solo
     enviado    · ya está en Holded
*/

import * as db from "./db.js";
import {
  IVAS, fechaCorta, formatoEuros, hoyISO, importeLinea, redondear, telefonoWhatsApp, totales,
} from "./calculos.js";
import { generarPDF, nombrePDF } from "./pdf.js";

const AJUSTES_DEF = {
  negocio: { nombre: "Pere Plomer Bennassar", nif: "", direccion: "", telefono: "", email: "pere.plomer@gmail.com" },
  prefijo: "M",
  precioHora: 35,
  precioDesplazamiento: 20,
  ivaDefecto: 21,
  claveApp: "",
};
let ajustes = structuredClone(AJUSTES_DEF);

const vista = document.getElementById("vista");
const barraEstado = document.getElementById("estado");

// ---------------------------------------------------------------------------
// Utilidades de interfaz
// ---------------------------------------------------------------------------

/** Crea un elemento. Los textos se ponen siempre como texto (nunca como HTML). */
function h(tag, attrs = {}, ...hijos) {
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

function campo(etiqueta, input, ayuda) {
  return h("label", { class: "campo" }, h("span", { class: "etq" }, etiqueta), input, ayuda && h("small", {}, ayuda));
}

let avisoTimer;
function aviso(msg, tipo = "ok") {
  const el = document.getElementById("aviso");
  el.textContent = msg;
  el.className = `toast visible ${tipo}`;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => { el.className = "toast"; }, 3800);
}

const num = (s) => {
  const n = Number(String(s ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
const normal = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const normalNif = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function ir(ruta) {
  if (location.hash === `#${ruta}`) render();
  else location.hash = ruta;
}

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------

async function cargarAjustes() {
  const guardados = await db.leerKV("ajustes", {});
  ajustes = { ...structuredClone(AJUSTES_DEF), ...guardados, negocio: { ...AJUSTES_DEF.negocio, ...(guardados?.negocio || {}) } };
}
const guardarAjustes = () => db.escribirKV("ajustes", ajustes);

function nuevoAlbaran() {
  const ahora = new Date().toISOString();
  return {
    id: uuid(),
    estado: "borrador",
    numero: "",
    fecha: hoyISO(),
    cliente: { holdedId: "", nombre: "", nif: "", telefono: "", email: "", direccion: "", cp: "", poblacion: "" },
    direccionObra: "",
    trabajo: "",
    lineas: [],
    observaciones: "",
    firma: "",
    firmante: "",
    firmadoEn: "",
    holded: null,
    error: "",
    creado: ahora,
    actualizado: ahora,
  };
}

async function guardarAlbaran(alb) {
  alb.actualizado = new Date().toISOString();
  await db.guardar("albaranes", alb);
}

/** Recuerda al cliente en el móvil para autocompletarlo la próxima vez. */
async function recordarCliente(c) {
  if (!c.nombre) return;
  const lista = await db.todos("clientes");
  const existente = lista.find((x) => (c.holdedId && x.holdedId === c.holdedId)
    || (c.nif && normalNif(x.nif) === normalNif(c.nif))
    || (!c.nif && !x.nif && normal(x.nombre) === normal(c.nombre)));
  const datos = { ...(existente || { id: uuid() }), ...c, usado: new Date().toISOString() };
  if (existente?.holdedId && !c.holdedId) datos.holdedId = existente.holdedId;
  await db.guardar("clientes", datos);
}

// ---------------------------------------------------------------------------
// Envío a Holded (cola sin conexión)
// ---------------------------------------------------------------------------

let enviando = false;

function blobABase64(blob) {
  return new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] || "");
    r.onerror = () => ko(r.error);
    r.readAsDataURL(blob);
  });
}

async function llamarAPI(ruta, { method = "GET", body } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(ruta, {
      method,
      headers: { "x-clave-app": ajustes.claveApp, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: "no-store",
    });
    let datos = {};
    try { datos = await res.json(); } catch { /* sin cuerpo */ }
    return { ok: res.ok, status: res.status, datos };
  } finally {
    clearTimeout(t);
  }
}

/** Envía un albarán. Devuelve "ok", "pasajero" (probar más tarde) o "rechazado". */
async function enviarUno(alb) {
  const pdf = await blobABase64(generarPDF(alb, ajustes.negocio));
  const cuerpo = {
    id: alb.id, numero: alb.numero, fecha: alb.fecha, cliente: alb.cliente, direccionObra: alb.direccionObra,
    trabajo: alb.trabajo, observaciones: alb.observaciones, firmante: alb.firmante,
    lineas: alb.lineas.map((l) => ({ concepto: l.concepto, cantidad: l.cantidad, precio: l.precio, iva: l.iva })),
    pdf,
  };
  let r;
  try {
    r = await llamarAPI("/api/holded/enviar", { method: "POST", body: cuerpo });
  } catch {
    alb.error = "Sin conexión. Se enviará cuando haya cobertura.";
    await guardarAlbaran(alb);
    return "pasajero";
  }
  if (r.ok && r.datos.ok) {
    alb.estado = "enviado";
    alb.error = "";
    alb.holded = { contactId: r.datos.contactId, albaranId: r.datos.albaranId, adjunto: r.datos.adjunto, enviadoEn: new Date().toISOString() };
    if (!alb.cliente.holdedId) {
      alb.cliente.holdedId = r.datos.contactId;
      await recordarCliente(alb.cliente);
    }
    await guardarAlbaran(alb);
    return "ok";
  }
  const msg = r.datos.error || `Error ${r.status}`;
  // Sin respuesta de la función (p. ej. 404 de una red cautiva) o fallo pasajero: se reintenta.
  const pasajero = r.datos.reintentar === true || (!r.datos.error && r.status !== 401);
  alb.error = pasajero ? `${msg}. Se reintentará.` : msg;
  if (!pasajero) alb.estado = "error";
  await guardarAlbaran(alb);
  return pasajero ? "pasajero" : "rechazado";
}

/** Envía los pendientes. `manual` también reintenta los que dieron error. */
async function sincronizar({ manual = false } = {}) {
  if (enviando) return;
  if (!navigator.onLine) { if (manual) aviso("No hay cobertura. Se enviará cuando vuelva la señal.", "info"); pintarEstado(); return; }
  if (!ajustes.claveApp) { if (manual) aviso("Primero configura la conexión con Holded en Ajustes.", "error"); pintarEstado(); return; }
  const lista = (await db.todos("albaranes"))
    .filter((a) => a.estado === "pendiente" || (manual && a.estado === "error"))
    .sort((a, b) => a.numero.localeCompare(b.numero));
  if (!lista.length) { if (manual) aviso("No hay nada pendiente de enviar."); pintarEstado(); return; }
  enviando = true;
  pintarEstado();
  let enviados = 0;
  let parar = false;
  try {
    for (const alb of lista) {
      if (alb.estado === "error") alb.estado = "pendiente";
      const r = await enviarUno(alb);
      if (r === "ok") enviados++;
      if (r === "pasajero") { parar = true; break; }
    }
  } finally {
    enviando = false;
  }
  if (enviados) aviso(enviados === 1 ? "Albarán enviado a Holded ✓" : `${enviados} albaranes enviados a Holded ✓`);
  else if (manual && parar) aviso("No se ha podido enviar ahora. Se reintentará solo.", "info");
  pintarEstado();
  refrescarSiProcede();
}

async function pintarEstado() {
  const lista = await db.todos("albaranes");
  const pendientes = lista.filter((a) => a.estado === "pendiente").length;
  const errores = lista.filter((a) => a.estado === "error").length;
  let texto, clase;
  if (enviando) { texto = "Enviando a Holded…"; clase = "enviando"; }
  else if (!navigator.onLine) { texto = pendientes ? `Sin cobertura · ${pendientes} por enviar` : "Sin cobertura"; clase = "offline"; }
  else if (!ajustes.claveApp) { texto = "Holded sin configurar"; clase = "aviso"; }
  else if (errores) { texto = `${errores} para revisar`; clase = "error"; }
  else if (pendientes) { texto = `${pendientes} por enviar`; clase = "aviso"; }
  else { texto = "Todo en Holded"; clase = "ok"; }
  barraEstado.textContent = texto;
  barraEstado.className = `estado ${clase}`;
}

// Si se está viendo la lista o un albarán, se repinta para reflejar el envío.
function refrescarSiProcede() {
  const r = location.hash.slice(1) || "/";
  if (r === "/" || r.startsWith("/albaran/")) render();
}

// ---------------------------------------------------------------------------
// Compartir el PDF
// ---------------------------------------------------------------------------

function mensajeCliente(alb) {
  const nombre = alb.cliente.nombre.split(" ")[0] || "";
  return `Hola${nombre ? ` ${nombre}` : ""}, te envío el albarán ${alb.numero} del trabajo realizado el ${fechaCorta(alb.fecha)}. Total: ${formatoEuros(totales(alb.lineas).total)}. Gracias.${ajustes.negocio.nombre ? `\n${ajustes.negocio.nombre}` : ""}`;
}

function ficheroPDF(alb) {
  return new File([generarPDF(alb, ajustes.negocio)], nombrePDF(alb), { type: "application/pdf" });
}

async function compartirPDF(alb) {
  const fichero = ficheroPDF(alb);
  if (navigator.canShare && navigator.canShare({ files: [fichero] })) {
    try {
      await navigator.share({ files: [fichero], title: `Albarán ${alb.numero}`, text: mensajeCliente(alb) });
    } catch (e) {
      if (e?.name !== "AbortError") aviso("No se ha podido compartir. Prueba a descargar el PDF.", "error");
    }
    return;
  }
  descargar(fichero);
  aviso("Este navegador no deja compartir archivos: se ha descargado el PDF para adjuntarlo.", "info");
}

function descargar(fichero) {
  const url = URL.createObjectURL(fichero);
  const a = h("a", { href: url, download: fichero.name, target: "_blank", rel: "noopener" });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ---------------------------------------------------------------------------
// Vistas
// ---------------------------------------------------------------------------

const ETIQUETA_ESTADO = { borrador: "Borrador", pendiente: "Por enviar", error: "Revisar", enviado: "En Holded ✓" };

async function vistaLista() {
  const lista = (await db.todos("albaranes")).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  const avisos = [];
  if (!ajustes.negocio.nif || !ajustes.claveApp) {
    avisos.push(h("div", { class: "tarjeta aviso-tarjeta" },
      h("strong", {}, "Primer paso: tus datos"),
      h("p", {}, "Revisa tus datos (falta el NIF para el PDF) y conecta Holded con la clave de la app."),
      h("button", { class: "btn secundario", onclick: () => ir("/ajustes") }, "Ir a Ajustes")));
  }
  return [
    ...avisos,
    h("button", { class: "btn principal grande", onclick: async () => { const a = nuevoAlbaran(); await guardarAlbaran(a); ir(`/editar/${a.id}`); } }, "+ Nuevo albarán"),
    lista.length
      ? h("ul", { class: "lista" }, lista.map((a) => h("li", {},
        h("button", { class: "fila", onclick: () => ir(a.estado === "borrador" ? `/editar/${a.id}` : `/albaran/${a.id}`) },
          h("div", { class: "fila-principal" },
            h("strong", {}, a.cliente.nombre || "Sin cliente"),
            h("span", { class: `chip ${a.estado}` }, ETIQUETA_ESTADO[a.estado])),
          h("div", { class: "fila-sec" },
            h("span", {}, `${a.numero || "Sin número"} · ${fechaCorta(a.fecha)}`),
            h("span", {}, formatoEuros(totales(a.lineas).total)))))))
      : h("p", { class: "vacio" }, "Todavía no hay albaranes. Pulsa «Nuevo albarán» cuando estés con un cliente."),
  ];
}

// --- Editor ---------------------------------------------------------------

async function vistaEditor(alb) {
  if (alb.estado !== "borrador") { ir(`/albaran/${alb.id}`); return []; }
  let guardarTimer;
  const cambiado = () => {
    clearTimeout(guardarTimer);
    guardarTimer = setTimeout(() => guardarAlbaran(alb), 400);
    pintarTotales();
  };
  const entrada = (obj, clave, attrs = {}) => h("input", {
    value: obj[clave] ?? "", ...attrs,
    oninput: (e) => { obj[clave] = e.target.value; cambiado(); },
  });

  // Cliente con sugerencias (del móvil y, con cobertura, de Holded)
  const c = alb.cliente;
  const sugerencias = h("div", { class: "sugerencias" });
  const chipHolded = h("div", { class: "chip-holded" });
  const pintarChip = () => {
    chipHolded.replaceChildren(c.holdedId ? h("span", { class: "chip enviado" }, "Cliente de Holded") : "");
  };
  const camposCliente = {};
  const rellenarCliente = (x) => {
    for (const k of Object.keys(c)) c[k] = x[k] || "";
    for (const [k, el] of Object.entries(camposCliente)) el.value = c[k];
    sugerencias.replaceChildren();
    pintarChip();
    cambiado();
  };
  let buscarTimer;
  let consulta = 0;
  const buscarClientes = async (q) => {
    const yo = ++consulta;
    const nq = normal(q);
    if (!nq) { sugerencias.replaceChildren(); return; }
    const locales = (await db.todos("clientes"))
      .filter((x) => normal(x.nombre).includes(nq))
      .sort((a, b) => (b.usado || "").localeCompare(a.usado || ""))
      .slice(0, 6);
    const pinta = (remotos = []) => {
      if (yo !== consulta) return;
      const vistos = new Set(locales.map((x) => x.holdedId).filter(Boolean));
      const todos = [...locales.map((x) => ({ ...x, origen: "En el móvil" })), ...remotos.filter((x) => !vistos.has(x.holdedId)).map((x) => ({ ...x, origen: "Holded" }))];
      sugerencias.replaceChildren(...todos.slice(0, 10).map((x) => h("button", {
        type: "button", class: "sugerencia",
        onclick: () => { const { id, usado, origen, ...datos } = x; rellenarCliente({ ...c, ...datos }); },
      }, h("strong", {}, x.nombre), h("small", {}, [x.nif, x.poblacion, x.origen].filter(Boolean).join(" · ")))));
    };
    pinta();
    if (navigator.onLine && ajustes.claveApp && nq.length >= 2) {
      clearTimeout(buscarTimer);
      buscarTimer = setTimeout(async () => {
        try {
          const r = await llamarAPI(`/api/holded/clientes?q=${encodeURIComponent(q.trim())}`);
          if (r.ok) pinta(r.datos.clientes || []);
        } catch { /* sin red: basta con los del móvil */ }
      }, 350);
    }
  };
  const inputNombre = h("input", {
    value: c.nombre, autocomplete: "off", placeholder: "Nombre o empresa",
    oninput: (e) => { c.nombre = e.target.value; c.holdedId = ""; pintarChip(); cambiado(); buscarClientes(e.target.value); },
    onblur: () => setTimeout(() => sugerencias.replaceChildren(), 250),
  });
  camposCliente.nombre = inputNombre;
  const campoCliente = (clave, etiqueta, attrs = {}) => {
    const el = entrada(c, clave, attrs);
    camposCliente[clave] = el;
    return campo(etiqueta, el);
  };
  pintarChip();

  // Líneas
  const contLineas = h("div", { class: "lineas" });
  const contTotales = h("div", { class: "totales" });
  function pintarTotales() {
    const t = totales(alb.lineas);
    contTotales.replaceChildren(
      h("div", {}, h("span", {}, "Base"), h("span", {}, formatoEuros(t.base))),
      ...t.desglose.map((d) => h("div", {}, h("span", {}, `IVA ${d.iva}%`), h("span", {}, formatoEuros(d.cuota)))),
      h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, formatoEuros(t.total))),
    );
  }
  const conceptosConocidos = new Map();
  for (const a of await db.todos("albaranes")) for (const l of a.lineas) if (l.concepto) conceptosConocidos.set(l.concepto, l.precio);
  const datalist = h("datalist", { id: "conceptos" }, [...conceptosConocidos.keys()].slice(0, 200).map((k) => h("option", { value: k })));

  function pintarLineas() {
    contLineas.replaceChildren(...alb.lineas.map((l, i) => {
      const importe = h("strong", { class: "importe" }, formatoEuros(importeLinea(l)));
      const precio = h("input", {
        inputmode: "decimal", value: l.precio ? String(l.precio).replace(".", ",") : "", placeholder: "0,00",
        oninput: (e) => { l.precio = redondear(num(e.target.value)); importe.textContent = formatoEuros(importeLinea(l)); cambiado(); },
      });
      return h("div", { class: "linea" },
        h("div", { class: "linea-cab" },
          h("input", {
            class: "concepto", value: l.concepto, list: "conceptos", placeholder: "Concepto (p. ej. Grifo monomando)",
            oninput: (e) => {
              l.concepto = e.target.value;
              if (!l.precio && conceptosConocidos.has(l.concepto)) {
                l.precio = conceptosConocidos.get(l.concepto);
                precio.value = String(l.precio).replace(".", ",");
                importe.textContent = formatoEuros(importeLinea(l));
              }
              cambiado();
            },
          }),
          h("button", { type: "button", class: "btn-icono", "aria-label": "Quitar línea", onclick: () => { alb.lineas.splice(i, 1); pintarLineas(); cambiado(); } }, "✕")),
        h("div", { class: "linea-num" },
          campo(l.unidad === "h" ? "Horas" : "Cantidad", h("input", {
            inputmode: "decimal", value: String(l.cantidad).replace(".", ","),
            oninput: (e) => { l.cantidad = num(e.target.value); importe.textContent = formatoEuros(importeLinea(l)); cambiado(); },
          })),
          campo("Precio €", precio),
          campo("IVA", h("select", { onchange: (e) => { l.iva = Number(e.target.value); cambiado(); } },
            IVAS.map((v) => h("option", { value: v, selected: v === l.iva }, `${v}%`)))),
          importe));
    }));
  }
  const anadir = (l) => {
    alb.lineas.push({ concepto: "", cantidad: 1, precio: 0, iva: ajustes.ivaDefecto, ...l });
    pintarLineas();
    cambiado();
    contLineas.lastElementChild?.querySelector(".concepto")?.focus();
  };
  pintarLineas();
  pintarTotales();

  const error = h("p", { class: "error-form", role: "alert" });
  const irAFirma = async () => {
    const fallos = [];
    if (!c.nombre.trim()) fallos.push("el nombre del cliente");
    if (!alb.lineas.length) fallos.push("al menos una línea");
    if (alb.lineas.some((l) => !l.concepto.trim())) fallos.push("el concepto de todas las líneas");
    if (alb.lineas.some((l) => !(l.cantidad > 0))) fallos.push("una cantidad mayor que cero en cada línea");
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) fallos.push("un email del cliente válido");
    if (fallos.length) { error.textContent = `Falta ${fallos.join(", ")}.`; return; }
    clearTimeout(guardarTimer);
    await guardarAlbaran(alb);
    ir(`/firmar/${alb.id}`);
  };

  const inputObra = entrada(alb, "direccionObra", { placeholder: "Calle, número, piso…" });
  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: async () => { clearTimeout(guardarTimer); await guardarAlbaran(alb); ir("/"); } }, "‹ Albaranes"),
      h("h2", {}, "Nuevo albarán")),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Cliente"),
      h("div", { class: "campo-busqueda" }, campo("Nombre", inputNombre), sugerencias),
      chipHolded,
      h("div", { class: "rejilla" },
        campoCliente("telefono", "Teléfono", { inputmode: "tel", autocomplete: "off" }),
        campoCliente("email", "Email", { type: "email", inputmode: "email", autocomplete: "off" })),
      h("details", { class: "mas", open: !!(c.nif || c.direccion) },
        h("summary", {}, "NIF y dirección del cliente"),
        campoCliente("nif", "NIF / CIF", { autocapitalize: "characters" }),
        campoCliente("direccion", "Dirección"),
        h("div", { class: "rejilla" }, campoCliente("cp", "C. P.", { inputmode: "numeric" }), campoCliente("poblacion", "Población")))),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Trabajo"),
      h("div", { class: "rejilla" },
        campo("Fecha", entrada(alb, "fecha", { type: "date" })),
        h("div")),
      campo("Dirección de la obra", inputObra),
      h("button", {
        type: "button", class: "btn enlace",
        onclick: () => { alb.direccionObra = [c.direccion, [c.cp, c.poblacion].filter(Boolean).join(" ")].filter(Boolean).join(", "); inputObra.value = alb.direccionObra; cambiado(); },
      }, "Usar la dirección del cliente"),
      campo("Trabajo realizado", h("textarea", {
        rows: 4, placeholder: "Qué se ha hecho: avería, reparación, instalación…",
        oninput: (e) => { alb.trabajo = e.target.value; cambiado(); },
      }, alb.trabajo))),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Material y mano de obra"),
      datalist,
      contLineas,
      h("div", { class: "botones-linea" },
        h("button", { type: "button", class: "btn secundario", onclick: () => anadir({}) }, "+ Material"),
        h("button", { type: "button", class: "btn secundario", onclick: () => anadir({ concepto: "Mano de obra", precio: ajustes.precioHora, unidad: "h" }) }, "+ Mano de obra"),
        h("button", { type: "button", class: "btn secundario", onclick: () => anadir({ concepto: "Desplazamiento", precio: ajustes.precioDesplazamiento }) }, "+ Desplazamiento")),
      contTotales),
    h("section", { class: "tarjeta" },
      campo("Observaciones (opcional)", h("textarea", {
        rows: 2, placeholder: "Garantía, piezas pendientes, próxima visita…",
        oninput: (e) => { alb.observaciones = e.target.value; cambiado(); },
      }, alb.observaciones))),
    error,
    h("div", { class: "acciones" },
      h("button", { class: "btn principal grande", onclick: irAFirma }, "Siguiente: firma del cliente ›"),
      h("button", {
        class: "btn peligro",
        onclick: async () => { if (confirm("¿Borrar este borrador?")) { clearTimeout(guardarTimer); await db.borrar("albaranes", alb.id); ir("/"); } },
      }, "Borrar borrador")),
  ];
}

// --- Firma ----------------------------------------------------------------

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

function vistaFirma(alb) {
  if (alb.estado !== "borrador") { ir(`/albaran/${alb.id}`); return []; }
  const canvas = h("canvas", { class: "lienzo", "aria-label": "Zona de firma" });
  let ctx;
  let hayTrazo = false;
  let dibujando = false;
  const preparar = () => {
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
    hayTrazo = false;
  };
  const punto = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener("pointerdown", (e) => {
    dibujando = true;
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = punto(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    hayTrazo = true;
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
  requestAnimationFrame(preparar);

  const firmante = h("input", { value: alb.firmante || alb.cliente.nombre, placeholder: "Nombre de quien firma" });
  const error = h("p", { class: "error-form", role: "alert" });
  const t = totales(alb.lineas);
  let terminando = false;

  const terminar = async () => {
    if (terminando) return;
    if (!hayTrazo) { error.textContent = "Falta la firma del cliente."; return; }
    terminando = true;
    try {
      const anio = alb.fecha.slice(0, 4);
      alb.firma = firmaReducida(canvas);
      alb.firmante = firmante.value.trim();
      alb.firmadoEn = new Date().toISOString();
      alb.numero = await db.siguienteNumero(ajustes.prefijo, anio);
      alb.estado = "pendiente";
      await guardarAlbaran(alb);
      await recordarCliente(alb.cliente);
      ir(`/albaran/${alb.id}`);
      sincronizar();
    } catch {
      terminando = false;
      error.textContent = "No se ha podido guardar. Inténtalo otra vez.";
    }
  };

  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir(`/editar/${alb.id}`) }, "‹ Volver"),
      h("h2", {}, "Firma del cliente")),
    h("section", { class: "tarjeta resumen" },
      h("div", {}, h("span", {}, "Cliente"), h("strong", {}, alb.cliente.nombre)),
      h("div", {}, h("span", {}, "Líneas"), h("strong", {}, String(alb.lineas.length))),
      h("div", { class: "total" }, h("span", {}, "Total con IVA"), h("strong", {}, formatoEuros(t.total)))),
    h("p", { class: "ayuda" }, "Pásale el móvil al cliente para que firme con el dedo."),
    canvas,
    h("button", { type: "button", class: "btn enlace", onclick: preparar }, "Borrar firma"),
    campo("Nombre de quien firma", firmante),
    error,
    h("div", { class: "acciones" },
      h("button", { class: "btn principal grande", onclick: terminar }, "Firmar y guardar")),
  ];
}

// --- Detalle --------------------------------------------------------------

function vistaDetalle(alb) {
  if (alb.estado === "borrador") { ir(`/editar/${alb.id}`); return []; }
  const t = totales(alb.lineas);
  const c = alb.cliente;
  const tel = telefonoWhatsApp(c.telefono);

  const estadoHolded = {
    pendiente: h("div", { class: "tarjeta estado-alb aviso" },
      h("strong", {}, navigator.onLine ? "Pendiente de enviar a Holded" : "Guardado en el móvil · sin cobertura"),
      h("p", {}, alb.error || "Se enviará solo en cuanto haya conexión. No hace falta que hagas nada."),
      h("button", { class: "btn secundario", onclick: () => sincronizar({ manual: true }) }, "Enviar ahora")),
    error: h("div", { class: "tarjeta estado-alb error" },
      h("strong", {}, "Holded no lo ha aceptado"),
      h("p", {}, alb.error),
      h("button", { class: "btn secundario", onclick: () => sincronizar({ manual: true }) }, "Volver a intentarlo")),
    enviado: h("div", { class: "tarjeta estado-alb ok" },
      h("strong", {}, "Ya está en Holded ✓"),
      h("p", {}, `Enviado el ${new Date(alb.holded?.enviadoEn || alb.actualizado).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}. En Holded, ve a Ventas → Albaranes para convertirlo en factura.`)),
  }[alb.estado];

  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir("/") }, "‹ Albaranes"),
      h("h2", {}, `Albarán ${alb.numero}`)),
    estadoHolded,
    h("section", { class: "tarjeta" },
      h("h3", {}, "Enviar al cliente"),
      h("button", { class: "btn principal grande", onclick: () => compartirPDF(alb) }, "Enviar PDF (WhatsApp, email…)"),
      h("div", { class: "botones-linea" },
        h("button", { class: "btn secundario", onclick: () => descargar(ficheroPDF(alb)) }, "Ver / descargar PDF"),
        tel && h("a", { class: "btn secundario", href: `https://wa.me/${tel}?text=${encodeURIComponent(mensajeCliente(alb))}`, target: "_blank", rel: "noopener" }, "WhatsApp (solo texto)"),
        c.email && h("a", { class: "btn secundario", href: `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(`Albarán ${alb.numero}`)}&body=${encodeURIComponent(mensajeCliente(alb))}` }, "Email (solo texto)")),
      h("small", { class: "ayuda" }, "«Enviar PDF» abre el menú de compartir del móvil: elige WhatsApp o Correo y el PDF va adjunto.")),
    h("section", { class: "tarjeta" },
      h("h3", {}, c.nombre),
      h("p", { class: "ayuda" }, [fechaCorta(alb.fecha), alb.direccionObra].filter(Boolean).join(" · ")),
      alb.trabajo && h("p", { class: "texto-trabajo" }, alb.trabajo),
      h("ul", { class: "lineas-lectura" }, alb.lineas.map((l) => h("li", {},
        h("span", {}, `${l.concepto} × ${String(l.cantidad).replace(".", ",")}`),
        h("span", {}, formatoEuros(importeLinea(l)))))),
      h("div", { class: "totales" },
        h("div", {}, h("span", {}, "Base"), h("span", {}, formatoEuros(t.base))),
        ...t.desglose.map((d) => h("div", {}, h("span", {}, `IVA ${d.iva}%`), h("span", {}, formatoEuros(d.cuota)))),
        h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, formatoEuros(t.total)))),
      alb.firma && h("img", { class: "firma-mini", src: alb.firma, alt: `Firma de ${alb.firmante || c.nombre}` })),
    h("div", { class: "acciones" },
      h("button", {
        class: "btn secundario",
        onclick: async () => {
          const n = nuevoAlbaran();
          n.cliente = { ...alb.cliente };
          n.direccionObra = alb.direccionObra;
          n.trabajo = alb.trabajo;
          n.lineas = alb.lineas.map((l) => ({ ...l }));
          await guardarAlbaran(n);
          ir(`/editar/${n.id}`);
        },
      }, "Duplicar como nuevo albarán")),
  ];
}

// --- Ajustes --------------------------------------------------------------

async function vistaAjustes() {
  const n = ajustes.negocio;
  const ent = (obj, clave, attrs = {}) => h("input", { value: obj[clave] ?? "", ...attrs, oninput: (e) => { obj[clave] = e.target.value; } });
  const anio = hoyISO().slice(0, 4);
  const contador = await db.leerKV("contador", null);
  const siguiente = contador && contador.anio === anio ? contador.n : 1;
  const inputPrefijo = h("input", { value: ajustes.prefijo, maxlength: 8, autocapitalize: "characters" });
  const inputSiguiente = h("input", { value: String(siguiente), inputmode: "numeric" });
  const inputHora = h("input", { value: String(ajustes.precioHora).replace(".", ","), inputmode: "decimal" });
  const inputDesp = h("input", { value: String(ajustes.precioDesplazamiento).replace(".", ","), inputmode: "decimal" });
  const selIva = h("select", {}, IVAS.map((v) => h("option", { value: v, selected: v === ajustes.ivaDefecto }, `${v}%`)));
  const inputClave = h("input", { value: ajustes.claveApp, type: "password", autocomplete: "off" });
  const resultadoPrueba = h("p", { class: "ayuda" });
  const ejemplo = h("small", {});
  const pintarEjemplo = () => { ejemplo.textContent = `El próximo albarán será ${inputPrefijo.value.trim() || "M"}-${anio}-${String(Math.max(1, parseInt(inputSiguiente.value, 10) || 1)).padStart(4, "0")}`; };
  inputPrefijo.addEventListener("input", pintarEjemplo);
  inputSiguiente.addEventListener("input", pintarEjemplo);
  pintarEjemplo();

  const guardar = async () => {
    const prefijo = inputPrefijo.value.trim().toUpperCase();
    if (!/^[A-Z0-9]{1,8}$/.test(prefijo)) { aviso("El prefijo solo puede tener letras y números (máximo 8).", "error"); return false; }
    const sig = parseInt(inputSiguiente.value, 10);
    if (!(sig >= 1 && sig < 100000)) { aviso("El próximo número no es válido.", "error"); return false; }
    ajustes.prefijo = prefijo;
    ajustes.precioHora = redondear(num(inputHora.value));
    ajustes.precioDesplazamiento = redondear(num(inputDesp.value));
    ajustes.ivaDefecto = Number(selIva.value);
    ajustes.claveApp = inputClave.value.trim();
    for (const k of Object.keys(n)) n[k] = String(n[k] || "").trim();
    await guardarAjustes();
    if (sig !== siguiente) await db.escribirKV("contador", { anio, n: sig });
    pintarEstado();
    return true;
  };

  const probar = async () => {
    if (!(await guardar())) return;
    if (!ajustes.claveApp) { resultadoPrueba.textContent = "Escribe primero la clave de la app."; return; }
    if (!navigator.onLine) { resultadoPrueba.textContent = "Ahora no hay conexión. Pruébalo con cobertura."; return; }
    resultadoPrueba.textContent = "Comprobando…";
    try {
      const r = await llamarAPI("/api/holded/estado");
      resultadoPrueba.textContent = r.ok ? "✓ Conectado con Holded." : `✗ ${r.datos.error || `Error ${r.status}`}`;
      if (r.ok) sincronizar();
    } catch {
      resultadoPrueba.textContent = "✗ No se ha podido conectar.";
    }
  };

  const copia = async () => {
    const datos = { app: "albaranes-obra", version: 1, exportado: new Date().toISOString(), ajustes: { ...ajustes, claveApp: "" }, albaranes: await db.todos("albaranes"), clientes: await db.todos("clientes") };
    descargar(new File([JSON.stringify(datos, null, 1)], `copia-albaranes-${hoyISO()}.json`, { type: "application/json" }));
  };

  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: async () => { if (await guardar()) ir("/"); } }, "‹ Albaranes"),
      h("h2", {}, "Ajustes")),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Tu negocio (sale en el PDF)"),
      campo("Nombre o razón social", ent(n, "nombre")),
      campo("NIF", ent(n, "nif", { autocapitalize: "characters" })),
      campo("Dirección", ent(n, "direccion")),
      h("div", { class: "rejilla" }, campo("Teléfono", ent(n, "telefono", { inputmode: "tel" })), campo("Email", ent(n, "email", { type: "email" })))),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Numeración y precios"),
      h("div", { class: "rejilla" }, campo("Prefijo", inputPrefijo), campo("Próximo número", inputSiguiente)),
      ejemplo,
      h("small", { class: "ayuda" }, "Usa un prefijo distinto al de tus series de Holded (por ejemplo M), para que no choquen los números."),
      h("div", { class: "rejilla" }, campo("Precio hora €", inputHora), campo("Desplazamiento €", inputDesp)),
      campo("IVA por defecto", selIva, "21% general. 10% en reparaciones de vivienda particular cuando se cumplen los requisitos.")),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Conexión con Holded"),
      campo("Clave de la app", inputClave, "La misma que pusiste en Netlify como APP_CLAVE."),
      h("button", { class: "btn secundario", onclick: probar }, "Guardar y probar conexión"),
      resultadoPrueba),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Copia de seguridad"),
      h("p", { class: "ayuda" }, "Los albaranes se guardan en este móvil. Descarga una copia de vez en cuando."),
      h("button", { class: "btn secundario", onclick: copia }, "Descargar copia (JSON)")),
    h("div", { class: "acciones" }, h("button", { class: "btn principal grande", onclick: async () => { if (await guardar()) { aviso("Ajustes guardados ✓"); ir("/"); } } }, "Guardar")),
  ];
}

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

let renderId = 0;
async function render() {
  const yo = ++renderId;
  const ruta = location.hash.slice(1) || "/";
  const [, seccion, id] = ruta.split("/");
  let contenido;
  if (seccion === "ajustes") contenido = await vistaAjustes();
  else if (["editar", "firmar", "albaran"].includes(seccion)) {
    const alb = await db.obtener("albaranes", id);
    if (!alb) { ir("/"); return; }
    contenido = seccion === "editar" ? await vistaEditor(alb) : seccion === "firmar" ? vistaFirma(alb) : vistaDetalle(alb);
  } else contenido = await vistaLista();
  if (yo !== renderId) return; // otra navegación más reciente ya está pintando
  vista.replaceChildren(...contenido);
  document.getElementById("btn-ajustes").hidden = seccion === "ajustes";
  // Al repintar la misma pantalla (p. ej. tras un envío) no se pierde la posición.
  if (vista.dataset.ruta !== ruta) window.scrollTo(0, 0);
  vista.dataset.ruta = ruta;
}

async function iniciar() {
  await cargarAjustes();
  db.pedirPersistencia();
  document.getElementById("btn-ajustes").addEventListener("click", () => ir("/ajustes"));
  barraEstado.addEventListener("click", () => sincronizar({ manual: true }));
  window.addEventListener("hashchange", render);
  window.addEventListener("online", () => { pintarEstado(); sincronizar(); });
  window.addEventListener("offline", pintarEstado);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") sincronizar(); });
  setInterval(() => sincronizar(), 60000);
  await render();
  pintarEstado();
  sincronizar();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

iniciar();
