# FASE 1 · Auditoría de la presencia digital de APRENS

**Fecha de auditoría:** 25 de agosto de 2026
**Alcance:** `https://www.aprens.es` (web pública) + repositorio `Tofol24/Mindplace` (ecosistema de apps clínicas)
**Estado:** auditoría. **No se ha modificado ninguna página en producción.**

---

## 0. Hallazgo previo que condiciona el proyecto

La web pública **`aprens.es` no está en ningún repositorio accesible**.

| Evidencia | Dato |
|---|---|
| Cabecera HTTP de `www.aprens.es` | `x-powered-by: PHP/5.6.40`, `server: Apache` |
| Rutas | `home.php`, `quienes-somos.php`, `categoria_servicio.php?id=N`, `articulo.php?id=N`, `contactar.php` |
| Repositorios disponibles en la cuenta | `Tofol24/Mindplace`, `Tofol24/autorregistro-AIS`, `Tofol24/Pladentrenamentdimarts`, `Tofol24/Entreno` |
| Contenido de `Tofol24/Mindplace` | 4 sitios Netlify estáticos: `app/`, `inicio/`, `agendas/`, `despatxos/` |
| `<meta name="robots">` en los 45 HTML del repo | **45 de 45 = `noindex, nofollow`** |

Es decir: el repositorio es la **capa clínica privada** (herramientas de paciente, panel del psicólogo,
reservas, gestión de despachos), deliberadamente fuera del índice de Google — lo cual es
**correcto y debe seguir así** por confidencialidad y RGPD. La capa pública indexable es otra cosa,
vive en un hosting Apache/PHP y no está bajo control de versiones aquí.

**Consecuencia:** las fases 3–10 necesitan decidir primero *dónde* se materializan. Ver §7.

---

## 1. Auditoría técnica de `aprens.es`

### 1.1 Duplicación de dominio — 🔴 crítico

Las cuatro variantes de host/protocolo devuelven **HTTP 200 sin redirección**:

```
http://aprens.es/         → 200 (final: http://aprens.es/)
https://aprens.es/        → 200 (final: https://aprens.es/)
http://www.aprens.es/     → 200 (final: http://www.aprens.es/)
https://www.aprens.es/    → 200 (final: https://www.aprens.es/)
```

Sin redirección 301 y **sin una sola etiqueta `rel="canonical"` en todo el sitio**, cada página
existe como 4 URLs distintas para un buscador. Toda la autoridad de enlaces se reparte entre
copias y el rastreador consume presupuesto en duplicados.

### 1.2 Datos estructurados — 🔴 inexistentes

| Comprobación | home | quiénes-somos | artículos | contactar | categoría 1 | categoría 7 |
|---|---|---|---|---|---|---|
| `rel="canonical"` | 0 | 0 | 0 | 0 | 0 | 0 |
| JSON-LD (`ld+json`) | 0 | 0 | 0 | 0 | 0 | 0 |
| Microdatos (`itemtype`) | 0 | 0 | 0 | 0 | 0 | 0 |
| Open Graph (`og:`) | 0 | 0 | 0 | 0 | 0 | 0 |

**Ninguna máquina puede hoy leer de forma estructurada** quién es el profesional, qué titulación
tiene, dónde está la consulta ni qué se trata. Todo debe inferirse de texto plano.

### 1.3 Jerarquía de encabezados — 🔴 rota

`home.php` contiene **6 elementos `<h1>`** (el primero repetido dos veces), y el resto de páginas
entre 7 y 10:

```
H1 ×6 · "Gabinete de psicologia, psiquiatría, terapia clínica, psicoeducativa,
          psicologia del deporte, Neuropsicología"   ← duplicado
        · "Terapias psicológicas adultos, niños, pareja"
        · "Reeducación y gestión psicoeducativa para niños"
        · "Terapia psicológica deportiva"
        · "Gestión psicológica a empresas"
```

Sin un H1 único por página no hay señal de "de qué trata esta página".

### 1.4 Títulos y metadescripciones — 🟠 grave

El `<title>` de portada tiene **~135 caracteres** (se trunca hacia los 60) y repite la marca
al principio y al final:

> `APRENS - Gabinete de psicologia, psiquiatría, terapia clínica, psicoeducativa, psicologia del deporte, Neuropsicología - APRENS`

La **misma metadescripción genérica se repite** en portada, artículos, y las 7 páginas de categoría.
En `quienes-somos.php` la metadescripción es un volcado accidental del cuerpo con entidades HTML
sin decodificar:

> `. 	Sr. Crist&ograve;fol Villalonga Melis . 	N&ordm; colegiado B-1599 . 	&nbsp;&nbsp;&nbsp; Psic&oacute;logo general sanitario...`

Ninguna palabra clave del objetivo — *ansiedad, trauma, TEPT, dolor crónico, depresión, Inca,
Mallorca* — aparece en un solo `<title>` del sitio.

### 1.5 Sitemap y robots — 🟠

`robots.txt` (27 bytes):
```
User-agent: *
Allow: /
```
No bloquea a ningún rastreador — **los crawlers de sistemas de IA tienen acceso**, que es lo que
interesa. Pero **no declara el sitemap**.

`sitemap.xml` existe (40 URLs) y presenta dos problemas:
- **Todas las URLs se declaran en `http://`** mientras el sitio sirve `https://` → el sitemap
  apunta sistemáticamente a la variante no canónica.
- Sin `<lastmod>` en ninguna entrada; `changefreq: weekly` uniforme y no creíble.

### 1.6 Rendimiento y stack — 🟠

| Elemento | Estado |
|---|---|
| PHP | **5.6.40** — sin soporte de seguridad desde diciembre de 2018 |
| Caché | `Cache-Control: no-store, no-cache, must-revalidate` + `Expires: 1981` en **todo**, incluido HTML estático |
| Fuentes | Google Fonts cargadas por **`http://`** (contenido mixto) |
| Librerías | Bootstrap 3, jQuery, jQuery UI, `html5shiv`/`respond.js` para IE8 desde `oss.maxcdn.com` (CDN discontinuido) |
| Analítica | **`UA-88489614`** — Universal Analytics, dejó de recoger datos en julio de 2023. No hay GA4 |
| Imágenes | **17 de 37 `<img>` sin atributo `alt`** en portada |

### 1.7 Accesibilidad / semántica

Sin `alt` en casi la mitad de las imágenes, sin `og:`, sin datos estructurados y con jerarquía de
encabezados rota, el sitio es difícil de interpretar tanto para lectores de pantalla como para un
extractor automático.

---

## 2. Auditoría de arquitectura y contenido

### 2.1 Arquitectura actual

```
home.php
├── quienes-somos.php            (equipo: 6 profesionales en una sola página)
├── articulos.php                (listado; solo enlaza 6 de los 12 artículos)
│   └── articulo.php?id=1..12
├── categoria_servicio.php?id=1  Terapias psicológicas adultos, niños, pareja
│   ?id=2  Reeducación psicoeducativa
│   ?id=3  Logopedia
│   ?id=4  Psicología del Deporte
│   ?id=5  Asesoramiento empresas
│   ?id=6  TIC Aprens
│   ?id=7  Neuropsicología
│   └── servicio.php?t=<slug>    (14 subpáginas)
├── contactar.php
├── app_ais_aprens.php · app_ais_mindplace.php
└── aviso_legal.php · politica_cookies.php
```

La arquitectura está organizada **por servicio comercial del gabinete**, no por **problema del
paciente**. Un usuario que busca "no puedo dejar de pensar" no tiene ninguna puerta de entrada.

### 2.2 Profundidad de contenido — 🔴

| Página | Palabras reales de contenido (excluyendo menú, pie y cookies) |
|---|---|
| `categoria_servicio.php?id=7` (Neuropsicología) | **≈ 60** |
| `categoria_servicio.php?id=1` (Terapias psicológicas) | **≈ 150** |
| `articulo.php?id=3..12` (media) | páginas de ~29 KB de los que casi todo es plantilla |

Ninguna página del sitio desarrolla un problema clínico con la profundidad necesaria para que un
buscador —o un sistema de IA— pueda extraer una respuesta autónoma.

### 2.3 Artículos huérfanos — 🟠

Los 12 artículos responden 200, pero `articulos.php` **solo enlaza 6**. Quedan sin ruta de acceso
interna: `id=3` (*¿Cómo funciona nuestro cuerpo?*), `id=4`, `id=6`, `id=7` (*Guía para padres de
hijos adolescentes*), `id=10` (*Guía de manejo emocional para padres*), `id=11` (la entrevista
sobre coaching y proceso terapéutico).

### 2.4 Ausencia total de las áreas clínicas objetivo

Búsqueda en todo el contenido rastreado:

| Área objetivo | Presencia en la web actual |
|---|---|
| Ansiedad | mencionada **una vez**, como pregunta suelta en `categoria_servicio.php?id=1` ("¿Problemas de ansiedad?") |
| Sobrepensamiento / rumiación | solo en la descripción comercial del libro *Lidera tu mone(a)* |
| Trauma / TEPT | **ninguna mención** |
| Accidentes de tráfico o laborales | **ninguna mención** |
| Dolor crónico | **ninguna mención** |
| Depresión / bloqueo conductual | **ninguna mención** |
| TCC | **ninguna mención** |
| ACT (Terapia de Aceptación y Compromiso) | **ninguna mención** |
| Entrenamiento atencional / interoceptivo | **ninguna mención** en la web pública |

**El perfil clínico que se quiere posicionar no existe hoy en la web.** No es un problema de
optimización: es un problema de contenido inexistente.

### 2.5 Desconexión entre la web pública y el ecosistema clínico

El repositorio contiene un cuerpo de trabajo clínico considerable —herramientas de entrenamiento
atencional e interoceptivo, protocolo AIS, screening TEC, agenda atencional, materiales sobre
alerta corporal, evitación y valores— todo ello `noindex` y sin ninguna traducción pública.
La web enlaza a las apps solo como `app_ais_aprens.php` y `app_ais_mindplace.php`, sin explicar
el marco clínico que hay detrás.

---

## 3. Entidad profesional: qué está verificado hoy

Extraído literalmente de `quienes-somos.php` y `home.php`. **Nada de lo siguiente es invención.**

### 3.1 Verificable en la web actual ✅

- Cristòfol Villalonga Melis
- Nº colegiado **B-1599**
- Psicólogo general sanitario
- Neuropsicólogo clínico
- Especializado en intervención con adultos, adolescentes y familia
- Máster Internacional en psicología clínica por AEPC
- Especializado en psicología del deporte
- Especializado en psicología educativa
- Propietario y fundador del Gabinet Psicològic APRENS
- **Psicólogo de la Mutua Balear**
- Creador de la versión deportiva original del software de APRENS
- Vocal de psicología de l'esport del **COPIB** (Col·legi Oficial de Psicologia de les Illes Balears)
- Profesor asociado de psicología de l'esport i de l'activitat física en la **UIB**
- Administrador y gerente de la empresa VISMEL
- Consulta: **C/ Virgen de la Esperanza, 70, 2º · 07300 Inca, Mallorca, Illes Balears**
- Teléfono 636 93 76 61 · info@aprens.es · horario 9h–21h
- Libros: *Lidera tu mone(a)* / *Lidera la teva mon(e)a*, *Cría desde dentro*,
  *Trasciende desde dentro*, *Guía de manejo emocional para padres*
- **Premio Joan Calafat 2025**
- Entrevista: «El 'coaching' pot motivar, però no substitueix un procés terapèutic»

### 3.2 Pendiente de confirmación ⚠️

Necesario antes de publicarlo en la página profesional o en el JSON-LD:

1. **Atención online** — la web no la menciona en ningún sitio. ¿Se ofrece actualmente?
2. **Formación específica en TCC y en ACT** — no consta en la web. ¿Qué formación reglada existe y es documentable?
3. **Formación o experiencia específica en trauma/TEPT y en dolor crónico** — no consta.
4. **URL pública del registro de colegiado** en el COPIB (para `sameAs`).
5. **Fichas verificables de los libros** — ISBN, editorial, URL del editor.
6. **Fuente pública del Premio Joan Calafat 2025** (nota de prensa, web del organismo).
7. **URL de la entrevista original** publicada.
8. **Perfiles institucionales**: ficha UIB como profesor asociado, ficha COPIB como vocal.
9. **Rol en Mutua Balear** — alcance y si es citable públicamente.
10. **Nº de registro sanitario del centro** (obligatorio para publicidad sanitaria en Illes Balears).
11. **Estado de TEC/AIS** — ¿existe alguna publicación, comunicación en congreso o registro? Determina el nivel de afirmación admisible.

---

## 4. Diagnóstico: por qué hoy una IA no puede recomendar el perfil

Preguntas del objetivo y qué podría responder hoy un sistema de IA leyendo `aprens.es`:

| Pregunta | Respuesta obtenible hoy |
|---|---|
| ¿Quién es Cristòfol Villalonga? | Parcial — hay que leer una página de equipo con 6 profesionales mezclados |
| ¿Es Psicólogo General Sanitario? | Sí, pero solo como texto plano en un listado sin marcado |
| ¿Dónde trabaja? | Sí — dirección en el pie |
| ¿Trabaja la ansiedad? | **No determinable** |
| ¿Trabaja trauma tras un accidente? | **No** — sin contenido |
| ¿Trabaja dolor crónico? | **No** — sin contenido |
| ¿Trabaja depresión? | **No** — sin contenido |
| ¿Qué enfoque terapéutico utiliza? | **No** — TCC y ACT no aparecen |
| ¿Atiende online? | **No determinable** |

Cinco de nueve preguntas no tienen respuesta en el sitio. La causa raíz no es técnica: es que
**el contenido clínico correspondiente no existe**.

---

## 5. Qué conservar, modificar, ampliar y crear

### CONSERVAR sin tocar
- Los 45 HTML del repositorio con `noindex, nofollow` — la capa clínica **no debe indexarse**.
- Las CSP "sin terceros" de `app/`, `inicio/` y `despatxos/` — protegen la IP del paciente.
- Identidad visual: azul `#1B4F8C`, verde `#2E7D5E`, oro `#C8973A`, Playfair Display + DM Sans.
- Los datos de contacto y ubicación actuales (correctos y coherentes).
- La página de equipo: el resto de profesionales del centro son parte de la entidad APRENS.

### MODIFICAR
- Redirección 301 a un único host canónico + `rel="canonical"` en todas las páginas.
- Un solo `<h1>` por página, con jerarquía H2/H3 coherente.
- `<title>` y metadescripción **únicos** por página.
- `sitemap.xml` en `https://`, con `<lastmod>`, declarado en `robots.txt`.
- `alt` en las 17 imágenes que no lo tienen.
- Sustituir Universal Analytics por GA4 (o retirarlo).
- Cabeceras de caché razonables para estáticos.

### AMPLIAR
- Enlazar los 6 artículos huérfanos y apuntarlos hacia las futuras páginas clínicas.
- Desarrollar `categoria_servicio.php?id=7` (Neuropsicología) más allá de 60 palabras.
- Dar traducción pública y divulgativa al trabajo atencional/interoceptivo del ecosistema clínico.

### CREAR (fases 3–7)
- `/cristofol-villalonga-psicologo-mallorca/` — entidad profesional.
- `/psicologo-ansiedad-mallorca/`
- `/psicologo-trauma-tept-mallorca/`
- `/psicologia-dolor-cronico-mallorca/`
- `/psicologo-depresion-mallorca/`
- `/enfoque/` — TCC, ACT, neuropsicología, entrenamiento atencional e interoceptivo.
- `/trayectoria-y-publicaciones/` — solo material verificable y enlazado a su fuente.
- Rediseño conceptual de la entrada a cita, organizada por motivo de consulta.

---

## 6. Prioridades

| Prioridad | Acción | Impacto |
|---|---|---|
| 🔴 1 | Canonicalización de host + `rel="canonical"` | Sin esto, todo lo demás se diluye entre 4 copias |
| 🔴 2 | Crear el contenido clínico inexistente (fases 3–7) | Es la causa raíz del objetivo no cumplido |
| 🔴 3 | JSON-LD `Person` + `MedicalBusiness` conectando profesional ↔ centro ↔ Inca ↔ áreas | Legibilidad por máquina |
| 🟠 4 | Un H1 por página + títulos y metadescripciones únicos | Señal básica de tema |
| 🟠 5 | Sitemap en https con lastmod, declarado en robots.txt | Rastreo |
| 🟠 6 | Enlazado interno artículos → páginas clínicas | Distribución de autoridad |
| 🟡 7 | GA4, caché, `alt`, fuentes por https | Medición y rendimiento |
| 🟡 8 | Actualizar PHP 5.6 | Seguridad (fuera del alcance SEO, pero relevante) |

---

## 7. Bloqueo para las fases 3–10

El trabajo de las fases siguientes es **crear páginas HTML nuevas**. Para que existan hace falta
decidir el vehículo de entrega, porque el código PHP de `aprens.es` no está aquí. Las opciones se
detallan en la conversación asociada a esta auditoría.

---

*Auditoría realizada sobre el estado de `aprens.es` a 25 de agosto de 2026 y sobre el commit
`8d0f2f6` del repositorio `Tofol24/Mindplace`. Ningún dato profesional de este documento ha sido
inferido: todo procede de la propia web o está marcado como pendiente de confirmación.*
