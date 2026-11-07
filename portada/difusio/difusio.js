/* APRENS · Espai de difusió: pinta les fitxes a partir de contingut.js. */
(function () {
  "use strict";
  var D = window.DIFUSIO;
  /* L'interfície sempre en català; el selector canvia l'idioma del material. */
  var UI = {
    ca: {
      destacat: "Destacat", fitxa: "Fitxa", perA: "Per a: ", obre: "Obre l'enllaç",
      carrusel: "Carrusel", totes: "Descarrega-les totes", copia: "Copia el text", copiat: "Copiat",
      ig: "Instagram · text del carrusel", fb: "Facebook · publicació", yt: "YouTube · vídeo o Short",
      titol: "Títol", desc: "Descripció", guio: "Guió (45-60 s, vertical per Shorts i Reels)", mini: "Miniatura",
      descarrega: "Descarrega el vídeo", setmana: "Setmana",
      tipus: { carrusel: "carrusel a Instagram i Facebook", short: "Short / Reel", fb: "publicació a Facebook", youtube: "vídeo a YouTube" },
      diapo: "Diapositiva"
    }
  };
  var lang = "ca";
  try { if (localStorage.getItem("aprens-difusio-lang") === "es") lang = "es"; } catch (e) { /* sense emmagatzematge */ }

  function h(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }

  function blocCopia(titol, text, llengua) {
    var frag = document.createDocumentFragment();
    if (titol) frag.appendChild(h("h4", null, titol));
    var pre = h("pre", { "class": "text-copia", tabindex: "0", lang: llengua || lang }, text);
    frag.appendChild(pre);
    var fila = h("div", { "class": "fila" });
    var b = h("button", { type: "button", "class": "boto" }, UI.ca.copia);
    var ok = h("span", { "class": "copiat", role: "status" });
    b.addEventListener("click", function () { copia(text, ok); });
    fila.appendChild(b); fila.appendChild(ok);
    frag.appendChild(fila);
    return frag;
  }

  function copia(text, ok) {
    function fet() { ok.textContent = UI.ca.copiat; setTimeout(function () { ok.textContent = ""; }, 2500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(fet, function () { antic(text); fet(); });
    } else { antic(text); fet(); }
  }
  function antic(text) {
    var t = h("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e) { /* res */ }
    document.body.removeChild(t);
  }

  function xarxa(titol, contingut, obert) {
    var d = h("details", { "class": "xarxa" });
    if (obert) d.open = true;
    d.appendChild(h("summary", null, titol));
    var cos = h("div", { "class": "cos" });
    cos.appendChild(contingut);
    d.appendChild(cos);
    return d;
  }

  function pintaFitxa(f) {
    var t = UI.ca;
    var node = document.getElementById("t-fitxa").content.firstElementChild.cloneNode(true);
    node.id = f.id;
    node.style.setProperty("--c", f.color);
    node.querySelector(".etiqueta").textContent = f.destacat ? t.destacat : t.fitxa;
    node.querySelector("h2").textContent = f.nom[lang];
    node.querySelector("h2").lang = lang;
    node.querySelector(".per").textContent = t.perA + f.perAqui[lang];
    var a = node.querySelector(".enllac");
    a.href = f.enllac; a.textContent = f.enllac.replace(/^https:\/\//, "");
    node.querySelector("h3").textContent = t.carrusel;

    var car = node.querySelector(".carrusel");
    var fitxers = [];
    f.slides[lang].forEach(function (s, i) {
      var src = "img/" + f.id + "-" + lang + "-" + (i + 1) + ".jpg";
      fitxers.push(src);
      var l = h("a", { href: src, download: "APRENS-" + f.id + "-" + lang + "-" + (i + 1) + ".jpg" });
      l.appendChild(h("img", { src: src, width: "1080", height: "1350", loading: "lazy",
        alt: t.diapo + " " + (i + 1) + ": " + [s.t, s.x].concat(s.items || []).filter(Boolean).join(". ") }));
      car.appendChild(l);
    });
    var totes = node.querySelector(".totes");
    totes.textContent = t.totes;
    totes.addEventListener("click", function () {
      car.querySelectorAll("a").forEach(function (l, i) { setTimeout(function () { l.click(); }, i * 350); });
    });

    var xs = node.querySelector(".xarxes");
    xs.appendChild(xarxa(t.ig, blocCopia(null, f.ig[lang]), true));
    xs.appendChild(xarxa(t.fb, blocCopia(null, f.fb[lang])));
    if (f.yt) {
      var fr = document.createDocumentFragment();
      fr.appendChild(blocCopia(t.titol, f.yt.titol[lang]));
      fr.appendChild(blocCopia(t.desc, f.yt.desc[lang]));
      fr.appendChild(blocCopia(t.guio, f.yt.guio[lang]));
      fr.appendChild(h("h4", null, t.mini));
      var mini = "img/" + f.id + "-" + lang + "-yt.jpg";
      var ml = h("a", { href: mini, download: "APRENS-" + f.id + "-" + lang + "-miniatura.jpg" });
      ml.appendChild(h("img", { "class": "miniatura", src: mini, width: "1280", height: "720", loading: "lazy", alt: t.mini + ": " + f.yt.titol[lang] }));
      fr.appendChild(ml);
      xs.appendChild(xarxa(t.yt, fr));
    }
    return node;
  }

  function nomDe(ref) {
    if (ref.indexOf("video:") === 0) return D.videos[+ref.slice(6)].titol;
    var f = D.fitxes.filter(function (x) { return x.id === ref; })[0];
    return f ? f.nom[lang] : ref;
  }

  function pinta() {
    var t = UI.ca;
    document.querySelectorAll(".idioma button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });

    var idx = document.getElementById("index"); idx.textContent = "";
    var cont = document.getElementById("fitxes"); cont.textContent = "";
    D.fitxes.forEach(function (f) {
      var li = h("li"); var a = h("a", { href: "#" + f.id }, f.nom[lang]); a.style.setProperty("--c", f.color);
      li.appendChild(a); idx.appendChild(li);
      cont.appendChild(pintaFitxa(f));
    });
    var liv = h("li"); liv.appendChild(h("a", { href: "#videos" }, "YouTube")); idx.appendChild(liv);

    var lv = document.getElementById("llista-videos"); lv.textContent = "";
    D.videos.forEach(function (v) {
      var c = h("article", { "class": "video" });
      c.appendChild(h("img", { src: "../" + v.poster, alt: "", width: "640", height: "360", loading: "lazy" }));
      var cos = h("div", { "class": "cos" });
      cos.appendChild(blocCopia(t.titol, v.titol, "es"));
      cos.appendChild(blocCopia(t.desc, v.desc + "\n\nTòfol Villalonga · APRENS Psicología · Inca\nhttps://aprens.net/", "es"));
      var dl = h("p"); dl.appendChild(h("a", { href: v.fitxer, rel: "noopener" }, t.descarrega));
      cos.appendChild(dl);
      c.appendChild(cos);
      lv.appendChild(c);
    });

    var cal = document.getElementById("calendari"); cal.textContent = "";
    D.calendari.forEach(function (s) {
      var c = h("div", { "class": "setmana" });
      c.appendChild(h("h3", null, t.setmana + " " + s.setmana));
      var ul = h("ul");
      s.items.forEach(function (it) { ul.appendChild(h("li", null, nomDe(it[0]) + ": " + t.tipus[it[1]])); });
      c.appendChild(ul);
      cal.appendChild(c);
    });
  }

  document.querySelectorAll(".idioma button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang;
      try { localStorage.setItem("aprens-difusio-lang", lang); } catch (e) { /* res */ }
      pinta();
    });
  });
  pinta();
  if (location.hash.length > 1) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
})();
