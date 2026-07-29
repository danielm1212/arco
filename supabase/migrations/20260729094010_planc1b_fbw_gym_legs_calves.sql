-- PLAN-C1B: dociążenie dolnej części ciała i łydki w P14 `intermediate-gym-fbw2`.
--
-- Wchodzi NA WIERZCH migracji 20260728213337 (recepta v2.1). Powód: policzone pokrycie
-- pokazało, że przy trzech dniach czworogłowe i pośladki miały po 6,0 serii tygodniowo,
-- a łydki 0. Przy warunku [Ty] „jedno ćwiczenie na nogi w dzień" jedynym ruchem, który
-- podnosi czworogłowe, dwugłowe i pośladki naraz, jest dołożenie serii do przysiadu i RDL.
--
-- Po zmianie (3 dni/tydz., liczenie frakcyjne): czworogłowe 7,5 · dwugłowe 11,3 ·
-- pośladki 7,5 · łydki 12,0. Sesje 52 i 58 min plus przygotowanie.
--
-- Niezmienniki: pozycyjna aktualizacja jak w `scripts/seed.ts`, zero usuwania slotów,
-- bramka otwartej sesji, brak zmian aktywnego programu i historii.

do $planc1b$
declare
  v_program_id uuid;
  v_day_id uuid;
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'PLAN-C1B: pomijam, baza referencyjna jest jeszcze pusta.';
    return;
  end if;

  select id into v_program_id
  from public.programs
  where slug = 'intermediate-gym-fbw2' and user_id is null;

  if v_program_id is null then
    raise notice 'PLAN-C1B: brak programu systemowego, pomijam.';
    return;
  end if;

  if exists (
    select 1 from public.sessions session
    join public.program_days day on day.id = session.program_day_id
    where session.finished_at is null and day.program_id = v_program_id
  ) then
    raise exception using errcode = '55000',
      message = 'PLAN-C1B wymaga zakończenia lub usunięcia otwartych sesji P14.';
  end if;

  if not exists (select 1 from public.exercises where id = 'Standing_Calf_Raises') then
    raise exception using errcode = '55000',
      message = 'PLAN-C1B: brak Standing_Calf_Raises w katalogu.';
  end if;

  -- ── Trening A: mocniejszy przysiad, core na końcu ──
  select id into strict v_day_id
  from public.program_days where program_id = v_program_id and label = 'Trening A';

  update public.program_day_slots set target_sets = 5
  where program_day_id = v_day_id and position = 0;

  update public.program_day_slots
  set default_exercise_id = 'Cable_Rope_Overhead_Triceps_Extension', target_sets = 2,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null,
      notes = 'Praca zza głowy rozciąga długą głowę tricepsa; w B pracujesz nad nią z góry.'
  where program_day_id = v_day_id and position = 5;

  update public.program_day_slots
  set default_exercise_id = 'Reverse_Crunch', target_sets = 2,
      target_reps_min = 10, target_reps_max = 20, rest_seconds = 60, superset_group = null,
      notes = 'Inicjuj ruch podwinięciem miednicy, bez rozpędu.'
  where program_day_id = v_day_id and position = 6;

  if (select sum(target_sets) from public.program_day_slots where program_day_id = v_day_id) <> 22 then
    raise exception 'PLAN-C1B: P14 Trening A musi mieć 22 serie.';
  end if;

  -- ── Trening B: mocniejszy RDL, łydki jako ósma pozycja, core na końcu ──
  select id into strict v_day_id
  from public.program_days where program_id = v_program_id and label = 'Trening B';

  update public.program_day_slots set target_sets = 5
  where program_day_id = v_day_id and position = 0;

  update public.program_day_slots
  set default_exercise_id = 'Hammer_Curls', target_sets = 2,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null,
      notes = 'Chwyt młotkowy dokłada ramienno-promieniowy, którego nie dostajesz z uginania na skosie w A.'
  where program_day_id = v_day_id and position = 5;

  update public.program_day_slots
  set default_exercise_id = 'Standing_Calf_Raises', target_sets = 3,
      target_reps_min = 10, target_reps_max = 15, rest_seconds = 60, superset_group = null,
      notes = 'Pełny zakres i krótka pauza u góry. Jedyna praca łydek w całym cyklu.'
  where program_day_id = v_day_id and position = 6;

  if not exists (
    select 1 from public.program_day_slots where program_day_id = v_day_id and position = 7
  ) then
    insert into public.program_day_slots (
      id, program_day_id, default_exercise_id, position, target_sets,
      target_reps_min, target_reps_max, rest_seconds, superset_group, notes
    ) values (
      md5('arco:system-program-slot:intermediate-gym-fbw2:1:7')::uuid,
      v_day_id, 'Hanging_Knee_Raise', 7, 2, 8, 15, 60, null, null
    );
  end if;

  update public.program_day_slots
  set default_exercise_id = 'Hanging_Knee_Raise', target_sets = 2,
      target_reps_min = 8, target_reps_max = 15, rest_seconds = 60, superset_group = null,
      notes = null
  where program_day_id = v_day_id and position = 7;

  if (
    select array_agg(default_exercise_id order by position)
    from public.program_day_slots where program_day_id = v_day_id
  ) is distinct from array[
    'Romanian_Deadlift','Barbell_Bench_Press_-_Medium_Grip','Chest-Supported_Dumbbell_Row',
    'Arnold_Dumbbell_Press','Triceps_Pushdown','Hammer_Curls','Standing_Calf_Raises',
    'Hanging_Knee_Raise'
  ]::text[] then
    raise exception 'PLAN-C1B: nieoczekiwany kształt P14 Trening B.';
  end if;

  if (select sum(target_sets) from public.program_day_slots where program_day_id = v_day_id) <> 25 then
    raise exception 'PLAN-C1B: P14 Trening B musi mieć 25 serii.';
  end if;

  update public.programs
  set required_equipment = array['barbell', 'dumbbell', 'cable', 'machine'],
      optional_equipment = array['body only'],
      estimated_minutes_min = 55,
      estimated_minutes_max = 70,
      description = 'Dwa treningi całego ciała na pełnym sprzęcie, z lekkim naciskiem na górę. Jedno duże ćwiczenie na dół w sesji, pełny push i pull, bezpośredni biceps i triceps. Plan projektowany na 3 dni w tygodniu — przy dwóch działa, ale rozwija wolniej. Zostaw 1 lub 2 powtórzenia w zapasie.',
      content_version = greatest(content_version, 5)
  where id = v_program_id;
end
$planc1b$;

-- ── Alternatywy sprzętowe (15) — pełny zestaw dla planu, upsert ──
do $planc1b_alt$
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
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Standing_Calf_Raises","alternativeExerciseId":"Calf_Raise_On_A_Dumbbell","missingEquipment":["machine"],"alternativeEquipment":["dumbbell"],"patternCoverage":"same_pattern","notePl":"Wspięcia bez maszyny; stań przodem stopy na podwyższeniu, żeby zachować pełny zakres."},
  {"programSlug":"intermediate-gym-fbw2","dayLabel":"Trening B","defaultExerciseId":"Hammer_Curls","alternativeExerciseId":"Cable_Hammer_Curls_-_Rope_Attachment","missingEquipment":["dumbbell"],"alternativeEquipment":["cable"],"patternCoverage":"same_pattern","notePl":"Chwyt młotkowy na lince; opór jest równiejszy, więc dobierz nieco mniejszy ciężar."}
]
$alternatives$::jsonb;
  alternative_value jsonb;
  slot_id_value uuid;
  next_position int;
  match_count int;
begin
  if not exists (select 1 from public.exercises) then return; end if;
  if not exists (
    select 1 from public.programs where slug = 'intermediate-gym-fbw2' and user_id is null
  ) then return; end if;

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
      raise exception 'PLAN-C1B: brak slotu % / % / %',
        alternative_value->>'programSlug', alternative_value->>'dayLabel',
        alternative_value->>'defaultExerciseId';
    end if;

    select coalesce(max(position) + 1, 0) into next_position
    from public.program_slot_alternatives
    where program_day_slot_id = slot_id_value
      and alternative_exercise_id is distinct from (alternative_value->>'alternativeExerciseId');

    insert into public.program_slot_alternatives (
      id, program_day_slot_id, alternative_exercise_id, position,
      missing_equipment, alternative_equipment, pattern_coverage, note_pl, content_version
    ) values (
      md5('arco:program-slot-alternative:' || slot_id_value::text || ':'
          || (alternative_value->>'alternativeExerciseId'))::uuid,
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

  -- Sloty zostały przepięte na inne ćwiczenia, więc alternatywy sprzed zmiany wiszą teraz przy
  -- niewłaściwym ruchu. Kasujemy wyłącznie osierocone wiersze tego jednego programu systemowego.
  delete from public.program_slot_alternatives alternative
  using public.program_day_slots slot,
        public.program_days day,
        public.programs program
  where alternative.program_day_slot_id = slot.id
    and slot.program_day_id = day.id
    and day.program_id = program.id
    and program.user_id is null
    and program.slug = 'intermediate-gym-fbw2'
    and not exists (
      select 1
      from jsonb_array_elements(alternatives_payload) as wanted
      where wanted->>'dayLabel' = day.label
        and wanted->>'defaultExerciseId' = slot.default_exercise_id
        and wanted->>'alternativeExerciseId' = alternative.alternative_exercise_id
    );

  select count(*) into match_count
  from public.program_slot_alternatives alternative
  join public.program_day_slots slot on slot.id = alternative.program_day_slot_id
  join public.program_days day on day.id = slot.program_day_id
  join public.programs program on program.id = day.program_id
  where program.user_id is null and program.slug = 'intermediate-gym-fbw2';

  if match_count <> 15 then
    raise exception 'PLAN-C1B: oczekiwano 15 alternatyw, znaleziono %.', match_count;
  end if;
end
$planc1b_alt$;
