// API de los códigos de acceso (ver netlify/lib/acceso.mjs).
//   GET  /api/acceso/config                       ¿está abierto el botón automático? ¿hasta cuándo?
//   POST /api/acceso/validar   {codigo}           ¿vale este código? ¿hasta cuándo?
//   Con la cabecera x-codigo-pro (código profesional):
//   GET  /api/acceso/pro                          ¿es válido el código profesional?
//   POST /api/acceso/crear     {meses}            código nuevo de 1, 2, 3, 6 o 12 meses
//   GET  /api/acceso/lista                        códigos creados con ese código profesional
//   POST /api/acceso/revocar   {codigo}           anula uno de esos códigos
import { activos, autoAbierto, autoHasta, cors, crear, cuerpo, estado, json, leer, listarPro, MESES_AUTO, MESES_VALIDOS, profesional, revocar } from "../lib/acceso.mjs";

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  const accion = new URL(req.url).pathname.replace(/^\/api\/acceso\/?/, "");
  const metodo = { config: "GET", validar: "POST", pro: "GET", crear: "POST", lista: "GET", revocar: "POST" }[accion];
  if (!metodo) return json(req, 404, { error: "ruta" });
  if (req.method !== metodo) return json(req, 405, { error: "metodo" });
  try {
    if (accion === "config") return json(req, 200, { autoAbierto: autoAbierto(), autoHasta: autoAbierto() ? autoHasta() : "", mesesAuto: MESES_AUTO });
    if (accion === "validar") {
      const b = await cuerpo(req);
      if (!b) return json(req, 400, { error: "cuerpo" });
      return json(req, 200, estado(await leer(b.codigo)));
    }
    const p = profesional(req.headers.get("x-codigo-pro"));
    if (!p) return json(req, 401, { error: "pro" });
    const pro = p.huella;
    if (accion === "pro") return json(req, 200, { ok: true, meses: MESES_VALIDOS, limite: p.limite });
    if (accion === "lista") { const codigos = await listarPro(pro); return json(req, 200, { codigos, activos: activos(codigos), limite: p.limite }); }
    const b = await cuerpo(req);
    if (!b) return json(req, 400, { error: "cuerpo" });
    if (accion === "crear") {
      const meses = Number(b.meses);
      if (!MESES_VALIDOS.includes(meses)) return json(req, 400, { error: "meses" });
      if (p.limite && activos(await listarPro(pro)) >= p.limite) return json(req, 409, { error: "limite", limite: p.limite });
      return json(req, 200, await crear({ meses, origen: "pro", pro }));
    }
    return (await revocar(pro, b.codigo)) ? json(req, 200, { ok: true }) : json(req, 404, { error: "no_existe" });
  } catch {
    return json(req, 503, { error: "servicio" });
  }
};

// Frena a quien pruebe códigos al azar (hay ~8·10¹¹ posibles). La IP no se guarda.
export const config = {
  path: ["/api/acceso/config", "/api/acceso/validar", "/api/acceso/pro", "/api/acceso/crear", "/api/acceso/lista", "/api/acceso/revocar"],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
