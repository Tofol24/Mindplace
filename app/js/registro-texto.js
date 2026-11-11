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
    [/d[óo]nde est[áa] (tu|mi) mono|detective del mono/i, "donde_mono", "¿Dónde está tu mono?"],  // al inicio: su resumen nombra otras herramientas
    [/agenda atencional/i, "agenda_atencional", "Agenda atencional"],
    [/salir con mi mona|reto:\s*salir.*mona/i, "reto_mona", "Reto: salir con mi mona al lado"],
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
    [/autorregistre|autorregistro/i, "autorregistro", "Autorregistro (control de ira)"],
    [/compromiso semanal/i, "compromiso_semanal", "Compromiso semanal"],
    [/cuestionario/i, "cuestionario_tec", "Cuestionario TEC"]
  ];
  function esDeHerramienta(t) {
    return /APRENS|Enviado desde mi herramienta|Enviat des de/i.test(t) || SIG.some(function (s) { return s[0].test(t); });
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
    if (toolId === "reto_mona") {
      var hd = txt.match(/APRENS\s*·\s*[a-zà-ÿ]+\s+(\d{1,2})\s+de\s+([a-zà-ÿ]+)\s+de\s+(\d{4})/i);
      if (hd) { var mz = MESES[hd[2].toLowerCase()]; if (mz) rec.date = hd[3] + "-" + pad(mz) + "-" + pad(hd[1]); }
      var nv = txt.match(/nivel\s+(\d+)\s*:/i); if (nv) rec.nivel = +nv[1];
      var an2 = txt.match(/ANTES[^0-9]*?(\d+)\s*\/\s*10/i); if (an2) rec.ans_antes = +an2[1];
      var ax = txt.match(/ansiedad\s+m[áa]x\s*(\d+)\s*\/\s*10/i); if (ax) rec.ans_max = +ax[1];
      var afn = txt.match(/final\s*(\d+)\s*\/\s*10/i); if (afn) rec.ans_final = +afn[1];
      var res = /lo sostuve/i.test(txt) ? "sostuve" : /escap[ée]/i.test(txt) ? "escape" : /lo evit[ée]/i.test(txt) ? "evite" : null;
      if (res) rec.resultado = res;
      // El éxito no es ansiedad cero sino sostener con presencia: D y C salen del resultado.
      var pres = { sostuve: 8, escape: 5, evite: 3 }[res], cont = { sostuve: 9, escape: 5, evite: 2 }[res];
      if (pres != null && rec.D == null) rec.D = pres;
      if (cont != null && rec.C == null) rec.C = cont;
    }
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
  g.separarMensajes = separarMensajes;
  g.parseMensajes = parseMensajes;
  g.esDeHerramienta = esDeHerramienta;
})(typeof window !== "undefined" ? window : globalThis);
