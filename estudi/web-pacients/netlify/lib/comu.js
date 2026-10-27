// Explica-ho · peces compartides de les funcions del servidor (codis, comptadors, Stripe).

export const env = (k, d = "") => (globalThis.Netlify?.env.get(k) ?? d);
export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers},
});

// Magatzem de Netlify Blobs amb consistència forta (les escriptures es veuen a l'instant).
export async function store(name) {
  const {getStore} = await import("@netlify/blobs");
  return getStore({name, consistency: "strong"});
}
async function readJSON(st, key) {
  const r = await st.getWithMetadata(key, {type: "text"});
  if (!r) return null;
  try { return {data: JSON.parse(r.data), etag: r.etag}; } catch { return {data: null, etag: r.etag}; }
}
export async function getJSON(st, key) { return (await readJSON(st, key))?.data ?? null; }
// Escriptura condicional amb reintents: `fn` rep el valor actual i en retorna el nou (o undefined per no tocar res).
export async function updateJSON(st, key, fn) {
  for (let i = 0; i < 8; i++) {
    const cur = await readJSON(st, key);
    const next = fn(cur?.data ?? null);
    if (next === undefined) return cur?.data ?? null;
    const w = cur ? await st.set(key, JSON.stringify(next), {onlyIfMatch: cur.etag}) : await st.set(key, JSON.stringify(next), {onlyIfNew: true});
    if (w?.modified) return next;
    await new Promise(r => setTimeout(r, 20 + Math.random() * 100));
  }
  throw new Error("No s'ha pogut desar (massa canvis alhora).");
}

// Comptador amb límit: suma 1 si no s'ha arribat al límit. Retorna {ok, used}.
export async function count(st, key, limit) {
  let ok = false, used = 0;
  await updateJSON(st, key, (cur) => {
    const n = Number(cur?.n) || 0;
    if (n >= limit) { ok = false; used = n; return undefined; }
    ok = true; used = n + 1; return {n: n + 1};
  });
  return {ok, used};
}

// Desfà una suma (la petició no ha arribat a fer-se).
export async function uncount(st, key) {
  try { await updateJSON(st, key, (cur) => (Number(cur?.n) || 0) > 0 ? {n: cur.n - 1} : undefined); } catch {}
}

// Un límit ha de ser un enter complet; "0" vol dir sense límit. Un valor mal escrit fa servir el per defecte.
export const toLimit = (v, def) => /^\s*\d+\s*$/.test(v ?? "") ? parseInt(v, 10) : def;

// Codis donats a mà (pacients): EXPLICA_CODIS = "k7m2qpx4, r9tx4bm8:30" (mínim 8 caràcters)
export function manualCodes(defLimit) {
  const m = new Map();
  for (const part of String(env("EXPLICA_CODIS")).split(/[,\n]/)) {
    const [c, l] = part.trim().toLowerCase().split(":");
    if (/^[a-z0-9_-]{8,40}$/.test(c || "")) m.set(c, toLimit(l, defLimit));   // mínim 8 caràcters: que no es puguin endevinar
  }
  return m;
}

// Plans de subscripció: EXPLICA_PLANS = "Bàsic|price_123|200|3 € al mes; Intensiu|price_456|600|7 € al mes"
export function plans() {
  return String(env("EXPLICA_PLANS")).split(";").map(p => p.split("|").map(x => x.trim()))
    .filter(([nom, price, quota]) => nom && /^price_[A-Za-z0-9]+$/.test(price || "") && /^\d+$/.test(quota || ""))
    .map(([nom, price, quota, preu]) => ({nom, price, quota: parseInt(quota, 10), preu: preu || ""}));
}
// Les subscripcions només s'obren quan s'ha confirmat que les condicions i la privacitat ja no són esborranys.
// També cal el secret dels avisos: sense ells no s'assabentaria de baixes ni d'impagats.
// Pàgina d'accés del portal de Stripe (Stripe verifica el correu amb un codi). Una sola validació per a tot.
export const portalLogin = () => { const u = String(env("EXPLICA_STRIPE_PORTAL_LOGIN")).trim(); return /^https:\/\/billing\.stripe\.com\/p\/login\/[A-Za-z0-9_]+$/.test(u) ? u : ""; };
// I alguna manera segura de gestionar-la: correus propis (Resend) o la pàgina d'accés del portal de Stripe.
export const subsEnabled = () => !!env("STRIPE_SECRET_KEY") && !!env("STRIPE_WEBHOOK_SECRET") && plans().length > 0 && env("EXPLICA_TEXTOS_LEGALS") === "revisats"
  && (mailEnabled() || !!portalLogin());

// Crida a l'API de Stripe sense biblioteques (formulari codificat, com demana Stripe).
export async function stripe(path, {method = "GET", form} = {}) {
  const r = await fetch("https://api.stripe.com/v1/" + path, {
    method,
    headers: {authorization: "Bearer " + env("STRIPE_SECRET_KEY"), ...(form ? {"content-type": "application/x-www-form-urlencoded"} : {})},
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || "Stripe ha respost " + r.status);
  return j;
}

// Codi d'accés aleatori de 10 caràcters, sense lletres que es confonguin (l, o, 0, 1).
export function newCode() {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789", b = new Uint8Array(10);
  crypto.getRandomValues(b);
  return Array.from(b, x => abc[x % abc.length]).join("");
}

// El que cal saber d'una subscripció. Segons la versió de l'API de Stripe, el final del període
// és a la subscripció o al seu primer element.
export function subInfo(sub) {
  const it = sub?.items?.data?.[0];
  return {
    id: sub.id, customer: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    status: sub.status, price: it?.price?.id || "", periodEnd: Number(sub.current_period_end ?? it?.current_period_end ?? 0),
    endedAt: Number(sub.ended_at || 0) * 1000,   // quan va acabar, segons Stripe (0 si continua)
  };
}
// Activa, de prova, o amb un pagament pendent: 3 dies de marge comptats des del primer impagament.
export function subActive(rec, now = Date.now() / 1000) {
  if (!rec) return false;
  if (rec.status === "active" || rec.status === "trialing") return true;
  if (rec.status === "past_due") return now < (rec.pastDueSince || now) + 3 * 86400;
  return false;
}

export const ENDED = ["canceled", "incomplete_expired"];
export const KEEP_ENDED_MS = 365 * 86400 * 1000;
// Desa l'estat d'una subscripció (manté el codi si ja en tenia).
export async function saveSub(st, info) {
  return updateJSON(st, "sub/" + info.id, (cur) => {
    const pastDueSince = info.status === "past_due" ? (cur?.pastDueSince || Math.floor(Date.now() / 1000)) : 0;
    // Data de la baixa (d'aquí compten els 12 mesos de conservació): la de Stripe, i no es mou un cop desada.
    const endedAt = ENDED.includes(info.status) ? (cur?.endedAt || info.endedAt || Date.now()) : 0;
    // Una subscripció acabada fa més de 12 mesos no es torna a crear (ja s'havia esborrat o ja toca esborrar-la).
    if (!cur && endedAt && Date.now() - endedAt > KEEP_ENDED_MS) return undefined;
    return {...(cur || {}), ...info, pastDueSince, endedAt, updated: Date.now()};
  });
}
// Dona un codi a la subscripció una sola vegada, encara que dues peticions arribin alhora.
export async function ensureCode(st, subId) {
  const sub0 = await getJSON(st, "sub/" + subId);
  if (!sub0) throw new Error("Subscripció desconeguda.");   // no es creen codis per a subscripcions sense registre
  if (sub0.code) return sub0.code;
  for (let i = 0; i < 5; i++) {
    const code = newCode();
    const w = await st.set("code/" + code, JSON.stringify({sub: subId}), {onlyIfNew: true});
    if (!w?.modified) continue;   // codi repetit (molt improbable): un altre
    const rec = await updateJSON(st, "sub/" + subId, (cur) => !cur || cur.code ? undefined : {...cur, code});
    if (rec?.code === code) return code;
    await st.delete("code/" + code);   // una altra petició ja n'havia posat un (o el registre ja no hi és)
    if (!rec?.code) throw new Error("Subscripció desconeguda.");
    return rec.code;
  }
  throw new Error("No s'ha pogut crear el codi.");
}
// El codi surt a les factures que Stripe envia per correu: així no es perd.
// Es conserven els altres camps que el client ja tingués (Stripe n'admet 4).
export async function codeOnInvoices(customer, code) {
  if (!customer || !code) return;
  const NAME = "Codi d'accés Explica-ho";
  const cur = (await stripe("customers/" + customer))?.invoice_settings?.custom_fields || [];
  if (cur.some(f => f.name === NAME && f.value === code)) return;
  const fields = [...cur.filter(f => f.name !== NAME), {name: NAME, value: code}].slice(-4);
  const form = {};
  fields.forEach((f, i) => { form[`invoice_settings[custom_fields][${i}][name]`] = f.name; form[`invoice_settings[custom_fields][${i}][value]`] = f.value; });
  await stripe("customers/" + customer, {method: "POST", form});
}
// Codi → subscripció
export async function subForCode(st, code) {
  const c = await getJSON(st, "code/" + code);
  return c?.sub ? getJSON(st, "sub/" + c.sub) : null;
}

// ---------------------------------------------------------------------------
// Correus (Resend). Opcional: sense RESEND_API_KEY i EXPLICA_EMAIL_FROM no s'envia res.
export const mailEnabled = () => !!env("RESEND_API_KEY") && !!env("EXPLICA_EMAIL_FROM");
export async function sendMail({to, subject, html, text}) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {authorization: "Bearer " + env("RESEND_API_KEY"), "content-type": "application/json"},
    body: JSON.stringify({from: env("EXPLICA_EMAIL_FROM"), to: [to], subject, html, text, ...(env("EXPLICA_EMAIL_REPLY") ? {reply_to: env("EXPLICA_EMAIL_REPLY")} : {})}),
  });
  if (!r.ok) throw new Error("Resend ha respost " + r.status);
}
export const escHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
// p***@exemple.com: es mostra a quin correu ha anat l'enllaç sense revelar-lo sencer.
export function maskEmail(e) { const [u, d] = String(e).split("@"); return d ? u.slice(0, 1) + "***@" + d : ""; }
export function token() { const b = new Uint8Array(24); crypto.getRandomValues(b); return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export async function customerEmail(customer) { return customer ? String((await stripe("customers/" + customer))?.email || "").trim() : ""; }

// Plantilla comuna dels correus: text pla i HTML senzill.
export function mailBody(paras, link) {
  const text = paras.join("\n\n") + (link ? "\n\n" + link.label + ": " + link.url : "") + "\n\nExplica-ho";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#18203a;max-width:560px">
${paras.map(p => `<p style="margin:0 0 14px">${p.startsWith("CODI:") ? `<span style="display:inline-block;font-family:monospace;font-size:26px;letter-spacing:3px;background:#eef1f8;border:2px dashed #2c47c9;border-radius:10px;padding:10px 16px">${escHtml(p.slice(5))}</span>` : /^https:\/\/\S+$/.test(p) ? `<a href="${escHtml(p)}">${escHtml(p)}</a>` : escHtml(p)}</p>`).join("\n")}
${link ? `<p style="margin:18px 0"><a href="${escHtml(link.url)}" style="background:#2c47c9;color:#fff;text-decoration:none;padding:11px 18px;border-radius:999px;font-weight:bold">${escHtml(link.label)}</a></p>` : ""}
<p style="margin:24px 0 0;color:#59627e;font-size:13px">Explica-ho</p></div>`;
  return {text: text.replace(/^CODI:/gm, ""), html};
}

// Envia el codi al correu de qui paga, una sola vegada per subscripció (encara que arribin dos avisos).
// Retorna "enviat", "ja" (ja s'havia enviat), "no" (no hi ha codi o correu) o "error".
export async function mailCode(st, subId, origin) {
  if (!mailEnabled()) return "no";
  // Reserva de 10 minuts (`mailing`) mentre s'envia; `mailed` només quan Resend l'ha acceptat.
  // `claimed` es decideix a cada intent: si una escriptura perd la cursa, el reintent veu la reserva i no envia.
  let claimed = false, already = false;
  const now = Date.now();
  const rec = await updateJSON(st, "sub/" + subId, (cur) => {
    claimed = false; already = !!cur?.mailed;
    if (!cur?.code || cur.mailed || (cur.mailing && now - cur.mailing < 10 * 60 * 1000)) return undefined;
    claimed = true; return {...cur, mailing: now};
  });
  if (!claimed) return already ? "ja" : "no";
  const release = (done) => updateJSON(st, "sub/" + subId, (cur) => cur?.mailing === now ? {...cur, mailing: 0, ...(done ? {mailed: Date.now()} : {})} : undefined).catch(() => {});
  try {
    const to = await customerEmail(rec.customer);
    if (!to) { await release(false); return "no"; }
    await indexEmail(st, to, rec.customer);
    const {text, html} = mailBody([
      "Gràcies per subscriure't a Explica-ho. Aquest és el codi d'accés:",
      "CODI:" + rec.code,
      "Per començar, obre Explica-ho, ves a Configuració i escriu-hi el codi. El mateix codi serveix en qualsevol ordinador o mòbil.",
      "Guarda aquest correu: si mai perds el codi, el pots tornar a demanar a la pàgina «He perdut el codi».",
    ], {label: "Obre Explica-ho", url: origin + "/"});
    await sendMail({to, subject: "El teu codi d'accés a Explica-ho", html, text});
    await release(true);
    return "enviat";
  } catch (e) {
    // No s'ha pogut enviar: es deixa preparat per tornar-ho a provar en el pròxim avís o consulta.
    await release(false);
    return "error";
  }
}

// Índex correu (en minúscules, com a empremta) → clients de Stripe, perquè «He perdut el codi» trobi la
// subscripció encara que el correu s'escrigui amb majúscules diferents.
export async function indexEmail(st, email, customer) {
  const key = "mail/" + await fingerprint("e:" + String(email).trim().toLowerCase());
  await updateJSON(st, key, (cur) => arr(cur?.c).includes(customer) ? undefined : {c: [...arr(cur?.c), customer].slice(-10)});
}
const arr = (x) => Array.isArray(x) ? x : [];

// Esborra registres temporals vells: enllaços caducats i comptadors d'intents de dies anteriors.
export async function cleanup(st, prefix, isOld) {
  try {
    const {blobs} = await st.list({prefix});
    for (const b of blobs.slice(0, 1000)) if (await isOld(b.key)) await st.delete(b.key);
  } catch {}
}

// ---------------------------------------------------------------------------
// Estadístiques d'ús: per dia, peticions, tokens i cost (segons el que diu Claude a cada resposta) i peticions per
// codi. Cap contingut. Es conserven 13 mesos naturals. Es consulten a /estadistiques.html amb la clau EXPLICA_ADMIN.
// Preus en dòlars per milió de tokens [entrada, sortida]. Si Anthropic els canvia, cal actualitzar-los aquí.
const PRICES = {"claude-sonnet-5-5": [2, 10], "claude-sonnet-5": [2, 10], "claude-haiku-5-5": [0.1, 0.5], "claude-opus-5-5": [4, 20]};
export const KEEP_STATS_MONTHS = 13;
export function costUSD(model, inTok, outTok) {
  const p = PRICES[model];
  return p ? (inTok * p[0] + outTok * p[1]) / 1e6 : null;
}
// A les estadístiques no es guarda el codi (és una credencial): només les 3 primeres lletres, perquè el titular
// el reconegui, i una empremta curta que distingeix codis que comencin igual.
export async function statsId(code) { return String(code).slice(0, 3) + "…" + (await fingerprint("stats:" + code)).slice(0, 4); }
export async function recordUsage({code, model, inTok = 0, outTok = 0, ok = true, partial = false}) {
  const day = new Date().toISOString().slice(0, 10), id = await statsId(code);
  const cost = costUSD(model, inTok, outTok);
  await updateJSON(await store("explica-us"), "estad/" + day, (cur) => {
    const d = {n: 0, ok: 0, in: 0, out: 0, cost: 0, sensePreu: 0, parcials: 0, codis: {}, models: {}, ...(cur || {})};
    d.n += 1; if (ok) d.ok += 1; if (partial) d.parcials = (d.parcials || 0) + 1;
    d.in += inTok; d.out += outTok;
    if (cost === null) d.sensePreu += 1; else d.cost = Math.round((d.cost + cost) * 1e6) / 1e6;
    d.codis = {...d.codis, [id]: (d.codis[id] || 0) + 1};
    d.models = {...d.models, [model]: (d.models[model] || 0) + 1};
    return d;
  });
}

// Neteja diària (com a molt una vegada al dia, la primera petició que arriba): el que promet la política de privacitat.
// - Comptadors i registres d'un dia (peticions, intents, enllaços demanats): s'esborren a partir de l'endemà.
// - Comptadors mensuals: s'esborren quan acaba el mes.
// - Enllaços de gestió caducats.
// - Subscripcions acabades fa més de 12 mesos: el registre i el codi; i les empremtes de correu que ja no porten enlloc.
export async function purge(now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10), month = day.slice(0, 7), mark = "purga/" + day;
  const us = await store("explica-us");
  // Reserva: una sola neteja alhora. Si una s'atura a mitges, passats 15 minuts una altra la pot reprendre.
  // `cursor`: fins on s'han revisat les subscripcions (es continua des d'allà si no s'havia acabat).
  let mine = false, cursor = "";
  await updateJSON(us, mark, (cur) => {
    mine = false;
    if (cur?.done || (cur?.start && now - cur.start < 15 * 60 * 1000)) return undefined;
    mine = true; cursor = cur?.cursor || ""; return {start: now, cursor};
  });
  if (!mine) return false;
  // Pressupost de temps (les funcions tenen un límit): si no s'acaba, es desa fins on ha arribat i la pròxima continua.
  const t0 = Date.now(), late = () => { if (Date.now() - t0 > 20_000) throw new Error("temps"); };
  try {
    const {blobs: ub} = await us.list();
    // 13 mesos naturals: el mes en curs i els 12 anteriors (es compta per mesos sencers, sense desbordaments de dies).
    const nd = new Date(now), cm = nd.getUTCFullYear() * 12 + nd.getUTCMonth() - (KEEP_STATS_MONTHS - 1);
    const statsCut = `${Math.floor(cm / 12)}-${String(cm % 12 + 1).padStart(2, "0")}-01`;
    for (const {key} of ub) {
      if (key.startsWith("estad/")) { if (key.slice(6) < statsCut) { late(); await us.delete(key); } continue; }
      const d = key.match(/\/(\d{4}-\d{2}-\d{2})$/), m = key.match(/\/mes\/(\d{4}-\d{2})$/);
      if ((d && d[1] < day) || (m && m[1] < month)) { late(); await us.delete(key); }
    }
    const st = await store("explica-subs");
    const {blobs: sb} = await st.list();
    for (const key of sb.map(b => b.key).filter(k => k.startsWith("tok/"))) {
      late();
      if (((await getJSON(st, key))?.exp || 0) < now) await st.delete(key);
    }
    for (const key of sb.map(b => b.key).filter(k => k.startsWith("sub/") && k > cursor).sort()) {
      late();
      const rec = await getJSON(st, key);
      const ended = rec && (rec.endedAt || (ENDED.includes(rec.status) ? Number(rec.updated) || now : 0));
      if (ended && now - ended > KEEP_ENDED_MS) {
        // Primer s'apunta el client com a pendent (persistent): si la neteja s'atura, la pròxima el reprèn.
        if (rec.customer) await updateJSON(us, "pendents", (cur) => arr(cur?.c).includes(rec.customer) ? undefined : {c: [...arr(cur?.c), rec.customer]});
        if (rec.code) await st.delete("code/" + rec.code);
        await st.delete(key);
      }
      cursor = key;
    }
    // Empremtes de correu: només es treuen els clients pendents que, segons Stripe, ja no tenen cap altra
    // subscripció d'Explica-ho que s'hagi de conservar.
    // D'un en un, i es treu de la llista de pendents en acabar cadascun: així el progrés no es perd.
    const mails = sb.map(b => b.key).filter(k => k.startsWith("mail/"));
    for (const c of arr((await getJSON(us, "pendents"))?.c)) {
      late();
      const subs = (await stripe("subscriptions?status=all&limit=100&customer=" + encodeURIComponent(c))).data || [];
      const keep = subs.some(x => { const i = subInfo(x); return (x.metadata?.app === "explica-ho" || plans().some(p => p.price === i.price)) && !(ENDED.includes(i.status) && now - (i.endedAt || now) > KEEP_ENDED_MS); });
      if (!keep) for (const key of mails) {
        const r = await updateJSON(st, key, (cur) => arr(cur?.c).includes(c) ? {c: arr(cur.c).filter(x => x !== c)} : undefined);
        if (r && !arr(r.c).length && !arr((await getJSON(st, key))?.c).length) await st.delete(key);
      }
      await updateJSON(us, "pendents", (cur) => arr(cur?.c).includes(c) ? {c: arr(cur.c).filter(x => x !== c)} : undefined);
    }
    await us.set(mark, JSON.stringify({start: now, cursor, done: Date.now()}));
    return true;
  } catch (e) {
    // S'allibera la reserva i es desa fins on s'ha arribat: la pròxima vegada continua des d'aquí.
    await us.set(mark, JSON.stringify({cursor})).catch(() => {});
    throw e;
  }
}
// Llança la neteja sense fer esperar la resposta.
export function purgeLater(context) {
  const job = purge().catch(() => {});
  if (typeof context?.waitUntil === "function") context.waitUntil(job);
}

// Empremta (HMAC) per comptar intents sense desar el correu ni l'adreça de connexió en clar.
export async function fingerprint(value) {
  // Sempre hi ha d'haver una clau: si no n'hi ha cap de pròpia, es fa servir la de l'API (mai surt del servidor).
  const secret = env("EXPLICA_SECRET") || env("STRIPE_WEBHOOK_SECRET") || env("RESEND_API_KEY") || env("ANTHROPIC_API_KEY") || "explica-ho";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(String(value))));
  return Array.from(sig.slice(0, 16), b => b.toString(16).padStart(2, "0")).join("");
}
