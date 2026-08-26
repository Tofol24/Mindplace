# FASE 3 · Página profesional — propuesta de contenido

**URL:** `/cristofol-villalonga-psicologo-mallorca/` (fichero `profesional.php`)
**Host canónico confirmado:** `https://www.aprens.es`
**Estado:** propuesta de contenido. **No se ha escrito código.** Pendiente de aprobación.

---

## 0. Hallazgos de la verificación de fuentes

Al verificar las fuentes que indicaste han aparecido cuatro cosas que no estaban sobre la mesa.
Tres son buenas noticias y una es una corrección.

### 0.1 🔴 Corrección: la vocalía del COPIB es un cargo pasado

`aprens.es` afirma hoy, en presente:

> «Vocal de psicología de l'esport del COPIB»

El propio COPIB, en su nota del **30 de septiembre de 2025**, lo describe como:

> «**exvocal** del Área de Psicología del Deporte y la Actividad Física» — **2015–2024**

Es decir: la web presenta como cargo actual algo que el colegio profesional da por concluido.
Es un dato menor en apariencia, pero es exactamente el tipo de discrepancia que erosiona la
confianza cuando una IA compara la web con su fuente institucional. **La página nueva lo corrige**
y lo presenta con sus fechas, que es más informativo que el presente vago.

La misma nota del COPIB de **18 de febrero de 2025** sí lo describe como **miembro del Grupo de
Trabajo de Psicología del Deporte y la Actividad Física** sin marca temporal. Uso esa formulación.
⚠️ Conviene que confirmes que esa pertenencia sigue vigente en 2026.

### 0.2 ✅ El premio ya tiene fuente institucional independiente

Pedías no darle peso hasta encontrar una fuente externa. Existe: **el propio COPIB publica la
concesión**, y la nota identifica al organismo que lo otorga.

- Otorga: **Grupo Salut i Força** · III edición de los Premios Joan Calafat
- Concesión: **19 de septiembre de 2025**
- Nota del COPIB: 30 de septiembre de 2025

Deja de ser fuente propia. Puede entrar en la página y en el JSON-LD con normalidad.

### 0.3 ✅ Fechas verificables que no teníamos

La misma nota del COPIB aporta cronología, que es oro para una página de entidad:

| Dato | Fuente |
|---|---|
| Centre APRENS fundado en **2006** | COPIB, 30-09-2025 |
| Psicólogo de **Mutua Balear desde 2009** | COPIB, 30-09-2025 |
| Psicólogo del **CD Constancia, 2002–2020** | COPIB, 30-09-2025 |
| Tutor de prácticas y profesor asociado en la **UIB** | COPIB, 30-09-2025 |

⚠️ Sobre la UIB: la nota del COPIB acredita «profesor asociado en la UIB», pero **no he podido
localizar la ficha nominal en `uib.es`** ni confirmar el área de *Psicologia Bàsica* que mencionas.
Propongo redactarlo como «profesor asociado en la Universitat de les Illes Balears» —lo que la
fuente sostiene— y añadir el área y el enlace nominal cuando tengas la URL exacta.

### 0.4 🟠 Existe un segundo sitio profesional que compite con aprens.es

`https://www.tofolvillalonga.com` es un sitio profesional activo servido por Doctoralia que ya
publica **exactamente las cuatro áreas que queremos construir**: ansiedad, estrés postraumático,
dolor crónico y depresión, además de TOC, fobias, duelo y ataques de pánico. Tiene más de cien
opiniones de pacientes, tarifas y reserva de cita.

Esto es una espada de doble filo:

- **A favor:** la asociación externa «Villalonga → ansiedad, TEPT, dolor crónico, depresión» ya
  existe, y con señales de confianza (opiniones verificadas) que `aprens.es` no tiene.
- **En contra:** hoy ese sitio y `aprens.es` compiten por la misma entidad. Sin una relación
  declarada entre ambos, el buscador ve dos profesionales parecidos en la misma calle en lugar de uno.

**Recomendación:** que `aprens.es` sea la fuente canónica y que ambos se declaren mutuamente
(`sameAs` desde aprens.es; un enlace desde el perfil, en la medida en que Doctoralia lo permita).
No propongo tocar `tofolvillalonga.com` en esta fase, pero conviene decidirlo antes de la FASE 8.

### 0.5 El problema de fondo: cuatro nombres para una persona

Las fuentes públicas te nombran de cuatro maneras distintas:

| Nombre | Dónde |
|---|---|
| **Cristòfol** Villalonga Melis | aprens.es, MundoPsicologos |
| **Cristóbal** Villalonga Melis | registro colegial del COPIB |
| **Tòfol** Villalonga Melis | COPIB (notas), Doctoralia, autoría de los libros |
| **Tófol** Villalonga Melis | artículo del premio en aprens.es |

Y dos formas del número de colegiado: **B-1599** (aprens.es) y **B-01599** (COPIB, MundoPsicologos).

Para una persona son obviamente la misma. Para un sistema que resuelve entidades, son hasta cuatro
candidatos. **Unificarlos explícitamente es probablemente la acción de mayor rendimiento de toda
esta fase**, y se hace de dos maneras: diciéndolo en el texto con naturalidad, y declarándolo en
`alternateName` dentro del JSON-LD.

Uso **B-01599** como forma principal por ser la del registro oficial, mencionando la equivalencia.

---

## 1. Metadatos de la página

| Campo | Valor | Long. |
|---|---|---|
| **URL** | `https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/` | — |
| **Title** | `Cristòfol Villalonga Melis · Psicólogo en Inca, Mallorca` | 56 |
| **Meta description** | `Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-01599. Consulta en Inca (Mallorca) y online. Fundador de Centre APRENS.` | 138 |
| **H1** | `Cristòfol Villalonga Melis \| Psicólogo en Mallorca` | — |
| **Canonical** | ella misma | — |
| **Autor / revisión** | visibles al pie | — |

---

## 2. Texto íntegro propuesto

> Convenciones: `##` = `<h2>`, `###` = `<h3>`. El primer párrafo de cada sección responde la
> pregunta de forma directa y autónoma, para que pueda extraerse sin el resto de la página.

---

# Cristòfol Villalonga Melis | Psicólogo en Mallorca

**Psicólogo General Sanitario y neuropsicólogo clínico. Colegiado B-01599. Consulta en Inca,
Mallorca, y atención online.**

Cristòfol Villalonga Melis es psicólogo general sanitario y neuropsicólogo clínico, colegiado
número B-01599 en el Col·legi Oficial de Psicologia de les Illes Balears. Pasa consulta en Inca, en
el Centre APRENS, que fundó en 2006, y atiende también en formato online. Trabaja con adultos,
adolescentes y familias, principalmente en ansiedad y sobrepensamiento, trauma, dolor crónico y
estado de ánimo.

Profesionalmente firma también como **Tòfol Villalonga**, y así aparece en sus libros y en las
publicaciones del colegio profesional. En el registro colegial consta como Cristóbal Villalonga
Melis. Son la misma persona y el mismo número de colegiado.

## ¿Quién es Cristòfol Villalonga Melis?

Es el psicólogo fundador del Centre APRENS, en Inca, donde ejerce desde 2006.

Su trabajo combina dos formaciones que no siempre van juntas: la clínica y la neuropsicología. Eso
determina cómo mira lo que le trae una persona a consulta. Antes de preguntarse qué etiqueta
corresponde a un malestar, se pregunta qué está haciendo la atención de esa persona, qué está
haciendo su cuerpo y qué ha dejado de hacer en su vida desde que aparecieron las dificultades.

Además de la consulta, mantiene actividad docente e institucional: es profesor asociado en la
Universitat de les Illes Balears y ha estado vinculado durante años al Col·legi Oficial de
Psicologia de les Illes Balears en el ámbito de la psicología del deporte y la actividad física.

## ¿Qué titulación y colegiación tiene?

Es **Psicólogo General Sanitario**, la titulación que habilita en España para el ejercicio
sanitario de la psicología, y **neuropsicólogo clínico**. Su número de colegiado es **B-01599**, en
el Col·legi Oficial de Psicologia de les Illes Balears (COPIB), y puede comprobarse en el buscador
público de colegiados del propio colegio.

- Psicólogo General Sanitario
- Neuropsicólogo clínico
- Colegiado **B-01599** — COPIB, Col·legi Oficial de Psicologia de les Illes Balears
- Máster Internacional en Psicología Clínica (AEPC)
- Formación específica en psicología del deporte y en psicología educativa

*(En algunos documentos el número aparece como B-1599, sin el cero. Es el mismo.)*

## ¿Dónde pasa consulta?

En **Inca, Mallorca**, en el Centre APRENS: **C/ Virgen de la Esperanza, 70, 2º · 07300 Inca ·
Illes Balears**.

Inca está en el centro de la isla y bien comunicada por tren y por la Ma-13, lo que la hace
accesible desde Palma, desde el Raiguer y desde buena parte del Pla y del norte de Mallorca. El
horario del centro es de 9 a 21 h.

Además de la consulta presencial, atiende **online**, lo que permite mantener la continuidad del
proceso cuando la distancia, los horarios o un desplazamiento lo complican.

## ¿Con qué dificultades trabaja?

Principalmente con cuatro tipos de dificultad. En las cuatro hay algo en común: la atención queda
capturada por algo —un pensamiento, una sensación, un recuerdo, un vacío— y la vida se va
estrechando alrededor de eso.

### Ansiedad y sobrepensamiento
Preocupación que no para, rumiación, anticipación, activación del cuerpo, miedo a las propias
sensaciones, evitación y necesidad de controlarlo todo.
→ *Ver: Psicólogo para la ansiedad y el sobrepensamiento en Mallorca*

### Trauma y estrés postraumático
Malestar que persiste después de un accidente de tráfico o laboral, una agresión u otra experiencia
traumática: hipervigilancia, recuerdos que vuelven sin permiso, evitación de lo que recuerda a lo
ocurrido, sensación de seguir en peligro.
→ *Ver: Psicólogo para trauma y TEPT en Mallorca*

### Dolor crónico
Adaptación psicológica a un dolor que se mantiene en el tiempo: la relación entre dolor y amenaza,
la hipervigilancia corporal, la evitación y la recuperación progresiva de actividades que importan.
→ *Ver: Psicología para el dolor crónico en Mallorca*

### Depresión y bloqueo conductual
Pérdida de ganas y de disfrute, aislamiento, abandono de actividades significativas, desesperanza,
y esa distancia entre saber lo que uno debería hacer y no conseguir arrancar.
→ *Ver: Psicólogo para la depresión y el bloqueo en Mallorca*

También realiza **evaluación neuropsicológica** y trabaja en **psicología del deporte**, ámbito en
el que ha desarrollado buena parte de su trayectoria.

## ¿Con qué población trabaja?

Con **adultos, adolescentes y familias**.

En adolescentes y familias el trabajo suele incluir a las personas del entorno, porque a esas
edades buena parte de lo que sostiene una dificultad —o de lo que ayuda a salir de ella— ocurre en
casa y en el centro educativo, no solo en la consulta.

## ¿Desde qué enfoque trabaja?

Desde un marco cognitivo-conductual y contextual, con la mirada de la neuropsicología incorporada
a la evaluación.

- **Terapia cognitivo-conductual (TCC).** Trabajo sobre la relación entre lo que una persona
  piensa, lo que siente y lo que hace, y sobre los patrones que mantienen el problema aunque
  busquen aliviarlo.
- **Terapia de aceptación y compromiso (ACT).** En lugar de pelear con lo que se siente, aprender
  a sostenerlo mientras se recupera la conducta que importa. Especialmente pertinente cuando el
  intento de controlar el malestar se ha convertido en parte del problema.
- **Neuropsicología.** Atención, memoria y funciones ejecutivas no son un adorno: condicionan lo
  que una persona puede sostener en un momento dado, y por tanto qué intervención es realista.
- **Entrenamiento atencional e interoceptivo.** Trabajo sistemático con dónde se pone la atención y
  con cómo se registra lo que ocurre dentro del cuerpo, integrado dentro de lo anterior.

En su práctica ha desarrollado además un marco propio, **TEC/AIS**, orientado al entrenamiento
atencional e interoceptivo. Se trata de un **marco clínico en desarrollo**, integrado dentro del
trabajo descrito, y no de un tratamiento con eficacia diferencial establecida.

→ *Ver: Cómo trabajamos en APRENS*

## ¿Atiende online?

**Sí.** Atiende tanto presencialmente en la consulta de Inca como en formato online.

La modalidad online permite mantener la continuidad del proceso cuando la distancia, los horarios
o un traslado lo complican. No todas las demandas se trabajan igual de bien a distancia; es algo
que se valora en la primera visita.

## Trayectoria profesional

Ejerce desde 2006, cuando fundó el Centre APRENS en Inca.

| Desde | Actividad |
|---|---|
| 2006 | Fundador y psicólogo responsable del Centre APRENS, Inca |
| 2009 | Psicólogo de la Mutua Balear |
| 2002–2020 | Psicólogo del CD Constancia |
| 2015–2024 | Vocal del Área de Psicología del Deporte y la Actividad Física del COPIB |
| Actualidad | Miembro del Grupo de Trabajo de Psicología del Deporte y la Actividad Física del COPIB |
| Actualidad | Profesor asociado y tutor de prácticas en la Universitat de les Illes Balears |

→ *Ver: Trayectoria y publicaciones*

## Publicaciones y reconocimientos

Es autor de varios libros divulgativos sobre manejo emocional y atención consciente, publicados
bajo la firma **Tòfol Villalonga**:

- *Lidera tu mon(e)a. Estrategias prácticas para reducir el sobrepensamiento, liderar tu atención
  y mejorar tus relaciones* (2025), con edición en catalán como *Lidera la teva mon(e)a*
- *Cría desde dentro*
- *Trasciende desde dentro*
- *Guía de manejo emocional para padres*

En septiembre de 2025 recibió el **Premio a la Excelencia Profesional en Psicología** en la III
edición de los Premios Joan Calafat, otorgados por el Grupo Salut i Força.

## ¿Cómo pedir una primera visita?

Escribiendo a **info@aprens.es**, llamando al **636 93 76 61** en horario de 9 a 21 h, o desde la
página de contacto.

La primera visita sirve para entender qué está pasando y decidir juntos si tiene sentido seguir, y
de qué manera. No hay compromiso de continuidad: si lo que necesitas se atiende mejor desde otro
sitio, se te dice.

→ *¿En qué podemos ayudarte?*

---

## 3. Preguntas frecuentes

**¿Cristòfol Villalonga es Psicólogo General Sanitario?**
Sí. Es Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-01599 en el Col·legi
Oficial de Psicologia de les Illes Balears.

**¿Es lo mismo Cristòfol Villalonga que Tòfol Villalonga?**
Sí. Firma profesionalmente como Tòfol Villalonga, y así aparece en sus libros y en las
publicaciones del colegio profesional. En el registro colegial consta como Cristóbal Villalonga
Melis. Es la misma persona, con el mismo número de colegiado.

**¿Dónde pasa consulta?**
En el Centre APRENS, C/ Virgen de la Esperanza, 70, 2º, 07300 Inca, Mallorca. También atiende
online.

**¿Trabaja la ansiedad?**
Sí. La ansiedad y el sobrepensamiento son una de sus cuatro áreas principales de trabajo.

**¿Trabaja el malestar posterior a un accidente?**
Sí. Trabaja el trauma y el estrés postraumático, incluido el malestar que persiste tras accidentes
de tráfico o laborales.

**¿Trabaja el dolor crónico?**
Sí, desde la perspectiva de la adaptación psicológica al dolor persistente. El acompañamiento
psicológico es complementario al tratamiento médico del dolor, no lo sustituye.

**¿Qué enfoque terapéutico utiliza?**
Un marco cognitivo-conductual y contextual —terapia cognitivo-conductual y terapia de aceptación y
compromiso— con la neuropsicología incorporada a la evaluación y trabajo de entrenamiento
atencional e interoceptivo.

**¿Se puede comprobar su colegiación?**
Sí. El número B-01599 puede consultarse en el buscador público de colegiados del Col·legi Oficial
de Psicologia de les Illes Balears.

---

## 4. Enlaces internos previstos

**Salen de esta página:**

| Destino | Contexto | Fase |
|---|---|---|
| `/psicologo-ansiedad-mallorca/` | sección de áreas | 4 |
| `/psicologo-trauma-tept-mallorca/` | sección de áreas | 5 |
| `/psicologia-dolor-cronico-mallorca/` | sección de áreas | 6 |
| `/psicologo-depresion-mallorca/` | sección de áreas | 7 |
| `/enfoque/` | sección de enfoque | 4 |
| `/trayectoria-y-publicaciones/` | trayectoria y publicaciones | 3 |
| `/en-que-podemos-ayudarte/` | cierre | 7 |
| `categoria_servicio.php?id=7` | evaluación neuropsicológica | ya existe |
| `categoria_servicio.php?id=4` | psicología del deporte | ya existe |
| `contactar.php` | primera visita | ya existe |

**Entran a esta página:** portada · `quienes-somos.php` (desde su ficha) · las cuatro landings
clínicas · `/enfoque/` · todos los artículos, desde la firma de autoría.

---

## 5. Fuentes externas

**Se citan y entran en `sameAs`:**

| Fuente | Qué acredita |
|---|---|
| Buscador de colegiados del COPIB | Colegiación B-01599 |
| COPIB — nota del 30-09-2025 sobre el Premio Joan Calafat | Premio, APRENS 2006, Mutua Balear 2009, CD Constancia 2002-2020, UIB, vocalía 2015-2024 |
| COPIB — nota del 18-02-2025 sobre *Lidera tu mon(e)a* | Libro y pertenencia al Grupo de Trabajo |
| Perfil en MundoPsicologos | Nombre, B-01599, dirección, áreas |
| Perfil en Doctoralia | Nombre, áreas, modalidad |

**Se citan pero NO entran en `sameAs`** — agregadores que replican datos sin verificación
(cocosano, deandrespsicologo, confines, infopsicologos y similares). Incluirlos en `sameAs` diluye
la señal en lugar de reforzarla.

**Pendientes:**
- URL nominal de la ficha del profesor en `uib.es`
- ISBN de los libros. Solo he localizado identificadores de Amazon (ASIN), que no son ISBN. Tal
  como acordamos, el dato se deja fuera hasta tener una referencia bibliográfica verificable.
- Enlace a la entrevista publicada en prensa

---

## 6. JSON-LD propuesto

Un solo bloque en `<head>`, con `@graph` para no repetir la entidad del centro en cada página.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona",
      "name": "Cristòfol Villalonga Melis",
      "alternateName": [
        "Tòfol Villalonga Melis",
        "Tófol Villalonga Melis",
        "Cristóbal Villalonga Melis",
        "Tòfol Villalonga"
      ],
      "jobTitle": ["Psicólogo General Sanitario", "Neuropsicólogo clínico"],
      "description": "Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-01599. Consulta en Inca, Mallorca, y atención online.",
      "url": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Número de colegiado COPIB",
        "value": "B-01599"
      },
      "memberOf": {
        "@type": "Organization",
        "name": "Col·legi Oficial de Psicologia de les Illes Balears",
        "alternateName": "COPIB",
        "url": "https://copib.es/"
      },
      "worksFor": { "@id": "https://www.aprens.es/#centro" },
      "founder": { "@id": "https://www.aprens.es/#centro" },
      "affiliation": [
        {
          "@type": "CollegeOrUniversity",
          "name": "Universitat de les Illes Balears",
          "url": "https://www.uib.es/"
        },
        { "@type": "Organization", "name": "Mutua Balear" }
      ],
      "knowsAbout": [
        "Ansiedad",
        "Rumiación y sobrepensamiento",
        "Trastorno de estrés postraumático",
        "Trauma psicológico tras accidentes de tráfico o laborales",
        "Dolor crónico",
        "Depresión",
        "Evaluación neuropsicológica",
        "Terapia cognitivo-conductual",
        "Terapia de aceptación y compromiso",
        "Psicología del deporte"
      ],
      "knowsLanguage": ["ca", "es"],
      "award": "Premio a la Excelencia Profesional en Psicología, III Premios Joan Calafat (Grupo Salut i Força), 2025",
      "sameAs": [
        "PENDIENTE · URL del buscador de colegiados del COPIB",
        "https://copib.es/es/noticias/psicologo-tofol-villalonga-recibe-premio-joan-calafat-excelencia-profesional",
        "https://www.mundopsicologos.com/centros/cristofol-villalonga-melis",
        "https://www.doctoralia.es/tofol-villalonga-melis/psicologo/inca"
      ]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://www.aprens.es/#centro",
      "name": "Centre APRENS",
      "url": "https://www.aprens.es/",
      "foundingDate": "2006",
      "founder": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "employee": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "telephone": "+34636937661",
      "email": "info@aprens.es",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "C/ Virgen de la Esperanza, 70, 2º",
        "addressLocality": "Inca",
        "addressRegion": "Illes Balears",
        "postalCode": "07300",
        "addressCountry": "ES"
      },
      "areaServed": [
        { "@type": "City", "name": "Inca" },
        { "@type": "AdministrativeArea", "name": "Mallorca" },
        { "@type": "AdministrativeArea", "name": "Illes Balears" }
      ],
      "availableLanguage": ["ca", "es"],
      "openingHours": "Mo-Fr 09:00-21:00"
    },
    {
      "@type": "WebPage",
      "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#pagina",
      "url": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/",
      "name": "Cristòfol Villalonga Melis · Psicólogo en Inca, Mallorca",
      "about": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "mainEntity": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "inLanguage": "es",
      "isPartOf": { "@id": "https://www.aprens.es/#centro" }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#faq",
      "mainEntity": "→ las 8 preguntas de la sección 3, como Question / acceptedAnswer"
    }
  ]
}
```

### Decisiones de marcado, y su motivo

| Decisión | Motivo |
|---|---|
| `alternateName` con las cuatro variantes | Es la pieza clave: unifica cuatro identidades dispersas en una |
| `identifier` como `PropertyValue` en vez de texto suelto | Hace el número de colegiado legible como identificador, no como adorno |
| `ProfessionalService`, no `MedicalBusiness` ni `Physician` | Implicarían práctica médica. Es psicólogo, no médico |
| `foundingDate: 2006` | Acreditado por el COPIB; da antigüedad verificable a la entidad |
| `award` como texto con organismo y año | Nombrar quién lo otorga es lo que lo hace comprobable |
| **Sin** `AggregateRating` ni `Review` | No hay reseñas verificables en aprens.es, y en salud es terreno resbaladizo |
| **Sin** `MedicalCondition` con `possibleTreatment` | Afirmaría eficacia clínica que no procede declarar |
| **Sin** `hasCredential` para TCC/ACT | No hay formación reglada confirmada. Se describe el enfoque, no se titula |
| `@id` compartido para el centro | Evita duplicar la entidad APRENS en cada página del sitio |

---

## 7. Firma de autoría al pie

```
Cristòfol Villalonga Melis
Psicólogo General Sanitario · Neuropsicólogo clínico
Colegiado B-01599 · COPIB

Publicado: [fecha de publicación]
Última revisión: [fecha de revisión]
```

---

## 8. Lo que esta página NO dice

Verificación contra las reglas de la FASE 2:

- ❌ No dice «especialista en TCC» ni «formado en ACT» — describe el enfoque, no titula
- ❌ No dice «especialista en trauma» ni «experto en dolor crónico»
- ❌ No atribuye casuística, años, volumen de pacientes ni especialización en TEPT derivada de
  Mutua Balear: solo consta el vínculo profesional y su fecha de inicio, que es lo que la fuente acredita
- ❌ No presenta TEC/AIS como tratamiento validado ni de eficacia diferencial
- ❌ No contiene ninguna palabra de la lista prohibida
- ❌ No dice «el mejor», ni promete resultados, ni cuantifica éxito
- ✅ Corrige la vocalía del COPIB a cargo pasado con sus fechas
