/* Genera els PDF de la guia per a clubs a partir de guia.html (català) i guia-es.html (castellà).
   Ús (des de l'arrel del repositori):  node docs/guia-clubs/build.cjs [ca|es]   (sense argument, les dues)
   Requereix Playwright (Chromium) i python3 amb pypdf (per treure el peu de la portada).
   Sortida: app/assets/pdf/guia-clubs-esport-aprens.pdf i app/assets/pdf/guia-clubs-esport-aprens-es.pdf */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const DIR = __dirname;
const ARREL = path.resolve(DIR, '../..');
const URL_APP = 'https://aprens-app.aprens.net/esport-base/';
const VERSIONS = {
  ca: { font: 'guia.html', sortida: 'guia-clubs-esport-aprens.pdf',
        peu: "APRENS · Esport de base: salut i rendiment · Guia de treball psicològic amb clubs",
        titol: "Esport de base: salut i rendiment. Guia de treball psicològic amb clubs esportius" },
  es: { font: 'guia-es.html', sortida: 'guia-clubs-esport-aprens-es.pdf',
        peu: 'APRENS · Deporte base: salud y rendimiento · Guía de trabajo psicológico con clubes',
        titol: 'Deporte base: salud y rendimiento. Guía de trabajo psicológico con clubes deportivos' }
};

/* QR amb la mateixa llibreria que fa servir l'app (app/vendor), carregada sense dependre del tipus de mòdul */
function qrDataURI(text) {
  const codi = fs.readFileSync(path.join(ARREL, 'app/vendor/qrcode-generator-1.4.4.js'), 'utf8');
  const qrcode = new Function(codi + '\nreturn qrcode;')();
  const q = qrcode(0, 'Q'); q.addData(text); q.make();
  const n = q.getModuleCount(), m = 2; let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#1F2A37"/></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

async function genera(b, lang) {
  const v = VERSIONS[lang];
  const font = path.join(DIR, v.font);
  if (!fs.existsSync(font)) { console.log('No hi ha', v.font, '(s\'omet)'); return; }
  const html = fs.readFileSync(font, 'utf8').replace('__QR__', qrDataURI(URL_APP));
  const tmp = path.join(DIR, `.guia-build-${lang}.html`);
  fs.writeFileSync(tmp, html);
  const p = await b.newPage();
  await p.goto('file://' + tmp, { waitUntil: 'load' });
  const peu = `<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#55606B;padding:0 17mm;display:flex;justify-content:space-between">
    <span>${v.peu}</span><span>aprens.net · <span class="pageNumber"></span></span></div>`;
  const tot = path.join(DIR, `.tot-${lang}.pdf`), portada = path.join(DIR, `.portada-${lang}.pdf`);
  await p.pdf({ path: tot, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: peu, preferCSSPageSize: true });
  await p.pdf({ path: portada, format: 'A4', printBackground: true, pageRanges: '1', preferCSSPageSize: true });
  await p.close();
  const sortida = path.join(ARREL, 'app/assets/pdf', v.sortida);
  fs.mkdirSync(path.dirname(sortida), { recursive: true });
  execFileSync('python3', ['-I', '-c', `
import sys
from pypdf import PdfReader, PdfWriter
tot, portada, sortida, titol = sys.argv[1:5]
w = PdfWriter(); w.add_page(PdfReader(portada).pages[0])
for pg in PdfReader(tot).pages[1:]: w.add_page(pg)
w.add_metadata({'/Title': titol, '/Author': 'Tòfol Villalonga · APRENS Psicologia'})
with open(sortida, 'wb') as f: w.write(f)
print(len(w.pages), 'pàgines ->', sortida)
`, tot, portada, sortida, v.titol], { stdio: 'inherit' });
  [tmp, tot, portada].forEach((f) => { try { fs.unlinkSync(f); } catch (e) {} });
}

(async () => {
  const quines = process.argv[2] ? [process.argv[2]] : ['ca', 'es'];
  const b = await chromium.launch();
  for (const l of quines) await genera(b, l);
  await b.close();
})();
