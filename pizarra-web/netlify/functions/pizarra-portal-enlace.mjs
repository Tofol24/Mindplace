// Pizarra del entrenador (sitio pizarra-web) · envía por correo un enlace de un solo uso al portal de Stripe.
export { portalEnlace as default } from "../../../netlify/lib/pizarra-pago.mjs";
export const config = { path: "/api/pizarra-portal-enlace" };
