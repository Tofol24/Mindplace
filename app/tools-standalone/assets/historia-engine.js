/* ============================================================
   APRENS · Motor de historias narradas (compartido)
   ------------------------------------------------------------
   Reproductor de escenas SVG con narración: usa la voz grabada
   (window.AUDIO_DIR + NN.m4a, una por escena) y, si falta o falla,
   la voz del navegador. Pensado para explicaciones breves y calmadas
   (poca carga atencional). Sin recursos externos.

   La página define, antes de incluir este script:
     window.SCENES   = [{art:'<svg…>', text:'…', quote:true?}, …]
     window.AUDIO_DIR = 'assets/audio/xxx/'  (o null mientras no haya voz)
     window.VOLVER    = 'cuerpo-en-alerta.html'  (a dónde vuelve)
   y un DOM con los ids: cover, show, topbar, startBtn, coverMute,
     muteBtn, exitBtn, volverBtn, art, cap, dots, playBtn, prevBtn, nextBtn.
   ============================================================ */
(function(){
  "use strict";
  var SCENES = window.SCENES || [];
  var AUDIO_DIR = window.AUDIO_DIR || null;
  var VOLVER = window.VOLVER || null;

  /* ---------- estilos (paleta calmada) ---------- */
  var css =
  '*{box-sizing:border-box;margin:0;padding:0}'+
  ':root{--tinta:#efe9dd;--suau:#b7ad9c;--salvia:#8aa981;--azul:#9ab2bd;--terra:#cf9077;--oro:#cfa64e;'+
  '--serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;'+
  '--sans:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'+
  'html,body{height:100%}'+
  'body{font-family:var(--sans);background:radial-gradient(120% 100% at 50% 0%,#2c2822 0%,#1a1712 72%);color:var(--tinta);overflow:hidden}'+
  '.stage{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(18px + env(safe-area-inset-top)) 18px calc(18px + env(safe-area-inset-bottom))}'+
  '#cover{text-align:center;max-width:520px}'+
  '#cover .eyebrow{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--salvia);margin-bottom:14px}'+
  '#cover h1{font-family:var(--serif);font-size:clamp(27px,7vw,42px);line-height:1.08;margin-bottom:12px}'+
  '#cover p{font-size:15px;color:#d9d2c5;line-height:1.6;margin-bottom:26px}'+
  '.play{display:inline-flex;align-items:center;gap:10px;background:var(--salvia);color:#1a1712;border:0;border-radius:30px;font-family:var(--sans);font-weight:700;font-size:17px;padding:15px 30px;cursor:pointer;box-shadow:0 12px 30px -14px rgba(138,169,129,.8)}'+
  '.mutebar{margin-top:18px}'+
  '.mutebar button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);color:var(--tinta);border-radius:22px;padding:9px 16px;font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;min-height:44px}'+
  '#show{display:none}'+
  '#show.on{display:flex}'+
  '.art{flex:1 1 auto;display:flex;align-items:center;justify-content:center;width:100%;min-height:0}'+
  '.art svg{width:auto;height:100%;max-height:50vh;max-width:min(92vw,560px)}'+
  '.cap{flex:0 0 auto;max-width:640px;text-align:center;margin-top:10px}'+
  '.cap p{font-family:var(--serif);font-size:clamp(20px,4.2vw,29px);line-height:1.34;opacity:0;transform:translateY(8px);transition:opacity .6s,transform .6s}'+
  '.cap p.in{opacity:1;transform:none}'+
  '.cap .q{font-style:italic;color:var(--oro)}'+
  '.dots{display:flex;gap:7px;margin-top:16px;justify-content:center;flex-wrap:wrap}'+
  '.dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.26);transition:background .3s,transform .3s}'+
  '.dots i.on{background:var(--salvia);transform:scale(1.35)}'+
  '.ctrl{display:flex;align-items:center;gap:14px;margin-top:16px}'+
  '.cbtn{width:52px;height:52px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:var(--tinta);font-size:20px;cursor:pointer;display:grid;place-items:center}'+
  '.cbtn.big{width:60px;height:60px;background:var(--salvia);color:#1a1712;font-size:22px}'+
  '.top{position:fixed;top:calc(10px + env(safe-area-inset-top));left:14px;right:14px;display:flex;justify-content:space-between;gap:10px;z-index:5}'+
  '.top button{background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.2);color:var(--tinta);border-radius:22px;padding:9px 14px;font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;min-height:44px}'+
  '.top .rgt{display:flex;gap:10px}'+
  '.fade{animation:fade .55s ease both}'+
  '@keyframes fade{from{opacity:0}to{opacity:1}}'+
  '@media(prefers-reduced-motion:no-preference){'+
  '.breathe{transform-origin:center;animation:breathe 8s ease-in-out infinite}'+
  '.bob{animation:bob 3s ease-in-out infinite}'+
  '.pulse{animation:pulse 3.4s ease-in-out infinite}'+
  '.spin{transform-origin:center;animation:spin 7s linear infinite}}'+
  '@keyframes breathe{0%,100%{transform:scale(.94);opacity:.85}50%{transform:scale(1.1);opacity:1}}'+
  '@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}'+
  '@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'+
  '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* ---------- lógica ---------- */
  var idx=0, playing=false, muted=false, timer=null, curAudio=null;
  var PAUSA=1400; // pausa calmada entre escenas (ms)
  var $=function(id){return document.getElementById(id);};
  var voces=[], voz=null;
  function cargarVoz(){ voces=(window.speechSynthesis?speechSynthesis.getVoices():[])||[]; voz=voces.filter(function(v){return /^es/i.test(v.lang);})[0]||null; }
  if(window.speechSynthesis){ cargarVoz(); speechSynthesis.onvoiceschanged=cargarVoz; }
  function pad(i){ return (i<9?'0':'')+(i+1); }
  function stopAudio(){ if(curAudio){ try{curAudio.pause();}catch(e){} curAudio=null; } }
  function scheduleFallback(fn, ms){ clearTimeout(timer); timer=setTimeout(fn, ms||5200); }

  function narrar(text, onEnd){
    if(!window.speechSynthesis){ scheduleFallback(onEnd, Math.max(4600, text.length*90)); return; }
    try{ speechSynthesis.cancel(); }catch(e){}
    if(muted){ scheduleFallback(onEnd, Math.max(4400, text.length*58)); return; }
    var u=new SpeechSynthesisUtterance(text);
    u.lang='es-ES'; if(voz)u.voice=voz; u.rate=0.82; u.pitch=1;
    var done=false;
    u.onend=function(){ if(done)return; done=true; onEnd&&onEnd(); };
    u.onerror=function(){ if(done)return; done=true; scheduleFallback(onEnd,300); };
    try{ speechSynthesis.speak(u); }catch(e){ scheduleFallback(onEnd); }
    scheduleFallback(function(){ if(!done){ done=true; onEnd&&onEnd(); } }, Math.max(5200, text.length*95));
  }
  function playClip(i, text, onEnd){
    try{
      var a=new Audio(AUDIO_DIR+pad(i)+'.m4a'); curAudio=a; var done=false;
      a.onended=function(){ if(done)return; done=true; onEnd&&onEnd(); };
      a.onerror=function(){ if(done)return; done=true; curAudio=null; narrar(text,onEnd); };
      var p=a.play(); if(p&&p.catch){ p.catch(function(){ if(done)return; done=true; curAudio=null; narrar(text,onEnd); }); }
      scheduleFallback(function(){ if(!done){ done=true; onEnd&&onEnd(); } }, Math.max(6500, text.length*95));
    }catch(e){ narrar(text,onEnd); }
  }
  function speak(i, text, onEnd){
    stopAudio();
    if(muted){ scheduleFallback(onEnd, Math.max(4400, text.length*58)); return; }
    if(AUDIO_DIR){ playClip(i, text, onEnd); return; }
    narrar(text, onEnd);
  }

  function pintaDots(){ $('dots').innerHTML=SCENES.map(function(_,i){return '<i class="'+(i===idx?'on':'')+'"></i>';}).join(''); }
  function render(){
    var sc=SCENES[idx];
    var art=$('art'); art.innerHTML=sc.art; art.classList.remove('fade'); void art.offsetWidth; art.classList.add('fade');
    var cap=$('cap').querySelector('p'); cap.className=sc.quote?'q':''; cap.classList.remove('in'); cap.textContent=(sc.quote?'«':'')+sc.text+(sc.quote?'»':'');
    void cap.offsetWidth; requestAnimationFrame(function(){ cap.classList.add('in'); });
    pintaDots();
    clearTimeout(timer); stopAudio();
    if(playing){ speak(idx, sc.text, function(){ if(!playing) return; clearTimeout(timer); timer=setTimeout(function(){ if(playing) next(true); }, PAUSA); }); }
    else if(!muted && window.speechSynthesis){ try{speechSynthesis.cancel();}catch(e){} }
  }
  function next(auto){ if(idx<SCENES.length-1){ idx++; render(); } else { setPlay(false); } }
  function prev(){ if(idx>0){ idx--; render(); } }
  function setPlay(p){ playing=p; $('playBtn').textContent=p?'⏸':'▶'; if(p) render(); else { clearTimeout(timer); stopAudio(); try{speechSynthesis&&speechSynthesis.cancel();}catch(e){} } }
  function setMute(m){ muted=m; var t=m?'🔇 Silencio':'🔊 Voz'; $('muteBtn').textContent=t; if(m){ stopAudio(); try{speechSynthesis&&speechSynthesis.cancel();}catch(e){} } }

  function empezar(){
    $('cover').style.display='none'; $('show').classList.add('on'); $('topbar').style.display='flex';
    idx=0; setPlay(true);
    var el=document.documentElement; try{ el.requestFullscreen&&el.requestFullscreen().catch(function(){}); }catch(e){}
  }
  function salir(){
    setPlay(false); $('show').classList.remove('on'); $('topbar').style.display='none'; $('cover').style.display='flex';
    try{ document.fullscreenElement&&document.exitFullscreen&&document.exitFullscreen().catch(function(){}); }catch(e){}
  }
  function volver(){ if(VOLVER){ location.href=VOLVER; } else { salir(); } }

  $('startBtn').onclick=empezar;
  $('coverMute').onclick=function(){ setMute(!muted); this.textContent=muted?'🔇 Sin voz · tocar para activar':'🔊 Con voz · tocar para silenciar'; };
  $('playBtn').onclick=function(){ setPlay(!playing); };
  $('prevBtn').onclick=function(){ setPlay(false); prev(); };
  $('nextBtn').onclick=function(){ setPlay(false); next(); };
  $('muteBtn').onclick=function(){ setMute(!muted); if(playing) render(); };
  if($('exitBtn')) $('exitBtn').onclick=salir;
  if($('volverBtn')) $('volverBtn').onclick=volver;
  document.addEventListener('keydown',function(e){
    if(!$('show').classList.contains('on')) return;
    if(e.key==='ArrowRight'){ setPlay(false); next(); } else if(e.key==='ArrowLeft'){ setPlay(false); prev(); }
    else if(e.key===' '){ e.preventDefault(); setPlay(!playing); } else if(e.key==='Escape'){ salir(); }
  });
  // Botón «← Atrás» de la app: si está reproduciendo, salir al principio de la historia.
  window.APRENS_toolBack=function(){ if($('show').classList.contains('on')){ salir(); return true; } return false; };
  window.addEventListener('pagehide',function(){ stopAudio(); try{speechSynthesis&&speechSynthesis.cancel();}catch(e){} });
})();
