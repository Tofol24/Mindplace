# APRENS · Cuentos — PIPELINE «UN MÁSTER → DOS SALIDAS» · V1 (CONGELADO)

## Regla de gobierno
Existe **una sola colección de ilustraciones maestras** (objetivo: 99 = 7 cuentos).
De cada máster salen **dos derivados automáticos**. Nunca se regenera la escena
para un soporte distinto: **un solo Nil, una sola dirección visual**, en papel y en pantalla.

```
SOURCE 1254² (aprobado en ImageGen)
   │  EDSR ×4  (build_master_edsr.py)
   ▼
MÁSTER-HR 5016²  (cX-pNN)
   ├── PRINT → kdp/art/master/cX-pNN.png     5016×5016  (imprenta KDP, gitignored)
   └── WEB   → app/tools-standalone/cuentos/img/cX-pNN.webp   ~1400 px  (PWA, versionado)
```

## El texto NO es parte de la imagen
- Toda la narrativa y los cierres viven en `content.js` (ES + CA).
- La ilustración es **muda**: sin bocadillos, sin rótulos, sin pseudotexto.
- Si una generación trae texto incrustado (p. ej. un bocadillo), **se elimina antes de derivar**.

## Parámetros congelados
| Salida | Formato | Tamaño | Ajuste |
|---|---|---|---|
| PRINT | PNG | 5016×5016 | EDSR ×4 desde SOURCE 1254² (= 590 ppi @ 8,5") |
| WEB | WebP | lado mayor 1400 px | quality 82, method 6 (~200 KB/imagen) |

## Cómo se produce un cuento
```
# 1) EDSR de cada SOURCE -> MASTER-HR (a un dir de trabajo, p.ej. $MASTERS)
python3 kdp/generators/build_master_edsr.py SOURCE/c1-p01.png $MASTERS/c1-p01_masterHR.png
# 2) derivar las dos salidas desde los masters
MASTERS_DIR=$MASTERS python3 kdp/generators/derive_outputs.py --only c1
```
`derive_outputs.py` copia el máster a `kdp/art/master/` (fuente del interior KDP)
y escribe el WebP ligero en la carpeta que sirve la PWA.

## Al reemplazar imágenes en vivo (WEB)
Las ilustraciones se sirven desde la caché **bajo demanda** `aprens-cuentos-v1`.
Al sustituir un lote de `cX-pNN.webp` con el mismo nombre, **subir la versión de esa
caché** (`aprens-cuentos-v1` → `-v2`) en `sw.js` para que los clientes instalados
reciban el arte nuevo. El shell (`aprens-vNNN`) solo se sube si cambian HTML/CSS/JS.

## Uso doble por escena en el cuento digital
Cada pantalla del lector = **ilustración (WEB) + texto (content.js)**.
El **nicho** de la esquina superior derecha es la única señal de la ventana de
capacidad (🟢→🟡→🟠→🔴→🔵→🟢). **Sin semáforos, indicadores ni gamificación.**

---

## ⚠️ RESILIENCIA — el entorno remoto es efímero
El contenedor se reinicia por inactividad y **borra todo lo que no está en git**:
scratchpad, `/tmp`, los uploads de la sesión (`/root/.claude/uploads`), los masters
5016² y el modelo EDSR. **Ya nos pasó una vez** (se perdieron 15 masters + 15 sources).

Reglas para no volver a perder trabajo:
1. **Los SOURCE 1254² son el insumo irreemplazable** (vienen de ImageGen, no
   deterministas). En cuanto se aprueban, **guardarlos en el repo** como semilla:
   `kdp/art/source/cX-pNN.png` (o `.webp` q95). Es lo único que no se puede regenerar.
2. **Derivar y commitear el WEB webp en cuanto exista** (es pequeño y es el entregable
   vivo de la app). No dejarlo solo en disco.
3. Los **masters 5016² sí son regenerables** por EDSR desde los SOURCE (~5–12 min/img);
   pueden quedar gitignored y reconstruirse justo antes del print run.
4. Commit **frecuente** por lotes; no acumular horas de trabajo sin commit.
