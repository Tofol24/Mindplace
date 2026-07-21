/* ============================================================================
   La exploradora valiente · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Juego de exposición gradual para ansiedad de separación (infantil), dirigido
   por madre/padre. VARIAS ESCALERAS (una por persona/lugar), un MAPA DE
   SEGURIDAD que genera escaleras, y en cada misión dos llaves: el QUÉ (la misión
   + 3 normas, sin negociar la separación) y el CÓMO (co-regulación · AIS).
   Feedback de logro con CONFETI. Se guarda en el núcleo APRENS (aprens_db).
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOOL = "exploradora_valiente";
  var SEED_FLAG = "exploradora_valiente_seeded_v2";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "La exploradora valiente", toolVersion: 2 });

  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var _uidc = 0;
  function uid(pre) { _uidc++; return pre + Date.now() + "_" + _uidc; }

  function allRecords() { return window.Aprens ? Aprens.history() : []; }
  function getEscaleras() { return allRecords().filter(function (r) { return r.kind === "escalera"; }).sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }); }
  function getMisionesDe(escId) {
    return allRecords().filter(function (r) { return r.kind === "mision" && r.escId === escId; })
      .sort(function (a, b) { return (a.dificultad - b.dificultad) || ((a.ts || 0) - (b.ts || 0)); });
  }
  function getMapa() { return allRecords().filter(function (r) { return r.kind === "mapa"; }); }
  function getRondas() { return allRecords().filter(function (r) { return r.kind === "ronda"; }); }
  function rondasDe(id) { return getRondas().filter(function (r) { return r.misionId === id; }); }

  function saveRec(rec) { if (window.Aprens) Aprens.save(rec, { append: rec.kind === "ronda" }); return rec; }
  function removeRecord(id) {
    try {
      var raw = localStorage.getItem("aprens_db"); if (!raw) return;
      var d = JSON.parse(raw); var b = d.tools && d.tools[TOOL]; if (!b) return;
      b.records = b.records.filter(function (r) { return r.id !== id; });
      d.actualizado = new Date().toISOString();
      localStorage.setItem("aprens_db", JSON.stringify(d));
    } catch (e) {}
  }

  /* ---------- escaleras y misiones de ejemplo (editables) ---------- */
  var SEED_ESC = [
    { nombre: "En casa", emoji: "🏠", meta: "Quedarme un ratito sola en casa, tranquila", misiones: [
      { dificultad: 1, titulo: "Mamá en la habitación de al lado, con la puerta abierta", tiempo: "2 min", lugar: "en casa", conQuien: "sola un ratito", premio: "una pegatina" },
      { dificultad: 2, titulo: "Mamá en otra habitación, puerta entornada", tiempo: "5 min", lugar: "en casa", conQuien: "sola un ratito", premio: "una pegatina" },
      { dificultad: 3, titulo: "Jugar con papá mientras mamá va a un recado corto", tiempo: "10 min", lugar: "en casa", conQuien: "con papá", premio: "elegir el cuento de la noche" }
    ] },
    { nombre: "El cole", emoji: "🎒", meta: "Entrar al cole con una despedida corta y contenta", misiones: [
      { dificultad: 2, titulo: "Un abrazo y adiós en la puerta, sin alargar", tiempo: "la entrada", lugar: "en el cole", conQuien: "con la profe", premio: "un sello de valiente" },
      { dificultad: 3, titulo: "Entrar y saludar a la profe yo sola", tiempo: "la entrada", lugar: "en el cole", conQuien: "con la profe", premio: "una pegatina" }
    ] },
    { nombre: "La abuela", emoji: "👵", meta: "Pasar una tarde con la abuela sin mamá", misiones: [
      { dificultad: 3, titulo: "Merendar con la abuela con mamá cerca", tiempo: "30 min", lugar: "casa de la abuela", conQuien: "con mamá cerca", premio: "una pegatina" },
      { dificultad: 4, titulo: "Quedarme un rato sola con la abuela", tiempo: "45 min", lugar: "casa de la abuela", conQuien: "con la abuela", premio: "una aventura pequeña juntas" },
      { dificultad: 5, titulo: "Pasar una tarde entera con la abuela", tiempo: "una tarde", lugar: "casa de la abuela", conQuien: "con la abuela", premio: "algo especial que elija" }
    ] }
  ];
  function crearEscalera(nombre, emoji, meta) {
    var id = uid("esc_");
    return saveRec({ id: id, kind: "escalera", nombre: nombre, emoji: emoji || "⛰️", meta: meta || "Llegar a la cima", ts: Date.now() + _uidc });
  }
  function crearMision(escId, m, i) {
    return saveRec({ id: uid("mis_"), kind: "mision", escId: escId, ts: Date.now() + (i || 0),
      dificultad: m.dificultad, titulo: m.titulo, tiempo: m.tiempo || "", lugar: m.lugar || "", conQuien: m.conQuien || "", premio: m.premio || "" });
  }
  function seedIfEmpty() {
    var seeded = false; try { seeded = localStorage.getItem(SEED_FLAG) === "1"; } catch (e) {}
    if (!seeded && getEscaleras().length === 0) {
      SEED_ESC.forEach(function (e) { var esc0 = crearEscalera(e.nombre, e.emoji, e.meta); e.misiones.forEach(function (m, i) { crearMision(esc0.id, m, i); }); });
      try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    }
  }
  function resetTodo() {
    allRecords().forEach(function (r) { if (r.kind === "escalera" || r.kind === "mision" || r.kind === "mapa") removeRecord(r.id); });
    SEED_ESC.forEach(function (e) { var esc0 = crearEscalera(e.nombre, e.emoji, e.meta); e.misiones.forEach(function (m, i) { crearMision(esc0.id, m, i); }); });
    try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    escSel = (getEscaleras()[0] || {}).id || null;
    closeEditor(); renderAll();
  }

  /* plantilla de misiones al generar una escalera desde el mapa */
  function plantillaPersona(nombre) {
    return [
      { dificultad: 2, titulo: "Estar con " + nombre + " un ratito, con mamá cerca", tiempo: "10 min", conQuien: "con " + nombre + " y mamá", premio: "una pegatina" },
      { dificultad: 3, titulo: "Quedarme con " + nombre + " sin mamá al lado", tiempo: "20 min", conQuien: "con " + nombre, premio: "elegir un juego" },
      { dificultad: 4, titulo: "Pasar un rato largo con " + nombre, tiempo: "una tarde", conQuien: "con " + nombre, premio: "algo especial" }
    ];
  }

  /* ---------- acuerdos de la despedida (contexto: exposición a la separación) ---------- */
  var NORMAS = [
    "Despedida corta y con cariño: un abrazo y «vuelvo pronto», sin alargar.",
    "Mantener el plan sin negociar la separación, aunque proteste o llore.",
    "Volver justo cuando lo hemos dicho: cumplir la promesa da seguridad."
  ];
  var APOYOS = [
    { id: "abrazo", ico: "🤍", t: "Abrazo sentido con respiración", d: "Un abrazo de verdad, sin prisa, respirando juntas. El adulto respira hondo primero.", href: "/rincon/index.html?ej=abrazo" },
    { id: "respiracion", ico: "🌸", t: "Respiración de la flor y la vela", d: "Huele la flor (inspira)… apaga la vela (espira). Tres veces, despacio.", href: "/rincon/index.html?ej=respiracion" },
    { id: "curiosidad", ico: "🔎", t: "Mirar la sensación con curiosidad", d: "¿Dónde lo notas? ¿Calor, mariposas, nudo? Le ponemos nombre juntas, sin asustarnos.", href: "/rincon/index.html?ej=sensaciones" },
    { id: "pedir_abrazo", ico: "🗣️", t: "Pedir abrazo en vez de repetir", d: "Cuando repita «¿estás bien?», cambiamos la pregunta por un abrazo. Menos explicaciones, más presencia." },
    { id: "audio", ico: "🎧", t: "El ritual diario de audios", d: "Un ratito de calma y atención, escuchado juntas (abre el ritual de audios AIS).", tool: "ritual_calma" }
  ];
  var CARITAS = ["😣", "😟", "😐", "🙂", "😄"];

  /* ---------- confeti (papelines) ---------- */
  function confeti() {
    var cols = ["#DDA637", "#5B9B8B", "#D98A6A", "#516E46", "#E4C79E"];
    for (var i = 0; i < 28; i++) {
      var c = document.createElement("div"); c.className = "confeti";
      c.style.left = (i * 3.6) + "vw"; c.style.background = cols[i % cols.length];
      c.style.animation = "cae " + (1.5 + (i % 5) * 0.28) + "s ease-in " + ((i % 6) * 0.07) + "s forwards";
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3600); })(c);
    }
  }

  /* ============================================================
     MAPA DE SEGURIDAD (genera escaleras)
     ============================================================ */
  var ZONAS = [
    { k: "muy", t: "Muy segura", ico: "💚", gen: false },
    { k: "bastante", t: "Bastante segura", ico: "🙂", gen: false },
    { k: "algo", t: "Algo nerviosa", ico: "😟", gen: true },
    { k: "poco", t: "Muy nerviosa", ico: "😣", gen: true }
  ];
  var mapaBox = $("#mapaBox"), mapaNote = $("#mapaNote");

  function renderMapa() {
    if (!mapaBox) return;
    var entradas = getMapa();
    mapaBox.innerHTML =
      '<div class="mapa-add">' +
        '<input type="text" id="mapaNombre" placeholder="una persona o un lugar… (la abuela, el cole, un amigo)">' +
        '<div class="mapa-btns">' +
          ZONAS.map(function (z) { return '<button class="mzbtn mz-' + z.k + '" data-z="' + z.k + '">' + z.ico + ' ' + z.t + '</button>'; }).join("") +
        '</div>' +
      '</div>' +
      '<div class="mapa-zonas">' +
        ZONAS.map(function (z) {
          var items = entradas.filter(function (e) { return e.zona === z.k; });
          return '<div class="mzone mz-' + z.k + '"><div class="mz-h">' + z.ico + ' ' + z.t + (z.gen ? ' <span class="mz-tag">→ escalera</span>' : '') + '</div>' +
            (items.length ? items.map(function (e) { return '<span class="mz-item" data-id="' + e.id + '">' + esc(e.nombre) + '<button class="mz-x" data-id="' + e.id + '" aria-label="Quitar">×</button></span>'; }).join("") : '<span class="mz-empty">—</span>') +
            '</div>';
        }).join("") +
      '</div>';

    $$(".mzbtn", mapaBox).forEach(function (b) { b.addEventListener("click", function () { addMapa(b.getAttribute("data-z")); }); });
    $$(".mz-x", mapaBox).forEach(function (x) { x.addEventListener("click", function () { removeRecord(x.getAttribute("data-id")); renderMapa(); }); });
  }

  function addMapa(zona) {
    var inp = $("#mapaNombre"); var nombre = (inp.value || "").trim();
    if (!nombre) { inp.focus(); return; }
    saveRec({ id: uid("map_"), kind: "mapa", nombre: nombre, zona: zona, ts: Date.now() });
    inp.value = "";
    var z = ZONAS.filter(function (x) { return x.k === zona; })[0];
    if (z && z.gen) {
      // ¿ya tiene escalera con ese nombre?
      var existe = getEscaleras().some(function (e) { return e.nombre.toLowerCase() === nombre.toLowerCase(); });
      if (!existe) {
        var nueva = crearEscalera(nombre, "🧭", "Acercarme a " + nombre + " poco a poco");
        plantillaPersona(nombre).forEach(function (m, i) { crearMision(nueva.id, m, i); });
        escSel = nueva.id;
        confeti();
        if (mapaNote) mapaNote.textContent = "🧗 Se ha creado la escalera de «" + nombre + "» para acercaros poco a poco.";
        renderMapa(); renderAll();
        $("#misiones").scrollIntoView({ behavior: "smooth" });
        return;
      } else if (mapaNote) { mapaNote.textContent = "«" + nombre + "» ya tiene su escalera."; }
    } else if (mapaNote) { mapaNote.textContent = "Añadida a «" + (z ? z.t : zona) + "»."; }
    renderMapa();
  }

  /* ============================================================
     ESCALERAS (selector) + LADDER
     ============================================================ */
  var escSel = null;
  var escSelector = $("#escSelector"), escMeta = $("#escMeta"), ladder = $("#ladder");

  function renderEscSelector() {
    var escs = getEscaleras();
    if (!escs.length) { escSelector.innerHTML = ""; return; }
    if (!escSel || !escs.some(function (e) { return e.id === escSel; })) escSel = escs[0].id;
    escSelector.innerHTML = escs.map(function (e) {
      var d = getMisionesDe(e.id), done = d.filter(function (m) { return rondasDe(m.id).some(function (r) { return r.logrado && r.logrado !== "aun"; }); }).length;
      return '<button class="esc-chip' + (e.id === escSel ? ' on' : '') + '" data-id="' + e.id + '">' +
        '<span class="ec-emoji">' + (e.emoji || "⛰️") + '</span><span class="ec-name">' + esc(e.nombre) + '</span>' +
        '<span class="ec-count">' + done + '/' + d.length + '</span></button>';
    }).join("") + '<button class="esc-chip esc-new" id="escNew">＋ Nueva escalera</button>';

    $$(".esc-chip[data-id]", escSelector).forEach(function (b) {
      b.addEventListener("click", function () { escSel = b.getAttribute("data-id"); closeEditor(); renderAll(); });
    });
    $("#escNew").addEventListener("click", openEscEditor);
  }

  function renderEscMeta() {
    var e = getEscaleras().filter(function (x) { return x.id === escSel; })[0];
    if (!e) { escMeta.innerHTML = ""; return; }
    escMeta.innerHTML =
      '<div class="esc-meta-in"><span class="em-goal">🏔️ Meta: <b>' + esc(e.meta) + '</b></span>' +
      '<span class="em-acts"><button class="mini mini-edit" id="escEdit">Editar meta</button>' +
      '<button class="mini mini-del" id="escDel">Borrar escalera</button></span></div>';
    $("#escEdit").addEventListener("click", function () { openEscEditor(e); });
    $("#escDel").addEventListener("click", function () {
      if (getEscaleras().length <= 1) { alert("Deja al menos una escalera. Puedes editarla en vez de borrarla."); return; }
      if (confirm("¿Borrar la escalera «" + e.nombre + "» y sus misiones? Las rondas registradas se conservan.")) {
        getMisionesDe(e.id).forEach(function (m) { removeRecord(m.id); });
        removeRecord(e.id); escSel = (getEscaleras()[0] || {}).id || null; closeEditor(); renderAll();
      }
    });
  }

  /* editor de escalera (nueva / meta) */
  var editor = $("#misionEditor");
  function openEscEditor(e) {
    var isNew = !e || !e.id;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (isNew ? "Nueva escalera" : "Editar escalera") + '</h3>' +
      '<p class="hint">Una escalera por persona o lugar (la abuela, el cole, un amigo…). Ponle una meta bonita: es la cima.</p>' +
      '<div class="grid2">' +
        '<div class="field"><label for="eNombre">Nombre</label><input type="text" id="eNombre" placeholder="La abuela, El cole…" value="' + esc(e ? e.nombre : "") + '"></div>' +
        '<div class="field"><label for="eEmoji">Emoji</label><input type="text" id="eEmoji" maxlength="2" placeholder="👵" value="' + esc(e ? e.emoji : "") + '"></div>' +
      '</div>' +
      '<div class="field"><label for="eMeta">La meta (la cima)</label><input type="text" id="eMeta" placeholder="Pasar una tarde con la abuela sin mamá" value="' + esc(e ? e.meta : "") + '"></div>' +
      '<div class="editor-acts">' +
        '<button class="btn btn-primary" id="eSave">' + (isNew ? "Crear escalera" : "Guardar") + '</button>' +
        '<button class="btn btn-link" id="eCancel">Cancelar</button>' +
      '</div>';
    $("#eSave").addEventListener("click", function () {
      var nombre = ($("#eNombre").value || "").trim(); if (!nombre) { $("#eNombre").focus(); return; }
      if (isNew) { var nueva = crearEscalera(nombre, ($("#eEmoji").value || "").trim() || "⛰️", ($("#eMeta").value || "").trim() || "Llegar a la cima"); escSel = nueva.id; }
      else { e.nombre = nombre; e.emoji = ($("#eEmoji").value || "").trim() || e.emoji; e.meta = ($("#eMeta").value || "").trim() || e.meta; saveRec(e); }
      closeEditor(); renderAll();
    });
    $("#eCancel").addEventListener("click", closeEditor);
    editor.scrollIntoView({ behavior: "smooth", block: "center" }); $("#eNombre").focus();
  }

  function chip(label, val) { return val ? '<span class="chip">' + esc(label) + ' <b>' + esc(val) + '</b></span>' : ""; }
  function starsHTML(n) {
    n = Math.max(1, Math.min(5, Number(n) || 1)); var s = "";
    for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= n ? "on" : "off") + '">★</span>';
    return '<span class="stars">' + s + '</span>';
  }
  function misionLograda(id) { return rondasDe(id).some(function (r) { return r.logrado && r.logrado !== "aun"; }); }

  function rungHTML(m, n) {
    var hechas = rondasDe(m.id).length, lograda = misionLograda(m.id);
    var badge = lograda ? '<span class="rung-badge">⭐ ¡Conseguida!</span>' : (hechas ? '<span class="rung-badge">· ' + hechas + ' intento' + (hechas === 1 ? '' : 's') + '</span>' : "");
    return '<div class="rung' + (lograda ? ' rung-done' : '') + '" data-id="' + m.id + '">' +
      '<div class="rung-top"><span class="rung-n">' + (lograda ? '★' : n) + '</span>' +
        '<div class="rung-body">' +
          '<div class="rung-title">' + esc(m.titulo) + '</div>' +
          '<div class="rung-vars">' + chip("⏱", m.tiempo) + chip("📍", m.lugar) + chip("👥", m.conQuien) + chip("🎁", m.premio) + '</div>' +
          '<div class="rung-dif"><span class="dl">Valentía</span>' + starsHTML(m.dificultad) + '</div>' + badge +
          '<div class="rung-acts">' +
            '<button class="mini mini-go" data-act="go">Preparar misión →</button>' +
            '<button class="mini mini-done" data-act="done">✓ ¡Lo conseguí!</button>' +
            '<button class="mini mini-edit" data-act="edit">Editar</button>' +
            '<button class="mini mini-del" data-act="del">Borrar</button>' +
          '</div>' +
        '</div></div></div>';
  }

  function renderLadder() {
    if (!escSel) { ladder.innerHTML = '<p class="lead">Crea tu primera escalera o restaura el ejemplo.</p>'; return; }
    var ms = getMisionesDe(escSel);
    if (!ms.length) { ladder.innerHTML = '<p class="lead">Esta escalera no tiene misiones aún. Añade la primera.</p>'; return; }
    ladder.innerHTML = ms.map(function (m, i) { return rungHTML(m, i + 1); }).join("");
    $$(".rung", ladder).forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          if (act === "go") startRonda(id);
          else if (act === "done") conseguirRapido(id);
          else if (act === "edit") openEditor(id);
          else if (act === "del") { if (confirm("¿Borrar esta misión? Las rondas registradas se conservan.")) { removeRecord(id); closeEditor(); renderAll(); } }
        });
      });
    });
  }

  /* celebración rápida: marca una misión como conseguida con confeti */
  function conseguirRapido(id) {
    var m = getMisionesDe(escSel).filter(function (x) { return x.id === id; })[0]; if (!m) return;
    saveRec({ id: "ron_" + Date.now(), kind: "ronda", date: ymd(), ts: Date.now(), escId: escSel,
      misionId: id, misionTitulo: m.titulo, nivel: m.dificultad, logrado: "si", premio: m.premio, rapido: true });
    confeti(); renderAll();
  }

  function renderAll() { renderEscSelector(); renderEscMeta(); renderLadder(); }

  /* ---------- editor de misión ---------- */
  var editingId = null;
  function openEditor(id) {
    editingId = id || null;
    var m = id ? getMisionesDe(escSel).filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !m; var dif = m ? Number(m.dificultad) || 3 : 3;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (isNew ? "Nueva misión" : "Editar misión") + '</h3>' +
      '<p class="hint">Que sea concreta y alcanzable. Las estrellas indican cuánta valentía pide: la escalera se reordena sola.</p>' +
      '<div class="field"><label for="mTitulo">La misión</label>' +
        '<textarea id="mTitulo" rows="2" placeholder="p. ej. quedarse con papá 10 minutos mientras mamá sale">' + esc(m ? m.titulo : "") + '</textarea></div>' +
      '<div class="grid2">' +
        '<div class="field"><label for="mTiempo">Tiempo</label><input type="text" id="mTiempo" placeholder="5 min" value="' + esc(m ? m.tiempo : "") + '"></div>' +
        '<div class="field"><label for="mLugar">Lugar</label><input type="text" id="mLugar" placeholder="en casa, en el cole…" value="' + esc(m ? m.lugar : "") + '"></div>' +
        '<div class="field"><label for="mConQuien">¿Con quién se queda?</label><input type="text" id="mConQuien" placeholder="con papá, la abuela…" value="' + esc(m ? m.conQuien : "") + '"></div>' +
        '<div class="field"><label for="mPremio">Premio si lo logra</label><input type="text" id="mPremio" placeholder="una pegatina…" value="' + esc(m ? m.premio : "") + '"></div>' +
      '</div>' +
      '<div class="scale"><div class="scale-top"><span class="cap">Estrellas de valentía</span><span class="n" id="mDifN">' + dif + '</span></div>' +
        '<input type="range" min="1" max="5" value="' + dif + '" id="mDif" aria-label="Estrellas de valentía">' +
        '<div class="ends"><span>Fácil (1)</span><span>Muy valiente (5)</span></div></div>' +
      '<div class="editor-acts">' +
        '<button class="btn btn-primary" id="mSave">' + (isNew ? "Añadir a la escalera" : "Guardar cambios") + '</button>' +
        '<button class="btn btn-link" id="mCancel">Cancelar</button>' +
      '</div>';
    var dn = $("#mDifN"), dr = $("#mDif");
    dr.addEventListener("input", function () { dn.textContent = dr.value; });
    $("#mSave").addEventListener("click", saveMision);
    $("#mCancel").addEventListener("click", closeEditor);
    editor.scrollIntoView({ behavior: "smooth", block: "center" }); $("#mTitulo").focus();
  }
  function closeEditor() { editor.hidden = true; editor.innerHTML = ""; editingId = null; }

  function saveMision() {
    var titulo = ($("#mTitulo").value || "").trim(); if (!titulo) { $("#mTitulo").focus(); return; }
    var existing = editingId ? getMisionesDe(escSel).filter(function (x) { return x.id === editingId; })[0] : null;
    saveRec({ id: editingId || uid("mis_"), kind: "mision", escId: escSel, ts: existing ? existing.ts : Date.now(),
      dificultad: Number($("#mDif").value), titulo: titulo,
      tiempo: ($("#mTiempo").value || "").trim(), lugar: ($("#mLugar").value || "").trim(),
      conQuien: ($("#mConQuien").value || "").trim(), premio: ($("#mPremio").value || "").trim() });
    closeEditor(); renderAll();
  }

  /* ============================================================
     HACER UNA MISIÓN · LAS DOS LLAVES
     ============================================================ */
  var runSection = $("#run"), runBody = $("#runBody");
  var runState = null;

  function caritasHTML(group) {
    return '<div class="caritas" id="' + group + '" role="group" aria-label="Cómo está">' +
      CARITAS.map(function (c, i) { return '<button class="carita" data-v="' + (i + 1) + '" aria-pressed="false" aria-label="' + (i + 1) + ' de 5">' + c + '</button>'; }).join("") + '</div>';
  }

  function startRonda(id) {
    var m = getMisionesDe(escSel).filter(function (x) { return x.id === id; })[0]; if (!m) return;
    runState = { misionId: id, escId: escSel, apoyos: [], antes: null, despues: null, logrado: null, pidio_abrazo: null, sin_negociar: null };
    runBody.innerHTML =
      '<div class="sec-head"><span class="num">Misión</span>' +
        '<h2>Ábrela con vuestras dos llaves</h2>' +
        '<p>Primero el QUÉ (qué toca hoy y las normas). Durante la separación, el CÓMO (cómo la acompañáis). Al terminar, registrad cómo fue y dad el premio si lo logró.</p></div>' +
      '<div class="run-target"><div class="t">' + esc(m.titulo) + '</div>' +
        '<div class="v">' + chip("⏱", m.tiempo) + chip("📍", m.lugar) + chip("👥", m.conQuien) + chip("🎁", m.premio) + '</div></div>' +
      '<div class="keypanel kp-que">' +
        '<div class="kp-head"><span class="k">🗺️</span><h3>El QUÉ</h3></div><p class="kp-sub">La misión de hoy</p>' +
        '<div class="grid2">' +
          '<div class="field"><label for="hTiempo">Tiempo de hoy</label><input type="text" id="hTiempo" value="' + esc(m.tiempo) + '"></div>' +
          '<div class="field"><label for="hConQuien">Con quién se queda hoy</label><input type="text" id="hConQuien" value="' + esc(m.conQuien) + '"></div>' +
        '</div>' +
        '<div class="field"><label>Los acuerdos de la despedida</label><ul class="normas">' + NORMAS.map(function (n, i) { return '<li><span class="nn">' + (i + 1) + '</span>' + esc(n) + '</li>'; }).join("") + '</ul></div>' +
        '<div class="grid2">' +
          '<div class="field"><label for="hConsecuencia">Consecuencia acordada (proporcional)</label><input type="text" id="hConsecuencia" placeholder="p. ej. pausa del juego 2 min"></div>' +
          '<div class="field"><label for="hPremio">Premio de hoy</label><input type="text" id="hPremio" value="' + esc(m.premio) + '"></div>' +
        '</div>' +
        '<div class="field"><label>¿Cómo está ANTES de empezar?</label>' + caritasHTML("antes") + '</div>' +
        '<p class="kp-hint" style="margin-top:16px"><b>Si protesta o llora:</b> validad sin ceder — «sé que cuesta; estarás bien y vuelvo pronto». Vuestra calma es su seguridad.</p>' +
      '</div>' +
      '<div class="keypanel kp-como">' +
        '<div class="kp-head"><span class="k">🤍</span><h3>El CÓMO</h3></div><p class="kp-sub">Cómo nos acompañamos · AIS</p>' +
        '<p class="kp-hint">Marcad lo que uséis. Tocad <b>Practicar ↗</b> para entrenar cada apoyo (el adulto es el modelo: si os calmáis vosotras, se calma ella).</p>' +
        '<div class="apoyos">' +
          APOYOS.map(function (a) {
            return '<label class="apoyo" data-ap="' + a.id + '"><input type="checkbox"><span class="ico">' + a.ico + '</span>' +
              '<span class="txt"><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span></span>' +
              ((a.href || a.tool) ? '<a class="apoyo-practicar" href="' + (a.href || ("/#/tool/" + a.tool)) + '" target="_blank" rel="noopener">Practicar ↗</a>' : '') + '</label>';
          }).join("") + '</div>' +
        '<div class="field"><label>¿Cómo está DESPUÉS?</label>' + caritasHTML("despues") + '</div>' +
        '<div class="field"><label>¿Lo logró?</label><div class="pillset" id="logrado">' +
            '<button class="pill" data-v="si" aria-pressed="false">Sí, del todo</button>' +
            '<button class="pill" data-v="medias" aria-pressed="false">A medias</button>' +
            '<button class="pill warn" data-v="aun" aria-pressed="false">Todavía no</button></div></div>' +
        '<div class="field"><label>¿Pidió abrazo en vez de repetir?</label><div class="pillset" id="pidio">' +
            '<button class="pill" data-v="si" aria-pressed="false">Sí</button>' +
            '<button class="pill" data-v="no" aria-pressed="false">No aún</button></div></div>' +
        '<div class="field"><label>¿Mantuvisteis el plan sin negociar?</label><div class="pillset" id="negociar">' +
            '<button class="pill" data-v="si" aria-pressed="false">Sí</button>' +
            '<button class="pill warn" data-v="cedimos" aria-pressed="false">Cedimos un poco</button></div></div>' +
        '<div class="field"><label for="hNota">¿Algo que contar? (opcional)</label>' +
          '<textarea id="hNota" rows="2" placeholder="lloró al principio y luego jugó tranquila…"></textarea></div>' +
      '</div>' +
      '<div class="run-acts">' +
        '<button class="btn btn-como" id="runSave">Guardar misión</button>' +
        '<button class="btn btn-primary" id="runSaveWA">Guardar y enviar por WhatsApp</button>' +
        '<button class="run-close" id="runCancel">Cerrar sin guardar</button>' +
      '</div><p class="run-note" id="runNote"></p>';

    $$(".apoyo", runBody).forEach(function (l) {
      var cb = $("input", l), id2 = l.getAttribute("data-ap");
      cb.addEventListener("change", function () {
        l.classList.toggle("on", cb.checked);
        var i = runState.apoyos.indexOf(id2);
        if (cb.checked) { if (i < 0) runState.apoyos.push(id2); } else if (i >= 0) runState.apoyos.splice(i, 1);
      });
      var link = $(".apoyo-practicar", l); if (link) link.addEventListener("click", function (e) { e.stopPropagation(); });
    });
    bindSingle("antes", ".carita", function (v) { runState.antes = v ? Number(v) : null; });
    bindSingle("despues", ".carita", function (v) { runState.despues = v ? Number(v) : null; });
    bindSingle("logrado", ".pill", function (v) { runState.logrado = v; });
    bindSingle("pidio", ".pill", function (v) { runState.pidio_abrazo = v; });
    bindSingle("negociar", ".pill", function (v) { runState.sin_negociar = v; });
    $("#runSave").addEventListener("click", function () { saveRonda(false); });
    $("#runSaveWA").addEventListener("click", function () { saveRonda(true); });
    $("#runCancel").addEventListener("click", closeRonda);
    runSection.hidden = false; runSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindSingle(groupId, sel, cb) {
    var g = $("#" + groupId); if (!g) return;
    $$(sel, g).forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") === "true";
        $$(sel, g).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", on ? "false" : "true");
        cb(on ? null : b.getAttribute("data-v"));
      });
    });
  }

  function closeRonda() { runSection.hidden = true; runBody.innerHTML = ""; runState = null; $("#misiones").scrollIntoView({ behavior: "smooth" }); }

  var LOGRADO_TXT = { si: "Sí, del todo", medias: "A medias", aun: "Todavía no" };
  var NEG_TXT = { si: "Sí, sin negociar", cedimos: "Cedimos un poco" };

  function buildRonda() {
    var m = getMisionesDe(runState.escId).filter(function (x) { return x.id === runState.misionId; })[0] || {};
    return { id: "ron_" + Date.now(), kind: "ronda", date: ymd(), ts: Date.now(), escId: runState.escId,
      misionId: runState.misionId, misionTitulo: m.titulo || "", nivel: m.dificultad,
      tiempo_hoy: ($("#hTiempo").value || "").trim(), conQuien_hoy: ($("#hConQuien").value || "").trim(),
      consecuencia: ($("#hConsecuencia").value || "").trim(), premio: ($("#hPremio").value || "").trim(),
      antes: runState.antes, despues: runState.despues, apoyos: runState.apoyos.slice(),
      logrado: runState.logrado, pidio_abrazo: runState.pidio_abrazo, sin_negociar: runState.sin_negociar,
      nota: ($("#hNota").value || "").trim() };
  }
  function resumenRonda(r) {
    var L = ["La exploradora valiente · misión — APRENS", "Fecha: " + r.date];
    L.push("Misión: " + (r.misionTitulo || "—") + (r.nivel != null ? " (" + r.nivel + "★)" : ""));
    if (r.tiempo_hoy || r.conQuien_hoy) L.push("Hoy: " + [r.tiempo_hoy, r.conQuien_hoy].filter(Boolean).join(" · "));
    if (r.antes != null || r.despues != null) L.push("Cómo estaba: " + (r.antes ? CARITAS[r.antes - 1] : "—") + " → " + (r.despues ? CARITAS[r.despues - 1] : "—"));
    if (r.logrado) L.push("¿Lo logró?: " + (LOGRADO_TXT[r.logrado] || r.logrado));
    if (r.pidio_abrazo) L.push("¿Pidió abrazo en vez de repetir?: " + (r.pidio_abrazo === "si" ? "sí" : "no aún"));
    if (r.sin_negociar) L.push("Plan: " + (NEG_TXT[r.sin_negociar] || r.sin_negociar));
    if (r.apoyos && r.apoyos.length) { var names = r.apoyos.map(function (a) { var x = APOYOS.filter(function (y) { return y.id === a; })[0]; return x ? x.t : a; }); L.push("Nos acompañamos con: " + names.join(", ")); }
    if (r.premio) L.push("Premio: " + r.premio);
    if (r.nota) L.push("Nota: " + r.nota);
    L.push("", "(Enviado desde La exploradora valiente · adjunta también el .json para el panel)");
    return L.join("\n");
  }
  function saveRonda(share) {
    if (!runState) return;
    var cod = ($("#codigo").value || "").trim(); if (cod && window.Aprens) Aprens.setPacienteCodigo(cod);
    var r = buildRonda(); saveRec(r);
    var note = $("#runNote"); var lograda = r.logrado && r.logrado !== "aun";
    if (lograda) confeti();
    if (share) { try { window.open("https://wa.me/?text=" + encodeURIComponent(resumenRonda(r)), "_blank"); } catch (e) {} if (note) note.textContent = "Guardada en este dispositivo. Se ha abierto WhatsApp para enviarla."; }
    else if (note) { note.textContent = "Misión guardada en este dispositivo."; }
    renderAll();
    if (lograda && note) note.textContent += " ¡Fue valiente! No olvidéis el premio y celebrarlo.";
  }

  /* ============================================================
     PROGRESO + REVELADO + INIT
     ============================================================ */
  var progress = $("#progress");
  function onScroll() { var h = document.documentElement; var max = (h.scrollHeight - h.clientHeight) || 1; progress.style.width = Math.min(100, (h.scrollTop || document.body.scrollTop) / max * 100) + "%"; }
  document.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.14 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  $("#btnAddMision").addEventListener("click", function () { if (!escSel) { openEscEditor(); return; } openEditor(null); });
  $("#btnResetMisiones").addEventListener("click", function () { if (confirm("¿Restaurar las escaleras de ejemplo? Reemplaza escaleras, misiones y mapa actuales (las rondas registradas se conservan).")) resetTodo(); });

  var codeInput = $("#codigo");
  if (window.Aprens) {
    var savedCod = Aprens.getPacienteCodigo(); if (savedCod) codeInput.value = savedCod;
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }

  seedIfEmpty();
  escSel = (getEscaleras()[0] || {}).id || null;
  renderMapa(); renderAll();
  if (window.Aprens && Aprens.mountBar) Aprens.mountBar();
})();
