-- Korekta daty treningu musi skorygować także check-in Ekipy. Zdarzenie jest
-- dzienne (nie per sesja), dlatego pozostawiamy je na starej dacie, gdy tego
-- samego dnia istnieje jeszcze inny ukończony trening.
create or replace function sync_workout_activity_day(
  p_session_id uuid,
  p_previous_day date
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_new_day date;
begin
  if v_user is null then raise exception 'Brak sesji.'; end if;

  select date into v_new_day
  from sessions
  where id = p_session_id and user_id = v_user and finished_at is not null;
  if v_new_day is null then raise exception 'Nie znaleziono ukończonego treningu.'; end if;

  if not exists (
    select 1 from pod_members where user_id = v_user and consented_at is not null
  ) then
    return;
  end if;

  if p_previous_day is distinct from v_new_day
    and not exists (
      select 1
      from sessions
      where user_id = v_user
        and date = p_previous_day
        and finished_at is not null
        and id <> p_session_id
    ) then
    if exists (
      select 1
      from activity_events
      where user_id = v_user and kind = 'workout_done' and occurred_on = v_new_day
    ) then
      delete from activity_events
      where user_id = v_user and kind = 'workout_done' and occurred_on = p_previous_day;
    else
      update activity_events
      set occurred_on = v_new_day
      where user_id = v_user and kind = 'workout_done' and occurred_on = p_previous_day;
    end if;
  end if;

  -- Tworzy check-in na nowy dzień, jeśli jeszcze go nie ma, i odświeża passę.
  perform emit_workout_activity(p_session_id);
end;
$$;

revoke all on function sync_workout_activity_day(uuid, date) from public;
grant execute on function sync_workout_activity_day(uuid, date) to authenticated;
