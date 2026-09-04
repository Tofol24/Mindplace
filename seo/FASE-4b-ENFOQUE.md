# `/enfoque/` — propuesta de contenido

**URL:** `/enfoque/` (fichero `enfoque.php`)
**Estado:** propuesta. **No se ha escrito código.**

---

## 1. Qué hace esta página que no hace ninguna otra

Tenías razón en no tratarla como parche de navegación. Esta página tiene una función que ninguna
otra puede asumir, y es **la más delicada de toda la arquitectura**:

> Es el único sitio de la web donde conviven, explicados a la vez, un cuerpo de evidencia
> establecido y un desarrollo propio sin evidencia publicada. **La página se juega su credibilidad
> en cómo los separa.**

Las landings clínicas mencionan TEC/AIS en un párrafo y siguen. Aquí hay que explicarlo. Y
explicar algo propio, con nombre, en una web sanitaria, sin evidencia publicada, es exactamente
la situación en la que un centro pierde la confianza de un lector formado — o la gana.

De ahí la decisión estructural que gobierna la página: **no se presentan los cinco elementos como
una lista de cinco cosas equivalentes.** Se presentan en dos planos visualmente distintos.

```
   PLANO 1 · LO QUE ESTÁ ESTABLECIDO
   Terapia cognitivo-conductual   ─┐
   Terapia de aceptación y compromiso ├─ con recomendación en guías
   Neuropsicología                 ─┘   de práctica clínica, citadas

   ───────────────── separación visible ─────────────────

   PLANO 2 · LO QUE ES DESARROLLO PROPIO
   Entrenamiento atencional e interoceptivo
   TEC/AIS  ── marco en desarrollo, sin evidencia publicada,
                declarado como tal sin rodeos
```

Un lector que llegue con desconfianza tiene que poder ver **dónde termina lo respaldado y dónde
empieza lo propio, sin tener que deducirlo**. Paradójicamente, decirlo así es lo que hace creíble
el resto: quien declara los límites de su propio modelo resulta más fiable, no menos.

---

## 2. Metadatos

| Campo | Valor | Long. |
|---|---|---|
| **URL** | `https://www.aprens.es/enfoque/` | — |
| **Title** | `Enfoque terapéutico: TCC, ACT y neuropsicología · APRENS` | 55 |
| **Meta description** | `Cómo trabajamos en APRENS: terapia cognitivo-conductual, terapia de aceptación y compromiso, neuropsicología y entrenamiento atencional. Inca, Mallorca.` | 152 |
| **H1** | `Cómo trabajamos en APRENS` | — |

---

## 3. Estructura y contenido

### H1 · Cómo trabajamos en APRENS

**Entrada, en un párrafo:** el trabajo se apoya en intervenciones psicológicas con respaldo en
guías de práctica clínica, y a eso se añade un trabajo atencional e interoceptivo desarrollado en
el propio centro. Ambas cosas se explican por separado, y se dice de cada una qué respaldo tiene.

### H2 · ¿Qué es la terapia cognitivo-conductual?

Respuesta directa; qué mira (relación entre pensar, sentir y hacer; patrones que mantienen el
problema aunque busquen aliviarlo); en qué consiste realmente (examinar predicciones, ponerlas a
prueba, exposición gradual, recuperar conducta); y el respaldo, citado: **recomendación fuerte a
favor como primera línea de tratamiento psicológico del TAG** en la GPC del SNS de 2024.

### H2 · ¿Qué es la terapia de aceptación y compromiso?

Respuesta directa. Aquí se usa la descripción de la propia guía, que es más clara que cualquier
paráfrasis: las personas «reaccionan negativamente a sus experiencias internas, juzgándolas,
luchando contra ellas o tratando de controlarlas», la **evitación experiencial**; y el tratamiento
«no se centra primariamente en reducir las preocupaciones, sino en cambiar cómo uno responde ante
las mismas», promoviendo «la acción en áreas importantes para el paciente».

Y el respaldo, con su nivel exacto: **recomendación débil a favor, una de las opciones de segunda
línea** cuando no hay respuesta con TCC. Sin inflarlo.

### H2 · ¿Qué aporta la neuropsicología?

Que atención, memoria de trabajo y funciones ejecutivas condicionan qué intervención es realista
en un momento dado. No es un añadido: cambia el plan. Una persona con la atención muy fragmentada
no puede sostener las mismas tareas entre sesiones que otra que no lo está, y proponérselas es
programar un fracaso.

### ── Separación visible ──

Un bloque explícito, no un cambio de tono: *«Lo que viene a continuación es desarrollo propio del
centro. Se explica aparte, y con sus límites, porque no tiene el mismo respaldo que lo anterior.»*

### H2 · ¿Qué es el entrenamiento atencional e interoceptivo?

Trabajo sistemático con dos cosas: dónde se pone la atención y cómo se registra lo que ocurre
dentro del cuerpo. Qué se practica, con qué frecuencia, y para qué sirve dentro del conjunto.

Formulación honesta del respaldo: el trabajo con la atención y con la interocepción **forma parte
de intervenciones psicológicas establecidas**; lo que es propio del centro es la forma concreta de
sistematizarlo, no el hecho de trabajarlas.

### H2 · ¿Qué es el marco TEC/AIS?

Aquí no hay margen para la ambigüedad. La sección dice, con estas palabras o equivalentes:

> TEC/AIS es un marco clínico **en desarrollo**, elaborado por Cristòfol Villalonga a partir de su
> práctica. Organiza el trabajo atencional e interoceptivo dentro de las intervenciones descritas
> más arriba.
>
> **No es un tratamiento con eficacia diferencial establecida.** No existe todavía evidencia
> publicada que permita afirmar que funciona mejor que las intervenciones con respaldo en guías,
> y por tanto no se presenta como alternativa a ellas ni sustituye a ninguna.
>
> Se explica en la primera visita, y quien prefiera trabajar únicamente con las intervenciones
> respaldadas puede hacerlo.

Esa última frase importa más de lo que parece: convierte una declaración de límites en una
garantía para el paciente.

### H2 · ¿Cómo es la primera visita?

Qué ocurre, cuánto dura, qué se lleva la persona, y que de ahí sale una formulación compartida y
una propuesta con objetivos. Que si el trabajo psicológico no es lo indicado, se dice.

### H2 · ¿Y si esto no es lo que necesito?

Sección corta y poco habitual en una web de centro, que es justo por lo que funciona: no todas las
demandas se atienden mejor aquí, y decirlo aumenta la confianza en todo lo demás.

---

## 4. Lo que esta página NO hará

- ❌ Presentar TEC/AIS al mismo nivel visual o argumental que TCC y ACT
- ❌ Insinuar eficacia diferencial por acumulación o por orden de aparición
- ❌ Usar la cita de la guía sobre ACT para prestarle respaldo a TEC/AIS por proximidad
- ❌ Atribuir titulación en TCC o ACT al profesional
- ❌ Convertirse en una página de método propio con las evidencias de decorado

---

## 5. Enlaces internos

**Salen:** las cuatro landings clínicas · página profesional · trayectoria · contacto.
**Entran:** las cuatro landings (desde «cómo trabajamos») · página profesional · portada.

Cuando exista, hay que **añadir el enlace a `/enfoque/` en la sección «¿Cómo trabajamos en APRENS?»
de la landing de ansiedad**, que ahora apunta solo a la página profesional.

---

## 6. Datos estructurados

`WebPage` + `FAQPage`, con `author` y `reviewedBy` apuntando al mismo `@id` de Person.
`citation` con la GPC del SNS 2024 y NICE CG113, exactamente como en la landing de ansiedad.

**Sin** `MedicalTherapy` para TEC/AIS. Declararlo como terapia en datos estructurados afirmaría
por la puerta de atrás lo que el texto se cuida de no afirmar por la principal.

---

## 7. Antes de escribirla, dos preguntas

1. **¿Hay algo de TEC/AIS que sí sea publicable con respaldo?** Un registro interno de casos, una
   comunicación en congreso, un trabajo en curso. Cambiaría «no existe evidencia publicada» por una
   formulación algo más concreta, que sigue siendo prudente pero informa mejor.
2. **¿Qué quieres que pase con quien lea esto y no quiera trabajo TEC/AIS?** He propuesto decir
   explícitamente que puede trabajar solo con las intervenciones respaldadas. Confírmame si estás
   de acuerdo: es una promesa que la consulta tiene que poder cumplir.

---

## 8. Resolución de las dos preguntas abiertas

Respondidas el 26 de agosto de 2026.

### 8.1 «En breve voy a publicar la TEC en Amazon»

| | |
|---|---|
| **Qué cambia** | TEC/AIS deja de ser un marco sin fuente pública. Pasa a ser **descrito, fechado, atribuido y citable**. Hoy, si alguien pregunta «¿qué es exactamente TEC?», no hay dónde mirar; con el libro, sí. Es una mejora real de legibilidad para personas y para sistemas. |
| **Qué NO cambia** | **Nada del nivel de evidencia.** Autopublicar no es revisión por pares, y un libro que describe un modelo no es evidencia de que ese modelo funcione. La formulación «no es un tratamiento con eficacia diferencial establecida» se mantiene sin alteración. |

**Reglas de uso cuando exista:**

- No se cita hasta que esté publicado con identificador estable. Nada de «próximamente».
- Se cita como **«el marco está descrito en…»**, nunca como «avalado por» ni «basado en».
- El enlace es informativo, no promocional. Un bucle libro → terapia → libro en una página
  sanitaria se lee como venta y erosiona la confianza que esta arquitectura intenta construir.
- En datos estructurados entraría como `Book` con `author` = la Person del grafo. **No** como
  respaldo de `MedicalTherapy`, que sigue descartado.

### 8.2 «Sí, ya que la terapia TEC bebe directamente de la ACT»

Confirmada la frase que permite al paciente trabajar únicamente con las intervenciones
respaldadas. Pero la justificación abre una cuestión que la página debe resolver de forma explícita.

**La derivación da linaje, no evidencia.** Declarar que TEC parte de ACT es bueno y honesto: sitúa
el marco en una tradición con respaldo en guías. Pero no transfiere el aval. Si lo transfiriera,
bastaría renombrar cualquier terapia establecida para heredar sus estudios.

**Y hay una tensión que conviene cerrar antes de escribir:**

| Si… | Entonces… |
|---|---|
| TEC ≈ ACT | Presentarlo como marco propio con nombre propio **infla su novedad** |
| TEC ≠ ACT | La promesa de «trabajar solo con lo respaldado» significa hacer algo genuinamente distinto, y **la consulta tiene que poder cumplirla** |

No se puede sostener a la vez que es lo bastante distinto para tener nombre propio y lo bastante
igual para que la promesa sea trivial.

**Resolución adoptada** — modesta, defendible, y coherente con ambas cosas:

> TEC/AIS es una **sistematización propia** de principios procedentes de la terapia de aceptación
> y compromiso, combinados con entrenamiento atencional e interoceptivo. Lo propio es la forma de
> organizarlo y aplicarlo, no los principios de los que parte, que son los de un enfoque con
> respaldo en guías de práctica clínica.

Con esta formulación:

- El linaje queda **declarado**, que es lo que aporta legitimidad honesta.
- La novedad reclamada es **acotada**: la sistematización, no los principios.
- La promesa es **significativa y cumplible**: se puede trabajar con TCC y ACT sin la
  sistematización propia.
- Y resiste que alguien compare la web con la literatura, que es exactamente la prueba que este
  proyecto tiene que pasar.

---

## 9. Texto de las dos secciones críticas

El resto de la página sigue el esquema de la sección 3. Estas dos son las que deciden si la página
es creíble, así que van redactadas para aprobar palabra por palabra.

### Bloque de separación

> **A partir de aquí, desarrollo propio**
>
> Lo que viene a continuación se ha desarrollado en este centro. Se explica aparte, y con sus
> límites, porque no tiene el mismo respaldo que lo anterior.

### H2 · ¿Qué es el marco TEC/AIS?

> Es una sistematización propia del trabajo atencional e interoceptivo, desarrollada por Cristòfol
> Villalonga a partir de su práctica clínica.
>
> Parte de principios de la terapia de aceptación y compromiso —cambiar la relación con las
> experiencias internas en lugar de intentar suprimirlas, y recuperar la acción en las áreas que
> importan— y los combina con entrenamiento sistemático de la atención y del registro de lo que
> ocurre en el cuerpo. **Lo propio es la manera de organizarlo y aplicarlo, no los principios de
> los que parte.**
>
> **Qué respaldo tiene, dicho con precisión.** Los principios de los que parte proceden de un
> enfoque con recomendación en guías de práctica clínica. La sistematización concreta que se
> describe aquí **no cuenta con evidencia publicada que permita afirmar que funciona mejor que las
> intervenciones ya respaldadas**, y por tanto no se presenta como alternativa a ellas ni sustituye
> a ninguna.
>
> Se explica en la primera visita. **Quien prefiera trabajar únicamente con las intervenciones
> respaldadas por guías puede hacerlo**, y el trabajo se organiza así sin ningún inconveniente.

Esa última frase convierte una declaración de límites en una garantía para el paciente. Es también
un compromiso operativo: la consulta tiene que poder cumplirlo.
