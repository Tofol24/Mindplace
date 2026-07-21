/* ============================================================================
   Ritual diario · calma y atención · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Pauta parental para regulación / rabietas: ritual diario de audios AIS
   (con las pistas reproducibles), 3 normas + consecuencia + refuerzo,
   parada de pensamiento con respiración y grounding 5-4-3-2-1. Registro diario
   guardado en el núcleo APRENS (aprens_db) para compartirlo con el psicólogo/a.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOOL = "ritual_calma";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "Ritual diario · calma y atención", toolVersion: 1 });

  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- Audios (voz mono, se cargan solo al reproducir) ---------- */
  var AUDIOS = [
    { n: 1, dur: "12:22" }, { n: 2, dur: "4:47" }, { n: 3, dur: "9:56" }, { n: 4, dur: "6:13" },
    { n: 6, dur: "5:57" }, { n: 7, dur: "5:06" }, { n: 8, dur: "4:19" }, { n: 9, dur: "3:29" }
  ];
  function renderAudios() {
    var box = $("#audios"); if (!box) return;
    box.innerHTML = AUDIOS.map(function (a) {
      return '<div class="audioc">' +
        '<div class="audioc-top"><span class="an">Pista ' + a.n + '</span><span class="ad">' + a.dur + '</span></div>' +
        '<audio controls preload="none" src="assets/audio/pista-' + a.n + '.mp3"></audio>' +
      '</div>';
    }).join("");
  }

  /* ---------- Confeti (papelines) + frase reforzadora ---------- */
  var FRASES = [
    "Gracias por respetar el momento.",
    "Un ratito de calma también cuenta.",
    "Hoy se ha escuchado un poco por dentro.",
    "La calma se entrena, día a día.",
    "Habéis sostenido el momento con serenidad."
  ];
  function confeti() {
    var cols = ["#D89A4E", "#5E6CA0", "#6E86A8", "#E4C79E", "#5B8A6B"];
    for (var i = 0; i < 26; i++) {
      var c = document.createElement("div"); c.className = "confeti";
      c.style.left = (i * 3.9) + "vw";
      c.style.background = cols[i % cols.length];
      c.style.animation = "cae " + (1.5 + (i % 5) * 0.28) + "s ease-in " + ((i % 6) * 0.07) + "s forwards";
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3600); })(c);
    }
  }
  function fraseRefuerzo() { return FRASES[(Date.now() / 1000 | 0) % FRASES.length]; }

  /* ============================================================
     REGISTRO DEL RITUAL DEL DÍA
     ============================================================ */
  var reg = { participo: null, respeto: null };
  function bindSingle(groupId, cb) {
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

  var PART_TXT = { hizo: "Lo hizo conmigo", acompano: "Me acompañó en silencio", no: "Hoy no quiso" };
  var RESP_TXT = { si: "Sí (recibió recompensa)", no: "No (hoy sin recompensa)" };

  function buildRegistro() {
    return {
      id: "rit_" + ymd(), kind: "ritual", date: ymd(), ts: Date.now(),
      participo: reg.participo, respeto: reg.respeto, nota: ($("#rNota").value || "").trim()
    };
  }
  function resumenRegistro(r) {
    var L = ["Ritual diario · calma y atención — APRENS", "Fecha: " + r.date];
    if (r.participo) L.push("Audio: " + (PART_TXT[r.participo] || r.participo));
    if (r.respeto) L.push("¿Respetó el momento?: " + (RESP_TXT[r.respeto] || r.respeto));
    if (r.nota) L.push("Nota: " + r.nota);
    L.push("", "(Enviado desde el Ritual diario · adjunta también el .json para el panel)");
    return L.join("\n");
  }
  function saveRegistro(share) {
    var cod = ($("#codigo").value || "").trim();
    if (cod && window.Aprens) Aprens.setPacienteCodigo(cod);
    var r = buildRegistro();
    if (window.Aprens) Aprens.save(r); // upsert por fecha (uno por día)
    var note = $("#rNote");
    if (r.respeto === "si") { confeti(); if (note) note.textContent = "Guardado. " + fraseRefuerzo() + " No olvidéis los 10 minutos acordados."; }
    else if (note) { note.textContent = "Guardado en este dispositivo."; }
    if (share) {
      try { window.open("https://wa.me/?text=" + encodeURIComponent(resumenRegistro(r)), "_blank"); } catch (e) {}
      if (note) note.textContent = "Guardado. Se ha abierto WhatsApp para enviarlo.";
    }
  }

  /* ============================================================
     RESPIRACIÓN GUIADA
     ============================================================ */
  var breathTimer = null, breathStart = 0;
  var FASES = [ // suman 11s, en sintonía con la animación .breathe
    { w: "Coge aire…", t: 0 }, { w: "Mantén", t: 2000 }, { w: "Suelta…", t: 4600 }, { w: "Descansa", t: 7000 }
  ];
  function toggleBreath() {
    var el = $("#breath"), word = $("#breathWord"), btn = $("#breathBtn");
    if (breathTimer) {
      clearInterval(breathTimer); breathTimer = null;
      el.classList.remove("run"); word.textContent = "Respira"; btn.textContent = "Empezar la respiración guiada";
      return;
    }
    el.classList.add("run"); btn.textContent = "Parar";
    breathStart = Date.now();
    breathTimer = setInterval(function () {
      var e = (Date.now() - breathStart) % 11000, cur = FASES[0].w;
      for (var i = 0; i < FASES.length; i++) { if (e >= FASES[i].t) cur = FASES[i].w; }
      word.textContent = cur;
    }, 120);
  }

  /* ============================================================
     GROUNDING 5-4-3-2-1
     ============================================================ */
  var GROUND = [
    { n: 5, t: "Cinco cosas que ves", s: "Miradlas y nombradlas en voz alta, una a una." },
    { n: 4, t: "Cuatro cosas que notas al tacto", s: "La ropa, el suelo, algo suave, tus manos…" },
    { n: 3, t: "Tres cosas que escuchas", s: "Cerca o lejos, sin buscarlas demasiado." },
    { n: 2, t: "Dos cosas que hueles", s: "O dos que te gustaría oler ahora." },
    { n: 1, t: "Una cosa que imaginas saborear", s: "Tu comida favorita, un ratito." }
  ];
  function renderGrounding() {
    var box = $("#grounding"); if (!box) return;
    box.innerHTML = GROUND.map(function (g, i) {
      return '<div class="gstep" data-i="' + i + '"><span class="gn">' + g.n + '</span>' +
        '<span class="gb"><b>' + esc(g.t) + '</b><span>' + esc(g.s) + '</span></span>' +
        '<span class="gcheck">✓</span></div>';
    }).join("");
    var done = 0;
    $$(".gstep", box).forEach(function (st) {
      st.addEventListener("click", function () {
        var was = st.classList.contains("on");
        st.classList.toggle("on", !was);
        done += was ? -1 : 1;
        var note = $("#gNote");
        if (done >= GROUND.length && note) { note.textContent = "Los cinco sentidos, de vuelta al presente. Bien acompañado."; }
        else if (note) { note.textContent = done > 0 ? done + " de 5" : ""; }
      });
    });
  }

  /* ============================================================
     PROGRESO + REVELADO + INIT
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
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  renderAudios();
  renderGrounding();
  bindSingle("participo", function (v) { reg.participo = v; });
  bindSingle("respeto", function (v) { reg.respeto = v; });
  $("#rSave").addEventListener("click", function () { saveRegistro(false); });
  $("#rSaveWA").addEventListener("click", function () { saveRegistro(true); });
  $("#breathBtn").addEventListener("click", toggleBreath);

  var codeInput = $("#codigo");
  if (window.Aprens) {
    var saved = Aprens.getPacienteCodigo();
    if (saved) codeInput.value = saved;
    // precargar el registro de hoy si existe
    var hoy = Aprens.history().filter(function (r) { return r.kind === "ritual" && r.date === ymd(); })[0];
    if (hoy) {
      reg.participo = hoy.participo; reg.respeto = hoy.respeto;
      if (hoy.nota) $("#rNota").value = hoy.nota;
      if (hoy.participo) { var pb = $('#participo .pill[data-v="' + hoy.participo + '"]'); if (pb) pb.setAttribute("aria-pressed", "true"); }
      if (hoy.respeto) { var rb = $('#respeto .pill[data-v="' + hoy.respeto + '"]'); if (rb) rb.setAttribute("aria-pressed", "true"); }
    }
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }
  if (window.Aprens && Aprens.mountBar) Aprens.mountBar();
})();
