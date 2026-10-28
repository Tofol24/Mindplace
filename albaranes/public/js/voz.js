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
import { aviso, h } from "./ui.js";

const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;

/** Catálogo reducido que se manda con el dictado, para enlazar los artículos nombrados. */
async function catalogoParaIA() {
  return (await db.todos("articulos")).slice(0, 500).map((a) => ({ id: a.id, nombre: a.nombre, ref: a.ref || "" }));
}

/**
 * Mezcla en el borrador lo que ha entendido la IA. Solo rellena los datos del cliente
 * que estén vacíos (no pisa lo escrito a mano) y añade las líneas al final.
 */
export async function aplicarDictado(alb, d, ajustes) {
  const c = alb.cliente;
  const vinoCliente = d.cliente.nombre && !c.nombre;
  for (const k of ["nombre", "telefono", "email", "nif", "direccion", "poblacion"]) {
    if (!c[k] && d.cliente[k]) c[k] = d.cliente[k];
  }
  if (vinoCliente) c.holdedId = "";
  if (!alb.direccionObra && d.direccionObra) alb.direccionObra = d.direccionObra;
  if (d.trabajo) alb.trabajo = alb.trabajo ? `${alb.trabajo}\n${d.trabajo}` : d.trabajo;
  if (d.observaciones) alb.observaciones = alb.observaciones ? `${alb.observaciones}\n${d.observaciones}` : d.observaciones;
  const articulos = new Map((await db.todos("articulos")).map((a) => [a.id, a]));
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
      linea.precio = l.precio ?? 0;
    }
    linea.precio = redondear(linea.precio);
    alb.lineas.push(linea);
  }
}

/** Manda un dictado a la IA. Devuelve { ok, datos } o { error, pasajero }. */
async function interpretar(ctx, texto) {
  let r;
  try {
    r = await ctx.llamarAPI("/api/ia/dictado", { method: "POST", body: { texto, catalogo: await catalogoParaIA() } });
  } catch {
    return { error: "Sin conexión", pasajero: true };
  }
  if (r.ok && r.datos.ok) return { ok: true, datos: r.datos.albaran };
  return { error: r.datos.error || `Error ${r.status}`, pasajero: r.datos.reintentar !== false };
}

/** Aplica los dictados que quedaron guardados sin cobertura. */
export async function aplicarDictadosPendientes(ctx) {
  if (!navigator.onLine || !ctx.ajustes().claveApp) return;
  const borradores = (await db.todos("albaranes")).filter((a) => a.estado === "borrador" && a.dictadoPendiente);
  for (const alb of borradores) {
    // Si Pere tiene ese borrador abierto, lo aplica él con el botón (así no se pisan los cambios).
    if (location.hash === `#/editar/${alb.id}`) continue;
    const r = await interpretar(ctx, alb.dictadoPendiente);
    if (!r.ok) { if (r.pasajero) return; continue; }
    const actual = await db.obtener("albaranes", alb.id);
    if (!actual || actual.estado !== "borrador" || actual.dictadoPendiente !== alb.dictadoPendiente) continue;
    await aplicarDictado(actual, r.datos, ctx.ajustes());
    delete actual.dictadoPendiente;
    actual.actualizado = new Date().toISOString();
    if (await db.guardarBorrador(actual)) {
      aviso(`Dictado aplicado al albarán${actual.cliente.nombre ? ` de ${actual.cliente.nombre}` : ""} ✓`, "info");
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
    placeholder: "Pulsa 🎤 y habla, o usa el micrófono del teclado. Ej.: «Cliente Jesús Arribas, teléfono 600 111 222. Cambio de grifo del baño: un grifo monomando, dos latiguillos y hora y media de mano de obra.»",
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
        await aplicarDictado(alb, r.datos, ctx.ajustes());
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
      await aplicarDictado(alb, r.datos, ctx.ajustes());
      texto.value = "";
      estado.textContent = `Listo: ${r.datos.lineas.length} líneas añadidas. Revisa los precios antes de firmar.`;
      await guardar();
      alAplicar();
    },
  }, "✨ Rellenar el albarán");

  return h("section", { class: "tarjeta dictado" },
    h("h3", {}, "Dictar el albarán"),
    pendiente,
    texto,
    h("div", { class: "botones-linea" }, micro, rellenar),
    estado);
}
