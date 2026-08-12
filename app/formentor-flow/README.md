# Formentor Flow · Manager (V2)

Uno de los cuatro activos de la metodología **Formentor Flow** (Centre APRENS):

| Activo | Función |
|---|---|
| **Flow Map** | Detecta dónde pierde fluidez el sistema (interfaces, no personas). |
| **Flow Leaders** | Entrena a los nodos con mayor capacidad de regulación. |
| **Flow Manager** | *(esta app)* Transfiere lo aprendido a la situación real, bajo presión. |
| **Season Memory** | Conserva el aprendizaje de cada temporada para la siguiente. |

PWA independiente (instalable, offline, sin backend) — ayuda de decisión para
mandos: convierte la presión en información. Uso previsto: **30–90 segundos**.

## Flujo

Situación → **PARA** → **ORDENA** → **COMUNICA** → **VERIFICA**
(comercialmente los tres grandes pasos son PARA · ORDENA · COMUNICA; VERIFICA es el cierre operacional).

1. **Situación** — 6 opciones: Incidencia · Sobrecarga · Conflicto · Cambio de prioridad · Coordinación · **Relevo**.
2. **PARA** — respiración guiada 4-4 + pregunta central: *«¿Vas a transmitir información o activación?»* (5–15 s para recuperar capacidad ejecutiva).
3. **ORDENA** — preguntas **adaptadas a cada situación** (no las mismas para todas).
4. **COMUNICA** — genera la estructura **descendente** (QUÉ / QUIÉN / CUÁNDO / PRIORIDAD / CRITERIO), **ascendente** (S·I·N·P) o de **relevo** (PENDIENTE / ESTADO / RESPONSABLE / PRIORIDAD / SIGUIENTE REVISIÓN), con dictado por voz y botón *Copiar*.
5. **VERIFICA** — checklist rápido (no obligatorio) para cerrar: ¿ha quedado claro?

Cada situación incluye **«Ver ejemplo»** (❌ reactivo / ✓ operativo, hotelero, sin nombres reales) y una **microfrase** de aprendizaje (una línea, sin sermón).

## Características

- **Un solo `index.html`** con HTML/CSS/JS inline, **sin recursos de terceros** → cumple la CSP estricta del sitio (`default-src 'self'`).
- **Instalable / offline**: `manifest.webmanifest` + `sw.js` (precache del shell) + iconos SVG.
- **Bilingüe ES / EN**. Optimizada para móvil, uso con una mano, exterior y pocos segundos.
- **Dictado por voz** (Web Speech API) con desactivación elegante donde no hay soporte.

## Privacidad (no negociable)

Sin backend · sin tracking · sin analytics · sin `localStorage` de contenido personal ·
sin perfiles psicológicos · sin rankings · sin información individual para RRHH.

> «Esta herramienta no evalúa cómo trabajas. Te ayuda a ordenar cómo responder.»

El dictado por voz usa el reconocimiento del propio dispositivo/navegador (puede
procesarse en la nube del proveedor); la app en sí no almacena ni envía nada.
Un eventual **Flow Map digital** sería un sistema **independiente**, con datos
**agregados y anonimizados** orientados a procesos/interfaces — nunca dentro de Flow Manager.

## Marco

Traducción organizacional del marco propio TEC/AIS de Centre APRENS, en su capa
de fondo. La herramienta **entrena el gesto, no lo sustituye**: crea las condiciones
para que el mando pare y decida, sin fabricar dependencia.

## Despliegue

Se publica con el sitio (Netlify `publish = app/`). Ruta: `/formentor-flow/`.
No está en `js/registry.js` a propósito: es un producto de cliente, ajeno al hub de pacientes.

## Estructura

```
app/formentor-flow/
├── index.html              · la app (HTML + CSS + JS inline)
├── manifest.webmanifest    · instalación PWA
├── sw.js                   · service worker (precache → offline)
├── assets/
│   ├── icon.svg
│   └── icon-maskable.svg
└── README.md
```
