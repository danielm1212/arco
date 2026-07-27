# CORE-0 — kontrola release'u produkcyjnego

**Data:** 2026-07-27
**Status:** wdrożone i zweryfikowane
**Zakres:** DATA-01, DATA-02, DATA-03 i SYNC-01

## Stan wdrożenia

Kod CORE-0 został scalony w PR #19, a bieżący deployment produkcyjny zawiera jego merge commit.
Historia migracji lokalnej i zdalnej jest zgodna; na produkcji są:

- `20260724133849_data01_completed_set_guard.sql`;
- `20260724141047_data02_canonical_kg_weights.sql`;
- `20260724143658_data03_qualified_fact_finished_only.sql`;
- `20260727110435_data03_exclude_skipped_exercises.sql`.

Nie wykonywano ponownego pushu. Migracje CORE-0 zostały zastosowane przed kontrolowanym
release'em TRAIN-02A4, a późniejszy deployment `main` zawierał już kod hardeningu.

## Kontrola bazy i danych

Eksport schematu produkcyjnego potwierdził:

- trigger `trg_assert_valid_completed_set` i funkcję `assert_valid_completed_set`;
- `finished_at is not null` w rekordach i funkcjach poprzednich wyników;
- wykluczenie `session_exercises.skipped` z rekordów oraz poprzednich wyników.

Odczytowa kontrola danych wykazała 32 zaliczone serie, 0 serii sprzecznych z typem ćwiczenia
oraz 15 rekordów, z których żaden nie opiera się na otwartej sesji, pominiętym ćwiczeniu ani
niezaliczonej serii. Jedna otwarta sesja zawierała 10 zaliczonych serii roboczych; zgodnie
z kontraktem nie weszły one do rekordów ani statystyk.

## Smoke i follow-up

Home, Historia i Postępy odczytały dane poprawnie. Historia pokazała 22 kwalifikowane serie,
a Postępy pominęły otwartą sesję. Smoke wykrył niezależny błąd hydratacji tekstu daty w
`history/[id]`: Vercel renderował w UTC, a przeglądarka w `Europe/Warsaw`.

Follow-up wprowadza współdzielone, deterministyczne formatowanie daty z jawną strefą
`Europe/Warsaw` oraz regresje czasu letniego i zimowego. Bramka po poprawce: 140/140 testów,
lint i build produkcyjny.

## Otwarte follow-upy poza CORE-0

- `body_metrics.weight` nadal wymaga osobnej konwersji kg/lbs;
- funkcje poprzedniego wyniku wybierają najnowszą inną sesję, nie zawsze sesję czasowo
  wcześniejszą od edytowanej historii;
- checkpointy iPhone PWA/Safari oraz Android pozostają w macierzy urządzeń.
