// Prueba de los códigos de acceso contra un servidor local de Blobs.
// Ejecutar: npm test
import { BlobsServer } from "@netlify/blobs/server";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "acceso-blobs-"));
const server = new BlobsServer({ directory: dir, token: "t", port: 0 });
const { port } = await server.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: "s", token: "t", edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` })).toString("base64");
process.env.ACCESO_CODIGOS_PRO = "codigo-pro-ilimitado, codigo-pro-limitado:2";
process.env.ACCESO_AUTO_HASTA = "2999-12-31";
const root = new URL("../..", import.meta.url).pathname;
const lib = await import(root + "/netlify/lib/acceso.mjs");
const api = (await import(root + "/netlify/functions/acceso.mjs")).default;
const solicitar = (await import(root + "/netlify/functions/acceso-solicitar.mjs")).default;
const req = (ruta, { method = "GET", body, pro, origin } = {}) => {
  const h = {}; if (pro) h["x-codigo-pro"] = pro; if (origin) h.origin = origin;
  return new Request("https://aprens-app.netlify.app" + ruta, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
};
const J = async (r) => ({ status: r.status, body: await r.json(), r });

// formato y normalización
for (let i = 0; i < 50; i++) assert.equal(lib.normCodigo(lib.nuevoCodigo()).length, 13);
assert.equal(lib.normCodigo(" apr 7k2m 9qxd "), "APR-7K2M-9QXD");
assert.equal(lib.normCodigo("7k2m9qxd"), "APR-7K2M-9QXD");
assert.equal(lib.normCodigo("APR-7K2M-9QX0"), "");   // 0 no está en el alfabeto
assert.equal(lib.normCodigo("APR-7K2M"), "");
// meses de calendario: 30 de noviembre + 3 meses → 28 de febrero
assert.equal(new Date(lib.sumarMeses(3, new Date("2026-11-30T10:00:00Z"))).toISOString().slice(0, 10), "2027-02-28");
assert.equal(new Date(lib.sumarMeses(1, new Date("2026-11-25T10:00:00Z"))).toISOString().slice(0, 10), "2026-12-25");

// botón automático
let r = await J(await solicitar(req("/api/acceso-solicitar", { method: "POST", origin: "https://aprens.es" })));
assert.equal(r.status, 200); assert.equal(r.body.meses, 3);
assert.equal(r.r.headers.get("access-control-allow-origin"), "https://aprens.es");
const auto = r.body.codigo;
r = await J(await solicitar(req("/api/acceso-solicitar", { method: "POST", origin: "https://malo.com" })));
assert.equal(r.r.headers.get("access-control-allow-origin"), null);
assert.equal((await solicitar(req("/api/acceso-solicitar"))).status, 405);
r = await J(await api(req("/api/acceso/config")));
assert.equal(r.body.autoAbierto, true);
process.env.ACCESO_AUTO_HASTA = "2020-01-01";
assert.equal((await solicitar(req("/api/acceso-solicitar", { method: "POST" }))).status, 403);
assert.equal((await J(await api(req("/api/acceso/config")))).body.autoAbierto, false);
process.env.ACCESO_AUTO_HASTA = "no";
assert.equal((await solicitar(req("/api/acceso-solicitar", { method: "POST" }))).status, 403);

// validar
r = await J(await api(req("/api/acceso/validar", { method: "POST", body: { codigo: auto.toLowerCase() } })));
assert.equal(r.body.valido, true); assert.equal(r.body.codigo, auto);
r = await J(await api(req("/api/acceso/validar", { method: "POST", body: { codigo: "APR-2222-2222" } })));
assert.deepEqual(r.body, { valido: false, motivo: "no_existe" });
assert.equal((await api(req("/api/acceso/validar", { method: "POST", body: [1] }))).status, 400);
assert.equal((await api(req("/api/acceso/validar"))).status, 405);
assert.equal((await api(req("/api/acceso/otra"))).status, 404);
assert.equal(lib.estado({ codigo: "x", caduca: 1 }, 2).motivo, "caducado");

// profesional
assert.equal((await api(req("/api/acceso/pro"))).status, 401);
assert.equal((await api(req("/api/acceso/pro", { pro: "codigo-pro-inventado" }))).status, 401);
r = await J(await api(req("/api/acceso/pro", { pro: "codigo-pro-ilimitado" })));
assert.equal(r.body.limite, 0);
assert.equal((await api(req("/api/acceso/crear", { method: "POST", pro: "codigo-pro-ilimitado", body: { meses: 4 } }))).status, 400);
r = await J(await api(req("/api/acceso/crear", { method: "POST", pro: "codigo-pro-ilimitado", body: { meses: 6 } })));
assert.equal(r.status, 200); const p6 = r.body.codigo;
r = await J(await api(req("/api/acceso/lista", { pro: "codigo-pro-ilimitado" })));
assert.deepEqual(r.body.codigos.map((c) => c.codigo), [p6]); assert.equal(r.body.activos, 1);
// otro profesional no ve ni anula códigos ajenos
assert.equal((await J(await api(req("/api/acceso/lista", { pro: "codigo-pro-limitado" })))).body.codigos.length, 0);
assert.equal((await api(req("/api/acceso/revocar", { method: "POST", pro: "codigo-pro-limitado", body: { codigo: p6 } }))).status, 404);
assert.equal((await api(req("/api/acceso/revocar", { method: "POST", pro: "codigo-pro-ilimitado", body: { codigo: auto } }))).status, 404);
assert.equal((await api(req("/api/acceso/revocar", { method: "POST", pro: "codigo-pro-ilimitado", body: { codigo: p6 } }))).status, 200);
r = await J(await api(req("/api/acceso/validar", { method: "POST", body: { codigo: p6 } })));
assert.equal(r.body.motivo, "revocado");
// límite de pacientes activos (los anulados no cuentan)
for (let i = 0; i < 2; i++) assert.equal((await api(req("/api/acceso/crear", { method: "POST", pro: "codigo-pro-limitado", body: { meses: 1 } }))).status, 200);
r = await J(await api(req("/api/acceso/crear", { method: "POST", pro: "codigo-pro-limitado", body: { meses: 1 } })));
assert.equal(r.status, 409); assert.equal(r.body.limite, 2);
const uno = (await J(await api(req("/api/acceso/lista", { pro: "codigo-pro-limitado" })))).body.codigos[0].codigo;
await api(req("/api/acceso/revocar", { method: "POST", pro: "codigo-pro-limitado", body: { codigo: uno } }));
assert.equal((await api(req("/api/acceso/crear", { method: "POST", pro: "codigo-pro-limitado", body: { meses: 1 } }))).status, 200);
// si el profesional sale de la lista (deja de pagar), sus códigos siguen hasta su fecha
const vivo = (await J(await api(req("/api/acceso/lista", { pro: "codigo-pro-limitado" })))).body.codigos.find((c) => !c.revocado).codigo;
process.env.ACCESO_CODIGOS_PRO = "codigo-pro-ilimitado";
assert.equal((await api(req("/api/acceso/lista", { pro: "codigo-pro-limitado" }))).status, 401);
assert.equal((await J(await api(req("/api/acceso/validar", { method: "POST", body: { codigo: vivo } })))).body.valido, true);
// preflight
const o = await api(req("/api/acceso/crear", { method: "OPTIONS", origin: "https://aprens.es" }));
assert.equal(o.status, 204); assert.match(o.headers.get("access-control-allow-headers"), /x-codigo-pro/);

await server.stop();
console.log("acceso: ok");
