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

  return { ETAPAS: ETAPAS, PUESTOS: PUESTOS };
})();
