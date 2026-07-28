-- PLAN-C1: recepta v2.1 dla P14 `intermediate-gym-fbw2`.
--
-- Kontekst: biblioteka v2.1 (`docs/plan-c0-mapowanie-cwiczen-v21.md`) zastępuje receptę z
-- TRAIN-01. Oba dni zostają przy 7 pozycjach i idą z 23/22 na 21/21 serii roboczych.
--
-- Odejście od v2.1: biblioteka daje jedną izolację ramion na sesję (biceps w A, triceps w B),
-- czyli po 3 serie bezpośrednie tygodniowo przy dwóch dniach. Za mało dla celu sylwetkowego,
-- więc każda sesja ma obie partie — siódma pozycja to triceps w A i biceps w B.
--
-- Niezmienniki:
-- - nie zmieniamy recepty pod otwartą sesją, dopóki nie ma snapshotu CORE-1;
-- - aktualizujemy sloty POZYCYJNIE, dokładnie tak jak `scripts/seed.ts`, żeby migracja i seed
--   prowadziły do tego samego stanu; slot na pozycji N zachowuje ID i dostaje nowe ćwiczenie;
-- - liczba slotów w dniu się nie zmienia, więc **nic nie usuwamy** i żaden wiersz historii nie
--   traci powiązania ze slotem;
-- - aktywny program użytkownika i zakończone wyniki pozostają bez zmian.

do $planc1$
declare
  v_program_id uuid;
  v_day_id uuid;
  v_missing text;
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'PLAN-C1: pomijam, baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  select id into v_program_id
  from public.programs
  where slug = 'intermediate-gym-fbw2' and user_id is null;

  if v_program_id is null then
    raise notice 'PLAN-C1: brak programu systemowego intermediate-gym-fbw2, pomijam.';
    return;
  end if;

  if exists (
    select 1
    from public.sessions session
    join public.program_days day on day.id = session.program_day_id
    where session.finished_at is null
      and day.program_id = v_program_id
  ) then
    raise exception using
      errcode = '55000',
      message = 'PLAN-C1 wymaga zakończenia lub usunięcia otwartych sesji P14.';
  end if;

  -- Jawny błąd zamiast surowego naruszenia FK, gdy katalog produkcyjny jest niepełny.
  select string_agg(needed.id, ', ') into v_missing
  from (values
    ('Barbell_Squat'),
    ('Barbell_Incline_Bench_Press_-_Medium_Grip'),
    ('Wide-Grip_Lat_Pulldown'),
    ('Side_Lateral_Raise'),
    ('Incline_Dumbbell_Curl'),
    ('Reverse_Crunch'),
    ('Cable_Rope_Overhead_Triceps_Extension'),
    ('Romanian_Deadlift'),
    ('Barbell_Bench_Press_-_Medium_Grip'),
    ('Chest-Supported_Dumbbell_Row'),
    ('Arnold_Dumbbell_Press'),
    ('Triceps_Pushdown'),
    ('Hanging_Knee_Raise'),
    ('Hammer_Curls')
  ) as needed(id)
  where not exists (select 1 from public.exercises e where e.id = needed.id);

  if v_missing is not null then
    raise exception using
      errcode = '55000',
      message = 'PLAN-C1: brak ćwiczeń w katalogu: ' || v_missing;
  end if;

  -- ── Trening A: przysiad + skos 30° + pionowe przyciąganie ──
  select id into strict v_day_id
  from public.program_days
  where program_id = v_program_id and label = 'Trening A';

  update public.program_day_slots
  set default_exercise_id = 'Barbell_Squat', target_sets = 4,
      target_reps_min = 5, target_reps_max = 8, rest_seconds = 180,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 0;

  update public.program_day_slots
  set default_exercise_id = 'Barbell_Incline_Bench_Press_-_Medium_Grip', target_sets = 4,
      target_reps_min = 6, target_reps_max = 10, rest_seconds = 150,
      superset_group = null, notes = 'Oparcie ustaw na około 30 stopni.'
  where program_day_id = v_day_id and position = 1;

  update public.program_day_slots
  set default_exercise_id = 'Wide-Grip_Lat_Pulldown', target_sets = 4,
      target_reps_min = 6, target_reps_max = 10, rest_seconds = 120,
      superset_group = null,
      notes = 'Podciąganie jest pełnoprawnym wariantem, jeśli utrzymasz pełny zakres.'
  where program_day_id = v_day_id and position = 2;

  update public.program_day_slots
  set default_exercise_id = 'Side_Lateral_Raise', target_sets = 2,
      target_reps_min = 12, target_reps_max = 20, rest_seconds = 60,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 3;

  update public.program_day_slots
  set default_exercise_id = 'Incline_Dumbbell_Curl', target_sets = 3,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 4;

  update public.program_day_slots
  set default_exercise_id = 'Reverse_Crunch', target_sets = 2,
      target_reps_min = 10, target_reps_max = 20, rest_seconds = 60,
      superset_group = null, notes = 'Inicjuj ruch podwinięciem miednicy, bez rozpędu.'
  where program_day_id = v_day_id and position = 5;


  -- Gdyby siódmej pozycji brakowało (np. baza po wcześniejszym wariancie recepty), dokładamy ją
  -- z tym samym deterministycznym ID, którego użyłby `scripts/seed.ts`.
  if not exists (
    select 1 from public.program_day_slots
    where program_day_id = v_day_id and position = 6
  ) then
    insert into public.program_day_slots (
      id, program_day_id, default_exercise_id, position, target_sets,
      target_reps_min, target_reps_max, rest_seconds, superset_group, notes
    ) values (
      md5('arco:system-program-slot:intermediate-gym-fbw2:0:6')::uuid,
      v_day_id, 'Barbell_Squat', 6, 1, 1, 2, 60, null, null
    );
  end if;

  update public.program_day_slots
  set default_exercise_id = 'Cable_Rope_Overhead_Triceps_Extension', target_sets = 2,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60,
      superset_group = null,
      notes = 'Praca zza głowy rozciąga długą głowę tricepsa; w B pracujesz nad nią z góry.'
  where program_day_id = v_day_id and position = 6;

  if (
    select array_agg(default_exercise_id order by position)
    from public.program_day_slots
    where program_day_id = v_day_id
  ) is distinct from array[
    'Barbell_Squat',
    'Barbell_Incline_Bench_Press_-_Medium_Grip',
    'Wide-Grip_Lat_Pulldown',
    'Side_Lateral_Raise',
    'Incline_Dumbbell_Curl',
    'Reverse_Crunch',
    'Cable_Rope_Overhead_Triceps_Extension'
  ]::text[] then
    raise exception 'PLAN-C1: nieoczekiwany kształt P14 Trening A.';
  end if;

  if (
    select sum(target_sets) from public.program_day_slots where program_day_id = v_day_id
  ) <> 21 then
    raise exception 'PLAN-C1: P14 Trening A musi mieć 21 serii.';
  end if;

  -- ── Trening B: zawias + ławka płaska + wiosłowanie ──
  select id into strict v_day_id
  from public.program_days
  where program_id = v_program_id and label = 'Trening B';

  update public.program_day_slots
  set default_exercise_id = 'Romanian_Deadlift', target_sets = 4,
      target_reps_min = 6, target_reps_max = 10, rest_seconds = 180,
      superset_group = null,
      notes = 'Zakończ serię, gdy kolejne powtórzenie wymagałoby utraty neutralnej pozycji tułowia.'
  where program_day_id = v_day_id and position = 0;

  update public.program_day_slots
  set default_exercise_id = 'Barbell_Bench_Press_-_Medium_Grip', target_sets = 4,
      target_reps_min = 6, target_reps_max = 10, rest_seconds = 150,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 1;

  update public.program_day_slots
  set default_exercise_id = 'Chest-Supported_Dumbbell_Row', target_sets = 4,
      target_reps_min = 8, target_reps_max = 12, rest_seconds = 120,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 2;

  update public.program_day_slots
  set default_exercise_id = 'Arnold_Dumbbell_Press', target_sets = 2,
      target_reps_min = 8, target_reps_max = 12, rest_seconds = 90,
      superset_group = null,
      notes = 'Dwie serie wystarczą, bo przedni akton barku pracuje już w wyciskaniach.'
  where program_day_id = v_day_id and position = 3;

  update public.program_day_slots
  set default_exercise_id = 'Triceps_Pushdown', target_sets = 3,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 4;

  update public.program_day_slots
  set default_exercise_id = 'Hanging_Knee_Raise', target_sets = 2,
      target_reps_min = 8, target_reps_max = 15, rest_seconds = 60,
      superset_group = null, notes = null
  where program_day_id = v_day_id and position = 5;


  -- Gdyby siódmej pozycji brakowało (np. baza po wcześniejszym wariancie recepty), dokładamy ją
  -- z tym samym deterministycznym ID, którego użyłby `scripts/seed.ts`.
  if not exists (
    select 1 from public.program_day_slots
    where program_day_id = v_day_id and position = 6
  ) then
    insert into public.program_day_slots (
      id, program_day_id, default_exercise_id, position, target_sets,
      target_reps_min, target_reps_max, rest_seconds, superset_group, notes
    ) values (
      md5('arco:system-program-slot:intermediate-gym-fbw2:1:6')::uuid,
      v_day_id, 'Barbell_Squat', 6, 1, 1, 2, 60, null, null
    );
  end if;

  update public.program_day_slots
  set default_exercise_id = 'Hammer_Curls', target_sets = 2,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60,
      superset_group = null,
      notes = 'Chwyt młotkowy dokłada ramienno-promieniowy, którego nie dostajesz z uginania na skosie w A.'
  where program_day_id = v_day_id and position = 6;

  if (
    select array_agg(default_exercise_id order by position)
    from public.program_day_slots
    where program_day_id = v_day_id
  ) is distinct from array[
    'Romanian_Deadlift',
    'Barbell_Bench_Press_-_Medium_Grip',
    'Chest-Supported_Dumbbell_Row',
    'Arnold_Dumbbell_Press',
    'Triceps_Pushdown',
    'Hanging_Knee_Raise',
    'Hammer_Curls'
  ]::text[] then
    raise exception 'PLAN-C1: nieoczekiwany kształt P14 Trening B.';
  end if;

  if (
    select sum(target_sets) from public.program_day_slots where program_day_id = v_day_id
  ) <> 21 then
    raise exception 'PLAN-C1: P14 Trening B musi mieć 21 serii.';
  end if;

  update public.programs
  set required_equipment = array['barbell', 'dumbbell', 'cable'],
      optional_equipment = array['machine', 'body only'],
      description = 'Dwa treningi całego ciała na pełnym sprzęcie. Każda sesja ma jedno duże ćwiczenie na dół, pełny push i pull oraz bezpośrednią pracę ramion. Zostaw 1 lub 2 powtórzenia w zapasie.',
      content_version = greatest(content_version, 4)
  where id = v_program_id;
end
$planc1$;

-- ── Alternatywy sprzętowe (14) ──
-- Payload jest dokładną kopią zakresu `intermediate-gym-fbw2` z
-- `scripts/data/program-slot-alternatives.ts`; test PLAN-C1 pilnuje zgodności.
-- Produkcji nie seedujemy, więc alternatywy muszą przyjechać razem z receptą.
do $planc1_alt$
declare
  alternatives_payload constant jsonb := $alternatives$
[
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Barbell_Squat","alternativeExerciseId":"Smith_Machine_Squat","missingEquipment":["barbell"],"alternativeEquipment":["machine"],"patternCoverage":"same_pattern","notePl":"Przysiad w prowadzeniu, gdy nie ma wolnej klatki ze sztangą; tor ruchu jest sztywniejszy."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Barbell_Squat","alternativeExerciseId":"Hack_Squat","missingEquipment":["barbell"],"alternativeEquipment":["machine"],"patternCoverage":"same_pattern","notePl":"Wzorzec kolanowy na maszynie; mniejsze wymaganie stabilizacji tułowia niż w wolnym przysiadzie."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Barbell_Incline_Bench_Press_-_Medium_Grip","alternativeExerciseId":"Incline_Dumbbell_Press","missingEquipment":["barbell"],"alternativeEquipment":["dumbbell","bench"],"patternCoverage":"same_pattern","notePl":"Ten sam kąt skosu hantlami; ciężar całkowity będzie niższy niż przy sztandze."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Wide-Grip_Lat_Pulldown","alternativeExerciseId":"Pullups","missingEquipment":["cable"],"alternativeEquipment":["pull-up bar"],"patternCoverage":"same_pattern","notePl":"Pionowe przyciąganie bez wyciągu; obciążenie jest stałe, więc reguluj je gumą lub pauzą."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Side_Lateral_Raise","alternativeExerciseId":"Cable_Seated_Lateral_Raise","missingEquipment":["dumbbell"],"alternativeEquipment":["cable"],"patternCoverage":"same_pattern","notePl":"Wznos bokiem z równiejszym oporem na całym zakresie; dobierz mniejszy ciężar niż w hantlach."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Incline_Dumbbell_Curl","alternativeExerciseId":"Standing_Biceps_Cable_Curl","missingEquipment":["bench"],"alternativeEquipment":["cable"],"patternCoverage":"same_pattern","notePl":"Uginanie bez ławki skośnej; traci rozciągnięcie długiej głowy bicepsa w dolnej fazie."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening A","defaultExerciseId":"Cable_Rope_Overhead_Triceps_Extension","alternativeExerciseId":"Lying_Dumbbell_Tricep_Extension","missingEquipment":["cable"],"alternativeEquipment":["dumbbell","bench"],"patternCoverage":"same_pattern","notePl":"Prostowanie zza głowy bez wyciągu; utrzymaj łokcie blisko siebie i nie odbijaj w dole."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Romanian_Deadlift","alternativeExerciseId":"Hyperextensions_Back_Extensions","missingEquipment":["barbell"],"alternativeEquipment":["roman chair"],"patternCoverage":"partial_pattern","notePl":"Zawias bez sztangi; obciąża tylną taśmę słabiej i nie zastępuje ciężkiego martwego ciągu."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Barbell_Bench_Press_-_Medium_Grip","alternativeExerciseId":"Dumbbell_Bench_Press","missingEquipment":["barbell"],"alternativeEquipment":["dumbbell","bench"],"patternCoverage":"same_pattern","notePl":"Poziome wyciskanie hantlami; większy zakres w dole, ale niższy ciężar całkowity."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Chest-Supported_Dumbbell_Row","alternativeExerciseId":"Seated_Cable_Rows","missingEquipment":["bench"],"alternativeEquipment":["cable"],"patternCoverage":"same_pattern","notePl":"Poziome przyciąganie bez ławki; pilnuj, żeby nie odchylać tułowia dla rozpędu."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Arnold_Dumbbell_Press","alternativeExerciseId":"Machine_Shoulder_Military_Press","missingEquipment":["dumbbell"],"alternativeEquipment":["machine"],"patternCoverage":"same_pattern","notePl":"Wyciskanie nad głowę w prowadzeniu; nie odtwarza rotacji charakterystycznej dla Arnolda."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Triceps_Pushdown","alternativeExerciseId":"Lying_Dumbbell_Tricep_Extension","missingEquipment":["cable"],"alternativeEquipment":["dumbbell","bench"],"patternCoverage":"same_pattern","notePl":"Prostowanie łokcia bez wyciągu; opór jest największy w środku zakresu, nie na końcu."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Hanging_Knee_Raise","alternativeExerciseId":"Dead_Bug","missingEquipment":["pull-up bar"],"alternativeEquipment":["body only"],"patternCoverage":"partial_pattern","notePl":"Praca core bez drążka; kontroluj lędźwie przy podłożu zamiast szukać większego zakresu."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Hammer_Curls","alternativeExerciseId":"Cable_Hammer_Curls_-_Rope_Attachment","missingEquipment":["dumbbell"],"alternativeEquipment":["cable"],"patternCoverage":"same_pattern","notePl":"Chwyt młotkowy na lince; opór jest równiejszy, więc dobierz nieco mniejszy ciężar."}
]
$alternatives$::jsonb;
  alternative_value jsonb;
  slot_id_value uuid;
  next_position int;
  match_count int;
begin
  if not exists (select 1 from public.exercises) then
    return;
  end if;

  if not exists (
    select 1 from public.programs where slug = 'intermediate-gym-fbw2' and user_id is null
  ) then
    return;
  end if;

  for alternative_value in select * from jsonb_array_elements(alternatives_payload)
  loop
    select slot.id into slot_id_value
    from public.program_day_slots slot
    join public.program_days day on day.id = slot.program_day_id
    join public.programs program on program.id = day.program_id
    where program.slug = alternative_value->>'programSlug'
      and program.user_id is null
      and day.label = alternative_value->>'dayLabel'
      and slot.default_exercise_id = alternative_value->>'defaultExerciseId';

    if slot_id_value is null then
      raise exception 'PLAN-C1: brak slotu % / % / %',
        alternative_value->>'programSlug',
        alternative_value->>'dayLabel',
        alternative_value->>'defaultExerciseId';
    end if;

    -- unique(program_day_slot_id, position): kolejna alternatywa tego samego slotu
    -- dostaje następną wolną pozycję, tak samo jak w `scripts/seed.ts`.
    select coalesce(max(position) + 1, 0) into next_position
    from public.program_slot_alternatives
    where program_day_slot_id = slot_id_value
      and alternative_exercise_id is distinct from (alternative_value->>'alternativeExerciseId');

    insert into public.program_slot_alternatives (
      id, program_day_slot_id, alternative_exercise_id, position,
      missing_equipment, alternative_equipment, pattern_coverage, note_pl, content_version
    )
    values (
      md5(
        'arco:program-slot-alternative:' || slot_id_value::text
        || ':' || (alternative_value->>'alternativeExerciseId')
      )::uuid,
      slot_id_value,
      alternative_value->>'alternativeExerciseId',
      next_position,
      array(select jsonb_array_elements_text(alternative_value->'missingEquipment')),
      array(select jsonb_array_elements_text(alternative_value->'alternativeEquipment')),
      alternative_value->>'patternCoverage',
      alternative_value->>'notePl',
      1
    )
    on conflict (program_day_slot_id, alternative_exercise_id) do update
    set missing_equipment = excluded.missing_equipment,
        alternative_equipment = excluded.alternative_equipment,
        pattern_coverage = excluded.pattern_coverage,
        note_pl = excluded.note_pl,
        updated_at = now();
  end loop;

  select count(*) into match_count
  from public.program_slot_alternatives alternative
  join public.program_day_slots slot on slot.id = alternative.program_day_slot_id
  join public.program_days day on day.id = slot.program_day_id
  join public.programs program on program.id = day.program_id
  where program.user_id is null and program.slug = 'intermediate-gym-fbw2';

  if match_count <> 14 then
    raise exception 'PLAN-C1: oczekiwano 14 alternatyw, znaleziono %.', match_count;
  end if;
end
$planc1_alt$;
