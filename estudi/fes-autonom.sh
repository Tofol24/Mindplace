#!/usr/bin/env bash
# Genera explica-ho-autonom.html (per obrir directament al navegador, fora de claude.ai)
# a partir de explica-ho.html, que és la font de l'Artifact (sense <html>/<head>/<body>).
set -euo pipefail
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="ca">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
  cat explica-ho.html
  printf '\n</body>\n</html>\n'
} > explica-ho-autonom.html
echo "Fet: estudi/explica-ho-autonom.html"
