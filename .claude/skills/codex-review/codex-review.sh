#!/usr/bin/env bash
# Revisión independiente con Codex (OpenAI) de los cambios de esta rama frente a main.
# Uso: bash .claude/skills/codex-review/codex-review.sh [rama-base]   (por defecto: main)
# Requiere la variable OPENAI_API_KEY en el entorno.
set -euo pipefail

BASE="${1:-main}"
OUT_DIR="${CODEX_REVIEW_DIR:-.codex-review}"

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "codex-review: falta OPENAI_API_KEY; no se puede ejecutar la revisión." >&2
  exit 2
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex-review: instalando @openai/codex..." >&2
  npm install -g @openai/codex >/dev/null
fi

git fetch -q origin "$BASE" 2>/dev/null || true
RANGE="origin/$BASE...HEAD"
git rev-parse -q --verify "origin/$BASE" >/dev/null || RANGE="$BASE...HEAD"

mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/review-$(date +%Y%m%d-%H%M%S).md"

PROMPT="Eres un revisor de código independiente. Revisa los cambios de 'git diff $RANGE' \
(y los cambios sin commitear, si los hay) en este repositorio. Busca errores de lógica, \
regresiones, problemas de seguridad y privacidad (son apps para pacientes de psicología), \
accesibilidad y textos incorrectos. No modifiques ningún archivo. Devuelve en español una \
lista priorizada (crítico / importante / menor) con archivo:línea, el problema y la corrección propuesta. \
Si no encuentras nada relevante, dilo explícitamente."

codex exec --sandbox read-only "$PROMPT" | tee "$REPORT"
echo "codex-review: informe guardado en $REPORT" >&2
