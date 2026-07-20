# R0.5: wynik klikalnego prototypu

**Data:** 2026-07-16

**Status:** zakończone i zastąpione produkcyjnym interfejsem; dokument jest referencją decyzji.

## Artefakt

Klikalny prototyp spełnił rolę decyzyjną i po wdrożeniu R0–R3a został usunięty z bieżącego
drzewa w ramach rebaseline 2026-07-20. Kod pozostaje w historii Git. Ten dokument zachowuje
wyniki testu i decyzje, które nadal obowiązują.

## Sprawdzone przepływy

| Przepływ | Wynik |
|---|---|
| Dziś → start → logger | działa; logger bez bottom navu |
| Logger live → minimalizacja → Dziś | działa; hero zmienia CTA na Wznów |
| Aktywna sesja → Postępy → mini-bar → wznowienie | działa; warstwy nie nachodzą na siebie |
| Dziś → Plany → szczegół → aktywacja | działa; akcja terminalna wraca do Dziś |
| Postępy → Ciało → pomiar | działa; waga wymagana, notatka widoczna, limit zdjęć jawny |
| Historia → trening po fakcie | działa; brak domyślnego wyboru, progresywny wybór źródła |
| Ekipa empty → utworzenie | działa; dwa jasne CTA i aktywny hub |
| Brak planu | primary: Przeglądaj plany; secondary: Zacznij bez planu |
| Offline | cached hero pozostaje używalne, synchronizacja opisana |
| Błąd danych | jawny błąd, retry i bezpieczny fallback do Historii |
| 320 px + długa nazwa | brak poziomego overflow |
| 393 px | pełny układ, CTA i nawigacja bez kolizji |

## Decyzje po prototypie

1. **Ekipa pozostaje czwartym tabem do testu właściciela i H2.** Jest znajdowalna bez
   dokładania stałej karty na Home. Nie jest to jeszcze dowód częstotliwości użycia.
2. **Dziś i Plany są lokalną nawigacją Treningu.** Biblioteka nie potrzebuje dodatkowej
   promocyjnej karty na Home.
3. **Ciało pozostaje podwidokiem Postępów.** Dodanie pomiaru jest osobnym zadaniem focus.
4. **Hero ma rozdzielone cele tapnięcia.** CTA zaczyna/wznawia, nazwa planu otwiera szczegół,
   Podgląd nie rozpoczyna sesji.
5. **Sesja live i trening po fakcie mają różną semantykę.** Live używa ChevronDown, timera,
   minimalizacji i mini-bara. Backfill używa chrome `session-edit`: ChevronLeft, statyczna
   data i czas, brak mini-bara oraz zapis bez Done i pełnoekranowej celebracji. Historia
   pokazuje lekkie potwierdzenie z mikroanimacją i opcjonalnym, faktycznie wykrytym rekordem.
6. **Mini-bar i floating nav wymagają wspólnego kontraktu rezerwy.** Przy obu warstwach
   prototyp potrzebuje 188 px dolnego paddingu; implementacja ma wyliczać go z tokenów,
   a nie kopiować tę liczbę jako magic value.
7. **Ochrona formularzy opiera się na szkicu.** Dirty guard pomaga w nawigacji wewnętrznej,
   ale copy jawnie informuje o automatycznym zapisie na urządzeniu.
8. **Błąd nie może udawać empty state.** Użytkownik widzi, że problem jest techniczny i ma
   retry oraz sensowną drogę awaryjną.

## Poprawki wykonane podczas testu

- usunięto kolizję kontrolki scenariuszy z logo;
- dodano osobną rezerwę treści dla mini-bara nad bottom navem;
- poprawiono wyrównanie długiej nazwy aktywnego planu;
- przeniesiono toast poza header i status bar;
- podniesiono interaktywne targety segmentów, chipów i linków tekstowych do minimum 44 px;
- rozdzielono logger live i logger treningu po fakcie.

## Krótka akceptacja właściciela

Na telefonie przejść pięć zadań bez zaglądania do dokumentacji:

1. Znajdź bibliotekę planów.
2. Zacznij trening, zminimalizuj go i wróć z Postępów.
3. Dodaj wczorajszy trening.
4. Dodaj pomiar ciała.
5. Utwórz Ekipę.

Do zapisania: pierwszy błędny tap, niezrozumiała etykieta, element wyglądający na klikalny,
który nim nie jest, oraz moment zawahania dłuższy niż około 3 sekundy.
