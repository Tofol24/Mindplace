// Pizarra del entrenador (sitio pizarra-web) · guarda un enlace corto cifrado (con PIZARRA_SUSCRIPCION=si, solo con código activo).
export { default } from "../../../netlify/functions/pizarra-subir.mjs";
export const config = {
  path: "/api/pizarra-subir",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] }
};
