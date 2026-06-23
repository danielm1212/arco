-- Fix: literały record_type w UNION są text → jawne rzutowanie ::record_type.
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
           case when ss.weight is not null and ss.reps is not null
                then ss.weight * (1 + ss.reps::numeric / 30) end as e1rm,
           s.started_at as achieved
    from session_sets ss
    join session_exercises se on se.id = ss.session_exercise_id
    join sessions s on s.id = se.session_id
    where s.user_id = uid and ss.completed and ss.set_type = 'working'
  )
  insert into personal_records (user_id, exercise_id, record_type, value, reps_context, achieved_at, session_set_id)
  select uid, exercise_id, 'max_weight'::record_type, weight, reps, achieved, set_id
  from (select distinct on (exercise_id) * from base where weight is not null
        order by exercise_id, weight desc, achieved) w
  union all
  select uid, exercise_id, 'max_e1rm'::record_type, round(e1rm, 1), reps, achieved, set_id
  from (select distinct on (exercise_id) * from base where e1rm is not null
        order by exercise_id, e1rm desc, achieved) e
  union all
  select uid, exercise_id, 'max_reps'::record_type, reps, null, achieved, set_id
  from (select distinct on (exercise_id) * from base where reps is not null
        order by exercise_id, reps desc, achieved) r
  union all
  select uid, exercise_id, 'max_duration'::record_type, duration_seconds, null, achieved, set_id
  from (select distinct on (exercise_id) * from base where duration_seconds is not null
        order by exercise_id, duration_seconds desc, achieved) d;
end;
$$;
