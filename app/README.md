# APRENS · App (MVP1 — PWA instalable y offline)

Andamiaje de la app única del paciente. Consolida las herramientas APRENS en **una sola**
aplicación web instalable, con **un único `aprens_db`** por paciente (fin de la fragmentación
entre los ~17 sitios Netlify actuales), **sin dependencias externas** (offline + RGPD).

## Qué incluye este MVP1
- ✅ **Shell + hub + router** (`index.html`, `js/app.js`, `js/registry.js`).
- ✅ **Núcleo único** `js/aprens-core.js` (el tuyo, sin cambios: `aprens_db`, export `aprens-export`).
- ✅ **3 herramientas migradas**:
  - `js/tools/cuestionario-tec.js` — reutiliza tu `CFG` y el scoring L/D/C intacto.
  - `js/tools/estado-mono.js` — "¿Cómo llevas a tu mono?" con sus 5 escenas, 4 pasos AIS,
    mini-AIS de respiración (60s) y continuidad. **Caso de migración legacy**: la versión
    original no usaba el core (clave propia `aprens_estado_mono_hist` + export solo texto);
    aquí se conserva toda la clínica intacta pero se persiste en el `aprens_db` único y se
    exporta también `aprens-export` para el panel (el resumen de WhatsApp se mantiene).
  - `js/tools/donde-esta-mono.js` — "El detective del mono": clasificador local por palabras
    (ES/CA) que infiere en cuál de las 4 posiciones está el mono, con dibujo SVG, 4 pasos AIS,
    herramienta sugerida y captura de "aprendizaje supervisado" para el psicólogo. Era
    navegacional (sin persistencia); ahora guarda en el `aprens_db` único + `aprens-export`.
  - `tools-standalone/agenda-atencional.html` — Agenda semanal completa (6 vistas: Plan, Semana,
    Hoy, AIS, Valores, Enviar; modal de actividades, brújula de valores, respiración, backup JSON).
    Por su tamaño y complejidad se integra **como standalone vía iframe** (mismo origen), en vez
    de re-transcribirla: se le quitó Google Fonts (offline + RGPD) y se le añadió un **puente** que,
    al ver "Enviar", guarda un **resumen diario** (foco medio, sobrepensamiento, hechas, % mono al
    lado, AIS) en el `aprens_db` único para el panel. Mantiene su propio estado interno rico.
  - `tools-standalone/ais-curiosidad.html` — "Entrenar AIS desde la curiosidad": 9 exploraciones
    graduadas, mapa corporal SVG (ancla visual), temporizador, checklist curiosidad→análisis y
    continuidad. Autocontenida (sin dependencias externas). Integrada **como standalone vía iframe**
    con **puente** al core: cada práctica guardada se registra en el `aprens_db` único
    (ejercicio, nivel, ancla, cualidades, microacción → mapeo TEC = Densidad).
  - `tools-standalone/bajar-alerta.html` — "Bajar la alerta": 4 pasos (para y mira · respira y
    ancla con mapa corporal + respiración adaptada al nivel · ponle nombre · microacción), con
    termómetro de alerta antes/después. **Ya venía integrada con el core** (embebe `aprens-core`,
    `Aprens.config/collect/mountBar`); se integra **como standalone vía iframe** quitando solo
    Google Fonts. Su registro (antes/después, bajada, ancla, zona, emoción, micro) va al `aprens_db`
    único vía su propio core embebido (mismo origen).
  - `tools-standalone/acompanar-sensacion.html` — "Acompañar la sensación": paradas AIS (intensidad
    antes/después, mapa corporal, respiración adaptada). Legacy (clave propia) → iframe + puente:
    cada parada registra en el `aprens_db` único (intensidad antes/después, diferencia, zona → TEC=D).
  - `tools-standalone/ais-amor.html` — "AIS desde el amor": 10 ejercicios cotidianos para acompañarte
    (no controlarte). Legacy → iframe + puente en `guardarPractica` (ejercicio, nivel, micro,
    cualidades → TEC=D). El detective lo enruta internamente en "delante" (y como alternativa).
  - `tools-standalone/screening-tec.html` — Instrumento **Screening TEC/AIS** (dual: paciente +
    profesional): consentimiento RGPD, análisis L/D/C, seguimiento y **gráficas de evolución
    (Chart.js)**. Integrado como standalone: **Chart.js vendorizado** en `/vendor/` (offline) y sin
    Google Fonts. Conserva su propio sistema (BD por paciente, códigos, export de investigación);
    no usa el `aprens_db` único (su modelo multi-paciente no encaja con collect-on-export). Un puente
    del resultado en modo paciente queda como mejora futura.
  - `tools-standalone/brujula-valores.html` — "Mi Brújula de valores" (ACT): 11 áreas vitales;
    por cada una, importancia + cómo llevas al mono + cercanía + tu valor. Calcula discrepancia
    (importancia − cercanía), dibuja un **árbol de valores** (SVG) y da lectura clínica. **Ya venía
    integrada con el core**; standalone vía iframe quitando solo Google Fonts. Registro al
    `aprens_db` único (discrepancia total, cercanía media → mapeo TEC = Continuidad, distribución
    del mono, ramas firmes, focos). El detective la enruta internamente en "a mi lado".
- ✅ **Instalable + offline**: `manifest.webmanifest` + `sw.js` (service worker con precache del shell).
- ✅ **Sin Google Fonts**: stack tipográfico del sistema (ver nota de fuentes en `css/aprens.css`).
- ✅ **Pauta por URL** conservada: `?foco=L|D|C` resalta el foco de la semana en el hub.

## Cómo probarlo en local
Un service worker necesita servirse por HTTP (no `file://`):
```bash
cd app
python3 -m http.server 8080
# abre http://localhost:8080
```
En el móvil/Chrome: menú → "Añadir a pantalla de inicio" para instalarla.
Para verificar el modo offline: cárgala una vez, activa el modo avión y recarga.

## Cómo desplegarla (Netlify)
Arrastra la carpeta `app/` a Netlify (o apunta el sitio a este subdirectorio). Al ser una sola
app, **todas las herramientas comparten un mismo origen y un mismo `aprens_db`**.

## Dependencias externas / offline (RGPD)
Ninguna herramienta debe cargar recursos de terceros (rompe offline y filtra la IP del paciente).
Al integrar una herramienta:
- **Google Fonts** → se elimina el `<link>` (cae al stack tipográfico del sistema).
- **Librerías por CDN** (p. ej. Chart.js en el Screening) → se **vendorizan** en `/vendor/` y se
  cambia el `src` a la ruta local (`../vendor/…`); se añaden al precache del `sw.js`.
- **wa.me y enlaces a sitios** (Netlify, protecmir…) son navegaciones que inicia el usuario, no
  recursos cargados: pueden quedarse (pero enrútalos internos si la herramienta destino ya está migrada).

## Circuito interno (enlaces entre herramientas)
Algunas herramientas se sugieren entre sí (p. ej. el detective "¿Dónde está el mono?" recomienda
"Bajar la alerta" o "AIS curiosidad"). Cuando la herramienta destino **ya está migrada**, el enlace
debe ir a la ruta interna (`#/tool/<id>`, sin `target=_blank`) para no salir de la app; si aún no
está migrada, se mantiene el enlace externo a Netlify.

En `js/tools/donde-esta-mono.js` esto se controla con el mapa `INTERNAL_ROUTES`
(`URL Netlify → #/tool/<id>`). **Al migrar una herramienta nueva, añade su URL a ese mapa** para
cerrar el circuito. (Las herramientas standalone en iframe no re-enrutan enlaces al padre por ahora.)

## Cómo migrar la siguiente herramienta
**Opción A — módulo nativo** (recomendada para herramientas pequeñas/medias):
1. Crea `js/tools/<toolId>.js` siguiendo el patrón de `cuestionario-tec.js`
   (pega su `CFG`/lógica actual; usa `Aprens.config`, `Aprens.collect`, `Aprens.mountBar`).
2. Registra `window.APRENS_TOOL_<toolId> = { mount }`.
3. En `js/registry.js`, pon `migrada:true` en esa herramienta.
4. Añade su `<script>` en `index.html` y su ruta al precache de `sw.js` (sube `CACHE`).

**Opción B — standalone vía iframe** (para herramientas grandes/complejas, como la agenda):
1. Copia el HTML original a `tools-standalone/<tool>.html`; quítale Google Fonts y
   añade `<script src="../js/aprens-core.js"></script>` + un puente que llame a `Aprens.save`
   con un resumen para el panel.
2. En `js/registry.js`, marca `migrada:true` con `iframe:"tools-standalone/<tool>.html"`.
3. Añade el archivo al precache de `sw.js`. El router (`app.js`) ya sabe montar iframes.

## Pendiente (siguientes MVP)
- Iconos PNG (192/512 + maskable) para instalación óptima en iOS/stores (hoy: SVG).
- Portar el resto de herramientas (ver `registry.js`). Nota: las herramientas **legacy**
  (con clave `localStorage` propia y export de texto, como lo era `estado_mono`) se migran
  igual que `estado-mono.js`: conservar su UX/clínica y redirigir la persistencia al core.
- MVP2: backend Supabase (UE) + sync cifrada + panel con login.
- MVP3: empaquetado Capacitor + push + secure storage.

Ver la auditoría y el plan completo en `../AUDITORIA_Y_PLAN.md`.
