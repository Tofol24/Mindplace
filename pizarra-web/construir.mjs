// Pizarra del entrenador · prepara la carpeta publico/ del sitio propio.
// Copia la app (app/pizarra) y lo poco que usa del resto de app/, más las páginas de la suscripción.
// Ejecutar: node construir.mjs   (lo hace Netlify al publicar)
import { cpSync, mkdirSync, rmSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const app = join(aqui, "..", "app");
const sal = join(aqui, "publico");

rmSync(sal, { recursive: true, force: true });
mkdirSync(sal, { recursive: true });
const copiar = (de, a) => {
  if (!existsSync(de)) throw new Error("Falta " + de);
  mkdirSync(dirname(a), { recursive: true });
  cpSync(de, a, { recursive: true });
};

copiar(join(app, "pizarra"), join(sal, "pizarra"));
copiar(join(app, "vendor", "lz-string.min.js"), join(sal, "vendor", "lz-string.min.js"));
copiar(join(app, "js", "descarga-segura.js"), join(sal, "js", "descarga-segura.js"));
for (const f of readdirSync(join(app, "entrenador")).filter((x) => /^aprens-icona-.*\.png$/.test(x))) {
  copiar(join(app, "entrenador", f), join(sal, "entrenador", f));
}
for (const f of readdirSync(join(aqui, "paginas"))) copiar(join(aqui, "paginas", f), join(sal, f));
copiar(join(aqui, "_headers"), join(sal, "_headers"));
console.log("publico/ preparado");
