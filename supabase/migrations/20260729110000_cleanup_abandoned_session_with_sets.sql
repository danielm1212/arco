-- CLEANUP 2: usunięcie porzuconej sesji z 2026-07-19, która MA zapisane serie.
--
-- Kontekst i uczciwe wyjaśnienie, dlaczego istnieje druga migracja sprzątająca:
-- pierwsza (20260728000000) celowo odmawiała usunięcia sesji z jakąkolwiek zapisaną serią.
-- Raportowałem właścicielowi, że ta sesja jest pusta — to była pomyłka wynikająca z błędu
-- w moim skrypcie sprawdzającym (szukał w `session_sets` kolumny `session_id`, której ta
-- tabela nie ma; wiąże się przez `session_exercise_id`). Sesja ma 26 serii, 10 zaliczonych.
-- Warunek bezpieczeństwa w tamtej migracji zadziałał i zatrzymał usunięcie.
--
-- Właściciel, znając już prawdziwe liczby, polecił usunięcie 2026-07-29. Serie pochodzą
-- sprzed DATA-01 (24 lipca) i nie mają zapisanego ciężaru ani powtórzeń.
--
-- Ta migracja świadomie pomija warunek „zero serii", więc w zamian pilnuje ZGODNOŚCI ZE STANEM,
-- na podstawie którego decyzja została podjęta:
-- - dokładnie to jedno ID,
-- - sesja nadal niezakończona,
-- - nadal dokładnie 26 serii.
-- Jeżeli którykolwiek warunek się nie zgadza — bo sesja została w międzyczasie dokończona,
-- usunięta ręcznie albo ktoś w niej cokolwiek zmienił — DELETE nie rusza nic. Dzięki temu
-- migracja jest idempotentna i jest no-opem na świeżej bazie oraz w CI.
--
-- Timestamp mieści się między ostatnią zastosowaną na produkcji (20260729102750) a bramką,
-- którą odblokowuje (20260729142034 / PLAN-C3).
--
-- `session_exercises` i `session_sets` znikają kaskadowo (on delete cascade w init_schema).

delete from public.sessions
where id = 'fa5b83b0-d612-4fc2-8fea-a44dfc2d982c'::uuid
  and finished_at is null
  and (
    select count(*)
    from public.session_sets zestaw
    join public.session_exercises pozycja on pozycja.id = zestaw.session_exercise_id
    where pozycja.session_id = 'fa5b83b0-d612-4fc2-8fea-a44dfc2d982c'::uuid
  ) = 26;
