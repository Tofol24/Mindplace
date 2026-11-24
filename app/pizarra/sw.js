/* APRENS · Pizarra del entrenador · Service Worker propio (ámbito /pizarra/)
   - Primero la red: con conexión siempre se usa la última versión; sin conexión, la caché.
   - Recibe los archivos compartidos desde otra app (Android: Compartir → Pizarra):
     el archivo se guarda un momento en una caché local y se abre la pizarra con ?compartido=1.
     Nada sale del móvil. */
const CACHE = "pizarra-v29";
const COMPARTIDO = "pizarra-compartido";
const BASE = [
  "./", "./index.html", "./app.css", "./app.js", "./ficha.js", "./tacticas.js", "./manifest.webmanifest",
  "../vendor/lz-string.min.js", "../js/descarga-segura.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("pizarra-v") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname.endsWith("/pizarra/compartir")) {
    e.respondWith((async () => {
      try {
        const datos = await req.formData();
        const f = datos.get("archivo");
        if (f && typeof f.text === "function" && f.size < 2000000) {
          const c = await caches.open(COMPARTIDO);
          await c.put("./__archivo", new Response(await f.text(), { headers: { "Content-Type": "text/plain; charset=utf-8" } }));
        }
      } catch (err) { /* se abre la pizarra igualmente */ }
      return Response.redirect("./?compartido=1", 303);
    })());
    return;
  }
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.indexOf("/api/") === 0) return; // nunca desde caché
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {}); return res; }
      if (res && res.status >= 500) return caches.match(req).then((hit) => hit || res);
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});
