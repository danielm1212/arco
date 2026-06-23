-- Arco — schema Phase 0 (brief sekcja 3)
-- Uwaga: kolumny porządkujące nazwane `position` (brief: `order`), bo `order` to słowo zarezerwowane.

-- ── Enumy ──────────────────────────────────────────────────────────────────
create type unit_system as enum ('kg', 'lbs');
create type mechanic_type as enum ('compound', 'isolation');
create type movement_pattern as enum ('push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'core');
create type exercise_type as enum ('weighted', 'bodyweight', 'timed');
create type set_type as enum ('warmup', 'working', 'drop');
create type record_type as enum ('max_weight', 'max_e1rm', 'max_reps', 'max_duration');

-- ── user_settings ────────────────────────────────────────────────────────────
create table user_settings (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  unit_system          unit_system not null default 'kg',
  default_rest_seconds integer     not null default 120,
  bar_weight           numeric     not null default 20,
  available_plates     numeric[]   not null default '{25,20,15,10,5,2.5,1.25}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── exercises (seed z free-exercise-db; id = string slug datasetu) ────────────
create table exercises (
  id                text primary key,
  name              text not null,
  force             text,
  level             text,
  mechanic          mechanic_type,
  equipment         text,
  primary_muscles   text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  category          text,
  instructions      text[] not null default '{}',
  images            text[] not null default '{}',
  movement_pattern  movement_pattern,         -- heurystyka; kluczowe compoundy nadpisane w seedzie
  exercise_type     exercise_type not null    -- steruje loggerem i progresem
);

create index exercises_movement_pattern_idx on exercises (movement_pattern);
create index exercises_equipment_idx        on exercises (equipment);
create index exercises_type_idx             on exercises (exercise_type);
create index exercises_primary_muscles_idx  on exercises using gin (primary_muscles);

-- ── programs ─────────────────────────────────────────────────────────────────
create table programs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  days_per_week integer not null check (days_per_week in (2, 3)),
  is_default    boolean not null default false,
  user_id       uuid references auth.users (id) on delete cascade  -- null = seed systemowy
);

create index programs_user_id_idx on programs (user_id);

create table program_days (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  label      text not null,
  position   integer not null
);

create index program_days_program_id_idx on program_days (program_id);

create table program_day_slots (
  id                  uuid primary key default gen_random_uuid(),
  program_day_id      uuid not null references program_days (id) on delete cascade,
  default_exercise_id text not null references exercises (id),
  position            integer not null,
  target_sets         integer not null,
  target_reps_min     integer,           -- null = AMRAP / czas
  target_reps_max     integer,
  rest_seconds        integer not null,
  superset_group      smallint,          -- null = brak supersetu
  notes               text
);

create index program_day_slots_day_idx on program_day_slots (program_day_id);

-- ── user_active_program ──────────────────────────────────────────────────────
create table user_active_program (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  program_id uuid not null references programs (id) on delete cascade
);

-- ── sessions ─────────────────────────────────────────────────────────────────
create table sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  program_day_id uuid references program_days (id) on delete set null,  -- null = freestyle
  date           date not null default current_date,
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  notes          text
);

create index sessions_user_date_idx on sessions (user_id, date desc);

create table session_exercises (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions (id) on delete cascade,
  slot_id        uuid references program_day_slots (id) on delete set null,  -- ref slotu (progres slotu)
  exercise_id    text not null references exercises (id),                    -- faktycznie wykonane
  position       integer not null,
  superset_group smallint
);

create index session_exercises_session_idx  on session_exercises (session_id);
create index session_exercises_exercise_idx on session_exercises (exercise_id);

create table session_sets (
  id                  uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references session_exercises (id) on delete cascade,
  set_index           integer not null,
  set_type            set_type not null default 'working',
  weight              numeric,
  reps                integer,
  duration_seconds    integer,
  added_weight        numeric,          -- bodyweight + obciążenie
  rpe                 numeric(3, 1),
  completed           boolean not null default false
);

create index session_sets_session_exercise_idx on session_sets (session_exercise_id);

-- ── personal_records (przeliczane, nie bool na secie) ────────────────────────
create table personal_records (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  exercise_id    text not null references exercises (id),
  record_type    record_type not null,
  value          numeric not null,
  reps_context   integer,
  achieved_at    timestamptz not null default now(),
  session_set_id uuid references session_sets (id) on delete set null
);

create index personal_records_lookup_idx on personal_records (user_id, exercise_id, record_type);

-- ── Granty (dostęp ról; RLS rządzi dostępem do wierszy) ──────────────────────
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
