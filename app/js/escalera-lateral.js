/* APRENS · Escalera lateral
   ------------------------------------------------------------
   Dibuja una escalera de exposición vista de lado, en una sola imagen: cada
   escalón es tan alto como su dificultad, de modo que se ve de un vistazo
   dónde estás, qué falta hasta arriba y si algún escalón es demasiado alto
   (⚠ cuando el salto respecto al anterior supera opts.salto).

   Uso:
     EscaleraLateral.montar(caja, pasos, opts)
       pasos: [{ alto, hecho, emoji?, linea2?, linea3?, etiqueta }]
              ya ordenados de más fácil a más difícil.
       opts:  { salto (2), persona ("🧒"), meta ("🏆"), max (máx. de la escala) }
     Devuelve el índice del escalón actual (el primero no hecho) o -1.
   No guarda nada: solo pinta. Sin dependencias.
*/
(function (global) {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function estilos() {
    if (document.getElementById("escLatCss")) return;
    var st = document.createElement("style");
    st.id = "escLatCss";
    st.textContent =
      ".esc-lat{overflow-x:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(#eaf4fb,#fffaf2);border-radius:18px;padding:8px 4px 0;box-shadow:inset 0 0 0 1px #efe1cf;margin:0 0 6px}" +
      ".esc-lat svg{display:block}" +
      ".esc-lat-ley{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:#77685e;margin:6px 2px 12px}" +
      ".esc-lat-ley i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:4px}" +
      ".esc-lat-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}";
    document.head.appendChild(st);
  }

  function montar(caja, pasos, opts) {
    opts = opts || {};
    estilos();
    var salto = opts.salto || 2, persona = opts.persona || "🧒", meta = opts.meta || "🏆";
    var n = pasos.length, cur = -1;
    for (var i = 0; i < n; i++) if (!pasos[i].hecho) { cur = i; break; }
    if (!n) { caja.innerHTML = ""; return -1; }

    var maxA = opts.max || Math.max.apply(null, pasos.map(function (p) { return p.alto; })) + 1;
    // Cada escalón mide (alto + 1) unidades: así el más bajo también tiene sitio para su dibujo.
    var U = Math.max(16, Math.min(30, Math.round(230 / (maxA + 1)))), W = 86, top = 92, base = top + (maxA + 1) * U;
    var w = 24 + (n + 1) * W + 16, h = base + 26;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" aria-hidden="true">';
    s += '<rect x="0" y="' + base + '" width="' + w + '" height="26" fill="#d9c7ad"/>';
    pasos.forEach(function (p, i) {
      var x = 24 + i * W, hh = (Math.max(1, p.alto) + 1) * U, y = base - hh, act = i === cur;
      var fill = p.hecho ? "#6fb383" : (act ? "#F2B84B" : "#dfe9f2");
      var stroke = p.hecho ? "#3f8a57" : (act ? "#c98a12" : "#a9bccd");
      var ink = p.hecho ? "#fff" : "#3b2f2a";
      s += '<rect x="' + (x + 2) + '" y="' + y + '" width="' + (W - 4) + '" height="' + hh + '" rx="10" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (act ? 3 : 1.5) + '"/>';
      var ly = y + 28;
      if (p.emoji && hh >= 34) { s += '<text x="' + (x + W / 2) + '" y="' + ly + '" font-size="24" text-anchor="middle">' + esc(p.emoji) + "</text>"; ly += 22; }
      if (p.linea2 && hh >= ly - y + 6) { s += '<text x="' + (x + W / 2) + '" y="' + ly + '" font-size="13" text-anchor="middle" fill="' + ink + '">' + esc(p.linea2) + "</text>"; ly += 20; }
      if (p.linea3 && hh >= ly - y + 6) s += '<text x="' + (x + W / 2) + '" y="' + ly + '" font-size="14" text-anchor="middle" fill="' + (p.hecho ? "#fff" : "#7a4b00") + '">' + esc(p.linea3) + "</text>";
      s += '<text x="' + (x + W / 2) + '" y="' + (base + 18) + '" font-size="12" text-anchor="middle" fill="#5b4a3f">' + (i + 1) + "</text>";
      if (i > 0 && p.alto - pasos[i - 1].alto >= salto) s += '<text x="' + (x + 2) + '" y="' + (y - 6) + '" font-size="16" text-anchor="middle">⚠️</text>';
      if (p.hecho) s += '<text x="' + (x + W - 14) + '" y="' + (y + 16) + '" font-size="14" text-anchor="middle" fill="#fff">✓</text>';
      if (act) s += '<text x="' + (x + W / 2) + '" y="' + (y - 10) + '" font-size="40" text-anchor="middle">' + esc(persona) + "</text>";
    });
    var fx = 24 + n * W, fy = base - (Math.min(maxA, pasos[n - 1].alto + 1) + 1) * U;
    s += '<rect x="' + (fx + 2) + '" y="' + fy + '" width="' + (W - 4) + '" height="' + (base - fy) + '" rx="10" fill="#fff3c4" stroke="#c98a12" stroke-dasharray="5 4"/>';
    s += '<text x="' + (fx + W / 2) + '" y="' + (fy - 10) + '" font-size="' + (cur < 0 ? 56 : 40) + '" text-anchor="middle">' + esc(meta) + "</text>";
    if (cur < 0) s += '<text x="' + (fx + W / 2) + '" y="' + (fy - 64) + '" font-size="34" text-anchor="middle">' + esc(persona) + "</text>";
    s += "</svg>";

    var sr = pasos.map(function (p, i) {
      return "<li>Escalón " + (i + 1) + ": " + esc(p.etiqueta) + ". " + (p.hecho ? "Conseguido." : (i === cur ? "Es el de ahora." : "Pendiente.")) + "</li>";
    }).join("");
    caja.innerHTML = '<div class="esc-lat" role="img" aria-label="' + esc(opts.titulo || "Escalera") + ": " + n + ' escalones">' + s + "</div>" +
      '<div class="esc-lat-ley" aria-hidden="true"><span><i style="background:#6fb383"></i>Conseguido</span><span><i style="background:#F2B84B"></i>El de ahora</span>' +
      '<span><i style="background:#dfe9f2"></i>Los siguientes</span><span>⚠️ escalón muy alto</span>' + (opts.leyenda ? "<span>" + esc(opts.leyenda) + "</span>" : "") + "</div>" +
      '<ol class="esc-lat-sr">' + sr + "</ol>";
    var box = caja.querySelector(".esc-lat"), foco = cur < 0 ? n : cur;
    box.scrollLeft = Math.max(0, 24 + foco * W - box.clientWidth / 2 + W / 2);
    return cur;
  }

  global.EscaleraLateral = { montar: montar };
})(window);
