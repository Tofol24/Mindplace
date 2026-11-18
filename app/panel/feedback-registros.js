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
  var EXCLUIR = { screening_tec: 1, screening_seg: 1, seguimiento_tec: 1 };
  // Herramientas de práctica de presencia interna (densidad AIS).
  var AIS = ["ais_curiosidad", "ais_amor", "ais_muscular", "bajar_alerta", "acompanar_sensacion", "herramienta_diaria",
    "protocolo_ais", "estoy_aqui_conmigo", "toco_desde_dentro", "mapa_atencion_interna", "tracker_ais", "sentarse_mono",
    "respiracion_curiosa", "ritual_calma", "rincon_calma", "respiro_ais", "cuerpo_en_alerta", "pedalea_desde_dentro"];
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
      // Activación antes → después de la práctica (0–10)
      var a = null, b = null;
      if (t === "acompanar_sensacion") { a = num(r.intensidad_antes); b = num(r.intensidad_despues); }
      else if (t === "cuerpo_en_alerta") { a = num(r.activacion); b = num(r.alivio); }
      else if (t === "reto_mona") { a = num(pick(r.ans_max, r.ans_antes)); b = num(r.ans_final); }
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
    var foco, motivo, inicio = T.n < 3;
    if (inicio) { foco = "latencia"; motivo = "Pocos registros todavía (" + T.n + "): se empieza por el nivel 1 (detectar y pausar)."; }
    else if (lat.length) { foco = "latencia"; motivo = lat.map(function (x) { return x[1]; }).join(" "); }
    else if (den.length) { foco = "densidad"; motivo = den.map(function (x) { return x[1]; }).join(" "); }
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

    return { foco: foco, motivo: motivo, paso: paso, ultimo: ultimo, evol: evol, inicio: inicio, sinNuevos: sinNuevos,
      primerFeedback: !ultimo, fortalezas: fort, senales: { latencia: lat, densidad: den, continuidad: con },
      nuevo: N, previo: P, total: T, lineas: lineas, nuevos: nuevos, claves: todos.map(function (x) { return x.k; }) };
  }

  /* ───────────────────────── Mensaje al paciente ───────────────────────── */
  var TXT = {
    es: {
      hola: "Hola, he revisado los registros que me has ido enviando 🌱",
      resumen: function (a, hs) {
        var N = a.nuevo;
        return (a.primerFeedback || a.sinNuevos ? "En los últimos días me han llegado " : "Desde mi último mensaje me han llegado ") +
          N.n + " registro" + (N.n === 1 ? "" : "s") + " en " + N.dias + " día" + (N.dias === 1 ? "" : "s") + " distinto" + (N.dias === 1 ? "" : "s") +
          (hs.length === 1 ? ", de «" + hs[0] + "»" : hs.length ? ", sobre todo de " + lista(hs, "y") : "") + ".";
      },
      evol: {
        inicio: "Es el inicio de tus registros y ya me sirven para ir conociendo cómo estás y cómo responde tu cuerpo.",
        mas: "Respecto a las semanas anteriores has registrado más días, y eso ya es entrenar la capacidad de mirar hacia dentro.",
        igual: "Mantienes un ritmo parecido al de las semanas anteriores, y esa constancia es la que permite que el cambio se asiente.",
        menos: "Has registrado algo menos que las semanas anteriores. No pasa nada, es normal que haya semanas así; lo importante es retomarlo sin exigencia."
      },
      fort: {
        act: function (N) { return "Me quedo con que, cuando practicas, la activación baja de media de " + coma(N.actAntes) + " a " + coma(N.actDespues) + ", lo que me dice que tu cuerpo empieza a fiarse cuando te paras a acompañarlo."; },
        masDias: function () { return "Se nota el esfuerzo por hacerlo más a menudo."; },
        constancia: function (N) { return "Has registrado unos " + coma(N.diasSem) + " días por semana, con una constancia que vale mucho."; },
        lado: function (N) { return "En un " + N.pctLado + "% de las veces has podido tener al mono a tu lado, acompañándolo en vez de pelearte con él."; },
        cv: function (N) { return "Has hecho una acción con valor en " + N.cv.unos + " de " + N.cv.n + " días, aunque la sensación estuviera presente."; },
        valiosa: function () { return "Cuando ha aparecido el malestar, has podido responder más veces desde lo que te importa que desde la evitación."; },
        base: "Solo el hecho de pararte a registrarlo ya es entrenar la presencia interna."
      },
      paso: {
        primero: "",
        mantiene: "Seguimos un poco más con lo que te propuse la última vez, porque necesita tiempo para asentarse.",
        avanza: "Como lo que te propuse la última vez ya va cogiendo forma, damos un paso más.",
        retrocede: "Esta semana volvemos un paso atrás, y no es ningún problema: es normal que haya semanas más difíciles y reforzar la base es parte del proceso."
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
      cierre: "Sigue enviándome tus registros como hasta ahora, así puedo ir viendo tu evolución y ajustar lo que trabajamos. No hace falta que salga perfecto: lo importante es hacerlo con presencia y no con exigencia.",
      firma: "Tòfol Villalonga"
    },
    ca: {
      hola: "Hola, he revisat els registres que m'has anat enviant 🌱",
      resumen: function (a, hs) {
        var N = a.nuevo;
        return (a.primerFeedback || a.sinNuevos ? "Aquests darrers dies m'han arribat " : "Des del meu darrer missatge m'han arribat ") +
          N.n + " registre" + (N.n === 1 ? "" : "s") + " en " + N.dias + " di" + (N.dias === 1 ? "a" : "es") + " diferent" + (N.dias === 1 ? "" : "s") +
          (hs.length === 1 ? ", de «" + hs[0] + "»" : hs.length ? ", sobretot de " + lista(hs, "i") : "") + ".";
      },
      evol: {
        inicio: "És l'inici dels teus registres i ja em serveixen per anar coneixent com estàs i com respon el teu cos.",
        mas: "Respecte de les setmanes anteriors has registrat més dies, i això ja és entrenar la capacitat de mirar cap endins.",
        igual: "Mantens un ritme semblant al de les setmanes anteriors, i aquesta constància és la que permet que el canvi s'assenti.",
        menos: "Has registrat una mica menys que les setmanes anteriors. No passa res, és normal que hi hagi setmanes així; l'important és reprendre-ho sense exigència."
      },
      fort: {
        act: function (N) { return "Em qued amb el fet que, quan practiques, l'activació baixa de mitjana de " + coma(N.actAntes) + " a " + coma(N.actDespues) + ", i això em diu que el teu cos comença a fiar-se quan t'atures a acompanyar-lo."; },
        masDias: function () { return "Es nota l'esforç per fer-ho més sovint."; },
        constancia: function (N) { return "Has registrat uns " + coma(N.diasSem) + " dies per setmana, amb una constància que val molt."; },
        lado: function (N) { return "Un " + N.pctLado + "% de les vegades has pogut tenir el mono al teu costat, acompanyant-lo en lloc de barallar-t'hi."; },
        cv: function (N) { return "Has fet una acció amb valor " + N.cv.unos + " de " + N.cv.n + " dies, encara que la sensació hi fos present."; },
        valiosa: function () { return "Quan ha aparegut el malestar, has pogut respondre més vegades des del que t'importa que des de l'evitació."; },
        base: "Només el fet d'aturar-te a registrar-ho ja és entrenar la presència interna."
      },
      paso: {
        primero: "",
        mantiene: "Seguim una mica més amb el que et vaig proposar la darrera vegada, perquè necessita temps per assentar-se.",
        avanza: "Com que el que et vaig proposar la darrera vegada ja va agafant forma, feim una passa més.",
        retrocede: "Aquesta setmana tornam una passa enrere, i no és cap problema: és normal que hi hagi setmanes més difícils i reforçar la base forma part del procés."
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
      cierre: "Continua enviant-me els teus registres com fins ara, així puc anar veient la teva evolució i ajustar el que treballam. No cal que surti perfecte: l'important és fer-ho amb presència i no amb exigència.",
      firma: "Tòfol Villalonga"
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
    registro_texto: "Registre", reto_mona: "Repte: sortir amb la meva mona", autorregistro_hospital: "Autorregistre de l'hospital",
    eines_setmana: "Eines de la setmana", dolor_cronico: "Dolor crònic"
  };

  /* a: resultado de analizar(). opts: { lang, nombreTool(id)→texto, modulo:{titulo} } */
  function mensaje(a, opts) {
    opts = opts || {};
    var lang = opts.lang === "ca" ? "ca" : "es", T = TXT[lang], N = a.nuevo, F = T.foco[a.foco];
    var hs = N.herramientas.slice(0, 3).map(function (k) {
      return k.charAt(0) === "@" ? k.slice(1) : (lang === "ca" && NOMBRE_CA[k]) || (opts.nombreTool ? opts.nombreTool(k) : null);
    }).filter(Boolean);
    var fortTxt = a.fortalezas.slice(0, 2).map(function (k) { return T.fort[k](N); });
    if (!fortTxt.length) fortTxt.push(T.fort.base);
    var p1 = [T.resumen(a, hs), T.evol[a.evol]].join(" ");
    var p2 = fortTxt.join(" ");
    var p3 = [T.paso[a.paso], F.por(a)].filter(Boolean).join(" ");
    var pasos = T.semana + "\n" + [F.p1, F.p2, F.p3].map(function (s, i) { return T.pasos[i] + s; }).join("\n");
    var linea = opts.modulo && opts.modulo.titulo && T.linea ? T.linea(opts.modulo.titulo) : "";
    var scr = opts.screening ? T.screening(opts.screening) : "";
    return [T.hola, p1, p2, p3, pasos, linea, T.frase + "\n«" + F.consigna + "»", scr, T.cierre, T.firma].filter(Boolean).join("\n\n");
  }

  var NOMBRE_FOCO = { latencia: "Latencia · nivel 1 (detectar y pausar)", densidad: "Densidad · nivel 2 (paradas frecuentes)", continuidad: "Continuidad · nivel 3 (sostener y actuar con valor)" };

  g.APRENS_FEEDBACK = { analizar: analizar, mensaje: mensaje, autorregistros: autorregistros, clave: clave, NOMBRE_FOCO: NOMBRE_FOCO, NOMBRE_CA: NOMBRE_CA };
})(typeof window !== "undefined" ? window : globalThis);
