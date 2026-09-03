/* ============================================================
   APRENS · Registro de herramientas (MVP1)
   ------------------------------------------------------------
   Fuente única de verdad para el hub y el router.
   - migrada:true  → tiene módulo en /js/tools/<id>.js con export mount()
   - migrada:false → aparece en el hub como "próximamente" (pendiente de portar)

   Para migrar una herramienta: crea /js/tools/<id>.js siguiendo el patrón de
   cuestionario-tec.js (reutiliza su CFG actual tal cual) y pon migrada:true.
   ============================================================ */
window.APRENS_TOOLS = [
  { id:"cuestionario_tec", emoji:"📝", nombre:"Cuestionario TEC",
    desc:"Cómo va tu presencia interna esta semana (L/D/C).", migrada:true },
  { id:"estado_mono", emoji:"🐒", nombre:"Estado del mono",
    desc:"Ya sabes cómo estás: márcalo y practica el AIS ahí mismo (respiración de 60 s y seguimiento del día a día).", migrada:true },
  { id:"donde_esta_mono", emoji:"🔍", nombre:"¿Dónde está el mono?",
    desc:"¿No sabes cómo estás? Cuéntalo con tus palabras y el detective deduce dónde llevas al mono y qué herramienta usar.", migrada:true },
  { id:"agenda_atencional", emoji:"🗓️", nombre:"Agenda atencional",
    desc:"Tu semana franja a franja: foco, sobrepensamiento y valores.",
    migrada:true, iframe:"tools-standalone/agenda-atencional.html" },
  { id:"ais_curiosidad", emoji:"🌱", nombre:"AIS curiosidad",
    desc:"Explorar el cuerpo por dentro con curiosidad (linterna interior).",
    migrada:true, iframe:"tools-standalone/ais-curiosidad.html" },
  { id:"bajar_alerta", emoji:"🫁", nombre:"Bajar la alerta",
    desc:"4 pasos para volver al aquí y ahora cuando te notas en alerta.",
    migrada:true, iframe:"tools-standalone/bajar-alerta.html" },
  { id:"brujula_valores", emoji:"🧭", nombre:"Brújula de valores",
    desc:"Tus áreas vitales: qué te importa y con qué forma estás ahí (ACT).",
    migrada:true, iframe:"tools-standalone/brujula-valores.html" },
  { id:"acompanar_sensacion", emoji:"🤝", nombre:"Acompañar la sensación",
    desc:"Paradas AIS: estar con lo que sientes sin luchar ni comprobar.",
    migrada:true, iframe:"tools-standalone/acompanar-sensacion.html" },
  { id:"ais_basicas", emoji:"🧰", nombre:"Herramientas AIS básicas",
    desc:"Las 6 herramientas base y las 3 anclas (cuello, pecho, barriga) para entrenar tu presencia cada día.",
    migrada:true, iframe:"tools-standalone/ais-basicas.html" },
  { id:"ais_amor", emoji:"🤍", nombre:"AIS desde el amor",
    desc:"Ejercicios cotidianos para acompañarte, no para controlarte.",
    migrada:true, iframe:"tools-standalone/ais-amor.html" },
  { id:"ais_muscular", emoji:"💪", nombre:"AIS muscular",
    desc:"Tensar y soltar (Jacobson): anclar la atención en el músculo, de la tensión a la distensión.",
    migrada:true, iframe:"tools-standalone/ais-muscular.html" },
  { id:"herramienta_diaria", emoji:"🌿", nombre:"Herramienta diaria",
    desc:"Tu práctica diaria de respiración, anclaje y presencia (vía respiración).",
    migrada:true, iframe:"tools-standalone/herramienta-diaria.html" },
  { id:"protocolo_ais", emoji:"🎧", nombre:"Protocolo AIS (audio)",
    desc:"Entrenar la atención hacia dentro por el oído: protocolo progresivo en 6 fases (vía auditiva).",
    migrada:true, iframe:"tools-standalone/protocolo-ais.html" },
  { id:"control_ira", emoji:"🔥", nombre:"Control de ira",
    desc:"Autorregistro posterior a un episodio de enfado o impulso. Para parar en caliente, «Bajar la alerta».",
    migrada:true, iframe:"tools-standalone/control-ira.html" },
  { id:"retorno_trabajo", emoji:"💼", nombre:"Retorno al trabajo",
    desc:"Volver al trabajo tras una baja, paso a paso y desde tus valores.",
    migrada:true, iframe:"tools-standalone/retorno-trabajo.html" },
  { id:"tracker_ais", emoji:"🧰", nombre:"Tracker AIS",
    desc:"Tu caja de herramientas AIS de la semana: seguimiento de prácticas.",
    migrada:true, iframe:"tools-standalone/tracker-ais.html" },
  { id:"tracker_tec", emoji:"📊", nombre:"Tracker TEC",
    desc:"Tu seguimiento de paradas y rutina diaria (TEC).",
    migrada:true, iframe:"tools-standalone/tracker-tec.html" },

  { id:"screening_tec", emoji:"🧪", nombre:"Screening TEC/AIS",
    desc:"Cribado inicial y seguimiento (L/D/C) con gráficas de evolución.",
    migrada:true, iframe:"tools-standalone/screening-tec.html" },

  { id:"evaluacion_trauma", emoji:"🧭", nombre:"Evaluación de trauma",
    desc:"Cribado y seguimiento de estrés postraumático (LEC-5 + PCL-5): el paciente responde desde el móvil y devuelve un código; el profesional obtiene el informe con criterios DSM-5 y propuesta de plan.",
    migrada:true, iframe:"tools-standalone/evaluacion-trauma.html" },

  { id:"mapa_atencion_interna", emoji:"🫀", nombre:"Mapa interno",
    desc:"El cuerpo como mapa: cuello, pecho y barriga (interocepción AIS).",
    migrada:true, iframe:"tools-standalone/mapa-interno.html" },

  { id:"honestidad_emocional", emoji:"🤍", nombre:"Honestidad emocional",
    desc:"Acompañar lo que sientes antes de explicarlo: sentir, describir, suspender el porqué, compartir y elegir (AIS).",
    migrada:true, iframe:"honestidad/index.html" },

  { id:"escalera_exposicion", emoji:"🪜", nombre:"La escalera (exposición)",
    desc:"Exposición en vivo gradual: tu escalera de peldaños y dos llaves en cada exposición, el QUÉ (conductual) y el CÓMO (acompañamiento interno AIS).",
    migrada:true, iframe:"exposicion/index.html" },

  { id:"exploradora_valiente", emoji:"🗺️", nombre:"La exploradora valiente",
    desc:"Juego infantil de exposición gradual para la ansiedad de separación (para madres y padres): escalera de misiones de valiente y dos llaves, el QUÉ y el CÓMO (co-regulación AIS).",
    migrada:true, iframe:"exploradora/index.html" },

  { id:"ritual_calma", emoji:"🌙", nombre:"Ritual diario · calma y atención",
    desc:"Pauta parental para regulación y rabietas: ritual diario de audios AIS, 3 normas y refuerzo, parada de pensamiento con respiración y grounding 5-4-3-2-1.",
    migrada:true, iframe:"ritual/index.html" },

  { id:"rincon_calma", emoji:"🧸", nombre:"Rincón de calma",
    desc:"Juegos infantiles cortos, visuales y lúdicos para practicar la calma: la flor y la vela (respiración), el abrazo sentido y el detective de sensaciones.",
    migrada:true, iframe:"rincon/index.html" },

  { id:"pedalea_desde_dentro", emoji:"🚵", nombre:"Pedalea desde dentro",
    desc:"Ciclismo de competición desde la tarea y el amor a la bici, no el látigo: pirámide de rendimiento (atención→…→resultado), entreno de montaña y continuidad, AIS hacia el dolor, látigo vs amor firme, banco de autoverbalizaciones para acompañar a tu cuerpo, modo prueba, revisión semanal y ICE. Nombre y diminutivo editables.",
    migrada:true, iframe:"tools-standalone/pedalea_desde_dentro_aprens.html" },

  { id:"estoy_aqui_conmigo", emoji:"🤍", nombre:"Estoy aquí conmigo",
    desc:"Para adolescentes: entrenar la presencia interna y el apego seguro con una misma tras una ruptura o cuando cuesta sostener la soledad. STOP, respiración de presencia, ¿deseo o alivio?, apego sano vs dependencia, registro y plan de apoyo (TEC–AIS).",
    migrada:true, iframe:"tools-standalone/estoy_aqui_conmigo_ais.html" },

  { id:"toco_desde_dentro", emoji:"🚪", nombre:"Toco desde dentro",
    desc:"Para trabajo comercial de puerta fría: respiración AIS antes de tocar, acompañar el cuerpo (no arrastrarlo), reencuadrar amenaza→reto, soltar los «no» y cerrar el día antes de llegar a casa para no arrastrar fatiga a la familia.",
    migrada:true, iframe:"tools-standalone/toco_desde_dentro_aprens.html" },

  { id:"cuento_familia", emoji:"🐨", nombre:"La familia de Koa (cuento)",
    desc:"Cuento ilustrado e interactivo para dormir (3 años, familia monoparental): muchas formas de familia y todas con amor, desde el apego seguro. Cada página con pregunta y gesto de apego, y una guía completa para mamá.",
    migrada:true, iframe:"tools-standalone/cuento_familia_aprens.html" },

  { id:"tiempo_limite", emoji:"⏱️", nombre:"El tiempo límite (peques)",
    desc:"Para madres y padres: enseñar a tu peque a empezar por sí mismo. Primero la honestidad emocional (compartir la sensación y pedir un abrazo, desde la complicidad y no la culpa), luego el entrenamiento del tiempo límite de 2 minutos, la tolerancia a la frustración sin ser rescatado y los límites claros. Bilingüe castellano/català.",
    migrada:true, iframe:"tools-standalone/tiempo_limite_peques.html" },

  { id:"peques_desbordamiento", emoji:"🌊", nombre:"Cuando todo se hace demasiado",
    desc:"Para familias con perfil TEA (9–12 años): acompañar el desbordamiento ante la frustración y los cambios, no «parar rabietas». Semáforo de capacidad, «primero yo» (regulación del adulto), qué necesita / qué le digo / hablo o espero, fuera de casa, entrenar en calma, entender lo que pasó y un plan familiar. Doble entrada niño/adulto. Modo tranquilo. Todo se guarda solo en el dispositivo.",
    migrada:true, iframe:"tools-standalone/cuando-todo-demasiado.html" },

  { id:"cuentos_nil", emoji:"📖", nombre:"Los cuentos de Nil",
    desc:"Tres cuentos visuales para peques (9–12) con perfil TEA: reconocer cuánto espacio (capacidad) queda por dentro, no «portarse bien». «No era así como tenía que pasar» (cambios), «Hoy todo pesaba más» (acumulación y fuera de casa) y «No salió como yo pensaba» (frustración social). Incluye «¿Y a mí qué me pasa?» para hacer tu propio mapa. Se lee en calma, no durante una crisis. Todo se guarda solo en el dispositivo.",
    migrada:true, iframe:"tools-standalone/cuentos/index.html" },

  { id:"fondos_frases", emoji:"🖼️", nombre:"Fondos de frases",
    desc:"Convierte una frase que te acompañe (de tus herramientas o la tuya) en el fondo de pantalla de tu móvil: elige frase y fondo, y guarda la imagen.",
    migrada:true, iframe:"tools-standalone/fondos_frases_aprens.html" },

  { id:"quien_conduce", emoji:"🧭", nombre:"¿Quién conduce tu vida?",
    desc:"La metáfora base de todo el trabajo: el mono y el coche. Quién es el mono y quién eres tú, las cuatro formas de conducir, y qué herramienta usar. Con audio guiado y versión animada.",
    migrada:true, iframe:"tools-standalone/quien-conduce.html" },
  { id:"la_manada", emoji:"🐾", nombre:"La manada (el porqué)",
    desc:"Por qué respiras: la metáfora base. Tu mono es un mamífero de manada; el AIS es el canal por el que tu conciencia se vuelve perceptible para él. Respirar no es relajarte: es volver a aparecer para tu mono, construir apego seguro y salir al mundo acompañado.",
    migrada:true, iframe:"tools-standalone/la_manada_aprens.html" },
  { id:"modelo_atencional", emoji:"🧠", nombre:"El control y la presencia",
    desc:"El mapa del malestar: por qué buscar el control (sobrepensar) sin espacio-tiempo deriva en ansiedad y depresión, y cómo la conciencia —parar y llevar la atención al cuerpo— abre la conducta asertiva. El porqué de entrenar el AIS.",
    migrada:true, iframe:"tools-standalone/modelo-atencional.html" },
  { id:"historia_animada", emoji:"🎬", nombre:"La historia del mono · animada",
    desc:"El cuento del mono y el coche en versión animada y narrada (voz del dispositivo), en un minuto.",
    migrada:true, iframe:"tools-standalone/historia-animada.html" },
  { id:"historia_manada", emoji:"🎬", nombre:"La manada · animada",
    desc:"El porqué de la respiración en versión animada y narrada (voz del dispositivo): tu mono es un mamífero de manada y respirar es volver a aparecer para él.",
    migrada:true, iframe:"tools-standalone/historia-manada.html" },
  { id:"historia_control", emoji:"🎬", nombre:"El control y la presencia · animada",
    desc:"El mapa del malestar en versión animada y narrada (voz del dispositivo): buscar el control (sobrepensar) frente a parar y volver al cuerpo.",
    migrada:true, iframe:"tools-standalone/historia-control.html" },

  { id:"cuerpo_en_alerta", emoji:"🌿", nombre:"Cuando el cuerpo sigue en alerta",
    desc:"Acompañamiento tras una experiencia traumática (accidente, agresión, amenaza): comprender la respuesta protectora, orientarse al presente, acompañar la activación con AIS, diferenciar recuerdo/alerta/peligro, recuperar territorio por valores, registro diario, mapa y plan de crisis. Botón «Necesito parar» siempre disponible (ACT · TEC · AIS).",
    migrada:true, iframe:"tools-standalone/cuerpo-en-alerta.html" }

  // --- Pendientes de portar (reutilizarán su CFG/lógica actual) ---
];
