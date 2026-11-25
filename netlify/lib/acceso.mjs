/* APRENS · códigos de acceso para pacientes (lógica compartida por las funciones).
   ---------------------------------------------------------------------------
   Un código (p. ej. APR-7K2M-9QXD) da acceso al espacio APRENS hasta una fecha.
   Por ahora es VOLUNTARIO: sin código se sigue entrando igual. Más adelante
   servirá para cerrar el acceso y para la suscripción de otros profesionales.

   Qué se guarda (Netlify Blobs, almacén «acceso»):
     cod/<CÓDIGO>          { creado, caduca, origen: "auto" | "pro", pro?: huella, revocado? }
     pro/<huella>/<CÓDIGO> ""   (índice: los códigos que ha creado cada profesional)
   NADA del paciente: ni nombre, ni teléfono, ni IP. Las etiquetas que el
   psicólogo pone a cada código («Paciente martes») se quedan en su navegador.

   Cómo se crean:
     · auto  · botón «Solicitar mi código» de Mi espacio: 3 meses. Solo mientras
               dure la ventana de bienvenida (ACCESO_AUTO_HASTA, por defecto
               AUTO_HASTA_DEFECTO; "no" la cierra antes).
     · pro   · el psicólogo, con su código profesional (ACCESO_CODIGOS_PRO,
               lista separada por comas), elige 1, 2, 3, 6 o 12 meses.

   Variables de entorno (sitio aprens-app):
     ACCESO_CODIGOS_PRO   códigos profesionales separados por comas; cada uno con un límite opcional de
                          pacientes activos a la vez: "codigo-de-tofol-xxxx, codigo-de-otra-xxxx:40"
                          (sin «:n», sin límite). Los códigos ya dados siguen hasta su fecha aunque
                          el profesional se quite de la lista o deje de pagar.
     ACCESO_AUTO_HASTA    último día (YYYY-MM-DD, hora de Mallorca) del botón automático, o "no"
     ACCESO_ORIGENES      orígenes extra que pueden llamar a la API (coma), además de los de ORIGENES
*/
import { getStore } from "@netlify/blobs";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export const AUTO_HASTA_DEFECTO = "2026-12-09";
export const MESES_AUTO = 3;
export const MESES_VALIDOS = [1, 2, 3, 6, 12];
export const LIMITE_SUSCRIPCION = 40;   // pacientes activos a la vez del plan de 4 €/mes (fase 2)
export const ORIGENES = ["https://aprens.es", "https://www.aprens.es", "https://aprens-inicio.netlify.app", "https://aprens-app.netlify.app"];
// Sin 0/O, 1/I/L ni U: se dictan y se copian a mano sin confusiones.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const RE_CODIGO = /^APR-[2-9A-HJKMNP-TV-Z]{4}-[2-9A-HJKMNP-TV-Z]{4}$/;

export const env = (k, d = "") => {
  const v = globalThis.Netlify?.env?.get?.(k);
  return v ?? process.env[k] ?? d;
};
export const almacen = () => getStore({ name: "acceso", consistency: "strong" });

/** Día natural en Mallorca (YYYY-MM-DD). */
export function diaMadrid(fecha = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(fecha);
}

/** Último día del botón automático, o "" si está cerrado. */
export function autoHasta() {
  const v = String(env("ACCESO_AUTO_HASTA", AUTO_HASTA_DEFECTO)).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
}
export const autoAbierto = (fecha = new Date()) => { const h = autoHasta(); return !!h && diaMadrid(fecha) <= h; };

/** Normaliza lo que escribe la persona: mayúsculas, sin espacios, guiones en su sitio. */
export function normCodigo(c) {
  const s = String(c || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const cuerpo = s.length === 11 && s.startsWith("APR") ? s.slice(3) : s;
  if (cuerpo.length !== 8) return "";
  const out = "APR-" + cuerpo.slice(0, 4) + "-" + cuerpo.slice(4);
  return RE_CODIGO.test(out) ? out : "";
}

export function nuevoCodigo() {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return "APR-" + s.slice(0, 4) + "-" + s.slice(4);
}

/** Fecha de caducidad: el mismo día, `meses` después, al final del día (hora de Mallorca ≈ 23:59 UTC+1). */
export function sumarMeses(meses, desde = new Date()) {
  const [a, m, d] = diaMadrid(desde).split("-").map(Number);
  const fin = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimo = new Date(Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth() + 1, 0)).getUTCDate();
  const dia = Math.min(d, ultimo);
  return Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), dia, 22, 59, 59);
}

const sha = (s) => createHash("sha256").update(s).digest("hex");
export const huella = (codigoPro) => sha("aprens-acceso|" + codigoPro).slice(0, 24);

/** Si el código es uno de ACCESO_CODIGOS_PRO devuelve {huella, limite} (limite 0 = sin límite); si no, null. */
export function profesional(codigo) {
  const c = String(codigo || "").trim();
  if (c.length < 12 || c.length > 80) return null;
  const h = Buffer.from(sha(c));
  let limite = -1;
  for (const item of String(env("ACCESO_CODIGOS_PRO")).split(",")) {
    const m = item.trim().match(/^(.{12,80}?)(?::(\d{1,4}))?$/);
    if (!m) continue;
    const b = Buffer.from(sha(m[1]));
    if (b.length === h.length && timingSafeEqual(b, h)) limite = m[2] ? Number(m[2]) : 0;
  }
  return limite < 0 ? null : { huella: huella(c), limite };
}

/** Cuántos códigos de un profesional están en vigor ahora (ni caducados ni anulados). */
export const activos = (lista, ahora = Date.now()) => lista.filter((r) => !r.revocado && r.caduca >= ahora).length;

/** Crea y guarda un código nuevo. */
export async function crear({ meses, origen, pro }, st = almacen(), ahora = new Date()) {
  const rec = { creado: ahora.getTime(), caduca: sumarMeses(meses, ahora), origen, meses };
  if (pro) rec.pro = pro;
  for (let i = 0; i < 5; i++) {
    const codigo = nuevoCodigo();
    const w = await st.set("cod/" + codigo, JSON.stringify(rec), { onlyIfNew: true });
    if (w?.modified === false) continue;   // ya existía (muy improbable): otro
    if (pro) await st.set("pro/" + pro + "/" + codigo, "");
    return { codigo, caduca: rec.caduca, meses };
  }
  throw new Error("No se ha podido crear el código.");
}

export async function leer(codigo, st = almacen()) {
  const c = normCodigo(codigo);
  if (!c) return null;
  const t = await st.get("cod/" + c, { type: "text" });
  if (!t) return null;
  try { return { codigo: c, ...JSON.parse(t) }; } catch { return null; }
}

/** Estado público de un código: lo que puede saber quien lo escribe. */
export function estado(rec, ahora = Date.now()) {
  if (!rec) return { valido: false, motivo: "no_existe" };
  if (rec.revocado) return { valido: false, motivo: "revocado", codigo: rec.codigo };
  if (ahora > rec.caduca) return { valido: false, motivo: "caducado", codigo: rec.codigo, caduca: rec.caduca };
  return { valido: true, codigo: rec.codigo, caduca: rec.caduca };
}

export async function listarPro(pro, st = almacen()) {
  const { blobs } = await st.list({ prefix: "pro/" + pro + "/" });
  const codigos = blobs.map((b) => b.key.split("/").pop());
  const recs = await Promise.all(codigos.map((c) => leer(c, st)));
  return recs.filter(Boolean).map((r) => ({ codigo: r.codigo, creado: r.creado, caduca: r.caduca, meses: r.meses, revocado: !!r.revocado }))
    .sort((a, b) => b.creado - a.creado);
}

export async function revocar(pro, codigo, st = almacen()) {
  const rec = await leer(codigo, st);
  if (!rec || rec.pro !== pro) return false;
  const { codigo: c, ...resto } = rec;
  await st.set("cod/" + c, JSON.stringify({ ...resto, revocado: Date.now() }));
  return true;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function origenes() {
  return ORIGENES.concat(String(env("ACCESO_ORIGENES")).split(",").map((x) => x.trim()).filter((x) => /^https:\/\/[a-z0-9.-]+$/.test(x)));
}
export function cors(req) {
  const o = req.headers.get("origin");
  if (!o || !origenes().includes(o)) return {};
  return { "Access-Control-Allow-Origin": o, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type, x-codigo-pro", "Access-Control-Max-Age": "600", Vary: "Origin" };
}
export const json = (req, status, body) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...cors(req) }
});
export async function cuerpo(req) {
  const t = await req.text();
  if (t.length > 2000) return null;
  try { const o = JSON.parse(t || "{}"); return o && typeof o === "object" && !Array.isArray(o) ? o : null; } catch { return null; }
}
