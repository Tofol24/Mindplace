# APRENS · «Los cuentos de Nil» — PACK DE PRODUCCIÓN · 99 másters 1:1 (+ cubierta)

Referencia visual **congelada**: `COVER-ART-DIRECTION.md` (NIL VISUAL BIBLE · V1). No reinterpretar estilo/Nil/ventana: solo ejecutar.

## Cómo generar cada imagen
Cada prompt = **BLOQUE FIJO** (Biblia) + **ESCENA de la página** (una línea de abajo) + **densidad de ventana según el estado** (tabla siguiente) + **NEGATIVO** (Biblia).
- **AR 1:1**, ≥3000×3000 px, sRGB, a sangre, **sin texto**.
- Refs: **Nil `9afb9b78`** siempre; **madre `18c0febc`** cuando aparezca; el **monitor** de C3·p10 y el **profesor** de C2·p03 son adultos genéricos distintos de la madre.
- Nicho de ventana: **misma silueta/tamaño/posición** que la tanda final (top-right).

## Escala de densidad de la ventana (variable PRINCIPAL = espacio)
| Estado | Interior del nicho |
|---|---|
| 🟢 verde | **1–2** objetos suaves separados; muchísimo aire |
| 🟡 amarillo | **~3** objetos; todavía bastante aire |
| 🟠 naranja | **4–5** objetos próximos; poco aire |
| 🔴 rojo | **5–6** objetos apretados; casi sin aire (ordenados, sin caos) |
| 🔵 azul (puro) | **2–3** objetos; vuelve el aire, pero **algo menos** que un 🟢 pleno; leve «resaca» de cansancio |
| Transición X→Y | densidad **estrictamente intermedia** entre ambos |

**Estados mixtos / especiales (convención fija):**
| Caso | Interior del nicho |
|---|---|
| 🟢🔵 (cierres) | azul-salvia **muy suave**, **2** objetos, **bastante aire**: integración/serenidad, **no** «recuperación dramática» |
| 🟢/🟡 (C7·p11) | **2–3** objetos con **bastante aire**, tonalidad **salvia ligeramente cálida** |
| 🟢 (poco margen) — **c2-p01** | verde pero **ya algo cargado**: **2–3** objetos, todavía con aire (Nil empieza el día con **menos reserva**) |

Color solo acompaña (salvia→coral→azul). **Objetos = formas abstractas que ocupan espacio, NUNCA símbolos causales.** **Test de grises por tanda**: sin color, la ocupación aún debe leer mucho→poco→recuperándose.

### Salvaguardas de ejecución (vigilar en cada tanda; se degradan al producir en serie)
1. **Geometría exacta del nicho** (silueta/tamaño/posición top-right) idéntica en las 99.
2. **Edad de Nil** estable (≈10–11); usar `c1-p01` como ancla anti-deriva.
3. **Mapas sin texto legible** nunca (solo líneas/marcas abstractas).
4. **Páginas de cierre**: conservar **zona tranquila** suficiente para la tipografía.

## Nomenclatura y entrega
`art/cover-front.png` · `art/cX-pNN.png` (NN 01…última de cada cuento). Al dejarlos en `art/`, el generador de interior/cubierta los coloca solo (drop-in). Validar **tanda a tanda** (un cuento por tanda) con el test de grises antes de seguir.

---

## CUBIERTA
- **cover-front** · 🟢 · Nil en el suelo construyendo su gran red ferroviaria; mundo rico; líneas que guían la mirada a Nil y a la ventana; tercio inferior calmado. *(ya generada en la tanda final)*

## CUENTO 1 · No era así como tenía que pasar (15)
| id | estado | escena (1 línea) | refs |
|---|---|---|---|
| c1-p01 | 🟢 | Nil con sus mapas, ilusión *(portada)* | Nil |
| c1-p02 | 🟢 | en la puerta, chaqueta+mochila, mira el reloj | Nil |
| c1-p03 | 🟡 | la madre al teléfono, apurada; sonrisa que se congela; lluvia | Nil+madre |
| c1-p04 | 🟡 | Nil señala el calendario, insiste con calma | Nil+madre |
| c1-p05 | 🟡→🟠 | repite enseñando un mapa; manos que se tensan | Nil |
| c1-p06 | 🟠 | la madre explica con muchas palabras (formas pálidas) | Nil+madre |
| c1-p07 | 🟠 | primer plano: puños, hombros, mandíbula, mirada estrecha | Nil |
| c1-p08 | 🟠→🔴 | manos hacia los oídos, una sola idea; la madre se da cuenta | Nil+madre |
| c1-p09 | 🔴 | recogido; playa de vías mental; ventana llena | Nil |
| c1-p10 | 🔴 | la madre se sienta cerca sin tocar | Nil+madre |
| c1-p11 | 🔴 | «Estoy aquí»; hombros que aflojan mínimamente | Nil+madre |
| c1-p12 | 🔵 | baja las manos, mirada se ensancha | Nil |
| c1-p13 | 🔵 | con sus mapas (refugio); madre a distancia sin preguntar | Nil+madre |
| c1-p14 | 🔵→🟢 | descubrimiento: se señala la barriga; madre escucha | Nil+madre |
| c1-p15 | 🟢🔵 | *cierre* sereno con sus mapas (aire para el texto) | Nil |

## CUENTO 2 · Hoy todo pesaba más (16)
| id | estado | escena | refs |
|---|---|---|---|
| c2-p01 | 🟢(poco margen) | despierta pronto, cansancio leve *(portada)* | Nil |
| c2-p02 | 🟡 | aula ruidosa, hombros encogidos | Nil |
| c2-p03 | 🟡 | cambio en la pizarra (abstracta); profesor ≠ madre | Nil+profesor |
| c2-p04 | 🟡→🟠 | varios niños a la vez, sonrisa tensa | Nil |
| c2-p05 | 🟠 | molestias físicas (hambre/calor/etiqueta) | Nil |
| c2-p06 | 🟠 | doble lectura: cara neutra / ventana casi llena | Nil |
| c2-p07 | 🟠→🔴 | tienda/calle: gente, luz, voces; pegado a la madre | Nil+madre |
| c2-p08 | 🔴 | «hay que irnos ya»; se planta *(madre serena, sin dedo)* | Nil+madre |
| c2-p09 | 🔴 | desbordamiento en público, agachado; gente sobria | Nil+madre |
| c2-p10 | 🔴 | la madre «ve» la acumulación (cúmulo de formas) | Nil+madre |
| c2-p11 | 🔴 | foco madre: PARO (mejillas, prisa); su ventanita | Nil+madre |
| c2-p12 | 🔴 | la madre se orienta a Nil, sin sujetar | Nil+madre |
| c2-p13 | 🔴→🔵 | pone a disposición sitio tranquilo; se mueven si Nil elige | Nil+madre |
| c2-p14 | 🔵 | apoyo voluntario, cansado; azul vaciándose | Nil+madre |
| c2-p15 | 🟢 | en casa, descubrimiento; evocación de lo acumulado | Nil+madre |
| c2-p16 | 🟢🔵 | *cierre* sereno en casa (aire para el texto) | Nil |

## CUENTO 3 · No salió como yo pensaba (14)
| id | estado | escena | refs |
|---|---|---|---|
| c3-p01 | 🟢 | llega al parque con su mapa, ilusión *(portada)* | Nil |
| c3-p02 | 🟢→🟡 | viñeta imaginada del plan ideal | Nil |
| c3-p03 | 🟡 | los otros cambian de juego; sonrisa que vacila | Nil |
| c3-p04 | 🟡→🟠 | argumenta con su mapa | Nil |
| c3-p05 | 🟠 | manos apretadas; voces amplificadas | Nil |
| c3-p06 | 🟠 | eligen a otro; un paso atrás | Nil |
| c3-p07 | 🟠→🔴 | rígido, mapa al pecho, nube oscura de pensamientos | Nil |
| c3-p08 | 🟠 | pivote: mira sus propias manos (una pista) | Nil |
| c3-p09 | 🟠 | pide «un momento» como puede | Nil |
| c3-p10 | 🟠→🔵 | monitor (adulto distinto) ofrece explicar sin empujar | Nil+monitor |
| c3-p11 | 🔵 | refugio en su mapa; nadie le mete prisa | Nil |
| c3-p12 | 🔵→🟢 | recupera y elige: acercarse/observar o no volver | Nil |
| c3-p13 | 🟢 | descubrimiento: sentir mucho y pedir un momento caben | Nil |
| c3-p14 | 🟢🔵 | *cierre* sereno con su mapa, otros al fondo (aire para el texto) | Nil |

## CUENTO 4 · Un poco más (14)
| id | estado | escena | refs |
|---|---|---|---|
| c4-p01 | 🟢 | absorto y feliz dibujando su mapa *(portada)* | Nil |
| c4-p02 | 🟢 | primer plano del mapa casi acabado; muy concentrado | Nil |
| c4-p03 | 🟡 | la madre asoma llamando a cenar; apenas levanta la vista | Nil+madre |
| c4-p04 | 🟡 | sigue dibujando sin mirar, cuerpo tranquilo | Nil |
| c4-p05 | 🟡→🟠 | la madre más cerca; los dedos se tensan sobre el mapa | Nil+madre |
| c4-p06 | 🟠 | metáfora cálido→frío (sutil, poética); encogido sobre el mapa | Nil |
| c4-p07 | 🟠 | AIS: manos duras, mirada baja, todo de fuera molesta | Nil |
| c4-p08 | 🟠→🔴 | se aferra al mapa, ojos llorosos *(nunca rabieta)* | Nil |
| c4-p09 | 🔴 | bloqueado sobre el mapa; sin sitio | Nil |
| c4-p10 | 🔴 | la madre deja de empujar; se agacha, sin arrancar el mapa | Nil+madre |
| c4-p11 | 🔴→🔵 | ofrece el puente: guardar aquí, seguir al volver | Nil+madre |
| c4-p12 | 🔵 | el mapa guardado a salvo; Nil se afloja | Nil |
| c4-p13 | 🟢 | momento tranquilo; formula su hallazgo; madre escucha | Nil+madre |
| c4-p14 | 🟢🔵 | *cierre* sereno junto al mapa guardado (aire para el texto) | Nil |

## CUENTO 5 · Hoy lo noté a tiempo (13) · sin 🔴
| id | estado | escena | refs |
|---|---|---|---|
| c5-p01 | 🟢 | mañana tranquila, sereno *(portada)* | Nil |
| c5-p02 | 🟡 | bus/patio con estímulos; aguanta | Nil |
| c5-p03 | 🟡 | una actividad cambia sin avisar; lo nota | Nil |
| c5-p04 | 🟠 | primer plano interior: mira sus manos, el ruido molesta más | Nil |
| c5-p05 | 🟠 | se queda con la pista (interocepción→necesidad), silencioso | Nil |
| c5-p06 | 🟠 | pide bajito salir un momento; adulto genérico disponible | Nil+adulto |
| c5-p07 | 🟠→🔵 | rincón tranquilo, menos estímulos, con su mapa | Nil |
| c5-p08 | 🔵 | algo más suelto — «no genial, solo un poco mejor» | Nil |
| c5-p09 | 🟢 | con sitio, el día sigue; una cosa sale bien | Nil |
| c5-p10 | 🟢 | satisfacción tranquila, sin euforia | Nil |
| c5-p11 | 🟢 | **PROTEGIDA**: solo Nil tranquilo siendo Nil (ni fracaso ni recuerdo) | Nil |
| c5-p12 | 🟢 | la madre valida sin premiar en exceso | Nil+madre |
| c5-p13 | 🟢🔵 | *cierre* sereno (aire para el texto) | Nil |

## CUENTO 6 · Una raya torcida (14)
| id | estado | escena | refs |
|---|---|---|---|
| c6-p01 | 🟢 | dibujando «el mejor mapa» con esmero *(portada)* | Nil |
| c6-p02 | 🟢 | viñeta de su expectativa: el mapa perfecto | Nil |
| c6-p03 | 🟡 | el lápiz se va: una raya torcida; se queda quieto | Nil |
| c6-p04 | 🟡→🟠 | la raya se hace enorme en su percepción *(encuadre estrechándose)* | Nil |
| c6-p05 | 🟠 | tenso, mirando solo el fallo | Nil |
| c6-p06 | 🟠 | manos que aprietan el papel: **impulso contenido**, no destrucción | Nil |
| c6-p07 | 🟠→🔴 | aparta/arruga el mapa de un gesto | Nil |
| c6-p08 | 🔴 | cerrado; el mapa arrugado a un lado; **solo ve la raya** *(encuadre mínimo)* | Nil |
| c6-p09 | 🔴 | la madre no arregla ni dice «no pasa nada»; valida el deseo | Nil+madre |
| c6-p10 | 🔴→🔵 | se queda cerca, no arregla, espera | Nil+madre |
| c6-p11 | 🔵 | queda un poco de sitio; el mapa aún ahí | Nil |
| c6-p12 | 🟢 | vuelve a mirar: la raya sigue **pero ve el mapa entero** *(encuadre amplio; paralelo a p08)* | Nil |
| c6-p13 | 🟢 | a su ritmo elige: dejarla, corregirla o transformarla | Nil |
| c6-p14 | 🟢🔵 | *cierre* sereno con su mapa (aire para el texto) | Nil |

## CUENTO 7 · Antes de algo nuevo (13)
| id | estado | escena | refs |
|---|---|---|---|
| c7-p01 | 🟢 | casa tranquila; la madre da la noticia; se queda quieto | Nil+madre |
| c7-p02 | 🟡 | callado, pensativo | Nil |
| c7-p03 | 🟡 | preguntas que se acumulan (formas abstractas, sin texto) | Nil |
| c7-p04 | 🟠 | en la cama, ojos abiertos, pensamientos girando | Nil |
| c7-p05 | 🟠 | AIS: barriga dura, insomnio | Nil |
| c7-p06 | 🟠 | se cierra («no quiero ir»), no capricho | Nil |
| c7-p07 | 🟠 | la madre presente, sin minimizar | Nil+madre |
| c7-p08 | 🟠→🔵 | mapa de «lo que sí sabemos» como estaciones, con **huecos deliberados** | Nil+madre |
| c7-p09 | 🔵 | mira el mapa con sus huecos; nervioso, pero un poco menos | Nil |
| c7-p10 | 🔵 | la madre señala los huecos con **mano relajada** *(no dedo docente)* | Nil+madre |
| c7-p11 | 🟢/🟡 | llega el lunes; realista (ni idílico ni catastrófico) | Nil |
| c7-p12 | 🟢 | formula su hallazgo, sereno | Nil |
| c7-p13 | 🟢🔵 | *cierre* sereno con su mapa de huecos (aire para el texto) | Nil |

---

## Notas de páginas delicadas (recordatorio, ya congeladas)
- **C4·p08** ojos llorosos, nunca rabieta. **C4·p10–11** madre acompaña sin retirar el límite.
- **C5·p11** PROTEGIDA (no examen). **C6·p06** impulso contenido; **p09** validar sin arreglar; **p08↔p12** paralelismo de encuadre.
- **C7·p08/p10** huecos deliberados; mano relajada.
- **Ventana**: densidad = espacio (test de grises); objetos abstractos, no símbolos causales.

*(Las descripciones de escena completas están en los packs por cuento; esta tabla es el índice de producción con estado + ventana + refs.)*
