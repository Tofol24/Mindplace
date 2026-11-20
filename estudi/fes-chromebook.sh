#!/usr/bin/env bash
# Genera explica-ho-chromebook.html: el fitxer autònom, però sense res de fora.
# Per a ordinadors amb filtre (Chromebooks de l'institut, Lazarus…) que no deixen obrir explica.aprens.net
# ni descarregar lletres i lectors de cdn.jsdelivr.net o Google Fonts.
# - Lletres: dins del fitxer (data:), a partir de web-pacients/fonts.
# - Lectors de PDF i Word: dins del fitxer (base64), a partir de web-pacients/vendor; es carreguen només si cal.
# - Claude: amb la clau de l'API (Configuració), com el fitxer autònom. Només surt cap a api.anthropic.com.
# Es fa a partir de explica-ho-autonom.html; no s'edita a mà. El fitxer generat no es puja al repositori (.gitignore).
set -euo pipefail
cd "$(dirname "$0")"
./fes-autonom.sh >/dev/null
python3 -I - <<'PY'
import base64, re, pathlib
src = pathlib.Path("explica-ho-autonom.html").read_text(encoding="utf-8")
b64 = lambda p: base64.b64encode(pathlib.Path(p).read_bytes()).decode()

# 1. Lletres
css = pathlib.Path("web-pacients/fonts/fonts.css").read_text(encoding="utf-8")
css = re.sub(r"url\(([\w.-]+\.woff2)\)", lambda m: "url(data:font/woff2;base64," + b64("web-pacients/fonts/" + m.group(1)) + ")", css)
src = re.sub(r'<link rel="preconnect" href="https://fonts\.g[a-z]*\.com"[^>]*>\n', "", src)
src, n = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?[^"]*">', lambda m: "<style>\n" + css + "</style>", src)
assert n == 1, "no trobo l'enllaç de Google Fonts"

# 2. Lectors de PDF i Word
old_pdf = re.search(r"async function getPdfjs\(\) \{.*?\n\}\nasync function getMammoth\(\) \{[^\n]*\}\n", src, re.S)
assert old_pdf, "no trobo getPdfjs/getMammoth"
new = '''// Versió Chromebook: els lectors van dins del fitxer (vegeu els <script type="application/octet-stream"> del final).
function libURL(id) {
  const bin = atob(document.getElementById(id).textContent.trim()), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([u], {type: "text/javascript"}));
}
const libUrls = {};
const lib = (id) => libUrls[id] ||= libURL(id);
async function getPdfjs() {
  await loadScript(lib("lib-pdf"));
  await loadScript(lib("lib-pdf-worker"));
  const pdf = window.pdfjsLib; pdf.GlobalWorkerOptions.workerSrc = lib("lib-pdf-worker");
  return pdf;
}
async function getMammoth() { await loadScript(lib("lib-mammoth")); return window.mammoth; }
'''
src = src[:old_pdf.start()] + new + src[old_pdf.end():]
blobs = "".join(f'<script type="application/octet-stream" id="{i}">{b64("web-pacients/vendor/" + f)}</script>\n'
                for i, f in [("lib-pdf", "pdf.min.js"), ("lib-pdf-worker", "pdf.worker.min.js"), ("lib-mammoth", "mammoth.browser.min.js")])
src = src.replace("\n</body>\n</html>\n", "\n" + blobs + "</body>\n</html>\n")
src = src.replace("<title>Explica-ho</title>", "<title>Explica-ho (Chromebook)</title>", 1)

ext = re.findall(r"https://(?!api\.anthropic\.com|aprens\.net|www\.w3\.org)[\w.-]+", src)
assert not [e for e in ext if "jsdelivr" in e or "googleapis" in e or "gstatic" in e], ext
pathlib.Path("explica-ho-chromebook.html").write_text(src, encoding="utf-8")
PY
echo "Fet: estudi/explica-ho-chromebook.html ($(du -h explica-ho-chromebook.html | cut -f1))"
