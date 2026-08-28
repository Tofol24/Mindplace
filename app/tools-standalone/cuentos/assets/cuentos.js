/* APRENS · Cuentos — datos + motor del lector */
(function(){
"use strict";
function pad(n){return (n<10?"0":"")+n;}

/* ventana de capacidad (SVG) — misma gramática que la herramienta 🌊 */
function ventana(state,size){
  var C={verde:{light:'#6F8F83',rows:1,perRow:1,frame:'#4a4a42',mut:0},amarillo:{light:'#C6A66B',rows:1,perRow:3,frame:'#4a4a42',mut:0},naranja:{light:'#CE8A56',rows:2,perRow:3,frame:'#464038',mut:.05},rojo:{light:'#B85C52',rows:3,perRow:4,frame:'#3a332f',mut:.16},azul:{light:'#7895A8',rows:1,perRow:3,frame:'#45474a',mut:.10,door:true}}[state];
  var inX=20,inW=160,floor=172,top=34;
  var s='<svg width="'+size+'" height="'+size+'" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g'+state+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.light+'" stop-opacity="0.95"/><stop offset="1" stop-color="'+C.light+'" stop-opacity="0.30"/></linearGradient><clipPath id="c'+state+'"><rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="'+(floor-top+8)+'" rx="8"/></clipPath></defs><rect x="8" y="8" width="184" height="184" rx="18" fill="#efe9dc" stroke="'+C.frame+'" stroke-width="6"/><g clip-path="url(#c'+state+')"><rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="'+(floor-top+8)+'" fill="url(#g'+state+')"/>';
  if(C.mut)s+='<rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="'+(floor-top+8)+'" fill="#28312F" opacity="'+C.mut+'"/>';
  s+='<line x1="'+inX+'" y1="'+floor+'" x2="'+(inX+inW)+'" y2="'+floor+'" stroke="#28312F" stroke-opacity="0.28" stroke-width="2"/>';
  var r=15;for(var row=0;row<C.rows;row++){var cy=floor-r-row*(2*r+4)-2;for(var i=0;i<C.perRow;i++){var sp=(C.perRow>1)?(inW-2*r-8):0;var cx=(C.perRow===1)?(inX+inW/2):(inX+r+6+i*(sp/(C.perRow-1)));s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#28312F" opacity="0.16"/><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#28312F" stroke-opacity="0.34" stroke-width="2"/>';}}
  s+='</g>';if(C.door)s+='<rect x="168" y="118" width="20" height="54" rx="3" fill="#efe9dc" stroke="'+C.frame+'" stroke-width="4"/><circle cx="182" cy="150" r="11" fill="#28312F" opacity="0.14"/>';
  s+='<rect x="'+inX+'" y="'+top+'" width="'+inW+'" height="20" fill="'+C.light+'" opacity="0.5"/></svg>';return s;
}

var SUB="Una historia de Nil, para leer con calma.";
var BOOKS={
 c1:{title:"No era así como tenía que pasar",sub:SUB,
  story:[
   "Este es Nil. Se sabe de memoria las líneas de tren de media isla. Y algún día de la otra media.",
   "Hoy es sábado. Y el sábado tenían un plan: ir a ver los trenes antiguos. Lo esperaba desde el lunes.",
   "—Nil, hoy no podemos ir. Ha surgido algo. Iremos otro día.",
   "—Pero habíamos dicho que hoy. Lo dijimos el lunes. Era hoy.",
   "Nil vuelve a explicarlo. Y otra vez. Si lo dice bien, quizá vuelva a encajar.",
   "Su madre se lo explica mejor. Con más palabras. Con más motivos.",
   "Nil nota las manos apretadas. La barriga dura. Todo hace más ruido.",
   "Ahora las palabras entran, pero ya no caben. Nil quiere que todo vuelva atrás.",
   "Es como si llegaran demasiados trenes a la vez. La estación ya no puede con más.",
   "Su madre lo entiende: ahora no necesita más explicaciones. Deja de hablar.",
   "Solo dice: —Estoy aquí.",
   "Poco a poco, algún tren empieza a salir. Queda un poco de sitio.",
   "Nil todavía no quiere hablar. Se queda mirando sus mapas. Su madre no le pregunta nada.",
   "Más tarde, cuando ya hay sitio otra vez, Nil se acuerda:\n—Cuando has dicho «otro día», la barriga se me ha puesto dura enseguida."],
  ideas:["A veces los cambios pesan mucho.","Cuando insiste mucho, quizá le queda poco espacio.","Cuando queda poco espacio, necesita menos palabras.","«Estoy aquí» a veces basta."],
  frase:"No tengo que poder con todo yo solo."},
 c2:{title:"Hoy todo pesaba más",sub:SUB,
  story:[
   "Hay días fáciles. Y hay días que, sin saber muy bien por qué, pesan más desde por la mañana.",
   "En el patio había mucho ruido. En clase, aún más.",
   "Iban a hacer una cosa. Al final hicieron otra. Nil no dijo nada, pero lo notó.",
   "Un compañero le habló, luego otro, luego había que decidir con quién ir. Todo a la vez.",
   "Y tenía hambre. Y calor. Y la etiqueta de la camiseta molestaba desde la mañana.",
   "Por fuera parecía un día normal. Por dentro casi no quedaba sitio.",
   "Después del cole fueron a comprar. Mucha gente, mucha luz, muchas voces.",
   "Entonces pasó algo pequeño: había que irse ya. Solo eso.",
   "Y de repente todo salió de golpe. Lágrimas, cuerpo en el suelo, demasiado ruido por dentro.",
   "Su madre pensó: «Pero si solo le he dicho que nos vamos…». Y enseguida lo vio: no era solo eso.",
   "La gente miraba. Su madre notó su propia cara caliente, la prisa, las ganas de que aquello acabara ya. Paró.",
   "No tenía que demostrar a nadie que «controlaba» a Nil. Solo tenía que cuidarlo.",
   "Buscó un sitio más tranquilo. Menos luz, menos voces. Pocas palabras:\n—Estoy aquí. Vamos a un sitio más tranquilo.",
   "Poco a poco, el cuerpo de Nil se fue soltando. No estaba «ya bien». Estaba recuperándose.",
   "En casa, más tarde, Nil dijo:\n—Hoy ya me había levantado con poco sitio."],
  ideas:["Cuando está cansado, las cosas pequeñas pueden hacerse enormes.","A veces no es una cosa: es esto + esto + esto.","Fuera de casa también se puede parar y hacer sitio.","Recuperarse no es estar listo para hablar todavía."],
  frase:"Cuando todo se hace demasiado, podemos hacer espacio."},
 c3:{title:"No salió como yo pensaba",sub:SUB,
  story:[
   "Nil había preparado su mapa nuevo toda la semana. Hoy quería enseñárselo a los demás y jugar juntos a las estaciones.",
   "En su cabeza ya sabía cómo iría: enseñar el mapa, repartir estaciones, jugar. Justo así.",
   "Pero los otros querían jugar a otra cosa. Y cambiaron las reglas sin avisar.",
   "—Pero habíamos quedado en jugar a las estaciones. Eso no tiene sentido.",
   "Nil intentaba entender por qué había cambiado todo. Cuanto más lo intentaba, más se le apretaban las manos.",
   "Encima, eligieron a otro para empezar. Y a Nil le tocaba esperar.",
   "La cabeza le iba muy deprisa: «no es justo, no es así, no lo entiendo». Y el sitio por dentro casi se acababa.",
   "Nil notó una pista: las manos duras, las ganas de que nadie le hablara. Todavía le quedaba un poquito de sitio.",
   "No siempre se puede. Pero esta vez pudo decir bajito:\n—Necesito un momento.",
   "Un monitor se acercó sin agobiar:\n—Vale. Cuando quieras, te explico a qué van a jugar ahora.",
   "Nil no volvió enseguida. Se quedó un rato con su mapa, mirándolo. Nadie le metió prisa.",
   "No salió como lo había imaginado. Cuando volvió a tener sitio, pudo decidir qué quería hacer.",
   "Luego pensó:\n—Puedo enfadarme mucho y, aun así, pedir un momento. Las dos cosas caben."],
  ideas:["A veces las cosas no salen como las había imaginado, y eso duele de verdad.","Puede sentir mucho sin que sea «portarse mal».","A veces puede pedir un momento, un poco de tiempo o que le expliquen qué va a pasar.","Y a veces no llega a tiempo, y también está bien."],
  frase:"No tengo que poder con todo yo solo."}
};
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
  for(var i=0;i<n;i++)pages.push({k:"story",t:B.story[i],img:img(i+1)});
  pages.push({k:"closing",img:img(n+1)});

  var vp=document.getElementById("viewport"), els=[];
  pages.forEach(function(pg){
    var d=document.createElement("div"); d.className="rd-page";
    if(pg.k==="cover"){
      d.innerHTML='<div class="rd-cover"><div class="bg"><img src="'+img(1)+'" alt=""></div><div class="scrim"></div>'+
        '<div class="in"><div class="kick">Los cuentos de Nil</div><h1>'+B.title+'</h1><div class="sub">'+B.sub+'</div>'+
        '<div class="go"><button id="rdStart">Empezar</button></div></div></div>';
    } else if(pg.k==="intro"){
      var st=[["verde","hay espacio"],["amarillo","se llena"],["naranja","queda poco"],["rojo","casi no cabe"],["azul","descansando"]];
      var sv=st.map(function(s){return '<div class="s">'+ventana(s[0],58)+'<small>'+s[1]+'</small></div>';}).join("");
      d.innerHTML='<div class="rd-intro"><p>A veces tenemos <b>mucho espacio</b> por dentro para pensar, escuchar y elegir. Y otras veces queda <b>muy poquito</b>.</p>'+
        '<div class="rd-states">'+sv+'</div>'+
        '<p>Esta pequeña ventana nos ayudará a verlo mientras acompañamos a Nil.</p></div>';
    } else if(pg.k==="closing"){
      d.innerHTML='<div class="rd-closing"><div class="rd-art"><img src="'+pg.img+'" alt=""></div>'+
        '<div class="cbox"><h3>Cosas que ahora sabemos de Nil</h3><ul>'+B.ideas.map(function(x){return '<li>'+x+'</li>';}).join("")+
        '</ul><div class="frase">'+B.frase+'</div></div></div>';
    } else {
      d.innerHTML='<div class="rd-art"><img src="'+pg.img+'" alt=""></div><div class="rd-band"><p>'+pg.t+'</p></div>';
    }
    vp.appendChild(d); els.push(d);
  });

  // chrome
  var bar=document.getElementById("bar"), count=document.getElementById("count"), prevBtn=document.getElementById("prevBtn");
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
  document.getElementById("calmBtn").onclick=function(){ var on=stage.classList.toggle("calm"); this.textContent=on?"Salir del modo":"Modo tranquilo"; try{localStorage.setItem(CALM,on?"1":"0");}catch(e){} wake(); };
  document.getElementById("calmBtn").textContent=stage.classList.contains("calm")?"Salir del modo":"Modo tranquilo";
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
