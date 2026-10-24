#!/usr/bin/env python3
"""
APRENS · Índice de escritorio de todos los HTML del repositorio.

Genera `escritorio/APRENS-indice.html`: una sola página, sin dependencias, para
guardar en el escritorio y encontrar cualquier herramienta (publicada en
Netlify o no) por categoría, buscador, público y favoritos.

Fuentes (para no mantener listas a mano):
  · app/js/registry.js   → nombre, emoji y descripción de cada herramienta
  · app/js/app.js        → grupos del hub (el mismo orden que ven los pacientes)
  · los propios .html    → <title> y <meta description> de lo que no está en el registro
  · EXTRA (abajo)        → lo que vive fuera del hub (profesional, gestión, otras apps)
Cualquier HTML que no encaje en nada cae en «Sin clasificar», así no se pierde ninguno.

Uso:
  python3 scripts/indice-escritorio.py              # genera el índice
  python3 scripts/indice-escritorio.py --comprobar  # además comprueba qué está publicado
"""
import glob, html, json, os, re, subprocess, sys, urllib.request, urllib.error
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "escritorio", "APRENS-indice.html")
APP_URL = "https://aprens-app.netlify.app/"
REPO = "https://github.com/tofol24/mindplace/blob/"

# Webs de Netlify fuera de la app (carpeta del repo → URL publicada).
SITIOS = {
    "inicio/": "https://aprens-inicio.netlify.app/",
    "agendas/": "https://aprens-agendas.netlify.app/",
    "despatxos/": "https://despatxos.netlify.app/",  # interna
}

# Lo que no está en el hub del paciente o necesita otra etiqueta.
# cat: categoría · pub: "paciente" | "profesional" | "centro"
EXTRA = {
    "app/index.html": dict(cat="entradas", emoji="📱", nombre="App APRENS (hub del paciente)",
        desc="La app instalable: todas las herramientas con un único registro por paciente. Es el enlace que se da a los pacientes.", pub="paciente"),
    "inicio/index.html": dict(cat="entradas", emoji="🏠", nombre="Mi espacio APRENS",
        desc="Portada de entrada para pacientes: recorrido, materiales y accesos a la app.", pub="paciente"),
    "app/panel/index.html": dict(cat="entradas", emoji="🩺", nombre="Panel del psicólogo",
        desc="Importar los .json de los pacientes y ver su evolución L/D/C. Datos cifrados en tu dispositivo.", pub="profesional"),
    "app/tools-standalone/dinamicas-tec-8-12.html": dict(cat="profesional", emoji="📘", nombre="Dinámicas TEC para sesión · 8–12 años",
        desc="Guía de consulta: 16 dinámicas psicoeducativas con filtros por etapa, edad y perfil, sesión tipo, familia y seguridad.", pub="profesional"),
    "app/tools-standalone/protocolo-tdah.html": dict(cat="profesional", emoji="🧩", nombre="Protocolo de valoración TDAH",
        desc="Orientador clínico TDAH para profesionales.", pub="profesional"),
    "app/tools-standalone/bateria-neuropsicologica.html": dict(cat="profesional", emoji="🧠", nombre="Batería neuropsicológica",
        desc="Batería para profesionales; los cuadernos de estímulos los carga cada profesional en su navegador.", pub="profesional"),
    "app/pareja/panel.html": dict(cat="profesional", emoji="💞", nombre="Mapa clínico de pareja · panel profesional",
        desc="Lectura profesional de la evaluación de pareja.", pub="profesional"),
    "app/pareja/index.html": dict(cat="otras", emoji="💞", nombre="Mapa de pareja · portada",
        desc="Entrada al mapa de pareja.", pub="paciente"),
    "app/bienestar/index.html": dict(cat="otras", emoji="⚓", nombre="Anclado en mí · bienestar emocional",
        desc="Plan diario de bienestar emocional, hábitos e inteligencia emocional.", pub="paciente"),
    "app/bienestar/privacidad.html": dict(cat="otras", emoji="📄", nombre="Anclado en mí · política de privacidad",
        desc="Texto legal de la app Anclado en mí.", pub="paciente"),
    "app/formentor-flow/index.html": dict(cat="otras", emoji="⛰️", nombre="Formentor Flow · Manager",
        desc="PWA de cliente de Formentor Flow.", pub="paciente"),
    "app/formentor-flow/exploracion/index.html": dict(cat="otras", emoji="⛰️", nombre="Formentor Flow · exploración inicial",
        desc="Cuestionario de exploración inicial de Formentor Flow.", pub="paciente"),
    "app/tools-standalone/guia-alerta.html": dict(cat="otras", emoji="▶️", nombre="Cómo funciona esta herramienta (alerta)",
        desc="Presentación animada de la herramienta de cuerpo en alerta.", pub="paciente"),
    "app/tools-standalone/historia-alerta.html": dict(cat="otras", emoji="🎬", nombre="Por qué mi cuerpo sigue en alerta",
        desc="Historia animada que acompaña a «Cuando el cuerpo sigue en alerta».", pub="paciente"),
    "app/tools-standalone/c-8fc7c69d856f.html": dict(cat="privado", emoji="🔒", nombre="Cuestionario privado (cifrado)",
        desc="Material individual cifrado: solo se abre con su código de acceso. El código no está en ningún archivo.", pub="profesional"),
    "agendas/index.html": dict(cat="centro", emoji="📅", nombre="Agendas · reserva tu cita",
        desc="Reservas de cita con cada profesional (Cal.com).", pub="centro"),
    "despatxos/index.html": dict(cat="centro", emoji="🚪", nombre="Despatxos i comissions",
        desc="Gestión interna de los 5 despachos y de la comisión por servicio. Sin datos de pacientes.", pub="centro"),
    "ios/RespiroAIS/RespiroAIS.bundle/index.html": dict(cat="otras", emoji="📲", nombre="Respiro AIS (app iOS)",
        desc="Página interna de la app nativa de iOS; no es una web.", pub="paciente", nativo=True),
}
# Herramientas del registro que el hub deja en «Otras» y aquí van a profesional.
REG_A_PROFESIONAL = {"evaluacion_trauma", "dolor_cronico", "mapa_pareja"}

CATS = [
    ("favoritos", "⭐", "Favoritos", "Lo que más usas. Marca la estrella de cualquier tarjeta."),
    ("entradas", "🚪", "Entradas principales", "Las puertas de entrada: la app del paciente, su espacio y tu panel."),
    ("profesional", "🩺", "Para el psicólogo/a", "Evaluación, protocolos y guías de sesión. No son para dar a pacientes, salvo los cuestionarios que se responden desde el móvil."),
    # aquí se insertan los grupos del hub (app.js) en su orden
    ("otras", "🧩", "Otras apps y piezas", "Apps aparte y piezas que no salen en el hub."),
    ("centro", "🏢", "Gestión del centro", "Herramientas internas de APRENS."),
    ("privado", "🔒", "Material privado", "Enlaces individuales cifrados."),
    ("sinclasificar", "❓", "Sin clasificar", "HTML nuevos que todavía no tienen sitio en este índice."),
    ("antiguas", "🗄️", "Webs antiguas (redirecciones)", "Direcciones de Netlify anteriores a la app. Hoy muestran un aviso y llevan a la herramienta dentro de la app."),
]


def leer(p):
    with open(os.path.join(ROOT, p), encoding="utf-8", errors="ignore") as f:
        return f.read()


def slug(s):
    s = s.lower()
    for a, b in zip("áéíóúàèìòùüñç·", "aeiouaeiouunc-"):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def js_str(s):
    return json.loads('"' + s + '"')


def registro():
    s = leer("app/js/registry.js")
    out = {}
    for m in re.finditer(r'\{\s*id:"([a-z_0-9]+)",\s*emoji:"([^"]*)",\s*nombre:"([^"]*)",\s*desc:"((?:[^"\\]|\\.)*)"(.*?)\}', s, re.S):
        rest = m.group(5)
        ifr = re.search(r'iframe:"([^"]*)"', rest)
        out[m.group(1)] = dict(id=m.group(1), emoji=js_str(m.group(2)), nombre=js_str(m.group(3)),
                               desc=js_str(m.group(4)), path=("app/" + ifr.group(1)) if ifr else None)
    return out


def grupos():
    s = leer("app/js/app.js")
    blk = s.split("const GRUPOS = [")[1].split("];")[0]
    out = []
    for m in re.finditer(r'\{\s*emoji:"([^"]*)",\s*label:"([^"]*)",\s*desc:"((?:[^"\\]|\\.)*)".*?ids:\[([^\]]*)\]', blk, re.S):
        ids = re.findall(r'"([a-z_0-9]+)"', m.group(4))
        out.append(dict(emoji=m.group(1), label=m.group(2), desc=js_str(m.group(3)), ids=ids))
    return out


def meta(p):
    s = leer(p)[:30000]
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', s)
    t = html.unescape(t.group(1).strip()) if t else os.path.basename(p)
    t = re.sub(r"\s*[·\-]\s*APRENS.*$", "", t).strip() or t
    return t, html.unescape(d.group(1)) if d else ""


def url_de(p):
    if p.startswith("app/"):
        r = p[4:]
        return APP_URL + (r[:-len("index.html")] if r.endswith("index.html") else r)
    for carpeta, base in SITIOS.items():
        if p.startswith(carpeta):
            return base and base + p[len(carpeta):].replace("index.html", "")
    return None


def publicado(url):
    if not url:
        return None
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "aprens-indice"})
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status < 400
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            return "protegido"  # publicado, pero pide contraseña
        return e.code < 400
    except Exception:
        return None


def main():
    comprobar = "--comprobar" in sys.argv
    rama = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip() or "main"
    reg = registro()
    grs = grupos()
    archivos = sorted(p for p in glob.glob("**/*.html", root_dir=ROOT, recursive=True)
                      if not p.startswith(("netlify-redirecciones/", "escritorio/", "scripts/", "node_modules/")))

    cats = CATS[:3] + [(slug(g["label"]), g["emoji"], g["label"], g["desc"]) for g in grs] + CATS[3:]
    grupo_de = {i: slug(g["label"]) for g in grs for i in g["ids"]}
    reg_por_path = {r["path"]: r for r in reg.values() if r["path"]}
    items, vistos = [], set()

    def add(it):
        it["url"] = url_de(it["path"]) if it.get("path") else it.get("url")
        it["src"] = REPO + rama + "/" + it["path"] if it.get("path") else None
        items.append(it)

    # 1) herramientas del registro (con su ruta dentro de la app)
    for r in reg.values():
        cat = "profesional" if r["id"] in REG_A_PROFESIONAL else grupo_de.get(r["id"], "otras")
        pub = "profesional" if r["id"] in REG_A_PROFESIONAL else "paciente"
        it = dict(cat=cat, emoji=r["emoji"], nombre=r["nombre"], desc=r["desc"], pub=pub,
                  path=r["path"], app=APP_URL + "#/tool/" + r["id"])
        if r["path"] is None:
            it["url"] = APP_URL + "#/tool/" + r["id"]
            it["nota"] = "Integrada en la app (sin archivo propio)."
        add(it)
        if r["path"]:
            vistos.add(r["path"])
    # cuentos de Nil: los capítulos van dentro de su tarjeta
    for it in items:
        if it.get("path") == "app/tools-standalone/cuentos/index.html":
            caps = sorted(p for p in archivos if p.startswith("app/tools-standalone/cuentos/") and p != it["path"])
            it["sub"] = [dict(n=meta(p)[0].replace("Nil · ", ""), url=url_de(p)) for p in caps]
            vistos.update(caps)
    # 2) extras y 3) cualquier otro HTML
    for p in archivos:
        if p in vistos:
            continue
        if p in EXTRA:
            e = dict(EXTRA[p]); e["path"] = p; add(e)
        else:
            t, d = meta(p)
            add(dict(cat="sinclasificar", emoji="📄", nombre=t, desc=d or p, pub="paciente", path=p))
    # 4) webs antiguas
    tabla = leer("netlify-redirecciones/README.md")
    for m in re.finditer(r"\| `([a-z0-9-]+\.netlify\.app)` \| `#/tool/([a-z_]+)` · ([^|]+)\|", tabla):
        add(dict(cat="antiguas", emoji="↪️", nombre=m.group(1), desc="Antes: " + m.group(3).strip() + ". Ahora lleva a la app.",
                 pub="paciente", url="https://" + m.group(1) + "/", app=APP_URL + "#/tool/" + m.group(2), antigua=True))

    if comprobar:
        for it in items:
            if it.get("nativo"):
                it["estado"] = "nativo"
                continue
            ok = publicado(it.get("url"))
            it["estado"] = ("protegido" if ok == "protegido" else "publicado") if ok else ("sin-url" if not it.get("url") else "no-publicado")
    else:
        for it in items:
            it["estado"] = "nativo" if it.get("nativo") else ("sin-url" if not it.get("url") else "")

    usados = {i["cat"] for i in items} | {"favoritos"}
    cats = [c for c in cats if c[0] in usados]
    datos = dict(generado=date.today().isoformat(), rama=rama, comprobado=comprobar,
                 cats=[dict(id=c[0], emoji=c[1], label=c[2], desc=c[3]) for c in cats], items=items)
    plantilla = leer("scripts/indice-escritorio.plantilla.html")
    js = json.dumps(datos, ensure_ascii=False).replace("</", "<\\/")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(plantilla.replace("__DATOS__", js))
    n = sum(1 for i in items if not i.get("antigua"))
    print(f"{OUT}: {n} herramientas + {len(items) - n} webs antiguas en {len(cats)} categorías")
    for i in items:
        if i["cat"] == "sinclasificar":
            print("  sin clasificar:", i["path"])
    if comprobar:
        for i in items:
            if i["estado"] in ("no-publicado", "sin-url"):
                print(f"  {i['estado']}: {i.get('path') or i['url']}")


if __name__ == "__main__":
    main()
