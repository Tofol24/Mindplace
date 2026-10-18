/* APRENS · VinetaAbrazo — viñeta compartida del «abrazo sentido»
   (TEC cap. 9.5 · herramienta nuclear 4: «Al llegar a casa o al reencontrarte
   con alguien querido: respira, identifica tu sensación interna durante unos
   segundos y desde ahí abraza con presencia. No es un abrazo automático.»)
   Cuatro paneles:
     1) antes de entrar en casa, me paro ante la puerta y respiro (el aire es el cebo);
     2) llevo la atención a la barriga y la dejo ahí —silueta AIS con las dos luces
        si RespiroAIS está cargado—, notando lo que traigo, sin cambiarlo;
     3) entro y abrazo a mi pareja o a mis hijos con la atención aún en la barriga;
     4) todo lo que siento cabe en mi manada: el dolor nos hace cómplices, no nos aleja.
   Mismo estilo que VinetaAtencion («para · respira · vuelve»). Sin dependencias
   obligatorias; CSS propio inyectado una vez. ES / CA.

   Uso:
     var v = VinetaAbrazo.mount(document.getElementById('caja'), {
       lang: 'es',          // 'es' | 'ca'
       silueta: true,       // panel 2 con RespiroAIS si está disponible
       titulo: '',          // '' para ocultar
       pie: true            // nota final (manada segura + frase honesta)
     });
     v.destroy();
*/
(function (global) {
  'use strict';

  var CSS = [
    '.vb{display:block}',
    '.vb-t{font-weight:600;font-size:12px;color:var(--azul,#1B4F8C);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}',
    '.vb-grid{display:grid;grid-template-columns:1fr;gap:12px}',
    '@media(min-width:560px){.vb-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.vb-p{background:var(--fondo,#F0F4F8);border:1px solid #E3EAF3;border-radius:14px;padding:12px 12px 14px;text-align:center}',
    '.vb-p>svg{width:100%;max-width:240px;height:auto;display:block;margin:0 auto}',
    '.vb-n{display:inline-block;background:var(--azul,#1B4F8C);color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;font-size:12px;font-weight:700;margin-bottom:6px}',
    '.vb-c{font-size:12.5px;color:#1a1a2e;margin-top:8px;line-height:1.5}',
    '.vb-dot{color:#C8973A}',
    '.vb-sil{max-width:150px;margin:0 auto;border-radius:12px;overflow:hidden}',
    '.vb-sil .ra-ui,.vb-sil .ra-count,.vb-sil .ra-legend{display:none!important}',
    '.vb-pie{margin-top:10px;background:var(--azulLt,#E6EEF5);border-left:4px solid var(--azul,#1B4F8C);border-radius:0 10px 10px 0;padding:12px 15px;font-size:12.5px;color:var(--azul,#1B4F8C);line-height:1.6}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('vineta-abrazo-css')) return;
    var s = document.createElement('style'); s.id = 'vineta-abrazo-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var INK = '#4a6572', AIR = '#3FA6D8', MIND = '#E9B458';

  // Figura de palo: (cx,cy) cabeza; r radio de la cabeza; brazos [desdeY, dx, dy].
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
  // Luz amarilla de la atención anclada en la barriga.
  function luz(x, y, s) {
    s = s || 1;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (12 * s) + '" fill="' + MIND + '" opacity=".28"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (5.5 * s) + '" fill="' + MIND + '"/>';
  }

  // 1 · Ante la puerta de casa: paro y respiro.
  function svg1() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Ante la puerta de casa, respiro">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>' +
      '<rect x="146" y="52" width="100" height="76" rx="3" fill="#efe6d8" stroke="#d8cbb6" stroke-width="2"/>' +
      '<polygon points="138,56 196,18 254,56" fill="#d9b9a0" stroke="#c9a68a" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="176" y="78" width="34" height="50" rx="3" fill="#b9876a"/><circle cx="203" cy="104" r="2.6" fill="#f3e3c0"/>' +
      '<rect x="222" y="68" width="16" height="16" rx="2" fill="#f7e3b1" stroke="#d8cbb6" stroke-width="1.5"/>' +
      figura(98, 54, [[22, -14, 40], [22, 14, 40]]) +
      '<path d="M112 50 q10 -5 18 0" stroke="' + AIR + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="132" cy="50" r="3.4" fill="' + AIR + '"/>' +
      '<path d="M112 58 q7 2 12 6" stroke="' + AIR + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/></svg>';
  }
  // 2 · Reserva sin silueta: la atención baja y se queda en la barriga.
  function svg2() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Llevo la atención a la barriga">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>' +
      figura(130, 40, [[22, -16, 40], [22, 16, 40]]) +
      '<line x1="130" y1="34" x2="130" y2="82" stroke="' + MIND + '" stroke-width="3" stroke-dasharray="2 4" opacity=".85"/>' +
      luz(130, 84, 1.1) + '</svg>';
  }
  // 3 · Entro y abrazo a los míos, con la atención aún en la barriga.
  function svg3() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Entro y abrazo con presencia a mi pareja y a mi hijo">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#e2c9a4"/>' +
      '<rect x="18" y="20" width="26" height="32" rx="3" fill="#f7e3b1" stroke="#e2d3b8" stroke-width="1.5"/>' +
      // yo (con la luz en la barriga) abrazando a mi pareja
      figura(100, 46, [[18, 30, 26], [26, 30, 34]]) +
      figura(136, 46, [[18, -30, 26], [26, -30, 34]]) +
      // hijo/a abrazándonos a la altura de la cintura
      figura(170, 78, [[12, -26, 6], [16, -22, 16]], 8) +
      luz(100, 90) +
      '<path d="M118 22 c-4 -7 -14 -3 -10 4 l10 9 l10 -9 c4 -7 -6 -11 -10 -4z" fill="#d9776a" opacity=".85"/></svg>';
  }
  // 4 · Todo cabe en la manada: lo que duele también tiene sitio.
  function svg4() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Todo lo que siento cabe en mi manada">' +
      '<ellipse cx="130" cy="90" rx="118" ry="64" fill="#F6E3B8" opacity=".55"/>' +
      '<ellipse cx="130" cy="90" rx="118" ry="64" fill="none" stroke="#E9B458" stroke-width="2" stroke-dasharray="5 6" opacity=".8"/>' +
      figura(84, 52, [[20, 22, 30], [20, -14, 36]], 10) +
      figura(128, 52, [[20, -22, 30], [20, 22, 30]], 10) +
      figura(170, 72, [[12, -20, 14], [12, 14, 26]], 8) +
      luz(84, 90, .8) + luz(128, 90, .8) + luz(170, 102, .7) +
      // «lo que duele», dentro del círculo, sostenido entre todos
      '<path d="M100 132 q-8 0 -8 -7 q0 -7 8 -7 q2 -7 10 -7 q8 0 10 6 q8 -1 9 6 q1 8 -8 9 z" fill="#c3ccd4" opacity=".9"/>' +
      '<text x="112" y="150" text-anchor="middle" font-size="9.5" fill="#6B7280" font-style="italic">LBL</text></svg>';
  }

  var TXT = {
    es: {
      t: 'Respira · ánclate · abraza',
      c1: 'Antes de entrar en casa, <b>me paro</b> ante la puerta y <b>respiro</b>. El aire es el cebo.',
      c2: 'Llevo la <b>atención a la barriga</b> (<span class="vb-dot">●</span>) y la dejo ahí. Noto lo que traigo del día, <b>sin cambiarlo</b>.',
      c3: '<b>Entro y abrazo</b> a mi pareja o a mis hijos con la atención aún en la barriga. No es un abrazo automático: es un <b>abrazo sentido</b>.',
      c4: 'Lo que siento —por <b>doloroso o vulnerable</b> que sea— <b>tiene sitio en mi manada</b>. Nada de lo que siento es una amenaza: el dolor nos hace <b>cómplices</b>, no nos aleja.',
      nube: 'lo que duele',
      pie: 'El abrazo sentido <b>valida y da espacio</b>: le enseña a tu cuerpo que cualquier dolor, sea el que sea, tiene cabida en tu <b>manada segura</b>. Por eso deja de ser amenazante, y cambian tu forma de vivir el día a día y tu relación con los tuyos. Si quieres, acompáñalo con la frase honesta: «No sé por qué, pero hoy lo noto aquí».'
    },
    ca: {
      t: 'Respira · ancora\'t · abraça',
      c1: 'Abans d\'entrar a casa, <b>m\'aturo</b> davant la porta i <b>respiro</b>. L\'aire és l\'esquer.',
      c2: 'Porto l\'<b>atenció a la panxa</b> (<span class="vb-dot">●</span>) i la deixo allà. Noto el que porto del dia, <b>sense canviar-ho</b>.',
      c3: '<b>Entro i abraço</b> la meva parella o els meus fills amb l\'atenció encara a la panxa. No és una abraçada automàtica: és una <b>abraçada sentida</b>.',
      c4: 'El que sento —per <b>dolorós o vulnerable</b> que sigui— <b>té lloc a la meva manada</b>. Res del que sento és una amenaça: el dolor ens fa <b>còmplices</b>, no ens allunya.',
      nube: 'el que fa mal',
      pie: 'L\'abraçada sentida <b>valida i dona espai</b>: ensenya al teu cos que qualsevol dolor, sigui quin sigui, té cabuda a la teva <b>manada segura</b>. Per això deixa de ser amenaçant, i canvien la teva manera de viure el dia a dia i la teva relació amb els teus. Si vols, acompanya-la amb la frase honesta: «No sé per què, però avui ho noto aquí».'
    }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function panel(n, inner, cap) { return '<div class="vb-p"><span class="vb-n">' + n + '</span>' + inner + '<div class="vb-c">' + cap + '</div></div>'; }

  function mount(container, opts) {
    opts = opts || {};
    injectCSS();
    var L = TXT[opts.lang === 'ca' ? 'ca' : 'es'];
    var useSil = opts.silueta !== false && !!(global.RespiroAIS && global.RespiroAIS.mount);
    var titulo = opts.titulo == null ? L.t : opts.titulo;
    container.classList.add('vb');
    container.innerHTML =
      (titulo ? '<div class="vb-t">' + esc(titulo) + '</div>' : '') +
      '<div class="vb-grid">' +
        panel(1, svg1(), L.c1) +
        panel(2, useSil ? '<div class="vb-sil"></div>' : svg2(), L.c2) +
        panel(3, svg3(), L.c3) +
        panel(4, svg4().replace('LBL', esc(L.nube)), L.c4) +
      '</div>' +
      (opts.pie !== false ? '<div class="vb-pie">' + L.pie + '</div>' : '');

    var sil = null;
    if (useSil) {
      try {
        sil = global.RespiroAIS.mount(container.querySelector('.vb-sil'), {
          lang: 'es', figure: 'organism', showControl: false, showZones: false, legend: false, autostart: true,
          rhythm: opts.rhythm || { inhale: 4000, anchor: 2000, exhale: 6000, pause: 1500 }
        });
      } catch (e) { sil = null; var b = container.querySelector('.vb-sil'); if (b) b.outerHTML = svg2(); }
    }
    return {
      destroy: function () {
        if (sil) { try { sil.destroy(); } catch (e) {} sil = null; }
        container.innerHTML = ''; container.classList.remove('vb');
      }
    };
  }

  /* ---- Modo automático: <div data-vineta-abrazo [data-lang="ca"]></div> ----
     Se convierte en un desplegable «Ver cómo se hace el abrazo sentido» que monta la
     viñeta al abrirlo y la desmonta al cerrarlo. Vale también para pantallas que se
     pintan con innerHTML (MutationObserver). */
  var DET_CSS = '.vb-det{margin:10px 0}.vb-det>summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;color:var(--vb-acc,#3f6b74);background:var(--vb-acc-bg,rgba(63,107,116,.12));border-radius:18px;padding:7px 13px}' +
    '.vb-det>summary::-webkit-details-marker{display:none}.vb-det[open]>summary{margin-bottom:10px}';
  function langDe(el) {
    var l = el.getAttribute('data-lang') || (document.documentElement.lang || 'es');
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function enhance(el) {
    if (el.__vbDone) return; el.__vbDone = true;
    if (!document.getElementById('vineta-abrazo-det-css')) { var st = document.createElement('style'); st.id = 'vineta-abrazo-det-css'; st.textContent = DET_CSS; document.head.appendChild(st); }
    var lang = langDe(el);
    var det = document.createElement('details'); det.className = 'vb-det';
    if (el.hasAttribute('data-open')) det.open = true;
    det.innerHTML = '<summary>🎞️ ' + (lang === 'ca' ? 'Veure com es fa l\'abraçada sentida' : 'Ver cómo se hace el abrazo sentido') + '</summary><div></div>';
    el.appendChild(det);
    var box = det.lastChild, inst = null;
    function sync() {
      if (det.open && !inst) inst = mount(box, { lang: lang, titulo: '', pie: true });
      else if (!det.open && inst) { inst.destroy(); inst = null; }
    }
    det.addEventListener('toggle', sync); sync();
    el.__vbStop = function () { if (inst) { inst.destroy(); inst = null; } };
  }
  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.hasAttribute && root.hasAttribute('data-vineta-abrazo')) enhance(root);
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-abrazo]'), enhance);
  }
  function stopIn(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.__vbStop) root.__vbStop();
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-abrazo]'), function (e) { if (e.__vbStop) e.__vbStop(); });
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

  global.VinetaAbrazo = { mount: mount, enhance: enhance };
})(window);
