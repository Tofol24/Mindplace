/* Albaranes · compras a proveedores.
   ---------------------------------------------------------------------------
   Pere hace una foto del albarán o factura del proveedor. Con cobertura, la IA lee
   el proveedor y las líneas (artículo, cantidad, precio); Pere lo revisa y, al
   registrar la compra, se actualizan el precio de coste y el stock del catálogo.
   Sin cobertura, la foto se guarda y se lee en cuanto vuelve la señal.
   Las compras se guardan con su foto y se pueden exportar al asesor (CSV + fotos).

   Estados: sin_leer (falta leerla) · revisar (leída, falta confirmar)
            · error (no se ha podido leer) · registrada (ya en coste y stock)
*/

import * as db from "./db.js";
import { fechaCortaSegura as fechaCorta, formatoCantidad, formatoEuros, hoyISO, redondear } from "./calculos.js";
import { articulosOrdenados, buscarArticulo } from "./catalogo.js";
import { aviso, campo, h, ir, num, uuid } from "./ui.js";

const ETIQUETA = { sin_leer: "Sin leer", revisar: "Revisar", error: "No se ha leído", registrada: "Registrada ✓" };
const CLASE = { sin_leer: "pendiente", revisar: "pendiente", error: "error", registrada: "enviado" };
const TIPOS = { albaran: "Albarán", factura: "Factura", ticket: "Ticket", otro: "Otro" };

const r4 = (n) => Math.round((Number(n) || 0) * 10000) / 10000;
/** Coste por unidad sin IVA, con el descuento de la línea aplicado. */
export const costeNeto = (l) => r4((Number(l.precioUnitario) || 0) * (1 - (Number(l.descuento) || 0) / 100));

export function totalesCompra(c) {
  let base = 0;
  let cuota = 0;
  for (const l of c.lineas || []) {
    const importe = redondear((Number(l.cantidad) || 0) * costeNeto(l));
    base += importe;
    cuota += importe * (Number(l.iva) || 0) / 100;
  }
  base = redondear(base);
  cuota = redondear(cuota);
  return {
    base: c.base ?? base,
    cuotaIva: c.cuotaIva ?? cuota,
    total: c.total ?? redondear(base + cuota),
    calculado: { base, cuotaIva: cuota, total: redondear(base + cuota) },
  };
}

// ---------------------------------------------------------------------------
// Foto
// ---------------------------------------------------------------------------

/** Reduce la foto (lado largo 1600 px, JPEG): se lee igual de bien y pesa poco. */
async function reducirFoto(fichero) {
  const url = URL.createObjectURL(fichero);
  try {
    const img = await new Promise((ok, ko) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => ko(new Error("No se puede abrir la foto"));
      i.src = url;
    });
    const escala = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(img.naturalWidth * escala);
    lienzo.height = Math.round(img.naturalHeight * escala);
    const ctx = lienzo.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    return lienzo.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function nuevaCompraDesdeFoto(ctx, fichero) {
  let foto;
  try {
    foto = await reducirFoto(fichero);
  } catch {
    aviso("No se ha podido abrir la foto. Prueba con otra.", "error");
    return;
  }
  const c = { id: uuid(), estado: "sin_leer", foto, tipo: "albaran", proveedor: "", nifProveedor: "", numero: "", fecha: hoyISO(), lineas: [], base: null, cuotaIva: null, total: null, error: "", creado: new Date().toISOString() };
  await db.guardar("compras", c);
  ir(`/compra/${c.id}`);
  if (navigator.onLine && ctx.ajustes().claveApp) leer(ctx, c.id);
  else aviso("Foto guardada. Se leerá cuando haya cobertura.", "info");
}

// ---------------------------------------------------------------------------
// Lectura con IA (con cola sin conexión)
// ---------------------------------------------------------------------------

const leyendo = new Set();

/** Lee una compra con la IA. Devuelve true si se ha leído. */
async function leer(ctx, id) {
  if (leyendo.has(id)) return false;
  leyendo.add(id);
  ctx.refrescar(`/compra/${id}`);
  try {
    const c = await db.obtener("compras", id);
    if (!c || (c.estado !== "sin_leer" && c.estado !== "error")) return false;
    let r;
    try {
      r = await ctx.llamarAPI("/api/ia/compra", { method: "POST", body: { imagen: c.foto.split(",")[1], tipoImagen: "image/jpeg" } });
    } catch {
      c.error = "Sin conexión. Se leerá cuando haya cobertura.";
      await db.guardar("compras", c);
      return false;
    }
    const actual = await db.obtener("compras", id);
    if (!actual || (actual.estado !== "sin_leer" && actual.estado !== "error")) return false;
    if (r.ok && r.datos.ok) {
      const d = r.datos.compra;
      const catalogo = await articulosOrdenados();
      Object.assign(actual, {
        estado: "revisar",
        error: d.esDocumento ? "" : "La foto no parece un albarán ni una factura. Revísala.",
        tipo: d.tipo, proveedor: d.proveedor, nifProveedor: d.nifProveedor, numero: d.numero,
        fecha: d.fecha || actual.fecha, base: d.base, cuotaIva: d.cuotaIva, total: d.total,
        lineas: d.lineas.map((l) => ({
          ...l,
          articuloId: buscarArticulo(catalogo, { ref: l.referencia, nombre: l.descripcion, proveedor: d.proveedor })?.id || null,
          alStock: true,
        })),
      });
      await db.guardar("compras", actual);
      return true;
    }
    actual.error = r.datos.error || `Error ${r.status}`;
    // Fallo pasajero (red, IA ocupada): sigue «sin leer» y se reintenta solo.
    if (r.datos.reintentar === false) actual.estado = "error";
    await db.guardar("compras", actual);
    return false;
  } finally {
    leyendo.delete(id);
    ctx.refrescar(`/compra/${id}`);
  }
}

/** Lee las fotos que quedaron pendientes sin cobertura. */
export async function leerComprasPendientes(ctx) {
  if (!navigator.onLine || !ctx.ajustes().claveApp) return;
  const pendientes = (await db.todos("compras")).filter((c) => c.estado === "sin_leer");
  let leidas = 0;
  for (const c of pendientes) {
    if (await leer(ctx, c.id)) leidas++;
    else break; // sin red o IA ocupada: se probará en la siguiente ronda
  }
  if (leidas) aviso(leidas === 1 ? "Se ha leído una compra: revísala en Compras." : `Se han leído ${leidas} compras: revísalas en Compras.`, "info");
}

// ---------------------------------------------------------------------------
// Registrar en el catálogo (coste y stock)
// ---------------------------------------------------------------------------

async function registrar(c) {
  const lineas = c.lineas.filter((l) => l.descripcion.trim());
  if (!lineas.length) { aviso("La compra no tiene líneas.", "error"); return false; }
  if (lineas.some((l) => !(Number(l.cantidad) > 0) || costeNeto(l) < 0)) { aviso("Revisa las cantidades y los precios.", "error"); return false; }
  // Plan: a qué artículo va cada línea (existente o nuevo). Dos líneas del mismo artículo se suman.
  const catalogo = await db.todos("articulos");
  const nuevos = [];
  const cambios = new Map();
  for (const l of lineas) {
    if (!l.alStock) continue;
    const coste = costeNeto(l);
    // Lo que Pere ha elegido en «En el catálogo» manda: sin artículo elegido, es un artículo nuevo.
    const existente = l.articuloId && catalogo.find((a) => a.id === l.articuloId);
    if (existente) {
      const cambio = cambios.get(existente.id) || { cantidad: 0, coste: 0, ref: l.referencia, proveedor: c.proveedor };
      cambio.cantidad = r4(cambio.cantidad + Number(l.cantidad));
      cambio.coste = coste || cambio.coste;
      cambios.set(existente.id, cambio);
      l.articuloId = existente.id;
      continue;
    }
    const yaNuevo = buscarArticulo(nuevos, { ref: l.referencia, nombre: l.descripcion });
    if (yaNuevo) {
      yaNuevo.stock = r4(yaNuevo.stock + Number(l.cantidad));
      yaNuevo.coste = coste || yaNuevo.coste;
      l.articuloId = yaNuevo.id;
    } else {
      const nuevo = { id: uuid(), nombre: l.descripcion.trim(), ref: l.referencia || "", proveedor: c.proveedor || "", unidad: "ud", coste, margen: null, precio: null, stock: r4(l.cantidad) };
      nuevos.push(nuevo);
      l.articuloId = nuevo.id;
    }
  }
  // Lo que se registra son los importes revisados (líneas); los del documento se guardan aparte.
  const t = totalesCompra({ ...c, lineas, base: null, cuotaIva: null, total: null }).calculado;
  const registrada = {
    ...c,
    lineas,
    documento: c.documento || { base: c.base, cuotaIva: c.cuotaIva, total: c.total },
    base: t.base, cuotaIva: t.cuotaIva, total: t.total,
    estado: "registrada",
    registradaEn: new Date().toISOString(),
    error: "",
  };
  // Si ya se registró en otra ventana, no se vuelve a sumar nada.
  return (await db.registrarCompra(registrada, nuevos, cambios)) ? "ok" : "ya";
}

// ---------------------------------------------------------------------------
// Exportar para el asesor
// ---------------------------------------------------------------------------

// Sin fetch(): la política de seguridad de la página no deja leer URL «data:».
function dataUrlABytes(dataUrl) {
  const bin = atob(dataUrl.split(",")[1] || "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const cifraCsv = (n) => (n == null ? "" : String(redondear(n)).replace(".", ","));
const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
// Un texto leído de una foto que empiece por = + - @ se abriría como fórmula en Excel: se neutraliza.
const celdaTexto = (v) => celda(/^[=+\-@\t\r]/.test(String(v ?? "")) ? `'${v}` : v);
const nombreSeguro = (s) => String(s || "proveedor").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "proveedor";

async function exportarMes(ctx, mes) {
  const compras = (await db.todos("compras"))
    .filter((c) => c.estado === "registrada" && (c.fecha || "").startsWith(mes))
    .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
  if (!compras.length) { aviso("No hay compras registradas en ese mes.", "info"); return; }
  const filas = [["Fecha", "Tipo", "Proveedor", "NIF", "Número", "Base", "IVA", "Total", "Foto"].map(celda).join(";")];
  const ficheros = [];
  for (const c of compras) {
    const t = totalesCompra(c);
    const foto = `${c.fecha || "sin-fecha"}-${nombreSeguro(c.proveedor)}-${c.id.slice(0, 6)}.jpg`;
    filas.push([
      celda(fechaCorta(c.fecha)), celda(TIPOS[c.tipo] || ""), celdaTexto(c.proveedor), celdaTexto(c.nifProveedor), celdaTexto(c.numero),
      celda(cifraCsv(t.base)), celda(cifraCsv(t.cuotaIva)), celda(cifraCsv(t.total)), celda(foto),
    ].join(";"));
    ficheros.push(new File([dataUrlABytes(c.foto)], foto, { type: "image/jpeg" }));
  }
  // El BOM hace que Excel abra bien las tildes.
  const csv = new File(["﻿" + filas.join("\r\n")], `compras-${mes}.csv`, { type: "text/csv" });
  const todos = [csv, ...ficheros];
  if (navigator.canShare?.({ files: todos })) {
    try { await navigator.share({ files: todos, title: `Compras ${mes}` }); } catch (e) { if (e?.name !== "AbortError") aviso("No se ha podido compartir.", "error"); }
    return;
  }
  for (const f of todos) ctx.descargar(f);
}

// ---------------------------------------------------------------------------
// Pantallas
// ---------------------------------------------------------------------------

export async function vistaCompras(ctx) {
  const compras = (await db.todos("compras")).sort((a, b) => (b.creado || "").localeCompare(a.creado || ""));
  const entradaCamara = h("input", { type: "file", accept: "image/*", capture: "environment", hidden: true, onchange: (e) => { const f = e.target.files?.[0]; if (f) nuevaCompraDesdeFoto(ctx, f); } });
  const entradaGaleria = h("input", { type: "file", accept: "image/*", hidden: true, onchange: (e) => { const f = e.target.files?.[0]; if (f) nuevaCompraDesdeFoto(ctx, f); } });

  const meses = [...new Set(compras.filter((c) => c.estado === "registrada" && c.fecha).map((c) => c.fecha.slice(0, 7)))].sort().reverse();
  const selMes = h("select", { "aria-label": "Mes" }, meses.map((m) => h("option", { value: m }, new Date(`${m}-01T12:00:00`).toLocaleDateString("es-ES", { month: "long", year: "numeric" }))));

  return [
    h("button", { class: "btn principal grande", onclick: () => entradaCamara.click() }, "📷 Foto del albarán o factura del proveedor"),
    h("button", { class: "btn enlace", onclick: () => entradaGaleria.click() }, "o elegir una foto de la galería"),
    entradaCamara, entradaGaleria,
    compras.length
      ? h("ul", { class: "lista" }, compras.map((c) => h("li", {},
        h("button", { class: "fila", onclick: () => ir(`/compra/${c.id}`) },
          h("div", { class: "fila-principal" },
            h("strong", {}, c.proveedor || "Proveedor sin leer"),
            h("span", { class: `chip ${CLASE[c.estado]}` }, leyendo.has(c.id) ? "Leyendo…" : ETIQUETA[c.estado])),
          h("div", { class: "fila-sec" },
            h("span", {}, [TIPOS[c.tipo], c.numero, fechaCorta(c.fecha)].filter(Boolean).join(" · ")),
            h("span", {}, c.lineas?.length ? formatoEuros(totalesCompra(c).total) : ""))))))
      : h("p", { class: "vacio" }, "Todavía no hay compras. Cuando el proveedor te dé el albarán o la factura, hazle una foto."),
    meses.length > 0 && h("section", { class: "tarjeta" },
      h("h3", {}, "Para el asesor"),
      h("p", { class: "ayuda" }, "Exporta las compras registradas de un mes: una hoja de cálculo con fecha, proveedor, NIF, base, IVA y total, y la foto de cada documento."),
      campo("Mes", selMes),
      h("button", { class: "btn secundario", onclick: () => exportarMes(ctx, selMes.value) }, "Exportar compras del mes")),
  ];
}

export async function vistaCompra(ctx, id) {
  const c = await db.obtener("compras", id);
  if (!c) { ir("/compras"); return []; }
  const volver = h("div", { class: "cab-vista" },
    h("button", { class: "btn-volver", onclick: () => ir("/compras") }, "‹ Compras"),
    h("h2", {}, c.proveedor || "Compra"));
  const foto = h("img", { class: "foto-compra", src: c.foto, alt: "Foto del documento del proveedor" });
  const verFoto = h("details", { class: "mas", open: c.estado !== "revisar" && c.estado !== "registrada" }, h("summary", {}, "Ver la foto"), foto);
  const borrar = h("button", {
    class: "btn peligro",
    onclick: async () => {
      const registrada = c.estado === "registrada";
      if (!confirm(registrada ? "¿Borrar esta compra? Se restarán sus unidades del stock." : "¿Borrar esta compra?")) return;
      ctx.cancelarGuardado?.();
      await db.borrarCompra(c.id);
      ir("/compras");
    },
  }, "Borrar compra");

  // --- Pendiente de leer o con error
  if (c.estado === "sin_leer" || c.estado === "error") {
    const ocupado = leyendo.has(c.id);
    return [
      volver,
      h("div", { class: `tarjeta estado-alb ${c.estado === "error" ? "error" : "aviso"}` },
        h("strong", {}, ocupado ? "Leyendo el documento…" : c.estado === "error" ? "No se ha podido leer" : navigator.onLine ? "Pendiente de leer" : "Guardada · sin cobertura"),
        h("p", {}, ocupado ? "Tarda unos segundos." : c.error || "Se leerá sola en cuanto haya conexión."),
        !ocupado && h("div", { class: "botones-linea" },
          h("button", { class: "btn secundario", onclick: () => { if (!navigator.onLine) { aviso("No hay cobertura.", "info"); return; } c.estado = "sin_leer"; db.guardar("compras", c).then(() => leer(ctx, c.id)); } }, "Leer ahora"),
          h("button", { class: "btn secundario", onclick: async () => { c.estado = "revisar"; c.error = ""; if (!c.lineas.length) c.lineas.push(lineaVacia()); await db.guardar("compras", c); ir(`/compra/${c.id}`); } }, "Rellenar a mano"))),
      foto,
      h("div", { class: "acciones" }, borrar),
    ];
  }

  // --- Registrada: solo lectura
  if (c.estado === "registrada") {
    const t = totalesCompra(c);
    const catalogo = new Map((await db.todos("articulos")).map((a) => [a.id, a]));
    return [
      volver,
      h("div", { class: "tarjeta estado-alb ok" },
        h("strong", {}, "Registrada ✓"),
        h("p", {}, "El coste y el stock de estos artículos ya están en el catálogo.")),
      h("section", { class: "tarjeta" },
        h("p", { class: "ayuda" }, [TIPOS[c.tipo], c.numero && `Nº ${c.numero}`, fechaCorta(c.fecha), c.nifProveedor && `NIF ${c.nifProveedor}`].filter(Boolean).join(" · ")),
        h("ul", { class: "lineas-lectura" }, c.lineas.map((l) => h("li", {},
          h("span", {}, `${l.descripcion} × ${formatoCantidad(l.cantidad)}${l.alStock && catalogo.has(l.articuloId) ? "" : " (no va al stock)"}`),
          h("span", {}, `${formatoEuros(costeNeto(l))}/ud`)))),
        h("div", { class: "totales" },
          h("div", {}, h("span", {}, "Base"), h("span", {}, formatoEuros(t.base))),
          h("div", {}, h("span", {}, "IVA"), h("span", {}, formatoEuros(t.cuotaIva))),
          h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, formatoEuros(t.total))))),
      verFoto,
      h("div", { class: "acciones" }, borrar),
    ];
  }

  // --- Revisar lo leído y registrar
  return vistaRevisar(ctx, c, volver, verFoto, borrar);
}

function lineaVacia() {
  return { referencia: "", descripcion: "", cantidad: 1, precioUnitario: 0, descuento: 0, iva: 21, articuloId: null, alStock: true };
}

async function vistaRevisar(ctx, c, volver, verFoto, borrar) {
  const catalogo = await articulosOrdenados();
  let timer;
  const cambiado = () => {
    clearTimeout(timer);
    timer = setTimeout(() => db.guardarCompraEnRevision(c), 400);
    pintarTotales();
  };
  // Al borrar la compra no debe quedar un guardado pendiente que la vuelva a crear.
  ctx.cancelarGuardado = () => clearTimeout(timer);
  const ent = (obj, k, attrs = {}) => h("input", { value: obj[k] ?? "", ...attrs, oninput: (e) => { obj[k] = e.target.value; cambiado(); } });
  const entNum = (obj, k, attrs = {}) => h("input", {
    inputmode: "decimal", value: obj[k] == null ? "" : String(obj[k]).replace(".", ","), ...attrs,
    oninput: (e) => { obj[k] = num(e.target.value); cambiado(); },
  });

  const contTotales = h("div", { class: "totales" });
  function pintarTotales() {
    const t = totalesCompra({ ...c, base: null, cuotaIva: null, total: null });
    const doc = c.total;
    contTotales.replaceChildren(
      h("div", {}, h("span", {}, "Base (líneas)"), h("span", {}, formatoEuros(t.base))),
      h("div", {}, h("span", {}, "IVA (líneas)"), h("span", {}, formatoEuros(t.cuotaIva))),
      h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, formatoEuros(t.total))),
      doc != null && Math.abs(doc - t.total) > 0.05
        ? h("p", { class: "error-form" }, `El documento dice ${formatoEuros(doc)}: revisa las líneas o los descuentos.`)
        : "",
    );
  }

  const contLineas = h("div", { class: "lineas" });
  function pintarLineas() {
    contLineas.replaceChildren(...c.lineas.map((l, i) => {
      const coste = h("strong", { class: "importe" });
      const pintarCoste = () => { coste.textContent = `Coste: ${formatoEuros(costeNeto(l))}/ud · ${formatoEuros(redondear(costeNeto(l) * (Number(l.cantidad) || 0)))}`; };
      pintarCoste();
      const alCambiar = () => { pintarCoste(); cambiado(); };
      const selArt = h("select", { onchange: (e) => { l.articuloId = e.target.value || null; cambiado(); } },
        h("option", { value: "" }, "➕ Artículo nuevo en el catálogo"),
        catalogo.map((a) => h("option", { value: a.id, selected: a.id === l.articuloId }, `${a.nombre}${a.ref ? ` (${a.ref})` : ""} · coste ${formatoEuros(a.coste)}`)));
      const entradaN = (k) => { const el = entNum(l, k); el.addEventListener("input", alCambiar); return el; };
      return h("div", { class: "linea" },
        h("div", { class: "linea-cab" },
          ent(l, "descripcion", { class: "concepto", placeholder: "Artículo" }),
          h("button", { type: "button", class: "btn-icono", "aria-label": "Quitar línea", onclick: () => { c.lineas.splice(i, 1); pintarLineas(); cambiado(); } }, "✕")),
        h("div", { class: "rejilla" }, campo("Referencia", ent(l, "referencia")), campo("Cantidad", entradaN("cantidad"))),
        h("div", { class: "linea-num" },
          campo("Precio €", entradaN("precioUnitario")),
          campo("Dto. %", entradaN("descuento")),
          campo("IVA %", entradaN("iva")),
          coste),
        campo("En el catálogo", selArt),
        h("label", { class: "casilla" },
          h("input", { type: "checkbox", checked: l.alStock !== false, onchange: (e) => { l.alStock = e.target.checked; cambiado(); } }),
          " Sumar al stock y actualizar el coste"));
    }));
  }
  pintarLineas();
  pintarTotales();

  const registrarBtn = h("button", {
    class: "btn principal grande",
    onclick: async () => {
      clearTimeout(timer);
      registrarBtn.disabled = true;
      try {
        const r = await registrar(c);
        if (r) {
          aviso(r === "ok" ? "Compra registrada: coste y stock actualizados ✓" : "Esta compra ya estaba registrada.", r === "ok" ? "ok" : "info");
          ir(`/compra/${c.id}`);
        }
      } finally {
        registrarBtn.disabled = false;
      }
    },
  }, "Registrar compra");

  return [
    volver,
    c.error && h("div", { class: "tarjeta estado-alb aviso" }, h("p", {}, c.error)),
    h("p", { class: "ayuda" }, "Revisa lo que se ha leído de la foto. Cuando lo registres, se actualizan el coste y el stock del catálogo."),
    verFoto,
    h("section", { class: "tarjeta" },
      h("h3", {}, "Documento"),
      campo("Proveedor", ent(c, "proveedor")),
      h("div", { class: "rejilla" }, campo("NIF", ent(c, "nifProveedor")), campo("Número", ent(c, "numero"))),
      h("div", { class: "rejilla" },
        campo("Fecha", ent(c, "fecha", { type: "date" })),
        campo("Tipo", h("select", { onchange: (e) => { c.tipo = e.target.value; cambiado(); } }, Object.entries(TIPOS).map(([k, v]) => h("option", { value: k, selected: k === c.tipo }, v)))))),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Artículos"),
      contLineas,
      h("button", { type: "button", class: "btn secundario", onclick: () => { c.lineas.push(lineaVacia()); pintarLineas(); cambiado(); } }, "+ Añadir línea"),
      contTotales),
    h("div", { class: "acciones" }, registrarBtn, borrar),
  ];
}
