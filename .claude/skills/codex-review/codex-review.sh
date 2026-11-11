#!/usr/bin/env bash
# Revisión independiente con Codex (OpenAI). Pensada para usarse poco: antes conviene
# pasar `npm run check`, que es gratis y ya cubre HTML, accesibilidad básica y privacidad.
#
# Uso: bash .claude/skills/codex-review/codex-review.sh [rama-base] [opciones]
#   rama-base         por defecto main
#   --desde <ref>     revisa solo lo cambiado desde ese commit (p. ej. donde empezó la tarea)
#   --completa        revisa toda la rama frente a la base (lo más caro)
#   --a-fondo         más razonamiento (más caro); por defecto, medio
#   --rapida          menos razonamiento (más barato)
# Sin --desde ni --completa: lo cambiado desde la última revisión hecha en esta copia
# (o toda la rama si no hay ninguna).
# Variables: CODEX_MODEL (modelo; por defecto el de Codex), CODEX_REVIEW_DIR.
# Requiere CODEX_API_KEY u OPENAI_API_KEY en el entorno.
set -euo pipefail

BASE="main"
DESDE=""
COMPLETA=0
ESFUERZO="medium"
while [ $# -gt 0 ]; do
  case "$1" in
    --desde) DESDE="${2:?--desde necesita un commit}"; shift 2 ;;
    --completa) COMPLETA=1; shift ;;
    --a-fondo) ESFUERZO="high"; shift ;;
    --rapida) ESFUERZO="low"; shift ;;
    -*) echo "codex-review: opción desconocida: $1" >&2; exit 3 ;;
    *) BASE="$1"; shift ;;
  esac
done
OUT_DIR="${CODEX_REVIEW_DIR:-.codex-review}"

# codex exec se autentica con CODEX_API_KEY; se acepta OPENAI_API_KEY como alternativa.
export CODEX_API_KEY="${CODEX_API_KEY:-${OPENAI_API_KEY:-}}"
if [ -z "$CODEX_API_KEY" ]; then
  echo "codex-review: falta CODEX_API_KEY (u OPENAI_API_KEY); no se puede ejecutar la revisión." >&2
  exit 2
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

# Desde dónde se revisa: lo explícito, si no la última revisión de esta rama, si no toda la rama.
RAMA=$(git rev-parse --abbrev-ref HEAD | tr '/' '_')
MARCA="$OUT_DIR/ultima-$RAMA"
ALCANCE="toda la rama"
DESDE_SHA="$BASE_SHA"
if [ "$COMPLETA" -eq 0 ]; then
  CANDIDATO="$DESDE"
  [ -z "$CANDIDATO" ] && [ -f "$MARCA" ] && CANDIDATO=$(cat "$MARCA")
  if [ -n "$CANDIDATO" ]; then
    if ! SHA=$(git rev-parse -q --verify "$CANDIDATO^{commit}"); then
      echo "codex-review: no encuentro el commit '$CANDIDATO'." >&2
      exit 3
    fi
    if git merge-base --is-ancestor "$SHA" HEAD; then
      DESDE_SHA="$SHA"
      ALCANCE="desde $(git rev-parse --short "$SHA")"
    elif [ -n "$DESDE" ]; then
      echo "codex-review: '$DESDE' no es un commit anterior de esta rama." >&2
      exit 3
    fi
  fi
fi
RANGE="$DESDE_SHA...HEAD"
git diff --quiet "$RANGE" >/dev/null 2>&1 || [ $? -eq 1 ] || { echo "codex-review: git diff $RANGE falla." >&2; exit 3; }

# Nada que revisar: no se gasta una llamada.
if git diff --quiet "$RANGE" && git diff --quiet HEAD && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "codex-review: no hay cambios ($ALCANCE); no hace falta revisar."
  exit 0
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "codex-review: instalando @openai/codex..." >&2
  npm install -g @openai/codex >/dev/null
fi

mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/review-$(date +%Y%m%d-%H%M%S).md"

PROMPT="Eres un revisor de código independiente. Revisa SOLO los cambios de 'git diff $RANGE' \
(y los cambios sin commitear, si los hay) en este repositorio; lee otros archivos solo para entender esos cambios. \
Son apps para pacientes de psicología. Busca errores de lógica, regresiones, seguridad y privacidad de datos. \
Ya se han pasado comprobaciones automáticas (HTML válido, accesibilidad básica con axe, variables sin definir, \
recursos de terceros): no repitas eso ni comentes estilo. No modifiques archivos y no lances experimentos largos. \
Informa solo de lo crítico e importante (como mucho 8 hallazgos), en español, con archivo:línea, el problema \
y la corrección propuesta. Si no hay nada crítico ni importante, dilo en una frase."

MODELO=()
[ -n "${CODEX_MODEL:-}" ] && MODELO=(-m "$CODEX_MODEL")

{
  echo "<!-- base: $BASE_REF @ $BASE_SHA | alcance: $ALCANCE | head: $(git rev-parse HEAD) | esfuerzo: $ESFUERZO -->"
  [ -n "$AVISO" ] && echo "> AVISO: $AVISO"
  echo
} > "$REPORT"
echo "codex-review: revisando $ALCANCE (esfuerzo $ESFUERZO)…" >&2
# Si Codex no ha podido revisar (p. ej. sin saldo), que no parezca una revisión limpia.
# (${MODELO[@]+…}: el bash 3.2 del Mac no admite un array vacío con set -u.)
if ! codex exec --sandbox read-only ${MODELO[@]+"${MODELO[@]}"} -c "model_reasoning_effort=\"$ESFUERZO\"" "$PROMPT" </dev/null | tee -a "$REPORT" \
  || [ "$(grep -cv '^\s*$\|^<!--\|^> AVISO' "$REPORT")" -eq 0 ]; then
  echo "codex-review: Codex no ha completado la revisión (¿sin saldo o sin red?). No la des por hecha." >&2
  echo "> Codex no ha completado esta revisión." >> "$REPORT"
  exit 4
fi
# Solo se marca como revisado lo que estaba commiteado; lo pendiente se revisará la próxima vez.
git rev-parse HEAD > "$MARCA"
echo "codex-review: informe guardado en $REPORT" >&2
