-- F0.3 — granice danych serii i odporne przeliczanie rekordów.
-- NOT VALID zachowuje historię już istniejących kont, ale od razu chroni każdy
-- nowy insert/update. Funkcja rekordów dodatkowo nie interpretuje starych,
-- błędnych wpisów jako osiągnięć użytkownika.

alter table session_sets
  add constraint session_sets_weight_range
    check (weight is null or (weight >= 0 and weight <= 1000)) not valid,
  add constraint session_sets_added_weight_range
    check (added_weight is null or (added_weight >= 0 and added_weight <= 1000)) not valid,
  add constraint session_sets_reps_range
    check (reps is null or (reps between 1 and 100)) not valid,
  add constraint session_sets_duration_range
    check (duration_seconds is null or (duration_seconds between 0 and 86400)) not valid,
  add constraint session_sets_rpe_range
    check (rpe is null or (rpe between 0 and 10)) not valid;

-- Przeliczanie zawsze idzie od zera po korekcie/usunięciu serii. Rekord może
-- pochodzić wyłącznie z zaliczonej serii roboczej; e1RM jest wiarygodny tylko
-- dla 1–10 powtórzeń. Granice w SELECT-ach osłaniają stare lub ręcznie
-- uszkodzone dane, których constraint NOT VALID celowo nie zmienia.
create or replace function recompute_personal_records()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return; end if;

  delete from personal_records where user_id = uid;

  with base as (
    select se.exercise_id,
           ss.id as set_id,
           ss.weight,
           ss.reps,
           ss.duration_seconds,
           case
             when ss.weight between 0 and 1000 and ss.reps between 1 and 10
             then ss.weight * (1 + ss.reps::numeric / 30)
           end as e1rm,
           s.started_at as achieved
    from session_sets ss
    join session_exercises se on se.id = ss.session_exercise_id
    join sessions s on s.id = se.session_id
    where s.user_id = uid and ss.completed and ss.set_type = 'working'
  )
  insert into personal_records (user_id, exercise_id, record_type, value, reps_context, achieved_at, session_set_id)
  -- max ciężaru: tylko prawidłowa seria robocza
  select uid, exercise_id, 'max_weight'::record_type, weight, reps, achieved, set_id
  from (
    select distinct on (exercise_id) * from base
    where weight between 0 and 1000 and reps between 1 and 100
    order by exercise_id, weight desc, achieved
  ) w
  union all
  -- max e1RM (Epley): celowo wyłącznie 1–10 powtórzeń
  select uid, exercise_id, 'max_e1rm'::record_type, round(e1rm, 1), reps, achieved, set_id
  from (
    select distinct on (exercise_id) * from base where e1rm is not null
    order by exercise_id, e1rm desc, achieved
  ) e
  union all
  -- max powtórzeń: bez anomalii poza zakresem produktu
  select uid, exercise_id, 'max_reps'::record_type, reps, null, achieved, set_id
  from (
    select distinct on (exercise_id) * from base where reps between 1 and 100
    order by exercise_id, reps desc, achieved
  ) r
  union all
  -- max czasu: ten sam bezpieczny zakres co formularz
  select uid, exercise_id, 'max_duration'::record_type, duration_seconds, null, achieved, set_id
  from (
    select distinct on (exercise_id) * from base where duration_seconds between 0 and 86400
    order by exercise_id, duration_seconds desc, achieved
  ) d;
end;
$$;

grant execute on function recompute_personal_records() to authenticated;
