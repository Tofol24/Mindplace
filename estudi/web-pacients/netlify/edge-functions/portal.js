// Explica-ho · «Gestiona la subscripció»: obre el portal de Stripe (targeta, factures, baixa) per al codi.
import {json, stripe, store, subForCode, subsEnabled} from "../lib/comu.js";

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  if (!subsEnabled()) return json(404, {error: "sense-subscripcions"});
  let body; try { body = await req.json(); } catch { return json(400, {error: "format"}); }
  const code = String(body?.codi || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{4,40}$/.test(code)) return json(404, {error: "codi"});
  try {
    const sub = await subForCode(await store("explica-subs"), code);
    if (!sub?.customer) return json(404, {error: "codi"});
    const s = await stripe("billing_portal/sessions", {method: "POST", form: {customer: sub.customer, return_url: new URL(req.url).origin + "/"}});
    return json(200, {url: s.url});
  } catch (e) {
    return json(502, {error: "stripe", message: String(e.message || e).slice(0, 200)});
  }
};

export const config = {path: "/api/portal"};
