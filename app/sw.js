/* APRENS · Service Worker (MVP1)
   Precache del app-shell → funciona 100% offline tras la primera visita.
   Estrategia: cache-first para el shell; para el resto, red con fallback a caché.
   Sube CACHE al cambiar archivos para forzar actualización. */
const CACHE = "aprens-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/aprens.css",
  "./js/aprens-core.js",
  "./js/registry.js",
  "./js/app.js",
  "./js/tools/cuestionario-tec.js",
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
