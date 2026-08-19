# Skills del proyecto

Skills de Claude Code versionadas con el repositorio. Se activan solas cuando la conversación
encaja con su `description`; también se pueden invocar a mano con `/nombre-de-la-skill`.

| Skill | Para qué sirve |
|---|---|
| `analisis-inversion` | Analizar inversiones en cripto y acciones: filtros de riesgo, plataforma, fondo y precio; tamaño de posición; diario de operaciones y revisiones. |

## Cómo usar `analisis-inversion`

Basta con hablar del tema: pegar una captura de una app de inversión, nombrar un activo, o preguntar
"¿cuánto meto?" / "¿aguanto o vendo?". La skill se activa sola.

Lo que devuelve siempre: escenarios, condiciones, riesgos y el criterio de invalidación.
Lo que no devuelve nunca: una orden de compra o venta. Es material de método, no asesoramiento financiero.

## Cómo tenerla disponible fuera de este repositorio

Esta skill vive en el repo, así que está activa en cualquier sesión abierta sobre `Mindplace`.
Para usarla en todos los proyectos, copiar la carpeta a las skills personales:

```bash
cp -r .claude/skills/analisis-inversion ~/.claude/skills/
```

Para tenerla en la cuenta (sincronizada entre dispositivos), añadirla desde el gestor de skills de Claude.
