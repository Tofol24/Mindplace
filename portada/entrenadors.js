// APRENS · Per a entrenadors i entrenadores: dissenyador de dinàmiques.
// Parteix d'un aprenentatge (desmarcatge, control orientat…) i el desplega en les cinc passes
// del mètode: estímuls rellevants, exercici analític, «encara no ho han après», dinàmica
// ecològica amb canvi de focus i condició lligada al gol. Tot és editable i imprimible.
// L'esborrany es guarda només en aquest navegador (localStorage), per comoditat.
"use strict";
(() => {
  const L = document.documentElement.lang === "es" ? "es" : "ca";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const UI = {
    ca: {
      tria: "1 · Tria què vols ensenyar", propi: "Un altre aprenentatge (en blanc)",
      fitxa: "2 · La teva fitxa", nota: "Pots canviar qualsevol text: és la teva dinàmica. Es guarda només en aquest navegador.",
      titol: "Què volem ensenyar", que: "En què s'han de fixar (estímuls rellevants)", quan: "Quan s'hi han de fixar",
      p1: "Pas 1 · Donar-ho a conèixer", p2: "Pas 2 · Exercici analític", p3: "Pas 3 · Ho coneixen, però encara no ho han après",
      p4: "Pas 4 · Dinàmica ecològica (amb canvi de focus)", p5: "Pas 5 · La condició: el reforç natural del gol",
      com: "Com es fa", condicio: "Quina és la condició", pregs: "Preguntes per fer durant o després", paraula: "Paraula clau per tornar a la jugada",
      p3txt: "És normal que s'equivoquin: saber-ho no vol dir haver-ho après. No repetim les instruccions a cada errada ni ho transmetem com un drama: l'experiència és la que ho fa aprendre.",
      imprimeix: "Imprimeix la fitxa", buida: "Buida la fitxa", pissarra: "Munta-la a la pissarra",
      buidaConf: "Vols buidar la fitxa? Es perdrà el que hi has escrit.",
      peu: "Fitxa feta amb el mètode d'APRENS · aprens.net/entrenadors.html"
    },
    es: {
      tria: "1 · Elige qué quieres enseñar", propi: "Otro aprendizaje (en blanco)",
      fitxa: "2 · Tu ficha", nota: "Puedes cambiar cualquier texto: es tu dinámica. Se guarda solo en este navegador.",
      titol: "Qué queremos enseñar", que: "En qué se tienen que fijar (estímulos relevantes)", quan: "Cuándo se tienen que fijar",
      p1: "Paso 1 · Darlo a conocer", p2: "Paso 2 · Ejercicio analítico", p3: "Paso 3 · Lo conocen, pero todavía no lo han aprendido",
      p4: "Paso 4 · Dinámica ecológica (con cambio de foco)", p5: "Paso 5 · La condición: el refuerzo natural del gol",
      com: "Cómo se hace", condicio: "Cuál es la condición", pregs: "Preguntas para hacer durante o después", paraula: "Palabra clave para volver a la jugada",
      p3txt: "Es normal que se equivoquen: saberlo no quiere decir haberlo aprendido. No repetimos las instrucciones en cada error ni lo transmitimos como un drama: es la experiencia la que lo hace aprender.",
      imprimeix: "Imprime la ficha", buida: "Vacía la ficha", pissarra: "Móntala en la pizarra",
      buidaConf: "¿Quieres vaciar la ficha? Se perderá lo que has escrito.",
      peu: "Ficha hecha con el método de APRENS · aprens.net/entrenadors.html"
    }
  }[L];

  // Aprenentatges de futbol. Cada un: estímuls (què i quan), analític, ecològic, condició, preguntes i paraula clau.
  const D = {
    ca: [
      { id: "ruptura", t: "Desmarcatge de ruptura",
        que: "La línia de l'últim defensor. El company amb pilota: si té el cap alçat i el cos orientat per passar endavant. L'espai a l'esquena de la defensa.",
        quan: "Quan el company controla orientat i aixeca el cap, just abans de la passada. Sortir en diagonal per no quedar en fora de joc.",
        an: "Parelles amb un con fent de defensor: el passador condueix i, quan aixeca el cap, el receptor surt a l'espai. Primer sense oposició, després amb un defensor passiu.",
        eco: "4 contra 4 amb dos comodins i dues porteries. Quan un equip recupera la pilota té 6 segons per buscar una passada a l'esquena de la defensa: el focus ha de passar de defensar a mirar l'espai.",
        cond: "Per a l'equip que té la condició, el gol només val si arriba després d'una passada a l'esquena de la defensa. Si perd la pilota, conserva la condició.",
        pre: "On era l'últim defensor quan vas sortir?\nQuè et va dir que el company ja podia passar?\nHas sortit abans o després de la passada?",
        pc: "«Esquena!»" },
      { id: "control", t: "Control orientat",
        que: "On és el rival més proper. On hi ha l'espai lliure o el company desmarcat. La trajectòria de la pilota que arriba.",
        quan: "Abans de rebre: mirar per damunt l'espatlla mentre la pilota viatja. El primer toc ja va cap a l'espai lliure.",
        an: "Triangles de passades amb un con que fa de pressionador i que l'entrenador canvia de costat. El receptor ha de mirar abans de rebre i controlar cap al costat contrari del con.",
        eco: "Rondo 4 contra 2 amb dues zones. Si els defensors roben la pilota, poden fer gol en una porteria petita: els atacants han de canviar el focus a defensar.",
        cond: "Per a l'equip que té la condició, la passada que comença amb un control orientat que supera un rival compta doble o val gol.",
        pre: "Abans de rebre, què has vist?\nCap a on has fet el primer toc? Per què?\nOn era el rival quan t'ha arribat la pilota?",
        pc: "«Mira abans!»" },
      { id: "perdua", t: "Activació després de pèrdua (atac-defensa)",
        que: "La pilota i el jugador que l'acaba de recuperar. El company més proper. La línia de passada més fàcil del rival.",
        quan: "En el mateix moment de perdre la pilota: els primers 3 a 5 segons.",
        an: "2 contra 1 en espai reduït: quan l'atacant perd la pilota, ell i el company més proper pressionen de seguida. L'entrenador senyala la pèrdua al principi; després, ningú no l'ha d'avisar.",
        eco: "5 contra 5 amb dues porteries en un camp curt, amb moltes transicions. El focus ha de canviar sense pausa d'atacar a recuperar.",
        cond: "L'equip que té la condició suma un gol si recupera la pilota en menys de 5 segons després de perdre-la. Perdre-la no li treu la condició.",
        pre: "Què has fet en el primer segon després de perdre-la?\nQui era el més proper a la pilota?\nQuina passada volies tapar?",
        pc: "«Ara!»" },
      { id: "sortida", t: "Sortida de pilota des del porter",
        que: "On és el davanter rival que pressiona i cap a on mira. El company lliure (l'home lliure). L'orientació del propi cos per rebre de cara.",
        quan: "Quan el porter té la pilota, abans de rebre. Si el rival tanca un costat, el focus va a l'altre.",
        an: "Porter, dos centrals i un pivot contra un o dos pressionadors en mig camp: circular fins trobar l'home lliure. Primer amb pressió passiva.",
        eco: "6 contra 5 en mig camp amb porter. Si el rival roba, ataca la porteria; si l'equip supera la pressió, fa punt passant per una línia o en porteries petites.",
        cond: "L'equip que surt amb la pilota fa punt si la pilota supera la primera línia de pressió amb una passada a l'home lliure.",
        pre: "Qui era el jugador lliure?\nCap a on mirava el davanter que pressionava?\nEl teu cos estava orientat per rebre de cara?",
        pc: "«Lliure!»" },
      { id: "pressio", t: "Pressió coordinada",
        que: "L'orientació del rival amb pilota (de cara o d'esquena). El company que pressiona, per fer-li la cobertura. La línia de passada que s'ha de tancar.",
        quan: "Quan hi ha un senyal de pressió: el rival rep d'esquena, controla malament o fa una passada enrere.",
        an: "2 contra 2 en una zona: un pressiona i l'altre cobreix i tanca la línia de passada. Canvien els papers en cada repetició.",
        eco: "6 contra 6 amb porteries. Quan el rival dona un senyal de pressió, l'equip pressiona junt; si recupera en camp contrari, ha d'acabar en 8 segons.",
        cond: "L'equip que té la condició fa gol doble si el gol arriba després d'un robatori en pressió.",
        pre: "Quin senyal t'ha dit que podíeu pressionar?\nQui et cobria?\nQuina passada has tancat?",
        pc: "«Junts!»" },
      { id: "errada", t: "Tornar a la jugada després d'una errada",
        que: "Adonar-se'n: el pensament, l'emoció o la tensió que apareix després de l'errada, sense lluitar-hi. La paraula clau o el gest. La pròxima jugada.",
        quan: "Just després de l'errada o en la primera aturada del joc.",
        an: "Un minut d'atenció plena a l'inici de l'entrenament: la respiració o el tacte de la pilota amb les mans. Quan arriba una distracció, adonar-se'n i tornar.",
        eco: "En els partits condicionats, qui s'equivoca fa el seu gest (pujar-se les calces, un estirament) i torna de seguida a la posició. L'entrenador valora la tornada, no l'errada.",
        cond: "L'equip suma un punt quan un jugador que acaba d'errar participa en l'acció següent. Així tornar té el seu propi reforç.",
        pre: "Què has notat després de l'errada?\nQuant has tardat a tornar a la jugada?\nQuina paraula o quin gest t'han ajudat?",
        pc: "«Reset!» · «A sa pròxima!»" }
    ],
    es: [
      { id: "ruptura", t: "Desmarque de ruptura",
        que: "La línea del último defensor. El compañero con balón: si tiene la cabeza levantada y el cuerpo orientado para pasar hacia delante. El espacio a la espalda de la defensa.",
        quan: "Cuando el compañero controla orientado y levanta la cabeza, justo antes del pase. Salir en diagonal para no quedar en fuera de juego.",
        an: "Parejas con un cono haciendo de defensor: el pasador conduce y, cuando levanta la cabeza, el receptor sale al espacio. Primero sin oposición, después con un defensor pasivo.",
        eco: "4 contra 4 con dos comodines y dos porterías. Cuando un equipo recupera el balón tiene 6 segundos para buscar un pase a la espalda de la defensa: el foco tiene que pasar de defender a mirar el espacio.",
        cond: "Para el equipo que tiene la condición, el gol solo vale si llega después de un pase a la espalda de la defensa. Si pierde el balón, conserva la condición.",
        pre: "¿Dónde estaba el último defensor cuando saliste?\n¿Qué te dijo que el compañero ya podía pasar?\n¿Has salido antes o después del pase?",
        pc: "«¡Espalda!»" },
      { id: "control", t: "Control orientado",
        que: "Dónde está el rival más cercano. Dónde está el espacio libre o el compañero desmarcado. La trayectoria del balón que llega.",
        quan: "Antes de recibir: mirar por encima del hombro mientras el balón viaja. El primer toque ya va hacia el espacio libre.",
        an: "Triángulos de pases con un cono que hace de presionador y que el entrenador cambia de lado. El receptor tiene que mirar antes de recibir y controlar hacia el lado contrario al cono.",
        eco: "Rondo 4 contra 2 con dos zonas. Si los defensores roban el balón, pueden marcar en una portería pequeña: los atacantes tienen que cambiar el foco a defender.",
        cond: "Para el equipo que tiene la condición, el pase que empieza con un control orientado que supera a un rival cuenta doble o vale gol.",
        pre: "Antes de recibir, ¿qué has visto?\n¿Hacia dónde has dado el primer toque? ¿Por qué?\n¿Dónde estaba el rival cuando te ha llegado el balón?",
        pc: "«¡Mira antes!»" },
      { id: "perdua", t: "Activación tras pérdida (ataque-defensa)",
        que: "El balón y el jugador que lo acaba de recuperar. El compañero más cercano. La línea de pase más fácil del rival.",
        quan: "En el mismo momento de perder el balón: los primeros 3 a 5 segundos.",
        an: "2 contra 1 en espacio reducido: cuando el atacante pierde el balón, él y el compañero más cercano presionan enseguida. Al principio el entrenador señala la pérdida; después, nadie tiene que avisar.",
        eco: "5 contra 5 con dos porterías en un campo corto, con muchas transiciones. El foco tiene que cambiar sin pausa de atacar a recuperar.",
        cond: "El equipo que tiene la condición suma un gol si recupera el balón en menos de 5 segundos después de perderlo. Perderlo no le quita la condición.",
        pre: "¿Qué has hecho en el primer segundo después de perderlo?\n¿Quién era el más cercano al balón?\n¿Qué pase querías tapar?",
        pc: "«¡Ahora!»" },
      { id: "sortida", t: "Salida de balón desde el portero",
        que: "Dónde está el delantero rival que presiona y hacia dónde mira. El compañero libre (el hombre libre). La orientación del propio cuerpo para recibir de cara.",
        quan: "Cuando el portero tiene el balón, antes de recibir. Si el rival cierra un lado, el foco va al otro.",
        an: "Portero, dos centrales y un pivote contra uno o dos presionadores en medio campo: circular hasta encontrar al hombre libre. Primero con presión pasiva.",
        eco: "6 contra 5 en medio campo con portero. Si el rival roba, ataca la portería; si el equipo supera la presión, hace punto pasando una línea o en porterías pequeñas.",
        cond: "El equipo que sale con el balón hace punto si el balón supera la primera línea de presión con un pase al hombre libre.",
        pre: "¿Quién era el jugador libre?\n¿Hacia dónde miraba el delantero que presionaba?\n¿Tu cuerpo estaba orientado para recibir de cara?",
        pc: "«¡Libre!»" },
      { id: "pressio", t: "Presión coordinada",
        que: "La orientación del rival con balón (de cara o de espaldas). El compañero que presiona, para hacerle la cobertura. La línea de pase que hay que cerrar.",
        quan: "Cuando hay una señal de presión: el rival recibe de espaldas, controla mal o hace un pase atrás.",
        an: "2 contra 2 en una zona: uno presiona y el otro cubre y cierra la línea de pase. Cambian los papeles en cada repetición.",
        eco: "6 contra 6 con porterías. Cuando el rival da una señal de presión, el equipo presiona junto; si recupera en campo contrario, tiene que acabar en 8 segundos.",
        cond: "El equipo que tiene la condición marca gol doble si el gol llega después de un robo en presión.",
        pre: "¿Qué señal te ha dicho que podíais presionar?\n¿Quién te cubría?\n¿Qué pase has cerrado?",
        pc: "«¡Juntos!»" },
      { id: "errada", t: "Volver a la jugada después de un error",
        que: "Darse cuenta: el pensamiento, la emoción o la tensión que aparece después del error, sin pelearse con ello. La palabra clave o el gesto. La próxima jugada.",
        quan: "Justo después del error o en la primera parada del juego.",
        an: "Un minuto de atención plena al inicio del entrenamiento: la respiración o el tacto del balón con las manos. Cuando llega una distracción, darse cuenta y volver.",
        eco: "En los partidos condicionados, quien se equivoca hace su gesto (subirse las medias, un estiramiento) y vuelve enseguida a su posición. El entrenador valora la vuelta, no el error.",
        cond: "El equipo suma un punto cuando un jugador que acaba de fallar participa en la acción siguiente. Así volver tiene su propio refuerzo.",
        pre: "¿Qué has notado después del error?\n¿Cuánto has tardado en volver a la jugada?\n¿Qué palabra o qué gesto te han ayudado?",
        pc: "«¡Reset!» · «¡A la próxima!»" }
    ]
  }[L];

  const CAMPS = ["t", "que", "quan", "an", "eco", "cond", "pre", "pc"];
  const CLAU = "aprens:entrenadors:fitxa";
  const arrel = $("#dissenya");
  if (!arrel) return;

  // Mateixos límits que la pissarra, perquè en muntar-la no es talli res.
  const LIMIT = { t: 60, que: 300, quan: 300, an: 1200, eco: 1200, cond: 300, pre: 600, pc: 40 };
  const camp = (k, etiqueta, files) => `<div class="camp"><label for="f-${k}">${esc(etiqueta)}</label><textarea id="f-${k}" data-k="${k}" rows="${files}" maxlength="${LIMIT[k]}"></textarea></div>`;
  arrel.innerHTML = `
    <h3>${esc(UI.tria)}</h3>
    <div class="xips" role="group" aria-label="${esc(UI.tria)}">
      ${D.map((d) => `<button type="button" data-id="${d.id}" aria-pressed="false">${esc(d.t)}</button>`).join("")}
      <button type="button" data-id="" aria-pressed="false">${esc(UI.propi)}</button>
    </div>
    <h3>${esc(UI.fitxa)}</h3>
    <p class="suau">${esc(UI.nota)}</p>
    <div class="fitxa" id="fitxa">
      ${camp("t", UI.titol, 1)}
      <fieldset><legend>${esc(UI.p1)}</legend>${camp("que", UI.que, 3)}${camp("quan", UI.quan, 2)}</fieldset>
      <fieldset><legend>${esc(UI.p2)}</legend>${camp("an", UI.com, 3)}</fieldset>
      <fieldset><legend>${esc(UI.p3)}</legend><p>${esc(UI.p3txt)}</p></fieldset>
      <fieldset><legend>${esc(UI.p4)}</legend>${camp("eco", UI.com, 3)}</fieldset>
      <fieldset><legend>${esc(UI.p5)}</legend>${camp("cond", UI.condicio, 3)}${camp("pre", UI.pregs, 3)}</fieldset>
      ${camp("pc", UI.paraula, 1)}
      <p class="peu-fitxa">${esc(UI.peu)}</p>
    </div>
    <div class="enllacos accions">
      <button type="button" class="boto" data-a="imprimeix">${esc(UI.imprimeix)}</button>
      <a class="boto sec" href="https://pizarra.aprens.net/pizarra/" rel="noopener" data-a="pissarra">${esc(UI.pissarra)}</a>
      <button type="button" class="boto sec" data-a="buida">${esc(UI.buida)}</button>
    </div>`;

  const omple = (d) => CAMPS.forEach((k) => { $(`[data-k="${k}"]`, arrel).value = d ? d[k] || "" : ""; });
  const desa = () => {
    const o = {}; CAMPS.forEach((k) => { o[k] = $(`[data-k="${k}"]`, arrel).value; });
    try { localStorage.setItem(CLAU, JSON.stringify({ l: L, f: o })); } catch (e) { /* només per comoditat */ }
  };
  const marca = (id) => arrel.querySelectorAll(".xips button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
  // «Munta-la a la pissarra»: obre la pissarra amb la fitxa al #hash (no arriba a cap servidor) i hi crea un entrenament
  // amb tres apartats: analític, dinàmica ecològica i partit condicionat.
  arrel.addEventListener("click", (e) => {
    const a = e.target.closest('a[data-a="pissarra"]'); if (!a) return;
    const sel = arrel.querySelector(".xips button[aria-pressed=true]");
    const o = { k: sel ? sel.dataset.id : "" };
    CAMPS.forEach((k) => { o[k] = $(`[data-k="${k}"]`, arrel).value.slice(0, LIMIT[k]); });
    a.href = "https://pizarra.aprens.net/pizarra/#apr=" + encodeURIComponent(JSON.stringify(o));
  });

  let guardat = null;
  try { guardat = JSON.parse(localStorage.getItem(CLAU) || "null"); } catch (e) { guardat = null; }
  if (guardat && guardat.l === L && guardat.f && typeof guardat.f === "object") {
    CAMPS.forEach((k) => { $(`[data-k="${k}"]`, arrel).value = String(guardat.f[k] || "").slice(0, LIMIT[k]); });
    const d = D.find((x) => x.t === guardat.f.t); if (d) marca(d.id);
  } else { omple(D[0]); marca(D[0].id); }

  arrel.addEventListener("input", desa);
  arrel.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.closest(".xips")) { const d = D.find((x) => x.id === b.dataset.id) || null; omple(d); marca(b.dataset.id); desa(); $("#f-t").focus(); return; }
    if (b.dataset.a === "imprimeix") {
      // Al paper, cada camp surt amb tot el text (les àrees de text es tallarien).
      arrel.querySelectorAll("textarea").forEach((t) => {
        let p = t.nextElementSibling; if (!p || !p.classList.contains("imprimible")) { p = document.createElement("div"); p.className = "imprimible"; t.after(p); }
        p.textContent = t.value;
      });
      document.body.classList.add("imprimint-fitxa");
      window.print();
      setTimeout(() => document.body.classList.remove("imprimint-fitxa"), 500);
      return;
    }
    if (b.dataset.a === "buida") { if (!window.confirm(UI.buidaConf)) return; omple(null); marca("__"); desa(); }
  });
})();
