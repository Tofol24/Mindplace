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
      Object.keys(this.data.patients).forEach(function (k) { migrarD(this.data.patients[k]); }, this);
      return true;
    },

    /* Relee la bóveda (otra pestaña del panel puede haber guardado mientras tanto). */
    reload: async function () {
      var v = this._readVault(), key = this._key;
      if (!key) return;
      // Otra pestaña ha borrado o recreado el panel: esta clave ya no vale, no se escribe.
      if (!v) throw new Error("boveda-cambiada");
      if (!v.data) return;
      var d; try { d = await decryptObj(key, v.data); } catch (e) { throw new Error("boveda-cambiada"); }
      if (this._key !== key) return;                        // se bloqueó mientras tanto
      this.data = d; if (!this.data.patients) this.data.patients = {};
      Object.keys(this.data.patients).forEach(function (k) { migrarD(this.data.patients[k]); }, this);
    },
    /* Releer → cambiar → guardar en exclusiva entre pestañas (Web Locks si existe). */
    exclusivo: function (fn) {
      var self = this;
      var run = async function () {
        try { await self.reload(); }
        catch (e) { if (e.message === "boveda-cambiada") { self.lock(); if (window.APRENS_PANEL_onLock) window.APRENS_PANEL_onLock(); } throw e; } if (!self._key) return null; var r = fn(); if (self._key) await self._persist(); return r; };
      return (navigator.locks && navigator.locks.request) ? navigator.locks.request("aprens-panel-boveda", run) : run();
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
      // dfg22 y DFG22 son la misma ficha, venga del .json o del enlace.
      var mismo = Object.keys(this.data.patients).filter(function (k) { return k.toUpperCase() === codigo.toUpperCase(); })[0];
      if (mismo) codigo = mismo;
      var p = this.data.patients[codigo] || (this.data.patients[codigo] = { codigo: codigo, tools: {}, updated: null });
      var added = 0, updated = 0, changed = 0;
      Object.keys(env.tools).forEach(function (toolId) {
        var src = env.tools[toolId] || {}; var recs = src.records || [];
        var dest = p.tools[toolId] || (p.tools[toolId] = { meta: src.meta || {}, records: [] });
        if (src.meta) dest.meta = src.meta;
        recs.forEach(function (r) {
          if (!r) return;
          if (toolId === "screening_seg") {                       // nunca entra la D antigua
            r = migrarRecD(Object.assign({}, r));
            if (r.D == null) delete r.D;                           // sin S5 no se pisa la D que ya hay
            if (r.activacion == null) delete r.activacion;         // ni la activación conocida
          }
          var i = -1;
          if (r.id != null) {
            i = dest.records.findIndex(function (x) { return x.id === r.id; });
            // El mismo registro pudo llegar antes sin id (backup del Screening): misma fecha.
            if (i < 0 && (r.date || r.fecha)) { var dd = r.date || r.fecha; i = dest.records.findIndex(function (x) { return x.id == null && (x.date || x.fecha) === dd && mismoContenido(x, r, toolId); }); }
          }
          else if (r.date || r.fecha) { var d = r.date || r.fecha; i = dest.records.findIndex(function (x) { return (x.date || x.fecha) === d && (x.id == null || mismoContenido(x, r, toolId)); }); }
          if (i >= 0) {
            var merged = Object.assign({}, dest.records[i], r);
            if (JSON.stringify(merged) !== JSON.stringify(dest.records[i])) changed++;
            dest.records[i] = merged; updated++;
          } else { dest.records.push(r); added++; }
        });
        dest.records.sort(function (a, c) { return String(recDate(a) || a.ts).localeCompare(String(recDate(c) || c.ts)); });
      });
      p.updated = env.exportado || new Date(0).toISOString();
      migrarD(p);   // copias de paneles anteriores traen la D antigua
      var est = env.estado || {};
      // Solo es «nuevo» si llega algo distinto (reabrir el mismo enlace no lo reactiva).
      if (est.recibido && (added || changed) && (!p.recibido || est.recibido > p.recibido)) p.recibido = est.recibido;
      if (est.pautaEnviada && (!p.pautaEnviada || est.pautaEnviada > p.pautaEnviada)) p.pautaEnviada = est.pautaEnviada;
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
      if (obj.type === "aprens-export" && obj.tools) envs = [Object.assign({}, obj, { estado: { recibido: new Date().toISOString() } })];
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

    /* Registros del Screening que llegan por enlace (#r=…) o pegados de WhatsApp.
       pac: código del paciente si el registro no lo trae (versiones antiguas). */
    importCodigo: function (code, pac) {
      var env = codigoToEnvelope(code, pac);
      if (!env) throw new Error("codigo-invalido");
      var r = this.mergeEnvelope(env);
      return { codigo: r.codigo, added: r.added, updated: r.updated, tipo: env._tipo };
    },

    /* Mensajes de WhatsApp de cualquier herramienta (pegados o por enlace #t=…). */
    importTexto: function (texto, pac) {
      var regs = parseMensajes(texto), codigo = normCodigoPac(pac);
      if (!regs.length || !codigo) throw new Error("texto-invalido");
      var tools = {};
      regs.forEach(function (x) {
        var b = tools[x.toolId] || (tools[x.toolId] = { meta: { nombre: x.nombre, v: 1 }, records: [] });
        b.records.push(x.record);
      });
      var now = new Date().toISOString();
      var r = this.mergeEnvelope({ type: "aprens-export", paciente: { codigo: codigo }, exportado: now, tools: tools, estado: { recibido: now } });
      return { codigo: r.codigo, added: r.added, updated: r.updated, n: regs.length,
        tipo: regs.length === 1 ? regs[0].nombre : regs.length + " registros" };
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
        // Solo los campos presentes: así no se borra lo que ya llegó por enlace.
        return sinVacios({ date: s.fecha || "", codigo: s.codigo || null,
          L: numOrNull(ice.L), D: numOrNull(ice.D), C: numOrNull(ice.C),
          patron: (s.analisis && s.analisis.dominante) || null,
          analisis: s.analisis || null, fase0: s.fase0 || null });
      });
      var seg = (p.seguimientos || []).map(function (s) {
        var sc = s.score || {};
        var rec = { date: s.fecha || "", perfil: s.perfil || null,
          L: numOrNull(sc.latencia), D: densidadSeg(s.resp, sc), C: numOrNull(sc.continuidad), dS5: true,
          activacion: numOrNull(sc.activacion),
          indice: numOrNull(sc.indice), score: s.score || null, resp: s.resp || null, cuali: s.cuali || null };
        return sinVacios(rec);
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
        exportado: p.updated || p.importado || new Date(0).toISOString(), tools: p.tools || {},
        estado: { recibido: p.recibido || null, pautaEnviada: p.pautaEnviada || null } };
    }).filter(function (env) { return env.tools && Object.keys(env.tools).length; });
  }
  function numOrNull(v) { return v == null || v === "" ? null : Number(v); }
  /* D del seguimiento = densidad emocional (S5, 0–10, alto = mejor), como la D del
     screening inicial. Antes se guardaba la activación (S1) como D. */
  function densidadSeg(resp, sc) {
    if (sc && sc.densidad != null) return numOrNull(sc.densidad);
    var v = resp && resp.S5;
    if (v != null && v !== "") return Math.round((4 - Number(v)) * 2.5 * 10) / 10;
    // score.S5 ya viene invertido (0–4, alto = mejor) en exportaciones que no traen resp.
    var w = sc && numOrNull(sc.S5);
    return w != null && w >= 0 && w <= 4 ? Math.round(w * 2.5 * 10) / 10 : null;
  }
  /* Migra seguimientos guardados con la D antigua (S1): la activación pasa a su
     campo y la D se recalcula desde S5; sin respuestas no se puede: D queda vacía
     para no mezclar dos medidas en la misma línea. Idempotente (marca dS5). */
  function migrarD(p) {
    var b = p && p.tools && p.tools.screening_seg; if (!b) return;
    (b.records || []).forEach(migrarRecD);
  }
  function migrarRecD(r) {
    if (!r) return r;
    if (r.dS5) { if (r.D == null) { var dd = densidadSeg(r.resp, r.score); if (dd != null) r.D = dd; } return r; }
    if (r.activacion == null) r.activacion = numOrNull(r.score && r.score.activacion != null ? r.score.activacion : r.D);
    r.D = densidadSeg(r.resp, r.score);
    r.dS5 = true;
    return r;
  }
  function sinVacios(o) { Object.keys(o).forEach(function (k) { if (o[k] == null) delete o[k]; }); return o; }
  // ¿Es el mismo registro? (para casar uno sin id con el que llega por enlace)
  function mismoContenido(x, r, toolId) {
    if (x.resp && r.resp) return JSON.stringify(x.resp) === JSON.stringify(r.resp);
    // Ante la duda se conservan los dos: perfil/patrón/código distintos = registros distintos.
    var mismos = ["patron", "perfil", "codigo", "cuali"].every(function (k) { return x[k] == null || r[k] == null || String(x[k]) === String(r[k]); });
    var igual = function (k) { var a = numOrNull(x[k]), b = numOrNull(r[k]); return a == null || b == null ? a === b : Math.abs(a - b) < 0.05; };
    var ambos = function (k) { return numOrNull(x[k]) != null && numOrNull(r[k]) != null; };
    if (!mismos || !["L", "C", "indice"].every(igual)) return false;
    if (ambos("D")) return igual("D") && (ambos("activacion") ? igual("activacion") : true);
    // Solo seguimientos migrados (sin S5, D vacía): basta si coincide la activación conservada.
    if (toolId === "screening_seg") return igual("activacion");   // también si falta en los dos
    return igual("D");
  }

  /* Código AICE-TEC / AICE-SEG → sobre aprens-export, puntuado con el MISMO motor
     que el Screening (../js/tec-screening.js). Mismos tool ids y campos L/D/C que
     tecBackupToEnvelopes, más las respuestas crudas para poder recalcular. */
  function pacienteDeCodigo(code) {
    var p = parseCodigo(code) || parseCodigoSeg(code);
    return p ? p.paciente : "";
  }
  // Id estable por registro: reabrir el mismo enlace no duplica, y dos registros
  // distintos del mismo día no se pisan.
  function idCodigo(code) { var h = 5381; for (var i = 0; i < code.length; i++) h = ((h << 5) + h + code.charCodeAt(i)) | 0; return "aice-" + (h >>> 0).toString(36) + "-" + code.length; }
  function codigoToEnvelope(code, pac) {
    var tools = {}, codigo, tipo, t = parseCodigo(code), id = idCodigo(code);
    if (t) {
      var a = analizar(t.resp);
      if (!a.dominante) return null;
      tools.screening_tec = { meta: { nombre: "Screening TEC (inicial)", v: 2 }, records: [{
        id: id, date: t.fecha || "", codigo: codificar(a), L: a.ice.L, D: a.ice.D, C: a.ice.C, patron: a.dominante,
        fase0: t.fase0, consent: t.consent, resp: t.resp }] };
      codigo = t.paciente; tipo = "screening inicial";
    } else {
      var s = parseCodigoSeg(code);
      if (!s) return null;
      var sc = scoreSeg(s.resp);
      tools.screening_seg = { meta: { nombre: "Screening · seguimiento", v: 2 }, records: [{
        id: id, date: s.fecha || "", perfil: s.perfil, L: sc.latencia, D: sc.densidad, C: sc.continuidad, indice: sc.indice,
        activacion: sc.activacion, dS5: true,
        score: sc, resp: s.resp, cuali: s.cuali, consent: s.consent }] };
      codigo = s.paciente; tipo = "seguimiento";
    }
    codigo = normCodigoPac(pac || codigo);
    if (!codigo) return null;
    var now = new Date().toISOString();
    return { type: "aprens-export", paciente: { codigo: codigo }, exportado: now, tools: tools, estado: { recibido: now }, _tipo: tipo };
  }

  /* Pauta de la semana: misma regla clínica que el Screening (moduloEvolucion).
     La base es el último screening inicial; si no hay respuestas, el perfil de 3 cifras. */
  function pautaInfo(p) {
    var tec = ((p.tools.screening_tec && p.tools.screening_tec.records) || []).slice();
    var seg = ((p.tools.screening_seg && p.tools.screening_seg.records) || []).slice()
      .sort(function (a, c) { return String(recDate(a)).localeCompare(String(recDate(c))); });
    if (!tec.length && !seg.length) return null;
    tec.sort(function (a, c) { return String(recDate(a)).localeCompare(String(recDate(c))); });
    var last = tec[tec.length - 1], a = null, code3 = null;
    if (last && last.resp) { a = analizar(last.resp); code3 = codificar(a); }
    else if (last && last.analisis && last.analisis.dominante) { a = last.analisis; code3 = codificar(a); }
    else {
      code3 = (last && last.codigo) || (seg.length && seg[seg.length - 1].perfil) || null;
      var dec = code3 && decodificar(String(code3));
      if (dec) a = { dominante: dec.patron, iceAlt: dec.ice, alivioDig: dec.alivio };
    }
    if (!a || !a.dominante) return null;
    // Tras una reevaluación, solo cuentan los seguimientos de la etapa actual.
    if (last && recDate(last)) seg = seg.filter(function (r) { return String(recDate(r)) >= String(recDate(last)); });
    var segs = seg.map(function (r) {
      return { score: r.score || { indice: num(r.indice), latencia: num(r.L), activacion: num(r.activacion), continuidad: num(r.C) }, resp: r.resp || {} };
    });
    var me = moduloEvolucion(segs, a, (last && last.fase0 && last.fase0.contexto) || "");
    return { mod: me.mod, motivo: me.motivo, code3: code3, nSeg: seg.length,
      cualis: seg.filter(function (r) { return r.cuali; }).slice(-3).reverse() };
  }
  // pautaEnviada = hasta qué registro recibido está respondido el paciente.
  function esPendiente(p) { return !!p.recibido && (!p.pautaEnviada || p.recibido > p.pautaEnviada); }

  /* ───────────────────────── Modelo / métricas ─────────────────────────── */
  var TOOL_LABEL = {
    cuestionario_tec: "Cuestionario TEC", estado_mono: "Estado del mono",
    donde_esta_mono: "¿Dónde está el mono?", agenda_atencional: "Agenda atencional",
    ais_curiosidad: "AIS curiosidad", bajar_alerta: "Bajar la alerta",
    brujula_valores: "Brújula de valores", acompanar_sensacion: "Acompañar la sensación",
    ais_amor: "AIS desde el amor", ais_muscular: "AIS muscular", mapa_atencion_interna: "Mapa interno",
    screening_tec: "Screening TEC/AIS", seguimiento_tec: "Seguimiento TEC",
    screening_seg: "Screening · seguimiento", tracker_tec: "Tracker TEC",
    control_ira: "Control de ira", retorno_trabajo: "Retorno al trabajo", tracker_ais: "Tracker AIS",
    autorregistro: "Autorregistro", registro_texto: "Registro TEC/AIS",
    donde_mono: "¿Dónde está el mono?", herramienta_diaria: "Herramienta diaria", protocolo_ais: "Protocolo AIS (audio)",
    compromiso_semanal: "Compromiso semanal",
    // Herramientas nuevas (para que el panel muestre el nombre, no el id)
    honestidad_emocional: "Honestidad emocional", la_manada: "La manada (el porqué)",
    estoy_aqui_conmigo: "Estoy aquí conmigo", toco_desde_dentro: "Toco desde dentro",
    pedalea_desde_dentro: "Pedalea desde dentro", cuento_familia: "La familia de Koa (cuento)",
    tiempo_limite: "El tiempo límite (peques)", fondos_frases: "Fondos de frases",
    escalera_exposicion: "La escalera (exposición)", exploradora_valiente: "La exploradora valiente",
    escalera_comidas: "La escalera de las comidas",
    ritual_calma: "Ritual diario · calma", rincon_calma: "Rincón de calma",
    agenda_atencional: "Agenda atencional", tracker_ais: "Tracker AIS",
    cuerpo_en_alerta: "Cuando el cuerpo sigue en alerta",
    microaccion_valor: "Micro-acción con valor (0/1)",
    registro_texto: "Registro (texto)", reto_mona: "Reto: salir con mi mona", autorregistro_hospital: "Autorregistro hospital",
    eines_setmana: "Eines de la setmana", dolor_cronico: "Dolor crónico"
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
        // D puede faltar (seguimientos antiguos sin S5): se dibuja con hueco, sin perder L y C.
        if (num(r.L) != null && num(r.C) != null)
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
      case "screening_seg": case "seguimiento_tec": return "índice " + fmt(r.indice) + "/10" + (r.L != null ? " · L " + r.L + " · D " + fmt(r.D) + " · C " + r.C : (r.latencia != null ? " · latencia " + r.latencia + " · continuidad " + r.continuidad : "")) + (r.cuali ? " · «" + firstLine(r.cuali) + "»" : "");
      case "microaccion_valor": return num(r.cv) === 1 ? "✔ 1 · " + (r.descripcion ? firstLine(r.descripcion) : "micro-acción hecha") : "○ 0 · hoy no";
      default: return r.texto ? firstLine(r.texto.split("\n").slice(r.fuente === "texto" ? 1 : 0).join("\n") || r.texto) : "—";
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
      // Inicial = primer valor disponible del eje; actual = el del registro más reciente
      // (si le falta, «—»: no se presenta un dato antiguo como actual). Δ solo con dos mediciones.
      var i0 = -1; for (var i = 0; i < s.length; i++) if (s[i][k] != null) { i0 = i; break; }
      var a = i0 >= 0 ? s[i0][k] : null, b = last[k];
      var d = (a != null && b != null && i0 < s.length - 1) ? round1(b - a) : null;
      return { first: a, last: b, delta: d, desde: (i0 > 0 ? s[i0].date : null), dir: d == null ? "—" : (d < -0.05 ? "baja" : d > 0.05 ? "sube" : "estable") };
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
        // L/D/C del screening puntúan 0–10 con alto = mejor: subir es mejorar.
        var imp = ["L", "D", "C"].filter(function (k) { return sr[k].delta != null && sr[k].delta > 0.05; }).length;
        var wor = ["L", "D", "C"].filter(function (k) { return sr[k].delta != null && sr[k].delta < -0.05; }).length;
        var trend = imp > wor ? "tendencia global al alza (mayor regulación, menor sobrepensamiento)"
          : wor > imp ? "tendencia global a la baja (menor regulación)"
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
      if (oc.cv) lines.push("Micro-acción con valor (0/1): " + oc.cv.ones + " de " + oc.cv.n + " días con 1 (" + oc.cv.pct + "%); primeras dos semanas " + fmtPct(oc.cv.first.pct) + " → últimas dos semanas " + fmtPct(oc.cv.last.pct) + ".");
    }
    if (!lines.length) lines.push("Datos insuficientes para una síntesis cuantitativa; se muestran los registros disponibles.");
    return lines;
  }

  /* 4 · CONDUCTA VALIOSA (0/1): registro diario «Micro-acción con valor» del hub
     (TEC 11.4 / Anexo D). Criterio de resultado primario: actuar desde los
     valores mientras la sensación está presente. */
  function cvReport(p) {
    var b = p.tools.microaccion_valor; if (!b || !b.records || !b.records.length) return null;
    var recs = b.records.filter(function (r) { return num(r.cv) != null && recDate(r); })
      .sort(function (a, c) { return String(recDate(a)).localeCompare(String(recDate(c))); });
    if (!recs.length) return null;
    var d0 = recDate(recs[0]), d1 = recDate(recs[recs.length - 1]);
    function win(arr) { var o = arr.filter(function (r) { return num(r.cv) === 1; }).length; return { n: arr.length, ones: o, pct: arr.length ? Math.round(100 * o / arr.length) : null }; }
    var all = win(recs);
    return {
      n: all.n, ones: all.ones, pct: all.pct, from: d0, to: d1,
      first: win(recs.filter(function (r) { return daysBetween(d0, recDate(r)) < 14; })),
      last: win(recs.filter(function (r) { return daysBetween(recDate(r), d1) < 14; })),
      last7: win(recs.filter(function (r) { return daysBetween(recDate(r), d1) < 7; })),
      ejemplos: recs.filter(function (r) { return num(r.cv) === 1 && r.descripcion; }).slice(-3).map(function (r) { return r.descripcion; })
    };
  }
  function fmtPct(v) { return v == null ? "—" : v + "%"; }

  /* ───────── Exportación CSV · TEC Anexo E (registro diario del paciente) ─────────
     Columnas E.2 del libro. Una fila por día con actividad. Lo que no consta se
     deja vacío (no se inventa un 0). UTF-8 con BOM, separador «;», CRLF. */
  var AIS_TOOLS = ["ais_curiosidad", "ais_amor", "ais_muscular", "bajar_alerta", "acompanar_sensacion", "herramienta_diaria",
    "protocolo_ais", "estoy_aqui_conmigo", "toco_desde_dentro", "mapa_atencion_interna", "tracker_ais", "sentarse_mono",
    "respiracion_curiosa", "ritual_calma", "rincon_calma", "respiro_ais", "control_ira", "retorno_trabajo"];
  function zonaE(z) {
    var s = String(z || "").toLowerCase(); if (!s) return "";
    if (/pech|t[oó]rax|coraz/.test(s)) return "Pecho";
    if (/barrig|est[oó]mag|abdom|vientr|tripa/.test(s)) return "Barriga";
    if (/gargant|cuell|nuca/.test(s)) return "Garganta";
    if (/hombr|espald|trapec/.test(s)) return "Hombros";
    return "Otro";
  }
  function csvDiarioRows(p) {
    var days = {};
    function D(d) { return days[d] || (days[d] = { ais: 0, cv: null, desc: [], act: [], zona: [], fh: null, seg: null }); }
    allRecords(p).forEach(function (x) {
      var d = recDate(x.r); if (!d) return;
      var r = x.r, t = x.tool, o = D(d);
      if (AIS_TOOLS.indexOf(t) >= 0 || (t === "cuerpo_en_alerta" && r.ais === "Sí")) o.ais++;
      if (t === "microaccion_valor") { o.cv = num(r.cv); if (r.descripcion) o.desc.unshift(r.descripcion); }
      else {
        var m = pick(r.micro, r.microaccion, r.paso_valor); if (m) o.desc.push(m);
        if (t === "cuerpo_en_alerta" && ["Valiosa", "Asertiva", "Protectora necesaria"].indexOf(r.tipo_accion) >= 0 && o.cv == null) o.cv = 1;
      }
      // Activación del día (0–10, alto = más activación): el seguimiento la guarda invertida (alto = mejor).
      if (t === "screening_seg" && num(r.activacion) != null) o.seg = round1(10 - num(r.activacion));
      [pick(r.antes, r.alerta_antes, r.activacion_antes), r.intensidad_antes, (t === "cuerpo_en_alerta" ? r.activacion : null)]
        .forEach(function (v) { if (num(v) != null && !isNaN(num(v))) o.act.push(num(v)); });
      var z = pick(r.zona, r.zona_activacion, r.ancla); if (z) o.zona.push(z);
      if (t === "honestidad_emocional") o.fh = 1;
      if (r.frase_honesta != null && r.frase_honesta !== "") o.fh = (r.frase_honesta === 0 || r.frase_honesta === "0" || r.frase_honesta === false) ? 0 : 1;
    });
    var rows = [["id_paciente", "fecha", "practico_ais", "n_practicas_dia", "conducta_valiosa", "descripcion_cv", "nivel_activacion_dia", "zona_activacion", "frase_honesta", "notas_paciente"]];
    Object.keys(days).sort().forEach(function (d) {
      var o = days[d];
      var act = o.seg != null ? o.seg : (o.act.length ? round1(o.act.reduce(function (a, c) { return a + c; }, 0) / o.act.length) : "");
      rows.push([p.codigo, d, o.ais ? 1 : 0, o.ais, o.cv == null ? "" : o.cv, String(o.desc[0] || "").slice(0, 200), act, zonaE(o.zona[0]), o.fh == null ? "" : o.fh, ""]);
    });
    return rows;
  }
  function csvLDCRows(p) {
    var data = [];
    allRecords(p).forEach(function (x) {
      var r = x.r; if (num(r.L) == null && num(r.indice) == null) return;
      data.push([p.codigo, recDate(r), x.tool, num(r.L), num(r.D), num(r.C), num(r.indice)]);
    });
    data.sort(function (a, c) { return String(a[1]).localeCompare(String(c[1])); });
    return [["id_paciente", "fecha", "herramienta", "L", "D", "C", "indice"]].concat(data);
  }
  function csvCell(v) {
    if (v == null) return "";
    var s = String(v).replace(/\r?\n/g, " ");
    return /[;"]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function downloadCSV(name, rows) {
    var txt = "﻿" + rows.map(function (r) { return r.map(csvCell).join(";"); }).join("\r\n") + "\r\n";
    var blob = new Blob([txt], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* Ensambla el documento imprimible (HTML) del informe. */
  function buildInforme(p) {
    var sr = screeningReport(p), ad = adherenceReport(p), oc = outcomesReport(p);
    var cvr = cvReport(p); if (cvr) { oc = oc || {}; oc.cv = cvr; }
    var rng = dateRange(p), today = new Date().toISOString().slice(0, 10);
    var syn = synthLines(sr, ad, oc);

    function axisRow(label, ax) {
      var arrow = ax.delta == null ? "" : (ax.delta < -0.05 ? "↓" : ax.delta > 0.05 ? "↑" : "→");
      var cls = ax.delta == null ? "" : (ax.delta > 0.05 ? "good" : ax.delta < -0.05 ? "bad" : "flat");
      return '<tr><th>' + esc(label) + '</th><td>' + fmt(ax.first) + (ax.desde ? ' <small>(desde ' + esc(ax.desde) + ')</small>' : '') + '</td><td>' + fmt(ax.last) +
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
    if (cvr) {
      outParts.push('<div class="inf-out"><h4>Micro-acción con valor (0/1)</h4>' +
        '<div class="inf-ba"><span>' + fmtPct(cvr.first.pct) + '</span><i>→</i><span>' + fmtPct(cvr.last.pct) + '</span>' +
        '<em>días con 1 · primeras dos semanas → últimas dos semanas (' + cvr.ones + ' de ' + cvr.n + ' días en total)</em></div>' +
        '<p class="inf-note">Criterio de resultado primario (TEC): actuar desde los valores mientras la sensación está presente, no esperar a que baje.' +
        (cvr.ejemplos.length ? ' Últimas: ' + esc(cvr.ejemplos.join(' · ')) + '.' : '') + '</p></div>');
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
          '<p class="inf-lead">Parámetros TEC del screening (0–10, más alto = mejor): latencia (espacio entre la activación interna y la respuesta), densidad (ruido interno; alto = poco ruido) y continuidad (sostener atención y dirección sin fragmentarse). Un ascenso indica mayor regulación y menor sobrepensamiento.</p>' + screeningHTML + '</section>' +

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
        L.push("   - " + name + ": " + fmt(ax.first) + (ax.desde ? " (desde " + ax.desde + ")" : "") + " → " + fmt(ax.last) + " (" + fmtDelta(ax.delta) + ")");
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
    var nPend = ps.filter(esPendiente).length;
    $("pendCount").textContent = nPend; $("pendCount").style.display = nPend ? "inline-block" : "none";
    if ($("pfPend").checked) ps = ps.filter(esPendiente);
    if (filter) ps = ps.filter(function (p) { return p.codigo.toLowerCase().indexOf(filter.toLowerCase()) >= 0; });
    $("pcount").textContent = PanelStore.patients().length;
    $("listEmpty").style.display = PanelStore.patients().length ? "none" : "block";
    var ul = $("patientList");
    ul.innerHTML = ps.map(function (p) {
      var rng = dateRange(p);
      return '<li class="patient-item' + (selected === p.codigo ? " sel" : "") + '" data-code="' + esc(p.codigo) + '">' +
        '<div class="pi-code">' + esc(p.codigo) + (esPendiente(p) ? '<span class="pi-pend">nuevo</span>' : '') + '</div>' +
        '<div class="pi-meta">' + totalRecords(p) + ' registros' + (rng ? ' · ' + rng.to : '') + '</div></li>';
    }).join("");
    Array.prototype.forEach.call(ul.querySelectorAll(".patient-item"), function (li) {
      li.onclick = function () { selected = li.getAttribute("data-code"); renderList($("pfilter").value); renderDetail(); };
    });
  }

  /* Uso por herramienta, sumando los .json importados de todos los pacientes.
     Es el uso real de quien te envía sus datos (complementa el contador
     anónimo del índice de escritorio, que cuenta a todo el mundo sin saber quién). */
  function usoGlobal(dias) {
    var ymd = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    var hoyD = new Date(), hoy = ymd(hoyD), d0 = new Date(hoyD.getFullYear(), hoyD.getMonth(), hoyD.getDate() - (dias - 1)), desde = ymd(d0);
    var tools = {}, pacientes = [];
    PanelStore.patients().forEach(function (p) {
      var ult = "", recientes = 0, diasAct = {};
      Object.keys(p.tools).forEach(function (t) {
        var recs = p.tools[t].records || [];
        if (!recs.length) return;
        var u = tools[t] || (tools[t] = { pacientes: 0, registros: 0, recientes: 0, pacRecientes: 0, ultimo: "" });
        u.pacientes++; u.registros += recs.length;
        var rec = 0;
        recs.forEach(function (r) {
          var d = recDate(r);
          if (d > hoy) return;   // fechas futuras (relojes mal puestos): no cuentan
          if (d > u.ultimo) u.ultimo = d;
          if (d > ult) ult = d;
          if (d >= desde) { rec++; diasAct[d] = 1; }
        });
        u.recientes += rec; if (rec) u.pacRecientes++;
        recientes += rec;
      });
      pacientes.push({ codigo: p.codigo, ultimo: ult, recientes: recientes, dias: Object.keys(diasAct).length });
    });
    var lista = Object.keys(tools).map(function (t) { var u = tools[t]; u.id = t; return u; })
      .sort(function (a, b) { return b.recientes - a.recientes || b.registros - a.registros; });
    return { tools: lista, pacientes: pacientes.sort(function (a, b) { return (b.ultimo || "").localeCompare(a.ultimo || ""); }), desde: desde };
  }
  var usoDias = 30;
  function renderUso() {
    destroyCharts();
    selected = null; renderList($("pfilter").value);
    $("emptyDetail").style.display = "none";
    var body = $("detailBody"); body.style.display = "block";
    var g = usoGlobal(usoDias), max = Math.max.apply(null, g.tools.map(function (t) { return t.recientes; }).concat([1]));
    var activos = g.pacientes.filter(function (p) { return p.recientes > 0; }).length;
    body.innerHTML =
      '<div class="d-head"><h2>Uso por herramienta</h2><span class="muted">Datos de los .json importados · desde ' + esc(g.desde) + '</span>' +
        '<span class="uso-rango">' + [7, 30, 90, 365].map(function (d) {
          return '<button class="btn' + (d === usoDias ? ' btn-primary' : '') + '" data-dias="' + d + '" aria-pressed="' + (d === usoDias) + '">' + (d === 365 ? '1 año' : d + ' días') + '</button>'; }).join("") + '</span></div>' +
      '<div class="stat-row">' +
        stat(PanelStore.patients().length, "pacientes importados") +
        stat(activos, "con registros en el periodo") +
        stat(g.tools.filter(function (t) { return t.recientes; }).length, "herramientas usadas en el periodo") +
        stat(g.pacientes.reduce(function (s, p) { return s + p.recientes; }, 0), "registros en el periodo") +
      '</div>' +
      '<div class="card"><h3>Qué herramientas usan más</h3>' +
        '<div class="sub">Registros en el periodo, cuántos pacientes las usan y última vez. Solo cuenta lo que guarda registros; para aperturas y tiempo de uso de todo el mundo, mira el índice de escritorio.</div>' +
        (g.tools.length ? '<table class="uso-tabla"><thead><tr><th>Herramienta</th><th>Registros</th><th>Pacientes</th><th>Total</th><th>Último uso</th></tr></thead><tbody>' +
          g.tools.map(function (t) {
            return '<tr><td>' + esc(TOOL_LABEL[t.id] || t.id) + '</td>' +
              '<td><span class="uso-bar" style="width:' + Math.max(2, Math.round(110 * t.recientes / max)) + 'px"></span>' + t.recientes + '</td>' +
              '<td>' + t.pacRecientes + ' / ' + t.pacientes + '</td><td>' + t.registros + '</td><td>' + esc(t.ultimo || "—") + '</td></tr>';
          }).join("") + '</tbody></table>' : '<div class="nodata">Aún no hay datos importados.</div>') +
      '</div>' +
      '<div class="card"><h3>Actividad por paciente</h3>' +
        (g.pacientes.length ? '<table class="uso-tabla"><thead><tr><th>Código</th><th>Días activos</th><th>Registros</th><th>Última actividad</th></tr></thead><tbody>' +
          g.pacientes.map(function (p) {
            return '<tr><td><button class="linklike" data-code="' + esc(p.codigo) + '">' + esc(p.codigo) + '</button></td><td>' + p.dias + '</td><td>' + p.recientes + '</td><td>' + esc(p.ultimo || "—") + '</td></tr>';
          }).join("") + '</tbody></table>' : '<div class="nodata">Aún no hay pacientes.</div>') +
      '</div>';
    Array.prototype.forEach.call(body.querySelectorAll("[data-dias]"), function (b) {
      b.onclick = function () { usoDias = +b.getAttribute("data-dias"); renderUso(); var nb = body.querySelector('[data-dias="' + usoDias + '"]'); if (nb) nb.focus(); };
    });
    Array.prototype.forEach.call(body.querySelectorAll("[data-code]"), function (b) {
      b.onclick = function () { selected = b.getAttribute("data-code"); renderList($("pfilter").value); renderDetail(); };
    });
  }

  function renderDetail() {
    destroyCharts();
    var p = selected && PanelStore.data.patients[selected];
    $("emptyDetail").style.display = p ? "none" : "block";
    $("detailBody").style.display = p ? "block" : "none";
    if (!p) return;

    var rng = dateRange(p), mono = monoDist(p), al = alertaStat(p), val = valoresStat(p), ca = alertaData(p), cvr = cvReport(p);
    var pctLado = mono.total ? Math.round(100 * mono.counts.lado / mono.total) : null;
    var body = $("detailBody");

    body.innerHTML =
      '<div class="d-head"><h2>' + esc(p.codigo) + '</h2>' +
        '<span class="muted">' + (rng ? rng.from + " → " + rng.to : "sin fechas") + '</span>' +
        (esPendiente(p) ? '<span class="d-pend">● Pendiente de respuesta</span><button id="btnAtendido" class="btn">✓ Marcar como respondido</button>' : '') +
        '<button id="btnPegar" class="btn d-csv">📋 Pegar registro</button>' +
        '<button id="btnInforme" class="btn btn-primary d-informe">📄 Generar informe</button>' +
        '<button id="btnCsvDia" class="btn d-csv" title="Registro diario del paciente · formato TEC Anexo E.2 (UTF-8, separador ;)">⬇ CSV diario</button>' +
        '<button id="btnCsvLdc" class="btn d-csv" title="Evolución L/D/C e índice de seguimiento (0–10)">⬇ CSV L/D/C</button></div>' +
      '<div class="stat-row">' +
        stat(totalRecords(p), "registros") +
        stat(Object.keys(p.tools).length, "herramientas usadas") +
        stat(pctLado == null ? "—" : pctLado + "%", "% «a mi lado»") +
        stat(al ? (al.antes + "→" + al.despues) : "—", "alerta media (antes→después)") +
        stat(cvr ? cvr.ones + "/" + cvr.n : "—", "micro-acción con valor (días 1 / registrados)") +
      '</div>' +
      pautaCard(p) +
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
      (ca ? cuerpoAlertaCard(ca) : '') +
      '<div class="card"><h3>Actividad reciente</h3>' +
        '<table class="acts"><thead><tr><th>Fecha</th><th>Herramienta</th><th>Resumen</th></tr></thead><tbody>' +
        recentActivity(p, 30).map(function (x) {
          return '<tr><td class="date">' + esc(recDate(x.r) || "—") + '</td>' +
            '<td><span class="tag">' + esc(TOOL_LABEL[x.tool] || x.tool) + '</span></td>' +
            '<td>' + (x.r.texto
              ? '<details class="txt"><summary>' + esc(recSummary(x.tool, x.r)) + '</summary><pre>' + esc(x.r.texto) + '</pre></details>'
              : esc(recSummary(x.tool, x.r))) + '</td></tr>';
        }).join("") +
        '</tbody></table></div>';

    drawLCC(p);
    drawAlerta(p);
    var bp = $("btnPauta"); if (bp) bp.onclick = function () { openPauta(p); };
    var bg = $("btnPegar"); if (bg) bg.onclick = function () { openPegar(p.codigo); };
    var ba = $("btnAtendido"); if (ba) ba.onclick = function () { marcarAtendido(p); };
    var bi = $("btnInforme"); if (bi) bi.onclick = function () { openInforme(p); };
    var today = new Date().toISOString().slice(0, 10);
    var bd = $("btnCsvDia"); if (bd) bd.onclick = function () { downloadCSV("aprens_" + p.codigo + "_diario_" + today + ".csv", csvDiarioRows(p)); toast("CSV diario descargado (Anexo E.2)"); };
    var bl = $("btnCsvLdc"); if (bl) bl.onclick = function () { downloadCSV("aprens_" + p.codigo + "_LDC_" + today + ".csv", csvLDCRows(p)); toast("CSV L/D/C descargado"); };
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

  /* ───────── «Cuando el cuerpo sigue en alerta» (post-trauma) ───────── */
  function alertaData(p) {
    var b = p.tools.cuerpo_en_alerta; if (!b || !b.records || !b.records.length) return null;
    var recs = b.records;
    function mean(vals) { vals = vals.filter(function (n) { return !isNaN(n); }); if (!vals.length) return null; return round1(vals.reduce(function (a, c) { return a + c; }, 0) / vals.length); }
    var lats = recs.map(function (r) { return parseFloat(r.latencia); }).filter(function (n) { return !isNaN(n); });
    var series = recs.map(function (r) { return { date: recDate(r), act: parseFloat(r.activacion), fin: parseFloat(r.alivio) }; })
      .filter(function (x) { return !isNaN(x.act); })
      .sort(function (a, c) { return (a.date || "") < (c.date || "") ? -1 : 1; });
    return {
      faced: recs.length,
      ais: recs.filter(function (r) { return r.ais === "Sí"; }).length,
      latMed: lats.length ? Math.round(lats.reduce(function (a, c) { return a + c; }, 0) / lats.length) : null,
      valuable: recs.filter(function (r) { return ["Valiosa", "Asertiva", "Protectora necesaria"].indexOf(r.tipo_accion) >= 0; }).length,
      avoidant: recs.filter(function (r) { return ["Evitativa", "Compulsiva"].indexOf(r.tipo_accion) >= 0; }).length,
      actIni: mean(recs.map(function (r) { return parseFloat(r.activacion); })),
      actFin: mean(recs.map(function (r) { return parseFloat(r.alivio); })),
      series: series
    };
  }
  function cuerpoAlertaCard(ca) {
    return '<div class="card"><h3>Cuando el cuerpo sigue en alerta</h3>' +
      '<div class="sub">Post-trauma · presencia, latencia y recuperación de conducta.</div>' +
      '<div class="stat-row" style="margin:6px 0 0">' +
        stat(ca.faced, "situaciones afrontadas") +
        stat(ca.ais, "prácticas AIS") +
        stat(ca.latMed == null ? "—" : ca.latMed + " s", "latencia media") +
        stat((ca.actIni == null ? "—" : ca.actIni) + "→" + (ca.actFin == null ? "—" : ca.actFin), "activación (ini→fin)") +
      '</div>' +
      '<div class="stat-row" style="margin:6px 0 0">' +
        stat(ca.valuable, "conductas valiosas / asertivas") +
        stat(ca.avoidant, "conductas evitativas") +
      '</div>' +
      (ca.series.length > 1
        ? '<div class="chart-wrap"><canvas id="chartAlerta"></canvas></div><div class="sub" style="text-align:center">Activación por registro: inicial vs final.</div>'
        : '<div class="nodata" style="margin-top:8px">Aún no hay suficientes registros para el gráfico de activación.</div>') +
      '</div>';
  }
  function drawAlerta(p) {
    var ca = alertaData(p); if (!ca || ca.series.length < 2 || !window.Chart) return;
    var ctx = $("chartAlerta"); if (!ctx) return;
    charts.push(new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: ca.series.map(function (x) { return x.date; }),
        datasets: [
          { label: "Activación inicial", data: ca.series.map(function (x) { return x.act; }), borderColor: "#bf7256", backgroundColor: "#bf7256", tension: .3, pointRadius: 3, borderWidth: 2 },
          { label: "Activación final", data: ca.series.map(function (x) { return isNaN(x.fin) ? null : x.fin; }), borderColor: "#5c7d54", backgroundColor: "#5c7d54", tension: .3, pointRadius: 3, borderWidth: 2, spanGaps: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: "bottom" } }, scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } } }
    }));
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

  /* ───────────────────────── Pauta al paciente ─────────────────────────── */
  function pautaCard(p) {
    var pi = pautaInfo(p);
    if (!pi) return "";
    var m = MODULOS[pi.mod];
    return '<div class="card card-pauta"><h3>🎯 Pauta de esta semana · módulo ' + pi.mod + '</h3>' +
      '<div class="mod">' + esc(m.nombre) + '</div>' +
      '<div class="sub" style="margin:0">' + esc(m.prof) + '</div>' +
      '<div class="motivo">📌 <b>Por qué ahora:</b> ' + esc(pi.motivo) + '</div>' +
      (pi.code3 ? '<div class="codes">Perfil <b>AICE-' + esc(pi.code3) + pi.mod + '</b> · código de seguimiento para el paciente: <b>' + esc(pi.code3) + '</b></div>' : '') +
      (pi.cualis.length ? '<div class="sub" style="margin:0 0 4px">Lo que ha escrito en sus últimos registros:</div>' +
        pi.cualis.map(function (r) { return '<div class="cuali"><b>' + esc(recDate(r)) + ':</b> ' + esc(r.cuali) + '</div>'; }).join("") : '') +
      '<div class="acc" style="margin-top:10px"><button id="btnPauta" class="btn btn-primary">📲 Preparar mensaje de pauta</button></div>' +
      '<div class="sub" style="margin:10px 0 0;font-style:italic">La pauta sugerida no sustituye el criterio clínico.</div></div>';
  }
  var pautaPac = null;
  function pautaTexto() {
    var pi = pautaInfo(pautaPac);
    return mensajePauta(pi.mod, "", $("pautaCod").checked ? pi.code3 : "");
  }
  function openPauta(p) {
    pautaPac = p;
    var pi = pautaInfo(p);
    $("pautaCodWrap").style.display = pi.code3 ? "flex" : "none";
    $("pautaCodTxt").textContent = "Incluir su código de seguimiento (" + (pi.code3 || "") + ")";
    $("pautaCod").checked = !!pi.code3 && !pi.nSeg;   // primera pauta: aún no lo conoce
    $("pautaTa").value = pautaTexto();
    $("pautaModal").style.display = "flex"; $("app").inert = true;
    pautaVolver = document.activeElement;
    $("pautaTa").focus();
  }
  var pautaVolver = null;
  function closePauta() {
    var abierto = $("pautaModal").style.display === "flex";
    $("pautaModal").style.display = "none"; $("pautaTa").value = ""; pautaPac = null; $("app").inert = false;
    if (abierto && pautaVolver && document.body.contains(pautaVolver)) pautaVolver.focus();
  }
  /* p es la ficha tal como la estabas viendo: se marca como respondido hasta su
     último registro recibido; lo que llegue después (otra pestaña) sigue pendiente. */
  async function marcarAtendido(p) {
    var codigo = p.codigo, hasta = p.recibido || new Date().toISOString();
    try {
      await PanelStore.exclusivo(function () {
        var q = PanelStore.data.patients[codigo];
        if (q && (!q.pautaEnviada || hasta > q.pautaEnviada)) q.pautaEnviada = hasta;
      });
    } catch (e) { if (PanelStore._key) toast("⚠️ No se pudo guardar"); return; }
    if (!PanelStore._key) return;
    renderList($("pfilter").value); renderDetail();
  }

  /* ───────── Llegada por enlace (#r=…) o mensajes pegados ─────────
     El registro viaja en el fragmento de la URL: no pasa por ningún servidor.
     Se guarda en memoria hasta que el psicólogo abre el panel con su código. */
  var pendientes = [];
  function claveTexto(texto, pac) { return "T|" + normCodigoPac(pac || "") + "|" + texto; }
  function esClaveTexto(k) { return k.slice(0, 2) === "T|"; }
  function partesTexto(k) { var i = k.indexOf("|", 2); return { pac: k.slice(2, i), texto: k.slice(i + 1) }; }
  /* Enlaces #t=<texto comprimido>[&p=<paciente>] que añaden las herramientas. */
  function extraerTextos(str) {
    var out = [], re = /[#&]t=([A-Za-z0-9+\-$_]+)(?:&p=([^\s&#]*))?/g, m;
    while ((m = re.exec(String(str || "")))) {
      try {
        var t = window.LZString && LZString.decompressFromEncodedURIComponent(m[1].replace(/_/g, "$"));
        if (t) out.push(claveTexto(t, m[2] ? decodeURIComponent(m[2]) : ""));
      } catch (e) {}
    }
    return out;
  }
  function tomarHash() {
    var cs = extraerCodigos(location.hash).concat(extraerTextos(location.hash));
    if (!cs.length) return;   // el #r= se queda en la URL hasta guardarlo: recargar no lo pierde
    cs.forEach(function (c) { if (pendientes.indexOf(c) < 0) pendientes.push(c); });
    if (PanelStore._key) procesarPendientes(); else avisoLock();
  }
  function avisoLock() {
    var n = pendientes.length, el = $("lockPending");
    el.style.display = n ? "block" : "none";
    el.textContent = n ? "📥 Tienes " + (n === 1 ? "1 registro nuevo" : n + " registros nuevos") + " de tus pacientes. Entra con tu código y se guardará" + (n === 1 ? "" : "n") + " en su ficha." : "";
  }
  var procesando = false, sinGuardar = [];   // sinGuardar: [código, paciente] que fallaron al guardar
  async function procesarPendientes() {
    if (procesando || !PanelStore._key) return [];   // los nuevos se suman a la cola en curso
    procesando = true;
    var hechos = [], listos = sinGuardar.splice(0), malos = 0, fallo = false;
    try {
      while (pendientes.length) {
        var c = pendientes[0], pac;
        if (esClaveTexto(c)) pac = parseMensajes(partesTexto(c).texto).length ? partesTexto(c).pac : null;
        else pac = (parseCodigo(c) || parseCodigoSeg(c)) ? pacienteDeCodigo(c) : null;
        if (pac === null) { malos++; pendientes.shift(); continue; }
        if (!pac) pac = await pedirPaciente(c);
        pendientes.shift();
        if (pac) listos.push([c, pac]);
      }
      if (listos.length) {
        try {
          var ok = await PanelStore.exclusivo(function () {
            listos.forEach(function (x) {
              try { hechos.push(esClaveTexto(x[0]) ? PanelStore.importTexto(partesTexto(x[0]).texto, x[1]) : PanelStore.importCodigo(x[0], x[1])); }
              catch (e) { malos++; }
            });
            return true;
          });
          // Bloqueado a mitad (no se guardó): se conservan para la próxima entrada.
          if (ok !== true) { hechos = []; sinGuardar = listos; fallo = true; return []; }
        } catch (e) {
          // No se pudo guardar (p. ej. almacenamiento lleno): vuelven a la cola para reintentar.
          hechos = []; sinGuardar = listos; fallo = true;   // se reintenta en la próxima entrada o importación
          // Se devuelven a la URL: recargar la pestaña vuelve a intentarlo sin perder nada.
          try { history.replaceState(null, "", location.pathname + location.search + "#" + listos.map(function (x) {
            return esClaveTexto(x[0]) ? "t=" + LZString.compressToEncodedURIComponent(partesTexto(x[0]).texto).replace(/\$/g, "_") + "&p=" + encodeURIComponent(x[1])
              : "r=" + encodeURIComponent(x[0]); }).join("&")); } catch (e2) {}
          toast("⚠️ No se pudo guardar. No cierres esta pestaña: libera espacio y recárgala para reintentar.");
          return [];
        }
        if (!PanelStore._key) hechos = [];
      }
    } finally {
      procesando = false;
      if (!fallo && !pendientes.length && /[#&][rt]=/.test(location.hash)) {
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      }
      // Enlaces que llegaron mientras se guardaba: se procesan ahora.
      if (!fallo && pendientes.length && PanelStore._key) setTimeout(procesarPendientes, 0);
    }
    avisoLock();
    if (malos) toast(malos === 1 ? "Un registro no se pudo leer (¿enlace incompleto?)" : malos + " registros no se pudieron leer");
    if (!hechos.length) return hechos;
    selected = hechos[hechos.length - 1].codigo;
    renderList($("pfilter").value); renderDetail();
    toast(hechos.length === 1
      ? "✔ " + hechos[0].codigo + ": " + hechos[0].tipo + (hechos[0].added ? " guardado" : " (ya estaba, actualizado)")
      : "✔ " + hechos.length + " registros guardados");
    return hechos;
  }
  /* Registros antiguos (sin código de paciente): se pregunta a quién asignarlo. */
  function pedirPaciente(code) {
    return new Promise(function (resolve) {
      var t = !esClaveTexto(code) && parseCodigo(code), s = !t && !esClaveTexto(code) && parseCodigoSeg(code);
      var f = (t && t.fase0) || {};
      $("asigInfo").textContent = esClaveTexto(code)
        ? parseMensajes(partesTexto(code).texto).map(function (x) { return x.nombre + " (" + x.record.date + ")"; }).join(" · ") + "."
        : t
        ? "Screening inicial del " + (t.fecha || "—") + (f.nombre ? " · nombre: " + f.nombre : "") + (f.edad ? " · " + f.edad + " años" : "") + "."
        : "Seguimiento del " + ((s && s.fecha) || "—") + (s && s.perfil ? " · perfil " + s.perfil : "") + ".";
      $("asigLista").innerHTML = PanelStore.patients().map(function (p) { return '<option value="' + esc(p.codigo) + '">'; }).join("");
      $("asigCodigo").value = "";
      $("asignarModal").style.display = "flex"; $("app").inert = true;
      setTimeout(function () { $("asigCodigo").focus(); }, 50);
      var volver = document.activeElement;
      function fin(v) { $("asignarModal").style.display = "none"; $("app").inert = false;
        var f = (volver && document.body.contains(volver) && volver.offsetParent) ? volver : $("btnImport"); if (f && f.offsetParent) f.focus(); $("asigOk").onclick = $("asigSaltar").onclick = $("asigCodigo").onkeydown = null; resolve(v); }
      $("asigOk").onclick = function () { var v = normCodigoPac($("asigCodigo").value); if (v) fin(v); else $("asigCodigo").focus(); };
      $("asigSaltar").onclick = function () { fin(""); };
      $("asigCodigo").onkeydown = function (e) { if (e.key === "Enter") $("asigOk").onclick(); };
    });
  }

  /* ───────── Pegar registro en la ficha (como en el panel anterior) ───────── */
  var pegarCodigo = null;
  function openPegar(codigo) {
    pegarCodigo = codigo;
    $("pegarTit").textContent = "📋 Pegar registro — " + codigo;
    $("pegarTxt").value = ""; previewPegar();
    $("pegarModal").style.display = "flex"; $("app").inert = true;
    setTimeout(function () { $("pegarTxt").focus(); }, 50);
  }
  function closePegar() { $("pegarModal").style.display = "none"; $("pegarTxt").value = ""; $("pegarPrev").innerHTML = ""; $("app").inert = false; pegarCodigo = null; }
  function previewPegar() {
    var t = $("pegarTxt").value, regs = t.trim() ? parseMensajes(t) : [];
    $("pegarOk").disabled = !regs.length;
    $("pegarPrev").innerHTML = !t.trim() ? "" : !regs.length ? "No se reconoce ningún registro." :
      "Se guardarán <b>" + regs.length + "</b> registro" + (regs.length === 1 ? "" : "s") + ":<ul>" + regs.map(function (x) {
        var ldc = ["L", "D", "C"].filter(function (k) { return x.record[k] != null; }).map(function (k) { return k + " " + x.record[k]; }).join(" · ");
        return "<li><b>" + esc(x.nombre) + "</b> · " + esc(x.record.date) + " · " + esc(recSummary(x.toolId, x.record)) + (ldc ? " · " + esc(ldc) : "") + "</li>";
      }).join("") + "</ul>";
  }
  async function guardarPegar() {
    var t = $("pegarTxt").value, codigo = pegarCodigo; if (!codigo || !t.trim()) return;
    var res;
    try { res = await PanelStore.exclusivo(function () { return PanelStore.importTexto(t, codigo); }); }
    catch (e) { toast("⚠️ No se pudo guardar"); return; }
    if (!res) return;
    closePegar(); selected = res.codigo; renderList($("pfilter").value); renderDetail();
    toast("✔ " + res.codigo + ": " + res.n + " registro" + (res.n === 1 ? "" : "s") + (res.added ? "" : " (ya estaban)"));
  }

  /* ───────────────────────── Importar ─────────────────────────── */
  function openImport() { $("importModal").style.display = "flex"; $("impMsg").textContent = ""; }
  function closeImport() { $("importModal").style.display = "none"; }

  async function importText(txt, label) {
    var esJson = false; try { JSON.parse(txt); esJson = true; } catch (e) {}
    var cs = esJson ? [] : extraerCodigos(txt).concat(extraerTextos(txt));
    // Mensajes de las herramientas pegados tal cual (sin enlace): se pregunta de quién son.
    if (!esJson && !cs.length && parseMensajes(txt).some(function (x) { return esDeHerramienta(x.record.texto); })) cs = [claveTexto(txt, "")];
    if (cs.length) {
      closeImport();
      cs.forEach(function (c) { if (pendientes.indexOf(c) < 0) pendientes.push(c); });
      var hechos = await procesarPendientes();
      return hechos.length > 0;
    }
    var obj; try { obj = JSON.parse(txt); } catch (e) { setImp("No es un JSON válido" + (label ? " (" + label + ")" : ""), false); return false; }
    try {
      var res = await PanelStore.exclusivo(function () { return PanelStore.importAny(obj); });
      if (!res) return false;
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
      await PanelStore.create(a); showApp(); procesarPendientes();
    });
    $("formEntrar").addEventListener("submit", async function (e) {
      e.preventDefault();
      $("lockErr").textContent = "";
      var ok = await PanelStore.unlock($("cPass").value);
      if (ok) { $("cPass").value = ""; showApp(); procesarPendientes(); }
      else $("lockErr").textContent = "Código incorrecto.";
    });
    $("btnReset").addEventListener("click", function () {
      if (confirm("Esto BORRA todos los datos del panel en este dispositivo y no se pueden recuperar. ¿Continuar?")) {
        PanelStore.reset(); showLock();
      }
    });
    $("btnLock").addEventListener("click", function () { PanelStore.lock(); bloquearPantallas(); });
    $("btnImport").addEventListener("click", openImport);
    $("btnImport2").addEventListener("click", openImport);
    $("impClose").addEventListener("click", closeImport);
    $("btnBackup").addEventListener("click", backup);
    $("btnUso").addEventListener("click", renderUso);
    $("pfilter").addEventListener("input", function () { renderList(this.value); });
    $("pfPend").addEventListener("change", function () { renderList($("pfilter").value); });
    $("pegarTxt").addEventListener("input", previewPegar);
    $("pegarOk").addEventListener("click", guardarPegar);
    $("pegarClose").addEventListener("click", closePegar);
    $("pegarModal").addEventListener("click", function (e) { if (e.target === $("pegarModal")) closePegar(); });
    $("pautaClose").addEventListener("click", closePauta);
    $("pautaModal").addEventListener("click", function (e) { if (e.target === $("pautaModal")) closePauta(); });
    // Añade o quita solo la línea del código: respeta lo que ya hayas editado.
    $("pautaCod").addEventListener("change", function () {
      var ta = $("pautaTa"), pi = pautaPac && pautaInfo(pautaPac); if (!pi || !pi.code3) return;
      var t = ta.value.replace(/🔢 Para tus registros de seguimiento[^\n]*\n*/, "");
      if (this.checked) {
        var i = t.indexOf("No hace falta que salga perfecto");
        t = i >= 0 ? t.slice(0, i) + lineaCodSeg(pi.code3) + t.slice(i) : t.replace(/\s*$/, "\n\n") + lineaCodSeg(pi.code3).trim();
      }
      ta.value = t;
    });
    $("pautaWa").addEventListener("click", function () {
      this.href = "https://wa.me/?text=" + encodeURIComponent($("pautaTa").value);
    });
    $("pautaHecho").addEventListener("click", function () {
      var p = pautaPac; closePauta(); if (p) marcarAtendido(p);
    });
    $("pautaCopy").addEventListener("click", function () {
      var ta = $("pautaTa"), b = this; ta.select();
      (navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(ta.value) : Promise.reject())
        .catch(function () { try { document.execCommand("copy"); } catch (e) {} })
        .then(function () { b.textContent = "✓ Copiado"; setTimeout(function () { b.textContent = "📋 Copiar"; }, 1800); });
    });
    window.addEventListener("hashchange", tomarHash);
    window.addEventListener("storage", function (e) {
      if (!PanelStore._key || procesando) return;
      var conPauta = $("pautaModal").style.display === "flex";   // no se repinta con la pauta abierta
      PanelStore.reload().then(function () { if (PanelStore._key && !conPauta) { renderList($("pfilter").value); renderDetail(); } })
        .catch(function () { PanelStore.lock(); window.APRENS_PANEL_onLock(); });
    });
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
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("pautaModal").style.display === "flex") closePauta(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("pegarModal").style.display === "flex") closePegar(); });
  }

  /* Al bloquear: cerrar y vaciar todo lo que muestre datos clínicos. */
  function bloquearPantallas() {
    closePauta(); closePegar(); closeImport(); $("pasteBox").value = ""; closeInforme(); $("informeBody").innerHTML = "";
    if ($("asignarModal").style.display !== "none") $("asigSaltar").click();
    destroyCharts(); $("detailBody").innerHTML = ""; selected = null; showLock();
  }
  window.APRENS_PANEL_onLock = function () { bloquearPantallas(); toast("El panel ha cambiado en otra pestaña: vuelve a entrar."); };
  document.addEventListener("DOMContentLoaded", function () { wire(); showLock(); tomarHash(); });
  window.APRENS_PANEL = { PanelStore: PanelStore, openInforme: openInforme,
    _metrics: { monoDist: monoDist, lccSeries: lccSeries, recentActivity: recentActivity },
    _report: { screeningReport: screeningReport, adherenceReport: adherenceReport, outcomesReport: outcomesReport, buildInforme: buildInforme } }; // para pruebas
})();
