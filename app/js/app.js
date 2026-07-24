/* ============================================================
   APRENS · Shell de la app (hub + router)  MVP1
   ------------------------------------------------------------
   · Una sola SPA → un solo aprens_db para todo el paciente.
   · Router por hash: #/ = hub ; #/tool/<id> = herramienta.
   · Conserva la pauta por URL (?foco=L|D|C) que ya usa el hub actual.
   ============================================================ */
(function () {
  const screen = document.getElementById("screen");
  const backBtn = document.getElementById("hback");
  const titleEl = document.getElementById("htitle");

  // Foco de la semana (pauta): ?foco=L|D|C  (se conserva entre navegaciones)
  const focoPauta = (new URLSearchParams(location.search).get("foco") || "").toUpperCase();

  // Agrupación del hub por tipo/tema (fuente única). Cada herramienta se lista
  // por su id en el grupo que le corresponde; las no listadas caen en "Otras".
  const GRUPOS = [
    { emoji:"🫁", label:"Práctica AIS", desc:"Parar y llevar la atención adentro, en el momento.",
      ids:["ais_curiosidad","acompanar_sensacion","ais_amor","ais_muscular","mapa_atencion_interna","honestidad_emocional","protocolo_ais","herramienta_diaria"] },
    { emoji:"🔍", label:"Check-in rápido", desc:"¿Dónde está tu atención ahora mismo?",
      ids:["estado_mono","donde_esta_mono"] },
    { emoji:"🧯", label:"Parar y regular impulsos", desc:"Cuando te notas en alerta o a punto de reaccionar.",
      ids:["bajar_alerta","control_ira","estoy_aqui_conmigo"] },
    { emoji:"🪜", label:"Superar miedos", desc:"Exposición gradual, paso a paso.",
      ids:["escalera_exposicion"] },
    { emoji:"💼", label:"Trabajo", desc:"Sostener el día laboral sin arrastrar el cuerpo.",
      ids:["retorno_trabajo","toco_desde_dentro"] },
    { emoji:"🚵", label:"Deporte", desc:"Rendir acompañando el cuerpo, no castigándolo.",
      ids:["pedalea_desde_dentro"] },
    { emoji:"🧸", label:"Peques y familias", desc:"Para acompañar a niñas y niños.",
      ids:["cuento_familia","exploradora_valiente","ritual_calma","rincon_calma"] },
    { emoji:"📊", label:"Autoevaluación y seguimiento", desc:"Ver cómo evolucionas (L/D/C) y registrar tu semana.",
      ids:["cuestionario_tec","screening_tec","brujula_valores","agenda_atencional","tracker_ais","tracker_tec"] }
  ];

  function removeExportBar(){ const b=document.getElementById("aprensBar"); if(b) b.remove(); }

  function hubCard(t){
    if(!t.migrada){
      return `<div class="hub-card soon"><span class="hub-emoji">${t.emoji}</span>
        <span class="hub-name">${t.nombre}</span><span class="hub-desc">${t.desc}</span>
        <span class="hub-tag soon">Próximamente</span></div>`;
    }
    return `<a class="hub-card" href="#/tool/${t.id}"><span class="hub-emoji">${t.emoji}</span>
      <span class="hub-name">${t.nombre}</span><span class="hub-desc">${t.desc}</span>
      <span class="hub-tag">Abrir →</span></a>`;
  }

  function renderHub(){
    removeExportBar();
    screen.classList.remove("iframe-host");
    backBtn.style.display = "none";
    titleEl.textContent = "APRENS";
    const tools = window.APRENS_TOOLS || [];
    const byId = {}; tools.forEach(t=>{ byId[t.id]=t; });
    const usados = {};

    let secciones = "";
    GRUPOS.forEach(g=>{
      const gtools = g.ids.map(id=>byId[id]).filter(Boolean);
      if(!gtools.length) return;
      gtools.forEach(t=>{ usados[t.id]=1; });
      secciones += `<div class="hub-sec"><span class="hub-sec-e">${g.emoji}</span><span class="hub-sec-t">${g.label}</span></div>
        <div class="hub-sec-d">${g.desc}</div>
        <div class="hub-grid">${gtools.map(hubCard).join("")}</div>`;
    });
    const otras = tools.filter(t=>!usados[t.id]);
    if(otras.length){
      secciones += `<div class="hub-sec"><span class="hub-sec-e">🧩</span><span class="hub-sec-t">Otras</span></div>
        <div class="hub-grid">${otras.map(hubCard).join("")}</div>`;
    }

    const focoBanner = focoPauta && ["L","D","C"].includes(focoPauta)
      ? `<div class="aviso" style="margin-bottom:16px">🎯 <b>Foco de esta semana:</b> ${({L:"Latencia",D:"Densidad",C:"Continuidad"})[focoPauta]}. Tu psicólogo/a te ha pautado prestar atención especial a este parámetro.</div>`
      : "";

    screen.innerHTML = `
      <div class="hero">
        <div class="htitulo">Tus herramientas</div>
        <div class="hsubt">Ordenadas por para qué sirven. Elige por dónde empezar hoy.</div>
      </div>
      ${focoBanner}
      ${secciones}
      <div class="aviso" style="margin-top:18px">🔒 Todo se guarda solo en tu dispositivo. Nada se envía sin que tú lo decidas.</div>`;
  }

  function renderTool(id){
    const tool = (window.APRENS_TOOLS||[]).find(t=>t.id===id);
    if(!tool || !tool.migrada){ location.hash = "#/"; return; }
    removeExportBar();
    backBtn.style.display = "inline-flex";
    titleEl.textContent = tool.nombre;
    screen.innerHTML = "";
    screen._aprensRec = null;

    // Herramientas grandes/legacy integradas como standalone (iframe, mismo origen)
    if(tool.iframe){
      screen.classList.add("iframe-host");
      const f = document.createElement("iframe");
      f.className = "tool-frame";
      f.title = tool.nombre;
      f.src = tool.iframe;
      screen.appendChild(f);
      return;
    }

    screen.classList.remove("iframe-host");
    const mod = window["APRENS_TOOL_"+id];
    if(!mod){ location.hash = "#/"; return; }
    mod.mount(screen);
  }

  function route(){
    const h = location.hash || "#/";
    const m = h.match(/^#\/tool\/([\w-]+)/);
    if(m) renderTool(m[1]); else renderHub();
  }

  backBtn.onclick = () => { location.hash = "#/"; };
  window.addEventListener("hashchange", route);
  route();
})();
