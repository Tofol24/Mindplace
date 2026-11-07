/* Genera els PDF de la proposta per a clubs.  Ús: node docs/proposta-clubs/build.cjs
   Sortida: app/assets/pdf/proposta-clubs-aprens.pdf i proposta-clubs-aprens-es.pdf */
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [font, sortida] of [['proposta.html', 'proposta-clubs-aprens.pdf'], ['proposta-es.html', 'proposta-clubs-aprens-es.pdf']]) {
    const p = await b.newPage();
    await p.goto('file://' + path.join(__dirname, font), { waitUntil: 'load' });
    await p.pdf({ path: path.join(__dirname, '../../app/assets/pdf', sortida), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await p.close(); console.log('->', sortida);
  }
  await b.close();
})();
