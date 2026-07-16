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
      else if (obj.type === "aprens-panel-backup" && obj.patients) envs = patientMapToEnvelopes(obj.patients);
      else if (obj.pacientes && typeof obj.pacientes === "object") envs = patientMapToEnvelopes(obj.pacientes); // backup del panel anterior
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

  /* Convierte la BD cruda del Screening TEC ({codigo:{screenings,seguimientos}})
     a sobres aprens-export. Usa los MISMOS tool ids y campos que el panel anterior
     (screening_tec / screening_seg, con clave por fecha) para que, si el usuario
     importa ambas fuentes, se fusionen en vez de duplicarse. */
  function tecBackupToEnvelopes(datos) {
    return Object.keys(datos).map(function (codigo) {
      var p = datos[codigo] || {};
      var scr = (p.screenings || []).map(function (s) {
        var ice = (s.analisis && s.analisis.ice) || {};
        return { date: s.fecha || "", codigo: s.codigo || null,
          L: numOrNull(ice.L), D: numOrNull(ice.D), C: numOrNull(ice.C),
          patron: (s.analisis && s.analisis.dominante) || null };
      });
      var seg = (p.seguimientos || []).map(function (s) {
        var sc = s.score || {};
        return { date: s.fecha || "", perfil: s.perfil || null,
          L: numOrNull(sc.latencia), D: numOrNull(sc.activacion), C: numOrNull(sc.continuidad),
          indice: numOrNull(sc.indice) };
      });
      var tools = {};
      if (scr.length) tools.screening_tec = { meta: { nombre: "Screening TEC (inicial)", v: 2 }, records: scr };
      if (seg.length) tools.screening_seg = { meta: { nombre: "Screening · seguimiento", v: 2 }, records: seg };
      return { type: "aprens-export", paciente: { codigo: codigo }, exportado: new Date(0).toISOString(), tools: tools };
    }).filter(function (env) { return Object.keys(env.tools).length; });
  }
  /* Acepta tanto {patients:{...}} (backup de ESTE panel) como {pacientes:{...}}
     (backup del panel anterior). Cada entrada ya trae {codigo,tools[,importado]}. */
  function patientMapToEnvelopes(map) {
    return Object.keys(map).map(function (codigo) {
      var p = map[codigo] || {};
      return { type: "aprens-export", paciente: { codigo: p.codigo || codigo },
        exportado: p.updated || p.importado || new Date(0).toISOString(), tools: p.tools || {} };
    }).filter(function (env) { return env.tools && Object.keys(env.tools).length; });
  }
  function numOrNull(v) { return v == null || v === "" ? null : Number(v); }

  /* ───────────────────────── Modelo / métricas ─────────────────────────── */
  var TOOL_LABEL = {
    cuestionario_tec: "Cuestionario TEC", estado_mono: "Estado del mono",
    donde_esta_mono: "¿Dónde está el mono?", agenda_atencional: "Agenda atencional",
    ais_curiosidad: "AIS curiosidad", bajar_alerta: "Bajar la alerta",
    brujula_valores: "Brújula de valores", acompanar_sensacion: "Acompañar la sensación",
    ais_amor: "AIS desde el amor", ais_muscular: "AIS muscular", mapa_atencion_interna: "Mapa interno",
    screening_tec: "Screening TEC/AIS", seguimiento_tec: "Seguimiento TEC",
    screening_seg: "Screening · seguimiento", tracker_tec: "Tracker TEC",
    autorregistro: "Autorregistro", registro_texto: "Registro TEC/AIS",
    donde_mono: "¿Dónde está el mono?", herramienta_diaria: "Eina diària",
    compromiso_semanal: "Compromiso semanal"
  };
  var MONO_TOOLS = ["estado_mono", "donde_esta_mono", "donde_mono"];
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
    MONO_TOOLS.forEach(function (t) {
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

  function firstLine(s) { var l = String(s).split("\n").filter(function (x) { return x.trim(); })[0] || ""; return l.length > 96 ? l.slice(0, 96) + "…" : l; }
  function pick() { for (var i = 0; i < arguments.length; i++) if (arguments[i] != null && arguments[i] !== "") return arguments[i]; return null; }
  function recSummary(tool, r) {
    if (r.resumen) return firstLine(r.resumen);
    switch (tool) {
      case "cuestionario_tec": return "L " + r.L + " · D " + r.D + " · C " + r.C + " (global " + r.total + ")";
      case "estado_mono": return (r.estado || "") + (r.micro ? " · " + r.micro : (r.al_lado ? " · a mi lado: " + r.al_lado : ""));
      case "donde_esta_mono": case "donde_mono": return (r.estado || "") + (pick(r.herramienta, r.herramienta_sugerida) ? " → " + pick(r.herramienta, r.herramienta_sugerida) : "");
      case "bajar_alerta": { var a = pick(r.antes, r.alerta_antes), d = pick(r.despues, r.alerta_despues); return a != null ? "alerta " + a + " → " + d + (r.ancla ? " · ancla: " + r.ancla : "") : (r.texto ? firstLine(r.texto) : "—"); }
      case "brujula_valores": { var disc = pick(r.disc_total, r.discrepancia_total), cer = pick(r.cercania_media, r.cercania_media_forma_de_relacionarme); return "discrepancia " + fmt(disc) + (r.max ? "/" + r.max : "") + " · cercanía " + fmt(cer); }
      case "agenda_atencional": return "foco " + fmt(r.foco) + " · sobrepensamiento " + fmt(r.sobrepensamiento) + " · hechas " + fmt(r.hechas);
      case "acompanar_sensacion": return "intensidad " + r.intensidad_antes + " → " + r.intensidad_despues + (r.zona ? " (" + r.zona + ")" : "");
      case "ais_curiosidad": case "ais_amor": return r.ejercicio ? (r.ejercicio + (r.micro ? " · " + r.micro : "")) : (r.texto ? firstLine(r.texto) : "—");
      case "mapa_atencion_interna": return (r.tipo === "recorrido" ? "Recorrido completo" : (r.zona || "Zona")) + cualTxt(r.cualidades);
      case "screening_tec": return "L " + fmt(r.L) + " · D " + fmt(r.D) + " · C " + fmt(r.C) + (pick(r.patron, r.perfil) ? " · " + pick(r.patron, r.perfil) : "") + (pick(r.codigo3, r.codigo) ? " · cód " + pick(r.codigo3, r.codigo) : "");
      case "screening_seg": case "seguimiento_tec": return "índice " + fmt(r.indice) + "/10" + (r.L != null ? " · L " + r.L + " · D " + fmt(r.D) + " · C " + r.C : (r.latencia != null ? " · latencia " + r.latencia + " · continuidad " + r.continuidad : ""));
      default: return r.texto ? firstLine(r.texto) : "—";
    }
  }
  function cualTxt(c) { if (!c) return ""; var a = Array.isArray(c) ? c : [c]; a = a.filter(Boolean); return a.length ? " · " + a.join(", ") : ""; }
  function fmt(v) { return v == null ? "—" : v; }

  /* ═══════════════════════ Informe clínico (integración) ═══════════════════
     Fusiona TRES dimensiones para complementar la historia clínica:
       1) EVOLUCIÓN del screening TEC (latencia/densidad/continuidad + índice).
       2) ADHERENCIA: capacidad de llevar a cabo las tareas (constancia).
       3) RESULTADOS: efecto de esas tareas (antes→después de cada práctica).
     Todo se deriva de los datos autoinformados; no interpreta más allá de ellos. */
  function parseYMD(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || "")); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function daysBetween(a, b) { var da = parseYMD(a), db = parseYMD(b); if (!da || !db) return 0; return Math.round((db - da) / 86400000); }
  function maxStreak(sortedDays) {
    if (!sortedDays.length) return 0;
    var best = 1, cur = 1;
    for (var i = 1; i < sortedDays.length; i++) {
      var diff = daysBetween(sortedDays[i - 1], sortedDays[i]);
      if (diff === 1) { cur++; if (cur > best) best = cur; } else if (diff > 1) { cur = 1; }
    }
    return best;
  }
  function fmtDelta(v) { return v == null ? "—" : (v > 0 ? "+" : "") + round1(v); }
  function pctSign(v) { return (v >= 0 ? "−" : "+") + Math.abs(v) + "%"; } // reducción = signo −

  /* 1 · EVOLUCIÓN del screening (baseline → actual, por eje L/D/C + índice). */
  function screeningReport(p) {
    var s = lccSeries(p);
    if (!s.length) return null;
    var first = s[0], last = s[s.length - 1];
    function axis(k) {
      var a = first[k], b = last[k];
      var d = (a != null && b != null) ? round1(b - a) : null;
      return { first: a, last: b, delta: d, dir: d == null ? "—" : (d < -0.05 ? "baja" : d > 0.05 ? "sube" : "estable") };
    }
    var seg = ((p.tools.screening_seg && p.tools.screening_seg.records) || [])
      .filter(function (r) { return num(r.indice) != null; })
      .sort(function (a, c) { return String(recDate(a)).localeCompare(String(recDate(c))); });
    var idx = null;
    if (seg.length) {
      var i0 = num(seg[0].indice), i1 = num(seg[seg.length - 1].indice);
      idx = { first: i0, last: i1, delta: round1(i1 - i0), n: seg.length };
    }
    return { n: s.length, from: first.date, to: last.date, series: s, L: axis("L"), D: axis("D"), C: axis("C"), indice: idx, patron: lastPatron(p) };
  }
  function lastPatron(p) {
    var cands = [];
    ["screening_tec", "cuestionario_tec", "screening_seg"].forEach(function (t) {
      var b = p.tools[t]; if (!b) return;
      (b.records || []).forEach(function (r) { var v = pick(r.patron, r.perfil); if (v) cands.push({ d: recDate(r), v: v }); });
    });
    cands.sort(function (a, c) { return String(a.d).localeCompare(String(c.d)); });
    return cands.length ? cands[cands.length - 1].v : null;
  }

  /* 2 · ADHERENCIA: capacidad de llevar a cabo las tareas (constancia real). */
  function adherenceReport(p) {
    var recs = allRecords(p);
    if (!recs.length) return null;
    var uniq = {}; recs.forEach(function (x) { var d = recDate(x.r); if (d) uniq[d] = 1; });
    var days = Object.keys(uniq).sort();
    var rng = dateRange(p);
    var spanDays = rng ? daysBetween(rng.from, rng.to) + 1 : days.length || 1;
    var weeks = Math.max(1, spanDays / 7);
    var byTool = {};
    recs.forEach(function (x) { byTool[x.tool] = (byTool[x.tool] || 0) + 1; });
    var tools = Object.keys(byTool).map(function (t) { return { tool: t, n: byTool[t] }; })
      .sort(function (a, c) { return c.n - a.n; });
    return {
      total: recs.length, activeDays: days.length, spanDays: spanDays,
      perWeek: round1(recs.length / weeks), daysPerWeek: round1(days.length / weeks),
      coverage: Math.round(100 * days.length / spanDays), streak: maxStreak(days),
      tools: tools, lastActive: days[days.length - 1] || null
    };
  }

  /* 3 · RESULTADOS de las tareas: efecto antes→después de cada práctica. */
  function outcomesReport(p) {
    var out = {};
    var al = ((p.tools.bajar_alerta && p.tools.bajar_alerta.records) || [])
      .map(function (r) { return { a: num(pick(r.antes, r.alerta_antes)), d: num(pick(r.despues, r.alerta_despues)) }; })
      .filter(function (r) { return r.a != null && r.d != null; });
    if (al.length) {
      var sa = 0, sd = 0; al.forEach(function (r) { sa += r.a; sd += r.d; });
      var ma = sa / al.length, md = sd / al.length;
      out.alerta = { n: al.length, antes: round1(ma), despues: round1(md), deltaAbs: round1(ma - md), pct: ma ? Math.round(100 * (ma - md) / ma) : 0 };
    }
    var ac = ((p.tools.acompanar_sensacion && p.tools.acompanar_sensacion.records) || [])
      .map(function (r) { return { a: num(r.intensidad_antes), d: num(r.intensidad_despues) }; })
      .filter(function (r) { return r.a != null && r.d != null; });
    if (ac.length) {
      var aa = 0, ad = 0; ac.forEach(function (r) { aa += r.a; ad += r.d; });
      var maa = aa / ac.length, mad = ad / ac.length;
      out.acompanar = { n: ac.length, antes: round1(maa), despues: round1(mad), deltaAbs: round1(maa - mad), pct: maa ? Math.round(100 * (maa - mad) / maa) : 0 };
    }
    var mus = ((p.tools.ais_muscular && p.tools.ais_muscular.records) || [])
      .map(function (r) { return { a: num(pick(r.activacion_antes, r.antes)), d: num(pick(r.activacion_despues, r.despues)) }; })
      .filter(function (r) { return r.a != null && r.d != null; });
    if (mus.length) {
      var ua = 0, ud = 0; mus.forEach(function (r) { ua += r.a; ud += r.d; });
      var mua = ua / mus.length, mud = ud / mus.length;
      out.muscular = { n: mus.length, antes: round1(mua), despues: round1(mud), deltaAbs: round1(mua - mud), pct: mua ? Math.round(100 * (mua - mud) / mua) : 0 };
    }
    var bv = ((p.tools.brujula_valores && p.tools.brujula_valores.records) || []).slice()
      .sort(function (a, c) { return String(recDate(a)).localeCompare(String(recDate(c))); });
    if (bv.length) {
      var disc = function (r) { return num(pick(r.disc_total, r.discrepancia_total)); };
      var cer = function (r) { return num(pick(r.cercania_media, r.cercania_media_forma_de_relacionarme)); };
      var f = bv[0], l = bv[bv.length - 1];
      out.valores = {
        n: bv.length, max: num(l.max), discFirst: disc(f), discLast: disc(l), cerFirst: cer(f), cerLast: cer(l),
        discDelta: (disc(f) != null && disc(l) != null) ? round1(disc(l) - disc(f)) : null,
        cerDelta: (cer(f) != null && cer(l) != null) ? round1(cer(l) - cer(f)) : null
      };
    }
    var mono = monoDist(p);
    if (mono.total) out.mono = mono;
    return Object.keys(out).length ? out : null;
  }

  /* Síntesis objetiva: frases derivadas SOLO de los números anteriores. */
  function synthLines(sr, ad, oc) {
    var lines = [];
    if (sr) {
      var parts = [];
      [["latencia", "L"], ["densidad", "D"], ["continuidad", "C"]].forEach(function (pr) {
        var ax = sr[pr[1]];
        if (ax.delta != null) parts.push(pr[0] + " " + (ax.delta < -0.05 ? "↓" : ax.delta > 0.05 ? "↑" : "=") + fmtDelta(ax.delta));
      });
      if (parts.length) {
        var imp = ["L", "D", "C"].filter(function (k) { return sr[k].delta != null && sr[k].delta < -0.05; }).length;
        var wor = ["L", "D", "C"].filter(function (k) { return sr[k].delta != null && sr[k].delta > 0.05; }).length;
        var trend = imp > wor ? "tendencia global a la baja (menor captación atencional excesiva)"
          : wor > imp ? "tendencia global al alza (mayor captación atencional)"
          : "sin cambios netos relevantes entre medidas";
        lines.push("Screening L/D/C: " + parts.join(", ") + " → " + trend + ".");
      }
      if (sr.indice) lines.push("Índice de seguimiento: " + fmt(sr.indice.first) + " → " + fmt(sr.indice.last) + "/10 (" + fmtDelta(sr.indice.delta) + ") en " + sr.indice.n + " mediciones.");
    }
    if (ad) lines.push("Adherencia: " + ad.activeDays + " días activos de " + ad.spanDays + " del periodo (" + ad.coverage + "%), " + ad.perWeek + " registros/semana; racha máxima " + ad.streak + " día" + (ad.streak === 1 ? "" : "s") + ".");
    if (oc) {
      if (oc.alerta) lines.push("Regulación de la alerta: media " + oc.alerta.antes + " → " + oc.alerta.despues + " (" + pctSign(oc.alerta.pct) + ") en " + oc.alerta.n + " ejercicio" + (oc.alerta.n === 1 ? "" : "s") + ".");
      if (oc.acompanar) lines.push("Acompañar la sensación: intensidad " + oc.acompanar.antes + " → " + oc.acompanar.despues + " (" + pctSign(oc.acompanar.pct) + ") en " + oc.acompanar.n + " registro" + (oc.acompanar.n === 1 ? "" : "s") + ".");
      if (oc.muscular) lines.push("AIS muscular (tensión→distensión): activación " + oc.muscular.antes + " → " + oc.muscular.despues + " (" + pctSign(oc.muscular.pct) + ") en " + oc.muscular.n + " sesión" + (oc.muscular.n === 1 ? "" : "es") + ".");
      if (oc.valores && oc.valores.discDelta != null) lines.push("Valores (ACT): discrepancia " + oc.valores.discFirst + " → " + oc.valores.discLast + " (" + fmtDelta(oc.valores.discDelta) + "); cercanía " + fmt(oc.valores.cerFirst) + " → " + fmt(oc.valores.cerLast) + ".");
      if (oc.mono) { var pl = Math.round(100 * oc.mono.counts.lado / oc.mono.total); lines.push("Posición del mono: " + pl + "% de los check-ins «a mi lado» (acompañamiento) sobre " + oc.mono.total + " registros."); }
    }
    if (!lines.length) lines.push("Datos insuficientes para una síntesis cuantitativa; se muestran los registros disponibles.");
    return lines;
  }

  /* Ensambla el documento imprimible (HTML) del informe. */
  function buildInforme(p) {
    var sr = screeningReport(p), ad = adherenceReport(p), oc = outcomesReport(p);
    var rng = dateRange(p), today = new Date().toISOString().slice(0, 10);
    var syn = synthLines(sr, ad, oc);

    function axisRow(label, ax) {
      var arrow = ax.delta == null ? "" : (ax.delta < -0.05 ? "↓" : ax.delta > 0.05 ? "↑" : "→");
      var cls = ax.delta == null ? "" : (ax.delta < -0.05 ? "good" : ax.delta > 0.05 ? "bad" : "flat");
      return '<tr><th>' + esc(label) + '</th><td>' + fmt(ax.first) + '</td><td>' + fmt(ax.last) +
        '</td><td class="' + cls + '">' + arrow + " " + fmtDelta(ax.delta) + '</td></tr>';
    }
    var screeningHTML = sr
      ? '<table class="inf-tbl"><thead><tr><th>Dimensión (0–10)</th><th>Inicial</th><th>Actual</th><th>Δ</th></tr></thead><tbody>' +
          axisRow("Latencia", sr.L) + axisRow("Densidad", sr.D) + axisRow("Continuidad", sr.C) +
          (sr.indice ? '<tr><th>Índice seguimiento</th><td>' + fmt(sr.indice.first) + '</td><td>' + fmt(sr.indice.last) + '</td><td class="flat">' + (sr.indice.delta > 0 ? "↑ " : sr.indice.delta < 0 ? "↓ " : "→ ") + fmtDelta(sr.indice.delta) + '</td></tr>' : "") +
        '</tbody></table>' +
        '<p class="inf-note">' + sr.n + ' medidas entre ' + esc(sr.from) + ' y ' + esc(sr.to) + (sr.patron ? ' · patrón dominante: <b>' + esc(sr.patron) + '</b>' : '') + '.</p>' +
        (sr.series.length > 1 ? '<div class="inf-chart"><canvas id="chartInforme"></canvas></div>' : '')
      : '<p class="inf-empty">Sin registros de screening (Cuestionario/Screening TEC).</p>';

    var adhHTML = ad
      ? '<div class="inf-kpis">' +
          infKpi(ad.activeDays + "/" + ad.spanDays, "días activos (" + ad.coverage + "%)") +
          infKpi(ad.perWeek, "registros/semana") +
          infKpi(ad.daysPerWeek, "días activos/semana") +
          infKpi(ad.streak, "racha máx. (días)") +
        '</div>' +
        '<table class="inf-tbl"><thead><tr><th>Herramienta</th><th>Registros</th></tr></thead><tbody>' +
          ad.tools.map(function (t) { return '<tr><th>' + esc(TOOL_LABEL[t.tool] || t.tool) + '</th><td>' + t.n + '</td></tr>'; }).join("") +
        '</tbody></table>' +
        '<p class="inf-note">Última actividad registrada: ' + esc(ad.lastActive || "—") + '.</p>'
      : '<p class="inf-empty">Sin actividad registrada.</p>';

    var outParts = [];
    if (oc && oc.alerta) outParts.push(outBlock("Regulación de la alerta", oc.alerta.antes, oc.alerta.despues, pctSign(oc.alerta.pct), oc.alerta.n + " ejercicios de «Bajar la alerta»"));
    if (oc && oc.acompanar) outParts.push(outBlock("Acompañar la sensación", oc.acompanar.antes, oc.acompanar.despues, pctSign(oc.acompanar.pct), oc.acompanar.n + " registros (intensidad 0–10)"));
    if (oc && oc.muscular) outParts.push(outBlock("AIS muscular (tensión→distensión)", oc.muscular.antes, oc.muscular.despues, pctSign(oc.muscular.pct), oc.muscular.n + " sesiones (activación 0–10)"));
    if (oc && oc.valores) outParts.push(
      '<div class="inf-out"><h4>Valores (ACT) · brújula</h4>' +
      '<div class="inf-ba"><span>' + fmt(oc.valores.discFirst) + (oc.valores.max ? "/" + oc.valores.max : "") + '</span><i>→</i><span>' + fmt(oc.valores.discLast) + (oc.valores.max ? "/" + oc.valores.max : "") + '</span>' +
      '<em>' + (oc.valores.discDelta == null ? "" : "discrepancia " + fmtDelta(oc.valores.discDelta)) + '</em></div>' +
      '<p class="inf-note">Cercanía media a los valores: ' + fmt(oc.valores.cerFirst) + ' → ' + fmt(oc.valores.cerLast) + (oc.valores.cerDelta == null ? "" : " (" + fmtDelta(oc.valores.cerDelta) + ")") + ' · ' + oc.valores.n + ' brújulas.</p></div>');
    if (oc && oc.mono) {
      var pl = Math.round(100 * oc.mono.counts.lado / oc.mono.total);
      outParts.push('<div class="inf-out"><h4>Posición del mono</h4>' +
        '<div class="inf-ba"><span>' + pl + '%</span><em>«a mi lado» (acompañamiento) · ' + oc.mono.total + ' check-ins</em></div>' +
        '<p class="inf-note">' + POS_ORDER.map(function (k) { return POS_LABEL[k].replace(/ \(.*\)/, "") + ": " + oc.mono.counts[k]; }).join(" · ") + '.</p></div>');
    }
    var outHTML = outParts.length ? outParts.join("") : '<p class="inf-empty">Sin registros con medida antes→después.</p>';

    return {
      html:
        '<div class="informe-doc" id="informeDoc">' +
        '<header class="inf-head"><div><h1>Informe de evolución · APRENS</h1>' +
          '<p class="inf-sub">Modelo TEC (Teoría del Efecto Consciente) · AIS · ACT</p></div>' +
          '<div class="inf-logo">ap</div></header>' +
        '<div class="inf-meta"><div><span class="inf-lbl">Código de paciente</span><b>' + esc(p.codigo) + '</b></div>' +
          '<div><span class="inf-lbl">Periodo</span><b>' + (rng ? esc(rng.from) + " → " + esc(rng.to) : "—") + '</b></div>' +
          '<div><span class="inf-lbl">Registros</span><b>' + totalRecords(p) + " en " + Object.keys(p.tools).length + ' herramientas</b></div>' +
          '<div><span class="inf-lbl">Generado</span><b>' + esc(today) + '</b></div></div>' +

        '<section class="inf-sec"><h2><span class="inf-num">1</span> Evolución del screening</h2>' +
          '<p class="inf-lead">Captación atencional excesiva: latencia (tardanza en desengancharse), densidad (intensidad) y continuidad (persistencia). Un descenso indica menor sobrepensamiento.</p>' + screeningHTML + '</section>' +

        '<section class="inf-sec"><h2><span class="inf-num">2</span> Adherencia y realización de tareas</h2>' +
          '<p class="inf-lead">Capacidad del paciente para llevar a cabo las prácticas indicadas: constancia y cobertura del periodo.</p>' + adhHTML + '</section>' +

        '<section class="inf-sec"><h2><span class="inf-num">3</span> Resultados de las tareas</h2>' +
          '<p class="inf-lead">Efecto autoinformado de cada práctica (antes → después). El signo − indica reducción.</p>' +
          '<div class="inf-outs">' + outHTML + '</div></section>' +

        '<section class="inf-sec inf-synth"><h2><span class="inf-num">4</span> Síntesis objetiva (derivada de datos)</h2>' +
          '<ul class="inf-syn">' + syn.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join("") + '</ul></section>' +

        '<footer class="inf-foot">Documento de apoyo generado a partir de <b>datos autoinformados</b> por el paciente en la app APRENS. ' +
          'Resume evolución, adherencia y resultados de las tareas para <b>complementar</b> —no sustituir— la historia clínica y el juicio profesional. ' +
          'No constituye un diagnóstico. Datos tratados de forma seudonimizada (código de paciente).</footer>' +
        '</div>',
      series: sr && sr.series.length > 1 ? sr.series : null,
      text: informeText(p, sr, ad, oc, syn, rng, today)
    };
  }
  function infKpi(n, k) { return '<div class="inf-kpi"><div class="inf-kn">' + esc(n) + '</div><div class="inf-kk">' + esc(k) + '</div></div>'; }
  function outBlock(title, antes, despues, pct, note) {
    return '<div class="inf-out"><h4>' + esc(title) + '</h4>' +
      '<div class="inf-ba"><span>' + antes + '</span><i>→</i><span>' + despues + '</span><em>' + esc(pct) + '</em></div>' +
      '<p class="inf-note">' + esc(note) + '</p></div>';
  }

  /* Versión en texto plano (para pegar en el software de historia clínica). */
  function informeText(p, sr, ad, oc, syn, rng, today) {
    var L = [];
    L.push("INFORME DE EVOLUCIÓN · APRENS (TEC / AIS / ACT)");
    L.push("Código de paciente: " + p.codigo);
    L.push("Periodo: " + (rng ? rng.from + " → " + rng.to : "—") + "  |  Registros: " + totalRecords(p) + " en " + Object.keys(p.tools).length + " herramientas");
    L.push("Generado: " + today);
    L.push("");
    L.push("1) EVOLUCIÓN DEL SCREENING (0–10; ↓ = menos sobrepensamiento)");
    if (sr) {
      ["L", "D", "C"].forEach(function (k, i) {
        var name = ["Latencia", "Densidad", "Continuidad"][i], ax = sr[k];
        L.push("   - " + name + ": " + fmt(ax.first) + " → " + fmt(ax.last) + " (" + fmtDelta(ax.delta) + ")");
      });
      if (sr.indice) L.push("   - Índice seguimiento: " + fmt(sr.indice.first) + " → " + fmt(sr.indice.last) + "/10 (" + fmtDelta(sr.indice.delta) + ")");
      if (sr.patron) L.push("   - Patrón dominante: " + sr.patron);
    } else L.push("   (sin registros de screening)");
    L.push("");
    L.push("2) ADHERENCIA (realización de tareas)");
    if (ad) {
      L.push("   - Días activos: " + ad.activeDays + "/" + ad.spanDays + " (" + ad.coverage + "% del periodo)");
      L.push("   - Frecuencia: " + ad.perWeek + " registros/semana · " + ad.daysPerWeek + " días activos/semana");
      L.push("   - Racha máxima: " + ad.streak + " días · última actividad: " + (ad.lastActive || "—"));
      ad.tools.forEach(function (t) { L.push("     · " + (TOOL_LABEL[t.tool] || t.tool) + ": " + t.n); });
    } else L.push("   (sin actividad)");
    L.push("");
    L.push("3) RESULTADOS DE LAS TAREAS (antes → después)");
    if (oc && oc.alerta) L.push("   - Regulación de la alerta: " + oc.alerta.antes + " → " + oc.alerta.despues + " (" + pctSign(oc.alerta.pct) + "; n=" + oc.alerta.n + ")");
    if (oc && oc.acompanar) L.push("   - Acompañar la sensación: " + oc.acompanar.antes + " → " + oc.acompanar.despues + " (" + pctSign(oc.acompanar.pct) + "; n=" + oc.acompanar.n + ")");
    if (oc && oc.muscular) L.push("   - AIS muscular (tensión→distensión): " + oc.muscular.antes + " → " + oc.muscular.despues + " (" + pctSign(oc.muscular.pct) + "; n=" + oc.muscular.n + ")");
    if (oc && oc.valores) L.push("   - Valores (ACT): discrepancia " + fmt(oc.valores.discFirst) + " → " + fmt(oc.valores.discLast) + " (" + fmtDelta(oc.valores.discDelta) + "); cercanía " + fmt(oc.valores.cerFirst) + " → " + fmt(oc.valores.cerLast));
    if (oc && oc.mono) L.push("   - Posición del mono: " + Math.round(100 * oc.mono.counts.lado / oc.mono.total) + "% «a mi lado» (n=" + oc.mono.total + ")");
    if (!oc) L.push("   (sin medidas antes→después)");
    L.push("");
    L.push("4) SÍNTESIS OBJETIVA");
    syn.forEach(function (l) { L.push("   - " + l); });
    L.push("");
    L.push("Documento de apoyo basado en datos autoinformados. Complementa, no sustituye, la historia clínica ni el juicio profesional. No es un diagnóstico.");
    return L.join("\n");
  }

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
        '<span class="muted">' + (rng ? rng.from + " → " + rng.to : "sin fechas") + '</span>' +
        '<button id="btnInforme" class="btn btn-primary d-informe">📄 Generar informe</button></div>' +
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
    var bi = $("btnInforme"); if (bi) bi.onclick = function () { openInforme(p); };
  }

  /* ───────────────────────── Informe (overlay imprimible) ─────────────────── */
  var informeChart = null;
  function openInforme(p) {
    var ov = $("informeOverlay"), body = $("informeBody");
    var built = buildInforme(p);
    body.innerHTML = built.html;
    body._text = built.text;
    ov.style.display = "flex";
    ov.scrollTop = 0;
    if (informeChart) { try { informeChart.destroy(); } catch (e) {} informeChart = null; }
    if (built.series && window.Chart) {
      var ctx = $("chartInforme");
      if (ctx) {
        var s = built.series;
        informeChart = new Chart(ctx.getContext("2d"), {
          type: "line",
          data: {
            labels: s.map(function (x) { return x.date; }),
            datasets: [
              { label: "Latencia", data: s.map(function (x) { return x.L; }), borderColor: "#2d7dd2", backgroundColor: "#2d7dd2", tension: .3, pointRadius: 3, borderWidth: 2 },
              { label: "Densidad", data: s.map(function (x) { return x.D; }), borderColor: "#3a9e8c", backgroundColor: "#3a9e8c", tension: .3, pointRadius: 3, borderWidth: 2 },
              { label: "Continuidad", data: s.map(function (x) { return x.C; }), borderColor: "#5f9070", backgroundColor: "#5f9070", tension: .3, pointRadius: 3, borderWidth: 2 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, animation: false,
            plugins: { legend: { position: "bottom" } }, scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } } }
        });
      }
    }
  }
  function closeInforme() { $("informeOverlay").style.display = "none"; if (informeChart) { try { informeChart.destroy(); } catch (e) {} informeChart = null; } }
  async function copyInforme() {
    var txt = $("informeBody")._text || "";
    try { await navigator.clipboard.writeText(txt); toast("Informe copiado como texto (pégalo en la historia clínica)"); }
    catch (e) {
      var ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("Informe copiado como texto"); } catch (e2) { toast("No se pudo copiar"); }
      ta.remove();
    }
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

    $("infClose").addEventListener("click", closeInforme);
    $("infPrint").addEventListener("click", function () { window.print(); });
    $("infCopy").addEventListener("click", copyInforme);
    $("informeOverlay").addEventListener("click", function (e) { if (e.target === $("informeOverlay")) closeInforme(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("informeOverlay").style.display === "flex") closeInforme(); });
  }

  document.addEventListener("DOMContentLoaded", function () { wire(); showLock(); });
  window.APRENS_PANEL = { PanelStore: PanelStore, openInforme: openInforme,
    _metrics: { monoDist: monoDist, lccSeries: lccSeries, recentActivity: recentActivity },
    _report: { screeningReport: screeningReport, adherenceReport: adherenceReport, outcomesReport: outcomesReport, buildInforme: buildInforme } }; // para pruebas
})();
