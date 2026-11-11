#!/usr/bin/env bash
# Genera web-pacients/index.html (versió amb codis d'accés) a partir de explica-ho.html.
# La meta "explica-proxy" fa que la pàgina parli amb /api/claude en lloc de demanar una clau.
set -euo pipefail
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="ca">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n<meta name="explica-proxy" content="/api/claude">\n</head>\n<body>\n'
  # Lletres i lectors de PDF i Word des del mateix domini (/fonts i /vendor), com exigeix la CSP de _headers.
  sed -e '/<link rel="preconnect" href="https:\/\/fonts\.g[a-z]*\.com"/d' \
      -e 's#<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2?[^"]*">#<link rel="stylesheet" href="/fonts/fonts.css">#' \
      -e 's#https://cdn\.jsdelivr\.net/npm/pdfjs-dist@3\.11\.174/build/#/vendor/#g' \
      -e 's#https://cdn\.jsdelivr\.net/npm/mammoth@1\.6\.0/#/vendor/#g' \
      explica-ho.html
  printf '\n</body>\n</html>\n'
} > web-pacients/index.html
if grep -qE 'fonts\.g(oogleapis|static)\.com|cdn\.jsdelivr\.net' web-pacients/index.html; then
  echo "Atenció: index.html encara carrega recursos externs que la CSP bloqueja (actualitza fes-pacients.sh)." >&2; exit 1
fi
echo "Fet: estudi/web-pacients/index.html"
