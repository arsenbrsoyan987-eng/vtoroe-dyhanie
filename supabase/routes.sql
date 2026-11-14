-- Маршруты: таблица + права + realtime.
-- Идемпотентно: можно запускать повторно.

create table if not exists public.routes (
  id text primary key,
  name text not null,
  type text not null default 'running',
  image text not null default '',
  distance text not null default '',
  elevation text not null default '',
  duration text not null default '',
  difficulty text not null default 'easy',
  description text not null default '',
  start_point text not null default '',
  map_url text not null default '',
  gpx_url text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routes_sort_idx on public.routes (sort_order);

alter table public.routes enable row level security;

-- Читают все, правит только администратор.
drop policy if exists "routes: читают все" on public.routes;
create policy "routes: читают все" on public.routes
  for select using (true);

drop policy if exists "routes: админ создаёт" on public.routes;
create policy "routes: админ создаёт" on public.routes
  for insert with check (public.is_admin());

drop policy if exists "routes: админ правит" on public.routes;
create policy "routes: админ правит" on public.routes
  for all using (public.is_admin()) with check (public.is_admin());

-- Обновления прилетают в админку и на страницу без перезагрузки.
do $do$
begin
  alter publication supabase_realtime add table public.routes;
exception
  when duplicate_object then null;
end;
$do$;

-- Перечитать кэш схем PostgREST, чтобы таблица сразу стала доступна API.
notify pgrst, 'reload schema';
