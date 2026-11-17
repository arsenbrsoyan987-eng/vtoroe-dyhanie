-- ============================================================
--  Формат тренировок: групповая / индивидуальная
--  - trainings: format + цены за каждый формат
--  - registrations: тренер и направление, которые выбрал спортсмен
--  - политики: выбранный тренер получает доступ к своей записи
--  Файл идемпотентен: можно выполнять повторно.
-- ============================================================

-- ---------- Тренировки ----------
alter table public.trainings add column if not exists format text not null default 'group'
  check (format in ('group', 'individual'));
alter table public.trainings add column if not exists price_group text not null default '';
alter table public.trainings add column if not exists price_individual text not null default '';

-- ---------- Записи ----------
-- На индивидуальное занятие спортсмен выбирает тренера и направление сам,
-- они не обязаны совпадать с тренером и направлением самой «слот»-тренировки.
alter table public.registrations add column if not exists selected_trainer_id text not null default '';
alter table public.registrations add column if not exists selected_direction_id text not null default '';

-- ---------- Тренер видит запись, которую выбрал спортсмен ----------
-- is_trainer_of(training) не подходит: тренировку мог опубликовать другой
-- тренер, а занятие ведёт выбранный. Отдельная функция по id записи.
create or replace function public.coaches(reg uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $coaches$
  select exists (
    select 1
    from public.registrations r
    join public.trainings t on t.id = r.training_id
    join public.profiles me on me.id = auth.uid()
    where r.id = reg
      and me.trainer_id is not null
      and me.trainer_id <> ''
      and (t.trainer_id = me.trainer_id or r.selected_trainer_id = me.trainer_id)
  );
$coaches$;

-- Профиль спортсмена доступен тренеру и когда спортсмен выбрал его сами
create or replace function public.teaches(profile uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $teaches$
  select exists (
    select 1
    from public.registrations r
    join public.trainings t on t.id = r.training_id
    join public.profiles me on me.id = auth.uid()
    where r.user_id = profile
      and me.trainer_id is not null
      and me.trainer_id <> ''
      and (t.trainer_id = me.trainer_id or r.selected_trainer_id = me.trainer_id)
  );
$teaches$;

-- ---------- Обновлённые политики записей ----------
drop policy if exists "registrations: свои, тренеру и админу" on public.registrations;
create policy "registrations: свои, тренеру и админу" on public.registrations
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.coaches(id)
  );

drop policy if exists "registrations: отмена и отметка" on public.registrations;
create policy "registrations: отмена и отметка" on public.registrations
  for update using (
    user_id = auth.uid() or public.is_admin() or public.coaches(id)
  );

drop policy if exists "registrations: админ удаляет" on public.registrations;
create policy "registrations: админ удаляет" on public.registrations
  for delete using (public.is_admin() or public.coaches(id));