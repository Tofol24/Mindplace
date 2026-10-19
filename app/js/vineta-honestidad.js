/* APRENS · VinetaHonestidad — viñeta compartida de la honestidad emocional
   («No sé por qué, pero noto una sensación aquí»), TEC caps. 8.6 y 9.6.
   Cinco paneles:
     1) la campana que se lleva consigo: si el «¿por qué?» se vuelve la campana de
        Pavlov siempre a la vista, la atención queda atrapada en ella (8.6);
     2) me anclo en la barriga —silueta AIS si RespiroAIS está cargado—; noto algo o
        no, da igual;
     3) señalo la barriga y digo «No sé por qué…»: cierro la puerta a justificar;
     4) «…pero noto una sensación aquí y quería compartirlo»: la conciencia da la
        cara por el cuerpo; la seguridad no depende de cómo responda el otro (9.6);
     5) sin la campana delante, la atención se abre: percibo con amplitud.
   Mismo estilo que VinetaAtencion y VinetaAbrazo. Sin dependencias obligatorias;
   CSS propio inyectado una vez. ES / CA.

   Uso:
     var v = VinetaHonestidad.mount(caja, { lang:'es', silueta:true, titulo:'', pie:true });
     v.destroy();
   Modo automático: <div data-vineta-honestidad [data-lang="ca"] [data-open]></div>
   se convierte en un desplegable «Ver cómo se hace la honestidad emocional».
*/
(function (global) {
  'use strict';

  /* Enlace «Entrénalo jugando» (Juegos AIS de exposición imaginada). Se resuelve
     desde la ruta de este script para funcionar en cualquier página de la app; si
     la página está dentro del hub (iframe), navega con el router del hub. */
  var SELF_SRC_J = (document.currentScript && document.currentScript.src) || '';
  function juegoLink(sub, label, cls) {
    var root = SELF_SRC_J ? SELF_SRC_J.replace(/js\/vineta-[a-z]+\.js.*$/, '') : '../';
    return '<br><a class="' + cls + '" style="display:inline-block;margin-top:8px;font-weight:700;color:inherit" href="' + root + '#/tool/juegos_exposicion/' + sub +
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
    '.vh{display:block}',
    '.vh-t{font-weight:600;font-size:12px;color:var(--azul,#1B4F8C);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}',
    '.vh-grid{display:grid;grid-template-columns:1fr;gap:12px}',
    '@media(min-width:560px){.vh-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vh-wide{grid-column:1/-1}}',
    '.vh-p{background:var(--fondo,#F0F4F8);border:1px solid #E3EAF3;border-radius:14px;padding:12px 12px 14px;text-align:center}',
    '.vh-p>svg{width:100%;max-width:240px;height:auto;display:block;margin:0 auto}',
    '.vh-wide>svg{max-width:330px}',
    '.vh-n{display:inline-block;background:var(--azul,#1B4F8C);color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;font-size:12px;font-weight:700;margin-bottom:6px}',
    '.vh-c{font-size:12.5px;color:#1a1a2e;margin-top:8px;line-height:1.5}',
    '.vh-dot{color:#C8973A}',
    '.vh-sil{max-width:150px;margin:0 auto;border-radius:12px;overflow:hidden}',
    '.vh-sil .ra-ui,.vh-sil .ra-count,.vh-sil .ra-legend{display:none!important}',
    '.vh-pie{margin-top:10px;background:var(--azulLt,#E6EEF5);border-left:4px solid var(--azul,#1B4F8C);border-radius:0 10px 10px 0;padding:12px 15px;font-size:12.5px;color:var(--azul,#1B4F8C);line-height:1.6}',
    '.vh-det{margin:10px 0}.vh-det>summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;color:var(--vb-acc,#3f6b74);background:var(--vb-acc-bg,rgba(63,107,116,.12));border-radius:18px;padding:7px 13px}',
    '.vh-det>summary::-webkit-details-marker{display:none}.vh-det[open]>summary{margin-bottom:10px}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('vineta-honestidad-css')) return;
    var s = document.createElement('style'); s.id = 'vineta-honestidad-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var INK = '#4a6572', MIND = '#E9B458', BELL = '#C8973A';

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
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (12 * s) + '" fill="' + MIND + '" opacity=".28"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (5.5 * s) + '" fill="' + MIND + '"/>';
  }
  function campana(x, y, s, label, apagada) {
    s = s || 1;
    var op = apagada ? ' opacity=".28"' : '';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"' + op + '>' +
      '<line x1="0" y1="-30" x2="0" y2="-22" stroke="#8a6a2a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-20 10 q0 -32 20 -32 q20 0 20 32 l5 6 h-50 z" fill="' + BELL + '" stroke="#9b7426" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="0" cy="20" r="5" fill="#9b7426"/>' +
      (label ? '<text x="0" y="40" text-anchor="middle" font-size="12" font-weight="700" fill="#7a5a1a">' + label + '</text>' : '') +
      '</g>';
  }
  function perro(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" fill="#e4ecf1">' +
      '<ellipse cx="0" cy="0" rx="30" ry="15"/>' +
      '<circle cx="34" cy="-14" r="12"/>' +
      '<path d="M28 -24 q-6 10 -2 18" fill="#cfd9e1"/>' +
      '<path d="M45 -12 q6 2 7 6" fill="none"/>' +
      '<circle cx="38" cy="-17" r="1.8" fill="' + INK + '" stroke="none"/>' +
      '<line x1="-20" y1="12" x2="-22" y2="30"/><line x1="-8" y1="14" x2="-8" y2="30"/>' +
      '<line x1="12" y1="14" x2="12" y2="30"/><line x1="22" y1="12" x2="24" y2="30"/>' +
      '<path d="M-30 -4 q-14 -10 -10 -24" fill="none"/></g>';
  }

  // 1 · La campana que se lleva consigo (8.6).
  function svg1(L) {
    return '<svg viewBox="0 0 330 150" role="img" aria-label="' + L.a1 + '">' +
      '<rect x="8" y="132" width="314" height="6" rx="3" fill="#cfd9e1"/>' +
      // lo que deja de ver: la pelota y los compañeros, difuminados
      '<g opacity=".28"><circle cx="34" cy="120" r="10" fill="#d9776a"/>' +
      '<g transform="translate(304,120) scale(.6)" stroke="' + INK + '" stroke-width="2.6" fill="#e4ecf1"><ellipse cx="0" cy="0" rx="30" ry="15"/><circle cx="-34" cy="-14" r="12"/></g></g>' +
      perro(96, 100) +
      // la atención (amarilla) estrechada hacia la campana
      '<path d="M144 82 L200 52 L200 70 Z" fill="' + MIND + '" opacity=".35"/>' +
      '<circle cx="144" cy="82" r="4" fill="' + MIND + '"/>' +
      campana(222, 58, 1, L.porque, false) +
      '<text x="96" y="58" text-anchor="middle" font-size="10" fill="#6B7280" font-style="italic">' + L.atrapado + '</text></svg>';
  }
  // 2 · Reserva sin silueta: me anclo en la barriga.
  function svg2() {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="Atención en la barriga">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>' +
      figura(130, 40, [[22, -16, 40], [22, 16, 40]]) +
      '<line x1="130" y1="34" x2="130" y2="82" stroke="' + MIND + '" stroke-width="3" stroke-dasharray="2 4" opacity=".85"/>' +
      luz(130, 84, 1.1) + '</svg>';
  }
  // 3 · Señalo la barriga y digo «No sé por qué…»; la campana se apaga.
  function svg3(L) {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="' + L.a3 + '">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>' +
      figura(90, 42, [[22, 10, 44], [22, -16, 40]]) +
      luz(90, 86) +
      '<path d="M108 30 h112 a12 12 0 0 1 12 12 v18 a12 12 0 0 1 -12 12 h-90 l-12 10 v-10 h-10 a12 12 0 0 1 -12 -12 v-18 a12 12 0 0 1 12 -12 z" fill="#fff" stroke="#c9d3db" stroke-width="2"/>' +
      '<text x="164" y="56" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1a2e">' + L.nose + '</text>' +
      campana(200, 112, .55, '', true) +
      '<line x1="182" y1="94" x2="218" y2="130" stroke="#C0392B" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>';
  }
  // 4 · «…pero noto una sensación aquí y quería compartirlo».
  function svg4(L) {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="' + L.a4 + '">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>' +
      figura(70, 64, [[20, 10, 40], [20, -14, 36]], 10) +
      luz(70, 102, .9) +
      figura(196, 64, [[20, -14, 36], [20, 14, 36]], 10) +
      '<path d="M18 8 h150 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-88 l-10 10 v-10 h-52 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10 z" fill="#fff" stroke="#c9d3db" stroke-width="2"/>' +
      '<text x="93" y="25" text-anchor="middle" font-size="10.5" fill="#1a1a2e">' + L.pero1 + '</text>' +
      '<text x="93" y="40" text-anchor="middle" font-size="10.5" fill="#1a1a2e">' + L.pero2 + '</text>' +
      '<path d="M132 106 q32 -14 46 0" stroke="#d9776a" stroke-width="2.5" fill="none" stroke-dasharray="3 4"/></svg>';
  }
  // 5 · Sin la campana delante, la atención se abre.
  function svg5(L) {
    return '<svg viewBox="0 0 260 162" role="img" aria-label="' + L.a5 + '">' +
      '<rect x="10" y="128" width="240" height="6" rx="3" fill="#cfd9e1"/>' +
      '<path d="M130 70 L18 20 L18 128 Z" fill="' + MIND + '" opacity=".14"/>' +
      '<path d="M130 70 L242 20 L242 128 Z" fill="' + MIND + '" opacity=".14"/>' +
      figura(130, 46, [[22, -16, 40], [22, 16, 40]]) +
      luz(130, 88) +
      '<circle cx="40" cy="44" r="10" fill="#f2c14e"/>' +
      '<g transform="translate(220,98)"><rect x="-10" y="-14" width="20" height="18" rx="3" fill="#fff" stroke="#b9876a" stroke-width="2"/><path d="M10 -9 q8 0 8 6 q0 6 -8 6" fill="none" stroke="#b9876a" stroke-width="2"/><path d="M-4 -20 q2 -4 0 -8 M4 -20 q2 -4 0 -8" stroke="#c9d3db" stroke-width="2" fill="none"/></g>' +
      '<circle cx="44" cy="112" r="9" fill="#d9776a"/>' +
      '<g transform="translate(214,40)"><path d="M0 0 c-4 -7 -14 -3 -10 4 l10 9 l10 -9 c4 -7 -6 -11 -10 -4z" fill="#d9776a" opacity=".85"/></g>' +
      campana(238, 136, .3, '', true) + '</svg>';
  }

  var TXT = {
    es: {
      t: 'Honestidad emocional · no sé por qué',
      a1: 'El perro de Pavlov con la campana siempre delante', a3: 'Señalo la barriga y digo no sé por qué', a4: 'Comparto la sensación', a5: 'La atención se abre',
      porque: '¿por qué?', atrapado: 'atención atrapada', nose: '«No sé por qué…»',
      pero1: '«…pero noto una sensación aquí', pero2: 'y quería compartirlo contigo»',
      c1: '<b>La campana que se lleva consigo.</b> Como el perro de Pavlov con la campana siempre a la vista: si el <b>«¿por qué?»</b> se vuelve la campana, la atención queda <b>atrapada</b> en ella y deja de ver todo lo demás. Explicar alivia un momento… y por eso se repite.',
      c2: '<b>Me anclo en la barriga</b> (<span class="vh-dot">●</span>). Noto algo o no noto nada: <b>da igual</b>. Lo que cuenta es estar ahí.',
      c3: 'Mientras <b>señalo mi barriga</b>, digo: <b>«No sé por qué…»</b>. Así cierro la puerta a justificar: el dolor <b>no queda atado a un porqué</b>.',
      c4: '<b>«…pero noto una sensación aquí y quería compartirlo.»</b> Con tono sereno. Es mi conciencia <b>dando la cara por mi cuerpo</b>: la seguridad no depende de cómo responda el otro.',
      c5: 'Sin la campana delante, <b>la atención se abre</b>: vuelvo a percibir con <b>amplitud</b> lo que pasa —el gesto, el café, la luz—, no solo lo que confirma mi relato.',
      juego: '🎮 Entrénalo jugando: La campana →',
      pie: '<b>Primero reconocer, después explicar.</b> El «no sé por qué» no niega lo que sabes: suspende un momento la exigencia de explicarlo, para que la explicación llegue después como <b>información</b> y no como calmante. Si la causa es evidente: «Sé que lo ocurrido me ha afectado, pero antes quiero reconocer que noto esto aquí». Practícalo también en calma, y poco a poco: a solas → con tu psicólogo/a → con personas de confianza.',
      sum: 'Ver cómo se hace la honestidad emocional'
    },
    ca: {
      t: 'Honestedat emocional · no sé per què',
      a1: 'El gos de Pavlov amb la campana sempre davant', a3: 'Assenyalo la panxa i dic no sé per què', a4: 'Comparteixo la sensació', a5: 'L\'atenció s\'obre',
      porque: 'per què?', atrapado: 'atenció atrapada', nose: '«No sé per què…»',
      pero1: '«…però noto una sensació aquí', pero2: 'i volia compartir-ho amb tu»',
      c1: '<b>La campana que es porta a sobre.</b> Com el gos de Pavlov amb la campana sempre a la vista: si el <b>«per què?»</b> es torna la campana, l\'atenció hi queda <b>atrapada</b> i deixa de veure tota la resta. Explicar alleuja un moment… i per això es repeteix.',
      c2: '<b>M\'ancoro a la panxa</b> (<span class="vh-dot">●</span>). Noto alguna cosa o no noto res: <b>tant se val</b>. El que compta és ser-hi.',
      c3: 'Mentre <b>assenyalo la panxa</b>, dic: <b>«No sé per què…»</b>. Així tanco la porta a justificar: el dolor <b>no queda lligat a un perquè</b>.',
      c4: '<b>«…però noto una sensació aquí i volia compartir-ho.»</b> Amb to serè. És la meva consciència <b>donant la cara pel meu cos</b>: la seguretat no depèn de com respongui l\'altre.',
      c5: 'Sense la campana davant, <b>l\'atenció s\'obre</b>: torno a percebre amb <b>amplitud</b> el que passa —el gest, el cafè, la llum—, no només el que confirma el meu relat.',
      juego: '🎮 Entrena-ho jugant: La campana →',
      pie: '<b>Primer reconèixer, després explicar.</b> El «no sé per què» no nega el que saps: suspèn un moment l\'exigència d\'explicar-ho, perquè l\'explicació arribi després com a <b>informació</b> i no com a calmant. Si la causa és evident: «Sé que el que ha passat m\'ha afectat, però abans vull reconèixer que noto això aquí». Practica-ho també en calma, i a poc a poc: tot sol → amb el teu psicòleg/a → amb persones de confiança.',
      sum: 'Veure com es fa l\'honestedat emocional'
    }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function panel(n, inner, cap, wide) { return '<div class="vh-p' + (wide ? ' vh-wide' : '') + '"><span class="vh-n">' + n + '</span>' + inner + '<div class="vh-c">' + cap + '</div></div>'; }

  function mount(container, opts) {
    opts = opts || {};
    injectCSS();
    var L = TXT[opts.lang === 'ca' ? 'ca' : 'es'];
    var useSil = opts.silueta !== false && !!(global.RespiroAIS && global.RespiroAIS.mount);
    var titulo = opts.titulo == null ? L.t : opts.titulo;
    container.classList.add('vh');
    container.innerHTML =
      (titulo ? '<div class="vh-t">' + esc(titulo) + '</div>' : '') +
      '<div class="vh-grid">' +
        panel(1, svg1(L), L.c1, true) +
        panel(2, useSil ? '<div class="vh-sil"></div>' : svg2(), L.c2) +
        panel(3, svg3(L), L.c3) +
        panel(4, svg4(L), L.c4) +
        panel(5, svg5(L), L.c5) +
      '</div>' +
      (opts.pie !== false ? '<div class="vh-pie">' + L.pie + (opts.juego !== false ? juegoLink('campana', L.juego, 'vh-juego') : '') + '</div>' : '');

    var sil = null;
    if (useSil) {
      try {
        sil = global.RespiroAIS.mount(container.querySelector('.vh-sil'), {
          lang: 'es', figure: 'organism', showControl: false, showZones: false, legend: false, autostart: true,
          rhythm: opts.rhythm || { inhale: 4000, anchor: 2000, exhale: 6000, pause: 1500 }
        });
      } catch (e) { sil = null; var b = container.querySelector('.vh-sil'); if (b) b.outerHTML = svg2(); }
    }
    return {
      destroy: function () {
        if (sil) { try { sil.destroy(); } catch (e) {} sil = null; }
        container.innerHTML = ''; container.classList.remove('vh');
      }
    };
  }

  /* ---- Modo automático: <div data-vineta-honestidad [data-lang="ca"] [data-open]></div> ---- */
  function langDe(el) {
    var l = el.getAttribute('data-lang') || (document.documentElement.lang || 'es');
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function enhance(el) {
    if (el.__vhDone) return; el.__vhDone = true;
    injectCSS();
    var lang = langDe(el);
    var det = document.createElement('details'); det.className = 'vh-det';
    if (el.hasAttribute('data-open')) det.open = true;
    det.innerHTML = '<summary>🎞️ ' + TXT[lang].sum + '</summary><div></div>';
    el.appendChild(det);
    var box = det.lastChild, inst = null;
    function sync() {
      if (det.open && !inst) inst = mount(box, { lang: lang, titulo: '', pie: true });
      else if (!det.open && inst) { inst.destroy(); inst = null; }
    }
    det.addEventListener('toggle', sync); sync();
    el.__vhStop = function () { if (inst) { inst.destroy(); inst = null; } };
  }
  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.hasAttribute && root.hasAttribute('data-vineta-honestidad')) enhance(root);
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-honestidad]'), enhance);
  }
  function stopIn(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.__vhStop) root.__vhStop();
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-honestidad]'), function (e) { if (e.__vhStop) e.__vhStop(); });
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

  global.VinetaHonestidad = { mount: mount, enhance: enhance };
})(window);
