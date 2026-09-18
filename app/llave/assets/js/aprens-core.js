/* ============================================================================
   APRENS CORE  ·  v1
   Estándar de integración para las herramientas HTML de pacientes.
   ----------------------------------------------------------------------------
   QUÉ HACE
   - Da a TODA herramienta el mismo modelo de datos, almacenamiento con
     histórico (acumula, no sobreescribe) y un export unificado para el
     Panel del Psicólogo.
   - Identidad del paciente por CÓDIGO que asigna el psicólogo (ej. "MARTI-01").
     Pseudonimizado: no guarda nombre real en el dispositivo del paciente.

   CÓMO SE USA EN UNA HERRAMIENTA NUEVA (3 pasos)
   --------------------------------------------------------------------------
   1) Incrustar este archivo entero dentro de un <script> en el HTML
      (las herramientas se reparten como archivo suelto / Dropbox, así que
       deben ser autónomas: copia-pega este bloque, no lo enlaces).

   2) Configurar una vez, al cargar:
        Aprens.config({
          toolId:   "mi_herramienta",     // id estable, sin espacios
          toolName: "Mi Herramienta",     // nombre legible
          toolVersion: 1,
          pacienteCodigo: "MARTI-01"      // lo pones tú al generar el archivo
        });

   3) Guardar registros y ofrecer el export:
        Aprens.save({ date:"2026-05-30", animo:7, nota:"..." });
        Aprens.mountBar();   // pinta la barra de export (WhatsApp / archivo)

   El registro es un objeto libre. Recomendado incluir "date" (YYYY-MM-DD):
   si dos registros comparten "date" se ACTUALIZA el del día; si no, se añade.
   Cada registro recibe "ts" (timestamp) automáticamente si no lo trae.

   FORMATO DE EXPORT (lo que recibe el Panel del Psicólogo)
   --------------------------------------------------------------------------
     {
       "aprens": 1,
       "type": "aprens-export",
       "paciente": { "codigo": "MARTI-01" },
       "exportado": "2026-05-30T10:00:00.000Z",
       "tools": {
         "mi_herramienta": {
           "meta": { "nombre": "Mi Herramienta", "v": 1 },
           "records": [ { "date": "...", "ts": 0, ... } ]
         }
       }
     }
   ============================================================================ */
(function (global) {
  "use strict";

  var DB_KEY = "aprens_db";     // clave única en localStorage (por archivo)
  var SCHEMA = 1;

  var state = {
    toolId: null,
    toolName: null,
    toolVersion: 1
  };
  var collector = null;   // fn opcional que devuelve el registro "actual" al exportar

  // ---- almacenamiento -------------------------------------------------------
  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { schema: SCHEMA, paciente: { codigo: "" }, tools: {} };
  }
  function persist(db) {
    db.schema = SCHEMA;
    db.actualizado = new Date().toISOString();
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {}
    return db;
  }
  function toolBucket(db, create) {
    if (!db.tools[state.toolId] && create) {
      db.tools[state.toolId] = {
        meta: { nombre: state.toolName, v: state.toolVersion },
        records: []
      };
    }
    return db.tools[state.toolId];
  }

  // ---- API pública ----------------------------------------------------------
  var Aprens = {
    schema: SCHEMA,

    config: function (opts) {
      opts = opts || {};
      if (opts.toolId)       state.toolId = String(opts.toolId);
      if (opts.toolName)     state.toolName = String(opts.toolName);
      if (opts.toolVersion)  state.toolVersion = opts.toolVersion;
      if (opts.pacienteCodigo) this.setPacienteCodigo(opts.pacienteCodigo);
      // asegura meta actualizada
      if (state.toolId) {
        var db = load();
        var b = toolBucket(db, true);
        b.meta = { nombre: state.toolName, v: state.toolVersion };
        persist(db);
      }
      return this;
    },

    setPacienteCodigo: function (codigo) {
      var db = load();
      // no pisar un código ya fijado salvo que llegue uno no vacío distinto
      if (codigo) db.paciente.codigo = String(codigo).trim();
      persist(db);
      return this;
    },
    getPacienteCodigo: function () { return load().paciente.codigo || ""; },

    /* Guarda/actualiza un registro de la herramienta actual.
       Reglas de upsert (en este orden):
       - si record.id  -> reemplaza el de mismo id (sesiones repetibles)
       - si record.date y !opts.append -> reemplaza el del mismo día (registro diario)
       - en otro caso -> añade (frecuencia: varias veces al día)
       Devuelve el registro. */
    save: function (record, opts) {
      opts = opts || {};
      if (!state.toolId) { console.warn("[Aprens] falta config({toolId})"); return null; }
      record = record || {};
      if (record.ts == null) record.ts = Date.now();
      var db = load();
      var b = toolBucket(db, true);
      var i = -1;
      if (record.id != null) {
        i = b.records.findIndex(function (r) { return r.id === record.id; });
      } else if (record.date && !opts.append) {
        i = b.records.findIndex(function (r) { return r.date === record.date; });
      }
      if (i >= 0) b.records[i] = record; else b.records.push(record);
      b.records.sort(function (a, c) {
        return String(a.date || a.ts).localeCompare(String(c.date || c.ts));
      });
      persist(db);
      return record;
    },

    /* Registra un colector: una fn que devuelve el registro "actual" de la
       herramienta. Se invoca automáticamente justo antes de exportar/copiar,
       de modo que la herramienta solo persiste cuando el usuario decide enviar
       (respeta el "no guarda nada" hasta el momento del envío). */
    collect: function (fn) { collector = fn; return this; },
    _flush: function () {
      if (typeof collector === "function") {
        try { var r = collector(); if (r) this.save(r); } catch (e) {}
      }
    },

    /* Importa registros ya existentes de una herramienta legacy a su bucket
       (útil para retrofit: pásale el array de la clave antigua). */
    seed: function (records) {
      if (!Array.isArray(records)) return this;
      var db = load();
      var b = toolBucket(db, true);
      records.forEach(function (r) {
        if (r && r.ts == null) r.ts = Date.now();
      });
      b.records = records.slice();
      persist(db);
      return this;
    },

    history: function () {
      var b = load().tools[state.toolId];
      return b ? b.records.slice() : [];
    },

    /* Construye el sobre de export con TODAS las herramientas de este archivo. */
    buildEnvelope: function () {
      var db = load();
      return {
        aprens: SCHEMA,
        type: "aprens-export",
        paciente: { codigo: db.paciente.codigo || "" },
        exportado: new Date().toISOString(),
        tools: db.tools
      };
    },

    exportJSON: function () {
      this._flush();
      var env = this.buildEnvelope();
      var nombre = "aprens_" + (env.paciente.codigo || "paciente") + "_" +
                   (state.toolId || "datos") + "_" +
                   new Date().toISOString().slice(0, 10) + ".json";
      var blob = new Blob([JSON.stringify(env, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nombre;
      document.body.appendChild(a); a.click(); a.remove();
      return nombre;
    },

    copyJSON: function () {
      this._flush();
      var txt = JSON.stringify(this.buildEnvelope());
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(txt);
      }
      // fallback
      var ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove();
      return Promise.resolve();
    },

    /* Abre WhatsApp con un resumen legible (no el JSON crudo). */
    shareWhatsApp: function (texto) {
      var msg = texto || this.resumenTexto();
      global.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
    },

    /* Resumen humano del último registro de la herramienta actual. */
    resumenTexto: function () {
      var cod = this.getPacienteCodigo() || "—";
      var h = this.history();
      var last = h[h.length - 1];
      var l = ["APRENS · " + (state.toolName || state.toolId), "Código: " + cod,
               "Registros: " + h.length];
      if (last) {
        l.push("Último (" + (last.date || "") + "):");
        Object.keys(last).forEach(function (k) {
          if (k === "ts") return;
          l.push("· " + k + ": " + last[k]);
        });
      }
      l.push("", "(Adjunta también el archivo .json para el panel)");
      return l.join("\n");
    },

    /* Pinta una barra de export consistente al final del documento.
       Si no hay código de paciente, muestra un campo para introducirlo. */
    mountBar: function (opts) {
      opts = opts || {};
      var self = this;
      if (document.getElementById("aprensBar")) return;
      var bar = document.createElement("div");
      bar.id = "aprensBar";
      bar.setAttribute("style",
        "position:sticky;bottom:0;left:0;right:0;z-index:9999;margin-top:24px;" +
        "padding:10px 12px;background:#0f2a3f;color:#fff;font-family:system-ui," +
        "-apple-system,Segoe UI,Roboto,sans-serif;display:flex;gap:8px;" +
        "flex-wrap:wrap;align-items:center;justify-content:center;" +
        "box-shadow:0 -2px 12px rgba(0,0,0,.18);border-radius:14px 14px 0 0;");

      var cod = this.getPacienteCodigo();
      var codHtml = cod
        ? '<span style="opacity:.85;font-size:12px;">Código: <b>' + cod + '</b></span>'
        : '<input id="aprensCod" placeholder="Código paciente" ' +
          'style="padding:7px 9px;border-radius:8px;border:0;font-size:13px;width:150px;">';

      bar.innerHTML =
        codHtml +
        '<button id="aprensWA" style="' + btn("#25D366") + '">📱 WhatsApp</button>' +
        '<button id="aprensFile" style="' + btn("#2d7dd2") + '">⬇ Archivo .json</button>' +
        '<button id="aprensCopy" style="' + btn("#5a6b7b") + '">⧉ Copiar</button>';
      document.body.appendChild(bar);

      var codInput = document.getElementById("aprensCod");
      if (codInput) codInput.addEventListener("change", function () {
        self.setPacienteCodigo(this.value);
      });
      document.getElementById("aprensWA").onclick = function () {
        if (codInput) self.setPacienteCodigo(codInput.value);
        self.shareWhatsApp();
      };
      document.getElementById("aprensFile").onclick = function () {
        if (codInput) self.setPacienteCodigo(codInput.value);
        self.exportJSON();
      };
      document.getElementById("aprensCopy").onclick = function () {
        if (codInput) self.setPacienteCodigo(codInput.value);
        self.copyJSON().then(function () {
          var b = document.getElementById("aprensCopy");
          var t = b.textContent; b.textContent = "✓ Copiado";
          setTimeout(function () { b.textContent = t; }, 1500);
        });
      };
      function btn(bg) {
        return "padding:8px 12px;border:0;border-radius:9px;background:" + bg +
               ";color:#fff;font-size:13px;font-weight:600;cursor:pointer;";
      }
    }
  };

  global.Aprens = Aprens;
})(window);
