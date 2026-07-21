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
    desc:"¿Dónde está tu mono ahora? Check-in y AIS.", migrada:true },
  { id:"donde_esta_mono", emoji:"🔍", nombre:"¿Dónde está el mono?",
    desc:"El detective: adivina dónde llevas al mono y qué hacer.", migrada:true },
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
    migrada:true, iframe:"ritual/index.html" }

  // --- Pendientes de portar (reutilizarán su CFG/lógica actual) ---
];
