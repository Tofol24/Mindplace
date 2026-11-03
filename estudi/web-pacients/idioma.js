/* Explica-ho · idioma de les pàgines de subscripció (català / castellà).
   El mateix criteri que l'eina: el que s'hagi triat (explica:ui); si ja es feia servir l'eina, català;
   si no, l'idioma del navegador. Es desa perquè l'eina s'obri en el mateix idioma després de pagar.
   Les pàgines s'escriuen en català i, en castellà, cada text es tradueix en mostrar-se (frases senceres). */
"use strict";
const UI = (() => {
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  let v = get("explica:ui");
  if (v !== "ca" && v !== "es") {
    v = null;
    try { if (Object.keys(localStorage).some(k => k.startsWith("explica:") && k !== "explica:probe")) v = "ca"; } catch { /* sense localStorage */ }
    if (!v) for (const l of navigator.languages || [navigator.language || ""]) {
      const b = String(l).toLowerCase().split("-")[0];
      if (b === "ca" || b === "va") { v = "ca"; break; }
      if (b === "es" || b === "gl" || b === "eu") { v = "es"; break; }
    }
    v = v || "es";
    try { localStorage.setItem("explica:ui", v); } catch { /* no es pot desar */ }
  }
  return v;
})();
document.documentElement.lang = UI;

const ES = {
  // comú
  "Torna-ho a provar": "Vuelve a intentarlo",
  "He perdut el codi": "He perdido el código",
  "Torna a Explica-ho": "Vuelve a Explica-ho",
  "Obre Explica-ho": "Abre Explica-ho",
  "portal de Stripe": "portal de Stripe",
  "correu@exemple.com": "correo@ejemplo.com",
  "Revisa el correu: no sembla vàlid.": "Revisa el correo: no parece válido.",
  // subscriu.html
  "Subscripció a Explica-ho": "Suscripción a Explica-ho",
  "Explica-ho ajuda a estudiar de manera activa: ordena el material del curs en un resum i un mapa conceptual, fa preguntes que van de les dades concretes fins a relacionar les idees, i corregeix exercicis de matemàtiques, ciències i llengua pas a pas. La subscripció dona un codi d'accés personal per fer-la servir des del navegador de qualsevol ordinador o mòbil.":
    "Explica-ho ayuda a estudiar de manera activa: ordena el material del curso en un resumen y un mapa conceptual, hace preguntas que van de los datos concretos hasta relacionar las ideas, y corrige ejercicios de matemáticas, ciencias y lengua paso a paso. La suscripción da un código de acceso personal para usarla desde el navegador de cualquier ordenador o móvil.",
  "1 · Tria el pla": "1 · Elige el plan",
  "Carregant els plans…": "Cargando los planes…",
  "No s'han pogut carregar els plans. Torna-ho a provar d'aquí a una estona.": "No se han podido cargar los planes. Vuelve a intentarlo dentro de un rato.",
  "Ara mateix no hi ha subscripcions obertes.": "Ahora mismo no hay suscripciones abiertas.",
  "Cada guia, ronda de preguntes, correcció o pàgina llegida d'una foto compta com una petició. Les peticions es renoven cada mes.":
    "Cada guía, ronda de preguntas, corrección o página leída de una foto cuenta como una petición. Las peticiones se renuevan cada mes.",
  "2 · Correu per a les factures": "2 · Correo para las facturas",
  "Correu per a les factures": "Correo para las facturas",
  "Opcional: si no el poses aquí, te'l demanarà Stripe. És el correu on arribaran les factures": "Opcional: si no lo pones aquí, te lo pedirá Stripe. Es el correo al que llegarán las facturas",
  "i el codi d'accés, i des d'on es gestionarà la subscripció": "y el código de acceso, y desde el que se gestionará la suscripción",
  ", i a partir de la segona factura també hi sortirà el codi d'accés": ", y a partir de la segunda factura también aparecerá en ellas el código de acceso",
  "3 · Consentiment": "3 · Consentimiento",
  "Soc el pare, la mare o el tutor legal de l'estudiant (o l'estudiant és major d'edat). He llegit les": "Soy el padre, la madre o el tutor legal del estudiante (o el estudiante es mayor de edad). He leído las",
  "condicions d'ús": "condiciones de uso",
  "i la": "y la",
  "política de privacitat": "política de privacidad",
  ", i entenc que el material i les respostes es processen amb una intel·ligència artificial (Claude, d'Anthropic) i que pot equivocar-se.":
    ", y entiendo que el material y las respuestas se procesan con una inteligencia artificial (Claude, de Anthropic) y que puede equivocarse.",
  "Demano que el servei comenci de seguida, abans que acabi el termini de desistiment de 14 dies. Entenc que, si desistesc dins aquest termini, es descomptarà la part proporcional del servei ja prestat.":
    "Pido que el servicio empiece enseguida, antes de que termine el plazo de desistimiento de 14 días. Entiendo que, si desisto dentro de este plazo, se descontará la parte proporcional del servicio ya prestado.",
  "Continua al pagament": "Continúa al pago",
  "Obrint el pagament…": "Abriendo el pago…",
  "Ja tinc un codi": "Ya tengo un código",
  "El pagament el gestiona Stripe: les dades de la targeta no passen mai per Explica-ho. Et pots donar de baixa quan vulguis des de l'eina, a Configuració → Gestiona la subscripció. Per desistir dins els 14 dies, escriu-nos (ho explicam a les":
    "El pago lo gestiona Stripe: los datos de la tarjeta nunca pasan por Explica-ho. Puedes darte de baja cuando quieras desde la herramienta, en Configuración → Gestiona la suscripción. Para desistir dentro de los 14 días, escríbenos (lo explicamos en las",
  "condicions": "condiciones",
  "No s'ha pogut obrir el pagament. Torna-ho a provar.": "No se ha podido abrir el pago. Vuelve a intentarlo.",
  // gracies.html
  "Codi d'accés d'Explica-ho": "Código de acceso de Explica-ho",
  "Comprovant el pagament…": "Comprobando el pago…",
  "Només són uns segons.": "Solo son unos segundos.",
  "Aquest és el teu codi d'accés": "Este es tu código de acceso",
  "Copia el codi": "Copia el código",
  "Copiat": "Copiado",
  "Ja l'hem desat en aquest navegador, així que pots començar directament.": "Ya lo hemos guardado en este navegador, así que puedes empezar directamente.",
  "Aquest navegador no ha deixat desar-lo: copia'l ara i escriu-lo a Explica-ho, a Configuració.": "Este navegador no ha dejado guardarlo: cópialo ahora y escríbelo en Explica-ho, en Configuración.",
  "Guarda'l també en un lloc segur": "Guárdalo también en un lugar seguro",
  ": el necessitaràs per fer servir l'eina en un altre ordinador o mòbil. A partir de la factura del segon mes també hi sortirà; si tanques aquesta pàgina sense guardar-lo, hi pots tornar des de l'historial del navegador.":
    ": lo necesitarás para usar la herramienta en otro ordenador o móvil. A partir de la factura del segundo mes también aparecerá en ella; si cierras esta página sin guardarlo, puedes volver a ella desde el historial del navegador.",
  "També te l'hem enviat per correu, a l'adreça amb què has pagat. Si no et surt, mira la carpeta de correu brossa.": "También te lo hemos enviado por correo, a la dirección con la que has pagado. Si no te aparece, mira la carpeta de correo no deseado.",
  "No hem pogut confirmar el pagament": "No hemos podido confirmar el pago",
  "Falta la referència del pagament.": "Falta la referencia del pago.",
  "Torna a la subscripció": "Vuelve a la suscripción",
  "El pagament encara no consta com a fet. Espera un minut i torna-ho a provar.": "El pago todavía no consta como hecho. Espera un minuto y vuelve a intentarlo.",
  "No s'ha pogut recuperar el codi d'aquest pagament. Torna-ho a provar d'aquí a una estona; si s'ha cobrat i continua fallant, escriu a l'adreça de contacte de les condicions d'ús.":
    "No se ha podido recuperar el código de este pago. Vuelve a intentarlo dentro de un rato; si se ha cobrado y sigue fallando, escribe a la dirección de contacto de las condiciones de uso.",
  // recupera.html
  "He perdut el codi d'Explica-ho": "He perdido el código de Explica-ho",
  "Escriu el correu amb què es va pagar la subscripció i t'hi enviarem el codi d'accés i un enllaç per gestionar-la (factures, targeta, baixa).":
    "Escribe el correo con el que se pagó la suscripción y te enviaremos el código de acceso y un enlace para gestionarla (facturas, tarjeta, baja).",
  "Correu amb què es va pagar": "Correo con el que se pagó",
  "Envia'm el codi": "Envíame el código",
  "Si el codi te'l va donar directament el teu psicòleg o una altra persona, demana-li a ella.": "Si el código te lo dio directamente tu psicólogo u otra persona, pídeselo a esa persona.",
  "També pots entrar directament al": "También puedes entrar directamente al",
  "amb el correu amb què es va pagar.": "con el correo con el que se pagó.",
  "Ara mateix no es poden enviar codis per correu. El codi surt a les factures mensuals a partir de la segona; per gestionar o donar de baixa la subscripció, entra al":
    "Ahora mismo no se pueden enviar códigos por correo. El código aparece en las facturas mensuales a partir de la segunda; para gestionar o dar de baja la suscripción, entra en el",
  "Escriu el correu.": "Escribe el correo.",
  "Ja s'ha demanat moltes vegades avui. Torna-ho a provar demà.": "Ya se ha pedido muchas veces hoy. Vuelve a intentarlo mañana.",
  "Ara mateix no es pot enviar. Torna-ho a provar d'aquí a una estona.": "Ahora mismo no se puede enviar. Vuelve a intentarlo dentro de un rato.",
  "Si hi ha alguna subscripció amb aquest correu, t'hi acabam d'enviar el codi i un enllaç per gestionar-la. Mira també la carpeta de correu brossa.":
    "Si hay alguna suscripción con este correo, te acabamos de enviar el código y un enlace para gestionarla. Mira también la carpeta de correo no deseado.",
};
// Frases amb nombres o noms.
const ES_RX = [
  [/^Fins a (\d+) peticions al mes$/, "Hasta $1 peticiones al mes"],
  [/^Pla (.+): fins a (\d+) peticions al mes\.$/, "Plan $1: hasta $2 peticiones al mes."],
];
const T = (s) => UI === "es" && Object.hasOwn(ES, s) ? ES[s] : s;
function trText(s) {
  const core = s.trim(); if (!core) return null;
  let r = Object.hasOwn(ES, core) ? ES[core] : null;
  if (r === null) for (const [rx, f] of ES_RX) if (rx.test(core)) { r = core.replace(rx, f); break; }
  if (r === null || r === core) return null;
  const i = s.indexOf(core); return s.slice(0, i) + r + s.slice(i + core.length);
}
const ATTRS = ["placeholder", "aria-label", "title"];
function trNode(n) {
  if (n.nodeType === 3) { if (n.parentElement?.closest("script,style,[data-noi18n]")) return; const r = trText(n.data); if (r !== null) n.data = r; return; }
  if (n.nodeType !== 1 || n.closest("script,style,[data-noi18n]")) return;
  for (const el of [n, ...n.querySelectorAll("*")]) for (const a of ATTRS) { const v = el.getAttribute(a); const r = v ? trText(v) : null; if (r !== null) el.setAttribute(a, r); }
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode()) trNode(t);
}
if (UI === "es") {
  new MutationObserver((ms) => { for (const m of ms) { if (m.type === "characterData") trNode(m.target); else m.addedNodes.forEach(trNode); } })
    .observe(document.body, {subtree: true, childList: true, characterData: true});
  trNode(document.body);
  document.title = T(document.title);
}
// En castellà, els enllaços a les condicions i a la privacitat porten a la versió castellana.
if (UI === "es") for (const a of document.querySelectorAll('a[href^="condicions.html"], a[href^="privacitat.html"]'))
  a.setAttribute("href", a.getAttribute("href").replace("condicions.html", "condiciones.html").replace("privacitat.html", "privacidad.html").replace("#desistiment", "#desistimiento"));
// Canvi d'idioma al peu de la pàgina.
(() => {
  const main = document.querySelector("main"); if (!main) return;
  const p = document.createElement("p"); p.className = "muted small"; p.setAttribute("data-noi18n", "");
  p.innerHTML = '<a href="#" data-l="ca" lang="ca">Català</a> · <a href="#" data-l="es" lang="es">Castellano</a>';
  p.querySelector(`[data-l="${UI}"]`).setAttribute("aria-current", "true");
  p.addEventListener("click", (e) => {
    const l = e.target.closest("[data-l]")?.dataset.l; if (!l) return;
    e.preventDefault(); if (l === UI) return;
    try { localStorage.setItem("explica:ui", l); } catch { /* no es pot desar */ }
    location.reload();
  });
  main.append(p);
})();
