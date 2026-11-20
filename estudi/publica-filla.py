#!/usr/bin/env python3
"""Publica estudi-filla/ a estudi-filla.netlify.app amb l'API de Netlify (pujada per resum SHA-1).
Conserva els fitxers del lloc que no són a estudi-filla/ (p. ex. prova.html).
Cal un token de Netlify a NETLIFY_AUTH_TOKEN (a la sessió de Claude el posa el servidor intermediari)."""
import hashlib, json, os, pathlib, sys, urllib.request

SITE = "d981cf60-ed6d-4e74-a2a4-46be8d72fada"  # estudi-filla
API = "https://api.netlify.com/api/v1"
TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN", "x")

def call(method, url, data=None, ctype="application/json"):
    req = urllib.request.Request(API + url, data=data, method=method,
                                 headers={"Authorization": "Bearer " + TOKEN, "Content-Type": ctype})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read() or "null")

root = pathlib.Path(__file__).resolve().parent / "estudi-filla"
if not (root / "index.html").exists():
    sys.exit("Primer: ./fes-filla.sh")
local = {"/" + p.relative_to(root).as_posix(): p for p in root.rglob("*") if p.is_file()}
files = {path: f["sha"] for f in call("GET", f"/sites/{SITE}/files") for path in [f["path"]] if path not in local}
files.update({k: hashlib.sha1(p.read_bytes()).hexdigest() for k, p in local.items()})
dep = call("POST", f"/sites/{SITE}/deploys", json.dumps({"files": files}).encode())
for sha in dep.get("required", []):
    for k, p in local.items():
        if files[k] == sha:
            call("PUT", f"/deploys/{dep['id']}/files{k}", p.read_bytes(), "application/octet-stream")
            print("pujat", k)
            break
print("Desplegament", dep["id"], "→ https://estudi-filla.netlify.app")
