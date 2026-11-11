#!/usr/bin/env bash
# Genera web-pacients/index.html (versió amb codis d'accés) a partir de explica-ho.html.
# La meta "explica-proxy" fa que la pàgina parli amb /api/claude en lloc de demanar una clau.
# El bloc d'estils inicial (fins al primer </style>) va dins del <head>.
# Per als cercadors i els assistents (ChatGPT…), que no executen JavaScript: títol, descripció,
# etiquetes per compartir i el text de presentacio-web.html dins <main> (l'eina el substitueix en arrencar).
set -euo pipefail
cd "$(dirname "$0")"
fi=$(grep -n -m1 '^</style>' explica-ho.html | cut -d: -f1)
DESC="Eina d'estudi amb IA que t'ajuda a interioritzar els conceptes, no que ho faci per tu: resums, mapes conceptuals, preguntes i exercicis corregits pas a pas. ESO, batxillerat, FP, universitat i oposicions. Herramienta de estudio con IA: si no lo puedes explicar, no te lo sabes."
{
  printf '<!doctype html>\n<html lang="ca">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="index, follow">\n<meta name="explica-proxy" content="/api/claude">\n'
  printf '<meta name="description" content="%s">\n<link rel="canonical" href="https://explica.aprens.net/">\n' "$DESC"
  # Verificació de Bing Webmaster Tools (explica.aprens.net). No la treguis: Bing la torna a comprovar.
  printf '<meta name="msvalidate.01" content="B0ABF317EE25CC7F78C872EAB330A9E8">\n'
  printf '<meta property="og:type" content="website">\n<meta property="og:url" content="https://explica.aprens.net/">\n<meta property="og:title" content="Explica-ho · Si no ho pots explicar, no t%sho saps">\n<meta property="og:description" content="%s">\n' "'" "$DESC"
  head -n "$fi" explica-ho.html | sed 's#^<title>Explica-ho</title>$#<title>Explica-ho · Si no ho pots explicar, no t'"'"'ho saps</title>#'
  printf '</head>\n<body>\n'
  tail -n +"$((fi + 1))" explica-ho.html \
    | sed "s#<span class=\"label\">Estudi de 4t d'ESO</span>#<span class=\"label\">Estudi actiu</span>#" \
    | awk -v f=presentacio-web.html '$0 ~ /^  <main id="main"><\/main>$/ { print "  <main id=\"main\">"; while ((getline l < f) > 0) { if (l ~ /^<!--/) c = 1; if (!c) print l; if (l ~ /-->$/) c = 0 }; print "  </main>"; next } { print }'
  printf '\n</body>\n</html>\n'
} > web-pacients/index.html
grep -q 'id="presentacio"' web-pacients/index.html || { echo "Error: no s'ha posat el text de presentació" >&2; exit 1; }
# Lletres i lectors de PDF i Word des del mateix domini (/fonts i /vendor), com exigeix la CSP de _headers.
sed -i -e '/<link rel="preconnect" href="https:\/\/fonts\.g[a-z]*\.com"/d' \
       -e 's#<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2?[^"]*">#<link rel="stylesheet" href="/fonts/fonts.css">#' \
       -e 's#https://cdn\.jsdelivr\.net/npm/pdfjs-dist@3\.11\.174/build/#/vendor/#g' \
       -e 's#https://cdn\.jsdelivr\.net/npm/mammoth@1\.6\.0/#/vendor/#g' \
       web-pacients/index.html
if grep -qE 'fonts\.g(oogleapis|static)\.com|cdn\.jsdelivr\.net' web-pacients/index.html; then
  echo "Atenció: index.html encara carrega recursos externs que la CSP bloqueja (actualitza fes-pacients.sh)." >&2; exit 1
fi
echo "Fet: estudi/web-pacients/index.html"
