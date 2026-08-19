# Gestión de Riesgo — El filtro que se lee siempre

Este fichero se consulta en **todos** los análisis. El resto son opcionales según el caso.

Premisa: el rendimiento a largo plazo depende mucho más de no arruinarse que de acertar.
Una cartera que gana un 50% y luego pierde un 50% no está plana: está un 25% por debajo.

---

## 1. La matemática de la recuperación

Perder es más caro de lo que parece, porque para volver al punto de partida hay que ganar **sobre un capital
más pequeño**.

| Pérdida sufrida | Ganancia necesaria para volver a empezar |
|---|---|
| −10% | +11% |
| −20% | +25% |
| −33% | +50% |
| −50% | +100% |
| −80% | +400% |
| −90% | +900% |

**Consecuencia práctica:** por debajo de −30% la operación deja de ser recuperable con una operación normal
y solo se recupera con una apuesta grande. Ahí es donde la gente dobla posición y pierde la cuenta entera.
El trabajo es no llegar nunca a ese punto, no salir de él.

---

## 2. Tamaño de posición — la fórmula

El tamaño de una posición **no se decide por lo convencido que se esté**. Se calcula.

```
Riesgo por operación (€)  =  Capital total × % de riesgo aceptado
Distancia a invalidación  =  |precio de entrada − precio de invalidación| / precio de entrada
Tamaño de posición (€)    =  Riesgo por operación / Distancia a invalidación
```

**Ejemplo con números reales:**
- Capital total: 10.000 €
- Riesgo aceptado por operación: 1% → 100 €
- Entrada en 1.800 €, invalidación en 1.620 € → distancia = 10%
- Tamaño de posición = 100 / 0,10 = **1.000 €** (el 10% de la cartera)

Si la posición se va a la invalidación, se pierden 100 € — el 1% de la cartera, no el 10%.

**% de riesgo por operación, orientativo:**

| Perfil | Riesgo por operación | Comentario |
|---|---|---|
| Conservador | 0,5% | Sobrevive a 30 pérdidas seguidas |
| Estándar | 1% | El más usado. Sobrevive a rachas malas largas |
| Agresivo | 2% | Solo con método probado y diario escrito |
| Más del 2% | — | No es agresivo, es una apuesta. Nombrarlo como tal |

**Señal de alarma:** si al calcular el tamaño sale una cifra "demasiado pequeña para que merezca la pena",
el problema es que la invalidación está muy lejos o el capital es pequeño para esa operación.
La respuesta correcta es **no hacer la operación**, nunca subir el riesgo hasta que la cifra guste.

---

## 3. La invalidación — el concepto central

La invalidación es **el hecho concreto y comprobable que demuestra que la tesis era falsa**.
Se escribe antes de entrar, no después.

Debe cumplir tres condiciones:
1. **Concreta**: un precio, un dato o un evento. No "si la cosa se pone fea".
2. **Comprobable sin opinar**: cualquiera podría verificar si ha ocurrido.
3. **Definida antes de entrar**: si se escribe después, ya está contaminada por la posición.

**Invalidación por horizonte:**

| Horizonte | Forma típica de la invalidación |
|---|---|
| Corto | Un nivel de precio perdido con claridad |
| Medio | Pérdida de la tendencia principal, o un catalizador que no llega en la fecha prevista |
| Largo | Un cambio en el negocio o en el protocolo: caída sostenida de ingresos, de usuarios, o ruptura de la tesis original |

**El error universal:** mover la invalidación cuando el precio se acerca a ella. Eso convierte una pérdida
del 1% planificada en una pérdida del 30% no planificada. Si la invalidación se mueve, se mueve **antes** de
que el precio llegue y por un motivo escrito, nunca por incomodidad.

---

## 4. Apalancamiento y liquidación

El apalancamiento (perps, futuros, margen, préstamos con colateral) **no multiplica la rentabilidad: multiplica
la velocidad a la que se decide todo**. Con 10x, un movimiento del 10% en contra no reduce la posición: la borra.

```
Movimiento que liquida ≈ 100 / apalancamiento  (en %, antes de comisiones y financiación)
```

| Apalancamiento | Movimiento en contra que liquida |
|---|---|
| 2x | ~50% |
| 5x | ~20% |
| 10x | ~10% |
| 20x | ~5% |
| 50x | ~2% |
| 100x | ~1% |

Bitcoin se mueve un 5% en un día con normalidad. Con 20x, un día normal liquida la posición.

**Al analizar cualquier posición apalancada, calcular y decir siempre, en este orden:**
1. Precio exacto de liquidación
2. Distancia en % desde el precio actual
3. Cuántas veces ha recorrido ese activo esa distancia en un solo día durante el último año
4. Coste de financiación (funding) si la posición se mantiene abierta días o semanas

**Sobre los préstamos con cripto como colateral** (módulos tipo "Pedir prestado" / Borrow): pedir prestado
contra cripto es apalancamiento aunque no lo parezca y aunque no se llame así. Si el colateral cae de valor,
llega la llamada de margen y la liquidación forzosa — y suele llegar precisamente en el peor momento del
mercado, cuando todo cae a la vez.

---

## 5. Aportación periódica (DCA) — para qué sirve y para qué no

Comprar una cantidad fija cada periodo, pase lo que pase.

**Sirve para:** eliminar la decisión de cuándo entrar, que es donde más dinero se pierde por emoción.
Convierte la volatilidad en algo neutro o favorable, y hace la inversión sostenible psicológicamente.

**No sirve para:** salvar un activo malo. Un DCA sobre algo que se va a cero solo consigue llegar a cero
con más dinero dentro. El DCA sustituye al *timing*, no al análisis del filtro de fondo.

**Regla:** el DCA se define con reglas escritas (cuánto, cada cuánto, hasta cuándo, y qué haría parar el plan)
y solo se revisa en la revisión periódica, nunca en caliente.

---

## 6. Diversificación real vs. aparente

Tener diez criptomonedas no es diversificar: cuando el mercado cae, caen las diez a la vez.
La diversificación se mide por **cuánto se mueven juntas las posiciones**, no por cuántas hay.

Bloques que sí se comportan de forma distinta entre sí:
- Cripto (dentro, BTC y ETH tienden a comportarse distinto del resto de altcoins, pero en las caídas fuertes todo se correlaciona)
- Renta variable global (índices amplios)
- Renta fija / liquidez remunerada
- Inmobiliario
- Oro / materias primas

**Pregunta de control:** "si mañana cae el mercado un 30%, ¿qué parte de mi cartera no cae?"
Si la respuesta es "ninguna", no hay diversificación, hay una sola apuesta repartida en varias casillas.

---

## 7. Reglas de supervivencia

- **Dinero que no se puede perder no entra.** Fondo de emergencia primero (3–6 meses de gastos), inversión después.
- **Nunca invertir dinero prestado**, ni con tarjeta de crédito, ni con dinero que hace falta en menos de 2 años.
- **Límite total a activos volátiles**: definirlo por escrito como % del patrimonio invertible y respetarlo.
  Para la mayoría de la gente, la exposición a cripto se sitúa en un dígito bajo del patrimonio total.
- **Una posición nunca es tan buena como para saltarse el tamaño.** Las mejores ideas también fallan.
- **Regla de las 24 horas**: cualquier operación tomada bajo emoción fuerte (euforia, pánico, venganza tras
  una pérdida) espera 24 horas. Si sigue teniendo sentido al día siguiente, se ejecuta con el tamaño normal.
- **Nunca promediar a la baja sin plan previo.** Si el promedio no estaba escrito antes de entrar, es rescate
  emocional, no estrategia.
