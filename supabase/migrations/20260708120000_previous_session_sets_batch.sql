-- S9-cz.2 paczka 1 — batch "poprzednio": 1 RPC dla całej sesji zamiast N wywołań per ćwiczenie
-- (optymalizacja.md P1 / plan-s9-cz2.md §1). Opakowanie LATERAL na previous_session_sets —
-- poprawność identyczna z konstrukcji; RLS: security invoker, session_exercises filtruje ownership.

create or replace function previous_session_sets_batch(p_session uuid)
returns table (
  session_exercise_id uuid,
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
  select
    cur.id as session_exercise_id,
    prev.set_index,
    prev.weight,
    prev.reps,
    prev.duration_seconds,
    prev.added_weight
  from session_exercises cur
  cross join lateral previous_session_sets(cur.slot_id, cur.exercise_id, p_session) as prev
  where cur.session_id = p_session
  order by cur.position, prev.set_index;
$$;

grant execute on function previous_session_sets_batch(uuid) to authenticated;
