# Batería de juegos AIS · Propuesta de diseño

> Documento de diseño interno del ecosistema APRENS. Plantea una batería de
> juegos tipo arcade para entrenar, en niños y adultos, el **vector atencional
> interno** (Atención Interna Sensorial, AIS) de forma voluntaria, con
> biofeedback por sensores del móvil y feedback de puntuaciones.
> Se rige por `docs/TEC-guia-base.md`; si algo de aquí choca con esa guía,
> manda la guía.
>
> Estado: **propuesta** (2026-10-19). Nada de esto está implementado aún.

---

## 0. En una frase

Juegos cortos (2–5 min) en los que **el punto no se gana por hacer algo en la
pantalla, sino por llevar la atención hacia dentro, darse cuenta de que se ha
ido y volver**. La pantalla es la rampa; la sensación es el destino.

---

## 1. Qué entrenamos (y qué no)

| Entrenamos | No entrenamos |
|---|---|
| **Dirigir** el vector hacia dentro a voluntad (aparecer) | Relajarse o «sentir menos» |
| **Sostener** el trazo atencional sobre la señal (C↑) | Puntuar la calma o el «ya no lo noto» |
| **Darse cuenta** de la deriva y **volver** (meta-conciencia) | Ganar por reflejos hacia fuera |
| **Esperar** con la señal antes del impulso (L↑) | Suprimir o controlar la sensación |
| **Diferenciar** sensación de pensamiento (D↓) | Interpretar el «por qué» |

Cada juego declara su **parámetro principal** (L, D o C) y su **fase** del
Protocolo progresivo AIS (1 extero-corporal → 2 imagen ancla → 3 sin imagen →
4 afectiva → 5 contexto real).

### Sobre beta → alfa

Lo planteamos como **hipótesis de trabajo, no como resultado**: «la TEC
propone» que llevar el vector hacia dentro, con ojos cerrados, quietud y
respiración lenta, desplaza el estado de alerta orientada hacia fuera (perfil
más beta) hacia un estado de presencia receptiva (perfil más alfa). Las apps
**no miden EEG** y no lo prometen. Lo que sí hacemos:

1. **Diseñar las condiciones** que la literatura asocia a más alfa: ojos
   cerrados, menos estímulo visual, quietud corporal, respiración lenta.
   Por eso varios juegos tienen fase de **pantalla en negro** y se juegan
   con audio y vibración.
2. **Registrar proxies honestos** (quietud, ritmo respiratorio, variabilidad
   del pulso, autoinforme) y llamarlos por su nombre, nunca «ondas».
3. **Calibrar en consulta**: las sesiones del Protocolo ICE con EEG (% Beta)
   permiten comprobar, paciente a paciente, si los juegos acompañan el cambio.
   Esto es lo que algún día permitiría decir algo más; hasta entonces, no.

---

## 2. Principios de diseño (las reglas del juego)

1. **Cada vuelta cuenta.** Distraerse no resta. Darse cuenta y volver **suma**
   (es la repetición del músculo). El mensaje: «Te has ido y has vuelto: eso
   es entrenar».
2. **Se puntúa el gesto, nunca el estado.** Ningún juego da más puntos por
   estar más tranquilo o por que la sensación baje.
3. **Fuera → dentro.** Cada juego empieza con algo visible (rampa) y va
   retirando la pantalla hasta jugarse con ojos cerrados.
4. **Breve y frecuente.** Partidas de 2–5 min. Máximo de partidas al día por
   juego (p. ej. 3). La app no debe convertirse en otro enganche de pantalla.
5. **Siempre cierra con micro-acción con valor.** El «game over» no es volver
   a jugar: es «¿cuál es el siguiente paso con valor?» y soltar el móvil.
6. **Práctica programada, no contingente.** El progreso grande (el jardín, §5)
   crece con las tres paradas del día, también en calma, no con jugar mucho
   cuando hay alarma.
7. **Sin rankings competitivos.** Uno compite con su yo de la semana pasada.
   En modo familia se coopera, no se compite.
8. **Sentir, no interpretar.** Las preguntas del juego son «¿dónde?», «¿cuánto
   0–10?», «¿estabas dentro o pensando?», nunca «¿por qué?».
9. **Mismo lenguaje visual.** Atención = **amarillo**, aire = **azul** (figura
   `organism` de Respiro AIS). Las 3 anclas: cuello · pecho · barriga.
10. **Honestidad.** Índices orientativos, no diagnósticos. Ante riesgo, el
    juego cede el paso al profesional.

---

## 3. Capa de biofeedback (lo que el móvil puede medir de verdad)

Todo se procesa **en el dispositivo**; no se guarda audio ni vídeo, solo
números agregados. Sin dependencias externas (offline + RGPD).

| Señal | Sensor / API web | Qué estimamos | Parámetro | Fiabilidad |
|---|---|---|---|---|
| **Quietud corporal** | Acelerómetro / giroscopio (`DeviceMotionEvent`) | Micro-movimiento por segundo; segundos seguidos de quietud | C | Alta |
| **Respiración** | Móvil apoyado en la barriga (acelerómetro) o micrófono cerca de la nariz | Frecuencia respiratoria, ajuste al 4·2·6, exhalación larga | L | Media-alta (barriga) / media (micro) |
| **Pulso y VFC** | Cámara trasera + flash con la yema del dedo (fotopletismografía, PPG) | Frecuencia cardiaca, RMSSD, coherencia ~0,1 Hz | D (proxy) | Media; requiere dedo quieto |
| **Precisión interoceptiva** | PPG + toques del usuario | ¿Coinciden tus toques con tu latido sin mirarlo? | D | Media (la tarea es discutida como medida; válida como entrenamiento) |
| **Meta-conciencia** | Pantalla táctil | Toques «me he ido / he vuelto»; mantener pulsado «estoy dentro» | C | Alta (es conducta) |
| **Sondas de experiencia** | Vibración o tono + 3 botones | «¿Dónde estaba tu atención? Dentro · pensando · fuera» | C, D | Autoinforme |
| **Espera ante el impulso** | Pantalla táctil + temporizador | Segundos entre la señal tentadora y el toque | L | Alta |
| **Autoinforme** | Deslizador 0–10 | Ruido interno, nitidez de la señal, intensidad | D | Autoinforme |

**Ampliación opcional (fase 3 del proyecto):** diademas EEG de consumo vía
Web Bluetooth en consulta, solo para calibrar con el Protocolo ICE. Nunca
como requisito del paciente.

**Notas técnicas:** iOS pide permiso de movimiento con un gesto del usuario
(`DeviceMotionEvent.requestPermission`); la vibración no funciona en Safari
iOS (sustituir por tono suave); cámara y micrófono solo con permiso explícito
y explicación previa de que no se graba nada.

---

## 4. Sistema común de puntuación

Todos los juegos alimentan el mismo modelo para que el progreso se lea igual
en todas partes y llegue al Panel del Psicólogo vía `Aprens.save`.

### 4.1 Tres monedas, una por parámetro

| Moneda | Se gana cuando… | Parámetro |
|---|---|---|
| **Vueltas** (⟲) | te das cuenta de que te has ido y vuelves al ancla | C (meta-conciencia) |
| **Segundos dentro** (●) | sostienes el ancla: quietud + pulsado + sonda «dentro» | C |
| **Espera** (⧗) | aguantas con la señal antes de responder al impulso | L |
| **Nitidez** (◇) | distingues y nombras zona + intensidad 0–10 | D |

### 4.2 Feedback en tres capas

1. **Inmediato (durante):** luz amarilla que se intensifica en la zona del
   cuerpo, sonido que se aclara, vibración suave al «volver». Nunca un
   sonido de error por distraerse.
2. **De partida (al acabar):** tarjeta L·D·C con las monedas, la mejor racha
   de continuidad en segundos y una frase del autor («Respirar no es
   relajarte: es aparecer»). Siempre seguida de la micro-acción.
3. **Longitudinal:** curvas semanales de C (segundos de sostén), L (segundos
   de espera) y D (ruido 0–10). Referencias de la guía: C de 5–15 s al
   inicio a 60 s o más; L <5 s capturado · 5–15 s en desarrollo · >15 s
   integración.

### 4.3 Lo que el sistema evita a propósito

- Recompensa variable tipo tragaperras (cajas sorpresa, ruletas).
- Castigo por romper la racha: la racha «descansa», no se pierde.
- Más puntos por sesiones largas: hay techo diario.
- Cualquier métrica de «calma conseguida».

---

## 5. Meta-juego: **El jardín de las tres paradas**

Un jardín interno que **solo crece con práctica programada**: mañana,
mediodía y tarde/noche. Cada parada (cualquier juego o una parada sin juego)
riega una planta. Las monedas de los juegos se convierten en tipos de planta
(vueltas → raíces, segundos dentro → tallo, espera → flores, nitidez →
colores). Practicar solo en momentos de alarma riega menos que practicar en
calma (principio 6, sin explicarlo como castigo: «tu jardín crece con las
visitas tranquilas»).

- **Peques:** el jardín es de la manada; los animales aparecen al cuidar.
- **Adultos:** vista sobria con las curvas L·D·C detrás del jardín.

---

## 6. Catálogo de juegos

Ordenados por fase del Protocolo AIS. Para cada uno: mecánica arcade, gesto
AIS, parámetro, sensor y adaptación niño/adulto.

### Fase 1 · Extero-corporal (la imagen dirige)

#### 1. Faro interior
- **Mecánica:** silueta del cuerpo a oscuras. Una luciérnaga se enciende en
  una zona (cuello, pecho, barriga, manos, pies). El jugador lleva la
  atención allí y toca **«lo noto»** cuando llega. Cada nivel la luz dura
  menos y se ve más tenue, hasta que solo se anuncia con voz.
- **Gesto AIS:** localización sensorial focal (~10 s).
- **Parámetro:** L (tiempo de llegada) y D (claridad 0–10 al final).
- **Sensor:** táctil. **Feedback:** la zona se enciende en amarillo al marcarla.
- **Peques:** «buscar la luciérnaga escondida en la barriga del dragón».
- **Adultos:** ronda rápida de 60 s con 8 zonas, mejor tiempo medio de llegada.

#### 2. Simón interno
- **Mecánica:** el clásico Simón, pero las luces son las tres anclas. La app
  muestra una secuencia (barriga → pecho → cuello…) y el jugador la recorre
  **con la atención**, marcando cada llegada. La secuencia crece; en niveles
  altos se oye pero no se ve.
- **Gesto AIS:** movimiento voluntario del vector entre zonas (flexibilidad
  interna).
- **Parámetro:** C. **Sensor:** táctil + temporizador.
- **Peques:** el «ascensor del cuerpo» que sube y baja de planta.
- **Adultos:** modo contrarreloj con secuencias de hasta 8 zonas.

### Fase 2 · Interna con imagen ancla (la imagen es la puerta)

#### 3. Pesca con cebo
- **Mecánica:** el móvil se apoya en la barriga, tumbado. El acelerómetro
  detecta la respiración. «El aire es el cebo»: al inhalar baja el anzuelo
  hacia la zona; al exhalar largo, el pez sube. El pez solo pica si el ritmo
  se acerca al 4·2·6 y el cuerpo está quieto.
- **Gesto AIS:** Respirar del S·R·S·A, llevar el aire a la zona.
- **Parámetro:** L. **Sensor:** acelerómetro (biofeedback respiratorio real).
- **Peques:** peces de colores en un estanque; jugable con los ojos abiertos.
- **Adultos:** sin pantalla: solo tono que se afina al acercarse al ritmo.

#### 4. Globo de quietud
- **Mecánica:** un globo amarillo sube mientras el móvil (en la mano o en el
  pecho) está quieto y el jugador mantiene pulsado **«estoy dentro»**. Si
  suelta porque se ha ido, el globo se para (no cae) y al volver a pulsar
  suma una **vuelta**.
- **Gesto AIS:** Sostener; meta-conciencia de la deriva.
- **Parámetro:** C. **Sensor:** acelerómetro + táctil.
- **Peques:** el globo lleva a un animal de la manada de isla en isla.
- **Adultos:** altitud = segundos de sostén; récord personal semanal.

#### 5. Ola coherente
- **Mecánica:** dedo sobre la cámara (PPG). Un surfista en una ola cuya forma
  sigue la variabilidad del pulso. Respirando lento con atención en el pecho,
  la ola se vuelve regular y larga. Puntúan los segundos **siguiendo** el
  ritmo, no el estado final.
- **Gesto AIS:** Respirar + Sostener con señal fisiológica visible.
- **Parámetro:** D (proxy por coherencia) y C.
- **Sensor:** cámara + flash (PPG). **Es el juego más cercano a un
  biofeedback clásico.**
- **Peques:** a partir de ~8 años y con adulto al lado.
- **Adultos:** gráfica de coherencia por partida en el informe.

### Fase 3 · Sin imagen (de la puerta a la casa)

#### 6. Sonar
- **Mecánica:** pantalla negra, ojos cerrados. Se elige un ancla. A
  intervalos aleatorios suena un «ping» suave (o vibración) y aparecen tres
  zonas grandes de toque: **dentro · pensando · fuera**. Sin juicio: decir
  «pensando» con honestidad también da puntos (es darse cuenta) y vuelve al
  ancla.
- **Gesto AIS:** AIS sostenida 60–120 s con muestreo de experiencia.
- **Parámetro:** C (proporción «dentro») y meta-conciencia (vueltas).
- **Sensor:** ninguno obligatorio; opcional acelerómetro de quietud.
  **Juego base para el MVP: funciona en cualquier móvil.**
- **Peques:** un submarino en el fondo del mar que busca tesoros dentro.
- **Adultos:** sesiones de 3/5/7 min, % dentro por semana.

#### 7. Tambor del corazón
- **Mecánica:** con el dedo en la cámara, el jugador intenta **tocar al ritmo
  de su latido sin mirarlo ni tomarse el pulso**. La app compara los toques
  con el pulso real. Después se oculta todo y se repite.
- **Gesto AIS:** interocepción pura, Sentir del S·R·S·A.
- **Parámetro:** D (precisión interoceptiva).
- **Sensor:** cámara (PPG) + táctil.
- **Peques:** «el tambor del dragón dormido».
- **Adultos:** índice de precisión por semana.
- **Precaución:** en pánico o ansiedad por la salud, atender al latido puede
  activar. Solo con indicación del terapeuta (ver §8).

#### 8. Ruido y señal
- **Mecánica:** suena un paisaje sonoro que se va llenando (voces, tráfico,
  notificaciones). El jugador mantiene la atención en el ancla y cada 20 s
  marca «ruido interno 0–10» y «nitidez del ancla 0–10». Niveles con más
  ruido externo.
- **Gesto AIS:** diferenciar sensación de pensamiento y de estímulo.
- **Parámetro:** D. **Sensor:** autoinforme + quietud.
- **Adultos y adolescentes.** Peques: versión con 2 sonidos.

### Fase 4 · Afectiva (ser percibido sin hacer nada)

#### 9. Tormenta y refugio
- **Mecánica:** escenas breves graduadas (lluvia, un grito lejano, una frase
  típica del día: «otra vez tarde») generan una activación leve. El jugador
  la localiza («¿dónde lo notas?»), la acompaña con la frase honesta («No sé
  por qué, pero lo noto aquí») y el refugio se ilumina mientras la sostiene
  sin cambiarla. No gana quien la baja: gana quien se queda.
- **Gesto AIS:** S·R·S·A completo con activación real y segura.
- **Parámetro:** C y L.
- **Sensor:** táctil + autoinforme; opcional PPG.
- **Uso:** solo desbloqueado por el terapeuta, intensidades graduadas,
  botón de salida siempre visible (§8). Peques: con adulto.

#### 10. Respirar a dos (modo manada)
- **Mecánica:** cooperativo adulto-niño en un mismo móvil o en dos. Cada uno
  marca sus inhalaciones/exhalaciones; el barco avanza solo cuando las dos
  respiraciones se acompasan. El adulto aprende a regularse **primero**.
- **Gesto AIS:** co-regulación («el niño aprende a regularse porque el adulto
  se regula»).
- **Parámetro:** C compartido. **Sensor:** táctil (o acelerómetro en dos móviles).
- **Público:** familias, parejas, aula.

### Fase 5 · Contexto real (del cuerpo a la conducta)

#### 11. No toques el botón
- **Mecánica:** aparece un botón brillante y tentador, o notificaciones
  falsas tipo redes. El reto: **notar dónde aparecen las ganas en el cuerpo**,
  marcarlo en el mapa y aguantar. La barra de espera crece mientras se
  sostiene. Al final se elige: tocar o no tocar, y **ambas son válidas** si
  hubo espacio. Se puntúa la espera, no la abstinencia.
- **Gesto AIS:** latencia entre activación y respuesta.
- **Parámetro:** L (segundos de espera, con los umbrales de la guía).
- **Sensor:** táctil + temporizador.
- **Peques:** «el caramelo que espera» (tipo malvavisco), cuerpo del mono.
- **Adultos:** simulador de impulso del móvil; enlaza con las herramientas
  de control de pantalla.

#### 12. Parada relámpago
- **Mecánica:** no es un juego en pantalla: el móvil vibra 3 veces al día en
  momentos fijos. Parada de 60 s: STOP · ancla · frase · micro-acción. Si se
  hace, riega el jardín. Es el puente entre el juego y la vida real.
- **Parámetro:** C (por acumulación). **Sensor:** notificación + táctil.

---

## 7. Niños y adultos: misma mecánica, distinta piel

| Aspecto | Peques (6–11) | Adolescentes | Adultos |
|---|---|---|---|
| Narrativa | Manada, dragón, mono, luciérnagas | Misiones y récords propios | Sobria, datos visibles |
| Duración | 1–3 min | 2–4 min | 3–7 min |
| Pantalla | Más imagen, ojos abiertos al inicio | Mixta | Pronto a ojos cerrados |
| Voz guía | Cercana, frases cortas | Directa | Consignas del autor |
| Feedback | Animales, colores, sonidos | Barras y récords | Curvas L·D·C |
| Autoinforme | Caras o colores (3 niveles) | 0–10 | 0–10 |
| Adulto presente | Recomendado; modo manada | Opcional | No |

Mismo motor y mismas monedas: solo cambia la «piel» (`perfil: "peques" |
"adolescente" | "adulto"` en la configuración).

---

## 8. Seguridad clínica

- **Interocepción y pánico:** juegos con latido (5, 7) y activación (9) solo
  con indicación del terapeuta en pánico, ansiedad por la salud o trauma.
- **Primero aparecer, después permanecer:** el juego 9 se desbloquea cuando
  hay C estable en los juegos 4 y 6.
- **Salida siempre visible** y frase de cierre: «Puedes parar cuando quieras.
  Volver también es entrenar».
- **Sin destellos** (epilepsia fotosensible); transiciones suaves.
- **Ante riesgo**, la app muestra el contacto del profesional y no sigue.
- **Menores:** jugar con adulto en los juegos con cámara; nada se envía sin
  el código asignado por el psicólogo.

---

## 9. Arquitectura propuesta

- **Formato:** igual que el resto, HTML autocontenido en
  `app/tools-standalone/` con `aprens-core` incrustado, integrado en la app
  por iframe + puente al `aprens_db` único.
- **Un motor común** (`ais-juegos-motor.js`): sensores (quietud, respiración,
  PPG), monedas, sondas, tarjeta L·D·C y cierre con micro-acción. Cada juego
  es una «piel» sobre el motor.
- **Registro por partida** (`Aprens.save`):
  `{ date, juego, fase, perfil, duracion_s, vueltas, segundos_dentro,
  racha_max_s, espera_s, ruido_0_10, nitidez_0_10, pct_dentro,
  fc_media?, rmssd?, coherencia?, quietud_pct?, microaccion }`
  → mapeo TEC por juego (L, D o C).
- **Panel del Psicólogo:** curvas L·D·C por semana, adherencia a las tres
  paradas y, si hay sesiones ICE con EEG, cruce con el % Beta de consulta.

---

## 10. Hoja de ruta sugerida

| Paso | Contenido | Por qué primero |
|---|---|---|
| **MVP 1** | Motor común + **Sonar** (6) + **Globo de quietud** (4) + tarjeta L·D·C | Funcionan en cualquier móvil, sin cámara; cubren C y meta-conciencia |
| **MVP 2** | **Faro interior** (1) + **No toques el botón** (11) + jardín (§5) | Añade fase 1 (rampa) y L; cierra el ciclo con la vida real |
| **MVP 3** | **Pesca con cebo** (3) + **Ola coherente** (5) + **Tambor** (7) | Biofeedback fisiológico (acelerómetro respiratorio y PPG) |
| **MVP 4** | **Simón interno** (2), **Ruido y señal** (8), **Respirar a dos** (10), **Tormenta** (9) | Juegos más finos y los que requieren supervisión |
| **Validación** | Calibrar con Protocolo ICE (EEG) en consulta | Única vía para hablar de beta/alfa con honestidad |

---

## 11. Checklist por juego (antes de publicarlo)

- [ ] Declara fase AIS y parámetro principal (L, D o C).
- [ ] Distraerse no resta; volver suma.
- [ ] Ninguna puntuación premia la calma o la bajada de la sensación.
- [ ] Tiene tramo con ojos cerrados o pantalla en negro (salvo fase 1 peques).
- [ ] Termina en micro-acción con valor, no en «jugar otra vez».
- [ ] Techo diario de partidas.
- [ ] Sensores procesados en local, sin grabar audio ni vídeo.
- [ ] Piel peques/adolescente/adulto revisada.
- [ ] Textos al paciente pasados por la voz del autor.
- [ ] Registro por `Aprens.save` con mapeo TEC.
