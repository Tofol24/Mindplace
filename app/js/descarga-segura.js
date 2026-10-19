/* APRENS · Descarga segura desde herramientas embebidas
   ------------------------------------------------------------
   Las herramientas se abren dentro del hub en un <iframe> del mismo origen.
   Safari (macOS e iOS) no respeta el atributo `download` de un enlace pulsado
   dentro de un iframe: intenta navegar el propio iframe a la URL blob:/data:,
   y la CSP del sitio (frame-src 'self') lo bloquea. Resultado: «Exportar» no
   hace nada. Chrome sí lo respeta, por eso solo fallaba en Safari.

   Este script, cargado en cada herramienta que exporta archivos, intercepta el
   clic programático en enlaces de descarga (a.download + blob:/data:) y, solo
   cuando la herramienta está embebida, hace la descarga desde la ventana
   principal (mismo origen), que es donde Safari sí la permite. Fuera de un
   iframe no cambia nada.
*/
(function () {
  'use strict';
  if (window.top === window) return;
  var top;
  try { top = window.top; if (!top.document || !top.document.body) return; } catch (e) { return; }

  var originalClick = HTMLAnchorElement.prototype.click;
  function esDescarga(el) {
    return el && el.getAttribute && el.getAttribute('download') !== null &&
      /^(blob:|data:)/i.test(el.getAttribute('href') || '');
  }
  // Descarga desde la ventana principal; devuelve false si no se pudo.
  function descargarArriba(el) {
    try {
      var a = top.document.createElement('a');
      a.href = el.href;
      a.download = el.getAttribute('download') || '';
      a.rel = 'noopener';
      a.style.display = 'none';
      top.document.body.appendChild(a);
      originalClick.call(a);
      setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 4000);
      return true;
    } catch (e) { return false; }
  }
  // 1) Clic programático: a.click() (lo que hacen casi todas las herramientas).
  HTMLAnchorElement.prototype.click = function () {
    if (esDescarga(this) && descargarArriba(this)) return;
    return originalClick.apply(this, arguments);
  };
  // 2) Clic de la persona en un enlace de descarga ya pintado en la página.
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('a[download]') : null;
    if (el && esDescarga(el) && descargarArriba(el)) ev.preventDefault();
  }, true);
})();
