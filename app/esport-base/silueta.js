/* APRENS · Els pares també juguen — Silueta AIS interactiva (SVG sobre la figura realista del Respiro AIS)
   ---------------------------------------------------------------
   Tres estats:
     Mateix codi que la resta d'eines APRENS: GROC = consciència / atenció,
     BLAU = respiració (l'aire).
     reconec   → tocar on es nota l'activació hi porta la LLUM GROGA (l'atenció)
     acompany  → la LLUM BLAVA (la respiració) acompanya aquesta zona;
                 conviu amb la groga
     elegesc   → l'atenció es dirigeix cap al compromís; la groga NO s'apaga
   Accessibilitat: cada zona és un botó (teclat + lector de pantalla) i hi ha
   una llista de zones equivalent. Groc = taca plena amb punts; blau = anell
   discontinu. Així no depèn només del color.
   Els colors són pedagògics: no mesuren cap estat fisiològic.
   Sense dependències. API:
     var s = SiluetaAIS.mount(el, { txt, mode, groc:[], blau:[], onChange, llista:true, compromis:"" });
     s.setMode(m); s.setRespiracio(bool); s.setCompromis(t); s.get(); s.reset(); s.focusBlau(id)
*/
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  /* Figura: la mateixa il·lustració realista del Respiro AIS (assets/respiro/organismo.webp),
     en el seu sistema de coordenades 1024×1536. La imatge arriba fins als malucs:
     cames i peus es marquen a la vora inferior, com a continuació del cos. */
  var IMG = '../assets/respiro/organismo.webp';
  var PUNTS = {
    cap: [[508, 150]], gola: [[508, 330]], espatles: [[300, 470], [716, 470]],
    pit: [[508, 640]], panxa: [[508, 990]], esquena: [[318, 760], [698, 760]],
    bracos: [[205, 860], [811, 860]], mans: [[85, 1340], [939, 1340]],
    cames: [[420, 1450], [600, 1450]], peus: [[420, 1528], [600, 1528]]
  };
  var RADI = { cap: 80, gola: 48, espatles: 58, pit: 110, panxa: 100, esquena: 60, bracos: 62, mans: 70, cames: 62, peus: 48 };

  function el(tag, at, pare) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) e.setAttribute(k, at[k]);
    if (pare) pare.appendChild(e);
    return e;
  }

  var CSS = '' +
    '.sil{display:flex;flex-direction:column;align-items:center;gap:10px}' +
    '.sil-fig{position:relative;width:min(100%,calc(58vh*1024/1536),320px)}' +
    '.sil svg{width:100%;height:auto;display:block;border-radius:22px;background:#0a0e16;box-shadow:0 10px 30px rgba(0,0,0,.28)}' +
    '.sil .zona{fill:transparent;cursor:pointer;outline:none}' +
    '.sil .zona:focus-visible .hit{fill:rgba(47,94,158,.10);stroke:#9CC8F5;stroke-width:6;stroke-dasharray:14 12}' +
    '@media (hover:hover){.sil .zona:hover .hit{fill:rgba(47,94,158,.06);stroke:#9CC8F5;stroke-width:5;stroke-dasharray:14 12}}' +
    '.sil .hit{fill:transparent}' +
    '.sil .groc{opacity:0;transition:opacity .6s ease}' +
    '.sil .groc.on{opacity:1;animation:silPols 3.2s ease-in-out infinite}' +
    '.sil .blau{opacity:0;transition:opacity .6s ease;transform-box:fill-box;transform-origin:center}' +
    '.sil .blau.on{opacity:1}' +
    '.sil.resp .blau.on{animation:silResp 10s ease-in-out infinite}' +
    '.sil .cami{opacity:0;transition:opacity .8s ease}' +
    '.sil.m-elegesc .cami{opacity:1}' +
    '.sil.m-elegesc .cami path{stroke-dasharray:26 22;animation:silFlux 1.6s linear infinite}' +
        '@keyframes silPols{0%,100%{opacity:.78}50%{opacity:1}}' +
    '@keyframes silResp{0%{transform:scale(.82)}40%{transform:scale(1.18)}100%{transform:scale(.82)}}' +
    '@keyframes silFlux{to{stroke-dashoffset:-96}}' +
    '@media (prefers-reduced-motion: reduce){.sil .groc.on,.sil.resp .blau.on,.sil.m-elegesc .cami path{animation:none}}' +
    '.sil-resp-txt{min-height:1.4em;font-size:14px;color:#244A7E;font-weight:600;text-align:center}' +
    '.sil-llista{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:420px}' +
    '.sil-llista button{min-height:40px;border:1.5px solid #CFCBC1;border-radius:999px;background:#fff;padding:6px 12px;font:inherit;font-size:13.5px;color:#1F2A37;cursor:pointer;display:inline-flex;align-items:center;gap:6px}' +
    '.sil-llista button .mk{display:inline-flex;gap:3px}' +
    '.sil-llista .mk i{width:12px;height:12px;border-radius:50%;display:inline-block}' +
    '.sil-llista .mk i.g{background:radial-gradient(circle,#7A5310 1px,#F2C14E 1.5px);background-size:4px 4px;border:1px solid #B88A1E}' +
    '.sil-llista .mk i.b{border:2px dashed #2F6FC0;background:#E6F0FB}' +
    '.sil-llista button[aria-pressed="true"]{border-color:#1F2A37;font-weight:700}' +
    '.sil-lleg{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:12.5px;color:#55606B}' +
    '.sil-lleg span{display:inline-flex;align-items:center;gap:6px}' +
    '.sil-lleg svg{width:18px;height:18px}';

  function injectCSS() {
    if (document.getElementById('sil-css')) return;
    var s = document.createElement('style'); s.id = 'sil-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function zonesHit(id) {
    function cerc(p, rx, ry) { return ['ellipse', { cx: p[0], cy: p[1], rx: rx, ry: ry || rx }]; }
    switch (id) {
      case 'cap': return [cerc(PUNTS.cap[0], 95, 120)];
      case 'gola': return [['rect', { x: 448, y: 280, width: 120, height: 110, rx: 30 }]];
      case 'espatles': return PUNTS.espatles.map(function (p) { return cerc(p, 80, 55); });
      case 'pit': return [cerc(PUNTS.pit[0], 170, 130)];
      case 'panxa': return [cerc(PUNTS.panxa[0], 150, 150)];
      case 'bracos': return [['rect', { x: 140, y: 560, width: 130, height: 620, rx: 50 }], ['rect', { x: 754, y: 560, width: 130, height: 620, rx: 50 }]];
      case 'mans': return PUNTS.mans.map(function (p) { return cerc(p, 80, 110); });
      case 'cames': return [['rect', { x: 340, y: 1390, width: 344, height: 100, rx: 30 }]];
      case 'peus': return [['rect', { x: 340, y: 1490, width: 344, height: 46, rx: 20 }]];
      default: return [];
    }
  }

  function mount(container, opts) {
    injectCSS();
    opts = opts || {};
    var txt = opts.txt; /* T.silueta + T.zones */
    var id = 'sil' + (++uid);
    var estat = { mode: opts.mode || 'reconec', groc: (opts.groc || []).slice(), blau: (opts.blau || []).slice(), resp: false, compromis: opts.compromis || '' };
    var zonesTxt = {}; txt.zones.forEach(function (z) { zonesTxt[z.id] = z.t; });

    container.innerHTML = '';
    var arrel = document.createElement('div'); arrel.className = 'sil'; container.appendChild(arrel);
    var fig = document.createElement('div'); fig.className = 'sil-fig'; arrel.appendChild(fig);

    var svg = el('svg', { viewBox: '0 0 1024 1536', role: 'group', 'aria-label': txt.silueta.titol }, null);
    fig.appendChild(svg);
    var defs = el('defs', {}, svg);
    var gG = el('radialGradient', { id: id + 'gg' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#FFE7A3', 'stop-opacity': '1' }, gG);
    el('stop', { offset: '55%', 'stop-color': '#F2C14E', 'stop-opacity': '.85' }, gG);
    el('stop', { offset: '100%', 'stop-color': '#F2C14E', 'stop-opacity': '0' }, gG);
    var gB = el('radialGradient', { id: id + 'gb' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#9CC4F2', 'stop-opacity': '.12' }, gB);
    el('stop', { offset: '60%', 'stop-color': '#5AA2EC', 'stop-opacity': '.4' }, gB);
    el('stop', { offset: '100%', 'stop-color': '#5A9BE0', 'stop-opacity': '0' }, gB);
    var pat = el('pattern', { id: id + 'pd', width: 22, height: 22, patternUnits: 'userSpaceOnUse' }, defs);
    el('circle', { cx: 11, cy: 11, r: 4, fill: '#7A5310', 'fill-opacity': '.55' }, pat);

    el('image', { href: IMG, x: 0, y: 0, width: 1024, height: 1536, preserveAspectRatio: 'none', 'aria-hidden': 'true' }, svg);
    var capaEsq = el('g', { 'aria-hidden': 'true', 'pointer-events': 'none' }, svg);
    var capaLlums = el('g', { 'aria-hidden': 'true', 'pointer-events': 'none' }, svg);
    var capaZones = el('g', {}, svg);

    /* camí cap al compromís (estat 3) */
    var cami = el('g', { 'class': 'cami', 'aria-hidden': 'true' }, svg);
    el('path', { d: 'M508 640 C 700 600, 860 420, 990 250', fill: 'none', stroke: '#7DB8F2', 'stroke-width': 12, 'stroke-linecap': 'round' }, cami);
    el('circle', { cx: 990, cy: 250, r: 22, fill: '#7DB8F2' }, cami);

    var llums = {};
    Object.keys(PUNTS).forEach(function (z) {
      var capa = z === 'esquena' ? capaEsq : capaLlums;
      var grp = { g: [], b: [] };
      PUNTS[z].forEach(function (p) {
        var r = RADI[z];
        var g = el('g', { 'class': 'groc' }, capa);
        el('circle', { cx: p[0], cy: p[1], r: r, fill: 'url(#' + id + 'gg)' }, g);
        el('circle', { cx: p[0], cy: p[1], r: r * .62, fill: 'url(#' + id + 'pd)' }, g);
        grp.g.push(g);
        var b = el('g', { 'class': 'blau' }, capa);
        el('circle', { cx: p[0], cy: p[1], r: r * 1.25, fill: 'url(#' + id + 'gb)' }, b);
        el('circle', { cx: p[0], cy: p[1], r: r * 1.12, fill: 'none', stroke: '#7DB8F2', 'stroke-width': 12, 'stroke-dasharray': '22 14' }, b);
        grp.b.push(b);
      });
      llums[z] = grp;
    });

    /* zones clicables (l'esquena només a la llista: no es veu de cara; la llum surt als costats del tronc) */
    var zEls = {};
    txt.zones.forEach(function (z) {
      var forms = zonesHit(z.id); if (!forms.length) return;
      var g = el('g', { 'class': 'zona', role: 'button', tabindex: '0', 'data-zona': z.id }, capaZones);
      forms.forEach(function (f) { var e = el(f[0], f[1], g); e.setAttribute('class', 'hit'); });
      g.addEventListener('click', function () { toca(z.id); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toca(z.id); } });
      zEls[z.id] = g;
    });

    var respTxt = document.createElement('div'); respTxt.className = 'sil-resp-txt'; respTxt.setAttribute('aria-live', 'off');
    arrel.appendChild(respTxt);

    var lleg = document.createElement('div'); lleg.className = 'sil-lleg';
    lleg.innerHTML = '<span><svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8" fill="#F2C14E"/><circle cx="6" cy="7" r="1" fill="#7A5310"/><circle cx="11" cy="6" r="1" fill="#7A5310"/><circle cx="9" cy="11" r="1" fill="#7A5310"/></svg>' + esc(txt.silueta.llegendaGroc) + '</span>' +
      '<span><svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7" fill="#E6F0FB" stroke="#2F6FC0" stroke-width="2" stroke-dasharray="3 2"/></svg>' + esc(txt.silueta.llegendaBlau) + '</span>';
    arrel.appendChild(lleg);

    var llista = null;
    if (opts.llista !== false) {
      llista = document.createElement('div'); llista.className = 'sil-llista'; llista.setAttribute('role', 'group');
      llista.setAttribute('aria-label', txt.silueta.zonaSel);
      txt.zones.forEach(function (z) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-zona', z.id);
        b.addEventListener('click', function () { toca(z.id); });
        llista.appendChild(b);
      });
      arrel.appendChild(llista);
    }

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function estatZona(z) {
      var parts = [];
      if (estat.groc.indexOf(z) >= 0) parts.push(txt.silueta.llegendaGroc);
      if (estat.blau.indexOf(z) >= 0) parts.push(txt.silueta.llegendaBlau);
      return parts;
    }

    function pinta() {
      arrel.className = 'sil m-' + estat.mode + (estat.resp ? ' resp' : '');
      Object.keys(llums).forEach(function (z) {
        llums[z].g.forEach(function (n) { n.classList.toggle('on', estat.groc.indexOf(z) >= 0); });
        llums[z].b.forEach(function (n) { n.classList.toggle('on', estat.blau.indexOf(z) >= 0); });
      });
      Object.keys(zEls).forEach(function (z) {
        var p = estatZona(z);
        zEls[z].setAttribute('aria-label', zonesTxt[z] + (p.length ? ': ' + p.join(', ') : ''));
        zEls[z].setAttribute('aria-pressed', String(estat.mode === 'acompany' ? estat.blau.indexOf(z) >= 0 : estat.groc.indexOf(z) >= 0));
        if (estat.mode === 'elegesc') { zEls[z].setAttribute('tabindex', '-1'); zEls[z].setAttribute('aria-disabled', 'true'); }
        else { zEls[z].setAttribute('tabindex', '0'); zEls[z].removeAttribute('aria-disabled'); }
      });
      if (llista) {
        llista.style.display = estat.mode === 'elegesc' ? 'none' : '';
        Array.prototype.forEach.call(llista.children, function (b) {
          var z = b.getAttribute('data-zona'), g = estat.groc.indexOf(z) >= 0, bl = estat.blau.indexOf(z) >= 0;
          b.innerHTML = '<span class="mk" aria-hidden="true">' + (g ? '<i class="g"></i>' : '') + (bl ? '<i class="b"></i>' : '') + '</span>' + esc(zonesTxt[z]) +
            ((g || bl) ? '<span class="sr">: ' + esc(estatZona(z).join(', ')) + '</span>' : '');
          b.setAttribute('aria-pressed', String(estat.mode === 'acompany' ? bl : g));
        });
      }
    }

    function toca(z) {
      if (estat.mode === 'elegesc') return;
      var arr = estat.mode === 'acompany' ? estat.blau : estat.groc;
      var i = arr.indexOf(z); if (i >= 0) arr.splice(i, 1); else arr.push(z);
      pinta();
      if (opts.onChange) opts.onChange(api.get(), z, i < 0);
    }

    /* text de respiració (només si està activada i no hi ha moviment reduït) */
    var respT = null;
    function setRespiracio(on) {
      estat.resp = !!on; clearInterval(respT); respTxt.textContent = '';
      if (estat.resp) {
        var fase = 0;
        var tick = function () { respTxt.textContent = fase % 10 < 4 ? txt.silueta.respEntra : txt.silueta.respSurt; fase++; };
        tick(); respT = setInterval(tick, 1000);
      }
      pinta();
    }

    var api = {
      setMode: function (m) { estat.mode = m; pinta(); },
      setRespiracio: setRespiracio,
      setCompromis: function (t) { estat.compromis = t || ''; },
      focusGroc: function (z) { if (estat.groc.indexOf(z) < 0) estat.groc.push(z); pinta(); },
      focusBlau: function (z) { if (estat.blau.indexOf(z) < 0) estat.blau.push(z); pinta(); },
      get: function () { return { mode: estat.mode, groc: estat.groc.slice(), blau: estat.blau.slice() }; },
      reset: function () { estat.groc = []; estat.blau = []; pinta(); },
      destroy: function () { clearInterval(respT); container.innerHTML = ''; }
    };
    pinta();
    return api;
  }

  global.SiluetaAIS = { mount: mount };
})(window);
