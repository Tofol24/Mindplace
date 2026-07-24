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
    { emoji:"🐾", label:"Empieza por aquí · el porqué", desc:"La historia del mono y la metáfora de la manada: para qué respiras y para qué sirve todo esto. Son complementarios: léelos juntos.",
      ids:["la_manada"],
      pdfs:[{ emoji:"🧭", nombre:"¿Quién conduce tu vida?", desc:"La metáfora base del trabajo, la historia del mono (AIS · TEC).", url:"assets/pdf/quien-conduce-tu-vida.pdf" }] },
    { emoji:"🫁", label:"Práctica AIS", desc:"Parar y llevar la atención adentro, en el momento.",
      img:"tools-standalone/assets/editorial/ais-curiosidad.webp",
      ids:["ais_curiosidad","acompanar_sensacion","ais_amor","ais_muscular","mapa_atencion_interna","honestidad_emocional","protocolo_ais","herramienta_diaria"] },
    { emoji:"🔍", label:"Check-in rápido", desc:"¿Dónde está tu atención ahora mismo? Si ya lo sabes, regístralo y practica; si no, deja que el detective lo deduzca.",
      img:"tools-standalone/assets/editorial/mapa-interno.webp",
      ids:["estado_mono","donde_esta_mono"] },
    { emoji:"🧯", label:"Parar y regular impulsos", desc:"Cuando te notas en alerta o a punto de reaccionar.",
      img:"tools-standalone/assets/editorial/ais-amor.webp",
      ids:["bajar_alerta","control_ira","estoy_aqui_conmigo"] },
    { emoji:"🪜", label:"Superar miedos", desc:"Exposición gradual, paso a paso.",
      ids:["escalera_exposicion"] },
    { emoji:"💼", label:"Trabajo", desc:"Sostener el día laboral sin arrastrar el cuerpo.",
      ids:["retorno_trabajo","toco_desde_dentro"] },
    { emoji:"🚵", label:"Deporte", desc:"Rendir acompañando el cuerpo, no castigándolo.",
      ids:["pedalea_desde_dentro"] },
    { emoji:"🧸", label:"Peques y familias", desc:"Para acompañar a niñas y niños.",
      ids:["cuento_familia","tiempo_limite","exploradora_valiente","ritual_calma","rincon_calma"] },
    { emoji:"📊", label:"Autoevaluación y seguimiento", desc:"Ver cómo evolucionas (L/D/C) y registrar tu semana.",
      img:"tools-standalone/assets/editorial/herramienta-diaria.webp",
      ids:["cuestionario_tec","screening_tec","brujula_valores","agenda_atencional","tracker_ais","tracker_tec"] },
    { emoji:"🖼️", label:"Para llevar contigo", desc:"Convierte una frase en el fondo de pantalla de tu móvil.",
      ids:["fondos_frases"] }
  ];

  // Material transversal (documentos base, útiles para todas las herramientas)
  const DOCS = [
    { emoji:"🧰", nombre:"Herramientas AIS básicas", desc:"Las herramientas AIS básicas, para tenerlas siempre a mano.", url:"assets/pdf/eines-ais-basiques.pdf" }
  ];
  function pdfCard(d){
    return `<a class="hub-card" href="${d.url}" target="_blank" rel="noopener" download><span class="hub-emoji">${d.emoji}</span>
      <span class="hub-name">${d.nombre}</span><span class="hub-desc">${d.desc}</span><span class="hub-tag">PDF ↓</span></a>`;
  }
  function docsHTML(){
    if(!DOCS.length) return "";
    const cards = DOCS.map(pdfCard).join("");
    const intro = DOCS.length===1
      ? "Documento base, útil para todas las herramientas. Puedes verlo o descargarlo en PDF."
      : "Documentos base, útiles para todas las herramientas. Puedes verlos o descargarlos en PDF.";
    return `<div class="hub-sec"><span class="hub-sec-e">📄</span><span class="hub-sec-t">Material de apoyo</span></div>
      <div class="hub-sec-d">${intro}</div>
      <div class="hub-grid">${cards}</div>`;
  }

  // Historia del mono y el coche (relato → para qué → qué hacer), colapsable
  function historiaHTML(){
    return `<details class="hub-story" id="historia">
      <summary><span class="hs-i">📖</span>Antes de empezar: la historia del mono y el coche</summary>
      <div class="hs-body">
        <p>Esta es la idea que da sentido a todo lo demás. <b>Léela primero.</b></p>
        <p><b>A veces el mono coge el volante.</b> Una emoción intensa toma el control: pisa el acelerador buscando alivio, frena de golpe. Tu vida gira alrededor del alivio inmediato.</p>
        <p><b>Otras veces lo persigues para vencerlo.</b> Te exiges calma, te riñes por sentir. Pero el miedo no se calma a gritos: cuanto más lo persigues, más corre.</p>
        <p><b>Y a veces lo metes en el maletero.</b> Lo tapas con móvil, trabajo, comida… Pero lo que escondes no desaparece: solo espera.</p>
        <p><b>Hay otra forma:</b> sentarlo a tu lado y seguir conduciendo tú. Puedes escucharlo, mirarlo, acompañarlo… y mantener el volante en tus manos. <i>Amar al mono no es obedecerlo: es acompañarlo.</i></p>
        <div class="hs-quote">«El mono nunca quiso conducir. Solo necesitaba saber que no iba solo.»</div>
        <div class="hs-acts">
          <p class="hs-acts-t"><b>¿Y ahora? Según dónde lleves al mono hoy, una herramienta para acompañarlo:</b></p>
          <a class="hs-act" href="#/tool/bajar_alerta"><span class="se">🚗</span><span class="st">Si coge el volante (reaccionas por impulso)<small>Bajar la alerta · parar antes de actuar</small></span><span class="sarr">→</span></a>
          <a class="hs-act" href="#/tool/ais_amor"><span class="se">🏃</span><span class="st">Si lo persigues (te exiges, te riñes)<small>AIS desde el amor · acompañarte, no controlarte</small></span><span class="sarr">→</span></a>
          <a class="hs-act" href="#/tool/acompanar_sensacion"><span class="se">📦</span><span class="st">Si lo metes en el maletero (lo evitas)<small>Acompañar la sensación · estar con lo que sientes</small></span><span class="sarr">→</span></a>
          <a class="hs-act" href="#/tool/herramienta_diaria"><span class="se">🧡</span><span class="st">Para sentarlo a tu lado (cada día)<small>Herramienta diaria · tu práctica de presencia</small></span><span class="sarr">→</span></a>
        </div>
        <a class="hs-pdf" href="assets/pdf/quien-conduce-tu-vida.pdf" target="_blank" rel="noopener" download>📄 Leer la historia completa (PDF ilustrado)</a>
        <p class="hs-pdfnote">El cuento entero, con sus ilustraciones, para leerlo con calma siempre que quieras.</p>
        <div class="hs-bridge">
          <p><b>Solo necesitaba saber que no iba solo.</b> Y ahí está la pregunta de fondo: <i>¿por qué respirar cambia algo?</i> Porque tu mono es un mamífero de manada, y respirar no es relajarte — es <b>volver a aparecer para él</b>.</p>
          <a href="#/tool/la_manada">🐾 La manada · el porqué de la respiración y el AIS →</a>
        </div>
      </div>
    </details>`;
  }

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
      const gpdfs = g.pdfs || [];
      if(!gtools.length && !gpdfs.length) return;
      gtools.forEach(t=>{ usados[t.id]=1; });
      const cards = gtools.map(hubCard).join("") + gpdfs.map(pdfCard).join("");
      const secIco = g.img
        ? `<span class="hub-sec-thumb"><img src="${g.img}" alt="" loading="lazy"></span>`
        : `<span class="hub-sec-e">${g.emoji}</span>`;
      secciones += `<div class="hub-sec">${secIco}<span class="hub-sec-t">${g.label}</span></div>
        <div class="hub-sec-d">${g.desc}</div>
        <div class="hub-grid">${cards}</div>`;
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
      <div class="hub-welcome">
        <img src="tools-standalone/assets/editorial/acompanar-la-sensacion.webp" alt="" loading="eager">
        <div class="hub-welcome-copy">
          <div class="htitulo">Tus herramientas</div>
          <div class="hsubt">Ordenadas por para qué sirven. Elige por dónde empezar hoy.</div>
        </div>
      </div>
      ${focoBanner}
      ${historiaHTML()}
      ${secciones}
      ${docsHTML()}
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
