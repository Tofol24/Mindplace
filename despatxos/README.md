# APRENS · Gestió de despatxos i comissions

Aplicació **interna** (no de cara al públic) per gestionar els **5 despatxos**
compartits entre les professionals d'APRENS, veure quins estan lliures i calcular
la **comissió del 20 %** que APRENS factura per servei — **sense cap nom de pacient**.

> **Para el informático de APRENS.** La app ya funciona tal cual (guarda en el
> propio navegador). Para que TODAS compartan la misma agenda (que se actualiza sola) hay
> que darle una base de datos compartida: ver **§3**. Es el único trabajo de fondo.

---

## 1. Qué hace

- **Acceso con contraseña**: cada profesional entra con su nombre y su clave y ve
  **sus** reservas y **lo que tiene que pagar** de comisión. Tòfol (propietario) lo ve todo.
- **Agenda diaria** con 5 columnas (Despatx 1–5). Cada profesional reserva franjas
  de **30/35/40/45/50/55/60 min** en el despacho que esté libre.
- Muestra al instante si un despacho está **ocupado o libre** (bloquea solapes).
- **Precio y duración por sesión**: los pone la profesional al reservar (con un
  precio sugerido por defecto, editable).
- **Citas recurrentes**: mismo día y hora repitiendo **semanal, quincenal o mensual**
  durante N sesiones (se pueden anular en serie).
- **Asistencia**: marcar cada sesión como **Realitzada / No realitzada / Pendent**.
  Las **no realizadas no cuentan** para la comisión, pero **quedan registradas**
  (nº de sesiones reservadas y no hechas al mes).
- **Sin nombres de pacientes**: cada reserva guarda solo profesional, despacho,
  día, hora, duración, precio, estado y una nota opcional.
- **Comisiones** (semana/mes): sesiones realizadas por profesional y comisión (20 %
  configurable). Exporta **CSV**.
- **Extractos mensuales**: visor por año con **bruto, comisión y neto** mes a mes
  (desde el 1 de cada mes). Exporta **CSV**.
- **Ajustes** (solo propietario): precio sugerido y **contraseña** de cada profesional,
  % de comisión y franja horaria.
- **Agenda externa (Doctoralia / Google Calendar)**: cada profesional puede pegar en su
  **Perfil** el enlace secreto **iCal** de su agenda; sus citas entran solas y **ocupan el
  despacho** elegido (para que nadie reserve encima). Entran como **«Ocupat»**, **sin nombre
  de paciente**, en solo lectura, y **no cuentan** para la comisión (solo bloquean). Necesita
  el modo servidor (Netlify Functions): ver **§3b**.

### Datos precargados (editables en el código)

| Despatx | Referencia |
|---|---|
| 1 | Tòfol (propietario; deja huecos para las flotantes) |
| 2 | Bea (PS) |
| 3 | Elena (PS) |
| 4 | Mariana (LP) |
| 5 | Cristina (PS) |

Profesionales: **Elena, Bea, Cristina, Victoria, Núria (PS)** y **Mariana (LP)**,
más **Tòfol**. **Victoria y Núria** no tienen despacho fijo: reservan el que esté
libre (por eso Tòfol deja huecos en el 1). Cualquiera puede reservar cualquier
despacho libre; la etiqueta del propietario es solo informativa.

Para cambiar nombres/colores/asignaciones: bloque `PROFS`, `OWNER_OF` y `DESPATXOS`
al principio del `<script>` en `index.html`.

---

## 2. Cómo se usa

1. **Entrar**: cada una elige su nombre y escribe su contraseña.
2. En **Agenda**, toca un hueco libre → elige duración, **precio**, **asistencia** y,
   si quieres, **repetir** (semanal/quincenal/mensual) → **Reservar**. (O **＋ Nova reserva**.)
3. Toca una reserva **tuya** para cambiarla, marcar si el paciente **vino o no**, o
   anularla (o anular toda la serie). Tòfol puede editar todas.
4. En **Comissions** ves tus sesiones realizadas y **lo que has de pagar** (20 %).
5. En **Extractes** ves el resumen mensual **bruto / comisión / neto** del año.
6. **⬇ Exportar CSV** en Comissions y Extractes para pasar cuentas.

### Contraseñas por defecto (cámbialas)

Al empezar, la contraseña de cada persona es **su nombre + `2026`** (p. ej.
`elena2026`, `tofol2026`). Tòfol las cambia en **⚙️ Ajustos** (columna «Contrasenya»).

> ⚠️ **Importante:** en esta versión (datos en el dispositivo) la contraseña es una
> **barrera ligera**, no seguridad real (el código es visible). La seguridad de
> verdad —cada una solo puede ver/editar lo suyo— llega al conectar la base de
> datos con **Supabase Auth** (§3). Hasta entonces, úsalo en dispositivos de confianza.

---

## 3. Activar el modo compartido con Supabase (trabajo del informático)

La app **ya trae toda la integración con Supabase hecha**. En modo local (por
defecto) guarda en el dispositivo; en cuanto rellenes las dos claves, pasa a
**agenda compartida (se actualiza sola) + seguridad real de servidor (RLS)** y login por
correo. No hay que reescribir código: solo configurar. ~20 minutos.

Recomendado: **[Supabase](https://supabase.com)** (Postgres + API,
plan gratis, con **región EU** — importante por RGPD).

### Paso a paso

1. **Crea el proyecto** en Supabase (elige región **EU**, p. ej. Frankfurt).
2. **Base de datos**: abre *SQL Editor → New query*, pega **todo** el archivo
   [`supabase-schema.sql`](./supabase-schema.sql) y pulsa **Run**. Eso crea las
   tablas `reserves` y `profiles`, las políticas de seguridad (RLS) y la vista de privacidad `agenda_view`.
3. **Usuarios**: en *Authentication → Users → Add user*, crea **un usuario por
   profesional** (email + contraseña). Copia el **UUID** de cada uno.
4. **Mapeo**: vuelve al *SQL Editor* y ejecuta el `insert into public.profiles ...`
   del final de `supabase-schema.sql` con los UUID reales (a Tòfol ponle `role`
   = `'owner'`).
5. **Claves en la app**: en *Settings → API* copia **Project URL** y **anon public
   key** y pégalas al principio de `index.html`:

   ```js
   const SUPA_URL = "https://TU-PROYECTO.supabase.co";
   const SUPA_KEY = "eyJ...";   // clave anon public
   ```

6. **Despliega** (Netlify). El `_headers` ya permite `*.supabase.co`.
   Al abrir la app, ahora pedirá **correo y contraseña** y cada una verá su agenda;
   la ocupación es común y se actualiza sola (cada ~40 s y al volver a la pestaña).

### Qué garantiza la seguridad (RLS) — máxima privacidad

- Cada profesional ve **su propio detalle** (precio, nota) solo de **sus** reservas.
- De las **demás** solo ve **ocupado/libre** de cada despacho (para saber cuál está
  libre): **sin precio ni nota**. Esto lo impone el **servidor** con la vista
  `agenda_view`, no el navegador: aunque alguien mire el código o la API, los
  importes ajenos no salen.
- Cada una solo puede **crear/editar/borrar lo suyo**.
- **Tòfol** (rol `owner`) ve **todas** las reservas con **detalle completo** e
  identifica cada una (nombre, despacho, hora, precio, nota, estado).

### Cómo está hecho por dentro (por si hay que mantenerlo)

- El cliente de Supabase va **self-hosted** en `vendor/supabase.js` (sin CDN).
- La capa `Store` de `index.html` funciona en los dos modos: mantiene una copia en
  memoria (`DATA`) que la interfaz pinta, escribe de forma **optimista** y persiste
  en Supabase. **Lee de la vista `agenda_view`** (no de la tabla), que aplica la
  privacidad de importes.
- **Refresco por sondeo** (no realtime): tus cambios se ven al instante; los de las
  demás aparecen en pocos segundos (cada ~40 s y al volver a la pestaña). Se hace así
  a propósito: el realtime emitiría los importes de las demás y rompería la privacidad.
- El login: en modo Supabase usa **Supabase Auth** (correo+contraseña) y la tabla
  `profiles` para saber qué profesional es cada usuario; en modo local usa el
  selector de nombre + PIN.

> Alternativa **sin programar nada**: 5 calendarios de Google (uno por despacho)
> compartidos con el equipo. Inconveniente: el recuento de sesiones y la comisión
> hay que hacerlos aparte. La app de aquí resuelve justo eso.

---

## 3b. Agenda externa (Doctoralia / Google Calendar) → ocupa el despacho

Cada profesional puede conectar su agenda de fuera para que sus citas **ocupen
automáticamente** su despacho en despatxos (sin nombres de paciente, solo «Ocupat»).

**Cómo lo usa cada una** (en **👤 Perfil → Agenda externa**):

1. Copia el **enlace secreto en formato iCal** de su agenda:
   - **Google Calendar** (ordenador): ⚙️ *Configuración* → elige su calendario → *Integrar
     el calendario* → **«Dirección secreta en formato iCal»**.
   - **Doctoralia**: en su Agenda → *Ajustes / Sincronizar calendario* → **«Dirección secreta
     en formato iCal»** (según plan).
2. Lo pega, elige **qué despacho ocupa** y pulsa **Desar** (o **Provar ara** para comprobar).

Sus citas aparecen como bloques grises **«🔒 Ocupat · agenda externa»** (con el nombre que trae
la cita, **privado**: solo lo ve ella), se refrescan solas (al entrar, al volver a la pestaña y
cada ~8 min) y **bloquean** ese hueco para las demás. Es sincronización **en un sentido** (fuera →
despatxos, solo lectura); no se puede escribir dentro de Doctoralia.

**Confirmar una cita externa** (convertirla en reserva real): al tocar un bloque gris propio se
abre «Confirmar cita externa». Si el nombre coincide con un paciente de su lista, se **enlaza solo**
(con su precio). Al confirmar pasa a ser una **reserva normal que SÍ cuenta** para la comisión, y
la sincronización **ya no la toca** (no la borra ni la duplica aunque siga en Google/Doctoralia).
Mientras no se confirma, solo **ocupa** y no cuenta.

**Qué necesita el informático** (una sola vez): el sitio de Netlify debe tener activas las
**Functions**. Ya viene configurado en `netlify.toml` (`[functions] directory = "netlify/functions"`)
y el proxy de solo lectura está en `netlify/functions/ical.js` (solo acepta hosts de Google
Calendar / Doctoralia, por seguridad). Al desplegar en Netlify se activa solo. Y ejecutar la
migración SQL (columnas `reserves.source`, `profiles.ical_url`, `profiles.ical_desp`) de
`supabase-schema.sql`.

> **Privacidad**: el enlace iCal es de **solo lectura** y las citas entran **sin el nombre del
> paciente** (solo día/hora/duración → «Ocupat»). El proxy no guarda nada y solo lee de Google
> Calendar o Doctoralia. Aun así, trata ese enlace secreto como una contraseña: quien lo tenga
> puede ver tu agenda.

---

## 4. Privacidad / RGPD

- La app **no guarda nombres de pacientes** por diseño.
- Al pasar a Supabase, aunque no haya nombres, hay datos del equipo: usa **región
  EU**, activa **RLS**, y limita el acceso a personas autenticadas.
- Sitio de **uso interno**: mantenlo con acceso restringido (login), no lo enlaces
  desde la web pública.

---

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html`          | La aplicación completa (agenda + comisiones + extractos + ajustes). |
| `vendor/supabase.js`  | Cliente de Supabase self-hosted (sin CDN). |
| `netlify/functions/ical.js` | Proxy de solo lectura para agendas iCal externas (Doctoralia / Google Calendar). |
| `supabase-schema.sql` | SQL a ejecutar en Supabase (tablas + seguridad RLS + vista de privacidad). |
| `_headers`            | Cabeceras/CSP de Netlify (permite `*.supabase.co`). |
| `netlify.toml`        | Despliegue como sitio Netlify propio. |
| `README.md`           | Esto. |
