-- TRAIN-01: pilna korekta P11, P12 i P14.
--
-- Niezmienniki:
-- - nie zmieniamy recepty pod otwartą sesją, dopóki nie ma snapshotu CORE-1;
-- - zachowujemy ID slotów dla tych samych ćwiczeń podczas zmiany kolejności;
-- - usuwane/zastępowane sloty odpinają się od historii przez istniejące ON DELETE SET NULL;
-- - aktywny program użytkownika i zakończone wyniki pozostają bez zmian.

do $$
declare
  v_program_id uuid;
  v_day_id uuid;
begin
  if exists (
    select 1
    from public.sessions session
    join public.program_days day on day.id = session.program_day_id
    join public.programs program on program.id = day.program_id
    where session.finished_at is null
      and program.user_id is null
      and program.slug in (
        'advanced-home-upper-lower4',
        'advanced-bodyweight-upper-lower4',
        'intermediate-gym-fbw2'
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'TRAIN-01 wymaga zakończenia lub usunięcia otwartych sesji P11/P12/P14.';
  end if;

  -- P11: HSPU przed zmęczeniem, 18 serii zamiast 27.
  select id into v_program_id
  from public.programs
  where slug = 'advanced-home-upper-lower4' and user_id is null;

  if v_program_id is not null then
    select id into strict v_day_id
    from public.program_days
    where program_id = v_program_id and label = 'Upper B · objętość';

    delete from public.program_day_slots
    where program_day_id = v_day_id
      and default_exercise_id = 'Push-Ups_-_Close_Triceps_Position';

    update public.program_day_slots
    set position = 0, target_sets = 3, target_reps_min = 4, target_reps_max = 10,
        rest_seconds = 150,
        notes = 'przy ścianie; zamiennie trudny Pike Push-Up'
    where program_day_id = v_day_id and default_exercise_id = 'Handstand_Push-Ups';

    update public.program_day_slots
    set position = 1, target_sets = 3, target_reps_min = 8, target_reps_max = 12,
        rest_seconds = 120, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Incline_Dumbbell_Press';

    update public.program_day_slots
    set position = 2, target_sets = 3, target_reps_min = 10, target_reps_max = 15,
        rest_seconds = 120, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Chest-Supported_Dumbbell_Row';

    update public.program_day_slots
    set position = 3, target_sets = 3, target_reps_min = 6, target_reps_max = 10,
        rest_seconds = 120,
        notes = 'dodaj pauzę u góry lub plecak po dojściu do 10'
    where program_day_id = v_day_id and default_exercise_id = 'Chin-Up';

    update public.program_day_slots
    set position = 4, target_sets = 2, target_reps_min = 15, target_reps_max = 20,
        rest_seconds = 60, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Reverse_Flyes';

    update public.program_day_slots
    set position = 5, target_sets = 2, target_reps_min = 10, target_reps_max = 15,
        rest_seconds = 60, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Lying_Dumbbell_Tricep_Extension';

    update public.program_day_slots
    set position = 6, target_sets = 2, target_reps_min = 10, target_reps_max = 15,
        rest_seconds = 60, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Incline_Dumbbell_Curl';

    if (
      select array_agg(default_exercise_id order by position)
      from public.program_day_slots
      where program_day_id = v_day_id
    ) is distinct from array[
      'Handstand_Push-Ups',
      'Incline_Dumbbell_Press',
      'Chest-Supported_Dumbbell_Row',
      'Chin-Up',
      'Reverse_Flyes',
      'Lying_Dumbbell_Tricep_Extension',
      'Incline_Dumbbell_Curl'
    ]::text[] then
      raise exception 'TRAIN-01: nieoczekiwany kształt P11 Upper B.';
    end if;

    if (
      select sum(target_sets)
      from public.program_day_slots
      where program_day_id = v_day_id
    ) <> 18 then
      raise exception 'TRAIN-01: P11 Upper B musi mieć 18 serii.';
    end if;

    update public.programs
    set content_version = greatest(content_version, 2)
    where id = v_program_id;
  end if;

  -- P12: HSPU i Jump Squat przed zmęczeniem; skoki pozostają pracą jakościową.
  select id into v_program_id
  from public.programs
  where slug = 'advanced-bodyweight-upper-lower4' and user_id is null;

  if v_program_id is not null then
    select id into strict v_day_id
    from public.program_days
    where program_id = v_program_id and label = 'Upper A · siła';

    update public.program_day_slots set position = 0
    where program_day_id = v_day_id and default_exercise_id = 'Handstand_Push-Ups';
    update public.program_day_slots set position = 1
    where program_day_id = v_day_id and default_exercise_id = 'Pullups';
    update public.program_day_slots set position = 2
    where program_day_id = v_day_id and default_exercise_id = 'Single-Arm_Push-Up';
    update public.program_day_slots set position = 3
    where program_day_id = v_day_id and default_exercise_id = 'Inverted_Row';
    update public.program_day_slots set position = 4
    where program_day_id = v_day_id and default_exercise_id = 'Dips_-_Triceps_Version';
    update public.program_day_slots set position = 5
    where program_day_id = v_day_id and default_exercise_id = 'L-Sit_Hold';

    if (
      select array_agg(default_exercise_id order by position)
      from public.program_day_slots
      where program_day_id = v_day_id
    ) is distinct from array[
      'Handstand_Push-Ups',
      'Pullups',
      'Single-Arm_Push-Up',
      'Inverted_Row',
      'Dips_-_Triceps_Version',
      'L-Sit_Hold'
    ]::text[] then
      raise exception 'TRAIN-01: nieoczekiwany kształt P12 Upper A.';
    end if;

    select id into strict v_day_id
    from public.program_days
    where program_id = v_program_id and label = 'Lower A · siła';

    update public.program_day_slots
    set position = 0, target_sets = 3, target_reps_min = 3, target_reps_max = 5,
        rest_seconds = 150,
        notes = 'zakończ serię przy spadku wysokości skoku lub jakości lądowania'
    where program_day_id = v_day_id and default_exercise_id = 'Freehand_Jump_Squat';
    update public.program_day_slots set position = 1
    where program_day_id = v_day_id and default_exercise_id = 'Split_Squats';
    update public.program_day_slots set position = 2
    where program_day_id = v_day_id and default_exercise_id = 'Nordic_Hamstring_Curl';
    update public.program_day_slots set position = 3
    where program_day_id = v_day_id and default_exercise_id = 'Single-Leg_Hip_Thrust';
    update public.program_day_slots set position = 4
    where program_day_id = v_day_id and default_exercise_id = 'Single_Leg_Calf_Raise';
    update public.program_day_slots set position = 5
    where program_day_id = v_day_id and default_exercise_id = 'Copenhagen_Plank';

    if (
      select array_agg(default_exercise_id order by position)
      from public.program_day_slots
      where program_day_id = v_day_id
    ) is distinct from array[
      'Freehand_Jump_Squat',
      'Split_Squats',
      'Nordic_Hamstring_Curl',
      'Single-Leg_Hip_Thrust',
      'Single_Leg_Calf_Raise',
      'Copenhagen_Plank'
    ]::text[] then
      raise exception 'TRAIN-01: nieoczekiwany kształt P12 Lower A.';
    end if;

    update public.programs
    set content_version = greatest(content_version, 2)
    where id = v_program_id;
  end if;

  -- P14: oba dni odzyskują bezpośrednią pracę tylnej taśmy.
  select id into v_program_id
  from public.programs
  where slug = 'intermediate-gym-fbw2' and user_id is null;

  if v_program_id is not null then
    select id into strict v_day_id
    from public.program_days
    where program_id = v_program_id and label = 'Trening A';

    delete from public.program_day_slots
    where program_day_id = v_day_id and default_exercise_id = 'Barbell_Curl';

    if not exists (
      select 1 from public.program_day_slots
      where program_day_id = v_day_id and default_exercise_id = 'Romanian_Deadlift'
    ) then
      insert into public.program_day_slots (
        program_day_id, default_exercise_id, position, target_sets,
        target_reps_min, target_reps_max, rest_seconds, superset_group, notes
      ) values (
        v_day_id, 'Romanian_Deadlift', 2, 3, 6, 10, 150, null, null
      );
    end if;

    update public.program_day_slots
    set position = 0 where program_day_id = v_day_id and default_exercise_id = 'Barbell_Squat';
    update public.program_day_slots
    set position = 1 where program_day_id = v_day_id and default_exercise_id = 'Barbell_Bench_Press_-_Medium_Grip';
    update public.program_day_slots
    set position = 2, target_sets = 3, target_reps_min = 6, target_reps_max = 10,
        rest_seconds = 150, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Romanian_Deadlift';
    update public.program_day_slots
    set position = 3 where program_day_id = v_day_id and default_exercise_id = 'Bent_Over_Barbell_Row';
    update public.program_day_slots
    set position = 4 where program_day_id = v_day_id and default_exercise_id = 'Standing_Military_Press';
    update public.program_day_slots
    set position = 5 where program_day_id = v_day_id and default_exercise_id = 'EZ-Bar_Skullcrusher';
    update public.program_day_slots
    set position = 6 where program_day_id = v_day_id and default_exercise_id = 'Plank';

    if (
      select array_agg(default_exercise_id order by position)
      from public.program_day_slots
      where program_day_id = v_day_id
    ) is distinct from array[
      'Barbell_Squat',
      'Barbell_Bench_Press_-_Medium_Grip',
      'Romanian_Deadlift',
      'Bent_Over_Barbell_Row',
      'Standing_Military_Press',
      'EZ-Bar_Skullcrusher',
      'Plank'
    ]::text[] then
      raise exception 'TRAIN-01: nieoczekiwany kształt P14 Trening A.';
    end if;

    select id into strict v_day_id
    from public.program_days
    where program_id = v_program_id and label = 'Trening B';

    delete from public.program_day_slots
    where program_day_id = v_day_id and default_exercise_id = 'Hammer_Curls';

    if not exists (
      select 1 from public.program_day_slots
      where program_day_id = v_day_id and default_exercise_id = 'Lying_Leg_Curls'
    ) then
      insert into public.program_day_slots (
        program_day_id, default_exercise_id, position, target_sets,
        target_reps_min, target_reps_max, rest_seconds, superset_group, notes
      ) values (
        v_day_id, 'Lying_Leg_Curls', 4, 3, 10, 15, 90, null, null
      );
    end if;

    update public.program_day_slots
    set target_reps_min = 5, target_reps_max = 10,
        notes = 'Użyj gumy lub maszyny, jeśli pełny zakres jest za trudny. Zostaw 1 lub 2 powtórzenia w zapasie. Nachwyt.'
    where program_day_id = v_day_id and default_exercise_id = 'Pullups';
    update public.program_day_slots
    set position = 4, target_sets = 3, target_reps_min = 10, target_reps_max = 15,
        rest_seconds = 90, notes = null
    where program_day_id = v_day_id and default_exercise_id = 'Lying_Leg_Curls';

    if (
      select array_agg(default_exercise_id order by position)
      from public.program_day_slots
      where program_day_id = v_day_id
    ) is distinct from array[
      'Barbell_Walking_Lunge',
      'Pullups',
      'Incline_Dumbbell_Press',
      'Face_Pull',
      'Lying_Leg_Curls',
      'Triceps_Pushdown',
      'Ab_Wheel_Rollout'
    ]::text[] then
      raise exception 'TRAIN-01: nieoczekiwany kształt P14 Trening B.';
    end if;

    update public.programs
    set content_version = greatest(content_version, 3)
    where id = v_program_id;
  end if;
end
$$;
