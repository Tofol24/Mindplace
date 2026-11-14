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
   Bilingüe castellano / català (ver i18n.js): los textos van en L(es, ca).
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MB = window.MB || { lang: "es", L: function (es) { return es; }, onChange: function () {} };
  var L = MB.L;

  var TOOL = "mision_barrio";
  var SEED_FLAG = "mision_barrio_seeded_v1";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "Misión Barrio", toolVersion: 1 });

  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var _uidc = 0;
  function uid(pre) { _uidc++; return pre + Date.now() + "_" + _uidc; }
  function plural(n, es1, esN, ca1, caN) { return n === 1 ? L(es1, ca1) : L(esN, caN); }

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

  /* ---------- niveles y premios de ejemplo (editables, en el idioma activo) ---------- */
  function seedNiveles() {
    return [
      { dificultad: 1, titulo: L("Bajar a comprar el pan mientras mamá o papá espera en el portal", "Baixar a comprar el pa mentre mamà o papà espera al portal"), tiempo: "10 min", cuando: L("de día", "de dia"), donde: L("la panadería", "el forn"), conQuien: L("yo solo", "tot sol"), adulto: L("en el portal", "al portal"), xp: 20 },
      { dificultad: 2, titulo: L("Ir solo a la tienda de la esquina y volver", "Anar tot sol a la botiga de la cantonada i tornar"), tiempo: "15 min", cuando: L("de día", "de dia"), donde: L("la tienda de la esquina", "la botiga de la cantonada"), conQuien: L("yo solo", "tot sol"), adulto: L("en casa", "a casa"), xp: 25 },
      { dificultad: 3, titulo: L("Quedar con un amigo en el parque, con un adulto en un banco lejos", "Quedar amb un amic al parc, amb un adult a un banc lluny"), tiempo: "30 min", cuando: L("de día", "de dia"), donde: L("el parque", "el parc"), conQuien: L("con un amigo", "amb un amic"), adulto: L("en un banco, lejos", "a un banc, lluny"), xp: 30 },
      { dificultad: 4, titulo: L("Quedar con amigos en el parque: me acompañan, se van y vuelven a buscarme", "Quedar amb els amics al parc: m'acompanyen, se'n van i tornen a cercar-me"), tiempo: "45 min", cuando: L("de día", "de dia"), donde: L("el parque", "el parc"), conQuien: L("con mis amigos", "amb els meus amics"), adulto: L("en casa", "a casa"), xp: 40 },
      { dificultad: 5, titulo: L("Ir y volver yo solo al parque y quedarme con mis amigos", "Anar i tornar tot sol al parc i quedar-m'hi amb els meus amics"), tiempo: "1 h", cuando: L("de día", "de dia"), donde: L("el parque", "el parc"), conQuien: L("con mis amigos", "amb els meus amics"), adulto: L("en casa", "a casa"), xp: 50 },
      { dificultad: 6, titulo: L("Salir con mis amigos por el barrio", "Sortir amb els meus amics pel barri"), tiempo: "1 h", cuando: L("por la tarde", "horabaixa"), donde: L("el barrio", "el barri"), conQuien: L("con mis amigos", "amb els meus amics"), adulto: L("en casa", "a casa"), xp: 60 },
      { dificultad: 7, titulo: L("Salir con mis amigos y volver cuando empieza a oscurecer", "Sortir amb els meus amics i tornar quan comença a fer-se fosc"), tiempo: "1 h 30", cuando: L("al anochecer", "al vespre"), donde: L("el barrio", "el barri"), conQuien: L("con mis amigos", "amb els meus amics"), adulto: L("en casa", "a casa"), xp: 70 },
      { dificultad: 8, titulo: L("Salir con la banda y volver ya de noche, a la hora pactada", "Sortir amb la colla i tornar ja de nit, a l'hora pactada"), tiempo: "1 h 30", cuando: L("de noche", "de nit"), donde: L("el barrio", "el barri"), conQuien: L("con mis amigos", "amb els meus amics"), adulto: L("en casa", "a casa"), xp: 100, jefe: true }
    ];
  }
  function seedPremios() {
    return [
      { emoji: "🍕", nombre: L("Elegir la cena del viernes", "Triar el sopar del divendres"), coste: 30 },
      { emoji: "🎬", nombre: L("Peli y palomitas: eliges tú", "Pel·li i crispetes: tries tu"), coste: 60 },
      { emoji: "⚽", nombre: L("Plan especial con papá o mamá (partido, bici…)", "Pla especial amb papà o mamà (partit, bici…)"), coste: 100 },
      { emoji: "🏆", nombre: L("Gran premio que pactemos juntos", "Gran premi que pactem junts"), coste: 200 }
    ];
  }
  function crearNivel(n, i) {
    return saveRec({ id: uid("niv_"), kind: "nivel", ts: Date.now() + (i || 0), dificultad: n.dificultad, titulo: n.titulo,
      tiempo: n.tiempo || "", cuando: n.cuando || "", donde: n.donde || "", conQuien: n.conQuien || "", adulto: n.adulto || "",
      xp: Number(n.xp) || 20, jefe: !!n.jefe });
  }
  function crearPremio(p, i) { return saveRec({ id: uid("pre_"), kind: "premio", ts: Date.now() + (i || 0), emoji: p.emoji || "🎁", nombre: p.nombre, coste: Number(p.coste) || 10 }); }
  function seedIfEmpty() {
    var seeded = false; try { seeded = localStorage.getItem(SEED_FLAG) === "1"; } catch (e) {}
    if (!seeded && getNiveles().length === 0) {
      seedNiveles().forEach(crearNivel);
      if (!getPremios().length) seedPremios().forEach(crearPremio);
      try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    }
  }
  function resetNiveles() {
    getNiveles().forEach(function (n) { removeRecord(n.id); });
    seedNiveles().forEach(crearNivel);
    closeEditor(); renderAll();
  }

  /* ---------- contenidos ---------- */
  var AVATARES = ["🦊", "🐺", "🦁", "🐯", "🐉", "🦅", "🤖", "🧑‍🚀", "🥷", "⚽", "🛹", "🚲"];
  function rangos() {
    return [
      { min: 0, t: L("Novato del barrio", "Novell del barri") }, { min: 50, t: L("Aventurero", "Aventurer") }, { min: 150, t: L("Explorador urbano", "Explorador urbà") },
      { min: 300, t: L("Capitán del barrio", "Capità del barri") }, { min: 500, t: L("Leyenda del barrio", "Llegenda del barri") }
    ];
  }
  function frases() {
    return [
      L("Me cuesta, y lo estoy haciendo.", "Em costa, i ho estic fent."),
      L("Mi alarma suena fuerte, pero el mando lo llevo yo.", "La meva alarma sona fort, però el comandament el duc jo."),
      L("No tengo que estar tranquilo para ser valiente.", "No he d'estar tranquil per ser valent."),
      L("Equivocarse también es entrenar.", "Equivocar-se també és entrenar."),
      L("Nivel a nivel, como en los videojuegos.", "Nivell a nivell, com als videojocs.")
    ];
  }
  function poderes() {
    return [
      { id: "balon", ico: "🎈", t: L("El balón", "El globus"), d: L("Hincho la barriga despacio y la deshincho más despacio todavía.", "Infl la panxa a poc a poc i la desinfl encara més a poc a poc.") },
      { id: "radar", ico: "📡", t: L("El radar del cuerpo", "El radar del cos"), d: L("Encuentro dónde suena la alarma y le hago compañía.", "Trob on sona l'alarma i li faig companyia.") },
      { id: "comentarista", ico: "🎙️", t: L("El comentarista", "El comentarista"), d: L("Cambio «yo no puedo» por una frase de campeón.", "Canvii «no puc» per una frase de campió.") },
      { id: "detective", ico: "🕵️", t: L("El detective", "El detectiu"), d: L("Me pregunto: ¿qué es lo más probable que pase?", "Em deman: què és el més probable que passi?") }
    ];
  }
  function alarmas() {
    return [L("Que me pase algo malo", "Que em passi qualque cosa dolenta"), L("Que alguien me haga daño", "Que algú em faci mal"), L("Que me pierda", "Que em perdi"),
      L("Que me agobie y no pueda", "Que m'angoixi i no pugui"), L("Que se rían de mí", "Que es riguin de mi"), L("Que mis amigos no quieran estar conmigo", "Que els meus amics no vulguin estar amb mi")];
  }
  function zonas() { return [L("Barriga", "Panxa"), L("Pecho", "Pit"), L("Garganta", "Gola"), L("Cara caliente", "Cara calenta"), L("Piernas", "Cames"), L("Manos", "Mans"), L("Cabeza", "Cap")]; }
  var CROMOS = [
    { id: "primer", e: "🚪", t: ["Primer paso", "Primer pas"], d: ["Tu primera misión", "La teva primera missió"], ok: function (s) { return s.length >= 1; } },
    { id: "final", e: "🏁", t: ["Hasta el final", "Fins al final"], d: ["Te quedas hasta el final", "T'hi quedes fins al final"], ok: function (s) { return s.some(function (x) { return x.final === "si"; }); } },
    { id: "balon", e: "🎈", t: ["Pulmones de acero", "Pulmons d'acer"], d: ["Usas el balón en 3 misiones", "Fas servir el globus a 3 missions"], ok: function (s) { return cuentaPoder(s, "balon") >= 3; } },
    { id: "radar", e: "📡", t: ["Radar activado", "Radar activat"], d: ["Encuentras la alarma en tu cuerpo", "Trobes l'alarma al teu cos"], ok: function (s) { return s.some(function (x) { return x.zonas && x.zonas.length; }); } },
    { id: "comenta", e: "🎙️", t: ["Voz de campeón", "Veu de campió"], d: ["Usas el comentarista en 3 misiones", "Fas servir el comentarista a 3 missions"], ok: function (s) { return cuentaPoder(s, "comentarista") >= 3; } },
    { id: "falsa", e: "🕵️", t: ["Cazador de falsas alarmas", "Caçador de falses alarmes"], d: ["La alarma se equivoca 3 veces", "L'alarma s'equivoca 3 vegades"], ok: function (s) { return s.filter(function (x) { return x.realidad === "no"; }).length >= 3; } },
    { id: "valiente", e: "💪", t: ["Valiente con miedo", "Valent amb por"], d: ["Sales con la alarma en 7 o más", "Surts amb l'alarma a 7 o més"], ok: function (s) { return s.some(function (x) { return x.antes != null && x.antes >= 7 && x.final === "si"; }); } },
    { id: "cinco", e: "🔥", t: ["Racha de 5", "Ratxa de 5"], d: ["5 misiones completadas", "5 missions completades"], ok: function (s) { return s.filter(function (x) { return x.final === "si"; }).length >= 5; } },
    { id: "rey", e: "👑", t: ["Rey del nivel", "Rei del nivell"], d: ["Dominas un nivel (3 victorias)", "Domines un nivell (3 victòries)"], ok: function () { return getNiveles().some(function (n) { return victoriasDe(n.id) >= 3; }); } },
    { id: "noche", e: "🌙", t: ["Explorador nocturno", "Explorador nocturn"], d: ["Superas una misión al anochecer o de noche", "Superes una missió al vespre o de nit"], ok: function (s) { return s.some(function (x) { return x.final === "si" && /noche|anochec|oscur|nit|vespre|fosc/i.test(x.cuando || ""); }); } },
    { id: "diez", e: "⭐", t: ["Diez misiones", "Deu missions"], d: ["10 misiones completadas", "10 missions completades"], ok: function (s) { return s.filter(function (x) { return x.final === "si"; }).length >= 10; } },
    { id: "jefe", e: "🐉", t: ["Jefe final", "Boss final"], d: ["Superas el último nivel", "Superes el darrer nivell"], ok: function () { var ns = getNiveles(); var j = ns.filter(function (n) { return n.jefe; })[0] || ns[ns.length - 1]; return !!j && victoriasDe(j.id) >= 1; } }
  ];
  function ct(c, k) { return L(c[k][0], c[k][1]); }
  function cuentaPoder(s, id) { return s.filter(function (x) { return x.poderes && x.poderes.indexOf(id) >= 0; }).length; }
  function cromosConseguidos() { var s = getSalidas(); return CROMOS.filter(function (c) { return c.ok(s); }).map(function (c) { return c.id; }); }

  /* ---------- XP ---------- */
  function xpGanado() { return getSalidas().reduce(function (t, s) { return t + (Number(s.xp) || 0); }, 0); }
  function xpGastado() { return getCanjes().reduce(function (t, c) { return t + (Number(c.coste) || 0); }, 0); }
  function rangoDe(xp) { var R = rangos(), r = R[0], sig = null; R.forEach(function (x, i) { if (xp >= x.min) { r = x; sig = R[i + 1] || null; } }); return { r: r, sig: sig }; }

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
        '<div class="player-name">' + esc(p.apodo || L("Jugador misterioso", "Jugador misteriós")) + '</div>' +
        '<div class="player-stats">' + xp + L(" XP ganados · ", " XP guanyats · ") + disp + L(" para gastar · ", " per gastar · ") + completadas + L(" misiones · ", " missions · ") + cromosConseguidos().length + '/' + CROMOS.length + ' cromos</div></div></div>' +
      '<div class="xpbar" role="progressbar" aria-label="' + L("Progreso hacia el siguiente rango", "Progrés cap al rang següent") + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="xpcap"><span>' + esc(rg.r.t) + '</span><span>' + (rg.sig ? L("Faltan ", "Falten ") + (rg.sig.min - xp) + L(" XP para ", " XP per a ") + esc(rg.sig.t) : L("¡Rango máximo!", "Rang màxim!")) + '</span></div>' +
      '<label for="apodo">' + L("Tu nombre de jugador", "El teu nom de jugador") + '</label>' +
      '<input type="text" id="apodo" maxlength="20" placeholder="' + L("Rayo, El Capi, Lobo…", "Llamp, El Capi, Llop…") + '" value="' + esc(p.apodo) + '">' +
      '<div class="avatares" role="group" aria-label="' + L("Elige tu personaje", "Tria el teu personatge") + '">' +
        AVATARES.map(function (a) { return '<button type="button" class="av" data-a="' + a + '" aria-pressed="' + (a === p.avatar) + '" aria-label="' + L("Personaje ", "Personatge ") + a + '">' + a + '</button>'; }).join("") +
      '</div>';
    $$(".av", playerBox).forEach(function (b) {
      b.addEventListener("click", function () { var pf = getPerfil(); pf.avatar = b.getAttribute("data-a"); saveRec(pf); renderPlayer(); });
    });
    $("#apodo").addEventListener("change", function () { var pf = getPerfil(); pf.apodo = (this.value || "").trim().slice(0, 20); saveRec(pf); renderPlayer(); });
  }

  /* ============================================================
     SUPERPODERES · balón y frases
     ============================================================ */
  function renderFrases() { $("#frasesList").innerHTML = frases().map(function (f) { return "<li>«" + esc(f) + "»</li>"; }).join(""); }
  /* El globo se mueve con requestAnimationFrame (no con transiciones CSS), para
     que se infle y desinfle de forma continua también con «Reducir movimiento».
     Ritmo: inspira 4 s · mantén 1 s · espira 6 s · descansa 1,5 s · 3 veces.
     Pequeño y algo alargado cuando está vacío; redondo y brillante cuando está lleno. */
  var FASES = [
    { k: "in", ms: 4000, de: 0.42, a: 1 },
    { k: "hold", ms: 1000, de: 1, a: 1 },
    { k: "out", ms: 6000, de: 1, a: 0.42 },
    { k: "rest", ms: 1500, de: 0.42, a: 0.42 }
  ];
  var CICLOS = 3, balonRAF = null;
  function faseTxt(k, seg, ciclo) {
    if (k === "in") return L("Coge aire por la nariz… ", "Agafa aire pel nas… ") + seg + " (" + ciclo + "/" + CICLOS + ")";
    if (k === "hold") return L("Mantén un momento…", "Aguanta un moment…");
    if (k === "out") return L("Suéltalo despacito por la boca… ", "Deixa'l anar a poc a poc per la boca… ") + seg;
    return L("Descansa…", "Descansa…");
  }
  function dibujaBalon(s, t) {
    var sx = s, sy = s * (1 + 0.14 * (1 - s));               // vacío: más estrecho y alargado
    var bam = Math.sin(t / 380) * 2.2 * s;                    // se balancea un poco
    var cos = $("#balonCos"); if (!cos) return;
    cos.setAttribute("transform", "rotate(" + bam.toFixed(2) + " 60 118) translate(60 118) scale(" + sx.toFixed(3) + " " + sy.toFixed(3) + ") translate(-60 -118)");
    $("#balonBrillo").setAttribute("opacity", (0.2 + 0.45 * s).toFixed(2));
    $("#balonFil").setAttribute("d", "M60 118 C " + (52 - bam * 2).toFixed(1) + " 132, " + (68 + bam * 2).toFixed(1) + " 146, 58 168");
  }
  function suave(x) { return 0.5 - 0.5 * Math.cos(Math.PI * x); }
  function balonReset() {
    if (balonRAF) { cancelAnimationFrame(balonRAF); balonRAF = null; }
    dibujaBalon(0.42, 0); $("#balonProg").style.width = "0";
    $("#balonTxt").textContent = L("Pulsa para entrenar", "Prem per entrenar"); $("#balonBtn").textContent = L("Entrenar el balón", "Entrenar el globus");
  }
  $("#balonBtn").addEventListener("click", function () {
    var t = $("#balonTxt"), btn = this, prog = $("#balonProg");
    if (balonRAF) { balonReset(); return; }
    btn.textContent = L("Parar", "Aturar");
    var total = FASES.reduce(function (x, f) { return x + f.ms; }, 0), t0 = null, ultimo = "";
    function frame(now) {
      if (t0 == null) t0 = now;
      var el = now - t0, ciclo = Math.floor(el / total);
      if (ciclo >= CICLOS) {
        balonRAF = null; dibujaBalon(0.42, 0); prog.style.width = "100%";
        t.textContent = L("¡Tres balones! Superpoder cargado 💪", "Tres globus! Superpoder carregat 💪"); btn.textContent = L("Otra vez", "Una altra vegada");
        return;
      }
      var r = el - ciclo * total, i = 0;
      while (r >= FASES[i].ms) { r -= FASES[i].ms; i++; }
      var f = FASES[i], x = r / f.ms, s = f.de + (f.a - f.de) * suave(x);
      dibujaBalon(s, now);
      prog.style.width = ((el % total) / total * 100).toFixed(1) + "%";
      var txt = faseTxt(f.k, Math.min(Math.floor(r / 1000) + 1, Math.round(f.ms / 1000)), ciclo + 1);
      if (txt !== ultimo) { t.textContent = txt; ultimo = txt; }
      balonRAF = requestAnimationFrame(frame);
    }
    balonRAF = requestAnimationFrame(frame);
  });
  dibujaBalon(0.42, 0);

  /* ============================================================
     MAPA DE NIVELES
     ============================================================ */
  var nivelesBox = $("#niveles"), editor = $("#nivelEditor");
  function chip(label, val) { return val ? '<span class="chip">' + label + ' <b>' + esc(val) + '</b></span>' : ""; }
  function chipsNivel(n) { return chip("⏱", n.tiempo) + chip("🌗", n.cuando) + chip("📍", n.donde) + chip("👥", n.conQuien) + chip(L("🏠 Adulto:", "🏠 Adult:"), n.adulto); }
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
    if (!lista.length) { nivelesBox.innerHTML = '<p class="lead">' + L("No hay niveles. Añade el primero o restaura el ejemplo.", "No hi ha nivells. Afegeix el primer o restaura l'exemple.") + '</p>'; return; }
    var EST = { dominado: L("¡Dominado!", "Dominat!"), hecho: L("Superado", "Superat"), disp: L("¡Te toca!", "Et toca!"), bloq: L("Bloqueado", "Bloquejat") };
    nivelesBox.innerHTML = lista.map(function (x) {
      var n = x.n, num = x.i + 1;
      var nodo = x.est === "dominado" ? "👑" : x.est === "hecho" ? "✓" : x.est === "bloq" ? "🔒" : (n.jefe ? "🐉" : num);
      var etiqueta = n.jefe ? L("Jefe final", "Boss final") : L("Nivel ", "Nivell ") + num;
      var stars = "", fallos = x.intentos - x.v;
      for (var k = 0; k < 3; k++) stars += k < x.v ? "★" : "☆";
      return '<div class="nivel ' + x.est + (n.jefe ? " jefe" : "") + '" data-id="' + n.id + '">' +
        '<div class="nodo" aria-hidden="true">' + nodo + '</div>' +
        '<div class="ncard">' +
          '<div class="n-top"><span class="n-label">' + etiqueta + ' · ' + EST[x.est] + '</span><span class="n-xp">+' + (Number(n.xp) || 0) + ' XP</span></div>' +
          '<div class="n-title">' + esc(n.titulo) + '</div>' +
          '<div class="chips">' + chipsNivel(n) + '</div>' +
          '<div class="vics"><span class="st" aria-hidden="true">' + stars + '</span> ' + x.v + L(" de 3 victorias", " de 3 victòries") +
            (fallos > 0 ? ' · ' + fallos + ' ' + plural(fallos, "intento", "intentos", "intent", "intents") : '') + '</div>' +
          '<div class="n-acts">' +
            '<button type="button" class="mini mini-go" data-act="go"' + (x.est === "bloq" ? ' disabled title="' + L("Supera antes el nivel anterior", "Supera abans el nivell anterior") + '"' : '') + '>▶ ' + L("Jugar misión", "Jugar la missió") + '</button>' +
            '<button type="button" class="mini" data-act="edit">' + L("Editar", "Editar") + '</button>' +
            '<button type="button" class="mini mini-del" data-act="del">' + L("Borrar", "Esborrar") + '</button>' +
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
          else if (act === "del" && confirm(L("¿Borrar este nivel? Las misiones ya jugadas se conservan.", "Vols esborrar aquest nivell? Les missions ja jugades es conserven."))) { removeRecord(id); closeEditor(); renderAll(); }
        });
      });
    });
  }

  /* ---------- editor de nivel ---------- */
  var editingId = null;
  function campo(id, label, ph, val) { return '<div class="field"><label for="' + id + '">' + label + '</label><input type="text" id="' + id + '" placeholder="' + ph + '" value="' + esc(val) + '"></div>'; }
  function openEditor(id) {
    editingId = id || null;
    var n = id ? getNiveles().filter(function (x) { return x.id === id; })[0] : null;
    var dif = n ? Number(n.dificultad) || 3 : 3;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (n ? L("Editar nivel", "Editar el nivell") : L("Nuevo nivel", "Nivell nou")) + '</h3>' +
      '<p class="hint">' + L("Que sea concreto y un poco difícil, pero posible. La dificultad ordena el mapa.", "Que sigui concret i una mica difícil, però possible. La dificultat ordena el mapa.") + '</p>' +
      '<div class="field"><label for="nTitulo">' + L("La misión", "La missió") + '</label><textarea id="nTitulo" rows="2" placeholder="' + L("p. ej. ir solo al parque y quedarme con mis amigos", "p. ex. anar tot sol al parc i quedar-m'hi amb els meus amics") + '">' + esc(n ? n.titulo : "") + '</textarea></div>' +
      '<div class="grid2">' +
        campo("nTiempo", L("Tiempo", "Temps"), "45 min", n ? n.tiempo : "") +
        campo("nCuando", L("Cuándo", "Quan"), L("de día, por la tarde, de noche…", "de dia, horabaixa, de nit…"), n ? n.cuando : "") +
        campo("nDonde", L("Dónde", "On"), L("el parque, el barrio…", "el parc, el barri…"), n ? n.donde : "") +
        campo("nConQuien", L("Con quién", "Amb qui"), L("con mis amigos", "amb els meus amics"), n ? n.conQuien : "") +
        campo("nAdulto", L("¿Dónde está el adulto?", "On és l'adult?"), L("en el portal, en casa…", "al portal, a casa…"), n ? n.adulto : "") +
        '<div class="field"><label for="nXp">' + L("XP que da", "XP que dona") + '</label><input type="number" id="nXp" min="5" max="200" step="5" value="' + (n ? Number(n.xp) || 20 : 30) + '"></div>' +
      '</div>' +
      '<div class="field"><label for="nDif">' + L("Dificultad: ", "Dificultat: ") + '<span id="nDifN">' + dif + '</span>' + L(" de 10", " de 10") + '</label>' +
        '<input type="range" min="1" max="10" value="' + dif + '" id="nDif"><div class="ends"><span>' + L("Fácil", "Fàcil") + '</span><span>' + L("Muy difícil", "Molt difícil") + '</span></div></div>' +
      '<div class="field"><label class="check"><input type="checkbox" id="nJefe"' + (n && n.jefe ? " checked" : "") + '> ' + L("Es el jefe final 🐉", "És el boss final 🐉") + '</label></div>' +
      '<div class="editor-acts"><button type="button" class="btn" id="nSave">' + (n ? L("Guardar cambios", "Desar els canvis") : L("Añadir al mapa", "Afegir al mapa")) + '</button>' +
        '<button type="button" class="btn btn-link" id="nCancel">' + L("Cancelar", "Cancel·lar") + '</button></div>';
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
    var h = '<div class="termo" id="' + id + '" role="group" aria-label="' + L("Alarma del miedo de 0 a 10", "Alarma de la por de 0 a 10") + '">';
    for (var i = 0; i <= 10; i++) h += '<button type="button" class="tb" data-v="' + i + '" aria-pressed="false" style="background:' + cols[i] + '">' + i + '</button>';
    return h + '</div><div class="termo-cap"><span>' + L("0 · tranquilo", "0 · tranquil") + '</span><span>5</span><span>' + L("10 · alarma a tope", "10 · alarma a tota") + '</span></div>';
  }
  function pillsHTML(id, opts, multi) {
    return '<div class="pillset" id="' + id + '" role="group"' + (multi ? ' data-multi="1"' : '') + '>' +
      opts.map(function (o) { return '<button type="button" class="pill' + (o.warn ? " warn" : "") + '" data-v="' + esc(o.v) + '" aria-pressed="false">' + esc(o.t) + '</button>'; }).join("") + '</div>';
  }
  function vt(a) { return a.map(function (x) { return { v: x, t: x }; }); }

  function startMision(id) {
    var n = getNiveles().filter(function (x) { return x.id === id; })[0]; if (!n) return;
    runState = { nivelId: id, antes: null, despues: null, alarmas: [], zonas: [], poderes: [], final: null, realidad: null, frase: null, plan: null, premio_dado: null };
    runBody.innerHTML =
      '<div class="sec-head"><span class="num">' + L("Misión en marcha", "Missió en marxa") + '</span><h2>' + (n.jefe ? L("¡Jefe final!", "Boss final!") : L("¡A por el nivel!", "A pel nivell!")) + '</h2>' +
        '<p>' + L("Rellena la parte 1 antes de salir. La parte 2, durante. La parte 3, al volver.", "Omple la part 1 abans de sortir. La part 2, durant la sortida. La part 3, quan tornis.") + '</p></div>' +
      '<div class="run-target"><div class="t">' + esc(n.titulo) + '</div><div class="chips">' + chipsNivel(n) + chip("⭐", "+" + n.xp + " XP") + '</div></div>' +

      '<div class="fase"><div class="fase-h"><span class="fase-n">1</span><h3>' + L("Antes de salir", "Abans de sortir") + '</h3></div>' +
        '<p class="fase-sub">' + L("Mira tu alarma como un detective: sin pelearte con ella.", "Mira la teva alarma com un detectiu: sense barallar-t'hi.") + '</p>' +
        '<div class="field"><span class="lbl">' + L("¿A cuánto está tu alarma ahora?", "A quant està la teva alarma ara?") + '</span>' + termoHTML("antes") + '</div>' +
        '<div class="field"><span class="lbl">' + L("¿Qué dice la alarma que va a pasar?", "Què diu l'alarma que passarà?") + '</span>' + pillsHTML("alarmas", vt(alarmas()), true) + '</div>' +
        '<div class="field"><label for="alarmaOtra">' + L("Otra cosa que dice (opcional)", "Una altra cosa que diu (opcional)") + '</label><input type="text" id="alarmaOtra" placeholder="' + L("que…", "que…") + '"></div>' +
        '<div class="field"><span class="lbl">' + L("📡 ¿Dónde la notas en el cuerpo?", "📡 On la notes, al cos?") + '</span>' + pillsHTML("zonas", vt(zonas()), true) + '</div>' +
      '</div>' +

      '<div class="fase"><div class="fase-h"><span class="fase-n">2</span><h3>' + L("Durante la misión", "Durant la missió") + '</h3></div>' +
        '<p class="fase-sub">' + L("Marca los superpoderes que uses. Cada uno suma XP extra.", "Marca els superpoders que facis servir. Cada un suma XP extra.") + '</p>' +
        '<div class="sp-list">' + poderes().map(function (p) {
          return '<label class="sp" data-p="' + p.id + '"><input type="checkbox"><span class="ico" aria-hidden="true">' + p.ico + '</span><span class="txt"><b>' + esc(p.t) + '</b><span>' + esc(p.d) + '</span></span></label>';
        }).join("") + '</div>' +
        '<div class="field" style="margin-top:14px"><span class="lbl">' + L("🎙️ Mi frase de campeón de hoy", "🎙️ La meva frase de campió d'avui") + '</span>' + pillsHTML("frase", vt(frases())) + '</div>' +
      '</div>' +

      '<div class="fase"><div class="fase-h"><span class="fase-n">3</span><h3>' + L("Al volver", "Quan tornis") + '</h3></div>' +
        '<p class="fase-sub">' + L("Ahora comprueba qué pasó de verdad.", "Ara comprova què ha passat de veritat.") + '</p>' +
        '<div class="field"><span class="lbl">' + L("¿Te quedaste hasta el final?", "T'hi vas quedar fins al final?") + '</span>' + pillsHTML("final", [{ v: "si", t: L("🏁 Sí, hasta el final", "🏁 Sí, fins al final") }, { v: "antes", t: L("Volví antes", "Vaig tornar abans"), warn: true }, { v: "no", t: L("Hoy no salí", "Avui no he sortit"), warn: true }]) + '</div>' +
        '<div class="field"><span class="lbl">' + L("🕵️ ¿Pasó lo que decía la alarma?", "🕵️ Va passar el que deia l'alarma?") + '</span>' + pillsHTML("realidad", [{ v: "no", t: L("¡No! Falsa alarma", "No! Falsa alarma") }, { v: "poco", t: L("Un poquito", "Una mica") }, { v: "si", t: L("Sí pasó", "Sí que va passar"), warn: true }]) + '</div>' +
        '<div class="field"><span class="lbl">' + L("¿A cuánto estaba la alarma al final?", "A quant estava l'alarma al final?") + '</span>' + termoHTML("despues") + '</div>' +
        '<div class="field"><label for="mejor">' + L("Lo mejor de la salida", "El millor de la sortida") + '</label><textarea id="mejor" rows="2" placeholder="' + L("jugamos un partido, me reí con…", "vam jugar un partit, vaig riure amb…") + '"></textarea></div>' +
      '</div>' +

      '<div class="fase familia-mini"><div class="fase-h"><span class="fase-n">👪</span><h3>' + L("Para mamá o papá", "Per a mamà o papà") + '</h3></div>' +
        '<div class="field"><span class="lbl">' + L("¿Mantuvimos el plan sin negociar?", "Vam mantenir el pla sense negociar?") + '</span>' + pillsHTML("plan", [{ v: "si", t: L("Sí", "Sí") }, { v: "cedimos", t: L("Cedimos un poco", "Vam cedir una mica"), warn: true }]) + '</div>' +
        '<div class="field"><span class="lbl">' + L("¿Celebramos al volver?", "Ho vam celebrar quan va tornar?") + '</span>' + pillsHTML("premio_dado", [{ v: "si", t: L("Sí, enseguida", "Sí, de seguida") }, { v: "luego", t: L("Más tarde", "Més tard") }, { v: "no", t: L("Todavía no", "Encara no"), warn: true }]) + '</div>' +
        '<div class="field"><label for="notaFam">' + L("Nota para el psicólogo (opcional)", "Nota per al psicòleg (opcional)") + '</label><textarea id="notaFam" rows="2" placeholder="' + L("le costó salir del portal, pero luego…", "li va costar sortir del portal, però després…") + '"></textarea></div>' +
      '</div>' +

      '<div class="run-acts">' +
        '<button type="button" class="btn btn-oro" id="runSave">' + L("⭐ Terminar misión y ganar XP", "⭐ Acabar la missió i guanyar XP") + '</button>' +
        '<button type="button" class="btn btn-wa" id="runSaveWA">' + L("Guardar y enviar por WhatsApp", "Desar i enviar per WhatsApp") + '</button>' +
        '<button type="button" class="btn btn-link" id="runCancel">' + L("Cerrar sin guardar", "Tancar sense desar") + '</button>' +
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
    if (st.final === "si") d.push({ t: L("Nivel completado", "Nivell completat"), xp: Number(n.xp) || 0 });
    else if (st.final === "antes") d.push({ t: L("Por intentarlo", "Per intentar-ho"), xp: 5 });
    var sp = Math.min(12, st.poderes.length * 3); if (sp) d.push({ t: L("Superpoderes (", "Superpoders (") + st.poderes.length + ")", xp: sp });
    if (st.final && st.final !== "no" && (st.alarmas.length || st.alarmaOtra) && st.realidad) d.push({ t: L("Detective de alarmas", "Detectiu d'alarmes"), xp: 5 });
    return d;
  }

  /* El resumen para el psicólogo va siempre en castellano (panel y consulta). */
  var FINAL_TXT = { si: "Sí, hasta el final", antes: "Volvió antes", no: "Hoy no salió" };
  var REAL_TXT = { no: "No, falsa alarma", poco: "Un poquito", si: "Sí pasó" };
  var PLAN_TXT = { si: "Sí, sin negociar", cedimos: "Cedimos un poco" };
  var PREMIO_TXT = { si: "Sí, enseguida", luego: "Más tarde", no: "Todavía no" };
  var PODER_ES = { balon: "El balón", radar: "El radar del cuerpo", comentarista: "El comentarista", detective: "El detective" };

  function saveMision(share) {
    if (!runState) return;
    var note = $("#runNote");
    if (!runState.final) { note.textContent = L("Falta una cosa: ¿te quedaste hasta el final? (parte 3)", "Falta una cosa: t'hi vas quedar fins al final? (part 3)"); $("#final").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    var n = getNiveles().filter(function (x) { return x.id === runState.nivelId; })[0] || {};
    var cod = ($("#codigo").value || "").trim(); if (cod && window.Aprens) Aprens.setPacienteCodigo(cod);
    runState.alarmaOtra = ($("#alarmaOtra").value || "").trim();
    var antesCromos = cromosConseguidos(), rgAntes = rangoDe(xpGanado()).r.min;
    var vicAntes = victoriasDe(n.id);
    var desg = calcXP(n, runState), xp = desg.reduce(function (t, d) { return t + d.xp; }, 0);
    var r = { id: uid("sal_"), kind: "salida", date: ymd(), ts: Date.now(), lang: MB.lang, nivelId: n.id, nivelTitulo: n.titulo || "", dificultad: n.dificultad,
      tiempo: n.tiempo || "", cuando: n.cuando || "", jefe: !!n.jefe,
      antes: runState.antes, despues: runState.despues, alarmas: runState.alarmas.slice(), alarmaOtra: runState.alarmaOtra,
      zonas: runState.zonas.slice(), poderes: runState.poderes.slice(), frase: runState.frase,
      final: runState.final, realidad: runState.realidad, mejor: ($("#mejor").value || "").trim(),
      plan: runState.plan, premio_dado: runState.premio_dado, nota: ($("#notaFam").value || "").trim(), xp: xp, xp_desglose: desg };
    saveRec(r);
    var nuevos = cromosConseguidos().filter(function (c) { return antesCromos.indexOf(c) < 0; });
    var rgD = rangoDe(xpGanado()).r;
    if (share) { try { window.open("https://wa.me/?text=" + encodeURIComponent((window.aprensConEnlace || String)(resumen(r))), "_blank"); } catch (e) {} }
    runSection.hidden = true; runBody.innerHTML = ""; runState = null;
    renderAll();
    showReward(r, desg, nuevos, rgAntes !== rgD.min ? rgD.t : null, vicAntes, share);
  }

  function resumen(r) {
    var L2 = ["Misión Barrio · salida — APRENS", "Fecha: " + r.date];
    L2.push("Nivel: " + (r.nivelTitulo || "—") + (r.dificultad != null ? " (dificultad " + r.dificultad + "/10)" : "") + (r.jefe ? " · jefe final" : ""));
    L2.push("¿Hasta el final?: " + (FINAL_TXT[r.final] || "—"));
    if (r.antes != null || r.despues != null) L2.push("Alarma: " + (r.antes != null ? r.antes : "—") + " → " + (r.despues != null ? r.despues : "—") + " (0-10)");
    var al = r.alarmas.concat(r.alarmaOtra ? [r.alarmaOtra] : []);
    if (al.length) L2.push("Lo que decía la alarma: " + al.join("; "));
    if (r.realidad) L2.push("¿Pasó?: " + REAL_TXT[r.realidad]);
    if (r.zonas.length) L2.push("Dónde la notaba: " + r.zonas.join(", "));
    if (r.poderes.length) L2.push("Superpoderes: " + r.poderes.map(function (p) { return PODER_ES[p] || p; }).join(", "));
    if (r.frase) L2.push("Frase de campeón: «" + r.frase + "»");
    if (r.mejor) L2.push("Lo mejor: " + r.mejor);
    if (r.plan) L2.push("Plan sin negociar: " + PLAN_TXT[r.plan]);
    if (r.premio_dado) L2.push("Celebración: " + PREMIO_TXT[r.premio_dado]);
    if (r.nota) L2.push("Nota de la familia: " + r.nota);
    L2.push("XP: +" + r.xp + " (total " + xpGanado() + ")");
    L2.push("", "(Enviado desde Misión Barrio · adjunta también el .json para el panel)");
    return L2.join("\n");
  }

  /* ---------- pantalla de recompensa ---------- */
  var reward = $("#reward"), rewardBody = $("#rewardBody"), lastFocus = null;
  function cromoHTML(c, lock) {
    return '<div class="cromo' + (lock ? " lock" : "") + '"><span class="ce" aria-hidden="true">' + (lock ? "❔" : c.e) + '</span><b>' + esc(lock ? "???" : ct(c, "t")) + '</b><span>' + esc(ct(c, "d")) + '</span></div>';
  }
  function showReward(r, desg, nuevos, nuevoRango, vicAntes, share) {
    var titulo, msg;
    if (r.final === "si") {
      var v = vicAntes + 1, faltan = 3 - v;
      titulo = r.jefe ? L("¡Jefe final derrotado!", "Boss final derrotat!") : v === 1 ? L("¡Nivel superado!", "Nivell superat!") : v === 3 ? L("¡Nivel dominado! 👑", "Nivell dominat! 👑") : L("¡Victoria!", "Victòria!");
      msg = v === 1 ? L("Te has quedado hasta el final. Tu alarma acaba de aprender algo nuevo.", "T'hi has quedat fins al final. La teva alarma acaba d'aprendre una cosa nova.") + (r.jefe ? "" : L(" ¡Nivel siguiente desbloqueado!", " Nivell següent desbloquejat!")) :
        v < 3 ? L("Repetirlo lo hace más fácil. ", "Repetir-lo el fa més fàcil. ") + faltan + " " + plural(faltan, "victoria más y lo dominas.", "victorias más y lo dominas.", "victòria més i el domines.", "victòries més i el domines.") :
        L("Este nivel ya es tuyo.", "Aquest nivell ja és teu.");
      if (r.realidad === "no") msg += L(" Y has cazado una falsa alarma 🕵️.", " I has caçat una falsa alarma 🕵️.");
    } else if (r.final === "antes") {
      titulo = L("¡Lo has intentado!", "Ho has intentat!");
      msg = L("Salir ya cuenta. La próxima vez, intenta quedarte hasta el final aunque la alarma suene: así es como aprende. Si cuesta mucho, se puede repetir este nivel o bajar uno.",
        "Sortir ja compta. La pròxima vegada, intenta quedar-t'hi fins al final encara que l'alarma soni: així és com aprèn. Si costa molt, es pot repetir aquest nivell o baixar-ne un.");
    } else {
      titulo = L("Hoy no ha tocado", "Avui no ha tocat");
      msg = L("Pasa. Lo importante es volver a intentarlo el próximo día de misión. Habladlo con calma y elegid el nivel juntos.",
        "Passa. L'important és tornar-ho a intentar el pròxim dia de missió. Parlau-ne amb calma i triau el nivell junts.");
    }
    rewardBody.innerHTML =
      '<h2 id="rewardTitle">' + esc(titulo) + '</h2>' +
      (r.xp ? '<div class="r-xp">+' + r.xp + ' XP</div><ul class="r-desg">' + desg.map(function (d) { return "<li>" + esc(d.t) + ": +" + d.xp + "</li>"; }).join("") + '</ul>' : '') +
      '<p class="r-msg">' + esc(msg) + '</p>' +
      (nuevoRango ? '<p class="r-msg"><b>' + L("⬆️ ¡Subes de rango! Ahora eres ", "⬆️ Puges de rang! Ara ets ") + esc(nuevoRango) + '.</b></p>' : '') +
      (nuevos.length ? '<p class="r-msg"><b>' + plural(nuevos.length, "¡Cromo nuevo!", "¡Cromos nuevos!", "Cromo nou!", "Cromos nous!") + '</b></p><div class="r-cromos">' +
        nuevos.map(function (id) { return cromoHTML(CROMOS.filter(function (c) { return c.id === id; })[0]); }).join("") + '</div>' : '') +
      '<p class="r-desg">' + (share ? L("Guardada. Se ha abierto WhatsApp para enviarla.", "Desada. S'ha obert WhatsApp per enviar-la.") : L("Guardada en este dispositivo.", "Desada en aquest dispositiu.")) + '</p>';
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
    $("#album").innerHTML = '<p class="album-cap">' + ok.length + L(" de ", " de ") + CROMOS.length + ' cromos</p>' +
      CROMOS.map(function (c) { return cromoHTML(c, ok.indexOf(c.id) < 0); }).join("");
  }

  /* ============================================================
     TIENDA
     ============================================================ */
  function renderTienda() {
    var box = $("#tiendaBox"), disp = xpGanado() - xpGastado(), canjes = getCanjes();
    box.innerHTML =
      '<div class="saldo"><span class="big">' + disp + '</span><span>' + L("XP para gastar", "XP per gastar") + '<br>(' + xpGanado() + L(" ganados en total)", " guanyats en total)") + '</span></div>' +
      '<div class="premios">' + (getPremios().map(function (p) {
        var puede = disp >= p.coste;
        return '<div class="premio" data-id="' + p.id + '"><span class="pe" aria-hidden="true">' + esc(p.emoji) + '</span>' +
          '<span class="pt"><b>' + esc(p.nombre) + '</b><span>' + p.coste + ' XP' + (puede ? '' : L(" · te faltan ", " · et falten ") + (p.coste - disp)) + '</span></span>' +
          '<span class="pacts"><button type="button" class="mini mini-go" data-act="canjear"' + (puede ? '' : ' disabled') + '>' + L("Canjear", "Bescanviar") + '</button>' +
          '<button type="button" class="mini mini-del" data-act="quitar" aria-label="' + L("Quitar premio ", "Treure el premi ") + esc(p.nombre) + '">✕</button></span></div>';
      }).join("") || '<p class="lead">' + L("Aún no hay premios. Pactad uno abajo.", "Encara no hi ha premis. Pactau-ne un a baix.") + '</p>') + '</div>' +
      '<div class="add-premio">' +
        '<div><label for="pNombre">' + L("Nuevo premio (lo pactáis en familia)", "Premi nou (el pactau en família)") + '</label><input type="text" id="pNombre" placeholder="' + L("Invitar a un amigo a merendar…", "Convidar un amic a berenar…") + '"></div>' +
        '<div><label for="pCoste">' + L("Precio (XP)", "Preu (XP)") + '</label><input type="number" id="pCoste" min="5" step="5" value="50"></div>' +
        '<button type="button" class="btn btn-sm" id="pAdd">＋ ' + L("Añadir", "Afegir") + '</button>' +
      '</div>' +
      (canjes.length ? '<div class="canjes"><b>' + L("Premios canjeados", "Premis bescanviats") + '</b><ul>' + canjes.slice(-6).reverse().map(function (c) { return "<li>" + esc(c.date) + " · " + esc(c.nombre) + " (−" + c.coste + " XP)</li>"; }).join("") + '</ul></div>' : '');

    $$(".premio", box).forEach(function (row) {
      var id = row.getAttribute("data-id"), p = getPremios().filter(function (x) { return x.id === id; })[0];
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-act") === "canjear") {
            if (confirm(L("¿Canjear «", "Vols bescanviar «") + p.nombre + L("» por ", "» per ") + p.coste + L(" XP? Mamá o papá tienen que estar de acuerdo.", " XP? Mamà o papà hi han d'estar d'acord."))) {
              saveRec({ id: uid("can_"), kind: "canje", date: ymd(), ts: Date.now(), premioId: p.id, nombre: p.nombre, coste: p.coste });
              confeti(); renderAll();
            }
          } else if (confirm(L("¿Quitar el premio «", "Vols treure el premi «") + p.nombre + L("» de la tienda?", "» de la botiga?"))) { removeRecord(id); renderAll(); }
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
     PROGRESO + REVELADO + IDIOMA + INIT
     ============================================================ */
  var progress = $("#progress");
  function onScroll() { var h = document.documentElement; var max = (h.scrollHeight - h.clientHeight) || 1; progress.style.width = Math.min(100, (h.scrollTop || document.body.scrollTop) / max * 100) + "%"; }
  document.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  $("#btnAddNivel").addEventListener("click", function () { openEditor(null); });
  $("#btnResetNiveles").addEventListener("click", function () {
    if (confirm(L("¿Restaurar los niveles de ejemplo? Se reemplazan los niveles actuales (las misiones jugadas, los XP y los premios se conservan).",
      "Vols restaurar els nivells d'exemple? Se substitueixen els nivells actuals (les missions jugades, els XP i els premis es conserven)."))) resetNiveles();
  });

  /* Al cambiar de idioma: se repinta todo (una misión abierta se cierra sin guardar). */
  MB.onChange(function () {
    if (runState) { runSection.hidden = true; runBody.innerHTML = ""; runState = null; }
    closeEditor(); balonReset(); renderFrases(); renderAll();
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  });

  var codeInput = $("#codigo");
  if (window.Aprens) {
    var savedCod = Aprens.getPacienteCodigo(); if (savedCod) codeInput.value = savedCod;
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }

  seedIfEmpty();
  renderFrases();
  renderAll();
  if (window.Aprens && Aprens.mountBar) Aprens.mountBar();
})();
