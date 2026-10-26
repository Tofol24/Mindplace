// Explica-ho · avisos de Stripe: altes, canvis de pla, impagats i baixes de subscripcions.
// Stripe signa cada avís; només s'accepten els que porten una signatura vàlida i recent.
import {env, json, stripe, store, subInfo, saveSub, ensureCode, codeOnInvoices, plans} from "../lib/comu.js";

// El compte de Stripe pot tenir altres productes: només es tracten les subscripcions d'Explica-ho.
const ours = (sub) => sub?.metadata?.app === "explica-ho" || plans().some(p => p.price === subInfo(sub).price);

const enc = new TextEncoder();
async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, "0")).join("");
}
function sameHex(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
export async function verify(payload, header, secret, now = Date.now() / 1000) {
  let t = 0; const v1 = [];
  for (const kv of String(header || "").split(",")) {
    const [k, v] = kv.split("=");
    if (k === "t") t = parseInt(v, 10);
    else if (k === "v1" && v) v1.push(v);
  }
  if (!t || !v1.length || Math.abs(now - t) > 300) return false;
  const expected = await hmacHex(secret, t + "." + payload);
  return v1.some(v => sameHex(v, expected));
}

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) return json(500, {error: "config"});
  const payload = await req.text();
  if (!(await verify(payload, req.headers.get("stripe-signature"), secret))) return json(400, {error: "signatura"});
  let ev; try { ev = JSON.parse(payload); } catch { return json(400, {error: "format"}); }
  const obj = ev?.data?.object || {};
  try {
    const st = await store("explica-subs");
    if (ev.type === "checkout.session.completed" && obj.mode === "subscription" && obj.subscription && obj.metadata?.app === "explica-ho") {
      const sub = await stripe("subscriptions/" + (typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id));
      const info = subInfo(sub);
      await saveSub(st, info);
      const code = await ensureCode(st, info.id);
      await codeOnInvoices(info.customer, code);
    } else if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(ev.type) && ours(obj)) {
      // Stripe no garanteix l'ordre dels avisos: no es fa cas de l'estat que porta l'avís, sinó del
      // que té ara la subscripció a Stripe. Així un avís antic no pot reactivar una baixa.
      await saveSub(st, subInfo(await stripe("subscriptions/" + obj.id)));
    }
  } catch (e) {
    return json(500, {error: "intern"});   // Stripe ho tornarà a provar
  }
  return json(200, {ok: true});
};

export const config = {path: "/api/stripe-webhook"};
