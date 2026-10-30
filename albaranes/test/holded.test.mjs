import test from "node:test";
import assert from "node:assert/strict";
import {
  ErrorHolded, albaranParaHolded, contactoParaHolded, crearClienteHolded, elegirContacto, enviarAlbaran, huellaAlbaran,
  olvidarImpuestos, resolverImpuestos, validarAlbaran,
} from "../lib/holded.mjs";
import { totales } from "../public/js/calculos.js";

// Impuestos de una cuenta de Holded con IVA exento y retención del 15 % activos.
const IMPUESTOS_CUENTA = { iva: { 21: "s_iva_21", 10: "s_iva_10", 0: "s_iva_exento" }, retencion: { 7: null, 15: "s_ret_15" } };

const base = () => ({
  id: "alb-1234-abcd",
  numero: "M-2026-0001",
  fecha: "2026-10-28",
  cliente: { nombre: "María Pérez", nif: "12345678Z", telefono: "600111222", email: "maria@example.com", direccion: "C/ Mar 1" },
  direccionObra: "C/ Mar 1, bajo",
  trabajo: "Cambio de grifo",
  lineas: [
    { concepto: "Grifo monomando", cantidad: 1, precio: 45.5, iva: 21 },
    { concepto: "Mano de obra", cantidad: 1.5, precio: 35, iva: 21 },
  ],
  pdf: Buffer.from("%PDF-1.4 prueba").toString("base64"),
});

function almacenMemoria() {
  const m = new Map();
  return { m, leer: async (id) => (m.has(id) ? structuredClone(m.get(id)) : null), guardar: async (id, e) => { m.set(id, structuredClone(e)); } };
}

function holdedFalso(over = {}) {
  const llamadas = [];
  const h = {
    llamadas,
    impuestos: async () => IMPUESTOS_CUENTA, // no se apunta: no cambia el orden de las llamadas
    buscarContactos: async (n) => { llamadas.push(["buscar", n]); return []; },
    crearContacto: async (c) => { llamadas.push(["crearContacto", c]); return "c".repeat(24); },
    listarAlbaranes: async (q) => { llamadas.push(["listar", q]); return []; },
    obtenerAlbaran: async (id) => { llamadas.push(["obtener", id]); return { id, notes: "Creado desde la app de albaranes (ref. alb-1234-abcd)" }; },
    crearAlbaran: async (a) => { llamadas.push(["crearAlbaran", a]); return "w".repeat(24); },
    adjuntar: async (id, bytes, nombre) => { llamadas.push(["adjuntar", id, nombre, bytes.length]); return { id: "x" }; },
    ...over,
  };
  for (const k of Object.keys(over)) {
    const f = over[k];
    h[k] = async (...a) => { llamadas.push([k, ...a]); return f(...a); };
  }
  return h;
}

test("validarAlbaran acepta un albarán correcto y limpia espacios", () => {
  const a = validarAlbaran({ ...base(), trabajo: "  Cambio de grifo  " });
  assert.equal(a.trabajo, "Cambio de grifo");
  assert.equal(a.lineas.length, 2);
});

test("validarAlbaran rechaza datos malos", () => {
  assert.throws(() => validarAlbaran({ ...base(), numero: "M 1/2" }), ErrorHolded);
  assert.throws(() => validarAlbaran({ ...base(), fecha: "28/10/2026" }), ErrorHolded);
  assert.throws(() => validarAlbaran({ ...base(), fecha: "2026-02-31" }), /Fecha/);
  assert.throws(() => validarAlbaran({ ...base(), fecha: "" }), /Fecha/);
  assert.throws(() => validarAlbaran({ ...base(), lineas: [] }), ErrorHolded);
  assert.throws(() => validarAlbaran({ ...base(), lineas: [{ concepto: "x", cantidad: 1, precio: 1, iva: 7 }] }), /IVA no permitido/);
  assert.throws(() => validarAlbaran({ ...base(), cliente: { nombre: " " } }), /nombre del cliente/);
  assert.throws(() => validarAlbaran({ ...base(), pdf: "no es base64!!" }), /PDF/);
  assert.throws(() => validarAlbaran({ ...base(), cliente: { nombre: "A", email: "malo" } }), /email/);
});

test("elegirContacto: por NIF, o por nombre solo si coincide email o teléfono", () => {
  const c = [
    { id: "1", name: "Maria Perez", code: "99999999R", email: "otra@example.com" },
    { id: "2", name: "María  Pérez", code: "", mobile: "+34 600 111 222" },
    { id: "3", name: "Juan", code: "12345678-z" },
  ];
  assert.equal(elegirContacto(c, { nombre: "Otro", nif: "12345678Z" }).id, "3");
  // Mismo nombre, sin NIF en Holded y mismo teléfono: es el mismo cliente.
  assert.equal(elegirContacto(c, { nombre: "maria perez", nif: "11111111H", telefono: "600111222" }).id, "2");
  // Solo el nombre no basta: dos personas pueden llamarse igual.
  assert.equal(elegirContacto(c, { nombre: "maria perez", nif: "" }), null);
  assert.equal(elegirContacto(c, { nombre: "maria perez", nif: "11111111H" }), null);
  // Un contacto con otro NIF nunca es el mismo, aunque coincida el email.
  assert.equal(elegirContacto([c[0]], { nombre: "María Pérez", nif: "11111111H", email: "otra@example.com" }), null);
  // Dos homónimos con el mismo teléfono: ante la duda, contacto nuevo.
  assert.equal(elegirContacto([c[1], { ...c[1], id: "4" }], { nombre: "María Pérez", telefono: "600111222" }), null);
});

test("contactoParaHolded distingue empresa (CIF) de persona", () => {
  assert.equal(contactoParaHolded({ nombre: "Fontanería SL", nif: "B12345678" }).is_person, false);
  assert.equal(contactoParaHolded({ nombre: "Ana", nif: "12345678Z" }).is_person, true);
  assert.equal(contactoParaHolded({ nombre: "Ana", nif: "" }).is_person, true);
});

test("albaranParaHolded usa el número propio y la clave de IVA de Holded", () => {
  const w = albaranParaHolded(validarAlbaran(base()), "c".repeat(24));
  assert.equal(w.number, "M-2026-0001");
  assert.deepEqual(w.items[0], { name: "Grifo monomando", units: 1, price: 45.5, taxes: ["s_iva_21"] });
  assert.match(w.description, /Dirección de la obra/);
});

test("enviarAlbaran crea cliente, albarán y adjunta el PDF", async () => {
  const h = holdedFalso();
  const alm = almacenMemoria();
  const r = await enviarAlbaran({ holded: h, almacen: alm, albaran: validarAlbaran(base()) });
  assert.deepEqual(r, { contactId: "c".repeat(24), albaranId: "w".repeat(24), adjunto: true });
  assert.deepEqual(h.llamadas.map((l) => l[0]), ["buscar", "crearContacto", "crearAlbaran", "adjuntar"]);
});

test("enviarAlbaran usa el cliente de Holded si ya existe", async () => {
  const h = holdedFalso({ buscarContactos: async () => [{ id: "e".repeat(24), name: "Maria Perez", code: "12345678Z" }] });
  const r = await enviarAlbaran({ holded: h, almacen: almacenMemoria(), albaran: validarAlbaran(base()) });
  assert.equal(r.contactId, "e".repeat(24));
  assert.ok(!h.llamadas.some((l) => l[0] === "crearContacto"));
});

test("reintento tras un corte: no duplica el albarán ni el adjunto", async () => {
  const alm = almacenMemoria();
  const a = validarAlbaran(base());
  let veces = 0;
  const h1 = holdedFalso({ adjuntar: async () => { veces++; throw new ErrorHolded("sin red", { reintentar: true }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: a }), /sin red/);
  assert.equal(veces, 1);
  const h2 = holdedFalso();
  const r = await enviarAlbaran({ holded: h2, almacen: alm, albaran: a });
  assert.equal(r.adjunto, true);
  assert.deepEqual(h2.llamadas.map((l) => l[0]), ["adjuntar"]);
});

test("si se cortó al crear el albarán, lo busca en Holded antes de crear otro", async () => {
  const alm = almacenMemoria();
  const a = validarAlbaran(base());
  const h1 = holdedFalso({ crearAlbaran: async () => { throw new ErrorHolded("timeout", { reintentar: true }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: a }));
  assert.equal(alm.m.get(a.id).creando, true);
  const h2 = holdedFalso({ listarAlbaranes: async () => [{ id: "f".repeat(24), document_number: "M-2026-0001" }] });
  const r = await enviarAlbaran({ holded: h2, almacen: alm, albaran: a });
  assert.equal(r.albaranId, "f".repeat(24));
  const busqueda = h2.llamadas.find((l) => l[0] === "listarAlbaranes")[1];
  assert.equal(busqueda.start_date, "2026-10-27");
  assert.equal(busqueda.end_date, "2026-10-29");
  assert.ok(!h2.llamadas.some((l) => l[0] === "crearAlbaran"));
  assert.equal(alm.m.get(a.id).creando, undefined);
});

test("listarAlbaranes recorre las páginas del cursor", async () => {
  const vistas = [];
  const fetchFalso = async (url) => {
    vistas.push(url.searchParams.get("cursor"));
    const r = url.searchParams.get("cursor") ? { items: [{ id: "2" }], has_more: false } : { items: [{ id: "1" }], has_more: true, cursor: "c2" };
    return new Response(JSON.stringify(r), { status: 200 });
  };
  const items = await crearClienteHolded({ apiKey: "k", fetch: fetchFalso }).listarAlbaranes({ limit: 200 });
  assert.deepEqual(items.map((w) => w.id), ["1", "2"]);
  assert.deepEqual(vistas, [null, "c2"]);
});

test("crearClienteHolded: cabecera Bearer, URL v2 y errores clasificados", async () => {
  const vistas = [];
  const fetchFalso = async (url, op) => {
    vistas.push([String(url), op]);
    if (String(url).includes("/waybills")) return new Response(JSON.stringify({ detail: "límite" }), { status: 429 });
    return new Response(JSON.stringify({ items: [{ id: "1" }] }), { status: 200 });
  };
  const h = crearClienteHolded({ apiKey: "k", fetch: fetchFalso });
  const items = await h.buscarContactos("Ana", 5);
  assert.equal(items.length, 1);
  assert.equal(vistas[0][0], "https://api.holded.com/api/v2/contacts/search?name=Ana&limit=5");
  assert.equal(vistas[0][1].headers.Authorization, "Bearer k");
  await assert.rejects(h.crearAlbaran({}), (e) => e.reintentar === true && e.status === 429 && /límite/.test(e.message));
  const h401 = crearClienteHolded({ apiKey: "k", fetch: async () => new Response("", { status: 401 }) });
  await assert.rejects(h401.buscarContactos("x"), (e) => e.reintentar === false && /no es válida/.test(e.message));
  const hRed = crearClienteHolded({ apiKey: "k", fetch: async () => { throw new TypeError("fetch failed"); } });
  await assert.rejects(hRed.buscarContactos("x"), (e) => e.reintentar === true);
});

test("albarán corregido con otro cliente: se busca de nuevo el contacto", async () => {
  const alm = almacenMemoria();
  const a = validarAlbaran(base());
  const h1 = holdedFalso({ crearAlbaran: async () => { throw new ErrorHolded("rechazado", { status: 422 }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: a }));
  const corregido = validarAlbaran({ ...base(), cliente: { nombre: "Juan Gómez" } });
  const h2 = holdedFalso({ crearContacto: async () => "d".repeat(24) });
  const r = await enviarAlbaran({ holded: h2, almacen: alm, albaran: corregido });
  assert.equal(r.contactId, "d".repeat(24));
});

test("dos envíos simultáneos del mismo albarán solo crean uno", async () => {
  const alm = almacenMemoria();
  const cerrojos = new Set();
  alm.bloquear = async (id) => {
    if (cerrojos.has(id)) return null;
    cerrojos.add(id);
    return async () => { cerrojos.delete(id); };
  };
  const h = holdedFalso({ crearAlbaran: async () => { await new Promise((r) => setTimeout(r, 20)); return "w".repeat(24); } });
  const a = validarAlbaran(base());
  const r = await Promise.allSettled([enviarAlbaran({ holded: h, almacen: alm, albaran: a }), enviarAlbaran({ holded: h, almacen: alm, albaran: a })]);
  assert.equal(h.llamadas.filter((l) => l[0] === "crearAlbaran").length, 1);
  assert.equal(r.filter((x) => x.status === "fulfilled").length, 1);
  assert.ok(r.some((x) => x.status === "rejected" && x.reason.reintentar === true && x.reason.status === 409));
  assert.equal(cerrojos.size, 0);
});

test("si Holded rechaza el PDF, no se acepta un albarán corregido sobre el documento ya creado", async () => {
  const alm = almacenMemoria();
  const h1 = holdedFalso({ adjuntar: async () => { throw new ErrorHolded("rechazado", { status: 422 }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: validarAlbaran(base()) }), /no ha aceptado el PDF/);
  // Con otro cliente: el albarán creado no cuadraría con lo firmado.
  const h2 = holdedFalso();
  const corregido = validarAlbaran({ ...base(), cliente: { nombre: "Juan Gómez" } });
  await assert.rejects(enviarAlbaran({ holded: h2, almacen: alm, albaran: corregido }), (e) => e.status === 422 && /ya está creado en Holded/.test(e.message));
  assert.ok(!h2.llamadas.some((l) => l[0] === "adjuntar"));
  // Con los mismos datos (otra firma u otro firmante) sí se adjunta.
  const h3 = holdedFalso();
  const r = await enviarAlbaran({ holded: h3, almacen: alm, albaran: validarAlbaran({ ...base(), firmante: "Pep" }) });
  assert.equal(r.adjunto, true);
  assert.deepEqual(h3.llamadas.map((l) => l[0]), ["adjuntar"]);
});

test("si se cortó al crear el albarán, no se aceptan datos cambiados en el reintento", async () => {
  const alm = almacenMemoria();
  const h1 = holdedFalso({ crearAlbaran: async () => { throw new ErrorHolded("sin red", { reintentar: true }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: validarAlbaran(base()) }), /sin red/);
  const otro = base();
  otro.lineas[0].precio = 99;
  const h2 = holdedFalso({ listarAlbaranes: async () => [{ id: "w".repeat(24), number: "M-2026-0001" }] });
  await assert.rejects(enviarAlbaran({ holded: h2, almacen: alm, albaran: validarAlbaran(otro) }), /ya está creado en Holded/);
  assert.equal(h2.llamadas.length, 0);
});

test("corregir el teléfono o el email de un cliente sin NIF vuelve a buscar su ficha", async () => {
  const alm = almacenMemoria();
  const sinNif = (telefono) => validarAlbaran({ ...base(), cliente: { nombre: "Ana Gil", telefono } });
  const h1 = holdedFalso({ crearAlbaran: async () => { throw new ErrorHolded("rechazado", { status: 422 }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: sinNif("600000001") }));
  const h2 = holdedFalso({ crearContacto: async () => "b".repeat(24) });
  const r = await enviarAlbaran({ holded: h2, almacen: alm, albaran: sinNif("600000002") });
  assert.equal(r.contactId, "b".repeat(24));
});

test("si Holded rechaza el PDF de un albarán ya creado, el error lo indica (no se ofrece corregir)", async () => {
  const h = holdedFalso({ adjuntar: async () => { throw new ErrorHolded("PDF no válido", { status: 422 }); } });
  await assert.rejects(
    enviarAlbaran({ holded: h, almacen: almacenMemoria(), albaran: validarAlbaran(base()) }),
    (e) => e.yaEnHolded === true && e.status === 422,
  );
});

test("recuperación tras un corte: no adjunta a otro albarán con el mismo número", async () => {
  const alm = almacenMemoria();
  const a = validarAlbaran(base());
  const h1 = holdedFalso({ crearAlbaran: async () => { throw new ErrorHolded("timeout", { reintentar: true }); } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: a }));
  const h2 = holdedFalso({
    listarAlbaranes: async () => [{ id: "9".repeat(24), document_number: "M-2026-0001" }],
    obtenerAlbaran: async (id) => ({ id, notes: "Creado desde la app de albaranes (ref. otro-albaran-viejo)" }),
  });
  await assert.rejects(enviarAlbaran({ holded: h2, almacen: alm, albaran: a }), /ya hay otro albarán/);
  assert.ok(!h2.llamadas.some((l) => l[0] === "adjuntar" || l[0] === "crearAlbaran"));
});

// --- IVA exento y retención de IRPF ------------------------------------------------

test("totales: sesiones exentas de IVA con retención del 15 % (factura A-26/0052)", () => {
  const t = totales([{ cantidad: 12, precio: 60, iva: 0 }, { cantidad: 41, precio: 50, iva: 0 }], 15);
  assert.equal(t.base, 2770);
  assert.equal(t.cuota, 0);
  assert.equal(t.cuotaRetencion, 415.5);
  assert.equal(t.total, 2354.5);
  assert.equal(totales([{ cantidad: 1, precio: 100, iva: 21 }]).total, 121); // sin retención, como antes
});

test("resolverImpuestos: elige IVA exento y retención de venta de la lista de la cuenta", () => {
  const lista = [
    { key: "s_iva_21", name: "IVA 21%", amount: "21", type: "percentage" },
    { key: "s_iva_10", name: "IVA 10%", amount: "10" },
    { key: "s_iva_0", name: "IVA 0% exportación", amount: "0" },
    { key: "s_iva_exento", name: "Exento", amount: "0" },
    { key: "p_iva_21", name: "IVA 21% compras", amount: "21" },
    { key: "s_ret_15", name: "Retención 15%", amount: "-15" },
    { key: "s_ret_7", name: "Retención 7%", amount: "-7", status: false },
    { key: "p_ret_15", name: "Retención 15% compras", amount: "-15" },
  ];
  const r = resolverImpuestos(lista);
  assert.deepEqual(r.iva, { 21: "s_iva_21", 10: "s_iva_10", 0: "s_iva_exento" });
  assert.deepEqual(r.retencion, { 7: null, 15: "s_ret_15" }); // la del 7 % está desactivada
  // Solo un 0 % que se llame «exento»: el de exportación no vale.
  assert.equal(resolverImpuestos([{ key: "s_iva_0", name: "IVA 0% exportación", amount: "0" }]).iva[0], null);
  // Claves propias de la cuenta, identificadas por nombre y ámbito; las de compra, fuera.
  const propios = resolverImpuestos([
    { key: "p_exento", name: "Exento compras", amount: "0", scope: "purchases" },
    { key: "exento_sanitario", name: "Exento sanitario", amount: "0", scope: "sales", group: "iva" },
    { key: "irpf15", name: "Retención IRPF 15%", amount: "-15", scope: "sales" },
  ]);
  assert.equal(propios.iva[0], "exento_sanitario");
  assert.equal(propios.retencion[15], "irpf15");
  // Una cuenta sin exento ni retenciones: no se inventan claves.
  assert.deepEqual(resolverImpuestos([{ key: "s_iva_21", amount: "21" }]).retencion, { 7: null, 15: null });
  assert.equal(resolverImpuestos([{ key: "s_iva_21", amount: "21" }]).iva[0], null);
});

test("validarAlbaran admite IVA exento y retenciones del 0, 7 y 15 %", () => {
  const a = validarAlbaran({ ...base(), retencion: 15, lineas: [{ concepto: "Sesión de psicología", cantidad: 1, precio: 60, iva: 0 }] });
  assert.equal(a.retencion, 15);
  assert.equal(a.lineas[0].iva, 0);
  assert.equal(validarAlbaran(base()).retencion, 0);
  assert.throws(() => validarAlbaran({ ...base(), retencion: 19 }), /Retención de IRPF no permitida/);
  assert.throws(() => validarAlbaran({ ...base(), lineas: [{ concepto: "x", cantidad: 1, precio: 1, iva: 4 }] }), /IVA no permitido/);
});

test("albaranParaHolded pone a cada línea su IVA y la retención del cliente", () => {
  const a = validarAlbaran({ ...base(), retencion: 15, lineas: [{ concepto: "Sesión", cantidad: 2, precio: 50, iva: 0 }] });
  assert.deepEqual(albaranParaHolded(a, "c".repeat(24), IMPUESTOS_CUENTA).items[0].taxes, ["s_iva_exento", "s_ret_15"]);
  assert.deepEqual(albaranParaHolded(validarAlbaran(base()), "c".repeat(24), IMPUESTOS_CUENTA).items[0].taxes, ["s_iva_21"]);
  // Sin el impuesto en Holded no se manda nada (Holded aplicaría el IVA por defecto del contacto).
  const sinExento = { iva: { ...IMPUESTOS_CUENTA.iva, 0: null }, retencion: IMPUESTOS_CUENTA.retencion };
  assert.throws(() => albaranParaHolded(a, "c".repeat(24), sinExento), (e) => e.status === 502 && /IVA exento/.test(e.message));
  const sinRet = { iva: IMPUESTOS_CUENTA.iva, retencion: { 7: null, 15: null } };
  assert.throws(() => albaranParaHolded(a, "c".repeat(24), sinRet), (e) => e.status === 502 && /retención de IRPF del 15/.test(e.message));
});

test("si falta un impuesto en Holded no se intenta crear el albarán (ni queda «creando»)", async () => {
  const alm = almacenMemoria();
  const a = validarAlbaran({ ...base(), retencion: 15, lineas: [{ concepto: "Sesión", cantidad: 1, precio: 60, iva: 0 }] });
  const h1 = holdedFalso();
  h1.impuestos = async () => ({ iva: { 21: "s_iva_21", 10: "s_iva_10", 0: null }, retencion: { 7: null, 15: null } });
  await assert.rejects(enviarAlbaran({ holded: h1, almacen: alm, albaran: a }), /IVA exento/);
  assert.ok(!h1.llamadas.some((l) => l[0] === "crearAlbaran"));
  assert.ok(![...alm.m.values()].some((e) => e.creando));
  // Activado en Holded: se envía con las dos claves.
  const h2 = holdedFalso();
  await enviarAlbaran({ holded: h2, almacen: alm, albaran: a });
  assert.deepEqual(h2.llamadas.find((l) => l[0] === "crearAlbaran")[1].items[0].taxes, ["s_iva_exento", "s_ret_15"]);
});

test("la retención forma parte de la huella, sin cambiar la de los albaranes sin retención", () => {
  const sin = validarAlbaran(base());
  assert.equal(huellaAlbaran(sin), huellaAlbaran({ ...sin, retencion: 0 }));
  assert.notEqual(huellaAlbaran(sin), huellaAlbaran({ ...sin, retencion: 15 }));
});

test("crearClienteHolded.impuestos lee GET /taxes, lo recuerda y sin permiso usa las claves por defecto", async () => {
  olvidarImpuestos();
  const vistas = [];
  const h = crearClienteHolded({ apiKey: "k1", fetch: async (url) => { vistas.push(String(url)); return Response.json([{ key: "s_iva_21", amount: "21" }, { key: "s_iva_exento", name: "Exento", amount: "0" }, { key: "s_ret_15", amount: "-15" }]); } });
  const r = await h.impuestos();
  assert.equal(r.iva[0], "s_iva_exento");
  assert.equal(r.retencion[15], "s_ret_15");
  await h.impuestos();
  assert.deepEqual(vistas, ["https://api.holded.com/api/v2/taxes"]); // la segunda vez, de la memoria
  olvidarImpuestos();
  const h403 = crearClienteHolded({ apiKey: "k2", fetch: async () => new Response("", { status: 403 }) });
  const d = await h403.impuestos();
  assert.equal(d.sinLista, true);
  assert.equal(d.iva[21], "s_iva_21");
  assert.equal(d.iva[0], null);
  olvidarImpuestos();
  const hCaido = crearClienteHolded({ apiKey: "k3", fetch: async () => new Response("", { status: 503 }) });
  await assert.rejects(hCaido.impuestos(), (e) => e.reintentar === true);
  olvidarImpuestos();
});

// --- Perfiles de profesión --------------------------------------------------------

test("leerServicios: «Nombre: precio» por línea, con coma o punto decimal", async () => {
  const { leerServicios, escribirServicios } = await import("../public/js/perfiles.js");
  assert.deepEqual(leerServicios("Primera visita: 60\nSesión de seguimiento = 50,5 €\n\nInforme"), [
    { nombre: "Primera visita", precio: 60 },
    { nombre: "Sesión de seguimiento", precio: 50.5 },
    { nombre: "Informe", precio: 0 },
  ]);
  const lista = [{ nombre: "Sesión de pareja", precio: 70 }];
  assert.deepEqual(leerServicios(escribirServicios(lista)), lista);
});

// --- Ajustes de partida de cada instalación ------------------------------------

test("configInicial: lee las variables APP_* y descarta las mal puestas", async () => {
  const { configInicial } = await import("../lib/config.mjs");
  assert.deepEqual(configInicial({}), {}); // sin variables (instalación de Pere): nada
  const c = configInicial({
    APP_PERFIL: "servicios",
    APP_NEGOCIO_NOMBRE: " Cristóbal Villalonga Melis ",
    APP_NEGOCIO_NIF: "78210217M",
    APP_IVA: "0",
    APP_RETENCION: "15",
    APP_TEXTO_EXENCION: "Operación exenta de IVA (art. 20.Uno.3 de la Ley 37/1992).",
    APP_SERVICIOS: "Primera visita: 60 | Sesión de seguimiento: 50,5 | sin precio",
    APP_PREFIJO: "ap",
  });
  assert.equal(c.perfil, "servicios");
  assert.deepEqual(c.negocio, {
    nombre: "Cristóbal Villalonga Melis", nif: "78210217M", direccion: "", telefono: "", email: "",
    textoExencion: "Operación exenta de IVA (art. 20.Uno.3 de la Ley 37/1992).",
  });
  assert.equal(c.ivaDefecto, 0);
  assert.equal(c.retencionEmpresas, 15);
  assert.deepEqual(c.servicios, [{ nombre: "Primera visita", precio: 60 }, { nombre: "Sesión de seguimiento", precio: 50.5 }]);
  assert.equal(c.prefijo, "AP");
  assert.deepEqual(configInicial({ APP_PERFIL: "otro", APP_IVA: "4", APP_RETENCION: "19", APP_PREFIJO: "A-1" }), {});
  assert.deepEqual(configInicial({ APP_IVA: "", APP_RETENCION: " " }), {}); // vacías: no son «0»
});

test("GET /api/config pide la clave de la app (los datos del profesional no son públicos)", async () => {
  process.env.APP_CLAVE = "clave-de-prueba";
  process.env.APP_NEGOCIO_NOMBRE = "Cristóbal Villalonga Melis";
  const { default: handler } = await import("../functions/config.mjs");
  const sin = await handler(new Request("https://x/api/config"));
  assert.equal(sin.status, 401);
  assert.ok(!(await sin.text()).includes("Villalonga"));
  const con = await handler(new Request("https://x/api/config", { headers: { "x-clave-app": "clave-de-prueba" } }));
  assert.equal(con.status, 200);
  assert.equal((await con.json()).negocio.nombre, "Cristóbal Villalonga Melis");
  delete process.env.APP_CLAVE; delete process.env.APP_NEGOCIO_NOMBRE;
});
