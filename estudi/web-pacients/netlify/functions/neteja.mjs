// Explica-ho · neteja programada: cada dia esborra el que la política de privacitat diu que s'esborra,
// encara que aquell dia ningú faci servir l'eina. (També es llança, com a molt una vegada al dia, amb l'ús.)
import {purge} from "../lib/comu.js";

export default async () => {
  try {
    await purge();
    return new Response("ok");
  } catch (e) {
    console.error("neteja: " + String(e?.message || e));   // queda als registres de la funció a Netlify
    return new Response("error", {status: 500});
  }
};

export const config = {schedule: "@daily"};
