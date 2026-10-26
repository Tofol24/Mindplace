// Explica-ho · comença una subscripció: crea la pàgina de pagament de Stripe (Checkout) i en retorna l'adreça.
import {json, plans, stripe, subsEnabled} from "../lib/comu.js";

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  if (!subsEnabled()) return json(404, {error: "sense-subscripcions"});
  let body;
  try { body = await req.json(); } catch { return json(400, {error: "format"}); }
  const plan = plans().find(p => p.price === body?.pla);
  if (!plan) return json(400, {error: "pla"});
  if (body?.acceptat !== true) return json(400, {error: "consentiment"});
  const email = String(body?.email || "").trim();
  if (email && !/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return json(400, {error: "email"});

  const origin = new URL(req.url).origin;
  const form = {
    mode: "subscription",
    "line_items[0][price]": plan.price, "line_items[0][quantity]": "1",
    success_url: origin + "/gracies.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: origin + "/subscriu.html",
    allow_promotion_codes: "true",
    locale: "auto",
    "metadata[app]": "explica-ho", "subscription_data[metadata][app]": "explica-ho",
    "metadata[consentiment]": "acceptat " + new Date().toISOString(),
  };
  if (email) form.customer_email = email;
  try {
    const s = await stripe("checkout/sessions", {method: "POST", form});
    return json(200, {url: s.url});
  } catch (e) {
    return json(502, {error: "stripe", message: String(e.message || e).slice(0, 200)});
  }
};

export const config = {path: "/api/checkout"};
