# Filtro de Precio — Leer un gráfico sin engañarse

Qué es y qué no es el análisis técnico:
- **Sí es**: una forma ordenada de describir dónde está el precio, dónde hay niveles relevantes y dónde poner
  la invalidación. Sirve sobre todo para **gestionar el riesgo**, que es su uso honesto.
- **No es**: una bola de cristal. No predice. Los patrones se ven mucho mejor mirando hacia atrás que hacia
  delante, y esa es exactamente la trampa.

**Orden correcto:** el gráfico se mira **al final**, cuando el activo ya ha pasado el filtro de fondo.
Un buen gráfico sobre un activo malo sigue siendo un activo malo. Usar el gráfico para elegir *qué* comprar
es el error más común; su función es elegir *cuándo* y *dónde poner la salida*.

---

## 1. Lo primero: la estructura

Antes de cualquier indicador, responder a tres preguntas mirando el gráfico grande (semanal o diario):

1. **¿Dónde está el precio dentro de su rango histórico?** ¿Cerca de máximos, en zona media, cerca de mínimos?
2. **¿Qué está haciendo la secuencia?** Máximos y mínimos cada vez más altos = tendencia alcista.
   Cada vez más bajos = bajista. Ni una cosa ni otra = rango, y en rango la mayoría de señales fallan.
3. **¿Dónde están las zonas donde el precio se ha girado varias veces?** Esas zonas son la información más
   útil de todo el gráfico.

Con esas tres respuestas ya se puede situar una operación. Todo lo demás es refinamiento.

---

## 2. Marcos temporales — la regla de los tres

Mirar siempre **tres marcos**, del grande al pequeño, y en ese orden:

| Horizonte de la operación | Marco de contexto | Marco de decisión | Marco de ejecución |
|---|---|---|---|
| Largo | Mensual | Semanal | Diario |
| Medio | Semanal | Diario | 4 horas |
| Corto | Diario | 4 horas | 1 hora |

**Error clásico:** decidir en el marco pequeño y contradecir el grande. Si el semanal es bajista y el gráfico de
1 hora enseña una figura alcista preciosa, la figura pequeña casi siempre pierde. El marco grande manda.

---

## 3. Soportes y resistencias

Son **zonas, no líneas exactas**. Dibujar un nivel al céntimo da una falsa sensación de precisión.

- Se identifican donde el precio se ha girado **varias veces**, no una.
- Cuantas más veces se ha respetado un nivel, más gente lo mira — y más órdenes hay ahí.
- Cuando un soporte se rompe, tiende a funcionar después como resistencia, y al revés.
- **Los números redondos importan** (1.000, 50.000) simplemente porque mucha gente pone órdenes ahí.

**Cómo se usa de verdad:** no como señal de compra, sino para **colocar la invalidación al otro lado del nivel**.
Ahí es donde el gráfico aporta valor real.

---

## 4. Volumen — el filtro de credibilidad

El volumen dice si un movimiento tiene participación detrás o no.

- Subida con volumen creciente = hay convicción.
- Subida con volumen decreciente = puede ser solo falta de vendedores; se sostiene peor.
- Ruptura de un nivel importante **sin volumen** = alta probabilidad de ruptura falsa.
- Volumen extremo tras una caída larga = a menudo señala capitulación (no es una señal de compra por sí sola,
  es un cambio de contexto).

En cripto, comprobar además que el volumen sea de mercados con profundidad real: en tokens pequeños el volumen
puede estar inflado artificialmente.

---

## 5. Indicadores — pocos y bien

Todos los indicadores derivan del precio y del volumen. **No aportan información nueva, la reordenan.**
Más indicadores no es más información: es más ruido y más excusas para justificar lo que ya se quería hacer.

**Medias móviles (50 y 200 sesiones)**
- Sirven para una sola cosa útil: describir la tendencia de un vistazo. Precio por encima de la de 200 = contexto
  alcista de fondo. Por debajo = contexto bajista de fondo.
- Funcionan como zonas dinámicas donde el precio suele reaccionar.
- En mercados laterales dan señales falsas continuamente. Ahí no se usan.

**RSI**
- Mide la velocidad de los movimientos recientes en una escala de 0 a 100.
- **El error grave**: "RSI por encima de 70 = vender". En una tendencia fuerte el RSI se queda sobrecomprado
  durante semanas mientras el precio sigue subiendo. Vender por RSI alto en tendencia es una forma habitual
  de perderse el movimiento entero.
- Uso honesto: detectar **divergencias** (el precio hace un máximo nuevo pero el RSI no) como aviso de pérdida
  de fuerza — un aviso, no una señal de entrada.

**Regla:** un indicador principal + volumen. Añadir un segundo solo si se puede explicar exactamente qué mide
y en qué se diferencia del primero.

---

## 6. Lo que casi nunca se mira y decide el resultado

**Liquidez y spread.** La diferencia entre precio de compra y de venta. En activos pequeños puede comerse
varios puntos porcentuales solo en entrar y salir. Comprobarlo antes de operar, no después.

**Comisiones reales.** Sumar: comisión de compra + spread + comisión de venta + comisión de red (en cripto) +
posible cambio de divisa. En operativa de corto plazo, este total es a menudo mayor que el beneficio esperado —
y es la razón principal por la que operar mucho reduce el rendimiento.

**Horario y liquidez.** En acciones, la apertura y el cierre concentran movimientos bruscos. En cripto el mercado
no cierra nunca, y los movimientos más violentos suelen ocurrir con poca liquidez, de madrugada o en fin de semana.

**Volatilidad del activo.** Un stop del 5% en una acción estable es amplio; en una altcoin pequeña es ruido de
un día cualquiera. La distancia de la invalidación se ajusta a la volatilidad del activo, no a la comodidad.

---

## 7. Sesgos que se cuelan al mirar un gráfico

| Sesgo | Cómo aparece | Antídoto |
|---|---|---|
| **Confirmación** | Buscar solo lo que apoya la idea que ya se tenía | Escribir las 2 razones en contra antes de mirar precios |
| **Anclaje** | "Lo compré a 100, no vendo por debajo" | Al mercado le da igual tu precio de compra. Solo cuenta el valor hoy |
| **Recencia** | Lo que ha subido esta semana parece que seguirá subiendo | Mirar siempre 5 años, no 5 días |
| **Aversión a la pérdida** | Cerrar rápido lo que gana, aguantar sin fin lo que pierde | La invalidación se decide antes de entrar, por escrito |
| **FOMO** | Entrar tarde por miedo a quedarse fuera | Siempre habrá otra oportunidad. El dinero perdido no vuelve solo |
| **Retrospectiva** | "Estaba clarísimo que iba a subir" | Solo vale lo que estaba escrito en el diario antes del movimiento |
| **Coste hundido** | "Ya he perdido mucho, ahora no puedo salir" | Lo ya perdido no influye en la decisión de hoy |

**La pregunta que desarma casi todos los sesgos a la vez:**
*"Si no tuviera esta posición, ¿la abriría hoy, a este precio, con esta información?"*
Si la respuesta es no, la posición está abierta por inercia, no por análisis.
