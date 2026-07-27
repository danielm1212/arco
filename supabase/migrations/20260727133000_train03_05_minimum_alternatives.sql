-- TRAIN-03/05 (minimal contract required by TRAIN-02A4)
--
-- Stores explicit, versioned alternatives for a concrete program slot. This is
-- additive: legacy programs and slots keep working without alternatives.

create table public.program_slot_alternatives (
  id                      uuid primary key default gen_random_uuid(),
  program_day_slot_id     uuid not null
    references public.program_day_slots (id) on delete cascade,
  alternative_exercise_id text not null
    references public.exercises (id),
  position                smallint not null default 0
    check (position >= 0),
  missing_equipment       text[] not null
    check (cardinality(missing_equipment) > 0),
  alternative_equipment   text[] not null
    check (cardinality(alternative_equipment) > 0),
  pattern_coverage        text not null
    check (pattern_coverage in ('same_pattern', 'partial_pattern')),
  note_pl                 text not null
    check (char_length(btrim(note_pl)) >= 20),
  content_version         integer not null default 1
    check (content_version >= 1),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (program_day_slot_id, alternative_exercise_id),
  unique (program_day_slot_id, position)
);

create index program_slot_alternatives_slot_idx
  on public.program_slot_alternatives (program_day_slot_id);

create index program_slot_alternatives_exercise_idx
  on public.program_slot_alternatives (alternative_exercise_id);

alter table public.program_slot_alternatives enable row level security;

create policy "program_slot_alternatives_select"
  on public.program_slot_alternatives
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.program_day_slots as slot
      join public.program_days as day on day.id = slot.program_day_id
      join public.programs as program on program.id = day.program_id
      where slot.id = program_day_slot_id
        and (
          program.user_id is null
          or program.user_id = (select auth.uid())
        )
    )
  );

create policy "program_slot_alternatives_write_own"
  on public.program_slot_alternatives
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.program_day_slots as slot
      join public.program_days as day on day.id = slot.program_day_id
      join public.programs as program on program.id = day.program_id
      where slot.id = program_day_slot_id
        and program.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.program_day_slots as slot
      join public.program_days as day on day.id = slot.program_day_id
      join public.programs as program on program.id = day.program_id
      where slot.id = program_day_slot_id
        and program.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete
  on public.program_slot_alternatives
  to authenticated;

grant all
  on public.program_slot_alternatives
  to service_role;

comment on table public.program_slot_alternatives is
  'Versioned exercise alternatives for a concrete program slot; additive TRAIN-03/05 contract.';

comment on column public.program_slot_alternatives.missing_equipment is
  'Canonical equipment whose absence activates this alternative path.';

comment on column public.program_slot_alternatives.alternative_equipment is
  'Canonical equipment required to execute the alternative exercise.';

comment on column public.program_slot_alternatives.pattern_coverage is
  'Whether the alternative preserves the movement pattern fully or only partially.';
