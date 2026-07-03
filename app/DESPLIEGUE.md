# APRENS · Subir a Netlify + instalar en el móvil

Guía breve, sin tecnicismos. Dos partes:
- **A) Publicar la app** (lo haces tú, una vez).
- **B) Instalarla en el móvil** (lo hace el paciente, o tú para enseñárselo).

---

## A) Publicar la app en Netlify

La app entera vive en la carpeta **`app/`**. No hay que “compilar” nada: son
ficheros que se sirven tal cual. Tienes dos caminos.

### Opción 1 — Arrastrar la carpeta (lo más rápido, sin cuenta técnica)
1. Entra en **https://app.netlify.com/drop**.
2. Arrastra **solo la carpeta `app/`** (no el repositorio entero) a la zona
   que pone *“Drag and drop your site output folder here”*.
3. En segundos te da una URL tipo `https://algo-al-azar.netlify.app`.
4. (Opcional) En *Site settings → Change site name* pon algo como
   `aprens-app` → `https://aprens-app.netlify.app`.

> Cada vez que cambies algo, vuelves a arrastrar la carpeta `app/` y se
> actualiza. Los pacientes no tienen que reinstalar: al abrirla se refresca sola.

### Opción 2 — Conectar el repositorio de GitHub (se actualiza solo)
1. En Netlify: **Add new site → Import an existing project → GitHub**.
2. Elige el repo `Mindplace`.
3. Netlify leerá el fichero **`netlify.toml`** que ya está en el proyecto y
   publicará automáticamente la carpeta `app/` (no hay comando de build).
4. A partir de ahí, cada vez que se suba un cambio a la rama, Netlify
   republica sola.

### Ya viene configurado (no tienes que tocar nada)
- **`netlify.toml`** — le dice a Netlify que la web está en `app/`.
- **`app/_headers`** — seguridad y privacidad:
  - El *service worker* y la portada no se cachean en el servidor → una versión
    nueva llega al instante.
  - Una **CSP** que **bloquea cualquier recurso externo**: aunque un día se
    colara un enlace a Google Fonts o a un CDN, el navegador lo impediría, así
    que **la IP del paciente nunca sale** hacia terceros (RGPD).

> **Comprobación rápida tras publicar:** abre la URL en el móvil, cárgala una
> vez, activa el **modo avión** y recárgala. Debe seguir funcionando (offline).

---

## B) Instalar en el móvil (añadir a la pantalla de inicio)

No está en App Store ni Play Store: se instala como **“app web”** (PWA). Ocupa
casi nada, funciona sin conexión y **todo se queda en el móvil del paciente**.

### 📱 iPhone / iPad (Safari)
1. Abre la URL **en Safari** (importante: en Safari, no en Chrome).
2. Toca el botón **Compartir** (el cuadradito con la flecha hacia arriba ⬆️).
3. Baja y toca **“Añadir a pantalla de inicio”**.
4. Toca **“Añadir”**. Aparece el icono de APRENS como una app más.

### 🤖 Android (Chrome)
1. Abre la URL en **Chrome**.
2. Toca el menú **⋮** (arriba a la derecha).
3. Toca **“Instalar aplicación”** o **“Añadir a pantalla de inicio”**.
4. Confirma. Aparece el icono de APRENS en el cajón de apps.

> En Android, a veces sale sola una franja abajo que dice *“Instalar APRENS”*:
> con tocarla basta.

### Cómo se usa a partir de ahí
- Se abre desde el icono, **a pantalla completa**, como cualquier app.
- Funciona **sin conexión** una vez abierta la primera vez.
- El paciente rellena la herramienta y, al final, pulsa **“Archivo .json”** o
  **“Enviar”**: hasta ese momento **no se guarda ni se envía nada** fuera. El
  `.json` te lo puede mandar por el canal que acordéis (p. ej. WhatsApp).

---

## Mensaje listo para enviar al paciente (copia y pega)

> Hola 🙂 Aquí tienes tu espacio de práctica APRENS:
> **https://aprens-app.netlify.app**
>
> Para tenerlo a mano como una app:
> - **iPhone:** ábrelo en Safari → botón Compartir ⬆️ → “Añadir a pantalla de inicio”.
> - **Android:** ábrelo en Chrome → menú ⋮ → “Instalar aplicación”.
>
> Es anónimo y funciona sin conexión. No guarda nada hasta que tú pulsas
> “enviar”. Cuando termines un ejercicio, me pasas el archivo que genera.

---

*Para el detalle técnico (arquitectura, herramientas, offline/RGPD) mira
`README.md` y `../AUDITORIA_Y_PLAN.md`.*
