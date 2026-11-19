// Pizarra del entrenador (sitio pizarra-web) · borra cada día los enlaces caducados.
export { default } from "../../../netlify/functions/pizarra-limpieza.mjs";
export const config = { schedule: "@daily" };
