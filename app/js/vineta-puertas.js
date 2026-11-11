/* APRENS · VinetaPuertas — viñeta de los «rituales de entrada y salida»
   En cada entrada y en cada salida de un lugar (casa, trabajo, el coche, una
   reunión…), una respiración interna con la atención en la barriga, para dejar
   claro que entro y salgo cogiendo de la mano a mi niño interno.
   Cuatro paneles:
     1) ante la puerta, me paro un momento antes de cruzarla;
     2) respiro y la atención baja a la barriga —silueta AIS con las dos luces si
        RespiroAIS está cargado—, aunque no note nada;
     3) entro cogiendo de la mano a mi niño interno: «Entro contigo»;
     4) al salir, también: «Nos vamos juntos». En cada puerta del día.
   Mismo estilo que VinetaAbrazo. Sin dependencias obligatorias; CSS propio
   inyectado una vez. ES / CA.

   Uso:
     var v = VinetaPuertas.mount(document.getElementById('caja'), {
       lang: 'es', silueta: true, titulo: '', pie: true, juego: true
     });
     v.destroy();
   Modo automático: <div data-vineta-puertas [data-lang="ca"] [data-open]></div>
*/
(function (global) {
  'use strict';

  var SELF_SRC_J = (document.currentScript && document.currentScript.src) || '';
  function juegoLink(sub, label) {
    var root = SELF_SRC_J ? SELF_SRC_J.replace(/js\/vineta-[a-z]+\.js.*$/, '') : '../';
    return '<br><a style="display:inline-block;margin-top:8px;font-weight:700;color:inherit" href="' + root + '#/tool/juegos_exposicion/' + sub +
      '" target="_top" data-aprens-juego="' + sub + '">' + label + '</a>';
  }
  if (!global.__aprensJuegoLinks) {
    global.__aprensJuegoLinks = true;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-aprens-juego]');
      if (!a) return;
      try { var h = global.top; if (h && h.APRENS_TOOLS) { e.preventDefault(); h.location.hash = '#/tool/juegos_exposicion/' + a.getAttribute('data-aprens-juego'); } } catch (_) {}
    });
  }

  var CSS = [
    '.vp{display:block}',
    '.vp-t{font-weight:600;font-size:12px;color:var(--azul,#1B4F8C);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}',
    '.vp-grid{display:grid;grid-template-columns:1fr;gap:12px}',
    '@media(min-width:560px){.vp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.vp-p{background:var(--fondo,#F0F4F8);border:1px solid #E3EAF3;border-radius:14px;padding:12px 12px 14px;text-align:center}',
    '.vp-p>svg{width:100%;max-width:260px;height:auto;display:block;margin:0 auto}',
    '.vp-n{display:inline-block;background:var(--azul,#1B4F8C);color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;font-size:12px;font-weight:700;margin-bottom:6px}',
    '.vp-c{font-size:12.5px;color:#1a1a2e;margin-top:8px;line-height:1.5}',
    '.vp-dot{color:#C8973A}',
    '.vp-sil{max-width:150px;margin:0 auto;border-radius:12px;overflow:hidden}',
    '.vp-sil .ra-ui,.vp-sil .ra-count,.vp-sil .ra-legend{display:none!important}',
    '.vp-pie{margin-top:10px;background:var(--azulLt,#E6EEF5);border-left:4px solid var(--azul,#1B4F8C);border-radius:0 10px 10px 0;padding:12px 15px;font-size:12.5px;color:#2a2622;line-height:1.6}'
  ].join('\n');
  function injectCSS() {
    if (document.getElementById('vineta-puertas-css')) return;
    var s = document.createElement('style'); s.id = 'vineta-puertas-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var INK = '#4a6572', AIR = '#3FA6D8', MIND = '#E9B458';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function figura(cx, cy, brazos, r) {
    r = r || 11;
    var body = r * 3.2, leg = r * 2.4;
    var h = '<g stroke="' + INK + '" stroke-width="3" stroke-linecap="round" fill="none">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#e4ecf1" stroke-width="2.4"/>' +
      '<line x1="' + cx + '" y1="' + (cy + r) + '" x2="' + cx + '" y2="' + (cy + r + body) + '"/>';
    brazos.forEach(function (b) { h += '<line x1="' + cx + '" y1="' + (cy + b[0]) + '" x2="' + (cx + b[1]) + '" y2="' + (cy + b[2]) + '"/>'; });
    h += '<line x1="' + cx + '" y1="' + (cy + r + body) + '" x2="' + (cx - r) + '" y2="' + (cy + r + body + leg) + '"/>' +
      '<line x1="' + cx + '" y1="' + (cy + r + body) + '" x2="' + (cx + r) + '" y2="' + (cy + r + body + leg) + '"/></g>';
    return h;
  }
  function luz(x, y, s) {
    s = s || 1;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (11 * s) + '" fill="' + MIND + '" opacity=".28"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (5 * s) + '" fill="' + MIND + '"/>';
  }
  // Puerta (marco + hoja). abierta: hoja girada con luz cálida detrás.
  function puerta(x, y, w, h, abierta) {
    var g = '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (w + 8) + '" height="' + (h + 4) + '" rx="3" fill="#efe6d8" stroke="#d8cbb6" stroke-width="2"/>';
    if (abierta) {
      g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#f7e3b1"/>' +
        '<polygon points="' + x + ',' + y + ' ' + (x + w * 0.42) + ',' + (y + 8) + ' ' + (x + w * 0.42) + ',' + (y + h - 4) + ' ' + x + ',' + (y + h) + '" fill="#b9876a"/>';
    } else {
      g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="#b9876a"/>' +
        '<circle cx="' + (x + w - 7) + '" cy="' + (y + h / 2 + 4) + '" r="2.6" fill="#f3e3c0"/>';
    }
    return g;
  }
  function suelo() { return '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>'; }

  // 1 · Ante la puerta, paro.
  function svg1() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Ante la puerta, me paro un momento">' +
      suelo() + puerta(170, 50, 46, 78, false) +
      figura(104, 54, [[22, -14, 40], [22, 14, 40]]) +
      '<text x="104" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '">· · ·</text></svg>';
  }
  // 2 · Reserva sin silueta: respiro y la atención baja a la barriga.
  function svg2() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Respiro y la atención baja a la barriga">' +
      suelo() + puerta(176, 50, 46, 78, false) +
      figura(112, 40, [[22, -16, 40], [22, 16, 40]]) +
      '<path d="M126 36 q10 -5 18 0" stroke="' + AIR + '" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="146" cy="36" r="3.4" fill="' + AIR + '"/>' +
      '<line x1="112" y1="34" x2="112" y2="82" stroke="' + MIND + '" stroke-width="3" stroke-dasharray="2 4" opacity=".85"/>' +
      luz(112, 84, 1.1) + '</svg>';
  }
  // 3 · Entro cogiendo de la mano a mi niño interno.
  function svg3() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Entro por la puerta cogiendo de la mano a mi niño interno">' +
      suelo() + puerta(176, 50, 46, 78, true) +
      figura(146, 48, [[18, 14, 40], [18, -22, 52]]) +
      figura(112, 82, [[12, 12, 18], [12, -12, 22]], 7.5) +
      luz(146, 92, .9) + luz(112, 106, .6) +
      '<path d="M128 70 c-3 -5 -10 -2 -7 3 l7 6 l7 -6 c3 -5 -4 -8 -7 -3z" fill="#d9776a" opacity=".85"/></svg>';
  }
  // 4 · Al salir, también: en cada puerta del día.
  function svg4() {
    var d = '';
    [[22, 'C'], [92, 'T'], [162, 'R']].forEach(function (p, i) {
      d += '<rect x="' + p[0] + '" y="70" width="34" height="58" rx="2" fill="' + (i === 0 ? '#b9876a' : i === 1 ? '#8fa3ae' : '#a9b78f') + '" stroke="#d8cbb6" stroke-width="2"/>' +
        '<circle cx="' + (p[0] + 17) + '" cy="60" r="5" fill="' + MIND + '"/>';
    });
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Al salir también, y en cada puerta del día">' +
      suelo() + d +
      '<path d="M39 52 Q 74 30 109 52 Q 144 30 179 52" stroke="' + MIND + '" stroke-width="2.4" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/>' +
      figura(222, 60, [[18, -12, 34], [18, 10, 30]], 9) + figura(244, 86, [[10, -12, 14]], 6.5) +
      luz(222, 98, .7) + '</svg>';
  }

  var TXT = {
    es: {
      t: 'Paro · respiro · entro contigo',
      c1: 'Ante la puerta (casa, trabajo, el coche, una reunión…), <b>me paro</b> un momento antes de cruzarla.',
      c2: 'Hago <b>una respiración</b> y la atención baja a la <b>barriga</b> (<span class="vp-dot">●</span>). Aunque no note nada, también vale.',
      c3: 'Entro <b>cogiendo de la mano a mi niño interno</b>: «Entro contigo». No se queda fuera.',
      c4: 'Y al salir, también: «<b>Nos vamos juntos</b>». En <b>cada puerta del día</b>, unos segundos.',
      juego: '🎮 Entrénalo jugando: Puertas →',
      pie: 'En cada puerta, cojo de la mano a mi niño interno. No se queda fuera ni atrás: <b>va conmigo a cada lugar</b>. Así llego a los demás desde mí, y no desde el automático. Es también una forma de <b>aparecer</b> para mi cuerpo muchas veces al día, sin esperar al malestar.'
    },
    ca: {
      t: 'M\'aturo · respiro · entro amb tu',
      c1: 'Davant la porta (casa, feina, el cotxe, una reunió…), <b>m\'aturo</b> un moment abans de creuar-la.',
      c2: 'Faig <b>una respiració</b> i l\'atenció baixa a la <b>panxa</b> (<span class="vp-dot">●</span>). Encara que no noti res, també val.',
      c3: 'Entro <b>agafant de la mà el meu nin intern</b>: «Entro amb tu». No es queda fora.',
      c4: 'I en sortir, també: «<b>Ens n\'anam junts</b>». A <b>cada porta del dia</b>, uns segons.',
      juego: '🎮 Entrena-ho jugant: Portes →',
      pie: 'A cada porta, agafo de la mà el meu nin intern. No es queda fora ni enrere: <b>ve amb mi a cada lloc</b>. Així arribo als altres des de mi, i no des de l\'automàtic. És també una manera d\'<b>aparèixer</b> per al meu cos moltes vegades al dia, sense esperar el malestar.'
    }
  };

  function panel(n, inner, cap) { return '<div class="vp-p"><span class="vp-n">' + n + '</span>' + inner + '<div class="vp-c">' + cap + '</div></div>'; }

  function mount(container, opts) {
    opts = opts || {};
    injectCSS();
    var L = TXT[opts.lang === 'ca' ? 'ca' : 'es'];
    var useSil = opts.silueta !== false && !!(global.RespiroAIS && global.RespiroAIS.mount);
    var titulo = opts.titulo == null ? L.t : opts.titulo;
    container.classList.add('vp');
    container.innerHTML =
      (titulo ? '<div class="vp-t">' + esc(titulo) + '</div>' : '') +
      '<div class="vp-grid">' +
        panel(1, svg1(), L.c1) +
        panel(2, useSil ? '<div class="vp-sil"></div>' : svg2(), L.c2) +
        panel(3, svg3(), L.c3) +
        panel(4, svg4(), L.c4) +
      '</div>' +
      (opts.pie !== false ? '<div class="vp-pie">' + L.pie + (opts.juego !== false ? juegoLink('puertas', L.juego) : '') + '</div>' : '');
    var sil = null;
    if (useSil) {
      try {
        sil = global.RespiroAIS.mount(container.querySelector('.vp-sil'), {
          lang: 'es', figure: 'organism', showControl: false, showZones: false, legend: false, autostart: true,
          rhythm: opts.rhythm || { inhale: 4000, anchor: 2000, exhale: 6000, pause: 1500 }
        });
      } catch (e) { sil = null; var b = container.querySelector('.vp-sil'); if (b) b.outerHTML = svg2(); }
    }
    return {
      destroy: function () {
        if (sil) { try { sil.destroy(); } catch (e) {} sil = null; }
        container.innerHTML = ''; container.classList.remove('vp');
      }
    };
  }

  /* ---- Modo automático: desplegable «Ver cómo se hace» ---- */
  var DET_CSS = '.vp-det{margin:10px 0}.vp-det>summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;color:var(--vb-acc,#3c666f);background:var(--vb-acc-bg,rgba(63,107,116,.12));border-radius:18px;padding:7px 13px}' +
    '.vp-det>summary::-webkit-details-marker{display:none}.vp-det[open]>summary{margin-bottom:10px}';
  function langDe(el) {
    var l = el.getAttribute('data-lang') || (document.documentElement.lang || 'es');
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function enhance(el) {
    if (el.__vpDone) return; el.__vpDone = true;
    if (!document.getElementById('vineta-puertas-det-css')) { var st = document.createElement('style'); st.id = 'vineta-puertas-det-css'; st.textContent = DET_CSS; document.head.appendChild(st); }
    var lang = langDe(el);
    var det = document.createElement('details'); det.className = 'vp-det';
    if (el.hasAttribute('data-open')) det.open = true;
    det.innerHTML = '<summary>🎞️ ' + (lang === 'ca' ? 'Veure com es fan els rituals d\'entrada i sortida' : 'Ver cómo se hacen los rituales de entrada y salida') + '</summary><div></div>';
    el.appendChild(det);
    var box = det.lastChild, inst = null;
    function sync() {
      if (det.open && !inst) inst = mount(box, { lang: lang, titulo: '', pie: true });
      else if (!det.open && inst) { inst.destroy(); inst = null; }
    }
    det.addEventListener('toggle', sync); sync();
    el.__vpStop = function () { if (inst) { inst.destroy(); inst = null; } };
  }
  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.hasAttribute && root.hasAttribute('data-vineta-puertas')) enhance(root);
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-puertas]'), enhance);
  }
  function stopIn(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.__vpStop) root.__vpStop();
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-puertas]'), function (e) { if (e.__vpStop) e.__vpStop(); });
  }
  function autoInit() {
    scan(document.body);
    if (global.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); });
          Array.prototype.forEach.call(m.removedNodes, function (n) { if (n.nodeType === 1) stopIn(n); });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit); else autoInit();

  global.VinetaPuertas = { mount: mount, enhance: enhance };
})(window);
