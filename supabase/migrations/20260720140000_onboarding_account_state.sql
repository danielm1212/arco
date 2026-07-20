-- F0.7.1 — ukończenie onboardingu jest stanem konta, nie liczbą treningów ani
-- flagą konkretnej przeglądarki. Dzięki temu usunięcie Historii i nowe urządzenie
-- nie mogą ponownie uruchomić pierwszego flow.
alter table public.user_settings
  add column onboarding_completed_at timestamptz;

comment on column public.user_settings.onboarding_completed_at is
  'Kiedy użytkownik ukończył lub świadomie pominął onboarding. Null oznacza nowe konto.';

-- Wszystkie istniejące ustawienia należą do kont utworzonych przed tym kontraktem.
-- Nie mamy wiarygodnego, serwerowego śladu starej flagi localStorage, więc zachowujemy
-- dotychczasowy stan tych kont zamiast niespodziewanie pokazywać im onboarding po deployu.
update public.user_settings
set onboarding_completed_at = coalesce(updated_at, created_at, now())
where onboarding_completed_at is null;
