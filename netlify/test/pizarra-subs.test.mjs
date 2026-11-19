// Prueba de la suscripción de la Pizarra contra un servidor local de Blobs y un Stripe simulado.
// Ejecutar: npm test
import { BlobsServer } from "@netlify/blobs/server";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "pizarra-subs-"));
const server = new BlobsServer({ directory: dir, token: "t", port: 0 });
const { port } = await server.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: "s", token: "t", edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` })).toString("base64");
Object.assign(process.env, {
  STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x", PIZARRA_PLANES: "Entrenador|price_A1|3|4,99 € al mes",
  PIZARRA_TEXTOS_LEGALES: "revisados", PIZARRA_STRIPE_PORTAL_LOGIN: "https://billing.stripe.com/p/login/abc",
  PIZARRA_CODIGOS: "manual1234:2", PIZARRA_SUSCRIPCION: "si"
});
const root = new URL("../..", import.meta.url).pathname;
const lib = await import(root + "/netlify/lib/pizarra-subs.mjs");
const pago = await import(root + "/netlify/lib/pizarra-pago.mjs");
const subir = (await import(root + "/netlify/functions/pizarra-subir.mjs")).default;
const ia = (await import(root + "/netlify/functions/pizarra-ia.mjs")).default;

// Stripe simulado
const subs = { sub_1: { id: "sub_1", customer: "cus_1", status: "active", metadata: { app: "pizarra" }, items: { data: [{ price: { id: "price_A1" }, current_period_end: 2e9 }] } } };
const llamadas = [];
const fetchReal = globalThis.fetch;
globalThis.fetch = async (url, o = {}) => {
  const u = String(url);
  if (u.startsWith("https://api.stripe.com/v1/")) {
    const p = u.slice(26); llamadas.push([o.method || "GET", p, o.body || ""]);
    let r = {};
    if (p.startsWith("subscriptions/")) r = subs[p.slice(14)];
    else if (p.startsWith("checkout/sessions/")) r = { status: "complete", payment_status: "paid", subscription: "sub_1", metadata: { app: "pizarra" } };
    else if (p === "checkout/sessions") r = { url: "https://checkout.stripe.com/c/x" };
    else if (p.startsWith("customers/")) r = { id: "cus_1", email: "a@b.es", invoice_settings: { custom_fields: [] } };
    return new Response(JSON.stringify(r), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (u.includes("/.netlify/functions/pizarra-ia-fondo-background")) return new Response(null, { status: 202 });
  return fetchReal(url, o);
};

// configuración pública
let c = await (await pago.config(new Request("https://p/api/pizarra-config"))).json();
assert.equal(c.suscripcion, true); assert.equal(c.altas, true);
assert.deepEqual(c.planes, [{ nom: "Entrenador", ia: 3, precio: "4,99 € al mes" }]);
c = await (await pago.config(new Request("https://p/api/pizarra-config", { headers: { "x-codigo": "noexiste99" } }))).json();
assert.equal(c.acceso.activa, false);

// checkout: consentimiento y plan obligatorios
assert.equal((await pago.checkout(new Request("https://p/x", { method: "POST", body: JSON.stringify({ precio: "price_A1" }) }))).status, 400);
const ck = await pago.checkout(new Request("https://p/x", { method: "POST", body: JSON.stringify({ precio: "price_A1", acepto: true, inicio: true }) }));
assert.equal(ck.status, 200);
assert.match(decodeURIComponent(llamadas.at(-1)[2]), /metadata\[app\]=pizarra/);

// después de pagar: código (una sola vez aunque se pida dos veces)
const r1 = await (await pago.codigo(new Request("https://p/api/pizarra-codigo?session_id=cs_test_1234567890"))).json();
const r2 = await (await pago.codigo(new Request("https://p/api/pizarra-codigo?session_id=cs_test_1234567890"))).json();
assert.match(r1.codigo, /^[a-z2-9]{10}$/); assert.equal(r1.codigo, r2.codigo);
const codigo = r1.codigo;
c = await (await pago.config(new Request("https://p/x", { headers: { "x-codigo": codigo.toUpperCase() } }))).json();
assert.equal(c.acceso.activa, true); assert.deepEqual(c.acceso.ia, { usadas: 0, limite: 3 });

// enlaces cortos: sin código 402, con código 201
const datos = "A".repeat(40);
assert.equal((await subir(new Request("https://p/api/pizarra-subir", { method: "POST", body: datos }))).status, 402);
assert.equal((await subir(new Request("https://p/api/pizarra-subir", { method: "POST", body: datos, headers: { "x-codigo": "noexiste99" } }))).status, 402);
assert.equal((await subir(new Request("https://p/api/pizarra-subir", { method: "POST", body: datos, headers: { "x-codigo": codigo } }))).status, 201);
assert.equal((await subir(new Request("https://p/api/pizarra-subir", { method: "POST", body: datos, headers: { "x-codigo": "manual1234" } }))).status, 201);

// Claude: tope mensual del plan (3)
process.env.ANTHROPIC_API_KEY = "x";
const entrada = JSON.stringify({ tipo: "entreno", bloque: { categoria: "Ejercicio", titulo: "Rondo" }, pasos: [], jugadores: [] });
const pedir = (cod) => ia(new Request("https://p/api/pizarra-ia", { method: "POST", body: entrada, headers: cod ? { "x-codigo": cod } : {} }));
assert.equal((await pedir("")).status, 402);
for (let i = 0; i < 3; i++) assert.equal((await pedir(codigo)).status, 202, "consulta " + i);
const tope = await pedir(codigo);
assert.equal(tope.status, 429); assert.equal((await tope.json()).error, "cuota_mes");
c = await (await pago.config(new Request("https://p/x", { headers: { "x-codigo": codigo } }))).json();
assert.equal(c.acceso.ia.usadas, 3);
// código manual con su propio tope (2)
assert.equal((await pedir("manual1234")).status, 202);
assert.equal((await pedir("manual1234")).status, 202);
assert.equal((await pedir("manual1234")).status, 429);

// webhook: firma obligatoria; una baja deja el código sin acceso
const firmar = async (cuerpo, t = Math.floor(Date.now() / 1000)) => {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode("whsec_x"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const h = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(t + "." + cuerpo))), (b) => b.toString(16).padStart(2, "0")).join("");
  return "t=" + t + ",v1=" + h;
};
const ev = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { id: "sub_1", metadata: { app: "pizarra" }, items: { data: [{ price: { id: "price_A1" } }] } } } });
assert.equal((await pago.webhook(new Request("https://p/x", { method: "POST", body: ev, headers: { "stripe-signature": "t=1,v1=00" } }))).status, 400);
assert.equal((await pago.webhook(new Request("https://p/x", { method: "POST", body: ev, headers: { "stripe-signature": await firmar(ev, Math.floor(Date.now() / 1000) - 600) } }))).status, 400);
subs.sub_1 = { ...subs.sub_1, status: "canceled", ended_at: Math.floor(Date.now() / 1000) };
assert.equal((await pago.webhook(new Request("https://p/x", { method: "POST", body: ev, headers: { "stripe-signature": await firmar(ev) } }))).status, 200);
assert.equal(await lib.acceso(codigo), null);
assert.equal((await subir(new Request("https://p/api/pizarra-subir", { method: "POST", body: datos, headers: { "x-codigo": codigo } }))).status, 402);

// impago: 3 días de margen
assert.equal(lib.subActiva({ status: "past_due", pastDueSince: 1000 }, 1000 + 2 * 86400), true);
assert.equal(lib.subActiva({ status: "past_due", pastDueSince: 1000 }, 1000 + 4 * 86400), false);

// sin PIZARRA_SUSCRIPCION (aprens-app) todo sigue libre
delete process.env.PIZARRA_SUSCRIPCION;
assert.equal((await subir(new Request("https://p/api/pizarra-subir", { method: "POST", body: datos }))).status, 201);

// sin textos legales revisados no hay altas
process.env.PIZARRA_TEXTOS_LEGALES = "";
c = await (await pago.config(new Request("https://p/x"))).json();
assert.equal(c.altas, false); assert.deepEqual(c.planes, []);
assert.equal((await pago.checkout(new Request("https://p/x", { method: "POST", body: "{}" }))).status, 404);

// purga: se borran contadores de días y meses pasados
const us = lib.almacen(lib.USO);
await us.set("subir/abc/2000-01-01", "{}"); await us.set("ia/abc/mes/2000-01", "{}"); const manana = Date.now() + 86400000;   // hoy ya se ha purgado (lo lanza el webhook)
await us.set(lib.claveIA("abc", manana), "{}");
assert.equal(await lib.purgar(manana), true);
assert.equal(await us.get("subir/abc/2000-01-01"), null);
assert.equal(await us.get("ia/abc/mes/2000-01"), null);
assert.notEqual(await us.get(lib.claveIA("abc", manana)), null);

await server.stop();
console.log("pizarra-subs: ok");
