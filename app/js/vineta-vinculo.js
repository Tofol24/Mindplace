/* APRENS · VinetaVinculo — «La casa del vínculo»
   Nuestra relación es una casa: vivimos dentro los dos y la sostienen cuatro
   pilares (comunicación, confianza, respeto y honestidad emocional). Si los
   pilares son fuertes, la casa no nos cae encima. La honestidad emocional no es
   un pilar más: es transversal a los otros tres.
   Cuatro paneles:
     1) la casa y sus cuatro pilares, con las dos personas dentro;
     2) pilares débiles (comunicación logística, confianza reactiva, respeto desde
        la culpa): la casa se agrieta y nos cae encima;
     3) la honestidad emocional atraviesa los otros tres: con la mano fija en la
        sensación, «No sé por qué, pero noto algo aquí…»;
     4) los tres se refuerzan (afectiva, proactiva, complicidad) y la casa aguanta.
   Mismo estilo que VinetaAbrazo y VinetaHonestidad. Sin dependencias; CSS propio
   inyectado una vez. ES / CA.

   Uso:
     var v = VinetaVinculo.mount(document.getElementById('caja'), {
       lang: 'es',   // 'es' | 'ca'
       titulo: '',   // '' para ocultar
       pie: true     // nota final
     });
     v.destroy();
   Modo automático: <div data-vineta-vinculo [data-lang="ca"] [data-open]></div>
*/
(function (global) {
  'use strict';

  var CSS = [
    '.vv{display:block}',
    '.vv-t{font-weight:600;font-size:12px;color:var(--azul,#1B4F8C);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}',
    '.vv-grid{display:grid;grid-template-columns:1fr;gap:12px}',
    '@media(min-width:620px){.vv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.vv-p{background:var(--fondo,#F0F4F8);border:1px solid #E3EAF3;border-radius:14px;padding:12px 12px 14px;text-align:center}',
    '.vv-p>svg{width:100%;max-width:320px;height:auto;display:block;margin:0 auto}',
    '.vv-n{display:inline-block;background:var(--azul,#1B4F8C);color:#fff;border-radius:50%;width:22px;height:22px;line-height:22px;font-size:12px;font-weight:700;margin-bottom:6px}',
    '.vv-c{font-size:13px;color:#1a1a2e;margin-top:8px;line-height:1.5;text-align:left}',
    '.vv-pie{margin-top:10px;background:var(--azulLt,#E6EEF5);border-left:4px solid var(--azul,#1B4F8C);border-radius:0 10px 10px 0;padding:12px 15px;font-size:13px;color:#2a2622;line-height:1.6}'
  ].join('\n');
  function injectCSS() {
    if (document.getElementById('vineta-vinculo-css')) return;
    var s = document.createElement('style'); s.id = 'vineta-vinculo-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var INK = '#4a6572', MIND = '#E9B458', GOLD_D = '#a7802f';
  var STONE = '#ece3d3', STONE_L = '#cbb89a', WEAK = '#e3ddd4', WEAK_L = '#b9b0a3';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Figura de palo: (cx,cy) cabeza; brazos [desdeY, dx, dy].
  function figura(cx, cy, brazos, r) {
    r = r || 9;
    var body = r * 3.2, leg = r * 2.4;
    var h = '<g stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round" fill="none">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#e4ecf1" stroke-width="2.2"/>' +
      '<line x1="' + cx + '" y1="' + (cy + r) + '" x2="' + cx + '" y2="' + (cy + r + body) + '"/>';
    brazos.forEach(function (b) { h += '<line x1="' + cx + '" y1="' + (cy + b[0]) + '" x2="' + (cx + b[1]) + '" y2="' + (cy + b[2]) + '"/>'; });
    h += '<line x1="' + cx + '" y1="' + (cy + r + body) + '" x2="' + (cx - r) + '" y2="' + (cy + r + body + leg) + '"/>' +
      '<line x1="' + cx + '" y1="' + (cy + r + body) + '" x2="' + (cx + r) + '" y2="' + (cy + r + body + leg) + '"/></g>';
    return h;
  }
  function luz(x, y, s) {
    s = s || 1;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (10 * s) + '" fill="' + MIND + '" opacity=".3"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (4.5 * s) + '" fill="' + MIND + '"/>';
  }

  // Geometría común (viewBox 300×210): suelo, tejado, viga y cuatro pilares.
  var PX = [44, 102, 198, 256], PW = 26, PT = 76, PB = 188;
  function pilar(i, txt, o) {
    o = o || {};
    var x = PX[i] - PW / 2, h = PB - PT, cx = PX[i], cy = PT + h / 2;
    var fill = o.gold ? '#f6e3b8' : (o.weak ? WEAK : STONE);
    var line = o.gold ? MIND : (o.weak ? WEAK_L : STONE_L);
    var g = '<rect x="' + x + '" y="' + PT + '" width="' + PW + '" height="' + h + '" rx="3" fill="' + fill + '" stroke="' + line + '" stroke-width="2"' + (o.weak ? ' stroke-dasharray="4 3"' : '') + '/>';
    if (o.weak) g += '<path d="M' + (x + 6) + ' ' + (PT + 18) + ' l8 12 l-6 10 l9 14 l-5 12" stroke="' + WEAK_L + '" stroke-width="1.6" fill="none"/>';
    if (o.thread) g += '<rect x="' + (x + 3) + '" y="' + PT + '" width="' + (PW - 6) + '" height="' + h + '" rx="2" fill="' + MIND + '" opacity=".22"/>';
    g += '<text x="' + cx + '" y="' + cy + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="700" letter-spacing=".6" fill="' + (o.gold ? GOLD_D : (o.weak ? '#8f877b' : INK)) + '">' + esc(txt) + '</text>';
    return g;
  }
  function suelo() { return '<rect x="8" y="188" width="284" height="6" rx="3" fill="#d8cbb6"/>'; }
  function tejado(o) {
    o = o || {};
    var t = '<polygon points="18,64 150,14 282,64" fill="' + (o.weak ? '#d9cfc2' : '#d9b9a0') + '" stroke="' + (o.weak ? '#b9ab98' : '#c9a68a') + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<rect x="24" y="64" width="252" height="12" rx="2" fill="' + (o.weak ? '#e0d6c8' : '#e7d3bf') + '" stroke="' + (o.weak ? '#b9ab98' : '#c9a68a') + '" stroke-width="1.6"/>';
    if (o.thread) t += '<rect x="26" y="67" width="248" height="6" rx="3" fill="' + MIND + '" opacity=".9"/>';
    if (o.heart) t += '<path d="M150 46 c-4 -7 -14 -3 -10 4 l10 9 l10 -9 c4 -7 -6 -11 -10 -4z" fill="#d9776a" opacity=".85"/>';
    return t;
  }
  // Las dos personas en el centro, cogidas de la mano (como en la pizarra).
  function pareja(o) {
    o = o || {};
    var a = o.manoBarriga ? [[16, 7, 30], [16, -14, 34]] : [[16, -14, 34], [16, 18, 34]];
    return figura(132, 116, a) + figura(168, 116, [[16, -18, 34], [16, 14, 34]]) +
      (o.luces ? luz(132, 146, .8) + luz(168, 146, .8) : '');
  }

  // 1 · La casa y sus cuatro pilares.
  function svg1(L) {
    return '<svg viewBox="0 0 300 210" role="img" aria-label="' + esc(L.a1) + '">' +
      suelo() + tejado({ heart: true }) +
      pilar(0, L.p[0]) + pilar(1, L.p[1]) + pilar(2, L.p[2]) + pilar(3, L.p[3], { gold: true }) +
      pareja() + '</svg>';
  }
  // 2 · Pilares débiles: la casa se agrieta y nos cae encima.
  function svg2(L) {
    return '<svg viewBox="0 0 300 210" role="img" aria-label="' + esc(L.a2) + '">' +
      suelo() +
      '<g transform="rotate(9 44 76) translate(0 10)">' + tejado({ weak: true }) + '</g>' +
      pilar(0, L.d[0], { weak: true }) + pilar(1, L.d[1], { weak: true }) + pilar(2, L.d[2], { weak: true }) +
      // la honestidad, caída en el suelo
      '<rect x="214" y="172" width="76" height="14" rx="3" fill="' + WEAK + '" stroke="' + WEAK_L + '" stroke-width="1.6" stroke-dasharray="4 3"/>' +
      '<text x="252" y="179.5" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="700" fill="#8f877b">' + esc(L.p[3]) + '</text>' +
      // cascotes que caen
      '<rect x="150" y="86" width="9" height="7" rx="1.5" fill="#cbbfae" transform="rotate(18 154 90)"/>' +
      '<rect x="176" y="98" width="7" height="6" rx="1.5" fill="#cbbfae" transform="rotate(-14 179 101)"/>' +
      figura(132, 122, [[16, -14, 10], [16, 10, 8]]) + figura(168, 122, [[16, -10, 8], [16, 14, 10]]) +
      '</svg>';
  }
  // 3 · La honestidad emocional atraviesa los otros tres: desde su pilar, un hilo
  //     dorado recorre la viga y baja a cada uno; y nace de la mano fija en la barriga.
  function svg3(L) {
    var hilos = '';
    [0, 1, 2].forEach(function (i) {
      hilos += '<path d="M' + (PX[3] - 6) + ' 84 Q ' + ((PX[3] + PX[i]) / 2) + ' ' + (104 - i * 4) + ' ' + (PX[i] + 6) + ' 84" stroke="' + MIND + '" stroke-width="2.2" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/>' +
        '<circle cx="' + PX[i] + '" cy="84" r="3.6" fill="' + MIND + '"/>';
    });
    return '<svg viewBox="0 0 300 210" role="img" aria-label="' + esc(L.a3) + '">' +
      suelo() + tejado({ thread: true }) +
      pilar(0, L.p[0], { thread: true }) + pilar(1, L.p[1], { thread: true }) + pilar(2, L.p[2], { thread: true }) + pilar(3, L.p[3], { gold: true }) +
      hilos + '<circle cx="' + PX[3] + '" cy="84" r="4.6" fill="' + MIND + '"/>' +
      pareja({ manoBarriga: true }) + luz(132, 146, 1.1) +
      '</svg>';
  }
  // 4 · Los tres se refuerzan y la casa aguanta.
  function svg4(L) {
    return '<svg viewBox="0 0 300 210" role="img" aria-label="' + esc(L.a4) + '">' +
      '<ellipse cx="150" cy="110" rx="146" ry="98" fill="#F6E3B8" opacity=".35"/>' +
      suelo() + tejado({ thread: true, heart: true }) +
      pilar(0, L.f[0], { thread: true }) + pilar(1, L.f[1], { thread: true }) + pilar(2, L.f[2], { thread: true }) + pilar(3, L.p[3], { gold: true }) +
      pareja({ luces: true }) + '</svg>';
  }

  var TXT = {
    es: {
      t: 'La casa de nuestro vínculo',
      p: ['COMUNICACIÓN', 'CONFIANZA', 'RESPETO', 'HONESTIDAD'],
      d: ['LOGÍSTICA', 'REACTIVA', 'CULPA'],
      f: ['AFECTIVA', 'PROACTIVA', 'COMPLICIDAD'],
      a1: 'Dos personas dentro de una casa sostenida por cuatro pilares: comunicación, confianza, respeto y honestidad emocional',
      a2: 'Los pilares débiles se agrietan y el tejado cae sobre las dos personas',
      a3: 'Con la mano en la barriga, un hilo dorado sale de la honestidad emocional y atraviesa los otros tres pilares',
      a4: 'Los cuatro pilares fuertes sostienen la casa y las dos personas están juntas y presentes',
      c1: 'Nuestra relación es una <b>casa</b>: vivimos dentro los dos, y la sostienen <b>cuatro pilares</b>: comunicación, confianza, respeto y <b>honestidad emocional</b>.',
      c2: 'Si los pilares se debilitan (una comunicación <b>solo logística</b>, una confianza <b>reactiva</b>, un respeto <b>desde la culpa</b>), la casa se agrieta y <b>nos acaba cayendo encima</b>.',
      c3: 'La honestidad emocional <b>atraviesa los otros tres</b>. Con la <b>mano fija en la sensación</b>: «No sé por qué, pero noto algo aquí, y necesito compartirlo contigo».',
      c4: 'Y los tres se refuerzan: comunicación <b>afectiva</b>, confianza <b>proactiva</b> y respeto desde la <b>complicidad</b>. La casa aguanta, y dentro cabe también <b>nuestra vulnerabilidad</b>.',
      pie: 'Si los cuatro pilares son fuertes, la casa no nos cae encima. Y la honestidad emocional no es un pilar más: es <b>transversal</b>, pasa por dentro de los otros tres. Cada vez que, con la mano en la barriga, el pecho o el cuello, te validas y te das espacio ante la otra persona, la comunicación se vuelve afectiva, la confianza proactiva y el respeto cómplice.'
    },
    ca: {
      t: 'La casa del nostre vincle',
      p: ['COMUNICACIÓ', 'CONFIANÇA', 'RESPECTE', 'HONESTEDAT'],
      d: ['LOGÍSTICA', 'REACTIVA', 'CULPA'],
      f: ['AFECTIVA', 'PROACTIVA', 'COMPLICITAT'],
      a1: 'Dues persones dins una casa sostinguda per quatre pilars: comunicació, confiança, respecte i honestedat emocional',
      a2: 'Els pilars febles s\'esquerden i la teulada cau damunt les dues persones',
      a3: 'Amb la mà a la panxa, un fil daurat surt de l\'honestedat emocional i travessa els altres tres pilars',
      a4: 'Els quatre pilars forts sostenen la casa i les dues persones són juntes i presents',
      c1: 'La nostra relació és una <b>casa</b>: hi vivim dins tots dos, i la sostenen <b>quatre pilars</b>: comunicació, confiança, respecte i <b>honestedat emocional</b>.',
      c2: 'Si els pilars s\'afebleixen (una comunicació <b>només logística</b>, una confiança <b>reactiva</b>, un respecte <b>des de la culpa</b>), la casa s\'esquerda i <b>ens acaba caient a sobre</b>.',
      c3: 'L\'honestedat emocional <b>travessa els altres tres</b>. Amb la <b>mà fixa a la sensació</b>: «No sé per què, però noto una cosa aquí, i necessit compartir-ho amb tu».',
      c4: 'I els tres s\'enforteixen: comunicació <b>afectiva</b>, confiança <b>proactiva</b> i respecte des de la <b>complicitat</b>. La casa aguanta, i a dins també hi cap <b>la nostra vulnerabilitat</b>.',
      pie: 'Si els quatre pilars són forts, la casa no ens cau a sobre. I l\'honestedat emocional no és un pilar més: és <b>transversal</b>, passa per dins dels altres tres. Cada vegada que, amb la mà a la panxa, al pit o al coll, et valides i et dones espai davant l\'altra persona, la comunicació es torna afectiva, la confiança proactiva i el respecte còmplice.'
    }
  };

  function panel(n, inner, cap) { return '<div class="vv-p"><span class="vv-n">' + n + '</span>' + inner + '<div class="vv-c">' + cap + '</div></div>'; }

  function mount(container, opts) {
    opts = opts || {};
    injectCSS();
    var L = TXT[opts.lang === 'ca' ? 'ca' : 'es'];
    var titulo = opts.titulo == null ? L.t : opts.titulo;
    container.classList.add('vv');
    container.innerHTML =
      (titulo ? '<div class="vv-t">' + esc(titulo) + '</div>' : '') +
      '<div class="vv-grid">' +
        panel(1, svg1(L), L.c1) + panel(2, svg2(L), L.c2) +
        panel(3, svg3(L), L.c3) + panel(4, svg4(L), L.c4) +
      '</div>' +
      (opts.pie !== false ? '<div class="vv-pie">' + L.pie + '</div>' : '');
    return { destroy: function () { container.innerHTML = ''; container.classList.remove('vv'); } };
  }

  /* ---- Modo automático: desplegable «Ver la casa de nuestro vínculo» ---- */
  var DET_CSS = '.vv-det{margin:10px 0}.vv-det>summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;color:var(--vb-acc,#3f6b74);background:var(--vb-acc-bg,rgba(63,107,116,.12));border-radius:18px;padding:7px 13px}' +
    '.vv-det>summary::-webkit-details-marker{display:none}.vv-det[open]>summary{margin-bottom:10px}';
  function langDe(el) {
    var l = el.getAttribute('data-lang') || (document.documentElement.lang || 'es');
    return /^ca/i.test(l) ? 'ca' : 'es';
  }
  function enhance(el) {
    if (el.__vvDone) return; el.__vvDone = true;
    if (!document.getElementById('vineta-vinculo-det-css')) { var st = document.createElement('style'); st.id = 'vineta-vinculo-det-css'; st.textContent = DET_CSS; document.head.appendChild(st); }
    var lang = langDe(el);
    var det = document.createElement('details'); det.className = 'vv-det';
    if (el.hasAttribute('data-open')) det.open = true;
    det.innerHTML = '<summary>🏠 ' + (lang === 'ca' ? 'Veure la casa del nostre vincle' : 'Ver la casa de nuestro vínculo') + '</summary><div></div>';
    el.appendChild(det);
    var box = det.lastChild, inst = null;
    function sync() {
      if (det.open && !inst) inst = mount(box, { lang: lang, titulo: '', pie: true });
      else if (!det.open && inst) { inst.destroy(); inst = null; }
    }
    det.addEventListener('toggle', sync); sync();
  }
  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.hasAttribute && root.hasAttribute('data-vineta-vinculo')) enhance(root);
    Array.prototype.forEach.call(root.querySelectorAll('[data-vineta-vinculo]'), enhance);
  }
  function autoInit() {
    scan(document.body);
    if (global.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); }); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit); else autoInit();

  global.VinetaVinculo = { mount: mount, enhance: enhance };
})(window);
