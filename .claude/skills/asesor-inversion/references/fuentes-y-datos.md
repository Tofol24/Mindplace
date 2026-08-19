# Fuentes y Datos — la regla que sostiene todo lo demás

Si este fichero se incumple, el resto del sistema no vale nada: un análisis impecable sobre un dato inventado
es peor que no analizar, porque parece fiable.

---

## 1. Las tres reglas inquebrantables

**1. Nunca inventar.** Ni precios, ni rentabilidades, ni noticias, ni resultados empresariales, ni tipos de
interés, ni datos macro, ni fechas de reuniones de bancos centrales, ni cifras de inflación.

"Aproximar de memoria" es inventar. El modelo tiene fecha de corte de conocimiento y los mercados se mueven
todos los días: cualquier cifra recordada está desactualizada por definición. **Si no se ha buscado hoy,
no se escribe.**

**2. Siempre fechar.** Cada dato lleva su fecha, su hora aproximada y su origen:
> S&P 500: 5.432 pts (cierre 12/08, fuente X, consultado 13/08 ~09:15 CET)

**3. Sin datos frescos, no hay recomendación.** Decirlo explícitamente y bloquear la Decisión del Día en
`SIN DATOS SUFICIENTES`. Nunca rellenar el hueco con memoria ni con una recomendación genérica disfrazada.

---

## 2. Cómo buscar

Usar `WebSearch` para localizar y `WebFetch` para leer la fuente concreta.

**Orden de preferencia de fuentes:**

| Nivel | Tipo | Ejemplos |
|---|---|---|
| 1 — Primaria | El emisor del dato | Reserva Federal, BCE, INE, Eurostat, BLS, la propia empresa (resultados) |
| 2 — Agregador serio | Datos de mercado consolidados | Portales financieros con cotizaciones, FRED (series macro) |
| 3 — Prensa financiera | Contexto e interpretación | Medios financieros de referencia |
| ❌ — Nunca | Redes sociales, foros, canales de Telegram, "expertos" anónimos | — |

**Para datos macro y tipos**, ir siempre al nivel 1: los comunicados de la Fed y del BCE, y los institutos
oficiales de estadística. Un titular de prensa sobre un dato macro se contrasta con el comunicado original.

**Para cotizaciones**, contrastar **al menos dos fuentes** si el dato va a sostener una recomendación de compra
o venta. Si discrepan de forma relevante, decirlo y no recomendar sobre ese activo.

---

## 3. Frescura exigible según el uso

| Uso del dato | Antigüedad máxima aceptable |
|---|---|
| Decisión del Día / recomendación de operar | Cierre de la última sesión, o intradía |
| Contexto de mercado (índices, VIX) | Último cierre |
| Tipos de interés oficiales | Última reunión del banco central |
| Inflación, empleo, PIB, PMI | Última publicación oficial (indicar el mes de referencia) |
| Resultados empresariales | Último trimestre publicado |
| Valoraciones (PER, múltiplos) | Últimas 2 semanas |
| Tesis de largo plazo | Meses, si los fundamentales no han cambiado |

**Aviso sobre cotizaciones gratuitas:** muchas fuentes públicas dan precios con retraso (habitualmente 15
minutos o el cierre anterior). Para el uso de esta skill —decisiones de días o semanas— eso es suficiente,
**pero hay que decir que el dato es de cierre o retrasado**, no presentarlo como precio en vivo.
Nunca proponer operativa que dependa de precisión intradía sobre datos retrasados.

---

## 4. Qué hacer cuando no hay datos

No es un fallo, es un estado previsto. Se declara y se sigue:

```
⚠️ DATOS INSUFICIENTES

Buscado: [qué se intentó obtener]
Obtenido: [qué sí se ha conseguido, con fecha]
No obtenido: [qué falta]
Motivo: [sin acceso / fuente caída / dato aún no publicado / mercado cerrado]

Qué SÍ se puede decir con lo disponible: [ ]
Qué NO se puede decir: [ ]

🎯 DECISIÓN DEL DÍA: SIN DATOS SUFICIENTES
```

Casos frecuentes que no son "falta de datos" sino situación normal del calendario:
- Fin de semana o festivo: los mercados de acciones están cerrados, el último dato es el del viernes.
  Cripto sí cotiza. Decirlo en vez de buscar cotizaciones que no existen.
- Dato macro aún no publicado: indicar la fecha prevista de publicación en lugar de estimarlo.

---

## 5. Distinguir el dato de su interpretación

Un mismo hecho admite lecturas opuestas, y esa es exactamente la parte donde se cuela el sesgo:

> **HECHO**: la inflación subyacente sale en el 2,4% interanual (fecha, fuente).
> **INTERPRETACIÓN A**: se acerca al objetivo, abre margen para bajar tipos.
> **INTERPRETACIÓN B**: la resistencia por encima del objetivo retrasa la bajada.
> **QUÉ LO RESOLVERÍA**: el tono del comunicado del banco central en su próxima reunión (fecha).

Cuando dos lecturas razonables compiten, **presentar las dos** y decir qué dato futuro concreto zanjaría la
duda. Elegir una sola lectura y venderla como evidente es el error más común del análisis financiero.

---

## 6. Higiene de citas

- Enlazar o nombrar la fuente concreta de cada bloque de datos, no una lista genérica al final.
- Si un dato viene de una única fuente y no se ha podido contrastar, marcarlo: *(sin contrastar)*.
- Si una noticia es interpretación de un medio y no un hecho verificable, etiquetarla como INTERPRETACIÓN.
- Los rumores de mercado ("se especula con que...") son HIPÓTESIS y jamás sostienen una recomendación.
- Nunca citar de memoria la fecha de una reunión de la Fed o del BCE: se busca el calendario oficial.
