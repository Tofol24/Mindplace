// POST /api/acceso-solicitar · botón «Solicitar mi código» de Mi espacio (ver netlify/lib/acceso.mjs).
// Solo durante la ventana de bienvenida: da un código de 3 meses. No pide ni guarda nada de la persona.
import { autoAbierto, autoHasta, crear, cors, json, MESES_AUTO } from "../lib/acceso.mjs";

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "metodo" });
  if (!autoAbierto()) return json(req, 403, { error: "cerrado", autoHasta: autoHasta() });
  try {
    return json(req, 200, await crear({ meses: MESES_AUTO, origen: "auto" }));
  } catch {
    return json(req, 503, { error: "servicio" });
  }
};

// Límite por IP holgado (varias personas pueden compartir la wifi o la IP del operador móvil),
// pero que frena a un script que quiera llenar el almacén. La IP no se guarda.
export const config = {
  path: "/api/acceso-solicitar",
  rateLimit: { windowLimit: 20, windowSize: 3600, aggregateBy: ["ip", "domain"] },
};
