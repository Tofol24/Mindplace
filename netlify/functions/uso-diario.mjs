// Tarea programada (cada noche): cierra todos los días anteriores a ayer que
// tengan eventos sueltos, aunque nadie consulte el índice. Así los eventos
// individuales no se conservan más de unos días: quedan solo los recuentos
// diarios (dia/<día>), que no identifican a nadie.
import { getStore } from "@netlify/blobs";
import { cerrarDias, listar, primerDiaAbierto } from "../lib/uso.mjs";

export default async () => {
  const store = getStore("uso");
  const { sueltos, resumidos } = await listar(store, "");
  await cerrarDias(store, sueltos, resumidos, primerDiaAbierto());
};

export const config = { schedule: "@daily" };
