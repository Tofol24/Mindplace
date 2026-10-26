// Explica-ho · «Gestiona la subscripció»: envia un enllaç d'un sol ús al correu de qui paga.
// Només qui té accés a aquell correu pot obrir el portal de Stripe (el codi sol el té també l'estudiant).
import {json, store, count, subForCode, customerEmail, maskEmail, token, mailEnabled, mailBody, sendMail, env, getJSON, cleanup} from "../lib/comu.js";

export default async (req) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  if (!env("STRIPE_SECRET_KEY") || !mailEnabled()) return json(404, {error: "sense-correu"});
  let body; try { body = await req.json(); } catch { return json(400, {error: "format"}); }
  const code = String(body?.codi || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{4,40}$/.test(code)) return json(404, {error: "codi"});
  try {
    const st = await store("explica-subs");
    const sub = await subForCode(st, code);
    if (!sub?.customer) return json(404, {error: "codi"});
    if (!(await count(await store("explica-us"), "enllac/" + code + "/" + new Date().toISOString().slice(0, 10), 5)).ok) return json(429, {error: "massa"});
    const to = await customerEmail(sub.customer);
    if (!to) return json(404, {error: "sense-correu"});
    const t = token();
    await st.set("tok/" + t, JSON.stringify({sub: sub.id, exp: Date.now() + 30 * 60 * 1000}), {onlyIfNew: true});
    const {text, html} = mailBody([
      "Algú ha demanat gestionar la subscripció a Explica-ho (canviar la targeta, veure les factures o donar-se de baixa).",
      "L'enllaç serveix una sola vegada i caduca d'aquí a 30 minuts. Si no ho has demanat tu, ignora aquest correu: no canviarà res.",
    ], {label: "Gestiona la subscripció", url: new URL(req.url).origin + "/api/portal-obre?t=" + t});
    await sendMail({to, subject: "Enllaç per gestionar la subscripció a Explica-ho", html, text});
    // Neteja: enllaços caducats i comptadors d'enllaços de dies anteriors.
    const today = new Date().toISOString().slice(0, 10);
    await cleanup(st, "tok/", async (k) => ((await getJSON(st, k))?.exp || 0) < Date.now());
    await cleanup(await store("explica-us"), "enllac/", (k) => !k.endsWith("/" + today));
    return json(200, {ok: true, a: maskEmail(to)});
  } catch {
    return json(502, {error: "enviament"});
  }
};

export const config = {path: "/api/portal-enllac"};
