/* ============================================================================
   Anclado en mí · plan de cambio guiado (consumer)  — sobre el motor TEC/AIS
   Historia del mono (voz de Tòfol Villalonga, "¿Quién conduce tu vida?"),
   evaluación de entrada → recomendación, plan por fases (libre pero guiado),
   Visitas al mono (hábito diario), práctica base de 3 min, termómetro
   amenaza→reto y progreso. Mismo aprens_db. Sin dependencias externas.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var AK = "aprens_anclado";

  /* ─────────────── Contenido ─────────────── */
  // Onboarding esencial (6) — frases del deck, condensadas
  var STORY = [
    { e: "🚗", t: "Tu vida es un coche", b: "Dentro viaja un <b>mono</b>: tu sistema emocional, tu parte impulsiva, tus miedos, tu necesidad de protección. <b>No es tu enemigo.</b> Lo que ocurre en tu vida depende, sobre todo, de qué lugar ocupa el mono dentro del coche." },
    { e: "🐒", t: "Las tres trampas", b: "A veces <b>el mono conduce</b> y buscas alivio inmediato. A veces <b>lo persigues</b> peleando contigo. A veces <b>lo encierras en el maletero</b> para no sentirlo.", q: "El mono no aprende cuando le gritas. Y lo que escondes no desaparece: solo espera." },
    { e: "🧡", t: "Tú conduces, el mono a tu lado", b: "Hay otra forma: ni echarlo, ni perseguirlo, ni encerrarlo. Sentarlo a tu lado y seguir conduciendo tú. Sentir una emoción no te obliga a obedecerla.", q: "Amar al mono no significa obedecerlo. Significa acompañarlo." },
    { e: "👁️", t: "¿Y yo dónde estoy?", b: "Eres la conciencia que mira y que puede elegir. Cuando el mono conduce, no estás. Cuando lo persigues o lo encierras, estás fundido con él.", q: "Solo aparezco cuando sostengo su dolor. Y al sostenerlo, recupero el volante." },
    { e: "⚓", t: "Tu ancla: el AIS", b: "La <b>Atención Interna Sensorial</b> es sentarte junto al mono: dirigir la atención, a propósito, a las sensaciones del cuerpo, y acompañarlas sin cambiarlas. <b>Para · Siente · Acompaña · Actúa.</b>", q: "Donde diriges tu atención, ahí vas tú." },
    { e: "🌱", t: "Tu plan: visitas al mono", b: "No practicas para calmarte, sino para <b>no abandonarte</b>. El mono cambia porque descubre que cada día vuelves a sentarte a su lado. Yo te voy diciendo qué toca hoy.", q: "Vamos paso a paso, a tu ritmo." }
  ];
  // "La historia" completa (deck)
  var HIST = [
    { k: "Introducción", t: "Imagina que tu vida es un coche", p: "Dentro viaja un mono: tu parte más impulsiva, tus miedos, tu necesidad de protección y de afecto. Reacciona rápido, siente antes de pensar, solo quiere que el malestar pare. No es tu enemigo: llegó contigo intentando cuidarte de la única forma que sabe." },
    { k: "El mono conduce", t: "A veces agarra el volante", p: "Cuando una emoción intensa toma el control, el mono se sienta a conducir: acelera buscando alivio, gira brusco, frena de golpe. Ansiedad, evitación, impulsividad, dependencia, sobrepensamiento.", q: "Cuando el mono conduce, tu vida gira alrededor del alivio inmediato." },
    { k: "Perseguir al mono", t: "Intentas vencerlo", p: "Te exiges calma, te riñes por sentir, intentas controlar cada emoción. Autoexigencia, lucha interna, perfeccionismo. Pero el miedo no se calma a gritos: cuanto más lo persigues, más corre.", q: "El mono no aprende cuando le gritas. Solo se asusta más." },
    { k: "Encerrar al mono", t: "Lo metes en el maletero", p: "Lo tapas, lo distraes, lo silencias: móvil, trabajo, comida, alcohol, sobreocupación. Parece que funciona… pero sigue ahí, golpeando. Reprimir no elimina: aplaza.", q: "Lo que escondes no desaparece. Solo espera." },
    { k: "La alternativa", t: "Tú conduces. El mono a tu lado", p: "No echarlo, no perseguirlo, no encerrarlo. Sentarlo al lado y seguir conduciendo tú. Puede llorar, tener miedo, protestar: puedes escucharlo y mantener el volante.", q: "Amar al mono no significa obedecerlo. Significa acompañarlo." },
    { k: "El camino", t: "No siempre es igual", p: "A veces la carretera es recta; otras, empinada, con curvas y piedras. Y a veces el problema está en el propio coche (el dolor físico). En esos tramos cuesta más, y no pasa nada.", q: "El coche no se detiene. En las cuestas solo avanza más despacio. Y eso también es seguir." },
    { k: "Volver atrás", t: "El mono quiere lo de antes", p: "Cuando el camino se complica, el mono se obsesiona con recuperar lo que había o arreglar lo que ya no tiene arreglo. Y vuelve a coger el volante: frustración, ansiedad, sobrepensamiento.", q: "El mono quiere el camino de ayer. Pero el volante solo conduce por el de hoy." },
    { k: "La dignidad", t: "Nada de esto te la quita", p: "Un camino difícil, el dolor, avanzar lento… no te quitan dignidad. Lo único que la pone en riesgo es cómo tratas al mono que viaja contigo.", q: "Tu dignidad no depende del camino. Depende de quién lleva el volante." },
    { k: "La conciencia", t: "¿Y yo dónde estoy?", p: "Cuando el mono conduce, no estoy. Cuando lo persigo o lo encierro, estoy fundido con él. Solo aparezco de verdad cuando conduzco con el mono al lado.", q: "Solo aparezco cuando sostengo su dolor. Al sostenerlo, recupero el volante." },
    { k: "El AIS", t: "Atención Interna Sensorial", p: "No es relajarte ni poner la mente en blanco. Es dirigir la atención al cuerpo y acompañar las sensaciones sin cambiarlas. Para · Siente · Acompaña · Actúa. Aunque no notes casi nada, mantener la atención ahí ya es la práctica.", q: "El efecto no depende de la sensación, sino de la presencia." },
    { k: "Del comprender al entrenar", t: "El entrenamiento del conductor", p: "Nadie aprende a conducir el día que hay una tormenta. El AIS se practica todos los días —también en calma— para que, cuando llegue la tormenta, ya sepas conducir.", q: "Practico AIS para no abandonarme. El alivio, si llega, es un efecto secundario." },
    { k: "También cuando estás bien", t: "El AIS no es solo para el dolor", p: "Un café, el mar, un abrazo, un paseo, música… también ahí puedes preguntarte: ¿dónde noto esto en mi cuerpo? Así el AIS deja de ser control del dolor y se vuelve una forma de estar contigo.", q: "AIS = relación conmigo mismo." },
    { k: "Lo que el mono necesita", t: "No quiere el volante. Quiere compañía", p: "No necesita ganar la discusión ni que soluciones el dolor. Necesita sentir que no está solo. Cuatro frases: «Te veo» · «Entiendo que tengas miedo» · «No estás solo» · «Estoy contigo».", q: "El mono nunca quiso conducir. Solo necesitaba saber que no iba solo." }
  ];
  // Evaluación de entrada (2 ítems por eje, Likert 0-4)
  var EVAL = [
    { q: "Cuando algo me remueve, puedo parar un momento antes de reaccionar.", ax: "L", dir: 1 },
    { q: "Actúo de golpe (contesto, reviso, evito) buscando alivio inmediato.", ax: "L", dir: -1 },
    { q: "Puedo notar lo que siento en el cuerpo sin que me arrastre.", ax: "D", dir: 1 },
    { q: "Me cuesta saber qué siento; es todo una mezcla confusa.", ax: "D", dir: -1 },
    { q: "Sostengo la atención y sigo con lo que me importa aunque haya malestar.", ax: "C", dir: 1 },
    { q: "Abandono lo que me importa cuando aparece la incomodidad.", ax: "C", dir: -1 }
  ];
  var LIKERT = ["Nunca", "Casi nunca", "A veces", "A menudo", "Casi siempre"];
  var AXIS = { L: "Latencia (la pausa antes de reaccionar)", D: "Densidad (sentirte por dentro)", C: "Continuidad (sostener y actuar)" };
  var FOCO_REC = {
    L: { practica: "calma", txt: "Reaccionas rápido, sin pausa: como cuando el mono coge el volante. Empezamos recuperándolo con calma." },
    D: { practica: "curiosidad", txt: "Te cuesta sentirte por dentro. Empezamos anclando la atención en el cuerpo, con curiosidad." },
    C: { practica: "valores", txt: "Te dispersas y cuesta sostener. Empezamos conectando con lo que de verdad te importa." }
  };

  var PRACTICES = {
    calma:      { kind: "iframe", file: "bajar-alerta.html",       emoji: "🫁", tit: "Calma en 4 pasos",        why: "Ahora el mono tiene el volante. Vamos a recuperarlo, sin pelear." },
    mapa:       { kind: "iframe", file: "mapa-interno.html",        emoji: "🫀", tit: "Mapa de tu cuerpo",        why: "Lleva la atención dentro: que tu cuerpo note que estás ahí." },
    acompanar:  { kind: "iframe", file: "acompanar-sensacion.html", emoji: "🤝", tit: "Acompaña lo que sientes",  why: "Sentarte junto al mono: estar con lo que sientes, sin luchar." },
    sentarse:   { kind: "mini",   mini: "sentarse", emoji: "🧘", tit: "Sentarme junto al mono",   why: "La práctica base, 3 minutos: parar, sentir, validar y dar un paso." },
    respira:    { kind: "mini",   mini: "respira",  emoji: "🫁", tit: "Respiración curiosa",       why: "Un minuto: para el pensamiento, respira con curiosidad y vuelve al aquí y ahora." },
    curiosidad: { kind: "iframe", file: "ais-curiosidad.html",      emoji: "🌱", tit: "Explora con curiosidad",   why: "Mirar dentro con curiosidad, no buscando el peligro." },
    amor:       { kind: "iframe", file: "ais-amor.html",            emoji: "💛", tit: "Cuídate, no te controles", why: "AIS desde el amor: el dolor deja de ser algo que controlar." },
    valores:    { kind: "iframe", file: "brujula-valores.html",     emoji: "🧭", tit: "Tu brújula de valores",    why: "Conducir tú: hacia la persona que quieres ser." },
    agenda:     { kind: "iframe", file: "agenda-atencional.html",   emoji: "🗓️", tit: "Tu semana con atención",   why: "Llevar la presencia a tu día a día." }
  };
  var PHASES = [
    { n: 1, nombre: "Anclar y bajar la alerta", objetivo: "Que el cuerpo empiece a sentirse percibido y baje la alerta.", practicas: ["calma", "sentarse", "mapa", "acompanar"] },
    { n: 2, nombre: "Mirar con curiosidad",     objetivo: "La atención interna deja de buscar el peligro y pasa a explorar.", practicas: ["curiosidad", "mapa", "sentarse"] },
    { n: 3, nombre: "Acompañarte con amor",     objetivo: "Cambiar la relación con el dolor: de control a cuidado.", practicas: ["amor", "acompanar", "sentarse"] },
    { n: 4, nombre: "Vivir desde tus valores",  objetivo: "Llevar el cambio hacia fuera: los demás, el mundo, tus valores.", practicas: ["valores", "agenda", "sentarse"] }
  ];
  var MOMENTOS = ["Al despertar", "Al tomar un café", "Al entrar en casa", "Con alguien importante", "Antes de dormir"];

  /* ─────────────── Estado ─────────────── */
  function loadA() { try { return JSON.parse(localStorage.getItem(AK)) || {}; } catch (e) { return {}; } }
  function saveA() { localStorage.setItem(AK, JSON.stringify(A)); }
  var A = loadA();
  // migración del perfil antiguo
  if (!A.perfil) { try { var old = JSON.parse(localStorage.getItem("aprens_bienestar_perfil")); if (old && old.aceptado) A.perfil = old; } catch (e) {} }
  if (!A.visitas) A.visitas = {};
  if (!A.amenaza) A.amenaza = [];
  if (!A.rutina) A.rutina = { avisos: false, momentos: [
    { label: "Por la mañana", hora: "09:00", on: true, practica: "respira" },
    { label: "A mediodía",     hora: "14:00", on: true, practica: "respira" },
    { label: "Por la tarde",   hora: "20:00", on: true, practica: "sentarse" }
  ] };
  A.rutina.momentos.forEach(function (m) { if (!m.practica) m.practica = "respira"; }); // migración

  function db() { try { return JSON.parse(localStorage.getItem("aprens_db")) || { tools: {} }; } catch (e) { return { tools: {} }; } }
  function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function hoy() { return ymd(new Date()); }
  function recDate(r) { return r.date || r.fecha || (r.ts ? new Date(r.ts).toISOString().slice(0, 10) : ""); }
  function allRecords() { var d = db(), o = []; Object.keys(d.tools || {}).forEach(function (t) { (d.tools[t].records || []).forEach(function (r) { o.push({ tool: t, r: r }); }); }); return o; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function daysSince(iso) { if (!iso) return 999; return Math.floor((new Date(hoy()) - new Date(iso)) / 86400000); }
  function toast(m) { var t = $("toast"); t.textContent = m; t.style.display = "block"; clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = "none"; }, 2600); }

  function activeDays() {
    var set = {};
    Object.keys(A.visitas).forEach(function (d) { if ((A.visitas[d] || []).length) set[d] = 1; });
    allRecords().forEach(function (x) { var d = recDate(x.r); if (d) set[d] = 1; });
    return set;
  }
  function streak() {
    var set = activeDays(), cur = new Date();
    if (!set[ymd(cur)]) { cur.setDate(cur.getDate() - 1); if (!set[ymd(cur)]) return 0; }
    var n = 0; while (set[ymd(cur)]) { n++; cur.setDate(cur.getDate() - 1); } return n;
  }
  function fase() { return (A.plan && A.plan.fase) || 1; }
  function evalDue() { return !A.eval || daysSince(A.eval.fecha) >= 14; }
  function doneToday(pid) {
    // heurística: ¿hay registro hoy de la herramienta ligada?
    var map = { calma: "bajar_alerta", mapa: "mapa_atencion_interna", acompanar: "acompanar_sensacion", curiosidad: "ais_curiosidad", amor: "ais_amor", valores: "brujula_valores", agenda: "agenda_atencional", sentarse: "sentarse_mono", respira: "respiracion_curiosa" };
    var tid = map[pid]; if (!tid) return false;
    return allRecords().some(function (x) { return x.tool === tid && recDate(x.r) === hoy(); });
  }

  /* ─────────────── Onboarding ─────────────── */
  var ob = { mode: "story", i: 0, evalAns: [], nombre: "", acepta: false };
  function showOnb() { $("onb").style.display = "flex"; renderOnb(); }
  function renderOnb() {
    var c = $("onbCard");
    if (ob.mode === "story") {
      var s = STORY[ob.i];
      c.innerHTML =
        '<div class="story-emoji">' + s.e + '</div>' +
        '<h1>' + s.t + '</h1>' +
        '<p class="story-body">' + s.b + '</p>' +
        (s.q ? '<p class="story-quote">“' + esc(s.q) + '”</p>' : "") +
        '<div class="onb-nav">' +
          (ob.i === 0 ? '<button class="onb-skip" id="obSkip">Ya la conozco</button>' : '<button class="onb-skip" id="obPrev">‹ Atrás</button>') +
          '<button class="btn-primary" id="obNext">' + (ob.i === STORY.length - 1 ? "Continuar" : "Siguiente") + '</button>' +
        '</div>' +
        '<div class="onb-dots">' + STORY.map(function (_, k) { return '<i class="' + (k === ob.i ? "on" : "") + '"></i>'; }).join("") + '</div>';
      $("obNext").onclick = function () { if (ob.i < STORY.length - 1) { ob.i++; renderOnb(); } else { ob.mode = "perfil"; renderOnb(); } };
      if ($("obSkip")) $("obSkip").onclick = function () { ob.mode = "perfil"; renderOnb(); };
      if ($("obPrev")) $("obPrev").onclick = function () { ob.i--; renderOnb(); };
    } else if (ob.mode === "perfil") {
      c.innerHTML =
        '<div class="story-emoji">⚓</div><h1>Anclado en mí</h1><p class="onb-brandtag" style="text-align:center">Vuelve a ti</p>' +
        '<label class="fld" style="text-align:left">¿Cómo te llamamos? <span style="font-weight:400">(opcional, solo en tu móvil)</span>' +
        '<input id="obName" class="onb-input" placeholder="Tu nombre" maxlength="24" value="' + esc(ob.nombre) + '"></label>' +
        '<div class="disclaimer" style="text-align:left;margin-bottom:12px"><b>Importante.</b> App de <b>bienestar y psicoeducación</b>. No es un producto sanitario, no diagnostica ni trata, y no sustituye la atención profesional.</div>' +
        '<label class="accept"><input type="checkbox" id="obAcc"> Lo he entendido</label>' +
        '<button class="btn-primary" id="obGo" disabled>Continuar</button>';
      $("obAcc").onchange = function () { $("obGo").disabled = !this.checked; };
      $("obGo").onclick = function () { ob.nombre = $("obName").value.trim(); ob.mode = "eval"; ob.i = 0; ob.evalAns = []; renderOnb(); };
    } else if (ob.mode === "eval") {
      renderEvalStep(c, ob, function (res) {
        A.perfil = { nombre: ob.nombre, aceptado: true, fecha: hoy() };
        A.historiaVista = true;
        A.eval = res;
        A.plan = A.plan || { fase: 1 };
        saveA();
        $("onb").style.display = "none";
        startApp();
        showResultado(res.foco);
      });
    }
  }

  // Motor de evaluación reutilizable (onboarding y re-evaluación)
  function renderEvalStep(container, ctx, onDone) {
    var q = EVAL[ctx.i];
    container.innerHTML =
      '<div class="story-emoji">🧭</div><h2>Un momento para situarte</h2>' +
      '<div class="eval-q">' + esc(q.q) + '</div>' +
      '<div class="likert">' + LIKERT.map(function (l, v) { return '<button data-v="' + v + '">' + l + '</button>'; }).join("") + '</div>' +
      '<div class="eval-progress">' + (ctx.i + 1) + " / " + EVAL.length + '</div>';
    Array.prototype.forEach.call(container.querySelectorAll(".likert button"), function (btn) {
      btn.onclick = function () {
        ctx.evalAns[ctx.i] = Number(btn.getAttribute("data-v"));
        if (ctx.i < EVAL.length - 1) { ctx.i++; renderEvalStep(container, ctx, onDone); }
        else onDone(scoreEval(ctx.evalAns));
      };
    });
  }
  function scoreEval(ans) {
    var acc = { L: [], D: [], C: [] };
    EVAL.forEach(function (q, i) { var v = ans[i]; if (v == null) return; acc[q.ax].push(q.dir < 0 ? (4 - v) : v); });
    function avg(a) { return a.length ? Math.round((a.reduce(function (s, x) { return s + x; }, 0) / a.length) * 2.5 * 10) / 10 : null; }
    var L = avg(acc.L), D = avg(acc.D), C = avg(acc.C);
    var foco = "L", mn = 99; [["L", L], ["D", D], ["C", C]].forEach(function (p) { if (p[1] != null && p[1] < mn) { mn = p[1]; foco = p[0]; } });
    return { fecha: hoy(), L: L, D: D, C: C, foco: foco };
  }
  function showResultado(foco) {
    var rec = FOCO_REC[foco], pr = PRACTICES[rec.practica];
    openSheet(
      '<div class="story-emoji">🌱</div><h2>Tu punto de partida</h2>' +
      '<p class="story-body">' + esc(rec.txt) + '</p>' +
      '<div class="ph-tool" style="cursor:default"><span class="e">' + pr.emoji + '</span><b>' + esc(pr.tit) + '</b></div>' +
      '<p class="muted" style="margin:12px 0 14px">Estás en la <b>Fase 1 · Anclar y bajar la alerta</b>. Te iré sugiriendo el siguiente paso cada día. Puedes avanzar a tu ritmo.</p>' +
      '<button class="btn-primary" id="resGo">Empezar mi primera práctica</button>' +
      '<button class="btn-soft" id="resLater">Ahora no</button>',
      function () {
        $("resGo").onclick = function () { closeSheet(); openPractice(rec.practica); };
        $("resLater").onclick = closeSheet;
      }
    );
  }

  /* ─────────────── App ─────────────── */
  var curView = "hoy";
  function startApp() {
    $("app").style.display = "flex";
    $("hola").textContent = A.perfil && A.perfil.nombre ? "Hola, " + A.perfil.nombre : "Hola";
    wire();
    render();
    scheduleNotifs();
  }
  function render() { renderHoy(); if (curView === "plan") renderPlan(); if (curView === "progreso") renderProgreso(); }

  function suggestion() {
    if (evalDue() && A.eval) return { tipo: "eval" };
    var ph = PHASES[fase() - 1];
    // 1º la recomendada por foco si es de esta fase o siempre; luego la primera no hecha hoy
    var rec = A.eval && FOCO_REC[A.eval.foco] ? FOCO_REC[A.eval.foco].practica : null;
    var order = ph.practicas.slice();
    if (rec && order.indexOf(rec) < 0) order.unshift(rec);
    else if (rec) { order = [rec].concat(order.filter(function (x) { return x !== rec; })); }
    var next = order.filter(function (p) { return !doneToday(p); })[0] || order[0];
    return { tipo: "practica", pid: next };
  }
  function renderHoy() {
    var v = $("view-hoy"), sug = suggestion(), st = streak();
    var heroHTML;
    if (sug.tipo === "eval") {
      heroHTML = '<div class="k">Cada 2 semanas</div><h2>Tu evaluación</h2><p>Han pasado dos semanas. Vuelve a situarte para ver tu evolución.</p><button class="h-btn" id="hEval">Hacer evaluación</button>';
    } else {
      var pr = PRACTICES[sug.pid];
      heroHTML = '<div class="k">Tu momento de hoy · Fase ' + fase() + '</div><h2>' + esc(pr.tit) + '</h2><p>' + esc(pr.why) + '</p>' +
        '<button class="h-btn" id="hGo">Empezar ahora</button>' +
        '<div class="streakline">' + (st > 0 ? "🔥 " + st + (st === 1 ? " día seguido" : " días seguidos") : "Empieza hoy 🌱") + '</div>';
    }
    v.innerHTML = nudgeHTML() + '<div class="hero">' + heroHTML + '</div>' + visitasHTML() +
      '<div style="text-align:center;margin-top:16px"><button class="btn-soft" id="hPlan" style="max-width:280px;margin:0 auto">Ver mi plan completo →</button></div>';
    if ($("hGo")) $("hGo").onclick = function () { openPractice(sug.pid); };
    if ($("hEval")) $("hEval").onclick = openEval;
    if ($("hPlan")) $("hPlan").onclick = function () { switchView("plan"); };
    var ng = $("nudgeGo"); if (ng) ng.onclick = function () { openPractice(_pendPractica); };
    wireVisitas(v);
  }
  function nowHHMM() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function momPractica(m) { return (m && PRACTICES[m.practica]) ? m.practica : "respira"; }
  function pendingMomento() {
    if (!A.rutina) return null;
    var hhmm = nowHHMM();
    var passed = A.rutina.momentos.filter(function (m) { return m.on && m.hora <= hhmm && !doneToday(momPractica(m)); });
    return passed.length ? passed[passed.length - 1] : null;
  }
  function nextMomento() {
    if (!A.rutina) return null;
    var hhmm = nowHHMM();
    var up = A.rutina.momentos.filter(function (m) { return m.on && m.hora > hhmm; });
    return up.length ? up[0] : null;
  }
  var _pendPractica = "respira";
  function nudgeHTML() {
    var m = pendingMomento();
    if (m) {
      _pendPractica = momPractica(m); var pr = PRACTICES[_pendPractica];
      return '<div class="nudge"><div class="nu-txt"><b>' + pr.emoji + " " + esc(m.label) + '</b><span>' + esc(pr.tit) + " · " + esc(pr.why) + '</span></div><button class="nu-go" id="nudgeGo">Vamos</button></div>';
    }
    var nx = nextMomento();
    if (nx && A.rutina.avisos) { var pn = PRACTICES[momPractica(nx)]; return '<div class="nudge soft"><div class="nu-txt"><span>⏰ Próximo: <b>' + esc(nx.label) + " · " + nx.hora + '</b> · ' + esc(pn.tit) + '</span></div></div>'; }
    return "";
  }
  function visitasHTML() {
    var marks = A.visitas[hoy()] || [];
    return '<div class="visitas"><h3>🐒 Visitas al mono</h3><div class="sub">Marca los momentos en que hoy has vuelto a ti. Con cinco visitas breves basta.</div>' +
      MOMENTOS.map(function (m, i) {
        var on = marks.indexOf(i) >= 0;
        return '<div class="visita ' + (on ? "on" : "") + '" data-v="' + i + '"><span class="box">' + (on ? "✓" : "") + '</span><span>' + esc(m) + '</span></div>';
      }).join("") +
      '<div class="count">' + (marks.length ? marks.length + (marks.length === 1 ? " visita hoy · «he vuelto a mí»" : " visitas hoy · «he vuelto a mí»") : "Aún no has visitado al mono hoy") + '</div></div>';
  }
  function wireVisitas(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll(".visita"), function (el) {
      el.onclick = function () {
        var i = Number(el.getAttribute("data-v")); var arr = A.visitas[hoy()] || (A.visitas[hoy()] = []);
        var p = arr.indexOf(i); if (p >= 0) arr.splice(p, 1); else arr.push(i);
        if (!arr.length) delete A.visitas[hoy()]; saveA(); renderHoy();
      };
    });
  }

  function renderPlan() {
    var v = $("view-plan"), cur = fase();
    v.innerHTML = '<h3 class="sec-tit">Tu plan de cambio</h3>' + PHASES.map(function (ph) {
      var estado = ph.n < cur ? "done" : (ph.n === cur ? "cur" : "");
      return '<div class="phase ' + estado + '"><div class="ph-top"><span class="ph-n">Fase ' + ph.n + '</span>' +
        (ph.n === cur ? '<span class="badge">Estás aquí</span>' : (ph.n < cur ? '<span class="badge">Hecha</span>' : "")) + '</div>' +
        '<h3>' + esc(ph.nombre) + '</h3><p class="ph-obj">' + esc(ph.objetivo) + '</p>' +
        '<div class="ph-tools">' + ph.practicas.map(function (pid) { var pr = PRACTICES[pid];
          return '<button class="ph-tool" data-p="' + pid + '"><span class="e">' + pr.emoji + '</span>' + esc(pr.tit) + '</button>'; }).join("") + '</div>' +
        (ph.n === cur && cur < 4 ? '<button class="btn-soft ph-adv" data-adv="1">Me siento listo/a para la siguiente fase →</button>' : "") +
        '</div>';
    }).join("") + '<p class="muted" style="text-align:center;margin-top:14px">El plan es libre: puedes hacer cualquier práctica cuando quieras. Solo te oriento.</p>';
    Array.prototype.forEach.call(v.querySelectorAll(".ph-tool"), function (b) { b.onclick = function () { openPractice(b.getAttribute("data-p")); }; });
    var adv = v.querySelector("[data-adv]"); if (adv) adv.onclick = function () { A.plan.fase = Math.min(4, cur + 1); saveA(); toast("Fase " + A.plan.fase + " desbloqueada"); render(); };
  }

  /* ─────────────── Progreso ─────────────── */
  var chart = null, chart2 = null;
  function renderProgreso() {
    if (chart) { try { chart.destroy(); } catch (e) {} chart = null; }
    if (chart2) { try { chart2.destroy(); } catch (e) {} chart2 = null; }
    var v = $("view-progreso");
    var recs = allRecords(), set = activeDays(), st = streak();
    var nVis = Object.keys(A.visitas).reduce(function (n, d) { return n + (A.visitas[d] || []).length; }, 0);

    var labels = [], counts = [];
    for (var i = 13; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); var key = ymd(d);
      labels.push(key.slice(5)); counts.push((A.visitas[key] || []).length + recs.filter(function (x) { return recDate(x.r) === key; }).length); }

    var mono = { conduce: 0, delante: 0, maletero: 0, lado: 0 }, mtot = 0;
    var PM = { conduce: "conduce", persigo: "delante", persecucion: "delante", sobrepensamiento: "delante", voltaatras: "delante", delante: "delante", maletero: "maletero", allado: "lado", lado: "lado" };
    recs.forEach(function (x) { if (["estado_mono", "donde_esta_mono", "donde_mono"].indexOf(x.tool) < 0) return; var k = PM[x.r.pos || x.r.escena || x.r.modo]; if (k) { mono[k]++; mtot++; } });

    var lastAR = A.amenaza.length ? A.amenaza[A.amenaza.length - 1].v : null;

    v.innerHTML =
      '<div class="p-stats">' +
        '<div class="p-stat"><div class="n">🔥 ' + st + '</div><div class="k">' + (st === 1 ? "día seguido" : "días seguidos") + '</div></div>' +
        '<div class="p-stat"><div class="n">' + recs.length + '</div><div class="k">prácticas</div></div>' +
        '<div class="p-stat"><div class="n">' + nVis + '</div><div class="k">visitas al mono</div></div>' +
      '</div>' +
      '<div class="p-card"><h4>Tu actividad</h4><div class="sub">Presencia (prácticas + visitas) de los últimos 14 días.</div><div class="chart-wrap"><canvas id="cAct"></canvas></div></div>' +
      '<div class="p-card"><h4>De la amenaza al reto</h4><div class="sub">Cómo sientes la vida y los demás. Es el norte de todo el plan.</div>' +
        (A.amenaza.length ? '<div class="chart-wrap" style="height:150px"><canvas id="cAR"></canvas></div>' : '<div class="nodata">Aún sin registros.</div>') +
        '<div class="thermo"><span class="lbl">Amenaza</span><div class="bar"></div><span class="lbl">Reto</span></div>' +
        '<button class="btn-soft" id="btnAR" style="margin-top:12px">' + (lastAR ? "Actualizar cómo lo siento hoy" : "¿Cómo lo siento hoy?") + '</button></div>' +
      (mtot ? '<div class="p-card"><h4>Cómo has llevado tu mente</h4>' + mbars(mono, mtot) + '</div>' : "") +
      (evalDue() && A.eval ? '<div class="eval-cta"><p>Han pasado 2 semanas desde tu última evaluación. ¿Vemos tu evolución?</p><button class="btn-primary" id="ctaEval" style="max-width:240px;margin:0 auto">Hacer evaluación</button></div>' : "");

    if (window.Chart) {
      chart = new Chart($("cAct").getContext("2d"), { type: "bar",
        data: { labels: labels, datasets: [{ data: counts, backgroundColor: "#4f9d8a", borderRadius: 6, maxBarThickness: 18 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } } });
      if (A.amenaza.length && $("cAR")) {
        chart2 = new Chart($("cAR").getContext("2d"), { type: "line",
          data: { labels: A.amenaza.map(function (a) { return a.fecha.slice(5); }), datasets: [{ data: A.amenaza.map(function (a) { return a.v; }), borderColor: "#3a7d6e", backgroundColor: "#3a7d6e", tension: .3, pointRadius: 4, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } } } });
      }
    }
    if ($("btnAR")) $("btnAR").onclick = openThermo;
    if ($("ctaEval")) $("ctaEval").onclick = openEval;
  }
  function mbars(mono, tot) {
    var L = { conduce: "Mente acelerada", delante: "En lucha / juicio", maletero: "Lo escondo", lado: "La acompaño 🙂" };
    var C = { conduce: "#c0584e", delante: "#d98a3d", maletero: "#8d6fb0", lado: "#5f9070" };
    return '<div class="mbars">' + ["conduce", "delante", "maletero", "lado"].map(function (k) {
      var pct = tot ? Math.round(100 * mono[k] / tot) : 0;
      return '<div class="mbar"><span>' + L[k] + '</span><span class="track"><span class="fill" style="width:' + pct + '%;background:' + C[k] + '"></span></span><span class="v">' + mono[k] + '</span></div>';
    }).join("") + '</div>';
  }

  /* ─────────────── Overlays: práctica iframe / mini / historia / sheets ─────────────── */
  var frObs = null;
  function openPractice(pid) {
    var pr = PRACTICES[pid]; if (!pr) return;
    if (pr.kind === "mini") return openMini(pr.mini);
    $("toolTitle").textContent = pr.tit;
    $("toolWhy").textContent = pr.why || "";
    var fr = $("toolFrame");
    fr.onload = function () { var doc; try { doc = fr.contentDocument; } catch (e) { return; } if (!doc) return; consumerCopy(doc);
      try { if (frObs) frObs.disconnect(); frObs = new MutationObserver(function () { consumerCopy(doc); }); frObs.observe(doc.body, { childList: true, subtree: true, characterData: true }); } catch (e) {} };
    fr.src = "../tools-standalone/" + pr.file;
    $("toolOverlay").style.display = "flex";
  }
  function closeTool() { if (frObs) { try { frObs.disconnect(); } catch (e) {} frObs = null; } $("toolOverlay").style.display = "none"; $("toolFrame").src = "about:blank"; render(); }

  // Prácticas nativas guiadas
  var MINIS = {
    sentarse: {
      titulo: "Sentarme junto al mono", toolId: "sentarse_mono", toolName: "Sentarme junto al mono", done: "🧘 Te has sentado junto al mono",
      pasos: [
        { n: "1 · Para", h: "Respira y aterriza", p: "Tres respiraciones lentas. Inhala por la nariz unos segundos, suelta el aire despacio por la boca, como si saliera por una pajita. Sin prisa.", orb: true },
        { n: "2 · Siente", h: "Mira hacia dentro", p: "Lleva la atención al pecho, la barriga o el cuello. ¿Dónde notas algo? No lo cambies: solo acompáñalo unos segundos. «No sé por qué, pero lo noto aquí.»" },
        { n: "3 · Acompaña", h: "Valida al mono", p: "Háblale con respeto, como a alguien que tiene miedo: «Está bien sentir esto. Tengo derecho a sentirme así. No estás solo.»" },
        { n: "4 · Actúa", h: "Una microacción con valor", p: "Desde esa calma, elige el paso más pequeño que vaya en la dirección de quien quieres ser. Pequeño, concreto y posible ahora.", input: true }
      ]
    },
    respira: {
      titulo: "Respiración curiosa", toolId: "respiracion_curiosa", toolName: "Respiración curiosa", done: "🫁 Un minuto de presencia. Bien.",
      pasos: [
        { n: "1 · Para", h: "Para el pensamiento", p: "Di «STOP» por dentro. Corta el piloto automático un segundo. No tienes que resolver nada ahora mismo." },
        { n: "2 · Respira con curiosidad", h: "Una respiración, como la primera vez", p: "Inhala despacio y observa el aire con curiosidad: ¿por dónde entra?, ¿frío o tibio?, ¿hasta dónde llega? No lo cambies: solo míralo por dentro.", orb: true },
        { n: "3 · Aquí y ahora", h: "Vuelve al presente", p: "Nombra 3 cosas que ves, 2 que oyes y 1 que sientes en el cuerpo. Estás aquí. Estás contigo." }
      ]
    }
  };
  var miniKey = "sentarse", miniI = 0, miniAcc = "", orbT = null;
  function openMini(key) { miniKey = key || "sentarse"; miniI = 0; miniAcc = ""; $("miniOverlay").style.display = "flex"; renderMini(); }
  function renderMini() {
    var def = MINIS[miniKey], s = def.pasos[miniI], last = miniI === def.pasos.length - 1;
    $("miniTitle").textContent = def.titulo;
    $("miniBody").innerHTML = '<div class="mini-step"><div class="m-n">' + s.n + '</div><h2>' + esc(s.h) + '</h2>' +
      (s.orb ? '<div class="mini-orb" id="orb">🫁</div>' : "") +
      '<p>' + esc(s.p) + '</p>' +
      (s.input ? '<input class="mini-input" id="miniIn" placeholder="Mi microacción de hoy…">' : "") +
      '<button class="btn-primary" id="miniNext">' + (last ? "Terminar" : "Siguiente") + '</button>' +
      (miniI > 0 ? '<button class="btn-soft" id="miniPrev">‹ Atrás</button>' : "") + '</div>';
    if (orbT) { clearInterval(orbT); orbT = null; }
    if (s.orb) { var o = $("orb"); var big = false; orbT = setInterval(function () { big = !big; o.classList.toggle("big", big); }, 4000); }
    $("miniNext").onclick = function () {
      if (s.input) miniAcc = ($("miniIn").value || "").trim();
      if (last) finishMini(); else { miniI++; renderMini(); }
    };
    if ($("miniPrev")) $("miniPrev").onclick = function () { miniI--; renderMini(); };
  }
  function finishMini() {
    if (orbT) { clearInterval(orbT); orbT = null; }
    var def = MINIS[miniKey];
    try { if (window.Aprens) { Aprens.config({ toolId: def.toolId, toolName: def.toolName, toolVersion: 1 }); Aprens.save({ id: Date.now(), date: hoy(), ts: Date.now(), param: "densidad", microaccion: miniAcc }); } } catch (e) {}
    $("miniOverlay").style.display = "none";
    toast(def.done);
    render();
  }

  function openHist() {
    $("histBody").innerHTML = HIST.map(function (h) {
      return '<div class="hist-card"><div class="k">' + esc(h.k) + '</div><h3>' + esc(h.t) + '</h3><p>' + esc(h.p) + '</p>' + (h.q ? '<p class="q">“' + esc(h.q) + '”</p>' : "") + '</div>';
    }).join("") + '<p class="muted" style="text-align:center;margin-top:6px">«¿Quién conduce tu vida?» · Tòfol Villalonga · aprens.es</p>';
    $("histOverlay").style.display = "flex";
  }

  function openSheet(html, after) { $("sheetCard").innerHTML = html; $("sheet").style.display = "flex"; if (after) after(); }
  function closeSheet() { $("sheet").style.display = "none"; }
  function openEval() {
    var ctx = { i: 0, evalAns: [] };
    openSheet("<div id='evalHost'></div>", function () {
      renderEvalStep($("evalHost"), ctx, function (res) {
        var prev = A.eval; A.eval = res; saveA(); closeSheet();
        var delta = prev ? ((res.L + res.D + res.C) - (prev.L + prev.D + prev.C)) : 0;
        toast(prev ? (delta >= 0 ? "Evolución guardada · vas hacia arriba 🌱" : "Evolución guardada") : "Evaluación guardada");
        render();
      });
    });
  }
  function openThermo() {
    openSheet(
      '<div class="story-emoji">🌗</div><h2>De la amenaza al reto</h2>' +
      '<p class="story-body">Ahora mismo, la vida y los demás los siento más como…</p>' +
      '<div class="likert" id="arOpts">' +
        [["1", "Una amenaza constante"], ["2", "Más amenaza que reto"], ["3", "A ratos"], ["4", "Más reto que amenaza"], ["5", "Un reto que puedo habitar"]]
          .map(function (o) { return '<button data-v="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div>',
      function () {
        Array.prototype.forEach.call($("arOpts").querySelectorAll("button"), function (b) {
          b.onclick = function () { A.amenaza.push({ fecha: hoy(), v: Number(b.getAttribute("data-v")) }); saveA(); closeSheet(); toast("Registrado · gracias por escucharte"); render(); };
        });
      }
    );
  }

  /* ─────────────── Modo consumer: limpiar copy clínico del iframe ─────────────── */
  var REPS = [
    [/📱\s*Enviar a mi psic[oó]logo\/?a?/gi, "📤 Compartir"], [/Enviar a mi psic[oó]logo\/?a?/gi, "Compartir"],
    [/📤?\s*Enviar al panel \(\.json\)/gi, "📤 Guardar (.json)"], [/⬇\s*Archivo \.json/gi, "⬇ Guardar (.json)"],
    [/;?\s*abajo puedes enviar el resultado al panel de tu psic[oó]logo\.?/gi, "."],
    [/\bLo trabajar[eé]is juntos en la sesi[oó]n\.?/gi, ""],
    [/te lo llevar[aá]s a la sesi[oó]n para trabajarlo con tu psic[oó]logo\/?a?\.?/gi, "es solo para ti."],
    [/enviar a tu psic[oó]logo\/?a?/gi, "guardarlo o compartirlo"],
    [/no sustituye el trabajo con tu psic[oó]logo\/?a?/gi, "no sustituye la ayuda profesional"],
    [/Nota para revisar en sesi[oó]n:?/gi, "Para ti:"], [/junto a tu psic[oó]logo\/?a?/gi, "con calma"],
    [/con tu psic[oó]logo\/?a?/gi, "contigo"], [/a tu psic[oó]logo\/?a?/gi, "para ti"],
    [/tu psic[oó]logo\/?a?/gi, "ti"], [/psic[oó]logo\/?a?|psic[oó]loga/gi, "un profesional"],
    [/APRENS Psicolog[ií]a?/gi, "Anclado en mí"],
    [/\ben la sesi[oó]n\b|\ba la sesi[oó]n\b|\ben sesi[oó]n\b/gi, "cuando quieras"], [/el panel de tu \w+/gi, "tu espacio"]
  ];
  var sweeping = false;
  function consumerCopy(doc) {
    if (sweeping || !doc || !doc.body) return; sweeping = true;
    try {
      var cod = doc.getElementById("aprensCod"); if (cod) { cod.style.display = "none"; cod.placeholder = ""; }
      var w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = w.nextNode())) nodes.push(n);
      nodes.forEach(function (t) { var s = t.nodeValue, o = s; REPS.forEach(function (r) { s = s.replace(r[0], r[1]); }); if (s !== o) t.nodeValue = s; });
    } catch (e) {} finally { sweeping = false; }
  }

  /* ─────────────── Rutina diaria + avisos ─────────────── */
  // Nativo (Capacitor) → notificaciones locales REALES y repetidas (app cerrada).
  // Web (PWA) → best-effort con setTimeout mientras la app está abierta.
  function isNative() { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
  var notifTimers = [];
  function scheduleNotifs() {
    notifTimers.forEach(clearTimeout); notifTimers = [];
    if (!A.rutina || !A.rutina.avisos) return;
    if (isNative()) { scheduleNative(); return; }
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    var now = new Date();
    A.rutina.momentos.filter(function (m) { return m.on; }).forEach(function (m) {
      var pr = m.hora.split(":"), t = new Date(); t.setHours(+pr[0], +pr[1], 0, 0);
      var ms = t - now;
      if (ms > 0 && ms < 24 * 3600000) notifTimers.push(setTimeout(function () {
        try { var pr = PRACTICES[momPractica(m)]; new Notification("Anclado en mí", { body: m.label + ": " + pr.tit + " " + pr.emoji, tag: "anclado" }); } catch (e) {}
      }, ms));
    });
  }
  function scheduleNative() {
    try {
      var LN = window.Capacitor.Plugins.LocalNotifications;
      if (!LN) return;
      LN.requestPermissions().then(function () {
        return LN.getPending().then(function (p) {
          var old = (p && p.notifications) || [];
          if (old.length) return LN.cancel({ notifications: old.map(function (n) { return { id: n.id }; }) });
        }).catch(function () {});
      }).then(function () {
        var notifs = [];
        A.rutina.momentos.filter(function (m) { return m.on; }).forEach(function (m, i) {
          var hm = m.hora.split(":"), pr = PRACTICES[momPractica(m)];
          notifs.push({ id: 1000 + i, title: "Anclado en mí", body: m.label + ": " + pr.tit + " " + pr.emoji,
            schedule: { on: { hour: +hm[0], minute: +hm[1] }, repeats: true }, smallIcon: "ic_stat_icon" });
        });
        if (notifs.length) return LN.schedule({ notifications: notifs });
      }).catch(function () {});
    } catch (e) {}
  }
  function readRutinaDOM() {
    var list = $("ruList"); if (!list) return;
    A.rutina.momentos.forEach(function (m, i) {
      var on = list.querySelector('[data-on="' + i + '"]'); if (on) m.on = on.checked;
      var lb = list.querySelector('[data-label="' + i + '"]'); if (lb) m.label = lb.value.trim() || m.label;
      var ho = list.querySelector('[data-hora="' + i + '"]'); if (ho) m.hora = ho.value || m.hora;
      var pr = list.querySelector('[data-pr="' + i + '"]'); if (pr) m.practica = pr.value || m.practica;
    });
  }
  function openRutina() {
    var r = A.rutina;
    $("rutinaCard").innerHTML =
      '<button class="modal-x" id="ruClose">✕</button><h2>⏰ Mi rutina diaria</h2>' +
      '<p class="muted">Tus momentos del día: en cada uno, una práctica breve para volver a ti. Practicar cada día —también en calma— es lo que entrena al conductor.</p>' +
      '<label class="accept" style="margin:14px 0 6px"><input type="checkbox" id="ruAvisos" ' + (r.avisos ? "checked" : "") + '> Avisarme en el móvil a esas horas</label>' +
      '<div class="ru-note">En la web los avisos solo llegan con la app abierta. La app instalada del móvil (Fase nativa) los hará <b>siempre</b>, aunque esté cerrada.</div>' +
      '<div id="ruList" style="margin-top:12px">' + (r.momentos.length ? r.momentos.map(function (m, i) {
        var opts = Object.keys(PRACTICES).map(function (k) {
          return '<option value="' + k + '"' + (momPractica(m) === k ? " selected" : "") + '>' + PRACTICES[k].emoji + " " + esc(PRACTICES[k].tit) + '</option>';
        }).join("");
        return '<div class="ru-row"><div class="ru-top">' +
          '<input type="checkbox" data-on="' + i + '" ' + (m.on ? "checked" : "") + '>' +
          '<input class="ru-label" type="text" data-label="' + i + '" value="' + esc(m.label) + '" placeholder="Momento" maxlength="28">' +
          '<input type="time" data-hora="' + i + '" value="' + m.hora + '">' +
          '<button class="ru-del" data-del="' + i + '" title="Quitar momento">✕</button></div>' +
          '<select class="ru-pr" data-pr="' + i + '">' + opts + '</select></div>';
      }).join("") : '<p class="muted" style="text-align:center;padding:10px">Aún no hay momentos. Añade el primero 👇</p>') + '</div>' +
      '<button class="btn-soft" id="ruAdd">＋ Añadir momento</button>' +
      '<button class="btn-primary" id="ruSave" style="margin-top:10px">Guardar</button>';
    $("rutina").style.display = "flex";
    $("ruClose").onclick = function () { $("rutina").style.display = "none"; };
    $("ruAdd").onclick = function () {
      readRutinaDOM();
      if (A.rutina.momentos.length >= 12) { toast("Máximo 12 momentos"); return; }
      A.rutina.momentos.push({ label: "Nuevo momento", hora: "12:00", on: true, practica: "respira" });
      openRutina();
    };
    Array.prototype.forEach.call($("ruList").querySelectorAll("[data-del]"), function (btn) {
      btn.onclick = function () { readRutinaDOM(); A.rutina.momentos.splice(Number(btn.getAttribute("data-del")), 1); openRutina(); };
    });
    $("ruSave").onclick = function () {
      readRutinaDOM();
      var quiere = $("ruAvisos").checked;
      var done = function (ok) { A.rutina.avisos = ok; saveA(); scheduleNotifs(); $("rutina").style.display = "none"; toast(ok ? "Avisos activados" : "Rutina guardada"); render(); };
      if (!quiere) return done(false);
      if (isNative()) return done(true);                          // nativo: pide permiso al programar
      if (typeof Notification === "undefined") return done(false);
      if (Notification.permission === "granted") return done(true);
      Notification.requestPermission().then(function (p) { done(p === "granted"); });
    };
  }

  /* ─────────────── Nav / ajustes ─────────────── */
  function switchView(view) {
    curView = view;
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t) { t.classList.toggle("active", t.getAttribute("data-view") === view); });
    Array.prototype.forEach.call(document.querySelectorAll(".view"), function (v) { v.style.display = "none"; });
    $("view-" + view).style.display = "block";
    if (view === "plan") renderPlan(); if (view === "progreso") renderProgreso(); if (view === "hoy") renderHoy();
  }
  function wire() {
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) { tab.onclick = function () { switchView(tab.getAttribute("data-view")); }; });
    $("toolBack").onclick = closeTool;
    $("miniBack").onclick = function () { if (orbT) { clearInterval(orbT); orbT = null; } $("miniOverlay").style.display = "none"; };
    $("histBack").onclick = function () { $("histOverlay").style.display = "none"; };
    $("btnAjustes").onclick = function () { $("ajName").value = (A.perfil && A.perfil.nombre) || ""; $("ajustes").style.display = "flex"; };
    $("ajClose").onclick = function () { $("ajustes").style.display = "none"; };
    $("ajSave").onclick = function () { A.perfil = A.perfil || {}; A.perfil.nombre = $("ajName").value.trim(); saveA(); $("ajustes").style.display = "none"; $("hola").textContent = A.perfil.nombre ? "Hola, " + A.perfil.nombre : "Hola"; render(); };
    $("ajHist").onclick = function () { $("ajustes").style.display = "none"; openHist(); };
    $("ajRutina").onclick = function () { $("ajustes").style.display = "none"; openRutina(); };
    $("ajEval").onclick = function () { $("ajustes").style.display = "none"; openEval(); };
    $("ajReset").onclick = function () { if (confirm("Esto borra tu perfil y tu plan en este dispositivo (tus prácticas se conservan). ¿Continuar?")) { localStorage.removeItem(AK); localStorage.removeItem("aprens_bienestar_perfil"); location.reload(); } };
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (A.perfil && A.perfil.aceptado) startApp(); else showOnb();
  });
  window.APRENS_ANCLADO = { _A: function () { return A; }, _sug: function () { return suggestion(); } };
})();
