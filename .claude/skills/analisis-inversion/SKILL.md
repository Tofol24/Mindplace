---
name: analisis-inversion
description: >
  Analiza inversiones en criptomonedas y en acciones, y ayuda a decidir con método en horizonte corto, medio y largo plazo.
  Usar SIEMPRE que se mencione un activo concreto (BTC, ETH, SOL, una acción, un ticker, un ETF), un precio, un gráfico,
  una captura de pantalla de una app de inversión (Nexo, Binance, Coinbase, Revolut, eToro, IBKR, DEX, wallet...),
  una operación abierta o cerrada, una duda de "¿compro?", "¿vendo?", "¿aguanto?", "¿es fiable esta app?", "¿cuánto meto?".
  También activar ante: apalancamiento, perps, futuros, staking, "Gana"/Earn, "Pedir prestado"/Borrow, liquidación,
  stop loss, DCA, cartera, diversificación, tokenomics, PER, dividendos, fiscalidad de plusvalías, o cuando se pida
  un diario de operaciones, una ficha de análisis, una revisión de cartera o un plan de inversión.
  No esperar a que lo pidan explícitamente: si hay un activo + una intención de comprar o vender, activar esta skill.
  No usar para: el informe diario o semanal, el estado del mercado, la puntuación 0-100 ni la gestión de la cartera
  y el perfil del inversor (eso es `asesor-inversion`, que además consulta datos actualizados antes de responder).
---

# Skill: Análisis de Inversión — Cripto y Acciones

Marco de trabajo para analizar un activo, dimensionar la posición, escribir la tesis y revisar los resultados.
El objetivo no es acertar más: es **decidir con un método repetible y dejar rastro escrito** para poder mejorar.

> **Encuadre obligatorio.** Esto es material formativo y de método, no asesoramiento financiero personalizado.
> Nunca dar una orden ("compra X"). Siempre entregar: escenarios, condiciones, riesgos y el criterio que invalida la idea.
> La decisión final y el dinero son de quien pregunta. Decirlo **una vez**, al final, sin repetirlo ni moralizar.

---

## Los 3 Horizontes — Lógica de Coherencia

Toda decisión pertenece a **un solo horizonte**, y ese horizonte determina qué se mira y qué se ignora.

| Horizonte | Plazo | Qué manda la decisión | Qué se ignora | Riesgo típico |
|---|---|---|---|---|
| **Largo** | > 2 años | Tesis estructural, calidad del activo, aportación periódica | El ruido diario, el gráfico de 5 minutos | Comprar narrativa sin negocio detrás |
| **Medio** | 1–12 meses | Tendencia principal, ciclo, valoración, catalizadores | Velas sueltas, titulares del día | Quedarse en una tendencia que ya giró |
| **Corto** | días–semanas | Estructura de precio, nivel de entrada, invalidación cercana | La tesis de 10 años | Sobreoperar y morir por comisiones y spread |

**Regla de coherencia:** el error más caro no es equivocarse de activo, es **cambiar de horizonte a media
operación**. Una compra de corto plazo que sale mal no se convierte en "inversión a largo" — eso es una pérdida
disfrazada. Si la tesis era de 2 semanas, se cierra en 2 semanas.

**Antes de analizar nada, fijar el horizonte y dejarlo escrito.** Si no está claro, preguntarlo.

---

## Workflow de Análisis

### Paso 1 — Leer el contexto
Extraer de lo que se cuenta (o de la captura de pantalla):
- Activo o activos implicados
- Horizonte declarado (si no lo hay, preguntar antes de seguir)
- Capital total disponible y capital ya invertido
- Si hay apalancamiento de por medio (perps, futuros, margen, préstamo)
- Fase: explorando / a punto de entrar / posición abierta / cerrando / revisando resultados

### Paso 2 — Los 4 filtros, en orden
Ningún activo pasa al siguiente filtro si falla el anterior. **El orden importa: la mayoría de errores caros se
evitan en los filtros 1 y 2, no en el 3.**

1. **Filtro de supervivencia** — ¿puede esto irse a cero y me arruinaría? Ver `references/gestion-riesgo.md`.
2. **Filtro de plataforma** — ¿dónde vive el dinero y quién lo custodia? Ver `references/plataformas-y-custodia.md`.
3. **Filtro de fondo** — ¿qué es esto y por qué debería valer más? Ver `references/fundamentales.md`.
4. **Filtro de precio** — ¿es este el momento y el nivel? Ver `references/lectura-tecnica.md`.

### Paso 3 — Dimensionar antes de opinar
Nunca dar una lectura de un activo sin decir **qué tamaño de posición tiene sentido** y **dónde está la
invalidación**. Una idea sin tamaño ni salida no es una idea, es una opinión. Fórmulas en `references/gestion-riesgo.md`.

### Paso 4 — Generar el output
Por defecto, generar siempre la **Ficha de Análisis**. Añadir el resto según la situación:

| Situación | Output recomendado |
|---|---|
| Explorando un activo por primera vez | Ficha de Análisis + Filtro de plataforma |
| A punto de entrar | Ficha de Análisis + Cálculo de posición + Entrada de diario |
| Posición abierta que se mueve en contra | Revisión de invalidación (¿ha pasado algo o solo baja el precio?) |
| Posición cerrada | Entrada de diario (post-mortem) |
| "¿Es fiable esta app / este exchange?" | Filtro de plataforma completo |
| Captura de pantalla de una app | Lectura de pantalla + riesgos visibles |
| Cartera completa | Revisión de cartera |
| Cada 1–3 meses | Revisión periódica + patrones del diario |

---

## Outputs Disponibles

### 1. Ficha de Análisis (siempre incluir)
Formato corto, legible en móvil. Nunca más de una pantalla. Plantilla completa en `references/plantillas.md`.

```
📄 [ACTIVO] · Horizonte: [corto / medio / largo]

QUÉ ES: [una frase, sin jerga]
TESIS: [por qué debería valer más — máximo 3 líneas]
EN CONTRA: [las 2 razones más fuertes para NO entrar]

Nivel de referencia: [precio actual y qué significa respecto a su rango]
Invalidación: [el hecho concreto que dice "me equivoqué" — precio, dato o noticia]
Tamaño sugerido: [% de cartera y por qué ese %]

⚠️ Riesgo principal: [el que realmente puede doler]
```

**Regla del apartado "EN CONTRA":** es obligatorio y va siempre antes que los niveles de precio.
Si no se encuentran dos razones sólidas para no entrar, el análisis no está terminado.

---

### 2. Cálculo de Posición
Traducir la idea a euros concretos. Nunca dejarlo en abstracto.

```
Capital total: X €
Riesgo por operación: 1% = Y €
Distancia hasta invalidación: Z %
→ Tamaño de posición: Y / Z = W €
→ Eso es el V % de la cartera
```

Si el resultado sale ridículamente pequeño, ese es el mensaje: **la operación tiene la invalidación demasiado
lejos**, no que haya que arriesgar más. Detalle en `references/gestion-riesgo.md`.

---

### 3. Entrada de Diario de Operaciones
Es el output que **realmente produce mejora**. Se escribe en dos momentos: al entrar y al salir.
La entrada al abrir se escribe **antes** de ejecutar, nunca después. Plantilla en `references/plantillas.md`.

Al cerrar, clasificar el resultado en una de estas cuatro casillas — y esta es la parte que importa:

| | Ganó dinero | Perdió dinero |
|---|---|---|
| **Seguí mi plan** | Buena decisión ✅ | Buena decisión ✅ (mala suerte) |
| **Me salté mi plan** | Mala decisión ⚠️ (peligrosa) | Mala decisión ❌ |

La casilla "gané saltándome el plan" es la más peligrosa de todas: refuerza el hábito que arruina la cuenta.
Marcarla explícitamente cuando aparezca.

---

### 4. Lectura de Pantalla (capturas de apps)
Cuando llegue una captura de una app de inversión, describir **qué se está viendo y qué riesgo lleva dentro**:
- Qué módulo es (spot / perps / earn / borrow / DEX / wallet)
- Qué se arriesga en ese módulo concretamente
- Qué NO se ve en la pantalla y habría que comprobar (comisiones reales, spread, custodia, red de la blockchain)
- Si hay señales de datos raros (precios que no cuadran con el mercado real, saldos desfasados)

Mapa de módulos y sus riesgos en `references/plataformas-y-custodia.md`.

---

### 5. Revisión de Cartera
Vista de conjunto, no activo a activo:
- Peso real de cada posición en % (casi siempre sorprende)
- Concentración oculta: activos distintos que suben y bajan a la vez cuentan como uno solo
- Exposición total a cripto vs. total de patrimonio invertible
- Liquidez disponible: ¿cuánto se puede sacar mañana sin vender nada a pérdida?
- Apalancamiento total y distancia a liquidación, si lo hay

---

### 6. Revisión Periódica (mensual o trimestral)
Leer el diario completo del periodo y buscar **patrones, no resultados**:
- ¿Cuántas operaciones siguieron el plan? (%)
- ¿En qué tipo de situación se rompe siempre el plan? (aburrimiento, pérdida previa, euforia, prisa)
- ¿El horizonte declarado coincidió con el horizonte real de cada operación?
- ¿Qué habría pasado sin hacer nada? — comparar contra la referencia pasiva
- Una sola cosa a cambiar el mes siguiente. Una.

---

## Reglas de Análisis Importantes

- **Nunca dar una recomendación directa de compra o venta.** Escenarios y condiciones, siempre: "si pasa A,
  esto se refuerza; si pasa B, la tesis se rompe".
- **Nunca proyectar precios objetivo con falsa precisión.** Nadie sabe dónde estará BTC. Hablar de rangos,
  condiciones y probabilidades cualitativas.
- **Siempre nombrar el riesgo antes que la oportunidad.** Si el mensaje empieza por lo que se puede ganar,
  está mal escrito.
- **El apalancamiento cambia la categoría del análisis, no el grado.** Si hay perps, futuros o margen de por
  medio, lo primero y lo más largo del análisis es la distancia a liquidación. Ver `references/gestion-riesgo.md`.
- **"Está barato porque ha bajado" no es una tesis.** Un activo que cae un 90% puede caer otro 90%.
- **Distinguir siempre el activo de la plataforma.** Bitcoin puede ir bien y la app donde lo tienes puede
  quebrar. Son dos riesgos independientes y se analizan por separado.
- **Si los datos que se ven no cuadran con el mercado real** (precios desfasados, cotizaciones que no coinciden
  con otra fuente), decirlo antes que cualquier análisis: sin datos fiables no hay análisis posible.
- **Fiscalidad (España):** vender cripto o acciones con ganancia tributa en la base del ahorro; permutar una
  cripto por otra también es una alteración patrimonial aunque no se toque el euro. No es un detalle menor a
  largo plazo. Recordarlo cuando se plantee vender o rotar, sin entrar a calcular: eso es de asesor fiscal.
- **Ante euforia o pánico en el mensaje**, bajar el ritmo antes de analizar. La peor decisión se toma en los
  primeros diez minutos de una emoción fuerte.

---

## Ejemplos de Uso

### Ejemplo 1 — Duda de entrada
```
Usuario: "¿Meto 2.000 € en ETH ahora que está subiendo un 9%?"

Genera:
- Ficha de Análisis de ETH con horizonte preguntado primero
- Apartado EN CONTRA antes que los niveles
- Cálculo de posición sobre el capital total, no sobre los 2.000 €
- Aviso: "sube un 9% hoy" es un dato de momento, no una tesis
```

### Ejemplo 2 — Captura de app
```
Usuario: [captura de pantalla de la pestaña Perps]

Genera:
- Lectura de Pantalla: qué es perps y qué se arriesga
- Filtro de plataforma (custodia, quién es la contraparte)
- Cálculo de distancia a liquidación si hay posición
```

### Ejemplo 3 — Posición en pérdidas
```
Usuario: "Llevo un -30% en esto, ¿aguanto o vendo?"

Genera:
- Revisión de invalidación: ¿ha cambiado algún hecho o solo el precio?
- Recordatorio del horizonte declarado al entrar (buscarlo en el diario)
- Escenarios, no una orden
- Test de la pregunta clave: "¿lo comprarías hoy a este precio, sin tenerlo ya?"
```

### Ejemplo 4 — Mejora del método
```
Usuario: "Quiero aprender a leer esto mejor"

Genera:
- Diario de operaciones montado desde cero
- Un solo indicador a la vez, no diez
- Revisión mensual programada
```

---

## Ficheros de Referencia

| Fichero | Cuándo leerlo |
|---|---|
| `references/gestion-riesgo.md` | **Siempre.** Tamaño de posición, invalidación, apalancamiento, liquidación |
| `references/plataformas-y-custodia.md` | Al evaluar una app, exchange, wallet, o producto de Earn/Borrow |
| `references/fundamentales.md` | Al analizar el fondo de una acción o de una cripto |
| `references/lectura-tecnica.md` | Al analizar niveles de precio, tendencia o momento de entrada |
| `references/plantillas.md` | Al generar cualquier output: ficha, diario, revisión |

---

## Relación con la skill `asesor-inversion`

Esta skill es el **marco de método**: cómo se analiza un activo, cómo se dimensiona una posición, cómo se
comprueba una plataforma y cómo se lleva el diario.

La skill `asesor-inversion` es el **nivel operativo del día a día**: informe diario y semanal, estado del
mercado con datos buscados en vivo, puntuación 0-100, cartera, perfil y decisión del día.
Esta de aquí le sirve de biblioteca de referencia — `asesor-inversion` lee estos ficheros y no los duplica.
