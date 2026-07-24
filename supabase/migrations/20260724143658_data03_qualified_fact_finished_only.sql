-- DATA-03 (CORE-0) — jedna definicja kwalifikowanego faktu treningowego:
-- zaliczona seria robocza w ZAKOŃCZONEJ sesji (`finished_at is not null`).
--
-- Audyt (docs/audyt-core-i-plan-2026-07.md §3 CORE-0) wykrył, że rekordy, trendy
-- siły i "poprzedni wynik" w guidance liczyły fakty bez tego warunku — seria
-- zaliczona w OTWARTEJ (jeszcze niezakończonej) sesji mogła utworzyć rekord albo
-- zasilić trend/hint progresji, mimo że spec mówi wprost: "sesja otwarta może
-- pokazać wynik prowizoryczny tylko w loggerze". Ekipa i Home już miały ten
-- warunek poprawnie (patrz team_streak_warsaw.sql, app/page.tsx) — ta migracja
-- domyka pozostałe funkcje DB do tej samej definicji.

-- ── recompute_personal_records: rekordy tylko z zakończonych sesji ──────────
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
    where s.user_id = uid
      and s.finished_at is not null
      and ss.completed and ss.set_type = 'working'
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

-- ── previous_working_set / previous_session_sets: "poprzednio" tylko z zakończonych ──
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
    and s.finished_at is not null
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
      and s.finished_at is not null
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
