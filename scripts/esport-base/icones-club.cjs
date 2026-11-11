/* Genera les icones i el manifest d'un club per a «Els pares també juguen»,
   perquè en afegir l'app a la pantalla d'inici (iPhone o Android) surti l'escut del club.

   Ús (des de l'arrel del repositori):
     node scripts/esport-base/icones-club.cjs --slug constancia --imatge ruta/escut.png \
          --nom "C.E. Constància" --curt "Constància" [--fons "#ffffff"] [--tema "#111111"] [--lang ca]
   Sense --slug (o amb --slug app) genera la icona per defecte d'APRENS a partir de --imatge.

   Sortida (club):   app/esport-base/clubs/<slug>-icona-{180,192,512}.png, <slug>-icona-maskable-512.png,
                     app/esport-base/clubs/<slug>.webmanifest
   Sortida (defecte): app/esport-base/icones/… i app/esport-base/manifest.webmanifest
   Després, afegiu "icones": true al fitxer clubs/<slug>.json.
   L'iPhone omple de negre la transparència: per això la icona té sempre fons opac. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const slug = opt('slug', 'app');
if (!/^[a-z0-9-]{1,40}$/.test(slug)) { console.error('slug no vàlid'); process.exit(1); }
const imatge = opt('imatge');
if (!imatge || !fs.existsSync(imatge)) { console.error('Falta --imatge (escut del club, PNG o SVG)'); process.exit(1); }
const esDefecte = slug === 'app';
const ARREL = path.resolve(__dirname, '../..');
const DIR = path.join(ARREL, 'app/esport-base', esDefecte ? 'icones' : 'clubs');
const prefix = esDefecte ? 'aprens' : slug;
const fons = opt('fons', '#ffffff');
const tema = opt('tema', '#FAF8F3');
const nom = opt('nom', esDefecte ? '' : slug);
const curt = opt('curt', esDefecte ? 'Pares juguen' : nom);
const lang = opt('lang', 'ca');

const ext = path.extname(imatge).toLowerCase();
const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
const dataURI = 'data:' + mime + ';base64,' + fs.readFileSync(imatge).toString('base64');

/* marge: icona normal ~10 %; maskable ~22 % (zona segura d'Android) */
const MIDES = [
  { nom: `${prefix}-icona-180.png`, mida: 180, marge: 0.1 },
  { nom: `${prefix}-icona-192.png`, mida: 192, marge: 0.1 },
  { nom: `${prefix}-icona-512.png`, mida: 512, marge: 0.1 },
  { nom: `${prefix}-icona-maskable-512.png`, mida: 512, marge: 0.22 }
];

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const m of MIDES) {
    const pad = Math.round(m.mida * m.marge);
    await p.setViewportSize({ width: m.mida, height: m.mida });
    await p.setContent(`<!doctype html><html><body style="margin:0;background:${fons}">
      <div style="width:${m.mida}px;height:${m.mida}px;box-sizing:border-box;padding:${pad}px;display:flex;align-items:center;justify-content:center;background:${fons}">
      <img src="${dataURI}" style="max-width:100%;max-height:100%;object-fit:contain"></div></body></html>`, { waitUntil: 'load' });
    await p.screenshot({ path: path.join(DIR, m.nom), clip: { x: 0, y: 0, width: m.mida, height: m.mida } });
  }
  await b.close();
  const rel = esDefecte ? 'icones/' : '';
  const manifest = {
    name: esDefecte ? 'Els pares també juguen · APRENS' : `Els pares també juguen · ${nom}`,
    short_name: curt,
    description: 'APRENS · Eina per a famílies i entrenadors de futbol base: abans, durant i després del partit.',
    lang,
    start_url: esDefecte ? './' : `../?club=${slug}`,
    scope: esDefecte ? './' : '../',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF8F3',
    theme_color: tema,
    icons: [
      { src: `${rel}${prefix}-icona-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${rel}${prefix}-icona-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${rel}${prefix}-icona-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
  const fitxer = esDefecte ? path.join(ARREL, 'app/esport-base/manifest.webmanifest') : path.join(DIR, `${slug}.webmanifest`);
  fs.writeFileSync(fitxer, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Icones i manifest generats per a', esDefecte ? 'APRENS (per defecte)' : slug);
})();
