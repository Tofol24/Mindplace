/* APRENS · Los padres también juegan. Contenido en CASTELLANO
   Misma estructura que contingut-ca.js. Si cambiáis una clave aquí,
   cambiadla también allí. Los textos de familia parten del documento
   «El paper dels pares dins l'esport de base» (Tòfol Villalonga, APRENS);
   el módulo de entrenadores es una ampliación coherente con esos principios. */
window.EPJ_TXT = window.EPJ_TXT || {};
window.EPJ_TXT.es = {
  lang: "es",

  ui: {
    appName: "Los padres también juegan",
    marca: "APRENS",
    subtitol: "Tu comportamiento también forma parte del partido.",
    idioma: "Idioma",
    canviaRol: "Cambiar de papel",
    inici: "Inicio", abans: "Antes", durant: "Durante", despres: "Después", apren: "Aprende", registre: "Registro",
    seguent: "Siguiente", enrere: "Atrás", tancar: "Cerrar", desar: "Guardar", fet: "Hecho", continuar: "Continuar", ometre: "Omitir",
    opcional: "opcional",
    totesValides: "Todas las respuestas son válidas.",
    noNoms: "No escribas nombres ni datos que puedan identificar a ningún menor ni a ninguna otra persona.",
    desat: "Guardado.",
    pausaBtn: "Necesito hacer una pausa",
    pausaBtnSub: "Reconozco · me acompaño · elijo",
    rapidBtn: "Modo rápido (10 segundos)",
    seguretatTitol: "Si hay violencia, acoso o riesgo para un menor",
    seguretatText: "Primero, la protección. Avisa al árbitro, al entrenador o al delegado y sigue el protocolo del club. La pausa puede esperar.",
    seguretatClub: "Contacto de protección del club:",
    peu1: "Basado en «El papel de los padres en el deporte de base».",
    peu2: "Tòfol Villalonga · Psicólogo General Sanitario (B-01599) · Psicología del deporte",
    peu3: "APRENS Psicologia · Inca · aprens.net",
    peuPriv: "Lo que anotas se queda solo en este dispositivo.",
    privacitat: "Privacidad y datos",
    perClubs: "Para clubes",
    somEquip: "Somos un equipo también fuera del campo",
    colors: "Los colores de la silueta son una representación pedagógica. No miden la actividad del cerebro, del sistema nervioso ni ningún estado fisiológico.",
    partitEnCurs: "Tienes un partido en curso",
    continuarPartit: "Continuar",
    descartarPartit: "Descartar"
  },

  benvinguda: {
    titol: "Los padres también juegan",
    text: "Una herramienta para acompañar mejor a nuestros deportistas, antes, durante y después de cada partido. No se trata de estar siempre tranquilos: enfadarse, ponerse nervioso o sufrir es humano. Lo que podemos entrenar es qué hacemos con lo que sentimos.",
    principi: "Primero me acompaño a mí mismo para poder acompañar mejor al deportista.",
    triaIdioma: "Elige el idioma",
    privTitol: "Antes de empezar: tus datos",
    privText: [
      "No te pedimos nombre, correo ni ningún registro de usuario.",
      "Lo que anotes se guarda solo en este dispositivo, dentro del navegador. No se envía a APRENS, ni al club, ni a nadie.",
      "Si borras los datos del navegador o cambias de móvil, los registros se pierden. Puedes exportarlos cuando quieras.",
      "No escribas nombres de menores ni datos que puedan identificarlos."
    ],
    privAccepta: "Lo entiendo, adelante",
    triaRol: "¿Cuál es tu papel?"
  },

  rols: {
    familia: { t: "Soy padre, madre o familiar", d: "Acompaño a un jugador o jugadora desde la grada y en casa.", qui: "el padre, la madre o el familiar" },
    entrenador: { t: "Soy entrenador o entrenadora", d: "Dirijo el equipo, el banquillo y las sesiones.", qui: "el entrenador o la entrenadora" }
  },

  inici: {
    familia: "Tres momentos en cada partido. Unos minutos antes, una pausa cuando el partido te activa y un repaso cuando termina.",
    entrenador: "Prepara tu intención educativa antes de la sesión o del partido, regúlate durante y revisa al final.",
    abansD: "Cómo llego, qué me puede activar y cómo quiero comportarme.",
    durantD: "Una pausa breve cuando el partido te activa.",
    despresD: "Cómo ha ido y cómo recibir al deportista.",
    siluetaT: "Practicar con la silueta",
    siluetaD: "Reconocer la activación y acompañarla, sin prisas.",
    aprenT: "Aprende a acompañar mejor",
    aprenD: "Microlecciones de un minuto con una acción para el próximo partido.",
    entrenadorsT: "Itinerario para entrenadores",
    entrenadorsD: "Situaciones de banquillo y comunicación educativa.",
    setmanalT: "Mi compromiso como acompañante",
    setmanalD: "Un objetivo concreto para esta semana."
  },

  /* ---------- ANTES ---------- */
  abans: {
    titol: "Antes de empezar, prepara también tu papel",
    durada: "Uno o dos minutos.",
    q1: "¿Cómo llego hoy?",
    q1d: "Puedes elegir más de una.",
    q2: "¿Qué situaciones podrían activarme hoy?",
    q2d: "Saberlo antes ayuda a no ir con el piloto automático.",
    q3: "¿Cómo quiero comportarme hoy?",
    q3d: "Elige uno o dos. Mejor pocos y cumplidos.",
    maxDos: "Ya has elegido dos. Si quieres otro, desmarca uno.",
    intencio: "Mi intención educativa de hoy",
    intencioD: "Una frase corta que te recuerde qué quieres transmitir al equipo.",
    intencioPh: "Ej.: que cada jugador salga sabiendo qué ha hecho bien",
    context: "¿Es un partido o una sesión de entrenamiento?",
    contextPartit: "Partido", contextSessio: "Entrenamiento",
    acabar: "Terminar con una pausa breve",
    acabarD: "Un minuto con la silueta para llegar más presente.",
    senseCompromis: "Puedes continuar sin elegir compromiso, pero te ayudará tener uno presente.",
    llest: "Preparado. Tu compromiso te esperará durante y después del partido.",
    anarDurant: "Ir a «Durante»"
  },

  emocions: [
    { id: "serenitat", t: "Serenidad" },
    { id: "nervis", t: "Nervios" },
    { id: "cansament", t: "Cansancio" },
    { id: "illusio", t: "Ilusión" },
    { id: "enuig", t: "Enfado" },
    { id: "preocupacio", t: "Preocupación" },
    { id: "frustracio", t: "Frustración" }
  ],

  disparadors: {
    familia: [
      { id: "errors", t: "Que mi hijo o hija cometa errores" },
      { id: "minuts", t: "Que juegue pocos minutos" },
      { id: "arbitre", t: "Que el árbitro se equivoque" },
      { id: "decisions", t: "Que el entrenador tome decisiones que no comparto" },
      { id: "altresPares", t: "Que otros padres hagan comentarios" },
      { id: "actitud", t: "Que no muestre la actitud que espero" },
      { id: "perdre", t: "Que el equipo pierda" },
      { id: "euforia", t: "Que ganemos y yo me exalte demasiado" }
    ],
    entrenador: [
      { id: "errorsRep", t: "Errores repetidos" },
      { id: "atencio", t: "Falta de atención" },
      { id: "arbitre", t: "Decisiones arbitrales" },
      { id: "faltaRespecte", t: "Comportamientos irrespetuosos" },
      { id: "resultat", t: "La presión del resultado" },
      { id: "conflictes", t: "Conflictos entre jugadores" },
      { id: "families", t: "Reacciones de las familias" },
      { id: "comunicacio", t: "Dificultad para mantener una comunicación educativa" }
    ]
  },

  compromisos: {
    familia: [
      { id: "respectar", t: "Respetar a todos: árbitros, rivales, entrenadores y familias" },
      { id: "noInstruccions", t: "No gritar instrucciones desde la grada" },
      { id: "noCritiques", t: "No criticar los errores" },
      { id: "acompanyar", t: "Acompañar desde el respeto" },
      { id: "serenPerdre", t: "Mantener una actitud serena también si perdemos" },
      { id: "escoltar", t: "Escuchar antes de aconsejar" },
      { id: "reconeixer", t: "Reconocer el esfuerzo y el compañerismo" },
      { id: "exemple", t: "Ser un ejemplo de autocontrol y respeto" },
      { id: "noDiscutirEntrenador", t: "No discutir las decisiones del entrenador delante de mi hijo" }
    ],
    entrenador: [
      { id: "respectar", t: "Respetar a todos, también al árbitro, delante de los jugadores" },
      { id: "instruccionsBreus", t: "Dar instrucciones breves y claras, sin gritar" },
      { id: "corregirPrivat", t: "Corregir en privado y reconocer en público" },
      { id: "esforc", t: "Valorar el esfuerzo, las decisiones y la cooperación, no solo el acierto" },
      { id: "serenPerdre", t: "Mantener una actitud serena también si perdemos" },
      { id: "escoltar", t: "Escuchar antes de corregir" },
      { id: "totsSurten", t: "Que cada jugador salga sabiendo qué ha hecho bien" },
      { id: "exemple", t: "Ser un ejemplo de autocontrol y respeto" }
    ]
  },

  /* ---------- SILUETA AIS ---------- */
  zones: [
    { id: "cap", t: "Cabeza" },
    { id: "gola", t: "Garganta" },
    { id: "espatles", t: "Hombros" },
    { id: "pit", t: "Pecho" },
    { id: "panxa", t: "Abdomen" },
    { id: "esquena", t: "Espalda" },
    { id: "bracos", t: "Brazos" },
    { id: "mans", t: "Manos" },
    { id: "cames", t: "Piernas" },
    { id: "peus", t: "Pies" }
  ],

  silueta: {
    titol: "La silueta: reconocer, acompañar, elegir",
    intro: "Una práctica corta de Atención Interna Sensorial (AIS). No hace falta cerrar los ojos: puedes hacerla en la grada o en el banquillo, con los ojos abiertos.",
    estats: [
      { id: "reconec", n: "1", t: "Reconozco", d: "Toca donde notas la activación: tensión, inquietud, calor, un nudo… Aparecerá una luz amarilla." },
      { id: "acompany", n: "2", t: "Me acompaño", d: "Toca donde quieres poner la atención. La luz azul es el gesto voluntario de acompañarte. Puede convivir con la amarilla." },
      { id: "elegesc", n: "3", t: "Elijo", d: "Con lo que sientes presente, tu atención se dirige hacia cómo quieres comportarte." }
    ],
    llegendaGroc: "Luz amarilla · activación que reconozco",
    llegendaBlau: "Luz azul · atención que llevo ahí",
    grocMsg: "No hace falta eliminar esta sensación. Puedes reconocerla y acompañarla.",
    blauMsg: "Llevas ahí la atención con amabilidad, sin prisa.",
    elegescMsg: "La sensación puede seguir aquí. Tú puedes elegir cómo actuar.",
    elegescPregunta: "¿Qué respuesta representa a la persona que quiero ser hoy?",
    senseCompromis: "Todavía no has elegido ningún compromiso. Puedes hacerlo en «Antes».",
    groguesQueden: "La luz amarilla no tiene que desaparecer para hacerlo bien. Se puede actuar bien aunque la sensación continúe.",
    zonaSel: "Zonas marcadas",
    capZona: "Todavía ninguna zona.",
    esborrarZones: "Borrar las marcas",
    consignes: [
      "Date cuenta de lo que está pasando.",
      "Siente el apoyo de los pies en el suelo, o la zona del cuerpo que has elegido.",
      "Respira de forma natural y suave.",
      "Permite que la sensación esté ahí, sin pelearte con ella.",
      "Recuerda cómo quieres comportarte.",
      "Vuelve al partido con una actitud respetuosa."
    ],
    respiracio: "Guía de respiración (opcional)",
    respiracioOn: "Activada", respiracioOff: "Desactivada",
    respEntra: "Entra el aire", respSurt: "Sale el aire",
    percepcio: "¿Qué notas ahora?",
    percepcions: [
      { id: "clara", t: "Una sensación clara", m: "Bien. Puedes reconocerla y dejar que esté ahí mientras vuelves al partido." },
      { id: "tenue", t: "Una sensación muy suave", m: "Es normal. Notarlo, aunque sea poco, ya es atención." },
      { id: "res", t: "No noto nada especial", m: "También es válido. Puedes apoyar la atención en los pies o en las manos, o mirar lo que tienes alrededor." }
    ],
    externaBtn: "Me resulta incómodo atender al cuerpo",
    externaT: "Orientación hacia fuera",
    externa: [
      "Mira tres cosas que tienes alrededor y nómbralas por dentro.",
      "Siente los pies en el suelo: el peso, el contacto, la temperatura.",
      "Escucha dos sonidos distintos, uno cerca y otro lejos.",
      "Cuando estés preparado, recuerda cómo quieres comportarte."
    ],
    tornarCos: "Volver a la silueta",
    accessible: "Puedes usar la lista de zonas en lugar del dibujo. Cada zona indica en texto si tiene luz amarilla, azul o ambas."
  },

  /* ---------- PAUSA (DURANTE) ---------- */
  durant: {
    titol: "Cuando el partido te activa, vuelve a ti",
    intro: "Para abrir en la grada o en el banquillo. Entre veinte y cuarenta segundos.",
    escenarisT: "Situaciones que nos activan",
    escenarisD: "Toca una situación para ver qué suele pasar y qué puedes hacer.",
    pas1: "Reconozco",
    pas1t: "Mi cuerpo está reaccionando.",
    pas1d: "Si quieres, toca donde lo notas. Si no lo sabes, también está bien.",
    situacioQ: "¿Qué ha pasado? (opcional)",
    pas2: "Me acompaño",
    pas2t: "Puedo sentir este enfado sin tener que descargarlo.",
    pas2d: "Deja la atención en la zona, con la respiración natural. Bastarán unos segundos.",
    pas3: "Elijo",
    pas3t: "¿Qué respuesta representa a {qui} que quiero ser?",
    pas3sense: "Hoy no has elegido compromiso. Piensa en una sola cosa que puedas hacer ahora y que te acerque a la persona que quieres ser.",
    tornar: "Vuelvo al partido desde el respeto",
    rapidT: "Modo rápido",
    rapid: ["Para.", "Respira.", "Elige."],
    rapidFi: "Vuelvo al partido",
    registrada: "Pausa registrada. Detenerse también es educar.",
    reaccio: "Posible reacción automática",
    cos: "Sensación en el cuerpo",
    pensament: "Pensamiento automático",
    ais: "Práctica AIS",
    intervencio: "Qué me puedo decir",
    alternativa: "Alternativa acorde con tus valores",
    frase: "Una frase adecuada",
    evitar: "Mejor evitar",
    noDefecte: "Sentir esto no te convierte en mal padre ni en mal entrenador: es una reacción automática. Lo que importa es qué haces con ello. Los insultos, las amenazas y las agresiones no son aceptables en ningún caso.",
    ferPausa: "Hacer la pausa con esta situación"
  },

  escenaris: [
    { id: "penal", rols: ["familia", "entrenador"], t: "El árbitro pita un penalti en contra",
      reaccio: "Protestar en voz alta, levantarse, gesticular.", cos: "Calor en la cara, tensión en el pecho y en la mandíbula.",
      pensament: "«¡Esto es una vergüenza!»", intervencio: "«Puedo estar enfadado y seguir respetando al árbitro.»", ais: "Reconozco el calor en el pecho y dejo ahí la atención durante tres respiraciones.",
      alternativa: "Sentarse, dejar pasar la jugada y animar al equipo para lo que viene.", frase: "«¡Ánimo, equipo! ¡Seguimos!»",
      evitar: "Insultar o increpar al árbitro. Los jugadores aprenden de lo que ven en la grada." },
    { id: "pilota", rols: ["familia"], t: "Mi hijo pierde un balón importante",
      reaccio: "Hacer un gesto de desaprobación, decirle lo que tenía que hacer.", cos: "Nudo en el estómago, manos que se aprietan.",
      pensament: "«No puede ser que falle eso.»", ais: "Noto el nudo en el abdomen y lo dejo estar, sin hacer caso a la urgencia de decir nada.",
      alternativa: "Aplaudir para darle apoyo y dejar que el entrenador haga su trabajo.", frase: "«¡Venga, a la siguiente!»",
      evitar: "Gritarle instrucciones o poner caras que él pueda ver." },
    { id: "noSurt", rols: ["familia"], t: "Mi hijo no sale a jugar",
      reaccio: "Comentar con otros padres que el entrenador no es justo.", cos: "Presión en el pecho, inquietud en las piernas.",
      pensament: "«No lo valora. Así no va a progresar.»", intervencio: "«Puedo estar preocupado y ofrecerle seguridad, no más presión.»", ais: "Reconozco la presión en el pecho. Llevo la atención a los pies en el suelo.",
      alternativa: "Seguir animando al equipo. Si tienes dudas, pedir una cita al entrenador otro día.", frase: "Después: «Si quieres hablar de cómo te has sentido, te escucho.»",
      evitar: "Criticar al entrenador delante del hijo o de otras familias." },
    { id: "canvi", rols: ["familia"], t: "El entrenador cambia a mi hijo",
      reaccio: "Hacer un gesto de enfado hacia el banquillo.", cos: "Tensión en los hombros y en la garganta.",
      pensament: "«Siempre lo cambia a él.»", ais: "Suelto el aire poco a poco y noto los hombros.",
      alternativa: "Aplaudirle cuando sale, como reconocimiento del esfuerzo.", frase: "«¡Buen trabajo!»",
      evitar: "Compararlo con otros jugadores o cuestionar el cambio en voz alta." },
    { id: "insult", rols: ["familia", "entrenador"], seguretat: true, t: "Otro padre empieza a insultar",
      reaccio: "Encararse, responder en el mismo tono.", cos: "Calor, corazón acelerado, manos tensas.",
      pensament: "«Esto no pienso consentirlo.»", intervencio: "«Puedo sentir enfado sin descargarlo sobre nadie.»", ais: "Reconozco la activación y me doy unos segundos antes de hacer nada.",
      alternativa: "No ponerte a su altura. Alejarte y avisar al delegado o al responsable del club para que aplique el protocolo.", frase: "Al delegado: «Hay una persona insultando, ¿podéis atenderlo?»",
      evitar: "Responder con insultos o enfrentarte físicamente." },
    { id: "gol", rols: ["familia", "entrenador"], t: "Nuestro equipo recibe un gol",
      reaccio: "Resoplar, quejarse, buscar culpables.", cos: "Peso en el pecho, desánimo en el cuerpo.",
      pensament: "«Ya está, el partido está perdido.»", intervencio: "«Puedo sentir decepción y seguir animando.»", ais: "Noto el peso en el pecho y lo reconozco: es decepción, y es normal.",
      alternativa: "Animar al equipo justo después del gol, que es cuando más lo necesita.", frase: "«¡Arriba, que aún queda partido!»",
      evitar: "Señalar al jugador que ha fallado." },
    { id: "errorDecisiu", rols: ["familia", "entrenador"], t: "Un jugador comete un error decisivo",
      reaccio: "Reprocharle el error en voz alta.", cos: "Tensión en la mandíbula y en las manos.",
      pensament: "«Por su culpa hemos perdido.»", intervencio: "«Puedo sentir frustración y actuar desde el respeto.»", ais: "Reconozco la tensión en las manos y las dejo quietas unos segundos.",
      alternativa: "Recordar que todos los deportistas se equivocan, también los profesionales. Darle apoyo.", frase: "«Tranquilo, a todos nos pasa. Seguimos.»",
      evitar: "Culparle delante del equipo o de la grada." },
    { id: "plora", rols: ["familia", "entrenador"], t: "Mi hijo (o un jugador) llora",
      reaccio: "Querer resolverlo enseguida, sobreproteger o decirle que no llore.", cos: "Nudo en la garganta, angustia en el pecho.",
      pensament: "«No puedo verlo así, tengo que arreglarlo.»", ais: "Reconozco el nudo en la garganta y me quedo presente, sin prisas.",
      alternativa: "Estar cerca sin agobiar. Que sepa que estás ahí.", frase: "«Estoy aquí. Si quieres hablar, te escucho.»",
      evitar: "«No llores, no es nada» o querer resolverle el problema." },
    { id: "golejada", rols: ["familia", "entrenador"], t: "El equipo va perdiendo por muchos goles",
      reaccio: "Desconectar, criticar o hacer comentarios irónicos.", cos: "Cansancio, pesadez, frustración.",
      pensament: "«Esto es un desastre.»", ais: "Noto la frustración y la dejo estar, sin alimentarla con más pensamientos.",
      alternativa: "Valorar el esfuerzo y lo que se hace bien, que siempre lo hay.", frase: "«¡Muy bien, no os rindáis!»",
      evitar: "Ser catastrofistas o ridiculizar al equipo." },
    { id: "euforia", rols: ["familia", "entrenador"], t: "El equipo gana y todo el mundo se exalta",
      reaccio: "Celebrar de forma excesiva o burlarse del rival.", cos: "Euforia, energía acelerada.",
      pensament: "«¡Somos los mejores!»", ais: "Noto la energía en el pecho y dejo que se asiente.",
      alternativa: "Celebrar con respeto y reconocer también al rival.", frase: "«¡Buen partido a los dos equipos!»",
      evitar: "Humillar al rival o crear expectativas desmesuradas." },
    { id: "desbordat", rols: ["entrenador"], t: "Me siento desbordado por los errores del equipo",
      reaccio: "Gritar, dar muchas instrucciones a la vez.", cos: "Tensión en el cuello y en los hombros, respiración corta.",
      pensament: "«No aprenden nada.»", ais: "Reconozco la tensión en los hombros y suelto el aire poco a poco.",
      alternativa: "Elegir una sola indicación clara y guardar el resto para el entrenamiento.", frase: "«Nos centramos en una cosa: …»",
      evitar: "Descargar la frustración sobre los jugadores." },
    { id: "conflicte", rols: ["entrenador", "familia"], seguretat: true, t: "Aparece un conflicto entre jugadores",
      reaccio: "Castigar en caliente o ignorarlo.", cos: "Alerta, tensión general.",
      pensament: "«Ya estamos como siempre.»", ais: "Primero, la seguridad. Después, una respiración antes de hablar.",
      alternativa: "Separar, calmar y hablar con los implicados cuando todos estén más serenos.", frase: "«Ahora paramos. Lo hablaremos cuando estemos tranquilos.»",
      evitar: "Humillar o castigar delante de todos." }
  ],

  /* ---------- DESPUÉS ---------- */
  despres: {
    titol: "El partido ha terminado. El acompañamiento continúa",
    durada: "Dos minutos.",
    q1: "¿Cómo me he sentido durante el partido?",
    q1d: "De 0 (muy tranquilo) a 10 (muy activado).",
    q2: "¿He notado alguna sensación en el cuerpo antes de reaccionar?",
    q2o: [{ id: "si", t: "Sí" }, { id: "aVegades", t: "A veces" }, { id: "no", t: "No he podido detectarla" }],
    q3: "¿He usado alguna práctica AIS?",
    q3o: [{ id: "si", t: "Sí" }, { id: "no", t: "No" }, { id: "noCalia", t: "No me ha hecho falta" }],
    q4: "¿Cómo me he comportado?",
    q4d: "Marca lo que has podido hacer. No es una nota, es para darte cuenta.",
    q5: "¿Ha habido alguna reacción mía que no me ha gustado?",
    q5d: "Por ejemplo, gritar, protestar o decir algo de lo que me arrepiento.",
    q5o: [{ id: "no", t: "No" }, { id: "si", t: "Sí" }],
    q6: "¿Qué me gustaría repetir?",
    q7: "¿Qué puedo mejorar en el próximo partido?",
    compromisAvui: "Tu compromiso de hoy era:",
    compromisQ: "¿He podido mantenerlo?",
    compromisO: [{ id: "si", t: "Sí" }, { id: "part", t: "En parte" }, { id: "no", t: "Me ha costado" }],
    desa: "Guardar el repaso",
    desat: "Repaso guardado. Gracias por dedicarle unos minutos.",
    rebreT: "Cómo recibir al deportista",
    rebreTEntrenador: "Cómo cerrar con el equipo",
    rebreIntro: "Después del partido, muchas veces es más útil escuchar y acompañar que analizar enseguida todos los errores.",
    rebrePregunta: "¿Cómo puedes hacer que tu hijo o hija se sienta acompañado hoy?",
    rebreQ: "¿Cómo está?",
    reparacioT: "Reconocer una reacción y repararla también es educar",
    reparacioIntro: "Todos podemos perder las formas. Eso no te define como padre, madre o entrenador. Lo que educa es lo que haces después.",
    reparacio: [
      "Reconoce qué ha pasado, sin justificarlo: «He gritado y no está bien».",
      "Asume la responsabilidad y pide disculpas a quien corresponda: tu hijo, el jugador, el árbitro u otra familia.",
      "Explica qué harás diferente: «En el próximo partido, si me altero, me detendré antes de decir nada».",
      "Elige un compromiso concreto para el próximo partido y, si te va bien, haz la práctica de la silueta antes de entrar."
    ],
    reparacioFeta: "He hecho o haré una reparación",
    reparacioPh: "¿Qué haré para repararlo? (sin nombres)"
  },

  checklist: {
    familia: [
      { id: "arbitres", t: "He respetado a los árbitros" },
      { id: "entrenadors", t: "He respetado a los entrenadores" },
      { id: "noCritica", t: "He evitado criticar en público" },
      { id: "animar", t: "He animado sin dar instrucciones" },
      { id: "sensePressio", t: "He acompañado a mi hijo sin presionarle" },
      { id: "reconeixerEnuig", t: "He podido reconocer mi enfado" },
      { id: "rectificar", t: "He rectificado una reacción poco adecuada" },
      { id: "escoltar", t: "He sabido escuchar" }
    ],
    entrenador: [
      { id: "arbitres", t: "He respetado al árbitro delante del equipo" },
      { id: "breus", t: "He dado instrucciones breves y claras" },
      { id: "privat", t: "He corregido en privado, sin humillar" },
      { id: "esforc", t: "He reconocido el esfuerzo y la cooperación" },
      { id: "totsJuguen", t: "He tenido en cuenta el progreso de todos los jugadores" },
      { id: "reconeixerEnuig", t: "He podido reconocer mi enfado" },
      { id: "rectificar", t: "He rectificado una reacción poco adecuada" },
      { id: "families", t: "He atendido a las familias con calma o he propuesto una cita" }
    ]
  },

  rebre: [
    { id: "guanyat", t: "Ha ganado", r: "Celébralo con él, con los pies en el suelo y sin euforia.", f: "«Me ha gustado verte disfrutar.»" },
    { id: "perdut", t: "Ha perdido", r: "Que tu reacción no sea muy distinta de cuando gana. No hace falta analizar nada ahora.", f: "«El resultado no cambia lo que siento por ti.»" },
    { id: "error", t: "Ha cometido un error", r: "Corregir es trabajo del entrenador. Tú puedes normalizarlo.", f: "«Todos nos equivocamos. Me ha gustado que lo volvieras a intentar.»" },
    { id: "poc", t: "Ha jugado pocos minutos", r: "Escúchale, deja que se desahogue y no eches leña al fuego criticando al entrenador.", f: "«Si quieres hablar de cómo te has sentido, te escucho.»" },
    { id: "trist", t: "Está triste", r: "Quédate cerca sin agobiarle ni querer resolverle el problema.", f: "«Estoy aquí. No hace falta que digas nada.»" },
    { id: "enfadat", t: "Está enfadado", r: "Deja que se exprese. Cuando esté más tranquilo, ya habrá tiempo para hablarlo.", f: "«Entiendo que estés enfadado. Cuando quieras, lo hablamos.»" },
    { id: "xerrador", t: "Quiere hablar mucho", r: "Aprovecha para escuchar y comprender cómo se siente. No hace falta correr a dar consejos.", f: "«¿Y tú, cómo te has sentido?»" },
    { id: "callat", t: "No quiere hablar", r: "Es normal. Respeta el silencio: basta con que sepa que estás ahí.", f: "«¿Quieres que lo hablemos o prefieres descansar?»" },
    { id: "extraordinari", t: "Ha hecho un partido extraordinario", r: "No eches las campanas al vuelo. Recuérdale que ha llegado ahí con esfuerzo y humildad.", f: "«Se nota todo lo que has trabajado. Disfrútalo.»" }
  ],

  rebreEntrenador: [
    { id: "guanyat", t: "Hemos ganado", r: "Reconoce el esfuerzo colectivo y también al rival. Pies en el suelo.", f: "«Buen trabajo de equipo. Ahora pensamos qué podemos seguir mejorando.»" },
    { id: "perdut", t: "Hemos perdido", r: "Primero lo que se ha hecho bien, después una sola cosa para mejorar.", f: "«Hoy hemos hecho bien esto. El martes trabajaremos esto otro.»" },
    { id: "error", t: "Ha habido un error decisivo", r: "No personalices el error delante del grupo. Si hace falta, háblalo en privado otro día.", f: "«Ganamos y perdemos juntos.»" },
    { id: "poc", t: "Algunos han jugado poco", r: "Una palabra tuya significa mucho para ellos. Explícales qué esperas de ellos.", f: "«Os necesito. Seguid trabajando así.»" },
    { id: "trist", t: "El equipo está desanimado", r: "Valida el sentimiento y recuerda que los malos momentos también enseñan.", f: "«Es normal estar así. Todos los equipos pasan por momentos como este.»" },
    { id: "enfadat", t: "Hay jugadores enfadados", r: "No los corrijas en caliente. Dales tiempo y háblalo en el entrenamiento.", f: "«Ahora descansamos. Lo hablaremos con calma.»" },
    { id: "families", t: "Una familia se acerca enfadada", r: "Justo después del partido no es buen momento. Escucha sin discutir y propón una cita.", f: "«Quiero escucharos bien. ¿Quedamos esta semana y lo hablamos?»" }
  ],

  /* ---------- APRENDE: MICROLECCIONES ---------- */
  apren: {
    titol: "Aprende a acompañar mejor",
    intro: "Lecciones de un minuto. Cada una termina con una pequeña acción para el próximo entrenamiento o partido.",
    accio: "Tu acción para el próximo partido",
    ferCompromis: "Hacerlo mi compromiso de la semana",
    llegida: "Leída",
    pregunta: "Piénsalo un momento"
  },

  llicons: [
    { id: "noEsResultat", t: "Mi hijo no es su resultado",
      cos: ["Tu hijo o hija tiene que sentir que vuestro cariño no depende de lo que hace en el campo: no os va a decepcionar, juegue bien o mal.",
            "Cuando nuestras reacciones son muy distintas si gana o si pierde, sin querer le decimos que el resultado nos importa más que él."],
      q: { t: "¿Qué frase transmite mejor esta idea?", o: [
        { t: "«Hoy sí que me has hecho feliz.»", ok: false, fb: "Liga tu alegría al resultado." },
        { t: "«Juegues como juegues, te quiero igual.»", ok: true, fb: "Exacto. Separa el cariño del rendimiento." } ] },
      accio: "Después del próximo partido, antes de hablar del resultado, pregúntale cómo se lo ha pasado." },
    { id: "animar", t: "Animar no es dar instrucciones",
      cos: ["Muchos chicos rinden peor si escuchan instrucciones, críticas o gestos de desaprobación desde la grada.",
            "Recibir órdenes contradictorias, las del entrenador y las tuyas, le confunde y le hace perder confianza en el entrenador."],
      q: { t: "¿Cuál de estos mensajes es animar?", o: [
        { t: "«¡Pásala! ¡Ábrete a la banda!»", ok: false, fb: "Es una instrucción: ese trabajo es del entrenador." },
        { t: "«¡Muy bien, equipo!»", ok: true, fb: "Eso es animar." } ] },
      accio: "En el próximo partido, solo aplausos y ánimos para todo el equipo. Ninguna instrucción." },
    { id: "comparar", t: "Por qué las comparaciones pueden hacer daño",
      cos: ["Cada jugador tiene sus características y circunstancias, y progresa a su ritmo.",
            "El jugador que vive pendiente de compararse con los compañeros deja de ser un buen jugador de equipo. Nuestras comparaciones lo alimentan."],
      q: { t: "¿Qué ayuda más?", o: [
        { t: "Fijarse en lo que él aporta al equipo.", ok: true, fb: "Sí. Respeta las diferencias y refuerza el juego de equipo." },
        { t: "Decirle que se fije en el mejor del equipo.", ok: false, fb: "Con buena intención, le pone a competir con los suyos." } ] },
      accio: "Esta semana, dile una cosa concreta que aporta al equipo, sin compararlo." },
    { id: "error", t: "El error forma parte de aprender",
      cos: ["Incluso los profesionales se equivocan. En las edades pequeñas, lo prioritario es que jueguen sin miedo a equivocarse.",
            "Si el error se castiga con críticas, el jugador deja de probar cosas nuevas."],
      q: { t: "Después de un error, ¿qué le dices?", o: [
        { t: "«Ya te lo había dicho.»", ok: false, fb: "Añade peso y no le ayuda a volver a intentarlo." },
        { t: "«Me ha gustado que lo intentaras.»", ok: true, fb: "Valoras la valentía, que es lo que le hace crecer." } ] },
      accio: "Cuando se equivoque, cuenta hasta tres antes de hacer ningún gesto. Después, aplaude el intento." },
    { id: "pocsMinuts", t: "Cuando juega pocos minutos",
      cos: ["Jugar más no significa progresar más: muchos que juegan poco a estas edades llegan más lejos.",
            "Tiene que aprender a aceptarlo con espíritu de equipo y, a la vez, a no conformarse y luchar por mejorar. Criticar al entrenador echa leña al fuego."],
      q: { t: "¿Qué haces si viene enfadado porque no ha jugado?", o: [
        { t: "Escucharle, dejar que se desahogue y animarle.", ok: true, fb: "Sí. Y si tú tienes dudas, pide una cita al entrenador." },
        { t: "Darle la razón: «Es que el entrenador no sabe».", ok: false, fb: "Le quita confianza en el entrenador y en el equipo." } ] },
      accio: "Si un día juega poco, dile: «Si quieres hablar de cómo te has sentido, te escucho»." },
    { id: "derrota", t: "Cómo afrontar una derrota",
      cos: ["Los éxitos y los fracasos forman parte del camino. Después de un fracaso: no ser catastrofistas, reconocer lo que se ha hecho bien y, más adelante, analizar qué hay que cambiar.",
            "Conviene que nuestras reacciones no sean muy distintas cuando ganan y cuando pierden."],
      q: { t: "Justo después de perder, ¿qué es más útil?", o: [
        { t: "Repasar todas las jugadas que han fallado.", ok: false, fb: "Ahora no es el momento. Primero, acompañar." },
        { t: "Estar cerca y reconocer el esfuerzo.", ok: true, fb: "Sí. El análisis, si hace falta, más adelante." } ] },
      accio: "En el próximo partido que pierdan, di una cosa que se ha hecho bien antes que cualquier otra." },
    { id: "exit", t: "Acompañar el éxito sin crear expectativas",
      cos: ["Muchos que prometían no han llegado por la presión de unas expectativas demasiado tempranas.",
            "Después de un éxito: pies en el suelo, recordar qué se ha hecho bien y pensar qué se puede mejorar todavía."],
      q: { t: "Ha hecho un gran partido. ¿Qué dices?", o: [
        { t: "«¡Vas a ser un crack!»", ok: false, fb: "Alimenta la euforia y las expectativas." },
        { t: "«Se nota todo lo que has trabajado.»", ok: true, fb: "Reconoce el esfuerzo y mantiene los pies en el suelo." } ] },
      accio: "Esta semana, cuando le felicites, felicita el esfuerzo, no el talento." },
    { id: "grada", t: "La grada también educa",
      cos: ["El comportamiento de los padres en la grada también es la imagen del club.",
            "Si otros padres pierden las formas, no te pongas a su altura. Respeta a los árbitros, aunque no estés de acuerdo, y también a los jugadores, entrenadores y familias del otro equipo."],
      q: { t: "Un padre increpa al árbitro a tu lado. ¿Qué haces?", o: [
        { t: "No entrar, y si continúa, avisar al delegado.", ok: true, fb: "Sí. No ponerse a su altura y dejar actuar al club." },
        { t: "Sumarte porque tiene razón.", ok: false, fb: "Los jugadores aprenden de lo que ven en la grada." } ] },
      accio: "En el próximo partido, aplaude al menos una buena jugada del otro equipo." },
    { id: "entrenador", t: "Respetar al entrenador y los canales adecuados",
      cos: ["Es normal no estar de acuerdo con todo. Pero es el entrenador quien tiene la responsabilidad deportiva, y siempre es mejor ayudarle que ponerle pegas, y nunca delante del hijo o de otros padres.",
            "Si tienes dudas, pide una cita con el entrenador o el coordinador y explícalo con tranquilidad. Justo después del partido no es el momento."],
      q: { t: "No estás de acuerdo con una decisión. ¿Qué haces?", o: [
        { t: "Lo comento en la grada con otros padres.", ok: false, fb: "Crea mal ambiente y le llega a tu hijo." },
        { t: "Pedir una cita con calma.", ok: true, fb: "Es el canal adecuado." } ] },
      accio: "Si tienes una discrepancia, escríbela y deja pasar un día antes de pedir la cita." },
    { id: "frustracio", t: "Acompañar la frustración sin sobreproteger",
      cos: ["Los malos momentos (perder, jugar poco, lesiones, problemas con compañeros) forman parte del aprendizaje y son una ocasión para fortalecerse.",
            "Ayuda: comprenderle, darle apoyo y ayudarle a no rendirse. No ayuda: compadecerle, querer resolverle los problemas o buscar excusas fáciles."],
      q: { t: "Está frustrado con un compañero. ¿Qué haces?", o: [
        { t: "Hablar yo con la familia del compañero.", ok: false, fb: "Es querer resolverle el problema." },
        { t: "Escucharle y preguntarle qué cree que puede hacer.", ok: true, fb: "Le acompañas sin quitarle el protagonismo." } ] },
      accio: "La próxima vez que esté frustrado, hazle una pregunta antes de darle ningún consejo." },
    { id: "estudis", t: "El deporte, los estudios y el equilibrio",
      cos: ["Tanto si soñáis con que sea profesional como si no, conviene exigirle que estudie. La gran mayoría no vivirán del deporte.",
            "Planificar el tiempo desde el primer día, dosificar pantallas y salidas y mostrar interés por los estudios forma parte de ser deportista."],
      q: { t: "¿Qué idea es más acertada?", o: [
        { t: "Estudiar y hacer deporte es la mejor combinación para estar preparado para la vida.", ok: true, fb: "Exacto." },
        { t: "Si tiene talento, los estudios pueden esperar.", ok: false, fb: "Estudiar es una herramienta que no debe rechazar." } ] },
      accio: "Esta semana, pregúntale por el colegio con el mismo interés que por el fútbol." },
    { id: "regulacio", t: "Mi regulación también educa",
      cos: ["Las emociones de un partido también nos alteran a los adultos. Si sabes que te pones nervioso, enfadado o eufórico, vale la pena prepararlo antes.",
            "No se trata de no sentir. Se trata de reconocer lo que sientes, acompañarlo y elegir cómo actúas. Tu hijo no tiene que gestionar las emociones de los adultos."],
      q: { t: "Notas que te estás enfadando. ¿Qué es lo primero?", o: [
        { t: "Darme cuenta y detenerme unos segundos.", ok: true, fb: "Sí. Crear un espacio entre lo que sientes y lo que haces." },
        { t: "Aguantarlo hasta que estalle.", ok: false, fb: "Reprimir no es lo mismo que acompañar." } ] },
      accio: "Antes del próximo partido, haz un minuto de práctica con la silueta." }
  ],

  /* ---------- LA PIRÁMIDE DEL RENDIMIENTO (APRENS) ---------- */
  piramide: {
    titol: "La pirámide del rendimiento",
    intro: "Los resultados pueden generar mucha motivación. Pero si no orientamos al deportista hacia la tarea, la adherencia, el aprendizaje continuo y la capacidad de regular la propia motivación pueden desvanecerse, y con ellas el esfuerzo y la ilusión por el deporte. Orientarse a la maestría es como una vacuna.",
    llegir: "Se lee de abajo arriba: dónde ponemos la atención durante la competición acaba marcando el control que percibimos, cómo regulamos el error, la motivación, la adherencia y, al final, el rendimiento.",
    cim: "Rendimiento",
    mestria: { t: "Orientación a la maestría", lema: "Para percibir éxito, tengo que aprender continuamente.", l: ["El éxito como camino: aprender es mi éxito.", "Me comparo conmigo mismo."] },
    ego: { t: "Orientación al ego", lema: "Para percibir éxito, tengo que obtener buenos resultados.", l: ["El éxito como destino: ganar, ganar y ganar.", "Me comparo con los demás."] },
    mira: "Mira la pirámide desde:",
    toca: "Toca un nivel para verlo desde las dos orientaciones.",
    nivells: [
      { id: "cos", t: "Dónde se enfoca mi cuerpo", sub: "¿durante la competición?", m: "enfocado a los procesos de aprendizaje", e: "enfocado a los resultados" },
      { id: "atencio", t: "Atención", sub: "", m: "estímulos de aprendizaje", e: "estímulos de resultados" },
      { id: "control", t: "Percepción de control", sub: "+ · −", m: "aprendizaje y reto", e: "miedo y percepción de fracaso" },
      { id: "regulacio", t: "Regulación emocional", sub: "ante el error y la derrota", m: "percepción de mejora", e: "obtener buenos resultados" },
      { id: "motivacio", t: "Motivación", sub: "intrínseca · extrínseca", m: "aprendizaje", e: "resultados" },
      { id: "adherencia", t: "Adherencia al deporte", sub: "", m: "", e: "" },
      { id: "autoeficacia", t: "Percepción de autoeficacia", sub: "", m: "", e: "" }
    ],
    entrenar: "El deportista y el entrenador lo tienen que entrenar. El psicólogo asesora para detectarlo y aprenderlo.",
    aisT: "Dónde empieza todo: la atención",
    ais: "La base de la pirámide es dónde ponemos la atención durante la competición. Por eso la práctica con la silueta no es solo para los adultos: aprender a volver al cuerpo y a la tarea es el primer escalón del rendimiento.",
    adultsT: "Qué podemos hacer los adultos",
    adults: {
      familia: [
        { no: "«¿Habéis ganado?» «¿Cuántos goles has marcado?»", si: "«¿Qué has aprendido hoy?» «¿Qué te ha salido mejor que la otra vez?»" },
        { no: "Compararlo con los compañeros o con el rival.", si: "Compararlo consigo mismo: cómo jugaba hace unos meses y cómo juega ahora." },
        { no: "Premiar solo los resultados.", si: "Reconocer el esfuerzo, la valentía de intentarlo y la mejora." }
      ],
      entrenador: [
        { no: "Objetivos solo de resultado: «Tenemos que ganar».", si: "Objetivos de proceso: «Hoy, salir jugando desde atrás»." },
        { no: "Valorar solo el acierto.", si: "Valorar la decisión, el intento y la cooperación, aunque la acción no salga." },
        { no: "Rankings internos y comparaciones públicas.", si: "Que cada jugador sepa en qué está mejorando." }
      ]
    },
    accio: "Después del próximo partido, haz una pregunta orientada a la maestría antes de hablar de ningún resultado.",
    font: "Material de APRENS · Psicología del deporte"
  },

  /* ---------- ITINERARIO ENTRENADORES ---------- */
  entrenadors: {
    titol: "Itinerario para entrenadores",
    intro: "El entrenador no solo regula sus emociones: es una figura adulta que puede hacer del equipo un entorno de aprendizaje seguro y respetuoso. Este módulo amplía el documento original desde los mismos principios.",
    situacionsT: "Situaciones de banquillo y de entrenamiento",
    comunicacioT: "Comunicación educativa",
    enLloc: "En lugar de…", proposa: "Prueba…",
    tecnicaT: "Corregir no es humillar",
    tecnica: [
      "La corrección técnica es legítima y necesaria: habla de la conducta o de la acción, es concreta y mira hacia el futuro.",
      "La humillación o la descarga emocional habla de la persona, es general («siempre», «nunca»), se hace en público y mira hacia el enfado del adulto.",
      "Pregúntate: lo que voy a decir, ¿le ayuda a aprender o me ayuda a mí a descargar?"
    ],
    clau: "Clave",
    fer: "Qué puedes hacer",
    evita: "Evita"
  },

  situacionsEntrenador: [
    { id: "errorsCont", t: "Un jugador comete errores continuados", clau: "El error repetido a menudo indica que todavía no tiene la herramienta, no que no quiera.",
      fer: ["Reduce la indicación a una sola cosa observable.", "Reconoce el intento antes de corregir.", "Trabájalo en el entrenamiento, no en pleno partido."],
      evitar: "«Siempre haces lo mismo.»", frase: "«Revisemos qué puedes hacer diferente la próxima vez.»" },
    { id: "bloqueig", t: "Un jugador se bloquea por miedo a fallar", clau: "El miedo al error frena el aprendizaje y la iniciativa.",
      fer: ["Dale permiso explícito para equivocarse.", "Ponle objetivos de conducta (intentar, ofrecerse), no de resultado.", "Celebra el intento en público."],
      evitar: "Exponerle o decirle «no tengas miedo».", frase: "«Inténtalo. Si falla, la responsabilidad es de los dos.»" },
    { id: "protestaCanvi", t: "Un jugador protesta cuando lo cambias", clau: "La frustración es comprensible; la falta de respeto necesita un límite.",
      fer: ["Deja pasar el momento caliente.", "Valida lo que siente y marca el límite de la forma.", "Explícale en privado qué esperas de él."],
      evitar: "Discutir con él en el banquillo delante de todos.", frase: "«Entiendo que te enfades. La forma de decirlo, la cuidaremos.»" },
    { id: "perdRepetit", t: "El equipo pierde una y otra vez", clau: "El progreso a largo plazo es más importante que el resultado de hoy.",
      fer: ["Define objetivos de proceso que se puedan alcanzar.", "Haz visible lo que mejoran, aunque el marcador no lo muestre.", "Cuida el ambiente del grupo."],
      evitar: "Buscar culpables dentro del equipo.", frase: "«Hoy hemos mejorado esto. Seguimos por aquí.»" },
    { id: "conflictesComp", t: "Conflictos entre compañeros", clau: "Primero la seguridad; después, el aprendizaje.",
      fer: ["Separa y calma.", "Escucha a cada parte por separado.", "Busca una reparación y un acuerdo concreto."],
      evitar: "Castigar en caliente o delante de todos.", frase: "«Ahora paramos. Después lo hablamos y lo arreglamos.»" },
    { id: "paresQuestionen", t: "Familias que cuestionan las decisiones técnicas", clau: "Entrenadores y familias formamos parte del mismo equipo, cada uno con su papel.",
      fer: ["No entres en discusiones justo después del partido.", "Ofrece una cita y escucha.", "Explica los criterios de grupo y de temporada."],
      evitar: "Responder en caliente o delante de los jugadores.", frase: "«Quiero escucharos bien. ¿Quedamos esta semana?»" },
    { id: "corregirConducta", t: "Corregir una conducta sin humillar", clau: "Se corrige la conducta, no la persona.",
      fer: ["Concreta qué ha pasado.", "Explica por qué no es aceptable.", "Indica qué esperas y qué consecuencia educativa y proporcionada habrá."],
      evitar: "Etiquetas («eres un…») o ridiculizar.", frase: "«Lo que has hecho no es aceptable en el equipo. Necesito que…»" },
    { id: "exigencia", t: "Transmitir exigencia sin condicionar la autoestima", clau: "Se puede ser exigente con la tarea y cálido con la persona.",
      fer: ["Exige sobre conductas que dependen de ellos.", "Separa el valor del jugador de su rendimiento.", "Reconoce el progreso."],
      evitar: "Ligar tu aprecio o su puesto al acierto.", frase: "«Te pido mucho porque sé que puedes hacerlo.»" },
    { id: "valorar", t: "Valorar esfuerzo, decisiones y cooperación", clau: "Lo que reconoces es lo que crece.",
      fer: ["Busca en cada sesión un ejemplo de esfuerzo, una buena decisión y un gesto de cooperación.", "Hazlo en público y de forma concreta."],
      evitar: "Reconocer solo los goles.", frase: "«Me ha gustado cómo te has ofrecido para ayudar al compañero.»" },
    { id: "limits", t: "Poner límites ante las faltas de respeto", clau: "Un límite claro también protege.",
      fer: ["Detén la situación enseguida.", "Nombra la norma del equipo.", "Aplica la consecuencia pactada, con calma."],
      evitar: "Dejarlo pasar o responder en el mismo tono.", frase: "«En el equipo nos respetamos. Esto no lo aceptamos.»" }
  ],

  comunicacio: [
    { no: "«Siempre haces lo mismo. No aprendes.»", si: "«Revisemos qué puedes hacer diferente la próxima vez.»" },
    { no: "«Si sigues así, no vas a jugar.»", si: "«Necesito que vuelvas a tu posición cuando perdemos el balón. Lo trabajaremos el martes y lo tendré en cuenta a la hora de hacer la alineación.»" },
    { no: "«¿Es que no te das cuenta de nada?»", si: "«Mira al compañero que está libre. Eso es lo que buscamos.»" },
    { no: "«Qué vergüenza de partido.»", si: "«Hoy no nos ha salido. Pensemos una cosa que hemos hecho bien y una para mejorar.»" },
    { no: "«Eres un desastre defendiendo.»", si: "«En defensa, fíjate en el jugador, no en el balón.»" }
  ],

  intencionsEntrenador: [
    "Que cada jugador salga sabiendo qué ha hecho bien",
    "Corregir una sola cosa cada vez",
    "Reconocer en público un gesto de cooperación",
    "Mantener el tono sereno también cuando perdemos",
    "Escuchar antes de corregir"
  ],

  /* ---------- COMPROMISO SEMANAL ---------- */
  setmanal: {
    titol: "Mi compromiso como acompañante",
    intro: "Un objetivo concreto para esta semana. No se trata de sumar puntos, sino de crear un hábito que se pueda mantener.",
    tria: "Elige un objetivo",
    propi: "O escribe uno propio",
    propiPh: "Ej.: saludar al árbitro al llegar",
    guardar: "Hacerlo mi compromiso",
    actual: "Tu compromiso de esta semana",
    desDe: "Desde el",
    reflexioT: "Ha pasado una semana. ¿Cómo ha ido?",
    reflexioO: [{ id: "mantingut", t: "He podido mantenerlo" }, { id: "aVegades", t: "A veces" }, { id: "costat", t: "Me ha costado" }],
    reflexioQ: "¿Qué te ha ayudado o qué te lo ha puesto difícil?",
    renovar: "Mantenerlo una semana más",
    nou: "Elegir uno nuevo",
    reflexioAra: "Hacer la reflexión ahora",
    gracies: "Gracias. Los hábitos se construyen poco a poco.",
    historial: "Compromisos anteriores"
  },
  objectiusSetmanals: {
    familia: [
      "No dar instrucciones desde la grada",
      "No discutir las decisiones arbitrales",
      "Validar un error sin criticarlo",
      "Escuchar después del partido",
      "Hacer una pausa AIS cuando detecte enfado",
      "Respetar el silencio de mi hijo",
      "Felicitar su actitud, sea cual sea el resultado"
    ],
    entrenador: [
      "Corregir una sola cosa cada vez",
      "Reconocer el esfuerzo de cada jugador al menos una vez",
      "No discutir decisiones arbitrales delante del equipo",
      "Hacer una pausa AIS cuando detecte enfado",
      "Atender a las familias solo con cita",
      "Terminar cada sesión con un reconocimiento al grupo"
    ]
  },

  /* ---------- REGISTRO ---------- */
  registre: {
    titol: "Mi aprendizaje",
    intro: "Un historial privado para ver cómo evolucionas semana a semana. No es una nota ni sirve para diagnosticar nada.",
    buit: "Todavía no hay registros. Empezarán a aparecer cuando hagas «Antes», una pausa o el repaso de «Después».",
    partits: "Partidos o sesiones registrados",
    pauses: "Pausas hechas",
    respecte: "Conductas de respeto reconocidas",
    aprenentatges: "Aprendizajes escritos",
    setmanes: "Pausas por semana",
    compromisosFreq: "Compromisos que has elegido",
    situacionsFreq: "Situaciones que te piden más entrenamiento",
    conductesFreq: "Conductas que más reconoces",
    seqT: "Situación → Activación → Pausa → Conducta",
    seqD: "Tus últimas pausas.",
    aprenT: "Lo que has aprendido",
    historial: "Historial",
    nouManual: "Añadir un registro",
    manualT: "Nuevo registro",
    camps: {
      data: "Fecha", rol: "Papel", moment: "Momento", situacio: "Situación que me ha activado", activacio: "Activación (0-10)",
      zona: "Zona del cuerpo", ais: "He practicado AIS", conducta: "Conducta que he elegido", impulsiva: "Ha habido una reacción impulsiva",
      reparacio: "He hecho una reparación", aprenentatge: "Aprendizaje para el próximo partido"
    },
    moments: { abans: "Antes", durant: "Durante", despres: "Después" },
    si: "Sí", no: "No", noCal: "No hacía falta",
    esborrar: "Borrar", confirmaEsborrar: "¿Quieres borrar este registro?",
    tipus: { abans: "Preparación", pausa: "Pausa", despres: "Repaso", manual: "Registro", setmanal: "Compromiso semanal" },
    senseDada: "–"
  },

  /* ---------- LA PIÑA DE LAS FAMILIAS ---------- */
  /* Textos del ritual adaptados al castellano a partir de la versión que
     APRENS redactó en catalán de Mallorca para este módulo. */
  pinya: {
    titol: "La piña de las familias",
    subtitol: "Los jugadores hacen equipo dentro del campo. Nosotros también lo hacemos desde fuera.",
    invitacio: "Ya has preparado tu papel. Ahora, ¿quieres sumar tu mano a la piña de las familias?",
    si: "🤝 Sí, pongo mi mano",
    no: "Hoy prefiero seguir sin compartir",
    noOk: "De acuerdo. Tu compromiso queda guardado para recordártelo durante el partido.",
    fraseGrup: { familia: "Hoy no vengo solo a ver jugar a mi hijo. Vengo a formar parte de un equipo que acompaña a todos los jugadores.",
                 entrenador: "Hoy no vengo solo a dirigir un partido. Vengo a formar parte de un equipo que acompaña a todos los jugadores." },
    pos: "Pongo mi mano",
    tornar: "Volver a ver la animación",
    crit: "1, 2, 3… ¡EQUIPO!",
    unida: "Tu mano ya forma parte de tu compromiso con el equipo.",
    teuCompromis: "Tu compromiso de hoy",
    senseCompromis: "Todavía no has elegido ningún compromiso. Vuelve a «Antes» para elegir uno o dos.",
    decoratiu: "Las manos del dibujo son simbólicas: no son un recuento de participantes.",
    noCompteReal: "La participación real, si el grupo la hace, se ve en la encuesta de WhatsApp. Esta herramienta no cuenta ni sabe quién participa.",
    queS: "Solo se comparte este mensaje de compromiso. Cómo llegas, tu enfado, las sensaciones, los pensamientos, tu historial y nada de tu hijo o hija salen de este dispositivo.",
    editar: "Puedes editar el mensaje antes de enviarlo. Revisa que no haya ningún nombre ni dato personal.",
    plantilla: "🤝 1, 2, 3… ¡EQUIPO!\nHoy pongo mi mano en la piña de las familias.\nMe he preparado para acompañar a nuestros jugadores y jugadoras con respeto, serenidad y confianza.\n⚽ Mi compromiso de hoy:\n{compromis}\nGanemos o perdamos, somos el mismo equipo.\nLos padres también juegan · APRENS",
    plantillaEntrenador: "🤝 1, 2, 3… ¡EQUIPO!\nHoy pongo mi mano en la piña de las familias, como entrenador del equipo.\nMe he preparado para acompañar a nuestros jugadores y jugadoras con respeto, serenidad y confianza.\n⚽ Mi compromiso de hoy:\n{compromis}\nGanemos o perdamos, somos el mismo equipo.\nLos padres también juegan · APRENS",
    compartir: "Compartir mi mano por WhatsApp",
    compartirD: "Se abrirá WhatsApp (o el menú de compartir del móvil) y tú eliges el destinatario: el grupo del equipo, el entrenador, el delegado o quien quieras. El envío lo confirmas tú en WhatsApp.",
    copiar: "Copiar compromiso",
    copiat: "Mensaje copiado.",
    obert: "Se ha abierto WhatsApp. Si lo has enviado, tu mano ya está en el grupo.",
    recomanacio: "Para no saturar el grupo, mejor una sola encuesta por partido. El mensaje individual es opcional, y sobre todo útil para enviárselo al entrenador.",
    anarDurant: "Ir a «Durante el partido»",
    /* Vía A: encuesta */
    enquestaT: "Preparar la encuesta del equipo",
    enquestaD: "Para el entrenador, el coordinador o el delegado. Una web no puede crear encuestas en WhatsApp: aquí tienes el texto listo y los pasos para hacerla tú en un minuto.",
    enquestaPregunta: "⚽🤝 Hoy, ¿qué mano pones en la piña de las familias?",
    enquestaOpcions: ["Animaré con respeto desde la grada", "Evitaré dar instrucciones o hacer críticas", "Acompañaré sin presionar, pase lo que pase", "Apoyaré al equipo desde casa"],
    copiaPregunta: "Copiar la pregunta",
    copiaOpcio: "Copiar",
    copiaTot: "Copiarlo todo",
    obrirWa: "Abrir WhatsApp",
    passos: [
      "Abre el grupo de WhatsApp del equipo.",
      "Toca Adjuntar (el clip o el +) y elige «Encuesta».",
      "Pega la pregunta y, una a una, las cuatro opciones.",
      "Desactiva «Permitir varias respuestas», para que cada uno ponga una sola mano.",
      "Si tu versión de WhatsApp lo permite y es adecuado para el grupo, activa la opción de ocultar los nombres de quien vota.",
      "Envíala. El resultado lo veréis en WhatsApp: esta herramienta no lo recibe ni lo sincroniza."
    ],
    enquestaNota: "Votar es voluntario. La encuesta sirve para hacer visible una intención compartida, no para saber quién no participa ni para valorar a ninguna familia.",
    /* Invitación del entrenador */
    invitacioT: "Invitación para las familias",
    invitacioD: "Un mensaje para enviar al grupo antes del partido. Incluye el enlace a la herramienta.",
    invitacioText: "¡Buenos días, familias!\nHoy tenemos partido y os invitamos a participar en nuestra piña de las familias.\nIgual que los jugadores hacen equipo dentro del campo, nosotros también queremos hacerlo desde fuera.\nAntes de empezar, dedicad un momento a preparar cómo queréis animar y acompañar a nuestros chicos y chicas:\n{enllac}\nDespués, si os apetece, poned vuestra mano en la piña respondiendo a la encuesta.\n1, 2, 3… ¡EQUIPO! 🤝⚽",
    copiaInvitacio: "Copiar la invitación",
    enviaInvitacio: "Enviar la invitación por WhatsApp",
    /* Durante */
    recorda: "Recuerda la mano que has puesto en la piña",
    recordaSense: "Recuerda el compromiso que has elegido antes del partido",
    passosActivacio: ["Reconoce la activación.", "Vuelve unos segundos al cuerpo o al apoyo de los pies.", "Recuerda tu compromiso.", "Elige una conducta coherente con él."],
    conductesT: "¿Qué conducta eliges ahora?",
    conductes: [
      { id: "silenci", t: "Guardar silencio unos segundos" },
      { id: "respirar", t: "Respirar y dejar pasar la jugada" },
      { id: "respecte", t: "Mantener el respeto" },
      { id: "animar", t: "Animar de forma constructiva" }
    ],
    /* Después */
    fidelT: "¿He sido fiel a mi mano?",
    fidelD: "No es una nota. Es para aprender del partido de hoy.",
    fq1: "¿He recordado mi compromiso?",
    fq2: "¿He conseguido acompañarme cuando me he activado?",
    fq3: "¿Qué he hecho que haya ayudado al equipo?",
    fq5: "¿Qué quiero seguir entrenando?",
    fo: [{ id: "si", t: "Sí" }, { id: "part", t: "En parte" }, { id: "no", t: "Todavía no" }],
    compassiu: "Hoy has detectado una situación que puedes seguir entrenando. Reconoce qué ha pasado, repara si has hecho daño y prepara una respuesta distinta para el próximo partido.",
    bo: "Has podido sostener tu compromiso. Fíjate en qué te ha ayudado: podrás volver a usarlo.",
    /* Límites educativos */
    limitsT: "Qué es, y qué no es, la piña",
    limits: [
      "Poner la mano es expresar una intención educativa, no garantizar una conducta perfecta.",
      "Participar es voluntario. No sirve para presionar a nadie, valorar a las familias, comparar implicación ni excluir a quien no está.",
      "No sustituye las normas de convivencia ni el protocolo de protección de menores: el club sigue siendo responsable.",
      "Nadie tiene que compartir información emocional privada para formar parte del equipo."
    ],
    final: "Los jugadores hacen equipo dentro del campo. Las familias también hacemos equipo fuera. Y nuestra manera de animar, respetar y acompañar forma parte de su educación."
  },

  /* ---------- PRIVACIDAD ---------- */
  privacitat: {
    titol: "Privacidad y datos",
    punts: [
      "Esta herramienta funciona sin cuentas ni servidor. No te pide nombre, correo ni ningún dato identificativo.",
      "Los registros se guardan solo en este dispositivo (almacenamiento local del navegador). No se envían a APRENS, al club ni a terceros.",
      "No hay analíticas publicitarias ni seguimiento entre sitios web.",
      "Si borras los datos del navegador, usas la navegación privada o cambias de dispositivo, los registros se pueden perder.",
      "No escribas nombres de menores ni datos que puedan identificarlos en los campos de texto."
    ],
    consultar: "Consultar los registros",
    exportJson: "Exportar en JSON",
    exportCsv: "Exportar en CSV (hoja de cálculo)",
    esborrar: "Borrar todos los datos de este dispositivo",
    confirma: "Se borrarán todos los registros, compromisos y preferencias de este dispositivo. No se puede deshacer. ¿Continuar?",
    esborrat: "Datos borrados.",
    rgpd: "Nota para clubes: antes de una implantación real conviene revisar el cumplimiento del RGPD y de la normativa de protección de menores aplicable. Esta versión no permite al club ver ningún registro personal.",
    noBackend: "Nada de lo que anotas sale de este dispositivo si tú no lo exportas."
  },

  /* ---------- CLUB ---------- */
  club: {
    titol: "Somos un equipo también fuera del campo",
    intro: "Familias, entrenadores y club compartimos la responsabilidad de que el deporte eduque. Estos son nuestros compromisos compartidos.",
    missatge: "Mensaje de la coordinación",
    codi: "Código de conducta del club",
    proteccio: "Protección de menores",
    recursos: "Recursos de APRENS",
    recursosText: "Si queréis hablarlo: APRENS Psicologia · C/ Mare de Déu de l'Esperança, 70, 2.º · Inca · 636 93 76 61 · info@aprens.es · aprens.net",
    comp: {
      families: { t: "Las familias", l: ["Animamos sin dar instrucciones.", "Respetamos a árbitros, rivales, entrenadores y otras familias.", "Queremos igual cuando ganan y cuando pierden.", "Expresamos las discrepancias con cita y con calma."] },
      entrenadors: { t: "Los entrenadores", l: ["Pensamos en el progreso de todos a lo largo de la temporada.", "Corregimos sin humillar.", "Valoramos el esfuerzo, las decisiones y la cooperación.", "Somos ejemplo de respeto en el banquillo."] },
      club: { t: "El club", l: ["Ponemos la formación y el bienestar por delante del resultado.", "Cuidamos un entorno seguro y aplicamos el protocolo de protección.", "Facilitamos canales claros de comunicación.", "Ofrecemos formación a familias y entrenadores."] }
    },
    qrT: "Compartir con un QR",
    qrD: "Para carteles, circulares y reuniones. Al escanearlo se abre la herramienta con la configuración del club.",
    descarregaQr: "Descargar el QR",
    copiaEnllac: "Copiar el enlace",
    copiat: "Enlace copiado.",
    compartir: "Compartir por WhatsApp",
    compartirText: "Los padres también juegan: una herramienta de APRENS para acompañar mejor a nuestros jugadores y jugadoras, antes, durante y después de los partidos.",
    configT: "Configurar para un club",
    configD: "Para coordinadores y APRENS. Genera el enlace y el QR con el nombre, el color y el idioma del club. El código de conducta, el mensaje y el protocolo se pueden cargar desde un archivo de configuración del club (ver la guía de publicación).",
    nom: "Nombre del club", color: "Color institucional", idiomaPrincipal: "Idioma principal",
    missatgeCurt: "Mensaje breve de la coordinación (opcional)",
    generar: "Generar el enlace y el QR",
    senseClub: "Todavía no hay ningún club configurado en este enlace.",
    escut: "Escudo del club"
  },

  csv: { cap: ["data", "tipus", "rol", "moment", "situacio", "activacio", "zones", "ais", "conducta", "impulsiva", "reparacio", "aprenentatge"] }
};
