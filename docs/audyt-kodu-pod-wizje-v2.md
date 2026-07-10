# Audyt kodu, funkcji i user flow pod wizję v2

> **Data:** 2026-07-08 · **Zakres:** mapowanie wymagań `wizja-i-plan-produktu-v2.md` na istniejący kod + gap analysis + wycena. **Nie zmienia kodu** — raport do decyzji [Ty].
> **Metoda:** przegląd `app/` (route'y, akcje), `lib/` (guidance, sync, week), migracji, RLS, SW/PWA, seedu. Stan repo: po kuracji bazy ćwiczeń i aktualizacji programów (2026-07-08).

---

## 1. TL;DR

**Wizja v2 w ~80% to dobudowa, nie przebudowa.** Rdzeń (logger, programy, guidance, analityka, offline-zalążek) jest zbudowany zgodnie z duchem Z1–Z3, architektura od początku multi-user (RLS po `user_id` wszędzie). Największe braki to całe *nowe* moduły: płatności, entitlements/limity, pody z kanałami dostarczania i pętla instalacji PWA. Jedyny fragment istniejącego kodu wymagający realnej ingerencji: **zapytania historii/postępów** (gate 12 tygodni) i **strona postępów** (split free/premium).

**Wycena łączna nowej pracy po domknięciu H1: ~11–20 tygodni** (solo + Claude, w blokach zgodnych z Krokami wizji). Szczegóły §5.

---

## 2. Co już mamy i gra z wizją (nie ruszać / drobne)

| Wymaganie wizji | Stan w kodzie | Ocena |
|---|---|---|
| Z1: frictionless logging | `Logger.tsx` (768 linii — split czeka w S9-cz.2), pre-fill, tap, mini-bar, rep-PRs on-the-fly | ✅ gotowe, zostaje free |
| Guidance lite/full (§3.1) | `lib/guidance.ts` — czysto modularne, każdy hint ma `GuidanceKind` (`progression / balance / staleness / deload`) | ✅ **gating = filtr po kind** (lite = progression). Trywialne |
| Analityka premium (§3.1) | S13 zrobione: muscle split w czasie, delta-karty, trendy — wszystko w `app/progress/page.tsx` | ✅ istnieje; trzeba tylko podzielić free/premium (§3) |
| Trigger stagnacji (fala 1) | `stalenessFlags` + `deloadFlags` już wykrywają stagnację | ✅ podpiąć CTA konwersji pod istniejące flagi |
| Onboarding początkującego (§1.1) | `WelcomeOverlay` v2 (S7): imię+poziom+środowisko → sugestia programu + cel | ✅ jest; ew. polish copy |
| Ekran celebracji (miejsce prompta instalacji, §5) | `app/session/[id]/done/page.tsx` — cel tygodniowy, liczba-bohater | ✅ jest; dobudować CTA instalacji |
| Multi-user w danych | RLS po `user_id` na wszystkich tabelach usera; seed read-only | ✅ fundament pod pody/konta |
| Wzorzec limitów | guardy count-based już istnieją (`userExercises.ts` delete-guard, `program.ts` liczy dni) | ✅ wzorzec do reużycia przy limitach free |
| PWA | Serwist (`app/sw.ts`), wake lock, manifest, safe-area | ✅ baza jest; brak push i install-flow (§3) |
| Offline | `lib/outbox.ts` + `useSync.ts` (zalążek) | ⚠️ S10 (offline+longevity) **nadal przed nami** — twardy prerekwizyt paywalla (Krok 0 wizji, zgodnie z planem) |

## 3. Czego NIE ma (nowe moduły) — per Krok wizji

### Krok 2 — bramka kont + RODO (wizja: blok 4–7 tyg.)
Brak w kodzie: publiczny signup (dziś bootstrap skryptem, `login/` tylko), weryfikacja e-mail, reset hasła, usunięcie konta (schema cascade-ready ✓), **eksport danych** (zero kodu), rate limiting, polityki/ToS, **Stripe** (zero śladów), **e-mail transakcyjny** (zero), **zgoda podowa** w modelu danych, wiek 16+.
Nowe tabele: `subscriptions`/`entitlements`, `consents`. Rozszerzenie `user_settings` nie wystarczy — subskrypcja i zgody to osobne byty z historią.

### Krok 3 — launch freemium
- **Entitlements + reverse trial 21 dni:** plan wyliczany z `subscriptions` + `trial_started_at` (start = signup). Dzień 22 = łagodny downgrade (UX do zaprojektowania).
- **Limity free:** 2 programy → guard w `app/actions/program.ts` (create + duplicate, oba punkty zlokalizowane); 10 custom → guard w `createUserExercise`; **12 tyg. historii → najbardziej inwazyjne**: `app/history/page.tsx` (lista), `app/history/[id]` (starsze sesje), `app/progress/page.tsx` (uwaga: własne cutoffy, np. 120 dni dla muscle split — dziś dłuższe niż okno free!), strony postępu ćwiczenia. Gate = query-cutoff + kłódka UI z copy „wszystko tu jest, bezpieczne".
- **Split analityki free/premium** na `/progress`: free = PR-y, kalendarz+passa, heatmapa bieżąca; premium = trendy, split w czasie, delta-karty.
- **Ochrona passy (premium):** logika passy w `lib/week.ts` + strony — dodać mechanizm „freeze".
- **Paywall UI:** cennik, ekran kłódki, CTA na fladze stagnacji + **wytyczne z badania 2850 paywalli** (`inspiracje/wnioski-dla-arco.md` §2, 2026-07-08):
  1. **Paywall = flow:** sekwencja diagnoza → obietnica → cena (trigger stagnacji outcome-first, nigdy cena na dzień dobry).
  2. **Timeline reverse triala na dzień 0** (wzorzec Blinkist): oś „dziś wszystko → d18 przypomnienie → d22 zostaje darmowy rdzeń"; nasz as: bez karty. Zamiast „odliczania triala" z pierwotnego szkicu — timeline raz + przypomnienie d18.
  3. Ekran cen: **2 opcje** (roczny default jako najwyższe LTV, miesięczny obok), **tabela free/Coach** „co zyskujesz", subtitle „bez zobowiązań…", chevron na CTA.
  4. **Exit-intent:** odmowa rocznego → sheet z miesięcznym (nie rabat — fake urgency zakazane w ToV).
  5. **Anulowanie ≤ 2 tapy z ustawień** — twarda zasada (anty-ClassPass); uczciwość = nasz moat.
  6. Testy po launchu: **radykalnie różne warianty** (timeline vs tabela vs long-form) przez PostHog flags, nie mikro-tweaki.

### Krok 4 — pody + kanały + pętla instalacji (wizja: 4–8 tyg.)
- **Schema:** `pods`, `pod_members`, `pod_invites` (kod/link), `activity_events` (check-in emitowany przy finish sesji — zdarzeniowy status, NIE rekordy treningowe: dokładnie jak w wizji §4), `reactions`, `nudges`, `inbox`. RLS: członkowie poda widzą wyłącznie `activity_events` + passę. Decyzja wizji (status, nie logi) **upraszcza RLS o rząd wielkości** — nowa powierzchnia i tak wymaga audytu.
- **Kanały nudge (fallback chain):** web-push (VAPID, handler w `sw.ts` — dziś tylko caching, subskrypcje w DB), skrzynka in-app (tabela + badge), e-mail digest max 1/dzień (dostawca z Kroku 2 + cron/edge function).
- **Pętla instalacji PWA (§5):** przechwycenie `beforeinstallprompt` (zero kodu dziś), własny CTA na `done/page.tsx`, overlay instrukcji iOS/Safari (detekcja UA + `display-mode: standalone`), komunikat „otwórz w Safari" dla in-app browserów.

### Poza kodem (tor assetów / H3)
Retro-analog: fotografia, AI-grading top ~200 zdjęć ćwiczeń (spina się z self-hostem S11 i placeholderami 32 nowych ćwiczeń), ikony clay, logotyp retro. Nie liczone w wycenie kodu.

## 4. Punkty tarcia z istniejącym kodem (flagi do decyzji)

1. **Pre-fill vs gate historii:** prefill „previous working set" sięga ostatniej sesji. User wracający po >12 tyg. przerwy: prefill czyta dane spoza okna free. **Rekomendacja: prefill zawsze działa** (rdzeń pętli, Z1) — gate dotyczy przeglądania, nie obliczeń. Zapisać jako regułę.
2. **Guidance na pełnych danych:** staleness/deload liczą po historii. Rekomendacja: obliczenia zawsze na pełnych danych (Z3 limituje *dostęp*, nie *użycie* danych przez system) — inaczej trigger stagnacji u free usera by oślepł i fala 1 traci amunicję.
3. **`progress/page.tsx` (474 linie) i `Logger.tsx` (768 linii):** split free/premium wjedzie w monolityczne pliki — **zrobić S9-cz.2 (higiena/rozbicie) PRZED Krokiem 3**, inaczej paywall dokleimy do spaghetti.
4. **Dwie definicje „Sprint 5":** roadmapa H1 („offline correctness") vs HANDOFF („guidance"). Faktyczny stan: offline domyka **S10**. Kosmetyka numeracji, ale przy planowaniu Kroku 0 nie pomylić.
5. **Miękkie usuwanie konta:** RODO wymaga twardego kasowania, pody wymagają zachowania integralności `activity_events` po odejściu członka — zaprojektować razem (Krok 2, zgoda podowa).

## 5. Wycena (solo + Claude; tygodnie kalendarzowe przy obecnym tempie)

| Blok | Zakres | Szacunek | Zależności |
|---|---|---|---|
| **Krok 0** — domknięcie H1 | S9-cz.2 (higiena) → S10 (offline+longevity) → S11 (launch gate) | już w planie sprintów (nie nowa praca) | — |
| **Krok 2** — konta+RODO+płatności | auth flows ~1 tyg. · Stripe+entitlements ~1–1,5 tyg. · eksport/usunięcie/zgody (w tym podowa) ~1 tyg. · e-mail provider ~0,5 tyg. · polityki/prawne (moderowane, nie kodowe) ~1–2 tyg. | **4–7 tyg.** (potwierdzam widełki wizji) | S10 |
| **Krok 3** — freemium live | limity (programy/custom ~2 dni; historia ~1 tyg. z kłódką i UX) · split analityki ~0,5 tyg. · gating guidance ~2 dni · trial+downgrade UX ~1 tyg. · paywall UI + trigger stagnacji ~1 tyg. · ochrona passy ~2 dni | **3–5 tyg.** | Krok 2; S9-cz.2 przed |
| **Krok 4** — pody | schema+RLS+zgody ~1 tyg. · UI podów (ekran, invite, reakcje, nudge) ~1,5–2 tyg. · web-push ~1 tyg. · skrzynka ~0,5 tyg. · e-mail digest ~0,5 tyg. · pętla instalacji (§5 wizji) ~1 tyg. · testy wielokontowe ~0,5–1 tyg. | **6–8 tyg.** (górna połowa widełek wizji — kanały dostarczania to najcięższy kawałek) | Krok 2 (e-mail, zgody), launch |
| **RAZEM nowej pracy** | | **~13–20 tyg.** | |

Kolejność bez zmian względem wizji. Jedyna korekta priorytetu z audytu: **S9-cz.2 przeciągnąć przed Krok 3** (pkt 4.3).

## 6. Rekomendowane następne akcje

1. [Ty] Decyzje z §4 (prefill, guidance-na-pełnych-danych) — dwa zdania do wizji/CLAUDE.md.
2. [Claude] Krok 0 zgodnie z planem sprintów (S9-cz.2 najbliższe).
3. [Ty] Moduły WTP+pody do scenariusza H2 (`usability-audit.md` sekcja C) — 25 min/sesję wg wizji.
4. Projekt schematu `subscriptions`/`consents`/`pods` (dokument, zero kodu) — można zrobić wcześnie, tanio zamyka ryzyka §4.5.
