/* APRENS · Pizarra del entrenador
   ---------------------------------------------------------------------------
   Cuaderno de entrenos y partidos con pizarra táctica animada.
   - Todo se guarda en este navegador (localStorage). Nada sale a terceros.
   - "Enviar al grupo" crea un enlace con el plan comprimido en el #hash
     (el hash no llega al servidor). Los jugadores lo abren en modo lectura,
     eligen su dorsal y ven dónde juegan, cómo se mueven y qué hacer en cada paso.
   Coordenadas en metros: campo 68 × 105. Nuestro equipo ataca hacia arriba (y = 0).
*/
(function () {
  "use strict";

  // ---------------------------------------------------------------- utilidades
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const r05 = (n) => Math.round(n * 2) / 2;
  const clon = (o) => JSON.parse(JSON.stringify(o));
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const W = 68, L = 105;
  const CLAVE = "aprens_pizarra_v1";

  function toast(t) {
    const el = $("#toast");
    el.textContent = t; el.classList.add("ver");
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("ver"), 2600);
  }

  // ---------------------------------------------------------------- sistemas
  // [código, nombre, familia, x, y]  (orden de índice estable entre sistemas)
  const SISTEMAS = {
    "4231": { n: "1-4-2-3-1", s: [
      ["POR", "Portero", "por", 34, 101], ["LI", "Lateral izquierdo", "lat", 8, 82], ["CTI", "Central izquierdo", "cen", 24, 90],
      ["CTD", "Central derecho", "cen", 44, 90], ["LD", "Lateral derecho", "lat", 60, 82], ["PVI", "Pivote izquierdo", "piv", 27, 74],
      ["PVD", "Pivote derecho", "piv", 41, 74], ["EI", "Extremo izquierdo", "ext", 10, 62], ["MP", "Mediapunta", "mp", 34, 64],
      ["ED", "Extremo derecho", "ext", 58, 62], ["DC", "Delantero centro", "del", 34, 55]] },
    "433": { n: "1-4-3-3", s: [
      ["POR", "Portero", "por", 34, 101], ["LI", "Lateral izquierdo", "lat", 8, 82], ["CTI", "Central izquierdo", "cen", 24, 90],
      ["CTD", "Central derecho", "cen", 44, 90], ["LD", "Lateral derecho", "lat", 60, 82], ["INI", "Interior izquierdo", "med", 24, 68],
      ["IND", "Interior derecho", "med", 44, 68], ["EI", "Extremo izquierdo", "ext", 10, 58], ["PIV", "Pivote", "piv", 34, 77],
      ["ED", "Extremo derecho", "ext", 58, 58], ["DC", "Delantero centro", "del", 34, 55]] },
    "442": { n: "1-4-4-2", s: [
      ["POR", "Portero", "por", 34, 101], ["LI", "Lateral izquierdo", "lat", 8, 82], ["CTI", "Central izquierdo", "cen", 24, 90],
      ["CTD", "Central derecho", "cen", 44, 90], ["LD", "Lateral derecho", "lat", 60, 82], ["MCI", "Mediocentro izquierdo", "piv", 27, 72],
      ["MCD", "Mediocentro derecho", "piv", 41, 72], ["MI", "Medio izquierdo", "ext", 8, 66], ["DCI", "Delantero izquierdo", "del", 28, 56],
      ["MD", "Medio derecho", "ext", 60, 66], ["DCD", "Delantero derecho", "del", 40, 56]] },
    "343": { n: "1-3-4-3", s: [
      ["POR", "Portero", "por", 34, 101], ["CAI", "Carrilero izquierdo", "lat", 6, 74], ["CTI", "Central izquierdo", "cen", 20, 90],
      ["CTD", "Central derecho", "cen", 48, 90], ["CAD", "Carrilero derecho", "lat", 62, 74], ["MCI", "Mediocentro izquierdo", "piv", 27, 74],
      ["MCD", "Mediocentro derecho", "piv", 41, 74], ["EI", "Extremo izquierdo", "ext", 12, 58], ["LIB", "Central", "cen", 34, 93],
      ["ED", "Extremo derecho", "ext", 56, 58], ["DC", "Delantero centro", "del", 34, 55]] }
  };

  const CATS = {
    calentamiento: "Calentamiento", ejercicio: "Ejercicio", rondo: "Rondo / posesión", juego: "Juego reducido",
    transicion: "Transiciones", salida: "Salida de balón", presion: "Presión en saque de puerta rival",
    banda: "Saque de banda", cornerF: "Córner a favor", cornerC: "Córner en contra", falta: "Faltas",
    situacion: "Situación de partido", otro: "Otro"
  };
  const PLANT_POR_CAT = { salida: "salida", presion: "presion", banda: "banda", cornerF: "cornerF", cornerC: "cornerC", falta: "falta", rondo: "rondo", transicion: "transicion" };
  const PLANTILLAS = {
    vacia: "Los dos equipos colocados (1 paso)", salida: "Salida de balón en corto", presion: "Presión en saque de puerta rival",
    banda: "Saque de banda ofensivo", cornerF: "Córner a favor", cornerC: "Córner en contra", falta: "Falta lateral a favor",
    rondo: "Rondo 4 contra 2", transicion: "Transición tras robo (medio campo)", libre: "Pizarra en blanco (solo balón)"
  };
  const COLORES_DIB = [["#FFD23F", "amarillo"], ["#FF4FA3", "rosa"], ["#FF8A1F", "naranja"], ["#FFFFFF", "blanco"], ["#E11D2E", "rojo"], ["#3B82F6", "azul"]];
  const COLORES_CONO = { rojo: "#D7263D", azul: "#2457C5", amarillo: "#F5C400", naranja: "#FF7A00", blanco: "#F2F2F2" };

  // Claves por fase de juego y familia de puesto
  const CLAVES = {
    salida: {
      por: "Tú eres el primer pase. Si el central está libre, saca rápido; si no, espera a que se abran. Ofrécete detrás después.",
      cen: "Ábrete hasta el borde del área con el perfil hacia dentro. Si te presionan, apoya en el portero o juega con el lateral.",
      lat: "Da amplitud: pegado a la línea y más alto que el central. Recibe mirando hacia delante.",
      piv: "Uno baja a ayudar y el otro da la línea por dentro. Siempre de cara al juego, nunca escondido detrás de un rival.",
      med: "Escalónate con el pivote: no estéis en la misma línea. Busca el hueco entre dos rivales.",
      mp: "Entre líneas, a la espalda de sus medios. Mira antes de recibir para poder girarte.",
      ext: "Fija al lateral rival bien abierto. Si su lateral salta, ataca su espalda.",
      del: "Fija a los centrales y estira el campo. Si el balón no puede salir, ofrece un apoyo de cara."
    },
    presion: {
      por: "Adelántate fuera del área: eres el último defensa. Habla y ordena la altura de la línea.",
      cen: "Línea alta y junta. Vigila al delantero; si recibe de espaldas, anticípate.",
      lat: "Si su extremo recibe, salta. Si el balón está lejos, cierra hacia dentro.",
      piv: "Juntos detrás de la primera presión: tapa el pase por dentro para que solo puedan ir a la banda.",
      med: "Salta al pivote o al interior que reciba. Que no puedan girarse.",
      mp: "Tapa al pivote rival con tu sombra: que el balón no pase por el centro.",
      ext: "Cierra hacia dentro para quitar el pase interior. Cuando el balón va a su lateral, ¡salta!",
      del: "Presiona en curva: corre hacia el central tapando el pase al portero y empújalo hacia la banda."
    },
    banda: {
      _: "Saque rápido, antes de que se coloquen. Tres opciones: corto, largo y a la espalda.",
      lat: "Saca con los dos pies en el suelo y detrás de la línea. Busca al compañero que se mueve, no al que está quieto.",
      ext: "Amaga hacia el balón y después ataca el espacio (o al revés). La clave es el cambio de ritmo.",
      mp: "Amaga hacia el balón y después ataca el espacio. Ofrece también la pared.",
      piv: "Seguridad: apoyo de cara para devolver de primeras.",
      med: "Seguridad: apoyo de cara para devolver de primeras.",
      del: "Atrae a los centrales y ofrece el saque largo. Prepárate para la segunda jugada.",
      cen: "Vigilancia: mantén la posición por si perdemos el balón.",
      por: "Adelanta la posición y habla a la línea."
    },
    cornerF: {
      del: "Arranca tarde y fuerte hacia tu zona. Ataca el balón en el punto más alto.",
      cen: "Arranca tarde y fuerte hacia tu zona. Ataca el balón en el punto más alto.",
      mp: "Borde del área: rechace. Si perdemos, eres el primero en frenar la contra.",
      med: "Borde del área: rechace. Si perdemos, eres el primero en frenar la contra.",
      piv: "Borde del área: rechace. Si perdemos, eres el primero en frenar la contra.",
      ext: "Si lanzas: centro tenso y con rosca al punto acordado. Si no, ataca el segundo palo.",
      lat: "Vigilancia: controla al delantero rival que se queda arriba.",
      por: "Adelanta la posición. Habla con la vigilancia."
    },
    cornerC: {
      por: "Habla: «¡Mía!» o «¡Fuera!». Si sales, sal decidido.",
      cen: "Defiende tu zona: ataca el balón saltando hacia delante. Despeja alto, lejos y hacia la banda.",
      lat: "Defiende tu zona: ataca el balón saltando hacia delante. Despeja alto, lejos y hacia la banda.",
      piv: "Defiende tu zona: ataca el balón saltando hacia delante. Despeja alto, lejos y hacia la banda.",
      med: "Defiende tu zona: ataca el balón saltando hacia delante. Despeja alto, lejos y hacia la banda.",
      mp: "Rechace en la frontal: el balón que sale es tuyo.",
      ext: "Preparado para salir a la contra: en cuanto despejemos, ¡corre!",
      del: "Preparado para salir a la contra: en cuanto despejemos, ¡corre!"
    },
    falta: { _: "Arrancamos todos a la vez cuando el lanzador levanta el brazo. Cuidado con el fuera de juego." },
    transicion: { _: "Al robar: primer pase hacia delante si se puede. Al perder: presión inmediata 5 segundos." },
    rondo: { _: "Perfil abierto antes de recibir, dos toques como máximo. Los de dentro presionan juntos." }
  };

  // Juego parado → momento de atención interna (APRENS: no luchar, volver al estímulo relevante)
  const PARADO = { banda: "quién se mueve y dónde está el espacio", cornerF: "tu zona y la trayectoria del balón", cornerC: "el balón y tu zona", falta: "la señal del lanzador y la línea del fuera de juego" };

  // ---------------------------------------------------------------- saneado
  // Todo lo que entra de fuera (enlace #ver=, copia de seguridad, localStorage)
  // se reconstruye campo a campo: ids, números, colores y tipos de una lista cerrada.
  const RE_ID = /^[A-Za-z0-9_]{1,16}$/;
  const txt = (v, n) => (typeof v === "string" || typeof v === "number" ? String(v).slice(0, n || 200) : "");
  const num = (v, a, b, def) => { const n = Number(v); return isFinite(n) ? lim(n, a, b) : def; };
  const pt = (v) => (Array.isArray(v) && v.length === 2 ? [num(v[0], -10, 78, 34), num(v[1], -10, 115, 52.5)] : null);
  const idOk = (v) => (typeof v === "string" && RE_ID.test(v) ? v : null);
  const colOk = (v, def) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : def);
  function sanJugador(j) {
    const id = idOk(j && j.id); if (!id) return null;
    return { id: id, d: Math.round(num(j.d, 0, 99, 0)), n: txt(j.n, 60) || "Jugador", c: txt(j.c, 18), p: txt(j.p, 24) };
  }
  function sanJugada(g) {
    if (!g || !Array.isArray(g.fichas) || !Array.isArray(g.pasos)) return null;
    const fichas = [], ids = new Set();
    g.fichas.slice(0, 80).forEach((f) => {
      const id = idOk(f && f.id); if (!id || id === "_b" || ids.has(id) || !["a", "r", "c"].includes(f.eq)) return;
      const o = { id: id, eq: f.eq };
      if (idOk(f.pj)) o.pj = f.pj;
      if (f.eq === "c") { o.forma = f.forma === "chino" ? "chino" : "cono"; o.col = COLORES_CONO[f.col] ? f.col : "amarillo"; }
      ids.add(id); fichas.push(o);
    });
    const pasos = g.pasos.slice(0, 40).map((p) => {
      p = p || {};
      const pos = {};
      ids.forEach((id) => { const q = pt(p.pos && p.pos[id]); if (q) pos[id] = q; });
      const tips = {};
      if (p.tips && typeof p.tips === "object") Object.keys(p.tips).forEach((id) => {
        if (!ids.has(id) || !p.tips[id]) return;
        const t = {}; ["m", "p", "f", "q"].forEach((k) => { const v = txt(p.tips[id][k], 300); if (v) t[k] = v; });
        if (Object.keys(t).length) tips[id] = t;
      });
      const dib = (Array.isArray(p.dib) ? p.dib : []).slice(0, 40).map((k) => {
        if (!k || !["linea", "flecha", "zona", "texto"].includes(k.k) || !Array.isArray(k.pts)) return null;
        const pts = k.pts.slice(0, 20).map((q) => (typeof q === "string" ? (ids.has(q) ? q : null) : pt(q))).filter(Boolean);
        if (!pts.length) return null;
        return { k: k.k, c: colOk(k.c, "#FFD23F"), pts: pts, t: txt(k.t, 40) };
      }).filter(Boolean);
      return { t: txt(p.t, 80), pos: pos, b: pt(p.b) || [34, 52.5], tips: tips, dib: dib };
    });
    if (!pasos.length) return null;
    return { vista: ["C", "A", "D"].includes(g.vista) ? g.vista : "C", rivales: g.rivales !== false, fichas: fichas, pasos: pasos };
  }
  function sanPlan(p) {
    if (!p || !Array.isArray(p.bloques)) return null;
    const once = {};
    if (p.once && typeof p.once === "object") Object.keys(p.once).forEach((k) => { if (/^\d{1,2}$/.test(k) && idOk(p.once[k])) once[k] = p.once[k]; });
    return {
      id: idOk(p.id) || uid(), tipo: p.tipo === "partido" ? "partido" : "entreno",
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(p.fecha) ? p.fecha : "", titulo: txt(p.titulo, 80), rival: txt(p.rival, 60),
      objetivo: txt(p.objetivo, 600), notas: txt(p.notas, 800), clave: txt(p.clave, 30),
      sistema: SISTEMAS[p.sistema] ? p.sistema : "4231", once: once,
      bloques: p.bloques.slice(0, 30).map((b) => ({
        id: idOk(b && b.id) || uid(), cat: CATS[b && b.cat] ? b.cat : "otro", titulo: txt(b.titulo, 80),
        min: b.min === "" || b.min == null ? "" : Math.round(num(b.min, 0, 120, 0)), texto: txt(b.texto, 1200),
        consignas: txt(b.consignas, 800), fij: txt(b.fij, 300), cuando: txt(b.cuando, 300), jug: sanJugada(b.jug)
      }))
    };
  }
  function sanDB(o) {
    if (!o || typeof o !== "object" || !Array.isArray(o.planes) || !Array.isArray(o.plantilla)) return null;
    return {
      v: 1,
      equipo: { nombre: txt(o.equipo && o.equipo.nombre, 60) || "Mi equipo", color: colOk(o.equipo && o.equipo.color, "#C8102E") },
      plantilla: o.plantilla.map(sanJugador).filter(Boolean),
      planes: o.planes.map(sanPlan).filter(Boolean)
    };
  }
  function sanPaquete(o) {
    if (!o || typeof o !== "object") return null;
    const plan = sanPlan(o.plan); if (!plan) return null;
    return { v: 1, eq: { n: txt(o.eq && o.eq.n, 60), col: colOk(o.eq && o.eq.col, "#C8102E") }, plan: plan, jug: (Array.isArray(o.jug) ? o.jug : []).map(sanJugador).filter(Boolean) };
  }

  // ---------------------------------------------------------------- datos
  function dbVacia() {
    return { v: 1, equipo: { nombre: "Mi equipo", color: "#C8102E" }, plantilla: [], planes: [] };
  }
  let db;
  try { db = sanDB(JSON.parse(localStorage.getItem(CLAVE))) || dbVacia(); } catch (e) { db = dbVacia(); }
  if (!db.equipo) db.equipo = dbVacia().equipo;
  let tGuardar = null;
  function guardar() {
    clearTimeout(tGuardar);
    tGuardar = setTimeout(() => {
      try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) { toast("No se ha podido guardar en este navegador."); }
    }, 250);
  }

  // ---------------------------------------------------------------- plantillas de jugada
  const BASE_RIVAL_442 = [[34, 4], [58, 46], [42, 50], [26, 50], [10, 46], [60, 66], [42, 64], [26, 64], [8, 66], [42, 84], [26, 84]];
  function arr2map(pref, arr) { const m = {}; arr.forEach((p, i) => { if (p) m[pref + i] = p.slice(); }); return m; }

  // Cada plantilla: {vista, fichas:[...], pasos:[{t, a:{i:[x,y]}, r:{i:[x,y]}, b:[x,y], pos:{id:[x,y]} }]}
  // Los pasos solo indican lo que cambia; el resto se hereda del paso anterior.
  const DEF = {
    salida: { a: [[34, 100], [6, 80], [20, 96], [48, 96], [62, 80], [26, 78], [42, 78], [6, 58], [34, 66], [62, 58], [34, 52]],
      r: BASE_RIVAL_442,
      pasos: [
        { t: "Saque de puerta: abrimos el campo", b: [34, 98.5] },
        { t: "Pase al central derecho", b: [47.5, 95], a: { 6: [40, 84], 4: [63, 74] }, r: { 9: [44, 90], 10: [32, 92] } },
        { t: "Atrae y suelta: pase al lateral", b: [62, 73.5], a: { 9: [56, 56], 8: [44, 66], 6: [44, 80], 3: [50, 92] }, r: { 5: [60, 70], 9: [50, 88] } },
        { t: "Pase al mediapunta entre líneas", b: [44, 64.5], a: { 10: [40, 42], 7: [14, 50], 9: [60, 44], 5: [30, 72] }, r: { 6: [44, 71], 2: [44, 52] } }
      ] },
    presion: { a: [[34, 86], [10, 54], [26, 62], [42, 62], [58, 54], [28, 44], [40, 44], [12, 30], [34, 32], [56, 30], [34, 20]],
      r: [[34, 4], [60, 22], [46, 9], [22, 9], [8, 22], [60, 40], [42, 30], [26, 30], [8, 40], [42, 50], [26, 50]],
      pasos: [
        { t: "Saque de puerta rival: colocados y juntos", b: [34, 5.5] },
        { t: "Pasa al central: ¡salta el delantero!", b: [46, 10], a: { 10: [42, 13], 9: [56, 24], 8: [42, 30], 6: [44, 40], 5: [34, 42], 7: [24, 28], 4: [60, 46], 3: [46, 58], 2: [32, 60], 1: [18, 54], 0: [36, 82] } },
        { t: "Pase al lateral: lo encerramos en la banda", b: [59.5, 22], a: { 9: [57, 19], 10: [50, 12], 8: [50, 28], 6: [48, 36], 4: [62, 38], 5: [38, 40] }, r: { 5: [62, 36] } },
        { t: "¡Robo! Ataque rápido", b: [54, 18.5], a: { 9: [54, 19], 10: [42, 10], 7: [28, 12], 8: [46, 20] }, r: { 1: [58, 18] } }
      ] },
    banda: { a: [[34, 90], [-1, 40], [24, 64], [42, 64], [56, 52], [12, 46], [30, 50], [6, 34], [18, 36], [58, 30], [28, 26]],
      r: [[34, 4], [52, 24], [38, 22], [24, 24], [8, 32], [50, 40], [36, 40], [20, 40], [14, 42], [38, 58], [26, 58]],
      pasos: [
        { t: "Colocación: tres opciones cerca del balón", b: [-1, 39] },
        { t: "El extremo amaga hacia el balón", a: { 7: [8, 42], 8: [14, 32] }, r: { 4: [9, 38] } },
        { t: "Se gira y ataca el espacio: saque a la espalda", b: [5, 26], a: { 7: [5, 27], 10: [24, 18], 8: [16, 30] }, r: { 4: [9, 34] } },
        { t: "Conduce y centra: llegamos al área", b: [6, 14], a: { 7: [6, 14.5], 10: [30, 8], 9: [44, 10], 8: [24, 16], 5: [14, 30] }, r: { 3: [28, 8], 2: [36, 7] } }
      ] },
    cornerF: { a: [[34, 92], [12, 46], [38, 19], [32, 20], [56, 46], [30, 30], [44, 30], [20, 12], [44, 17], [68.5, -0.5], [26, 18]],
      r: [[34, 1], [37, 4], [30, 5], [34, 6], [38, 8], [30, 9], [42, 12], [26, 12], [56, 4], [30, 40], [40, 42]],
      pasos: [
        { t: "Colocación fuera del área", b: [67.5, 0.5] },
        { t: "Arrancada: cada uno a su zona", a: { 10: [37, 5], 3: [34, 10], 2: [30, 6], 8: [42, 13], 7: [24, 8] } },
        { t: "Centro al punto de penalti: remate", b: [34, 9.5], a: { 3: [34, 10] } }
      ] },
    cornerC: { a: [[33, 103], [30, 104], [30, 99], [36, 99], [42, 101], [40, 97], [33, 95], [10, 82], [33, 88], [54, 78], [30, 72]],
      r: [[34, 30], [28, 96], [34, 93], [40, 95], [36, 90], [26, 92], [44, 92], [3, 100], [-0.5, 105.5], [34, 82], [44, 80]],
      pasos: [
        { t: "Colocación: zona y rechace", b: [0.5, 104.5] },
        { t: "Centro: atacamos el balón", b: [35, 98], a: { 3: [35, 98.5] }, r: { 2: [34, 96], 1: [30, 98] } },
        { t: "Despejamos lejos y salimos", b: [20, 74], a: { 10: [22, 72.5], 9: [50, 62], 8: [30, 80], 2: [30, 90], 3: [36, 92], 6: [34, 88], 5: [42, 90], 4: [46, 94], 1: [26, 96] } }
      ] },
    falta: { a: [[34, 90], [14, 44], [40, 16], [32, 16], [56, 44], [30, 28], [46, 30], [24, 17], [36, 24], [61, 23], [36, 15]],
      r: [[34, 2], [44, 10], [38, 10], [32, 10], [26, 10], [53, 16], [54.5, 17.2], [20, 11], [48, 12], [34, 30], [44, 34]],
      pasos: [
        { t: "Colocación: línea en el borde del área", b: [60, 22] },
        { t: "Arrancamos cuando el lanzador levanta el brazo", a: { 10: [38, 6], 3: [32, 7], 2: [44, 7], 7: [26, 8], 8: [34, 14] }, r: { 1: [42, 7], 2: [37, 6], 3: [31, 6], 4: [25, 7] } },
        { t: "Centro tenso al primer palo", b: [39, 5.5], a: { 10: [39, 6] } }
      ] }
  };

  function slotsDe(plan) { return (SISTEMAS[plan.sistema] || SISTEMAS["4231"]).s; }

  function nuevaJugada(plan, clave) {
    const sl = slotsDe(plan);
    const jug = { vista: "C", rivales: true, fichas: [], pasos: [] };
    const aBase = sl.map((s) => [s[3], s[4]]);
    const rBase = BASE_RIVAL_442.map((p) => p.slice());
    function equipos() {
      for (let i = 0; i < 11; i++) jug.fichas.push({ id: "a" + i, eq: "a" });
      for (let i = 0; i < 11; i++) jug.fichas.push({ id: "r" + i, eq: "r" });
    }
    if (DEF[clave]) {
      const d = DEF[clave];
      equipos();
      // Las plantillas están escritas para 1-4-2-3-1: cada puesto del sistema elegido
      // toma el movimiento del puesto equivalente (mismo código o misma familia).
      const ref = SISTEMAS["4231"].s, usados = new Set(), mapa = {};
      sl.forEach((s, k) => { const j = ref.findIndex((r, n) => !usados.has(n) && r[0] === s[0]); if (j >= 0) { mapa[k] = j; usados.add(j); } });
      sl.forEach((s, k) => { if (mapa[k] !== undefined) return; let j = ref.findIndex((r, n) => !usados.has(n) && r[2] === s[2]); if (j >= 0) { mapa[k] = j; usados.add(j); } });
      const inv = {}; Object.keys(mapa).forEach((k) => { inv[mapa[k]] = k; });
      const aMap = (arr) => { const m = {}; arr.forEach((p, n) => { if (p && inv[n] !== undefined) m["a" + inv[n]] = p.slice(); }); return m; };
      // un puesto sin equivalente (p. ej. el tercer central) se queda en su sitio del sistema
      let pos = Object.assign(arr2map("a", aBase), aMap(d.a), arr2map("r", d.r));
      let b = d.pasos[0].b;
      d.pasos.forEach((p) => {
        pos = clon(pos);
        if (p.a) Object.keys(p.a).forEach((k) => { if (inv[k] !== undefined) pos["a" + inv[k]] = p.a[k].slice(); });
        if (p.r) Object.keys(p.r).forEach((k) => { pos["r" + k] = p.r[k].slice(); });
        if (p.b) b = p.b.slice();
        jug.pasos.push({ t: p.t, pos: pos, b: b.slice(), tips: {}, dib: [] });
      });
      if (clave === "cornerF" || clave === "falta" || clave === "banda") jug.vista = "A";
      if (clave === "cornerC") jug.vista = "D";
      return jug;
    }
    if (clave === "rondo") {
      jug.vista = "D"; jug.rivales = true;
      ["e1", "e2", "e3", "e4"].forEach((id) => jug.fichas.push({ id: id, eq: "a" }));
      ["f1", "f2"].forEach((id) => jug.fichas.push({ id: id, eq: "r" }));
      [[24, 70], [44, 70], [44, 90], [24, 90]].forEach((p, i) => jug.fichas.push({ id: "c" + i, eq: "c", forma: "cono", col: "amarillo" }));
      const p0 = { e1: [34, 70], e2: [44, 80], e3: [34, 90], e4: [24, 80], f1: [32, 78], f2: [36, 82], c0: [24, 70], c1: [44, 70], c2: [44, 90], c3: [24, 90] };
      const p1 = Object.assign(clon(p0), { e1: [38, 70], f1: [39, 78], f2: [37, 82] });
      const p2 = Object.assign(clon(p1), { e3: [30, 90], e4: [24, 84], f1: [33, 85], f2: [30, 81] });
      jug.pasos.push({ t: "4 contra 2: los de fuera, perfil abierto", pos: p0, b: [34.5, 71], tips: {}, dib: [] });
      jug.pasos.push({ t: "Pase al compañero libre; dentro presionan juntos", pos: p1, b: [43.5, 80], tips: {}, dib: [] });
      jug.pasos.push({ t: "Pase lejos del lado de la presión", pos: p2, b: [30.5, 89.5], tips: {}, dib: [] });
      return jug;
    }
    if (clave === "transicion") {
      jug.vista = "A";
      for (let i = 1; i <= 6; i++) jug.fichas.push({ id: "e" + i, eq: "a" });
      for (let i = 1; i <= 6; i++) jug.fichas.push({ id: "f" + i, eq: "r" });
      jug.fichas.push({ id: "fp", eq: "r" });
      [[0, 30, "rojo"], [68, 30, "rojo"], [0, 52, "azul"], [68, 52, "azul"], [24, 40, "amarillo"], [44, 40, "amarillo"]].forEach((c, i) => jug.fichas.push({ id: "c" + i, eq: "c", forma: i > 3 ? "chino" : "cono", col: c[2] }));
      const pos = { e1: [14, 44], e2: [30, 46], e3: [50, 42], e4: [24, 30], e5: [44, 28], e6: [34, 20],
        f1: [16, 38], f2: [30, 36], f3: [50, 36], f4: [26, 24], f5: [42, 22], f6: [34, 14], fp: [34, 2],
        c0: [0, 30], c1: [68, 30], c2: [0, 52], c3: [68, 52], c4: [24, 40], c5: [44, 40] };
      const p1 = Object.assign(clon(pos), { e2: [30, 38], f2: [28, 42] });
      const p2 = Object.assign(clon(p1), { e4: [20, 22], e6: [38, 10], e5: [50, 18], f4: [24, 30], f6: [32, 22] });
      jug.pasos.push({ t: "Ataca el equipo azul: estamos juntos", pos: pos, b: [30.5, 36], tips: {}, dib: [] });
      jug.pasos.push({ t: "¡Robo! Primer pase hacia delante", pos: p1, b: [30.5, 38.5], tips: {}, dib: [] });
      jug.pasos.push({ t: "Ruptura a la espalda y finalizamos", pos: p2, b: [38, 10.5], tips: {}, dib: [] });
      return jug;
    }
    // vacía o libre
    if (clave === "vacia") {
      equipos();
      const pos = Object.assign(arr2map("a", aBase), arr2map("r", rBase));
      jug.pasos.push({ t: "Colocación inicial", pos: pos, b: [34, 52.5], tips: {}, dib: [] });
    } else {
      jug.pasos.push({ t: "Paso 1", pos: {}, b: [34, 52.5], tips: {}, dib: [] });
    }
    return jug;
  }

  // ---------------------------------------------------------------- jugadores y fichas
  // ctx de un plan: busca jugador por id (plantilla del coach o la incrustada en un enlace)
  function crearCtx(plan, jugadores, editable) {
    const porId = {};
    (jugadores || []).forEach((j) => { porId[j.id] = j; });
    const sl = slotsDe(plan);
    return {
      plan: plan, editable: editable,
      jugadores: jugadores || [],
      jugador: (pid) => porId[pid] || null,
      pidDe(f) {
        if (f.pj) return f.pj;
        if (f.eq === "a" && /^a\d+$/.test(f.id)) return (plan.once || {})[f.id.slice(1)] || null;
        return null;
      },
      info(f) {
        if (f.eq === "c") return { cono: true, nombre: "Cono", corto: "", dorsal: "" };
        const pid = this.pidDe(f);
        const j = pid ? porId[pid] : null;
        let rol = "", fam = "", cod = "";
        if (/^a\d+$/.test(f.id)) { const s = sl[+f.id.slice(1)]; if (s) { cod = s[0]; rol = s[1]; fam = s[2]; } }
        if (/^r\d+$/.test(f.id) && !j) {
          const n = +f.id.slice(1) + 1;
          return { rival: true, nombre: "Rival " + n, corto: "", dorsal: String(n), rol: "Rival", fam: n === 1 ? "por" : "", cod: "" };
        }
        if (!fam && j && j.p) fam = famDePuesto(j.p);
        return {
          pid: pid, nombre: j ? j.n : (rol || (f.eq === "a" ? "Jugador" : "Compañero (peto)")),
          corto: j ? (j.c || (/^Dorsal \d/.test(j.n) ? "" : j.n.split(" ")[0])) : cod, dorsal: j ? String(j.d) : "", rol: rol || (j && j.p) || "", fam: fam, cod: cod
        };
      }
    };
  }
  function famDePuesto(p) {
    p = (p || "").toLowerCase();
    if (/port/.test(p)) return "por";
    if (/lateral|carril/.test(p)) return "lat";
    if (/central|defens/.test(p)) return "cen";
    if (/pivot|medioc|mediocentro/.test(p)) return "piv";
    if (/interior|medio/.test(p)) return "med";
    if (/mediapunta|media punta/.test(p)) return "mp";
    if (/extrem|banda|mig/.test(p)) return "ext";
    if (/delant|punta|9/.test(p)) return "del";
    return "";
  }

  // ---------------------------------------------------------------- mensajes en vivo
  function rel(desde, hacia, eq) {
    const s = eq === "r" ? -1 : 1;
    const dx = (hacia[0] - desde[0]) * s, dy = (desde[1] - hacia[1]) * s;
    const lado = dx > 2.5 ? "a tu derecha" : dx < -2.5 ? "a tu izquierda" : "";
    const prof = dy > 2.5 ? "por delante" : dy < -2.5 ? "por detrás" : "a tu altura";
    return lado ? prof + " y " + lado : prof;
  }
  function dirTexto(v, eq) {
    const s = eq === "r" ? -1 : 1;
    const dx = v[0] * s, dy = -v[1] * s;
    const n = Math.hypot(dx, dy) || 1;
    const p = [];
    if (dy / n > 0.38) p.push("hacia delante"); else if (dy / n < -0.38) p.push("hacia atrás");
    if (dx / n > 0.38) p.push("hacia tu derecha"); else if (dx / n < -0.38) p.push("hacia tu izquierda");
    return p.join(" y ") || "hacia un lado";
  }
  function enLinea(a, b, p) { // ¿p tapa la línea a→b?
    const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy;
    if (l2 < 1) return false;
    const t = ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2;
    if (t < 0.08 || t > 0.94) return false;
    return Math.hypot(a[0] + t * vx - p[0], a[1] + t * vy - p[1]) < 2.3;
  }
  const lateralBalon = (b, eq) => { const izq = b[0] < 34; return (eq === "r" ? !izq : izq) ? "izquierda" : "derecha"; };

  function analizar(ctx, jug, paso, fid, cat) {
    const P = paso.pos, B = paso.b;
    const yo = jug.fichas.find((f) => f.id === fid);
    if (!yo || !P[fid]) return [];
    const yoInfo = ctx.info(yo);
    const me = P[fid];
    const vis = (f) => f.eq !== "c" && P[f.id];
    const todos = jug.fichas.filter(vis);
    const eq = yo.eq;
    const comp = todos.filter((f) => f.eq === eq && f.id !== fid);
    const riv = todos.filter((f) => f.eq !== eq);
    const quien = (f) => {
      const i = ctx.info(f);
      if (f.eq !== eq) return i.dorsal ? "el " + i.dorsal + " rival" : "un rival";
      return (i.dorsal ? "el " + i.dorsal : "") + (i.corto ? (i.dorsal ? " (" + i.corto + ")" : i.corto) : (i.dorsal ? "" : "tu compañero"));
    };
    const msgs = [];
    const add = (ic, tit, txt, clave) => msgs.push({ ic, tit, txt, clave: !!clave });

    // Ficha rival en partido: info breve
    if (yoInfo.rival) {
      let mejor = null, dm = 1e9;
      riv.forEach((f) => { const d = dist(P[f.id], me); if (d < dm) { dm = d; mejor = f; } });
      add("🔵", "Rival", yoInfo.nombre + ".");
      if (mejor) add("👀", "Quién le vigila", quien(mejor).replace(/^el/, "El") + ", a " + Math.round(dm) + " m.");
      return msgs;
    }

    // ¿Quién tiene el balón?
    let cerca = null, dc = 1e9;
    todos.forEach((f) => { const d = dist(P[f.id], B); if (d < dc) { dc = d; cerca = f; } });
    const pos = dc <= 3 ? cerca : null;
    const eqBalon = cerca && dc <= 10 ? cerca.eq : null;
    const dB = Math.round(dist(me, B));

    if (pos && pos.id === fid) add("⚽", "Balón", "Lo tienes tú.");
    else if (pos) add("⚽", "Balón", "Lo tiene " + quien(pos) + ", " + rel(me, B, eq) + ", a " + dB + " m.");
    else add("⚽", "Balón", "Está suelto o en el aire, " + rel(me, B, eq) + ", a " + dB + " m.");

    let rivCerca = null, dr = 1e9;
    riv.forEach((f) => { const d = dist(P[f.id], me); if (d < dr) { dr = d; rivCerca = f; } });

    if (pos && pos.id === fid) {
      // --- tengo el balón
      if (rivCerca && dr < 5) add("🛡️", "Presión", "Te presiona " + quien(rivCerca) + " " + rel(me, P[rivCerca.id], eq) + ". Protege el balón con el cuerpo y juega a uno o dos toques.");
      const ops = comp.map((c) => {
        const pc = P[c.id], d = dist(me, pc);
        if (d < 4 || d > 45) return null;
        if (riv.some((r) => enLinea(me, pc, P[r.id]))) return null;
        let libre = 99; riv.forEach((r) => { libre = Math.min(libre, dist(P[r.id], pc)); });
        const avance = (me[1] - pc[1]) * (eq === "r" ? -1 : 1);
        return { c, d, libre, s: avance + Math.min(libre, 10) * 1.5 - d * 0.15 };
      }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, 2);
      if (ops.length) add("🎯", "Qué haces ahora", "Opciones de pase: " + ops.map((o) => quien(o.c) + ", " + rel(me, P[o.c.id], eq) + (o.libre > 6 ? " (libre)" : " (con rival cerca)")).join("; ") + ".", true);
      else add("🎯", "Qué haces ahora", "No hay línea de pase clara: conduce hacia el espacio libre o asegura hacia atrás.", true);
      add("🧍", "Perfil", "Cabeza arriba antes de que llegue el rival. Conduce con el pie más alejado del rival.");
      add("👀", "Fíjate en", "Quién está libre por delante y hacia dónde se mueve. Si un compañero arranca a la espalda, ese es el pase.");
    } else if (eqBalon === eq) {
      // --- tenemos el balón
      const tapa = pos ? riv.find((r) => enLinea(B, me, P[r.id])) : null;
      const lejos = dB > 32;
      const defensivo = ["por", "cen", "lat"].includes(yoInfo.fam);
      if (tapa) {
        const v = [me[0] - B[0], me[1] - B[1]], n = Math.hypot(v[0], v[1]) || 1;
        const perp = [-v[1] / n, v[0] / n], pr = P[tapa.id];
        const lado = (pr[0] - me[0]) * perp[0] + (pr[1] - me[1]) * perp[1];
        const mov = lado > 0 ? [-perp[0], -perp[1]] : perp;
        add("🏃", "Qué haces ahora", "Desmárcate: " + quien(tapa) + " te tapa la línea de pase. Muévete 3 o 4 metros " + dirTexto(mov, eq) + " para que te vea.", true);
      } else if (rivCerca && dr < 3.5 && !lejos) {
        add("🏃", "Qué haces ahora", "Te marca de cerca " + quien(rivCerca) + " (" + rel(me, P[rivCerca.id], eq) + "). Amaga hacia un lado y sal hacia el otro con cambio de ritmo, o ataca su espalda si mira el balón.", true);
      } else if (!lejos) {
        add("🙋", "Qué haces ahora", "Estás libre y con línea de pase: pide el balón (voz y brazo) y prepárate para recibir orientado.", true);
      } else if (defensivo) {
        add("⚖️", "Qué haces ahora", "Estás lejos del balón: equilibrio. Colócate para cubrir si lo perdemos" + (rivCerca ? ", sin perder de vista a " + quien(rivCerca) : "") + ".", true);
      } else {
        add("⚡", "Qué haces ahora", "Lejos del balón: fija a tu defensor y prepara la ruptura para cuando el compañero levante la cabeza.", true);
      }
      add("⏱️", "Cuándo", "Desmárcate cuando el compañero controle y levante la cabeza, no antes: si llegas antes, te marcan.");
      const dy = (me[1] - B[1]) * (eq === "r" ? -1 : 1); // >0: el balón está por delante de mí
      const dx = (B[0] - me[0]) * (eq === "r" ? -1 : 1);
      const pie = dx > 0 ? "izquierdo" : "derecho";
      if (dy < -2.5) add("🧍", "Perfil", "El balón te llega desde atrás: ponte de lado, nunca de espaldas. Recibe con el pie " + pie + " (el más alejado del balón) para girarte de cara a la portería rival.");
      else if (dy > 2.5) add("🧍", "Perfil", "Perfil abierto: que veas el balón y el campo a la vez. Ofrece un apoyo por detrás si el compañero no tiene salida.");
      else add("🧍", "Perfil", "Perfil abierto: cadera hacia la portería rival y hombro hacia el balón. Recibe con el pie " + pie + ".");
      if (rivCerca) {
        const delante = riv.filter((r) => { const pr = P[r.id]; return dist(pr, me) < 10 && (me[1] - pr[1]) * (eq === "r" ? -1 : 1) > 0; }).length;
        add("👀", "Fíjate en", "Antes de recibir, gira la cabeza: " + quien(rivCerca) + " está " + rel(me, P[rivCerca.id], eq) + ", a " + Math.round(dr) + " m." + (delante === 0 ? " Tienes espacio delante: si te llega, gírate y avanza." : " Si no te deja girarte, juega de cara y vuelve a desmarcarte."));
      }
    } else if (eqBalon && eqBalon !== eq) {
      // --- defendemos
      const nuestros = comp.concat([yo]).filter((f) => ctx.info(f).fam !== "por").sort((a, b) => dist(P[a.id], B) - dist(P[b.id], B));
      const rank = nuestros.findIndex((f) => f.id === fid);
      const otros = riv.filter((f) => !pos || f.id !== pos.id);
      let pase = null;
      if (pos) {
        let dm = 1e9;
        otros.forEach((f) => { const d = dist(P[f.id], B) + Math.abs(P[f.id][0] - 34) * 0.3; if (d < dm) { dm = d; pase = f; } });
      }
      if (yoInfo.fam === "por") {
        add("🧤", "Qué haces ahora", "Adelanta tu posición según el balón y habla: ordena a la línea. El balón está " + rel(me, B, eq) + ".", true);
      } else if (rank === 0) {
        add("🔥", "Qué haces ahora", "Eres el más cercano: ¡presiona! Rápido al salir y frena a 1 o 2 metros. Llévalo hacia la banda " + lateralBalon(B, eq) + (pase ? ", tapando con tu cuerpo el pase a " + quien(pase) : "") + ".", true);
      } else if (rank === 1) {
        add("🧱", "Qué haces ahora", "Cobertura: colócate a 5–8 m por detrás de " + quien(nuestros[0]) + " (el que presiona), por el lado de dentro.", true);
      } else {
        let marca = null, dm = 1e9;
        otros.forEach((f) => { const d = dist(P[f.id], me); if (d < dm) { dm = d; marca = f; } });
        const mismoLado = (B[0] < 34) === (me[0] < 34) || Math.abs(me[0] - 34) < 8;
        add("🧲", "Qué haces ahora", (marca ? "Vigila a " + quien(marca) + " (" + rel(me, P[marca.id], eq) + ", a " + Math.round(dm) + " m): ponte entre él y el balón para cortar el pase. " : "") +
          (mismoLado ? "El balón está en tu lado: aprieta." : "El balón está en el lado contrario: cierra hacia dentro y vigila la espalda."), true);
      }
      add("🧍", "Perfil", yoInfo.fam === "por" ? "De cara al balón, peso en la punta de los pies, preparado para salir." : "Perfil defensivo: de lado, rodillas flexionadas, que veas balón y rival a la vez. Orienta el cuerpo para empujarlo hacia la banda.");
      add("👀", "Fíjate en", rank === 0 ? "Su primer toque: si se le va largo o baja la cabeza, ¡roba!" : "El balón y tu rival a la vez. Si el balón va por el aire, ajusta antes de que llegue.");
    } else {
      add("🏃", "Qué haces ahora", "Balón dividido: el más cercano va a por él; los demás, atentos a la segunda jugada.", true);
    }
    if (PARADO[cat]) add("🫁", "Juego parado", "Es normal que aparezcan nervios o pensamientos («¿y si fallo?»). No luches con ellos: respira, di tu palabra clave" + (ctx.plan.clave ? " («" + ctx.plan.clave + "»)" : "") + " y vuelve a " + PARADO[cat] + ".");
    const cl = CLAVES[cat];
    if (cl && (cl[yoInfo.fam] || cl._)) add("🔑", "Clave de esta jugada", cl[yoInfo.fam] || cl._);
    return msgs;
  }

  // ---------------------------------------------------------------- dibujo del campo
  const VISTAS = { C: [-7, -7, 82, 119], A: [-7, -8, 82, 68], D: [-7, 45, 82, 68] };
  function campoSVG() {
    let s = "";
    for (let i = 0; i < 14; i++) s += `<rect x="-7" y="${i * 7.5}" width="82" height="7.5" fill="${i % 2 ? "#2E8B3E" : "#34964A"}"/>`;
    s += `<rect x="-7" y="-14" width="82" height="14" fill="#2E8B3E"/><rect x="-7" y="105" width="82" height="14" fill="#34964A"/>`;
    const l = 'fill="none" stroke="#fff" stroke-width="0.35" stroke-opacity="0.9"';
    s += `<rect x="0" y="0" width="68" height="105" ${l}/><line x1="0" y1="52.5" x2="68" y2="52.5" ${l}/>`;
    s += `<circle cx="34" cy="52.5" r="9.15" ${l}/><circle cx="34" cy="52.5" r="0.45" fill="#fff"/>`;
    [[0, 1], [105, -1]].forEach(([y0, d]) => {
      s += `<rect x="13.84" y="${d > 0 ? 0 : 105 - 16.5}" width="40.32" height="16.5" ${l}/>`;
      s += `<rect x="24.84" y="${d > 0 ? 0 : 105 - 5.5}" width="18.32" height="5.5" ${l}/>`;
      s += `<circle cx="34" cy="${y0 + d * 11}" r="0.45" fill="#fff"/>`;
      const ya = y0 + d * 16.5;
      s += `<path d="M ${34 - 7.31} ${ya} A 9.15 9.15 0 0 ${d > 0 ? 0 : 1} ${34 + 7.31} ${ya}" ${l}/>`;
      s += `<rect x="30.34" y="${d > 0 ? -2 : 105}" width="7.32" height="2" fill="rgba(255,255,255,.25)" stroke="#fff" stroke-width="0.35"/>`;
    });
    return s;
  }
  function trianguloCono(x, y, c) {
    return `<path d="M ${x} ${y - 1.7} L ${x + 1.3} ${y + 1} L ${x - 1.3} ${y + 1} Z" fill="${c}" stroke="#111" stroke-width="0.2"/><ellipse cx="${x}" cy="${y + 1}" rx="1.5" ry="0.45" fill="${c}" stroke="#111" stroke-width="0.15"/>`;
  }

  // ---------------------------------------------------------------- componente pizarra
  function crearPizarra(host, o) {
    // o: {ctx, jug, cat, editable, yoPid, alCambiar}
    const ctx = o.ctx, jug = o.jug, ed = !!o.editable;
    let i = 0, sel = null, herr = "mover", color = "#FFD23F", bor = null, anim = null, selDib = -1;
    let hist = [], fut = [], mostrado = null, drag = null, reproduciendo = false;
    const colEq = { a: (db.equipo && db.equipo.color) || "#C8102E", r: "#2457C5" };
    if (o.equipoColor) colEq.a = o.equipoColor;

    function fichaYo() {
      if (!o.yoPid) return null;
      const f = jug.fichas.find((f) => f.eq !== "c" && ctx.pidDe(f) === o.yoPid);
      return f ? f.id : null;
    }
    sel = fichaYo();

    host.innerHTML = `
      <div class="pz">
        <div class="pz-paso">
          <span class="num" data-r="num"></span>
          ${ed ? `<label class="sr" style="position:absolute;left:-999px" for="pzTit${host.id || ""}">Título del paso</label><input type="text" id="pzTit${host.id || ""}" data-r="tit" maxlength="80" placeholder="¿Qué pasa en este paso?">` : `<span class="titulo" data-r="tit" aria-live="polite"></span>`}
        </div>
        <div class="pz-campo" data-r="campo">
          <svg data-r="svg" role="group" aria-label="Campo de fútbol con las fichas de los jugadores"></svg>
          <div class="burbuja" data-r="burb" hidden></div>
        </div>
        <div class="pz-ctrl">
          <button type="button" class="btn-peq" data-a="ant" aria-label="Paso anterior">◀</button>
          <button type="button" class="btn-peq" data-a="play">▶ Reproducir</button>
          <button type="button" class="btn-peq" data-a="sig" aria-label="Paso siguiente">▶▶</button>
          <span class="sp"></span>
          ${ed ? `<button type="button" class="btn-peq" data-a="deshacer" aria-label="Deshacer">↶</button><button type="button" class="btn-peq" data-a="rehacer" aria-label="Rehacer">↷</button>` : ""}
        </div>
        ${ed ? `<div class="pz-herr">
          <div class="grupo"><span class="lbl">Pasos</span>
            <button type="button" class="btn-peq" data-a="masPaso">＋ Añadir paso</button>
            <button type="button" class="btn-peq peligro" data-a="menosPaso">Borrar paso</button>
          </div>
          <div class="grupo" role="group" aria-label="Herramienta"><span class="lbl">Mano</span>
            <button type="button" class="btn-peq" data-h="mover">✋ Mover</button>
            <button type="button" class="btn-peq" data-h="linea">╌ Línea</button>
            <button type="button" class="btn-peq" data-h="flecha">➝ Flecha</button>
            <button type="button" class="btn-peq" data-h="zona">⬠ Zona</button>
            <button type="button" class="btn-peq" data-h="texto">T Texto</button>
          </div>
          <div class="grupo" data-r="zonaok" hidden><span class="lbl"></span>
            <button type="button" class="btn-peq" data-a="cerrarZona">✔ Cerrar zona</button>
            <button type="button" class="btn-peq" data-a="cancelarDib">Cancelar</button>
          </div>
          <div class="grupo" role="group" aria-label="Color del dibujo"><span class="lbl">Color</span>
            ${COLORES_DIB.map((c) => `<button type="button" class="color-btn" data-col="${c[0]}" style="background:${c[0]}" aria-label="Color ${c[1]}"></button>`).join("")}
          </div>
          <div class="grupo"><span class="lbl">Añadir</span>
            <button type="button" class="btn-peq" data-a="masA">＋ Nuestro</button>
            <button type="button" class="btn-peq" data-a="masR">＋ Rival / peto</button>
            <select data-r="conoCol" aria-label="Color del cono" style="width:auto;min-height:36px;padding:4px 8px">
              ${Object.keys(COLORES_CONO).map((k) => `<option value="${k}">${k}</option>`).join("")}
            </select>
            <button type="button" class="btn-peq" data-a="masCono">▲ Cono</button>
            <button type="button" class="btn-peq" data-a="masChino">◖ Chino</button>
          </div>
          <div class="grupo"><span class="lbl">Ver</span>
            <select data-r="vista" aria-label="Parte del campo" style="width:auto;min-height:36px;padding:4px 8px">
              <option value="C">Campo entero</option><option value="A">Medio campo (ataque)</option><option value="D">Medio campo (defensa)</option>
            </select>
            <button type="button" class="btn-peq" data-a="rivales" aria-pressed="true">Rivales visibles</button>
          </div>
        </div>` : ""}
        <div class="pz-info" data-r="info" aria-live="polite"></div>
      </div>`;

    const R = (k) => host.querySelector(`[data-r="${k}"]`);
    const svg = R("svg"), campo = R("campo"), burb = R("burb"), info = R("info");

    // ----- historia (deshacer)
    function snap() { hist.push(JSON.stringify(jug)); if (hist.length > 60) hist.shift(); fut = []; }
    function restaurar(txt) {
      const o2 = JSON.parse(txt);
      Object.keys(jug).forEach((k) => delete jug[k]);
      Object.assign(jug, o2);
      if (i >= jug.pasos.length) i = jug.pasos.length - 1;
      cambio(); pintarTodo();
    }
    function cambio() { if (o.alCambiar) o.alCambiar(); }

    const paso = () => jug.pasos[i];
    function posPaso(p) { const m = Object.assign({}, p.pos); m._b = p.b; return m; }
    const visible = (f) => f.eq !== "r" || jug.rivales !== false;

    function aSVG(e) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const m = svg.getScreenCTM(); if (!m) return [0, 0];
      const q = pt.matrixTransform(m.inverse()); return [q.x, q.y];
    }
    function resolver(pt, P) { return typeof pt === "string" ? (P[pt] || null) : pt; }

    // ----- pintar
    function pintarCampo() {
      const vb = VISTAS[jug.vista] || VISTAS.C;
      svg.setAttribute("viewBox", vb.join(" "));
      svg.innerHTML = `<defs>
          <marker id="fl-${uidM}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker>
          <marker id="flb-${uidM}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#FFD23F"/></marker>
        </defs><g>${campoSVG()}</g><g data-r="dib"></g><g data-r="dyn"></g>`;
    }
    const uidM = uid();

    function pintar(P) {
      mostrado = P;
      const g = svg.querySelector('[data-r="dyn"]'), gd = svg.querySelector('[data-r="dib"]');
      if (!g) return;
      const p = paso();
      let s = "";
      // rastros desde el paso anterior
      if (!anim && i > 0) {
        const prev = jug.pasos[i - 1];
        jug.fichas.forEach((f) => {
          if (!visible(f) || f.eq === "c") return;
          const a = prev.pos[f.id], b = p.pos[f.id];
          if (a && b && dist(a, b) > 1.5) s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${f.eq === "a" ? "#fff" : "#BFD4FF"}" stroke-width="0.35" stroke-dasharray="1 0.8" stroke-opacity="0.85" marker-end="url(#fl-${uidM})"/>`;
        });
        if (dist(prev.b, p.b) > 1.5) s += `<line x1="${prev.b[0]}" y1="${prev.b[1]}" x2="${p.b[0]}" y2="${p.b[1]}" stroke="#FFD23F" stroke-width="0.45" stroke-dasharray="1.4 0.9" marker-end="url(#flb-${uidM})"/>`;
      }
      // conos primero
      jug.fichas.forEach((f) => {
        if (f.eq !== "c" || !P[f.id]) return;
        const [x, y] = P[f.id], c = COLORES_CONO[f.col] || COLORES_CONO.amarillo;
        const sh = f.forma === "chino" ? `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="0.75" fill="${c}" stroke="#111" stroke-width="0.2"/>` : trianguloCono(x, y, c);
        s += `<g class="ficha" data-id="${f.id}" ${ed ? `tabindex="0" role="button" aria-label="${f.forma === "chino" ? "Chino" : "Cono"} ${esc(f.col)}"` : ""}>${sh}${sel === f.id ? `<circle cx="${x}" cy="${y}" r="2.4" fill="none" stroke="#FFD23F" stroke-width="0.4"/>` : ""}</g>`;
      });
      const yoId = fichaYo();
      jug.fichas.forEach((f) => {
        if (f.eq === "c" || !visible(f) || !P[f.id]) return;
        const [x, y] = P[f.id], inf = ctx.info(f);
        const col = colEq[f.eq];
        const num = inf.dorsal || inf.cod || "";
        const fs = num.length > 2 ? 1.5 : 2.1;
        const etiqueta = inf.corto && inf.corto !== num ? inf.corto : "";
        const label = (inf.dorsal ? inf.dorsal + " " : "") + (inf.nombre || "") + (inf.rol && !inf.rival ? ", " + inf.rol : "");
        s += `<g class="ficha" data-id="${f.id}" tabindex="0" role="button" aria-label="${esc(label)}" aria-pressed="${sel === f.id}">`;
        if (yoId === f.id) s += `<circle cx="${x}" cy="${y}" r="3.7" fill="rgba(255,210,63,.35)" stroke="#FFD23F" stroke-width="0.35"/>`;
        if (sel === f.id) s += `<circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="#FFD23F" stroke-width="0.55"/>`;
        s += `<circle cx="${x}" cy="${y}" r="2.35" fill="${col}" stroke="#fff" stroke-width="0.4"/>`;
        s += `<text x="${x}" y="${y + fs * 0.36}" font-size="${fs}" font-weight="800" fill="#fff" text-anchor="middle">${esc(num)}</text>`;
        if (etiqueta) s += `<text x="${x}" y="${y + 4.6}" font-size="1.9" font-weight="700" fill="#fff" text-anchor="middle" stroke="#0C2414" stroke-width="0.45" paint-order="stroke">${esc(etiqueta.slice(0, 14))}</text>`;
        s += `</g>`;
      });
      const b = P._b;
      s += `<g class="ficha" data-id="_b" ${ed ? `tabindex="0" role="button" aria-label="Balón"` : ""}><circle cx="${b[0]}" cy="${b[1]}" r="1.15" fill="#fff" stroke="#111" stroke-width="0.25"/><circle cx="${b[0]}" cy="${b[1]}" r="0.42" fill="#111"/></g>`;
      g.innerHTML = s;

      // dibujos del paso (pueden ir pegados a fichas)
      let d = "";
      (p.dib || []).forEach((k, idx) => {
        const pts = k.pts.map((q) => resolver(q, P)).filter(Boolean);
        const c = k.c || "#FFD23F", sel2 = selDib === idx ? ' stroke-opacity="1" filter="none"' : "";
        if ((k.k === "linea" || k.k === "flecha") && pts.length >= 2) {
          const pp = pts.map((q) => q.join(",")).join(" ");
          d += `<g data-dib="${idx}"><polyline points="${pp}" fill="none" stroke="transparent" stroke-width="3"/><polyline points="${pp}" fill="none" stroke="${c}" stroke-width="${selDib === idx ? 0.8 : 0.55}" stroke-dasharray="1.6 1" stroke-linecap="round" ${k.k === "flecha" ? `marker-end="url(#fl-${uidM})"` : ""}${sel2}/></g>`;
        } else if (k.k === "zona" && pts.length >= 3) {
          d += `<g data-dib="${idx}"><polygon points="${pts.map((q) => q.join(",")).join(" ")}" fill="${c}" fill-opacity="0.28" stroke="${c}" stroke-width="${selDib === idx ? 0.7 : 0.45}" stroke-dasharray="1.2 0.8"/></g>`;
        } else if (k.k === "texto" && pts.length) {
          const [x, y] = pts[0];
          d += `<g data-dib="${idx}"><text x="${x}" y="${y}" font-size="2.5" font-weight="800" font-style="italic" fill="${c}" stroke="#0B1F12" stroke-width="0.55" paint-order="stroke" text-anchor="middle">${esc(k.t)}</text>${selDib === idx ? `<rect x="${x - k.t.length * 0.85}" y="${y - 2.6}" width="${k.t.length * 1.7}" height="3.4" fill="none" stroke="#fff" stroke-dasharray="0.6 0.4" stroke-width="0.25"/>` : ""}</g>`;
        }
      });
      if (bor) {
        const pts = bor.pts.map((q) => resolver(q, P)).filter(Boolean);
        if (bor.cursor) pts.push(bor.cursor);
        if (pts.length) {
          d += `<polyline points="${pts.map((q) => q.join(",")).join(" ")}" fill="${bor.k === "zona" ? bor.c : "none"}" fill-opacity="0.2" stroke="${bor.c}" stroke-width="0.5" stroke-dasharray="0.8 0.6"/>`;
          pts.forEach((q) => { d += `<circle cx="${q[0]}" cy="${q[1]}" r="0.7" fill="${bor.c}"/>`; });
        }
      }
      gd.innerHTML = d;
      ponerBurbuja(P);
    }

    function ponerBurbuja(P) {
      const f = sel && jug.fichas.find((x) => x.id === sel);
      if (!f || f.eq === "c" || !P[sel] || !visible(f)) { burb.hidden = true; return; }
      const tips = (paso().tips || {})[sel] || {};
      let txt = tips.m;
      if (!txt) {
        const ms = analizar(ctx, jug, paso(), sel, o.cat);
        const k = ms.find((m) => m.clave) || ms[0];
        txt = k ? k.txt : "";
      }
      if (!txt) { burb.hidden = true; return; }
      const vb = VISTAS[jug.vista] || VISTAS.C;
      const [x, y] = P[sel];
      const left = ((x - vb[0]) / vb[2]) * 100, top = ((y - vb[1]) / vb[3]) * 100;
      burb.textContent = txt.length > 140 ? txt.slice(0, 137) + "…" : txt;
      burb.style.left = lim(left, 22, 78) + "%";
      burb.style.top = top + "%";
      burb.classList.toggle("abajo", top < 30);
      burb.hidden = false;
    }

    function pintarInfo() {
      const p = paso();
      const tot = jug.pasos.length;
      R("num").textContent = "Paso " + (i + 1) + "/" + tot;
      const t = R("tit");
      if (ed) { if (document.activeElement !== t) t.value = p.t || ""; } else t.textContent = p.t || "";
      host.querySelector('[data-a="ant"]').disabled = i === 0 || reproduciendo;
      host.querySelector('[data-a="sig"]').disabled = i >= tot - 1 || reproduciendo;
      host.querySelector('[data-a="play"]').textContent = reproduciendo ? "■ Parar" : "▶ Reproducir";
      if (ed) {
        host.querySelector('[data-a="menosPaso"]').disabled = tot < 2;
        host.querySelector('[data-a="deshacer"]').disabled = !hist.length;
        host.querySelector('[data-a="rehacer"]').disabled = !fut.length;
        $$("[data-h]", host).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.h === herr)));
        $$("[data-col]", host).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.col === color)));
        R("vista").value = jug.vista || "C";
        const rb = host.querySelector('[data-a="rivales"]');
        rb.setAttribute("aria-pressed", String(jug.rivales !== false));
        rb.textContent = jug.rivales !== false ? "Rivales visibles" : "Rivales ocultos";
        R("zonaok").hidden = !(bor && bor.k === "zona");
        campo.classList.toggle("dibujando", herr !== "mover");
      }
      pintarPanel();
    }

    function pintarPanel() {
      const p = paso();
      if (selDib >= 0 && ed && p.dib && p.dib[selDib]) {
        const k = p.dib[selDib];
        info.innerHTML = `<h3>Dibujo: ${k.k === "texto" ? "texto «" + esc(k.t) + "»" : esc(k.k)}</h3>
          ${k.k === "texto" ? `<div class="campo-f"><label for="txDib">Texto</label><input type="text" id="txDib" data-dibtx value="${esc(k.t)}" maxlength="40"></div>` : ""}
          <button type="button" class="btn-peq peligro" data-a="borrarDib">Borrar dibujo</button>
          <p class="peq">Las líneas y zonas que empiezan o terminan sobre una ficha la siguen cuando se mueve.</p>`;
        return;
      }
      const f = sel && jug.fichas.find((x) => x.id === sel);
      if (!f) {
        info.innerHTML = ed
          ? `<p class="peq"><b>Cómo se usa:</b> arrastra las fichas y el balón. Toca una ficha para escribir qué tiene que hacer en este paso (y ver los mensajes automáticos). «Añadir paso» copia la posición actual: mueve las fichas y tendrás la animación.</p>`
          : `<p class="peq"><b>Toca una ficha</b> para ver qué tiene que hacer ese jugador en cada paso: dónde está el balón, cómo perfilarse, en qué fijarse y cuándo moverse. Pulsa «Reproducir» para ver la jugada.</p>`;
        return;
      }
      if (f.eq === "c") {
        info.innerHTML = `<h3>${f.forma === "chino" ? "Chino" : "Cono"} ${esc(f.col)}</h3>${ed ? `<button type="button" class="btn-peq peligro" data-a="quitar">Quitar de la pizarra</button>` : ""}`;
        return;
      }
      const inf = ctx.info(f);
      const tips = (p.tips || {})[f.id] || {};
      const col = colEq[f.eq];
      let h = `<h3><span class="dorsal" style="background:${col}">${esc(inf.dorsal || inf.cod || "·")}</span>${esc(inf.nombre)}${inf.rol && !inf.rival ? ` <span class="peq">· ${esc(inf.rol)}</span>` : ""}</h3>`;
      if (ed) {
        if (!inf.rival || f.pj || f.eq === "r") {
          const opts = ctx.jugadores.slice().sort((a, b) => a.d - b.d).map((j) => `<option value="${esc(j.id)}" ${ctx.pidDe(f) === j.id ? "selected" : ""}>${esc(j.d)} · ${esc(j.c || j.n)}</option>`).join("");
          h += `<div class="campo-f"><label for="selPj">Jugador en esta ficha${/^a\d+$/.test(f.id) ? " (cambia también la alineación)" : ""}</label><select id="selPj" data-pj><option value="">${f.eq === "r" ? "Rival sin nombre" : "Sin asignar"}</option>${opts}</select></div>`;
        }
        h += `<div class="tips-edit"><p class="subtit">Lo que le dices en este paso</p>
          <div class="campo-f"><label for="tpM">Qué hace / cómo se mueve</label><textarea id="tpM" data-tip="m" maxlength="300" placeholder="Ej.: Cuando el central controle, arranca a la espalda del lateral.">${esc(tips.m || "")}</textarea></div>
          <div class="campo-f"><label for="tpP">Perfil</label><textarea id="tpP" data-tip="p" maxlength="200" placeholder="Ej.: De lado, mirando al balón y a la portería rival.">${esc(tips.p || "")}</textarea></div>
          <div class="campo-f"><label for="tpF">En qué fijarse</label><textarea id="tpF" data-tip="f" maxlength="200" placeholder="Ej.: En la cadera del lateral rival y en el pie del compañero.">${esc(tips.f || "")}</textarea></div>
          <div class="campo-f"><label for="tpQ">Cuándo fijarse / cuándo actuar</label><textarea id="tpQ" data-tip="q" maxlength="200" placeholder="Ej.: Cuando el central controle y levante la cabeza, arranca.">${esc(tips.q || "")}</textarea></div>
          </div>`;
        if (!/^a\d+$/.test(f.id) && !/^r\d+$/.test(f.id)) h += `<button type="button" class="btn-peq peligro" data-a="quitar">Quitar de la pizarra</button>`;
        h += `<p class="subtit">Mensajes automáticos (los verá el jugador)</p>`;
      } else {
        const ent = [["🗣️", "Qué haces", tips.m], ["🧍", "Perfil", tips.p], ["👀", "Fíjate en", tips.f], ["⏱️", "Cuándo", tips.q]].filter((x) => x[2]);
        ent.forEach((x) => { h += `<div class="msg entrenador"><span class="ic" aria-hidden="true">${x[0]}</span><div><b>${x[1]} · entrenador</b>${esc(x[2])}</div></div>`; });
      }
      analizar(ctx, jug, p, f.id, o.cat).forEach((m) => {
        h += `<div class="msg"><span class="ic" aria-hidden="true">${m.ic}</span><div><b>${esc(m.tit)}</b>${esc(m.txt)}</div></div>`;
      });
      info.innerHTML = h;
    }

    function pintarTodo() { pintarCampo(); pintar(posPaso(paso())); pintarInfo(); }

    // ----- animación
    function animarA(nuevo, ms, fin) {
      const desde = mostrado || posPaso(paso());
      i = nuevo; const hasta = posPaso(paso());
      const t0 = performance.now();
      const red = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (anim) cancelAnimationFrame(anim);
      selDib = -1;
      pintarInfo();
      const paso1 = (t) => {
        let k = red ? 1 : Math.min(1, (t - t0) / ms);
        k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const P = {};
        Object.keys(hasta).forEach((id) => {
          const a = desde[id] || hasta[id], b = hasta[id];
          P[id] = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
        });
        if (k < 1) { anim = requestAnimationFrame(paso1); pintar(P); }
        else { anim = null; pintar(hasta); if (fin) fin(); }
      };
      anim = requestAnimationFrame(paso1);
    }
    let sesion = 0, timers = [];
    function pararTodo() {
      sesion++; reproduciendo = false;
      timers.forEach(clearTimeout); timers = [];
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      mostrado = posPaso(paso());
    }
    function reproducir() {
      if (reproduciendo) { pararTodo(); pintar(mostrado); pintarInfo(); return; }
      pararTodo();
      const s0 = sesion;
      const luego = (fn, ms) => timers.push(setTimeout(() => { if (s0 === sesion) fn(); }, ms));
      reproduciendo = true;
      i = 0; mostrado = posPaso(jug.pasos[0]); pintar(mostrado); pintarInfo();
      const siguiente = () => {
        if (i >= jug.pasos.length - 1) { reproduciendo = false; pintar(mostrado); pintarInfo(); return; }
        luego(() => animarA(i + 1, 1200, () => { if (s0 === sesion) luego(siguiente, 900); }), 300);
      };
      luego(siguiente, 700);
    }

    // ----- acciones de edición
    function anadirFicha(eq, extra) {
      snap();
      const pref = eq === "c" ? "c" : eq === "a" ? "e" : "f";
      let n = 1; while (jug.fichas.some((f) => f.id === pref + n)) n++;
      const f = Object.assign({ id: pref + n, eq: eq }, extra || {});
      jug.fichas.push(f);
      const vb = VISTAS[jug.vista] || VISTAS.C;
      const p0 = [eq === "c" ? 34 : eq === "a" ? 30 : 38, vb[1] + vb[3] / 2];
      jug.pasos.forEach((p) => { p.pos[f.id] = p0.slice(); });
      if (eq === "r") jug.rivales = true;
      sel = f.id; selDib = -1; cambio(); pintarTodo();
    }

    function terminarDibujo() {
      if (!bor) return;
      const min = bor.k === "zona" ? 3 : bor.k === "texto" ? 1 : 2;
      if (bor.pts.length >= min) {
        snap();
        const p = paso(); p.dib = p.dib || [];
        p.dib.push({ k: bor.k, c: bor.c, pts: bor.pts, t: bor.t });
        selDib = p.dib.length - 1; cambio();
      }
      bor = null; pintarTodo();
    }
    function puntoConImán(q, P) { // si toca una ficha, se pega a ella
      let mejor = null, dm = 3;
      jug.fichas.forEach((f) => { if (visible(f) && P[f.id]) { const d = dist(P[f.id], q); if (d < dm) { dm = d; mejor = f.id; } } });
      return mejor || [r05(q[0]), r05(q[1])];
    }

    // ----- eventos del campo
    svg.addEventListener("pointerdown", (e) => {
      if (reproduciendo) return;
      const q = aSVG(e);
      const P = mostrado || posPaso(paso());
      const gF = e.target.closest && e.target.closest("[data-id]");
      const gD = e.target.closest && e.target.closest("[data-dib]");
      if (!ed) {
        if (gF && gF.dataset.id !== "_b") { sel = sel === gF.dataset.id ? null : gF.dataset.id; pintar(P); pintarInfo(); }
        return;
      }
      if (herr !== "mover") {
        e.preventDefault();
        if (herr === "texto") {
          const t = window.prompt("Texto para el campo (p. ej. «AMPLITUD»):", "");
          if (t && t.trim()) { bor = { k: "texto", c: color, pts: [[r05(q[0]), r05(q[1])]], t: t.trim().slice(0, 40) }; terminarDibujo(); }
          return;
        }
        const pt = puntoConImán(q, P);
        if (herr === "zona") {
          if (!bor) bor = { k: "zona", c: color, pts: [] };
          const r0 = bor.pts.length >= 3 ? resolver(bor.pts[0], P) : null;
          if (r0 && dist(r0, q) < 2.5) { terminarDibujo(); return; }
          bor.pts.push(pt); pintar(P); pintarInfo(); return;
        }
        // línea / flecha
        if (bor && (bor.k === "linea" || bor.k === "flecha")) { bor.pts.push(pt); bor.cursor = null; terminarDibujo(); return; }
        bor = { k: herr, c: color, pts: [pt], arrastre: true, x0: q };
        svg.setPointerCapture(e.pointerId);
        pintar(P);
        return;
      }
      if (gD && !gF) {
        selDib = +gD.dataset.dib; sel = null;
        const k = paso().dib[selDib];
        if (k && k.k === "texto") { drag = { tipo: "dib", idx: selDib, x0: q, mov: false }; svg.setPointerCapture(e.pointerId); }
        pintar(P); pintarInfo(); return;
      }
      if (gF) {
        drag = { tipo: "ficha", id: gF.dataset.id, x0: q, mov: false };
        svg.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
      if (sel || selDib >= 0) { sel = null; selDib = -1; pintar(P); pintarInfo(); }
    });
    svg.addEventListener("pointermove", (e) => {
      const q = aSVG(e);
      if (bor && bor.arrastre) { bor.cursor = q; pintar(mostrado || posPaso(paso())); return; }
      if (!drag) return;
      if (!drag.mov && dist(q, drag.x0) < 0.9) return;
      if (!drag.mov) { snap(); drag.mov = true; }
      const x = r05(lim(q[0], -6, 74)), y = r05(lim(q[1], -6, 111));
      const p = paso();
      if (drag.tipo === "dib") { p.dib[drag.idx].pts[0] = [x, y]; }
      else if (drag.id === "_b") p.b = [x, y];
      else p.pos[drag.id] = [x, y];
      pintar(posPaso(p));
    });
    const soltar = (e) => {
      if (bor && bor.arrastre) {
        const q = aSVG(e);
        bor.arrastre = false; bor.cursor = null;
        if (dist(q, bor.x0) > 2) { bor.pts.push(puntoConImán(q, mostrado || posPaso(paso()))); terminarDibujo(); }
        else { pintar(mostrado || posPaso(paso())); toast("Ahora toca dónde acaba la línea"); }
        return;
      }
      if (!drag) return;
      const d = drag; drag = null;
      if (d.mov) { cambio(); pintar(posPaso(paso())); pintarPanel(); return; }
      if (d.tipo === "ficha" && d.id !== "_b") { sel = sel === d.id ? null : d.id; selDib = -1; pintar(posPaso(paso())); pintarInfo(); }
    };
    svg.addEventListener("pointerup", soltar);
    svg.addEventListener("pointercancel", () => { drag = null; if (bor) bor.arrastre = false; });

    // teclado: Enter selecciona; flechas mueven (modo edición)
    svg.addEventListener("keydown", (e) => {
      const g = e.target.closest && e.target.closest("[data-id]");
      if (!g) return;
      const id = g.dataset.id;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (id !== "_b") { sel = sel === id ? null : id; selDib = -1; pintar(mostrado || posPaso(paso())); pintarInfo(); }
        const n = svg.querySelector(`[data-id="${id}"]`); if (n) n.focus();
        return;
      }
      const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (mv && ed) {
        e.preventDefault(); snap();
        const p = paso();
        if (id === "_b") p.b = [p.b[0] + mv[0], p.b[1] + mv[1]];
        else p.pos[id] = [p.pos[id][0] + mv[0], p.pos[id][1] + mv[1]];
        cambio(); pintar(posPaso(p));
        const n = svg.querySelector(`[data-id="${id}"]`); if (n) n.focus();
      }
    });

    // botones
    host.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b || !host.contains(b)) return;
      const a = b.dataset.a;
      if (b.dataset.h) { herr = b.dataset.h; bor = null; selDib = -1; pintar(mostrado || posPaso(paso())); pintarInfo(); if (herr !== "mover") toast(herr === "zona" ? "Toca los vértices de la zona y pulsa «Cerrar zona»" : herr === "texto" ? "Toca donde quieras poner el texto" : "Arrastra, o toca el inicio y luego el final. Si empiezas en una ficha, la línea la sigue."); return; }
      if (b.dataset.col) { color = b.dataset.col; if (selDib >= 0) { snap(); paso().dib[selDib].c = color; cambio(); pintar(posPaso(paso())); } pintarInfo(); return; }
      if (a === "ant" && i > 0) animarA(i - 1, 700);
      else if (a === "sig" && i < jug.pasos.length - 1) animarA(i + 1, 1100);
      else if (a === "play") reproducir();
      else if (a === "deshacer" && hist.length) { fut.push(JSON.stringify(jug)); restaurar(hist.pop()); }
      else if (a === "rehacer" && fut.length) { hist.push(JSON.stringify(jug)); restaurar(fut.pop()); }
      else if (a === "masPaso") {
        snap();
        const p = paso();
        const nuevo = { t: "", pos: clon(p.pos), b: p.b.slice(), tips: {}, dib: clon(p.dib || []) };
        jug.pasos.splice(i + 1, 0, nuevo); i++; cambio(); pintarTodo();
        toast("Paso " + (i + 1) + " creado: mueve las fichas a su nueva posición");
        const t = R("tit"); if (t) t.focus();
      } else if (a === "menosPaso" && jug.pasos.length > 1) {
        if (!window.confirm("¿Borrar el paso " + (i + 1) + "?")) return;
        snap(); jug.pasos.splice(i, 1); if (i >= jug.pasos.length) i = jug.pasos.length - 1; cambio(); pintarTodo();
      } else if (a === "cerrarZona") terminarDibujo();
      else if (a === "cancelarDib") { bor = null; pintarTodo(); }
      else if (a === "masA") anadirFicha("a");
      else if (a === "masR") anadirFicha("r");
      else if (a === "masCono") anadirFicha("c", { forma: "cono", col: R("conoCol").value });
      else if (a === "masChino") anadirFicha("c", { forma: "chino", col: R("conoCol").value });
      else if (a === "rivales") { snap(); jug.rivales = jug.rivales === false; cambio(); pintarTodo(); }
      else if (a === "borrarDib" && selDib >= 0) { snap(); paso().dib.splice(selDib, 1); selDib = -1; cambio(); pintarTodo(); }
      else if (a === "quitar" && sel) {
        snap();
        const id = sel;
        jug.fichas = jug.fichas.filter((f) => f.id !== id);
        jug.pasos.forEach((p) => { delete p.pos[id]; if (p.tips) delete p.tips[id]; (p.dib || []).forEach((k) => { k.pts = k.pts.map((q) => (q === id ? (p.pos[id] || [34, 52]) : q)); }); });
        sel = null; cambio(); pintarTodo();
      }
    });
    host.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.r === "tit") { paso().t = t.value; cambio(); return; }
      if (t.dataset.tip) {
        const p = paso(); p.tips = p.tips || {};
        const tp = p.tips[sel] = p.tips[sel] || {};
        tp[t.dataset.tip] = t.value;
        if (!tp.m && !tp.p && !tp.f && !tp.q) delete p.tips[sel];
        cambio(); ponerBurbuja(mostrado || posPaso(p)); return;
      }
      if (t.hasAttribute("data-dibtx") && selDib >= 0) { paso().dib[selDib].t = t.value.slice(0, 40); cambio(); pintar(posPaso(paso())); }
    });
    host.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.r === "vista") { snap(); jug.vista = t.value; cambio(); pintarTodo(); return; }
      if (t.hasAttribute("data-pj")) {
        const f = jug.fichas.find((x) => x.id === sel); if (!f) return;
        snap();
        if (/^a\d+$/.test(f.id)) { ctx.plan.once = ctx.plan.once || {}; if (t.value) ctx.plan.once[f.id.slice(1)] = t.value; else delete ctx.plan.once[f.id.slice(1)]; delete f.pj; }
        else if (t.value) f.pj = t.value; else delete f.pj;
        cambio(); pintar(posPaso(paso())); pintarInfo();
      }
    });

    pintarTodo();
    return {
      seleccionarJugador(pid) { o.yoPid = pid; sel = fichaYo(); selDib = -1; pintar(mostrado || posPaso(paso())); pintarInfo(); },
      parar() { pararTodo(); }
    };
  }

  // ---------------------------------------------------------------- pantallas del entrenador
  const app = $("#app");
  let estado = { pant: "cuaderno", planId: null };

  function ir(pant, extra) {
    estado = Object.assign({ pant: pant }, extra || {});
    pintarPantalla();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  function navActual() {
    $$("#nav button").forEach((b) => {
      const act = b.dataset.ir === estado.pant || (estado.pant === "plan" && b.dataset.ir === "cuaderno");
      if (act) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
  }
  function fechaBonita(f) {
    if (!f) return "";
    const d = new Date(f + "T12:00:00");
    if (isNaN(d)) return f;
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  }
  const hoyISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

  function pintarPantalla() {
    $("#nav").hidden = false;
    $("#ttApp").textContent = (db.equipo && db.equipo.nombre) || "Pizarra del entrenador";
    $("#ttSub").textContent = "Pizarra y cuaderno del entrenador";
    navActual();
    if (estado.pant === "plantilla") return pantPlantilla();
    if (estado.pant === "ajustes") return pantAjustes();
    if (estado.pant === "plan") return pantPlan();
    if (estado.pant === "preview") return pantPreview();
    return pantCuaderno();
  }

  function pantCuaderno() {
    const planes = db.planes.slice().sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
    app.innerHTML = `
      <h1>Cuaderno</h1>
      <div class="fila" style="margin-bottom:14px">
        <button type="button" class="btn" data-nuevo="entreno">＋ Nuevo entreno</button>
        <button type="button" class="btn rojo" data-nuevo="partido">＋ Nuevo partido</button>
      </div>
      ${db.plantilla.length ? "" : `<div class="tarjeta"><p><b>Primero, tu plantilla.</b> Añade el dorsal y el nombre de cada jugador para que aparezcan en las fichas del campo.</p><button type="button" class="btn-sec" data-ir2="plantilla">Ir a la plantilla</button></div>`}
      <div class="lista-planes">
        ${planes.length ? planes.map((p) => `
          <div class="tarjeta">
            <div class="plan-cab">
              <div>
                <span class="chip ${p.tipo === "partido" ? "partido" : ""}">${p.tipo === "partido" ? "Partido" : "Entreno"}</span>
                <h3 style="margin-top:6px">${esc(p.titulo || "(sin título)")}</h3>
                <p class="peq">${esc(fechaBonita(p.fecha))}${p.rival ? " · contra " + esc(p.rival) : ""} · ${p.bloques.length} apartado${p.bloques.length === 1 ? "" : "s"}</p>
              </div>
            </div>
            <div class="fila">
              <button type="button" class="btn-peq" data-abrir="${p.id}">Abrir</button>
              <button type="button" class="btn-peq" data-dup="${p.id}">Duplicar</button>
              <button type="button" class="btn-peq peligro" data-borrar="${p.id}">Borrar</button>
            </div>
          </div>`).join("") : `<p class="vacio">Aún no hay nada en el cuaderno.<br>Empieza con un entreno o un partido.</p>`}
      </div>`;
  }

  function nuevoPlan(tipo) {
    const p = {
      id: uid(), tipo: tipo, fecha: hoyISO(), titulo: tipo === "partido" ? "Partido" : "Entreno", rival: "", objetivo: "", notas: "",
      sistema: "4231", once: {}, bloques: []
    };
    // alineación por defecto: dorsales de la plantilla según el puesto preferido
    autoOnce(p);
    const cats = tipo === "partido" ? ["salida", "presion", "banda", "cornerF", "cornerC", "falta"] : ["calentamiento", "ejercicio", "juego"];
    cats.forEach((c) => p.bloques.push({ id: uid(), cat: c, titulo: CATS[c], min: tipo === "partido" ? "" : 15, texto: "", consignas: "", jug: null }));
    db.planes.push(p); guardar();
    ir("plan", { planId: p.id });
  }
  function autoOnce(p) {
    const usados = new Set();
    slotsDe(p).forEach((s, idx) => {
      const j = db.plantilla.find((x) => !usados.has(x.id) && x.p && famDePuesto(x.p) === s[2]);
      if (j) { p.once[idx] = j.id; usados.add(j.id); }
    });
  }

  function pantPlan() {
    const p = db.planes.find((x) => x.id === estado.planId);
    if (!p) return ir("cuaderno");
    const sl = slotsDe(p);
    const optsJug = (sel) => `<option value="">—</option>` + db.plantilla.slice().sort((a, b) => a.d - b.d).map((j) => `<option value="${esc(j.id)}" ${sel === j.id ? "selected" : ""}>${esc(j.d)} · ${esc(j.c || j.n)}</option>`).join("");
    app.innerHTML = `
      <button type="button" class="btn-sec" data-ir2="cuaderno">← Cuaderno</button>
      <h1 style="margin-top:12px">${p.tipo === "partido" ? "Partido" : "Entreno"}</h1>
      <div class="tarjeta">
        <div class="campo-f"><label for="pTit">Título</label><input type="text" id="pTit" data-p="titulo" value="${esc(p.titulo)}" maxlength="80"></div>
        <div class="fila">
          <div class="campo-f crece"><label for="pFecha">Fecha</label><input type="date" id="pFecha" data-p="fecha" value="${esc(p.fecha)}"></div>
          ${p.tipo === "partido" ? `<div class="campo-f crece"><label for="pRival">Rival</label><input type="text" id="pRival" data-p="rival" value="${esc(p.rival)}" maxlength="60"></div>` : ""}
        </div>
        <div class="campo-f"><label for="pObj">${p.tipo === "partido" ? "Idea del partido" : "Objetivo del entreno"}</label><textarea id="pObj" data-p="objetivo" maxlength="600">${esc(p.objetivo)}</textarea></div>
        <div class="campo-f"><label for="pClave">Palabra clave del equipo para volver al juego (opcional)</label><input type="text" id="pClave" data-p="clave" value="${esc(p.clave || "")}" maxlength="30" placeholder="¡Reset!, ¡A la próxima!, ¡Balón!, ¡Ahora!"></div>
        <div class="campo-f"><label for="pNotas">Notas para el grupo (hora, material, convocatoria…)</label><textarea id="pNotas" data-p="notas" maxlength="800">${esc(p.notas)}</textarea></div>
      </div>

      <h2>Alineación</h2>
      <div class="tarjeta">
        <div class="campo-f"><label for="pSis">Sistema</label>
          <select id="pSis" data-p="sistema">${Object.keys(SISTEMAS).map((k) => `<option value="${k}" ${p.sistema === k ? "selected" : ""}>${SISTEMAS[k].n}</option>`).join("")}</select>
        </div>
        ${db.plantilla.length ? `<div class="alin">${sl.map((s, idx) => `<label>${esc(s[1])}<select data-once="${idx}">${optsJug((p.once || {})[idx])}</select></label>`).join("")}</div>`
          : `<p class="peq">Añade jugadores en la plantilla para ponerles nombre en las fichas.</p>`}
        <p class="peq">La alineación se usa en todas las pizarras de este ${p.tipo}. En cada pizarra puedes cambiar a un jugador concreto tocando su ficha.</p>
      </div>

      <h2>${p.tipo === "partido" ? "Plan de partido" : "Ejercicios"}</h2>
      ${p.bloques.map((b, bi) => `
        <div class="tarjeta bloque" style="border-left-color:${p.tipo === "partido" ? "var(--acento)" : "var(--verde)"}">
          <div class="fila">
            <div class="campo-f crece"><label for="bc${b.id}">Tipo</label><select id="bc${b.id}" data-b="cat" data-bid="${b.id}">${Object.keys(CATS).map((k) => `<option value="${k}" ${b.cat === k ? "selected" : ""}>${CATS[k]}</option>`).join("")}</select></div>
            ${p.tipo === "entreno" ? `<div class="campo-f" style="width:100px"><label for="bm${b.id}">Minutos</label><input type="number" min="0" max="120" id="bm${b.id}" data-b="min" data-bid="${b.id}" value="${esc(b.min)}"></div>` : ""}
          </div>
          <div class="campo-f"><label for="bt${b.id}">Título</label><input type="text" id="bt${b.id}" data-b="titulo" data-bid="${b.id}" value="${esc(b.titulo)}" maxlength="80"></div>
          <div class="campo-f"><label for="bx${b.id}">Explicación</label><textarea id="bx${b.id}" data-b="texto" data-bid="${b.id}" maxlength="1200" placeholder="${p.tipo === "partido" ? "Cómo lo haremos y por qué." : "Organización, espacio, reglas, series…"}">${esc(b.texto)}</textarea></div>
          <div class="campo-f"><label for="bk${b.id}">Consignas (una por línea)</label><textarea id="bk${b.id}" data-b="consignas" data-bid="${b.id}" maxlength="800" placeholder="Perfil abierto antes de recibir&#10;Máximo dos toques">${esc(b.consignas)}</textarea></div>
          <div class="fila">
            <div class="campo-f crece"><label for="bf${b.id}">🎯 En qué fijarse</label><textarea id="bf${b.id}" data-b="fij" data-bid="${b.id}" maxlength="300" placeholder="El balón, el compañero, el rival, hacia dónde mira, el pie…">${esc(b.fij || "")}</textarea></div>
            <div class="campo-f crece"><label for="bq${b.id}">⏱️ Cuándo fijarse</label><textarea id="bq${b.id}" data-b="cuando" data-bid="${b.id}" maxlength="300" placeholder="En qué momento de la jugada mirar cada cosa para llegar a tiempo.">${esc(b.cuando || "")}</textarea></div>
          </div>
          <div class="acciones">
            ${b.jug ? `<button type="button" class="btn-peq" data-pz="${b.id}" style="background:var(--verde);color:#fff">🟩 Abrir pizarra (${b.jug.pasos.length} paso${b.jug.pasos.length === 1 ? "" : "s"})</button>
              <button type="button" class="btn-peq peligro" data-pzborrar="${b.id}">Quitar pizarra</button>`
              : `<label class="peq" for="tp${b.id}" style="align-self:center">Pizarra:</label><select id="tp${b.id}" data-tpl="${b.id}" style="width:auto;min-height:36px;padding:4px 8px">${Object.keys(PLANTILLAS).map((k) => `<option value="${k}" ${(PLANT_POR_CAT[b.cat] || (p.tipo === "partido" ? "vacia" : "libre")) === k ? "selected" : ""}>${PLANTILLAS[k]}</option>`).join("")}</select>
              <button type="button" class="btn-peq" data-pzcrear="${b.id}">Crear pizarra</button>`}
          </div>
          <div class="acciones">
            <button type="button" class="btn-peq" data-bmov="${bi}" data-dir="-1" ${bi === 0 ? "disabled" : ""} aria-label="Subir apartado">↑</button>
            <button type="button" class="btn-peq" data-bmov="${bi}" data-dir="1" ${bi === p.bloques.length - 1 ? "disabled" : ""} aria-label="Bajar apartado">↓</button>
            <button type="button" class="btn-peq peligro" data-bborrar="${b.id}">Borrar apartado</button>
          </div>
        </div>`).join("")}
      <button type="button" class="btn-sec" data-bnuevo="1">＋ Añadir apartado</button>

      <h2>Enviar</h2>
      <div class="tarjeta">
        <p class="peq">Se crea un enlace con todo el plan. Los jugadores lo abren, eligen su dorsal y ven la pizarra con sus mensajes. No hace falta cuenta ni instalar nada; el contenido viaja dentro del enlace.</p>
        <p class="peq"><b>Ojo:</b> quien tenga el enlace ve el plan entero (nombres cortos y consignas de todos). Si alguien lo reenvía, también lo verá quien lo reciba.</p>
        <label class="peq" style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" data-r="sinNombres" style="width:22px;height:22px"> Enviar solo dorsales, sin nombres</label>
        <div class="fila">
          <button type="button" class="btn" data-enviar="1">📤 Enviar al grupo</button>
          <button type="button" class="btn-sec" data-preview="1">👁 Ver como jugador</button>
        </div>
        <div data-r="compartir"></div>
      </div>`;
  }

  function abrirPizarra(plan, bloque) {
    const dlg = $("#dlgPizarra");
    $("#dlgPzTit").textContent = bloque.titulo || CATS[bloque.cat] || "Pizarra";
    const cuerpo = $("#dlgPzCuerpo");
    cuerpo.innerHTML = "";
    const hostPz = document.createElement("div");
    cuerpo.appendChild(hostPz);
    const ctx = crearCtx(plan, db.plantilla, true);
    const pz = crearPizarra(hostPz, { ctx: ctx, jug: bloque.jug, cat: bloque.cat, editable: true, alCambiar: guardar });
    dlg._pz = pz;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function cerrarPizarra() {
    const dlg = $("#dlgPizarra");
    if (dlg._pz) dlg._pz.parar();
    if (dlg.open) dlg.close();
  }
  $("#dlgCerrar").addEventListener("click", cerrarPizarra);
  $("#dlgPizarra").addEventListener("close", () => { guardar(); $("#dlgPzCuerpo").innerHTML = ""; if (estado.pant === "plan") pintarPantalla(); });

  function pantPlantilla() {
    const pl = db.plantilla.slice().sort((a, b) => a.d - b.d);
    app.innerHTML = `
      <h1>Plantilla</h1>
      <div class="tarjeta">
        <p class="peq">El <b>nombre corto</b> es el que sale debajo de la ficha (p. ej. «Bouba», «Toni C.»). En el puesto, escribe la posición habitual: ayuda a proponer la alineación.</p>
        <div class="plantilla-fila peq" aria-hidden="true"><b>Dorsal</b><b>Nombre corto</b><b>Puesto</b><span></span></div>
        <div data-r="filas">
          ${pl.map((j) => `
            <div class="plantilla-fila">
              <input type="number" min="0" max="99" value="${esc(j.d)}" data-j="d" data-jid="${esc(j.id)}" aria-label="Dorsal de ${esc(j.n)}">
              <input type="text" value="${esc(j.c || "")}" data-j="c" data-jid="${esc(j.id)}" maxlength="18" aria-label="Nombre corto de ${esc(j.n)}" placeholder="${esc(j.n)}">
              <input type="text" value="${esc(j.p || "")}" data-j="p" data-jid="${esc(j.id)}" maxlength="24" aria-label="Puesto de ${esc(j.n)}" placeholder="Puesto">
              <button type="button" class="btn-peq peligro" data-jborrar="${esc(j.id)}" aria-label="Quitar a ${esc(j.n)}">✕</button>
            </div>`).join("")}
        </div>
        ${pl.length ? "" : `<p class="vacio">Todavía no hay jugadores.</p>`}
      </div>
      <h2>Añadir jugador</h2>
      <div class="tarjeta">
        <div class="fila">
          <div class="campo-f" style="width:90px"><label for="nD">Dorsal</label><input type="number" id="nD" min="0" max="99"></div>
          <div class="campo-f crece"><label for="nN">Nombre</label><input type="text" id="nN" maxlength="60"></div>
        </div>
        <div class="fila">
          <div class="campo-f crece"><label for="nC">Nombre corto (opcional)</label><input type="text" id="nC" maxlength="18"></div>
          <div class="campo-f crece"><label for="nP">Puesto (opcional)</label><input type="text" id="nP" maxlength="24" placeholder="Portero, lateral, pivote…"></div>
        </div>
        <button type="button" class="btn" data-jnuevo="1">Añadir</button>
      </div>
      <h2>Pegar una lista</h2>
      <div class="tarjeta">
        <p class="peq">Copia la convocatoria (de la app de la federación o de donde sea) y pégala: una línea por jugador, con el dorsal delante. Ejemplo: <code>7 CAMPANER GONZALES, TONI</code>. Las líneas con PT se toman como portero.</p>
        <div class="campo-f"><label for="pegar">Lista</label><textarea id="pegar" rows="6" placeholder="1 NDIAYE, BOUBACAR PT&#10;3 MUÑOZ CERDA, JESUS"></textarea></div>
        <button type="button" class="btn-sec" data-jpegar="1">Importar lista</button>
      </div>`;
  }
  const capital = (s) => s.toLowerCase().replace(/(^|[\s\-'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  function importarLista(txt) {
    let n = 0;
    txt.split(/\r?\n/).forEach((lin) => {
      const m = lin.trim().match(/^(\d{1,2})[\s.\-–:]+(.+)$/);
      if (!m) return;
      let resto = m[2].trim();
      let pt = false;
      resto = resto.replace(/\s+(PT|C)\s*$/i, (x, t) => { if (/pt/i.test(t)) pt = true; return ""; }).replace(/\s+(PT|C)\s*$/i, (x, t) => { if (/pt/i.test(t)) pt = true; return ""; });
      let nombre = resto;
      if (resto.includes(",")) { const [ap, no] = resto.split(","); nombre = (no.trim() + " " + ap.trim()).trim(); }
      nombre = capital(nombre);
      const d = +m[1];
      if (db.plantilla.some((j) => j.d === d && j.n === nombre)) return;
      db.plantilla.push({ id: uid(), d: d, n: nombre, c: nombre.split(" ")[0], p: pt ? "Portero" : "" });
      n++;
    });
    // nombres cortos repetidos → añade inicial del apellido
    const cnt = {};
    db.plantilla.forEach((j) => { cnt[j.c] = (cnt[j.c] || 0) + 1; });
    db.plantilla.forEach((j) => { if (cnt[j.c] > 1) { const ps = j.n.split(" "); if (ps[1]) j.c = ps[0] + " " + ps[1][0] + "."; } });
    guardar();
    return n;
  }

  function pantAjustes() {
    app.innerHTML = `
      <h1>Ajustes</h1>
      <div class="tarjeta">
        <div class="campo-f"><label for="aEq">Nombre del equipo</label><input type="text" id="aEq" data-eq="nombre" value="${esc(db.equipo.nombre)}" maxlength="60"></div>
        <div class="campo-f"><label for="aCol">Color de nuestras fichas</label><input type="color" id="aCol" data-eq="color" value="${esc(db.equipo.color || "#C8102E")}" style="width:80px;height:44px;padding:2px"></div>
      </div>
      <h2>Copia de seguridad</h2>
      <div class="tarjeta">
        <p class="peq">Todo se guarda solo en este móvil o navegador. Descarga una copia de vez en cuando, o para pasarlo a otro dispositivo.</p>
        <div class="fila">
          <button type="button" class="btn-sec" data-exportar="1">Descargar copia</button>
          <label class="btn-sec" for="impFile" style="cursor:pointer">Recuperar copia</label>
          <input type="file" id="impFile" accept="application/json,.json" style="position:absolute;left:-999px">
        </div>
      </div>
      <h2>Sobre la privacidad</h2>
      <div class="tarjeta">
        <p class="peq">La pizarra no usa servidores ni servicios externos. El enlace que envías al grupo lleva el plan dentro (después del símbolo #) y no se guarda en ningún servidor. Eso sí: lo puede abrir cualquiera que tenga el enlace, también si se reenvía. Usa nombres cortos o apodos, o envía solo dorsales, si prefieres no compartir nombres.</p>
      </div>`;
  }

  // ---------------------------------------------------------------- compartir
  function paquete(plan, sinNombres) {
    const usados = new Set();
    Object.values(plan.once || {}).forEach((x) => usados.add(x));
    plan.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj) usados.add(f.pj); }); });
    const jug = db.plantilla.filter((j) => usados.has(j.id)).map((j) => { const n = sinNombres ? "" : (j.c || j.n.split(" ")[0]); return { id: j.id, d: j.d, n: n || "Dorsal " + j.d, c: n, p: j.p || "" }; });
    const pl = clon(plan); delete pl.id;
    // limpieza: redondeo
    pl.bloques.forEach((b) => { if (b.jug) b.jug.pasos.forEach((p) => { Object.keys(p.pos).forEach((k) => { p.pos[k] = p.pos[k].map(r05); }); p.b = p.b.map(r05); if (p.tips && !Object.keys(p.tips).length) delete p.tips; if (p.dib && !p.dib.length) delete p.dib; }); });
    return { v: 1, eq: { n: db.equipo.nombre, col: db.equipo.color }, plan: pl, jug: jug };
  }
  function enlaceDe(plan, sinNombres) {
    const txt = window.LZString.compressToEncodedURIComponent(JSON.stringify(paquete(plan, sinNombres)));
    return location.origin + location.pathname + "#ver=" + txt;
  }
  function textoGrupo(plan, url) {
    const lin = [];
    lin.push((plan.tipo === "partido" ? "⚽ " : "🏃 ") + (plan.titulo || (plan.tipo === "partido" ? "Partido" : "Entreno")) + (plan.fecha ? " · " + fechaBonita(plan.fecha) : ""));
    if (plan.rival) lin.push("Rival: " + plan.rival);
    if (plan.objetivo) lin.push("", plan.objetivo);
    if (plan.notas) lin.push("", plan.notas);
    if (plan.clave) lin.push("", "Palabra clave para volver al juego: " + plan.clave);
    lin.push("");
    plan.bloques.forEach((b, i) => lin.push((i + 1) + ". " + (b.titulo || CATS[b.cat]) + (b.min && plan.tipo === "entreno" ? " (" + b.min + "')" : "")));
    lin.push("", "Abre la pizarra, elige tu dorsal y mira dónde juegas y qué tienes que hacer en cada paso:", url);
    return lin.join("\n");
  }
  async function enviar(plan, cont) {
    const sn = app.querySelector('[data-r="sinNombres"]');
    const url = enlaceDe(plan, !!(sn && sn.checked));
    const txt = textoGrupo(plan, url);
    if (navigator.share) {
      try { await navigator.share({ title: plan.titulo || "Pizarra", text: txt }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    let copiado = false;
    try { await navigator.clipboard.writeText(txt); copiado = true; } catch (e) { /* sin portapapeles */ }
    cont.innerHTML = `<p class="peq" style="margin-top:10px">${copiado ? "✅ Mensaje copiado. Pégalo en el grupo del equipo." : "Copia este mensaje y pégalo en el grupo:"}</p>
      <label class="peq" for="txtGrupo" style="position:absolute;left:-999px">Mensaje para el grupo</label>
      <textarea id="txtGrupo" rows="8" readonly>${esc(txt)}</textarea>
      <p class="peq">Longitud del enlace: ${url.length} caracteres.</p>`;
    if (!copiado) { const t = $("#txtGrupo"); t.focus(); t.select(); }
  }

  // ---------------------------------------------------------------- vista del jugador
  let pizarrasVista = [];
  function vistaJugador(cont, pq, opciones) {
    const plan = pq.plan, jug = pq.jug || [];
    const ctx = crearCtx(plan, jug, false);
    let yo = "";
    try { yo = sessionStorage.getItem("pz_yo") || ""; } catch (e) { /* sin almacenamiento */ }
    if (!jug.some((j) => j.id === yo)) yo = "";
    pizarrasVista.forEach((p) => p.parar()); pizarrasVista = [];
    cont.innerHTML = `
      ${opciones && opciones.volver ? `<button type="button" class="btn-sec" data-volverplan="1" style="margin-bottom:10px">← Volver a editar</button>` : ""}
      <div class="portada">
        <span class="chip ${plan.tipo === "partido" ? "partido" : ""}">${plan.tipo === "partido" ? "Partido" : "Entreno"}</span>
        <h1>${esc(plan.titulo || "")}</h1>
        <p class="peq">${esc(pq.eq && pq.eq.n || "")}${plan.fecha ? " · " + esc(fechaBonita(plan.fecha)) : ""}${plan.rival ? " · contra " + esc(plan.rival) : ""}</p>
        ${jug.length ? `<div class="yo-sel"><label for="selYo"><b>¿Quién eres?</b></label>
          <select id="selYo"><option value="">Elige tu dorsal</option>${jug.slice().sort((a, b) => a.d - b.d).map((j) => `<option value="${esc(j.id)}" ${yo === j.id ? "selected" : ""}>${esc(j.d)} · ${esc(j.c || j.n)}</option>`).join("")}</select></div>` : ""}
      </div>
      ${plan.objetivo ? `<div class="tarjeta"><h3>${plan.tipo === "partido" ? "La idea" : "Objetivo"}</h3><p>${esc(plan.objetivo).replace(/\n/g, "<br>")}</p></div>` : ""}
      ${plan.notas ? `<div class="tarjeta"><h3>Notas</h3><p>${esc(plan.notas).replace(/\n/g, "<br>")}</p></div>` : ""}
      <div data-r="bloques"></div>
      <section class="tarjeta">
        <h2 style="margin-top:0">Si te distraes, vuelve</h2>
        <p class="peq">En el partido, la atención va hacia fuera (la jugada) y a veces hacia dentro (pensamientos, nervios, cansancio). Es normal. No hace falta no distraerse nunca: la clave es darse cuenta antes y volver antes.</p>
        <div class="fila">
          <div class="campo-f crece"><label for="miPal">Mi palabra clave</label><input type="text" id="miPal" maxlength="30" placeholder="${esc(plan.clave || "¡Reset!")}"></div>
          <div class="campo-f crece"><label for="miGes">Mi gesto</label><input type="text" id="miGes" maxlength="40" placeholder="Subirme las medias, una palmada…"></div>
        </div>
        <p class="peq">Se guarda solo en tu móvil. Entrénalos en los entrenos para que el día del partido salgan solos.</p>
      </section>`;
    try { const mv = JSON.parse(localStorage.getItem("pz_mivuelta") || "{}"); $("#miPal", cont).value = mv.p || ""; $("#miGes", cont).value = mv.g || ""; } catch (e) { /* nada */ }
    ["#miPal", "#miGes"].forEach((s) => $(s, cont).addEventListener("input", () => {
      try { localStorage.setItem("pz_mivuelta", JSON.stringify({ p: $("#miPal", cont).value, g: $("#miGes", cont).value })); } catch (e) { /* nada */ }
    }));
    const bc = cont.querySelector('[data-r="bloques"]');
    plan.bloques.forEach((b, bi) => {
      const d = document.createElement("section");
      d.className = "tarjeta bloque";
      d.style.borderLeftColor = plan.tipo === "partido" ? "var(--acento)" : "var(--verde)";
      const cons = (b.consignas || "").split(/\n/).map((x) => x.trim()).filter(Boolean);
      d.innerHTML = `<h2 style="margin-top:0">${bi + 1}. ${esc(b.titulo || CATS[b.cat])}${b.min && plan.tipo === "entreno" ? ` <span class="peq">· ${esc(b.min)} min</span>` : ""}</h2>
        ${b.texto ? `<p>${esc(b.texto).replace(/\n/g, "<br>")}</p>` : ""}
        ${cons.length ? `<ul class="consignas">${cons.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        ${b.fij || b.cuando ? `<div class="atencion">${b.fij ? `<p><b>🎯 En qué fijarte:</b> ${esc(b.fij)}</p>` : ""}${b.cuando ? `<p><b>⏱️ Cuándo:</b> ${esc(b.cuando)}</p>` : ""}</div>` : ""}
        <div data-r="mio"></div>
        ${b.jug ? `<div data-r="pz" id="pzv${bi}"></div>` : ""}`;
      bc.appendChild(d);
      if (b.jug) {
        const pz = crearPizarra(d.querySelector('[data-r="pz"]'), { ctx: ctx, jug: b.jug, cat: b.cat, editable: false, yoPid: yo, equipoColor: pq.eq && pq.eq.col });
        pizarrasVista.push(pz);
      }
      pintarMio(d.querySelector('[data-r="mio"]'), b, ctx, yo);
    });
    const sy = cont.querySelector("#selYo");
    if (sy) sy.addEventListener("change", () => {
      yo = sy.value;
      try { sessionStorage.setItem("pz_yo", yo); } catch (e) { /* nada */ }
      pizarrasVista.forEach((p) => p.seleccionarJugador(yo));
      $$(".bloque", cont).forEach((d, bi) => pintarMio(d.querySelector('[data-r="mio"]'), plan.bloques[bi], ctx, yo));
    });
  }
  function pintarMio(el, b, ctx, yo) {
    if (!el) return;
    if (!yo || !b.jug) { el.innerHTML = ""; return; }
    const f = b.jug.fichas.find((x) => x.eq !== "c" && ctx.pidDe(x) === yo);
    if (!f) { el.innerHTML = `<p class="peq mi-papel">En esta pizarra no sales: fíjate en lo que hacen tus compañeros de puesto.</p>`; return; }
    const lin = [];
    b.jug.pasos.forEach((p, i) => {
      const t = (p.tips || {})[f.id];
      if (t && (t.m || t.p || t.f || t.q)) lin.push(`<li><b>Paso ${i + 1}${p.t ? " · " + esc(p.t) : ""}:</b> ${esc([t.m, t.p && "Perfil: " + t.p, t.f && "Fíjate: " + t.f, t.q && "Cuándo: " + t.q].filter(Boolean).join(" · "))}</li>`);
    });
    const inf = ctx.info(f);
    el.innerHTML = `<div class="mi-papel"><b>Tú juegas${inf.rol ? " de " + esc(inf.rol.toLowerCase()) : ""}.</b> Tu ficha brilla en amarillo; los mensajes salen debajo del campo.${lin.length ? `<ul class="consignas">${lin.join("")}</ul>` : ""}</div>`;
  }

  function pantPreview() {
    const p = db.planes.find((x) => x.id === estado.planId);
    if (!p) return ir("cuaderno");
    vistaJugador(app, paquete(p), { volver: true });
  }

  // ---------------------------------------------------------------- eventos generales
  app.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const d = b.dataset;
    const plan = db.planes.find((x) => x.id === estado.planId);
    if (d.ir2) return ir(d.ir2);
    if (d.nuevo) return nuevoPlan(d.nuevo);
    if (d.abrir) return ir("plan", { planId: d.abrir });
    if (d.dup) {
      const o = db.planes.find((x) => x.id === d.dup); if (!o) return;
      const c = clon(o); c.id = uid(); c.titulo = (c.titulo || "") + " (copia)"; c.fecha = hoyISO();
      c.bloques.forEach((x) => { x.id = uid(); });
      db.planes.push(c); guardar(); return ir("plan", { planId: c.id });
    }
    if (d.borrar) {
      if (!window.confirm("¿Borrar este plan del cuaderno?")) return;
      db.planes = db.planes.filter((x) => x.id !== d.borrar); guardar(); return pintarPantalla();
    }
    if (d.volverplan) return ir("plan", { planId: estado.planId });
    if (plan) {
      const bl = (id) => plan.bloques.find((x) => x.id === id);
      if (d.pzcrear) {
        const b2 = bl(d.pzcrear); const sel = app.querySelector(`[data-tpl="${d.pzcrear}"]`);
        b2.jug = nuevaJugada(plan, sel ? sel.value : "vacia"); guardar(); pintarPantalla(); return abrirPizarra(plan, b2);
      }
      if (d.pz) return abrirPizarra(plan, bl(d.pz));
      if (d.pzborrar) { if (!window.confirm("¿Quitar la pizarra de este apartado?")) return; bl(d.pzborrar).jug = null; guardar(); return pintarPantalla(); }
      if (d.bnuevo) { plan.bloques.push({ id: uid(), cat: plan.tipo === "partido" ? "situacion" : "ejercicio", titulo: "", min: plan.tipo === "partido" ? "" : 15, texto: "", consignas: "", jug: null }); guardar(); return pintarPantalla(); }
      if (d.bborrar) { if (!window.confirm("¿Borrar este apartado?")) return; plan.bloques = plan.bloques.filter((x) => x.id !== d.bborrar); guardar(); return pintarPantalla(); }
      if (d.bmov) { const a = +d.bmov, z = a + +d.dir; const t = plan.bloques[a]; plan.bloques[a] = plan.bloques[z]; plan.bloques[z] = t; guardar(); return pintarPantalla(); }
      if (d.enviar) return enviar(plan, app.querySelector('[data-r="compartir"]'));
      if (d.preview) return ir("preview", { planId: plan.id });
    }
    if (d.jborrar) {
      const j = db.plantilla.find((x) => x.id === d.jborrar);
      if (!window.confirm("¿Quitar a " + (j ? j.n : "este jugador") + " de la plantilla?")) return;
      db.plantilla = db.plantilla.filter((x) => x.id !== d.jborrar); guardar(); return pintarPantalla();
    }
    if (d.jnuevo) {
      const dd = $("#nD").value, nn = $("#nN").value.trim();
      if (!nn) { toast("Escribe el nombre"); $("#nN").focus(); return; }
      db.plantilla.push({ id: uid(), d: dd === "" ? 0 : +dd, n: nn, c: $("#nC").value.trim() || nn.split(" ")[0], p: $("#nP").value.trim() });
      guardar(); pintarPantalla(); toast("Jugador añadido"); $("#nD").focus(); return;
    }
    if (d.jpegar) { const n = importarLista($("#pegar").value); pintarPantalla(); toast(n ? n + " jugador" + (n === 1 ? "" : "es") + " añadido" + (n === 1 ? "" : "s") : "No he encontrado líneas con dorsal y nombre"); return; }
    if (d.exportar) {
      const blob = new Blob([JSON.stringify(db, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "pizarra-entrenador-" + hoyISO() + ".json";
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }
  });
  app.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    const plan = db.planes.find((x) => x.id === estado.planId);
    if (d.p && plan && d.p !== "sistema") { plan[d.p] = t.value; guardar(); return; }
    if (d.b && plan) { const b = plan.bloques.find((x) => x.id === d.bid); if (b && d.b !== "cat") { b[d.b] = t.value; guardar(); } return; }
    if (d.j) {
      const j = db.plantilla.find((x) => x.id === d.jid); if (!j) return;
      j[d.j] = d.j === "d" ? +t.value : t.value; guardar(); return;
    }
    if (d.eq) { db.equipo[d.eq] = t.value; guardar(); if (d.eq === "nombre") $("#ttApp").textContent = t.value || "Pizarra del entrenador"; }
  });
  app.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset;
    const plan = db.planes.find((x) => x.id === estado.planId);
    if (d.p === "sistema" && plan) { plan.sistema = t.value; guardar(); return pintarPantalla(); }
    if (d.once !== undefined && plan) { plan.once = plan.once || {}; if (t.value) plan.once[d.once] = t.value; else delete plan.once[d.once]; guardar(); return; }
    if (d.b === "cat" && plan) {
      const b = plan.bloques.find((x) => x.id === d.bid);
      if (b) { const viejo = CATS[b.cat]; b.cat = t.value; if (!b.titulo || b.titulo === viejo) b.titulo = CATS[t.value]; guardar(); pintarPantalla(); }
      return;
    }
    if (t.id === "impFile" && t.files && t.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const o = sanDB(JSON.parse(r.result));
          if (!o) throw new Error("formato");
          if (!window.confirm("Esto sustituye el cuaderno actual por la copia. ¿Seguir?")) return;
          try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (err) { toast("No se ha podido guardar la copia en este navegador."); return; }
          db = o; toast("Copia recuperada"); ir("cuaderno");
        } catch (err) { toast("Ese archivo no es una copia de la pizarra"); }
      };
      r.readAsText(t.files[0]);
    }
  });
  $("#nav").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ir(b.dataset.ir); });

  // ---------------------------------------------------------------- arranque
  function arrancar() {
    const h = location.hash || "";
    if (h.startsWith("#ver=")) {
      let pq = null;
      try { pq = sanPaquete(JSON.parse(window.LZString.decompressFromEncodedURIComponent(h.slice(5)))); } catch (e) { pq = null; }
      if (!pq || !pq.plan) {
        app.innerHTML = `<h1>Enlace incompleto</h1><p>Este enlace no se ha podido leer. Pide al entrenador que lo vuelva a enviar (a veces se corta al copiarlo).</p>`;
        return;
      }
      $("#nav").hidden = true;
      $("#ttApp").textContent = (pq.eq && pq.eq.n) || "Pizarra";
      $("#ttSub").textContent = "Lo que vamos a trabajar";
      document.title = (pq.plan.titulo || "Pizarra") + " · " + ((pq.eq && pq.eq.n) || "Pizarra");
      document.body.style.paddingBottom = "20px";
      vistaJugador(app, pq);
      const extra = document.createElement("div");
      extra.className = "tarjeta";
      extra.innerHTML = `<p class="peq">¿Eres el entrenador? Puedes guardar este plan en tu cuaderno para editarlo.</p><button type="button" class="btn-sec" data-guardarplan="1">Guardar en mi cuaderno</button>`;
      app.appendChild(extra);
      extra.querySelector("button").addEventListener("click", () => {
        const p = clon(pq.plan); p.id = uid();
        (pq.jug || []).forEach((j) => { if (!db.plantilla.some((x) => x.id === j.id)) db.plantilla.push(clon(j)); });
        db.planes.push(p); guardar();
        history.replaceState(null, "", location.pathname);
        ir("plan", { planId: p.id });
      });
      return;
    }
    pintarPantalla();
  }
  window.addEventListener("hashchange", () => { if ((location.hash || "").startsWith("#ver=")) arrancar(); });
  arrancar();
})();
