# Análisis de Mercado — el bloque CONTEXTO

Se ejecuta con `ANALIZA EL MERCADO` y como parte de todo `INFORME DIARIO`.
**Todos los datos con fecha, hora y fuente** (§`fuentes-y-datos.md`). Sin eso, no se escribe el bloque.

---

## 1. Índices

Cobertura mínima obligatoria:

| Zona | Índices |
|---|---|
| EEUU | S&P 500 · Nasdaq 100 · Dow Jones |
| Europa | Euro Stoxx 50 · DAX · IBEX 35 |
| Asia | Nikkei 225 |

Para cada uno: nivel, variación de la sesión, variación en el año, y distancia a su máximo de 52 semanas.

**Lo que importa no es el nivel, es la divergencia.** Preguntas a responder:
- ¿Van todos en la misma dirección, o hay divergencia entre EEUU y Europa?
- ¿Nasdaq y Dow se mueven juntos, o hay rotación entre crecimiento y valor?
- ¿Está el movimiento concentrado en pocos valores grandes o es general? (ver §Amplitud)

---

## 2. Volatilidad — VIX

| VIX | Lectura | Qué suele implicar |
|---|---|---|
| < 15 | **BAJA** | Complacencia. Las coberturas están baratas; los sustos llegan sin avisar |
| 15-20 | **NORMAL** | Funcionamiento ordinario del mercado |
| 20-30 | **ELEVADA** | Tensión real. Los movimientos diarios se amplían |
| > 30 | **EXTREMA** | Pánico o evento grave. Históricamente ha coincidido con suelos, pero **no es una señal de compra por sí sola** |

Bandas convencionales, no leyes. Lo relevante es siempre la **dirección** del VIX y su velocidad, más que su
nivel absoluto: un VIX subiendo de 13 a 19 dice más que un VIX estable en 21.

**Uso práctico:** la volatilidad no dice qué comprar, dice **cuánto**. Con volatilidad elevada o extrema, los
tamaños de posición se reducen y las entradas se fraccionan, porque la distancia hasta la invalidación se
ensancha. Nunca al revés.

---

## 3. Tipos de interés

| Qué mirar | Por qué |
|---|---|
| Tipo oficial de la **Reserva Federal** y tono del último comunicado | Marca el coste global del dinero |
| Tipo oficial del **BCE** y tono del último comunicado | Marca el coste del dinero en euros y afecta al IBEX y a la banca |
| **Bono EEUU a 10 años** | Referencia mundial de descuento. Si sube, las valoraciones de crecimiento sufren |
| **Bono EEUU a 2 años** | Refleja lo que el mercado espera de la Fed a corto |
| **Bund alemán 10 años** y **bono español 10 años** | Referencia europea y prima de riesgo española |
| **Expectativas de tipos** implícitas en el mercado | Lo ya descontado. Solo mueve el mercado lo que sorprende |

**La regla que explica la mayoría de movimientos:** tipos al alza presionan a la baja las valoraciones,
sobre todo de empresas cuyo beneficio está lejos en el futuro (tecnología, crecimiento, y también cripto por
su carácter de activo de riesgo). Tipos a la baja hacen lo contrario.

**Lo que mueve el precio no es el dato, es la diferencia entre el dato y lo esperado.** Buscar siempre la
expectativa previa antes de interpretar cualquier publicación.

⚠️ Fechas de reuniones de bancos centrales: **siempre del calendario oficial**, nunca de memoria.

---

## 4. Macroeconomía

| Indicador | Qué señala | Matiz |
|---|---|---|
| **Inflación** (general y subyacente) | Presión sobre los tipos | La subyacente manda: excluye energía y alimentos, más volátiles |
| **Empleo** | Fortaleza real de la economía | Un empleo muy fuerte puede ser mala noticia si retrasa la bajada de tipos |
| **PIB** | Crecimiento agregado | Dato retrasado: confirma, no anticipa |
| **PMI** | Expectativa de actividad | Adelantado y útil. Por encima de 50 = expansión; por debajo = contracción |
| **Consumo y ventas minoristas** | Salud del gasto de los hogares | Motor principal de la economía estadounidense |
| **Expectativas de tipos** | Lo que el mercado ya da por hecho | Ver §3 |

Indicar siempre el **mes de referencia** del dato, no solo la fecha de publicación.

---

## 5. Mercado interno

**Amplitud** — ¿cuántos valores participan de la subida? Si el índice sube pero pocos valores lo hacen, el
movimiento es frágil. Es una de las señales de aviso más fiables y de las menos miradas.

**Momentum** — dirección y fuerza de la tendencia principal. Situar los índices respecto a sus medias de
50 y 200 sesiones. Para el detalle metodológico, `analisis-inversion/references/lectura-tecnica.md`.

**Volumen** — ¿el movimiento tiene participación detrás o es un mercado vacío? Agosto y finales de diciembre
producen movimientos exagerados por falta de volumen que no significan nada.

**Rotación sectorial** — qué sectores lideran y cuáles se quedan atrás. El liderazgo defensivo (utilities,
consumo básico, salud) con el índice subiendo es una señal de cautela: el dinero se está poniendo a cubierto
dentro de la renta variable.

**Valoraciones** — múltiplos agregados del índice frente a su propia media histórica. Una valoración exigente
no provoca caídas por sí sola, pero reduce el margen de error ante cualquier decepción.

---

## 6. Sentimiento

Clasificar en una de cuatro etiquetas: **MIEDO · NEUTRALIDAD · OPTIMISMO · EUFORIA**

Señales a combinar: nivel y dirección del VIX, índices de miedo/codicia, posicionamiento de inversores,
flujos hacia fondos, tono de la prensa financiera, y volumen de operativa minorista especulativa.

| Sentimiento | Cómo actuar |
|---|---|
| **MIEDO** | Suele haber mejores precios, pero también más riesgo de que aún queden caídas. Entradas graduales |
| **NEUTRALIDAD** | Contexto ordinario. Seguir el plan sin alteraciones |
| **OPTIMISMO** | Nada que hacer distinto. No es señal de venta |
| **EUFORIA** | Momento de máxima prudencia. Reducir tamaños de posiciones nuevas, no perseguir subidas |

**El sentimiento no es una señal de operación por sí solo.** Es un modulador del tamaño y del ritmo de
entrada. El error clásico es leerlo como indicador contrario y actuar en consecuencia: los mercados pueden
estar eufóricos —o aterrorizados— mucho más tiempo del que resiste una posición mal dimensionada.

---

## 7. Salida del bloque: los cuatro semáforos

```
🌡️ SEMÁFORO
Mercado:      🟢 / 🟡 / 🔴   [una línea de justificación]
Volatilidad:  🟢 / 🟡 / 🔴   [VIX en X, banda Y]
Valoraciones: 🟢 / 🟡 / 🔴   [múltiplo vs. su media histórica]
Macro:        🟢 / 🟡 / 🔴   [el dato que más pesa ahora mismo]

Sentimiento: MIEDO / NEUTRALIDAD / OPTIMISMO / EUFORIA
```

Criterio de color, aplicado con juicio y no mecánicamente:
- 🟢 favorable o sin tensión reseñable
- 🟡 mixto, señales contradictorias, o en deterioro sin confirmar
- 🔴 tensión clara o deterioro confirmado

Cada semáforo lleva **una línea** de justificación con el dato concreto que lo sostiene. Un semáforo sin dato
detrás es decoración.
