-- Zaległy trening ma własną, jawną semantykę: data i czas trwania odnoszą się
-- do realnego treningu, a nie do chwili, w której użytkownik go wpisuje.
alter table sessions
  add column is_historical boolean not null default false,
  add column recorded_duration_seconds integer;

alter table sessions
  add constraint sessions_recorded_duration_seconds_check
  check (
    recorded_duration_seconds is null
    or recorded_duration_seconds between 60 and 28800
  );

comment on column sessions.is_historical is
  'True, gdy trening został dodany po fakcie przez ścieżkę historii.';
comment on column sessions.recorded_duration_seconds is
  'Czas realnego treningu podany przy dodawaniu po fakcie.';
