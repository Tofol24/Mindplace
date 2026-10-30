// GET /api/config · Ajustes de partida de esta instalación (variables APP_* de Netlify).
// Un móvil nuevo los pide en cuanto tiene la clave de la app; luego mandan sus Ajustes.
// Con clave: el NIF, la dirección o el teléfono del profesional no se dan a cualquiera.
import { claveCorrecta, json } from "../lib/http.mjs";
import { configInicial } from "../lib/config.mjs";

export default async (req) => {
  if (!claveCorrecta(req)) return json({ error: "La clave de la app no es correcta", reintentar: false }, 401);
  return json(configInicial(process.env));
};

export const config = { path: "/api/config" };
