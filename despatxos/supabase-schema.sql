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
  created_at timestamptz default now()
);
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

-- Reservas: TODAS pueden LEER la ocupación (para saber qué despacho está libre)...
drop policy if exists "reserves_read_all" on public.reserves;
create policy "reserves_read_all" on public.reserves
  for select to authenticated using (true);

-- ...pero cada una solo CREA/EDITA/BORRA lo suyo (Tòfol, con rol owner, puede todo).
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

-- 5) TIEMPO REAL (que todas vean los cambios al instante) -------------------
alter publication supabase_realtime add table public.reserves;

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
