/* ============================================================
   APRENS · Herramienta: Cuestionario TEC  (portada a módulo SPA)
   ------------------------------------------------------------
   Reutiliza el bloque CFG y la LÓGICA DE SCORING originales SIN cambios
   semánticos (L/D/C, invert, bandas, foco, normalización 0-10).
   Cambios respecto al HTML suelto:
     · Encapsulado en un factory mount(container) para convivir con otras tools.
     · Usa el aprens-core ÚNICO de la app (un solo aprens_db para todo el paciente).
     · collect-on-export: solo persiste al exportar (respeta "no guarda nada").
   ============================================================ */
(function () {
  const CFG = {
    toolId: "cuestionario_tec",
    toolName: "Cuestionario TEC",
    titulo: "Cómo estoy esta semana",
    subtitulo: "Un repaso breve a cómo va tu entrenamiento de presencia interna. No es un examen: marca lo que sientas más cierto.",
    frase: "«Donde dirijo mi atención, ahí voy yo.»",
    escala: { labels: ["Nunca", "Casi nunca", "A veces", "A menudo", "Casi siempre"] }, // 0..4
    subescalas: {
      L: { nombre: "Latencia",    color: "L", desc: "espacio entre lo que siento y cómo respondo" },
      D: { nombre: "Densidad",    color: "D", desc: "presencia interna y regulación (AIS)" },
      C: { nombre: "Continuidad", color: "C", desc: "sostener el patrón y actuar según valores" }
    },
    items: [
      { id: "l1", sub: "L", texto: "Antes de responder a algo que me activa, consigo hacer una pausa." },
      { id: "l2", sub: "L", texto: "Reacciono de forma impulsiva y luego me arrepiento.", invert: true },
      { id: "l3", sub: "L", texto: "Cuando noto el primer aviso del cuerpo, paro a tiempo." },
      { id: "d1", sub: "D", texto: "He llevado la atención al cuerpo (cuello, pecho o barriga) durante el día." },
      { id: "d2", sub: "D", texto: "He podido nombrar lo que sentía sin justificarlo ni darle vueltas." },
      { id: "d3", sub: "D", texto: "Me he sentido desconectado/a de lo que ocurría por dentro.", invert: true },
      { id: "c1", sub: "C", texto: "He mantenido mis rutinas de presencia aunque no tuviera ganas." },
      { id: "c2", sub: "C", texto: "He actuado en la dirección de lo que me importa, no solo de cómo me sentía." },
      { id: "c3", sub: "C", texto: "Me he quedado atrapado/a en bucles de sobrepensamiento.", invert: true }
    ],
    bandas: [
      { min: 6.5, cls: "alta",  txt: "Buen sostén del patrón. La presencia interna está disponible y guía bastante la conducta. Conviene consolidarlo en sesión." },
      { min: 3.5, cls: "media", txt: "Hay base, con margen de mejora. En algunos momentos la atención se va y cuesta volver. Es justo lo que se entrena." },
      { min: 0,   cls: "baja",  txt: "Esta semana ha costado sostener la presencia interna. Es material útil para trabajar sin juicio: el punto de partida, no una conclusión." }
    ]
  };
  const MAX = CFG.escala.labels.length - 1;

  function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

  // ---- Scoring (idéntico al original) ----
  function calcular(resp){
    const subs = {}; Object.keys(CFG.subescalas).forEach(s => subs[s] = {sum:0,n:0});
    let tot=0, totN=0;
    CFG.items.forEach(it=>{
      let v = resp[it.id]; if(v===undefined) return;
      if(it.invert) v = MAX - v;
      if(subs[it.sub]){ subs[it.sub].sum += v; subs[it.sub].n++; }
      tot += v; totN++;
    });
    const score = o => o.n ? Math.round((o.sum/o.n)/MAX*10*10)/10 : null; // 0-10, 1 decimal
    const out = { sub:{}, total: totN ? Math.round((tot/totN)/MAX*10*10)/10 : 0 };
    Object.keys(subs).forEach(s => out.sub[s] = score(subs[s]));
    return out;
  }
  function banda(score){ for(const b of CFG.bandas){ if(score>=b.min) return b; } return CFG.bandas[CFG.bandas.length-1]; }

  function generarTexto(c,bTot,foco){
    const L=[CFG.toolName+" · APRENS", "Fecha: "+new Date().toLocaleDateString('es-ES'), ""];
    Object.keys(CFG.subescalas).forEach(s => L.push(CFG.subescalas[s].nombre+": "+c.sub[s]+"/10"));
    L.push("Media global: "+c.total+"/10 ("+bTot.cls+")");
    if(foco) L.push("Foco sugerido: "+CFG.subescalas[foco].nombre);
    L.push("", "— Enviado desde mi cuestionario APRENS");
    return L.join("\n");
  }

  // ---- Montaje ----
  function mount(app){
    let vista = "intro";
    const resp = {};

    // registra esta herramienta en el core único
    if(window.Aprens){
      Aprens.config({ toolId:CFG.toolId, toolName:CFG.toolName, toolVersion:1 });
      Aprens.collect(()=> app._aprensRec || null);
    }

    function updProg(){
      const done = CFG.items.filter(it=>resp[it.id]!==undefined).length;
      const f = app.querySelector("#progF"); if(f) f.style.width = Math.round(done/CFG.items.length*100)+"%";
    }
    function setResp(id,v){ resp[id]=v; render(); }

    function verResultado(){
      if(CFG.items.some(it=>resp[it.id]===undefined)){ const e=app.querySelector("#err"); if(e)e.style.display="block"; return; }
      vista="resultado"; render(); scrollTo(0,0);
    }
    function reiniciar(){ vista="intro"; Object.keys(resp).forEach(k=>delete resp[k]); app._aprensRec=null; render(); scrollTo(0,0); }

    function abrirWA(){ const box=app.querySelector("#msgBox"); const t=box.innerText||box.textContent; window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank"); }
    function copiar(btn){
      const box=app.querySelector("#msgBox"); const t=box.innerText||box.textContent;
      const ok=()=>{btn.textContent="✓ Copiado";setTimeout(()=>btn.textContent="📋 Copiar",2000);};
      if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(t).then(ok); }
      else { const r=document.createRange();r.selectNodeContents(box);const s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand("copy");}catch(e){}s.removeAllRanges();ok(); }
    }

    function render(){
      if(vista==="intro"){
        app.innerHTML = `
          <div class="hero">
            <div class="htitulo">${esc(CFG.titulo)}</div>
            <div class="hsubt">${esc(CFG.subtitulo)}</div>
            <div class="frase">${esc(CFG.frase)}</div>
          </div>
          <div class="card">
            <div class="ctit">Cómo funciona</div>
            <div style="font-size:13.5px;color:#444;line-height:1.7">Son ${CFG.items.length} frases. En cada una marca con qué frecuencia te ha pasado esta semana, del <b>${esc(CFG.escala.labels[0])}</b> al <b>${esc(CFG.escala.labels[MAX])}</b>. Al terminar verás un resumen y podrás enviárselo a tu psicólogo/a.</div>
            <div class="aviso" style="margin:16px 0 0">🔒 No se guarda nada hasta que pulsas enviar, y solo en tu dispositivo.</div>
          </div>
          <button class="btn bpg full" id="btnStart">Empezar →</button>`;
        app.querySelector("#btnStart").onclick=()=>{vista="quiz";render();scrollTo(0,0);};
        return;
      }
      if(vista==="quiz"){
        const items = CFG.items.map((it,idx)=>{
          const opts = CFG.escala.labels.map((lb,v)=>
            `<div class="opt${resp[it.id]===v?' sel':''}" data-id="${it.id}" data-v="${v}"><span class="n">${v}</span>${esc(lb)}</div>`
          ).join("");
          const sc=CFG.subescalas[it.sub];
          const tag=sc?`<span class="item-tag tag-${sc.color}">${esc(sc.nombre)}</span>`:"";
          return `<div class="item"><div class="item-q">${idx+1}. ${esc(it.texto)}${tag}</div><div class="scale">${opts}</div></div>`;
        }).join("");
        app.innerHTML = `
          <div class="prog"><div class="prog-f" id="progF"></div></div>
          <div class="card">${items}</div>
          <div class="err" id="err">Responde todas las frases para ver tu resumen.</div>
          <button class="btn bp full" id="btnVer">Ver mi resumen →</button>`;
        app.querySelectorAll(".opt").forEach(o=>o.onclick=()=>setResp(o.dataset.id, +o.dataset.v));
        app.querySelector("#btnVer").onclick=verResultado;
        updProg();
        return;
      }
      if(vista==="resultado"){ renderResultado(); }
    }

    function renderResultado(){
      const c = calcular(resp);
      const subKeys = Object.keys(CFG.subescalas);
      let foco=null, min=99;
      subKeys.forEach(s=>{ if(c.sub[s]!==null && c.sub[s]<min){min=c.sub[s];foco=s;} });
      const bTot = banda(c.total);

      // registro para el panel (persistido solo al exportar, vía collect)
      const rec = { date:new Date().toISOString().slice(0,10), ts:Date.now(), total:c.total, foco: foco?CFG.subescalas[foco].nombre:"" };
      subKeys.forEach(s=> rec[s]=c.sub[s]);
      app._aprensRec = rec;

      const cols = subKeys.map(s=>{const sc=CFG.subescalas[s];
        return `<div class="res-col"><div class="res-let">${esc(s)}</div><div class="res-num">${c.sub[s]}</div><div class="res-name">${esc(sc.nombre)}</div></div>`;}).join("");
      const filas = subKeys.map(s=>{const sc=CFG.subescalas[s];const b=banda(c.sub[s]);
        return `<tr><td>${esc(sc.nombre)} <span style="color:var(--gris);font-size:11px">· ${esc(sc.desc)}</span></td><td class="r">${c.sub[s]}/10</td><td>${b.cls}</td></tr>`;}).join("");
      let interp = `<div class="interp ${bTot.cls}"><strong>Media global: ${c.total}/10.</strong> ${bTot.txt}</div>`;
      if(foco) interp += `<div class="interp media"><strong>Foco sugerido:</strong> ${esc(CFG.subescalas[foco].nombre)} (${c.sub[foco]}/10) — ${esc(CFG.subescalas[foco].desc)}. Es el parámetro con más margen esta semana.</div>`;

      app.innerHTML = `
        <div class="res-hero">
          <div class="res-name" style="margin-bottom:4px">Tu resumen</div>
          <div class="res-grid">${cols}</div>
        </div>
        <div class="card">
          <div class="ctit">Detalle por parámetro</div>
          <table class="t"><tr><th style="text-align:left">Parámetro</th><th>Puntuación</th><th style="text-align:left">Nivel</th></tr>${filas}</table>
        </div>
        <div class="card">
          <div class="ctit">Lectura</div>${interp}
          <div style="font-size:11.5px;color:var(--gris);font-style:italic;margin-top:6px">Orientativo. No sustituye el trabajo con tu psicólogo/a: es el punto de partida de la conversación.</div>
        </div>
        <div class="card">
          <div class="ctit">Enviar a tu psicólogo/a</div>
          <div class="aviso">Solo se guarda en tu dispositivo cuando pulsas enviar. Copia el texto o ábrelo en WhatsApp; abajo puedes enviar el resultado al panel (.json).</div>
          <div class="cbox" id="msgBox">${esc(generarTexto(c,bTot,foco))}</div>
          <div class="acc">
            <button class="btn bwa" id="btnWA">📱 WhatsApp</button>
            <button class="btn bcopy" id="btnCopy">📋 Copiar</button>
          </div>
          <div style="text-align:center;margin-top:12px"><button class="btn bs" id="btnReset">↺ Repetir</button></div>
        </div>`;
      app.querySelector("#btnWA").onclick=abrirWA;
      app.querySelector("#btnCopy").onclick=e=>copiar(e.currentTarget);
      app.querySelector("#btnReset").onclick=reiniciar;
      if(window.Aprens) Aprens.mountBar(); // barra de export unificada (.json al panel)
    }

    render();
  }

  window.APRENS_TOOL_cuestionario_tec = { mount };
})();
