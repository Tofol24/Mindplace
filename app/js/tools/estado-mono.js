/* ============================================================
   APRENS · Herramienta: "¿Cómo llevas a tu mono?" (estado del mono)
   ------------------------------------------------------------
   PORTADA desde el HTML legacy. Se conserva SIN cambios la clínica:
   escenas del mono (conduce/persigo/maletero/vuelve atrás/a mi lado),
   feedback, 4 pasos AIS, mini-AIS de respiración (60s) y continuidad.

   MIGRACIÓN (lo que cambia respecto al original):
   · Antes: localStorage propio (aprens_estado_mono_hist) + export SOLO texto.
   · Ahora: persiste en el aprens_db ÚNICO vía el core y además exporta
     aprens-export (JSON) para el Panel del Psicólogo, sin perder el
     resumen humano de WhatsApp. La continuidad se lee del propio histórico
     del core (una entrada por check-in).
   ============================================================ */
(function () {
  const TOOL_ID = "estado_mono", TOOL_NAME = "Estado del mono";

  // ---- Datos clínicos (verbatim del original) ----
  const ESCENAS = [
    { id:'conduce', em:'🐒🚗', modo:'conduce', param:'latencia',
      tit:'El mono conduce', sub:'Reacciono desde el impulso o el miedo',
      donde:'Cuando el mono lleva el volante, tu vida gira alrededor del alivio inmediato: respondes antes de aparecer tú. Contestas, cancelas o compruebas, y luego te arrepientes.',
      frase:'"Sentir una emoción no te obliga a obedecerla."', clsFrase:'',
      pasos:['<b>PARA.</b> Di «STOP» por dentro e interrumpe el piloto automático.',
             '<b>SIENTE.</b> Lleva la atención al cuerpo. ¿Dónde lo notas? Pecho, barriga, cuello.',
             '<b>ACOMPAÑA.</b> Respira hacia esa zona y sostén la sensación 20-60 seg, sin actuar todavía.',
             '<b>ACTÚA.</b> Desde ahí, recupera el volante: elige el paso más pequeño que tenga sentido para ti.'],
      mono:'El mono necesita oír: «Te veo.»', clsMono:'frase-salvia' },

    { id:'persigo', em:'🏃', modo:'persecucion', param:'densidad',
      tit:'Lo persigo y peleo con él', sub:'Me exijo calma, me riño por sentir, intento controlarlo',
      donde:'Ir detrás del mono tocando el claxon no lo calma: cuanto más lo persigues, más corre. La lucha, por bien intencionada que sea, alimenta aquello de lo que querías huir.',
      frase:'"El mono no aprende cuando le gritas. Solo se asusta más."', clsFrase:'frase-oro',
      pasos:['<b>PARA.</b> Suelta la exigencia un momento. No tienes que vencer nada.',
             '<b>SIENTE.</b> Deja de pelear y lleva la atención a la sensación tal como está.',
             '<b>ACOMPAÑA.</b> Respira hacia ahí y sostenla sin cambiarla. El AIS no controla la emoción: la acompaña.',
             '<b>ACTÚA.</b> Trátate como tratarías a alguien con miedo, y da un paso amable.'],
      mono:'El mono necesita oír: «Entiendo que tengas miedo.»', clsMono:'frase-salvia' },

    { id:'maletero', em:'📦', modo:'maletero', param:'densidad',
      tit:'Lo encierro en el maletero', sub:'Lo tapo, me distraigo, me mantengo ocupado/a',
      donde:'Móvil, trabajo, comida, mantenerte ocupado… Durante un rato parece que funciona, pero el mono sigue ahí, golpeando. Lo que escondes no desaparece: solo espera, y vuelve más fuerte.',
      frase:'"Lo que escondes no desaparece. Solo espera."', clsFrase:'frase-oro',
      pasos:['<b>PARA.</b> Baja el volumen de la distracción un momento.',
             '<b>SIENTE.</b> Abre el maletero con cuidado: ¿dónde notas algo en el cuerpo?',
             '<b>ACOMPAÑA.</b> Respira hacia esa zona y quédate 20-60 seg. El efecto no depende de la sensación, sino de la presencia.',
             '<b>ACTÚA.</b> Elige un paso pequeño que no sea tapar, sino cuidar.'],
      mono:'El mono necesita oír: «No estás solo.»', clsMono:'frase-salvia' },

    { id:'voltaatras', em:'🔙', modo:'sobrepensamiento', param:'continuidad',
      tit:'Quiere volver atrás', sub:'Le doy vueltas: arreglar lo imposible o volver al camino de antes',
      donde:'Cuando el camino se complica, el mono se obsesiona con recuperar lo que había. La atención queda secuestrada: ya no está en el camino real que tienes delante, sino en el que querrías que fuese.',
      frase:'"El mono quiere el camino de ayer. Pero el volante solo conduce por el de hoy."', clsFrase:'',
      pasos:['<b>PARA.</b> Date cuenta de que estás dando vueltas y suéltalo un momento.',
             '<b>SIENTE.</b> Sal de la cabeza y baja al cuerpo: nota la sensación física, no el «por qué».',
             '<b>ACOMPAÑA.</b> Respira hacia ahí. Nota cualidades (temperatura, peso, textura), no significados.',
             '<b>ACTÚA.</b> Vuelve al camino de hoy con un paso pequeño y concreto, ahora.'],
      mono:'El mono necesita oír: «Estoy contigo.»', clsMono:'frase-salvia' },

    { id:'allado', em:'🧡', modo:'allado', param:'continuidad',
      tit:'Lo llevo a mi lado', sub:'Lo escucho y lo acompaño mientras sigo conduciendo yo',
      donde:'Aquí apareces tú: la conciencia que sostiene. Sentado a tu lado, el mono deja de gritar, no porque el dolor desaparezca, sino porque por fin se siente acompañado. El volante sigue en tus manos.',
      frase:'"Tu dignidad no depende del camino. Depende de quién lleva el volante."', clsFrase:'frase-salvia',
      pasos:['<b>Quédate.</b> Nota un momento que ahora mismo el mono viaja a tu lado.',
             '<b>Agradece.</b> Date las gracias por no haberte abandonado hoy.',
             '<b>Practica también aquí.</b> El AIS también se entrena cuando estás bien: pregúntate «¿dónde noto esto en mi cuerpo?».',
             '<b>Sigue.</b> Da un paso coherente con quien quieres ser y vuelve a visitarlo a lo largo del día.'],
      mono:'Recuerda: practicas AIS para no abandonarte, no para calmarte.', clsMono:'frase-salvia' }
  ];
  const CONTEXTOS = ['En casa','En el trabajo','Solo/a','Con la pareja','Con la familia','Con los hijos/as','Por salud','Otro'];
  const MICROS = ['Respirar 1 minuto','Beber agua / pausa','Dar un paseo corto','Decir cómo me siento','Hacer una sola tarea','Pedir ayuda','Descansar sin culpa','Un gesto amable conmigo'];
  const REG_TXT = ['Sí','Un poco','Todavía no'];

  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function hoy(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  function ahora(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
  const ICO_BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';

  function mount(app){
    const sel = { situacion:'', contexto:'', escena:null, reg:null, micro:'', ts:0 };
    let tDur=60, tLeft=60, tInt=null, tRunning=false;

    if(window.Aprens){ Aprens.config({ toolId:TOOL_ID, toolName:TOOL_NAME, toolVersion:1 }); Aprens.collect(()=> app._aprensRec || null); }

    app.innerHTML = `<div class="emono">
      <section class="screen active" data-s="inicio">
        <header>
          <span class="kicker">APRENS · El mono y el coche</span>
          <h1>¿Y ahora, cómo llevas a tu mono?</h1>
          <p class="sub">Tu mono es tu parte más emocional: tu niño/a interior, tus miedos, tu necesidad de afecto. Esto es una parada de un minuto para mirar dónde está ahora.</p>
        </header>
        <div class="card">
          <p>Imagina que tu vida es un coche y dentro viaja un mono. <b>Lo que ocurre depende, sobre todo, del lugar que ocupa el mono.</b></p>
          <div class="quote">"Sentir una emoción no te obliga a obedecerla."</div>
          <button class="btn" data-go="situacion">Hacer mi check-in de ahora</button>
        </div>
        <details>
          <summary><span class="em">📖</span>Leer la historia del mono y el coche</summary>
          <div class="body">
            <p><b>A veces el mono coge el volante.</b> Una emoción intensa toma el control: pisa el acelerador buscando alivio, frena de golpe. Tu vida gira alrededor del alivio inmediato.</p>
            <p><b>Otras veces lo persigues para vencerlo.</b> Te exiges calma, te riñes por sentir. Pero el miedo no se calma a gritos: cuanto más lo persigues, más corre.</p>
            <p><b>Y a veces lo metes en el maletero.</b> Lo tapas con móvil, trabajo, comida… Pero lo que escondes no desaparece: solo espera.</p>
            <p><b>Hay otra forma:</b> sentarlo a tu lado y seguir conduciendo tú. Puedes escucharlo, mirarlo, acompañarlo… y mantener el volante en tus manos. <i>Amar al mono no es obedecerlo: es acompañarlo.</i></p>
            <div class="quote frase-salvia">"El mono nunca quiso conducir. Solo necesitaba saber que no iba solo."</div>
          </div>
        </details>
        <div class="em-footer"><div class="logo">APRENS</div>Material orientativo · marco TEC / AIS / ACT. No guarda datos en ningún servidor.</div>
      </section>

      <section class="screen" data-s="situacion">
        <button class="back" data-go="inicio">${ICO_BACK} Inicio</button>
        <header style="padding-top:14px"><h1 style="font-size:24px">¿Qué estás viviendo ahora mismo?</h1><p class="sub">Sin dar muchas vueltas. Una frase basta. (Y si no te apetece escribir, puedes saltar.)</p></header>
        <div class="card">
          <label class="fld" for="em-sit">Lo que está pasando:</label>
          <textarea id="em-sit" rows="2" placeholder="Ej.: discusión en casa, una notificación, no consigo dormir, estoy tranquilo/a tomando café…"></textarea>
          <h3>¿Dónde / con quién?</h3>
          <div class="chips" data-chips="ctx"></div>
          <button class="btn" data-go="mono">Continuar</button>
        </div>
      </section>

      <section class="screen" data-s="mono">
        <button class="back" data-go="situacion">${ICO_BACK} Atrás</button>
        <header style="padding-top:14px"><h1 style="font-size:24px">¿Dónde está tu mono en este momento?</h1><p class="sub">No hay respuesta mala. Solo es honestidad contigo. Elige la que más se parezca a ahora.</p></header>
        <div class="card"><div class="opts" data-escenas></div></div>
      </section>

      <section class="screen" data-s="feedback">
        <button class="back" data-go="mono">${ICO_BACK} Cambiar escena</button>
        <header style="padding-top:12px">
          <div style="font-size:50px" data-fb="em">🐒</div>
          <h1 style="font-size:24px;margin-top:6px" data-fb="tit"></h1>
          <p class="sub" data-fb="sub"></p>
        </header>
        <div class="card">
          <h2><span class="ic">🧭</span>Dónde te lleva eso</h2>
          <p data-fb="donde"></p>
          <div class="quote" data-fb="frase"></div>
        </div>
        <div class="card">
          <h2><span class="ic">🪑</span>Cómo llevarlo a tu lado</h2>
          <p class="lead">El AIS es la forma concreta de sentarte junto al mono. Cuatro pasos:</p>
          <ol class="pasos" data-fb="pasos"></ol>
          <div class="quote frase-salvia" data-fb="mono"></div>
        </div>
        <div class="card">
          <h2><span class="ic">🫁</span>Respira hacia ahí · 60 seg</h2>
          <p class="lead">Lleva la atención a donde lo notas (pecho, barriga, cuello) y respira hacia esa zona. No para cambiarla: para acompañarla.</p>
          <div class="timer-wrap">
            <div class="ring" data-ring><div class="rinner"><div style="text-align:center"><div class="rtime" data-rtime>1:00</div><div class="rlbl" data-rlbl>listo</div></div></div></div>
            <button class="btn small ghost" data-timer style="margin-top:16px">Empezar</button>
          </div>
        </div>
        <div class="card">
          <h2><span class="ic">🤲</span>Tu momento con el mono</h2>
          <h3>¿Has podido sentarte un momento a su lado?</h3>
          <div class="three" data-reg>
            <button data-reg-i="0">Sí</button><button data-reg-i="1">Un poco</button><button data-reg-i="2">Todavía no</button>
          </div>
          <h3>Una microacción con valor</h3>
          <p class="lead">El paso más pequeño, concreto y posible ahora, en la dirección de quien quieres ser.</p>
          <div class="chips" data-chips="micro"></div>
          <input type="text" data-micro-otra placeholder="…o escribe la tuya" style="margin-top:10px;display:none">
          <label class="fld" for="em-llevo">Lo que me llevo (opcional):</label>
          <textarea id="em-llevo" rows="2" placeholder="Una palabra o frase para ti…"></textarea>
        </div>
        <div class="card">
          <h2><span class="ic">📨</span>Enviar a tu psicólogo/a</h2>
          <div class="avis"><span class="em">🔒</span><span>No se guarda en ningún servidor. Esto se suma a tu expediente para ver cómo vas llevando al mono y ajustar tu pauta.</span></div>
          <div class="resumen" data-prev>Tu check-in aparecerá aquí.</div>
          <div class="btnrow" style="margin-top:12px">
            <button class="btn wa" data-send="wa">📱 Enviar por WhatsApp</button>
            <button class="btn oro" data-send="copy">📋 Copiar</button>
          </div>
        </div>
        <div class="card">
          <h2><span class="ic">🔁</span>Seguir cuidando al mono</h2>
          <p class="lead">El mono no cambia porque lo mires una vez. Cambia porque descubre que cada día vuelves a sentarte a su lado.</p>
          <div class="contmsg" data-cont></div>
          <div class="hist" data-hist></div>
        </div>
        <div class="em-footer"><div class="logo">APRENS</div>marco TEC / AIS / ACT · "¿Quién conduce tu vida?"</div>
      </section>
    </div>`;

    const root = app.querySelector('.emono');
    const $ = s => root.querySelector(s);
    const $$ = s => root.querySelectorAll(s);

    function go(id){ $$('.screen').forEach(s=>s.classList.toggle('active', s.dataset.s===id)); window.scrollTo({top:0,behavior:'smooth'}); }
    function escenaPorId(id){ return ESCENAS.find(e=>e.id===id)||null; }

    // chips contexto
    $('[data-chips="ctx"]').innerHTML = CONTEXTOS.map(c=>`<button class="chip" data-ctx="${esc(c)}">${esc(c)}</button>`).join('');
    $$('[data-ctx]').forEach(b=>b.onclick=()=>{
      const on=b.classList.contains('sel');
      $$('[data-ctx]').forEach(x=>x.classList.remove('sel'));
      if(!on){ b.classList.add('sel'); sel.contexto=b.dataset.ctx; } else sel.contexto='';
    });

    // escenas
    $('[data-escenas]').innerHTML = ESCENAS.map(e=>
      `<button class="opt" data-esc="${e.id}"><span class="em">${e.em}</span><span><span class="ot">${esc(e.tit)}</span><span class="os">${esc(e.sub)}</span></span></button>`).join('');
    $$('[data-esc]').forEach(b=>b.onclick=()=>elegirEscena(b.dataset.esc));

    // micros
    function pintaMicros(){
      $('[data-chips="micro"]').innerHTML = MICROS.map(m=>`<button class="chip" data-mic="${esc(m)}">${esc(m)}</button>`).join('')
        + '<button class="chip oro" data-mic="__otra__">✍️ Otra</button>';
      $$('[data-mic]').forEach(b=>b.onclick=()=>setMicro(b));
    }
    function setMicro(btn){
      $$('[data-mic]').forEach(x=>x.classList.remove('sel')); btn.classList.add('sel');
      const otra=$('[data-micro-otra]');
      if(btn.dataset.mic==='__otra__'){ sel.micro='__otra__'; otra.style.display='block'; otra.focus(); }
      else { sel.micro=btn.dataset.mic; otra.style.display='none'; }
      pintaPrev();
    }
    function microFinal(){
      if(sel.micro==='__otra__'){ const v=$('[data-micro-otra]').value.trim(); return v||'(otra acción)'; }
      return sel.micro||'—';
    }

    // registro
    $$('[data-reg-i]').forEach(b=>b.onclick=()=>{
      $$('[data-reg-i]').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
      sel.reg=+b.dataset.regI; pintaPrev();
    });

    function elegirEscena(id){
      sel.escena=escenaPorId(id);
      sel.situacion=$('#em-sit').value.trim();
      sel.ts=Date.now();
      const e=sel.escena; if(!e) return;
      $('[data-fb="em"]').textContent=e.em;
      $('[data-fb="tit"]').textContent=e.tit;
      $('[data-fb="sub"]').textContent=e.sub;
      $('[data-fb="donde"]').textContent=e.donde;
      const q=$('[data-fb="frase"]'); q.className='quote '+(e.clsFrase||''); q.textContent='“'+e.frase.replace(/^"|"$/g,'')+'”';
      $('[data-fb="pasos"]').innerHTML=e.pasos.map(p=>`<li>${p}</li>`).join('');
      const m=$('[data-fb="mono"]'); m.className='quote '+(e.clsMono||'frase-salvia'); m.textContent=e.mono;
      // reset selección dependiente
      sel.reg=null; sel.micro='';
      $$('[data-reg-i]').forEach(b=>b.classList.remove('sel'));
      $('[data-micro-otra]').style.display='none'; $('[data-micro-otra]').value=''; $('#em-llevo').value='';
      pintaMicros(); pintaPrev(); resetTimer();
      go('feedback');
    }

    // ---- Temporizador AIS ----
    function fmt(s){return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2);}
    function pintaRing(){ const deg=360*(1-tLeft/tDur); $('[data-ring]').style.background='conic-gradient(var(--terra) '+deg+'deg,#ecdfd6 '+deg+'deg)'; $('[data-rtime]').textContent=fmt(tLeft); }
    function toggleTimer(){
      const btn=$('[data-timer]'), lbl=$('[data-rlbl]');
      if(tRunning){ clearInterval(tInt); tRunning=false; btn.textContent='Seguir'; lbl.textContent='en pausa'; return; }
      tRunning=true; btn.textContent='Pausa'; lbl.textContent='respira…';
      tInt=setInterval(()=>{ tLeft--; if(tLeft<=0){ tLeft=0; pintaRing(); clearInterval(tInt); tRunning=false; btn.textContent='Otra vez'; lbl.textContent='aquí estás'; tLeft=tDur; return; } pintaRing(); },1000);
    }
    function resetTimer(){ clearInterval(tInt); tRunning=false; tLeft=tDur; const b=$('[data-timer]'); if(b)b.textContent='Empezar'; const l=$('[data-rlbl]'); if(l)l.textContent='listo'; pintaRing(); }
    $('[data-timer]').onclick=toggleTimer;

    // ---- Resumen (WhatsApp) + registro para el core ----
    function construirResumen(){
      const e=sel.escena, L=[];
      L.push('¿CÓMO LLEVAS A TU MONO? · APRENS · '+hoy());
      L.push('Hora: '+ahora()); L.push('');
      L.push('Situación ahora mismo:');
      L.push(($('#em-sit').value.trim()||sel.situacion||'—')+(sel.contexto?' · '+sel.contexto:''));
      L.push('');
      L.push('Estado del mono: '+(e?e.tit:'—'));
      if(e){ L.push('('+e.sub+')'); L.push('Foco TEC: '+e.param); }
      L.push('');
      L.push('Me he sentado a su lado: '+(sel.reg!=null?REG_TXT[sel.reg]:'—'));
      L.push('Microacción con valor: '+microFinal());
      const ll=$('#em-llevo').value.trim();
      if(ll){ L.push(''); L.push('Lo que me llevo:'); L.push(ll); }
      return L.join('\n');
    }
    function pintaPrev(){ $('[data-prev]').textContent=construirResumen(); }

    function buildRec(){
      const e=sel.escena; if(!e) return null;
      return { id:sel.ts, date:hoy(), ts:sel.ts, hora:ahora(),
        escena:e.id, estado:e.tit, modo:e.modo, param:e.param,
        reg:sel.reg, sentado:(sel.reg!=null?REG_TXT[sel.reg]:''),
        micro:microFinal(), llevo:$('#em-llevo').value.trim(),
        situacion:$('#em-sit').value.trim()||sel.situacion, contexto:sel.contexto };
    }
    function persist(){
      const rec=buildRec(); if(!rec) return;
      app._aprensRec=rec;
      if(window.Aprens) Aprens.save(rec);   // upsert por id -> una entrada por check-in
      pintaContinuidad();
    }

    // ---- Continuidad (histórico del core) ----
    function pintaContinuidad(){
      const h = window.Aprens ? Aprens.history() : [];
      const hoyN = h.filter(r=>r.date===hoy()).length;
      const msg=$('[data-cont]');
      if(hoyN===0) msg.textContent='Hoy todavía no has visitado al mono. Este momento ya cuenta.';
      else if(hoyN===1) msg.textContent='Hoy has vuelto a tu mono 1 vez. Volver ya es cuidarlo.';
      else msg.textContent='Hoy has vuelto a tu mono '+hoyN+' veces. Gracias por no dejarlo solo.';
      const ult=h.slice(-6).reverse();
      $('[data-hist]').innerHTML = ult.map(r=>{
        const e=escenaPorId(r.escena);
        return '<div class="row"><span class="dt">'+esc(r.date)+(r.hora?' '+esc(r.hora):'')+'</span><span class="ev">'+(e?e.em+' ':'')+esc(r.estado||'')+'</span></div>';
      }).join('');
    }

    // ---- Copiar / WhatsApp ----
    function feedbackBtn(btn,txt){ if(!btn)return; const html=btn.innerHTML; btn.classList.add('ok'); btn.textContent=txt||'¡Copiado!'; setTimeout(()=>{btn.classList.remove('ok');btn.innerHTML=html;},1800); }
    function copiar(txt,btn){
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(()=>feedbackBtn(btn)).catch(()=>fallback(txt,btn)); }
      else fallback(txt,btn);
    }
    function fallback(txt,btn){ const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand('copy');feedbackBtn(btn);}catch(e){alert('No se pudo copiar. Selecciona el texto del recuadro y cópialo a mano.');}document.body.removeChild(ta); }

    $$('[data-send]').forEach(b=>b.onclick=()=>{
      persist(); const txt=construirResumen(); pintaPrev();
      if(b.dataset.send==='wa') window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
      else copiar(txt,b);
      if(window.Aprens) Aprens.mountBar();   // barra unificada (.json al panel)
    });

    // navegación interna + inputs
    $$('[data-go]').forEach(b=>b.onclick=()=>{ if(b.dataset.go==='mono'){ sel.situacion=$('#em-sit').value.trim(); } go(b.dataset.go); });
    $('#em-llevo').addEventListener('input',pintaPrev);
    $('[data-micro-otra]').addEventListener('input',pintaPrev);

    // init
    pintaMicros(); resetTimer(); pintaContinuidad();
  }

  window.APRENS_TOOL_estado_mono = { mount };
})();
