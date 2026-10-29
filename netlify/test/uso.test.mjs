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
const diario = (await import(root + "/netlify/functions/uso-diario.mjs")).default;
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
// portada aprens.net: visitas por origen y clics por destino (solo valores de la lista)
assert.equal((await post({ e: "visita", t: "instagram" })).status, 204);
assert.equal((await post({ e: "clic", t: "cita" })).status, 204);
assert.equal((await post({ e: "visita", t: "evil.com" })).status, 400);
assert.equal((await post({ e: "clic", t: "__proto__" })).status, 400);
{
  const rp = lib.resumir(["ev/2026-01-06/visita/instagram/-/a", "ev/2026-01-06/visita/directe/-/b", "ev/2026-01-06/clic/cita/-/c", "ev/2026-01-06/clic/nada/-/d"]);
  assert.equal(rp.portada.visites, 2); assert.equal(rp.portada.fonts.instagram, 1); assert.equal(rp.portada.clics.cita, 1); assert.equal(rp.portada.clics.nada, undefined);
}
// lista (cola sin conexión): se guardan los válidos, como máximo 20
assert.equal((await post([{ e: "abrir", t: "ais_curiosidad" }, { e: "abrir", t: "__proto__" }, { e: "abrir", t: "ais_curiosidad" }])).status, 204);
assert.equal((await post([{ e: "nada" }])).status, 400);
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
// el día pasado se ha resumido en dia/ y ya no quedan eventos sueltos de ese día
assert.equal((await st.list({ prefix: "ev/2026-01-05/" })).blobs.length, 0);
assert.ok(await st.get("dia/2026-01-05", { type: "json" }));
assert.equal(j.dias["2026-01-05"].herramientas.ais_amor.abrir, 1);
assert.equal(j.dias["2026-01-05"].herramientas.ais_amor.registros, 3);
// borrado fallido: reaparece un evento de un día ya resumido → se borra sin volver a contarlo
await st.set("ev/2026-01-05/abrir/ais_amor/-/aa", "");
// clave maliciosa guardada a mano: se ignora y no rompe el resumen
await st.set("ev/2026-01-06/tiempo/__proto__/0-1/zz", "");
// segunda lectura: no duplica
const j2 = await (await res(new Request("https://x/api/uso-resumen?dias=400", { headers: { Authorization: "Bearer secreta" } }))).json();
assert.equal(j2.dias["2026-01-05"].herramientas.ais_amor.abrir, 1);
assert.equal((await st.list({ prefix: "ev/2026-01-05/" })).blobs.length, 0);
assert.equal(Object.keys(j2.dias["2026-01-06"].herramientas).length, 0);
assert.equal(j2.dias[hoy].herramientas.bajar_alerta.abrir, 2);
assert.equal(j2.dias[hoy].herramientas.ais_curiosidad.abrir, 2);
// dos consultas a la vez sobre un día cerrado: ni duplican ni pierden
for (const r of ["a1", "a2", "a3"]) await st.set("ev/2026-02-10/abrir/ais_amor/-/" + r, "");
const auth = { headers: { Authorization: "Bearer secreta" } };
const [c1, c2] = await Promise.all([res(new Request("https://x/api/uso-resumen?dias=400", auth)), res(new Request("https://x/api/uso-resumen?dias=400", auth))]);
for (const c of [c1, c2]) assert.equal((await c.json()).dias["2026-02-10"].herramientas.ais_amor.abrir, 3);
const c3 = await (await res(new Request("https://x/api/uso-resumen?dias=400", auth))).json();
assert.equal(c3.dias["2026-02-10"].herramientas.ais_amor.abrir, 3);
// la tarea nocturna cierra días fuera de cualquier consulta (por ejemplo, de hace dos años)
await st.set("ev/2024-03-01/abrir/ais_amor/-/v1", "");
await diario();
assert.equal((await st.list({ prefix: "ev/2024-03-01/" })).blobs.length, 0);
assert.equal((await st.get("dia/2024-03-01", { type: "json" })).herramientas.ais_amor.abrir, 1);
// ayer sigue abierto (margen de medianoche): sus eventos no se cierran todavía
const ayer = lib.diaMadrid(new Date(Date.now() - 86400000));
await st.set("ev/" + ayer + "/abrir/ais_amor/-/y1", "");
await diario();
assert.equal((await st.list({ prefix: "ev/" + ayer + "/" })).blobs.length, 1);
// el cambio de hora no descuadra los días (29/03/2026, cambio de hora en España)
assert.equal(lib.restarDias("2026-03-30", 1), "2026-03-29");
assert.equal(lib.primerDiaAbierto(new Date("2026-03-29T22:30:00Z")), "2026-03-29");
// rango corto excluye el día antiguo
const j3 = await (await res(new Request("https://x/api/uso-resumen?dias=7", { headers: { Authorization: "Bearer secreta" } }))).json();
assert.ok(!j3.dias["2026-01-05"]);
console.log("OK funciones", JSON.stringify(j2.dias[hoy]));
await server.stop();
rmSync(dir, { recursive: true, force: true });
