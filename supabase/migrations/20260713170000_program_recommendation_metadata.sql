-- Sprint P2: program cycle metadata and deterministic onboarding recommendations.
-- `days_per_week` remains as a legacy compatibility field. New UI and scoring use
-- `cycle_days` for program structure and `frequency_min/max` for recommendation fit.

alter table public.programs
  add column if not exists slug text,
  add column if not exists environment text,
  add column if not exists goal_key text,
  add column if not exists level_min smallint,
  add column if not exists level_max smallint,
  add column if not exists frequency_min smallint,
  add column if not exists frequency_max smallint,
  add column if not exists cycle_days smallint,
  add column if not exists estimated_minutes_min smallint,
  add column if not exists estimated_minutes_max smallint,
  add column if not exists required_equipment text[] not null default '{}',
  add column if not exists optional_equipment text[] not null default '{}',
  add column if not exists content_version integer not null default 1;

update public.programs
set cycle_days = days_per_week
where cycle_days is null;

update public.programs
set
  slug = v.slug,
  environment = v.environment,
  goal_key = v.goal_key,
  level_min = v.level_min,
  level_max = v.level_max,
  frequency_min = v.frequency_min,
  frequency_max = v.frequency_max,
  estimated_minutes_min = v.minutes_min,
  estimated_minutes_max = v.minutes_max,
  required_equipment = v.required_equipment,
  optional_equipment = v.optional_equipment,
  content_version = 2
from (values
  ('Beginner · Siłownia · Full Body 3×', 'beginner-gym-fbw3', 'gym', 'strength_hypertrophy', 1, 1, 2, 3, 45, 60, array['barbell','dumbbell','cable','machine']::text[], array['body only']::text[]),
  ('Beginner · Dom z hantlami · Full Body 3×', 'beginner-home-fbw3', 'home', 'strength_hypertrophy', 1, 1, 2, 3, 40, 55, array['dumbbell']::text[], array['bands','body only','other']::text[]),
  ('Beginner · Masa ciała · Full Body 3×', 'beginner-bodyweight-fbw3', 'bodyweight', 'foundation', 1, 1, 2, 3, 35, 50, array['body only']::text[], array['other']::text[]),
  ('Intermediate · Siłownia · Upper / Lower 4×', 'intermediate-gym-upper-lower4', 'gym', 'strength_hypertrophy', 2, 2, 4, 4, 50, 70, array['barbell','dumbbell','cable','machine']::text[], array['body only']::text[]),
  ('Intermediate · Dom z hantlami · Upper / Lower 4×', 'intermediate-home-upper-lower4', 'home', 'hypertrophy', 2, 2, 4, 4, 45, 65, array['dumbbell']::text[], array['body only','other']::text[]),
  ('Advanced · Siłownia · Push / Pull / Legs 6×', 'advanced-gym-ppl6', 'gym', 'hypertrophy', 3, 3, 6, 6, 55, 75, array['barbell','dumbbell','cable','machine']::text[], array['body only']::text[]),
  ('Intermediate · Siłownia · FBW 2×', 'intermediate-gym-fbw2', 'gym', 'strength_hypertrophy', 2, 2, 2, 3, 50, 65, array['barbell','dumbbell','cable','machine']::text[], array['body only']::text[]),
  ('Intermediate · Dom z hantlami · FBW 2×', 'intermediate-home-fbw2', 'home', 'strength_hypertrophy', 2, 2, 2, 3, 45, 60, array['dumbbell']::text[], array['kettlebells','body only']::text[])
) as v(name, slug, environment, goal_key, level_min, level_max, frequency_min, frequency_max, minutes_min, minutes_max, required_equipment, optional_equipment)
where programs.user_id is null
  and programs.name = v.name;

alter table public.programs
  alter column cycle_days set not null,
  alter column cycle_days set default 1;

alter table public.programs
  add constraint programs_environment_check
    check (environment is null or environment in ('gym', 'home', 'bodyweight')),
  add constraint programs_level_range_check
    check (level_min is null or level_max is null or (level_min between 1 and 3 and level_max between level_min and 3)),
  add constraint programs_frequency_range_check
    check (frequency_min is null or frequency_max is null or (frequency_min between 1 and 7 and frequency_max between frequency_min and 7)),
  add constraint programs_cycle_days_check
    check (cycle_days between 1 and 7),
  add constraint programs_estimated_minutes_check
    check (estimated_minutes_min is null or estimated_minutes_max is null or (estimated_minutes_min > 0 and estimated_minutes_max >= estimated_minutes_min)),
  add constraint programs_content_version_check
    check (content_version >= 1);

create unique index if not exists programs_system_slug_unique
  on public.programs (slug)
  where user_id is null and slug is not null;

create index if not exists programs_recommendation_lookup_idx
  on public.programs (environment, level_min, level_max, frequency_min, frequency_max)
  where user_id is null;

comment on column public.programs.cycle_days is 'Number of distinct workout days in the program cycle; not a weekly prescription.';
comment on column public.programs.frequency_min is 'Lowest recommended weekly training frequency.';
comment on column public.programs.frequency_max is 'Highest recommended weekly training frequency.';
comment on column public.programs.content_version is 'Version of the curated system program content and metadata.';
