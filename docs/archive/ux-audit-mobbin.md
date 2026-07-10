# Arco — audyt UX/UI na bazie Mobbin (przed pierwszym deployem)

> Porównanie kluczowych ekranów Arco do najlepszych wzorców z rynku (Mobbin, iOS).
> Każda rekomendacja ma odnośnik do realnego wzorca. Priorytety: P1 (najwyższy ROI) → P5.

Referencje (Mobbin):
- Hevy — logger: https://mobbin.com/screens/3c0f68f3-69ee-4892-bce4-3939fcce734e
- Hevy — szczegóły ćwiczenia: https://mobbin.com/screens/80f164aa-c011-4469-ba7a-158116427cab
- Fitbod — logger: https://mobbin.com/screens/f21f8735-8f51-442c-b179-165bfd8f66d2
- Fitbod — heatmapa regeneracji: https://mobbin.com/screens/e43dc37c-cbf2-490b-a05c-a71bbdde2f88
- Ladder — bottom-sheet logowania: https://mobbin.com/screens/3daed3ec-2832-48af-9f73-0aab0d428f51
- Centr — home/dzień: https://mobbin.com/screens/e7523bd0-c371-441a-9971-c8abf5f81578
- Bevel — postęp siły: https://mobbin.com/screens/2bb47d83-d7d3-4ccb-9852-afbdee9dc32e
- Aaptiv — streak/plan dnia: https://mobbin.com/screens/7942256f-372a-4021-8533-5caf41a40def
- Runna — home z tygodniem: https://mobbin.com/screens/be9b0bcc-6c28-4abf-bde0-6b046df1207d
- Tonal — staty ćwiczenia: https://mobbin.com/screens/49b9079a-87e6-434d-802e-25a9a9858077
- Tempo — postęp planu: https://mobbin.com/screens/a0f3e344-7fef-4a70-89f7-05fe6183e6fd

---

## 1. Logger (rdzeń, 95% czasu) — vs Hevy / Fitbod / Ladder / Tonal

Co robią najlepsi, czego Arco nie ma:

- 🔴 **Live pasek podsumowania u góry** — Hevy trzyma sticky `Czas · Objętość (Σ kg) · Serie`, liczone na żywo. Arco nie pokazuje czasu trwania ani narastającej objętości w trakcie. **Rek.:** sticky header sesji z licznikiem czasu + Σ objętości + liczbą zaliczonych serii.
- 🟠 **Nagłówki kolumn w tabeli serii** — Hevy: `SERIA · POPRZEDNIO · KG · POWT · ✓`. Arco ma gołe wiersze bez nagłówka — przy pierwszym kontakcie nie wiadomo, co jest czym. **Rek.:** drobny wiersz nagłówka nad seriami.
- 🟠 **„Poprzednio" jako widoczna kolumna** (Hevy) zamiast samego placeholdera — wartość z ostatniej sesji widoczna obok, tap = skopiuj do pola. Arco ma placeholder (działa, ale mniej czytelne). **Rek.:** rozważyć osobną, klikalną wartość „60×8 →".
- 🟠 **Notatki per ćwiczenie** — Hevy/Fitbod mają „Add notes here". Arco nie ma. **Rek.:** opcjonalna notatka na ćwiczeniu (i na sesji).
- 🟡 **Rest timer widoczny per ćwiczenie** („Przerwa: 2:30", tap → edycja). Arco pokazuje timer dopiero po ✓; nie widać/nie zmienisz restu z poziomu ćwiczenia. **Rek.:** etykieta restu na karcie ćwiczenia + szybka edycja.
- 🟡 **Menu „…" na ćwiczeniu** — replace / add warmup / remove / reorder w jednym miejscu (Hevy). Arco ma swap + usuń osobno; brak „dodaj serię rozgrzewkową" jednym ruchem.
- 🟢 Potwierdzone dobre decyzje Arco: ✓ na serii, RPE inline, ± steppery, jawny typ serii (W) — zgodne z Fitbod/Ladder.

## 2. Home / „dziś" — vs Centr / Aaptiv / Runna / Tempo

- 🟠 **Poziomy pasek tygodnia** (Pn–Nd, dziś podświetlony, kropki = dni treningowe) u góry home — Centr/Aaptiv/Runna mają to jako kotwicę. Arco trzyma aktywność dopiero na /progress. **Rek.:** kompaktowy week-strip + streak na home.
- 🟠 **Bogatszy kafel „Sugerowane dziś"** — Centr robi duży featured card z obrazkiem/progresem i „Next:". Arco ma tekstowy pasek. **Rek.:** kafel z liczbą ćwiczeń, szac. czasem i podglądem pierwszych ruchów.
- 🟡 **Streak na home** (Aaptiv „1 DAY STREAK", pomarańczowy) — Arco pokazuje tylko na /progress.

## 3. Postępy — vs Bevel / Fitbod / Tempo

- 🟠 **„Postęp siły" jako lista przeglądowa** — Bevel: kafle per ćwiczenie z mini-sparklinem + liczbą sesji, bez wchodzenia w szczegóły. Arco ma trend dopiero po wejściu w rekord. **Rek.:** sekcja „Postęp siły" na /progress (lista top ćwiczeń + sparkline + Δ).
- 🟡 **Przełącznik okresu** (tydz. / mies. / wszystko) — Tempo ma zakładki tygodni. Arco liczy sztywno 7 dni. **Rek.:** toggle okresu dla statów i bilansu partii.
- 🟡 **Heatmapa partii na sylwetce** — Fitbod koloruje ciało wg obciążenia/regeneracji. Arco ma paski (dobre), ale sylwetka to mocny, „premium" akcent i nasz wyróżnik (mamy dane sets-per-muscle). **Rek.:** docelowo SVG sylwetki (większy nakład — osobny krok).

## 4. Szczegóły ćwiczenia — vs Hevy / Tonal / Runna

- 🟠 **Zakładki metryk** — Hevy/Tonal: `Najcięższa / e1RM / Najlepsza seria` + wykres z wyborem okresu. Arco ma jeden trend. **Rek.:** przełącznik metryki nad wykresem na /exercise.
- 🟢 Arco ma już: zdjęcia how-to + instrukcje (sheet), historię, trend — pokrywa się z Hevy „How to/History".
- 🟡 (opcjonalnie) toggle Animacja/Wideo (Runna) — Arco ma statyczne zdjęcia; wideo to nice-to-have, raczej post-MVP.

## 5. Onboarding / puste stany (Arco: brak)

- 🟠 Pierwsze uruchomienie wrzuca usera od razu na home z presetami, bez kontekstu. **Rek.:** lekki first-run (1–3 ekrany): jednostki → wybór programu → opcjonalnie waga startowa. Wzorzec: krótkie, pomijalne (Aaptiv/Centr).
- 🟡 Puste stany z podpowiedzią akcji (historia/postępy gdy 0 sesji) — częściowo są, dopieścić copy.

## 6. Przekrojowe (z poprzedniego audytu, nadal aktualne)

- 🟡 Stany ładowania dla akcji klienckich (picker, swap, upload zdjęcia).
- 🟡 Instrukcje ćwiczeń po angielsku (free-exercise-db) → PL dla topowych.
- 🟢 Bottom-nav, tap-targety 44px, dark mode, offline-outbox — już są.

---

## Plan „polish przed deployem" (propozycja kolejności)

- **P1 — Logger polish:** live pasek (czas/objętość/serie) · nagłówki kolumn · notatki ćwiczenia · etykieta+edycja restu. *Najwięcej „czuć" w rdzeniu.*
- **P2 — Home:** week-strip + streak + bogatszy kafel „Sugerowane dziś".
- **P3 — Postępy:** sekcja „Postęp siły" (lista + sparkline) · przełącznik okresu.
- **P4 — Szczegóły ćwiczenia:** zakładki metryk (Najcięższa/e1RM/Najlepsza).
- **P5 — Onboarding** lekki + dopieszczone puste stany + (osobno) heatmapa-sylwetka, PL instrukcje.

*Rekomendacja: P1 → P2 → P3 przed deployem; P4/P5 mogą iść po pierwszym wypuszczeniu.*
