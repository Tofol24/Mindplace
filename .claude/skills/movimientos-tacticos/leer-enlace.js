/* global require, process */
// Lee un plan de la pizarra a partir de su enlace (#k=… corto, #p=… largo) y lo deja en JSON, para tomar sus
// pizarras como modelo. Abre el enlace en el navegador (Playwright) y recoge el plan que la app guarda al abrirlo.
// Uso: node .claude/skills/movimientos-tacticos/leer-enlace.js "<enlace>" [salida.json]
// El resultado lleva nombres cortos de jugadores: úsalo solo para ver posiciones y movimientos, y no lo subas al repositorio.
const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const url = process.argv[2], sal = process.argv[3];
  if (!url || !/#[kpc]=/.test(url)) { console.error("Pasa el enlace del plan (con #k=, #p= o #c=)."); process.exit(2); }
  const b = await chromium.launch();
  const p = await (await b.newContext()).newPage();
  await p.goto(url); await p.waitForTimeout(3000);
  const datos = await p.evaluate(() => localStorage.getItem("pz_ultimo"));
  await b.close();
  if (!datos) { console.error("No se ha podido leer el plan (¿enlace caducado o mal copiado?)."); process.exit(3); }
  const pq = JSON.parse(datos), plan = pq.plan || {};
  const salida = { sistema: plan.sistema, tipo: plan.tipo, titulo: plan.titulo, bloques: (plan.bloques || []).map((x, i) => ({
    n: i + 1, cat: x.cat, titulo: x.titulo, texto: x.texto, fij: x.fij, cuando: x.cuando, cond: x.cond,
    pizarra: x.jug ? { vista: x.jug.vista, fichas: x.jug.fichas, pasos: x.jug.pasos } : null })) };
  const txt = JSON.stringify(salida, null, 1);
  if (sal) fs.writeFileSync(sal, txt); else console.log(txt);
})();
