// Pizarra del entrenador · suscripción mensual con Stripe (sitio propio, p. ej. pizarra.aprens.net).
// Adaptado de Explica-ho (estudi/web-pacients/netlify/lib/comu.js): mismo modelo, sin cuentas ni contraseñas.
//
//  · Quien paga recibe un CÓDIGO DE ACCESO (10 letras y números). Lo escribe en Ajustes y la pizarra lo manda
//    en la cabecera «x-codigo» al crear enlaces cortos o pedir sugerencias a Claude.
//  · Lo básico (cuaderno, pizarra, archivos) es gratis y no pasa por aquí.
//  · Solo se exige el código si PIZARRA_SUSCRIPCION=si (en aprens-app no se pone y todo sigue igual).
//
// Variables de entorno (Netlify → Site configuration → Environment variables):
//   PIZARRA_SUSCRIPCION      "si" para exigir el código en los extras
//   PIZARRA_PLANES           "Entrenador|price_123|100|4,99 € al mes"  (nombre|precio de Stripe|consultas a Claude al mes|texto del precio)
//   PIZARRA_TEXTOS_LEGALES   "revisados" cuando las condiciones y la privacidad ya no sean borradores (sin esto, no se abren altas)
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   RESEND_API_KEY + PIZARRA_EMAIL_FROM (y opcional PIZARRA_EMAIL_REPLY): correos con el código y enlaces de gestión
//   PIZARRA_STRIPE_PORTAL_LOGIN  https://billing.stripe.com/p/login/… (si no hay correos propios)
//   PIZARRA_CODIGOS          códigos dados a mano: "k7m2qpx4ab, r9tx4bm8cd:300" (código[:consultas a Claude al mes])
//   PIZARRA_SECRETO          clave para las huellas (si falta, se usa la del webhook)
//
// Almacenes de Netlify Blobs:
//   pizarra-subs   sub/<id>  code/<código>  tok/<token>  mail/<huella>
//   pizarra-us     contadores: ia/<huella>/mes/<AAAA-MM>, subir/<huella>/<AAAA-MM-DD>, rec/…, enlace/…; purga/<día>; pendientes

import { getStore } from "@netlify/blobs";

export const APP = "pizarra";
export const NOMBRE = "Pizarra del entrenador";
export const env = (k, d = "") => {
  const v = globalThis.Netlify?.env?.get?.(k);
  return v ?? process.env[k] ?? d;
};
export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers }
});
export const hoy = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);
export const mes = (ms = Date.now()) => hoy(ms).slice(0, 7);
const arr = (x) => Array.isArray(x) ? x : [];

export const almacen = (name) => getStore({ name, consistency: "strong" });
export const SUBS = "pizarra-subs", USO = "pizarra-us";

async function leerJSON(st, key) {
  const r = await st.getWithMetadata(key, { type: "text" });
  if (!r) return null;
  let etag = r.etag;
  if (!etag) { try { etag = (await st.getMetadata(key))?.etag; } catch { etag = undefined; } }
  try { return { data: JSON.parse(r.data), etag }; } catch { return { data: null, etag }; }
}
export async function getJSON(st, key) { return (await leerJSON(st, key))?.data ?? null; }
// Escritura condicional con reintentos: `fn` recibe el valor actual y devuelve el nuevo (o undefined para no tocar nada).
export async function updateJSON(st, key, fn) {
  for (let i = 0; i < 8; i++) {
    const cur = await leerJSON(st, key);
    const next = fn(cur?.data ?? null);
    if (next === undefined) return cur?.data ?? null;
    const opts = !cur ? { onlyIfNew: true } : cur.etag ? { onlyIfMatch: cur.etag } : {};   // sin ETag (servidor local de pruebas): sin condición
    const w = await st.set(key, JSON.stringify(next), opts);
    if (w?.modified) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 100));
  }
  throw new Error("No se ha podido guardar (demasiados cambios a la vez).");
}
// Contador con tope: suma 1 si no se ha llegado al tope. 0 = sin tope.
export async function contar(st, key, tope) {
  let ok = false, usados = 0;
  await updateJSON(st, key, (cur) => {
    const n = Number(cur?.n) || 0;
    if (tope > 0 && n >= tope) { ok = false; usados = n; return undefined; }
    ok = true; usados = n + 1; return { n: n + 1 };
  });
  return { ok, usados };
}
export async function descontar(st, key) {
  try { await updateJSON(st, key, (cur) => (Number(cur?.n) || 0) > 0 ? { n: cur.n - 1 } : undefined); } catch { /* nada */ }
}
const aLimite = (v, def) => /^\s*\d+\s*$/.test(v ?? "") ? parseInt(v, 10) : def;

// ---------------------------------------------------------------- planes y configuración
export function planes() {
  return String(env("PIZARRA_PLANES")).split(";").map((p) => p.split("|").map((x) => x.trim()))
    .filter(([nom, price, ia]) => nom && /^price_[A-Za-z0-9]+$/.test(price || "") && /^\d+$/.test(ia || ""))
    .map(([nom, price, ia, precio]) => ({ nom, price, ia: parseInt(ia, 10), precio: precio || "" }));
}
export const IA_POR_DEFECTO = 100;
export const SUBIDAS_DIA = 200;   // enlaces cortos por código y día (contra abusos; un entrenador usa unos pocos)
export const obligatoria = () => env("PIZARRA_SUSCRIPCION") === "si";
export const portalLogin = () => { const u = String(env("PIZARRA_STRIPE_PORTAL_LOGIN")).trim(); return /^https:\/\/billing\.stripe\.com\/p\/login\/[A-Za-z0-9_]+$/.test(u) ? u : ""; };
export const correoActivo = () => !!env("RESEND_API_KEY") && !!env("PIZARRA_EMAIL_FROM");
// Las altas solo se abren con Stripe completo, planes, textos legales revisados y alguna forma de gestionar la suscripción.
export const altasAbiertas = () => !!env("STRIPE_SECRET_KEY") && !!env("STRIPE_WEBHOOK_SECRET") && planes().length > 0
  && env("PIZARRA_TEXTOS_LEGALES") === "revisados" && (correoActivo() || !!portalLogin());

// Códigos dados a mano: "k7m2qpx4ab, r9tx4bm8cd:300". Mínimo 8 caracteres, para que no se puedan adivinar.
export function codigosManuales() {
  const m = new Map();
  for (const parte of String(env("PIZARRA_CODIGOS")).split(/[,\n]/)) {
    const [c, ia] = parte.trim().toLowerCase().split(":");
    if (/^[a-z0-9_-]{8,40}$/.test(c || "")) m.set(c, { ia: aLimite(ia, IA_POR_DEFECTO) });
  }
  return m;
}
export const normCodigo = (c) => String(c || "").trim().toLowerCase();
export const codigoBienFormado = (c) => /^[a-z0-9_-]{8,40}$/.test(c);

// ---------------------------------------------------------------- Stripe (sin bibliotecas)
export async function stripe(path, { method = "GET", form } = {}) {
  const r = await fetch("https://api.stripe.com/v1/" + path, {
    method,
    headers: { authorization: "Bearer " + env("STRIPE_SECRET_KEY"), ...(form ? { "content-type": "application/x-www-form-urlencoded" } : {}) },
    body: form ? new URLSearchParams(form).toString() : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || "Stripe ha respondido " + r.status);
  return j;
}
export function nuevoCodigo() {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789", b = new Uint8Array(10);   // sin l, o, 0, 1 (se confunden)
  crypto.getRandomValues(b);
  return Array.from(b, (x) => abc[x % abc.length]).join("");
}
// Según la versión de la API de Stripe, el final del periodo está en la suscripción o en su primer elemento.
export function subInfo(sub) {
  const it = sub?.items?.data?.[0];
  return {
    id: sub.id, customer: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    status: sub.status, price: it?.price?.id || "", periodEnd: Number(sub.current_period_end ?? it?.current_period_end ?? 0),
    endedAt: Number(sub.ended_at || 0) * 1000
  };
}
export const esNuestra = (sub) => sub?.metadata?.app === APP || planes().some((p) => p.price === subInfo(sub).price);
// Activa, de prueba, o con un pago pendiente: 3 días de margen desde el primer impago.
export function subActiva(rec, ahora = Date.now() / 1000) {
  if (!rec) return false;
  if (rec.status === "active" || rec.status === "trialing") return true;
  if (rec.status === "past_due") return ahora < (rec.pastDueSince || ahora) + 3 * 86400;
  return false;
}
export const ACABADAS = ["canceled", "incomplete_expired"];
export const GUARDAR_ACABADAS_MS = 365 * 86400 * 1000;
export async function guardarSub(st, info) {
  return updateJSON(st, "sub/" + info.id, (cur) => {
    const pastDueSince = info.status === "past_due" ? (cur?.pastDueSince || Math.floor(Date.now() / 1000)) : 0;
    const endedAt = ACABADAS.includes(info.status) ? (cur?.endedAt || info.endedAt || Date.now()) : 0;
    if (!cur && endedAt && Date.now() - endedAt > GUARDAR_ACABADAS_MS) return undefined;   // acabada hace más de 12 meses: no se recrea
    return { ...(cur || {}), ...info, pastDueSince, endedAt, updated: Date.now() };
  });
}
// Da un código a la suscripción una sola vez, aunque lleguen dos peticiones a la vez.
export async function asegurarCodigo(st, subId) {
  const sub0 = await getJSON(st, "sub/" + subId);
  if (!sub0) throw new Error("Suscripción desconocida.");
  if (sub0.code) return sub0.code;
  for (let i = 0; i < 5; i++) {
    const code = nuevoCodigo();
    if (codigosManuales().has(code)) continue;
    const w = await st.set("code/" + code, JSON.stringify({ sub: subId }), { onlyIfNew: true });
    if (!w?.modified) continue;
    const rec = await updateJSON(st, "sub/" + subId, (cur) => !cur || cur.code ? undefined : { ...cur, code });
    if (rec?.code === code) return code;
    await st.delete("code/" + code);
    if (!rec?.code) throw new Error("Suscripción desconocida.");
    return rec.code;
  }
  throw new Error("No se ha podido crear el código.");
}
// El código sale en las facturas que Stripe envía por correo: así no se pierde.
export async function codigoEnFacturas(customer, code) {
  if (!customer || !code) return;
  const NOMBRE_CAMPO = "Código de la Pizarra";
  const cur = (await stripe("customers/" + customer))?.invoice_settings?.custom_fields || [];
  if (cur.some((f) => f.name === NOMBRE_CAMPO && f.value === code)) return;
  const campos = [...cur.filter((f) => f.name !== NOMBRE_CAMPO), { name: NOMBRE_CAMPO, value: code }].slice(-4);
  const form = {};
  campos.forEach((f, i) => { form[`invoice_settings[custom_fields][${i}][name]`] = f.name; form[`invoice_settings[custom_fields][${i}][value]`] = f.value; });
  await stripe("customers/" + customer, { method: "POST", form });
}
export async function subDeCodigo(st, code) {
  const c = await getJSON(st, "code/" + code);
  return c?.sub ? getJSON(st, "sub/" + c.sub) : null;
}

// ¿Este código da acceso a los extras? → { codigo, huella, plan, ia (consultas al mes; 0 = sin tope) } o null.
export async function acceso(codigoBruto) {
  const codigo = normCodigo(codigoBruto);
  if (!codigoBienFormado(codigo)) return null;
  const manual = codigosManuales().get(codigo);
  if (manual) return { codigo, huella: await huella("c:" + codigo), plan: "Código de APRENS", ia: manual.ia, manual: true };
  const sub = await subDeCodigo(almacen(SUBS), codigo);
  if (!subActiva(sub)) return null;
  const plan = planes().find((p) => p.price === sub.price);
  return { codigo, huella: await huella("c:" + codigo), plan: plan?.nom || "Entrenador", ia: plan ? plan.ia : IA_POR_DEFECTO, finPeriodo: sub.periodEnd || 0 };
}
export const claveIA = (h, ms = Date.now()) => "ia/" + h + "/mes/" + mes(ms);
export const claveSubida = (h, ms = Date.now()) => "subir/" + h + "/" + hoy(ms);

// ---------------------------------------------------------------- correos (Resend, opcional)
export async function enviarCorreo({ to, subject, html, text }) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + env("RESEND_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({ from: env("PIZARRA_EMAIL_FROM"), to: [to], subject, html, text, ...(env("PIZARRA_EMAIL_REPLY") ? { reply_to: env("PIZARRA_EMAIL_REPLY") } : {}) })
  });
  if (!r.ok) throw new Error("Resend ha respondido " + r.status);
}
export const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export function ocultarCorreo(e) { const [u, d] = String(e).split("@"); return d ? u.slice(0, 1) + "***@" + d : ""; }
export function token() { const b = new Uint8Array(24); crypto.getRandomValues(b); return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export async function correoCliente(customer) { return customer ? String((await stripe("customers/" + customer))?.email || "").trim() : ""; }
export const RE_CORREO = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export function cuerpoCorreo(parrafos, enlace) {
  const text = parrafos.map((p) => p.replace(/^CODIGO:/, "")).join("\n\n") + (enlace ? "\n\n" + enlace.label + ": " + enlace.url : "") + "\n\n" + NOMBRE + " · APRENS";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#14281D;max-width:560px">
${parrafos.map((p) => `<p style="margin:0 0 14px">${p.startsWith("CODIGO:") ? `<span style="display:inline-block;font-family:monospace;font-size:26px;letter-spacing:3px;background:#EEF5F0;border:2px dashed #15803A;border-radius:10px;padding:10px 16px">${escHtml(p.slice(7))}</span>` : /^https:\/\/\S+$/.test(p) ? `<a href="${escHtml(p)}">${escHtml(p)}</a>` : escHtml(p)}</p>`).join("\n")}
${enlace ? `<p style="margin:18px 0"><a href="${escHtml(enlace.url)}" style="background:#15803A;color:#fff;text-decoration:none;padding:11px 18px;border-radius:999px;font-weight:bold">${escHtml(enlace.label)}</a></p>` : ""}
<p style="margin:24px 0 0;color:#55645A;font-size:13px">${NOMBRE} · APRENS</p></div>`;
  return { text, html };
}

// Envía el código al correo de quien paga, una sola vez por suscripción. → "enviado" | "ya" | "no" | "error"
export async function enviarCodigo(st, subId, origen) {
  if (!correoActivo()) return "no";
  let reservado = false, ya = false;
  const ahora = Date.now();
  const rec = await updateJSON(st, "sub/" + subId, (cur) => {
    reservado = false; ya = !!cur?.mailed;
    if (!cur?.code || cur.mailed || (cur.mailing && ahora - cur.mailing < 10 * 60 * 1000)) return undefined;
    reservado = true; return { ...cur, mailing: ahora };
  });
  if (!reservado) return ya ? "ya" : "no";
  const soltar = (hecho) => updateJSON(st, "sub/" + subId, (cur) => cur?.mailing === ahora ? { ...cur, mailing: 0, ...(hecho ? { mailed: Date.now() } : {}) } : undefined).catch(() => {});
  try {
    const to = await correoCliente(rec.customer);
    if (!to) { await soltar(false); return "no"; }
    await indexarCorreo(st, to, rec.customer);
    const { text, html } = cuerpoCorreo([
      "Gracias por suscribirte a la Pizarra del entrenador. Este es tu código de acceso:",
      "CODIGO:" + rec.code,
      "Abre la pizarra, ve a Ajustes → Tu suscripción y escribe el código. Sirve en cualquier móvil u ordenador.",
      "Guarda este correo. Si algún día pierdes el código, puedes volver a pedirlo en «He perdido el código»."
    ], { label: "Abrir la pizarra", url: origen + "/pizarra/" });
    await enviarCorreo({ to, subject: "Tu código de la Pizarra del entrenador", html, text });
    await soltar(true);
    return "enviado";
  } catch {
    await soltar(false);
    return "error";
  }
}
export async function indexarCorreo(st, email, customer) {
  const key = "mail/" + await huella("e:" + String(email).trim().toLowerCase());
  await updateJSON(st, key, (cur) => arr(cur?.c).includes(customer) ? undefined : { c: [...arr(cur?.c), customer].slice(-10) });
}
export async function limpiar(st, prefix, esViejo) {
  try {
    const { blobs } = await st.list({ prefix });
    for (const b of blobs.slice(0, 1000)) if (await esViejo(b.key)) await st.delete(b.key);
  } catch { /* nada */ }
}

// ---------------------------------------------------------------- limpieza diaria (lo que promete la política de privacidad)
// - Contadores de un día: desde el día siguiente. Contadores mensuales: al acabar el mes.
// - Enlaces de gestión caducados.
// - Suscripciones acabadas hace más de 12 meses: registro, código y huellas de correo que ya no llevan a nada.
export async function purgar(ahora = Date.now()) {
  const dia = hoy(ahora), m = mes(ahora), marca = "purga/" + dia;
  const us = almacen(USO);
  let mia = false, cursor = "";
  await updateJSON(us, marca, (cur) => {
    mia = false;
    if (cur?.done || (cur?.start && ahora - cur.start < 15 * 60 * 1000)) return undefined;
    mia = true; cursor = cur?.cursor || ""; return { start: ahora, cursor };
  });
  if (!mia) return false;
  const t0 = Date.now(), tarde = () => { if (Date.now() - t0 > 20_000) throw new Error("tiempo"); };
  try {
    const { blobs: ub } = await us.list();
    for (const { key } of ub) {
      if (key.startsWith("purga/")) { if (key.slice(6) < dia) { tarde(); await us.delete(key); } continue; }
      const d = key.match(/\/(\d{4}-\d{2}-\d{2})$/), mm = key.match(/\/mes\/(\d{4}-\d{2})$/);
      if ((d && d[1] < dia) || (mm && mm[1] < m)) { tarde(); await us.delete(key); }
    }
    const st = almacen(SUBS);
    const { blobs: sb } = await st.list();
    for (const key of sb.map((b) => b.key).filter((k) => k.startsWith("tok/"))) {
      tarde();
      if (((await getJSON(st, key))?.exp || 0) < ahora) await st.delete(key);
    }
    for (const key of sb.map((b) => b.key).filter((k) => k.startsWith("sub/") && k > cursor).sort()) {
      tarde();
      const rec = await getJSON(st, key);
      const acabada = rec && (rec.endedAt || (ACABADAS.includes(rec.status) ? Number(rec.updated) || ahora : 0));
      if (acabada && ahora - acabada > GUARDAR_ACABADAS_MS) {
        if (rec.customer) await updateJSON(us, "pendientes", (cur) => arr(cur?.c).includes(rec.customer) ? undefined : { c: [...arr(cur?.c), rec.customer] });
        if (rec.code) await st.delete("code/" + rec.code);
        await st.delete(key);
      }
      cursor = key;
    }
    const mails = sb.map((b) => b.key).filter((k) => k.startsWith("mail/"));
    for (const c of arr((await getJSON(us, "pendientes"))?.c)) {
      tarde();
      const subs = (await stripe("subscriptions?status=all&limit=100&customer=" + encodeURIComponent(c))).data || [];
      const guardar = subs.some((x) => { const i = subInfo(x); return esNuestra(x) && !(ACABADAS.includes(i.status) && ahora - (i.endedAt || ahora) > GUARDAR_ACABADAS_MS); });
      if (!guardar) for (const key of mails) {
        const r = await updateJSON(st, key, (cur) => arr(cur?.c).includes(c) ? { c: arr(cur.c).filter((x) => x !== c) } : undefined);
        if (r && !arr(r.c).length && !arr((await getJSON(st, key))?.c).length) await st.delete(key);
      }
      await updateJSON(us, "pendientes", (cur) => arr(cur?.c).includes(c) ? { c: arr(cur.c).filter((x) => x !== c) } : undefined);
    }
    await us.set(marca, JSON.stringify({ start: ahora, cursor, done: Date.now() }));
    return true;
  } catch (e) {
    await us.set(marca, JSON.stringify({ cursor })).catch(() => {});
    throw e;
  }
}

// Huella (HMAC) para contar sin guardar el código, el correo ni la IP en claro.
export async function huella(valor) {
  const secreto = env("PIZARRA_SECRETO") || env("STRIPE_WEBHOOK_SECRET") || env("RESEND_API_KEY") || env("ANTHROPIC_API_KEY") || "pizarra";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(String(valor))));
  return Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Firma de los avisos de Stripe (cabecera Stripe-Signature: t=…,v1=…), con 5 minutos de margen.
export async function verificarFirma(payload, cabecera, secreto, ahora = Date.now() / 1000) {
  let t = 0; const v1 = [];
  for (const kv of String(cabecera || "").split(",")) {
    const [k, v] = kv.split("=");
    if (k === "t") t = parseInt(v, 10);
    else if (k === "v1" && v) v1.push(v);
  }
  if (!t || !v1.length || Math.abs(ahora - t) > 300) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const esperado = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(t + "." + payload))), (b) => b.toString(16).padStart(2, "0")).join("");
  return v1.some((v) => {
    if (v.length !== esperado.length) return false;
    let d = 0; for (let i = 0; i < v.length; i++) d |= v.charCodeAt(i) ^ esperado.charCodeAt(i);
    return d === 0;
  });
}
