# APRENS · «Los cuentos de Nil» — Sistema de edición KDP

**Estado: `LIBRO PROVISIONAL COMPLETO · V1 — FROZEN` ✅**
99/99 ilustraciones + `cover-front` · ES/CA · 119 pp · paperback cuadrado 8.5", premium color.

Este directorio es el **sistema reproducible** para construir la edición física (Amazon KDP) del libro. Si esta sesión desaparece, el libro puede reconstruirse desde aquí.

## Principios
- **`app/tools-standalone/cuentos/assets/content.js` es la ÚNICA autoridad textual** (ES+CA): cuentos, capa adulta, textos de marco y copy de cubierta. Los `.md` de `docs/` son documentos humanos; el texto canónico vive en `content.js`.
- **Los generadores NO contienen copy editorial**: solo composición, estilos y lectura de la fuente.
- **Arte** (99 + cubierta) con nombres `cX-pNN.png` / `cover-front.png` en `art/` (ver `art/README.md`). Drop-in: al colocarlos, los generadores sustituyen los placeholders **sin re-paginar**.

## Reproducir
```bash
pip install reportlab fonttools brotli pymupdf pillow
python kdp/generators/prep_fonts.py          # woff2 -> ttf (kdp/generators/.fonts)
python kdp/generators/build_kdp_interior.py  # -> kdp/output/APRENS-Nil-interior-{ES,CA}-V1_1.pdf
python kdp/generators/build_kdp_cover.py     # -> kdp/output/APRENS-Nil-cover-{ES,CA}-V1.pdf
```

## Próxima puerta de control
**`C1 HIGH-RES → PRINT TEST`**: con el primer lote definitivo en alta, verificar resolución real (≥300 ppp a 8.5"), 1:1, sangrado, caja segura, ausencia de etiquetas/glifos y comportamiento de la ventana al tamaño de impresión. Si C1 pasa, el resto es control de producción.

Después: másters definitivos → `aprens.es/nil` → QR reales → créditos/ISBN → Interior V2 + wrap → preflight → archivos ES/CA de publicación.

## ⚠️ Parámetros KDP = PROVISIONALES
Trim 8.5", bleed 0.125", gutter/exterior 0.375", lomo (119 pp × 0.002347"/pág premium color) ≈ 0.279". **Antes del preflight definitivo, verificar contra las especificaciones KDP vigentes** (bleed, márgenes/gutter, ancho exacto del lomo, zona de código de barras, requisitos del PDF). No depender de estos valores asumidos.

## Estructura
```
kdp/
├── README.md
├── generators/  build_kdp_interior.py · build_kdp_cover.py · prep_fonts.py
├── docs/        NIL-VISUAL-BIBLE · PRODUCTION-PACK-99 · SAFE-REGISTER · ADULT-LAYER-ES · ADULT-LAYER-CA (FROZEN)
├── art/         másters 1:1 (gitignored)  — ver art/README.md
└── output/      PDFs generados (gitignored)
```
