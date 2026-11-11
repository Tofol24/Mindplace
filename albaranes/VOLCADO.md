# Volcado de albaranes al programa de facturación

Formato de los ficheros que exporta la app de albaranes desde **Volcado a
facturación**, para importarlos en el programa de facturación (Access u otro) y
convertir los albaranes en facturas. Versión del formato: **1**.

La app se usa en el móvil sin conexión. Los albaranes se quedan en el propio
móvil y solo salen cuando quien la usa exporta y comparte los ficheros (correo,
AirDrop, carpeta…). No hay ningún servidor con los datos.

## Ficheros

Cada exportación genera, para el periodo y el cliente filtrados:

| Fichero | Contenido |
|---|---|
| `volcado-AAAA-MM-DD_a_AAAA-MM-DD-albaranes.csv` | Una fila por albarán |
| `volcado-AAAA-MM-DD_a_AAAA-MM-DD-lineas.csv` | Una fila por línea de albarán |
| `volcado-AAAA-MM-DD_a_AAAA-MM-DD.json` | Lo mismo en JSON (opcional, si se prefiere programar la importación) |

**CSV:**
- Codificación UTF-8 con BOM.
- Separador `;` y campos siempre entre comillas dobles; una comilla dentro del texto va doble (`""`).
- Fin de línea CRLF y primera fila con los nombres de las columnas.
- Decimales con **coma** (`2354,5`), sin separador de miles. Fechas `AAAA-MM-DD`. Momentos (firma, volcado) en ISO 8601 UTC (`2026-09-30T17:20:00.000Z`).
- Sí / no: `S` / `N`.
- Un texto que empezaría por `=`, `+`, `-` o `@` lleva delante un apóstrofo (`'`), para que Excel no lo trate como fórmula.

**Clave:** `albaran_id` (un UUID) identifica cada albarán de forma única y no
cambia nunca. Sirve para enlazar las líneas con su albarán y para **no importar
dos veces** el mismo albarán. La app marca los exportados como «volcados», pero
la importación debería comprobarlo también.

## albaranes.csv

| Columna | Tipo | Descripción |
|---|---|---|
| `albaran_id` | texto (UUID) | Identificador único del albarán. Clave primaria. |
| `numero` | texto | Número del albarán: `PREFIJO-AÑO-NNNN` (p. ej. `AP-2026-0001`). Correlativo por año. **No es el número de factura.** |
| `fecha` | fecha | Fecha del servicio. |
| `estado` | texto | `firmado` (sin Holded) o, si se usó Holded, `pendiente`, `error` o `enviado`. |
| `firmado_en` | fecha-hora | Cuándo firmó el cliente. |
| `firmante` | texto | Nombre de quien firmó. |
| `emisor_nombre`, `emisor_nif` | texto | Datos del profesional en el momento de firmar. |
| `cliente_nombre` | texto | Cliente (paciente, empresa o mutua). |
| `cliente_nif` | texto | NIF/CIF tal como se escribió (puede llevar guiones). |
| `cliente_es_empresa` | S/N | `S` si el NIF es un CIF (empresa o entidad). |
| `cliente_direccion`, `cliente_cp`, `cliente_poblacion`, `cliente_telefono`, `cliente_email` | texto | Datos del cliente, si se pusieron. |
| `descripcion` | texto | Descripción del servicio, si la hay. En servicios sanitarios no lleva datos clínicos. |
| `observaciones` | texto | Notas (forma de pago, próxima cita…). |
| `base_imponible` | importe | Suma de las líneas. |
| `base_exenta` | importe | Parte de la base de líneas exentas de IVA. |
| `base_sujeta` | importe | Parte de la base de líneas con IVA. |
| `cuota_iva` | importe | IVA total. |
| `retencion_pct` | número | Retención de IRPF aplicada por el cliente (0, 7 o 15). |
| `cuota_retencion` | importe | Retención sobre la base imponible. |
| `total` | importe | Total a cobrar = base + IVA − retención. |
| `exento` | S/N | `S` si alguna línea va exenta de IVA. |
| `texto_exencion` | texto | Mención de la exención que sale en el PDF. |
| `verifactu_causa_exencion` | texto | `E1` si la mención cita el art. 20 de la Ley del IVA (p. ej. servicios sanitarios); vacío en otro caso (ver más abajo). |
| `volcado_en` | fecha-hora | Si ya se había exportado antes (vacío la primera vez). |

## lineas.csv

| Columna | Tipo | Descripción |
|---|---|---|
| `albaran_id` | texto (UUID) | Albarán al que pertenece (clave ajena). |
| `numero`, `fecha` | | Los del albarán, para leerlo cómodamente. |
| `linea` | entero | 1, 2, 3… dentro del albarán. Con `albaran_id`, clave de la línea. |
| `concepto` | texto | Servicio o material. |
| `cantidad` | número (hasta 4 decimales) | Unidades o sesiones. |
| `precio_unitario` | importe | Precio por unidad, sin IVA. |
| `iva_pct` | número | 21, 10 o 0 (exento). |
| `exento` | S/N | `S` si la línea va exenta. |
| `base_linea` | importe | cantidad × precio. |
| `cuota_iva_linea` | importe | IVA de la línea. |

Los importes ya vienen redondeados a céntimos. El IVA del albarán se calcula por
tipo (suma de bases de cada tipo × tipo), igual que en el PDF, así que la suma
de `cuota_iva_linea` puede diferir en algún céntimo de `cuota_iva`: manda la del
albarán.

## JSON

Un objeto `{ "formato": "albaranes-volcado", "version": 1, "exportadoEn": "…", "albaranes": [ … ] }`.
Cada albarán tiene los mismos datos que el CSV, con nombres en camelCase,
números como números y booleanos como `true` / `false`, y sus `lineas` dentro.

## De albarán a factura (VeriFactu)

El albarán **no es una factura**. La factura la emite el programa de
facturación, que es quien tiene que cumplir VeriFactu: numerar las facturas,
encadenar los registros con su huella, poner el código QR y enviar a la AEAT si
procede. Lo que da el volcado para ello:

- **Emisor:** `emisor_nif` y `emisor_nombre`.
- **Destinatario:** `cliente_nif` y `cliente_nombre`. Sin NIF del cliente, la factura completa no se puede hacer; según el caso, sería simplificada.
- **Fecha de la operación:** `fecha`. Una factura puede agrupar varios albaranes del mismo cliente; por ejemplo, todas las sesiones del mes de una mutua.
- **Desglose:**
  - Operaciones exentas: `base_exenta`, con la causa `verifactu_causa_exencion` (`E1` = art. 20 LIVA). Si la exención es de otro tipo, la causa la decide el programa.
  - Sujetas y no exentas: `base_sujeta` y `cuota_iva`, por tipo en `lineas.csv`.
- **Retención de IRPF:** `retencion_pct` y `cuota_retencion`. VeriFactu no la registra, pero tiene que figurar en la factura.
- **Referencia:** conviene guardar en la factura los `numero` de los albaranes que incluye.

## Cambios de formato

Si el formato cambia, sube `version` (en el JSON) y se describe aquí. Las
columnas nuevas se añaden siempre **al final** de cada CSV, para no romper una
importación ya hecha.
