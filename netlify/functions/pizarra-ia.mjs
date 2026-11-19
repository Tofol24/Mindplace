// /api/pizarra-ia · sugerencias de Claude para un apartado de la Pizarra (ver netlify/lib/pizarra-ia.mjs).
//   POST (JSON del apartado, sin nombres) → { job }  y lanza el trabajo en segundo plano
//   GET ?job=XXXXXXXXXXXXXXXX              → { estado: "pendiente" | "listo" | "error", ... }
// La consulta a Claude puede durar más que el límite de una función normal, por eso la
// hace una función en segundo plano y la app pregunta por el resultado cada pocos segundos.
import { getStore } from "@netlify/blobs";
import { CABECERAS } from "../lib/pizarra.mjs";
import { CUOTA_DIA_IA, MAX_ENTRADA, RE_JOB, nuevoJob, sanearEntrada } from "../lib/pizarra-ia.mjs";

const json = (o, status = 200) => Response.json(o, { status, headers: CABECERAS });

export default async (req) => {
  const store = getStore({ name: "pizarra-ia", consistency: "strong" });
  if (req.method === "GET") {
    const job = new URL(req.url).searchParams.get("job") || "";
    if (!RE_JOB.test(job)) return json({ error: "job" }, 400);
    const t = await store.get("job/" + job, { type: "json" });
    if (!t) return json({ estado: "error", error: "no_existe" }, 404);
    if (t.estado === "listo" || t.estado === "error") {
      await store.delete("job/" + job); // el resultado se entrega una vez y se borra
      return json({ estado: t.estado, resultado: t.resultado || null, error: t.error || null });
    }
    return json({ estado: "pendiente" });
  }
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { ...CABECERAS, Allow: "GET, POST" } });
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "sin_clave" }, 503);

  let entrada;
  try {
    const t = await req.text();
    if (t.length > MAX_ENTRADA) return json({ error: "grande" }, 413);
    entrada = sanearEntrada(JSON.parse(t));
  } catch { entrada = null; }
  if (!entrada) return json({ error: "entrada" }, 400);

  // Tope diario de consultas: cada consulta deja una clave propia cuota/<día>/<job>, así
  // ningún recuento se pierde (con peticiones simultáneas el tope puede pasarse por muy poco).
  const job = nuevoJob();
  const pref = "cuota/" + new Date().toISOString().slice(0, 10) + "/";
  const { blobs } = await store.list({ prefix: pref });
  if (blobs.length >= CUOTA_DIA_IA) return json({ error: "cuota" }, 429);
  await store.set(pref + job, "");

  await store.setJSON("job/" + job, { estado: "pendiente", creado: Date.now(), entrada });
  // Lanza la función en segundo plano (responde 202 al momento).
  const base = process.env.URL || new URL(req.url).origin;
  try {
    const r = await fetch(new URL("/.netlify/functions/pizarra-ia-fondo-background", base), { method: "POST", body: job });
    if (!r.ok && r.status !== 202) throw new Error("fondo " + r.status);
  } catch {
    await store.delete("job/" + job);
    return json({ error: "fondo" }, 502);
  }
  return json({ job }, 202);
};

export const config = { path: "/api/pizarra-ia" };
