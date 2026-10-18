# Redirecciones de las herramientas antiguas de Netlify

Antes de la app APRENS, cada herramienta vivía en su propia web de Netlify
(`aprens-aisdiario`, `aprens-mapainterno`, …). Esas webs siguen en línea con
versiones antiguas (sin la silueta de dos luces, sin el recorrido). Cada
carpeta de aquí sustituye una de ellas por un aviso de traslado que lleva a la
herramienta dentro de la app.

**Cómo aplicarlo (una vez por web):**
1. Entra en https://app.netlify.com y abre la web (por ejemplo `aprens-aisdiario`).
2. Pestaña **Deploys** → arrastra la carpeta correspondiente (`netlify-redirecciones/aprens-aisdiario`)
   a la zona «Drag and drop your site output folder here».
3. Listo: quien entre por la dirección antigua llega a la versión de la app.

Si la persona tenía registros guardados en la web antigua, el aviso **no
redirige solo** y le ofrece descargarlos en un archivo `.json` antes de seguir.

| Web antigua | Destino en la app |
|---|---|
| `aprens-aisdiario.netlify.app` | `#/tool/herramienta_diaria` · Herramienta diaria |
| `aprens-mapainterno.netlify.app` | `#/tool/mapa_atencion_interna` · Mapa interno |
| `aprens-aisdiaadia.netlify.app` | `#/tool/ais_amor` · AIS desde el amor |
| `aprens-cuesitionario-tec.netlify.app` | `#/tool/cuestionario_tec` · Cuestionario TEC |
| `aprens-screeningtec.netlify.app` | `#/tool/screening_tec` · Screening TEC/AIS |
| `aprens-estadomono.netlify.app` | `#/tool/estado_mono` · ¿Cómo llevas a tu mono? |
| `aprens-dondemono.netlify.app` | `#/tool/donde_esta_mono` · ¿Dónde está tu mono? |
| `aprens-agendaatencional.netlify.app` | `#/tool/agenda_atencional` · Agenda atencional |
| `aprens-aiscuriosidad.netlify.app` | `#/tool/ais_curiosidad` · AIS desde la curiosidad |
| `aprens-protocoloais.netlify.app` | `#/tool/protocolo_ais` · Protocolo AIS (audio) |
| `aprens-brujulavalores.netlify.app` | `#/tool/brujula_valores` · Brújula de valores |
| `aprens-acompanar-sensacion.netlify.app` | `#/tool/acompanar_sensacion` · Acompañar la sensación |
| `aprens-bajaralerta.netlify.app` | `#/tool/bajar_alerta` · Bajar la alerta |
| `aprens-controlira.netlify.app` | `#/tool/control_ira` · Control de ira |
| `aprens-cajadeherramientassemanal.netlify.app` | `#/tool/tracker_ais` · Tracker AIS |
| `aprenseines.netlify.app` | `#/tool/tracker_tec` · Tracker TEC |
| `retorn-feina.netlify.app` | `#/tool/retorno_trabajo` · Retorno al trabajo |

`aprens-retomona` («Reto: salir con mi mona al lado») no tiene equivalente en la
app, por eso no tiene carpeta.
