-- Arco Phase 6 — serie z poprzedniej sesji dla slotu/ćwiczenia (inline "last set" per wiersz).
-- Zwraca working sety najnowszej WCZEŚNIEJSZEJ sesji, w której to ćwiczenie/slot było zaliczone.
create or replace function previous_session_sets(
  p_slot uuid,
  p_exercise text,
  p_session uuid
)
returns table (
  set_index integer,
  weight numeric,
  reps integer,
  duration_seconds integer,
  added_weight numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with last_session as (
    select se.session_id, s.started_at
    from session_sets ss
    join session_exercises se on se.id = ss.session_exercise_id
    join sessions s on s.id = se.session_id
    where ss.completed and ss.set_type = 'working'
      and s.id <> p_session
      and (
        (p_slot is not null and se.slot_id = p_slot)
        or (p_slot is null and se.exercise_id = p_exercise)
      )
    order by s.started_at desc
    limit 1
  )
  select ss.set_index, ss.weight, ss.reps, ss.duration_seconds, ss.added_weight
  from last_session ls
  join session_exercises se on se.session_id = ls.session_id
    and (
      (p_slot is not null and se.slot_id = p_slot)
      or (p_slot is null and se.exercise_id = p_exercise)
    )
  join session_sets ss on ss.session_exercise_id = se.id
  where ss.completed and ss.set_type = 'working'
  order by ss.set_index;
$$;

grant execute on function previous_session_sets(uuid, text, uuid) to authenticated;
