#!/usr/bin/env python3
"""
APRENS · Cuentos — Derivador de salidas desde el MASTER único.
REGLA CONGELADA: una sola colección de ilustraciones maestras -> dos salidas.
  PRINT: kdp/art/master/<cX-pNN>.png   (5016x5016, imprenta KDP)
  WEB:   app/tools-standalone/cuentos/img/<cX-pNN>.webp (~1400 px, PWA)
El TEXTO nunca va en la imagen: vive en content.js (ES/CA), se compone en HTML/PDF.
Uso:  python3 derive_outputs.py [--web-size 1400] [--only c1] [--src DIR]
      SRC = carpeta con *_masterHR.png (por defecto scratchpad de la sesion).
"""
import os, argparse, glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
MASTER_DIR = os.path.join(REPO, "kdp", "art", "master")
WEB_DIR    = os.path.join(REPO, "app", "tools-standalone", "cuentos", "img")

def derive(src_dir, web_size, only):
    os.makedirs(MASTER_DIR, exist_ok=True); os.makedirs(WEB_DIR, exist_ok=True)
    masters = sorted(glob.glob(os.path.join(src_dir, "*_masterHR.png")))
    n_web = n_print = 0
    for m in masters:
        base = os.path.basename(m).replace("_masterHR.png", "")  # c1-p01
        if only and not base.startswith(only): continue
        im = Image.open(m).convert("RGB")
        pt = os.path.join(MASTER_DIR, base + ".png")
        if os.path.abspath(m) != os.path.abspath(pt):
            im.save(pt); n_print += 1
        w = im.copy(); w.thumbnail((web_size, web_size), Image.LANCZOS)
        w.save(os.path.join(WEB_DIR, base + ".webp"), "WEBP", quality=82, method=6)
        n_web += 1
        print(f"  {base}: WEB {w.size[0]}px webp  +  PRINT {im.size[0]}px png")
    print(f"Hecho. WEB={n_web}  PRINT={n_print}  (web_size={web_size})")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--web-size", type=int, default=1400)
    ap.add_argument("--only", default="")
    ap.add_argument("--src", default=os.path.join(os.environ.get("MASTERS_DIR",""),) if os.environ.get("MASTERS_DIR") else "")
    a = ap.parse_args()
    src = a.src or os.path.join(REPO, "kdp", "art", "master")
    derive(src, a.web_size, a.only)
