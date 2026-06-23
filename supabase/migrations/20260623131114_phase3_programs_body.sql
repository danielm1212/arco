-- Arco Phase 3 — własne programy (luźniejszy zakres dni) + metryki ciała

-- Pozwól na 1..7 dni (własne programy, 4-dniowy Upper/Lower itp.)
alter table programs drop constraint if exists programs_days_per_week_check;
alter table programs add constraint programs_days_per_week_check
  check (days_per_week between 1 and 7);

-- Metryki ciała
create table body_metrics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null default current_date,
  weight     numeric,
  body_fat   numeric,
  notes      text,
  created_at timestamptz not null default now()
);
create index body_metrics_user_date_idx on body_metrics (user_id, date desc);

alter table body_metrics enable row level security;
create policy "body_metrics_own"
  on body_metrics for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on body_metrics to authenticated;
grant all on body_metrics to service_role;
