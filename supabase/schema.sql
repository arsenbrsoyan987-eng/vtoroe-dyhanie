-- ============================================================
--  «Второе дыхание» — схема базы данных для Supabase
--  Выполните в Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- Профили ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  role text not null default 'athlete' check (role in ('athlete', 'trainer', 'admin')),
  trainer_id text,
  photo text,
  created_at timestamptz not null default now()
);

-- ---------- Тренировки ----------
create table if not exists public.trainings (
  id text primary key,
  name text not null,
  direction_id text not null default 'running',
  direction_name text not null default '',
  date date not null,
  time text not null,
  location text not null default '',
  trainer_id text not null default '',
  trainer_name text not null default 'Не назначен',
  duration text not null default '60 мин',
  level text not null default 'Все уровни',
  capacity int not null default 12 check (capacity >= 0),
  description text not null default '',
  equipment text[] not null default '{}',
  image text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Записи на тренировки ----------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  training_id text not null references public.trainings (id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlist', 'cancelled')),
  attended boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists registrations_training_idx on public.registrations (training_id);
create index if not exists registrations_user_idx on public.registrations (user_id);

-- ---------- Уведомления ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'info' check (type in ('info', 'warning', 'success', 'event')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- ---------- Личные результаты ----------
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  training_id text,
  date date not null,
  distance text,
  time text,
  notes text,
  rating int check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- ============================================================
--  Проверка роли без рекурсии в политиках
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_trainer_of(training text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trainings t
    join public.profiles p on p.trainer_id = t.trainer_id
    where t.id = training and p.id = auth.uid()
  );
$$;

-- ============================================================
--  Профиль создаётся автоматически при регистрации.
--  Роль всегда 'athlete': администратора назначает только владелец.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'athlete'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.trainings enable row level security;
alter table public.registrations enable row level security;
alter table public.notifications enable row level security;
alter table public.results enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles: читать свой" on public.profiles;
create policy "profiles: читать свой" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: править свой" on public.profiles;
create policy "profiles: править свой" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles: админ правит всех" on public.profiles;
create policy "profiles: админ правит всех" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- trainings ----------
drop policy if exists "trainings: читают все" on public.trainings;
create policy "trainings: читают все" on public.trainings
  for select using (true);

drop policy if exists "trainings: админ создаёт" on public.trainings;
create policy "trainings: админ создаёт" on public.trainings
  for insert with check (public.is_admin());

drop policy if exists "trainings: админ и тренер правят" on public.trainings;
create policy "trainings: админ и тренер правят" on public.trainings
  for update using (public.is_admin() or public.is_trainer_of(id));

drop policy if exists "trainings: админ удаляет" on public.trainings;
create policy "trainings: админ удаляет" on public.trainings
  for delete using (public.is_admin());

-- ---------- registrations ----------
drop policy if exists "registrations: свои, тренеру и админу" on public.registrations;
create policy "registrations: свои, тренеру и админу" on public.registrations
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_trainer_of(training_id)
  );

drop policy if exists "registrations: записывает себя" on public.registrations;
create policy "registrations: записывает себя" on public.registrations
  for insert with check (user_id = auth.uid());

drop policy if exists "registrations: отмена и отметка" on public.registrations;
create policy "registrations: отмена и отметка" on public.registrations
  for update using (
    user_id = auth.uid() or public.is_admin() or public.is_trainer_of(training_id)
  );

drop policy if exists "registrations: админ удаляет" on public.registrations;
create policy "registrations: админ удаляет" on public.registrations
  for delete using (public.is_admin());

-- ---------- notifications ----------
drop policy if exists "notifications: свои" on public.notifications;
create policy "notifications: свои" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications: админ рассылает" on public.notifications;
create policy "notifications: админ рассылает" on public.notifications
  for insert with check (public.is_admin());

drop policy if exists "notifications: отметить прочитанным" on public.notifications;
create policy "notifications: отметить прочитанным" on public.notifications
  for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications: админ удаляет" on public.notifications;
create policy "notifications: админ удаляет" on public.notifications
  for delete using (public.is_admin());

-- ---------- results ----------
drop policy if exists "results: свои" on public.results;
create policy "results: свои" on public.results
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "results: добавляет свои" on public.results;
create policy "results: добавляет свои" on public.results
  for insert with check (user_id = auth.uid());

drop policy if exists "results: правит свои" on public.results;
create policy "results: правит свои" on public.results
  for update using (user_id = auth.uid() or public.is_admin());

drop policy if exists "results: удаляет свои" on public.results;
create policy "results: удаляет свои" on public.results
  for delete using (user_id = auth.uid() or public.is_admin());

-- ============================================================
--  ВАЖНО: после первого входа владельца назначьте ему роль admin.
--  Раскомментируйте и выполните (email можно заменить своим):
-- ============================================================
-- update public.profiles
--    set role = 'admin', name = 'Брсоян Арсен Арменович'
--  where id = (select id from auth.users where email = 'arsenbrsoyan@yandex.ru');
