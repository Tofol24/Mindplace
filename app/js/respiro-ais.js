/* ============================================================
   APRENS · Respiro AIS — componente de respiración de dos luces
   ------------------------------------------------------------
   Traslada a cualquier herramienta la dinámica del «respiro» de
   Formentor Flow, sin el simbolismo del pino:

     · AZUL  = el aire.       Entra por la nariz al inhalar, baja por
                              la vía aérea hasta el vientre y, al
                              exhalar, sube y sale.
     · AMARILLA = la conciencia. Sigue al aire al bajar (el aire es el
                              cebo) y NO sube al exhalar: queda como una
                              luz brillante en la barriga / el vientre.

   La figura por defecto es una silueta con sus órganos dibujada en
   SVG inline (cerebro, vía aérea, pulmones, vientre). Se puede
   sustituir por una ilustración propia (imagen) pasando opts.image.

   Autónomo: sin dependencias, sin red, sin almacenamiento. Inyecta
   su propio CSS una sola vez. Compatible con la CSP del sitio
   (default-src 'self'; 'unsafe-inline' en style/script; img data:).

   USO:
     var r = RespiroAIS.mount(document.getElementById('miCaja'), {
       lang: 'es',                 // 'es' | 'en'
       figure: 'organism',         // 'organism' (adulto, con órganos) | 'child' (silueta + flor + vela)
       autostart: false,           // arrancar solo al montar
       showControl: true,          // pinta su propio botón Empezar/Parar
       showZones: true,            // etiquetas cuello/pecho/barriga (solo figura organism)
       rhythm: {inhale:3000, anchor:2000, exhale:7000, pause:1000},
       labels: { phase:{...}, hint:{...} },  // frases a medida (p. ej. flor/vela)
       onCycle: function(n){}      // callback por ciclo completado
     });
     r.start(); r.stop(); r.toggle(); r.setLang('en'); r.destroy();
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- CSS (una sola vez) ---------- */
  var CSS = '' +
  '.respiro-ais{--ra-air:#3FA6D8;--ra-air-hi:#EAF6FF;--ra-mind:#E9B458;--ra-mind-hi:#FFFBEF;' +
  '  --ra-ink:#33474d;--ra-muted:#7c8a88;--ra-serif:"Fraunces","Newsreader",Georgia,serif;' +
  '  --ra-mono:"SFMono-Regular",ui-monospace,Menlo,Consolas,monospace;' +
  '  --ra-pill-bg:rgba(252,251,247,.9);--ra-pill-bd:rgba(16,58,68,.14);--ra-pill-ink:#1B5A68;' +
  '  display:flex;flex-direction:column;align-items:center;}' +
  '.respiro-ais *{box-sizing:border-box;}' +
  '.ra-stage{position:relative;width:min(100%,calc(56vh*820/1240));aspect-ratio:820/1240;' +
  '  margin:6px auto;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation;}' +
  '@supports (height:1svh){.ra-stage{width:min(100%,calc(56svh*820/1240));}}' +
  '.ra-stage>*{position:absolute;inset:0;width:100%;height:100%;}' +
  '.ra-halo{inset:auto;left:50%;top:56%;width:92%;height:auto;aspect-ratio:1;border-radius:50%;' +
  '  background:radial-gradient(circle,rgba(46,124,138,.16) 0%,rgba(199,179,147,.09) 46%,rgba(199,179,147,0) 70%);' +
  '  transform:translate(-50%,-50%) scale(.86);opacity:.35;will-change:transform,opacity;pointer-events:none;}' +
  '.ra-layer{overflow:visible;pointer-events:none;}' +
  '.ra-figure{opacity:.96;}' +
  '.respiro-ais.ra-dark .ra-stage{background:radial-gradient(120% 90% at 50% 42%,#141c28 0%,#0a0e16 66%,#05070c 100%);border-radius:22px;box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 0 70px rgba(0,0,0,.55);overflow:hidden;}' +
  '.respiro-ais.ra-dark .ra-figure{opacity:1;}' +
  '.ra-zone-glow{opacity:0;}' +
  '.ra-zone-label text{font-family:var(--ra-mono);font-size:23px;letter-spacing:3px;fill:var(--ra-muted);font-weight:600;}' +
  '.ra-zone-label line{stroke:var(--ra-muted);stroke-opacity:.4;stroke-width:2;}' +
  '.ra-zone-label{opacity:.5;transition:opacity .35s ease;}' +
  '.ra-zone.on .ra-zone-label{opacity:1;}' +
  '.ra-zone.on .ra-zone-label text{fill:var(--ra-mind);}' +
  '.ra-trail-soft{fill:none;stroke:var(--ra-mind);stroke-width:16;stroke-linecap:round;stroke-linejoin:round;opacity:0;}' +
  '.ra-trail-core{fill:none;stroke:var(--ra-mind-hi);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;opacity:0;}' +
  '.ra-dot,.ra-anchor,.ra-air{opacity:0;}' +
  '.ra-ui{position:relative;min-height:34px;display:flex;justify-content:center;margin-top:6px;pointer-events:none;}' +
  '.ra-pill{display:flex;align-items:baseline;gap:9px;background:var(--ra-pill-bg);border:1px solid var(--ra-pill-bd);' +
  '  border-radius:24px;padding:6px 15px 7px;color:var(--ra-pill-ink);opacity:0;transition:opacity .3s ease;' +
  '  -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}' +
  '.respiro-ais.ra-running .ra-pill{opacity:1;}' +
  '.ra-pill .pl{font-family:var(--ra-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;}' +
  '.ra-pill .pn{font-family:var(--ra-serif);font-size:22px;line-height:1;min-width:.7em;text-align:center;}' +
  '.ra-pill .ph{font-family:var(--ra-serif);font-style:italic;font-size:.82rem;opacity:.75;}' +
  '.ra-control{margin-top:10px;font-family:var(--ra-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;' +
  '  font-weight:600;color:#fff;background:var(--ra-pill-ink);border:none;border-radius:24px;padding:11px 22px;' +
  '  min-height:44px;cursor:pointer;}' +
  '.ra-control:focus-visible{outline:3px solid var(--ra-mind);outline-offset:2px;}' +
  '.ra-count{margin-top:8px;min-height:16px;font-family:var(--ra-mono);font-size:11px;letter-spacing:.12em;' +
  '  text-transform:uppercase;color:var(--ra-muted);text-align:center;}' +
  '.ra-count b{font-family:var(--ra-serif);font-size:15px;color:var(--ra-mind);margin-right:4px;letter-spacing:0;}' +
  '.ra-legend{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:9px;font-family:var(--ra-mono);font-size:10px;letter-spacing:.05em;color:var(--ra-muted);}' +
  '.ra-legend span{display:inline-flex;align-items:center;gap:6px;}' +
  '.ra-legend i{width:11px;height:11px;border-radius:50%;flex:none;}' +
  '.ra-legend .ra-lg-air{background:radial-gradient(circle at 40% 40%,#EAF6FF,#3FA6D8);}' +
  '.ra-legend .ra-lg-mind{background:radial-gradient(circle at 40% 40%,#FFFBEF,#E9B458);}' +
  '.ra-flame{transform-box:fill-box;transform-origin:center bottom;}' +
  '.respiro-ais[data-phase="exhale"] .ra-flame{animation:raFlicker .5s ease-in-out infinite;}' +
  '@keyframes raFlicker{0%,100%{transform:rotate(-8deg) scaleY(.88);}50%{transform:rotate(9deg) scaleY(1.1);}}' +
  '@media (prefers-reduced-motion:reduce){.ra-trail-soft,.ra-trail-core{display:none;}.respiro-ais[data-phase="exhale"] .ra-flame{animation:none;}}';

  function injectCSS() {
    if (document.getElementById('respiro-ais-css')) return;
    var st = document.createElement('style');
    st.id = 'respiro-ais-css';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- Ilustración por defecto: silueta + órganos (viewBox 820×1240) ---------- */
  /* Recorrido central: nariz (exterior) → cuello → pecho (pulmones) → barriga. */
  var ORGANISM = {
    viewBox: '0 0 820 1240',
    route: [[410,250],[410,338],[410,400],[410,500],[410,600],[410,718],[410,832]],
    anchors: { ext: 0, z1: 2, z2: 4, z3: 6 }, brain: [410,150],
    glow: { z1: [410,400,120], z2: [410,585,190], z3: [410,832,175] },
    labels: { z1: [548,400], z2: [612,560], z3: [560,850] },
    svg: '' +
      /* silueta */
      '<path class="ra-body" d="M384 352 C382 396 366 404 330 424 C250 456 196 470 190 542 C187 606 214 660 236 726 C258 792 252 872 256 936 C259 992 300 1030 410 1030 C520 1030 561 992 564 936 C568 872 562 792 584 726 C606 660 633 606 630 542 C624 470 570 456 490 424 C454 404 438 396 436 352 Z" fill="#eef1ef" fill-opacity=".55" stroke="#8fa0a2" stroke-width="3"/>' +
      '<ellipse class="ra-body" cx="410" cy="212" rx="122" ry="150" fill="#eef1ef" fill-opacity=".55" stroke="#8fa0a2" stroke-width="3"/>' +
      /* cerebro */
      '<path d="M410 96 C356 96 320 132 320 182 C320 214 336 236 356 250 C352 268 360 288 384 294 C398 312 424 312 440 296 C466 292 476 270 470 250 C492 236 500 214 500 182 C500 132 464 96 410 96 Z" fill="#d6c4a8" fill-opacity=".55" stroke="#b39a72" stroke-width="2.5"/>' +
      '<path d="M410 110 L410 292 M372 150 C392 168 392 196 372 214 M448 150 C428 168 428 196 448 214 M360 240 C384 232 436 232 460 240" fill="none" stroke="#b39a72" stroke-width="2.2" stroke-opacity=".8" stroke-linecap="round"/>' +
      /* vía aérea (tráquea) */
      '<path d="M410 360 L410 500" stroke="#a9b7b5" stroke-width="16" stroke-linecap="round" fill="none" opacity=".7"/>' +
      '<path d="M410 360 L410 500" stroke="#e7eeed" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      /* pulmones */
      '<path d="M398 505 C372 500 320 508 300 546 C280 586 286 648 306 688 C326 724 372 730 392 706 C402 690 400 560 398 505 Z" fill="#d7b6ae" fill-opacity=".5" stroke="#b98b80" stroke-width="2.5"/>' +
      '<path d="M422 505 C448 500 500 508 520 546 C540 586 534 648 514 688 C494 724 448 730 428 706 C418 690 420 560 422 505 Z" fill="#d7b6ae" fill-opacity=".5" stroke="#b98b80" stroke-width="2.5"/>' +
      /* corazón (pequeño, entre los pulmones) */
      '<path d="M410 578 C404 566 388 562 380 574 C372 586 380 602 410 620 C440 602 448 586 440 574 C432 562 416 566 410 578 Z" fill="#c8695a" fill-opacity=".55" stroke="#a94d40" stroke-width="2"/>' +
      /* diafragma */
      '<path d="M320 706 C360 736 460 736 500 706" fill="none" stroke="#b98b80" stroke-width="2.4" stroke-opacity=".7"/>' +
      /* vientre / vísceras */
      '<path d="M330 748 C318 800 322 880 360 928 C400 972 440 972 470 928 C500 884 502 800 490 748 C440 764 380 764 330 748 Z" fill="#e7c892" fill-opacity=".5" stroke="#c79a55" stroke-width="2.5"/>' +
      '<path d="M360 786 C400 806 430 794 462 782 M356 828 C398 852 436 840 470 824 M366 874 C402 894 430 886 458 872" fill="none" stroke="#c79a55" stroke-width="2.2" stroke-opacity=".75" stroke-linecap="round"/>'
  };

  /* ---------- Ilustración infantil: silueta + flor + vela + lucecita en la barriga ----------
     Funde la vela (la exhalación: apagarla) con la silueta y la lucecita que se queda en la
     barriga (la conciencia), para que se entienda la finalidad. Sin órganos. */
  var CHILD = {
    viewBox: '0 0 820 1240',
    route: [[410,300],[410,370],[410,440],[410,540],[410,620],[410,700],[410,772]],
    anchors: { ext: 0, z1: 2, z2: 4, z3: 6 }, brain: [410,150],
    svg: '' +
      /* cuerpo */
      '<path d="M352 366 C348 404 322 414 288 438 C232 474 208 505 214 566 C218 622 248 662 253 720 C258 786 253 862 262 922 C266 968 308 998 410 998 C512 998 554 968 558 922 C567 862 562 786 567 720 C572 662 602 622 606 566 C612 505 588 474 532 438 C498 414 472 404 468 366 Z" fill="#F6DFCC" fill-opacity=".92" stroke="#E0A98C" stroke-width="3"/>' +
      '<ellipse cx="410" cy="210" rx="150" ry="165" fill="#F6DFCC" fill-opacity=".92" stroke="#E0A98C" stroke-width="3"/>' +
      /* cara */
      '<circle cx="330" cy="242" r="24" fill="#F3B49A" fill-opacity=".7"/>' +
      '<circle cx="490" cy="242" r="24" fill="#F3B49A" fill-opacity=".7"/>' +
      '<circle cx="362" cy="196" r="10" fill="#5b4a4a"/>' +
      '<circle cx="458" cy="196" r="10" fill="#5b4a4a"/>' +
      '<path d="M374 252 Q410 284 446 252" fill="none" stroke="#5b4a4a" stroke-width="6" stroke-linecap="round"/>' +
      /* flor (izquierda · oler = inspirar) */
      '<path d="M232 320 C252 372 260 416 258 452" fill="none" stroke="#7CA86A" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M246 392 C232 380 214 384 210 400 C226 408 242 402 246 392 Z" fill="#8FBE7C" stroke="#6E9A5E" stroke-width="1.5"/>' +
      '<g>' +
        '<ellipse cx="216" cy="252" rx="24" ry="30" fill="#EBB6D2" stroke="#CE85AC" stroke-width="1.6"/>' +
        '<ellipse cx="252" cy="278" rx="30" ry="24" fill="#EBB6D2" stroke="#CE85AC" stroke-width="1.6"/>' +
        '<ellipse cx="238" cy="320" rx="24" ry="30" fill="#EBB6D2" stroke="#CE85AC" stroke-width="1.6"/>' +
        '<ellipse cx="194" cy="320" rx="24" ry="30" fill="#EBB6D2" stroke="#CE85AC" stroke-width="1.6"/>' +
        '<ellipse cx="180" cy="278" rx="30" ry="24" fill="#EBB6D2" stroke="#CE85AC" stroke-width="1.6"/>' +
        '<circle cx="216" cy="287" r="17" fill="#F6D06B" stroke="#E0B23F" stroke-width="1.6"/>' +
      '</g>' +
      /* vela (derecha · apagar = exhalar) */
      '<rect x="548" y="300" width="40" height="98" rx="9" fill="#F3E7C9" stroke="#D9C48E" stroke-width="2"/>' +
      '<rect x="552" y="300" width="12" height="98" rx="6" fill="#FBF3DE" opacity=".7"/>' +
      '<line x1="568" y1="300" x2="568" y2="288" stroke="#6b5b4a" stroke-width="4" stroke-linecap="round"/>' +
      '<g class="ra-flame">' +
        '<path d="M568 250 C552 270 552 286 568 292 C584 286 584 270 568 250 Z" fill="#F4A03C"/>' +
        '<path d="M568 266 C560 276 560 286 568 290 C576 286 576 276 568 266 Z" fill="#FCE7A6"/>' +
      '</g>' +
      /* lucecita en la barriga (donde se queda la conciencia) */
      '<g stroke="#EBCB77" stroke-width="3" stroke-linecap="round" opacity=".55">' +
        '<line x1="410" y1="694" x2="410" y2="676"/><line x1="410" y1="850" x2="410" y2="868"/>' +
        '<line x1="332" y1="772" x2="314" y2="772"/><line x1="488" y1="772" x2="506" y2="772"/>' +
        '<line x1="356" y1="718" x2="344" y2="706"/><line x1="464" y1="718" x2="476" y2="706"/>' +
        '<line x1="356" y1="826" x2="344" y2="838"/><line x1="464" y1="826" x2="476" y2="838"/>' +
      '</g>' +
      '<circle cx="410" cy="772" r="56" fill="#FCEBB6" fill-opacity=".45" stroke="#EBCB77" stroke-width="2"/>'
  };

  /* ---------- Ilustración realista (imagen del organismo, dibujo del terapeuta) ----------
     Fondo oscuro (visor); el recorrido sigue la anatomía: nariz → tráquea → entre los
     pulmones → estómago/vientre. Se muestra sobre un visor oscuro para funcionar en
     páginas de fondo claro. */
  var REALISTIC = {
    src: '../assets/respiro/organismo.webp',
    viewBox: '0 0 1024 1536',
    route: [[508,235],[508,340],[508,430],[512,560],[516,700],[512,860],[505,1000]],
    anchors: { ext: 0, z1: 2, z2: 4, z3: 6 }, brain: [508,128]
  };
  /* Versión infantil realista (mismo estilo, cuerpo de niño). */
  var REALISTIC_CHILD = {
    src: '../assets/respiro/organismo_nino.webp',
    viewBox: '0 0 1024 1536',
    route: [[508,225],[508,330],[508,420],[510,520],[512,600],[510,700],[505,790]],
    anchors: { ext: 0, z1: 2, z2: 4, z3: 6 }, brain: [508,104]
  };

  /* ---------- Textos ---------- */
  var I18N = {
    es: {
      zones: { z1: 'CUELLO', z2: 'PECHO', z3: 'VIENTRE' },
      phase: { inhale: 'Inhala', anchor: 'Quédate', exhale: 'Exhala', pause: 'Pausa' },
      hint:  { inhale: 'el aire entra y la atención baja', anchor: 'la conciencia se queda en el vientre',
               exhale: 'el aire sube y sale; la conciencia permanece', pause: 'respira natural' },
      legend: { air: 'el aire · entra por la nariz', mind: 'tu atención consciente · desde la cabeza' },
      start: 'Empezar', stop: 'Parar', one: 'respiración', many: 'respiraciones'
    },
    en: {
      zones: { z1: 'THROAT', z2: 'CHEST', z3: 'BELLY' },
      phase: { inhale: 'Breathe in', anchor: 'Stay', exhale: 'Breathe out', pause: 'Pause' },
      hint:  { inhale: 'air comes in, attention drops', anchor: 'awareness stays in the belly',
               exhale: 'air rises and leaves; awareness remains', pause: 'breathe naturally' },
      legend: { air: 'the air · in through the nose', mind: 'your conscious attention · from the head' },
      start: 'Start', stop: 'Stop', one: 'breath', many: 'breaths'
    }
  };

  /* ---------- Motor determinista (por instancia) ---------- */
  function makeEngine(rhythm) {
    var T = rhythm, CYCLE = T.inhale + T.anchor + T.exhale + T.pause;
    var Q_EXIT = -0.38, RESID = 0.62;
    function sine(x){ return -(Math.cos(Math.PI * x) - 1) / 2; }
    function smooth(a, b, x){ var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    function at(ms){
      var cyc = Math.floor(ms / CYCLE), c = ms - cyc * CYCLE, s = { cycle: cyc };
      if (c < T.inhale){
        var p = c / T.inhale;
        s.phase = 'inhale'; s.elapsed = c; s.dur = T.inhale; s.progress = p;
        s.q = sine(p); s.dot = Math.min(1, p / 0.12);
        s.anchor = cyc > 0 ? RESID * (1 - smooth(0, 0.7, p)) : 0;
        s.breath = 0.86 + 0.14 * sine(p);
      } else if (c < T.inhale + T.anchor){
        var p2 = (c - T.inhale) / T.anchor;
        s.phase = 'anchor'; s.elapsed = c - T.inhale; s.dur = T.anchor; s.progress = p2;
        s.q = 1; s.dot = 1 - smooth(0, 0.35, p2) * 0.6; s.anchor = smooth(0, 0.35, p2); s.breath = 1;
      } else if (c < T.inhale + T.anchor + T.exhale){
        var p3 = (c - T.inhale - T.anchor) / T.exhale, u = sine(p3);
        s.phase = 'exhale'; s.elapsed = c - T.inhale - T.anchor; s.dur = T.exhale; s.progress = p3;
        s.q = 1 - (1 - Q_EXIT) * u;
        s.dot = s.q >= 0 ? Math.min(1, 0.4 + smooth(0, 0.12, p3) * 0.6) : 1 - s.q / Q_EXIT;
        s.anchor = RESID + (1 - RESID) * (1 - smooth(0, 0.07, p3)); s.breath = 1 - 0.14 * u;
      } else {
        var p4 = (c - T.inhale - T.anchor - T.exhale) / T.pause;
        s.phase = 'pause'; s.elapsed = c - T.inhale - T.anchor - T.exhale; s.dur = T.pause; s.progress = p4;
        s.q = Q_EXIT; s.dot = 0; s.anchor = RESID; s.breath = 0.86;
      }
      s.n = Math.min(Math.round(s.dur / 1000), Math.floor(s.elapsed / 1000) + 1);
      return s;
    }
    return { CYCLE: CYCLE, Q_EXIT: Q_EXIT, at: at };
  }

  /* ---------- Geometría (recorrido → punto en el viewBox) ---------- */
  function prepRoute(g, Q_EXIT){
    var pts = g.route, cum = [0], i;
    for (i = 1; i < pts.length; i++) cum.push(cum[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
    var a = g.anchors;
    g._cum = cum;
    g._keys = [ [Q_EXIT, cum[a.ext]], [0, cum[a.z1]], [0.5, cum[a.z2]], [1, cum[a.z3]] ];
  }
  function pointAt(g, q){
    var k = g._keys, L, i, j;
    if (q <= k[0][0]) L = k[0][1];
    else if (q >= k[3][0]) L = k[3][1];
    else for (i = 0; i < 3; i++) if (q <= k[i+1][0]){ L = k[i][1] + (q - k[i][0]) / (k[i+1][0] - k[i][0]) * (k[i+1][1] - k[i][1]); break; }
    var cum = g._cum, pts = g.route;
    for (j = 1; j < cum.length; j++) if (L <= cum[j]){
      var f = (L - cum[j-1]) / (cum[j] - cum[j-1] || 1);
      return [pts[j-1][0] + f * (pts[j][0] - pts[j-1][0]), pts[j-1][1] + f * (pts[j][1] - pts[j-1][1])];
    }
    return pts[pts.length - 1].slice();
  }
  function pathFrom(g, qs){
    var d = '', i;
    for (i = 0; i < qs.length; i++){ var p = pointAt(g, qs[i]); d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    return d;
  }

  /* ---------- Montaje ---------- */
  function mount(container, opts){
    injectCSS();
    opts = opts || {};
    var lang = (opts.lang === 'en') ? 'en' : 'es';
    var rhythm = opts.rhythm || { inhale: 3000, anchor: 2000, exhale: 7000, pause: 1000 };
    var showControl = opts.showControl !== false;
    var showZones = opts.showZones !== false;
    var showLegend = opts.legend !== false;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Figura: por defecto la ilustración realista (imagen). 'organism-svg' usa la
       silueta vectorial ligera; 'child' la infantil; opts.image una imagen propia. */
    var fig, isImage = false, imgSrc = null, dark = false;
    if (opts.image){
      isImage = true; imgSrc = opts.image.src; dark = !!opts.dark;
      fig = { viewBox: opts.image.viewBox || '0 0 820 1240', route: opts.image.route,
              anchors: opts.image.anchors, glow: opts.image.glow || {}, labels: opts.image.labels || null, brain: opts.image.brain };
    } else if (opts.figure === 'child'){
      fig = CHILD;
    } else if (opts.figure === 'child-real'){
      isImage = true; imgSrc = REALISTIC_CHILD.src; dark = true;
      fig = { viewBox: REALISTIC_CHILD.viewBox, route: REALISTIC_CHILD.route, anchors: REALISTIC_CHILD.anchors, glow: {}, labels: null, brain: REALISTIC_CHILD.brain };
    } else if (opts.figure === 'organism-svg'){
      fig = ORGANISM;
    } else {                                  /* 'organism' / 'realistic' (defecto) */
      isImage = true; imgSrc = REALISTIC.src; dark = true;
      fig = { viewBox: REALISTIC.viewBox, route: REALISTIC.route, anchors: REALISTIC.anchors, glow: {}, labels: null, brain: REALISTIC.brain };
    }

    /* textos combinados (permite frases a medida por herramienta, p. ej. flor/vela) */
    function str(){
      var b = I18N[lang], o = opts.labels;
      if (!o) return b;
      return {
        zones: Object.assign({}, b.zones, o.zones),
        phase: Object.assign({}, b.phase, o.phase),
        hint: Object.assign({}, b.hint, o.hint),
        legend: Object.assign({}, b.legend, o.legend),
        start: o.start || b.start, stop: o.stop || b.stop, one: o.one || b.one, many: o.many || b.many
      };
    }

    var eng = makeEngine(rhythm);
    prepRoute(fig, eng.Q_EXIT);
    var ZQ = { z1: 0, z2: 0.5, z3: 1 };
    var useZones = showZones && !isImage && !!fig.labels;

    /* Recorrido de la ATENCIÓN (amarilla): NACE en la FRENTE (bien arriba, para
       diferenciarla del aire) y desciende siguiendo al aire hasta el vientre.
       Reservamos un tramo amplio (frente→nariz) del recorrido para que se vea
       claramente que parte de la cabeza, no de la garganta. */
    var nosePt = pointAt(fig, eng.Q_EXIT);
    var brainPt = fig.brain || nosePt;
    var brainFrac = fig.brain ? 0.34 : 0;
    function mindPoint(t){   /* t: 0 = cerebro · 1 = vientre */
      if (t <= brainFrac){
        var u = brainFrac > 0 ? t / brainFrac : 1;
        return [brainPt[0] + (nosePt[0] - brainPt[0]) * u, brainPt[1] + (nosePt[1] - brainPt[1]) * u];
      }
      var q = eng.Q_EXIT + (1 - eng.Q_EXIT) * ((t - brainFrac) / (1 - brainFrac));
      return pointAt(fig, q);
    }
    function pathPts(pts){ var d = '', i; for (i = 0; i < pts.length; i++){ d += (i ? 'L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1); } return d; }
    var vb = fig.viewBox.split(/\s+/);   /* "0 0 W H" */
    var ls = (parseFloat(vb[2]) || 820) / 820;   /* escala de las luces según el ancho del viewBox */
    function rr(n){ return (n * ls).toFixed(1); }

    /* markup */
    var figLayer = isImage
      ? '<img class="ra-figure" src="' + imgSrc + '" alt="" draggable="false" style="object-fit:contain;">'
      : '';
    var zonesMarkup = '';
    if (useZones){
      ['z1','z2','z3'].forEach(function(z){
        var gl = fig.glow[z], lb = fig.labels[z], p = fig.route[fig.anchors[z]];
        zonesMarkup += '<g class="ra-zone" data-zone="' + z + '">' +
          '<circle class="ra-zone-glow" cx="' + gl[0] + '" cy="' + gl[1] + '" r="' + gl[2] + '" fill="url(#raZone)"/>' +
          '<g class="ra-zone-label"><line x1="' + (p[0]+14) + '" y1="' + p[1] + '" x2="' + (lb[0]-6) + '" y2="' + lb[1] + '"/>' +
          '<text x="' + lb[0] + '" y="' + (lb[1]+8) + '"></text></g></g>';
      });
    }
    container.classList.add('respiro-ais');
    if (dark) container.classList.add('ra-dark');
    container.innerHTML =
      '<div class="ra-stage" style="aspect-ratio:' + vb[2] + '/' + vb[3] + '">' +
        '<div class="ra-halo" aria-hidden="true"></div>' +
        figLayer +
        '<svg class="ra-layer" viewBox="' + fig.viewBox + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
          '<defs>' +
            '<radialGradient id="raZone"><stop offset="0%" stop-color="#F3C877" stop-opacity=".55"/><stop offset="60%" stop-color="#E9B458" stop-opacity=".14"/><stop offset="100%" stop-color="#E9B458" stop-opacity="0"/></radialGradient>' +
            '<radialGradient id="raAir"><stop offset="0%" stop-color="#EAF6FF" stop-opacity="1"/><stop offset="35%" stop-color="#7CC4E6" stop-opacity=".8"/><stop offset="100%" stop-color="#3FA6D8" stop-opacity="0"/></radialGradient>' +
            '<radialGradient id="raDot"><stop offset="0%" stop-color="#FFF6DF" stop-opacity="1"/><stop offset="35%" stop-color="#F3C877" stop-opacity=".75"/><stop offset="100%" stop-color="#E9B458" stop-opacity="0"/></radialGradient>' +
            '<radialGradient id="raAnchor"><stop offset="0%" stop-color="#FFFBEF" stop-opacity="1"/><stop offset="30%" stop-color="#FFE08A" stop-opacity=".92"/><stop offset="66%" stop-color="#F6C24E" stop-opacity=".34"/><stop offset="100%" stop-color="#F6C24E" stop-opacity="0"/></radialGradient>' +
          '</defs>' +
          (isImage ? '' : '<g class="ra-figure">' + fig.svg + '</g>') +
          zonesMarkup +
          '<g class="ra-anchor" data-el="anchor"><g data-el="anchorScale">' +
            '<circle r="' + rr(128) + '" fill="url(#raAnchor)"/><circle r="' + rr(64) + '" fill="none" stroke="#FFD97A" stroke-opacity=".72" stroke-width="' + rr(2.5) + '"/><circle r="' + rr(10) + '" fill="#FFFBEF"/></g></g>' +
          '<path class="ra-trail-soft" data-el="trailSoft" d="" style="stroke-width:' + rr(16) + 'px"/>' +
          '<path class="ra-trail-core" data-el="trailCore" d="" style="stroke-width:' + rr(4) + 'px"/>' +
          '<g class="ra-air" data-el="air"><circle r="' + rr(40) + '" fill="url(#raAir)"/><circle r="' + rr(8) + '" fill="#EAF6FF"/></g>' +
          '<g class="ra-dot" data-el="dot"><circle r="' + rr(44) + '" fill="url(#raDot)"/><circle r="' + rr(9) + '" fill="#FFF6DF"/></g>' +
        '</svg>' +
      '</div>' +
      '<div class="ra-ui"><div class="ra-pill" aria-live="polite"><span class="pl"></span><span class="pn"></span><span class="ph"></span></div></div>' +
      (showLegend ? '<div class="ra-legend"><span><i class="ra-lg-air"></i><span class="ra-lg-air-t"></span></span><span><i class="ra-lg-mind"></i><span class="ra-lg-mind-t"></span></span></div>' : '') +
      (showControl ? '<button class="ra-control" type="button"></button>' : '') +
      '<div class="ra-count" aria-live="polite"></div>';

    /* refs */
    var q = function (sel){ return container.querySelector(sel); };
    var stage = q('.ra-stage');
    var haloEl = q('.ra-halo');
    var airEl = q('[data-el="air"]');
    var dotEl = q('[data-el="dot"]');
    var anchorEl = q('[data-el="anchor"]'), anchorScale = q('[data-el="anchorScale"]');
    var trailSoft = q('[data-el="trailSoft"]'), trailCore = q('[data-el="trailCore"]');
    var pill = q('.ra-pill'), phLbl = q('.ra-pill .pl'), phNum = q('.ra-pill .pn'), phHint = q('.ra-pill .ph');
    var control = q('.ra-control'), count = q('.ra-count');
    var zoneEls = {};
    if (useZones) ['z1','z2','z3'].forEach(function(z){
      var grp = container.querySelector('.ra-zone[data-zone="' + z + '"]');
      zoneEls[z] = { grp: grp, glow: grp.querySelector('.ra-zone-glow'), text: grp.querySelector('text') };
    });

    /* estado */
    var raf = null, t0 = 0, running = false, lastPhase = null, lastN = null, cycles = 0;

    function paintLabels(){
      var t = str();
      if (control) control.textContent = running ? t.stop : t.start;
      if (useZones) ['z1','z2','z3'].forEach(function(z){ zoneEls[z].text.textContent = t.zones[z]; });
      if (showLegend){
        var la = q('.ra-lg-air-t'), lm = q('.ra-lg-mind-t');
        if (la) la.textContent = t.legend.air;
        if (lm) lm.textContent = t.legend.mind;
      }
      renderCount();
    }
    function renderCount(){
      if (!count) return;
      if (cycles <= 0){ count.innerHTML = ''; return; }
      var t = str();
      count.innerHTML = '<b>' + cycles + '</b>' + (cycles === 1 ? t.one : t.many);
    }

    function reset(){
      haloEl.style.transform = 'translate(-50%,-50%) scale(.86)'; haloEl.style.opacity = '.35';
      dotEl.style.opacity = 0; airEl.style.opacity = 0; anchorEl.style.opacity = 0;
      trailSoft.setAttribute('d', ''); trailCore.setAttribute('d', '');
      if (useZones) ['z1','z2','z3'].forEach(function(z){ zoneEls[z].glow.style.opacity = 0; zoneEls[z].grp.classList.remove('on'); });
      container.classList.remove('ra-running'); container.removeAttribute('data-phase'); lastPhase = null; lastN = null;
    }

    function render(s, ms){
      if (!s){ reset(); return; }
      container.classList.add('ra-running');
      container.setAttribute('data-phase', s.phase);
      var b = reduce ? 0.93 : s.breath;
      haloEl.style.transform = 'translate(-50%,-50%) scale(' + b.toFixed(4) + ')';
      haloEl.style.opacity = (0.45 + (s.breath - 0.86) / 0.14 * 0.4).toFixed(3);

      /* AZUL = aire. Entra por la NARIZ al inhalar y baja; al exhalar sube y sale por la nariz. */
      var airQ = (s.phase === 'inhale') ? (eng.Q_EXIT + (1 - eng.Q_EXIT) * s.q) : s.q;
      var p = pointAt(fig, airQ);
      airEl.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
      airEl.style.opacity = (s.phase === 'pause' ? 0 : (s.phase === 'anchor' ? s.dot * 0.55 : s.dot)).toFixed(3);

      /* AMARILLA = atención consciente. Parte del CEREBRO (más arriba que la nariz),
         sigue al aire hacia abajo (el aire es el cebo) y se funde en el vientre. */
      if (s.phase === 'inhale'){
        var pm = mindPoint(s.q);
        var fade = Math.max(0, Math.min(1, (1 - s.progress) / 0.2));
        dotEl.setAttribute('transform', 'translate(' + pm[0].toFixed(1) + ' ' + pm[1].toFixed(1) + ')');
        dotEl.style.opacity = (s.dot * fade).toFixed(3);
      } else { dotEl.style.opacity = 0; }

      /* estela: al inhalar sigue a la atención (cálida, desde el cerebro); al exhalar al aire (azul). */
      if (!reduce && (s.phase === 'inhale' || s.phase === 'exhale')){
        var back = eng.at(Math.max(0, ms - 520)), pts = [], i, u;
        if (s.phase === 'inhale'){
          var t0 = back.phase === 'inhale' ? back.q : 0;
          for (i = 0; i <= 8; i++){ u = t0 + (s.q - t0) * i / 8; pts.push(mindPoint(u)); }
        } else {
          var q0 = back.phase === 'exhale' ? back.q : 1;
          for (i = 0; i <= 8; i++){ u = q0 + (s.q - q0) * i / 8; pts.push(pointAt(fig, u)); }
        }
        var d = pathPts(pts);
        trailSoft.setAttribute('d', d); trailCore.setAttribute('d', d);
        trailSoft.style.opacity = (s.dot * 0.28).toFixed(3); trailCore.style.opacity = (s.dot * 0.9).toFixed(3);
        var ex = s.phase === 'exhale';
        trailSoft.style.stroke = ex ? '#7CC4E6' : '#FFE9B8';
        trailCore.style.stroke = ex ? '#EAF6FF' : '#FFF3D6';
      } else { trailSoft.setAttribute('d', ''); trailCore.setAttribute('d', ''); }

      /* anclaje: conciencia que QUEDA en el vientre */
      var ap = fig.route[fig.anchors.z3];
      var breathe = (s.phase === 'anchor' && !reduce) ? 1 + 0.05 * Math.sin(s.progress * Math.PI) : 1;
      anchorEl.setAttribute('transform', 'translate(' + ap[0] + ' ' + ap[1] + ')');
      anchorScale.setAttribute('transform', 'scale(' + breathe.toFixed(4) + ')');
      anchorEl.style.opacity = s.anchor.toFixed(3);

      /* realce de zona por cercanía */
      if (useZones){
        var best = null, bestV = 0;
        ['z1','z2','z3'].forEach(function(z){
          var v = Math.max(0, 1 - Math.abs(s.q - ZQ[z]) / 0.3) * s.dot;
          if (s.phase === 'anchor' && z === 'z3') v = 1;
          zoneEls[z].glow.style.opacity = (v * 0.85).toFixed(3);
          if (v > bestV){ bestV = v; best = z; }
        });
        var active = bestV > 0.45 ? best : null;
        ['z1','z2','z3'].forEach(function(z){ zoneEls[z].grp.classList.toggle('on', z === active); });
      }

      /* pastilla de fase */
      if (s.phase !== lastPhase || s.n !== lastN){
        var t = str();
        phLbl.textContent = t.phase[s.phase]; phNum.textContent = s.n; phHint.textContent = t.hint[s.phase];
        lastPhase = s.phase; lastN = s.n;
      }
      /* recuento de ciclos */
      if (s.cycle !== cycles){ cycles = s.cycle; renderCount(); if (typeof opts.onCycle === 'function') opts.onCycle(cycles); }
    }

    function loop(now){ if (!running) return; var ms = now - t0; render(eng.at(ms), ms); if (running) raf = requestAnimationFrame(loop); }

    var api = {
      start: function(){ if (running) return; running = true; cycles = 0; t0 = performance.now(); paintLabels(); raf = requestAnimationFrame(loop); },
      stop: function(){ if (raf) cancelAnimationFrame(raf); raf = null; running = false; render(null, 0); paintLabels(); },
      toggle: function(){ if (running) api.stop(); else api.start(); },
      isRunning: function(){ return running; },
      setLang: function(l){ lang = (l === 'en') ? 'en' : 'es'; lastPhase = null; paintLabels(); if (running){ /* refresca pastilla en el próximo frame */ } },
      destroy: function(){ api.stop(); container.innerHTML = ''; container.classList.remove('respiro-ais','ra-running','ra-dark'); container.removeAttribute('data-phase'); }
    };
    if (control) control.addEventListener('click', api.toggle);

    paintLabels(); render(null, 0);
    if (opts.autostart) api.start();
    return api;
  }

  global.RespiroAIS = { mount: mount, I18N: I18N, ORGANISM: ORGANISM, CHILD: CHILD, REALISTIC: REALISTIC, REALISTIC_CHILD: REALISTIC_CHILD };
})(typeof window !== 'undefined' ? window : this);
