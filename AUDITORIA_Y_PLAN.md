# APRENS / TEC / AIS — Auditoría técnica y plan de migración a app móvil clínica

> Documento de arquitectura. Auditoría realizada sobre el código real del ecosistema APRENS
> (herramientas HTML de pacientes + panel del psicólogo + núcleo `aprens-core.js`).
> Objetivo: convertir el ecosistema actual en una app clínica para iOS/Android **sin perder el
> núcleo APRENS/TEC/AIS**: acompañar la sensación interna (no controlarla), ampliar latencia antes
> de responder, actuar desde valores, y observar cuándo "el mono" conduce.

**Estado:** Auditoría (FASE 1) + propuesta (FASES 2–6). No se ha modificado ninguna herramienta.

---

## Resumen ejecutivo

El ecosistema **no** es un conjunto de HTML sueltos e inconsistentes: es un **sistema de componentes
deliberado** con un núcleo común (`aprens-core.js`, esquema v1), un **formato de exportación ya unificado**
(`aprens-export`) y un **panel** que importa, fusiona y grafica. Varias buenas prácticas ya están resueltas
(pseudonimización por código, "no se guarda nada hasta enviar", escapado anti-XSS, gráficas sin librerías
externas, conversor de formatos legacy).

Los problemas reales **no** son de diseño de datos, sino de **empaquetado y despliegue**:

1. **Fragmentación por origen** — hoy son ~17 sitios Netlify independientes; cada uno tiene su propio
   `localStorage`, así que **no existe un registro único del paciente en el dispositivo**.
2. **No instalable / no offline** — sin `manifest` ni service worker, con **Google Fonts por CDN**.
3. **Volatilidad y transferencia manual** — el histórico vive en `localStorage` (se puede perder) y se
   mueve a mano (archivo/WhatsApp/copiar), sin sincronización.
4. **Panel sin login ni cifrado** — datos clínicos importados en claro en el navegador del psicólogo.

**Recomendación:** consolidar en **una sola PWA instalable y offline** (reutilizando los `CFG` y el core),
luego **backend Supabase (UE)** con sync opcional cifrada, y finalmente **empaquetado Capacitor** para
iOS/Android con notificaciones push. No hay que reescribir la lógica clínica: hay que **consolidar y empaquetar**.

---

# FASE 1 — Auditoría técnica (verificada sobre el código)

## 1.1 Alcance revisado

- **A fondo:** `aprens-core.js`, `cuestionario_tec_aprens.html`, el export real
  `aprens_MARTI-01_cuestionario_tec_2026-05-30.json`, `panel_psicologo_aprens.html`, `inicio_aprens.html`.
- **Barrido mecánico** del resto de herramientas: ver **Anexo A — Inventario**.
- **Mapa de despliegue** extraído del panel y del hub (URLs Netlify).

## 1.2 Arquitectura actual (la realidad)

```
        PACIENTE                                        PSICÓLOGO
 ┌─────────────────────────┐                    ┌───────────────────────────┐
 │ inicio.netlify.app (hub) │  ── enlaces ──▶    │ panel (HTML independiente) │
 │  · pauta vía ?foco=L/D/C │  target=_blank     │  · localStorage: PANEL_KEY │
 └───────────┬─────────────┘                    │  · Importa .json (FileReader)│
             │                                   │  · Valida "aprens-export"  │
   ~17 sitios Netlify, 1 por herramienta         │  · FUSIONA + dedupe por    │
   ┌─────────┴───────────┐   ── .json /          │    código de paciente      │
   │ cada herramienta:    │      WhatsApp /       │  · Conversor legacy        │
   │  · embebe aprens-core│      copiar     ───▶  │  · Gráficas canvas propio  │
   │  · localStorage:     │                       │    (sin Chart.js / CDN)    │
   │    "aprens_db"       │                       │  · Histórico longitudinal  │
   │  · collect-on-export │                       │  · SIN login / SIN cifrado │
   └─────────────────────┘                       └───────────────────────────┘
```

## 1.3 Núcleo `aprens-core.js` (el corazón técnico)

Estándar de integración v1, incrustado (minificado) en cada herramienta. API pública:

- `Aprens.config({toolId, toolName, toolVersion, pacienteCodigo})` — identidad de la herramienta y del paciente.
- `Aprens.save(record, opts)` — **upsert**: por `id` (sesiones repetibles), por `date` (registro diario), o
  append (varias veces al día). Añade `ts` automático. Acumula histórico, ordena por fecha.
- `Aprens.collect(fn)` + `_flush()` — patrón **collect-on-export**: la herramienta solo persiste cuando el
  paciente decide enviar. Respeta "no se guarda nada hasta el momento del envío".
- `Aprens.seed(records)` — retrofit de herramientas legacy (importa arrays de claves antiguas).
- `Aprens.buildEnvelope()` / `exportJSON()` / `copyJSON()` — genera el sobre `aprens-export`.
- `Aprens.shareWhatsApp()` / `resumenTexto()` — comparte un **resumen humano** (no el JSON crudo).
- `Aprens.mountBar()` — barra de export consistente (código paciente + WhatsApp/archivo/copiar).

**Almacenamiento:** clave única `aprens_db` **por origen**, `SCHEMA = 1`:
```json
{ "schema":1, "paciente":{"codigo":"MARTI-01"},
  "tools": { "<toolId>": { "meta":{"nombre","v"}, "records":[ … ] } },
  "actualizado":"<ISO>" }
```

## 1.4 Formato de export — YA unificado ✅ (activo estratégico)

Sobre canónico `aprens-export` v1 (export real observado):
```json
{ "aprens":1, "type":"aprens-export",
  "paciente":{"codigo":"MARTI-01"},
  "exportado":"2026-05-30T12:33:44.074Z",
  "tools":{ "cuestionario_tec":{
    "meta":{"nombre":"Cuestionario TEC","v":1},
    "records":[ {"date":"2026-05-30","ts":1780144400862,"total":9.2,"foco":"Densidad","L":10,"D":7.5,"C":10} ]
  }}}
```
`L / D / C = Latencia / Densidad / Continuidad`, normalizadas 0–10 (mayor = mejor funcionamiento).
El panel ya lo lee y **convierte formatos legacy** → el modelo de intercambio ya existe y funciona.

## 1.5 Lógica clínica (ejemplo TEC, a mantener intacta)

`cuestionario_tec` está dirigido por un bloque `CFG` (reutilizable):
- **Subescalas** L (Latencia — espacio antes de reaccionar), D (Densidad — presencia interna/AIS),
  C (Continuidad — sostener el patrón y actuar según valores).
- **Ítems** Likert 0–4, algunos `invert:true`.
- **Scoring**: media por subescala normalizada a 0–10; `foco` = subescala más baja (más margen).
- **Bandas** de lectura (alta ≥6.5 / media ≥3.5 / baja) con texto clínico.
- Escapado anti-XSS (`esc`), `robots noindex`.

Este patrón `CFG` + core es el que reutilizaremos como "pantallas" en la app.

## 1.6 Dependencias externas

| Dependencia | Dónde | Impacto |
|---|---|---|
| **Google Fonts** (`fonts.googleapis.com`) | tec, panel, inicio (ver Anexo A para el resto) | 🔴 Rompe offline **y** fuga RGPD: Google recibe IP + herramienta clínica + momento |
| **wa.me** (WhatsApp) | core + herramientas | 🟡 Opcional, iniciado por el paciente; comparte resumen (no JSON crudo) |
| Gráficas (panel) | panel | 🟢 **Canvas propio, sin librería externa** — bueno para offline |
| Netlify (navegación) | inicio → herramientas | 🔴 Sin red no hay navegación entre herramientas |

## 1.7 Seguridad, privacidad y escalabilidad

**🟢 Ya bien resuelto (mantener intacto):**
- Pseudonimización por **código de paciente** (sin nombre real en el dispositivo).
- **collect-on-export** (minimización real).
- Escapado anti-XSS en el render.
- Consentimientos RGPD ya existentes (Google Forms + PDFs adultos/menores).

**🔴 Riesgos reales:**
1. **Fragmentación por origen**: cada Netlify = su propio `aprens_db`. No hay registro único del paciente;
   debe exportar herramienta por herramienta.
2. **No offline / no instalable**: sin manifest ni service worker; depende de red (fonts + navegación).
3. **Volatilidad de datos**: `localStorage` se borra al limpiar caché, en modo privado, por desalojo de iOS
   (~7 días sin uso) o al cambiar de dispositivo → se pierde el histórico. Sin backup.
4. **Transferencia manual y frágil**: archivo/WhatsApp/copiar, por cada herramienta. Sin sincronización.
5. **Panel sin cifrado ni login**: registros clínicos importados en claro en el navegador del psicólogo.
6. **Pauta por URL** (`?foco=L/D/C`): no se persiste, no permite medir adherencia.

## 1.8 Reutilizar / Refactorizar / No tocar

| Mantener intacto (núcleo clínico) | Reutilizar (activo técnico) | Refactorizar |
|---|---|---|
| Scoring TEC (L/D/C, `invert`, bandas, foco) | `aprens-core.js` como base del modelo de datos | Persistencia → única por paciente (no por origen) |
| Metáfora del mono, estados, textos | Sobre `aprens-export` como formato canónico | Quitar Google Fonts → self-host (offline + RGPD) |
| Escalas/ítems/subescalas de cada `CFG` | Conversor legacy del panel | Empaquetar todo en **una** app instalable |
| Modelo interoceptivo (mapa corporal) | Gráficas canvas propias | Transferencia manual → sync opcional cifrada |
| collect-on-export, pseudonimización | Identidad visual (CSS vars, tipografías) | Panel → login + cifrado |

---

# FASE 2 — Arquitectura recomendada

**Recomendado:** PWA única (una SPA que embebe las herramientas como pantallas) → **Capacitor** para
iOS/Android → **Supabase (UE)** para sync opcional. Migración progresiva desde los `CFG` existentes.

### Comparativa (según tus prioridades)

| Opción | Desarrollo rápido | Reutiliza tu código | Offline | Sync segura | iOS+Android | Veredicto |
|---|---|---|---|---|---|---|
| PWA instalable | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★☆☆☆ | Base del MVP1 |
| **PWA + Capacitor** | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ✅ **Elegida** |
| React Native | ★★★☆☆ | ★☆☆☆☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | Reescribir todo |
| Flutter | ★★★☆☆ | ☆☆☆☆☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | Descartada |
| WebView "a pelo" | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ | ★★★☆☆ | Frágil |

**Por qué:** tu inversión está en HTML/JS/CSS clínico ya escrito. Capacitor reutiliza el 100%. Supabase
(Postgres + RLS + hosting UE) encaja mejor con datos longitudinales y RGPD que Firebase (NoSQL/US).

---

# FASE 3 — Diseño funcional (2 roles)

### ROL PACIENTE (app instalable)
```
Home (hub, hoy = inicio_aprens)
 ├─ Mi pauta de la semana   ← hoy ?foco=L/D/C; pasa a estado persistente
 ├─ Herramientas pautadas   ← cada CFG se vuelve una "pantalla", no un sitio
 │   · Cuestionario/Screening TEC      · Estado del mono / ¿dónde está? / visitas
 │   · AIS curiosidad / diario / mapa  · Agenda atencional
 │   · Brújula de valores              · Bajar la alerta, acompañar sensación…
 ├─ Mi historial (simple)   ← lee el ÚNICO aprens_db, ya no fragmentado
 ├─ Recordatorios diarios   ← push (MVP3) / notificación local
 └─ Enviar al psicólogo     ← barra de export del core: archivo / WhatsApp / (sync)
```

### ROL PSICÓLOGO (panel web/móvil)
```
 ├─ Alta de paciente con CÓDIGO anónimo (ya lo haces: "MARTI-01")
 ├─ Asignar herramientas + foco (pauta)   ← genera lo que ve el paciente
 ├─ Registros por paciente   ← import JSON (ya funciona) + sync (MVP2)
 ├─ Evolución longitudinal   ← gráficas canvas ampliadas
 │   L / D / C · total · sobrepensamiento · conducta valiosa · práctica AIS
 ├─ Notas clínicas privadas  (nunca salen del panel)
 ├─ Pauta individualizada    (exportable)
 └─ Export PDF / JSON + protección de datos
```

---

# FASE 4 — Privacidad y datos clínicos (RGPD)

```
IDENTIDAD (solo psicólogo, aislada)        CLÍNICO (pseudonimizado)
 patient_code  "MARTI-01"  ◄──────────────  patient_code   (nunca el nombre)
 nombre_real   (offline / tabla aparte)     tool           "cuestionario_tec"...
 consentimiento {v, fecha, tipo}            records[]      { date, ts, total, L, D, C, ... }
                                            schema         (aprens-export v1)
```

- **Código pseudonimizado**: mantener. Vínculo código↔persona solo en el lado del psicólogo (tabla aislada/offline).
- **Minimización + collect-on-export**: mantener tal cual.
- **Google Fonts → self-host**: elimina la fuga a Google y habilita offline. *Quick win prioritario.*
- **WhatsApp**: solo si el paciente lo elige, con aviso de que sale del entorno protegido. Nunca por defecto.
- **Cifrado local**: Capacitor SecureStorage (Keychain/Keystore) + cifrar `aprens_db`. En PWA pura, limitado → riesgo residual documentado.
- **Sync opcional y cifrada**: por defecto todo local; el paciente decide activarla. Supabase UE + RLS.
- **RGPD**: consentimiento versionado (ya existe), borrado por `patient_code`, portabilidad (export JSON),
  hosting UE, DPA con el proveedor.

---

# FASE 5 — Plan por MVPs

**MVP 1 — PWA única, instalable y offline** *(máximo valor, menor riesgo)*
- Consolidar las ~17 webs en **una** SPA que carga cada `CFG` como pantalla.
- **Un solo `aprens_db`** por paciente → fin de la fragmentación; historial real.
- Añadir `manifest.json` + service worker (offline) y **self-host de fuentes**.
- Unificar navegación (hub `inicio`) e identidad visual (ya coherente).
- Mantener el sobre `aprens-export` intacto (el panel ya lo lee).

**MVP 2 — Backend seguro + panel**
- Supabase (UE): auth paciente/psicólogo, RLS, sync offline-first (cola local → push con red).
- Panel: login + cifrado; alta con código, asignación de pauta, longitudinal, notas privadas, export PDF/JSON.

**MVP 3 — App nativa iOS/Android (Capacitor)**
- Empaquetado + stores, **push** (recordatorios terapéuticos), share sheet nativo, biometría, secure storage cifrado.
- Gráficas avanzadas y export clínico PDF.

---

# FASE 6 — Ejecución técnica

### Estructura de carpetas
```
aprens-app/
├─ apps/
│  ├─ patient/        # PWA paciente (Capacitor-ready)
│  └─ clinician/      # panel psicólogo
├─ packages/
│  ├─ core/           # aprens-core portado (aprens_db, export v1)
│  ├─ tools/          # un CFG por herramienta (contenido clínico intacto)
│  │   ├─ cuestionario-tec.cfg.ts
│  │   ├─ estado-mono.cfg.ts …
│  ├─ scoring/        # L/D/C, invert, bandas, foco (tests de regresión)
│  ├─ charts/         # gráficas canvas
│  └─ ui/             # identidad APRENS + fuentes self-hosted
├─ supabase/          # migraciones + RLS (MVP2)
└─ capacitor.config.ts (MVP3)
```

### Stack concreto
- Front: **React + TypeScript + Vite** (o JS vanilla si se prefiere cero fricción — el código actual ya es vanilla limpio).
- Persistencia: `aprens_db` promovido a **una sola instancia** (IndexedDB/Dexie por espacio y robustez frente a localStorage).
- PWA: `vite-plugin-pwa` (manifest + SW).
- Gráficas: canvas actuales.
- Nativo: **Capacitor** (Push, Filesystem, Share, SecureStorage, Biometric).
- Backend: **Supabase** (Postgres + Auth + RLS + Storage, UE).
- Modelo de datos: sobre `aprens-export` v1 como fuente de verdad (cliente ↔ backend).

### Roadmap de migración
1. **Barrido** de las herramientas → extraer cada `CFG` a `packages/tools` (ver Anexo A).
2. Portar `aprens-core` a `packages/core` con **tests que congelen el scoring** (mismo input → mismo L/D/C).
3. Montar la shell PWA (navegación de `inicio` + un solo `aprens_db`).
4. Self-host fuentes + manifest + SW (offline) → **MVP1**.
5. Supabase + sync + panel seguro → MVP2.
6. Capacitor + push → MVP3.

### Riesgos técnicos
- Perder semántica del scoring al portar → tests de regresión **antes** de tocar.
- Migrar `aprens_db` fragmentado (múltiples orígenes) al unificado → importador desde cada origen/JSON.
- Cifrado local débil en PWA pura → datos sensibles reales solo tras Capacitor.
- Fuentes/CDN → self-host obligatorio para offline + RGPD.

### Primeros pasos concretos
1. Cerrar el barrido (Anexo A) y extraer los `CFG`.
2. Scaffold del monorepo + shell PWA con `cuestionario_tec` como primera pantalla migrada.
3. Self-host de fuentes como primer quick-win RGPD.

---

# Anexo A — Inventario de herramientas

## A.1 Verificado a fondo (código leído y analizado)

| Archivo | Rol | Core embebido | Almacenamiento | Deps externas | Formato export | Notas |
|---|---|---|---|---|---|---|
| `aprens-core.js` | Núcleo | — (es el core) | `aprens_db` (por origen) | — | genera `aprens-export` v1 | SCHEMA 1; upsert por id/date; collect-on-export |
| `cuestionario_tec_aprens.html` | Screening TEC | ✅ (minificado inline) | `aprens_db` | **Google Fonts** | `aprens-export` | `CFG` con L/D/C, `invert`, bandas, foco; anti-XSS |
| `panel_psicologo_aprens.html` | Panel psicólogo | — (importador) | `PANEL_KEY` | **Google Fonts** | lee `aprens-export` + conversor legacy | Sin login/cifrado; gráficas canvas propias |
| `inicio_aprens.html` | Hub | — (no persiste) | ninguno | **Google Fonts** | — | Enlaza ~17 Netlify en `target=_blank`; pauta `?foco=L/D/C` |
| `aprens_MARTI-01_..._.json` | Export real | — | — | — | `aprens-export` v1 | Confirma el sobre y `L/D/C` |

## A.2 Topología de despliegue (extraída del panel y el hub)

~17 sitios Netlify independientes (orígenes separados → un `aprens_db` por sitio), entre ellos:
`aprens-inicio`, `aprens-cuesitionario-tec`, `aprens-screeningtec`, `aprens-estadomono`, `aprens-dondemono`,
`aprens-retomona`, `aprens-agendaatencional`, `aprens-aiscuriosidad`, `aprens-aisdiario`, `aprens-aisdiaadia`,
`aprens-mapainterno`, `aprens-protocoloais`, `aprens-brujulavalores`, `aprens-acompanar-sensacion`,
`aprens-bajaralerta`, `aprens-controlira`, `aprens-cajadeherramientassemanal`, `aprenseines`, `retorn-feina`.

## A.3 Barrido mecánico de las 26 herramientas restantes — PENDIENTE (bloqueo de infraestructura)

El inventario completo por archivo (core sí/no, `toolId`, deps CDN, claves legacy, formato) **no pudo
completarse en esta sesión**: el conector de Google Drive requiere **aprobación por llamada / OAuth**, que
no puede concederse en una sesión no interactiva (además el conector se desconecta de forma intermitente).
Los archivos del Drive no son públicos, así que no hay descarga directa alternativa.

**Para desbloquear:** autorizar el conector de Google Drive en una sesión interactiva (ajustes de conectores
de claude.ai, o `/mcp` / `claude mcp`) y aprobar `download_file_content`. El pipeline ya está definido y es
mecánico: `descargar → base64 -d → grep de 'aprens_db'/'Aprens.config' (core), 'toolId', dominios CDN
(fonts.googleapis, cdnjs, jsdelivr, unpkg), claves localStorage y 'aprens-export'`.

**Hipótesis a confirmar** (alta confianza, basada en la muestra + el core): la mayoría de las herramientas
posteriores a 2026-05-30 embeben el core y exportan `aprens-export` con Google Fonts como única dependencia
externa; el conversor legacy del panel indica que existen **formatos antiguos** en herramientas previas
(candidatas: las de fecha anterior al core y los `tracker`), que habrá que mapear en la migración.

> Este anexo se completará en cuanto el conector de Drive esté autorizado; no afecta a las conclusiones de
> las FASES 1–6, que se sostienen sobre la muestra verificada y la topología de despliegue.

---

_Documento generado como parte de la auditoría previa a la migración. No modifica ninguna herramienta existente._
