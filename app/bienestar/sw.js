/* Calma · Service Worker propio (scope /bienestar/) — offline + routing propio. */
const CACHE = "aprens-bienestar-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./bienestar.css",
  "./bienestar.js",
  "../js/aprens-core.js",
  "../vendor/chart.umd.min.js",
  "../tools-standalone/bajar-alerta.html",
  "../tools-standalone/acompanar-sensacion.html",
  "../tools-standalone/mapa-interno.html",
  "../tools-standalone/ais-curiosidad.html",
  "../tools-standalone/ais-amor.html",
  "../tools-standalone/brujula-valores.html",
  "../tools-standalone/agenda-atencional.html",
  "../assets/icons/icon.svg"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith("aprens-bienestar")).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
