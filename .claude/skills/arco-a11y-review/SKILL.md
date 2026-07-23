---
name: arco-a11y-review
description: Recenzja dostępności (WCAG 2.1 AA) UI Arco — fokus, kontrast, touch targety, zoom/reflow, aria/czytnik ekranu i długie polskie teksty, zanim ekran trafi do merge. Użyj przy nowym/zmienionym ekranie lub komponencie interaktywnym, przy review A11Y-*/R5b, oraz gdy padnie „czy to jest dostępne / zgodne z WCAG?".
---

# Recenzja dostępności Arco (WCAG 2.1 AA)

Poziom docelowy Arco to **WCAG 2.1 AA** (kanon: `wytyczne-designu.md` — hierarchia konfliktów,
`paleta-arco-warm.md` — kontrasty policzone do AA, Definition of Done w `standard-zadania-agentow.md`).
Ten skill robi JEDNĄ rzecz: recenzuje ekran/komponent pod kątem dostępności. Ruch (reduced-motion)
należy do `arco-motion-review` — tu tylko sprawdzasz, że w ogóle jest obsłużony.

## Postawa

Domyślnie flaguj — approve trzeba zasłużyć. Dostępność to nie „dla niewielu": touch targety,
kontrast i zoom ratują też zmęczonego użytkownika w siłowni w słońcu. Nie oceniaj z samego
desktopu — a11y na gorących trasach potwierdza się w realnej przeglądarce i na telefonie
(patrz `arco-debug`).

## Kryteria AA (naruszenie = finding)

1. **Kontrast.** Tekst ≥ **4.5:1** (duży/nagłówki ≥ 3:1); elementy UI i ikony niosące znaczenie
   ≥ **3:1**. Zero magic-hexów — tylko tokeny z `paleta-arco-warm.md` (na kremie tekst = tylko
   `rust-500+`; sand nie wchodzi do codziennego UI narzędzia). Dark mode: osobna semantyka, nie inwersja.
2. **Touch targety ≥ 44×44 px** — każdy interaktywny element, także ikonowy (✓/✕/±/Back).
3. **Fokus.** `focus-visible` widoczny na wszystkim, co interaktywne; logiczna **kolejność Tab**;
   overlaye i bottom sheety mają **focus trap + Escape + zwrot fokusu na trigger** po zamknięciu
   (reguła overlayów z `CLAUDE.md`; zadania A11Y-01). Nie odbieraj fokusu bez oddania go z powrotem.
4. **Semantyka / czytnik ekranu.** Ikonowe akcje mają `aria-label` (wzorzec: `ChevronLeft` Back ma
   pełną nazwę w `aria-label`). Wybory (dzień/plan, onboarding) to poprawne **radiogroup**
   (role, `aria-checked`, strzałki) — A11Y-02. Stany komunikowane nie samym kolorem.
5. **Zoom i reflow.** Zoom **200%** nie może być zablokowany; treść działa i nie gubi funkcji na
   **320 px** bez poziomego scrolla (klasa buga z `test:overflow` — długie stringi PL rozpychają).
6. **Długie polskie teksty.** „Wyciskanie hantli na ławce skośnej", „Początkujący–średnio­zaawansowany
   · Dom z hantlami · Pośladki i nogi" — mieszczą się/zawijają, nie rozpychają (blizny fieldset/reps).
7. **Reduced-motion obsłużony** (szczegół i bar: `arco-motion-review`) — tu tylko: czy nowy ruch
   degraduje się do zmiany stanu bez animacji.

## Triggery — recenzuj na widok

- nowy/zmieniony ekran lub komponent interaktywny (przycisk, pole, sheet, radiogroup, lista)
- ikonowa akcja bez tekstu (Back, ✓/✕, menu) — sprawdź `aria-label`
- nowy overlay/bottom sheet — sprawdź trap/Escape/zwrot fokusu
- nowy kolor/kontrast poza tokenami; nowy długi string PL na wąskiej kolumnie

## Jak weryfikować (nie z pamięci)

- **Kontrast:** policz z tokenów / narzędziem, nie „na oko".
- **Fokus i Tab:** przejdź klawiaturą przez ekran w realnej przeglądarce; sheet otwórz i zamknij,
  sprawdź, gdzie wraca fokus.
- **Zoom/reflow:** 200% + viewport 320 px; brak poziomego overflow (guard: `npm run test:overflow`).
- **Czytnik:** sprawdź, że ikonowe akcje i radiogroup są ogłaszane sensownie.
- **PWA:** gorące trasy potwierdź na telefonie — nie tylko desktop Chromium.

## Wynik

Lista findingów AA (kryterium + gdzie + jak naprawić), najcięższe pierwsze; albo jawny approve
z zaznaczeniem, co sprawdzono (fokus/kontrast/zoom/aria). Domknięcie a11y całych ekranów idzie
przez sprint **R5b** (`A11Y-01/02/03`) — ten skill pilnuje, żeby nowy kod nie dokładał długu.
