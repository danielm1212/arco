# Audyt zrozumiałości onboardingu (v3+, stan 2026-07-16)

> **Zlecenie [Ty]:** „czy onboarding jest zrozumiały + zaplanuj zmiany". **Metoda:** cognitive walkthrough na realnym kodzie (`components/WelcomeOverlay.tsx`, `lib/trainingPriority.ts`, `lib/programRecommendation.ts`) z perspektywy obu person; copy vs `tone-of-voice.md`; spójność z `wytyczne-designu.md` §3. To audyt ekspercki — rozstrzyga H2 (Z1/Z1a już testuje dokładnie zrozumiałość onboardingu).
> **Flow:** E0 moment → E1 imię+jednostki → E2 gdzie (auto-advance) → E3 poziom (auto-advance) → E4 priorytet (auto-advance) → E5 rytm (default wg poziomu) → E6 karta planu / fallback biblioteki → E7 mikro-potwierdzenie (0,9 s).

## 1. Werdykt

**Onboarding jest w ~85% zrozumiały i strukturalnie dobry** — outcome-first działa: user w ≤60 s dostaje plan Z UZASADNIENIEM („Wybraliśmy go, bo…"), defaulty wg poziomu zdejmują decyzje, E4 uczciwie mówi „nie zmienia planu", E5 antycypuje rytm planu zanim pokaże wynik. To poziom, którego Hevy nie ma w ogóle (u nich: pusta lista rutyn).
Pozostałe 15% to **2 realne pułapki (P1), 3 zgrzyty (P2) i garść copy (P3)** — wszystko naprawialne w jeden wieczór.

## 2. Znaleziska

### P1 — pułapki (naprawić przed H2)

| # | Problem | Dowód w kodzie | Fix |
|---|---|---|---|
| O1 | **„Przejdź do biblioteki" nie prowadzi do biblioteki.** Gałąź fallback (brak sugestii — np. po skipie E2/E3): przycisk zapisuje profil i… zamyka overlay na home. Etykieta kłamie — user ląduje na pustym home i szuka biblioteki sam (dokładnie scenariusz feedbacku #1). Uwaga: bliźniaczy przycisk „Wybierz inny program" (gałąź z sugestią) NAWIGUJE poprawnie — to regresja tylko w fallbacku. Znane od 2026-07-11 jako P3 — po audycie podbijam do P1, bo dotyka najsłabszej ścieżki (user bez planu). | `saveProfile(false)` bez `router.push("/programs")` (linia ~447) vs poprawny wzorzec linijkę wyżej (~432) | **✅ DECYZJA [Ty] 2026-07-16: dwa uczciwe wyjścia.** Primary „Przejdź do biblioteki" → `saveProfile(false).then(() => router.push("/programs"))` (wzorzec z gałęzi z sugestią); ghost „Wybiorę później" → `saveProfile(false)` → home (empty-state hero „Zacznij od planu" przejmuje — spójne z O2: zapis profilu, nie czysty `finish()`). Copy ghost celowo bez „pomiń" (to nie skip, to odroczenie). Wchodzi w paczce v3.1 |
| O2 | **Globalny „Pomiń" na E5–E6 gubi wpisane dane bez ostrzeżenia.** User na E6 widzi już kartę planu; „Pomiń" w rogu wygląda jak „pomiń aktywację", a faktycznie `skipAll()` → `finish()` **bez zapisu** — imię, jednostki, cel, priorytet znikają. Na E1–E4 koszt skipa jest niski (mało wpisane), na E5–E6 to realna strata + niezrozumienie. | `skipAll()` nie woła `saveProfile` | Od E5: „Pomiń" zapisuje zebrany profil (`saveProfile(false)` bez aktywacji) zamiast czystego `finish()`; na E6 ukryć globalny „Pomiń" w ogóle (są dwa jawne wyjścia) |

### P2 — zgrzyty zrozumiałości

| # | Problem | Fix |
|---|---|---|
| O3 | **Odmiana: „wybierasz 5 treningi w tygodniu"** (E6, uzasadnienie planu) — dla `effectiveGoal=5` po polsku „5 treningów". Drobiazg, ale w JEDYNYM zdaniu, które buduje zaufanie do rekomendacji | helper: 2–4 → „treningi", 5+ → „treningów" |
| O4 | **E4 (priorytet) nie ma wyjścia bez wyboru** — jedyny ekran bez „Dalej"/per-step „Pomiń"; default `general_fitness` istnieje, ale nie da się go zaakceptować bez tapnięcia opcji (a globalny „Pomiń" nuka cały onboarding — patrz O2). Niespójność z E2/E3 (mają „Pomiń ten krok") | dodać „Pomiń ten krok" (przyjmuje default) jak na E2/E3 |
| O5 | **„będąc na deficycie lub po nim"** (hint „Redukcja / utrzymanie") — żargon; Kasia nie musi znać „deficytu". ToV: prosto, po ludzku | np. „Chcę utrzymać siłę i mięśnie, gdy schudam albo trzymam wagę" |

### P3 — copy i szlify (przy okazji)

- **O6 · E3 nagłówek vs odpowiedzi:** pytanie „Jak długo trenujesz?" a odpowiedzi to poziomy („Zaczynam / Trenuję regularnie / Mam doświadczenie") — ktoś trenujący 3 lata nieregularnie nie wie, co wybrać. Propozycja: „Ile masz doświadczenia?" (hinty zostają, dobrze łapią „wracam po przerwie").
- **O7 · E5 „Najbliższy bezpieczny plan…"** — „bezpieczny" sugeruje, że wybór usera był niebezpieczny. Propozycja: „Najbliższy pasujący plan działa w rytmie…".
- **O8 · E1 brak „po co imię?"** — mikro-nieufność przy pierwszym pytaniu o dane. Propozycja: placeholder/subtekst „Imię (opcjonalnie) — będziemy mówić po imieniu".
- **O9 · E2 „Masa ciała: Mam drążek…"** — user bez drążka może się odbić, a programy bodyweight MAJĄ zamienniki zero-equipment (trainings README). Propozycja hintu: „Drążek mile widziany — każde ćwiczenie ma zamiennik bez sprzętu."
- **O10 · E1 klawiatura vs CTA (weryfikacja na telefonie, nie fix na ślepo):** `autoFocus` otwiera klawiaturę; sprawdzić na iOS PWA, czy „Dalej" i przełącznik jednostek nie lądują pod klawiaturą (overlay ma `overflow-y-auto`, więc pewnie da się doscrollować — pytanie, czy user to wie).
- **O11 · a11y:** opcje E2–E4 to zwykłe buttony bez semantyki grupy (radiogroup/aria-checked); dots słusznie `aria-hidden`. Niska waga przy auto-advance, odnotowane dla porządku.

### Co świadomie zostawiamy w spokoju

Auto-advance na E2–E4 (szybkie, standardowe; mieszanka z „Dalej" na E1/E5 jest ok, bo tam są pola/kontinuum) · brak opcji „1×/tydz." (świadomy floor 2) · dwa pytania na E1 (imię+jednostki to glance-confirm, nie dwie decyzje) · „Pomiń" globalny na E0–E4 (tani escape hatch, koszt danych niski) · eligible = 0 sesji + flaga localStorage (drugi device pokaże onboarding ponownie — akceptowalne do czasu persystencji flagi w `user_settings`, nie warte osobnej roboty teraz).

## 3. Plan zmian — paczka „onboarding v3.1" (~1 wieczór [Claude])

1. **O1** dwa wyjścia fallbacku (decyzja [Ty] 2026-07-16): primary „Przejdź do biblioteki" → `/programs`, ghost „Wybiorę później" → home z zapisem profilu — *przed H2, koniecznie: Z1 testuje dokładnie tę ścieżkę.*
2. **O2** „Pomiń" od E5 zapisuje profil; na E6 znika — *przed H2.*
3. **O3** odmiana liczebnika — *przed H2 (zdanie-wizytówka rekomendacji).*
4. **O4** „Pomiń ten krok" na E4 — *przed H2.*
5. **O5–O9** copy w jednej turze (5 stringów) — *przed H2, tanie.*
6. **O10** test klawiatury na telefonie — *[Ty], przy najbliższym teście PWA.*
7. **O11** a11y radiogroup — *backlog, przy najbliższym refaktorze onboardingu (nie osobno).*

**Weryfikacja po wdrożeniu:** pełny flow E0→E7 + obie gałęzie E6 + skip na każdym kroku (Preview, świeże konto) · tsc/build · potem realna walidacja w **H2 Z1/Z1a** (scenariusz już ma miarę: „jasne, co dalej?" na pustym home + notowanie kroku skipu). Metryki: `onboarding_skipped` per step już trackowane — po launchu dashboard pokaże, gdzie realnie odpadają.

## 4. Ograniczenia audytu

Ekspercki walkthrough ≠ testy z ludźmi — H2 rozstrzyga (n=3–5). Nie oceniałem wizualu (audyt wizualny 2026-07-11 objął onboarding osobno). Kod czytany na stanie repo z 2026-07-16; spec `onboarding-v3.md` usunięty przy porządkach docs — ten audyt dokumentuje stan faktyczny z kodu, nie z speca.
