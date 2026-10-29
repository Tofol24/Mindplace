/* APRENS · Screening TEC/AIS — motor clínico compartido.
   Lo usan el Screening (tools-standalone/screening-tec.html) y el Panel del
   psicólogo (panel/), para que los dos lean, puntúen y pauten igual.
   Script clásico: las constantes y funciones quedan globales. */
// ═══ MOTOR ICE (transversal, todos los pacientes) ═══
// inv:true => puntuación alta del ítem = PEOR (se invierte para que alto=mejor regulación)
const ICE={
  L:{nombre:"Latencia",icon:"⏱",desc:"Espacio entre activación interna e impulso de respuesta",items:[
    {id:"L1",inv:true,t:"Reacciono antes de darme cuenta de lo que estoy haciendo."},
    {id:"L2",inv:true,t:"Me cuesta hacer una pausa antes de contestar o actuar."},
    {id:"L3",inv:true,t:"Cuando algo me activa, necesito resolverlo inmediatamente."},
    {id:"L4",inv:false,t:"Puedo respirar y esperar unos segundos antes de actuar."},
    {id:"L5",inv:false,t:"Puedo notar el impulso sin obedecerlo enseguida."},
  ]},
  D:{nombre:"Densidad",icon:"🌊",desc:"Carga y mezcla de microoscilaciones internas",items:[
    {id:"D1",inv:true,t:"Mi estado interno cambia muchas veces a lo largo del día."},
    {id:"D2",inv:true,t:"Paso rápido de preocupación a irritación, tristeza o bloqueo."},
    {id:"D3",inv:true,t:"Tengo muchas microtensiones internas aunque desde fuera no se note."},
    {id:"D4",inv:true,t:"Me cuesta saber qué siento porque todo aparece mezclado."},
    {id:"D5",inv:true,t:"Mi cuerpo está en alerta aunque no haya una amenaza clara."},
  ]},
  C:{nombre:"Continuidad",icon:"🔗",desc:"Sostener atención, presencia y dirección sin fragmentarse",items:[
    {id:"C1",inv:true,t:"Me cuesta sostener una tarea sin desconectarme."},
    {id:"C2",inv:true,t:"Me cuesta mantener una conversación estando presente."},
    {id:"C3",inv:true,t:"Empiezo cosas y salto a otras sin cerrarlas."},
    {id:"C4",inv:true,t:"Cuando intento sentir el cuerpo, enseguida me voy al pensamiento."},
    {id:"C5",inv:false,t:"Puedo sostener la atención en pecho, cuello o estómago durante unos segundos."},
  ]},
};

// ═══ 6 PATRONES DE VECTOR ATENCIONAL ═══
// Cada ítem 0-10: mayor valor = mayor presencia del patrón
const PATRONES={
  AP:{n:1,id:"AP",nombre:"Ansioso-preocupativo",icon:"🌀",color:"#E07B39",
    desc:"Vector al futuro, anticipación, búsqueda de certeza, sobrepensamiento como control",
    items:[
      {id:"AP1",t:"Mi atención se va al futuro intentando anticipar problemas."},
      {id:"AP2",t:"Cuando aparece una sensación interna, mi mente busca una solución aunque no haya nada concreto que resolver."},
      {id:"AP3",t:"Me cuesta diferenciar entre pensar de forma útil y sobrepensar para calmarme."},
      {id:"AP4",t:"Siento que si dejo de preocuparme, algo malo puede pasar."},
      {id:"AP5",t:"Me cuesta actuar con normalidad hasta sentir que tengo el control."},
    ]},
  RD:{n:2,id:"RD",nombre:"Rumiativo-depresivo",icon:"🌫️",color:"#4A7FC1",
    desc:"Vector al pasado, culpa, pérdida, frustración, colapso del vector de acción",
    items:[
      {id:"RD1",t:"Mi atención vuelve al pasado buscando errores, culpa o explicaciones."},
      {id:"RD2",t:"Siento que he intentado controlar mi malestar y, al no conseguirlo, me he ido apagando."},
      {id:"RD3",t:"Las actividades que antes tenían sentido ahora me generan rechazo o indiferencia."},
      {id:"RD4",t:"Me cuesta iniciar conductas aunque sepa que me ayudarían."},
      {id:"RD5",t:"Mi cuerpo evita situaciones cotidianas porque las asocia con malestar."},
    ]},
  HS:{n:3,id:"HS",nombre:"Hipervigilante-somático",icon:"🫀",color:"#C0392B",
    desc:"Sensación corporal como amenaza, miedo al síntoma, fusión sensación = peligro",
    items:[
      {id:"HS1",t:"Mi atención se fija en síntomas corporales o señales de peligro."},
      {id:"HS2",t:"Cuando aparece una sensación física, mi atención queda atrapada en esa zona."},
      {id:"HS3",t:"Me cuesta distinguir entre sentir una sensación y estar en peligro."},
      {id:"HS4",t:"Evito movimientos o actividades por miedo a que el cuerpo empeore."},
      {id:"HS5",t:"Me cuesta acompañar una sensación sin intentar cambiarla de inmediato."},
    ]},
  CE:{n:4,id:"CE",nombre:"Compulsivo-evitativo",icon:"🔁",color:"#7B4FC1",
    desc:"Neutralización, comprobación, evitación, control externo, alivio inmediato",
    items:[
      {id:"CE1",t:"Cuando noto malestar, necesito hacer algo rápido para aliviarlo."},
      {id:"CE2",t:"Hago comprobaciones o repito acciones para reducir la inquietud."},
      {id:"CE3",t:"Evito situaciones que me generan incertidumbre o que no puedo controlar."},
      {id:"CE4",t:"Pospongo cosas para no enfrentar el malestar que me generan."},
      {id:"CE5",t:"Necesito seguridad externa (preguntar, confirmar) para quedarme tranquilo/a."},
    ]},
  BD:{n:5,id:"BD",nombre:"Bloqueo-desactivación",icon:"🌑",color:"#6B7280",
    desc:"Apagamiento, abulia, desconexión, retirada, pérdida de iniciativa",
    items:[
      {id:"BD1",t:"Mi atención se va hacia la desconexión: me quedo en blanco o ausente."},
      {id:"BD2",t:"Ante el malestar, mi respuesta es apagarme o retirarme."},
      {id:"BD3",t:"Pierdo la iniciativa y me cuesta arrancar incluso cosas pequeñas."},
      {id:"BD4",t:"Siento el cuerpo pesado, sin energía para dirigir la acción."},
      {id:"BD5",t:"Me desconecto de lo que siento para no tener que gestionarlo."},
    ]},
  ID:{n:6,id:"ID",nombre:"Impulsivo-disperso",icon:"⚡",color:"#1B9E8A",
    desc:"Estímulo inmediato, baja continuidad, salto atencional, búsqueda dopaminérgica",
    items:[
      {id:"ID1",t:"Mi atención salta de una cosa a otra sin continuidad."},
      {id:"ID2",t:"Busco estímulos inmediatos (móvil, comida, movimiento) cuando algo me incomoda."},
      {id:"ID3",t:"Inicio acciones cuando la urgencia ya es muy alta, no antes."},
      {id:"ID4",t:"Mi mente va más rápido que mi capacidad de ordenar la acción."},
      {id:"ID5",t:"Me cuesta sostener una conducta si no hay una recompensa próxima."},
    ]},
};
const PORDEN=["AP","RD","HS","CE","ID","BD"]; // orden por nº de patrón (n=1..6) reordenado abajo
const PAT_BY_N={1:"AP",2:"RD",3:"HS",4:"CE",5:"BD",6:"ID"};
// Conducta de alivio (dígito 3)
const ALIVIO={1:"Evitación",2:"Comprobación / neutralización",3:"Posposición",4:"Aislamiento",5:"Sobrepensamiento",6:"Impulsividad / estímulo inmediato",7:"Bloqueo / no acción",8:"Búsqueda de seguridad externa"};
const ICE_DIG={1:"Latencia",2:"Densidad",3:"Continuidad"};

// ═══ 8 MÓDULOS TERAPÉUTICOS (4ª cifra) ═══
// Contenido literal de la documentación del proyecto. prof = lectura clínica; pac = texto para el paciente (mensaje del terapeuta).
const MODULOS={
  1:{nombre:"AIS basal",
     prof:"El paciente usa AIS sobre todo como respuesta al malestar o como intento de control. Objetivo: entrenar presencia interna aunque no haya malestar, para que el cuerpo aprenda que la conciencia está disponible sin exigirle cambiar.",
     pac_titulo:"Entrenar la presencia interna sin esperar a estar mal",
     pac_por:"He visto en tus registros que estás usando la respiración y la atención al cuerpo sobre todo cuando ya estás mal. Esta semana quiero que cambiemos eso: vamos a entrenar la presencia cuando NO hace falta, para que tu cuerpo aprenda que estás disponible para él sin tener que cambiar nada.",
     pac_consigna:"No practico para quitarme nada. Practico para que mi cuerpo sepa que estoy aquí.",
     pac_tarea:"Cada 2 horas aproximadamente: una respiración diafragmática y lleva la atención a pecho, estómago o cuello durante 10-20 segundos. No busques sentir nada concreto. Anota simplemente: he estado presente aunque no hiciera falta."},
  2:{nombre:"Ampliación de latencia",
     prof:"Reacción rápida, impulsividad, evitación inmediata o necesidad urgente de resolver. Objetivo: aumentar el espacio entre activación interna y respuesta.",
     pac_titulo:"Ganar unos segundos antes de responder",
     pac_por:"Tu cuerpo tiende a reaccionar muy rápido, antes de que puedas elegir. No se trata de responder mejor de golpe, sino de ganar unos segundos antes de actuar.",
     pac_consigna:"Mi tarea no es responder mejor de golpe. Mi tarea es ganar unos segundos antes de responder.",
     pac_tarea:"Cuando notes activación: párate, di mentalmente STOP, respira, localiza la sensación en el cuerpo y espera 10 segundos antes de hablar, actuar, escribir o decidir."},
  3:{nombre:"Activación con valores y tiempo límite",
     prof:"Bloqueo, abulia, posposición o rumiación con pérdida de acción. Objetivo: pasar de pensar/esperar ganas a iniciar una conducta mínima con sentido.",
     pac_titulo:"Empezar pequeño, sin esperar las ganas",
     pac_por:"Tu cuerpo tiende a apagarse o bloquearse cuando aparece malestar. No vamos a esperar a que aparezcan ganas. Vamos a enseñarle al cuerpo que puede empezar poco a poco, con presencia y sin exigencia.",
     pac_consigna:"No necesito estar bien para empezar. Empiezo pequeño para que mi cuerpo vuelva a confiar.",
     pac_tarea:"Elige una acción mínima diaria y ponle hora límite (ej: a las 10:30 empiezo durante 5 minutos). Antes de empezar: una respiración y atención al cuerpo. Después anota solo si lo iniciaste, no si salió perfecto."},
  4:{nombre:"Reducción de sobrepensamiento",
     prof:"Preocupación, rumiación, búsqueda de certeza o análisis constante. Objetivo: diferenciar pensamiento útil de sobrepensamiento como conducta de control.",
     pac_titulo:"Distinguir pensar de dar vueltas",
     pac_por:"He notado que tu mente se queda dando vueltas buscando seguridad o control. Vamos a aprender a distinguir cuándo pensar te lleva a algo concreto y cuándo es solo una forma de intentar calmarte que no funciona.",
     pac_consigna:"Si pensar no me lleva a una acción concreta, vuelvo al cuerpo.",
     pac_tarea:"Cuando aparezca el sobrepensamiento, pregúntate: ¿esto me lleva a una acción concreta ahora? Si no hay acción: STOP, respiración, sensación interna y una microconducta presente."},
  5:{nombre:"Honestidad emocional desde dentro",
     prof:"Dificultad vincular, aislamiento, tensión familiar, miedo a expresar o tendencia a explotar tarde. Objetivo: nombrar la sensación interna sin justificarla ni culpar al otro.",
     pac_titulo:"Compartir lo que sientes desde el cuerpo",
     pac_por:"Trabajaremos en poder expresar lo que sientes sin tener que explicarlo perfectamente ni convertirlo en reproche. No necesitas un relato largo: basta con señalar dónde lo notas.",
     pac_consigna:"No necesito explicar perfectamente lo que siento. Puedo compartir dónde lo noto.",
     pac_tarea:"Una vez al día, con alguien de confianza: di \"no sé por qué, pero me siento... aquí\" señalando pecho, estómago, cuello o garganta. Sin relato largo, sin justificar, sin reproche."},
  6:{nombre:"Exposición interoceptiva compasiva",
     prof:"Hipervigilancia corporal, dolor crónico, miedo a síntomas o fusión sensación = peligro. Objetivo: cambiar la relación con la sensación corporal sin convertirla en amenaza.",
     pac_titulo:"Acompañar la sensación en vez de vigilarla",
     pac_por:"Tu atención queda atrapada vigilando las sensaciones del cuerpo como si fueran un peligro. Vamos a cambiar esa relación: acompañar la sensación sin luchar contra ella ni comprobar si baja.",
     pac_consigna:"Sentir no significa peligro. Mi cuerpo necesita que lo acompañe, no que lo vigile.",
     pac_tarea:"Elige una zona del cuerpo, respira y obsérvala 20-30 segundos diciéndote internamente: puedo estar contigo sin cambiarte. Después haz una acción pequeña con valor. Importante: no es para comprobar si el síntoma baja, es para acompañar."},
  7:{nombre:"Continuidad atencional",
     prof:"Dispersión, saltos entre tareas, impulsividad estimular o baja persistencia. Objetivo: sostener un vector de acción durante pequeños bloques de tiempo.",
     pac_titulo:"Sostener una dirección durante unos minutos",
     pac_por:"Tu atención salta de una cosa a otra y cuesta cerrar lo que empiezas. No necesitas hacerlo todo: vamos a entrenar sostener una sola dirección durante bloques cortos.",
     pac_consigna:"No necesito hacerlo todo. Necesito sostener una dirección durante unos minutos.",
     pac_tarea:"Bloques de 10 minutos, una sola tarea, móvil fuera. Antes de empezar: respiración y sensación interna. Si te distraes: STOP, cuerpo y vuelta. Anota cuántas veces volviste, no cuántas te distrajiste."},
  8:{nombre:"Co-AIS / regulación vincular",
     prof:"Conflictos de pareja, familia o hijos, discusiones o reactividad interpersonal. Objetivo: entrar en el vínculo desde presencia corporal, no desde defensa o ataque.",
     pac_titulo:"Volver a ti antes de responder al otro",
     pac_por:"En los vínculos importantes, el dolor se convierte rápido en reacción. Vamos a entrenar volver a tu cuerpo antes de responder, para entrar desde la presencia y no desde la defensa.",
     pac_consigna:"Antes de responder al otro, vuelvo a mí para no convertir mi dolor en reacción.",
     pac_tarea:"Antes de una conversación difícil: respira, nota pecho/estómago/cuello, di \"ahora noto esto en mi cuerpo\" y habla desde la necesidad o la vulnerabilidad, no desde la acusación. Frases breves."},
};
// Regla base: módulo inicial según código de 3 cifras (cuando aún no hay seguimientos)
function moduloBase(a){
  const dom=a.dominante, ice=a.iceAlt, ali=a.alivioDig;
  // Prioridad clínica derivada de la documentación
  if(dom==="HS") return 6;
  if(dom==="ID") return 7;
  if(dom==="CE") return (ali===2)?4:2;
  if(dom==="AP") return 4;
  if(dom==="RD") return 3;
  if(dom==="BD") return 3;
  if(ice==="L") return 2;
  if(ice==="C") return 7;
  return 1;
}
// Por evolución: recalcula módulo prioritario según los últimos seguimientos
function moduloEvolucion(seg, a, contexto){
  if(!seg||!seg.length) return {mod:moduloBase(a), motivo:"Módulo inicial según la formulación base (aún sin registros de seguimiento)."};
  const ult=seg.slice(-3); // últimos 3 registros
  const prom=(f)=>{const v=ult.map(s=>s.score[f]).filter(x=>x!=null);return v.length?v.reduce((p,c)=>p+c,0)/v.length:null;};
  const aisB=prom("aisBasal"), aisR=prom("aisReactivo"), lat=prom("latencia"), cont=prom("continuidad"), val=prom("valores");
  // sobrepensamiento e activación: derivamos de resp S2 y S1 (más alto crudo = peor)
  const sob=(()=>{const v=ult.map(s=>s.resp&&s.resp.S2!=null?s.resp.S2:null).filter(x=>x!=null);return v.length?v.reduce((p,c)=>p+c,0)/v.length:null;})();
  const hon=prom("aisBasal"); // placeholder no usado
  const honest=(()=>{const v=ult.map(s=>s.resp&&s.resp.S10!=null?s.resp.S10:null).filter(x=>x!=null);return v.length?v.reduce((p,c)=>p+c,0)/v.length:null;})();
  const activ=(()=>{const v=ult.map(s=>s.score&&s.score.activacion!=null?s.score.activacion:null).filter(x=>x!=null);return v.length?v.reduce((p,c)=>p+c,0)/v.length:null;})();
  // Reglas por evolución (orden de prioridad clínica del documento)
  if(aisB!=null&&aisR!=null&&aisR>aisB) return {mod:1,motivo:"El AIS se está usando más como respuesta al malestar que como entrenamiento basal. Prioridad: reinstaurar la práctica basal."};
  if(lat!=null&&lat<5) return {mod:2,motivo:"La latencia sigue baja: el sistema responde antes de poder elegir. Prioridad: ampliar el espacio antes de la respuesta."};
  if(val!=null&&val<5 && (a.dominante==="RD"||a.dominante==="BD")) return {mod:3,motivo:"Conducta con valor baja con tendencia al bloqueo. Prioridad: activación con tiempo límite."};
  if(sob!=null&&sob>=3) return {mod:4,motivo:"Sobrepensamiento elevado en los últimos registros. Prioridad: diferenciar pensar de control."};
  // S10 va de 0 a 4: se pasa a 0-10 para comparar con el mismo umbral (5) que el resto.
  if(honest!=null&&honest*2.5<5) return {mod:5,motivo:"Honestidad emocional baja. Prioridad: nombrar la sensación desde el cuerpo en el vínculo."};
  if(activ!=null&&activ<5 && a.dominante==="HS") return {mod:6,motivo:"Activación corporal alta con vector somático. Prioridad: exposición interoceptiva compasiva."};
  if(cont!=null&&cont<5) return {mod:7,motivo:"Continuidad atencional baja sostenida. Prioridad: sostener dirección en bloques cortos."};
  if(contexto && /pareja|familiar|crianza/i.test(contexto)) return {mod:8,motivo:"Contexto vincular con reactividad. Prioridad: regulación vincular antes de responder."};
  return {mod:moduloBase(a),motivo:"Evolución estable; se mantiene el módulo coherente con la formulación base."};
}
// ═══ DATOS FASE 0 ═══
const CONTEXTOS=["Laboral","Familiar","Pareja","Académico","Dolor físico","Salud","Crianza","Rendimiento","Trauma","Otro"];
const SITUACIONES=["Crisis aguda","Seguimiento estable","Recaída","Baja laboral","Retorno adaptativo","Prevención"];

// ═══ SEGUIMIENTO DIARIO/SEMANAL (escala 0-4) ═══
// dir:+1 => más alto MEJOR · dir:-1 => más alto PEOR (se invierte para índice)
const SEG_ITEMS=[
  {id:"S1",dir:-1,t:"Activación interna media del día (cuánta tensión/alerta he notado por dentro)."},
  {id:"S2",dir:-1,t:"Sobrepensamiento o rumiación (vueltas mentales sin salida)."},
  {id:"S3",dir:-1,t:"Conductas evitativas o compulsivas (evitar, comprobar, posponer, aislarme...)."},
  {id:"S4",dir:+1,t:"Latencia: he podido hacer una pausa antes de reaccionar."},
  {id:"S5",dir:-1,t:"Densidad emocional (mezcla e intensidad de estados internos cambiando)."},
  {id:"S6",dir:+1,t:"Continuidad atencional: he podido sostener atención y dirección sin fragmentarme."},
  {id:"S7",dir:+1,t:"Conducta alineada con mis valores (he hecho algo que importa aunque hubiera malestar)."},
  {id:"S8",dir:+1,t:"Práctica AIS basal: he entrenado presencia interna AUNQUE NO hiciera falta."},
  {id:"S9",dir:+1,t:"Práctica AIS en activación: he usado la presencia interna en un momento de malestar."},
  {id:"S10",dir:+1,t:"Honestidad emocional: he podido reconocer o expresar lo que sentía desde el cuerpo."},
];
const SEG_CUALI="¿Cuál ha sido hoy el momento donde mi cuerpo más necesitaba que mi conciencia estuviera presente?";
function scoreSeg(resp){
  // Cada ítem 0-4. Normalizamos a 0-10 en sentido positivo (alto=mejor).
  const o={};
  SEG_ITEMS.forEach(it=>{const v=resp[it.id];o[it.id]=v===undefined?null:(it.dir<0?(4-v):v);});
  const vals=SEG_ITEMS.map(it=>o[it.id]).filter(v=>v!==null);
  o.indice = vals.length?Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*2.5*10)/10:null; // 0-4 -> 0-10
  // Indicadores clave separados (0-10):
  const n=(v)=>v===undefined?null:Math.round(v*2.5*10)/10;
  o.activacion = resp.S1===undefined?null:Math.round((4-resp.S1)*2.5*10)/10;
  // Densidad emocional (S5), invertida como la D del screening inicial: alto = mejor.
  o.densidad = resp.S5===undefined?null:Math.round((4-resp.S5)*2.5*10)/10;
  o.latencia = n(resp.S4);
  o.continuidad = n(resp.S6);
  o.valores = n(resp.S7);
  o.aisBasal = n(resp.S8);
  o.aisReactivo = n(resp.S9);
  return o;
}

// ═══ SCORING ═══
function scoreICE(p,resp){
  const c=ICE[p];
  const vals=c.items.map(it=>{const v=resp[it.id];return v===undefined?null:(it.inv?(10-v):v);}).filter(v=>v!==null);
  return vals.length?Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10:null;
}
function scorePatron(k,resp){
  const c=PATRONES[k];
  const vals=c.items.map(it=>{const v=resp[it.id];return v===undefined?null:v;}).filter(v=>v!==null);
  return vals.length?Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10:null;
}
function analizar(resp){
  const ice={L:scoreICE("L",resp),D:scoreICE("D",resp),C:scoreICE("C",resp)};
  // parámetro ICE más alterado = el de menor puntuación (menor = peor regulación)
  let iceAlt="L",mn=99;
  ["L","D","C"].forEach(p=>{ if(ice[p]!==null && ice[p]<mn){mn=ice[p];iceAlt=p;} });
  // patrones ordenados por puntuación desc
  const pl=Object.keys(PATRONES).map(k=>({k,s:scorePatron(k,resp)})).filter(x=>x.s!==null).sort((a,b)=>b.s-a.s);
  const dominante=pl.length?pl[0].k:null;
  // secundarios: patrones con score >= 5 y al menos a 1.0 del dominante o destacados
  const secundarios=pl.slice(1).filter(x=>x.s>=5.0).map(x=>x.k);
  // conducta de alivio predominante: derivada del patrón dominante (mapeo clínico)
  const ALIVIO_POR_PATRON={AP:5,RD:7,HS:2,CE:1,BD:7,ID:6};
  // refinamiento: si CE alto, comprobación; si AP alto, sobrepensamiento; etc.
  let alivioDig=ALIVIO_POR_PATRON[dominante]||1;
  // si hay un secundario CE fuerte, la conducta de alivio puede ser comprobación
  const sCE=pl.find(x=>x.k==="CE"); if(sCE&&sCE.s>=7 && dominante!=="CE") alivioDig=2;
  const iceDig={L:1,D:2,C:3}[iceAlt];
  return {ice,iceAlt,iceDig,patrones:pl,dominante,secundarios,alivioDig};
}

// ═══ CÓDIGO 3 DÍGITOS ═══
// d1=patrón dominante(1-6) · d2=ICE más alterado(1-3) · d3=conducta alivio(1-8)
function codificar(a){
  const d1=PATRONES[a.dominante].n;
  const d2=a.iceDig;
  const d3=a.alivioDig;
  return ""+d1+d2+d3;
}
function decodificar(code){
  if(!/^\d{3}$/.test(code))return null;
  const d1=+code[0],d2=+code[1],d3=+code[2];
  if(d1<1||d1>6||d2<1||d2>3||d3<1||d3>8)return null;
  return {patron:PAT_BY_N[d1], ice:{1:"L",2:"D",3:"C"}[d2], alivio:d3};
}

// ═══ FORMULACIÓN + PAUTA ═══
function formulacion(a){
  const dom=PATRONES[a.dominante];
  const sec=a.secundarios.map(k=>PATRONES[k].nombre);
  const iceTxt=[];
  if(a.ice.L!==null)iceTxt.push("latencia "+nivel(a.ice.L));
  if(a.ice.D!==null)iceTxt.push("densidad "+nivelInv(a.ice.D));
  if(a.ice.C!==null)iceTxt.push("continuidad "+nivel(a.ice.C));
  return {
    canalPrincipal:dom.nombre,
    canalDesc:dom.desc,
    secundarios:sec,
    iceTxt:iceTxt.join(", "),
    alivio:ALIVIO[a.alivioDig],
  };
}
function nivel(v){ if(v>=7)return "alta"; if(v>=4.5)return "media"; return "baja"; }
function nivelInv(v){ // para densidad: alto score (tras inversión) = baja densidad = buena
  if(v>=7)return "baja"; if(v>=4.5)return "media"; return "alta"; }
function pautaInicial(a){
  const dom=a.dominante;
  const base="El objetivo de esta semana no es reducir el malestar, sino entrenar presencia interna (AIS) aunque no haga falta, para que el cuerpo aprenda que la conciencia está disponible sin exigirle que cambie. La práctica AIS basal (sin motivo, fuera de la crisis) es prioritaria sobre el uso reactivo.";
  const esp={
    AP:"Tu atención se desplaza al futuro buscando control mediante el pensamiento. Antes de responder a una preocupación, entrena ampliar la latencia: una pausa con anclaje sensorial antes de actuar.",
    RD:"Tu atención queda atrapada en el pasado y la frustración ha colapsado el vector de acción. El foco es reactivar conducta con valor en dosis mínimas, sin esperar a tener ganas, acompañando la sensación sin rumiar.",
    HS:"Tu atención queda secuestrada por la señal corporal interpretada como amenaza. El foco es acompañar la sensación sin luchar contra ella, distinguiendo sentir de estar en peligro.",
    CE:"Tu atención busca control externo mediante comprobación o evitación, lo que da alivio inmediato pero refuerza el patrón. El foco es tolerar la incertidumbre ampliando la latencia antes de la conducta de neutralización.",
    BD:"Tu atención se desplaza hacia la desconexión y la retirada. El foco es recuperar dirección conductual mínima y presencia interna gradual, sin exigir activación emocional.",
    ID:"Tu atención salta al estímulo inmediato con baja continuidad. El foco es entrenar continuidad atencional breve y sostenida antes de actuar, reduciendo la búsqueda de recompensa próxima.",
  };
  return (esp[dom]||"")+" "+base;
}

// ═══ CÓDIGO PACIENTE→PROFESIONAL ═══
// Validación al leer: solo enteros dentro de la escala ("-" = sin responder) y fecha AAAA-MM-DD.
function valorOk(v,max){return v==="-"||(/^\d{1,2}$/.test(v)&&+v<=max);}
function fechaOk(f){return /^\d{4}-\d{2}-\d{2}$/.test(f||"");}
function todosIds(){
  const ids=[];
  ["L","D","C"].forEach(p=>ICE[p].items.forEach(it=>ids.push(it.id)));
  PORDEN.forEach(k=>PATRONES[k].items.forEach(it=>ids.push(it.id)));
  return ids;
}
function parseCodigo(code){
  try{
    const p=code.trim().split("|");
    if(p[0]!=="AICE-TEC"||p.length<5)return null;   // v1 sin consentimiento: 5 campos
    const fecha=p[2];
    const fp=decodeURIComponent(p[3]).split("~");
    const f0={nombre:fp[0]||"",edad:fp[1]||"",motivo:fp[2]||"",contexto:fp[3]||"",situacion:fp[4]||""};
    const vals=p[4].split(",");
    const ids=todosIds();
    if(vals.length!==ids.length)return null;
    if(!fechaOk(fecha)||!vals.every(v=>valorOk(v,10)))return null;
    const r={};ids.forEach((id,i)=>{if(vals[i]!=="-")r[id]=+vals[i];});
    let consent=null;
    if(p[5]){try{const cp=decodeURIComponent(p[5]).split("~");if(cp[0]==="1")consent={aceptado:1,fecha:cp[1]||"",ver:cp[2]||"",opc:(cp[3]||"").split("").map(Number)};}catch{}}
    const paciente=normCodigoPac(p[6]?decodeURIComponent(p[6]):"");
    return {fecha,fase0:f0,resp:r,consent,paciente};
  }catch{return null;}
}
function parseCodigoSeg(code){
  try{
    const p=code.trim().split("|");
    if(p[0]!=="AICE-SEG"||p.length<6)return null;   // v1 sin consentimiento: 6 campos
    const perfil=p[2],fecha=p[3],vals=p[4].split(","),cuali=decodeURIComponent(p[5]||"");
    if(vals.length!==SEG_ITEMS.length||!fechaOk(fecha)||!decodificar(perfil)||!vals.every(v=>valorOk(v,4)))return null;
    const r={};SEG_ITEMS.forEach((it,i)=>{if(vals[i]!=="-")r[it.id]=+vals[i];});
    let consent=null;
    if(p[6]){try{const cp=decodeURIComponent(p[6]).split("~");if(cp[0]==="1")consent={aceptado:1,fecha:cp[1]||"",ver:cp[2]||"",opc:(cp[3]||"").split("").map(Number)};}catch{}}
    const paciente=normCodigoPac(p[7]?decodeURIComponent(p[7]):"");
    return {perfil,fecha,resp:r,cuali,consent,paciente};
  }catch{return null;}
}

// ═══ CÓDIGO DE PACIENTE (iniciales + edad, ej: DFG22) ═══
// Mayúsculas; solo letras, cifras y . _ - (sin comillas ni signos que rompan el HTML).
// No se quitan . _ - para no fundir códigos distintos (AB.22 ≠ AB22).
function normCodigoPac(s){return String(s||"").toUpperCase().replace(/[^\p{L}\p{N}._-]/gu,"").slice(0,20);}

// ═══ ENLACE DE UN TOQUE (paciente → panel) ═══
// El registro viaja en el fragmento (#r=…): al abrir el enlace, el navegador no lo
// envía al servidor del panel; lo lee el panel en el dispositivo del psicólogo.
// Como cualquier mensaje, sí pasa por WhatsApp/email (igual que el texto de antes).
const PANEL_PUBLICO="https://aprens-app.netlify.app/panel/";
function urlPanel(){
  // Desde la propia app (o un despliegue de prueba) el panel es hermano: ../panel/
  try{if(/^https?:$/.test(location.protocol)&&/\/tools-standalone\//.test(location.pathname))return new URL("../panel/",location.href).href;}catch(e){}
  return PANEL_PUBLICO;
}
// También se codifican ' ( ) ! * para que WhatsApp no corte el enlace al detectarlo.
function enlacePanel(codigo){return urlPanel()+"#r="+encodeURIComponent(codigo).replace(/['()!*]/g,c=>"%"+c.charCodeAt(0).toString(16).toUpperCase());}
// Extrae todos los registros AICE-TEC / AICE-SEG de un texto: enlaces #r=…,
// mensajes de WhatsApp pegados enteros o códigos sueltos (uno o varios).
function extraerCodigos(texto){
  const out=[], vistos={};
  const add=c=>{c=String(c||"").trim();if(/^AICE-(TEC|SEG)\|/.test(c)&&!vistos[c]){vistos[c]=1;out.push(c);}};
  String(texto||"").replace(/[#&]r=([^\s#&"<>{}]+)/g,(m,g)=>{try{add(decodeURIComponent(g));}catch(e){}return m;});
  String(texto||"").replace(/AICE-(?:TEC|SEG)\|[^\s"<>{}]+/g,m=>{add(m);return m;});
  return out;
}

function lineaCodSeg(c){return `🔢 Para tus registros de seguimiento en el Screening, tu código es: *${c}*\n\n`;}
// ═══ MENSAJE DE PAUTA (lo envía el psicólogo al paciente) ═══
function mensajePauta(mod,nombre,codSeg){
  const m=MODULOS[mod];
  return `Hola${nombre?" "+nombre:""}, te dejo lo que vamos a trabajar esta semana 🌱\n\n`+
    `*${m.pac_titulo}*\n\n`+
    `${m.pac_por}\n\n`+
    `🧭 Para recordarlo, quédate con esta frase:\n"${m.pac_consigna}"\n\n`+
    `📝 Tarea de la semana:\n${m.pac_tarea}\n\n`+
    `🌐 Para acompañarte entre sesiones, aquí tienes tu recorrido diario:\nhttps://aprens-app.netlify.app/#/tool/recorrido_tec\nCada día te dice qué hacer y en qué orden. Tus datos se guardan solo en tu móvil y, desde «Mi semana», puedes enviarme un resumen por aquí.\n\n`+
    (codSeg?lineaCodSeg(codSeg):"")+
    `No hace falta que salga perfecto. Lo importante es que lo hagas con presencia, no con exigencia. Lo revisamos en la próxima sesión. Un abrazo.`;
}
