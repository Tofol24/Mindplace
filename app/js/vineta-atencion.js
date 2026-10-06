/* APRENS · VinetaAtencion — viñeta compartida «para · respira · vuelve»
   (parada de pensamiento, TEC cap. 11.2 §1 y Anexo D). Tres paneles:
     1) sobrepienso: la atención (luz amarilla) se va al bucle; el cuerpo en automático;
     2) me doy cuenta y PARO; suelto el bucle sin discutir con él;
     3) respiro llevando la atención al cuerpo —silueta AIS con las dos luces si
        RespiroAIS está cargado— aunque no note nada, y VUELVO a lo que hacía.
   Es el tercer tiempo (reorientar / micro-acción con valor): una práctica que acaba
   en la calma sin devolver a la persona a algo concreto está incompleta.
   Sin dependencias obligatorias; CSS propio inyectado una vez; el mismo texto en
   todas las apps para que la viñeta signifique lo mismo en todas partes.

   Uso:
     var v = VinetaAtencion.mount(document.getElementById('caja'), {
       silueta: true,                   // panel 3 con RespiroAIS si está disponible
       rhythm: {inhale:4000, anchor:2000, exhale:6000, pause:1500},   // 4·2·6
       titulo: 'Para · respira · vuelve', // '' para ocultar
       pie: true,                        // nota «No basta con parar y respirar…»
       cta: { label:'Ver «Mi día a día» →', onClick:fn }   // o { label, href }
     });
     v.destroy();
*/
(function (global) {
  'use strict';

  var CSS = [
    '.va{display:block}',
    '.va-t{font-weight:600;font-size:12px;color:var(--azul,#1B4F8C);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}',
    '.va-grid{display:grid;grid-template-columns:1fr;gap:12px}',
    '@media(min-width:620px){.va-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '.va-p{background:var(--fondo,#F0F4F8);border:1px solid #E3EAF3;border-radius:14px;padding:12px 12px 14px;text-align:center}',
    '.va-p>svg{width:100%;max-width:240px;height:auto;display:block;margin:0 auto}',
    '.va-n{display:inline-block;background:var(--azul,#1B4F8C);color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;font-size:12px;font-weight:700;margin-bottom:6px}',
    '.va-c{font-size:12.5px;color:#1a1a2e;margin-top:8px;line-height:1.5}',
    '.va-dot{color:#C8973A}',
    '.va-sil3{display:flex;align-items:center;justify-content:center;gap:4px;max-width:240px;margin:0 auto;min-height:150px}',
    '.va-silbox{flex:1 1 136px;max-width:136px;min-width:0;border-radius:12px;overflow:hidden}',
    /* Dentro de la viñeta solo la figura y las dos luces: sin pastilla de fase ni contador. */
    '.va-silbox .ra-ui,.va-silbox .ra-count,.va-silbox .ra-legend{display:none!important}',
    '.va-sil3>svg{flex:0 1 92px;width:92px;min-width:56px;height:auto}',
    '.va-pie{margin-top:10px;background:var(--azulLt,#E6EEF5);border-left:4px solid var(--azul,#1B4F8C);border-radius:0 10px 10px 0;padding:12px 15px;font-size:12.5px;color:var(--azul,#1B4F8C);line-height:1.6}',
    '.va-cta{display:inline-block;margin-top:8px;background:#fff;color:var(--azul,#1B4F8C);border:2px solid var(--azul,#1B4F8C);border-radius:30px;padding:7px 14px;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:none;font-family:inherit;line-height:1.2}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('vineta-atencion-css')) return;
    var s = document.createElement('style'); s.id = 'vineta-atencion-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Figura de palo: (cx,cy) cabeza; brazos como pares de puntos.
  function figura(cx, cy, brazos) {
    var h = '<g stroke="#4a6572" stroke-width="3" stroke-linecap="round" fill="none">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="#e4ecf1" stroke-width="2.4"/>' +
      '<line x1="' + cx + '" y1="' + (cy + 11) + '" x2="' + cx + '" y2="' + (cy + 46) + '"/>';
    brazos.forEach(function (b) { h += '<line x1="' + cx + '" y1="' + (cy + b[0]) + '" x2="' + (cx + b[1]) + '" y2="' + (cy + b[2]) + '"/>'; });
    h += '<line x1="' + cx + '" y1="' + (cy + 46) + '" x2="' + (cx - 11) + '" y2="' + (cy + 72) + '"/>' +
      '<line x1="' + cx + '" y1="' + (cy + 46) + '" x2="' + (cx + 11) + '" y2="' + (cy + 72) + '"/></g>';
    return h;
  }
  function svg1() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="En automático mientras sobrepienso">' +
      '<rect x="18" y="120" width="78" height="8" rx="3" fill="#cfd9e1"/>' +
      figura(56, 62, [[22, -16, 38], [22, 24, 42]]) +
      '<rect x="78" y="100" width="10" height="9" rx="2" fill="#bcd0dd"/>' +
      '<circle cx="80" cy="46" r="2.6" fill="#fff" stroke="#c9d3db"/><circle cx="90" cy="39" r="4" fill="#fff" stroke="#c9d3db"/>' +
      '<ellipse cx="178" cy="44" rx="64" ry="33" fill="#fff" stroke="#c9d3db" stroke-width="2"/>' +
      '<path d="M130 46 q12 -17 24 -4 q10 11 21 -2 q12 -13 23 3 q9 11 19 0" fill="none" stroke="#9aa7b0" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M136 58 q14 10 27 -2 q10 -10 22 3 q9 9 20 -2" fill="none" stroke="#bcc6cf" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="156" cy="32" r="6" fill="#E9B458"/><circle cx="156" cy="32" r="11" fill="#E9B458" opacity=".25"/>' +
      '<text x="200" y="36" text-anchor="middle" font-size="10" fill="#6B7280" font-style="italic">¿y si…?</text>' +
      '<text x="150" y="60" text-anchor="middle" font-size="10" fill="#6B7280" font-style="italic">otra vez…</text></svg>';
  }
  function svg2() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Me doy cuenta y paro">' +
      '<rect x="18" y="120" width="78" height="8" rx="3" fill="#cfd9e1"/>' +
      figura(56, 62, [[20, -16, 4], [22, 18, 36]]) +
      '<ellipse cx="170" cy="42" rx="50" ry="26" fill="none" stroke="#cdd8e0" stroke-width="2" stroke-dasharray="4 5" opacity=".7"/>' +
      '<g transform="translate(176,44)"><polygon points="-15,-26 15,-26 26,-15 26,15 15,26 -15,26 -26,15 -26,-15" fill="#C0392B"/>' +
      '<text x="0" y="5" text-anchor="middle" font-size="12" fill="#fff" font-weight="700">PARA</text></g></svg>';
  }
  // Panel 3 sin silueta (reserva): figura con la luz amarilla bajando al cuerpo,
  // el aire azul y la flecha verde de vuelta a la tarea.
  function svg3() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Respiro y vuelvo a lo que hacía">' +
      '<rect x="150" y="120" width="88" height="8" rx="3" fill="#cfd9e1"/>' +
      figura(60, 56, [[22, -16, 38], [22, 16, 38]]) +
      '<line x1="60" y1="50" x2="60" y2="98" stroke="#E9B458" stroke-width="3" stroke-dasharray="2 4" opacity=".85"/>' +
      '<circle cx="60" cy="96" r="7" fill="#E9B458"/><circle cx="60" cy="96" r="12" fill="#E9B458" opacity=".25"/>' +
      '<path d="M72 52 q10 -4 18 0" stroke="#3FA6D8" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="92" cy="52" r="3.4" fill="#3FA6D8"/>' +
      '<path d="M92 116 q28 8 52 2" stroke="#2E7D5E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<polygon points="142,112 152,118 142,124" fill="#2E7D5E"/></svg>';
  }
  // Junto a la silueta: la vuelta a la tarea (flecha verde).
  function svg3b() {
    return '<svg viewBox="0 0 120 100" role="img" aria-label="Vuelvo a lo que estaba haciendo">' +
      '<rect x="34" y="58" width="78" height="8" rx="3" fill="#cfd9e1"/>' +
      '<path d="M6 52 q30 12 60 4" stroke="#2E7D5E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<polygon points="64,50 76,56 64,62" fill="#2E7D5E"/>' +
      '<text x="73" y="86" text-anchor="middle" font-size="9.5" fill="#6B7280" font-style="italic">lo que hacía</text></svg>';
  }
  function panel(n, inner, cap) { return '<div class="va-p"><span class="va-n">' + n + '</span>' + inner + '<div class="va-c">' + cap + '</div></div>'; }

  var CAP1 = 'Sobrepienso y mi <b>atención</b> (<span class="va-dot">●</span>) se va arriba, al bucle. El cuerpo hace las cosas en <b>automático</b>.';
  var CAP2 = 'Me doy cuenta: «<b>Para</b>». Suelto el bucle — <b>no discuto</b> con él.';
  var CAP3 = '<b>Respiro</b> llevando la atención al cuerpo (<span class="va-dot">●</span>), <b>aunque no note nada</b>, y <b>vuelvo</b> a lo que estaba haciendo — ahora presente.';
  var PIE = 'No basta con parar y respirar: hay que <b>volver a algo</b>. Tener claro qué me toca hacer ahora —aunque sea descansar o algo cotidiano— y poner ahí la atención.';

  function mount(container, opts) {
    opts = opts || {};
    injectCSS();
    var useSil = opts.silueta !== false && !!(global.RespiroAIS && global.RespiroAIS.mount);
    var titulo = opts.titulo == null ? 'Para · respira · vuelve' : opts.titulo;
    var cta = opts.cta && opts.cta.label
      ? (opts.cta.href
          ? '<br><a class="va-cta" href="' + esc(opts.cta.href) + '">' + esc(opts.cta.label) + '</a>'
          : '<br><button type="button" class="va-cta">' + esc(opts.cta.label) + '</button>')
      : '';
    container.classList.add('va');
    container.innerHTML =
      (titulo ? '<div class="va-t">' + esc(titulo) + '</div>' : '') +
      '<div class="va-grid">' +
        panel(1, svg1(), CAP1) +
        panel(2, svg2(), CAP2) +
        panel(3, useSil ? '<div class="va-sil3"><div class="va-silbox"></div>' + svg3b() + '</div>' : svg3(), CAP3) +
      '</div>' +
      (opts.pie !== false ? '<div class="va-pie">' + PIE + cta + '</div>' : '');

    var sil = null;
    if (useSil) {
      var box = container.querySelector('.va-silbox');
      try {
        sil = global.RespiroAIS.mount(box, {
          lang: 'es', figure: 'organism', showControl: false, showZones: false, legend: false, autostart: true,
          rhythm: opts.rhythm || { inhale: 4000, anchor: 2000, exhale: 6000, pause: 1500 }
        });
      } catch (e) { sil = null; var wrap = container.querySelector('.va-sil3'); if (wrap) wrap.outerHTML = svg3(); }
    }
    var btn = container.querySelector('button.va-cta');
    if (btn && opts.cta && typeof opts.cta.onClick === 'function') btn.addEventListener('click', opts.cta.onClick);

    return {
      destroy: function () {
        if (sil) { try { sil.destroy(); } catch (e) {} sil = null; }
        container.innerHTML = ''; container.classList.remove('va');
      }
    };
  }

  global.VinetaAtencion = { mount: mount };
})(window);
