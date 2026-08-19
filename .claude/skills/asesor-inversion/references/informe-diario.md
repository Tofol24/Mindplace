# Informe Diario y Semanal

---

## 1. INFORME DIARIO — formato exacto

Se entrega en este orden y con esta extensión. **La brevedad es parte del diseño**: un informe largo se deja
de leer a la semana, y el sistema deja de servir.

```
📊 INFORME DIARIO · [DD/MM/AAAA] · [hora] CET
Datos de: [fecha y hora de los datos usados] · Fuentes: [nombrarlas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ESTADO DEL MERCADO
[Máximo 5 líneas. Qué ha pasado y por qué. Sin adjetivos de más.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌡️ SEMÁFORO
Mercado:      🟢/🟡/🔴  [una línea con el dato que lo sostiene]
Volatilidad:  🟢/🟡/🔴  [VIX en X → banda]
Valoraciones: 🟢/🟡/🔴  [múltiplo vs. media histórica]
Macro:        🟢/🟡/🔴  [el dato que más pesa hoy]

Sentimiento: MIEDO / NEUTRALIDAD / OPTIMISMO / EUFORIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 MI CARTERA
Valor: [€]  ([+/-X %] hoy · [+/-Y %] en el año)
Qué ha cambiado: [solo lo relevante. Si no ha cambiado nada relevante, escribir "nada relevante"]
Posiciones que requieren atención: [las que se acercan a su invalidación, o ninguna]
⚠️ Posiciones sin tesis escrita: [listarlas, o ninguna]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔎 OPORTUNIDADES  (máximo 3)
1. [Activo] 🟢/🟡/🔴/⚫ · [N]/100 · [una línea: por qué]
2. ...
[Si no hay ninguna: "Ninguna que supere el filtro hoy." Es una respuesta normal.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RIESGOS  (máximo 3)
1. [Riesgo] · [qué lo activaría] · [a qué parte de la cartera afecta]
2. ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 DECISIÓN DEL DÍA
[COMPRAR / COMPRAR GRADUALMENTE / MANTENER / REDUCIR / ESPERAR / NO HACER NADA]

Motivo: [dos líneas máximo]
[Si hay operación concreta: ficha completa de recomendación → motor-decision.md §4]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💶 SI HOY TUVIERA 1.000 € NUEVOS
[Reparto propuesto según perfil y condiciones actuales, en euros y en %]
[O bien: "mantenerlos en liquidez, porque..." — opción válida y a veces la mejor]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apoyo a la decisión personal, no asesoramiento financiero regulado.
```

### Reglas del informe

- **`NO HACER NADA` es una decisión legítima y frecuente.** No inflar el informe con actividad inventada.
  Un mes con veinte "no hacer nada" y dos decisiones buenas es un mes excelente.
- **Sin datos frescos** (§`fuentes-y-datos.md`): la Decisión del Día es `SIN DATOS SUFICIENTES`. No se sustituye
  por una recomendación genérica.
- **Fin de semana o festivo**: los mercados de acciones están cerrados. Informe reducido (cripto, noticias,
  preparación de la semana) y decirlo, en lugar de simular una sesión que no ha existido.
- El bloque de los 1.000 € se adapta a la cifra que diga el usuario (`TENGO 500 €`, `TENGO 5.000 €`).
- Si dos días seguidos la decisión es la misma y nada relevante ha cambiado, decirlo explícitamente:
  *"Sin cambios respecto a ayer."* — y acortar el informe, no repetirlo entero.

---

## 2. Reparto de dinero nuevo

Al proponer el reparto, considerar en este orden:

1. **¿Está cubierto el fondo de emergencia y la necesidad de liquidez del perfil?**
   Si no, todo va ahí. Sin excepciones y antes que cualquier oportunidad de mercado.
2. **¿Hay alguna clase de activo fuera de su banda objetivo?** Reequilibrar con dinero nuevo es la forma
   barata de reequilibrar: sin ventas, sin peaje fiscal.
3. **¿Hay una oportunidad 🟢 vigente?** Si la hay, entra una parte, nunca todo de golpe.
4. **¿La volatilidad es elevada o extrema?** Entonces fraccionar la entrada en varios tramos.
5. **Si nada de lo anterior aplica**: aportación al núcleo de la cartera según los pesos objetivo, o liquidez.

Formato:

```
💶 REPARTO DE [X] €
[Destino 1]: [€] ([%]) — [motivo en una línea]
[Destino 2]: [€] ([%]) — [motivo]
Liquidez:    [€] ([%]) — [motivo]

Ritmo: [de una vez / en N tramos a lo largo de N semanas]
Motivo del ritmo: [ ]
```

**La liquidez es una posición, no un fallo.** Cuando el análisis no encuentra nada con relación
rentabilidad/riesgo favorable, esperar en liquidez es la decisión correcta, y hay que decirlo así, sin
disculparse por ello.

---

## 3. INFORME SEMANAL

Más corto que cinco informes diarios, y más útil. Se centra en el proceso, no en el marcador.

```
📅 INFORME SEMANAL · semana del [DD] al [DD/MM/AAAA]

📊 QUÉ HA PASADO
[Máximo 5 líneas: lo que ha movido el mercado esta semana]

💼 CARTERA
Valor: [€] · Semana: [+/-%] · Año: [+/-%] · Referencia pasiva: [+/-%]
Aportaciones de la semana: [€]

🔄 EXPOSICIONES vs. OBJETIVO
| Clase | Actual | Objetivo | Desviación |
[Marcar 🔴 lo que se desvíe más de 5 puntos porcentuales]

✅ DECISIONES TOMADAS ESTA SEMANA
[Qué se hizo, con qué motivo, y si se siguió el plan]

📋 DISCIPLINA
Operaciones propuestas: [N] · Ejecutadas: [N] · Con cambio significativo detrás: [N]
Patrones de sobreoperación detectados: [ninguno / cuáles]

📆 AGENDA DE LA PRÓXIMA SEMANA
[Reuniones de bancos centrales, publicaciones macro, resultados relevantes — del calendario oficial, con fecha]

🎯 ENFOQUE DE LA SEMANA QUE VIENE
[Una sola cosa a vigilar. Una.]
```

**Métrica que importa en el semanal:** no el resultado, sino cuántas decisiones siguieron el plan escrito.
El resultado de una semana es ruido; el proceso es lo único controlable.

---

## 4. Cadencia recomendada

| Frecuencia | Qué | Para quién |
|---|---|---|
| Diario | `INFORME DIARIO` | Solo si hay posiciones de corto plazo abiertas o el mercado está tensionado |
| Semanal | `INFORME SEMANAL` | **Cadencia por defecto.** Suficiente para casi cualquier cartera |
| Mensual | Revisión de exposiciones y aportación programada | Todos |
| Semestral | Revisión de perfil | Todos |

**Advertencia honesta:** mirar la cartera todos los días no mejora el resultado y sí empeora las decisiones —
aumenta la probabilidad de operar por ruido. Si el usuario pide informe diario sin tener operativa de corto
plazo abierta, decírselo una vez y hacerlo igualmente si insiste: es su decisión.
