/* Pinta una diapositiva segons l'adreça: #<fitxa>/<idioma>/<número o yt>. */
(function () {
  "use strict";
  var D = window.DIFUSIO;
  var parts = decodeURIComponent(location.hash.slice(1)).split("/");
  var f = D.fitxes.filter(function (x) { return x.id === parts[0]; })[0];
  var lang = parts[1] === "es" ? "es" : "ca";
  var el = document.getElementById("slide");
  if (!f) { el.textContent = "Fitxa no trobada"; return; }
  document.documentElement.lang = lang;
  el.style.setProperty("--c", f.color);
  var slides = f.slides[lang];

  function h(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function foto(src, contain) { var d = h("div", contain ? "foto contain" : "foto"); d.style.backgroundImage = "url('../" + src + "')"; return d; }
  function peu(n, total) {
    var p = h("div", "peu");
    var m = h("span", "marca"); var img = document.createElement("img"); img.src = "../img/logo.png"; img.alt = "";
    m.appendChild(img); m.appendChild(document.createTextNode("APRENS"));
    p.appendChild(m);
    p.appendChild(h("span", "num", n ? n + " / " + total : D.enllacos.web));
    return p;
  }

  if (parts[2] === "yt") {
    var s0 = slides[0];
    el.className = "slide yt";
    el.appendChild(foto(s0.img || f.imatge, s0.contain));
    var t = h("div", "txt");
    t.appendChild(h("h1", null, (f.yt && f.yt.titol[lang].split(" · ")[0]) || s0.t));
    t.appendChild(h("p", "sub", f.nom[lang]));
    el.appendChild(t);
    el.appendChild(peu());
    return;
  }

  var i = Math.max(1, Math.min(slides.length, parseInt(parts[2], 10) || 1));
  var s = slides[i - 1];
  el.className = "slide " + s.tipus;
  if (s.tipus === "portada") {
    el.appendChild(foto(s.img || f.imatge, s.contain));
    var tx = h("div", "txt");
    tx.appendChild(h("h1", null, s.t));
    if (s.x) tx.appendChild(h("p", "sub", s.x));
    el.appendChild(tx);
  } else if (s.tipus === "llista") {
    el.appendChild(h("h2", null, s.t));
    var ul = h("ul");
    s.items.forEach(function (it) { ul.appendChild(h("li", null, it)); });
    el.appendChild(ul);
  } else if (s.tipus === "cita") {
    el.appendChild(h("blockquote", null, s.x));
    if (s.t) el.appendChild(h("p", "sub", s.t));
  } else {
    el.appendChild(h("h2", null, s.t));
    if (s.x) el.appendChild(h("p", null, s.x));
    if (s.tipus === "tancament" && s.url) el.appendChild(h("span", "url", s.url));
  }
  el.appendChild(peu(i, slides.length));
})();
