// APRENS · Espai Filosòfic: un joc per pensar a cada entrada. Tot passa al navegador; no s'envia ni es desa res.
"use strict";
(function () {
  const root = document.documentElement;
  const L = () => (root.lang === "es" ? "es" : "ca");
  const quiet = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const NS = "http://www.w3.org/2000/svg";
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  // ---------- 1. Consciència: nota el pensament ----------
  const C1 = {
    ca: { pens: ["I si surt malament?", "No ho faré bé", "Tinc gana", "Què pensaran de mi?", "Hauria d'haver dit una altra cosa", "Demà tinc molta feina"],
      nota: "Estic notant el pensament: ", comptador: (n, t) => `Pensaments notats: ${n} de ${t}`,
      fi: "Els pensaments hi continuen sent, però ara hi ha una mica d'espai entre tu i ells. Notar un pensament com a pensament és el que anomenam metaconsciència.",
      torna: "Torna a començar", nota2: "Un joc per entendre la idea; no és un exercici clínic." },
    es: { pens: ["¿Y si sale mal?", "No lo haré bien", "Tengo hambre", "¿Qué pensarán de mí?", "Tendría que haber dicho otra cosa", "Mañana tengo mucho trabajo"],
      nota: "Estoy notando el pensamiento: ", comptador: (n, t) => `Pensamientos notados: ${n} de ${t}`,
      fi: "Los pensamientos siguen ahí, pero ahora hay un poco de espacio entre tú y ellos. Notar un pensamiento como pensamiento es lo que llamamos metaconciencia.",
      torna: "Volver a empezar", nota2: "Un juego para entender la idea; no es un ejercicio clínico." }
  };
  function joc1(zona) {
    const st = { vistos: 0, notats: new Set(), timer: null };
    const pinta = () => {
      const T = C1[L()]; zona.textContent = "";
      const llista = el("div", "pensaments");
      T.pens.slice(0, st.vistos).forEach((p, i) => {
        const b = el("button", "pensament" + (st.notats.has(i) ? " notat" : ""));
        b.type = "button";
        b.textContent = st.notats.has(i) ? T.nota + "«" + p + "»" : "«" + p + "»";
        b.setAttribute("aria-pressed", String(st.notats.has(i)));
        b.addEventListener("click", () => { st.notats.add(i); pinta(); });
        llista.append(b);
      });
      zona.append(llista);
      const peu = el("div", "joc-peu");
      peu.append(el("span", "joc-compte", T.comptador(st.notats.size, T.pens.length)));
      const r = el("button", "joc-boto sec", T.torna); r.type = "button";
      r.addEventListener("click", () => { st.notats.clear(); st.vistos = quiet ? T.pens.length : 1; pinta(); arrenca(); });
      peu.append(r);
      zona.append(peu);
      if (st.notats.size === T.pens.length) zona.append(el("p", "joc-fi", T.fi));
      zona.append(el("p", "joc-nota", T.nota2));
    };
    const arrenca = () => {
      clearInterval(st.timer);
      if (quiet) return;
      st.timer = setInterval(() => { if (st.vistos < C1.ca.pens.length) { st.vistos++; pinta(); } else clearInterval(st.timer); }, 2200);
    };
    st.vistos = quiet ? C1.ca.pens.length : 1;
    pinta(); arrenca();
    return pinta;
  }

  // ---------- 2. Espai i temps: i abans? ----------
  const C2 = {
    ca: { passos: [
        ["Ara", "Ara mateix llegeixes aquesta frase."],
        ["Fa uns anys", "Vas néixer."],
        ["Fa uns 300.000 anys", "Apareixen els primers humans moderns."],
        ["Fa uns 66 milions d'anys", "S'extingeixen els grans dinosaures."],
        ["Fa uns 4.500 milions d'anys", "Es forma la Terra."],
        ["Fa uns 13.800 milions d'anys", "L'univers observable comença a expandir-se des d'un estat molt calent i dens."],
        ["I abans?", "Aquí la pregunta es trenca: si el temps també comença, «abans» potser no vol dir res. La física hi investiga; nosaltres només hi podem pensar (nivell D)."]
      ], abans: "I abans?", torna: "Torna a ara" },
    es: { passos: [
        ["Ahora", "Ahora mismo lees esta frase."],
        ["Hace unos años", "Naciste."],
        ["Hace unos 300.000 años", "Aparecen los primeros humanos modernos."],
        ["Hace unos 66 millones de años", "Se extinguen los grandes dinosaurios."],
        ["Hace unos 4.500 millones de años", "Se forma la Tierra."],
        ["Hace unos 13.800 millones de años", "El universo observable empieza a expandirse desde un estado muy caliente y denso."],
        ["¿Y antes?", "Aquí la pregunta se rompe: si el tiempo también empieza, «antes» quizá no signifique nada. La física lo investiga; nosotros solo podemos pensarlo (nivel D)."]
      ], abans: "¿Y antes?", torna: "Volver a ahora" }
  };
  function joc2(zona) {
    let pas = 0;
    const pinta = () => {
      const T = C2[L()]; zona.textContent = "";
      const via = el("ol", "via");
      T.passos.forEach((p, i) => {
        const li = el("li", (i <= pas ? "vist" : "") + (i === pas ? " ara" : "") + (i === T.passos.length - 1 ? " final" : ""));
        li.append(el("span", "punt"));
        li.append(el("span", "quan", i <= pas ? p[0] : ""));
        via.append(li);
      });
      zona.append(via);
      const [q, t] = T.passos[pas];
      const card = el("div", "via-text" + (pas === T.passos.length - 1 ? " final" : ""));
      card.append(el("b", null, q)); card.append(el("p", null, t));
      zona.append(card);
      const peu = el("div", "joc-peu");
      const b = el("button", "joc-boto", T.abans); b.type = "button";
      b.disabled = pas >= T.passos.length - 1;
      b.addEventListener("click", () => { pas++; pinta(); zona.querySelector(".joc-boto")?.focus(); });
      const r = el("button", "joc-boto sec", T.torna); r.type = "button";
      r.addEventListener("click", () => { pas = 0; pinta(); });
      peu.append(b, r); zona.append(peu);
    };
    pinta();
    return pinta;
  }

  // ---------- 3. Transcendència: relació sense absorció ----------
  const C3 = {
    ca: { jo: "jo", altre: "l'altre", etiqueta: "Distància entre els dos cercles",
      sep: ["Separats", "Cadascú al seu món. Sense cap relació, tampoc no hi pot haver reconeixement."],
      rel: ["En relació", "Es toquen i cadascú conserva la seva forma. Aquí hi pot haver reconeixement, i també cura i límits."],
      abs: ["Absorció", "Si l'altre es fon dins meu, ja no queda ningú distint a qui reconèixer. Per això parlam de relació sense absorció."] },
    es: { jo: "yo", altre: "el otro", etiqueta: "Distancia entre los dos círculos",
      sep: ["Separados", "Cada uno en su mundo. Sin ninguna relación, tampoco puede haber reconocimiento."],
      rel: ["En relación", "Se tocan y cada uno conserva su forma. Aquí puede haber reconocimiento, y también cuidado y límites."],
      abs: ["Absorción", "Si el otro se funde en mí, ya no queda nadie distinto a quien reconocer. Por eso hablamos de relación sin absorción."] }
  };
  function joc3(zona) {
    let v = 85;
    const R = 46, cx = 150;
    const pinta = () => {
      const T = C3[L()]; zona.textContent = "";
      const svg = sv("svg", {viewBox: "0 0 300 130", class: "cercles", "aria-hidden": "true"});
      const a = sv("circle", {cy: 62, r: R, class: "c-jo"});
      const b = sv("circle", {cy: 62, r: R, class: "c-altre"});
      const ta = sv("text", {y: 66, class: "c-t", "text-anchor": "middle"}); ta.textContent = T.jo;
      const tb = sv("text", {y: 66, class: "c-t", "text-anchor": "middle"}); tb.textContent = T.altre;
      svg.append(a, b, ta, tb);
      zona.append(svg);
      const lab = el("label", "rang");
      lab.append(el("span", null, T.etiqueta));
      const inp = el("input"); inp.type = "range"; inp.min = "0"; inp.max = "100"; inp.value = String(v);
      lab.append(inp); zona.append(lab);
      const card = el("div", "estat-c"); const cb = el("b"); const cp = el("p");
      card.append(cb, cp); zona.append(card);
      const actualitza = () => {
        const d = (v / 100) * 170;
        a.setAttribute("cx", cx - d / 2); b.setAttribute("cx", cx + d / 2);
        ta.setAttribute("x", cx - d / 2); tb.setAttribute("x", cx + d / 2);
        const fos = d <= 22;
        ta.setAttribute("visibility", fos ? "hidden" : "visible"); tb.setAttribute("visibility", fos ? "hidden" : "visible");
        const k = d >= 2 * R ? "sep" : fos ? "abs" : "rel";
        card.className = "estat-c " + k; cb.textContent = T[k][0]; cp.textContent = T[k][1];
      };
      inp.addEventListener("input", () => { v = Number(inp.value); actualitza(); });
      actualitza();
    };
    pinta();
    return pinta;
  }

  // ---------- 4. Pensament crític: el semàfor ----------
  const C4 = {
    ca: { frases: [
        ["L'aigua bull a 100 °C al nivell de la mar.", "A", "Es pot mesurar i repetir tantes vegades com vulguis."],
        ["Tots formam part de la mateixa natura.", "B", "És una manera d'interpretar el que sabem; cap experiment no ho decideix."],
        ["Respirar a poc a poc abans d'un examen ajuda a concentrar-se.", "C", "És una idea que es pot comprovar comparant grups."],
        ["Hi ha altres universos on ara mateix fas una altra cosa.", "D", "Avui no hi ha manera de comprovar-ho."],
        ["La Terra gira al voltant del Sol.", "A", "Ho mostren moltes observacions independents."],
        ["El temps és una il·lusió.", "B", "És una interpretació filosòfica; també es podria defensar la D."],
        ["Si practiques l'atenció cada dia, et costarà menys tornar al present.", "C", "És una hipòtesi de la TEC: s'ha de posar a prova."],
        ["La consciència existeix des de l'origen de l'univers.", "D", "Obre preguntes, però no es pot comprovar."]
      ], coincidim: "Coincidim.", nosaltres: (x) => `Nosaltres hi posaríem la ${x}.`, seg: "Següent frase", fi: (n, t) => `Has coincidit amb nosaltres en ${n} de ${t} frases. El que compta és que puguis donar raons de cada lletra.`, torna: "Torna a jugar", noms: {A: "Sabem", B: "Interpretam", C: "Proposam comprovar", D: "Només pensam"}, comptador: (i, t) => `Frase ${i} de ${t}` },
    es: { frases: [
        ["El agua hierve a 100 °C al nivel del mar.", "A", "Se puede medir y repetir tantas veces como quieras."],
        ["Todos formamos parte de la misma naturaleza.", "B", "Es una manera de interpretar lo que sabemos; ningún experimento lo decide."],
        ["Respirar despacio antes de un examen ayuda a concentrarse.", "C", "Es una idea que se puede comprobar comparando grupos."],
        ["Hay otros universos donde ahora mismo haces otra cosa.", "D", "Hoy no hay manera de comprobarlo."],
        ["La Tierra gira alrededor del Sol.", "A", "Lo muestran muchas observaciones independientes."],
        ["El tiempo es una ilusión.", "B", "Es una interpretación filosófica; también se podría defender la D."],
        ["Si practicas la atención cada día, te costará menos volver al presente.", "C", "Es una hipótesis de la TEC: hay que ponerla a prueba."],
        ["La conciencia existe desde el origen del universo.", "D", "Abre preguntas, pero no se puede comprobar."]
      ], coincidim: "Coincidimos.", nosaltres: (x) => `Nosotros le pondríamos la ${x}.`, seg: "Siguiente frase", fi: (n, t) => `Has coincidido con nosotros en ${n} de ${t} frases. Lo que cuenta es que puedas dar razones de cada letra.`, torna: "Volver a jugar", noms: {A: "Sabemos", B: "Interpretamos", C: "Proponemos comprobar", D: "Solo pensamos"}, comptador: (i, t) => `Frase ${i} de ${t}` }
  };
  function joc4(zona) {
    const st = { i: 0, tria: null, encerts: 0, fi: false };
    const pinta = () => {
      const T = C4[L()]; zona.textContent = "";
      if (st.fi) {
        zona.append(el("p", "joc-fi", T.fi(st.encerts, T.frases.length)));
        const r = el("button", "joc-boto", T.torna); r.type = "button";
        r.addEventListener("click", () => { st.i = 0; st.tria = null; st.encerts = 0; st.fi = false; pinta(); });
        zona.append(r); return;
      }
      const [f, lletra, per] = T.frases[st.i];
      zona.append(el("p", "joc-compte", T.comptador(st.i + 1, T.frases.length)));
      zona.append(el("p", "frase", "«" + f + "»"));
      const botons = el("div", "lletres");
      ["A", "B", "C", "D"].forEach((x) => {
        const b = el("button", "lletra lv-" + x.toLowerCase() + (st.tria === x ? " triada" : "") + (st.tria && x === lletra ? " proposta" : ""));
        b.type = "button"; b.disabled = st.tria !== null;
        b.append(el("b", null, x)); b.append(el("span", null, T.noms[x]));
        b.addEventListener("click", () => { st.tria = x; if (x === lletra) st.encerts++; pinta(); zona.querySelector(".joc-boto")?.focus(); });
        botons.append(b);
      });
      zona.append(botons);
      if (st.tria) {
        const card = el("div", "resposta");
        card.append(el("b", null, st.tria === lletra ? T.coincidim : T.nosaltres(lletra)));
        card.append(el("p", null, per));
        zona.append(card);
        const n = el("button", "joc-boto", T.seg); n.type = "button";
        n.addEventListener("click", () => { st.tria = null; st.i++; if (st.i >= T.frases.length) st.fi = true; pinta(); });
        zona.append(n);
      }
    };
    pinta();
    return pinta;
  }

  // ---------- 5. La paraula i la imatge: on és la teva mon(e)a? ----------
  const C5 = {
    ca: { frases: [
        ["Aquella discussió d'ahir", "passat"], ["I si demà surt malament?", "futur"], ["Noto els peus a terra", "present"],
        ["Hauria d'haver dit una altra cosa", "passat"], ["Què pensaran de mi dilluns?", "futur"], ["L'aire entra fresc pel nas", "present"],
        ["Quan era petit això no em passava", "passat"], ["Sent el pes del cos damunt la cadira", "present"]
      ], temps: {passat: "Passat", present: "Present", futur: "Futur"},
      bo: "Coincidim.", altre: (x) => `Nosaltres l'hauríem posat a «${x}».`, seg: "Següent", comptador: (i, t) => `Imatge ${i} de ${t}`,
      fi: (v) => `${v} de les 8 imatges et duien fora d'aquí. Per la teva mon(e)a, però, totes es viuen com si passassin ara: per això el passat pot pesar i el futur pot preocupar encara que no siguin presents.`,
      torna: "Torna a jugar" },
    es: { frases: [
        ["Aquella discusión de ayer", "passat"], ["¿Y si mañana sale mal?", "futur"], ["Noto los pies en el suelo", "present"],
        ["Tendría que haber dicho otra cosa", "passat"], ["¿Qué pensarán de mí el lunes?", "futur"], ["El aire entra fresco por la nariz", "present"],
        ["Cuando era pequeño esto no me pasaba", "passat"], ["Siento el peso del cuerpo sobre la silla", "present"]
      ], temps: {passat: "Pasado", present: "Presente", futur: "Futuro"},
      bo: "Coincidimos.", altre: (x) => `Nosotros la habríamos puesto en «${x}».`, seg: "Siguiente", comptador: (i, t) => `Imagen ${i} de ${t}`,
      fi: (v) => `${v} de las 8 imágenes te llevaban fuera de aquí. Para tu mon(e)a, sin embargo, todas se viven como si pasaran ahora: por eso el pasado puede pesar y el futuro puede preocupar aunque no estén presentes.`,
      torna: "Volver a jugar" }
  };
  function joc5(zona) {
    const st = { i: 0, tria: null, fi: false };
    const pinta = () => {
      const T = C5[L()]; zona.textContent = "";
      if (st.fi) {
        const fora = T.frases.filter((f) => f[1] !== "present").length;
        zona.append(el("p", "joc-fi", T.fi(fora)));
        const r = el("button", "joc-boto", T.torna); r.type = "button";
        r.addEventListener("click", () => { st.i = 0; st.tria = null; st.fi = false; pinta(); });
        zona.append(r); return;
      }
      const [f, quan] = T.frases[st.i];
      zona.append(el("p", "joc-compte", T.comptador(st.i + 1, T.frases.length)));
      zona.append(el("p", "frase", "«" + f + "»"));
      const botons = el("div", "temps-tria");
      ["passat", "present", "futur"].forEach((k) => {
        const b = el("button", "tria t-" + k + (st.tria === k ? " triada" : "") + (st.tria && k === quan ? " proposta" : ""), T.temps[k]);
        b.type = "button"; b.disabled = st.tria !== null;
        b.addEventListener("click", () => { st.tria = k; pinta(); zona.querySelector(".joc-boto")?.focus(); });
        botons.append(b);
      });
      zona.append(botons);
      if (st.tria) {
        zona.append(el("p", "resposta", st.tria === quan ? T.bo : T.altre(T.temps[quan])));
        const n = el("button", "joc-boto", T.seg); n.type = "button";
        n.addEventListener("click", () => { st.tria = null; st.i++; if (st.i >= T.frases.length) st.fi = true; pinta(); });
        zona.append(n);
      }
    };
    pinta();
    return pinta;
  }

  // ---------- 6. Vulnerabilitat: validar o justificar ----------
  const C6 = {
    ca: { escenes: [
        { qui: "Un nin de sis anys, a l'hora d'anar a dormir:", diu: "«Tinc por de la fosca.»", op: [
          ["Però si no hi ha res, no tens cap motiu per tenir por.", "jus", "Cerca una raó perquè la por desaparegui. Té bona intenció, però li diu que el que sent no té sentit."],
          ["Ja ets massa gran per tenir por.", "min", "La por no se'n va; només aprèn que l'ha d'amagar."],
          ["Ho entenc, la fosca fa por. Som aquí amb tu una estona.", "val", "Valida la sensació i hi posa presència. No cal que la por tengui raó per acompanyar-la."]] },
        { qui: "Una adolescent, la nit abans d'un examen:", diu: "«Tinc un nus a la panxa.»", op: [
          ["És normal, és el teu cos que es prepara. Respiram junts un moment?", "val", "Dona espai al nus i ofereix una manera d'estar-hi, sense voler-lo treure de seguida."],
          ["Si haguessis estudiat més no et passaria.", "min", "Converteix la sensació en una culpa, i el nus se'n duu una càrrega més."],
          ["No hi pensis, segur que et sortirà bé.", "jus", "Vol tranquil·litzar a través del pensament, però el cos no s'ha sentit escoltat."]] },
        { qui: "Tu mateix, abans d'una reunió important:", diu: "«Em batega fort el cor.»", op: [
          ["No hauria d'estar així, és ridícul.", "min", "Quan ens ho deim a nosaltres també invalidam. La lluita contra la sensació sovint l'apuja."],
          ["Hi és. El deix estar i em quedo una mica amb ell, a l'altura del pit.", "val", "Això és fer-se càrrec: no et cal justificar-ho per donar-li espai."],
          ["És perquè la darrera vegada em va sortir malament.", "jus", "Pot ser cert, però trobar la causa no sempre calma; de vegades només afegeix voltes."]] }
      ], noms: {val: "Valida", jus: "Justifica", min: "Minimitza"}, seg: "Següent escena", comptador: (i, t) => `Escena ${i} de ${t}`,
      fi: "Totes les respostes neixen de voler ajudar. La diferència és si la sensació troba espai o ha de demostrar que té raó per poder-hi ser.", torna: "Torna a començar", nota: "No hi ha una frase màgica: el que compta és l'actitud de presència." },
    es: { escenes: [
        { qui: "Un niño de seis años, a la hora de ir a dormir:", diu: "«Tengo miedo de la oscuridad.»", op: [
          ["Pero si no hay nada, no tienes ningún motivo para tener miedo.", "jus", "Busca una razón para que el miedo desaparezca. Tiene buena intención, pero le dice que lo que siente no tiene sentido."],
          ["Ya eres demasiado mayor para tener miedo.", "min", "El miedo no se va; solo aprende que tiene que esconderlo."],
          ["Lo entiendo, la oscuridad da miedo. Estoy aquí contigo un rato.", "val", "Valida la sensación y le pone presencia. No hace falta que el miedo tenga razón para acompañarlo."]] },
        { qui: "Una adolescente, la noche antes de un examen:", diu: "«Tengo un nudo en la barriga.»", op: [
          ["Es normal, es tu cuerpo que se prepara. ¿Respiramos juntos un momento?", "val", "Da espacio al nudo y ofrece una manera de estar con él, sin querer quitarlo enseguida."],
          ["Si hubieras estudiado más no te pasaría.", "min", "Convierte la sensación en una culpa, y el nudo carga con un peso más."],
          ["No lo pienses, seguro que te sale bien.", "jus", "Quiere tranquilizar a través del pensamiento, pero el cuerpo no se ha sentido escuchado."]] },
        { qui: "Tú mismo, antes de una reunión importante:", diu: "«Me late fuerte el corazón.»", op: [
          ["No debería estar así, es ridículo.", "min", "Cuando nos lo decimos a nosotros también invalidamos. La lucha contra la sensación a menudo la sube."],
          ["Está ahí. Lo dejo estar y me quedo un poco con él, a la altura del pecho.", "val", "Esto es hacerse cargo: no necesitas justificarlo para darle espacio."],
          ["Es porque la última vez me salió mal.", "jus", "Puede ser cierto, pero encontrar la causa no siempre calma; a veces solo añade vueltas."]] }
      ], noms: {val: "Valida", jus: "Justifica", min: "Minimiza"}, seg: "Siguiente escena", comptador: (i, t) => `Escena ${i} de ${t}`,
      fi: "Todas las respuestas nacen de querer ayudar. La diferencia es si la sensación encuentra espacio o tiene que demostrar que tiene razón para poder estar.", torna: "Volver a empezar", nota: "No hay una frase mágica: lo que cuenta es la actitud de presencia." }
  };
  function joc6(zona) {
    const st = { i: 0, tria: null, fi: false };
    const pinta = () => {
      const T = C6[L()]; zona.textContent = "";
      if (st.fi) {
        zona.append(el("p", "joc-fi", T.fi));
        const r = el("button", "joc-boto", T.torna); r.type = "button";
        r.addEventListener("click", () => { st.i = 0; st.tria = null; st.fi = false; pinta(); });
        zona.append(r, el("p", "joc-nota", T.nota)); return;
      }
      const e = T.escenes[st.i];
      zona.append(el("p", "joc-compte", T.comptador(st.i + 1, T.escenes.length)));
      const esc = el("div", "escena"); esc.append(el("span", null, e.qui), el("b", null, e.diu)); zona.append(esc);
      const llista = el("div", "respostes");
      e.op.forEach((o, k) => {
        const b = el("button", "opcio" + (st.tria === k ? " triada " + o[1] : "") + (st.tria !== null && st.tria !== k && o[1] === "val" ? " val-mostra" : ""));
        b.type = "button"; b.disabled = st.tria !== null;
        b.append(el("span", null, "«" + o[0] + "»"));
        if (st.tria !== null) b.append(el("small", "tipus " + o[1], T.noms[o[1]]));
        b.addEventListener("click", () => { st.tria = k; pinta(); zona.querySelector(".joc-boto")?.focus(); });
        llista.append(b);
      });
      zona.append(llista);
      if (st.tria !== null) {
        zona.append(el("p", "resposta", e.op[st.tria][2]));
        const n = el("button", "joc-boto", T.seg); n.type = "button";
        n.addEventListener("click", () => { st.tria = null; st.i++; if (st.i >= T.escenes.length) st.fi = true; pinta(); });
        zona.append(n);
      }
    };
    pinta();
    return pinta;
  }

  // ---------- 7. Algú que es fa càrrec: romandre ----------
  const C7 = {
    ca: { boto: "Mantén premut per romandre", romans: "Romans…", alerta: "Alerta de la mon(e)a",
      fases: [[70, "La mon(e)a encara vigila. Nota que hi ets, però no se'n fia del tot."], [40, "Comença a notar presència. No l'has convençuda de res: només hi ets."], [15, "Pot baixar la guàrdia. Hi ha algú que es fa càrrec, i s'obre el camp per mirar el present."], [0, "Ara ja no ha de cercar amenaces per sentir-se segura."]],
      inici: "La mon(e)a té l'alerta alta. Mantén premut el botó (o la barra d'espai) i queda-t'hi. Si el deixes anar, l'alerta torna a pujar a poc a poc.",
      deixa: "Has deixat anar i l'alerta torna a pujar. No passa res: tornar també és part de la permanència.",
      fi: "El que ha fet baixar l'alerta no ha estat la velocitat, sinó romandre. Per això a l'AIS no entrenam a relaxar-nos, sinó a quedar-nos.", torna: "Torna a començar", nota: "És una metàfora visual del que proposa la TEC, no una mesura de res." },
    es: { boto: "Mantén pulsado para permanecer", romans: "Permaneces…", alerta: "Alerta de la mon(e)a",
      fases: [[70, "La mon(e)a todavía vigila. Nota que estás, pero no se fía del todo."], [40, "Empieza a notar presencia. No la has convencido de nada: solo estás."], [15, "Puede bajar la guardia. Hay alguien que se hace cargo, y se abre el campo para mirar el presente."], [0, "Ahora ya no tiene que buscar amenazas para sentirse segura."]],
      inici: "La mon(e)a tiene la alerta alta. Mantén pulsado el botón (o la barra espaciadora) y quédate. Si lo sueltas, la alerta vuelve a subir poco a poco.",
      deixa: "Has soltado y la alerta vuelve a subir. No pasa nada: volver también es parte de la permanencia.",
      fi: "Lo que ha hecho bajar la alerta no ha sido la velocidad, sino permanecer. Por eso en el AIS no entrenamos a relajarnos, sino a quedarnos.", torna: "Volver a empezar", nota: "Es una metáfora visual de lo que propone la TEC, no una medida de nada." }
  };
  function joc7(zona) {
    const st = { a: 100, prem: false, t: null, havia: false, fi: false };
    let barra, txt, b;
    const msg = () => {
      const T = C7[L()];
      if (st.fi) return T.fi;
      if (!st.prem && st.havia && st.a > 15) return T.deixa;
      if (!st.havia) return T.inici;
      return T.fases.find((f) => st.a > f[0])?.[1] || T.fases[T.fases.length - 1][1];
    };
    const refresca = () => {
      if (!barra) return;
      barra.style.width = st.a + "%"; barra.parentNode.setAttribute("aria-valuenow", String(Math.round(st.a)));
      txt.textContent = msg();
      b.textContent = st.prem ? C7[L()].romans : C7[L()].boto; b.setAttribute("aria-pressed", String(st.prem));
    };
    const tic = () => {
      st.a = Math.max(0, Math.min(100, st.a + (st.prem ? -1.2 : 0.8)));
      if (st.a === 0) { st.fi = true; atura(); pinta(); return; }
      if (!st.prem && st.a >= 100) { clearInterval(st.t); st.t = null; }
      refresca();
    };
    const engega = () => { if (st.fi) return; st.prem = true; st.havia = true; if (!st.t) st.t = setInterval(tic, 120); refresca(); };
    const deixa = () => { if (!st.prem) return; st.prem = false; refresca(); };
    const atura = () => { st.prem = false; clearInterval(st.t); st.t = null; };
    const pinta = () => {
      const T = C7[L()]; zona.textContent = "";
      const m = el("div", "alerta"); m.setAttribute("role", "meter"); m.setAttribute("aria-label", T.alerta);
      m.setAttribute("aria-valuemin", "0"); m.setAttribute("aria-valuemax", "100");
      barra = el("span"); m.append(barra);
      zona.append(el("span", "joc-compte", T.alerta), m);
      txt = el("p", st.fi ? "joc-fi" : "resposta"); txt.setAttribute("aria-live", "polite"); zona.append(txt);
      if (st.fi) {
        b = el("button", "joc-boto", T.torna); b.type = "button";
        b.addEventListener("click", () => { Object.assign(st, { a: 100, havia: false, fi: false }); pinta(); });
        txt.textContent = T.fi; zona.append(b, el("p", "joc-nota", T.nota)); barra.style.width = "0%"; return;
      }
      b = el("button", "joc-boto romandre"); b.type = "button";
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); engega(); });
      ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((ev) => b.addEventListener(ev, deixa));
      b.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); engega(); } });
      b.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") deixa(); });
      b.addEventListener("contextmenu", (e) => e.preventDefault());
      zona.append(b, el("p", "joc-nota", T.nota));
      refresca();
    };
    pinta();
    return () => { if (st.t && !st.fi) refresca(); else pinta(); };
  }

  // ---------- 8. La respiració curiosa ----------
  const C8 = {
    ca: { comença: "Comença (tres respiracions)", fases: { in: "L'aire entra i fa d'esquer: la teva atenció el segueix cap avall…", fix: "…fins a la panxa, i s'hi queda.", out: "L'aire surt. Tu romans allà baix, fent companyia." },
      zones: ["coll", "pit", "panxa"], compte: (n) => `Respiració ${n} de 3`, pregunta: "On has notat més la teva presència?",
      ops: { coll: "Al coll", pit: "Al pit", panxa: "A la panxa", enlloc: "No he notat res especial" },
      resp: { coll: "Bé. El coll és sovint la primera porta: la gola i el clatell noten quan algú hi arriba.", pit: "Bé. Al pit hi ha el cor i els pulmons, i s'hi nota el ritme de l'aire.", panxa: "Bé. A la panxa és on la TEC situa la vulnerabilitat, i on més compta que hi hagi algú.", enlloc: "També està bé. No cal notar res especial: el que compta és haver-hi estat, de dalt a baix." },
      torna: "Torna a fer-ho", nota: "Un tast del gest de l'AIS. Si et marejes o no et sents bé, atura't i respira com sempre." },
    es: { comença: "Empieza (tres respiraciones)", fases: { in: "El aire entra y hace de cebo: tu atención lo sigue hacia abajo…", fix: "…hasta la barriga, y se queda ahí.", out: "El aire sale. Tú permaneces allí abajo, haciendo compañía." },
      zones: ["cuello", "pecho", "barriga"], compte: (n) => `Respiración ${n} de 3`, pregunta: "¿Dónde has notado más tu presencia?",
      ops: { coll: "En el cuello", pit: "En el pecho", panxa: "En la barriga", enlloc: "No he notado nada especial" },
      resp: { coll: "Bien. El cuello es a menudo la primera puerta: la garganta y la nuca notan cuando alguien llega.", pit: "Bien. En el pecho están el corazón y los pulmones, y se nota el ritmo del aire.", panxa: "Bien. En la barriga es donde la TEC sitúa la vulnerabilidad, y donde más cuenta que haya alguien.", enlloc: "También está bien. No hace falta notar nada especial: lo que cuenta es haber estado, de arriba abajo." },
      torna: "Volver a hacerlo", nota: "Una muestra del gesto del AIS. Si te mareas o no te sientes bien, para y respira como siempre." }
  };
  function joc8(zona) {
    const st = { fase: "inici", n: 0, tria: null, timers: [] };
    const neteja = () => { st.timers.forEach(clearTimeout); st.timers = []; };
    const D = { in: 3500, fix: 2000, out: 6000 };
    const cicle = () => {
      st.n++; st.fase = "in"; pinta();
      st.timers.push(setTimeout(() => { st.fase = "fix"; pinta(); }, D.in));
      st.timers.push(setTimeout(() => { st.fase = "out"; pinta(); }, D.in + D.fix));
      st.timers.push(setTimeout(() => { if (st.n < 3) cicle(); else { st.fase = "fi"; pinta(); } }, D.in + D.fix + D.out));
    };
    const pinta = () => {
      const T = C8[L()]; zona.textContent = "";
      const fig = sv("svg", { viewBox: "0 0 120 200", class: "resp-fig fase-" + st.fase + (quiet ? " quiet" : ""), "aria-hidden": "true" });
      fig.append(sv("circle", { cx: 60, cy: 34, r: 22, class: "cos" }));
      fig.append(sv("path", { d: "M60 58c-30 0-42 18-42 44v66c0 12 10 20 22 20h40c12 0 22-8 22-20v-66c0-26-12-44-42-44z", class: "cos" }));
      [[66, T.zones[0]], [104, T.zones[1]], [150, T.zones[2]]].forEach(([y]) => fig.append(sv("circle", { cx: 60, cy: y, r: 4, class: "ancora" })));
      fig.append(sv("circle", { cx: 60, cy: 30, r: 9, class: "aire" }));
      fig.append(sv("circle", { cx: 60, cy: 30, r: 11, class: "llum" }));
      const cap = el("div", "resp-cap"); cap.append(fig);
      const costat = el("div", "resp-text");
      if (st.fase === "inici") {
        const b = el("button", "joc-boto", T.comença); b.type = "button";
        b.addEventListener("click", () => { neteja(); st.n = 0; st.tria = null; cicle(); });
        costat.append(b);
      } else if (st.fase === "fi") {
        costat.append(el("p", "joc-compte", T.pregunta));
        const ops = el("div", "temps-tria");
        Object.keys(T.ops).forEach((k) => {
          const b = el("button", "tria" + (st.tria === k ? " triada" : ""), T.ops[k]); b.type = "button";
          b.addEventListener("click", () => { st.tria = k; pinta(); });
          ops.append(b);
        });
        costat.append(ops);
        if (st.tria) costat.append(el("p", "joc-fi", T.resp[st.tria]));
        const r = el("button", "joc-boto sec", T.torna); r.type = "button";
        r.addEventListener("click", () => { neteja(); st.fase = "inici"; pinta(); });
        costat.append(r);
      } else {
        costat.append(el("p", "joc-compte", T.compte(st.n)));
        const p = el("p", "resp-fase", T.fases[st.fase]); p.setAttribute("aria-live", "polite"); costat.append(p);
      }
      cap.append(costat); zona.append(cap, el("p", "joc-nota", T.nota));
    };
    pinta();
    return pinta;
  }

  // ---------- 9. Fer el que té sentit encara que no en tengui ganes ----------
  const C9 = {
    ca: { sit: [
        ["Has quedat per anar a veure l'àvia i fa un dia gris.", "Quedar-me al sofà", "Anar-hi igualment", "Cuidar la família"],
        ["Toca estudiar i el mòbil no para de sonar.", "Mirar el mòbil una estona", "Posar-lo lluny i començar", "Aprendre"],
        ["Un amic t'ha fallat i et ve de gust no contestar-li més.", "Deixar-lo en visto", "Dir-li com t'has sentit", "L'amistat i la sinceritat"],
        ["Has fet una errada a la feina i ningú no se n'ha adonat.", "Callar", "Dir-ho i cercar com arreglar-ho", "L'honestedat"]
      ], ganes: "Les ganes diuen", sentit: "El que té sentit diu", valor: "Valor en joc", comptador: (i, t) => `Situació ${i} de ${t}`,
      rG: "També ens passa a tots. Sense jutjar-te: què et faria falta per acostar-te una mica al valor la pròxima vegada?",
      rS: "Ho has triat tu, encara que el cos no en tengués ganes. Nota el malestar que ve amb la tria i acompanya'l: no cal que se'n vagi per actuar.",
      seg: "Següent", fi: (n, t) => `Has triat el que té sentit en ${n} de ${t} situacions. No és una nota: és un mapa de quines situacions et costen més.`, torna: "Torna a començar" },
    es: { sit: [
        ["Has quedado para ir a ver a la abuela y hace un día gris.", "Quedarme en el sofá", "Ir igualmente", "Cuidar a la familia"],
        ["Toca estudiar y el móvil no para de sonar.", "Mirar el móvil un rato", "Ponerlo lejos y empezar", "Aprender"],
        ["Un amigo te ha fallado y te apetece no contestarle más.", "Dejarlo en visto", "Decirle cómo te has sentido", "La amistad y la sinceridad"],
        ["Has cometido un error en el trabajo y nadie se ha dado cuenta.", "Callar", "Decirlo y buscar cómo arreglarlo", "La honestidad"]
      ], ganes: "Las ganas dicen", sentit: "Lo que tiene sentido dice", valor: "Valor en juego", comptador: (i, t) => `Situación ${i} de ${t}`,
      rG: "También nos pasa a todos. Sin juzgarte: ¿qué te haría falta para acercarte un poco al valor la próxima vez?",
      rS: "Lo has elegido tú, aunque el cuerpo no tuviera ganas. Nota el malestar que viene con la elección y acompáñalo: no hace falta que se vaya para actuar.",
      seg: "Siguiente", fi: (n, t) => `Has elegido lo que tiene sentido en ${n} de ${t} situaciones. No es una nota: es un mapa de qué situaciones te cuestan más.`, torna: "Volver a empezar" }
  };
  function joc9(zona) {
    const st = { i: 0, tria: null, n: 0, fi: false };
    const pinta = () => {
      const T = C9[L()]; zona.textContent = "";
      if (st.fi) {
        zona.append(el("p", "joc-fi", T.fi(st.n, T.sit.length)));
        const r = el("button", "joc-boto", T.torna); r.type = "button";
        r.addEventListener("click", () => { Object.assign(st, { i: 0, tria: null, n: 0, fi: false }); pinta(); });
        zona.append(r); return;
      }
      const [s, g, v, val] = T.sit[st.i];
      zona.append(el("p", "joc-compte", T.comptador(st.i + 1, T.sit.length)));
      zona.append(el("p", "frase", s));
      zona.append(el("p", "valor", T.valor + ": " + val));
      const ops = el("div", "dues");
      [["g", T.ganes, g], ["s", T.sentit, v]].forEach(([k, et, t]) => {
        const b = el("button", "cami c-" + k + (st.tria === k ? " triada" : "")); b.type = "button"; b.disabled = st.tria !== null;
        b.append(el("small", null, et), el("b", null, t));
        b.addEventListener("click", () => { st.tria = k; if (k === "s") st.n++; pinta(); zona.querySelector(".joc-boto")?.focus(); });
        ops.append(b);
      });
      zona.append(ops);
      if (st.tria) {
        zona.append(el("p", "resposta", st.tria === "s" ? T.rS : T.rG));
        const n = el("button", "joc-boto", T.seg); n.type = "button";
        n.addEventListener("click", () => { st.tria = null; st.i++; if (st.i >= T.sit.length) st.fi = true; pinta(); });
        zona.append(n);
      }
    };
    pinta();
    return pinta;
  }

  const JOCS = { consciencia: joc1, "espai-temps": joc2, transcendencia: joc3, "pensament-critic": joc4,
    "paraula-imatge": joc5, vulnerabilitat: joc6, "fer-se-carrec": joc7, respiracio: joc8, sentit: joc9 };
  const repinta = [];
  document.querySelectorAll(".joc[data-joc]").forEach((j) => {
    const f = JOCS[j.dataset.joc]; const z = j.querySelector(".joc-zona");
    if (f && z) repinta.push(f(z));
  });
  // Quan canvia l'idioma (el botó CA/ES canvia l'atribut lang), es tornen a pintar els jocs.
  new MutationObserver(() => repinta.forEach((p) => p())).observe(root, { attributes: true, attributeFilter: ["lang"] });
})();
