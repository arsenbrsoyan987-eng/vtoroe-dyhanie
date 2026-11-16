-- Разделы сайта и их карточки. Идемпотентно: можно выполнять повторно.
-- Применяйте, если общая схема (supabase/schema.sql) уже в базе, а разделов ещё нет.

create table if not exists public.sections (
  id text primary key,
  slug text not null unique,
  title text not null default '',
  subtitle text not null default '',
  icon text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sections_sort_idx on public.sections (sort_order);

-- Карточки раздела. ON DELETE CASCADE: удалили раздел — карточки уйдут вместе с ним.
create table if not exists public.section_cards (
  id text primary key,
  section_id text not null references public.sections(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  image text not null default '',
  link text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists section_cards_section_idx on public.section_cards (section_id);
create index if not exists section_cards_sort_idx on public.section_cards (sort_order);

alter table public.sections enable row level security;
alter table public.section_cards enable row level security;

-- Посетители видят только опубликованные разделы, администратор — все,
-- иначе черновик исчезал бы из админки сразу после сохранения.
drop policy if exists "sections: читают все" on public.sections;
create policy "sections: читают все" on public.sections
  for select using (published = true or public.is_admin());

drop policy if exists "sections: админ создаёт" on public.sections;
create policy "sections: админ создаёт" on public.sections
  for insert with check (public.is_admin());

drop policy if exists "sections: админ правит" on public.sections;
create policy "sections: админ правит" on public.sections
  for all using (public.is_admin()) with check (public.is_admin());

-- Карточки читают все: сам раздел уже скрыт, пока не опубликован.
drop policy if exists "section_cards: читают все" on public.section_cards;
create policy "section_cards: читают все" on public.section_cards
  for select using (true);

drop policy if exists "section_cards: админ создаёт" on public.section_cards;
create policy "section_cards: админ создаёт" on public.section_cards
  for insert with check (public.is_admin());

drop policy if exists "section_cards: админ правит" on public.section_cards;
create policy "section_cards: админ правит" on public.section_cards
  for all using (public.is_admin()) with check (public.is_admin());

-- Обновления прилетают на сайт без перезагрузки.
do $do$
begin
  alter publication supabase_realtime add table public.sections;
  alter publication supabase_realtime add table public.section_cards;
exception
  when duplicate_object then null;
end;
$do$;

-- Перечитать кэш схем PostgREST, чтобы таблицы сразу стали доступны API.
notify pgrst, 'reload schema';