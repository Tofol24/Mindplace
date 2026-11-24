/* APRENS · Panel — Feedback a partir de los autorregistros (sin necesidad de screening).
   ----------------------------------------------------------------------------
   Suma TODOS los autorregistros de un paciente (cualquier herramienta menos el
   Screening), separa lo que ha llegado desde el último feedback enviado de lo
   anterior, y con esa comparación:
     1) hace una lectura clínica breve para el psicólogo;
     2) propone el foco TEC de la semana en progresión (latencia → densidad →
        continuidad), teniendo en cuenta el foco del feedback anterior;
     3) redacta el mensaje de WhatsApp para el paciente (castellano o catalán).
   Funciones puras: no tocan el DOM ni el almacenamiento. Script clásico:
   expone window.APRENS_FEEDBACK. */
(function (g) {
  "use strict";

  // El Screening tiene su propia pauta (módulos): aquí solo cuentan los autorregistros.
  // La Evaluación de trauma es una valoración: sus resultados van a la ficha, no al feedback.
  var EXCLUIR = { screening_tec: 1, screening_seg: 1, seguimiento_tec: 1, evaluacion_trauma: 1 };
  // Herramientas de práctica de presencia interna (densidad AIS).
  var AIS = ["ais_curiosidad", "ais_amor", "ais_muscular", "bajar_alerta", "acompanar_sensacion", "herramienta_diaria",
    "protocolo_ais", "estoy_aqui_conmigo", "toco_desde_dentro", "mapa_atencion_interna", "tracker_ais", "sentarse_mono",
    "respiracion_curiosa", "ritual_calma", "rincon_calma", "respiro_ais", "cuerpo_en_alerta", "pedalea_desde_dentro", "llave_de_paso", "entre_punto_y_punto", "honestidad_emocional", "control_ira"];
  var MONO = { conduce: "conduce", persigo: "delante", persecucion: "delante", sobrepensamiento: "delante",
    voltaatras: "delante", delante: "delante", maletero: "maletero", allado: "lado", lado: "lado" };
  var FOCOS = ["latencia", "densidad", "continuidad"];
  var URL_SCREENING = "https://aprens-app.netlify.app/#/tool/screening_tec";

  function num(v) { if (v == null || v === "") return null; var n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function pick() { for (var i = 0; i < arguments.length; i++) if (arguments[i] != null && arguments[i] !== "") return arguments[i]; return null; }
  function recDate(r) { return r.date || r.fecha || (r.ts ? new Date(r.ts).toISOString().slice(0, 10) : ""); }
  function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function parseYMD(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "")); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function dias(a, b) { var x = parseYMD(a), y = parseYMD(b); return x && y ? Math.round((y - x) / 86400000) : 0; }
  function sumarDias(s, n) { var d = parseYMD(s); d.setDate(d.getDate() + n); return ymd(d); }
  function lista(xs, y) { xs = xs.map(function (x) { return "«" + x + "»"; }); return xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " " + y + " " + xs[xs.length - 1]; }
  function coma(v) { return String(v).replace(".", ","); }
  function media(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }

  /* Clave estable de un registro: sirve para saber cuáles ya se habían visto
     al enviar el último feedback. */
  function clave(tool, r) {
    return tool + "|" + (r.id != null ? "i" + r.id : r.ts != null ? "t" + r.ts : recDate(r) + "|" + String(r.texto || JSON.stringify(r)).length);
  }

  function autorregistros(p) {
    var out = [];
    Object.keys(p.tools || {}).forEach(function (t) {
      if (EXCLUIR[t]) return;
      (p.tools[t].records || []).forEach(function (r) {
        // Los peldaños y las situaciones de la escala configuran la escalera: no son registros.
        if (r && (r.kind === "peldano" || r.kind === "jerarquia")) return;
        if (r && recDate(r)) out.push({ tool: t, r: r, d: recDate(r), k: clave(t, r) });
      });
    });
    return out.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  }

  /* Métricas de un conjunto de registros. span: días que cubre (mín. 7). */
  function metricas(xs, span, nombreDe) {
    var m = { n: xs.length, dias: 0, aisDias: 0, tools: {}, herr: {}, act: [], mono: { conduce: 0, delante: 0, maletero: 0, lado: 0 }, nMono: 0,
      cv: { n: 0, unos: 0 }, accion: { valiosa: 0, evitativa: 0 }, L: [], D: [], C: [], sob: [] };
    var ds = {}, ais = {};
    xs.forEach(function (x) {
      var r = x.r, t = x.tool;
      ds[x.d] = 1; m.tools[t] = (m.tools[t] || 0) + 1;
      // Herramienta exacta: id conocido, o «@Nombre» si llegó como registro de texto.
      var nm = t === "registro_texto" ? (r.herramienta || (nombreDe && nombreDe(t, r))) : null;
      var hk = nm && nm !== "Registro (texto)" ? "@" + nm : t;
      m.herr[hk] = (m.herr[hk] || 0) + 1;
      if (AIS.indexOf(t) >= 0) ais[x.d] = 1;
      // Mi recorrido trae su propio recuento de días con práctica programada (ventana de 14 días).
      if (t === "recorrido_tec" && num(r.prog14) != null) m.prog14 = num(r.prog14);
      // Activación antes → después de la práctica (0–10)
      var a = null, b = null;
      if (t === "acompanar_sensacion") { a = num(r.intensidad_antes); b = num(r.intensidad_despues); }
      else if (t === "cuerpo_en_alerta") { a = num(r.activacion); b = num(r.alivio); }
      else if (t === "paso_a_paso") { a = num(pick(r.ans_max, r.ans_antes)); b = num(r.ans_final); }
      else { a = num(pick(r.antes, r.alerta_antes, r.activacion_antes)); b = num(pick(r.despues, r.alerta_despues, r.activacion_despues)); }
      if (a != null && b != null && a <= 10 && b <= 10) m.act.push([a, b]);
      var pos = MONO[r.pos || r.escena || r.modo];
      if (pos && /mono/.test(t)) { m.mono[pos]++; m.nMono++; }
      if (t === "microaccion_valor" && num(r.cv) != null) { m.cv.n++; if (num(r.cv) === 1) m.cv.unos++; }
      if (["Valiosa", "Asertiva", "Protectora necesaria"].indexOf(r.tipo_accion) >= 0 || r.resultado === "sostuve") m.accion.valiosa++;
      if (["Evitativa", "Compulsiva"].indexOf(r.tipo_accion) >= 0 || r.resultado === "escape" || r.resultado === "evite") m.accion.evitativa++;
      ["L", "D", "C"].forEach(function (k) { var v = num(r[k]); if (v != null && v >= 0 && v <= 10) m[k].push(v); });
      var s = num(pick(r.sobrepensar, r.sobrepensamiento)); if (s != null) m.sob.push(s);
    });
    m.dias = Object.keys(ds).length; m.aisDias = Object.keys(ais).length;
    var sem = Math.max(7, span || 7) / 7;
    m.diasSem = r1(m.dias / sem); m.aisSem = r1(m.aisDias / sem);
    if (m.prog14 != null) m.aisSem = Math.max(m.aisSem, r1(m.prog14 / 2));
    if (m.act.length) {
      m.actAntes = r1(media(m.act.map(function (x) { return x[0]; })));
      m.actDespues = r1(media(m.act.map(function (x) { return x[1]; })));
      m.actBaja = r1(m.actAntes - m.actDespues);
    }
    m.pctLado = m.nMono ? Math.round(100 * m.mono.lado / m.nMono) : null;
    m.pctReactivo = m.nMono ? Math.round(100 * (m.mono.conduce + m.mono.delante) / m.nMono) : null;
    m.pctCv = m.cv.n ? Math.round(100 * m.cv.unos / m.cv.n) : null;
    ["L", "D", "C"].forEach(function (k) { m["m" + k] = m[k].length ? r1(media(m[k])) : null; });
    m.herramientas = Object.keys(m.herr).sort(function (a, b) { return m.herr[b] - m.herr[a]; });
    m.principal = m.herramientas[0] || null;
    return m;
  }
  function spanDe(xs) { return xs.length ? dias(xs[0].d, xs[xs.length - 1].d) + 1 : 7; }

  /* Herramientas pensadas para niños (las rellenan con la familia). */
  var INFANTILES = { cuento_familia: 1, tiempo_limite: 1, exploradora_valiente: 1, mision_barrio: 1, rincon_calma: 1,
    ritual_calma: 1, la_manada: 1, fondos_frases: 1, escalera_comidas: 1 };
  /* Edad: el código de paciente son las iniciales seguidas de la edad (DFG22). */
  function edadDe(codigo) { var m = /(\d{1,2})$/.exec(String(codigo || "")); var e = m ? +m[1] : null; return e && e >= 3 && e <= 99 ? e : null; }
  function detectarPerfil(p, todos) {
    var edad = edadDe(p.codigo), auto = "adulto", motivo = "";
    var nInf = todos.filter(function (x) { return INFANTILES[x.tool] || x.r.infantil; }).length;
    if (edad != null && edad < 12) { auto = "nino"; motivo = edad + " años según el código"; }
    else if (edad != null && edad < 18) { auto = "adolescente"; motivo = edad + " años según el código"; }
    else if (edad == null && nInf * 2 > todos.length) { auto = "nino"; motivo = "usa sobre todo herramientas infantiles"; }
    else if (edad != null) motivo = edad + " años según el código";
    var elegido = { adulto: 1, adolescente: 1, nino: 1 }[p.perfilFeedback] ? p.perfilFeedback : null;
    return { tipo: elegido || auto, auto: auto, motivo: motivo, edad: edad, manual: !!elegido };
  }

  /* Análisis completo del paciente. opts.hoy (YYYY-MM-DD) solo para pruebas. */
  function analizar(p, opts) {
    opts = opts || {};
    var todos = autorregistros(p);
    if (!todos.length) return null;
    var hoy = opts.hoy || ymd(new Date());
    var fbs = (p.feedbacks || []).slice().sort(function (a, b) { return String(a.fecha).localeCompare(String(b.fecha)); });
    var ultimo = fbs[fbs.length - 1] || null;
    var vistos = {}; (p.feedbackVistos || []).forEach(function (k) { vistos[k] = 1; });
    var hayVistos = !!(p.feedbackVistos && p.feedbackVistos.length);

    var nuevos, previos, sinNuevos = false;
    if (hayVistos) {
      nuevos = todos.filter(function (x) { return !vistos[x.k]; });
      previos = todos.filter(function (x) { return vistos[x.k]; });
    }
    if (!hayVistos || !nuevos.length) {
      // Sin feedback previo (o nada nuevo): la última semana con registros frente a las 4 anteriores.
      sinNuevos = hayVistos;
      var fin = todos[todos.length - 1].d, ini = sumarDias(fin, -6);
      nuevos = todos.filter(function (x) { return x.d >= ini; });
      previos = todos.filter(function (x) { return x.d < ini; });
    }
    // Para comparar, solo el último mes antes de lo nuevo.
    var corte = sumarDias(nuevos[0].d, -28);
    var previosMes = previos.filter(function (x) { return x.d >= corte && x.d < nuevos[0].d; });
    var spanNuevo = Math.max(spanDe(nuevos), Math.min(14, dias(nuevos[0].d, hoy) + 1));
    var nd = opts.nombre || null;
    var N = metricas(nuevos, spanNuevo, nd);
    var P = previosMes.length ? metricas(previosMes, Math.max(7, dias(previosMes[0].d, nuevos[0].d)), nd) : null;
    var T = metricas(todos, spanDe(todos), nd);

    /* ── Señales por parámetro TEC ── */
    var lat = [], den = [], con = [], fort = [];
    if (N.pctReactivo != null && N.nMono >= 2 && N.pctReactivo > (N.pctLado || 0)) lat.push(["mono", "En la posición del mono predomina «conduce / lo tengo delante» (" + N.pctReactivo + "%) sobre «a mi lado» (" + (N.pctLado || 0) + "%)."]);
    if (N.act.length >= 2 && N.actBaja < 1) lat.push(["act", "La activación apenas baja tras practicar (" + N.actAntes + " → " + N.actDespues + ")."]);
    if (N.accion.evitativa > N.accion.valiosa) lat.push(["evit", "Más respuestas evitativas o de escape (" + N.accion.evitativa + ") que valiosas (" + N.accion.valiosa + ")."]);
    if (N.mL != null && N.mL < 5) lat.push(["L", "Latencia registrada baja (media " + N.mL + "/10)."]);
    if (N.diasSem < 3) den.push(["dias", "Registra pocos días por semana (" + N.diasSem + ")."]);
    if (N.aisSem < 3) den.push(["ais", "Práctica de presencia interna poco frecuente (" + N.aisSem + " días/semana con práctica AIS)."]);
    if (N.mD != null && N.mD < 5) den.push(["D", "Densidad registrada baja (media " + N.mD + "/10)."]);
    if (N.pctCv != null && N.pctCv < 60) con.push(["cv", "Micro-acción con valor en el " + N.pctCv + "% de los días."]);
    if (N.mC != null && N.mC < 5) con.push(["C", "Continuidad registrada baja (media " + N.mC + "/10)."]);

    if (N.act.length && N.actBaja >= 1.5) fort.push("act");
    if (P && N.diasSem >= P.diasSem + 0.5) fort.push("masDias"); else if (N.diasSem >= 4) fort.push("constancia");
    if (N.pctLado != null && N.pctLado >= 40) fort.push("lado");
    if (N.pctCv != null && N.pctCv >= 60) fort.push("cv");
    if (N.accion.valiosa > N.accion.evitativa && N.accion.valiosa > 0) fort.push("valiosa");

    /* ── Foco TEC (progresivo: no se salta a continuidad sin latencia y densidad) ── */
    // Para pasar a continuidad hace falta evidencia suficiente de latencia (una sola medida no basta).
    var evidenciaLat = N.act.length >= 2 || N.nMono >= 2 || N.mL != null || N.accion.valiosa + N.accion.evitativa >= 2;
    var foco, motivo, inicio = T.n < 3;
    if (inicio) { foco = "latencia"; motivo = "Pocos registros todavía (" + T.n + "): se empieza por el nivel 1 (detectar y pausar)."; }
    else if (lat.length) { foco = "latencia"; motivo = lat.map(function (x) { return x[1]; }).join(" "); }
    else if (den.length) { foco = "densidad"; motivo = den.map(function (x) { return x[1]; }).join(" "); }
    else if (!evidenciaLat) { foco = "densidad"; motivo = "No hay todavía registros que permitan valorar la latencia (antes/después, posición del mono, respuestas valiosas o L): se mantiene el nivel 2 antes de pasar a continuidad."; }
    else { foco = "continuidad"; motivo = con.length ? con.map(function (x) { return x[1]; }).join(" ") : "Pausa y práctica frecuentes sin señales de alarma: toca consolidar y llevarlo a la acción con valor."; }

    var paso = "primero";
    if (ultimo && ultimo.foco) {
      var i0 = FOCOS.indexOf(ultimo.foco), i1 = FOCOS.indexOf(foco);
      paso = i1 > i0 ? "avanza" : i1 < i0 ? "retrocede" : "mantiene";
    }

    /* ── Evolución respecto a antes ── */
    var evol = "inicio";
    if (P) evol = N.diasSem > P.diasSem + 0.5 ? "mas" : N.diasSem < P.diasSem - 0.5 ? "menos" : "igual";

    var lineas = [];
    lineas.push((hayVistos && !sinNuevos ? "Desde el último feedback (" + ultimo.fecha + "): " : "Última semana con registros: ") +
      N.n + " registro" + (N.n === 1 ? "" : "s") + " en " + N.dias + " día" + (N.dias === 1 ? "" : "s") + " (" + N.diasSem + " días/semana)" +
      (P ? " · mes anterior: " + P.diasSem + " días/semana" : " · sin registros anteriores para comparar") + ".");
    if (N.aisDias) lineas.push("Práctica AIS: " + N.aisSem + " días/semana" + (P ? " (antes " + P.aisSem + ")" : "") + ".");
    if (N.act.length) lineas.push("Activación antes → después de practicar: " + N.actAntes + " → " + N.actDespues + " (baja " + N.actBaja + ", n=" + N.act.length + ")" + (P && P.act.length ? " · antes bajaba " + P.actBaja : "") + ".");
    if (N.nMono) lineas.push("Mono: «a mi lado» " + N.pctLado + "% · «conduce / delante» " + N.pctReactivo + "%" + (P && P.nMono ? " (antes «a mi lado» " + P.pctLado + "%)" : "") + ".");
    if (N.cv.n) lineas.push("Micro-acción con valor: " + N.cv.unos + " de " + N.cv.n + " días" + (P && P.cv.n ? " (antes " + P.pctCv + "%)" : "") + ".");
    if (N.accion.valiosa || N.accion.evitativa) lineas.push("Respuestas valiosas / evitativas: " + N.accion.valiosa + " / " + N.accion.evitativa + ".");
    var ldc = ["L", "D", "C"].filter(function (k) { return N["m" + k] != null; }).map(function (k) { return k + " " + N["m" + k] + (P && P["m" + k] != null ? " (antes " + P["m" + k] + ")" : ""); });
    if (ldc.length) lineas.push("L/D/C de los autorregistros: " + ldc.join(" · ") + ".");
    if (sinNuevos) lineas.push("No han llegado registros nuevos desde el último feedback: el análisis usa la última semana con registros.");

    /* ── Destinatario: adulto, adolescente o familia (registros de un niño) ── */
    var perfil = detectarPerfil(p, todos);

    /* ── Registros por herramienta exacta (para el comentario específico) ── */
    function porHerr(xs) {
      var o = {};
      xs.forEach(function (x) {
        var nm = x.tool === "registro_texto" ? (x.r.herramienta || (nd && nd(x.tool, x.r))) : null;
        var k = nm && nm !== "Registro (texto)" ? "@" + nm : x.tool;
        (o[k] || (o[k] = [])).push(x);
      });
      return o;
    }
    var hN = porHerr(nuevos), hP = porHerr(previos);
    var ultimoReg = nuevos[nuevos.length - 1];
    var ultimoKey = Object.keys(hN).filter(function (k) { return hN[k].indexOf(ultimoReg) >= 0; })[0];

    /* ── Evaluación de trauma recibida desde el último feedback (solo para agradecerla) ── */
    var trs = ((p.tools.evaluacion_trauma && p.tools.evaluacion_trauma.records) || []).filter(function (r) { return r && r.valido !== 0; });
    var trClaves = trs.map(function (r) { return clave("evaluacion_trauma", r); });
    // Sin feedback previo: cuenta como nueva si es de las dos últimas semanas.
    var desdeTr = sumarDias(todos[todos.length - 1].d, -14);
    function trNueva(r, i) { return hayVistos ? !vistos[trClaves[i]] : recDate(r) >= desdeTr; }
    var traumaNueva = trs.some(trNueva);

    /* ── Alertas para revisar antes de enviar (nunca entran en el mensaje) ── */
    var alertas = [];
    // Se mantiene aunque ya se haya enviado un feedback: depende del último resumen, no de lo «nuevo».
    // Solo la quita una autoevaluación posterior respondida sin esa marca (no un resumen con la autoevaluación pendiente).
    var evals = todos.filter(function (x) { return x.tool === "recorrido_tec" && (x.r.riesgo || x.r.eval_fecha); });
    var ue = evals[evals.length - 1];
    if (ue && ue.r.riesgo)
      alertas.push("«Mi recorrido» (autoevaluación del " + (ue.r.eval_fecha || ue.d) + "): indica pensamientos de hacerse daño.");
    if (traumaNueva) trs.forEach(function (r, i) {
      if (!trNueva(r, i)) return;
      if (r.riesgo) alertas.push("Evaluación de trauma (" + recDate(r) + "): ítem 16 del PCL-5 elevado (conductas de riesgo o que pueden causar daño). Explorar en entrevista.");
      if (r.consumo) alertas.push("Evaluación de trauma (" + recDate(r) + "): refiere aumento de alcohol, sustancias o medicación para dormir o calmarse.");
    });

    return { foco: foco, motivo: motivo, paso: paso, ultimo: ultimo, evol: evol, inicio: inicio, sinNuevos: sinNuevos,
      traumaNueva: traumaNueva, alertas: alertas,
      perfil: perfil, porHerr: hN, porHerrPrev: hP, ultimoKey: ultimoKey, nFeedbacks: fbs.length, codigo: p.codigo,
      primerFeedback: !ultimo, fortalezas: fort, senales: { latencia: lat, densidad: den, continuidad: con },
      nuevo: N, previo: P, total: T, lineas: lineas, nuevos: nuevos, claves: todos.map(function (x) { return x.k; }).concat(trClaves) };
  }

  /* ───────────────────────── Mensaje al paciente ─────────────────────────
     Tres destinatarios: adulto, adolescente y familia (cuando los registros son
     de un niño o niña). En los textos, {a|b} elige la forma: «a» cuando se habla
     al propio paciente y «b» cuando se habla a la familia sobre el niño
     (p. ej. «{has|ha} bajado»). Cada bloque tiene varias versiones para que el
     mensaje no salga siempre igual. */
  var TXT = {
    es: {
      base: {
        hola: ["Hola, he revisado los registros que me has ido enviando 🌱", "Hola, gracias por ir enviándome tus registros 🌱", "Hola, he estado mirando con calma lo que me has enviado estos días 🌱"],
        recibido: function (a, hs, V) {
          var N = a.nuevo, h = hs.length === 1 ? "«" + hs[0] + "»" : hs.length ? lista(hs, "y") : "";
          var dias = N.dias >= 3 ? " Ya van " + N.dias + " días con registros, y eso se nota." : "";
          return (h ? V(["Gracias por los registros de " + h + ".", "He visto lo que me has ido enviando de " + h + ".", "Me han llegado tus registros de " + h + " y los he leído con calma."], "rec")
            : V(["Gracias por los registros de estos días.", "He visto lo que me has ido enviando."], "rec")) + dias;
        },
        ultimo: ["De lo último que me has enviado, de «{h}», ", "En el registro de «{h}» que me acaba de llegar, ", "Mirando tu último registro de «{h}», "],
        evol: {
          inicio: ["Es el inicio de tus registros y ya me sirven para ir conociendo cómo estás y cómo responde tu cuerpo.", "Son los primeros registros y ya me ayudan a entender cómo vives estos momentos."],
          mas: ["Respecto a las semanas anteriores has registrado más días, y eso ya es entrenar la capacidad de mirar hacia dentro.", "Comparado con las semanas anteriores lo estás haciendo más a menudo, y esa constancia es la que hace que el cambio se asiente."],
          igual: ["Mantienes un ritmo parecido al de las semanas anteriores, y esa constancia es la que permite que el cambio se asiente.", "Sigues con un ritmo parecido al de las semanas anteriores, y eso tiene mucho valor."],
          menos: ["Has registrado algo menos que las semanas anteriores. No pasa nada, es normal que haya semanas así; lo importante es retomarlo sin exigencia.", "Estos días ha habido menos registros que antes. Es normal que haya semanas más difíciles; lo importante es volver a ello sin exigirte."]
        },
        fort: {
          act: function (N) { return "Cuando practicas, la activación baja de media de " + coma(N.actAntes) + " a " + coma(N.actDespues) + ", y eso me dice que tu cuerpo empieza a fiarse cuando te paras a acompañarlo."; },
          masDias: function () { return "Se nota el esfuerzo por hacerlo más a menudo."; },
          constancia: function (N) { return "Has registrado unos " + coma(N.diasSem) + " días por semana, con una constancia que vale mucho."; },
          lado: function (N) { return "En un " + N.pctLado + "% de las veces has podido tener al mono a tu lado, acompañándolo en vez de pelearte con él."; },
          cv: function (N) { return "Has hecho una acción con valor en " + N.cv.unos + " de " + N.cv.n + " días, aunque la sensación estuviera presente."; },
          valiosa: function () { return "Cuando ha aparecido el malestar, has podido responder más veces desde lo que te importa que desde la evitación."; },
          base: "Solo el hecho de pararte a registrarlo ya es entrenar la presencia interna."
        },
        paso: {
          primero: [""],
          mantiene: ["Seguimos un poco más con lo que te propuse la última vez, porque necesita tiempo para asentarse.", "Mantenemos lo que te propuse la última vez: estas cosas necesitan unas semanas para hacerse propias."],
          avanza: ["Como lo que te propuse la última vez ya va cogiendo forma, damos un paso más.", "Lo que te propuse la última vez ya va cogiendo forma, así que podemos dar un paso más."],
          retrocede: ["Esta semana volvemos un paso atrás, y no es ningún problema: es normal que haya semanas más difíciles y reforzar la base es parte del proceso."]
        },
        foco: {
          latencia: {
            por: function (a) {
              var s = a.senales.latencia.map(function (x) { return x[0]; });
              var r = s.indexOf("mono") >= 0 ? "a menudo la activación decide antes que tú"
                : s.indexOf("evit") >= 0 ? "cuando aparece el malestar todavía tiende a ganar la evitación"
                : s.indexOf("act") >= 0 ? "la activación todavía baja poco después de practicar"
                : s.indexOf("L") >= 0 ? "todavía te cuesta encontrar ese espacio antes de reaccionar" : "";
              return a.inicio ? "Para empezar, lo que vamos a priorizar es ganar unos segundos entre lo que notas por dentro y lo que haces."
                : "Lo que veo que ahora conviene priorizar es ganar unos segundos entre lo que notas por dentro y lo que haces" + (r ? ", porque en los registros veo que " + r : "") + ".";
            },
            p1: "Cuando notes que la activación sube, párate antes de actuar: di mentalmente STOP, haz una respiración y localiza dónde lo notas en el cuerpo. Solo observa unos segundos.",
            p2: "Intenta hacer esta pausa al menos 3 veces al día, también en algún momento tranquilo, para que no dependa solo del malestar.",
            p3: "Por la noche, dedica 2 minutos a revisar en qué momentos lo has conseguido y regístralo en la herramienta como hasta ahora.",
            consigna: "Mi tarea no es responder mejor de golpe. Mi tarea es ganar unos segundos antes de responder."
          },
          densidad: {
            por: function (a) {
              var s = a.senales.densidad.map(function (x) { return x[0]; });
              var r = s.indexOf("dias") >= 0 ? "de momento registras pocos días a la semana" : "de momento solo practicas algunos días de la semana";
              return "Veo que pararte y acompañar lo que notas te va bien. Ahora conviene que estas paradas sean más frecuentes durante el día, porque " + r + ".";
            },
            p1: "Sigue haciendo la pausa cuando aparezca la activación: STOP, respiración y sensación en el cuerpo.",
            p2: "Añade paradas cortas aunque no haga falta: unas 4 o 5 al día, de 10 a 20 segundos, llevando la atención al pecho, al estómago o al cuello. Te ayudará asociarlas a algo que ya haces (después de comer, al subir al coche, antes de abrir el móvil).",
            p3: "Intenta que no pase ningún día sin al menos una parada, y regístralo aunque sea breve.",
            consigna: "No practico para quitarme nada. Practico para que mi cuerpo sepa que estoy aquí."
          },
          continuidad: {
            por: function (a) {
              var s = a.senales.continuidad.map(function (x) { return x[0]; });
              return "Los registros me dicen que ya consigues parar y que lo haces con regularidad. Lo que toca ahora es sostenerlo en el tiempo y llevarlo a lo que te importa" +
                (s.indexOf("cv") >= 0 ? ", porque todavía cuesta convertir esa calma en acciones con valor" : "") + ".";
            },
            p1: "Mantén la pausa antes de responder cuando notes activación.",
            p2: "Mantén también las paradas cortas a lo largo del día, como ya estás haciendo.",
            p3: "Cada día, elige una acción pequeña que te acerque a lo que te importa y hazla aunque la sensación siga presente. Anota solo si la has hecho (1) o no (0).",
            consigna: "No necesito estar bien para empezar. Empiezo pequeño para que mi cuerpo vuelva a confiar."
          }
        },
        semana: "Para esta semana te propongo:",
        pasos: ["Paso 1 · ", "Paso 2 · ", "Paso 3 · "],
        linea: function (t) { return "Todo esto va en la línea de lo que estamos trabajando: «" + t + "»."; },
        frase: "🧭 Quédate con esta frase:",
        screening: function (s) {
          if (s.code3) return (s.segReciente
              ? "Sigue haciendo, al menos una vez por semana, el registro de seguimiento del Screening, como ya has hecho estos días."
              : "Te pido también que, al menos una vez por semana, hagas el registro de seguimiento del Screening. Me ayuda a ver tu evolución con más detalle.") +
            " Son unos 2-3 minutos: entra como paciente, elige «Ya tengo mi código de seguimiento» y escribe tu código: *" + s.code3 + "*.\n" + URL_SCREENING;
          if (s.hecho) return "Te pido también que, al menos una vez por semana, hagas el registro de seguimiento del Screening. Entra como paciente y elige «Ya tengo mi código de seguimiento»; si no tienes tu código a mano, pídemelo por aquí.\n" + URL_SCREENING;
          return "Para poder ver tu evolución con más detalle, te pido que hagas la autoevaluación del Screening TEC/AIS. Se hace en unos 10-15 minutos, no hay respuestas correctas ni incorrectas" +
            (s.codigoPaciente ? " y, al empezar, te pedirá tu código de paciente: *" + s.codigoPaciente + "*" : "") +
            ". Al terminar te daré un código para que, a partir de ahí, hagas el registro de seguimiento al menos una vez por semana.\n" + URL_SCREENING;
        },
        cierre: ["Sigue enviándome tus registros como hasta ahora, así puedo ir viendo tu evolución y ajustar lo que trabajamos. No hace falta que salga perfecto: lo importante es hacerlo con presencia y no con exigencia.",
          "Sigue mandándome lo que vayas registrando; me ayuda mucho a acompañarte entre sesiones. No hace falta que salga perfecto, lo importante es hacerlo con presencia y sin exigencia.",
          "Cualquier cosa que notes estos días me la puedes contar por aquí. No hace falta que salga perfecto: lo importante es hacerlo con presencia y no con exigencia."],
        firma: "Tòfol Villalonga"
      },
      adolescente: {
        hola: ["Hola, he estado mirando lo que me has enviado.", "Hola, gracias por mandarme tus registros.", "Hola, ya he visto lo que me has ido enviando."],
        recibido: function (a, hs, V) {
          var N = a.nuevo, h = hs.length === 1 ? "«" + hs[0] + "»" : hs.length ? lista(hs, "y") : "";
          return (h ? V(["Gracias por ir mandándome " + h + ".", "He visto tus registros de " + h + "."], "rec") : "Gracias por ir mandándome tus registros.") +
            (N.dias >= 3 ? " Llevas " + N.dias + " días haciéndolo, y eso tiene mérito." : "");
        },
        ultimo: ["En lo último que me has mandado de «{h}», ", "Mirando tu último registro de «{h}», "],
        foco: {
          latencia: {
            por: function (a) { return a.inicio ? "Para empezar, vamos a entrenar algo sencillo: ganar unos segundos entre lo que notas y lo que haces."
              : "Lo que más te puede ayudar ahora es ganar unos segundos entre lo que notas y lo que haces, para que no sea la emoción la que decida por ti."; },
            p1: "Cuando notes que algo te activa (rabia, agobio, nervios), antes de reaccionar: para, respira una vez y fíjate dónde lo notas en el cuerpo. Solo unos segundos.",
            p2: "Prueba a hacerlo también 2 o 3 veces al día en algún momento tranquilo, para que no solo aparezca cuando estás mal.",
            p3: "Por la noche, piensa en un momento en el que lo hayas conseguido y apúntalo en la herramienta.",
            consigna: "No tengo que reaccionar al momento. Primero paro, luego decido."
          },
          densidad: {
            por: function () { return "Se ve que cuando paras y te escuchas te funciona. Ahora la idea es hacerlo más a menudo durante el día."; },
            p1: "Sigue parando cuando algo te active: respira y nota el cuerpo.",
            p2: "Añade 3 o 4 paradas cortas al día aunque no haga falta: al despertarte, antes de clase, antes de abrir redes o antes de dormir. Con 10 segundos basta.",
            p3: "Intenta que no pase ningún día sin al menos una, y apúntala aunque sea breve.",
            consigna: "No paro solo cuando estoy mal. Paro para conocerme."
          },
          continuidad: {
            por: function () { return "Ya consigues parar y lo haces a menudo. El siguiente paso es usarlo para hacer cosas que te importan, aunque cuesten."; },
            p1: "Mantén la pausa antes de reaccionar.",
            p2: "Mantén también las paradas cortas del día.",
            p3: "Cada día, haz una cosa pequeña que te acerque a lo que te importa aunque tengas nervios, y apunta si la has hecho (1) o no (0).",
            consigna: "No necesito estar bien para empezar. Empiezo pequeño."
          }
        },
        frase: "🧭 Una frase para tener a mano:",
        cierre: ["Sigue mandándome tus registros, me ayudan a saber cómo estás. No tiene que salir perfecto.", "Si te apetece contarme algo de estos días, escríbeme por aquí. Y sigue mandándome tus registros, aunque sean cortos."]
      },
      nino: {
        hola: ["Hola, he estado revisando los registros que me habéis ido enviando.", "Hola, gracias por enviarme los registros de estos días.", "Hola, os escribo después de revisar con calma lo que me habéis enviado."],
        recibido: function (a, hs, V) {
          var N = a.nuevo, h = hs.length === 1 ? "«" + hs[0] + "»" : hs.length ? lista(hs, "y") : "";
          return (h ? V(["Gracias por los registros de " + h + ".", "He visto lo que me habéis ido enviando de " + h + "."], "rec") : "Gracias por los registros de estos días.") +
            (N.dias >= 3 ? " Ya van " + N.dias + " días con registros, y eso le ayuda mucho." : "");
        },
        ultimo: ["En lo último que me habéis enviado, de «{h}», ", "Mirando el último registro de «{h}», "],
        evol: {
          inicio: ["Son los primeros registros y ya me ayudan a conocer cómo vive estas situaciones y cómo responde su cuerpo."],
          mas: ["Se nota que estos días lo habéis podido hacer más a menudo, y esa constancia es lo que más le ayuda."],
          igual: ["Mantenéis un ritmo parecido al de las semanas anteriores, y eso es lo que permite que lo vaya haciendo suyo."],
          menos: ["Estos días ha habido algo menos de registros. Es normal, hay semanas más complicadas; lo importante es retomarlo sin presión."]
        },
        fort: {
          act: function (N) { return "Cuando practica, la activación baja de media de " + coma(N.actAntes) + " a " + coma(N.actDespues) + ", y eso me dice que su cuerpo empieza a calmarse cuando se para a escucharlo."; },
          masDias: function () { return "Se nota el esfuerzo de todos por hacerlo más a menudo."; },
          constancia: function (N) { return "Lo estáis haciendo unos " + coma(N.diasSem) + " días por semana, con una constancia que vale mucho."; },
          lado: function (N) { return "En un " + N.pctLado + "% de las veces ha podido tener al mono a su lado, acompañándolo en vez de pelearse con él."; },
          cv: function (N) { return "Ha hecho una acción valiente en " + N.cv.unos + " de " + N.cv.n + " días, aunque los nervios estuvieran presentes."; },
          valiosa: function () { return "Cuando ha aparecido el malestar, más veces ha podido afrontarlo que evitarlo."; },
          base: "Solo el hecho de pararse a registrarlo ya es aprender a escucharse por dentro."
        },
        paso: {
          primero: [""],
          mantiene: ["Seguimos un poco más con lo que os propuse la última vez, porque necesita tiempo para asentarse."],
          avanza: ["Como lo que os propuse la última vez ya va cogiendo forma, damos un paso más."],
          retrocede: ["Esta semana volvemos un paso atrás, y no es ningún problema: es normal que haya semanas más difíciles."]
        },
        foco: {
          latencia: {
            por: function (a) {
              var s = a.senales.latencia.map(function (x) { return x[0]; });
              var r = s.indexOf("evit") >= 0 ? ", porque cuando aparece el malestar todavía tiende a evitarlo"
                : s.indexOf("mono") >= 0 || s.indexOf("act") >= 0 ? ", porque a menudo la emoción todavía va por delante" : "";
              return (a.inicio ? "Para empezar, lo que vamos a priorizar" : "Lo que ahora conviene priorizar") +
                " es ayudarle a hacer una pequeña pausa entre lo que nota por dentro y lo que hace" + (a.inicio ? "" : r) + ".";
            },
            p1: "Cuando notéis que la emoción sube (enfado, bloqueo, nervios), antes de corregir o resolver, ayudadle a parar: una respiración juntos y preguntadle dónde lo nota en el cuerpo, sin prisa.",
            p2: "Practicad esta pausa en algún momento tranquilo del día, como un juego, para que no aparezca solo cuando está mal.",
            p3: "Por la noche, recordad juntos un momento en el que lo haya conseguido y registradlo en la herramienta como hasta ahora.",
            consigna: "Primero paro, respiro y miro dónde lo noto. Después decido."
          },
          densidad: {
            por: function () { return "Veo que cuando se para y escucha lo que nota, le funciona. Ahora conviene que estas paradas aparezcan más a menudo durante el día."; },
            p1: "Seguid haciendo la pausa cuando aparezca la emoción: parar, respirar y notar el cuerpo.",
            p2: "Añadid 2 o 3 paradas cortas al día en momentos tranquilos: al levantarse, al volver del colegio y antes de dormir. Unos segundos con la mano en la barriga o en el pecho son suficientes.",
            p3: "Intentad que no pase ningún día sin al menos una parada, y registradla aunque sea breve.",
            consigna: "Mi cuerpo y yo somos un equipo: lo escucho también cuando todo va bien."
          },
          continuidad: {
            por: function () { return "Los registros me dicen que ya consigue parar y que lo hace con regularidad. Ahora toca sostenerlo y llevarlo a pequeños retos valientes."; },
            p1: "Mantened la pausa cuando aparezca la emoción.",
            p2: "Mantened también las paradas cortas del día.",
            p3: "Cada día, elegid juntos un pequeño reto valiente y celebrad el intento, aunque los nervios sigan ahí. Lo importante es hacerlo, no que salga perfecto.",
            consigna: "Puedo hacer cosas valientes aunque tenga nervios."
          }
        },
        semana: "Para esta semana os propongo:",
        frase: "🧭 Una frase para recordar juntos:",
        dedicatoria: ["Si queréis, decidle de mi parte que he visto sus registros y que estoy muy contento de cómo lo está haciendo.", "Y transmitidle de mi parte que he visto todo lo que está practicando y que lo está haciendo muy bien."],
        cierre: ["Seguid enviándome los registros como hasta ahora; me ayudan mucho a ajustar lo que trabajamos. Me gustará saber también qué notáis vosotros en el día a día.",
          "Cualquier cambio que veáis en casa, por pequeño que sea, me lo podéis contar por aquí. Seguid enviándome los registros sin presión: no hace falta que salga perfecto."]
      }
    },
    ca: {
      base: {
        hola: ["Hola, he revisat els registres que m'has anat enviant 🌱", "Hola, gràcies per anar-me enviant els teus registres 🌱", "Hola, he estat mirant amb calma el que m'has enviat aquests dies 🌱"],
        recibido: function (a, hs, V) {
          var N = a.nuevo, h = hs.length === 1 ? "«" + hs[0] + "»" : hs.length ? lista(hs, "i") : "";
          var dias = N.dias >= 3 ? " Ja són " + N.dias + " dies amb registres, i això es nota." : "";
          return (h ? V(["Gràcies pels registres de " + h + ".", "He vist el que m'has anat enviant de " + h + ".", "M'han arribat els teus registres de " + h + " i els he llegit amb calma."], "rec")
            : V(["Gràcies pels registres d'aquests dies.", "He vist el que m'has anat enviant."], "rec")) + dias;
        },
        ultimo: ["Del darrer que m'has enviat, de «{h}», ", "En el registre de «{h}» que m'acaba d'arribar, ", "Mirant el teu darrer registre de «{h}», "],
        evol: {
          inicio: ["És l'inici dels teus registres i ja em serveixen per anar coneixent com estàs i com respon el teu cos.", "Són els primers registres i ja m'ajuden a entendre com vius aquests moments."],
          mas: ["Respecte de les setmanes anteriors has registrat més dies, i això ja és entrenar la capacitat de mirar cap endins.", "Comparat amb les setmanes anteriors ho fas més sovint, i aquesta constància és la que fa que el canvi s'assenti."],
          igual: ["Mantens un ritme semblant al de les setmanes anteriors, i aquesta constància és la que permet que el canvi s'assenti.", "Continues amb un ritme semblant al de les setmanes anteriors, i això té molt de valor."],
          menos: ["Has registrat una mica menys que les setmanes anteriors. No passa res, és normal que hi hagi setmanes així; l'important és reprendre-ho sense exigència.", "Aquests dies hi ha hagut menys registres que abans. És normal que hi hagi setmanes més difícils; l'important és tornar-hi sense exigir-te."]
        },
        fort: {
          act: function (N) { return "Quan practiques, l'activació baixa de mitjana de " + coma(N.actAntes) + " a " + coma(N.actDespues) + ", i això em diu que el teu cos comença a fiar-se quan t'atures a acompanyar-lo."; },
          masDias: function () { return "Es nota l'esforç per fer-ho més sovint."; },
          constancia: function (N) { return "Has registrat uns " + coma(N.diasSem) + " dies per setmana, amb una constància que val molt."; },
          lado: function (N) { return "Un " + N.pctLado + "% de les vegades has pogut tenir el mono al teu costat, acompanyant-lo en lloc de barallar-t'hi."; },
          cv: function (N) { return "Has fet una acció amb valor " + N.cv.unos + " de " + N.cv.n + " dies, encara que la sensació hi fos present."; },
          valiosa: function () { return "Quan ha aparegut el malestar, has pogut respondre més vegades des del que t'importa que des de l'evitació."; },
          base: "Només el fet d'aturar-te a registrar-ho ja és entrenar la presència interna."
        },
        paso: {
          primero: [""],
          mantiene: ["Seguim una mica més amb el que et vaig proposar la darrera vegada, perquè necessita temps per assentar-se.", "Mantenim el que et vaig proposar la darrera vegada: aquestes coses necessiten unes setmanes per fer-se pròpies."],
          avanza: ["Com que el que et vaig proposar la darrera vegada ja va agafant forma, feim una passa més.", "El que et vaig proposar la darrera vegada ja va agafant forma, així que podem fer una passa més."],
          retrocede: ["Aquesta setmana tornam una passa enrere, i no és cap problema: és normal que hi hagi setmanes més difícils i reforçar la base forma part del procés."]
        },
        foco: {
          latencia: {
            por: function (a) {
              var s = a.senales.latencia.map(function (x) { return x[0]; });
              var r = s.indexOf("mono") >= 0 ? "sovint l'activació decideix abans que tu"
                : s.indexOf("evit") >= 0 ? "quan apareix el malestar encara tendeix a guanyar l'evitació"
                : s.indexOf("act") >= 0 ? "l'activació encara baixa poc després de practicar"
                : s.indexOf("L") >= 0 ? "encara et costa trobar aquest espai abans de reaccionar" : "";
              return a.inicio ? "Per començar, el que prioritzarem és guanyar uns segons entre el que notes per dins i el que fas."
                : "El que veig que ara convé prioritzar és guanyar uns segons entre el que notes per dins i el que fas" + (r ? ", perquè als registres veig que " + r : "") + ".";
            },
            p1: "Quan notis que l'activació puja, atura't abans d'actuar: digues mentalment STOP, fes una respiració i localitza on ho notes dins el cos. Només observa uns segons.",
            p2: "Intenta fer aquesta pausa almanco 3 vegades al dia, també en algun moment tranquil, perquè no depengui només del malestar.",
            p3: "Al vespre, dedica 2 minuts a revisar en quins moments ho has aconseguit i registra-ho a l'eina com fins ara.",
            consigna: "La meva tasca no és respondre millor de cop. La meva tasca és guanyar uns segons abans de respondre."
          },
          densidad: {
            por: function (a) {
              var s = a.senales.densidad.map(function (x) { return x[0]; });
              var r = s.indexOf("dias") >= 0 ? "de moment registres pocs dies a la setmana" : "de moment només practiques alguns dies de la setmana";
              return "Veig que aturar-te i acompanyar el que notes et va bé. Ara convé que aquestes aturades siguin més freqüents durant el dia, perquè " + r + ".";
            },
            p1: "Continua fent la pausa quan aparegui l'activació: STOP, respiració i sensació dins el cos.",
            p2: "Afegeix aturades curtes encara que no faci falta: unes 4 o 5 al dia, de 10 a 20 segons, duent l'atenció al pit, a l'estómac o al coll. T'ajudarà associar-les a qualque cosa que ja fas (després de dinar, en pujar al cotxe, abans d'obrir el mòbil).",
            p3: "Intenta que no passi cap dia sense almanco una aturada, i registra-la encara que sigui breu.",
            consigna: "No practic per llevar-me res. Practic perquè el meu cos sàpiga que som aquí."
          },
          continuidad: {
            por: function (a) {
              var s = a.senales.continuidad.map(function (x) { return x[0]; });
              return "Els registres em diuen que ja aconsegueixes aturar-te i que ho fas amb regularitat. El que toca ara és sostenir-ho en el temps i dur-ho cap al que t'importa" +
                (s.indexOf("cv") >= 0 ? ", perquè encara costa convertir aquesta calma en accions amb valor" : "") + ".";
            },
            p1: "Mantén la pausa abans de respondre quan notis activació.",
            p2: "Mantén també les aturades curtes al llarg del dia, com ja estàs fent.",
            p3: "Cada dia, tria una acció petita que t'acosti al que t'importa i fes-la encara que la sensació continuï present. Anota només si l'has feta (1) o no (0).",
            consigna: "No necessit estar bé per començar. Començ petit perquè el meu cos torni a confiar."
          }
        },
        semana: "Per a aquesta setmana et propòs:",
        pasos: ["Passa 1 · ", "Passa 2 · ", "Passa 3 · "],
        linea: null,
        frase: "🧭 Queda't amb aquesta frase:",
        screening: function (s) {
          if (s.code3) return (s.segReciente
              ? "Continua fent, almanco una vegada per setmana, el registre de seguiment del Screening, com ja has fet aquests dies."
              : "També et deman que, almanco una vegada per setmana, facis el registre de seguiment del Screening. M'ajuda a veure la teva evolució amb més detall.") +
            " Són uns 2-3 minuts: entra com a pacient, tria «Ya tengo mi código de seguimiento» i escriu el teu codi: *" + s.code3 + "*.\n" + URL_SCREENING;
          if (s.hecho) return "També et deman que, almanco una vegada per setmana, facis el registre de seguiment del Screening. Entra com a pacient i tria «Ya tengo mi código de seguimiento»; si no tens el codi a mà, demana-me'l per aquí.\n" + URL_SCREENING;
          return "Per poder veure la teva evolució amb més detall, et deman que facis l'autoavaluació del Screening TEC/AIS. Es fa en uns 10-15 minuts, no hi ha respostes correctes ni incorrectes" +
            (s.codigoPaciente ? " i, en començar, et demanarà el teu codi de pacient: *" + s.codigoPaciente + "*" : "") +
            ". En acabar et donaré un codi perquè, a partir d'aquí, facis el registre de seguiment almanco una vegada per setmana.\n" + URL_SCREENING;
        },
        cierre: ["Continua enviant-me els teus registres com fins ara, així puc anar veient la teva evolució i ajustar el que treballam. No cal que surti perfecte: l'important és fer-ho amb presència i no amb exigència.",
          "Continua enviant-me el que vagis registrant; m'ajuda molt a acompanyar-te entre sessions. No cal que surti perfecte, l'important és fer-ho amb presència i sense exigència.",
          "Qualsevol cosa que notis aquests dies me la pots contar per aquí. No cal que surti perfecte: l'important és fer-ho amb presència i no amb exigència."],
        firma: "Tòfol Villalonga"
      },
      adolescente: {
        hola: ["Hola, he estat mirant el que m'has enviat.", "Hola, gràcies per enviar-me els teus registres.", "Hola, ja he vist el que m'has anat enviant."],
        recibido: function (a, hs, V) {
          var N = a.nuevo, h = hs.length === 1 ? "«" + hs[0] + "»" : hs.length ? lista(hs, "i") : "";
          return (h ? V(["Gràcies per anar-me enviant " + h + ".", "He vist els teus registres de " + h + "."], "rec") : "Gràcies per anar-me enviant els teus registres.") +
            (N.dias >= 3 ? " Ja fa " + N.dias + " dies que ho fas, i això té mèrit." : "");
        },
        ultimo: ["En el darrer que m'has enviat de «{h}», ", "Mirant el teu darrer registre de «{h}», "],
        foco: {
          latencia: {
            por: function (a) { return a.inicio ? "Per començar, entrenarem una cosa senzilla: guanyar uns segons entre el que notes i el que fas."
              : "El que més et pot ajudar ara és guanyar uns segons entre el que notes i el que fas, perquè no sigui l'emoció la que decideixi per tu."; },
            p1: "Quan notis que qualque cosa t'activa (ràbia, agobi, nervis), abans de reaccionar: atura't, respira una vegada i fixa't on ho notes dins el cos. Només uns segons.",
            p2: "Prova de fer-ho també 2 o 3 vegades al dia en algun moment tranquil, perquè no aparegui només quan estàs malament.",
            p3: "Al vespre, pensa en un moment en què ho hagis aconseguit i apunta-ho a l'eina.",
            consigna: "No he de reaccionar a l'instant. Primer m'atur, després decidesc."
          },
          densidad: {
            por: function () { return "Es veu que quan t'atures i t'escoltes et funciona. Ara la idea és fer-ho més sovint durant el dia."; },
            p1: "Continua aturant-te quan qualque cosa t'activi: respira i nota el cos.",
            p2: "Afegeix 3 o 4 aturades curtes al dia encara que no faci falta: en despertar-te, abans de classe, abans d'obrir xarxes o abans de dormir. Amb 10 segons basta.",
            p3: "Intenta que no passi cap dia sense almanco una, i apunta-la encara que sigui breu.",
            consigna: "No m'atur només quan estic malament. M'atur per conèixer-me."
          },
          continuidad: {
            por: function () { return "Ja aconsegueixes aturar-te i ho fas sovint. La passa següent és fer-ho servir per fer coses que t'importen, encara que costin."; },
            p1: "Mantén la pausa abans de reaccionar.",
            p2: "Mantén també les aturades curtes del dia.",
            p3: "Cada dia, fes una cosa petita que t'acosti al que t'importa encara que tenguis nervis, i apunta si l'has feta (1) o no (0).",
            consigna: "No necessit estar bé per començar. Començ petit."
          }
        },
        frase: "🧭 Una frase per tenir a mà:",
        cierre: ["Continua enviant-me els teus registres, m'ajuden a saber com estàs. No ha de sortir perfecte.", "Si et ve de gust contar-me qualque cosa d'aquests dies, escriu-me per aquí. I continua enviant-me els registres, encara que siguin curts."]
      },
      nino: {
        hola: ["Hola, he estat revisant els registres que m'heu anat enviant.", "Hola, gràcies per enviar-me els registres d'aquests dies.", "Hola, us escric després de revisar amb calma el que m'heu enviat."],
        recibido: function (a, hs, V) {
          var N = a.nuevo, h = hs.length === 1 ? "«" + hs[0] + "»" : hs.length ? lista(hs, "i") : "";
          return (h ? V(["Gràcies pels registres de " + h + ".", "He vist el que m'heu anat enviant de " + h + "."], "rec") : "Gràcies pels registres d'aquests dies.") +
            (N.dias >= 3 ? " Ja són " + N.dias + " dies amb registres, i això l'ajuda molt." : "");
        },
        ultimo: ["En el darrer que m'heu enviat, de «{h}», ", "Mirant el darrer registre de «{h}», "],
        evol: {
          inicio: ["Són els primers registres i ja m'ajuden a conèixer com viu aquestes situacions i com respon el seu cos."],
          mas: ["Es nota que aquests dies ho heu pogut fer més sovint, i aquesta constància és el que més l'ajuda."],
          igual: ["Manteniu un ritme semblant al de les setmanes anteriors, i això és el que permet que ho vagi fent seu."],
          menos: ["Aquests dies hi ha hagut una mica menys de registres. És normal, hi ha setmanes més complicades; l'important és reprendre-ho sense pressió."]
        },
        fort: {
          act: function (N) { return "Quan practica, l'activació baixa de mitjana de " + coma(N.actAntes) + " a " + coma(N.actDespues) + ", i això em diu que el seu cos comença a calmar-se quan s'atura a escoltar-lo."; },
          masDias: function () { return "Es nota l'esforç de tots per fer-ho més sovint."; },
          constancia: function (N) { return "Ho feis uns " + coma(N.diasSem) + " dies per setmana, amb una constància que val molt."; },
          lado: function (N) { return "Un " + N.pctLado + "% de les vegades ha pogut tenir el mono al seu costat, acompanyant-lo en lloc de barallar-s'hi."; },
          cv: function (N) { return "Ha fet una acció valenta " + N.cv.unos + " de " + N.cv.n + " dies, encara que els nervis hi fossin presents."; },
          valiosa: function () { return "Quan ha aparegut el malestar, més vegades l'ha pogut afrontar que no evitar."; },
          base: "Només el fet d'aturar-se a registrar-ho ja és aprendre a escoltar-se per dins."
        },
        paso: {
          primero: [""],
          mantiene: ["Seguim una mica més amb el que us vaig proposar la darrera vegada, perquè necessita temps per assentar-se."],
          avanza: ["Com que el que us vaig proposar la darrera vegada ja va agafant forma, feim una passa més."],
          retrocede: ["Aquesta setmana tornam una passa enrere, i no és cap problema: és normal que hi hagi setmanes més difícils."]
        },
        foco: {
          latencia: {
            por: function (a) {
              var s = a.senales.latencia.map(function (x) { return x[0]; });
              var r = s.indexOf("evit") >= 0 ? ", perquè quan apareix el malestar encara tendeix a evitar-lo"
                : s.indexOf("mono") >= 0 || s.indexOf("act") >= 0 ? ", perquè sovint l'emoció encara va per davant" : "";
              return (a.inicio ? "Per començar, el que prioritzarem" : "El que ara convé prioritzar") +
                " és ajudar-li a fer una petita pausa entre el que nota per dins i el que fa" + (a.inicio ? "" : r) + ".";
            },
            p1: "Quan noteu que l'emoció puja (enfadament, bloqueig, nervis), abans de corregir o resoldre, acompanyau la pausa: una respiració junts i demanau-li on ho nota dins el cos, sense pressa.",
            p2: "Practicau aquesta pausa en algun moment tranquil del dia, com un joc, perquè no aparegui només quan està malament.",
            p3: "Al vespre, recordau junts un moment en què ho hagi aconseguit i registrau-ho a l'eina com fins ara.",
            consigna: "Primer m'atur, respir i mir on ho not. Després decidesc."
          },
          densidad: {
            por: function () { return "Veig que quan s'atura i escolta el que nota, li funciona. Ara convé que aquestes aturades apareguin més sovint durant el dia."; },
            p1: "Continuau fent la pausa quan aparegui l'emoció: aturar-se, respirar i notar el cos.",
            p2: "Afegiu 2 o 3 aturades curtes al dia en moments tranquils: en aixecar-se, en tornar de l'escola i abans de dormir. Uns segons amb la mà a la panxa o al pit són suficients.",
            p3: "Intentau que no passi cap dia sense almanco una aturada, i registrau-la encara que sigui breu.",
            consigna: "El meu cos i jo som un equip: l'escolt també quan tot va bé."
          },
          continuidad: {
            por: function () { return "Els registres em diuen que ja aconsegueix aturar-se i que ho fa amb regularitat. Ara toca sostenir-ho i dur-ho a petits reptes valents."; },
            p1: "Mantingueu la pausa quan aparegui l'emoció.",
            p2: "Mantingueu també les aturades curtes del dia.",
            p3: "Cada dia, triau junts un petit repte valent i celebrau l'intent, encara que els nervis hi continuïn. L'important és fer-ho, no que surti perfecte.",
            consigna: "Puc fer coses valentes encara que tengui nervis."
          }
        },
        semana: "Per a aquesta setmana us propòs:",
        frase: "🧭 Una frase per recordar junts:",
        dedicatoria: ["Si voleu, digau-li de part meva que he vist els seus registres i que estic molt content de com ho està fent.", "I transmeteu-li de part meva que he vist tot el que està practicant i que ho està fent molt bé."],
        cierre: ["Continuau enviant-me els registres com fins ara; m'ajuden molt a ajustar el que treballam. M'agradarà saber també què notau vosaltres en el dia a dia.",
          "Qualsevol canvi que vegeu a casa, per petit que sigui, me'l podeu contar per aquí. Continuau enviant-me els registres sense pressió: no cal que surti perfecte."]
      }
    }
  };

  /* Nombres de las herramientas en catalán (para el mensaje en catalán). */
  var NOMBRE_CA = {
    cuestionario_tec: "Qüestionari TEC", estado_mono: "Com duus el teu mono?", donde_esta_mono: "On és el mono?",
    donde_mono: "On és el teu mono?", agenda_atencional: "Agenda atencional", ais_curiosidad: "AIS des de la curiositat",
    bajar_alerta: "Baixar l'alerta", brujula_valores: "Brúixola de valors", acompanar_sensacion: "Acompanyar la sensació",
    ais_amor: "AIS des de l'amor", ais_muscular: "AIS muscular", mapa_atencion_interna: "Mapa intern",
    tracker_tec: "Tracker TEC", tracker_ais: "Tracker AIS", control_ira: "Control de la ràbia",
    retorno_trabajo: "Retorn a la feina", autorregistro: "Autorregistre", herramienta_diaria: "Eina diària",
    protocolo_ais: "Protocol AIS (àudio)", compromiso_semanal: "Compromís setmanal",
    honestidad_emocional: "Honestedat emocional", la_manada: "La manada (el perquè)",
    estoy_aqui_conmigo: "Som aquí amb mi", toco_desde_dentro: "Toc des de dins", pedalea_desde_dentro: "Pedala des de dins",
    cuento_familia: "La família d'en Koa (conte)", tiempo_limite: "El temps límit (petits)", fondos_frases: "Fons de frases",
    escalera_exposicion: "L'escala (exposició)", escalera_exposicion_ar: "L'escala · conduir (àrab)", exploradora_valiente: "L'exploradora valenta", mision_barrio: "Missió Barri",
    escalera_comidas: "L'escala dels menjars", ritual_calma: "Ritual diari · calma", rincon_calma: "Racó de calma",
    cuerpo_en_alerta: "Quan el cos continua en alerta", microaccion_valor: "Microacció amb valor",
    registro_texto: "Registre", autorregistro_hospital: "Autorregistre de l'hospital",
    eines_setmana: "Eines de la setmana", dolor_cronico: "Dolor crònic",
    llave_de_paso: "La clau de pas", recorrido_tec: "El meu recorregut", evaluacion_trauma: "Avaluació del trauma", entre_punto_y_punto: "Entre punt i punt", paso_a_paso: "Passa a passa, de tornada a mi"
  };

  /* Elige variante de forma estable: el mismo mensaje sale igual si lo regeneras,
     pero cambia de un feedback al siguiente. */
  function hash(s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; }
  function variador(a) {
    var semilla = a.codigo + "|" + a.nFeedbacks + "|" + (a.nuevos.length ? a.nuevos[a.nuevos.length - 1].k : "");
    return function (arr, k) { arr = Array.isArray(arr) ? arr : [arr]; return arr[hash(semilla + "|" + k) % arr.length]; };
  }
  /* {a|b}: «a» al paciente, «b» a la familia sobre el niño. */
  function persona(txt, perfil) {
    return String(txt).replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (m, a, b) { return perfil === "nino" ? b : a; });
  }

  /* a: resultado de analizar(). opts: { lang, nombreTool(id)→texto, modulo:{titulo}, screening } */
  function mensaje(a, opts) {
    opts = opts || {};
    var lang = opts.lang === "ca" ? "ca" : "es", perfil = a.perfil.tipo;
    var L = TXT[lang], T = {};
    Object.keys(L.base).forEach(function (k) { T[k] = L.base[k]; });
    var sobre = L[perfil] || {};
    Object.keys(sobre).forEach(function (k) {
      T[k] = (k === "foco") ? mezclarFoco(L.base.foco, sobre.foco) : sobre[k];
    });
    var V = variador(a), N = a.nuevo, F = T.foco[a.foco];
    function nombreDe(k) { return k.charAt(0) === "@" ? k.slice(1) : (lang === "ca" && NOMBRE_CA[k]) || (opts.nombreTool ? opts.nombreTool(k) : null) || k; }
    var hs = N.herramientas.slice(0, 3).map(nombreDe).filter(Boolean);

    // 1 · Lo que ha llegado + comentario específico de la herramienta del último registro
    var p1 = [T.recibido(a, hs, V), V(T.evol[a.evol], "evol")].join(" ");
    var esp = comentarios(a, lang, perfil, V, nombreDe, T);
    // 2 · Fortalezas generales que no repitan lo que ya dice el comentario
    var usadas = esp.temas || {};
    if (a.evol === "mas") usadas.masDias = 1;   // ya lo dice la evolución
    var fortTxt = a.fortalezas.filter(function (k) { return !usadas[k]; }).slice(0, esp.texto ? 1 : 2).map(function (k) { return T.fort[k](N); });
    if (!fortTxt.length && !esp.texto) fortTxt.push(T.fort.base);
    var p2 = [esp.texto, fortTxt.join(" ")].filter(Boolean).join(" ");
    // 3 · Foco de la semana
    var p3 = [V(T.paso[a.paso], "paso"), F.por(a)].filter(Boolean).join(" ");
    var pasos = T.semana + "\n" + [F.p1, F.p2, F.p3].map(function (s, i) { return T.pasos[i] + s; }).join("\n");
    var linea = perfil !== "nino" && opts.modulo && opts.modulo.titulo && T.linea ? T.linea(opts.modulo.titulo) : "";
    // El Screening TEC es para adolescentes y adultos.
    var scr = opts.screening && perfil !== "nino" ? T.screening(opts.screening) : "";
    var ded = T.dedicatoria ? V(T.dedicatoria, "ded") : "";
    var trauma = a.traumaNueva ? (lang === "ca" ? "Gràcies també per haver completat l'avaluació que et vaig demanar. La revisaré amb calma i en parlarem a la propera sessió."
      : "Gracias también por haber completado la evaluación que te pedí. La revisaré con calma y lo hablaremos en la próxima sesión.") : "";
    return [V(T.hola, "hola"), p1, trauma, p2, p3, pasos, linea, T.frase + "\n«" + F.consigna + "»", scr, ded, V(T.cierre, "cierre"), T.firma]
      .filter(Boolean).map(function (x) { return persona(x, perfil); }).join("\n\n");
  }
  function mezclarFoco(base, sobre) {
    var o = {};
    Object.keys(base).forEach(function (f) { o[f] = {}; Object.keys(base[f]).forEach(function (k) { o[f][k] = (sobre[f] && sobre[f][k] != null) ? sobre[f][k] : base[f][k]; }); });
    return o;
  }

  /* Comentario propio de la herramienta del último registro (y, si hay, de una
     segunda herramienta usada estos días). Devuelve { texto, temas }. */
  function comentarios(a, lang, perfil, V, nombreDe, T) {
    var keys = [a.ultimoKey].concat(Object.keys(a.porHerr).filter(function (k) { return k !== a.ultimoKey; })
      .sort(function (x, y) { return a.porHerr[y].length - a.porHerr[x].length; }));
    var out = [], temas = {};
    for (var i = 0; i < keys.length && out.length < 2; i++) {
      var k = keys[i]; if (!k) continue;
      ORDEN = out.length;
      var c = comentarioDe(k, a.porHerr[k], a.porHerrPrev[k] || [], lang, perfil);
      if (!c) continue;
      var intro = out.length === 0 && k === a.ultimoKey ? V(T.ultimo, "ult").replace("{h}", nombreDe(k))
        : (lang === "ca" ? "Amb «" : "Con «") + nombreDe(k) + "», ";
      if (lang === "ca") intro = intro.replace(/\bde «(?=[AEIOUÀÈÉÍÒÓÚHaeiouàèéíòóúh])/, "d'«");
      out.push(intro ? intro + minuscula(c.texto) : c.texto);
      (c.temas || []).forEach(function (t) { temas[t] = 1; });
    }
    return { texto: out.join(" "), temas: temas };
  }
  function minuscula(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  /* ───────── Comentario propio de cada herramienta ─────────
     Cada entrada recibe los registros nuevos (xs) y los anteriores (prev) de esa
     herramienta y devuelve { es, ca, temas } o null. En los textos, {a|b}: «a»
     al paciente, «b» a la familia sobre el niño. «temas» evita que luego se
     repita la misma idea entre las fortalezas generales. */
  function ultimoDe(xs) { return xs[xs.length - 1].r; }
  function pares(xs, fa, fb) {
    return xs.map(function (x) { return [num(fa(x.r)), num(fb(x.r))]; }).filter(function (p) { return p[0] != null && p[1] != null; });
  }
  function mediaPar(ps, i) { return r1(media(ps.map(function (p) { return p[i]; }))); }
  /* «mi pareja» (palabras del paciente) → «tu pareja» / «su pareja». */
  function aTi(s, lang) {
    s = String(s || "");
    return lang === "ca" ? s.replace(/^(el |la |els |les )?(meu|meva|meus|meves) /i, function (m, art, p) { return (art || "") + "{" + p.replace(/^me/i, "te") + "|" + p.replace(/^me/i, "se") + "} "; })
      : s.replace(/^mis /i, "{tus|sus} ").replace(/^mi /i, "{tu|su} ");
  }
  /* «Pecho» → «el pecho» / «el pit». */
  var ZONAS = { pecho: ["el pecho", "el pit"], cuello: ["el cuello", "el coll"], barriga: ["la barriga", "la panxa"], vientre: ["el vientre", "el ventre"],
    garganta: ["la garganta", "la gola"], hombros: ["los hombros", "les espatlles"], manos: ["las manos", "les mans"], estomago: ["el estómago", "l'estómac"] };
  function zonaTxt(z, lang) {
    var k = String(z || "").split(/[ ,(]/)[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return ZONAS[k] ? ZONAS[k][lang === "ca" ? 1 : 0] : textoCorto(z, 30).toLowerCase();
  }
  function textoCorto(s, n) { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > (n || 70) ? s.slice(0, n || 70).replace(/\s+\S*$/, "") + "…" : s; }

  /* Antes → después: alerta, intensidad, activación, ansiedad. */
  var ORDEN = 0;   // posición del comentario dentro del mensaje (para no repetir frases)
  function de(que, lang) { return !que ? "" : " " + (lang === "ca" && /^[aeiouàèéíòóúh]/i.test(que) ? "d'" : "de ") + que; }
  function comentarioAntesDespues(xs, prev, fa, fb, que) {
    var ps = pares(xs, fa, fb); if (!ps.length) return null;
    var u = ps[ps.length - 1], baja = r1(u[0] - u[1]);
    var pp = pares(prev, fa, fb), bajaPrev = pp.length ? r1(mediaPar(pp, 0) - mediaPar(pp, 1)) : null;
    var bajaMed = r1(mediaPar(ps, 0) - mediaPar(ps, 1));
    var es, ca;
    que = que || {};
    var deEs = de(que.es, "es"), deCa = de(que.ca, "ca"), v = ORDEN % 3;
    // «la alerta ha bajado de 8 a 3» si se sabe qué se mide; si no, «has pasado de 4 a 2».
    var baseEs = que.es && baja > 0 ? "la " + que.es + " ha bajado de " + coma(u[0]) + " a " + coma(u[1]) : "{has|ha} pasado de " + coma(u[0]) + " a " + coma(u[1]) + deEs;
    var baseCa = que.ca && baja > 0 ? (/^[aeiouàèéíòóúh]/i.test(que.ca) ? "l'" : "la ") + que.ca + " ha baixat de " + coma(u[0]) + " a " + coma(u[1]) : "{has|ha} passat de " + coma(u[0]) + " a " + coma(u[1]) + deCa;
    if (baja >= 2) {
      es = baseEs + ". " + ["Esto me dice que, cuando {te paras a acompañar lo que notas|se para a acompañar lo que nota}, {tu|su} cuerpo responde y se va calmando.",
        "Es una bajada clara: {tu|su} cuerpo empieza a fiarse cuando {le dedicas|le dedica} ese momento.", "Se nota que la práctica {te|le} está sirviendo."][v];
      ca = baseCa + ". " + ["Això em diu que, quan {t'atures a acompanyar el que notes|s'atura a acompanyar el que nota}, el {teu|seu} cos respon i es va calmant.",
        "És una baixada clara: el {teu|seu} cos comença a fiar-se quan {li dediques|li dedica} aquest moment.", "Es nota que la pràctica {et|li} està servint."][v];
    } else if (baja > 0) {
      es = baseEs + ". Aunque la bajada sea pequeña, lo importante es haber {podido quedarte|podido quedarse} con la sensación sin huir de ella.";
      ca = baseCa + ". Encara que la baixada sigui petita, l'important és haver {pogut quedar-te|pogut quedar-se} amb la sensació sense fugir-ne.";
    } else {
      es = (que.es ? "{tu|su} " + que.es + " se ha quedado en " : "el nivel se ha quedado en ") + coma(u[1]) + ". No pasa nada: el objetivo no es que baje, sino {poder estar con lo que notas|que pueda estar con lo que nota} sin pelearse con ello, y eso ya lo {estás|está} haciendo al practicar.";
      ca = "el {teu|seu} nivell" + deCa + " s'ha quedat a " + coma(u[1]) + ". No passa res: l'objectiu no és que baixi, sinó {poder estar amb el que notes|que pugui estar amb el que nota} sense barallar-s'hi, i això ja ho {fas|fa} en practicar.";
    }
    if (bajaPrev != null && bajaMed > bajaPrev + 0.9) {
      es += " Además, ahora baja más que en las semanas anteriores (de media " + coma(bajaMed) + " puntos frente a " + coma(bajaPrev) + ").";
      ca += " A més, ara baixa més que les setmanes anteriors (de mitjana " + coma(bajaMed) + " punts davant " + coma(bajaPrev) + ").";
    }
    return { es: es, ca: ca, temas: ["act"] };
  }

  /* Escala de miedo (La escalera y Paso a paso). */
  function comentarioEscala(r) {
    return { es: "{has preparado|ha preparado} {tu|su} escala de miedo con " + r.escala + " situaciones, de " + r.usa_min + " a " + r.usa_max + " USA. Ordenarla de menos a más es lo que permite subir peldaño a peldaño, sin saltos que asusten." +
        (r.saltos ? " Hay algún salto grande entre situaciones: conviene añadir algún paso intermedio antes de llegar ahí." : ""),
      ca: "{has preparat|ha preparat} la {teva|seva} escala de por amb " + r.escala + " situacions, de " + r.usa_min + " a " + r.usa_max + " USA. Ordenar-la de menys a més és el que permet pujar escaló a escaló, sense salts que facin por." +
        (r.saltos ? " Hi ha qualque salt gran entre situacions: convé afegir-hi qualque passa intermèdia abans d'arribar-hi." : ""), temas: [] };
  }
  var COMENTA = {
    bajar_alerta: function (xs, prev) {
      var c = comentarioAntesDespues(xs, prev, function (r) { return pick(r.antes, r.alerta_antes); }, function (r) { return pick(r.despues, r.alerta_despues); }, { es: "alerta", ca: "alerta" });
      var r = ultimoDe(xs);
      if (c && r.ancla) { c.es += " Me gusta que {te hayas anclado|se haya anclado} en «" + textoCorto(r.ancla, 40) + "»: tenerlo localizado hace que sea más fácil volver ahí la próxima vez."; c.ca += " M'agrada que {t'hagis ancorat|s'hagi ancorat} a «" + textoCorto(r.ancla, 40) + "»: tenir-ho localitzat fa que sigui més fàcil tornar-hi la propera vegada."; }
      if (c && r.motivo === "verde") { c.es += " Y {lo has hecho|lo ha hecho} sin necesidad, en calma, que es justamente cuando más se entrena."; c.ca += " I {ho has fet|ho ha fet} sense necessitat, en calma, que és justament quan més s'entrena."; c.temas.push("basal"); }
      return c;
    },
    acompanar_sensacion: function (xs, prev) {
      var c = comentarioAntesDespues(xs, prev, function (r) { return r.intensidad_antes; }, function (r) { return r.intensidad_despues; }, { es: "intensidad", ca: "intensitat" });
      var r = ultimoDe(xs);
      if (c && r.zona) { c.es += " {Notarlo|Que lo note} en " + zonaTxt(r.zona, "es") + " y quedarse ahí, acompañándolo, es exactamente el trabajo."; c.ca += " {Notar-ho|Que ho noti} a " + zonaTxt(r.zona, "ca") + " i quedar-s'hi, acompanyant-ho, és exactament la feina."; }
      return c;
    },
    ais_muscular: function (xs, prev) {
      return comentarioAntesDespues(xs, prev, function (r) { return pick(r.activacion_antes, r.antes); }, function (r) { return pick(r.activacion_despues, r.despues); }, { es: "activación", ca: "activació" });
    },
    cuerpo_en_alerta: function (xs) {
      var r = ultimoDe(xs), a = num(r.activacion), f = num(r.alivio), lat = num(r.latencia);
      var val = ["Valiosa", "Asertiva", "Protectora necesaria"].indexOf(r.tipo_accion) >= 0, evi = ["Evitativa", "Compulsiva"].indexOf(r.tipo_accion) >= 0;
      var es = "", ca = "";
      if (a != null && f != null) { es = "la activación pasó de " + coma(a) + " a " + coma(f) + (lat != null ? " y {te tomaste|se tomó} unos " + lat + " segundos antes de actuar" : "") + "."; ca = "l'activació va passar de " + coma(a) + " a " + coma(f) + (lat != null ? " i {et vares prendre|es va prendre} uns " + lat + " segons abans d'actuar" : "") + "."; }
      if (val) { es += " Y la respuesta fue " + String(r.tipo_accion).toLowerCase() + ": aunque el cuerpo seguía en alerta, {elegiste|eligió} desde lo que {te|le} importa."; ca += " I la resposta va ser " + ({ Valiosa: "valuosa", Asertiva: "assertiva", "Protectora necesaria": "protectora necessària" })[r.tipo_accion] + ": encara que el cos continuava en alerta, {vares triar|va triar} des del que {t'|li }importa."; }
      else if (evi) { es += " Esta vez la respuesta fue más de evitar, y es normal cuando el cuerpo está tan activado; registrarlo ya es empezar a verlo con más distancia."; ca += " Aquesta vegada la resposta va ser més d'evitar, i és normal quan el cos està tan activat; registrar-ho ja és començar a veure-ho amb més distància."; }
      return es ? { es: es.trim(), ca: ca.trim(), temas: ["act", val ? "valiosa" : ""] } : null;
    },
    microaccion_valor: function (xs) {
      var unos = xs.filter(function (x) { return num(x.r.cv) === 1; });
      if (!unos.length) return { es: "estos días no ha salido la micro-acción con valor. No pasa nada: a veces conviene hacerla todavía más pequeña.", ca: "aquests dies no ha sortit la microacció amb valor. No passa res: de vegades convé fer-la encara més petita.", temas: ["cv"] };
      var d = unos[unos.length - 1].r.descripcion;
      return { es: "{has|ha} hecho la micro-acción con valor " + unos.length + " de " + xs.length + " días" + (d ? ", como «" + textoCorto(d, 50) + "»" : "") + ". Son pasos pequeños, pero son los que van construyendo el cambio.",
        ca: "{has|ha} fet la microacció amb valor " + unos.length + " de " + xs.length + " dies" + (d ? ", com «" + textoCorto(d, 50) + "»" : "") + ". Són passes petites, però són les que van construint el canvi.", temas: ["cv"] };
    },
    estado_mono: comentarioMono, donde_mono: comentarioMono, donde_esta_mono: comentarioMono,
    llave_de_paso: function (xs) {
      var r = ultimoDe(xs), es = [], ca = [], temas = [];
      if (r.resp != null || r.paradas != null) {
        es.push("{has hecho|ha hecho} " + (r.resp || 0) + " respiraciones curiosas y " + (r.paradas || 0) + " paradas de pensamiento");
        ca.push("{has fet|ha fet} " + (r.resp || 0) + " respiracions curioses i " + (r.paradas || 0) + " parades de pensament");
      }
      if (num(r.antes) != null && num(r.despues) != null) {
        var b = num(r.antes) > num(r.despues);
        es.push("el manómetro ha " + (b ? "bajado" : "quedado") + " de " + coma(r.antes) + " a " + coma(r.despues) + " entre el inicio y el cierre del día");
        ca.push("el manòmetre ha " + (b ? "baixat" : "quedat") + " de " + coma(r.antes) + " a " + coma(r.despues) + " entre l'inici i el tancament del dia");
        if (b) temas.push("act");
      }
      if (!es.length) return null;
      var tEs = es.join(", y ") + ".", tCa = ca.join(", i ") + ".";
      if (num(r.honestidad) > 0) { tEs += " Me alegra especialmente que {hayas podido|haya podido} expresar lo que {sentías|sentía} " + r.honestidad + " " + (r.honestidad == 1 ? "vez" : "veces") + " con un tono sereno, sin tener que justificarlo."; tCa += " M'alegra especialment que {hagis pogut|hagi pogut} expressar el que {senties|sentia} " + r.honestidad + " " + (r.honestidad == 1 ? "vegada" : "vegades") + " amb un to serè, sense haver-ho de justificar."; }
      if (num(r.limites) > 0) { tEs += " Y {has puesto|ha puesto} " + r.limites + " " + (r.limites == 1 ? "límite" : "límites") + ", que no es poca cosa."; tCa += " I {has posat|ha posat} " + r.limites + " " + (r.limites == 1 ? "límit" : "límits") + ", que no és poca cosa."; }
      if (num(r.racha) >= 3) { tEs += " Ya {llevas|lleva} " + r.racha + " días seguidos."; tCa += " Ja {duus|du} " + r.racha + " dies seguits."; }
      return { es: tEs, ca: tCa, temas: temas };
    },
    entre_punto_y_punto: function (xs) {
      var r = ultimoDe(xs), es = "", ca = "";
      if (r.plan && r.foco == null) return { es: "me gusta que {hayas preparado|haya preparado} el plan de partido: llevarlo pensado ayuda a volver al foco cuando aparece la tensión.", ca: "m'agrada que {hagis preparat|hagi preparat} el pla de partit: dur-lo pensat ajuda a tornar al focus quan apareix la tensió.", temas: [] };
      if (num(r.foco) != null) { es = "en pista la atención en la tarea está en " + coma(r.foco) + "/10" + (num(r.tension) != null ? " y la tensión corporal en " + coma(r.tension) + "/10" : "") + "."; ca = "a pista l'atenció en la tasca és de " + coma(r.foco) + "/10" + (num(r.tension) != null ? " i la tensió corporal de " + coma(r.tension) + "/10" : "") + "."; }
      if (r.fugas) { es += " Los momentos en que más se escapa la atención son «" + textoCorto(r.fugas, 50) + "»: ahí es justamente donde la pausa entre punto y punto tiene más sentido."; ca += " Els moments en què més s'escapa l'atenció són «" + textoCorto(r.fugas, 50) + "»: just aquí és on la pausa entre punt i punt té més sentit."; }
      if (num(r.antes) != null && num(r.despues) != null && num(r.antes) > num(r.despues)) { es += " En imaginación, la tensión baja de " + coma(r.antes) + " a " + coma(r.despues) + " al {quedarte|quedarse} con la escena."; ca += " En imaginació, la tensió baixa de " + coma(r.antes) + " a " + coma(r.despues) + " en {quedar-te|quedar-se} amb l'escena."; }
      return es ? { es: es.trim(), ca: ca.trim(), temas: ["act"] } : null;
    },
    recorrido_tec: function (xs, prev) {
      var r = ultimoDe(xs); if (r.etapa == null && r.prog14 == null) return null;
      var es = "", ca = "";
      if (r.etapa != null) { es = "{estás|está} en la etapa «" + textoCorto(r.etapa_txt || "", 30) + "»" + (r.dia_etapa ? " (día " + r.dia_etapa + ")" : "") + (r.pasos != null ? " y {llevas|lleva} " + r.pasos + " de " + r.pasos_total + " pasos hechos" : "") + ".";
        ca = "{ets|és} a l'etapa «" + textoCorto(r.etapa_txt || "", 30) + "»" + (r.dia_etapa ? " (dia " + r.dia_etapa + ")" : "") + (r.pasos != null ? " i {duus|du} " + r.pasos + " de " + r.pasos_total + " passes fetes" : "") + "."; }
      if (r.prog14 != null) {
        es += " La práctica programada va en " + r.prog14 + " de 14 días" + (r.calma != null && r.calma >= r.mal && r.calma > 0 ? ", y la mayoría en calma, sin esperar a estar mal: eso es justo lo que hace que el cuerpo aprenda" : "") + ".";
        ca += " La pràctica programada va per " + r.prog14 + " de 14 dies" + (r.calma != null && r.calma >= r.mal && r.calma > 0 ? ", i la majoria en calma, sense esperar a estar malament: això és just el que fa que el cos aprengui" : "") + ".";
      }
      var rp = prev.length ? num(ultimoDe(prev).ruido) : null;
      if (num(r.ruido) != null && rp != null && num(r.ruido) < rp - 0.4) { es += " Además, el ruido interno ha bajado de " + coma(rp) + " a " + coma(r.ruido) + "."; ca += " A més, el renou intern ha baixat de " + coma(rp) + " a " + coma(r.ruido) + "."; }
      return es ? { es: es.trim(), ca: ca.trim(), temas: [] } : null;
    },
    control_ira: function (xs, prev) {
      var r = ultimoDe(xs), a = num(r.nivel_inicial), b = num(r.nivel_final);
      if (a == null || b == null) return null;
      var de = r.desencadenante ? " (lo que lo desencadenó: " + minuscula(textoCorto(r.desencadenante, 40)) + ")" : "", deCa = r.desencadenante ? " (el que ho va desencadenar: " + minuscula(textoCorto(r.desencadenante, 40)) + ")" : "";
      var volver = /volver a lo que estaba|tornar al que/i.test(r.tecnica || ""), tec = r.tecnica && !volver;
      var es, ca;
      if (b < a) { es = "la activación pasó de " + a + " a " + b + " sobre 5" + de + (tec ? ", y lo que {usaste|usó} fue «" + textoCorto(r.tecnica, 40).replace(/\s*✅$/, "") + "»" : "") + ". Que el enfado baje sin tener que descargarlo hacia fuera es justamente lo que entrenamos.";
        ca = "l'activació va passar de " + a + " a " + b + " sobre 5" + deCa + (tec ? ", i el que {vares fer servir|va fer servir} va ser «" + textoCorto(r.tecnica, 40).replace(/\s*✅$/, "") + "»" : "") + ". Que l'enfadament baixi sense haver-lo de descarregar cap a fora és justament el que entrenam."; }
      else { es = "la activación se quedó en " + b + " sobre 5" + de + ". Aun así, {pararte|pararse} a registrarlo ya es abrir un espacio entre el enfado y la respuesta, y eso cuenta.";
        ca = "l'activació es va quedar a " + b + " sobre 5" + deCa + ". Tot i així, {aturar-te|aturar-se} a registrar-ho ja és obrir un espai entre l'enfadament i la resposta, i això compta."; }
      if (volver) { es += " Y {volviste|volvió} a lo que {estabas|estaba} haciendo, que es el mejor final posible."; ca += " I {vares tornar|va tornar} al que {estaves|estava} fent, que és el millor final possible."; }
      if (r.sensacion && !/no noto/i.test(r.sensacion)) { es += " Tener localizado dónde lo {notas|nota} (" + textoCorto(r.sensacion, 40).toLowerCase() + ") ayuda a frenarlo antes la próxima vez."; ca += " Tenir localitzat on ho {notes|nota} (" + textoCorto(r.sensacion, 40).toLowerCase() + ") ajuda a frenar-ho abans la propera vegada."; }
      return { es: es, ca: ca, temas: ["act"] };
    },
    exploradora_valiente: function (xs) {
      var r = ultimoDe(xs), m = r.mision ? "la misión «" + textoCorto(r.mision, 40) + "»" : "la misión", mc = r.mision ? "la missió «" + textoCorto(r.mision, 40) + "»" : "la missió";
      if (!r.logro) return null;
      var es = r.logro === "si" ? m + " salió del todo." : r.logro === "medias" ? m + " salió a medias, y eso ya es avanzar." : m + " todavía no ha salido, y no pasa nada: cada intento cuenta.";
      var ca = r.logro === "si" ? mc + " va sortir del tot." : r.logro === "medias" ? mc + " va sortir a mitges, i això ja és avançar." : mc + " encara no ha sortit, i no passa res: cada intent compta.";
      if (r.cara_antes && r.cara_despues && r.cara_despues > r.cara_antes) { es += " Me gusta ver que empezó con más preocupación y terminó con más calma."; ca += " M'agrada veure que va començar amb més preocupació i va acabar amb més calma."; }
      if (r.abrazo) { es += " Y que pidiera un abrazo en vez de repetir la pregunta es justo lo que estamos entrenando: buscar calma en el cuerpo y no en la seguridad de las respuestas."; ca += " I que demanàs una abraçada en lloc de repetir la pregunta és just el que entrenam: cercar calma en el cos i no en la seguretat de les respostes."; }
      if (r.sin_negociar === 1) { es += " Mantener el plan sin negociar no es fácil, y lo estáis haciendo muy bien."; ca += " Mantenir el pla sense negociar no és fàcil, i ho estau fent molt bé."; }
      else if (r.sin_negociar === 0) { es += " Si alguna vez se cede un poco es normal; la idea es ir manteniendo el plan cada vez un poco más."; ca += " Si qualque vegada se cedeix una mica és normal; la idea és anar mantenint el pla cada vegada una mica més."; }
      return { es: es, ca: ca, temas: ["valiosa"] };
    },
    mision_barrio: function (xs) {
      var r = ultimoDe(xs); if (!r.final) return null;
      var es = r.final === "si" ? "la salida llegó hasta el final" : r.final === "antes" ? "volvió antes de acabar la salida, y aun así haberlo intentado ya cuenta" : "esta vez no salió";
      var ca = r.final === "si" ? "la sortida va arribar fins al final" : r.final === "antes" ? "va tornar abans d'acabar la sortida, i tot i així haver-ho intentat ja compta" : "aquesta vegada no va sortir";
      if (num(r.antes) != null && num(r.despues) != null && r.final !== "no") { es += ", y la alarma pasó de " + r.antes + " a " + r.despues; ca += ", i l'alarma va passar de " + r.antes + " a " + r.despues; }
      es += "."; ca += ".";
      if (r.paso === "falsa") { es += " Que comprobara que era una falsa alarma es lo más valioso de la misión: el miedo avisaba de algo que no pasó."; ca += " Que comprovàs que era una falsa alarma és el més valuós de la missió: la por avisava d'una cosa que no va passar."; }
      if (r.frase_campeon) { es += " Me encanta su frase de campeón: «" + textoCorto(r.frase_campeon, 50) + "»."; ca += " M'encanta la seva frase de campió: «" + textoCorto(r.frase_campeon, 50) + "»."; }
      if (r.final === "no") { es += " Cuando cuesta, conviene bajar un nivel y volver a probar sin presión."; ca += " Quan costa, convé baixar un nivell i tornar-ho a provar sense pressió."; }
      return { es: es, ca: ca, temas: ["act", r.final === "si" ? "valiosa" : ""] };
    },
    ritual_calma: function (xs) {
      var hechos = xs.filter(function (x) { return x.r.audio === "conmigo"; }).length, resp = xs.filter(function (x) { return x.r.respeto === 1; }).length;
      if (!xs.some(function (x) { return x.r.audio || x.r.respeto != null; })) return null;
      var es = "el ritual se ha hecho juntos " + hechos + " de " + xs.length + " días" + (resp ? " y ha respetado el momento " + resp + " " + (resp === 1 ? "vez" : "veces") : "") + ".";
      var ca = "el ritual s'ha fet junts " + hechos + " de " + xs.length + " dies" + (resp ? " i ha respectat el moment " + resp + " " + (resp === 1 ? "vegada" : "vegades") : "") + ".";
      es += " Que os vea regularos a vosotros mientras lo hacéis es lo que más le enseña."; ca += " Que us vegi regular-vos a vosaltres mentre ho feis és el que més l'ensenya.";
      return { es: es, ca: ca, temas: [] };
    },
    escalera_comidas: function (xs) {
      var r = ultimoDe(xs); if (r.escalones == null && r.ultimo_ok == null) return null;
      var es = r.escalones != null ? "ya van " + r.escalones + " escalones conseguidos" + (r.escalones_total ? " de " + r.escalones_total : "") : "";
      var ca = r.escalones != null ? "ja són " + r.escalones + " escalons aconseguits" + (r.escalones_total ? " de " + r.escalones_total : "") : "";
      if (r.ultimo_alimento) { es += (es ? ", y " : "") + (r.ultimo_ok ? "el último intento con " + textoCorto(r.ultimo_alimento, 30) + " salió bien" : "con " + textoCorto(r.ultimo_alimento, 30) + " todavía cuesta, y es normal"); ca += (ca ? ", i " : "") + (r.ultimo_ok ? "el darrer intent amb " + textoCorto(r.ultimo_alimento, 30) + " va sortir bé" : "amb " + textoCorto(r.ultimo_alimento, 30) + " encara costa, i és normal"); }
      es += ". Cada vez que lo prueba sin presión, su cuerpo aprende que puede estar tranquilo delante de un alimento nuevo."; ca += ". Cada vegada que ho prova sense pressió, el seu cos aprèn que pot estar tranquil davant d'un aliment nou.";
      return { es: es, ca: ca, temas: [] };
    },
    rincon_calma: function (xs) {
      var r = ultimoDe(xs), j = { abrazo: ["el abrazo", "l'abraçada"], respiracion: ["la respiración", "la respiració"], sensaciones: ["el juego de las sensaciones", "el joc de les sensacions"] }[r.juego];
      return { es: "ha practicado en el rincón de calma" + (j ? ", esta vez con " + j[0] : "") + ". Jugar a calmarse cuando todavía está tranquilo es lo que luego le permite usarlo cuando la emoción se hace grande.",
        ca: "ha practicat al racó de calma" + (j ? ", aquesta vegada amb " + j[1] : "") + ". Jugar a calmar-se quan encara està tranquil és el que després li permet fer-ho servir quan l'emoció es fa grossa.", temas: [] };
    },
    escalera_exposicion: function (xs) {
      var r = ultimoDe(xs);
      if (r.escala) return comentarioEscala(r);
      if (r.ans_antes == null && !r.resultado) return null;
      var es = "{has subido|ha subido} al peldaño" + (r.peldano_txt ? " «" + textoCorto(r.peldano_txt, 40) + "»" : ""), ca = "{has pujat|ha pujat} a l'escaló" + (r.peldano_txt ? " «" + textoCorto(r.peldano_txt, 40) + "»" : "");
      if (r.ans_antes != null) { es += ": la alarma empezó en " + r.ans_antes + ", llegó a " + r.ans_max + " y terminó en " + r.ans_final; ca += ": l'alarma va començar a " + r.ans_antes + ", va arribar a " + r.ans_max + " i va acabar a " + r.ans_final; }
      es += "."; ca += ".";
      if (r.resultado === "sostuve") { es += " {Te quedaste|Se quedó} hasta el final" + (r.paso_ais === "si" ? " y con el AIS activo" : "") + ", que es exactamente el objetivo: no que no haya miedo, sino poder quedarse con él."; ca += " {Et vares quedar|Es va quedar} fins al final" + (r.paso_ais === "si" ? " i amb l'AIS actiu" : "") + ", que és exactament l'objectiu: no que no hi hagi por, sinó poder-s'hi quedar."; }
      if (r.supera) { es += " Con esto {has superado|ha superado} este peldaño" + (r.posicion ? " (el " + r.posicion + " de " + r.total + ")" : "") + ": el siguiente ya está esperando, sin prisa."; ca += " Amb això {has superat|ha superat} aquest escaló" + (r.posicion ? " (el " + r.posicion + " de " + r.total + ")" : "") + ": el següent ja espera, sense pressa."; }
      else if (r.resultado === "escape") { es += " Esta vez {saliste|salió} antes, y es información útil: quizá conviene repetir este peldaño o bajar uno antes de seguir."; ca += " Aquesta vegada {vares sortir|va sortir} abans, i és informació útil: potser convé repetir aquest escaló o baixar-ne un abans de continuar."; }
      return { es: es, ca: ca, temas: ["act", r.resultado === "sostuve" ? "valiosa" : ""] };
    },
    honestidad_emocional: function (xs, prev) {
      var r = ultimoDe(xs);
      var es = r.con ? "{has podido compartir|ha podido compartir} con " + aTi(textoCorto(r.con, 30), "es") + " lo que {notabas|notaba}" : "{has podido nombrar|ha podido nombrar} lo que {notabas|notaba}";
      var ca = r.con ? "{has pogut compartir|ha pogut compartir} amb " + aTi(textoCorto(r.con, 30), "ca") + " el que {notaves|notava}" : "{has pogut anomenar|ha pogut anomenar} el que {notaves|notava}";
      if (r.zona) { es += " en " + zonaTxt(r.zona, "es"); ca += " a " + zonaTxt(r.zona, "ca"); }
      es += ", sin tener que explicarlo ni justificarlo. Eso es justamente la honestidad emocional desde dentro."; ca += ", sense haver-ho d'explicar ni justificar. Això és justament l'honestedat emocional des de dins.";
      if (r.paso_valor) { es += " Y el paso que {elegiste|eligió}, «" + textoCorto(r.paso_valor, 50) + "», va en la buena dirección."; ca += " I la passa que {vares triar|va triar}, «" + textoCorto(r.paso_valor, 50) + "», va en la bona direcció."; }
      return { es: es, ca: ca, temas: [] };
    },
    protocolo_ais: function (xs) {
      var r = ultimoDe(xs); if (r.dias_completados == null) return null;
      var es = "{llevas|lleva} " + r.dias_completados + " días completados" + (num(r.racha) >= 2 ? " y " + r.racha + " seguidos" : "") + (r.fase_txt ? ", ahora en la fase «" + textoCorto(r.fase_txt, 40) + "»" : "") + ".";
      var ca = "{duus|du} " + r.dias_completados + " dies completats" + (num(r.racha) >= 2 ? " i " + r.racha + " seguits" : "") + (r.fase_txt ? ", ara a la fase «" + textoCorto(r.fase_txt, 40) + "»" : "") + ".";
      if (r.fase != null && r.fase_recomendada != null && r.fase > r.fase_recomendada) { es += " No hace falta correr: quedarse un poco más en la fase recomendada (" + r.fase_recomendada + ") ayuda a que se asiente."; ca += " No cal córrer: quedar-se una mica més a la fase recomanada (" + r.fase_recomendada + ") ajuda que s'assenti."; }
      else { es += " Ir día a día, sin saltarse fases, es lo que hace que la práctica se vuelva propia."; ca += " Anar dia a dia, sense botar-se fases, és el que fa que la pràctica es torni pròpia."; }
      return { es: es, ca: ca, temas: [] };
    },
    tracker_ais: function (xs) {
      var r = ultimoDe(xs); if (r.paradas == null && r.resp == null) return null;
      var es = "{has hecho|ha hecho} " + (r.paradas || 0) + " paradas de pensamiento y " + (r.resp || 0) + " respiraciones conscientes" + (num(r.abrazos) > 0 ? ", con " + r.abrazos + " abrazos sentidos" : "") + ".";
      var ca = "{has fet|ha fet} " + (r.paradas || 0) + " parades de pensament i " + (r.resp || 0) + " respiracions conscients" + (num(r.abrazos) > 0 ? ", amb " + r.abrazos + " abraçades sentides" : "") + ".";
      if (num(r.proactivas) != null && num(r.reactivas) != null && r.proactivas >= r.reactivas && r.proactivas > 0) { es += " Que la mayoría de comprobaciones sean proactivas, desde la barriga, quiere decir que ya no {esperas|espera} a estar mal para escucharte."; ca += " Que la majoria de comprovacions siguin proactives, des de la panxa, vol dir que ja no {esperes|espera} a estar malament per escoltar-te."; }
      return { es: es, ca: ca, temas: [] };
    },
    estoy_aqui_conmigo: function (xs) {
      var r = ultimoDe(xs); if (r.practicas == null) return null;
      var es = "{has hecho|ha hecho} " + r.practicas + " prácticas" + (num(r.esperar) > 0 ? " y {has podido|ha podido} esperar " + r.esperar + " " + (r.esperar == 1 ? "vez" : "veces") + " en lugar de actuar con la urgencia" : "") + ".";
      var ca = "{has fet|ha fet} " + r.practicas + " pràctiques" + (num(r.esperar) > 0 ? " i {has pogut|ha pogut} esperar " + r.esperar + " " + (r.esperar == 1 ? "vegada" : "vegades") + " en lloc d'actuar amb la urgència" : "") + ".";
      es += " Cada vez que te quedas contigo en ese momento, aprendes que puedes sostenerlo sin necesitar a nadie más para calmarte."; ca += " Cada vegada que et quedes amb tu en aquest moment, aprens que pots sostenir-ho sense necessitar ningú més per calmar-te.";
      return { es: es, ca: ca, temas: [] };
    },
    pedalea_desde_dentro: function (xs) {
      var r = ultimoDe(xs), es = [], ca = [];
      if (num(r.disfrute) != null) { es.push("el disfrute está en " + coma(r.disfrute) + "/10"); ca.push("el gaudi és de " + coma(r.disfrute) + "/10"); }
      if (num(r.presion) != null) { es.push("la presión por demostrar en " + coma(r.presion) + "/10"); ca.push("la pressió per demostrar de " + coma(r.presion) + "/10"); }
      if (r.vuelve != null) { es.push("y en subida {volviste|volvió} a la tarea " + r.vuelve + " de " + r.vuelve_total + " veces"); ca.push("i en pujada {vares tornar|va tornar} a la tasca " + r.vuelve + " de " + r.vuelve_total + " vegades"); }
      if (!es.length) return null;
      return { es: es.join(", ") + ". Pedalear desde dentro, acompañándote con firmeza y sin látigo, es lo que sostiene el rendimiento.", ca: ca.join(", ") + ". Pedalar des de dins, acompanyant-te amb fermesa i sense fuet, és el que sosté el rendiment.", temas: [] };
    },
    toco_desde_dentro: function (xs) {
      var r = ultimoDe(xs); if (r.puertas == null) return null;
      return { es: "esta semana {has hecho|ha hecho} " + r.respiros + " respiros antes de " + r.puertas + " puertas, " + (r.noes ? "soltando " + r.noes + " «no» " : "") + "y " + r.cierres + " cierres de día. Ir con el cuerpo y no contra él es lo que te permite llegar a casa con batería.",
        ca: "aquesta setmana {has fet|ha fet} " + r.respiros + " respirs abans de " + r.puertas + " portes, " + (r.noes ? "deixant anar " + r.noes + " «no» " : "") + "i " + r.cierres + " tancaments de dia. Anar amb el cos i no contra ell és el que et permet arribar a casa amb bateria.", temas: [] };
    },
    paso_a_paso: function (xs) {
      var r = ultimoDe(xs), es = "", ca = "";
      if (r.escala) return comentarioEscala(r);
      if (r.peldano != null) {
        es = "{has trabajado|ha trabajado} el peldaño " + r.peldano + (r.peldanos ? " de " + r.peldanos : "");
        ca = "{has treballat|ha treballat} l'escaló " + r.peldano + (r.peldanos ? " de " + r.peldanos : "");
        if (r.ans_antes != null && r.ans_final != null) {
          es += ": la ansiedad empezó en " + r.ans_antes + (r.ans_max != null ? ", llegó a " + r.ans_max : "") + " y bajó a " + r.ans_final + " al {quedarte|quedarse}";
          ca += ": l'ansietat va començar a " + r.ans_antes + (r.ans_max != null ? ", va arribar a " + r.ans_max : "") + " i va baixar a " + r.ans_final + " en {quedar-te|quedar-se}";
        }
        es += r.paso_ais === "si" ? ", y {lo hiciste quedándote contigo|lo hizo sin dejar de escucharse}." : ".";
        ca += r.paso_ais === "si" ? ", i {ho vares fer quedant-te amb tu|ho va fer sense deixar d'escoltar-se}." : ".";
        if (r.supera) { es += " Con esto {has superado|ha superado} este peldaño: el siguiente ya está esperando, sin prisa."; ca += " Amb això {has superat|ha superat} aquest escaló: el següent ja espera, sense pressa."; }
      }
      if (r.ayudo) { es += " Me apunto que {te ayudó|le ayudó} «" + textoCorto(r.ayudo, 50) + "»: lo podemos usar en el siguiente paso."; ca += " M'apunt que {et va ajudar|li va ajudar} «" + textoCorto(r.ayudo, 50) + "»: ho podem fer servir a la passa següent."; }
      if (r.logro) { es += " Y me quedo con {tu|su} logro de hoy: «" + textoCorto(r.logro, 60) + "»."; ca += " I em qued amb el {teu|seu} assoliment d'avui: «" + textoCorto(r.logro, 60) + "»."; }
      return es ? { es: es.trim(), ca: ca.trim(), temas: ["act", "valiosa"] } : null;
    },
    agenda_atencional: function (xs) {
      var r = ultimoDe(xs), h = num(r.acts_hechas), f = num(r.foco_medio), cy = num(r.conduje_yo_pct);
      var es = [], ca = [];
      if (h != null) { es.push("{completaste|completó} " + h + " actividad" + (h === 1 ? "" : "es") + " de la agenda"); ca.push("{vares completar|va completar} " + h + " activitat" + (h === 1 ? "" : "s") + " de l'agenda"); }
      if (cy != null) { es.push("{condujiste tú|estuvo al volante} el " + cy + "% del tiempo"); ca.push("{vares conduir tu|va dur el volant} el " + cy + "% del temps"); }
      if (f != null) { es.push("con un foco medio de " + coma(f) + "/10"); ca.push("amb un focus mitjà de " + coma(f) + "/10"); }
      if (!es.length) return null;
      return { es: es.join(", ") + ". Sostener la dirección del día, aunque la mente se vaya, es justamente lo que entrenamos.", ca: ca.join(", ") + ". Sostenir la direcció del dia, encara que la ment se'n vagi, és justament el que entrenam.", temas: [] };
    },
    brujula_valores: function (xs, prev) {
      var r = ultimoDe(xs), c = num(pick(r.cercania_media, r.cercania_media_forma_de_relacionarme));
      if (c == null) return null;
      var p = prev.length ? num(pick(ultimoDe(prev).cercania_media, ultimoDe(prev).cercania_media_forma_de_relacionarme)) : null;
      var mej = p != null && c > p + 0.4;
      return { es: "la cercanía a {tus|sus} valores está en " + coma(c) + "/10" + (mej ? ", más que la vez anterior (" + coma(p) + ")" : "") + ". Tener claro hacia dónde {quieres|quiere} ir ayuda a elegir mejor en los momentos difíciles.",
        ca: "la proximitat als {teus|seus} valors és de " + coma(c) + "/10" + (mej ? ", més que la vegada anterior (" + coma(p) + ")" : "") + ". Tenir clar cap on {vols|vol} anar ajuda a triar millor en els moments difícils.", temas: [] };
    },
    cuestionario_tec: function (xs, prev) {
      var r = ultimoDe(xs); if (num(r.L) == null) return null;
      var ks = [["L", "latencia", "latència"], ["D", "densidad", "densitat"], ["C", "continuidad", "continuïtat"]];
      var best = ks.slice().sort(function (a, b) { return num(r[b[0]]) - num(r[a[0]]); })[0];
      return { es: "lo que más destaca es la " + best[1] + " (" + coma(num(r[best[0]])) + "/10). Es una buena base para apoyarnos en ella.", ca: "el que més destaca és la " + best[2] + " (" + coma(num(r[best[0]])) + "/10). És una bona base per recolzar-nos-hi.", temas: [] };
    }
  };
  function comentarioMono(xs) {
    var n = { conduce: 0, delante: 0, maletero: 0, lado: 0 }, tot = 0;
    xs.forEach(function (x) { var k = MONO[x.r.pos || x.r.escena || x.r.modo]; if (k) { n[k]++; tot++; } });
    var u = MONO[ultimoDe(xs).modo || ultimoDe(xs).pos || ultimoDe(xs).escena];
    if (!u) return null;
    var es = { lado: "el mono estaba a {tu|su} lado. Poder acompañarlo, en vez de pelearse con él o esconderlo, es justo hacia donde vamos.",
      conduce: "el mono conducía. Darse cuenta ya es el primer paso: cuando {lo ves|lo ve}, {puedes|puede} parar y volver a coger el volante poco a poco.",
      delante: "el mono estaba delante y la mente se iba a pelearse con él. Es muy habitual; la idea es probar a dejarlo sentarse al lado, sin que mande.",
      maletero: "el mono estaba en el maletero, escondido. Es una forma de protegerse, y la idea es ir dejándole un poco de espacio para poder acompañarlo." }[u];
    var ca = { lado: "el mono era al {teu|seu} costat. Poder acompanyar-lo, en lloc de barallar-s'hi o amagar-lo, és just cap on anam.",
      conduce: "el mono conduïa. Adonar-se'n ja és la primera passa: quan {el veus|el veu}, {pots aturar-te|pot aturar-se} i tornar a agafar el volant a poc a poc.",
      delante: "el mono era davant i la ment se n'anava a barallar-s'hi. És molt habitual; la idea és provar de deixar-lo seure al costat, sense que mani.",
      maletero: "el mono era al maleter, amagat. És una manera de protegir-se, i la idea és anar-li deixant una mica d'espai per poder acompanyar-lo." }[u];
    if (tot >= 3 && n.lado / tot >= 0.4 && u !== "lado") { es += " De todas formas, estos días {has tenido|ha tenido} el mono al lado en " + n.lado + " de " + tot + " ocasiones."; ca += " De totes maneres, aquests dies {has tengut|ha tengut} el mono al costat " + n.lado + " de " + tot + " vegades."; }
    return { es: es, ca: ca, temas: ["lado"] };
  }

  /* Herramientas sin comentario propio: se buscan en el registro pares
     antes/después (también «inicial/final») y, si no hay, se reconoce el uso. */
  function comentarioGenerico(xs, prev) {
    var r = ultimoDe(xs), ks = Object.keys(r);
    var ka = ks.filter(function (k) { return /(^|_)(antes|inicial|inicio)(_|$)/.test(k) && num(r[k]) != null; })[0];
    var kb = ka && ks.filter(function (k) { return /(^|_)(despues|final|fin)(_|$)/.test(k) && num(r[k]) != null; })[0];
    if (ka && kb) {
      var c = comentarioAntesDespues(xs, prev, function (x) { return x[ka]; }, function (x) { return x[kb]; }, null);
      if (c) return c;
    }
    var n = xs.length;
    return n >= 2
      ? { es: "{lo has practicado|lo ha practicado} " + n + " veces estos días, y esa repetición es la que hace que se vaya haciendo propio.", ca: "{ho has practicat|ho ha practicat} " + n + " vegades aquests dies, i aquesta repetició és la que fa que es vagi fent propi.", temas: [] }
      : null;
  }
  function comentarioDe(k, xs, prev, lang, perfil) {
    if (!xs || !xs.length) return null;
    var f = COMENTA[k] || (k.charAt(0) === "@" && COMENTA[normNombre(k.slice(1))]) || comentarioGenerico;
    var c = null; try { c = f(xs, prev); } catch (e) { c = null; }
    if (!c) return null;
    var t = c[lang] || c.es;
    return { texto: t.charAt(0).toUpperCase() + t.slice(1), temas: (c.temas || []).filter(Boolean) };
  }
  /* «Entre punto y punto» → «@entre punto y punto» (para comentarios de herramientas por nombre). */
  function normNombre(s) { return "@" + String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }

  var NOMBRE_FOCO = { latencia: "Latencia · nivel 1 (detectar y pausar)", densidad: "Densidad · nivel 2 (paradas frecuentes)", continuidad: "Continuidad · nivel 3 (sostener y actuar con valor)" };

  g.APRENS_FEEDBACK = { analizar: analizar, mensaje: mensaje, autorregistros: autorregistros, clave: clave, NOMBRE_FOCO: NOMBRE_FOCO, NOMBRE_CA: NOMBRE_CA };
})(typeof window !== "undefined" ? window : globalThis);
