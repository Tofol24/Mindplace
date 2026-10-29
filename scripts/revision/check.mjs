#!/usr/bin/env node
/* Comprobaciones automáticas del repositorio, sin IA y sin coste.
   ---------------------------------------------------------------------------
   Uso (desde la raíz):
     npm run check                  solo lo cambiado frente a main (y lo sin commitear)
     npm run check -- --todo        todo el repositorio
     npm run check -- ruta.html …   solo esos archivos
     opciones: --base <rama>  --sin-navegador  --avisos (muestra también los avisos en --todo)

   Qué mira:
     html        HTML mal formado y fallos de accesibilidad estáticos (html-validate)
     js          fallos reales de JavaScript: variables sin definir, claves duplicadas… (ESLint)
     privacidad  recursos y envíos a terceros, rastreadores, material cifrado
     navegador   abre cada página en Chromium: errores de JavaScript al cargar y
                 accesibilidad (axe-core, WCAG 2.1 AA). Sin Playwright se omite.

   Sale con código 1 si hay errores; los avisos no bloquean.
*/
/* global window, document -- (dentro de pagina.evaluate, que corre en el navegador) */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../..");
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Argumentos y lista de archivos
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const opcion = (n) => args.includes(n);
const valor = (n, def) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const TODO = opcion("--todo");
const SIN_NAVEGADOR = opcion("--sin-navegador");
const BASE = valor("--base", "main");
const explicitos = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--base");

const git = (...a) => execFileSync("git", a, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const lineas = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const EXCLUIR = [/(^|\/)node_modules\//, /(^|\/)vendor\//, /\.min\.js$/, /^\.codex-review\//, /^\.netlify\//];
const relevante = (f) => /\.(html?|m?js)$/.test(f) && !EXCLUIR.some((r) => r.test(f)) && existsSync(path.join(RAIZ, f));

function archivos() {
  if (explicitos.length) return explicitos.map((f) => path.relative(RAIZ, path.resolve(f))).filter(relevante);
  if (TODO) return lineas(git("ls-files")).filter(relevante);
  try { git("fetch", "-q", "origin", BASE); } catch { /* sin red: se usa lo que haya */ }
  let base;
  for (const ref of [`origin/${BASE}`, BASE]) {
    try { base = git("merge-base", ref, "HEAD"); break; } catch { /* siguiente */ }
  }
  if (!base) {
    console.error(`check: no encuentro la rama base «${BASE}». Usa --base <rama> o --todo.`);
    process.exit(3);
  }
  const cambiados = [...lineas(git("diff", "--name-only", "--diff-filter=ACMR", base)), ...lineas(git("ls-files", "--others", "--exclude-standard"))];
  return [...new Set(cambiados)].filter(relevante);
}

// ---------------------------------------------------------------------------
// Resultados
// ---------------------------------------------------------------------------

const hallazgos = []; // { archivo, linea, tipo: "error"|"aviso", origen, mensaje }
const anotar = (archivo, linea, tipo, origen, mensaje) => hallazgos.push({ archivo, linea, tipo, origen, mensaje });

// Scripts de una página como un solo programa: fuera de <script> todo pasa a espacios,
// así los números de línea y columna coinciden con el .html.
function scriptsDeHTML(original) {
  // Un «<script>» escrito dentro de un comentario HTML no es código.
  const html = original.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, " "));
  let salida = html.replace(/[^\n]/g, " ");
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const tipo = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1]?.toLowerCase();
    if (tipo && !/^(module|text\/javascript|application\/javascript)$/.test(tipo)) continue;
    const inicio = m.index + m[0].indexOf(">") + 1;
    salida = salida.slice(0, inicio) + m[2] + salida.slice(inicio + m[2].length);
  }
  return salida;
}

// ---------------------------------------------------------------------------
// 1. HTML (html-validate)
// ---------------------------------------------------------------------------

async function revisarHTML(lista) {
  const { HtmlValidate } = await import("html-validate");
  const hv = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
      // Estilo o falsos positivos en páginas que se rellenan con JavaScript.
      "no-inline-style": "off",
      "no-implicit-button-type": "off",
      "no-implicit-input-type": "off",
      "doctype-style": "off",
      "tel-non-breaking": "off",
      "prefer-tbody": "off",
      "empty-heading": "off",
      "no-trailing-whitespace": "off",
      "void-style": "off",
      "attr-case": "off",
      "attr-quotes": "off",
      "no-raw-characters": "off",
      "long-title": "off",
      // Válidos en la práctica o rellenados luego con JavaScript: aviso, no error.
      "text-content": "warn",
      "element-permitted-content": "warn",
      "element-required-attributes": "warn",
      "attribute-allowed-values": "warn",
      "attribute-misuse": "warn",
      "autocomplete-password": "warn",
      "aria-label-misuse": "warn",
      "wcag/h32": "warn",
      "prefer-native-element": "warn",
      "no-redundant-role": "warn",
      "unique-landmark": "warn",
    },
  });
  for (const f of lista) {
    const r = await hv.validateFile(path.join(RAIZ, f));
    for (const res of r.results) {
      for (const m of res.messages) anotar(f, m.line, m.severity === 2 ? "error" : "aviso", `html/${m.ruleId}`, m.message);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. JavaScript (ESLint)
// ---------------------------------------------------------------------------

async function revisarJS(lista) {
  const { ESLint } = await import("eslint");
  const eslint = new ESLint({ cwd: RAIZ, overrideConfigFile: path.join(AQUI, "eslint.config.mjs"), errorOnUnmatchedPattern: false });
  for (const f of lista) {
    const texto = readFileSync(path.join(RAIZ, f), "utf8");
    const codigo = /\.html?$/.test(f) ? scriptsDeHTML(texto) : texto;
    if (!codigo.trim()) continue;
    const modulo = /\.html?$/.test(f) && /<script\b[^>]*\btype\s*=\s*["']?module/i.test(texto);
    const [r] = await eslint.lintText(codigo, { filePath: path.join(RAIZ, modulo ? f.replace(/\.html?$/, ".modulo.html") : f) });
    for (const m of r?.messages || []) {
      anotar(f, m.line, m.severity === 2 ? "error" : "aviso", `js/${m.ruleId || "sintaxis"}`, m.message);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Privacidad
// ---------------------------------------------------------------------------

// Rastreadores: nunca, en ninguna carpeta.
const RASTREADORES = /googletagmanager\.com|google-analytics\.com|\bgtag\s*\(|connect\.facebook\.net|\bfbq\s*\(|hotjar\.com|clarity\.ms|mixpanel\.com|cdn\.segment\.com|doubleclick\.net|plausible\.io|matomo/i;

// Formas de cargar o enviar algo a otro dominio (los <a href> son enlaces: no cuentan).
const CARGAS = [
  [/<script\b[^>]*\bsrc\s*=\s*["']?(https?:)?\/\/([^"'\s>/]+)/gi, "script externo"],
  [/<link\b(?![^>]*\brel\s*=\s*["']?(?:canonical|alternate|me|author|license)\b)[^>]*\bhref\s*=\s*["']?(https?:)?\/\/([^"'\s>/]+)/gi, "recurso externo (<link>)"],
  [/<(?:img|iframe|audio|video|source|embed|track)\b[^>]*\bsrc\s*=\s*["']?(https?:)?\/\/([^"'\s>/]+)/gi, "imagen, vídeo o marco externo"],
  [/(?:url\(|@import\s+)["']?(https?:)?\/\/([^"'\s)/]+)/gi, "recurso externo en CSS"],
  [/\b(?:fetch|sendBeacon|EventSource|WebSocket)\s*\(\s*[`"'](https?:|wss?:)?\/\/([^`"'\s/]+)/gi, "ENVIO"],
  [/\.open\s*\(\s*["'][A-Z]+["']\s*,\s*[`"'](https?:)?\/\/([^`"'\s/]+)/gi, "ENVIO"],
];
const LOCAL = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

function lineaDe(texto, indice) {
  let n = 1;
  for (let i = 0; i < indice; i++) if (texto.charCodeAt(i) === 10) n++;
  return n;
}

function revisarPrivacidad(lista) {
  const cabeceras = existsSync(path.join(RAIZ, "app/_headers")) ? readFileSync(path.join(RAIZ, "app/_headers"), "utf8") : "";
  for (const f of lista) {
    // Las funciones de servidor (.mjs, functions/, netlify/) sí hablan con otros servicios.
    if (/\.mjs$/.test(f) || /(^|\/)(functions|netlify)\//.test(f)) continue;
    const texto = readFileSync(path.join(RAIZ, f), "utf8");
    // app/ promete «sin recursos de terceros» (y su CSP los bloquea): ahí es error.
    const estricto = f.startsWith("app/");

    let m;
    const reR = new RegExp(RASTREADORES.source, "gi");
    while ((m = reR.exec(texto))) anotar(f, lineaDe(texto, m.index), "error", "privacidad/rastreador", `Rastreador o analítica de terceros: «${m[0]}». Expone la navegación de pacientes.`);

    for (const [re, que] of CARGAS) {
      const r = new RegExp(re.source, re.flags);
      while ((m = r.exec(texto))) {
        const dominio = m[2];
        if (LOCAL.test(dominio)) continue;
        const motivo = estricto
          ? "app/ no habla con terceros (la CSP lo bloquearía y se filtra la IP del paciente)."
          : que === "ENVIO"
            ? "Los datos salen a otro servicio: debe constar en el aviso de privacidad."
            : "Se filtra la IP de quien lo abre; mejor una copia local.";
        anotar(f, lineaDe(texto, m.index), estricto ? "error" : "aviso", "privacidad/terceros",
          `${que === "ENVIO" ? "Envío o carga desde otro dominio" : que}: ${dominio}. ${motivo}`);
      }
    }

  }

  // Material clínico individual: siempre todos, no solo los cambiados (quitar su línea de
  // app/_headers también es una regresión aunque el HTML no cambie). Ver scripts/README.md.
  const dir = path.join(RAIZ, "app/tools-standalone");
  const clinicos = existsSync(dir) ? readdirSync(dir).filter((n) => /^c-.+\.html$/.test(n)).map((n) => `app/tools-standalone/${n}`) : [];
  for (const f of clinicos) {
    const texto = readFileSync(path.join(RAIZ, f), "utf8");
    if (!/var SALT="[^"]+", IV="[^"]+", DATA="[^"]+"/.test(texto)) {
      anotar(f, 1, "error", "privacidad/cifrado", "Un archivo c-*.html debe salir de scripts/cifrar-html.mjs: este no parece cifrado y el repositorio es público.");
    }
    const ruta = `/${f.slice("app/".length)}`;
    const bloque = cabeceras.split(/\n(?=\S)/).find((b) => b.split("\n")[0].trim() === ruta);
    if (!bloque || !/X-Robots-Tag:\s*noindex/i.test(bloque)) {
      anotar(f, 1, "error", "privacidad/cifrado", `Falta «${ruta}» con «X-Robots-Tag: noindex» en app/_headers.`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Navegador: errores al cargar y accesibilidad (axe-core)
// ---------------------------------------------------------------------------

function cargarPlaywright() {
  for (const intento of [() => require("playwright"), () => createRequire("/opt/node-tools/")("playwright")]) {
    try { return intento(); } catch { /* siguiente */ }
  }
  return null;
}

// Carpeta que se publica como raíz de cada página (para que /css/… resuelva bien).
function raizPublicada(f) {
  const partes = f.split("/");
  const pub = partes.indexOf("public");
  if (pub >= 0) return partes.slice(0, pub + 1).join("/");
  return partes.length > 1 ? partes[0] : ".";
}

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".mp3": "audio/mpeg", ".m4a": "audio/mp4",
  ".ics": "text/calendar",
};

async function revisarNavegador(lista) {
  // Las plantillas se rellenan antes de publicarse: abiertas tal cual siempre fallan.
  const htmls = lista.filter((f) => /\.html?$/.test(f) && !/\.plantilla\.html?$/.test(f));
  if (!htmls.length) return;
  const pw = cargarPlaywright();
  if (!pw) {
    anotar("(navegador)", 0, "aviso", "navegador", "Playwright no está disponible: no se han comprobado errores al cargar ni accesibilidad en el navegador.");
    return;
  }
  const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  let raiz = RAIZ;
  const servidor = createServer((req, res) => {
    const ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let fichero = path.join(raiz, ruta);
    if (!fichero.startsWith(raiz)) { res.writeHead(403).end(); return; }
    if (existsSync(fichero) && !path.extname(fichero) && existsSync(path.join(fichero, "index.html"))) fichero = path.join(fichero, "index.html");
    if (!existsSync(fichero) || !path.extname(fichero)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(fichero).toLowerCase()] || "application/octet-stream" });
    res.end(readFileSync(fichero));
  });
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  const puerto = servidor.address().port;
  // Nada sale a internet: Chromium no resuelve ningún nombre salvo el servidor local
  // (cubre también WebSockets y lo que no pase por page.route), y sin proxy.
  const navegador = await pw.chromium.launch({ args: ["--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1", "--no-proxy-server"] });
  const origen = `http://127.0.0.1:${puerto}/`;
  try {
    for (const f of htmls) {
      const raizRel = raizPublicada(f);
      raiz = path.join(RAIZ, raizRel);
      const url = `http://127.0.0.1:${puerto}/${path.relative(raiz, path.join(RAIZ, f)).split(path.sep).join("/")}`;
      const ctx = await navegador.newContext({ serviceWorkers: "block" });
      // Solo el origen exacto del servidor local, en todo el contexto (también ventanas nuevas).
      await ctx.route((u) => !u.href.startsWith(origen) && !/^(data|blob|about):/.test(u.protocol), (ruta) => ruta.abort());
      await ctx.routeWebSocket(/.*/, (ws) => ws.close());
      const pagina = await ctx.newPage();
      const errores = [];
      pagina.on("pageerror", (e) => errores.push(String(e.message || e).split("\n")[0]));
      try {
        await pagina.goto(url, { waitUntil: "load", timeout: 15000 });
        await pagina.waitForTimeout(400);
        await pagina.addScriptTag({ content: axe });
        const r = await pagina.evaluate(async () => {
          const res = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, resultTypes: ["violations"] });
          return res.violations.map((v) => ({ id: v.id, impacto: v.impact, ayuda: v.help, n: v.nodes.length, donde: v.nodes[0]?.target?.join(" ") }));
        });
        for (const v of r) {
          // Bloquea lo que impide usar la página; el contraste y lo menor quedan como aviso.
          const grave = (v.impacto === "critical" || v.impacto === "serious") && v.id !== "color-contrast";
          anotar(f, 0, grave ? "error" : "aviso", `a11y/${v.id}`, `${v.ayuda} (${v.n} elemento${v.n > 1 ? "s" : ""}; p. ej. ${v.donde})`);
        }
      } catch (e) {
        // Una página sin comprobar no puede dar el visto bueno.
        anotar(f, 0, "error", "navegador", `No se ha podido comprobar en el navegador: ${String(e.message || e).split("\n")[0]}`);
      } finally {
        for (const e of new Set(errores)) anotar(f, 0, "error", "navegador/js", `Error de JavaScript al abrir la página: ${e}`);
        await ctx.close();
      }
    }
  } finally {
    await navegador.close();
    servidor.close();
  }
}

// ---------------------------------------------------------------------------

async function principal() {
  for (const dep of ["html-validate", "eslint", "axe-core"]) {
    try { require.resolve(dep); } catch {
      console.error("check: faltan las dependencias. Instálalas una vez con:  npm run check:instalar");
      process.exit(3);
    }
  }
  const lista = archivos();
  if (!lista.length) {
    console.log(`check: no hay archivos HTML/JS cambiados frente a ${BASE}. (Usa --todo para revisarlo todo.)`);
    return;
  }
  console.log(`check: ${lista.length} archivo${lista.length > 1 ? "s" : ""}${TODO ? " (todo el repositorio)" : ""}…`);
  await revisarHTML(lista.filter((f) => /\.html?$/.test(f)));
  await revisarJS(lista);
  revisarPrivacidad(lista);
  if (!SIN_NAVEGADOR) await revisarNavegador(lista);

  const errores = hallazgos.filter((h) => h.tipo === "error");
  const avisos = hallazgos.filter((h) => h.tipo === "aviso");
  const verAvisos = !TODO || opcion("--avisos");
  const porArchivo = new Map();
  for (const h of hallazgos) {
    if (h.tipo === "aviso" && !verAvisos) continue;
    if (!porArchivo.has(h.archivo)) porArchivo.set(h.archivo, []);
    porArchivo.get(h.archivo).push(h);
  }
  for (const [archivo, hs] of [...porArchivo].sort()) {
    console.log(`\n${archivo}`);
    for (const h of hs.sort((a, b) => (a.tipo === b.tipo ? a.linea - b.linea : a.tipo === "error" ? -1 : 1))) {
      console.log(`  ${h.tipo === "error" ? "✗" : "·"} ${h.linea ? `${String(h.linea).padStart(4)}  ` : "      "}${h.mensaje}  [${h.origen}]`);
    }
  }
  const conErrores = new Set(errores.map((h) => h.archivo)).size;
  console.log(`\ncheck: ${errores.length} error${errores.length === 1 ? "" : "es"} en ${conErrores} archivo${conErrores === 1 ? "" : "s"}, ${avisos.length} aviso${avisos.length === 1 ? "" : "s"}${verAvisos ? "" : " (añade --avisos para verlos)"}.`);
  if (errores.length) process.exitCode = 1;
}

principal().catch((e) => { console.error(e); process.exit(2); });
