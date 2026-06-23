-- Arco — RLS (brief: RLS po user_id na wszystkich tabelach z danymi usera)
-- Seed (exercises, programs z user_id=null) jest read-only dla zalogowanych.
-- Seed/bootstrap jadą jako service_role (bypass RLS).

alter table user_settings        enable row level security;
alter table exercises            enable row level security;
alter table programs             enable row level security;
alter table program_days         enable row level security;
alter table program_day_slots    enable row level security;
alter table user_active_program  enable row level security;
alter table sessions             enable row level security;
alter table session_exercises    enable row level security;
alter table session_sets         enable row level security;
alter table personal_records     enable row level security;

-- ── exercises: read-only katalog dla zalogowanych ────────────────────────────
create policy "exercises_select_authenticated"
  on exercises for select to authenticated
  using (true);

-- ── programs: seed (user_id null) + własne; zapis tylko własne ────────────────
create policy "programs_select"
  on programs for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "programs_insert_own"
  on programs for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "programs_update_own"
  on programs for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "programs_delete_own"
  on programs for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── program_days: widoczne gdy program widoczny; zapis gdy program własny ─────
create policy "program_days_select"
  on program_days for select to authenticated
  using (exists (
    select 1 from programs p
    where p.id = program_id and (p.user_id is null or p.user_id = (select auth.uid()))
  ));

create policy "program_days_write_own"
  on program_days for all to authenticated
  using (exists (
    select 1 from programs p where p.id = program_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from programs p where p.id = program_id and p.user_id = (select auth.uid())
  ));

-- ── program_day_slots: przez łańcuch program_days → programs ──────────────────
create policy "program_day_slots_select"
  on program_day_slots for select to authenticated
  using (exists (
    select 1 from program_days d
    join programs p on p.id = d.program_id
    where d.id = program_day_id and (p.user_id is null or p.user_id = (select auth.uid()))
  ));

create policy "program_day_slots_write_own"
  on program_day_slots for all to authenticated
  using (exists (
    select 1 from program_days d
    join programs p on p.id = d.program_id
    where d.id = program_day_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from program_days d
    join programs p on p.id = d.program_id
    where d.id = program_day_id and p.user_id = (select auth.uid())
  ));

-- ── user_settings ─────────────────────────────────────────────────────────────
create policy "user_settings_own"
  on user_settings for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── user_active_program ──────────────────────────────────────────────────────
create policy "user_active_program_own"
  on user_active_program for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── sessions ─────────────────────────────────────────────────────────────────
create policy "sessions_own"
  on sessions for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── session_exercises: przez sessions ─────────────────────────────────────────
create policy "session_exercises_own"
  on session_exercises for all to authenticated
  using (exists (
    select 1 from sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ));

-- ── session_sets: przez session_exercises → sessions ──────────────────────────
create policy "session_sets_own"
  on session_sets for all to authenticated
  using (exists (
    select 1 from session_exercises se
    join sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from session_exercises se
    join sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = (select auth.uid())
  ));

-- ── personal_records ─────────────────────────────────────────────────────────
create policy "personal_records_own"
  on personal_records for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
