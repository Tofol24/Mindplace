/* ============================================================================
   Honestidad emocional desde dentro · lógica
   Interacción mínima e integrada en la experiencia editorial. Guarda un
   registro en el núcleo APRENS (aprens_db) para compartirlo con el psicólogo/a.
   ============================================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  if (window.Aprens) Aprens.config({ toolId: "honestidad_emocional", toolName: "Honestidad emocional", toolVersion: 1 });

  /* ---- Barra de progreso de lectura ---- */
  var progress = $("#progress");
  function onScroll() {
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    progress.style.width = Math.min(100, (h.scrollTop || document.body.scrollTop) / max * 100) + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Revelado sutil al entrar en pantalla ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.16 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Selección de palabras (zona y cualidad, multi) ---- */
  var sel = { zona: [], cualidad: [] };
  $$(".word").forEach(function (b) {
    b.addEventListener("click", function () {
      var g = b.getAttribute("data-group"), v = b.getAttribute("data-val");
      var on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", on ? "false" : "true");
      var arr = sel[g]; var i = arr.indexOf(v);
      if (on) { if (i >= 0) arr.splice(i, 1); } else if (i < 0) arr.push(v);
    });
  });

  /* ---- Intensidad ---- */
  function bindScale(inputId, numId) {
    var inp = $("#" + inputId), num = $("#" + numId);
    if (!inp) return;
    inp.addEventListener("input", function () { num.textContent = inp.value; });
  }
  bindScale("intAntes", "intAntesN");
  bindScale("intDespues", "intDespuesN");

  /* ---- Construir registro ---- */
  function ymd() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function val(id) { var e = $("#" + id); return e ? (e.value || "").trim() : ""; }
  function record() {
    return {
      id: "he" + Date.now(), date: ymd(), ts: Date.now(),
      zona: sel.zona.slice(), cualidades: sel.cualidad.slice(),
      intensidad_antes: Number(val("intAntes") || $("#intAntes").value),
      intensidad_despues: Number(val("intDespues") || $("#intDespues").value),
      con_quien: val("conQuien"), frase: val("queDices"), paso_valor: val("pasoValor")
    };
  }
  function resumen(r) {
    var L = ["Honestidad emocional — APRENS", "Fecha: " + r.date];
    if (r.zona.length) L.push("Dónde lo noto: " + r.zona.join(", "));
    if (r.cualidades.length) L.push("Cómo es: " + r.cualidades.join(", "));
    L.push("Intensidad: " + r.intensidad_antes + " → " + r.intensidad_despues);
    if (r.con_quien) L.push("Lo comparto con: " + r.con_quien);
    if (r.frase) L.push("Le digo / noto: " + r.frase);
    if (r.paso_valor) L.push("Mi paso en dirección a lo que importa: " + r.paso_valor);
    L.push("", "(Enviado desde mi práctica de honestidad emocional)");
    return L.join("\n");
  }

  function persist() {
    var cod = val("codigo");
    if (window.Aprens) { if (cod) Aprens.setPacienteCodigo(cod); Aprens.save(record()); }
  }
  function flash(msg) { var s = $("#saved"); s.textContent = msg; }

  /* ---- Acciones ---- */
  var btnC = $("#btnCompartir"), btnG = $("#btnGuardar");
  if (btnC) btnC.addEventListener("click", function () {
    persist();
    var txt = resumen(record());
    try { window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank"); } catch (e) {}
    flash("Guardado en este dispositivo. Se ha abierto para compartir.");
  });
  if (btnG) btnG.addEventListener("click", function () {
    persist();
    if (window.Aprens) Aprens.exportJSON();
    flash("Guardado. Se ha descargado tu copia (.json) para el panel.");
  });
})();
