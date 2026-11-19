// Función en segundo plano: hace la consulta a Claude para un trabajo creado por /api/pizarra-ia
// y deja el resultado en el almacén «pizarra-ia» para que la app lo recoja.
// Solo procesa trabajos existentes en estado «pendiente» (los crea la función con tope diario).
import Anthropic from "@anthropic-ai/sdk";
import { getStore } from "@netlify/blobs";
import { ESQUEMA, ESQUEMA_PIZARRA, MODELO, RE_JOB, SISTEMA, SISTEMA_PIZARRA, mensajeUsuario, sanearPizarra, sanearSalida } from "../lib/pizarra-ia.mjs";

export async function consultar(entrada, cliente = new Anthropic()) {
  const pz = entrada && entrada.modo === "pizarra"; // diseñar la pizarra de un ejercicio
  const r = await cliente.beta.messages.create({
    model: MODELO,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: pz ? ESQUEMA_PIZARRA : ESQUEMA } },
    system: [{ type: "text", text: pz ? SISTEMA_PIZARRA : SISTEMA, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: mensajeUsuario(entrada) }]
  });
  if (r.stop_reason === "refusal") throw new Error("rechazo");
  if (r.stop_reason === "max_tokens") throw new Error("largo");
  const texto = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const salida = pz ? sanearPizarra(JSON.parse(texto)) : sanearSalida(JSON.parse(texto), entrada);
  if (!salida) throw new Error("formato");
  return salida;
}

export default async (req) => {
  const job = (await req.text()).trim();
  if (!RE_JOB.test(job)) return;
  const store = getStore({ name: "pizarra-ia", consistency: "strong" });
  const t = await store.get("job/" + job, { type: "json" });
  if (!t || t.estado !== "pendiente") return;
  await store.setJSON("job/" + job, { estado: "procesando", creado: t.creado });
  try {
    const resultado = await consultar(t.entrada);
    await store.setJSON("job/" + job, { estado: "listo", creado: t.creado, resultado });
  } catch (e) {
    let error = "consulta";
    if (e instanceof Anthropic.RateLimitError) error = "ocupado";
    else if (e instanceof Anthropic.AuthenticationError) error = "clave";
    else if (e instanceof Anthropic.APIError) error = "api";
    else if (e && (e.message === "rechazo" || e.message === "largo" || e.message === "formato")) error = e.message;
    await store.setJSON("job/" + job, { estado: "error", creado: t.creado, error });
  }
};
