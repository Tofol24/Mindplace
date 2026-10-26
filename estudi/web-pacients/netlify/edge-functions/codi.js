// Explica-ho · després de pagar: comprova la sessió de Stripe i retorna el codi d'accés de la subscripció.
// Si el codi encara no existeix (l'avís de Stripe pot arribar més tard), es crea aquí mateix.
import {env, json, plans, stripe, store, subInfo, saveSub, ensureCode, codeOnInvoices, mailCode} from "../lib/comu.js";

export default async (req) => {
  // Encara que s'hagin tancat les altes noves, qui ja ha pagat ha de poder recuperar el codi.
  if (!env("STRIPE_SECRET_KEY")) return json(404, {error: "sense-subscripcions"});
  const id = new URL(req.url).searchParams.get("session_id") || "";
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(id)) return json(400, {error: "sessio"});
  try {
    const s = await stripe("checkout/sessions/" + id + "?expand[]=subscription");
    if (s.metadata?.app !== "explica-ho") return json(404, {error: "sessio"});
    if (s.status !== "complete" || !["paid", "no_payment_required"].includes(s.payment_status) || !s.subscription) return json(409, {error: "pendent"});
    const sub = typeof s.subscription === "string" ? await stripe("subscriptions/" + s.subscription) : s.subscription;
    const info = subInfo(sub);
    const st = await store("explica-subs");
    await saveSub(st, info);
    const code = await ensureCode(st, info.id);
    try { await codeOnInvoices(info.customer, code); } catch {}
    let mail = "no";
    try { mail = await mailCode(st, info.id, new URL(req.url).origin); } catch {}
    const plan = plans().find(p => p.price === info.price);
    return json(200, {codi: code, pla: plan?.nom || "", quota: plan?.quota || 0, correu: mail === "enviat" || mail === "ja"});
  } catch (e) {
    return json(502, {error: "stripe", message: String(e.message || e).slice(0, 200)});
  }
};

export const config = {path: "/api/codi"};
