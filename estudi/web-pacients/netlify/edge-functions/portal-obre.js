// Explica-ho · obre el portal de Stripe des de l'enllaç del correu (un sol ús, 30 minuts).
import {store, getJSON, updateJSON, stripe} from "../lib/comu.js";

// Textos en català i castellà (l'enllaç del correu porta &l=es si es va demanar en castellà).
const TX = {
  ca: {fail: "No s'ha pogut obrir", back: "Torna a Explica-ho", bad: "L'enllaç no és vàlid.", title: "Gestiona la subscripció", intro: "Prem el botó per obrir el portal de Stripe, on pots canviar la targeta, veure les factures o donar-te de baixa.", open: "Obre el portal",
    used: "L'enllaç ha caducat o ja s'ha fet servir. Demana'n un altre des d'Explica-ho, a Configuració.", nosub: "No s'ha trobat la subscripció.", stripe: "Ara mateix no es pot obrir el portal. Torna-ho a provar d'aquí a una estona amb el mateix enllaç.", err: "Hi ha hagut un problema. Torna-ho a provar d'aquí a una estona."},
  es: {fail: "No se ha podido abrir", back: "Vuelve a Explica-ho", bad: "El enlace no es válido.", title: "Gestiona la suscripción", intro: "Pulsa el botón para abrir el portal de Stripe, donde puedes cambiar la tarjeta, ver las facturas o darte de baja.", open: "Abre el portal",
    used: "El enlace ha caducado o ya se ha usado. Pide otro desde Explica-ho, en Configuración.", nosub: "No se ha encontrado la suscripción.", stripe: "Ahora mismo no se puede abrir el portal. Vuelve a intentarlo dentro de un rato con el mismo enlace.", err: "Ha habido un problema. Vuelve a intentarlo dentro de un rato."},
};
const shell = (l, inner, status = 200) => new Response(`<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Explica-ho</title><link rel="stylesheet" href="/_base.css"></head><body><main><a class="brand" href="/"><span>Explica</span>-ho</a><div class="panel">${inner}</div></main></body></html>`,
  {status, headers: {"content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer"}});
const page = (l, k) => shell(l, `<h1>${TX[l].fail}</h1><p>${TX[l][k]}</p><div class="row"><a class="btn" href="/">${TX[l].back}</a></div>`, 400);

export default async (req) => {
  const q = new URL(req.url).searchParams, t = q.get("t") || "", l = q.get("l") === "es" ? "es" : "ca";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(t)) return page(l, "bad");
  // Obrir l'enllaç (GET) no el gasta: alguns correus el visiten per previsualitzar-lo. Es gasta en prémer el botó (POST).
  if (req.method !== "POST") return shell(l, `<h1>${TX[l].title}</h1><p>${TX[l].intro}</p><form method="post"><button class="btn" type="submit">${TX[l].open}</button></form>`);
  try {
    const st = await store("explica-subs");
    // Un sol ús: l'enllaç es marca com a gastat amb escriptura condicional (dos clics alhora no passen tots dos).
    let mine = false;
    const rec = await updateJSON(st, "tok/" + t, (cur) => { mine = false; return cur && !cur.used ? (mine = true, {...cur, used: Date.now()}) : undefined; });
    if (!mine || !rec || rec.exp < Date.now()) return page(l, "used");
    const customer = rec.customer || (await getJSON(st, "sub/" + rec.sub))?.customer;
    if (!customer) return page(l, "nosub");
    try {
      const s = await stripe("billing_portal/sessions", {method: "POST", form: {customer, return_url: new URL(req.url).origin + "/", ...(l === "es" ? {locale: "es"} : {})}});
      await st.delete("tok/" + t).catch(() => {});   // gastat: ja no cal guardar-lo
      return Response.redirect(s.url, 303);
    } catch {
      // Stripe ha fallat: l'enllaç torna a quedar disponible per tornar-ho a provar.
      await updateJSON(st, "tok/" + t, (cur) => cur?.used ? {...cur, used: 0} : undefined).catch(() => {});
      return page(l, "stripe");
    }
  } catch {
    return page(l, "err");
  }
};

export const config = {path: "/api/portal-obre"};
