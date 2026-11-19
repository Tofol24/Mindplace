// Tarea programada (cada noche): borra los enlaces cortos de la Pizarra que han caducado
// (90 días) y los contadores de cuota de días pasados, aunque nadie los vuelva a abrir.
// Usa el índice exp/<día>/<id>: no hace falta leer cada bloque. Trabaja por lotes y se
// detiene antes del límite de tiempo; lo que quede se borra la noche siguiente (al leer
// un enlace caducado también se borra en el momento).
import { getStore } from "@netlify/blobs";
import { claveDato, dia } from "../lib/pizarra.mjs";

const LOTE = 25;

export async function limpiar(store, ahora = Date.now(), presupuestoMs = 20_000) {
  const inicio = Date.now(), hoy = dia(ahora);
  const pendientes = [];
  for await (const pagina of store.list({ prefix: "exp/", paginate: true })) {
    for (const { key } of pagina.blobs) {
      const [, d, id] = key.split("/");
      if (d < hoy) pendientes.push([key, claveDato(id)]);
    }
  }
  for await (const pagina of store.list({ prefix: "cuota/", paginate: true })) {
    for (const { key } of pagina.blobs) if (key.slice(6) < hoy) pendientes.push([key]);
  }
  let borrados = 0;
  for (let i = 0; i < pendientes.length; i += LOTE) {
    if (Date.now() - inicio > presupuestoMs) break;
    const lote = pendientes.slice(i, i + LOTE);
    // primero el bloque y después su entrada en el índice: si algo falla, se reintenta mañana
    await Promise.allSettled(lote.map(async (claves) => {
      for (const k of claves.slice().reverse()) await store.delete(k);
      borrados++;
    }));
  }
  return borrados;
}

export default async () => { await limpiar(getStore("pizarra")); };

export const config = { schedule: "@daily" };
