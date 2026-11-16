/* APRENS · El quadern de l'entrenador — aplicació
   Programa de seguiment setmanal (PSS) per a equips d'esport de base.
   L'entrenador, com a observador directe, fixa objectius de procés, pren notes
   i fa una entrevista setmanal breu. Les dades generen tendències i avisos
   orientatius per al psicòleg del club.
   Sense servidor ni comptes: tot queda en aquest dispositiu (localStorage),
   i només surt dins un fitxer xifrat (AES-GCM) amb una contrasenya que
   l'entrenador acorda amb el psicòleg. */
(function () {
  'use strict';
  var C = window.QE;
  C.escalaPss = C.escalaJug;

  /* ================= ESTAT ================= */
  var LS = 'aprens_entrenador_v1';
  var BASE = { v: 1, lang: 'ca', avis: false, club: null, psiLl: null, equip: null, jug: [], setm: {}, notes: [],
    cfg: { climaOff: {}, dimsOff: {}, pssOff: {}, dimsExtra: [], llindars: { fin: 3, min: 2, ego: 3 }, recorda: { dia: 0, hora: '20:00' } } };
  var MEM = null, NO_DESA = false;
  var PREP = null; /* fitxer xifrat preparat, per si el navegador demana un segon toc per compartir */
  function lsGet() { if (MEM != null) return MEM; try { return localStorage.getItem(LS); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LS, v); MEM = null; return true; } catch (e) { MEM = v; return false; } }
  function lsDel() { try { localStorage.removeItem(LS); } catch (e) { /* res */ } MEM = null; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  /* Valida i neteja dades (també les d'un fitxer importat): identificadors amb format
     estricte, números com a números i textos com a text. Res d'un fitxer no arriba a
     l'HTML sense passar per aquí. */
  var RID = /^[a-z0-9]{1,24}$/, RW = /^\d{4}-W\d{2}$/;
  function txt(v, n) { return typeof v === 'string' ? v.slice(0, n) : ''; }
  function num(v, mn, mx) { if (v == null || v === '' || typeof v === 'boolean') return null; v = Number(v); return isFinite(v) ? Math.max(mn, Math.min(mx, Math.round(v))) : null; }
  function mapaNum(o, mn, mx, claus) {
    var r = {}; if (!o || typeof o !== 'object') return r;
    Object.keys(o).forEach(function (k) { if (claus && claus.indexOf(k) < 0) return; if (!RID.test(k.toLowerCase())) return; var v = num(o[k], mn, mx); if (v != null) r[k] = v; });
    return r;
  }
  function neteja(b) {
    var ids = {};
    b.jug = b.jug.filter(function (j) { return j && typeof j.id === 'string' && RID.test(j.id) && !ids[j.id] && (ids[j.id] = true); })
      .map(function (j) { return { id: j.id, nom: txt(j.nom, 30) || '—', dorsal: txt(String(j.dorsal == null ? '' : j.dorsal), 4), g: j.g === 'f' ? 'f' : 'm', actiu: j.actiu !== false }; });
    var dimsIds = C.dims.map(function (x) { return x.id; });
    b.cfg.dimsExtra = b.cfg.dimsExtra.filter(function (x) { return x && /^x[a-z0-9]{1,24}$/.test(x.id); }).map(function (x) { return { id: x.id, t: txt(x.t, 60) }; });
    dimsIds = dimsIds.concat(b.cfg.dimsExtra.map(function (x) { return x.id; }));
    var pssIds = []; C.pss.forEach(function (bl) { bl.items.forEach(function (i) { pssIds.push(i.id); }); });
    var senIds = C.senyals.map(function (x) { return x.id; });
    var miIds = []; C.entrenador.forEach(function (f) { f.items.forEach(function (i) { miIds.push(i.id); }); });
    var areaIds = C.arees.map(function (x) { return x.id; });
    ['climaOff', 'dimsOff', 'pssOff'].forEach(function (k) { var o = {}; Object.keys(b.cfg[k] || {}).forEach(function (x) { if (RID.test(x.toLowerCase()) && b.cfg[k][x]) o[x] = true; }); b.cfg[k] = o; });
    var L = b.cfg.llindars || {}; b.cfg.llindars = { fin: num(L.fin, 2, 8) || 3, min: num(L.min, 1, 8) || 2, ego: num(L.ego, 1, 4) || 3 };
    b.cfg.clauPsi = txt(b.cfg.clauPsi, 200);
    b.cfg.enviat = txt(b.cfg.enviat, 30);
    var R = b.cfg.recorda || {}; b.cfg.recorda = { dia: num(R.dia, 0, 6) || 0, hora: /^\d{2}:\d{2}$/.test(R.hora) ? R.hora : '20:00' };
    var setm = {};
    Object.keys(b.setm).forEach(function (w) {
      var sm = b.setm[w]; if (!RW.test(w) || !sm || typeof sm !== 'object') return;
      var o = { obj: (Array.isArray(sm.obj) ? sm.obj : []).filter(function (x) { return x && areaIds.indexOf(x.a) >= 0; }).slice(0, 3).map(function (x) { return { a: x.a, t: txt(x.t, 120) }; }), ent: null };
      var e = sm.ent;
      if (e && typeof e === 'object') {
        var jug = {};
        Object.keys(e.jug || {}).forEach(function (id) {
          var r = e.jug[id]; if (!ids[id] || !r || typeof r !== 'object') return;
          jug[id] = { d: mapaNum(r.d, -2, 1, dimsIds), o: r.o === 't' || r.o === 'e' ? r.o : '', as: r.as == null ? null : num(r.as, 0, 7),
            s: (Array.isArray(r.s) ? r.s : []).filter(function (x) { return senIds.indexOf(x) >= 0; }), n: txt(r.n, 400), c: mapaNum(r.c, -2, 20, pssIds) };
        });
        o.ent = { n: num(e.n, 0, 7) || 0, partit: !!e.partit, objV: (Array.isArray(e.objV) ? e.objV : []).slice(0, 3).map(function (v) { return num(v, 0, 3); }),
          clima: mapaNum(e.clima, 0, 3, C.clima.map(function (x) { return x.id; })), mi: mapaNum(e.mi, 0, 3, miIds), temps: e.temps == null ? null : num(e.temps, 0, 3),
          jug: jug, r1: txt(e.r1, 600), r2: txt(e.r2, 600), fet: !!e.fet, data: txt(e.data, 10) };
      }
      setm[w] = o;
    });
    b.setm = setm;
    b.notes = b.notes.filter(function (n) { return n && typeof n.id === 'string' && RID.test(n.id) && RW.test(n.w); })
      .map(function (n) { return { id: n.id, w: n.w, j: ids[n.j] ? n.j : '', a: areaIds.indexOf(n.a) >= 0 ? n.a : '', ctx: n.ctx === 'par' ? 'par' : 'ent', t: txt(n.t, 600), data: txt(n.data, 10) }; });
    if (b.equip && typeof b.equip === 'object') {
      var et = b.equip.etapa;
      b.equip = { id: typeof b.equip.id === 'string' && RID.test(b.equip.id) ? b.equip.id : uid(), nom: txt(b.equip.nom, 60) || '—', esport: txt(b.equip.esport, 40), etapa: C.etapes.some(function (x) { return x.id === et; }) ? et : 'formacio', temporada: txt(b.equip.temporada, 20), club: txt(b.equip.club, 60) };
    } else b.equip = null;
    b.lang = b.lang === 'es' ? 'es' : 'ca';
    b.avis = b.avis === true;
    b.club = netejaClub(b.club);
    var P = b.psiLl; b.psiLl = P && typeof P === 'object' ? { fin: num(P.fin, 2, 8) || 3, min: num(P.min, 1, 8) || 2, ego: num(P.ego, 1, 4) || 3 } : null;
    return b;
  }
  /* ---------- Club (personalització, mateixos fitxers que «Els pares també juguen») ---------- */
  var CLUBS = '../esport-base/';
  function netejaClub(c) {
    if (!c || typeof c !== 'object') return null;
    var o = {};
    if (typeof c.nom === 'string') o.nom = c.nom.replace(/[<>]/g, '').trim().slice(0, 60);
    if (typeof c.curt === 'string') o.curt = c.curt.replace(/[<>]/g, '').trim().slice(0, 24);
    if (typeof c.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.color)) o.color = c.color;
    if (c.idioma === 'ca' || c.idioma === 'es') o.idioma = c.idioma;
    if (typeof c.escut === 'string' && /^clubs\/[a-z0-9-]+\.(png|svg|webp|jpg)$/.test(c.escut)) o.escut = c.escut;
    if (typeof c.slug === 'string' && /^[a-z0-9-]{1,40}$/.test(c.slug)) o.slug = c.slug;
    if (c.icones === true) o.icones = true;
    return o.nom ? o : null;
  }
  /* Configuració del quadern que el psicòleg pot fixar per a tot el club (camp «quadern» del JSON del club) */
  function configClub(q, cfg) {
    if (!q || typeof q !== 'object') return;
    var ll = q.llindars;
    if (ll && typeof ll === 'object') cfg.llindars = { fin: num(ll.fin, 2, 8) || 3, min: num(ll.min, 1, 8) || 2, ego: num(ll.ego, 1, 4) || 3 };
    ['climaOff', 'dimsOff', 'pssOff'].forEach(function (k) { if (Array.isArray(q[k])) q[k].forEach(function (id) { if (typeof id === 'string' && RID.test(id.toLowerCase())) cfg[k][id] = true; }); });
    cfg.dimsExtra = cfg.dimsExtra.filter(function (x) { return x.id.indexOf('xclub') !== 0; });
    if (Array.isArray(q.conductes)) q.conductes.slice(0, 10).forEach(function (t, i) {
      if (typeof t === 'string' && t.trim()) cfg.dimsExtra.push({ id: 'xclub' + i, t: t.trim().slice(0, 60) });
    });
  }
  function normalitza(d) {
    var b = clone(BASE);
    if (d && typeof d === 'object') Object.keys(d).forEach(function (k) { b[k] = d[k]; });
    if (!Array.isArray(b.jug)) b.jug = [];
    if (!b.setm || typeof b.setm !== 'object') b.setm = {};
    if (!Array.isArray(b.notes)) b.notes = [];
    var cf = clone(BASE.cfg); if (b.cfg) Object.keys(b.cfg).forEach(function (k) { cf[k] = b.cfg[k]; });
    if (!cf.llindars) cf.llindars = clone(BASE.cfg.llindars);
    if (!Array.isArray(cf.dimsExtra)) cf.dimsExtra = [];
    if (!cf.pssOff || typeof cf.pssOff !== 'object') cf.pssOff = {};
    b.cfg = cf;
    return neteja(b);
  }
  function carrega() { try { return normalitza(JSON.parse(lsGet())); } catch (e) { return clone(BASE); } }
  var S = carrega();
  function desa() {
    PREP = null; /* qualsevol canvi invalida un fitxer preparat i no enviat */
    if (!S.avis) return;
    var ok = lsSet(JSON.stringify(S));
    if (!ok && !NO_DESA) { NO_DESA = true; setTimeout(render, 0); }
    if (ok) NO_DESA = false;
  }

  /* Vista del psicòleg: equips oberts des d'un fitxer xifrat. Només en memòria. */
  /* Panel del psicòleg: equips rebuts, desats xifrats amb el codi d'accés del psicòleg.
     PANEL.key només existeix en memòria mentre el panel és obert. */
  var PV = { llista: [], meta: [], act: -1 };
  var PANEL = { key: null, salt: null, claus: [] };
  function D() { return PV.act >= 0 ? PV.llista[PV.act] : S; }
  function lectura() { return PV.act >= 0; }
  function psi() { return !!PANEL.key; }

  /* ================= IDIOMA ================= */
  function tx(o) { if (o == null) return ''; if (typeof o === 'string') return o; return o[S.lang] || o.ca || ''; }
  var U = {
    ca: {
      app: "El quadern de l'entrenador", sub: 'APRENS · Seguiment setmanal', salta: 'Anar al contingut',
      navSetm: 'Setmana', navTend: 'Tendències', navPlant: 'Plantilla', navComp: 'Compartir', navMet: 'Mètode',
      avisT: 'Abans de començar', avisAcc: 'Ho he llegit i hi estic d\'acord',
      avis: ["Aquesta eina és per a l'entrenador o l'entrenadora, com a observador directe dels entrenaments i dels partits. Cada setmana fixa uns objectius de procés, pren alguna nota i fa una entrevista breu (uns cinc minuts) sobre l'equip, sobre la seva manera d'entrenar i sobre cada jugador.",
        "Totes les dades queden en aquest dispositiu. No hi ha comptes ni servidor. Només surten si tu ho decideixes, dins un fitxer xifrat amb una contrasenya que acordes amb el psicòleg del club.",
        "Fes servir un nom curt o un àlies i el dorsal, no el nom complet. El club ha d'haver informat les famílies d'aquest seguiment i del paper del psicòleg.",
        "Els avisos són orientatius, no diagnostiquen res. Serveixen perquè el psicòleg del club pugui parlar amb tu a temps i, si cal, observar directament."],
      equipT: "L'equip", nomEquip: "Nom de l'equip", esport: 'Esport', etapa: 'Etapa evolutiva', temporada: 'Temporada', club: 'Club (opcional)',
      desa: 'Desa', cancel: 'Cancel·la', continua: 'Continua', enrere: 'Enrere', seguent: 'Següent', tanca: 'Tanca', esborra: 'Esborra', edita: 'Edita', afegeix: 'Afegeix',
      setmana: 'Setmana', del: 'del', objT: 'Objectius de la setmana', objBuit: 'Encara no has fixat els objectius d\'aquesta setmana.',
      objFixa: 'Fixa els objectius', objEdita: 'Canvia els objectius', objQ: 'Tria entre un i tres objectius de procés. Són el punt de referència de l\'entrevista.',
      objPropi: 'Objectiu propi', objSug: 'Idees per a aquesta àrea', objMax: 'Màxim tres objectius.', objArea: 'Àrea',
      entT: 'Entrevista setmanal', entFeta: 'Entrevista feta', entPend: 'Pendent', entFes: 'Fes l\'entrevista', entRev: 'Revisa l\'entrevista', entDur: 'Uns 5 minuts',
      notaT: 'Nota ràpida', notaFes: 'Afegeix una nota', notaQ: 'Què has observat?', notaJug: 'Jugador (opcional)', notaEquip: 'Tot l\'equip', notaCtx: 'On', ctxEnt: 'Entrenament', ctxPar: 'Partit', notesSetm: 'Notes d\'aquesta setmana', notaDesada: 'Nota desada.',
      setmAnt: 'Setmana anterior', setmSeg: 'Setmana següent', setmAct: 'Torna a aquesta setmana',
      pas: 'Pas', de: 'de',
      e0T: 'Aquesta setmana', e0Q: 'Quantes sessions d\'entrenament heu fet?', e0P: 'Hi ha hagut partit?', si: 'Sí', no: 'No',
      e0N: 'No et demanam el resultat del partit: aquí ens interessa el procés.',
      e1T: 'Els objectius', e1Q: 'Fins a quin punt s\'han treballat i assolit?', e1Buit: 'Aquesta setmana no hi havia objectius fixats. Pots continuar igualment.',
      e2T: 'El clima de l\'equip', e2Q: 'Com has vist l\'equip aquesta setmana?',
      e3T: 'La meva manera d\'entrenar', e3Q: 'Fitxa d\'observació del CE Constància. Respon pensant en el conjunt de la setmana.',
      e4T: 'Els jugadors', e4Q: 'Davant cada ítem, demana\'t quins jugadors s\'han apartat aquesta setmana de la normalitat de l\'equip. Tots parteixen de 2: toca només els que han estat per davall (1), els que han destacat (3) o aquells amb qui ha passat alguna cosa significativa (0).',
      massaMarcats: 'A «{x}» has marcat més de la meitat de l\'equip. Recorda la clau: la majoria són 2, i només alguns jugadors tenen 0, 1 o 3.',
      e5T: 'Per tancar', e5a: 'Què m\'emport d\'aquesta setmana?', e5b: 'Què vull provar la setmana que ve?',
      entDesa: 'Desa l\'entrevista', entDesada: 'Entrevista desada. Gràcies.',
      habitual: 'Normalitat (2)', canvis: 'canvis', assist: 'Assistència', sessions: 'sessions', senyals: 'Senyals', notaJ: 'Nota', notaPriv: 'Es comparteix amb el psicòleg, no amb la família.',
      tendT: 'Tendències', tendEquip: 'L\'equip', tendJug: 'Jugadors', tendAv: 'Avisos per al psicòleg',
      clima: 'Clima d\'equip', estil: 'Estil orientat a l\'aprenentatge', tasca: '% jugadors orientats a la tasca',
      pocsDades: 'Encara hi ha poques entrevistes. Les tendències apareixen a partir de dues setmanes.',
      avBuit: 'Cap avís, ara per ara.', avNota: 'Avisos orientatius, no diagnòstics. Serveixen per parlar-ne amb el psicòleg i, si cal, observar directament.',
      avAlt: 'Revisar aviat', avSeg: 'Seguiment', avPos: 'Destaca en positiu', avEquip: 'Equip',
      plantT: 'Plantilla', plantBuit: 'Encara no hi ha jugadors.', nom: 'Nom curt o àlies', dorsal: 'Dorsal', tracte: 'Per als informes', nin: 'Ell', nina: 'Ella', actiu: 'Actiu', baixa: 'Baixa',
      plantNota: 'Un nom curt o un àlies i el dorsal són suficients. No hi posis llinatges ni dades de salut.',
      jugAfegit: 'Jugador afegit.', jugQ: 'Afegeix jugadors', unPerLinia: 'Pots enganxar-ne molts, un per línia (nom i dorsal).',
      compT: 'Compartir i còpies', expT: 'Exporta per al psicòleg', expQ: 'Crea un fitxer xifrat amb totes les dades de l\'equip. Acorda la contrasenya amb el psicòleg del club, en persona o per telèfon, i no l\'enviïs pel mateix canal que el fitxer.',
      pass: 'Contrasenya (mínim 8 caràcters)', pass2: 'Repeteix la contrasenya', passNo: 'Les contrasenyes no coincideixen o són massa curtes.', expBtn: 'Crea el fitxer xifrat', expOk: 'Fitxer creat.',
      impT: 'Obre un fitxer', impQ: 'Psicòleg: obre aquí el fitxer d\'un entrenador per veure\'n les tendències i els avisos. No es desa en aquest dispositiu.', impQ2: 'Entrenador: també serveix per recuperar una còpia teva en un mòbil nou.',
      impFitxer: 'Fitxer', impVeure: 'Obre com a psicòleg', impRec: 'Recupera com a còpia meva', impErr: 'No s\'ha pogut obrir. Revisa la contrasenya i el fitxer.', impOk: 'Fitxer obert.', recOk: 'Còpia recuperada.',
      recConf: 'Això substituirà les dades d\'aquest dispositiu per les del fitxer. Vols continuar?',
      vistaPsi: 'Vista del psicòleg', vistaNoDesa: 'Només lectura. No es desa en aquest dispositiu.', tancaVista: 'Tanca la vista', equipsOberts: 'Equips oberts',
      recT: 'Recordatori setmanal', recQ: 'Afegeix al calendari un recordatori setmanal per fer l\'entrevista.', recDia: 'Dia', recHora: 'Hora', recBtn: 'Descarrega el recordatori',
      dies: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
      ajT: 'Ítems i avisos', ajQ: 'Amb el psicòleg del club podeu adaptar què s\'observa i quan salta un avís.',
      ajClima: 'Ítems de clima d\'equip', ajDims: 'Conductes que s\'observen en cada jugador', ajExtra: 'Conducta pròpia del club', ajExtraQ: 'Ex.: Anima els companys després d\'una errada',
      ajLl: 'Llindars dels avisos', ajFin: 'Setmanes que es miren', ajMin: 'Setmanes per davall de la mitjana (1 o 0) per avisar', ajEgo: 'Setmanes centrat en el resultat (de les darreres 4)',
      perillT: 'Esborra totes les dades', perillQ: 'Esborra l\'equip, la plantilla i totes les setmanes d\'aquest dispositiu. No es pot desfer.', perillConf: 'Segur que vols esborrar-ho tot? Abans pots crear un fitxer xifrat de còpia.',
      infT: 'Informe per a la família', infQ: 'Esborrany a partir de les darreres 12 setmanes, amb una taula que compara la mitjana del jugador amb la de l\'equip. Revisa\'l i ajusta\'l abans d\'enviar-lo. No hi apareixen els senyals ni les notes.',
      infImp: 'Imprimeix o desa en PDF', infCopia: 'Copia el text', copiat: 'Copiat.',
      jugDet: 'Fitxa del jugador', orientRow: 'Atenció', assistRow: 'Assistència', notesJug: 'Notes', senyalsJug: 'Senyals marcats',
      metT: 'El mètode', confEquip: 'Dades de l\'equip', setmanes: 'setmanes', ultima: 'Darrera entrevista', mai: 'cap',
      noDesaT: 'No s\'ha pogut desar en aquest dispositiu', noDesa: 'El navegador no deixa guardar (mode privat o memòria plena). Els canvis es perdran en tancar. Crea ara un fitxer xifrat de còpia.', psiNoExp: 'Estàs a la vista del psicòleg. Tanca-la per exportar o recuperar les dades d\'aquest dispositiu.', infPoc: 'Encara no hi ha prou setmanes de seguiment (mínim tres) per fer un informe a la família.',
      copiaEnll: 'Copia l\'enllaç', ajPsiQ: 'Com a psicòleg, aquests llindars s\'apliquen als equips que obres en aquest dispositiu. Ajusta\'ls a mesura que vegis com funcionen.', enllT: 'Enllaç per als entrenadors del club', enllQ: 'Compartiu aquest enllaç amb els entrenadors: obrirà el quadern amb l\'escut i la configuració del club.',
      navPanel: 'Panel', navInf: 'Informes', panelT: 'Panel del psicòleg', tornaPanel: '← Panel del psicòleg', psiT: 'Sóc el psicòleg del club', psiQ: 'El panel reuneix els equips de tots els entrenadors del club, amb els avisos i els informes per a les famílies.',
      panelNouQ: 'El panel reuneix els fitxers que t\'envien els entrenadors. Es desa xifrat en aquest dispositiu amb el teu codi d\'accés, que només coneixes tu.', panelCrea: 'Crea el panel', codi: 'Codi d\'accés (mínim 8 caràcters)', codi2: 'Repeteix el codi',
      panelAvisCodi: 'Si oblides el codi, les dades del panel no es poden recuperar. Guarda\'l bé i fes còpies del panel de tant en tant.', panelCreat: 'Panel creat.', panelObreQ: 'Escriu el teu codi d\'accés per obrir el panel.', panelObre: 'Obre el panel', panelErr: 'Codi incorrecte o fitxer no vàlid.',
      panelOblit: 'Si has oblidat el codi, només pots esborrar el panel d\'aquest dispositiu i començar de nou (o recuperar una còpia).', panelEsborra: 'Esborra el panel d\'aquest dispositiu', panelEsborraConf: 'Segur que vols esborrar el panel? Es perden tots els equips rebuts que no tenguis en còpia.',
      panelRecT: 'Recupera una còpia del panel', panelRecBtn: 'Recupera', panelImpT: 'Rep els fitxers dels entrenadors', panelImpQ: 'Pots triar-ne diversos alhora. Si un equip ja hi és, s\'actualitza amb el fitxer més nou.', panelImpPass: 'Clau (només si és nova; les desades es proven soles)', panelImpBtn: 'Importa',
      panelImpRes: 'Equips nous: {n} · actualitzats: {a} · no oberts o antics: {e}', panelSenseEq: 'Encara no hi ha cap equip. Quan els entrenadors t\'enviïn el fitxer, importa\'l aquí.', panelEquipsT: 'Equips', panelAvClub: 'Avisos del club per revisar aviat',
      panelClausT: 'Claus dels clubs', panelClausQ: 'Dona a cada entrenador la clau del seu club, en persona o per telèfon. Les claus queden desades xifrades dins el panel i s\'usen soles en importar.', nClaus: 'claus desades', clauNova: 'Clau nova', treuClaus: 'Esborra les claus', treuClausConf: 'Esborrar totes les claus desades?',
      panelCopiaT: 'Còpia i sortida', panelCopiaQ: 'La còpia és el mateix fitxer xifrat amb el teu codi. Tanca el panel quan acabis.', panelCopiaBtn: 'Descarrega una còpia del panel', panelTanca: 'Tanca el panel', treuEquip: 'Treu', treuConf: 'Treure aquest equip del panel?',
      informesT: 'Informes per a les famílies', informesQ: 'Un esborrany per jugador a partir de les darreres 12 setmanes, per revisar i imprimir o desar en PDF tots alhora.', imprimeixTots: 'Imprimeix tots (un per pàgina)',
      enviaT: 'Envia al psicòleg', enviaQ: 'Desa una sola vegada la clau que t\'ha donat el psicòleg del club. Després, cada setmana, envia-li les dades xifrades per WhatsApp o correu.', enviaQ2: 'Les dades surten xifrades amb la clau del psicòleg del club.', clauPsi: 'Clau del psicòleg del club', clauDesa: 'Desa la clau', clauDesada: 'Clau desada.',
      enviaBtn: 'Envia al psicòleg', enviaCanvia: 'Canvia la clau', enviat: 'Darrer enviament', enviaPrep: 'Fitxer xifrat preparat. Toca «Comparteix» i tria WhatsApp o el correu del psicòleg.', enviaComp: 'Comparteix', enviaBaixa: 'Descarrega el fitxer', enviaBaixat: 'Fitxer descarregat. Adjunta\'l en un missatge al psicòleg.', enviaMsg: 'Seguiment setmanal',
      panelNoDesa: 'El navegador no deixa desar el panel. Descarrega ara una còpia: es fa amb les dades actuals.', impRecT: 'Recupera una còpia teva', panelLect: 'Només lectura: les dades d\'aquest equip les escriu l\'entrenador.',
      grupT: 'Informe de grup', grupQ: 'Per a l\'entrenador i la coordinació: la mitjana de l\'equip a cada ítem, cada jugador, el clima, l\'estil d\'entrenament i els avisos de les darreres 12 setmanes.', grupEquipT: 'L\'equip, ítem per ítem', grupJugT: 'Cada jugador', colItem: 'Ítem', colEquip: 'Mitjana de l\'equip', periode: 'Període', clauQual: 'Mitjana de 0 a 3: 0-1 Alerta · 1-2 Regular · 2-2,4 Normal · 2,5-3 Destacat',
      socPsi: 'Sóc el psicòleg: obre un fitxer', pssT: 'Fitxa APRENS ESPORT: conductes concretes', pssQ: 'Opcional. Marca només el que s\'ha apartat de la normalitat.', conductaRep: 'Conducta repetida', conductaPos: 'Conducta positiva repetida', ajPss: 'Fitxa APRENS ESPORT (conductes concretes)', vegades: 'vegades',
      senseEnt: 'setmanes sense entrevista', taula: 'Veure les dades en taula', mitjana: 'mitjana', avui: 'avui'
    },
    es: {
      app: 'El cuaderno del entrenador', sub: 'APRENS · Seguimiento semanal', salta: 'Ir al contenido',
      navSetm: 'Semana', navTend: 'Tendencias', navPlant: 'Plantilla', navComp: 'Compartir', navMet: 'Método',
      avisT: 'Antes de empezar', avisAcc: 'Lo he leído y estoy de acuerdo',
      avis: ['Esta herramienta es para el entrenador o la entrenadora, como observador directo de los entrenamientos y los partidos. Cada semana fija unos objetivos de proceso, toma alguna nota y hace una entrevista breve (unos cinco minutos) sobre el equipo, sobre su manera de entrenar y sobre cada jugador.',
        'Todos los datos quedan en este dispositivo. No hay cuentas ni servidor. Solo salen si tú lo decides, dentro de un archivo cifrado con una contraseña que acuerdas con el psicólogo del club.',
        'Usa un nombre corto o un alias y el dorsal, no el nombre completo. El club debe haber informado a las familias de este seguimiento y del papel del psicólogo.',
        'Los avisos son orientativos, no diagnostican nada. Sirven para que el psicólogo del club pueda hablar contigo a tiempo y, si hace falta, observar directamente.'],
      equipT: 'El equipo', nomEquip: 'Nombre del equipo', esport: 'Deporte', etapa: 'Etapa evolutiva', temporada: 'Temporada', club: 'Club (opcional)',
      desa: 'Guardar', cancel: 'Cancelar', continua: 'Continuar', enrere: 'Atrás', seguent: 'Siguiente', tanca: 'Cerrar', esborra: 'Borrar', edita: 'Editar', afegeix: 'Añadir',
      setmana: 'Semana', del: 'del', objT: 'Objetivos de la semana', objBuit: 'Todavía no has fijado los objetivos de esta semana.',
      objFixa: 'Fija los objetivos', objEdita: 'Cambia los objetivos', objQ: 'Elige entre uno y tres objetivos de proceso. Son el punto de referencia de la entrevista.',
      objPropi: 'Objetivo propio', objSug: 'Ideas para esta área', objMax: 'Máximo tres objetivos.', objArea: 'Área',
      entT: 'Entrevista semanal', entFeta: 'Entrevista hecha', entPend: 'Pendiente', entFes: 'Haz la entrevista', entRev: 'Revisa la entrevista', entDur: 'Unos 5 minutos',
      notaT: 'Nota rápida', notaFes: 'Añade una nota', notaQ: '¿Qué has observado?', notaJug: 'Jugador (opcional)', notaEquip: 'Todo el equipo', notaCtx: 'Dónde', ctxEnt: 'Entrenamiento', ctxPar: 'Partido', notesSetm: 'Notas de esta semana', notaDesada: 'Nota guardada.',
      setmAnt: 'Semana anterior', setmSeg: 'Semana siguiente', setmAct: 'Vuelve a esta semana',
      pas: 'Paso', de: 'de',
      e0T: 'Esta semana', e0Q: '¿Cuántas sesiones de entrenamiento habéis hecho?', e0P: '¿Ha habido partido?', si: 'Sí', no: 'No',
      e0N: 'No te pedimos el resultado del partido: aquí nos interesa el proceso.',
      e1T: 'Los objetivos', e1Q: '¿Hasta qué punto se han trabajado y conseguido?', e1Buit: 'Esta semana no había objetivos fijados. Puedes continuar igualmente.',
      e2T: 'El clima del equipo', e2Q: '¿Cómo has visto al equipo esta semana?',
      e3T: 'Mi manera de entrenar', e3Q: 'Ficha de observación del CE Constància. Responde pensando en el conjunto de la semana.',
      e4T: 'Los jugadores', e4Q: 'Ante cada ítem, pregúntate qué jugadores se han apartado esta semana de la normalidad del equipo. Todos parten de 2: toca solo a los que han estado por debajo (1), a los que han destacado (3) o a aquellos con los que ha pasado algo significativo (0).',
      massaMarcats: 'En «{x}» has marcado a más de la mitad del equipo. Recuerda la clave: la mayoría son 2, y solo algunos jugadores tienen 0, 1 o 3.',
      e5T: 'Para cerrar', e5a: '¿Qué me llevo de esta semana?', e5b: '¿Qué quiero probar la semana que viene?',
      entDesa: 'Guarda la entrevista', entDesada: 'Entrevista guardada. Gracias.',
      habitual: 'Normalidad (2)', canvis: 'cambios', assist: 'Asistencia', sessions: 'sesiones', senyals: 'Señales', notaJ: 'Nota', notaPriv: 'Se comparte con el psicólogo, no con la familia.',
      tendT: 'Tendencias', tendEquip: 'El equipo', tendJug: 'Jugadores', tendAv: 'Avisos para el psicólogo',
      clima: 'Clima de equipo', estil: 'Estilo orientado al aprendizaje', tasca: '% jugadores orientados a la tarea',
      pocsDades: 'Todavía hay pocas entrevistas. Las tendencias aparecen a partir de dos semanas.',
      avBuit: 'Ningún aviso, por ahora.', avNota: 'Avisos orientativos, no diagnósticos. Sirven para hablarlo con el psicólogo y, si hace falta, observar directamente.',
      avAlt: 'Revisar pronto', avSeg: 'Seguimiento', avPos: 'Destaca en positivo', avEquip: 'Equipo',
      plantT: 'Plantilla', plantBuit: 'Todavía no hay jugadores.', nom: 'Nombre corto o alias', dorsal: 'Dorsal', tracte: 'Para los informes', nin: 'Él', nina: 'Ella', actiu: 'Activo', baixa: 'Baja',
      plantNota: 'Un nombre corto o un alias y el dorsal son suficientes. No pongas apellidos ni datos de salud.',
      jugAfegit: 'Jugador añadido.', jugQ: 'Añade jugadores', unPerLinia: 'Puedes pegar muchos, uno por línea (nombre y dorsal).',
      compT: 'Compartir y copias', expT: 'Exporta para el psicólogo', expQ: 'Crea un archivo cifrado con todos los datos del equipo. Acuerda la contraseña con el psicólogo del club, en persona o por teléfono, y no la envíes por el mismo canal que el archivo.',
      pass: 'Contraseña (mínimo 8 caracteres)', pass2: 'Repite la contraseña', passNo: 'Las contraseñas no coinciden o son demasiado cortas.', expBtn: 'Crea el archivo cifrado', expOk: 'Archivo creado.',
      impT: 'Abre un archivo', impQ: 'Psicólogo: abre aquí el archivo de un entrenador para ver sus tendencias y avisos. No se guarda en este dispositivo.', impQ2: 'Entrenador: también sirve para recuperar una copia tuya en un móvil nuevo.',
      impFitxer: 'Archivo', impVeure: 'Abre como psicólogo', impRec: 'Recupera como copia mía', impErr: 'No se ha podido abrir. Revisa la contraseña y el archivo.', impOk: 'Archivo abierto.', recOk: 'Copia recuperada.',
      recConf: 'Esto sustituirá los datos de este dispositivo por los del archivo. ¿Quieres continuar?',
      vistaPsi: 'Vista del psicólogo', vistaNoDesa: 'Solo lectura. No se guarda en este dispositivo.', tancaVista: 'Cierra la vista', equipsOberts: 'Equipos abiertos',
      recT: 'Recordatorio semanal', recQ: 'Añade al calendario un recordatorio semanal para hacer la entrevista.', recDia: 'Día', recHora: 'Hora', recBtn: 'Descarga el recordatorio',
      dies: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      ajT: 'Ítems y avisos', ajQ: 'Con el psicólogo del club podéis adaptar qué se observa y cuándo salta un aviso.',
      ajClima: 'Ítems de clima de equipo', ajDims: 'Conductas que se observan en cada jugador', ajExtra: 'Conducta propia del club', ajExtraQ: 'Ej.: Anima a los compañeros tras un error',
      ajLl: 'Umbrales de los avisos', ajFin: 'Semanas que se miran', ajMin: 'Semanas por debajo de la media (1 o 0) para avisar', ajEgo: 'Semanas centrado en el resultado (de las últimas 4)',
      perillT: 'Borra todos los datos', perillQ: 'Borra el equipo, la plantilla y todas las semanas de este dispositivo. No se puede deshacer.', perillConf: '¿Seguro que quieres borrarlo todo? Antes puedes crear un archivo cifrado de copia.',
      infT: 'Informe para la familia', infQ: 'Borrador a partir de las últimas 12 semanas, con una tabla que compara la media del jugador con la del equipo. Revísalo y ajústalo antes de enviarlo. No aparecen las señales ni las notas.',
      infImp: 'Imprime o guarda en PDF', infCopia: 'Copia el texto', copiat: 'Copiado.',
      jugDet: 'Ficha del jugador', orientRow: 'Atención', assistRow: 'Asistencia', notesJug: 'Notas', senyalsJug: 'Señales marcadas',
      metT: 'El método', confEquip: 'Datos del equipo', setmanes: 'semanas', ultima: 'Última entrevista', mai: 'ninguna',
      noDesaT: 'No se ha podido guardar en este dispositivo', noDesa: 'El navegador no deja guardar (modo privado o memoria llena). Los cambios se perderán al cerrar. Crea ahora un archivo cifrado de copia.', psiNoExp: 'Estás en la vista del psicólogo. Ciérrala para exportar o recuperar los datos de este dispositivo.', infPoc: 'Todavía no hay suficientes semanas de seguimiento (mínimo tres) para hacer un informe a la familia.',
      copiaEnll: 'Copia el enlace', ajPsiQ: 'Como psicólogo, estos umbrales se aplican a los equipos que abres en este dispositivo. Ajústalos a medida que veas cómo funcionan.', enllT: 'Enlace para los entrenadores del club', enllQ: 'Compartid este enlace con los entrenadores: abrirá el cuaderno con el escudo y la configuración del club.',
      navPanel: 'Panel', navInf: 'Informes', panelT: 'Panel del psicólogo', tornaPanel: '← Panel del psicólogo', psiT: 'Soy el psicólogo del club', psiQ: 'El panel reúne los equipos de todos los entrenadores del club, con los avisos y los informes para las familias.',
      panelNouQ: 'El panel reúne los archivos que te envían los entrenadores. Se guarda cifrado en este dispositivo con tu código de acceso, que solo conoces tú.', panelCrea: 'Crea el panel', codi: 'Código de acceso (mínimo 8 caracteres)', codi2: 'Repite el código',
      panelAvisCodi: 'Si olvidas el código, los datos del panel no se pueden recuperar. Guárdalo bien y haz copias del panel de vez en cuando.', panelCreat: 'Panel creado.', panelObreQ: 'Escribe tu código de acceso para abrir el panel.', panelObre: 'Abre el panel', panelErr: 'Código incorrecto o archivo no válido.',
      panelOblit: 'Si has olvidado el código, solo puedes borrar el panel de este dispositivo y empezar de nuevo (o recuperar una copia).', panelEsborra: 'Borra el panel de este dispositivo', panelEsborraConf: '¿Seguro que quieres borrar el panel? Se pierden todos los equipos recibidos que no tengas en copia.',
      panelRecT: 'Recupera una copia del panel', panelRecBtn: 'Recupera', panelImpT: 'Recibe los archivos de los entrenadores', panelImpQ: 'Puedes elegir varios a la vez. Si un equipo ya está, se actualiza con el archivo más nuevo.', panelImpPass: 'Clave (solo si es nueva; las guardadas se prueban solas)', panelImpBtn: 'Importa',
      panelImpRes: 'Equipos nuevos: {n} · actualizados: {a} · no abiertos o antiguos: {e}', panelSenseEq: 'Todavía no hay ningún equipo. Cuando los entrenadores te envíen el archivo, impórtalo aquí.', panelEquipsT: 'Equipos', panelAvClub: 'Avisos del club para revisar pronto',
      panelClausT: 'Claves de los clubes', panelClausQ: 'Da a cada entrenador la clave de su club, en persona o por teléfono. Las claves quedan guardadas cifradas dentro del panel y se usan solas al importar.', nClaus: 'claves guardadas', clauNova: 'Clave nueva', treuClaus: 'Borra las claves', treuClausConf: '¿Borrar todas las claves guardadas?',
      panelCopiaT: 'Copia y salida', panelCopiaQ: 'La copia es el mismo archivo cifrado con tu código. Cierra el panel cuando acabes.', panelCopiaBtn: 'Descarga una copia del panel', panelTanca: 'Cierra el panel', treuEquip: 'Quitar', treuConf: '¿Quitar este equipo del panel?',
      informesT: 'Informes para las familias', informesQ: 'Un borrador por jugador a partir de las últimas 12 semanas, para revisar e imprimir o guardar en PDF todos a la vez.', imprimeixTots: 'Imprime todos (uno por página)',
      enviaT: 'Envía al psicólogo', enviaQ: 'Guarda una sola vez la clave que te ha dado el psicólogo del club. Después, cada semana, envíale los datos cifrados por WhatsApp o correo.', enviaQ2: 'Los datos salen cifrados con la clave del psicólogo del club.', clauPsi: 'Clave del psicólogo del club', clauDesa: 'Guarda la clave', clauDesada: 'Clave guardada.',
      enviaBtn: 'Envía al psicólogo', enviaCanvia: 'Cambia la clave', enviat: 'Último envío', enviaPrep: 'Archivo cifrado preparado. Toca «Compartir» y elige WhatsApp o el correo del psicólogo.', enviaComp: 'Compartir', enviaBaixa: 'Descarga el archivo', enviaBaixat: 'Archivo descargado. Adjúntalo en un mensaje al psicólogo.', enviaMsg: 'Seguimiento semanal',
      panelNoDesa: 'El navegador no deja guardar el panel. Descarga ahora una copia: se hace con los datos actuales.', impRecT: 'Recupera una copia tuya', panelLect: 'Solo lectura: los datos de este equipo los escribe el entrenador.',
      grupT: 'Informe de grupo', grupQ: 'Para el entrenador y la coordinación: la media del equipo en cada ítem, cada jugador, el clima, el estilo de entrenamiento y los avisos de las últimas 12 semanas.', grupEquipT: 'El equipo, ítem por ítem', grupJugT: 'Cada jugador', colItem: 'Ítem', colEquip: 'Media del equipo', periode: 'Periodo', clauQual: 'Media de 0 a 3: 0-1 Alerta · 1-2 Regular · 2-2,4 Normal · 2,5-3 Destacado',
      socPsi: 'Soy el psicólogo: abre un archivo', pssT: 'Ficha APRENS ESPORT: conductas concretas', pssQ: 'Opcional. Marca solo lo que se ha apartado de la normalidad.', conductaRep: 'Conducta repetida', conductaPos: 'Conducta positiva repetida', ajPss: 'Ficha APRENS ESPORT (conductas concretas)', vegades: 'veces',
      senseEnt: 'semanas sin entrevista', taula: 'Ver los datos en tabla', mitjana: 'media', avui: 'hoy'
    }
  };
  function u(k) { var t = U[S.lang] || U.ca; return t[k] != null ? t[k] : (U.ca[k] != null ? U.ca[k] : k); }

  /* ================= UTILITATS ================= */
  function h(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function uid() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(function () { t.classList.remove('on'); }, 2400); }
  function per(id, arr) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }

  /* Setmanes ISO */
  function dilluns(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); return x; }
  function wid(d) {
    var x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dn = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - dn);
    var y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
    var n = Math.ceil(((x - y0) / 86400000 + 1) / 7);
    return x.getUTCFullYear() + '-W' + (n < 10 ? '0' : '') + n;
  }
  var setmVista = dilluns(new Date());
  function wActual() { return wid(setmVista); }
  function dataCurta(d) { return d.toLocaleDateString(S.lang === 'es' ? 'es-ES' : 'ca-ES', { day: 'numeric', month: 'short' }); }
  function etiquetaW(w) { var p = w.split('-W'); return 'S' + parseInt(p[1], 10); }

  function setm(w, crea) {
    var d = S.setm[w];
    if (!d && crea) d = S.setm[w] = { obj: [], ent: null };
    return d;
  }

  /* Ítems actius segons la configuració */
  function climaActius(d) { d = d || D(); return C.clima.filter(function (i) { return !d.cfg.climaOff[i.id]; }); }
  function dimsActives(d) {
    d = d || D();
    return C.dims.filter(function (i) { return !d.cfg.dimsOff[i.id]; })
      .concat(d.cfg.dimsExtra.filter(function (x) { return !d.cfg.dimsOff[x.id]; }).map(function (x) { return { id: x.id, t: x.t, d: '', clau: true, propi: true }; }));
  }
  function pssActius(d) {
    d = d || D(); var o = [];
    C.pss.forEach(function (b) { b.items.forEach(function (i) { if (!d.cfg.pssOff[i.id]) o.push(i); }); });
    return o;
  }
  /* valor d'una conducta: -1 a revisar, +1 adaptativa, 0 res */
  function pssSig(i, v) {
    if (!v) return 0;
    if (i.tipus === 'esc') return v < 0 ? -1 : 1;
    return i.sig < 0 ? -1 : 1;
  }
  function jugActius(d) { return (d || D()).jug.filter(function (j) { return j.actiu !== false; }); }
  function nomJ(j) { return j ? (j.nom + (j.dorsal ? ' · ' + j.dorsal : '')) : ''; }

  /* ================= ÍNDEXS ================= */
  function climaIdx(e, d) {
    if (!e || !e.clima) return null; var s = 0, n = 0;
    climaActius(d).forEach(function (i) { var v = e.clima[i.id]; if (v == null) return; s += i.sig > 0 ? v : 3 - v; n++; });
    return n ? Math.round(s / n / 3 * 100) : null;
  }
  function estilIdx(e) {
    if (!e || !e.mi) return null; var s = 0, n = 0;
    C.entrenador.forEach(function (f) { f.items.forEach(function (i) { var v = e.mi[i.id]; if (v == null || !i.sig) return; s += i.sig > 0 ? v : 3 - v; n++; }); });
    if (e.temps != null) { s += e.temps; n++; }
    return n ? Math.round(s / n / 3 * 100) : null;
  }
  function tascaPct(e) {
    if (!e || !e.jug) return null; var t = 0, n = 0;
    Object.keys(e.jug).forEach(function (k) { var o = e.jug[k].o; if (o === 't' || o === 'e') { n++; if (o === 't') t++; } });
    return n >= 3 ? Math.round(t / n * 100) : null;
  }
  function setmanesFetes(d) {
    d = d || D();
    return Object.keys(d.setm).filter(function (w) { return d.setm[w].ent && d.setm[w].ent.fet; }).sort();
  }

  /* ================= AVISOS ================= */
  function avisos(d) {
    d = d || D();
    var ws = setmanesFetes(d), L = psi() && S.psiLl ? S.psiLl : d.cfg.llindars, out = [];
    var fin = Math.max(2, +L.fin || 3), min = Math.max(1, +L.min || 2), ego = Math.max(1, +L.ego || 3);
    var dimsA = dimsActives(d);
    var avui = wid(new Date());
    var darreraAbs = ws[ws.length - 1];
    /* Les finestres es compten des de la darrera entrevista feta (la setmana en curs pot estar encara buida).
       Si fa massa que no n'hi ha, ho diu l'avís de setmanes sense entrevista. */
    var recent = function (w, n) { if (!darreraAbs) return false; var k = setmanesEntre(w, darreraAbs); return k >= 0 && k < n; };
    var darrera = darreraAbs && setmanesEntre(darreraAbs, avui) <= 1 ? darreraAbs : null; /* «aquesta setmana» = la darrera, si és recent */
    var es = S.lang === 'es';
    jugActius(d).forEach(function (j) {
      var motius = [], nivell = 0, pos = [];
      var wj = ws.filter(function (w) { return d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; });
      var fines = wj.filter(function (w) { return recent(w, fin); });
      dimsA.forEach(function (dm) {
        var baix = fines.filter(function (w) { var v = (d.setm[w].ent.jug[j.id].d || {})[dm.id]; return v != null && v <= -1; }).length;
        if (dm.clau && baix >= min) { motius.push((es ? 'Por debajo de la media del equipo, de forma repetida, en «' : 'Per davall de la mitjana de l\'equip, de manera repetida, en «') + tx(dm.t) + '» (' + baix + '/' + fines.length + ')'); nivell = Math.max(nivell, 1); }
        if (darrera && d.setm[darrera].ent.jug && d.setm[darrera].ent.jug[j.id]) {
          var v = (d.setm[darrera].ent.jug[j.id].d || {})[dm.id];
          if (v != null && v <= -2) { motius.push((es ? 'Hecho significativo negativo esta semana en «' : 'Fet significatiu negatiu aquesta setmana en «') + tx(dm.t) + '»'); nivell = Math.max(nivell, 1); }
        }
      });
      var ult4 = wj.filter(function (w) { return recent(w, 4); }), nE = ult4.filter(function (w) { return d.setm[w].ent.jug[j.id].o === 'e'; }).length;
      if (nE >= ego) { motius.push((es ? 'Atención centrada en el resultado de forma sostenida (' : 'Atenció centrada en el resultat de manera sostinguda (') + nE + '/' + ult4.length + ')'); nivell = Math.max(nivell, 1); }
      pssActius(d).forEach(function (it) {
        var neg = 0, posi = 0;
        fines.forEach(function (w) { var c = d.setm[w].ent.jug[j.id].c || {}; var sg = pssSig(it, c[it.id]); if (sg < 0) neg++; if (sg > 0) posi++; });
        if (neg >= min) { motius.push(u('conductaRep') + ': ' + tx(it.t) + ' (' + neg + '/' + fines.length + ')'); nivell = Math.max(nivell, 1); }
        else if (it.tipus === 'num' && darrera && d.setm[darrera].ent.jug && d.setm[darrera].ent.jug[j.id] && (d.setm[darrera].ent.jug[j.id].c || {})[it.id] > 0) { motius.push(tx(it.t) + ': ' + d.setm[darrera].ent.jug[j.id].c[it.id]); nivell = Math.max(nivell, 1); }
        var cD = darrera && d.setm[darrera].ent.jug && d.setm[darrera].ent.jug[j.id] ? (d.setm[darrera].ent.jug[j.id].c || {})[it.id] : null;
        if (it.tipus === 'esc' && cD != null && cD <= -2 && neg < min) { motius.push((es ? 'Hecho significativo negativo esta semana: ' : 'Fet significatiu negatiu aquesta setmana: ') + tx(it.t)); nivell = Math.max(nivell, 1); }
        if (posi >= min) pos.push(u('conductaPos') + ': ' + tx(it.t) + ' (' + posi + '/' + fines.length + ')');
      });
      var ult2 = wj.filter(function (w) { return recent(w, 2); });
      var baixaAs = ult2.length === 2 && setmanesEntre(ult2[0], ult2[1]) === 1 && ult2.every(function (w) { var e = d.setm[w].ent, r = e.jug[j.id]; return e.n > 0 && r.as != null && r.as / e.n < 0.5; });
      if (baixaAs) { motius.push(es ? 'Asistencia baja dos semanas seguidas' : 'Assistència baixa dues setmanes seguides'); nivell = Math.max(nivell, 1); }
      var vistos = {};
      ult2.forEach(function (w) { (d.setm[w].ent.jug[j.id].s || []).forEach(function (s) { vistos[s] = (vistos[s] || 0) + 1; }); });
      Object.keys(vistos).forEach(function (s) {
        var sg = per(s, C.senyals); if (!sg) return;
        motius.push((es ? 'Señal: ' : 'Senyal: ') + tx(sg.t) + (vistos[s] > 1 ? (es ? ' (dos semanas)' : ' (dues setmanes)') : ''));
        nivell = Math.max(nivell, sg.alt || vistos[s] > 1 ? 2 : 1);
      });
      if (motius.length >= 3) nivell = 2;
      /* allunyament de la mitjana de l'equip (positiu o negatiu), la darrera setmana */
      if (darrera) {
        var e = d.setm[darrera].ent, mitj = function (r) { var s = 0, n = 0; dimsA.forEach(function (dm) { var v = (r.d || {})[dm.id]; s += v || 0; n++; }); return n ? s / n : 0; };
        var ks = Object.keys(e.jug || {});
        if (ks.length > 2 && e.jug[j.id]) {
          var mEq = ks.reduce(function (a, k) { return a + mitj(e.jug[k]); }, 0) / ks.length, mJ = mitj(e.jug[j.id]);
          if (mJ - mEq <= -0.8) { motius.push(es ? 'Se aleja por debajo de la media del equipo esta semana' : 'S\'allunya per davall de la mitjana de l\'equip aquesta setmana'); nivell = Math.max(nivell, 1); }
          if (mJ - mEq >= 0.8) pos.push(es ? 'Se aleja por encima de la media del equipo esta semana' : 'S\'allunya per damunt de la mitjana de l\'equip aquesta setmana');
        }
      }
      if (motius.length) out.push({ tipus: 'jug', j: j, nivell: nivell, motius: motius });
      else if (pos.length) out.push({ tipus: 'jug', j: j, nivell: -1, motius: pos });
    });
    /* equip */
    var mEq = [], fw = ws.filter(function (w) { return recent(w, fin); });
    var comp = fw.filter(function (w) { var v = (d.setm[w].ent.clima || {}).compar; return v != null && v >= 2; }).length;
    if (!d.cfg.climaOff.compar && comp >= min) mEq.push(es ? 'Comparaciones, reproches o burlas frecuentes entre compañeros' : 'Comparacions, retrets o burles freqüents entre companys');
    var torn = fw.filter(function (w) { var v = (d.setm[w].ent.clima || {}).tornen; return v != null && v <= 1; }).length;
    if (!d.cfg.climaOff.tornen && torn >= min) mEq.push(es ? 'Al equipo le cuesta volver a la tarea después del error' : 'A l\'equip li costa tornar a la tasca després de l\'errada');
    if (darrera && ((d.setm[darrera].ent.mi || {}).castigs >= 2)) mEq.push(es ? 'Ante el error, predominan castigos o riñas' : 'Davant l\'errada, predominen càstigs o renyades');
    var f3 = fw.slice(-3), cl = f3.map(function (w) { return climaIdx(d.setm[w].ent, d); }).filter(function (v) { return v != null; });
    if (cl.length === 3 && setmanesEntre(f3[0], f3[2]) === 2 && cl[cl.length - 1] < cl[cl.length - 2] && cl[cl.length - 2] < cl[cl.length - 3]) mEq.push(es ? 'El clima de equipo baja tres semanas seguidas' : 'El clima d\'equip baixa tres setmanes seguides');
    var sense = darreraAbs ? setmanesEntre(darreraAbs, avui) : null;
    if (sense != null && sense >= 2) mEq.push(sense + ' ' + u('senseEnt'));
    if (mEq.length) out.unshift({ tipus: 'equip', nivell: mEq.length >= 2 ? 2 : 1, motius: mEq });
    out.sort(function (a, b) { return (a.tipus === 'equip' ? -1 : 0) - (b.tipus === 'equip' ? -1 : 0) || b.nivell - a.nivell; });
    return out;
  }
  function wData(w) { var p = w.split('-W'), y = +p[0], n = +p[1]; var j4 = new Date(y, 0, 4); var m = dilluns(j4); m.setDate(m.getDate() + (n - 1) * 7); return m; }
  function setmanesEntre(a, b) { return Math.round((wData(b) - wData(a)) / (7 * 86400000)); }

  /* ================= RENDER GENERAL ================= */
  var ruta = 'setmana', arg = null, pasEnt = 0, esborrany = null;
  function vés(r, a) { ruta = r; arg = a == null ? null : a; render(); window.scrollTo(0, 0); var m = $('#app'); if (m) m.focus({ preventScroll: true }); }

  function aplicaClub() {
    var c = S.club, lloc = $('#escutLloc');
    document.documentElement.style.setProperty('--club', c && c.color ? c.color : '#3B7224');
    if (lloc) {
      lloc.innerHTML = '';
      if (c && c.escut) { var e = document.createElement('img'); e.className = 'escut'; e.alt = c.nom; e.onerror = function () { e.remove(); }; e.src = CLUBS + c.escut; lloc.appendChild(e); }
    }
    var m = $('#lnkManifest'), ap = $('#lnkApple'), club = c && c.icones && c.slug;
    if (m) m.setAttribute('href', club ? 'clubs/' + c.slug + '.webmanifest' : 'manifest.webmanifest');
    if (ap) ap.setAttribute('href', club ? CLUBS + 'clubs/' + c.slug + '-icona-180.png' : 'aprens-icona-180.png');
  }
  function capcalera() {
    $('#ttApp').textContent = u('app');
    var d = D();
    $('#subtitol').textContent = psi() && !lectura() ? u('panelT') : d.equip ? (d.equip.nom + (d.equip.temporada ? ' · ' + d.equip.temporada : '')) : (S.club ? S.club.nom + ' · APRENS' : u('sub'));
    $('#salta').textContent = u('salta');
    document.documentElement.lang = S.lang;
    document.title = u('app') + ' · APRENS';
    $('#lang').innerHTML = ['ca', 'es'].map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (S.lang === l) + '">' + l.toUpperCase() + '</button>'; }).join('');
    var nav = $('#nav');
    if (!S.avis || (!S.equip && !psi())) { nav.hidden = true; document.body.classList.add('sense-nav'); return; }
    nav.hidden = false; document.body.classList.remove('sense-nav');
    var items = psi() ? (lectura() ? [['panel', 'navPanel', '▦'], ['tendencies', 'navTend', '↗'], ['informes', 'navInf', '✉'], ['plantilla', 'navPlant', '☰'], ['metode', 'navMet', '△']] : [['panel', 'navPanel', '▦'], ['metode', 'navMet', '△']])
      : [['setmana', 'navSetm', '◷'], ['tendencies', 'navTend', '↗'], ['plantilla', 'navPlant', '☰'], ['compartir', 'navComp', '⇄'], ['metode', 'navMet', '△']];
    var grup = { entrevista: 'setmana', objectius: 'setmana', nota: 'setmana', jugador: 'tendencies', informe: 'tendencies', grup: 'tendencies', ajustos: psi() ? 'panel' : 'compartir', equip: 'plantilla' };
    var act = grup[ruta] || ruta;
    nav.innerHTML = items.map(function (it) {
      return '<button type="button" data-nav="' + it[0] + '"' + (act === it[0] ? ' aria-current="page"' : '') + '><span aria-hidden="true">' + it[2] + '</span>' + h(u(it[1])) + '</button>';
    }).join('');
  }

  function render() {
    capcalera();
    var m = $('#app'), html;
    if (!S.avis) html = vAvis();
    else if (ruta === 'panel') html = vPanel();
    else if (psi() && !lectura() && ['metode', 'ajustos'].indexOf(ruta) < 0) { ruta = 'panel'; html = vPanel(); }
    else if (!S.equip && !lectura() && ['compartir', 'metode'].indexOf(ruta) < 0) html = vEquip(true);
    else {
      if (lectura() && ['setmana', 'compartir', 'objectius', 'entrevista', 'nota', 'equip'].indexOf(ruta) >= 0) ruta = 'tendencies';
      var V = { informes: vInformes, grup: vGrup, setmana: vSetmana, objectius: vObjectius, entrevista: vEntrevista, nota: vNota, tendencies: vTendencies, jugador: vJugador,
        informe: vInforme, plantilla: vPlantilla, equip: function () { return vEquip(false); }, compartir: vCompartir, ajustos: vAjustos, metode: vMetode };
      html = (V[ruta] || vSetmana)();
    }
    m.innerHTML = (NO_DESA ? '<div class="card terra" role="alert"><strong>' + h(u('noDesaT')) + '</strong><p>' + h(u('noDesa')) + '</p><button type="button" class="btn petit" data-nav="compartir">' + h(u('expT')) + '</button></div>' : '') + (lectura() ? bandaPsi() : '') + '<div class="vista">' + html + '</div>';
  }

  function bandaPsi() {
    var d = D();
    return '<div class="banda-psi" role="status"><strong>' + h(u('panelT')) + '</strong> · ' + h(d.equip ? d.equip.nom : '') + (d.equip && d.equip.club ? ' · ' + h(d.equip.club) : '') +
      '<br><span>' + h(u('panelLect')) + '</span><br><button type="button" class="btn petit" data-nav="panel">' + h(u('tornaPanel')) + '</button></div>';
  }

  /* ---------- Benvinguda ---------- */
  function vAvis() {
    return '<span class="kick">APRENS</span><h1 tabindex="-1">' + h(u('app')) + '</h1>' +
      '<div class="card"><h2>' + h(u('avisT')) + '</h2>' + u('avis').map(function (p) { return '<p>' + h(p) + '</p>'; }).join('') +
      '<div class="fila"><button type="button" class="btn" data-act="accepta">' + h(u('avisAcc')) + '</button><button type="button" class="btn sec" data-act="accPsi">' + h(u('psiT')) + '</button></div></div>' +
      '<p class="muted">APRENS · Tòfol Villalonga · Psicòleg General Sanitari (B-01599) · Psicologia de l\'esport</p>';
  }

  /* ---------- Equip ---------- */
  function vEquip(primer) {
    var e = S.equip || { nom: '', esport: S.lang === 'es' ? 'Fútbol' : 'Futbol', etapa: 'formacio', temporada: temporadaDef(), club: S.club ? S.club.nom : '' };
    return '<span class="kick">' + h(u('confEquip')) + '</span><h1 tabindex="-1">' + h(u('equipT')) + '</h1>' +
      '<form class="card" data-form="equip">' +
      camp('nom', u('nomEquip'), e.nom, 'required maxlength="60" placeholder="Aleví A"') +
      camp('esport', u('esport'), e.esport, 'maxlength="40"') +
      '<label class="camp"><span>' + h(u('etapa')) + '</span><select name="etapa">' + C.etapes.map(function (x) { return '<option value="' + x.id + '"' + (x.id === e.etapa ? ' selected' : '') + '>' + h(tx(x.t)) + '</option>'; }).join('') + '</select></label>' +
      camp('temporada', u('temporada'), e.temporada, 'maxlength="20"') +
      camp('club', u('club'), e.club, 'maxlength="60"') +
      '<div class="fila"><button type="submit" class="btn">' + h(primer ? u('continua') : u('desa')) + '</button>' +
      (primer ? '<button type="button" class="btn sec" data-nav="panel">' + h(u('psiT')) + '</button>' : '<button type="button" class="btn sec" data-nav="plantilla">' + h(u('cancel')) + '</button>') + '</div></form>';
  }
  function camp(n, l, v, extra) { return '<label class="camp"><span>' + h(l) + '</span><input name="' + n + '" value="' + h(v || '') + '" ' + (extra || '') + '></label>'; }
  function temporadaDef() { var d = new Date(), y = d.getFullYear(); if (d.getMonth() < 7) y--; return y + '-' + String(y + 1).slice(2); }

  /* ---------- Setmana (inici) ---------- */
  function vSetmana() {
    var w = wActual(), sm = setm(w), avui = wid(new Date());
    var fi = new Date(setmVista); fi.setDate(fi.getDate() + 6);
    var et = per(S.equip.etapa, C.etapes);
    var notes = S.notes.filter(function (n) { return n.w === w; });
    var obj = sm && sm.obj.length ? sm.obj : null;
    var fet = sm && sm.ent && sm.ent.fet;
    var o = '<div class="nav-setm"><button type="button" class="btn-icona" data-act="wAnt" aria-label="' + h(u('setmAnt')) + '">‹</button>' +
      '<div><span class="kick">' + h(u('setmana')) + ' ' + h(etiquetaW(w).slice(1)) + '</span><h1 tabindex="-1">' + h(dataCurta(setmVista)) + ' – ' + h(dataCurta(fi)) + '</h1></div>' +
      '<button type="button" class="btn-icona" data-act="wSeg" aria-label="' + h(u('setmSeg')) + '"' + (w >= avui ? ' disabled' : '') + '>›</button></div>';
    if (w !== avui) o += '<p><button type="button" class="enllac" data-act="wAvui">' + h(u('setmAct')) + '</button></p>';
    var av = avisos(S).filter(function (a) { return a.nivell > 0; });
    if (av.length) o += '<button type="button" class="card terra avis-mini" data-nav="tendencies" data-arg="avisos"><strong>' + av.length + ' · ' + h(u('tendAv')) + '</strong><span aria-hidden="true">›</span></button>';
    o += '<section class="card"><h2>' + h(u('objT')) + '</h2>' +
      (obj ? '<ul class="objs">' + obj.map(function (x) { var a = per(x.a, C.arees); return '<li><span class="xip" style="--c:' + (a ? a.color : '#555') + '">' + h(a ? tx(a.t) : '') + '</span> ' + h(x.t) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + h(u('objBuit')) + '</p>') +
      '<button type="button" class="btn ' + (obj ? 'sec' : '') + '" data-nav="objectius">' + h(obj ? u('objEdita') : u('objFixa')) + '</button></section>';
    o += '<section class="card ' + (fet ? 'verd' : 'blau') + '"><h2>' + h(u('entT')) + '</h2><p class="muted">' + h(fet ? u('entFeta') : u('entPend') + ' · ' + u('entDur')) + '</p>' +
      '<div class="fila"><button type="button" class="btn" data-act="obreEnt">' + h(fet ? u('entRev') : u('entFes')) + '</button>' +
      (fet ? '<button type="button" class="btn sec" data-act="' + (S.cfg.clauPsi ? 'envia' : 'anarEnvia') + '">' + h(u('enviaBtn')) + '</button>' : '') + '</div>' +
      (fet && S.cfg.enviat ? '<p class="muted petit">' + h(u('enviat')) + ': ' + h(S.cfg.enviat.slice(0, 10)) + '</p>' : '') + prepHtml() + '</section>';
    o += '<section class="card"><h2>' + h(u('notaT')) + '</h2>' +
      (notes.length ? '<ul class="notes">' + notes.map(function (n) { var j = per(n.j, S.jug); return '<li><span class="muted">' + h(n.ctx === 'par' ? u('ctxPar') : u('ctxEnt')) + (j ? ' · ' + h(nomJ(j)) : '') + '</span><br>' + h(n.t) + ' <button type="button" class="enllac" data-act="esborraNota" data-id="' + n.id + '">' + h(u('esborra')) + '</button></li>'; }).join('') + '</ul>' : '') +
      '<button type="button" class="btn sec" data-nav="nota">' + h(u('notaFes')) + '</button></section>';
    if (et) o += '<section class="card suau"><h3>' + h(tx(et.t)) + '</h3><p>' + h(tx(et.prio)) + '</p></section>';
    return o;
  }

  /* ---------- Objectius ---------- */
  function vObjectius() {
    var sm = setm(wActual());
    if (!esborrany || esborrany.tipus !== 'obj') esborrany = { tipus: 'obj', obj: sm ? clone(sm.obj) : [], area: 'tt' };
    var E = esborrany, a = per(E.area, C.arees);
    return '<span class="kick">' + h(u('setmana')) + ' ' + h(etiquetaW(wActual()).slice(1)) + '</span><h1 tabindex="-1">' + h(u('objT')) + '</h1><p class="lead">' + h(u('objQ')) + '</p>' +
      '<ul class="objs edit">' + E.obj.map(function (x, i) { var aa = per(x.a, C.arees); return '<li><span class="xip" style="--c:' + aa.color + '">' + h(tx(aa.t)) + '</span> ' + h(x.t) + ' <button type="button" class="enllac" data-act="treuObj" data-i="' + i + '" aria-label="' + h(u('esborra') + ': ' + x.t) + '">✕</button></li>'; }).join('') + '</ul>' +
      '<fieldset class="card"><legend>' + h(u('objArea')) + '</legend><div class="segs">' + C.arees.map(function (x) { return '<button type="button" class="seg" data-act="area" data-id="' + x.id + '" aria-pressed="' + (x.id === E.area) + '" style="--c:' + x.color + '">' + h(tx(x.t)) + '</button>'; }).join('') + '</div>' +
      '<h3>' + h(u('objSug')) + '</h3><div class="sugs">' + a.sug.map(function (s, i) { return '<button type="button" class="sug" data-act="sugObj" data-i="' + i + '">+ ' + h(tx(s)) + '</button>'; }).join('') + '</div>' +
      '<form data-form="objPropi" class="fila"><label class="camp creix"><span>' + h(u('objPropi')) + '</span><input name="t" maxlength="120"></label><button type="submit" class="btn sec">' + h(u('afegeix')) + '</button></form></fieldset>' +
      '<div class="fila"><button type="button" class="btn" data-act="desaObj">' + h(u('desa')) + '</button><button type="button" class="btn sec" data-act="cancelObj">' + h(u('cancel')) + '</button></div>';
  }

  /* ---------- Nota ràpida ---------- */
  function vNota() {
    return '<span class="kick">' + h(u('setmana')) + ' ' + h(etiquetaW(wActual()).slice(1)) + '</span><h1 tabindex="-1">' + h(u('notaT')) + '</h1>' +
      '<form class="card" data-form="nota"><label class="camp"><span>' + h(u('notaJug')) + '</span><select name="j"><option value="">' + h(u('notaEquip')) + '</option>' +
      jugActius(S).map(function (j) { return '<option value="' + j.id + '"' + (arg === j.id ? ' selected' : '') + '>' + h(nomJ(j)) + '</option>'; }).join('') + '</select></label>' +
      '<label class="camp"><span>' + h(u('objArea')) + '</span><select name="a"><option value="">—</option>' + C.arees.map(function (x) { return '<option value="' + x.id + '">' + h(tx(x.t)) + '</option>'; }).join('') + '</select></label>' +
      '<fieldset class="camp"><legend>' + h(u('notaCtx')) + '</legend><div class="radios">' + radio('ctx', 'ent', u('ctxEnt'), true) + radio('ctx', 'par', u('ctxPar'), false) + '</div></fieldset>' +
      '<label class="camp"><span>' + h(u('notaQ')) + '</span><textarea name="t" rows="4" maxlength="600" required></textarea></label>' +
      '<div class="fila"><button type="submit" class="btn">' + h(u('desa')) + '</button><button type="button" class="btn sec" data-nav="setmana">' + h(u('cancel')) + '</button></div></form>';
  }
  function radio(n, v, l, ch) { return '<label class="radio"><input type="radio" name="' + h(n) + '" value="' + h(v) + '"' + (ch ? ' checked' : '') + '><span>' + h(l) + '</span></label>'; }

  /* ---------- Entrevista ---------- */
  var PASSOS = 6;
  function nouEnt() {
    var jug = {};
    jugActius(S).forEach(function (j) { jug[j.id] = { d: {}, o: '', as: null, s: [], n: '' }; });
    return { n: 2, partit: true, objV: [], clima: {}, mi: {}, temps: null, jug: jug, r1: '', r2: '', fet: false };
  }
  function vEntrevista() {
    var E = esborrany.ent, sm = setm(wActual()), o = '';
    o += '<div class="progres" role="progressbar" aria-valuemin="1" aria-valuemax="' + PASSOS + '" aria-valuenow="' + (pasEnt + 1) + '" aria-label="' + h(u('pas') + ' ' + (pasEnt + 1) + ' ' + u('de') + ' ' + PASSOS) + '"><span style="width:' + Math.round((pasEnt + 1) / PASSOS * 100) + '%"></span></div>';
    o += '<span class="kick">' + h(u('entT')) + ' · ' + h(u('pas')) + ' ' + (pasEnt + 1) + ' ' + h(u('de')) + ' ' + PASSOS + '</span>';
    if (pasEnt === 0) {
      o += '<h1 tabindex="-1">' + h(u('e0T')) + '</h1><div class="card"><fieldset class="camp"><legend>' + h(u('e0Q')) + '</legend><div class="stepper">' +
        '<button type="button" class="btn-icona" data-act="sessions" data-d="-1" aria-label="−1">−</button><output aria-live="polite">' + E.n + '</output><button type="button" class="btn-icona" data-act="sessions" data-d="1" aria-label="+1">+</button></div></fieldset>' +
        '<fieldset class="camp"><legend>' + h(u('e0P')) + '</legend><div class="radios">' + radioE('partit', '1', u('si'), E.partit) + radioE('partit', '0', u('no'), !E.partit) + '</div></fieldset><p class="muted">' + h(u('e0N')) + '</p></div>';
    } else if (pasEnt === 1) {
      o += '<h1 tabindex="-1">' + h(u('e1T')) + '</h1><p class="lead">' + h(u('e1Q')) + '</p>';
      var obj = sm ? sm.obj : [];
      if (!obj.length) o += '<p class="card suau">' + h(u('e1Buit')) + '</p>';
      obj.forEach(function (x, i) { var a = per(x.a, C.arees); o += escala('objV.' + i, '<span class="xip" style="--c:' + a.color + '">' + h(tx(a.t)) + '</span> ' + h(x.t), C.escalaObj, E.objV[i]); });
    } else if (pasEnt === 2) {
      o += '<h1 tabindex="-1">' + h(u('e2T')) + '</h1><p class="lead">' + h(u('e2Q')) + '</p>';
      climaActius(S).forEach(function (i) { o += escala('clima.' + i.id, h(tx(i.t)), C.escalaFreq, E.clima[i.id]); });
    } else if (pasEnt === 3) {
      o += '<h1 tabindex="-1">' + h(u('e3T')) + '</h1><p class="lead">' + h(u('e3Q')) + '</p>';
      C.entrenador.forEach(function (f) {
        o += '<h2 class="fase">' + h(tx(f.t)) + '</h2>';
        f.items.forEach(function (i) { if (i.grup) o += '<h3>' + h(tx(i.grup)) + '</h3>'; o += escala('mi.' + i.id, h(tx(i.t)), C.escalaFreq, E.mi[i.id]); });
        if (f.fase === 'durant') o += escala('temps', h(tx(C.tempsJoc.t)), C.tempsJoc.op, E.temps);
      });
    } else if (pasEnt === 4) {
      o += '<h1 tabindex="-1">' + h(u('e4T')) + '</h1><p class="lead">' + h(u('e4Q')) + '</p>';
      o += '<div class="card suau clau-esc"><ul>' + C.escalaJug.map(function (x) { return '<li><span class="num-esc v' + (x.v + 2) + '">' + x.k + '</span> ' + h(tx(x.c)) + '</li>'; }).join('') + '</ul></div>';
      var js = jugActius(S);
      if (js.length >= 4) {
        var massa = dimsActives(S).filter(function (dm) { var k = js.filter(function (j) { var r = E.jug[j.id]; return r && r.d[dm.id]; }).length; return k / js.length > 0.5; });
        if (massa.length) o += '<div class="card terra" role="status"><p>' + h(u('massaMarcats').replace('{x}', massa.map(function (dm) { return tx(dm.t); }).join(', '))) + '</p></div>';
      }
      if (!js.length) o += '<p class="card suau">' + h(u('plantBuit')) + ' <button type="button" class="enllac" data-nav="plantilla">' + h(u('afegeix')) + '</button></p>';
      o += '<ul class="llista-jug">' + js.map(function (j) {
        var r = E.jug[j.id] || (E.jug[j.id] = { d: {}, o: '', as: null, s: [], n: '' });
        var nC = Object.keys(r.d).filter(function (k) { return r.d[k]; }).length;
        var resum = [];
        if (nC) resum.push(nC + ' ' + u('canvis'));
        if (r.o) resum.push(r.o === 't' ? tx(C.orient.op[0].t) : tx(C.orient.op[1].t));
        if (r.s.length) resum.push(r.s.length + ' ' + u('senyals').toLowerCase());
        var nCc = Object.keys(r.c || {}).length; if (nCc) resum.push('APRENS ESPORT ' + nCc);
        if (r.as != null && r.as < E.n) resum.push(u('assist') + ' ' + r.as + '/' + E.n);
        var alt = r.s.some(function (s) { var sg = per(s, C.senyals); return sg && sg.alt; });
        return '<li><button type="button" class="fila-jug' + (resum.length ? ' marcat' : '') + (alt ? ' alt' : '') + '" data-act="obreJug" data-id="' + j.id + '" aria-expanded="' + (arg === j.id) + '"><strong>' + h(nomJ(j)) + '</strong><span class="muted">' + h(resum.length ? resum.join(' · ') : u('habitual')) + '</span></button>' +
          (arg === j.id ? editorJug(j, r, E) : '') + '</li>';
      }).join('') + '</ul>';
    } else if (pasEnt === 5) {
      o += '<h1 tabindex="-1">' + h(u('e5T')) + '</h1><div class="card"><label class="camp"><span>' + h(u('e5a')) + '</span><textarea data-ent="r1" rows="3" maxlength="600">' + h(E.r1) + '</textarea></label>' +
        '<label class="camp"><span>' + h(u('e5b')) + '</span><textarea data-ent="r2" rows="3" maxlength="600">' + h(E.r2) + '</textarea></label></div>';
    }
    o += '<div class="fila peu-ent">' + (pasEnt > 0 ? '<button type="button" class="btn sec" data-act="pasAnt">' + h(u('enrere')) + '</button>' : '<button type="button" class="btn sec" data-nav="setmana">' + h(u('cancel')) + '</button>') +
      (pasEnt < PASSOS - 1 ? '<button type="button" class="btn" data-act="pasSeg">' + h(u('seguent')) + '</button>' : '<button type="button" class="btn" data-act="desaEnt">' + h(u('entDesa')) + '</button>') + '</div>';
    return o;
  }
  function radioE(n, v, l, ch) { return '<label class="radio"><input type="radio" data-ent="' + n + '" name="e_' + n + '" value="' + v + '"' + (ch ? ' checked' : '') + '><span>' + h(l) + '</span></label>'; }
  /* escala de botons radio; la primera opció marcada torna a desmarcar-se amb un segon toc */
  var nEsc = 0;
  function escala(clau, titolHtml, ops, val) {
    var n = 'esc' + (nEsc++);
    return '<fieldset class="card escala"><legend>' + titolHtml + '</legend><div class="opcions o' + ops.length + '">' + ops.map(function (op, i) {
      return '<label class="op"><input type="radio" name="' + n + '" data-esc="' + clau + '" value="' + i + '"' + (val === i ? ' checked' : '') + '><span>' + h(tx(op)) + '</span></label>';
    }).join('') + '</div></fieldset>';
  }
  function editorJug(j, r, E) {
    var o = '<div class="editor-jug">';
    dimsActives(S).forEach(function (dm) {
      var v = r.d[dm.id] || 0, n = 'd_' + j.id + '_' + dm.id;
      o += '<fieldset class="dim"><legend><strong>' + h(tx(dm.t)) + '</strong> <span class="muted">' + h(tx(dm.d)) + '</span></legend><div class="esc4">' +
        C.escalaJug.map(function (s) { return '<label class="op4 v' + (s.v + 2) + '"><input type="radio" name="' + n + '" data-jd="' + j.id + '" data-dim="' + dm.id + '" value="' + s.v + '"' + (v === s.v ? ' checked' : '') + '><span aria-hidden="true">' + s.k + '</span><span class="sr">' + h(tx(s.c)) + '</span></label>'; }).join('') +
        '</div></fieldset>';
    });
    o += '<fieldset class="dim"><legend><strong>' + h(tx(C.orient.q)) + '</strong></legend><div class="radios">' + C.orient.op.map(function (op) {
      return '<label class="radio"><input type="radio" name="o_' + j.id + '" data-jo="' + j.id + '" value="' + op.id + '"' + (r.o === op.id ? ' checked' : '') + '><span>' + h(tx(op.t)) + (tx(op.d) ? ' <small>' + h(tx(op.d)) + '</small>' : '') + '</span></label>';
    }).join('') + '</div></fieldset>';
    var as = r.as == null ? E.n : r.as;
    o += '<fieldset class="dim"><legend><strong>' + h(u('assist')) + '</strong></legend><div class="stepper"><button type="button" class="btn-icona" data-act="assist" data-id="' + j.id + '" data-d="-1" aria-label="−1">−</button><output aria-live="polite">' + as + ' / ' + E.n + ' ' + h(u('sessions')) + '</output><button type="button" class="btn-icona" data-act="assist" data-id="' + j.id + '" data-d="1" aria-label="+1">+</button></div></fieldset>';
    o += '<fieldset class="dim"><legend><strong>' + h(u('senyals')) + '</strong></legend><div class="xips">' + C.senyals.map(function (s) {
      return '<label class="chk"><input type="checkbox" data-js="' + j.id + '" value="' + s.id + '"' + (r.s.indexOf(s.id) >= 0 ? ' checked' : '') + '><span>' + h(tx(s.t)) + '</span></label>';
    }).join('') + '</div></fieldset>';
    var pc = r.c || {}, nPc = Object.keys(pc).length;
    o += '<details class="pss"' + (nPc ? ' open' : '') + '><summary>' + h(u('pssT')) + (nPc ? ' · ' + nPc : '') + '</summary><p class="muted petit">' + h(u('pssQ')) + '</p>';
    C.pss.forEach(function (b) {
      var its = b.items.filter(function (i) { return !S.cfg.pssOff[i.id]; }); if (!its.length) return;
      o += '<h4>' + h(tx(b.t)) + '</h4>';
      its.forEach(function (i) {
        var v = pc[i.id] || 0;
        if (i.tipus === 'esc') o += '<fieldset class="pss-it"><legend>' + h(tx(i.t)) + '</legend><div class="esc4">' + C.escalaPss.map(function (s) { return '<label class="op4 v' + (s.v + 2) + '"><input type="radio" name="c_' + j.id + '_' + i.id + '" data-jc="' + j.id + '" data-it="' + i.id + '" value="' + s.v + '"' + (v === s.v ? ' checked' : '') + '><span aria-hidden="true">' + s.k + '</span><span class="sr">' + h(tx(s.c)) + '</span></label>'; }).join('') + '</div></fieldset>';
        else if (i.tipus === 'si') o += '<label class="chk bloc pss-si' + (i.sig < 0 ? ' neg' : '') + '"><input type="checkbox" data-jc="' + j.id + '" data-it="' + i.id + '"' + (v ? ' checked' : '') + '><span>' + h(tx(i.t)) + '</span></label>';
        else o += '<label class="pss-num"><span>' + h(tx(i.t)) + '</span><input type="number" min="0" max="20" inputmode="numeric" data-jc="' + j.id + '" data-it="' + i.id + '" value="' + (v || 0) + '"></label>';
      });
    });
    o += '</details>';
    o += '<label class="camp"><span>' + h(u('notaJ')) + ' <small class="muted">' + h(u('notaPriv')) + '</small></span><textarea data-jn="' + j.id + '" rows="2" maxlength="400">' + h(r.n) + '</textarea></label>';
    o += '<button type="button" class="btn sec petit" data-act="obreJug" data-id="' + j.id + '">' + h(u('tanca')) + '</button></div>';
    return o;
  }

  /* ---------- Tendències ---------- */
  function vTendencies() {
    var d = D(), ws = setmanesFetes(d).slice(-12), av = avisos(d);
    var o = '<span class="kick">' + h(d.equip ? d.equip.nom : '') + '</span><h1 tabindex="-1">' + h(u('tendT')) + '</h1>';
    o += '<section class="card" id="avisos"><h2>' + h(u('tendAv')) + '</h2><p class="muted">' + h(u('avNota')) + '</p>' +
      (av.length ? '<ul class="avisos">' + av.map(function (a) {
        var et = a.nivell === 2 ? u('avAlt') : a.nivell === -1 ? u('avPos') : u('avSeg');
        return '<li class="av n' + a.nivell + '"><span class="et">' + h(et) + '</span> ' +
          (a.tipus === 'equip' ? '<strong>' + h(u('avEquip')) + '</strong>' : '<button type="button" class="enllac fort" data-nav="jugador" data-arg="' + a.j.id + '">' + h(nomJ(a.j)) + '</button>') +
          '<ul>' + a.motius.map(function (m) { return '<li>' + h(m) + '</li>'; }).join('') + '</ul></li>';
      }).join('') + '</ul>' : '<p>' + h(u('avBuit')) + '</p>') + '</section>';
    o += '<section class="card"><h2>' + h(u('tendEquip')) + '</h2>';
    if (ws.length < 2) o += '<p class="muted">' + h(u('pocsDades')) + '</p>';
    else {
      var series = [
        { t: u('clima'), c: '#2F5E9E', v: ws.map(function (w) { return climaIdx(d.setm[w].ent, d); }) },
        { t: u('estil'), c: '#3B7224', v: ws.map(function (w) { return estilIdx(d.setm[w].ent); }) },
        { t: u('tasca'), c: '#7A4FA0', v: ws.map(function (w) { return tascaPct(d.setm[w].ent); }) }
      ];
      o += grafic(ws, series);
    }
    o += '</section>';
    o += '<div class="card"><h2>' + h(u('grupT')) + '</h2><p>' + h(u('grupQ')) + '</p><button type="button" class="btn sec" data-nav="grup">' + h(u('grupT')) + '</button></div>';
    if (psi()) o += '<div class="card blau"><h2>' + h(u('informesT')) + '</h2><p>' + h(u('informesQ')) + '</p><button type="button" class="btn" data-nav="informes">' + h(u('informesT')) + '</button></div>';
    o += '<section class="card"><h2>' + h(u('tendJug')) + '</h2><ul class="llista-jug">' + jugActius(d).map(function (j) {
      var a = av.filter(function (x) { return x.j && x.j.id === j.id; })[0];
      return '<li><button type="button" class="fila-jug' + (a ? (a.nivell === 2 ? ' alt' : a.nivell === -1 ? ' pos' : ' marcat') : '') + '" data-nav="jugador" data-arg="' + j.id + '"><strong>' + h(nomJ(j)) + '</strong>' + tira(d, j, ws.slice(-6), true) + '</button></li>';
    }).join('') + '</ul></section>';
    return o;
  }
  /* gràfic de línies SVG (0-100), amb taula de dades accessible */
  function grafic(ws, series) {
    var W = 320, H = 160, pl = 28, pr = 8, pt = 10, pb = 22, n = ws.length;
    var x = function (i) { return pl + (n === 1 ? 0 : i * (W - pl - pr) / (n - 1)); }, y = function (v) { return pt + (100 - v) * (H - pt - pb) / 100; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="grafic" role="img" aria-label="' + h(series.map(function (z) { return z.t; }).join(', ')) + '">';
    [0, 50, 100].forEach(function (g) { s += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(g) + '" y2="' + y(g) + '" class="g"/><text x="' + (pl - 4) + '" y="' + (y(g) + 3) + '" text-anchor="end">' + g + '</text>'; });
    ws.forEach(function (w, i) { if (n <= 8 || i % 2 === 0 || i === n - 1) s += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + etiquetaW(w) + '</text>'; });
    series.forEach(function (z) {
      var pts = []; z.v.forEach(function (v, i) { if (v != null) pts.push(x(i).toFixed(1) + ',' + y(v).toFixed(1)); });
      if (pts.length) s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + z.c + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
      z.v.forEach(function (v, i) { if (v != null) s += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3" fill="' + z.c + '"/>'; });
    });
    s += '</svg><ul class="llegenda">' + series.map(function (z) { return '<li><span style="background:' + z.c + '"></span>' + h(z.t) + '</li>'; }).join('') + '</ul>';
    s += '<details><summary>' + h(u('taula')) + '</summary><div class="taula-wrap" tabindex="0"><table><thead><tr><th scope="col">' + h(u('setmana')) + '</th>' + series.map(function (z) { return '<th scope="col">' + h(z.t) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      ws.map(function (w, i) { return '<tr><th scope="row">' + etiquetaW(w) + '</th>' + series.map(function (z) { return '<td>' + (z.v[i] == null ? '—' : z.v[i]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></details>';
    return s;
  }
  /* tira de calor: mitjana de les dimensions per setmana (o fila d'una dimensió) */
  function cel(v, txt) {
    var cls = v == null ? 'buit' : v <= -1.5 ? 'm2' : v <= -0.5 ? 'm1' : v >= 1.5 ? 'p2' : v >= 0.5 ? 'p1' : 'z';
    return '<span class="cel ' + cls + '">' + h(txt != null ? txt : (v == null ? '·' : (Math.abs(v) < 0.05 ? '=' : (v > 0 ? '+' : '') + (Math.round(v * 10) / 10)))) + '</span>';
  }
  function tira(d, j, ws, mini) {
    var dms = dimsActives(d);
    return '<span class="tira" aria-hidden="' + (mini ? 'true' : 'false') + '">' + ws.map(function (w) {
      var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; if (!r) return cel(null);
      var s = 0; dms.forEach(function (dm) { s += (r.d || {})[dm.id] || 0; });
      return cel(dms.length ? s / dms.length : 0, mini ? '' : null);
    }).join('') + '</span>';
  }

  /* ---------- Fitxa del jugador ---------- */
  function vJugador() {
    var d = D(), j = per(arg, d.jug); if (!j) return vTendencies();
    var ws = setmanesFetes(d).slice(-10), dms = dimsActives(d);
    var o = '<button type="button" class="enllac" data-nav="tendencies">← ' + h(u('tendT')) + '</button><span class="kick">' + h(u('jugDet')) + '</span><h1 tabindex="-1">' + h(nomJ(j)) + '</h1>';
    var av = avisos(d).filter(function (a) { return a.j && a.j.id === j.id; })[0];
    if (av) o += '<div class="card ' + (av.nivell === -1 ? 'verd' : 'terra') + '"><ul class="punts">' + av.motius.map(function (m) { return '<li>' + h(m) + '</li>'; }).join('') + '</ul></div>';
    if (!ws.length) o += '<p class="muted">' + h(u('pocsDades')) + '</p>';
    else {
      o += '<div class="card"><div class="taula-wrap" tabindex="0"><table class="calor"><thead><tr><th scope="col"><span class="sr">' + h(u('setmana')) + '</span></th>' + ws.map(function (w) { return '<th scope="col">' + etiquetaW(w) + '</th>'; }).join('') + '</tr></thead><tbody>';
      dms.forEach(function (dm) {
        o += '<tr><th scope="row">' + h(tx(dm.t)) + '</th>' + ws.map(function (w) { var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; var vv = r ? (r.d || {})[dm.id] || 0 : null; return '<td>' + (r ? cel(vv, String(vv + 2)) : cel(null)) + '</td>'; }).join('') + '</tr>';
      });
      pssActius(d).forEach(function (it) {
        var algun = ws.some(function (w) { var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; return r && r.c && r.c[it.id]; });
        if (!algun) return;
        o += '<tr class="pss-fila"><th scope="row">' + h(tx(it.t)) + '</th>' + ws.map(function (w) { var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; if (!r) return '<td>' + cel(null) + '</td>'; var v = (r.c || {})[it.id]; var sg = pssSig(it, v); return '<td>' + cel(it.tipus === 'esc' ? (v || 0) : sg, it.tipus === 'num' ? (v ? String(v) : '·') : it.tipus === 'esc' ? String((v || 0) + 2) : (v ? (sg > 0 ? '+' : '−') : '·')) + '</td>'; }).join('') + '</tr>';
      });
      o += '<tr><th scope="row">' + h(u('orientRow')) + '</th>' + ws.map(function (w) { var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; var ov = r ? r.o : null; return '<td>' + cel(ov === 't' ? 1 : ov === 'e' ? -1 : null, ov === 't' ? 'T' : ov === 'e' ? 'R' : '·') + '</td>'; }).join('') + '</tr>';
      o += '<tr><th scope="row">' + h(u('assistRow')) + '</th>' + ws.map(function (w) { var e = d.setm[w].ent, r = e.jug && e.jug[j.id]; if (!r) return '<td>' + cel(null) + '</td>'; var as = r.as == null ? e.n : r.as; return '<td>' + cel(e.n ? (as / e.n < 0.5 ? -1 : 0) : null, as + '/' + e.n) + '</td>'; }).join('') + '</tr>';
      o += '</tbody></table></div><p class="muted petit">' + C.escalaJug.map(function (x) { return x.k + ': ' + h(tx(x.c)); }).join(' · ') + ' · T: ' + h(tx(C.orient.op[0].t)) + ' · R: ' + h(tx(C.orient.op[1].t)) + '</p></div>';
      var sens = [], nts = [];
      ws.forEach(function (w) { var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; if (!r) return; (r.s || []).forEach(function (s) { var sg = per(s, C.senyals); if (sg) sens.push(etiquetaW(w) + ' · ' + tx(sg.t)); }); if (r.n) nts.push(etiquetaW(w) + ' · ' + r.n); });
      d.notes.filter(function (n) { return n.j === j.id; }).forEach(function (n) { nts.push(etiquetaW(n.w) + ' · ' + (n.ctx === 'par' ? u('ctxPar') : u('ctxEnt')) + ' · ' + n.t); });
      if (sens.length) o += '<section class="card"><h2>' + h(u('senyalsJug')) + '</h2><ul class="punts">' + sens.map(function (s) { return '<li>' + h(s) + '</li>'; }).join('') + '</ul></section>';
      if (nts.length) o += '<section class="card"><h2>' + h(u('notesJug')) + '</h2><ul class="punts">' + nts.map(function (s) { return '<li>' + h(s) + '</li>'; }).join('') + '</ul></section>';
    }
    o += '<div class="fila">' + (lectura() ? '' : '<button type="button" class="btn sec" data-nav="nota" data-arg="' + j.id + '">' + h(u('notaFes')) + '</button>') +
      '<button type="button" class="btn sec" data-nav="informe" data-arg="' + j.id + '">' + h(u('infT')) + '</button></div>';
    return o;
  }

  /* ---------- Mitjanes 0-3 i paraula qualitativa (clau APRENS ESPORT) ----------
     0-1 Alerta · 1-2 Regular · 2-2,4 Normal · 2,5-3 Destacat (de 2,4 a 2,5 es compta Normal). */
  var QUAL = [{ max: 1, k: 'alerta', t: { ca: 'Alerta', es: 'Alerta' } }, { max: 2, k: 'regular', t: { ca: 'Regular', es: 'Regular' } },
    { max: 2.5, k: 'normal', t: { ca: 'Normal', es: 'Normal' } }, { max: Infinity, k: 'destacat', t: { ca: 'Destacat', es: 'Destacado' } }];
  function qual(v) { if (v == null) return null; for (var i = 0; i < QUAL.length; i++) if (v < QUAL[i].max) return QUAL[i]; return QUAL[3]; }
  function wsInf(d) { return setmanesFetes(d).slice(-12); }
  function itemsInf(d) {
    return dimsActives(d).map(function (x) { return { id: x.id, t: x.t, f: 'd' }; })
      .concat(pssActius(d).filter(function (i) { return i.tipus === 'esc'; }).map(function (x) { return { id: x.id, t: x.t, f: 'c' }; }));
  }
  /* mitjana 0-3 d'un jugador en un ítem: setmanes en què té registre; el que no s'ha marcat és 2 */
  function mitjJug(d, j, ws, it) {
    var s = 0, n = 0;
    ws.forEach(function (w) { var r = d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; if (!r) return; s += ((r[it.f] || {})[it.id] || 0) + 2; n++; });
    return n ? s / n : null;
  }
  function mitjEq(d, ws, it) {
    var s = 0, n = 0;
    jugActius(d).forEach(function (j) { var v = mitjJug(d, j, ws, it); if (v != null) { s += v; n++; } });
    return n ? s / n : null;
  }
  function numF(v) { return v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1).replace('.', S.lang === 'es' || S.lang === 'ca' ? ',' : '.'); }
  function cQual(v, ambNum) { var q = qual(v); return q ? '<td class="q q-' + q.k + '">' + h(tx(q.t)) + (ambNum ? ' <small>' + numF(v) + '</small>' : '') + '</td>' : '<td>—</td>'; }
  function periodeTxt(ws) { return ws.length ? etiquetaW(ws[0]) + '–' + etiquetaW(ws[ws.length - 1]) + ' · ' + ws.length + ' ' + u('setmanes') : ''; }
  /* taula de l'informe individual: el jugador i la mitjana de l'equip, en paraules */
  function taulaJug(d, j) {
    var ws = wsInf(d);
    return '<table class="inf-taula" id="taula-' + j.id + '"><caption>' + h(u('clauQual')) + '</caption><thead><tr><th scope="col">' + h(u('colItem')) + '</th><th scope="col">' + h(j.nom) + '</th><th scope="col">' + h(u('colEquip')) + '</th></tr></thead><tbody>' +
      itemsInf(d).map(function (it) { return '<tr><th scope="row">' + h(tx(it.t)) + '</th>' + cQual(mitjJug(d, j, ws, it)) + cQual(mitjEq(d, ws, it)) + '</tr>'; }).join('') + '</tbody></table>';
  }
  function impJug(text, taulaHtml) { return '<section class="imp-pag"><div class="imp-txt">' + h(text) + '</div>' + (taulaHtml || '') + '</section>'; }

  /* ---------- Informe de grup (entrenador i coordinació) ---------- */
  function vGrup() {
    var d = D(), ws = wsInf(d), its = itemsInf(d), dms = dimsActives(d), js = jugActius(d);
    var o = '<button type="button" class="enllac no-imp" data-nav="tendencies">← ' + h(u('tendT')) + '</button><p class="muted no-imp">' + h(u('grupQ')) + '</p>' +
      '<div class="fila no-imp"><button type="button" class="btn" data-act="imprimeixGrup">' + h(u('infImp')) + '</button></div>';
    if (ws.length < 2) return o + '<p class="card suau">' + h(u('pocsDades')) + '</p>';
    var mitjana = function (f) { var v = ws.map(function (w) { return f(d.setm[w].ent); }).filter(function (x) { return x != null; }); return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length) : null; };
    var g = '<h1 tabindex="-1">' + h(u('grupT')) + '</h1><p><strong>' + h(d.equip.nom) + '</strong>' + (d.equip.club ? ' · ' + h(d.equip.club) : '') + (d.equip.temporada ? ' · ' + h(d.equip.temporada) : '') + '<br>' + h(u('periode')) + ': ' + h(periodeTxt(ws)) + '</p>';
    g += '<h2>' + h(u('grupEquipT')) + '</h2><div class="taula-wrap" tabindex="0"><table class="inf-taula"><caption>' + h(u('clauQual')) + '</caption><thead><tr><th scope="col">' + h(u('colItem')) + '</th><th scope="col">' + h(u('colEquip')) + '</th></tr></thead><tbody>' +
      its.map(function (it) { return '<tr><th scope="row">' + h(tx(it.t)) + '</th>' + cQual(mitjEq(d, ws, it), true) + '</tr>'; }).join('') + '</tbody></table></div>';
    g += '<ul class="punts"><li>' + h(u('clima')) + ': ' + (mitjana(function (e) { return climaIdx(e, d); }) == null ? '—' : mitjana(function (e) { return climaIdx(e, d); }) + '/100') + '</li><li>' + h(u('estil')) + ': ' + (mitjana(estilIdx) == null ? '—' : mitjana(estilIdx) + '/100') + '</li><li>' + h(u('tasca')) + ': ' + (mitjana(tascaPct) == null ? '—' : mitjana(tascaPct) + ' %') + '</li></ul>';
    g += '<h2>' + h(u('grupJugT')) + '</h2><div class="taula-wrap" tabindex="0"><table class="inf-taula matriu"><thead><tr><th scope="col">' + h(u('tendJug')) + '</th>' + dms.map(function (dm) { return '<th scope="col">' + h(tx(dm.t)) + '</th>'; }).join('') + '<th scope="col">' + h(u('assist')) + '</th></tr></thead><tbody>' +
      js.map(function (j) {
        var as = 0, ses = 0; ws.forEach(function (w) { var e = d.setm[w].ent, r = e.jug && e.jug[j.id]; if (!r) return; ses += e.n || 0; as += r.as == null ? (e.n || 0) : r.as; });
        return '<tr><th scope="row">' + h(nomJ(j)) + '</th>' + dms.map(function (dm) { return cQual(mitjJug(d, j, ws, { id: dm.id, f: 'd' })); }).join('') + '<td>' + (ses ? Math.round(as / ses * 100) + ' %' : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    var av = avisos(d).filter(function (a) { return a.nivell !== 0; });
    g += '<h2>' + h(u('tendAv')) + '</h2>' + (av.length ? '<ul class="punts">' + av.map(function (a) { return '<li><strong>' + h(a.tipus === 'equip' ? u('avEquip') : nomJ(a.j)) + '</strong> (' + h(a.nivell === 2 ? u('avAlt') : a.nivell === -1 ? u('avPos') : u('avSeg')) + '): ' + h(a.motius.join('; ')) + '</li>'; }).join('') + '</ul>' : '<p>' + h(u('avBuit')) + '</p>') +
      '<p class="muted petit">' + h(u('avNota')) + '</p>';
    return o + '<div id="grupCos" class="card">' + g + '</div>';
  }

  /* ---------- Informe per a la família ---------- */
  function textInforme(d, j) {
    var ws = setmanesFetes(d).slice(-12).filter(function (w) { return d.setm[w].ent.jug && d.setm[w].ent.jug[j.id]; });
    var es = S.lang === 'es', ella = j.g === 'f', nom = j.nom;
    if (ws.length < 3) return u('infPoc');
    var its = itemsInf(d).filter(function (it) { return it.f === 'd'; });
    var qk = function (it) { var q = qual(mitjJug(d, j, ws, it)); return q ? q.k : ''; };
    var forts = its.filter(function (it) { return qk(it) === 'destacat'; }).map(function (it) { return tx(it.t).toLowerCase(); });
    var feina = its.filter(function (it) { return qk(it) === 'alerta' || qk(it) === 'regular'; }).map(function (it) { return tx(it.t).toLowerCase(); });
    var nT = 0, nO = 0, as = 0, ses = 0;
    ws.forEach(function (w) { var e = d.setm[w].ent, r = e.jug[j.id]; if (r.o === 't' || r.o === 'e') { nO++; if (r.o === 't') nT++; } ses += e.n || 0; as += r.as == null ? (e.n || 0) : r.as; });
    var bons = pssActius(d).filter(function (it) { var k = 0; ws.forEach(function (w) { if (pssSig(it, (d.setm[w].ent.jug[j.id].c || {})[it.id]) > 0) k++; }); return k >= 3; }).map(function (it) { return tx(it.t).toLowerCase(); });
    var llista = function (a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + (es ? ' y ' : ' i ') + a[a.length - 1]; };
    var eq = d.equip ? d.equip.nom : '', p = [];
    if (es) {
      p.push('Informe de seguimiento · ' + nom + ' · ' + eq + (d.equip && d.equip.temporada ? ' · ' + d.equip.temporada : ''));
      p.push('Durante estas semanas hemos seguido de manera semanal la evolución de ' + nom + ' en el equipo, sobre todo en aquello que el club considera prioritario: la orientación a la tarea, el fair-play y el aprendizaje continuo, más que los resultados. Cada semana el entrenador recoge los momentos en que destaca y aquellos en que necesita más acompañamiento.');
      if (forts.length) p.push('Lo vemos cada vez con más recursos en ' + llista(forts) + ', y es un progreso que conviene reconocer en casa.');
      else if (!feina.length) p.push((ella ? 'La' : 'Lo') + ' vemos dentro de la normalidad del grupo, haciendo su camino de aprendizaje.');
      if (nO) p.push(nT / nO >= 0.6 ? 'La mayor parte de las semanas hemos visto su atención puesta en la tarea: aprender, mejorar y estar en la jugada.' : 'Algunas semanas su atención se ha ido hacia el resultado. Os proponemos, después de los partidos, preguntar primero «¿qué has aprendido hoy?» antes de hablar del marcador.');
      if (bons.length) p.push('Destacamos también, de manera repetida: ' + llista(bons) + '.');
      if (feina.length) p.push('Un aspecto en el que conviene seguir trabajando es ' + llista(feina) + '. Lo acompañamos desde los entrenamientos.');
      if (ses) p.push('Asistencia: ' + Math.round(as / ses * 100) + ' % de las sesiones.');
      p.push('Entiendo que vosotros también lo habéis podido ver en el día a día. Cualquier cosa que observéis en casa nos ayudará a acompañar' + (ella ? 'la' : 'lo') + ' mejor.');
    } else {
      p.push('Informe de seguiment · ' + nom + ' · ' + eq + (d.equip && d.equip.temporada ? ' · ' + d.equip.temporada : ''));
      p.push('Durant aquestes setmanes hem seguit de manera setmanal l\'evolució ' + (ella ? 'de na ' : 'd\'en ') + nom + ' a l\'equip, sobretot en allò que el club considera prioritari: l\'orientació a la tasca, el fair-play i l\'aprenentatge continu, més que no els resultats. Cada setmana l\'entrenador recull els moments en què destaca i aquells en què necessita més acompanyament.');
      if (forts.length) p.push('El' + (ella ? 'la' : '') + ' veim de cada vegada amb més recursos en ' + llista(forts) + ', i és un progrés que convé reconèixer a casa.');
      else if (!feina.length) p.push('El' + (ella ? 'la' : '') + ' veim dins la normalitat del grup, fent el seu camí d\'aprenentatge.');
      if (nO) p.push(nT / nO >= 0.6 ? 'La major part de les setmanes hem vist la seva atenció posada en la tasca: aprendre, millorar i estar dins la jugada.' : 'Algunes setmanes la seva atenció ha anat cap al resultat. Us proposam, després dels partits, demanar primer «què has après avui?» abans de parlar del marcador.');
      if (bons.length) p.push('Destacam també, de manera repetida: ' + llista(bons) + '.');
      if (feina.length) p.push('Un aspecte en què convé continuar fent feina és ' + llista(feina) + '. L\'acompanyam des dels entrenaments.');
      if (ses) p.push('Assistència: ' + Math.round(as / ses * 100) + ' % de les sessions.');
      p.push('Entenc que vosaltres, esper, també ho heu pogut veure amb el dia a dia. Qualsevol cosa que observeu a casa ens ajudarà a acompanyar-' + (ella ? 'la' : 'lo') + ' millor.');
    }
    return p.join('\n\n');
  }
  function vInforme() {
    var d = D(), j = per(arg, d.jug); if (!j) return vTendencies();
    return '<button type="button" class="enllac no-imp" data-nav="jugador" data-arg="' + j.id + '">← ' + h(nomJ(j)) + '</button><span class="kick no-imp">' + h(u('infT')) + '</span><h1 tabindex="-1" class="no-imp">' + h(u('infT')) + '</h1>' +
      '<p class="muted no-imp">' + h(u('infQ')) + '</p><label class="camp no-imp"><span class="sr">' + h(u('infT')) + '</span><textarea id="txtInf" rows="18">' + h(textInforme(d, j)) + '</textarea></label>' +
      '<div class="taula-wrap card no-imp" tabindex="0">' + taulaJug(d, j) + '</div>' +
      
      '<div class="fila no-imp"><button type="button" class="btn" data-act="imprimeix">' + h(u('infImp')) + '</button><button type="button" class="btn sec" data-act="copiaInf">' + h(u('infCopia')) + '</button></div>';
  }

  /* ---------- Plantilla ---------- */
  function vPlantilla() {
    var d = D(), et = d.equip ? per(d.equip.etapa, C.etapes) : null;
    var o = '<span class="kick">' + h(d.equip ? d.equip.nom : '') + '</span><h1 tabindex="-1">' + h(u('plantT')) + '</h1>';
    if (d.equip) o += '<div class="card suau"><p><strong>' + h(d.equip.nom) + '</strong> · ' + h(d.equip.esport || '') + ' · ' + h(et ? tx(et.t) : '') + (d.equip.club ? ' · ' + h(d.equip.club) : '') + '</p>' +
      (lectura() ? '' : '<button type="button" class="btn sec petit" data-nav="equip">' + h(u('edita')) + '</button>') + '</div>';
    if (!lectura()) o += '<form class="card" data-form="jug"><h2>' + h(u('jugQ')) + '</h2><p class="muted">' + h(u('plantNota')) + '</p>' +
      '<label class="camp"><span>' + h(u('nom')) + ' · ' + h(u('dorsal')) + '</span><textarea name="t" rows="3" placeholder="Pau 7&#10;Aina 10"></textarea></label><p class="muted petit">' + h(u('unPerLinia')) + '</p>' +
      '<button type="submit" class="btn">' + h(u('afegeix')) + '</button></form>';
    if (!d.jug.length) return o + '<p class="muted">' + h(u('plantBuit')) + '</p>';
    o += '<ul class="plant">' + d.jug.map(function (j) {
      return '<li class="card' + (j.actiu === false ? ' inactiu' : '') + '"><div class="fila-p"><strong>' + h(nomJ(j)) + '</strong>' + (j.actiu === false ? ' <span class="muted">(' + h(u('baixa')) + ')</span>' : '') + '</div>' +
        (lectura() ? '' : '<div class="fila petita">' +
          '<label class="mini"><span>' + h(u('nom')) + '</span><input data-pj="nom" data-id="' + j.id + '" value="' + h(j.nom) + '" maxlength="30"></label>' +
          '<label class="mini curt"><span>' + h(u('dorsal')) + '</span><input data-pj="dorsal" data-id="' + j.id + '" value="' + h(j.dorsal || '') + '" maxlength="4" inputmode="numeric"></label>' +
          '<label class="mini"><span>' + h(u('tracte')) + '</span><select data-pj="g" data-id="' + j.id + '"><option value="m"' + (j.g !== 'f' ? ' selected' : '') + '>' + h(u('nin')) + '</option><option value="f"' + (j.g === 'f' ? ' selected' : '') + '>' + h(u('nina')) + '</option></select></label>' +
          '<label class="chk"><input type="checkbox" data-pj="actiu" data-id="' + j.id + '"' + (j.actiu !== false ? ' checked' : '') + '><span>' + h(u('actiu')) + '</span></label></div>') + '</li>';
    }).join('') + '</ul>';
    return o;
  }

  /* ---------- Compartir ---------- */
  function vCompartir() {
    var o = (!S.equip && !lectura() ? '<button type="button" class="enllac" data-nav="setmana">← ' + h(u('equipT')) + '</button>' : '') + '<h1 tabindex="-1">' + h(u('compT')) + '</h1>';
    if (S.equip) o += vEnvia();
    if (S.equip) o += '<form class="card" data-form="exporta"><h2>' + h(u('expT')) + '</h2><p>' + h(u('expQ')) + '</p>' +
      '<label class="camp"><span>' + h(u('pass')) + '</span><input type="password" name="p1" minlength="8" autocomplete="new-password" required></label>' +
      '<label class="camp"><span>' + h(u('pass2')) + '</span><input type="password" name="p2" minlength="8" autocomplete="new-password" required></label>' +
      '<button type="submit" class="btn">' + h(u('expBtn')) + '</button></form>';
    o += '<form class="card" data-form="importa"><h2>' + h(u('impRecT')) + '</h2><p>' + h(u('impQ2')) + '</p>' +
      '<label class="camp"><span>' + h(u('impFitxer')) + '</span><input type="file" name="f" accept=".json,application/json" required></label>' +
      '<label class="camp"><span>' + h(u('pass')) + '</span><input type="password" name="p" autocomplete="off" required></label>' +
      '<button type="submit" class="btn sec">' + h(u('impRec')) + '</button></form>';
    o += '<div class="card suau"><h2>' + h(u('psiT')) + '</h2><p>' + h(u('psiQ')) + '</p><button type="button" class="btn sec" data-nav="panel">' + h(u('panelT')) + '</button></div>';
    if (S.equip) o += '<div class="card"><h2>' + h(u('ajT')) + '</h2><p>' + h(u('ajQ')) + '</p><button type="button" class="btn sec" data-nav="ajustos">' + h(u('ajT')) + '</button></div>';
    if (S.club && S.club.slug) o += '<div class="card"><h2>' + h(u('enllT')) + '</h2><p>' + h(u('enllQ')) + '</p><p class="enllac-club">' + h(enllacClub()) + '</p><button type="button" class="btn sec" data-act="copiaEnll">' + h(u('copiaEnll')) + '</button></div>';
    if (S.equip) {
      o += '<form class="card" data-form="recorda"><h2>' + h(u('recT')) + '</h2><p>' + h(u('recQ')) + '</p><div class="fila">' +
        '<label class="camp"><span>' + h(u('recDia')) + '</span><select name="dia">' + u('dies').map(function (x, i) { return '<option value="' + i + '"' + (i === +S.cfg.recorda.dia ? ' selected' : '') + '>' + h(x) + '</option>'; }).join('') + '</select></label>' +
        '<label class="camp"><span>' + h(u('recHora')) + '</span><input type="time" name="hora" value="' + h(S.cfg.recorda.hora || '20:00') + '"></label></div>' +
        '<button type="submit" class="btn sec">' + h(u('recBtn')) + '</button></form>';
      o += '<div class="card terra"><h2>' + h(u('perillT')) + '</h2><p>' + h(u('perillQ')) + '</p><button type="button" class="btn perill" data-act="esborraTot">' + h(u('perillT')) + '</button></div>';
    }
    return o;
  }

  /* ---------- Ajustos: ítems i llindars ---------- */
  function enllacClub() { return location.origin + location.pathname + '?club=' + encodeURIComponent(S.club.slug) + '&lang=' + S.lang; }
  function vAjustos() {
    if (psi()) {
      var LP = S.psiLl || BASE.cfg.llindars;
      return '<button type="button" class="enllac" data-nav="panel">' + h(u('tornaPanel')) + '</button><h1 tabindex="-1">' + h(u('ajLl')) + '</h1><p class="lead">' + h(u('ajPsiQ')) + '</p>' +
        '<fieldset class="card"><legend>' + h(u('ajLl')) + '</legend>' + numCamp('fin', u('ajFin'), LP.fin, 2, 8) + numCamp('min', u('ajMin'), LP.min, 1, 8) + numCamp('ego', u('ajEgo'), LP.ego, 1, 4) + '</fieldset>';
    }
    var cf = S.cfg, L = cf.llindars;
    var o = '<button type="button" class="enllac" data-nav="compartir">← ' + h(u('compT')) + '</button><h1 tabindex="-1">' + h(u('ajT')) + '</h1><p class="lead">' + h(u('ajQ')) + '</p>';
    o += '<fieldset class="card"><legend>' + h(u('ajClima')) + '</legend>' + C.clima.map(function (i) { return '<label class="chk bloc"><input type="checkbox" data-off="climaOff" value="' + i.id + '"' + (cf.climaOff[i.id] ? '' : ' checked') + '><span>' + h(tx(i.t)) + '</span></label>'; }).join('') + '</fieldset>';
    o += '<fieldset class="card"><legend>' + h(u('ajDims')) + '</legend>' + C.dims.map(function (i) { return '<label class="chk bloc"><input type="checkbox" data-off="dimsOff" value="' + i.id + '"' + (cf.dimsOff[i.id] ? '' : ' checked') + '><span>' + h(tx(i.t)) + ' <small class="muted">' + h(tx(i.d)) + '</small></span></label>'; }).join('') +
      cf.dimsExtra.map(function (x) { return '<div class="fila"><label class="chk bloc creix"><input type="checkbox" data-off="dimsOff" value="' + x.id + '"' + (cf.dimsOff[x.id] ? '' : ' checked') + '><span>' + h(x.t) + '</span></label><button type="button" class="enllac" data-act="treuExtra" data-id="' + x.id + '">' + h(u('esborra')) + '</button></div>'; }).join('') +
      '</fieldset><form class="card" data-form="extra"><label class="camp"><span>' + h(u('ajExtra')) + '</span><input name="t" maxlength="60" placeholder="' + h(u('ajExtraQ')) + '"></label><button type="submit" class="btn sec">' + h(u('afegeix')) + '</button></form>';
    o += '<fieldset class="card"><legend>' + h(u('ajPss')) + '</legend>' + C.pss.map(function (b) { return '<h4>' + h(tx(b.t)) + '</h4>' + b.items.map(function (i) { return '<label class="chk bloc"><input type="checkbox" data-off="pssOff" value="' + i.id + '"' + (cf.pssOff[i.id] ? '' : ' checked') + '><span>' + h(tx(i.t)) + '</span></label>'; }).join(''); }).join('') + '</fieldset>';
    o += '<fieldset class="card"><legend>' + h(u('ajLl')) + '</legend>' +
      numCamp('fin', u('ajFin'), L.fin, 2, 8) + numCamp('min', u('ajMin'), L.min, 1, 8) + numCamp('ego', u('ajEgo'), L.ego, 1, 4) + '</fieldset>';
    return o;
  }
  function numCamp(k, l, v, mn, mx) { return '<label class="camp fila-num"><span>' + h(l) + '</span><input type="number" data-ll="' + k + '" value="' + h(v) + '" min="' + mn + '" max="' + mx + '" inputmode="numeric"></label>'; }

  /* ---------- Mètode ---------- */
  function vMetode() {
    var P = C.piramide, es = S.lang === 'es';
    var cicle = es ? [['Objetivo', 'El entrenador fija de uno a tres objetivos de proceso para la semana.'], ['Observación', 'Como observador directo, toma notas en entrenamientos y partidos.'], ['Entrevista', 'Cinco minutos: objetivos, clima de equipo, su manera de entrenar y cada jugador respecto de sí mismo.'], ['Tendencia', 'Semana a semana aparecen las tendencias del equipo y de cada jugador.'], ['Psicólogo', 'Los avisos permiten anticipar, hablar con el entrenador, observar directamente y, si hace falta, intervenir.']]
      : [['Objectiu', 'L\'entrenador fixa d\'un a tres objectius de procés per a la setmana.'], ['Observació', 'Com a observador directe, pren notes als entrenaments i als partits.'], ['Entrevista', 'Cinc minuts: objectius, clima d\'equip, la seva manera d\'entrenar i cada jugador respecte de si mateix.'], ['Tendència', 'Setmana a setmana apareixen les tendències de l\'equip i de cada jugador.'], ['Psicòleg', 'Els avisos permeten anticipar, parlar amb l\'entrenador, observar directament i, si cal, intervenir.']];
    var o = '<span class="kick">APRENS</span><h1 tabindex="-1">' + h(u('metT')) + '</h1>';
    o += '<p class="lead">' + h(es ? 'Un programa de seguimiento semanal para forjar un carácter de deportista orientado a la tarea, con una adherencia elevada más allá de su nivel y con la atención puesta en la motivación interna. Recoge la metodología de observación del entrenador del CE Constància y el programa APRENS ESPORT, ahora más ágil.'
      : 'Un programa de seguiment setmanal per forjar un caràcter d\'esportista orientat a la tasca, amb una adherència elevada més enllà del seu nivell i amb l\'atenció posada en la motivació interna. Recull la metodologia d\'observació de l\'entrenador del CE Constància i el programa APRENS ESPORT, ara més àgil.') + '</p>';
    o += '<ol class="cicle">' + cicle.map(function (c) { return '<li><strong>' + h(c[0]) + '</strong><span>' + h(c[1]) + '</span></li>'; }).join('') + '</ol>';
    o += '<section class="card"><h2>' + h(es ? 'La pirámide del rendimiento' : 'La piràmide del rendiment') + '</h2><p>' + h(tx(P.intro)) + '</p><p class="muted">' + h(tx(P.llegir)) + '</p>' +
      '<div class="piramide">' + P.nivells.map(function (n, i) {
        return '<div class="niv" style="--w:' + (40 + i * 10) + '%"><strong>' + h(tx(n.t)) + '</strong>' + (n.m ? '<span class="me"><span class="m">' + h(tx(n.m)) + '</span><span class="e">' + h(tx(n.e)) + '</span></span><small>' + h((es ? 'En el cuaderno: ' : 'Al quadern: ') + tx(n.on)) + '</small>' : '') + '</div>';
      }).join('') + '</div><p class="llegenda-p"><span class="m">' + h(es ? 'Orientación a la maestría' : 'Orientació a la mestria') + '</span><span class="e">' + h(es ? 'Orientación al ego' : 'Orientació a l\'ego') + '</span></p></section>';
    o += '<section class="card"><h2>' + h(es ? 'La atención, en la base' : 'L\'atenció, a la base') + '</h2><ul class="punts">' +
      (es ? ['La atención puede ir hacia fuera (la jugada) o hacia dentro (pensamientos, emociones, cuerpo). Las dos son normales.', 'Quien decide adónde va la atención durante el juego es el cuerpo, según los hábitos aprendidos en los entrenamientos y las creencias sobre la situación.', 'Por eso el entrenador tiene que decir en qué y cuándo fijarse: es el ítem «claridad» de la ficha del CE Constància.', 'Los pensamientos y las emociones no se combaten: se observan, y se vuelve a la jugada. La clave no es no distraerse nunca, sino darse cuenta antes y volver más pronto.']
        : ['L\'atenció pot anar cap enfora (la jugada) o cap endins (pensaments, emocions, cos). Totes dues són normals.', 'Qui decideix on va l\'atenció durant el joc és el cos, segons els hàbits apresos als entrenaments i les creences sobre la situació.', 'Per això l\'entrenador ha de dir en què i quan fixar-se: és l\'ítem «claredat» de la fitxa del CE Constància.', 'Pensaments i emocions no es combaten: s\'observen, i es torna a la jugada. La clau no és no distreure\'s mai, sinó adonar-se\'n abans i tornar més aviat.']).map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') +
      '</ul><p><a href="https://aprens.net/descarregues/APRENS-atencio-maneig-emocional-esport.pdf" rel="noopener">' + h(es ? 'Dosier: Atención y manejo emocional en el deporte (PDF)' : 'Dossier: Atenció i maneig emocional a l\'esport (PDF)') + '</a> · ' +
      '<a href="https://aprens.net/descarregues/APRENS-piramide-rendiment.pdf" rel="noopener">' + h(es ? 'La pirámide del rendimiento (PDF)' : 'La piràmide del rendiment (PDF)') + '</a></p></section>';
    o += '<section class="card suau"><h2>' + h(es ? 'La clave de puntuación' : 'La clau de puntuació') + '</h2><p>' + h(es ? 'Es la clave del programa APRENS ESPORT. Ante cada ítem, el entrenador se pregunta qué jugadores se han apartado esta semana de la normalidad del equipo: 1 si han estado por debajo de la media, 0 si ha pasado algo significativo negativo, 3 si han destacado en positivo, y 2 el resto. No todos son 3 ni todos son 1: solo algunos. Así la entrevista es rápida y lo que queda registrado son justamente los momentos que conviene mirar, sin hacer rankings.'
      : 'És la clau del programa APRENS ESPORT. Davant cada ítem, l\'entrenador es demana quins jugadors s\'han apartat aquesta setmana de la normalitat de l\'equip: 1 si han estat per davall de la mitjana, 0 si ha passat alguna cosa significativa negativa, 3 si han destacat en positiu, i 2 la resta. No tots són 3 ni tots són 1: només alguns. Així l\'entrevista és ràpida i el que queda registrat són justament els moments que convé mirar, sense fer rànquings.') + '</p></section>';
    o += '<p class="muted">APRENS · Tòfol Villalonga · Psicòleg General Sanitari (B-01599) · Psicologia de l\'esport</p>';
    return o;
  }

  /* ================= XIFRAT ================= */
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  var ITER = 250000;
  function clau(pass, salt, iter) {
    return crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function xifra(obj, pass) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return clau(pass, salt, ITER).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, enc.encode(JSON.stringify(obj))); })
      .then(function (ct) { return { app: 'aprens-entrenador', v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }; });
  }
  function desxifra(box, pass) {
    if (!box || box.app !== 'aprens-entrenador' || !box.ct) return Promise.reject(new Error('format'));
    var iter = Math.min(Math.max(+box.iter || ITER, 100000), 2000000);
    return clau(pass, unb64(box.salt), iter).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, k, unb64(box.ct)); })
      .then(function (pt) { return JSON.parse(dec.decode(pt)); });
  }
  function baixa(nom, text, tipus) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: tipus })); a.download = nom; a.textContent = nom; a.hidden = true;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function slug(s) { return String(s || 'equip').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'equip'; }
  function avuiISO() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  /* ================= ENVIAMENT AL PSICÒLEG (entrenador) ================= */
  /* Paquet que surt del dispositiu: sense la clau del psicòleg ni l'acceptació. */
  function paquet() {
    var dades = clone(S); delete dades.avis; delete dades.psiLl; dades.cfg.clauPsi = ''; dades.cfg.enviat = '';
    return { exportat: new Date().toISOString(), dades: dades };
  }
  function prepHtml() {
    if (!PREP) return '';
    return '<div class="card verd"><p>' + h(u('enviaPrep')) + '</p><div class="fila">' + (navigator.share ? '<button type="button" class="btn" data-act="comparteix">' + h(u('enviaComp')) + '</button>' : '') +
      '<button type="button" class="btn sec" data-act="baixaPrep">' + h(u('enviaBaixa')) + '</button></div></div>';
  }
  function vEnvia() {
    if (!S.cfg.clauPsi) return '<form class="card blau" data-form="clauPsi"><h2>' + h(u('enviaT')) + '</h2><p>' + h(u('enviaQ')) + '</p>' +
      '<label class="camp"><span>' + h(u('clauPsi')) + '</span><input type="password" name="c" minlength="8" autocomplete="off" required></label>' +
      '<button type="submit" class="btn">' + h(u('clauDesa')) + '</button></form>';
    return '<div class="card blau"><h2>' + h(u('enviaT')) + '</h2><p>' + h(u('enviaQ2')) + '</p>' + (S.cfg.enviat ? '<p class="muted">' + h(u('enviat')) + ': ' + h(S.cfg.enviat.slice(0, 10)) + '</p>' : '') +
      '<div class="fila"><button type="button" class="btn" data-act="envia">' + h(u('enviaBtn')) + '</button><button type="button" class="btn sec" data-act="canviaClau">' + h(u('enviaCanvia')) + '</button></div>' + prepHtml() + '</div>';
  }
  function marcaEnviat() { S.cfg.enviat = new Date().toISOString(); desa(); render(); }
  function envia() {
    if (!S.cfg.clauPsi || !S.equip) { vés('compartir'); return; }
    xifra(paquet(), S.cfg.clauPsi).then(function (box) {
      PREP = { nom: 'aprens-equip-' + slug(S.equip.nom) + '-' + avuiISO() + '.json', text: JSON.stringify(box) };
      comparteix(true);
    }, function () { toast(u('impErr')); });
  }
  function comparteix(primer) {
    if (!PREP) return;
    var f = null;
    try { f = new File([PREP.text], PREP.nom, { type: 'application/json' }); } catch (e) { f = null; }
    if (f && navigator.canShare && navigator.canShare({ files: [f] })) {
      navigator.share({ files: [f], title: u('app'), text: u('enviaMsg') + (S.equip ? ' ' + S.equip.nom : '') }).then(marcaEnviat, function (e) {
        if (e && e.name === 'AbortError') return;
        render(); /* sense permís (cal un segon toc): queda el botó «Comparteix» */
      });
      if (primer) render();
      return;
    }
    baixa(PREP.nom, PREP.text, 'application/json'); toast(u('enviaBaixat')); marcaEnviat();
  }

  /* ================= PANEL DEL PSICÒLEG ================= */
  var LSP = 'aprens_quadern_panel_v1';
  function lsGetK(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSetK(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDelK(k) { try { localStorage.removeItem(k); } catch (e) { /* res */ } }
  function buidaImpressio() { var x = $('#impText'); if (x) x.innerHTML = ''; }
  window.addEventListener('afterprint', buidaImpressio);
  function tancaPanel() { PANEL = { key: null, salt: null, claus: [] }; PV = { llista: [], meta: [], act: -1 }; PANEL_NO_DESA = false; buidaImpressio(); }
  var PANEL_NO_DESA = false;
  /* Xifra l'estat actual del panel (en memòria) i en torna el text del fitxer. */
  function caixaPanel() {
    var cos = { equips: PV.llista.map(function (d, i) { var x = clone(d); delete x.avis; delete x.psiLl; return { rebut: PV.meta[i].rebut, exportat: PV.meta[i].exportat, dades: x }; }), claus: PANEL.claus };
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, PANEL.key, enc.encode(JSON.stringify(cos))).then(function (ct) {
      return JSON.stringify({ app: 'aprens-quadern-panel', v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(PANEL.salt), iv: b64(iv), ct: b64(ct) });
    });
  }
  /* Desa el panel; si el navegador no deixa, queda un avís fix i la promesa falla. */
  function desaPanel() {
    if (!PANEL.key) return Promise.resolve();
    return caixaPanel().then(function (txt) {
      PANEL_NO_DESA = !lsSetK(LSP, txt);
      if (PANEL_NO_DESA) throw new Error('desa');
    });
  }
  function obrePanel(box, codi) {
    if (!box || box.app !== 'aprens-quadern-panel' || !box.ct) return Promise.reject(new Error('format'));
    var salt = unb64(box.salt), iter = Math.min(Math.max(+box.iter || ITER, 100000), 2000000), key;
    return clau(codi, salt, iter).then(function (k) { key = k; return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, k, unb64(box.ct)); })
      .then(function (pt) {
        var cos = JSON.parse(dec.decode(pt)) || {};
        var claus = (Array.isArray(cos.claus) ? cos.claus : []).filter(function (c) { return typeof c === 'string' && c.length >= 8; }).slice(0, 50).map(function (c) { return c.slice(0, 200); });
        var llista = [], meta = [];
        (Array.isArray(cos.equips) ? cos.equips : []).forEach(function (e) {
          var d = normalitza(e && e.dades); if (!d.equip) return;
          llista.push(d); meta.push({ rebut: txt(e.rebut, 30), exportat: txt(e.exportat, 30) });
        });
        PANEL = { key: key, salt: salt, claus: claus }; PV = { llista: llista, meta: meta, act: -1 };
        if (iter !== ITER) { PANEL.salt = crypto.getRandomValues(new Uint8Array(16)); return clau(codi, PANEL.salt, ITER).then(function (k2) { PANEL.key = k2; return desaPanel(); }); }
      });
  }
  function creaPanel(codi) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    return clau(codi, salt, ITER).then(function (k) { PANEL = { key: k, salt: salt, claus: [] }; PV = { llista: [], meta: [], act: -1 }; return desaPanel(); });
  }
  /* Importa un fitxer d'un entrenador: prova la clau escrita i les claus desades al panel. */
  function importaAlPanel(box, extra) {
    var claus = (extra ? [extra] : []).concat(PANEL.claus.filter(function (c) { return c !== extra; }));
    var i = 0;
    function prova() {
      if (i >= claus.length) return Promise.reject(new Error('clau'));
      var c = claus[i++];
      return desxifra(box, c).then(function (obj) { return { obj: obj, clau: c }; }, prova);
    }
    return prova().then(function (r) {
      var d = normalitza(r.obj && r.obj.dades); if (!d.equip) throw new Error('buit');
      if (PANEL.claus.indexOf(r.clau) < 0) PANEL.claus.push(r.clau);
      var exportat = txt(r.obj.exportat, 30), idx = -1;
      PV.llista.forEach(function (x, k) { if (x.equip && x.equip.id === d.equip.id) idx = k; });
      var meta = { rebut: new Date().toISOString(), exportat: exportat };
      if (idx < 0) { PV.llista.push(d); PV.meta.push(meta); return 'nou'; }
      if (PV.meta[idx].exportat && exportat && exportat < PV.meta[idx].exportat) return 'antic';
      PV.llista[idx] = d; PV.meta[idx] = meta; return 'act';
    });
  }
  function submitPanel(tipus, fd, f) {
    if (tipus === 'panelCrea') {
      var c1 = String(fd.get('c1') || ''), c2 = String(fd.get('c2') || '');
      if (c1.length < 8 || c1 !== c2) { toast(u('passNo')); return true; }
      creaPanel(c1).then(function () { toast(u('panelCreat')); render(); }, function () { toast(u('impErr')); });
      return true;
    }
    if (tipus === 'panelObre') {
      var raw = null;
      try { raw = JSON.parse(lsGetK(LSP)); } catch (e) { raw = null; }
      obrePanel(raw, String(fd.get('c') || '')).then(render, function () { tancaPanel(); toast(u('panelErr')); });
      return true;
    }
    if (tipus === 'panelRecupera') {
      var fr = fd.get('f'), cr = String(fd.get('c') || '');
      if (!fr || !fr.size || fr.size > 2e7) { toast(u('impErr')); return true; }
      fr.text().then(function (t) { return obrePanel(JSON.parse(t), cr); }).then(desaPanel)
        .then(function () { toast(u('recOk')); render(); }, function () { if (PANEL_NO_DESA) { render(); return; } tancaPanel(); toast(u('panelErr')); });
      return true;
    }
    if (tipus === 'panelImporta') {
      var fitxers = fd.getAll('f').filter(function (x) { return x && x.size && x.size < 5e6; }), extra = String(fd.get('c') || '');
      if (!fitxers.length) { toast(u('impErr')); return true; }
      var res = { nou: 0, act: 0, antic: 0, err: 0 };
      fitxers.reduce(function (pr, fi) {
        return pr.then(function () { return fi.text(); }).then(function (t) { return importaAlPanel(JSON.parse(t), extra.length >= 8 ? extra : ''); })
          .then(function (r) { res[r]++; }, function () { res.err++; });
      }, Promise.resolve()).then(desaPanel).then(function () {
        toast(u('panelImpRes').replace('{n}', res.nou).replace('{a}', res.act).replace('{e}', res.err + res.antic));
        render();
      }, function () { render(); });
      return true;
    }
    if (tipus === 'panelClau') {
      var nc = String(fd.get('c') || '');
      if (nc.length < 8) { toast(u('passNo')); return true; }
      if (PANEL.claus.indexOf(nc) < 0) PANEL.claus.push(nc);
      desaPanel().then(function () { toast(u('clauDesada')); render(); }, render);
      return true;
    }
    return false;
  }
  function vPanel() {
    PV.act = -1;
    var o = '<span class="kick">APRENS</span><h1 tabindex="-1">' + h(u('panelT')) + '</h1>';
    if (!psi()) {
      if (lsGetK(LSP)) return o + '<form class="card" data-form="panelObre"><p>' + h(u('panelObreQ')) + '</p><label class="camp"><span>' + h(u('codi')) + '</span><input type="password" name="c" autocomplete="current-password" required></label>' +
        '<button type="submit" class="btn">' + h(u('panelObre')) + '</button></form>' +
        '<div class="card terra"><p>' + h(u('panelOblit')) + '</p><button type="button" class="btn perill petit" data-act="esborraPanel">' + h(u('panelEsborra')) + '</button></div>';
      return o + '<p class="lead">' + h(u('panelNouQ')) + '</p><form class="card" data-form="panelCrea"><h2>' + h(u('panelCrea')) + '</h2>' +
        '<label class="camp"><span>' + h(u('codi')) + '</span><input type="password" name="c1" minlength="8" autocomplete="new-password" required></label>' +
        '<label class="camp"><span>' + h(u('codi2')) + '</span><input type="password" name="c2" minlength="8" autocomplete="new-password" required></label>' +
        '<p class="muted">' + h(u('panelAvisCodi')) + '</p><button type="submit" class="btn">' + h(u('panelCrea')) + '</button></form>' +
        '<form class="card suau" data-form="panelRecupera"><h2>' + h(u('panelRecT')) + '</h2><label class="camp"><span>' + h(u('impFitxer')) + '</span><input type="file" name="f" accept=".json,application/json" required></label>' +
        '<label class="camp"><span>' + h(u('codi')) + '</span><input type="password" name="c" autocomplete="off" required></label><button type="submit" class="btn sec">' + h(u('panelRecBtn')) + '</button></form>';
    }
    if (PANEL_NO_DESA) o += '<div class="card terra" role="alert"><strong>' + h(u('noDesaT')) + '</strong><p>' + h(u('panelNoDesa')) + '</p><button type="button" class="btn petit" data-act="baixaPanel">' + h(u('panelCopiaBtn')) + '</button></div>';
    o += '<form class="card blau" data-form="panelImporta"><h2>' + h(u('panelImpT')) + '</h2><p>' + h(u('panelImpQ')) + '</p>' +
      '<label class="camp"><span>' + h(u('impFitxer')) + '</span><input type="file" name="f" accept=".json,application/json" multiple required></label>' +
      '<label class="camp"><span>' + h(u('panelImpPass')) + '</span><input type="password" name="c" autocomplete="off"></label>' +
      '<button type="submit" class="btn">' + h(u('panelImpBtn')) + '</button></form>';
    var avui = wid(new Date()), totsAv = [];
    if (!PV.llista.length) o += '<p class="card suau">' + h(u('panelSenseEq')) + '</p>';
    else {
      o += '<section class="card"><h2>' + h(u('panelEquipsT')) + '</h2><ul class="llista-jug">' + PV.llista.map(function (d, i) {
        var ws = setmanesFetes(d), ult = ws[ws.length - 1], sense = ult ? setmanesEntre(ult, avui) : null;
        var av = avisos(d), alts = av.filter(function (a) { return a.nivell === 2; }), nSeg = av.filter(function (a) { return a.nivell === 1; }).length;
        alts.forEach(function (a) { totsAv.push({ d: d, a: a }); });
        var info = [d.equip.club, u('ultima') + ': ' + (ult ? etiquetaW(ult) : u('mai'))];
        if (sense != null && sense >= 2) info.push(sense + ' ' + u('senseEnt'));
        if (alts.length) info.push(alts.length + ' · ' + u('avAlt').toLowerCase());
        if (nSeg) info.push(nSeg + ' · ' + u('avSeg').toLowerCase());
        return '<li><div class="fila-eq"><button type="button" class="fila-jug' + (alts.length ? ' alt' : nSeg ? ' marcat' : '') + '" data-act="obreEquip" data-i="' + i + '"><strong>' + h(d.equip.nom) + '</strong><span class="muted">' + h(info.filter(Boolean).join(' · ')) + '</span></button>' +
          '<button type="button" class="enllac" data-act="treuEquip" data-i="' + i + '" aria-label="' + h(u('treuEquip') + ': ' + d.equip.nom) + '">' + h(u('treuEquip')) + '</button></div></li>';
      }).join('') + '</ul></section>';
      o += '<section class="card"><h2>' + h(u('panelAvClub')) + '</h2>' + (totsAv.length ? '<ul class="avisos">' + totsAv.map(function (x) {
        return '<li class="av n2"><strong>' + h(x.d.equip.nom) + '</strong> · ' + (x.a.tipus === 'equip' ? h(u('avEquip')) : h(nomJ(x.a.j))) + '<ul>' + x.a.motius.map(function (m) { return '<li>' + h(m) + '</li>'; }).join('') + '</ul></li>';
      }).join('') + '</ul>' : '<p>' + h(u('avBuit')) + '</p>') + '</section>';
    }
    o += '<form class="card" data-form="panelClau"><h2>' + h(u('panelClausT')) + '</h2><p>' + h(u('panelClausQ')) + '</p><p class="muted">' + PANEL.claus.length + ' ' + h(u('nClaus')) + '</p>' +
      '<label class="camp"><span>' + h(u('clauNova')) + '</span><input type="password" name="c" minlength="8" autocomplete="off"></label><div class="fila"><button type="submit" class="btn sec">' + h(u('clauDesa')) + '</button>' +
      (PANEL.claus.length ? '<button type="button" class="btn sec" data-act="treuClaus">' + h(u('treuClaus')) + '</button>' : '') + '</div></form>';
    o += '<div class="card"><h2>' + h(u('ajLl')) + '</h2><p>' + h(u('ajPsiQ')) + '</p><button type="button" class="btn sec" data-nav="ajustos">' + h(u('ajLl')) + '</button></div>';
    o += '<div class="card suau"><h2>' + h(u('panelCopiaT')) + '</h2><p>' + h(u('panelCopiaQ')) + '</p><div class="fila"><button type="button" class="btn sec" data-act="baixaPanel">' + h(u('panelCopiaBtn')) + '</button>' +
      '<button type="button" class="btn" data-act="tancaPanel">' + h(u('panelTanca')) + '</button></div></div>';
    return o;
  }
  function vInformes() {
    var d = D();
    var o = '<button type="button" class="enllac no-imp" data-nav="tendencies">← ' + h(u('tendT')) + '</button><span class="kick no-imp">' + h(d.equip ? d.equip.nom : '') + '</span><h1 tabindex="-1" class="no-imp">' + h(u('informesT')) + '</h1>' +
      '<p class="muted no-imp">' + h(u('infQ')) + '</p><div class="fila no-imp"><button type="button" class="btn" data-act="imprimeixTots">' + h(u('imprimeixTots')) + '</button></div>';
    jugActius(d).forEach(function (j) {
      o += '<div class="card no-imp"><label class="camp"><span>' + h(nomJ(j)) + '</span><textarea data-inf="' + j.id + '" rows="12">' + h(textInforme(d, j)) + '</textarea></label><div class="taula-wrap" tabindex="0">' + taulaJug(d, j) + '</div></div>';
    });
    return o;
  }

  /* ================= ESDEVENIMENTS ================= */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-lang],[data-nav],[data-act]'); if (!b) return;
    if (b.dataset.lang) { S.lang = b.dataset.lang; desa(); render(); return; }
    if (b.dataset.nav) {
      if (b.dataset.nav === 'tendencies' && b.dataset.arg === 'avisos') { vés('tendencies'); var a = $('#avisos'); if (a) a.scrollIntoView(); return; }
      if (b.dataset.nav !== 'objectius') esborrany = esborrany && ruta === 'entrevista' && b.dataset.nav === 'plantilla' ? esborrany : null;
      if (b.dataset.nav === 'panel') PV.act = -1;
      vés(b.dataset.nav, b.dataset.arg); return;
    }
    var act = b.dataset.act, sm;
    switch (act) {
      case 'accepta': S.avis = true; desa(); vés(S.equip ? 'setmana' : 'equip'); break;
      case 'accPsi': S.avis = true; desa(); vés('panel'); break;
      case 'envia': envia(); break;
      case 'anarEnvia': vés('compartir'); break;
      case 'comparteix': comparteix(); break;
      case 'baixaPrep': if (PREP) { baixa(PREP.nom, PREP.text, 'application/json'); marcaEnviat(); } break;
      case 'canviaClau': S.cfg.clauPsi = ''; desa(); render(); break;
      case 'obreEquip': PV.act = +b.dataset.i; vés('tendencies'); break;
      case 'treuEquip': if (window.confirm(u('treuConf'))) { PV.llista.splice(+b.dataset.i, 1); PV.meta.splice(+b.dataset.i, 1); PV.act = -1; desaPanel().then(render, render); } break;
      case 'tancaPanel': tancaPanel(); vés('panel'); break;
      case 'baixaPanel': if (psi()) caixaPanel().then(function (bx) { baixa('aprens-panel-psicoleg-' + avuiISO() + '.json', bx, 'application/json'); }); break;
      case 'esborraPanel': if (window.confirm(u('panelEsborraConf'))) { lsDelK(LSP); tancaPanel(); vés('panel'); } break;
      case 'treuClaus': if (window.confirm(u('treuClausConf'))) { PANEL.claus = []; desaPanel().then(render, render); } break;
      case 'imprimeixTots':
        $('#impText').innerHTML = $$('textarea[data-inf]').map(function (t) { var tb = document.getElementById('taula-' + t.dataset.inf); return impJug(t.value, tb ? tb.outerHTML : ''); }).join('');
        window.print(); break;
      case 'wAnt': setmVista.setDate(setmVista.getDate() - 7); render(); break;
      case 'wSeg': setmVista.setDate(setmVista.getDate() + 7); render(); break;
      case 'wAvui': setmVista = dilluns(new Date()); render(); break;
      case 'area': esborrany.area = b.dataset.id; render(); break;
      case 'sugObj': afegeixObj(tx(per(esborrany.area, C.arees).sug[+b.dataset.i])); break;
      case 'treuObj': esborrany.obj.splice(+b.dataset.i, 1); render(); break;
      case 'desaObj': sm = setm(wActual(), true); sm.obj = esborrany.obj; esborrany = null; desa(); vés('setmana'); break;
      case 'cancelObj': esborrany = null; vés('setmana'); break;
      case 'esborraNota': S.notes = S.notes.filter(function (n) { return n.id !== b.dataset.id; }); desa(); render(); break;
      case 'obreEnt':
        sm = setm(wActual());
        var e = sm && sm.ent ? clone(sm.ent) : nouEnt();
        jugActius(S).forEach(function (j) { if (!e.jug[j.id]) e.jug[j.id] = { d: {}, o: '', as: null, s: [], n: '' }; });
        esborrany = { tipus: 'ent', ent: e }; pasEnt = 0; vés('entrevista'); break;
      case 'pasAnt': pasEnt = Math.max(0, pasEnt - 1); arg = null; render(); window.scrollTo(0, 0); break;
      case 'pasSeg': pasEnt = Math.min(PASSOS - 1, pasEnt + 1); arg = null; render(); window.scrollTo(0, 0); var hh = $('h1'); if (hh) hh.focus(); break;
      case 'sessions': esborrany.ent.n = Math.max(0, Math.min(7, esborrany.ent.n + (+b.dataset.d))); render(); break;
      case 'obreJug': arg = arg === b.dataset.id ? null : b.dataset.id; render(); var f = $('[data-act="obreJug"][data-id="' + b.dataset.id + '"]'); if (f) { f.focus(); f.scrollIntoView({ block: 'start' }); } break;
      case 'assist':
        var r = esborrany.ent.jug[b.dataset.id], n = esborrany.ent.n;
        r.as = Math.max(0, Math.min(n, (r.as == null ? n : r.as) + (+b.dataset.d))); render(); break;
      case 'desaEnt':
        sm = setm(wActual(), true); esborrany.ent.fet = true; esborrany.ent.data = avuiISO();
        Object.keys(esborrany.ent.jug).forEach(function (k) { var rr = esborrany.ent.jug[k]; Object.keys(rr.d).forEach(function (dk) { if (!rr.d[dk]) delete rr.d[dk]; }); });
        sm.ent = esborrany.ent; esborrany = null; desa(); toast(u('entDesada')); vés('setmana'); break;
      case 'imprimeix': var tj = $('.inf-taula'); $('#impText').innerHTML = impJug($('#txtInf').value, tj ? tj.outerHTML : ''); window.print(); break;
      case 'imprimeixGrup': var gc = $('#grupCos'); if (gc) { $('#impText').innerHTML = '<section class="imp-pag">' + gc.innerHTML + '</section>'; window.print(); } break;
      case 'copiaInf':
        var t = $('#txtInf').value;
        if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast(u('copiat')); }, function () { $('#txtInf').select(); });
        else $('#txtInf').select();
        break;
      case 'copiaEnll':
        if (navigator.clipboard) navigator.clipboard.writeText(enllacClub()).then(function () { toast(u('copiat')); }, function () {});
        break;
      case 'treuExtra': S.cfg.dimsExtra = S.cfg.dimsExtra.filter(function (x) { return x.id !== b.dataset.id; }); desa(); render(); break;
      case 'esborraTot': if (window.confirm(u('perillConf'))) { lsDel(); S = clone(BASE); S.lang = U[S.lang] ? S.lang : 'ca'; vés('setmana'); } break;
    }
  });
  function afegeixObj(t) {
    t = String(t || '').trim(); if (!t) return;
    if (esborrany.obj.length >= 3) { toast(u('objMax')); return; }
    esborrany.obj.push({ a: esborrany.area, t: t.slice(0, 120) }); render();
  }

  document.addEventListener('change', function (ev) {
    var el = ev.target, ds = el.dataset;
    if (ds.esc) { var p = ds.esc.split('.'), v = +el.value; if (p.length === 1) esborrany.ent[p[0]] = v; else esborrany.ent[p[0]][p[1]] = v; return; }
    if (ds.ent === 'partit') { esborrany.ent.partit = el.value === '1'; return; }
    if (ds.jd) { esborrany.ent.jug[ds.jd].d[ds.dim] = +el.value; return; }
    if (ds.jo != null && el.name.indexOf('o_') === 0) { esborrany.ent.jug[ds.jo].o = el.value; return; }
    if (ds.jc) {
      var rc = esborrany.ent.jug[ds.jc], it = null; C.pss.forEach(function (b) { b.items.forEach(function (i) { if (i.id === ds.it) it = i; }); });
      if (!rc || !it) return; rc.c = rc.c || {};
      var nv = it.tipus === 'si' ? (el.checked ? 1 : 0) : Math.max(-2, Math.min(20, parseInt(el.value, 10) || 0));
      if (it.tipus === 'esc') nv = Math.max(-2, Math.min(1, nv));
      if (it.tipus === 'num' && nv < 0) nv = 0;
      if (nv) rc.c[ds.it] = nv; else delete rc.c[ds.it];
      return;
    }
    if (ds.js) { var r = esborrany.ent.jug[ds.js]; r.s = r.s.filter(function (x) { return x !== el.value; }); if (el.checked) r.s.push(el.value); return; }
    if (ds.pj) {
      var j = per(ds.id, S.jug); if (!j) return;
      if (ds.pj === 'actiu') j.actiu = el.checked; else j[ds.pj] = String(el.value).trim().slice(0, ds.pj === 'dorsal' ? 4 : 30);
      if (!j.nom) j.nom = '—';
      desa(); render(); return;
    }
    if (ds.off) { S.cfg[ds.off][el.value] = !el.checked; if (el.checked) delete S.cfg[ds.off][el.value]; desa(); return; }
    if (ds.ll) {
      var n = parseInt(el.value, 10); if (isNaN(n)) return;
      n = Math.max(+el.min, Math.min(+el.max, n));
      if (psi()) { if (!S.psiLl) S.psiLl = clone(BASE.cfg.llindars); S.psiLl[ds.ll] = n; } else S.cfg.llindars[ds.ll] = n;
      desa(); return;
    }
  });
  document.addEventListener('input', function (ev) {
    var el = ev.target, ds = el.dataset;
    if (ds.ent === 'r1' || ds.ent === 'r2') esborrany.ent[ds.ent] = el.value;
    if (ds.jn) esborrany.ent.jug[ds.jn].n = el.value;
  });

  document.addEventListener('submit', function (ev) {
    var f = ev.target, tipus = f.dataset.form; if (!tipus) return;
    ev.preventDefault();
    var fd = new FormData(f);
    if (tipus === 'equip') {
      var nom = String(fd.get('nom') || '').trim(); if (!nom) return;
      S.equip = { id: S.equip && S.equip.id ? S.equip.id : uid(), nom: nom.slice(0, 60), esport: String(fd.get('esport') || '').trim().slice(0, 40), etapa: String(fd.get('etapa')), temporada: String(fd.get('temporada') || '').trim().slice(0, 20), club: String(fd.get('club') || '').trim().slice(0, 60) };
      desa(); vés(S.jug.length ? 'setmana' : 'plantilla');
    } else if (tipus === 'objPropi') { afegeixObj(fd.get('t')); }
    else if (tipus === 'nota') {
      var t = String(fd.get('t') || '').trim(); if (!t) return;
      S.notes.push({ id: uid(), w: wActual(), j: String(fd.get('j') || ''), a: String(fd.get('a') || ''), ctx: String(fd.get('ctx') || 'ent'), t: t.slice(0, 600), data: avuiISO() });
      desa(); toast(u('notaDesada')); vés('setmana');
    } else if (tipus === 'jug') {
      var linies = String(fd.get('t') || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean), n = 0;
      linies.forEach(function (l) {
        var m = l.match(/^(.*?)[\s,;·-]*(\d{1,3})?$/), nm = (m && m[1] ? m[1] : l).trim().slice(0, 30), ds = m && m[2] ? m[2] : '';
        if (!nm) return; S.jug.push({ id: uid(), nom: nm, dorsal: ds, g: 'm', actiu: true }); n++;
      });
      if (n) { desa(); toast(u('jugAfegit')); render(); }
    } else if (tipus === 'extra') {
      var tt = String(fd.get('t') || '').trim(); if (!tt) return;
      S.cfg.dimsExtra.push({ id: 'x' + uid(), t: tt.slice(0, 60) }); desa(); render();
    } else if (tipus === 'exporta') {
      var p1 = String(fd.get('p1') || ''), p2 = String(fd.get('p2') || '');
      if (p1.length < 8 || p1 !== p2) { toast(u('passNo')); return; }
      xifra(paquet(), p1).then(function (box) {
        baixa('aprens-equip-' + slug(S.equip.nom) + '-' + avuiISO() + '.json', JSON.stringify(box), 'application/json'); f.reset(); toast(u('expOk'));
      }, function () { toast(u('impErr')); });
    } else if (tipus === 'importa') {
      var file = fd.get('f'), pass = String(fd.get('p') || '');
      if (!file || !file.size || file.size > 5e6) { toast(u('impErr')); return; }
      file.text().then(function (txt) { return desxifra(JSON.parse(txt), pass); }).then(function (obj) {
        var dd = normalitza(obj && obj.dades);
        if (!dd.equip) throw new Error('buit');
        if (!window.confirm(u('recConf'))) return;
        dd.avis = true; dd.lang = S.lang; dd.cfg.clauPsi = S.equip && S.equip.id === dd.equip.id ? S.cfg.clauPsi : ''; S = dd; desa(); toast(u('recOk')); vés('setmana');
      }).catch(function () { toast(u('impErr')); });
    } else if (tipus === 'clauPsi') {
      var cp = String(fd.get('c') || ''); if (cp.length < 8) { toast(u('passNo')); return; }
      S.cfg.clauPsi = cp; desa(); toast(u('clauDesada')); render();
    } else if (submitPanel(tipus, fd, f)) { /* gestionat pel panel */
    } else if (tipus === 'recorda') {
      S.cfg.recorda = { dia: +fd.get('dia'), hora: String(fd.get('hora') || '20:00') }; desa();
      baixa('recordatori-entrevista.ics', ics(S.cfg.recorda), 'text/calendar');
    }
  });

  function ics(r) {
    var d = new Date(), hm = (r.hora || '20:00').split(':');
    d.setDate(d.getDate() + ((r.dia - d.getDay() + 7) % 7)); d.setHours(+hm[0] || 20, +hm[1] || 0, 0, 0);
    var p = function (n) { return String(n).padStart(2, '0'); };
    var dt = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(d.getHours()) + p(d.getMinutes()) + '00';
    var tit = u('entT') + ' · ' + u('app');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//APRENS//Quadern entrenador//CA', 'BEGIN:VEVENT', 'UID:' + uid() + '@aprens', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART:' + dt, 'DURATION:PT10M', 'RRULE:FREQ=WEEKLY', 'SUMMARY:' + tit, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + tit, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }

  /* ================= INICI ================= */
  var NOU = !lsGet();
  if (NOU) S.lang = /^es/i.test(navigator.language || '') ? 'es' : 'ca';
  function inici() { aplicaClub(); render(); }
  (function llegeixURL() {
    var p; try { p = new URLSearchParams(location.search); } catch (e) { inici(); return; }
    var lang = p.get('lang'), slug = p.get('club');
    if (NOU && (lang === 'ca' || lang === 'es')) S.lang = lang;
    if (!slug || !/^[a-z0-9-]{1,40}$/.test(slug) || (S.club && S.club.slug === slug && !NOU)) { inici(); return; }
    fetch(CLUBS + 'clubs/' + slug + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      var c = j && netejaClub(Object.assign({}, j, { slug: slug }));
      if (c) {
        S.club = c;
        if (NOU && c.idioma && !(lang === 'ca' || lang === 'es')) S.lang = c.idioma;
        if (!S.equip) configClub(j.quadern, S.cfg);
        desa();
      }
      inici();
    }).catch(inici);
  })();
})();
