// Ensambla native/www/ a partir de la app consumer, PRESERVANDO la estructura
// de rutas (bienestar/ usa ../js, ../vendor, ../tools-standalone), de modo que
// no hace falta reescribir ninguna ruta. La raíz redirige a bienestar/.
//
// Uso:  node assemble.mjs        (desde la carpeta native/)
import { cpSync, rmSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const APP = resolve(here, "..", "app");     // fuente
const WWW = resolve(here, "www");           // destino (webDir de Capacitor)

if (!existsSync(APP)) { console.error("No encuentro ../app"); process.exit(1); }

// limpiar
rmSync(WWW, { recursive: true, force: true });
mkdirSync(WWW, { recursive: true });

// copiar solo lo que la app consumer necesita (mismo layout que app/)
const COPY = ["bienestar", "js", "vendor", "assets", "tools-standalone"];
for (const dir of COPY) {
  const src = resolve(APP, dir);
  if (existsSync(src)) cpSync(src, resolve(WWW, dir), { recursive: true });
}

// La app clínica (index.html raíz, panel/, css de módulos clínicos) NO se incluye.
// Raíz de la app nativa → redirige a la consumer:
writeFileSync(resolve(WWW, "index.html"),
`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta http-equiv="refresh" content="0; url=./bienestar/index.html">
<title>Anclado en mí</title></head>
<body><script>location.replace("./bienestar/index.html");</script></body></html>\n`);

console.log("✅ native/www ensamblado (" + COPY.join(", ") + " + redirect).");
