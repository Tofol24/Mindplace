// ESLint para las páginas (check.mjs junta los <script> de cada .html en un solo programa)
// y los .js/.mjs del repositorio. Solo reglas que señalan fallos reales; nada de estilo.
import globals from "globals";

// Globales que una página recibe de otro archivo (<script src>) o del entorno.
const COMPARTIDOS = Object.fromEntries([
  "Aprens", "AprensUso", "RespiroAIS", "Comprension", "EscaleraLateral", "initReader",
  "VinetaAtencion", "VinetaHonestidad", "VinetaAbrazo",
  "Chart", "Cal", // bibliotecas en vendor/
  "claude", // páginas publicadas como artefacto de Claude
  "webkit", // puente con la app de iOS
  "__DATOS__", // plantilla que rellena scripts/indice-escritorio.py
].map((n) => [n, "readonly"]));

const reglas = {
  "no-undef": "error",
  "no-dupe-keys": "error",
  "no-dupe-args": "error",
  "no-duplicate-case": "error",
  "no-unreachable": "error",
  "no-func-assign": "warn", // a veces se envuelve render() a propósito
  "no-const-assign": "error",
  "no-import-assign": "error",
  "no-self-assign": "error",
  "no-redeclare": ["warn", { builtinGlobals: false }],
  "use-isnan": "error",
  "valid-typeof": "error",
  "no-unsafe-finally": "error",
  "no-unsafe-negation": "error",
  "no-cond-assign": ["error", "except-parens"],
  "no-compare-neg-zero": "error",
  "no-sparse-arrays": "error",
  "no-loss-of-precision": "error",
};

export default [
  { ignores: ["**/node_modules/**", "**/vendor/**", "**/*.min.js", ".codex-review/**"] },
  {
    files: ["**/*.html", "**/*.htm"],
    languageOptions: { ecmaVersion: "latest", sourceType: "script", globals: { ...globals.browser, ...COMPARTIDOS } },
    rules: reglas,
  },
  {
    // Páginas con <script type="module"> (check.mjs les cambia la extensión al analizarlas).
    files: ["**/*.modulo.html"],
    languageOptions: { sourceType: "module" },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.serviceworker, ...COMPARTIDOS },
    },
    rules: reglas,
  },
  {
    // Funciones de Netlify en CommonJS.
    files: ["**/netlify/functions/**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
  },
  {
    files: ["**/*.mjs", "**/*.cjs", "scripts/**/*.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.node } },
    rules: reglas,
  },
];
