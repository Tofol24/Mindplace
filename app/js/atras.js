/* APRENS · «atrás» paso a paso dentro de una herramienta.
   ---------------------------------------------------------------------------
   Problema: las herramientas cambian de pantalla sin dejar rastro en el
   historial, así que «← Atrás» (cabecera de la app) o el gesto de atrás del
   móvil sacaban de la herramienta en vez de volver a la pantalla anterior.

   Uso, al final del script de la herramienta:
     AprensAtras.vigilar({
       vista: function(){ return <pantalla actual, texto o número>; },
       ir:    function(v){ <muestra la pantalla v, sin más efectos>; }
     });

   Cada vez que cambia la pantalla (por un clic, un temporizador…) se apunta
   la anterior y se añade una entrada al historial. Al ir atrás (botón de la
   app, botón o gesto del navegador) se vuelve a ella. Cuando ya no quedan
   pantallas, «atrás» sale de la herramienta como siempre.
   Funciona igual dentro de la app (iframe del mismo origen) que abierta sola.
*/
(function(){
  "use strict";
  if (window.AprensAtras) return;
  var pila = [], cfg = null, actual = null, volviendo = false, pendiente = 0, marca = "aprensAtras";

  function leer(){ try { var v = cfg.vista(); return v == null ? null : String(v); } catch (e) { return null; } }

  function comprobar(){
    pendiente = 0;
    if (!cfg || volviendo) return;
    var v = leer();
    if (v === null || v === actual) return;
    if (actual !== null) {
      pila.push(actual);
      try { history.pushState({ aprensAtras: marca, n: pila.length }, ""); } catch (e) { /* sin historial: queda el botón de la app */ }
    }
    actual = v;
  }
  function programar(){ if (!pendiente) pendiente = setTimeout(comprobar, 0); }

  function volverUna(){
    if (!pila.length) return false;
    var v = pila.pop();
    volviendo = true;
    try { cfg.ir(v); } catch (e) { /* si falla, al menos no se queda bloqueado */ }
    actual = leer() || v;
    volviendo = false;
    try { window.scrollTo(0, 0); } catch (e) {}
    return true;
  }

  window.addEventListener("popstate", function(){
    // El navegador ya ha quitado la entrada: solo hay que pintar la pantalla anterior.
    if (pila.length) volverUna();
  });

  window.AprensAtras = {
    vigilar: function(c){
      if (!c || typeof c.vista !== "function" || typeof c.ir !== "function") return;
      cfg = c; actual = leer();
      // Cualquier cambio de pantalla: clics, teclado, envíos y temporizadores (cambios en la página).
      ["click", "change", "submit", "keyup"].forEach(function(t){ document.addEventListener(t, programar, true); });
      try { new MutationObserver(programar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style"] }); } catch (e) {}
    },
    // Lo usa la cabecera de la app: true si ha retrocedido dentro de la herramienta.
    atras: function(){
      comprobar();
      if (!pila.length) return false;
      try { history.back(); } catch (e) { return volverUna(); }
      return true;
    },
    profundidad: function(){ return pila.length; }
  };
  // Si la herramienta ya tenía su propio gancho, se respeta; si no, se usa este.
  if (typeof window.APRENS_toolBack !== "function") window.APRENS_toolBack = function(){ return window.AprensAtras.atras(); };
})();
