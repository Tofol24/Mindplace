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
      ids:["quien_conduce","la_manada","modelo_atencional"] },
    { emoji:"🫁", label:"Práctica AIS", desc:"Parar y llevar la atención adentro, en el momento.",
      img:"tools-standalone/assets/editorial/ais-curiosidad.webp",
      ids:["ais_basicas","ais_curiosidad","acompanar_sensacion","ais_amor","ais_muscular","mapa_atencion_interna","honestidad_emocional","protocolo_ais","herramienta_diaria"] },
    { emoji:"🔍", label:"Check-in rápido", desc:"¿Dónde está tu atención ahora mismo? Si ya lo sabes, regístralo y practica; si no, deja que el detective lo deduzca.",
      img:"tools-standalone/assets/editorial/mapa-interno.webp",
      ids:["estado_mono","donde_esta_mono"] },
    { emoji:"🧯", label:"Parar y regular impulsos", desc:"Cuando te notas en alerta o a punto de reaccionar.",
      img:"tools-standalone/assets/editorial/ais-amor.webp",
      ids:["bajar_alerta","control_ira","estoy_aqui_conmigo"] },
    { emoji:"🪜", label:"Superar miedos", desc:"Exposición gradual, paso a paso.",
      ids:["escalera_exposicion","cuerpo_en_alerta"] },
    { emoji:"💼", label:"Trabajo", desc:"Sostener el día laboral sin arrastrar el cuerpo.",
      ids:["retorno_trabajo","toco_desde_dentro"] },
    { emoji:"🚵", label:"Deporte", desc:"Rendir acompañando el cuerpo, no castigándolo.",
      ids:["pedalea_desde_dentro"] },
    { emoji:"🧸", label:"Peques y familias", desc:"Para acompañar a niñas y niños.",
      ids:["cuento_familia","tiempo_limite","exploradora_valiente","ritual_calma","rincon_calma"] },
    { emoji:"📊", label:"Autoevaluación y seguimiento", desc:"Ver cómo evolucionas (L/D/C) y registrar tu semana.",
      img:"tools-standalone/assets/editorial/herramienta-diaria.webp",
      ids:["cuestionario_tec","screening_tec","brujula_valores","agenda_atencional","tracker_ais","tracker_tec"] },
    { emoji:"🎬", label:"Las historias, animadas", desc:"Las tres reflexiones base en versión animada y narrada, de un minuto cada una. Son las mismas de «Empieza por aquí», en vídeo, para verlas con calma o compartirlas.",
      ids:["historia_animada","historia_manada","historia_control"] },
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
        <a class="hs-video" href="#/tool/historia_animada"><span class="hv-ic">🎬</span><span class="hv-t">Ver la historia animada<small>Versión narrada, en un minuto</small></span><span class="hv-play">▶</span></a>
        <div class="hs-quien">
          <p class="hs-quien-t"><b>Primero, lo esencial: ¿quién es el mono y quién eres tú?</b></p>
          <div class="hs-quien-2">
            <div class="hs-q hs-q-mono"><div class="hs-q-h">🐒 El mono</div><div class="hs-q-x">Es tu parte más animal: tu <b>cuerpo</b>, tu <b>niño/a interior</b>, la parte mamífera que siente y reacciona <b>antes de que te des cuenta</b>. Pero no es solo biología: también es la <b>vulnerabilidad que no pudo integrarse en tu manada segura</b> —tu familia, tus vínculos de apego—. En la infancia o la adolescencia hubo vivencias que no tuviste las condiciones para acompañar, y quedaron guardadas en él.</div></div>
            <div class="hs-q hs-q-yo"><div class="hs-q-h">🧭 Tú</div><div class="hs-q-x">Eres una <b>conciencia</b>: una idea de «yo» construida a partir de lo que has vivido, capaz de <b>tomar perspectiva</b> y observar a tu propio organismo funcionar por su cuenta. Tú puedes mirar al mono; el mono no puede mirarse a sí mismo. Entonces tu conciencia <b>aún no estaba</b> para acompañarlo, validarlo y darle espacio. <b>Ahora sí estás: ahora puedes.</b></div></div>
          </div>
          <p class="hs-quien-b"><b>Tú no eres el mono</b>: eres quien puede acompañarlo y llevar el volante. Con esto en mente, la metáfora del coche cobra sentido:</p>
        </div>
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

  // ============================================================
  //  Continuidad AIS · racha de presencia + recordatorio (offline)
  //  Todo en localStorage; nada sale del dispositivo.
  // ============================================================
  const CONT_KEY = "aprens_cont";
  function _isoDay(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function loadCont(){ try{ return JSON.parse(localStorage.getItem(CONT_KEY)) || {dias:[],recHora:null}; }catch(e){ return {dias:[],recHora:null}; } }
  function saveCont(c){ try{ localStorage.setItem(CONT_KEY, JSON.stringify(c)); }catch(e){} }
  function registrarPractica(){
    const c = loadCont(); const hoy = _isoDay(new Date());
    if(c.dias[c.dias.length-1] !== hoy){ c.dias.push(hoy); if(c.dias.length>400) c.dias = c.dias.slice(-400); saveCont(c); }
  }
  function _diaMenos(iso, n){ const p=iso.split("-").map(Number); const dt=new Date(p[0],p[1]-1,p[2]); dt.setDate(dt.getDate()-n); return _isoDay(dt); }
  function calcRacha(dias){
    if(!dias.length) return 0;
    const set = new Set(dias); const hoy=_isoDay(new Date()); const ayer=_diaMenos(hoy,1);
    let cursor;
    if(set.has(hoy)) cursor=hoy; else if(set.has(ayer)) cursor=ayer; else return 0;
    let n=0; while(set.has(cursor)){ n++; cursor=_diaMenos(cursor,1); } return n;
  }
  function diasDesde(dias){
    if(!dias.length) return Infinity;
    const ultimo = dias[dias.length-1]; const hoy=_isoDay(new Date());
    let n=0, cur=hoy; while(cur!==ultimo && n<400){ n++; cur=_diaMenos(hoy,n); } return n;
  }
  const CTA_POR_FOCO = { L:"bajar_alerta", D:"honestidad_emocional", C:"herramienta_diaria" };
  function toolSugerido(){
    const id = CTA_POR_FOCO[focoPauta] || "herramienta_diaria";
    const t = (window.APRENS_TOOLS||[]).find(x=>x.id===id);
    return t ? {id:t.id, nombre:t.nombre, emoji:t.emoji} : {id:"herramienta_diaria", nombre:"Herramienta diaria", emoji:"🧡"};
  }
  function continuidadHTML(){
    const c = loadCont(); const racha = calcRacha(c.dias); const desde = diasDesde(c.dias);
    const hoyHecho = c.dias[c.dias.length-1] === _isoDay(new Date());
    const sug = toolSugerido();
    let estado, cta = true;
    if(hoyHecho){
      estado = `<b>Hoy ya has estado contigo.</b> Cada día que vuelves, la presencia interna se automatiza un poco más.`;
      cta = false;
    } else if(racha>0){
      estado = `Llevas <b>${racha} ${racha===1?"día":"días"} seguidos</b>. Aún no has bajado hoy — un minuto basta para no soltar el hilo.`;
    } else if(c.dias.length){
      estado = `Hace <b>${desde} ${desde===1?"día":"días"}</b> que no practicas. La presencia se entrena <b>volviendo</b>, no siendo perfecta. ¿Un minuto ahora?`;
    } else {
      estado = `La constancia es lo que interioriza el AIS. <b>Empieza hoy tu racha de presencia</b> — un minuto basta.`;
    }
    const fuego = racha>0 ? `<div class="cont-racha"><span class="cont-fuego">🔥</span><span class="cont-num">${racha}</span><span class="cont-lbl">${racha===1?"día":"días"}<br>seguidos</span></div>` : "";
    const ctaHTML = cta ? `<a class="cont-cta" href="#/tool/${sug.id}">${sug.emoji} Practicar ahora · ${sug.nombre} →</a>` : "";
    const rec = c.recHora
      ? `<button class="cont-rec on" id="contRecBtn">🔔 Recordatorio diario a las ${c.recHora} · cambiar</button>`
      : `<button class="cont-rec" id="contRecBtn">🔔 Recordarme a diario</button>`;
    return `<section class="cont">
      <div class="cont-top">
        ${fuego}
        <div class="cont-body">
          <div class="cont-h">Tu presencia, cada día</div>
          <div class="cont-txt">${estado}</div>
          ${ctaHTML}
        </div>
      </div>
      <div class="cont-rec-wrap">
        ${rec}
        ${c.recHora?`<div class="cont-rec-hint">Te avisa el <b>calendario de tu móvil</b> a las ${c.recHora} —no la app. ¿No te llega? Vuelve a pulsar «Añadir a mi calendario» y confirma <b>«Añadir»</b> en el aviso de tu móvil.</div>`:""}
        <div class="cont-rec-panel" id="contRecPanel" hidden>
          <label>Hora <input type="time" id="contRecHora" value="${c.recHora||"20:00"}"></label>
          <a class="cont-rec-add" id="contRecAdd" href="#" target="_blank" rel="noopener">Añadir a mi calendario</a>
          <div class="cont-rec-note">Al pulsar, se abre el <b>calendario</b> con el evento diario: pulsa <b>«Añadir»</b> (en iPhone, arriba a la derecha). A partir de ahí es <b>tu calendario</b> quien te avisa cada día a esa hora —APRENS no envía avisos por sí solo—. La hora se ajusta al <b>cuarto de hora</b> más cercano.<br><span class="cont-rec-alt">¿No se abre el calendario? Ponte una alarma diaria en la app <b>Reloj</b> a esa hora.</span></div>
        </div>
      </div>
    </section>`;
  }
  // Recordatorio diario = archivo .ics REAL alojado (uno por cada cuarto de hora),
  // servido con Content-Type text/calendar. Es lo único fiable en iPhone (Safari y
  // app instalada): al abrirlo, iOS ofrece "Añadir al calendario". El data: URI no
  // funciona en iOS. Ajustamos la hora elegida al cuarto de hora más cercano.
  function snapCuarto(hhmm){
    const p=(hhmm||"20:00").split(":").map(Number);
    let h=p[0]||0, m=Math.round((p[1]||0)/15)*15;
    if(m===60){ m=0; h=(h+1)%24; }
    const pad=(n)=>String(n).padStart(2,"0");
    return { hhmm: pad(h)+":"+pad(m), file: pad(h)+pad(m) };
  }
  function urlICS(hhmm){ return "assets/ics/"+snapCuarto(hhmm).file+".ics"; }
  const ES_IOS = /iP(ad|hone|od)/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && (navigator.maxTouchPoints||0) > 1);
  function wireCont(){
    const btn=document.getElementById("contRecBtn"), panel=document.getElementById("contRecPanel");
    if(btn && panel){ btn.onclick=()=>{ panel.hidden=!panel.hidden; }; }
    const add=document.getElementById("contRecAdd"), hora=document.getElementById("contRecHora");
    // En móvil (sobre todo iOS) abrir el .ics en el navegador para que el sistema
    // ofrezca "Añadir al calendario"; en escritorio, descargar el archivo.
    if(add){ if(ES_IOS){ add.removeAttribute("download"); } else { add.setAttribute("download","recordatorio-aprens.ics"); } }
    function refresh(){ if(add){ add.href=urlICS((hora&&hora.value)||"20:00"); } }
    if(hora){ hora.addEventListener("input", refresh); hora.addEventListener("change", refresh); }
    refresh();
    if(add){ add.addEventListener("click", ()=>{
      const c=loadCont(); c.recHora=snapCuarto((hora&&hora.value)||"20:00").hhmm; saveCont(c);
      if(!ES_IOS) setTimeout(renderHub, 1500);
    }); }
  }

  // «La teoría, en vídeo»: tres vídeos breves con el profesional (portada del hub)
  function teoriaVideosHTML(){
    const vids=[
      ["video-tec.mp4","La Teoría del Efecto Consciente"],
      ["video-sobrepensamiento.mp4","El sobrepensamiento"],
      ["video-cerebro.mp4","Cómo funciona tu cerebro"]
    ];
    const cards=vids.map(([src,label])=>{
      const poster="/assets/video/"+src.replace("video-","poster-").replace(".mp4",".png");
      return `<figure style="margin:0;text-align:center">
      <video controls playsinline preload="none" poster="${poster}" style="width:100%;aspect-ratio:9/16;object-fit:contain;display:block;background:#000;border-radius:14px;box-shadow:0 8px 26px rgba(70,60,40,.14)"><source src="/assets/video/${src}" type="video/mp4"></video>
      <figcaption style="font-size:12px;color:#6e746c;margin:6px 0 0;line-height:1.3">▶ ${label}</figcaption></figure>`;
    }).join("");
    return `<div class="hub-sec"><span class="hub-sec-e">🎬</span><span class="hub-sec-t">La teoría, en vídeo</span></div>
      <div class="hub-sec-d">Tres vídeos breves con Tòfol Villalonga para entender lo esencial. Puedes verlos con calma.</div>
      <div class="hub-grid">${cards}</div>`;
  }

  // «El recorrido»: las piezas narrativas del método (Fase 1 → Fase 2), en orden.
  // Sección aditiva; los vídeos se cargan bajo demanda (el SW no los precachea).
  function recorridoHTML(){
    const vids=[
      ["video-cuerpo.mp4","El día que tu cuerpo empezó a notarte","aparecer"],
      ["video-respirar.mp4","Respirar es aparecer","cómo se lo dices a tu cuerpo"],
      ["video-pregunta.mp4","La pregunta que casi nunca nos hacemos","permanecer"],
      ["video-yo.mp4","El yo que se construyó sin ti","volver a por quien dejaste fuera"],
      ["video-quedarte.mp4","Aprender a quedarte","la práctica: permanecer"],
      ["video-sentir.mp4","Sentir conscientemente","el porqué de la práctica AIS"]
    ];
    const cards=vids.map(([src,label,sub],i)=>{
      const poster="/assets/video/"+src.replace("video-","poster-").replace(".mp4",".jpg");
      return `<figure style="margin:0;text-align:center">
      <video controls playsinline preload="none" poster="${poster}" style="width:100%;aspect-ratio:9/16;object-fit:contain;display:block;background:#000;border-radius:14px;box-shadow:0 8px 26px rgba(70,60,40,.14)"><source src="/assets/video/${src}" type="video/mp4"></video>
      <figcaption style="font-size:12px;color:#6e746c;margin:6px 0 0;line-height:1.35"><b style="color:#516b5a">${i+1}.</b> ${label}<br><span style="font-style:italic;opacity:.85">${sub}</span></figcaption></figure>`;
    }).join("");
    return `<div class="hub-sec"><span class="hub-sec-e">🌱</span><span class="hub-sec-t">El recorrido · de aparecer a permanecer</span></div>
      <div class="hub-sec-d">Las piezas narrativas del método, para verlas en orden y con calma. No son ejercicios: son el hilo que da sentido a la práctica.</div>
      <div class="hub-grid">${cards}</div>`;
  }

  function porqueHTML(){
    return `
      <section class="porque">
        <div class="pq-tit">¿Para qué sirven estos ejercicios?</div>
        <p class="pq-lead">No buscan que te entiendas mejor, sino que aprendas <b>una nueva relación contigo</b>. Con la <b>Atención Interna Sensorial (AIS)</b> entrenas algo sencillo y profundo: parar, y llevar tu atención a lo que siente tu cuerpo — no para quitarlo, ni calmarlo, ni siquiera entenderlo, sino <b>para estar con ello</b>.</p>
        <div class="pq-sello">«Pase lo que pase dentro de mí, yo voy a estar aquí conmigo.»</div>
        <details class="pq-more"><summary>Leer el porqué completo</summary>
          <div class="pq-full">
            <p>La reconstrucción personal no se queda en entenderte, analizarte o saber por qué eres como eres. Tiene que convertirse en una <b>nueva relación contigo mismo</b>.</p>
            <p>Por eso trabajamos la <b>Atención Interna Sensorial (AIS)</b>: parar y llevar conscientemente tu atención hacia lo que está sintiendo tu cuerpo. No para quitar la sensación. No para tranquilizarla. Ni siquiera para entenderla. <b>Simplemente para estar con ella.</b></p>
            <p>Cada vez que haces AIS entrenas algo muy profundo: que, sea cual sea la sensación que aparezca —miedo, vacío, tristeza, tensión, inseguridad—, tú permanezcas ahí con ella. Es una forma de decirle a tu cuerpo, sin palabras: <i>«No necesito que estés bien para estar contigo. Estoy aquí también cuando duele».</i></p>
            <p>Y esto no ocurre porque un día lo entiendas: ocurre <b>por repetición</b>. Poco a poco, tu cuerpo comprueba que no lo abandonas cuando aparecen sensaciones difíciles, hasta que empieza a <b>confiar en ti</b>.</p>
            <p>Ese es el objetivo: <b>acompañar y querer a tu cuerpo desde el sentir</b>, sea cual sea la sensación. Comprenderte será importante. Pero la transformación llega cuando tu cuerpo empieza a experimentar, una y otra vez, algo distinto: <i>«Pase lo que pase dentro de mí, yo voy a estar aquí conmigo».</i></p>
            <p>La terapia es un entrenamiento. La atención, como un músculo, se fortalece cada vez que la pones. No desde la razón, ni el análisis, ni el «por qué». Simplemente: <b>sentir conscientemente</b>.</p>
          </div>
        </details>
      </section>`;
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
      ${porqueHTML()}
      ${continuidadHTML()}
      ${focoBanner}
      ${teoriaVideosHTML()}
      ${recorridoHTML()}
      ${historiaHTML()}
      ${secciones}
      ${docsHTML()}
      <div class="aviso" style="margin-top:18px">🔒 Todo se guarda solo en tu dispositivo. Nada se envía sin que tú lo decidas.</div>`;
    wireCont();
  }

  function renderTool(id){
    const tool = (window.APRENS_TOOLS||[]).find(t=>t.id===id);
    if(!tool || !tool.migrada){ location.hash = "#/"; return; }
    registrarPractica();
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

  // Rastro de navegación en la app (para "← Atrás" paso a paso).
  const trail = [];
  let goingBack = false;

  function route(){
    const h = location.hash || "#/";
    // Cada navegación reinicia el gancho de "atrás interno"; la herramienta lo
    // vuelve a poner si tiene pantallas propias por las que retroceder.
    window.APRENS_toolBack = null;
    if(goingBack){ goingBack = false; }
    else if(trail[trail.length-1] !== h){ trail.push(h); }
    const m = h.match(/^#\/tool\/([\w-]+)/);
    if(m) renderTool(m[1]); else renderHub();
    backBtn.textContent = "← Atrás";
  }

  function goHome(){ if((location.hash||"#/") !== "#/") location.hash = "#/"; }
  // El logo/título lleva siempre al inicio.
  const brand = document.querySelector(".header .hlogo");
  if(brand){ brand.style.cursor = "pointer"; brand.setAttribute("role","button"); brand.setAttribute("aria-label","Inicio"); brand.onclick = goHome; }
  const brandTitle = document.getElementById("htitle");
  if(brandTitle){ brandTitle.style.cursor = "pointer"; brandTitle.onclick = goHome; }

  backBtn.onclick = () => {
    // 1) Herramienta como módulo en la ventana principal: que retroceda en sus pantallas.
    if(typeof window.APRENS_toolBack === "function" && window.APRENS_toolBack() === true) return;
    // 1b) Herramienta en iframe (mismo origen): consulta su gancho interno de "atrás".
    //     Así el botón de la cabecera retrocede paso a paso también dentro del iframe.
    const fr = screen.querySelector("iframe.tool-frame");
    if(fr && fr.contentWindow){
      try{
        const h = fr.contentWindow.APRENS_toolBack;
        if(typeof h === "function" && h() === true) return;
      }catch(e){ /* si por lo que sea no es accesible, seguimos */ }
    }
    // 2) Si no, retrocede un paso en la app (a la herramienta anterior); o al inicio.
    if(trail.length > 1){ trail.pop(); goingBack = true; location.hash = trail[trail.length-1]; }
    else { location.hash = "#/"; }
  };
  window.addEventListener("hashchange", route);
  route();
})();
