#!/usr/bin/env bash
# Genera web-pacients/index.html (versió amb codis d'accés) a partir de explica-ho.html.
# La meta "explica-proxy" fa que la pàgina parli amb /api/claude en lloc de demanar una clau.
# El bloc d'estils inicial (fins al primer </style>) va dins del <head>.
set -euo pipefail
cd "$(dirname "$0")"
fi=$(grep -n -m1 '^</style>' explica-ho.html | cut -d: -f1)
{
  printf '<!doctype html>\n<html lang="ca">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n<meta name="explica-proxy" content="/api/claude">\n'
  head -n "$fi" explica-ho.html
  printf '</head>\n<body>\n'
  tail -n +"$((fi + 1))" explica-ho.html
  printf '\n</body>\n</html>\n'
} > web-pacients/index.html
echo "Fet: estudi/web-pacients/index.html"
