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
    expEt: "Estudio", appstore: "Apps para iPhone en la App Store:", expD: "Una herramienta para organizar los apuntes, repasar con preguntas y corregir ejercicios.",
    novetats: "Novedades y apariciones", llibres: "Libros", fotos: "El despacho y el día a día", contacte: "Contacto",
    horari: "Horario: de 9 a 21 h", avis: "Aviso legal y privacidad", galetes: "Esta web no usa cookies ni analítica.",
    tot: "Todo", mitjans: "En los medios", llibre: "Libros", novetat: "Novedades", article: "Artículos",
    disponible: "Disponible", properament: "Próximamente", llegir: "Ver más", comprar: "Dónde comprarlo", autor: "Todos los libros del autor en Amazon →", serie: "La colección completa «Crece, cría y trasciende desde dentro» →",
  },
};
const CAT = {mitjans: "Als mitjans", llibre: "Llibres", novetat: "Novetats", article: "Articles"};

let lang = "ca", data = null, filtre = "";
try { const s = localStorage.getItem("aprens:idioma"); lang = s === "es" || s === "ca" ? s : (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "ca"; } catch {}
const ca = {};
document.querySelectorAll("[data-t]").forEach(el => { ca[el.dataset.t] = el.textContent; });
const t = (k) => (lang === "es" ? T.es[k] : ca[k]) ?? ({tot: "Tot", disponible: "Disponible", properament: "Properament", llegir: "Més informació", comprar: "On comprar-lo"}[k] ?? CAT[k] ?? k);
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
  document.querySelectorAll(".idioma button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  if (!data) return;
  const L = data.enllacos || {};
  for (const k of ["app", "consulta", "explica"]) if (safeUrl(L[k])) $("#l-" + k).href = safeUrl(L[k]);
  if (safeUrl(L.cita)) $("#l-cita").href = safeUrl(L.cita);
  const apps = (data.apps || []).filter(a => a.nom && safeUrl(a.url));
  $("#appstore").hidden = !apps.length;
  $("#l-apps").innerHTML = apps.map(a => `<a href="${esc(safeUrl(a.url))}" rel="noopener noreferrer">${esc(tx(a.nom))} →</a>`).join(" · ");
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
      ${link ? `<a href="${esc(link)}" rel="noopener">${esc(t("llegir"))} →</a>` : ""}</div></article>`;
  }).join("");

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

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lang]");
  if (b) { lang = b.dataset.lang; try { localStorage.setItem("aprens:idioma", lang); } catch {} pinta(); return; }
  const f = e.target.closest("[data-f]");
  if (f) { filtre = f.dataset.f; pinta(); document.querySelector(`#filtres [data-f="${filtre}"]`)?.focus(); }
});
pinta();
fetch("contingut.json", {cache: "no-cache"}).then(r => r.json()).then(d => { data = d; pinta(); }).catch(() => {});
