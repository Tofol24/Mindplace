# scripts · utilidades que NO se publican

Esta carpeta queda fuera de `app/`, así que Netlify no la sirve.

## `cifrar-html.mjs` — publicar material clínico individual sin exponerlo

**El repositorio es público.** Ningún material con datos de un paciente
(diagnósticos, medicación, relato clínico) debe subirse aquí en claro, ni
siquiera en una rama sin fusionar: GitHub lo muestra igualmente.

El flujo correcto es:

1. Preparas el HTML personalizado **fuera del repositorio** (en local).
2. Lo ciframos:

   ```sh
   node scripts/cifrar-html.mjs ~/ruta/al/original.html app/tools-standalone/c-<código>.html
   ```

   Imprime un **código de acceso** de 8 caracteres. Es la única copia: no se
   guarda en ningún archivo. Si se pierde, se vuelve a cifrar el original.

3. Subes **solo** el archivo generado. Contiene el contenido cifrado con
   AES-256-GCM y una clave derivada del código con PBKDF2-SHA256 (310 000
   iteraciones). Sin el código no se lee nada, tampoco en el código fuente.
4. Añades la ruta a `app/_headers` con `X-Robots-Tag: noindex`.
5. Envías el enlace al paciente por un canal y **el código por otro**
   (una nota de voz, una llamada, en sesión). Nunca los dos en el mismo mensaje.

El paciente teclea el código una vez; el navegador lo recuerda en ese
dispositivo. Sus respuestas se guardan solo en su móvil y no se envían a
ningún servidor.

Cuando el material ya no haga falta, borra el archivo de `app/tools-standalone/`
y su entrada en `_headers`.

## `indice-escritorio.py` — índice de todos los HTML para el escritorio

Genera `escritorio/APRENS-indice.html`, una página sola (sin dependencias) para
guardar en el escritorio y encontrar cualquier herramienta: por categoría (los
mismos grupos del hub, más profesional, otras apps, gestión del centro, material
privado y webs antiguas), con buscador, filtro por público, favoritos y
«abiertos hace poco», y con botones para abrir, copiar el enlace o ver el código.

```sh
python3 scripts/indice-escritorio.py --comprobar
```

Lee el registro (`app/js/registry.js`) y los grupos del hub (`app/js/app.js`),
así que una herramienta nueva registrada aparece sola. Lo que vive fuera del hub
se describe en el diccionario `EXTRA` del script; cualquier HTML sin describir
cae en «Sin clasificar» para que no se pierda. `--comprobar` consulta Netlify y
marca cada tarjeta como publicada o sin publicar. La plantilla es
`indice-escritorio.plantilla.html`. El resultado vive fuera de `app/`, así que
no se publica.
