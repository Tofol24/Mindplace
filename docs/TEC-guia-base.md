# TEC · Guía base del ecosistema APRENS

> Documento de referencia interno. Resume los **principios operativos** de la
> Teoría del Efecto Consciente (TEC) y de la Atención Interna Sensorial (AIS)
> tal como los aplicamos en las aplicaciones de APRENS. Es una destilación
> funcional escrita para mantener **coherencia** entre apps: **no reproduce**
> el libro ni sus textos. Cuando el manuscrito cambie, se actualiza aquí y las
> apps se alinean con esta guía.

Centre APRENS · Psicologia — Cristòfol Villalonga Melis, Col. B-01599.
Última revisión: 2026-10-06.

---

## 1. Para qué sirve esta guía

Todas las apps del ecosistema (aprens-app, aprens-inicio y las herramientas
integradas) comparten un mismo modelo de cómo funciona el malestar y de cómo
se trabaja con él. Esta guía fija ese modelo en un solo sitio para que:

- cualquier herramienta nueva **hable el mismo idioma** (mismos parámetros,
  misma secuencia, mismas metáforas);
- las piezas reutilizables (silueta AIS, viñeta parar·respirar·reorientar)
  signifiquen **lo mismo** en todos los sitios donde aparecen;
- el lenguaje con el paciente sea **consistente** entre el screening, las
  herramientas y el acompañamiento en sesión.

Regla de coherencia: **si una app no encaja con esta guía, se revisa la app,
no la guía.**

---

## 2. Idea central

El malestar no se sostiene tanto por *lo que se siente* como por *lo que la
atención hace con lo que se siente*. Una señal interna (una sensación
corporal, un pensamiento, un recuerdo) se vuelve problema cuando la atención
se queda enganchada en ella, la amplifica y la convierte en algo de lo que hay
que protegerse.

El trabajo terapéutico no busca **quitar** la señal, sino **cambiar la
relación** de la persona con ella: poder **estar con lo que se siente** sin
tener que apagarlo, controlarlo ni huir.

Frase ancla del ecosistema: **«estar contigo mientras lo sientes».**

---

## 3. Los tres parámetros de la atención (L · D · C)

El efecto consciente de una señal se describe con tres parámetros graduables.
Son el esqueleto de «Las tres puertas» y aparecen, explícita o
implícitamente, en el resto de herramientas.

1. **Latencia** — cuánto tarda la atención en *soltar* la señal una vez
   aparece. A más latencia, más tiempo enganchada.
2. **Densidad** — cuánto *espacio mental* ocupa la señal mientras está
   presente (cuánto copa, con qué intensidad, cuánto tapa a lo demás).
3. **Continuidad** — con qué *frecuencia y encadenamiento* vuelve la señal, y
   cuánto se hila un episodio con el siguiente.

Un episodio de malestar sostenido suele ser: **latencia alta + densidad alta +
continuidad alta**. El progreso terapéutico se nota como una **bajada
progresiva** en los tres (suelta antes, ocupa menos, vuelve menos y más
espaciado), más que como la desaparición de la señal.

Uso en apps: cuando una herramienta describa la evolución o pida a la persona
que observe cómo le va, hacerlo en términos de estos tres parámetros (no de
«tener o no tener» el síntoma).

---

## 4. La cadena funcional

Patrón de mantenimiento que explica *por qué* el malestar se perpetúa. Es la
columna vertebral del análisis funcional y de los guiones de sesión.

```
señal corporal / pensamiento
        │
        ▼
vector atencional  →  sobrepensamiento / rumiación
        │
        ▼
búsqueda de control (checking, reaseguro, anticipación)
        │
        ▼
evitación / escape
        │
        ▼
alivio inmediato  (refuerzo negativo, R−)
        │
        ▼
mantenimiento del patrón  (doble refuerzo: alivia a corto, confirma el peligro a largo)
```

Claves para las apps:

- El **alivio** es el motor: cada evitación «funciona» a corto plazo y por eso
  se repite; a largo plazo **confirma** que la señal era peligrosa y la hace
  más probable. Ese es el «doble refuerzo».
- Intervenir no es eliminar la señal, sino **romper el eslabón** de la
  evitación: poder quedarse (exposición) y poder reorientar la atención.

---

## 5. AIS · Atención Interna Sensorial

AIS es la práctica de **llevar la atención al cuerpo de forma sensorial y
amable**, sin convertirla en un nuevo control. No es relajación con la meta de
que la señal se vaya; es aprender a **sostener** lo que hay con curiosidad.

Elementos comunes a todas las herramientas AIS:

- **Silueta + luces (amarilla y azul).** Es el componente visual compartido
  (`app/js/respiro-ais.js`, figura `organism`). Representa la atención que
  recorre el cuerpo (amarilla) y el aire que entra y sale (azul). **Debe
  significar lo mismo en todas las apps**: no es decorativo, es el mapa de
  dónde está la atención.
- **Respiración curiosa.** Ritmo pausado con énfasis en la **exhalación larga**
  y una breve **ancla** tras la inspiración. Ritmo de referencia del
  ecosistema: inhalar ~4 s · anclar ~2 s · exhalar ~6 s · pausa ~1,5 s.
- **Postura de observador, no de controlador.** El lenguaje nunca promete que
  la sensación desaparezca; invita a **acompañarla**.

Dónde tiene sentido la silueta: respiración curiosa, momentos de sobresalto,
abrazo sentido, y cualquier punto donde la persona necesite volver al cuerpo.

---

## 6. El tercer tiempo: parar · respirar · reorientar

La secuencia completa de regulación tiene **tres** tiempos, no dos. El tercero
es el que suele faltar y el que sostiene el cambio:

1. **Parar** — cortar el encadenamiento (la rumiación, el impulso de evitar).
2. **Respirar** — AIS: volver al cuerpo con respiración curiosa.
3. **Reorientar** — **volver a algo**: una tarea, una estructura del día, un
   lugar. No basta con parar y respirar en el vacío; hay que tener **a dónde
   volver**.

Esto es lo que representa la **viñeta** de «parada de pensamiento»
(sobrepensamiento → parar → respirar con la silueta → reorientar a la tarea) y
por eso toda herramienta de regulación debería terminar **devolviendo a la
persona a su día**, no solo calmándola.

Implicación de diseño: las apps de regulación llevan un cierre tipo «ahora
vuelve a lo que estabas haciendo» / estructura diaria, no un final abierto.

---

## 7. Metáforas compartidas

Usar siempre las mismas, para que el paciente las reconozca entre apps:

- **El mono / el coche.** La mente que salta y acelera sola; no se pelea con
  ella, se conduce con suavidad.
- **La manada.** Los pensamientos o señales que llegan en grupo; se dejan
  pasar sin seguir a cada uno.
- **Las tres puertas.** Latencia, Densidad y Continuidad como tres puertas por
  las que se puede trabajar la relación con la señal.

Al introducir una metáfora nueva en una app, comprobar que **no contradice**
estas y, si encaja, añadirla aquí.

---

## 8. Lenguaje y límites (válido para todas las apps)

- **No prometer** la desaparición del síntoma; hablar de **relación** con él y
  de los tres parámetros.
- **Validar antes de proponer**: primero «tiene sentido que te pase», después
  la herramienta.
- **Evitación nombrada con amabilidad**: no es un fallo, es algo que «funcionó»
  y que ahora toca aflojar.
- **Seguridad primero**: ante señales de riesgo, la herramienta cede el paso al
  contacto con el profesional; ninguna app sustituye el acompañamiento clínico.
- **Privacidad**: los datos del paciente viven en su dispositivo
  (localStorage); nada sale a servidores. Las apps son PWA offline.

---

## 9. Checklist para una herramienta nueva

Antes de publicar una app o sección, comprobar que:

- [ ] Describe el malestar en términos de **L / D / C** (no de tener/no tener).
- [ ] Si toca regulación, incluye los **tres tiempos** (parar·respirar·**reorientar**).
- [ ] Si usa la silueta AIS, usa el **componente compartido** y el **ritmo de
      referencia**, y la silueta significa lo mismo que en el resto.
- [ ] El lenguaje **no promete** quitar el síntoma y **valida** antes de pedir.
- [ ] Respeta privacidad (datos en dispositivo) y **seguridad** (deriva ante
      riesgo).
- [ ] Reutiliza metáforas compartidas sin contradecirlas.
- [ ] Encaja con el estilo visual del ecosistema (fuentes del sistema por la
      CSP; sin dependencias externas bloqueadas).

---

## 10. Estado y procedencia

Esta guía recoge los principios **ya aplicados** en el ecosistema. El cuerpo
teórico completo (TEC) vive en el manuscrito del libro, fuera de este
repositorio; aquí solo se mantiene la **capa operativa** necesaria para la
coherencia del producto. Si se quiere afinar o ampliar algún punto con el
manuscrito definitivo, se actualiza este documento y, a partir de él, las apps.
