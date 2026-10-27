// APRENS · portada: idioma (CA/ES) i contingut des de contingut.json (novetats, llibres, fotos, enllaços).
"use strict";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
// Només enllaços web o rutes de la mateixa web (res de javascript: ni similars).
const safeUrl = (u) => { const s = String(u || "").trim(); return /^(https:\/\/|\/|[a-z0-9._-]+\/)/i.test(s) && !/^javascript:/i.test(s) ? s : ""; };

const T = {
  es: {
    sub: "Psicología · Tòfol Villalonga",
    h1: "Un lugar donde encontrar las herramientas, la consulta y las novedades de APRENS",
    intro: "APRENS es el gabinete de psicología de Tòfol Villalonga en Inca. Desde aquí puedes entrar en las herramientas que usamos en terapia, pedir cita o conocer la consulta, y seguir lo que vamos publicando.",
    entrades: "Entradas",
    appEt: "Para pacientes", appT: "App APRENS", appD: "Las herramientas de terapia (AIS, TEC, registros y prácticas) en tu móvil. Lo que apuntas se queda en tu dispositivo.",
    citaEt: "Consulta", citaT: "Pedir cita", citaD: "Elige día y hora en Doctoralia, para una primera visita o una sesión.",
    consEt: "Gabinete", consT: "La consulta: aprens.es", consD: "Terapias, equipo, servicios y contacto del gabinete de Inca.",
    expEt: "Estudio", appsT: "Apps para iPhone", appsD: "Sesiones guiadas de Atención Interna Sensorial (AIS): llevar la atención al cuello, al pecho y a la barriga para bajar la alerta y estar con uno mismo.", retratAlt: "Tòfol Villalonga en el despacho de APRENS, en Inca", appAlt: "Ilustración de la app: una silueta con tres puntos donde llevar la atención. 1, cuello: conecta con tu garganta y nuca. 2, pecho: siente tu corazón y pulmones. 3, barriga: percibe tu estómago e intestinos.", expD: "Una herramienta para organizar los apuntes, repasar con preguntas y corregir ejercicios.",
    novetats: "Novedades y apariciones", llibres: "Libros", fotos: "El despacho y el día a día", contacte: "Contacto",
    horari: "Horario: de 9 a 21 h", avis: "Aviso legal y privacidad", galetes: "Esta web no usa cookies ni analítica.",
    tot: "Todo", mitjans: "En los medios", llibre: "Libros", novetat: "Novedades", article: "Artículos", eina: "Herramientas para probar", esport: "Psicología del deporte", provar: "Pruébala", destacats: "Destacados", pausa: "Pausa", repren: "Reanudar", ant: "Anterior", seg: "Siguiente", pantallesN: "Pantallas", pantallaN: "Pantalla", videos: "Vídeos", videosD: "Explicaciones cortas sobre la atención, el cuerpo y la Teoría del Efecto Consciente.", labEt: "Para psicólogos", labT: "Laboratorio TEC", labD: "La Teoría del Efecto Consciente hecha laboratorio: entender el modelo, practicar el AIS y medir el cambio.",
    disponible: "Disponible", properament: "Próximamente", llegir: "Ver más", descarrega: "Descarga el PDF", en_ca: "(en catalán)", en_es: "(en castellano)", comprar: "Dónde comprarlo", autor: "Todos los libros del autor en Amazon →", serie: "La colección completa «Crece, cría y trasciende desde dentro» →",
  },
};
const CAT = {mitjans: "Als mitjans", novetat: "Novetats", eina: "Eines per provar", esport: "Psicologia de l'esport", article: "Articles", llibre: "Llibres"};

let lang = "ca", data = null, filtre = "";
try { const s = localStorage.getItem("aprens:idioma"); lang = s === "es" || s === "ca" ? s : (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "ca"; } catch {}
const ca = {};
document.querySelectorAll("[data-t]").forEach(el => { ca[el.dataset.t] = el.textContent; });
document.querySelectorAll("[data-alt]").forEach(el => { ca[el.dataset.alt] = el.alt; });
document.querySelectorAll("[data-aria]").forEach(el => { ca[el.dataset.aria] = el.getAttribute("aria-label"); });
const t = (k) => (lang === "es" ? T.es[k] : ca[k]) ?? ({tot: "Tot", disponible: "Disponible", properament: "Properament", llegir: "Més informació", descarrega: "Descarrega el PDF", en_ca: "(en català)", en_es: "(en castellà)", comprar: "On comprar-lo", provar: "Prova-la", repren: "Continua", pantallaN: "Pantalla"}[k] ?? CAT[k] ?? k);
// Un text del contingut pot ser "text" o {"ca": ..., "es": ...}
const tx = (v) => v && typeof v === "object" ? (v[lang] || v.ca || v.es || "") : (v || "");
// Data completa (2025-07-05), només mes (2025-07) o només any (2025).
const dataLlarga = (d) => {
  const s = String(d || ""), loc = lang === "es" ? "es-ES" : "ca-ES";
  if (/^\d{4}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) { const x = new Date(s + "-15T12:00:00"); return isNaN(x) ? "" : x.toLocaleDateString(loc, {month: "long", year: "numeric"}); }
  const x = new Date(s + "T12:00:00"); return isNaN(x) ? "" : x.toLocaleDateString(loc, {day: "numeric", month: "long", year: "numeric"});
};

function pinta() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll("[data-alt]").forEach(el => { el.alt = t(el.dataset.alt); });
  document.querySelectorAll("[data-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.aria)); });
  document.querySelectorAll(".idioma button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  if (!data) return;
  const L = data.enllacos || {};
  for (const k of ["app", "consulta", "explica", "laboratori"]) if (safeUrl(L[k])) $("#l-" + k).href = safeUrl(L[k]);
  if (safeUrl(L.cita)) $("#l-cita").href = safeUrl(L.cita);
  const apps = (data.apps || []).filter(a => a.nom && safeUrl(a.url));
  $("#appstore").hidden = !apps.length;
  $("#l-apps").innerHTML = apps.map(a => `<a href="${esc(safeUrl(a.url))}" rel="noopener noreferrer">${esc(tx(a.nom))} →</a>`).join("");
  // Xarxes: només enllaços (res incrustat, perquè la portada no carregui res de fora).
  const xs = [["instagram", "Instagram"], ["facebook", "Facebook (Tòfol)"], ["facebook_aprens", "Facebook (APRENS)"]].filter(([k]) => safeUrl(L[k]));
  $("#xarxes").hidden = !xs.length;
  $("#xarxes").innerHTML = xs.map(([k, n]) => `<a href="${esc(safeUrl(L[k]))}" rel="noopener noreferrer">${n}</a>`).join(" · ");

  const nov = (data.novetats || []).filter(n => tx(n.titol)).sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
  $("#s-novetats").hidden = !nov.length;
  const cats = [...new Set(nov.map(n => n.tipus).filter(c => CAT[c]))];
  $("#filtres").hidden = cats.length < 2;
  $("#filtres").innerHTML = ["", ...cats].map(c => `<button type="button" data-f="${c}" aria-pressed="${c === filtre}">${esc(c ? t(c) : t("tot"))}</button>`).join("");
  $("#novetats").innerHTML = nov.filter(n => !filtre || n.tipus === filtre).map(n => {
    const link = safeUrl(n.enllac), img = safeUrl(n.imatge);
    return `<article class="nov">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}<div class="cos">
      <span class="meta">${esc([CAT[n.tipus] ? t(n.tipus) : "", tx(n.mitja), dataLlarga(n.data)].filter(Boolean).join(" · "))}</span>
      <h3${/^(ca|es)$/.test(n.idioma_titol || "") ? ` lang="${n.idioma_titol}"` : ""}>${esc(tx(n.titol))}</h3>${tx(n.text) ? `<p>${esc(tx(n.text))}</p>` : ""}
      ${link ? `<a href="${esc(link)}" rel="noopener"${n.descarrega ? " download" : ""}${/^(ca|es)$/.test(n.idioma_doc || "") ? ` hreflang="${n.idioma_doc}"` : ""}>${esc(t(n.descarrega ? "descarrega" : n.tipus === "eina" ? "provar" : "llegir"))}${/^(ca|es)$/.test(n.idioma_doc || "") ? " " + esc(t("en_" + n.idioma_doc)) : ""} →</a>` : ""}</div></article>`;
  }).join("");

  // Vídeos: es carreguen només quan es prem el play (preload none).
  const vids = (data.videos || []).filter(v => safeUrl(v.src));
  $("#s-videos").hidden = !vids.length;
  if ($("#videos").dataset.n !== String(vids.length) + lang) {
    $("#videos").dataset.n = String(vids.length) + lang;
    $("#videos").innerHTML = vids.map(v => `<figure class="video"><video controls preload="none" playsinline${safeUrl(v.poster) ? ` poster="${esc(safeUrl(v.poster))}"` : ""} src="${esc(safeUrl(v.src))}" aria-label="${esc(tx(v.titol))}"></video><h3 lang="es">${esc(tx(v.titol))}</h3></figure>`).join("");
  }
  pintaPantalles(nov);

  const ll = (data.llibres || []).filter(b => tx(b.titol));
  $("#s-llibres").hidden = !ll.length;
  $("#llibres").innerHTML = ll.map(b => {
    const img = safeUrl(tx(b.portada));
    // Un sol enllaç («On comprar-lo») o diversos (p. ex. una edició per idioma).
    const links = (b.enllacos || []).filter(e => safeUrl(e.url)).map(e => `<a href="${esc(safeUrl(e.url))}" rel="noopener">${esc(tx(e.text))} →</a>`);
    if (!links.length && safeUrl(b.enllac)) links.push(`<a href="${esc(safeUrl(b.enllac))}" rel="noopener">${esc(t("comprar"))} →</a>`);
    return `<article class="llibre">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}<div class="cos">
      ${b.estat ? `<span class="estat">${esc(t(b.estat))}</span>` : ""}<h3>${esc(tx(b.titol))}</h3>
      ${tx(b.subtitol) ? `<p class="suau">${esc(tx(b.subtitol))}</p>` : ""}${tx(b.text) ? `<p>${esc(tx(b.text))}</p>` : ""}
      ${links.length ? `<p class="enllacos">${links.join("")}</p>` : ""}</div></article>`;
  }).join("");

  $("#autor").hidden = !ll.length || !(safeUrl(L.autor) || safeUrl(L.serie));
  for (const k of ["autor", "serie"]) { $("#l-" + k).hidden = !safeUrl(L[k]); if (safeUrl(L[k])) $("#l-" + k).href = safeUrl(L[k]); }

  const fo = (data.fotos || []).filter(f => safeUrl(f.src));
  $("#s-fotos").hidden = !fo.length;
  $("#fotos").innerHTML = fo.map(f => `<figure><img src="${esc(safeUrl(f.src))}" alt="${esc(tx(f.peu))}" loading="lazy">${tx(f.peu) ? `<figcaption>${esc(tx(f.peu))}</figcaption>` : ""}</figure>`).join("");
}

// Carrusel de pantalles: els elements marcats amb "destacat": true. Passen sols cada 7 s; s'aturen
// en passar-hi el ratolí o el focus, amb el botó «Atura» i si la persona prefereix menys moviment.
let pi = 0, pTimer = null, pPausa = false, pSobre = false;
const menysMoviment = matchMedia("(prefers-reduced-motion: reduce)").matches;
function pintaPantalles(nov) {
  const items = [...nov, ...(data.llibres || [])].filter(x => x.destacat && tx(x.titol));
  $("#s-destacats").hidden = !items.length;
  if (!items.length) return;
  pi = Math.min(pi, items.length - 1);
  $("#pantalles").innerHTML = items.map((x, i) => {
    const ed = (x.enllacos || []).find(e => e.idioma === lang) || (x.enllacos || [])[0];
    const img = safeUrl(tx(x.imatge || x.portada)), link = safeUrl(x.enllac || ed?.url);
    const et = x.tipus && CAT[x.tipus] ? t(x.tipus) : t("llibre");
    return `<article class="pantalla${i === pi ? " activa" : ""}" role="group" aria-roledescription="${esc(t("pantallaN"))}" aria-label="${i + 1} / ${items.length}"${i === pi ? "" : " inert"}>
      <div class="foto">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ""}</div>
      <div class="cos"><span class="etiqueta">${esc(et)}</span>
        <h3${/^(ca|es)$/.test(x.idioma_titol || "") ? ` lang="${x.idioma_titol}"` : ""}>${esc(tx(x.titol))}</h3>${tx(x.text) ? `<p>${esc(tx(x.text))}</p>` : ""}
        ${link ? `<a href="${esc(link)}" rel="noopener"${x.descarrega ? " download" : ""}${/^(ca|es)$/.test(x.idioma_doc || "") ? ` hreflang="${x.idioma_doc}"` : ""}>${esc(t(x.descarrega ? "descarrega" : x.tipus === "eina" ? "provar" : "llegir"))}${/^(ca|es)$/.test(x.idioma_doc || "") ? " " + esc(t("en_" + x.idioma_doc)) : ""} →</a>` : ""}</div></article>`;
  }).join("");
  $("#punts").innerHTML = items.map((_, i) => `<button type="button" data-p="${i}" aria-label="${esc(t("pantallaN"))} ${i + 1}" aria-current="${i === pi}"></button>`).join("");
  $("#c-pausa").textContent = t(pPausa ? "repren" : "pausa");
  $("#c-pausa").setAttribute("aria-pressed", String(pPausa));
  programa();
}
function mostra(i) {
  const ps = [...document.querySelectorAll(".pantalla")]; if (!ps.length) return;
  pi = (i + ps.length) % ps.length;
  ps.forEach((p, k) => { p.classList.toggle("activa", k === pi); p.toggleAttribute("inert", k !== pi); });
  document.querySelectorAll("#punts button").forEach((b, k) => b.setAttribute("aria-current", String(k === pi)));
  programa();
}
function programa() {
  clearTimeout(pTimer);
  if (pPausa || pSobre || menysMoviment || document.hidden) return;
  pTimer = setTimeout(() => mostra(pi + 1), 7000);
}
$("#c-ant").addEventListener("click", () => mostra(pi - 1));
$("#c-seg").addEventListener("click", () => mostra(pi + 1));
$("#c-pausa").addEventListener("click", () => { pPausa = !pPausa; $("#c-pausa").textContent = t(pPausa ? "repren" : "pausa"); $("#c-pausa").setAttribute("aria-pressed", String(pPausa)); programa(); });
$("#punts").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) mostra(Number(b.dataset.p)); });
// El ratolí i el focus s'atenen per separat i a tot el carrusel (també els controls).
let pRatoli = false, pFocus = false;
const sobre = () => { pSobre = pRatoli || pFocus; programa(); };
$("#s-destacats").addEventListener("mouseenter", () => { pRatoli = true; sobre(); });
$("#s-destacats").addEventListener("mouseleave", () => { pRatoli = false; sobre(); });
$("#s-destacats").addEventListener("focusin", () => { pFocus = true; sobre(); });
$("#s-destacats").addEventListener("focusout", (e) => { if (!$("#s-destacats").contains(e.relatedTarget)) { pFocus = false; sobre(); } });
document.addEventListener("visibilitychange", programa);

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (b) { lang = b.dataset.lang; try { localStorage.setItem("aprens:idioma", lang); } catch {} pinta(); return; }
  const f = e.target.closest("[data-f]");
  if (f) { filtre = f.dataset.f; pinta(); document.querySelector(`#filtres [data-f="${filtre}"]`)?.focus(); }
});
pinta();
fetch("contingut.json", {cache: "no-cache"}).then(r => r.json()).then(d => { data = d; pinta(); }).catch(() => {});
