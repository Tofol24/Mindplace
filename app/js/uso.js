/* ============================================================
   APRENS · Contador anónimo de uso
   ------------------------------------------------------------
   Cuenta cuántas veces se entra en la app y qué herramientas se abren,
   cuánto rato se usan y cuántos registros nuevos se guardan, para que el
   psicólogo sepa qué resulta más útil. NO envía nada que identifique a la
   persona: ni código de paciente, ni lo que escribe, ni identificadores de
   dispositivo. Solo eventos sueltos («se ha abierto Bajar la alerta») que el
   servidor suma por día (ver netlify/lib/uso.mjs).

   No se envía NADA hasta que la persona elige «Sí, contar» en el aviso que
   aparece la primera vez. La elección se puede cambiar en el aviso de
   privacidad del inicio y respeta Global Privacy Control.
   ============================================================ */
(function () {
  "use strict";
  var DEC = "aprens_uso_dec";        // {"v":"si"|"no","t":fecha} · la elección de la persona
  var LOCAL = "aprens_uso_local";    // fecha de la última entrada (para «primera del día»)
  var PEND = "aprens_uso_pend";      // visitas en pausa por pestaña (app en segundo plano)
  var LIBRO = "aprens_uso_reg";      // registros ya contados por herramienta (evita duplicar entre pestañas)
  var host = location.hostname;
  // Solo cuenta en la web publicada: ni en local ni en las vistas previas de Netlify.
  var publicado = location.protocol === "https:" && host.indexOf("--") < 0 && !/^(localhost|127\.|0\.0\.0\.0)/.test(host);
  var ID = /^[a-z0-9_]{1,40}$/;
  var PESTANA = Math.random().toString(36).slice(2, 10);   // solo para esta pestaña; no sale del dispositivo
  var ABANDONO = 30 * 60000;          // una visita en pausa más de 30 min se da por terminada

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function escribir(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function leerJSON(k) { try { return JSON.parse(leer(k) || "null"); } catch (e) { return null; } }

  function decision() {
    var d = leerJSON(DEC);
    if (d && (d.v === "si" || d.v === "no")) return d;
    if (leer("aprens_uso_off") === "1") return { v: "no", t: 0 };   // versión anterior
    return null;
  }
  function guardarDecision(v, t) { escribir(DEC, JSON.stringify({ v: v, t: t || Date.now() })); escribir("aprens_uso_off", null); }
  function activo() { var d = decision(); return publicado && !!d && d.v === "si" && !navigator.globalPrivacyControl; }

  // Mi espacio (otro sitio) pasa en el enlace un «no» con su fecha: ?uso=no-<fecha>.
  // Un enlace nunca puede activar el contador (el «sí» se da aquí, en el aviso);
  // un «no» solo se aplica si es más reciente que la elección de la app.
  (function () {
    try {
      var u = new URL(location.href);
      if (!u.searchParams.has("uso")) return;
      var m = /^no-(\d{1,15})$/.exec(u.searchParams.get("uso") || "");
      if (m && +m[1] <= Date.now()) { var d = decision(); if (!d || +m[1] > d.t) { guardarDecision("no", +m[1]); escribir("aprens_uso_pend", null); } }
      u.searchParams.delete("uso");
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  })();

  function enviar(ev) {
    if (!activo()) return;
    try {
      var cuerpo = JSON.stringify(ev);
      if (navigator.sendBeacon && navigator.sendBeacon("/api/uso", cuerpo)) return;
      fetch("/api/uso", { method: "POST", body: cuerpo, keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  function hoy() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function instalada() { try { return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; } }

  // Entrada: al cargar y al volver tras 30 min o más en segundo plano.
  // «Primera del día» y «primera vez» se deciden en el propio dispositivo
  // (solo se guarda la fecha de la última entrada), así el servidor puede
  // contar dispositivos activos sin saber cuáles son.
  function entrada() {
    if (!activo()) return;
    var ultimo = leer(LOCAL), dia = hoy();
    enviar({ e: "entrada", o: "app", p: instalada() ? 1 : 0, d: ultimo !== dia ? 1 : 0, nv: ultimo ? 0 : 1 });
    escribir(LOCAL, dia);
  }

  // Identidad de cada registro guardado en aprens_db, la misma que usa el núcleo
  // al guardar (id; si no, fecha; si no, ts): así actualizar un registro no
  // cuenta como uno nuevo. Solo se usa aquí; no sale del dispositivo.
  function firma(r) {
    if (!r || typeof r !== "object") return String(r);
    if (r.id != null && r.id !== "") return "id:" + r.id;
    if (r.date || r.fecha) return "d:" + (r.date || r.fecha);
    return "ts:" + (r.ts || "");
  }
  function contarRegistros() {
    var r = {};
    try {
      var db = JSON.parse(localStorage.getItem("aprens_db") || "{}");
      Object.keys(db.tools || {}).forEach(function (id) { r[id] = ((db.tools[id] || {}).records || []).map(firma); });
    } catch (e) {}
    return r;
  }

  var actual = null;   // { id, inicio, acumulado, visible, registros }

  function abrir(id) {
    if (actual && actual.id === id) return;   // otra sección de la misma herramienta
    cerrar();
    if (!activo() || !ID.test(String(id || ""))) return;
    actual = { id: id, inicio: Date.now(), acumulado: 0, visible: !document.hidden, registros: contarRegistros() };
    enviar({ e: "abrir", t: id });
  }

  function tramo(ms) {
    var min = ms / 60000;
    return min < 1 ? "0-1" : min < 3 ? "1-3" : min < 10 ? "3-10" : "10+";
  }

  // Cierra la visita actual: rato (solo con la pantalla visible) y registros nuevos.
  // Un registro es nuevo si su firma no estaba al abrir la visita. El «libro»
  // guarda las firmas ya contadas, para que dos pestañas abiertas no cuenten el
  // mismo registro dos veces. Borrar registros no impide contar los nuevos.
  function cerrar() {
    if (!actual) return;
    var a = actual; actual = null;
    enviarVisita(a);
  }
  function enviarVisita(a) {
    var ms = a.acumulado + (a.visible ? Date.now() - a.inicio : 0);
    enviar({ e: "tiempo", t: a.id, b: tramo(ms) });
    var ahora = contarRegistros(), libro = leerJSON(LIBRO) || {};
    Object.keys(ahora).forEach(function (id) {
      if (a.registros[id] !== undefined && !Array.isArray(a.registros[id])) return;   // visita de una versión anterior
      var vistas = {};
      (Array.isArray(a.registros[id]) ? a.registros[id] : []).forEach(function (f) { vistas[f] = 1; });
      (Array.isArray(libro[id]) ? libro[id] : []).forEach(function (f) { vistas[f] = 1; });
      var nuevas = ahora[id].filter(function (f) { return !vistas[f]; });
      // El servidor acepta hasta 20 por evento: si hay más, se envían por tandas.
      for (var k = 0; ID.test(id) && k < nuevas.length; k += 20) enviar({ e: "registro", t: id, n: Math.min(20, nuevas.length - k) });
      if (nuevas.length) libro[id] = (Array.isArray(libro[id]) ? libro[id] : []).concat(nuevas).slice(-300);
    });
    escribir(LIBRO, JSON.stringify(libro));
  }

  // En segundo plano la visita se pausa: el rato visible se acumula y la visita
  // se guarda en el dispositivo. Si la persona vuelve, sigue la misma visita;
  // si la app se cierra sin más aviso, se envía en la siguiente entrada.
  // Cada pestaña guarda su visita en pausa con su propia marca. Otra pestaña
  // solo la cierra si lleva más de 30 min abandonada; si la dueña vuelve y ya
  // no está, es que otra la cerró: sigue con una visita nueva sin repetir nada.
  var ocultaDesde = null;
  function pendientes() { return leerJSON(PEND) || {}; }
  function guardarPendientes(p) { escribir(PEND, Object.keys(p).length ? JSON.stringify(p) : null); }
  function quitarPendiente() { var p = pendientes(); if (p[PESTANA]) { delete p[PESTANA]; guardarPendientes(p); return true; } return false; }
  function pausar() {
    if (!actual || !actual.visible) return;
    actual.acumulado += Date.now() - actual.inicio;
    actual.visible = false;
    var p = pendientes(); p[PESTANA] = { visita: actual, t: Date.now() }; guardarPendientes(p);
  }
  function reanudar() {
    if (!actual || actual.visible) return;
    if (!quitarPendiente()) {
      // Otra pestaña ya la contó: se sigue con un tramo nuevo, sin otra apertura.
      actual = { id: actual.id, inicio: Date.now(), acumulado: 0, visible: true, registros: contarRegistros() };
      return;
    }
    actual.inicio = Date.now(); actual.visible = true;
  }
  function recuperarPendientes() {
    if (!activo()) return;
    var p = pendientes(), ahora = Date.now(), viejas = [];
    Object.keys(p).forEach(function (k) { if (k !== PESTANA && ahora - (p[k].t || 0) >= ABANDONO) { viejas.push(p[k].visita); delete p[k]; } });
    guardarPendientes(p);
    viejas.forEach(function (v) { if (v && ID.test(String(v.id))) { v.visible = false; enviarVisita(v); } });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { ocultaDesde = Date.now(); pausar(); }
    else {
      if (ocultaDesde && Date.now() - ocultaDesde >= ABANDONO) {
        // Vuelta tras un buen rato: cuenta como entrada y visita nuevas.
        var id = actual && actual.id;
        if (quitarPendiente()) cerrar(); else actual = null;   // si otra pestaña ya la cerró, no se repite
        entrada();
        if (id) abrir(id);
      } else reanudar();
      ocultaDesde = null;
      recuperarPendientes();   // visitas de otras pestañas o recargas abandonadas
    }
  });
  window.addEventListener("pagehide", pausar);

  // La elección se cambia en una pestaña: las demás lo saben al momento.
  // Al retirar el «sí» se descarta lo que se estaba midiendo (sin enviarlo);
  // al darlo, se empieza a medir desde ahora.
  window.addEventListener("storage", function (e) {
    if (e.key !== DEC) return;
    if (!activo()) { actual = null; escribir(PEND, null); }
    else if (!actual) { var t = herramientaEnPantalla(); if (t) abrir(t); }
    document.dispatchEvent(new CustomEvent("aprens-uso"));
  });

  function herramientaEnPantalla() { var m = /^#\/tool\/([\w-]+)/.exec(location.hash || ""); return m ? m[1] : null; }

  // Elección de la persona. Al decir que sí se cuenta la entrada actual.
  function decidir(si) {
    var antes = activo();
    if (!si) { actual = null; escribir(PEND, null); }   // al retirar el «sí» no se envía lo que se medía
    guardarDecision(si ? "si" : "no");
    if (si && !antes && activo()) { entrada(); var t = herramientaEnPantalla(); if (t) abrir(t); }
    quitarAviso();
    document.dispatchEvent(new CustomEvent("aprens-uso"));
  }

  // Aviso de la primera vez: no se envía nada hasta que la persona elige.
  function quitarAviso() { var b = document.getElementById("usoAviso"); if (b) { b.remove(); document.body.style.paddingBottom = ""; } }
  function mostrarAviso() {
    if (!publicado || decision() || navigator.globalPrivacyControl || document.getElementById("usoAviso")) return;
    var b = document.createElement("div");
    b.id = "usoAviso"; b.className = "uso-aviso"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Contador anónimo de uso");
    b.innerHTML = '<p>Para saber qué herramientas os resultan más útiles, ¿nos dejas contar de manera anónima cuántas veces entras, qué herramientas abres, cuánto rato las usas y cuántos registros guardas? Solo números: no sabremos quién eres, y lo que escribes se queda en tu dispositivo.</p>' +
      '<div class="uso-aviso-btns"><button type="button" data-uso="si">Sí, contar</button><button type="button" data-uso="no">No, gracias</button></div>';
    b.addEventListener("click", function (e) { var t = e.target.closest("button[data-uso]"); if (t) decidir(t.getAttribute("data-uso") === "si"); });
    document.body.appendChild(b);
    // Reserva su alto al final de la página para que no tape el contenido
    // (también al girar el móvil o ampliar el texto).
    var reservar = function () { if (document.getElementById("usoAviso")) document.body.style.paddingBottom = b.offsetHeight + "px"; };
    reservar();
    window.addEventListener("resize", reservar);
  }

  window.AprensUso = {
    abrir: abrir,
    cerrar: function () { quitarPendiente(); cerrar(); },
    activo: activo,
    publicado: publicado,
    decidido: function () { return !!decision(); },
    desactivado: function () { var d = decision(); return !d || d.v !== "si"; },
    bloqueadoPorNavegador: function () { return !!navigator.globalPrivacyControl; },
    desactivar: function (si) { decidir(!si); }
  };

  recuperarPendientes();
  entrada();
  if (document.body) mostrarAviso(); else document.addEventListener("DOMContentLoaded", mostrarAviso);
})();
