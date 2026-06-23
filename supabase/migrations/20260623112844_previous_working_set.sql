-- Arco — "poprzedni wynik" (brief Phase 1): ostatni working set dla slotu (lub ćwiczenia w freestyle)
-- z innej sesji. security invoker → respektuje RLS (tylko sesje wołającego użytkownika).
create or replace function previous_working_set(
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
    and (
      (p_slot is not null and se.slot_id = p_slot)
      or (p_slot is null and se.exercise_id = p_exercise)
    )
  order by s.started_at desc, ss.set_index desc
  limit 1;
$$;

grant execute on function previous_working_set(uuid, text, uuid) to authenticated;
