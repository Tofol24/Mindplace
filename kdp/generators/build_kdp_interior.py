#!/usr/bin/env python3
# APRENS · «Los cuentos de Nil» — KDP Interior Generator V1.1 (estructural, placeholders)
# Lee SOLO la fuente canónica content.js (cuentos + capa adulta + textos de marco, ES/CA).
# ReportLab NO contiene texto editorial: solo composición, estilos y lectura de la fuente.
import json, re, os
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
CONTENT=os.path.join(REPO,"app/tools-standalone/cuentos/assets/content.js")
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,"..",".."))
KDP=os.path.join(REPO,"kdp")
OUTDIR=os.path.join(KDP,"output"); ARTDIR=os.path.join(KDP,"art")
FONTS=os.environ.get("KDP_FONTS", os.path.join(HERE,".fonts"))
os.makedirs(OUTDIR,exist_ok=True)

# ---- dimensiones definitivas (KDP paperback cuadrado) ----
TRIM=8.5*inch; BLEED=0.125*inch; PAGE=TRIM+2*BLEED   # 8.75" doc a sangre
GUTTER=0.56*inch; OUTSIDE=0.5*inch; TB=0.5*inch       # márgenes de texto (>= mínimos KDP 0.375)
SAFE=BLEED+0.5*inch                                   # nada crítico dentro de esto (páginas a sangre)

PAPER=HexColor("#F7F6F2"); INK=HexColor("#28312F"); MUT=HexColor("#8A8F86")
SAGE=HexColor("#6F8F83"); OCRE=HexColor("#C6A66B"); CORAL=HexColor("#CE8A56")
ROJO=HexColor("#B85C52"); AZUL=HexColor("#7895A8"); LINE=HexColor("#E3DECF")
STATE_COL={"verde":SAGE,"amarillo":OCRE,"naranja":CORAL,"rojo":ROJO,"azul":AZUL}

pdfmetrics.registerFont(TTFont("Fr",os.path.join(FONTS,"f1.ttf")))
pdfmetrics.registerFont(TTFont("FrSB",os.path.join(FONTS,"f3.ttf")))
pdfmetrics.registerFont(TTFont("Nu",os.path.join(FONTS,"f4.ttf")))
pdfmetrics.registerFont(TTFont("NuB",os.path.join(FONTS,"f7.ttf")))

def ps(name,font,size,lead,color=INK,align=TA_LEFT,space=6):
    return ParagraphStyle(name,fontName=font,fontSize=size,leading=lead,textColor=color,alignment=align,spaceAfter=space)
S={"story":ps("story","Fr",13,18.5,INK,space=0),
   "p":ps("p","Fr",11,16.2,INK,space=7),
   "h":ps("h","NuB",11.5,15,SAGE,space=4),
   "idea":ps("idea","Fr",11.5,15.5,INK,space=8),
   "cell":ps("cell","Fr",9.2,12.2,INK,space=0),
   "cellh":ps("cellh","NuB",9.2,12,SAGE,space=0)}

def esc(t):
    t=t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    t=re.sub(r"\*\*(.+?)\*\*",r"<b>\1</b>",t)
    t=re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)",r"<i>\1</i>",t)
    return t.replace("\n","<br/>")
def para(text,style): return Paragraph(esc(text),style)

# ---- paginación con márgenes espejo (recto/verso) ----
class Doc:
    def __init__(self,c): self.c=c; self.n=0
    def begin(self):
        self.n+=1; bg(self.c); return self.lr()
    def lr(self):
        if self.n%2==1: L=BLEED+GUTTER; R=BLEED+OUTSIDE      # recto: gutter a la izquierda
        else:           L=BLEED+OUTSIDE; R=BLEED+GUTTER       # verso: gutter a la derecha
        return L, PAGE-R
    def end(self):
        self.c.setFillColor(MUT); self.c.setFont("Nu",8)
        self.c.drawCentredString(PAGE/2,BLEED+0.28*inch,str(self.n)); self.c.showPage()

def bg(c): c.setFillColor(PAPER); c.rect(0,0,PAGE,PAGE,fill=1,stroke=0)

def placeholder(c,x,y,w,h,label,tone=SAGE):
    c.setFillColor(HexColor("#EFEADD")); c.setStrokeColor(LINE); c.setLineWidth(1)
    c.roundRect(x,y,w,h,10,fill=1,stroke=1)
    c.setStrokeColor(tone); c.setLineWidth(2); c.setDash(4,4)
    c.roundRect(x+8,y+8,w-16,h-16,8,fill=0,stroke=1); c.setDash()
    c.setFillColor(MUT); c.setFont("NuB",11); c.drawCentredString(x+w/2,y+h/2+4,label)
    c.setFont("Nu",8); c.drawCentredString(x+w/2,y+h/2-12,"màster 1:1 (placeholder)")
def art(c,x,y,w,h,imgid,tone=SAGE):
    for e in (".png",".jpg",".webp"):
        p=os.path.join(ARTDIR,imgid+e)
        if os.path.exists(p): c.drawImage(p,x,y,w,h,preserveAspectRatio=False,mask='auto'); return
    placeholder(c,x,y,w,h,imgid,tone)
def qr_box(c,cx,cy,size,caption,fallback):
    x=cx-size/2; y=cy-size/2
    c.setFillColor(HexColor("#FFFFFF")); c.setStrokeColor(INK); c.setLineWidth(1.2)
    c.rect(x,y,size,size,fill=1,stroke=1)
    c.setFillColor(MUT); c.setFont("Nu",8); c.drawCentredString(cx,cy+2,"QR"); c.drawCentredString(cx,cy-10,"aprens.es/nil")
    c.setFillColor(INK); c.setFont("Nu",8.5); c.drawCentredString(cx,y-14,caption)
    c.setFillColor(MUT); c.setFont("Nu",8); c.drawCentredString(cx,y-27,fallback)
def dpar(c,text,style,x,y,w):
    p=para(text,style); pw,ph=p.wrap(w,10_000); p.drawOn(c,x,y-ph); return ph

# ---- flujo de texto multipágina (prólogo/apéndice) con márgenes espejo ----
class Flow:
    def __init__(self,doc,L,R):
        self.doc=doc; self.c=doc.c; self.set_lr(L,R)
        self.top=PAGE-(BLEED+TB); self.bottom=BLEED+TB; self.y=self.top
    def set_lr(self,L,R): self.x=L; self.w=R-L
    def newpage(self):
        self.doc.end(); L,R=self.doc.begin(); self.set_lr(L,R); self.y=self.top
    def block(self,fl):
        fw,fh=fl.wrap(self.w,10_000)
        if self.y-fh<self.bottom: self.newpage()
        fl.drawOn(self.c,self.x,self.y-fh); self.y-=fh
    def heading(self,t): self.y-=10; self.block(para(t.upper(),S["h"])); self.y-=4
    def paragraph(self,t): self.block(para(t,S["p"])); self.y-=7
    def quote(self,t):
        p=para(t,S["quote"] if "quote" in S else S["p"]); fw,fh=p.wrap(self.w-32,10_000); boxh=fh+20
        if self.y-boxh<self.bottom: self.newpage()
        y0=self.y-boxh
        self.c.setFillColor(HexColor("#F0EFE7")); self.c.roundRect(self.x,y0,self.w,boxh,8,fill=1,stroke=0)
        self.c.setFillColor(SAGE); self.c.rect(self.x,y0,4,boxh,fill=1,stroke=0)
        p.drawOn(self.c,self.x+16,y0+10); self.y=y0-10
    def listbox(self,items):
        inner=self.w-28; paras=[para("•  "+it,S["idea"]) for it in items]
        h=sum(p.wrap(inner,10_000)[1]+6 for p in paras)+18
        if self.y-h<self.bottom: self.newpage()
        y0=self.y-h
        self.c.setFillColor(HexColor("#F4F2EA")); self.c.setStrokeColor(LINE); self.c.setLineWidth(1)
        self.c.roundRect(self.x,y0,self.w,h,10,fill=1,stroke=1)
        yy=self.y-14
        for p in paras:
            pw,ph=p.wrap(inner,10_000); p.drawOn(self.c,self.x+14,yy-ph); yy-=ph+6
        self.y=y0-10
    def table(self,head,rows):
        data=[[para(h,S["cellh"]) for h in head]]+[[para(cell,S["cell"]) for cell in r] for r in rows]
        colw=[self.w*0.26,self.w*0.34,self.w*0.40]
        t=Table(data,colWidths=colw)
        t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),
            ("LINEBELOW",(0,0),(-1,0),0.8,SAGE),("LINEBELOW",(0,1),(-1,-2),0.4,LINE),
            ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
            ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),6)]))
        fw,fh=t.wrap(self.w,10_000)
        if self.y-fh<self.bottom: self.newpage()
        t.drawOn(self.c,self.x,self.y-fh); self.y-=fh+8

def render_blocks(flow,blocks):
    for b in blocks:
        t=b["t"]
        if t=="h": flow.heading(b["text"])
        elif t=="p": flow.paragraph(b["text"])
        elif t=="quote": flow.quote(b["text"])
        elif t=="list": flow.listbox(b["items"])
        elif t=="table": flow.table(b["head"],b["rows"])

def build(lang):
    C=CONTENT_OBJ; ui=C["ui"][lang]; adult=C["adult"][lang]; F=C["frame"][lang]
    out=f"{OUTDIR}/APRENS-Nil-interior-{lang.upper()}-V1_1.pdf"
    c=canvas.Canvas(out,pagesize=(PAGE,PAGE)); doc=Doc(c)
    finalKick="APRENS · "+ui["hubTitle"]

    # 1) Portadilla
    L,R=doc.begin()
    c.setFillColor(SAGE); c.setFont("NuB",12); c.drawCentredString(PAGE/2,PAGE*0.62+40,ui["hubKick"].upper())
    c.setFillColor(INK); c.setFont("FrSB",34); c.drawCentredString(PAGE/2,PAGE*0.54,ui["hubTitle"])
    c.setFillColor(MUT); c.setFont("Fr",13); c.drawCentredString(PAGE/2,PAGE*0.54-28,ui["sub"]); doc.end()
    # 2) Créditos
    L,R=doc.begin(); ty=PAGE*0.5+40
    for line in F["credits"]:
        c.setFillColor(INK); c.setFont("Nu",10); c.drawCentredString(PAGE/2,ty,line); ty-=16
    doc.end()
    # 3) Prólogo
    L,R=doc.begin()
    c.setFillColor(SAGE); c.setFont("NuB",11); c.drawString(L,PAGE-(BLEED+TB)+8,F["prologueHead"].upper())
    fl=Flow(doc,L,R); fl.y=PAGE-(BLEED+TB)-8; render_blocks(fl,adult["prologue"]); doc.end()
    # 4) La ventana + QR#1
    L,R=doc.begin()
    c.setFillColor(INK); c.setFont("FrSB",24); c.drawString(L,PAGE-(BLEED+TB),F["ventanaTitle"])
    dpar(c,F["ventanaLead"],S["p"],L,PAGE-(BLEED+TB)-26,R-L)
    sw=(R-L-4*10)/5; sy=PAGE*0.52
    for i,(k,lab) in enumerate(ui["states"]):
        x=L+i*(sw+10); c.setFillColor(STATE_COL.get(k,SAGE)); c.roundRect(x,sy,sw,sw*0.7,6,fill=1,stroke=0)
        c.setFillColor(INK); c.setFont("Nu",8); c.drawCentredString(x+sw/2,sy-12,lab)
    qr_box(c,PAGE/2,BLEED+1.15*inch,1.1*inch,F["qr1"],F["qrFallback"]); doc.end()
    # 5) Cuentos — SISTEMA EDITORIAL V1 (congelado):
    #    · La ilustración conserva SIEMPRE su 1:1 completo (nunca crop).
    #    · 6,9" es el tamaño máximo; se reduce SOLO lo que el texto necesite.
    #    · El texto mantiene cuerpo/interlineado/márgenes; nunca se encoge la tipografía.
    #    · La zona de texto continúa la ilustración: mismo papel, sin caja ni pie de foto.
    #    · Mínimo razonable con AVISO: por debajo es problema de composición, no de escala.
    AMAX=6.9*inch; ATOP=BLEED+0.5*inch; ABOT=BLEED+0.55*inch; AGAP=0.34*inch
    STORY_MIN=5.0*inch; CLOSE_MIN=3.6*inch
    hstyle=ps("ch","NuB",11,15,SAGE); fstyle=ps("cf","FrSB",15,20,AZUL)
    def th(txt,style,w): return para(txt,style).wrap(w,20_000)[1]
    def fit_side(blocks,amin):
        # blocks: [(txt,style,gap)] ; devuelve lado del cuadrado (<=AMAX) que deja
        # respirar todo el texto dentro de [ATOP..ABOT]; avisa si baja del mínimo.
        avail=PAGE-ATOP-ABOT; side=AMAX
        while side>=amin:
            tot=sum(th(t,s,side)+g for t,s,g in blocks)
            if side+AGAP+tot<=avail: return side,False
            side-=0.05*inch
        return amin,True
    def compose(imgid, blocks, amin):
        L,R=doc.begin()
        side,warn=fit_side(blocks,amin)
        if warn: print(f"  AVISO {imgid}: el texto no respira a min {amin/inch:.2f}\" (revisar composicion)")
        ax=(PAGE-side)/2; ay=PAGE-ATOP-side
        art(c,ax,ay,side,side,imgid)                 # cuadrado 1:1 completo, centrado
        yy=ay-AGAP                                   # texto como continuacion (sin caja)
        for t,s,g in blocks:
            used=dpar(c,t,s,ax,yy,side); yy-=used+g
        doc.end()
    for cid in C["order"]:
        b=C["books"][cid][lang]; story=b["story"]; last=len(story)+1
        # portada interior del cuento: APERTURA EDITORIAL PROPIA (sin escena narrativa).
        # No consume ni repite ninguna ilustracion p01-p15: titulo + identificacion +
        # motivo discreto del universo de Nil (linea de metro con 5 estaciones = colores
        # de la ventana de capacidad, verde->azul). Asi las 99 ilustraciones quedan
        # reservadas integramente para las escenas narrativas.
        doc.begin(); cx=PAGE/2
        c.setFillColor(MUT); c.setFont("NuB",12)
        c.drawCentredString(cx,PAGE*0.72,f"{ui['hubTitle'].upper()}   ·   {ui['cuentoLabel'].upper()} {C['order'].index(cid)+1}")
        cts=ps("cvt","FrSB",30,36,INK,align=TA_CENTER); cw=PAGE*0.78
        pw,ph=para(b["title"],cts).wrap(cw,5*inch); para(b["title"],cts).drawOn(c,(PAGE-cw)/2,PAGE*0.60-ph)
        css=ps("cvs","Nu",13,17,MUT,align=TA_CENTER)
        para(b["situacion"],css).drawOn(c,(PAGE-cw)/2,PAGE*0.60-ph-26)
        lw=3.2*inch; ly=PAGE*0.40; lx0=cx-lw/2
        c.setStrokeColor(LINE); c.setLineWidth(2); c.setLineCap(1); c.line(lx0,ly,lx0+lw,ly)
        cols=[SAGE,OCRE,CORAL,ROJO,AZUL]
        for k,col in enumerate(cols):
            sx=lx0+lw*k/(len(cols)-1)
            c.setFillColor(PAPER); c.setStrokeColor(col); c.setLineWidth(2.6); c.circle(sx,ly,5.6,fill=1,stroke=1)
        doc.end()
        # escenas: cuadrado adaptativo + texto continuacion
        for i,txt in enumerate(story):
            compose(f"{cid}-p{str(i+1).zfill(2)}", [(txt,S["story"],0)], STORY_MIN)
        # cierre: cuadrado adaptativo + recap (head + ideas + frase) como continuacion
        recap=[(b["head"].upper(),hstyle,16)]+[("•  "+it,S["idea"],8) for it in b["ideas"]]+[(b["frase"],fstyle,0)]
        compose(f"{cid}-p{str(last).zfill(2)}", recap, CLOSE_MIN)
    # 6) Transición
    L,R=doc.begin(); c.setFillColor(INK); c.setFont("FrSB",22); c.drawString(L,PAGE*0.6,F["transTitle"])
    dpar(c,F["trans"],S["p"],L,PAGE*0.6-26,R-L); doc.end()
    # 7) ¿Y a mí? + QR#2
    L,R=doc.begin(); c.setFillColor(INK); c.setFont("FrSB",24); c.drawString(L,PAGE-(BLEED+TB),F["yamiTitle"])
    dpar(c,F["yamiIntro"],S["p"],L,PAGE-(BLEED+TB)-26,R-L)
    ly=PAGE*0.60
    for _ in range(7):
        c.setStrokeColor(LINE); c.setLineWidth(0.8); c.line(L,ly,R,ly); ly-=0.42*inch
    qr_box(c,PAGE/2,BLEED+1.1*inch,1.1*inch,F["qr2"],F["qrFallback"]); doc.end()
    # 8) Apéndice
    L,R=doc.begin(); c.setFillColor(SAGE); c.setFont("NuB",11); c.drawString(L,PAGE-(BLEED+TB)+8,F["appendixHead"].upper())
    fl=Flow(doc,L,R); fl.y=PAGE-(BLEED+TB)-8; render_blocks(fl,adult["appendix"]); doc.end()
    # 9) Final + QR#3
    L,R=doc.begin(); c.setFillColor(SAGE); c.setFont("NuB",11); c.drawCentredString(PAGE/2,PAGE*0.64,finalKick.upper())
    dpar(c,F["qr3Title"],ps("fin","FrSB",22,27,INK,align=TA_CENTER),PAGE*0.15,PAGE*0.58,PAGE*0.7)
    qr_box(c,PAGE/2,PAGE*0.34,1.3*inch,F["qr3Sub"],F["qrFallback"]); doc.end()
    c.save(); return out,doc.n

_t=open(CONTENT,encoding="utf-8").read()
CONTENT_OBJ=json.loads(_t[_t.index("{"):_t.rstrip().rstrip(";").rindex("}")+1])
if __name__=="__main__":
    for lang in ("es","ca"):
        out,pages=build(lang); print(f"{lang.upper()}: {out}  ({pages} páginas)")
