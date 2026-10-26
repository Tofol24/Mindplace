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
  var PEND = "aprens_uso_pend";      // visita en pausa (app en segundo plano)
  var LIBRO = "aprens_uso_reg";      // registros ya contados por herramienta (evita duplicar entre pestañas)
  var host = location.hostname;
  // Solo cuenta en la web publicada: ni en local ni en las vistas previas de Netlify.
  var publicado = location.protocol === "https:" && host.indexOf("--") < 0 && !/^(localhost|127\.|0\.0\.0\.0)/.test(host);
  var ID = /^[a-z0-9_]{1,40}$/;

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
      if (m && +m[1] <= Date.now()) { var d = decision(); if (!d || +m[1] > d.t) guardarDecision("no", +m[1]); }
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

  // Registros guardados en aprens_db, por herramienta.
  function contarRegistros() {
    var r = {};
    try {
      var db = JSON.parse(localStorage.getItem("aprens_db") || "{}");
      Object.keys(db.tools || {}).forEach(function (id) { r[id] = ((db.tools[id] || {}).records || []).length; });
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
  // El «libro» guarda cuántos registros había de cada herramienta la última vez
  // que se contaron, para que dos pestañas abiertas no cuenten el mismo registro
  // dos veces. Si se borran registros, el libro baja y los nuevos se cuentan.
  function cerrar() {
    if (!actual) return;
    var a = actual; actual = null;
    var ms = a.acumulado + (a.visible ? Date.now() - a.inicio : 0);
    enviar({ e: "tiempo", t: a.id, b: tramo(ms) });
    var ahora = contarRegistros(), libro = leerJSON(LIBRO) || {};
    Object.keys(ahora).forEach(function (id) {
      var base = Math.max(a.registros[id] || 0, libro[id] || 0), n = ahora[id] - base;
      if (n > 0 && ID.test(id)) enviar({ e: "registro", t: id, n: n });
      libro[id] = ahora[id];
    });
    escribir(LIBRO, JSON.stringify(libro));
  }

  // En segundo plano la visita se pausa: el rato visible se acumula y la visita
  // se guarda en el dispositivo. Si la persona vuelve, sigue la misma visita;
  // si la app se cierra sin más aviso, se envía en la siguiente entrada.
  var ocultaDesde = null;
  function pausar() {
    if (!actual || !actual.visible) return;
    actual.acumulado += Date.now() - actual.inicio;
    actual.visible = false;
    escribir(PEND, JSON.stringify(actual));
  }
  function reanudar() {
    if (!actual || actual.visible) return;
    actual.inicio = Date.now(); actual.visible = true;
    escribir(PEND, null);
  }
  function recuperarPendiente() {
    var p = leerJSON(PEND);
    escribir(PEND, null);
    if (!p || actual || !activo()) return;
    actual = p; actual.visible = false; cerrar();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { ocultaDesde = Date.now(); pausar(); }
    else {
      if (ocultaDesde && Date.now() - ocultaDesde >= 30 * 60000) {
        // Vuelta tras un buen rato: cuenta como entrada y visita nuevas.
        var id = actual && actual.id;
        cerrar(); escribir(PEND, null); entrada();
        if (id) abrir(id);
      } else reanudar();
      ocultaDesde = null;
    }
  });
  window.addEventListener("pagehide", pausar);

  function herramientaEnPantalla() { var m = /^#\/tool\/([\w-]+)/.exec(location.hash || ""); return m ? m[1] : null; }

  // Elección de la persona. Al decir que sí se cuenta la entrada actual.
  function decidir(si) {
    var antes = activo();
    if (!si) { cerrar(); escribir(PEND, null); }
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
    // Reserva su alto al final de la página para que no tape el contenido.
    document.body.style.paddingBottom = b.offsetHeight + "px";
  }

  window.AprensUso = {
    abrir: abrir,
    cerrar: function () { cerrar(); escribir(PEND, null); },
    activo: activo,
    publicado: publicado,
    decidido: function () { return !!decision(); },
    desactivado: function () { var d = decision(); return !d || d.v !== "si"; },
    desactivar: function (si) { decidir(!si); }
  };

  recuperarPendiente();
  entrada();
  if (document.body) mostrarAviso(); else document.addEventListener("DOMContentLoaded", mostrarAviso);
})();
