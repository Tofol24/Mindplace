# Fotografías — «Honestidad emocional desde dentro»

Los archivos en `assets/images/*.webp` son **marcadores** (placeholders) en la
paleta de la herramienta. **Sustitúyelos por fotografías reales conservando el
mismo nombre de archivo, la misma proporción y las dimensiones recomendadas.**

Estilo transversal: fotografía **documental y natural**, luz suave, **emoción
contenida** (no dramatizada), personas reales, cotidianidad, vínculo y presencia.
Evita stock con sonrisas artificiales, poses corporativas, terapeutas con libreta,
llanto teatral, manos con cerebros, cabezas con engranajes, neuronas o cualquier
cliché de salud mental. Formato **WebP** (usa `srcset` si quieres versiones @1x/@2x).

---

## 1 · `portada-entrada.webp`  ·  **PORTADA**
- **Dimensiones:** 2000 × 1333 px  · **proporción:** 3:2 (horizontal). *(Opcional: versión vertical 1333×2000 para móvil vía `srcset`.)*
- **Uso:** portada a pantalla completa (`.hero`). **No** lleva `loading="lazy"` (es la primera imagen).
- **Descripción:** una persona detenida **unos segundos antes de entrar en casa o de iniciar una conversación**: en un portal, junto a una puerta o en la calle. Mirada baja o al frente, gesto sereno, sin sonrisa forzada. Luz natural de tarde. Deja **aire en la parte inferior** (ahí va el texto sobre un degradado oscuro).
- **alt:** «Una persona detenida unos segundos en la calle, antes de entrar en casa, con la mirada baja y gesto sereno.»

## 2 · `sentir-mano-pecho.webp`  ·  **SENTIR (paso 1)**
- **Dimensiones:** 1200 × 1500 px · **proporción:** 4:5 (vertical).
- **Uso:** columna de imagen del paso «Siente dónde» (`.split`).
- **Descripción:** plano cercano y **respetuoso** de una persona sentada en un contexto cotidiano con **una mano apoyada en el pecho o el abdomen**, respirando. Sin postura de meditación, sin pose. Piel y ropa reales, luz lateral suave.
- **alt:** «Plano cercano de una persona sentada con una mano apoyada sobre el pecho, respirando con calma en un espacio cotidiano.»

## 3 · `describir-textura.webp`  ·  **DESCRIBIR (paso 2)**
- **Dimensiones:** 1200 × 800 px · **proporción:** 3:2 (se usa a sangre completa). *(Si la usas de banda ancha, mejor 2000×1125.)*
- **Uso:** banda a pantalla completa con texto encima (`.band.tint`). Lleva degradado oscuro a la izquierda para legibilidad.
- **Descripción:** **macrofotografía de textura** que sugiera sensación física sin representar ninguna emoción: pliegues de tela con luz lateral, luz cálida sobre la piel, agua en movimiento, arena, madera. Debe ayudar a encontrar **lenguaje sensorial** (presión, calor, peso), no interpretar al paciente.
- **alt:** «Macrofotografía de una textura cálida —pliegues de tela con luz lateral— que sugiere presión y peso, sin representar ninguna emoción concreta.»

## 4 · `suspender-ventana.webp`  ·  **SUSPENDER EL PORQUÉ (paso 3)**
- **Dimensiones:** 2000 × 1125 px · **proporción:** 16:9 (banda ancha).
- **Uso:** banda a pantalla completa (`.band`) con degradado oscuro para el texto claro.
- **Descripción:** imagen **tranquila y abierta**: luz natural entrando por una **ventana**, o una **puerta antes de cruzarla**. Espacio sereno, sin personas o con una persona de espaldas mirando sin actitud de análisis. Nada de círculos ni gráficos.
- **alt:** «Luz natural entrando por una ventana abierta hacia un espacio tranquilo; una puerta antes de cruzarla.»

## 5 · `compartir-vinculo.webp`  ·  **COMPARTIR (paso 4)**
- **Dimensiones:** 1200 × 900 px · **proporción:** 4:3.
- **Uso:** columna de imagen del paso «Compártelo» (`.split.reverse`).
- **Descripción:** **dos personas sentadas una junto a otra** (pareja, amistad o familia) en un contexto cotidiano, conversando con calma, **sin contacto visual forzado**. Cercanía serena, escucha. **Nada de conflicto ni reconciliación teatral.**
- **alt:** «Dos personas sentadas una junto a otra en un espacio cotidiano, conversando con calma, sin contacto visual forzado.»

## 6 · `valorar-movimiento.webp`  ·  **VALORAR Y ELEGIR (paso 5)**
- **Dimensiones:** 1200 × 1500 px · **proporción:** 4:5 (vertical).
- **Uso:** columna de imagen del paso «Elige tu dirección» (`.split`).
- **Descripción:** **movimiento y dirección**: alguien caminando, **abriendo una puerta**, retomando una tarea con sentido o acercándose a otra persona. La idea es: *la sensación sigue presente, pero la persona recupera el rumbo*. Luz que invita a avanzar.
- **alt:** «Una persona caminando hacia una puerta abierta con luz al fondo, retomando el movimiento con la sensación aún presente.»

---

### Rendimiento y accesibilidad
- Exporta en **WebP** con compresión equilibrada; declara `width`/`height` (ya están en el HTML) para evitar saltos de diseño.
- Todas las imágenes llevan `alt` descriptivo y **ningún texto clínico incrustado** en la propia foto.
- La comprensión de cada consigna **no depende** de la imagen (el texto es suficiente).
- `loading="lazy"` en todas menos la portada.
