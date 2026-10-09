# Silueta AIS con las dos luces · integración en iOS (AIS APRENS / Xcode)

Paquete para sustituir la imagen estática `ais_internal_attention` de la pantalla
«Sesión AIS» por la **silueta viva** del ecosistema APRENS (aire azul · atención
amarilla · ritmo 4·2·6), la misma que usan aprens-app, el hub y «Paso a paso».

La fuente de verdad es `app/js/respiro-ais.js` + `app/assets/respiro/organismo.webp`.
Aquí van copiados dentro de `RespiroAIS.bundle/` para que la app iOS los lleve
embebidos y funcione **100 % offline**, sin red ni almacenamiento.

```
ios/RespiroAIS/
├── RespiroAIS.bundle/           ← carpeta que se arrastra a Xcode (folder reference, azul)
│   ├── index.html               ← página mínima + puente JS↔Swift
│   ├── js/respiro-ais.js        ← componente compartido (copia de app/js)
│   └── assets/respiro/organismo.webp
├── RespiroAISView.swift         ← vista SwiftUI (WKWebView) + ejemplo «SesionAISExample»
└── README.md
```

## Pasos en Xcode (5 minutos)

1. **Arrastra `RespiroAIS.bundle`** al navegador del proyecto (por ejemplo junto a
   `Assets`). En el diálogo:
   - ✅ *Copy items if needed*
   - ✅ **Create folder references** (la carpeta se verá **azul**, no amarilla)
   - ✅ Target: *AIS APRENS* (AISCORE 2)

   Con la carpeta azul, Xcode copia el contenido tal cual en *Copy Bundle Resources*
   y se conservan las rutas relativas `js/` y `assets/` que el componente necesita.
   Compruébalo en *Target → Build Phases → Copy Bundle Resources*: debe aparecer
   `RespiroAIS.bundle`.

2. **Añade `RespiroAISView.swift`** al target (arrastrar o *File → Add Files…*).

3. **Sustituye la imagen** en la vista de la sesión AIS. Donde hoy tengas algo como:

   ```swift
   Image("ais_internal_attention")
       .resizable()
       .scaledToFit()
       .onTapGesture { … }        // o tus zonas de toque
   ```

   pon:

   ```swift
   @State private var respiroRunning = true
   …
   RespiroAISView(
       running: $respiroRunning,
       onZone: { zona in
           // zona == .cuello / .pecho / .barriga → tu lógica actual de «anchor»
       },
       onCycle: { n in /* respiraciones completadas */ }
   )
   .aspectRatio(1024.0 / 1536.0, contentMode: .fit)
   .frame(maxWidth: 360)
   .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
   ```

   `SesionAISExample` (al final del .swift) es una pantalla completa de ejemplo
   que puedes abrir en el *Preview* de Xcode.

4. **Empezar / parar** desde tus botones: cambia `respiroRunning`. El botón «Finalizar»
   de tu pantalla puede ponerlo a `false` (al desmontar la vista se para solo).

5. **Zonas.** El toque sobre la silueta se convierte en `cuello`, `pecho` o `barriga`
   (zona más cercana al anclaje; fuera del cuerpo se ignora) y se dibuja un aro breve
   en la zona tocada. Si tu pantalla ya tiene su propia capa de botones encima de la
   imagen, también puedes mantenerla y poner `.allowsHitTesting(false)` a la vista web.
   Para resaltar una zona desde Swift: `webView.evaluateJavaScript("respiro.highlight('pecho')")`
   (el ejemplo no lo expone; añade un `@Binding` si lo necesitas).

6. **Comprueba** en el simulador: la figura aparece sobre un visor oscuro, la luz azul
   entra por la nariz al inhalar y la amarilla baja desde la cabeza y se queda en el
   vientre. Si no se ve la imagen, revisa el paso 1 (carpeta azul) y que `organismo.webp`
   esté dentro del bundle instalado (*Products → .app → Show in Finder*).

## Opciones

| Parámetro | Por defecto | Notas |
|---|---|---|
| `running` (`Binding<Bool>`) | — | Arranca/para la animación. |
| `lang` | `"es"` | `"es"` / `"en"` (textos de la pastilla de fase). |
| `rhythm` | 4000 · 2000 · 6000 · 1500 ms | Ritmo de referencia del ecosistema (Protocolo ICE: inhala 4, aguanta 2, exhala 6). |
| `showControl` | `false` | Botón «Empezar/Parar» del propio componente (si prefieres no poner el tuyo). |
| `onZone` / `onCycle` / `onReady` | `nil` | Callbacks del puente. |

El fondo del WebView es transparente; el color lo pone tu vista nativa.
Respeta *Reducir movimiento* del sistema (sin estelas, solo luces).

## Mantener sincronizado con la web

Cuando cambie `app/js/respiro-ais.js` en el repositorio, vuelve a copiarlo en
`RespiroAIS.bundle/js/` (y el `.webp` si cambia) y sube la versión de la app.
`index.html` no depende de la versión del componente: solo monta y hace de puente.

## Alternativa 100 % nativa (si no quieres WebView)

El componente es deterministico: un ciclo de `inhale+anchor+exhale+pause` ms y
dos puntos que recorren una polilínea (`REALISTIC.route`, viewBox 1024×1536:
nariz `[508,235]` → cuello `[508,430]` → pecho `[516,700]` → barriga `[505,1000]`,
cerebro `[508,128]`). Se puede portar a SwiftUI con `TimelineView(.animation)` +
`Canvas` dibujando la imagen `organismo` y dos círculos con gradiente radial
(azul `#3FA6D8`, amarillo `#E9B458`) interpolando sobre esa ruta. Es más trabajo
y hay que mantener dos implementaciones; la vía WebView reutiliza la misma pieza
que la web y garantiza que la silueta signifique lo mismo en todas las apps.
