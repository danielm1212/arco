# Arco — aktualny audyt użyteczności

**Aktualizacja:** 2026-07-16

**Metoda:** heurystyki, cognitive walkthrough, audyt kodu i dogfooding właściciela.

**Ograniczenie:** nie zastępuje H2 z 3–5 osobami.

## Werdykt

Arco ma dojrzały rdzeń funkcjonalny, ale audyt pełnych user flows ujawnił niespójny model
nawigacji: Home konkuruje wieloma wejściami, Ciało i Ekipa nie mają docelowej hierarchii,
a cykl życia sesji miesza Back, minimalizację i edycję. H2 należy wykonać dopiero po
refinements R0.5–R6, aby nie testować znanych problemów architektury.

Największe ryzyko nie leży już w wyglądzie pojedynczego ekranu. Leży w przewidywalności zachowania na prawdziwym telefonie oraz w tym, czy nowa osoba rozumie architekturę informacji bez wcześniejszej znajomości produktu.

## Architektura informacji

Docelowy model, rozstrzygnięty 2026-07-16:

- **Trening** — Dziś oraz Plany,
- **Postępy** — wyniki treningowe oraz Ciało,
- **Historia** — zapis i korekta przeszłości,
- **Ekipa** — prywatne wsparcie i check-iny.

Bottom bar ma cztery pozycje: Trening, Postępy, Historia i Ekipa. Profil otwiera awatar, Plany są jawnym podwidokiem Treningu, a Home pokazuje Ekipę tylko kontekstowo. Jest to stan docelowy, jeszcze niewdrożony; szczegóły są w `userflows-docelowe-2026-07.md`.

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

### P0/P1 przed H2

- Pełna regresja bottom sheetów na iPhone PWA, Safari, Arc/Chromium, Android i desktop.
- Focus trap, zwrot fokusu do triggera i kontrola klawiaturą w customowym bottom sheecie.
- Potwierdzenie zachowania po aktualizacji service workera i starego cache.
- Wdrożenie kontraktu chrome, poprawnego Back/replace i dirty guard.
- Jedna otwarta sesja egzekwowana po stronie serwera/danych.
- Przebudowa Home/Planów oraz progresywnego treningu po fakcie.
- Polskie nazwy i aliasy dla krytycznych ćwiczeń w wyszukiwarce.

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

Pojedyncze komponenty są dopracowane, ale pełny model produktu wymaga refinementu przed
badaniem. Następna inwestycja w jakość to prototyp R0.5 i wdrożenie R1a–R6, a następnie
test i obserwacja, nie dokładanie kolejnych kart do Home.
