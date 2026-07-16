-- Kierunek planu jest osobny od celu treningowego (siła/masa/redukcja).
create type program_focus as enum ('balanced', 'lower_body');

alter table public.programs
  add column focus_key program_focus not null default 'balanced';

alter table public.user_settings
  add column training_focus program_focus not null default 'balanced';

create index programs_focus_recommendation_idx
  on public.programs (focus_key, environment, level_min, level_max, frequency_min, frequency_max)
  where user_id is null;
