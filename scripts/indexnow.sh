#!/usr/bin/env bash
# Avisa Bing (i els altres cercadors d'IndexNow) que les pàgines d'aprens.net i explica.aprens.net
# són noves o han canviat. Llegeix les adreces dels sitemap.xml publicats.
# Fes-lo servir després de publicar canvis importants:  ./scripts/indexnow.sh
# La clau és pública per disseny: el fitxer <clau>.txt ha d'estar a l'arrel de cada lloc
# (portada/ i estudi/web-pacients/). Si canvies la clau, canvia també els dos fitxers.
set -euo pipefail
KEY=4591a3862babd911bd99f48d372de90d
for HOST in aprens.net explica.aprens.net; do
  URLS=$(curl -fsS "https://$HOST/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's#</\?loc>##g' | python3 -c 'import sys,json;print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')
  BODY=$(printf '{"host":"%s","key":"%s","keyLocation":"https://%s/%s.txt","urlList":%s}' "$HOST" "$KEY" "$HOST" "$KEY" "$URLS")
  CODE=$(curl -sS -o /dev/null -w '%{http_code}' -X POST https://api.indexnow.org/indexnow -H 'content-type: application/json; charset=utf-8' -d "$BODY")
  echo "$HOST: $(echo "$URLS" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))') adreces → IndexNow respon $CODE (200 o 202 = rebut)"
done
