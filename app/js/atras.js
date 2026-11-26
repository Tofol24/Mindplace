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

   Se guarda la lista de pantallas visitadas (pasos) y en cuál se está (pos).
   Cada entrada del historial lleva su posición, así que atrás y adelante del
   navegador llevan exactamente a la pantalla de esa posición. Si la propia
   herramienta vuelve a la pantalla anterior con su botón («Anterior», «Volver»…),
   se cuenta como un paso atrás, no como uno nuevo.
   Funciona igual dentro de la app (iframe del mismo origen) que abierta sola.
*/
(function(){
  "use strict";
  if (window.AprensAtras) return;
  var pasos = [], pos = 0, cfg = null, aplicando = false, pendiente = 0, MARCA = "aprensAtras";

  function leer(){ try { var v = cfg.vista(); return v == null ? null : String(v); } catch (e) { return null; } }
  function posDe(estado){ return estado && estado[MARCA] === true && typeof estado.n === "number" ? estado.n : 0; }

  function comprobar(){
    pendiente = 0;
    if (!cfg || aplicando) return;
    var v = leer();
    if (v === null || v === pasos[pos]) return;
    if (pos > 0 && v === pasos[pos - 1]) {
      // La herramienta ha vuelto atrás con su propio botón: se retrocede también en el historial
      // (el popstate que llega encontrará la pantalla ya puesta y no hará nada).
      pos--;
      try { history.back(); } catch (e) {}
      return;
    }
    pasos = pasos.slice(0, pos + 1);
    pasos.push(v); pos++;
    try { history.pushState({ aprensAtras: true, n: pos }, ""); } catch (e) { /* sin historial: queda el botón de la app */ }
  }
  // Pequeña espera: agrupa los cambios de una misma acción y no recalcula en cada fotograma de una animación.
  function programar(){ if (!pendiente) pendiente = setTimeout(comprobar, 80); }

  function aplicar(n){
    if (n < 0 || n >= pasos.length) return;
    pos = n;
    if (leer() === pasos[n]) return;   // ya está en esa pantalla
    aplicando = true;
    try { cfg.ir(pasos[n]); } catch (e) { /* si falla, al menos no se queda bloqueado */ }
    aplicando = false;
    // Si la herramienta ha llevado a otra pantalla segura (no a la pedida), se anota así.
    var real = leer(); if (real !== null) pasos[n] = real;
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  // Algunas herramientas reescriben la dirección (#sección) con replaceState: se conserva la marca de
  // posición de esa entrada, para que atrás y adelante sigan sabiendo a qué pantalla llevan.
  try {
    var reemplazar = history.replaceState;
    history.replaceState = function(estado, titulo, url){
      if (cfg && !(estado && estado[MARCA] === true)) {
        var marca = { aprensAtras: true, n: posDe(history.state) };
        estado = (estado && typeof estado === "object") ? Object.assign({}, estado, marca) : marca;
      }
      return arguments.length > 2 ? reemplazar.call(history, estado, titulo, url) : reemplazar.call(history, estado, titulo);
    };
  } catch (e) {}

  window.addEventListener("popstate", function(e){
    if (!cfg) return;
    clearTimeout(pendiente); pendiente = 0;
    aplicar(posDe(e.state));   // sirve tanto para atrás como para adelante
  });

  window.AprensAtras = {
    vigilar: function(c){
      if (!c || typeof c.vista !== "function" || typeof c.ir !== "function") return;
      cfg = c;
      var v = leer();
      pasos = [v === null ? "" : v]; pos = 0;
      try { history.replaceState({ aprensAtras: true, n: 0 }, ""); } catch (e) {}
      ["click", "change", "submit", "keyup"].forEach(function(t){ document.addEventListener(t, programar, true); });
      try { new MutationObserver(programar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style", "aria-selected"] }); } catch (e) {}
    },
    // Lo usa la cabecera de la app: true si ha retrocedido dentro de la herramienta.
    atras: function(){
      clearTimeout(pendiente); comprobar();
      if (pos <= 0) return false;
      try { history.back(); } catch (e) { aplicar(pos - 1); }
      return true;
    },
    profundidad: function(){ return pos; }
  };
  // Si la herramienta ya tenía su propio gancho, se respeta; si no, se usa este.
  if (typeof window.APRENS_toolBack !== "function") window.APRENS_toolBack = function(){ return window.AprensAtras.atras(); };
})();
