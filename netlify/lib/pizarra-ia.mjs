// Sugerencias de Claude para la Pizarra del entrenador.
// La app envía un apartado del plan (ejercicio o situación de partido), la jugada y las
// notas de los jugadores SIN nombres: cada jugador es «dorsal + puesto». Aquí se valida
// la entrada, se arma la consulta y se sanea la respuesta antes de devolverla.

export const MODELO = "claude-opus-5-5";
export const MAX_ENTRADA = 60_000;     // bytes del JSON de entrada
export const CUOTA_DIA_IA = 100;       // consultas al día como máximo (tope de coste)
export const RE_JOB = /^[A-Za-z0-9]{16}$/;

const ALF = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export function nuevoJob() {
  let s = "";
  while (s.length < 16) for (const x of crypto.getRandomValues(new Uint8Array(24))) if (x < 248 && s.length < 16) s += ALF[x % 62];
  return s;
}

const txt = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
const num = (v, a, b) => { const n = Number(v); return Number.isFinite(n) ? Math.min(b, Math.max(a, Math.round(n))) : a; };
const lista = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);

// Reconstruye la entrada campo a campo (nada de lo que llegue se pasa tal cual).
export function sanearEntrada(e) {
  if (!e || typeof e !== "object") return null;
  if (e.modo === "pizarra") return sanearEntradaPizarra(e);
  if (e.modo === "alternativas") return sanearEntradaAlternativas(e);
  if (e.modo === "entreno") return sanearEntradaEntreno(e);
  if (e.modo === "autoeval") return sanearEntradaAuto(e);
  if (e.modo === "equipo") return sanearEntradaEquipo(e);
  if (e.modo === "mejorar") return sanearEntradaMejorar(e);
  if (e.modo === "cuartos") return sanearEntradaCuartos(e);
  const b = e.bloque || {};
  const salida = {
    etapa: txt(e.etapa, 40),
    tipo: e.tipo === "partido" ? "partido" : "entreno",
    sistema: txt(e.sistema, 20),
    objetivo: txt(e.objetivo, 600),
    clave: txt(e.clave, 30),
    bloque: {
      categoria: txt(b.categoria, 60), titulo: txt(b.titulo, 80), texto: txt(b.texto, 1200),
      consignas: txt(b.consignas, 800), fijarse: txt(b.fijarse, 300), cuando: txt(b.cuando, 300),
      fase: txt(b.fase, 40), condicion: txt(b.condicion, 300), preguntas: txt(b.preguntas, 600)
    },
    pasos: lista(e.pasos, 20).map((p) => ({
      paso: num(p && p.paso, 1, 60), titulo: txt(p && p.titulo, 80),
      transicion: p && (p.transicion === "perdida" || p.transicion === "recuperacion") ? p.transicion : "",
      balon: lista(p && p.balon, 2).map((v) => num(v, -10, 115)),
      fichas: lista(p && p.fichas, 40).map((f) => ({
        ficha: txt(f && f.ficha, 16), equipo: f && f.equipo === "rival" ? "rival" : "nuestro",
        x: num(f && f.x, -10, 80), y: num(f && f.y, -10, 115)
      }))
    })),
    jugadores: lista(e.jugadores, 40).map((j) => ({
      ficha: txt(j && j.ficha, 16), jugador: /^J\d{1,2}$/.test(j && j.jugador) ? j.jugador : "", puesto: txt(j && j.puesto, 40),
      notas: lista(j && j.notas, 20).map((n) => ({
        tipo: n && n.tipo === "fuerte" ? "fuerte" : "mejora", area: txt(n && n.area, 20),
        situacion: txt(n && n.situacion, 60), texto: txt(n && n.texto, 400)
      }))
    })).filter((j) => j.jugador)
  };
  if (!salida.bloque.categoria && !salida.bloque.titulo) return null;
  return salida;
}

export const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["analisis", "texto", "consignas", "fijarse", "cuando", "condicion", "preguntas", "indicaciones", "individual", "mensaje"],
  properties: {
    analisis: { type: "string", description: "Para el entrenador: cómo plantear y mostrar este apartado, qué ajustar y por qué. 4-8 frases." },
    texto: { type: "string", description: "Explicación del ejercicio o la situación para todo el grupo, en segunda persona del plural." },
    consignas: { type: "array", items: { type: "string" }, description: "3-6 consignas cortas para el grupo." },
    fijarse: { type: "string", description: "En qué fijarse (estímulos relevantes) en este apartado." },
    cuando: { type: "string", description: "Cuándo fijarse o actuar: el momento de la jugada." },
    condicion: { type: "string", description: "En entrenamientos: una condición ligada al gol que lleve la atención al estímulo relevante (la tiene un equipo y no la pierde al perder el balón). En partidos, cadena vacía." },
    preguntas: { type: "array", items: { type: "string" }, description: "2-4 preguntas cortas para que el entrenador las haga durante las pausas o al acabar, sobre qué miraron y cuándo." },
    indicaciones: {
      type: "array",
      description: "Indicación por ficha y paso, visible para todo el grupo. Sin mencionar debilidades personales.",
      items: {
        type: "object", additionalProperties: false, required: ["ficha", "paso", "que", "fijate", "cuando"],
        properties: { ficha: { type: "string" }, paso: { type: "integer" }, que: { type: "string" }, fijate: { type: "string" }, cuando: { type: "string" } }
      }
    },
    individual: {
      type: "array",
      description: "Consejo privado para un jugador concreto en este apartado, a partir de sus notas: cómo aprovechar su punto fuerte aquí y en qué centrarse para mejorar. Tiene que entenderse fuera del ejercicio: sin reglas propias del ejercicio (petos, comodines, zonas) o traducidas a la situación real de juego.",
      items: {
        type: "object", additionalProperties: false, required: ["jugador", "texto"],
        properties: { jugador: { type: "string", description: "Identificador recibido (J1, J2…)" }, texto: { type: "string" } }
      }
    },
    mensaje: { type: "string", description: "Mensaje breve para el grupo del equipo (2-4 frases), sin enlace." }
  }
};

export const SISTEMA = `Eres un entrenador de fútbol base con formación en psicología del deporte. Ayudas a otro entrenador a preparar un apartado de su plan (un ejercicio de entrenamiento o una situación de partido) para enviarlo a sus jugadores en una pizarra digital.

Recibirás en JSON: la etapa de edad del equipo, el tipo de plan, el sistema, el apartado (categoría, título, texto y consignas actuales), los pasos de la jugada con las posiciones en metros (campo de 68 × 105, nuestro equipo ataca hacia y = 0) y, para cada jugador, su ficha en la pizarra, un identificador (J1, J2…), su puesto y las notas del entrenador sobre sus puntos fuertes y lo que tiene que mejorar (técnica, táctica, toma de decisiones…). No hay nombres: en «individual» usa el identificador recibido; en los textos para el grupo, refiérete a los jugadores solo por su puesto.

Qué tienes que hacer:
- Proponer la mejor manera de plantear y mostrar este apartado para esa edad, aprovechando la dinámica de la jugada y las características de los jugadores.
- Adaptar el lenguaje y la exigencia a la etapa de desarrollo (más juego y técnica en edades tempranas; más táctica, velocidad y fuerza supervisada en cadete y juvenil).
- Seguir este enfoque de atención: para cada momento, decir en qué fijarse (el balón, el compañero, el rival, hacia dónde mira, el pie…) y cuándo fijarse. Los pensamientos y los nervios no se combaten: se vuelve a la jugada con la palabra clave del equipo si la hay.
- Fomenta la orientación a la tarea: refuerza el esfuerzo, el aprendizaje y la mejora respecto a uno mismo, no el resultado ni la comparación con los demás.
- En los entrenamientos, seguir los cinco pasos del método para cualquier aprendizaje: (1) dar a conocer los estímulos relevantes, qué mirar y cuándo; (2) un ejercicio analítico que repita el gesto y demuestre que lo entienden; (3) saber que lo conocen pero aún no lo han aprendido: es la experiencia la que lo hace aprender, así que el entrenador no repite la consigna en cada error ni lo vive como un drama; (4) una dinámica ecológica con variables del juego real (porterías, un equipo gana y otro pierde) y sobre todo con el cambio de foco de las transiciones, ataque-defensa al perder el balón y defensa-ataque al recuperarlo; (5) condicionar la acción al refuerzo natural del fútbol, el gol: la condición la tiene un equipo y no la pierde al perder el balón, y el entrenador pasa a observar y a preguntar. Si el apartado indica en qué paso está («fase»), ajusta la propuesta a ese paso. Nunca propongas que el entrenador dé instrucciones constantes durante el juego.
- Si un paso de la jugada está marcado como «perdida» o «recuperacion», en ese paso las indicaciones tienen que hablar del cambio de foco: qué mirar en el primer segundo.
- En «condicion», en entrenamientos, una condición concreta ligada al gol; en partidos, cadena vacía. En «preguntas», 2-4 preguntas abiertas sobre qué miraron y cuándo, para hacer después.
- La explicación, las consignas, en qué fijarse, cuándo, la condición, las indicaciones y el mensaje los ve todo el grupo: nunca incluyas en ellos nada de las notas de un jugador concreto ni de las preguntas del entrenador. Lo individual va solo en «individual».
- En «indicaciones», dar a cada ficha de nuestro equipo que aparezca en los pasos lo que hace, en qué se fija y cuándo, con la numeración de pasos recibida (empieza en 1). Solo fichas que existan en los pasos. Estas indicaciones las ve todo el grupo: nunca menciones puntos débiles personales en ellas.
- En «individual», para los jugadores con notas, un consejo privado: cómo sacar partido a su punto fuerte en este apartado y en qué centrarse para mejorar, de forma constructiva. El jugador lo leerá en su ficha, fuera del ejercicio: no uses reglas propias del ejercicio (petos, comodines, zonas, condiciones); tradúcelas a la situación real de juego («cuando tu equipo pierde el balón», «cuando recibes de espaldas»…).

Estilo: castellano, en segunda persona, frases cortas y claras, tono sereno y cercano, sin exclamaciones en serie, sin emojis y sin promesas. Cada texto, como máximo 2-3 frases.`;

// Mensaje del usuario: la entrada saneada como JSON.
export const mensajeUsuario = (entrada) => "Datos del apartado:\n" + JSON.stringify(entrada);

// Sanea la respuesta del modelo (solo texto y números, longitudes acotadas).
export function sanearSalida(o, entrada) {
  if (!o || typeof o !== "object") return null;
  const fichas = new Set();
  (entrada.pasos || []).forEach((p) => p.fichas.forEach((f) => { if (f.equipo === "nuestro") fichas.add(f.ficha); }));
  const nPasos = (entrada.pasos || []).length;
  const ids = new Set((entrada.jugadores || []).map((j) => j.jugador));
  return {
    analisis: txt(o.analisis, 2000), texto: txt(o.texto, 1200),
    consignas: lista(o.consignas, 8).map((c) => txt(c, 160)).filter(Boolean),
    fijarse: txt(o.fijarse, 300), cuando: txt(o.cuando, 300), mensaje: txt(o.mensaje, 600),
    condicion: entrada.tipo === "entreno" ? txt(o.condicion, 300) : "",
    preguntas: lista(o.preguntas, 6).map((c) => txt(c, 200)).filter(Boolean),
    indicaciones: lista(o.indicaciones, 200)
      .filter((i) => i && fichas.has(i.ficha) && Number.isInteger(i.paso) && i.paso >= 1 && i.paso <= nPasos)
      .map((i) => ({ ficha: i.ficha, paso: i.paso, que: txt(i.que, 300), fijate: txt(i.fijate, 200), cuando: txt(i.cuando, 200) })),
    individual: lista(o.individual, 40)
      .filter((i) => i && ids.has(i.jugador))
      .map((i) => ({ jugador: i.jugador, texto: txt(i.texto, 500) }))
  };
}

// ---------------------------------------------------------------- diseñar la pizarra de un ejercicio
// A partir de la ficha del apartado (explicación, en qué fijarse, cuándo, condición), Claude propone
// el espacio, las fichas, los conos y los pasos animados. No se envía ningún dato de jugadores.
export const LIM_PZ = { fichas: 24, conos: 12, pasos: 6, flechas: 4 };
export function sanearEntradaPizarra(e) {
  const b = e.bloque || {};
  const s = {
    modo: "pizarra", etapa: txt(e.etapa, 40), tipo: e.tipo === "partido" ? "partido" : "entreno",
    bloque: {
      categoria: txt(b.categoria, 60), titulo: txt(b.titulo, 80), texto: txt(b.texto, 1200), consignas: txt(b.consignas, 800),
      fijarse: txt(b.fijarse, 300), cuando: txt(b.cuando, 300), fase: txt(b.fase, 40), condicion: txt(b.condicion, 300),
      equipoCondicion: /^(nuestro|rival|peto [a-z]{3,10})$/.test(b.equipoCondicion || "") ? b.equipoCondicion : ""
    },
    jugadores: num(e.jugadores, 0, 30)
  };
  if (!s.bloque.texto && !s.bloque.titulo) return null;
  return s;
}

const XY = { type: "object", additionalProperties: false, required: ["x", "y"], properties: { x: { type: "number" }, y: { type: "number" } } };
export const ESQUEMA_PIZARRA = {
  type: "object",
  additionalProperties: false,
  required: ["vista", "fichas", "conos", "pasos", "explicacion"],
  properties: {
    vista: { type: "string", enum: ["C", "A", "D"], description: "C campo entero; A mitad de ataque (y de -8 a 60, portería rival en y = 0); D mitad propia (y de 45 a 113, portería propia en y = 105)." },
    fichas: {
      type: "array", description: "Jugadores del ejercicio. Ids cortos: e1, e2… (nuestro equipo o el equipo con color del equipo) y f1, f2… (el otro equipo).",
      items: { type: "object", additionalProperties: false, required: ["id", "equipo", "peto"],
        properties: { id: { type: "string" }, equipo: { type: "string", enum: ["nuestro", "rival"] }, peto: { type: "string", enum: ["", "amarillo", "verde", "naranja", "rojo", "azul", "blanco", "negro", "morado", "rosa", "celeste", "gris"] } } }
    },
    conos: {
      type: "array", description: "Conos para marcar el espacio, porterías pequeñas o un defensor fijo.",
      items: { type: "object", additionalProperties: false, required: ["x", "y", "color"], properties: { x: { type: "number" }, y: { type: "number" }, color: { type: "string", enum: ["amarillo", "rojo", "azul", "naranja", "blanco"] } } }
    },
    pasos: {
      type: "array", description: "2-5 pasos de la jugada. Cada paso: título corto, posición del balón y de cada ficha, si es momento de pérdida o recuperación, flechas de movimiento o pase e indicaciones.",
      items: { type: "object", additionalProperties: false, required: ["titulo", "balon", "posiciones", "transicion", "flechas", "indicaciones"],
        properties: {
          titulo: { type: "string" }, balon: XY,
          posiciones: { type: "array", items: { type: "object", additionalProperties: false, required: ["ficha", "x", "y"], properties: { ficha: { type: "string" }, x: { type: "number" }, y: { type: "number" } } } },
          transicion: { type: "string", enum: ["", "perdida", "recuperacion"] },
          flechas: { type: "array", items: { type: "object", additionalProperties: false, required: ["desde", "hasta"], properties: { desde: XY, hasta: XY } } },
          indicaciones: { type: "array", items: { type: "object", additionalProperties: false, required: ["ficha", "que", "fijate", "cuando"], properties: { ficha: { type: "string" }, que: { type: "string" }, fijate: { type: "string" }, cuando: { type: "string" } } } }
        } }
    },
    explicacion: { type: "string", description: "Para el entrenador, 1-3 frases: cómo está montada la pizarra y qué conviene retocar." }
  }
};

export const SISTEMA_PIZARRA = `Eres un entrenador de fútbol base con formación en psicología del deporte. Diseñas la pizarra táctica animada de un ejercicio a partir de la ficha que ha escrito el entrenador.

El campo mide 68 × 105 metros: x de 0 (izquierda) a 68 (derecha), y de 0 (portería rival, arriba) a 105 (portería propia, abajo). El equipo «nuestro» ataca hacia y = 0. Elige la vista que mejor encuadre el ejercicio: «A» si se juega en la mitad de ataque, «D» si es en la propia (por ejemplo, salida desde el portero), «C» si ocupa todo el campo. Usa solo posiciones dentro de la vista elegida.

Cómo diseñarla:
- Coloca exactamente los jugadores que pide el ejercicio (por ejemplo, 4 contra 4 más 2 comodines: 6 de un equipo contando los comodines con peto amarillo y 4 del otro). En los entrenamientos los dos equipos son del mismo club: el otro equipo va como «rival». Si hay un portero, inclúyelo.
- Marca el espacio con pocos conos (las esquinas) y las porterías pequeñas con dos conos. No pongas más de 12.
- 2 a 5 pasos que muestren la idea clave del ejercicio. El primer paso, la posición inicial, con todas las fichas y conos colocados. Mueve solo lo que cambia; las fichas que no aparecen en «posiciones» de un paso se quedan donde estaban.
- Si el ejercicio trabaja una transición, marca el paso de la pérdida («perdida») o del robo («recuperacion»).
- Flechas solo para el movimiento o el pase principal de cada paso (como máximo 2 por paso).
- Indicaciones para las fichas que protagonizan cada paso: qué hacen, en qué se fijan (el estímulo relevante: el balón, el compañero, el rival, hacia dónde mira…) y cuándo. Frases cortas, en segunda persona, sin emojis. Son para todo el grupo.
- Respeta el método: el ejercicio enseña en qué fijarse y cuándo; nunca propongas que el entrenador dé instrucciones constantes durante el juego.
- Las indicaciones las ve todo el grupo: nunca incluyas en ellas datos personales que pueda llevar la ficha (salud, familia, nombres).
- Si la ficha dice qué equipo tiene la condición («equipoCondicion»), ilústrala con ese equipo: «nuestro» son las fichas e, «rival» las fichas f; si es un color de peto, pon ese peto a las fichas del equipo que la tiene.`;

const clampN = (v, a, b, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(b, Math.max(a, Math.round(n * 2) / 2)) : d; };
const VISTA_Y = { C: [-6, 111], A: [-7, 59], D: [46, 112] };
// Sanea la pizarra propuesta: ids y colores de listas cerradas, coordenadas dentro de la vista, tamaños acotados.
export function sanearPizarra(o) {
  if (!o || typeof o !== "object") return null;
  const vista = ["C", "A", "D"].includes(o.vista) ? o.vista : "C";
  const [y0, y1] = VISTA_Y[vista];
  const PETOS = ["amarillo", "verde", "naranja", "rojo", "azul", "blanco", "negro", "morado", "rosa", "celeste", "gris"];
  const fichas = [], ids = new Set();
  lista(o.fichas, LIM_PZ.fichas).forEach((f) => {
    const id = typeof f?.id === "string" && /^[ef]\d{1,2}$/.test(f.id) ? f.id : null;
    if (!id || ids.has(id)) return;
    const eq = f.equipo === "rival" ? "r" : "a";
    if ((eq === "a") !== id.startsWith("e")) return;
    const x = { id, eq }; if (PETOS.includes(f.peto)) x.peto = f.peto;
    ids.add(id); fichas.push(x);
  });
  if (fichas.length < 2) return null;
  const conos = lista(o.conos, LIM_PZ.conos).map((c, i) => ({ id: "c" + i, col: ["amarillo", "rojo", "azul", "naranja", "blanco"].includes(c?.color) ? c.color : "amarillo", x: clampN(c?.x, -4, 72, 34), y: clampN(c?.y, y0, y1, (y0 + y1) / 2) }));
  const xy = (p, d) => [clampN(p?.x, -4, 72, d[0]), clampN(p?.y, y0, y1, d[1])];
  let actual = {};
  const pasos = lista(o.pasos, LIM_PZ.pasos).map((p, k) => {
    const pos = Object.assign({}, actual);
    lista(p?.posiciones, 40).forEach((q) => { if (ids.has(q?.ficha)) pos[q.ficha] = xy(q, [34, (y0 + y1) / 2]); });
    actual = pos;
    const tips = {};
    lista(p?.indicaciones, 30).forEach((i) => {
      if (!ids.has(i?.ficha)) return;
      const t = {}; [["m", "que"], ["f", "fijate"], ["q", "cuando"]].forEach(([a, b]) => { const v = txt(i[b], 200); if (v) t[a] = v; });
      if (Object.keys(t).length) tips[i.ficha] = t;
    });
    const dib = lista(p?.flechas, LIM_PZ.flechas).map((f) => ({ k: "flecha", c: "#FFD23F", pts: [xy(f?.desde, [34, 50]), xy(f?.hasta, [34, 50])], t: "" }));
    const r = { t: txt(p?.titulo, 80), pos, b: xy(p?.balon, [34, (y0 + y1) / 2]), tips, dib };
    if (p?.transicion === "perdida") r.tr = "p"; else if (p?.transicion === "recuperacion") r.tr = "r";
    return r;
  });
  if (!pasos.length) return null;
  // todas las fichas tienen que estar colocadas en el primer paso: si falta alguna, la propuesta no vale
  if (fichas.some((f) => !pasos[0].pos[f.id])) return null;
  conos.forEach((c) => pasos.forEach((p) => { p.pos[c.id] = [c.x, c.y]; }));
  return {
    jugada: { vista, rivales: true, fichas: fichas.concat(conos.map((c) => ({ id: c.id, eq: "c", forma: "cono", col: c.col }))), pasos },
    explicacion: txt(o.explicacion, 600)
  };
}

// ---------------------------------------------------------------- feedback del equipo: alternativas y nuevos entrenos
// La pizarra guarda en el móvil cómo ha ido cada ejercicio y cada situación de partido («memoria del equipo»)
// y la envía, sin nombres, cuando el entrenador pide alternativas o un entreno nuevo. Claude no guarda nada.
export const CATS_IA = ["calentamiento", "ejercicio", "rondo", "juego", "transicion", "salida", "presion", "banda", "cornerF", "cornerC", "falta", "situacion", "otro"];
export const FASES_IA = ["", "analitico", "ecologico", "condicionado"];
const COMO = ["", "costó", "regular", "bien"], ATENC = ["", "no", "a veces", "sí"];
function bloqueFb(b) {
  return {
    categoria: txt(b?.categoria, 60), titulo: txt(b?.titulo, 80), texto: txt(b?.texto, 600), fase: txt(b?.fase, 40),
    fijarse: txt(b?.fijarse, 300), cuando: txt(b?.cuando, 300), condicion: txt(b?.condicion, 300),
    como: COMO.includes(b?.como) ? b.como : "", estimulos: ATENC.includes(b?.estimulos) ? b.estimulos : "", nota: txt(b?.nota, 300)
  };
}
function historial(h) {
  return lista(h, 8).map((p) => ({
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(p?.fecha || "") ? p.fecha : "", tipo: p?.tipo === "partido" ? "partido" : "entreno",
    titulo: txt(p?.titulo, 80), objetivo: txt(p?.objetivo, 300), nota: txt(p?.nota, 600), resultado: txt(p?.resultado, 40),
    analisis: lista(p?.analisis, 20).map((x) => ({ aspecto: txt(x?.aspecto, 80), valor: txt(x?.valor, 40) })).filter((x) => x.aspecto && x.valor),
    bloques: lista(p?.bloques, 12).map(bloqueFb)
  }));
}
export function sanearEntradaAlternativas(e) {
  const b = bloqueFb(e.bloque);
  if (!b.titulo && !b.texto) return null;
  return { modo: "alternativas", etapa: txt(e.etapa, 40), tipo: e.tipo === "partido" ? "partido" : "entreno",
    bloque: Object.assign(b, { consignas: txt(e.bloque?.consignas, 800) }), historial: historial(e.historial) };
}
export function sanearEntradaEntreno(e) {
  const h = historial(e.historial), eq = equipoCtx(e.equipo);
  if (!h.length && !eq) return null;
  const o = { modo: "entreno", etapa: txt(e.etapa, 40), quiero: txt(e.quiero, 300), minutos: num(e.minutos, 30, 150), jugadores: num(e.jugadores, 0, 30), historial: h };
  if (eq) o.equipo = eq;
  return o;
}
// El informe del equipo, sin nombres: clima, necesidades, fortalezas y el foco de cada jugador (J1, J2…)
const ORI_K = ["tarea", "mixta", "resultado"];
const cuentasK = (o, ks) => Object.fromEntries(ks.map((k) => [k, num(o && o[k], 0, 60)]));
function equipoCtx(q) {
  if (!q || typeof q !== "object") return null;
  const vistos = new Set();
  const jugadores = lista(q.jugadores, 30).map((j) => ({ jugador: /^J\d{1,2}$/.test(j && j.jugador) ? j.jugador : "", puesto: txt(j && j.puesto, 40), foco: txt(j && j.foco, 300), fijarse: txt(j && j.fijarse, 300) }))
    .filter((j) => j.jugador && !vistos.has(j.jugador) && vistos.add(j.jugador));
  const c = q.clima || {};
  const o = { clima: { jugadores: num(c.jugadores, 0, 60), conAutoevaluacion: num(c.conAutoevaluacion, 0, 60), orientacion: cuentasK(c.orientacion, ORI_K),
    error: cuentasK(c.error, ["vuelveEnseguida", "leCuestaUnPoco", "leCuestaMucho"]), confianza: cuentasK(c.confianza, ["alta", "normal", "baja"]) },
    necesidades: listaT(q.necesidades, 6), fortalezas: listaT(q.fortalezas, 6), jugadores };
  return jugadores.some((j) => j.foco) || o.necesidades.length ? o : null;
}
const idsEquipo = (e) => new Set(((e && e.equipo && e.equipo.jugadores) || []).map((j) => j.jugador));
// Pautas individuales: solo de jugadores que se han enviado, una por jugador
function sanearPautas(l, ids) {
  const vistos = new Set();
  return lista(l, 30).map((p) => ({ jugador: txt(p && p.jugador, 4), texto: txt(p && p.texto, 200) }))
    .filter((p) => ids.has(p.jugador) && p.texto && !vistos.has(p.jugador) && vistos.add(p.jugador));
}

const BLOQUE_PROP = {
  type: "object", additionalProperties: false,
  required: ["titulo", "categoria", "fase", "minutos", "texto", "consignas", "fijarse", "cuando", "condicion", "preguntas"],
  properties: {
    titulo: { type: "string" }, categoria: { type: "string", enum: CATS_IA }, fase: { type: "string", enum: FASES_IA },
    minutos: { type: "integer" }, texto: { type: "string", description: "Organización, espacio, número de jugadores y reglas." },
    consignas: { type: "array", items: { type: "string" } }, fijarse: { type: "string", description: "Estímulos relevantes: en qué fijarse." },
    cuando: { type: "string", description: "Cuándo fijarse o actuar." }, condicion: { type: "string", description: "Condición ligada al gol (vacía si no aplica)." },
    preguntas: { type: "array", items: { type: "string" }, description: "Preguntas para hacer después." }
  }
};
export const ESQUEMA_ALTERNATIVAS = {
  type: "object", additionalProperties: false, required: ["analisis", "estimulos", "objetivos", "alternativas"],
  properties: {
    analisis: { type: "string", description: "Para el entrenador: qué trabaja el ejercicio y qué dice el feedback, 2-4 frases." },
    estimulos: { type: "string", description: "Los estímulos relevantes del ejercicio: qué mirar y cuándo." },
    objetivos: { type: "array", items: { type: "string" }, description: "2-5 objetivos que trabaja (técnicos, tácticos, de atención…)." },
    alternativas: { type: "array", description: "2-3 variantes parecidas: una más fácil o más analítica, una más ecológica o exigente, y otra que ataque lo que costó.",
      items: { type: "object", additionalProperties: false, required: ["cambio", "bloque"], properties: { cambio: { type: "string", description: "Qué cambia respecto al original y por qué, 1-2 frases." }, bloque: BLOQUE_PROP } } }
  }
};
const PAUTAS = { type: "array", description: "Pautas individuales de juego para este apartado (puede ir vacío): solo para jugadores cuyo foco encaja con el ejercicio.",
  items: { type: "object", additionalProperties: false, required: ["jugador", "texto"], properties: {
    jugador: { type: "string", description: "El identificador recibido (J1, J2…)." }, texto: { type: "string", description: "Una frase en segunda persona: qué hacer o en qué fijarse en este ejercicio." } } } };
const BLOQUE_PROP_P = { ...BLOQUE_PROP, required: [...BLOQUE_PROP.required, "pautas"], properties: { ...BLOQUE_PROP.properties, pautas: PAUTAS } };
export const ESQUEMA_ENTRENO = {
  type: "object", additionalProperties: false, required: ["analisis", "titulo", "objetivo", "bloques"],
  properties: {
    analisis: { type: "string", description: "Para el entrenador: qué has visto en los feedbacks y en el informe del equipo y por qué propones este entreno, 3-5 frases." },
    titulo: { type: "string" }, objetivo: { type: "string" },
    bloques: { type: "array", description: "3-6 apartados que sumen los minutos indicados, empezando por un calentamiento.", items: BLOQUE_PROP_P }
  }
};

const EQUIPO_TXT = `Puede venir «equipo», el informe del equipo sin nombres: el clima del grupo (orientación a aprender o a ganar, cómo viven el error, confianza), lo que más necesita el grupo, sus fortalezas y, para cada jugador (J1, J2…), su puesto, su foco de aprendizaje y en qué fijarse. Tenlo presente: lo que más necesita el grupo y los focos que se repiten orientan el aprendizaje principal; si a muchos les cuesta volver después de un error, incluye una rutina para volver a la jugada (gesto, palabra clave) y valora el intento; si muchos ponen el éxito en ganar, que la condición y las preguntas premien el proceso. En las situaciones de juego (salida de balón, presión, balón parado, transiciones) cada jugador juega en su puesto: asigna las pautas por el puesto de cada jugador (su función en esa situación). En cada apartado, «pautas» son pautas individuales de juego para los jugadores cuyo foco o cuyo puesto encaja con el ejercicio: una frase en segunda persona, concreta (qué hacer o en qué fijarse y cuándo), sin contenido psicológico ni comparaciones, porque la verá el propio jugador. Sin «equipo», «pautas» va vacío.`;
const METODO = `Método de los cinco pasos para cualquier aprendizaje: (1) dar a conocer los estímulos relevantes, qué mirar y cuándo; (2) ejercicio analítico que repita el gesto; (3) lo conocen pero aún no lo han aprendido: el entrenador no repite la consigna en cada error; (4) dinámica ecológica con variables del juego real y el cambio de foco de las transiciones; (5) condición ligada al gol, que la tiene un equipo y no pierde al perder el balón, mientras el entrenador observa y pregunta.`;
export const SISTEMA_ALTERNATIVAS = `Eres un entrenador de fútbol base con formación en psicología del deporte. El entrenador te pasa un ejercicio de su plan, cómo ha ido (si costó, si los jugadores encontraron los estímulos relevantes y su nota) y el historial reciente del equipo, sin nombres.

${METODO}

Qué tienes que hacer: identificar los estímulos relevantes y los objetivos que trabaja el ejercicio, y proponer 2-3 variantes parecidas que lo perfeccionen a partir del feedback. Si costó o no encontraron los estímulos, una variante más sencilla o más analítica; si fue bien, una más ecológica, con más oposición o con transiciones. Cada variante lleva su condición si es un entrenamiento. Adapta todo a la edad. Castellano, segunda persona, frases cortas, sin emojis. No incluyas datos personales que pudiera llevar una nota.`;
export const SISTEMA_ENTRENO = `Eres un entrenador de fútbol base con formación en psicología del deporte. El entrenador te pasa el historial reciente de su equipo: entrenos y partidos con los objetivos, las situaciones de juego trabajadas, cómo ha ido cada apartado, si encontraron los estímulos relevantes y sus notas, sin nombres.

${METODO}

En los partidos puede venir un «analisis»: dónde se recupera y se pierde el balón, duelos, salida, romper líneas, presión, contemporizar, remate, por qué banda hay peligro, activación tras pérdida, errores no forzados y ocasiones claras.

El análisis del partido es la base para plantear el próximo entrenamiento: lo que ha costado (por ejemplo, perder muchos balones en nuestro campo, duelos perdidos o poca pegada) se convierte en el aprendizaje principal, y para cada aspecto tienes que concretar los estímulos relevantes que lo resuelven (qué mirar y cuándo) y llevarlos a «fijarse» y «cuando» de los apartados. Lo que ha ido bien se mantiene como fortaleza. En «analisis» explica qué aspecto del partido trabaja cada apartado.

${EQUIPO_TXT}

Qué tienes que hacer: detectar qué cuesta y qué ya está consolidado, sobre todo lo que se ha visto en los partidos y en su análisis, y proponer el próximo entrenamiento. Empieza con un calentamiento y sigue la secuencia del método para el aprendizaje principal (analítico, dinámica ecológica y partido condicionado). Si el entrenador indica qué quiere trabajar o la duración, respétalo. Cada apartado con qué mirar y cuándo, consignas, la condición cuando toque y 2-3 preguntas para después. Adapta todo a la edad y al número de jugadores. Fomenta la orientación a la tarea: que el éxito de cada apartado sea aprender y mejorar respecto a uno mismo, no solo ganar. Castellano, segunda persona, frases cortas, sin emojis. No incluyas datos personales que pudiera llevar una nota.`;

function sanearBloqueProp(b) {
  if (!b || typeof b !== "object") return null;
  const o = {
    titulo: txt(b.titulo, 80), categoria: CATS_IA.includes(b.categoria) ? b.categoria : "ejercicio", fase: FASES_IA.includes(b.fase) ? b.fase : "",
    minutos: num(b.minutos, 0, 120), texto: txt(b.texto, 1200), consignas: lista(b.consignas, 8).map((c) => txt(c, 160)).filter(Boolean),
    fijarse: txt(b.fijarse, 300), cuando: txt(b.cuando, 300), condicion: txt(b.condicion, 300), preguntas: lista(b.preguntas, 6).map((c) => txt(c, 200)).filter(Boolean)
  };
  return o.titulo || o.texto ? o : null;
}
export function sanearAlternativas(o) {
  if (!o || typeof o !== "object") return null;
  const alternativas = lista(o.alternativas, 3).map((a) => { const b = sanearBloqueProp(a?.bloque); return b ? { cambio: txt(a.cambio, 400), bloque: b } : null; }).filter(Boolean);
  if (!alternativas.length) return null;
  return { analisis: txt(o.analisis, 1200), estimulos: txt(o.estimulos, 400), objetivos: lista(o.objetivos, 6).map((c) => txt(c, 120)).filter(Boolean), alternativas };
}
export function sanearEntreno(o, entrada) {
  if (!o || typeof o !== "object") return null;
  const ids = idsEquipo(entrada);
  const bloques = lista(o.bloques, 8).map((b) => { const s = sanearBloqueProp(b); if (s) s.pautas = sanearPautas(b && b.pautas, ids); return s; }).filter(Boolean);
  if (!bloques.length) return null;
  return { analisis: txt(o.analisis, 1500), titulo: txt(o.titulo, 80), objetivo: txt(o.objetivo, 600), bloques };
}

// ---------------------------------------------------------------- autoevaluación: la mirada del jugador y la del entrenador
const listaT = (v, n) => lista(v, n).map((x) => txt(x, 160)).filter(Boolean);
export function sanearEntradaAuto(e) {
  const t = e.textos || {};
  const o = {
    modo: "autoeval", etapa: txt(e.etapa, 40), puesto: txt(e.puesto, 40), entrenadores: e.entrenadores === 2 ? 2 : 1,
    coinciden: { fuertes: listaT(e.coinciden?.fuertes, 20), mejorar: listaT(e.coinciden?.mejorar, 20) },
    entrenadorFuerteJugadorMejorar: listaT(e.entrenadorFuerteJugadorMejorar, 20), entrenadorFuerteJugadorNada: listaT(e.entrenadorFuerteJugadorNada, 20),
    jugadorFuerteEntrenadorMejorar: listaT(e.jugadorFuerteEntrenadorMejorar, 20), jugadorQuiereMejorar: listaT(e.jugadorQuiereMejorar, 20), jugadorSeVeFuerte: listaT(e.jugadorSeVeFuerte, 20),
    textos: { haceMejor: txt(t.haceMejor, 400), quiereMejorar: txt(t.quiereMejorar, 400), ayuda: txt(t.ayuda, 400) },
    confianza: ["", "Nada", "Poco", "Normal", "Bastante", "Mucho"].includes(e.confianza) ? e.confianza : "",
    orientacion: listaT(e.orientacion, 4).map((x) => x.slice(0, 160))
  };
  const hay = [o.coinciden.fuertes, o.coinciden.mejorar, o.entrenadorFuerteJugadorMejorar, o.entrenadorFuerteJugadorNada, o.jugadorFuerteEntrenadorMejorar, o.jugadorQuiereMejorar, o.jugadorSeVeFuerte].some((l) => l.length)
    || o.textos.haceMejor || o.textos.quiereMejorar || o.textos.ayuda || o.confianza || o.orientacion.length;
  return hay ? o : null;
}
export const ESQUEMA_AUTO = {
  type: "object", additionalProperties: false, required: ["analisis", "confianza", "deportivo", "mensaje"],
  properties: {
    analisis: { type: "string", description: "Para el entrenador: cómo se percibe el jugador frente a lo que ve el entrenador, qué indica sobre su conciencia de juego y su confianza, 3-5 frases." },
    confianza: { type: "array", items: { type: "string" }, description: "2-3 acciones concretas del entrenador para reforzar su confianza (sobre todo con lo que él no ve como fortaleza)." },
    deportivo: { type: "array", items: { type: "string" }, description: "2-3 inputs deportivos concretos para entrenar lo que hay que mejorar, con en qué fijarse y cuándo." },
    mensaje: { type: "string", description: "Mensaje del entrenador para la ficha del jugador, en segunda persona, 3-5 frases: reconoce lo que ve bien de sí mismo, le muestra lo que el entrenador ve y él quizá todavía no, y le da un foco concreto. Cálido y sereno." }
  }
};
export const SISTEMA_AUTO = `Eres un entrenador de fútbol base con formación en psicología del deporte. El entrenador ha marcado los puntos fuertes y lo que tiene que mejorar un jugador, y el jugador ha hecho su propia autoevaluación con los mismos aspectos, además de responder qué cree que hace mejor, qué quiere mejorar, en qué le gustaría que le ayudara su entrenador y cómo de seguro se siente jugando. No hay nombres.

Pirámide del rendimiento (se lee de abajo arriba): dónde pone la atención el jugador durante la competición (en los procesos de aprendizaje o en los resultados) marca su percepción de control, cómo regula el error y la derrota, su motivación (intrínseca o extrínseca), su adherencia al deporte, su autoeficacia y, al final, su rendimiento. La orientación a la tarea (maestría: el éxito es aprender y me comparo conmigo mismo) protege y sostiene el rendimiento; la orientación al ego (el éxito es ganar y me comparo con los demás) lo hace más frágil.

En «orientacion» pueden venir sus respuestas sobre cuándo se siente bien, qué hace cuando se equivoca, en qué se fija durante el partido y con quién se compara.

Tu tarea es ayudar al entrenador a trabajar la conciencia del jugador sobre su propio juego, su confianza y su orientación a la tarea:
- Lee las coincidencias (lo que los dos ven) y las diferencias. Lo que el entrenador ve como fortaleza y el jugador no (o quiere mejorar) es sobre todo trabajo de confianza. Lo que el jugador ve como fortaleza y el entrenador como algo a mejorar es una conversación sobre lo que pasa en los partidos, sin desautorizarlo.
- Las propuestas deportivas siguen el método: en qué fijarse (estímulos relevantes) y cuándo, sin instrucciones constantes durante el juego.
- El mensaje para el jugador es para un menor: cálido, concreto y sereno, sin etiquetas ni diagnósticos, sin comparar con compañeros y sin promesas. Pon el éxito en aprender y en mejorar respecto a él mismo, y en lo que tiene que mirar en cada jugada, no en el resultado.
- Si «entrenadores» es 2, el equipo lo llevan dos o más entrenadores: el mensaje habla en plural («vemos», «nosotros», «tus entrenadores»).
- Si su orientación va hacia el resultado o la comparación, incluye en «confianza» cómo puede el entrenador reforzar el esfuerzo, el aprendizaje y el progreso personal.

Castellano, segunda persona en el mensaje, frases cortas, sin emojis.`;
export function sanearAuto(o) {
  if (!o || typeof o !== "object") return null;
  const r = { analisis: txt(o.analisis, 1200), confianza: lista(o.confianza, 4).map((x) => txt(x, 250)).filter(Boolean), deportivo: lista(o.deportivo, 4).map((x) => txt(x, 250)).filter(Boolean), mensaje: txt(o.mensaje, 700) };
  return r.analisis || r.mensaje ? r : null;
}

// ---------------------------------------------------------------- informe del equipo: clima y refuerzos individuales
const ORI_OK = ["tarea", "mixta", "resultado"], ERR_OK = ["vuelve enseguida", "le cuesta un poco", "le cuesta mucho"], CONF_OK = ["Nada", "Poco", "Normal", "Bastante", "Mucho"];
const cuentas = (o, ks) => Object.fromEntries(ks.map((k) => [k, num(o && o[k], 0, 60)]));
export function sanearEntradaEquipo(e) {
  const vistos = new Set();
  const jugadores = lista(e.jugadores, 40).map((j) => ({
    jugador: /^J\d{1,2}$/.test(j && j.jugador) ? j.jugador : "", puesto: txt(j && j.puesto, 40), foco: txt(j && j.foco, 300), fijarse: txt(j && j.fijarse, 300),
    fuertes: listaT(j && j.fuertes, 3), noVeComoFortaleza: listaT(j && j.noVeComoFortaleza, 3), seVeFuerteEnLoQueHayQueMejorar: listaT(j && j.seVeFuerteEnLoQueHayQueMejorar, 3),
    orientacion: ORI_OK.includes(j && j.orientacion) ? j.orientacion : "", error: ERR_OK.includes(j && j.error) ? j.error : "",
    confianza: CONF_OK.includes(j && j.confianza) ? j.confianza : "", ayuda: txt(j && j.ayuda, 400), autoevaluacion: !!(j && j.autoevaluacion === true)
  })).filter((j) => j.jugador && !vistos.has(j.jugador) && vistos.add(j.jugador));
  if (!jugadores.length) return null;
  const c = e.clima || {}, en = e.entreno || {};
  return {
    modo: "equipo", etapa: txt(e.etapa, 40), entrenadores: e.entrenadores === 2 ? 2 : 1,
    clima: { jugadores: num(c.jugadores, 0, 60), conAutoevaluacion: num(c.conAutoevaluacion, 0, 60), orientacion: cuentas(c.orientacion, ORI_OK),
      error: cuentas(c.error, ["vuelveEnseguida", "leCuestaUnPoco", "leCuestaMucho"]), confianza: cuentas(c.confianza, ["alta", "normal", "baja"]) },
    necesidades: listaT(e.necesidades, 6), fortalezas: listaT(e.fortalezas, 6),
    entreno: { titulo: txt(en.titulo, 80), objetivo: txt(en.objetivo, 600), ejercicios: listaT(en.ejercicios, 10) },
    jugadores
  };
}
export const ESQUEMA_EQUIPO = {
  type: "object", additionalProperties: false, required: ["lectura", "grupo", "refuerzos"],
  properties: {
    lectura: { type: "string", description: "Para el entrenador: el clima del grupo (orientación, cómo viven el error, confianza, lo que más necesitan), 3-5 frases." },
    grupo: { type: "array", items: { type: "string" }, description: "2-3 acciones concretas para todo el grupo en el próximo entreno." },
    refuerzos: { type: "array", description: "Un refuerzo para cada jugador recibido.", items: {
      type: "object", additionalProperties: false, required: ["jugador", "hacer", "decir"],
      properties: {
        jugador: { type: "string", description: "El identificador recibido (J1, J2…)." },
        hacer: { type: "string", description: "Qué hace el entrenador con este jugador en el próximo entreno (antes, durante o después), 1-3 frases concretas y operativas." },
        decir: { type: "string", description: "Qué le dice al jugador, en segunda persona, 1-2 frases cortas, cálidas y concretas." }
      } } }
  }
};
export const SISTEMA_EQUIPO = `Eres un entrenador de fútbol base con formación en psicología del deporte. El entrenador te pasa el resumen de su equipo, sin nombres: el clima del grupo (orientación, cómo viven el error, confianza), lo que más necesitan y sus fortalezas, el próximo entreno si lo ha elegido y, para cada jugador (J1, J2…), su puesto, su foco de aprendizaje y en qué fijarse, sus puntos fuertes, lo que el entrenador ve como fortaleza y él todavía no, lo que él se ve fuerte y el entrenador tiene para mejorar, su orientación, cómo vive el error, su confianza y, a veces, en qué le pidió ayuda.

Pirámide del rendimiento (se lee de abajo arriba): dónde pone la atención el jugador durante la competición (en los procesos de aprendizaje o en los resultados) marca su percepción de control, cómo regula el error, su motivación, su autoeficacia y su rendimiento. La orientación a la tarea (el éxito es aprender y me comparo conmigo mismo) lo sostiene; la orientación al resultado o a la comparación lo hace más frágil.

Tu tarea es que cada jugador se sienta visto y acompañado en el próximo entreno y en el partido:
- Un refuerzo para cada jugador recibido, con su identificador exacto. Concreto y operativo, ligado a su foco y, si hay entreno, a un ejercicio concreto.
- Poca confianza o fortalezas que no ve: reconocimiento concreto y en público de lo que hace bien, o un papel en el que pueda usarlo.
- Le cuesta volver después de un error: rutina para volver (gesto, palabra clave), valorar el intento, no corregir en caliente.
- Orientación al resultado o a la comparación: preguntas y reconocimiento sobre el esfuerzo, lo que aprende y lo que mejora respecto a sí mismo.
- Se ve fuerte en lo que el entrenador tiene para mejorar: una conversación breve con ejemplos de los partidos, sin desautorizarlo.
- Si pidió ayuda en algo, inclúyelo.
- Las propuestas siguen el método: en qué fijarse (estímulos relevantes) y cuándo, sin instrucciones constantes durante el juego.
- «decir» es para un menor: cálido, concreto y sereno, sin etiquetas ni diagnósticos, sin compararlo con compañeros y sin promesas. Si «entrenadores» es 2, puede hablar en plural («vemos»).
- «lectura» y «grupo» son para los entrenadores: qué clima hay y qué hacer con todo el grupo.

Castellano, frases cortas, sin emojis.`;
export function sanearEquipo(o, entrada) {
  if (!o || typeof o !== "object") return null;
  const ids = new Set(((entrada && entrada.jugadores) || []).map((j) => j.jugador)), vistos = new Set();
  const refuerzos = lista(o.refuerzos, 40).map((r) => ({ jugador: txt(r && r.jugador, 4), hacer: txt(r && r.hacer, 500), decir: txt(r && r.decir, 300) }))
    .filter((r) => ids.has(r.jugador) && !vistos.has(r.jugador) && vistos.add(r.jugador) && (r.hacer || r.decir));
  const r = { lectura: txt(o.lectura, 1200), grupo: lista(o.grupo, 4).map((x) => txt(x, 300)).filter(Boolean), refuerzos };
  return r.lectura || refuerzos.length ? r : null;
}

// ---------------------------------------------------------------- mejorar un entreno a partir del anterior
export function sanearEntradaMejorar(e) {
  const vistos = new Set();
  const bloques = lista(e.bloques, 12).map((b) => Object.assign(bloqueFb(b), {
    bloque: /^B\d{1,2}$/.test(b && b.bloque) ? b.bloque : "", consignas: txt(b && b.consignas, 800), preguntas: txt(b && b.preguntas, 600), pizarra: !!(b && b.pizarra === true),
    situacionDeJuego: !!(b && b.situacionDeJuego === true),
    puestos: lista(b && b.puestos, 30).map((p) => ({ jugador: /^J\d{1,2}$/.test(p && p.jugador) ? p.jugador : "", rol: txt(p && p.rol, 40) })).filter((p) => p.jugador && p.rol),
    pautas: lista(b && b.pautas, 30).map((p) => ({ jugador: /^J\d{1,2}$/.test(p && p.jugador) ? p.jugador : "", texto: txt(p && p.texto, 200) })).filter((p) => p.jugador && p.texto)
  })).filter((b) => b.bloque && !vistos.has(b.bloque) && vistos.add(b.bloque) && (b.titulo || b.texto));
  if (!bloques.length) return null;
  const o = { modo: "mejorar", etapa: txt(e.etapa, 40), titulo: txt(e.titulo, 80), objetivo: txt(e.objetivo, 600), notaGeneral: txt(e.notaGeneral, 600), quiero: txt(e.quiero, 300),
    bloques, historial: historial(e.historial).slice(0, 4) };
  const eq = equipoCtx(e.equipo); if (eq) o.equipo = eq;
  return o;
}
export const ESQUEMA_MEJORAR = {
  type: "object", additionalProperties: false, required: ["analisis", "objetivo", "bloques"],
  properties: {
    analisis: { type: "string", description: "Para el entrenador: qué cambias y por qué (feedback, memoria e informe del equipo), 3-5 frases." },
    objetivo: { type: "string", description: "El objetivo del entreno, ajustado." },
    bloques: { type: "array", description: "Cada apartado recibido, con su versión mejorada.", items: {
      type: "object", additionalProperties: false, required: ["bloque", "cambio", "titulo", "texto", "consignas", "fijarse", "cuando", "condicion", "preguntas", "pautas"],
      properties: {
        bloque: { type: "string", description: "El identificador recibido (B1, B2…)." }, cambio: { type: "string", description: "Qué cambia y por qué, 1-2 frases." },
        titulo: { type: "string" }, texto: { type: "string", description: "Organización, espacio, número de jugadores y reglas." },
        consignas: { type: "array", items: { type: "string" } }, fijarse: { type: "string" }, cuando: { type: "string" },
        condicion: { type: "string", description: "Condición ligada al gol (vacía si no aplica)." }, preguntas: { type: "array", items: { type: "string" } }, pautas: PAUTAS
      } } }
  }
};
export const SISTEMA_MEJORAR = `Eres un entrenador de fútbol base con formación en psicología del deporte. El entrenador repite un entreno anterior y quiere mejorarlo, sesión tras sesión, sin empezar de cero. Te pasa cada apartado (B1, B2…) tal como está ahora, cómo fue la vez anterior (si costó, si encontraron los estímulos relevantes y su nota), la nota general, la memoria reciente del equipo y, a veces, el informe del equipo y lo que quiere cambiar. No hay nombres.

${METODO}

${EQUIPO_TXT}

Qué tienes que hacer: devolver cada apartado recibido, con su identificador exacto, mejorado. Mantén lo que funcionó. Si costó o no encontraron los estímulos, simplifícalo o hazlo más analítico; si fue bien, hazlo más real (más oposición, transiciones, menos tiempo o espacio). Afina los detalles y los matices: en qué fijarse y cuándo, la condición, las consignas y las preguntas. Fíjate en el tipo de ejercicio. En una situación de juego («situacionDeJuego»: true, por ejemplo la salida en corto desde saque de puerta, la presión o el balón parado) cada jugador está en su puesto: «puestos» dice quién hace de qué (J3 hace de central derecho…). Ahí las pautas son la función de cada puesto en esa situación (dónde colocarse, qué mirar y cuándo, a quién dar el pase), adaptadas a su foco si encaja, y la organización respeta las posiciones del juego real. En los ejercicios, rondos y juegos, las pautas siguen el foco de cada jugador. Si el apartado tiene pizarra («pizarra»: true), mantén una organización compatible (mismo número de jugadores y espacio) salvo que haga falta cambiarla, y entonces dilo en «cambio». Si no hace falta cambiar algo, devuélvelo igual. Respeta lo que pida el entrenador. Adapta todo a la edad. Castellano, segunda persona, frases cortas, sin emojis. No incluyas datos personales que pudiera llevar una nota.`;
export function sanearMejorar(o, entrada) {
  if (!o || typeof o !== "object") return null;
  const bids = new Set(((entrada && entrada.bloques) || []).map((b) => b.bloque)), ids = idsEquipo(entrada), vistos = new Set();
  ((entrada && entrada.bloques) || []).forEach((b) => (b.puestos || []).forEach((p) => ids.add(p.jugador))); // en situaciones de juego, también quien tiene puesto
  const bloques = lista(o.bloques, 12).map((b) => ({
    bloque: txt(b && b.bloque, 4), cambio: txt(b && b.cambio, 400), titulo: txt(b && b.titulo, 80), texto: txt(b && b.texto, 1200),
    consignas: lista(b && b.consignas, 8).map((c) => txt(c, 160)).filter(Boolean), fijarse: txt(b && b.fijarse, 300), cuando: txt(b && b.cuando, 300),
    condicion: txt(b && b.condicion, 300), preguntas: lista(b && b.preguntas, 6).map((c) => txt(c, 200)).filter(Boolean), pautas: sanearPautas(b && b.pautas, ids)
  })).filter((b) => bids.has(b.bloque) && !vistos.has(b.bloque) && vistos.add(b.bloque));
  if (!bloques.length) return null;
  return { analisis: txt(o.analisis, 1500), objetivo: txt(o.objetivo, 600), bloques };
}

// ---------------------------------------------------------------- cuartos del partido: líneas equilibradas
const nivelN = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.max(-10, Math.min(10, Math.round(n * 2) / 2)) : 0; };
export function sanearEntradaCuartos(e) {
  const vistos = new Set();
  const jugadores = lista(e.jugadores, 22).map((j) => ({
    jugador: /^J\d{1,2}$/.test(j && j.jugador) ? j.jugador : "", puesto: txt(j && j.puesto, 40),
    tecnica: nivelN(j && j.tecnica), tactica: nivelN(j && j.tactica), fisico: nivelN(j && j.fisico),
    fuertes: listaT(j && j.fuertes, 4), mejorar: listaT(j && j.mejorar, 4)
  })).filter((j) => j.jugador && !vistos.has(j.jugador) && vistos.add(j.jugador));
  const s = e.sistema || {};
  const puestos = lista(s.puestos, 11).map((p, i) => ({ puesto: i, nombre: txt(p && p.nombre, 40) })).filter((p) => p.nombre);
  if (jugadores.length < 2 || puestos.length !== 11) return null;
  const ids = new Set(jugadores.map((j) => j.jugador));
  const actual = lista(e.actual, 4).map((q, i) => ({ cuarto: i + 1, alineacion: lista(q && q.alineacion, 40).map((a) => ({ puesto: a && a.puesto, jugador: txt(a && a.jugador, 4) })).filter((a) => Number.isInteger(a.puesto) && a.puesto >= 0 && a.puesto <= 10 && ids.has(a.jugador)).slice(0, 11) }));
  return { modo: "cuartos", etapa: txt(e.etapa, 40), sistema: { nombre: txt(s.nombre, 20), puestos }, jugadores, actual, quiero: txt(e.quiero, 300) };
}
export const ESQUEMA_CUARTOS = {
  type: "object", additionalProperties: false, required: ["analisis", "cuartos"],
  properties: {
    analisis: { type: "string", description: "Para el entrenador: cómo has repartido y equilibrado las líneas, y los minutos de cada uno, 3-5 frases." },
    cuartos: { type: "array", description: "Los cuatro cuartos, del 1 al 4.", items: {
      type: "object", additionalProperties: false, required: ["cuarto", "nota", "alineacion"],
      properties: {
        cuarto: { type: "integer" }, nota: { type: "string", description: "Una frase: qué tiene este cuarto (por ejemplo, qué pareja de pivotes y por qué)." },
        alineacion: { type: "array", description: "Once jugadores: uno por puesto (0-10), sin repetir jugador.", items: {
          type: "object", additionalProperties: false, required: ["puesto", "jugador"], properties: { puesto: { type: "integer" }, jugador: { type: "string" } } } }
      } } }
  }
};
export const SISTEMA_CUARTOS = `Eres un entrenador de fútbol base con formación en psicología del deporte. El partido se juega en cuatro cuartos y el entrenador te pasa el sistema (once puestos numerados del 0 al 10), los jugadores convocados sin nombres (J1, J2…) con su puesto habitual, un nivel aproximado de técnica, táctica y físico sacado de sus notas (positivo, puntos fuertes; negativo, aspectos a mejorar; 0, sin datos) y sus puntos fuertes y lo que tiene que mejorar. A veces viene la propuesta actual y lo que quiere el entrenador.

Tu tarea es proponer quién sale en cada puesto en cada cuarto:
- Cada jugador en su puesto habitual o en uno parecido; el portero, en la portería.
- Minutos para todos: reparte los cuartos lo más igualados posible (todos los convocados juegan al menos dos cuartos si hay sitio) y alterna a los porteros si hay más de uno.
- Líneas equilibradas en cada cuarto: que ninguna línea (defensa, medio y ataque) ni ninguna pareja (centrales, pivotes, extremos) junte solo a los más fuertes o solo a los que más tienen que mejorar en técnica, táctica y físico; combina perfiles que se complementen.
- Estabilidad: pocos cambios de puesto para un mismo jugador entre cuartos.
- Respeta lo que pida el entrenador.
Devuelve los cuatro cuartos completos (once jugadores en cada uno, sin repetir jugador dentro de un cuarto) y usa solo los identificadores recibidos. Castellano, frases cortas, sin emojis y sin nombres.`;
export function sanearCuartos(o, entrada) {
  if (!o || typeof o !== "object") return null;
  const ids = new Set(((entrada && entrada.jugadores) || []).map((j) => j.jugador)), vistosQ = new Set();
  const cuartos = lista(o.cuartos, 4).map((q) => {
    const c = q && q.cuarto; if (!Number.isInteger(c) || c < 1 || c > 4 || vistosQ.has(c)) return null; vistosQ.add(c);
    const ps = new Set(), js = new Set();
    const alineacion = lista(q && q.alineacion, 40).map((a) => ({ puesto: a && a.puesto, jugador: txt(a && a.jugador, 4) }))
      .filter((a) => Number.isInteger(a.puesto) && a.puesto >= 0 && a.puesto <= 10 && ids.has(a.jugador) && !ps.has(a.puesto) && !js.has(a.jugador) && ps.add(a.puesto) && js.add(a.jugador)).slice(0, 11);
    return alineacion.length ? { cuarto: c, nota: txt(q && q.nota, 300), alineacion } : null;
  }).filter(Boolean).sort((a, b) => a.cuarto - b.cuarto);
  if (cuartos.length !== 4) return null; // los cuatro cuartos, o nada
  return { analisis: txt(o.analisis, 1500), cuartos };
}
