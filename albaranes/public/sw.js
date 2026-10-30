/* Albaranes · service worker: guarda la app en el móvil para abrirla sin cobertura.
   Se sirve siempre lo guardado (abre al instante, con o sin señal) y, si hay red,
   se descarga a la vez la versión nueva para la próxima vez que se abra.
   Subir VERSION solo hace falta al añadir o quitar ficheros de la lista. */
const VERSION = "albaranes-v7";
const FICHEROS = [
  "/",
  "/css/estilos.css",
  "/js/app.js",
  "/js/db.js",
  "/js/calculos.js",
  "/js/pdf.js",
  "/js/ui.js",
  "/js/catalogo.js",
  "/js/compras.js",
  "/js/voz.js",
  "/js/perfiles.js",
  "/vendor/jspdf.umd.min.js",
  "/manifest.webmanifest",
  "/icons/icono.svg",
  "/icons/icono-180.png",
  "/icons/icono-192.png",
  "/icons/icono-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(FICHEROS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // La API siempre va a la red (el envío a Holded ya tiene su propia cola).
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  // Navegaciones: la app es una sola página, guardada como "/" (sin redirecciones).
  const clave = e.request.mode === "navigate" ? "/" : url.pathname;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const guardada = await cache.match(clave);
    const red = fetch(clave, { cache: "no-cache" })
      .then((r) => {
        if (r.ok && !r.redirected && r.type === "basic") cache.put(clave, r.clone());
        return r;
      })
      .catch(() => null);
    if (guardada) {
      e.waitUntil(red);
      return guardada;
    }
    return (await red) || new Response("Sin conexión", { status: 503, statusText: "Sin conexión" });
  }));
});
