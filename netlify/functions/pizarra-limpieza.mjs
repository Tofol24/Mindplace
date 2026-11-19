// Tarea programada (cada noche): borra los enlaces cortos de la Pizarra que han caducado
// (90 días) y los contadores de cuota de días pasados, aunque nadie los vuelva a abrir.
// Recorre el índice exp/<día>/<id> día a día, solo los días ya pasados, y borra por lotes
// a medida que avanza. Se detiene antes del límite de tiempo; lo que quede se borra la
// noche siguiente (y al leer un enlace caducado también se borra en el momento).
import { getStore } from "@netlify/blobs";
import { claveDato, dia } from "../lib/pizarra.mjs";

const LOTE = 25;

export async function limpiar(store, ahora = Date.now(), presupuestoMs = 20_000) {
  const inicio = Date.now(), hoy = dia(ahora);
  const queda = () => Date.now() - inicio < presupuestoMs;
  let borrados = 0;
  const borrarLote = async (lote) => {
    const r = await Promise.allSettled(lote.map(async (claves) => { for (const k of claves) await store.delete(k); }));
    borrados += r.filter((x) => x.status === "fulfilled").length;
  };
  // días del índice ya caducados (las carpetas exp/<día>), del más antiguo al más reciente
  const { directories: dias } = await store.list({ prefix: "exp/", directories: true });
  for (const carpeta of dias.filter((d) => d.slice(4) < hoy).sort()) {
    let lote = [];
    for await (const pagina of store.list({ prefix: carpeta + "/", paginate: true })) {
      for (const { key } of pagina.blobs) {
        if (!queda()) { await borrarLote(lote); return borrados; }
        // primero el bloque y después su entrada en el índice: si algo falla, se reintenta mañana
        lote.push([claveDato(key.split("/")[2]), key]);
        if (lote.length >= LOTE) { await borrarLote(lote); lote = []; }
      }
    }
    await borrarLote(lote);
  }
  if (queda()) {
    const { blobs } = await store.list({ prefix: "cuota/" });
    await borrarLote(blobs.filter(({ key }) => key.slice(6) < hoy).map(({ key }) => [key]));
  }
  return borrados;
}

export default async () => { await limpiar(getStore("pizarra")); };

export const config = { schedule: "@daily" };
