/* ============================================================
   APRENS · Audio guiado para las explicaciones (offline)
   ------------------------------------------------------------
   Reproduce la explicación en voz alta (Web Speech del dispositivo),
   resaltando el párrafo que va leyendo. Sin archivos, sin red.

   Uso:
     <div id="audioguia"></div>
     <script src="assets/reflexion-audio.js"></script>
     AprensAudio.mount('audioguia', { title:'Escuchar la explicación' });

   Lee, en orden, los elementos que coincidan con el selector (por
   defecto '.rx'). Cada elemento puede llevar data-say="..." para
   dictar un texto distinto al que se muestra.
   ============================================================ */
(function(g){
  var els=[], cur=-1, playing=false, timer=null, opts={};
  var $btn, $bar, $lbl, mounted=false;

  function pickVoice(){
    var vs=(g.speechSynthesis?speechSynthesis.getVoices():[])||[];
    var lc=(opts.lang||'es').slice(0,2).toLowerCase();
    return vs.filter(function(v){return v.lang&&v.lang.slice(0,2).toLowerCase()===lc;})[0]||null;
  }
  var voz=null;
  function cargarVoz(){ voz=pickVoice(); }
  if(g.speechSynthesis){ cargarVoz(); g.speechSynthesis.onvoiceschanged=cargarVoz; }

  function injectCSS(){
    if(document.getElementById('aa-css')) return;
    var s=document.createElement('style'); s.id='aa-css';
    s.textContent=
      '.aa-player{display:flex;align-items:center;gap:13px;background:linear-gradient(160deg,#3f4430,#565a41);color:#fff;'+
      'border-radius:14px;padding:12px 15px;margin:14px 0 4px;box-shadow:0 6px 20px -14px rgba(42,38,34,.5);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'+
      '.aa-play{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:18px;cursor:pointer;display:grid;place-items:center;line-height:1}'+
      '.aa-play:active{transform:scale(.96)}'+
      '.aa-meta{flex:1;min-width:0}'+
      '.aa-t{font-weight:700;font-size:14.5px;line-height:1.2}'+
      '.aa-s{font-weight:400;font-size:12px;opacity:.85;margin-top:1px}'+
      '.aa-bar{height:5px;border-radius:3px;background:rgba(255,255,255,.22);margin-top:7px;overflow:hidden}'+
      '.aa-bar i{display:block;height:100%;width:0;background:#e7c079;border-radius:3px;transition:width .35s}'+
      '.aa-x{flex:0 0 auto;font-size:12px;font-weight:700;opacity:.9;font-variant-numeric:tabular-nums}'+
      '.aa-now{display:none;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:14.5px;line-height:1.5;color:#3f4430;'+
      'background:#eef1e6;border-left:4px solid #a7802f;border-radius:0 12px 12px 0;padding:12px 14px;margin:10px 0 2px}'+
      '.rx-on{background:rgba(231,192,121,.28);border-radius:8px;box-shadow:0 0 0 6px rgba(231,192,121,.16);transition:background .3s,box-shadow .3s}';
    document.head.appendChild(s);
  }

  // Dos modos: por elementos del DOM (con resalte) o por lista de segmentos.
  var segMode=false, $now=null;
  function refreshEls(){
    if(opts.segments && opts.segments.length){
      segMode=true;
      els=opts.segments.map(function(t){ return { seg:true, text:String(t) }; });
    } else {
      segMode=false;
      els=Array.prototype.slice.call(document.querySelectorAll(opts.selector||'.rx'));
    }
    setCount();
  }
  function setCount(){
    if(!$lbl) return;
    var n=els.length;
    $lbl.textContent=(playing||cur>=0? (Math.min(cur+1,n)) : 0)+'/'+n;
    if($bar) $bar.style.width=(n? (Math.min(cur+(playing?1:0),n)/n*100):0)+'%';
  }
  function textOf(item){ return item&&item.seg ? item.text : (item.getAttribute('data-say')||item.textContent||''); }
  function clearHi(){ els.forEach(function(e){ if(e&&e.classList) e.classList.remove('rx-on'); }); if($now){ $now.textContent=''; $now.style.display='none'; } }
  function hi(item){
    clearHi();
    if(!item) return;
    if(item.seg){ if($now){ $now.textContent='«'+item.text.replace(/\s+/g,' ').trim()+'»'; $now.style.display='block'; } }
    else { item.classList.add('rx-on'); try{ item.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){} }
  }

  function narrate(text, onEnd){
    if(!g.speechSynthesis){ scheduleFallback(onEnd, Math.max(2600, text.length*60)); return; }
    try{ g.speechSynthesis.cancel(); }catch(e){}
    var u=new SpeechSynthesisUtterance(text);
    u.lang=opts.lang||'es-ES'; if(voz)u.voice=voz; u.rate=opts.rate||0.9; u.pitch=1;
    var done=false;
    u.onend=function(){ if(done)return; done=true; onEnd&&onEnd(); };
    u.onerror=function(){ if(done)return; done=true; scheduleFallback(onEnd, 300); };
    try{ g.speechSynthesis.speak(u); }catch(e){ scheduleFallback(onEnd, Math.max(2600, text.length*60)); return; }
    scheduleFallback(function(){ if(!done){ done=true; onEnd&&onEnd(); } }, Math.max(3000, text.length*95));
  }
  function scheduleFallback(fn, ms){ clearTimeout(timer); timer=setTimeout(fn, ms||3000); }

  function speakCur(){
    if(!playing) return;
    if(cur>=els.length){ finish(); return; }
    var el=els[cur]; hi(el); setCount(); setBtn();
    var text=textOf(el).replace(/\s+/g,' ').trim();
    if(!text){ cur++; speakCur(); return; }
    narrate(text, function(){ if(!playing) return; cur++; clearTimeout(timer); timer=setTimeout(function(){ if(playing) speakCur(); }, 520); });
  }
  function finish(){ playing=false; setBtn(); clearHi(); cur=-1; setCount(); }
  function play(){ if(!els.length) refreshEls(); if(!els.length) return; playing=true; if(cur<0) cur=0; setBtn(); speakCur(); }
  function pause(){ playing=false; clearTimeout(timer); try{ g.speechSynthesis&&g.speechSynthesis.cancel(); }catch(e){} setBtn(); }
  function setBtn(){ if($btn) $btn.textContent=playing?'⏸':'▶'; }

  var AA={};
  AA.mount=function(cid, o){
    opts=o||{}; if(!opts.selector) opts.selector='.rx';
    var c=document.getElementById(cid); if(!c) return;
    // Si se re-monta (p. ej. cambio de idioma), parar lo que sonara.
    pause(); cur=-1;
    injectCSS();
    c.innerHTML=
      '<div class="aa-player">'+
        '<button class="aa-play" id="aaPlay" aria-label="Reproducir">▶</button>'+
        '<div class="aa-meta"><div class="aa-t">'+(opts.title||'Escuchar (audio guiado)')+'</div>'+
          '<div class="aa-s">'+(opts.subtitle||'Voz del dispositivo · te lo lee en voz alta')+'</div>'+
          '<div class="aa-bar"><i id="aaBar"></i></div></div>'+
        '<div class="aa-x" id="aaCount">0/0</div>'+
      '</div>'+
      '<div class="aa-now" id="aaNow"></div>';
    $btn=document.getElementById('aaPlay'); $bar=document.getElementById('aaBar'); $lbl=document.getElementById('aaCount'); $now=document.getElementById('aaNow');
    $btn.onclick=function(){ if(playing) pause(); else play(); };
    refreshEls();
    if(!mounted){
      mounted=true;
      g.addEventListener('pagehide', function(){ pause(); });
      // El botón "← Atrás" de la app o cambiar de pestaña: parar la voz.
      document.addEventListener('visibilitychange', function(){ if(document.hidden) pause(); });
    }
  };
  AA.stop=function(){ pause(); clearHi(); cur=-1; setCount(); };
  g.AprensAudio=AA;
})(window);
