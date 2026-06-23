# Arco — uruchomienie lokalne (Phase 0)

## Wymagania
- Node 18+ (jest 24), Docker Desktop (uruchomiony), Supabase CLI.
- Supabase CLI jako binarka: `~/.local/share/supabase` (w PATH). Docker CLI: `/Applications/Docker.app/Contents/Resources/bin`.

## Pierwsze uruchomienie / reset
Kolejność jest istotna — `supabase db reset` czyści też usera i seed:

```bash
supabase start                 # lokalny stack (Postgres/Auth/Storage/Studio)
supabase db reset              # aplikuje migracje (schema + RLS) na czysto
npm run seed                   # 873 ćwiczenia + 2 programy FBW (service-role)
npm run bootstrap:user         # tworzy jedyne konto z ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

> Po każdym `supabase db reset` powtórz `npm run seed` i `npm run bootstrap:user`.

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
