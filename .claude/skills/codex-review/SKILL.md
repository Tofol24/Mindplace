---
name: codex-review
description: Revisión independiente con Codex (OpenAI) de todo el trabajo hecho por Claude. Úsala SIEMPRE al terminar cualquier tarea que modifique archivos, antes de hacer commit final o dar el trabajo por cerrado, y también cuando el usuario pida "revisión con Codex" o "que Codex lo revise".
---

# Revisión con Codex

Claude no da por terminado ningún trabajo sin que Codex lo haya revisado.

## Pasos
1. Ejecuta el script de esta skill desde la raíz del repositorio:
   `bash .claude/skills/codex-review/codex-review.sh [rama-base]` (por defecto `main`).
   Lanza Codex en modo solo lectura sobre el diff de la rama frente a la base y los cambios sin commitear.
2. Lee el informe que se guarda en `.codex-review/review-<fecha>.md`.
3. Verifica cada hallazgo en el código: corrige los reales; los que descartes, justifícalos.
4. Si has corregido algo, vuelve a ejecutar la revisión hasta que no queden hallazgos críticos ni importantes.
5. Al usuario: resumen breve de qué encontró Codex, qué se ha corregido y qué se ha descartado (y por qué).

## Si no se puede ejecutar
- Sin `CODEX_API_KEY` u `OPENAI_API_KEY` (el script sale con código 2), con una rama base inexistente (código 3) o sin red para instalar `@openai/codex`:
  dilo claramente al usuario y **no** des la revisión por hecha ni la simules.
- La clave se añade como variable de entorno `CODEX_API_KEY` (o `OPENAI_API_KEY`) en la configuración del entorno
  (nunca pegada en el chat).

## Usarla en todos los proyectos
Copia la carpeta `.claude/skills/codex-review/` a `~/.claude/skills/codex-review/` en tu ordenador
(se aplica a todos tus proyectos) o a `.claude/skills/` de cada repositorio.
