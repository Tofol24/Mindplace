/* APRENS · Enlace de un toque (paciente → panel del psicólogo).
   Las herramientas lo añaden al final de su mensaje de WhatsApp: el texto viaja
   comprimido (lz-string) en el fragmento #t=… junto al código del paciente (&p=…).
   Al tocarlo, el panel lo lee y lo guarda en la ficha. El fragmento no llega al
   servidor del panel; como cualquier mensaje, sí pasa por WhatsApp.
   Necesita ../vendor/lz-string.min.js. Si falta, el mensaje queda como estaba.

   Confirmación del código: la primera vez de cada sesión, al enviar, una ventana
   propia (no la del sistema) pregunta si el código guardado es el del paciente.
   La apertura de WhatsApp se retiene y se hace al pulsar «Enviar» en esa ventana:
   así Safari la permite (necesita que salga de un toque). Las herramientas no
   cambian: siguen llamando a aprensConEnlace(texto) y a window.open(url). */
(function (g) {
  var PANEL_PUBLICO = "https://aprens-app.netlify.app/panel/";
  var MARCA = "__APRENS_COD__";             // hueco del código mientras se confirma
  var CLAVE_OK = "aprens_codigo_confirmado"; // sessionStorage: código ya confirmado
  function urlPanel() {
    try {
      var h = location.hostname;
      // Dentro de la app (o una prueba local / previa de Netlify) el panel es /panel/ del mismo sitio.
      if (/^https?:$/.test(location.protocol) && (/aprens-app\.netlify\.app$/.test(h) || h === "localhost" || h === "127.0.0.1"))
        return location.origin + "/panel/";
    } catch (e) {}
    return PANEL_PUBLICO;
  }
  function normCodigo(c) { return String(c || "").toUpperCase().replace(/[^\p{L}\p{N}._-]/gu, "").slice(0, 20); }
  function codigoPaciente() {
    var c = "";
    try { c = localStorage.getItem("aprens_tec_mi_codigo") || ""; } catch (e) {}
    if (!c) { try { var db = JSON.parse(localStorage.getItem("aprens_db") || "{}"); c = (db.paciente && db.paciente.codigo) || ""; } catch (e) {} }
    return normCodigo(c);
  }
  function codigoYaConfirmado() {
    var guardado = codigoPaciente(), ok = null;
    try { ok = g.sessionStorage.getItem(CLAVE_OK); } catch (e) {}
    return ok !== null && guardado && ok === guardado ? guardado : null;
  }
  /* Nombre exacto de la herramienta: el título de su página sin « · APRENS» ni
     paréntesis (WhatsApp puede cortar el enlace en un paréntesis). */
  function nombreHerramienta() {
    try { return String(g.document.title || "").split(/\s+[·|—–-]\s+/)[0].replace(/\s*\([^)]*\)/g, "").replace(/[|&#()]/g, "").trim().slice(0, 60); } catch (e) { return ""; }
  }
  function sinEnlace(txt) {
    if (typeof txt !== "string" || !txt.trim() || /#t=/.test(txt) || !g.LZString) return true;
    // En la versión de bienestar («Anclado en mí») no hay psicólogo: sin enlace.
    try { if (/\/bienestar\//.test(g.top.location.pathname)) return true; } catch (e) {}
    return false;
  }
  function construir(txt, cod) {
    // «$» → «_»: así WhatsApp reconoce el enlace entero al hacerlo tocable.
    var url = urlPanel() + "#t=" + g.LZString.compressToEncodedURIComponent(txt).replace(/\$/g, "_") + (cod ? "&p=" + encodeURIComponent(cod) : "") +
      (nombreHerramienta() ? "&n=" + encodeURIComponent(nombreHerramienta()) : "");
    return txt + "\n\n📲 Abrir en el panel de tu psicólogo/a:\n" + url;
  }
  /* Pone el código confirmado en el hueco (también dentro de un enlace wa.me ya codificado). */
  function rellenar(s, cod) {
    return String(s).replace(/(%26|&)p(%3D|=)__APRENS_COD__/g, cod ? "$1p$2" + cod : "");
  }

  /* ── Ventana propia de confirmación ──
     «Enviar»: con el código escrito. «Enviar sin código»: sin código (el panel
     pregunta de quién es). Escape: cierra sin enviar. */
  var abierta = null;
  function pedirCodigo(listo) {
    var d = g.document, guardado = codigoPaciente();
    var ca = /^ca/i.test(d.documentElement.lang || "");
    if (abierta) { abierta.listo = listo; return; }
    var T = ca
      ? { tit: "El teu codi de pacient", txt: guardado ? "Aquest registre s'enviarà amb aquest codi. Si no és el teu, corregeix-lo." : "Escriu el teu codi (inicials i edat, per exemple DFG22) perquè el teu psicòleg o psicòloga ho guardi a la teva fitxa.", ok: "Enviar", sin: "Enviar sense codi" }
      : { tit: "Tu código de paciente", txt: guardado ? "Este registro se enviará con este código. Si no es el tuyo, corrígelo." : "Escribe tu código (iniciales y edad, por ejemplo DFG22) para que tu psicólogo/a lo guarde en tu ficha.", ok: "Enviar", sin: "Enviar sin código" };
    var fondo = d.createElement("div");
    fondo.setAttribute("style", "position:fixed;inset:0;background:rgba(15,42,63,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif");
    fondo.innerHTML =
      '<div role="dialog" aria-modal="true" aria-labelledby="apCodTit" style="background:#fff;color:#1e2a33;border-radius:18px;max-width:380px;width:100%;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.25)">' +
        '<h2 id="apCodTit" style="margin:0 0 8px;font-size:18px;color:#0f2a3f"></h2>' +
        '<p id="apCodTxt" style="margin:0 0 12px;font-size:14px;line-height:1.45"></p>' +
        '<input id="apCodIn" autocomplete="off" autocapitalize="characters" spellcheck="false" style="box-sizing:border-box;width:100%;font-size:18px;letter-spacing:.06em;padding:10px 12px;border:1.5px solid #9fb3c2;border-radius:12px;margin:0 0 14px">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">' +
          '<button type="button" id="apCodSin" style="font:inherit;font-size:14px;padding:10px 14px;border-radius:30px;border:1.5px solid #9fb3c2;background:#fff;color:#1e2a33;cursor:pointer"></button>' +
          '<button type="button" id="apCodOk" style="font:inherit;font-size:14px;font-weight:700;padding:10px 18px;border-radius:30px;border:0;background:#178540;color:#fff;cursor:pointer"></button>' +
        '</div></div>';
    d.body.appendChild(fondo);
    var q = function (id) { return fondo.querySelector("#" + id); };
    q("apCodTit").textContent = T.tit; q("apCodTxt").textContent = T.txt;
    q("apCodOk").textContent = T.ok; q("apCodSin").textContent = T.sin;
    var inp = q("apCodIn"); inp.value = guardado; inp.setAttribute("aria-label", T.tit);
    var volver = d.activeElement;
    abierta = { listo: listo };
    function cerrar(cod, cancelar) {
      var cb = abierta && abierta.listo; abierta = null;
      d.removeEventListener("keydown", teclas, true);
      fondo.remove();
      try { if (volver && volver.focus) volver.focus(); } catch (e) {}
      if (cb && !cancelar) cb(cod);   // dentro del toque en el botón: Safari deja abrir WhatsApp
    }
    q("apCodOk").onclick = function () {
      var c = normCodigo(inp.value);
      if (c) {
        try { if (c !== guardado) g.localStorage.setItem("aprens_tec_mi_codigo", c); } catch (e) {}
        try { g.sessionStorage.setItem(CLAVE_OK, c); } catch (e) {}
      }
      cerrar(c);
    };
    q("apCodSin").onclick = function () { cerrar(""); };
    inp.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); q("apCodOk").click(); } };
    // Teclas en toda la página mientras está abierta (aunque el foco aún no haya llegado al campo).
    function teclas(e) {
      if (e.key === "Escape") { e.preventDefault(); cerrar("", true); }   // cerrar = no enviar nada
      if (e.key === "Tab") {   // el foco no sale de la ventana
        var f = [inp, q("apCodSin"), q("apCodOk")], i = f.indexOf(d.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    }
    d.addEventListener("keydown", teclas, true);
    try { inp.focus(); inp.select(); } catch (e) {}
  }

  /* Texto con el enlace. Si el código aún no está confirmado en esta sesión, deja
     un hueco que se rellena al confirmar (ver window.open más abajo). */
  function aprensConEnlace(txt) {
    if (sinEnlace(txt)) return txt;
    try {
      var cod = codigoYaConfirmado();
      return cod ? construir(txt, cod) : construir(txt, MARCA);
    } catch (e) { return txt; }
  }
  /* Para copiar o compartir (sin window.open): llama a listo(texto) con el código
     ya confirmado; si hace falta, pregunta primero. */
  function aprensConCodigo(txt, listo) {
    if (sinEnlace(txt)) { listo(txt); return; }
    var cod = codigoYaConfirmado();
    if (cod) { listo(construir(txt, cod)); return; }
    pedirCodigo(function (c) { listo(construir(txt, c)); });
  }

  /* Si una herramienta abre WhatsApp con el hueco del código, se retiene la apertura
     y se hace al pulsar «Enviar» en la ventana de confirmación. Se devuelve una
     ventana ficticia para que la herramienta no recurra a location.href. */
  var abrirOriginal = g.open;
  g.open = function (url) {
    if (typeof url === "string" && url.indexOf(MARCA) >= 0) {
      var args = Array.prototype.slice.call(arguments);
      pedirCodigo(function (cod) {
        args[0] = rellenar(url, cod);
        var w = null; try { w = abrirOriginal.apply(g, args); } catch (e) {}
        if (!w) g.location.href = args[0];   // si el navegador no deja abrir otra pestaña, en esta
      });
      return { closed: false, close: function () {}, focus: function () {} };
    }
    return abrirOriginal.apply(g, arguments);
  };

  g.aprensConEnlace = aprensConEnlace;
  g.aprensConCodigo = aprensConCodigo;
  g.aprensRellenarCodigo = rellenar;
})(window);
