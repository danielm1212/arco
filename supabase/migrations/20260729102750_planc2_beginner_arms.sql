-- PLAN-C2: bezpośrednia praca ramion w planach dla początkujących + prawda o czasie sesji.
--
-- Powód: cztery z pięciu planów beginner nie miały ani jednej serii bezpośrednio na biceps
-- lub triceps. Audyt zakładał „opcjonalne ramiona", ale kontrakt danych nie ma pola
-- `is_optional`, więc opcjonalne znaczyło po prostu „nieobecne". To pierwsza rzecz, jakiej
-- początkujący szuka w planie i nie znajdował.
--
-- Przy okazji: każda sesja beginner kończyła się 8–26 minut przed zadeklarowanym czasem.
-- Dokładamy ramiona w tym zapasie, a deklaracje, które kłamały, schodzą do realnych wartości
-- (`beginner-gym-fbw3` 45–60 → 40–50, `beginner-bodyweight-fbw3` 35–50 → 30–45,
-- `beginner-gym-fbw2` 45–55 → 40–55).
--
-- Układ: dzień krótki dostaje parę biceps + triceps po 2 serie, dzień gęsty jedno ćwiczenie
-- po 3 serie — żeby nie robić z sesji początkującego listy dziesięciu ćwiczeń.
-- W planie z masą ciała biceps zostaje przy podciąganiu i wiosłowaniu; bez sprzętu nie ma
-- sensownej izolacji, więc dokładamy wyłącznie triceps.
--
-- Niezmienniki: pozycyjna aktualizacja jak w `scripts/seed.ts`, zero usuwania slotów,
-- bramka otwartej sesji per plan, brak zmian aktywnego programu i historii.

do $planc2$
declare
  v_program_id uuid;
  v_day_id uuid;
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'PLAN-C2: pomijam, baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  -- beginner-gym-fbw2: v3, 40-55 min
  select id into v_program_id from public.programs where slug = 'beginner-gym-fbw2' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C2 wymaga zakończenia otwartych sesji: beginner-gym-fbw2';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Trening A';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:0')::uuid, v_day_id, 'Barbell_Squat', 0, 3, 5, 8, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Squat', target_sets = 3, target_reps_min = 5, target_reps_max = 8, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:1')::uuid, v_day_id, 'Barbell_Bench_Press_-_Medium_Grip', 1, 3, 5, 8, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Bench_Press_-_Medium_Grip', target_sets = 3, target_reps_min = 5, target_reps_max = 8, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:2')::uuid, v_day_id, 'Wide-Grip_Lat_Pulldown', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Wide-Grip_Lat_Pulldown', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:3')::uuid, v_day_id, 'Romanian_Deadlift', 3, 3, 8, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Romanian_Deadlift', target_sets = 3, target_reps_min = 8, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:4')::uuid, v_day_id, 'Seated_Dumbbell_Press', 4, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:5')::uuid, v_day_id, 'Plank', 5, 3, null, null, 60, null, 'na czas (stoper)');
    end if;
    update public.program_day_slots set default_exercise_id = 'Plank', target_sets = 3, target_reps_min = null, target_reps_max = null, rest_seconds = 60, superset_group = null, notes = 'na czas (stoper)' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:0:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C2: beginner-gym-fbw2 / Trening A ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Trening B';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:0')::uuid, v_day_id, 'Leg_Press', 0, 3, 8, 12, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Leg_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:1')::uuid, v_day_id, 'Incline_Dumbbell_Press', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:2')::uuid, v_day_id, 'Seated_Cable_Rows', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Cable_Rows', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:3')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 3, 2, 8, 10, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 2, target_reps_min = 8, target_reps_max = 10, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:4')::uuid, v_day_id, 'Lying_Leg_Curls', 4, 2, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Lying_Leg_Curls', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:5')::uuid, v_day_id, 'Pullups', 5, 2, 5, 10, 120, null, 'z asystą, jeśli trzeba');
    end if;
    update public.program_day_slots set default_exercise_id = 'Pullups', target_sets = 2, target_reps_min = 5, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = 'z asystą, jeśli trzeba' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:6')::uuid, v_day_id, 'Standing_Calf_Raises', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Calf_Raises', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:7')::uuid, v_day_id, 'Dead_Bug', 7, 2, 8, 12, 45, null, 'na stronę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dead_Bug', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 45, superset_group = null, notes = 'na stronę' where program_day_id = v_day_id and position = 7;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 8) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw2:1:8')::uuid, v_day_id, 'Triceps_Pushdown', 8, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Triceps_Pushdown', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 8;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 9 then
      raise exception 'PLAN-C2: beginner-gym-fbw2 / Trening B ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 40, estimated_minutes_max = 55, content_version = greatest(content_version, 3) where id = v_program_id;
  end if;

  -- beginner-gym-fbw3: v3, 40-50 min
  select id into v_program_id from public.programs where slug = 'beginner-gym-fbw3' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C2 wymaga zakończenia otwartych sesji: beginner-gym-fbw3';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień A';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:0')::uuid, v_day_id, 'Barbell_Squat', 0, 3, 5, 8, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Squat', target_sets = 3, target_reps_min = 5, target_reps_max = 8, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:1')::uuid, v_day_id, 'Barbell_Bench_Press_-_Medium_Grip', 1, 3, 5, 8, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Bench_Press_-_Medium_Grip', target_sets = 3, target_reps_min = 5, target_reps_max = 8, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:2')::uuid, v_day_id, 'Wide-Grip_Lat_Pulldown', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Wide-Grip_Lat_Pulldown', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:3')::uuid, v_day_id, 'Seated_Dumbbell_Press', 3, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:4')::uuid, v_day_id, 'Plank', 4, 3, null, null, 60, null, 'na czas (stoper)');
    end if;
    update public.program_day_slots set default_exercise_id = 'Plank', target_sets = 3, target_reps_min = null, target_reps_max = null, rest_seconds = 60, superset_group = null, notes = 'na czas (stoper)' where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:5')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 5, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:0:6')::uuid, v_day_id, 'Triceps_Pushdown', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Triceps_Pushdown', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C2: beginner-gym-fbw3 / Dzień A ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień B';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:0')::uuid, v_day_id, 'Romanian_Deadlift', 0, 3, 6, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Romanian_Deadlift', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:1')::uuid, v_day_id, 'Chest-Supported_Dumbbell_Row', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Chest-Supported_Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:2')::uuid, v_day_id, 'Incline_Dumbbell_Press', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:3')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 3, 2, 10, 12, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:4')::uuid, v_day_id, 'Hanging_Knee_Raise', 4, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Hanging_Knee_Raise', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:5')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 5, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:1:6')::uuid, v_day_id, 'Triceps_Pushdown', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Triceps_Pushdown', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C2: beginner-gym-fbw3 / Dzień B ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień C';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:0')::uuid, v_day_id, 'Front_Barbell_Squat', 0, 3, 6, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Front_Barbell_Squat', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:1')::uuid, v_day_id, 'Standing_Military_Press', 1, 3, 6, 8, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Military_Press', target_sets = 3, target_reps_min = 6, target_reps_max = 8, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:2')::uuid, v_day_id, 'Pullups', 2, 3, 5, 10, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Pullups', target_sets = 3, target_reps_min = 5, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:3')::uuid, v_day_id, 'Seated_Cable_Rows', 3, 2, 10, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Cable_Rows', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:4')::uuid, v_day_id, 'Standing_Calf_Raises', 4, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Calf_Raises', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:5')::uuid, v_day_id, 'Pallof_Press', 5, 2, 10, 12, 45, null, 'na stronę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Pallof_Press', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 45, superset_group = null, notes = 'na stronę' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-gym-fbw3:2:7')::uuid, v_day_id, 'Triceps_Pushdown', 7, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Triceps_Pushdown', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 7;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 8 then
      raise exception 'PLAN-C2: beginner-gym-fbw3 / Dzień C ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 40, estimated_minutes_max = 50, content_version = greatest(content_version, 3) where id = v_program_id;
  end if;

  -- beginner-home-fbw2: v2, 40-55 min
  select id into v_program_id from public.programs where slug = 'beginner-home-fbw2' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C2 wymaga zakończenia otwartych sesji: beginner-home-fbw2';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Trening A';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:0')::uuid, v_day_id, 'Goblet_Squat', 0, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Goblet_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:1')::uuid, v_day_id, 'Dumbbell_Bench_Press', 1, 3, 8, 12, 120, null, 'bez ławki: wyciskanie hantli na podłodze');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'bez ławki: wyciskanie hantli na podłodze' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:2')::uuid, v_day_id, 'One-Arm_Dumbbell_Row', 2, 3, 8, 12, 120, null, 'na rękę');
    end if;
    update public.program_day_slots set default_exercise_id = 'One-Arm_Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na rękę' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:3')::uuid, v_day_id, 'Stiff-Legged_Dumbbell_Deadlift', 3, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Stiff-Legged_Dumbbell_Deadlift', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:4')::uuid, v_day_id, 'Seated_Dumbbell_Press', 4, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:5')::uuid, v_day_id, 'Plank', 5, 3, null, null, 60, null, 'na czas (stoper)');
    end if;
    update public.program_day_slots set default_exercise_id = 'Plank', target_sets = 3, target_reps_min = null, target_reps_max = null, rest_seconds = 60, superset_group = null, notes = 'na czas (stoper)' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:0:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C2: beginner-home-fbw2 / Trening A ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Trening B';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:0')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 0, 3, 8, 10, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 3, target_reps_min = 8, target_reps_max = 10, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:1')::uuid, v_day_id, 'Incline_Dumbbell_Press', 1, 3, 8, 12, 120, null, 'bez ławki: wyciskanie hantli na podłodze');
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'bez ławki: wyciskanie hantli na podłodze' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:2')::uuid, v_day_id, 'Band_Lat_Pulldown', 2, 3, 10, 15, 90, null, 'bez gumy: przenoszenie hantla za głowę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Band_Lat_Pulldown', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'bez gumy: przenoszenie hantla za głowę' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:3')::uuid, v_day_id, 'Dumbbell_Hip_Thrust', 3, 3, 10, 15, 90, null, 'bez ławki: glute bridge z hantlem');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Hip_Thrust', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'bez ławki: glute bridge z hantlem' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:4')::uuid, v_day_id, 'Bent_Over_Two-Dumbbell_Row', 4, 2, 10, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Bent_Over_Two-Dumbbell_Row', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:5')::uuid, v_day_id, 'Calf_Raise_On_A_Dumbbell', 5, 3, 12, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Raise_On_A_Dumbbell', target_sets = 3, target_reps_min = 12, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:6')::uuid, v_day_id, 'Dead_Bug', 6, 2, 8, 12, 45, null, 'na stronę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dead_Bug', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 45, superset_group = null, notes = 'na stronę' where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw2:1:7')::uuid, v_day_id, 'Standing_Dumbbell_Triceps_Extension', 7, 3, 10, 15, 60, null, 'Łokcie blisko głowy, ruch tylko w łokciu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Dumbbell_Triceps_Extension', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Łokcie blisko głowy, ruch tylko w łokciu.' where program_day_id = v_day_id and position = 7;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 8 then
      raise exception 'PLAN-C2: beginner-home-fbw2 / Trening B ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 40, estimated_minutes_max = 55, content_version = greatest(content_version, 2) where id = v_program_id;
  end if;

  -- beginner-home-fbw3: v4, 40-55 min
  select id into v_program_id from public.programs where slug = 'beginner-home-fbw3' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C2 wymaga zakończenia otwartych sesji: beginner-home-fbw3';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień A';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:0')::uuid, v_day_id, 'Goblet_Squat', 0, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Goblet_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:1')::uuid, v_day_id, 'Dumbbell_Bench_Press', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:2')::uuid, v_day_id, 'One-Arm_Dumbbell_Row', 2, 3, 8, 12, 120, null, 'na rękę');
    end if;
    update public.program_day_slots set default_exercise_id = 'One-Arm_Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na rękę' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:3')::uuid, v_day_id, 'Stiff-Legged_Dumbbell_Deadlift', 3, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Stiff-Legged_Dumbbell_Deadlift', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:4')::uuid, v_day_id, 'Seated_Dumbbell_Press', 4, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Dumbbell_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:5')::uuid, v_day_id, 'Plank', 5, 3, null, null, 60, null, 'na czas (stoper)');
    end if;
    update public.program_day_slots set default_exercise_id = 'Plank', target_sets = 3, target_reps_min = null, target_reps_max = null, rest_seconds = 60, superset_group = null, notes = 'na czas (stoper)' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:0:7')::uuid, v_day_id, 'Standing_Dumbbell_Triceps_Extension', 7, 2, 10, 15, 60, null, 'Łokcie blisko głowy, ruch tylko w łokciu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Dumbbell_Triceps_Extension', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Łokcie blisko głowy, ruch tylko w łokciu.' where program_day_id = v_day_id and position = 7;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 8 then
      raise exception 'PLAN-C2: beginner-home-fbw3 / Dzień A ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień B';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:0')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 0, 3, 8, 10, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 3, target_reps_min = 8, target_reps_max = 10, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:1')::uuid, v_day_id, 'Incline_Dumbbell_Press', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:2')::uuid, v_day_id, 'Band_Lat_Pulldown', 2, 3, 10, 15, 90, null, 'Bez gumy wybierz podciąganie na drążku lub przenoszenie hantla za głowę.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Band_Lat_Pulldown', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'Bez gumy wybierz podciąganie na drążku lub przenoszenie hantla za głowę.' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:3')::uuid, v_day_id, 'Stiff-Legged_Dumbbell_Deadlift', 3, 3, 10, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Stiff-Legged_Dumbbell_Deadlift', target_sets = 3, target_reps_min = 10, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:4')::uuid, v_day_id, 'Side_Lateral_Raise', 4, 3, 12, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Side_Lateral_Raise', target_sets = 3, target_reps_min = 12, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:5')::uuid, v_day_id, 'Calf_Raise_On_A_Dumbbell', 5, 3, 12, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Raise_On_A_Dumbbell', target_sets = 3, target_reps_min = 12, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:6')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:1:7')::uuid, v_day_id, 'Standing_Dumbbell_Triceps_Extension', 7, 2, 10, 15, 60, null, 'Łokcie blisko głowy, ruch tylko w łokciu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Dumbbell_Triceps_Extension', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Łokcie blisko głowy, ruch tylko w łokciu.' where program_day_id = v_day_id and position = 7;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 8 then
      raise exception 'PLAN-C2: beginner-home-fbw3 / Dzień B ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień C';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:0')::uuid, v_day_id, 'Bulgarian_Split_Squat', 0, 3, 8, 10, 120, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bulgarian_Split_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:1')::uuid, v_day_id, 'Bent_Over_Two-Dumbbell_Row', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Bent_Over_Two-Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:2')::uuid, v_day_id, 'Dumbbell_Bench_Press', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:3')::uuid, v_day_id, 'Dumbbell_Hip_Thrust', 3, 3, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Hip_Thrust', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:4')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 4, 2, 10, 12, 60, null, 'Opcjonalny finisher — pomiń przy braku czasu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = 'Opcjonalny finisher — pomiń przy braku czasu.' where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:5')::uuid, v_day_id, 'Standing_Dumbbell_Triceps_Extension', 5, 2, 10, 12, 60, null, 'Opcjonalny finisher — pomiń przy braku czasu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Dumbbell_Triceps_Extension', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = 'Opcjonalny finisher — pomiń przy braku czasu.' where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-home-fbw3:2:6')::uuid, v_day_id, 'Dead_Bug', 6, 2, 8, 12, 45, null, 'Opcjonalny finisher, na stronę — pomiń przy braku czasu.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dead_Bug', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 45, superset_group = null, notes = 'Opcjonalny finisher, na stronę — pomiń przy braku czasu.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C2: beginner-home-fbw3 / Dzień C ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 40, estimated_minutes_max = 55, content_version = greatest(content_version, 4) where id = v_program_id;
  end if;

  -- beginner-bodyweight-fbw3: v3, 30-45 min
  select id into v_program_id from public.programs where slug = 'beginner-bodyweight-fbw3' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C2 wymaga zakończenia otwartych sesji: beginner-bodyweight-fbw3';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień A';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:0:0')::uuid, v_day_id, 'Bodyweight_Squat', 0, 3, 12, 20, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Bodyweight_Squat', target_sets = 3, target_reps_min = 12, target_reps_max = 20, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:0:1')::uuid, v_day_id, 'Pushups', 1, 3, 8, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Pushups', target_sets = 3, target_reps_min = 8, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:0:2')::uuid, v_day_id, 'Pullups', 2, 3, 5, 10, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Pullups', target_sets = 3, target_reps_min = 5, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:0:3')::uuid, v_day_id, 'Pike_Push-Up', 3, 2, 6, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Pike_Push-Up', target_sets = 2, target_reps_min = 6, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:0:4')::uuid, v_day_id, 'Plank', 4, 3, null, null, 60, null, 'na czas (stoper)');
    end if;
    update public.program_day_slots set default_exercise_id = 'Plank', target_sets = 3, target_reps_min = null, target_reps_max = null, rest_seconds = 60, superset_group = null, notes = 'na czas (stoper)' where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:0:5')::uuid, v_day_id, 'Bench_Dips', 5, 2, 8, 15, 60, null, 'Oprzyj dłonie na stabilnym podwyższeniu. Bez podwyższenia zrób pompki wąskie.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bench_Dips', target_sets = 2, target_reps_min = 8, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Oprzyj dłonie na stabilnym podwyższeniu. Bez podwyższenia zrób pompki wąskie.' where program_day_id = v_day_id and position = 5;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 6 then
      raise exception 'PLAN-C2: beginner-bodyweight-fbw3 / Dzień A ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień B';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:1:0')::uuid, v_day_id, 'Bodyweight_Walking_Lunge', 0, 3, 10, 15, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bodyweight_Walking_Lunge', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:1:1')::uuid, v_day_id, 'Inverted_Row', 1, 3, 8, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Inverted_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:1:2')::uuid, v_day_id, 'Decline_Push-Up', 2, 3, 8, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Decline_Push-Up', target_sets = 3, target_reps_min = 8, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:1:3')::uuid, v_day_id, 'Single_Leg_Glute_Bridge', 3, 3, 8, 12, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Single_Leg_Glute_Bridge', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:1:4')::uuid, v_day_id, 'Hanging_Knee_Raise', 4, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Hanging_Knee_Raise', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:1:5')::uuid, v_day_id, 'Bench_Dips', 5, 2, 8, 15, 60, null, 'Oprzyj dłonie na stabilnym podwyższeniu. Bez podwyższenia zrób pompki wąskie.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bench_Dips', target_sets = 2, target_reps_min = 8, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Oprzyj dłonie na stabilnym podwyższeniu. Bez podwyższenia zrób pompki wąskie.' where program_day_id = v_day_id and position = 5;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 6 then
      raise exception 'PLAN-C2: beginner-bodyweight-fbw3 / Dzień B ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Dzień C';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:0')::uuid, v_day_id, 'Split_Squats', 0, 3, 10, 15, 90, null, 'na nogę · progres: plecak lub wolne tempo');
    end if;
    update public.program_day_slots set default_exercise_id = 'Split_Squats', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = 'na nogę · progres: plecak lub wolne tempo' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:1')::uuid, v_day_id, 'Chin-Up', 1, 3, 5, 10, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Chin-Up', target_sets = 3, target_reps_min = 5, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:2')::uuid, v_day_id, 'Pushups', 2, 3, 6, 12, 90, null, 'Następny krok to pompki archer albo pseudo planche.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Pushups', target_sets = 3, target_reps_min = 6, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'Następny krok to pompki archer albo pseudo planche.' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:3')::uuid, v_day_id, 'Single_Leg_Calf_Raise', 3, 3, 12, 20, 60, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Single_Leg_Calf_Raise', target_sets = 3, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:4')::uuid, v_day_id, 'Hollow_Body_Hold', 4, 3, null, null, 45, null, 'na czas (stoper)');
    end if;
    update public.program_day_slots set default_exercise_id = 'Hollow_Body_Hold', target_sets = 3, target_reps_min = null, target_reps_max = null, rest_seconds = 45, superset_group = null, notes = 'na czas (stoper)' where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:5')::uuid, v_day_id, 'Superman', 5, 2, 12, 15, 45, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Superman', target_sets = 2, target_reps_min = 12, target_reps_max = 15, rest_seconds = 45, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:beginner-bodyweight-fbw3:2:6')::uuid, v_day_id, 'Bench_Dips', 6, 2, 8, 15, 60, null, 'Oprzyj dłonie na stabilnym podwyższeniu. Bez podwyższenia zrób pompki wąskie.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bench_Dips', target_sets = 2, target_reps_min = 8, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Oprzyj dłonie na stabilnym podwyższeniu. Bez podwyższenia zrób pompki wąskie.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C2: beginner-bodyweight-fbw3 / Dzień C ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set estimated_minutes_min = 30, estimated_minutes_max = 45, content_version = greatest(content_version, 3) where id = v_program_id;
  end if;

end
$planc2$;
