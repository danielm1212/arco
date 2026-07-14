# Arco — aktualny audyt użyteczności

**Aktualizacja:** 2026-07-14

**Metoda:** heurystyki, cognitive walkthrough, audyt kodu i dogfooding właściciela.

**Ograniczenie:** nie zastępuje H2 z 3–5 osobami.

## Werdykt

Arco zachowuje się dziś jak aplikacja, a nie zbiór stron: ma stałą nawigację, ciągłość aktywnej sesji, warstwy modalne, stany offline, reakcje natychmiastowe i przepływy powrotu. Rdzeń jest wystarczająco dojrzały do testów H2, ale przed nimi należy domknąć regresję PWA i dostępność bottom sheetów.

Największe ryzyko nie leży już w wyglądzie pojedynczego ekranu. Leży w przewidywalności zachowania na prawdziwym telefonie oraz w tym, czy nowa osoba rozumie architekturę informacji bez wcześniejszej znajomości produktu.

## Architektura informacji

Aktualny model jest logiczny:

- **Trening** — plan, biblioteka i start działania,
- **Postępy** — interpretacja wyniku,
- **Historia** — zapis i korekta przeszłości,
- **Ciało** — pomiary oraz zdjęcia.

Ekipa pozostaje funkcją kontekstową na home i osobnym ekranem, ale nie dostaje piątego stałego taba przed potwierdzeniem użycia. Biblioteka programów ma jawne wejście, więc usunięto wcześniejszą lukę „nie wiadomo, gdzie przeglądać treningi”. Filtry w bottom sheecie ograniczają przeładowanie strony.

## Stan wcześniejszych problemów

| Obszar | Stan |
|---|---|
| Blokada zoomu | Naprawione |
| Martwy dark mode | Naprawione przez system motywów |
| Focus visible przy ikonach | Naprawione globalnie; ponownie sprawdzić w H2/a11y |
| Brak undo i potwierdzenia końca | Naprawione |
| Brak CTA w empty states | Naprawione; obowiązuje jako reguła |
| Trudna droga do biblioteki | Naprawione |
| Sticky bar i toasty pod iOS status bar | Naprawione, wymaga macierzy urządzeń |
| Skok przy bottom sheecie | Naprawione po dogfoodingu, wymaga regresji wszystkich sheetów |
| Klikanie i scroll pod overlayem | Naprawione |
| Zamknięcie sheetu swipe w dół | Wdrożone |
| Pomiar bez wagi | Zablokowany; waga wymagana |
| Notatka pomiaru niewidoczna | Naprawione |
| Dodanie treningu po fakcie | Wdrożone jako jawny przepływ |
| Korekta przeszłego treningu | Wdrożona |

## Otwarte problemy

### P0 przed H2

- Pełna regresja bottom sheetów na iPhone PWA, Safari, Arc/Chromium, Android i desktop.
- Focus trap, zwrot fokusu do triggera i kontrola klawiaturą w customowym bottom sheecie.
- Potwierdzenie zachowania po aktualizacji service workera i starego cache.

### P1 do sprawdzenia w H2

- Czy nowa osoba rozumie różnicę między programem, dniem programu i własnym treningiem.
- Czy odnajduje bibliotekę bez sugestii moderatora.
- Czy wie, gdzie poprawić błędnie wpisany ciężar po zakończeniu treningu.
- Czy „trening po fakcie” jest odkrywalny z historii i odpowiada językowi użytkownika.
- Czy Ciało komunikuje wymaganą wagę przed próbą zapisu.
- Czy funkcja Ekipy jest rozumiana jako prywatne wsparcie, nie publiczny feed.

## Cognitive walkthrough H2

1. Załóż, że chcesz zacząć ćwiczyć dwa razy w tygodniu. Wybierz plan.
2. Rozpocznij pierwszy trening i zaloguj trzy serie.
3. Zmień ćwiczenie, którego nie możesz wykonać.
4. Zakończ trening i znajdź jego wynik.
5. Popraw źle wpisany ciężar w zakończonym treningu.
6. Dodaj wczorajszy trening, o którym zapomniałeś.
7. Dodaj pomiar z notatką i zdjęciem.
8. Wyjaśnij własnymi słowami, do czego służy Ekipa.

Mierzymy sukces bez pomocy, czas, błędny pierwszy klik, liczbę próśb o pomoc i cytaty. Nie pytamy wyłącznie „czy się podoba”.

## Wniosek

UI jest spójny i wystarczająco dopracowany, aby nie blokować testów. Nie ma jednak podstaw, by twierdzić, że użyteczność jest „na najwyższym poziomie”, dopóki rdzenia nie przejdą samodzielnie osoby spoza projektu. Następna inwestycja w jakość to test i obserwacja, nie kolejna warstwa wizualna.
