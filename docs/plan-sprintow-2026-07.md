# Arco — aktywny backlog i kolejne sprinty

**Aktualizacja:** 2026-07-16

**Źródło prawdy dla kolejności prac**

## Priorytety

1. Stabilność i użyteczność rdzenia.
2. Ochrona danych i możliwość odtworzenia systemu.
3. Test z osobami spoza projektu.
4. Publiczne konta i zgodność prawna.
5. Launch, monetyzacja i dopiero potem publiczna Ekipa.

## Sprint 15 — stabilność PWA i regresja UX

**Czas:** 1–2 dni

**Cel:** domknąć zachowanie warstw mobilnych i upewnić się, że ostatnie poprawki nie wprowadziły regresji.

- Przejść wszystkie bottom sheety: programy, wybór dnia, trening i pozostałe wystąpienia.
- Sprawdzić iPhone PWA, Safari, Arc/Chromium, Android i desktop.
- Potwierdzić: brak skoku, brak klikania pod overlayem, brak scrollowania tła, poprawny scroll treści sheetu.
- Dodać focus trap i zwrot fokusu do elementu, który otworzył sheet.
- Sprawdzić Escape, overlay, przycisk zamknięcia, swipe w dół i `prefers-reduced-motion`.
- Sprawdzić sticky header treningu, toasty i floating nav z safe area.
- Zweryfikować aktualizację PWA oraz zachowanie starego cache po deployu.
- Uruchomić pełny gate jakości.

**Done:** pełna macierz przechodzi bez blockerów, a dialog jest obsługiwalny dotykiem i klawiaturą.

## Sprint 16 — bezpieczeństwo operacyjne

**Czas:** 2–4 dni

**Cel:** udowodnić, że produkcyjne dane można odzyskać i bezpiecznie wdrażać zmiany.

- Wykonać backup bazy i Storage.
- Odtworzyć backup do odizolowanego środowiska i zachować dowód testu.
- Spisać checklistę rollbacku aplikacji, migracji i Storage.
- Przejrzeć nagłówki, CSP i zależności; usunąć niepotrzebną zależność CSP od `raw.githubusercontent.com`, jeżeli produkcja jej nie używa.
- Zweryfikować prywatność bucketów i uprawnienia wszystkich aktualnych tabel.
- Ustalić rytm backupów i właściciela okresowego testu restore.

**Done:** restore jest wykonany, nie tylko opisany, a rollback da się przeprowadzić z dokumentu.

## Sprint 17a — onboarding v3.1 (naprawa przed H2) ✅ ZROBIONE 2026-07-16

**Czas:** ~1 wieczór [Claude] + krótka weryfikacja [Ty] na telefonie

**Wejście:** `docs/audyt-onboardingu-2026-07.md` (cognitive walkthrough, 2026-07-16) — werdykt: onboarding ~85% zrozumiały, 2 realne pułapki (P1) i garść zgrzytów zdejmowalnych w jednej turze.

**Cel:** zamknąć obie pułapki P1 przed H2, bo Z1/Z1a w scenariuszu H2 testuje dokładnie te ścieżki — nie chcemy tracić sesji testowej na znany już bug.

- O1 — fallback E6 dostaje **dwa uczciwe wyjścia** (decyzja [Ty] 2026-07-16): primary „Przejdź do biblioteki" → realna nawigacja na `/programs`; ghost „Wybiorę później" → home z zapisanym profilem (empty-state hero przejmuje).
- O2 — globalny „Pomiń" od E5 zapisuje zebrany profil zamiast go gubić; na E6 znika (są już dwa jawne wyjścia z O1).
- O3 — poprawka odmiany liczebnika w zdaniu-uzasadnieniu rekomendacji („5 treningów", nie „5 treningi").
- O4 — „Pomiń ten krok" na E4 (przyjmuje default), spójnie z E2/E3.
- O5–O9 — pięć poprawek copy w jednej turze (żargon „deficyt", nagłówek E3, „bezpieczny plan", brak kontekstu przy imieniu na E1, hint o zamiennikach bez drążka).
- **Poza tym sprintem:** O10 (test klawiatury E1 na telefonie) zostaje przy Tobie przy najbliższym teście PWA; O11 (a11y radiogroup) idzie do backlogu, przy najbliższym refaktorze onboardingu — nie warte osobnej paczki teraz.

**Done:** pełny flow E0→E7 + obie gałęzie E6 + skip na każdym kroku zweryfikowane w Preview na świeżym koncie, tsc/build czyste. Realna walidacja i tak czeka na H2 Z1/Z1a — ta paczka usuwa tylko znane, martwe pułapki przed testem.

## Sprint 17 — przygotowanie H2

**Czas:** 2–3 dni

**Cel:** przygotować wiarygodny test produktu bez pomocy autora.

- ✅ **Odświeżyć scenariusz H2 pod aktualny interfejs** (2026-07-16) — `scenariusz-h2.md`: onboarding v3.1 (opis odporny na iterację kroków), kanon v3 (persony, yearly-first).
- ✅ **Ustalić pomiar** (2026-07-16) — §0.5: dwie niezależne bramki (A rdzeń, B wartość+ekipa), operacyjne definicje sukces/z-pomocą/porażka + skala dotkliwości S1–S4, uczciwe traktowanie n=5 (wzorce > arytmetyka). §8 rozstrzygnięcie przepisane pod dwie bramki.
- ✅ **Dodać zadania + WTP pod v3** (2026-07-16) — B2 przepisane na trzy filary premium (prowadzenie/cel z prognozą/pełna historia zamiast starych opcji), B2a teaser stagnacji, B4 yearly-first.
- ⬜ Przygotować czyste konta i realistyczne dane startowe — skrypt danych demo [Claude, na żądanie].
- ⬜ Uzupełnić albo świadomie wyłączyć 16 ćwiczeń z placeholderem zdjęcia (45 slotów) — decyzja per ćwiczenie [Ty]: swap / AI-zdjęcie / hidden. **Twardy prerekwizyt: fix wyszukiwarki** (`audyt-wyszukiwarki-2026-07.md` R1–R2) — Z2/Z3 testują picker, search po EN da 0 wyników.
- ⬜ Wykonać sesję pilotażową i poprawić sam scenariusz [Ty].

**Done:** test można przeprowadzić tak samo z każdą osobą, bez tłumaczenia interfejsu. *(Skrypt + metodologia pomiaru gotowe; zostają prerekwizyty operacyjne: fix wyszukiwarki, placeholdery, dane demo, pilot.)*

## Sprint 18 — H2 i synteza

**Czas:** 1–2 tygodnie kalendarzowo

**Cel:** sprawdzić Arco z 3–5 osobami i podjąć bramkę B1.

- Przeprowadzić sesje na realnych telefonach.
- Oddzielić problemy użyteczności od braków funkcjonalnych.
- Naprawić P0/P1 i ponownie sprawdzić zmienione przepływy.
- Zaktualizować `feedback-uzytkownikow.md` i raport H2.
- Podjąć decyzję B1: kontynuacja, kolejna iteracja lub wstrzymanie publicznego launchu.

**Done:** mamy dowody, nie intuicję, że nowa osoba rozumie rdzeń aplikacji.

## Sprint 19 — publiczne konta i RODO

**Warunek wejścia:** zielona B1

**Szacunek:** 3–5 tygodni

- Rejestracja, weryfikacja e-mail i reset hasła.
- Regulamin, polityka prywatności, wersjonowane zgody i wymagania wieku.
- Eksport i usunięcie danych.
- Rate limiting i ochrona przed nadużyciami.
- Audyt RLS na minimum dwóch kontach.
- Jawna zgoda na udostępnianie aktywności w Ekipie.

## Sprint 20 — pomiar i cichy launch

**Warunek wejścia:** zielona B2

- Decyzja o analityce i wdrożenie adaptera zgodne z prawem.
- Landing, domena i ESP w UE.
- Stripe, reverse trial i paywalle zgodne z Z1–Z3.
- Test rollbacku, support i monitoring.
- Cichy launch do małej grupy.

## Sprint 21 — publiczna Ekipa

**Warunek wejścia:** stabilny launch

- Zgody i czytelne ustawienia prywatności.
- Rate limiting, ochrona 8-znakowych kodów i rotacja zaproszeń.
- Quiet hours, dostarczanie nudge i zabezpieczenie przed spamem.
- Trzy tygodnie dogfoodingu na realnych ekipach.
- Decyzja B3 na podstawie aktywacji, powrotów i reakcji użytkowników.

## Backlog po bramkach

### Następne po launchu

- miesięczny i roczny recap,
- karta udostępnienia treningu lub rekordu,
- lepszy prompt instalacji PWA,
- kuracja wizualna najczęstszych ćwiczeń,
- awatary Ekipy,
- dopracowanie powiadomień.

### Później

- angielska wersja produktu,
- wrapper App Store/Play Store, jeśli PWA ogranicza retencję,
- ponowna ocena warstwy trenerskiej po danych.

### Zaparkowane lub poza zakresem

- publiczny feed, komentarze i czat,
- automatyczne programowanie AI,
- dieta i makro,
- wearables/HRV,
- marketplace programów.

## Reguła backlogu

Nowy pomysł trafia najpierw tutaj z opisem problemu, odbiorcy i kryterium sukcesu. Nie staje się sprintem tylko dlatego, że jest łatwy do zbudowania. Przed H2 każda nowa funkcja musi uzasadnić, dlaczego nie może poczekać na wyniki testów.
