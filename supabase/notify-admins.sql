-- ============================================================
--  Письма в администраторскую почту кабинета
-- ============================================================
--  Спортсмен не читает чужие профили (RLS), поэтому не может узнать id
--  администратора и написать ему напрямую. Функция работает с правами
--  владельца схемы (SECURITY DEFINER) и сама обходит всех активных
--  администраторов — наружу не отдаёт ничего, кроме числа получателей.
--
--  Применить: Supabase → SQL Editor → вставить и запустить.
-- ============================================================

create or replace function public.notify_admins(
  p_title text,
  p_message text,
  p_type text default 'info',
  p_link text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted int := 0;
begin
  if auth.uid() is null then
    raise exception 'Только авторизованный пользователь';
  end if;

  if coalesce(trim(p_title), '') = '' then
    raise exception 'Пустой заголовок';
  end if;

  insert into public.notifications (user_id, title, message, type, link)
  select p.id,
         left(trim(p_title), 120),
         left(coalesce(p_message, ''), 1000),
         case
           when p_type in ('info', 'warning', 'success', 'event') then p_type
           else 'info'
         end,
         p_link
  from public.profiles p
  where p.role = 'admin'
    and p.deleted_at is null;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

-- Вызывать могут только вошедшие в систему
revoke all on function public.notify_admins(text, text, text, text) from public;
grant execute on function public.notify_admins(text, text, text, text) to authenticated;
