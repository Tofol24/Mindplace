// Prueba de las funciones del contador de uso contra un servidor local de Blobs.
// Ejecutar: npm test
import { BlobsServer } from "@netlify/blobs/server";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "uso-blobs-"));
const server = new BlobsServer({ directory: dir, token: "t", port: 0 });
const { port } = await server.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: "s", token: "t", edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` })).toString("base64");
process.env.USO_CLAVE = "secreta";
const root = new URL("../..", import.meta.url).pathname;
const uso = (await import(root + "/netlify/functions/uso.mjs")).default;
const res = (await import(root + "/netlify/functions/uso-resumen.mjs")).default;
const lib = await import(root + "/netlify/lib/uso.mjs");
const post = (o) => uso(new Request("https://x/api/uso", { method: "POST", body: typeof o === "string" ? o : JSON.stringify(o) }));
assert.equal((await post({ e: "entrada", o: "app", p: 1, d: 1, nv: 0 })).status, 204);
assert.equal((await post({ e: "abrir", t: "bajar_alerta" })).status, 204);
assert.equal((await post({ e: "abrir", t: "bajar_alerta" })).status, 204);
assert.equal((await post({ e: "registro", t: "bajar_alerta", n: 2 })).status, 204);
assert.equal((await post({ e: "tiempo", t: "bajar_alerta", b: "3-10" })).status, 204);
assert.equal((await post({ e: "abrir", t: "../x" })).status, 400);
assert.equal((await post({ e: "hack" })).status, 400);
assert.equal((await post("no json")).status, 400);
assert.equal((await post({ e: "tiempo", t: "__proto__", b: "0-1" })).status, 400);
assert.equal((await post({ e: "abrir", t: "constructor" })).status, 400);
assert.equal((await uso(new Request("https://x/api/uso"))).status, 405);
// un día pasado, a mano
const { getStore } = await import("@netlify/blobs");
const st = getStore("uso");
await st.set("ev/2026-01-05/abrir/ais_amor/-/aa", ""); await st.set("ev/2026-01-05/registro/ais_amor/3/bb", "");
assert.equal((await res(new Request("https://x/api/uso-resumen"))).status, 401);
assert.equal((await res(new Request("https://x/api/uso-resumen", { method: "OPTIONS" }))).status, 204);
const r = await res(new Request("https://x/api/uso-resumen?dias=400", { headers: { Authorization: "Bearer secreta" } }));
assert.equal(r.status, 200);
const j = await r.json();
const hoy = lib.diaMadrid();
assert.equal(j.dias[hoy].entradas.app, 1); assert.equal(j.dias[hoy].entradas.instalada, 1); assert.equal(j.dias[hoy].entradas.dispositivos, 1);
assert.deepEqual(j.dias[hoy].herramientas.bajar_alerta, { abrir: 2, registros: 2, tiempo: { "0-1": 0, "1-3": 0, "3-10": 1, "10+": 0 } });
// el día pasado se ha compactado: ya no hay claves ev/ de ese día y hay un lote
assert.equal((await st.list({ prefix: "ev/2026-01-05/" })).blobs.length, 0);
assert.equal((await st.list({ prefix: "lote/2026-01-05/" })).blobs.length, 1);
assert.equal(j.dias["2026-01-05"].herramientas.ais_amor.abrir, 1);
assert.equal(j.dias["2026-01-05"].herramientas.ais_amor.registros, 3);
// borrado fallido: reaparece un evento ya incluido en el lote → no se cuenta dos veces
await st.set("ev/2026-01-05/abrir/ais_amor/-/aa", "");
// clave maliciosa guardada a mano: se ignora y no rompe el resumen
await st.set("ev/2026-01-06/tiempo/__proto__/0-1/zz", "");
// segunda lectura: no duplica
const j2 = await (await res(new Request("https://x/api/uso-resumen?dias=400", { headers: { Authorization: "Bearer secreta" } }))).json();
assert.equal(j2.dias["2026-01-05"].herramientas.ais_amor.abrir, 1);
assert.equal(j2.dias[hoy].herramientas.bajar_alerta.abrir, 2);
// rango corto excluye el día antiguo
const j3 = await (await res(new Request("https://x/api/uso-resumen?dias=7", { headers: { Authorization: "Bearer secreta" } }))).json();
assert.ok(!j3.dias["2026-01-05"]);
console.log("OK funciones", JSON.stringify(j2.dias[hoy]));
await server.stop();
rmSync(dir, { recursive: true, force: true });
