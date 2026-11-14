// APRENS · Espai Filosòfic: idioma (el mateix que la portada) i enviament del formulari a Netlify Forms.
// El formulari no envia res sense la casella de consentiment i només dona les gràcies si Netlify l'ha rebut.
"use strict";
(function () {
  const root = document.documentElement;
  let lang = "ca";
  try { const s = localStorage.getItem("aprens:idioma"); lang = s === "es" || s === "ca" ? s : (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "ca"; } catch {}

  const pinta = () => {
    root.lang = lang;
    document.querySelectorAll(".idioma button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll("#tema option").forEach((o) => { o.textContent = o.getAttribute("data-" + lang); });
    const fi = document.getElementById("f-idioma"); if (fi) fi.value = lang;
  };
  document.querySelectorAll(".idioma button").forEach((b) => b.addEventListener("click", () => {
    lang = b.dataset.lang; try { localStorage.setItem("aprens:idioma", lang); } catch {} pinta();
  }));
  pinta();

  const M = {
    ca: { buit: "Escriu la teva pregunta o reflexió.", consent: "Per enviar, marca la casella de consentiment.", envia: "Enviant…", ok: "Gràcies. Hem rebut la teva pregunta; la llegirem amb calma.", err: "No s'ha pogut enviar. Torna-ho a provar més tard o escriu a tofol@aprens.es." },
    es: { buit: "Escribe tu pregunta o reflexión.", consent: "Para enviar, marca la casilla de consentimiento.", envia: "Enviando…", ok: "Gracias. Hemos recibido tu pregunta; la leeremos con calma.", err: "No se ha podido enviar. Vuelve a probar más tarde o escribe a tofol@aprens.es." }
  };
  const form = document.getElementById("qform");
  const st = document.getElementById("status");
  const diu = (txt, cls) => { st.textContent = txt; st.className = "status" + (cls ? " " + cls : ""); };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!document.getElementById("missatge").value.trim()) { diu(M[lang].buit, "err"); return; }
    if (!document.getElementById("consent").checked) { diu(M[lang].consent, "err"); return; }
    const boto = form.querySelector(".send");
    boto.disabled = true; diu(M[lang].envia);
    try {
      const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!r.ok) throw new Error(String(r.status));
      form.reset(); pinta(); diu(M[lang].ok, "ok");
    } catch { diu(M[lang].err, "err"); }
    finally { boto.disabled = false; }
  });
})();
