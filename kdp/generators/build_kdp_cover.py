#!/usr/bin/env python3
# APRENS · «Los cuentos de Nil» — COVER SYSTEM V1 (wrap paramétrico, placeholders)
# Genera el wrap completo (contraportada + lomo + portada) para paperback KDP, ES y CA.
# Lee title/sub/estados de content.js. El blurb de contra es provisional (a canonizar tras revisión).
import json, os
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
CONTENT=os.path.join(REPO,"app/tools-standalone/cuentos/assets/content.js")
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
KDP=os.path.join(REPO,"kdp")
OUTDIR=os.path.join(KDP,"output"); ARTDIR=os.path.join(KDP,"art")
FONTS=os.environ.get("KDP_FONTS", os.path.join(HERE,".fonts"))
os.makedirs(OUTDIR,exist_ok=True)

# ---- parámetros físicos (paperback premium color) ----
TRIM=8.5*inch; BLEED=0.125*inch
PAGES=119                 # nº de páginas del interior (provisional hasta el interior V2)
PPI_PREMIUM=0.002347      # grosor por página, KDP premium color (in/página)
SPINE=PAGES*PPI_PREMIUM*inch
H=TRIM+2*BLEED
W=2*BLEED+2*TRIM+SPINE
SAFE=0.25*inch            # zona segura interior de cada panel

PAPER=HexColor("#F7F6F2"); INK=HexColor("#28312F"); MUT=HexColor("#8A8F86")
SAGE=HexColor("#6F8F83"); OCRE=HexColor("#C6A66B"); CORAL=HexColor("#CE8A56")
ROJO=HexColor("#B85C52"); AZUL=HexColor("#7895A8"); LINE=HexColor("#E3DECF")
STATES=[SAGE,OCRE,CORAL,ROJO,AZUL]

pdfmetrics.registerFont(TTFont("Fr",os.path.join(FONTS,"f1.ttf")))
pdfmetrics.registerFont(TTFont("FrSB",os.path.join(FONTS,"f3.ttf")))
pdfmetrics.registerFont(TTFont("Nu",os.path.join(FONTS,"f4.ttf")))
pdfmetrics.registerFont(TTFont("NuB",os.path.join(FONTS,"f7.ttf")))

# blurb provisional (a canonizar en content.js frame tras tu revisión)
BLURB={
 "es":{"author":"Cristòfol Villalonga · APRENS",
   "back":"Siete historias para acompañar los momentos en que todo se hace demasiado. Nil no aprende a «portarse bien»: aprende a reconocer cuánto espacio le queda por dentro para pensar, escuchar y elegir —y a pedir ayuda para recuperarlo.",
   "back2":"Para leer en calma, acompañando. Incluye «¿Y a mí qué me pasa?» para hacer tu propio mapa.",
   "spine":"Los cuentos de Nil"},
 "ca":{"author":"Cristòfol Villalonga · APRENS",
   "back":"Set històries per acompanyar els moments en què tot es fa massa. En Nil no aprèn a «portar-se bé»: aprèn a reconèixer quant espai li queda per dins per pensar, escoltar i triar —i a demanar ajuda per recuperar-lo.",
   "back2":"Per llegir amb calma, acompanyant. Inclou «I a mi què em passa?» per fer el teu propi mapa.",
   "spine":"Els contes d'en Nil"},
}

def para(c,text,style,x,y,w):
    p=Paragraph(text,style); pw,ph=p.wrap(w,10_000); p.drawOn(c,x,y-ph); return ph

def build(lang):
    C=CONTENT_OBJ; ui=C["ui"][lang]; F=C["frame"][lang]
    B={"back":F["blurb"][0],"back2":F["blurb"][1],"author":F["author"],"spine":ui["hubTitle"]}
    out=f"{OUTDIR}/APRENS-Nil-cover-{lang.upper()}-V1.pdf"
    c=canvas.Canvas(out,pagesize=(W,H))
    # límites de paneles (x)
    back_x0=BLEED; back_x1=BLEED+TRIM
    spine_x0=back_x1; spine_x1=back_x1+SPINE
    front_x0=spine_x1; front_x1=spine_x1+TRIM
    # fondo global papel
    c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)

    # ---------- PORTADA (front) ----------
    art=None
    for e in (".png",".jpg",".webp"):
        p=os.path.join(ARTDIR,"cover-front"+e)
        if os.path.exists(p): art=p; break
    fx0=front_x0-0  # el arte sangra por la derecha y arriba/abajo
    if art:
        c.drawImage(art,front_x0-0,0,TRIM+BLEED,H,preserveAspectRatio=False,mask='auto')
    else:
        c.setFillColor(HexColor("#Dfe4df")); c.rect(front_x0,0,TRIM+BLEED,H,fill=1,stroke=0)
        c.setStrokeColor(SAGE); c.setLineWidth(2); c.setDash(6,6)
        c.roundRect(front_x0+SAFE,SAFE,TRIM-SAFE,H-2*SAFE,10,fill=0,stroke=1); c.setDash()
        c.setFillColor(MUT); c.setFont("NuB",12)
        c.drawCentredString(front_x0+TRIM/2,H*0.62,"ILUSTRACIÓN DE PORTADA")
        c.setFont("Nu",9); c.drawCentredString(front_x0+TRIM/2,H*0.62-16,"cover-front · máster (Nil + mapas + ventana)")
    # scrim inferior translúcido para legibilidad del texto sobre el arte
    c.saveState()
    c.setFillColor(HexColor("#111716")); c.setFillAlpha(0.60)
    c.rect(front_x0,0,TRIM+BLEED,H*0.36,fill=1,stroke=0)
    c.restoreState()
    # textos portada
    tx=front_x0+SAFE
    c.setFillColor(HexColor("#FFFFFF")); c.setFont("NuB",11)
    c.drawString(tx,H*0.30,ui["hubKick"].upper())
    c.setFont("FrSB",40);
    para(c,ui["hubTitle"],ParagraphStyle("t",fontName="FrSB",fontSize=40,leading=42,textColor=HexColor("#FFFFFF")),tx,H*0.28,TRIM-2*SAFE)
    c.setFont("Fr",14); c.setFillColor(HexColor("#FFFFFFEE"))
    c.drawString(tx,H*0.10,ui["sub"])
    c.setFont("NuB",11); c.setFillColor(HexColor("#FFFFFFCC"))
    c.drawString(tx,H*0.10-20,B["author"])

    # ---------- LOMO (spine) ----------
    c.setFillColor(INK); c.rect(spine_x0,0,SPINE,H,fill=1,stroke=0)
    # texto del lomo: acotado a la anchura del lomo (KDP pide >=0.0625" de holgura por lado)
    spine_pt=SPINE/inch*72
    fs=max(7.0, min(10.0, spine_pt-9))   # deja ~4.5pt de holgura por lado
    if spine_pt>=9:
        c.saveState()
        c.translate(spine_x0+SPINE/2,H/2); c.rotate(90)
        c.setFillColor(HexColor("#FFFFFF")); c.setFont("FrSB",fs)
        c.drawCentredString(-TRIM*0.06, -fs*0.34, B["spine"])
        c.setFillColor(HexColor("#FFFFFFAA")); c.setFont("NuB",fs*0.8)
        c.drawCentredString(TRIM*0.40, -fs*0.30, "APRENS")
        c.restoreState()

    # ---------- CONTRAPORTADA (back) ----------
    bx=back_x0+SAFE; bw=TRIM-2*SAFE
    c.setFillColor(CORAL); c.setFont("NuB",11); c.drawString(bx,H-SAFE-14,ui["hubKick"].upper())
    c.setFillColor(INK)
    y=H-SAFE-40
    y-=para(c,B["back"],ParagraphStyle("b",fontName="Fr",fontSize=13,leading=18.5,textColor=INK),bx,y,bw)+14
    y-=para(c,B["back2"],ParagraphStyle("b2",fontName="Fr",fontSize=11,leading=16,textColor=HexColor("#5c645f")),bx,y,bw)+18
    # ventana (5 estados)
    sw=(bw-4*10)/5
    for i,col in enumerate(STATES):
        x=bx+i*(sw+10); c.setFillColor(col); c.roundRect(x,y-sw*0.72,sw,sw*0.72,6,fill=1,stroke=0)
    y-=sw*0.72+24
    # logo APRENS (placeholder) + url
    c.setFillColor(INK); c.setFont("NuB",13); c.drawString(bx,BLEED+1.25*inch,"APRENS")
    c.setFillColor(MUT); c.setFont("Nu",10); c.drawString(bx,BLEED+1.25*inch-16,"aprens.es/nil")
    # zona reservada código de barras KDP (~2 x 1.2 in, esquina inferior derecha de la contra)
    bcw,bch=2.0*inch,1.2*inch
    bcx=back_x1-SAFE-bcw; bcy=BLEED+0.30*inch
    c.setFillColor(HexColor("#FFFFFF")); c.setStrokeColor(LINE); c.setLineWidth(1)
    c.rect(bcx,bcy,bcw,bch,fill=1,stroke=1)
    c.setFillColor(MUT); c.setFont("Nu",8); c.drawCentredString(bcx+bcw/2,bcy+bch/2,"zona ISBN / código de barras (KDP)")

    # ---------- guías (fuera de sangre, informativas) ----------
    c.setStrokeColor(HexColor("#00000022")); c.setLineWidth(0.5); c.setDash(3,3)
    for gx in (spine_x0,spine_x1):  # límites de lomo
        c.line(gx,0,gx,H)
    c.setDash()
    c.save(); return out

_t=open(CONTENT,encoding="utf-8").read()
CONTENT_OBJ=json.loads(_t[_t.index("{"):_t.rstrip().rstrip(";").rindex("}")+1])
if __name__=="__main__":
    print(f"wrap: {W/inch:.3f}×{H/inch:.3f} in | lomo {SPINE/inch:.3f} in ({PAGES} pág · premium color)")
    for lang in ("es","ca"):
        print(lang.upper(),"->",build(lang))
