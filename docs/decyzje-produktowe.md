# Arco — rejestr decyzji produktowych

**Aktualizacja:** 2026-07-20
**Zasada:** decyzja z tego pliku obowiązuje do czasu jawnego wpisu zastępującego. Pomysł z notatki nie nadpisuje decyzji.

## Decyzje obowiązujące

| ID | Decyzja | Uzasadnienie |
|---|---|---|
| D-01 | Główne taby: Trening, Postępy, Historia, Ekipa | Stabilny model mentalny zaakceptowany w R0.5 |
| D-02 | Plany są podwidokiem Treningu, Ciało podwidokiem Postępów, profil przez awatar | Nie dokładamy kolejnych równorzędnych przestrzeni |
| D-03 | Home ma jedno główne CTA startu/wznowienia | Arco prowadzi do treningu, nie prezentuje katalogu funkcji |
| D-04 | Aktywną sesję poza loggerem obsługuje globalny mini-bar, także na Home | Jedno miejsce wznowienia, bez duplikatu hero |
| D-05 | Cel tygodniowy mieści się w zakresie aktywnego planu | Cel musi być wykonalny w modelu programu; nadwyżka jest bonusem |
| D-06 | Cel 1/tydzień nie jest zwykłą opcją ustawień | Wymaga uczciwego planu minimum lub powrotu do regularności |
| D-07 | Własny trening wymaga świadomego startu, ale nie zmienia aktywnego planu | Chronimy przed przypadkową sesją i niejawnie zmienioną rotacją |
| D-08 | Pusta sesja nie trafia do historii | Historia ma przedstawiać wykonaną pracę; guard działa także na serwerze |
| D-09 | Zapis własnej sesji tworzy nieaktywny, jednodniowy program bez skopiowanych ciężarów | Zachowujemy strukturę, nie zamrażamy wyniku jako rekomendacji |
| D-10 | „Powtórz trening” domyślnie tworzy sesję dodatkową i nie rusza rotacji | Historia nie może niejawnie sterować planem |
| D-11 | Udostępniony plan v1 jest kopią-snapshotem, nie połączeniem live | Prostsza prywatność, wersjonowanie i przewidywalność |
| D-12 | Ekipa: maks. 6 osób, użytkownik maks. w 3 ekipach; zero feedu, rankingu, ciężarów, komentarzy i DM | Kameralna odpowiedzialność bez socialowego cyrku |
| D-13 | Home pokazuje najwyżej jedno nowe zdarzenie Ekipy; brak stałej karty | Tab jest domem funkcji, Home zachowuje spokój |
| D-14 | Brak dzwonka, dopóki nie istnieje niezależna skrzynka o realnej wartości | Nie dodajemy pustego chrome |
| D-15 | Guidance jest jawne i nadpisywalne; ewentualne ograniczenie projektujemy na poziomie planu | Globalny OFF osłabiałby wyróżnik i maskował problemy jakości wskazówek |
| D-16 | Ikony 3D są oszczędne: onboarding, empty states i celebracje | Nawigacja i logger wymagają maksymalnej czytelności |
| D-17 | Film/animacja nie zastępuje statycznych zdjęć | Słaba sieć i offline nie mogą blokować instrukcji |
| D-18 | Własne ćwiczenia i ich media są prywatne domyślnie | Publikacja wymaga osobnej zgody i moderacji |
| D-19 | Feedback aplikacji zapisujemy we własnym backendzie; Notion jest opcjonalnym widokiem operacyjnym | Prywatność, niezawodność i brak sekretów w kliencie |
| D-20 | FAB startu nie wchodzi przed H2 | Obecne hero jest wystarczająco bezpośrednie; nie dublujemy akcji bez danych |
| D-21 | Reverse trial Coach zaczyna się po pierwszym ukończonym treningu, nie przy utworzeniu konta | Użytkownik nie traci czasu triala, zanim Arco ma dane i pokaże wartość |
| D-22 | Prognoza i guidance wymagają jawnego minimum danych; przy jego braku pokazujemy, czego jeszcze potrzeba | Wiarygodne „jeszcze 2 treningi” buduje więcej zaufania niż fałszywa precyzja |
| D-23 | H2 rozstrzyga użyteczność, lecz deklaracje WTP są tylko sygnałem; dowodem jest powrót w pilocie i jawna rezerwacja lub zakup po poznaniu ceny | Pięć wywiadów nie dowodzi retencji ani gotowości do płatności |
| D-24 | Przed H2 rdzeń loggera R4 ma pierwszeństwo przed refinementem Ekipy R3b | Frictionless logging jest pierwszym filarem i dotyczy każdego użytkownika |
| D-25 | Przed H2 wymagamy planszy zrzutów kluczowych flow, ale pełny redesign i synchronizacja Figmy czekają na dane | Spójność wizualna musi wejść do testu bez zamrażania nietrafionej estetyki |
| D-26 | Cena 99 zł/rok lub 14,99 zł/mies. pozostaje hipotezą do płatnej bety, nie faktem potwierdzonym wywiadem | Packaging i zachowanie użytkownika muszą potwierdzić cenę przed skalowaniem |
| D-27 | PWA pozostaje produktem walidacyjnym do H2-F i PAY-01; nie przepisujemy aplikacji tylko po to, by znaleźć się w sklepach | Najpierw dowodzimy powrotów i płatności, zanim poniesiemy koszt drugiej warstwy UI |
| D-28 | Po PAY-01 przeprowadzamy bramkę MOBILE-0: pion Expo/React Native kontra lokalnie spakowany Capacitor; zdalny URL w WebView nie jest wariantem produkcyjnym | Obecny Next.js używa cookies, Server Actions i dynamicznych tras, więc nie daje się bezpiecznie opakować bez refaktoru |
| D-29 | Domyślnym kierunkiem długoterminowym jest jeden projekt Expo/React Native ze współdzieloną domeną TypeScript; osobne Swift/Kotlin tylko po zmierzonym ograniczeniu React Native | Otrzymujemy natywne zachowanie i jedną bazę mobilną bez utrzymywania dwóch pełnych aplikacji |
| D-30 | Buildy sklepowe używają StoreKit/Google Play Billing i jednego serwerowego źródła uprawnień; web może mieć osobny checkout wyłącznie zgodnie z zasadami danego rynku | Restore, anulowanie i downgrade muszą być spójne niezależnie od źródła zakupu |

## Otwarte decyzje z bramką

| ID | Pytanie | Co musi być wiadomo | Bramka |
|---|---|---|---|
| O-01 | Jak wygląda plan 1 trening/tydzień? | Czy to maintenance, powrót czy pełny plan; jakie minimum objętości | po H2 / review trenera |
| O-02 | Czy użytkownik może ograniczyć guidance per ćwiczenie? | Które wskazówki irytują i czy problemem jest częstotliwość, copy czy reguła | H2 + telemetryka |
| O-03 | Które ćwiczenia zasługują na film? | Lepsze zrozumienie niż dwa zdjęcia, koszt produkcji, waga i offline | pilotaż mediów |
| O-04 | Czy „Powtórz trening” jest odkrywalne i potrzebne? | Częstość użycia historii jako szablonu i wpływ na model planu | po R4/H2 |
| O-05 | Czy proste awatary zwiększają przywiązanie do Ekipy? | Użycie Ekipy i reakcje w dogfoodzie | po R3b/H2 |

## Jak zmienić decyzję

1. zapisać nowe dane lub obserwację;
2. wskazać decyzję zastępowaną;
3. opisać wpływ na backlog, plan sprintów, user flow i testy;
4. zmienić ten plik w tym samym commicie co dokumenty wykonawcze.
