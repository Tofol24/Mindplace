import test from "node:test";
import assert from "node:assert/strict";
import { ErrorIA, MODELO, interpretarDictado, leerCompra } from "../lib/ia.mjs";

function anthropicFalso(respuesta, { stop = "end_turn", fallo } = {}) {
  const llamadas = [];
  return {
    llamadas,
    beta: {
      messages: {
        create: async (p) => {
          llamadas.push(p);
          if (fallo) throw fallo;
          return { stop_reason: stop, content: [{ type: "text", text: typeof respuesta === "string" ? respuesta : JSON.stringify(respuesta) }] };
        },
      },
    },
  };
}

const dictadoOk = {
  cliente: { nombre: "Jesús Arribas", telefono: "600111222", email: null, nif: null, direccion: null, poblacion: "Manacor" },
  direccionObra: null,
  trabajo: "Cambio de grifo del baño",
  observaciones: null,
  lineas: [
    { tipo: "material", articuloId: "art-grifo-1", concepto: "Grifo monomando", cantidad: 1, precio: null },
    { tipo: "material", articuloId: "inventado", concepto: "Latiguillo", cantidad: 2, precio: null },
    { tipo: "mano_obra", articuloId: null, concepto: "Mano de obra", cantidad: 1.5, precio: null },
    { tipo: "otro", articuloId: null, concepto: "  ", cantidad: 1, precio: 5 },
  ],
};

test("interpretarDictado: modelo, salida estructurada y enlaces solo a artículos del catálogo", async () => {
  const a = anthropicFalso(dictadoOk);
  const r = await interpretarDictado({
    anthropic: a,
    texto: "Cliente Jesús Arribas…",
    catalogo: [{ id: "art-grifo-1", nombre: "Grifo monomando", ref: "GM1" }],
  });
  const p = a.llamadas[0];
  assert.equal(p.model, MODELO);
  assert.equal(p.output_config.format.type, "json_schema");
  assert.equal(p.output_config.effort, "low");
  assert.equal(p.fallbacks, "default");
  assert.match(p.messages[0].content, /art-grifo-1 \| Grifo monomando \| ref GM1/);
  assert.match(p.messages[0].content, /<dictado>\nCliente Jesús Arribas…\n<\/dictado>/);
  assert.equal(r.cliente.nombre, "Jesús Arribas");
  assert.equal(r.lineas.length, 3, "la línea sin concepto se descarta");
  assert.equal(r.lineas[0].articuloId, "art-grifo-1");
  assert.equal(r.lineas[1].articuloId, null, "un id que no está en el catálogo no se acepta");
  assert.equal(r.lineas[2].cantidad, 1.5);
  assert.equal(r.lineas[0].precio, null, "sin precio dictado queda null (no 0)");
});

test("interpretarDictado: dictado vacío o largo, y errores de la IA", async () => {
  await assert.rejects(interpretarDictado({ anthropic: anthropicFalso({}), texto: "  " }), /vacío/);
  await assert.rejects(interpretarDictado({ anthropic: anthropicFalso({}), texto: "x".repeat(4001) }), /largo/);
  await assert.rejects(
    interpretarDictado({ anthropic: anthropicFalso("", { stop: "refusal" }), texto: "hola" }),
    (e) => e instanceof ErrorIA && e.status === 422,
  );
  await assert.rejects(
    interpretarDictado({ anthropic: anthropicFalso("no json"), texto: "hola" }),
    (e) => e.reintentar === true,
  );
  const sinRed = Object.assign(new Error("timeout"), { status: undefined });
  await assert.rejects(
    interpretarDictado({ anthropic: anthropicFalso({}, { fallo: sinRed }), texto: "hola" }),
    (e) => e.reintentar === true && e.status === 503,
  );
  const sinClave = Object.assign(new Error("auth"), { status: 401 });
  await assert.rejects(
    interpretarDictado({ anthropic: anthropicFalso({}, { fallo: sinClave }), texto: "hola" }),
    (e) => e.reintentar === false && /Anthropic/.test(e.message),
  );
});

test("leerCompra: manda la imagen y limpia la respuesta", async () => {
  const a = anthropicFalso({
    esDocumento: true, tipo: "albaran", proveedor: "Suministros Mallorca SL", nifProveedor: "B07000000",
    numero: "A-123", fecha: "2026-10-27",
    lineas: [
      { referencia: "GM1", descripcion: "Grifo monomando", cantidad: 2, precioUnitario: 30.5, descuento: 10, iva: 21 },
      { referencia: null, descripcion: "Cinta teflón", cantidad: -3, precioUnitario: 1.2, descuento: null, iva: 21 },
    ],
    base: 56.1, cuotaIva: 11.78, total: 67.88,
  });
  const r = await leerCompra({ anthropic: a, imagen: "QUJD", tipoImagen: "image/jpeg" });
  const img = a.llamadas[0].messages[0].content[0];
  assert.deepEqual(img, { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "QUJD" } });
  assert.equal(r.proveedor, "Suministros Mallorca SL");
  assert.equal(r.lineas[0].precioUnitario, 30.5);
  assert.equal(r.lineas[1].cantidad, 1, "una cantidad imposible se sustituye por 1");
  assert.equal(r.lineas[1].descuento, 0);
  assert.equal(r.base, 56.1);
});

test("leerCompra: rechaza fotos no válidas", async () => {
  const a = anthropicFalso({});
  await assert.rejects(leerCompra({ anthropic: a, imagen: "no base64!", tipoImagen: "image/jpeg" }), /foto/);
  await assert.rejects(leerCompra({ anthropic: a, imagen: "QUJD", tipoImagen: "image/gif" }), /Formato/);
  assert.equal(a.llamadas.length, 0);
});
