/* ============================================================================
   La exploradora valiente · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Juego de exposición gradual para ansiedad de separación (infantil), dirigido
   por madre/padre. Escalera de "misiones de valiente" (separaciones graduales)
   y, en cada misión, dos llaves: el QUÉ (la misión + 3 normas, sin negociar la
   separación) y el CÓMO (acompañamiento y co-regulación parental · AIS).
   Se guarda en el núcleo APRENS (aprens_db) para compartirlo con el psicólogo/a.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOOL = "exploradora_valiente";
  var SEED_FLAG = "exploradora_valiente_seeded_v1";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "La exploradora valiente", toolVersion: 1 });

  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function allRecords() { return window.Aprens ? Aprens.history() : []; }
  function getMisiones() {
    return allRecords().filter(function (r) { return r.kind === "mision"; })
      .sort(function (a, b) { return (a.dificultad - b.dificultad) || ((a.ts || 0) - (b.ts || 0)); });
  }
  function getRondas() { return allRecords().filter(function (r) { return r.kind === "ronda"; }); }
  function rondasDe(id) { return getRondas().filter(function (r) { return r.misionId === id; }); }

  function removeRecord(id) {
    try {
      var raw = localStorage.getItem("aprens_db"); if (!raw) return;
      var d = JSON.parse(raw); var b = d.tools && d.tools[TOOL]; if (!b) return;
      b.records = b.records.filter(function (r) { return r.id !== id; });
      d.actualizado = new Date().toISOString();
      localStorage.setItem("aprens_db", JSON.stringify(d));
    } catch (e) {}
  }

  /* ---------- misiones de ejemplo (editables) ---------- */
  var SEMILLA = [
    { dificultad: 1, titulo: "Mamá en la habitación de al lado, con la puerta abierta", tiempo: "2 min", lugar: "en casa", conQuien: "sola un ratito", premio: "una pegatina" },
    { dificultad: 2, titulo: "Mamá en otra habitación, puerta entornada", tiempo: "5 min", lugar: "en casa", conQuien: "sola un ratito", premio: "una pegatina" },
    { dificultad: 2, titulo: "Quedarse jugando con papá mientras mamá va a un recado corto", tiempo: "10 min", lugar: "en casa", conQuien: "con papá", premio: "elegir el cuento de la noche" },
    { dificultad: 3, titulo: "Despedida corta en el cole: un abrazo y adiós, sin alargar", tiempo: "la entrada", lugar: "en el cole", conQuien: "con la profe", premio: "un sello de valiente" },
    { dificultad: 4, titulo: "Quedarse un rato en casa de la abuela sin mamá", tiempo: "30 min", lugar: "casa de la abuela", conQuien: "con la abuela", premio: "una aventura pequeña juntas" },
    { dificultad: 5, titulo: "Una tarde o actividad sin mamá presente", tiempo: "1–2 h", lugar: "una actividad / casa de un amigo", conQuien: "con un adulto de confianza", premio: "algo especial que elija" }
  ];
  function seedMision(m, i) {
    var rec = { id: "mis_" + Date.now() + "_" + i, kind: "mision", ts: Date.now() + i,
      dificultad: m.dificultad, titulo: m.titulo, tiempo: m.tiempo, lugar: m.lugar, conQuien: m.conQuien, premio: m.premio };
    if (window.Aprens) Aprens.save(rec);
    return rec;
  }
  function seedIfEmpty() {
    var seeded = false; try { seeded = localStorage.getItem(SEED_FLAG) === "1"; } catch (e) {}
    if (!seeded && getMisiones().length === 0) {
      SEMILLA.forEach(seedMision);
      try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    }
  }
  function resetMisiones() {
    getMisiones().forEach(function (m) { removeRecord(m.id); });
    SEMILLA.forEach(seedMision);
    try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    closeEditor(); renderLadder();
  }

  /* ---------- las 3 normas y los apoyos del CÓMO ---------- */
  var NORMAS = [
    "No usar el móvil durante la misión.",
    "No ir a buscar a mamá ni tocarla durante el ejercicio.",
    "No salir de la habitación (o del sitio) hasta terminar."
  ];
  var APOYOS = [
    { id: "abrazo", ico: "🤍", t: "Abrazo sentido con respiración", d: "Un abrazo de verdad, sin prisa, respirando juntas. El adulto respira hondo primero.", tool: "ais_amor" },
    { id: "respiracion", ico: "🌸", t: "Respiración de la flor y la vela", d: "Huele la flor (inspira)… apaga la vela (espira). Tres veces, despacio.", tool: "herramienta_diaria" },
    { id: "curiosidad", ico: "🔎", t: "Mirar la sensación con curiosidad", d: "¿Dónde lo notas? ¿Calor, mariposas, nudo? Le ponemos nombre juntas, sin asustarnos.", tool: "ais_curiosidad" },
    { id: "pedir_abrazo", ico: "🗣️", t: "Pedir abrazo en vez de repetir", d: "Cuando repita «¿estás bien?», cambiamos la pregunta por un abrazo. Menos explicaciones, más presencia." },
    { id: "audio", ico: "🎧", t: "El ritual diario de audios", d: "Un ratito de calma y atención, escuchado juntas (abre el ritual de audios AIS).", tool: "ritual_calma" }
  ];
  var CARITAS = ["😣", "😟", "😐", "🙂", "😄"];

  /* ============================================================
     ESCALERA DE MISIONES
     ============================================================ */
  var ladder = $("#ladder");

  function chip(label, val) { return val ? '<span class="chip">' + esc(label) + ' <b>' + esc(val) + '</b></span>' : ""; }
  function starsHTML(n) {
    n = Math.max(1, Math.min(5, Number(n) || 1));
    var s = "";
    for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= n ? "on" : "off") + '">★</span>';
    return '<span class="stars">' + s + '</span>';
  }

  function rungHTML(m, n) {
    var hechas = rondasDe(m.id).length;
    var badge = hechas ? '<span class="rung-badge">⭐ ' + hechas + ' ronda' + (hechas === 1 ? '' : 's') + ' registrada' + (hechas === 1 ? '' : 's') + '</span>' : "";
    return '<div class="rung' + (hechas ? ' rung-done' : '') + '" data-id="' + m.id + '">' +
      '<div class="rung-top">' +
        '<span class="rung-n">' + n + '</span>' +
        '<div class="rung-body">' +
          '<div class="rung-title">' + esc(m.titulo) + '</div>' +
          '<div class="rung-vars">' +
            chip("⏱", m.tiempo) + chip("📍", m.lugar) + chip("👥", m.conQuien) + chip("🎁", m.premio) +
          '</div>' +
          '<div class="rung-dif"><span class="dl">Valentía</span>' + starsHTML(m.dificultad) + '</div>' +
          badge +
          '<div class="rung-acts">' +
            '<button class="mini mini-go" data-act="go">Preparar misión →</button>' +
            '<button class="mini mini-edit" data-act="edit">Editar</button>' +
            '<button class="mini mini-del" data-act="del">Borrar</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderLadder() {
    var ms = getMisiones();
    if (!ms.length) { ladder.innerHTML = '<p class="lead">Aún no hay misiones. Añadid la primera o restaurad las de ejemplo.</p>'; return; }
    ladder.innerHTML = ms.map(function (m, i) { return rungHTML(m, i + 1); }).join("");
    $$(".rung", ladder).forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          if (act === "go") startRonda(id);
          else if (act === "edit") openEditor(id);
          else if (act === "del") { if (confirm("¿Borrar esta misión? Las rondas ya registradas se conservan en vuestros datos.")) { removeRecord(id); closeEditor(); renderLadder(); } }
        });
      });
    });
  }

  /* ---------- editor de misión ---------- */
  var editor = $("#misionEditor");
  var editingId = null;

  function openEditor(id) {
    editingId = id || null;
    var m = id ? getMisiones().filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !m;
    var dif = m ? Number(m.dificultad) || 3 : 3;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (isNew ? "Nueva misión" : "Editar misión") + '</h3>' +
      '<p class="hint">Que sea concreta y alcanzable. Las estrellas indican cuánta valentía pide: la escalera se reordena sola.</p>' +
      '<div class="field"><label for="mTitulo">La misión</label>' +
        '<textarea id="mTitulo" rows="2" placeholder="p. ej. quedarse con papá 10 minutos mientras mamá sale">' + esc(m ? m.titulo : "") + '</textarea></div>' +
      '<div class="grid2">' +
        '<div class="field"><label for="mTiempo">Tiempo</label><input type="text" id="mTiempo" placeholder="5 min" value="' + esc(m ? m.tiempo : "") + '"></div>' +
        '<div class="field"><label for="mLugar">Lugar</label><input type="text" id="mLugar" placeholder="en casa, en el cole…" value="' + esc(m ? m.lugar : "") + '"></div>' +
        '<div class="field"><label for="mConQuien">¿Con quién se queda?</label><input type="text" id="mConQuien" placeholder="con papá, la abuela, sola un ratito…" value="' + esc(m ? m.conQuien : "") + '"></div>' +
        '<div class="field"><label for="mPremio">Premio si lo logra</label><input type="text" id="mPremio" placeholder="una pegatina, elegir el cuento…" value="' + esc(m ? m.premio : "") + '"></div>' +
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
    editor.scrollIntoView({ behavior: "smooth", block: "center" });
    $("#mTitulo").focus();
  }
  function closeEditor() { editor.hidden = true; editor.innerHTML = ""; editingId = null; }

  function saveMision() {
    var titulo = ($("#mTitulo").value || "").trim();
    if (!titulo) { $("#mTitulo").focus(); return; }
    var existing = editingId ? getMisiones().filter(function (x) { return x.id === editingId; })[0] : null;
    var rec = {
      id: editingId || ("mis_" + Date.now()), kind: "mision",
      ts: existing ? existing.ts : Date.now(),
      dificultad: Number($("#mDif").value),
      titulo: titulo,
      tiempo: ($("#mTiempo").value || "").trim(),
      lugar: ($("#mLugar").value || "").trim(),
      conQuien: ($("#mConQuien").value || "").trim(),
      premio: ($("#mPremio").value || "").trim()
    };
    if (window.Aprens) Aprens.save(rec);
    closeEditor(); renderLadder();
  }

  /* ============================================================
     HACER UNA MISIÓN · LAS DOS LLAVES
     ============================================================ */
  var runSection = $("#run"), runBody = $("#runBody");
  var runState = null;

  function caritasHTML(group) {
    return '<div class="caritas" id="' + group + '" role="group" aria-label="Cómo está">' +
      CARITAS.map(function (c, i) { return '<button class="carita" data-v="' + (i + 1) + '" aria-pressed="false" aria-label="' + (i + 1) + ' de 5">' + c + '</button>'; }).join("") +
      '</div>';
  }

  function startRonda(id) {
    var m = getMisiones().filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    runState = { misionId: id, apoyos: [], antes: null, despues: null, logrado: null, pidio_abrazo: null, sin_negociar: null };
    runBody.innerHTML =
      '<div class="sec-head"><span class="num">Misión</span>' +
        '<h2>Ábrela con vuestras dos llaves</h2>' +
        '<p>Primero el QUÉ (qué toca hoy y las normas). Durante la separación, el CÓMO (cómo la acompañáis). Al terminar, registrad cómo fue y dad el premio si lo logró.</p></div>' +

      '<div class="run-target"><div class="t">' + esc(m.titulo) + '</div>' +
        '<div class="v">' + chip("⏱", m.tiempo) + chip("📍", m.lugar) + chip("👥", m.conQuien) + chip("🎁", m.premio) + '</div></div>' +

      /* ---- LLAVE QUÉ ---- */
      '<div class="keypanel kp-que">' +
        '<div class="kp-head"><span class="k">🗺️</span><h3>El QUÉ</h3></div>' +
        '<p class="kp-sub">La misión de hoy</p>' +
        '<div class="grid2">' +
          '<div class="field"><label for="hTiempo">Tiempo de hoy</label><input type="text" id="hTiempo" value="' + esc(m.tiempo) + '"></div>' +
          '<div class="field"><label for="hConQuien">Con quién se queda hoy</label><input type="text" id="hConQuien" value="' + esc(m.conQuien) + '"></div>' +
        '</div>' +
        '<div class="field"><label>Las 3 normas de la misión</label>' +
          '<ul class="normas">' + NORMAS.map(function (n, i) { return '<li><span class="nn">' + (i + 1) + '</span>' + esc(n) + '</li>'; }).join("") + '</ul></div>' +
        '<div class="grid2">' +
          '<div class="field"><label for="hConsecuencia">Consecuencia acordada (proporcional)</label><input type="text" id="hConsecuencia" placeholder="p. ej. pausa del juego 2 min"></div>' +
          '<div class="field"><label for="hPremio">Premio de hoy</label><input type="text" id="hPremio" value="' + esc(m.premio) + '"></div>' +
        '</div>' +
        '<div class="field"><label>¿Cómo está ANTES de empezar?</label>' + caritasHTML("antes") + '</div>' +
        '<p class="kp-hint" style="margin-top:16px"><b>Despedida corta:</b> un abrazo y «vuelvo pronto», sin alargar ni negociar. Mantened el plan con cariño.</p>' +
      '</div>' +

      /* ---- LLAVE CÓMO ---- */
      '<div class="keypanel kp-como">' +
        '<div class="kp-head"><span class="k">🤍</span><h3>El CÓMO</h3></div>' +
        '<p class="kp-sub">Cómo nos acompañamos · AIS</p>' +
        '<p class="kp-hint">Marcad lo que uséis. Tocad <b>Practicar ↗</b> para entrenar cada apoyo (el adulto es el modelo: si os calmáis vosotras, se calma ella).</p>' +
        '<div class="apoyos">' +
          APOYOS.map(function (a) {
            return '<label class="apoyo" data-ap="' + a.id + '"><input type="checkbox"><span class="ico">' + a.ico + '</span>' +
              '<span class="txt"><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span></span>' +
              (a.tool ? '<a class="apoyo-practicar" href="/#/tool/' + a.tool + '" target="_blank" rel="noopener">Practicar ↗</a>' : '') + '</label>';
          }).join("") +
        '</div>' +

        '<div class="field"><label>¿Cómo está DESPUÉS?</label>' + caritasHTML("despues") + '</div>' +

        '<div class="field"><label>¿Lo logró?</label>' +
          '<div class="pillset" id="logrado">' +
            '<button class="pill" data-v="si" aria-pressed="false">Sí, del todo</button>' +
            '<button class="pill" data-v="medias" aria-pressed="false">A medias</button>' +
            '<button class="pill warn" data-v="aun" aria-pressed="false">Todavía no</button>' +
          '</div></div>' +
        '<div class="field"><label>¿Pidió abrazo en vez de repetir?</label>' +
          '<div class="pillset" id="pidio">' +
            '<button class="pill" data-v="si" aria-pressed="false">Sí</button>' +
            '<button class="pill" data-v="no" aria-pressed="false">No aún</button>' +
          '</div></div>' +
        '<div class="field"><label>¿Mantuvisteis el plan sin negociar?</label>' +
          '<div class="pillset" id="negociar">' +
            '<button class="pill" data-v="si" aria-pressed="false">Sí</button>' +
            '<button class="pill warn" data-v="cedimos" aria-pressed="false">Cedimos un poco</button>' +
          '</div></div>' +
        '<div class="field"><label for="hNota">¿Algo que contar? (opcional)</label>' +
          '<textarea id="hNota" rows="2" placeholder="lloró al principio y luego jugó tranquila…"></textarea></div>' +
      '</div>' +

      '<div class="run-acts">' +
        '<button class="btn btn-como" id="runSave">Guardar misión</button>' +
        '<button class="btn btn-primary" id="runSaveWA">Guardar y enviar por WhatsApp</button>' +
        '<button class="run-close" id="runCancel">Cerrar sin guardar</button>' +
      '</div>' +
      '<p class="run-note" id="runNote"></p>';

    // apoyos
    $$(".apoyo", runBody).forEach(function (l) {
      var cb = $("input", l), id2 = l.getAttribute("data-ap");
      cb.addEventListener("change", function () {
        l.classList.toggle("on", cb.checked);
        var i = runState.apoyos.indexOf(id2);
        if (cb.checked) { if (i < 0) runState.apoyos.push(id2); } else if (i >= 0) runState.apoyos.splice(i, 1);
      });
      var link = $(".apoyo-practicar", l);
      if (link) link.addEventListener("click", function (e) { e.stopPropagation(); });
    });
    // caritas + pills (selección única por grupo)
    bindSingle("antes", ".carita", function (v) { runState.antes = v ? Number(v) : null; });
    bindSingle("despues", ".carita", function (v) { runState.despues = v ? Number(v) : null; });
    bindSingle("logrado", ".pill", function (v) { runState.logrado = v; });
    bindSingle("pidio", ".pill", function (v) { runState.pidio_abrazo = v; });
    bindSingle("negociar", ".pill", function (v) { runState.sin_negociar = v; });

    $("#runSave").addEventListener("click", function () { saveRonda(false); });
    $("#runSaveWA").addEventListener("click", function () { saveRonda(true); });
    $("#runCancel").addEventListener("click", closeRonda);

    runSection.hidden = false;
    runSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
    var m = getMisiones().filter(function (x) { return x.id === runState.misionId; })[0] || {};
    return {
      id: "ron_" + Date.now(), kind: "ronda", date: ymd(), ts: Date.now(),
      misionId: runState.misionId, misionTitulo: m.titulo || "", nivel: m.dificultad,
      tiempo_hoy: ($("#hTiempo").value || "").trim(), conQuien_hoy: ($("#hConQuien").value || "").trim(),
      consecuencia: ($("#hConsecuencia").value || "").trim(), premio: ($("#hPremio").value || "").trim(),
      antes: runState.antes, despues: runState.despues,
      apoyos: runState.apoyos.slice(),
      logrado: runState.logrado, pidio_abrazo: runState.pidio_abrazo, sin_negociar: runState.sin_negociar,
      nota: ($("#hNota").value || "").trim()
    };
  }

  function resumenRonda(r) {
    var L = ["La exploradora valiente · misión — APRENS", "Fecha: " + r.date];
    L.push("Misión: " + (r.misionTitulo || "—") + (r.nivel != null ? " (" + r.nivel + "★)" : ""));
    if (r.tiempo_hoy || r.conQuien_hoy) L.push("Hoy: " + [r.tiempo_hoy, r.conQuien_hoy].filter(Boolean).join(" · "));
    if (r.antes != null || r.despues != null) L.push("Cómo estaba: " + (r.antes ? CARITAS[r.antes - 1] : "—") + " → " + (r.despues ? CARITAS[r.despues - 1] : "—"));
    if (r.logrado) L.push("¿Lo logró?: " + (LOGRADO_TXT[r.logrado] || r.logrado));
    if (r.pidio_abrazo) L.push("¿Pidió abrazo en vez de repetir?: " + (r.pidio_abrazo === "si" ? "sí" : "no aún"));
    if (r.sin_negociar) L.push("Plan: " + (NEG_TXT[r.sin_negociar] || r.sin_negociar));
    if (r.apoyos && r.apoyos.length) {
      var names = r.apoyos.map(function (a) { var x = APOYOS.filter(function (y) { return y.id === a; })[0]; return x ? x.t : a; });
      L.push("Nos acompañamos con: " + names.join(", "));
    }
    if (r.premio) L.push("Premio: " + r.premio);
    if (r.nota) L.push("Nota: " + r.nota);
    L.push("", "(Enviado desde La exploradora valiente · adjunta también el .json para el panel)");
    return L.join("\n");
  }

  function saveRonda(share) {
    if (!runState) return;
    var cod = ($("#codigo").value || "").trim();
    if (cod && window.Aprens) Aprens.setPacienteCodigo(cod);
    var r = buildRonda();
    if (window.Aprens) Aprens.save(r, { append: true });
    var note = $("#runNote");
    if (share) {
      try { window.open("https://wa.me/?text=" + encodeURIComponent(resumenRonda(r)), "_blank"); } catch (e) {}
      if (note) note.textContent = "Guardada en este dispositivo. Se ha abierto WhatsApp para enviarla.";
    } else if (note) { note.textContent = "Misión guardada en este dispositivo."; }
    renderLadder();
    if (r.logrado && r.logrado !== "aun" && note) {
      note.textContent += " ¡Fue valiente! No olvidéis el premio y celebrarlo.";
    }
  }

  /* ============================================================
     PROGRESO + REVELADO
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

  $("#btnAddMision").addEventListener("click", function () { openEditor(null); });
  $("#btnResetMisiones").addEventListener("click", function () {
    if (confirm("¿Restaurar las misiones de ejemplo? Reemplaza las actuales (las rondas registradas se conservan).")) resetMisiones();
  });

  var codeInput = $("#codigo");
  if (window.Aprens) {
    var saved = Aprens.getPacienteCodigo();
    if (saved) codeInput.value = saved;
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }

  seedIfEmpty();
  renderLadder();
  if (window.Aprens && Aprens.mountBar) Aprens.mountBar();
})();
