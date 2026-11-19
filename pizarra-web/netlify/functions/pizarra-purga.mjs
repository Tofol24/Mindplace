// Pizarra del entrenador (sitio pizarra-web) · limpieza diaria de la suscripción (lo que promete la privacidad).
export { purgaProgramada as default } from "../../../netlify/lib/pizarra-pago.mjs";
export const config = { schedule: "@daily" };
