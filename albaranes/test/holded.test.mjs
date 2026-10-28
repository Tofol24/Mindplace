import test from "node:test";
import assert from "node:assert/strict";
import {
  ErrorHolded, albaranParaHolded, contactoParaHolded, crearClienteHolded, elegirContacto, enviarAlbaran, validarAlbaran,
} from "../lib/holded.mjs";

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
    buscarContactos: async (n) => { llamadas.push(["buscar", n]); return []; },
    crearContacto: async (c) => { llamadas.push(["crearContacto", c]); return "c".repeat(24); },
    listarAlbaranes: async (q) => { llamadas.push(["listar", q]); return []; },
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
