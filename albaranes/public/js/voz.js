/* Albaranes · dictar el albarán con la voz.
   ---------------------------------------------------------------------------
   Pere habla («Cliente Jesús Arribas, cambio de grifo, un monomando y hora y
   media») y la IA rellena el albarán: cliente, trabajo y líneas, con los artículos
   y precios de su catálogo. La transcripción la hace el propio móvil:
     · con el botón 🎤, si el navegador tiene reconocimiento de voz;
     · o con el micrófono del teclado, que funciona en cualquier móvil.
   Sin cobertura, el dictado se guarda en el borrador y se aplica al volver la señal.
*/

import * as db from "./db.js";
import { redondear } from "./calculos.js";
import { precioVenta } from "./catalogo.js";
import { reducirFoto } from "./compras.js";
import { aviso, h } from "./ui.js";
import { dictadoPermitido, perfil } from "./perfiles.js";

const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;

/** Catálogo reducido que se manda con el dictado, para enlazar los artículos nombrados. */
async function catalogoParaIA() {
  return (await db.todos("articulos")).slice(0, 500).map((a) => ({ id: a.id, nombre: a.nombre, ref: a.ref || "" }));
}

/**
 * Mezcla en el borrador lo que ha entendido la IA. Solo rellena los datos del cliente
 * que estén vacíos (no pisa lo escrito a mano) y añade las líneas al final.
 */
export async function aplicarDictado(alb, d, ajustes, textoDictado = "") {
  const c = alb.cliente;
  const vinoCliente = d.cliente.nombre && !c.nombre;
  for (const k of ["nombre", "telefono", "email", "nif", "direccion", "poblacion"]) {
    if (!c[k] && d.cliente[k]) c[k] = d.cliente[k];
  }
  if (vinoCliente) c.holdedId = "";
  if (!alb.direccionObra && d.direccionObra) alb.direccionObra = d.direccionObra;
  if (d.trabajo) alb.trabajo = alb.trabajo ? `${alb.trabajo}\n${d.trabajo}` : d.trabajo;
  if (d.observaciones) alb.observaciones = alb.observaciones ? `${alb.observaciones}\n${d.observaciones}` : d.observaciones;
  // Servicios dictados que no están en la lista: no se han añadido. Queda un aviso en el borrador
  // (con lo dictado, que no sale del móvil) hasta revisarlo; sin revisarlo no se firma.
  if (d.omitidas > 0) {
    const previo = alb.avisoDictado || { omitidas: 0, texto: "" };
    alb.avisoDictado = { omitidas: previo.omitidas + d.omitidas, texto: [previo.texto, textoDictado].filter(Boolean).join(" / ").slice(0, 2000) };
  }
  const articulos = new Map((await db.todos("articulos")).map((a) => [a.id, a]));
  // Servicios: el precio de cada servicio habitual nombrado (la IA deja el precio en null).
  const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const servicios = new Map((perfil(ajustes.perfil).compras ? [] : ajustes.servicios || []).map((sv) => [norm(sv.nombre), sv.precio]));
  for (const l of d.lineas) {
    const art = l.articuloId ? articulos.get(l.articuloId) : null;
    const linea = { concepto: l.concepto, cantidad: l.cantidad, precio: 0, iva: ajustes.ivaDefecto };
    if (art) {
      Object.assign(linea, { concepto: art.nombre, articuloId: art.id, coste: art.coste, precio: l.precio ?? precioVenta(art, ajustes.margen) });
    } else if (l.tipo === "mano_obra") {
      Object.assign(linea, { unidad: "h", precio: l.precio ?? ajustes.precioHora });
    } else if (l.tipo === "desplazamiento") {
      linea.precio = l.precio ?? ajustes.precioDesplazamiento;
    } else {
      linea.precio = l.precio ?? servicios.get(norm(l.concepto)) ?? 0;
    }
    linea.precio = redondear(linea.precio);
    alb.lineas.push(linea);
  }
}

// ---------------------------------------------------------------------------
// Pantallazo de una cita de la agenda (servicios profesionales)
// ---------------------------------------------------------------------------

const normCita = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Mezcla en el borrador lo leído de una cita. Rellena el paciente si el albarán aún no tiene
 * cliente, la fecha si aún no tiene líneas, y añade la sesión (solo si es un servicio de la lista
 * y la cita no está marcada «No ha venido»). Devuelve el texto para el usuario.
 */
export function aplicarCita(alb, cita, ajustes) {
  if (!cita.esCita) return { ok: false, texto: "La imagen no parece una cita de la agenda." };
  const c = alb.cliente;
  if (c.nombre && cita.paciente && normCita(c.nombre) !== normCita(cita.paciente)) {
    return { ok: false, texto: `La cita es de «${cita.paciente}» y este albarán es de «${c.nombre}». Haz un albarán nuevo para esa cita.` };
  }
  if (cita.asistencia === "no_ha_venido") return { ok: false, texto: "Esa cita está marcada «No ha venido»: no se ha añadido." };
  if (!c.nombre && cita.paciente) { c.nombre = cita.paciente; c.holdedId = ""; }
  if (!c.telefono && cita.telefono) c.telefono = cita.telefono;
  if (!alb.lineas.length && cita.fecha) alb.fecha = cita.fecha;
  const avisos = [];
  if (cita.servicio) {
    const habitual = (ajustes.servicios || []).find((sv) => normCita(sv.nombre) === normCita(cita.servicio));
    const precio = cita.precio ?? habitual?.precio ?? 0;
    alb.lineas.push({ concepto: cita.servicio, cantidad: 1, precio: redondear(precio), iva: ajustes.ivaDefecto });
  } else {
    // Igual que en el dictado: aviso que se queda en el borrador hasta revisarlo (no sale del móvil).
    const previo = alb.avisoDictado || { omitidas: 0, texto: "" };
    const lo = `cita del ${cita.fecha || "?"}${cita.servicioFueraDeLista ? `: «${cita.servicioFueraDeLista}»` : ""}`;
    alb.avisoDictado = { omitidas: previo.omitidas + 1, texto: [previo.texto, lo].filter(Boolean).join(" / ").slice(0, 2000) };
    avisos.push("El servicio de la cita no está en tus servicios habituales: añádelo a mano (o a la lista, en Ajustes).");
  }
  if (cita.aseguradora) avisos.push(`La cita es de la aseguradora «${cita.aseguradora}»: quizá el albarán debe ir a su nombre.`);
  if (cita.asistencia === "desconocido") avisos.push("No se ve si la cita está marcada como visitada: compruébalo.");
  return { ok: true, texto: [cita.servicio ? `Cita añadida: ${cita.servicio}.` : "Paciente y fecha rellenados.", ...avisos].join(" ") };
}

/** Manda un dictado a la IA. Devuelve { ok, datos } o { error, pasajero }. */
async function interpretar(ctx, texto) {
  // Última barrera: con un perfil sin dictado (p. ej. servicios sanitarios) nada sale hacia la IA.
  if (!dictadoPermitido(ctx.ajustes())) return { error: "El dictado no está disponible con este tipo de actividad.", pasajero: false };
  let r;
  try {
    const a = ctx.ajustes();
    // Servicios: sus servicios habituales y nada del catálogo de material.
    const body = perfil(a.perfil).compras
      ? { texto, catalogo: await catalogoParaIA() }
      : { texto, perfil: "servicios", servicios: (a.servicios || []).map((sv) => ({ nombre: sv.nombre, precio: sv.precio })) };
    r = await ctx.llamarAPI("/api/ia/dictado", { method: "POST", body });
  } catch {
    return { error: "Sin conexión", pasajero: true };
  }
  if (r.ok && r.datos.ok) return { ok: true, datos: r.datos.albaran };
  return { error: r.datos.error || `Error ${r.status}`, pasajero: r.datos.reintentar !== false };
}

/** Aplica los dictados que quedaron guardados sin cobertura. */
export async function aplicarDictadosPendientes(ctx) {
  if (!navigator.onLine || !ctx.ajustes().claveApp || !dictadoPermitido(ctx.ajustes())) return;
  const borradores = (await db.todos("albaranes")).filter((a) => a.estado === "borrador" && a.dictadoPendiente);
  for (const alb of borradores) {
    // Si Pere tiene ese borrador abierto, lo aplica él con el botón (así no se pisan los cambios).
    if (location.hash === `#/editar/${alb.id}`) continue;
    const r = await interpretar(ctx, alb.dictadoPendiente);
    if (!r.ok) { if (r.pasajero) return; continue; }
    const actual = await db.obtener("albaranes", alb.id);
    if (!actual || actual.estado !== "borrador" || actual.dictadoPendiente !== alb.dictadoPendiente) continue;
    await aplicarDictado(actual, r.datos, ctx.ajustes(), actual.dictadoPendiente);
    delete actual.dictadoPendiente;
    actual.actualizado = new Date().toISOString();
    if (await db.guardarBorrador(actual)) {
      const de = actual.cliente.nombre ? ` de ${actual.cliente.nombre}` : "";
      if (actual.avisoDictado) aviso(`Dictado aplicado al albarán${de}, pero falta algún servicio: revísalo antes de firmar.`, "error");
      else aviso(`Dictado aplicado al albarán${de} ✓`, "info");
      ctx.refrescar(`/editar/${actual.id}`);
    }
  }
}

/**
 * Bloque de dictado para el editor. `alAplicar()` se llama tras rellenar el borrador
 * (para repintar el formulario); `guardar()` guarda el borrador.
 */
export function panelDictado(ctx, alb, { alAplicar, guardar }) {
  const texto = h("textarea", {
    rows: 3,
    placeholder: perfil(ctx.ajustes().perfil).placeholderDictado || perfil().placeholderDictado,
    "aria-label": "Dictado del albarán",
  });
  const estado = h("p", { class: "ayuda", role: "status" });
  // Dictado guardado sin cobertura: con el borrador abierto, se aplica con este botón.
  const pendiente = alb.dictadoPendiente && h("div", { class: "pendiente-dictado" },
    h("p", {}, `Dictado guardado sin cobertura: «${alb.dictadoPendiente.slice(0, 160)}${alb.dictadoPendiente.length > 160 ? "…" : ""}»`),
    h("button", {
      type: "button", class: "btn secundario",
      onclick: async (e) => {
        if (!navigator.onLine || !ctx.ajustes().claveApp) { estado.textContent = "Aún no hay cobertura. Se puede aplicar en cuanto vuelva."; return; }
        e.target.disabled = true;
        estado.textContent = "Rellenando el albarán…";
        const r = await interpretar(ctx, alb.dictadoPendiente);
        e.target.disabled = false;
        if (!r.ok) { estado.textContent = r.pasajero ? "No se ha podido ahora; vuelve a intentarlo en un momento." : r.error; return; }
        await aplicarDictado(alb, r.datos, ctx.ajustes(), alb.dictadoPendiente);
        delete alb.dictadoPendiente;
        await guardar();
        alAplicar();
      },
    }, "Aplicar el dictado guardado"));

  let rec = null;
  let base = "";
  const micro = Reconocimiento && h("button", {
    type: "button", class: "btn secundario btn-micro",
    onclick: () => {
      if (rec) { rec.stop(); return; }
      rec = new Reconocimiento();
      rec.lang = "es-ES";
      rec.continuous = true;
      rec.interimResults = true;
      base = texto.value ? `${texto.value.trim()} ` : "";
      rec.onresult = (e) => {
        let final = "";
        let parcial = "";
        for (const r of e.results) (r.isFinal ? (final += r[0].transcript) : (parcial += r[0].transcript));
        texto.value = `${base}${final}${parcial}`;
      };
      rec.onerror = (e) => {
        estado.textContent = e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "El móvil no deja usar el micrófono aquí. Usa el micrófono del teclado."
          : e.error === "network" ? "Sin cobertura no se puede transcribir aquí: usa el micrófono del teclado." : "";
      };
      // El micrófono se apaga al salir de la pantalla o al dejar la app en segundo plano.
      const apagar = () => rec?.abort();
      const alOcultar = () => { if (document.visibilityState === "hidden") apagar(); };
      window.addEventListener("hashchange", apagar, { once: true });
      document.addEventListener("visibilitychange", alOcultar);
      rec.onend = () => {
        rec = null;
        window.removeEventListener("hashchange", apagar);
        document.removeEventListener("visibilitychange", alOcultar);
        micro.textContent = "🎤 Hablar";
        micro.classList.remove("grabando");
      };
      try {
        rec.start();
        micro.textContent = "⏹ Parar";
        micro.classList.add("grabando");
        estado.textContent = "Escuchando… habla con normalidad.";
      } catch {
        rec = null;
        estado.textContent = "No se ha podido usar el micrófono. Usa el del teclado.";
      }
    },
  }, "🎤 Hablar");

  const rellenar = h("button", {
    type: "button", class: "btn principal",
    onclick: async () => {
      rec?.stop();
      const t = texto.value.trim();
      if (!t) { estado.textContent = "Primero dicta o escribe qué se ha hecho."; return; }
      if (!navigator.onLine || !ctx.ajustes().claveApp) {
        alb.dictadoPendiente = alb.dictadoPendiente ? `${alb.dictadoPendiente}\n${t}` : t;
        await guardar();
        texto.value = "";
        estado.textContent = "Sin cobertura: el dictado queda guardado y se aplicará solo cuando vuelva la señal.";
        return;
      }
      rellenar.disabled = true;
      estado.textContent = "Rellenando el albarán…";
      const r = await interpretar(ctx, t);
      rellenar.disabled = false;
      if (!r.ok) {
        if (r.pasajero) {
          alb.dictadoPendiente = alb.dictadoPendiente ? `${alb.dictadoPendiente}\n${t}` : t;
          await guardar();
          texto.value = "";
          estado.textContent = "No se ha podido ahora: el dictado queda guardado y se aplicará solo.";
        } else {
          estado.textContent = r.error;
        }
        return;
      }
      await aplicarDictado(alb, r.datos, ctx.ajustes(), t);
      texto.value = "";
      estado.textContent = `Listo: ${r.datos.lineas.length} líneas añadidas. Revisa los precios antes de firmar.`;
      await guardar();
      alAplicar();
    },
  }, "✨ Rellenar el albarán");

  // Servicios: también desde el pantallazo de la cita en la agenda.
  const servicios = !perfil(ctx.ajustes().perfil).compras;
  const entradaFoto = servicios && h("input", {
    type: "file", accept: "image/*", hidden: true,
    onchange: async (e) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;
      const a = ctx.ajustes();
      if (!dictadoPermitido(a)) { estado.textContent = "Activa «Rellenar con IA» en Ajustes."; return; }
      if (!navigator.onLine || !a.claveApp) { estado.textContent = "Para leer la cita hace falta cobertura."; return; }
      estado.textContent = "Leyendo la cita…";
      let r;
      try {
        const foto = await reducirFoto(f);
        r = await ctx.llamarAPI("/api/ia/cita", { method: "POST", body: { imagen: foto.split(",")[1], tipoImagen: "image/jpeg", servicios: (a.servicios || []).map((sv) => ({ nombre: sv.nombre, precio: sv.precio })) } });
      } catch {
        estado.textContent = "No se ha podido leer ahora; vuelve a intentarlo con cobertura.";
        return;
      }
      if (!(r.ok && r.datos.ok)) { estado.textContent = r.datos?.error || `Error ${r.status}`; return; }
      const res = aplicarCita(alb, r.datos.cita, a);
      estado.textContent = res.texto;
      if (!res.ok) return;
      await guardar();
      aviso(res.texto, "info");
      alAplicar();
    },
  });
  const botonFoto = servicios && h("button", { type: "button", class: "btn secundario", onclick: () => entradaFoto.click() }, "📷 Desde la agenda");

  return h("section", { class: "tarjeta dictado" },
    h("h3", {}, servicios ? "Rellenar con IA" : "Dictar el albarán"),
    pendiente,
    texto,
    h("div", { class: "botones-linea" }, micro, rellenar, botonFoto),
    servicios && h("small", { class: "ayuda" }, "«Desde la agenda»: elige el pantallazo de la cita y se rellenan el paciente, la fecha y la sesión."),
    entradaFoto,
    estado);
}
