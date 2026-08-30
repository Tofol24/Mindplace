/* APRENS · Cuentos — datos + motor del lector */
(function(){
"use strict";
function pad(n){return (n<10?"0":"")+n;}

/* ventana de capacidad (SVG) — misma gramática que la herramienta 🌊 */
function ventana(state,size){
  var C={verde:{light:'#6F8F83',rows:1,perRow:1,frame:'#4a4a42',mut:0},amarillo:{light:'#C6A66B',rows:1,perRow:3,frame:'#4a4a42',mut:0},naranja:{light:'#CE8A56',rows:2,perRow:3,frame:'#464038',mut:.05},rojo:{light:'#B85C52',rows:3,perRow:4,frame:'#3a332f',mut:.16},azul:{light:'#7895A8',rows:1,perRow:3,frame:'#45474a',mut:.10,door:true}}[state];
  var uid=(ventana._n=(ventana._n||0)+1),gid="g"+state+uid,cid="c"+state+uid;
  var inX=20,inW=160,floor=172,top=34;
  var s='<svg width="'+size+'" height="'+size+'" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.light+'" stop-opacity="0.95"/><stop offset="1" stop-color="'+C.light+'" stop-opacity="0.30"/></linearGradient><clipPath id="'+cid+'"><rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="'+(floor-top+8)+'" rx="8"/></clipPath></defs><rect x="8" y="8" width="184" height="184" rx="18" fill="#efe9dc" stroke="'+C.frame+'" stroke-width="6"/><g clip-path="url(#'+cid+')"><rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="'+(floor-top+8)+'" fill="url(#'+gid+')"/>';
  if(C.mut)s+='<rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="'+(floor-top+8)+'" fill="#28312F" opacity="'+C.mut+'"/>';
  s+='<line x1="'+inX+'" y1="'+floor+'" x2="'+(inX+inW)+'" y2="'+floor+'" stroke="#28312F" stroke-opacity="0.28" stroke-width="2"/>';
  var r=15;for(var row=0;row<C.rows;row++){var cy=floor-r-row*(2*r+4)-2;for(var i=0;i<C.perRow;i++){var sp=(C.perRow>1)?(inW-2*r-8):0;var cx=(C.perRow===1)?(inX+inW/2):(inX+r+6+i*(sp/(C.perRow-1)));s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#28312F" opacity="0.16"/><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#28312F" stroke-opacity="0.34" stroke-width="2"/>';}}
  s+='</g>';if(C.door)s+='<rect x="168" y="118" width="20" height="54" rx="3" fill="#efe9dc" stroke="'+C.frame+'" stroke-width="4"/><circle cx="182" cy="150" r="11" fill="#28312F" opacity="0.14"/>';
  s+='<rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="20" fill="'+C.light+'" opacity="0.5"/></svg>';return s;
}

/* Datos: se leen de la FUENTE CANÓNICA content.js (ES + CA). */
var C=window.CUENTOS_CONTENT, LANG=window.CUENTOS_LANG||(function(){try{return localStorage.getItem("aprens_cuentos_lang");}catch(e){return null;}}())||"es"; if(!C.ui[LANG])LANG="es"; var UI=C.ui[LANG];
var BOOKS={};
C.order.forEach(function(id){var b=C.books[id][LANG];BOOKS[id]={title:b.title,sub:UI.sub,story:b.story,ideas:b.ideas,frase:b.frase,head:b.head,states:b.states};});
window.CUENTOS_BOOKS=BOOKS;

/* -------- cache warming (índice) -------- */
window.warmCuentos=function(){
  var urls=[]; Object.keys(BOOKS).forEach(function(id){var n=BOOKS[id].story.length+1;for(var i=1;i<=n;i++)urls.push("img/"+id+"-p"+pad(i)+".webp");});
  var i=0;
  function next(){ if(i>=urls.length)return; var u=urls[i++]; try{fetch(u,{cache:"force-cache"}).catch(function(){});}catch(e){} (window.requestIdleCallback||function(f){setTimeout(f,180);})(next); }
  (window.requestIdleCallback||function(f){setTimeout(f,600);})(next);
};

/* -------- lector -------- */
window.initReader=function(id){
  var B=BOOKS[id]; if(!B){document.body.textContent="Cuento no encontrado.";return;}
  var n=B.story.length, total=n+1;
  var POS="aprens_cuentos_pos_"+id, CALM="aprens_cuentos_calm";
  var img=function(k){return "img/"+id+"-p"+pad(k)+".webp";};
  var stage=document.getElementById("stage");

  // páginas
  var pages=[{k:"cover"},{k:"intro"}];
  for(var i=0;i<n;i++)pages.push({k:"story",t:B.story[i],img:img(i+1),state:(B.states&&B.states[i])||null});
  pages.push({k:"closing",img:img(n+1)});

  var vp=document.getElementById("viewport"), els=[];
  pages.forEach(function(pg){
    var d=document.createElement("div"); d.className="rd-page";
    if(pg.k==="cover"){
      d.innerHTML='<div class="rd-cover"><div class="bg"><img src="'+img(1)+'" alt=""></div><div class="scrim"></div>'+
        '<div class="in"><div class="kick">'+UI.hubTitle+'</div><h1>'+B.title+'</h1><div class="sub">'+B.sub+'</div>'+
        '<div class="go"><button id="rdStart">'+UI.start+'</button></div></div></div>';
    } else if(pg.k==="intro"){
      var sv=UI.states.map(function(s){return '<div class="s">'+ventana(s[0],58)+'<small>'+s[1]+'</small></div>';}).join("");
      d.innerHTML='<div class="rd-intro"><p>'+UI.introP1+'</p>'+
        '<div class="rd-states">'+sv+'</div>'+
        '<p>'+UI.introP2+'</p></div>';
    } else if(pg.k==="closing"){
      d.innerHTML='<div class="rd-closing"><div class="rd-art"><img src="'+pg.img+'" alt=""></div>'+
        '<div class="cbox"><h3>'+(B.head||"Cosas que ahora sabemos de Nil")+'</h3><ul>'+B.ideas.map(function(x){return '<li>'+x+'</li>';}).join("")+
        '</ul><div class="frase">'+B.frase+'</div></div></div>';
    } else {
      var win=pg.state?'<div class="rd-win" aria-hidden="true">'+ventana(pg.state,120)+'</div>':'';
      d.innerHTML='<div class="rd-art"><img src="'+pg.img+'" alt=""></div><div class="rd-band'+(pg.state?' has-win':'')+'">'+win+'<p>'+pg.t+'</p></div>';
    }
    vp.appendChild(d); els.push(d);
  });

  // chrome
  var bar=document.getElementById("bar"), count=document.getElementById("count"), prevBtn=document.getElementById("prevBtn");
  // rótulos e idioma según la selección (ES/CA)
  try{document.documentElement.lang=LANG; document.title=B.title;
      var homeA=bar.querySelector(".home"); if(homeA)homeA.textContent=UI.home; prevBtn.textContent=UI.back;}catch(e){}
  var idx=0; try{var sv2=parseInt(localStorage.getItem(POS),10); if(sv2>=0&&sv2<els.length)idx=sv2;}catch(e){}
  try{if(localStorage.getItem(CALM)==="1")stage.classList.add("calm");}catch(e){}
  function updateChrome(){
    var storyLike=(pages[idx].k==="story"||pages[idx].k==="closing");
    if(storyLike){var num=(idx-1); count.textContent=num+" / "+total; count.style.display="";}
    else {count.style.display="none";}
    prevBtn.hidden=(idx<=0); // "Atrás" oculto solo en la portada
  }
  function show(n2){ if(n2<0||n2>=els.length||n2===idx)return; els[idx].classList.remove("on"); idx=n2; els[idx].classList.add("on"); updateChrome(); try{localStorage.setItem(POS,idx);}catch(e){} wake(); }
  els[idx].classList.add("on"); updateChrome();

  // La barra de navegación (Inicio / Atrás / Modo tranquilo) queda SIEMPRE visible
  // para no perder al lector. Solo el contador de página se difumina al leer.
  var t=null;
  function wake(){ count.classList.remove("hide"); if(t)clearTimeout(t); t=setTimeout(function(){ count.classList.add("hide"); },2600); }
  wake();

  function toggleChrome(){ if(count.classList.contains("hide"))wake(); else {count.classList.add("hide");if(t)clearTimeout(t);} }
  prevBtn.onclick=function(){ show(idx-1); };
  document.getElementById("calmBtn").onclick=function(){ var on=stage.classList.toggle("calm"); this.textContent=on?UI.calmOff:UI.calmOn; try{localStorage.setItem(CALM,on?"1":"0");}catch(e){} wake(); };
  document.getElementById("calmBtn").textContent=stage.classList.contains("calm")?UI.calmOff:UI.calmOn;
  document.addEventListener("keydown",function(e){ if(e.key==="ArrowRight")show(idx+1); else if(e.key==="ArrowLeft")show(idx-1); else wake(); });

  // navegación por posición del clic (deja pasar botones/enlaces/inputs)
  var swiped=false;
  stage.addEventListener("click",function(e){
    if(e.target.closest("button,a,input")){ if(e.target.id==="rdStart")show(1); return; }
    if(swiped)return;
    var r=stage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width;
    if(x<0.33)show(idx-1); else if(x>0.67)show(idx+1); else toggleChrome();
  });
  // swipe horizontal
  var sx=0,sy=0;
  stage.addEventListener("touchstart",function(e){sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY;wake();},{passive:true});
  stage.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){ swiped=true; setTimeout(function(){swiped=false;},350); show(idx+(dx<0?1:-1)); }},{passive:true});
  stage.addEventListener("mousemove",wake);
};
})();
