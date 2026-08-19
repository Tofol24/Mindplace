# Perfil del Inversor y Cartera

---

## PARTE A — Perfil

### Las 11 preguntas
Se pasan una vez al empezar y se revisan cada 6-12 meses, o cuando cambien las circunstancias vitales.

1. **Capital disponible** — total que se puede destinar a invertir, ya descontado el fondo de emergencia.
2. **Capital actualmente invertido** — cuánto está ya en mercado y en qué.
3. **Aportación mensual** — cuánto puede entrar cada mes de forma sostenible. Es el dato que más determina
   el resultado a 10 años, muy por encima de acertar con los activos.
4. **Horizonte temporal** — ¿cuándo se necesita este dinero? Fecha, no sensación.
5. **Necesidad de liquidez** — ¿cuánto debe poder sacarse en 48h sin vender a pérdida?
6. **Tolerancia a pérdidas temporales** — ¿cómo se reacciona al ver la cartera un 20% abajo? ¿Ha pasado ya?
7. **Pérdida máxima soportable** — la cifra en euros a partir de la cual se vendería todo por no dormir.
   **Es el número más importante del perfil.** Todo el dimensionamiento se calcula contra él.
8. **Objetivos financieros** — para qué es el dinero: jubilación, entrada de vivienda, ingreso complementario,
   crecimiento sin destino concreto.
9. **Experiencia previa** — qué se ha operado antes, cuánto tiempo, con qué resultado y qué se aprendió.
10. **Productos que se acepta usar** — acciones, ETFs, fondos, renta fija, cripto, materias primas.
11. **Productos excluidos** — lo que no se toca bajo ningún concepto. Se respeta siempre, sin excepción y sin
    intentar convencer. Si el usuario excluye derivados o apalancamiento, no se le proponen nunca.

**Aviso sobre la pregunta 6:** la tolerancia declarada y la real casi nunca coinciden. Todo el mundo tolera
un −30% en abstracto. Si el usuario no ha vivido una caída fuerte con dinero real dentro, asumir una
tolerancia menor que la declarada y decírselo.

### Clasificación

| Perfil | Pérdida temporal asumible | Horizonte | Renta variable + cripto orientativo | Cripto orientativo |
|---|---|---|---|---|
| **CONSERVADOR** | hasta ~10% | corto-medio | 0-30% | 0-1% |
| **MODERADO** | ~10-20% | medio | 30-60% | 0-3% |
| **DINÁMICO** | ~20-35% | largo | 60-85% | 2-7% |
| **AGRESIVO** | >35% | muy largo | 85-100% | 5-15% |

Los rangos son orientativos y se ajustan al caso concreto: el horizonte y la necesidad de liquidez mandan
sobre la tolerancia declarada. Un perfil agresivo que necesita el dinero en 18 meses opera como conservador.

**Reglas de perfil:**
- **El perfil NO cambia porque el mercado suba o baje.** Ese es exactamente el momento en que la gente lo
  cambia, y por eso compra caro y vende barato. Si el usuario quiere volverse agresivo tras tres meses de
  subidas, o conservador en mitad de una caída, señalarlo como lo que es.
- El perfil solo se revisa por: cambio de ingresos, de horizonte, de necesidad de liquidez, o experiencia
  real acumulada (haber vivido una caída fuerte sí es motivo legítimo de revisión).
- Si el perfil declarado y la cartera real no encajan, decirlo en el primer informe.

---

## PARTE B — Cartera

### Tabla de posiciones

| Activo | Ticker | Tipo | Part. | Precio medio | Precio actual | Valor | G/P € | G/P % | Peso | Riesgo | Tesis |
|---|---|---|---|---|---|---|---|---|---|---|---|

- **Tipo**: acción / ETF / fondo / renta fija / materia prima / cripto / liquidez.
- **Precio actual**: con fecha y hora del dato (§`fuentes-y-datos.md`). Sin fecha, la fila está incompleta.
- **Riesgo**: bajo / medio / alto / muy alto, según volatilidad histórica y concentración del negocio.
- **Tesis**: una línea. **Si una posición no tiene tesis escrita, marcarla ⚠️ en cada informe** hasta que la
  tenga o se cierre. Una posición sin tesis no se puede evaluar ni vender con criterio: solo se puede sufrir.

### Métricas a calcular siempre

**Rentabilidad**
```
Rentabilidad total    = (Valor actual − Coste total) / Coste total
Rentabilidad mensual  = (Valor fin de mes − Valor inicio − Aportaciones) / (Valor inicio + Aportaciones)
```
La resta de aportaciones es imprescindible: sin ella, meter dinero parece rentabilidad.
Comparar siempre contra la referencia pasiva del periodo (índice global amplio).

**Concentración**
- Peso de la mayor posición, y peso de las 3 mayores juntas.
- 🔴 si una sola posición supera el 20-25% de la cartera (salvo fondos indexados amplios, que ya diversifican dentro).
- **Concentración oculta**: posiciones distintas que suben y bajan a la vez cuentan como una sola apuesta.
  Cinco tecnológicas americanas no son cinco posiciones: son una. Señalarlo siempre que aparezca.

**Diversificación**
- **Geográfica**: EEUU / Europa / Japón / emergentes / España. Sesgo local habitual: demasiado IBEX por cercanía.
- **Sectorial**: tecnología, salud, financiero, energía, consumo, industrial, utilities, inmobiliario.
- **Por divisas**: exposición real a USD, EUR y otras. Una acción europea que factura en dólares tiene riesgo
  divisa aunque cotice en euros — un ETF global no cubierto es exposición a USD, aunque se compre en €.

**Exposición por clase de activo**
Renta variable · renta fija · materias primas · cripto · liquidez. En % y en €.
Contrastar con el rango del perfil y marcar la desviación.

**Liquidez**
- Disponible sin vender nada: [€]
- Disponible sin vender a pérdida: [€]
- ¿Cubre la necesidad de liquidez declarada en el perfil? Si no, es la prioridad número uno, por delante de
  cualquier oportunidad de mercado.

### Reequilibrio
- Se revisa en el informe semanal; **se ejecuta por bandas, no por calendario**: cuando una clase de activo
  se desvía más de ~5 puntos porcentuales de su objetivo.
- Reequilibrar demasiado a menudo genera costes y fiscalidad sin mejorar el resultado.
- **Preferir reequilibrar con las aportaciones nuevas** (comprar lo que está infraponderado) antes que
  vendiendo lo sobreponderado: evita el peaje fiscal.
- Recordar el impacto fiscal antes de proponer una venta de reequilibrio: en España las plusvalías tributan
  en la base del ahorro. No calcularlo — eso es de asesor fiscal — pero sí nombrarlo.
