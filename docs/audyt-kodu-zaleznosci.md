# Audyt kodu i zależności (S9) — raport

> Data: 2026-07-04. Część bezpieczna wykonana; refaktory = część 2 (osobna tura); majory = decyzja [Ty] (§2).

## 1. Zrobione teraz

- **Patche minor (bezpieczne):** `@supabase/supabase-js` 2.108→2.110 · `lucide-react` 1.21→1.23 · `postcss` (top-level) 8.5.15→8.5.16 · `tsx` 4.22→4.23. Build czysty, apka działa (LAN 200).
- **Smoke testy naprawione i przechodzą 3/3** (`smoke`, `smoke:phase2`, `smoke:offline`):
  - phase1 szukał skasowanego programu „FBW 3×" → przełączony na „Beginner · Siłownia · Full Body 3×"; **dodatkowo smoke teraz zapamiętuje i przywraca aktywny program usera** (wcześniej po cichu go podmieniał — niebezpieczne przy realnym użyciu).
  - phase2 importował usunięty `lib/plates` (descope talerzy) → martwy test wycięty.
  - Uwaga ops: smoke wymagają `ADMIN_PASSWORD=arco1` w env (hasło w `.env.local` jest inne — guard bootstrapu min. 8 znaków).
- **Dedup `formatSet`/`Sparkline` z planu — nieaktualny:** obie funkcje istnieją w dokładnie jednym miejscu.

## 2. Podatności npm — wszystkie wymagają Next 16 (major) → decyzja [Ty]

`npm audit`: 5 podatności (4 high, 1 moderate) — **wszystkie w `next@14.2.35`** (moderate to postcss zbundlowany w nexcie). Fix wyłącznie przez `next@16` (breaking).

Ocena eksploatowalności **w naszym kontekście** (apka za loginem, single-user, po N1 na Vercelu):

| Podatność | U nas |
|---|---|
| DoS w Image Optimization API | nie używamy `next/image` (świadomie `<img>`) — **nie dotyczy** |
| XSS przy CSP nonces / beforeInteractive | nie używamy CSP nonces ani beforeInteractive — **nie dotyczy** |
| SSRF przez WebSocket upgrades | brak WS — **nie dotyczy** |
| Middleware bypass przy i18n (Pages Router) | App Router, brak i18n — **nie dotyczy** |
| Cache poisoning RSC / middleware redirects | **jedyne realne** — istotne na CDN (Vercel), łagodzone tym, że wszystko za auth i single-user |
| DoS Server Components | niska istotność (osobisty ruch) |

**Rekomendacja (bez zmian vs plan):** Next 16 + React 19 + Tailwind 4 + TS 6 robić **świadomie po N1/launchu**, jeden major na raz z pełną weryfikacją — nie teraz w środku sprintów produktowych. Ryzyko bieżące akceptowalne. Jeśli wolisz przed deployem — powiedz, wtedy najpierw sam Next 16 (największy zysk security).

## 3. Higiena kodu — część 2 — ✅ WYKONANE (S9-cz.2, 2026-07-10)

- **Rozbicie `Logger.tsx`** ✅ 768→249 linii: `ExerciseCard` + `SetRow` (oba `memo` z komparatorami pomijającymi funkcje) + `useRestTimer` + `useSessionOutbox` (grunt pod S10) + `useSessionMutations` + `finish.ts`. Przenosiny 1:1; inwariant handlerów (ID + funkcyjne setState + `exercisesRef`) udokumentowany w `useSessionMutations.ts`.
- **N+1 w „poprzednio"** ✅ `previous_session_sets_batch(p_session)` (LATERAL na starej funkcji = poprawność z konstrukcji; zweryfikowane 8/8 identycznie ze starą) — 1 RPC zamiast N.
- **Paginacja historii** ✅ 20 + kursor `?before=`; kalendarz+passa z osobnego lekkiego zapytania po datach.
- Bonus: split `/progress` (474→~100) + heatmapa przez `next/dynamic` (First Load trasy 98,7 kB).
- Mniej `as unknown as` przy joinach Supabase (typed helpers) — NIE ruszone (niski priorytet, osobna okazja).

**Lighthouse przed→po** (mobile, symulowany throttling, prod `next start`, LH 13.4): home 94→95 · /progress 94→95 (LCP 3,1→2,9 s) · logger 95→95. Wszystko ≥90 (budżet `optymalizacja.md` §1). Zysk loggera to re-rendery (memo — niewidoczne w Lighthouse przy TBT 0 ms); zysk /progress to vendor poza initial.

## 4. Status Done S9
Patche minor ✓ · 0 known-exploitable w naszym kontekście (ocena wyżej) ✓ · smoke czyste ✓ · decyzja majorów: **czeka [Ty]** (re-audit 2026-07-10: te same 5 vuln, wszystkie w next@14) · higiena: **część 2 = DONE** (§3).
