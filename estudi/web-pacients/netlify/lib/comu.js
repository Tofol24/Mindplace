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

// Codis donats a mà (pacients): EXPLICA_CODIS = "k7m2qp, r9tx4b:30"
export function manualCodes(defLimit) {
  const m = new Map();
  for (const part of String(env("EXPLICA_CODIS")).split(/[,\n]/)) {
    const [c, l] = part.trim().toLowerCase().split(":");
    if (/^[a-z0-9_-]{4,40}$/.test(c || "")) m.set(c, toLimit(l, defLimit));
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
export const subsEnabled = () => !!env("STRIPE_SECRET_KEY") && !!env("STRIPE_WEBHOOK_SECRET") && plans().length > 0 && env("EXPLICA_TEXTOS_LEGALS") === "revisats";

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
  };
}
// Activa, de prova, o amb un pagament pendent (marge de 3 dies després del final del període).
export function subActive(rec, now = Date.now() / 1000) {
  if (!rec) return false;
  if (rec.status === "active" || rec.status === "trialing") return true;
  if (rec.status === "past_due") return now < (rec.periodEnd || 0) + 3 * 86400;
  return false;
}

// Desa l'estat d'una subscripció (manté el codi si ja en tenia).
export async function saveSub(st, info) {
  return updateJSON(st, "sub/" + info.id, (cur) => ({...(cur || {}), ...info, updated: Date.now()}));
}
// Dona un codi a la subscripció una sola vegada, encara que dues peticions arribin alhora.
export async function ensureCode(st, subId) {
  const existing = (await getJSON(st, "sub/" + subId))?.code;
  if (existing) return existing;
  for (let i = 0; i < 5; i++) {
    const code = newCode();
    const w = await st.set("code/" + code, JSON.stringify({sub: subId}), {onlyIfNew: true});
    if (!w?.modified) continue;   // codi repetit (molt improbable): un altre
    const rec = await updateJSON(st, "sub/" + subId, (cur) => cur?.code ? undefined : {...(cur || {id: subId}), code});
    if (rec?.code === code) return code;
    await st.delete("code/" + code);   // una altra petició ja n'havia posat un
    return rec?.code;
  }
  throw new Error("No s'ha pogut crear el codi.");
}
// El codi surt a les factures que Stripe envia per correu: així no es perd.
export async function codeOnInvoices(customer, code) {
  if (!customer || !code) return;
  await stripe("customers/" + customer, {method: "POST", form: {
    "invoice_settings[custom_fields][0][name]": "Codi d'accés Explica-ho",
    "invoice_settings[custom_fields][0][value]": code,
  }});
}
// Codi → subscripció
export async function subForCode(st, code) {
  const c = await getJSON(st, "code/" + code);
  return c?.sub ? getJSON(st, "sub/" + c.sub) : null;
}
