/* APRENS · Lector de registros de texto (mensajes de WhatsApp de cualquier herramienta).
   Portado del panel anterior (aprens-panel-psicologo): detecta la herramienta, la fecha
   y los datos (L/D/C, alerta antes/después, posición del mono…), y conserva el texto
   íntegro. Lo usa el Panel del psicólogo («📋 Pegar registro» y el enlace #t=…).
   Script clásico: expone parseRegistroTexto() y separarMensajes() como globales. */
(function (g) {
  var MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8,
    septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
    gener: 1, febrer: 2, "març": 3, marc: 3, maig: 5, juny: 6, juliol: 7, agost: 8, setembre: 9, novembre: 11, desembre: 12 };
  function pad(n) { return ("0" + n).slice(-2); }
  function hashTxt(s) { var h = 5381; for (var i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h & h; } return Math.abs(h).toString(36); }
  function anyo(y) { y = +y; return y < 100 ? 2000 + y : y; }
  function fechaOk(y, m, d) { return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100; }

  /* Fecha escrita en el propio mensaje: ISO, «26 de octubre de 2026», «26 d'octubre», 26/10/2026. */
  function fechaTexto(t) {
    var m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m && fechaOk(+m[1], +m[2], +m[3])) return m[0];
    m = t.match(/(\d{1,2})\s+(?:de\s+|d['’]\s*)([a-zà-úç]+)(?:\s+(?:de|del)\s+(\d{4}))?/i);
    if (m) {
      var mes = MESES[m[2].toLowerCase()];
      if (mes) {
        var y = m[3] ? +m[3] : new Date().getFullYear();
        if (fechaOk(y, mes, +m[1])) return y + "-" + pad(mes) + "-" + pad(m[1]);
      }
    }
    m = t.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/);
    if (m && fechaOk(anyo(m[3]), +m[2], +m[1])) return anyo(m[3]) + "-" + pad(m[2]) + "-" + pad(m[1]);
    return null;
  }
  function ldcNorm(word, t) {
    var re = new RegExp(word + "[^0-9]{0,30}?(\\d+(?:[.,]\\d+)?)\\s*/\\s*(\\d+)", "i");
    var m = t.match(re); if (!m) return null;
    var v = parseFloat(m[1].replace(",", ".")), den = parseFloat(m[2]) || 10;
    if (!isFinite(v) || !den) return null;
    return Math.round(v / den * 10 * 10) / 10;
  }
  var SIG = [
    [/la llave de paso|la clau de pas/i, "llave_de_paso", "La llave de paso"],
    [/entre punto y punto|plan de partido/i, "entre_punto_y_punto", "Entre punto y punto"],
    [/mi recorrido tec/i, "recorrido_tec", "Mi recorrido"],
    [/evaluaci[óo]n de trauma|\bAP5[-\s]?\d(?:[-\s]?\d){6}/i, "evaluacion_trauma", "Evaluación de trauma"],
    [/exploradora valiente/i, "exploradora_valiente", "La exploradora valiente"],
    [/misi[óo]n barrio/i, "mision_barrio", "Misión Barrio"],
    [/ritual diario/i, "ritual_calma", "Ritual diario · calma"],
    [/escalera de las comidas/i, "escalera_comidas", "La escalera de las comidas"],
    [/rinc[óo]n de calma/i, "rincon_calma", "Rincón de calma"],
    [/la escalera\s*·\s*exposici[óo]n/i, "escalera_exposicion", "La escalera (exposición)"],
    [/^\W*honestidad emocional\s*[—-]\s*APRENS/i, "honestidad_emocional", "Honestidad emocional"],
    [/protocolo progresivo ais/i, "protocolo_ais", "Protocolo AIS (audio)"],
    [/registre ais/i, "tracker_ais", "Tracker AIS"],
    [/estoy aqu[íi] conmigo/i, "estoy_aqui_conmigo", "Estoy aquí conmigo"],
    [/pedalea desde dentro/i, "pedalea_desde_dentro", "Pedalea desde dentro"],
    [/toco desde dentro/i, "toco_desde_dentro", "Toco desde dentro"],
    [/APRENS\s*·\s*AIS curiosidad/i, "ais_curiosidad", "AIS desde la curiosidad"],
    [/salida \(exposici[óo]n en vivo\)|exposici[óo]n en imaginaci[óo]n|pelda[ñn]o trabajado/i, "paso_a_paso", "Paso a paso, de vuelta a mí"],
    [/d[óo]nde est[áa] (tu|mi) mono|detective del mono/i, "donde_mono", "¿Dónde está tu mono?"],  // al inicio: su resumen nombra otras herramientas
    [/agenda atencional/i, "agenda_atencional", "Agenda atencional"],
    [/tracker\s*tec/i, "tracker_tec", "Tracker TEC"],
    [/tracker\s*ais/i, "tracker_ais", "Tracker AIS"],
    [/br[uú]jula de valores/i, "brujula_valores", "Brújula de valores"],
    [/retorn a la feina|retorno al trabajo/i, "retorno_trabajo", "Retorno al trabajo"],
    [/acompa[ñn]ar la sensaci[óo]n/i, "acompanar_sensacion", "Acompañar la sensación"],
    [/c[óo]mo llevas (a )?tu mono|estado del mono/i, "estado_mono", "¿Cómo llevas a tu mono?"],
    [/ais desde el amor/i, "ais_amor", "AIS desde el amor"],
    [/ais desde la curiosidad|entrenar ais desde la curiosidad/i, "ais_curiosidad", "AIS desde la curiosidad"],
    [/ais muscular/i, "ais_muscular", "AIS muscular"],
    [/mapa (de atenci[óo]n )?interno|mapa de atenci[óo]n interna/i, "mapa_atencion_interna", "Mapa interno"],
    [/cuerpo sigue en alerta|cuerpo en alerta/i, "cuerpo_en_alerta", "Cuando el cuerpo sigue en alerta"],
    [/protocolo ais/i, "protocolo_ais", "Protocolo AIS (audio)"],
    [/herramienta diaria|eina di[aà]ria/i, "herramienta_diaria", "Herramienta diaria"],
    [/bajar la alerta/i, "bajar_alerta", "Bajar la alerta"],
    [/control de (la )?ira|control de la r[aà]bia/i, "control_ira", "Control de ira"],
    [/dolor cr[óo]nico/i, "dolor_cronico", "Dolor crónico"],
    [/(d[ií]a en el hospital|hospital)/i, "autorregistro_hospital", "Autorregistro hospital"],
    [/registre\s*setmana|eines.{0,6}setmana/i, "eines_setmana", "Eines de la setmana"],
    // Control de ira: su mensaje empieza «AUTORREGISTRO APRENS ·» («AUTORREGISTRE» en catalán).
    [/autorregistr[oe] aprens\s*·/i, "control_ira", "Control de ira"],
    [/autorregistre|autorregistro/i, "autorregistro", "Autorregistro"],
    [/compromiso semanal/i, "compromiso_semanal", "Compromiso semanal"],
    [/cuestionario/i, "cuestionario_tec", "Cuestionario TEC"]
  ];
  function esDeHerramienta(t) {
    return /APRENS|Enviado desde mi herramienta|Enviat des de/i.test(t) || SIG.some(function (s) { return s[0].test(t); });
  }

  /* Nombre de la herramienta a partir de la primera línea del mensaje
     (para los registros que no se reconocen). null si no parece un título. */
  function tituloDe(txt) {
    var lineas = String(txt || "").split(/\n/);
    for (var i = 0; i < lineas.length && i < 3; i++) {
      var l = lineas[i].replace(/[*_~]/g, "").replace(/^[^A-Za-zÀ-ÿ¿¡«"]+/, "")
        .replace(/\s*[·|—–-]\s*APRENS.*$/i, "").replace(/^APRENS\s*[·|—–:-]\s*/i, "").replace(/[\s:·—–-]+$/, "").trim();
      if (!l) continue;
      if (/^(hola|hey|bon dia|bones|buenos|buenas|hi)\b/i.test(l)) return null;
      if (l.length < 3 || l.length > 60 || !/[A-Za-zÀ-ÿ]{3}/.test(l)) return null;
      if (/^(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo|dilluns|dimarts|dimecres|dijous|divendres|dissabte|diumenge)\b/i.test(l) || /^\d/.test(l)) return null;
      return l;
    }
    return null;
  }

  /* Evaluación de trauma (LEC-5 + PCL-5): el paciente envía solo un código AP5-…
     Se descifra aquí con el mismo formato que la herramienta (evaluacion-trauma.html)
     y se corrige el PCL-5. El código no lleva relato ni datos identificativos. */
  var A36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var CLUSTER_PCL = { B: { min: 1, ids: [0, 1, 2, 3, 4] }, C: { min: 1, ids: [5, 6] }, D: { min: 2, ids: [7, 8, 9, 10, 11, 12, 13] }, E: { min: 2, ids: [14, 15, 16, 17, 18, 19] } };
  function d36(c) { var i = A36.indexOf(c); return i < 0 ? 0 : i; }
  function decodificarTrauma(txt) {
    var m = String(txt || "").toUpperCase().match(/AP5[0-9A-Z.\-\s]{60,100}/); if (!m) return null;
    var c = m[0].replace(/[^0-9A-Z.]/g, "").slice(0, 69);
    if (c.length !== 69) return { valido: 0 };
    var h = 7; for (var k = 0; k < 68; k++) h = (h * 31 + c.charCodeAt(k)) % 36;
    if (A36[h] !== c[68]) return { valido: 0 };
    var i = 4, f = c.slice(i, i + 6); i += 6 + 3 + 2 + 1;
    var lec = []; for (k = 0; k < 17; k++) { var v = d36(c[i + k]); lec.push(v === 17 ? 32 : v === 16 ? 16 : (v & 15)); } i += 17;
    var pcl = []; for (k = 0; k < 20; k++) pcl.push(c[i + k] === "." ? null : +c[i + k]); i += 20;
    var ev = d36(c[i]), dur = c[i + 3] === "." ? null : +c[i + 3], desper = c[i + 5] === "." ? null : +c[i + 5], desrea = c[i + 6] === "." ? null : +c[i + 6]; i += 7;
    var func = []; for (k = 0; k < 5; k++) func.push(c[i + k] === "." ? null : +c[i + k]);
    var f7 = c[i + 6] === "." ? null : +c[i + 6];
    var r = { valido: 1, fecha: "20" + f.slice(0, 2) + "-" + f.slice(2, 4) + "-" + f.slice(4, 6), pcl: pcl.map(function (x) { return x == null ? "." : x; }).join("") };
    r.pcl_resp = pcl.filter(function (x) { return x != null; }).length;
    r.pcl_total = pcl.reduce(function (a, x) { return a + (x || 0); }, 0);
    var cumple = {};
    Object.keys(CLUSTER_PCL).forEach(function (cl) {
      var ids = CLUSTER_PCL[cl].ids;
      r["pcl_" + cl] = ids.reduce(function (a, j) { return a + (pcl[j] || 0); }, 0);
      cumple[cl] = ids.filter(function (j) { return (pcl[j] || 0) >= 2; }).length >= CLUSTER_PCL[cl].min;
    });
    var mIdx = ev > 0 ? (lec[ev - 1] || 0) : 0;
    var critA = (mIdx & 15) > 0, critF = dur != null && dur >= 1, critG = Math.max.apply(null, func.map(function (x) { return x == null ? -1 : x; })) >= 2;
    r.tept = critA && cumple.B && cumple.C && cumple.D && cumple.E && critF && critG ? 1 : 0;
    // Con ítems sin contestar, un cribado negativo no es concluyente (los vacíos cuentan como 0).
    if (r.pcl_resp < 20 && !r.tept) r.tept_nc = 1;
    r.completo = r.pcl_resp === 20 ? 1 : 0;
    r.banda = r.pcl_total >= 50 ? "grave" : r.pcl_total >= 33 ? "moderada-alta" : r.pcl_total >= 31 ? "en el punto de corte" : r.pcl_total >= 15 ? "leve / subumbral" : "mínima";
    if ((pcl[15] || 0) >= 2) r.riesgo = 1;               // ítem 16: conductas de riesgo / autodaño
    if (f7 === 1) r.consumo = 1;
    if ((desper || 0) >= 2 || (desrea || 0) >= 2) r.disociacion = 1;
    return r;
  }

  /* Un mensaje → { toolId, nombre, record }. fechaDefecto: la del encabezado de WhatsApp. */
  function parseRegistroTexto(txt, fechaDefecto) {
    txt = String(txt || "").trim();
    var toolId = "registro_texto", nombre = "Registro (texto)";
    for (var i = 0; i < SIG.length; i++) { if (SIG[i][0].test(txt)) { toolId = SIG[i][1]; nombre = SIG[i][2]; break; } }
    var rec = { id: "txt-" + hashTxt(txt), date: fechaTexto(txt) || fechaDefecto || new Date().toISOString().slice(0, 10), fuente: "texto" };
    var L = ldcNorm("latencia", txt), D = ldcNorm("densidad", txt), C = ldcNorm("continuidad", txt);
    var tri = txt.match(/L\s*\/\s*D\s*\/\s*C\)?\s*:?\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/i);
    if (tri) { if (L == null) L = parseFloat(tri[1].replace(",", ".")); if (D == null) D = parseFloat(tri[2].replace(",", ".")); if (C == null) C = parseFloat(tri[3].replace(",", ".")); }
    if (L != null) rec.L = L; if (D != null) rec.D = D; if (C != null) rec.C = C;
    var ni = txt.match(/niv[ei]ll?\s*inicial[^0-9]{0,30}?(\d+)\s*\/\s*5/i); if (ni) rec.nivel_inicial = +ni[1];
    var nf = txt.match(/niv[ei]ll?\s*final[^0-9]{0,30}?(\d+)\s*\/\s*5/i); if (nf) rec.nivel_final = +nf[1];
    // Campos numéricos genéricos «Etiqueta: N»
    txt.split(/\n/).forEach(function (line) {
      var m = line.match(/^\s*([A-Za-zÁÉÍÓÚÜáéíóúüñç ./()%]+?):\s*(-?\d+(?:[.,]\d+)?)/);
      if (m) {
        var k = m[1].trim().toLowerCase().replace(/[áàä]/g, "a").replace(/[éèë]/g, "e").replace(/[íìï]/g, "i").replace(/[óòö]/g, "o").replace(/[úùü]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
        if (k && rec[k] === undefined && !/^(l|d|c|id|date|fuente|texto|fecha|data)$/.test(k)) rec[k] = parseFloat(m[2].replace(",", "."));
      }
    });
    if (toolId === "bajar_alerta") {
      var aa = txt.match(/alerta antes:\s*(\d+(?:[.,]\d+)?)/i); if (aa) rec.antes = parseFloat(aa[1].replace(",", "."));
      var ad = txt.match(/alerta despu[ée]s:\s*(\d+(?:[.,]\d+)?)/i); if (ad) rec.despues = parseFloat(ad[1].replace(",", "."));
      if (rec.antes != null && rec.despues != null) rec.baja = Math.round((rec.antes - rec.despues) * 10) / 10;
      var an = txt.match(/me ancl[ée] en:\s*(.+)/i); if (an) rec.ancla = an[1].trim();
      var zo = txt.match(/ancla visual[^:]*:\s*(.+)/i); if (zo) rec.zona = zo[1].trim();
      var no = txt.match(/not[ée]:\s*(.+)/i); if (no) rec.frase = no[1].trim();
      var mi = txt.match(/micro-?acci[óo]n:\s*(.+)/i); if (mi) rec.micro = mi[1].trim();
      var mo = txt.match(/por qu[ée] vine:\s*(.+)/i); if (mo) rec.motivo = /sin necesidad|calma/i.test(mo[1]) ? "verde" : "rojo";
    }
    if (toolId === "estado_mono") {
      var em = txt.match(/estado del mono\s*:\s*(.+)/i); if (em) rec.estado = em[1].trim();
      var ft = txt.match(/foco tec\s*:\s*(latencia|densidad|continuidad)/i); if (ft) rec.foco = ft[1].toLowerCase();
      var sl = txt.match(/sentado a su lado\s*:\s*(s[íi]|un poco|todav[íi]a no)/i); if (sl) rec.al_lado = sl[1].toLowerCase();
      var es2 = (rec.estado || "").toLowerCase();
      rec.modo = /conduce/.test(es2) ? "conduce" : /persigo|peleo/.test(es2) ? "persecucion" :
        /maletero|encierro/.test(es2) ? "maletero" : /volver atr|atr[áa]s/.test(es2) ? "sobrepensamiento" :
        /a mi lado|al lado/.test(es2) ? "allado" : null;
    }
    if (toolId === "donde_mono") {
      var dm = txt.match(/d[óo]nde est[áa] mi mono\s*:\s*(.+)/i); if (dm) rec.estado = dm[1].trim();
      var ftd = txt.match(/foco tec sugerido\s*:\s*(latencia|densidad|continuidad)/i); if (ftd) rec.foco = ftd[1].toLowerCase();
      var hs = txt.match(/herramienta sugerida\s*:\s*([^\n→]+?)\s*→/i); if (hs) rec.herramienta_sugerida = hs[1].trim();
      var ed = (rec.estado || "").toLowerCase();
      rec.modo = /conduce/.test(ed) ? "conduce" : /delante|juzg/.test(ed) ? "persecucion" :
        /detr[áa]s|escond|maletero/.test(ed) ? "maletero" : /a tu lado|a mi lado|al lado/.test(ed) ? "allado" : null;
    }
    if (toolId === "agenda_atencional") {
      var fm = txt.match(/foco medio[^0-9]*?(\d+(?:[.,]\d+)?)\s*\/\s*10/i);
      if (fm) { rec.foco_medio = parseFloat(fm[1].replace(",", ".")); if (rec.D == null) rec.D = rec.foco_medio; }
      var sp = txt.match(/sobrepensar[^0-9]*?(\d+)/i); if (sp) rec.sobrepensar = +sp[1];
      var hh = txt.match(/hechas:\s*(\d+)/i); if (hh) rec.acts_hechas = +hh[1];
      var med = txt.match(/a medias:\s*(\d+)/i); if (med) rec.acts_medias = +med[1];
      var nno = txt.match(/·\s*no:\s*(\d+)/i); if (nno) rec.acts_no = +nno[1];
      var cy = txt.match(/conduje yo el\s*(\d+)\s*%/i); if (cy) rec.conduje_yo_pct = +cy[1];
      var pp = txt.match(/parada de pensamiento:\s*(\d+)/i); if (pp) rec.parada = +pp[1];
      var stp = txt.match(/\bSTOP:\s*(\d+)/i); if (stp) rec.stop = +stp[1];
      var sec = txt.split(/BR[UÚ]JULA DE VALORES/i)[1];
      if (sec) {
        var nums = [], re = /^\s*[A-Za-zÁÉÍÓÚÜáéíóúüñç ./()]+?:\s*(\d+)\s*\/\s*10/gm, mb;
        while ((mb = re.exec(sec))) nums.push(+mb[1]);
        if (nums.length) { rec.brujula_media = Math.round(nums.reduce(function (a, b) { return a + b; }, 0) / nums.length * 10) / 10; if (rec.C == null) rec.C = rec.brujula_media; }
      }
    }
    function nro(re) { var m = txt.match(re); return m ? parseFloat(m[1].replace(",", ".")) : null; }
    function poner(k, v) { if (v != null && !isNaN(v)) rec[k] = v; }
    if (toolId === "llave_de_paso") {
      poner("resp", nro(/respiracion(?:es|s) curios[ae]s:\s*(\d+)/i));
      poner("paradas", nro(/parad(?:as|es) de pensa(?:miento|ment):\s*(\d+)/i));
      poner("abrazos", nro(/abra(?:zo|çada) sentid[ao]:\s*(\d+)/i));
      poner("honestidad", nro(/honest(?:idad|edat) emocional:\s*s[íi],\s*(\d+)/i) || (/honest(?:idad|edat) emocional:\s*(?:hoy|avui) no/i.test(txt) ? 0 : null));
      poner("limites", nro(/l[íi]mit(?:es|s):\s*(\d+)/i));
      var mn = txt.match(/man[óò]metre?o?:\s*(\d+(?:[.,]\d+)?)[^\d—\n]*?(?:→|->)\s*(\d+(?:[.,]\d+)?)/i);
      if (mn) { rec.antes = parseFloat(mn[1].replace(",", ".")); rec.despues = parseFloat(mn[2].replace(",", ".")); }
      poner("racha", nro(/continu[ïi]?(?:dad|tat):\s*(\d+)/i));
      rec.cierre = /(?:cierre del d[íi]a|tancament del dia):\s*(?:hecho|fet)/i.test(txt) ? 1 : 0;
      var dj = txt.match(/(?:se ha quedado fuera de casa|s'ha quedat fora de casa):\s*«([^»]+)»/i); if (dj) rec.dejado = dj[1].trim();
    }
    if (toolId === "entre_punto_y_punto") {
      poner("sesiones", nro(/sesiones registradas:\s*(\d+)/i));
      poner("escenas", nro(/escenas en imaginaci[óo]n:\s*(\d+)/i));
      poner("dias_activos", nro(/d[íi]as con pr[áa]ctica:\s*(\d+)/i));
      poner("racha", nro(/racha:\s*(\d+)/i));
      poner("lat04", nro(/latencia \(0-4\):\s*(\d+(?:[.,]\d+)?)/i));
      poner("den04", nro(/densidad \(0-4\):\s*(\d+(?:[.,]\d+)?)/i));
      poner("cont10", nro(/continuidad \(0-10\):\s*(\d+(?:[.,]\d+)?)/i));
      poner("foco", nro(/atenci[óo]n en la tarea:\s*(\d+(?:[.,]\d+)?)/i));
      poner("sobrepensamiento", nro(/sobrepensamiento:\s*(\d+(?:[.,]\d+)?)/i));
      poner("tension", nro(/tensi[óo]n corporal:\s*(\d+(?:[.,]\d+)?)/i));
      var tp = txt.match(/tensi[óo]n pico media:\s*(\d+(?:[.,]\d+)?)\/10\s*→\s*final\s*(\d+(?:[.,]\d+)?)/i);
      if (tp) { rec.antes = parseFloat(tp[1].replace(",", ".")); rec.despues = parseFloat(tp[2].replace(",", ".")); }
      var mf = txt.match(/momentos con m[áa]s fuga:\s*(.+)/i); if (mf) rec.fugas = mf[1].trim();
      rec.plan = /plan de partido/i.test(txt) ? 1 : 0;
      // Escalas propias (0-4) → 0-10, para la línea L/D/C del panel.
      if (rec.lat04 != null && rec.L == null) rec.L = Math.round(rec.lat04 * 2.5 * 10) / 10;
      if (rec.den04 != null && rec.D == null) rec.D = Math.round(rec.den04 * 2.5 * 10) / 10;
      if (rec.cont10 != null && rec.C == null) rec.C = rec.cont10;
    }
    if (toolId === "paso_a_paso") {
      var pd = txt.match(/pelda[ñn]o trabajado:\s*(\d+)\s*de\s*(\d+)/i); if (pd) { rec.peldano = +pd[1]; rec.peldanos = +pd[2]; }
      var sv = txt.match(/salida[\s\S]*?ansiedad \(0-10\):([^\n]*)/i);
      if (sv) { var pk = sv[1].match(/pico\s*(\d+)/i), dp = sv[1].match(/despu[ée]s\s*(\d+)/i), anPas = sv[1].match(/antes\s*(\d+)/i);
        if (anPas) rec.ans_antes = +anPas[1]; if (pk) rec.ans_max = +pk[1]; if (dp) rec.ans_final = +dp[1]; }
      var pa = txt.match(/quedándome conmigo[^:]*:\s*(s[íi]|en parte|hoy no)/i); if (pa) rec.paso_ais = /s[íi]/i.test(pa[1]) && !/parte/.test(pa[1]) ? "si" : /parte/.test(pa[1]) ? "parte" : "no";
      var ay = txt.match(/qu[ée] me ayud[óo]:\s*(.+)/i); if (ay) rec.ayudo = ay[1].trim();
      var im = txt.match(/imaginaci[óo]n[\s\S]*?ansiedad \(0-10\):\s*inicio\s*(\d+)\s*·\s*final\s*(\d+)/i); if (im) { rec.imag_ini = +im[1]; rec.imag_fin = +im[2]; }
      var ru = txt.match(/rutina del d[íi]a:\s*(\d+)\s*de\s*(\d+)/i); if (ru) { rec.rutina = +ru[1]; rec.rutina_total = +ru[2]; }
      poner("rumia", nro(/rumiaci[óo]n hoy \(0-10\):\s*(\d+)/i));
      poner("animo", nro(/[áa]nimo hoy \(0-10\):\s*(\d+)/i));
      var lg = txt.match(/logro de hoy:\s*(.+)/i); if (lg) rec.logro = lg[1].trim();
    }
    function frase(re) { var m = txt.match(re); return m ? m[1].trim() : null; }
    if (toolId === "recorrido_tec") {
      var et = txt.match(/etapa:\s*etapa\s*(\d+)\s*·\s*([^(\n]+?)\s*\(d[íi]a\s*(\d+)\)/i); if (et) { rec.etapa = +et[1]; rec.etapa_txt = et[2].trim(); rec.dia_etapa = +et[3]; }
      var ph = txt.match(/pasos hechos en la etapa:\s*(\d+)\s*de\s*(\d+)/i); if (ph) { rec.pasos = +ph[1]; rec.pasos_total = +ph[2]; }
      var pp2 = txt.match(/pr[áa]ctica programada:\s*(\d+)\s*de\s*14 d[íi]as\s*·\s*en calma\s*(\d+)\s*\/\s*porque estaba mal\s*(\d+)/i); if (pp2) { rec.prog14 = +pp2[1]; rec.calma = +pp2[2]; rec.mal = +pp2[3]; }
      poner("ruido", nro(/ruido interno medio[^:]*:\s*(\d+(?:[.,]\d+)?)/i));
      poner("cv7", nro(/micro-acci[óo]n con valor:\s*(\d+)\s*de 7/i)); poner("iti", nro(/ITI \(7 d\):\s*(\d+)/i));
      var ae = txt.match(/autoevaluaci[óo]n \(([^)]+)\):\s*L\s*(\d+(?:[.,]\d+)?)\s*·\s*D\s*(\d+(?:[.,]\d+)?)\s*·\s*C\s*(\d+(?:[.,]\d+)?)/i);
      if (ae) { rec.eval_fecha = ae[1]; rec.L = parseFloat(ae[2].replace(",", ".")); rec.D = parseFloat(ae[3].replace(",", ".")); rec.C = parseFloat(ae[4].replace(",", ".")); }
      if (/⚠\s*indica pensamientos de hacerse da[ñn]o/i.test(txt)) rec.riesgo = 1;
    }
    if (toolId === "evaluacion_trauma") { var tr = decodificarTrauma(txt) || { valido: 0 }; Object.keys(tr).forEach(function (k) { rec[k] = tr[k]; }); if (tr.fecha) rec.date = tr.fecha; }
    if (toolId === "control_ira") {
      // «Nivel inicial: 😠 Muy activado (4/5)»: el genérico ya toma nivel_inicial / nivel_final.
      var ni2 = frase(/niv[ei]ll? inicial:\s*\S+\s+([^(\n]+?)\s*\(/i), nf2 = frase(/niv[ei]ll? final:\s*\S+\s+([^(\n]+?)\s*\(/i);
      if (ni2) rec.nivel_inicial_txt = ni2; if (nf2) rec.nivel_final_txt = nf2;
      rec.desencadenante = frase(/desencadenant[e]?:\s*([^\n]+)/i);
      rec.sensacion = frase(/sensaci[óo] ?n? corporal:\s*([^\n]+)/i);
      rec.tecnica = frase(/t[èée]cnica:\s*([^\n]+)/i);
      if (rec.nivel_inicial != null && rec.nivel_final != null) rec.baja = rec.nivel_inicial - rec.nivel_final;
    }
    if (toolId === "exploradora_valiente") {
      rec.mision = frase(/misi[óo]n:\s*([^\n(]+)/i); poner("estrellas", nro(/\((\d)★\)/));
      var lo = frase(/lo logr[óo]\?:\s*([^\n]+)/i); if (lo) rec.logro = /del todo/i.test(lo) ? "si" : /medias/i.test(lo) ? "medias" : "no";
      var ab = frase(/abrazo en vez de repetir\?:\s*([^\n]+)/i); if (ab) rec.abrazo = /^s[íi]/i.test(ab) ? 1 : 0;
      var pl = frase(/^plan:\s*([^\n]+)/im); if (pl) rec.sin_negociar = /sin negociar/i.test(pl) ? 1 : 0;
      var caras = ["😣", "😟", "😐", "🙂", "😄"], ce = txt.match(/c[óo]mo estaba:\s*(\S+)\s*→\s*(\S+)/i);
      if (ce) { var i1 = caras.indexOf(ce[1]), i2 = caras.indexOf(ce[2]); if (i1 >= 0) rec.cara_antes = i1 + 1; if (i2 >= 0) rec.cara_despues = i2 + 1; }
      rec.premio = frase(/premio:\s*([^\n]+)/i);
    }
    if (toolId === "mision_barrio") {
      rec.nivel_txt = frase(/nivel:\s*([^\n(·]+)/i);
      var hf = frase(/hasta el final\?:\s*([^\n]+)/i); if (hf) rec.final = /hasta el final/i.test(hf) ? "si" : /antes/i.test(hf) ? "antes" : "no";
      var al = txt.match(/alarma:\s*(\d+)\s*→\s*(\d+)/i); if (al) { rec.antes = +al[1]; rec.despues = +al[2]; }
      var ps = frase(/¿?pas[óo]\?:\s*([^\n]+)/i); if (ps) rec.paso = /falsa/i.test(ps) ? "falsa" : /poquito/i.test(ps) ? "poco" : "si";
      rec.frase_campeon = frase(/frase de campe[óo]n:\s*«?([^»\n]+)/i); rec.mejor = frase(/lo mejor:\s*([^\n]+)/i);
      rec.superpoderes = frase(/superpoderes:\s*([^\n]+)/i);
      var pn = frase(/plan sin negociar:\s*([^\n]+)/i); if (pn) rec.sin_negociar = /sin negociar/i.test(pn) ? 1 : 0;
    }
    if (toolId === "ritual_calma") {
      var au = frase(/audio:\s*([^\n]+)/i); if (au) rec.audio = /conmigo/i.test(au) ? "conmigo" : /silencio/i.test(au) ? "silencio" : "no";
      var rp = frase(/respet[óo] el momento\?:\s*([^\n]+)/i); if (rp) rec.respeto = /^s[íi]/i.test(rp) ? 1 : 0;
    }
    if (toolId === "escalera_comidas") {
      var escC = txt.match(/escalones:\s*(\d+)\s*de\s*(\d+)/i); if (escC) { rec.escalones = +escC[1]; rec.escalones_total = +escC[2]; }
      rec.alimento = frase(/ahora:\s*([^·\n]+)/i);
      var rg = txt.match(/registros:\s*(\d+)\s*\((\d+) conseguidos\)/i); if (rg) { rec.intentos = +rg[1]; rec.conseguidos = +rg[2]; }
      var ul = txt.match(/·\s*\d{4}-\d{2}-\d{2}\s*(✓|○)\s*([^\n(→]+)/g); if (ul) { var last = ul[ul.length - 1]; rec.ultimo_ok = /✓/.test(last) ? 1 : 0; rec.ultimo_alimento = last.replace(/^.*?(✓|○)\s*/, "").trim(); }
    }
    if (toolId === "rincon_calma") { rec.juego = frase(/·\s*juego:\s*(\w+)/i); poner("practicas", nro(/registros:\s*(\d+)/i)); }
    if (toolId === "escalera_exposicion") {
      rec.peldano_txt = frase(/pelda[ñn]o:\s*([^\n(]+)/i); poner("dificultad", nro(/dif\.\s*(\d+)/i));
      var ax = txt.match(/alarma:\s*(\d+)\s*→\s*pico\s*(\d+)\s*→\s*(\d+)/i); if (ax) { rec.ans_antes = +ax[1]; rec.ans_max = +ax[2]; rec.ans_final = +ax[3]; }
      var de = frase(/desenlace:\s*([^\n]+)/i); if (de) rec.resultado = /hu[íi]/i.test(de) ? "escape" : "sostuve";
      var aisAct = frase(/ais activo:\s*([^\n]+)/i); if (aisAct) rec.paso_ais = /^s[íi]/i.test(aisAct) ? "si" : "no";
    }
    if (toolId === "honestidad_emocional") {
      var it = txt.match(/intensidad:\s*(\d+)\s*→\s*(\d+)/i); if (it) { rec.intensidad_antes = +it[1]; rec.intensidad_despues = +it[2]; }
      rec.con = frase(/lo comparto con:\s*([^\n]+)/i); rec.zona = frase(/d[óo]nde lo noto:\s*([^\n]+)/i);
      rec.paso_valor = frase(/mi paso en direcci[óo]n a lo que importa:\s*([^\n]+)/i);
      if (/sin necesidad/i.test(txt)) rec.motivo = "verde";
    }
    if (toolId === "protocolo_ais") {
      poner("dias_completados", nro(/d[íi]as completados:\s*(\d+)/i)); poner("racha", nro(/racha actual:\s*(\d+)/i));
      poner("fase", nro(/fase que estoy practicando:\s*(\d+)/i)); poner("fase_recomendada", nro(/fase recomendada:\s*(\d+)/i));
      rec.fase_txt = frase(/fase que estoy practicando:\s*\d+\s*·\s*([^\n]+)/i);
    }
    if (toolId === "tracker_ais") {
      poner("paradas", nro(/parades de pensament:\s*(\d+)/i)); poner("resp", nro(/respiraci[óo] conscient:\s*(\d+)/i));
      poner("abrazos", nro(/abra[çc]os sentits:\s*(\d+)/i)); poner("proactivas", nro(/🟢\s*(\d+)\s*proactiv/i)); poner("reactivas", nro(/🔴\s*(\d+)\s*reactiv/i));
    }
    if (toolId === "estoy_aqui_conmigo") {
      poner("practicas", nro(/pr[áa]cticas:\s*(\d+)/i)); poner("esperar", nro(/veces que pude esperar:\s*(\d+)/i)); poner("calma", nro(/pr[áa]cticas en calma[^:]*:\s*(\d+)/i));
      var ur = txt.match(/urgencia media:\s*(\d+(?:[.,]\d+)?)\s*→\s*(\d+(?:[.,]\d+)?)/i); if (ur) { rec.antes = parseFloat(ur[1].replace(",", ".")); rec.despues = parseFloat(ur[2].replace(",", ".")); }
    }
    if (toolId === "pedalea_desde_dentro") {
      poner("disfrute", nro(/disfrute \(media\):\s*(\d+(?:[.,]\d+)?)/i)); poner("presion", nro(/presi[óo]n por demostrar \(media\):\s*(\d+(?:[.,]\d+)?)/i));
      poner("amor_firme", nro(/amor firme\(10\) \(media\):\s*(\d+(?:[.,]\d+)?)/i));
      var vt = txt.match(/volvi[óo] a la tarea en subida:\s*(\d+)\s*\/\s*(\d+)/i); if (vt) { rec.vuelve = +vt[1]; rec.vuelve_total = +vt[2]; }
    }
    if (toolId === "toco_desde_dentro") {
      var tt2 = txt.match(/total:\s*(\d+)\s*respiros[^·]*·\s*(\d+)\s*puertas\s*·\s*(\d+)\s*«no»[^·]*·\s*(\d+)\s*cierres/i);
      if (tt2) { rec.respiros = +tt2[1]; rec.puertas = +tt2[2]; rec.noes = +tt2[3]; rec.cierres = +tt2[4]; }
    }
    if (toolId === "registro_texto") { var tt = tituloDe(txt); if (tt) rec.herramienta = tt; }
    rec.texto = txt;
    return { toolId: toolId, nombre: nombre, record: rec };
  }

  /* Texto pegado → lista de mensajes {texto, fecha}. Entiende la copia de varios
     mensajes de WhatsApp («[19:40, 26/10/2026] Nombre: …»). Con varios mensajes
     se quedan solo los de herramientas (fuera charla, fotos, enlaces…). */
  var CAB = /^\[(\d{1,2}):(\d{2})(?::\d{2})?,\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\]\s*[^:\n]+:\s?/gm;
  function separarMensajes(texto) {
    texto = String(texto || "").replace(/\r\n?/g, "\n");
    // El enlace al panel que añaden las herramientas no forma parte del registro.
    texto = texto.replace(/\n*📲[^\n]*\n?https?:\/\/\S+#t=\S+/g, "");
    var out = [], cabs = [], m;
    CAB.lastIndex = 0;
    while ((m = CAB.exec(texto))) cabs.push({ i: m.index, fin: CAB.lastIndex, fecha: anyo(m[5]) + "-" + pad(m[4]) + "-" + pad(m[3]) });
    if (cabs.length) {
      cabs.forEach(function (c, k) {
        var t = texto.slice(c.fin, k + 1 < cabs.length ? cabs[k + 1].i : texto.length).trim();
        if (t) out.push({ texto: t, fecha: c.fecha });
      });
    } else {
      // Varios mensajes sin encabezado: se separan tras cada «(Enviado desde …)».
      var partes = texto.split(/(\(Envia(?:do|t) des(?:de| de)[^)]*\))/i), acc = "";
      for (var i = 0; i < partes.length; i++) {
        acc += partes[i];
        if (i % 2 === 1) { if (acc.trim()) out.push({ texto: acc.trim(), fecha: null }); acc = ""; }
      }
      if (acc.trim()) out.push({ texto: acc.trim(), fecha: null });
    }
    if (out.length > 1) out = out.filter(function (x) { return esDeHerramienta(x.texto); });
    return out;
  }
  function parseMensajes(texto) {
    return separarMensajes(texto).map(function (x) { return parseRegistroTexto(x.texto, x.fecha); });
  }

  g.parseRegistroTexto = parseRegistroTexto;
  g.tituloRegistroTexto = tituloDe;
  g.decodificarTrauma = decodificarTrauma;
  g.separarMensajes = separarMensajes;
  g.parseMensajes = parseMensajes;
  g.esDeHerramienta = esDeHerramienta;
})(typeof window !== "undefined" ? window : globalThis);
