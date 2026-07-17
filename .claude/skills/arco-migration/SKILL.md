---
name: arco-migration
description: Reguły pisania i testowania migracji Supabase w repo arco — unikalny timestamp, test na świeżej bazie, guard migracji danych, RLS z testem wielokontowym, punktowy sync zamiast re-seeda. Użyj przy każdym tworzeniu lub zmianie pliku w supabase/migrations, zmianie schematu, RPC, RLS, seeda lub przy rozjeździe danych local/prod.
---

# Migracje Supabase w arco

Reguły wynikają z realnych incydentów: duplikat timestampu (2026-07-14), złamane FK na
świeżej bazie CI (2026-07-16), dryf danych local/prod (905 vs 907 ćwiczeń). Każda zasada
tu ma swoją bliznę — nie pomijaj żadnej.

## 1. Nazwa pliku — unikalny timestamp z realnego czasu

- Przed nazwaniem: `ls supabase/migrations/` i sprawdź, czy wersja (data-godzina) nie
  istnieje. Duplikat wersji łamie Supabase.
- Używaj bieżącego czasu rzeczywistego (`date +%Y%m%d%H%M%S`), nie wymyślonego.
  Przy sesjach równoległych ryzyko kolizji jest realne — to już się zdarzyło.
- Format: `YYYYMMDDHHMMSS_krotki_opis.sql`.

## 2. Migracja schematu vs migracja danych

- **Schemat** (tabele, kolumny, indeksy, RPC, RLS): zwykła migracja, deterministyczna.
- **Dane** (seed presetów, aktualizacje treści): na świeżej bazie CI dane referencyjne
  (np. ćwiczenia) powstają dopiero w kroku seeda — migracja danych wykonana wcześniej
  złamie FK. Każda migracja danych MUSI mieć guard na pusty stan, wzorzec z
  `20260716141007_lower_body_programs.sql`:

```sql
do $tag$
begin
  if not exists (select 1 from public.exercises) then
    raise notice 'Pomijam: baza referencyjna jest jeszcze pusta.';
    return;
  end if;
  -- właściwe operacje
end
$tag$;
```

- Dane w migracji muszą być zgodne ze `scripts/seed.ts` — seed i migracja to dwie drogi
  do tego samego stanu, nie dwa różne stany.

## 3. Tabele z danymi użytkownika — RLS w tej samej zmianie

- Każda nowa tabela z danymi użytkownika dostaje RLS **w tej samej migracji** oraz test
  wielokontowy w tej samej paczce zmian (wzorzec: smoke:team / testy RLS Ekipy).
- Niezmienniki danych egzekwuj w bazie, nie tylko w kodzie (wzorzec: częściowy unikalny
  indeks jednej otwartej sesji + test `supabase/tests/r1b_single_open_session.sql`).
- Jeśli niezmiennik może kolidować z istniejącymi danymi (backfill, stare rekordy) —
  rozstrzygnij konflikt jawnie w migracji, nie licz na szczęście.

## 4. Test przed wyjściem z sesji — świeża baza, potem smoke'i

Obowiązkowa sekwencja zanim migracja opuści sesję (commit/push):

1. `supabase db reset` — pełny przebieg wszystkich migracji na świeżej bazie,
   dokładnie to samo robi CI.
2. `npm run seed` + `npm run bootstrap:user` na zresetowanej bazie.
3. `npm run validate:training` i `npm run validate:recommendations` — liczby muszą się
   zgadzać z oczekiwanymi z `docs/HANDOFF.md`.
4. Przy zmianie kontraktu danych (RPC, RLS, niezmienniki, kształt tabel): pełne smoke'i
   (`smoke`, `smoke:phase2`, `smoke:offline`, `smoke:team`) — lint/testy/build ich nie
   zastępują. To lekcja z incydentu CI 2026-07-16.

## 5. Rozjazd danych local/prod — punktowy sync, nigdy re-seed

- Re-seed proda jest zabroniony: może zmienić powiązania aktywnych programów użytkowników.
- Brakujące/rozjechane rekordy naprawiaj punktowym syncem znanych identyfikatorów
  (wzorzec: chroniony sync `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`).
- Przed syncem: dry-check bez zapisu, po syncu: walidator liczb.

## 6. Deploy migracji

Wyłącznie procedurą `arco-release` (krok 3): `db push --dry-run` → `db push` →
`migration list` z potwierdzeniem local == remote. Najpierw baza, potem kod, bo kod
zależy od schematu. Service role nigdy w repo ani logach.

## Szybka checklista

- [ ] timestamp unikalny, z realnego czasu
- [ ] migracja danych ma guard na pusty stan i jest zgodna z seedem
- [ ] tabele użytkownika: RLS + test wielokontowy w tej samej paczce
- [ ] `supabase db reset` przechodzi na świeżej bazie
- [ ] walidatory zgodne, przy zmianie kontraktu danych smoke'i zielone
- [ ] rozjazdy danych: punktowy sync po ID, zero re-seeda proda
