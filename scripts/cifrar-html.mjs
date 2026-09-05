#!/usr/bin/env node
/**
 * APRENS · Cifrado de una página HTML para publicarla sin exponer su contenido
 * ---------------------------------------------------------------------------
 * Envuelve un archivo HTML dentro de una página "cerradura": lo publicado es un
 * bloque cifrado con AES-256-GCM y una clave derivada del código de acceso
 * (PBKDF2-HMAC-SHA256). Sin el código no hay nada legible, tampoco en el código
 * fuente de la página.
 *
 * Pensado para materiales clínicos individuales que se sirven desde un sitio
 * estático público: el contenido sensible no llega nunca al servidor en claro.
 *
 * Uso:
 *   node scripts/cifrar-html.mjs <origen.html> <destino.html> [código]
 *
 * Si no se pasa código, se genera uno de 8 caracteres con un alfabeto sin
 * caracteres confundibles (sin I, O, 0, 1) y se imprime por pantalla.
 * El código NO se guarda en ningún sitio: si se pierde, se vuelve a cifrar.
 *
 * El archivo de origen NO debe subirse a un repositorio público.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 símbolos, sin I O 0 1
const ITERACIONES = 310000;

function generarCodigo(n = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(n * 4));
  let out = "";
  for (let i = 0; out.length < n; i++) {
    const v = bytes[i];
    if (v < 256 - (256 % ALFABETO.length)) out += ALFABETO[v % ALFABETO.length];
  }
  return out;
}
const normaliza = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

async function derivar(codigo, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(codigo), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERACIONES, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

const [origen, destino, codigoArg] = process.argv.slice(2);
if (!origen || !destino) {
  console.error("Uso: node scripts/cifrar-html.mjs <origen.html> <destino.html> [código]");
  process.exit(1);
}
const codigo = normaliza(codigoArg || generarCodigo());
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const clave = await derivar(codigo, salt);
const cifrado = new Uint8Array(await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, clave, new TextEncoder().encode(readFileSync(origen, "utf8"))));

const b64 = (u8) => Buffer.from(u8).toString("base64");

const LOADER = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<meta name="theme-color" content="#3f6b74">
<title>Cuestionario privado · APRENS</title>
<style>
:root{--azul:#3f6b74;--azulDk:#2f5158;--azulLt:#dde7e7;--oro:#a9781f;--rojo:#a8392b;
  --gris:#6f665b;--tinta:#2b2620;--linea:#e1d9c9;
  --serif:'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',Georgia,'Times New Roman',serif;
  --sans:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{font-family:var(--sans);background:linear-gradient(170deg,#F3EEE4 0%,#EFE7D6 100%);
  color:var(--tinta);min-height:100vh;line-height:1.6;display:flex;align-items:center;
  justify-content:center;padding:24px 18px;-webkit-font-smoothing:antialiased}
.card{background:#fff;border:1px solid var(--linea);border-radius:20px;padding:30px 24px;
  max-width:430px;width:100%;box-shadow:0 10px 34px -22px rgba(43,38,32,.6)}
.logo{width:44px;height:44px;border-radius:50%;background:var(--azul);color:#fff;margin-bottom:16px;
  display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:15px}
h1{font-family:var(--serif);font-size:23px;color:var(--azulDk);line-height:1.2;margin-bottom:10px}
p{font-size:14.5px;color:var(--gris);margin-bottom:8px}
label{display:block;font-size:14px;font-weight:600;color:var(--tinta);margin:20px 0 7px}
input{display:block;width:100%;font-family:var(--sans);font-size:26px;letter-spacing:.18em;
  text-align:center;text-transform:uppercase;color:var(--tinta);background:#fdfbf7;
  border:2px solid var(--linea);border-radius:14px;padding:16px 12px;outline:none;-webkit-appearance:none}
input:focus{border-color:var(--azul);background:#fff}
button{width:100%;margin-top:14px;border:0;border-radius:26px;background:var(--azul);color:#fff;
  font-family:var(--sans);font-size:16px;font-weight:600;padding:16px;cursor:pointer}
button[disabled]{opacity:.55;cursor:progress}
.err{display:none;margin-top:14px;background:#fbe9e6;border-left:4px solid var(--rojo);
  border-radius:0 12px 12px 0;padding:12px 15px;font-size:13.5px;color:#7d2b20}
.err.on{display:block}
.pie{margin-top:22px;padding-top:16px;border-top:1px dashed var(--linea);font-size:12.5px;color:var(--gris)}
.nojs{background:#fbf0dc;border-left:4px solid var(--oro);border-radius:0 12px 12px 0;
  padding:12px 15px;font-size:13.5px;color:#7d520f;margin-top:16px}
</style>
</head>
<body>
<main class="card">
  <div class="logo">AP</div>
  <h1>Cuestionario privado</h1>
  <p>Esta página está cerrada con un código. Escribe el que te ha dado tu psicólogo.</p>
  <form id="f" autocomplete="off">
    <label for="c">Código de acceso</label>
    <input id="c" type="text" inputmode="latin" autocapitalize="characters" autocorrect="off"
           spellcheck="false" maxlength="12" placeholder="XXXX-XXXX" aria-describedby="e">
    <button id="b" type="submit">Abrir el cuestionario</button>
  </form>
  <div class="err" id="e" role="alert"></div>
  <noscript><div class="nojs">Necesitas tener JavaScript activado para abrir el cuestionario.</div></noscript>
  <div class="pie">Al abrirlo, tus respuestas se guardan solo en este dispositivo. No se envían a ningún sitio.</div>
</main>
<script>
(function(){
"use strict";
var SALT="${b64(salt)}", IV="${b64(iv)}", DATA="${b64(cifrado)}", IT=${ITERACIONES}, MEM="aprens_cq_cod";
var f=document.getElementById("f"), c=document.getElementById("c"),
    b=document.getElementById("b"), e=document.getElementById("e");
function bin(s){var r=atob(s),u=new Uint8Array(r.length);for(var i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u;}
function fallo(msg){ e.textContent=msg; e.className="err on"; b.disabled=false; b.textContent="Abrir el cuestionario"; }
if(!(window.crypto&&window.crypto.subtle)){
  fallo("Este navegador no puede abrir la página. Prueba con Safari (iPhone) o Chrome (Android), y comprueba que la dirección empieza por https.");
  b.disabled=true;
}
async function abrir(codigo){
  var enc=new TextEncoder();
  var base=await crypto.subtle.importKey("raw", enc.encode(codigo), "PBKDF2", false, ["deriveKey"]);
  var key=await crypto.subtle.deriveKey({name:"PBKDF2",salt:bin(SALT),iterations:IT,hash:"SHA-256"},
    base,{name:"AES-GCM",length:256},false,["decrypt"]);
  var claro=await crypto.subtle.decrypt({name:"AES-GCM",iv:bin(IV)}, key, bin(DATA));
  try{ localStorage.setItem(MEM, codigo); }catch(err){}
  var html=new TextDecoder().decode(claro);
  document.open(); document.write(html); document.close();
}
function intentar(codigo, silencioso){
  codigo=(codigo||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(codigo.length<4){ if(!silencioso) fallo("Escribe el código completo."); return; }
  e.className="err"; b.disabled=true; b.textContent="Abriendo…";
  abrir(codigo).catch(function(){
    try{ localStorage.removeItem(MEM); }catch(err){}
    if(silencioso){ b.disabled=false; b.textContent="Abrir el cuestionario"; return; }
    fallo("Ese código no es correcto. Revísalo y vuelve a intentarlo. Si lo has perdido, pídeselo a tu psicólogo.");
    c.value=""; c.focus();
  });
}
f.addEventListener("submit", function(ev){ ev.preventDefault(); intentar(c.value,false); });
c.addEventListener("input", function(){
  var v=c.value.toUpperCase().replace(/[^A-Z0-9]/g,"");
  c.value = v.length>4 ? v.slice(0,4)+"-"+v.slice(4,8) : v;
});
try{ var g=localStorage.getItem(MEM); if(g) intentar(g,true); }catch(err){}
})();
</script>
</body>
</html>
`;
writeFileSync(destino, LOADER, "utf8");
console.log("Origen cifrado : " + origen);
console.log("Publicable en  : " + destino);
console.log("Tamaño         : " + Math.round(LOADER.length/1024) + " KB");
console.log("");
console.log("  CÓDIGO DE ACCESO:  " + codigo.slice(0,4) + "-" + codigo.slice(4));
console.log("");
console.log("Guárdalo: no está en ningún archivo. Sin él, el contenido no se recupera.");
