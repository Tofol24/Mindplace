# APRENS · Agendas de reservas (Cal.com)

Página **autónoma** para que los pacientes reserven cita con cada profesional del
equipo. Cada psicóloga conecta **su** Google Calendar, define sus **huecos libres**
y **gestiona/reprograma** sus reservas con **su propia contraseña**. La agenda de
Tòfol sigue en Doctoralia (una tarjeta más de esta misma página).

> **Para el informático de APRENS:** todo lo que hay que tocar está en el bloque
> `CONFIGURACIÓN` al principio de `index.html` (la constante `PSICOLOGAS`). El
> resto no se toca.

---

## 1. Qué es y por qué así

La web `aprens.es` es **estática** (Netlify) y, por diseño, su CSP **bloquea todo
recurso de terceros** para no filtrar la IP del visitante. Un sistema de reservas
que lea calendarios y guarde citas necesita **un servicio por detrás**. La opción
elegida es **[Cal.com](https://cal.com)** (código abierto, gratis, con posibilidad
de autohospedaje y región EU):

- Cada profesional tiene **su cuenta y contraseña**.
- Conecta **su Google Calendar** → Cal lee sus huecos ocupados y solo ofrece los libres.
- El paciente reserva desde la web → el evento se crea en el Google Calendar de ella.
- Ella **reprograma/cancela** desde Cal o desde el enlace del correo.

Como Cal.com se carga desde `app.cal.com`, esta página **no puede** usar la CSP
"sin terceros" del sitio de inicio; por eso va **suelta**, con su propio `_headers`
(ya incluido) que abre **solo** lo justo para Cal.com.

---

## 2. Alta de una psicóloga (5–10 min por persona)

1. Ve a <https://cal.com> y crea una cuenta con **el correo de ella** (o invítala a
   crear la suya; si tenéis plan de equipo, invítala al equipo APRENS).
2. Que ella (o tú con ella) **conecte su Google Calendar**:
   *Settings → Apps / Calendars → Google Calendar → Connect.* Cal pedirá permiso a
   Google y a partir de ahí verá sus huecos ocupados.
3. **Disponibilidad:** *Availability* → define franjas y días que atiende.
4. **Tipo de cita (event type):** crea uno (p. ej. «Consulta», 50 min). Ahí se
   ajusta duración, descanso entre citas, antelación mínima, si pide teléfono, etc.
5. Copia su **enlace público**. Tiene el formato `usuario/tipo-de-evento`
   (p. ej. `maria-lopez/consulta`). Ese es el `calLink`.

---

## 3. Poner sus agendas en la página

Edita `index.html`, bloque `PSICOLOGAS`. Una entrada por profesional:

```js
{
  nombre: "María López",
  especialidad: "Psicóloga general sanitaria",
  descripcion: "Terapia individual para adultos.",
  inicial: "M",
  color: "#2E7D5E",
  tipo: "cal",
  calLink: "maria-lopez/consulta"   // ← el enlace del paso 2.5
}
```

Para la agenda de **Doctoralia** (Tòfol), se usa `tipo: "externo"` con el enlace real:

```js
{
  nombre: "Tòfol Villalonga",
  especialidad: "Psicólogo · Fundador de APRENS",
  descripcion: "Primera visita y seguimiento.",
  inicial: "T",
  color: "#1B4F8C",
  tipo: "externo",
  url: "https://www.doctoralia.es/tofol-villalonga"   // ← enlace real
}
```

- Mientras un `calLink` esté vacío o de ejemplo, la tarjeta muestra
  **«Agenda en preparación»** (no se rompe nada).
- `foto: "..."` es opcional; si no la pones, se muestra la inicial sobre el color.

---

## 4. Publicar / incrustar

Dos formas (elige una):

**A) Sitio Netlify propio** (recomendado). Nuevo sitio desde este repo con
`Base directory = agendas` (ver `netlify.toml`). Quedará en algo como
`https://aprens-agendas.netlify.app`.

**B) Incrustar por iframe** en una página de `aprens.es`:

```html
<iframe src="https://aprens-agendas.netlify.app/"
        title="Reserva de citas APRENS"
        style="width:100%;min-height:900px;border:0;"
        loading="lazy"></iframe>
```

> Si se incrusta dentro del sitio de inicio, recuerda que **su CSP bloqueará el
> iframe** (`frame-src 'self'`). Habría que añadir a `inicio/_headers`
> `frame-src https://aprens-agendas.netlify.app;` **o**, más limpio, enlazar a la
> página de reservas en vez de incrustarla. La página de reservas trae ya su
> `_headers` correcto; no toques la CSP del sitio de inicio salvo para el `frame-src`.

---

## 5. Cómo gestiona su agenda cada psicóloga

- Entra en <https://app.cal.com/login> con **su** correo y contraseña.
- Ahí ve sus **reservas**, y **reprograma/cancela**. Los pacientes también pueden
  reprogramar desde el enlace de su correo de confirmación.
- Cambiar huecos = editar su *Availability*. Los cambios se reflejan al instante
  en la web (la página lee su calendario en vivo).
- El pie de la página tiene un enlace discreto **«¿Eres del equipo? Gestiona tu
  agenda →»** que lleva a ese login.

---

## 6. Privacidad / RGPD (importante, son datos de salud)

- Al reservar, el nombre/correo del paciente y su IP pasan por los servidores de
  **Cal.com** (SaaS). Para una consulta de psicología conviene:
  - Usar la **región EU** de Cal.com o **autohospedarlo** (Cal.com es open source).
    Si lo haces, cambia `CAL_ORIGIN` en `index.html` y los dominios de `_headers`.
  - Firmar el **contrato de encargado de tratamiento (DPA)** con Cal.com.
  - Añadir un enlace a la **política de privacidad** de APRENS en el event type.
- Esta página **no** guarda datos por sí misma ni usa cookies propias; todo lo
  gestiona Cal.com.

---

## Archivos

| Archivo         | Para qué |
|-----------------|----------|
| `index.html`    | La página. Editas solo el bloque `PSICOLOGAS`. |
| `_headers`      | CSP/cabeceras que permiten Cal.com (y nada más). |
| `netlify.toml`  | Config para desplegar como sitio Netlify propio. |
| `README.md`     | Esto. |
