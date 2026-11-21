/* APRENS · Pizarra del entrenador · Contenido de la ficha del jugador
   ---------------------------------------------------------------------------
   Qué pide cada puesto (táctica, técnica, físico, atención) y qué conviene
   entrenar según la etapa de desarrollo. Textos dirigidos al jugador (tú).
   Fuentes de referencia: modelo de las cuatro esquinas de la FA (técnico-táctico,
   físico, psicológico y social), modelo de desarrollo físico juvenil de Lloyd y
   Oliver, consenso internacional sobre entrenamiento de fuerza en jóvenes (2014)
   y documento «Atenció i maneig emocional a l'esport» de APRENS.
*/
window.PZ_FICHA = (function () {
  "use strict";

  const ETAPAS = {
    alevin: {
      n: "Alevín", edad: "10 y 11 años",
      fase: "Estás en una edad muy buena para aprender gestos nuevos: el cuerpo aprende rápido la coordinación y la técnica, y lo que repitas ahora se queda para siempre. Todavía no hace falta encerrarse en un puesto; jugar en varios te hará mejor jugador.",
      fisico: [
        "Coordinación, equilibrio y ritmo: saltar, girar, cambiar de dirección, con y sin balón.",
        "Velocidad de reacción y salidas cortas, en forma de juego y con descansos completos.",
        "Fuerza con el peso de tu cuerpo: saltos suaves, apoyos, gateos, plancha, sentadilla sin peso.",
        "La resistencia llega sola jugando: partidos reducidos y juegos con balón.",
        "Movilidad y estiramientos suaves al acabar, sin rebotes."
      ],
      tecnica: "Mucho balón: conducción con las dos piernas, control orientado, pase interior, regate y tiro. La pierna mala se entrena ahora.",
      tactica: "Entender el juego: dónde está el balón, dónde está el espacio libre, ofrecerse para ayudar al compañero y volver rápido cuando lo perdemos.",
      cabeza: [
        "Divertirse y querer aprender es lo más importante.",
        "Equivocarse forma parte de aprender: el error de hoy es el acierto de mañana.",
        "Escucha la indicación del entrenador y prueba a hacerla, aunque al principio salga mal."
      ],
      cuidado: [
        "Duerme bien (unas 9 o 10 horas) y desayuna antes de entrenar.",
        "Si algo te duele más de dos o tres días, díselo al entrenador y a tu familia."
      ]
    },
    infantil: {
      n: "Infantil", edad: "12 y 13 años",
      fase: "Empieza la pubertad y cada uno crece a su ritmo. Puede que te encuentres más torpe unos meses porque las piernas y los brazos crecen deprisa: es normal y pasa. No te compares con quien ya ha dado el estirón; lo que cuenta es cómo mejoras tú.",
      fisico: [
        "Técnica de los ejercicios de fuerza con tu peso o con poca carga: sentadilla, zancada, puente de glúteo, plancha. Primero aprender a hacerlos bien.",
        "Velocidad y agilidad: cambios de dirección, frenar bien, arrancar. Series cortas con descanso completo.",
        "Saltos y caídas: aprende a caer con las rodillas alineadas, sin que se metan hacia dentro.",
        "Resistencia aeróbica con juego y posesiones, no con carreras largas sin balón.",
        "Calentamiento de prevención tipo FIFA 11+ antes de cada entreno."
      ],
      tecnica: "Hacer la técnica más rápido y con menos espacio: control orientado, pase con las dos piernas, perfilarse antes de recibir, primer toque hacia donde vas a jugar.",
      tactica: "Principios del juego: amplitud y profundidad cuando tenemos el balón; juntarnos, cerrar líneas de pase y presionar en equipo cuando no lo tenemos. Empezar a entender tu puesto sin dejar de probar otros.",
      cabeza: [
        "Aprende a darte cuenta de cuándo te has distraído y vuelve a la jugada con tu palabra clave.",
        "Pon la atención en lo que tú controlas: tu esfuerzo, tu posición, tu siguiente acción.",
        "Pregunta al entrenador en qué te tienes que fijar en cada ejercicio."
      ],
      cuidado: [
        "Durante el estirón son frecuentes las molestias en la rodilla (debajo de la rótula) o en el talón. Si aparecen, avisa: se ajusta la carga, no hace falta aguantar el dolor.",
        "Duerme unas 9 horas y come variado: el crecimiento también gasta energía."
      ]
    },
    cadete: {
      n: "Cadete", edad: "14 y 15 años",
      fase: "Muchos estáis en pleno estirón o acabándolo. Es un buen momento para ganar velocidad y para empezar a ganar fuerza de verdad, siempre bien supervisado. El juego se vuelve más táctico: ya no basta con correr, hay que saber dónde estar.",
      fisico: [
        "Fuerza con técnica y carga progresiva, supervisada: sentadilla, peso muerto rumano, zancadas, empujes y tracciones.",
        "Velocidad máxima y aceleración en distancias cortas (10 a 30 metros), con descanso completo.",
        "Potencia: saltos horizontales y verticales, lanzamientos, multisaltos sencillos bien ejecutados.",
        "Resistencia intermitente: esfuerzos cortos repetidos como en el partido.",
        "Prevención: isquiotibiales (nórdicos suaves), aductores, tobillo y core, dos veces por semana."
      ],
      tecnica: "Técnica a velocidad de partido y bajo presión de un rival: controlar y jugar en dos toques, pase tenso y preciso, juego de cabeza, técnica defensiva (entrada, perfil, temporización).",
      tactica: "Funcionamiento de las líneas: basculaciones, coberturas, vigilancias y apoyos. Conocer bien las funciones de tu puesto en cada fase del juego y en las acciones a balón parado.",
      cabeza: [
        "Juego parado (penalti, falta, después de un error): es normal que aparezcan nervios y pensamientos. No luches con ellos: respira, palabra clave y vuelve a lo que es importante en la jugada.",
        "Las correcciones del entrenador hablan de la acción, no de ti como persona.",
        "Fíjate en lo que haces bien, también: ayuda a repetirlo."
      ],
      cuidado: [
        "Duerme 8 o 9 horas; el músculo y el aprendizaje se consolidan descansando.",
        "Si estás creciendo mucho, puede que el entrenador baje algunos saltos o sprints unas semanas. Es para cuidarte."
      ]
    },
    juvenil: {
      n: "Juvenil", edad: "16 a 18 años",
      fase: "Tu cuerpo ya está cerca del adulto y puedes entrenar fuerza y potencia con más carga, bien guiado. Es la etapa de dominar tu puesto, entender el modelo de juego del equipo y tomar buenas decisiones también cuando hay presión.",
      fisico: [
        "Fuerza y potencia con cargas progresivas y supervisión: sentadilla, peso muerto, empujes, tracciones, trabajo unilateral.",
        "Sprints repetidos y cambios de ritmo como en el partido; aceleración y frenada.",
        "Resistencia específica del puesto (por ejemplo, ida y vuelta del lateral, duelos del central).",
        "Prevención de lesiones dos veces por semana: nórdicos, Copenhague para aductores, tobillo y core.",
        "Recuperación: sueño, hidratación y alimentación son parte del entrenamiento."
      ],
      tecnica: "Precisión y velocidad en la ejecución bajo presión: perfilarse siempre, jugar a uno o dos toques, dominar los gestos propios del puesto con las dos piernas.",
      tactica: "Dominar las funciones del puesto dentro del modelo de juego del equipo, leer el partido (marcador, minuto, cansancio del rival) y ayudar a ordenar a los compañeros.",
      cabeza: [
        "Construye una rutina antes del partido y antes de las acciones a balón parado.",
        "La clave no es no distraerse nunca, sino darse cuenta antes y volver antes.",
        "Comunica en el campo: hablar ordena al equipo y también te ayuda a estar en el juego."
      ],
      cuidado: [
        "Planifica el descanso con los estudios y el resto de actividades.",
        "Cualquier molestia que se repite se consulta pronto, no al final de la temporada."
      ]
    }
  };

  const PUESTOS = {
    por: {
      n: "Portero",
      papel: "Eres el último defensor y el primer atacante: proteges la portería, ordenas a la defensa y empiezas el juego con el pie o con la mano.",
      conBalon: [
        "Ofrécete como apoyo por detrás de los centrales para que el balón pueda circular.",
        "Antes de recibir, mira dónde está el compañero libre y dónde presiona el rival.",
        "Saque rápido si hay ventaja; si no, espera a que el equipo se abra.",
        "Saque en largo con intención: hacia el compañero que gana el duelo o hacia la segunda jugada."
      ],
      sinBalon: [
        "Ajusta tu posición según el balón: en la línea entre el balón y el centro de la portería.",
        "Con el equipo arriba, adelántate fuera del área para cubrir la espalda de la defensa.",
        "Habla: «¡Mía!», «¡Fuera!», «¡Sube!», «¡Hombre!». Tu voz ordena a la línea.",
        "En centros, decide pronto: si sales, sal decidido; si no, quédate y comunica."
      ],
      robo: "Al atrapar el balón, mira primero lejos: si hay un compañero corriendo al espacio, saque rápido.",
      perdida: "Coloca a la defensa y prepárate para el disparo o el pase a la espalda.",
      fijate: ["El pie y la cadera del que va a disparar o centrar.", "La altura de tu línea defensiva.", "Los delanteros rivales que atacan la espalda."],
      tecnica: ["Posición de base y desplazamientos laterales.", "Blocajes a media altura y rasos.", "Caídas laterales y estiradas.", "Juego de pies: control y pase con las dos piernas.", "Saques con la mano y en largo."],
      fisico: ["Agilidad y reacción.", "Potencia de piernas para el salto y la estirada.", "Fuerza del tronco y los hombros."],
      solo: ["Pared: lanza el balón y atrápalo con las dos manos, 3 series de 20.", "Pases contra la pared con las dos piernas, controlando antes.", "Saltos laterales sobre una línea, 3 series de 20 segundos."],
      avanzado: ["Defensa del espacio a la espalda de la línea.", "Salida de balón bajo presión y lectura del pase largo.", "Organización de la barrera y de los balones parados."]
    },
    lat: {
      n: "Lateral",
      papel: "Defiendes tu banda y das amplitud al ataque: eres el jugador que más recorre la banda arriba y abajo.",
      conBalon: [
        "Da amplitud: pegado a la línea, para que el campo sea grande.",
        "En la salida de balón, colócate más alto que el central y recibe mirando hacia delante.",
        "Si el extremo va por dentro, ocupa tú la banda; si va por fuera, apoya por dentro.",
        "Llega al centro con la cabeza levantada: mira antes de centrar."
      ],
      sinBalon: [
        "Cierra tu banda: no dejes que el extremo te gane la espalda.",
        "Perfil defensivo hacia fuera para empujar al rival hacia la línea de banda.",
        "Si el balón está en la otra banda, cierra hacia dentro y vigila al que ataca el segundo palo.",
        "Ajusta la altura con tus centrales: línea junta."
      ],
      robo: "Sal rápido por tu banda si hay espacio, o da un pase seguro al compañero más cercano.",
      perdida: "Vuelve rápido a tu posición; si estás cerca, presiona al que ha robado.",
      fijate: ["Al extremo rival y al espacio a tu espalda.", "La altura de tus centrales.", "Si tu extremo va por dentro o por fuera, para ocupar el otro carril."],
      tecnica: ["Control orientado hacia delante.", "Conducción en velocidad.", "Centro raso y centro tenso al área.", "Entrada y temporización en el uno contra uno defensivo."],
      fisico: ["Resistencia para ir y volver muchas veces.", "Sprints repetidos.", "Cambios de dirección en carrera."],
      solo: ["Conducción en velocidad 20 metros y centro contra una pared o una portería, con las dos piernas.", "Sprints de 20 metros ida y vuelta, 6 repeticiones con descanso.", "Defensa en uno contra uno con un amigo: perfil, paciencia, entrada."],
      avanzado: ["Desdoblamientos y apoyos por dentro (lateral interior).", "Coberturas al central y vigilancias en ataque.", "Lectura del momento para subir o quedarse."]
    },
    cen: {
      n: "Central",
      papel: "Proteges el centro de la defensa, ganas los duelos y empiezas el juego con pases seguros.",
      conBalon: [
        "Ábrete en la salida de balón para que el portero pueda jugar contigo.",
        "Perfil abierto hacia dentro: que veas al pivote y al lateral a la vez.",
        "Si nadie te presiona, conduce hacia delante para atraer a un rival y liberar a un compañero.",
        "Pase tenso al pie del compañero, por el lado contrario al rival."
      ],
      sinBalon: [
        "Línea junta con el otro central y con los laterales.",
        "Cobertura: si tu compañero sale, tú cierras por detrás.",
        "Anticípate cuando el delantero recibe de espaldas; si no llegas, no le dejes girarse.",
        "Ataca el balón en los centros con impulso y despeja alto, lejos y a la banda."
      ],
      robo: "Primer pase seguro o, si hay ventaja, pase vertical al compañero entre líneas.",
      perdida: "Retrocede, orienta al rival hacia fuera y gana tiempo para que el equipo vuelva.",
      fijate: ["Al delantero rival y al espacio a tu espalda.", "La posición del otro central y de los laterales (línea).", "El pie del que va a pasar: anticipa el pase en largo."],
      tecnica: ["Pase largo y pase corto tenso con las dos piernas.", "Juego de cabeza defensivo: se trabaja en el entreno, con supervisión y pocas repeticiones según tu edad.", "Control orientado bajo presión.", "Entrada y perfil en el uno contra uno."],
      fisico: ["Salto y fuerza en los duelos.", "Aceleración en los primeros metros.", "Giros rápidos para defender la espalda."],
      solo: ["Pases largos contra una pared o con un compañero, 20 con cada pierna.", "Saltos con impulso de una y de dos piernas, cayendo con las rodillas alineadas, 3 series de 6.", "Carrera hacia atrás y giro para correr hacia delante, 6 repeticiones."],
      avanzado: ["Gestión de la altura de la línea y del fuera de juego.", "Salida de balón con tres jugadores.", "Comunicación y liderazgo de la defensa."]
    },
    piv: {
      n: "Pivote / mediocentro defensivo",
      papel: "Eres el equilibrio del equipo: das salida al balón, cambias el juego de lado y proteges el centro cuando defendemos.",
      conBalon: [
        "Ofrécete siempre de cara al juego, nunca escondido detrás de un rival.",
        "Antes de recibir, mira a los dos lados: así sabrás a dónde girar.",
        "Pocos toques y cambio de orientación: lleva el balón de una banda a la otra.",
        "Si los centrales están presionados, baja entre ellos para ayudar a salir."
      ],
      sinBalon: [
        "Protege el espacio delante de los centrales.",
        "Tapa los pases por dentro para que el rival solo pueda ir a la banda.",
        "Ayuda a la presión del compañero sin dejar tu zona vacía.",
        "Vigila al mediapunta rival."
      ],
      robo: "Busca el pase hacia delante al primer toque si hay un compañero libre.",
      perdida: "Eres el primero en frenar la contra: ponte en el camino del rival y retrásalo para que el equipo pueda volver.",
      fijate: ["Al mediapunta rival y al espacio entre tus centrales.", "Dónde está el compañero libre antes de recibir.", "El lado del campo donde hay menos rivales para cambiar el juego."],
      tecnica: ["Control orientado y giro.", "Pase corto y medio con las dos piernas.", "Cambio de orientación en largo.", "Entrada y recuperación."],
      fisico: ["Resistencia para estar en todas partes.", "Cambios de dirección cortos.", "Fuerza en los duelos."],
      solo: ["Pared: control orientado y pase, alternando piernas, 3 minutos.", "Mira por encima del hombro antes de cada control (pide a alguien que te enseñe un color o un número).", "Cambios de juego en largo con un compañero, 20 repeticiones."],
      avanzado: ["Escalonamiento con el otro mediocentro.", "Basculación y coberturas a los laterales.", "Gestión del ritmo del partido."]
    },
    med: {
      n: "Interior / mediocentro",
      papel: "Unes la defensa con el ataque: apareces entre líneas, llegas al área y ayudas en la presión.",
      conBalon: [
        "Escalónate con el pivote: no os pongáis en la misma línea.",
        "Busca el hueco entre dos rivales para recibir.",
        "Conduce para atraer y suelta al compañero que queda libre.",
        "Llega desde segunda línea al borde del área."
      ],
      sinBalon: [
        "Salta al mediocentro rival que reciba y no le dejes girarse.",
        "Cierra el pasillo interior de tu lado.",
        "Ayuda al lateral cuando el extremo rival encara."
      ],
      robo: "Ataca el espacio hacia delante o da el pase al compañero que corre.",
      perdida: "Presiona inmediatamente al que roba, durante unos segundos, con los compañeros cercanos.",
      fijate: ["El hueco entre líneas.", "Al pivote rival.", "El momento en que el compañero levanta la cabeza para desmarcarte."],
      tecnica: ["Control orientado y giro.", "Pase filtrado.", "Conducción y regate en espacios cortos.", "Tiro desde fuera del área."],
      fisico: ["Resistencia de área a área.", "Aceleraciones repetidas.", "Equilibrio en los contactos."],
      solo: ["Conducción entre conos con giros, las dos piernas.", "Tiros desde fuera del área después de un control orientado.", "Pared con giro: recibe, gira y pasa por el otro lado."],
      avanzado: ["Ocupación de espacios según el sistema.", "Llegadas al área y rechaces.", "Lectura del momento para presionar o replegar."]
    },
    mp: {
      n: "Mediapunta",
      papel: "Juegas entre la defensa y el centro del campo rival: recibes, te giras y das el último pase o llegas a rematar.",
      conBalon: [
        "Colócate a la espalda de los mediocentros rivales, donde no te vean.",
        "Mira antes de recibir para poder girarte de cara.",
        "Último pase al delantero o al extremo que rompe a la espalda.",
        "Llega al área cuando el balón está en la banda."
      ],
      sinBalon: [
        "Tapa al pivote rival con tu cuerpo (que no le llegue el balón).",
        "Primera ayuda a la presión del delantero.",
        "Vuelve a tu línea si el rival supera la presión."
      ],
      robo: "Eres la primera opción de pase: ofrécete entre líneas enseguida.",
      perdida: "Presiona al que ha robado, el balón está cerca de ti.",
      fijate: ["Al pivote rival.", "Al delantero y a los extremos que rompen.", "Al espacio a la espalda de los mediocentros rivales."],
      tecnica: ["Control orientado y giro en espacio corto.", "Pase filtrado y pase al espacio.", "Regate en el uno contra uno.", "Tiro."],
      fisico: ["Aceleración y cambio de ritmo.", "Agilidad.", "Equilibrio con contacto."],
      solo: ["Recibe de espaldas contra una pared y gírate al primer toque, 20 veces a cada lado.", "Pase a un punto lejano (un cono) con el interior, 30 repeticiones.", "Tiro después de un giro."],
      avanzado: ["Movimientos para fijar y liberar a compañeros.", "Llegada desde segunda línea.", "Presión sobre el pivote como señal para el equipo."]
    },
    ext: {
      n: "Extremo",
      papel: "Das amplitud y desequilibrio: encaras, buscas la espalda del lateral y llegas al área.",
      conBalon: [
        "Abre el campo pegado a la banda para fijar al lateral rival.",
        "Si el lateral sale a por ti, ataca su espalda.",
        "Encara en el uno contra uno: cambio de ritmo y de dirección.",
        "Si el balón está en la otra banda, ataca el segundo palo."
      ],
      sinBalon: [
        "Cierra hacia dentro para quitar el pase interior.",
        "Cuando el balón va al lateral rival, presiona.",
        "Acompaña al lateral rival si sube."
      ],
      robo: "Corre al espacio: eres el primer jugador de la contra.",
      perdida: "Presiona o vuelve a cerrar tu banda.",
      fijate: ["La cadera y los pies del lateral rival.", "El espacio a su espalda.", "Al compañero que tiene el balón: el pase llegará cuando levante la cabeza."],
      tecnica: ["Regate y cambio de ritmo.", "Conducción en velocidad.", "Centro y pase atrás.", "Tiro tras diagonal hacia dentro."],
      fisico: ["Velocidad máxima y aceleración.", "Sprints repetidos.", "Agilidad en el uno contra uno."],
      solo: ["Conducción en velocidad con cambio de dirección, las dos piernas.", "Regates contra un cono y salida en velocidad, 10 a cada lado.", "Centros y tiros desde la banda."],
      avanzado: ["Movimientos de dentro hacia fuera y de fuera hacia dentro según el lateral.", "Presión coordinada sobre el lateral rival.", "Ataque al segundo palo."]
    },
    del: {
      n: "Delantero",
      papel: "Fijas a los centrales, estiras el campo y finalizas. También eres el primero en presionar.",
      conBalon: [
        "Fija a los centrales: que estén pendientes de ti.",
        "Ataca el espacio a la espalda de la defensa en el momento justo.",
        "Ofrece apoyo de cara para descargar cuando el equipo lo necesita.",
        "En el área, ataca el primer palo, el punto de penalti o el segundo palo, no te quedes quieto."
      ],
      sinBalon: [
        "Presiona en curva: corre hacia el central tapando el pase al portero o al otro central.",
        "Empuja la salida rival hacia la banda.",
        "Después de presionar, vuelve a tapar al pivote."
      ],
      robo: "Ofrécete al espacio o de cara según dónde haya sido el robo.",
      perdida: "Presiona al primer defensor para que no pueda salir limpio.",
      fijate: ["La línea defensiva rival (para no caer en fuera de juego).", "La cabeza del compañero con el balón: cuando la levanta, arranca.", "Al portero en el remate."],
      tecnica: ["Remate con las dos piernas (el remate de cabeza, en el entreno y con supervisión).", "Control de espaldas y protección del balón.", "Desmarques de ruptura y de apoyo.", "Definición en el uno contra uno con el portero."],
      fisico: ["Aceleración y velocidad máxima.", "Fuerza para proteger el balón.", "Salto en el remate."],
      solo: ["Tiros a portería con las dos piernas desde distintas posiciones, 30 en total.", "Control de espaldas contra una pared y giro.", "Sprints cortos de 10 metros saliendo desde parado, 8 repeticiones."],
      avanzado: ["Movimientos de desmarque coordinados con el mediapunta.", "Señales de presión para el equipo.", "Lectura del fuera de juego."]
    }
  };

  // Aspectos para marcar en la ficha de cada jugador (punto fuerte, a mejorar o consejo).
  // [clave, área, grupo, texto]. «soloPortero» se muestra solo a porteros.
  const ASPECTOS = [
    // Técnica
    ["control", "tecnica", "Técnica con balón", "Control orientado hacia donde va a jugar"],
    ["primer_toque", "tecnica", "Técnica con balón", "Primer toque con presión de un rival"],
    ["conduccion", "tecnica", "Técnica con balón", "Conducción con cambio de ritmo"],
    ["pase_corto", "tecnica", "Técnica con balón", "Pase corto tenso y al pie"],
    ["pase_largo", "tecnica", "Técnica con balón", "Pase largo y cambio de orientación"],
    ["pase_espacio", "tecnica", "Técnica con balón", "Pase al espacio (al desmarque)"],
    ["pierna_mala", "tecnica", "Técnica con balón", "Uso de la pierna menos hábil"],
    ["regate", "tecnica", "Técnica con balón", "Regate en el uno contra uno"],
    ["proteccion", "tecnica", "Técnica con balón", "Protección del balón de espaldas"],
    ["tiro", "tecnica", "Técnica con balón", "Tiro a portería"],
    ["centro", "tecnica", "Técnica con balón", "Centro desde la banda"],
    ["balon_aereo", "tecnica", "Técnica con balón", "Control de balones altos"],
    ["cabeza", "tecnica", "Técnica con balón", "Juego de cabeza (en el entreno, supervisado)"],
    ["entrada", "tecnica", "Técnica defensiva", "Entrada y robo sin falta"],
    ["temporizar", "tecnica", "Técnica defensiva", "Temporizar en el uno contra uno defensivo"],
    ["perfil_def", "tecnica", "Técnica defensiva", "Perfil defensivo (de lado, empujando a banda)"],
    ["por_base", "tecnica", "Portero", "Posición de base y desplazamientos", true],
    ["por_blocaje", "tecnica", "Portero", "Blocaje", true],
    ["por_caida", "tecnica", "Portero", "Caídas y estiradas", true],
    ["por_alto", "tecnica", "Portero", "Salidas por alto", true],
    ["por_1x1", "tecnica", "Portero", "Uno contra uno con el delantero", true],
    ["por_pies", "tecnica", "Portero", "Juego de pies en la salida de balón", true],
    ["por_saque", "tecnica", "Portero", "Saques con la mano y en largo", true],
    ["por_voz", "tecnica", "Portero", "Dirigir y ordenar a la defensa", true],
    // Táctica
    ["perfil_abierto", "tactica", "Táctica con balón", "Perfil abierto antes de recibir"],
    ["desm_apoyo", "tactica", "Táctica con balón", "Desmarque de apoyo (ofrecerse)"],
    ["desm_ruptura", "tactica", "Táctica con balón", "Desmarque de ruptura (atacar el espacio)"],
    ["amplitud", "tactica", "Táctica con balón", "Dar amplitud cuando toca"],
    ["profundidad", "tactica", "Táctica con balón", "Dar profundidad cuando toca"],
    ["espacio_libre", "tactica", "Táctica con balón", "Ocupar el espacio libre"],
    ["triangulos", "tactica", "Táctica con balón", "Apoyos y triángulos con compañeros"],
    ["llegada", "tactica", "Táctica con balón", "Llegada al área"],
    ["fijar", "tactica", "Táctica con balón", "Fijar a un rival para liberar a un compañero"],
    ["salida_balon", "tactica", "Táctica con balón", "Participar en la salida de balón"],
    ["tras_perdida", "tactica", "Táctica sin balón", "Presión inmediata tras pérdida"],
    ["primer_def", "tactica", "Táctica sin balón", "Primer defensor: llevar al rival a la banda"],
    ["cobertura", "tactica", "Táctica sin balón", "Cobertura al compañero que presiona"],
    ["basculacion", "tactica", "Táctica sin balón", "Basculación hacia el lado del balón"],
    ["lineas_pase", "tactica", "Táctica sin balón", "Cerrar líneas de pase"],
    ["marcaje", "tactica", "Táctica sin balón", "Marcaje y vigilancia del rival"],
    ["repliegue", "tactica", "Táctica sin balón", "Repliegue rápido"],
    ["altura_linea", "tactica", "Táctica sin balón", "Altura de la línea y fuera de juego"],
    ["abp", "tactica", "Táctica sin balón", "Balón parado (córners, faltas, banda)"],
    // Toma de decisiones
    ["exploracion", "decision", "Toma de decisiones", "Mirar antes de recibir (saber qué hay alrededor)"],
    ["elegir", "decision", "Toma de decisiones", "Elegir bien entre pase, conducción o tiro"],
    ["simple", "decision", "Toma de decisiones", "Jugar fácil cuando hay presión"],
    ["riesgo", "decision", "Toma de decisiones", "Saber cuándo arriesgar y cuándo asegurar"],
    ["anticipar", "decision", "Toma de decisiones", "Leer la jugada y anticiparse"],
    ["velocidad_dec", "decision", "Toma de decisiones", "Decidir rápido"],
    ["lado_debil", "decision", "Toma de decisiones", "Cambiar el juego al lado con menos rivales"],
    ["ritmo", "decision", "Toma de decisiones", "Gestionar el ritmo (acelerar o pausar)"],
    ["momento", "decision", "Toma de decisiones", "Escoger el momento del desmarque"],
    // Físico
    ["reaccion", "fisico", "Físico", "Velocidad de reacción"],
    ["aceleracion", "fisico", "Físico", "Aceleración y sprint"],
    ["resistencia", "fisico", "Físico", "Repetir esfuerzos durante el partido"],
    ["agilidad", "fisico", "Físico", "Agilidad y cambios de dirección"],
    ["fuerza", "fisico", "Físico", "Fuerza en los duelos"],
    ["salto", "fisico", "Físico", "Salto"],
    ["coordinacion", "fisico", "Físico", "Coordinación y equilibrio"],
    // Atención y actitud
    ["concentracion", "atencion", "Atención y actitud", "Concentración durante todo el partido"],
    ["volver", "atencion", "Atención y actitud", "Volver a la jugada después de un error"],
    ["indicaciones", "atencion", "Atención y actitud", "Escuchar y aplicar las indicaciones"],
    ["comunicacion", "atencion", "Atención y actitud", "Comunicarse con los compañeros"],
    ["esfuerzo", "atencion", "Atención y actitud", "Esfuerzo y compromiso"],
    ["nervios", "atencion", "Atención y actitud", "Gestionar los nervios y la presión"],
    ["liderazgo", "atencion", "Atención y actitud", "Liderazgo y ayuda a los compañeros"],
    ["respeto", "atencion", "Atención y actitud", "Juego limpio y respeto"]
  ].map((x) => ({ k: x[0], a: x[1], g: x[2], t: x[3], soloPortero: !!x[4] }));


  // Estímulos relevantes de cada aspecto: en qué fijarse y cuándo. Salen en «Tu foco ahora» de la ficha.
  const ESTIMULOS = {
    control: "Antes de recibir, dónde está el rival más cercano y dónde está el espacio libre. El primer toque, ya hacia allí.",
    primer_toque: "Mientras viaja el balón, de qué lado viene el rival. Toca lejos de él, hacia el lado libre.",
    conduccion: "El espacio que tienes delante y el rival que se acerca. Cambia de ritmo justo cuando él frena o se gira.",
    pase_corto: "El pie del compañero (el que está más lejos del rival) y que no haya nadie en la línea de pase. Pasa tenso, en el momento en que te mira.",
    pase_largo: "El lado del campo con menos rivales y el compañero que está libre allí. Levanta la cabeza antes de golpear.",
    pase_espacio: "La carrera del compañero y el espacio a la espalda de la defensa. Pasa cuando él arranca, al espacio, no al pie.",
    pierna_mala: "Hacia dónde está el espacio libre: si queda en el lado de tu pierna menos hábil, úsala sin pensarlo.",
    regate: "El peso del cuerpo y los pies del defensor. Sal hacia el lado contrario justo cuando se apoya.",
    proteccion: "Dónde está el rival que tienes detrás (con el brazo y el cuerpo) y qué compañero se ofrece para descargar.",
    tiro: "Dónde está el portero y qué palo queda libre. Al golpear, mira el balón y apunta el pie de apoyo a la portería.",
    centro: "Los compañeros que entran al área y el espacio entre el portero y los defensas. Centra cuando arrancan.",
    balon_aereo: "La trayectoria del balón desde que sale: colócate antes debajo de él y amortigua al recibir.",
    cabeza: "La trayectoria del balón y los ojos abiertos hasta el contacto. Golpea con la frente, hacia donde quieres que vaya.",
    entrada: "El balón, no el jugador. Entra cuando el rival se lo separa del pie o lo controla mal.",
    temporizar: "Los pies del rival y el balón. Espera de lado, sin lanzarte, hasta que llega la ayuda o se le escapa el balón.",
    perfil_def: "Hacia dónde quieres llevar al rival (la banda) y la posición del compañero que te cubre.",
    por_base: "Dónde está el balón en cada momento: desplázate para quedar siempre entre el balón y el centro de la portería.",
    por_blocaje: "El balón hasta que está en tus manos. Manos detrás del balón y llévalo al pecho.",
    por_caida: "El balón y el lado hacia donde va. Primer paso hacia allí antes de lanzarte.",
    por_alto: "La trayectoria del balón y los jugadores que atacan. Decide pronto: si sales, sal decidido y di «¡mía!».",
    por_1x1: "El balón y los pies del delantero. Achica el espacio y quédate de pie hasta que él decida.",
    por_pies: "Antes de recibir, quién te presiona y qué compañero queda libre. Orienta el primer toque hacia él.",
    por_saque: "El compañero libre y si su rival está cerca o lejos. Saca rápido cuando el compañero está de cara.",
    por_voz: "Toda la jugada desde atrás: el balón, la línea y los rivales libres. Habla antes de que llegue el peligro.",
    perfil_abierto: "Antes de recibir, el campo que tienes delante y a los lados. Colócate de manera que veas el balón y la portería rival a la vez.",
    desm_apoyo: "La posición del compañero con balón y el rival que tapa la línea de pase. Muévete para quedar libre, de cara a él.",
    desm_ruptura: "La línea del último defensor y la cabeza del compañero con balón. Sal en diagonal cuando levante la cabeza.",
    amplitud: "Dónde está el balón: si está en el otro lado o en el centro, abre el campo pegado a la línea.",
    profundidad: "La espalda de la defensa rival. Estira el campo cuando tu equipo tiene el balón y puede jugar hacia delante.",
    espacio_libre: "Dónde no hay nadie (ni compañero ni rival) entre el balón y la portería rival. Ocúpalo antes de que se cierre.",
    triangulos: "Dónde están tus dos compañeros más cercanos. Colócate para formar un triángulo con ellos, no en línea.",
    llegada: "El momento del centro o del último pase: entra al área desde atrás, cuando el balón va a salir.",
    fijar: "El rival que defiende a tu compañero. Atráelo hacia ti y suelta el pase justo cuando se compromete.",
    salida_balon: "Cuando el portero o los centrales tienen el balón: quién presiona y dónde quedas libre para recibir de cara.",
    tras_perdida: "El balón y quien acaba de robarlo. En el primer segundo, presiona o cierra su pase más fácil.",
    primer_def: "El balón y el lado que te interesa cerrar. Ponte de lado y empuja al rival hacia la banda.",
    cobertura: "El compañero que presiona y el espacio que deja a su espalda. Colócate detrás, a un par de metros.",
    basculacion: "Hacia dónde va el balón: desplázate con tu línea hacia ese lado mientras viaja.",
    lineas_pase: "El jugador con balón y el rival al que podría pasar. Ponte en medio de la línea de pase.",
    marcaje: "Tu rival y el balón a la vez. Colócate entre él y tu portería, a la distancia que te permita llegar antes.",
    repliegue: "En el momento de perder el balón, el camino más corto hacia tu posición defensiva, detrás de la línea del balón.",
    altura_linea: "La línea de tus compañeros y el balón. Sube juntos cuando el rival pasa atrás y quédate en línea con ellos.",
    abp: "Tu zona o tu rival en la jugada, y la señal del lanzador. Arranca en el momento acordado.",
    exploracion: "Lo que hay alrededor antes de que te llegue el balón: mira por encima del hombro dos veces mientras viaja.",
    elegir: "Antes de recibir: si hay un compañero libre delante, pasa; si hay espacio, conduce; si ves portería, tira.",
    simple: "Cuando el rival está encima: el compañero más cercano y libre. Pase fácil y vuelve a ofrecerte.",
    riesgo: "Dónde estás del campo y cuántos compañeros hay detrás del balón. Cerca de tu portería, asegura; cerca de la rival, arriesga.",
    anticipar: "El jugador con balón y hacia dónde mira. Muévete hacia donde va a ir el pase antes de que salga.",
    velocidad_dec: "Mira antes de recibir para tener la decisión tomada cuando te llegue el balón.",
    lado_debil: "El lado del campo con menos rivales y el compañero libre allí. Cambia el juego cuando el rival se acumula en un lado.",
    ritmo: "El estado del partido y de tu equipo: acelera cuando hay espacio delante; pausa cuando hay que ordenarse.",
    momento: "El compañero con balón y la línea defensiva. Arranca cuando él puede pasar, ni antes ni después.",
    reaccion: "El balón y la señal (pérdida, rechace, robo). Arranca en el primer momento, sin esperar a ver qué pasa.",
    aceleracion: "El espacio libre y el balón. Arranca fuerte los primeros pasos cuando ves la ocasión.",
    resistencia: "Cuándo toca correr fuerte (perder o recuperar el balón) y cuándo puedes recuperar el aire con el balón lejos.",
    agilidad: "El balón y el rival: baja el cuerpo antes de cambiar de dirección.",
    fuerza: "El momento del contacto: cuerpo bajo y brazos para protegerte, sin falta.",
    salto: "La trayectoria del balón. Calcula el punto y salta antes que el rival, con los dos brazos para impulsarte.",
    coordinacion: "El balón y tus apoyos: pasos cortos para llegar bien colocado.",
    concentracion: "La jugada en cada momento, también con el balón lejos. Si te distraes, date cuenta y vuelve con tu palabra clave.",
    volver: "Después de un error, lo que notas en el cuerpo, sin pelearte con ello. Tu palabra o tu gesto, y la próxima jugada.",
    indicaciones: "La consigna del entrenador antes del ejercicio: en qué fijarte y cuándo. Llévala a la primera jugada.",
    comunicacion: "Lo que ves y tu compañero no ve. Díselo antes de que llegue el balón: «solo», «hombre», «gira».",
    esfuerzo: "Las acciones que dependen de ti: volver a defender, ofrecerte, presionar. Cada una, hasta el final.",
    nervios: "Lo que notas en el cuerpo antes y durante el partido, sin luchar. Respira y vuelve a lo que tienes que mirar.",
    liderazgo: "Los compañeros que lo están pasando peor. Una palabra o un gesto de ánimo en el momento.",
    respeto: "El rival, el árbitro y los compañeros. Después de una falta o un error, vuelve a la jugada sin protestar."
  };

  // Mensaje para el jugador según el aspecto sea punto fuerte [0] o a mejorar [1]: concreto, objetivo y operativo.
  const MENSAJES = {
    control: ["Tu primer toque te deja jugando de cara: úsalo para salir de la presión y acelerar el juego.", "En cada recepción, decide antes hacia dónde va el primer toque y llévalo hacia el espacio libre."],
    primer_toque: ["Con un rival encima mantienes el balón: pídelo aunque estés marcado.", "Cuando recibas con un rival cerca, toca el balón hacia el lado contrario a él, nunca hacia su pie."],
    conduccion: ["Cuando ves espacio, lo atacas conduciendo: hazlo para romper líneas.", "Conduce con la cabeza levantada y cambia de ritmo cuando el rival frene: lento, rápido."],
    pase_corto: ["Tu pase corto es seguro: eres un apoyo fiable para el equipo, ofrécete siempre.", "Pasa con el interior, tenso y al pie más lejano del rival, mirando al compañero antes de golpear."],
    pase_largo: ["Puedes cambiar el juego de un lado a otro: busca al compañero libre del lado contrario.", "Antes de un pase largo, apoya el pie al lado del balón y golpea por debajo del centro."],
    pase_espacio: ["Ves y das el pase al espacio: busca la carrera de tus compañeros.", "Antes de pasar, mira hacia dónde corre el compañero y pasa al espacio que ataca, no a sus pies."],
    pierna_mala: ["Usas las dos piernas: eres impredecible, aprovéchalo.", "En cada entreno, haz al menos diez controles y pases con tu pierna menos hábil."],
    regate: ["En el uno contra uno ganas: atrévete a encarar cuando tengas espacio.", "En el uno contra uno, amaga hacia un lado y sal hacia el otro cuando el defensor se apoye."],
    proteccion: ["Proteges bien de espaldas: sé el apoyo para descargar y que el equipo suba.", "De espaldas, baja el cuerpo, pon el brazo y deja el balón lejos del rival antes de descargar."],
    tiro: ["Tienes buen tiro: cuando veas portería, chuta.", "Cuando tengas ocasión, chuta: primero colocado y raso, después fuerte."],
    centro: ["Tus centros crean peligro: llega a línea de fondo y busca el punto de penalti.", "Antes de centrar, levanta la cabeza y busca el espacio entre el portero y los defensas."],
    balon_aereo: ["Controlas bien los balones altos: puedes recibir los pases largos.", "Colócate pronto debajo del balón y amortigua con la superficie que va a recibir."],
    cabeza: ["Juegas bien de cabeza: en el área y en defensa, ataca el balón.", "En los ejercicios de cabeza, ojos abiertos hasta el contacto y golpea con la frente hacia donde quieres que vaya."],
    entrada: ["Robas limpio: tu entrada da balones al equipo.", "Entra al balón cuando el rival se lo separa del pie; si no, espera de lado."],
    temporizar: ["Sabes esperar en el uno contra uno: das tiempo a que llegue la ayuda.", "En defensa, no te lances: ponte de lado, a un paso del rival, y espera a que se le escape el balón."],
    perfil_def: ["Tu perfil defensivo lleva al rival a la banda: sigue cerrándole el centro.", "Al defender, ponte de lado y deja libre solo el camino hacia la banda."],
    por_base: ["Estás bien colocado en la portería: transmites seguridad a la defensa.", "Con cada movimiento del balón, da pasos cortos para quedar entre el balón y el centro de la portería."],
    por_blocaje: ["Blocas con seguridad: los rechaces no llegan.", "Pon las manos detrás del balón formando una W y llévalo al pecho."],
    por_caida: ["Te estiras bien: llegas a balones difíciles.", "Antes de lanzarte, da el primer paso hacia el lado del balón y cae de lado, no de espaldas."],
    por_alto: ["Dominas el área en los balones altos: sal y manda.", "Decide pronto si sales; si sales, di «¡mía!» y atrapa el balón en el punto más alto."],
    por_1x1: ["En el uno contra uno aguantas: el delantero tiene que decidir antes que tú.", "Sal para achicar y quédate de pie hasta que el delantero toque el balón."],
    por_pies: ["Juegas bien con los pies: eres el primer pase de la salida.", "Antes de recibir, mira quién te presiona y orienta el primer toque hacia el compañero libre."],
    por_saque: ["Tus saques empiezan los ataques: busca al compañero libre rápido.", "Saca con la mano rápido al compañero de cara; en largo, solo si hay alguien libre."],
    por_voz: ["Ordenas bien a la defensa: sigue hablando en cada jugada.", "Avisa antes de que llegue el peligro con palabras cortas: «sube», «cierra», «hombre»."],
    perfil_abierto: ["Recibes con el cuerpo abierto: ves todo el campo, úsalo para jugar hacia delante.", "Antes de recibir, coloca el cuerpo de lado para ver el balón y la portería rival a la vez."],
    desm_apoyo: ["Te ofreces siempre: eres la solución del compañero con balón.", "Cuando un compañero tenga el balón, muévete hasta que no haya ningún rival en la línea de pase."],
    desm_ruptura: ["Atacas el espacio con buen tiempo: sigue buscando la espalda de la defensa.", "Sal en diagonal a la espalda del último defensor justo cuando el compañero levante la cabeza."],
    amplitud: ["Das amplitud al equipo: abres el campo y creas espacios.", "Cuando el balón esté en el otro lado o en el centro, ábrete hasta tocar la línea de banda."],
    profundidad: ["Das profundidad: estiras el campo y hundes a la defensa rival.", "Cuando tu equipo tenga el balón, colócate a la altura del último defensor rival."],
    espacio_libre: ["Encuentras el espacio libre: sigue ocupándolo antes que el rival.", "Antes de moverte, busca la zona sin nadie entre el balón y la portería rival y ve allí."],
    triangulos: ["Formas buenos triángulos: el equipo combina gracias a ti.", "Colócate de manera que tú y tus dos compañeros más cercanos forméis un triángulo, nunca en línea."],
    llegada: ["Llegas al área a tiempo: busca el segundo palo y el rechace.", "Entra al área desde atrás en el momento del centro, no antes."],
    fijar: ["Fijas bien al rival: liberas a tus compañeros.", "Conduce hacia el rival que marca a tu compañero y pasa justo cuando venga a por ti."],
    salida_balon: ["Participas bien en la salida: eres el apoyo seguro del portero y los centrales.", "Cuando el portero o un central tenga el balón, muévete para quedar libre y de cara."],
    tras_perdida: ["Reaccionas rápido al perder el balón: tu presión recupera balones.", "Al perder el balón, presiona en el primer segundo a quien lo ha robado."],
    primer_def: ["Como primer defensor llevas al rival a la banda: sigue cerrándole el centro.", "Al presionar, ponte de lado y empuja al rival hacia la banda, sin lanzarte."],
    cobertura: ["Cubres bien a tus compañeros: el equipo defiende tranquilo.", "Cuando un compañero presione, colócate detrás de él, a dos o tres metros."],
    basculacion: ["Basculas bien con tu línea: el equipo está compacto.", "Mientras el balón viaja de un lado a otro, muévete con tu línea hacia ese lado."],
    lineas_pase: ["Cierras bien las líneas de pase: el rival no encuentra salida.", "Ponte entre el jugador con balón y el rival al que podría pasar."],
    marcaje: ["Marcas bien: tu rival no recibe cómodo.", "Colócate entre tu rival y tu portería, viendo a la vez el balón y a él."],
    repliegue: ["Repliegas rápido: el equipo no queda descompensado.", "Al perder el balón, corre por el camino más corto hasta detrás de la línea del balón."],
    altura_linea: ["Mantienes bien la línea: el equipo sale junto.", "Mira a tus compañeros de línea y sube o baja a la vez que ellos."],
    abp: ["En el balón parado haces tu trabajo: es una ventaja del equipo.", "En cada balón parado, mira tu zona o tu rival y arranca solo con la señal del lanzador."],
    exploracion: ["Miras antes de recibir: siempre sabes qué hacer con el balón.", "Mientras viene el balón, mira por encima del hombro dos veces antes de recibir."],
    elegir: ["Eliges bien entre pase, conducción y tiro: sigue confiando en tu lectura.", "Antes de recibir, decide: compañero libre, pasa; espacio, conduce; portería, tira."],
    simple: ["Con presión juegas fácil: das seguridad al equipo.", "Si el rival está encima, pasa al compañero más cercano libre y vuelve a ofrecerte."],
    riesgo: ["Sabes cuándo arriesgar: lo haces en el campo rival.", "Cerca de tu portería, juega seguro; en el campo rival, atrévete."],
    anticipar: ["Lees la jugada antes: llegas primero.", "Mira hacia dónde mira el jugador con balón y muévete hacia allí antes del pase."],
    velocidad_dec: ["Decides rápido: el juego va al ritmo que necesitamos.", "Mira antes de recibir para tener la decisión tomada cuando llegue el balón."],
    lado_debil: ["Ves el lado con menos rivales: cambia el juego cuando se acumulan.", "Antes de pasar, mira el otro lado del campo: si hay menos rivales, cambia el juego."],
    ritmo: ["Sabes cuándo acelerar y cuándo pausar: ordenas el juego.", "Acelera cuando haya espacio delante; pausa con el balón cuando el equipo necesite colocarse."],
    momento: ["Eliges bien el momento del desmarque: llegas libre.", "Arranca cuando el compañero con balón pueda pasarte, ni antes ni después."],
    reaccion: ["Reaccionas rápido: llegas primero a los balones divididos.", "Ante cada pérdida, rechace o robo, arranca en el primer momento, sin esperar."],
    aceleracion: ["Tienes aceleración: atacas los espacios antes que nadie.", "Cuando veas espacio, arranca fuerte en los tres primeros pasos."],
    resistencia: ["Aguantas el ritmo todo el partido: llegas fuerte al final.", "Corre fuerte cuando se pierde o recupera el balón; con el balón lejos, recupera el aire caminando."],
    agilidad: ["Cambias de dirección con facilidad: eres difícil de defender.", "Antes de cambiar de dirección, baja el cuerpo y da pasos cortos."],
    fuerza: ["Eres fuerte en los duelos: ganas balones divididos.", "En el contacto, baja el cuerpo, pon el brazo y aguanta sin hacer falta."],
    salto: ["Saltas bien: ganas los balones aéreos.", "Calcula dónde caerá el balón y salta antes que el rival, con impulso de brazos."],
    coordinacion: ["Te coordinas bien: llegas bien colocado a cada acción.", "Antes de golpear o recibir, da pasos cortos para ajustar tus apoyos."],
    concentracion: ["Estás concentrado todo el partido: eres fiable.", "Con el balón lejos, sigue mirando la jugada; si te distraes, di tu palabra clave y vuelve."],
    volver: ["Después de un error vuelves rápido: el error no te para.", "Después de un error, haz tu gesto, di tu palabra y ponte en la próxima jugada."],
    indicaciones: ["Escuchas y aplicas las indicaciones: aprendes rápido.", "Antes de cada ejercicio, repite para ti en qué tienes que fijarte y llévalo a la primera jugada."],
    comunicacion: ["Hablas con tus compañeros: el equipo juega más ordenado.", "Avisa a tu compañero de lo que él no ve: «solo», «hombre», «gira»."],
    esfuerzo: ["Te esfuerzas en cada acción: eres un ejemplo para el equipo.", "Termina cada acción hasta el final: volver, ofrecerte, presionar."],
    nervios: ["Gestionas bien los nervios: juegas igual en los partidos importantes.", "Antes del partido y en las pausas, respira despacio y piensa solo en lo que tienes que mirar."],
    liderazgo: ["Ayudas a tus compañeros: el equipo te sigue.", "Cuando un compañero falle, dile una palabra de ánimo y señálale la próxima jugada."],
    respeto: ["Juegas limpio y respetas a todos: es lo que nos hace equipo.", "Después de una falta o un error, levanta la mano, ayuda y vuelve a la jugada sin protestar."]
  };
  return { ETAPAS: ETAPAS, PUESTOS: PUESTOS, ASPECTOS: ASPECTOS, ESTIMULOS: ESTIMULOS, MENSAJES: MENSAJES };
})();
