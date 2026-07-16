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

  function removeExportBar(){ const b=document.getElementById("aprensBar"); if(b) b.remove(); }

  function renderHub(){
    removeExportBar();
    screen.classList.remove("iframe-host");
    backBtn.style.display = "none";
    titleEl.textContent = "APRENS";
    const tools = window.APRENS_TOOLS || [];
    const cards = tools.map(t=>{
      if(!t.migrada){
        return `<div class="hub-card soon"><span class="hub-emoji">${t.emoji}</span>
          <span class="hub-name">${t.nombre}</span><span class="hub-desc">${t.desc}</span>
          <span class="hub-tag soon">Próximamente</span></div>`;
      }
      return `<a class="hub-card" href="#/tool/${t.id}"><span class="hub-emoji">${t.emoji}</span>
        <span class="hub-name">${t.nombre}</span><span class="hub-desc">${t.desc}</span>
        <span class="hub-tag">Abrir →</span></a>`;
    }).join("");

    const focoBanner = focoPauta && ["L","D","C"].includes(focoPauta)
      ? `<div class="aviso" style="margin-bottom:16px">🎯 <b>Foco de esta semana:</b> ${({L:"Latencia",D:"Densidad",C:"Continuidad"})[focoPauta]}. Tu psicólogo/a te ha pautado prestar atención especial a este parámetro.</div>`
      : "";

    screen.innerHTML = `
      <div class="hero">
        <div class="htitulo">Tus herramientas</div>
        <div class="hsubt">Acompañar la sensación interna, ampliar la latencia antes de responder y actuar desde tus valores. Elige por dónde empezar hoy.</div>
      </div>
      ${focoBanner}
      <div class="hub-grid">${cards}</div>
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
