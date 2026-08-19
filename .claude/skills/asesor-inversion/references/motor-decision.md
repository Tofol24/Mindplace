# Motor de Decisión — puntuación, oportunidades, escenarios y riesgo

---

## 1. Puntuación 0-100

Seis dimensiones. La puntuación sirve para **comparar activos entre sí**, no para disparar órdenes.
Dos activos con 72 puntos pueden merecer decisiones opuestas según la cartera y el momento.

| Dimensión | Máx. | Qué mide |
|---|---|---|
| **VALORACIÓN** | 20 | ¿Está caro o barato respecto a su propia historia y a sus comparables? |
| **FUNDAMENTALES** | 20 | ¿El negocio o el protocolo va bien y mejora? |
| **MOMENTUM** | 15 | ¿La tendencia acompaña? |
| **MACROECONOMÍA** | 15 | ¿El entorno de tipos y ciclo le favorece? |
| **RIESGO** | 15 | Puntuación **inversa**: más puntos = menos riesgo |
| **DIVERSIFICACIÓN PARA MI CARTERA** | 15 | ¿Aporta algo que la cartera no tiene ya? |
| **TOTAL** | **100** | |

### Rúbricas

**VALORACIÓN (0-20)** — para cripto, sustituir múltiplos por capitalización frente a uso real, ingresos del
protocolo y suministro pendiente de desbloquear (ver `analisis-inversion/references/fundamentales.md`).

| Puntos | Criterio |
|---|---|
| 17-20 | Claramente por debajo de su media histórica y de comparables, sin deterioro que lo justifique |
| 12-16 | Razonable: en línea con su media o ligeramente por debajo |
| 7-11 | Exigente: por encima de su media, ya descuenta que todo salga bien |
| 3-6 | Muy exigente: cualquier decepción se paga cara |
| 0-2 | Sin base para valorar (sin beneficios, sin ingresos, sin comparables) |

**FUNDAMENTALES (0-20)**

| Puntos | Criterio |
|---|---|
| 17-20 | Ingresos y márgenes creciendo, caja sólida, deuda controlada, ventaja competitiva clara |
| 12-16 | Sólido y estable, sin deterioro |
| 7-11 | Mixto: algo mejora y algo empeora |
| 3-6 | Deterioro visible en ingresos, márgenes o deuda |
| 0-2 | Sin fundamentales analizables, o deterioro grave |

**MOMENTUM (0-15)**

| Puntos | Criterio |
|---|---|
| 13-15 | Tendencia alcista clara y sostenida, con volumen que la acompaña |
| 9-12 | Alcista pero madura, o en consolidación ordenada |
| 5-8 | Lateral, sin dirección definida |
| 2-4 | Tendencia bajista |
| 0-1 | Caída vertical, sin suelo identificable |

⚠️ **Momentum alto NO es razón suficiente para comprar.** Si es la única dimensión alta, la operación es
persecución de precio. Comprobarlo en §3.

**MACROECONOMÍA (0-15)** — tipos, ciclo, divisa y regulación aplicados a **este** activo en concreto.

| Puntos | Criterio |
|---|---|
| 13-15 | El entorno le favorece de forma directa e identificable |
| 9-12 | Neutro-favorable |
| 5-8 | Neutro o mixto |
| 2-4 | El entorno le perjudica |
| 0-1 | Riesgo macro o regulatorio grave y activo |

**RIESGO (0-15, inverso)**

| Puntos | Criterio |
|---|---|
| 13-15 | Volatilidad baja, negocio diversificado, balance sólido, liquidez alta |
| 9-12 | Riesgo moderado y bien identificado |
| 5-8 | Riesgo alto: concentración de negocio, deuda elevada o alta volatilidad |
| 2-4 | Riesgo muy alto: pérdida permanente plausible |
| 0-1 | Riesgo de ir a cero |

**DIVERSIFICACIÓN PARA MI CARTERA (0-15)** — depende de la cartera concreta, no del activo.

| Puntos | Criterio |
|---|---|
| 13-15 | Aporta una exposición que la cartera no tiene, y se mueve distinto al resto |
| 9-12 | Aporta algo, con solapamiento parcial |
| 5-8 | Muy parecido a lo que ya hay |
| 2-4 | Duplica una posición existente y aumenta la concentración |
| 0-1 | Dispara la concentración por encima de los límites del perfil |

### Lectura del total

| Total | Lectura | ⚠️ |
|---|---|---|
| 80-100 | Muy atractivo en términos comparativos | Comprobar que no sea un error de análisis: es una nota rara |
| 65-79 | Atractivo | |
| 50-64 | Neutro: ni entrar ni salir por la puntuación | |
| 35-49 | Poco atractivo | |
| 0-34 | Evitar, o reducir si está en cartera | |

**Reglas de uso, obligatorias:**
- **Nunca convertir la puntuación en una orden de forma mecánica.** Un 78 con RIESGO en 3/15 no se compra:
  la nota alta viene de dimensiones que no compensan una pérdida permanente.
- **Puntuación baja en RIESGO actúa como veto**, no como resta. Con RIESGO ≤ 4, la conclusión no puede ser
  `COMPRAR`; como mucho `COMPRAR GRADUALMENTE` con tamaño reducido, y solo si el perfil lo admite.
- Mostrar siempre el **desglose por dimensión**, nunca el total a secas. El desglose es la información útil.
- Al puntuar dos veces el mismo activo en fechas distintas, comparar y explicar qué dimensión ha cambiado.

---

## 2. Detector de oportunidades

**Una caída no es una oportunidad hasta que se demuestre.** El 90% de los activos que caen mucho, caen por un
motivo. Ante una caída significativa, responder a las diez preguntas **en este orden**:

1. **Magnitud** — cuánto ha caído, desde qué máximo y en cuánto tiempo.
2. **Causa** — qué ha pasado exactamente. Sin causa identificada, no se sigue: se etiqueta ⚫.
3. **¿Afecta a los fundamentales?** — la pregunta que decide todo. Un problema de negocio no es lo mismo que
   una caída por el ánimo del mercado o por arrastre del sector.
4. **Valoración previa** — ¿venía caro? Si venía muy caro, la caída puede ser solo normalización.
5. **Valoración actual** — ¿está barato ahora, o solo *más barato* que antes? No es lo mismo.
6. **Tendencia** — ¿ha roto su tendencia principal o es un retroceso dentro de ella?
7. **Volumen** — ¿la caída viene con volumen de capitulación o es un goteo?
8. **Riesgos** — qué puede empeorar todavía desde aquí.
9. **Horizonte** — ¿en cuánto tiempo tendría que resolverse la tesis? ¿Encaja con el perfil?
10. **Relación rentabilidad/riesgo** — recorrido razonable al alza frente a caída adicional plausible,
    en euros y sobre el tamaño de posición que correspondería.

### Clasificación

| | Criterio |
|---|---|
| 🟢 **OPORTUNIDAD INTERESANTE** | Fundamentales intactos + valoración atractiva + causa identificada y acotada + relación rentabilidad/riesgo favorable |
| 🟡 **VIGILAR** | Tesis plausible pero algo sin confirmar: falta un dato, una publicación o estabilización del precio. **Indicar qué se espera exactamente y para cuándo** |
| 🔴 **EVITAR** | Los fundamentales están dañados, el riesgo no está acotado, o no encaja con el perfil |
| ⚫ **INFORMACIÓN INSUFICIENTE** | No se ha podido determinar la causa o faltan datos fiables. **Es una respuesta legítima y frecuente** — no rellenar con hipótesis |

Máximo **3 oportunidades por informe**. Si hay más, es que el filtro no se está aplicando.
Que no haya ninguna es un resultado normal, no un informe incompleto.

---

## 3. No perseguir el mercado

Antes de proponer cualquier operación, clasificar el impulso que hay detrás:

| Impulso | Cómo se reconoce | Qué hacer |
|---|---|---|
| **FOMO** | El activo ha subido fuerte hace poco y no había tesis previa | 🛑 **Parar.** Nombrarlo y no proponer la operación |
| **PÁNICO** | Querer vender por una caída, sin cambio en los fundamentales | 🛑 **Parar.** Revisar la tesis original antes de tocar nada |
| **MOMENTUM JUSTIFICADO** | La tendencia acompaña **y** hay tesis de fondo independiente | ✅ Válido, con tamaño ajustado a la volatilidad |
| **CAMBIO FUNDAMENTAL** | Un hecho nuevo y verificable altera el valor del activo | ✅ Válido. El motivo más sólido de todos |
| **REBALANCEO** | Una clase de activo se ha desviado de su banda objetivo | ✅ Válido y mecánico, sin necesidad de opinión de mercado |
| **OPORTUNIDAD DE VALORACIÓN** | El precio se ha alejado del valor sin deterioro del negocio | ✅ Válido, con horizonte suficiente |

**Una subida fuerte no es señal de compra. Una caída fuerte no es señal de venta.**
Si el impulso resulta ser FOMO o PÁNICO, el output del análisis es exactamente eso: nombrarlo, explicar por
qué, y no proponer operación. No es un análisis fallido; es el análisis funcionando.

---

## 4. Ficha de recomendación

Toda recomendación lleva los diez campos. Sin el último, no se entrega.

```
━━━ RECOMENDACIÓN ━━━
Activo:            [nombre]
Ticker:            [TICKER]
Precio observado:  [X €] · [fecha, hora, fuente]
Acción propuesta:  COMPRAR / COMPRAR GRADUALMENTE / MANTENER / ESPERAR / REDUCIR / VENDER / NO HACER NADA
Puntuación:        [N]/100 · [desglose por dimensión]
Impulso detectado: [FOMO / PÁNICO / MOMENTUM JUSTIFICADO / CAMBIO FUNDAMENTAL / REBALANCEO / VALORACIÓN]

ARGUMENTOS A FAVOR
1. [ ]   2. [ ]   3. [ ]

ARGUMENTOS EN CONTRA          ← obligatorio, mínimo dos
1. [ ]   2. [ ]

RIESGO PRINCIPAL:  [el que de verdad puede doler]
¿QUÉ PASA SI ME EQUIVOCO?: pérdida potencial de [€] ([%] de la cartera)
HORIZONTE:         [días / semanas / meses / años]
PESO MÁXIMO RAZONABLE: [%] de la cartera — [por qué ese %]

⛔ CONDICIONES QUE INVALIDARÍAN LA TESIS
- [hecho concreto y comprobable]
- [hecho concreto y comprobable]
```

Para el cálculo del tamaño en euros: `analisis-inversion/references/gestion-riesgo.md`.

---

## 5. Escenarios

**Nunca entregar una sola predicción.** Siempre los tres, con probabilidad orientativa que sume 100%:

```
📈 ESCENARIO ALCISTA (~X%)
Qué tendría que pasar: [condiciones concretas]
Efecto en la cartera:  [+Y% aproximado]
Qué haría la cartera:  [acción concreta]

➡️ ESCENARIO BASE (~X%)
[igual]

📉 ESCENARIO BAJISTA (~X%)
[igual]

⚠️ Las probabilidades son estimaciones subjetivas de trabajo para ordenar la decisión.
No son medidas estadísticas ni tienen valor predictivo demostrable.
```

Reglas:
- El escenario base rara vez debería estar por debajo del 40%: si lo está, el análisis está diciendo que no
  hay escenario central, y entonces la conclusión es esperar.
- **El escenario bajista se desarrolla con el mismo detalle que el alcista.** El sesgo natural es despacharlo
  en una línea, y es el que determina si la cartera sobrevive.
- Cada escenario incluye **qué hacer**, no solo qué pasaría. Un escenario sin plan de acción es literatura.
- Añadir, cuando exista, un **riesgo de cola**: un suceso poco probable y de gran impacto, señalado aparte y
  sin probabilidad asignada.

---

## 6. Control de riesgo — antes de cualquier compra

Pregunta obligatoria y por escrito: **"¿Qué ocurre si estoy equivocado?"**

Ocho vectores:

| Vector | Pregunta concreta |
|---|---|
| **Pérdida potencial** | Si cae a la invalidación, ¿cuánto pierdo en euros y en % de cartera? |
| **Correlación** | ¿Se mueve como algo que ya tengo? ¿Aumenta la apuesta o la diversifica? |
| **Concentración** | Tras la compra, ¿qué peso alcanza esta posición y las 3 mayores juntas? |
| **Volatilidad** | ¿Cuánto se mueve este activo en un día normal? ¿Aguanto verlo? |
| **Riesgo macro** | ¿Qué escenario de tipos o ciclo lo destruiría? |
| **Riesgo empresarial** | ¿Depende de un cliente, un producto, un regulador o una persona? |
| **Riesgo geopolítico** | ¿Exposición a un país o conflicto concreto? |
| **Riesgo de divisa** | ¿En qué moneda factura de verdad? ¿Qué pasa si el euro se aprecia? |

**Principio rector: la preservación del capital tiene prioridad sobre perseguir rentabilidad extraordinaria.**
Ante duda razonable entre proteger y arriesgar, se protege. Una oportunidad perdida se recupera; el capital
perdido de forma permanente, no.

**Test final antes de entregar la recomendación:** si el peor escenario razonable llevara la cartera por
debajo de la pérdida máxima soportable declarada en el perfil, la recomendación **no puede ser `COMPRAR`**,
por buena que sea la puntuación. El perfil manda sobre el análisis.
