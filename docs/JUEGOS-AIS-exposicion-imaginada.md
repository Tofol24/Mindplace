# Juegos AIS de exposición imaginada · Propuesta de diseño

> Segundo bloque de la batería de juegos AIS (el primero está en
> `docs/JUEGOS-AIS-propuesta.md`). Aquí los juegos parten de las tres viñetas
> compartidas del ecosistema:
>
> - `VinetaAtencion` («para · respira · vuelve», parada de pensamiento),
> - `VinetaAbrazo` (abrazo sentido),
> - `VinetaHonestidad` («no sé por qué», la campana de Pavlov),
>
> y las convierten en **exposición por imaginación jugable**. La escena
> imaginada genera una activación emocional real y graduada, y el juego
> entrena a responderla desde la TEC en lugar de rumiar, evitar o alejarse de
> los vínculos.
>
> Se rige por `docs/TEC-guia-base.md`. Estado: **propuesta** (2026-10-19).

---

## 0. En una frase

La escena hace sonar la campana. El juego no gana cuando la campana se
calla. Gana cuando suena y tú no vas a por el «¿por qué?», te quedas en el
cuerpo, lo dices con honestidad y das el paso con valor, sin alejarte de los
tuyos. Repetido muchas veces, la campana vuelve a ser solo un sonido.

---

## 1. El marco: por qué la campana deja de ser estímulo condicionado

### 1.1 Lo que pasa (cadena funcional, guía §5)

```
escena / recuerdo / mensaje         ← la campana (estímulo que activa)
        ▼
activación en el cuerpo
        ▼
«¿por qué?» · rumiar · explicar     ← la respuesta
        ▼
alivio un momento (R−)              ← la «comida» que mantiene el ciclo
        ▼
la campana suena más fuerte la próxima vez
```

Aquí se mezclan dos aprendizajes, y conviene nombrarlos con precisión:

- **Clásico (Pavlov):** la escena, o la sensación que deja, queda marcada
  como amenaza. Por eso suena sola, aunque no pase nada.
- **Operante:** buscar el porqué, rumiar o evitar alivia un momento y por
  eso se repite. Es la «comida» de la campana.

### 1.2 Lo que hace el juego

| Mecanismo | En el juego | Gesto TEC |
|---|---|---|
| **Extinción** | La campana suena muchas veces sin que llegue la «comida» (no se rumia, no se evita) | STOP |
| **Prevención de respuesta** | Las burbujas del «¿por qué?» aparecen y tientan, pero el punto está en no tocarlas | Latencia (L↑) |
| **Contracondicionamiento** | Mientras la campana suena, la atención está en el cuerpo, acompañando: la señal se asocia a «no estoy solo con esto» | S·R·S·A (C↑) |
| **Violación de expectativa** | Antes de la escena: «¿cuánto crees que te va a activar? ¿cuánto crees que podrás quedarte?». Después se compara con lo que ha pasado | Aprendizaje inhibitorio |
| **Generalización** | La misma campana en otros contextos (otras puertas, otras personas) | Fase 5 · contexto real |

Lo que la ciencia de la extinción enseña y el juego debe respetar:

- La extinción **no borra** la asociación antigua: aprende una nueva que
  compite con ella. Por eso la campana **puede volver a sonar** otro día
  (recuperación espontánea) o en otro lugar (renovación). El juego lo dice
  claramente: **no es una recaída, es como funciona el aprendizaje. Se vuelve
  a practicar.**
- No hace falta que la activación baje para que haya aprendizaje. El
  criterio de fin no es «hasta que se calme», sino el **criterio funcional de
  la guía**: poder responder a «¿cuál es el siguiente paso con valor?».

Formulación para las apps: «la TEC propone», nunca «está demostrado».

---

## 2. Principios específicos de estos juegos

1. **Primero aparecer, después permanecer** (guía §7). Estos juegos solo se
   desbloquean cuando hay práctica programada y continuidad estable en los
   juegos del bloque 1 (Sonar, Globo) o lo decide el terapeuta. Invertir el
   orden enseña «he vuelto a estar solo con esto».
2. **Permanecer, no aguantar.** El vector va **hacia** la sensación, no hacia
   que desaparezca. Ninguna puntuación premia que la activación baje.
3. **Activación graduada y elegida.** Escalera personal de 5 escenas (1 leve
   → 5 difícil). Nunca se empieza por arriba.
4. **El dolor nos hace cómplices.** En las escenas con vínculos, el
   resultado que se ve no es «estar tranquilo», sino **cuánto se acercan los
   tuyos**. Alejarse es la respuesta automática que el juego hace visible.
5. **Sentir antes que explicar.** El «no sé por qué» aparece en todas las
   escenas. Si la causa es evidente, se usa la variante de la viñeta: «Sé que
   lo ocurrido me ha afectado, pero antes quiero reconocer que noto esto
   aquí».
6. **Siempre se cierra con una micro-acción con valor real**, fuera de la
   pantalla.
7. **Una sesión de exposición al día** (máximo 3 ensayos de la misma escena,
   unos 20 min). Es trabajo de verdad, no un pasatiempo.

---

## 3. Motor común: el «ensayo de escena»

Todos los juegos de este bloque comparten la misma estructura de ensayo, para
que los datos sean comparables y el terapeuta los lea igual.

| Paso | Qué pasa en pantalla | Qué se registra |
|---|---|---|
| **0 · Expectativa** | «¿Cuánto crees que te va a activar (0–10)? ¿Cuánto crees que podrás quedarte?» | `exp_activacion`, `exp_quedarme` |
| **1 · Entrada** | Respiración curiosa breve (1–3 respiraciones 4·2·6) con la silueta AIS | — |
| **2 · Escena** | Viñeta animada + narración con la voz del dispositivo, que se construye por capas: dónde estás, qué ves, qué oyes, qué dice la otra persona, qué notas. Se puede usar un texto propio escrito en consulta | `escena_id`, `nivel` |
| **3 · Pico** | «¿Dónde lo notas? ¿Cuánto, de 0 a 10?» en el mapa corporal | `act_pico`, `zona` |
| **4 · Respuesta** | La mecánica propia de cada juego (§4) con la escena aún presente | `latencia_captura_s`, `sostén_s`, `porques_tocados`, `elecciones` |
| **5 · Frase honesta** | Elegir o decir en voz alta: «No sé por qué, pero noto esto aquí» | `frase` |
| **6 · Después** | «¿Cuánto ahora (0–10)? ¿Ha sido como esperabas?» | `act_post`, `violacion_expectativa` |
| **7 · Paso con valor** | Micro-acción real, fuera de la pantalla | `microaccion` |

**Índice «fuerza de la campana»** (por escena y ensayo, orientativo):
combina lo rápido que el «¿por qué?» captura la atención (latencia de
captura), el tiempo que se queda capturada y las burbujas tocadas. La gráfica
que interesa al terapeuta y al paciente es esta: **la misma escena, ensayo a
ensayo, con la campana perdiendo fuerza**, sin exigir que la activación sea
cero.

**Alarmas automáticas** (guía §12):

- Activación post > pre con sostén bajo → exposición sin sostén. La app
  **baja un escalón** y sugiere hablarlo en consulta.
- «No he notado nada» repetido → posible disociación. Se pasa a anclajes
  periféricos (pies en el suelo, manos) antes que viscerales.
- Practicar solo cuando hay malestar → se reinstaura la práctica programada
  del bloque 1.

---

## 4. Catálogo de juegos

### 4.1 El laboratorio de Pavlov (psicoeducación jugable)

*Base: panel 1 de `VinetaHonestidad`. Para todos, especialmente peques.*

- **Mecánica:** el jugador hace de experimentador con un perro (o con el mono,
  en la versión peques).
  1. Toca la campana y da comida: el perro saliva.
  2. Toca solo la campana: el perro saliva igual (**condicionamiento**).
  3. Toca la campana muchas veces sin comida, con el perro acompañado: la
     saliva baja ensayo a ensayo (**extinción**). Se ve la curva.
  4. Al día siguiente la campana vuelve a provocar un poco
     (**recuperación espontánea**). Mensaje: «No es volver a empezar. Es
     normal: se practica otra vez y baja antes».
- **Traducción a tu vida:** «¿Cuál es tu campana?». Opciones: un «¿por
  qué?», un mensaje sin respuesta, una cara seria, una presión en el pecho,
  una fecha... Y **tu comida**: explicar, revisar, evitar, discutir...
- **Gesto que entrena:** entender que **explicar es la comida**. Sin esto,
  el resto de juegos no se entiende.
- **Duración:** 3 min. Sin activación emocional. Abre el bloque.

### 4.2 La campana (honestidad emocional)

*Base: `VinetaHonestidad` completa (5 paneles).*

- **Escena:** situaciones afectivas graduadas, por ejemplo un mensaje
  importante sin respuesta, un comentario seco de la pareja o de un
  compañero, «otra vez llegas tarde», una crítica en el trabajo. O una escena
  propia.
- **Mecánica:** en el momento de pico suena la campana y empiezan a salir
  **burbujas del «¿por qué?»** con explicaciones tentadoras («seguro que está
  enfadado», «es que yo siempre...», «si hubiera...»).
  - **Si tocas una burbuja** (vas a por el porqué): hay un pequeño destello de
    alivio y la campana **crece** y vuelve a sonar más fuerte. El R− se ve.
  - **Si mantienes pulsada la barriga** y eliges la frase honesta («No sé por
    qué, pero noto una sensación aquí»): las burbujas pasan de largo sin
    tocarlas, la campana pierde color y sonido poco a poco y la escena **se
    abre**. Aparecen elementos periféricos (el gesto de la otra persona, el
    café, la luz): el panel 5 de la viñeta, «la atención se abre».
- **Puntuación:** campanas que sonaron sin ir a por el porqué (ensayos de
  extinción), segundos de sostén con la escena presente, latencia de
  captura (L) y fuerza de la campana por escena a lo largo de los ensayos.
- **Variante «compartirlo»:** al final, elegir a quién se lo dirías («…y
  quería compartirlo contigo»). La seguridad no depende de cómo responda el
  otro.
- **Peques:** «El mono y la campana». El mono quiere correr a buscar
  explicaciones; tú lo acompañas a la barriga y la campana se vuelve
  pequeñita.

### 4.3 El carrusel (parada de pensamiento ante la rumiación)

*Base: `VinetaAtencion` («para · respira · vuelve»).*

- **Escena:** un tema rumiativo personal (la conversación de ayer, una
  preocupación de salud, una decisión pendiente) narrado con palabras clave
  que el paciente escribe en consulta.
- **Mecánica:** los pensamientos llegan como vagones de un carrusel que gira
  más rápido cuanto más rato estás subido. La luz amarilla (atención) se va
  al carrusel y la silueta del cuerpo se apaga (panel 1).
  1. **Darse cuenta:** tocas **STOP** cuando notas que estás subido. El dato
     clave es cuánto tardas (latencia de darse cuenta).
  2. **Para:** sueltas el carrusel sin discutir con él. No hay que vencer
     ningún pensamiento.
  3. **Respira:** 4–5 s de anclaje con el orbe 4·2·6, «aunque no sientas
     nada».
  4. **Vuelve:** eliges a qué vuelves (micro-acción). El carrusel no se para
     porque los pensamientos desaparezcan, sino porque **tú te has bajado**.
- **Opción espacio-tiempo de preocupaciones:** arrastrar un vagón a la caja
  «lo dejo para mi espacio de las 19 h». El pensamiento queda guardado, no
  combatido.
- **Puntuación:** latencia de darse cuenta (debería acortarse), bajadas del
  carrusel y tiempo en el cuerpo antes de volver.
- **Peques:** el tiovivo del mono. Cuando dices STOP, el mono baja de un
  salto y te da la mano.

### 4.4 Llegar a casa (abrazo sentido: cómplices del dolor)

*Base: `VinetaAbrazo` (4 paneles).*

- **Escena:** llegas a casa después de algo doloroso: una mala noticia, una
  discusión, una pérdida, un día de dolor físico. Dentro te esperan los tuyos
  (siluetas configurables: pareja, hijos, madre o padre, amigos, mascota).
- **Mecánica:**
  1. **Ante la puerta** (ritual de entrada): respiración curiosa. ¿Dónde lo
     traigo? ¿Tiene bordes? ¿Cambia cuando lo miro?
  2. **Entrar.** Aparecen las tentaciones automáticas: «poner cara de que no
     pasa nada», «encerrarme en el móvil», «soltarlo con un grito», «irme a la
     habitación». Cada una **aleja a las figuras** y oscurece la sala: la
     distancia emocional se ve.
  3. **El camino TEC:** mantener la atención en la barriga mientras te
     acercas y arrastrar tu figura hasta un abrazo **sin soltar el ancla**.
     El dolor se dibuja como una luz cálida pequeña **que la manada rodea**,
     no como un muro entre vosotros (panel 4).
  4. **Frase honesta en la mesa:** «No sé por qué, pero hoy noto esto aquí».
     Y la respuesta de la manada: «Entiendo que te sientas así, gracias por
     compartirlo».
- **Puntuación:** cercanía final de los vínculos, segundos de abrazo con la
  atención dentro y si se compartió la frase honesta. **No** se puntúa
  cuánto dolor queda.
- **Modo Co-AIS** (pareja o familia, en un móvil o en dos): pausa vincular
  («Noto que estoy activado»), anclaje de 5–10 s cada uno, frase honesta y
  micro-acción vincular (escuchar, acercarse, preguntar). En familias con
  peques juega primero el adulto (guía §11: el niño se regula viendo al
  adulto regularse).

### 4.5 Puertas (respiración curiosa en cada entrada y salida)

*Base: herramienta nuclear 5 (rituales de entrada) y respiración curiosa.*

- **Mapa del día con puertas:** casa, trabajo, cole, consulta, hospital,
  reunión, coche, cena familiar, la puerta del dormitorio por la noche.
- **Modo imaginado (ensayo):** se elige la puerta difícil de mañana y se
  ensaya. Antes de entrar, respiración curiosa con las tres preguntas de la
  guía (¿dónde está exactamente?, ¿tiene bordes?, ¿cambia cuando la miras?).
  Al salir, **ritual de salida**: ¿qué me llevo? Lo noto y lo dejo en la
  puerta antes de entrar en la siguiente.
- **Modo real (fase 5):** recordatorios en las horas reales de las
  transiciones y un registro 0/1 al final del día («¿he cruzado esta puerta
  con presencia?»).
- **Generalización:** la misma campana de §4.2 vuelve a aparecer en otras
  puertas (renovación). Se entrena que lo aprendido viaje de un contexto a
  otro.
- **Puntuación:** puertas cruzadas con presencia; el mapa del día se va
  iluminando. Enlaza con `escalera_exposicion` y `salidas_paso_a_paso`.

---

## 5. La escalera personal de escenas

- **Plantillas por tema:** rechazo o crítica, conflicto de pareja, pérdida o
  duelo, salud y cuerpo, soledad, culpa, trabajo, separación (peques: cole,
  hermanos, despedidas).
- **Escena propia:** en consulta, terapeuta y paciente escriben 5 escenas
  graduadas con palabras clave sensoriales. La app las guarda solo en el
  dispositivo.
- **Desbloqueo por el terapeuta:** cada tema se activa con un código del
  psicólogo, como el `pacienteCodigo` actual. Los temas sensibles (duelo,
  trauma) no se abren solos.
- **Cuándo subir de escalón:** cuando en esa escena hay sostén de 30 s o
  más, se puede responder la micro-acción y la fuerza de la campana baja en
  dos ensayos seguidos. **No** se exige que la activación llegue a cero.

---

## 6. Seguridad clínica

- **Contraindicado sin terapeuta presente:** TEPT con reexperimentación
  activa, duelo agudo reciente, riesgo autolítico, psicosis o fase maníaca
  (guía §11). En estos casos el bloque no se desbloquea.
- **Botón «Necesito parar» siempre visible.** Lleva a un anclaje periférico
  (pies en el suelo, manos, mirar alrededor y nombrar tres cosas), a la
  frase «Puedes parar cuando quieras. Volver también es entrenar» y, si se
  repite, al contacto del profesional.
- **Narración sin detalles explícitos** de violencia o accidentes. La escena
  activa por el significado (rechazo, pérdida, soledad), no por el impacto.
- **Peques:** escenas cotidianas leves, siempre con un adulto al lado y la
  versión de cuento.
- **Registro de alarmas** visible en el panel del psicólogo (§3).

---

## 7. Datos para el panel

Por ensayo, vía `Aprens.save` en `toolId: "juegos_ais"` (mismo bucket que el
bloque 1) con `bloque: "exposicion"`:

```
{ date, juego, escena_id, tema, nivel, perfil,
  exp_activacion, exp_quedarme, act_pico, act_post, zona,
  latencia_captura_s, sostén_s, porques_tocados, campanas_sin_porque,
  fuerza_campana, cercania_final, frase_honesta, violacion_expectativa,
  alarma: null | "post>pre" | "no_noto" | "solo_malestar",
  microaccion, tec: "L" | "C" }
```

Gráficas útiles: **fuerza de la campana por escena** (ensayo a ensayo),
latencia de darse cuenta en el carrusel, cercanía en Llegar a casa y puertas
cruzadas con presencia por semana.

---

## 8. Hoja de ruta sugerida

| Paso | Contenido | Por qué |
|---|---|---|
| **A** | Laboratorio de Pavlov + **La campana** con 3 escenas plantilla + motor de ensayo | Es el núcleo conceptual (EC, R−, extinción) y reutiliza la viñeta de honestidad |
| **B** | **El carrusel** con palabras clave propias | Rumiación: la demanda clínica más frecuente |
| **C** | **Llegar a casa** + modo Co-AIS | Vínculos: cómplices del dolor |
| **D** | **Puertas** con modo real y recordatorios | Generalización y fase 5 |
| **E** | Escenas propias desde consulta y desbloqueo por código | Personalización segura |

---

## 9. Checklist por juego

- [ ] Se desbloquea después del bloque 1 o por el terapeuta.
- [ ] Tiene expectativa previa y comparación posterior.
- [ ] La escena activa por el significado, sin detalles explícitos.
- [ ] Ninguna puntuación premia que la activación baje.
- [ ] Ir a por el «¿por qué?» o evitar se ve como alivio breve que hace crecer la campana, nunca como un fallo.
- [ ] Frase honesta presente.
- [ ] Botón «Necesito parar» siempre visible.
- [ ] Cierra con micro-acción con valor.
- [ ] Alarmas de la guía registradas.
- [ ] Textos al paciente pasados por la voz del autor.
