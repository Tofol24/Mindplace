/* ============================================================
   APRENS · Contador anónimo de uso
   ------------------------------------------------------------
   Cuenta cuántas veces se entra en la app y qué herramientas se abren,
   cuánto rato se usan y cuántos registros nuevos se guardan, para que el
   psicólogo sepa qué resulta más útil. NO envía nada que identifique a la
   persona: ni código de paciente, ni lo que escribe, ni identificadores de
   dispositivo. Solo eventos sueltos («se ha abierto Bajar la alerta») que el
   servidor suma por día (ver netlify/lib/uso.mjs).

   Se puede desactivar desde el aviso de privacidad del inicio
   (localStorage aprens_uso_off = "1"). Respeta Global Privacy Control.
   ============================================================ */
(function () {
  "use strict";
  var OFF = "aprens_uso_off", LOCAL = "aprens_uso_local";
  var host = location.hostname;
  // Solo cuenta en la web publicada: ni en local ni en las vistas previas de Netlify.
  var publicado = /^https:$/.test(location.protocol) && host.indexOf("--") < 0 && !/^(localhost|127\.|0\.0\.0\.0)/.test(host);

  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function escribir(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function activo() { return publicado && leer(OFF) !== "1" && !navigator.globalPrivacyControl; }

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
    if (!/^[a-z0-9_]{1,40}$/.test(String(id || ""))) return;
    actual = { id: id, inicio: Date.now(), acumulado: 0, visible: !document.hidden, registros: contarRegistros() };
    enviar({ e: "abrir", t: id });
  }

  function tramo(ms) {
    var min = ms / 60000;
    return min < 1 ? "0-1" : min < 3 ? "1-3" : min < 10 ? "3-10" : "10+";
  }

  // Cierra la visita actual: rato (solo con la pantalla visible) y registros nuevos.
  function cerrar() {
    if (!actual) return;
    var a = actual; actual = null;
    var ms = a.acumulado + (a.visible ? Date.now() - a.inicio : 0);
    enviar({ e: "tiempo", t: a.id, b: tramo(ms) });
    var ahora = contarRegistros();
    Object.keys(ahora).forEach(function (id) {
      var n = ahora[id] - (a.registros[id] || 0);
      if (n > 0 && /^[a-z0-9_]{1,40}$/.test(id)) enviar({ e: "registro", t: id, n: n });
    });
  }

  var ocultaDesde = null, pausada = null;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      ocultaDesde = Date.now();
      // La app puede cerrarse en segundo plano sin más aviso: se cierra la visita
      // ahora y, si la persona vuelve, se retoma sin contar otra apertura.
      if (actual) { pausada = actual.id; cerrar(); }
    } else {
      if (ocultaDesde && Date.now() - ocultaDesde >= 30 * 60000) entrada();
      ocultaDesde = null;
      if (pausada) {
        actual = { id: pausada, inicio: Date.now(), acumulado: 0, visible: true, registros: contarRegistros() };
        pausada = null;
      }
    }
  });
  window.addEventListener("pagehide", cerrar);

  window.AprensUso = {
    abrir: abrir,
    cerrar: function () { pausada = null; cerrar(); },
    activo: activo,
    publicado: publicado,
    desactivado: function () { return leer(OFF) === "1"; },
    desactivar: function (si) { escribir(OFF, si ? "1" : null); }
  };

  entrada();
})();
