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
  - `tools-standalone/mapa-interno.html` — "Mapa de atención interna": el cuerpo como mapa
    interoceptivo (cuello · pecho · barriga), con pasos AIS por zona, chips de cualidades,
    intensidad, curiosidad, orbe de respiración y **recorrido completo** guiado. Legacy (clave
    propia `aprens_mapa_dia`, sin dependencias externas) → iframe + puente: cada zona o recorrido
    guardado registra en el `aprens_db` único un resumen diario (zona, cualidades, intensidad,
    curiosidad, hechos del día → **mapeo TEC = Densidad**, porque la interocepción es cuestión de
    grano/textura del sentir). Upsert por día (`mapa-<fecha>`): no duplica el registro diario.
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

## Panel del psicólogo (MVP2 — local-first, cifrado)
Carpeta `panel/` (URL `…/panel/`, **no enlazada desde el hub del paciente**). Es la
consola donde tú reúnes la evolución de cada paciente a partir de los `.json` que te envían.
- **Login local + cifrado en reposo**: en el primer uso creas un *código de acceso*; con él
  se deriva (PBKDF2) una clave AES-GCM que **cifra** los datos en `localStorage`. El código
  no se guarda: se pide al abrir. Es el equivalente honesto de un login sin backend (RGPD:
  nada sale a la nube; si te roban el equipo, sin el código no se leen los datos).
- **Importar** (multi-formato): sube/arrastra uno o varios `.json` (o pega el contenido). Reconoce:
  (a) el sobre de las herramientas del paciente (`type:"aprens-export"`), (b) el **backup del
  Screening TEC** (`app:"APRENS_TEC"`/`APRENS_TEC_INVESTIGACION` → convierte `datos{código:{screenings,
  seguimientos}}` a registros `screening_tec`/`screening_seg` con L/D/C del `analisis.ice`; usa clave
  por fecha para **fusionar sin duplicar** con el backup del panel), (c) el **backup del panel anterior**
  (`{schema, pacientes:{código:{tools}}}`, mismo modelo interno, 12 tipos de herramienta) y (d) la
  **copia de seguridad de este panel** (`type:"aprens-panel-backup"`). Todo se fusiona por
  `paciente.codigo` (upsert por `id`/`date`/`fecha`). La gráfica L/D/C se nutre de cualquier herramienta
  con L/D/C (Cuestionario, Screening inicial, seguimiento y Tracker). Verificado con **3 backups reales**
  (44 pacientes): importación, fusión sin duplicados, reimport idempotente, sin nombres reales ni errores.
- **Vistas clínicas** por paciente: evolución **L/D/C** (Chart.js vendorizado), reparto de
  **posiciones del mono** (conduce/delante/maletero/a mi lado + % «a mi lado»), **valores**
  (discrepancia y cercanía de la brújula), **regulación de la alerta** (antes→después) y
  **actividad reciente** (todas las herramientas, con resumen por registro).
- **Copia de seguridad**: exporta todo el panel a un `.json` (⚠️ sin cifrar) para mover de equipo.
- **`PanelStore`** es una capa de almacenamiento **intercambiable**: hoy es local+cifrado;
  para MVP2.5 se sustituye por un adaptador Supabase sin tocar la UI ni las métricas.
- **SW propio** (`panel/sw.js`, scope `/panel/`) → el panel funciona offline y no cae al hub
  del paciente.
- Verificado con Playwright (`e2e-panel.js`): crear código, importar (pegado y archivo),
  métricas correctas, gráficas dibujadas, persistencia cifrada (bloquear→recargar→descifrar),
  rechazo de código incorrecto, sin peticiones externas ni errores JS.

## Versión consumer «Calma» (MVP3 · Fase A — bienestar/psicoeducación)
Carpeta `bienestar/` (URL `…/bienestar/`). Es un **segundo producto sobre el mismo motor**
(TEC/AIS) y el **mismo `aprens_db`**, con piel de bienestar para venderlo en stores como app
**psicoeducativa, NO clínica** (así evita clasificarse como producto sanitario):
- **Lenguaje de bienestar** (sin «clínico/paciente/terapia») y **disclaimer** visible «no es un
  producto sanitario» + recurso de crisis (024).
- **Onboarding** con objetivos (calma · foco · hábitos · inteligencia emocional), nombre opcional,
  **sin código de profesional**.
- **Hub** (Hoy/Explora) con prácticas reetiquetadas en consumer, que abren las herramientas
  standalone en un overlay (iframe).
- **Mi progreso** personal (del propio `aprens_db`): racha, prácticas, días activos, gráfica de
  actividad (Chart.js) y «cómo has llevado tu mente» (posiciones del mono en lenguaje amable).
- **SW propio** (`bienestar/sw.js`, scope `/bienestar/`). No toca la app clínica de producción.
- Verificado (`e2e-bienestar.js`): onboarding + disclaimer gating, recomendados por objetivo,
  abrir práctica, progreso con racha/gráfica, persistencia de perfil, sin peticiones externas ni
  errores JS.
- **Marca (Fase A.2):** «**Anclado en mí**» ⚓ · «Vuelve a ti» (título, cabecera, onboarding y
  `manifest.webmanifest` propio para instalación).
- **Copy en modo consumer:** el lenguaje clínico de las prácticas (barra «Código paciente», «Enviar a
  mi psicólogo/a», «en la sesión», «APRENS Psicologia»…) se limpia **en caliente desde `bienestar.js`**
  procesando el iframe (mismo origen) con `consumerCopy()` + `MutationObserver` — **sin tocar los
  archivos compartidos**, así la app clínica conserva su lenguaje. Verificado (`e2e-marca.js`): brújula
  sin «psicólogo/sesión», barra de export reetiquetada («Guardar (.json)») y «Código paciente» oculto.
- **Plan de cambio guiado (v1):** «Anclado en mí» deja de ser una caja de herramientas y **dirige**.
  Ver diseño en `../PLAN_DE_CAMBIO.md`. Implementa:
  - **Onboarding narrativo** con la historia del mono (voz de *«¿Quién conduce tu vida?»*, 6 pantallas)
    + «La historia» completa (deck de 13 láminas) reconsultable.
  - **Evaluación de entrada → recomendación** (L/D/C ligero; foco = eje más flojo → primera práctica),
    repetible y con aviso de **reevaluación cada 2 semanas**.
  - **Plan por fases libre-pero-guiado** (1 Anclar/alerta · 2 Curiosidad · 3 Amor · 4 Valores): la
    pestaña **Hoy** sugiere *un* paso; **Plan** muestra las fases (avance manual, todo accesible).
  - **Visitas al mono** (5 momentos diarios · racha) y **práctica base «Sentarme junto al mono»** (3 min,
    nativa, guarda en `sentarse_mono`).
  - **Termómetro amenaza→reto** (registrado y con línea de evolución) + gráfica de actividad y
    distribución del mono en «Mi progreso».
  - Estado propio en `aprens_anclado` (perfil, plan, visitas, amenaza→reto, evaluación); las prácticas
    siguen guardando en el `aprens_db` único. Verificado (`e2e-anclado.js`, `e2e-marca.js`).
- **Rutina diaria + avisos (interino):** «Mi rutina diaria» (Ajustes) con momentos fijos (hora +
  on/off) para un minuto de **Respiración curiosa** (micro-práctica nativa: *para el pensamiento ·
  respira con curiosidad · aquí y ahora*, guarda en `respiracion_curiosa`). En **Hoy** aparece un
  **aviso** cuando toca un momento y no se ha hecho hoy. Notificaciones web **best-effort** (piden
  permiso y se programan con `setTimeout` mientras la app está abierta; en iPhone/PWA no son
  fiables). Estructura **lista para Capacitor LocalNotifications** en la Fase nativa. Verificado
  (`e2e-rutina.js`).
- **Pendiente**: notificaciones **siempre-activas** (Fase C nativa) · icono propio de marca.
  **Fase B**: paywall (RevenueCat) + cuentas. **Fase C**: Capacitor + Apple/Google.

## Pendiente (siguientes MVP)
- Iconos PNG (192/512 + maskable) para instalación óptima en iOS/stores (hoy: SVG).
- Portar el resto de herramientas (ver `registry.js`). Nota: las herramientas **legacy**
  (con clave `localStorage` propia y export de texto, como lo era `estado_mono`) se migran
  igual que `estado-mono.js`: conservar su UX/clínica y redirigir la persistencia al core.
- MVP2 ✅ panel del psicólogo local-first cifrado (`panel/`). Pendiente MVP2.5:
  adaptador Supabase (UE) para multi-dispositivo/sync (sustituye `PanelStore`).
- MVP3: empaquetado Capacitor + push + secure storage.

Ver la auditoría y el plan completo en `../AUDITORIA_Y_PLAN.md`.
