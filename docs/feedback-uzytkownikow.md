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
- Zbieżne z wizją v2 §1.1: **beginner-friendliness = ochrona pętli podów (Z2)** — zaproszony kumpel-początkujący nie może się odbić od pierwszego ekranu. Ten feedback to dokładnie ten scenariusz, jeszcze zanim pody istnieją.
- Zbieżne z `usability-audit.md` (zadania sekcji C testują m.in. start) i z empty-states #1 („Zacznij od planu" — jedna akcja główna).
- Hipoteza kierunkowa (do zwalidowania w H2, NIE do natychmiastowego kodowania): **hierarchia „jedna akcja główna"** — dziś = start treningu; reszta (cel, wskazówki, passa) niżej lub progressive disclosure; tryb „pierwsze 3 wizyty" z uproszczonym home.

**Akcja:**
- [x] Dopisać do scenariusza H2 zadanie „otwórz apkę pierwszy raz i powiedz, co byś zrobił" (first-click test) + pytanie o przeładowanie home. → **zrobione: `docs/scenariusz-h2.md` zadanie Z0** (2026-07-08).
- [ ] Po H2: decyzja [Ty] o uproszczeniu hierarchii home (osobny sprint-kandydat).
- Status: **zalogowane, czeka na H2** (1 głos ≠ redesign; ale flaga poważna, bo dotyka silnika wzrostu).

---

*(kolejne wpisy dopisuj powyżej tej linii w formacie: numer, data, źródło, wersja, cytat/parafraza, analiza, akcja)*
