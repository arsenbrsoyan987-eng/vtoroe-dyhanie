-- ---------- Быстрые заявки (leads) ----------
-- Заявку оставляет гость без аккаунта, поэтому политика INSERT открыта для
-- всех. Контакты — персональные данные, поэтому читает список только
-- администратор. Повторное выполнение безопасно.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  training_id text not null default '',
  source text not null default '',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'worked', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_training_idx on public.leads (training_id);

alter table public.leads enable row level security;

-- Контакты заявителя — персональные данные: отдавать их всем нельзя.
drop policy if exists "leads: читает только админ" on public.leads;
create policy "leads: читает только админ" on public.leads
  for select using (public.is_admin());

drop policy if exists "leads: заявку оставляет любой" on public.leads;
create policy "leads: заявку оставляет любой" on public.leads
  for insert with check (
    length(trim(phone)) >= 10 and length(trim(phone)) <= 20 and length(trim(name)) <= 120
  );

drop policy if exists "leads: админ правит статус" on public.leads;
create policy "leads: админ правит статус" on public.leads
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leads: админ удаляет" on public.leads;
create policy "leads: админ удаляет" on public.leads
  for delete using (public.is_admin());

-- Realtime: админка sees новые заявки без перезагрузки
do $do$
begin
  execute format('alter publication supabase_realtime add table public.leads');
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$do$;