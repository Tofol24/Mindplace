/* Albaranes · catálogo de artículos: precio de coste, margen, precio de venta y stock.
   El catálogo vive en el móvil. Se llena con las compras a proveedores (foto del
   albarán o factura) o a mano, y lo usan los albaranes de venta: al elegir un
   artículo se pone su precio de venta y, al firmar, se descuenta del stock. */

import * as db from "./db.js";
import { formatoCantidad, formatoEuros, redondear } from "./calculos.js";
import { aviso, campo, h, ir, normal, num, uuid } from "./ui.js";

export const UNIDADES = { ud: "unidad", m: "metro", h: "hora", kg: "kilo", l: "litro" };

/** Margen que se aplica al artículo: el suyo o, si no tiene, el general de Ajustes. */
export const margenDe = (art, margenGeneral) => (art.margen ?? margenGeneral ?? 0);

/** Precio de venta sin IVA: el fijado a mano o coste + margen. */
export function precioVenta(art, margenGeneral) {
  if (art.precio != null) return art.precio;
  return redondear((Number(art.coste) || 0) * (1 + margenDe(art, margenGeneral) / 100));
}

/** Busca un artículo por referencia del proveedor o, si no, por nombre exacto (sin tildes). */
export function buscarArticulo(lista, { ref, nombre }) {
  const r = normal(ref);
  if (r) {
    const porRef = lista.find((a) => normal(a.ref) === r);
    if (porRef) return porRef;
  }
  const n = normal(nombre);
  return n ? lista.find((a) => normal(a.nombre) === n) || null : null;
}

export async function articulosOrdenados() {
  return (await db.todos("articulos")).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

// ---------------------------------------------------------------------------
// Pantallas
// ---------------------------------------------------------------------------

export async function vistaCatalogo(ctx) {
  const margenGeneral = ctx.ajustes().margen;
  const todos = await articulosOrdenados();
  const lista = h("ul", { class: "lista" });
  const pintar = (q) => {
    const nq = normal(q);
    const filtrados = todos.filter((a) => !nq || normal(`${a.nombre} ${a.ref || ""} ${a.proveedor || ""}`).includes(nq));
    lista.replaceChildren(...filtrados.map((a) => h("li", {},
      h("button", { class: "fila", onclick: () => ir(`/articulo/${a.id}`) },
        h("div", { class: "fila-principal" },
          h("strong", {}, a.nombre),
          h("span", { class: `chip ${(Number(a.stock) || 0) > 0 ? "enviado" : "borrador"}` }, `Stock ${formatoCantidad(a.stock || 0)}`)),
        h("div", { class: "fila-sec" },
          h("span", {}, [a.ref, a.proveedor].filter(Boolean).join(" · ") || UNIDADES[a.unidad || "ud"]),
          h("span", {}, `${formatoEuros(a.coste)} → ${formatoEuros(precioVenta(a, margenGeneral))}`))))));
    if (!filtrados.length) lista.replaceChildren(h("li", { class: "vacio" }, todos.length ? "Ningún artículo coincide." : "El catálogo está vacío. Se llena solo al registrar compras con la foto del albarán del proveedor, o puedes añadir artículos a mano."));
  };
  pintar("");
  return [
    h("div", { class: "botones-linea" },
      h("button", { class: "btn principal", onclick: () => ir("/articulo/nuevo") }, "+ Nuevo artículo")),
    h("input", { type: "search", placeholder: "Buscar artículo, referencia o proveedor", oninput: (e) => pintar(e.target.value), "aria-label": "Buscar en el catálogo" }),
    h("p", { class: "ayuda" }, `${todos.length} artículos · margen general ${margenGeneral}% (cámbialo en Ajustes)`),
    lista,
  ];
}

export async function vistaArticulo(ctx, id) {
  const margenGeneral = ctx.ajustes().margen;
  const existente = id === "nuevo" ? null : await db.obtener("articulos", id);
  if (id !== "nuevo" && !existente) { ir("/catalogo"); return []; }
  const a = existente
    ? { ...existente }
    : { id: uuid(), nombre: "", ref: "", proveedor: "", unidad: "ud", coste: 0, margen: null, precio: null, stock: 0 };

  const decimal = (v) => (v == null ? "" : String(v).replace(".", ","));
  const nombre = h("input", { value: a.nombre, placeholder: "p. ej. Grifo monomando cocina" });
  const ref = h("input", { value: a.ref || "", placeholder: "Referencia del proveedor" });
  const proveedor = h("input", { value: a.proveedor || "" });
  const unidad = h("select", {}, Object.entries(UNIDADES).map(([k, v]) => h("option", { value: k, selected: k === (a.unidad || "ud") }, v)));
  const coste = h("input", { inputmode: "decimal", value: decimal(a.coste) });
  const margen = h("input", { inputmode: "decimal", value: decimal(a.margen), placeholder: `${margenGeneral} (general)` });
  const precio = h("input", { inputmode: "decimal", value: decimal(a.precio), placeholder: "Automático" });
  const stock = h("input", { inputmode: "decimal", value: decimal(a.stock) });
  const resumen = h("p", { class: "resumen-precio" });
  const pintarResumen = () => {
    const tmp = { coste: num(coste.value), margen: margen.value.trim() ? num(margen.value) : null, precio: precio.value.trim() ? num(precio.value) : null };
    const pv = precioVenta(tmp, margenGeneral);
    const ganancia = redondear(pv - tmp.coste);
    resumen.textContent = `Precio de venta: ${formatoEuros(pv)} sin IVA · ganas ${formatoEuros(ganancia)} por ${UNIDADES[unidad.value]}`;
  };
  for (const el of [coste, margen, precio]) el.addEventListener("input", pintarResumen);
  unidad.addEventListener("change", pintarResumen);
  pintarResumen();

  const guardar = async () => {
    if (!nombre.value.trim()) { aviso("Falta el nombre del artículo.", "error"); return; }
    if (num(coste.value) < 0 || (precio.value.trim() && num(precio.value) < 0)) { aviso("Los precios no pueden ser negativos.", "error"); return; }
    await db.guardar("articulos", {
      ...a,
      nombre: nombre.value.trim().slice(0, 200),
      ref: ref.value.trim().slice(0, 60),
      proveedor: proveedor.value.trim().slice(0, 200),
      unidad: unidad.value,
      coste: redondear(num(coste.value)),
      margen: margen.value.trim() ? num(margen.value) : null,
      precio: precio.value.trim() ? redondear(num(precio.value)) : null,
      stock: num(stock.value),
      actualizado: new Date().toISOString(),
    });
    aviso("Artículo guardado ✓");
    ir("/catalogo");
  };

  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir("/catalogo") }, "‹ Catálogo"),
      h("h2", {}, existente ? "Artículo" : "Nuevo artículo")),
    h("section", { class: "tarjeta" },
      campo("Nombre", nombre),
      h("div", { class: "rejilla" }, campo("Referencia", ref), campo("Se vende por", unidad)),
      campo("Proveedor", proveedor)),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Precios (sin IVA)"),
      h("div", { class: "rejilla" }, campo("Coste €", coste), campo("Margen %", margen)),
      campo("Precio de venta fijo € (opcional)", precio, "Déjalo vacío para que se calcule: coste + margen."),
      resumen),
    h("section", { class: "tarjeta" }, campo("Stock", stock, "Sube solo al registrar compras y baja al firmar albaranes.")),
    h("div", { class: "acciones" },
      h("button", { class: "btn principal grande", onclick: guardar }, "Guardar"),
      existente && h("button", {
        class: "btn peligro",
        onclick: async () => { if (confirm(`¿Borrar «${a.nombre}» del catálogo?`)) { await db.borrar("articulos", a.id); ir("/catalogo"); } },
      }, "Borrar artículo")),
  ];
}
