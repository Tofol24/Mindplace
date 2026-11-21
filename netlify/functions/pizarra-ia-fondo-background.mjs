// Función en segundo plano: hace la consulta a Claude para un trabajo creado por /api/pizarra-ia
// y deja el resultado en el almacén «pizarra-ia» para que la app lo recoja.
// Solo procesa trabajos existentes en estado «pendiente» (los crea la función con tope diario).
import Anthropic from "@anthropic-ai/sdk";
import { getStore } from "@netlify/blobs";
import { ESQUEMA, ESQUEMA_ALTERNATIVAS, ESQUEMA_AUTO, ESQUEMA_ENTRENO, ESQUEMA_EQUIPO, ESQUEMA_PIZARRA, MODELO, RE_JOB, SISTEMA, SISTEMA_ALTERNATIVAS, SISTEMA_AUTO, SISTEMA_ENTRENO, SISTEMA_EQUIPO, SISTEMA_PIZARRA,
  mensajeUsuario, sanearAlternativas, sanearAuto, sanearEntreno, sanearEquipo, sanearPizarra, sanearSalida } from "../lib/pizarra-ia.mjs";

// Cada modo de consulta: instrucciones, esquema de la respuesta y saneado.
const MODOS = {
  sugerencias: { sis: SISTEMA, esq: ESQUEMA, san: (o, e) => sanearSalida(o, e) },
  pizarra: { sis: SISTEMA_PIZARRA, esq: ESQUEMA_PIZARRA, san: (o) => sanearPizarra(o) },
  alternativas: { sis: SISTEMA_ALTERNATIVAS, esq: ESQUEMA_ALTERNATIVAS, san: (o) => sanearAlternativas(o) },
  entreno: { sis: SISTEMA_ENTRENO, esq: ESQUEMA_ENTRENO, san: (o) => sanearEntreno(o) },
  autoeval: { sis: SISTEMA_AUTO, esq: ESQUEMA_AUTO, san: (o) => sanearAuto(o) },
  equipo: { sis: SISTEMA_EQUIPO, esq: ESQUEMA_EQUIPO, san: (o, e) => sanearEquipo(o, e) }
};

export async function consultar(entrada, cliente = new Anthropic()) {
  const m = MODOS[entrada && Object.prototype.hasOwnProperty.call(MODOS, entrada.modo) ? entrada.modo : "sugerencias"];
  const r = await cliente.beta.messages.create({
    model: MODELO,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: m.esq } },
    system: [{ type: "text", text: m.sis, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: mensajeUsuario(entrada) }]
  });
  if (r.stop_reason === "refusal") throw new Error("rechazo");
  if (r.stop_reason === "max_tokens") throw new Error("largo");
  const texto = r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const salida = m.san(JSON.parse(texto), entrada);
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
