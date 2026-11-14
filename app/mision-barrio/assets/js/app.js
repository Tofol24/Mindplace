/* ============================================================================
   Misión Barrio · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Juego de exposición gradual para volver a salir con los amigos (miedo a salir
   solo por la calle, 9–12 años). Mapa de NIVELES desbloqueables (editables por
   la familia), una misión por salida con predicción ("lo que dice la alarma")
   y comprobación al volver (aprendizaje por violación de expectativas),
   superpoderes (balón, radar, comentarista, detective), XP, rangos, CROMOS y una
   TIENDA de premios pactados (refuerzo positivo). Los XP nunca se restan por
   conducta: solo se gastan al canjear. Se guarda en el núcleo APRENS (aprens_db).
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOOL = "mision_barrio";
  var SEED_FLAG = "mision_barrio_seeded_v1";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "Misión Barrio", toolVersion: 1 });

  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var _uidc = 0;
  function uid(pre) { _uidc++; return pre + Date.now() + "_" + _uidc; }

  /* ---------- almacenamiento ---------- */
  function allRecords() { return window.Aprens ? Aprens.history() : []; }
  function byKind(k) { return allRecords().filter(function (r) { return r.kind === k; }); }
  function getNiveles() { return byKind("nivel").sort(function (a, b) { return (a.dificultad - b.dificultad) || ((a.ts || 0) - (b.ts || 0)); }); }
  function getSalidas() { return byKind("salida").sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }); }
  function getPremios() { return byKind("premio").sort(function (a, b) { return (a.coste - b.coste) || ((a.ts || 0) - (b.ts || 0)); }); }
  function getCanjes() { return byKind("canje").sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }); }
  function getPerfil() { return byKind("perfil")[0] || { id: "perfil", kind: "perfil", avatar: "🦊", apodo: "" }; }
  function salidasDe(id) { return getSalidas().filter(function (s) { return s.nivelId === id; }); }
  function victoriasDe(id) { return salidasDe(id).filter(function (s) { return s.final === "si"; }).length; }

  function saveRec(rec) { if (window.Aprens) Aprens.save(rec, { append: rec.kind === "salida" || rec.kind === "canje" }); return rec; }
  function removeRecord(id) {
    try {
      var raw = localStorage.getItem("aprens_db"); if (!raw) return;
      var d = JSON.parse(raw); var b = d.tools && d.tools[TOOL]; if (!b) return;
      b.records = b.records.filter(function (r) { return r.id !== id; });
      d.actualizado = new Date().toISOString();
      localStorage.setItem("aprens_db", JSON.stringify(d));
    } catch (e) {}
  }

  /* ---------- niveles y premios de ejemplo (editables) ---------- */
  var SEED_NIVELES = [
    { dificultad: 1, titulo: "Bajar a comprar el pan mientras mamá o papá espera en el portal", tiempo: "10 min", cuando: "de día", donde: "la panadería", conQuien: "yo solo", adulto: "en el portal", xp: 20 },
    { dificultad: 2, titulo: "Ir solo a la tienda de la esquina y volver", tiempo: "15 min", cuando: "de día", donde: "la tienda de la esquina", conQuien: "yo solo", adulto: "en casa", xp: 25 },
    { dificultad: 3, titulo: "Quedar con un amigo en el parque, con un adulto en un banco lejos", tiempo: "30 min", cuando: "de día", donde: "el parque", conQuien: "con un amigo", adulto: "en un banco, lejos", xp: 30 },
    { dificultad: 4, titulo: "Quedar con amigos en el parque: me acompañan, se van y vuelven a buscarme", tiempo: "45 min", cuando: "de día", donde: "el parque", conQuien: "con mis amigos", adulto: "en casa", xp: 40 },
    { dificultad: 5, titulo: "Ir y volver yo solo al parque y quedarme con mis amigos", tiempo: "1 h", cuando: "de día", donde: "el parque", conQuien: "con mis amigos", adulto: "en casa", xp: 50 },
    { dificultad: 6, titulo: "Salir con mis amigos por el barrio", tiempo: "1 h", cuando: "por la tarde", donde: "el barrio", conQuien: "con mis amigos", adulto: "en casa", xp: 60 },
    { dificultad: 7, titulo: "Salir con mis amigos y volver cuando empieza a oscurecer", tiempo: "1 h 30", cuando: "al anochecer", donde: "el barrio", conQuien: "con mis amigos", adulto: "en casa", xp: 70 },
    { dificultad: 8, titulo: "Salir con la banda y volver ya de noche, a la hora pactada", tiempo: "1 h 30", cuando: "de noche", donde: "el barrio", conQuien: "con mis amigos", adulto: "en casa", xp: 100, jefe: true }
  ];
  var SEED_PREMIOS = [
    { emoji: "🍕", nombre: "Elegir la cena del viernes", coste: 30 },
    { emoji: "🎬", nombre: "Peli y palomitas: eliges tú", coste: 60 },
    { emoji: "⚽", nombre: "Plan especial con papá o mamá (partido, bici…)", coste: 100 },
    { emoji: "🏆", nombre: "Gran premio que pactemos juntos", coste: 200 }
  ];
  function crearNivel(n, i) {
    return saveRec({ id: uid("niv_"), kind: "nivel", ts: Date.now() + (i || 0), dificultad: n.dificultad, titulo: n.titulo,
      tiempo: n.tiempo || "", cuando: n.cuando || "", donde: n.donde || "", conQuien: n.conQuien || "", adulto: n.adulto || "",
      xp: Number(n.xp) || 20, jefe: !!n.jefe });
  }
  function crearPremio(p, i) { return saveRec({ id: uid("pre_"), kind: "premio", ts: Date.now() + (i || 0), emoji: p.emoji || "🎁", nombre: p.nombre, coste: Number(p.coste) || 10 }); }
  function seedIfEmpty() {
    var seeded = false; try { seeded = localStorage.getItem(SEED_FLAG) === "1"; } catch (e) {}
    if (!seeded && getNiveles().length === 0) {
      SEED_NIVELES.forEach(crearNivel);
      if (!getPremios().length) SEED_PREMIOS.forEach(crearPremio);
      try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    }
  }
  function resetNiveles() {
    getNiveles().forEach(function (n) { removeRecord(n.id); });
    SEED_NIVELES.forEach(crearNivel);
    closeEditor(); renderAll();
  }

  /* ---------- contenidos ---------- */
  var AVATARES = ["🦊", "🐺", "🦁", "🐯", "🐉", "🦅", "🤖", "🧑‍🚀", "🥷", "⚽", "🛹", "🚲"];
  var RANGOS = [
    { min: 0, t: "Novato del barrio" }, { min: 50, t: "Aventurero" }, { min: 150, t: "Explorador urbano" },
    { min: 300, t: "Capitán del barrio" }, { min: 500, t: "Leyenda del barrio" }
  ];
  var FRASES = [
    "Me cuesta, y lo estoy haciendo.",
    "Mi alarma suena fuerte, pero el mando lo llevo yo.",
    "No tengo que estar tranquilo para ser valiente.",
    "Equivocarse también es entrenar.",
    "Nivel a nivel, como en los videojuegos."
  ];
  var PODERES = [
    { id: "balon", ico: "🎈", t: "El balón", d: "Hincho la barriga despacio y la deshincho más despacio todavía." },
    { id: "radar", ico: "📡", t: "El radar del cuerpo", d: "Encuentro dónde suena la alarma y le hago compañía." },
    { id: "comentarista", ico: "🎙️", t: "El comentarista", d: "Cambio «yo no puedo» por una frase de campeón." },
    { id: "detective", ico: "🕵️", t: "El detective", d: "Me pregunto: ¿qué es lo más probable que pase?" }
  ];
  var ALARMAS = ["Que me pase algo malo", "Que alguien me haga daño", "Que me pierda", "Que me agobie y no pueda", "Que se rían de mí", "Que mis amigos no quieran estar conmigo"];
  var ZONAS = ["Barriga", "Pecho", "Garganta", "Cara caliente", "Piernas", "Manos", "Cabeza"];
  var CROMOS = [
    { id: "primer", e: "🚪", t: "Primer paso", d: "Tu primera misión", ok: function (s) { return s.length >= 1; } },
    { id: "final", e: "🏁", t: "Hasta el final", d: "Te quedas hasta el final", ok: function (s) { return s.some(function (x) { return x.final === "si"; }); } },
    { id: "balon", e: "🎈", t: "Pulmones de acero", d: "Usas el balón en 3 misiones", ok: function (s) { return cuentaPoder(s, "balon") >= 3; } },
    { id: "radar", e: "📡", t: "Radar activado", d: "Encuentras la alarma en tu cuerpo", ok: function (s) { return s.some(function (x) { return x.zonas && x.zonas.length; }); } },
    { id: "comenta", e: "🎙️", t: "Voz de campeón", d: "Usas el comentarista en 3 misiones", ok: function (s) { return cuentaPoder(s, "comentarista") >= 3; } },
    { id: "falsa", e: "🕵️", t: "Cazador de falsas alarmas", d: "La alarma se equivoca 3 veces", ok: function (s) { return s.filter(function (x) { return x.realidad === "no"; }).length >= 3; } },
    { id: "valiente", e: "💪", t: "Valiente con miedo", d: "Sales con la alarma en 7 o más", ok: function (s) { return s.some(function (x) { return x.antes != null && x.antes >= 7 && x.final === "si"; }); } },
    { id: "cinco", e: "🔥", t: "Racha de 5", d: "5 misiones completadas", ok: function (s) { return s.filter(function (x) { return x.final === "si"; }).length >= 5; } },
    { id: "rey", e: "👑", t: "Rey del nivel", d: "Dominas un nivel (3 victorias)", ok: function () { return getNiveles().some(function (n) { return victoriasDe(n.id) >= 3; }); } },
    { id: "noche", e: "🌙", t: "Explorador nocturno", d: "Superas una misión al anochecer o de noche", ok: function (s) { return s.some(function (x) { return x.final === "si" && /noche|anochec|oscur/i.test(x.cuando || ""); }); } },
    { id: "diez", e: "⭐", t: "Diez misiones", d: "10 misiones completadas", ok: function (s) { return s.filter(function (x) { return x.final === "si"; }).length >= 10; } },
    { id: "jefe", e: "🐉", t: "Jefe final", d: "Superas el último nivel", ok: function () { var ns = getNiveles(); var j = ns.filter(function (n) { return n.jefe; })[0] || ns[ns.length - 1]; return !!j && victoriasDe(j.id) >= 1; } }
  ];
  function cuentaPoder(s, id) { return s.filter(function (x) { return x.poderes && x.poderes.indexOf(id) >= 0; }).length; }
  function cromosConseguidos() { var s = getSalidas(); return CROMOS.filter(function (c) { return c.ok(s); }).map(function (c) { return c.id; }); }

  /* ---------- XP ---------- */
  function xpGanado() { return getSalidas().reduce(function (t, s) { return t + (Number(s.xp) || 0); }, 0); }
  function xpGastado() { return getCanjes().reduce(function (t, c) { return t + (Number(c.coste) || 0); }, 0); }
  function rangoDe(xp) { var r = RANGOS[0], sig = null; RANGOS.forEach(function (x, i) { if (xp >= x.min) { r = x; sig = RANGOS[i + 1] || null; } }); return { r: r, sig: sig }; }

  /* ---------- confeti ---------- */
  function confeti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cols = ["#B8F04A", "#FFCB45", "#5ADBF8", "#FF9A3D", "#FFFFFF"];
    for (var i = 0; i < 34; i++) {
      var c = document.createElement("div"); c.className = "confeti";
      c.style.left = (i * 3) + "vw"; c.style.background = cols[i % cols.length];
      c.style.animation = "cae " + (1.4 + (i % 5) * 0.3) + "s ease-in " + ((i % 7) * 0.07) + "s forwards";
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3800); })(c);
    }
  }

  /* ============================================================
     JUGADOR
     ============================================================ */
  var playerBox = $("#playerBox");
  function renderPlayer() {
    var p = getPerfil(), xp = xpGanado(), rg = rangoDe(xp), disp = xp - xpGastado();
    var pct = rg.sig ? Math.round((xp - rg.r.min) / (rg.sig.min - rg.r.min) * 100) : 100;
    var completadas = getSalidas().filter(function (s) { return s.final === "si"; }).length;
    playerBox.innerHTML =
      '<div class="player-top"><div class="player-av" aria-hidden="true">' + esc(p.avatar) + '</div>' +
        '<div><div class="player-rank">' + esc(rg.r.t) + '</div>' +
        '<div class="player-name">' + esc(p.apodo || "Jugador misterioso") + '</div>' +
        '<div class="player-stats">' + xp + ' XP ganados · ' + disp + ' para gastar · ' + completadas + ' misiones · ' + cromosConseguidos().length + '/' + CROMOS.length + ' cromos</div></div></div>' +
      '<div class="xpbar" role="progressbar" aria-label="Progreso hacia el siguiente rango" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="xpcap"><span>' + esc(rg.r.t) + '</span><span>' + (rg.sig ? "Faltan " + (rg.sig.min - xp) + " XP para " + esc(rg.sig.t) : "¡Rango máximo!") + '</span></div>' +
      '<label for="apodo">Tu nombre de jugador</label>' +
      '<input type="text" id="apodo" maxlength="20" placeholder="Rayo, El Capi, Lobo…" value="' + esc(p.apodo) + '">' +
      '<div class="avatares" role="group" aria-label="Elige tu personaje">' +
        AVATARES.map(function (a) { return '<button type="button" class="av" data-a="' + a + '" aria-pressed="' + (a === p.avatar) + '" aria-label="Personaje ' + a + '">' + a + '</button>'; }).join("") +
      '</div>';
    $$(".av", playerBox).forEach(function (b) {
      b.addEventListener("click", function () { var pf = getPerfil(); pf.avatar = b.getAttribute("data-a"); saveRec(pf); renderPlayer(); });
    });
    $("#apodo").addEventListener("change", function () { var pf = getPerfil(); pf.apodo = (this.value || "").trim().slice(0, 20); saveRec(pf); renderPlayer(); });
  }

  /* ============================================================
     SUPERPODERES · balón y frases
     ============================================================ */
  $("#frasesList").innerHTML = FRASES.map(function (f) { return "<li>«" + esc(f) + "»</li>"; }).join("");
  var balonTimer = null;
  $("#balonBtn").addEventListener("click", function () {
    var b = $("#balon"), t = $("#balonTxt"), btn = this;
    if (balonTimer) { clearTimeout(balonTimer); balonTimer = null; b.className = "balon"; t.textContent = "Pulsa para entrenar"; btn.textContent = "Entrenar el balón"; return; }
    btn.textContent = "Parar";
    var ciclo = 0;
    function inhala() {
      if (ciclo >= 3) { b.className = "balon"; t.textContent = "¡Tres balones! Superpoder cargado 💪"; btn.textContent = "Otra vez"; balonTimer = null; return; }
      ciclo++; b.className = "balon in"; t.textContent = "Coge aire por la nariz… se hincha (" + ciclo + "/3)";
      balonTimer = setTimeout(exhala, 4000);
    }
    function exhala() { b.className = "balon out"; t.textContent = "Suéltalo despacito por la boca…"; balonTimer = setTimeout(inhala, 6000); }
    inhala();
  });

  /* ============================================================
     MAPA DE NIVELES
     ============================================================ */
  var nivelesBox = $("#niveles"), editor = $("#nivelEditor");
  function chip(label, val) { return val ? '<span class="chip">' + label + ' <b>' + esc(val) + '</b></span>' : ""; }
  function estadoNiveles() {
    var ns = getNiveles(), prevOk = true;
    return ns.map(function (n, i) {
      var v = victoriasDe(n.id), est = v >= 3 ? "dominado" : v >= 1 ? "hecho" : prevOk ? "disp" : "bloq";
      prevOk = v >= 1;
      return { n: n, i: i, v: v, est: est, intentos: salidasDe(n.id).length };
    });
  }
  function renderNiveles() {
    var lista = estadoNiveles();
    if (!lista.length) { nivelesBox.innerHTML = '<p class="lead">No hay niveles. Añade el primero o restaura el ejemplo.</p>'; return; }
    nivelesBox.innerHTML = lista.map(function (x) {
      var n = x.n, num = x.i + 1;
      var nodo = x.est === "dominado" ? "👑" : x.est === "hecho" ? "✓" : x.est === "bloq" ? "🔒" : (n.jefe ? "🐉" : num);
      var etiqueta = n.jefe ? "Jefe final" : "Nivel " + num;
      var estTxt = { dominado: "¡Dominado!", hecho: "Superado", disp: "¡Te toca!", bloq: "Bloqueado" }[x.est];
      var stars = "";
      for (var k = 0; k < 3; k++) stars += k < x.v ? "★" : "☆";
      return '<div class="nivel ' + x.est + (n.jefe ? " jefe" : "") + '" data-id="' + n.id + '">' +
        '<div class="nodo" aria-hidden="true">' + nodo + '</div>' +
        '<div class="ncard">' +
          '<div class="n-top"><span class="n-label">' + etiqueta + ' · ' + estTxt + '</span><span class="n-xp">+' + (Number(n.xp) || 0) + ' XP</span></div>' +
          '<div class="n-title">' + esc(n.titulo) + '</div>' +
          '<div class="chips">' + chip("⏱", n.tiempo) + chip("🌗", n.cuando) + chip("📍", n.donde) + chip("👥", n.conQuien) + chip("🏠 Adulto:", n.adulto) + '</div>' +
          '<div class="vics"><span class="st" aria-hidden="true">' + stars + '</span> ' + x.v + ' de 3 victorias' + (x.intentos > x.v ? ' · ' + (x.intentos - x.v) + ' intento' + (x.intentos - x.v === 1 ? '' : 's') : '') + '</div>' +
          '<div class="n-acts">' +
            '<button type="button" class="mini mini-go" data-act="go"' + (x.est === "bloq" ? ' disabled title="Supera antes el nivel anterior"' : '') + '>▶ Jugar misión</button>' +
            '<button type="button" class="mini" data-act="edit">Editar</button>' +
            '<button type="button" class="mini mini-del" data-act="del">Borrar</button>' +
          '</div>' +
        '</div></div>';
    }).join("");
    $$(".nivel", nivelesBox).forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          if (act === "go") startMision(id);
          else if (act === "edit") openEditor(id);
          else if (act === "del" && confirm("¿Borrar este nivel? Las misiones ya jugadas se conservan.")) { removeRecord(id); closeEditor(); renderAll(); }
        });
      });
    });
  }

  /* ---------- editor de nivel ---------- */
  var editingId = null;
  function openEditor(id) {
    editingId = id || null;
    var n = id ? getNiveles().filter(function (x) { return x.id === id; })[0] : null;
    var dif = n ? Number(n.dificultad) || 3 : 3;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (n ? "Editar nivel" : "Nuevo nivel") + '</h3>' +
      '<p class="hint">Que sea concreto y un poco difícil, pero posible. La dificultad ordena el mapa.</p>' +
      '<div class="field"><label for="nTitulo">La misión</label><textarea id="nTitulo" rows="2" placeholder="p. ej. ir solo al parque y quedarme con mis amigos">' + esc(n ? n.titulo : "") + '</textarea></div>' +
      '<div class="grid2">' +
        '<div class="field"><label for="nTiempo">Tiempo</label><input type="text" id="nTiempo" placeholder="45 min" value="' + esc(n ? n.tiempo : "") + '"></div>' +
        '<div class="field"><label for="nCuando">Cuándo</label><input type="text" id="nCuando" placeholder="de día, por la tarde, de noche…" value="' + esc(n ? n.cuando : "") + '"></div>' +
        '<div class="field"><label for="nDonde">Dónde</label><input type="text" id="nDonde" placeholder="el parque, el barrio…" value="' + esc(n ? n.donde : "") + '"></div>' +
        '<div class="field"><label for="nConQuien">Con quién</label><input type="text" id="nConQuien" placeholder="con mis amigos" value="' + esc(n ? n.conQuien : "") + '"></div>' +
        '<div class="field"><label for="nAdulto">¿Dónde está el adulto?</label><input type="text" id="nAdulto" placeholder="en el portal, en casa…" value="' + esc(n ? n.adulto : "") + '"></div>' +
        '<div class="field"><label for="nXp">XP que da</label><input type="number" id="nXp" min="5" max="200" step="5" value="' + (n ? Number(n.xp) || 20 : 30) + '"></div>' +
      '</div>' +
      '<div class="field"><label for="nDif">Dificultad: <span id="nDifN">' + dif + '</span> de 10</label>' +
        '<input type="range" min="1" max="10" value="' + dif + '" id="nDif"><div class="ends"><span>Fácil</span><span>Muy difícil</span></div></div>' +
      '<div class="field"><label class="check"><input type="checkbox" id="nJefe"' + (n && n.jefe ? " checked" : "") + '> Es el jefe final 🐉</label></div>' +
      '<div class="editor-acts"><button type="button" class="btn" id="nSave">' + (n ? "Guardar cambios" : "Añadir al mapa") + '</button>' +
        '<button type="button" class="btn btn-link" id="nCancel">Cancelar</button></div>';
    var dr = $("#nDif"); dr.addEventListener("input", function () { $("#nDifN").textContent = dr.value; });
    $("#nSave").addEventListener("click", saveNivel);
    $("#nCancel").addEventListener("click", closeEditor);
    editor.scrollIntoView({ behavior: "smooth", block: "center" }); $("#nTitulo").focus();
  }
  function closeEditor() { editor.hidden = true; editor.innerHTML = ""; editingId = null; }
  function saveNivel() {
    var titulo = ($("#nTitulo").value || "").trim(); if (!titulo) { $("#nTitulo").focus(); return; }
    var ex = editingId ? getNiveles().filter(function (x) { return x.id === editingId; })[0] : null;
    var jefe = $("#nJefe").checked;
    if (jefe) getNiveles().forEach(function (o) { if (o.jefe && o.id !== editingId) { o.jefe = false; saveRec(o); } });
    saveRec({ id: editingId || uid("niv_"), kind: "nivel", ts: ex ? ex.ts : Date.now(), dificultad: Number($("#nDif").value), titulo: titulo,
      tiempo: $("#nTiempo").value.trim(), cuando: $("#nCuando").value.trim(), donde: $("#nDonde").value.trim(),
      conQuien: $("#nConQuien").value.trim(), adulto: $("#nAdulto").value.trim(),
      xp: Math.max(5, Math.min(200, Number($("#nXp").value) || 20)), jefe: jefe });
    closeEditor(); renderAll();
  }

  /* ============================================================
     JUGAR UNA MISIÓN
     ============================================================ */
  var runSection = $("#run"), runBody = $("#runBody"), runState = null;

  function termoHTML(id) {
    var cols = ["#7CE38B", "#9BE47A", "#B8E46A", "#D3E35C", "#E9DD52", "#FFD34D", "#FFBE4A", "#FFA548", "#FF8E4F", "#FF7558", "#FF6262"];
    var h = '<div class="termo" id="' + id + '" role="group" aria-label="Alarma del miedo de 0 a 10">';
    for (var i = 0; i <= 10; i++) h += '<button type="button" class="tb" data-v="' + i + '" aria-pressed="false" style="background:' + cols[i] + '">' + i + '</button>';
    return h + '</div><div class="termo-cap"><span>0 · tranquilo</span><span>5</span><span>10 · alarma a tope</span></div>';
  }
  function pillsHTML(id, opts, multi) {
    return '<div class="pillset" id="' + id + '" role="group"' + (multi ? ' data-multi="1"' : '') + '>' +
      opts.map(function (o) { return '<button type="button" class="pill' + (o.warn ? " warn" : "") + '" data-v="' + esc(o.v) + '" aria-pressed="false">' + esc(o.t) + '</button>'; }).join("") + '</div>';
  }

  function startMision(id) {
    var n = getNiveles().filter(function (x) { return x.id === id; })[0]; if (!n) return;
    runState = { nivelId: id, antes: null, despues: null, alarmas: [], zonas: [], poderes: [], final: null, realidad: null, frase: null, plan: null, premio_dado: null };
    runBody.innerHTML =
      '<div class="sec-head"><span class="num">Misión en marcha</span><h2>' + (n.jefe ? "¡Jefe final!" : "¡A por el nivel!") + '</h2>' +
        '<p>Rellena la parte 1 antes de salir. La parte 2, durante. La parte 3, al volver.</p></div>' +
      '<div class="run-target"><div class="t">' + esc(n.titulo) + '</div><div class="chips">' +
        chip("⏱", n.tiempo) + chip("🌗", n.cuando) + chip("📍", n.donde) + chip("👥", n.conQuien) + chip("🏠 Adulto:", n.adulto) + chip("⭐", "+" + n.xp + " XP") + '</div></div>' +

      '<div class="fase"><div class="fase-h"><span class="fase-n">1</span><h3>Antes de salir</h3></div>' +
        '<p class="fase-sub">Mira tu alarma como un detective: sin pelearte con ella.</p>' +
        '<div class="field"><span class="lbl" id="lblAntes">¿A cuánto está tu alarma ahora?</span>' + termoHTML("antes") + '</div>' +
        '<div class="field"><span class="lbl">¿Qué dice la alarma que va a pasar?</span>' + pillsHTML("alarmas", ALARMAS.map(function (a) { return { v: a, t: a }; }), true) + '</div>' +
        '<div class="field"><label for="alarmaOtra">Otra cosa que dice (opcional)</label><input type="text" id="alarmaOtra" placeholder="que…"></div>' +
        '<div class="field"><span class="lbl">📡 ¿Dónde la notas en el cuerpo?</span>' + pillsHTML("zonas", ZONAS.map(function (z) { return { v: z, t: z }; }), true) + '</div>' +
      '</div>' +

      '<div class="fase"><div class="fase-h"><span class="fase-n">2</span><h3>Durante la misión</h3></div>' +
        '<p class="fase-sub">Marca los superpoderes que uses. Cada uno suma XP extra.</p>' +
        '<div class="sp-list">' + PODERES.map(function (p) {
          return '<label class="sp" data-p="' + p.id + '"><input type="checkbox"><span class="ico" aria-hidden="true">' + p.ico + '</span><span class="txt"><b>' + esc(p.t) + '</b><span>' + esc(p.d) + '</span></span></label>';
        }).join("") + '</div>' +
        '<div class="field" style="margin-top:14px"><span class="lbl">🎙️ Mi frase de campeón de hoy</span>' + pillsHTML("frase", FRASES.map(function (f) { return { v: f, t: f }; })) + '</div>' +
      '</div>' +

      '<div class="fase"><div class="fase-h"><span class="fase-n">3</span><h3>Al volver</h3></div>' +
        '<p class="fase-sub">Ahora comprueba qué pasó de verdad.</p>' +
        '<div class="field"><span class="lbl">¿Te quedaste hasta el final?</span>' + pillsHTML("final", [{ v: "si", t: "🏁 Sí, hasta el final" }, { v: "antes", t: "Volví antes", warn: true }, { v: "no", t: "Hoy no salí", warn: true }]) + '</div>' +
        '<div class="field"><span class="lbl">🕵️ ¿Pasó lo que decía la alarma?</span>' + pillsHTML("realidad", [{ v: "no", t: "¡No! Falsa alarma" }, { v: "poco", t: "Un poquito" }, { v: "si", t: "Sí pasó", warn: true }]) + '</div>' +
        '<div class="field"><span class="lbl">¿A cuánto estaba la alarma al final?</span>' + termoHTML("despues") + '</div>' +
        '<div class="field"><label for="mejor">Lo mejor de la salida</label><textarea id="mejor" rows="2" placeholder="jugamos un partido, me reí con…"></textarea></div>' +
      '</div>' +

      '<div class="fase familia-mini"><div class="fase-h"><span class="fase-n">👪</span><h3>Para mamá o papá</h3></div>' +
        '<div class="field"><span class="lbl">¿Mantuvimos el plan sin negociar?</span>' + pillsHTML("plan", [{ v: "si", t: "Sí" }, { v: "cedimos", t: "Cedimos un poco", warn: true }]) + '</div>' +
        '<div class="field"><span class="lbl">¿Celebramos al volver?</span>' + pillsHTML("premio_dado", [{ v: "si", t: "Sí, enseguida" }, { v: "luego", t: "Más tarde" }, { v: "no", t: "Todavía no", warn: true }]) + '</div>' +
        '<div class="field"><label for="notaFam">Nota para el psicólogo (opcional)</label><textarea id="notaFam" rows="2" placeholder="le costó salir del portal, pero luego…"></textarea></div>' +
      '</div>' +

      '<div class="run-acts">' +
        '<button type="button" class="btn btn-oro" id="runSave">⭐ Terminar misión y ganar XP</button>' +
        '<button type="button" class="btn btn-wa" id="runSaveWA">Guardar y enviar por WhatsApp</button>' +
        '<button type="button" class="btn btn-link" id="runCancel">Cerrar sin guardar</button>' +
      '</div><p class="run-note" id="runNote" aria-live="polite"></p>';

    bindSingle("antes", ".tb", function (v) { runState.antes = v == null ? null : Number(v); });
    bindSingle("despues", ".tb", function (v) { runState.despues = v == null ? null : Number(v); });
    bindMulti("alarmas", runState.alarmas);
    bindMulti("zonas", runState.zonas);
    bindSingle("frase", ".pill", function (v) { runState.frase = v; });
    bindSingle("final", ".pill", function (v) { runState.final = v; });
    bindSingle("realidad", ".pill", function (v) { runState.realidad = v; });
    bindSingle("plan", ".pill", function (v) { runState.plan = v; });
    bindSingle("premio_dado", ".pill", function (v) { runState.premio_dado = v; });
    $$(".sp", runBody).forEach(function (l) {
      var cb = $("input", l), pid = l.getAttribute("data-p");
      cb.addEventListener("change", function () {
        l.classList.toggle("on", cb.checked);
        var i = runState.poderes.indexOf(pid);
        if (cb.checked) { if (i < 0) runState.poderes.push(pid); } else if (i >= 0) runState.poderes.splice(i, 1);
      });
    });
    $("#runSave").addEventListener("click", function () { saveMision(false); });
    $("#runSaveWA").addEventListener("click", function () { saveMision(true); });
    $("#runCancel").addEventListener("click", closeMision);
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
  function bindMulti(groupId, arr) {
    var g = $("#" + groupId); if (!g) return;
    $$(".pill", g).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-v"), i = arr.indexOf(v);
        if (i >= 0) { arr.splice(i, 1); b.setAttribute("aria-pressed", "false"); } else { arr.push(v); b.setAttribute("aria-pressed", "true"); }
      });
    });
  }
  function closeMision() { runSection.hidden = true; runBody.innerHTML = ""; runState = null; $("#mapa").scrollIntoView({ behavior: "smooth" }); }

  /* XP de una salida: el nivel completo solo si te quedas hasta el final;
     intentarlo suma un poco; cada superpoder +3 (máx. 12); hacer de detective +5. */
  function calcXP(n, st) {
    var d = [];
    if (st.final === "si") d.push({ t: "Nivel completado", xp: Number(n.xp) || 0 });
    else if (st.final === "antes") d.push({ t: "Por intentarlo", xp: 5 });
    var sp = Math.min(12, st.poderes.length * 3); if (sp) d.push({ t: "Superpoderes (" + st.poderes.length + ")", xp: sp });
    if (st.final && st.final !== "no" && (st.alarmas.length || st.alarmaOtra) && st.realidad) d.push({ t: "Detective de alarmas", xp: 5 });
    return d;
  }

  var FINAL_TXT = { si: "Sí, hasta el final", antes: "Volvió antes", no: "Hoy no salió" };
  var REAL_TXT = { no: "No, falsa alarma", poco: "Un poquito", si: "Sí pasó" };
  var PLAN_TXT = { si: "Sí, sin negociar", cedimos: "Cedimos un poco" };
  var PREMIO_TXT = { si: "Sí, enseguida", luego: "Más tarde", no: "Todavía no" };

  function saveMision(share) {
    if (!runState) return;
    var note = $("#runNote");
    if (!runState.final) { note.textContent = "Falta una cosa: ¿te quedaste hasta el final? (parte 3)"; $("#final").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    var n = getNiveles().filter(function (x) { return x.id === runState.nivelId; })[0] || {};
    var cod = ($("#codigo").value || "").trim(); if (cod && window.Aprens) Aprens.setPacienteCodigo(cod);
    runState.alarmaOtra = ($("#alarmaOtra").value || "").trim();
    var antesCromos = cromosConseguidos(), xpAntes = xpGanado(), rgAntes = rangoDe(xpAntes).r.t;
    var vicAntes = victoriasDe(n.id);
    var desg = calcXP(n, runState), xp = desg.reduce(function (t, d) { return t + d.xp; }, 0);
    var r = { id: uid("sal_"), kind: "salida", date: ymd(), ts: Date.now(), nivelId: n.id, nivelTitulo: n.titulo || "", dificultad: n.dificultad,
      tiempo: n.tiempo || "", cuando: n.cuando || "", jefe: !!n.jefe,
      antes: runState.antes, despues: runState.despues, alarmas: runState.alarmas.slice(), alarmaOtra: runState.alarmaOtra,
      zonas: runState.zonas.slice(), poderes: runState.poderes.slice(), frase: runState.frase,
      final: runState.final, realidad: runState.realidad, mejor: ($("#mejor").value || "").trim(),
      plan: runState.plan, premio_dado: runState.premio_dado, nota: ($("#notaFam").value || "").trim(), xp: xp, xp_desglose: desg };
    saveRec(r);
    var nuevos = cromosConseguidos().filter(function (c) { return antesCromos.indexOf(c) < 0; });
    var rgDespues = rangoDe(xpGanado()).r.t;
    if (share) { try { window.open("https://wa.me/?text=" + encodeURIComponent((window.aprensConEnlace || String)(resumen(r))), "_blank"); } catch (e) {} }
    runSection.hidden = true; runBody.innerHTML = ""; runState = null;
    renderAll();
    showReward(r, desg, nuevos, rgAntes !== rgDespues ? rgDespues : null, vicAntes, share);
  }

  function resumen(r) {
    var L = ["Misión Barrio · salida — APRENS", "Fecha: " + r.date];
    L.push("Nivel: " + (r.nivelTitulo || "—") + (r.dificultad != null ? " (dificultad " + r.dificultad + "/10)" : "") + (r.jefe ? " · jefe final" : ""));
    L.push("¿Hasta el final?: " + (FINAL_TXT[r.final] || "—"));
    if (r.antes != null || r.despues != null) L.push("Alarma: " + (r.antes != null ? r.antes : "—") + " → " + (r.despues != null ? r.despues : "—") + " (0-10)");
    var al = r.alarmas.concat(r.alarmaOtra ? [r.alarmaOtra] : []);
    if (al.length) L.push("Lo que decía la alarma: " + al.join("; "));
    if (r.realidad) L.push("¿Pasó?: " + REAL_TXT[r.realidad]);
    if (r.zonas.length) L.push("Dónde la notaba: " + r.zonas.join(", "));
    if (r.poderes.length) L.push("Superpoderes: " + r.poderes.map(function (p) { var x = PODERES.filter(function (y) { return y.id === p; })[0]; return x ? x.t : p; }).join(", "));
    if (r.frase) L.push("Frase de campeón: «" + r.frase + "»");
    if (r.mejor) L.push("Lo mejor: " + r.mejor);
    if (r.plan) L.push("Plan sin negociar: " + PLAN_TXT[r.plan]);
    if (r.premio_dado) L.push("Celebración: " + PREMIO_TXT[r.premio_dado]);
    if (r.nota) L.push("Nota de la familia: " + r.nota);
    L.push("XP: +" + r.xp + " (total " + xpGanado() + ")");
    L.push("", "(Enviado desde Misión Barrio · adjunta también el .json para el panel)");
    return L.join("\n");
  }

  /* ---------- pantalla de recompensa ---------- */
  var reward = $("#reward"), rewardBody = $("#rewardBody"), lastFocus = null;
  function cromoHTML(c, lock) {
    return '<div class="cromo' + (lock ? " lock" : "") + '"><span class="ce" aria-hidden="true">' + (lock ? "❔" : c.e) + '</span><b>' + esc(lock ? "???" : c.t) + '</b><span>' + esc(c.d) + '</span></div>';
  }
  function showReward(r, desg, nuevos, nuevoRango, vicAntes, share) {
    var titulo, msg;
    if (r.final === "si") {
      var v = vicAntes + 1;
      titulo = r.jefe ? "¡Jefe final derrotado!" : v === 1 ? "¡Nivel superado!" : v === 3 ? "¡Nivel dominado! 👑" : "¡Victoria!";
      msg = v === 1 ? "Te has quedado hasta el final. Tu alarma acaba de aprender algo nuevo." + (r.jefe ? "" : " ¡Nivel siguiente desbloqueado!") :
        v < 3 ? "Repetirlo lo hace más fácil. " + (3 - v) + " victoria" + (3 - v === 1 ? "" : "s") + " más y lo dominas." : "Este nivel ya es tuyo.";
      if (r.realidad === "no") msg += " Y has cazado una falsa alarma 🕵️.";
    } else if (r.final === "antes") {
      titulo = "¡Lo has intentado!";
      msg = "Salir ya cuenta. La próxima vez, intenta quedarte hasta el final aunque la alarma suene: así es como aprende. Si cuesta mucho, se puede repetir este nivel o bajar uno.";
    } else {
      titulo = "Hoy no ha tocado";
      msg = "Pasa. Lo importante es volver a intentarlo el próximo día de misión. Habladlo con calma y elegid el nivel juntos.";
    }
    rewardBody.innerHTML =
      '<h2 id="rewardTitle">' + esc(titulo) + '</h2>' +
      (r.xp ? '<div class="r-xp">+' + r.xp + ' XP</div><ul class="r-desg">' + desg.map(function (d) { return "<li>" + esc(d.t) + ": +" + d.xp + "</li>"; }).join("") + '</ul>' : '') +
      '<p class="r-msg">' + esc(msg) + '</p>' +
      (nuevoRango ? '<p class="r-msg"><b>⬆️ ¡Subes de rango! Ahora eres ' + esc(nuevoRango) + '.</b></p>' : '') +
      (nuevos.length ? '<p class="r-msg"><b>¡Cromo' + (nuevos.length > 1 ? "s" : "") + ' nuevo' + (nuevos.length > 1 ? "s" : "") + '!</b></p><div class="r-cromos">' +
        nuevos.map(function (id) { return cromoHTML(CROMOS.filter(function (c) { return c.id === id; })[0]); }).join("") + '</div>' : '') +
      (share ? '<p class="r-desg">Guardada. Se ha abierto WhatsApp para enviarla.</p>' : '<p class="r-desg">Guardada en este dispositivo.</p>');
    lastFocus = document.activeElement;
    reward.hidden = false;
    $("#rewardClose").focus();
    if (r.final === "si") confeti();
  }
  function closeReward() {
    reward.hidden = true;
    var m = $("#jugador"); if (m) m.scrollIntoView({ behavior: "smooth" });
    if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus();
  }
  $("#rewardClose").addEventListener("click", closeReward);
  document.addEventListener("keydown", function (e) { if (!reward.hidden && e.key === "Escape") closeReward(); });

  /* ============================================================
     ÁLBUM DE CROMOS
     ============================================================ */
  function renderAlbum() {
    var ok = cromosConseguidos();
    $("#album").innerHTML = '<p class="album-cap">' + ok.length + ' de ' + CROMOS.length + ' cromos</p>' +
      CROMOS.map(function (c) { return cromoHTML(c, ok.indexOf(c.id) < 0); }).join("");
  }

  /* ============================================================
     TIENDA
     ============================================================ */
  function renderTienda() {
    var box = $("#tiendaBox"), disp = xpGanado() - xpGastado(), canjes = getCanjes();
    box.innerHTML =
      '<div class="saldo"><span class="big">' + disp + '</span><span>XP para gastar<br>(' + xpGanado() + ' ganados en total)</span></div>' +
      '<div class="premios">' + (getPremios().map(function (p) {
        var puede = disp >= p.coste;
        return '<div class="premio" data-id="' + p.id + '"><span class="pe" aria-hidden="true">' + esc(p.emoji) + '</span>' +
          '<span class="pt"><b>' + esc(p.nombre) + '</b><span>' + p.coste + ' XP' + (puede ? '' : ' · te faltan ' + (p.coste - disp)) + '</span></span>' +
          '<span class="pacts"><button type="button" class="mini mini-go" data-act="canjear"' + (puede ? '' : ' disabled') + '>Canjear</button>' +
          '<button type="button" class="mini mini-del" data-act="quitar" aria-label="Quitar premio ' + esc(p.nombre) + '">✕</button></span></div>';
      }).join("") || '<p class="lead">Aún no hay premios. Pactad uno abajo.</p>') + '</div>' +
      '<div class="add-premio">' +
        '<div><label for="pNombre">Nuevo premio (lo pactáis en familia)</label><input type="text" id="pNombre" placeholder="Invitar a un amigo a merendar…"></div>' +
        '<div><label for="pCoste">Precio (XP)</label><input type="number" id="pCoste" min="5" step="5" value="50"></div>' +
        '<button type="button" class="btn btn-sm" id="pAdd">＋ Añadir</button>' +
      '</div>' +
      (canjes.length ? '<div class="canjes"><b>Premios canjeados</b><ul>' + canjes.slice(-6).reverse().map(function (c) { return "<li>" + esc(c.date) + " · " + esc(c.nombre) + " (−" + c.coste + " XP)</li>"; }).join("") + '</ul></div>' : '');

    $$(".premio", box).forEach(function (row) {
      var id = row.getAttribute("data-id"), p = getPremios().filter(function (x) { return x.id === id; })[0];
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-act") === "canjear") {
            if (confirm("¿Canjear «" + p.nombre + "» por " + p.coste + " XP? Mamá o papá tienen que estar de acuerdo.")) {
              saveRec({ id: uid("can_"), kind: "canje", date: ymd(), ts: Date.now(), premioId: p.id, nombre: p.nombre, coste: p.coste });
              confeti(); renderAll();
            }
          } else if (confirm("¿Quitar el premio «" + p.nombre + "» de la tienda?")) { removeRecord(id); renderAll(); }
        });
      });
    });
    $("#pAdd").addEventListener("click", function () {
      var nombre = ($("#pNombre").value || "").trim(); if (!nombre) { $("#pNombre").focus(); return; }
      crearPremio({ emoji: "🎁", nombre: nombre, coste: Math.max(5, Number($("#pCoste").value) || 50) });
      renderAll();
    });
  }

  function renderAll() { renderPlayer(); renderNiveles(); renderAlbum(); renderTienda(); }

  /* ============================================================
     PROGRESO + REVELADO + INIT
     ============================================================ */
  var progress = $("#progress");
  function onScroll() { var h = document.documentElement; var max = (h.scrollHeight - h.clientHeight) || 1; progress.style.width = Math.min(100, (h.scrollTop || document.body.scrollTop) / max * 100) + "%"; }
  document.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  $("#btnAddNivel").addEventListener("click", function () { openEditor(null); });
  $("#btnResetNiveles").addEventListener("click", function () { if (confirm("¿Restaurar los niveles de ejemplo? Se reemplazan los niveles actuales (las misiones jugadas, los XP y los premios se conservan).")) resetNiveles(); });

  var codeInput = $("#codigo");
  if (window.Aprens) {
    var savedCod = Aprens.getPacienteCodigo(); if (savedCod) codeInput.value = savedCod;
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }

  seedIfEmpty();
  renderAll();
  if (window.Aprens && Aprens.mountBar) Aprens.mountBar();
})();
