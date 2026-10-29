/* APRENS · Enlace de un toque (paciente → panel del psicólogo).
   Las herramientas lo añaden al final de su mensaje de WhatsApp: el texto viaja
   comprimido (lz-string) en el fragmento #t=… junto al código del paciente (&p=…).
   Al tocarlo, el panel lo lee y lo guarda en la ficha. El fragmento no llega al
   servidor del panel; como cualquier mensaje, sí pasa por WhatsApp.
   Necesita ../vendor/lz-string.min.js. Si falta, el mensaje queda como estaba. */
(function (g) {
  var PANEL_PUBLICO = "https://aprens-app.netlify.app/panel/";
  function urlPanel() {
    try {
      var h = location.hostname;
      // Dentro de la app (o una prueba local / previa de Netlify) el panel es /panel/ del mismo sitio.
      if (/^https?:$/.test(location.protocol) && (/aprens-app\.netlify\.app$/.test(h) || h === "localhost" || h === "127.0.0.1"))
        return location.origin + "/panel/";
    } catch (e) {}
    return PANEL_PUBLICO;
  }
  function codigoPaciente() {
    var c = "";
    try { c = localStorage.getItem("aprens_tec_mi_codigo") || ""; } catch (e) {}
    if (!c) { try { var db = JSON.parse(localStorage.getItem("aprens_db") || "{}"); c = (db.paciente && db.paciente.codigo) || ""; } catch (e) {} }
    return String(c).toUpperCase().replace(/[^\p{L}\p{N}._-]/gu, "").slice(0, 20);
  }
  function aprensConEnlace(txt) {
    if (typeof txt !== "string" || !txt.trim() || /#t=/.test(txt) || !g.LZString) return txt;
    // En la versión de bienestar («Anclado en mí») no hay psicólogo: sin enlace.
    try { if (/\/bienestar\//.test(g.top.location.pathname)) return txt; } catch (e) {}
    try {
      var cod = codigoPaciente();
      // «$» → «_»: así WhatsApp reconoce el enlace entero al hacerlo tocable.
      var url = urlPanel() + "#t=" + g.LZString.compressToEncodedURIComponent(txt).replace(/\$/g, "_") + (cod ? "&p=" + encodeURIComponent(cod) : "");
      return txt + "\n\n📲 Abrir en el panel de tu psicólogo/a:\n" + url;
    } catch (e) { return txt; }
  }
  g.aprensConEnlace = aprensConEnlace;
})(window);
