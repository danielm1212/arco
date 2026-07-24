-- DATA-01 (CORE-0) — zaliczona seria musi mieć wynik właściwy dla typu ćwiczenia.
-- Ostatnia linia obrony (UI blokuje w handleToggle, server action w assertCompletableSet
-- w app/actions/sets.ts) — chroni też przed przyszłym klientem/importem, który ominie obie.
-- SECURITY INVOKER (domyślne): trigger czyta wyłącznie session_exercises/exercises
-- właściciela wiersza, RLS już na to pozwala ("session_exercises_own",
-- "exercises_select_authenticated"), więc nie potrzebuje podniesionych uprawnień.

create or replace function assert_valid_completed_set()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  ex_type exercise_type;
begin
  if not new.completed then
    return new;
  end if;

  select e.exercise_type into ex_type
  from session_exercises se
  join exercises e on e.id = se.exercise_id
  where se.id = new.session_exercise_id;

  if ex_type = 'weighted' and (new.weight is null or new.reps is null) then
    raise exception 'Zaliczona seria wymaga ciężaru i powtórzeń dla ćwiczenia z obciążeniem.';
  elsif ex_type = 'bodyweight' and new.reps is null then
    raise exception 'Zaliczona seria wymaga powtórzeń dla ćwiczenia z masą ciała.';
  elsif ex_type = 'timed' and (new.duration_seconds is null or new.duration_seconds <= 0) then
    raise exception 'Zaliczona seria wymaga czasu trwania dla ćwiczenia na czas.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_assert_valid_completed_set on session_sets;
create trigger trg_assert_valid_completed_set
  before insert or update on session_sets
  for each row execute function assert_valid_completed_set();
