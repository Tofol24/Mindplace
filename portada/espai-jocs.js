// APRENS · Espai Filosòfic: quatre jocs per pensar, un per eix. Tot passa al navegador; no s'envia ni es desa res.
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

  const JOCS = { consciencia: joc1, "espai-temps": joc2, transcendencia: joc3, "pensament-critic": joc4 };
  const repinta = [];
  document.querySelectorAll(".joc[data-joc]").forEach((j) => {
    const f = JOCS[j.dataset.joc]; const z = j.querySelector(".joc-zona");
    if (f && z) repinta.push(f(z));
  });
  // Quan canvia l'idioma (el botó CA/ES canvia l'atribut lang), es tornen a pintar els jocs.
  new MutationObserver(() => repinta.forEach((p) => p())).observe(root, { attributes: true, attributeFilter: ["lang"] });
})();
