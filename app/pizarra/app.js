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
  const AREAS = { tecnica: "Técnica", tactica: "Táctica", decision: "Toma de decisiones", fisico: "Físico", atencion: "Atención y actitud" };
  const TIPOS_NOTA = { f: "💪 Punto fuerte", m: "🎯 A mejorar", c: "💡 Consejo para una situación" };
  const PLANT_POR_CAT = { salida: "salida", presion: "presion", banda: "banda", cornerF: "cornerF", cornerC: "cornerC", falta: "falta", rondo: "rondo", transicion: "transicion" };
  const PLANTILLAS = {
    vacia: "Los dos equipos colocados (1 paso)", salida: "Salida de balón en corto", presion: "Presión en saque de puerta rival",
    banda: "Saque de banda ofensivo", cornerF: "Córner a favor", cornerC: "Córner en contra", falta: "Falta lateral a favor",
    rondo: "Rondo 4 contra 2", transicion: "Transición tras robo (medio campo)", libre: "Pizarra en blanco (solo balón)"
  };
  const COLORES_DIB = [["#FFD23F", "amarillo"], ["#FF4FA3", "rosa"], ["#FF8A1F", "naranja"], ["#FFFFFF", "blanco"], ["#E11D2E", "rojo"], ["#3B82F6", "azul"]];
  // Colores de peto para las fichas (por defecto, el color del equipo o el azul rival)
  const PETOS = { rojo: "#C8102E", azul: "#2457C5", amarillo: "#F5C400", verde: "#15803A", naranja: "#F07800", blanco: "#F4F4F4", negro: "#1B1B1B", morado: "#7C3AED", rosa: "#E0458F", celeste: "#38BDF8", gris: "#8A8F98" };
  const PETOS_CLAROS = new Set(["amarillo", "blanco", "celeste", "naranja", "rosa", "gris"]);
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

  // ----- Método APRENS: cinco pasos para cualquier aprendizaje
  // 1 dar a conocer los estímulos relevantes (qué y cuándo) · 2 ejercicio analítico · 3 lo conocen pero
  // aún no lo han aprendido (observar y preguntar, no repetir) · 4 dinámica ecológica con cambio de foco
  // en las transiciones · 5 condición ligada al gol (la tiene un equipo y no la pierde al perder el balón).
  const FASES = { analitico: "Paso 2 · Analítico (repetir y entender)", ecologico: "Paso 4 · Dinámica ecológica (con transiciones)", condicionado: "Paso 5 · Partido condicionado" };
  const FASE_CORTA = { analitico: "Analítico", ecologico: "Dinámica ecológica", condicionado: "Partido condicionado" };
  const TRANS = { p: "⚡ Pérdida: cambia el foco a defender", r: "⚡ Recuperación: cambia el foco a atacar" };
  const TRANS_JUG = { p: "⚡ Pérdida de balón: el foco cambia a defender. Mira el balón y a quien lo ha recuperado.", r: "⚡ Recuperación: el foco cambia a atacar. Mira el espacio y al compañero libre." };
  // Aprendizajes de ejemplo (los mismos que el diseñador de dinámicas de aprens.net/entrenadors.html).
  // tpl: pizarra de la dinámica ecológica; cat: tipo de apartado de la dinámica.
  const APRENDIZAJES = {
    ruptura: { t: "Desmarque de ruptura", tpl: "vacia", cat: "juego",
      que: "La línea del último defensor. El compañero con balón: si tiene la cabeza levantada y el cuerpo orientado para pasar hacia delante. El espacio a la espalda de la defensa.",
      quan: "Cuando el compañero controla orientado y levanta la cabeza, justo antes del pase. Salir en diagonal para no quedar en fuera de juego.",
      an: "Parejas con un cono haciendo de defensor: el pasador conduce y, cuando levanta la cabeza, el receptor sale al espacio. Primero sin oposición, después con un defensor pasivo.",
      eco: "4 contra 4 con dos comodines y dos porterías. Cuando un equipo recupera el balón tiene 6 segundos para buscar un pase a la espalda de la defensa: el foco tiene que pasar de defender a mirar el espacio.",
      cond: "El gol solo vale si llega después de un pase a la espalda de la defensa. Si el equipo pierde el balón, conserva la condición.",
      pre: "¿Dónde estaba el último defensor cuando saliste?\n¿Qué te dijo que el compañero ya podía pasar?\n¿Has salido antes o después del pase?", pc: "Espalda" },
    control: { t: "Control orientado", tpl: "rondo", cat: "rondo",
      que: "Dónde está el rival más cercano. Dónde está el espacio libre o el compañero desmarcado. La trayectoria del balón que llega.",
      quan: "Antes de recibir: mirar por encima del hombro mientras el balón viaja. El primer toque ya va hacia el espacio libre.",
      an: "Triángulos de pases con un cono que hace de presionador y que el entrenador cambia de lado. El receptor tiene que mirar antes de recibir y controlar hacia el lado contrario al cono.",
      eco: "Rondo 4 contra 2 con dos zonas. Si los defensores roban el balón, pueden marcar en una portería pequeña: los atacantes tienen que cambiar el foco a defender.",
      cond: "El pase que empieza con un control orientado que supera a un rival cuenta doble o vale gol.",
      pre: "Antes de recibir, ¿qué has visto?\n¿Hacia dónde has dado el primer toque? ¿Por qué?\n¿Dónde estaba el rival cuando te ha llegado el balón?", pc: "Mira antes" },
    perdua: { t: "Activación tras pérdida", tpl: "transicion", cat: "transicion",
      que: "El balón y el jugador que lo acaba de recuperar. El compañero más cercano. La línea de pase más fácil del rival.",
      quan: "En el mismo momento de perder el balón: los primeros 3 a 5 segundos.",
      an: "2 contra 1 en espacio reducido: cuando el atacante pierde el balón, él y el compañero más cercano presionan enseguida. Al principio el entrenador señala la pérdida; después, nadie tiene que avisar.",
      eco: "5 contra 5 con dos porterías en un campo corto, con muchas transiciones. El foco tiene que cambiar sin pausa de atacar a recuperar.",
      cond: "Suma un gol si recupera el balón en menos de 5 segundos después de perderlo. Perderlo no le quita la condición.",
      pre: "¿Qué has hecho en el primer segundo después de perderlo?\n¿Quién era el más cercano al balón?\n¿Qué pase querías tapar?", pc: "Ahora" },
    sortida: { t: "Salida de balón desde el portero", tpl: "salida", cat: "salida",
      que: "Dónde está el delantero rival que presiona y hacia dónde mira. El compañero libre (el hombre libre). La orientación del propio cuerpo para recibir de cara.",
      quan: "Cuando el portero tiene el balón, antes de recibir. Si el rival cierra un lado, el foco va al otro.",
      an: "Portero, dos centrales y un pivote contra uno o dos presionadores en medio campo: circular hasta encontrar al hombre libre. Primero con presión pasiva.",
      eco: "6 contra 5 en medio campo con portero. Si el rival roba, ataca la portería; si el equipo supera la presión, hace punto pasando una línea o en porterías pequeñas.",
      cond: "Hace punto si el balón supera la primera línea de presión con un pase al hombre libre.",
      pre: "¿Quién era el jugador libre?\n¿Hacia dónde miraba el delantero que presionaba?\n¿Tu cuerpo estaba orientado para recibir de cara?", pc: "Libre" },
    pressio: { t: "Presión coordinada", tpl: "vacia", cat: "juego",
      que: "La orientación del rival con balón (de cara o de espaldas). El compañero que presiona, para hacerle la cobertura. La línea de pase que hay que cerrar.",
      quan: "Cuando hay una señal de presión: el rival recibe de espaldas, controla mal o hace un pase atrás.",
      an: "2 contra 2 en una zona: uno presiona y el otro cubre y cierra la línea de pase. Cambian los papeles en cada repetición.",
      eco: "6 contra 6 con porterías. Cuando el rival da una señal de presión, el equipo presiona junto; si recupera en campo contrario, tiene que acabar en 8 segundos.",
      cond: "Gol doble si el gol llega después de un robo en presión.",
      pre: "¿Qué señal te ha dicho que podíais presionar?\n¿Quién te cubría?\n¿Qué pase has cerrado?", pc: "Juntos" },
    errada: { t: "Volver a la jugada después de un error", tpl: "vacia", cat: "juego",
      que: "Darse cuenta: el pensamiento, la emoción o la tensión que aparece después del error, sin pelearse con ello. La palabra clave o el gesto. La próxima jugada.",
      quan: "Justo después del error o en la primera parada del juego.",
      an: "Un minuto de atención plena al inicio del entrenamiento: la respiración o el tacto del balón con las manos. Cuando llega una distracción, darse cuenta y volver.",
      eco: "En los partidos condicionados, quien se equivoca hace su gesto (subirse las medias, un estiramiento) y vuelve enseguida a su posición. El entrenador valora la vuelta, no el error.",
      cond: "Suma un punto cuando un jugador que acaba de fallar participa en la acción siguiente.",
      pre: "¿Qué has notado después del error?\n¿Cuánto has tardado en volver a la jugada?\n¿Qué palabra o qué gesto te han ayudado?", pc: "Reset" }
  };


  // ----- Pizarras ya diseñadas para cada aprendizaje (analítico, dinámica ecológica y partido condicionado).
  // Nuestro equipo ataca hacia arriba (y = 0). Cada paso hereda las posiciones del anterior y cambia solo lo indicado.
  // f: [id, equipo, peto]; c: conos [x, y, color, forma]; p: pasos { t, pos, b (balón), tips, d (flechas [desde, hasta]), tr }.
  const CAMPO5 = [[12, 6, "blanco", "chino"], [56, 6, "blanco", "chino"], [12, 50, "blanco", "chino"], [56, 50, "blanco", "chino"], [30, 6, "naranja"], [38, 6, "naranja"], [30, 50, "naranja"], [38, 50, "naranja"]];
  const F5 = [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["e5", "a"], ["f1", "r"], ["f2", "r"], ["f3", "r"], ["f4", "r"], ["f5", "r"]];
  const B5 = { e1: [34, 44], e2: [16, 34], e3: [52, 34], e4: [24, 20], e5: [44, 20], f1: [34, 9], f2: [18, 13], f3: [50, 13], f4: [26, 31], f5: [42, 31] };
  const F6 = F5.concat([["e6", "a"], ["f6", "r"]]);
  const B6 = Object.assign({}, B5, { e6: [34, 37], f6: [34, 19] });
  const CUADRO = (x0, y0, x1, y1) => [[x0, y0, "blanco", "chino"], [x1, y0, "blanco", "chino"], [x0, y1, "blanco", "chino"], [x1, y1, "blanco", "chino"]];
  const TIP = (m, f, q) => { const o = {}; if (m) o.m = m; if (f) o.f = f; if (q) o.q = q; return o; };
  const DISENOS = {
    ruptura: {
      an: { v: "A", f: [["e1", "a"], ["e2", "a"]], c: [[34, 24, "rojo"]], p: [
        { t: "Conduce el pasador; tú esperas en la línea del cono", pos: { e1: [28, 44], e2: [42, 26] }, b: [28, 43],
          tips: { e2: TIP("Espera a la altura del cono, sin pasarte", "El cono (el último defensor) y la cabeza del pasador", "Mientras conduce"), e1: TIP("Conduce con la cabeza levantada", "El espacio a la espalda del cono") } },
        { t: "Levanta la cabeza: sal en diagonal", pos: { e1: [30, 38], e2: [40, 22] }, b: [30, 37], d: [[[40, 22], [32, 12]]],
          tips: { e2: TIP("Arranca en diagonal a la espalda del cono", "", "Justo cuando levanta la cabeza"), e1: TIP("Pasa al espacio, no al pie", "La carrera de tu compañero") } },
        { t: "Recibe a la espalda y orienta hacia portería", pos: { e2: [32, 12] }, b: [32, 13], tips: { e2: TIP("Primer toque hacia la portería") } }] },
      eco: { v: "A", f: [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["e5", "a", "amarillo"], ["e6", "a", "amarillo"], ["f1", "r"], ["f2", "r"], ["f3", "r"], ["f4", "r"]], c: CAMPO5, p: [
        { t: "4 contra 4 con dos comodines: ataca el otro equipo", pos: { e1: [34, 42], e2: [22, 34], e3: [46, 34], e4: [34, 24], e5: [12, 28], e6: [56, 28], f1: [34, 14], f2: [24, 22], f3: [44, 22], f4: [32, 32] }, b: [32, 31] },
        { t: "¡Robo! 6 segundos para buscar la espalda", tr: "r", pos: { e2: [26, 32], f4: [30, 35], e4: [36, 22] }, b: [26, 31],
          tips: { e4: TIP("Prepárate para romper", "La línea del último defensor y la cabeza del que tiene el balón", "En cuanto robamos"), e2: TIP("Cabeza arriba: busca la espalda", "La carrera de tus compañeros") } },
        { t: "Pase a la espalda y finalizamos", pos: { e4: [36, 10] }, b: [36, 11], d: [[[26, 31], [36, 11]]], tips: { e4: TIP("Recibe a la espalda y define") } }] },
      cond: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "Atacan las fichas del color del equipo: tienen la condición", pos: B5, b: [16, 33] },
        { t: "Pase a la espalda de la defensa: el gol vale", pos: { e5: [42, 8] }, b: [42, 9], d: [[[16, 33], [42, 9]]],
          tips: { e5: TIP("Sal a la espalda en diagonal", "El último defensor", "Cuando el compañero levanta la cabeza") } }] }
    },
    control: {
      an: { v: "A", f: [["e1", "a"], ["e2", "a"], ["e3", "a"]], c: [[40, 26, "rojo"]], p: [
        { t: "Pase al vértice: mira antes de recibir", pos: { e1: [24, 40], e2: [44, 40], e3: [34, 24] }, b: [24, 39], d: [[[24, 39], [34, 25]]],
          tips: { e3: TIP("Mira por encima del hombro antes de recibir", "Dónde está el cono (el presionador)", "Mientras viaja el balón") } },
        { t: "Control orientado al lado contrario del cono", pos: { e3: [30, 25] }, b: [30, 26], tips: { e3: TIP("Primer toque hacia el lado libre", "El espacio libre", "En el primer toque") } },
        { t: "El cono cambia de lado: vuelve a mirar", pos: { c0: [28, 26], e3: [34, 24] }, b: [44, 39], d: [[[30, 26], [44, 39]]],
          tips: { e3: TIP("Ahora el presionador está al otro lado: controla hacia el contrario", "El cono", "Antes de cada recepción") } }] },
      eco: { v: "A", f: [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["f1", "r"], ["f2", "r"]], c: CUADRO(22, 24, 46, 48).concat([[30, 12, "naranja"], [38, 12, "naranja"]]), p: [
        { t: "Rondo 4 contra 2: mira antes de recibir", pos: { e1: [34, 24], e2: [46, 36], e3: [34, 48], e4: [22, 36], f1: [32, 34], f2: [37, 38] }, b: [22, 35],
          tips: { e1: TIP("Perfil abierto", "Dónde están los dos de dentro", "Antes de recibir") } },
        { t: "Control orientado y pase lejos de la presión", pos: { f1: [33, 29] }, b: [34, 25], d: [[[22, 35], [34, 25]]], tips: { e1: TIP("Controla hacia el lado libre y pasa lejos de la presión") } },
        { t: "Si roban, atacan la portería pequeña: cambia el foco", tr: "p", pos: { f1: [34, 20] }, b: [34, 19], d: [[[34, 19], [34, 13]]],
          tips: { e1: TIP("Presiona enseguida al que ha robado", "El balón y la portería pequeña", "En el primer segundo"), e2: TIP("Cierra el camino a la portería") } }] },
      cond: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "Recibe: el control orientado que supera a un rival cuenta doble", pos: Object.assign({}, B5, { e4: [28, 22], f2: [24, 18] }), b: [16, 33], d: [[[16, 33], [28, 22]]],
          tips: { e4: TIP("Mira antes de recibir", "Dónde está el rival", "Mientras viaja el balón") } },
        { t: "Primer toque hacia el espacio y pase", pos: { e4: [34, 18] }, b: [34, 18], tips: { e4: TIP("Supera al rival con el primer toque") } }] }
    },
    perdua: {
      an: { v: "A", f: [["e1", "a"], ["e2", "a"], ["f1", "r"]], c: CUADRO(22, 22, 46, 46), p: [
        { t: "2 contra 1: atacamos", pos: { e1: [30, 40], e2: [40, 34], f1: [34, 30] }, b: [30, 39], tips: { e1: TIP("Conduce y busca el pase") } },
        { t: "¡Perdemos el balón!", tr: "p", pos: { f1: [33, 35] }, b: [33, 35],
          tips: { e1: TIP("Presiona enseguida al que ha robado", "El balón y el jugador que lo tiene", "En el primer segundo"), e2: TIP("Cierra su salida más fácil", "Hacia dónde quiere salir") } },
        { t: "Los dos presionan y recuperamos", tr: "r", pos: { e1: [32, 37], e2: [36, 32] }, b: [32, 36], tips: { e2: TIP("Si recuperamos, ofrécete para atacar") } }] },
      eco: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "5 contra 5 en campo corto: atacamos", pos: B5, b: [24, 19] },
        { t: "Pérdida: el foco cambia a recuperar", tr: "p", pos: { f2: [21, 17] }, b: [21, 17],
          tips: { e4: TIP("Presiona al que ha robado", "El balón", "En los primeros 3 segundos"), e5: TIP("Cierra el pase por dentro", "La línea de pase más fácil"), e2: TIP("Acércate para cerrar") } },
        { t: "Recuperamos en menos de 5 segundos", tr: "r", pos: { e4: [22, 19], e5: [28, 16], e2: [16, 24] }, b: [24, 17] }] },
      cond: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "Pérdida: el equipo con la condición presiona", tr: "p", pos: Object.assign({}, B5, { f2: [21, 17] }), b: [21, 17],
          tips: { e4: TIP("Presiona al que ha robado", "", "Enseguida") } },
        { t: "Robo antes de 5 segundos: suma un gol", tr: "r", pos: { e4: [22, 19], e5: [28, 16] }, b: [24, 17] }] }
    },
    sortida: {
      an: { v: "D", f: [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["f1", "r"]], c: [], p: [
        { t: "El portero tiene el balón: ¿quién está libre?", pos: { e1: [34, 102], e2: [18, 96], e3: [50, 96], e4: [34, 86], f1: [28, 92] }, b: [34, 101],
          tips: { e1: TIP("Mira a quién no llega el presionador", "El presionador y hacia dónde mira"), e4: TIP("Ofrécete de cara", "La espalda del presionador") } },
        { t: "El presionador cierra un lado: pase al otro central", pos: { f1: [24, 94] }, b: [49, 96], d: [[[34, 101], [49, 96]]], tips: { e3: TIP("Recibe orientado hacia delante", "", "Antes de recibir, mira") } },
        { t: "Pase al pivote libre, de cara", pos: { e4: [36, 86] }, b: [35, 87], d: [[[49, 96], [35, 87]]], tips: { e4: TIP("Recibe de cara y gira", "El espacio a tu espalda") } }] },
      eco: { v: "D", f: [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["e5", "a"], ["e6", "a"], ["f1", "r"], ["f2", "r"], ["f3", "r"], ["f4", "r"], ["f5", "r"]], c: [[0, 70, "blanco", "chino"], [68, 70, "blanco", "chino"]], p: [
        { t: "Salimos desde el portero", pos: { e1: [34, 102], e2: [18, 96], e3: [50, 96], e4: [34, 86], e5: [8, 84], e6: [60, 84], f1: [28, 92], f2: [42, 92], f3: [34, 80], f4: [16, 76], f5: [52, 76] }, b: [34, 101] },
        { t: "Presionan: busca al hombre libre", pos: { f1: [22, 95], f2: [44, 93] }, b: [49, 96], d: [[[34, 101], [49, 96]]], tips: { e3: TIP("Mira dónde está el libre", "El lateral y el pivote", "Antes de recibir") } },
        { t: "Superamos la primera línea: punto", pos: { e6: [60, 72] }, b: [60, 73], d: [[[49, 96], [60, 80]]], tips: { e6: TIP("Recibe y conduce hasta pasar la línea") } }] },
      cond: { v: "D", f: [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["f1", "r"], ["f2", "r"], ["f3", "r"]], c: [[0, 78, "blanco", "chino"], [68, 78, "blanco", "chino"]], p: [
        { t: "Presión rival sobre la salida", pos: { e1: [34, 102], e2: [18, 96], e3: [50, 96], e4: [34, 86], f1: [26, 92], f2: [42, 92], f3: [34, 82] }, b: [34, 101] },
        { t: "Pase al hombre libre que supera la línea: punto", pos: { e4: [40, 86], f3: [32, 83] }, b: [40, 86], d: [[[34, 101], [40, 86]]],
          tips: { e4: TIP("Muévete a la espalda del presionador", "Quién te presiona", "Cuando el portero levanta la cabeza") } }] }
    },
    pressio: {
      an: { v: "A", f: [["e1", "a"], ["e2", "a"], ["f1", "r"], ["f2", "r"]], c: CUADRO(20, 20, 48, 44), p: [
        { t: "El rival recibe de espaldas: señal de presión", pos: { e1: [34, 36], e2: [42, 40], f1: [34, 27], f2: [44, 28] }, b: [34, 28],
          tips: { e1: TIP("Prepárate para saltar", "Si recibe de espaldas o controla mal", "En cuanto recibe") } },
        { t: "Uno presiona, el otro cubre y cierra el pase", pos: { e1: [34, 30], e2: [39, 31] }, b: [34, 28],
          tips: { e1: TIP("Presiona sin dejarle girarse"), e2: TIP("Cubre a tu compañero y cierra el pase", "La línea de pase") } },
        { t: "Robo", tr: "r", pos: { e1: [34, 29] }, b: [34, 29] }] },
      eco: { v: "A", f: F6, c: CAMPO5, p: [
        { t: "6 contra 6. Pase atrás del rival: señal de presión", pos: Object.assign({}, B6, { f4: [30, 24] }), b: [34, 10], d: [[[30, 24], [34, 10]]],
          tips: { e5: TIP("Salta al que recibe", "El pase atrás", "Mientras viaja el balón") } },
        { t: "Presionamos juntos", pos: { e5: [38, 13], e4: [28, 15], e2: [22, 26], e3: [46, 26] }, b: [34, 10],
          tips: { e4: TIP("Cierra el pase a tu lado", "La línea de pase"), e2: TIP("Acompaña: equipo junto") } },
        { t: "Robo en campo contrario: 8 segundos para acabar", tr: "r", pos: { e5: [35, 11], f1: [32, 6] }, b: [35, 11] }] },
      cond: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "Presión coordinada del equipo con la condición", pos: Object.assign({}, B5, { e5: [38, 12], e4: [28, 14] }), b: [34, 10] },
        { t: "Robo y gol: vale doble", tr: "r", pos: { e5: [35, 9], f1: [30, 6] }, b: [34, 6], d: [[[35, 9], [34, 6]]] }] }
    },
    errada: {
      an: { v: "A", f: [["e1", "a"], ["e2", "a"], ["e3", "a"], ["e4", "a"], ["e5", "a"], ["e6", "a"]], c: [], p: [
        { t: "Un minuto de atención: la respiración o el tacto del balón", pos: { e1: [34, 20], e2: [43, 25], e3: [43, 35], e4: [34, 40], e5: [25, 35], e6: [25, 25] }, b: [34, 30],
          tips: { e1: TIP("Lleva la atención al balón en tus manos o a la respiración", "Lo que notas: el tacto, el peso, el aire", "Cuando te distraigas, date cuenta y vuelve") } }] },
      eco: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "Fallo un pase", tr: "p", pos: B5, b: [27, 30], d: [[[24, 20], [27, 30]]],
          tips: { e4: TIP("Haz tu gesto (subirte las medias) y vuelve", "La próxima jugada", "Justo después del error") } },
        { t: "Vuelvo a mi sitio y participo", pos: { e4: [27, 25], e2: [20, 30] }, b: [26, 30], tips: { e4: TIP("Ya estás en la jugada: ayuda a recuperar") } }] },
      cond: { v: "A", f: F5, c: CAMPO5, p: [
        { t: "Error de un jugador", tr: "p", pos: B5, b: [27, 30] },
        { t: "El que ha fallado participa en la acción siguiente: punto", tr: "r", pos: { e4: [26, 27], f4: [29, 33] }, b: [26, 28] }] }
    }
  };
  function dzJugada(d) {
    if (!d) return null;
    const jug = { vista: d.v || "A", rivales: true, fichas: [], pasos: [] };
    d.f.forEach((x) => { const o = { id: x[0], eq: x[1] }; if (x[2]) o.peto = x[2]; jug.fichas.push(o); });
    let pos = {};
    (d.c || []).forEach((c, i) => { jug.fichas.push({ id: "c" + i, eq: "c", forma: c[3] === "chino" ? "chino" : "cono", col: c[2] || "amarillo" }); pos["c" + i] = [c[0], c[1]]; });
    d.p.forEach((p) => {
      pos = Object.assign(clon(pos), clon(p.pos || {}));
      const o = { t: p.t, pos: clon(pos), b: (p.b || [34, 30]).slice(), tips: clon(p.tips || {}), dib: (p.d || []).map((x) => ({ k: "flecha", c: "#FFD23F", pts: [x[0].slice(), x[1].slice()], t: "" })) };
      if (p.tr) o.tr = p.tr;
      jug.pasos.push(o);
    });
    return sanJugada(jug);
  }

  // Juego parado → momento de atención interna (APRENS: no luchar, volver al estímulo relevante)
  const PARADO = { banda: "quién se mueve y dónde está el espacio", cornerF: "tu zona y la trayectoria del balón", cornerC: "el balón y tu zona", falta: "la señal del lanzador y la línea del fuera de juego" };

  // Análisis del partido: preguntas de un toque. La última opción de cada escala es la que «cuesta» (para la memoria).
  const BCR = ["Bien", "Regular", "Costó"], DUELO = ["Ganados", "Equilibrados", "Perdidos"], ZONA = ["Campo rival", "Medio campo", "Nuestro campo"], BANDA = ["Izquierda", "Centro", "Derecha"];
  const ANALISIS = [
    { g: "Recuperación y pérdida", p: [
      ["recupera", "¿Dónde recuperamos más balones?", ZONA, 2], ["pierde", "¿Dónde perdimos más balones?", ["Último tercio", "Medio campo", "Nuestro campo"], 2],
      ["activacion", "Activación después de pérdida", BCR, 2], ["errores", "Errores no forzados", ["Pocos", "Algunos", "Muchos"], 2], ["control", "Control y no perder el balón", BCR, 2]] },
    { g: "Duelos", p: [["duelos", "Duelos uno contra uno", DUELO, 2], ["aereos", "Duelos aéreos", DUELO, 2]] },
    { g: "Con balón", p: [
      ["salida", "Coordinación en la salida de balón", BCR, 2], ["romper", "Romper líneas y generar transición", BCR, 2],
      ["remate", "Remate y pegada: definir las ocasiones creadas", BCR, 2], ["bandaAtq", "¿Por dónde generamos más peligro?", BANDA, -1]] },
    { g: "Sin balón", p: [
      ["presion", "Presionar su salida y robar", BCR, 2], ["contemp", "Contemporizar y evitar contraataques con ocasiones claras", BCR, 2],
      ["bandaDef", "¿Por dónde nos generaron más peligro?", BANDA, -1]] }
  ];
  const AN_P = {}; ANALISIS.forEach((g) => g.p.forEach((x) => { AN_P[x[0]] = x; }));

  // ---------------------------------------------------------------- saneado
  // Todo lo que entra de fuera (enlace #ver=, copia de seguridad, localStorage)
  // se reconstruye campo a campo: ids, números, colores y tipos de una lista cerrada.
  const RE_ID = /^[A-Za-z0-9_]{1,16}$/;
  const FICHA = window.PZ_FICHA || { ETAPAS: {}, PUESTOS: {} };
  const ETAPAS_OK = FICHA.ETAPAS;
  const own = (o, k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);
  const MAX = { bloques: 60, pasos: 60, fichas: 120, dib: 60 };
  const txt = (v, n) => (typeof v === "string" || typeof v === "number" ? String(v).slice(0, n || 200) : "");
  const num = (v, a, b, def) => { const n = Number(v); return isFinite(n) ? lim(n, a, b) : def; };
  const pt = (v) => (Array.isArray(v) && v.length === 2 ? [num(v[0], -10, 78, 34), num(v[1], -10, 115, 52.5)] : null);
  const idOk = (v) => (typeof v === "string" && RE_ID.test(v) && !/^(__proto__|constructor|prototype)$/.test(v) ? v : null);
  const colOk = (v, def) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : def);
  const RE_MAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;
  const CONTACTO = ["tel", "tel2", "mail", "mail2", "nom1", "nom2"];
  function sanNota(n) {
    if (!n || typeof n !== "object") return null;
    const x = txt(n.x, 400); if (!x) return null;
    const o = { id: idOk(n.id) || uid(), t: ["f", "m", "c"].includes(n.t) ? n.t : "m", a: own(AREAS, n.a) ? n.a : "", s: own(CATS, n.s) ? n.s : "", x: x, f: /^\d{4}-\d{2}-\d{2}$/.test(n.f) ? n.f : "" };
    if (typeof n.k === "string" && /^[a-z0-9_]{1,30}$/.test(n.k)) o.k = n.k;
    return o;
  }
  function sanJugador(j) {
    const id = idOk(j && j.id); if (!id) return null;
    const o = { id: id, d: Math.round(num(j.d, 0, 99, 0)), n: txt(j.n, 60) || "Jugador", c: txt(j.c, 18), p: txt(j.p, 24) };
    const mod = num(j.mod, 0, 4102444800000, 0); if (mod) o.mod = mod;
    const al = (Array.isArray(j.alias) ? j.alias : []).filter(idOk).slice(0, 10); if (al.length) o.alias = al;
    const ns = (Array.isArray(j.notas) ? j.notas : []).slice(0, 80).map(sanNota).filter(Boolean); if (ns.length) o.notas = ns;
    if (idOk(j.foco) && ns.some((n) => n.id === j.foco && n.t === "m")) o.foco = j.foco; // foco fijado por el entrenador
    ["tel", "tel2"].forEach((k) => { const t = txt(j[k], 20).replace(/[^\d+]/g, ""); if (/^\+?\d{6,15}$/.test(t)) o[k] = t; });
    ["mail", "mail2"].forEach((k) => { const m = txt(j[k], 100).trim(); if (RE_MAIL.test(m)) o[k] = m; });
    ["nom1", "nom2"].forEach((k) => { const n = txt(j[k], 30).trim(); if (n) o[k] = n; });
    return o;
  }
  function sanJugada(g) {
    if (!g || !Array.isArray(g.fichas) || !Array.isArray(g.pasos)) return null;
    const fichas = [], ids = new Set();
    g.fichas.slice(0, MAX.fichas).forEach((f) => {
      const id = idOk(f && f.id); if (!id || id === "_b" || ids.has(id) || !["a", "r", "c", "b"].includes(f.eq)) return;
      const o = { id: id, eq: f.eq };
      if (idOk(f.pj)) o.pj = f.pj;
      if (f.eq === "c") { o.forma = f.forma === "chino" ? "chino" : "cono"; o.col = own(COLORES_CONO, f.col) ? f.col : "amarillo"; }
      if ((f.eq === "a" || f.eq === "r") && own(PETOS, f.peto)) o.peto = f.peto;
      ids.add(id); fichas.push(o);
    });
    const pasos = g.pasos.slice(0, MAX.pasos).map((p) => {
      p = p || {};
      const pos = {};
      ids.forEach((id) => { const q = pt(p.pos && p.pos[id]); if (q) pos[id] = q; });
      const tips = {};
      if (p.tips && typeof p.tips === "object") Object.keys(p.tips).forEach((id) => {
        if (!ids.has(id) || !p.tips[id]) return;
        const t = {}; ["m", "p", "f", "q"].forEach((k) => { const v = txt(p.tips[id][k], 300); if (v) t[k] = v; });
        if (Object.keys(t).length) tips[id] = t;
      });
      const dib = (Array.isArray(p.dib) ? p.dib : []).slice(0, MAX.dib).map((k) => {
        if (!k || !["linea", "flecha", "zona", "texto"].includes(k.k) || !Array.isArray(k.pts)) return null;
        const pts = k.pts.slice(0, 20).map((q) => (typeof q === "string" ? (ids.has(q) ? q : null) : pt(q))).filter(Boolean);
        if (!pts.length) return null;
        return { k: k.k, c: colOk(k.c, "#FFD23F"), pts: pts, t: txt(k.t, 40) };
      }).filter(Boolean);
      const o = { t: txt(p.t, 80), pos: pos, b: pt(p.b) || [34, 52.5], tips: tips, dib: dib };
      if (p.tr === "p" || p.tr === "r") o.tr = p.tr; // momento de transición (pérdida o recuperación)
      return o;
    });
    if (!pasos.length) return null;
    const o = { vista: ["C", "A", "D"].includes(g.vista) ? g.vista : "C", rivales: g.rivales !== false, fichas: fichas, pasos: pasos };
    if (g.tam === "p" || g.tam === "g") o.tam = g.tam;
    return o;
  }
  function sanPlan(p) {
    if (!p || !Array.isArray(p.bloques)) return null;
    const once = {};
    if (p.once && typeof p.once === "object") Object.keys(p.once).forEach((k) => { if (/^\d{1,2}$/.test(k) && idOk(p.once[k])) once[k] = p.once[k]; });
    const extra = {};
    if (p.extra && typeof p.extra === "object") Object.keys(p.extra).forEach((k) => {
      if (!/^\d{1,2}$/.test(k) || !Array.isArray(p.extra[k])) return;
      const l = p.extra[k].slice(0, 2).map((x) => idOk(x) || ""); if (l.some(Boolean)) extra[k] = l;
    });
    return {
      id: idOk(p.id) || uid(), mod: num(p.mod, 0, 4102444800000, 0), tipo: p.tipo === "partido" ? "partido" : "entreno",
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(p.fecha) ? p.fecha : "", titulo: txt(p.titulo, 80), rival: txt(p.rival, 60),
      objetivo: txt(p.objetivo, 600), notas: txt(p.notas, 800), clave: txt(p.clave, 30), fbn: txt(p.fbn, 600), fbr: txt(p.fbr, 40),
      an: sanAnalisis(p.an), anOc: Array.isArray(p.anOc) && p.anOc.length === 2 ? p.anOc.map((v) => Math.round(num(v, 0, 50, 0))) : null,
      sistema: own(SISTEMAS, p.sistema) ? p.sistema : "4231", once: once, extra: extra, sinNombres: p.sinNombres === true,
      bloques: p.bloques.slice(0, MAX.bloques).map((b) => {
        const o = {
          id: idOk(b && b.id) || uid(), cat: own(CATS, b && b.cat) ? b.cat : "otro", titulo: txt(b.titulo, 80),
          min: b.min === "" || b.min == null ? "" : Math.round(num(b.min, 0, 120, 0)), texto: txt(b.texto, 1200),
          consignas: txt(b.consignas, 800), fij: txt(b.fij, 300), cuando: txt(b.cuando, 300), jug: sanJugada(b.jug)
        };
        // método de los cinco pasos: fase, condición (y qué equipo la tiene) y preguntas para el entrenador
        if (own(FASES, b.fase)) o.fase = b.fase;
        const cond = txt(b.cond, 300); if (cond) o.cond = cond;
        if (cond && (b.condEq === "a" || b.condEq === "r" || own(PETOS, b.condEq))) o.condEq = b.condEq;
        const preg = txt(b.preg, 600); if (preg) o.preg = preg;
        // feedback: c cómo ha ido (1 costó, 2 regular, 3 bien), a estímulos relevantes (1 no, 2 a veces, 3 sí), n nota
        if (b.fb && typeof b.fb === "object") {
          const fb = {}; if ([1, 2, 3].includes(b.fb.c)) fb.c = b.fb.c; if ([1, 2, 3].includes(b.fb.a)) fb.a = b.fb.a;
          const n = txt(b.fb.n, 300); if (n) fb.n = n;
          if (Object.keys(fb).length) o.fb = fb;
        }
        return o;
      })
    };
  }
  function sanAnalisis(a) {
    if (!a || typeof a !== "object") return null;
    const o = {};
    Object.keys(a).forEach((k) => { if (own(AN_P, k) && Number.isInteger(a[k]) && a[k] >= 0 && a[k] < AN_P[k][2].length) o[k] = a[k]; });
    return Object.keys(o).length ? o : null;
  }
  function sanDB(o) {
    if (!o || typeof o !== "object" || !Array.isArray(o.planes) || !Array.isArray(o.plantilla)) return null;
    const limpiaAn = (p) => { if (!p.an) delete p.an; if (!p.anOc) delete p.anOc; return p; };
    return {
      v: 1,
      equipo: { nombre: txt(o.equipo && o.equipo.nombre, 60) || "Mi equipo", color: colOk(o.equipo && o.equipo.color, "#C8102E"), etapa: own(ETAPAS_OK, o.equipo && o.equipo.etapa) ? o.equipo.etapa : "" },
      plantilla: o.plantilla.map(sanJugador).filter(Boolean),
      planes: o.planes.map(sanPlan).filter(Boolean).map(limpiaAn)
    };
  }
  function sanPaquete(o) {
    if (!o || typeof o !== "object") return null;
    const plan = sanPlan(o.plan); if (!plan) return null;
    const jug = (Array.isArray(o.jug) ? o.jug : []).map(sanJugador).filter(Boolean);
    jug.forEach((j) => { delete j.notas; delete j.alias; delete j.mod; delete j.foco; CONTACTO.forEach((k) => delete j[k]); });
    const r = { v: 1, eq: { n: txt(o.eq && o.eq.n, 60), col: colOk(o.eq && o.eq.col, "#C8102E"), et: own(ETAPAS_OK, o.eq && o.eq.et) ? o.eq.et : "" }, plan: plan, jug: jug };
    // Enlace privado de un jugador: sus notas (solo si el jugador está en el paquete)
    const yo = idOk(o.yo);
    if (yo && jug.some((j) => j.id === yo)) {
      r.yo = yo; r.notas = (Array.isArray(o.notas) ? o.notas : []).slice(0, 80).map(sanNota).filter(Boolean);
      // qué notas salen en su ficha (priorizadas por lo que se trabaja) y su foco
      const ids = new Set(r.notas.map((n) => n.id));
      if (Array.isArray(o.prio)) r.prio = o.prio.filter((x) => idOk(x) && ids.has(x)).slice(0, 20);
      if (o.foco && typeof o.foco === "object" && idOk(o.foco.id) && ids.has(o.foco.id)) r.foco = { id: o.foco.id, fij: txt(o.foco.fij, 300) };
    }
    return r;
  }

  // ---------------------------------------------------------------- datos
  function dbVacia() {
    return { v: 1, equipo: { nombre: "Mi equipo", color: "#C8102E" }, plantilla: [], planes: [] };
  }
  let db;
  try { db = sanDB(JSON.parse(localStorage.getItem(CLAVE))) || dbVacia(); }
  catch (e) {
    // No se pierde nada: lo guardado se copia aparte antes de empezar con un cuaderno vacío.
    try { const crudo = localStorage.getItem(CLAVE); if (crudo && !localStorage.getItem(CLAVE + "_respaldo")) localStorage.setItem(CLAVE + "_respaldo", crudo); } catch (e2) { /* nada */ }
    db = dbVacia();
  }
  if (!db.equipo) db.equipo = dbVacia().equipo;
  let tGuardar = null;
  function guardar() {
    clearTimeout(tGuardar);
    tGuardar = setTimeout(() => {
      try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) { toast("No se ha podido guardar en este navegador."); }
    }, 250);
  }

  // ---------------------------------------------------------------- suscripción (solo en el sitio de pago)
  // En el sitio propio (p. ej. pizarra.aprens.net) /api/pizarra-config dice si los extras van con
  // suscripción. En aprens-app esa ruta no existe y todo sigue libre, como siempre.
  // Extras: enlaces cortos, ficha privada, cuaderno por enlace y sugerencias de Claude.
  // Gratis: cuaderno, pizarra y archivos. El código se guarda solo en este navegador.
  const SUS = { modo: false, activa: false, comprobado: false, codigo: "", plan: "", ia: null, altas: false, correo: false, portalLogin: "", manual: false, error: false };
  try { SUS.codigo = localStorage.getItem("pz_codigo") || ""; } catch (e) { SUS.codigo = ""; }
  const RE_CODIGO = /^[a-z0-9_-]{8,40}$/;
  const cabCodigo = () => (SUS.codigo ? { "x-codigo": SUS.codigo } : {});
  const extrasBloqueados = () => SUS.modo && !SUS.activa;
  async function cargarSuscripcion() {
    try {
      const r = await fetch("/api/pizarra-config", { cache: "no-store", headers: cabCodigo() });
      if (!r.ok || !/json/.test(r.headers.get("content-type") || "")) throw new Error("sin");
      const c = await r.json();
      SUS.modo = !!c.suscripcion; SUS.altas = !!c.altas; SUS.correo = !!c.correo;
      SUS.portalLogin = /^https:\/\/billing\.stripe\.com\//.test(c.portalLogin || "") ? c.portalLogin : "";
      const a = c.acceso || null;
      SUS.activa = !!(a && a.activa); SUS.error = !!(a && a.error);
      SUS.plan = SUS.activa ? String(a.plan || "") : ""; SUS.manual = !!(a && a.manual);
      SUS.ia = SUS.activa && a.ia ? { usadas: Number(a.ia.usadas) || 0, limite: Number(a.ia.limite) || 0 } : null;
    } catch (e) { SUS.modo = false; }
    SUS.comprobado = true;
    return SUS;
  }
  function htmlInvitacion(que) {
    return `<div class="aviso-sus" role="status"><p><b>${esc(que)} forma parte de la suscripción de entrenador.</b></p>
      <p class="peq">El cuaderno, la pizarra y el envío de archivos siguen siendo gratis. Mientras tanto, puedes enviar el plan como archivo.</p>
      <div class="fila">${SUS.altas ? `<a class="btn" href="/suscribirse.html">Ver la suscripción</a>` : ""}<button type="button" class="btn-sec" data-susir="1">Ya tengo un código</button></div></div>`;
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

  // Puestos equivalentes cuando el sistema no tiene el mismo código (orden de preferencia)
  const AFIN = { med: ["med", "mp", "piv"], piv: ["piv", "med"], mp: ["mp", "med"], del: ["del", "mp"], ext: ["ext"], lat: ["lat"], cen: ["cen"], por: ["por"] };
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
      sl.forEach((s, k) => { if (mapa[k] !== undefined) return; const afin = AFIN[s[2]] || [s[2]]; let j = -1; for (const fam of afin) { j = ref.findIndex((r, n) => !usados.has(n) && r[2] === fam); if (j >= 0) break; } if (j >= 0) { mapa[k] = j; usados.add(j); } });
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
      yo: null,
      pidsDe(f) {
        if (f.pj) return [f.pj];
        if (f.eq === "a" && /^a\d+$/.test(f.id)) {
          const k = f.id.slice(1), l = [];
          if ((plan.once || {})[k]) l.push(plan.once[k]);
          ((plan.extra || {})[k] || []).forEach((x) => { if (x && !l.includes(x)) l.push(x); });
          return l;
        }
        return [];
      },
      pidDe(f) {
        const l = this.pidsDe(f);
        if (this.yo && l.includes(this.yo)) return this.yo;
        return l[0] || null;
      },
      info(f) {
        if (f.eq === "c" || f.eq === "b") return { cono: true, nombre: f.eq === "b" ? "Balón" : "Cono", corto: "", dorsal: "" };
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
          pid: pid, otros: this.pidsDe(f).filter((x) => x !== pid).map((x) => porId[x]).filter(Boolean),
          nombre: j ? j.n : (rol || (f.eq === "a" ? "Jugador" : "Compañero (peto)")),
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
    const vis = (f) => f.eq !== "c" && f.eq !== "b" && P[f.id];
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
  const TAMANOS = { p: 0.62, m: 1, g: 1.25 };
  function trianguloCono(x, y, c, t) {
    t = t || 1;
    return `<path d="M ${x} ${y - 1.7 * t} L ${x + 1.3 * t} ${y + t} L ${x - 1.3 * t} ${y + t} Z" fill="${c}" stroke="#111" stroke-width="0.2"/><ellipse cx="${x}" cy="${y + t}" rx="${1.5 * t}" ry="${0.45 * t}" fill="${c}" stroke="#111" stroke-width="0.15"/>`;
  }

  // ---------------------------------------------------------------- mensajes sobre el campo (mostrar u ocultar)
  // Preferencia de este dispositivo; vale para todas las pizarras de la página.
  let burbOn = true;
  try { burbOn = localStorage.getItem("pz_burbujas") !== "0"; } catch (e) { /* nada */ }
  const burbujasVisibles = () => burbOn;
  const textoBurb = () => (burbOn ? "💬 Ocultar mensajes del campo" : "💬 Mostrar mensajes del campo");
  function ponerBurbujas(on) {
    burbOn = on;
    try { localStorage.setItem("pz_burbujas", on ? "1" : "0"); } catch (e) { /* nada */ }
    document.querySelectorAll('[data-a="burb"]').forEach((b) => { b.textContent = textoBurb(); });
    document.querySelectorAll(".pz").forEach((el) => { if (el.parentNode) el.parentNode.dispatchEvent(new CustomEvent("pz-burbujas")); });
  }

  // ---------------------------------------------------------------- componente pizarra
  function crearPizarra(host, o) {
    // o: {ctx, jug, cat, editable, yoPid, alCambiar}
    const ctx = o.ctx, jug = o.jug, ed = !!o.editable;
    let i = 0, sel = null, herr = "mover", color = "#FFD23F", bor = null, anim = null, selDib = -1;
    let hist = [], fut = [], mostrado = null, drag = null, reproduciendo = false, ultimaVoz = "";
    const colEq = { a: (db.equipo && db.equipo.color) || "#C8102E", r: "#2457C5" };
    const colorFicha = (f) => (f.peto && PETOS[f.peto]) || colEq[f.eq];
    if (o.equipoColor) colEq.a = o.equipoColor;

    function fichaYo() {
      if (!o.yoPid) return null;
      const f = jug.fichas.find((f) => f.eq !== "c" && ctx.pidsDe(f).includes(o.yoPid));
      return f ? f.id : null;
    }
    sel = fichaYo();

    host.innerHTML = `
      <div class="pz">
        <div class="pz-paso">
          <span class="num" data-r="num"></span>
          ${ed ? `<label class="sr" style="position:absolute;left:-999px" for="pzTit${host.id || ""}">Título del paso</label><input type="text" id="pzTit${host.id || ""}" data-r="tit" maxlength="80" placeholder="¿Qué pasa en este paso?">` : `<span class="titulo" data-r="tit" aria-live="polite"></span>`}
        </div>
        ${ed ? `<div class="pz-tr"><label for="pzTr${host.id || ""}">Momento</label><select id="pzTr${host.id || ""}" data-r="tr"><option value="">Juego normal</option><option value="p">${TRANS.p}</option><option value="r">${TRANS.r}</option></select></div>`
          : `<p class="pz-trban" data-r="trban" hidden></p>`}
        <div class="pz-campo" data-r="campo">
          <svg data-r="svg" role="group" aria-label="Campo de fútbol con las fichas de los jugadores"></svg>
          <div class="burbuja" data-r="burb" hidden></div>
        </div>
        <div class="pz-ctrl">
          <button type="button" class="btn-peq" data-a="ant" aria-label="Paso anterior">◀</button>
          <button type="button" class="btn-peq" data-a="play">▶ Reproducir</button>
          <button type="button" class="btn-peq" data-a="burb">${textoBurb()}</button>
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
            <button type="button" class="btn-peq" data-h="rect">▭ Rectángulo</button>
            <button type="button" class="btn-peq" data-h="zona">⬠ Zona libre</button>
            <button type="button" class="btn-peq" data-h="texto">T Texto</button>
          </div>
          <div class="grupo" data-r="zonaok" hidden><span class="lbl"></span>
            <button type="button" class="btn-peq" data-a="cerrarZona">✔ Cerrar zona</button>
            <button type="button" class="btn-peq" data-a="quitarPunto">↩ Quitar último punto</button>
            <button type="button" class="btn-peq peligro" data-a="cancelarDib">✕ Cancelar</button>
          </div>
          <div class="grupo" role="group" aria-label="Borrar dibujos"><span class="lbl">Dibujos</span>
            <button type="button" class="btn-peq peligro" data-a="borrarDib">🗑 Borrar el seleccionado</button>
            <button type="button" class="btn-peq peligro" data-a="borrarTodosDib">Borrar todos los del paso</button>
          </div>
          <div class="grupo" role="group" aria-label="Color del dibujo"><span class="lbl">Color</span>
            ${COLORES_DIB.map((c) => `<button type="button" class="color-btn" data-col="${c[0]}" style="background:${c[0]}" aria-label="Color ${c[1]}"></button>`).join("")}
          </div>
          <div class="grupo"><span class="lbl">Añadir</span>
            <button type="button" class="btn-peq" data-a="masA">＋ Nuestro</button>
            <button type="button" class="btn-peq" data-a="masR">＋ Rival / peto</button>
            <select data-r="petoNuevo" aria-label="Color del peto para las fichas que añadas" style="width:auto;min-height:36px;padding:4px 8px">
              <option value="">Peto: color normal</option>${Object.keys(PETOS).map((k) => `<option value="${k}">Peto ${k}</option>`).join("")}
            </select>
            <button type="button" class="btn-peq" data-a="masB">⚽ ＋ Balón</button>
            <select data-r="conoCol" aria-label="Color del cono" style="width:auto;min-height:36px;padding:4px 8px">
              ${Object.keys(COLORES_CONO).map((k) => `<option value="${k}">${k}</option>`).join("")}
            </select>
            <button type="button" class="btn-peq" data-a="masCono">▲ Cono</button>
            <button type="button" class="btn-peq" data-a="masChino">◖ Chino</button>
          </div>
          <div class="grupo"><span class="lbl">Jugadores</span>
            <button type="button" class="btn-peq" data-a="asignar" aria-expanded="false">👥 Asignar jugadores y colores</button>
          </div>
          <div class="asignar" data-r="asignar" hidden></div>
          <div class="grupo"><span class="lbl">Ver</span>
            <select data-r="tam" aria-label="Tamaño de las fichas" style="width:auto;min-height:36px;padding:4px 8px">
              <option value="p">Fichas pequeñas</option><option value="m">Fichas normales</option><option value="g">Fichas grandes</option>
            </select>
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
          if (a && b && dist(a, b) > 1.5) s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${f.eq === "b" ? "#FFD23F" : f.eq === "a" ? "#fff" : "#BFD4FF"}" stroke-width="0.35" stroke-dasharray="1 0.8" stroke-opacity="0.85" marker-end="url(#fl-${uidM})"/>`;
        });
        if (dist(prev.b, p.b) > 1.5) s += `<line x1="${prev.b[0]}" y1="${prev.b[1]}" x2="${p.b[0]}" y2="${p.b[1]}" stroke="#FFD23F" stroke-width="0.45" stroke-dasharray="1.4 0.9" marker-end="url(#flb-${uidM})"/>`;
      }
      const T = TAMANOS[jug.tam] || 1;
      // conos primero
      jug.fichas.forEach((f) => {
        if (f.eq !== "c" || !P[f.id]) return;
        const [x, y] = P[f.id], c = COLORES_CONO[f.col] || COLORES_CONO.amarillo;
        const sh = f.forma === "chino" ? `<ellipse cx="${x}" cy="${y}" rx="${1.3 * T}" ry="${0.75 * T}" fill="${c}" stroke="#111" stroke-width="0.2"/>` : trianguloCono(x, y, c, T);
        s += `<g class="ficha" data-id="${f.id}" ${ed ? `tabindex="0" role="button" aria-label="${f.forma === "chino" ? "Chino" : "Cono"} ${esc(f.col)}"` : ""}>${sh}${sel === f.id ? `<circle cx="${x}" cy="${y}" r="${2.4 * T}" fill="none" stroke="#FFD23F" stroke-width="0.4"/>` : ""}</g>`;
      });
      const yoId = fichaYo();
      jug.fichas.forEach((f) => {
        if (f.eq === "c" || f.eq === "b" || !visible(f) || !P[f.id]) return;
        const [x, y] = P[f.id], inf = ctx.info(f);
        const col = colorFicha(f), claro = PETOS_CLAROS.has(f.peto);
        const num = inf.dorsal || inf.cod || "";
        const fs = (num.length > 2 ? 1.5 : 2.1) * T;
        const etiqueta = (inf.corto && inf.corto !== num ? inf.corto : "") + (inf.otros && inf.otros.length ? " +" + inf.otros.length : "");
        const label = (inf.dorsal ? inf.dorsal + " " : "") + (inf.nombre || "") + (inf.rol && !inf.rival ? ", " + inf.rol : "");
        s += `<g class="ficha" data-id="${f.id}" tabindex="0" role="button" aria-label="${esc(label)}" aria-pressed="${sel === f.id}">`;
        if (yoId === f.id) s += `<circle cx="${x}" cy="${y}" r="${3.7 * T}" fill="rgba(255,210,63,.35)" stroke="#FFD23F" stroke-width="0.35"/>`;
        if (sel === f.id) s += `<circle cx="${x}" cy="${y}" r="${3.2 * T}" fill="none" stroke="#FFD23F" stroke-width="0.55"/>`;
        s += `<circle cx="${x}" cy="${y}" r="${2.35 * T}" fill="${col}" stroke="#fff" stroke-width="${0.4 * Math.min(1, T + 0.2)}"/>`;
        s += `<text x="${x}" y="${y + fs * 0.36}" font-size="${fs}" font-weight="800" fill="${claro ? "#111" : "#fff"}" text-anchor="middle">${esc(num)}</text>`;
        if (etiqueta) s += `<text x="${x}" y="${y + 2.35 * T + 2.2 * Math.max(0.8, T)}" font-size="${1.9 * Math.max(0.8, T)}" font-weight="700" fill="#fff" text-anchor="middle" stroke="#0C2414" stroke-width="0.45" paint-order="stroke">${esc(etiqueta.slice(0, 14))}</text>`;
        s += `</g>`;
      });
      // balones extra (ejercicios con varios balones)
      const rb = 1.15 * Math.max(0.8, T), rn = 0.42 * Math.max(0.8, T);
      jug.fichas.forEach((f) => {
        if (f.eq !== "b" || !P[f.id]) return;
        const [x, y] = P[f.id];
        s += `<g class="ficha" data-id="${f.id}" ${ed ? `tabindex="0" role="button" aria-label="Balón"` : ""}><circle cx="${x}" cy="${y}" r="${rb}" fill="#fff" stroke="#111" stroke-width="0.25"/><circle cx="${x}" cy="${y}" r="${rn}" fill="#111"/>${sel === f.id ? `<circle cx="${x}" cy="${y}" r="${rb + 0.9}" fill="none" stroke="#FFD23F" stroke-width="0.4"/>` : ""}</g>`;
      });
      const b = P._b;
      s += `<g class="ficha" data-id="_b" ${ed ? `tabindex="0" role="button" aria-label="Balón"` : ""}><circle cx="${b[0]}" cy="${b[1]}" r="${1.15 * Math.max(0.8, T)}" fill="#fff" stroke="#111" stroke-width="0.25"/><circle cx="${b[0]}" cy="${b[1]}" r="${0.42 * Math.max(0.8, T)}" fill="#111"/></g>`;
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
      if (bor && bor.k === "rect") {
        const a = bor.pts[0], c2 = bor.cursor;
        if (a && c2) d += `<rect x="${Math.min(a[0], c2[0])}" y="${Math.min(a[1], c2[1])}" width="${Math.abs(c2[0] - a[0])}" height="${Math.abs(c2[1] - a[1])}" fill="${bor.c}" fill-opacity="0.2" stroke="${bor.c}" stroke-width="0.5" stroke-dasharray="0.8 0.6"/>`;
        if (a) d += `<circle cx="${a[0]}" cy="${a[1]}" r="0.7" fill="${bor.c}"/>`;
      } else if (bor) {
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
      if (!burbujasVisibles() || !f || f.eq === "c" || f.eq === "b" || !P[sel] || !visible(f)) { burb.hidden = true; return; }
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
      const inB = ctx.info(f);
      const quienB = [inB.dorsal, inB.corto || inB.nombre].filter(Boolean).join(" ") + (inB.otros && inB.otros.length ? " (y " + inB.otros.map((x) => x.c || x.n).join(", ") + ")" : "");
      burb.innerHTML = `<b>${esc(quienB)}</b>${quienB ? ": " : ""}${esc(txt.length > 110 ? txt.slice(0, 107) + "…" : txt)}`;
      burb.hidden = false;
      const cw = campo.clientWidth || 1, bw = burb.offsetWidth;
      burb.style.left = lim((left / 100) * cw, bw / 2 + 6, Math.max(bw / 2 + 6, cw - bw / 2 - 6)) + "px";
      burb.style.top = top + "%";
      burb.classList.toggle("abajo", top < 30);
      burb.hidden = false;
    }

    // ----- asignar jugadores y colores a todas las fichas del ejercicio
    function pintarAsignar() {
      const cont = R("asignar"); if (!cont || cont.hidden) return;
      // conserva lo que ya estaba marcado para añadir al repintar
      const marcados = new Set($$("[data-asignuevo]", cont).filter((x) => x.checked).map((x) => x.dataset.asignuevo));
      const eqPrev = R("asEq") ? R("asEq").value : "a", petoPrev = R("asPeto") ? R("asPeto").value : "";
      const fichas = jug.fichas.filter((f) => f.eq === "a" || f.eq === "r");
      const pl = ctx.jugadores.slice().sort((a, b) => a.d - b.d);
      const usados = new Set(); fichas.forEach((f) => ctx.pidsDe(f).forEach((x) => usados.add(x)));
      const libres = pl.filter((j) => !usados.has(j.id));
      const opPetos = (f) => `<option value="">${f.eq === "a" ? "Color del equipo" : "Azul (rival)"}</option>` + Object.keys(PETOS).map((k) => `<option value="${k}" ${f.peto === k ? "selected" : ""}>${k}</option>`).join("");
      cont.innerHTML = `
        <p class="peq">Pon a cada ficha un jugador de la plantilla (sale con su dorsal y nombre) y el color de su peto para hacer los equipos del ejercicio.</p>
        <table class="tabla-asig"><thead><tr><th scope="col">Ficha</th><th scope="col">Jugador</th><th scope="col">Peto</th></tr></thead><tbody>
        ${fichas.map((f) => {
          const inf = ctx.info(f), col = colorFicha(f), pid = ctx.pidsDe(f)[0] || "";
          return `<tr><td><span class="dorsal mini" style="background:${col};${PETOS_CLAROS.has(f.peto) ? "color:#111;" : ""}">${esc(inf.dorsal || inf.cod || "·")}</span></td>
            <td><label class="sr-only" for="as-j-${f.id}">Jugador de la ficha ${esc(inf.cod || f.id)}</label><select id="as-j-${f.id}" data-asigpj="${f.id}"><option value="">${f.eq === "r" ? "Sin nombre" : "Sin asignar"}</option>${pl.map((j) => `<option value="${esc(j.id)}" ${pid === j.id ? "selected" : ""}>${esc(j.d)} · ${esc(j.c || j.n)}</option>`).join("")}</select></td>
            <td><label class="sr-only" for="as-p-${f.id}">Peto de la ficha ${esc(inf.cod || f.id)}</label><select id="as-p-${f.id}" data-asigpeto="${f.id}">${opPetos(f)}</select></td></tr>`;
        }).join("")}
        </tbody></table>
        ${libres.length ? `<div class="asig-nuevos"><p class="subtit">Añadir jugadores que aún no están</p>
          <div class="asig-lista">${libres.map((j) => `<label><input type="checkbox" data-asignuevo="${esc(j.id)}" ${marcados.has(j.id) ? "checked" : ""}> ${esc(j.d)} · ${esc(j.c || j.n)}</label>`).join("")}</div>
          <div class="fila">
            <label class="sr-only" for="asEq">Equipo</label><select id="asEq" data-r="asEq" style="width:auto"><option value="a">Con nuestro equipo</option><option value="r" ${eqPrev === "r" ? "selected" : ""}>Con el otro equipo</option></select>
            <label class="sr-only" for="asPeto">Peto</label><select id="asPeto" data-r="asPeto" style="width:auto"><option value="">Peto: color normal</option>${Object.keys(PETOS).map((k) => `<option value="${k}" ${petoPrev === k ? "selected" : ""}>Peto ${k}</option>`).join("")}</select>
            <button type="button" class="btn-peq" data-a="asignarTodos">Marcar todos</button>
            <button type="button" class="btn-peq" data-a="anadirSel" style="background:var(--verde);color:#fff">＋ Añadir seleccionados</button>
          </div></div>` : `<p class="peq">Todos los jugadores de la plantilla ya tienen ficha en este ejercicio.</p>`}`;
    }
    function anadirSeleccionados() {
      const cont = R("asignar");
      const ids = $$("[data-asignuevo]", cont).filter((x) => x.checked).map((x) => x.dataset.asignuevo);
      if (!ids.length) { toast("Marca los jugadores que quieres añadir"); return; }
      if (jug.fichas.length + ids.length > MAX.fichas) { toast("No caben tantas fichas"); return; }
      const eq = R("asEq").value === "r" ? "r" : "a", peto = R("asPeto").value;
      snap();
      const vb = VISTAS[jug.vista] || VISTAS.C;
      const fila = eq === "a" ? vb[1] + vb[3] - 5 : vb[1] + 5; // en una fila, abajo o arriba
      ids.forEach((pid, k) => {
        const pref = eq === "a" ? "e" : "f";
        let n = 1; while (jug.fichas.some((f) => f.id === pref + n)) n++;
        const f = { id: pref + n, eq: eq, pj: pid };
        if (own(PETOS, peto)) f.peto = peto;
        jug.fichas.push(f);
        const x = lim(4 + (k % 9) * 7.5, -4, 72), y = fila + (eq === "a" ? -1 : 1) * Math.floor(k / 9) * 6.5;
        jug.pasos.forEach((p) => { p.pos[f.id] = [r05(x), r05(y)]; });
      });
      if (eq === "r") jug.rivales = true;
      cambio(); pintarTodo(); pintarAsignar();
      toast(ids.length + " jugador" + (ids.length === 1 ? "" : "es") + " añadido" + (ids.length === 1 ? "" : "s") + ": colócalos en el campo");
    }
    function pintarInfo() {
      const p = paso();
      const tot = jug.pasos.length;
      R("num").textContent = "Paso " + (i + 1) + "/" + tot;
      const t = R("tit");
      if (ed) { if (document.activeElement !== t) t.value = p.t || ""; } else t.textContent = p.t || "";
      if (ed) { const tr = R("tr"); if (tr) tr.value = p.tr || ""; }
      else { const ban = R("trban"); if (ban) { ban.hidden = !p.tr; ban.className = "pz-trban" + (p.tr ? " tr-" + p.tr : ""); ban.textContent = p.tr ? TRANS_JUG[p.tr] : ""; } }
      host.querySelector('[data-a="ant"]').disabled = i === 0 || reproduciendo;
      host.querySelector('[data-a="sig"]').disabled = i >= tot - 1 || reproduciendo;
      host.querySelector('[data-a="play"]').textContent = reproduciendo ? "■ Parar" : "▶ Reproducir";
      if (ed) {
        host.querySelector('[data-a="menosPaso"]').disabled = tot < 2;
        host.querySelector('[data-a="masPaso"]').disabled = tot >= MAX.pasos;
        host.querySelector('[data-a="deshacer"]').disabled = !hist.length;
        host.querySelector('[data-a="rehacer"]').disabled = !fut.length;
        $$("[data-h]", host).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.h === herr)));
        $$("[data-col]", host).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.col === color)));
        R("vista").value = jug.vista || "C";
        const rb = host.querySelector('[data-a="rivales"]');
        rb.setAttribute("aria-pressed", String(jug.rivales !== false));
        rb.textContent = jug.rivales !== false ? "Rivales visibles" : "Rivales ocultos";
        R("zonaok").hidden = !bor;
        host.querySelector('[data-a="cerrarZona"]').hidden = !(bor && bor.k === "zona");
        host.querySelector('[data-a="quitarPunto"]').hidden = !(bor && bor.k === "zona" && bor.pts.length);
        host.querySelector('[data-a="borrarDib"]').disabled = selDib < 0;
        host.querySelector('[data-a="borrarTodosDib"]').disabled = !(paso().dib || []).length;
        R("tam").value = jug.tam || "m";
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
      if (f.eq === "b") {
        info.innerHTML = `<h3>⚽ Balón</h3>${ed ? `<p class="peq">Arrástralo para colocarlo. El balón principal (el que usan los mensajes) es el que estaba al crear la pizarra.</p><button type="button" class="btn-peq peligro" data-a="quitar">Quitar de la pizarra</button>` : ""}`;
        return;
      }
      if (f.eq === "c") {
        info.innerHTML = `<h3>${f.forma === "chino" ? "Chino" : "Cono"} ${esc(f.col)}</h3>${ed ? `<button type="button" class="btn-peq peligro" data-a="quitar">Quitar de la pizarra</button>` : ""}`;
        return;
      }
      const inf = ctx.info(f);
      const tips = (p.tips || {})[f.id] || {};
      const col = colorFicha(f);
      let h = `<h3><span class="dorsal" style="background:${col};${PETOS_CLAROS.has(f.peto) ? "color:#111;" : ""}">${esc(inf.dorsal || inf.cod || "·")}</span>${esc(inf.nombre)}${inf.rol && !inf.rival ? ` <span class="peq">· ${esc(inf.rol)}</span>` : ""}</h3>`;
      if (inf.otros && inf.otros.length) h += `<p class="peq">También en este puesto: ${inf.otros.map((x) => esc(x.d + " " + (x.c || x.n))).join(", ")}. Los mensajes valen para todos.</p>`;
      if (ed) {
        if (!inf.rival || f.pj || f.eq === "r") {
          const opts = ctx.jugadores.slice().sort((a, b) => a.d - b.d).map((j) => `<option value="${esc(j.id)}" ${ctx.pidsDe(f)[0] === j.id ? "selected" : ""}>${esc(j.d)} · ${esc(j.c || j.n)}</option>`).join("");
          h += `<div class="campo-f"><label for="selPj">Jugador en esta ficha${/^a\d+$/.test(f.id) ? " (cambia también el principal de la alineación)" : ""}</label><select id="selPj" data-pj><option value="">${f.eq === "r" ? "Rival sin nombre" : "Sin asignar"}</option>${opts}</select></div>`;
        }
        h += `<div class="campo-f"><label for="selPeto">Color del peto</label><select id="selPeto" data-peto><option value="">${f.eq === "a" ? "Color del equipo" : "Azul (rival)"}</option>${Object.keys(PETOS).map((k) => `<option value="${k}" ${f.peto === k ? "selected" : ""}>${k}</option>`).join("")}</select></div>`;
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
      if (!ed && voz.ok) h += `<div class="fila" style="margin-top:8px"><button type="button" class="btn-peq" data-a="leerInfo">🔊 Escuchar</button></div>`;
      if (ed && o.abrirNotas && !inf.rival && ctx.pidDe(f)) h += `<button type="button" class="btn-peq" data-a="notas" style="margin-top:8px">📝 Notas de ${esc(inf.corto || inf.nombre)} (puntos fuertes y a mejorar)</button>`;
      if (o.abrirFicha && !inf.rival && ctx.pidDe(f)) h += `<button type="button" class="btn ficha-btn" data-a="ficha">📋 Ficha completa de ${esc(inf.corto || inf.nombre)}: qué mirar y qué entrenar</button>`;
      info.innerHTML = h;
      if (!ed && voz.ok && o.vozAuto && o.vozAuto() && o.yoPid && ctx.pidsDe(f).includes(o.yoPid)) {
        const marca = i + "|" + f.id;
        if (marca !== ultimaVoz) {
          ultimaVoz = marca;
          const t = (p.tips || {})[f.id] || {};
          const ms = analizar(ctx, jug, p, f.id, o.cat);
          const k = ms.find((m) => m.clave);
          voz.hablar(["Paso " + (i + 1) + ". " + (p.t || ""), t.m, t.f && "Fíjate en: " + t.f, t.q && "Cuándo: " + t.q, k && k.txt].filter(Boolean).join(". "));
        }
      }
    }

    function pintarTodo() { pintarCampo(); pintar(posPaso(paso())); pintarInfo(); pintarAsignar(); }

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
        const tocaEsperar = () => o.vozAuto && o.vozAuto() && voz.hablando();
        const avanzar = () => { if (tocaEsperar()) luego(avanzar, 300); else animarA(i + 1, 1200, () => { if (s0 === sesion) luego(siguiente, 900); }); };
        luego(avanzar, 300);
      };
      luego(siguiente, 700);
    }

    // ----- acciones de edición
    function anadirFicha(eq, extra) {
      snap();
      const pref = eq === "c" ? "c" : eq === "b" ? "b" : eq === "a" ? "e" : "f";
      let n = 1; while (jug.fichas.some((f) => f.id === pref + n)) n++;
      const f = Object.assign({ id: pref + n, eq: eq }, extra || {});
      jug.fichas.push(f);
      const vb = VISTAS[jug.vista] || VISTAS.C;
      const p0 = [eq === "c" ? 34 : eq === "b" ? 36 : eq === "a" ? 30 : 38, vb[1] + vb[3] / 2 + (eq === "b" ? 3 : 0)];
      jug.pasos.forEach((p) => { p.pos[f.id] = p0.slice(); });
      if (eq === "r") jug.rivales = true;
      sel = f.id; selDib = -1; cambio(); pintarTodo();
    }

    function terminarDibujo() {
      if (!bor) return;
      if (bor.k === "rect") {
        if (bor.pts.length === 2) {
          const [a, b] = bor.pts;
          if (Math.abs(a[0] - b[0]) >= 1 && Math.abs(a[1] - b[1]) >= 1) bor = { k: "zona", c: bor.c, pts: [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]] };
          else { bor = null; pintarTodo(); toast("El rectángulo es demasiado pequeño"); return; }
        } else { bor = null; pintarTodo(); return; }
      }
      const min = bor.k === "zona" ? 3 : bor.k === "texto" ? 1 : 2;
      if (bor.pts.length >= min) {
        snap();
        const p = paso(); p.dib = p.dib || [];
        if (p.dib.length >= MAX.dib) { bor = null; toast("Has llegado al máximo de dibujos en este paso"); pintarTodo(); return; }
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
        if (herr === "rect") {
          const esq = [r05(lim(q[0], -6, 74)), r05(lim(q[1], -6, 111))];
          if (bor && bor.k === "rect" && bor.pts.length === 1) { bor.pts.push(esq); bor.cursor = null; terminarDibujo(); return; }
          bor = { k: "rect", c: color, pts: [esq], arrastre: true, x0: q };
          svg.setPointerCapture(e.pointerId);
          pintar(P); pintarInfo();
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
      if (bor && (bor.arrastre || (bor.k === "rect" && bor.pts.length === 1 && e.pointerType === "mouse"))) { bor.cursor = q; pintar(mostrado || posPaso(paso())); return; }
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
        if (bor.k === "rect") {
          if (dist(q, bor.x0) > 2) { bor.pts.push([r05(lim(q[0], -6, 74)), r05(lim(q[1], -6, 111))]); terminarDibujo(); }
          else { bor.cursor = null; pintar(mostrado || posPaso(paso())); toast("Ahora toca la esquina opuesta"); }
          return;
        }
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
      if (b.dataset.h) { herr = b.dataset.h; bor = null; selDib = -1; pintar(mostrado || posPaso(paso())); pintarInfo(); if (herr !== "mover") toast(herr === "rect" ? "Arrastra para dibujar el rectángulo, o toca dos esquinas opuestas" : herr === "zona" ? "Toca los vértices de la zona y pulsa «Cerrar zona». Si te equivocas, «Quitar último punto»" : herr === "texto" ? "Toca donde quieras poner el texto" : "Arrastra, o toca el inicio y luego el final. Si empiezas en una ficha, la línea la sigue."); return; }
      if (b.dataset.col) { color = b.dataset.col; if (selDib >= 0) { snap(); paso().dib[selDib].c = color; cambio(); pintar(posPaso(paso())); } pintarInfo(); return; }
      if (a === "ant" && i > 0) animarA(i - 1, 700);
      else if (a === "sig" && i < jug.pasos.length - 1) animarA(i + 1, 1100);
      else if (a === "play") reproducir();
      else if (a === "burb") {
        ponerBurbujas(!burbujasVisibles());
        ponerBurbuja(mostrado || posPaso(paso()));
      }
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
      else if (a === "leerInfo") voz.alternar(info, b);
      else if (a === "notas" && sel && o.abrirNotas) { const f = jug.fichas.find((x) => x.id === sel); if (f && ctx.pidDe(f)) o.abrirNotas(ctx.pidDe(f)); }
      else if (a === "ficha" && sel) { const f = jug.fichas.find((x) => x.id === sel); if (f) o.abrirFicha(ctx.pidDe(f)); }
      else if (a === "cancelarDib") { bor = null; pintarTodo(); }
      else if (/^mas[ARCB]|^masChino/.test(a) && jug.fichas.length >= MAX.fichas) toast("Has llegado al máximo de fichas");
      else if (a === "masA" || a === "masR") { const pn = R("petoNuevo").value; anadirFicha(a === "masA" ? "a" : "r", own(PETOS, pn) ? { peto: pn } : null); }
      else if (a === "masB") anadirFicha("b");
      else if (a === "asignar") { const c = R("asignar"); c.hidden = !c.hidden; b.setAttribute("aria-expanded", String(!c.hidden)); pintarAsignar(); }
      else if (a === "asignarTodos") $$("[data-asignuevo]", R("asignar")).forEach((x) => { x.checked = true; });
      else if (a === "anadirSel") anadirSeleccionados();
      else if (a === "masCono") anadirFicha("c", { forma: "cono", col: R("conoCol").value });
      else if (a === "masChino") anadirFicha("c", { forma: "chino", col: R("conoCol").value });
      else if (a === "rivales") { snap(); jug.rivales = jug.rivales === false; cambio(); pintarTodo(); }
      else if (a === "quitarPunto" && bor && bor.pts.length) { bor.pts.pop(); if (!bor.pts.length && bor.k !== "zona") bor = null; pintar(mostrado || posPaso(paso())); pintarInfo(); }
      else if (a === "borrarTodosDib" && (paso().dib || []).length) {
        if (!window.confirm("¿Borrar todos los dibujos de este paso?")) return;
        snap(); paso().dib = []; selDib = -1; cambio(); pintarTodo();
      }
      else if (a === "borrarDib" && selDib < 0) toast("Con «✋ Mover», toca primero el dibujo que quieres borrar");
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
      if (t.dataset.r === "tr") { snap(); if (t.value === "p" || t.value === "r") paso().tr = t.value; else delete paso().tr; cambio(); pintarInfo(); return; }
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
      if (t.dataset.r === "tam") { snap(); if (t.value === "m") delete jug.tam; else jug.tam = t.value; cambio(); pintarTodo(); return; }
      if (t.dataset.asigpj !== undefined || t.dataset.asigpeto !== undefined) {
        const id = t.dataset.asigpj || t.dataset.asigpeto;
        const f = jug.fichas.find((x) => x.id === id); if (!f) return;
        snap();
        if (t.dataset.asigpeto !== undefined) { if (own(PETOS, t.value)) f.peto = t.value; else delete f.peto; }
        else if (/^a\d+$/.test(f.id)) { ctx.plan.once = ctx.plan.once || {}; if (t.value) ctx.plan.once[f.id.slice(1)] = t.value; else delete ctx.plan.once[f.id.slice(1)]; delete f.pj; }
        else if (t.value) f.pj = t.value; else delete f.pj;
        cambio(); pintar(posPaso(paso())); pintarInfo(); pintarAsignar();
        const n = host.querySelector("#" + t.id); if (n) n.focus();
        return;
      }
      if (t.hasAttribute("data-peto")) {
        const f = jug.fichas.find((x) => x.id === sel); if (!f) return;
        snap(); if (own(PETOS, t.value)) f.peto = t.value; else delete f.peto;
        cambio(); pintar(posPaso(paso())); pintarInfo(); return;
      }
      if (t.hasAttribute("data-pj")) {
        const f = jug.fichas.find((x) => x.id === sel); if (!f) return;
        snap();
        if (/^a\d+$/.test(f.id)) { ctx.plan.once = ctx.plan.once || {}; if (t.value) ctx.plan.once[f.id.slice(1)] = t.value; else delete ctx.plan.once[f.id.slice(1)]; delete f.pj; }
        else if (t.value) f.pj = t.value; else delete f.pj;
        cambio(); pintar(posPaso(paso())); pintarInfo();
      }
    });

    pintarTodo();
    host.addEventListener("pz-burbujas", () => ponerBurbuja(mostrado || posPaso(paso())));
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

  function esEntrenador() {
    if (db.plantilla.length || db.planes.length) return true;
    try { return localStorage.getItem("pz_modo") === "entrenador"; } catch (e) { return false; }
  }
  function pantInicio() {
    $("#nav").hidden = true;
    $("#ttApp").textContent = "Pizarra";
    $("#ttSub").textContent = "Entrenos y partidos del equipo";
    let ult = null; try { ult = JSON.parse(localStorage.getItem("pz_ultimo") || "null"); } catch (e) { ult = null; }
    app.innerHTML = `
      <h1>Hola</h1>
      <div class="tarjeta inicio-jug">
        <h2 style="margin-top:0">Soy jugador</h2>
        <p>Tu entrenador te ha enviado un archivo. Si aún no lo has guardado, mantenlo pulsado en WhatsApp y elige «Guardar» (o «Descargar»).</p>
        <label class="btn grande" for="abrirFileJ" style="cursor:pointer">📂 Soy jugador: abrir el archivo</label>
        <input type="file" id="abrirFileJ" accept=".html,.htm,.txt,.json,text/html,text/plain,application/json" style="position:absolute;left:-999px">
        ${ult && ult.plan ? `<div class="fila" style="margin-top:10px"><button type="button" class="btn-sec" data-ultimo="1">Volver a «${esc(String(ult.plan.titulo || "último plan").slice(0, 40))}»</button><button type="button" class="btn-peq peligro" data-olvidar="1" aria-label="Olvidar el último plan abierto en este móvil">✕ Olvidar</button></div>` : ""}
        <p class="peq">Si te ha llegado un enlace, ábrelo directamente: no hace falta pasar por aquí.</p>
      </div>
      <div class="tarjeta">
        <h2 style="margin-top:0">Soy entrenador</h2>
        <p class="peq">Prepara entrenos y partidos, coloca a tu equipo en la pizarra y envíalo al grupo.</p>
        <button type="button" class="btn-sec" data-soyentr="1">Empezar mi cuaderno</button>
      </div>`;
  }
  function pintarPantalla() {
    if (estado.pant === "cuaderno" && !esEntrenador()) return pantInicio();
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
      <div class="tarjeta abrir-arch">
        <p><b>¿Te han enviado un archivo de la pizarra?</b> Ábrelo aquí: si es de tu entrenador verás la pizarra y tu ficha; si es de otro entrenador, se juntará con tu cuaderno.</p>
        <div class="fila">
          <label class="btn" for="abrirFile" style="cursor:pointer">📂 Abrir archivo</label>
          <input type="file" id="abrirFile" accept=".html,.htm,.txt,.json,text/html,text/plain,application/json" style="position:absolute;left:-999px">
          ${(function () { try { const u = JSON.parse(localStorage.getItem("pz_ultimo") || "null"); return u && u.plan ? `<button type="button" class="btn-sec" data-ultimo="1">Volver a «${esc(String(u.plan.titulo || "último plan").slice(0, 40))}»</button><button type="button" class="btn-peq peligro" data-olvidar="1" aria-label="Olvidar el último plan abierto en este móvil">✕ Olvidar</button>` : ""; } catch (e) { return ""; } })()}
        </div>
      </div>
      ${htmlMemoria()}
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
      id: uid(), mod: Date.now(), tipo: tipo, fecha: hoyISO(), titulo: tipo === "partido" ? "Partido" : "Entreno", rival: "", objetivo: "", notas: "",
      sistema: "4231", once: {}, bloques: []
    };
    // alineación por defecto: dorsales de la plantilla según el puesto preferido
    autoOnce(p);
    const cats = tipo === "partido" ? ["salida", "presion", "banda", "cornerF", "cornerC", "falta"] : ["calentamiento", "ejercicio", "juego"];
    cats.forEach((c) => p.bloques.push({ id: uid(), cat: c, titulo: CATS[c], min: tipo === "partido" ? "" : 15, texto: "", consignas: "", jug: null }));
    db.planes.push(p); guardar();
    ir("plan", { planId: p.id });
  }
  // Tres apartados seguidos para un aprendizaje: analítico, dinámica ecológica y partido condicionado.
  function anadirAprendizaje(plan, a, clave) {
    const dz = own(DISENOS, clave) ? DISENOS[clave] : null;
    const tit = a.t || "Aprendizaje";
    const preg = a.pre || "";
    const base = { fij: a.que || "", cuando: a.quan || "", consignas: "", preg: preg };
    plan.bloques.push(Object.assign({ id: uid(), cat: "ejercicio", fase: "analitico", titulo: (tit + " · analítico").slice(0, 80), min: 15,
      texto: a.an || "", jug: dz ? dzJugada(dz.an) : null }, base));
    const eco = own(PLANTILLAS, a.tpl) ? a.tpl : "vacia";
    let jEco = dz ? dzJugada(dz.eco) : null;
    if (!jEco) { jEco = nuevaJugada(plan, eco); if (eco === "transicion" && jEco && jEco.pasos[1]) jEco.pasos[1].tr = "r"; } // «¡Robo! Primer pase hacia delante»
    plan.bloques.push(Object.assign({ id: uid(), cat: own(CATS, a.cat) ? a.cat : "juego", fase: "ecologico", titulo: (tit + " · dinámica").slice(0, 80), min: 20,
      texto: a.eco || "", jug: jEco }, base));
    plan.bloques.push(Object.assign({ id: uid(), cat: "juego", fase: "condicionado", titulo: (tit + " · partido condicionado").slice(0, 80), min: 20,
      texto: "Partido con la condición. Durante el juego, observa: no hace falta recordarles la consigna, el gol ya lleva su atención a lo importante. Las preguntas, al acabar.",
      cond: a.cond || "", condEq: a.cond ? "a" : "", jug: (dz && dzJugada(dz.cond)) || nuevaJugada(plan, "vacia") }, base));
    if (!plan.clave && a.pc) plan.clave = String(a.pc).replace(/[«»¡!¿?]/g, "").trim().slice(0, 30);
    plan.mod = Date.now();
  }
  function autoOnce(p) {
    const usados = new Set();
    slotsDe(p).forEach((s, idx) => {
      const j = db.plantilla.find((x) => !usados.has(x.id) && x.p && famDePuesto(x.p) === s[2]);
      if (j) { p.once[idx] = j.id; usados.add(j.id); }
    });
  }

  function htmlAnalisis(p) {
    const an = p.an || {};
    return `<details class="det analisis" ${Object.keys(an).length ? "" : "open"}><summary><b>🔎 Análisis del partido</b> <span class="peq">(preguntas de un toque)</span></summary>
      ${ANALISIS.map((g) => `<p class="subtit">${esc(g.g)}</p>${g.p.map((x) => `<div class="fb-grupo" role="group" aria-label="${esc(x[1])}"><span class="peq">${esc(x[1])}</span>${x[2].map((o, i) => `<button type="button" class="btn-peq" data-an="${x[0]}" data-v="${i}" aria-pressed="${an[x[0]] === i}">${esc(o)}</button>`).join("")}</div>`).join("")}`).join("")}
      <p class="subtit">Ocasiones claras</p>
      <div class="fila"><div class="campo-f"><label for="anOc0">A favor</label><input type="number" min="0" max="50" id="anOc0" data-anoc="0" value="${p.anOc ? esc(p.anOc[0]) : ""}" style="width:90px"></div>
        <div class="campo-f"><label for="anOc1">En contra</label><input type="number" min="0" max="50" id="anOc1" data-anoc="1" value="${p.anOc ? esc(p.anOc[1]) : ""}" style="width:90px"></div></div>
    </details>`;
  }
  // El análisis en frases, para la memoria y para Claude: [{aspecto, valor, cuesta}]
  function analisisLista(p) {
    const r = [];
    Object.keys(p.an || {}).forEach((k) => { const x = AN_P[k]; if (x) r.push({ aspecto: x[1], valor: x[2][p.an[k]], cuesta: x[3] >= 0 && p.an[k] === x[3], fuerte: x[3] >= 0 && p.an[k] === 0 }); });
    if (p.anOc) r.push({ aspecto: "Ocasiones claras", valor: "a favor " + p.anOc[0] + ", en contra " + p.anOc[1], cuesta: p.anOc[1] > p.anOc[0] });
    return r;
  }
  const FB_C = [["", ""], ["😕", "Costó"], ["🙂", "Regular"], ["💪", "Bien"]];
  const FB_A = [["", ""], ["", "No"], ["", "A veces"], ["", "Sí"]];
  function htmlFeedback(p) {
    const fila = (b) => {
      const fb = b.fb || {};
      const grupo = (k, ops, et) => `<div class="fb-grupo" role="group" aria-label="${esc(et)}: ${esc(b.titulo || CATS[b.cat])}"><span class="peq">${esc(et)}</span>${[1, 2, 3].map((v) => `<button type="button" class="btn-peq" data-fb="${k}" data-bid="${b.id}" data-v="${v}" aria-pressed="${fb[k] === v}">${ops[v][0] ? ops[v][0] + " " : ""}${ops[v][1]}</button>`).join("")}</div>`;
      return `<div class="fb-bloque">
        <p class="fb-tit"><b>${esc(b.titulo || CATS[b.cat])}</b>${b.fase ? ` <span class="peq">· ${esc(FASE_CORTA[b.fase])}</span>` : ""}</p>
        ${grupo("c", FB_C, p.tipo === "partido" ? "¿Cómo ha salido?" : "¿Cómo ha ido?")}
        ${grupo("a", FB_A, "¿Encontraron los estímulos relevantes?")}
        <div class="fila fb-nota"><label class="sr-only" for="fbn${b.id}">Nota rápida: ${esc(b.titulo || CATS[b.cat])}</label><textarea id="fbn${b.id}" data-fbn="${b.id}" maxlength="300" rows="2" placeholder="Nota rápida: qué ha pasado, qué ajustarías…">${esc(fb.n || "")}</textarea>
          <button type="button" class="btn-peq" data-fbdictar="fbn${b.id}" aria-label="Dictar la nota de ${esc(b.titulo || CATS[b.cat])}">🎤 Dictar</button></div>
      </div>`;
    };
    return `<h2 id="comoHaIdo">📝 Cómo ha ido</h2>
      <div class="tarjeta">
        <p class="peq">Un minuto al acabar. Con estos feedbacks, la pizarra va formando la memoria del equipo, y Claude la usa para proponer alternativas y los próximos entrenos.</p>
        ${p.tipo === "partido" ? htmlAnalisis(p) + `<p class="subtit">Situaciones de juego del plan</p>` : ""}
        ${p.bloques.map(fila).join("")}
        ${p.tipo === "partido" ? `<div class="campo-f"><label for="fbr">Resultado</label><input type="text" id="fbr" data-p="fbr" maxlength="40" value="${esc(p.fbr || "")}" placeholder="2-1"></div>` : ""}
        <div class="campo-f"><label for="fbnG">${p.tipo === "partido" ? "Lo más importante del partido" : "Lo más importante de hoy"}</label>
          <div class="fila fb-nota"><textarea id="fbnG" data-p="fbn" maxlength="600" rows="3" placeholder="${p.tipo === "partido" ? "Qué situaciones de juego han salido y cuáles han costado…" : "Qué han aprendido, qué hay que repetir…"}">${esc(p.fbn || "")}</textarea>
          <button type="button" class="btn-peq" data-fbdictar="fbnG" aria-label="Dictar lo más importante">🎤 Dictar</button></div></div>
        <p class="peq" data-r="ayudaDictadoFb" hidden>Pulsa el <b>micrófono del teclado</b> y habla: el móvil lo escribe por ti (en Mac, pulsa dos veces la tecla Fn). El dictado lo hace tu móvil, la pizarra no graba audio.</p>
      </div>`;
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
        ${db.plantilla.length ? `<div class="alin">${sl.map((s, idx) => {
            const ex = (p.extra || {})[idx] || [];
            return `<div class="alin-puesto"><label for="on${idx}">${esc(s[1])}</label><select id="on${idx}" data-once="${idx}">${optsJug((p.once || {})[idx])}</select>
              <div class="alin-extra">${[0, 1].map((n) => `<label class="sr-only" for="ex${idx}_${n}">${esc(s[1])}: otro jugador ${n + 1}</label><select id="ex${idx}_${n}" data-extra="${idx}" data-n="${n}">${optsJug(ex[n]).replace("<option value=\"\">—</option>", "<option value=\"\">＋ otro jugador</option>")}</select>`).join("")}</div></div>`;
          }).join("")}</div><div data-r="sinPuesto"></div>`
          : `<p class="peq">Añade jugadores en la plantilla para ponerles nombre en las fichas.</p>`}
        <p class="peq">Puedes poner hasta tres jugadores en cada puesto (por ejemplo, el que empieza y los que entrarán) y un mismo jugador en varios puestos. En la pizarra sale el primero; cada jugador, al abrir el enlace, ve la ficha de su puesto con su nombre.</p>
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
          ${p.tipo === "entreno" ? `<div class="metodo">
            <div class="fila">
              <div class="campo-f crece"><label for="bfa${b.id}">Paso del aprendizaje</label><select id="bfa${b.id}" data-b="fase" data-bid="${b.id}"><option value="">—</option>${Object.keys(FASES).map((k) => `<option value="${k}" ${b.fase === k ? "selected" : ""}>${FASES[k]}</option>`).join("")}</select></div>
            </div>
            <div class="fila">
              <div class="campo-f crece"><label for="bco${b.id}">🥅 La condición (qué vale gol)</label><textarea id="bco${b.id}" data-b="cond" data-bid="${b.id}" maxlength="300" placeholder="El gol solo vale si…">${esc(b.cond || "")}</textarea></div>
              <div class="campo-f"><label for="bce${b.id}">La tiene</label><select id="bce${b.id}" data-b="condEq" data-bid="${b.id}" style="width:auto"><option value="">—</option><option value="a" ${b.condEq === "a" ? "selected" : ""}>Fichas del color del equipo</option><option value="r" ${b.condEq === "r" ? "selected" : ""}>Fichas azules (el otro equipo)</option>${Object.keys(PETOS).map((k) => `<option value="${k}" ${b.condEq === k ? "selected" : ""}>Peto ${k}</option>`).join("")}</select></div>
            </div>
            <p class="peq">La condición la tiene un equipo y no la pierde al perder el balón. Así el gol, que es el refuerzo natural del fútbol, lleva la atención a lo que queremos enseñar.</p>
          </div>` : ""}
          <div class="campo-f"><label for="bpr${b.id}">❓ Preguntas para hacer después (no se envían a los jugadores)</label><textarea id="bpr${b.id}" data-b="preg" data-bid="${b.id}" maxlength="600" placeholder="¿Qué has visto antes de recibir?&#10;¿Cuándo has decidido moverte?">${esc(b.preg || "")}</textarea>
            <span class="peq" style="font-weight:400">Lo conocen, pero aún no lo han aprendido: durante el juego, observa; las preguntas, mejor después. No se envían a los jugadores.</span></div>
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
          <div class="acciones">
            <button type="button" class="btn-peq ia-btn" data-iapedir="${b.id}">✨ Sugerencias de Claude</button>
            <button type="button" class="btn-peq ia-btn" data-iapz="${b.id}">✨ Diseñar la pizarra con Claude</button>
            <button type="button" class="btn-peq ia-btn" data-iaalt="${b.id}">✨ Alternativas con Claude</button>
          </div>
          <div data-r="ia-${b.id}"></div>
          <div data-r="iapz-${b.id}"></div>
          <div data-r="iaalt-${b.id}"></div>
        </div>`).join("")}
      <p class="peq">✨ Las sugerencias de Claude usan la jugada, las notas de los jugadores y la edad del equipo. Se envían a Claude (Anthropic) <b>sin nombres</b>, solo con dorsal y puesto, y solo cuando pulsas el botón. Revisa la propuesta antes de aplicarla.</p>
      <button type="button" class="btn-sec" data-bnuevo="1">＋ Añadir apartado</button>
      ${p.tipo === "entreno" ? `<div class="tarjeta aprendizaje">
        <h3 style="margin-top:0">🎯 Aprendizaje en 5 pasos</h3>
        <p class="peq">Elige qué quieres enseñar y se crean tres apartados seguidos: ejercicio analítico, dinámica ecológica con transiciones y partido condicionado, con los estímulos relevantes, la condición y las preguntas ya escritos. Después adáptalos a tu equipo.</p>
        <div class="fila"><label class="sr-only" for="aprSel">Aprendizaje</label><select id="aprSel" style="width:auto">${Object.keys(APRENDIZAJES).map((k) => `<option value="${k}">${esc(APRENDIZAJES[k].t)}</option>`).join("")}</select>
          <button type="button" class="btn-sec" data-aprnuevo="1">＋ Añadir los tres apartados</button></div>
      </div>` : ""}

      ${htmlFeedback(p)}

      <h2>Enviar</h2>
      <div class="tarjeta">
        <p class="peq">Se crea un enlace corto con todo el plan. Los jugadores lo abren, eligen su dorsal y ven la pizarra con sus mensajes. No hace falta cuenta ni instalar nada. El plan se guarda cifrado 90 días en el servidor de APRENS, que no lo puede leer.</p>
        <p class="peq"><b>Ojo:</b> quien tenga el enlace ve el plan entero (nombres cortos y consignas de todos). Si alguien lo reenvía, también lo verá quien lo reciba.</p>
        <label class="peq" style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" data-r="sinNombres" ${p.sinNombres ? "checked" : ""} style="width:22px;height:22px"> Quitar los nombres de la plantilla (solo dorsales). Las notas y consignas se envían tal como las has escrito.</label>
        <div class="fila">
          <button type="button" class="btn" data-enviar="1">📤 Enviar enlace al grupo</button>
          <button type="button" class="btn-sec" data-enviararch="1">📎 Enviar como archivo</button>
          <button type="button" class="btn-sec" data-preview="1">👁 Ver como jugador</button>
        </div>
        <div data-r="compartir"></div>
      </div>`;
    pintarSinPuesto(p);
    p.bloques.forEach((b) => { if (iaResultados[b.id]) pintarIA(p, b, app.querySelector(`[data-r="ia-${b.id}"]`)); });
  }

  function pintarSinPuesto(plan) {
    const el = app.querySelector('[data-r="sinPuesto"]'); if (!el) return;
    const con = new Set(Object.values(plan.once || {}));
    Object.values(plan.extra || {}).forEach((l) => l.forEach((x) => con.add(x)));
    plan.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj) con.add(f.pj); }); });
    const fuera = db.plantilla.filter((j) => !con.has(j.id)).sort((a, b) => a.d - b.d);
    el.innerHTML = fuera.length ? `<p class="sin-puesto"><b>Sin puesto todavía:</b> ${fuera.map((j) => esc(j.d + " " + (j.c || j.n))).join(", ")}. Si no les pones un puesto, no podrán ver su ficha en el enlace.</p>` : `<p class="peq">✅ Todos los jugadores de la plantilla tienen al menos un puesto.</p>`;
  }

  function abrirPizarra(plan, bloque) {
    const dlg = $("#dlgPizarra");
    $("#dlgPzTit").textContent = bloque.titulo || CATS[bloque.cat] || "Pizarra";
    const cuerpo = $("#dlgPzCuerpo");
    cuerpo.innerHTML = "";
    const hostPz = document.createElement("div");
    cuerpo.appendChild(hostPz);
    const ctx = crearCtx(plan, db.plantilla, true);
    const pz = crearPizarra(hostPz, { ctx: ctx, jug: bloque.jug, cat: bloque.cat, editable: true, alCambiar: () => { plan.mod = Date.now(); guardar(); }, abrirFicha: (pid) => abrirFicha(plan, ctx, pid, db.equipo.etapa), abrirNotas: (pid) => abrirNotas(pid, plan.id) });
    dlg._pz = pz;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function cerrarPizarra() {
    const dlg = $("#dlgPizarra");
    if (dlg._pz) dlg._pz.parar();
    if (dlg.open) dlg.close();
  }
  $("#dlgCerrar").addEventListener("click", cerrarPizarra);
  $("#dlgFichaCerrar").addEventListener("click", () => { voz.parar(); $("#dlgFicha").close(); });
  $("#dlgFicha").addEventListener("close", () => voz.parar());
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
              <button type="button" class="btn-peq" data-jnotas="${esc(j.id)}" aria-label="Notas de ${esc(j.n)}">📝${(j.notas || []).length ? (j.notas || []).length : ""}</button>
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
      db.plantilla.push({ id: uid(), d: d, n: nombre, c: nombre.split(" ")[0], p: pt ? "Portero" : "", mod: Date.now() });
      n++;
    });
    // nombres cortos repetidos → añade inicial del apellido
    const cnt = {};
    db.plantilla.forEach((j) => { cnt[j.c] = (cnt[j.c] || 0) + 1; });
    db.plantilla.forEach((j) => { if (cnt[j.c] > 1) { const ps = j.n.split(" "); if (ps[1]) j.c = ps[0] + " " + ps[1][0] + "."; } });
    guardar();
    return n;
  }

  function htmlSuscripcion() {
    const ia = SUS.ia ? (SUS.ia.limite ? `Sugerencias de Claude este mes: ${SUS.ia.usadas} de ${SUS.ia.limite}.` : `Sugerencias de Claude este mes: ${SUS.ia.usadas}.`) : "";
    return `<h2 id="tuSuscripcion">Tu suscripción</h2>
      <div class="tarjeta" data-r="sus">
        ${SUS.activa ? `<p>✅ <b>Activa</b>${SUS.plan ? " · " + esc(SUS.plan) : ""}. Tienes los enlaces, las fichas privadas, el envío a otros entrenadores y las sugerencias de Claude.</p>
          ${ia ? `<p class="peq">${esc(ia)}</p>` : ""}
          <p class="peq">Código en este navegador: <b class="mono">${esc(SUS.codigo)}</b></p>
          <div class="fila">
            ${SUS.manual ? "" : SUS.correo ? `<button type="button" class="btn-sec" data-susgestionar="1">Gestionar (tarjeta, facturas, baja)</button>` : SUS.portalLogin ? `<a class="btn-sec" href="${esc(SUS.portalLogin)}" target="_blank" rel="noopener">Gestionar (tarjeta, facturas, baja)</a>` : ""}
            <button type="button" class="btn-peq peligro" data-susquitar="1">Quitar el código de este navegador</button>
          </div>`
        : `<p>Lo básico es gratis: el cuaderno, la pizarra y enviar los planes como archivo. Con la suscripción de entrenador tienes además enlaces cortos para el grupo, la ficha privada de cada jugador, el envío del cuaderno a otro entrenador por enlace y sugerencias de Claude.</p>
          ${SUS.codigo && !SUS.error ? `<p class="sin-puesto">El código guardado (${esc(SUS.codigo)}) no está activo. Revisa que esté bien escrito o que la suscripción siga en marcha.</p>` : ""}
          ${SUS.error ? `<p class="sin-puesto">Ahora mismo no se puede comprobar el código. Prueba dentro de un rato.</p>` : ""}
          <div class="campo-f"><label for="susCod">Código de acceso</label><input type="text" id="susCod" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40" value="${esc(SUS.codigo)}"></div>
          <div class="fila">
            <button type="button" class="btn" data-susguardar="1">Usar este código</button>
            ${SUS.altas ? `<a class="btn-sec" href="/suscribirse.html">Suscribirme</a>` : ""}
            ${SUS.correo ? `<a class="btn-sec" href="/recuperar.html">He perdido el código</a>` : ""}
            ${SUS.codigo ? `<button type="button" class="btn-peq peligro" data-susquitar="1">Quitar el código</button>` : ""}
          </div>`}
        <div data-r="susMsg" role="status" aria-live="polite"></div>
        <p class="peq"><a href="/condiciones.html" target="_blank" rel="noopener">Condiciones</a> · <a href="/privacidad.html" target="_blank" rel="noopener">Privacidad</a></p>
      </div>`;
  }
  function pintarSuscripcion() {
    const c = app.querySelector('[data-r="susCaja"]'); if (!c) return false;
    c.innerHTML = SUS.modo ? htmlSuscripcion() : ""; return true;
  }
  function pantAjustes() {
    app.innerHTML = `
      <h1>Ajustes</h1>
      <div class="tarjeta">
        <div class="campo-f"><label for="aEq">Nombre del equipo</label><input type="text" id="aEq" data-eq="nombre" value="${esc(db.equipo.nombre)}" maxlength="60"></div>
        <div class="campo-f"><label for="aEt">Categoría (edad de los jugadores)</label><select id="aEt" data-eq="etapa">
          <option value="">Sin indicar</option>${Object.keys(FICHA.ETAPAS).map((k) => `<option value="${k}" ${db.equipo.etapa === k ? "selected" : ""}>${esc(FICHA.ETAPAS[k].n)} (${esc(FICHA.ETAPAS[k].edad)})</option>`).join("")}</select>
          <span class="peq" style="font-weight:400">Adapta la ficha de cada jugador (físico, técnica y táctica) a su etapa de desarrollo.</span></div>
        <div class="campo-f"><label for="aCol">Color de nuestras fichas</label><input type="color" id="aCol" data-eq="color" value="${esc(db.equipo.color || "#C8102E")}" style="width:80px;height:44px;padding:2px"></div>
      </div>
      <div data-r="susCaja">${SUS.modo ? htmlSuscripcion() : ""}</div>
      <h2>Compartir con otro entrenador</h2>
      <div class="tarjeta">
        <p class="peq">Envía tu plantilla completa y los planes que marques a otro entrenador del equipo. Al abrir el enlace, se juntan con su cuaderno sin borrar nada: se añaden los jugadores y planes nuevos, y si un plan lo tenéis los dos, se queda la versión editada más tarde. Él puede hacer lo mismo para devolverte sus cambios.</p>
        <fieldset class="lista-env"><legend class="peq"><b>Planes que se envían</b></legend>
          ${db.planes.length ? db.planes.slice().sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).map((p) => `<label><input type="checkbox" data-envplan="${esc(p.id)}" checked> ${esc(p.titulo || "(sin título)")} <span class="peq">· ${esc(fechaBonita(p.fecha))}</span></label>`).join("") : `<p class="peq">Aún no hay planes; se enviará solo la plantilla.</p>`}
        </fieldset>
        <label class="peq" style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="envSinApe" style="width:22px;height:22px"> Enviar la plantilla sin apellidos (solo dorsal y nombre corto)</label>
        <label class="peq" style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="envNotas" style="width:22px;height:22px"> Incluir las notas privadas, los contactos de los jugadores (teléfono y correo) y los feedbacks de las sesiones</label>
        <p class="peq"><b>Ojo:</b> lleva la plantilla, las notas y las consignas de los planes marcados, y lo puede abrir cualquiera que tenga el enlace. Envíalo solo al otro entrenador, por privado, nunca al grupo de jugadores.</p>
        <div class="fila">
          <button type="button" class="btn" data-envarch="1">📎 Enviar archivo a otro entrenador</button>
          <button type="button" class="btn-sec" data-enventr="1">🔗 Enviar enlace</button>
        </div>
        <div data-r="envEntr"></div>
        <div class="fila" style="margin-top:10px">
          <label class="btn-sec" for="juntFile" style="cursor:pointer">Juntar un archivo recibido</label>
          <input type="file" id="juntFile" accept=".html,.htm,.txt,.json,text/html,text/plain,application/json" style="position:absolute;left:-999px">
        </div>
      </div>
      <h2>Copia de seguridad</h2>
      <div class="tarjeta">
        <p class="peq">Todo se guarda solo en este móvil o navegador. Descarga una copia de vez en cuando, o para pasarlo a otro dispositivo.</p>
        <div class="fila">
          <button type="button" class="btn-sec" data-exportar="1">Descargar copia</button>
          <label class="btn-sec" for="impFile" style="cursor:pointer">Recuperar copia</label>
          <input type="file" id="impFile" accept=".html,.htm,.txt,.json,text/html,text/plain,application/json" style="position:absolute;left:-999px">
        </div>
      </div>
      <h2>Sobre la privacidad</h2>
      <div class="tarjeta">
        <p class="peq">Tu cuaderno se guarda solo en este móvil. Al enviar un enlace, el plan se cifra aquí antes de salir y se guarda cifrado durante 90 días en el servidor de APRENS, que no lo puede leer: la clave va solo en el enlace. Pasados los 90 días se borra. Lo puede abrir cualquiera que tenga el enlace, también si se reenvía. Usa nombres cortos o apodos, o envía solo dorsales, si prefieres no compartir nombres. Los archivos no pasan por ningún servidor.</p>
      </div>`;
  }

  // ---------------------------------------------------------------- formato compacto de los enlaces
  // Para que el enlace sea corto:
  //  · posiciones en medios metros y en lista (en el orden de las fichas);
  //  · si la pizarra sale de una jugada ya montada, solo se envía lo que cambia respecto a ella
  //    (la otra app la vuelve a montar igual); si no, cada paso solo lleva lo que cambia del anterior;
  //  · se quitan los campos vacíos y los títulos que coinciden con los de por defecto;
  //  · en el paquete para jugadores, los identificadores de jugador se acortan.
  const mm = (v) => [Math.round(v[0] * 2), Math.round(v[1] * 2)];
  const igualP = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  function baseDe(plan, jug) {
    const fj = JSON.stringify(jug.fichas);
    let mejor = null, coste = 1e9;
    Object.keys(PLANTILLAS).forEach((k) => {
      const base = nuevaJugada(plan, k);
      if (JSON.stringify(base.fichas) !== fj) return;
      let c = Math.abs(base.pasos.length - jug.pasos.length) * 30;
      jug.pasos.forEach((p, i) => {
        const r = base.pasos[i]; if (!r) return;
        Object.keys(p.pos).forEach((id) => { if (!igualP(mm(p.pos[id]), r.pos[id] && mm(r.pos[id]))) c++; });
      });
      if (c < coste) { coste = c; mejor = { k: k, base: base }; }
    });
    return mejor;
  }
  const LISTAS_FIJAS = new Set(["d", "planes", "plantilla", "bloques", "fichas", "pasos", "jug"]);
  function limpiarVacios(x) {
    if (Array.isArray(x)) { x.forEach(limpiarVacios); return; }
    if (!x || typeof x !== "object") return;
    Object.keys(x).forEach((k) => {
      const v = x[k];
      limpiarVacios(v);
      if (v === "" || v === null || (Array.isArray(v) && !v.length && !LISTAS_FIJAS.has(k)) || (v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length)) delete x[k];
    });
  }
  function compactar(pq, cortos) {
    const o = clon(pq);
    if (cortos && Array.isArray(o.jug) && o.plan) {
      const m = {}; o.jug.forEach((j, i) => { m[j.id] = i.toString(36); j.id = m[j.id]; });
      if (o.yo && m[o.yo] !== undefined) o.yo = m[o.yo];
      const r = (x) => (x && m[x] !== undefined ? m[x] : x);
      const pl = o.plan;
      Object.keys(pl.once || {}).forEach((k) => { pl.once[k] = r(pl.once[k]); });
      Object.keys(pl.extra || {}).forEach((k) => { pl.extra[k] = pl.extra[k].map(r); });
      pl.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj) f.pj = r(f.pj); }); });
    }
    const planes = o.plan ? [o.plan] : (o.planes || []);
    planes.forEach((pl) => pl.bloques.forEach((b) => {
      if (b.titulo === CATS[b.cat]) delete b.titulo;
      const g = b.jug; if (!g) return;
      const ids = g.fichas.map((f) => f.id);
      const bs = baseDe(pl, g);
      if (bs) { g.k = bs.k; delete g.fichas; if (g.vista === bs.base.vista) delete g.vista; }
      if (g.rivales !== false) delete g.rivales;
      let prev = null;
      g.pasos.forEach((p, i) => {
        const lista = ids.map((id) => (p.pos[id] ? mm(p.pos[id]) : null));
        const ref = bs && bs.base.pasos[i];
        const refL = ref ? ids.map((id) => (ref.pos[id] ? mm(ref.pos[id]) : null)) : prev;
        const refB = ref ? mm(ref.b) : null;
        if (!refL) p.q = lista.map((v) => v || [0, 0, 1]);
        else {
          const d = [];
          lista.forEach((v, j) => {
            if (v && !igualP(v, refL[j])) d.push(j, v[0], v[1]);
            else if (!v && refL[j]) d.push(j, null, null); // la ficha no está en este paso
          });
          p.d = d;
        }
        prev = lista;
        const c = mm(p.b); if (!refB || !igualP(c, refB)) p.c = c;
        if (ref && p.t === ref.t) delete p.t; else if (ref && !p.t) p.t = " ";
        delete p.pos; delete p.b;
      });
    }));
    limpiarVacios(o);
    o.z = 1;
    return o;
  }
  function expandir(o) {
    if (!o || o.z !== 1) return o;
    const planes = o.plan ? [o.plan] : (Array.isArray(o.planes) ? o.planes : []);
    planes.forEach((pl) => {
      if (!pl || !Array.isArray(pl.bloques)) return;
      const plSeg = { sistema: own(SISTEMAS, pl.sistema) ? pl.sistema : "4231" };
      pl.bloques.forEach((b) => {
        if (!b) return;
        if (!b.titulo && own(CATS, b.cat)) b.titulo = CATS[b.cat];
        const g = b.jug; if (!g || !Array.isArray(g.pasos)) return;
        const base = own(PLANTILLAS, g.k) ? nuevaJugada(plSeg, g.k) : null;
        if (base) { g.fichas = base.fichas; if (!g.vista) g.vista = base.vista; }
        if (!Array.isArray(g.fichas)) return;
        if (g.rivales === undefined) g.rivales = true;
        const ids = g.fichas.map((f) => f && f.id);
        let actual = null;
        g.pasos.forEach((p, i) => {
          if (!p || typeof p !== "object") return;
          const ref = base && base.pasos[i];
          if (Array.isArray(p.q)) actual = p.q.map((v) => (Array.isArray(v) && v.length === 2 ? [v[0] / 2, v[1] / 2] : null));
          else {
            actual = ref ? ids.map((id) => (ref.pos[id] ? ref.pos[id].slice() : null)) : (actual ? actual.slice() : ids.map(() => null));
            const d = Array.isArray(p.d) ? p.d : [];
            for (let j = 0; j + 2 < d.length; j += 3) {
              if (!Number.isInteger(d[j]) || d[j] < 0 || d[j] >= ids.length) continue;
              actual[d[j]] = d[j + 1] === null ? null : [d[j + 1] / 2, d[j + 2] / 2];
            }
          }
          p.pos = {}; ids.forEach((id, j) => { if (id && actual[j]) p.pos[id] = actual[j]; });
          p.b = Array.isArray(p.c) ? [p.c[0] / 2, p.c[1] / 2] : ref ? ref.b.slice() : [34, 52.5];
          if (p.t === undefined && ref) p.t = ref.t;
          else if (p.t === " ") p.t = "";
          delete p.q; delete p.d; delete p.c;
        });
        delete g.k;
      });
    });
    delete o.z;
    return o;
  }

  // ---------------------------------------------------------------- codificación de enlaces
  // Base64 «url-safe» (solo letras, números, - y _): WhatsApp y otras apps cortan
  // el enlace en caracteres como «+» o «$», que usaba la codificación anterior.
  function codificar(obj, cortos) {
    const u8 = window.LZString.compressToUint8Array(JSON.stringify(compactar(obj, cortos)));
    let bin = "";
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function descodificar(hash) {
    const m = /^#(p|c|v|e|ver|ent)=(.*)$/.exec(hash || "");
    if (!m) return null;
    let datos = m[2];
    try { datos = decodeURIComponent(datos); } catch (e) { /* tal cual */ }
    if (m[1] === "p" || m[1] === "c" || m[1] === "v" || m[1] === "e") {
      let b = datos.replace(/[^A-Za-z0-9_-]/g, "").replace(/-/g, "+").replace(/_/g, "/");
      while (b.length % 4) b += "=";
      const bin = atob(b), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return expandir(JSON.parse(window.LZString.decompressFromUint8Array(u8)));
    }
    // Enlaces antiguos (#ver= / #ent=)
    return JSON.parse(window.LZString.decompressFromEncodedURIComponent(datos.replace(/ /g, "+")));
  }

  // ---------------------------------------------------------------- enlaces cortos cifrados
  // El plan se cifra aquí (AES-GCM, clave aleatoria de 128 bits) y se sube a /api/pizarra.
  // El servidor solo guarda el bloque cifrado (90 días). La clave va en el #hash del enlace,
  // que el navegador nunca envía al servidor: sin el enlace completo nadie puede leerlo.
  const b64u = (u8) => { let bin = ""; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const deB64u = (t) => { let b = String(t).replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; const bin = atob(b), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; };
  async function enlaceCorto(obj, cortos) {
    if (!window.crypto || !crypto.subtle || !window.fetch) throw new Error("sin cifrado");
    const datos = window.LZString.compressToUint8Array(JSON.stringify(compactar(obj, cortos)));
    const clave = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await crypto.subtle.importKey("raw", clave, "AES-GCM", false, ["encrypt"]);
    const cif = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, datos));
    const todo = new Uint8Array(iv.length + cif.length); todo.set(iv); todo.set(cif, iv.length);
    const r = await fetch("/api/pizarra-subir", { method: "POST", body: b64u(todo), headers: Object.assign({ "Content-Type": "text/plain" }, cabCodigo()) });
    if (r.status === 402) { SUS.modo = true; SUS.activa = false; const e = new Error("suscripcion"); e.suscripcion = true; throw e; }
    if (!r.ok) { const e = new Error("servidor " + r.status); e.status = r.status; throw e; }
    const j = await r.json();
    if (!j || !/^[A-Za-z0-9]{10}$/.test(j.id)) throw new Error("respuesta");
    return location.origin + location.pathname + "#k=" + j.id + "." + b64u(clave);
  }
  async function leerEnlaceCorto(hash) {
    const m = /^#k=([A-Za-z0-9]{10})\.([A-Za-z0-9_-]{22})$/.exec(hash || "");
    if (!m) throw new Error("formato");
    const r = await fetch("/api/pizarra?id=" + m[1], { cache: "no-store" });
    if (r.status === 404) { const e = new Error("caducado"); e.caducado = true; throw e; }
    if (!r.ok) throw new Error("servidor " + r.status);
    const todo = deB64u((await r.text()).trim());
    const k = await crypto.subtle.importKey("raw", deB64u(m[2]), "AES-GCM", false, ["decrypt"]);
    const datos = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: todo.slice(0, 12) }, k, todo.slice(12)));
    return expandir(JSON.parse(window.LZString.decompressFromUint8Array(datos)));
  }

  // ---------------------------------------------------------------- compartir
  function paquete(plan, sinNombres) {
    const usados = new Set();
    Object.values(plan.once || {}).forEach((x) => usados.add(x));
    Object.values(plan.extra || {}).forEach((l) => l.forEach((x) => { if (x) usados.add(x); }));
    plan.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj) usados.add(f.pj); }); });
    const jug = db.plantilla.filter((j) => usados.has(j.id)).map((j) => { const n = sinNombres ? "" : (j.c || j.n.split(" ")[0]); return { id: j.id, d: j.d, n: n || "Dorsal " + j.d, c: n, p: j.p || "" }; });
    const pl = clon(plan); delete pl.id;
    pl.bloques.forEach((b) => { delete b.preg; delete b.fb; }); // las preguntas y el feedback son solo para el entrenador
    delete pl.fbn; delete pl.fbr; delete pl.an; delete pl.anOc;
    // limpieza: redondeo
    pl.bloques.forEach((b) => { if (b.jug) b.jug.pasos.forEach((p) => { Object.keys(p.pos).forEach((k) => { p.pos[k] = p.pos[k].map(r05); }); p.b = p.b.map(r05); if (p.tips && !Object.keys(p.tips).length) delete p.tips; if (p.dib && !p.dib.length) delete p.dib; }); });
    return { v: 1, eq: { n: db.equipo.nombre, col: db.equipo.color, et: db.equipo.etapa || "" }, plan: pl, jug: jug };
  }
  function enlaceDe(plan, sinNombres) {
    return location.origin + location.pathname + "#p=" + codificar(paquete(plan, sinNombres), true);
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
  // Comparte un archivo (WhatsApp, correo…) con el menú del móvil; si no se puede, lo descarga.
  // Se usa .txt porque algunos móviles no dejan compartir .json; dentro va JSON legible.
  // El archivo es una página HTML pequeña: al tocarla en WhatsApp se abre en el navegador
  // y lleva directamente a la pizarra con el plan (en el #hash, que no llega al servidor).
  // Además lleva los datos dentro, por si hay que abrirla con «Abrir archivo».
  function paginaArchivo(titulo, url, obj, explicacion) {
    const datos = JSON.stringify(obj).replace(/</g, "\\u003c");
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titulo)}</title>
<meta http-equiv="refresh" content="1; url=${esc(url)}">
<style>body{margin:0;font:18px/1.45 system-ui,-apple-system,sans-serif;background:#14281D;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box}
a{display:block;margin:22px auto 12px;max-width:340px;background:#FFD23F;color:#111;font-weight:800;font-size:22px;text-decoration:none;padding:18px 22px;border-radius:999px}
p{color:#CFE3D5;font-size:15px;max-width:420px;margin:8px auto}</style>
</head><body><main>
<h1 style="font-size:24px;margin:0 0 6px">${esc(titulo)}</h1>
<p>${esc(explicacion)}</p>
<a href="${esc(url)}">⚽ Abrir la pizarra</a>
<p>Si no se abre sola, pulsa el botón amarillo.</p>
</main>
<script type="application/json" id="pizarra-datos">${datos}</script>
</body></html>`;
  }
  async function compartirArchivo(nombre, obj, titulo, texto, url, explicacion) {
    const contenido = paginaArchivo(titulo, url, obj, explicacion);
    let file = null;
    try { file = new File([contenido], nombre, { type: "text/html" }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.share) {
      let puede = false;
      try { puede = navigator.canShare({ files: [file] }); } catch (e) { puede = false; }
      if (puede) {
        try { await navigator.share({ files: [file], title: titulo, text: texto }); return "compartido"; } catch (e) { if (e && e.name === "AbortError") return "cancelado"; }
      }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([contenido], { type: "text/html" })); a.download = nombre;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return "descargado";
  }
  const nombreArchivo = (pref, t) => pref + "-" + String(t || "plan").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" + hoyISO() + ".html";
  const URL_APP = () => location.origin + location.pathname;
  async function enviarArchivoGrupo(plan, cont) {
    const pq = Object.assign({ tipo: "jugadores" }, paquete(plan, !!plan.sinNombres));
    const texto = "📋 " + (plan.titulo || "Pizarra") + "\n\nToca el archivo: se abrirá la pizarra. Si no se abre sola, pulsa el botón amarillo «Abrir la pizarra». Después elige tu dorsal.";
    const r = await compartirArchivo(nombreArchivo("pizarra", plan.titulo), pq, plan.titulo || "Pizarra", texto, enlaceDe(plan, !!plan.sinNombres), "Lo que vamos a trabajar. Después, elige tu dorsal.");
    if (r === "cancelado") return;
    cont.innerHTML = `<p class="peq" style="margin-top:10px">${r === "compartido" ? "✅ Archivo enviado." : "✅ Archivo descargado. Envíalo al grupo como documento."} Escribe en el grupo:</p>
      <label class="sr-only" for="txtArch">Mensaje para acompañar el archivo</label><textarea id="txtArch" rows="8" readonly>${esc(texto)}</textarea>`;
  }
  // Prepara un enlace (corto y cifrado; si falla, el largo solo con permiso) y lo muestra
  // con botones «Compartir» y «Copiar». Si mientras tanto cambian las opciones de envío,
  // el resultado antiguo se descarta.
  // Teléfono para WhatsApp: solo dígitos y, si es un número español de 9 cifras, con el prefijo 34.
  function telWhatsApp(t) {
    let d = String(t || "").replace(/[^\d+]/g, "");
    if (d.startsWith("+")) d = d.slice(1); else if (d.startsWith("00")) d = d.slice(2); else if (/^[6789]\d{8}$/.test(d)) d = "34" + d;
    return /^\d{8,15}$/.test(d) ? d : "";
  }
  function enlacesContacto(c, txt) {
    const tels = (c.tels || []).map((x) => ({ tel: telWhatsApp(x.tel), nom: x.nom })).filter((x) => x.tel);
    const mails = (c.mails || []).filter((x) => x.mail && RE_MAIL.test(x.mail));
    if (!tels.length && !mails.length) return `<p class="peq">Si añades su teléfono o su correo en «Contacto», podrás enviárselo directamente.</p>`;
    const de = (x, i, total) => (x.nom ? " · " + esc(x.nom) : total > 1 ? " " + (i + 1) : "");
    const asunto = encodeURIComponent(c.asunto || ""), cuerpo = encodeURIComponent(txt);
    return `<div class="fila" style="margin-top:6px">
      ${tels.map((x, i) => `<a class="btn wa" href="https://wa.me/${x.tel}?text=${cuerpo}" target="_blank" rel="noopener noreferrer">💬 WhatsApp${de(x, i, tels.length)}</a>`).join("")}
      ${mails.map((x, i) => `<a class="btn-sec" href="mailto:${esc(x.mail)}?subject=${asunto}&amp;body=${cuerpo}">✉️ Correo${de(x, i, mails.length)}</a>`).join("")}
      ${mails.length > 1 ? `<a class="btn-sec" href="mailto:${mails.map((x) => esc(x.mail)).join(",")}?subject=${asunto}&amp;body=${cuerpo}">✉️ Correo a los dos</a>` : ""}
    </div>${tels.length > 1 ? `<p class="peq">En WhatsApp hay que enviarlo a cada número por separado.</p>` : ""}`;
  }
  let envioGen = 0;
  function invalidarEnvio(cont) { if (cont) { cont.dataset.gen = String(++envioGen); cont.innerHTML = ""; } }
  async function prepararEnvio(cont, o) {
    const yo = String(++envioGen); cont.dataset.gen = yo;
    if (extrasBloqueados()) { cont.innerHTML = htmlInvitacion(o.extra || "Enviar enlaces"); return; }
    cont.innerHTML = `<p class="peq" style="margin-top:10px">Preparando el enlace…</p>`;
    let url;
    try { url = await o.corto(); }
    catch (e) {
      if (cont.dataset.gen !== yo) return;
      if (e && e.suscripcion) { cont.innerHTML = htmlInvitacion(o.extra || "Enviar enlaces"); return; }
      // El servidor ha respondido (límite del día, mantenimiento…): no se ofrece el enlace sin cifrar.
      if (e && e.status) {
        cont.innerHTML = `<p class="sin-puesto" style="margin-top:10px">${e.status === 429 ? "Se ha llegado al máximo de enlaces por hoy." : "Ahora mismo no se puede crear el enlace."} Prueba más tarde, o envíalo como archivo.</p>`;
        return;
      }
      if (!o.largo) {
        cont.innerHTML = `<p class="sin-puesto" style="margin-top:10px">No se ha podido crear el enlace privado (¿sin conexión?). Vuelve a intentarlo cuando tengas conexión, o envíalo como archivo.</p>`;
        return;
      }
      if (!window.confirm("No se ha podido crear el enlace corto (¿sin conexión?).\n\n¿Quieres el enlace largo? Lleva el plan dentro y no caduca: cualquiera que lo conserve podrá verlo.")) {
        cont.innerHTML = `<p class="peq" style="margin-top:10px">No se ha creado ningún enlace. Prueba de nuevo con conexión, o envía un archivo.</p>`;
        return;
      }
      url = o.largo();
    }
    if (cont.dataset.gen !== yo) return;
    if (url.length > 12000) {
      cont.innerHTML = `<p class="sin-puesto" style="margin-top:10px">El enlace largo sale de ${url.length} caracteres y se cortaría en el móvil. Envía un archivo, o marca menos planes.</p>`;
      return;
    }
    const txt = o.texto(url);
    cont.innerHTML = `<p class="peq" style="margin-top:10px">${esc(o.indicacion)}</p>
      <label class="sr-only" for="${o.idTxt}">Mensaje</label><textarea id="${o.idTxt}" rows="6" readonly>${esc(txt)}</textarea>
      <div class="fila">${navigator.share ? `<button type="button" class="btn" data-compartirya="1">📤 Compartir</button>` : ""}<button type="button" class="btn-sec" data-copiarya="1">📋 Copiar</button></div>
      ${o.contacto ? enlacesContacto(o.contacto, txt) : ""}`;
    const bs = cont.querySelector("[data-compartirya]");
    if (bs) bs.addEventListener("click", () => { if (cont.dataset.gen === yo) navigator.share({ title: o.titulo, text: txt }).catch(() => {}); });
    cont.querySelector("[data-copiarya]").addEventListener("click", () => {
      if (cont.dataset.gen !== yo) return;
      const t = cont.querySelector("textarea"); t.focus(); t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast("Copiado"), () => { try { document.execCommand("copy"); toast("Copiado"); } catch (e) { /* nada */ } });
    });
  }
  function enviar(plan, cont) {
    const sn = !!plan.sinNombres;
    return prepararEnvio(cont, {
      corto: () => enlaceCorto(Object.assign({ tipo: "jugadores" }, paquete(plan, sn)), true),
      largo: () => enlaceDe(plan, sn),
      texto: (url) => textoGrupo(plan, url),
      titulo: plan.titulo || "Pizarra", idTxt: "txtGrupo",
      indicacion: "Pulsa «Compartir» y elige el grupo del equipo, o copia el mensaje y pégalo allí."
    });
  }


  // ---------------------------------------------------------------- compartir entre entrenadores
  function paqueteEntrenador(ids, sinApellidos) {
    const conNotas = !!($("#envNotas") && $("#envNotas").checked);
    const planes = db.planes.filter((p) => ids.includes(p.id)).map((p) => {
      const c = clon(p); delete c.sinNombres;
      if (!conNotas) { delete c.fbn; delete c.fbr; delete c.an; delete c.anOc; c.bloques.forEach((b) => { delete b.fb; }); } // el feedback va con las notas privadas
      return c;
    });
    const plantilla = clon(db.plantilla).map((j) => { if (sinApellidos) j.n = j.c || j.n.split(" ")[0]; if (!conNotas) { delete j.notas; delete j.foco; CONTACTO.forEach((k) => delete j[k]); } return j; });
    return { v: 1, tipo: "entrenador", equipo: clon(db.equipo), plantilla: plantilla, planes: planes };
  }
  const normNom = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  // Junta lo recibido con el cuaderno propio sin borrar nada. Devuelve un resumen.
  function juntar(rec) {
    // Se parte de lo último guardado (por si otra pestaña lo cambió) y se trabaja sobre una copia.
    let base = null;
    try { base = sanDB(JSON.parse(localStorage.getItem(CLAVE))); } catch (e) { base = null; }
    const db2 = clon(base || db);
    const r = { jugNuevos: 0, jugAct: 0, planNuevos: 0, planAct: 0, planMios: 0 };
    const mapa = {};
    const ids = (x) => [x.id].concat(x.alias || []);
    rec.plantilla.forEach((j) => {
      let ex = db2.plantilla.find((x) => ids(x).some((k) => ids(j).includes(k)));
      if (!ex) ex = db2.plantilla.find((x) => x.d === j.d && normNom(x.n) === normNom(j.n));
      if (!ex) { db2.plantilla.push(clon(j)); mapa[j.id] = j.id; r.jugNuevos++; return; }
      mapa[j.id] = ex.id;
      // Se recuerda que los dos identificadores son el mismo jugador.
      ex.alias = Array.from(new Set((ex.alias || []).concat(ids(j)).filter((k) => k !== ex.id))).slice(0, 10);
      const cambia = ["d", "n", "c", "p"].some((k) => (j[k] || "") !== (ex[k] || ""));
      const notasEx = ex.notas || [];
      if ((j.mod || 0) > (ex.mod || 0)) {
        Object.assign(ex, clon(j), { id: ex.id, alias: ex.alias }); ex.notas = notasEx; if (cambia) r.jugAct++;
        if (Array.isArray(j.notas) && !j.foco) delete ex.foco; // llegan sus notas sin foco: también se quitó allí
      }
      if (Array.isArray(j.notas) && j.notas.length) {
        const ids = new Set(notasEx.map((n) => n.id));
        const nuevas = j.notas.filter((n) => !ids.has(n.id));
        if (nuevas.length) { ex.notas = notasEx.concat(clon(nuevas)).slice(0, 80); r.notas = (r.notas || 0) + nuevas.length; }
      }
    });
    const m = (pid) => (pid && mapa[pid]) || pid;
    rec.planes.forEach((p0) => {
      const p = clon(p0);
      Object.keys(p.once || {}).forEach((k) => { p.once[k] = m(p.once[k]); });
      Object.keys(p.extra || {}).forEach((k) => { p.extra[k] = p.extra[k].map(m); });
      p.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj) f.pj = m(f.pj); }); });
      const i = db2.planes.findIndex((x) => x.id === p.id);
      if (i < 0) { p.sinNombres = false; db2.planes.push(p); r.planNuevos++; }
      else if ((p.mod || 0) > (db2.planes[i].mod || 0)) {
        const viejo = db2.planes[i];
        p.sinNombres = !!viejo.sinNombres;
        // el feedback solo viaja con las notas privadas: si no viene, se conserva el de este cuaderno
        if (!p.fbn && viejo.fbn) p.fbn = viejo.fbn;
        if (!p.fbr && viejo.fbr) p.fbr = viejo.fbr;
        if (!p.an && viejo.an) p.an = viejo.an;
        if (!p.anOc && viejo.anOc) p.anOc = viejo.anOc;
        p.bloques.forEach((b) => { if (!b.fb) { const v = viejo.bloques.find((x) => x.id === b.id); if (v && v.fb) b.fb = v.fb; } });
        db2.planes[i] = p; r.planAct++;
      }
      else r.planMios++;
    });
    if (rec.equipo) {
      if (!db2.equipo.nombre || db2.equipo.nombre === "Mi equipo") { db2.equipo.nombre = rec.equipo.nombre; db2.equipo.color = rec.equipo.color; }
      if (!db2.equipo.etapa && rec.equipo.etapa) db2.equipo.etapa = rec.equipo.etapa;
    }
    try { localStorage.setItem(CLAVE, JSON.stringify(db2)); } catch (e) { return null; }
    db = db2;
    return r;
  }
  function avisoJunta(r) {
    if (!r) { toast("No se ha podido guardar en este navegador (¿falta espacio?). No se ha juntado nada."); return false; }
    toast("Hecho: " + textoJunta(r)); return true;
  }
  function textoJunta(r) {
    const t = [];
    t.push(r.jugNuevos + " jugador" + (r.jugNuevos === 1 ? "" : "es") + " nuevo" + (r.jugNuevos === 1 ? "" : "s"));
    if (r.jugAct) t.push(r.jugAct + " jugador" + (r.jugAct === 1 ? "" : "es") + " actualizado" + (r.jugAct === 1 ? "" : "s"));
    t.push(r.planNuevos + " plan" + (r.planNuevos === 1 ? "" : "es") + " nuevo" + (r.planNuevos === 1 ? "" : "s"));
    if (r.planAct) t.push(r.planAct + " plan" + (r.planAct === 1 ? "" : "es") + " actualizado" + (r.planAct === 1 ? "" : "s"));
    if (r.notas) t.push(r.notas + " nota" + (r.notas === 1 ? "" : "s") + " de jugadores");
    if (r.planMios) t.push(r.planMios + " en los que tu versión era más reciente (se quedan como estaban)");
    return t.join(", ") + ".";
  }
  function enviarEntrenador(ids, cont) {
    const sa = $("#envSinApe");
    const pq = paqueteEntrenador(ids, !!(sa && sa.checked));
    return prepararEnvio(cont, {
      corto: () => enlaceCorto(pq, false),
      // con notas privadas o contactos, nunca un enlace sin cifrar
      largo: $("#envNotas") && $("#envNotas").checked ? null : () => location.origin + location.pathname + "#c=" + codificar(pq),
      texto: (url) => "Te paso el cuaderno de la pizarra (" + (db.equipo.nombre || "equipo") + "): plantilla y " + pq.planes.length + " plan" + (pq.planes.length === 1 ? "" : "es") + ". Ábrelo y pulsa «Juntar con mi cuaderno»:\n" + url,
      titulo: "Cuaderno de la pizarra", idTxt: "txtEntr", extra: "Enviar el cuaderno por enlace",
      indicacion: "Envíalo por privado al otro entrenador, nunca al grupo de jugadores."
    });
  }

  function pantRecibido(rec) {
    $("#nav").hidden = true;
    app.innerHTML = `
      <h1>Cuaderno recibido</h1>
      <div class="tarjeta">
        <p>Te han enviado el cuaderno de <b>${esc(rec.equipo && rec.equipo.nombre || "otro entrenador")}</b>: ${rec.plantilla.length} jugador${rec.plantilla.length === 1 ? "" : "es"} y ${rec.planes.length} plan${rec.planes.length === 1 ? "" : "es"}.</p>
        ${rec.planes.length ? lista(rec.planes.map((p) => (p.tipo === "partido" ? "Partido: " : "Entreno: ") + (p.titulo || "(sin título)") + (p.fecha ? " · " + fechaBonita(p.fecha) : ""))) : ""}
        <p class="peq">Se junta con lo que ya tienes en este móvil sin borrar nada. Los jugadores que ya tienes (mismo dorsal y nombre) no se duplican. Si un plan lo tenéis los dos, se queda la versión editada más tarde.</p>
        <div class="fila">
          <button type="button" class="btn" data-juntar="1">Juntar con mi cuaderno</button>
          <button type="button" class="btn-sec" data-nojuntar="1">Ahora no</button>
        </div>
      </div>`;
    app.querySelector("[data-juntar]").addEventListener("click", () => {
      const r = juntar(rec);
      if (!r) { avisoJunta(r); return; }
      history.replaceState(null, "", location.pathname);
      ir("cuaderno");
      avisoJunta(r);
    });
    app.querySelector("[data-nojuntar]").addEventListener("click", () => { history.replaceState(null, "", location.pathname); ir("cuaderno"); });
  }


  // ---------------------------------------------------------------- prioridad de la ficha
  // En una página no cabe todo lo marcado: se eligen una o dos cosas por área, primero las que tienen que ver
  // con lo que se está trabajando en los entrenos y los partidos recientes (situaciones, en qué fijarse, análisis
  // del partido y lo que ha costado). El foco es una mejora técnica o táctica, la que más se trabaja ahora.
  const VACIAS = new Set("para pero como cuando donde desde hasta entre sobre tiene tienen hacer antes despues mismo misma todos todas este esta estos estas cada otro otra".split(" "));
  const GENERICAS = new Set(["porte", "balon", "jugad", "compa", "rival", "rivale", "campo", "equip", "juego", "parti", "entre", "bien", "mejor", "siemp", "pase", "pasar", "recib", "momen", "lado"]);
  const raices = (t) => new Set(String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9ñ]+/)
    .filter((w) => w.length > 3 && !VACIAS.has(w)).map((w) => w.slice(0, 5)).filter((w) => !GENERICAS.has(w)));
  function trabajoReciente() {
    const hoy = Date.now(), cats = {}, bloques = [], pesos = {};
    const suma = (t, w) => raices(t).forEach((r) => { pesos[r] = (pesos[r] || 0) + w; });
    db.planes.filter((p) => { const t = Date.parse(p.fecha || ""); return isFinite(t) && hoy - t < 35 * 86400000 && t - hoy < 86400000; })
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).slice(0, 8).forEach((p) => {
        p.bloques.forEach((b) => {
          const peso = b.fb && (b.fb.c === 1 || b.fb.a === 1) ? 2 : 1; // lo que costó pesa más
          cats[b.cat] = (cats[b.cat] || 0) + peso;
          const t = [b.titulo, b.texto, b.consignas, b.fij, b.cuando, b.cond].join(" ");
          suma(t, peso);
          if (b.fij) bloques.push({ fij: b.fij, r: raices(t + " " + b.fij) });
        });
        analisisLista(p).filter((x) => x.cuesta).forEach((x) => suma(x.aspecto, 2));
      });
    return { cats, pesos, bloques };
  }
  function puntuar(n, tr, ahora) {
    let s = 0;
    if (n.s && tr.cats[n.s]) s += 2 + Math.min(tr.cats[n.s], 3);
    const asp = n.k && (FICHA.ASPECTOS || []).find((x) => x.k === n.k);
    raices(n.x + " " + (asp ? asp.t : "")).forEach((w) => { if (tr.pesos[w]) s += Math.min(tr.pesos[w], 3); });
    const dias = n.f ? (ahora - Date.parse(n.f)) / 86400000 : 999;
    if (dias < 21) s += 1; // anotado hace poco
    return s;
  }
  function prioridadNotas(j) {
    const notas = j.notas || [], tr = trabajoReciente(), ahora = Date.now();
    const pts = {}; notas.forEach((n) => { pts[n.id] = puntuar(n, tr, ahora); });
    const orden = (l) => l.slice().sort((a, b) => pts[b.id] - pts[a.id] || String(b.f).localeCompare(String(a.f)));
    const elegir = (t, porArea, max) => {
      const l = orden(notas.filter((n) => n.t === t)), cuenta = {}, r = [];
      l.forEach((n) => { const a = n.a || "_"; if ((cuenta[a] || 0) < porArea && r.length < max) { cuenta[a] = (cuenta[a] || 0) + 1; r.push(n); } });
      return r;
    };
    const fuertes = elegir("f", 2, 6), mejora = elegir("m", 2, 6);
    const tecTac = (n) => n.a === "tecnica" || n.a === "tactica" || n.a === "decision";
    let foco = (j.foco && notas.find((n) => n.id === j.foco && n.t === "m")) || orden(notas.filter((n) => n.t === "m" && tecTac(n)))[0] || mejora[0] || null;
    let fij = "";
    if (foco) {
      // 1) los estímulos relevantes del aspecto (por su clave o porque la nota es el texto del aspecto)
      const ESTI = FICHA.ESTIMULOS || {};
      const asp = (FICHA.ASPECTOS || []).find((x) => x.k === foco.k) || (FICHA.ASPECTOS || []).find((x) => normNom(x.t) === normNom(foco.x));
      if (asp && ESTI[asp.k]) fij = ESTI[asp.k];
      else {
        // 2) el «en qué fijarse» de un ejercicio reciente, solo si comparte al menos dos palabras específicas
        const rf = raices(foco.x); let mejor = 1;
        tr.bloques.forEach((b) => { let c = 0; rf.forEach((w) => { if (b.r.has(w)) c++; }); if (c > mejor) { mejor = c; fij = b.fij; } });
      }
    }
    const consejos = notas.filter((n) => n.t === "c");
    return { prio: fuertes.concat(mejora).concat(consejos).map((n) => n.id).filter((id, i, a) => a.indexOf(id) === i).slice(0, 20), foco: foco ? { id: foco.id, fij: fij } : null };
  }

  // ---------------------------------------------------------------- ficha en una página (A4)
  // Resumen visual de las notas de un jugador: puntos fuertes, foco de aprendizaje,
  // consejos por situación y cómo volver a la jugada. Se ve en pantalla y se imprime en A4.
  const ICONO_AREA = { tecnica: "⚽", tactica: "🧭", decision: "🧠", fisico: "⚡", atencion: "🧘" };
  function htmlInforme(d) {
    // d: { nombre, dorsal, puesto, etapa, equipo, color, notas, clave, gesto, fecha }
    const notas = d.notas || [];
    // con prioridad: solo las elegidas, en su orden; sin ella (enlaces antiguos): una o dos por área
    const porArea = (l, max) => { const c = {}; return l.filter((n) => { const a = n.a || "_"; c[a] = (c[a] || 0) + 1; return c[a] <= 2; }).slice(0, max); };
    const prio = Array.isArray(d.prio) && d.prio.length ? d.prio : null;
    const elegidas = (t, max) => prio ? prio.map((id) => notas.find((n) => n.id === id && n.t === t)).filter(Boolean).slice(0, max) : porArea(notas.filter((n) => n.t === t), max);
    const fuertes = elegidas("f", 6), mejora = elegidas("m", 6), consejos = notas.filter((n) => n.t === "c");
    const todasF = notas.filter((n) => n.t === "f"), todasM = notas.filter((n) => n.t === "m");
    const lista = (l, max, cls) => l.length
      ? `<ul class="inf-lista ${cls}">${l.slice(0, max).map((n) => `<li>${n.a ? `<span class="inf-ic" aria-hidden="true">${ICONO_AREA[n.a] || "•"}</span>` : ""}<span>${esc(n.x)}</span></li>`).join("")}</ul>`
      : `<p class="inf-vacio">Todavía nada anotado.</p>`;
    const tecTac = (n) => n.a === "tecnica" || n.a === "tactica" || n.a === "decision";
    const foco = (d.foco && notas.find((n) => n.id === d.foco.id)) || mejora.find(tecTac) || mejora[0];
    const focoFij = d.foco && foco && d.foco.id === foco.id ? d.foco.fij : "";
    const areas = Object.keys(AREAS).map((a) => {
      const f = todasF.filter((n) => n.a === a).length, m = todasM.filter((n) => n.a === a).length;
      const puntos = "●".repeat(Math.min(f, 5)), aprender = "●".repeat(Math.min(m, 5));
      return `<div class="inf-area"><div class="inf-area-tit"><span aria-hidden="true">${ICONO_AREA[a]}</span> ${esc(AREAS[a])}</div>
        <div class="inf-area-barras" aria-label="${f} puntos fuertes y ${m} por mejorar"><span class="inf-pf">${puntos || "–"}</span><span class="inf-am">${aprender || "–"}</span></div></div>`;
    }).join("");
    const porSit = {};
    consejos.forEach((n) => { const k = n.s || "_"; (porSit[k] = porSit[k] || []).push(n); });
    const sit = Object.keys(porSit).slice(0, 5).map((k) => `<div class="inf-sit"><span class="inf-chip">${esc(k === "_" ? "En cualquier momento" : CATS[k] || "")}</span><ul>${porSit[k].slice(0, 2).map((n) => `<li>${esc(n.x)}</li>`).join("")}</ul></div>`).join("");
    return `<article class="informe" style="--eq:${esc(d.color || "#C8102E")}">
      <header class="inf-cab">
        <div class="inf-dorsal" aria-hidden="true">${esc(d.dorsal)}</div>
        <div class="inf-quien"><h2>${esc(d.nombre)}</h2><p>${esc([d.puesto, d.etapa && !(d.equipo || "").toLowerCase().includes(d.etapa.toLowerCase()) ? d.etapa : "", d.equipo].filter(Boolean).join(" · "))}</p></div>
        <div class="inf-fecha">${esc(d.fecha || "")}</div>
      </header>
      ${foco ? `<section class="inf-foco"><span class="inf-etq">🎯 Tu foco ahora</span><p>${esc(foco.x)}</p>
        ${focoFij ? `<p class="inf-foco-fij"><b>En qué fijarte:</b> ${esc(focoFij)}</p>` : ""}
        <p class="inf-foco-int">Ponle toda la intención en cada entreno y en cada partido.</p></section>` : ""}
      <div class="inf-dos">
        <section class="inf-caja inf-fuerte"><h3>💪 Tus puntos fuertes</h3><p class="inf-sub">Úsalos: son tu ventaja en el partido.</p>${lista(fuertes, 7, "")}</section>
        <section class="inf-caja inf-mejora"><h3>📈 Lo que estás aprendiendo</h3><p class="inf-sub">Lo que más trabajamos ahora, poco a poco.</p>${lista(mejora.filter((n) => !foco || n.id !== foco.id), 5, "")}</section>
      </div>
      <section class="inf-areas"><h3>Tu mapa</h3><div class="inf-areas-fila">${areas}</div>
        <p class="inf-ley"><span class="inf-pf">●</span> punto fuerte · <span class="inf-am">●</span> por mejorar</p></section>
      ${sit ? `<section class="inf-caja inf-consejo"><h3>💡 En el partido</h3><div class="inf-sits">${sit}</div></section>` : ""}
      <footer class="inf-pie">
        <div><b>Si te distraes, vuelve:</b> ${d.clave ? `di «${esc(d.clave)}»` : "di tu palabra clave"}${d.gesto ? `, haz tu gesto (${esc(d.gesto)})` : ""} y vuelve a la jugada.</div>
        <div class="inf-firma">Tu entrenador</div>
      </footer>
    </article>`;
  }
  function abrirInforme(d) {
    const dlg = $("#dlgInforme");
    $("#dlgInformeCuerpo").innerHTML = htmlInforme(d);
    // enviarla por WhatsApp (solo desde el cuaderno del entrenador)
    const be = $("#dlgInformeEnviar"), ce = $("#dlgInformeEnvio");
    invalidarEnvio(ce); // una respuesta pendiente de otra ficha ya no se pinta aquí
    be.hidden = !d.enviar;
    be.onclick = d.enviar ? () => d.enviar(ce) : null;
    $("#dlgInformeTit").textContent = "Ficha de " + d.nombre;
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
  }
  $("#dlgInformeCerrar").addEventListener("click", () => $("#dlgInforme").close());
  $("#dlgInforme").addEventListener("close", () => invalidarEnvio($("#dlgInformeEnvio")));
  $("#dlgInformeImprimir").addEventListener("click", () => {
    document.body.classList.add("imprimiendo");
    const fin = () => { document.body.classList.remove("imprimiendo"); window.removeEventListener("afterprint", fin); };
    window.addEventListener("afterprint", fin);
    window.print();
    setTimeout(fin, 1500);
  });
  const fechaCorta = () => new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  // ---------------------------------------------------------------- notas del entrenador por jugador
  // Puntos fuertes, lo que tiene que mejorar y consejos para situaciones concretas.
  // Son privadas: el enlace del grupo no las lleva; cada jugador las recibe por un enlace propio.
  function notasJugador(pid) { const j = db.plantilla.find((x) => x.id === pid); return j ? (j.notas || []) : []; }
  function htmlNotas(notas, opciones) {
    const ed = opciones && opciones.editable;
    const grupo = (t, tit, vacio) => {
      const l = notas.filter((n) => n.t === t);
      if (!l.length && !ed) return "";
      const fo = opciones && opciones.foco;
      return `<h3>${tit}</h3>${l.length ? `<ul class="notas">${l.map((n) => `<li><span>${n.id === fo ? "⭐ " : ""}${n.a ? `<b>${esc(AREAS[n.a] || "")}</b>${n.s ? " · " : ""}` : ""}${n.s ? `<i>${esc(CATS[n.s] || "")}</i>` : ""}${n.a || n.s ? "<br>" : ""}${esc(n.x)}</span>${ed && t === "m" ? `<button type="button" class="btn-peq" data-nfoco="${esc(n.id)}" aria-pressed="${n.id === fo}" aria-label="Que sea su foco en la ficha">⭐ Foco</button>` : ""}${ed ? `<button type="button" class="btn-peq peligro" data-nborrar="${esc(n.id)}" aria-label="Borrar esta nota">✕</button>` : ""}</li>`).join("")}</ul>` : `<p class="peq">${vacio}</p>`}`;
    };
    return grupo("f", "💪 Puntos fuertes", "Aún no hay puntos fuertes anotados.") +
      grupo("m", "🎯 Lo que está aprendiendo", "Aún no hay nada anotado para mejorar.") +
      grupo("c", "💡 Consejos para situaciones de juego", "Aún no hay consejos para situaciones concretas.");
  }

  function htmlAspectos(j) {
    const portero = famDePuesto(j.p) === "por";
    const lista = (FICHA.ASPECTOS || []).filter((x) => !x.soloPortero || portero);
    const marcas = {};
    (j.notas || []).forEach((n) => { if (n.k) marcas[n.k] = n.t; });
    const grupos = [];
    lista.forEach((x) => { let g = grupos.find((y) => y.g === x.g); if (!g) { g = { g: x.g, items: [] }; grupos.push(g); } g.items.push(x); });
    return grupos.map((g, gi) => {
      const n = g.items.filter((x) => marcas[x.k]).length;
      return `<details class="det" data-grupo="${esc(g.g)}" ${gi === 0 ? "open" : ""}><summary>${esc(g.g)}${n ? ` <span class="chip">${n} marcado${n === 1 ? "" : "s"}</span>` : ""}</summary>
        <ul class="aspectos-lista">${g.items.map((x) => `<li><span>${esc(x.t)}</span><span class="marcas" role="group" aria-label="${esc(x.t)}">
          ${[["f", "💪", "Punto fuerte"], ["m", "🎯", "A mejorar"], ["c", "💡", "Consejo"]].map((m) => `<button type="button" class="marca" data-asp="${x.k}" data-tipo="${m[0]}" aria-pressed="${marcas[x.k] === m[0]}" aria-label="${m[2]}: ${esc(x.t)}" title="${m[2]}">${m[1]}</button>`).join("")}
        </span></li>`).join("")}</ul></details>`;
    }).join("");
  }
  function abrirNotas(pid, planId) {
    const j = db.plantilla.find((x) => x.id === pid); if (!j) return;
    const dlg = $("#dlgNotas"), cuerpo = $("#dlgNotasCuerpo");
    $("#dlgNotasTit").textContent = "Notas de " + (j.c || j.n);
    const planes = db.planes.slice().sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
    function pintarN() {
      cuerpo.innerHTML = `
        <div class="portada">
          <h1 style="margin:0"><span class="dorsal" style="background:var(--acento);margin-right:8px">${esc(j.d)}</span>${esc(j.n)}</h1>
          <p class="peq">${esc(j.p || "Sin puesto habitual")} · Estas notas son privadas: solo las verá ${esc(j.c || j.n)} si le envías su ficha.</p>
        </div>
        <section class="tarjeta">
          <h2 style="margin-top:0">Añadir una nota</h2>
          <fieldset class="tipos-nota"><legend class="sr-only">Tipo de nota</legend>
            ${Object.keys(TIPOS_NOTA).map((k, i) => `<label><input type="radio" name="nTipo" value="${k}" ${i === 0 ? "checked" : ""}> ${TIPOS_NOTA[k]}</label>`).join("")}
          </fieldset>
          <div class="fila">
            <div class="campo-f crece"><label for="nArea">Aspecto</label><select id="nArea"><option value="">General</option>${Object.keys(AREAS).map((k) => `<option value="${k}">${esc(AREAS[k])}</option>`).join("")}</select></div>
            <div class="campo-f crece"><label for="nSit">Situación de juego (opcional)</label><select id="nSit"><option value="">Cualquier situación</option>${Object.keys(CATS).map((k) => `<option value="${k}">${esc(CATS[k])}</option>`).join("")}</select></div>
          </div>
          <div class="campo-f"><label for="nTxt">Qué le dices</label>
            <textarea id="nTxt" rows="4" maxlength="400" placeholder="Ej.: Lee muy bien cuándo atacar la espalda del lateral. Le cuesta perfilarse antes de recibir."></textarea></div>
          <div class="fila">
            <button type="button" class="btn-sec" data-dictar="1">🎤 Dictar</button>
            <button type="button" class="btn" data-nguardar="1">Guardar nota</button>
          </div>
          <p class="peq" data-r="ayudaDictado" hidden>Pulsa el <b>micrófono del teclado</b> y habla: el móvil lo escribe por ti (en Mac, pulsa dos veces la tecla Fn). El dictado lo hace tu móvil, la pizarra no graba audio.</p>
        </section>
        <section class="tarjeta">
          <h2 style="margin-top:0">Contacto</h2>
          <p class="peq">Para enviarle su ficha por WhatsApp o por correo. Puedes poner dos contactos (por ejemplo, madre y padre). Solo se guardan en este móvil.</p>
          ${[["1", "tel", "mail", "nom1"], ["2", "tel2", "mail2", "nom2"]].map((c) => `
          <fieldset class="contacto"><legend>Contacto ${c[0]}</legend>
            <div class="campo-f"><label for="nNom${c[0]}">Quién es (opcional)</label><input type="text" id="nNom${c[0]}" data-cont="${c[3]}" autocomplete="off" maxlength="30" value="${esc(j[c[3]] || "")}" placeholder="${c[0] === "1" ? "Madre, el propio jugador…" : "Padre, tutor…"}"></div>
            <div class="fila">
              <div class="campo-f crece"><label for="nTel${c[0]}">Teléfono (WhatsApp)</label><input type="tel" id="nTel${c[0]}" data-cont="${c[1]}" inputmode="tel" autocomplete="off" maxlength="20" value="${esc(j[c[1]] || "")}" placeholder="600 000 000"></div>
              <div class="campo-f crece"><label for="nMail${c[0]}">Correo electrónico</label><input type="email" id="nMail${c[0]}" data-cont="${c[2]}" autocomplete="off" maxlength="100" value="${esc(j[c[2]] || "")}" placeholder="familia@correo.com"></div>
            </div>
          </fieldset>`).join("")}
        </section>
        <section class="tarjeta aspectos">
          <h2 style="margin-top:0">Marcar aspectos</h2>
          <p class="peq">Toca 💪 si es un punto fuerte, 🎯 si tiene que mejorarlo o 💡 si quieres darle un consejo. Vuelve a tocar para quitarlo. Para añadir un matiz, escribe una nota arriba.</p>
          ${htmlAspectos(j)}
        </section>
        <section class="tarjeta">${htmlNotas(j.notas || [], { editable: true, foco: j.foco })}
          <p class="peq">⭐ Foco: elige la mejora técnica o táctica que saldrá arriba de su ficha. Si no eliges, se pone la que más se trabaja ahora en los entrenos y los partidos.</p></section>
        <section class="tarjeta">
          <h2 style="margin-top:0">Enviar su ficha por privado</h2>
          <p class="peq">Se crea un enlace corto y cifrado solo para ${esc(j.c || j.n)}, con sus notas y el plan que elijas. El enlace del grupo nunca lleva las notas de nadie.</p>
          <div class="campo-f"><label for="nPlan">Con el plan</label><select id="nPlan"><option value="">Solo sus notas</option>${planes.map((p) => `<option value="${esc(p.id)}" ${p.id === planId ? "selected" : ""}>${esc(p.titulo || "(sin título)")} · ${esc(fechaBonita(p.fecha))}</option>`).join("")}</select></div>
          <div class="fila"><button type="button" class="btn" data-nenviar="1">📤 Preparar enlace privado</button><button type="button" class="btn-sec" data-ninforme="1">📄 Ver su ficha en una página (y enviarla)</button></div>
          <div data-r="envNotas"></div>
        </section>`;
      if (!planId && planes[0]) cuerpo.querySelector("#nPlan").value = planes[0].id;
    }
    cuerpo.oninput = (e) => {
      const k = e.target.dataset.cont; if (!k || !CONTACTO.includes(k)) return;
      const v = k.startsWith("tel") ? e.target.value.replace(/[^\d+]/g, "") : e.target.value.trim();
      if (v) j[k] = v; else delete j[k];
      j.mod = Date.now(); guardar();
    };
    cuerpo.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.dictar) {
        const t = $("#nTxt"); t.focus();
        const a = cuerpo.querySelector('[data-r="ayudaDictado"]'); a.hidden = false;
        return;
      }
      if (b.dataset.nguardar) {
        const x = $("#nTxt").value.trim();
        if (!x) { toast("Escribe o dicta la nota"); $("#nTxt").focus(); return; }
        const t = (cuerpo.querySelector('input[name="nTipo"]:checked') || {}).value || "f";
        j.notas = j.notas || [];
        if (j.notas.length >= 80) { toast("Ya hay 80 notas: borra alguna antigua para añadir más"); return; }
        j.notas.push({ id: uid(), t: t, a: $("#nArea").value, s: $("#nSit").value, x: x.slice(0, 400), f: hoyISO() });
        j.mod = Date.now(); guardar(); pintarN(); toast("Nota guardada");
        $("#nTxt").focus();
        return;
      }
      if (b.dataset.asp) {
        const x = (FICHA.ASPECTOS || []).find((y) => y.k === b.dataset.asp); if (!x) return;
        j.notas = j.notas || [];
        const ya = j.notas.find((n) => n.k === x.k);
        if (ya && ya.t === b.dataset.tipo) j.notas = j.notas.filter((n) => n !== ya);
        else if (ya) ya.t = b.dataset.tipo;
        else {
          if (j.notas.length >= 80) { toast("Ya hay 80 notas: borra alguna antigua para añadir más"); return; }
          j.notas.push({ id: uid(), t: b.dataset.tipo, a: x.a, s: "", x: x.t, k: x.k, f: hoyISO() });
        }
        j.mod = Date.now(); guardar();
        // repinta conservando qué grupos están abiertos y el sitio en la pantalla
        const abiertos = $$("details[data-grupo]", cuerpo).filter((d) => d.open).map((d) => d.dataset.grupo);
        const scroll = cuerpo.scrollTop, scrollD = dlg.scrollTop, sel = '[data-asp="' + x.k + '"][data-tipo="' + b.dataset.tipo + '"]';
        pintarN();
        $$("details[data-grupo]", cuerpo).forEach((d) => { d.open = abiertos.includes(d.dataset.grupo); });
        cuerpo.scrollTop = scroll; dlg.scrollTop = scrollD;
        const nb = cuerpo.querySelector(sel); if (nb) nb.focus({ preventScroll: true });
        return;
      }
      if (b.dataset.nborrar) {
        if (!window.confirm("¿Borrar esta nota?")) return;
        j.notas = (j.notas || []).filter((n) => n.id !== b.dataset.nborrar); j.mod = Date.now(); guardar(); pintarN(); return;
      }
      if (b.dataset.nfoco) {
        if (j.foco === b.dataset.nfoco) delete j.foco; else j.foco = b.dataset.nfoco;
        j.mod = Date.now(); guardar(); pintarN();
        toast(j.foco ? "Será su foco en la ficha" : "El foco se elegirá solo");
        return;
      }
      if (b.dataset.ninforme) {
        const pr = prioridadNotas(j);
        abrirInforme({ nombre: j.c || j.n, dorsal: j.d, puesto: j.p || "", etapa: (FICHA.ETAPAS[db.equipo.etapa] || {}).n || "", equipo: db.equipo.nombre, color: db.equipo.color, notas: j.notas || [], clave: "", gesto: "", fecha: fechaCorta(),
          prio: pr.prio, foco: pr.foco, enviar: (cont) => enviarFicha(j, null, cont) });
        return;
      }
      if (b.dataset.nenviar) {
        const plan = db.planes.find((p) => p.id === $("#nPlan").value) || null;
        enviarFicha(j, plan, cuerpo.querySelector('[data-r="envNotas"]'));
      }
    };
    pintarN();
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
  }
  // Envía la ficha de un jugador por privado (WhatsApp, correo o compartir), con o sin un plan.
  function enviarFicha(j, plan, cont) {
    const pr = prioridadNotas(j), foco = pr.foco;
    return prepararEnvio(cont, {
      corto: () => enlaceCorto(paqueteJugador(plan, j), true),
      largo: null, // una ficha privada nunca va sin cifrar
      // el contenido de las notas va solo dentro de la ficha cifrada, nunca en el texto del mensaje
      texto: (url) => "Hola " + (j.c || j.n.split(" ")[0]) + ", aquí tienes tu ficha: tus puntos fuertes, lo que estás aprendiendo" + (foco ? " y tu foco para los próximos entrenos y partidos. Ponle toda la intención." : ".") + "\n\nEs solo para ti:\n" + url,
      titulo: "Tu ficha", idTxt: "txtNotas" + (plan ? "" : "F"), extra: "La ficha privada del jugador",
      indicacion: "Envíalo por privado al jugador (o a su familia), nunca al grupo.",
      contacto: {
        tels: [{ tel: j.tel, nom: j.nom1 }, { tel: j.tel2, nom: j.nom2 }].filter((x) => x.tel),
        mails: [{ mail: j.mail, nom: j.nom1 }, { mail: j.mail2, nom: j.nom2 }].filter((x) => x.mail),
        asunto: "Tu ficha de la pizarra"
      }
    });
  }
  // Paquete privado: el plan (como lo ve el grupo) más las notas de un solo jugador.
  function paqueteJugador(plan, j) {
    const base = plan ? paquete(plan, !!plan.sinNombres) : { v: 1, eq: { n: db.equipo.nombre, col: db.equipo.color, et: db.equipo.etapa || "" }, plan: { tipo: "entreno", titulo: "Tu ficha", fecha: hoyISO(), sistema: "4231", once: {}, extra: {}, bloques: [] }, jug: [] };
    const pq = Object.assign({ tipo: "jugador" }, base);
    if (!pq.jug.some((x) => x.id === j.id)) pq.jug.push({ id: j.id, d: j.d, n: j.c || j.n.split(" ")[0], c: j.c || j.n.split(" ")[0], p: j.p || "" });
    pq.yo = j.id;
    pq.notas = clon(j.notas || []);
    const pr = prioridadNotas(j); pq.prio = pr.prio; if (pr.foco) pq.foco = pr.foco; // lo que sale en su ficha y su foco
    return pq;
  }
  $("#dlgNotasCerrar").addEventListener("click", () => { $("#dlgNotas").close(); });
  $("#dlgNotas").addEventListener("close", () => { if (estado.pant === "plantilla") pintarPantalla(); });

  // ---------------------------------------------------------------- sugerencias de Claude
  // Se envía a /api/pizarra-ia el apartado, la jugada y las notas SIN nombres (dorsal y puesto).
  const iaResultados = {};
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const PARTICULAS = new Set(["de", "da", "di", "do", "du", "la", "le", "lo", "el", "al", "en", "es", "na", "en", "ya", "va", "of", "y", "i"]);
  function quitarNombres(t) {
    let s = String(t || "");
    db.plantilla.forEach((j) => {
      const nombres = new Set([j.n, j.c].concat(String(j.n || "").split(/\s+/)).filter((x) => x && (x.length >= 3 || (x.length === 2 && !PARTICULAS.has(x.toLowerCase())))));
      nombres.forEach((nm) => { s = s.replace(new RegExp("(^|[^\\p{L}])" + escRe(nm) + "(?=[^\\p{L}]|$)", "giu"), "$1el jugador"); });
    });
    return s;
  }
  function entradaIA(plan, b) {
    const ctx = crearCtx(plan, db.plantilla, true);
    const E = FICHA.ETAPAS[db.equipo.etapa];
    const jugadores = [], porJug = {};
    const pasos = [];
    if (b.jug) {
      b.jug.pasos.forEach((p, i) => {
        pasos.push({
          paso: i + 1, titulo: quitarNombres(p.t || ""), transicion: p.tr === "p" ? "perdida" : p.tr === "r" ? "recuperacion" : "", balon: p.b.map(Math.round),
          fichas: b.jug.fichas.filter((f) => f.eq !== "c" && f.eq !== "b" && p.pos[f.id] && (f.eq === "a" || b.jug.rivales !== false))
            .map((f) => ({ ficha: f.id, equipo: f.eq === "a" ? "nuestro" : "rival", x: Math.round(p.pos[f.id][0]), y: Math.round(p.pos[f.id][1]) }))
        });
      });
      b.jug.fichas.filter((f) => f.eq === "a").forEach((f) => {
        const pid = ctx.pidDe(f), j = pid && db.plantilla.find((x) => x.id === pid);
        if (!j) return;
        if (Object.values(porJug).includes(j.id)) return;
        const alias = "J" + (jugadores.length + 1);
        porJug[alias] = j.id;
        const inf = ctx.info(f);
        jugadores.push({
          ficha: f.id, jugador: alias, puesto: quitarNombres(inf.rol || j.p || ""),
          notas: (j.notas || []).filter((n) => n.t !== "c" || n.s === b.cat).slice(0, 12).map((n) => ({ tipo: n.t === "f" ? "fuerte" : "mejora", area: n.a, situacion: CATS[n.s] || "", texto: quitarNombres(n.x) }))
        });
      });
    }
    return {
      porJug: porJug,
      entrada: {
        etapa: E ? E.n + " (" + E.edad + ")" : "", tipo: plan.tipo, sistema: (SISTEMAS[plan.sistema] || {}).n || "",
        objetivo: quitarNombres(plan.objetivo), clave: quitarNombres(plan.clave),
        bloque: { categoria: CATS[b.cat] || "", titulo: quitarNombres(b.titulo), texto: quitarNombres(b.texto), consignas: quitarNombres(b.consignas), fijarse: quitarNombres(b.fij), cuando: quitarNombres(b.cuando),
          fase: FASE_CORTA[b.fase] || "", condicion: quitarNombres(b.cond), preguntas: quitarNombres(b.preg) },
        pasos: pasos, jugadores: jugadores
      }
    };
  }
  const ERRORES_IA = {
    sin_clave: "Falta configurar la clave de Claude en Netlify (variable ANTHROPIC_API_KEY).",
    cuota: "Se ha llegado al máximo de consultas de hoy. Prueba mañana.",
    cuota_mes: "Ya has usado todas las sugerencias de Claude de este mes. Se renuevan el día 1.",
    servicio: "No se ha podido comprobar la suscripción. Prueba en unos minutos.",
    ocupado: "Claude está muy ocupado ahora mismo. Prueba en unos minutos.",
    clave: "La clave de Claude configurada en Netlify no es válida.",
    rechazo: "Claude no ha podido responder a esta consulta.",
    grande: "El apartado es demasiado grande para analizarlo."
  };
  const iaPendiente = {};
  function previaIA(plan, b, cont) {
    if (extrasBloqueados()) { cont.innerHTML = htmlInvitacion("Pedir sugerencias a Claude"); return; }
    const prep = entradaIA(plan, b);
    iaPendiente[b.id] = prep;
    const entrada = prep.entrada;
    const textos = [["Objetivo del plan", entrada.objetivo], ["Palabra clave", entrada.clave], ["Título", entrada.bloque.titulo], ["Explicación", entrada.bloque.texto],
      ["Consignas", entrada.bloque.consignas], ["En qué fijarse", entrada.bloque.fijarse], ["Cuándo", entrada.bloque.cuando],
      ["Paso del aprendizaje", entrada.bloque.fase], ["Condición", entrada.bloque.condicion], ["Preguntas", entrada.bloque.preguntas]]
      .concat(entrada.pasos.map((x) => ["Paso " + x.paso, x.titulo])).filter((x) => x[1]);
    const notas = [];
    entrada.jugadores.forEach((j) => j.notas.forEach((n) => notas.push(j.jugador + " (" + (j.puesto || "sin puesto") + "): " + n.texto)));
    if (entrada.jugadores.length) textos.push(["Jugadores", entrada.jugadores.map((j) => j.jugador + (j.puesto ? " (" + j.puesto + ")" : "")).join(", ")]);
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ Antes de pedir la propuesta</h3>
      <p class="peq">Esto es lo que se enviará a Claude (Anthropic). Los jugadores van como J1, J2… y se quitan los nombres de la plantilla. Si alguna nota lleva otros datos personales (familiares, salud…), edítala antes en la ficha del jugador.</p>
      <p><b>Apartado:</b> ${esc(entrada.bloque.categoria)}${entrada.bloque.titulo ? " · " + esc(entrada.bloque.titulo) : ""} · ${entrada.pasos.length} paso${entrada.pasos.length === 1 ? "" : "s"} de pizarra · edad: ${esc(entrada.etapa || "sin indicar")}</p>
      ${textos.length ? `<details class="det" open><summary>Textos que se envían (${textos.length})</summary><ul class="consignas">${textos.map((x) => `<li><b>${esc(x[0])}:</b> ${esc(x[1])}</li>`).join("")}</ul></details>` : ""}
      ${notas.length ? `<details class="det" open><summary>Notas de jugadores que se envían (${notas.length})</summary><ul class="consignas">${notas.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details>` : `<p class="peq">No se envía ninguna nota de jugador.</p>`}
      <div class="fila"><button type="button" class="btn" data-iaconfirmar="${esc(b.id)}">Enviar a Claude</button><button type="button" class="btn-sec" data-iadescartar="${esc(b.id)}">Cancelar</button></div>
    </div>`;
  }
  async function pedirIA(plan, b, cont) {
    const prep = iaPendiente[b.id]; delete iaPendiente[b.id];
    if (!prep) { previaIA(plan, b, cont); return; }
    const { entrada, porJug } = prep;
    cont.innerHTML = `<p class="peq ia-espera">✨ Claude está preparando la propuesta. Puede tardar un minuto…</p>`;
    let job;
    try {
      const r = await fetch("/api/pizarra-ia", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, cabCodigo()), body: JSON.stringify(entrada) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 402) { SUS.modo = true; SUS.activa = false; cont.innerHTML = htmlInvitacion("Pedir sugerencias a Claude"); return; }
      if (r.ok && SUS.ia) SUS.ia.usadas++;
      if (!r.ok || !j.job) throw new Error(j.error || "red");
      job = j.job;
    } catch (e) { cont.innerHTML = `<p class="sin-puesto">${esc(ERRORES_IA[e.message] || "No se ha podido pedir la propuesta. Comprueba la conexión y vuelve a intentarlo.")}</p>`; return; }
    for (let i = 0; i < 80; i++) {
      await new Promise((ok) => setTimeout(ok, i < 5 ? 2000 : 3000));
      if (!cont.isConnected) return;
      let r;
      try { r = await (await fetch("/api/pizarra-ia?job=" + job, { cache: "no-store" })).json(); } catch (e) { continue; }
      if (r.estado === "pendiente") continue;
      if (r.estado === "listo" && r.resultado) { iaResultados[b.id] = { res: r.resultado, porJug: porJug }; pintarIA(plan, b, cont); return; }
      cont.innerHTML = `<p class="sin-puesto">${esc(ERRORES_IA[r.error] || "Claude no ha podido terminar la propuesta. Vuelve a intentarlo.")}</p>`;
      return;
    }
    cont.innerHTML = `<p class="sin-puesto">La propuesta está tardando demasiado. Vuelve a intentarlo.</p>`;
  }
  // Claude diseña la pizarra del apartado a partir de su ficha (sin datos de jugadores).
  const iaPizarras = {}, iaPzPend = {}, iaPzGen = {};
  function entradaPizarraIA(plan, b) {
    const E = FICHA.ETAPAS[db.equipo.etapa];
    return { modo: "pizarra", etapa: E ? E.n + " (" + E.edad + ")" : "", tipo: plan.tipo, jugadores: db.plantilla.length,
      bloque: { categoria: CATS[b.cat] || "", titulo: quitarNombres(b.titulo), texto: quitarNombres(b.texto), consignas: quitarNombres(b.consignas),
        fijarse: quitarNombres(b.fij), cuando: quitarNombres(b.cuando), fase: FASE_CORTA[b.fase] || "", condicion: quitarNombres(b.cond),
        equipoCondicion: !b.cond || !b.condEq ? "" : b.condEq === "a" ? "nuestro" : b.condEq === "r" ? "rival" : "peto " + b.condEq } };
  }
  function previaPizarraIA(plan, b, cont) {
    if (extrasBloqueados()) { cont.innerHTML = htmlInvitacion("Diseñar la pizarra con Claude"); return; }
    const e = entradaPizarraIA(plan, b);
    if (!e.bloque.texto && !e.bloque.titulo) { cont.innerHTML = `<p class="sin-puesto">Escribe antes la explicación del ejercicio: Claude diseña la pizarra a partir de ella.</p>`; return; }
    const textos = [["Título", e.bloque.titulo], ["Explicación", e.bloque.texto], ["Consignas", e.bloque.consignas], ["En qué fijarse", e.bloque.fijarse], ["Cuándo", e.bloque.cuando], ["Condición", e.bloque.condicion], ["La tiene", e.bloque.equipoCondicion]].filter((x) => x[1]);
    iaPzPend[b.id] = e; // se envía exactamente lo que se muestra
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ Diseñar la pizarra con Claude</h3>
      <p class="peq">Claude propone el espacio, las fichas, los conos y los pasos de la jugada a partir de la ficha del apartado. Se envía esto a Claude (Anthropic), sin la plantilla ni las notas de los jugadores. Revisa que el texto no lleve datos personales (salud, familia…):</p>
      <ul class="consignas">${textos.map((x) => `<li><b>${esc(x[0])}:</b> ${esc(x[1])}</li>`).join("")}</ul>
      ${b.jug ? `<p class="peq">Este apartado ya tiene pizarra: verás la propuesta antes de sustituirla.</p>` : ""}
      <div class="fila"><button type="button" class="btn" data-iapzok="${esc(b.id)}">Diseñar</button><button type="button" class="btn-sec" data-iapzno="${esc(b.id)}">Cancelar</button></div>
    </div>`;
  }
  async function pedirPizarraIA(plan, b, cont) {
    const entrada = iaPzPend[b.id]; delete iaPzPend[b.id];
    if (!entrada) { previaPizarraIA(plan, b, cont); return; }
    const gen = iaPzGen[b.id] = (iaPzGen[b.id] || 0) + 1;
    const vigente = () => iaPzGen[b.id] === gen && cont.isConnected;
    cont.innerHTML = `<p class="peq ia-espera">✨ Claude está diseñando la pizarra. Puede tardar un minuto…</p>`;
    let job;
    try {
      const r = await fetch("/api/pizarra-ia", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, cabCodigo()), body: JSON.stringify(entrada) });
      const j = await r.json().catch(() => ({}));
      if (!vigente()) return;
      if (r.status === 402) { SUS.modo = true; SUS.activa = false; cont.innerHTML = htmlInvitacion("Diseñar la pizarra con Claude"); return; }
      if (!r.ok || !j.job) throw new Error(j.error || "red");
      if (SUS.ia) SUS.ia.usadas++;
      job = j.job;
    } catch (e) { if (vigente()) cont.innerHTML = `<p class="sin-puesto">${esc(ERRORES_IA[e.message] || "No se ha podido pedir el diseño. Comprueba la conexión y vuelve a intentarlo.")}</p>`; return; }
    for (let i = 0; i < 80; i++) {
      await new Promise((ok) => setTimeout(ok, i < 5 ? 2000 : 3000));
      if (!vigente()) return;
      let r;
      try { r = await (await fetch("/api/pizarra-ia?job=" + job, { cache: "no-store" })).json(); } catch (e) { continue; }
      if (r.estado === "pendiente") continue;
      if (!vigente()) return;
      const jug = r.estado === "listo" && r.resultado ? sanJugada(r.resultado.jugada) : null;
      if (jug) { iaPizarras[b.id] = { jug: jug, txt: String(r.resultado.explicacion || "").slice(0, 600) }; pintarPizarraIA(plan, b, cont); return; }
      cont.innerHTML = `<p class="sin-puesto">${esc(ERRORES_IA[r.error] || "Claude no ha podido diseñar la pizarra. Vuelve a intentarlo.")}</p>`;
      return;
    }
    if (vigente()) cont.innerHTML = `<p class="sin-puesto">El diseño está tardando demasiado. Vuelve a intentarlo.</p>`;
  }
  function pintarPizarraIA(plan, b, cont) {
    const it = iaPizarras[b.id]; if (!it) { cont.innerHTML = ""; return; }
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ Pizarra propuesta</h3>
      ${it.txt ? `<p><b>Para ti:</b> ${esc(it.txt)}</p>` : ""}
      <p class="peq">Pulsa «Reproducir» para ver la jugada. Si la aplicas, después puedes mover cualquier ficha a mano.</p>
      <div data-r="iapzvista" id="iapzv-${esc(b.id)}"></div>
      <div class="fila"><button type="button" class="btn" data-iapzaplicar="${esc(b.id)}">${b.jug ? "Sustituir la pizarra" : "Aplicar"}</button><button type="button" class="btn-sec" data-iapzno="${esc(b.id)}">Descartar</button></div>
    </div>`;
    crearPizarra(cont.querySelector('[data-r="iapzvista"]'), { ctx: crearCtx(plan, db.plantilla, true), jug: clon(it.jug), cat: b.cat, editable: false });
  }
  function aplicarPizarraIA(plan, b, cont) {
    const it = iaPizarras[b.id]; if (!it) return;
    if (b.jug && !window.confirm("¿Sustituir la pizarra actual de este apartado por la propuesta?")) return;
    b.jug = clon(it.jug); delete iaPizarras[b.id];
    plan.mod = Date.now(); guardar(); pintarPantalla();
    toast("Pizarra aplicada: ábrela para retocarla");
  }

  // ---------------------------------------------------------------- memoria del equipo (feedbacks) y Claude
  // Se calcula en el móvil a partir de «Cómo ha ido». Claude no guarda nada: cada vez se le envía este historial sin nombres.
  const conFeedback = (p) => !!(p.fbn || p.fbr || p.an || p.anOc || p.bloques.some((b) => b.fb));
  function planesConFeedback(excluir) {
    return db.planes.filter((p) => p.id !== excluir && conFeedback(p)).sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  }
  function historialIA(excluir, max) {
    const h = historialCompleto(excluir, max);
    while (h.length > 1 && JSON.stringify(h).length > 40000) h.pop(); // las más antiguas fuera: la consulta tiene un tamaño máximo
    return h;
  }
  function historialCompleto(excluir, max) {
    return planesConFeedback(excluir).slice(0, max || 8).map((p) => ({
      fecha: p.fecha, tipo: p.tipo, titulo: quitarNombres(p.titulo), objetivo: quitarNombres(p.objetivo).slice(0, 300), nota: quitarNombres(p.fbn), resultado: quitarNombres(p.fbr),
      analisis: analisisLista(p).map((x) => ({ aspecto: x.aspecto, valor: x.valor })),
      // solo los apartados con feedback (y como mucho 12): así la consulta no crece sin límite
      bloques: p.bloques.filter((b) => b.fb || !p.bloques.some((x) => x.fb)).slice(0, 12).map((b) => !b.fb ? { categoria: CATS[b.cat] || "", titulo: quitarNombres(b.titulo) } : ({ categoria: CATS[b.cat] || "", titulo: quitarNombres(b.titulo), texto: quitarNombres(b.texto).slice(0, 300), fase: FASE_CORTA[b.fase] || "",
        fijarse: quitarNombres(b.fij), cuando: quitarNombres(b.cuando), condicion: quitarNombres(b.cond),
        como: b.fb && b.fb.c ? ["", "costó", "regular", "bien"][b.fb.c] : "", estimulos: b.fb && b.fb.a ? ["", "no", "a veces", "sí"][b.fb.a] : "", nota: quitarNombres(b.fb && b.fb.n) }))
    }));
  }
  function htmlMemoria() {
    const pls = planesConFeedback().slice(0, 10);
    if (!pls.length) return db.planes.length ? `<div class="tarjeta memoria"><h3 style="margin-top:0">🧠 Memoria del equipo</h3><p class="peq">Cuando acabes un entreno o un partido, rellena «📝 Cómo ha ido» dentro del plan. Con esos feedbacks verás aquí lo que cuesta y lo que va bien, y Claude podrá proponerte el próximo entreno.</p></div>` : "";
    const cuesta = [], bien = [];
    pls.forEach((p) => p.bloques.forEach((b) => {
      if (!b.fb) return;
      const t = (b.titulo || CATS[b.cat]) + " · " + fechaBonita(p.fecha) + (b.fb.n ? ": " + b.fb.n : "");
      if (b.fb.c === 1 || b.fb.a === 1) cuesta.push(t); else if (b.fb.c === 3 && b.fb.a !== 2) bien.push(t);
    }));
    const partido = pls.find((p) => p.tipo === "partido" && (p.fbn || p.fbr));
    return `<div class="tarjeta memoria">
      <h3 style="margin-top:0">🧠 Memoria del equipo</h3>
      <p class="peq">${pls.length} sesi${pls.length === 1 ? "ón" : "ones"} con feedback. Se guarda solo en este móvil.</p>
      ${cuesta.length ? `<p><b>Lo que cuesta</b></p><ul class="consignas">${cuesta.slice(0, 5).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${bien.length ? `<p><b>Lo que va bien</b></p><ul class="consignas">${bien.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${(function () {
        const ul = pls.find((p) => p.tipo === "partido" && (p.an || p.anOc)); if (!ul) return "";
        const l = analisisLista(ul), mal = l.filter((x) => x.cuesta), bienP = l.filter((x) => x.fuerte);
        return `<p><b>Análisis del partido</b> <span class="peq">(${esc(fechaBonita(ul.fecha))}${ul.rival ? ", contra " + esc(ul.rival) : ""})</span></p>${mal.length ? `<p class="peq"><b>A mejorar:</b> ${esc(mal.map((x) => x.aspecto.replace(/^¿|\?$/g, "") + " (" + x.valor.toLowerCase() + ")").join(" · "))}</p>` : ""}${bienP.length ? `<p class="peq"><b>Fortalezas:</b> ${esc(bienP.map((x) => x.aspecto).join(" · "))}</p>` : ""}`;
      })()}
      ${partido ? `<p><b>Último partido</b> (${esc(fechaBonita(partido.fecha))}${partido.rival ? ", contra " + esc(partido.rival) : ""}${partido.fbr ? ", " + esc(partido.fbr) : ""})${partido.fbn ? ": " + esc(partido.fbn) : ""}</p>` : ""}
      <h3>✨ El próximo entreno</h3>
      <div class="campo-f"><label for="entQuiero">¿Qué quieres trabajar? (opcional)</label>
        <div class="fila fb-nota"><textarea id="entQuiero" maxlength="300" rows="2" placeholder="Por ejemplo: la salida de balón, que en el último partido nos costó"></textarea>
        <button type="button" class="btn-peq" data-fbdictar="entQuiero" aria-label="Dictar qué quieres trabajar">🎤 Dictar</button></div></div>
      <p class="peq" data-r="ayudaDictadoFb" hidden>Pulsa el <b>micrófono del teclado</b> y habla: el móvil lo escribe por ti. El dictado lo hace tu móvil, la pizarra no graba audio.</p>
      <div class="fila"><label for="entMin" class="peq">Duración</label><select id="entMin" style="width:auto"><option value="60">60 min</option><option value="75" selected>75 min</option><option value="90">90 min</option></select>
        <button type="button" class="btn ia-btn" data-entpedir="1">✨ Proponer el próximo entreno</button></div>
      <div data-r="iaent"></div>
    </div>`;
  }
  // Consulta genérica a /api/pizarra-ia con vigencia: una respuesta antigua no pisa una nueva.
  const iaFbGen = {}, iaFbPend = {}, iaFbRes = {};
  let iaFbMin = 0;
  async function consultaIA(clave, entrada, cont, espera, alListo) {
    const gen = iaFbGen[clave] = (iaFbGen[clave] || 0) + 1;
    const vigente = () => iaFbGen[clave] === gen && cont.isConnected;
    cont.innerHTML = `<p class="peq ia-espera">✨ ${esc(espera)} Puede tardar un minuto…</p>`;
    let job;
    try {
      const r = await fetch("/api/pizarra-ia", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, cabCodigo()), body: JSON.stringify(entrada) });
      const j = await r.json().catch(() => ({}));
      if (!vigente()) return;
      if (r.status === 402) { SUS.modo = true; SUS.activa = false; cont.innerHTML = htmlInvitacion("Pedir propuestas a Claude"); return; }
      if (!r.ok || !j.job) throw new Error(j.error || "red");
      if (SUS.ia) SUS.ia.usadas++;
      job = j.job;
    } catch (e) { if (vigente()) cont.innerHTML = `<p class="sin-puesto">${esc(ERRORES_IA[e.message] || "No se ha podido hacer la consulta. Comprueba la conexión y vuelve a intentarlo.")}</p>`; return; }
    for (let i = 0; i < 80; i++) {
      await new Promise((ok) => setTimeout(ok, i < 5 ? 2000 : 3000));
      if (!vigente()) return;
      let r;
      try { r = await (await fetch("/api/pizarra-ia?job=" + job, { cache: "no-store" })).json(); } catch (e) { continue; }
      if (r.estado === "pendiente") continue;
      if (!vigente()) return;
      if (r.estado === "listo" && r.resultado) { iaFbRes[clave] = r.resultado; alListo(r.resultado); return; }
      cont.innerHTML = `<p class="sin-puesto">${esc(ERRORES_IA[r.error] || "Claude no ha podido terminar. Vuelve a intentarlo.")}</p>`;
      return;
    }
    if (vigente()) cont.innerHTML = `<p class="sin-puesto">Está tardando demasiado. Vuelve a intentarlo.</p>`;
  }
  const etapaTxt = () => { const E = FICHA.ETAPAS[db.equipo.etapa]; return E ? E.n + " (" + E.edad + ")" : ""; };
  // Convierte un apartado propuesto por Claude en un apartado del plan.
  function bloqueDePropuesta(x, tipo) {
    const o = { id: uid(), cat: own(CATS, x.categoria) ? x.categoria : "ejercicio", titulo: x.titulo || "", min: tipo === "partido" ? "" : (x.minutos || ""),
      texto: x.texto || "", consignas: (x.consignas || []).join("\n"), fij: x.fijarse || "", cuando: x.cuando || "", jug: null };
    if (tipo === "entreno") { if (own(FASES, x.fase)) o.fase = x.fase; if (x.condicion) { o.cond = x.condicion; o.condEq = "a"; } }
    if (x.preguntas && x.preguntas.length) o.preg = x.preguntas.join("\n");
    return o;
  }
  const htmlPropuesta = (x) => `<p><b>${esc(x.titulo)}</b>${x.minutos ? ` <span class="peq">· ${esc(x.minutos)} min</span>` : ""}${x.fase && FASE_CORTA[x.fase] ? ` <span class="peq">· ${esc(FASE_CORTA[x.fase])}</span>` : ""}</p>
    ${x.texto ? `<p>${esc(x.texto)}</p>` : ""}
    ${x.fijarse ? `<p><b>🎯 En qué fijarse:</b> ${esc(x.fijarse)}</p>` : ""}${x.cuando ? `<p><b>⏱️ Cuándo:</b> ${esc(x.cuando)}</p>` : ""}
    ${x.condicion ? `<p><b>🥅 Condición:</b> ${esc(x.condicion)}</p>` : ""}`;

  // ----- alternativas de un ejercicio
  // Las notas y textos libres que se enviarán, para revisarlos antes de confirmar.
  function htmlNotasEnvio(h, extra) {
    const t = (extra || []).filter(Boolean);
    h.forEach((p) => { [p.nota, p.resultado && "Resultado: " + p.resultado].filter(Boolean).forEach((x) => t.push(fechaBonita(p.fecha) + " · " + x)); p.bloques.forEach((x) => { if (x.nota) t.push(fechaBonita(p.fecha) + " · " + x.titulo + ": " + x.nota); }); });
    return t.length ? `<details class="det"><summary>Notas que se envían (${t.length}): revísalas</summary><ul class="consignas">${t.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>` : "";
  }
  function previaAlternativas(plan, b, cont) {
    if (extrasBloqueados()) { cont.innerHTML = htmlInvitacion("Pedir alternativas a Claude"); return; }
    const fb = b.fb || {};
    const entrada = { modo: "alternativas", etapa: etapaTxt(), tipo: plan.tipo, historial: historialIA(plan.id, 5),
      bloque: { categoria: CATS[b.cat] || "", titulo: quitarNombres(b.titulo), texto: quitarNombres(b.texto), consignas: quitarNombres(b.consignas), fase: FASE_CORTA[b.fase] || "",
        fijarse: quitarNombres(b.fij), cuando: quitarNombres(b.cuando), condicion: quitarNombres(b.cond),
        como: fb.c ? ["", "costó", "regular", "bien"][fb.c] : "", estimulos: fb.a ? ["", "no", "a veces", "sí"][fb.a] : "", nota: quitarNombres(fb.n) } };
    if (!entrada.bloque.titulo && !entrada.bloque.texto) { cont.innerHTML = `<p class="sin-puesto">Escribe antes la explicación del ejercicio.</p>`; return; }
    iaFbPend["alt" + b.id] = entrada;
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ Alternativas con Claude</h3>
      <p class="peq">Claude busca los estímulos relevantes y los objetivos de este ejercicio y propone variantes parecidas, teniendo en cuenta cómo ha ido${entrada.historial.length ? " y la memoria del equipo (" + entrada.historial.length + " sesiones)" : ""}. Se envía sin nombres: la ficha del apartado${fb.c || fb.a || fb.n ? ", su feedback" : ""}${entrada.historial.length ? " y los feedbacks recientes" : ""}. Revisa que las notas no lleven datos personales.</p>
      ${fb.c || fb.a || fb.n ? `<p class="peq"><b>Feedback:</b> ${esc([entrada.bloque.como && "ha ido " + entrada.bloque.como, entrada.bloque.estimulos && "estímulos: " + entrada.bloque.estimulos, entrada.bloque.nota].filter(Boolean).join(" · "))}</p>` : `<p class="peq">Este apartado aún no tiene feedback: rellénalo en «📝 Cómo ha ido» para que las alternativas sean más ajustadas.</p>`}
      ${htmlNotasEnvio(entrada.historial, [entrada.bloque.nota && "Este apartado: " + entrada.bloque.nota])}
      <div class="fila"><button type="button" class="btn" data-altok="${esc(b.id)}">Pedir alternativas</button><button type="button" class="btn-sec" data-altno="${esc(b.id)}">Cancelar</button></div>
    </div>`;
  }
  function invalidarAlt(bid) {
    if (!iaFbPend["alt" + bid]) return;
    delete iaFbPend["alt" + bid];
    const c = app.querySelector(`[data-r="iaalt-${bid}"]`); if (c) c.innerHTML = `<p class="peq">Has cambiado el feedback: vuelve a pulsar «Alternativas con Claude» para revisar lo que se envía.</p>`;
  }
  function pedirAlternativas(plan, b, cont) {
    const entrada = iaFbPend["alt" + b.id]; delete iaFbPend["alt" + b.id];
    if (!entrada) { previaAlternativas(plan, b, cont); return; }
    consultaIA("alt" + b.id, entrada, cont, "Claude está preparando alternativas.", (r) => pintarAlternativas(plan, b, cont, r));
  }
  function pintarAlternativas(plan, b, cont, r) {
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ Alternativas</h3>
      ${r.analisis ? `<p><b>Para ti:</b> ${esc(r.analisis)}</p>` : ""}
      ${r.estimulos ? `<p><b>🎯 Estímulos relevantes:</b> ${esc(r.estimulos)}</p>` : ""}
      ${r.objetivos.length ? `<p><b>Objetivos que trabaja:</b></p><ul class="consignas">${r.objetivos.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${r.alternativas.map((a, i) => `<div class="alt-prop"><p class="peq"><b>Variante ${i + 1}:</b> ${esc(a.cambio)}</p>${htmlPropuesta(a.bloque)}
        <button type="button" class="btn-peq" data-altadd="${esc(b.id)}" data-i="${i}">＋ Añadir como apartado</button></div>`).join("")}
      <div class="fila"><button type="button" class="btn-sec" data-altno="${esc(b.id)}">Cerrar</button></div>
      <p class="peq">Se añade justo después de este apartado, sin pizarra: después puedes pulsar «Diseñar la pizarra con Claude».</p>
    </div>`;
  }
  function anadirAlternativa(plan, b, i) {
    const r = iaFbRes["alt" + b.id]; const a = r && r.alternativas[i]; if (!a) return;
    if (plan.bloques.length >= MAX.bloques) { toast("Has llegado al máximo de apartados"); return; }
    const k = plan.bloques.indexOf(b);
    plan.bloques.splice(k + 1, 0, bloqueDePropuesta(a.bloque, plan.tipo));
    plan.mod = Date.now(); guardar();
    toast("Añadida «" + (a.bloque.titulo || "alternativa") + "»");
    const bt = app.querySelector(`[data-altadd="${b.id}"][data-i="${i}"]`); if (bt) { bt.disabled = true; bt.textContent = "✓ Añadida"; }
    const cont = app.querySelector(`[data-r="iaalt-${b.id}"]`);
    // se repinta el plan para ver el apartado nuevo, conservando las alternativas a la vista
    pintarPantalla();
    const c2 = app.querySelector(`[data-r="iaalt-${b.id}"]`); if (c2 && r) { pintarAlternativas(plan, b, c2, r); }
    if (cont) { /* nada */ }
  }

  // ----- el próximo entreno a partir de la memoria del equipo
  function previaEntreno(cont) {
    if (extrasBloqueados()) { cont.innerHTML = htmlInvitacion("Pedir un entreno a Claude"); return; }
    const h = historialIA("", 8);
    if (!h.length) { cont.innerHTML = `<p class="sin-puesto">Aún no hay feedbacks.</p>`; return; }
    const entrada = { modo: "entreno", etapa: etapaTxt(), quiero: quitarNombres($("#entQuiero").value), minutos: +$("#entMin").value || 75, jugadores: db.plantilla.length, historial: h };
    iaFbPend.ent = entrada;
    cont.innerHTML = `<div class="ia-propuesta">
      <p class="peq">Se envían a Claude (Anthropic), sin nombres, los planes y los feedbacks de las últimas ${h.length} sesiones (títulos, objetivos, explicaciones, en qué fijarse, condiciones y notas)${entrada.quiero ? " y lo que quieres trabajar" : ""}. Revisa que ningún texto lleve datos personales.</p>
      ${htmlNotasEnvio(h, [entrada.quiero && "Qué quieres trabajar: " + entrada.quiero])}
      <div class="fila"><button type="button" class="btn" data-entok="1">Proponer</button><button type="button" class="btn-sec" data-entno="1">Cancelar</button></div>
    </div>`;
  }
  function pedirEntreno(cont) {
    const entrada = iaFbPend.ent; delete iaFbPend.ent;
    if (!entrada) { previaEntreno(cont); return; }
    iaFbMin = entrada.minutos;
    consultaIA("ent", entrada, cont, "Claude está preparando el entreno.", (r) => pintarEntreno(cont, r));
  }
  function pintarEntreno(cont, r) {
    const min = r.bloques.reduce((t, x) => t + (x.minutos || 0), 0);
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ ${esc(r.titulo || "Próximo entreno")}</h3>
      ${r.analisis ? `<p><b>Por qué:</b> ${esc(r.analisis)}</p>` : ""}
      ${r.objetivo ? `<p><b>Objetivo:</b> ${esc(r.objetivo)}</p>` : ""}
      <p class="peq">${r.bloques.length} apartados${min ? " · " + min + " min" : ""}${iaFbMin && min && Math.abs(min - iaFbMin) > 10 ? ` (pediste ${iaFbMin}: ajusta los minutos al crearlo)` : ""}</p>
      ${r.bloques.map((x, i) => `<details class="det"${i === 0 ? " open" : ""}><summary>${i + 1}. ${esc(x.titulo)}${x.minutos ? " · " + esc(x.minutos) + "'" : ""}</summary>${htmlPropuesta(x)}</details>`).join("")}
      <div class="fila"><button type="button" class="btn" data-entcrear="1">Crear este entreno</button><button type="button" class="btn-sec" data-entno="1">Descartar</button></div>
      <p class="peq">Se crea como un entreno nuevo con fecha de hoy. Después puedes cambiar lo que quieras y diseñar cada pizarra.</p>
    </div>`;
  }
  function crearEntrenoPropuesto() {
    const r = iaFbRes.ent; if (!r) return;
    const p = { id: uid(), mod: Date.now(), tipo: "entreno", fecha: hoyISO(), titulo: (r.titulo || "Entreno").slice(0, 80), rival: "", objetivo: r.objetivo || "", notas: "",
      sistema: "4231", once: {}, bloques: r.bloques.slice(0, MAX.bloques).map((x) => bloqueDePropuesta(x, "entreno")) };
    autoOnce(p);
    const limpio = sanPlan(p); if (!limpio) return;
    db.planes.push(limpio); delete iaFbRes.ent; guardar();
    ir("plan", { planId: limpio.id });
    toast("Entreno creado: revísalo y diseña las pizarras");
  }
  function etiquetaFicha(plan, b, id) {
    const f = b.jug && b.jug.fichas.find((x) => x.id === id); if (!f) return id;
    const inf = crearCtx(plan, db.plantilla, true).info(f);
    return [inf.dorsal, inf.corto || inf.rol].filter(Boolean).join(" ") || id;
  }
  function pintarIA(plan, b, cont) {
    const it = iaResultados[b.id]; if (!it) { cont.innerHTML = ""; return; }
    const r = it.res;
    const nombre = (a) => { const j = db.plantilla.find((x) => x.id === it.porJug[a]); return j ? j.d + " · " + (j.c || j.n) : a; };
    cont.innerHTML = `<div class="ia-propuesta">
      <h3>✨ Propuesta de Claude</h3>
      <p><b>Para ti:</b> ${esc(r.analisis)}</p>
      <p><b>Explicación para el grupo:</b> ${esc(r.texto)}</p>
      ${r.consignas.length ? `<p><b>Consignas:</b></p><ul class="consignas">${r.consignas.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
      ${r.fijarse ? `<p><b>🎯 En qué fijarse:</b> ${esc(r.fijarse)}</p>` : ""}${r.cuando ? `<p><b>⏱️ Cuándo:</b> ${esc(r.cuando)}</p>` : ""}
      ${r.condicion ? `<p><b>🥅 Condición:</b> ${esc(r.condicion)}</p>` : ""}
      ${r.preguntas && r.preguntas.length ? `<p><b>❓ Preguntas para después:</b></p><ul class="consignas">${r.preguntas.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
      ${r.individual.length ? `<p><b>Consejos privados:</b></p><ul class="consignas">${r.individual.map((i) => `<li><b>${esc(nombre(i.jugador))}:</b> ${esc(i.texto)}</li>`).join("")}</ul>` : ""}
      ${r.mensaje ? `<p><b>Mensaje para el grupo:</b> ${esc(r.mensaje)}</p>` : ""}
      ${r.indicaciones.length ? `<details class="det" open><summary>Indicaciones para la pizarra (${r.indicaciones.length}): las verá todo el grupo</summary><ul class="consignas">${r.indicaciones.map((i) => `<li><b>Paso ${i.paso} · ${esc(etiquetaFicha(plan, b, i.ficha))}:</b> ${esc([i.que, i.fijate && "Fíjate: " + i.fijate, i.cuando && "Cuándo: " + i.cuando].filter(Boolean).join(" · "))}</li>`).join("")}</ul></details>` : ""}
      <fieldset class="lista-env"><legend class="peq"><b>Qué quieres aplicar</b></legend>
        <label><input type="checkbox" data-iaop="texto" checked> Explicación y consignas</label>
        <label><input type="checkbox" data-iaop="atencion" checked> En qué fijarse y cuándo</label>
        ${plan.tipo === "entreno" ? `<label><input type="checkbox" data-iaop="condicion" ${r.condicion ? "checked" : "disabled"}> La condición (qué vale gol)</label>` : ""}
        <label><input type="checkbox" data-iaop="preguntas" ${r.preguntas && r.preguntas.length ? "checked" : "disabled"}> Preguntas para después (no se envían a los jugadores)</label>
        <label><input type="checkbox" data-iaop="pizarra" ${r.indicaciones.length ? "" : "disabled"}> Indicaciones de cada jugador en la pizarra (${r.indicaciones.length}): revísalas arriba, las verá todo el grupo</label>
        <label><input type="checkbox" data-iaop="privado" ${r.individual.length ? "checked" : "disabled"}> Consejos privados en la ficha de cada jugador (${r.individual.length})</label>
      </fieldset>
      <div class="fila">
        <button type="button" class="btn" data-iaaplicar="${esc(b.id)}">Aplicar</button>
        <button type="button" class="btn-sec" data-iadescartar="${esc(b.id)}">Descartar</button>
      </div>
      <p class="peq">Revisa la propuesta: lo que apliques sustituye lo que había en esos campos. Las indicaciones de la pizarra las ve todo el grupo; los consejos privados solo van en el enlace privado de cada jugador.</p>
    </div>`;
  }
  function aplicarIA(plan, b, cont) {
    const it = iaResultados[b.id]; if (!it) return;
    const r = it.res;
    const op = (k) => { const c = cont.querySelector(`[data-iaop="${k}"]`); return c && c.checked; };
    if (op("texto")) { b.texto = r.texto; b.consignas = r.consignas.join("\n"); }
    if (op("atencion")) { b.fij = r.fijarse; b.cuando = r.cuando; }
    if (op("condicion") && r.condicion) b.cond = r.condicion.slice(0, 300);
    if (op("preguntas") && r.preguntas && r.preguntas.length) b.preg = r.preguntas.join("\n").slice(0, 600);
    if (op("pizarra") && b.jug) {
      r.indicaciones.forEach((i) => {
        const p = b.jug.pasos[i.paso - 1]; if (!p || !b.jug.fichas.some((f) => f.id === i.ficha)) return;
        p.tips = p.tips || {};
        const prev = p.tips[i.ficha] || {};
        p.tips[i.ficha] = { m: i.que, p: prev.p || "", f: i.fijate, q: i.cuando };
        if (!p.tips[i.ficha].p) delete p.tips[i.ficha].p;
      });
    }
    const sinSitio = [];
    if (op("privado")) {
      r.individual.forEach((i) => {
        const j = db.plantilla.find((x) => x.id === it.porJug[i.jugador]); if (!j) return;
        j.notas = j.notas || [];
        if (j.notas.length >= 80) { sinSitio.push(j.c || j.n); return; }
        j.notas.push({ id: uid(), t: "c", a: "", s: b.cat, x: i.texto.slice(0, 400), f: hoyISO() });
        j.mod = Date.now();
      });
    }
    delete iaResultados[b.id];
    plan.mod = Date.now(); guardar(); pintarPantalla();
    toast(sinSitio.length ? "Aplicada. No caben más notas en la ficha de " + sinSitio.join(", ") + " (máximo 80)" : "Propuesta aplicada");
  }

  // ---------------------------------------------------------------- lectura en voz alta
  // Síntesis de voz del propio dispositivo (Web Speech API): no envía nada fuera.
  const voz = (function () {
    const ok = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let btnActivo = null;
    function vozEs() {
      // Solo voces instaladas en el dispositivo: las remotas enviarían el texto a un servidor.
      const vs = (window.speechSynthesis.getVoices() || []).filter((v) => v.localService === true);
      return vs.find((v) => /^es[-_]ES/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || vs.find((v) => /^ca/i.test(v.lang)) || null;
    }
    function limpiar(t) {
      return String(t || "").replace(/\p{Extended_Pictographic}/gu, "").replace(/[·•]/g, ",").replace(/\s+/g, " ").trim();
    }
    function marcar(b, on) {
      if (!b) return;
      if (on) { b.dataset.txt = b.dataset.txt || b.textContent; b.textContent = "■ Parar"; b.setAttribute("aria-pressed", "true"); }
      else { if (b.dataset.txt) b.textContent = b.dataset.txt; b.setAttribute("aria-pressed", "false"); }
    }
    function parar() { if (!ok) return; window.speechSynthesis.cancel(); marcar(btnActivo, false); btnActivo = null; }
    function hablar(texto, btn) {
      if (!ok) return;
      parar();
      const t = limpiar(texto); if (!t) return;
      // Frases cortas: algunos navegadores cortan las locuciones largas.
      const trozos = t.match(/[^.!?;:]+[.!?;:]*/g) || [t];
      const v = vozEs();
      if (!v) { toast("Este dispositivo no tiene una voz en castellano instalada. Puedes añadirla en los ajustes de accesibilidad del móvil."); return; }
      btnActivo = btn || null; marcar(btnActivo, true);
      trozos.forEach((tr, k) => {
        const u = new SpeechSynthesisUtterance(tr.trim());
        u.lang = v.lang; u.voice = v; u.rate = 0.95;
        if (k === trozos.length - 1) u.onend = () => { if (btn && btnActivo === btn) { marcar(btn, false); btnActivo = null; } };
        window.speechSynthesis.speak(u);
      });
    }
    function textoDe(el) {
      if (!el) return "";
      const c = el.cloneNode(true);
      c.querySelectorAll("button, select, input, textarea, svg, label, .burbuja, [aria-hidden=true]").forEach((x) => x.remove());
      c.querySelectorAll("li, p, h1, h2, h3, h4, summary, .msg b").forEach((x) => x.append(". "));
      return c.textContent.replace(/(\.\s*){2,}/g, ". ");
    }
    function alternar(el, btn) {
      if (btnActivo && btnActivo === btn) { parar(); return; }
      hablar(textoDe(el), btn);
    }
    const hablando = () => ok && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
    if (ok) window.speechSynthesis.getVoices();
    return { ok: ok, hablar: hablar, parar: parar, alternar: alternar, textoDe: textoDe, hablando: hablando };
  })();
  let vozAuto = false;
  try { vozAuto = sessionStorage.getItem("pz_voz") === "1"; } catch (e) { /* nada */ }

  // ---------------------------------------------------------------- ficha del jugador
  function puestosDe(plan, ctx, pid) {
    const sl = slotsDe(plan), res = [], vistos = new Set();
    const add = (idx) => { const s2 = sl[idx]; if (s2 && !vistos.has(s2[0])) { vistos.add(s2[0]); res.push({ fam: s2[2], rol: s2[1] }); } };
    sl.forEach((s2, idx) => { const l = ctx.pidsDe({ id: "a" + idx, eq: "a" }); if (l.includes(pid)) add(idx); });
    plan.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj === pid && /^a\d+$/.test(f.id)) add(+f.id.slice(1)); }); });
    if (!res.length) { const j = ctx.jugador(pid); if (j && j.p && famDePuesto(j.p)) res.push({ fam: famDePuesto(j.p), rol: j.p }); }
    return res;
  }
  const lista = (arr) => `<ul class="consignas">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const secLeer = () => (voz.ok ? `<button type="button" class="btn-peq leer" data-leer="1">🔊 Escuchar</button>` : "");

  function abrirFicha(plan, ctx, pid, etapaIni) {
    const dlg = $("#dlgFicha"), cuerpo = $("#dlgFichaCuerpo");
    const j = ctx.jugador(pid);
    const pus = puestosDe(plan, ctx, pid);
    const pu = pus[0] || { fam: "", rol: "" };
    let fam = own(FICHA.PUESTOS, pu.fam) ? pu.fam : "med";
    let etapa = own(FICHA.ETAPAS, etapaIni) ? etapaIni : "";
    const pal = (function () { try { return JSON.parse(localStorage.getItem("pz_mivuelta") || "{}"); } catch (e) { return {}; } })();
    function pintarFicha() {
      voz.parar();
      const P = FICHA.PUESTOS[fam], E = FICHA.ETAPAS[etapa];
      const nombre = j ? (j.c || j.n) : "Jugador";
      $("#dlgFichaTit").textContent = "Ficha de " + nombre;
      // Lo específico de este plan: cada pizarra y cada paso en que sale
      let especifico = "";
      plan.bloques.forEach((b) => {
        if (!b.jug) return;
        b.jug.fichas.filter((x) => x.eq !== "c" && ctx.pidsDe(x).includes(pid)).forEach((f) => {
        const rolF = ctx.info(f).rol;
        const pasos = b.jug.pasos.map((p, k) => {
          const t = (p.tips || {})[f.id] || {};
          const ms = analizar(ctx, b.jug, p, f.id, b.cat);
          const que = ms.find((m) => m.clave), fij = ms.find((m) => m.tit === "Fíjate en"), per = ms.find((m) => m.tit === "Perfil");
          const lin = [];
          if (t.m) lin.push(`<li><b>Entrenador:</b> ${esc(t.m)}</li>`);
          if (que) lin.push(`<li><b>Qué haces:</b> ${esc(que.txt)}</li>`);
          if (t.p || per) lin.push(`<li><b>Perfil:</b> ${esc(t.p || per.txt)}</li>`);
          if (t.f || fij) lin.push(`<li><b>Fíjate en:</b> ${esc(t.f || fij.txt)}</li>`);
          if (t.q) lin.push(`<li><b>Cuándo:</b> ${esc(t.q)}</li>`);
          if (p.tr) lin.unshift(`<li><b>${esc(TRANS[p.tr])}</b></li>`);
          return `<li><b>Paso ${k + 1}${p.t ? ": " + esc(p.t) : ""}</b><ul>${lin.join("")}</ul></li>`;
        }).join("");
        const at = (b.fij ? `<p><b>En qué fijarte en este ejercicio:</b> ${esc(b.fij)}</p>` : "") + (b.cuando ? `<p><b>Cuándo:</b> ${esc(b.cuando)}</p>` : "");
        especifico += `<details class="det"><summary>${esc(b.titulo || CATS[b.cat])}${rolF ? " · de " + esc(rolF.toLowerCase()) : ""}</summary>${at ? `<div class="atencion">${at}</div>` : ""}<ol class="consignas">${pasos}</ol></details>`;
        });
      });
      const generalFij = plan.bloques.filter((b) => b.fij || b.cuando).map((b) => `${b.titulo || CATS[b.cat]}: ${[b.fij, b.cuando && "cuándo: " + b.cuando].filter(Boolean).join(", ")}`);
      const mia = ctx.yo && ctx.yo === pid;
      const palabra = (mia && pal.p) || plan.clave || "";
      cuerpo.innerHTML = `
        <div class="portada">
          <h1 style="margin:0">${j ? `<span class="dorsal" style="background:var(--acento);margin-right:8px">${esc(j.d)}</span>` : ""}${esc(nombre)}</h1>
          <p class="peq">${pus.length ? "Juegas de " + esc(pus.map((x) => x.rol.toLowerCase()).join(" y de ")) : esc(P.n)}${E ? " · " + esc(E.n) + " (" + esc(E.edad) + ")" : ""}</p>
          ${pus.length > 1 ? `<div class="fila" role="group" aria-label="Tus puestos">${pus.map((x) => `<button type="button" class="btn-peq" data-fam="${esc(x.fam)}" aria-pressed="${x.fam === fam}">${esc(x.rol)}</button>`).join("")}</div>` : ""}
          <div class="fila" style="margin-top:8px">
            <label class="peq" for="fPuesto">Puesto</label>
            <select id="fPuesto" style="width:auto">${Object.keys(FICHA.PUESTOS).map((k) => `<option value="${k}" ${k === fam ? "selected" : ""}>${esc(FICHA.PUESTOS[k].n)}</option>`).join("")}</select>
            <label class="peq" for="fEtapa">Edad</label>
            <select id="fEtapa" style="width:auto"><option value="">Elige tu categoría</option>${Object.keys(FICHA.ETAPAS).map((k) => `<option value="${k}" ${k === etapa ? "selected" : ""}>${esc(FICHA.ETAPAS[k].n)} (${esc(FICHA.ETAPAS[k].edad)})</option>`).join("")}</select>
          </div>
          ${voz.ok ? `<button type="button" class="btn" data-leertodo="1" style="margin-top:10px">🔊 Escuchar toda la ficha</button>` : ""}
        </div>
        <section class="tarjeta">${secLeer()}<h2>Tu papel</h2><p>${esc(P.papel)}</p></section>
        ${pid === ctx.notasYo && (ctx.notas || []).length ? `<section class="tarjeta mis-notas">${secLeer()}<h2>Lo que te dice tu entrenador</h2>${htmlNotas(ctx.notas, {})}</section>` : ""}
        ${especifico ? `<section class="tarjeta">${secLeer()}<h2>En este ${plan.tipo === "partido" ? "partido" : "entreno"}, paso a paso</h2><p class="peq">Lo que te pide el entrenador y lo que haces en cada momento de cada jugada. Toca cada apartado para abrirlo.</p>${especifico}</section>` : ""}
        <section class="tarjeta">${secLeer()}<h2>En qué fijarte siempre</h2>${lista(P.fijate.concat(generalFij))}
          <p class="peq">La atención es limitada: no se puede mirar todo a la vez. Por eso conviene saber qué mirar y cuándo; con los entrenos, el cuerpo aprende a hacerlo solo.</p></section>
        <section class="tarjeta">${secLeer()}<h2>Táctica: qué haces en cada momento</h2>
          <h3>Cuando tenemos el balón</h3>${lista(P.conBalon)}
          <h3>Cuando lo tiene el rival</h3>${lista(P.sinBalon)}
          <h3>Justo al robar</h3><p>${esc(P.robo)}</p>
          <h3>Justo al perderlo</h3><p>${esc(P.perdida)}</p>
          ${E ? `<h3>Para tu edad</h3><p>${esc(E.tactica)}</p>` : ""}</section>
        <section class="tarjeta">${secLeer()}<h2>Técnica: qué entrenar</h2>${lista(P.tecnica)}${E ? `<p><b>En tu etapa:</b> ${esc(E.tecnica)}</p>` : ""}</section>
        <section class="tarjeta">${secLeer()}<h2>Físico</h2>
          ${E ? `<p>${esc(E.fase)}</p><h3>Lo que más te conviene ahora</h3>${lista(E.fisico)}` : `<p class="peq">Elige tu categoría arriba para ver qué te conviene entrenar según tu edad.</p>`}
          <h3>Lo que pide tu puesto</h3>${lista(P.fisico)}</section>
        <section class="tarjeta">${secLeer()}<h2>Para entrenar por tu cuenta</h2>${lista(P.solo)}<p class="peq">Mejor poco y bien hecho que mucho y cansado. Si algo duele, para y coméntalo.</p></section>
        <section class="tarjeta">${secLeer()}<h2>${etapa === "cadete" || etapa === "juvenil" ? "Para dominar el puesto" : "Lo que vendrá más adelante"}</h2>${lista(P.avanzado)}</section>
        <section class="tarjeta">${secLeer()}<h2>Atención y emociones</h2>
          ${E ? lista(E.cabeza) : ""}
          <p>Cuando te des cuenta de que te has ido de la jugada (un error, un pensamiento, el ruido de la grada), no luches con ello: ${palabra ? "di tu palabra clave («" + esc(palabra) + "»)" : "di tu palabra clave"}${mia && pal.g ? ", haz tu gesto (" + esc(pal.g) + ")" : ""} y vuelve a lo que es importante en la jugada.</p></section>
        ${E ? `<section class="tarjeta">${secLeer()}<h2>Cuida tu cuerpo</h2>${lista(E.cuidado)}</section>` : ""}
        <p class="peq" style="text-align:center">Son pautas generales de desarrollo deportivo. Cada jugador crece a su ritmo; tu entrenador te ayudará a ver qué es lo tuyo.</p>`;
    }
    cuerpo.onchange = (e) => {
      if (e.target.id === "fPuesto" && own(FICHA.PUESTOS, e.target.value)) { fam = e.target.value; pintarFicha(); $("#fPuesto").focus(); }
      if (e.target.id === "fEtapa") { etapa = own(FICHA.ETAPAS, e.target.value) ? e.target.value : ""; pintarFicha(); $("#fEtapa").focus(); }
    };
    cuerpo.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.fam && own(FICHA.PUESTOS, b.dataset.fam)) { fam = b.dataset.fam; pintarFicha(); return; }
      if (b.dataset.leertodo) {
        if (b.getAttribute("aria-pressed") === "true") voz.parar();
        else { const c = cuerpo.cloneNode(true); const por = c.querySelector(".portada"); if (por) por.remove(); voz.hablar(voz.textoDe(c), b); }
      } else if (b.dataset.leer) voz.alternar(b.closest("section"), b);
    };
    pintarFicha();
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    cuerpo.scrollTop = 0;
  }

  // ---------------------------------------------------------------- vista del jugador
  let pizarrasVista = [];
  function vistaJugador(cont, pq, opciones) {
    const plan = pq.plan, jug = pq.jug || [];
    const ctx = crearCtx(plan, jug, false);
    let yo = "";
    try { yo = sessionStorage.getItem("pz_yo") || ""; } catch (e) { /* sin almacenamiento */ }
    if (pq.yo && jug.some((j) => j.id === pq.yo) && !yo) yo = pq.yo;
    if (!jug.some((j) => j.id === yo)) yo = "";
    ctx.yo = yo || null;
    ctx.notasYo = pq.yo || null; ctx.notas = pq.notas || [];
    pizarrasVista.forEach((p) => p.parar()); pizarrasVista = [];
    cont.innerHTML = `
      ${opciones && opciones.volver ? `<button type="button" class="btn-sec" data-volverplan="1" style="margin-bottom:10px">← Volver a editar</button>` : ""}
      <div class="portada">
        <span class="chip ${plan.tipo === "partido" ? "partido" : ""}">${plan.tipo === "partido" ? "Partido" : "Entreno"}</span>
        <h1>${esc(plan.titulo || "")}</h1>
        <p class="peq">${esc(pq.eq && pq.eq.n || "")}${plan.fecha ? " · " + esc(fechaBonita(plan.fecha)) : ""}${plan.rival ? " · contra " + esc(plan.rival) : ""}</p>
        ${jug.length ? `<div class="yo-sel"><label for="selYo"><b>¿Quién eres?</b></label>
          <select id="selYo"><option value="">Elige tu dorsal</option>${jug.slice().sort((a, b) => a.d - b.d).map((j) => `<option value="${esc(j.id)}" ${yo === j.id ? "selected" : ""}>${esc(j.d)} · ${esc(j.c || j.n)}</option>`).join("")}</select></div>
          <div class="fila" style="margin-top:10px"><button type="button" class="btn" data-mificha="1" ${yo ? "" : "hidden"}>📋 Mi ficha: qué mirar y qué entrenar</button></div>` : ""}
        ${voz.ok ? `<label class="voz-auto"><input type="checkbox" id="vozAuto" ${vozAuto ? "checked" : ""}> 🔊 Leer en voz alta mis mensajes en cada paso</label>` : ""}
      </div>
      ${plan.objetivo ? `<div class="tarjeta"><h3>${plan.tipo === "partido" ? "La idea" : "Objetivo"}</h3><p>${esc(plan.objetivo).replace(/\n/g, "<br>")}</p></div>` : ""}
      ${plan.notas ? `<div class="tarjeta"><h3>Notas</h3><p>${esc(plan.notas).replace(/\n/g, "<br>")}</p></div>` : ""}
      ${pq.yo && (pq.notas || []).length ? `<section class="tarjeta mis-notas" data-r="misNotas" ${yo === pq.yo ? "" : "hidden"}>${voz.ok ? `<button type="button" class="btn-peq leer" data-leer="1">🔊 Escuchar</button>` : ""}<h2 style="margin-top:0">Lo que te dice tu entrenador</h2><p class="peq">Solo para ti. Sácale partido a lo que haces bien y céntrate en lo que estás aprendiendo.</p>
        <button type="button" class="btn" data-miinforme="1" style="margin:4px 0 10px">📄 Mi ficha en una página</button>
        <details class="det"><summary>Ver todas las notas</summary>${htmlNotas(pq.notas, {})}</details></section>` : ""}
      <div data-r="bloques"></div>
      <section class="tarjeta">
        ${voz.ok ? `<button type="button" class="btn-peq leer" data-leer="1">🔊 Escuchar</button>` : ""}
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
      d.innerHTML = `${voz.ok ? `<button type="button" class="btn-peq leer" data-leer="1">🔊 Escuchar</button>` : ""}<h2 style="margin-top:0">${bi + 1}. ${esc(b.titulo || CATS[b.cat])}${b.min && plan.tipo === "entreno" ? ` <span class="peq">· ${esc(b.min)} min</span>` : ""}</h2>
        ${b.texto ? `<p>${esc(b.texto).replace(/\n/g, "<br>")}</p>` : ""}
        ${cons.length ? `<ul class="consignas">${cons.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        ${b.fij || b.cuando ? `<div class="atencion">${b.fij ? `<p><b>🎯 En qué fijarte:</b> ${esc(b.fij)}</p>` : ""}${b.cuando ? `<p><b>⏱️ Cuándo:</b> ${esc(b.cuando)}</p>` : ""}</div>` : ""}
        <div data-r="cond">${htmlCondicion(b, ctx, yo)}</div>
        <div data-r="mio"></div>
        ${b.jug ? `<div data-r="pz" id="pzv${bi}"></div>` : ""}`;
      bc.appendChild(d);
      if (b.jug) {
        const pz = crearPizarra(d.querySelector('[data-r="pz"]'), { ctx: ctx, jug: b.jug, cat: b.cat, editable: false, yoPid: yo, equipoColor: pq.eq && pq.eq.col,
          abrirFicha: (pid) => abrirFicha(plan, ctx, pid, pq.eq && pq.eq.et), vozAuto: () => vozAuto });
        pizarrasVista.push(pz);
      }
      pintarMio(d.querySelector('[data-r="mio"]'), b, ctx, yo);
    });
    // enlace solo con la ficha (sin plan): se abre directamente en una página
    if (!plan.bloques.length && pq.yo && yo === pq.yo && (pq.notas || []).length) setTimeout(() => { const bi = cont.querySelector("[data-miinforme]"); if (bi) bi.click(); }, 60);
    const mf = cont.querySelector("[data-mificha]");
    if (mf) mf.addEventListener("click", () => { if (yo) abrirFicha(plan, ctx, yo, pq.eq && pq.eq.et); });
    const va = cont.querySelector("#vozAuto");
    if (va) va.addEventListener("change", () => { vozAuto = va.checked; if (!vozAuto) voz.parar(); try { sessionStorage.setItem("pz_voz", vozAuto ? "1" : ""); } catch (e) { /* nada */ } });
    cont.onclick = (e) => {
      if (e.target.closest("[data-miinforme]")) {
        const j = jug.find((x) => x.id === pq.yo) || {};
        const pus = puestosDe(plan, ctx, pq.yo).map((x) => x.rol).filter(Boolean);
        let mv = {}; try { mv = JSON.parse(localStorage.getItem("pz_mivuelta") || "{}"); } catch (err) { mv = {}; }
        abrirInforme({ nombre: j.c || j.n || "", dorsal: j.d, puesto: pus.join(" / "), etapa: (FICHA.ETAPAS[pq.eq && pq.eq.et] || {}).n || "", equipo: pq.eq && pq.eq.n, color: pq.eq && pq.eq.col, notas: pq.notas || [], clave: mv.p || plan.clave || "", gesto: mv.g || "", fecha: fechaCorta(),
          prio: pq.prio, foco: pq.foco });
        return;
      }
      const b = e.target.closest("[data-leer]"); if (!b || b.closest("#dlgFicha")) return;
      voz.alternar(b.closest("section, .tarjeta"), b);
    };
    const sy = cont.querySelector("#selYo");
    if (sy) sy.addEventListener("change", () => {
      yo = sy.value;
      ctx.yo = yo || null;
      const mn = cont.querySelector('[data-r="misNotas"]'); if (mn) mn.hidden = !(yo && yo === pq.yo);
      if (mf) mf.hidden = !yo;
      try { sessionStorage.setItem("pz_yo", yo); } catch (e) { /* nada */ }
      pizarrasVista.forEach((p) => p.seleccionarJugador(yo));
      $$(".bloque", cont).forEach((d, bi) => {
        pintarMio(d.querySelector('[data-r="mio"]'), plan.bloques[bi], ctx, yo);
        const c = d.querySelector('[data-r="cond"]'); if (c) c.innerHTML = htmlCondicion(plan.bloques[bi], ctx, yo);
      });
    });
  }
  // La condición del apartado y si la tiene el equipo de este jugador (por color de peto o de equipo).
  function htmlCondicion(b, ctx, yo) {
    if (!b.cond) return "";
    let quien = "";
    if (b.condEq) {
      const nombreEq = b.condEq === "a" ? "las fichas del color del equipo" : b.condEq === "r" ? "las fichas azules" : "los de peto " + b.condEq;
      const mias = yo && b.jug ? b.jug.fichas.filter((x) => (x.eq === "a" || x.eq === "r") && ctx.pidsDe(x).includes(yo)) : [];
      const eqDe = (f) => f.peto || f.eq;
      if (mias.length && mias.some((f) => eqDe(f) === b.condEq)) quien = "Tu equipo tiene la condición: búscala.";
      else if (mias.length) quien = "La condición la tiene el otro equipo (" + nombreEq + "): que no la consigan.";
      else quien = "La tienen " + nombreEq + ".";
    }
    return `<div class="condicion"><p><b>🥅 La condición:</b> ${esc(b.cond)}</p>${quien ? `<p>${esc(quien)}</p>` : ""}</div>`;
  }
  function pintarMio(el, b, ctx, yo) {
    if (!el) return;
    if (!yo || !b.jug) { el.innerHTML = ""; return; }
    const fs = b.jug.fichas.filter((x) => x.eq !== "c" && ctx.pidsDe(x).includes(yo));
    if (!fs.length) { el.innerHTML = `<p class="peq mi-papel">En esta pizarra no sales: fíjate en lo que hacen tus compañeros de puesto.</p>`; return; }
    const f = fs[0];
    const lin = [];
    b.jug.pasos.forEach((p, i) => {
      const t = (p.tips || {})[f.id];
      if (t && (t.m || t.p || t.f || t.q)) lin.push(`<li><b>Paso ${i + 1}${p.t ? " · " + esc(p.t) : ""}:</b> ${esc([t.m, t.p && "Perfil: " + t.p, t.f && "Fíjate: " + t.f, t.q && "Cuándo: " + t.q].filter(Boolean).join(" · "))}</li>`);
    });
    const inf = ctx.info(f);
    const roles = fs.map((x) => ctx.info(x).rol).filter(Boolean);
    const mias = yo === ctx.notasYo ? (ctx.notas || []).filter((n) => n.s === b.cat) : [];
    const htmlMias = mias.length ? `<div class="para-ti"><b>Para ti en esta jugada:</b><ul class="consignas">${mias.map((n) => `<li>${n.t === "f" ? "💪 " : n.t === "m" ? "🎯 " : "💡 "}${esc(n.x)}</li>`).join("")}</ul></div>` : "";
    el.innerHTML = `<div class="mi-papel"><b>Tú juegas${roles.length ? " de " + esc(roles.join(" y de ").toLowerCase()) : inf.rol ? " de " + esc(inf.rol.toLowerCase()) : ""}.</b>${fs.length > 1 ? " En la pizarra brilla tu primer puesto." : ""} Tu ficha brilla en amarillo; los mensajes salen debajo del campo.${lin.length ? `<ul class="consignas">${lin.join("")}</ul>` : ""}${htmlMias}</div>`;
  }

  function pantPreview() {
    const p = db.planes.find((x) => x.id === estado.planId);
    if (!p) return ir("cuaderno");
    vistaJugador(app, paquete(p, !!p.sinNombres), { volver: true });
  }

  // ---------------------------------------------------------------- eventos generales
  app.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const d = b.dataset;
    const plan = db.planes.find((x) => x.id === estado.planId);
    if (d.soyentr) { try { localStorage.setItem("pz_modo", "entrenador"); } catch (e) { /* nada */ } return ir("cuaderno"); }
    if (d.ir2) return ir(d.ir2);
    if (d.olvidar) { try { localStorage.removeItem("pz_ultimo"); } catch (e) { /* nada */ } return pintarPantalla(); }
    if (d.fbdictar) {
      const t = document.getElementById(d.fbdictar); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
      const a = b.closest(".tarjeta") && b.closest(".tarjeta").querySelector('[data-r="ayudaDictadoFb"]'); if (a) a.hidden = false;
      return;
    }
    if (d.entpedir) { iaFbGen.ent = (iaFbGen.ent || 0) + 1; previaEntreno(app.querySelector('[data-r="iaent"]')); return; }
    if (d.entok) { pedirEntreno(app.querySelector('[data-r="iaent"]')); return; }
    if (d.entno) { iaFbGen.ent = (iaFbGen.ent || 0) + 1; delete iaFbPend.ent; delete iaFbRes.ent; const c = app.querySelector('[data-r="iaent"]'); if (c) c.innerHTML = ""; return; }
    if (d.entcrear) { crearEntrenoPropuesto(); return; }
    if (d.ultimo) {
      let pq = null; try { pq = sanPaquete(JSON.parse(localStorage.getItem("pz_ultimo"))); } catch (e) { pq = null; }
      if (pq && pq.yo) { try { localStorage.removeItem("pz_ultimo"); } catch (e) { /* nada */ } return pintarPantalla(); }
      if (pq) return mostrarJugador(pq, true);
      return;
    }
    if (d.nuevo) return nuevoPlan(d.nuevo);
    if (d.abrir) return ir("plan", { planId: d.abrir });
    if (d.dup) {
      const o = db.planes.find((x) => x.id === d.dup); if (!o) return;
      const c = clon(o); c.id = uid(); c.mod = Date.now(); c.titulo = (c.titulo || "") + " (copia)"; c.fecha = hoyISO();
      delete c.fbn; delete c.fbr; delete c.an; delete c.anOc; c.bloques.forEach((x) => { delete x.fb; }); // una copia es una sesión nueva
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
        b2.jug = nuevaJugada(plan, sel ? sel.value : "vacia"); plan.mod = Date.now(); guardar(); pintarPantalla(); return abrirPizarra(plan, b2);
      }
      if (d.pz) return abrirPizarra(plan, bl(d.pz));
      if (d.pzborrar) { if (!window.confirm("¿Quitar la pizarra de este apartado?")) return; bl(d.pzborrar).jug = null; plan.mod = Date.now(); guardar(); return pintarPantalla(); }
      if (d.bnuevo && plan.bloques.length >= MAX.bloques) { toast("Has llegado al máximo de apartados"); return; }
      if (d.aprnuevo) {
        const a = APRENDIZAJES[$("#aprSel").value]; if (!a) return;
        if (plan.bloques.length + 3 > MAX.bloques) { toast("Has llegado al máximo de apartados"); return; }
        anadirAprendizaje(plan, a, $("#aprSel").value); guardar(); pintarPantalla();
        toast("Añadidos los tres apartados de «" + a.t + "»");
        return;
      }
      if (d.bnuevo) { plan.bloques.push({ id: uid(), cat: plan.tipo === "partido" ? "situacion" : "ejercicio", titulo: "", min: plan.tipo === "partido" ? "" : 15, texto: "", consignas: "", jug: null }); plan.mod = Date.now(); guardar(); return pintarPantalla(); }
      if (d.bborrar) { if (!window.confirm("¿Borrar este apartado?")) return; plan.bloques = plan.bloques.filter((x) => x.id !== d.bborrar); plan.mod = Date.now(); guardar(); return pintarPantalla(); }
      if (d.bmov) { const a = +d.bmov, z = a + +d.dir; const t = plan.bloques[a]; plan.bloques[a] = plan.bloques[z]; plan.bloques[z] = t; plan.mod = Date.now(); guardar(); return pintarPantalla(); }
      if (d.fb && d.bid) {
        const b2 = bl(d.bid); if (!b2) return;
        const v = +d.v; b2.fb = b2.fb || {};
        if (b2.fb[d.fb] === v) delete b2.fb[d.fb]; else b2.fb[d.fb] = v;
        if (!Object.keys(b2.fb).length) delete b2.fb;
        plan.mod = Date.now(); guardar(); invalidarAlt(b2.id);
        $$(`[data-fb="${d.fb}"][data-bid="${d.bid}"]`, app).forEach((x) => x.setAttribute("aria-pressed", String(!!b2.fb && b2.fb[d.fb] === +x.dataset.v)));
        return;
      }
      if (d.an) {
        const v = +d.v; plan.an = plan.an || {};
        if (plan.an[d.an] === v) delete plan.an[d.an]; else plan.an[d.an] = v;
        if (!Object.keys(plan.an).length) delete plan.an;
        plan.mod = Date.now(); guardar();
        $$(`[data-an="${d.an}"]`, app).forEach((x) => x.setAttribute("aria-pressed", String(!!plan.an && plan.an[d.an] === +x.dataset.v)));
        return;
      }
      if (d.iaalt) { iaFbGen["alt" + d.iaalt] = (iaFbGen["alt" + d.iaalt] || 0) + 1; const b2 = bl(d.iaalt); if (b2) previaAlternativas(plan, b2, app.querySelector(`[data-r="iaalt-${d.iaalt}"]`)); return; }
      if (d.altok) { const b2 = bl(d.altok); if (b2) pedirAlternativas(plan, b2, app.querySelector(`[data-r="iaalt-${d.altok}"]`)); return; }
      if (d.altno) { iaFbGen["alt" + d.altno] = (iaFbGen["alt" + d.altno] || 0) + 1; delete iaFbPend["alt" + d.altno]; delete iaFbRes["alt" + d.altno]; const c = app.querySelector(`[data-r="iaalt-${d.altno}"]`); if (c) c.innerHTML = ""; return; }
      if (d.altadd) { const b2 = bl(d.altadd); if (b2) anadirAlternativa(plan, b2, +d.i); return; }
      if (d.iapz) { iaPzGen[d.iapz] = (iaPzGen[d.iapz] || 0) + 1; const b2 = bl(d.iapz); if (b2) previaPizarraIA(plan, b2, app.querySelector(`[data-r="iapz-${d.iapz}"]`)); return; }
      if (d.iapzok) { const b2 = bl(d.iapzok); if (b2) pedirPizarraIA(plan, b2, app.querySelector(`[data-r="iapz-${d.iapzok}"]`)); return; }
      if (d.iapzaplicar) { const b2 = bl(d.iapzaplicar); if (b2) aplicarPizarraIA(plan, b2, app.querySelector(`[data-r="iapz-${d.iapzaplicar}"]`)); return; }
      if (d.iapzno) { delete iaPizarras[d.iapzno]; delete iaPzPend[d.iapzno]; iaPzGen[d.iapzno] = (iaPzGen[d.iapzno] || 0) + 1; const c = app.querySelector(`[data-r="iapz-${d.iapzno}"]`); if (c) c.innerHTML = ""; return; }
      if (d.iapedir) { const b2 = bl(d.iapedir); if (b2) previaIA(plan, b2, app.querySelector(`[data-r="ia-${d.iapedir}"]`)); return; }
      if (d.iaconfirmar) { const b2 = bl(d.iaconfirmar); if (b2) pedirIA(plan, b2, app.querySelector(`[data-r="ia-${d.iaconfirmar}"]`)); return; }
      if (d.iaaplicar) { const b2 = bl(d.iaaplicar); if (b2) aplicarIA(plan, b2, app.querySelector(`[data-r="ia-${d.iaaplicar}"]`)); return; }
      if (d.iadescartar) { delete iaResultados[d.iadescartar]; const c = app.querySelector(`[data-r="ia-${d.iadescartar}"]`); if (c) c.innerHTML = ""; return; }
      if (d.enviar) return enviar(plan, app.querySelector('[data-r="compartir"]'));
      if (d.enviararch) return enviarArchivoGrupo(plan, app.querySelector('[data-r="compartir"]'));
      if (d.preview) return ir("preview", { planId: plan.id });
    }
    if (d.jnotas) return abrirNotas(d.jnotas);
    if (d.jborrar) {
      const j = db.plantilla.find((x) => x.id === d.jborrar);
      if (!window.confirm("¿Quitar a " + (j ? j.n : "este jugador") + " de la plantilla?")) return;
      db.plantilla = db.plantilla.filter((x) => x.id !== d.jborrar); guardar(); return pintarPantalla();
    }
    if (d.jnuevo) {
      const dd = $("#nD").value, nn = $("#nN").value.trim();
      if (!nn) { toast("Escribe el nombre"); $("#nN").focus(); return; }
      db.plantilla.push({ id: uid(), d: dd === "" ? 0 : +dd, n: nn, c: $("#nC").value.trim() || nn.split(" ")[0], p: $("#nP").value.trim(), mod: Date.now() });
      guardar(); pintarPantalla(); toast("Jugador añadido"); $("#nD").focus(); return;
    }
    if (d.susguardar || d.susquitar) {
      const v = d.susquitar ? "" : String($("#susCod").value || "").trim().toLowerCase().replace(/\s+/g, "");
      if (d.susguardar && !RE_CODIGO.test(v)) { toast("Revisa el código: son letras y números, sin espacios"); return; }
      if (d.susquitar && !window.confirm("¿Quitar el código de este navegador? La suscripción sigue igual y podrás volver a escribirlo.")) return;
      SUS.codigo = v;
      try { if (v) localStorage.setItem("pz_codigo", v); else localStorage.removeItem("pz_codigo"); } catch (e) { /* solo para esta visita */ }
      b.disabled = true;
      cargarSuscripcion().then(() => { if (!pintarSuscripcion()) pintarPantalla(); toast(!v ? "Código quitado" : SUS.activa ? "✅ Suscripción activa" : SUS.error ? "No se ha podido comprobar el código" : "Ese código no está activo"); const t = $("#tuSuscripcion"); if (t) t.scrollIntoView(); });
      return;
    }
    if (d.susgestionar) {
      const msg = app.querySelector('[data-r="susMsg"]');
      b.disabled = true;
      fetch("/api/pizarra-portal-enlace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: SUS.codigo }) })
        .then((r) => r.json().then((j) => ({ r: r, j: j }), () => ({ r: r, j: {} })))
        .then(({ r, j }) => {
          msg.innerHTML = r.ok ? `<p class="peq">📧 Te hemos enviado un enlace a ${esc(j.a || "tu correo")}. Sirve una vez y caduca en 30 minutos.</p>`
            : `<p class="sin-puesto">${r.status === 429 ? "Ya has pedido varios enlaces hoy. Mira tu correo o prueba mañana." : "No se ha podido enviar el enlace. Prueba dentro de un rato."}</p>`;
        }, () => { msg.innerHTML = `<p class="sin-puesto">Sin conexión. Prueba de nuevo cuando tengas internet.</p>`; })
        .then(() => { b.disabled = false; });
      return;
    }
    if (d.jpegar) { const n = importarLista($("#pegar").value); pintarPantalla(); toast(n ? n + " jugador" + (n === 1 ? "" : "es") + " añadido" + (n === 1 ? "" : "s") : "No he encontrado líneas con dorsal y nombre"); return; }
    if (d.enventr || d.envarch) {
      const ids = $$("[data-envplan]", app).filter((x) => x.checked).map((x) => x.dataset.envplan);
      if (d.enventr) return enviarEntrenador(ids, app.querySelector('[data-r="envEntr"]'));
      const sa = $("#envSinApe");
      const texto = "Cuaderno de la pizarra (" + (db.equipo.nombre || "equipo") + ").\n\nToca el archivo: se abrirá la pizarra. Si no se abre sola, pulsa «Abrir la pizarra». Después pulsa «Juntar con mi cuaderno»: no se borra nada de lo tuyo.";
      const pqE = paqueteEntrenador(ids, !!(sa && sa.checked));
      const urlE = location.origin + location.pathname + "#c=" + codificar(pqE);
      compartirArchivo(nombreArchivo("cuaderno", db.equipo.nombre), pqE, "Cuaderno de la pizarra", texto, urlE, "Cuaderno de otro entrenador: plantilla y planes para juntar con el tuyo.").then((r) => {
        const c = app.querySelector('[data-r="envEntr"]');
        if (r === "cancelado" || !c) return;
        c.innerHTML = `<p class="peq" style="margin-top:10px">${r === "compartido" ? "✅ Archivo enviado." : "✅ Archivo descargado. Envíaselo por privado como documento."} Al tocarlo se abre la pizarra; luego pulsa «Juntar con mi cuaderno».</p>`;
      });
      return;
    }
    if (d.exportar) {
      const blob = new Blob([JSON.stringify(db, null, 1)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "pizarra-copia-" + hoyISO() + ".txt";
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }
  });
  app.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    const plan = db.planes.find((x) => x.id === estado.planId);
    if (plan && estado.pant === "plan" && (d.p || d.b)) plan.mod = Date.now();
    if (d.anoc !== undefined && plan) {
      const a = $("#anOc0").value, b2 = $("#anOc1").value;
      if (a === "" || b2 === "") delete plan.anOc; else plan.anOc = [Math.round(num(a, 0, 50, 0)), Math.round(num(b2, 0, 50, 0))]; // solo con los dos datos
      plan.mod = Date.now(); guardar(); return;
    }
    if (d.fbn && plan) {
      const b2 = plan.bloques.find((x) => x.id === d.fbn); if (!b2) return;
      b2.fb = b2.fb || {}; if (t.value) b2.fb.n = t.value; else delete b2.fb.n;
      if (!Object.keys(b2.fb).length) delete b2.fb;
      plan.mod = Date.now(); guardar(); invalidarAlt(b2.id); return;
    }
    if ((t.id === "entQuiero" || t.id === "entMin") && iaFbPend.ent) { delete iaFbPend.ent; const c = app.querySelector('[data-r="iaent"]'); if (c) c.innerHTML = ""; }
    if (d.p && plan && d.p !== "sistema") {
      plan[d.p] = t.value; guardar();
      Object.keys(iaPendiente).forEach((k) => { delete iaPendiente[k]; const c = app.querySelector(`[data-r="ia-${k}"]`); if (c) c.innerHTML = ""; });
      return;
    }
    if (d.b && plan) {
      const b = plan.bloques.find((x) => x.id === d.bid);
      if (b && d.b !== "cat") { b[d.b] = t.value; guardar(); }
      if (b && iaFbPend["alt" + b.id]) { delete iaFbPend["alt" + b.id]; const c = app.querySelector(`[data-r="iaalt-${b.id}"]`); if (c) c.innerHTML = ""; }
      if (b) {
        const c = app.querySelector(`[data-r="iapz-${b.id}"]`);
        if (c && c.innerHTML) {
          iaPzGen[b.id] = (iaPzGen[b.id] || 0) + 1; delete iaPzPend[b.id]; delete iaPizarras[b.id];
          c.innerHTML = `<p class="peq">Has cambiado el apartado: vuelve a pulsar «Diseñar la pizarra con Claude» para que la propuesta tenga en cuenta los cambios.</p>`;
        }
      }
      if (b && iaPendiente[b.id]) { delete iaPendiente[b.id]; const c = app.querySelector(`[data-r="ia-${b.id}"]`); if (c) c.innerHTML = `<p class="peq">Has cambiado el apartado: vuelve a pulsar «Sugerencias de Claude» para revisar lo que se envía.</p>`; }
      return;
    }
    if (d.j) {
      const j = db.plantilla.find((x) => x.id === d.jid); if (!j) return;
      j[d.j] = d.j === "d" ? +t.value : t.value; j.mod = Date.now(); guardar(); return;
    }
    if (d.eq) { db.equipo[d.eq] = t.value; guardar(); if (d.eq === "nombre") $("#ttApp").textContent = t.value || "Pizarra del entrenador"; }
  });
  app.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset;
    const plan = db.planes.find((x) => x.id === estado.planId);
    if (plan && estado.pant === "plan" && (d.p || d.b || d.once !== undefined || d.extra !== undefined)) plan.mod = Date.now();
    if (d.p === "sistema" && plan) { plan.sistema = t.value; guardar(); return pintarPantalla(); }
    if (t.dataset.r === "sinNombres" && plan) { plan.sinNombres = t.checked; guardar(); invalidarEnvio(app.querySelector('[data-r="compartir"]')); return; }
    if (t.hasAttribute("data-envplan") || t.id === "envSinApe" || t.id === "envNotas") { invalidarEnvio(app.querySelector('[data-r="envEntr"]')); return; }
    if (d.once !== undefined && plan) { plan.once = plan.once || {}; if (t.value) plan.once[d.once] = t.value; else delete plan.once[d.once]; guardar(); pintarSinPuesto(plan); return; }
    if (d.extra !== undefined && plan) {
      plan.extra = plan.extra || {};
      const l = ((plan.extra[d.extra] || []).concat(["", ""])).slice(0, 2); l[+d.n] = t.value || "";
      if (l.some(Boolean)) plan.extra[d.extra] = l; else delete plan.extra[d.extra];
      guardar(); pintarSinPuesto(plan); return;
    }
    if (d.b === "cat" && plan) {
      const b = plan.bloques.find((x) => x.id === d.bid);
      if (b) { const viejo = CATS[b.cat]; b.cat = t.value; if (!b.titulo || b.titulo === viejo) b.titulo = CATS[t.value]; guardar(); pintarPantalla(); }
      return;
    }
    if ((t.id === "abrirFile" || t.id === "abrirFileJ") && t.files && t.files[0]) {
      const r3 = new FileReader();
      r3.onload = () => abrirTextoArchivo(r3.result);
      r3.readAsText(t.files[0]);
      return;
    }
    if (t.id === "juntFile" && t.files && t.files[0]) {
      const r2 = new FileReader();
      r2.onload = () => {
        let rec = null;
        try { rec = sanDB(JSON.parse(r2.result)); } catch (err) { rec = null; }
        if (!rec) { toast("Ese archivo no es de la pizarra"); return; }
        const res = juntar(rec); if (res) ir("cuaderno"); avisoJunta(res);
      };
      r2.readAsText(t.files[0]);
      return;
    }
    if (t.id === "impFile" && t.files && t.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const crudo = JSON.parse(r.result);
          const o = sanDB(crudo);
          if (!o) throw new Error("formato");
          if (crudo && crudo.tipo === "entrenador") {
            if (!window.confirm("Este archivo lo ha enviado otro entrenador y puede no llevar todos los planes. Se juntará con tu cuaderno sin borrar nada. ¿Seguir?")) return;
            const res = juntar(o); if (res) ir("cuaderno"); avisoJunta(res); return;
          }
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
  function abrirTextoArchivo(texto) {
    let crudo = null;
    try {
      const m = /<script type="application\/json" id="pizarra-datos">([\s\S]*?)<\/script>/.exec(texto);
      crudo = JSON.parse(m ? m[1] : texto);
    } catch (err) { crudo = null; }
    if (crudo && crudo.tipo === "entrenador") { const rec = sanDB(crudo); if (rec) return pantRecibido(rec); }
    if (crudo && crudo.plan) { const pq = sanPaquete(crudo); if (pq) return mostrarJugador(pq, true); }
    if (crudo && Array.isArray(crudo.planes) && Array.isArray(crudo.plantilla)) { toast("Es una copia de seguridad: recupérala desde Ajustes."); return; }
    toast("Ese archivo no es de la pizarra");
  }
  // Android: archivo compartido con «Compartir → Pizarra» (lo deja el service worker en una caché local)
  async function abrirCompartido() {
    try {
      if (!("caches" in window)) return false;
      const c = await caches.open("pizarra-compartido");
      const clave = new URL("__archivo", location.href).href;
      const r = await c.match(clave);
      if (!r) return false;
      const texto = await r.text();
      await c.delete(clave);
      history.replaceState(null, "", location.pathname);
      abrirTextoArchivo(texto);
      return true;
    } catch (e) { return false; }
  }
  function arrancar() {
    // Una ficha privada nunca se queda guardada como «último plan» (versiones anteriores sí lo hacían).
    try { const u = JSON.parse(localStorage.getItem("pz_ultimo") || "null"); if (u && u.yo) localStorage.removeItem("pz_ultimo"); } catch (e) { /* nada */ }
    const h = location.hash || "";
    if (/^#apr=/.test(h)) {
      let a = null;
      try { a = JSON.parse(decodeURIComponent(h.slice(5))); } catch (e) { a = null; }
      history.replaceState(null, "", location.pathname);
      if (!a || typeof a !== "object") { pintarPantalla(); toast("No se ha podido leer la dinámica"); return; }
      const ej = own(APRENDIZAJES, a.k) ? APRENDIZAJES[a.k] : {};
      const din = { t: txt(a.t, 60) || ej.t || "Aprendizaje", tpl: ej.tpl || "vacia", cat: ej.cat || "juego",
        que: txt(a.que, 300), quan: txt(a.quan, 300), an: txt(a.an, 1200), eco: txt(a.eco, 1200), cond: txt(a.cond, 300), pre: txt(a.pre, 600), pc: txt(a.pc, 40) };
      try { localStorage.setItem("pz_modo", "entrenador"); } catch (e) { /* nada */ }
      const pl = { id: uid(), mod: Date.now(), tipo: "entreno", fecha: hoyISO(), titulo: ("Entreno · " + din.t).slice(0, 80), rival: "", objetivo: "Aprender: " + din.t.slice(0, 200), notas: "",
        sistema: "4231", once: {}, bloques: [{ id: uid(), cat: "calentamiento", titulo: CATS.calentamiento, min: 15, texto: "", consignas: "", jug: null }] };
      autoOnce(pl);
      anadirAprendizaje(pl, din, own(APRENDIZAJES, a.k) ? a.k : "");
      db.planes.push(pl); guardar();
      ir("plan", { planId: pl.id });
      toast("Entreno creado con la dinámica «" + din.t + "»");
      return;
    }
    if (/^#k=/.test(h)) {
      $("#nav").hidden = true;
      app.innerHTML = `<p class="vacio">Abriendo la pizarra…</p>`;
      leerEnlaceCorto(h).then((o) => {
        if (location.hash !== h) return; // ya se ha abierto otro enlace
        if (o && o.tipo === "entrenador") { const rec = sanDB(o); if (rec) return pantRecibido(rec); }
        const pq = o && o.plan ? sanPaquete(o) : null;
        if (pq) return mostrarJugador(pq);
        throw new Error("contenido");
      }).catch((e) => {
        if (location.hash !== h) return;
        app.innerHTML = e && e.caducado
          ? `<h1>Enlace caducado</h1><p>Este enlace ya no está disponible: los enlaces de la pizarra se borran a los 90 días. Pide al entrenador que te lo vuelva a enviar.</p>`
          : `<h1>No se ha podido abrir</h1><p>Comprueba que tienes conexión a internet y vuelve a tocar el enlace. Si sigue sin abrirse, pide que te lo vuelvan a enviar.</p>`;
      });
      return;
    }
    if (/^#(c|e|ent)=/.test(h)) {
      let rec = null;
      try { rec = sanDB(descodificar(h)); } catch (e) { rec = null; }
      if (!rec) { app.innerHTML = `<h1>Enlace incompleto</h1><p>Este enlace no se ha podido leer. Pide que te lo vuelvan a enviar o que te pasen el archivo.</p>`; return; }
      return pantRecibido(rec);
    }
    if (/^#(p|v|ver)=/.test(h)) {
      let pq = null;
      try { pq = sanPaquete(descodificar(h)); } catch (e) { pq = null; }
      if (!pq || !pq.plan) {
        app.innerHTML = `<h1>Enlace incompleto</h1><p>Este enlace no se ha podido leer. Pide al entrenador que lo vuelva a enviar (a veces se corta al copiarlo).</p>`;
        return;
      }
      mostrarJugador(pq);
      return;
    }
    if (/[?&]compartido=1/.test(location.search)) {
      abrirCompartido().then((ok) => { if (!ok) { history.replaceState(null, "", location.pathname); pintarPantalla(); toast("No ha llegado ningún archivo"); } });
      return;
    }
    pintarPantalla();
  }
  function mostrarJugador(pq, desdeArchivo) {
      if (pq.yo) { try { sessionStorage.setItem("pz_yo", pq.yo); } catch (e) { /* nada */ } }
      $("#nav").hidden = true;
      $("#ttApp").textContent = (pq.eq && pq.eq.n) || "Pizarra";
      $("#ttSub").textContent = "Lo que vamos a trabajar";
      document.title = (pq.plan.titulo || "Pizarra") + " · " + ((pq.eq && pq.eq.n) || "Pizarra");
      document.body.style.paddingBottom = "20px";
      window.scrollTo(0, 0);
      vistaJugador(app, pq);
      // El último plan abierto se recuerda en este móvil para poder volver a él.
      if (!pq.yo) { try { localStorage.setItem("pz_ultimo", JSON.stringify(pq)); } catch (e) { /* sin espacio: no pasa nada */ } }
      if (desdeArchivo) {
        const vol = document.createElement("button");
        vol.type = "button"; vol.className = "btn-sec"; vol.textContent = "← Salir"; vol.style.marginBottom = "10px";
        vol.addEventListener("click", () => { voz.parar(); document.body.style.paddingBottom = ""; ir("cuaderno"); });
        app.insertBefore(vol, app.firstChild);
      }
      const extra = document.createElement("div");
      extra.className = "tarjeta";
      extra.innerHTML = `<p class="peq">¿Eres el entrenador? Puedes guardar este plan en tu cuaderno para editarlo.</p><button type="button" class="btn-sec" data-guardarplan="1">Guardar en mi cuaderno</button>`;
      app.appendChild(extra);
      extra.querySelector("button").addEventListener("click", () => {
        const p = clon(pq.plan); p.id = uid(); p.mod = Date.now();
        const mapa = {};
        (pq.jug || []).forEach((j) => {
          const ex = db.plantilla.find((x) => x.d === j.d && (normNom(x.c) === normNom(j.c || j.n) || normNom(x.n) === normNom(j.n)));
          if (ex) { mapa[j.id] = ex.id; return; }
          const n = clon(j); n.id = uid(); n.mod = Date.now(); mapa[j.id] = n.id; db.plantilla.push(n);
        });
        const m2 = (x) => (x && mapa[x]) || x;
        Object.keys(p.once || {}).forEach((k) => { p.once[k] = m2(p.once[k]); });
        Object.keys(p.extra || {}).forEach((k) => { p.extra[k] = p.extra[k].map(m2); });
        p.bloques.forEach((b) => { if (b.jug) b.jug.fichas.forEach((f) => { if (f.pj) f.pj = m2(f.pj); }); });
        db.planes.push(p); guardar();
        history.replaceState(null, "", location.pathname);
        document.body.style.paddingBottom = "";
        ir("plan", { planId: p.id });
      });
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== CLAVE || !e.newValue) return;
    let o = null; try { o = sanDB(JSON.parse(e.newValue)); } catch (err) { o = null; }
    if (!o) return;
    db = o;
    if (/^#(k|p|c|v|ver|e|ent|apr)=/.test(location.hash || "")) return;
    if ($("#dlgPizarra").open) { $("#dlgPizarra").close(); }
    pintarPantalla();
    toast("El cuaderno se ha actualizado desde otra pestaña");
  });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => { /* sin service worker la pizarra funciona igual */ });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-susir]"); if (!b) return;
    $$("dialog").forEach((x) => { if (x.open) x.close(); });
    ir("ajustes"); setTimeout(() => { const t = $("#tuSuscripcion"); if (t) t.scrollIntoView(); const c = $("#susCod"); if (c) c.focus(); }, 50);
  });
  cargarSuscripcion().then(() => { if (estado.pant === "ajustes") pintarSuscripcion(); });
  window.addEventListener("hashchange", () => { if (/^#(k|p|c|v|ver|e|ent|apr)=/.test(location.hash || "")) arrancar(); });
  arrancar();
})();
