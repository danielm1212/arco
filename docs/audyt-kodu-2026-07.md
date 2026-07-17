# Audyt kodu — 2026-07-17

> **Zakres:** cały kod aplikacji po sprintach R1a/R1b/R2 — bezpieczeństwo (server actions, RLS, RPC, Storage, sekrety), integralność danych i race conditions (outbox, szkice, idempotencja), wydajność gorących tras (budżety z `optymalizacja.md`) i zdrowie kodu (martwy kod, duplikacja, testy).
> **Metoda:** 4 równoległe przeszukania agentowe + ręczna weryfikacja spornych findingów.
> **Werdykt: zero P0.** Fundament jest solidny — RLS kompletny na wszystkich 18 tabelach użytkownika, service role tylko w skryptach, RPC walidują `auth.uid()`, idempotencja startu sesji i check-inów potwierdzona, re-rendery loggera pod kontrolą. Poniżej to, co warto poprawić.

## P1 — do najbliższych sprintów

1. ~~**`lib/outbox.ts` `read()` — cichy zrzut kolejki przy uszkodzonym JSON.**~~ ✅ 2026-07-17 (`e0c4cbf`): surowa wartość ląduje pod `arco-outbox-v1-corrupt` (pierwszy backup wygrywa), klucz główny czyszczony, toast przez event + `pendingOutboxAlerts()`.
2. ~~**Wzór e1RM (Epley) skopiowany w 4 miejscach**~~ ✅ 2026-07-17 (`37af446`): `estimate1RM()` + `setMetric()` w `lib/exerciseMetrics.ts`, wszystkie 4 kopie zastąpione importem (przy okazji zniknęły też 3 identyczne funkcje metryki per typ).
3. ~~**`lib/repPRs.ts` bez testu jednostkowego**~~ ✅ 2026-07-17 (`37af446`): `tests/rep-prs.test.ts` (Pareto: dominacja, sortowanie, brzegi) + `tests/exercise-metrics.test.ts` (wartości Epleya, wybór metryki wg typu).
4. ~~**Home: guidance blokuje LCP.**~~ ✅ 2026-07-17 (`b790a80`): `getHomeGuidance()` wyjęte z batcha do async `HomeGuidance` w `<Suspense fallback={null}>` — hero streamuje się bez czekania na 3 rundy guidance.

## P2 — kolejka refinementu

**Integralność danych**
- ~~`lib/outbox.ts` `write()` bez try/catch~~ ✅ 2026-07-17 (`e0c4cbf`): quota fallback w pamięci karty (`volatileOps`, flush dalej wysyła) + toast.
- ~~`lib/usePersistentFormDraft.ts:70` `clearDraft` nie anuluje debounce'owanego timera~~ ✅ 2026-07-17 (`e0c4cbf`): timer w refie, `clearDraft` go ubija.
- ~~Brak nasłuchu `storage`/BroadcastChannel~~ ✅ 2026-07-17: single-window udokumentowane jako świadome założenie w nagłówku `lib/outbox.ts`; listener do rewizji, gdyby multi-window okazał się realny.
- ~~`Logger.tsx:262` przycisk „Zakończ" bez guarda in-flight~~ ✅ 2026-07-17: `confirmFinish` z flagą `finishing` + `disabled` na przycisku (oba wejścia: bezpośrednie i FinishSheet).

**Bezpieczeństwo (defense-in-depth, realnego ryzyka brak)**
- ~~`app/actions/substitute.ts:31,118` — jedyne akcje bez jawnego `requireUser()`~~ ✅ 2026-07-17: obie akcje przez `requireUser()` (idiom z session.ts).
- `join_pod_by_invite` bez rate limitingu prób kodu (40 bitów entropii broni przed brute-force, throttling i tak wypada dodać przed publicznymi Ekipami — spójne z ryzykiem nr 7 HANDOFF).
- ~~Polityka INSERT na `activity_events`~~ SPROSTOWANIE 2026-07-17: finding nieaktualny — policy zdjęta i INSERT odwołany już w `20260713131500_team_activity_guard.sql`; zweryfikowane w pg_policy/grants (zostały tylko SELECT policy + RPC).
- CSP: `script-src 'unsafe-inline'` (świadomy trade-off hydratacji; docelowo nonce'y). ~~Zaszłość `raw.githubusercontent.com` w `remotePatterns` i `img-src`~~ ✅ 2026-07-17: wycięta (remotePatterns w całości — next/image używają tylko lokalne ikony; CSP img-src = self + Supabase).

**Wydajność**
- ~~Brak indeksu `sessions(user_id, started_at desc)`~~ ✅ 2026-07-17 (`b790a80`): migracja `20260717213044_sessions_started_at_index` (świeża baza + seed + walidatory ✓; czeka na `db push` [Ty]).
- `app/progress/stats.ts` — `periodStats` i `getStrengthTrends` robią po 3 sekwencyjne rundy; kandydat na RPC/agregat (wzorzec: `previous_session_sets_batch`).
- ~~`app/exercise/[id]/page.tsx:54` — historia ćwiczenia bez `limit`~~ ✅ 2026-07-17: `order("sessions(started_at)" desc) + limit(100)` — cap na 100 ostatnich wystąpień.

**Zdrowie kodu**
- ~~`components/TeamHomeCard.tsx` — 0 importów bez wyjaśnienia~~ ✅ 2026-07-17: komentarz „zachowany do R3b, nie usuwać" w nagłówku komponentu.
- ~~~22 rzutowania `as unknown as {…}` na kształtach joinów Supabase~~ ✅ 2026-07-18: `lib/dbJoins.ts` — wspólne kształty (`ExerciseJoin`, `DayJoin`) + `joinOne`/`joinMaybe`/`joinMany` w jednym udokumentowanym miejscu; 19 lokalnych rzutowań zastąpionych (w repo został tylko `webkitAudioContext` w `lib/feedback.ts` — inna kategoria).
- ~~Braki testów: `lib/format.ts`, `lib/week.ts`, `lib/trainingPriority.ts`, `lib/exerciseFilters.ts`~~ ✅ 2026-07-17 (`33dd58e`): 4 nowe pliki testów, +26 przypadków (m.in. regresja bugu strefy czasowej w `localDayKey`, dziura w passie, union mięśni/sprzętu).
- ~~Formatowanie serii inline obok istniejącego `formatSet`~~ ✅ 2026-07-18: hint „last set" w `SetRow` przez `formatSet` (jedyna realna inline-kopia; drobna unifikacja: „45s" jak w historii). Pozostałe trafienia z audytu to inne semantyki (target slotu, etykiety statystyk) — nie serie.
- Komponenty >300 linii: `WelcomeOverlay` (573!), `ProgramEditor` (440), `Logger` (433), `SettingsForm`, `ExerciseBrowser` — kandydaci do podziału przy najbliższym dotknięciu.
- ~20 zahardkodowanych komunikatów błędów PL rozsianych po akcjach — scentralizować, jeśli kiedyś i18n.

## Potwierdzone czyste

Server actions z własnością przez RLS (wszystkie tabele policzone), brak IDOR; sekrety poza repo, zero `console.*` w kodzie aplikacji; brak `signUp` (rejestracja realnie wyłączona); Storage per-user folder + `randomUUID()`; idempotencja: `start_or_resume_session` (advisory lock + unikalny indeks), check-iny (`on conflict do nothing`), upsert serii po id klienta; rollback optimistic updates ze snapshotem; IndexedDB zdjęć z obsługą quota i rollbackiem uploadu; SW NetworkFirst bez ryzyka stale HTML; bundle lean (brak lodash/moment, named importy lucide); biblioteka 907 ćwiczeń za `limit(30)` + debounce; bottom sheety i toasty w 100% przez wspólne komponenty; zero TODO/FIXME w kodzie.

## Porządki wykonane przy audycie

Usunięto 33 artefakty synca `public/sw N.js` (gitignored, kopie zbudowanego SW — ten sam mechanizm co duplikaty ikon ` 2.png`; przyczyna synca wciąż do namierzenia, wpis w koordynacji z 2026-07-14).

## Rekomendowana kolejność

P1.1+P2 outbox/szkice jedną paczką (spójny temat „trwałość zapisu", ~1 dzień) → P1.2+P1.3 przed featurem Coach → P1.4 + indeks `started_at` przy najbliższym dotknięciu home/statystyk → reszta P2 jako tło przy R3–R5.
