/* APRENS · Service Worker (MVP1)
   Precache del app-shell → funciona 100% offline tras la primera visita.
   Estrategia: cache-first para el shell; para el resto, red con fallback a caché.
   Sube CACHE al cambiar archivos para forzar actualización. */
const CACHE = "aprens-v91";
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
  "./tools-standalone/assets/editorial/cuestionario-tec.webp",
  "./tools-standalone/assets/editorial/checkin-mono.webp",
  "./tools-standalone/assets/editorial/reflexion.webp",
  "./tools-standalone/agenda-atencional.html",
  "./tools-standalone/assets/editorial/agenda-atencional.webp",
  "./tools-standalone/ais-curiosidad.html",
  "./tools-standalone/assets/editorial/ais-curiosidad.webp",
  "./tools-standalone/bajar-alerta.html",
  "./tools-standalone/assets/editorial/bajar-alerta.webp",
  "./tools-standalone/brujula-valores.html",
  "./tools-standalone/assets/editorial/brujula-valores.webp",
  "./tools-standalone/acompanar-sensacion.html",
  "./tools-standalone/assets/editorial/acompanar-la-sensacion.webp",
  "./tools-standalone/ais-basicas.html",
  "./tools-standalone/assets/editorial/ais-anclas.webp",
  "./tools-standalone/ais-amor.html",
  "./tools-standalone/assets/editorial/ais-amor.webp",
  "./tools-standalone/assets/editorial/ais-amor-gestos.webp",
  "./tools-standalone/screening-tec.html",
  "./tools-standalone/assets/editorial/screening-tec.webp",
  "./tools-standalone/mapa-interno.html",
  "./tools-standalone/assets/editorial/mapa-interno.webp",
  "./tools-standalone/ais-muscular.html",
  "./tools-standalone/assets/editorial/ais-muscular.webp",
  "./tools-standalone/assets/editorial/ais-muscular-posturas.webp",
  "./tools-standalone/herramienta-diaria.html",
  "./tools-standalone/assets/editorial/herramienta-diaria.webp",
  "./tools-standalone/pedalea_desde_dentro_aprens.html",
  "./tools-standalone/assets/editorial/pedalea.webp",
  "./tools-standalone/estoy_aqui_conmigo_ais.html",
  "./tools-standalone/assets/editorial/estoy-aqui.webp",
  "./tools-standalone/toco_desde_dentro_aprens.html",
  "./tools-standalone/assets/editorial/toco-desde-dentro.webp",
  "./tools-standalone/cuento_familia_aprens.html",
  "./tools-standalone/assets/editorial/cuento-familia.webp",
  "./tools-standalone/assets/editorial/cuento-familia-b.webp",
  "./tools-standalone/tiempo_limite_peques.html",
  "./tools-standalone/assets/editorial/tiempo-limite.webp",
  "./tools-standalone/fondos_frases_aprens.html",
  "./tools-standalone/la_manada_aprens.html",
  "./tools-standalone/assets/editorial/la-manada.webp",
  "./tools-standalone/quien-conduce.html",
  "./tools-standalone/assets/reflexion-audio.js",
  "./tools-standalone/modelo-atencional.html",
  "./tools-standalone/historia-animada.html",
  "./tools-standalone/historia-manada.html",
  "./tools-standalone/historia-control.html",
  "./tools-standalone/assets/audio/mono/01.m4a",
  "./tools-standalone/assets/audio/mono/02.m4a",
  "./tools-standalone/assets/audio/mono/03.m4a",
  "./tools-standalone/assets/audio/mono/04.m4a",
  "./tools-standalone/assets/audio/mono/05.m4a",
  "./tools-standalone/assets/audio/mono/06.m4a",
  "./tools-standalone/assets/audio/mono/07.m4a",
  "./tools-standalone/assets/audio/mono/08.m4a",
  "./tools-standalone/assets/audio/manada/01.m4a",
  "./tools-standalone/assets/audio/manada/02.m4a",
  "./tools-standalone/assets/audio/manada/03.m4a",
  "./tools-standalone/assets/audio/manada/04.m4a",
  "./tools-standalone/assets/audio/manada/05.m4a",
  "./tools-standalone/assets/audio/manada/06.m4a",
  "./tools-standalone/assets/audio/manada/07.m4a",
  "./tools-standalone/assets/audio/manada/08.m4a",
  "./assets/pdf/la-familia-de-koa-es.pdf",
  "./assets/pdf/la-familia-de-koa-ca.pdf",
  "./assets/pdf/quien-conduce-tu-vida.pdf",
  "./assets/pdf/eines-ais-basiques.pdf",
  "./tools-standalone/protocolo-ais.html",
  "./tools-standalone/assets/editorial/protocolo-ais.webp",
  "./tools-standalone/control-ira.html",
  "./tools-standalone/assets/editorial/control-ira.webp",
  "./tools-standalone/retorno-trabajo.html",
  "./tools-standalone/assets/editorial/retorno-trabajo.webp",
  "./tools-standalone/tracker-ais.html",
  "./tools-standalone/assets/editorial/tracker-ais.webp",
  "./tools-standalone/tracker-tec.html",
  "./tools-standalone/assets/editorial/tracker-tec.webp",
  "./honestidad/index.html",
  "./honestidad/assets/css/styles.css",
  "./honestidad/assets/js/app.js",
  "./honestidad/assets/js/aprens-core.js",
  "./honestidad/assets/images/portada-entrada.webp",
  "./honestidad/assets/images/sentir-mano-pecho.webp",
  "./honestidad/assets/images/describir-textura.webp",
  "./honestidad/assets/images/suspender-ventana.webp",
  "./honestidad/assets/images/compartir-vinculo.webp",
  "./honestidad/assets/images/valorar-movimiento.webp",
  "./exposicion/index.html",
  "./exposicion/assets/images/portada-escalera.webp",
  "./exposicion/assets/css/styles.css",
  "./exposicion/assets/js/app.js",
  "./exposicion/assets/js/aprens-core.js",
  "./exploradora/index.html",
  "./exploradora/assets/images/portada-exploradora.webp",
  "./exploradora/assets/css/styles.css",
  "./exploradora/assets/js/app.js",
  "./exploradora/assets/js/aprens-core.js",
  "./ritual/index.html",
  "./ritual/assets/images/portada-ritual.webp",
  "./ritual/assets/css/styles.css",
  "./ritual/assets/js/app.js",
  "./ritual/assets/js/aprens-core.js",
  "./rincon/index.html",
  "./rincon/assets/images/portada-rincon.webp",
  "./rincon/assets/css/styles.css",
  "./rincon/assets/js/app.js",
  "./rincon/assets/js/aprens-core.js",
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
  // Peticiones con Range (audio en streaming): dejar pasar al navegador,
  // no cachear respuestas parciales (206) para no romper la reproducción.
  if (req.headers.has("range")) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
