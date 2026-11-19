// Prueba de las sugerencias de Claude (sin llamar a la API: cliente simulado).
// Ejecutar: npm test
import { BlobsServer } from "@netlify/blobs/server";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "pizarra-ia-"));
const server = new BlobsServer({ directory: dir, token: "t", port: 0 });
const { port } = await server.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: "s", token: "t", edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` })).toString("base64");
const root = new URL("../..", import.meta.url).pathname;
const lib = await import(root + "/netlify/lib/pizarra-ia.mjs");
const api = (await import(root + "/netlify/functions/pizarra-ia.mjs")).default;
const fondo = await import(root + "/netlify/functions/pizarra-ia-fondo-background.mjs");
const { limpiarIA } = await import(root + "/netlify/functions/pizarra-limpieza.mjs");
const { getStore } = await import("@netlify/blobs");

const entrada = {
  etapa: "Cadete (14 y 15 años)", tipo: "entreno", sistema: "1-4-3-3", objetivo: "Salir jugando",
  bloque: { categoria: "Rondo / posesión", titulo: "Rondo 4 contra 2", texto: "", consignas: "", fijarse: "", cuando: "" },
  pasos: [{ paso: 1, titulo: "4 contra 2", balon: [34, 71], fichas: [{ ficha: "e1", equipo: "nuestro", x: 34, y: 70 }, { ficha: "f1", equipo: "rival", x: 32, y: 78 }] }],
  jugadores: [{ ficha: "e1", dorsal: 7, puesto: "Extremo", notas: [{ tipo: "fuerte", area: "tecnica", situacion: "", texto: "Buen regate" }] }],
  extra: "<script>"
};

// saneado de la entrada
const s = lib.sanearEntrada(entrada);
assert.equal(s.extra, undefined);
assert.equal(s.pasos[0].fichas[1].equipo, "rival");
assert.equal(lib.sanearEntrada({}), null);

// consulta con un cliente simulado: comprueba la petición y sanea la respuesta
let peticion = null;
const respuesta = {
  analisis: "Plantea el rondo con poco espacio.", texto: "Mantened la posesión.", consignas: ["Perfil abierto", "Dos toques"],
  fijarse: "El rival que presiona.", cuando: "Antes de recibir.", mensaje: "Hoy trabajamos la posesión.",
  indicaciones: [{ ficha: "e1", paso: 1, que: "Ofrécete", fijate: "El balón", cuando: "Ahora" }, { ficha: "f1", paso: 1, que: "x", fijate: "x", cuando: "x" }, { ficha: "e1", paso: 9, que: "x", fijate: "x", cuando: "x" }],
  individual: [{ dorsal: 7, texto: "Usa tu regate para salir de la presión." }, { dorsal: 99, texto: "x" }]
};
const cliente = { beta: { messages: { create: async (p) => { peticion = p; return { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(respuesta) }] }; } } } };
const r = await fondo.consultar(s, cliente);
assert.equal(peticion.model, "claude-opus-5-5");
assert.equal(peticion.output_config.format.type, "json_schema");
assert.equal(peticion.fallbacks, "default");
assert.ok(!JSON.stringify(peticion.messages).includes("<script>"));
assert.equal(r.indicaciones.length, 1, "solo fichas nuestras y pasos existentes");
assert.equal(r.individual.length, 1, "solo dorsales existentes");
await assert.rejects(() => fondo.consultar(s, { beta: { messages: { create: async () => ({ stop_reason: "refusal", content: [] }) } } }));

// flujo completo: POST crea el trabajo y lanza el fondo; GET devuelve el resultado una vez
process.env.ANTHROPIC_API_KEY = "prueba";
const store = getStore({ name: "pizarra-ia", consistency: "strong" });
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (url, op) => {
  if (String(url).includes("pizarra-ia-fondo-background")) {
    const job = op.body;
    const t = await store.get("job/" + job, { type: "json" });
    await store.setJSON("job/" + job, { estado: "listo", creado: t.creado, resultado: await fondo.consultar(t.entrada, cliente) });
    return new Response(null, { status: 202 });
  }
  return fetchOriginal(url, op);
};
const p1 = await api(new Request("https://x/api/pizarra-ia", { method: "POST", body: JSON.stringify(entrada) }));
assert.equal(p1.status, 202);
const { job } = await p1.json();
assert.match(job, lib.RE_JOB);
const g1 = await (await api(new Request("https://x/api/pizarra-ia?job=" + job))).json();
assert.equal(g1.estado, "listo");
assert.equal(g1.resultado.consignas[0], "Perfil abierto");
assert.equal((await api(new Request("https://x/api/pizarra-ia?job=" + job))).status, 404, "se entrega una vez");
assert.equal((await api(new Request("https://x/api/pizarra-ia", { method: "POST", body: "{}" }))).status, 400);
assert.equal((await api(new Request("https://x/api/pizarra-ia?job=../x"))).status, 400);
delete process.env.ANTHROPIC_API_KEY;
assert.equal((await api(new Request("https://x/api/pizarra-ia", { method: "POST", body: JSON.stringify(entrada) }))).status, 503);
globalThis.fetch = fetchOriginal;

// limpieza: trabajos de más de un día
await store.setJSON("job/AAAAAAAAAAAAAAAA", { estado: "pendiente", creado: Date.now() - 2 * 86_400_000 });
assert.ok((await limpiarIA(store)) >= 1);
assert.equal(await store.get("job/AAAAAAAAAAAAAAAA"), null);

await server.stop();
rmSync(dir, { recursive: true, force: true });
console.log("pizarra-ia: ok");
