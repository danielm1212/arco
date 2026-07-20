# Arco — standard zadania dla agentów

**Aktualizacja:** 2026-07-20

Ten standard ma sprawić, że agent może podjąć zadanie bez odgadywania intencji produktu.
`plan-sprintow-2026-07.md` ustala kolejność, `backlog-produktu.md` zakres, a ten dokument sposób wykonania.

## 1. Obowiązkowy brief zadania

Każde zadanie gotowe do podjęcia zawiera:

1. **ID i wynik użytkownika** — co po zmianie będzie łatwiejsze lub bezpieczniejsze;
2. **dowód problemu** — feedback, repro, audyt, metryka albo jawna decyzja produktu;
3. **zakres** — konkretne ekrany, dane i zachowania;
4. **poza zakresem** — czego agent nie ma „ulepszać przy okazji”;
5. **zależności** — migracje, inne zadania, decyzje i dane testowe;
6. **stany UX** — loading, empty, error, offline, success oraz partial-data, jeśli dotyczy;
7. **kryteria akceptacji** — obserwowalne, bez „wygląda dobrze”;
8. **testy** — unit/integration/E2E, viewporty i urządzenie;
9. **ryzyka** — dane, RLS, PWA, dostępność, wydajność i stary cache;
10. **dokumenty do aktualizacji** — HANDOFF, backlog, plan i log koordynacji.
11. **dowód wizualny** — dla zmiany UI lista wymaganych zrzutów przed/po, viewportów i stanów.

## 2. Kolejność pracy

1. Przeczytaj `CLAUDE.md`, `docs/HANDOFF.md`, aktywny sprint i odpowiadający user flow.
2. Sprawdź stan Git i rezerwacje w `docs/koordynacja-agentow.md`.
3. Zweryfikuj problem w kodzie lub na urządzeniu. Nie implementuj na podstawie samej starej notatki.
4. Zapisz minimalny plan i zarezerwuj dotykane obszary.
5. Implementuj pionowo: dane → zachowanie → UI → stany → testy.
6. Uruchom jakość proporcjonalną do ryzyka. Jeden build naraz.
7. Wykonaj regresję flow źródłowego i sąsiednich powrotów.
8. Uaktualnij źródła prawdy i zwolnij rezerwację.

## 3. Definition of Ready

Zadania nie zaczynamy, jeżeli:

- nie wiadomo, który dokument rozstrzyga konflikt;
- brakuje decyzji zmieniającej model danych lub zachowanie użytkownika;
- nie da się opisać mierzalnego Done;
- zakres miesza pilny bug z niepowiązaną funkcją;
- wymagany materiał techniczny nie ma review człowieka;
- drugi agent edytuje ten sam obszar bez uzgodnienia.

## 4. Definition of Done

Zadanie jest skończone, gdy:

- wynik użytkownika i wszystkie kryteria akceptacji są spełnione;
- stany empty/loading/error/offline/success są świadomie obsłużone;
- touch targety, fokus, safe area, reduced motion i długie polskie teksty są sprawdzone;
- nie ma utraty danych, podwójnych zapisów ani wycieku między kontami;
- lint, właściwe testy, walidatory i build są zielone;
- gorący flow przeszedł 320/375/393 px oraz wskazane urządzenie;
- zmiana UI ma zrzuty success oraz właściwych empty/loading/error/offline, porównane z sąsiednimi
  ekranami pod kątem hierarchii, odstępów, ikon, CTA i safe area;
- migracja ma RLS, test wielokontowy i procedurę wdrożenia, jeśli dotyczy;
- `HANDOFF.md`, plan/backlog i `koordynacja-agentow.md` pokazują ten sam stan;
- dane testowe usunięto wyłącznie po znanych identyfikatorach.

## 5. Szablon wpisu wykonawczego

```md
### ID — nazwa

**Wynik użytkownika:**
**Dowód problemu:**
**Zakres:**
**Poza zakresem:**
**Zależności:**

**Kryteria akceptacji:**
- [ ]

**Stany UX:** loading / empty / error / offline / success
**Testy:**
**Urządzenia:**
**Zrzuty przed/po:**
**Ryzyka:**
**Dokumenty po wykonaniu:**
```

## 6. Zasady UX/UI dla review

- W 2 sekundy widać główną akcję.
- Nowy element na Home wymaga wskazania, co znika lub kiedy element sam znika.
- 3D i motion wzmacniają moment, nie zastępują hierarchii.
- Ten sam wzorzec ma tę samą semantykę: Back, minimalizacja, X, cel tygodniowy i zakończenie.
- Nie używamy modala do każdej decyzji; stosujemy go, gdy koszt błędu jest realny.
- Informacja techniczna ćwiczenia wymaga zgodności tekstu i mediów oraz review człowieka.
- Rozwiązanie PWA oceniamy na telefonie, nie wyłącznie w desktopowym Chromium.
- Zrzut pojedynczego komponentu nie wystarcza: oceniamy cały ekran i przynajmniej jeden powrót
  do ekranu sąsiedniego, żeby wykryć zmianę gęstości, chrome lub hierarchii.
- Pełny redesign nie może ukrywać poprawki użyteczności. Najpierw dowód problemu i flow,
  potem estetyka w ramach zaakceptowanych tokenów.
