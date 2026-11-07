#!/usr/bin/env node
/* APRENS · Espai de difusió: genera les imatges dels carrusels (1080×1350) i les
   miniatures de YouTube (1280×720) a partir de portada/difusio/contingut.js.
   Ús (des de l'arrel):  node scripts/difusio/genera-imatges.mjs [id-fitxa …]
   Les imatges queden a portada/difusio/img/<fitxa>-<idioma>-<n>.jpg i -yt.jpg */
/* global document -- (dins pagina.evaluate, que corre al navegador) */
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(AQUI, "../../portada/difusio");
const SORTIDA = path.join(DIR, "img");
mkdirSync(SORTIDA, { recursive: true });

const ctx = { window: {} };
vm.runInNewContext(readFileSync(path.join(DIR, "contingut.js"), "utf8"), ctx);
const filtre = process.argv.slice(2);
const fitxes = ctx.window.DIFUSIO.fitxes.filter((f) => !filtre.length || filtre.includes(f.id));

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 1350 }, deviceScaleFactor: 1 });
const base = pathToFileURL(path.join(DIR, "plantilla.html")).href;
let n = 0;
async function captura(hash, fitxer) {
  await pagina.goto("about:blank");
  await pagina.goto(`${base}#${hash}`);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForLoadState("networkidle");
  await pagina.locator("#slide").screenshot({ path: path.join(SORTIDA, fitxer), type: "jpeg", quality: 84 });
  n++;
}
for (const f of fitxes) {
  for (const lang of ["ca", "es"]) {
    for (let i = 1; i <= f.slides[lang].length; i++) await captura(`${f.id}/${lang}/${i}`, `${f.id}-${lang}-${i}.jpg`);
    if (f.yt) await captura(`${f.id}/${lang}/yt`, `${f.id}-${lang}-yt.jpg`);
  }
}
await navegador.close();
console.log(`Fetes ${n} imatges a ${path.relative(process.cwd(), SORTIDA)}`);
