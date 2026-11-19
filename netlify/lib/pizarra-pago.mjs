// Pizarra del entrenador · funciones de la suscripción (las publica el sitio pizarra-web/).
// Cada función de pizarra-web/netlify/functions/ importa de aquí su manejador y declara su ruta.
import {
  APP, NOMBRE, env, json, almacen, SUBS, USO, getJSON, updateJSON, contar, planes, obligatoria, portalLogin, correoActivo,
  altasAbiertas, stripe, subInfo, esNuestra, subActiva, guardarSub, asegurarCodigo, codigoEnFacturas, subDeCodigo, acceso, claveIA,
  enviarCorreo, escHtml, ocultarCorreo, token, correoCliente, RE_CORREO, cuerpoCorreo, enviarCodigo, indexarCorreo, limpiar,
  purgar, huella, verificarFirma, hoy, normCodigo, codigoBienFormado
} from "./pizarra-subs.mjs";

const lanzarPurga = (context) => {
  const job = purgar().catch(() => {});
  if (typeof context?.waitUntil === "function") context.waitUntil(job);
};

// GET /api/pizarra-config  (cabecera opcional x-codigo)
// Qué puede mostrar la pizarra: si hay suscripción, los planes y, si se manda un código, si está activo.
export async function config(req) {
  const out = {
    suscripcion: obligatoria(),
    altas: altasAbiertas(),
    correo: !!env("STRIPE_SECRET_KEY") && correoActivo(),
    portalLogin: portalLogin(),
    planes: altasAbiertas() ? planes().map(({ nom, ia, precio }) => ({ nom, ia, precio })) : [],
    precios: altasAbiertas() ? planes().map((p) => p.price) : []
  };
  const cod = req.headers.get("x-codigo");
  if (cod) {
    try {
      const a = await acceso(cod);
      if (!a) out.acceso = { activa: false };
      else {
        const usadas = Number((await getJSON(almacen(USO), claveIA(a.huella)))?.n) || 0;
        out.acceso = { activa: true, plan: a.plan, manual: !!a.manual, ia: { usadas, limite: a.ia }, finPeriodo: a.finPeriodo || 0 };
      }
    } catch { out.acceso = { activa: false, error: "servicio" }; }
  }
  return json(200, out);
}

// POST /api/pizarra-checkout  {precio, email?, acepto:true, inicio:true}
export async function checkout(req) {
  if (req.method !== "POST") return json(405, { error: "metodo" });
  if (!altasAbiertas()) return json(404, { error: "sin_altas" });
  let body; try { body = await req.json(); } catch { return json(400, { error: "formato" }); }
  const plan = planes().find((p) => p.price === body?.precio);
  if (!plan) return json(400, { error: "plan" });
  if (body?.acepto !== true || body?.inicio !== true) return json(400, { error: "consentimiento" });
  const email = String(body?.email || "").trim();
  if (email && !RE_CORREO.test(email)) return json(400, { error: "email" });
  const origen = new URL(req.url).origin;
  const form = {
    mode: "subscription",
    "line_items[0][price]": plan.price, "line_items[0][quantity]": "1",
    success_url: origen + "/gracias.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: origen + "/suscribirse.html",
    allow_promotion_codes: "true",
    locale: "es",
    "metadata[app]": APP, "subscription_data[metadata][app]": APP,
    "metadata[consentimiento]": "condiciones+privacidad " + new Date().toISOString(),
    "metadata[inicio_inmediato]": "solicitado; desistimiento con descuento proporcional"
  };
  if (email) form.customer_email = email;
  try {
    const s = await stripe("checkout/sessions", { method: "POST", form });
    return json(200, { url: s.url });
  } catch {
    return json(502, { error: "stripe" });
  }
}

// GET /api/pizarra-codigo?session_id=cs_…  Después de pagar: devuelve el código (lo crea si el aviso de Stripe aún no ha llegado).
export async function codigo(req) {
  if (!env("STRIPE_SECRET_KEY")) return json(404, { error: "sin_suscripciones" });
  const id = new URL(req.url).searchParams.get("session_id") || "";
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(id)) return json(400, { error: "sesion" });
  try {
    const s = await stripe("checkout/sessions/" + id + "?expand[]=subscription");
    if (s.metadata?.app !== APP) return json(404, { error: "sesion" });
    if (s.status !== "complete" || !["paid", "no_payment_required"].includes(s.payment_status) || !s.subscription) return json(409, { error: "pendiente" });
    const sub = typeof s.subscription === "string" ? await stripe("subscriptions/" + s.subscription) : s.subscription;
    const info = subInfo(sub);
    const st = almacen(SUBS);
    if (!(await guardarSub(st, info))) return json(410, { error: "caducada" });
    const code = await asegurarCodigo(st, info.id);
    try { await codigoEnFacturas(info.customer, code); } catch { /* el código ya se muestra en pantalla */ }
    let correo = "no";
    try { correo = await enviarCodigo(st, info.id, new URL(req.url).origin); } catch { /* nada */ }
    const plan = planes().find((p) => p.price === info.price);
    return json(200, { codigo: code, plan: plan?.nom || "", ia: plan?.ia || 0, correo: correo === "enviado" || correo === "ya" });
  } catch {
    return json(502, { error: "stripe" });
  }
}

// POST /api/pizarra-stripe  Avisos de Stripe (altas, cambios, impagos y bajas). Solo con firma válida y reciente.
export async function webhook(req, context) {
  if (req.method !== "POST") return json(405, { error: "metodo" });
  const secreto = env("STRIPE_WEBHOOK_SECRET");
  if (!secreto) return json(500, { error: "config" });
  const payload = await req.text();
  if (!(await verificarFirma(payload, req.headers.get("stripe-signature"), secreto))) return json(400, { error: "firma" });
  let ev; try { ev = JSON.parse(payload); } catch { return json(400, { error: "formato" }); }
  lanzarPurga(context);
  const obj = ev?.data?.object || {};
  try {
    const st = almacen(SUBS);
    if (ev.type === "checkout.session.completed" && obj.mode === "subscription" && obj.subscription && obj.metadata?.app === APP) {
      const info = subInfo(await stripe("subscriptions/" + (typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id)));
      if (!(await guardarSub(st, info))) return json(200, { ok: true });
      const code = await asegurarCodigo(st, info.id);
      await codigoEnFacturas(info.customer, code);
      // Si el correo falla, se responde con error para que Stripe repita el aviso (el código no se duplica).
      if ((await enviarCodigo(st, info.id, new URL(req.url).origin)) === "error") return json(500, { error: "correo" });
    } else if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(ev.type) && esNuestra(obj)) {
      // Stripe no garantiza el orden de los avisos: se guarda el estado que tiene AHORA la suscripción.
      await guardarSub(st, subInfo(await stripe("subscriptions/" + obj.id)));
    }
  } catch {
    return json(500, { error: "interno" });   // Stripe lo volverá a intentar
  }
  return json(200, { ok: true });
}

// POST /api/pizarra-portal-enlace  {codigo}  Envía al correo de quien paga un enlace de un solo uso al portal de Stripe.
export async function portalEnlace(req) {
  if (req.method !== "POST") return json(405, { error: "metodo" });
  if (!env("STRIPE_SECRET_KEY") || !correoActivo()) return json(404, { error: "sin_correo" });
  let body; try { body = await req.json(); } catch { return json(400, { error: "formato" }); }
  const code = normCodigo(body?.codigo);
  if (!codigoBienFormado(code)) return json(404, { error: "codigo" });
  try {
    const st = almacen(SUBS), us = almacen(USO);
    const sub = await subDeCodigo(st, code);
    if (!sub?.customer) return json(404, { error: "codigo" });
    if (!(await contar(us, "enlace/" + await huella("c:" + code) + "/" + hoy(), 5)).ok) return json(429, { error: "muchos" });
    const to = await correoCliente(sub.customer);
    if (!to) return json(404, { error: "sin_correo" });
    const t = token();
    await st.set("tok/" + t, JSON.stringify({ sub: sub.id, exp: Date.now() + 30 * 60 * 1000 }), { onlyIfNew: true });
    const { text, html } = cuerpoCorreo([
      "Alguien ha pedido gestionar la suscripción a la Pizarra del entrenador (cambiar la tarjeta, ver las facturas o darse de baja).",
      "El enlace sirve una sola vez y caduca en 30 minutos. Si no lo has pedido tú, ignora este correo: no cambiará nada."
    ], { label: "Gestionar la suscripción", url: new URL(req.url).origin + "/api/pizarra-portal-abre?t=" + t });
    await enviarCorreo({ to, subject: "Enlace para gestionar tu suscripción a la Pizarra", html, text });
    await limpiar(st, "tok/", async (k) => ((await getJSON(st, k))?.exp || 0) < Date.now());
    return json(200, { ok: true, a: ocultarCorreo(to) });
  } catch {
    return json(502, { error: "envio" });
  }
}

// GET/POST /api/pizarra-portal-abre?t=…  Abrir el enlace (GET) no lo gasta: algunos correos lo visitan para
// previsualizarlo. Se gasta al pulsar el botón (POST), y entonces se abre el portal de Stripe.
const pagina = (inner, status = 200) => new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${NOMBRE}</title><link rel="stylesheet" href="/suscripcion.css"></head><body><main><p class="marca"><a href="/pizarra/">⚽ ${NOMBRE}</a></p><div class="panel">${inner}</div></main></body></html>`,
  { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" } });
const TX = {
  mal: "El enlace no es válido.",
  usado: "El enlace ha caducado o ya se ha usado. Pide otro desde la pizarra, en Ajustes → Tu suscripción.",
  nosub: "No se ha encontrado la suscripción.",
  stripe: "Ahora mismo no se puede abrir el portal. Vuelve a intentarlo dentro de un rato con el mismo enlace.",
  error: "Ha habido un problema. Vuelve a intentarlo dentro de un rato."
};
const fallo = (k) => pagina(`<h1>No se ha podido abrir</h1><p>${TX[k]}</p><p><a class="btn" href="/pizarra/">Volver a la pizarra</a></p>`, 400);
export async function portalAbre(req) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(t)) return fallo("mal");
  if (req.method !== "POST") return pagina(`<h1>Gestionar la suscripción</h1><p>Pulsa el botón para abrir el portal de Stripe. Allí puedes cambiar la tarjeta, ver las facturas o darte de baja.</p><form method="post"><button class="btn" type="submit">Abrir el portal</button></form>`);
  try {
    const st = almacen(SUBS);
    let mio = false;
    const rec = await updateJSON(st, "tok/" + t, (cur) => { mio = false; return cur && !cur.used ? (mio = true, { ...cur, used: Date.now() }) : undefined; });
    if (!mio || !rec || rec.exp < Date.now()) return fallo("usado");
    const customer = rec.customer || (await getJSON(st, "sub/" + rec.sub))?.customer;
    if (!customer) return fallo("nosub");
    try {
      const s = await stripe("billing_portal/sessions", { method: "POST", form: { customer, return_url: new URL(req.url).origin + "/pizarra/", locale: "es" } });
      await st.delete("tok/" + t).catch(() => {});
      return Response.redirect(s.url, 303);
    } catch {
      await updateJSON(st, "tok/" + t, (cur) => cur?.used ? { ...cur, used: 0 } : undefined).catch(() => {});
      return fallo("stripe");
    }
  } catch {
    return fallo("error");
  }
}

// POST /api/pizarra-recuperar  {email}  «He perdido el código»: envía los códigos activos al correo de quien paga.
// Responde siempre lo mismo, haya o no suscripción, para que nadie pueda saber quién está suscrito.
const MISMO = { ok: true, mensaje: "Si hay alguna suscripción con este correo, te acabamos de enviar el código y un enlace para gestionarla. Mira también la carpeta de correo no deseado." };
export async function recuperar(req, context) {
  if (req.method !== "POST") return json(405, { error: "metodo" });
  if (!env("STRIPE_SECRET_KEY") || !correoActivo()) return json(404, { error: "sin_correo" });
  let body; try { body = await req.json(); } catch { return json(400, { error: "formato" }); }
  const email = String(body?.email || "").trim();
  if (!RE_CORREO.test(email)) return json(400, { error: "email" });
  const dia = hoy();
  try {
    const us = almacen(USO);
    const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "?";
    if (!(await contar(us, "rec/ip/" + await huella("ip:" + ip) + "/" + dia, 10)).ok) return json(429, { error: "muchos" });
    if (!(await contar(us, "rec/e/" + await huella("e:" + email.toLowerCase()) + "/" + dia, 3)).ok) return json(429, { error: "muchos" });
  } catch { return json(503, { error: "servicio" }); }
  // Se responde enseguida y el trabajo se hace después: el tiempo de respuesta no delata si hay suscripción.
  const job = (async () => {
    try {
      const st = almacen(SUBS);
      const ids = new Set((await getJSON(st, "mail/" + await huella("e:" + email.toLowerCase())))?.c || []);
      for (const v of new Set([email, email.toLowerCase()])) for (const c of (await stripe("customers?limit=10&email=" + encodeURIComponent(v))).data || []) ids.add(c.id);
      const porCorreo = new Map();
      for (const id of ids) {
        const c = await stripe("customers/" + id);
        if (String(c?.email || "").trim().toLowerCase() !== email.toLowerCase()) continue;
        const e = porCorreo.get(c.email) || { codes: [], customers: [] };
        for (const s of (await stripe("subscriptions?status=all&limit=20&customer=" + c.id)).data || []) {
          if (!esNuestra(s)) continue;
          const info = subInfo(s);
          await guardarSub(st, info);
          if (!e.customers.includes(c.id)) e.customers.push(c.id);
          if (subActiva((await getJSON(st, "sub/" + info.id)) || info)) e.codes.push(await asegurarCodigo(st, info.id));
        }
        if (e.customers.length) porCorreo.set(c.email, e);
      }
      const origen = new URL(req.url).origin;
      for (const [to, { codes, customers }] of porCorreo) {
        await indexarCorreo(st, to, customers[0]);
        const enlaces = [];
        for (const customer of customers.slice(0, 5)) {
          const t = token();
          await st.set("tok/" + t, JSON.stringify({ customer, exp: Date.now() + 30 * 60 * 1000 }), { onlyIfNew: true });
          enlaces.push(origen + "/api/pizarra-portal-abre?t=" + t);
        }
        const { text, html } = cuerpoCorreo([
          ...(codes.length
            ? [codes.length > 1 ? "Estos son los códigos de tus suscripciones a la Pizarra del entrenador:" : "Este es el código de tu suscripción a la Pizarra del entrenador:", ...codes.map((c) => "CODIGO:" + c), "Escríbelo en la pizarra, en Ajustes → Tu suscripción."]
            : ["Ahora mismo no tienes ninguna suscripción activa a la Pizarra del entrenador, así que no hay ningún código que funcione."]),
          enlaces.length > 1
            ? "Para ver las facturas, cambiar la tarjeta, reactivarla o darte de baja, usa estos enlaces (uno por cada cuenta de pago). Cada uno sirve una sola vez y caduca en 30 minutos:"
            : "Para ver las facturas, cambiar la tarjeta, reactivarla o darte de baja, usa el enlace de abajo. Sirve una sola vez y caduca en 30 minutos.",
          ...(enlaces.length > 1 ? enlaces.slice(1) : []),
          "Si no has pedido este correo, puedes ignorarlo."
        ], { label: "Gestionar la suscripción", url: enlaces[0] });
        await enviarCorreo({ to, subject: codes.length ? "Tu código de la Pizarra del entrenador" : "Tu suscripción a la Pizarra del entrenador", html, text });
      }
    } catch { /* nada: la respuesta es siempre la misma */ }
  })();
  if (typeof context?.waitUntil === "function") context.waitUntil(job); else await job;
  return json(200, MISMO);
}

// Limpieza programada (cada día).
export async function purgaProgramada() {
  try { await purgar(); return new Response("ok"); }
  catch (e) { console.error("purga: " + String(e?.message || e)); return new Response("error", { status: 500 }); }
}

export { escHtml };
