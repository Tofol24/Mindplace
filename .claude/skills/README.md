# Skills del proyecto

Skills de Claude Code versionadas con el repositorio. Se activan solas cuando la conversación encaja con su
`description`; también se pueden invocar a mano con `/nombre-de-la-skill`.

| Skill | Nivel | Para qué sirve |
|---|---|---|
| `asesor-inversion` | **Operativo — día a día y semana** | Analista financiero personal: perfil, cartera, informe diario y semanal, estado del mercado con datos buscados en vivo, puntuación 0-100, detector de oportunidades, escenarios y decisión propuesta. |
| `analisis-inversion` | Método y referencia | Marco de análisis de un activo: filtros de riesgo, plataforma, fondo y precio; tamaño de posición; fiabilidad de un exchange; diario de operaciones. Sirve de biblioteca a `asesor-inversion`. |

## Cómo se usan

**Día a día**, con `asesor-inversion`:

| Comando | Qué devuelve |
|---|---|
| `INFORME DIARIO` | Estado del mercado, semáforos, cartera, oportunidades, riesgos y Decisión del Día |
| `INFORME SEMANAL` | Revisión de la semana, exposiciones vs. objetivo, disciplina y agenda |
| `ANALIZA EL MERCADO` | Índices, VIX, tipos, macro, amplitud y sentimiento |
| `MI PERFIL` / `MI CARTERA` | Perfilado o estado completo de la cartera |
| `PUNTÚA [activo]` | Puntuación 0-100 con desglose por dimensión |
| `OPORTUNIDADES` | Máximo 3, clasificadas 🟢🟡🔴⚫ |
| `ESCENARIOS` | Alcista / base / bajista + qué hace la cartera en cada uno |
| `TENGO 1.000 €` | Reparto propuesto, o mantener en liquidez |

**Análisis de fondo o dudas puntuales**, con `analisis-inversion`: basta con pegar una captura de una app,
nombrar un activo o preguntar "¿es fiable esta plataforma?" / "¿cuánto meto?".

## ⚠️ Datos personales

Este repositorio **publica un sitio web**. El perfil, la cartera y el capital **no se guardan aquí**.
Van fuera del repositorio:

```
~/inversion/perfil.md
~/inversion/cartera.md
~/inversion/diario.md
```

Plantillas vacías en `.claude/skills/asesor-inversion/plantillas/`. Para arrancar:

```bash
mkdir -p ~/inversion && cp .claude/skills/asesor-inversion/plantillas/*.md ~/inversion/
```

El `.gitignore` del repositorio bloquea `inversion/` y `*-real.md` como red de seguridad, pero la regla es
no meterlos nunca dentro.

## Límites

Ambas skills entregan escenarios, condiciones, riesgos y criterios de invalidación. `asesor-inversion` sí
propone acciones concretas (COMPRAR / MANTENER / VENDER / NO HACER NADA), siempre con argumentos en contra y
con las condiciones que invalidarían la tesis. Es apoyo a la decisión personal, no asesoramiento financiero
regulado — en España esa actividad está reservada a entidades autorizadas por la CNMV.

`asesor-inversion` **busca datos actualizados antes de responder** y nunca los recuerda de memoria: si no
consigue información suficientemente reciente, lo dice y bloquea la decisión en `SIN DATOS SUFICIENTES`.

## Fuera de este repositorio

```bash
cp -r .claude/skills/asesor-inversion .claude/skills/analisis-inversion ~/.claude/skills/
```
