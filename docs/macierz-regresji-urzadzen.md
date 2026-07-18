# Macierz regresji urządzeniowej — checkpoint po R1b/R2/R2.1/Done/R5a

> **Data:** 2026-07-18 · **Cel:** jedno przejście (~30 min na urządzeniu głównym) zamiast
> pięciu rozproszonych checklist z dziennika. Zamyka ryzyko nr 2 z HANDOFF (brak jednej
> macierzy) i jest bramką `checkpoint` z planu (przed R3a).
> **Jak używać:** przejdź scenariusze 1–8 po kolei na urządzeniu A; na B i C tylko
> scenariusze oznaczone ●. Wynik wpisz w tabeli na końcu (✅/⚠️/❌ + notatka), plik
> zostaje w repo jako zapis checkpointu.

## Urządzenia

| Kod | Urządzenie | Zakres |
|---|---|---|
| **A** | iPhone PWA (standalone, z ekranu głównego) | pełny przebieg 1–8 |
| **B** | iPhone Safari (karta przeglądarki) | tylko ● |
| **C** | Desktop Arc/Chromium | tylko ● + klawiatura |
| **D** | Android Chrome | **świadoma luka** — brak urządzenia; systemowy Back i PWA do sprawdzenia przy okazji (znajomy telefon / BrowserStack, ~1 h) |

Przed startem na A: **wymuś świeży service worker** — zamknij PWA, otwórz ponownie,
sprawdź brak błędów przy starcie (scenariusz „stary cache po deployu" z audytu R2.1).

## Scenariusze

### 1. Chrome i nawigacja (R1a/R2) ●

- [ ] Bottom bar: Trening / Postępy / Historia / Ekipa — przełączanie bez utraty stanu.
- [ ] Subnav Dziś | Plany przełącza przez replace (Back nie cofa po podwidokach).
- [ ] Przejście Dziś → Plany: header i subnav NIE znikają podczas ładowania (R2.1).
- [ ] Postępy: Trening | Ciało — tytuł huba zostaje „Postępy" przy zmianie segmentu.
- [ ] Deep link do /settings → Back = bezpieczny fallback, nie wyjście z aplikacji.

### 2. Home: badge celu i sheet tygodnia (R2.1 — NOWE) ●

- [ ] Badge w headerze wygląda jak akcja (target ≥ 44 px), terracotta gdy cel zrobiony.
- [ ] Tap otwiera sheet: X z Y treningów, 7 płomieni dni, passa, link do Historii.
- [ ] Zamknięcie: Escape (C), tap w overlay, swipe w dół — wszystkie trzy drogi.
- [ ] Po zamknięciu fokus wraca na badge (C: Tab/Enter/Space otwierają ponownie).
- [ ] Home bez aktywnej sesji: hero jest PIERWSZYM modułem po subnavie; CTA „Zacznij
      trening" w całości nad floating navem (test małej wysokości: iPhone mini/SE
      albo Safari z paskiem narzędzi).

### 3. Hero i start treningu (R2/R2.1) ●

- [ ] Hero: jedna intencja — CTA dominuje; nazwa planu to osobny, łatwy tap (≥44 px).
- [ ] Copy rotacji: „Następny w rotacji A → B → C" (bez żargonu o mechanice).
- [ ] Stopka: „Podgląd ćwiczeń" i „Zmień" wyraźne, „Bez planu" wyciszone.
- [ ] „Zmień" otwiera sheet dni; start z wybranego dnia działa.

### 4. Integralność sesji i szkice (R1b — KRYTYCZNE, retest fixa outboxu)

- [ ] Start treningu → logger bez bottom nav → ChevronDown minimalizuje → mini-bar
      widoczny na wszystkich tabach → wznowienie z mini-bara.
- [ ] Zaloguj serię, wpisz wartości i NATYCHMIAST tapnij ✓, po czym od razu
      zminimalizuj i wróć — seria MA zostać odznaczona jako ukończona (regresja
      lost-update z 2026-07-17, fix `e855cf0`).
- [ ] Ubij PWA w trakcie logowania (swipe-kill) → otwórz ponownie → szkic serii
      i notatka odzyskane.
- [ ] Próba drugiego startu (np. z Plany), gdy sesja otwarta → wznowienie, nie duplikat.
- [ ] Edycja formularza (pomiar ciała) → wyjście systemowym gestem → dirty guard pyta.

### 5. Ekran Done (feedback [Ty]) 

- [ ] Liczba-bohater nabija się od 0 (i NIE animuje przy reduced-motion, jeśli włączone).
- [ ] Postęp celu jako cichy tekst, bez drugiego przycisku.
- [ ] Zakończenie sesji bez zaliczonych serii → bez celebracji zer (hero i staty ukryte).
- [ ] Podwójny szybki tap „Zakończ" → jedna celebracja, bez błędu.

### 6. Wyszukiwarka PL (R5a) ●

W pickerze ćwiczeń (logger → dodaj ćwiczenie) wpisz kolejno:

- [ ] „martwy" → Martwy ciąg klasyczny wysoko.
- [ ] „ohp" → Wyciskanie żołnierskie (OHP).
- [ ] „lawka" (bez ogonków!) → wyniki z „ławką" (diakrytyki, `9eb9835`).
- [ ] „allahy" → Allahy (Cable Crunch).
- [ ] „wyciskanie" → ranking: frazy zaczynające się od „Wyciskanie" nad substringami.
- [ ] Polskie nazwy widoczne też w: loggerze (karty), historii sesji, szczegółach
      programu, hero home i na stronie ćwiczenia.

### 7. Sheety i safe area (fundament) 

- [ ] Dowolny bottom sheet: tło NIE przewija się pod spodem, nie da się kliknąć pod
      overlayem, brak skoku widoku po zamknięciu.
- [ ] Floating nav: 12 px marginesu po bokach i od dołu, nad safe area (home indicator).

### 8. Insight przeglądu planu (R2.1)

- [ ] Jeśli masz ≥12 sesji w aktywnym planie: insight widoczny od pierwszego renderu
      (bez „doklejenia" po chwili); X zamyka; po odświeżeniu nie wraca.

## Wyniki

| # | Scenariusz | A (iPhone PWA) | B (Safari) | C (Desktop) | D (Android) | Notatki |
|---|---|---|---|---|---|---|
| 1 | Chrome i nawigacja | | | ⚠️ część | luka | C: subnav Dziś\|Plany, bottom bar, header trwa przy ładowaniu ✓; Postępy Trening\|Ciało i deep-link Back nie sprawdzone |
| 2 | Badge + sheet tygodnia | | | ✅ | luka | C: badge 44px + aria-label pełny, sheet (1/2, 7 płomieni, passa, link Historia), Escape zamyka, fokus wraca. Swipe/overlay tylko na dotyku |
| 3 | Hero i start | | | ✅ | luka | C: empty state (dumbbell 3D, „Bez planu" muted) + start freestyle → logger. Hero „Następny w rotacji" nie pokryty (brak aktywnego planu na świeżej bazie) |
| 4 | Integralność sesji | | — | — | luka | |
| 5 | Ekran Done | | — | ✅ | luka | C: Done sesji-zero — status jako cichy tekst, nie przycisk ✓ |
| 6 | Wyszukiwarka PL | | | | luka | |
| 7 | Sheety i safe area | | — | ⚠️ część | luka | C: sheet tygodnia — overlay przyciemnia tło, Escape zamyka ✓; safe area tylko na urządzeniu |
| 8 | Insight planu | | — | — | luka | |

**Pre-check C (Claude, 2026-07-18):** desktop/Chromium na prod-buildzie (`next start`),
320×568 i 375×812, konsola czysta na wszystkich ekranach, brak przewijania poziomego,
badge mieści się na 320 px. To NIE zastępuje bramki — **A (iPhone PWA) pozostaje wymagane
[Ty]**; pre-check tylko wychwytuje problemy desktop-level przed przebiegiem urządzeniowym.

**Po przejściu:** wynik + data do dziennika koordynacji (jedna linia), ❌/⚠️ jako
zgłoszenia do naprawy przed R3a. Wypełniona macierz = zamknięty checkpoint z planu
i ryzyko nr 2 z HANDOFF przechodzi w proces (powtarzamy po R3b i R4, jak chce plan).
