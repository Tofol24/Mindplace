/* global document */
// Genera los PDF de la ficha «Herramientas AIS básicas» (A4, una página)
// a partir de las páginas de la app (es.html y ca.html) y los copia donde se publican.
// Las páginas se editan en app/assets/fichas/eines-ais-basiques/ (texto en el .html,
// diseño en ficha.css). Después, desde la raíz del repo:
//   node scripts/fichas/eines-ais-basiques.mjs
// y sube CACHE en app/sw.js. Necesita Playwright con Chromium
// (ya instalado en el entorno de Claude, o con `npm run check:instalar`).
import { createRequire } from "node:module";
import { copyFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fuentes = join(raiz, "app", "assets", "fichas", "eines-ais-basiques");
let chromium;
try { ({ chromium } = createRequire(join(raiz, "scripts", "revision", "package.json"))("playwright")); }
catch { ({ chromium } = createRequire(import.meta.url)("playwright")); }

const salidas = {
  es: ["app/assets/pdf/eines-ais-basiques.pdf", "portada/descarregues/APRENS-eines-ais-basiques.pdf"],
  ca: ["app/assets/pdf/eines-ais-basiques-ca.pdf", "portada/descarregues/APRENS-eines-ais-basiques-ca.pdf"],
};

const nav = await chromium.launch();
for (const [lang, destinos] of Object.entries(salidas)) {
  const pag = await nav.newPage({ viewport: { width: 794, height: 1123 } });
  await pag.emulateMedia({ media: "print" });
  await pag.goto(pathToFileURL(join(fuentes, lang + ".html")).href);
  await pag.waitForLoadState("networkidle");
  const desborda = await pag.evaluate(() => { const p = document.querySelector(".page"); return p.scrollHeight > p.clientHeight; });
  if (desborda) throw new Error(lang + ".html no cabe en un A4: acorta el texto.");
  const tmp = join(raiz, "scripts", "fichas", "tmp-" + lang + ".pdf");
  await pag.pdf({ path: tmp, format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  for (const d of destinos) copyFileSync(tmp, join(raiz, d));
  rmSync(tmp);
  console.log(lang + " → " + destinos.join(", "));
  await pag.close();
}
await nav.close();
console.log("Recuerda subir CACHE en app/sw.js.");
