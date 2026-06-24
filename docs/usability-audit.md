# Arco — profesjonalny audyt użyteczności (przed deployem)

**Metoda:** ocena heurystyczna (10 heurystyk Nielsena) + cognitive walkthrough kluczowych zadań
+ audyt dostępności (WCAG 2.1 AA), oparte na realnym kodzie po polish P1–P5.
**Zastrzeżenie:** to ekspercki przegląd, nie moderowane testy z użytkownikami. Po deployu zalecany
1 krótki test na 3–5 realnych użytkownikach (zadania niżej).

**Skala:** 🔴 blocker (naprawić przed deployem) · 🟠 ważne · 🟡 średnie · 🟢 drobne/uznane za OK.

---

## A. Podsumowanie wykonawcze

Produkt jest dojrzały i spójny: logger w standardzie Hevy (live pasek, „poprzednio", rest, RPE,
steppery), nawigacja bottom-tab, offline-outbox, postępy z trendami, biblioteka programów,
zdjęcia postępu. **Brak blockerów funkcjonalnych.** Przed deployem warto domknąć kilka kwestii
**dostępności** (2 szybkie, realne) i parę drobiazgów UX. Większość ryzyk to „polish", nie wady.

**Pre-deploy P0 (szybkie, realne):**
1. 🔴 viewport blokuje zoom (`maximumScale: 1`) — łamie WCAG 1.4.4.
2. 🔴 dark mode zdefiniowany, ale **nigdy nie aktywny** (klasa `.dark` nie jest ustawiana) — albo wepnij, albo usuń, by nie udawać funkcji.
3. 🟠 focus-visible na customowych przyciskach ikonowych (✓/✕/↑↓/typ serii/rest ±) — dostępność klawiatury.

---

## B. Heurystyki Nielsena

1. **Widoczność stanu systemu** — 🟢 mocno: live pasek sesji (czas/objętość/serie), wskaźnik
   offline/sync, rest 3-2-1, toasty. 🟡 brak globalnego wskaźnika przejść między trasami
   (server components renderują „twardo") — przy wolnej sieci klik w zakładkę nie daje od razu
   feedbacku. *Rek.:* `loading.tsx` (skeleton) dla `/progress`, `/history`, `/session`.

2. **Zgodność z realnym światem** — 🟢 język PL, terminologia siłowni (serie/powt./przerwa/RIR).
   🟡 instrukcje ćwiczeń po **angielsku** (free-exercise-db) — zgrzyt dla PL.

3. **Kontrola i wolność użytkownika** — 🟠 **brak „undo"** po usunięciu serii/ćwiczenia
   (usuwasz ✕ bez potwierdzenia i bez cofnięcia). Sesja/program mają confirm, seria/ćwiczenie nie.
   *Rek.:* toast „Usunięto · Cofnij" (4 s) na usunięcie serii/ćwiczenia.

4. **Spójność i standardy** — 🟢 jeden system tokenów, shadcn, spójne karty/przyciski, bottom-nav
   zgodny ze wzorcem iOS. 🟢 wzorce z Mobbina (Hevy/Centr) odwzorowane.

5. **Zapobieganie błędom** — 🟠 finish sesji ma offline-guard, ale **brak potwierdzenia
   „Zakończyć trening?"** przy niezaliczonych seriach (mis-tap kończy). 🟡 pola liczbowe bez
   górnych limitów (np. ciężar 99999) — drobne.

6. **Rozpoznawanie zamiast przypominania** — 🟢 „Sugerowane dziś", placeholdery „poprzednio”,
   podgląd programu, nagłówki kolumn. 🟢 bardzo dobre.

7. **Elastyczność/efektywność** — 🟢 steppery ±, swipe? (brak), duplikacja programów, freestyle.
   🟡 brak gestów (swipe-to-delete serii) i reorder ćwiczeń w sesji (jest w builderze).

8. **Estetyka i minimalizm** — 🟢 czysto, mobilnie, jeden akcent. 🟡 karta ćwiczenia w loggerze
   gęstnieje (meta + „poprzednio” + hint + talerze + rest + notatka + nagłówki + serie) — przy
   wielu elementach robi się długa; rozważyć zwijanie (np. talerze/hint za tap).

9. **Diagnoza błędów** — 🟢 toasty z konkretnym komunikatem; offline jasno zakomunikowany.
   🟡 puste stany są, ale lakoniczne — można dodać 1 CTA („Zacznij trening”).

10. **Pomoc i dokumentacja** — 🟢 onboarding first-run + „jak wykonać” (sheet). 🟢 wystarczające
    dla tej klasy aplikacji.

---

## C. Cognitive walkthrough — kluczowe zadania

- **Pierwszy trening (nowy user):** welcome → home → „Ustaw aktywny” → Start dnia → logger. 🟢 płynne.
  🟡 między „Ustaw aktywny” a listą dni nie ma mikro-potwierdzenia (program się rozwija — OK, ale
  bez animacji łatwo przeoczyć).
- **Logowanie serii na siłowni (rękawiczki, słaby zasięg):** ✓/steppery/rest/offline-outbox. 🟢 bardzo dobre.
- **Podmiana ćwiczenia (brak sprzętu):** ⇄ → lista → wybór. 🟢; 🟡 brak podglądu „jak wykonać” zamiennika przed wyborem.
- **Sprawdzenie progresu:** Postępy → okres → „Postęp siły” → rekord → zakładki metryk. 🟢 spójne.
- **Edycja programu:** /programs → duplikuj → reorder/sloty. 🟢.

---

## D. Dostępność (WCAG 2.1 AA)

- 🔴 **1.4.4 Resize text / zoom** — `viewport.maximumScale = 1` blokuje pinch-zoom. Usuń `maximumScale`/`userScalable`.
- 🔴 **Dark mode martwy** — `.dark` zdefiniowany, nigdy nie ustawiany (brak toggla i auto z `prefers-color-scheme`). Efekt: zawsze jasny motyw. Wepnij `prefers-color-scheme` (lub toggle), albo usuń warstwę dark, by nie była mylącym „martwym kodem”.
- 🟠 **2.4.7 Focus visible** — customowe przyciski ikonowe (✓/✕ w `SetRow`, ↑/↓ w builderze, ± rest, typ serii) nie mają `focus-visible` ringu. Dodać klasę focus-ring.
- 🟡 **Kontrast** — `text-warning`/`text-success` na `bg-*/10` i `text-[9px]/[10px]` (paski dni, etykiety) — zweryfikować ≥4.5:1 (AA) / rozważyć ciemniejszy odcień lub większy rozmiar.
- 🟢 **alt** na zdjęciach jest; `lang="pl"`; tap-targety 44px (Button), inputy `inputMode`; aria-label na ikonach nawigacji i ± .

---

## E. Pre-deploy checklist (go / no-go)

**Naprawić przed deployem (P0/P1 — szybkie):**
- [ ] Usuń `maximumScale` z viewportu (zoom). *(a11y, 1 linia)*
- [ ] Dark mode: wepnij `prefers-color-scheme` → klasa `.dark` (lub usuń warstwę). *(spójność)*
- [ ] `focus-visible` na ikonowych przyciskach loggera/buildera. *(a11y)*
- [ ] Potwierdzenie „Zakończyć trening?” gdy są niezaliczone serie. *(zapobieganie błędom)*
- [ ] Undo-toast po usunięciu serii/ćwiczenia. *(kontrola użytkownika)*

**Można po deployu (P2):**
- [ ] `loading.tsx` (skeletony) dla cięższych tras.
- [ ] PL tłumaczenia instrukcji top-ćwiczeń.
- [ ] Zwijanie gęstych elementów karty ćwiczenia (talerze/hint).
- [ ] Podgląd „jak wykonać” w panelu podmiany.
- [ ] Reorder ćwiczeń w sesji / swipe-to-delete.

**Walidacja:** po deployie 1 sesja testów z 3–5 osobami na zadaniach z sekcji C; mierz ukończenie
i miejsca wahania (szczególnie: pierwszy trening, podmiana, odczyt postępów).

---

*Werdykt: gotowe do deployu po domknięciu 5 punktów P0/P1 (wszystkie szybkie). Reszta to iteracja po pierwszym wypuszczeniu.*
