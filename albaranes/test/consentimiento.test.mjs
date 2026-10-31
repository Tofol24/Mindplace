import { test } from "node:test";
import assert from "node:assert/strict";
import { apartados, consentimientoDe, opciones, pideConsentimiento } from "../public/js/consentimiento-texto.js";
import { configInicial } from "../lib/config.mjs";

test("pideConsentimiento: solo con un servicio que contiene la palabra clave", () => {
  assert.equal(pideConsentimiento([{ concepto: "Primera visita" }], "primera"), true);
  assert.equal(pideConsentimiento([{ concepto: "PRIMERA VISITA (online)" }], "Primera"), true);
  assert.equal(pideConsentimiento([{ concepto: "Sesión de seguimiento" }], "primera"), false);
  assert.equal(pideConsentimiento([{ concepto: "Primera visita" }], ""), false); // sin palabra: nunca
  assert.equal(pideConsentimiento([], "primera"), false);
});

test("consentimientoDe: mismo nombre y, si ambos tienen teléfono, el mismo", () => {
  const lista = [
    { id: "a", paciente: { nombre: "Paciente Ficticio", telefono: "600000001" }, firmadoEn: "2026-01-01T10:00:00Z" },
    { id: "b", paciente: { nombre: "Paciente Ficticio", telefono: "" }, firmadoEn: "2026-03-01T10:00:00Z" },
  ];
  assert.equal(consentimientoDe({ nombre: "paciente  ficticio", telefono: "+34 600 000 001" }, lista).id, "b"); // el más reciente compatible
  assert.equal(consentimientoDe({ nombre: "Paciente Ficticio", telefono: "600000009" }, lista.slice(0, 1)), null); // otro teléfono: otra persona
  assert.equal(consentimientoDe({ nombre: "Otra Ficticia" }, lista), null);
  assert.equal(consentimientoDe({ nombre: "" }, lista), null);
});

test("texto: lleva los datos del responsable y nada de otro profesional", () => {
  const r = { nombre: "Profesional Ficticio", nif: "00000000T", direccion: "Calle Falsa 1, 07000 Palma", telefono: "600000000", email: "a@b.es", dpd: "" };
  const t = apartados(r).map((a) => a.texto).join(" ");
  assert.match(t, /Profesional Ficticio, CIF: 00000000T, Dir\. Postal: Calle Falsa 1/);
  assert.match(t, /o al email: a@b\.es/);
  assert.doesNotMatch(t, /Delegado de Protección/); // sin DPD, no sale
  assert.match(apartados({ ...r, dpd: "CONTACTO: x" })[1].texto, /Delegado de Protección de Datos: CONTACTO: x\./);
});

test("opciones: online solo con herramienta; tutores separados, informes solo por correo", () => {
  assert.deepEqual(opciones("paciente", "").map((o) => o.clave), ["informes"]);
  assert.deepEqual(opciones("paciente", "Herramienta X").map((o) => o.clave), ["online", "informes"]);
  assert.match(opciones("paciente", "")[0].texto, /correo electrónico y\/o WhatsApp\.$/);
  assert.match(opciones("separados", "")[0].texto, /correo electrónico\.$/);
});

test("configInicial: datos del consentimiento", () => {
  assert.equal(configInicial({}).consentimiento, undefined);
  assert.deepEqual(configInicial({ APP_CONSENTIMIENTO: "sí", APP_COLEGIADO: " B-1 " }).consentimiento,
    { activo: true, clave: "primera", colegiado: "B-1", dpd: "", herramienta: "" });
});
