/* Genera el PDF de la guia per a clubs a partir de guia.html.
   Ús (des de l'arrel del repositori):  node docs/guia-clubs/build.cjs
   Requereix Playwright (Chromium) i python3 amb pypdf (per treure el peu de la portada).
   Sortida: app/assets/pdf/guia-clubs-esport-aprens.pdf */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const DIR = __dirname;
const ARREL = path.resolve(DIR, '../..');
const SORTIDA = path.join(ARREL, 'app/assets/pdf/guia-clubs-esport-aprens.pdf');
const URL_APP = 'https://aprens-app.aprens.net/esport-base/';

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

(async () => {
  const html = fs.readFileSync(path.join(DIR, 'guia.html'), 'utf8').replace('__QR__', qrDataURI(URL_APP));
  const tmp = path.join(DIR, '.guia-build.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + tmp, { waitUntil: 'load' });
  const peu = `<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#55606B;padding:0 17mm;display:flex;justify-content:space-between">
    <span>APRENS · Esport de base: salut i rendiment · Guia de treball psicològic amb clubs</span><span>aprens.net · <span class="pageNumber"></span></span></div>`;
  const tot = path.join(DIR, '.tot.pdf'), portada = path.join(DIR, '.portada.pdf');
  await p.pdf({ path: tot, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: peu, preferCSSPageSize: true });
  await p.pdf({ path: portada, format: 'A4', printBackground: true, pageRanges: '1', preferCSSPageSize: true });
  await b.close();
  fs.mkdirSync(path.dirname(SORTIDA), { recursive: true });
  execFileSync('python3', ['-I', '-c', `
import sys
from pypdf import PdfReader, PdfWriter
tot, portada, sortida = sys.argv[1:4]
w = PdfWriter(); w.add_page(PdfReader(portada).pages[0])
for pg in PdfReader(tot).pages[1:]: w.add_page(pg)
w.add_metadata({'/Title': 'Esport de base: salut i rendiment. Guia de treball psicològic amb clubs esportius', '/Author': 'Tòfol Villalonga · APRENS Psicologia'})
with open(sortida, 'wb') as f: w.write(f)
print(len(w.pages), 'pàgines ->', sortida)
`, tot, portada, SORTIDA], { stdio: 'inherit' });
  [tmp, tot, portada].forEach((f) => { try { fs.unlinkSync(f); } catch (e) {} });
})();
