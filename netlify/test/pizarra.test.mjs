// Prueba de los enlaces cortos de la Pizarra contra un servidor local de Blobs.
// Ejecutar: npm test
import { BlobsServer } from "@netlify/blobs/server";
import { getStore } from "@netlify/blobs";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "pizarra-blobs-"));
const server = new BlobsServer({ directory: dir, token: "t", port: 0 });
const { port } = await server.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: "s", token: "t", edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` })).toString("base64");
const root = new URL("../..", import.meta.url).pathname;
const fn = (await import(root + "/netlify/functions/pizarra.mjs")).default;
const { limpiar } = await import(root + "/netlify/functions/pizarra-limpieza.mjs");
const lib = await import(root + "/netlify/lib/pizarra.mjs");

const datos = "A".repeat(40) + "-_xyz09";
const post = (b) => fn(new Request("https://x/api/pizarra", { method: "POST", body: b }));
const get = (id) => fn(new Request("https://x/api/pizarra?id=" + encodeURIComponent(id)));

// subir y leer
const r1 = await post(datos);
assert.equal(r1.status, 201);
assert.equal(r1.headers.get("cache-control"), "no-store");
const { id } = await r1.json();
assert.match(id, lib.RE_ID);
const r2 = await get(id);
assert.equal(r2.status, 200);
assert.equal(await r2.text(), datos);

// entradas no válidas
assert.equal((await post("")).status, 400);
assert.equal((await post("corto")).status, 400);
assert.equal((await post("<script>alert(1)</script>" + "A".repeat(30))).status, 400);
assert.equal((await post("A".repeat(300_001))).status, 413);
assert.equal((await get("../../x")).status, 400);
assert.equal((await get("__proto__")).status, 400);
assert.equal((await get("ABCDEFGHIJ")).status, 404);
assert.equal((await fn(new Request("https://x/api/pizarra", { method: "PUT", body: datos }))).status, 405);

// caducidad: al leer un enlace caducado se borra
const store = getStore("pizarra");
await store.set("Caducado01", datos, { metadata: { exp: Date.now() - 1000 } });
assert.equal((await get("Caducado01")).status, 404);
assert.equal(await store.get("Caducado01"), null);

// limpieza diaria: borra lo caducado y lo que no tiene fecha; conserva lo vigente
await store.set("Caducado02", datos, { metadata: { exp: Date.now() - 1000 } });
await store.set("SinFecha01", datos);
const borrados = await limpiar(store);
assert.equal(borrados, 2);
assert.equal((await get(id)).status, 200);
assert.ok(lib.caducidad(0) === lib.DIAS * 86_400_000);

await server.stop();
rmSync(dir, { recursive: true, force: true });
console.log("pizarra: ok");
