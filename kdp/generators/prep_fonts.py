#!/usr/bin/env python3
"""Convierte las woff2 de la app a TTF (para ReportLab). Reproducible desde el repo.
Uso:  python kdp/generators/prep_fonts.py   -> genera kdp/generators/.fonts/*.ttf
"""
import os
from fontTools.ttLib import TTFont
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
SRC=os.path.join(REPO,"app/tools-standalone/cuentos/assets/fonts")
OUT=os.environ.get("KDP_FONTS", os.path.join(HERE,".fonts")); os.makedirs(OUT,exist_ok=True)
# f1=Fraunces, f3=Fraunces SemiBold, f4=Nunito, f7=Nunito Bold
for f in ["f1","f3","f4","f7"]:
    t=TTFont(os.path.join(SRC,f+".woff2")); t.flavor=None
    t.save(os.path.join(OUT,f+".ttf")); print("->",os.path.join(OUT,f+".ttf"))
print("Fuentes listas en",OUT)
