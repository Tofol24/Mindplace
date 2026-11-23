/* global document */
// Genera los PDF de la ficha «Herramientas AIS básicas» (A4, una página)
// a partir de es.html y ca.html, y los copia donde se publican.
// Uso (desde la raíz del repo):  node docs/fichas/eines-ais-basiques/generar.mjs
// Necesita Playwright con Chromium (ya instalado en el entorno de Claude,
// o con `npm run check:instalar`).
import { createRequire } from "node:module";
import { copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..", "..");
const require = createRequire(join(raiz, "scripts", "revision", "package.json"));
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire(import.meta.url)("playwright")); }

const salidas = {
  es: ["app/assets/pdf/eines-ais-basiques.pdf", "portada/descarregues/APRENS-eines-ais-basiques.pdf"],
  ca: ["portada/descarregues/APRENS-eines-ais-basiques-ca.pdf"],
};

const nav = await chromium.launch();
for (const [lang, destinos] of Object.entries(salidas)) {
  const pag = await nav.newPage({ viewport: { width: 794, height: 1123 } });
  await pag.goto(pathToFileURL(join(aqui, lang + ".html")).href);
  await pag.waitForLoadState("networkidle");
  const desborda = await pag.evaluate(() => { const p = document.querySelector(".page"); return p.scrollHeight > p.clientHeight; });
  if (desborda) throw new Error(lang + ".html no cabe en un A4: acorta el texto.");
  const tmp = join(aqui, "ficha-" + lang + ".pdf");
  await pag.pdf({ path: tmp, format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  for (const d of destinos) copyFileSync(tmp, join(raiz, d));
  console.log(lang + " → " + destinos.join(", "));
  await pag.close();
}
await nav.close();
console.log("Recuerda subir CACHE en app/sw.js si cambia el PDF de la app.");
