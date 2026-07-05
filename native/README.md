# Anclado en mí · app nativa (Fase C — Capacitor)

Empaqueta la versión consumer **Anclado en mí** como app nativa **iOS y Android**, con
**notificaciones locales reales** (te suena el móvil a tus horas aunque la app esté cerrada) y
lista para **App Store / Google Play**.

> **Qué está ya hecho (en el código):**
> - Las notificaciones de tu «rutina diaria» ya usan **Capacitor LocalNotifications** cuando la app
>   corre en nativo (repetidas cada día a la hora que elijas). En web siguen siendo best-effort.
> - Andamiaje Capacitor: `capacitor.config.json`, `package.json`, y `assemble.mjs` (arma el `www/`
>   de la app consumer con las rutas correctas).
>
> **Qué tienes que hacer tú** (esto NO se puede hacer desde el repo: necesita tu Mac y tus cuentas):
> generar las plataformas, poner icono/splash, compilar y subir a las stores. Pasos abajo.

---

## 0. Requisitos (una vez)

- **Node.js 18+** (https://nodejs.org).
- **iOS:** un **Mac** con **Xcode** (App Store) + **CocoaPods** (`sudo gem install cocoapods`).
  Cuenta **Apple Developer** (99 $/año) para publicar.
- **Android:** **Android Studio** (cualquier sistema). Cuenta **Google Play Console** (25 $, pago único).
- No se puede compilar iOS sin Mac. Alternativa sin Mac: un servicio en la nube (Ionic Appflow,
  Codemagic, EAS) que compila iOS por ti.

---

## 1. Preparar el proyecto

```bash
cd native
npm install            # instala Capacitor y el plugin de notificaciones
npm run assemble       # crea native/www/ a partir de la app consumer
```

`npm run assemble` copia `app/bienestar` + `js` + `vendor` + `assets` + `tools-standalone` a
`native/www/` (con una raíz que redirige a `bienestar/`). **Repite `npm run assemble` (o
`npm run sync`) cada vez que cambies la app** para que el nativo coja los cambios.

---

## 2. Añadir las plataformas

```bash
npm run add:android    # crea native/android/
npm run add:ios        # crea native/ios/  (solo en Mac)
```

Esto genera los proyectos nativos. A partir de aquí trabajas con Android Studio / Xcode.

---

## 3. Icono y pantalla de inicio (marca ⚓)

Coloca un icono cuadrado grande (1024×1024 PNG) y opcional splash en `native/assets/` y usa la
herramienta oficial:

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#3a7d6e' --splashBackgroundColor '#f5f8f6'
```

> Hoy la app usa el icono genérico. Diseña el icono de **Anclado en mí** (ancla ⚓ sobre verde
> `#3a7d6e`) antes de publicar: es lo primero que ve el usuario en la store.

**Android — icono de notificación:** crea un icono monocromo blanco `ic_stat_icon` en
`android/app/src/main/res/drawable*/` (Android Studio → New → Image Asset → Notification Icon).
Ya está referenciado en `capacitor.config.json`.

---

## 4. Permiso de notificaciones

- **Android 13+**: Capacitor pide el permiso `POST_NOTIFICATIONS` en tiempo de ejecución (ya lo
  gestiona el código al activar avisos). No necesitas tocar nada.
- **iOS**: el permiso se pide al activar los avisos. No requiere texto de uso especial para
  notificaciones locales, pero revisa que en Xcode → Signing & Capabilities no falte nada.

Las notificaciones se programan solas desde **Ajustes → Mi rutina diaria** (activa «Avisarme en el
móvil»). Cada momento activo se convierte en una notificación **diaria repetida** a esa hora.

---

## 5. Probar en el móvil

```bash
npm run sync           # assemble + copia web a las plataformas
npm run open:android   # abre Android Studio → Run en un emulador o tu móvil
npm run open:ios       # abre Xcode (Mac) → Run
```

Prueba: pon un momento a 1–2 minutos vista, cierra la app del todo y espera → debe sonar la
notificación. Al tocarla, abre la app en «Hoy».

---

## 6. Publicar

**Google Play**
1. En Android Studio: *Build → Generate Signed App Bundle* (`.aab`) con tu clave de firma (guárdala).
2. Play Console → crea la app → sube el `.aab` a **pruebas internas** primero.
3. Rellena: ficha (capturas, descripción), **clasificación de contenido**, **Data safety**
   (declara que los datos se guardan solo en el dispositivo), y **política de privacidad** (URL).
4. Envía a revisión → producción.

**App Store**
1. Xcode → *Product → Archive* → *Distribute App* → App Store Connect.
2. App Store Connect → crea la app → sube el build → **TestFlight** para probar.
3. Rellena ficha + **privacidad (Nutrition Labels)** + política de privacidad.
4. Envía a revisión.

---

## 7. Checklist para pasar revisión (importante)

- [ ] **Posicionamiento wellness, no clínico**: descripción y capturas hablan de *bienestar,
      hábitos, inteligencia emocional*. **Sin claims médicos** (no «trata la ansiedad/depresión»).
- [ ] **Disclaimer** visible «no es un producto sanitario» (ya está en la app).
- [ ] **Política de privacidad** publicada (URL). Puedes indicar: datos solo en el dispositivo, sin
      cuentas, sin envío a terceros.
- [ ] **Recurso de crisis** (024) presente (ya está).
- [ ] **La app se siente completa** (Apple rechaza apps «vacías»): onboarding + plan + práctica +
      progreso ya lo cubren.
- [ ] Icono y capturas de marca listos.
- [ ] (Si añades pago) el paywall y las compras in-app cumplen las reglas de cada store.

---

## Notas
- El motor y el contenido son los mismos que la web: cualquier mejora en `app/bienestar` llega al
  nativo con `npm run assemble` + `npx cap sync`.
- La app clínica y el panel **no** se incluyen en el paquete nativo (solo la consumer).
- `www/`, `node_modules/`, `ios/` y `android/` son generados y no se versionan (ver `.gitignore`).
