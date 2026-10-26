// Explica-ho · obre el portal de Stripe des de l'enllaç del correu (un sol ús, 30 minuts).
import {store, getJSON, updateJSON, stripe} from "../lib/comu.js";

const shell = (inner, status = 200) => new Response(`<!doctype html><html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Explica-ho</title><link rel="stylesheet" href="/_base.css"></head><body><main><a class="brand" href="/"><span>Explica</span>-ho</a><div class="panel">${inner}</div></main></body></html>`,
  {status, headers: {"content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer"}});
const page = (msg) => shell(`<h1>No s'ha pogut obrir</h1><p>${msg}</p><div class="row"><a class="btn" href="/">Torna a Explica-ho</a></div>`, 400);

export default async (req) => {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(t)) return page("L'enllaç no és vàlid.");
  // Obrir l'enllaç (GET) no el gasta: alguns correus el visiten per previsualitzar-lo. Es gasta en prémer el botó (POST).
  if (req.method !== "POST") return shell(`<h1>Gestiona la subscripció</h1><p>Prem el botó per obrir el portal de Stripe, on pots canviar la targeta, veure les factures o donar-te de baixa.</p><form method="post"><button class="btn" type="submit">Obre el portal</button></form>`);
  try {
    const st = await store("explica-subs");
    // Un sol ús: l'enllaç es marca com a gastat amb escriptura condicional (dos clics alhora no passen tots dos).
    let mine = false;
    const rec = await updateJSON(st, "tok/" + t, (cur) => { mine = false; return cur && !cur.used ? (mine = true, {...cur, used: Date.now()}) : undefined; });
    if (!mine || !rec || rec.exp < Date.now()) return page("L'enllaç ha caducat o ja s'ha fet servir. Demana'n un altre des d'Explica-ho, a Configuració.");
    const customer = rec.customer || (await getJSON(st, "sub/" + rec.sub))?.customer;
    if (!customer) return page("No s'ha trobat la subscripció.");
    try {
      const s = await stripe("billing_portal/sessions", {method: "POST", form: {customer, return_url: new URL(req.url).origin + "/"}});
      await st.delete("tok/" + t).catch(() => {});   // gastat: ja no cal guardar-lo
      return Response.redirect(s.url, 303);
    } catch {
      // Stripe ha fallat: l'enllaç torna a quedar disponible per tornar-ho a provar.
      await updateJSON(st, "tok/" + t, (cur) => cur?.used ? {...cur, used: 0} : undefined).catch(() => {});
      return page("Ara mateix no es pot obrir el portal. Torna-ho a provar d'aquí a una estona amb el mateix enllaç.");
    }
  } catch {
    return page("Hi ha hagut un problema. Torna-ho a provar d'aquí a una estona.");
  }
};

export const config = {path: "/api/portal-obre"};
