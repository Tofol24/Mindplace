// GET /api/config · Ajustes de partida de esta instalación (variables APP_* de Netlify).
// El móvil los pide la primera vez que se abre la app; luego mandan sus Ajustes.
// Sin clave de la app: no hay secretos (son los datos que salen en el PDF) y hacen
// falta antes de haber escrito la clave.
import { json } from "../lib/http.mjs";
import { configInicial } from "../lib/config.mjs";

export default async () => json(configInicial(process.env));

export const config = { path: "/api/config" };
