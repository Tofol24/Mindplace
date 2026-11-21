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
  jugadores: [{ ficha: "e1", jugador: "J1", puesto: "Extremo", notas: [{ tipo: "fuerte", area: "tecnica", situacion: "", texto: "Buen regate" }] }],
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
  individual: [{ jugador: "J1", texto: "Usa tu regate para salir de la presión." }, { jugador: "J9", texto: "x" }]
};
const cliente = { beta: { messages: { create: async (p) => { peticion = p; return { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(respuesta) }] }; } } } };
const r = await fondo.consultar(s, cliente);
assert.equal(peticion.model, "claude-opus-5-5");
assert.equal(peticion.output_config.format.type, "json_schema");
assert.equal(peticion.fallbacks, "default");
assert.ok(!JSON.stringify(peticion.messages).includes("<script>"));
assert.equal(r.indicaciones.length, 1, "solo fichas nuestras y pasos existentes");
assert.equal(r.individual.length, 1, "solo jugadores de la consulta");
assert.equal(lib.sanearEntrada({ ...entrada, jugadores: [{ ficha: "e1", jugador: "Toni", notas: [] }] }).jugadores.length, 0, "solo seudónimos J1, J2…");
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

// método de los cinco pasos: fase, condición, transiciones y preguntas
{
  const e = lib.sanearEntrada({ tipo: "entreno", bloque: { categoria: "Juego reducido", fase: "Dinámica ecológica", condicion: "Gol doble tras robo" },
    pasos: [{ paso: 1, transicion: "perdida", fichas: [{ ficha: "a1", equipo: "nuestro", x: 30, y: 40 }] }, { paso: 2, transicion: "otra", fichas: [] }] });
  assert.equal(e.bloque.fase, "Dinámica ecológica"); assert.equal(e.bloque.condicion, "Gol doble tras robo");
  assert.equal(e.pasos[0].transicion, "perdida"); assert.equal(e.pasos[1].transicion, "");
  const base = { analisis: "a", texto: "t", consignas: [], fijarse: "", cuando: "", mensaje: "", indicaciones: [], individual: [] };
  const o = lib.sanearSalida({ ...base, condicion: "Solo vale tras pase a la espalda", preguntas: ["¿Qué viste?", "", 3] }, e);
  assert.equal(o.condicion, "Solo vale tras pase a la espalda"); assert.deepEqual(o.preguntas, ["¿Qué viste?"]);
  const p = lib.sanearSalida({ ...base, condicion: "no aplica" }, { ...e, tipo: "partido" });
  assert.equal(p.condicion, ""); assert.deepEqual(p.preguntas, []);
  assert.ok(lib.ESQUEMA.required.includes("condicion") && lib.ESQUEMA.required.includes("preguntas"));
}

// diseñar la pizarra: entrada sin datos de jugadores, salida saneada (ids, vista y coordenadas)
{
  const e = lib.sanearEntrada({ modo: "pizarra", tipo: "entreno", jugadores: 14, bloque: { titulo: "Rondo", texto: "4 contra 2", condicion: "Doble" }, notas: "no", jugadoresLista: [1] });
  assert.equal(e.modo, "pizarra"); assert.equal(e.jugadores, 14); assert.equal(e.bloque.condicion, "Doble"); assert.equal(e.notas, undefined);
  assert.equal(lib.sanearEntrada({ modo: "pizarra", bloque: {} }), null);
  const salida = { vista: "D", explicacion: "ok", conos: [{ x: 10, y: 0, color: "verde" }],
    fichas: [{ id: "e1", equipo: "nuestro", peto: "" }, { id: "f1", equipo: "rival", peto: "amarillo" }, { id: "e2", equipo: "rival", peto: "" }, { id: "__proto__", equipo: "nuestro", peto: "" }],
    pasos: [{ titulo: "Inicio", balon: { x: 34, y: 100 }, posiciones: [{ ficha: "e1", x: 34, y: 100 }, { ficha: "f1", x: 30, y: 90 }, { ficha: "zz", x: 1, y: 1 }], transicion: "", flechas: [], indicaciones: [{ ficha: "e1", que: "Mira", fijate: "", cuando: "" }] },
      { titulo: "Robo", balon: { x: 999, y: -50 }, posiciones: [], transicion: "recuperacion", flechas: [{ desde: { x: 0, y: 0 }, hasta: { x: 5, y: 5 } }], indicaciones: [] }] };
  const r = lib.sanearPizarra(salida);
  assert.equal(r.jugada.vista, "D");
  assert.deepEqual(r.jugada.fichas.map((f) => f.id), ["e1", "f1", "c0"]);
  assert.equal(r.jugada.fichas[2].col, "amarillo");
  assert.deepEqual(r.jugada.pasos[0].pos.c0, [10, 46]);
  assert.deepEqual(r.jugada.pasos[1].b, [72, 46]); assert.equal(r.jugada.pasos[1].tr, "r");
  assert.deepEqual(r.jugada.pasos[1].pos.e1, [34, 100]);
  assert.equal(lib.sanearPizarra({ ...salida, fichas: [] }), null);
  // si a una ficha le falta la posición inicial, la propuesta se rechaza
  assert.equal(lib.sanearPizarra({ ...salida, fichas: salida.fichas.concat([{ id: "e3", equipo: "nuestro", peto: "" }]) }), null);
  assert.equal(lib.sanearEntrada({ modo: "pizarra", bloque: { texto: "x", equipoCondicion: "peto amarillo" } }).bloque.equipoCondicion, "peto amarillo");
  assert.equal(lib.sanearEntrada({ modo: "pizarra", bloque: { texto: "x", equipoCondicion: "<b>" } }).bloque.equipoCondicion, "");
  const cliente = { beta: { messages: { create: async (q) => { assert.equal(q.output_config.format.schema, lib.ESQUEMA_PIZARRA); return { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(salida) }] }; } } } };
  const res = await fondo.consultar(e, cliente);
  assert.ok(res.jugada && res.jugada.pasos.length === 2);
}

// feedback del equipo: alternativas y próximo entreno
{
  const hist = [{ fecha: "2026-11-10", tipo: "partido", titulo: "Liga", nota: "Nos costó salir", resultado: "1-2",
    bloques: [{ categoria: "Salida de balón", titulo: "Salida", como: "costó", estimulos: "a veces", nota: "Presionaban mucho", otro: "x" }] }];
  assert.equal(lib.sanearEntrada({ modo: "entreno", historial: [] }), null);
  const e = lib.sanearEntrada({ modo: "entreno", quiero: "Salida", minutos: 500, historial: hist, notas: "no" });
  assert.equal(e.minutos, 150); assert.equal(e.historial[0].bloques[0].como, "costó"); assert.equal(e.historial[0].bloques[0].otro, undefined);
  assert.equal(lib.sanearEntrada({ modo: "entreno", historial: [{ bloques: [{ como: "fatal" }] }] }).historial[0].bloques[0].como, "");
  const a = lib.sanearEntrada({ modo: "alternativas", bloque: { titulo: "Rondo", como: "bien", estimulos: "sí" }, historial: hist });
  assert.equal(a.modo, "alternativas"); assert.equal(a.bloque.como, "bien");
  const bp = { titulo: "Rondo 5x2", categoria: "inventada", fase: "ecologico", minutos: 999, texto: "t", consignas: ["a", ""], fijarse: "f", cuando: "c", condicion: "", preguntas: ["¿?"] };
  const ra = lib.sanearAlternativas({ analisis: "x", estimulos: "y", objetivos: ["o"], alternativas: [{ cambio: "más fácil", bloque: bp }, { cambio: "vacía", bloque: {} }] });
  assert.equal(ra.alternativas.length, 1); assert.equal(ra.alternativas[0].bloque.categoria, "ejercicio"); assert.equal(ra.alternativas[0].bloque.minutos, 120);
  assert.equal(lib.sanearAlternativas({ alternativas: [] }), null);
  const re = lib.sanearEntreno({ analisis: "x", titulo: "T", objetivo: "O", bloques: [bp, { titulo: "Cal", categoria: "calentamiento", fase: "x" }] });
  assert.equal(re.bloques.length, 2); assert.equal(re.bloques[1].fase, "");
  const cliente = { beta: { messages: { create: async (q) => { assert.equal(q.output_config.format.schema, lib.ESQUEMA_ENTRENO); return { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ analisis: "a", titulo: "T", objetivo: "O", bloques: [bp] }) }] }; } } } };
  assert.equal((await fondo.consultar(e, cliente)).bloques.length, 1);
}

// autoevaluación: entrada acotada y salida saneada
{
  assert.equal(lib.sanearEntrada({ modo: "autoeval" }), null);
  const e = lib.sanearEntrada({ modo: "autoeval", puesto: "MC", coinciden: { fuertes: ["Pase corto", "", 3] }, entrenadorFuerteJugadorMejorar: ["Regate"], textos: { haceMejor: "Pasar" }, confianza: "Poco", nombre: "x" });
  assert.deepEqual(e.coinciden.fuertes, ["Pase corto"]); assert.equal(e.confianza, "Poco"); assert.equal(e.nombre, undefined);
  assert.equal(lib.sanearEntrada({ modo: "autoeval", textos: { haceMejor: "x" }, confianza: "Muchísimo" }).confianza, "");
  const r = lib.sanearAuto({ analisis: "a", confianza: ["c1", ""], deportivo: ["d1"], mensaje: "m" });
  assert.deepEqual(r.confianza, ["c1"]); assert.equal(lib.sanearAuto({}), null);
}

// entreno con el informe del equipo y mejorar un entreno: pautas solo de los jugadores enviados
{
  const eq = { jugadores: [{ jugador: "J1", foco: "Salida de balón", nombre: "Pep" }, { jugador: "Pep", foco: "x" }], necesidades: ["Salida (2)"] };
  const e = lib.sanearEntrada({ modo: "entreno", historial: [], equipo: eq });
  assert.equal(e.equipo.jugadores.length, 1); assert.equal(e.equipo.jugadores[0].nombre, undefined);
  assert.equal(lib.sanearEntrada({ modo: "entreno", historial: [] }), null);
  const r = lib.sanearEntreno({ titulo: "t", bloques: [{ titulo: "b", pautas: [{ jugador: "J1", texto: "Ofrécete de cara" }, { jugador: "J1", texto: "otra" }, { jugador: "J7", texto: "x" }] }] }, e);
  assert.deepEqual(r.bloques[0].pautas, [{ jugador: "J1", texto: "Ofrécete de cara" }]);
  const m = lib.sanearEntrada({ modo: "mejorar", bloques: [{ bloque: "B1", titulo: "Rondo", como: "costó", pizarra: true }, { bloque: "B1", titulo: "dup" }, { bloque: "X", titulo: "y" }], equipo: eq });
  assert.equal(m.bloques.length, 1); assert.equal(m.bloques[0].pizarra, true); assert.equal(m.bloques[0].como, "costó");
  assert.equal(lib.sanearEntrada({ modo: "mejorar", bloques: [] }), null);
  const s = lib.sanearMejorar({ analisis: "a", bloques: [{ bloque: "B1", titulo: "Rondo 2", consignas: ["c"], pautas: [{ jugador: "J1", texto: "p" }, { jugador: "J2", texto: "q" }] }, { bloque: "B9", titulo: "z" }] }, m);
  assert.equal(s.bloques.length, 1); assert.deepEqual(s.bloques[0].pautas.map((x) => x.jugador), ["J1"]);
  assert.equal(lib.sanearMejorar({ bloques: [{ bloque: "B5" }] }, m), null);
}

// informe del equipo: entrada acotada (jugadores J1…, sin nombres) y refuerzos solo de los jugadores enviados
{
  assert.equal(lib.sanearEntrada({ modo: "equipo", jugadores: [] }), null);
  const e = lib.sanearEntrada({ modo: "equipo", entrenadores: 2, clima: { orientacion: { tarea: 3, resultado: "x" } },
    jugadores: [{ jugador: "J1", foco: "Salida de balón", orientacion: "resultado", error: "le cuesta mucho", confianza: "Poco", nombre: "Pep" }, { jugador: "J1" }, { jugador: "Pep" }, { jugador: "J2", orientacion: "ego" }] });
  assert.equal(e.jugadores.length, 2); assert.equal(e.jugadores[0].nombre, undefined); assert.equal(e.jugadores[1].orientacion, "");
  assert.equal(e.clima.orientacion.tarea, 3); assert.equal(e.clima.orientacion.resultado, 0); assert.equal(e.entrenadores, 2);
  const r = lib.sanearEquipo({ lectura: "l", grupo: ["g", ""], refuerzos: [{ jugador: "J1", hacer: "h", decir: "d" }, { jugador: "J1", hacer: "otra" }, { jugador: "J9", hacer: "x" }] }, e);
  assert.deepEqual(r.refuerzos.map((x) => x.jugador), ["J1"]); assert.deepEqual(r.grupo, ["g"]); assert.equal(lib.sanearEquipo({}, e), null);
}

await server.stop();
rmSync(dir, { recursive: true, force: true });
console.log("pizarra-ia: ok");
