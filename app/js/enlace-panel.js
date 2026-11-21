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
    return normCodigo(c);
  }
  function normCodigo(c) { return String(c || "").toUpperCase().replace(/[^\p{L}\p{N}._-]/gu, "").slice(0, 20); }
  /* Confirmación del código antes de enviar (una vez por sesión del navegador):
     evita que, en un móvil compartido o con un código antiguo, el registro vaya a
     la ficha de otra persona. Vacío o «Cancelar»: se envía sin código y el panel
     pregunta de quién es. Si no se puede preguntar (navegador sin diálogos), tampoco
     se pone el código. */
  var CLAVE_OK = "aprens_codigo_confirmado";
  function codigoConfirmado() {
    var guardado = codigoPaciente(), ok = null;
    try { ok = g.sessionStorage.getItem(CLAVE_OK); } catch (e) {}
    if (ok !== null && ok === guardado) return guardado;
    var ca = /^ca/i.test((g.document.documentElement.lang || ""));
    var pregunta = guardado
      ? (ca ? "Aquest registre s'enviarà amb el codi de pacient " + guardado + ".\nSi és el teu, pitja Acceptar. Si no, escriu el teu codi (inicials i edat, per exemple DFG22) o deixa-ho buit per enviar-lo sense codi."
            : "Este registro se enviará con el código de paciente " + guardado + ".\nSi es el tuyo, pulsa Aceptar. Si no, escribe tu código (iniciales y edad, por ejemplo DFG22) o déjalo vacío para enviarlo sin código.")
      : (ca ? "Escriu el teu codi de pacient (inicials i edat, per exemple DFG22) perquè el teu psicòleg o psicòloga ho guardi a la teva fitxa. Si el deixes buit, s'enviarà sense codi."
            : "Escribe tu código de paciente (iniciales y edad, por ejemplo DFG22) para que tu psicólogo/a lo guarde en tu ficha. Si lo dejas vacío, se enviará sin código.");
    var r = null;
    try { r = g.prompt(pregunta, guardado); } catch (e) { r = null; }
    if (r === null || r === undefined) return "";
    var c = normCodigo(r);
    if (!c) return "";
    try { if (c !== guardado) g.localStorage.setItem("aprens_tec_mi_codigo", c); } catch (e) {}
    try { g.sessionStorage.setItem(CLAVE_OK, c); } catch (e) {}
    return c;
  }
  /* Nombre exacto de la herramienta: el título de su página sin « · APRENS» ni
     paréntesis (WhatsApp puede cortar el enlace en un paréntesis). */
  function nombreHerramienta() {
    try { return String(g.document.title || "").split(/\s+[·|—–-]\s+/)[0].replace(/\s*\([^)]*\)/g, "").replace(/[|&#()]/g, "").trim().slice(0, 60); } catch (e) { return ""; }
  }
  function aprensConEnlace(txt) {
    if (typeof txt !== "string" || !txt.trim() || /#t=/.test(txt) || !g.LZString) return txt;
    // En la versión de bienestar («Anclado en mí») no hay psicólogo: sin enlace.
    try { if (/\/bienestar\//.test(g.top.location.pathname)) return txt; } catch (e) {}
    try {
      var cod = codigoConfirmado();
      // «$» → «_»: así WhatsApp reconoce el enlace entero al hacerlo tocable.
      var url = urlPanel() + "#t=" + g.LZString.compressToEncodedURIComponent(txt).replace(/\$/g, "_") + (cod ? "&p=" + encodeURIComponent(cod) : "") +
        (nombreHerramienta() ? "&n=" + encodeURIComponent(nombreHerramienta()) : "");
      return txt + "\n\n📲 Abrir en el panel de tu psicólogo/a:\n" + url;
    } catch (e) { return txt; }
  }
  g.aprensConEnlace = aprensConEnlace;   // llamarla solo al pulsar «enviar»: puede preguntar el código
})(window);
