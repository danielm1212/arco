-- F0.2 / L3 — slot opisuje miejsce w planie, nie tożsamość ruchu. Podmiana
-- zachowuje slot, więc poprzedni wynik może zostać użyty wyłącznie wtedy, gdy
-- poprzednie i bieżące session_exercise mają także to samo exercise_id.

create or replace function public.previous_working_set(
  p_slot uuid,
  p_exercise text,
  p_session uuid
)
returns table (
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
  select ss.weight, ss.reps, ss.duration_seconds, ss.added_weight
  from session_sets ss
  join session_exercises se on se.id = ss.session_exercise_id
  join sessions s on s.id = se.session_id
  where ss.completed
    and ss.set_type = 'working'
    and s.id <> p_session
    and se.exercise_id = p_exercise
    and (p_slot is null or se.slot_id = p_slot)
  order by s.started_at desc, ss.set_index desc
  limit 1;
$$;

create or replace function public.previous_session_sets(
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
    where ss.completed
      and ss.set_type = 'working'
      and s.id <> p_session
      and se.exercise_id = p_exercise
      and (p_slot is null or se.slot_id = p_slot)
    order by s.started_at desc
    limit 1
  )
  select ss.set_index, ss.weight, ss.reps, ss.duration_seconds, ss.added_weight
  from last_session ls
  join session_exercises se on se.session_id = ls.session_id
    and se.exercise_id = p_exercise
    and (p_slot is null or se.slot_id = p_slot)
  join session_sets ss on ss.session_exercise_id = se.id
  where ss.completed and ss.set_type = 'working'
  order by ss.set_index;
$$;

grant execute on function public.previous_working_set(uuid, text, uuid) to authenticated;
grant execute on function public.previous_session_sets(uuid, text, uuid) to authenticated;
