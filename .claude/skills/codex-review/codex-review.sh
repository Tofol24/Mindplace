#!/usr/bin/env bash
# Revisión independiente con Codex (OpenAI) de los cambios de esta rama frente a main.
# Uso: bash .claude/skills/codex-review/codex-review.sh [rama-base]   (por defecto: main)
# Requiere CODEX_API_KEY u OPENAI_API_KEY en el entorno.
set -euo pipefail

BASE="${1:-main}"
OUT_DIR="${CODEX_REVIEW_DIR:-.codex-review}"

# codex exec se autentica con CODEX_API_KEY; se acepta OPENAI_API_KEY como alternativa.
export CODEX_API_KEY="${CODEX_API_KEY:-${OPENAI_API_KEY:-}}"
if [ -z "$CODEX_API_KEY" ]; then
  echo "codex-review: falta CODEX_API_KEY (u OPENAI_API_KEY); no se puede ejecutar la revisión." >&2
  exit 2
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex-review: instalando @openai/codex..." >&2
  npm install -g @openai/codex >/dev/null
fi

AVISO=""
if ! git fetch -q origin "$BASE"; then
  AVISO="No se pudo actualizar origin/$BASE: la base puede estar desactualizada."
  echo "codex-review: AVISO: $AVISO" >&2
fi

if git rev-parse -q --verify "origin/$BASE^{commit}" >/dev/null; then
  BASE_REF="origin/$BASE"
elif git rev-parse -q --verify "$BASE^{commit}" >/dev/null; then
  BASE_REF="$BASE"
else
  echo "codex-review: la rama base '$BASE' no existe; no se puede revisar." >&2
  exit 3
fi

if ! BASE_SHA=$(git merge-base "$BASE_REF" HEAD); then
  echo "codex-review: no hay historia común entre $BASE_REF y HEAD (¿clon parcial?)." >&2
  exit 3
fi
RANGE="$BASE_SHA...HEAD"
git diff --quiet "$RANGE" >/dev/null 2>&1 || [ $? -eq 1 ] || { echo "codex-review: git diff $RANGE falla." >&2; exit 3; }

mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/review-$(date +%Y%m%d-%H%M%S).md"

PROMPT="Eres un revisor de código independiente. Revisa los cambios de 'git diff $RANGE' \
(y los cambios sin commitear, si los hay) en este repositorio. Busca errores de lógica, \
regresiones, problemas de seguridad y privacidad (son apps para pacientes de psicología), \
accesibilidad y textos incorrectos. No modifiques ningún archivo. Devuelve en español una \
lista priorizada (crítico / importante / menor) con archivo:línea, el problema y la corrección propuesta. \
Si no encuentras nada relevante, dilo explícitamente."

{
  echo "<!-- base: $BASE_REF @ $BASE_SHA | head: $(git rev-parse HEAD) -->"
  [ -n "$AVISO" ] && echo "> AVISO: $AVISO"
  echo
} > "$REPORT"
codex exec --sandbox read-only "$PROMPT" | tee -a "$REPORT"
echo "codex-review: informe guardado en $REPORT" >&2
