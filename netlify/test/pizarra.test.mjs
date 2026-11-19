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
const leer = (await import(root + "/netlify/functions/pizarra.mjs")).default;
const subir = (await import(root + "/netlify/functions/pizarra-subir.mjs")).default;
const { limpiar } = await import(root + "/netlify/functions/pizarra-limpieza.mjs");
const lib = await import(root + "/netlify/lib/pizarra.mjs");

const datos = "A".repeat(40) + "-_xyz09";
const post = (b) => subir(new Request("https://x/api/pizarra-subir", { method: "POST", body: b }));
const get = (id) => leer(new Request("https://x/api/pizarra?id=" + encodeURIComponent(id)));
const store = getStore("pizarra");

// subir y leer
const r1 = await post(datos);
assert.equal(r1.status, 201);
assert.equal(r1.headers.get("cache-control"), "no-store");
const { id } = await r1.json();
assert.match(id, lib.RE_ID);
const r2 = await get(id);
assert.equal(r2.status, 200);
assert.equal(await r2.text(), datos);
assert.equal(await store.get(lib.claveIndice(lib.caducidad(), id)), "", "índice de caducidad creado");

// varias subidas seguidas (la cuota se actualiza con ETag)
for (let i = 0; i < 3; i++) assert.equal((await post(datos)).status, 201, "subida seguida " + i);

// entradas no válidas
assert.equal((await post("")).status, 400);
assert.equal((await post("corto")).status, 400);
assert.equal((await post("<script>alert(1)</script>" + "A".repeat(30))).status, 400);
assert.equal((await post("A".repeat(lib.MAX_BYTES + 1))).status, 413);
assert.equal((await get("../../x")).status, 400);
assert.equal((await get("__proto__")).status, 400);
assert.equal((await get("ABCDEFGHIJ")).status, 404);
assert.equal((await subir(new Request("https://x/api/pizarra-subir"))).status, 405);
assert.equal((await leer(new Request("https://x/api/pizarra?id=" + id, { method: "POST", body: datos }))).status, 405);

// caducidad: al leer un enlace caducado se borra (bloque e índice)
const pasado = Date.now() - 2 * 86_400_000;
await store.set(lib.claveDato("Caducado01"), datos, { metadata: { exp: pasado } });
await store.set(lib.claveIndice(pasado, "Caducado01"), "");
assert.equal((await get("Caducado01")).status, 404);
assert.equal(await store.get(lib.claveDato("Caducado01")), null);
assert.equal(await store.get(lib.claveIndice(pasado, "Caducado01")), null);

// limpieza diaria: borra lo caducado (por el índice) y las cuotas de días pasados
await store.set(lib.claveDato("Caducado02"), datos, { metadata: { exp: pasado } });
await store.set(lib.claveIndice(pasado, "Caducado02"), "");
await store.setJSON("cuota/" + lib.dia(pasado), { n: 1, bytes: 1 });
const borrados = await limpiar(store);
assert.equal(borrados, 2);
assert.equal(await store.get(lib.claveDato("Caducado02")), null);
assert.equal((await get(id)).status, 200, "lo vigente se conserva");

// tope global diario
await store.setJSON("cuota/" + lib.dia(Date.now()), { n: lib.CUOTA_DIA.n, bytes: 0 });
assert.equal((await post(datos)).status, 429);

// identificadores: 10 caracteres del alfabeto
for (let i = 0; i < 200; i++) assert.match(lib.nuevoId(), lib.RE_ID);

await server.stop();
rmSync(dir, { recursive: true, force: true });
console.log("pizarra: ok");
