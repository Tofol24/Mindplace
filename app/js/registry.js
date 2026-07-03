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

  // --- Pendientes de portar (reutilizarán su CFG/lógica actual) ---
  { id:"screening_tec",       emoji:"🧭", nombre:"Screening TEC",        desc:"Cribado inicial.", migrada:false },
  { id:"agenda_atencional",   emoji:"🗓️", nombre:"Agenda atencional",     desc:"Foco, sobrepensamiento y acción por franjas.", migrada:false },
  { id:"ais_curiosidad",      emoji:"🌱", nombre:"AIS curiosidad",        desc:"Entrenamiento sensorial desde la curiosidad.", migrada:false },
  { id:"mapa_atencion_interna", emoji:"🫀", nombre:"Mapa interno",        desc:"Cuerpo como mapa: zonas y sensaciones.", migrada:false },
  { id:"brujula_valores",     emoji:"🧭", nombre:"Brújula de valores",    desc:"Actuar en dirección a lo que importa.", migrada:false },
  { id:"bajar_la_alerta",     emoji:"🫁", nombre:"Bajar la alerta",       desc:"Regular la activación.", migrada:false },
  { id:"acompanar_sensacion", emoji:"🤝", nombre:"Acompañar la sensación", desc:"Estar con lo que se siente, sin controlarlo.", migrada:false }
];
