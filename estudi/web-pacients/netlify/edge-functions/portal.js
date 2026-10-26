// Explica-ho · «Gestiona la subscripció»: obre el portal de Stripe (targeta, factures, baixa) per al codi,
// només si qui ho demana sap el correu amb què es va pagar (el codi sol el té també l'estudiant).
import {env, json, stripe, store, subForCode} from "../lib/comu.js";

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  // Encara que es tanquin les altes noves, qui ja paga ha de poder gestionar-ho i donar-se de baixa.
  if (!env("STRIPE_SECRET_KEY")) return json(404, {error: "sense-subscripcions"});
  let body; try { body = await req.json(); } catch { return json(400, {error: "format"}); }
  const code = String(body?.codi || "").trim().toLowerCase();
  const email = String(body?.email || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{4,40}$/.test(code)) return json(404, {error: "codi"});
  if (!email) return json(403, {error: "correu"});
  try {
    const sub = await subForCode(await store("explica-subs"), code);
    if (!sub?.customer) return json(404, {error: "codi"});
    // Només qui paga gestiona la facturació: cal el correu amb què es va fer el pagament.
    const customer = await stripe("customers/" + sub.customer);
    if (String(customer?.email || "").trim().toLowerCase() !== email) return json(403, {error: "correu"});
    const s = await stripe("billing_portal/sessions", {method: "POST", form: {customer: sub.customer, return_url: new URL(req.url).origin + "/"}});
    return json(200, {url: s.url});
  } catch (e) {
    return json(502, {error: "stripe", message: String(e.message || e).slice(0, 200)});
  }
};

export const config = {path: "/api/portal"};
