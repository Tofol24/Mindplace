/* APRENS · Els pares també juguen — aplicació
   Sense servidor ni comptes. Tot es guarda en aquest dispositiu (localStorage)
   i només després que la persona ho hagi llegit i acceptat a la benvinguda.
   Res no surt del dispositiu llevat del que la persona decideix compartir
   (missatge de la pinya) o exportar. */
(function () {
  'use strict';

  /* ================= ESTAT ================= */
  var LS = 'aprens_epj_v1';
  var BASE = { v: 1, lang: null, rol: null, avis: false, actual: null, reg: [], setm: { actual: null, hist: [] }, llegides: {}, club: null };
  var MEM = null;
  function lsGet() { try { return localStorage.getItem(LS); } catch (e) { return MEM; } }
  function lsSet(v) { try { localStorage.setItem(LS, v); } catch (e) { MEM = v; } }
  function lsDel() { try { localStorage.removeItem(LS); } catch (e) {} MEM = null; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function carrega() {
    try {
      var d = JSON.parse(lsGet()); if (!d) return clone(BASE);
      var b = clone(BASE); Object.keys(d).forEach(function (k) { b[k] = d[k]; });
      if (!Array.isArray(b.reg)) b.reg = [];
      if (!b.setm || !Array.isArray(b.setm.hist)) b.setm = { actual: null, hist: [] };
      if (!b.llegides) b.llegides = {};
      return b;
    } catch (e) { return clone(BASE); }
  }
  var S = carrega();
  /* Només es persisteix quan la persona ha acceptat l'avís de privacitat. */
  function desa() { if (S.avis) lsSet(JSON.stringify(S)); }

  /* ================= IDIOMA ================= */
  function T() { return window.EPJ_TXT[S.lang] || window.EPJ_TXT.ca; }
  /* textos petits d'interfície que no són al fitxer de contingut */
  var XX = {
    ca: { pas: 'Pas', de: 'de', obrirPausa: 'Fer una pausa', practicaT: 'Pràctica breu amb la silueta', zonaNo: 'No ho sé', percepcioQ: 'Què notes?',
      fitxa: 'Fitxa', totes: 'Totes', partit: 'Partit', sessio: 'Entrenament', avui: 'Avui', setmana: 'set.', compartirTxt: 'Compartir',
      sense: 'Sense compromís', ok: 'D\'acord', manualDesat: 'Registre desat.', marcaUna: 'Marca almenys una resposta.', club: 'Club', qrAlt: 'Codi QR de l\'enllaç',
      copiaFallida: 'No s\'ha pogut copiar. Selecciona el text i copia\'l manualment.', llegeix: 'Llegir', tancarPausa: 'Tancar la pausa', silueta: 'Silueta',
      sessioPreparada: 'Preparació desada.', intencioPropia: 'Intenció pròpia', triaIntencio: 'O tria\'n una', continuarSense: 'Continuar sense triar', accions: 'Accions', anterior: 'Anterior', navPas: 'Pantalla anterior i següent' },
    es: { pas: 'Paso', de: 'de', obrirPausa: 'Hacer una pausa', practicaT: 'Práctica breve con la silueta', zonaNo: 'No lo sé', percepcioQ: '¿Qué notas?',
      fitxa: 'Ficha', totes: 'Todas', partit: 'Partido', sessio: 'Entrenamiento', avui: 'Hoy', setmana: 'sem.', compartirTxt: 'Compartir',
      sense: 'Sin compromiso', ok: 'De acuerdo', manualDesat: 'Registro guardado.', marcaUna: 'Marca al menos una respuesta.', club: 'Club', qrAlt: 'Código QR del enlace',
      copiaFallida: 'No se ha podido copiar. Selecciona el texto y cópialo manualmente.', llegeix: 'Leer', tancarPausa: 'Cerrar la pausa', silueta: 'Silueta',
      sessioPreparada: 'Preparación guardada.', intencioPropia: 'Intención propia', triaIntencio: 'O elige una', continuarSense: 'Continuar sin elegir', accions: 'Acciones', anterior: 'Anterior', navPas: 'Pantalla anterior y siguiente' }
  };
  function X() { return XX[S.lang] || XX.ca; }
  /* Textos guardats (compromís setmanal, intenció…) que provenen del contingut de l'app:
     es tornen a mostrar en l'idioma actual. Es construeix un mapa CA⇄ES recorrent els
     dos fitxers de contingut en paral·lel. Un text escrit per la persona no hi és i surt tal qual. */
  var MAPA = null;
  function mapa() {
    if (MAPA) return MAPA; MAPA = {};
    (function camina(a, b) {
      if (typeof a === 'string' && typeof b === 'string') { var o = { ca: a, es: b }; MAPA[a] = o; MAPA[b] = o; return; }
      if (a && b && typeof a === 'object') Object.keys(a).forEach(function (k) { camina(a[k], b[k]); });
    })(window.EPJ_TXT.ca, window.EPJ_TXT.es || {});
    return MAPA;
  }
  function tr(s) { if (typeof s !== 'string') return s; var m = mapa()[s]; return m ? (m[S.lang] || s) : s; }
  /* textos de club: cadena o { ca, es } */
  function loc(v) { if (!v) return ''; if (typeof v === 'string') return v; return v[S.lang] || v.ca || v.es || ''; }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : ''; }); }

  /* ================= UTILITATS ================= */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }
  function avui() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function nouId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function dataCurta(iso) { if (!iso) return ''; var p = iso.split('-'); return (+p[2]) + '/' + (+p[1]) + '/' + p[0].slice(2); }
  function diesDes(iso) { var a = new Date(iso + 'T00:00:00'), b = new Date(avui() + 'T00:00:00'); return Math.round((b - a) / 86400000); }
  function rol() { return S.rol === 'entrenador' ? 'entrenador' : 'familia'; }
  var toastT = null;
  function toast(t) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('on'); }, 2600); }
  function copia(text, ok) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var r = false; try { r = document.execCommand('copy'); } catch (e) {}
      ta.remove(); toast(r ? ok : X().copiaFallida);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(ok); }, fallback);
    else fallback();
  }
  function obreWhatsApp(text) {
    try { window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank', 'noopener'); } catch (e) {}
  }
  function comparteix(text, despres) {
    if (navigator.share) {
      navigator.share({ text: text }).then(function () { if (despres) despres(); }, function (err) {
        if (err && err.name === 'AbortError') return; obreWhatsApp(text); if (despres) despres();
      });
    } else { obreWhatsApp(text); if (despres) despres(); }
  }
  function descarrega(nom, contingut, tipus) {
    var blob = new Blob([contingut], { type: tipus });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nom;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* resolució d'identificadors → text en l'idioma actual */
  function trobaPer(llista, id) { for (var i = 0; i < llista.length; i++) if (llista[i].id === id) return llista[i]; return null; }
  function compText(id, r) { var c = trobaPer(T().compromisos[r || rol()], id) || trobaPer(T().compromisos.familia, id) || trobaPer(T().compromisos.entrenador, id); return c ? c.t : id; }
  function situacioText(id) {
    if (!id) return '';
    var e = trobaPer(T().escenaris, id); if (e) return e.t;
    var d = trobaPer(T().disparadors.familia, id) || trobaPer(T().disparadors.entrenador, id); if (d) return d.t;
    return id;
  }
  function zonaText(id) { var z = trobaPer(T().zones, id); return z ? z.t : id; }
  function conductaText(id) { var c = trobaPer(T().pinya.conductes, id); return c ? c.t : (id ? tr(compText(id)) : ''); }
  function compromisosActuals() { return S.actual && S.actual.compromisos ? S.actual.compromisos : []; }
  function compromisosText() { return compromisosActuals().map(function (id) { return compText(id, S.actual.rol); }); }

  function registra(r) {
    r.id = nouId(); r.ts = Date.now(); r.data = r.data || avui(); r.rol = r.rol || rol();
    S.reg.push(r); desa(); return r;
  }

  /* ================= CLUB (personalització) ================= */
  var COLOR_RE = /^#[0-9a-fA-F]{6}$/;
  function netejaClub(c) {
    if (!c || typeof c !== 'object') return null;
    var o = {};
    if (typeof c.nom === 'string') o.nom = c.nom.replace(/[<>]/g, '').trim().slice(0, 60);
    if (typeof c.color === 'string' && COLOR_RE.test(c.color)) o.color = c.color;
    if (c.idioma === 'ca' || c.idioma === 'es') o.idioma = c.idioma;
    function txt(v, n) { if (typeof v === 'string') return v.slice(0, n); if (v && typeof v === 'object') { var r = {}; ['ca', 'es'].forEach(function (k) { if (typeof v[k] === 'string') r[k] = v[k].slice(0, n); }); return (r.ca || r.es) ? r : null; } return null; }
    if (txt(c.missatge, 600)) o.missatge = txt(c.missatge, 600);
    if (typeof c.escut === 'string' && /^clubs\/[a-z0-9-]+\.(png|svg|webp|jpg)$/.test(c.escut)) o.escut = c.escut;
    if (Array.isArray(c.codi)) o.codi = c.codi.map(function (x) { return txt(x, 300); }).filter(Boolean).slice(0, 20);
    if (c.proteccio && typeof c.proteccio === 'object') o.proteccio = { text: txt(c.proteccio.text, 600) || '', contacte: txt(c.proteccio.contacte, 200) || '' };
    if (typeof c.slug === 'string' && /^[a-z0-9-]{1,40}$/.test(c.slug)) o.slug = c.slug;
    return o.nom ? o : null;
  }
  function aplicaClub() {
    var c = S.club;
    document.documentElement.style.setProperty('--club', c && c.color ? c.color : '#2F5E9E');
    var ts = $('#subtitol'); if (ts) ts.textContent = c && c.nom ? c.nom + ' · APRENS' : 'APRENS · ' + (S.lang === 'es' ? 'Deporte base' : 'Esport de base');
    var lloc = $('#escutLloc');
    if (lloc) {
      lloc.innerHTML = '';
      if (c && c.escut) {
        var e = document.createElement('img'); e.className = 'escut'; e.alt = (T().club.escut || '') + ' ' + c.nom;
        e.onerror = function () { e.remove(); }; e.src = c.escut; lloc.appendChild(e);
      }
    }
  }
  function enllacClub() {
    var u = location.origin + location.pathname, c = S.club, q = [];
    if (c && c.slug) q.push('club=' + encodeURIComponent(c.slug));
    else if (c && c.nom) {
      q.push('nom=' + encodeURIComponent(c.nom));
      if (c.color) q.push('color=' + encodeURIComponent(c.color.slice(1)));
      if (c.idioma) q.push('lang=' + c.idioma);
      if (c.missatge) q.push('msg=' + encodeURIComponent(loc(c.missatge).slice(0, 200)));
    }
    return u + (q.length ? '?' + q.join('&') : '');
  }
  function llegeixURL(fet) {
    var p; try { p = new URLSearchParams(location.search); } catch (e) { fet(); return; }
    var slug = p.get('club'), nom = p.get('nom'), lang = p.get('lang');
    if ((lang === 'ca' || lang === 'es') && !S.lang) S.lang = lang;
    if (slug && /^[a-z0-9-]{1,40}$/.test(slug)) {
      fetch('clubs/' + slug + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (j) { j.slug = slug; var c = netejaClub(j); if (c) { S.club = c; if (!S.lang && c.idioma) S.lang = c.idioma; desa(); } }
        fet();
      }).catch(function () { fet(); });
      return;
    }
    if (nom) {
      var col = p.get('color'); var c = netejaClub({ nom: nom, color: col ? '#' + col : null, idioma: lang, missatge: p.get('msg') || '' });
      if (c) { S.club = c; if (!S.lang && c.idioma) S.lang = c.idioma; desa(); }
    }
    fet();
  }

  /* ================= ICONES ================= */
  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var IC = {
    inici: ic('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
    abans: ic('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>'),
    durant: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7l3.2 2.3-1.2 3.8h-4l-1.2-3.8z"/>'),
    despres: ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.2-4.6A8 8 0 1 1 21 12z"/>'),
    apren: ic('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
    registre: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    silueta: ic('<circle cx="12" cy="5" r="2.6"/><path d="M12 8v8M8 21l4-5 4 5M6.5 11.5h11"/>'),
    pinya: ic('<path d="M12 12l-6-6M12 12l6-6M12 12l-7 4M12 12l7 4M12 12v8"/><circle cx="12" cy="12" r="2"/>'),
    entrenador: ic('<path d="M4 4h16v12H4z"/><path d="M8 20h8M12 16v4M8 9l3 3 5-5"/>'),
    setmanal: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    club: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
    piramide: ic('<path d="M12 3l9 17H3z"/><path d="M7.5 12h9M5.5 16h13"/>'),
    priv: ic('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')
  };

  /* ================= NAVEGACIÓ ================= */
  var TABS = ['inici', 'abans', 'durant', 'despres', 'apren', 'registre'];
  /* pantalla «mare» de cada pantalla secundària (botó Enrere de la capçalera) */
  var PARE = { piramide: 'apren', pinya: 'abans', escenari: 'durant', llico: 'apren', entrenadors: 'apren', setmanal: 'inici', privacitat: 'registre', club: 'inici', silueta: 'inici' };
  /* Navegació anterior / següent al peu de cada pantalla */
  function flux(v, arg) {
    var t = T(), u = t.ui, r = rol();
    function pas(vv, a, txt) { return { v: vv, arg: a || null, t: txt || u[vv] }; }
    function veins(llista, id, mare) {
      var i = -1; llista.forEach(function (x, k) { if (x.id === id) i = k; });
      return { prev: i > 0 ? pas(mare === 'durant' ? 'escenari' : 'llico', llista[i - 1].id, X().anterior) : pas(mare),
               next: i >= 0 && i < llista.length - 1 ? pas(mare === 'durant' ? 'escenari' : 'llico', llista[i + 1].id, u.seguent) : pas(mare) };
    }
    switch (v) {
      case 'inici': return { next: pas('abans') };
      case 'abans': return { prev: pas('inici'), next: pas('durant') };
      case 'pinya': return { prev: pas('abans'), next: pas('durant') };
      case 'durant': return { prev: pas('abans'), next: pas('despres') };
      case 'despres': return { prev: pas('durant'), next: pas('registre') };
      case 'registre': return { prev: pas('despres'), next: pas('inici') };
      case 'apren': return { prev: pas('inici'), next: pas('registre') };
      case 'escenari': return veins(t.escenaris.filter(function (e) { return e.rols.indexOf(r) >= 0; }), arg, 'durant');
      case 'llico': return veins(t.llicons, arg, 'apren');
      default: return PARE[v] ? { prev: pas(PARE[v]) } : null;
    }
  }
  function fluxHTML(v, arg) {
    var f = flux(v, arg); if (!f) return '';
    function b(x, dir) { return '<button type="button" class="btn ' + (dir === 'prev' ? 'ghost' : '') + '" data-go="' + x.v + '"' + (x.arg ? ' data-arg="' + esc(x.arg) + '"' : '') + '>' + (dir === 'prev' ? '← ' : '') + esc(x.t) + (dir === 'next' ? ' →' : '') + '</button>'; }
    return '<nav class="flux" aria-label="' + esc(X().navPas) + '">' + (f.prev ? b(f.prev, 'prev') : '<span></span>') + (f.next ? b(f.next, 'next') : '<span></span>') + '</nav>';
  }
  var vistaActual = null, silActual = null;
  function ruta() { var h = (location.hash || '').replace(/^#\/?/, ''); var p = h.split('/'); return { v: p[0] || 'inici', arg: p[1] ? decodeURIComponent(p[1]) : null }; }
  function go(v, arg) { var h = '#/' + v + (arg ? '/' + encodeURIComponent(arg) : ''); if (location.hash === h) pinta(); else location.hash = h; }
  function pintaNav(v) {
    var n = $('#nav');
    if (!S.avis || !S.rol) { n.hidden = true; document.body.classList.add('sense-nav'); return; }
    n.hidden = false; document.body.classList.remove('sense-nav');
    var act = TABS.indexOf(v) >= 0 ? v : (PARE[v] || 'inici');
    var t = T().ui;
    n.innerHTML = '<div class="in">' + TABS.map(function (id) {
      return '<button type="button" data-go="' + id + '"' + (id === act ? ' aria-current="page"' : '') + '>' + IC[id] + '<span>' + esc(t[id]) + '</span></button>';
    }).join('') + '</div>';
  }
  function pintaCap() {
    var l = $('#lang'); if (!l) return;
    l.innerHTML = ['ca', 'es'].map(function (k) { return '<button type="button" data-lang="' + k + '" aria-pressed="' + (S.lang === k) + '" lang="' + k + '">' + k.toUpperCase() + '</button>'; }).join('');
    l.setAttribute('aria-label', T().ui.idioma);
    $('#ttApp').textContent = T().ui.appName;
    document.documentElement.lang = S.lang || 'ca';
    document.title = T().ui.appName + ' · APRENS';
    $('#salta').textContent = S.lang === 'es' ? 'Ir al contenido' : 'Anar al contingut';
    aplicaClub();
  }
  function pinta() {
    if (silActual) { try { silActual.destroy(); } catch (e) {} silActual = null; }
    if (!S.lang) S.lang = 'ca';
    var r = ruta(), v = r.v;
    if (!S.avis || !S.rol) v = 'benvinguda';
    if (!VISTES[v]) v = 'inici';
    vistaActual = v;
    pintaCap(); pintaNav(v);
    var m = $('#app');
    var html = VISTES[v](r.arg), fx = v === 'benvinguda' ? '' : fluxHTML(v, r.arg);
    if (fx) { var k = html.lastIndexOf('<footer>'); html = k >= 0 ? html.slice(0, k) + fx + html.slice(k) : html + fx; }
    m.innerHTML = '<div class="vista">' + html + '</div>';
    var eb = $('#enrereCap'), pare = v !== 'benvinguda' && PARE[v];
    if (eb) { eb.hidden = !pare; if (pare) { eb.setAttribute('data-go', pare); eb.textContent = '← ' + T().ui.enrere; eb.setAttribute('aria-label', T().ui.enrere + ': ' + T().ui[pare]); } }
    document.body.classList.toggle('amb-enrere', !!pare);
    if (DESPRES[v]) DESPRES[v](r.arg);
    window.scrollTo(0, 0);
    var h1 = $('h1', m); if (h1) { h1.setAttribute('tabindex', '-1'); try { h1.focus({ preventScroll: true }); } catch (e) {} }
  }
  window.addEventListener('hashchange', pinta);

  function peu() {
    var t = T().ui;
    return '<footer><div>' + esc(t.peu1) + '</div><div><b>' + esc(t.peu2) + '</b></div><div>' + esc(t.peu3) + '</div><div>' + esc(t.peuPriv) + '</div>' +
      '<div class="links"><button type="button" class="link" data-go="privacitat">' + esc(t.privacitat) + '</button><button type="button" class="link" data-go="club">' + esc(t.perClubs) + '</button><button type="button" class="link" data-canvirol="1">' + esc(t.canviaRol) + '</button></div></footer>';
  }
  function seguretat() {
    var t = T().ui, c = S.club;
    return '<div class="seguretat" role="note"><div><b>' + esc(t.seguretatTitol) + '</b>' + esc(t.seguretatText) +
      (c && c.proteccio && c.proteccio.contacte ? '<br>' + esc(t.seguretatClub) + ' ' + esc(loc(c.proteccio.contacte)) : '') + '</div></div>';
  }
  function avisNoms() { return '<div class="avis-noms">' + esc(T().ui.noNoms) + '</div>'; }
  function opt(attr, val, txt, on, rolAria) {
    return '<button type="button" class="opt" ' + attr + '="' + esc(val) + '" ' + (rolAria === 'checkbox' ? 'role="checkbox" aria-checked="' + !!on + '"' : 'aria-pressed="' + !!on + '"') + '><span class="box" aria-hidden="true"></span><span>' + esc(txt) + '</span></button>';
  }
  function seg(nom, opcions, val, etiqueta) {
    return '<div class="seg" role="group" aria-label="' + esc(etiqueta) + '">' + opcions.map(function (o) { return '<button type="button" data-seg="' + nom + '" data-v="' + esc(o.id) + '" aria-pressed="' + (val === o.id) + '">' + esc(o.t) + '</button>'; }).join('') + '</div>';
  }
  function escala(nom, val, etiqueta) {
    var h = '<div class="escala" role="group" aria-label="' + esc(etiqueta) + '">';
    for (var i = 0; i <= 10; i++) h += '<button type="button" data-escala="' + nom + '" data-v="' + i + '" aria-pressed="' + (val === i) + '">' + i + '</button>';
    var lo = S.lang === 'es' ? ['Tranquilo', 'Muy activado'] : ['Tranquil', 'Molt activat'];
    return h + '</div><div class="escala-ext" aria-hidden="true"><span>' + lo[0] + '</span><span>' + lo[1] + '</span></div>';
  }
  var VISTES = {}, DESPRES = {};

  /* ================= BENVINGUDA ================= */
  var benvPas = 0;
  VISTES.benvinguda = function () {
    var b = T().benvinguda, t = T();
    var h = '<span class="kick">APRENS</span><h1>' + esc(b.titol) + '</h1><p class="lead">' + esc(t.ui.subtitol) + '</p>';
    if (!S.avis) {
      h += '<div class="card"><h2>' + esc(b.triaIdioma) + '</h2><div class="seg" role="group" aria-label="' + esc(t.ui.idioma) + '">' +
        '<button type="button" data-lang="ca" aria-pressed="' + (S.lang === 'ca') + '" lang="ca">Català</button><button type="button" data-lang="es" aria-pressed="' + (S.lang === 'es') + '" lang="es">Castellano</button></div></div>';
      h += '<p>' + esc(b.text) + '</p><div class="cita">' + esc(b.principi) + '</div>';
      h += '<div class="card suau"><h2>' + esc(b.privTitol) + '</h2><ul class="punts">' + b.privText.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="btnrow"><button type="button" class="btn full blau" id="acceptaAvis">' + esc(b.privAccepta) + '</button></div></div>';
      return h;
    }
    h += '<h2 style="margin-top:18px">' + esc(b.triaRol) + '</h2><div class="rols">' +
      ['familia', 'entrenador'].map(function (k) { return '<button type="button" class="rol" data-rol="' + k + '" aria-pressed="' + (S.rol === k) + '"><b>' + esc(t.rols[k].t) + '</b><span>' + esc(t.rols[k].d) + '</span></button>'; }).join('') + '</div>';
    return h;
  };

  /* ================= INICI ================= */
  VISTES.inici = function () {
    var t = T(), i = t.inici, r = rol(), c = S.club;
    var h = '<span class="kick">' + esc(c && c.nom ? c.nom : 'APRENS') + '</span><h1>' + esc(t.ui.appName) + '</h1><p class="lead">' + esc(t.ui.subtitol) + '</p>';
    if (c && c.missatge) h += '<div class="card blau"><h2>' + esc(t.club.missatge) + '</h2><p style="margin:0;white-space:pre-line">' + esc(loc(c.missatge)) + '</p></div>';
    h += '<div class="cita">' + esc(t.benvinguda.principi) + '</div>';
    h += '<p class="muted">' + esc(i[r]) + '</p>';
    if (S.actual) {
      h += '<div class="card verd"><h2>' + esc(t.ui.partitEnCurs) + '</h2>' + compromisosText().map(function (x) { return '<p style="margin:4px 0">«' + esc(x) + '»</p>'; }).join('') +
        '<div class="btnrow"><button type="button" class="btn sm" data-go="durant">' + esc(t.ui.continuarPartit) + '</button><button type="button" class="btn sm ghost" id="descartaPartit">' + esc(t.ui.descartarPartit) + '</button></div></div>';
    }
    h += '<div class="moments">' +
      '<button type="button" class="moment" data-go="abans"><span class="mn">1</span><b>' + esc(t.ui.abans) + '</b><span class="d">' + esc(i.abansD) + '</span></button>' +
      '<button type="button" class="moment" data-go="durant"><span class="mn">2</span><b>' + esc(t.ui.durant) + '</b><span class="d">' + esc(i.durantD) + '</span></button>' +
      '<button type="button" class="moment" data-go="despres"><span class="mn">3</span><b>' + esc(t.ui.despres) + '</b><span class="d">' + esc(i.despresD) + '</span></button></div>';
    h += '<button type="button" class="pausa-btn" data-pausa="1">' + esc(t.ui.pausaBtn) + '<small>' + esc(t.ui.pausaBtnSub) + '</small></button>';
    h += setmanalCard(true);
    h += acces('pinya', IC.pinya, t.pinya.titol, t.pinya.subtitol);
    h += acces('silueta', IC.silueta, i.siluetaT, i.siluetaD);
    h += acces('apren', IC.apren, i.aprenT, i.aprenD);
    if (r === 'entrenador') h += acces('entrenadors', IC.entrenador, i.entrenadorsT, i.entrenadorsD);
    h += acces('setmanal', IC.setmanal, i.setmanalT, i.setmanalD);
    h += acces('club', IC.club, t.club.titol, t.club.intro.split('. ')[0] + '.');
    return h + peu();
  };
  function acces(v, icona, tit, d) {
    return '<button type="button" class="acces" data-go="' + v + '"><span class="ic">' + icona + '</span><span><b>' + esc(tit) + '</b><span class="d">' + esc(d) + '</span></span><span class="fl" aria-hidden="true">›</span></button>';
  }

  /* ================= ABANS ================= */
  var ab = null; /* esborrany del formulari d'abans */
  function nouAbans() {
    var a = S.actual;
    return a ? { emocions: a.emocions.slice(), disparadors: a.disparadors.slice(), compromisos: a.compromisos.slice(), intencio: a.intencio || '', context: a.context || 'partit', ais: a.ais || { groc: [], blau: [], percepcio: null } }
      : { emocions: [], disparadors: [], compromisos: [], intencio: '', context: 'partit', ais: { groc: [], blau: [], percepcio: null } };
  }
  VISTES.abans = function () {
    var t = T(), a = t.abans, r = rol(); ab = nouAbans();
    var h = '<span class="kick">' + esc(t.ui.abans) + '</span><h1>' + esc(a.titol) + '</h1><span class="durada">' + esc(a.durada) + '</span>';
    if (r === 'entrenador') h += '<div class="card"><h2>' + esc(a.context) + '</h2>' + seg('context', [{ id: 'partit', t: a.contextPartit }, { id: 'sessio', t: a.contextSessio }], ab.context, a.context) + '</div>';
    h += '<div class="card"><div class="q"><span class="num">1</span><div><h2>' + esc(a.q1) + '</h2><p class="muted">' + esc(a.q1d) + '</p></div></div><div class="chips" role="group" aria-label="' + esc(a.q1) + '">' +
      t.emocions.map(function (e) { return '<button type="button" class="chip" data-emocio="' + e.id + '" aria-pressed="' + (ab.emocions.indexOf(e.id) >= 0) + '">' + esc(e.t) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="card"><div class="q"><span class="num">2</span><div><h2>' + esc(a.q2) + '</h2><p class="muted">' + esc(a.q2d) + '</p></div></div><div role="group" aria-label="' + esc(a.q2) + '">' +
      t.disparadors[r].map(function (d) { return opt('data-disp', d.id, d.t, ab.disparadors.indexOf(d.id) >= 0, 'checkbox'); }).join('') + '</div></div>';
    h += '<div class="card"><div class="q"><span class="num">3</span><div><h2>' + esc(X().practicaT) + '</h2><p class="muted">' + esc(t.silueta.intro) + '</p></div></div><div id="silAbans"></div></div>';
    h += '<div class="card"><div class="q"><span class="num">4</span><div><h2>' + esc(a.q3) + '</h2><p class="muted">' + esc(a.q3d) + '</p></div></div><div role="group" aria-label="' + esc(a.q3) + '" id="compGrup">' +
      t.compromisos[r].map(function (c) { return opt('data-comp', c.id, c.t, ab.compromisos.indexOf(c.id) >= 0, 'checkbox'); }).join('') + '</div><p class="muted" id="maxDos" aria-live="polite"></p>';
    if (r === 'entrenador') {
      h += '<label class="lb" for="intencio">' + esc(a.intencio) + '</label><p class="muted">' + esc(a.intencioD) + '</p><div class="chips">' +
        t.intencionsEntrenador.map(function (x) { return '<button type="button" class="chip" data-intencio="' + esc(x) + '" aria-pressed="' + (tr(ab.intencio) === x) + '">' + esc(x) + '</button>'; }).join('') +
        '</div><input type="text" id="intencio" maxlength="140" placeholder="' + esc(a.intencioPh) + '" value="' + esc(tr(ab.intencio)) + '" autocomplete="off">' + avisNoms();
    }
    h += '</div>';
    h += '<div class="btnrow"><button type="button" class="btn full blau" id="desaAbans">' + esc(t.ui.continuar) + ' · ' + esc(t.pinya.titol) + '</button></div>';
    return h + peu();
  };
  DESPRES.abans = function () { muntaPractica($('#silAbans'), ab.ais, true); };

  /* pràctica AIS compacta i reutilitzable (abans i pràctica lliure) */
  function muntaPractica(box, desti, ambPercepcio) {
    if (!box) return;
    var t = T(), s = t.silueta, mode = 'reconec', idx = 0;
    var h = '<div class="estats" role="group" aria-label="' + esc(s.titol) + '">' + s.estats.map(function (e) { return '<button type="button" data-estat="' + e.id + '" aria-pressed="' + (e.id === mode) + '"><b>' + e.n + '</b>' + esc(e.t) + '</button>'; }).join('') + '</div>' +
      '<p class="muted" id="estatD">' + esc(s.estats[0].d) + '</p><div id="silFig"></div><div class="missatge-sil" id="silMsg" aria-live="polite"></div>' +
      '<div id="silElegesc" hidden></div>' +
      '<h2 class="h3">' + esc(t.ui.seguent) + '…</h2><ol class="consignes" id="consignes">' + s.consignes.map(function (c, i) { return '<li' + (i === 0 ? ' class="on"' : '') + '>' + esc(c) + '</li>'; }).join('') + '</ol>' +
      '<div class="btnrow"><button type="button" class="btn sm ghost" id="consSeg">' + esc(t.ui.seguent) + '</button><button type="button" class="btn sm ghost" id="respTog" aria-pressed="false">' + esc(s.respiracio) + ': ' + esc(s.respiracioOff) + '</button></div>' +
      '<div class="btnrow"><button type="button" class="link" id="externa">' + esc(s.externaBtn) + '</button></div><div id="extBox" hidden></div>';
    if (ambPercepcio) h += '<h2 class="h3">' + esc(s.percepcio) + '</h2>' + seg('percepcio', s.percepcions, desti.percepcio, s.percepcio) + '<p class="muted" id="percMsg" aria-live="polite">' + esc(t.ui.totesValides) + '</p>';
    h += '<p class="muted" style="margin-top:10px">' + esc(t.ui.colors) + '</p>';
    box.innerHTML = h;
    var sil = window.SiluetaAIS.mount($('#silFig', box), {
      txt: t, mode: mode, groc: desti.groc, blau: desti.blau,
      onChange: function (st, z, on) {
        desti.groc = st.groc; desti.blau = st.blau;
        $('#silMsg', box).textContent = on ? (st.mode === 'acompany' ? s.blauMsg : s.grocMsg) : '';
      }
    });
    silActual = sil;
    box.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !box.contains(b)) return;
      if (b.hasAttribute('data-estat')) {
        mode = b.getAttribute('data-estat'); sil.setMode(mode);
        if (mode === 'acompany') {
          /* la respiració (blava) acompanya on és l'atenció (groga) */
          if (!desti.blau.length) { (desti.groc.length ? desti.groc : ['panxa']).forEach(function (z) { sil.focusBlau(z); }); desti.blau = sil.get().blau; }
          var rt = $('#respTog', box); if (rt && rt.getAttribute('aria-pressed') !== 'true') rt.click();
        }
        $$('[data-estat]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var e = trobaPer(s.estats, mode); $('#estatD', box).textContent = e.d;
        var el = $('#silElegesc', box);
        if (mode === 'elegesc') {
          var c = (ab && ab.compromisos.length ? ab.compromisos : compromisosActuals()).map(function (id) { return compText(id); });
          el.innerHTML = '<p>' + esc(s.elegescMsg) + '</p>' + (c.length ? '<div class="compromis-box"><span class="et">' + esc(T().pinya.teuCompromis) + '</span>' + c.map(esc).join('<br>') + '</div>' : '<p class="muted">' + esc(s.elegescPregunta) + '</p>') +
            (desti.groc.length ? '<p class="muted">' + esc(s.groguesQueden) + '</p>' : '');
          el.hidden = false;
        } else el.hidden = true;
        $('#silMsg', box).textContent = '';
      } else if (b.id === 'consSeg') {
        idx = (idx + 1) % s.consignes.length;
        $$('#consignes li', box).forEach(function (li, i) { li.classList.toggle('on', i === idx); });
        if (idx === 1 && mode === 'reconec') { b.blur(); }
      } else if (b.id === 'respTog') {
        var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
        b.textContent = s.respiracio + ': ' + (on ? s.respiracioOn : s.respiracioOff); sil.setRespiracio(on);
      } else if (b.id === 'externa') {
        var eb = $('#extBox', box); eb.hidden = !eb.hidden;
        eb.innerHTML = '<div class="card suau"><h3 style="margin-top:0">' + esc(s.externaT) + '</h3><ol class="consignes">' + s.externa.map(function (x) { return '<li class="on">' + esc(x) + '</li>'; }).join('') + '</ol></div>';
        if (!eb.hidden) { sil.focusGroc('peus'); desti.groc = sil.get().groc; } /* l'atenció (groga) als peus */
      } else if (b.getAttribute('data-seg') === 'percepcio') {
        desti.percepcio = b.getAttribute('data-v');
        $$('[data-seg="percepcio"]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $('#percMsg', box).textContent = trobaPer(s.percepcions, desti.percepcio).m;
      }
    });
  }

  /* ================= LA PINYA DE LES FAMÍLIES ================= */
  function svgPinya() {
    /* mans adultes estilitzades, apuntant cap al centre (150,150) */
    var pells = ['#E8C3A6', '#C99A78', '#8D5F45', '#F1D2BC', '#B07C5B', '#6E4632', '#DDB18F'];
    var manigues = ['#D9D3C7', '#9FB3C8', '#C9B79C', '#A7B8A0', '#CDBFC9', '#B9C2C9', '#D3C4AE'];
    var angles = [52, 97, 142, 180, 218, 263, 308];
    function ma(id, angle, pell, maniga, extra) {
      return '<g class="ma ' + (extra || '') + '" id="' + id + '" style="--a:' + angle + 'deg">' +
        '<rect x="133" y="196" width="34" height="120" rx="12" fill="' + maniga + '" stroke="rgba(31,42,55,.18)"/>' +
        /* mà plana, palmell avall i dits junts (el gest real de la pinya) */
        '<path d="M134 200 L134 163 Q134 140 150 140 Q166 140 166 163 L166 200 Z" fill="' + pell + '" stroke="rgba(31,42,55,.22)" stroke-width="1"/>' +
        '<path d="M135 194 Q125 190 125 180 Q126 172 134 175" fill="' + pell + '" stroke="rgba(31,42,55,.22)" stroke-width="1"/>' +
        '<path d="M139 170 Q150 166.5 161 170" fill="none" stroke="rgba(31,42,55,.14)" stroke-width="1" stroke-linecap="round"/></g>';
    }
    var h = '<svg class="pinya-svg" viewBox="0 0 300 300" role="img" aria-labelledby="pinyaSvgT"><title id="pinyaSvgT">' + esc(T().pinya.decoratiu) + '</title>' +
      '<circle class="pinya-anell" cx="150" cy="150" r="34" fill="none" stroke="var(--club)" stroke-width="2" stroke-dasharray="3 5"/>';
    angles.forEach(function (a, i) { h += ma('ma' + i, a, pells[i], manigues[i]); });
    h += ma('maMeva', 0, '#E2B999', '#2F5E9E', 'meva');
    return h + '</svg>';
  }
  VISTES.pinya = function () {
    var t = T(), p = t.pinya, r = rol(), a = S.actual;
    var comp = compromisosText();
    var h = '<span class="kick">' + esc(t.ui.abans) + '</span><h1>' + esc(p.titol) + '</h1><p class="lead">' + esc(p.subtitol) + '</p>';
    h += '<div class="pinya-escena" id="pinyaEscena">' + svgPinya() + '<div class="crit" id="crit" aria-live="polite"></div></div>';
    h += '<p class="muted" style="text-align:center">' + esc(p.decoratiu) + '</p>';
    if (!comp.length) {
      h += '<div class="card suau"><p>' + esc(p.senseCompromis) + '</p><div class="btnrow"><button type="button" class="btn" data-go="abans">' + esc(t.ui.abans) + '</button></div></div>';
      return h + limitsPinya() + peu();
    }
    h += '<div class="compromis-box"><span class="et">' + esc(p.teuCompromis) + '</span>' + comp.map(esc).join('<br>') + '</div>';
    var posada = a && a.pinya;
    h += '<div id="pinyaPregunta"' + (posada || (a && a.pinyaNo) ? ' hidden' : '') + '><p class="cita">' + esc(p.invitacio) + '</p>' +
      '<div class="btnrow"><button type="button" class="btn full blau" id="posMa">' + esc(p.si) + '</button><button type="button" class="btn full ghost" id="noMa">' + esc(p.no) + '</button></div></div>';
    h += '<div id="pinyaNoBox"' + (a && a.pinyaNo && !posada ? '' : ' hidden') + '><div class="card suau"><p style="margin:0">' + esc(p.noOk) + '</p></div>' +
      '<div class="btnrow"><button type="button" class="btn full" data-go="durant">' + esc(p.anarDurant) + '</button><button type="button" class="btn full ghost" id="reobrePinya">' + esc(p.si) + '</button></div></div>';
    h += '<div id="pinyaFet"' + (posada ? '' : ' hidden') + '>' +
      '<p class="lead" style="text-align:center">' + esc(p.unida) + '</p>' +
      '<div class="card"><p class="cita" style="margin-top:0">' + esc(p.fraseGrup[r]) + '</p>' +
      '<label class="lb" for="msgPinya">' + esc(t.ui.compartirTxt || X().compartirTxt) + '</label><p class="muted">' + esc(p.editar) + '</p>' +
      '<textarea id="msgPinya" rows="9">' + esc(missatgePinya()) + '</textarea>' + avisNoms() +
      '<p class="muted">' + esc(p.queS) + '</p>' +
      '<div class="btnrow"><button type="button" class="btn full verd" id="compartirMa">' + esc(p.compartir) + '</button><button type="button" class="btn full ghost" id="copiaMa">' + esc(p.copiar) + '</button></div>' +
      '<p class="muted" style="margin-top:10px">' + esc(p.compartirD) + '</p><p class="muted">' + esc(p.recomanacio) + '</p><p class="muted">' + esc(p.noCompteReal) + '</p></div>' +
      '<div class="btnrow"><button type="button" class="btn full" data-go="durant">' + esc(p.anarDurant) + '</button><button type="button" class="btn full ghost" id="repeteix">' + esc(p.tornar) + '</button></div>' +
      '</div>';
    h += enquestaHTML(r === 'entrenador');
    if (r === 'entrenador') h += invitacioHTML();
    return h + limitsPinya() + peu();
  };
  function missatgePinya() {
    var p = T().pinya, comp = compromisosText().join('\n');
    return fmt(rol() === 'entrenador' ? p.plantillaEntrenador : p.plantilla, { compromis: comp }).replace(/\\n/g, '\n');
  }
  function limitsPinya() {
    var p = T().pinya;
    return '<details><summary>' + esc(p.limitsT) + '</summary><div class="cos"><ul class="punts">' + p.limits.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><p class="cita">' + esc(p.final) + '</p></div></details>';
  }
  function enquestaHTML(obert) {
    var p = T().pinya;
    var h = '<details' + (obert ? ' open' : '') + ' id="enquesta"><summary>' + esc(p.enquestaT) + '</summary><div class="cos"><p class="muted">' + esc(p.enquestaD) + '</p>' +
      '<div class="previa">' + esc(p.enquestaPregunta) + '</div><button type="button" class="btn sm ghost" data-copia="q">' + esc(p.copiaPregunta) + '</button>' +
      '<ol class="consignes">' + p.enquestaOpcions.map(function (o, i) { return '<li class="on" style="align-items:center"><span style="flex:1">' + esc(o) + '</span><button type="button" class="btn sm ghost" data-copia="' + i + '" aria-label="' + esc(p.copiaOpcio + ': ' + o) + '">' + esc(p.copiaOpcio) + '</button></li>'; }).join('') + '</ol>' +
      '<div class="btnrow"><button type="button" class="btn sm ghost" data-copia="tot">' + esc(p.copiaTot) + '</button><button type="button" class="btn sm ghost" id="obreWa">' + esc(p.obrirWa) + '</button></div>' +
      '<h2 class="h3">' + esc(S.lang === 'es' ? 'Pasos' : 'Passes') + '</h2><ol class="consignes">' + p.passos.map(function (x) { return '<li class="on">' + esc(x) + '</li>'; }).join('') + '</ol>' +
      '<p class="muted">' + esc(p.enquestaNota) + '</p></div></details>';
    return h;
  }
  function invitacioText() { return fmt(T().pinya.invitacioText, { enllac: enllacClub() }).replace(/\\n/g, '\n'); }
  function invitacioHTML() {
    var p = T().pinya;
    return '<details><summary>' + esc(p.invitacioT) + '</summary><div class="cos"><p class="muted">' + esc(p.invitacioD) + '</p>' +
      '<label class="lb sr" for="msgInv">' + esc(p.invitacioT) + '</label><textarea id="msgInv" rows="10">' + esc(invitacioText()) + '</textarea>' +
      '<div class="btnrow"><button type="button" class="btn sm verd" id="enviaInv">' + esc(p.enviaInvitacio) + '</button><button type="button" class="btn sm ghost" id="copiaInv">' + esc(p.copiaInvitacio) + '</button></div></div></details>';
  }
  var reduirMov = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animaPinya(final) {
    var esc_ = $('#pinyaEscena'); if (!esc_) return;
    var crit = $('#crit');
    esc_.classList.remove('unida', 'entra');
    crit.textContent = '';
    if (final) { esc_.classList.add('entra', 'unida'); crit.textContent = T().pinya.crit; return; }
    void esc_.offsetWidth;
    if (reduirMov) { esc_.classList.add('entra', 'unida'); crit.textContent = T().pinya.crit; return; }
    setTimeout(function () { esc_.classList.add('entra'); }, 60);
    setTimeout(function () { esc_.classList.add('unida'); }, 1300);
    setTimeout(function () { crit.textContent = T().pinya.crit; }, 2000);
  }
  DESPRES.pinya = function () { if (S.actual && S.actual.pinya) animaPinya(true); };
  function posaMa() {
    var a = S.actual; if (!a) return;
    $('#posMa') && ($('#posMa').disabled = true);
    if (!a.pinya) {
      a.pinya = Date.now(); a.pinyaNo = false; desa();
      registra({ tipus: 'pinya', moment: 'abans', partit: a.id, compromisos: a.compromisos.slice(), rol: a.rol });
    }
    $('#pinyaPregunta').hidden = true; $('#pinyaNoBox').hidden = true;
    animaPinya(false);
    setTimeout(function () { $('#pinyaFet').hidden = false; }, reduirMov ? 0 : 2300);
  }

  /* ================= DURANT ================= */
  VISTES.durant = function () {
    var t = T(), d = t.durant, p = t.pinya, r = rol();
    var h = '<span class="kick">' + esc(t.ui.durant) + '</span><h1>' + esc(d.titol) + '</h1><p class="lead">' + esc(d.intro) + '</p>';
    var comp = compromisosText();
    if (comp.length) h += '<div class="compromis-box"><span class="et">' + esc(S.actual.pinya ? p.recorda : p.recordaSense) + '</span>' + comp.map(esc).join('<br>') + '</div>';
    h += '<button type="button" class="pausa-btn" data-pausa="1">' + esc(t.ui.pausaBtn) + '<small>' + esc(t.ui.pausaBtnSub) + '</small></button>';
    h += '<div class="btnrow" style="margin-top:0"><button type="button" class="btn full ghost" data-rapid="1">' + esc(t.ui.rapidBtn) + '</button></div>';
    h += '<div class="card suau"><ol class="consignes">' + p.passosActivacio.map(function (x) { return '<li class="on">' + esc(x) + '</li>'; }).join('') + '</ol></div>';
    h += seguretat();
    h += '<h2 style="margin-top:20px">' + esc(d.escenarisT) + '</h2><p class="muted">' + esc(d.escenarisD) + '</p><div class="escenaris">';
    var n = 0;
    t.escenaris.forEach(function (e) { if (e.rols.indexOf(r) < 0) return; n++; h += '<button type="button" class="esc" data-go="escenari" data-arg="' + e.id + '"><span class="n">' + n + '</span><span>' + esc(e.t) + '</span><span class="fl" aria-hidden="true">›</span></button>'; });
    h += '</div>';
    if (S.actual) h += '<div class="btnrow"><button type="button" class="btn full blau" data-go="despres">' + esc(t.ui.despres) + ' →</button></div>';
    return h + peu();
  };
  VISTES.escenari = function (id) {
    var t = T(), d = t.durant, e = trobaPer(t.escenaris, id);
    if (!e) return VISTES.durant();
    var h = '<span class="kick">' + esc(d.escenarisT) + '</span><h1>' + esc(e.t) + '</h1>';
    if (e.seguretat) h += seguretat();
    h += '<div class="card"><dl class="fitxa">' +
      '<dt>' + esc(d.reaccio) + '</dt><dd>' + esc(e.reaccio) + '</dd>' +
      '<dt>' + esc(d.cos) + '</dt><dd>' + esc(e.cos) + '</dd>' +
      '<dt>' + esc(d.pensament) + '</dt><dd>' + esc(e.pensament) + '</dd>' +
      (e.intervencio ? '<dt>' + esc(d.intervencio) + '</dt><dd class="si">' + esc(e.intervencio) + '</dd>' : '') +
      '<dt>' + esc(d.ais) + '</dt><dd>' + esc(e.ais) + '</dd>' +
      '<dt>' + esc(d.alternativa) + '</dt><dd class="si">' + esc(e.alternativa) + '</dd>' +
      '<dt>' + esc(d.frase) + '</dt><dd class="si">' + esc(e.frase) + '</dd>' +
      '<dt>' + esc(d.evitar) + '</dt><dd class="no">' + esc(e.evitar) + '</dd></dl></div>';
    var comp = compromisosText();
    if (comp.length) h += '<div class="compromis-box"><span class="et">' + esc(t.pinya.recorda) + '</span>' + comp.map(esc).join('<br>') + '</div>';
    h += '<p class="muted">' + esc(d.noDefecte) + '</p>';
    h += '<div class="btnrow"><button type="button" class="btn full" data-pausa="1" data-situacio="' + e.id + '">' + esc(d.ferPausa) + '</button></div>';
    return h + peu();
  };

  /* ---------- PAUSA (modal) ---------- */
  var pz = null;
  function obrePausa(situacio) {
    pz = { pas: 0, situacio: situacio || null, groc: [], blau: [], conducta: null, inici: Date.now() };
    obreModal(); pintaPausa();
  }
  function obreModal() { $('#modal').classList.add('on'); document.body.style.overflow = 'hidden'; }
  function tancaModal() {
    if (pausaSil) { try { pausaSil.destroy(); } catch (e) {} pausaSil = null; }
    clearInterval(rapidT); $('#modal').classList.remove('on'); document.body.style.overflow = '';
    var b = $('.pausa-btn') || $('#app h1'); if (b) try { b.focus(); } catch (e) {}
  }
  var pausaSil = null;
  function pintaPausa() {
    if (pausaSil) { try { pausaSil.destroy(); } catch (e) {} pausaSil = null; }
    var t = T(), d = t.durant, p = t.pinya, r = rol();
    var titols = [d.pas1, d.pas2, d.pas3];
    var h = '<div class="capsh"><span class="pas-n">' + esc(X().pas) + ' ' + (pz.pas + 1) + ' ' + esc(X().de) + ' 3</span><span class="sp"></span><button type="button" class="link" data-tanca="1">' + esc(t.ui.tancar) + '</button></div>' +
      '<div class="passos" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<span' + (i <= pz.pas ? ' class="on"' : '') + '></span>'; }).join('') + '</div>' +
      '<h2 class="pas-t" id="pasTitol">' + esc(titols[pz.pas]) + '</h2>';
    if (pz.pas === 0) {
      h += '<p><b>' + esc(d.pas1t) + '</b> ' + esc(d.pas1d) + '</p><div id="pzSil"></div>';
      h += '<label class="lb" for="pzSit">' + esc(d.situacioQ) + '</label><select id="pzSit"><option value="">–</option>' +
        t.escenaris.filter(function (e) { return e.rols.indexOf(r) >= 0; }).map(function (e) { return '<option value="' + e.id + '"' + (pz.situacio === e.id ? ' selected' : '') + '>' + esc(e.t) + '</option>'; }).join('') + '</select>';
      h += '<div class="btnrow"><button type="button" class="btn full" data-pzpas="1">' + esc(t.ui.seguent) + ' →</button></div>';
    } else if (pz.pas === 1) {
      h += '<p class="cita" style="margin-top:4px">' + esc(d.pas2t) + '</p><p class="muted">' + esc(d.pas2d) + '</p><div id="pzSil"></div>';
      h += '<div class="btnrow"><button type="button" class="btn sm ghost" id="pzResp" aria-pressed="true">' + esc(t.silueta.respiracio) + ': ' + esc(t.silueta.respiracioOn) + '</button><button type="button" class="link" id="pzExt">' + esc(t.silueta.externaBtn) + '</button></div><div id="pzExtBox" hidden></div>';
      h += '<div class="btnrow"><button type="button" class="btn full ghost" data-pzpas="0">← ' + esc(t.ui.enrere) + '</button><button type="button" class="btn full" data-pzpas="2">' + esc(t.ui.seguent) + ' →</button></div>';
    } else {
      var comp = compromisosText();
      h += '<p>' + esc(fmt(d.pas3t, { qui: t.rols[r].qui })) + '</p>';
      h += comp.length ? '<div class="compromis-box"><span class="et">' + esc(S.actual && S.actual.pinya ? p.recorda : p.recordaSense) + '</span>' + comp.map(esc).join('<br>') + '</div>' : '<p class="muted">' + esc(d.pas3sense) + '</p>';
      if (pz.groc.length) h += '<p class="muted">' + esc(t.silueta.groguesQueden) + '</p>';
      h += '<h3>' + esc(p.conductesT) + '</h3><div role="group" aria-label="' + esc(p.conductesT) + '">' + p.conductes.map(function (c) { return opt('data-conducta', c.id, c.t, pz.conducta === c.id); }).join('') + '</div>';
      h += '<div class="btnrow"><button type="button" class="btn full ghost" data-pzpas="1">← ' + esc(t.ui.enrere) + '</button><button type="button" class="btn full verd" id="pzFi">' + esc(d.tornar) + '</button></div>';
    }
    $('#sheet').innerHTML = h;
    $('#modal').setAttribute('aria-labelledby', 'pasTitol');
    var box = $('#pzSil');
    if (box) {
      pausaSil = window.SiluetaAIS.mount(box, { txt: t, mode: pz.pas === 0 ? 'reconec' : 'acompany', groc: pz.groc, blau: pz.blau, llista: true,
        onChange: function (st) { pz.groc = st.groc; pz.blau = st.blau; } });
      if (pz.pas === 1) {
        if (!pz.blau.length) { pz.groc.forEach(function (z) { pausaSil.focusBlau(z); }); if (!pz.groc.length) pausaSil.focusBlau('panxa'); pz.blau = pausaSil.get().blau; }
        pausaSil.setRespiracio(true);
      }
    }
    var tt = $('#pasTitol'); tt.setAttribute('tabindex', '-1'); try { tt.focus(); } catch (e) {}
  }
  function fiPausa(mode) {
    var a = S.actual;
    registra({ tipus: 'pausa', moment: 'durant', partit: a ? a.id : null, situacio: pz ? pz.situacio : null, zones: pz ? pz.groc.slice() : [], zonesBlau: pz ? pz.blau.slice() : [],
      ais: 'si', conducta: pz ? pz.conducta : null, compromisos: a ? a.compromisos.slice() : [], mode: mode });
    tancaModal(); toast(T().durant.registrada);
  }
  /* mode ràpid: tres paraules, deu segons */
  var rapidT = null;
  function obreRapid() {
    pz = { pas: 0, situacio: null, groc: [], blau: [], conducta: null };
    obreModal();
    var t = T(), d = t.durant, i = 0;
    var comp = compromisosText();
    $('#sheet').innerHTML = '<div class="capsh"><span class="pas-n">' + esc(d.rapidT) + '</span><span class="sp"></span><button type="button" class="link" data-tanca="1">' + esc(t.ui.tancar) + '</button></div>' +
      '<div class="rapid"><h2 class="sr" id="pasTitol">' + esc(d.rapidT) + '</h2><div class="paraula" id="paraula" aria-live="assertive">' + esc(d.rapid[0]) + '</div><div class="anell" aria-hidden="true"></div>' +
      '<div id="rapidFi" hidden>' + (comp.length ? '<div class="compromis-box" style="text-align:left"><span class="et">' + esc(t.pinya.recorda) + '</span>' + comp.map(esc).join('<br>') + '</div>' : '') +
      '<button type="button" class="btn full verd" id="rapidOk">' + esc(d.rapidFi) + '</button></div></div>';
    $('#modal').setAttribute('aria-labelledby', 'pasTitol');
    clearInterval(rapidT);
    rapidT = setInterval(function () {
      i++; if (i < d.rapid.length) { $('#paraula').textContent = d.rapid[i]; return; }
      clearInterval(rapidT); $('#rapidFi').hidden = false; var b = $('#rapidOk'); if (b) b.focus();
    }, 3300);
  }

  /* ================= DESPRÉS ================= */
  var dp = null;
  VISTES.despres = function () {
    var t = T(), d = t.despres, p = t.pinya, r = rol();
    dp = { activacio: null, deteccio: null, ais: null, check: [], impulsiva: null, reparacio: false, fq1: null, fq2: null };
    var comp = compromisosText();
    var h = '<span class="kick">' + esc(t.ui.despres) + '</span><h1>' + esc(d.titol) + '</h1><span class="durada">' + esc(d.durada) + '</span>';
    /* Com rebre l'esportista / tancar amb l'equip */
    var llista = r === 'entrenador' ? t.rebreEntrenador : t.rebre;
    h += '<div class="card verd"><h2>' + esc(r === 'entrenador' ? d.rebreTEntrenador : d.rebreT) + '</h2>' + (r === 'familia' ? '<p><b>' + esc(d.rebrePregunta) + '</b></p>' : '') +
      '<p class="muted">' + esc(d.rebreIntro) + '</p><p class="muted">' + esc(d.rebreQ) + '</p><div class="chips" role="group" aria-label="' + esc(d.rebreQ) + '">' +
      llista.map(function (x) { return '<button type="button" class="chip" data-rebre="' + x.id + '" aria-pressed="false">' + esc(x.t) + '</button>'; }).join('') + '</div><div id="rebreBox" aria-live="polite"></div></div>';
    /* He estat fidel a sa meva mà? */
    h += '<div class="card"><h2>' + esc(p.fidelT) + '</h2><p class="muted">' + esc(p.fidelD) + '</p>';
    if (comp.length) h += '<div class="compromis-box"><span class="et">' + esc(d.compromisAvui) + '</span>' + comp.map(esc).join('<br>') + '</div>';
    h += '<label class="lb">' + esc(p.fq1) + '</label>' + seg('fq1', p.fo, null, p.fq1);
    h += '<label class="lb">' + esc(p.fq2) + '</label>' + seg('fq2', p.fo, null, p.fq2);
    h += '<div id="fidelMsg" aria-live="polite"></div>';
    h += '<label class="lb" for="fq3">' + esc(p.fq3) + '</label><textarea id="fq3" maxlength="300"></textarea>' + avisNoms() + '</div>';
    /* Registre emocional i conductual */
    h += '<div class="card"><label class="lb" style="margin-top:0">' + esc(d.q1) + '</label><p class="muted">' + esc(d.q1d) + '</p>' + escala('activacio', null, d.q1);
    h += '<label class="lb">' + esc(d.q2) + '</label>' + seg('deteccio', d.q2o, null, d.q2);
    h += '<label class="lb">' + esc(d.q3) + '</label>' + seg('ais', d.q3o, null, d.q3);
    h += '<label class="lb">' + esc(d.q4) + '</label><p class="muted">' + esc(d.q4d) + '</p><div role="group" aria-label="' + esc(d.q4) + '">' +
      t.checklist[r].map(function (c) { return opt('data-check', c.id, c.t, false, 'checkbox'); }).join('') + '</div>';
    h += '<label class="lb">' + esc(d.q5) + '</label><p class="muted">' + esc(d.q5d) + '</p>' + seg('impulsiva', d.q5o, null, d.q5);
    h += '<div id="reparacio" hidden><div class="card terra" style="margin-bottom:0"><h3 style="margin-top:0">' + esc(d.reparacioT) + '</h3><p>' + esc(d.reparacioIntro) + '</p><ol class="consignes">' +
      d.reparacio.map(function (x) { return '<li class="on">' + esc(x) + '</li>'; }).join('') + '</ol>' + opt('data-reparacio', '1', d.reparacioFeta, false, 'checkbox') +
      '<label class="lb sr" for="repNota">' + esc(d.reparacioPh) + '</label><textarea id="repNota" maxlength="300" placeholder="' + esc(d.reparacioPh) + '"></textarea>' + avisNoms() + '</div></div>';
    h += '<label class="lb" for="q6">' + esc(d.q6) + '</label><textarea id="q6" maxlength="300"></textarea>';
    h += '<label class="lb" for="q7">' + esc(p.fq5) + '</label><textarea id="q7" maxlength="300"></textarea>' + avisNoms();
    h += '<div class="btnrow"><button type="button" class="btn full blau" id="desaDespres">' + esc(d.desa) + '</button></div></div>';
    h += '<p class="cita">' + esc(p.final) + '</p>';
    return h + peu();
  };

  /* ================= APRÈN ================= */
  VISTES.apren = function () {
    var t = T(), a = t.apren, r = rol();
    var h = '<span class="kick">' + esc(t.ui.apren) + '</span><h1>' + esc(a.titol) + '</h1><p class="lead">' + esc(a.intro) + '</p>';
    if (r === 'entrenador') h += acces('entrenadors', IC.entrenador, t.inici.entrenadorsT, t.inici.entrenadorsD);
    h += acces('piramide', IC.piramide, t.piramide.titol, t.piramide.mestria.lema);
    h += acces('silueta', IC.silueta, t.inici.siluetaT, t.inici.siluetaD);
    h += '<div class="escenaris" style="margin-top:12px">' + t.llicons.map(function (l, i) {
      return '<button type="button" class="esc" data-go="llico" data-arg="' + l.id + '"><span class="n">' + (i + 1) + '</span><span>' + esc(l.t) + (S.llegides[l.id] ? '<br><span class="llegida">' + esc(a.llegida) + '</span>' : '') + '</span><span class="fl" aria-hidden="true">›</span></button>';
    }).join('') + '</div>';
    return h + peu();
  };
  VISTES.llico = function (id) {
    var t = T(), a = t.apren, l = trobaPer(t.llicons, id); if (!l) return VISTES.apren();
    S.llegides[id] = true; desa();
    var i = t.llicons.indexOf(l);
    var h = '<span class="kick">' + esc(a.titol) + ' · ' + (i + 1) + '/' + t.llicons.length + '</span><h1>' + esc(l.t) + '</h1>';
    h += l.cos.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    h += '<div class="card"><h2>' + esc(a.pregunta) + '</h2><p>' + esc(l.q.t) + '</p>' + l.q.o.map(function (o, k) { return '<button type="button" class="opt" data-resp="' + k + '"><span class="box" aria-hidden="true"></span><span>' + esc(o.t) + '</span></button>'; }).join('') +
      '<div class="fb" id="fb" aria-live="polite"></div></div>';
    h += '<div class="card verd"><h2>' + esc(a.accio) + '</h2><p>' + esc(l.accio) + '</p><button type="button" class="btn sm" data-setmanal="' + esc(l.accio) + '">' + esc(a.ferCompromis) + '</button></div>';
    var seg_ = t.llicons[i + 1];
    if (seg_) h += '<p class="muted" style="margin-top:16px">' + esc(t.ui.seguent) + ': ' + esc(seg_.t) + '</p>';
    return h + peu();
  };

  /* ================= PIRÀMIDE DEL RENDIMENT ================= */
  var pirOr = 'totes', pirNiv = null;
  VISTES.piramide = function () {
    var t = T(), p = t.piramide, r = rol();
    var h = '<span class="kick">' + esc(t.ui.apren) + '</span><h1>' + esc(p.titol) + '</h1><p class="lead">' + esc(p.intro) + '</p>';
    h += '<div class="pir-or"><div class="card verd" style="margin:0"><h2>' + esc(p.mestria.t) + '</h2><p><b>' + esc(p.mestria.lema) + '</b></p>' + p.mestria.l.map(function (x) { return '<p class="muted" style="margin:2px 0">' + esc(x) + '</p>'; }).join('') + '</div>' +
      '<div class="card terra" style="margin:0"><h2>' + esc(p.ego.t) + '</h2><p><b>' + esc(p.ego.lema) + '</b></p>' + p.ego.l.map(function (x) { return '<p class="muted" style="margin:2px 0">' + esc(x) + '</p>'; }).join('') + '</div></div>';
    h += '<p class="muted" style="margin-top:14px">' + esc(p.mira) + '</p>' + seg('pirOr', [{ id: 'mestria', t: p.mestria.t }, { id: 'ego', t: p.ego.t }, { id: 'totes', t: X().totes }], pirOr, p.mira);
    h += '<div class="pir" id="pir">' + pirHTML() + '</div><p class="muted" style="text-align:center">' + esc(p.toca) + '</p><div id="pirDet" aria-live="polite"></div>';
    h += '<div class="card suau"><p style="margin:0">' + esc(p.llegir) + '</p><p class="muted" style="margin:8px 0 0">' + esc(p.entrenar) + '</p></div>';
    h += '<div class="card blau"><h2>' + esc(p.aisT) + '</h2><p>' + esc(p.ais) + '</p><button type="button" class="btn sm" data-go="silueta">' + esc(t.inici.siluetaT) + '</button></div>';
    h += '<h2 style="margin-top:18px">' + esc(p.adultsT) + '</h2>' + p.adults[r].map(function (c) { return '<div class="parell"><div class="no"><small>' + esc(p.ego.t) + '</small>' + esc(c.no) + '</div><div class="si"><small>' + esc(p.mestria.t) + '</small>' + esc(c.si) + '</div></div>'; }).join('');
    h += '<div class="card verd"><h2>' + esc(t.apren.accio) + '</h2><p>' + esc(p.accio) + '</p><button type="button" class="btn sm" data-setmanal="' + esc(p.accio) + '">' + esc(t.apren.ferCompromis) + '</button></div>';
    h += '<p class="muted">' + esc(p.font) + '</p>';
    return h + peu();
  };
  function pirHTML() {
    var p = T().piramide, n = p.nivells.length;
    var h = '<div class="pir-cim">' + esc(p.cim) + '</div>';
    p.nivells.slice().reverse().forEach(function (v, k) {
      var w = 46 + k * 9, cap = (pirOr !== 'ego' ? v.m : '') , dre = (pirOr !== 'mestria' ? v.e : '');
      h += '<button type="button" class="pir-n' + (pirNiv === v.id ? ' sel' : '') + '" data-pir="' + v.id + '" aria-expanded="' + (pirNiv === v.id) + '" aria-controls="pirDet" style="width:' + Math.min(100, w) + '%">' +
        '<span class="pt">' + esc(v.t) + '</span>' + (v.sub ? '<span class="ps">' + esc(v.sub) + '</span>' : '') +
        ((cap || dre) ? '<span class="pl">' + (cap ? '<i class="m">' + esc(cap) + '</i>' : '') + (dre ? '<i class="e">' + esc(dre) + '</i>' : '') + '</span>' : '') + '</button>';
    });
    return h;
  }
  function pirDetall() {
    var p = T().piramide, v = trobaPer(p.nivells, pirNiv), d = $('#pirDet'); if (!d) return;
    if (!v) { d.innerHTML = ''; return; }
    d.innerHTML = '<div class="card"><h2>' + esc(v.t) + (v.sub ? ' <span class="muted">' + esc(v.sub) + '</span>' : '') + '</h2>' +
      (v.m ? '<div class="parell"><div class="si"><small>' + esc(p.mestria.t) + '</small>' + esc(v.m) + '</div><div class="no"><small>' + esc(p.ego.t) + '</small>' + esc(v.e) + '</div></div>' : '<p class="muted" style="margin:0">' + esc(p.llegir) + '</p>') + '</div>';
  }

  /* ================= ENTRENADORS ================= */
  VISTES.entrenadors = function () {
    var t = T(), e = t.entrenadors;
    var h = '<span class="kick">' + esc(t.ui.apren) + '</span><h1>' + esc(e.titol) + '</h1><p class="lead">' + esc(e.intro) + '</p>';
    h += '<div class="card blau"><h2>' + esc(e.tecnicaT) + '</h2><ul class="punts">' + e.tecnica.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    h += '<h2 style="margin-top:18px">' + esc(e.situacionsT) + '</h2>';
    t.situacionsEntrenador.forEach(function (s) {
      h += '<details><summary>' + esc(s.t) + '</summary><div class="cos"><p><b>' + esc(e.clau) + ':</b> ' + esc(s.clau) + '</p><h3>' + esc(e.fer) + '</h3><ul class="punts">' + s.fer.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="parell"><div class="no"><small>' + esc(e.evita) + '</small>' + esc(s.evitar) + '</div><div class="si"><small>' + esc(e.proposa) + '</small>' + esc(s.frase) + '</div></div></div></details>';
    });
    h += '<h2 style="margin-top:18px">' + esc(e.comunicacioT) + '</h2>';
    t.comunicacio.forEach(function (c) { h += '<div class="parell"><div class="no"><small>' + esc(e.enLloc) + '</small>' + esc(c.no) + '</div><div class="si"><small>' + esc(e.proposa) + '</small>' + esc(c.si) + '</div></div>'; });
    h += '<div class="btnrow"><button type="button" class="btn full blau" data-go="abans">' + esc(t.abans.intencio) + '</button><button type="button" class="btn full ghost" data-go="pinya">' + esc(t.pinya.enquestaT) + '</button></div>';
    return h + peu();
  };

  /* ================= PRÀCTICA LLIURE AMB LA SILUETA ================= */
  var practicaLliure = { groc: [], blau: [], percepcio: null };
  VISTES.silueta = function () {
    var t = T(); practicaLliure = { groc: [], blau: [], percepcio: null };
    return '<span class="kick">AIS</span><h1>' + esc(t.silueta.titol) + '</h1><p class="lead">' + esc(t.silueta.intro) + '</p><div class="card" id="silLliure"></div>' +
      '<p class="muted">' + esc(t.silueta.accessible) + '</p><div class="btnrow"><button type="button" class="btn full" id="desaPractica">' + esc(t.ui.desar) + '</button></div>' + peu();
  };
  DESPRES.silueta = function () { muntaPractica($('#silLliure'), practicaLliure, true); };

  /* ================= COMPROMÍS SETMANAL ================= */
  function setmanalCard(nomesReflexio) {
    var t = T(), s = t.setmanal, a = S.setm.actual;
    if (!a) return '';
    var dies = diesDes(a.desDe);
    if (nomesReflexio && dies < 7) return '<div class="card suau"><span class="pas-n">' + esc(s.actual) + '</span><p style="margin:4px 0 0"><b>' + esc(tr(a.t)) + '</b></p></div>';
    if (dies >= 7 || !nomesReflexio) {
      return '<div class="card blau"><h2>' + esc(dies >= 7 ? s.reflexioT : s.actual) + '</h2><p><b>' + esc(tr(a.t)) + '</b><br><span class="muted">' + esc(s.desDe) + ' ' + esc(dataCurta(a.desDe)) + '</span></p>' +
        (dies >= 7 || !nomesReflexio ? '<div id="reflexio"' + (dies >= 7 ? '' : ' hidden') + '>' + seg('reflexio', s.reflexioO, null, s.reflexioT) +
          '<label class="lb" for="reflexioNota">' + esc(s.reflexioQ) + '</label><textarea id="reflexioNota" maxlength="300"></textarea>' + avisNoms() +
          '<div class="btnrow"><button type="button" class="btn sm" id="renova">' + esc(s.renovar) + '</button><button type="button" class="btn sm ghost" id="nouSetm">' + esc(s.nou) + '</button></div></div>' : '') +
        (dies < 7 ? '<button type="button" class="link" id="reflexioAra">' + esc(s.reflexioAra) + '</button>' : '') + '</div>';
    }
    return '';
  }
  VISTES.setmanal = function () {
    var t = T(), s = t.setmanal, r = rol();
    var h = '<span class="kick">' + esc(t.inici.setmanalT) + '</span><h1>' + esc(s.titol) + '</h1><p class="lead">' + esc(s.intro) + '</p>';
    h += setmanalCard(false);
    h += '<div class="card"><h2>' + esc(s.tria) + '</h2><div role="group" aria-label="' + esc(s.tria) + '">' + t.objectiusSetmanals[r].map(function (o) { return opt('data-objectiu', o, o, false); }).join('') + '</div>' +
      '<label class="lb" for="objPropi">' + esc(s.propi) + '</label><input type="text" id="objPropi" maxlength="140" placeholder="' + esc(s.propiPh) + '" autocomplete="off">' + avisNoms() +
      '<div class="btnrow"><button type="button" class="btn full blau" id="guardaSetm">' + esc(s.guardar) + '</button></div></div>';
    if (S.setm.hist.length) {
      h += '<h2>' + esc(s.historial) + '</h2>' + S.setm.hist.slice().reverse().map(function (x) {
        var v = trobaPer(s.reflexioO, x.valoracio);
        return '<div class="reg"><div class="rt"><b>' + esc(tr(x.t)) + '</b><span class="rd">' + esc(dataCurta(x.desDe)) + '</span></div>' + (v ? '<div class="rb">' + esc(v.t) + (x.nota ? ' · ' + esc(x.nota) : '') + '</div>' : '') + '</div>';
      }).join('');
    }
    return h + peu();
  };
  function fixaSetmanal(text) {
    if (!text) return;
    if (S.setm.actual) S.setm.hist.push(Object.assign({}, S.setm.actual, { fins: avui() }));
    S.setm.actual = { t: text.slice(0, 140), desDe: avui() }; desa();
    registra({ tipus: 'setmanal', moment: 'abans', conducta: text.slice(0, 140) });
    toast(T().ui.desat);
  }

  /* ================= REGISTRE ================= */
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function setmanaDe(iso) { var d = new Date(iso + 'T00:00:00'); var dia = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dia); return ymd(d); }
  VISTES.registre = function () {
    var t = T(), g = t.registre, R = S.reg;
    var h = '<span class="kick">' + esc(t.ui.registre) + '</span><h1>' + esc(g.titol) + '</h1><p class="lead">' + esc(g.intro) + '</p>';
    h += '<div class="btnrow"><button type="button" class="btn sm ghost" data-go="privacitat">' + esc(t.ui.privacitat) + '</button><button type="button" class="btn sm ghost" id="obreManual">' + esc(g.nouManual) + '</button></div><div id="manualBox" hidden></div>';
    if (!R.length) return h + '<div class="card"><p class="buit">' + esc(g.buit) + '</p></div>' + peu();
    var partits = {}, pauses = 0, respecte = 0, aprenentatges = [], comps = {}, sits = {}, conds = {};
    R.forEach(function (r) {
      if (r.partit && (r.tipus === 'abans' || r.tipus === 'despres' || r.tipus === 'pinya')) partits[r.partit] = 1;
      if (r.tipus === 'manual') partits['m' + r.id] = 1;
      if (r.tipus === 'pausa') pauses++;
      if (r.tipus === 'despres' && r.check) { respecte += r.check.length; r.check.forEach(function (c) { conds[c] = (conds[c] || 0) + 1; }); }
      ['repetir', 'millorar', 'ajudat', 'aprenentatge'].forEach(function (k) { if (r[k]) aprenentatges.push({ d: r.data, t: tr(r[k]) }); });
      if (r.tipus === 'abans' && r.compromisos) r.compromisos.forEach(function (c) { comps[c] = (comps[c] || 0) + 1; });
      if (r.tipus === 'abans' && r.disparadors) r.disparadors.forEach(function (c) { sits[c] = (sits[c] || 0) + 1; });
      if ((r.tipus === 'pausa' || r.tipus === 'manual') && r.situacio) sits[r.situacio] = (sits[r.situacio] || 0) + 1;
    });
    h += '<div class="stats"><div><b>' + Object.keys(partits).length + '</b><span>' + esc(g.partits) + '</span></div><div><b>' + pauses + '</b><span>' + esc(g.pauses) + '</span></div>' +
      '<div><b>' + respecte + '</b><span>' + esc(g.respecte) + '</span></div><div><b>' + aprenentatges.length + '</b><span>' + esc(g.aprenentatges) + '</span></div></div>';
    /* pauses per setmana (6 darreres setmanes) */
    var setm = [], d0 = new Date(setmanaDe(avui()) + 'T00:00:00');
    for (var i = 5; i >= 0; i--) { var d = new Date(d0); d.setDate(d.getDate() - 7 * i); setm.push(ymd(d)); }
    var comptes = setm.map(function (s) { return R.filter(function (r) { return r.tipus === 'pausa' && setmanaDe(r.data) === s; }).length; });
    var max = Math.max.apply(null, comptes.concat([1]));
    h += '<div class="card"><h2>' + esc(g.setmanes) + '</h2><div class="barres" role="img" aria-label="' + esc(g.setmanes) + ': ' + comptes.join(', ') + '">' +
      comptes.map(function (c) { return '<div class="bc"><span class="v">' + c + '</span><span class="b" style="height:' + Math.max(3, c / max * 100) + '%"></span></div>'; }).join('') + '</div>' +
      '<div class="barres-et" aria-hidden="true">' + setm.map(function (s) { return '<span>' + dataCurta(s).slice(0, -3) + '</span>'; }).join('') + '</div></div>';
    function freq(obj, nom) {
      var k = Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; }).slice(0, 5);
      return '<ul class="freq">' + k.map(function (x) { return '<li><span>' + esc(nom(x)) + '</span><b>' + obj[x] + '</b></li>'; }).join('') + '</ul>';
    }
    if (Object.keys(comps).length) h += '<div class="card"><h2>' + esc(g.compromisosFreq) + '</h2>' + freq(comps, function (x) { return compText(x); }) + '</div>';
    if (Object.keys(sits).length) h += '<div class="card"><h2>' + esc(g.situacionsFreq) + '</h2>' + freq(sits, situacioText) + '</div>';
    if (Object.keys(conds).length) h += '<div class="card"><h2>' + esc(g.conductesFreq) + '</h2>' + freq(conds, function (x) { var c = trobaPer(t.checklist.familia, x) || trobaPer(t.checklist.entrenador, x); return c ? c.t : x; }) + '</div>';
    var ps = R.filter(function (r) { return r.tipus === 'pausa'; }).slice(-5).reverse();
    if (ps.length) {
      h += '<div class="card"><h2>' + esc(g.seqT) + '</h2><p class="muted">' + esc(g.seqD) + '</p>' + ps.map(function (r) {
        var cond = r.conducta ? conductaText(r.conducta) : (r.compromisos && r.compromisos[0] ? compText(r.compromisos[0]) : g.senseDada);
        return '<div class="seq"><span>' + esc(situacioText(r.situacio) || g.senseDada) + '</span><i aria-hidden="true">→</i><span>' + esc(r.zones && r.zones.length ? r.zones.map(zonaText).join(', ') : g.senseDada) +
          '</span><i aria-hidden="true">→</i><span>' + esc(r.mode === 'rapid' ? t.durant.rapidT : t.ui.pausaBtn) + '</span><i aria-hidden="true">→</i><span>' + esc(cond) + '</span></div>';
      }).join('') + '</div>';
    }
    if (aprenentatges.length) h += '<div class="card"><h2>' + esc(g.aprenT) + '</h2><ul class="punts">' + aprenentatges.slice(-8).reverse().map(function (a) { return '<li><span class="muted">' + esc(dataCurta(a.d)) + '</span> ' + esc(a.t) + '</li>'; }).join('') + '</ul></div>';
    h += '<h2 style="margin-top:18px">' + esc(g.historial) + '</h2>';
    R.slice().reverse().forEach(function (r) { h += registreHTML(r); });
    return h + peu();
  };
  function registreHTML(r) {
    var t = T(), g = t.registre, c = g.camps, parts = [];
    var rl = t.rols[r.rol] ? (r.rol === 'entrenador' ? (S.lang === 'es' ? 'Entrenador/a' : 'Entrenador/a') : (S.lang === 'es' ? 'Familia' : 'Família')) : '';
    parts.push(c.rol + ': ' + rl);
    if (r.moment) parts.push(c.moment + ': ' + (g.moments[r.moment] || r.moment));
    if (r.emocions && r.emocions.length) parts.push(r.emocions.map(function (e) { var x = trobaPer(t.emocions, e); return x ? x.t : e; }).join(', '));
    if (r.situacio) parts.push(c.situacio + ': ' + situacioText(r.situacio));
    if (r.activacio != null) parts.push(c.activacio + ': ' + r.activacio);
    if (r.zones && r.zones.length) parts.push(c.zona + ': ' + r.zones.map(zonaText).join(', '));
    if (r.ais) parts.push(c.ais + ': ' + ({ si: g.si, no: g.no, noCalia: g.noCal }[r.ais] || r.ais));
    if (r.compromisos && r.compromisos.length) parts.push(r.compromisos.map(function (x) { return '«' + compText(x, r.rol) + '»'; }).join(' '));
    if (r.conducta) parts.push(c.conducta + ': ' + conductaText(r.conducta));
    if (r.impulsiva) parts.push(c.impulsiva + ': ' + (r.impulsiva === 'si' ? g.si : g.no));
    if (r.reparacio) parts.push(c.reparacio + ': ' + g.si);
    ['ajudat', 'repetir', 'millorar', 'aprenentatge'].forEach(function (k) { if (r[k]) parts.push(tr(r[k])); });
    return '<div class="reg"><div class="rt"><b>' + esc(g.tipus[r.tipus] || r.tipus) + '</b><span class="rd">' + esc(dataCurta(r.data)) + '</span></div><div class="rb">' + parts.map(esc).join(' · ') + '</div>' +
      '<button type="button" class="del" data-del="' + esc(r.id) + '">' + esc(g.esborrar) + '</button></div>';
  }
  function manualHTML() {
    var t = T(), g = t.registre, c = g.camps, r = rol();
    var h = '<div class="card"><h2>' + esc(g.manualT) + '</h2><p class="muted">' + esc(S.lang === 'es' ? 'Ningún campo es obligatorio.' : 'Cap camp no és obligatori.') + '</p>' +
      '<label class="lb" for="mData">' + esc(c.data) + '</label><input type="date" id="mData" value="' + avui() + '">' +
      '<label class="lb">' + esc(c.moment) + '</label>' + seg('mMoment', [{ id: 'abans', t: g.moments.abans }, { id: 'durant', t: g.moments.durant }, { id: 'despres', t: g.moments.despres }], 'durant', c.moment) +
      '<label class="lb" for="mSit">' + esc(c.situacio) + '</label><select id="mSit"><option value="">–</option>' + t.escenaris.filter(function (e) { return e.rols.indexOf(r) >= 0; }).map(function (e) { return '<option value="' + e.id + '">' + esc(e.t) + '</option>'; }).join('') +
      t.disparadors[r].map(function (e) { return '<option value="' + e.id + '">' + esc(e.t) + '</option>'; }).join('') + '</select>' +
      '<label class="lb">' + esc(c.activacio) + '</label>' + escala('mAct', null, c.activacio) +
      '<label class="lb" for="mZona">' + esc(c.zona) + '</label><select id="mZona"><option value="">–</option>' + t.zones.map(function (z) { return '<option value="' + z.id + '">' + esc(z.t) + '</option>'; }).join('') + '</select>' +
      '<label class="lb">' + esc(c.ais) + '</label>' + seg('mAis', [{ id: 'si', t: g.si }, { id: 'no', t: g.no }, { id: 'noCalia', t: g.noCal }], null, c.ais) +
      '<label class="lb" for="mCond">' + esc(c.conducta) + '</label><select id="mCond"><option value="">–</option>' + t.pinya.conductes.map(function (x) { return '<option value="' + x.id + '">' + esc(x.t) + '</option>'; }).join('') +
      t.compromisos[r].map(function (x) { return '<option value="' + x.id + '">' + esc(x.t) + '</option>'; }).join('') + '</select>' +
      '<label class="lb">' + esc(c.impulsiva) + '</label>' + seg('mImp', [{ id: 'no', t: g.no }, { id: 'si', t: g.si }], null, c.impulsiva) +
      '<label class="lb">' + esc(c.reparacio) + '</label>' + seg('mRep', [{ id: 'no', t: g.no }, { id: 'si', t: g.si }], null, c.reparacio) +
      '<label class="lb" for="mApr">' + esc(c.aprenentatge) + '</label><textarea id="mApr" maxlength="300"></textarea>' + avisNoms() +
      '<div class="btnrow"><button type="button" class="btn full blau" id="desaManual">' + esc(t.ui.desar) + '</button></div></div>';
    return h;
  }
  var manual = {};

  /* ================= PRIVACITAT ================= */
  VISTES.privacitat = function () {
    var t = T(), p = t.privacitat;
    var h = '<span class="kick">APRENS</span><h1>' + esc(p.titol) + '</h1><div class="card"><ul class="punts">' + p.punts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="card"><p class="muted">' + esc(p.noBackend) + '</p><div class="btnrow"><button type="button" class="btn full ghost" data-go="registre">' + esc(p.consultar) + ' (' + S.reg.length + ')</button></div>' +
      '<div class="btnrow"><button type="button" class="btn full ghost" id="expJson">' + esc(p.exportJson) + '</button><button type="button" class="btn full ghost" id="expCsv">' + esc(p.exportCsv) + '</button></div>' +
      '<div class="btnrow"><button type="button" class="btn full" style="background:var(--terra)" id="esborraTot">' + esc(p.esborrar) + '</button></div></div>';
    h += '<p class="muted">' + esc(p.rgpd) + '</p><p class="muted">' + esc(t.ui.colors) + '</p>';
    return h + peu();
  };
  function exportaJSON() {
    var dades = { app: 'aprens-els-pares-tambe-juguen', versio: 1, exportat: new Date().toISOString(), idioma: S.lang, rol: S.rol, registres: S.reg, compromisSetmanal: S.setm };
    descarrega('els-pares-tambe-juguen-' + avui() + '.json', JSON.stringify(dades, null, 2), 'application/json');
  }
  function exportaCSV() {
    var cap = T().csv.cap;
    function q(v) { v = v == null ? '' : String(v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var files = [cap.join(';')];
    S.reg.forEach(function (r) {
      files.push([r.data, r.tipus, r.rol, r.moment, situacioText(r.situacio), r.activacio, (r.zones || []).map(zonaText).join(', '), r.ais,
        r.conducta ? conductaText(r.conducta) : (r.compromisos || []).map(function (x) { return compText(x, r.rol); }).join(' | '),
        r.impulsiva, r.reparacio ? 'si' : '', [r.ajudat, r.repetir, r.millorar, r.aprenentatge].filter(Boolean).map(tr).join(' | ')].map(q).join(';'));
    });
    descarrega('els-pares-tambe-juguen-' + avui() + '.csv', '﻿' + files.join('\r\n'), 'text/csv;charset=utf-8');
  }

  /* ================= CLUB ================= */
  VISTES.club = function () {
    var t = T(), c = t.club, cl = S.club;
    var h = '<span class="kick">' + esc(cl && cl.nom ? cl.nom : t.ui.perClubs) + '</span><h1>' + esc(c.titol) + '</h1>';
    if (cl && cl.escut) h += '<img onerror="this.remove()" src="' + esc(cl.escut) + '" alt="' + esc(c.escut + ' ' + cl.nom) + '" style="display:block;width:96px;height:auto;margin:6px auto 4px">';
    h += '<p class="lead">' + esc(c.intro) + '</p>';
    if (cl && cl.missatge) h += '<div class="card blau"><h2>' + esc(c.missatge) + '</h2><p style="margin:0;white-space:pre-line">' + esc(loc(cl.missatge)) + '</p></div>';
    h += '<div class="club-comp">' + ['families', 'entrenadors', 'club'].map(function (k) { var x = c.comp[k]; return '<div class="card" style="margin:0"><h2>' + esc(x.t) + '</h2><ul class="punts">' + x.l.map(function (y) { return '<li>' + esc(y) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>';
    if (cl && cl.codi && cl.codi.length) h += '<div class="card"><h2>' + esc(c.codi) + '</h2><ul class="punts">' + cl.codi.map(function (x) { return '<li>' + esc(loc(x)) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="card terra"><h2>' + esc(c.proteccio) + '</h2>' + (cl && cl.proteccio && cl.proteccio.text ? '<p>' + esc(loc(cl.proteccio.text)) + '</p>' : '') +
      '<p style="margin:0">' + esc(t.ui.seguretatText) + (cl && cl.proteccio && cl.proteccio.contacte ? '<br><b>' + esc(t.ui.seguretatClub) + '</b> ' + esc(loc(cl.proteccio.contacte)) : '') + '</p></div>';
    h += limitsPinya();
    h += '<div class="card"><h2>' + esc(c.recursos) + '</h2><p style="margin:0">' + esc(c.recursosText) + '</p></div>';
    h += '<div class="card"><h2>' + esc(c.qrT) + '</h2><p class="muted">' + esc(c.qrD) + '</p><div class="qr" id="qr"></div><p class="muted" style="word-break:break-all;text-align:center" id="qrUrl"></p>' +
      '<div class="btnrow"><button type="button" class="btn sm ghost" id="baixaQr">' + esc(c.descarregaQr) + '</button><button type="button" class="btn sm ghost" id="copiaUrl">' + esc(c.copiaEnllac) + '</button><button type="button" class="btn sm verd" id="waUrl">' + esc(c.compartir) + '</button></div></div>';
    h += '<details><summary>' + esc(c.configT) + '</summary><div class="cos"><p class="muted">' + esc(c.configD) + '</p>' +
      '<label class="lb" for="cfNom">' + esc(c.nom) + '</label><input type="text" id="cfNom" maxlength="60" value="' + esc(cl ? cl.nom : '') + '" autocomplete="off">' +
      '<label class="lb" for="cfColor">' + esc(c.color) + '</label><input type="color" id="cfColor" value="' + esc(cl && cl.color ? cl.color : '#2F5E9E') + '">' +
      '<label class="lb">' + esc(c.idiomaPrincipal) + '</label>' + seg('cfLang', [{ id: 'ca', t: 'Català' }, { id: 'es', t: 'Castellano' }], cl && cl.idioma ? cl.idioma : S.lang, c.idiomaPrincipal) +
      '<label class="lb" for="cfMsg">' + esc(c.missatgeCurt) + '</label><textarea id="cfMsg" maxlength="200">' + esc(cl && cl.missatge && !cl.slug ? loc(cl.missatge) : '') + '</textarea>' +
      '<div class="btnrow"><button type="button" class="btn full blau" id="cfGenera">' + esc(c.generar) + '</button></div></div></details>';
    return h + peu();
  };
  var cfLang = null;
  function qrModuls(text) {
    if (typeof window.qrcode !== 'function') return null;
    var q = window.qrcode(0, 'M'); q.addData(unescape(encodeURIComponent(text))); q.make(); return q;
  }
  function pintaQR() {
    var url = enllacClub(), box = $('#qr'); if (!box) return;
    $('#qrUrl').textContent = url;
    var q = qrModuls(url); if (!q) { box.textContent = url; return; }
    var n = q.getModuleCount(), m = 4, mida = n + m * 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    box.innerHTML = '<svg viewBox="0 0 ' + mida + ' ' + mida + '" role="img" aria-label="' + esc(X().qrAlt) + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#1F2A37"/></svg>';
  }
  function baixaQR() {
    var q = qrModuls(enllacClub()); if (!q) return;
    var n = q.getModuleCount(), m = 4, px = 12, mida = (n + m * 2) * px;
    var cv = document.createElement('canvas'); cv.width = mida; cv.height = mida + 60;
    var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.fillStyle = '#1F2A37';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) cx.fillRect((c + m) * px, (r + m) * px, px, px);
    cx.font = 'bold 22px system-ui, sans-serif'; cx.textAlign = 'center';
    cx.fillText(T().ui.appName + (S.club && S.club.nom ? ' · ' + S.club.nom : ''), mida / 2, mida + 30);
    var a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'qr-els-pares-tambe-juguen.png';
    document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500);
  }
  DESPRES.club = function () { pintaQR(); };

  /* ================= ESDEVENIMENTS ================= */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('button, [data-go]'); if (!b) return;
    if (b.closest('#silAbans') || b.closest('#silLliure')) { if (!b.hasAttribute('data-go')) return; }
    var t = T();
    /* navegació */
    if (b.hasAttribute('data-go')) { go(b.getAttribute('data-go'), b.getAttribute('data-arg')); return; }
    if (b.hasAttribute('data-lang')) {
      S.lang = b.getAttribute('data-lang'); desa();
      if ($('#modal').classList.contains('on')) tancaModal();
      pinta(); return;
    }
    if (b.id === 'acceptaAvis') { S.avis = true; if (!S.lang) S.lang = 'ca'; desa(); pinta(); return; }
    if (b.hasAttribute('data-rol')) {
      var nou = b.getAttribute('data-rol');
      if (S.actual && S.actual.rol !== nou) S.actual = null;
      S.rol = nou; desa(); go('inici'); pinta(); return;
    }
    if (b.hasAttribute('data-canvirol')) { S.rol = null; desa(); pinta(); return; }
    if (b.id === 'descartaPartit') { S.actual = null; desa(); pinta(); return; }
    if (b.hasAttribute('data-pausa')) { obrePausa(b.getAttribute('data-situacio')); return; }
    if (b.hasAttribute('data-rapid')) { obreRapid(); return; }

    /* ---- abans ---- */
    if (b.hasAttribute('data-emocio')) { toggle(ab.emocions, b.getAttribute('data-emocio')); b.setAttribute('aria-pressed', String(ab.emocions.indexOf(b.getAttribute('data-emocio')) >= 0)); return; }
    if (b.hasAttribute('data-disp')) { toggle(ab.disparadors, b.getAttribute('data-disp')); b.setAttribute('aria-checked', String(ab.disparadors.indexOf(b.getAttribute('data-disp')) >= 0)); return; }
    if (b.hasAttribute('data-comp')) {
      var id = b.getAttribute('data-comp'), on = ab.compromisos.indexOf(id) >= 0;
      if (!on && ab.compromisos.length >= 2) { $('#maxDos').textContent = t.abans.maxDos; return; }
      toggle(ab.compromisos, id); b.setAttribute('aria-checked', String(!on)); $('#maxDos').textContent = ''; return;
    }
    if (b.hasAttribute('data-intencio')) {
      ab.intencio = b.getAttribute('data-intencio'); $('#intencio').value = ab.intencio;
      $$('[data-intencio]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); return;
    }
    if (b.getAttribute('data-seg') === 'context') { ab.context = b.getAttribute('data-v'); marcaSeg(b); return; }
    if (b.id === 'desaAbans') {
      if (rol() === 'entrenador') ab.intencio = ($('#intencio').value || '').trim().slice(0, 140);
      var nouPartit = !S.actual;
      var a = S.actual || { id: nouId(), ts: Date.now(), data: avui(), rol: rol(), pinya: null, pinyaNo: false };
      a.emocions = ab.emocions.slice(); a.disparadors = ab.disparadors.slice(); a.compromisos = ab.compromisos.slice();
      a.intencio = ab.intencio; a.context = ab.context; a.ais = { groc: ab.ais.groc.slice(), blau: ab.ais.blau.slice(), percepcio: ab.ais.percepcio };
      S.actual = a; desa();
      var prev = nouPartit ? null : S.reg.filter(function (r) { return r.tipus === 'abans' && r.partit === a.id; })[0];
      var dades = { tipus: 'abans', moment: 'abans', partit: a.id, emocions: a.emocions, disparadors: a.disparadors, compromisos: a.compromisos, zones: a.ais.groc, zonesBlau: a.ais.blau, ais: (a.ais.groc.length || a.ais.blau.length || a.ais.percepcio) ? 'si' : null, percepcio: a.ais.percepcio, aprenentatge: a.intencio || null, context: a.context };
      if (prev) { Object.assign(prev, dades); desa(); } else registra(dades);
      toast(X().sessioPreparada); go('pinya'); return;
    }

    /* ---- pinya ---- */
    if (b.id === 'posMa' || b.id === 'reobrePinya') { posaMa(); return; }
    if (b.id === 'noMa') { if (S.actual) { S.actual.pinyaNo = true; desa(); } $('#pinyaPregunta').hidden = true; $('#pinyaNoBox').hidden = false; return; }
    if (b.id === 'repeteix') { animaPinya(false); return; }
    if (b.id === 'compartirMa') { comparteix($('#msgPinya').value, function () { toast(t.pinya.obert); }); return; }
    if (b.id === 'copiaMa') { copia($('#msgPinya').value, t.pinya.copiat); return; }
    if (b.hasAttribute('data-copia')) {
      var k = b.getAttribute('data-copia'), p = t.pinya;
      var txt = k === 'q' ? p.enquestaPregunta : k === 'tot' ? p.enquestaPregunta + '\n' + p.enquestaOpcions.join('\n') : p.enquestaOpcions[+k];
      copia(txt, p.copiat); return;
    }
    if (b.id === 'obreWa') { obreWhatsApp(''); return; }
    if (b.id === 'enviaInv') { comparteix($('#msgInv').value); return; }
    if (b.id === 'copiaInv') { copia($('#msgInv').value, t.pinya.copiat); return; }

    /* ---- pausa ---- */
    if (b.hasAttribute('data-tanca')) { tancaModal(); return; }
    if (b.hasAttribute('data-pzpas')) { if (pz.pas === 0) { var sl = $('#pzSit'); pz.situacio = sl && sl.value ? sl.value : pz.situacio; } pz.pas = +b.getAttribute('data-pzpas'); pintaPausa(); return; }
    if (b.id === 'pzResp') { var on2 = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on2)); b.textContent = t.silueta.respiracio + ': ' + (on2 ? t.silueta.respiracioOn : t.silueta.respiracioOff); if (pausaSil) pausaSil.setRespiracio(on2); return; }
    if (b.id === 'pzExt') { var eb = $('#pzExtBox'); eb.hidden = !eb.hidden; eb.innerHTML = '<div class="card suau"><h3 style="margin-top:0">' + esc(t.silueta.externaT) + '</h3><ol class="consignes">' + t.silueta.externa.map(function (x) { return '<li class="on">' + esc(x) + '</li>'; }).join('') + '</ol></div>'; return; }
    if (b.hasAttribute('data-conducta')) { pz.conducta = b.getAttribute('data-conducta'); $$('[data-conducta]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); return; }
    if (b.id === 'pzFi') { fiPausa('complet'); return; }
    if (b.id === 'rapidOk') { fiPausa('rapid'); return; }

    /* ---- després ---- */
    if (b.hasAttribute('data-rebre')) {
      var ll = rol() === 'entrenador' ? t.rebreEntrenador : t.rebre, x = trobaPer(ll, b.getAttribute('data-rebre'));
      $$('[data-rebre]').forEach(function (y) { y.setAttribute('aria-pressed', String(y === b)); });
      $('#rebreBox').innerHTML = '<p style="margin:8px 0 4px">' + esc(x.r) + '</p><p class="cita" style="margin:6px 0">' + esc(x.f) + '</p>'; return;
    }
    if (b.hasAttribute('data-escala')) {
      var nomE = b.getAttribute('data-escala'), v = +b.getAttribute('data-v');
      if (nomE === 'activacio') dp.activacio = v; else manual.act = v;
      $$('[data-escala="' + nomE + '"]').forEach(function (y) { y.setAttribute('aria-pressed', String(y === b)); }); return;
    }
    if (b.hasAttribute('data-seg')) {
      var sg = b.getAttribute('data-seg'), sv = b.getAttribute('data-v'); marcaSeg(b);
      if (sg === 'deteccio' || sg === 'ais' || sg === 'fq1' || sg === 'fq2') { dp[sg] = sv; if (sg === 'fq1' || sg === 'fq2') missatgeFidel(); return; }
      if (sg === 'impulsiva') { dp.impulsiva = sv; $('#reparacio').hidden = sv !== 'si'; missatgeFidel(); return; }
      if (sg === 'pirOr') { pirOr = sv; $('#pir').innerHTML = pirHTML(); return; }
      if (sg === 'reflexio') { reflexioVal = sv; return; }
      if (sg === 'cfLang') { cfLang = sv; return; }
      if (sg.charAt(0) === 'm') { manual[sg] = sv; return; }
      return;
    }
    if (b.hasAttribute('data-check')) { toggle(dp.check, b.getAttribute('data-check')); b.setAttribute('aria-checked', String(dp.check.indexOf(b.getAttribute('data-check')) >= 0)); return; }
    if (b.hasAttribute('data-reparacio')) { dp.reparacio = !dp.reparacio; b.setAttribute('aria-checked', String(dp.reparacio)); return; }
    if (b.id === 'desaDespres') {
      var a2 = S.actual;
      registra({ tipus: 'despres', moment: 'despres', partit: a2 ? a2.id : null, compromisos: a2 ? a2.compromisos.slice() : [], activacio: dp.activacio, deteccio: dp.deteccio, ais: dp.ais,
        check: dp.check.slice(), impulsiva: dp.impulsiva, reparacio: dp.reparacio, reparacioNota: val('#repNota'), recordat: dp.fq1, acompanyat: dp.fq2,
        ajudat: val('#fq3'), repetir: val('#q6'), millorar: val('#q7') });
      S.actual = null; desa(); toast(t.despres.desat); go('registre'); return;
    }

    if (b.hasAttribute('data-pir')) { pirNiv = pirNiv === b.getAttribute('data-pir') ? null : b.getAttribute('data-pir'); $('#pir').innerHTML = pirHTML(); pirDetall(); var nb = $('[data-pir="' + b.getAttribute('data-pir') + '"]'); if (nb) nb.focus(); return; }
    /* ---- aprèn ---- */
    if (b.hasAttribute('data-resp')) {
      var l = trobaPer(t.llicons, ruta().arg), o = l.q.o[+b.getAttribute('data-resp')], fb = $('#fb');
      $$('[data-resp]').forEach(function (y) { y.setAttribute('aria-pressed', String(y === b)); });
      fb.className = 'fb on ' + (o.ok ? 'ok' : 'ko'); fb.textContent = o.fb; return;
    }
    if (b.hasAttribute('data-setmanal')) { fixaSetmanal(b.getAttribute('data-setmanal')); go('setmanal'); return; }

    /* ---- setmanal ---- */
    if (b.hasAttribute('data-objectiu')) { $$('[data-objectiu]').forEach(function (y) { y.setAttribute('aria-pressed', String(y === b)); }); $('#objPropi').value = ''; objectiuSel = b.getAttribute('data-objectiu'); return; }
    if (b.id === 'guardaSetm') { var tx = ($('#objPropi').value || '').trim() || objectiuSel; if (!tx) { toast(X().marcaUna); return; } fixaSetmanal(tx); objectiuSel = null; pinta(); return; }
    if (b.id === 'reflexioAra') { $('#reflexio').hidden = false; b.hidden = true; return; }
    if (b.id === 'renova' || b.id === 'nouSetm') {
      var act = S.setm.actual; if (!act) return;
      S.setm.hist.push({ t: act.t, desDe: act.desDe, fins: avui(), valoracio: reflexioVal, nota: val('#reflexioNota') });
      S.setm.actual = b.id === 'renova' ? { t: act.t, desDe: avui() } : null; reflexioVal = null; desa();
      toast(t.setmanal.gracies); go('setmanal'); pinta(); return;
    }

    /* ---- registre ---- */
    if (b.id === 'obreManual') { var mb = $('#manualBox'); mb.hidden = !mb.hidden; if (!mb.hidden) { manual = {}; mb.innerHTML = manualHTML(); } return; }
    if (b.id === 'desaManual') {
      registra({ tipus: 'manual', data: $('#mData').value || avui(), moment: manual.mMoment || 'durant', situacio: $('#mSit').value || null, activacio: manual.act != null ? manual.act : null,
        zones: $('#mZona').value ? [$('#mZona').value] : [], ais: manual.mAis || null, conducta: $('#mCond').value || null, impulsiva: manual.mImp || null,
        reparacio: manual.mRep === 'si', aprenentatge: val('#mApr') });
      toast(X().manualDesat); pinta(); return;
    }
    if (b.hasAttribute('data-del')) {
      if (!confirm(t.registre.confirmaEsborrar)) return;
      var did = b.getAttribute('data-del'), rd = trobaPer(S.reg, did);
      if (rd && S.actual && rd.partit === S.actual.id && rd.tipus === 'abans') S.actual = null; /* no deixar còpia de la preparació esborrada */
      S.reg = S.reg.filter(function (r) { return r.id !== did; }); desa(); pinta(); return;
    }
    if (b.id === 'expJson') { exportaJSON(); return; }
    if (b.id === 'expCsv') { exportaCSV(); return; }
    if (b.id === 'esborraTot') {
      if (!confirm(t.privacitat.confirma)) return;
      var lang = S.lang; lsDel(); S = clone(BASE); S.lang = lang; toast(t.privacitat.esborrat); go('inici'); pinta(); return;
    }
    if (b.id === 'desaPractica') {
      registra({ tipus: 'manual', moment: S.actual ? 'durant' : 'abans', zones: practicaLliure.groc.slice(), zonesBlau: practicaLliure.blau.slice(), ais: 'si', percepcio: practicaLliure.percepcio, partit: S.actual ? S.actual.id : null });
      toast(t.ui.desat); go('inici'); return;
    }

    /* ---- club ---- */
    if (b.id === 'copiaUrl') { copia(enllacClub(), t.club.copiat); return; }
    if (b.id === 'waUrl') { comparteix(t.club.compartirText + '\n' + enllacClub()); return; }
    if (b.id === 'baixaQr') { baixaQR(); return; }
    if (b.id === 'cfGenera') {
      var c = netejaClub({ nom: $('#cfNom').value, color: $('#cfColor').value, idioma: cfLang || S.lang, missatge: ($('#cfMsg').value || '').trim() });
      if (!c) { toast(t.club.nom + '?'); return; }
      S.club = c; desa(); aplicaClub(); pinta(); setTimeout(function () { var q = $('#qr'); if (q) q.scrollIntoView({ block: 'center' }); }, 50); return;
    }
  });
  var objectiuSel = null, reflexioVal = null;
  function val(sel) { var e = $(sel); return e ? (e.value || '').trim().slice(0, 300) || null : null; }
  function toggle(arr, v) { var i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); }
  function marcaSeg(b) { $$('[data-seg="' + b.getAttribute('data-seg') + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
  function missatgeFidel() {
    var p = T().pinya, box = $('#fidelMsg'); if (!box) return;
    var dificil = dp.fq1 === 'no' || dp.fq1 === 'part' || dp.fq2 === 'no' || dp.impulsiva === 'si';
    var bo = dp.fq1 === 'si' && dp.fq2 !== 'no' && dp.impulsiva !== 'si';
    box.innerHTML = dificil ? '<div class="card terra" style="margin:10px 0 0"><p style="margin:0">' + esc(p.compassiu) + '</p></div>' : bo ? '<div class="card verd" style="margin:10px 0 0"><p style="margin:0">' + esc(p.bo) + '</p></div>' : '';
  }
  document.addEventListener('input', function (ev) { if (ev.target.id === 'objPropi' && ev.target.value) { objectiuSel = null; $$('[data-objectiu]').forEach(function (y) { y.setAttribute('aria-pressed', 'false'); }); } });
  document.addEventListener('keydown', function (ev) {
    var m = $('#modal');
    if (!m.classList.contains('on')) return;
    if (ev.key === 'Escape') { tancaModal(); return; }
    if (ev.key === 'Tab') { /* manté el focus dins el diàleg */
      var f = $$('#sheet button:not([disabled]), #sheet select, #sheet [tabindex="0"], #sheet textarea').filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (ev.shiftKey && document.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
      else if (!ev.shiftKey && document.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
    }
  });
  $('#modal').addEventListener('click', function (ev) { if (ev.target === this) tancaModal(); });

  /* Sincronització entre pestanyes: si una altra pestanya esborra o canvia les dades,
     aquesta recarrega l'estat i no pot tornar a escriure dades velles. */
  window.addEventListener('storage', function (ev) {
    if (ev.key !== LS && ev.key !== null) return;
    var lang = S.lang, abansId = S.actual ? S.actual.id : null, abansRol = S.rol;
    S = carrega(); if (!S.lang) S.lang = lang;
    var esborrat = !S.avis, canviSessio = (S.actual ? S.actual.id : null) !== abansId || S.rol !== abansRol;
    /* Canvis ordinaris (p. ex. una lliçó llegida): s'actualitza l'estat sense tocar
       la pausa ni els formularis oberts. Només es redibuixa si s'ha esborrat tot o
       ha canviat el partit en curs o el rol. */
    if (!esborrat && !canviSessio) return;
    if ($('#modal').classList.contains('on')) tancaModal();
    pinta();
  });

  /* ================= ARRENCADA ================= */
  llegeixURL(function () { if (!S.lang) S.lang = (navigator.language || 'ca').slice(0, 2) === 'es' ? 'es' : 'ca'; pinta(); });
})();
