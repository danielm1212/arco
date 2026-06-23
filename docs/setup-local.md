# Arco — uruchomienie lokalne (Phase 0)

## Wymagania
- Node 18+ (jest 24), Docker Desktop (uruchomiony), Supabase CLI.
- Supabase CLI jako binarka: `~/.local/share/supabase` (w PATH). Docker CLI: `/Applications/Docker.app/Contents/Resources/bin`.

## Pierwsze uruchomienie / reset
Kolejność jest istotna — `supabase db reset` czyści też usera i seed:

```bash
supabase start                 # lokalny stack (Postgres/Auth/Storage/Studio)
supabase db reset              # aplikuje migracje (schema + RLS + RPC) na czysto
npm run seed                   # 873 ćwiczenia + 2 programy FBW (service-role)
npm run bootstrap:user         # tworzy jedyne konto z ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

Smoke testy warstwy danych (logowanie + przepływ przez RLS):
```bash
npm run smoke          # Phase 1: sesja, logger, poprzedni wynik, edycja, freestyle, historia
npm run smoke:phase2   # Phase 2: podmiana+fallback, PR/e1RM, plate calc
npm run smoke:offline  # Phase 2.5: idempotentny zapis serii (odtwarzanie outboxa)
```

> Po każdym `supabase db reset` powtórz `npm run seed` i `npm run bootstrap:user`.

## Offline (Phase 2.5)
Logger jest odporny na utratę sieci: dodawanie/edycja/✓/usuwanie serii trafia do
**outboxa** (localStorage, `lib/outbox.ts`) i synchronizuje się po powrocie online (`lib/useSync.ts`).
Serie mają UUID po stronie klienta → zapis idempotentny (`upsertSet`, onConflict id).
Wskaźnik w nagłówku sesji: `● offline` / `↑ N` / `synchronizuję…`.
**Test na realnym urządzeniu (iOS PWA) nadal zalecany** — tryb „Offline" w DevTools to nie to samo co zanik zasięgu.

## Konto
Jedno konto, bez publicznej rejestracji (wyłączone w `supabase/config.toml`).
Dane w `.env.local` → `ADMIN_EMAIL` / `ADMIN_PASSWORD` (min. 8 znaków). Zmień hasło na własne.

## Konsole
- App: http://localhost:3000
- Supabase Studio: http://localhost:54323
- Mailpit (maile): http://localhost:54324

## Spike rest-timer
Werdykt i instrukcja testu: [`spike-rest-timer.md`](./spike-rest-timer.md). Trasa: `/spike/rest-timer`.

## Acceptance Phase 0 (zweryfikowane)
- Migracje przechodzą (schema + RLS).
- Seed: 873 ćwiczenia, 2 programy (2× i 3×), 25 slotów z poprawnym `default_exercise_id`.
- Login działa (token wydawany, złe hasło odrzucane, middleware chroni trasy).
- RLS: zalogowany user czyta seed + własne dane; zapis do `exercises` zablokowany (403).
- Spike rest-timer ma werdykt: odliczanie w tle iOS = zawodne → wall-clock + fallback in-app.

## Acceptance Phase 1 (zweryfikowane — `npm run smoke`)
- Przełączanie programu 2×/3× (`user_active_program`).
- Start sesji tworzy `session_exercises` ze slotów dnia (z `slot_id` — progres slotu).
- „Poprzedni wynik" — funkcja `previous_working_set` zwraca ostatni working set slotu/ćwiczenia.
- Rest timer startuje po ✓ (wall-clock, beep+wibracja) — `app/session/[id]/RestTimer.tsx`.
- Edycja i usuwanie serii oraz całych sesji.
- Freestyle: sesja bez programu + dodawanie ćwiczeń z katalogu (`ExercisePicker`).
- Historia: `/history` + szczegóły `/history/[id]`.
- Build zielony; trasy chronione (niezalogowany → 307 `/login`).

## Acceptance Phase 2 (zweryfikowane — `npm run smoke:phase2`)
- **Silnik podmiany** (`/session/[id]` → „⇄ Podmień"): kandydaci po movement_pattern + primary_muscles,
  filtr sprzętu z profilu, ranking, **fallback nigdy nie zwraca pustej listy** (ostrzeżenie przy luźnym dopasowaniu).
- **Filtr sprzętu** edytowalny w `/settings` (`user_settings.available_equipment`).
- **e1RM (Epley) + PR** przeliczane z zera przy zakończeniu/usunięciu sesji (`recompute_personal_records`).
- **Dashboard** `/progress`: objętość, serie, serie-na-partię (7 dni), rekordy (e1RM/max).
- **Widok exercise-first** `/exercise/[id]`: agregacja po `exercise_id`.
- **Plate calculator** (`lib/plates.ts`) z `bar_weight` + `available_plates`; podgląd w loggerze.
- **RPE** na seriach roboczych; **hint progresji** po dobiciu górnego zakresu.
- Odłożone post-MVP: edytor supersetów (schema gotowa), pełny offline (Phase 2.5).
