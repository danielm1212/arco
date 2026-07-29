-- PLAN-C3: brzuch i ramiona w planach z priorytetem dolnej części ciała.
--
-- `lower-body-gym3` nie miał ŻADNEJ pracy brzucha — ani bezpośredniej, ani pośredniej.
-- Audyt z 2026-07-21 §P05 zatwierdził dla niego Pallof Press dokładnie z tego powodu
-- i ta korekta nigdy nie weszła. Oba plany nie miały też ani jednej serii na biceps
-- i triceps, mimo że oba deklarują „góra ciała nadal dostaje regularny bodziec".
--
-- Jak przy PLAN-C2, praca mieści się w zapasie czasu, który plany i tak deklarowały:
-- gym3 obiecywał 45–60 min, a trwał 32–38; home3 obiecywał 40–55 przy realnych 28–36.
-- Deklaracje schodzą do prawdy (gym3 → 40–55, home3 → 35–50).
--
-- Odejście od brzmienia audytu: Pallof Press ląduje w „Dół A · siła", nie w dniu górnym.
-- Dzień górny dostał ramiona i przy Pallofie miałby dziesięć pozycji. Intencja korekty —
-- plan ma bezpośrednią pracę core — jest spełniona, a anty-rotacja obok przysiadu
-- i zawiasu pasuje lepiej niż obok wyciskań.
--
-- Niezmienniki: pozycyjna aktualizacja jak w `scripts/seed.ts`, zero usuwania slotów,
-- bramka otwartej sesji per plan, brak zmian aktywnego programu i historii.

do $planc3$
declare
  v_program_id uuid;
  v_day_id uuid;
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'PLAN-C3: pomijam, baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  -- lower-body-gym3: v3, 40-55 min
  select id into v_program_id from public.programs where slug = 'lower-body-gym3' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C3 wymaga zakończenia otwartych sesji: lower-body-gym3';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dół A · siła';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:0')::uuid, v_day_id, 'Barbell_Glute_Bridge', 0, 3, 6, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Glute_Bridge', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:1')::uuid, v_day_id, 'Barbell_Squat', 1, 3, 6, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Squat', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:2')::uuid, v_day_id, 'Romanian_Deadlift', 2, 2, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Romanian_Deadlift', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:3')::uuid, v_day_id, 'Wide-Grip_Lat_Pulldown', 3, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Wide-Grip_Lat_Pulldown', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:4')::uuid, v_day_id, 'Dumbbell_Bench_Press', 4, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:5')::uuid, v_day_id, 'Standing_Calf_Raises', 5, 2, 12, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Calf_Raises', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:0:6')::uuid, v_day_id, 'Pallof_Press', 6, 2, 10, 12, 60, null, 'Na stronę. Opieraj się rotacji, nie ciągnij ramionami.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Pallof_Press', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = 'Na stronę. Opieraj się rotacji, nie ciągnij ramionami.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C3: lower-body-gym3 / Dół A · siła ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Góra + pośladki';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:0')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 0, 3, 8, 12, 120, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:1')::uuid, v_day_id, 'Thigh_Abductor', 1, 2, 12, 20, 75, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Thigh_Abductor', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 75, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:2')::uuid, v_day_id, 'Seated_Cable_Rows', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Cable_Rows', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:3')::uuid, v_day_id, 'Incline_Dumbbell_Press', 3, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:4')::uuid, v_day_id, 'Seated_Dumbbell_Press', 4, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:5')::uuid, v_day_id, 'One-Legged_Cable_Kickback', 5, 2, 12, 20, 75, null, 'na nogę; zatrzymaj ruch na górze');
    end if;
    update public.program_day_slots set default_exercise_id = 'One-Legged_Cable_Kickback', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 75, superset_group = null, notes = 'na nogę; zatrzymaj ruch na górze' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:1:7')::uuid, v_day_id, 'Triceps_Pushdown', 7, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Triceps_Pushdown', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 7;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 8 then
      raise exception 'PLAN-C3: lower-body-gym3 / Góra + pośladki ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dół B · objętość';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:0')::uuid, v_day_id, 'Leg_Press', 0, 3, 10, 15, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Leg_Press', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:1')::uuid, v_day_id, 'Barbell_Glute_Bridge', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Glute_Bridge', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:2')::uuid, v_day_id, 'Lying_Leg_Curls', 2, 3, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Lying_Leg_Curls', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:3')::uuid, v_day_id, 'Bulgarian_Split_Squat', 3, 2, 8, 12, 120, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bulgarian_Split_Squat', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:4')::uuid, v_day_id, 'Wide-Grip_Lat_Pulldown', 4, 2, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Wide-Grip_Lat_Pulldown', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:5')::uuid, v_day_id, 'Dumbbell_Bench_Press', 5, 2, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-gym3:2:6')::uuid, v_day_id, 'Hanging_Knee_Raise', 6, 2, 8, 15, 60, null, 'Bez bujania; bez drążka zrób dead bug.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Hanging_Knee_Raise', target_sets = 2, target_reps_min = 8, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Bez bujania; bez drążka zrób dead bug.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C3: lower-body-gym3 / Dół B · objętość ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 40, estimated_minutes_max = 55, content_version = greatest(content_version, 3) where id = v_program_id;
  end if;

  -- lower-body-home3: v2, 35-50 min
  select id into v_program_id from public.programs where slug = 'lower-body-home3' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C3 wymaga zakończenia otwartych sesji: lower-body-home3';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dół A · siła';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:0')::uuid, v_day_id, 'Dumbbell_Hip_Thrust', 0, 3, 8, 12, 120, null, 'bez ławki: glute bridge z hantlem');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Hip_Thrust', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'bez ławki: glute bridge z hantlem' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:1')::uuid, v_day_id, 'Goblet_Squat', 1, 3, 8, 12, 120, null, 'możesz trzymać jeden hantel przy klatce');
    end if;
    update public.program_day_slots set default_exercise_id = 'Goblet_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'możesz trzymać jeden hantel przy klatce' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:2')::uuid, v_day_id, 'Stiff-Legged_Dumbbell_Deadlift', 2, 2, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Stiff-Legged_Dumbbell_Deadlift', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:3')::uuid, v_day_id, 'One-Arm_Dumbbell_Row', 3, 3, 8, 12, 120, null, 'na rękę');
    end if;
    update public.program_day_slots set default_exercise_id = 'One-Arm_Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na rękę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:4')::uuid, v_day_id, 'Dumbbell_Bench_Press', 4, 3, 8, 12, 120, null, 'bez ławki: wyciskanie hantli na podłodze');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'bez ławki: wyciskanie hantli na podłodze' where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:5')::uuid, v_day_id, 'Calf_Raise_On_A_Dumbbell', 5, 2, 12, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Raise_On_A_Dumbbell', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:0:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C3: lower-body-home3 / Dół A · siła ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Góra + pośladki';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:0')::uuid, v_day_id, 'Bulgarian_Split_Squat', 0, 3, 8, 12, 120, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bulgarian_Split_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:1')::uuid, v_day_id, 'Glute_Kickback', 1, 2, 12, 20, 60, null, 'na nogę; zatrzymaj ruch na górze');
    end if;
    update public.program_day_slots set default_exercise_id = 'Glute_Kickback', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = 'na nogę; zatrzymaj ruch na górze' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:2')::uuid, v_day_id, 'Bent_Over_Two-Dumbbell_Row', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Bent_Over_Two-Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:3')::uuid, v_day_id, 'Incline_Dumbbell_Press', 3, 2, 8, 12, 90, null, 'bez ławki: wyciskanie hantli na podłodze');
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'bez ławki: wyciskanie hantli na podłodze' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:4')::uuid, v_day_id, 'Seated_Dumbbell_Press', 4, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:5')::uuid, v_day_id, 'Dead_Bug', 5, 2, 8, 12, 45, null, 'na stronę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dead_Bug', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 45, superset_group = null, notes = 'na stronę' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:1:6')::uuid, v_day_id, 'Standing_Dumbbell_Triceps_Extension', 6, 3, 10, 15, 60, null, 'Łokcie blisko głowy, ruch tylko w łokciu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Dumbbell_Triceps_Extension', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Łokcie blisko głowy, ruch tylko w łokciu.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C3: lower-body-home3 / Góra + pośladki ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dół B · objętość';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:0')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 0, 3, 8, 12, 120, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:1')::uuid, v_day_id, 'Dumbbell_Hip_Thrust', 1, 3, 10, 15, 120, null, 'bez ławki: glute bridge z hantlem');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Hip_Thrust', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 120, superset_group = null, notes = 'bez ławki: glute bridge z hantlem' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:2')::uuid, v_day_id, 'Stiff-Legged_Dumbbell_Deadlift', 2, 3, 10, 15, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Stiff-Legged_Dumbbell_Deadlift', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:3')::uuid, v_day_id, 'One-Arm_Dumbbell_Row', 3, 3, 10, 15, 90, null, 'na rękę');
    end if;
    update public.program_day_slots set default_exercise_id = 'One-Arm_Dumbbell_Row', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'na rękę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:4')::uuid, v_day_id, 'Dumbbell_Bench_Press', 4, 2, 10, 15, 90, null, 'bez ławki: wyciskanie hantli na podłodze');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'bez ławki: wyciskanie hantli na podłodze' where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:5')::uuid, v_day_id, 'Calf_Raise_On_A_Dumbbell', 5, 2, 15, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Raise_On_A_Dumbbell', target_sets = 2, target_reps_min = 15, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:lower-body-home3:2:6')::uuid, v_day_id, 'Dead_Bug', 6, 2, 8, 12, 60, null, 'Na stronę. Lędźwie przy podłożu przez cały ruch.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dead_Bug', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = 'Na stronę. Lędźwie przy podłożu przez cały ruch.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C3: lower-body-home3 / Dół B · objętość ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 35, estimated_minutes_max = 50, content_version = greatest(content_version, 2) where id = v_program_id;
  end if;

  -- advanced-gym-ppl6: sama korekta deklarowanego czasu, recepta bez zmian.
  -- Audyt 2026-07-21 §P13 zatwierdził zejście z 55-75 min; korekta nigdy nie weszła.
  -- Realne dni: 46-59 min z przygotowaniem, więc deklaracja 45-65 jest prawdziwa.
  select id into v_program_id from public.programs where slug = 'advanced-gym-ppl6' and user_id is null;
  if v_program_id is not null then
    update public.programs
    set estimated_minutes_min = 45, estimated_minutes_max = 65,
        content_version = greatest(content_version, 5)
    where id = v_program_id;
  end if;

end
$planc3$;
