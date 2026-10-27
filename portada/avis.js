// Avís legal: el mateix idioma que la portada (el triat, o si no n'hi ha cap, el del navegador).
"use strict";
let l = ""; try { l = localStorage.getItem("aprens:idioma") || ""; } catch {}
document.documentElement.lang = l === "es" || l === "ca" ? l : (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "ca";
