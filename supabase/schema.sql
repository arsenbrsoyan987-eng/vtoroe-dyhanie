-- ============================================================
--  «Второе дыхание» — схема базы данных для Supabase
--  Выполните в Supabase → SQL Editor → New query → Run
--  Файл идемпотентен: его можно запускать повторно.
-- ============================================================

-- ---------- Профили ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  name text not null default '',
  phone text not null default '',
  role text not null default 'athlete' check (role in ('athlete', 'trainer', 'admin')),
  trainer_id text,
  photo text,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Догоняем колонки для проектов, созданных по прежней версии файла
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists must_change_password boolean not null default false;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
-- Мягкое удаление: аккаунт исчезает из списков, но вход блокируется осознанно
alter table public.profiles add column if not exists deleted_at timestamptz;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_idx on public.profiles (created_at desc);

-- ---------- Приглашения ----------
-- Администратор заранее сообщает email и роль: при регистрации триггер
-- выдаёт их автоматически. Так тренер получает доступ без серверного ключа.
create table if not exists public.invitations (
  email text primary key,
  name text not null default '',
  role text not null default 'athlete' check (role in ('athlete', 'trainer')),
  trainer_id text,
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

create index if not exists trainings_date_idx on public.trainings (date, time);

-- ---------- Кэмпы ----------
-- Тренировочные сборы публикует только владелец клуба: отдельная таблица,
-- а не мероприятия, потому что у сборов своя программа, стоимость и срок.
create table if not exists public.camps (
  id text primary key,
  name text not null,
  location text not null default '',
  start_date date not null,
  end_date date,
  description text not null default '',
  full_description text not null default '',
  price text not null default '',
  program text[] not null default '{}',
  includes text[] not null default '{}',
  image text not null default '',
  images text[] not null default '{}',
  registration_open boolean not null default true,
  contact text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists camps_start_idx on public.camps (start_date desc);

-- ---------- Фотографии тренировок ----------
-- Отчёт с прошедшего занятия: тренер загружает снимки прямо с телефона,
-- они сразу появляются в галерее на странице тренировки.
create table if not exists public.training_photos (
  id uuid primary key default gen_random_uuid(),
  training_id text not null,
  url text not null,
  caption text not null default '',
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists training_photos_training_idx
  on public.training_photos (training_id, created_at desc);

-- ---------- Новости ----------
-- Новости пишут администратор и тренеры. Автор сохраняется, чтобы тренер
-- мог править и удалять только свои публикации.
create table if not exists public.news (
  id text primary key,
  title text not null,
  summary text not null default '',
  content text not null default '',
  date date not null default current_date,
  category text not null default 'Клуб',
  image text not null default '',
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists news_date_idx on public.news (date desc);

-- ---------- Записи на тренировки ----------
-- training_id без внешнего ключа: расписание публикуется файлом, и запись
-- не должна падать, если тренировка ещё не попала в таблицу trainings.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  training_id text not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlist', 'cancelled')),
  attended boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists registrations_training_idx on public.registrations (training_id);
create index if not exists registrations_user_idx on public.registrations (user_id);

-- Одна активная запись на тренировку: повторная вставка не создаёт дубль
create unique index if not exists registrations_unique_active
  on public.registrations (user_id, training_id)
  where status <> 'cancelled';

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

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

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

create index if not exists results_user_idx on public.results (user_id, date desc);

-- ============================================================
--  Проверка роли без рекурсии в политиках
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
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
stable
as $
  select exists (
    select 1
    from public.trainings t
    join public.profiles p on p.trainer_id = t.trainer_id
    where t.id = training and p.id = auth.uid()
  );
$;

-- Роль тренера без обращения к profiles из политик напрямую
create or replace function public.is_trainer()
returns boolean
language sql
security definer
set search_path = public
stable
as $
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('trainer', 'admin')
  );
$;

-- trainer_id моего профиля: по нему тренер закрепляет тренировку за собой
create or replace function public.my_trainer_id()
returns text
language sql
security definer
set search_path = public
stable
as $
  select p.trainer_id from public.profiles p where p.id = auth.uid();
$;

-- Тренер видит профиль спортсмена, если тот записан на его тренировку
create or replace function public.teaches(profile uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.registrations r
    join public.trainings t on t.id = r.training_id
    join public.profiles me on me.id = auth.uid()
    where r.user_id = profile
      and me.trainer_id is not null
      and t.trainer_id = me.trainer_id
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
as $func$
declare
  invite public.invitations;
begin
  select * into invite
    from public.invitations
   where lower(email) = lower(coalesce(new.email, ''))
   limit 1;

  insert into public.profiles (id, email, name, phone, role, trainer_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), invite.name, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(invite.role, 'athlete'),
    invite.trainer_id
  )
  on conflict (id) do update set email = excluded.email;

  if invite.email is not null then
    delete from public.invitations where email = invite.email;
  end if;

  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Роль, привязку к тренеру и email может менять только администратор.
-- Без этого триггера любой пользователь поднял бы себе права одним UPDATE.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.trainer_id := old.trainer_id;
    new.email := old.email;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.trainings enable row level security;
alter table public.registrations enable row level security;
alter table public.notifications enable row level security;
alter table public.results enable row level security;
alter table public.camps enable row level security;
alter table public.training_photos enable row level security;
alter table public.news enable row level security;

-- ---------- profiles ----------
-- Удалённый аккаунт не читается даже самим владельцем: при входе профиль
-- не найдётся, и приложение разлогинит его с сообщением «аккаунт удалён».
drop policy if exists "profiles: читать свой" on public.profiles;
create policy "profiles: читать свой" on public.profiles
  for select using (
    public.is_admin()
    or (deleted_at is null and (id = auth.uid() or public.teaches(id)))
  );

drop policy if exists "profiles: создать свой" on public.profiles;
create policy "profiles: создать свой" on public.profiles
  for insert with check (id = auth.uid() and role = 'athlete');

drop policy if exists "profiles: править свой" on public.profiles;
create policy "profiles: править свой" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles: админ правит всех" on public.profiles;
create policy "profiles: админ правит всех" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profiles: админ удаляет" on public.profiles;
create policy "profiles: админ удаляет" on public.profiles
  for delete using (public.is_admin());

-- ---------- trainings ----------
drop policy if exists "trainings: читают все" on public.trainings;
create policy "trainings: читают все" on public.trainings
  for select using (true);

drop policy if exists "trainings: админ создаёт" on public.trainings;
create policy "trainings: админ создаёт" on public.trainings
  for insert with check (public.is_admin());

-- Тренер ведёт расписание сам, но только по своим занятиям:
-- закрепить тренировку за чужим trainer_id нельзя.
drop policy if exists "trainings: тренер создаёт свои" on public.trainings;
create policy "trainings: тренер создаёт свои" on public.trainings
  for insert with check (
    public.is_admin()
    or (public.is_trainer() and trainer_id = public.my_trainer_id())
  );

drop policy if exists "trainings: админ и тренер правят" on public.trainings;
create policy "trainings: админ и тренер правят" on public.trainings
  for update using (public.is_admin() or public.is_trainer_of(id))
  -- Тренер не может «перевесить» занятие на чужой trainer_id
  with check (
    public.is_admin()
    or (public.is_trainer_of(id) and trainer_id = public.my_trainer_id())
  );

drop policy if exists "trainings: админ удаляет" on public.trainings;
create policy "trainings: админ удаляет" on public.trainings
  for delete using (public.is_admin() or public.is_trainer_of(id));

-- ---------- camps ----------
-- Читают все (публичный раздел), создаёт и меняет только владелец клуба.
drop policy if exists "camps: читают все" on public.camps;
create policy "camps: читают все" on public.camps
  for select using (true);

drop policy if exists "camps: админ создаёт" on public.camps;
create policy "camps: админ создаёт" on public.camps
  for insert with check (public.is_admin());

drop policy if exists "camps: админ правит" on public.camps;
create policy "camps: админ правит" on public.camps
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "camps: админ удаляет" on public.camps;
create policy "camps: админ удаляет" on public.camps
  for delete using (public.is_admin());

-- ---------- training_photos ----------
drop policy if exists "photos: читают все" on public.training_photos;
create policy "photos: читают все" on public.training_photos
  for select using (true);

-- Загрузить фото может администратор или тренер этой тренировки
drop policy if exists "photos: админ и тренер загружают" on public.training_photos;
create policy "photos: админ и тренер загружают" on public.training_photos
  for insert with check (
    public.is_admin()
    or (public.is_trainer_of(training_id) and author_id = auth.uid())
  );

drop policy if exists "photos: правка подписи" on public.training_photos;
create policy "photos: правка подписи" on public.training_photos
  for update using (
    public.is_admin() or (author_id = auth.uid() and public.is_trainer_of(training_id))
  );

drop policy if exists "photos: удаляет автор и админ" on public.training_photos;
create policy "photos: удаляет автор и админ" on public.training_photos
  for delete using (
    public.is_admin()
    or author_id = auth.uid()
    or public.is_trainer_of(training_id)
  );

-- ---------- news ----------
drop policy if exists "news: читают все" on public.news;
create policy "news: читают все" on public.news
  for select using (true);

-- Тренер публикует новости от своего имени, автор подставляется сам
drop policy if exists "news: админ и тренер создают" on public.news;
create policy "news: админ и тренер создают" on public.news
  for insert with check (
    public.is_admin() or (public.is_trainer() and author_id = auth.uid())
  );

drop policy if exists "news: автор и админ правят" on public.news;
create policy "news: автор и админ правят" on public.news
  for update using (public.is_admin() or author_id = auth.uid());

drop policy if exists "news: автор и админ удаляют" on public.news;
create policy "news: автор и админ удаляют" on public.news
  for delete using (public.is_admin() or author_id = auth.uid());

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
  for delete using (public.is_admin() or public.is_trainer_of(training_id));

-- ---------- notifications ----------
drop policy if exists "notifications: свои" on public.notifications;
create policy "notifications: свои" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications: админ рассылает" on public.notifications;
create policy "notifications: админ рассылает" on public.notifications
  for insert with check (public.is_admin());

-- Спортсмен может написать администратору (заявка на абонемент),
-- но не другому спортсмену
drop policy if exists "notifications: письмо администратору" on public.notifications;
create policy "notifications: письмо администратору" on public.notifications
  for insert with check (
    auth.uid() is not null
    and exists (
      select 1 from public.profiles p
      where p.id = user_id and p.role = 'admin'
    )
  );

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

-- ---------- invitations ----------
-- Политика создаётся здесь, а не рядом с таблицей: она ссылается на
-- public.is_admin(), которая определяется ниже по файлу.
alter table public.invitations enable row level security;

drop policy if exists "invitations: только админ" on public.invitations;
create policy "invitations: только админ" on public.invitations
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
--  Realtime: список пользователей и записи обновляются без перезагрузки
-- ============================================================
do $
declare
  t text;
begin
  foreach t in array array['profiles', 'registrations', 'notifications', 'results', 'trainings', 'camps', 'training_photos', 'news']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end;
$;

-- ============================================================
--  Storage: фотографии тренировок
--  Публичный бакет (снимки и так показываются на сайте), а загружать
--  и удалять файлы может только администратор или тренер этой тренировки.
--  Путь файла: <training_id>/<uuid>.jpg — по первой папке проверяем права.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('training-photos', 'training-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "storage: фото тренировок читают все" on storage.objects;
create policy "storage: фото тренировок читают все" on storage.objects
  for select using (bucket_id = 'training-photos');

drop policy if exists "storage: фото тренировок загружают" on storage.objects;
create policy "storage: фото тренировок загружают" on storage.objects
  for insert with check (
    bucket_id = 'training-photos'
    and auth.uid() is not null
    and (public.is_admin() or public.is_trainer_of((storage.foldername(name))[1]))
  );

drop policy if exists "storage: фото тренировок удаляют" on storage.objects;
create policy "storage: фото тренировок удаляют" on storage.objects
  for delete using (
    bucket_id = 'training-photos'
    and auth.uid() is not null
    and (public.is_admin() or public.is_trainer_of((storage.foldername(name))[1]))
  );

-- ============================================================
--  ВАЖНО: после первой регистрации назначьте владельцу роль admin.
--  Замените email на свой и выполните:
-- ============================================================
-- update public.profiles
--    set role = 'admin', name = 'Брсоян Арсен Арменович'
--  where email = 'arsenbrsoyan@yandex.ru';