/* APRENS · Service Worker (MVP1)
   Precache del app-shell → funciona 100% offline tras la primera visita.
   Estrategia: cache-first para el shell; para el resto, red con fallback a caché.
   Sube CACHE al cambiar archivos para forzar actualización. */
const CACHE = "aprens-v13";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/aprens.css",
  "./css/tools/estado-mono.css",
  "./css/tools/donde-esta-mono.css",
  "./js/aprens-core.js",
  "./js/registry.js",
  "./js/app.js",
  "./js/tools/cuestionario-tec.js",
  "./js/tools/estado-mono.js",
  "./js/tools/donde-esta-mono.js",
  "./tools-standalone/agenda-atencional.html",
  "./tools-standalone/ais-curiosidad.html",
  "./tools-standalone/bajar-alerta.html",
  "./tools-standalone/brujula-valores.html",
  "./tools-standalone/acompanar-sensacion.html",
  "./tools-standalone/ais-amor.html",
  "./tools-standalone/screening-tec.html",
  "./tools-standalone/mapa-interno.html",
  "./tools-standalone/ais-muscular.html",
  "./tools-standalone/herramienta-diaria.html",
  "./tools-standalone/protocolo-ais.html",
  "./tools-standalone/control-ira.html",
  "./tools-standalone/retorno-trabajo.html",
  "./tools-standalone/tracker-ais.html",
  "./tools-standalone/tracker-tec.html",
  "./vendor/chart.umd.min.js",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-maskable.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
