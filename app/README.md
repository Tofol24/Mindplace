# APRENS · App (MVP1 — PWA instalable y offline)

Andamiaje de la app única del paciente. Consolida las herramientas APRENS en **una sola**
aplicación web instalable, con **un único `aprens_db`** por paciente (fin de la fragmentación
entre los ~17 sitios Netlify actuales), **sin dependencias externas** (offline + RGPD).

## Qué incluye este MVP1
- ✅ **Shell + hub + router** (`index.html`, `js/app.js`, `js/registry.js`).
- ✅ **Núcleo único** `js/aprens-core.js` (el tuyo, sin cambios: `aprens_db`, export `aprens-export`).
- ✅ **1 herramienta migrada**: `js/tools/cuestionario-tec.js` (reutiliza tu `CFG` y el scoring L/D/C intacto).
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
1. Crea `js/tools/<toolId>.js` siguiendo el patrón de `cuestionario-tec.js`
   (pega su `CFG`/lógica actual; usa `Aprens.config`, `Aprens.collect`, `Aprens.mountBar`).
2. Registra `window.APRENS_TOOL_<toolId> = { mount }`.
3. En `js/registry.js`, pon `migrada:true` en esa herramienta.
4. Añade su `<script>` en `index.html` y su ruta al precache de `sw.js` (sube `CACHE` a `aprens-v2`).

## Pendiente (siguientes MVP)
- Iconos PNG (192/512 + maskable) para instalación óptima en iOS/stores (hoy: SVG).
- Portar el resto de herramientas (ver `registry.js`).
- MVP2: backend Supabase (UE) + sync cifrada + panel con login.
- MVP3: empaquetado Capacitor + push + secure storage.

Ver la auditoría y el plan completo en `../AUDITORIA_Y_PLAN.md`.
