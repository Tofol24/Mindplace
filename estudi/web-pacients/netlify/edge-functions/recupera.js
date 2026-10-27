// Explica-ho · «He perdut el codi»: envia els codis de les subscripcions actives al correu de qui paga.
// La resposta és sempre la mateixa, hi hagi o no subscripció, perquè ningú pugui saber qui està subscrit.
import {json, stripe, store, count, plans, subInfo, subActive, saveSub, ensureCode, mailEnabled, mailBody, sendMail, env, fingerprint, getJSON, cleanup, token} from "../lib/comu.js";

const SAME = {ok: true, missatge: "Si hi ha alguna subscripció amb aquest correu, t'hi acabam d'enviar el codi i un enllaç per gestionar-la. Mira també la carpeta de correu brossa."};

export default async (req, context) => {
  if (req.method !== "POST") return json(405, {error: "metode"});
  if (!env("STRIPE_SECRET_KEY") || !mailEnabled()) return json(404, {error: "sense-correu"});
  let body; try { body = await req.json(); } catch { return json(400, {error: "format"}); }
  const email = String(body?.email || "").trim();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return json(400, {error: "email"});
  // Límits: 3 intents al dia per correu i 10 per adreça de connexió.
  const day = new Date().toISOString().slice(0, 10);
  try {
    const us = await store("explica-us");
    const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "?";
    // Es compta per empremtes, no pel correu ni per l'adreça en clar.
    // Primer la connexió: una connexió que ja ha esgotat els seus intents no pot gastar els del correu d'una altra persona.
    if (!(await count(us, "rec/ip/" + await fingerprint("ip:" + ip) + "/" + day, 10)).ok) return json(429, {error: "massa"});
    if (!(await count(us, "rec/e/" + await fingerprint("e:" + email.toLowerCase()) + "/" + day, 3)).ok) return json(429, {error: "massa"});
  } catch { return json(503, {error: "servei"}); }
  // Es respon de seguida i la feina es fa després: el temps de resposta no ha de delatar si hi ha subscripció.
  const job = (async () => {
  try {
      const prices = plans().map(p => p.price);
      const st = await store("explica-subs");
      // Clients: els de l'índex propi (no distingeix majúscules) i els que troba Stripe amb el correu tal qual.
      const ids = new Set((await getJSON(st, "mail/" + await fingerprint("e:" + email.toLowerCase())))?.c || []);
      for (const v of new Set([email, email.toLowerCase()])) for (const c of (await stripe("customers?limit=10&email=" + encodeURIComponent(v))).data || []) ids.add(c.id);
      const byEmail = new Map();   // correu registrat a Stripe → codis
      for (const id of ids) {
        const c = await stripe("customers/" + id);
        if (String(c?.email || "").trim().toLowerCase() !== email.toLowerCase()) continue;
        const entry = byEmail.get(c.email) || {codes: [], customers: []};
        const subs = (await stripe("subscriptions?status=all&limit=20&customer=" + c.id)).data || [];
        for (const s of subs) {
          const info = subInfo(s);
          if (!(s.metadata?.app === "explica-ho" || prices.includes(info.price))) continue;
          await saveSub(st, info);   // no recrea subscripcions acabades fa més de 12 mesos
          if (!entry.customers.includes(c.id)) entry.customers.push(c.id);   // un enllaç de gestió per client, sigui quin sigui l'estat
          if (subActive((await getJSON(st, "sub/" + info.id)) || info)) entry.codes.push(await ensureCode(st, info.id));
        }
        if (entry.customers.length) byEmail.set(c.email, entry);
      }
      const origin = new URL(req.url).origin;
      for (const [to, {codes, customers}] of byEmail) {   // s'envia a l'adreça registrada a Stripe
        const links = [];
        for (const customer of customers.slice(0, 5)) {
          const t = token();
          await st.set("tok/" + t, JSON.stringify({customer, exp: Date.now() + 30 * 60 * 1000}), {onlyIfNew: true});
          links.push(origin + "/api/portal-obre?t=" + t);
        }
        const {text, html} = mailBody([
          ...(codes.length ? [codes.length > 1 ? "Aquests són els codis d'accés de les teves subscripcions a Explica-ho:" : "Aquest és el codi d'accés de la teva subscripció a Explica-ho:", ...codes.map(c => "CODI:" + c),
            "Escriu-lo a Explica-ho, a Configuració."] : ["Ara mateix no tens cap subscripció activa a Explica-ho, així que no hi ha cap codi que funcioni."]),
          links.length > 1
            ? "Per veure les factures, canviar la targeta, reactivar-les o donar-te de baixa, fes servir aquests enllaços (un per cada compte de pagament). Cada un serveix una sola vegada i caduca d'aquí a 30 minuts:"
            : "Per veure les factures, canviar la targeta, reactivar-la o donar-te de baixa, fes servir l'enllaç de sota. Serveix una sola vegada i caduca d'aquí a 30 minuts.",
          ...(links.length > 1 ? links.slice(1) : []),
          "Si no has demanat aquest correu, el pots ignorar.",
        ], {label: "Gestiona la subscripció", url: links[0]});
        await sendMail({to, subject: codes.length ? "El teu codi d'accés a Explica-ho" : "La teva subscripció a Explica-ho", html, text});
      }
    } catch {}
  })();
  if (typeof context?.waitUntil === "function") context.waitUntil(job); else await job;
  // Neteja: comptadors d'intents de dies anteriors.
  try { const us = await store("explica-us"); await cleanup(us, "rec/", (k) => !k.endsWith("/" + day)); await cleanup(us, "fail/", (k) => !k.endsWith("/" + day)); } catch {}
  try { const st = await store("explica-subs"); await cleanup(st, "tok/", async (k) => ((await getJSON(st, k))?.exp || 0) < Date.now()); } catch {}
  return json(200, SAME);
};

export const config = {path: "/api/recupera"};
