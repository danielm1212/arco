# Feedback użytkowników — log

> Żywy log surowego feedbacku od realnych osób (poza H2-moderowanymi, które mają własny raport). Zasada: **zapisujemy dosłownie, analizę oddzielamy od cytatu, nie kodujemy od pojedynczego głosu** — ale flagi zbieżne z audytami dostają priorytet.

---

## #1 — 2026-07-08 · pierwszy zewnętrzny user · home/onboarding

**Wersja:** sprzed jakichkolwiek zmian wizji v2 (stan ~S14/N3).

**Feedback (parafraza wierna):**
- „Ciężko się odnaleźć na start."
- „Za dużo się dzieje na ekranie startowym."
- Benchmark usera: **Hevy ma to dobrze ograne** (prostszy start).

**Analiza (Claude, 2026-07-08):**
- Home (`app/page.tsx`, ~389 linii) niesie dziś jednocześnie: day-pills, cel tygodniowy, kartę wskazówek (guidance), program dnia / CTA treningu, mini-bar sesji w toku — dużo warstw na pierwszym ekranie nowego usera.
- Zbieżne z wizją v2 §1.1: **beginner-friendliness = ochrona pętli ekip (Z2)** — zaproszony kumpel-początkujący nie może się odbić od pierwszego ekranu. Ten feedback to dokładnie ten scenariusz, jeszcze zanim ekipy istnieją.
- Zbieżne z `usability-audit.md` (zadania sekcji C testują m.in. start) i z empty-states #1 („Zacznij od planu" — jedna akcja główna).
- Hipoteza kierunkowa (do zwalidowania w H2, NIE do natychmiastowego kodowania): **hierarchia „jedna akcja główna"** — dziś = start treningu; reszta (cel, wskazówki, passa) niżej lub progressive disclosure; tryb „pierwsze 3 wizyty" z uproszczonym home.

**Akcja:**
- [x] Dopisać do scenariusza H2 zadanie „otwórz apkę pierwszy raz i powiedz, co byś zrobił" (first-click test) + pytanie o przeładowanie home. → **zrobione: `docs/scenariusz-h2.md` zadanie Z0** (2026-07-08).
- [ ] Po H2: decyzja [Ty] o uproszczeniu hierarchii home (osobny sprint-kandydat).
- Status: **zalogowane, czeka na H2** (1 głos ≠ redesign; ale flaga poważna, bo dotyka silnika wzrostu).

---

## #2 — 2026-07-11 · właściciel (dogfooding) · logger + UI ogólnie

**Wersja:** sprzed S9-cz.2/S10 (przed splitem Loggera i offline-guardami — część mogła się zmienić przy okazji, wymaga re-testu na aktualnej wersji).

**Feedback (parafraza wierna):**
- „Nie działa scrollowanie w bottomsheecie (zamyka się) — zależy w jakim ćwiczeniu, ale ewidentnie wpływa na to, co jest pod spodem, jak się dotyka bottomsheeta."
- „Podmiana ćwiczenia powinna być chyba w bottom sheet, bo nie ma teraz jak zamknąć."
- „Nie można wpisać kg po przecinku w ciężarze."
- „Możliwość zapisania zdjęcia z nakładką po treningu — coś a la Strava z wynikiem i naszym logo."
- „Na ekranie ćwiczeń top bar nachodzi na datę, jak jest sticky."
- „Mam wrażenie, że przyciski zaznaczenia mogą mieć dziwny touch target — czasem jak chcę zaznaczyć, to odznaczam inny."

**Analiza (Claude, 2026-07-11) — wstępna triaż, do potwierdzenia po repro:**
- **#1 scroll w bottom sheecie zamyka go + przecieka pod spód** — klasyczny konflikt gestów vaul Drawer (swipe-to-close) z wewnętrznym scrollem treści (np. `ExerciseInfoSheet`). Prawdopodobnie brak `data-vaul-no-drag`/scrollable-region na liście instrukcji, albo scroll lock nie łapie touch pod sheetem. **Bug, P1** — realnie przeszkadza w użyciu.
- **#2 podmiana bez zamknięcia** — `SwapPanel` dziś to inline panel pod nagłówkiem karty (nie sheet), zamyka się przez `onClose` po wyborze albo przez ponowny tap „Podmień" — jeśli user tego nie widzi, to UX/afordancja, nie tylko bug. Do rozstrzygnięcia: przenieść do bottom sheet (spójnie z resztą modali) czy dodać jawny „Anuluj"/X w panelu. **P1, decyzja architektury UI.**
- **#3 brak przecinka w wadze** — `parseNum` w `SetRow.tsx` robi `v.replace(",", ".")`, więc logika to obsługuje; problem prawdopodobnie w `<input type="number">` (natywna klawiatura numeryczna blokuje `,` na części telefonów/langów) albo w `inputMode`/`pattern`. **Bug, P1 — core logging, wysoki priorytet.**
- **#4 zdjęcie-nakładka po treningu (a la Strava)** — nowy feature, nie bug. Pasuje do `ekran celebracji` (już mamy dane: wolumen/serie/PR) + logo/marka. Backlog, nie pilne.
- **#5 sticky top bar nachodzi na datę na ekranie ćwiczeń** — prawdopodobnie ten sam rodzaj problemu co PWA safe-area (bdeb477) albo z-index/padding przy `sticky`. **Bug, P2.**
- **#6 dziwny touch target checkboxów** — zbieżne z `wytyczne-designu.md` (44px minimum). Do zmierzenia realnych wymiarów `✓`/checkbox w SetRow i odstępów między wierszami. **Bug, P1 — myli dane usera (zaznacza złą serię!).**

**Akcja — wykonane 2026-07-11 (`c40efb4`):**
- [x] **#1 scroll zamykał sheet** — znaleziona dokładna przyczyna w źródle `vaul`: `Drawer.Content` bez `handleOnly` nasłuchuje gestu przeciągnij-zamknij na CAŁEJ treści, nie tylko na uchwycie. Fix: nowy wspólny `components/ui/bottom-sheet.tsx` z `handleOnly` + `Drawer.Handle` — przeciąganie działa tylko za uchwyt, reszta to zwykły natywny scroll bez ingerencji vaul. Zweryfikowane: wielokrotny scroll w sheecie bez auto-zamknięcia (desktop/mysz — **rekomendowane potwierdzenie na realnym telefonie**, symulacja dotyku w automatyzacji ma ograniczenia).
- [x] **#2 swap bez zamknięcia** — decyzja: bottom sheet (spójnie z resztą apki, właściciel potwierdził kierunek). `SwapPanel` przepisany na wspólny `BottomSheet` — X/tap tła/przeciągnięcie za uchwyt zamykają.
- [x] **#3 brak przecinka w wadze** — przyczyna: `input[type=number]` blokuje przecinek na poziomie DOM niezależnie od `inputMode`. Fix: `type="text"` + lokalny stan wyświetlanego tekstu odsprzęgnięty od sparsowanej wartości (inaczej React nadpisywałby "22," na "22" w trakcie pisania — number ma na to wyjątek w silniku, text nie). Zweryfikowane: wpisanie "22,5" znak-po-znaku → zapis do DB jako `22.5`.
- [x] **#6 dziwny touch target** — ✓ 40px→44px (norma `wytyczne-designu.md`), ✕ dostał pełną 44px hit-area przez padding (nie szerokość), odstęp między wierszami serii 4px→8px (realny mechanizm mylenia rzędów przy tak małym gapie). Zweryfikowane `getBoundingClientRect()`.
- [x] **#4 zdjęcie-nakładka (Strava-style)** — bez zmian, backlog/feature nie bug; NIE dopisane do roadmapy w tej paczce (osobna decyzja [Ty] o zakresie, żeby nie rozjechać commitu bugfixów z nowym feature'em).
- [x] **#5 top bar na dacie** — sprawdzone wizualnie na wszystkich ekranach z widoczną datą (Historia, szczegóły sesji, detal ćwiczenia, home) — **nie reprodukuje się** w przeglądarce (mobile viewport). Jedyny prawdziwy `sticky top-0` w apce (header Loggera) też bez nakładania. Hipoteza: już pokryte przez wcześniejszy fix `pt-[env(safe-area-inset-top)]` na `<body>` (`bdeb477`), który obejmuje WSZYSTKIE sticky headery globalnie — ale to wymaga realnego telefonu z notchem do ostatecznego potwierdzenia (desktop/emulator ma `env()` = 0, nie odtworzy problemu nawet jeśli by istniał).
- Status: **4/6 naprawione i zweryfikowane, 1 nie reprodukuje się (do potwierdzenia na telefonie), 1 świadomie odłożone jako nowy feature**. tsc+build ✓, smoke 3/3.

---

*(kolejne wpisy dopisuj powyżej tej linii w formacie: numer, data, źródło, wersja, cytat/parafraza, analiza, akcja)*
