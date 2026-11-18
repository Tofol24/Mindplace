/* ============================================================================
   La escalera (árabe) · Exposición en vivo a la conducción · APRENS (TEC · AIS)
   ----------------------------------------------------------------------------
   Versión en árabe de app/exposicion/, solo para conducir. La escalera viene
   ya configurada: primera semana con trayectos cortos dentro del pueblo
   (acompañado de su mujer y su hijo) y subida gradual, con peldaños en los que
   conduce ella para aceptar ser acompañado. Mismas dos llaves (QUÉ · CÓMO) y
   mismo registro en el núcleo APRENS. El resumen al psicólogo sale en castellano.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TOOL = "escalera_exposicion_ar";
  var SEED_FLAG = "escalera_conducir_ar_seeded_v1";
  if (window.Aprens) Aprens.config({ toolId: TOOL, toolName: "La escalera · Exposición (árabe)", toolVersion: 1 });

  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

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

  /* ---------- Escalera de conducción ya configurada (editable) ----------
     «es»: título en castellano para el resumen que recibe el psicólogo. */
  var SEMILLA = [
    { dificultad: 2, titulo: "تقود زوجتي وأنا بجانبها راكب، وابننا في الخلف: جولة قصيرة داخل القرية", es: "Pasajero: ella conduce, él al lado, hijo detrás, vuelta corta por el pueblo",
      tiempo: "5–10 د", compania: "مع زوجتي وابني", distancia: "داخل القرية", condicion: "نهارًا · الأسبوع الأول" },
    { dificultad: 3, titulo: "أجلس في مقعد السائق وأشغّل المحرّك بدون أن أتحرّك", es: "En el asiento del conductor, motor encendido, sin moverse",
      tiempo: "3–5 د", compania: "زوجتي بجانبي", distancia: "أمام البيت", condicion: "نهارًا · الأسبوع الأول" },
    { dificultad: 4, titulo: "أقود مسافة قصيرة جدًا ومعروفة داخل القرية (المخبز، الدكّان، المسجد) وأرجع", es: "Conduce un trayecto muy corto y conocido del pueblo y vuelve",
      tiempo: "5 د", compania: "زوجتي بجانبي وابني في الخلف", distancia: "داخل القرية", condicion: "نهارًا · قليل من الحركة · الأسبوع الأول" },
    { dificultad: 5, titulo: "أقود في عدّة شوارع داخل القرية وأركن السيارة مرّة على الأقل", es: "Conduce por varias calles del pueblo y aparca",
      tiempo: "10 د", compania: "زوجتي بجانبي وابني في الخلف", distancia: "داخل القرية", condicion: "نهارًا · الأسبوع الأول" },
    { dificultad: 6, titulo: "أقود 15 دقيقة داخل القرية في وقت فيه حركة (خروج المدرسة، السوق)", es: "Conduce 15 min por el pueblo en hora con más tráfico",
      tiempo: "15 د", compania: "زوجتي بجانبي وابني في الخلف", distancia: "القرية كلّها", condicion: "وقت فيه حركة" },
    { dificultad: 6, titulo: "تخرج زوجتي وحدها مع ابننا في مشوار قصير، وأنا أبقى في البيت: رسالة واحدة حين تصل، بدون مكالمات", es: "Ella sale sola con el hijo a un recado corto; él en casa, un solo mensaje",
      tiempo: "15–20 د", compania: "أنا في البيت", distancia: "داخل القرية", condicion: "رسالة واحدة · بدون مكالمات متكرّرة" },
    { dificultad: 7, titulo: "أقود داخل القرية وزوجتي تجلس في الخلف مع ابننا، لا بجانبي", es: "Conduce con ella en el asiento de atrás (menos apoyo)",
      tiempo: "10–15 د", compania: "زوجتي وابني في الخلف", distancia: "داخل القرية", condicion: "نهارًا" },
    { dificultad: 7, titulo: "أقود إلى القرية المجاورة في طريق ثانوي وأرجع", es: "Conduce hasta el pueblo vecino por carretera secundaria",
      tiempo: "15–20 د", compania: "زوجتي بجانبي", distancia: "القرية المجاورة", condicion: "نهارًا" },
    { dificultad: 8, titulo: "أقود في طريق رئيسي أو سريع مسافة قصيرة", es: "Conduce por carretera principal o vía rápida",
      tiempo: "20–30 د", compania: "زوجتي بجانبي", distancia: "طريق سريع", condicion: "نهارًا" },
    { dificultad: 8, titulo: "تقوم زوجتي برحلة أطول مع ابننا، وأنا في البيت بدون مكالمات متكرّرة", es: "Ella hace un viaje largo con el hijo; él en casa sin llamar",
      tiempo: "ساعة أو أكثر", compania: "أنا في البيت", distancia: "خارج القرية", condicion: "رسالة واحدة حين تصل" },
    { dificultad: 9, titulo: "أقود وحدي مسافة معروفة، وزوجتي تنتظرني في البيت", es: "Conduce solo un trayecto conocido; ella espera en casa",
      tiempo: "10–15 د", compania: "وحدي", distancia: "طريق معروف", condicion: "نهارًا · فقط بقرار الأخصائي" },
    { dificultad: 9, titulo: "أقود مع ابني وحدنا في مشوار عادي", es: "Lleva solo al hijo en un trayecto habitual",
      tiempo: "15–20 د", compania: "مع ابني", distancia: "مشوار عادي", condicion: "فقط بقرار الأخصائي" }
  ];
  function seedPeldano(p, i) {
    var rec = { id: "pel_" + Date.now() + "_" + i, kind: "peldano", ts: Date.now() + i,
      dificultad: p.dificultad, titulo: p.titulo, titulo_es: p.es, tiempo: p.tiempo, compania: p.compania, distancia: p.distancia, condicion: p.condicion };
    if (window.Aprens) Aprens.save(rec);
    return rec;
  }
  function seedIfEmpty() {
    var seeded = false; try { seeded = localStorage.getItem(SEED_FLAG) === "1"; } catch (e) {}
    if (!seeded && getPeldanos().length === 0) {
      SEMILLA.forEach(seedPeldano);
      try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    }
  }
  function resetPeldanos() {
    getPeldanos().forEach(function (p) { removeRecord(p.id); });
    SEMILLA.forEach(seedPeldano);
    try { localStorage.setItem(SEED_FLAG, "1"); } catch (e) {}
    closeEditor(); renderLadder();
  }

  /* ---------- Apoyos del CÓMO (practicar en la guía en árabe) ---------- */
  var PRACTICA = "../tools-standalone/escalera-conducir-ar.html#dentro";
  var APOYOS = [
    { id: "respiracion", ico: "🫁", t: "التنفّس بفضول", es: "respiración curiosa", d: "ألاحظ كيف يدخل الهواء ويخرج، بدون أن أجبره. فضول، لا سيطرة." },
    { id: "muscular", ico: "💪", t: "الشدّ والإرخاء", es: "tensión y distensión", d: "أشدّ كتفيّ ويديّ وفكّي ثم أرخيها. من الشدّ إلى الارتخاء (والسيارة متوقّفة)." },
    { id: "abrazo", ico: "🤍", t: "العناق المحسوس", es: "abrazo sentido", d: "أعطي الألم مكانًا في عائلتي: أرافق نفسي كما أرافق ابني حين يخاف." },
    { id: "honestidad", ico: "🗣️", t: "الصدق العاطفي", es: "honestidad emocional", d: "أسمّي ما أشعر به بدون أن أشرحه أو أخفيه: «ألاحظ الخوف، وأبقى معه»." },
    { id: "carrusel", ico: "🎠", t: "إيقاف الدوّامة", es: "parar la rumiación", d: "حين أتكلّم وحدي أو أدور في نفس الفكرة: ألاحظ، أسمّيها، أرجع إلى النَّفَس والطريق." }
  ];

  /* ============================================================ السُّلَّم */
  var ladder = $("#ladder");
  function chip(label, val) { return val ? '<span class="chip">' + esc(label) + ' <b>' + esc(val) + '</b></span>' : ""; }
  function nExp(n) { return n === 1 ? "خرجة واحدة مسجّلة" : n === 2 ? "خرجتان مسجّلتان" : n + (n <= 10 ? " خرجات مسجّلة" : " خرجة مسجّلة"); }

  function rungHTML(p, n) {
    var hechas = sesionesDe(p.id).length;
    var pct = Math.max(0, Math.min(100, (Number(p.dificultad) || 0) * 10));
    var badge = hechas ? '<span class="rung-badge">✓ ' + nExp(hechas) + '</span>' : "";
    return '<div class="rung' + (hechas ? ' rung-done' : '') + '" data-id="' + p.id + '">' +
      '<div class="rung-top">' +
        '<span class="rung-n">' + n + '</span>' +
        '<div class="rung-body">' +
          '<div class="rung-title">' + esc(p.titulo) + '</div>' +
          '<div class="rung-vars">' + chip("⏱", p.tiempo) + chip("👥", p.compania) + chip("📍", p.distancia) + chip("·", p.condicion) + '</div>' +
          '<div class="rung-dif"><div class="dl"><span>الصعوبة التي أتوقّعها</span><span>' + (Number(p.dificultad) || 0) + '/10</span></div>' +
            '<div class="difbar"><i style="width:' + pct + '%"></i></div></div>' +
          badge +
          '<div class="rung-acts">' +
            '<button class="mini mini-go" data-act="go">حضّر الخروج ←</button>' +
            '<button class="mini mini-edit" data-act="edit">تعديل</button>' +
            '<button class="mini mini-del" data-act="del">حذف</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderLadder() {
    var ps = getPeldanos(), lat = $("#ladderLat");
    if (lat && window.EscaleraLateral) {
      EscaleraLateral.montar(lat, ps.map(function (p) {
        var n = sesionesDe(p.id).length, d = Number(p.dificultad) || 0;
        return { alto: Math.max(1, d), hecho: n > 0, linea2: d + "/10", linea3: n ? "✓ " + n : "",
          etiqueta: p.titulo + "، الصعوبة " + d + " من 10" + (n ? "، " + nExp(n) : "") };
      }), { titulo: "سُلَّمك", persona: "🚗", salto: 3, max: 11, leyenda: "✓ الخرجات المسجّلة",
        textos: { escalon: "الدرجة", escalones: "درجة", hecho: "تمّت", ahora: "درجة الآن", ahoraSr: "هي درجة الآن.", pendiente: "لم تتمّ بعد.", siguientes: "التالية", alto: "درجة عالية جدًا", escalera: "السُّلَّم" } });
    }
    if (!ps.length) { ladder.innerHTML = '<p class="lead" style="color:var(--tinta-soft)">سُلَّمك فارغ. أضف أول درجة أو استرجع السُّلَّم الأصلي.</p>'; return; }
    ladder.innerHTML = ps.map(function (p, i) { return rungHTML(p, i + 1); }).join("");
    $$(".rung", ladder).forEach(function (row) {
      var id = row.getAttribute("data-id");
      $$("[data-act]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          if (act === "go") startExposicion(id);
          else if (act === "edit") openEditor(id);
          else if (act === "del") { if (confirm("حذف هذه الدرجة؟ الخرجات المسجّلة لها تبقى محفوظة.")) { removeRecord(id); closeEditor(); renderLadder(); } }
        });
      });
    });
  }

  /* ---------- محرّر الدرجة ---------- */
  var editor = $("#peldanoEditor");
  var editingId = null;

  function openEditor(id) {
    editingId = id || null;
    var p = id ? getPeldanos().filter(function (x) { return x.id === id; })[0] : null;
    var isNew = !p;
    var dif = p ? Number(p.dificultad) || 5 : 5;
    editor.hidden = false;
    editor.innerHTML =
      '<h3>' + (isNew ? "درجة جديدة" : "تعديل الدرجة") + '</h3>' +
      '<p class="hint">اكتبها بشكل ملموس وممكن. أعطها الصعوبة التي تتخيّلها حين تفكّر فيها: السُّلَّم يترتّب وحده.</p>' +
      '<div class="field"><label for="pTitulo">الدرجة</label>' +
        '<textarea id="pTitulo" rows="2" placeholder="مثلًا: أقود إلى السوق وأرجع">' + esc(p ? p.titulo : "") + '</textarea></div>' +
      '<div class="grid2">' +
        '<div class="field"><label for="pTiempo">الوقت</label><input type="text" id="pTiempo" placeholder="10 د" value="' + esc(p ? p.tiempo : "") + '"></div>' +
        '<div class="field"><label for="pCompania">من معي</label><input type="text" id="pCompania" placeholder="زوجتي بجانبي" value="' + esc(p ? p.compania : "") + '"></div>' +
        '<div class="field"><label for="pDistancia">المسافة / المكان</label><input type="text" id="pDistancia" placeholder="داخل القرية" value="' + esc(p ? p.distancia : "") + '"></div>' +
        '<div class="field"><label for="pCondicion">الظروف</label><input type="text" id="pCondicion" placeholder="نهارًا، قليل من الحركة" value="' + esc(p ? p.condicion : "") + '"></div>' +
      '</div>' +
      '<div class="scale"><div class="scale-top"><span class="cap">الصعوبة التي أتوقّعها</span><span class="n" id="pDifN">' + dif + '</span></div>' +
        '<input type="range" min="0" max="10" value="' + dif + '" id="pDif" aria-label="الصعوبة المتوقّعة">' +
        '<div class="ends"><span>سهلة</span><span>صعبة جدًا</span></div></div>' +
      '<div class="editor-acts">' +
        '<button class="btn btn-primary" id="pSave">' + (isNew ? "أضف إلى السُّلَّم" : "احفظ التغييرات") + '</button>' +
        '<button class="btn btn-link" id="pCancel">إلغاء</button>' +
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
      // si el título no cambia, se conserva su traducción para el psicólogo
      titulo_es: existing && existing.titulo === titulo ? existing.titulo_es : "",
      tiempo: ($("#pTiempo").value || "").trim(),
      compania: ($("#pCompania").value || "").trim(),
      distancia: ($("#pDistancia").value || "").trim(),
      condicion: ($("#pCondicion").value || "").trim()
    };
    if (window.Aprens) Aprens.save(rec);
    closeEditor(); renderLadder();
  }

  /* ============================================================ التعرّض · المفتاحان */
  var expSection = $("#exposicion"), expBody = $("#expBody");
  var expState = null;

  function startExposicion(id) {
    var p = getPeldanos().filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    expState = { peldanoId: id, apoyos: [], desenlace: null, actitud: null };
    expBody.innerHTML =
      '<div class="sec-head"><span class="num">الخروج</span>' +
        '<h2>افتحه بمفتاحيك</h2>' +
        '<p>أولًا الماذا (ماذا تفعل اليوم والتزامك بالبقاء). أثناء الخروج، الكيف (كيف ترافق نفسك). في النهاية، سجّل كيف كان. زوجتك يمكنها أن تساعدك في ملئه.</p></div>' +
      '<div class="contrato"><input type="checkbox" id="practicaCalma">' +
        '<label for="practicaCalma"><b>أولًا نظهر:</b> اليوم (أو هذه الأيام) تمرّنت من الداخل <b>في الهدوء</b>، لا فقط حين يضغط الخوف. إذا لم تفعل بعد، ابدأ من هناك: هذا ما يجعلك لا تكون وحدك هناك في الخارج.</label></div>' +

      '<div class="exp-target"><div class="t">' + esc(p.titulo) + '</div>' +
        '<div class="v">' + chip("⏱", p.tiempo) + chip("👥", p.compania) + chip("📍", p.distancia) + chip("·", p.condicion) +
        chip("الصعوبة", (Number(p.dificultad) || 0) + "/10") + '</div></div>' +

      '<div class="keypanel kp-que">' +
        '<div class="kp-head"><span class="k">🔑</span><h3>الماذا</h3></div>' +
        '<p class="kp-sub">المواجهة السلوكية · ماذا أفعل اليوم</p>' +
        '<div class="grid2">' +
          '<div class="field"><label for="hTiempo">وقت اليوم</label><input type="text" id="hTiempo" value="' + esc(p.tiempo) + '"></div>' +
          '<div class="field"><label for="hCompania">من معي اليوم</label><input type="text" id="hCompania" value="' + esc(p.compania) + '"></div>' +
        '</div>' +
        '<div class="scale"><div class="scale-top"><span class="cap">الإنذار عند البداية</span><span class="n" id="sAntesN">7</span></div>' +
          '<input type="range" class="sud" min="0" max="10" value="7" id="sAntes" aria-label="الإنذار عند البداية">' +
          '<div class="ends"><span>هدوء</span><span>أقصى</span></div></div>' +
        '<div class="contrato"><input type="checkbox" id="contrato">' +
          '<label for="contrato"><b>التزامي:</b> أبقى الوقت الذي قرّرته ولا أذهب لأرتاح، حتى لو بقي الإنذار مرتفعًا. لا أحتاج أن ينزل حتى تُحسب الخطوة: تُحسب لأنني خطوتها وأنا أرافق نفسي. إذا ذهبت لأرتاح، يقوى الخوف. إذا احتجت، أتوقّف جانبًا في مكان آمن، أتنفّس، ثم أكمل.</label></div>' +
      '</div>' +

      '<div class="keypanel kp-como">' +
        '<div class="kp-head"><span class="k">🔑</span><h3>الكيف</h3></div>' +
        '<p class="kp-sub">المرافقة الداخلية · AIS · كيف أحمل نفسي</p>' +
        '<p class="kp-hint">علّم على ما تستعمله أثناء الخروج. اضغط <b>تمرّن ↗</b> لتتدرّب على كل أداة قبل الخروج، وتصل مستعدًا.</p>' +
        '<div class="apoyos">' +
          APOYOS.map(function (a) {
            return '<label class="apoyo" data-ap="' + a.id + '"><input type="checkbox"><span class="ico">' + a.ico + '</span>' +
              '<span class="txt"><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span></span>' +
              '<a class="apoyo-practicar" href="' + PRACTICA + '" target="_blank" rel="noopener">تمرّن ↗</a></label>';
          }).join("") +
        '</div>' +

        '<div class="scale"><div class="scale-top"><span class="cap">أعلى نقطة للإنذار</span><span class="n" id="sPicoN">7</span></div>' +
          '<input type="range" class="sud" min="0" max="10" value="7" id="sPico" aria-label="أعلى نقطة للإنذار">' +
          '<div class="ends"><span>هدوء</span><span>أقصى</span></div></div>' +
        '<div class="scale"><div class="scale-top"><span class="cap">الإنذار عند النهاية</span><span class="n" id="sFinalN">5</span></div>' +
          '<input type="range" class="sud" min="0" max="10" value="5" id="sFinal" aria-label="الإنذار عند النهاية">' +
          '<div class="ends"><span>هدوء</span><span>أقصى</span></div></div>' +

        '<div class="field"><label>كيف انتهى؟</label>' +
          '<div class="pillset" id="desenlace">' +
            '<button class="pill" data-v="quedo_bajo" aria-pressed="false">بقيت ونزل الإنذار</button>' +
            '<button class="pill" data-v="quedo_alto" aria-pressed="false">بقيت، وما زال مرتفعًا</button>' +
            '<button class="pill warn" data-v="hui" aria-pressed="false">ذهبت قبل الوقت (هربت)</button>' +
          '</div></div>' +

        '<div class="field"><label>كيف حملته من الداخل؟</label>' +
          '<div class="pillset" id="actitud">' +
            '<button class="pill" data-v="compania" aria-pressed="false">مرافَقًا من الداخل</button>' +
            '<button class="pill" data-v="apretando" aria-pressed="false">متحمّلًا وأنا مشدود</button>' +
            '<button class="pill warn" data-v="reprimi" aria-pressed="false">كبتّه</button>' +
          '</div></div>' +

        '<div class="field"><label>الكلام مع نفسي والأفكار التي تدور</label>' +
          '<div class="pillset" id="rumiacion">' +
            '<button class="pill" data-v="nada" aria-pressed="false">لا شيء</button>' +
            '<button class="pill" data-v="poco" aria-pressed="false">قليل</button>' +
            '<button class="pill warn" data-v="mucho" aria-pressed="false">كثير</button>' +
          '</div></div>' +

        '<div class="field"><label for="hHonest">الصدق العاطفي · ماذا شعرت (بدون أن أخفيه)</label>' +
          '<textarea id="hHonest" rows="2" placeholder="شعرت بقلبي يدقّ بسرعة ورغبة في الرجوع… وبقيت"></textarea></div>' +
      '</div>' +

      '<div class="exp-acts">' +
        '<button class="btn btn-como" id="expSave">احفظ الخروج</button>' +
        '<button class="btn btn-primary" id="expSaveWA">احفظ وأرسل عبر واتساب</button>' +
        '<button class="exp-close" id="expCancel">أغلق بدون حفظ</button>' +
      '</div>' +
      '<p class="exp-note" id="expNote"></p>';

    [["sAntes", "sAntesN"], ["sPico", "sPicoN"], ["sFinal", "sFinalN"]].forEach(function (pair) {
      var inp = $("#" + pair[0]), num = $("#" + pair[1]);
      inp.addEventListener("input", function () { num.textContent = inp.value; });
    });
    $$(".apoyo", expBody).forEach(function (l) {
      var cb = $("input", l), id2 = l.getAttribute("data-ap");
      cb.addEventListener("change", function () {
        l.classList.toggle("on", cb.checked);
        var i = expState.apoyos.indexOf(id2);
        if (cb.checked) { if (i < 0) expState.apoyos.push(id2); } else if (i >= 0) expState.apoyos.splice(i, 1);
      });
      var link = $(".apoyo-practicar", l);
      if (link) link.addEventListener("click", function (e) { e.stopPropagation(); });
    });
    bindPills("desenlace", function (v) { expState.desenlace = v; });
    bindPills("actitud", function (v) { expState.actitud = v; });
    bindPills("rumiacion", function (v) { expState.rumiacion = v; });

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

  /* Textos en castellano para el psicólogo */
  var DESENLACE_TXT = { quedo_bajo: "Se quedó y la alarma bajó", quedo_alto: "Se quedó, aún alta", hui: "Se fue antes (huyó)" };
  var ACTITUD_TXT = { compania: "Con compañía interna", apretando: "Aguantando apretado", reprimi: "Lo reprimió" };
  var RUMIA_TXT = { nada: "nada", poco: "poco", mucho: "mucho" };

  function buildSesion() {
    var p = getPeldanos().filter(function (x) { return x.id === expState.peldanoId; })[0] || {};
    return {
      id: "ses_" + Date.now(), kind: "sesion", date: ymd(), ts: Date.now(),
      peldanoId: expState.peldanoId, peldanoTitulo: p.titulo || "", peldanoTitulo_es: p.titulo_es || "", dificultad: p.dificultad,
      tiempo_hoy: ($("#hTiempo").value || "").trim(), compania_hoy: ($("#hCompania").value || "").trim(),
      sud_antes: Number($("#sAntes").value), sud_pico: Number($("#sPico").value), sud_final: Number($("#sFinal").value),
      compromiso: !!$("#contrato").checked,
      practica_calma: !!($("#practicaCalma") && $("#practicaCalma").checked),
      paso_con_ais: expState.desenlace ? (expState.desenlace !== "hui" && expState.actitud === "compania") : null,
      apoyos: expState.apoyos.slice(),
      desenlace: expState.desenlace, actitud: expState.actitud, rumiacion: expState.rumiacion || null,
      honestidad: ($("#hHonest").value || "").trim()
    };
  }

  function resumenSesion(s) {
    var L = ["La escalera · exposición a la conducción (versión en árabe) · APRENS", "Fecha: " + s.date];
    L.push("Peldaño: " + (s.peldanoTitulo_es || s.peldanoTitulo || "-") + (s.dificultad != null ? " (dif. " + s.dificultad + "/10)" : ""));
    if (s.tiempo_hoy || s.compania_hoy) L.push("Hoy (tal como lo escribió): " + [s.tiempo_hoy, s.compania_hoy].filter(Boolean).join(" · "));
    L.push("Alarma: " + s.sud_antes + " → pico " + s.sud_pico + " → " + s.sud_final);
    L.push("Compromiso de quedarse: " + (s.compromiso ? "sí" : "no"));
    if (s.desenlace) L.push("Desenlace: " + (DESENLACE_TXT[s.desenlace] || s.desenlace));
    if (s.actitud) L.push("Cómo lo sostuvo: " + (ACTITUD_TXT[s.actitud] || s.actitud));
    if (s.rumiacion) L.push("Hablar solo / rumiación: " + (RUMIA_TXT[s.rumiacion] || s.rumiacion));
    if (s.paso_con_ais != null) L.push("Paso dado con el AIS activo: " + (s.paso_con_ais ? "sí" : "no"));
    L.push("Práctica en calma previa: " + (s.practica_calma ? "sí" : "no"));
    if (s.apoyos && s.apoyos.length) {
      L.push("Se acompañó con: " + s.apoyos.map(function (a) { var x = APOYOS.filter(function (y) { return y.id === a; })[0]; return x ? x.es : a; }).join(", "));
    }
    if (s.honestidad) L.push("Sintió (en árabe, original): " + s.honestidad);
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
      try { window.open("https://wa.me/?text=" + encodeURIComponent((window.aprensConEnlace || String)(resumenSesion(s))), "_blank"); } catch (e) {}
      if (note) note.textContent = "حُفظ في هذا الجهاز. فُتح واتساب لإرساله.";
    } else if (note) { note.textContent = "حُفظ الخروج في هذا الجهاز."; }
    renderLadder();
    if (s.desenlace && s.desenlace !== "hui" && note) {
      note.textContent += " بقيت، سواء نزل الإنذار أم لا: هذا هو العمل بالضبط.";
    }
  }

  /* ============================================================ تقدّم القراءة والظهور */
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

  $("#btnAddPeldano").addEventListener("click", function () { openEditor(null); });
  $("#btnResetPeldanos").addEventListener("click", function () {
    if (confirm("استرجاع السُّلَّم الأصلي؟ يعوّض الدرجات الحالية (الخرجات المسجّلة تبقى محفوظة).")) resetPeldanos();
  });

  var codeInput = $("#codigo");
  if (window.Aprens) {
    var saved = Aprens.getPacienteCodigo();
    if (saved) codeInput.value = saved;
    codeInput.addEventListener("change", function () { Aprens.setPacienteCodigo(codeInput.value); });
  }

  seedIfEmpty();
  renderLadder();
})();
