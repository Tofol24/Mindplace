# APRENS · Gestió de despatxos i comissions

Aplicació **interna** (no de cara al públic) per gestionar els **5 despatxos**
compartits entre les professionals d'APRENS, veure quins estan lliures i calcular
la **comissió del 20 %** que APRENS factura per servei — **sense cap nom de pacient**.

> **Para el informático de APRENS.** La app ya funciona tal cual (guarda en el
> propio navegador). Para que TODAS compartan la misma agenda en tiempo real hay
> que darle una base de datos compartida: ver **§3**. Es el único trabajo de fondo.

---

## 1. Qué hace

- **Agenda diaria** con 5 columnas (Despatx 1–5). Cada profesional reserva franjas
  de **30/35/40/45/50/55/60 min** en el despacho que esté libre.
- Muestra al instante si un despacho está **ocupado o libre** (bloquea solapes).
- **Sin nombres de pacientes**: cada reserva guarda solo profesional, despacho,
  día, hora, duración y una nota opcional.
- **Panel de comisiones**: por semana o por mes, cuenta sesiones por profesional y
  calcula la comisión (20 % configurable) sobre el servicio. Exporta a **CSV**.
- **Ajustes**: precio por sesión de cada profesional, % de comisión y franja horaria.

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

## 2. Cómo se usa (cada profesional)

1. Arriba a la derecha, elige tu nombre en **«Sóc:»**.
2. En **Agenda**, toca un hueco libre de un despacho → elige duración → **Reservar**.
   (O botón **＋ Nova reserva**.)
3. Toca una reserva **tuya** para anularla o cambiarla. Tòfol puede editar todas.
4. Tòfol, en **Comissions**, elige mes/semana y ve las sesiones y la comisión;
   **⬇ Exportar CSV** para facturar.

---

## 3. Hacerlo multiusuario (base de datos compartida) — trabajo del informático

La versión entregada guarda en `localStorage` (**solo ese dispositivo**). Está
escrita para que **solo haya que sustituir la capa `Store`** por una base de datos.
Recomendado: **[Supabase](https://supabase.com)** (Postgres + API + gratis, con
región EU — importante por RGPD).

### 3.1 Tabla (SQL)

```sql
create table reserves (
  id       text primary key,
  desp     int  not null check (desp between 1 and 5),
  prof     text not null,
  date     date not null,
  start    text not null,          -- "HH:MM"
  dur      int  not null,
  nota     text default '',
  created_at timestamptz default now()
);
create index on reserves (date);
alter table reserves enable row level security;
```

Define políticas RLS según quién puede leer/escribir (p. ej. solo usuarios
autenticados del equipo). Para identificar a cada profesional usa **Supabase Auth**
(un usuario/contraseña por profesional) en lugar del selector «Sóc:».

### 3.2 Sustituir la capa `Store` en `index.html`

Localiza `const Store = { ... }` y cámbialo por llamadas a Supabase. Como las
funciones pasan a ser asíncronas, `render()`, `renderReport()` y el guardado deben
usar `await` (o `.then`). Esquema:

```html
<script type="module">
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const sb = createClient('https://TU-PROYECTO.supabase.co', 'ANON_KEY');

  window.Store = {
    async all(){ const { data } = await sb.from('reserves').select('*'); return data || []; },
    async add(b){ b.id = crypto.randomUUID(); await sb.from('reserves').insert(b); return b; },
    async remove(id){ await sb.from('reserves').delete().eq('id', id); },
    async clear(){ await sb.from('reserves').delete().neq('id',''); }
  };
</script>
```

Añade el dominio de Supabase a `connect-src` en `_headers` (ya indicado allí).
Para refresco en vivo entre dispositivos, suscríbete a los cambios con
`sb.channel(...).on('postgres_changes', …, render)`.

> Si prefieres no programar nada: alternativa **sin código** = 5 calendarios de
> Google (uno por despacho) compartidos con el equipo (free/busy visible para
> todas). Inconveniente: el recuento de sesiones y la comisión hay que hacerlos
> aparte (hoja de cálculo o Apps Script). La app de aquí resuelve justo eso.

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
| `index.html`   | La aplicación completa (agenda + comisiones + ajustes). |
| `_headers`     | Cabeceras/CSP de Netlify. |
| `netlify.toml` | Despliegue como sitio Netlify propio. |
| `README.md`    | Esto. |
