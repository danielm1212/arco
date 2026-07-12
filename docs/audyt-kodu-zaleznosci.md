# Audyt kodu i zależności (S9) — raport

> Data: 2026-07-04. Część bezpieczna wykonana; refaktory = część 2 (osobna tura); majory = decyzja [Ty] (§2).

## 1. Zrobione teraz

- **Patche minor (bezpieczne):** `@supabase/supabase-js` 2.108→2.110 · `lucide-react` 1.21→1.23 · `postcss` (top-level) 8.5.15→8.5.16 · `tsx` 4.22→4.23. Build czysty, apka działa (LAN 200).
- **Smoke testy naprawione i przechodzą 3/3** (`smoke`, `smoke:phase2`, `smoke:offline`):
  - phase1 szukał skasowanego programu „FBW 3×" → przełączony na „Beginner · Siłownia · Full Body 3×"; **dodatkowo smoke teraz zapamiętuje i przywraca aktywny program usera** (wcześniej po cichu go podmieniał — niebezpieczne przy realnym użyciu).
  - phase2 importował usunięty `lib/plates` (descope talerzy) → martwy test wycięty.
  - Uwaga ops: smoke wymagają `ADMIN_PASSWORD=arco1` w env (hasło w `.env.local` jest inne — guard bootstrapu min. 8 znaków).
- **Dedup `formatSet`/`Sparkline` z planu — nieaktualny:** obie funkcje istnieją w dokładnie jednym miejscu.

## 2. Podatności npm — ✅ ROZWIĄZANE (2026-07-12, `97405b8`)

`npm audit`: 5 podatności (4 high, 1 moderate) — **wszystkie w `next@14.2.35`** (moderate to postcss zbundlowany w nexcie). Fix wyłącznie przez `next@16` (breaking) — potwierdzone realnym `npm audit --json` (`fixAvailable` wskazywał wyłącznie `next@16.2.10`, nie 15.x).

**Decyzja [Ty] 2026-07-12:** Next 16 + React 19 razem (React 19 nie był ściśle wymagany — Next 16 akceptuje React 18 jako peer — ale App Router i tak ciągnie kanaryjski React 19.2, więc zrobione naraz). **Tailwind 4 i TypeScript 6/7 ŚWIADOMIE ZOSTAJĄ NIETKNIĘTE** — osobne, większe decyzje (Tailwind 4 = przepisanie całego systemu tokenów „Arco Warm" na CSS-first config, ryzyko wizualne na świeżo dopracowanym systemie).

Realne złamania w tym repo (nie ogólnikowo z changeloga, zweryfikowane grepem): async `params`/`searchParams` (8 plików) + `cookies()` w `lib/supabase/server.ts` (→ async, ~22 call site'y z `await`) + `middleware.ts`→`proxy.ts` (bezpieczeństwo, nie kosmetyka — łatki proxy z 16 nie działają pod starą nazwą) + Turbopack domyślny (zostajemy na webpack, `--webpack` flag) + ESLint 8→9 + flat config (nie 10 — `eslint-plugin-react` bundlowany przez eslint-config-next niekompatybilny z ESLint 10 API).

**Wynik:** 4/5 podatności (wszystkie high) usunięte. **Zostaje 1 moderate** — `postcss@8.4.31` zbundlowany WEWNĄTRZ `next@16.2.10` (`node_modules/next/node_modules/postcss`), nie nasza zależność, nie do podbicia bez `npm audit fix --force` (zdowngradowałoby `next` do `9.3.3` — katastrofalna regresja, odrzucone). Upstream-blocked, akceptowalne ryzyko (moderate, ten sam „postcss zbundlowany w Nexcie" quirk co w §1 tego audytu).

Pełny opis migracji, weryfikacji i decyzji: commit `97405b8` + HANDOFF wpis 2026-07-12.

## 3. Higiena kodu — część 2 — ✅ WYKONANE (S9-cz.2, 2026-07-10)

- **Rozbicie `Logger.tsx`** ✅ 768→249 linii: `ExerciseCard` + `SetRow` (oba `memo` z komparatorami pomijającymi funkcje) + `useRestTimer` + `useSessionOutbox` (grunt pod S10) + `useSessionMutations` + `finish.ts`. Przenosiny 1:1; inwariant handlerów (ID + funkcyjne setState + `exercisesRef`) udokumentowany w `useSessionMutations.ts`.
- **N+1 w „poprzednio"** ✅ `previous_session_sets_batch(p_session)` (LATERAL na starej funkcji = poprawność z konstrukcji; zweryfikowane 8/8 identycznie ze starą) — 1 RPC zamiast N.
- **Paginacja historii** ✅ 20 + kursor `?before=`; kalendarz+passa z osobnego lekkiego zapytania po datach.
- Bonus: split `/progress` (474→~100) + heatmapa przez `next/dynamic` (First Load trasy 98,7 kB).
- Mniej `as unknown as` przy joinach Supabase (typed helpers) — NIE ruszone (niski priorytet, osobna okazja).

**Lighthouse przed→po** (mobile, symulowany throttling, prod `next start`, LH 13.4): home 94→95 · /progress 94→95 (LCP 3,1→2,9 s) · logger 95→95. Wszystko ≥90 (budżet `optymalizacja.md` §1). Zysk loggera to re-rendery (memo — niewidoczne w Lighthouse przy TBT 0 ms); zysk /progress to vendor poza initial.

## 4. Status Done S9
Patche minor ✓ · smoke czyste ✓ · higiena: **część 2 = DONE** (§3) · majory: **DONE 2026-07-12** — Next 16 + React 19, 4/5 podatności usunięte, 1 moderate upstream-blocked (§2) → **S9 KOMPLETNIE ZAMKNIĘTE, S11-domknięcie odblokowane**.
