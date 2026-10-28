// Explica-ho · què pot mostrar la pàgina: si hi ha subscripcions i quins plans (els ids de preu no són secrets).
import {env, json, plans, subsEnabled, mailEnabled, portalLogin} from "../lib/comu.js";

export default async () => json(200, {
  subscripcions: subsEnabled(),
  gestio: !!env("STRIPE_SECRET_KEY"),
  correu: !!env("STRIPE_SECRET_KEY") && mailEnabled(),   // enllaços de gestió i recuperació del codi per correu
  // Sense correus propis: la pàgina d'accés del portal de Stripe (Stripe verifica el correu amb un codi).
  portalLogin: portalLogin(),   // qui ja paga pot gestionar-ho encara que les altes estiguin tancades
  plans: subsEnabled() ? plans().map(({nom, price, quota, preu}) => ({nom, price, quota, preu})) : [],
});

export const config = {path: "/api/config"};
