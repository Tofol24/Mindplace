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
      description: "Consejo privado para un jugador concreto en este apartado, a partir de sus notas: cómo aprovechar su punto fuerte aquí y en qué centrarse para mejorar.",
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
- En los entrenamientos, seguir los cinco pasos del método para cualquier aprendizaje: (1) dar a conocer los estímulos relevantes, qué mirar y cuándo; (2) un ejercicio analítico que repita el gesto y demuestre que lo entienden; (3) saber que lo conocen pero aún no lo han aprendido: es la experiencia la que lo hace aprender, así que el entrenador no repite la consigna en cada error ni lo vive como un drama; (4) una dinámica ecológica con variables del juego real (porterías, un equipo gana y otro pierde) y sobre todo con el cambio de foco de las transiciones, ataque-defensa al perder el balón y defensa-ataque al recuperarlo; (5) condicionar la acción al refuerzo natural del fútbol, el gol: la condición la tiene un equipo y no la pierde al perder el balón, y el entrenador pasa a observar y a preguntar. Si el apartado indica en qué paso está («fase»), ajusta la propuesta a ese paso. Nunca propongas que el entrenador dé instrucciones constantes durante el juego.
- Si un paso de la jugada está marcado como «perdida» o «recuperacion», en ese paso las indicaciones tienen que hablar del cambio de foco: qué mirar en el primer segundo.
- En «condicion», en entrenamientos, una condición concreta ligada al gol; en partidos, cadena vacía. En «preguntas», 2-4 preguntas abiertas sobre qué miraron y cuándo, para hacer después.
- En «indicaciones», dar a cada ficha de nuestro equipo que aparezca en los pasos lo que hace, en qué se fija y cuándo, con la numeración de pasos recibida (empieza en 1). Solo fichas que existan en los pasos. Estas indicaciones las ve todo el grupo: nunca menciones puntos débiles personales en ellas.
- En «individual», para los jugadores con notas, un consejo privado: cómo sacar partido a su punto fuerte en este apartado y en qué centrarse para mejorar, de forma constructiva.

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
