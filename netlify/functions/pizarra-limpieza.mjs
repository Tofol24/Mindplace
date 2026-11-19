// Tarea programada (cada noche): borra los enlaces cortos de la Pizarra que han caducado
// (90 días), aunque nadie los vuelva a abrir.
import { getStore } from "@netlify/blobs";
import { caducado } from "../lib/pizarra.mjs";

export async function limpiar(store, ahora = Date.now()) {
  let borrados = 0;
  for await (const pagina of store.list({ paginate: true })) {
    for (const { key } of pagina.blobs) {
      const m = await store.getMetadata(key);
      if (!m || caducado(m.metadata, ahora)) { await store.delete(key); borrados++; }
    }
  }
  return borrados;
}

export default async () => { await limpiar(getStore("pizarra")); };

export const config = { schedule: "@daily" };
