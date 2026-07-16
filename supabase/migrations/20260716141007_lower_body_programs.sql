-- Dwa kuratorowane programy z naciskiem na dolne ciało.
-- Dane są zgodne z scripts/seed.ts; migracja pozwala wdrożyć je bez service role.

insert into public.programs (
  id, slug, name, description, goal, goal_key, focus_key, level,
  environment, level_min, level_max, frequency_min, frequency_max,
  cycle_days, estimated_minutes_min, estimated_minutes_max,
  required_equipment, optional_equipment, content_version,
  days_per_week, is_default, user_id
)
values
  (
    '66ee7bf0-0000-4000-8000-000000000001',
    'lower-body-gym3',
    'Beginner–Intermediate · Siłownia · Pośladki i nogi · cykl 3 dni',
    'Trzy różne treningi z większym naciskiem na pośladki, uda i tył nóg. Góra ciała nadal dostaje regularny bodziec, dzięki czemu plan pozostaje kompletny. Wykonuj cykl A → B → C dwa lub trzy razy w tygodniu.',
    'Nacisk: pośladki i nogi', 'hypertrophy', 'lower_body',
    'początkujący–średniozaawansowany', 'gym', 1, 2, 2, 3, 3, 45, 60,
    array['barbell','dumbbell','cable','machine']::text[],
    array['body only']::text[], 1, 3, true, null
  ),
  (
    '66ee7bf0-0000-4000-8000-000000000002',
    'lower-body-home3',
    'Beginner–Intermediate · Dom z hantlami · Pośladki i nogi · cykl 3 dni',
    'Domowy cykl z większym naciskiem na pośladki i nogi, oparty na hantlach oraz ćwiczeniach jednostronnych. Góra ciała pozostaje w planie w mniejszej dawce. Wykonuj A → B → C dwa lub trzy razy w tygodniu.',
    'Nacisk: pośladki i nogi', 'hypertrophy', 'lower_body',
    'początkujący–średniozaawansowany', 'home', 1, 2, 2, 3, 3, 40, 55,
    array['dumbbell']::text[],
    array['kettlebells','body only','other']::text[], 1, 3, true, null
  )
on conflict do nothing;

insert into public.program_days (id, program_id, label, position)
select v.id::uuid, p.id, v.label, v.position
from (values
  ('66ee7bf0-0000-4000-8000-000000000101', 'lower-body-gym3',  'Dół A · siła',       0),
  ('66ee7bf0-0000-4000-8000-000000000102', 'lower-body-gym3',  'Góra + pośladki',    1),
  ('66ee7bf0-0000-4000-8000-000000000103', 'lower-body-gym3',  'Dół B · objętość',   2),
  ('66ee7bf0-0000-4000-8000-000000000201', 'lower-body-home3', 'Dół A · siła',       0),
  ('66ee7bf0-0000-4000-8000-000000000202', 'lower-body-home3', 'Góra + pośladki',    1),
  ('66ee7bf0-0000-4000-8000-000000000203', 'lower-body-home3', 'Dół B · objętość',   2)
) as v(id, slug, label, position)
join public.programs p on p.slug = v.slug and p.user_id is null
where not exists (
  select 1 from public.program_days d
  where d.program_id = p.id and d.position = v.position
);

insert into public.program_day_slots (
  program_day_id, default_exercise_id, position, target_sets,
  target_reps_min, target_reps_max, rest_seconds, notes
)
select d.id, v.exercise_id, v.slot_position, v.sets, v.reps_min, v.reps_max, v.rest_seconds, v.notes
from (values
  ('lower-body-gym3', 0, 0, 'Barbell_Hip_Thrust',              3,  6, 10, 150, null),
  ('lower-body-gym3', 0, 1, 'Barbell_Squat',                   3,  6, 10, 150, null),
  ('lower-body-gym3', 0, 2, 'Romanian_Deadlift',               2,  8, 12, 120, null),
  ('lower-body-gym3', 0, 3, 'Wide-Grip_Lat_Pulldown',          3,  8, 12, 120, null),
  ('lower-body-gym3', 0, 4, 'Dumbbell_Bench_Press',            3,  8, 12, 120, null),
  ('lower-body-gym3', 0, 5, 'Standing_Calf_Raises',            2, 12, 20,  60, null),
  ('lower-body-gym3', 1, 0, 'Dumbbell_Rear_Lunge',             3,  8, 12, 120, 'na nogę'),
  ('lower-body-gym3', 1, 1, 'Thigh_Abductor',                  2, 12, 20,  75, null),
  ('lower-body-gym3', 1, 2, 'Seated_Cable_Rows',               3,  8, 12, 120, null),
  ('lower-body-gym3', 1, 3, 'Incline_Dumbbell_Press',          3,  8, 12, 120, null),
  ('lower-body-gym3', 1, 4, 'Seated_Dumbbell_Press',           2,  8, 12,  90, null),
  ('lower-body-gym3', 1, 5, 'One-Legged_Cable_Kickback',       2, 12, 20,  75, 'na nogę; zatrzymaj ruch na górze'),
  ('lower-body-gym3', 2, 0, 'Leg_Press',                       3, 10, 15, 120, null),
  ('lower-body-gym3', 2, 1, 'Barbell_Hip_Thrust',              3,  8, 12, 120, null),
  ('lower-body-gym3', 2, 2, 'Lying_Leg_Curls',                 3, 10, 15,  90, null),
  ('lower-body-gym3', 2, 3, 'Bulgarian_Split_Squat',           2,  8, 12, 120, 'na nogę'),
  ('lower-body-gym3', 2, 4, 'Wide-Grip_Lat_Pulldown',          2, 10, 15,  90, null),
  ('lower-body-gym3', 2, 5, 'Dumbbell_Bench_Press',            2, 10, 15,  90, null),
  ('lower-body-home3', 0, 0, 'Dumbbell_Hip_Thrust',            3,  8, 12, 120, 'bez ławki: glute bridge z hantlem'),
  ('lower-body-home3', 0, 1, 'Goblet_Squat',                   3,  8, 12, 120, 'możesz trzymać jeden hantel przy klatce'),
  ('lower-body-home3', 0, 2, 'Stiff-Legged_Dumbbell_Deadlift', 2,  8, 12, 120, null),
  ('lower-body-home3', 0, 3, 'One-Arm_Dumbbell_Row',           3,  8, 12, 120, 'na rękę'),
  ('lower-body-home3', 0, 4, 'Dumbbell_Bench_Press',           3,  8, 12, 120, 'bez ławki: wyciskanie hantli na podłodze'),
  ('lower-body-home3', 0, 5, 'Calf_Raise_On_A_Dumbbell',       2, 12, 20,  60, null),
  ('lower-body-home3', 1, 0, 'Bulgarian_Split_Squat',          3,  8, 12, 120, 'na nogę'),
  ('lower-body-home3', 1, 1, 'Glute_Kickback',                 2, 12, 20,  60, 'na nogę; zatrzymaj ruch na górze'),
  ('lower-body-home3', 1, 2, 'Bent_Over_Two-Dumbbell_Row',     3,  8, 12, 120, null),
  ('lower-body-home3', 1, 3, 'Incline_Dumbbell_Press',         2,  8, 12,  90, 'bez ławki: wyciskanie hantli na podłodze'),
  ('lower-body-home3', 1, 4, 'Seated_Dumbbell_Press',          2,  8, 12,  90, null),
  ('lower-body-home3', 1, 5, 'Dead_Bug',                       2,  8, 12,  45, 'na stronę'),
  ('lower-body-home3', 2, 0, 'Dumbbell_Rear_Lunge',            3,  8, 12, 120, 'na nogę'),
  ('lower-body-home3', 2, 1, 'Dumbbell_Hip_Thrust',            3, 10, 15, 120, 'bez ławki: glute bridge z hantlem'),
  ('lower-body-home3', 2, 2, 'Stiff-Legged_Dumbbell_Deadlift', 3, 10, 15, 120, null),
  ('lower-body-home3', 2, 3, 'One-Arm_Dumbbell_Row',           3, 10, 15,  90, 'na rękę'),
  ('lower-body-home3', 2, 4, 'Dumbbell_Bench_Press',           2, 10, 15,  90, 'bez ławki: wyciskanie hantli na podłodze'),
  ('lower-body-home3', 2, 5, 'Calf_Raise_On_A_Dumbbell',       2, 15, 20,  60, null)
) as v(slug, day_position, slot_position, exercise_id, sets, reps_min, reps_max, rest_seconds, notes)
join public.programs p on p.slug = v.slug and p.user_id is null
join public.program_days d on d.program_id = p.id and d.position = v.day_position
where not exists (
  select 1 from public.program_day_slots s
  where s.program_day_id = d.id and s.position = v.slot_position
);
