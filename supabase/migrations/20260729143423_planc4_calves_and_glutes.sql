-- PLAN-C4: domknięcie biblioteki — łydki w domowym FBW i pośladki w górze/dole.
--
-- `intermediate-home-fbw2` nie miał żadnej pracy łydek; dochodzi po jednej pozycji w obu dniach.
-- `intermediate-gym-upper-lower4` nie miał ruchu z pośladkiem jako mięśniem głównym — Lower B
-- dostaje glute bridge w wolnym czasie sesji (49 → 56 min przy deklaracji 50–70).
--
-- Czego świadomie NIE zmieniamy, mimo że audyt pokazuje „zero":
-- - biceps w `intermediate-bodyweight-fbw3` i `advanced-bodyweight-upper-lower4` — bez sprzętu
--   nie ma sensownej izolacji, tę pracę niosą podciąganie, chin-up i wiosłowanie, a sesje są już
--   na górnej granicy deklarowanego czasu;
-- - pośladki jako „zero bezpośrednio" w planach z przysiadem, RDL i martwym ciągiem — to artefakt
--   tagowania katalogu, nie luka treningowa;
-- - pionowe przyciąganie w `intermediate-home-fbw2` — wymagałoby drążka albo gumy, czyli zmiany
--   kontraktu sprzętowego planu. Karta mówi o tym wprost.
--
-- Niezmienniki: pozycyjna aktualizacja jak w `scripts/seed.ts`, zero usuwania slotów,
-- bramka otwartej sesji per plan, brak zmian aktywnego programu i historii.

do $planc4$
declare
  v_program_id uuid;
  v_day_id uuid;
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'PLAN-C4: pomijam, baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  select id into v_program_id from public.programs where slug = 'intermediate-home-fbw2' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C4 wymaga zakończenia otwartych sesji: intermediate-home-fbw2';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Trening A';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:0')::uuid, v_day_id, 'Goblet_Squat', 0, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Goblet_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:1')::uuid, v_day_id, 'Stiff-Legged_Dumbbell_Deadlift', 1, 3, 8, 12, 120, null, 'Rumuński martwy ciąg z hantlami.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Stiff-Legged_Dumbbell_Deadlift', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'Rumuński martwy ciąg z hantlami.' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:2')::uuid, v_day_id, 'Bent_Over_Two-Dumbbell_Row', 2, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Bent_Over_Two-Dumbbell_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:3')::uuid, v_day_id, 'Dumbbell_Bench_Press', 3, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bench_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:4')::uuid, v_day_id, 'Dumbbell_Shoulder_Press', 4, 2, 8, 12, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Shoulder_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:5')::uuid, v_day_id, 'Dumbbell_Bicep_Curl', 5, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Bicep_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:6')::uuid, v_day_id, 'Lying_Dumbbell_Tricep_Extension', 6, 2, 10, 15, 60, null, 'Francuskie wyciskanie hantli leżąc.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Lying_Dumbbell_Tricep_Extension', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = 'Francuskie wyciskanie hantli leżąc.' where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:7')::uuid, v_day_id, 'Dead_Bug', 7, 2, 8, 12, 45, null, 'na stronę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dead_Bug', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 45, superset_group = null, notes = 'na stronę' where program_day_id = v_day_id and position = 7;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 8) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:0:8')::uuid, v_day_id, 'Calf_Raise_On_A_Dumbbell', 8, 2, 12, 20, 60, null, 'Pełny zakres, krótka pauza u góry.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Raise_On_A_Dumbbell', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = 'Pełny zakres, krótka pauza u góry.' where program_day_id = v_day_id and position = 8;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 9 then
      raise exception 'PLAN-C4: intermediate-home-fbw2 / Trening A ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Trening B';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:0')::uuid, v_day_id, 'Dumbbell_Rear_Lunge', 0, 3, 8, 12, 90, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Rear_Lunge', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:1')::uuid, v_day_id, 'Kettlebell_One-Legged_Deadlift', 1, 3, 8, 12, 90, null, 'Martwy ciąg na jednej nodze.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Kettlebell_One-Legged_Deadlift', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'Martwy ciąg na jednej nodze.' where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:2')::uuid, v_day_id, 'Alternating_Renegade_Row', 2, 3, 8, 12, 90, null, 'na stronę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Alternating_Renegade_Row', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 90, superset_group = null, notes = 'na stronę' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:3')::uuid, v_day_id, 'Push-Ups_With_Feet_Elevated', 3, 3, 8, 15, 75, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Push-Ups_With_Feet_Elevated', target_sets = 3, target_reps_min = 8, target_reps_max = 15, rest_seconds = 75, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:4')::uuid, v_day_id, 'Side_Lateral_Raise', 4, 2, 12, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Side_Lateral_Raise', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:5')::uuid, v_day_id, 'Hammer_Curls', 5, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Hammer_Curls', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:6')::uuid, v_day_id, 'Standing_Dumbbell_Triceps_Extension', 6, 2, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Dumbbell_Triceps_Extension', target_sets = 2, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:7')::uuid, v_day_id, 'Hollow_Body_Hold', 7, 2, null, null, 45, null, 'na czas (stoper), ~30 s; regres: kolana ugięte');
    end if;
    update public.program_day_slots set default_exercise_id = 'Hollow_Body_Hold', target_sets = 2, target_reps_min = null, target_reps_max = null, rest_seconds = 45, superset_group = null, notes = 'na czas (stoper), ~30 s; regres: kolana ugięte' where program_day_id = v_day_id and position = 7;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 8) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-home-fbw2:1:8')::uuid, v_day_id, 'Calf_Raise_On_A_Dumbbell', 8, 2, 12, 20, 60, null, 'Pełny zakres, krótka pauza u góry.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Raise_On_A_Dumbbell', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = 'Pełny zakres, krótka pauza u góry.' where program_day_id = v_day_id and position = 8;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 9 then
      raise exception 'PLAN-C4: intermediate-home-fbw2 / Trening B ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set content_version = greatest(content_version, 3) where id = v_program_id;
  end if;

  select id into v_program_id from public.programs where slug = 'intermediate-gym-upper-lower4' and user_id is null;
  if v_program_id is not null then
    if exists (select 1 from public.sessions se join public.program_days d on d.id = se.program_day_id where se.finished_at is null and d.program_id = v_program_id) then
      raise exception using errcode = '55000', message = 'PLAN-C4 wymaga zakończenia otwartych sesji: intermediate-gym-upper-lower4';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Upper A · siła';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:0')::uuid, v_day_id, 'Barbell_Bench_Press_-_Medium_Grip', 0, 4, 5, 8, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Bench_Press_-_Medium_Grip', target_sets = 4, target_reps_min = 5, target_reps_max = 8, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:1')::uuid, v_day_id, 'Bent_Over_Barbell_Row', 1, 4, 6, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Bent_Over_Barbell_Row', target_sets = 4, target_reps_min = 6, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:2')::uuid, v_day_id, 'Standing_Military_Press', 2, 3, 6, 10, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Military_Press', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:3')::uuid, v_day_id, 'Wide-Grip_Lat_Pulldown', 3, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Wide-Grip_Lat_Pulldown', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:4')::uuid, v_day_id, 'Side_Lateral_Raise', 4, 3, 12, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Side_Lateral_Raise', target_sets = 3, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:5')::uuid, v_day_id, 'Triceps_Pushdown', 5, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Triceps_Pushdown', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:0:6')::uuid, v_day_id, 'Barbell_Curl', 6, 3, 8, 12, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Curl', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C4: intermediate-gym-upper-lower4 / Upper A · siła ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Lower A · siła';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:1:0')::uuid, v_day_id, 'Barbell_Squat', 0, 4, 5, 8, 180, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Squat', target_sets = 4, target_reps_min = 5, target_reps_max = 8, rest_seconds = 180, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:1:1')::uuid, v_day_id, 'Romanian_Deadlift', 1, 3, 6, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Romanian_Deadlift', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:1:2')::uuid, v_day_id, 'Leg_Press', 2, 3, 10, 15, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Leg_Press', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:1:3')::uuid, v_day_id, 'Lying_Leg_Curls', 3, 3, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Lying_Leg_Curls', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:1:4')::uuid, v_day_id, 'Standing_Calf_Raises', 4, 4, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Standing_Calf_Raises', target_sets = 4, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:1:5')::uuid, v_day_id, 'Hanging_Leg_Raise', 5, 3, 10, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Hanging_Leg_Raise', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 6 then
      raise exception 'PLAN-C4: intermediate-gym-upper-lower4 / Lower A · siła ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Upper B · hipertrofia';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:0')::uuid, v_day_id, 'Incline_Dumbbell_Press', 0, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Press', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:1')::uuid, v_day_id, 'Seated_Cable_Rows', 1, 3, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Cable_Rows', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:2')::uuid, v_day_id, 'Pullups', 2, 3, 6, 10, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Pullups', target_sets = 3, target_reps_min = 6, target_reps_max = 10, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:3')::uuid, v_day_id, 'Dumbbell_Shoulder_Press', 3, 2, 8, 12, 120, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dumbbell_Shoulder_Press', target_sets = 2, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:4')::uuid, v_day_id, 'Cable_Seated_Lateral_Raise', 4, 2, 12, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Cable_Seated_Lateral_Raise', target_sets = 2, target_reps_min = 12, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:5')::uuid, v_day_id, 'Face_Pull', 5, 2, 15, 20, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Face_Pull', target_sets = 2, target_reps_min = 15, target_reps_max = 20, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:6')::uuid, v_day_id, 'Dips_-_Triceps_Version', 6, 3, 8, 12, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Dips_-_Triceps_Version', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 6;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:2:7')::uuid, v_day_id, 'Incline_Dumbbell_Curl', 7, 2, 10, 12, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Incline_Dumbbell_Curl', target_sets = 2, target_reps_min = 10, target_reps_max = 12, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 7;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 8 then
      raise exception 'PLAN-C4: intermediate-gym-upper-lower4 / Upper B · hipertrofia ma nieoczekiwaną liczbę pozycji.';
    end if;
    select id into strict v_day_id from public.program_days where program_id = v_program_id and label = 'Lower B · hipertrofia';
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 0) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:0')::uuid, v_day_id, 'Barbell_Deadlift', 0, 3, 3, 5, 180, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Deadlift', target_sets = 3, target_reps_min = 3, target_reps_max = 5, rest_seconds = 180, superset_group = null, notes = null where program_day_id = v_day_id and position = 0;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 1) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:1')::uuid, v_day_id, 'Front_Barbell_Squat', 1, 3, 8, 10, 150, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Front_Barbell_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 10, rest_seconds = 150, superset_group = null, notes = null where program_day_id = v_day_id and position = 1;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 2) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:2')::uuid, v_day_id, 'Bulgarian_Split_Squat', 2, 3, 8, 12, 120, null, 'na nogę');
    end if;
    update public.program_day_slots set default_exercise_id = 'Bulgarian_Split_Squat', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'na nogę' where program_day_id = v_day_id and position = 2;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 3) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:3')::uuid, v_day_id, 'Leg_Extensions', 3, 3, 12, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Leg_Extensions', target_sets = 3, target_reps_min = 12, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 3;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 4) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:4')::uuid, v_day_id, 'Seated_Leg_Curl', 4, 3, 10, 15, 90, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Seated_Leg_Curl', target_sets = 3, target_reps_min = 10, target_reps_max = 15, rest_seconds = 90, superset_group = null, notes = null where program_day_id = v_day_id and position = 4;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 5) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:5')::uuid, v_day_id, 'Calf_Press', 5, 4, 12, 15, 60, null, null);
    end if;
    update public.program_day_slots set default_exercise_id = 'Calf_Press', target_sets = 4, target_reps_min = 12, target_reps_max = 15, rest_seconds = 60, superset_group = null, notes = null where program_day_id = v_day_id and position = 5;
    if not exists (select 1 from public.program_day_slots where program_day_id = v_day_id and position = 6) then
      insert into public.program_day_slots (id, program_day_id, default_exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
      values (md5('arco:system-program-slot:intermediate-gym-upper-lower4:3:6')::uuid, v_day_id, 'Barbell_Glute_Bridge', 6, 3, 8, 12, 120, null, 'Broda przy klatce, żebra w dół. Wyprost bioder, nie odchylenie lędźwi.');
    end if;
    update public.program_day_slots set default_exercise_id = 'Barbell_Glute_Bridge', target_sets = 3, target_reps_min = 8, target_reps_max = 12, rest_seconds = 120, superset_group = null, notes = 'Broda przy klatce, żebra w dół. Wyprost bioder, nie odchylenie lędźwi.' where program_day_id = v_day_id and position = 6;
    if (select count(*) from public.program_day_slots where program_day_id = v_day_id) <> 7 then
      raise exception 'PLAN-C4: intermediate-gym-upper-lower4 / Lower B · hipertrofia ma nieoczekiwaną liczbę pozycji.';
    end if;
    update public.programs set content_version = greatest(content_version, 4) where id = v_program_id;
  end if;

end
$planc4$;
