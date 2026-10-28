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
  IVAS, fechaCortaSegura as fechaCorta, fechaValida, formatoCantidad, formatoEuros, hoyISO, importeLinea, redondear, telefonoWhatsApp, totales,
} from "./calculos.js";
import { generarPDF, nombrePDF } from "./pdf.js";
import { aviso, campo, h, ir, normal, normalNif, normalTel, num, uuid } from "./ui.js";
import { articulosOrdenados, precioVenta, vistaArticulo, vistaCatalogo } from "./catalogo.js";
import { leerComprasPendientes, vistaCompra, vistaCompras } from "./compras.js";
import { aplicarDictadosPendientes, panelDictado } from "./voz.js";

const AJUSTES_DEF = {
  negocio: { nombre: "Pere Plomer Bennassar", nif: "", direccion: "", telefono: "", email: "pere.plomer@gmail.com" },
  prefijo: "M",
  precioHora: 35,
  precioDesplazamiento: 20,
  ivaDefecto: 21,
  margen: 30,
  claveApp: "",
};
let ajustes = structuredClone(AJUSTES_DEF);

const vista = document.getElementById("vista");
const barraEstado = document.getElementById("estado");
const pestanas = document.getElementById("pestanas");

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

/** Coste, venta y ganancia del material del catálogo de un albarán (null si no tiene). */
function margenAlbaran(alb) {
  const conCoste = alb.lineas.filter((l) => l.articuloId && l.coste != null);
  if (!conCoste.length) return null;
  const coste = redondear(conCoste.reduce((s, l) => s + l.coste * (Number(l.cantidad) || 0), 0));
  const venta = redondear(conCoste.reduce((s, l) => s + importeLinea(l), 0));
  return { coste, venta, ganancia: redondear(venta - coste) };
}

/** Guardado automático del borrador: si falla, se avisa (no se pierde en silencio). */
async function autoguardar(alb) {
  try {
    alb.actualizado = new Date().toISOString();
    if (!(await db.guardarBorrador(alb))) {
      aviso("Este albarán ya se ha firmado en otra ventana: no se han guardado estos cambios.", "error");
      ir(`/albaran/${alb.id}`);
      return false;
    }
    return true;
  } catch {
    aviso("⚠ No se ha podido guardar el borrador. No cierres la app y vuelve a intentarlo.", "error");
    return false;
  }
}

/** Recuerda al cliente en el móvil para autocompletarlo la próxima vez. */
async function recordarCliente(c) {
  if (!c.nombre) return;
  const lista = await db.todos("clientes");
  // Igual que en el servidor: el nombre solo no identifica a nadie (puede haber homónimos).
  const mismoContacto = (x) => (!!c.email && normal(x.email) === normal(c.email))
    || (normalTel(c.telefono).length === 9 && normalTel(x.telefono) === normalTel(c.telefono));
  const existente = lista.find((x) => (c.holdedId && x.holdedId === c.holdedId)
    || (c.nif && normalNif(x.nif) === normalNif(c.nif))
    || (!c.nif && !x.nif && normal(x.nombre) === normal(c.nombre) && mismoContacto(x)));
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
  const pdf = await blobABase64(generarPDF(alb, negocioDe(alb)));
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
  // Solo se marca «Revisar» si el problema es de este albarán. Si es de la conexión
  // (clave, permisos, Holded caído, red cautiva…) sigue en cola y se para la ronda.
  if (r.datos.delAlbaran) {
    alb.estado = "error";
    alb.error = msg;
    alb.yaEnHolded = !!r.datos.yaEnHolded;
    await guardarAlbaran(alb);
    return "rechazado";
  }
  alb.error = r.datos.reintentar === false ? msg : `${msg}. Se reintentará.`;
  await guardarAlbaran(alb);
  return r.datos.reintentar === false ? "conexion" : "pasajero";
}

/** Envía los pendientes. `manual` también reintenta los que dieron error. */
async function sincronizar({ manual = false } = {}) {
  if (enviando) return;
  if (!navigator.onLine) { if (manual) aviso("No hay cobertura. Se enviará cuando vuelva la señal.", "info"); pintarEstado(); return; }
  if (!ajustes.claveApp) { if (manual) aviso("Primero configura la conexión con Holded en Ajustes.", "error"); pintarEstado(); return; }
  // El cerrojo se pone antes de cualquier espera: dos rondas a la vez enviarían el mismo albarán.
  enviando = true;
  let enviados = 0;
  let parada = "";
  try {
    const lista = (await db.todos("albaranes"))
      .filter((a) => a.estado === "pendiente" || (manual && a.estado === "error"))
      .sort((a, b) => a.numero.localeCompare(b.numero));
    if (!lista.length) { if (manual) aviso("No hay nada pendiente de enviar."); return; }
    pintarEstado();
    for (const { id } of lista) {
      // Se relee justo antes de enviarlo: mientras la ronda envía otros, este pudo reabrirse para corregirlo.
      const alb = await db.obtener("albaranes", id);
      if (!alb || !(alb.estado === "pendiente" || (manual && alb.estado === "error"))) continue;
      if (alb.estado === "error") alb.estado = "pendiente";
      const r = await enviarUno(alb);
      if (r === "ok") enviados++;
      if (r === "pasajero" || r === "conexion") { parada = r === "conexion" ? alb.error : "pasajero"; break; }
    }
  } catch {
    parada = "pasajero";
  } finally {
    enviando = false;
  }
  if (enviados) aviso(enviados === 1 ? "Albarán enviado a Holded ✓" : `${enviados} albaranes enviados a Holded ✓`);
  else if (parada && parada !== "pasajero") aviso(`Holded: ${parada}`, "error");
  else if (manual && parada) aviso("No se ha podido enviar ahora. Se reintentará solo.", "info");
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

/** Lo que necesitan las pantallas de compras, catálogo y dictado. */
const ctx = {
  ajustes: () => ajustes,
  llamarAPI: (...a) => llamarAPI(...a),
  descargar: (f) => descargar(f),
  // Repinta solo si se está viendo esa pantalla (o su lista).
  refrescar: (ruta) => {
    const r = location.hash.slice(1) || "/";
    if (r === ruta || (ruta.startsWith("/compra/") && r === "/compras")) render();
  },
};

/** Lecturas con IA que quedaron pendientes sin cobertura (fotos de compras y dictados). */
let iaEnMarcha = false;
async function tareasIA() {
  if (iaEnMarcha) return;
  iaEnMarcha = true;
  try {
    await leerComprasPendientes(ctx);
    await aplicarDictadosPendientes(ctx);
  } catch { /* se reintenta en la próxima ronda */ } finally {
    iaEnMarcha = false;
  }
}

// ---------------------------------------------------------------------------
// Compartir el PDF
// ---------------------------------------------------------------------------

function mensajeCliente(alb) {
  const nombre = alb.cliente.nombre.split(" ")[0] || "";
  return `Hola${nombre ? ` ${nombre}` : ""}, te envío el albarán ${alb.numero} del trabajo realizado el ${fechaCorta(alb.fecha)}. Total: ${formatoEuros(totales(alb.lineas).total)}. Gracias.${ajustes.negocio.nombre ? `\n${ajustes.negocio.nombre}` : ""}`;
}

// Los datos del negocio se congelan al firmar: el PDF del cliente y el de Holded son el mismo.
const negocioDe = (alb) => alb.negocio || ajustes.negocio;

function ficheroPDF(alb) {
  return new File([generarPDF(alb, negocioDe(alb))], nombrePDF(alb), { type: "application/pdf" });
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
  // En el iPhone, con la app instalada, abrir un archivo deja atrapado en un visor sin salida:
  // allí se usa el menú de compartir (que también permite verlo y guardarlo en Archivos).
  if (navigator.standalone && navigator.canShare?.({ files: [fichero] })) {
    navigator.share({ files: [fichero] }).catch(() => {});
    return;
  }
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
  const instalada = navigator.standalone || matchMedia("(display-mode: standalone)").matches;
  if (!instalada) {
    avisos.push(h("div", { class: "tarjeta aviso-tarjeta" },
      h("strong", {}, "Instálala en la pantalla de inicio"),
      h("p", {}, "Usada desde el navegador, el iPhone puede borrar los albaranes guardados si pasan unos días sin abrirla. iPhone: Compartir → «Añadir a pantalla de inicio». Android: menú ⋮ → «Instalar app».")));
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
    guardarTimer = setTimeout(() => autoguardar(alb), 400);
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
    // Solo se cierran si el foco sale del nombre y de las sugerencias (así funcionan con teclado).
    onblur: (e) => { if (!sugerencias.contains(e.relatedTarget)) setTimeout(() => sugerencias.replaceChildren(), 250); },
  });
  camposCliente.nombre = inputNombre;
  const campoCliente = (clave, etiqueta, attrs = {}) => {
    const el = entrada(c, clave, attrs);
    // Otro NIF, email o teléfono puede ser otra persona (sobre todo sin NIF): deja de valer
    // la ficha de Holded elegida y el servidor vuelve a buscarla con los datos nuevos.
    if (["nif", "email", "telefono"].includes(clave)) el.addEventListener("input", () => { c.holdedId = ""; pintarChip(); });
    camposCliente[clave] = el;
    return campo(etiqueta, el);
  };
  pintarChip();

  // Líneas
  const contLineas = h("div", { class: "lineas" });
  const contTotales = h("div", { class: "totales" });
  function pintarTotales() {
    const t = totales(alb.lineas);
    const m = margenAlbaran(alb);
    contTotales.replaceChildren(
      h("div", {}, h("span", {}, "Base"), h("span", {}, formatoEuros(t.base))),
      ...t.desglose.map((d) => h("div", {}, h("span", {}, `IVA ${d.iva}%`), h("span", {}, formatoEuros(d.cuota)))),
      h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, formatoEuros(t.total))),
      !m ? "" : h("p", { class: "margen-interno" }, `Solo lo ves tú: material a coste ${formatoEuros(m.coste)} · lo vendes a ${formatoEuros(m.venta)} · ganas ${formatoEuros(m.ganancia)} en material`),
    );
  }
  // Sugerencias de concepto: primero el catálogo, luego lo usado en otros albaranes.
  const catalogo = await articulosOrdenados();
  const porNombre = new Map(catalogo.map((a) => [normal(a.nombre), a]));
  const conceptosConocidos = new Map();
  for (const a of await db.todos("albaranes")) for (const l of a.lineas) if (l.concepto && !l.articuloId) conceptosConocidos.set(l.concepto, l.precio);
  const datalist = h("datalist", { id: "conceptos" },
    catalogo.slice(0, 400).map((a) => h("option", { value: a.nombre }, `${formatoEuros(precioVenta(a, ajustes.margen))} · stock ${formatoCantidad(a.stock || 0)}`)),
    [...conceptosConocidos.keys()].filter((k) => !porNombre.has(normal(k))).slice(0, 200).map((k) => h("option", { value: k })));

  function pintarLineas() {
    contLineas.replaceChildren(...alb.lineas.map((l, i) => {
      const importe = h("strong", { class: "importe" }, formatoEuros(importeLinea(l)));
      const precio = h("input", {
        inputmode: "decimal", value: l.precio ? String(l.precio).replace(".", ",") : "", placeholder: "0,00",
        oninput: (e) => { l.precio = redondear(num(e.target.value)); importe.textContent = formatoEuros(importeLinea(l)); pintarInfo(); cambiado(); },
      });
      // Datos del artículo del catálogo (solo para Pere: stock, coste y lo que gana).
      const info = h("small", { class: "info-articulo" });
      function pintarInfo() {
        const art = l.articuloId && catalogo.find((a) => a.id === l.articuloId);
        if (!art) { info.textContent = ""; return; }
        const coste = l.coste ?? art.coste;
        const margen = coste > 0 ? Math.round(((l.precio - coste) / coste) * 100) : null;
        info.textContent = `Catálogo · stock ${formatoCantidad(art.stock || 0)} · coste ${formatoEuros(coste)}${margen != null ? ` · margen ${margen}%` : ""}`;
      }
      pintarInfo();
      return h("div", { class: "linea" },
        h("div", { class: "linea-cab" },
          h("input", {
            class: "concepto", value: l.concepto, list: "conceptos", placeholder: "Concepto (p. ej. Grifo monomando)",
            oninput: (e) => {
              l.concepto = e.target.value;
              const art = porNombre.get(normal(l.concepto));
              if (art) {
                // Artículo del catálogo: su precio de venta (coste + margen) y su coste, para el margen.
                l.articuloId = art.id;
                l.coste = art.coste;
                l.precio = precioVenta(art, ajustes.margen);
                precio.value = String(l.precio).replace(".", ",");
                importe.textContent = formatoEuros(importeLinea(l));
              } else if (l.articuloId) {
                delete l.articuloId;
                delete l.coste;
              }
              pintarInfo();
              if (!art && !l.precio && conceptosConocidos.has(l.concepto)) {
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
          importe),
        info);
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
    if (alb.lineas.some((l) => !(l.cantidad >= 0.0001))) fallos.push("una cantidad mayor que cero en cada línea");
    if (alb.lineas.length > 100) fallos.push("como máximo 100 líneas");
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) fallos.push("un email del cliente válido");
    if (!fechaValida(alb.fecha)) fallos.push("una fecha válida");
    if (alb.lineas.some((l) => !(l.precio >= 0) || l.precio > 1e7)) fallos.push("precios correctos (sin negativos)");
    if (alb.lineas.some((l) => l.cantidad > 1e6)) fallos.push("cantidades razonables");
    // Mismos límites que el servidor: lo que se firma aquí, Holded lo acepta.
    const largos = [[c.nombre, 200, "nombre"], [c.nif, 30, "NIF"], [c.telefono, 40, "teléfono"], [c.email, 200, "email"],
      [c.direccion, 300, "dirección"], [c.poblacion, 120, "población"], [c.cp, 12, "C. P."], [alb.direccionObra, 300, "dirección de la obra"],
      [alb.trabajo, 4000, "trabajo realizado"], [alb.observaciones, 2000, "observaciones"], ...alb.lineas.map((l) => [l.concepto, 300, "concepto"])]
      .filter(([v, max]) => String(v || "").trim().length > max).map(([, , n]) => n);
    if (largos.length) { error.textContent = `Demasiado largo: ${[...new Set(largos)].join(", ")}.`; return; }
    if (fallos.length) { error.textContent = `Falta ${fallos.join(", ")}.`; return; }
    clearTimeout(guardarTimer);
    if (!(await autoguardar(alb))) return;
    ir(`/firmar/${alb.id}`);
  };

  const inputObra = entrada(alb, "direccionObra", { placeholder: "Calle, número, piso…" });
  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: async () => { clearTimeout(guardarTimer); await autoguardar(alb); ir("/"); } }, "‹ Albaranes"),
      h("h2", {}, alb.numero ? `Corregir ${alb.numero}` : "Nuevo albarán")),
    panelDictado(ctx, alb, {
      guardar: async () => { clearTimeout(guardarTimer); await autoguardar(alb); },
      alAplicar: () => ir(`/editar/${alb.id}`),
    }),
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
      // Un albarán ya numerado no se borra: el número quedaría como hueco en la serie.
      !alb.numero && h("button", {
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
  // Al girar el móvil cambia el tamaño: si aún no hay firma, se ajusta el lienzo.
  const alGirar = () => {
    if (!canvas.isConnected) { window.removeEventListener("resize", alGirar); return; }
    if (!hayTrazo) preparar();
  };
  window.addEventListener("resize", alGirar);

  // Holded admite hasta 120 caracteres para quien firma.
  const firmante = h("input", { value: (alb.firmante || alb.cliente.nombre).slice(0, 120), maxlength: "120", placeholder: "Nombre de quien firma" });
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
      // Si ya se firmó en otra ventana, no se vuelve a numerar ni a firmar.
      const actual = await db.obtener("albaranes", alb.id);
      if (actual && actual.estado !== "borrador") { ir(`/albaran/${alb.id}`); return; }
      // Al corregir un albarán rechazado se mantiene su número.
      if (!alb.numero) alb.numero = await db.siguienteNumero(ajustes.prefijo, anio);
      alb.negocio = { ...ajustes.negocio };
      alb.estado = "pendiente";
      alb.error = "";
      alb.stockDescontado = true;
      alb.actualizado = new Date().toISOString();
      // Firma y salida del material del stock, a la vez: o las dos cosas o ninguna.
      const firmado = await db.guardarAlbaranYStock(alb, alb.lineas.map((l) => ({ articuloId: l.articuloId, cantidad: -Number(l.cantidad) })), "borrador");
      if (!firmado) { ir(`/albaran/${alb.id}`); return; }
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
      h("div", { class: "botones-linea" },
        // Si el albarán ya existe en Holded (p. ej. solo falló el PDF), corregirlo aquí lo dejaría
        // sin poder enviarse y perdería la firma: se reintenta tal cual o se arregla en Holded.
        !alb.yaEnHolded && h("button", {
          class: "btn secundario",
          onclick: async () => {
            if (!confirm("Se reabrirá para corregirlo, con el mismo número. El cliente tendrá que volver a firmar. ¿Seguir?")) return;
            alb.estado = "borrador";
            alb.firma = "";
            alb.firmadoEn = "";
            // Se devuelve el material al stock (a la vez que se reabre): se descontará al firmar de nuevo.
            const devolver = alb.stockDescontado ? alb.lineas.map((l) => ({ articuloId: l.articuloId, cantidad: Number(l.cantidad) })) : [];
            alb.stockDescontado = false;
            alb.actualizado = new Date().toISOString();
            if (!(await db.guardarAlbaranYStock(alb, devolver, "error"))) { ir(`/albaran/${alb.id}`); return; }
            ir(`/editar/${alb.id}`);
          },
        }, "Corregir"),
        h("button", { class: "btn secundario", onclick: () => sincronizar({ manual: true }) }, "Volver a intentarlo"))),
    enviado: h("div", { class: "tarjeta estado-alb ok" },
      h("strong", {}, "Ya está en Holded ✓"),
      h("p", {}, `Enviado el ${new Date(alb.holded?.enviadoEn || alb.actualizado).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}. En Holded, ve a Inventario → Albaranes para convertirlo en factura.`)),
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
  // Se edita una copia: si sales sin guardar, los PDF no usan datos a medio escribir.
  const n = { ...ajustes.negocio };
  const ent = (obj, clave, attrs = {}) => h("input", { value: obj[clave] ?? "", ...attrs, oninput: (e) => { obj[clave] = e.target.value; } });
  const anio = hoyISO().slice(0, 4);
  const siguiente = await db.proximoDelAnio(anio);
  const inputPrefijo = h("input", { value: ajustes.prefijo, maxlength: 8, autocapitalize: "characters" });
  const inputSiguiente = h("input", { value: String(siguiente), inputmode: "numeric" });
  const inputHora = h("input", { value: String(ajustes.precioHora).replace(".", ","), inputmode: "decimal" });
  const inputDesp = h("input", { value: String(ajustes.precioDesplazamiento).replace(".", ","), inputmode: "decimal" });
  const inputMargen = h("input", { value: String(ajustes.margen).replace(".", ","), inputmode: "decimal" });
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
    // Nunca por debajo de un número ya usado con este prefijo y año: Holded rechazaría el repetido.
    const usados = (await db.todos("albaranes"))
      .map((a) => new RegExp(`^${prefijo}-${anio}-(\\d+)$`).exec(a.numero || ""))
      .filter(Boolean).map((m) => Number(m[1]));
    const maximo = usados.length ? Math.max(...usados) : 0;
    if (sig <= maximo) { aviso(`El próximo número debe ser mayor que ${maximo}: ese ya está usado.`, "error"); return false; }
    ajustes.prefijo = prefijo;
    ajustes.precioHora = redondear(num(inputHora.value));
    ajustes.precioDesplazamiento = redondear(num(inputDesp.value));
    const margen = num(inputMargen.value);
    if (!(margen >= 0 && margen <= 1000)) { aviso("El margen no es válido.", "error"); return false; }
    ajustes.margen = margen;
    ajustes.ivaDefecto = Number(selIva.value);
    ajustes.claveApp = inputClave.value.trim();
    for (const k of Object.keys(n)) n[k] = String(n[k] || "").trim();
    ajustes.negocio = n;
    await guardarAjustes();
    if (sig !== siguiente) await db.fijarProximoDelAnio(anio, sig);
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
    const datos = { app: "albaranes-obra", version: 1, exportado: new Date().toISOString(), ajustes: { ...ajustes, claveApp: "" }, albaranes: await db.todos("albaranes"), clientes: await db.todos("clientes"), articulos: await db.todos("articulos"), compras: await db.todos("compras") };
    descargar(new File([JSON.stringify(datos, null, 1)], `copia-albaranes-${hoyISO()}.json`, { type: "application/json" }));
  };

  // Restaurar: añade lo que falte y deja la versión más reciente de cada albarán.
  // Los contadores de numeración nunca bajan, para no repetir números.
  const restaurar = async (fichero) => {
    let datos;
    try { datos = JSON.parse(await fichero.text()); } catch { aviso("El archivo no es una copia válida.", "error"); return; }
    if (datos?.app !== "albaranes-obra" || !Array.isArray(datos.albaranes)) { aviso("El archivo no es una copia de esta app.", "error"); return; }
    if (!confirm(`La copia tiene ${datos.albaranes.length} albaranes. ¿Restaurarla en este móvil?`)) return;
    let nuevos = 0;
    for (const a of datos.albaranes) {
      if (!a || typeof a.id !== "string" || !Array.isArray(a.lineas) || !a.cliente) continue;
      const actual = await db.obtener("albaranes", a.id);
      if (!actual || String(a.actualizado) > String(actual.actualizado)) { await db.guardar("albaranes", a); nuevos++; }
      const m = /^[A-Z0-9]+-(\d{4})-(\d+)$/.exec(a.numero || "");
      if (m && (await db.proximoDelAnio(m[1])) <= Number(m[2])) await db.fijarProximoDelAnio(m[1], Number(m[2]) + 1);
    }
    for (const c of Array.isArray(datos.clientes) ? datos.clientes : []) {
      if (c && typeof c.id === "string" && c.nombre && !(await db.obtener("clientes", c.id))) await db.guardar("clientes", c);
    }
    // Catálogo y compras: se añaden los que falten (lo que ya hay en este móvil no se toca).
    for (const a of Array.isArray(datos.articulos) ? datos.articulos : []) {
      if (a && typeof a.id === "string" && a.nombre && !(await db.obtener("articulos", a.id))) await db.guardar("articulos", a);
    }
    for (const c of Array.isArray(datos.compras) ? datos.compras : []) {
      if (c && typeof c.id === "string" && typeof c.foto === "string" && c.foto.startsWith("data:image/") && Array.isArray(c.lineas) && !(await db.obtener("compras", c.id))) await db.guardar("compras", c);
    }
    if (datos.ajustes?.negocio && !ajustes.negocio.nif) {
      ajustes = { ...ajustes, ...datos.ajustes, claveApp: ajustes.claveApp, negocio: { ...ajustes.negocio, ...datos.ajustes.negocio } };
      await guardarAjustes();
    }
    aviso(`Copia restaurada: ${nuevos} albaranes ✓`);
    ir("/");
  };
  const inputCopia = h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: (e) => { const f = e.target.files?.[0]; if (f) restaurar(f); } });

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
      h("small", { class: "ayuda" }, "Usa un prefijo distinto al de tus series de Holded (por ejemplo M), para que no choquen los números. Si usas la app en más de un móvil, pon un prefijo distinto en cada uno."),
      h("div", { class: "rejilla" }, campo("Precio hora €", inputHora), campo("Desplazamiento €", inputDesp)),
      campo("Margen general sobre el coste %", inputMargen, "Precio de venta del material = coste + este %. Cada artículo del catálogo puede tener el suyo."),
      campo("IVA por defecto", selIva, "21% general. 10% en reparaciones de vivienda particular cuando se cumplen los requisitos.")),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Conexión con Holded"),
      campo("Clave de la app", inputClave, "La misma que pusiste en Netlify como APP_CLAVE."),
      h("button", { class: "btn secundario", onclick: probar }, "Guardar y probar conexión"),
      resultadoPrueba),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Copia de seguridad"),
      h("p", { class: "ayuda" }, "Los albaranes se guardan en este móvil. Descarga una copia de vez en cuando."),
      h("div", { class: "botones-linea" },
        h("button", { class: "btn secundario", onclick: copia }, "Descargar copia"),
        h("button", { class: "btn secundario", onclick: () => inputCopia.click() }, "Restaurar copia")),
      inputCopia),
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
  else if (seccion === "compras") contenido = await vistaCompras(ctx);
  else if (seccion === "compra") contenido = await vistaCompra(ctx, id);
  else if (seccion === "catalogo") contenido = await vistaCatalogo(ctx);
  else if (seccion === "articulo") contenido = await vistaArticulo(ctx, id);
  else if (["editar", "firmar", "albaran"].includes(seccion)) {
    const alb = await db.obtener("albaranes", id);
    if (!alb) { ir("/"); return; }
    contenido = seccion === "editar" ? await vistaEditor(alb) : seccion === "firmar" ? vistaFirma(alb) : vistaDetalle(alb);
  } else contenido = await vistaLista();
  if (yo !== renderId) return; // otra navegación más reciente ya está pintando
  // Las pantallas pueden dejar huecos (cond && elemento): no se pintan.
  vista.replaceChildren(...contenido.filter((x) => x != null && x !== false && x !== ""));
  // Mientras firma el cliente (con el móvil en sus manos) no hay acceso a Ajustes ni al envío.
  document.getElementById("btn-ajustes").hidden = seccion === "ajustes" || seccion === "firmar";
  barraEstado.hidden = seccion === "firmar";
  // Pestañas solo en las tres listas principales.
  const pestana = { "": "/", compras: "/compras", catalogo: "/catalogo" }[seccion ?? ""];
  pestanas.hidden = !pestana;
  for (const b of pestanas.querySelectorAll("button")) b.setAttribute("aria-current", b.dataset.ruta === pestana ? "page" : "false");
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
  for (const b of pestanas.querySelectorAll("button")) b.addEventListener("click", () => ir(b.dataset.ruta));
  window.addEventListener("online", () => { pintarEstado(); sincronizar(); tareasIA(); });
  window.addEventListener("offline", pintarEstado);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { sincronizar(); tareasIA(); } });
  setInterval(() => { sincronizar(); tareasIA(); }, 60000);
  await render();
  pintarEstado();
  sincronizar();
  tareasIA();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

iniciar();
