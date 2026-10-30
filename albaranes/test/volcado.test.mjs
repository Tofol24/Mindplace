import test from "node:test";
import assert from "node:assert/strict";
import { COLUMNAS_ALBARANES, COLUMNAS_LINEAS, FORMATO_VERSION, csvAlbaranes, csvLineas, datosVolcado, jsonVolcado } from "../public/js/volcado-formato.js";

// La factura A-26/0052 de la Mutua, como albarán firmado en la app.
const mutua = () => ({
  id: "0b6c3f2e-1111-4a2b-9c3d-123456789abc", numero: "AP-2026-0001", fecha: "2026-09-30", estado: "firmado",
  firmadoEn: "2026-09-30T17:20:00.000Z", firmante: "Mutua Balear",
  negocio: { nombre: "Cristóbal Villalonga Melis", nif: "78210217M", textoExencion: "Operación exenta de IVA (art. 20.Uno.3 de la Ley 37/1992)." },
  cliente: { nombre: "Mutua Balear", nif: "G-07046196", direccion: "Bisbe Campins, 4", cp: "07012", poblacion: "Palma", telefono: "", email: "" },
  trabajo: "", observaciones: "", retencion: 15,
  lineas: [
    { concepto: "Primera psicología. Terapia clínica psicológica", cantidad: 12, precio: 60, iva: 0 },
    { concepto: "Sucesivas psicología. Terapia clínica psicológica", cantidad: 41, precio: 50, iva: 0 },
  ],
});
const filas = (csv) => csv.replace(/^﻿/, "").trim().split("\r\n").map((f) => f.split(";").map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"')));

test("datosVolcado: totales, exención E1 y cliente empresa, como la factura de la Mutua", () => {
  const d = datosVolcado(mutua());
  assert.equal(d.baseImponible, 2770);
  assert.equal(d.baseExenta, 2770);
  assert.equal(d.baseSujeta, 0);
  assert.equal(d.cuotaIva, 0);
  assert.equal(d.cuotaRetencion, 415.5);
  assert.equal(d.total, 2354.5);
  assert.equal(d.exento, true);
  assert.equal(d.verifactuCausaExencion, "E1");
  assert.equal(d.cliente.esEmpresa, true);
  assert.deepEqual(d.emisor, { nombre: "Cristóbal Villalonga Melis", nif: "78210217M" });
  assert.deepEqual(d.lineas.map((l) => [l.linea, l.cantidad, l.precioUnitario, l.ivaPct, l.base]), [[1, 12, 60, 0, 720], [2, 41, 50, 0, 2050]]);
  // Con IVA (Pere): sin exención ni causa.
  const pere = { ...mutua(), retencion: 0, negocio: { nombre: "Pere" }, cliente: { nombre: "Joan" }, lineas: [{ concepto: "Grifo", cantidad: 1, precio: 100, iva: 21 }] };
  const p = datosVolcado(pere);
  assert.deepEqual([p.exento, p.verifactuCausaExencion, p.baseSujeta, p.cuotaIva, p.total], [false, "", 100, 21, 121]);
  // Exento con una mención que no cita el art. 20: la causa la decide el programa.
  assert.equal(datosVolcado({ ...mutua(), negocio: { textoExencion: "Operación exenta de IVA." } }).verifactuCausaExencion, "");
});

test("csvAlbaranes / csvLineas: columnas documentadas, «;», coma decimal, BOM y enlace por albaran_id", () => {
  const d = [datosVolcado(mutua())];
  const a = csvAlbaranes(d);
  assert.ok(a.startsWith("﻿"));
  const fa = filas(a);
  assert.deepEqual(fa[0], COLUMNAS_ALBARANES);
  const fila = Object.fromEntries(COLUMNAS_ALBARANES.map((c, i) => [c, fa[1][i]]));
  assert.equal(fila.fecha, "2026-09-30");
  assert.equal(fila.base_imponible, "2770");
  assert.equal(fila.cuota_retencion, "415,5");
  assert.equal(fila.total, "2354,5");
  assert.equal(fila.exento, "S");
  assert.equal(fila.cliente_es_empresa, "S");
  assert.equal(fila.verifactu_causa_exencion, "E1");
  const fl = filas(csvLineas(d));
  assert.deepEqual(fl[0], COLUMNAS_LINEAS);
  assert.equal(fl.length, 3);
  assert.deepEqual(fl.slice(1).map((f) => [f[0], f[3], f[5], f[6], f[9]]), [[mutua().id, "1", "12", "60", "720"], [mutua().id, "2", "41", "50", "2050"]]);
});

test("CSV: comillas y fórmulas neutralizadas (Excel)", () => {
  const raro = { ...mutua(), cliente: { nombre: '=HYPERLINK("x")', nif: "" }, lineas: [{ concepto: 'Sesión "doble"', cantidad: 1.5, precio: 50, iva: 0 }] };
  const a = csvAlbaranes([datosVolcado(raro)]);
  assert.match(a, /"'=HYPERLINK\(""x""\)"/);
  const l = csvLineas([datosVolcado(raro)]);
  assert.match(l, /"Sesión ""doble"""/);
  assert.match(l, /"1,5"/);
});

test("jsonVolcado: formato y versión, números como números", () => {
  const j = JSON.parse(jsonVolcado([datosVolcado(mutua())], { exportadoEn: "2026-10-01T00:00:00.000Z" }));
  assert.equal(j.formato, "albaranes-volcado");
  assert.equal(j.version, FORMATO_VERSION);
  assert.equal(j.albaranes[0].total, 2354.5);
  assert.equal(j.albaranes[0].lineas[1].cantidad, 41);
});
