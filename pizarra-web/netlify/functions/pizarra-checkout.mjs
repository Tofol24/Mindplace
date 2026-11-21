// Pizarra del entrenador (sitio pizarra-web) · abre el pago de Stripe (Checkout).
export { checkout as default } from "../../../netlify/lib/pizarra-pago.mjs";
export const config = { path: "/api/pizarra-checkout" };
