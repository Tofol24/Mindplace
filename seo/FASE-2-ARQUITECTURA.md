# FASE 2 · Nueva arquitectura propuesta

**Fecha:** 25 de agosto de 2026
**Vehículo de entrega acordado:** fragmentos HTML/PHP/`.htaccess` listos para pegar en el sitio PHP existente.
**Estado:** propuesta. Pendiente de aprobación antes de redactar página alguna.

---

## 1. Reglas de redacción derivadas de la verificación

De los cuatro puntos planteados en la FASE 1, solo se ha confirmado uno. Esto **no es un obstáculo**:
es lo que permite que la web resista el escrutinio de un colegio profesional, de un paciente y de
un sistema de IA que compare afirmaciones entre fuentes.

| Punto | Estado | Regla que aplico en fases 3–7 |
|---|---|---|
| Atención online | ✅ **Confirmado** | Se declara en la página profesional, en las landings y en el JSON-LD (`availableService` / modalidad) |
| Formación reglada en TCC y ACT | ⚠️ No confirmado | TCC y ACT se presentan como **marcos de trabajo empleados**, descritos por lo que hacen. **Sin** "certificado en", "formado por", "especialista en TCC/ACT", ni entidad formadora |
| Formación en trauma/TEPT y dolor crónico | ⚠️ No confirmado | Las landings describen **el abordaje psicológico general** de esos problemas. **Sin** "especialista en trauma", "experto en dolor crónico" ni años de experiencia en el área |
| Publicación sobre TEC/AIS | ⚠️ No confirmado | TEC/AIS aparece **únicamente** como "marco clínico en desarrollo" y "modelo desarrollado por Cristòfol Villalonga". **Nunca** como tratamiento validado, superior o de eficacia demostrada |

**Lista negra léxica** para todas las páginas nuevas:

> cura · curación · garantizado · resultados garantizados · elimina definitivamente · para siempre ·
> el mejor psicólogo · líder en · método científicamente demostrado · terapia científicamente validada ·
> tratamiento demostrado · superior a · único método · solución definitiva · en X sesiones

Lo que **sí** se puede afirmar, porque es verificable en la propia web: Psicólogo General Sanitario,
neuropsicólogo clínico, colegiado B-1599, fundador de APRENS, consulta en Inca, psicólogo de la
Mutua Balear, vocal de psicología del deporte del COPIB, profesor asociado en la UIB, los cuatro
libros y el Premio Joan Calafat 2025.

---

## 2. Estrategia de URLs sobre un sitio PHP

El sitio actual usa URLs con parámetros (`categoria_servicio.php?id=7`). Las páginas nuevas
necesitan URLs legibles y estables. Sobre Apache eso se resuelve con `mod_rewrite`, sin tocar
el código existente.

**Regla: no se elimina ni se redirige ninguna URL actual.** Todas están indexadas y algunas
reciben enlaces. Se conservan, se les añade `canonical`, y las páginas nuevas se suman.

| URL pública | Fichero real | Estado |
|---|---|---|
| `/cristofol-villalonga-psicologo-mallorca/` | `profesional.php` | 🆕 FASE 3 |
| `/trayectoria-y-publicaciones/` | `trayectoria.php` | 🆕 FASE 3 |
| `/psicologo-ansiedad-mallorca/` | `c-ansiedad.php` | 🆕 FASE 4 |
| `/psicologo-trauma-tept-mallorca/` | `c-trauma.php` | 🆕 FASE 5 |
| `/psicologia-dolor-cronico-mallorca/` | `c-dolor.php` | 🆕 FASE 6 |
| `/psicologo-depresion-mallorca/` | `c-depresion.php` | 🆕 FASE 7 |
| `/enfoque/` | `enfoque.php` | 🆕 FASE 4 (se necesita ya para enlazar) |
| `/en-que-podemos-ayudarte/` | `ayuda.php` | 🆕 FASE 7 (entrada a cita) |
| `/quienes-somos/` | `quienes-somos.php` | ♻️ alias limpio + canonical |
| `/articulos/` | `articulos.php` | ♻️ alias limpio + canonical |
| `/contactar/` | `contactar.php` | ♻️ alias limpio + canonical |
| `categoria_servicio.php?id=N` | — | ✅ intacta, + canonical |
| `servicio.php?t=slug` | — | ✅ intacta, + canonical |
| `articulo.php?id=N` | — | ✅ intacta, + canonical |

**Canonicalización de dominio.** Hoy las cuatro variantes responden 200. Se elige
`https://www.aprens.es` como único host canónico y las otras tres redirigen con 301
(fragmento `.htaccess` en la FASE 8). Sin esto, cada página nueva nacerá ya cuadruplicada.

---

## 3. Arquitectura propuesta

```
                              HOME  (home.php)
                                │
   ┌──────────────┬─────────────┼──────────────┬────────────────┐
   │              │             │              │                │
PROFESIONAL   PROBLEMAS      ENFOQUE       ARTÍCULOS      PEDIR HORA
   │           CLÍNICOS         │              │                │
   │              │             │              │                │
/cristofol-   ┌────┴────┐   /enfoque/    /articulos/   /en-que-podemos-
 villalonga-  │         │   · TCC             │          ayudarte/
 psicologo-   │  4 landings   · ACT           │              │
 mallorca/    │         │   · Neuropsic.      │         contactar.php
   │          │         │   · Entren.         │          (formulario)
   │          │         │     atencional      │
/trayectoria- │         │   · TEC/AIS         │
 y-publica-   │         │     (desarrollo)    │
 ciones/      │         │                     │
              │         └─────────────────────┘
              │              ▲ los artículos existentes
              │                apuntan a la landing que les corresponde
              │
    ┌─────────┼──────────┬──────────────┬───────────────┐
    │         │          │              │               │
 ANSIEDAD  TRAUMA     DOLOR         DEPRESIÓN      (servicios
 sobre-    TEPT       CRÓNICO       bloqueo         existentes
 pensa-                                             intactos)
 miento
```

### Por qué esta forma

La arquitectura actual está organizada por **servicio del gabinete** (logopedia, empresas,
deporte…). Una persona que busca ayuda no busca un servicio: busca **su problema**, y lo describe
con sus palabras. La capa de "problemas clínicos" es la puerta que hoy no existe.

Las cuatro landings son **hermanas**, no jerárquicas: se enlazan entre ellas cuando clínicamente
tiene sentido (ansiedad ↔ dolor crónico comparten hipervigilancia corporal; trauma ↔ ansiedad
comparten evitación; depresión ↔ dolor crónico comparten pérdida de actividad significativa).

---

## 4. Ficha por página

Cada página tendrá **un único `<h1>`**, `<title>` y metadescripción propios, y los `<h2>`
redactados como **preguntas en el lenguaje del paciente**, con la respuesta directa en el primer
párrafo de cada sección. Ese formato es lo que permite que un sistema de IA extraiga una respuesta
autónoma sin recomponerla desde páginas inconexas.

### 4.1 `/cristofol-villalonga-psicologo-mallorca/` — FASE 3

- **Title** (56): `Cristòfol Villalonga Melis · Psicólogo en Inca, Mallorca`
- **H1**: `Cristòfol Villalonga Melis | Psicólogo en Mallorca`
- **Meta** (152): `Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-1599. Consulta en Inca, Mallorca, y atención online. Fundador de Centre APRENS.`
- **Schema**: `Person` + `ProfessionalService`, enlazados por `worksFor` / `employee`
- **H2**:
  - ¿Quién es Cristòfol Villalonga Melis?
  - ¿Qué titulación tiene?
  - ¿Dónde pasa consulta?
  - ¿Con qué dificultades trabaja?
  - ¿Con qué población trabaja?
  - ¿Desde qué enfoque trabaja?
  - ¿Atiende online?
  - ¿Cómo pedir una primera visita?

### 4.2 `/trayectoria-y-publicaciones/` — FASE 3

- **Title** (49): `Trayectoria y publicaciones · Cristòfol Villalonga`
- **H1**: `Trayectoria y publicaciones`
- **Schema**: `Person` con `sameAs` (solo URLs reales) + `Book` por cada libro con ficha verificable
- Cada elemento con enlace a su fuente pública. **Lo que no tenga fuente, no entra.** Los ítems sin
  fuente aún localizada quedarán marcados en el fragmento como comentario HTML para que puedas
  completarlos, nunca publicados como afirmación desnuda.

### 4.3 `/psicologo-ansiedad-mallorca/` — FASE 4

- **Title** (54): `Psicólogo para la ansiedad en Inca y Mallorca · APRENS`
- **H1**: `Psicólogo para la ansiedad y el sobrepensamiento en Mallorca`
- **Meta** (154): `Preocupación, rumiación, ansiedad en el cuerpo y necesidad de control. Cómo se evalúa y cómo se trabaja en terapia. Consulta en Inca, Mallorca, y online.`
- **H2**:
  - ¿Por qué no puedo dejar de pensar?
  - ¿Por qué noto la ansiedad en el cuerpo?
  - ¿Por qué cuanto más intento controlar la ansiedad, peor me siento?
  - ¿Qué puede estar ocurriendo?
  - ¿Cómo se evalúa?
  - ¿Cómo se trabaja en terapia?
  - ¿Qué papel tienen la atención, la evitación y la conducta?
  - ¿Cuándo conviene pedir ayuda?
  - ¿Cómo trabajamos en APRENS?
  - ¿Cómo pedir una primera visita?

### 4.4 `/psicologo-trauma-tept-mallorca/` — FASE 5

- **Title** (52): `Psicólogo de trauma y TEPT en Inca, Mallorca · APRENS`
- **H1**: `Psicólogo para trauma y TEPT en Mallorca`
- **H2**:
  - ¿Por qué después del accidente sigo sintiéndome en peligro?
  - ¿Por qué tengo miedo de volver a conducir?
  - ¿Por qué desde entonces no me reconozco?
  - ¿Qué es la reexperimentación y por qué aparece?
  - ¿Qué puede estar ocurriendo?
  - ¿Cómo se evalúa? · ¿Cómo se trabaja en terapia?
  - ¿Cuándo conviene pedir ayuda? · ¿Cómo trabajamos en APRENS? · ¿Cómo pedir una primera visita?
- ⚠️ La condición de **psicólogo de la Mutua Balear** está verificada en la web y es directamente
  pertinente para accidentes laborales. **Antes de usarla en esta landing necesito que confirmes
  el alcance del rol** y si es citable en este contexto. Si no lo confirmas, la landing no la menciona.

### 4.5 `/psicologia-dolor-cronico-mallorca/` — FASE 6

- **Title** (54): `Psicología del dolor crónico en Inca, Mallorca · APRENS`
- **H1**: `Psicología para el dolor crónico en Mallorca`
- **H2**:
  - ¿Por qué me sigue doliendo si las pruebas no explican el dolor?
  - ¿Por qué estoy todo el día pendiente de mi cuerpo?
  - ¿Por qué he ido dejando de hacer cosas que me importaban?
  - ¿Qué relación hay entre dolor y amenaza?
  - ¿Qué puede estar ocurriendo? · ¿Cómo se evalúa? · ¿Cómo se trabaja en terapia?
  - ¿Cuándo conviene pedir ayuda? · ¿Cómo trabajamos en APRENS? · ¿Cómo pedir una primera visita?
- Nota clínica: esta página dirá de forma explícita que **el acompañamiento psicológico no
  sustituye el tratamiento médico del dolor** y que se trabaja de forma complementaria.

### 4.6 `/psicologo-depresion-mallorca/` — FASE 7

- **Title** (53): `Psicólogo para la depresión en Inca, Mallorca · APRENS`
- **H1**: `Psicólogo para la depresión y el bloqueo en Mallorca`
- **H2**:
  - ¿Por qué no tengo ganas de hacer nada?
  - ¿Por qué sé lo que debería hacer y no consigo arrancar?
  - ¿Por qué me he ido apartando de la gente?
  - ¿Por qué ya no disfruto de lo que antes me gustaba?
  - ¿Qué puede estar ocurriendo? · ¿Cómo se evalúa? · ¿Cómo se trabaja en terapia?
  - ¿Cuándo conviene pedir ayuda? · ¿Cómo trabajamos en APRENS? · ¿Cómo pedir una primera visita?
- Incluirá un aviso visible sobre **ideación suicida** con el teléfono **024** (atención a la
  conducta suicida, gratuito y 24 h) y el 112. En una página sobre depresión esto no es opcional.

### 4.7 `/enfoque/` — FASE 4

- **Title** (55): `Enfoque terapéutico: TCC, ACT y neuropsicología · APRENS`
- **H1**: `Cómo trabajamos en APRENS`
- **H2**: ¿Qué es la terapia cognitivo-conductual? · ¿Qué es la terapia de aceptación y compromiso? ·
  ¿Qué aporta la neuropsicología? · ¿Qué es el entrenamiento atencional e interoceptivo? ·
  ¿Qué es el marco TEC/AIS?
- El bloque TEC/AIS se redacta así: *"marco clínico en desarrollo propio, desarrollado por Cristòfol
  Villalonga e integrado dentro del trabajo atencional e interoceptivo. No se presenta como un
  tratamiento de eficacia diferencial establecida."* Sin excepciones.

### 4.8 `/en-que-podemos-ayudarte/` — FASE 7

- **H1**: `¿En qué podemos ayudarte?`
- Siete entradas → **cada una lleva primero a información clínica**, y solo desde ahí se pide cita:

| Entrada | Destino |
|---|---|
| Ansiedad y sobrepensamiento | `/psicologo-ansiedad-mallorca/` |
| Trauma / TEPT | `/psicologo-trauma-tept-mallorca/` |
| Estado de ánimo / depresión | `/psicologo-depresion-mallorca/` |
| Dolor crónico | `/psicologia-dolor-cronico-mallorca/` |
| Neuropsicología | `categoria_servicio.php?id=7` (a ampliar) |
| Adolescentes y familias | `categoria_servicio.php?id=1` |
| Psicología deportiva | `categoria_servicio.php?id=4` |

Es deliberado que el formulario quede **después** de la información: reduce la sensación de embudo
comercial y hace que quien pide cita llegue orientado.

---

## 5. Grafo de entidades y datos estructurados

```
                    Person
        Cristòfol Villalonga Melis
        · Psicólogo General Sanitario
        · Neuropsicólogo clínico
        · identifier: colegiado B-1599
                    │
        worksFor ───┼─── founder
                    ▼
             ProfessionalService
                Centre APRENS
        address: C/ Virgen de la Esperanza, 70, 2º
                 07300 Inca · Illes Balears
        areaServed: Inca · Mallorca · Illes Balears
                    │
              knowsAbout
                    │
    ┌───────┬───────┼────────┬──────────┐
 Ansiedad  Trauma  Dolor   Depresión  Neuropsic.
 sobre-    TEPT    crónico  bloqueo
 pensa-
 miento
                    │
              enfoque descrito en /enfoque/
        TCC · ACT · neuropsicología · entrenamiento
        atencional e interoceptivo · TEC/AIS (desarrollo propio)
```

**Tipos que se implementarán** (FASE 8), y por qué esos y no más:

| Tipo | Dónde | Razón |
|---|---|---|
| `Person` | página profesional | Es la entidad que se quiere hacer inequívoca |
| `ProfessionalService` | home, contacto, profesional | Encaja con un gabinete privado sin forzar `MedicalBusiness` |
| `PostalAddress` + `geo` | anidado en el anterior | SEO local |
| `WebPage` + `FAQPage` | landings clínicas | Extracción de respuestas |
| `Article` + `author` + `datePublished` / `dateModified` | artículos | E-E-A-T |
| `BreadcrumbList` | todas | Comprensión de la jerarquía |

**Descartados a propósito**: `MedicalBusiness` y `Physician` (implican práctica médica; el
profesional es psicólogo, no médico), `Review`/`AggregateRating` (no hay reseñas verificables y en
salud son terreno resbaladizo), `MedicalCondition` con `possibleTreatment` (afirmaría eficacia
clínica que no procede declarar), y `sameAs` hacia perfiles que aún no me has confirmado.

---

## 6. Mapa de enlazado interno

**Artículos existentes → landing que les corresponde** (recupera además los 6 huérfanos):

| Artículo | Destino |
|---|---|
| `id=3` ¿Cómo funciona nuestro cuerpo? | Ansiedad + Dolor crónico |
| `id=7` Guía para padres de hijos adolescentes | Terapias adultos/niños |
| `id=10` Guía de manejo emocional para padres | Terapias adultos/niños |
| `id=11` «El coaching pot motivar…» | Enfoque + Profesional |
| `id=4` Atenció i maneig emocional a l'esport | Psicología del deporte + Enfoque |
| `id=12` Premio Joan Calafat 2025 | Trayectoria y publicaciones |

**Entre landings** (solo donde hay razón clínica):
Ansiedad ↔ Dolor crónico · Ansiedad ↔ Trauma · Depresión ↔ Dolor crónico · las cuatro → Enfoque → Profesional.

**Desde la home**: un bloque nuevo "¿En qué podemos ayudarte?" que enlace las cuatro landings.
Es el único cambio que la home necesita en esta fase.

---

## 7. Criterios de diseño

Se mantiene la identidad visual actual. Los fragmentos usarán las clases Bootstrap 3 ya presentes
para no introducir dependencias nuevas, con CSS adicional acotado a un solo bloque.

- Medida de línea de 60–70 caracteres y cuerpo de 17–18 px en móvil.
- Espacio en blanco generoso entre secciones; sin acordeones que escondan el contenido clínico
  (perjudican la extracción y la lectura en móvil).
- Sin testimonios, sin contadores de pacientes, sin insignias, sin "reserva ya".
- Una sola llamada a la acción por página, al final, en tono de puerta abierta y no de conversión.
- Firma de autoría visible al pie de cada página clínica: autor, colegiado, fecha de publicación y
  fecha de revisión.

---

## 8. Lo que no voy a hacer

- No tocaré ninguno de los 45 HTML del repositorio: son la capa clínica privada y siguen `noindex`.
- No eliminaré contenido existente de la web.
- No abriré el sitio a rastreadores desconocidos. `robots.txt` ya permite el acceso general, que es
  lo que necesitan los sistemas de IA; no hace falta añadir nada.
- No publicaré ninguna credencial, publicación o enlace que no me hayas confirmado.

---

## 9. Orden de trabajo a partir de aquí

| Fase | Entrega | Depende de |
|---|---|---|
| 3 | Página profesional + trayectoria | Confirmación de fuentes públicas (§3.2 de la FASE 1) |
| 4 | Landing ansiedad + `/enfoque/` | — |
| 5 | Landing trauma / TEPT | Confirmación sobre Mutua Balear |
| 6 | Landing dolor crónico | — |
| 7 | Landing depresión + entrada a cita | — |
| 8 | `.htaccess`, canonical, JSON-LD, sitemap, GA4 | Elección de host canónico |
| 9 | Enlazado interno | Fases 3–7 |
| 10 | Auditoría final desde la perspectiva de un buscador de IA | Todo lo anterior publicado |

Las fases 4, 6 y 7 no dependen de ninguna confirmación pendiente: se pueden ejecutar de inmediato.
