/* ============================================================================
   APRENS · Panel del psicólogo  (MVP2 — local-first, cifrado en reposo)
   ----------------------------------------------------------------------------
   - Los datos de los pacientes viven SOLO en este dispositivo (localStorage),
     CIFRADOS con AES-GCM. La clave se deriva del "código de acceso" del
     psicólogo con PBKDF2; nunca se guarda: se pide al abrir. Es el equivalente
     honesto de un "login" sin backend (RGPD: nada sale a la nube).
   - PanelStore es una capa intercambiable: hoy es local; mañana se puede
     enchufar un adaptador Supabase sin tocar la UI ni las métricas.
   - Sin dependencias externas (Chart.js va vendorizado en ../vendor/).
   ============================================================================ */
(function () {
  "use strict";

  /* ───────────────────────── Cripto (WebCrypto) ───────────────────────── */
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64(bytes) { var s = ""; bytes.forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s); }
  function unb64(str) { var bin = atob(str), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }

  async function deriveKey(pass, salt) {
    var base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: 150000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encryptObj(key, obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(JSON.stringify(obj)));
    return { iv: b64(iv), ct: b64(new Uint8Array(ct)) };
  }
  async function decryptObj(key, box) {
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box.iv) }, key, unb64(box.ct));
    return JSON.parse(dec.decode(pt));
  }

  /* ───────────────────────── PanelStore (local cifrado) ─────────────────
     Punto único de almacenamiento. Para migrar a Supabase, se sustituye la
     implementación de _read/_persist por llamadas a la API (manteniendo el
     cifrado en cliente si se quiere E2EE). El resto del panel no cambia. */
  var VAULT_KEY = "aprens_panel_v1";
  var PanelStore = {
    _key: null,          // CryptoKey en memoria (nunca se persiste)
    _meta: null,         // { salt, verifier }
    data: { patients: {} },

    hasVault: function () { return !!localStorage.getItem(VAULT_KEY); },
    _readVault: function () { try { return JSON.parse(localStorage.getItem(VAULT_KEY)); } catch (e) { return null; } },

    create: async function (pass) {
      var salt = crypto.getRandomValues(new Uint8Array(16));
      this._key = await deriveKey(pass, salt);
      var verifier = await encryptObj(this._key, { ok: "APRENS-PANEL" });
      this.data = { patients: {} };
      var data = await encryptObj(this._key, this.data);
      this._meta = { salt: b64(salt), verifier: verifier };
      localStorage.setItem(VAULT_KEY, JSON.stringify({ salt: this._meta.salt, verifier: verifier, data: data }));
      return true;
    },

    unlock: async function (pass) {
      var v = this._readVault();
      if (!v) return false;
      var key = await deriveKey(pass, unb64(v.salt));
      try { await decryptObj(key, v.verifier); }            // código incorrecto → lanza
      catch (e) { return false; }
      this._key = key;
      this.data = v.data ? await decryptObj(key, v.data) : { patients: {} };
      if (!this.data.patients) this.data.patients = {};
      return true;
    },

    _persist: async function () {
      var v = this._readVault() || {};
      var data = await encryptObj(this._key, this.data);
      localStorage.setItem(VAULT_KEY, JSON.stringify({ salt: v.salt, verifier: v.verifier, data: data }));
    },

    lock: function () { this._key = null; this.data = { patients: {} }; },
    reset: function () { localStorage.removeItem(VAULT_KEY); this.lock(); },

    /* Fusiona un sobre aprens-export en el paciente que corresponda. */
    mergeEnvelope: function (env) {
      if (!env || (env.type && env.type !== "aprens-export") || !env.tools) throw new Error("no-envelope");
      var codigo = (env.paciente && env.paciente.codigo || "").trim() || "SIN-CÓDIGO";
      var p = this.data.patients[codigo] || (this.data.patients[codigo] = { codigo: codigo, tools: {}, updated: null });
      var added = 0, updated = 0;
      Object.keys(env.tools).forEach(function (toolId) {
        var src = env.tools[toolId] || {}; var recs = src.records || [];
        var dest = p.tools[toolId] || (p.tools[toolId] = { meta: src.meta || {}, records: [] });
        if (src.meta) dest.meta = src.meta;
        recs.forEach(function (r) {
          if (!r) return;
          var i = -1;
          if (r.id != null) i = dest.records.findIndex(function (x) { return x.id === r.id; });
          else if (r.date || r.fecha) { var d = r.date || r.fecha; i = dest.records.findIndex(function (x) { return (x.date || x.fecha) === d; }); }
          if (i >= 0) { dest.records[i] = r; updated++; } else { dest.records.push(r); added++; }
        });
        dest.records.sort(function (a, c) { return String(recDate(a) || a.ts).localeCompare(String(recDate(c) || c.ts)); });
      });
      p.updated = env.exportado || new Date(0).toISOString();
      return { codigo: codigo, added: added, updated: updated };
    },

    /* Importa CUALQUIER formato APRENS conocido y lo normaliza:
       - sobre de herramientas del paciente (type:"aprens-export")
       - backup del Screening TEC (app:"APRENS_TEC" / "APRENS_TEC_INVESTIGACION")
       - copia de seguridad del propio panel (type:"aprens-panel-backup")
       Devuelve { codigos:[...], added, updated }. */
    importAny: function (obj) {
      if (!obj || typeof obj !== "object") throw new Error("no-json");
      var envs;
      if (obj.type === "aprens-export" && obj.tools) envs = [obj];
      else if ((obj.app === "APRENS_TEC" || obj.app === "APRENS_TEC_INVESTIGACION") && obj.datos) envs = tecBackupToEnvelopes(obj.datos);
      else if (obj.type === "aprens-panel-backup" && obj.patients) envs = panelBackupToEnvelopes(obj.patients);
      else throw new Error("formato-desconocido");
      if (!envs.length) throw new Error("sin-datos");
      var codigos = {}, added = 0, updated = 0;
      var self = this;
      envs.forEach(function (env) { var r = self.mergeEnvelope(env); codigos[r.codigo] = 1; added += r.added; updated += r.updated; });
      return { codigos: Object.keys(codigos), added: added, updated: updated };
    },

    save: function () { return this._persist(); },
    patients: function () { return Object.keys(this.data.patients).map(function (k) { return this.data.patients[k]; }, this); }
  };

  /* Convierte la BD del Screening TEC ({codigo:{screenings,seguimientos}}) en
     sobres aprens-export (uno por paciente) que el panel ya sabe fusionar. */
  function tecBackupToEnvelopes(datos) {
    return Object.keys(datos).map(function (codigo) {
      var p = datos[codigo] || {};
      var scr = (p.screenings || []).map(function (s, i) {
        var ice = (s.analisis && s.analisis.ice) || {};
        return { id: "scr:" + codigo + ":" + (s.fecha || "") + ":" + i, date: s.fecha || "", ts: i + 1,
          L: numOrNull(ice.L), D: numOrNull(ice.D), C: numOrNull(ice.C),
          patron: (s.analisis && s.analisis.dominante) || null, codigo3: s.codigo || null, tipo: "screening" };
      });
      var seg = (p.seguimientos || []).map(function (s, i) {
        var sc = s.score || {};
        return { id: "seg:" + codigo + ":" + (s.fecha || "") + ":" + i, date: s.fecha || "", ts: i + 1,
          indice: numOrNull(sc.indice), latencia: numOrNull(sc.latencia), continuidad: numOrNull(sc.continuidad),
          perfil: s.perfil || null, tipo: "seguimiento" };
      });
      var tools = {};
      if (scr.length) tools.screening_tec = { meta: { nombre: "Screening TEC/AIS", v: 2 }, records: scr };
      if (seg.length) tools.seguimiento_tec = { meta: { nombre: "Seguimiento TEC", v: 2 }, records: seg };
      return { type: "aprens-export", paciente: { codigo: codigo }, exportado: new Date(0).toISOString(), tools: tools };
    }).filter(function (env) { return Object.keys(env.tools).length; });
  }
  function panelBackupToEnvelopes(patients) {
    return Object.keys(patients).map(function (codigo) {
      var p = patients[codigo] || {};
      return { type: "aprens-export", paciente: { codigo: p.codigo || codigo }, exportado: p.updated || new Date(0).toISOString(), tools: p.tools || {} };
    });
  }
  function numOrNull(v) { return v == null || v === "" ? null : Number(v); }

  /* ───────────────────────── Modelo / métricas ─────────────────────────── */
  var TOOL_LABEL = {
    cuestionario_tec: "Cuestionario TEC", estado_mono: "Estado del mono",
    donde_esta_mono: "¿Dónde está el mono?", agenda_atencional: "Agenda atencional",
    ais_curiosidad: "AIS curiosidad", bajar_alerta: "Bajar la alerta",
    brujula_valores: "Brújula de valores", acompanar_sensacion: "Acompañar la sensación",
    ais_amor: "AIS desde el amor", mapa_atencion_interna: "Mapa interno",
    screening_tec: "Screening TEC/AIS", seguimiento_tec: "Seguimiento TEC"
  };
  var POS_MAP = { conduce: "conduce", persigo: "delante", persecucion: "delante", sobrepensamiento: "delante",
    voltaatras: "delante", delante: "delante", maletero: "maletero", allado: "lado", lado: "lado" };
  var POS_LABEL = { conduce: "Conduce el mono", delante: "Lo tengo delante (lucha/juicio)",
    maletero: "En el maletero (lo escondo)", lado: "A mi lado (lo acompaño)" };
  var POS_COLOR = { conduce: "#c0584e", delante: "#d98a3d", maletero: "#8d6fb0", lado: "#5f9070" };
  var POS_ORDER = ["conduce", "delante", "maletero", "lado"];

  function recDate(r) { return r.date || r.fecha || (r.ts ? new Date(r.ts).toISOString().slice(0, 10) : ""); }
  function allRecords(p) {
    var out = [];
    Object.keys(p.tools).forEach(function (t) { (p.tools[t].records || []).forEach(function (r) { out.push({ tool: t, r: r }); }); });
    return out;
  }
  function totalRecords(p) { return allRecords(p).length; }
  function dateRange(p) {
    var ds = allRecords(p).map(function (x) { return recDate(x.r); }).filter(Boolean).sort();
    return ds.length ? { from: ds[0], to: ds[ds.length - 1] } : null;
  }
  function lccSeries(p) {
    // Reúne L/D/C de cualquier herramienta que los tenga (Cuestionario TEC y Screening TEC).
    var out = [];
    Object.keys(p.tools).forEach(function (t) {
      (p.tools[t].records || []).forEach(function (r) {
        if (num(r.L) != null && num(r.D) != null && num(r.C) != null)
          out.push({ date: recDate(r), L: num(r.L), D: num(r.D), C: num(r.C), total: num(r.total) });
      });
    });
    return out.sort(function (a, c) { return String(a.date).localeCompare(String(c.date)); });
  }
  function monoDist(p) {
    var counts = { conduce: 0, delante: 0, maletero: 0, lado: 0 }, total = 0;
    ["estado_mono", "donde_esta_mono"].forEach(function (t) {
      var b = p.tools[t]; if (!b) return;
      (b.records || []).forEach(function (r) {
        var raw = r.pos || r.escena || r.modo; var k = POS_MAP[raw];
        if (k) { counts[k]++; total++; }
      });
    });
    return { counts: counts, total: total };
  }
  function alertaStat(p) {
    var b = p.tools.bajar_alerta; if (!b || !b.records.length) return null;
    var rs = b.records.filter(function (r) { return r.antes != null && r.despues != null; });
    if (!rs.length) return null;
    var a = 0, d = 0; rs.forEach(function (r) { a += num(r.antes); d += num(r.despues); });
    return { antes: round1(a / rs.length), despues: round1(d / rs.length), n: rs.length };
  }
  function valoresStat(p) {
    var b = p.tools.brujula_valores; if (!b || !b.records.length) return null;
    var last = b.records[b.records.length - 1];
    return { disc: num(last.disc_total), max: num(last.max), cercania: num(last.cercania_media), fecha: recDate(last) };
  }
  function recentActivity(p, n) {
    return allRecords(p).sort(function (a, c) {
      var ka = (recDate(a.r) || "") + "|" + (a.r.ts || 0), kc = (recDate(c.r) || "") + "|" + (c.r.ts || 0);
      return kc.localeCompare(ka);
    }).slice(0, n || 25);
  }
  function num(v) { return typeof v === "number" ? v : (v == null || v === "" ? null : Number(v)); }
  function round1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function recSummary(tool, r) {
    if (r.resumen) return String(r.resumen).split("\n")[0];
    switch (tool) {
      case "cuestionario_tec": return "L " + r.L + " · D " + r.D + " · C " + r.C + " (global " + r.total + ")";
      case "estado_mono": return (r.estado || "") + (r.micro ? " · " + r.micro : "");
      case "donde_esta_mono": return (r.estado || "") + (r.herramienta ? " → " + r.herramienta : "");
      case "bajar_alerta": return "alerta " + r.antes + " → " + r.despues + (r.ancla ? " · ancla: " + r.ancla : "");
      case "brujula_valores": return "discrepancia " + r.disc_total + "/" + r.max + " · cercanía " + r.cercania_media;
      case "agenda_atencional": return "foco " + fmt(r.foco) + " · sobrepensamiento " + fmt(r.sobrepensamiento) + " · hechas " + fmt(r.hechas);
      case "acompanar_sensacion": return "intensidad " + r.intensidad_antes + " → " + r.intensidad_despues + (r.zona ? " (" + r.zona + ")" : "");
      case "ais_curiosidad": case "ais_amor": return (r.ejercicio || "práctica") + (r.micro ? " · " + r.micro : "");
      case "mapa_atencion_interna": return (r.tipo === "recorrido" ? "Recorrido completo" : (r.zona || "Zona")) + cualTxt(r.cualidades);
      case "screening_tec": return "L " + fmt(r.L) + " · D " + fmt(r.D) + " · C " + fmt(r.C) + (r.patron ? " · patrón " + r.patron : "") + (r.codigo3 ? " · cód " + r.codigo3 : "");
      case "seguimiento_tec": return "índice " + fmt(r.indice) + "/10" + (r.latencia != null ? " · latencia " + r.latencia : "") + (r.continuidad != null ? " · continuidad " + r.continuidad : "");
      default: return "—";
    }
  }
  function cualTxt(c) { if (!c) return ""; var a = Array.isArray(c) ? c : [c]; a = a.filter(Boolean); return a.length ? " · " + a.join(", ") : ""; }
  function fmt(v) { return v == null ? "—" : v; }

  /* ───────────────────────── UI ─────────────────────────── */
  var $ = function (id) { return document.getElementById(id); };
  var selected = null, charts = [];

  function toast(msg) { var t = $("toast"); t.textContent = msg; t.style.display = "block"; clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = "none"; }, 2600); }
  function destroyCharts() { charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); charts = []; }

  function showLock() {
    $("app").style.display = "none"; $("lock").style.display = "flex";
    var crear = PanelStore.hasVault() ? false : true;
    $("formCrear").style.display = crear ? "flex" : "none";
    $("formEntrar").style.display = crear ? "none" : "flex";
    $("lockSub").textContent = crear ? "Configura tu panel" : "Introduce tu código para entrar";
    ($("cNew") && crear ? $("cNew") : $("cPass")).focus();
  }
  function showApp() {
    $("lock").style.display = "none"; $("app").style.display = "flex";
    renderList(); renderDetail();
  }

  function renderList(filter) {
    var ps = PanelStore.patients().sort(function (a, b) { return a.codigo.localeCompare(b.codigo); });
    if (filter) ps = ps.filter(function (p) { return p.codigo.toLowerCase().indexOf(filter.toLowerCase()) >= 0; });
    $("pcount").textContent = PanelStore.patients().length;
    $("listEmpty").style.display = PanelStore.patients().length ? "none" : "block";
    var ul = $("patientList");
    ul.innerHTML = ps.map(function (p) {
      var rng = dateRange(p);
      return '<li class="patient-item' + (selected === p.codigo ? " sel" : "") + '" data-code="' + esc(p.codigo) + '">' +
        '<div class="pi-code">' + esc(p.codigo) + '</div>' +
        '<div class="pi-meta">' + totalRecords(p) + ' registros' + (rng ? ' · ' + rng.to : '') + '</div></li>';
    }).join("");
    Array.prototype.forEach.call(ul.querySelectorAll(".patient-item"), function (li) {
      li.onclick = function () { selected = li.getAttribute("data-code"); renderList($("pfilter").value); renderDetail(); };
    });
  }

  function renderDetail() {
    destroyCharts();
    var p = selected && PanelStore.data.patients[selected];
    $("emptyDetail").style.display = p ? "none" : "block";
    $("detailBody").style.display = p ? "block" : "none";
    if (!p) return;

    var rng = dateRange(p), mono = monoDist(p), al = alertaStat(p), val = valoresStat(p);
    var pctLado = mono.total ? Math.round(100 * mono.counts.lado / mono.total) : null;
    var body = $("detailBody");

    body.innerHTML =
      '<div class="d-head"><h2>' + esc(p.codigo) + '</h2>' +
        '<span class="muted">' + (rng ? rng.from + " → " + rng.to : "sin fechas") + '</span></div>' +
      '<div class="stat-row">' +
        stat(totalRecords(p), "registros") +
        stat(Object.keys(p.tools).length, "herramientas usadas") +
        stat(pctLado == null ? "—" : pctLado + "%", "% «a mi lado»") +
        stat(al ? (al.antes + "→" + al.despues) : "—", "alerta media (antes→después)") +
      '</div>' +
      '<div class="grid2">' +
        '<div class="card"><h3>Evolución L / D / C</h3>' +
          '<div class="sub">Cuestionario TEC: latencia, densidad y continuidad (0–10).</div>' +
          (lccSeries(p).length ? '<div class="chart-wrap"><canvas id="chartLCC"></canvas></div>' +
            '<div class="legend-inline"><span><i style="background:var(--L)"></i>Latencia</span><span><i style="background:var(--D)"></i>Densidad</span><span><i style="background:var(--C)"></i>Continuidad</span></div>'
            : '<div class="nodata">Aún no hay registros del Cuestionario TEC.</div>') +
        '</div>' +
        '<div class="card"><h3>¿Dónde ha estado el mono?</h3>' +
          '<div class="sub">Reparto de las posiciones registradas (estado del mono + detective).</div>' +
          (mono.total ? monobars(mono) : '<div class="nodata">Aún no hay check-ins del mono.</div>') +
        '</div>' +
      '</div>' +
      '<div class="grid2">' +
        '<div class="card"><h3>Valores (ACT)</h3>' +
          (val ? '<div class="sub">Última brújula · ' + esc(val.fecha) + '</div>' +
            '<div class="stat-row" style="margin:6px 0 0">' +
            stat(val.disc + "/" + val.max, "discrepancia total") +
            stat(val.cercania == null ? "—" : val.cercania, "cercanía media") + '</div>'
            : '<div class="nodata">Sin registros de la Brújula de valores.</div>') +
        '</div>' +
        '<div class="card"><h3>Regulación de la alerta</h3>' +
          (al ? '<div class="sub">' + al.n + ' registros de «Bajar la alerta».</div>' +
            '<div class="stat-row" style="margin:6px 0 0">' +
            stat(al.antes, "alerta media antes") + stat(al.despues, "alerta media después") + '</div>'
            : '<div class="nodata">Sin registros de «Bajar la alerta».</div>') +
        '</div>' +
      '</div>' +
      '<div class="card"><h3>Actividad reciente</h3>' +
        '<table class="acts"><thead><tr><th>Fecha</th><th>Herramienta</th><th>Resumen</th></tr></thead><tbody>' +
        recentActivity(p, 30).map(function (x) {
          return '<tr><td class="date">' + esc(recDate(x.r) || "—") + '</td>' +
            '<td><span class="tag">' + esc(TOOL_LABEL[x.tool] || x.tool) + '</span></td>' +
            '<td>' + esc(recSummary(x.tool, x.r)) + '</td></tr>';
        }).join("") +
        '</tbody></table></div>';

    drawLCC(p);
  }

  function stat(n, k) { return '<div class="stat"><div class="n">' + esc(n) + '</div><div class="k">' + esc(k) + '</div></div>'; }
  function monobars(mono) {
    return '<div class="monobars">' + POS_ORDER.map(function (k) {
      var v = mono.counts[k], pct = mono.total ? Math.round(100 * v / mono.total) : 0;
      return '<div class="monobar"><span>' + esc(POS_LABEL[k]) + '</span>' +
        '<span class="track"><span class="fill" style="width:' + pct + '%;background:' + POS_COLOR[k] + '"></span></span>' +
        '<span class="v">' + v + '</span></div>';
    }).join("") + '</div>';
  }
  function drawLCC(p) {
    var s = lccSeries(p); if (!s.length || !window.Chart) return;
    var ctx = $("chartLCC"); if (!ctx) return;
    charts.push(new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: s.map(function (x) { return x.date; }),
        datasets: [
          ds("Latencia", s.map(function (x) { return x.L; }), "#2d7dd2"),
          ds("Densidad", s.map(function (x) { return x.D; }), "#3a9e8c"),
          ds("Continuidad", s.map(function (x) { return x.C; }), "#5f9070")
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } }
      }
    }));
    function ds(label, data, color) { return { label: label, data: data, borderColor: color, backgroundColor: color, tension: .3, pointRadius: 3, borderWidth: 2 }; }
  }

  /* ───────────────────────── Importar ─────────────────────────── */
  function openImport() { $("importModal").style.display = "flex"; $("impMsg").textContent = ""; }
  function closeImport() { $("importModal").style.display = "none"; }

  async function importText(txt, label) {
    var obj; try { obj = JSON.parse(txt); } catch (e) { setImp("No es un JSON válido" + (label ? " (" + label + ")" : ""), false); return false; }
    try {
      var res = PanelStore.importAny(obj);
      await PanelStore.save();
      selected = res.codigos[0] || selected;
      renderList($("pfilter").value); renderDetail();
      var who = res.codigos.length === 1 ? res.codigos[0] : res.codigos.length + " pacientes";
      setImp("✔ " + who + ": +" + res.added + " nuevos, " + res.updated + " actualizados", true);
      return true;
    } catch (e) {
      var msg = e && e.message === "formato-desconocido"
        ? "El archivo no parece un export/backup de APRENS"
        : "No se pudo importar";
      setImp(msg + (label ? " (" + label + ")" : ""), false);
      return false;
    }
  }
  async function importFiles(files) {
    var ok = 0, fail = 0;
    for (var i = 0; i < files.length; i++) {
      var txt = await files[i].text();
      if (await importText(txt, files[i].name)) ok++; else fail++;
    }
    toast("Importados: " + ok + (fail ? " · fallos: " + fail : ""));
  }
  function setImp(msg, ok) { var m = $("impMsg"); m.textContent = msg; m.className = "imp-msg " + (ok ? "ok" : "err"); }

  /* ───────────────────────── Copia de seguridad ─────────────────────────── */
  function backup() {
    var blob = new Blob([JSON.stringify({ type: "aprens-panel-backup", exportado: new Date().toISOString(), patients: PanelStore.data.patients }, null, 2)], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "aprens_panel_backup_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    toast("Copia descargada (⚠️ sin cifrar: guárdala en lugar seguro)");
  }

  /* ───────────────────────── Eventos ─────────────────────────── */
  function wire() {
    $("formCrear").addEventListener("submit", async function (e) {
      e.preventDefault();
      var a = $("cNew").value, b = $("cNew2").value;
      if (a.length < 4) { alert("Usa al menos 4 caracteres."); return; }
      if (a !== b) { alert("Los códigos no coinciden."); return; }
      await PanelStore.create(a); showApp();
    });
    $("formEntrar").addEventListener("submit", async function (e) {
      e.preventDefault();
      $("lockErr").textContent = "";
      var ok = await PanelStore.unlock($("cPass").value);
      if (ok) { $("cPass").value = ""; showApp(); }
      else $("lockErr").textContent = "Código incorrecto.";
    });
    $("btnReset").addEventListener("click", function () {
      if (confirm("Esto BORRA todos los datos del panel en este dispositivo y no se pueden recuperar. ¿Continuar?")) {
        PanelStore.reset(); showLock();
      }
    });
    $("btnLock").addEventListener("click", function () { PanelStore.lock(); selected = null; showLock(); });
    $("btnImport").addEventListener("click", openImport);
    $("btnImport2").addEventListener("click", openImport);
    $("impClose").addEventListener("click", closeImport);
    $("btnBackup").addEventListener("click", backup);
    $("pfilter").addEventListener("input", function () { renderList(this.value); });
    $("fileInput").addEventListener("change", function () { if (this.files.length) importFiles(this.files); });
    $("pasteBtn").addEventListener("click", function () { var t = $("pasteBox").value.trim(); if (t) importText(t, "pegado"); });

    var drop = $("drop");
    ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("hot"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("hot"); }); });
    drop.addEventListener("drop", function (e) { if (e.dataTransfer.files.length) importFiles(e.dataTransfer.files); });

    $("importModal").addEventListener("click", function (e) { if (e.target === $("importModal")) closeImport(); });
  }

  document.addEventListener("DOMContentLoaded", function () { wire(); showLock(); });
  window.APRENS_PANEL = { PanelStore: PanelStore, _metrics: { monoDist: monoDist, lccSeries: lccSeries, recentActivity: recentActivity } }; // para pruebas
})();
