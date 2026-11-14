/* Misión Barrio · idioma (castellano / català)
   El castellano está escrito en el HTML; aquí va el catalán de los textos fijos
   (marcados con data-i18n). Los textos del juego usan MB.L(es, ca) en app.js.
   Idioma: #ca o ?lang=ca en la URL (desde el hub: #/tool/mision_barrio/ca) o el
   último elegido con el selector ES/CA, guardado en este dispositivo. */
(function (g) {
  "use strict";
  var KEY = "mision_barrio_lang";
  var CA = {
    brand2: "Missió Barri",
    eyebrowHero: "Mode aventura · sortir amb els meus amics",
    h1: 'Missió<br><span class="h1-acc">Barri</span>',
    heroTag: "Nivell a nivell, tornes a sortir amb la teva colla. No cal que la por se'n vagi per jugar: surt amb tu, i el comandament el duus tu.",
    ctaPlay: "▶ Començar a jugar",
    ctaFam: "Per a mamà i papà",
    numAntes: "Abans de jugar",
    h2Alarma: "La teva alarma és massa sensible",
    pAlarma1: "Coneixes aquelles alarmes de cotxe que xiulen encara que només hi passi un moix? El teu cervell té una alarma així. Després de sentir notícies i comentaris, s'ha posat <b>supersensible</b>: sona encara que siguis al teu barri de sempre, amb els teus amics.",
    pAlarma2: "L'alarma no s'arregla quedant-te a casa (així aprèn que tenia raó). S'arregla <b>sortint una mica cada vegada i quedant-t'hi fins al final</b>. Cada missió li ensenya: «Ho veus? Era un moix».",
    numReglas: "Regles del joc",
    h2Reglas: "Com es juga",
    regla1: '<span class="rn">1</span><b>Tria el nivell que toca</b><span>Comences pel més fàcil. Quan el superes, es desbloqueja el següent.</span>',
    regla2: '<span class="rn">2</span><b>Activa els teus superpoders</b><span>Abans i durant la missió: el globus, el radar, el comentarista i el detectiu.</span>',
    regla3: "<span class=\"rn\">3</span><b>Queda-t'hi fins al final</b><span>Aquesta és la regla d'or. Tornar abans d'hora dona la raó a l'alarma.</span>",
    regla4: '<span class="rn">4</span><b>Conta què ha passat de veritat</b><span>Guanyes XP, cromos i pots bescanviar premis a la botiga.</span>',
    numJug: "El teu jugador",
    h2Jug: "Tria el teu personatge",
    numPod: "Els teus superpoders",
    h2Pod: "Entrena'ls també a casa",
    pPod: "Els superpoders funcionen millor si els practiques en estones tranquil·les, no només el dia de la missió. Com al futbol: s'entrena abans del partit.",
    h3Balon: "El globus",
    pBalon: "Imagina't un globus a la panxa. Quan agafes aire pel nas s'infla a poc a poc; quan el deixes anar per la boca es desinfla encara més a poc a poc. Tres vegades.",
    balonTxt: "Prem per entrenar",
    balonBtn: "Entrenar el globus",
    h3Radar: "El radar del cos",
    pRadar: "On sona l'alarma? A la panxa, al pit, a la gola, a les cames… o a la cara calenta de la vergonya. Troba-la, posa-li un número del 0 al 10 i envia-hi l'aire del globus. No cal que se'n vagi: només li fas companyia.",
    pComent: "Quan el teu cap digui «no puc» o «som beneit», canvia de veu i fes de comentarista: <i>«Atenció! El jugador té por… i tot i així surt al camp! Quina valentia!»</i>",
    h3Det: "El detectiu d'alarmes",
    pDet: "Abans de sortir, apunta què diu l'alarma. Quan tornis, comprova-ho com un detectiu: <b>ha passat de veritat?</b> Cada falsa alarma que caces fa que la pròxima soni més fluix.",
    numMapa: "El mapa del barri",
    h2Mapa: "Nivell a nivell, fins al boss final",
    pMapa: "Repeteix cada nivell <b>2 o 3 vegades</b> fins que el dominis (👑). Amb mamà o papà podeu <b>editar, esborrar o afegir</b> nivells: s'ordenen tots sols per dificultat.",
    btnAdd: "＋ Afegir un nivell",
    btnReset: "Restaurar l'exemple",
    numAlbum: "El teu àlbum",
    h2Album: "Col·lecció de cromos",
    pAlbum: "Cada cromo es desbloqueja amb una cosa que has fet de veritat. Els aconseguiràs tots?",
    numTienda: "La botiga",
    h2Tienda: "Bescanvia els teus XP per premis",
    pTienda: "Els premis es pacten amb mamà i papà. Els XP que guanyes no es perden mai: són teus perquè has estat valent.",
    numFam: "Per a mamà i papà",
    h2Fam: "Com acompanyar sense llevar-li el comandament",
    pFam: "El joc funciona si vosaltres sosteniu el pla. Aquestes són les claus que treballam a la consulta.",
    s1: "📅 1–2 sortides per setmana, en dies fixos",
    p1: "Apuntau-les com una cita més (per exemple, dimarts i dissabte). Si el dia el decideix la por, la por sempre troba un motiu perquè no sigui avui.",
    s2: "🧱 Validar sí, negociar no",
    p2: "Una frase que validi i seguir: «Sé que et costa i et crec. Avui toca el nivell 3». Evitau la negociació llarga i les explicacions repetides: com més es discuteix, més gros sembla el perill. El que sí que podeu fer és triar junts el nivell <i>abans</i> del dia.",
    s3: "🏠 Aquell dia, els amics no venen a casa",
    p3: "Que els amics venguin a casa en lloc de sortir és una manera amable d'evitar. El dia de missió, el pla és fora. Els altres dies, que venguin quan vulgueu.",
    s4: "📱 Poques comprovacions, i cada vegada menys",
    p4: "Si acordau un missatge en arribar, que sigui un i que vagi desapareixent als nivells alts. Les telefonades de «estàs bé?» cada estona mantenen viva l'alarma (la seva i la vostra).",
    s5: "🔁 Si demana «i si em passa qualque cosa?» una vegada i una altra",
    p5: "Responeu una vegada amb calma. A la segona: «Això ja ho hem parlat. Què diria el teu detectiu?». Tranquil·litzar en bucle alleuja un minut i alimenta l'alarma. Millor una abraçada que una explicació més.",
    s6: "🎁 Premi immediat i per l'esforç",
    p6: "Celebrau-ho quan torni, anomenant el que ha fet: «Et costava i has sortit, i t'hi has quedat fins al final». Que el premi sigui una cosa que de veritat el motivi i que arribi aviat.",
    s7: "⚖️ Els XP no es lleven per portar-se malament",
    p7: "Els XP van lligats a la valentia. Per a les respostes desafiants o les faltes de respecte, un límit breu i consistent, sense sermó i per separat: així la missió no es converteix en un càstig.",
    s8: "🌬️ Vosaltres primer",
    p8: "Abans d'acomiadar-vos, respirau vosaltres. El vostre to li diu si el carrer és perillós o no. Si us veu tranquils amb la vostra pròpia inquietud, aprèn que es pot.",
    s9: "↩️ Si un nivell surt malament",
    p9: "Repetiu aquest nivell o baixau-ne un, però no deixeu de sortir del tot. Un mal dia també és un entrenament: ho comentam a la propera sessió.",
    eyePsi: "Per al teu psicòleg o psicòloga",
    h2Psi: "Porta les teves missions a sessió",
    leadPsi: "Això no substitueix la feina a la consulta: serveix per practicar i apuntar entre sessions. Envia les teves missions amb la barra de baix i les revisam junts.",
    lblCod: "El teu codi",
    rewardClose: "Continuar jugant!",
    foot: "<b>APRENS · TEC · AIS</b> — Missió Barri · exposició gradual amb reforç positiu.<br>Les dades es guarden <b>només en aquest dispositiu</b>: no s'envien a cap servidor. Aquesta eina acompanya la pauta del vostre psicòleg o psicòloga; no la substitueix ni diagnostica."
  };

  function inicial() {
    try {
      if (/(^#|[#&])ca\b/.test(location.hash) || /[?&]lang=ca\b/.test(location.search)) { localStorage.setItem(KEY, "ca"); return "ca"; }
      if (/(^#|[#&])es\b/.test(location.hash) || /[?&]lang=es\b/.test(location.search)) { localStorage.setItem(KEY, "es"); return "es"; }
      return localStorage.getItem(KEY) === "ca" ? "ca" : "es";
    } catch (e) { return /ca\b/.test(location.hash) ? "ca" : "es"; }
  }

  var MB = { lang: inicial(), _subs: [] };
  MB.L = function (es, ca) { return MB.lang === "ca" && ca != null ? ca : es; };
  MB.onChange = function (fn) { MB._subs.push(fn); };
  MB.aplicar = function () {
    document.documentElement.lang = MB.lang;
    document.title = MB.L("Misión Barrio · APRENS", "Missió Barri · APRENS");
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], k = el.getAttribute("data-i18n");
      if (el._es == null) el._es = el.innerHTML;
      el.innerHTML = MB.lang === "ca" && CA[k] != null ? CA[k] : el._es;
    }
    var bs = document.querySelectorAll(".lang [data-lang]");
    for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", String(bs[j].getAttribute("data-lang") === MB.lang));
  };
  MB.set = function (l) {
    MB.lang = l === "ca" ? "ca" : "es";
    try { localStorage.setItem(KEY, MB.lang); } catch (e) {}
    MB.aplicar();
    MB._subs.forEach(function (fn) { try { fn(MB.lang); } catch (e) {} });
  };

  MB.aplicar();
  var bs = document.querySelectorAll(".lang [data-lang]");
  for (var j = 0; j < bs.length; j++) bs[j].addEventListener("click", function () { MB.set(this.getAttribute("data-lang")); });
  g.MB = MB;
})(window);
