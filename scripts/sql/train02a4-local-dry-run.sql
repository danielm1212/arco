\set ON_ERROR_STOP on

\echo 'TRAIN-02A4 dry-run: scenario 1/2 — rerun with an active target session'
begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '02a40000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'train02a4-dry-run@arco.local',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

do $fixture$
declare
  target_program_id uuid;
  target_day_id uuid;
  target_slot_id uuid;
  target_exercise_id text;
begin
  select program.id
  into strict target_program_id
  from public.programs as program
  where program.user_id is null
    and program.slug = 'beginner-home-fbw2';

  select day.id
  into strict target_day_id
  from public.program_days as day
  where day.program_id = target_program_id
    and day.position = 0;

  select slot.id, slot.default_exercise_id
  into strict target_slot_id, target_exercise_id
  from public.program_day_slots as slot
  where slot.program_day_id = target_day_id
    and slot.position = 0;

  insert into public.user_active_program (user_id, program_id)
  values ('02a40000-0000-4000-8000-000000000001', target_program_id);

  insert into public.sessions (
    id,
    user_id,
    program_day_id,
    date,
    started_at,
    finished_at,
    notes
  )
  values (
    '02a40000-0000-4000-8000-000000000002',
    '02a40000-0000-4000-8000-000000000001',
    target_day_id,
    current_date,
    now(),
    null,
    'TRAIN-02A4 local dry-run'
  );

  insert into public.session_exercises (
    id,
    session_id,
    slot_id,
    exercise_id,
    position
  )
  values (
    '02a40000-0000-4000-8000-000000000003',
    '02a40000-0000-4000-8000-000000000002',
    target_slot_id,
    target_exercise_id,
    0
  );

  insert into public.session_sets (
    id,
    session_exercise_id,
    set_index,
    set_type,
    completed
  )
  values (
    '02a40000-0000-4000-8000-000000000004',
    '02a40000-0000-4000-8000-000000000003',
    0,
    'working',
    false
  );

  insert into public.programs (
    id,
    slug,
    name,
    description,
    days_per_week,
    cycle_days,
    is_default,
    user_id
  )
  values (
    '02a40000-0000-4000-8000-000000000005',
    'beginner-home-fbw2',
    'Prywatny plan o takim samym slugu',
    'Fixture potwierdzający, że point sync nie dotyka programu użytkownika.',
    2,
    2,
    false,
    '02a40000-0000-4000-8000-000000000001'
  );

  insert into public.program_days (id, program_id, label, position)
  values (
    '02a40000-0000-4000-8000-000000000006',
    '02a40000-0000-4000-8000-000000000005',
    'Mój dzień',
    0
  );

  insert into public.program_day_slots (
    id,
    program_day_id,
    default_exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds
  )
  values (
    '02a40000-0000-4000-8000-000000000007',
    '02a40000-0000-4000-8000-000000000006',
    target_exercise_id,
    0,
    2,
    8,
    12,
    60
  );
end
$fixture$;

create temporary table train02a4_active_snapshot on commit drop as
select jsonb_build_object(
  'active_program',
  (
    select to_jsonb(active_program)
    from public.user_active_program as active_program
    where active_program.user_id = '02a40000-0000-4000-8000-000000000001'
  ),
  'session',
  (
    select to_jsonb(session)
    from public.sessions as session
    where session.id = '02a40000-0000-4000-8000-000000000002'
  ),
  'session_exercise',
  (
    select to_jsonb(session_exercise)
    from public.session_exercises as session_exercise
    where session_exercise.id = '02a40000-0000-4000-8000-000000000003'
  ),
  'session_set',
  (
    select to_jsonb(session_set)
    from public.session_sets as session_set
    where session_set.id = '02a40000-0000-4000-8000-000000000004'
  ),
  'custom_program',
  (
    select to_jsonb(program)
    from public.programs as program
    where program.id = '02a40000-0000-4000-8000-000000000005'
  ),
  'custom_day',
  (
    select to_jsonb(day)
    from public.program_days as day
    where day.id = '02a40000-0000-4000-8000-000000000006'
  ),
  'custom_slot',
  (
    select to_jsonb(slot)
    from public.program_day_slots as slot
    where slot.id = '02a40000-0000-4000-8000-000000000007'
  )
) as payload;

\ir ../../supabase/migrations/20260727134000_train02a4_required_exercises.sql
\ir ../../supabase/migrations/20260727134500_train02a4_missing_programs.sql
\ir ../../supabase/migrations/20260727134000_train02a4_required_exercises.sql
\ir ../../supabase/migrations/20260727134500_train02a4_missing_programs.sql

do $assertions$
declare
  before_payload jsonb;
  after_payload jsonb;
  target_programs integer;
  target_days integer;
  target_slots integer;
  target_alternatives integer;
begin
  select payload into strict before_payload from train02a4_active_snapshot;

  select jsonb_build_object(
    'active_program',
    (
      select to_jsonb(active_program)
      from public.user_active_program as active_program
      where active_program.user_id = '02a40000-0000-4000-8000-000000000001'
    ),
    'session',
    (
      select to_jsonb(session)
      from public.sessions as session
      where session.id = '02a40000-0000-4000-8000-000000000002'
    ),
    'session_exercise',
    (
      select to_jsonb(session_exercise)
      from public.session_exercises as session_exercise
      where session_exercise.id = '02a40000-0000-4000-8000-000000000003'
    ),
    'session_set',
    (
      select to_jsonb(session_set)
      from public.session_sets as session_set
      where session_set.id = '02a40000-0000-4000-8000-000000000004'
    ),
    'custom_program',
    (
      select to_jsonb(program)
      from public.programs as program
      where program.id = '02a40000-0000-4000-8000-000000000005'
    ),
    'custom_day',
    (
      select to_jsonb(day)
      from public.program_days as day
      where day.id = '02a40000-0000-4000-8000-000000000006'
    ),
    'custom_slot',
    (
      select to_jsonb(slot)
      from public.program_day_slots as slot
      where slot.id = '02a40000-0000-4000-8000-000000000007'
    )
  )
  into after_payload;

  if after_payload is distinct from before_payload then
    raise exception 'TRAIN-02A4 changed an active session or a user-owned program.';
  end if;

  select count(*)
  into target_programs
  from public.programs
  where user_id is null
    and slug in (
      'beginner-gym-fbw2',
      'beginner-home-fbw2',
      'intermediate-bodyweight-fbw3',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  select count(*), count(distinct day.id), count(slot.id), count(alternative.id)
  into target_programs, target_days, target_slots, target_alternatives
  from public.programs as program
  join public.program_days as day on day.program_id = program.id
  join public.program_day_slots as slot on slot.program_day_id = day.id
  left join public.program_slot_alternatives as alternative
    on alternative.program_day_slot_id = slot.id
  where program.user_id is null
    and program.slug in (
      'beginner-gym-fbw2',
      'beginner-home-fbw2',
      'intermediate-bodyweight-fbw3',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  if target_programs <> 99
    or target_days <> 15
    or target_slots <> 99
    or target_alternatives <> 29
  then
    raise exception 'TRAIN-02A4 scenario 1 cardinality mismatch: rows %, days %, slots %, alternatives %.',
      target_programs,
      target_days,
      target_slots,
      target_alternatives;
  end if;
end
$assertions$;

rollback;
\echo 'TRAIN-02A4 dry-run: scenario 1/2 passed'

\echo 'TRAIN-02A4 dry-run: scenario 2/2 — production-like 10/15 catalog'
begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '02a40000-0000-4000-8000-000000000011',
  'authenticated',
  'authenticated',
  'train02a4-production-shape@arco.local',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

do $fixture$
declare
  exercise_id_value text;
begin
  select id into strict exercise_id_value
  from public.exercises
  order by id
  limit 1;

  insert into public.programs (
    id,
    slug,
    name,
    description,
    days_per_week,
    cycle_days,
    is_default,
    user_id
  )
  values (
    '02a40000-0000-4000-8000-000000000012',
    'beginner-home-fbw2',
    'Prywatny plan zachowany przy pierwszym point syncu',
    'Fixture programu użytkownika istniejącego przed pierwszą publikacją pięciu presetów.',
    2,
    2,
    false,
    '02a40000-0000-4000-8000-000000000011'
  );

  insert into public.program_days (id, program_id, label, position)
  values (
    '02a40000-0000-4000-8000-000000000013',
    '02a40000-0000-4000-8000-000000000012',
    'Mój dzień',
    0
  );

  insert into public.program_day_slots (
    id,
    program_day_id,
    default_exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds
  )
  values (
    '02a40000-0000-4000-8000-000000000014',
    '02a40000-0000-4000-8000-000000000013',
    exercise_id_value,
    0,
    3,
    6,
    10,
    90
  );
end
$fixture$;

create temporary table train02a4_user_snapshot on commit drop as
select jsonb_build_object(
  'program',
  (
    select to_jsonb(program)
    from public.programs as program
    where program.id = '02a40000-0000-4000-8000-000000000012'
  ),
  'day',
  (
    select to_jsonb(day)
    from public.program_days as day
    where day.id = '02a40000-0000-4000-8000-000000000013'
  ),
  'slot',
  (
    select to_jsonb(slot)
    from public.program_day_slots as slot
    where slot.id = '02a40000-0000-4000-8000-000000000014'
  )
) as payload;

create temporary table train02a4_surviving_system_ids on commit drop as
select id, slug
from public.programs
where user_id is null
  and slug not in (
    'beginner-gym-fbw2',
    'beginner-home-fbw2',
    'intermediate-bodyweight-fbw3',
    'advanced-home-upper-lower4',
    'advanced-bodyweight-upper-lower4'
  );

update public.program_day_slots as slot
set default_exercise_id = (
  select exercise.id
  from public.exercises as exercise
  where exercise.id not in ('Band_Lat_Pulldown', 'Single_Leg_Calf_Raise')
  order by exercise.id
  limit 1
)
where slot.default_exercise_id in ('Band_Lat_Pulldown', 'Single_Leg_Calf_Raise')
  and exists (
    select 1
    from public.program_days as day
    join public.programs as program on program.id = day.program_id
    where day.id = slot.program_day_id
      and program.user_id is null
      and program.slug not in (
        'beginner-gym-fbw2',
        'beginner-home-fbw2',
        'intermediate-bodyweight-fbw3',
        'advanced-home-upper-lower4',
        'advanced-bodyweight-upper-lower4'
      )
  );

delete from public.programs
where user_id is null
  and slug in (
    'beginner-gym-fbw2',
    'beginner-home-fbw2',
    'intermediate-bodyweight-fbw3',
    'advanced-home-upper-lower4',
    'advanced-bodyweight-upper-lower4'
  );

delete from public.exercises
where user_id is null
  and id in ('Band_Lat_Pulldown', 'Single_Leg_Calf_Raise');

do $assertions$
begin
  if (select count(*) from public.programs where user_id is null) <> 10 then
    raise exception 'TRAIN-02A4 production-shape fixture did not reach 10 system programs.';
  end if;

  if exists (
    select 1
    from public.exercises
    where id in ('Band_Lat_Pulldown', 'Single_Leg_Calf_Raise')
  ) then
    raise exception 'TRAIN-02A4 production-shape fixture still contains required exercise rows.';
  end if;
end
$assertions$;

\ir ../../supabase/migrations/20260727134000_train02a4_required_exercises.sql
\ir ../../supabase/migrations/20260727134500_train02a4_missing_programs.sql
\ir ../../supabase/migrations/20260727134000_train02a4_required_exercises.sql
\ir ../../supabase/migrations/20260727134500_train02a4_missing_programs.sql

do $assertions$
declare
  before_payload jsonb;
  after_payload jsonb;
  target_days integer;
  target_slots integer;
  target_alternatives integer;
begin
  select payload into strict before_payload from train02a4_user_snapshot;
  select jsonb_build_object(
    'program',
    (
      select to_jsonb(program)
      from public.programs as program
      where program.id = '02a40000-0000-4000-8000-000000000012'
    ),
    'day',
    (
      select to_jsonb(day)
      from public.program_days as day
      where day.id = '02a40000-0000-4000-8000-000000000013'
    ),
    'slot',
    (
      select to_jsonb(slot)
      from public.program_day_slots as slot
      where slot.id = '02a40000-0000-4000-8000-000000000014'
    )
  )
  into after_payload;

  if after_payload is distinct from before_payload then
    raise exception 'TRAIN-02A4 changed a user-owned program during first point sync.';
  end if;

  if (select count(*) from public.programs where user_id is null) <> 15 then
    raise exception 'TRAIN-02A4 did not restore the 15-program system catalog.';
  end if;

  if (
    select count(*)
    from public.exercises
    where user_id is null
      and id in ('Band_Lat_Pulldown', 'Single_Leg_Calf_Raise')
      and (
        (id = 'Band_Lat_Pulldown' and movement_pattern = 'pull' and exercise_type = 'weighted')
        or (
          id = 'Single_Leg_Calf_Raise'
          and movement_pattern = 'squat'
          and exercise_type = 'bodyweight'
        )
      )
  ) <> 2 then
    raise exception 'TRAIN-02A4 did not restore both reviewed required exercise rows.';
  end if;

  if exists (
    select 1
    from train02a4_surviving_system_ids as before_program
    full join (
      select id, slug
      from public.programs
      where user_id is null
        and slug not in (
          'beginner-gym-fbw2',
          'beginner-home-fbw2',
          'intermediate-bodyweight-fbw3',
          'advanced-home-upper-lower4',
          'advanced-bodyweight-upper-lower4'
        )
    ) as after_program
      on after_program.id = before_program.id
      and after_program.slug = before_program.slug
    where before_program.id is null
      or after_program.id is null
  ) then
    raise exception 'TRAIN-02A4 changed an ID of one of the existing 10 system programs.';
  end if;

  if (
    select id
    from public.programs
    where user_id is null
      and slug = 'beginner-gym-fbw2'
  ) <> md5('arco:system-program:beginner-gym-fbw2')::uuid then
    raise exception 'TRAIN-02A4 did not use the deterministic program ID.';
  end if;

  select count(distinct day.id), count(slot.id), count(alternative.id)
  into target_days, target_slots, target_alternatives
  from public.programs as program
  join public.program_days as day on day.program_id = program.id
  join public.program_day_slots as slot on slot.program_day_id = day.id
  left join public.program_slot_alternatives as alternative
    on alternative.program_day_slot_id = slot.id
  where program.user_id is null
    and program.slug in (
      'beginner-gym-fbw2',
      'beginner-home-fbw2',
      'intermediate-bodyweight-fbw3',
      'advanced-home-upper-lower4',
      'advanced-bodyweight-upper-lower4'
    );

  if target_days <> 15
    or target_slots <> 99
    or target_alternatives <> 29
  then
    raise exception 'TRAIN-02A4 scenario 2 cardinality mismatch: days %, slots %, alternatives %.',
      target_days,
      target_slots,
      target_alternatives;
  end if;
end
$assertions$;

rollback;
\echo 'TRAIN-02A4 dry-run: scenario 2/2 passed'

\echo 'TRAIN-02A4 dry-run: RLS — system visibility and account isolation'
begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '02a40000-0000-4000-8000-000000000021',
    'authenticated',
    'authenticated',
    'train02a4-rls-a@arco.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '02a40000-0000-4000-8000-000000000022',
    'authenticated',
    'authenticated',
    'train02a4-rls-b@arco.local',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

do $fixture$
declare
  default_exercise_id_value text;
begin
  select id
  into strict default_exercise_id_value
  from public.exercises
  order by id
  limit 1;

  insert into public.programs (
    id,
    slug,
    name,
    days_per_week,
    cycle_days,
    is_default,
    user_id
  )
  values (
    '02a40000-0000-4000-8000-000000000023',
    'train02a4-rls-user-program',
    'TRAIN-02A4 RLS fixture',
    2,
    2,
    false,
    '02a40000-0000-4000-8000-000000000021'
  );

  insert into public.program_days (id, program_id, label, position)
  values (
    '02a40000-0000-4000-8000-000000000024',
    '02a40000-0000-4000-8000-000000000023',
    'RLS',
    0
  );

  insert into public.program_day_slots (
    id,
    program_day_id,
    default_exercise_id,
    position,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds
  )
  values (
    '02a40000-0000-4000-8000-000000000025',
    '02a40000-0000-4000-8000-000000000024',
    default_exercise_id_value,
    0,
    2,
    8,
    12,
    60
  );
end
$fixture$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '02a40000-0000-4000-8000-000000000021',
  true
);

insert into public.program_slot_alternatives (
  id,
  program_day_slot_id,
  alternative_exercise_id,
  position,
  missing_equipment,
  alternative_equipment,
  pattern_coverage,
  note_pl
)
select
  '02a40000-0000-4000-8000-000000000026',
  '02a40000-0000-4000-8000-000000000025',
  exercise.id,
  0,
  array['fixture equipment'],
  array['body only'],
  'partial_pattern',
  'Testowa alternatywa prywatnego programu widoczna tylko właścicielowi.'
from public.exercises as exercise
where exercise.id <> (
  select default_exercise_id
  from public.program_day_slots
  where id = '02a40000-0000-4000-8000-000000000025'
)
order by exercise.id
limit 1;

do $assertions$
begin
  if (
    select count(*)
    from public.program_slot_alternatives
    where id = '02a40000-0000-4000-8000-000000000026'
  ) <> 1 then
    raise exception 'TRAIN-02A4 RLS owner cannot read the owned alternative.';
  end if;

  if (select count(*) from public.program_slot_alternatives) <> 30 then
    raise exception 'TRAIN-02A4 RLS owner should see 29 system alternatives and one owned alternative.';
  end if;
end
$assertions$;

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '02a40000-0000-4000-8000-000000000022',
  true
);

do $assertions$
begin
  if (
    select count(*)
    from public.program_slot_alternatives
    where id = '02a40000-0000-4000-8000-000000000026'
  ) <> 0 then
    raise exception 'TRAIN-02A4 RLS leaked an owned alternative to another account.';
  end if;

  if (select count(*) from public.program_slot_alternatives) <> 29 then
    raise exception 'TRAIN-02A4 RLS account B should see only 29 system alternatives.';
  end if;

  begin
    insert into public.program_slot_alternatives (
      id,
      program_day_slot_id,
      alternative_exercise_id,
      position,
      missing_equipment,
      alternative_equipment,
      pattern_coverage,
      note_pl
    )
    select
      '02a40000-0000-4000-8000-000000000027',
      '02a40000-0000-4000-8000-000000000025',
      exercise.id,
      1,
      array['fixture equipment'],
      array['body only'],
      'partial_pattern',
      'To konto nie może zapisać alternatywy w cudzym prywatnym programie.'
    from public.exercises as exercise
    order by exercise.id desc
    limit 1;

    raise exception 'TRAIN-02A4 RLS allowed account B to write into account A program.';
  exception
    when insufficient_privilege then
      null;
  end;
end
$assertions$;

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '02a40000-0000-4000-8000-000000000021',
  true
);

do $assertions$
begin
  begin
    insert into public.program_slot_alternatives (
      id,
      program_day_slot_id,
      alternative_exercise_id,
      position,
      missing_equipment,
      alternative_equipment,
      pattern_coverage,
      note_pl
    )
    select
      '02a40000-0000-4000-8000-000000000028',
      slot.id,
      exercise.id,
      1,
      array['fixture equipment'],
      array['body only'],
      'partial_pattern',
      'Zwykły użytkownik nie może dopisywać alternatyw do programu systemowego.'
    from public.program_day_slots as slot
    join public.program_days as day on day.id = slot.program_day_id
    join public.programs as program on program.id = day.program_id
    cross join lateral (
      select id
      from public.exercises
      where id <> slot.default_exercise_id
      order by id desc
      limit 1
    ) as exercise
    where program.user_id is null
      and program.slug = 'beginner-gym-fbw2'
    order by day.position, slot.position
    limit 1;

    raise exception 'TRAIN-02A4 RLS allowed a client write into a system program.';
  exception
    when insufficient_privilege then
      null;
  end;
end
$assertions$;

reset role;
rollback;
\echo 'TRAIN-02A4 dry-run: RLS passed'
