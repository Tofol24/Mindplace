/* Albaranes · service worker: guarda la app en el móvil para abrirla sin cobertura.
   Al cambiar cualquier fichero de la app, sube VERSION para que se actualice. */
const VERSION = "albaranes-v1";
const FICHEROS = [
  "/",
  "/index.html",
  "/css/estilos.css",
  "/js/app.js",
  "/js/db.js",
  "/js/calculos.js",
  "/js/pdf.js",
  "/vendor/jspdf.umd.min.js",
  "/manifest.webmanifest",
  "/icons/icono.svg",
  "/icons/icono-180.png",
  "/icons/icono-192.png",
  "/icons/icono-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHEROS)).then(() => self.skipWaiting()));
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
  // Navegaciones: la app es una sola página.
  const peticion = e.request.mode === "navigate" ? "/index.html" : e.request;
  e.respondWith(
    caches.match(peticion, { ignoreSearch: true }).then((r) => r || fetch(e.request)),
  );
});
