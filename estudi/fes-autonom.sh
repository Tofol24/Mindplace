#!/usr/bin/env bash
# Genera explica-ho-autonom.html (per obrir directament al navegador, fora de claude.ai)
# a partir de explica-ho.html, que és la font de l'Artifact (sense <html>/<head>/<body>).
# El bloc d'estils inicial (fins al primer </style>) va dins del <head>.
set -euo pipefail
cd "$(dirname "$0")"
fi=$(grep -n -m1 '^</style>' explica-ho.html | cut -d: -f1)
{
  printf '<!doctype html>\n<html lang="ca">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  head -n "$fi" explica-ho.html
  printf '</head>\n<body>\n'
  tail -n +"$((fi + 1))" explica-ho.html
  printf '\n</body>\n</html>\n'
} > explica-ho-autonom.html
echo "Fet: estudi/explica-ho-autonom.html"
