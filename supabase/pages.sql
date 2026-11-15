-- Страницы сайта: произвольные страницы, которые администратор создаёт
-- и редактирует из кабинета.

create table if not exists public.pages (
  id text primary key,
  slug text not null unique,
  title text not null default '',
  hero_image text not null default '',
  content text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pages_sort_idx on public.pages (sort_order);

alter table public.pages enable row level security;

-- Посетители видят только опубликованные страницы, администратор — все,
-- иначе черновики исчезали бы из админки сразу после сохранения.
drop policy if exists "pages: читают все" on public.pages;
create policy "pages: читают все" on public.pages
  for select using (published = true or public.is_admin());

drop policy if exists "pages: админ создаёт" on public.pages;
create policy "pages: админ создаёт" on public.pages
  for insert with check (public.is_admin());

drop policy if exists "pages: админ правит" on public.pages;
create policy "pages: админ правит" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

do $do$
begin
  alter publication supabase_realtime add table public.pages;
exception
  when duplicate_object then null;
end;
$do$;
