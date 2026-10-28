# Albaranes de obra

App para el móvil: haces el albarán delante del cliente, lo firma con el dedo,
se lo mandas en PDF por WhatsApp o email y **llega solo a Holded**, donde lo
conviertes en factura con un clic.

Funciona **sin cobertura** (sótanos, obras): todo se guarda en el móvil y se
envía a Holded en cuanto vuelve la señal.

---

## Cómo funciona el envío a Holded

1. Firmas el albarán → queda **guardado en el móvil** con su número (p. ej. `M-2026-0001`).
2. Si hay cobertura, se envía a Holded **en ese momento**.
3. Si no hay cobertura, se queda «Por enviar» y se envía **solo** cuando:
   - vuelve la señal con la app abierta, o
   - vuelves a abrir la app (por ejemplo, al llegar a casa).
4. También puedes pulsar el indicador de arriba («2 por enviar») o el botón **Enviar ahora**.

> En iPhone el móvil no deja que una app web envíe cosas con la app cerrada.
> Basta con abrirla un momento cuando tengas cobertura.

En Holded el albarán aparece en **Ventas → Albaranes**, con el mismo número,
las líneas, el IVA y el **PDF firmado adjunto**. Si el cliente no existía en
Holded, se crea solo. Para no duplicarlo se busca antes por NIF, o por nombre
junto con el mismo email o teléfono (el nombre solo no basta: dos personas pueden
llamarse igual). Lo más seguro es elegir el cliente de las sugerencias al escribir.

Si un envío se corta a medias, el reintento continúa donde se quedó: **no se
duplican albaranes** en Holded.

---

## Puesta en marcha (una sola vez)

### 1. Clave de la API en Holded
1. En Holded: **Configuración → API** (o *Desarrolladores*) → **Generar nueva clave**.
2. Permisos que necesita: **contactos** (leer y escribir) y **albaranes / envíos**
   (`inventory:shipments`, leer y escribir).
3. Copia la clave (solo se ve una vez).

> La API de Holded tiene un límite de llamadas al mes según el plan (el plan
> Plus: 500). Cada albarán gasta unas 3–4 llamadas, así que da para más de
> 100 albaranes al mes.

### 2. Publicar la app en Netlify
1. Netlify → **Add new site → Import an existing project → GitHub** → repo `Mindplace`.
2. En **Base directory** escribe: `albaranes` (el resto lo lee de `albaranes/netlify.toml`).
3. En **Site configuration → Environment variables** añade:
   - `HOLDED_API_KEY` → la clave de Holded del paso 1.
   - `APP_CLAVE` → una contraseña larga que te inventes (la pondrás en el móvil).
4. Despliega. Te dará una dirección tipo `https://albaranes-xxxx.netlify.app`.

La clave de Holded **nunca está en el móvil**: la guarda Netlify. Si pierdes el
móvil, cambia `APP_CLAVE` en Netlify y nadie más podrá enviar nada a Holded.

Ojo: eso no borra lo que hay guardado en el propio móvil (albaranes, clientes,
direcciones y firmas). Esos datos los protege el bloqueo del teléfono: ten
siempre código o huella activados y, si lo pierdes, bórralo a distancia
(«Buscar mi iPhone» o «Encontrar mi dispositivo» en Android).

### 3. Instalarla en el móvil
- **iPhone (Safari):** abre la dirección → botón Compartir → **Añadir a pantalla de inicio**.
- **Android (Chrome):** abre la dirección → menú ⋮ → **Instalar app**.

### 4. Primeros ajustes en la app (⚙︎)
- Datos de tu negocio (salen en el PDF).
- **Prefijo** de numeración (por defecto `M`). Usa uno que no tengan tus series
  de Holded, para que no choquen los números. Cada móvil lleva su propia
  numeración: si usas la app en más de uno, pon un prefijo distinto en cada uno
  (por ejemplo `M` y `M2`).
- Precio de la hora, del desplazamiento e IVA por defecto.
- **Clave de la app** (la `APP_CLAVE`) → **Guardar y probar conexión**.

---

## Comprobaciones recomendadas antes de usarla con clientes

- Con la prueba gratuita de Holded, haz un albarán de prueba y mira que en
  Holded salgan bien el **IVA** (21% y 10%) y el número.
- Pon el móvil en **modo avión**, haz un albarán, quita el modo avión y abre la
  app: debe enviarse solo.
- Descarga de vez en cuando una **copia de seguridad** (Ajustes): los albaranes
  viven en el móvil.

---

## Estructura

```
albaranes/
├── netlify.toml          configuración del sitio (carpeta public/ + funciones)
├── functions/holded.mjs  puente seguro móvil ↔ Holded (/api/holded/*)
├── lib/holded.mjs        lógica de envío (validación, clientes, no duplicar)
├── test/                 pruebas: npm test
└── public/               la app (PWA, funciona sin conexión)
    ├── js/app.js         pantallas, firma, cola de envío
    ├── js/db.js          almacenamiento en el móvil (IndexedDB)
    ├── js/pdf.js         PDF del albarán (jsPDF en vendor/, sin internet)
    ├── js/calculos.js    importes, IVA y formatos
    └── sw.js             guarda la app para abrirla sin cobertura
```

Los móviles reciben las versiones nuevas solos: la app se abre con la versión
guardada y descarga la nueva para la siguiente vez. Si añades o quitas ficheros
de `public/`, actualiza la lista y sube `VERSION` en `public/sw.js`.
