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
