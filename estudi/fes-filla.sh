#!/usr/bin/env bash
# Genera estudi-filla/ per publicar a estudi-filla.netlify.app (Netlify, pujada manual).
# És el fitxer autònom (clau de l'API, sense codis) amb les lletres i els lectors de PDF i Word
# servits des del mateix lloc, perquè el filtre del Chromebook (Lazarus) no bloquegi Google Fonts ni jsDelivr.
# Només es connecta a api.anthropic.com. Les dades es conserven en publicar: mateix lloc, mateixes claus (explica:*).
# Per publicar: ./publica-filla.py (fa servir l'API de Netlify).
set -euo pipefail
cd "$(dirname "$0")"
./fes-autonom.sh >/dev/null
rm -rf estudi-filla && mkdir -p estudi-filla/fonts estudi-filla/vendor
cp web-pacients/fonts/* estudi-filla/fonts/
cp web-pacients/vendor/* estudi-filla/vendor/
sed -e '/<link rel="preconnect" href="https:\/\/fonts\.g[a-z]*\.com"/d' \
    -e 's#<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2?[^"]*">#<link rel="stylesheet" href="fonts/fonts.css">#' \
    -e 's#https://cdn\.jsdelivr\.net/npm/pdfjs-dist@3\.11\.174/build/#vendor/#g' \
    -e 's#https://cdn\.jsdelivr\.net/npm/mammoth@1\.6\.0/#vendor/#g' \
    -e 's#^<meta charset="utf-8">$#<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">#' \
    explica-ho-autonom.html > estudi-filla/index.html
if grep -qE 'fonts\.g(oogleapis|static)\.com|cdn\.jsdelivr\.net' estudi-filla/index.html; then
  echo "Atenció: index.html encara carrega recursos de fora (actualitza fes-filla.sh)." >&2; exit 1
fi
echo "Fet: estudi/estudi-filla/"
