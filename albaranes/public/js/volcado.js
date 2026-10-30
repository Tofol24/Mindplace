/* Albaranes · volcado al programa de facturación.
   ---------------------------------------------------------------------------
   Para quien no usa Holded (Ajustes → «Destino de los albaranes»), y también como
   control para quien sí: lista los albaranes firmados por fechas y cliente, con
   sus totales, los exporta (CSV para Access/Excel y JSON) y los marca como
   volcados para no meterlos dos veces. Todo se queda en el móvil: los ficheros
   salen solo cuando se comparten o se descargan. Formato: volcado-formato.js.
*/

import * as db from "./db.js";
import { fechaCortaSegura as fechaCorta, formatoEuros, hoyISO, redondear } from "./calculos.js";
import { perfil } from "./perfiles.js";
import { aviso, campo, h, ir, normal } from "./ui.js";
import { csvAlbaranes, csvLineas, datosVolcado, jsonVolcado } from "./volcado-formato.js";

// Filtros de la pantalla: se recuerdan mientras la app está abierta.
const filtro = { desde: "", hasta: "", cliente: "", soloSinVolcar: true, escribiendo: false };

const primeroDeMes = () => `${hoyISO().slice(0, 7)}-01`;

/** Albaranes firmados (no borradores) que cumplen el filtro, del más antiguo al más nuevo. */
async function seleccion() {
  const q = normal(filtro.cliente);
  return (await db.todos("albaranes"))
    .filter((a) => a.estado !== "borrador" && a.numero)
    .filter((a) => (!filtro.desde || a.fecha >= filtro.desde) && (!filtro.hasta || a.fecha <= filtro.hasta))
    .filter((a) => !q || normal(a.cliente?.nombre).includes(q) || normal(a.cliente?.nif).includes(q))
    .filter((a) => !filtro.soloSinVolcar || !a.volcadoEn)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.numero.localeCompare(b.numero));
}

/** Comparte (iPhone/Android) o descarga los ficheros del volcado. */
async function entregar(ctx, ficheros, titulo) {
  if (navigator.canShare?.({ files: ficheros })) {
    try { await navigator.share({ files: ficheros, title: titulo }); return true; } catch (e) {
      if (e?.name === "AbortError") return false;
    }
  }
  for (const f of ficheros) ctx.descargar(f);
  return true;
}

export async function vistaVolcado(ctx) {
  if (!filtro.desde && !filtro.hasta) filtro.desde = primeroDeMes();
  const lista = await seleccion();
  const datos = lista.map(datosVolcado);
  const suma = (k) => redondear(datos.reduce((s, d) => s + d[k], 0));
  const sinVolcar = lista.filter((a) => !a.volcadoEn);

  const repintar = () => ctx.refrescar("/volcado");
  const inDesde = h("input", { type: "date", value: filtro.desde, onchange: (e) => { filtro.desde = e.target.value; repintar(); } });
  const inHasta = h("input", { type: "date", value: filtro.hasta, onchange: (e) => { filtro.hasta = e.target.value; repintar(); } });
  let t;
  const inCliente = h("input", {
    type: "search", value: filtro.cliente, placeholder: "Nombre o NIF", autocomplete: "off",
    oninput: (e) => { filtro.cliente = e.target.value; filtro.escribiendo = true; clearTimeout(t); t = setTimeout(repintar, 400); },
  });
  // Al repintar mientras se escribe el cliente, el cursor sigue en el campo.
  if (filtro.escribiendo) {
    filtro.escribiendo = false;
    setTimeout(() => { inCliente.focus(); const n = inCliente.value.length; try { inCliente.setSelectionRange(n, n); } catch { /* algunos navegadores no lo admiten en «search» */ } }, 0);
  }
  const chkSin = h("input", { type: "checkbox", checked: filtro.soloSinVolcar, onchange: (e) => { filtro.soloSinVolcar = e.target.checked; repintar(); } });

  const exportar = async (formato) => {
    if (!datos.length) { aviso("No hay albaranes con este filtro.", "info"); return; }
    const nombre = `volcado-${filtro.desde || "inicio"}_a_${filtro.hasta || hoyISO()}`;
    const ficheros = formato === "json"
      ? [new File([jsonVolcado(datos)], `${nombre}.json`, { type: "application/json" })]
      : [new File([csvAlbaranes(datos)], `${nombre}-albaranes.csv`, { type: "text/csv" }), new File([csvLineas(datos)], `${nombre}-lineas.csv`, { type: "text/csv" })];
    if (!(await entregar(ctx, ficheros, "Volcado de albaranes"))) return;
    const nuevos = lista.filter((a) => !a.volcadoEn);
    if (nuevos.length && confirm(`¿Marcar ${nuevos.length === 1 ? "este albarán" : `estos ${nuevos.length} albaranes`} como volcados? Así el próximo volcado no los repite.`)) {
      const ahora = new Date().toISOString();
      for (const a of nuevos) {
        const actual = await db.obtener("albaranes", a.id);
        if (actual && actual.estado !== "borrador") { actual.volcadoEn = ahora; await db.guardar("albaranes", actual); }
      }
      aviso(`${nuevos.length === 1 ? "Albarán marcado" : `${nuevos.length} albaranes marcados`} como volcados ✓`);
      ctx.pintarEstado();
      repintar();
    }
  };

  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir("/") }, "‹ Albaranes"),
      h("h2", {}, "Volcado a facturación")),
    h("section", { class: "tarjeta" },
      h("p", { class: "ayuda" }, "Los albaranes firmados, para pasarlos a tu programa de facturación. Exporta, impórtalos allí y márcalos como volcados."),
      h("div", { class: "rejilla" }, campo("Desde", inDesde), campo("Hasta", inHasta)),
      campo("Cliente", inCliente),
      h("label", { class: "campo campo-check" }, chkSin, h("span", {}, "Solo los que faltan por volcar"))),
    h("section", { class: "tarjeta" },
      h("h3", {}, `${datos.length} ${datos.length === 1 ? "albarán" : "albaranes"}${sinVolcar.length && !filtro.soloSinVolcar ? ` · ${sinVolcar.length} sin volcar` : ""}`),
      datos.length
        ? h("ul", { class: "lista-volcado" }, lista.map((a, i) => h("li", {},
          h("button", { type: "button", class: "fila-volcado", onclick: () => ir(`/albaran/${a.id}`) },
            h("span", {}, h("strong", {}, a.cliente?.nombre || "Sin cliente"), h("small", {}, `${fechaCorta(a.fecha)} · ${a.numero}${a.volcadoEn ? " · volcado ✓" : ""}`)),
            h("span", { class: "importe" }, formatoEuros(datos[i].total))))))
        : h("p", { class: "vacio" }, "No hay albaranes firmados con este filtro."),
      !datos.length ? "" : h("div", { class: "totales" },
        h("div", {}, h("span", {}, "Base"), h("span", {}, formatoEuros(suma("baseImponible")))),
        suma("cuotaIva") ? h("div", {}, h("span", {}, "IVA"), h("span", {}, formatoEuros(suma("cuotaIva")))) : "",
        suma("cuotaRetencion") ? h("div", {}, h("span", {}, "Retención IRPF"), h("span", {}, `−${formatoEuros(suma("cuotaRetencion"))}`)) : "",
        h("div", { class: "total" }, h("span", {}, "Total"), h("span", {}, formatoEuros(suma("total")))))),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Exportar"),
      h("div", { class: "botones-linea" },
        h("button", { type: "button", class: "btn principal", onclick: () => exportar("csv") }, "CSV (Access / Excel)"),
        h("button", { type: "button", class: "btn secundario", onclick: () => exportar("json") }, "JSON")),
      h("small", { class: "ayuda" }, "CSV: dos ficheros (albaranes y líneas), separados por «;», con coma decimal y fechas AAAA-MM-DD. El formato está explicado para tu informático en VOLCADO.md."),
      perfil(ctx.ajustes().perfil).compras && h("p", { class: "ayuda" }, "Las compras se exportan por meses desde la pestaña Compras (CSV con las fotos)."),
      h("small", { class: "ayuda" }, "Los ficheros llevan datos de tus clientes: guárdalos en un sitio seguro y bórralos del móvil o del correo cuando ya estén en tu programa.")),
  ];
}
