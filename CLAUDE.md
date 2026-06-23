# Projekt: Arco — osobista apka treningowa (web, PWA)

## Źródło prawdy
- Specyfikacja: `docs/build-brief-apka-treningowa-v0.2.md` (NADRZĘDNA)
- Seed programów: `docs/seed-prompt-fbw.md`
- Przewodnik startowy: `docs/start-z-claude-code.md`

Przeczytaj brief i seed w całości zanim cokolwiek napiszesz. Brief jest nadrzędny.

## Zasady pracy
- Buduj FAZAMI wg sekcji 6 briefu. STOP na review po Phase 0 i po Phase 1. Nie idź dalej bez zgody.
- Przed kodowaniem nowej fazy: przedstaw plan i zadaj pytania o luki. Plan najpierw, kod potem.
- Out of scope (sekcja 11 briefu) jest zakazane: bez social, AI auto-programming, macro/nutrition, wearables/HRV, natywu, monetyzacji.
- Flaguj opiniotwórcze decyzje jawnie, żeby dało się je nadpisać.

## Techniczne
- Migracje DB tylko przez Supabase migrations, nie ad-hoc SQL.
- Auth przez `@supabase/ssr` (nie `auth-helpers`).
- PWA: Serwist pod App Router (nie `next-pwa`).
- Zero magic numbers w stylach. Komponenty czytają tylko semantyczne design tokeny.
- RLS po `user_id` na wszystkich tabelach z danymi usera. Seed (`exercises`, `programs` z `user_id = null`) read-only dla zalogowanych.

## Decyzje Phase 0 (zatwierdzone)
- **Framework:** Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind v3 + shadcn/ui.
- **Supabase:** lokalny stack (CLI + Docker), migracje + seed lokalnie → `db push` na remote.
- **Auth:** jedno konto, email + hasło, bez publicznego signup. Konto bootstrapowane skryptem (service-role) z `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **Seed ćwiczeń:** `free-exercise-db` (vendor JSON do repo), obrazki hotlinkowane do `raw.githubusercontent…` (bez kopii do Storage w Phase 0).
- **user_settings defaults:** `unit_system = kg`, `bar_weight = 20`, `available_plates = [25,20,15,10,5,2.5,1.25]`, `default_rest_seconds = 120`.
- **Design tokeny:** warstwy primitive → semantic → zmienne shadcn (HSL) → Tailwind config. Wartości startowe proponowane, do nadpisania przez właściciela.
- **Rest-timer spike:** zakres MVP — werdykt + fallback in-app (dźwięk/wibracja gdy app aktywna). Bez Web Push w Phase 0.

## Definicja done
Acceptance criteria z sekcji 10 briefu. Faza jest skończona dopiero gdy je spełnia.

### Phase 0 (acceptance)
Migracje przechodzą · seed ładuje ćwiczenia + oba programy FBW · login działa · spike rest-timer ma werdykt (działa / fallback).
