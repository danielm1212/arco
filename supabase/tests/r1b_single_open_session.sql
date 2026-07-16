-- Uruchamiaj po migracji R1b na lokalnej/odizolowanej bazie:
-- psql ... -v ON_ERROR_STOP=1 -f supabase/tests/r1b_single_open_session.sql
-- Cały scenariusz jest wycofywany na końcu.
begin;

do $$
declare
  v_user_id uuid;
  v_program_day_id uuid;
  v_session_id uuid;
  v_resumed_id uuid;
  v_historical_id uuid;
  v_created boolean;
  v_expected_exercises integer;
  v_actual_exercises integer;
  v_expected_sets integer;
  v_actual_sets integer;
begin
  select u.id
  into v_user_id
  from auth.users u
  where not exists (
    select 1
    from public.sessions s
    where s.user_id = u.id and s.finished_at is null
  )
  order by u.created_at
  limit 1;

  if v_user_id is null then
    raise exception 'Test R1b wymaga użytkownika bez otwartej sesji.';
  end if;

  select d.id
  into v_program_day_id
  from public.program_days d
  join public.programs p on p.id = d.program_id
  where p.user_id is null
  order by p.is_default desc, d.position
  limit 1;

  if v_program_day_id is null then
    raise exception 'Test R1b wymaga przynajmniej jednego dnia programu systemowego.';
  end if;

  perform set_config('request.jwt.claim.sub', v_user_id::text, true);

  select result.session_id, result.created
  into v_session_id, v_created
  from public.start_or_resume_session(p_program_day_id => v_program_day_id) result;

  if not v_created then
    raise exception 'Pierwszy start powinien utworzyć sesję.';
  end if;

  select count(*), coalesce(sum(greatest(slot.target_sets, 1)), 0)
  into v_expected_exercises, v_expected_sets
  from public.program_day_slots slot
  where slot.program_day_id = v_program_day_id;

  select count(*)
  into v_actual_exercises
  from public.session_exercises exercise
  where exercise.session_id = v_session_id;

  select count(*)
  into v_actual_sets
  from public.session_sets set_row
  join public.session_exercises exercise on exercise.id = set_row.session_exercise_id
  where exercise.session_id = v_session_id;

  if v_actual_exercises <> v_expected_exercises or v_actual_sets <> v_expected_sets then
    raise exception 'Sesja programu jest niekompletna: ćwiczenia %/%, serie %/%',
      v_actual_exercises, v_expected_exercises, v_actual_sets, v_expected_sets;
  end if;

  select result.session_id, result.created
  into v_resumed_id, v_created
  from public.start_or_resume_session() result;

  if v_created or v_resumed_id <> v_session_id then
    raise exception 'Ponowny start nie wznowił tej samej sesji.';
  end if;

  select result.session_id, result.created
  into v_historical_id, v_created
  from public.start_or_resume_session(
    p_started_at => now() - interval '1 day',
    p_date => current_date - 1,
    p_is_historical => true,
    p_recorded_duration_seconds => 3600
  ) result;

  if v_created or v_historical_id <> v_session_id then
    raise exception 'Start historyczny powinien zwrócić konflikt z aktywną sesją.';
  end if;

  begin
    insert into public.sessions (user_id) values (v_user_id);
    raise exception 'Indeks dopuścił drugą otwartą sesję.';
  exception
    when unique_violation then null;
  end;
end
$$;

rollback;
