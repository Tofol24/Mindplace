---
name: codex-review
description: Revisión independiente con Codex (OpenAI) del trabajo hecho por Claude. Tiene coste: úsala cuando la tarea toque funciones de servidor, integraciones externas, el manejo de datos de pacientes o sea una app nueva o un cambio grande de arquitectura, y siempre que el usuario pida "revisión con Codex" o "que Codex lo revise". Para el resto basta con `npm run check`.
---

# Revisión con Codex

Es la segunda capa. La primera, gratis y siempre, es `npm run check` (ver `CLAUDE.md`):
HTML, accesibilidad, errores de JavaScript y privacidad. Codex se reserva para la lógica,
la seguridad y la privacidad de datos que una herramienta automática no ve.

## Pasos
1. `npm run check` sin errores (y las pruebas de la app, si tiene).
2. Ejecuta desde la raíz, revisando solo la tarea:
   `bash .claude/skills/codex-review/codex-review.sh --desde <commit donde empezó la tarea>`
   - Sin `--desde`: revisa desde la última revisión hecha en esta copia (o toda la rama si no hay).
   - `--completa`: toda la rama frente a `main` (caro; solo apps nuevas).
   - `--a-fondo` / `--rapida`: más o menos razonamiento (por defecto, medio).
   - `CODEX_MODEL=<modelo>` para elegir modelo.
   - Si no hay cambios en el alcance, sale sin llamar a Codex.
3. Lee el informe de `.codex-review/review-<fecha>.md`.
4. Verifica cada hallazgo en el código: corrige los reales; los que descartes, justifícalos.
5. Si has corregido algo crítico o importante, **una** segunda pasada `--desde` el commit
   revisado. No repitas en bucle.
6. Al usuario: resumen breve de qué encontró Codex, qué se ha corregido y qué se ha descartado (y por qué).

## Si no se puede ejecutar
- Sin `CODEX_API_KEY` u `OPENAI_API_KEY` (código 2), rama o commit inexistente (código 3),
  Codex sin saldo o sin red (código 4): dilo claramente al usuario y **no** des la revisión
  por hecha ni la simules.
- La clave se añade como variable de entorno `CODEX_API_KEY` (o `OPENAI_API_KEY`) en la
  configuración del entorno (nunca pegada en el chat).

## Usarla en todos los proyectos
Copia la carpeta `.claude/skills/codex-review/` a `~/.claude/skills/codex-review/` en tu ordenador
(se aplica a todos tus proyectos) o a `.claude/skills/` de cada repositorio.
