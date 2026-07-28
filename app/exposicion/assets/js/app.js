/* ============================================================================
   La escalera · Exposición en vivo gradual · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Dos llaves por exposición: el QUÉ (afrontamiento conductual) y el CÓMO
   (acompañamiento interno · AIS). La paciente edita su escalera de peldaños
   (de menos a más dificultad) y registra cada exposición. Todo se guarda en el
   núcleo APRENS (aprens_db) para compartirlo con su psicólogo/a.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOOL = "escalera_exposicion";
  var SEED_FLAG = "escalera_exposicion_seeded_v1";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "La escalera · Exposición", toolVersion: 1 });

  /* ---------- utilidades de fecha / almacenamiento ---------- */
  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function allRecords() { return window.Aprens ? Aprens.history() : []; }
  function getPeldanos() {
    return allRecords().filter(function (r) { return r.kind === "peldano"; })
      .sort(function (a, b) { return (a.dificultad - b.dificultad) || ((a.ts || 0) - (b.ts || 0)); });
  }
  function getSesiones() { return allRecords().filter(function (r) { return r.kind === "sesion"; }); }
  function sesionesDe(id) { return getSesiones().filter(function (s) { return s.peldanoId === id; }); }

  function removeRecord(id) {
    try {
      var raw = localStorage.getItem("aprens_db"); if (!raw) return;
      var d = JSON.parse(raw); var b = d.tools && d.tools[TOOL]; if (!b) return;
      b.records = b.records.filter(function (r) { return r.id !== id; });
      d.actualizado = new Date().toISOString();
      localStorage.setItem("aprens_db", JSON.stringify(d));
    } catch (e) {}
  }

  /* ---------- biblioteca de escaleras de ejemplo por tipo de miedo (editables) ---------- */
  var BIBLIOTECA = {
    conducir: { label: "Conducir", emoji: "🚗", semilla: [
      { dificultad: 2, titulo: "Acercarme al coche en el garaje y apoyar la mano", tiempo: "1–2 min", compania: "acompañada", distancia: "junto al coche", condicion: "motor apagado, garaje cerrado" },
      { dificultad: 3, titulo: "Sentarme en el asiento del conductor con la puerta abierta", tiempo: "2–3 min", compania: "acompañada", distancia: "en el garaje", condicion: "motor apagado" },
      { dificultad: 4, titulo: "Sentarme con las puertas cerradas, motor apagado", tiempo: "3–5 min", compania: "acompañada", distancia: "en el garaje", condicion: "motor apagado" },
      { dificultad: 5, titulo: "Encender el motor sin mover el coche", tiempo: "3–5 min", compania: "acompañada", distancia: "en el garaje", condicion: "motor encendido, sin marcha" },
      { dificultad: 6, titulo: "Salir del garaje y aparcar justo fuera", tiempo: "5 min", compania: "acompañada", distancia: "salida del garaje", condicion: "de día" },
      { dificultad: 7, titulo: "Dar una vuelta corta a la manzana", tiempo: "5–10 min", compania: "acompañada", distancia: "la manzana", condicion: "de día, poco tráfico" },
      { dificultad: 8, titulo: "Un trayecto conocido y corto, sola", tiempo: "10 min", compania: "sola", distancia: "trayecto conocido", condicion: "de día" },
      { dificultad: 9, titulo: "Un trayecto más largo o por vía rápida, sola", tiempo: "15–20 min", compania: "sola", distancia: "más lejos / vía rápida", condicion: "de día" }
    ] },
    espacios: { label: "Espacios abiertos", emoji: "🏞️", semilla: [
      { dificultad: 2, titulo: "Salir a la puerta de casa y mirar la calle", tiempo: "1–2 min", compania: "acompañada", distancia: "en el umbral", condicion: "calle tranquila" },
      { dificultad: 3, titulo: "Caminar hasta la esquina y volver", tiempo: "3–5 min", compania: "acompañada", distancia: "cerca de casa", condicion: "hora tranquila" },
      { dificultad: 4, titulo: "Sentarme en una plaza pequeña un rato", tiempo: "5 min", compania: "acompañada", distancia: "plaza cercana", condicion: "poca gente" },
      { dificultad: 5, titulo: "Cruzar una plaza grande y abierta", tiempo: "5–10 min", compania: "acompañada", distancia: "plaza amplia", condicion: "de día" },
      { dificultad: 6, titulo: "Pasear por una avenida ancha", tiempo: "10 min", compania: "acompañada", distancia: "lejos de casa", condicion: "de día" },
      { dificultad: 7, titulo: "Ir hasta la esquina y volver, sola", tiempo: "3–5 min", compania: "sola", distancia: "cerca de casa", condicion: "hora tranquila" },
      { dificultad: 8, titulo: "Cruzar una plaza abierta, sola", tiempo: "5–10 min", compania: "sola", distancia: "plaza amplia", condicion: "de día" },
      { dificultad: 9, titulo: "Pasear por un parque o paseo grande, sola", tiempo: "15–20 min", compania: "sola", distancia: "lejos de casa", condicion: "de día" }
    ] },
    multitudes: { label: "Multitudes", emoji: "👥", semilla: [
      { dificultad: 2, titulo: "Entrar en una tienda pequeña con poca gente", tiempo: "3–5 min", compania: "acompañada", distancia: "comercio tranquilo", condicion: "hora valle" },
      { dificultad: 3, titulo: "Pasar por una calle comercial con gente", tiempo: "5 min", compania: "acompañada", distancia: "calle concurrida", condicion: "hora valle" },
      { dificultad: 4, titulo: "Entrar en un supermercado mediano", tiempo: "10 min", compania: "acompañada", distancia: "supermercado", condicion: "hora tranquila" },
      { dificultad: 5, titulo: "Hacer una cola corta en caja", tiempo: "hasta acabar", compania: "acompañada", distancia: "en la cola", condicion: "cola corta" },
      { dificultad: 6, titulo: "Ir a un centro comercial", tiempo: "15 min", compania: "acompañada", distancia: "centro comercial", condicion: "por la tarde" },
      { dificultad: 7, titulo: "Entrar en un súper concurrido, sola", tiempo: "10 min", compania: "sola", distancia: "supermercado", condicion: "hora punta" },
      { dificultad: 8, titulo: "Usar transporte público un par de paradas", tiempo: "el trayecto", compania: "acompañada", distancia: "bus / metro", condicion: "hora valle" },
      { dificultad: 9, titulo: "Estar en un mercado o evento con mucha gente", tiempo: "20 min", compania: "sola", distancia: "lugar concurrido", condicion: "fin de semana" }
    ] },
    social: { label: "Situaciones sociales", emoji: "💬", semilla: [
      { dificultad: 2, titulo: "Saludar a un vecino o conocido y sonreír", tiempo: "unos segundos", compania: "sola", distancia: "en el portal", condicion: "encuentro breve" },
      { dificultad: 3, titulo: "Preguntar una hora o una dirección", tiempo: "1 min", compania: "sola", distancia: "en la calle", condicion: "persona amable" },
      { dificultad: 4, titulo: "Pedir algo en un mostrador (café, pan)", tiempo: "2–3 min", compania: "sola", distancia: "en un comercio", condicion: "poca cola" },
      { dificultad: 5, titulo: "Hacer una llamada breve (cita, reserva)", tiempo: "3–5 min", compania: "sola", distancia: "desde casa", condicion: "con un guion" },
      { dificultad: 6, titulo: "Aportar un comentario en un grupo pequeño", tiempo: "unos minutos", compania: "en grupo", distancia: "reunión conocida", condicion: "3–4 personas" },
      { dificultad: 7, titulo: "Iniciar una conversación corta con alguien", tiempo: "5 min", compania: "sola", distancia: "contexto cotidiano", condicion: "tema fácil" },
      { dificultad: 8, titulo: "Expresar una opinión o un desacuerdo amable", tiempo: "unos minutos", compania: "en grupo", distancia: "con confianza", condicion: "tema ligero" },
      { dificultad: 9, titulo: "Hablar ante varias personas (brindis, presentar)", tiempo: "5 min", compania: "en grupo", distancia: "una reunión", condicion: "algo preparado" }
    ] },
    aviones: { label: "Volar / aviones", emoji: "✈️", semilla: [
      { dificultad: 2, titulo: "Ver fotos y vídeos de aviones y despegues", tiempo: "5 min", compania: "sola", distancia: "en casa", condicion: "con respiración" },
      { dificultad: 3, titulo: "Mirar la información del vuelo y del aeropuerto", tiempo: "10 min", compania: "acompañada", distancia: "en casa", condicion: "planificando" },
      { dificultad: 4, titulo: "Ensayo imaginado del vuelo completo, guiado", tiempo: "10 min", compania: "sola", distancia: "en casa", condicion: "relajada" },
      { dificultad: 5, titulo: "Ir al aeropuerto a ver despegues (sin volar)", tiempo: "20–30 min", compania: "acompañada", distancia: "terminal / mirador", condicion: "de día" },
      { dificultad: 6, titulo: "Facturar y pasar el control en un vuelo real", tiempo: "el proceso", compania: "acompañada", distancia: "aeropuerto", condicion: "vuelo corto" },
      { dificultad: 7, titulo: "Embarcar y sentarme, antes del despegue", tiempo: "hasta despegar", compania: "acompañada", distancia: "en el avión", condicion: "vuelo corto" },
      { dificultad: 8, titulo: "Un vuelo corto, acompañada", tiempo: "el vuelo", compania: "acompañada", distancia: "trayecto breve", condicion: "de día" },
      { dificultad: 9, titulo: "Un vuelo más largo, o sola", tiempo: "el vuelo", compania: "sola", distancia: "trayecto largo", condicion: "con mis apoyos" }
    ] },
    ascensor: { label: "Ascensor / cerrados", emoji: "🛗", semilla: [
      { dificultad: 2, titulo: "Acercarme al ascensor con las puertas abiertas", tiempo: "1 min", compania: "acompañada", distancia: "en el rellano", condicion: "puertas abiertas" },
      { dificultad: 3, titulo: "Entrar y salir enseguida, sin cerrar", tiempo: "unos segundos", compania: "acompañada", distancia: "dentro", condicion: "sin pulsar" },
      { dificultad: 4, titulo: "Entrar, cerrar las puertas, sin subir", tiempo: "30 seg", compania: "acompañada", distancia: "dentro", condicion: "parado" },
      { dificultad: 5, titulo: "Subir o bajar un piso, acompañada", tiempo: "1 trayecto", compania: "acompañada", distancia: "dentro", condicion: "un piso" },
      { dificultad: 6, titulo: "Subir varios pisos, acompañada", tiempo: "el trayecto", compania: "acompañada", distancia: "dentro", condicion: "varios pisos" },
      { dificultad: 7, titulo: "Un piso, sola", tiempo: "1 trayecto", compania: "sola", distancia: "dentro", condicion: "edificio conocido" },
      { dificultad: 8, titulo: "Varios pisos, sola", tiempo: "el trayecto", compania: "sola", distancia: "dentro", condicion: "edificio conocido" },
      { dificultad: 9, titulo: "Un ascensor desconocido o más lento, sola", tiempo: "el trayecto", compania: "sola", distancia: "lugar nuevo", condicion: "con mis apoyos" }
    ] },
    otro: { label: "Otro (desde cero)", emoji: "✏️", semilla: [] }
  };
  var TIPO_KEY = "aprens_esc_tipo";
  function tipoActual() { try { var t = localStorage.getItem(TIPO_KEY); if (t && BIBLIOTECA[t]) return t; } catch (e) {} return "conducir"; }
  function guardarTipo(t) { try { localStorage.setItem(TIPO_KEY, t); } catch (e) {} }
  function semillaActual() { return (BIBLIOTECA[tipoActual()] || BIBLIOTECA.conducir).semilla; }
  function seedPeldano(p, i) {
    var rec = { id: "pel_" + Date.now() + "_" + i, kind: "peldano", ts: Date.now() + i,
      dificultad: p.dificultad, titulo: p.titulo, tiempo: p.tiempo, compania: p.compania, distancia: p.distancia, condicion: p.condicion };
    if (window.Aprens) Aprens.save(rec);
    return rec;
  }
  function seedIfEmpty() {
    var seeded = false; try { seeded = localStorage.getItem(SEED_FLAG) === "1"; } catch (e) {}
    if (!seeded && getPeldanos().length === 0) {
      semillaActual().forEach(seedPeldano);
      try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    }
  }
  function resetPeldanos(tipo) {
    if (tipo && BIBLIOTECA[tipo]) guardarTipo(tipo);
    getPeldanos().forEach(function (p) { removeRecord(p.id); });
    semillaActual().forEach(seedPeldano);
    try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    closeEditor(); renderLadder(); renderMiedoPicker();
  }
  function elegirMiedo(tipo) {
    if (!BIBLIOTECA[tipo]) return;
    if (tipo === tipoActual() && getPeldanos().length) return;
    if (getPeldanos().length && !confirm("Cargar la escalera de ejemplo de «" + BIBLIOTECA[tipo].label + "» reemplaza los peldaños actuales. Las exposiciones ya registradas se conservan. ¿Continuar?")) return;
    resetPeldanos(tipo);
    var sec = document.getElementById("escalera"); if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderMiedoPicker() {
    var box = document.getElementById("miedoPicker"); if (!box) return;
    var act = tipoActual();
    var chips = Object.keys(BIBLIOTECA).map(function (k) {
      var b = BIBLIOTECA[k];
      return '<button type="button" class="miedo-chip' + (k === act ? " on" : "") + '" data-tipo="' + k + '">' + b.emoji + " " + esc(b.label) + "</button>";
    }).join("");
    box.innerHTML = '<div class="miedo-lbl">¿A qué le tienes miedo? Elige y tendrás una <b>escalera de ejemplo</b> para editar a tu medida:</div>' +
      '<div class="miedo-chips">' + chips + "</div>";
    $$(".miedo-chip", box).forEach(function (ch) { ch.addEventListener("click", function () { elegirMiedo(ch.getAttribute("data-tipo")); }); });
  }

  /* ---------- APOYOS del CÓMO (cada uno enlaza a su herramienta de práctica) ---------- */
  var APOYOS = [
    { id: "respiracion", ico: "🫁", t: "Respiración curiosa", d: "Observo cómo entra y sale el aire, sin forzarlo. Curiosidad, no control.", tool: "herramienta_diaria" },
    { id: "muscular", ico: "💪", t: "Tensión y distensión", d: "Tenso y suelto hombros, manos y mandíbula. De la tensión a la distensión.", tool: "ais_muscular" },
    { id: "abrazo", ico: "🤍", t: "Abrazo sentido", d: "Integro el dolor en mi manada: me acompaño como acompañaría a alguien que quiero.", tool: "ais_amor" },
    { id: "honestidad", ico: "🗣️", t: "Honestidad emocional", d: "Nombro lo que siento sin explicarlo ni taparlo: «noto miedo, y me quedo con ello».", tool: "honestidad_emocional" }
  ];

  /* ============================================================
     ESCALERA
     ============================================================ */
  var ladder = $("#ladder");

  function chip(label, val) { return val ? '<span class="chip">' + esc(label) + ' <b>' + esc(val) + '</b></span>' : ""; }

  function rungHTML(p, n) {
    var sesiones = sesionesDe(p.id);
    var hechas = sesiones.length;
    var pct = Math.max(0, Math.min(100, (Number(p.dificultad) || 0) * 10));
    var badge = hechas ? '<span class="rung-badge">✓ ' + hechas + ' exposici' + (hechas === 1 ? 'ón' : 'ones') + ' registrada' + (hechas === 1 ? '' : 's') + '</span>' : "";
    return '<div class="rung' + (hechas ? ' rung-done' : '') + '" data-id="' + p.id + '">' +
      '<div class="rung-top">' +
        '<span class="rung-n">' + n + '</span>' +
        '<div class="rung-body">' +
          '<div class="rung-title">' + esc(p.titulo) + '</div>' +
          '<div class="rung-vars">' +
            chip("⏱", p.tiempo) + chip("👥", p.compania) + chip("📍", p.distancia) + chip("·", p.condicion) +
          '</div>' +
          '<div class="rung-dif"><div class="dl"><span>Dificultad que anticipo</span><span>' + (Number(p.dificultad) || 0) + '/10</span></div>' +
            '<div class="difbar"><i style="width:' + pct + '%"></i></div></div>' +
          badge +
          '<div class="rung-acts">' +
            '<button class="mini mini-go" data-act="go">Preparar exposición →</button>' +
            '<button class="mini mini-edit" data-act="edit">Editar</button>' +
            '<button class="mini mini-del" data-act="del">Borrar</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderLadder() {
    var ps = getPeldanos();
    if (!ps.length) { ladder.innerHTML = '<p class="lead" style="color:var(--tinta-soft)">Tu escalera está vacía. Añade tu primer peldaño o restaura la escalera de ejemplo.</p>'; return; }
    ladder.innerHTML = ps.map(function (p, i) { return rungHTML(p, i + 1); }).join("");
    $$(".rung", ladder).forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          if (act === "go") startExposicion(id);
          else if (act === "edit") openEditor(id);
          else if (act === "del") { if (confirm("¿Borrar este peldaño? Sus exposiciones registradas se conservan en tus datos.")) { removeRecord(id); closeEditor(); renderLadder(); } }
        });
      });
    });
  }

  /* ---------- editor de peldaño ---------- */
  var editor = $("#peldanoEditor");
  var editingId = null;

  function openEditor(id) {
    editingId = id || null;
    var p = id ? getPeldanos().filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !p;
    var dif = p ? Number(p.dificultad) || 5 : 5;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (isNew ? "Nuevo peldaño" : "Editar peldaño") + '</h3>' +
      '<p class="hint">Descríbelo concreto y alcanzable. Ponle la dificultad que te imaginas al pensarlo: la escalera se reordena sola.</p>' +
      '<div class="field"><label for="pTitulo">El peldaño</label>' +
        '<textarea id="pTitulo" rows="2" placeholder="p. ej. sentarme en el coche con las puertas cerradas">' + esc(p ? p.titulo : "") + '</textarea></div>' +
      '<div class="grid2">' +
        '<div class="field"><label for="pTiempo">Tiempo</label><input type="text" id="pTiempo" placeholder="3–5 min" value="' + esc(p ? p.tiempo : "") + '"></div>' +
        '<div class="field"><label for="pCompania">Compañía</label><input type="text" id="pCompania" placeholder="sola / acompañada" value="' + esc(p ? p.compania : "") + '"></div>' +
        '<div class="field"><label for="pDistancia">Distancia / lugar</label><input type="text" id="pDistancia" placeholder="en el garaje, la manzana…" value="' + esc(p ? p.distancia : "") + '"></div>' +
        '<div class="field"><label for="pCondicion">Condición</label><input type="text" id="pCondicion" placeholder="motor apagado, de día…" value="' + esc(p ? p.condicion : "") + '"></div>' +
      '</div>' +
      '<div class="scale"><div class="scale-top"><span class="cap">Dificultad que anticipo</span><span class="n" id="pDifN">' + dif + '</span></div>' +
        '<input type="range" min="0" max="10" value="' + dif + '" id="pDif" aria-label="Dificultad anticipada">' +
        '<div class="ends"><span>Fácil</span><span>Muy difícil</span></div></div>' +
      '<div class="editor-acts">' +
        '<button class="btn btn-primary" id="pSave">' + (isNew ? "Añadir a la escalera" : "Guardar cambios") + '</button>' +
        '<button class="btn btn-link" id="pCancel">Cancelar</button>' +
      '</div>';
    var dn = $("#pDifN"), dr = $("#pDif");
    dr.addEventListener("input", function () { dn.textContent = dr.value; });
    $("#pSave").addEventListener("click", savePeldano);
    $("#pCancel").addEventListener("click", closeEditor);
    editor.scrollIntoView({ behavior: "smooth", block: "center" });
    $("#pTitulo").focus();
  }
  function closeEditor() { editor.hidden = true; editor.innerHTML = ""; editingId = null; }

  function savePeldano() {
    var titulo = ($("#pTitulo").value || "").trim();
    if (!titulo) { $("#pTitulo").focus(); return; }
    var existing = editingId ? getPeldanos().filter(function (x) { return x.id === editingId; })[0] : null;
    var rec = {
      id: editingId || ("pel_" + Date.now()), kind: "peldano",
      ts: existing ? existing.ts : Date.now(),
      dificultad: Number($("#pDif").value),
      titulo: titulo,
      tiempo: ($("#pTiempo").value || "").trim(),
      compania: ($("#pCompania").value || "").trim(),
      distancia: ($("#pDistancia").value || "").trim(),
      condicion: ($("#pCondicion").value || "").trim()
    };
    if (window.Aprens) Aprens.save(rec);
    closeEditor(); renderLadder();
  }

  /* ============================================================
     EXPOSICIÓN · LAS DOS LLAVES
     ============================================================ */
  var expSection = $("#exposicion"), expBody = $("#expBody");
  var expState = null;

  function startExposicion(id) {
    var p = getPeldanos().filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    expState = { peldanoId: id, apoyos: [], desenlace: null, actitud: null };
    expBody.innerHTML =
      '<div class="sec-head"><span class="num">Exposición</span>' +
        '<h2>Ábrela con tus dos llaves</h2>' +
        '<p>Primero el QUÉ (qué haces hoy y el compromiso de quedarte). Durante la exposición, el CÓMO (cómo te acompañas). Al terminar, registra cómo fue.</p></div>' +

      '<div class="exp-target"><div class="t">' + esc(p.titulo) + '</div>' +
        '<div class="v">' + chip("⏱", p.tiempo) + chip("👥", p.compania) + chip("📍", p.distancia) + chip("·", p.condicion) +
        chip("dificultad", (Number(p.dificultad) || 0) + "/10") + '</div></div>' +

      /* ---- LLAVE QUÉ ---- */
      '<div class="keypanel kp-que">' +
        '<div class="kp-head"><span class="k">🔑</span><h3>El QUÉ</h3></div>' +
        '<p class="kp-sub">Afrontamiento conductual · qué hago hoy</p>' +
        '<div class="grid2">' +
          '<div class="field"><label for="hTiempo">Tiempo de hoy</label><input type="text" id="hTiempo" value="' + esc(p.tiempo) + '"></div>' +
          '<div class="field"><label for="hCompania">Compañía de hoy</label><input type="text" id="hCompania" value="' + esc(p.compania) + '"></div>' +
        '</div>' +
        '<div class="scale"><div class="scale-top"><span class="cap">Alarma al empezar</span><span class="n" id="sAntesN">7</span></div>' +
          '<input type="range" class="sud" min="0" max="10" value="7" id="sAntes" aria-label="Alarma al empezar">' +
          '<div class="ends"><span>Calma</span><span>Máxima</span></div></div>' +
        '<div class="contrato"><input type="checkbox" id="contrato">' +
          '<label for="contrato"><b>Mi compromiso:</b> me quedo y no huyo mientras la alarma esté alta. La dejo bajar hacia un <b>5–6</b> antes de terminar. Si me voy por alivio, el miedo se refuerza.</label></div>' +
      '</div>' +

      /* ---- LLAVE CÓMO ---- */
      '<div class="keypanel kp-como">' +
        '<div class="kp-head"><span class="k">🔑</span><h3>El CÓMO</h3></div>' +
        '<p class="kp-sub">Acompañamiento interno · AIS · cómo me sostengo</p>' +
        '<p class="kp-hint">Marca los que uses durante la exposición. Toca <b>Practicar ↗</b> para entrenar cada apoyo antes, y llegar preparada.</p>' +
        '<div class="apoyos">' +
          APOYOS.map(function (a) {
            return '<label class="apoyo" data-ap="' + a.id + '"><input type="checkbox"><span class="ico">' + a.ico + '</span>' +
              '<span class="txt"><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span></span>' +
              '<a class="apoyo-practicar" href="/#/tool/' + a.tool + '" target="_blank" rel="noopener">Practicar ↗</a></label>';
          }).join("") +
        '</div>' +

        '<div class="scale"><div class="scale-top"><span class="cap">Pico de alarma</span><span class="n" id="sPicoN">7</span></div>' +
          '<input type="range" class="sud" min="0" max="10" value="7" id="sPico" aria-label="Pico de alarma">' +
          '<div class="ends"><span>Calma</span><span>Máxima</span></div></div>' +
        '<div class="scale"><div class="scale-top"><span class="cap">Alarma al terminar</span><span class="n" id="sFinalN">5</span></div>' +
          '<input type="range" class="sud" min="0" max="10" value="5" id="sFinal" aria-label="Alarma al terminar">' +
          '<div class="ends"><span>Calma</span><span>Máxima</span></div></div>' +

        '<div class="field"><label>¿Cómo terminó?</label>' +
          '<div class="pillset" id="desenlace">' +
            '<button class="pill" data-v="quedo_bajo" aria-pressed="false">Me quedé y la alarma bajó</button>' +
            '<button class="pill" data-v="quedo_alto" aria-pressed="false">Me quedé, aún alta</button>' +
            '<button class="pill warn" data-v="hui" aria-pressed="false">Me fui antes (huí)</button>' +
          '</div></div>' +

        '<div class="field"><label>¿Cómo lo sostuve por dentro?</label>' +
          '<div class="pillset" id="actitud">' +
            '<button class="pill" data-v="compania" aria-pressed="false">Con compañía</button>' +
            '<button class="pill" data-v="apretando" aria-pressed="false">Aguantando apretada</button>' +
            '<button class="pill warn" data-v="reprimi" aria-pressed="false">Me lo reprimí</button>' +
          '</div></div>' +

        '<div class="field"><label for="hHonest">Honestidad emocional · qué sentí (sin taparlo)</label>' +
          '<textarea id="hHonest" rows="2" placeholder="noté el corazón acelerado y ganas de salir… y me quedé"></textarea></div>' +
      '</div>' +

      '<div class="exp-acts">' +
        '<button class="btn btn-como" id="expSave">Guardar exposición</button>' +
        '<button class="btn btn-primary" id="expSaveWA">Guardar y enviar por WhatsApp</button>' +
        '<button class="exp-close" id="expCancel">Cerrar sin guardar</button>' +
      '</div>' +
      '<p class="exp-note" id="expNote"></p>';

    // sliders
    [["sAntes", "sAntesN"], ["sPico", "sPicoN"], ["sFinal", "sFinalN"]].forEach(function (pair) {
      var inp = $("#" + pair[0]), num = $("#" + pair[1]);
      inp.addEventListener("input", function () { num.textContent = inp.value; });
    });
    // apoyos (la etiqueta ya alterna el checkbox de forma nativa; escuchamos change)
    $$(".apoyo", expBody).forEach(function (l) {
      var cb = $("input", l), id2 = l.getAttribute("data-ap");
      cb.addEventListener("change", function () {
        l.classList.toggle("on", cb.checked);
        var i = expState.apoyos.indexOf(id2);
        if (cb.checked) { if (i < 0) expState.apoyos.push(id2); } else if (i >= 0) expState.apoyos.splice(i, 1);
      });
      // el enlace "Practicar" abre la herramienta sin alternar la casilla
      var link = $(".apoyo-practicar", l);
      if (link) link.addEventListener("click", function (e) { e.stopPropagation(); });
    });
    // pill groups
    bindPills("desenlace", function (v) { expState.desenlace = v; });
    bindPills("actitud", function (v) { expState.actitud = v; });

    $("#expSave").addEventListener("click", function () { saveSesion(false); });
    $("#expSaveWA").addEventListener("click", function () { saveSesion(true); });
    $("#expCancel").addEventListener("click", closeExposicion);

    expSection.hidden = false;
    expSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindPills(groupId, cb) {
    var g = $("#" + groupId); if (!g) return;
    $$(".pill", g).forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") === "true";
        $$(".pill", g).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", on ? "false" : "true");
        cb(on ? null : b.getAttribute("data-v"));
      });
    });
  }

  function closeExposicion() { expSection.hidden = true; expBody.innerHTML = ""; expState = null; $("#escalera").scrollIntoView({ behavior: "smooth" }); }

  var DESENLACE_TXT = { quedo_bajo: "Me quedé y la alarma bajó", quedo_alto: "Me quedé, aún alta", hui: "Me fui antes (huí)" };
  var ACTITUD_TXT = { compania: "Con compañía", apretando: "Aguantando apretada", reprimi: "Me lo reprimí" };

  function buildSesion() {
    var p = getPeldanos().filter(function (x) { return x.id === expState.peldanoId; })[0] || {};
    return {
      id: "ses_" + Date.now(), kind: "sesion", date: ymd(), ts: Date.now(),
      peldanoId: expState.peldanoId, peldanoTitulo: p.titulo || "", dificultad: p.dificultad,
      tiempo_hoy: ($("#hTiempo").value || "").trim(), compania_hoy: ($("#hCompania").value || "").trim(),
      sud_antes: Number($("#sAntes").value), sud_pico: Number($("#sPico").value), sud_final: Number($("#sFinal").value),
      compromiso: !!$("#contrato").checked,
      apoyos: expState.apoyos.slice(),
      desenlace: expState.desenlace, actitud: expState.actitud,
      honestidad: ($("#hHonest").value || "").trim()
    };
  }

  function resumenSesion(s) {
    var L = ["La escalera · exposición — APRENS", "Fecha: " + s.date];
    L.push("Peldaño: " + (s.peldanoTitulo || "—") + (s.dificultad != null ? " (dif. " + s.dificultad + "/10)" : ""));
    if (s.tiempo_hoy || s.compania_hoy) L.push("Hoy: " + [s.tiempo_hoy, s.compania_hoy].filter(Boolean).join(" · "));
    L.push("Alarma: " + s.sud_antes + " → pico " + s.sud_pico + " → " + s.sud_final);
    if (s.desenlace) L.push("Desenlace: " + (DESENLACE_TXT[s.desenlace] || s.desenlace));
    if (s.actitud) L.push("Cómo lo sostuve: " + (ACTITUD_TXT[s.actitud] || s.actitud));
    if (s.apoyos && s.apoyos.length) {
      var names = s.apoyos.map(function (a) { var x = APOYOS.filter(function (y) { return y.id === a; })[0]; return x ? x.t : a; });
      L.push("Me acompañé con: " + names.join(", "));
    }
    if (s.honestidad) L.push("Sentí: " + s.honestidad);
    L.push("", "(Enviado desde La escalera · adjunta también el .json para el panel)");
    return L.join("\n");
  }

  function saveSesion(share) {
    if (!expState) return;
    var cod = ($("#codigo").value || "").trim();
    if (cod && window.Aprens) Aprens.setPacienteCodigo(cod);
    var s = buildSesion();
    if (window.Aprens) Aprens.save(s, { append: true });
    var note = $("#expNote");
    if (share) {
      try { window.open("https://wa.me/?text=" + encodeURIComponent(resumenSesion(s)), "_blank"); } catch (e) {}
      if (note) note.textContent = "Guardada en este dispositivo. Se ha abierto WhatsApp para enviarla.";
    } else if (note) { note.textContent = "Exposición guardada en este dispositivo."; }
    renderLadder();
    // pequeño refuerzo si no hubo huida
    if (s.desenlace && s.desenlace !== "hui" && note) {
      note.textContent += " Te quedaste: eso es exactamente el trabajo.";
    }
  }

  /* ============================================================
     PROGRESO DE LECTURA + REVELADO
     ============================================================ */
  var progress = $("#progress");
  function onScroll() {
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    progress.style.width = Math.min(100, (h.scrollTop || document.body.scrollTop) / max * 100) + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.14 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- botones de la escalera ---------- */
  $("#btnAddPeldano").addEventListener("click", function () { openEditor(null); });
  $("#btnResetPeldanos").addEventListener("click", function () {
    if (confirm("¿Restaurar la escalera de ejemplo de «" + (BIBLIOTECA[tipoActual()] || {}).label + "»? Reemplaza los peldaños actuales (las exposiciones registradas se conservan).")) resetPeldanos(tipoActual());
  });

  /* ---------- código del paciente ---------- */
  var codeInput = $("#codigo");
  if (window.Aprens) {
    var saved = Aprens.getPacienteCodigo();
    if (saved) codeInput.value = saved;
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }

  /* ---------- init ---------- */
  seedIfEmpty();
  renderMiedoPicker();
  renderLadder();
  if (window.Aprens && Aprens.mountBar) Aprens.mountBar();
})();
