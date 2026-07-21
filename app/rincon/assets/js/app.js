/* ============================================================================
   Rincón de calma · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Tres juegos infantiles, directos y visuales, para practicar la calma:
   🌸 Respiración de la flor y la vela · 🤍 Abrazo sentido · 🔎 Detective de
   sensaciones. Se puede abrir un juego directo con ?ej=respiracion|abrazo|
   sensaciones (así lo enlaza La exploradora valiente). Guarda una marca de
   práctica en el núcleo APRENS (aprens_db) para el psicólogo/a.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var view = $("#view"), homeBtn = $("#homeBtn");

  if (window.Aprens) Aprens.config({ toolId: "rincon_calma", toolName: "Rincón de calma", toolVersion: 1 });
  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function marcarPractica(juego) { if (window.Aprens) Aprens.save({ id: "prac_" + Date.now(), kind: "practica", juego: juego, date: ymd(), ts: Date.now() }, { append: true }); }

  function confeti() {
    var cols = ["#F3B99A", "#C9B6E4", "#9BD4BE", "#F6D06B", "#F0A97F"];
    for (var i = 0; i < 26; i++) {
      var c = document.createElement("div"); c.className = "confeti";
      c.style.left = (i * 3.9) + "vw"; c.style.background = cols[i % cols.length];
      c.style.animation = "cae " + (1.5 + (i % 5) * 0.28) + "s ease-in " + ((i % 6) * 0.07) + "s forwards";
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3600); })(c);
    }
  }

  var GAMES = [
    { id: "respiracion", emoji: "🌸", t: "La flor y la vela", d: "Respira: huele la flor y apaga la vela.", cls: "gc-1" },
    { id: "abrazo", emoji: "🤍", t: "El abrazo sentido", d: "Date un abrazo calentito y nota el latido.", cls: "gc-2" },
    { id: "sensaciones", emoji: "🔎", t: "Detective de sensaciones", d: "¿Dónde lo notas? ¡Vamos a descubrirlo!", cls: "gc-3" }
  ];

  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function goHome() { stopTimer(); homeBtn.hidden = true; renderMenu(); }
  homeBtn.addEventListener("click", goHome);

  /* ---------------- MENÚ ---------------- */
  function renderMenu() {
    stopTimer();
    view.innerHTML =
      '<div class="menu-h"><h1>Rincón de calma</h1><p>Elige un juego. Son cortos, para respirar y estar a gustito.</p></div>' +
      '<div class="games">' + GAMES.map(function (g) {
        return '<button class="gamecard ' + g.cls + '" data-g="' + g.id + '">' +
          '<span class="gc-emoji">' + g.emoji + '</span>' +
          '<span class="gc-body"><span class="gc-t">' + g.t + '</span><span class="gc-d">' + g.d + '</span></span>' +
          '<span class="gc-go">›</span></button>';
      }).join("") + '</div>';
    $$(".gamecard", view).forEach(function (b) { b.addEventListener("click", function () { openGame(b.getAttribute("data-g")); }); });
    if (window.Aprens && Aprens.mountBar && !$("#aprensBar")) Aprens.mountBar();
  }

  function openGame(id) {
    homeBtn.hidden = false;
    if (id === "respiracion") return juegoRespiracion();
    if (id === "abrazo") return juegoAbrazo();
    if (id === "sensaciones") return juegoSensaciones();
    goHome();
  }

  /* ---------------- 🌸 RESPIRACIÓN: flor y vela ---------------- */
  function juegoRespiracion() {
    stopTimer();
    var TOTAL = 4;
    view.innerHTML =
      '<div class="game">' +
        '<h2>🌸 La flor y la vela</h2>' +
        '<p class="lead">Huele la flor por la nariz… y apaga la vela por la boca, despacito.</p>' +
        '<div class="breath-stage"><div class="breath-orb" id="orb"><span class="breath-emoji" id="orbEmoji">🌸</span></div></div>' +
        '<div class="breath-word" id="bWord">¿List@?</div>' +
        '<div class="breath-count" id="bCount">' + TOTAL + ' respiraciones</div>' +
        '<div class="game-acts"><button class="big-btn" id="bStart">Empezar</button>' +
          '<button class="ghost-btn" id="bHome">Otro juego</button></div>' +
        '<div class="done-msg" id="bDone"></div>' +
      '</div>';
    $("#bHome").addEventListener("click", goHome);
    var orb = $("#orb"), emoji = $("#orbEmoji"), word = $("#bWord"), count = $("#bCount"), done = $("#bDone"), start = $("#bStart");
    // fases suman 10s (en sintonía con @keyframes breathe)
    var FASES = [
      { t: 0, w: "Huele la flor 🌸", e: "🌸" },
      { t: 2000, w: "Guarda el aire…", e: "🌸" },
      { t: 4400, w: "Apaga la vela 🕯️", e: "🕯️" },
      { t: 6600, w: "Descansa", e: "😌" }
    ];
    var t0 = 0, ciclos = 0;
    start.addEventListener("click", function () {
      stopTimer(); done.textContent = ""; ciclos = 0; count.textContent = TOTAL + " respiraciones";
      orb.classList.add("run"); start.textContent = "Otra vez";
      t0 = Date.now();
      timer = setInterval(function () {
        var e = Date.now() - t0;
        if (e >= 10000) { e = e % 10000; t0 = Date.now() - e; ciclos++; count.textContent = Math.max(0, TOTAL - ciclos) + " respiraciones"; }
        if (ciclos >= TOTAL) {
          stopTimer(); orb.classList.remove("run"); word.textContent = "¡Muy bien! 🌟"; emoji.textContent = "😌";
          count.textContent = ""; done.textContent = "Has respirado como una campeona."; confeti(); marcarPractica("respiracion"); return;
        }
        var cur = FASES[0];
        for (var i = 0; i < FASES.length; i++) { if (e >= FASES[i].t) cur = FASES[i]; }
        word.textContent = cur.w; emoji.textContent = cur.e;
      }, 120);
    });
  }

  /* ---------------- 🤍 ABRAZO SENTIDO ---------------- */
  function juegoAbrazo() {
    stopTimer();
    var TOTAL = 3;
    view.innerHTML =
      '<div class="game">' +
        '<h2>🤍 El abrazo sentido</h2>' +
        '<p class="lead">Cruza los brazos y date un abrazo fuerte. Nota el calorcito y el latido.</p>' +
        '<div class="hug-stage"><span class="hug-heart" id="heart">🤍</span></div>' +
        '<div class="hug-word" id="hWord">¿List@?</div>' +
        '<div class="breath-count" id="hCount">' + TOTAL + ' abrazos</div>' +
        '<div class="game-acts"><button class="big-btn" id="hStart">Empezar</button>' +
          '<button class="ghost-btn" id="hHome">Otro juego</button></div>' +
        '<div class="done-msg" id="hDone"></div>' +
      '</div>';
    $("#hHome").addEventListener("click", goHome);
    var heart = $("#heart"), word = $("#hWord"), count = $("#hCount"), done = $("#hDone"), start = $("#hStart");
    var FASES = [
      { t: 0, w: "Aprieta el abrazo 🤗", e: "❤️" },
      { t: 1600, w: "Nota el calorcito…", e: "❤️" },
      { t: 3200, w: "Suelta despacio", e: "🤍" }
    ];
    var t0 = 0, ciclos = 0;
    start.addEventListener("click", function () {
      stopTimer(); done.textContent = ""; ciclos = 0; count.textContent = TOTAL + " abrazos";
      heart.classList.add("run"); start.textContent = "Otra vez"; t0 = Date.now();
      timer = setInterval(function () {
        var e = Date.now() - t0;
        if (e >= 4800) { e = e % 4800; t0 = Date.now() - e; ciclos++; count.textContent = Math.max(0, TOTAL - ciclos) + " abrazos"; }
        if (ciclos >= TOTAL) {
          stopTimer(); heart.classList.remove("run"); heart.textContent = "💛"; word.textContent = "¡Qué abrazo! 🌟";
          count.textContent = ""; done.textContent = "Te has cuidado con cariño."; confeti(); marcarPractica("abrazo"); return;
        }
        var cur = FASES[0];
        for (var i = 0; i < FASES.length; i++) { if (e >= FASES[i].t) cur = FASES[i]; }
        word.textContent = cur.w; heart.textContent = cur.e;
      }, 120);
    });
  }

  /* ---------------- 🔎 DETECTIVE DE SENSACIONES ---------------- */
  function bodySVG() {
    return '<svg class="body-svg" viewBox="0 0 120 240" aria-label="Cuerpo">' +
      '<ellipse cx="60" cy="222" rx="34" ry="10" fill="#E7DCEC"/>' +
      '<path d="M60 34 C74 34 82 44 82 58 C82 70 76 78 74 84 L86 92 C96 98 98 120 96 150 L84 150 C84 130 82 118 78 110 L78 168 C78 172 76 210 72 214 L64 214 C62 200 61 176 60 158 C59 176 58 200 56 214 L48 214 C44 210 42 172 42 168 L42 110 C38 118 36 130 36 150 L24 150 C22 120 24 98 34 92 L46 84 C44 78 38 70 38 58 C38 44 46 34 60 34 Z" fill="#F3E6D8" stroke="#E0CBB6" stroke-width="1.5"/>' +
      '<circle class="zona" data-z="cabeza" cx="60" cy="20" r="15" fill="#F3E6D8" stroke="#E0CBB6" stroke-width="1.5"/>' +
      '<circle class="zona" data-z="garganta" cx="60" cy="42" r="8" fill="#EFD9C6"/>' +
      '<circle class="zona" data-z="pecho" cx="60" cy="78" r="16" fill="#EFD9C6"/>' +
      '<circle class="zona" data-z="barriga" cx="60" cy="118" r="16" fill="#EFD9C6"/>' +
      '<circle class="zona" data-z="manos" cx="30" cy="150" r="9" fill="#EFD9C6"/>' +
      '<circle class="zona" data-z="manos2" cx="90" cy="150" r="9" fill="#EFD9C6"/>' +
    '</svg>';
  }
  var ZONA_TXT = { cabeza: "la cabeza", garganta: "la garganta", pecho: "el pecho", barriga: "la barriga", manos: "las manos", manos2: "las manos" };
  var QUALS = [
    { id: "calor", t: "Calorcito 🔥" }, { id: "mariposas", t: "Mariposas 🦋" }, { id: "nudo", t: "Un nudo 🪢" },
    { id: "cosquillas", t: "Cosquillas ✨" }, { id: "fuerte", t: "Late fuerte 🥁" }, { id: "nada", t: "Casi nada 🍃" }
  ];
  function juegoSensaciones() {
    stopTimer();
    var sel = { zona: null, qual: null };
    view.innerHTML =
      '<div class="game">' +
        '<h2>🔎 Detective de sensaciones</h2>' +
        '<p class="lead">Toca en el dibujo dónde lo notas. Luego, ¿qué es?</p>' +
        '<div class="body-wrap">' + bodySVG() +
          '<div class="body-side">' +
            '<div class="bs-t">¿Qué notas ahí?</div>' +
            '<div class="quals" id="quals">' + QUALS.map(function (q) { return '<button class="qual" data-q="' + q.id + '">' + q.t + '</button>'; }).join("") + '</div>' +
            '<div class="detres" id="detres">Toca una parte del cuerpo para empezar.</div>' +
          '</div>' +
        '</div>' +
        '<div class="game-acts"><button class="ghost-btn" id="sHome">Otro juego</button></div>' +
      '</div>';
    $("#sHome").addEventListener("click", goHome);
    var res = $("#detres");
    function pintar() {
      if (!sel.zona) { res.textContent = "Toca una parte del cuerpo para empezar."; return; }
      var z = ZONA_TXT[sel.zona];
      if (!sel.qual) { res.innerHTML = "Lo notas en <b>" + z + "</b>. ¿Y qué es?"; return; }
      var q = QUALS.filter(function (x) { return x.id === sel.qual; })[0];
      res.innerHTML = "¡Buen trabajo, detective! Lo notas en <b>" + z + "</b> y es como <b>" + q.t.replace(/[^\wáéíóúñ ]/gi, "").trim().toLowerCase() + "</b>. Le ponemos nombre y le hacemos sitio. 🌟";
      confeti(); marcarPractica("sensaciones");
    }
    $$(".zona", view).forEach(function (z) {
      z.addEventListener("click", function () {
        $$(".zona", view).forEach(function (x) { x.classList.remove("on"); });
        z.classList.add("on"); sel.zona = z.getAttribute("data-z"); sel.qual = null;
        $$(".qual", view).forEach(function (x) { x.setAttribute("aria-pressed", "false"); x.classList.remove("on"); });
        pintar();
      });
    });
    $$(".qual", view).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!sel.zona) { res.textContent = "Primero toca dónde lo notas 🙂"; return; }
        $$(".qual", view).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); sel.qual = b.getAttribute("data-q"); pintar();
      });
    });
  }

  /* ---------------- INIT (abre juego directo con ?ej=) ---------------- */
  function param(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  var ej = (param("ej") || "").toLowerCase();
  if (ej === "respiracion" || ej === "abrazo" || ej === "sensaciones") { homeBtn.hidden = false; openGame(ej); }
  else renderMenu();
})();
