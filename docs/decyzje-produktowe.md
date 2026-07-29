# Arco — rejestr decyzji produktowych

**Aktualizacja:** 2026-07-21
**Zasada:** decyzja z tego pliku obowiązuje do czasu jawnego wpisu zastępującego. Pomysł z notatki nie nadpisuje decyzji.

## Decyzje obowiązujące

| ID | Decyzja | Uzasadnienie |
|---|---|---|
| D-01 | ~~Główne taby: Trening, Postępy, Historia, Ekipa~~ — **zastąpione przez D-38 (2026-07-27)** | Stabilny model mentalny zaakceptowany w R0.5; zrewidowany po POC Home |
| D-02 | Profil przez awatar, nie jako tab; ~~Ciało podwidokiem Postępów~~ — **zmienione przez D-38** | Nie dokładamy kolejnych równorzędnych przestrzeni |
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
| D-20 | Warstwa MOMENTÓW może łączyć rust i violet w jednym komponencie; warstwa NARZĘDZIA nadal nie może (2026-07-27) | Reguła v1.4 „violet nie miesza się z rust w jednym komponencie" chroni czytelność i osie znaczeń w codziennym UI. Celebracja nie jest narzędziem — pierwszy przypadek to confetti po rekordzie (rust + violet + amber). Nie otwiera to mieszania w loggerze, Planach, nawigacji ani na kartach list |
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
| D-31 | Globalne statystyki, rekordy, cel i Ekipa korzystają wyłącznie ze zweryfikowanych faktów zakończonej sesji; otwarta sesja może pokazywać wynik prowizoryczny tylko w loggerze | Jedna definicja danych chroni przed pustym treningiem i rozjazdem pochodnych |
| D-32 | Ciężar ma kanoniczną jednostkę w danych; `kg/lbs` jest sposobem prezentacji, nie reinterpretacją zapisanej liczby | Zmiana ustawienia nie może zmieniać znaczenia historii użytkownika |
| D-33 | Guidance jest deterministyczną, wersjonowaną decyzją z powodem, pewnością i minimum danych; nie mutuje planu bez działania użytkownika | Wiarygodność i audytowalność wygrywają z pozorną personalizacją black boxa |
| D-34 | Definicje 15 programów systemowych mają jeden wersjonowany katalog strukturalny; seed, walidator i dokumentacja są jego projekcjami | Ręczne utrzymywanie kilku kontraktów doprowadziło do rozjazdu liczby programów i pól recepty |
| D-35 | Zgodność sprzętowa planu wymaga wykonalnej ścieżki dla każdego obowiązkowego slotu; brak lub legacy obniża pewność zamiast dawać fałszywy exact match | Zbiorcze metadane programu nie dowodzą, że użytkownik wykona całą sesję |
| D-36 | Przed H2 poprawiamy i mierzymy obecne 15 programów; nowe programy, warianty sesji i opcjonalna rozgrzewka wymagają danych po H2 | Większy katalog nie kompensuje błędnej recepty, sprzętu ani braku wersjonowanego audytu |
| D-37 | Przed monetyzacją recepty P01–P15 zatwierdza wersjonowany audyt Codex S&C; zewnętrzny trener nie jest bramką Q1, PLAN-Q ani H2 | Właściciel świadomie wybiera szybszą walidację produktu; konsultant może wrócić po przychodzie jako audyt jakości, nie blokada wdrożenia |
| D-38 | Trzy taby: **Home · Trening · Ekipa**; Plany, Postępy, Ciało i Historia są równorzędnymi zakładkami wewnątrz Treningu. Nazwa „Trening" świadomie w liczbie pojedynczej | Liczba mnoga zapowiadałaby listę odbytych treningów, czyli zawartość własnej podzakładki Historia. Układ zmniejsza chrome: z 4 pozycji i dwóch pasków zakładek do 3 pozycji i jednego. Zmierzone POC-em: cztery zakładki mieszczą się na 320 px |
| D-39 | Powitanie po imieniu wraca na Home jako **jedna linia nad kartą startu** — nigdy blok ani karta; znika całkowicie przy braku imienia | Personalizacja bez kosztu hierarchii. Karta startu pozostaje pierwszym modułem (D-03), a pusty placeholder byłby szumem |
| D-40 | Home pokazuje **wyciąg** z postępów (passa, podsumowanie, kafle, najważniejsze ćwiczenia); pełna analiza zostaje w Treningu | Home ma motywować i prowadzić do treningu, nie zastępować Postępów. Dashboard nie może zepchnąć CTA poniżej folda |
| D-41 | Trening z dowolnego planu można zacząć bez zmiany aktywnego planu; taka sesja **nie przesuwa rotacji**, ale liczy się do celu tygodniowego i Historii | Trening w domu zamiast na siłowni nie może rozbijać rotacji A → B ani progresji; jednocześnie wykonana praca jest wykonaną pracą (spójne z D-07 i D-10) |
| D-42 | Kanonem recept jest **biblioteka v2.1** (`training_programs_v2`, audyt z 2026-07-28). `audyt-biblioteki-programow-2026-07.md` ma status **superseded z wyjątkami** | Nie utrzymujemy dwóch „zatwierdzonych” źródeł recepty. Wyjątkiem pozostają trzy reguły kolejności power/skill wdrożone patchem TRAIN-01 — v2.1 przesuwa HSPU i Jump Squat w głąb sesji, co jest sprzeczne z jej własnym kryterium i z walidatorem TRAIN-07 |
| D-43 | Zamiana ćwiczenia zapisana strukturalnie oznacza dziś **wyłącznie ścieżkę sprzętową**; zamienniki preferencyjne czekają na `relation_type` z TRAIN-03 | `program_slot_alternatives` wymaga niepustego `missing_equipment`. Wciskanie tam wariantów preferencyjnych (Bayesian curl, V-bar pulldown) produkowałoby nieprawdziwy powód podmiany |
| D-44 | Korekta treści planu może **usuwać sloty**; historia zachowuje `exercise_id` i wyniki, traci powiązanie ze slotem | Bez snapshotu CORE-1 nie da się zmienić recepty bez wyboru: odpiąć historię albo przepiąć ją do innego ćwiczenia. Odpięcie jest uczciwsze, a „poprzedni wynik” i tak liczy się po ćwiczeniu, nie po slocie (potwierdzone lokalnie: 14 → 12 powiązań, 51/51 serii zachowanych) |
| D-45 | `intermediate-gym-fbw2` jest **świadomie planem z naciskiem na górę**: 4 serie czworogłowych i 4 dwugłowych na cykl, zero łydek, zero bezpośredniego tylnego aktonu. Karta planu musi to nazywać wprost i odsyłać do planów dolnych | Krótka sesja jest tu obietnicą produktu, a nie kompromisem — plan, którego użytkownik faktycznie się trzyma, bije lepszy plan wykonywany rzadko. Recepta jest przez to słabsza na nogi niż poprzednia produkcyjna (quadriceps 7 → 4, hamstrings 6 → 4) i to jest zaakceptowany koszt, nie regresja do naprawienia. Kto chce to zmienić, zmienia decyzję, nie „poprawia błąd” |
| D-46 | Każda zmiana recepty planu wymaga **policzonego pokrycia mięśni przed i po** (`npm run audit:muscle-coverage`), nie przeglądu nazw ćwiczeń | PLAN-C1 zabrał trzy serie czworogłowych, dwie dwugłowych i całe uginanie nóg dodane wcześniej przez TRAIN-01. Tabela ćwiczeń wyglądała poprawnie; ubytek było widać dopiero w liczbach. Walidator tego nie złapie, bo progi objętości są decyzją programową, nie regułą techniczną |

## Otwarte decyzje z bramką

| ID | Pytanie | Co musi być wiadomo | Bramka |
|---|---|---|---|
| O-01 | Jak wygląda plan 1 trening/tydzień? | Czy to maintenance, powrót czy pełny plan; jakie minimum objętości | po H2 / wersjonowany audyt Codex |
| O-02 | Czy użytkownik może ograniczyć guidance per ćwiczenie? | Które wskazówki irytują i czy problemem jest częstotliwość, copy czy reguła | H2 + telemetryka |
| O-03 | Które ćwiczenia zasługują na film? | Lepsze zrozumienie niż dwa zdjęcia, koszt produkcji, waga i offline | pilotaż mediów |
| O-04 | Czy „Powtórz trening” jest odkrywalne i potrzebne? | Częstość użycia historii jako szablonu i wpływ na model planu | po R4/H2 |
| O-05 | Czy proste awatary zwiększają przywiązanie do Ekipy? | Użycie Ekipy i reakcje w dogfoodzie | po R3b/H2 |

## Jak zmienić decyzję

1. zapisać nowe dane lub obserwację;
2. wskazać decyzję zastępowaną;
3. opisać wpływ na backlog, plan sprintów, user flow i testy;
4. zmienić ten plik w tym samym commicie co dokumenty wykonawcze.
