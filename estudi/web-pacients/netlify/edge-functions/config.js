// Explica-ho · què pot mostrar la pàgina: si hi ha subscripcions i quins plans (els ids de preu no són secrets).
import {json, plans, subsEnabled} from "../lib/comu.js";

export default async () => json(200, {
  subscripcions: subsEnabled(),
  plans: subsEnabled() ? plans().map(({nom, price, quota, preu}) => ({nom, price, quota, preu})) : [],
});

export const config = {path: "/api/config"};
