-- ============================================================================
-- APRENS · Despatxos — esquema de Supabase (base de datos compartida + seguridad)
-- ----------------------------------------------------------------------------
-- Ejecuta TODO este archivo una vez en: Supabase → SQL Editor → New query → Run.
-- Después: (1) crea un usuario por profesional en Authentication, (2) rellena la
-- tabla `profiles` con sus UUID (abajo), (3) pon Project URL + anon key en
-- index.html (CONFIG). Detalles paso a paso en README.md §3.
-- ============================================================================

-- 1) RESERVAS ---------------------------------------------------------------
create table if not exists public.reserves (
  id       text primary key,
  desp     int  not null check (desp between 1 and 5),
  prof     text not null,                 -- id de la profesional: 'elena', 'bea', ...
  date     date not null,
  start    text not null,                 -- "HH:MM"
  dur      int  not null,
  preu     numeric,                       -- precio de la sesión (€)
  estat    text not null default 'feta',  -- 'feta' | 'no' | 'pend'
  serie    text,                          -- id de serie recurrente (null si suelta)
  nota     text default '',
  pagament text default 'efectiu',        -- forma de pago: efectiu|bizum|transferencia|mensual|escola|beca|altre
  cobrat   boolean default true,          -- ¿cobrada? (escola/beca suelen ir pendientes)
  cobrat_data date,                       -- fecha de cobro (para comisiones "por caja"); null si pendiente
  beca_id  text,                          -- enlace a una beca (Fase B), null si ninguna
  created_at timestamptz default now()
);

-- 1b) BECAS (saldo prepagado que se va descontando por sesión) ---------------
create table if not exists public.beques (
  id           text primary key,
  prof         text not null,             -- profesional propietaria de la beca
  codi         text not null,             -- código/alias (SIN nombre de paciente)
  import_total numeric default 0,
  created_at   timestamptz default now()
);
alter table public.beques enable row level security;
-- Cada una gestiona SUS becas; Tòfol (owner), todas.
drop policy if exists "beques_all_own" on public.beques;
create policy "beques_all_own" on public.beques
  for all to authenticated
  using  (prof = public.my_prof() or public.is_owner())
  with check (prof = public.my_prof() or public.is_owner());
create index if not exists reserves_date_idx on public.reserves (date);

-- 2) PERFILES (mapea cada usuario de Auth con su profesional) ----------------
create table if not exists public.profiles (
  id   uuid primary key references auth.users(id) on delete cascade,
  prof text not null,                     -- 'tofol','bea','elena','mariana','cristina','victoria','nuria'
  role text default ''                    -- 'owner' para Tòfol; vacío para el resto
);

-- 3) FUNCIONES DE AYUDA (para las políticas) --------------------------------
create or replace function public.my_prof() returns text
  language sql stable security definer set search_path = public as $$
  select prof from public.profiles where id = auth.uid()
$$;
create or replace function public.is_owner() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'owner' from public.profiles where id = auth.uid()), false)
$$;

-- 4) SEGURIDAD (RLS) --------------------------------------------------------
alter table public.reserves enable row level security;
alter table public.profiles enable row level security;

-- Cada usuaria ve su propio perfil (necesario para el mapeo al entrar).
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select to authenticated using (id = auth.uid());

-- LECTURA de la tabla base: cada una solo lee SUS filas (con precio y nota).
-- La ocupación de las demás se lee por la vista `agenda_view` (paso 4b), que
-- oculta precio y nota. Tòfol (owner) lee todo.
drop policy if exists "reserves_read_all" on public.reserves;
drop policy if exists "reserves_read_own" on public.reserves;
create policy "reserves_read_own" on public.reserves
  for select to authenticated using (prof = public.my_prof() or public.is_owner());

-- Cada una solo CREA/EDITA/BORRA lo suyo (Tòfol, con rol owner, puede todo).
drop policy if exists "reserves_insert_own" on public.reserves;
create policy "reserves_insert_own" on public.reserves
  for insert to authenticated
  with check (prof = public.my_prof() or public.is_owner());

drop policy if exists "reserves_update_own" on public.reserves;
create policy "reserves_update_own" on public.reserves
  for update to authenticated
  using  (prof = public.my_prof() or public.is_owner())
  with check (prof = public.my_prof() or public.is_owner());

drop policy if exists "reserves_delete_own" on public.reserves;
create policy "reserves_delete_own" on public.reserves
  for delete to authenticated
  using (prof = public.my_prof() or public.is_owner());

-- 4b) VISTA DE AGENDA (privacidad de importes entre compañeras) --------------
-- Devuelve TODAS las reservas para pintar la ocupación de los 5 despachos, pero
-- a las reservas AJENAS les oculta `preu` y `nota`. Cada una ve su detalle
-- completo; Tòfol (owner) ve el detalle de todas. La app lee de esta vista.
-- (security_invoker=off → la vista lee todas las filas saltándose el RLS de la
--  tabla base, y decide qué ocultar según quién consulta.)
drop view if exists public.agenda_view;
create view public.agenda_view with (security_invoker = off) as
  select
    r.id, r.desp, r.prof, r.date, r.start, r.dur, r.estat, r.serie, r.created_at,
    case when r.prof = public.my_prof() or public.is_owner() then r.preu else null end as preu,
    case when r.prof = public.my_prof() or public.is_owner() then r.nota else null end as nota,
    case when r.prof = public.my_prof() or public.is_owner() then r.pagament else null end as pagament,
    case when r.prof = public.my_prof() or public.is_owner() then r.cobrat else null end as cobrat,
    case when r.prof = public.my_prof() or public.is_owner() then r.cobrat_data else null end as cobrat_data,
    case when r.prof = public.my_prof() or public.is_owner() then r.beca_id else null end as beca_id
  from public.reserves r;

grant select on public.agenda_view to authenticated;

-- Nota: no se usa realtime a propósito. Con realtime, los cambios de las demás se
-- emitirían con sus importes; para mantener la privacidad, la app refresca la vista
-- por sondeo (cada ~40 s y al volver a la pestaña). Tus cambios se ven al instante.

-- 6) MAPEO DE USUARIOS  -----------------------------------------------------
-- Crea antes un usuario por profesional en Authentication → Users → Add user
-- (email + contraseña). Copia el UUID de cada uno y rellena aquí:
--
-- insert into public.profiles (id, prof, role) values
--   ('UUID-DE-TOFOL',    'tofol',    'owner'),
--   ('UUID-DE-BEA',      'bea',      ''),
--   ('UUID-DE-ELENA',    'elena',    ''),
--   ('UUID-DE-MARIANA',  'mariana',  ''),
--   ('UUID-DE-CRISTINA', 'cristina', ''),
--   ('UUID-DE-VICTORIA', 'victoria', ''),
--   ('UUID-DE-NURIA',    'nuria',    '');
--
-- (Si añades o quitas profesionales, mantén el mismo id que en PROFS de index.html.)
