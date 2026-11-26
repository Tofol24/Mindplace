/* APRENS · tarjeta «Tu código de acceso» del menú de la app.
   Servidor: netlify/lib/acceso.mjs (/api/acceso/*). Por ahora el código es VOLUNTARIO:
   sin código se sigue entrando igual. El código y su fecha se guardan solo en este
   dispositivo; al servidor solo viaja el código. Misma lógica que la tarjeta de Mi espacio
   (inicio/index.html). El enlace del WhatsApp es #/codigo/APR-XXXX-XXXX (lo atiende js/app.js).
*/
(function(){
  var API="api/", K="aprens_acceso";
  var caja=null, publicado = location.protocol!=="file:";
  var estado={cfg:null, ocupado:false, msg:"", tipo:"", form:false};
  // Si el navegador no deja guardar (modo privado, sin espacio…), el código se conserva en memoria
  // para poder verlo y copiarlo, y se avisa de que no quedará guardado.
  var mem, enMemoria=false;   // enMemoria: la última escritura falló y manda lo que hay en memoria
  function leer(){ if(enMemoria) return mem||null; try{ var o=JSON.parse(localStorage.getItem(K)||"null"); return o&&o.codigo?o:null; }catch(e){ return mem||null; } }
  function guardar(o){ mem=o||null; try{ if(o) localStorage.setItem(K, JSON.stringify(o)); else localStorage.removeItem(K); enMemoria=false; return true; }catch(e){ enMemoria=true; return false; } }
  var NO_GUARDA=" Este navegador no deja guardarlo: apúntalo o hazle una captura.";
  function esc(x){ return String(x||"").replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function fecha(ms){ try{ return new Date(ms).toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Madrid"}); }catch(e){ return ""; } }
  function fechaDia(d){ return d ? fecha(Date.parse(d+"T12:00:00Z")) : ""; }
  function norm(c){ var s=String(c||"").toUpperCase().replace(/[^0-9A-Z]/g,""); if(s.length===11&&s.indexOf("APR")===0) s=s.slice(3); return s.length===8 ? "APR-"+s.slice(0,4)+"-"+s.slice(4) : ""; }
  function pedir(ruta, cuerpo){
    var o={method:cuerpo?"POST":"GET", headers:cuerpo?{"content-type":"application/json"}:{}};
    if(cuerpo) o.body=JSON.stringify(cuerpo);
    return fetch(API+ruta,o).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(b){ b._status=r.status; return b; }); });
  }
  function aviso(t,tipo){ estado.msg=t; estado.tipo=tipo||""; }
  function pintar(){
    if(!caja || !document.body.contains(caja)) return;
    var a=leer(), ahora=Date.now(), h='<h2 id="accTit">Tu código de acceso</h2>';
    var auto = estado.cfg && estado.cfg.autoAbierto;
    if(a && a.caduca>=ahora){
      h+='<p>Este es tu código personal del espacio APRENS. Es válido hasta el <b>'+esc(fecha(a.caduca))+'</b> y se queda guardado en este dispositivo.</p>'
        +'<div class="acc-cod">'+esc(a.codigo)+'</div>'
        +'<p>Guárdalo o hazle una captura: si cambias de móvil o borras los datos del navegador, te lo volveremos a pedir.</p>'
        +'<div class="acc-btns"><button type="button" class="sec" data-acc="copiar">Copiar el código</button><button type="button" class="sec" data-acc="otro">Tengo otro código</button></div>';
    } else {
      if(a) h+='<p>Tu código <b>'+esc(a.codigo)+'</b> caducó el '+esc(fecha(a.caduca))+'. Pide a tu psicólogo/a uno nuevo para seguir acompañándote con estas herramientas.</p>';
      else h+='<p>A partir de ahora, el espacio APRENS funcionará con un código personal que te dará tu psicólogo/a, asociado al tiempo que entendemos que te va a acompañar durante la terapia. Por ahora puedes seguir entrando como siempre, sin código.</p>';
      if(auto) h+='<p>Hasta el <b>'+esc(fechaDia(estado.cfg.autoHasta))+'</b> puedes pedir el tuyo aquí mismo. Es válido durante '+esc(estado.cfg.mesesAuto||3)+' meses.</p>';
      h+='<div class="acc-btns">'
        +(auto?'<button type="button" data-acc="solicitar"'+(estado.ocupado?' disabled':'')+'>Solicitar mi código</button>':'')
        +(estado.form?'':'<button type="button" class="sec" data-acc="tengo">Ya tengo un código</button>')+'</div>';
    }
    if(estado.form){
      h+='<form data-acc="form" novalidate><label for="accIn">Escribe tu código</label>'
        +'<input id="accIn" name="codigo" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="APR-XXXX-XXXX" maxlength="20" inputmode="text">'
        +'<button type="submit"'+(estado.ocupado?' disabled':'')+'>Activar</button></form>';
    }
    h+='<p class="acc-msg'+(estado.tipo?' '+estado.tipo:'')+'" role="status" aria-live="polite">'+esc(estado.msg)+'</p>';
    var foco=document.activeElement && caja.contains(document.activeElement) ? (document.activeElement.getAttribute("data-acc")||document.activeElement.id) : null;
    var valor=document.getElementById("accIn") ? document.getElementById("accIn").value : "";
    caja.innerHTML=h; caja.hidden=false;
    var inp=document.getElementById("accIn"); if(inp && valor) inp.value=valor;
    if(foco){ var f=document.getElementById(foco)||caja.querySelector('[data-acc="'+foco+'"]'); if(f) f.focus(); }
  }
  function activar(c){
    var cod=norm(c);
    if(!cod){ aviso("Este código no tiene el formato correcto. Debería ser como APR-7K2M-9QXD.","err"); pintar(); return; }
    if(!publicado){ aviso("Para activar el código hace falta abrir la app desde su dirección web.","err"); pintar(); return; }
    estado.ocupado=true; aviso("Comprobando el código…"); pintar();
    pedir("acceso/validar",{codigo:cod}).then(function(r){
      estado.ocupado=false;
      if(r.valido){ var ok=guardar({codigo:r.codigo, caduca:r.caduca, comprobado:Date.now()}); estado.form=false; aviso(ok?"Código activado. Ya está guardado en este dispositivo.":"Código activado."+NO_GUARDA, ok?"ok":"err"); }
      else if(r.motivo==="caducado") aviso("Este código ya ha caducado. Pide a tu psicólogo/a uno nuevo.","err");
      else if(r.motivo==="revocado") aviso("Este código ya no está activo. Pregunta a tu psicólogo/a.","err");
      else if(r._status===429) aviso("Demasiados intentos seguidos. Prueba de nuevo dentro de un minuto.","err");
      else aviso("No encuentro este código. Revisa que esté bien escrito.","err");
      pintar();
    }).catch(function(){ estado.ocupado=false; aviso("Ahora no hay conexión. Prueba de nuevo en un momento.","err"); pintar(); });
  }
  function solicitar(){
    estado.ocupado=true; aviso("Preparando tu código…"); pintar();
    pedir("acceso-solicitar",{}).then(function(r){
      estado.ocupado=false;
      if(r.codigo){ var ok=guardar({codigo:r.codigo, caduca:r.caduca, comprobado:Date.now()}); estado.form=false; aviso(ok?"Ya tienes tu código. Está guardado en este dispositivo.":"Ya tienes tu código."+NO_GUARDA, ok?"ok":"err"); }
      else if(r._status===403){ estado.cfg={autoAbierto:false}; aviso("El periodo para pedir el código aquí ya ha terminado. Pídeselo a tu psicólogo/a.","err"); }
      else if(r._status===429) aviso("Ya se han pedido varios códigos desde aquí. Si has perdido el tuyo, pídeselo a tu psicólogo/a.","err");
      else aviso("No se ha podido crear el código. Prueba de nuevo en un momento.","err");
      pintar();
    }).catch(function(){ estado.ocupado=false; aviso("Ahora no hay conexión. Prueba de nuevo en un momento.","err"); pintar(); });
  }
  function enganchar(){
    caja.addEventListener("click", function(e){
    var b=e.target.closest("button[data-acc]"); if(!b) return;
    var q=b.getAttribute("data-acc");
    if(q==="solicitar") solicitar();
    if(q==="tengo"||q==="otro"){ estado.form=true; aviso(""); pintar(); var i=document.getElementById("accIn"); if(i) i.focus(); }
    if(q==="copiar"){
      var a=leer(), fallo=function(){ aviso("No se ha podido copiar. Mantén el dedo sobre el código para seleccionarlo, o hazle una captura.","err"); pintar(); };
      if(a&&navigator.clipboard) navigator.clipboard.writeText(a.codigo).then(function(){ aviso("Código copiado.","ok"); pintar(); },fallo); else fallo();
    }
  });
    caja.addEventListener("submit", function(e){ e.preventDefault(); var i=document.getElementById("accIn"); activar(i?i.value:""); });
  }
  var configPedida=false, comprobada=false;
  window.AprensAcceso={
    // Pinta la tarjeta en el elemento (el menú se vuelve a dibujar a menudo: se reengancha cada vez).
    montar:function(el){
      if(!el) return;
      caja=el; enganchar(); pintar();
      if(publicado && !configPedida){ configPedida=true; pedir("acceso/config").then(function(c){ if(c&&c._status===200){ estado.cfg=c; pintar(); } }).catch(function(){ configPedida=false; }); }
      if(!comprobada){ comprobada=true; comprobarGuardado(); }
    },
    // Enlace del WhatsApp (#/codigo/APR-…): rellena el código y lo activa.
    activar:function(c){ estado.form=true; pintar(); var i0=document.getElementById("accIn"); if(i0) i0.value=norm(c)||c; activar(c); }
  };
  function comprobarGuardado(){
  // Una vez al día se vuelve a comprobar el código guardado, por si el psicólogo/a lo ha anulado.
    var g=leer();
    if(publicado && g && g.caduca>=Date.now() && Date.now()-(g.comprobado||0)>864e5){
      pedir("acceso/validar",{codigo:g.codigo}).then(function(r){
        if(r._status!==200) return;   // sin servicio o demasiados intentos: se deja como estaba
        var ahora=leer(); if(!ahora || ahora.codigo!==g.codigo) return;   // mientras tanto se ha activado otro
        if(r.valido) guardar({codigo:r.codigo, caduca:r.caduca, comprobado:Date.now()});
        else if(r.motivo==="caducado") guardar({codigo:g.codigo, caduca:Math.min(g.caduca, r.caduca||Date.now()), comprobado:Date.now()});
        else { guardar(null); aviso("Tu código "+g.codigo+" ya no está activo. Pregunta a tu psicólogo/a.","err"); }
        pintar();
      }).catch(function(){});
    }
  }
})();
