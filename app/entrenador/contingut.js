/* APRENS · El quadern de l'entrenador — contingut (català de Mallorca i castellà)
   Cada text és { ca, es }. Els ítems tenen una clau estable (id): les dades desades
   només guarden la clau, mai el text, i per això es poden canviar els textos o
   ajustar-los a la recerca sense perdre l'històric. */
window.QE = {

  /* ---------- ETAPES EVOLUTIVES ---------- */
  etapes: [
    { id: "inici", t: { ca: "Iniciació (fins a 8 anys)", es: "Iniciación (hasta 8 años)" },
      prio: { ca: "En aquesta etapa el centre és el joc i el gaudi. Una sola consigna senzilla per exercici, molt de temps amb la pilota i reconèixer l'intent més que l'encert. El fair-play s'aprèn jugant: torns, compartir, ajudar el company que cau.",
              es: "En esta etapa el centro es el juego y el disfrute. Una sola consigna sencilla por ejercicio, mucho tiempo con el balón y reconocer el intento más que el acierto. El fair-play se aprende jugando: turnos, compartir, ayudar al compañero que cae." } },
    { id: "formacio", t: { ca: "Formació (8 a 12 anys)", es: "Formación (8 a 12 años)" },
      prio: { ca: "És l'edat d'or de l'aprenentatge tècnic. Convé incidir en què i quan s'han de fixar a cada exercici, fer preguntes abans de donar la solució i que cada jugador sàpiga en què està millorant, comparant-se amb ell mateix i no amb els companys.",
              es: "Es la edad de oro del aprendizaje técnico. Conviene incidir en qué y cuándo deben fijarse en cada ejercicio, hacer preguntas antes de dar la solución y que cada jugador sepa en qué está mejorando, comparándose consigo mismo y no con los compañeros." } },
    { id: "desenv", t: { ca: "Desenvolupament (12 a 16 anys)", es: "Desarrollo (12 a 16 años)" },
      prio: { ca: "Els canvis físics i la comparació social fan créixer el risc d'orientar-se a l'ego. Convé prestar especial atenció a com regulen l'errada, a la percepció de control i a mantenir objectius de procés, també quan apareixen la titularitat i la competència interna.",
              es: "Los cambios físicos y la comparación social hacen crecer el riesgo de orientarse al ego. Conviene prestar especial atención a cómo regulan el error, a la percepción de control y a mantener objetivos de proceso, también cuando aparecen la titularidad y la competencia interna." } },
    { id: "rend", t: { ca: "Rendiment (16 anys i més)", es: "Rendimiento (16 años y más)" },
      prio: { ca: "La pressió del resultat és més present. L'objectiu és que l'exigència sigui amb la tasca i no amb la persona, donar autonomia en la presa de decisions i cuidar l'adherència: que continuïn venint perquè aprendre i millorar els dona sentit.",
              es: "La presión del resultado está más presente. El objetivo es que la exigencia sea con la tarea y no con la persona, dar autonomía en la toma de decisiones y cuidar la adherencia: que sigan viniendo porque aprender y mejorar les da sentido." } }
  ],

  /* ---------- ÀREES DE TREBALL ---------- */
  arees: [
    { id: "tt", t: { ca: "Tècnic-tàctic", es: "Técnico-táctico" }, color: "#2F5E9E",
      sug: [
        { ca: "Sortir jugant des de darrere", es: "Salir jugando desde atrás" },
        { ca: "Orientar el cos abans de rebre", es: "Orientar el cuerpo antes de recibir" },
        { ca: "Oferir-se en línia de passada", es: "Ofrecerse en línea de pase" },
        { ca: "Repliegar junts després de perdre la pilota", es: "Replegar juntos tras perder el balón" }
      ] },
    { id: "fi", t: { ca: "Físic", es: "Físico" }, color: "#3B7224",
      sug: [
        { ca: "Coordinació i canvis de direcció", es: "Coordinación y cambios de dirección" },
        { ca: "Mantenir la intensitat tot l'exercici", es: "Mantener la intensidad todo el ejercicio" },
        { ca: "Escalfament i hàbits de cura del cos", es: "Calentamiento y hábitos de cuidado del cuerpo" },
        { ca: "Recuperar-se entre esforços", es: "Recuperarse entre esfuerzos" }
      ] },
    { id: "at", t: { ca: "Atenció a la tasca", es: "Atención a la tarea" }, color: "#7A4FA0",
      sug: [
        { ca: "Saber en què i quan fixar-se a cada exercici", es: "Saber en qué y cuándo fijarse en cada ejercicio" },
        { ca: "Tornar a la jugada amb la paraula clau després d'una errada", es: "Volver a la jugada con la palabra clave tras un error" },
        { ca: "Mirar abans de rebre (escanejar)", es: "Mirar antes de recibir (escanear)" },
        { ca: "Una pràctica breu d'atenció a l'inici de la sessió", es: "Una práctica breve de atención al inicio de la sesión" }
      ] },
    { id: "em", t: { ca: "Regulació emocional", es: "Regulación emocional" }, color: "#9C4A2E",
      sug: [
        { ca: "Permís per equivocar-se: valorar l'intent", es: "Permiso para equivocarse: valorar el intento" },
        { ca: "Tornar a la calma després d'una decisió arbitral", es: "Volver a la calma tras una decisión arbitral" },
        { ca: "Posar nom al que senten després del partit", es: "Poner nombre a lo que sienten después del partido" },
        { ca: "Un gest de tornada (pujar-se les calces, respirar)", es: "Un gesto de vuelta (subirse las medias, respirar)" }
      ] },
    { id: "fp", t: { ca: "Fair-play i valors", es: "Fair-play y valores" }, color: "#B07A12",
      sug: [
        { ca: "Saludar i agrair a rivals i àrbitre", es: "Saludar y agradecer a rivales y árbitro" },
        { ca: "Reconèixer en veu alta la millora d'un company", es: "Reconocer en voz alta la mejora de un compañero" },
        { ca: "Zero retrets entre companys", es: "Cero reproches entre compañeros" },
        { ca: "Ajudar a recollir i cuidar el material", es: "Ayudar a recoger y cuidar el material" }
      ] }
  ],

  /* ---------- ESCALES ---------- */
  escalaObj: [
    { ca: "Gens", es: "Nada" }, { ca: "Poc", es: "Poco" }, { ca: "Bastant", es: "Bastante" }, { ca: "Molt", es: "Mucho" }
  ],
  escalaFreq: [
    { ca: "Mai", es: "Nunca" }, { ca: "A vegades", es: "A veces" }, { ca: "Sovint", es: "A menudo" }, { ca: "Quasi sempre", es: "Casi siempre" }
  ],
  /* Clau de puntuació d'APRENS ESPORT: davant cada ítem, l'entrenador es demana quins jugadors
     s'han apartat aquesta setmana de la normalitat de l'equip. La majoria queden a 2; només
     alguns tenen 0, 1 o 3. Internament es desa -2, -1, 0, +1 (0 = normalitat, no es desa). */
  escalaJug: [
    { v: -2, k: "0", c: { ca: "Ha passat alguna cosa significativa negativa aquesta setmana", es: "Ha pasado algo significativo negativo esta semana" } },
    { v: -1, k: "1", c: { ca: "Per davall de la mitjana de l'equip", es: "Por debajo de la media del equipo" } },
    { v: 0, k: "2", c: { ca: "Normalitat", es: "Normalidad" } },
    { v: 1, k: "3", c: { ca: "Destaca en positiu", es: "Destaca en positivo" } }
  ],

  /* ---------- CLIMA D'EQUIP (lligat a la piràmide) ---------- */
  clima: [
    { id: "tornen", sig: 1, niv: "atencio", t: { ca: "Després d'una errada, tornen aviat a la tasca.", es: "Después de un error, vuelven pronto a la tarea." } },
    { id: "consignes", sig: 1, niv: "atencio", t: { ca: "Saben en què s'han de fixar a cada exercici.", es: "Saben en qué deben fijarse en cada ejercicio." } },
    { id: "atreveix", sig: 1, niv: "control", t: { ca: "S'atreveixen a provar coses noves encara que puguin fallar.", es: "Se atreven a probar cosas nuevas aunque puedan fallar." } },
    { id: "apren", sig: 1, niv: "motivacio", t: { ca: "Parlen més del que han après que del resultat.", es: "Hablan más de lo que han aprendido que del resultado." } },
    { id: "compar", sig: -1, niv: "ego", t: { ca: "Hi ha comparacions, retrets o burles entre companys.", es: "Hay comparaciones, reproches o burlas entre compañeros." } },
    { id: "respecte", sig: 1, niv: "fairplay", t: { ca: "Respecten àrbitres, rivals i companys.", es: "Respetan a árbitros, rivales y compañeros." } },
    { id: "ganes", sig: 1, niv: "adherencia", t: { ca: "Arriben amb ganes i gaudeixen de l'entrenament.", es: "Llegan con ganas y disfrutan del entrenamiento." } }
  ],

  /* ---------- LA MEVA MANERA D'ENTRENAR (fitxa d'observació del CE Constància) ---------- */
  entrenador: [
    { fase: "pre", t: { ca: "Abans de l'exercici", es: "Antes del ejercicio" }, items: [
      { id: "context", sig: 1, t: { ca: "He contextualitzat l'exercici: per què el feim i a quina situació de joc respon.", es: "He contextualizado el ejercicio: por qué lo hacemos y a qué situación de juego responde." } },
      { id: "objectiu", sig: 1, t: { ca: "He explicat l'objectiu de l'exercici.", es: "He explicado el objetivo del ejercicio." } },
      { id: "claredat", sig: 1, t: { ca: "He dit en què i quan s'han de fixar (els estímuls rellevants).", es: "He dicho en qué y cuándo deben fijarse (los estímulos relevantes)." } },
      { id: "preguntesPre", sig: 1, t: { ca: "He fet preguntes abans de començar.", es: "He hecho preguntas antes de empezar." } },
      { id: "jocLliure", sig: 1, t: { ca: "He deixat estones de joc lliure.", es: "He dejado ratos de juego libre." } }
    ] },
    { fase: "durant", t: { ca: "Durant l'exercici", es: "Durante el ejercicio" }, items: [
      { id: "dirigir", sig: 0, t: { ca: "He dirigit l'exercici donant jo la solució.", es: "He dirigido el ejercicio dando yo la solución." } },
      { id: "castigs", sig: -1, grup: { ca: "Davant l'errada", es: "Ante el error" }, t: { ca: "Davant l'errada he castigat o he renyat.", es: "Ante el error he castigado o he reñido." } },
      { id: "instruccions", sig: 0, t: { ca: "Davant l'errada he donat instruccions.", es: "Ante el error he dado instrucciones." } },
      { id: "preguntesErr", sig: 1, t: { ca: "Davant l'errada he fet preguntes.", es: "Ante el error he hecho preguntas." } },
      { id: "anims", sig: 1, t: { ca: "Davant l'errada he donat ànims.", es: "Ante el error he dado ánimos." } },
      { id: "preguntesEnc", sig: 1, grup: { ca: "Davant l'encert", es: "Ante el acierto" }, t: { ca: "Davant l'encert he fet preguntes (què has vist?, per què ha sortit?).", es: "Ante el acierto he hecho preguntas (¿qué has visto?, ¿por qué ha salido?)." } },
      { id: "reforc", sig: 1, t: { ca: "Davant l'encert he reforçat el procés, no només el resultat.", es: "Ante el acierto he reforzado el proceso, no solo el resultado." } }
    ] },
    { fase: "post", t: { ca: "Després de l'exercici", es: "Después del ejercicio" }, items: [
      { id: "tancament", sig: 1, t: { ca: "He fet un tancament: què hem après i què ens emportam.", es: "He hecho un cierre: qué hemos aprendido y qué nos llevamos." } }
    ] }
  ],
  tempsJoc: {
    t: { ca: "Temps de joc dels jugadors durant els exercicis", es: "Tiempo de juego de los jugadores durante los ejercicios" },
    op: [ { ca: "Menys de la meitat", es: "Menos de la mitad" }, { ca: "La meitat o poc més", es: "La mitad o poco más" }, { ca: "Bona part", es: "Buena parte" }, { ca: "Quasi tot el temps", es: "Casi todo el tiempo" } ]
  },

  /* ---------- JUGADOR: DIMENSIONS SETMANALS ---------- */
  dims: [
    { id: "tt", t: { ca: "Tècnic-tàctic", es: "Técnico-táctico" }, d: { ca: "Aplica el que treballam.", es: "Aplica lo que trabajamos." } },
    { id: "fi", t: { ca: "Físic", es: "Físico" }, d: { ca: "Energia, condició, coordinació.", es: "Energía, condición, coordinación." } },
    { id: "at", t: { ca: "Atenció a la tasca", es: "Atención a la tarea" }, d: { ca: "Es fixa en el que és rellevant i torna a la jugada.", es: "Se fija en lo relevante y vuelve a la jugada." }, clau: true },
    { id: "er", t: { ca: "Davant l'errada", es: "Ante el error" }, d: { ca: "Regula l'errada i continua, sense bloquejar-se.", es: "Regula el error y sigue, sin bloquearse." }, clau: true },
    { id: "mo", t: { ca: "Ganes i gaudi", es: "Ganas y disfrute" }, d: { ca: "Implicació, iniciativa, gaudeix.", es: "Implicación, iniciativa, disfruta." }, clau: true },
    { id: "fp", t: { ca: "Fair-play i equip", es: "Fair-play y equipo" }, d: { ca: "Respecte, companyonia, ajuda.", es: "Respeto, compañerismo, ayuda." } }
  ],
  orient: {
    q: { ca: "On he vist la seva atenció aquesta setmana?", es: "¿Dónde he visto su atención esta semana?" },
    op: [
      { id: "t", t: { ca: "En la tasca", es: "En la tarea" }, d: { ca: "aprendre, millorar, la jugada", es: "aprender, mejorar, la jugada" } },
      { id: "e", t: { ca: "En el resultat", es: "En el resultado" }, d: { ca: "guanyar, destacar, compararse", es: "ganar, destacar, compararse" } },
      { id: "", t: { ca: "No ho sé", es: "No lo sé" }, d: { ca: "", es: "" } }
    ]
  },
  senyals: [
    { id: "deixar", alt: true, t: { ca: "Parla de deixar-ho o li costa venir", es: "Habla de dejarlo o le cuesta venir" } },
    { id: "trist", alt: true, t: { ca: "El veig trist o apagat", es: "Lo veo triste o apagado" } },
    { id: "aillat", alt: true, t: { ca: "S'aïlla del grup", es: "Se aísla del grupo" } },
    { id: "canvi", alt: true, t: { ca: "Canvi brusc de conducta", es: "Cambio brusco de conducta" } },
    { id: "entorn", alt: true, t: { ca: "Pressió de l'entorn (família, grada)", es: "Presión del entorno (familia, grada)" } },
    { id: "por", ocult: true, t: { ca: "Por de fallar, evita participar", es: "Miedo a fallar, evita participar" } },
    { id: "enuig", ocult: true, t: { ca: "Reaccions d'enuig intenses", es: "Reacciones de enfado intensas" } },
    { id: "conflicte", ocult: true, t: { ca: "Conflicte amb companys", es: "Conflicto con compañeros" } },
    { id: "dolor", t: { ca: "Dolor, molèsties o lesió", es: "Dolor, molestias o lesión" } },
    { id: "cansament", t: { ca: "Cansament o son poc habituals", es: "Cansancio o sueño poco habituales" } }
  ],

  /* ---------- CONDUCTES CONCRETES (de la fitxa APRENS ESPORT, 2015-2017, reduïda) ----------
     La fitxa original tenia 29 ítems; aquí n'hi ha 19, sense repeticions, agrupats per l'ítem
     ràpid al qual pertanyen (camp «dim»). A l'entrevista, quan un jugador té 0, 1 o 3 en un
     ítem, s'obren com a botons les conductes d'aquell ítem: «neg» amb 0 o 1, «pos» amb 3.
     Tipus: esc (té sentit negatiu i positiu), si (només un sentit, segons «sig»), num (recompte,
     a la pantalla de senyals i notes). Les claus antigues es converteixen a aquestes (vegeu
     MIGRA a app.js), de manera que les dades ja desades continuen valent. */
  pss: [
    { id: "tt", t: { ca: "Tècnic-tàctic", es: "Técnico-táctico" }, items: [
      { id: "eficacia", tipus: "esc", sig: 1, dim: "tt", neg: { ca: "Poca eficàcia", es: "Poca eficacia" }, pos: { ca: "Eficàcia, rendiment", es: "Eficacia, rendimiento" }, t: { ca: "Rendiment (eficàcia)", es: "Rendimiento (eficacia)" } }
    ] },
    { id: "fi", t: { ca: "Físic", es: "Físico" }, items: [
      { id: "activacio", tipus: "si", sig: -1, dim: "fi", t: { ca: "Baixa activació (apagat, badalls)", es: "Baja activación (apagado, bostezos)" } }
    ] },
    { id: "at", t: { ca: "Atenció a la tasca", es: "Atención a la tarea" }, items: [
      { id: "indicacions", tipus: "esc", sig: 1, dim: "at", neg: { ca: "No segueix les indicacions, s'ha de corregir sovint", es: "No sigue las indicaciones, hay que corregirle a menudo" }, pos: { ca: "Segueix les indicacions", es: "Sigue las indicaciones" }, t: { ca: "Segueix les indicacions", es: "Sigue las indicaciones" } },
      { id: "distreu", tipus: "si", sig: -1, dim: "at", t: { ca: "Es distreu amb facilitat", es: "Se distrae con facilidad" } },
      { id: "public", tipus: "si", sig: -1, dim: "at", t: { ca: "Baixa el rendiment pels crits del públic", es: "Baja el rendimiento por los gritos del público" } },
      { id: "avisa", tipus: "si", sig: 1, dim: "at", t: { ca: "Corregeix o avisa un company durant el joc", es: "Corrige o avisa a un compañero durante el juego" } }
    ] },
    { id: "er", t: { ca: "Davant l'errada", es: "Ante el error" }, items: [
      { id: "discuteix", tipus: "si", sig: -1, dim: "er", t: { ca: "Interromp o discuteix les ordres", es: "Interrumpe o discute las órdenes" } },
      { id: "fracas", tipus: "si", sig: -1, dim: "er", t: { ca: "Quan el corregeixo, ho viu com un fracàs o abaixa la mirada", es: "Cuando le corrijo, lo vive como un fracaso o baja la mirada" } },
      { id: "culpa", tipus: "si", sig: -1, dim: "er", t: { ca: "Quan el corregeixo, dona la culpa als altres", es: "Cuando le corrijo, echa la culpa a los demás" } }
    ] },
    { id: "mo", t: { ca: "Ganes i gaudi", es: "Ganas y disfrute" }, items: [
      { id: "interes", tipus: "esc", sig: 1, dim: "mo", neg: { ca: "Poc interès", es: "Poco interés" }, pos: { ca: "Molt d'interès, no vol que s'acabi", es: "Mucho interés, no quiere que se acabe" }, t: { ca: "Grau d'interès", es: "Grado de interés" } },
      { id: "puntualitat", tipus: "esc", sig: 1, dim: "mo", neg: { ca: "Arriba tard", es: "Llega tarde" }, t: { ca: "Puntualitat", es: "Puntualidad" } },
      { id: "higiene", tipus: "esc", sig: 1, dim: "mo", neg: { ca: "Descuida la higiene i la imatge", es: "Descuida la higiene y la imagen" }, t: { ca: "Cura de la higiene i la imatge", es: "Cuidado de la higiene y la imagen" } }
    ] },
    { id: "fp", t: { ca: "Fair-play i equip", es: "Fair-play y equipo" }, items: [
      { id: "relComp", tipus: "esc", sig: 1, dim: "fp", neg: { ca: "Recrimina o té conflictes amb els companys", es: "Recrimina o tiene conflictos con los compañeros" }, pos: { ca: "Anima i ajuda els companys", es: "Anima y ayuda a los compañeros" }, t: { ca: "Relació amb els companys", es: "Relación con los compañeros" } },
      { id: "sacrifici", tipus: "esc", sig: 1, dim: "fp", neg: { ca: "Poc sacrifici per l'equip", es: "Poco sacrificio por el equipo" }, pos: { ca: "Sacrifici per l'equip", es: "Sacrificio por el equipo" }, t: { ca: "Sacrifici per l'equip", es: "Sacrificio por el equipo" } },
      { id: "influeix", tipus: "esc", sig: 1, dim: "fp", neg: { ca: "Influeix negativament en l'equip", es: "Influye negativamente en el equipo" }, pos: { ca: "Influeix positivament en l'equip", es: "Influye positivamente en el equipo" }, t: { ca: "Com influeix dins l'equip", es: "Cómo influye dentro del equipo" } },
      { id: "rivals", tipus: "esc", sig: 1, dim: "fp", neg: { ca: "Mala relació amb rivals o àrbitre", es: "Mala relación con rivales o árbitro" }, pos: { ca: "Respecte a rivals i àrbitre", es: "Respeto a rivales y árbitro" }, t: { ca: "Relació amb adversaris i àrbitre", es: "Relación con adversarios y árbitro" } },
      { id: "material", tipus: "esc", sig: 1, dim: "fp", neg: { ca: "No cuida el material", es: "No cuida el material" }, pos: { ca: "Cuida el material", es: "Cuida el material" }, t: { ca: "Cura del material esportiu", es: "Cuidado del material deportivo" } }
    ] },
    { id: "inc", t: { ca: "Incidències", es: "Incidencias" }, items: [
      { id: "faltes", tipus: "num", sig: -1, dim: "fp", t: { ca: "Faltes de respecte (insults, agressions)", es: "Faltas de respeto (insultos, agresiones)" } },
      { id: "fora", tipus: "num", sig: -1, dim: "fp", t: { ca: "Temps fora (per conducta o per distracció)", es: "Tiempo fuera (por conducta o por distracción)" } }
    ] }
  ],
  escalaPss: null, /* la mateixa clau que escalaJug (vegeu app.js) */

  /* ---------- LA PIRÀMIDE (material APRENS) ---------- */
  piramide: {
    intro: { ca: "Els resultats poden generar molta motivació. Però si no orientam l'esportista cap a la tasca, l'adherència, l'aprenentatge continu i la capacitat de regular la pròpia motivació es poden esvair, i amb elles l'esforç i la il·lusió per l'esport. Orientar-se a la mestria és com una vacuna.",
             es: "Los resultados pueden generar mucha motivación. Pero si no orientamos al deportista hacia la tarea, la adherencia, el aprendizaje continuo y la capacidad de regular la propia motivación pueden desvanecerse, y con ellas el esfuerzo y la ilusión por el deporte. Orientarse a la maestría es como una vacuna." },
    llegir: { ca: "Es llegeix de baix cap amunt: on posam l'atenció durant la competició acaba marcant el control que percebem, com regulam l'errada, la motivació, l'adherència i, al final, el rendiment.",
              es: "Se lee de abajo arriba: dónde ponemos la atención durante la competición acaba marcando el control que percibimos, cómo regulamos el error, la motivación, la adherencia y, al final, el rendimiento." },
    nivells: [
      { t: { ca: "Rendiment", es: "Rendimiento" }, m: "", e: "", on: "" },
      { t: { ca: "Percepció d'autoeficàcia", es: "Percepción de autoeficacia" }, m: { ca: "aprendre és el meu èxit", es: "aprender es mi éxito" }, e: { ca: "guanyar, guanyar i guanyar", es: "ganar, ganar y ganar" }, on: { ca: "Tendències del jugador", es: "Tendencias del jugador" } },
      { t: { ca: "Adherència a l'esport", es: "Adherencia al deporte" }, m: { ca: "em compar amb mi mateix", es: "me comparo conmigo mismo" }, e: { ca: "em compar amb els altres", es: "me comparo con los demás" }, on: { ca: "Assistència · Ganes i gaudi", es: "Asistencia · Ganas y disfrute" } },
      { t: { ca: "Motivació", es: "Motivación" }, m: { ca: "aprenentatge (intrínseca)", es: "aprendizaje (intrínseca)" }, e: { ca: "resultats (extrínseca)", es: "resultados (extrínseca)" }, on: { ca: "Ganes i gaudi · Clima: parlen del que han après", es: "Ganas y disfrute · Clima: hablan de lo aprendido" } },
      { t: { ca: "Regulació emocional", es: "Regulación emocional" }, m: { ca: "percepció de millora", es: "percepción de mejora" }, e: { ca: "obtenir bons resultats", es: "obtener buenos resultados" }, on: { ca: "Davant l'errada · Clima: tornen a la tasca", es: "Ante el error · Clima: vuelven a la tarea" } },
      { t: { ca: "Percepció de control", es: "Percepción de control" }, m: { ca: "aprenentatge i repte", es: "aprendizaje y reto" }, e: { ca: "por i percepció de fracàs", es: "miedo y percepción de fracaso" }, on: { ca: "Clima: s'atreveixen · Senyal: por de fallar", es: "Clima: se atreven · Señal: miedo a fallar" } },
      { t: { ca: "Atenció", es: "Atención" }, m: { ca: "estímuls d'aprenentatge", es: "estímulos de aprendizaje" }, e: { ca: "estímuls de resultats", es: "estímulos de resultados" }, on: { ca: "Atenció a la tasca · On he vist la seva atenció", es: "Atención a la tarea · Dónde he visto su atención" } }
    ]
  }
};
