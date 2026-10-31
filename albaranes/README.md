# Albaranes de obra

App para el móvil: haces el albarán delante del cliente, lo firma con el dedo,
se lo mandas en PDF por WhatsApp o email y **llega solo a Holded**, donde lo
conviertes en factura con un clic.

Funciona **sin cobertura** (sótanos, obras): todo se guarda en el móvil y se
envía a Holded en cuanto vuelve la señal.

Además:
- **Dictar el albarán con la voz**: Pere habla y la app rellena cliente, trabajo
  y líneas, con los artículos y precios de su catálogo.
- **Compras con foto**: foto del albarán o factura del proveedor → la app lee los
  artículos y el precio de coste, y actualiza el catálogo y el stock.
- **Catálogo con margen**: precio de venta = coste + margen %, y stock que baja al
  firmar albaranes. Lo que gana Pere solo lo ve él; en el PDF no sale.
- **Para el asesor**: exporta las compras de un mes (hoja de cálculo + fotos).

---

## Dictado, compras y catálogo

**Dictar.** En el albarán, pulsa **🎤 Hablar** (o el micrófono del teclado) y di,
por ejemplo: *«Cliente Jesús Arribas, teléfono 600 111 222. Cambio de grifo del
baño: un grifo monomando, dos latiguillos y hora y media de mano de obra»*. Pulsa
**✨ Rellenar el albarán** y revisa lo que ha puesto antes de que firme el cliente.
- Solo rellena los datos del cliente que estén vacíos y añade las líneas al final.
- Los artículos que están en el catálogo salen con su precio de venta; la mano de
  obra y el desplazamiento, con los precios de Ajustes.
- Sin cobertura, el dictado se guarda en el borrador y se aplica solo al volver la
  señal. (El micrófono del teclado transcribe sin conexión; el botón 🎤 depende del
  navegador.)

**Compras.** Pestaña **Compras → 📷 Foto**. Con cobertura, en unos segundos aparece
lo leído (proveedor, NIF, número, fecha y artículos con precio, descuento e IVA).
Revísalo y pulsa **Registrar compra**: cada artículo actualiza su **coste** (el de
la última compra) y suma su **stock**. Si un artículo no estaba en el catálogo, se
crea. Sin cobertura, la foto se guarda y se lee sola al volver la señal.

**Catálogo.** Pestaña **Catálogo**: coste, margen, precio de venta y stock de cada
artículo. El margen general está en Ajustes (30% por defecto); cada artículo puede
tener el suyo o un precio de venta fijo.

**Para el asesor.** En **Compras**, al final: elige el mes y **Exportar compras del
mes**. Se comparte (o descarga) una hoja de cálculo con fecha, proveedor, NIF,
número, base, IVA y total, y la foto de cada documento.

> El dictado y las fotos se leen con Claude (la IA de Anthropic). Para eso hace
> falta una clave de su API (paso 2 de la puesta en marcha). Las fotos de compras
> y los dictados se envían a Anthropic solo para leerlos.

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
   (`inventory:shipments`, leer y escribir). Si usas IVA exento o retención de
   IRPF, también **leer impuestos**: la app busca en tu cuenta qué impuesto es
   «exento» y cuál la retención del 15 % (Configuración → Impuestos de Holded;
   tienen que estar activos).
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
   - `ANTHROPIC_API_KEY` → la clave de la API de Anthropic, para el dictado y las
     fotos de compras. Se crea en https://platform.claude.com (API keys), con
     saldo cargado. Cada dictado cuesta del orden de 1–3 céntimos y cada foto
     de 3–8 céntimos (calculado con las tarifas actuales; varía según lo largo).
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
- **Tipo de actividad**:
  - *Oficio* (obras, reparaciones): dirección de la obra, material, mano de
    obra y desplazamiento, pestañas de compras y catálogo, y dictado por voz.
  - *Servicios profesionales* (consulta, sesiones): sin dirección de la obra
    ni compras; las líneas salen de tus **servicios habituales** («Primera
    visita: 60», uno por línea). **Rellenar con IA** (por voz o con el
    **pantallazo de la cita** de la agenda, botón «📷 Desde la agenda») está apagado:
    se activa a sabiendas en Ajustes (lo dictado sale a la IA de Anthropic a
    través de tu servidor; dicta solo datos administrativos y recógelo en tu
    aviso de privacidad; necesita `ANTHROPIC_API_KEY`). Con él, «doce primeras
    visitas y cuarenta y una de seguimiento» rellena las líneas con tus precios,
    y la IA tiene orden de descartar cualquier dato clínico. Sin activarlo, el
    micrófono del teclado del móvil sirve para dictar campo a campo. Los
    albaranes ya firmados no cambian.
- Precio de la hora, del desplazamiento e IVA por defecto (21 %, 10 % o
  **exento**, p. ej. servicios sanitarios), y el texto de la exención que sale
  en el PDF.
- **Retención de IRPF** que te aplican las empresas (p. ej. 15 %). Se propone
  sola en los albaranes a clientes con CIF y se puede cambiar en cada albarán.
- **Clave de la app** (la `APP_CLAVE`) → **Guardar y probar conexión**.

---

## Sin Holded: volcado a tu programa de facturación

En Ajustes → **Destino de los albaranes** → «Sin Holded: volcado a mi programa
de facturación». Los albaranes firmados se quedan en el móvil (no se envían a
ningún sitio) y, desde **📤 Volcado a facturación**, se filtran por fechas y
cliente, se ven con sus totales y se exportan en **CSV** (dos ficheros:
albaranes y líneas, para Access o Excel) o **JSON**. Después se marcan como
volcados para no repetirlos. El formato, columna a columna y pensado para
convertirlos en facturas con VeriFactu, está en [VOLCADO.md](VOLCADO.md).

Los ficheros llevan datos de los clientes: guárdalos en un sitio seguro y
bórralos del móvil o del correo cuando ya estén en el programa.

## Otra instalación para otro profesional

El mismo código sirve a cualquier profesional: cada uno con **su propio sitio
de Netlify**, su Holded y sus claves. Los datos (albaranes, clientes) nunca se
mezclan: viven en el móvil de cada uno y en su cuenta de Holded.

1. Crea un sitio nuevo como en «Publicar la app en Netlify» (mismo repositorio,
   **Base directory** = `albaranes`), con sus propias `HOLDED_API_KEY` y
   `APP_CLAVE`.
2. Añade, si quieres, sus **Ajustes de partida** como variables de entorno. Un
   móvil nuevo los recibe en cuanto se escribe la **clave de la app** en Ajustes
   (sin la clave no se dan: incluyen el NIF y la dirección). Después se cambian
   en Ajustes, y unos Ajustes ya guardados en un móvil nunca se sobrescriben.
   Sin estas variables, cada uno pone sus datos en Ajustes: la app no firma
   ningún albarán sin el nombre del negocio.

   | Variable | Ejemplo |
   |---|---|
   | `APP_PERFIL` | `servicios` (o `oficio`) |
   | `APP_DESTINO` | `volcado` (sin Holded) o `holded` |
   | `APP_NEGOCIO_NOMBRE` | `Cristóbal Villalonga Melis` |
   | `APP_NEGOCIO_NIF` | `78210217M` |
   | `APP_NEGOCIO_DIRECCION` | `C/ Virgen de la Esperanza, 70, 2º, 07300 Inca (Baleares)` |
   | `APP_NEGOCIO_TELEFONO` | `636 93 76 61` |
   | `APP_NEGOCIO_EMAIL` | `info@aprens.es` |
   | `APP_IVA` | `0` (exento), `21` o `10` |
   | `APP_RETENCION` | `15` (la que aplican las empresas), `7` o `0` |
   | `APP_TEXTO_EXENCION` | `Operación exenta de IVA (art. 20.Uno.3 de la Ley 37/1992).` |
   | `APP_SERVICIOS` | `Primera visita: 60 \| Sesión de seguimiento: 50` |
   | `APP_PREFIJO` | `AP` |
   | `APP_CONSENTIMIENTO` | `si`: pide el consentimiento RGPD en las primeras visitas |
   | `APP_COLEGIADO` | Nº de colegiado (sale en el consentimiento) |
   | `APP_DPD` | Contacto del Delegado de Protección de Datos (opcional) |
   | `APP_HERRAMIENTA_ONLINE` | Herramienta de las sesiones en línea (opcional; sin ella no sale esa casilla) |

3. Con el perfil `servicios` no hay fotos de compras, y el dictado con IA es
   opcional (Ajustes): `ANTHROPIC_API_KEY` solo hace falta si lo vas a activar.
4. **Consentimiento RGPD** (perfil `servicios`, se activa en Ajustes): en un
   albarán con un servicio que contiene «primera» (se cambia en Ajustes), si el
   paciente aún no lo ha firmado, la app ofrece firmarlo con el dedo: el
   paciente, un representante legal o dos (tutores separados). El texto lleva
   los datos del negocio de Ajustes y se guarda tal como se firmó, con las
   firmas, solo en el móvil y en la copia de seguridad (nunca en Holded, el
   volcado ni la IA). Se comparte en PDF para la historia clínica.

## Comprobaciones recomendadas antes de usarla con clientes

- Con la prueba gratuita de Holded, haz un albarán de prueba y mira que en
  Holded salgan bien el **IVA** (21 %, 10 % o exento), la **retención** si la
  usas y el número. «Guardar y probar conexión» avisa si en tu Holded no hay un
  IVA exento o la retención que tienes en Ajustes.
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
├── functions/ia.mjs      dictado y lectura de fotos con Claude (/api/ia/*)
├── lib/holded.mjs        lógica de envío (validación, clientes, no duplicar)
├── lib/ia.mjs            instrucciones, esquemas y limpieza de lo que lee la IA
├── test/                 pruebas: npm test
└── public/               la app (PWA, funciona sin conexión)
    ├── js/app.js         albaranes, firma, cola de envío, ajustes
    ├── js/voz.js         dictado por voz
    ├── js/compras.js     compras con foto, registro y exportación al asesor
    ├── js/catalogo.js    artículos: coste, margen, precio de venta y stock
    ├── js/db.js          almacenamiento en el móvil (IndexedDB)
    ├── js/pdf.js         PDF del albarán (jsPDF en vendor/, sin internet)
    ├── js/calculos.js    importes, IVA y formatos
    └── sw.js             guarda la app para abrirla sin cobertura
```

Los móviles reciben las versiones nuevas solos: la app se abre con la versión
guardada y descarga la nueva para la siguiente vez. Si añades o quitas ficheros
de `public/`, actualiza la lista y sube `VERSION` en `public/sw.js`.
