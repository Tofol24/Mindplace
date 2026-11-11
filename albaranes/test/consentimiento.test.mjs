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

test("consentimientoDe: seguro solo si coincide NIF o teléfono; si se contradicen, es otra persona", () => {
  const lista = [
    { id: "a", paciente: { nombre: "Paciente Ficticio", telefono: "600000001", nif: "" }, firmadoEn: "2026-01-01T10:00:00Z" },
    { id: "b", paciente: { nombre: "Paciente Ficticio", telefono: "", nif: "11111111H" }, firmadoEn: "2026-03-01T10:00:00Z" },
    { id: "c", paciente: { nombre: "Solo Nombre", telefono: "", nif: "" }, firmadoEn: "2026-02-01T10:00:00Z", albaranId: "alb-1" },
  ];
  const de = (cl, alb) => { const m = consentimientoDe(cl, lista, alb); return m && `${m.c.id}${m.seguro ? "" : "?"}`; };
  assert.equal(de({ nombre: "paciente  ficticio", telefono: "+34 600 000 001" }), "a"); // teléfono: seguro
  assert.equal(de({ nombre: "Paciente Ficticio", nif: "11111111-h" }), "b"); // NIF: seguro
  assert.equal(de({ nombre: "Paciente Ficticio", telefono: "600000009", nif: "22222222J" }), null); // homónimo con otros datos
  assert.equal(de({ nombre: "Paciente Ficticio", nif: "22222222J" }), "a?"); // «a» no tiene NIF: hay que preguntar
  assert.equal(de({ nombre: "Paciente Ficticio" }), "b?"); // solo el nombre: hay que preguntar
  assert.equal(de({ nombre: "Solo Nombre" }), "c?");
  assert.equal(de({ nombre: "Solo Nombre" }, { id: "alb-1" }), "c"); // firmado desde este albarán
  assert.equal(de({ nombre: "Paciente Ficticio" }, { consentimientoId: "b" }), "b"); // vinculado a mano
  assert.equal(de({ nombre: "Otro" }, { consentimientoId: "a" }), null); // se cambió el paciente: ya no vale
  assert.equal(de({ nombre: "Solo Nombre", telefono: "600000005" }, { id: "alb-1" }), "c"); // sin contradicción, sigue
  assert.equal(de({ nombre: "Paciente Ficticio", telefono: "600000009" }, { consentimientoId: "a" }), "b?"); // «a» tiene otro teléfono: queda «b», por confirmar
  assert.equal(de({ nombre: "Otra Ficticia" }), null);
  assert.equal(de({ nombre: "" }), null);
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
