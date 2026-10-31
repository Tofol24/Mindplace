/* Albaranes · consentimiento RGPD de los pacientes, firmado con el dedo.
   ---------------------------------------------------------------------------
   Perfil «servicios», si se activa en Ajustes. En una primera visita (un servicio
   cuyo nombre contiene la palabra clave de Ajustes, «primera» por defecto), el
   albarán avisa si el paciente aún no lo ha firmado. Se firma en el móvil: el
   paciente, un representante legal o dos (tutores separados).
   Se queda solo en el móvil (y en la copia de seguridad): nunca va a Holded, al
   volcado ni a la IA. El PDF sale solo si se comparte o se descarga.
*/

import * as db from "./db.js";
import { lienzoFirma } from "./firma.js";
import { generarPDFConsentimiento, nombrePDFConsentimiento } from "./pdf.js";
import { TEXTO_VERSION, TIPOS, apartados, consentimientoDe, opciones, pideConsentimiento } from "./consentimiento-texto.js";
import { aviso, campo, h, ir, uuid } from "./ui.js";

export const CONSENTIMIENTO_DEF = { activo: false, clave: "primera", colegiado: "", dpd: "", herramienta: "" };
const fechaHora = (iso) => new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });

/** Datos del responsable para el texto: los del negocio y los del consentimiento en Ajustes. */
function responsable(ajustes) {
  const n = ajustes.negocio || {};
  const c = ajustes.consentimiento || {};
  return { nombre: n.nombre, nif: n.nif, direccion: n.direccion, telefono: n.telefono, email: n.email, colegiado: c.colegiado || "", dpd: c.dpd || "" };
}

export const activo = (ajustes, pf) => !pf.compras && ajustes.consentimiento?.activo === true;

/** Lo que falta en Ajustes para poder firmar un consentimiento (sale en el texto legal). */
function faltaEnAjustes(ajustes) {
  const n = ajustes.negocio || {};
  return [[n.nombre, "nombre"], [n.nif, "NIF"], [n.direccion, "dirección"], [n.email, "email"]].filter(([v]) => !String(v || "").trim()).map(([, k]) => k);
}

/**
 * Tarjeta del albarán: en una primera visita, si este paciente aún no ha firmado, ofrece
 * firmarlo; si ya lo firmó, lo dice. Si solo coincide el nombre, pregunta si es la misma
 * persona (con `vincular`, que lo anota en el albarán). Devuelve { el, pintar }.
 * `antesDeIr` guarda el borrador: si devuelve false, no se sale de la pantalla.
 */
export async function tarjetaConsentimiento(ajustes, alb, { antesDeIr, vincular } = {}) {
  const el = h("div");
  const lista = await db.todos("consentimientos");
  const irA = async (ruta) => { if ((await antesDeIr?.()) === false) return; ir(ruta); };
  const pintar = () => {
    const m = consentimientoDe(alb.cliente, lista, alb);
    const toca = pideConsentimiento(alb.lineas, ajustes.consentimiento?.clave);
    const ver = (c) => h("button", { type: "button", class: "btn enlace", onclick: () => irA(`/consentimiento/${c.id}`) }, "Ver");
    const firmar = h("button", { type: "button", class: "btn principal", onclick: () => irA(`/consentir/${alb.id}`) }, "Firmar el consentimiento");
    if (m?.seguro) {
      el.replaceChildren(h("p", { class: "ayuda consent-ok" }, `Consentimiento RGPD firmado el ${fechaHora(m.c.firmadoEn)} ✓ `, ver(m.c)));
    } else if (m && (toca || vincular)) {
      el.replaceChildren(h("section", { class: "tarjeta aviso-tarjeta" },
        h("strong", {}, "¿Es el mismo paciente?"),
        h("p", {}, `Hay un consentimiento firmado el ${fechaHora(m.c.firmadoEn)} por alguien con este nombre, pero sin NIF ni teléfono para comprobar que es la misma persona.`),
        h("div", { class: "botones-linea" },
          vincular && h("button", { type: "button", class: "btn secundario", onclick: () => { vincular(m.c.id); pintar(); } }, "Sí, es el mismo"),
          ver(m.c)),
        toca && firmar));
    } else if (toca && alb.cliente?.nombre?.trim()) {
      el.replaceChildren(h("section", { class: "tarjeta aviso-tarjeta" },
        h("strong", {}, "Consentimiento informado"),
        h("p", {}, `Es una primera visita y ${alb.cliente.nombre.trim()} aún no ha firmado el consentimiento RGPD.`),
        firmar));
    } else el.replaceChildren();
  };
  pintar();
  return { el, pintar };
}

// --- Firmar ---------------------------------------------------------------

export function vistaConsentir(ctx, alb) {
  const ajustes = ctx.ajustes();
  const volver = alb.estado === "borrador" ? `/editar/${alb.id}` : `/albaran/${alb.id}`;
  const falta = faltaEnAjustes(ajustes);
  if (falta.length) {
    return [
      h("div", { class: "cab-vista" }, h("button", { class: "btn-volver", onclick: () => ir(volver) }, "‹ Volver"), h("h2", {}, "Consentimiento")),
      h("section", { class: "tarjeta estado-alb aviso" },
        h("strong", {}, "Faltan datos en Ajustes"),
        h("p", {}, `El texto del consentimiento lleva tus datos como responsable. Pon en Ajustes: ${falta.join(", ")}.`)),
    ];
  }
  const cl = alb.cliente || {};
  const paciente = {
    nombre: cl.nombre || "", nif: cl.nif || "", email: cl.email || "", telefono: cl.telefono || "",
    direccion: [cl.direccion, [cl.cp, cl.poblacion].filter(Boolean).join(" ")].filter(Boolean).join(", "),
  };
  const reps = [{ nombre: "", dni: "" }, { nombre: "", dni: "" }];
  let tipo = "paciente";
  const marcadas = {};
  const ent = (obj, k, attrs = {}) => h("input", { value: obj[k], maxlength: "300", ...attrs, oninput: (e) => { obj[k] = e.target.value; } });

  const r = responsable(ajustes);
  const textoLegal = h("div", { class: "texto-legal", tabindex: "0", role: "region", "aria-label": "Texto del consentimiento" },
    h("p", {}, h("strong", {}, `${r.nombre}`), ` · CIF: ${r.nif}${r.colegiado ? ` · Nº Coleg: ${r.colegiado}` : ""}`),
    apartados(r).map((a) => h("p", {}, a.titulo && h("strong", {}, `${a.titulo}: `), a.texto)));

  const contReps = h("div");
  const contOpciones = h("div");
  const contFirmas = h("div");
  let lienzos = [];
  const pintarTipo = () => {
    const n = TIPOS[tipo].firmas;
    const conReps = tipo !== "paciente";
    contReps.replaceChildren(...(conReps ? reps.slice(0, n).map((rep, i) => {
      const s = n > 1 ? ` ${i + 1}` : "";
      return h("div", { class: "rejilla" }, campo(`Representante legal${s}`, ent(rep, "nombre", { autocomplete: "off" })), campo(`DNI${s}`, ent(rep, "dni", { autocapitalize: "characters", autocomplete: "off" })));
    }) : []));
    contOpciones.replaceChildren(...opciones(tipo, ajustes.consentimiento?.herramienta).map((o) => h("label", { class: "campo campo-check" },
      h("input", { type: "checkbox", checked: !!marcadas[o.clave], onchange: (e) => { marcadas[o.clave] = e.target.checked; } }),
      h("span", { class: "texto-opcion" }, o.texto))));
    lienzos = Array.from({ length: n }, (_, i) => lienzoFirma(n > 1 ? `Firma ${i + 1}` : "Firma"));
    contFirmas.replaceChildren(...lienzos.map((l, i) => h("div", { class: "bloque-firma" },
      h("h3", {}, n > 1 ? `Firma ${i + 1}` : "Firma"),
      l.canvas,
      h("button", { type: "button", class: "btn enlace", onclick: l.borrar }, "Borrar firma"))));
  };
  const selTipo = h("select", { onchange: (e) => { tipo = e.target.value; pintarTipo(); } },
    Object.entries(TIPOS).map(([k, t]) => h("option", { value: k, selected: k === tipo }, t.nombre)));
  pintarTipo();

  const error = h("p", { class: "error-form", role: "alert" });
  let guardando = false;
  const firmar = async () => {
    if (guardando) return;
    const n = TIPOS[tipo].firmas;
    const fallos = [];
    if (!paciente.nombre.trim()) fallos.push("el nombre del paciente");
    if (tipo !== "paciente" && reps.slice(0, n).some((x) => !x.nombre.trim() || !x.dni.trim())) fallos.push(n > 1 ? "el nombre y el DNI de los dos representantes" : "el nombre y el DNI del representante");
    if (lienzos.some((l) => !l.hayTrazo())) fallos.push(n > 1 ? "las dos firmas" : "la firma");
    if (fallos.length) { error.textContent = `${fallos.length > 1 || fallos[0].startsWith("las ") ? "Faltan" : "Falta"} ${fallos.join(", ")}.`; return; }
    guardando = true;
    const limpio = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v || "").trim()]));
    const representantes = tipo === "paciente" ? [] : reps.slice(0, n).map(limpio);
    const pac = limpio(paciente);
    const consentimiento = {
      id: uuid(),
      tipo,
      textoVersion: TEXTO_VERSION,
      firmadoEn: new Date().toISOString(),
      responsable: r,
      paciente: pac,
      representantes,
      // El texto tal cual se firmó: el PDF lo muestra siempre igual aunque cambie la app.
      apartados: apartados(r),
      opciones: opciones(tipo, ajustes.consentimiento?.herramienta).map((o) => ({ ...o, marcada: !!marcadas[o.clave] })),
      firmas: lienzos.map((l, i) => ({ imagen: l.imagen(), nombre: tipo === "paciente" ? pac.nombre : representantes[i].nombre })),
      albaranId: alb.id,
    };
    try {
      await db.guardar("consentimientos", consentimiento);
      aviso("Consentimiento firmado y guardado en el móvil ✓");
      ir(`/consentimiento/${consentimiento.id}`);
    } catch {
      guardando = false;
      error.textContent = "No se ha podido guardar. Inténtalo otra vez.";
    }
  };

  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir(volver) }, "‹ Volver"),
      h("h2", {}, "Consentimiento")),
    h("p", { class: "ayuda" }, "Pásale el móvil al paciente (o a su representante) para que lo lea, revise sus datos y firme con el dedo."),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Paciente"),
      campo("Nombre", ent(paciente, "nombre", { autocomplete: "off" })),
      h("div", { class: "rejilla" }, campo("NIF", ent(paciente, "nif", { autocapitalize: "characters", autocomplete: "off" })), campo("Teléfono", ent(paciente, "telefono", { inputmode: "tel", autocomplete: "off" }))),
      campo("Email", ent(paciente, "email", { type: "email", inputmode: "email", autocomplete: "off" })),
      campo("Dirección", ent(paciente, "direccion", { autocomplete: "off" })),
      campo("Quién firma", selTipo),
      contReps),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Consentimiento R.G.P.D. – Pacientes"),
      textoLegal),
    h("section", { class: "tarjeta" },
      h("h3", {}, "Marque lo que autoriza"),
      contOpciones),
    contFirmas,
    error,
    h("div", { class: "acciones" }, h("button", { class: "btn principal grande", onclick: firmar }, "Firmar y guardar")),
  ];
}

// --- Ver y compartir ------------------------------------------------------

const fichero = (c) => new File([generarPDFConsentimiento(c)], nombrePDFConsentimiento(c), { type: "application/pdf" });

async function compartir(ctx, c) {
  const f = fichero(c);
  if (navigator.canShare?.({ files: [f] })) {
    try { await navigator.share({ files: [f], title: "Consentimiento RGPD" }); } catch (e) {
      if (e?.name !== "AbortError") aviso("No se ha podido compartir. Prueba a descargar el PDF.", "error");
    }
    return;
  }
  ctx.descargar(f);
}

export async function vistaConsentimiento(ctx, id) {
  const c = await db.obtener("consentimientos", id);
  if (!c) { ir("/consentimientos"); return []; }
  const alb = c.albaranId && (await db.obtener("albaranes", c.albaranId));
  const volver = alb ? (alb.estado === "borrador" ? `/editar/${alb.id}` : `/albaran/${alb.id}`) : "/consentimientos";
  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir(volver) }, alb ? "‹ Albarán" : "‹ Consentimientos"),
      h("h2", {}, "Consentimiento")),
    h("section", { class: "tarjeta estado-alb ok" },
      h("strong", {}, `${c.paciente.nombre} ✓`),
      h("p", {}, `Firmado el ${fechaHora(c.firmadoEn)}${c.representantes.length ? ` por ${c.representantes.map((x) => x.nombre).join(" y ")}` : ""}. Guardado solo en este móvil.`),
      h("ul", { class: "lineas-lectura" }, c.opciones.map((o) => h("li", {}, h("span", {}, o.clave === "online" ? "Sesiones en línea" : "Informes por correo"), h("span", {}, o.marcada ? "Sí" : "No"))))),
    h("section", { class: "tarjeta" },
      h("button", { class: "btn principal grande", onclick: () => compartir(ctx, c) }, "Enviar PDF (WhatsApp, email…)"),
      h("div", { class: "botones-linea" },
        h("button", { class: "btn secundario", onclick: () => ctx.descargar(fichero(c)) }, "Ver / descargar PDF")),
      h("small", { class: "ayuda" }, "Guarda el PDF en la historia clínica. Lleva datos del paciente: compártelo solo por un canal seguro.")),
    h("div", { class: "acciones" },
      h("button", {
        class: "btn peligro",
        onclick: async () => {
          if (!confirm("¿Borrar este consentimiento firmado? Hazlo solo si se firmó por error: si no, guárdalo.")) return;
          await db.borrar("consentimientos", c.id);
          ir(volver);
        },
      }, "Borrar (firmado por error)")),
  ];
}

export async function vistaConsentimientos() {
  const lista = (await db.todos("consentimientos")).sort((a, b) => String(b.firmadoEn).localeCompare(String(a.firmadoEn)));
  return [
    h("div", { class: "cab-vista" },
      h("button", { class: "btn-volver", onclick: () => ir("/ajustes") }, "‹ Ajustes"),
      h("h2", {}, "Consentimientos")),
    h("section", { class: "tarjeta" },
      lista.length
        ? h("ul", { class: "lista-volcado" }, lista.map((c) => h("li", {},
          h("button", { type: "button", class: "fila-volcado", onclick: () => ir(`/consentimiento/${c.id}`) },
            h("span", {}, h("strong", {}, c.paciente.nombre), h("small", {}, `${fechaHora(c.firmadoEn)}${c.representantes.length ? ` · ${c.representantes.length === 1 ? "representante" : "dos representantes"}` : ""}`))))))
        : h("p", { class: "vacio" }, "Aún no hay consentimientos firmados.")),
  ];
}
