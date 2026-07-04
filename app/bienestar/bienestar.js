/* ============================================================================
   Calma · versión consumer de bienestar (MVP3 · Fase A)
   ----------------------------------------------------------------------------
   Piel psicoeducativa sobre el mismo motor (TEC/AIS) y el mismo aprens_db.
   NO es producto sanitario: lenguaje de bienestar, sin código de profesional,
   con progreso personal para el usuario. Reutiliza las prácticas standalone.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var PKEY = "aprens_bienestar_perfil";

  /* Catálogo consumer: prácticas (reutilizan las herramientas standalone). */
  var TOOLS = [
    { id: "bajar_alerta", file: "bajar-alerta.html",       emoji: "🫁", tit: "Calma en 4 pasos",        sub: "Vuelve al aquí y ahora cuando te notas en tensión.", goals: ["calma"] },
    { id: "acompanar",    file: "acompanar-sensacion.html", emoji: "🤝", tit: "Acompaña lo que sientes",  sub: "Estar con la emoción sin luchar contra ella.",       goals: ["calma", "ie"] },
    { id: "mapa",         file: "mapa-interno.html",        emoji: "🫀", tit: "Mapa de tu cuerpo",        sub: "Explora por dentro: cuello, pecho y barriga.",       goals: ["calma", "ie"] },
    { id: "curiosidad",   file: "ais-curiosidad.html",      emoji: "🌱", tit: "Explora con curiosidad",   sub: "Entrena la atención mirando tu cuerpo por dentro.",  goals: ["foco", "ie"] },
    { id: "amor",         file: "ais-amor.html",            emoji: "💛", tit: "Cuídate, no te controles", sub: "Pequeños gestos diarios para acompañarte.",          goals: ["ie"] },
    { id: "valores",      file: "brujula-valores.html",     emoji: "🧭", tit: "Tu brújula de valores",    sub: "¿Qué te importa de verdad y cómo estás ahí?",        goals: ["ie", "habitos"] },
    { id: "agenda",       file: "agenda-atencional.html",   emoji: "🗓️", tit: "Tu semana con atención",   sub: "Organiza tu semana con foco y presencia.",           goals: ["foco", "habitos"] }
  ];
  var GOAL_LABEL = { calma: "Calma", foco: "Foco", habitos: "Hábitos", ie: "Inteligencia emocional" };

  /* ---------- Perfil ---------- */
  function loadPerfil() { try { return JSON.parse(localStorage.getItem(PKEY)); } catch (e) { return null; } }
  function savePerfil(p) { localStorage.setItem(PKEY, JSON.stringify(p)); }
  var perfil = loadPerfil();

  /* ---------- Datos (aprens_db, mismo del ecosistema) ---------- */
  function db() { try { return JSON.parse(localStorage.getItem("aprens_db")) || { tools: {} }; } catch (e) { return { tools: {} }; } }
  function recDate(r) { return r.date || r.fecha || (r.ts ? new Date(r.ts).toISOString().slice(0, 10) : ""); }
  function allRecords() {
    var d = db(), out = [];
    Object.keys(d.tools || {}).forEach(function (t) { (d.tools[t].records || []).forEach(function (r) { out.push({ tool: t, r: r }); }); });
    return out;
  }
  function ymd(dt) { return dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2); }
  function streak(dateSet) {
    var cur = new Date();
    if (!dateSet.has(ymd(cur))) { cur.setDate(cur.getDate() - 1); if (!dateSet.has(ymd(cur))) return 0; }
    var n = 0;
    while (dateSet.has(ymd(cur))) { n++; cur.setDate(cur.getDate() - 1); }
    return n;
  }
  var POS_MAP = { conduce: "conduce", persigo: "delante", persecucion: "delante", sobrepensamiento: "delante",
    voltaatras: "delante", delante: "delante", maletero: "maletero", allado: "lado", lado: "lado" };
  var POS_LABEL = { conduce: "Mente acelerada", delante: "En lucha / juicio", maletero: "Lo escondo", lado: "La acompaño 🙂" };
  var POS_COLOR = { conduce: "#c0584e", delante: "#d98a3d", maletero: "#8d6fb0", lado: "#5f9070" };
  var POS_ORDER = ["conduce", "delante", "maletero", "lado"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Onboarding ---------- */
  var onbStep = 1, onbGoals = {};
  function showOnb() {
    $("onb").style.display = "flex"; onbStep = 1; paintOnb();
    Array.prototype.forEach.call(document.querySelectorAll("#onb [data-next]"), function (b) {
      b.onclick = function () { onbStep++; paintOnb(); };
    });
    Array.prototype.forEach.call(document.querySelectorAll("#goals .goal"), function (b) {
      b.onclick = function () { var g = b.getAttribute("data-goal"); onbGoals[g] = !onbGoals[g]; b.classList.toggle("on", onbGoals[g]); };
    });
    $("onbAccept").onchange = function () { $("onbFinish").disabled = !this.checked; };
    $("onbFinish").onclick = function () {
      perfil = { nombre: $("onbName").value.trim(), objetivos: Object.keys(onbGoals).filter(function (g) { return onbGoals[g]; }), aceptado: true, fecha: ymd(new Date()) };
      savePerfil(perfil); $("onb").style.display = "none"; startApp();
    };
  }
  function paintOnb() {
    Array.prototype.forEach.call(document.querySelectorAll("#onb .onb-step"), function (s) {
      s.style.display = Number(s.getAttribute("data-step")) === onbStep ? "block" : "none";
    });
    Array.prototype.forEach.call(document.querySelectorAll(".onb-dots i"), function (d) {
      d.classList.toggle("on", Number(d.getAttribute("data-dot")) === onbStep);
    });
  }

  /* ---------- App ---------- */
  function startApp() {
    $("app").style.display = "flex";
    $("hola").textContent = perfil && perfil.nombre ? "Hola, " + perfil.nombre : "Hola";
    wireNav();
    renderHoy(); renderExplora();
  }
  function recommended() {
    var goals = (perfil && perfil.objetivos) || [];
    if (!goals.length) return TOOLS.slice();
    var rec = TOOLS.filter(function (t) { return t.goals.some(function (g) { return goals.indexOf(g) >= 0; }); });
    return rec.length ? rec : TOOLS.slice();
  }
  function cardHTML(t) {
    return '<button class="card" data-tool="' + t.id + '">' +
      '<span class="c-emoji">' + t.emoji + '</span>' +
      '<span class="c-tit">' + esc(t.tit) + '</span>' +
      '<span class="c-sub">' + esc(t.sub) + '</span>' +
      '<span class="c-go">Empezar ›</span></button>';
  }
  function wireCards(container) {
    Array.prototype.forEach.call(container.querySelectorAll(".card"), function (c) {
      c.onclick = function () { openTool(c.getAttribute("data-tool")); };
    });
  }
  function renderHoy() {
    var rec = recommended();
    var sug = rec[Math.floor(dailyIndex() % rec.length)] || rec[0];
    var dates = new Set(allRecords().map(function (x) { return recDate(x.r); }).filter(Boolean));
    var st = streak(dates);
    $("hero").innerHTML = sug ? (
      '<div class="k">Tu momento de hoy</div>' +
      '<h2>' + esc(sug.tit) + '</h2>' +
      '<p>' + esc(sug.sub) + '</p>' +
      '<button class="h-btn" data-tool="' + sug.id + '">Empezar ahora</button>' +
      '<div class="streakline">' + (st > 0 ? "🔥 Llevas " + st + (st === 1 ? " día seguido" : " días seguidos") : "Empieza hoy tu primera práctica 🌱") + '</div>'
    ) : "";
    var hb = $("hero").querySelector(".h-btn"); if (hb) hb.onclick = function () { openTool(sug.id); };
    $("recCards").innerHTML = rec.map(cardHTML).join("");
    wireCards($("recCards"));
  }
  function renderExplora() { $("allCards").innerHTML = TOOLS.map(cardHTML).join(""); wireCards($("allCards")); }
  function dailyIndex() { var d = new Date(); return d.getFullYear() * 366 + (d.getMonth() * 31) + d.getDate(); }

  /* ---------- Overlay de práctica ---------- */
  function openTool(id) {
    var t = TOOLS.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    $("toolTitle").textContent = t.tit;
    $("toolFrame").src = "../tools-standalone/" + t.file;
    $("toolOverlay").style.display = "flex";
  }
  function closeTool() {
    $("toolOverlay").style.display = "none"; $("toolFrame").src = "about:blank";
    renderHoy(); if (curView === "progreso") renderProgreso();
  }

  /* ---------- Progreso ---------- */
  function renderProgreso() {
    if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
    var recs = allRecords();
    var body = $("progBody");
    if (!recs.length) {
      body.innerHTML = '<div class="p-empty"><div class="e">🌤️</div><h3>Tu progreso aparecerá aquí</h3>' +
        '<p class="sub">Haz tu primera práctica desde «Hoy» y empieza a construir tu racha.</p></div>';
      return;
    }
    var dates = recs.map(function (x) { return recDate(x.r); }).filter(Boolean);
    var set = new Set(dates);
    var st = streak(set);

    // actividad últimos 14 días
    var labels = [], counts = [];
    for (var i = 13; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); var key = ymd(d); labels.push(key.slice(5)); counts.push(dates.filter(function (x) { return x === key; }).length); }

    // cómo has llevado tu mente
    var mono = { conduce: 0, delante: 0, maletero: 0, lado: 0 }, mtot = 0;
    recs.forEach(function (x) {
      if (["estado_mono", "donde_esta_mono", "donde_mono"].indexOf(x.tool) < 0) return;
      var k = POS_MAP[x.r.pos || x.r.escena || x.r.modo]; if (k) { mono[k]++; mtot++; }
    });

    body.innerHTML =
      '<div class="p-stats">' +
        pstat("🔥 " + st, st === 1 ? "día seguido" : "días seguidos") +
        pstat(recs.length, "prácticas") +
        pstat(set.size, "días activos") +
      '</div>' +
      '<div class="p-card"><h4>Tu actividad</h4><div class="sub">Prácticas de los últimos 14 días.</div>' +
        '<div class="chart-wrap"><canvas id="cAct"></canvas></div></div>' +
      (mtot ? ('<div class="p-card"><h4>Cómo has llevado tu mente</h4>' +
        '<div class="sub">Basado en tus check-ins.</div>' + mbars(mono, mtot) + '</div>') : "");

    if (window.Chart) {
      chart = new Chart($("cAct").getContext("2d"), {
        type: "bar",
        data: { labels: labels, datasets: [{ data: counts, backgroundColor: "#4f9d8a", borderRadius: 6, maxBarThickness: 18 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } }
      });
    }
  }
  function pstat(n, k) { return '<div class="p-stat"><div class="n">' + esc(n) + '</div><div class="k">' + esc(k) + '</div></div>'; }
  function mbars(mono, tot) {
    return '<div class="mbars">' + POS_ORDER.map(function (k) {
      var v = mono[k], pct = tot ? Math.round(100 * v / tot) : 0;
      return '<div class="mbar"><span>' + esc(POS_LABEL[k]) + '</span>' +
        '<span class="track"><span class="fill" style="width:' + pct + '%;background:' + POS_COLOR[k] + '"></span></span>' +
        '<span class="v">' + v + '</span></div>';
    }).join("") + '</div>';
  }
  var chart = null;

  /* ---------- Navegación / ajustes ---------- */
  var curView = "hoy";
  function wireNav() {
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) {
      tab.onclick = function () {
        curView = tab.getAttribute("data-view");
        Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) { t.classList.toggle("active", t === tab); });
        Array.prototype.forEach.call(document.querySelectorAll(".view"), function (v) { v.style.display = "none"; });
        $("view-" + curView).style.display = "block";
        if (curView === "progreso") renderProgreso();
      };
    });
    $("toolBack").onclick = closeTool;
    $("btnAjustes").onclick = openAjustes;
    $("ajClose").onclick = function () { $("ajustes").style.display = "none"; };
    $("ajSave").onclick = saveAjustes;
    $("ajReset").onclick = function () {
      if (confirm("Esto borra tu perfil de bienestar en este dispositivo (tus prácticas se conservan). ¿Continuar?")) {
        localStorage.removeItem(PKEY); location.reload();
      }
    };
  }
  function openAjustes() {
    $("ajName").value = (perfil && perfil.nombre) || "";
    Array.prototype.forEach.call(document.querySelectorAll("#ajGoals .goal"), function (b) {
      var on = perfil && perfil.objetivos && perfil.objetivos.indexOf(b.getAttribute("data-goal")) >= 0;
      b.classList.toggle("on", !!on);
      b.onclick = function () { b.classList.toggle("on"); };
    });
    $("ajustes").style.display = "flex";
  }
  function saveAjustes() {
    var goals = [];
    Array.prototype.forEach.call(document.querySelectorAll("#ajGoals .goal.on"), function (b) { goals.push(b.getAttribute("data-goal")); });
    perfil = perfil || {}; perfil.nombre = $("ajName").value.trim(); perfil.objetivos = goals; savePerfil(perfil);
    $("ajustes").style.display = "none";
    $("hola").textContent = perfil.nombre ? "Hola, " + perfil.nombre : "Hola";
    renderHoy();
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (perfil && perfil.aceptado) startApp(); else showOnb();
  });
  window.APRENS_BIENESTAR = { _p: function () { return perfil; } }; // pruebas
})();
