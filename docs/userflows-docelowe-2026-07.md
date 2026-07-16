# Arco — docelowa architektura informacji i user flows

**Data:** 2026-07-16

**Status:** kierunek zaakceptowany po refinements, bez zmian w kodzie

**Nadrzędna zasada:** Arco ma prowadzić do wykonania treningu, a nie prezentować katalog funkcji.

## 1. Werdykt

Obecny produkt ma dobry rdzeń, ale główne miejsca aplikacji zaczęły konkurować ze sobą na home. Docelowo Arco ma cztery stabilne przestrzenie:

1. **Trening** — co mam zrobić teraz i jaki plan realizuję.
2. **Postępy** — jak zmieniają się wyniki treningowe i ciało.
3. **Historia** — zapis wykonanej pracy oraz trening po fakcie.
4. **Ekipa** — prywatna pętla odpowiedzialności ze znajomymi.

Bottom bar otrzymuje więc układ: **Trening · Postępy · Historia · Ekipa**. Ciało nie znika, tylko staje się równorzędnym widokiem wewnątrz Postępów. Ustawienia są dostępne z awatara, a biblioteka planów z jawnego widoku Plany w sekcji Trening.

To rozstrzyga trzy dotychczasowe niejasności:

- aktywny trening nie jest skrótem do biblioteki planów;
- Ekipa nie jest przypadkową kartą na dole home ani podstroną profilu;
- Ciało nie zajmuje głównego taba obok szerszej kategorii Postępy.

## 2. Docelowa mapa aplikacji

### Trening

- **Dziś** — następny trening, aktywna sesja, stan celu tygodniowego i kontekstowe wskazówki.
- **Plany** — aktywny plan, biblioteka, filtry, szczegół i własne plany.

### Postępy

- **Trening** — trendy ćwiczeń, rekordy, objętość i regularność.
- **Ciało** — pomiary, zdjęcia i trend; dodawanie jako osobne zadanie skupione.

### Historia

- lista treningów;
- szczegół treningu;
- edycja zakończonego treningu;
- dodanie treningu po fakcie.

### Ekipa

- stan pusty: utwórz albo dołącz;
- jedna lub wiele ekip;
- członkowie, check-iny, reakcje i kontekstowy nudge;
- zaproszenia i ustawienia ekipy.

### Profil

- wejście przez awatar w prawym górnym rogu;
- profil, preferencje, ustawienia konta i wylogowanie;
- nie jest piątym tabem i nie przejmuje funkcji Ekipy.

## 3. Kontrakt home

### Header

- po lewej logo Arco;
- obok prawej strony kompaktowy badge celu, np. płomień i 1/2;
- skrajnie po prawej awatar/profil zamiast koła zębatego.

Badge odpowiada na jedno pytanie: **ile z celu tygodniowego już zrobiłem**. Szczegół tygodnia może być dostępny po tapnięciu, ale nie zajmuje pełnej karty na home. Wymaga też jednej semantyki: liczymy treningi, a nie jednocześnie treningi i unikalne dni.

### Nawigacja sekcji

Bezpośrednio pod headerem: **Dziś | Plany**. To jest jawna, przewidywalna droga do biblioteki i aktywnego planu.

### Hero

Hero ma jeden główny cel: rozpocząć lub wznowić trening.

- etykieta: **Następny trening**, dopóki produkt nie zna realnego harmonogramu dnia;
- nazwa dnia i aktywnego planu;
- krótki szacunek: liczba ćwiczeń i czas;
- jedno wyraźne CTA **Zacznij** albo **Wznów**;
- pomocnicze akcje: podgląd ćwiczeń i **Zmień**.

Cała karta nie może być jednym nieopisanym linkiem. Kliknięcie nazwy aktywnego planu prowadzi do jego szczegółu, CTA zaczyna sesję, a Plany otwierają bibliotekę.

### Co znika z domyślnego home

- pełna karta tygodnia z siedmioma płomieniami;
- osobny blok powitania;
- stała karta Przeglądaj programy;
- puste wskazówki typu Na dziś wszystko gra;
- stała karta Ekipy bez nowego zdarzenia;
- zduplikowany mini-bar sesji, gdy hero już pokazuje Wznów.

### Co może pojawić się kontekstowo

- dismissowalny insight o przeglądzie planu po realnym progu użycia;
- jedno nowe zdarzenie Ekipy;
- stan pusty bez planu;
- celebracja osiągnięcia celu.

Home nie powinien czekać z głównym CTA na ciężkie moduły poniżej folda ani wykonywać ich
zapytań w szeregowym waterfallu. Liczba zapytań pozostaje wskaźnikiem diagnostycznym, a nie
sztucznym kryterium akceptacji. Mierzymy przede wszystkim stabilny czas pojawienia się CTA.

## 4. User flows

### F1. Pierwsze uruchomienie

1. Logowanie.
2. Onboarding E0–E7.
3. Rekomendacja planu.
4. Aktywacja planu.
5. Przejście przez replace do Trening / Dziś.
6. Hero pokazuje następny trening z jawnym CTA Zacznij.

Gałęzie:

- **Przejdź do biblioteki** prowadzi do Trening / Plany.
- **Wybiorę później** prowadzi do pustego Dziś z jednym CTA Wybierz plan.
- systemowy Back po ukończeniu onboardingu nie może ponownie go otworzyć.

### F2. Codzienne wejście i start treningu

1. Użytkownik otwiera Trening / Dziś.
2. Widzi postęp celu i jeden następny trening.
3. Zacznij tworzy albo otwiera jedyną aktywną sesję.
4. Podgląd pokazuje ćwiczenia bez startu.
5. Zmień pozwala wybrać inny dzień aktywnego planu albo trening własny.

Niezmiennik: użytkownik nie może przypadkowo utworzyć drugiej niezakończonej sesji. Guard musi działać po stronie serwera i danych, nie tylko w interfejsie.

### F3. Przeglądanie i zmiana planu

1. Trening / Plany pokazuje najpierw aktywny plan, potem bibliotekę.
2. Filtry zmieniają stan przez replace, aby nie zaśmiecać systemowego Back.
3. Tap w plan otwiera szczegół.
4. Back zachowuje filtry i pozycję listy.
5. Aktywuj plan potwierdza zmianę i przez replace wraca do Dziś.

Podczas aktywnej sesji można przeglądać plany, ale ich zmiana dotyczy kolejnego treningu. Nie może przełączyć ani nadpisać sesji w toku.

### F4. Aktywna sesja

1. Start prowadzi do loggera bez bottom baru.
2. Lewy górny przycisk to ChevronDown: **Zminimalizuj trening**, nie Back.
3. Zminimalizowanie wraca do bezpiecznego źródła, a fallbackiem jest Dziś.
4. Na pozostałych hubach i zwykłych podstronach aktywna sesja ma mini-bar.
5. Na Dziś hero z Wznów zastępuje mini-bar, aby nie dublować CTA.
6. Stan sesji i kolejka offline muszą przetrwać zamknięcie PWA.

### F5. Zakończenie i edycja sesji

Sesja live:

1. Zakończ trening.
2. Replace do momentu Done.
3. Check-in Ekipy jest emitowany tylko raz.
4. Dalej przez replace do Dziś.

Edycja zakończonego treningu:

1. Historia / szczegół / Edytuj.
2. Logger w trybie edycji używa ChevronLeft i wraca do szczegółu historii.
3. Zapis nie uruchamia ponownie celebracji i nie emituje drugiego check-inu.
4. Powrót nie prowadzi na home.

### F6. Historia i trening po fakcie

1. Historia zachowuje stronicowanie i scroll po powrocie ze szczegółu.
2. Dodaj trening otwiera ekran focus bez bottom baru.
3. Najpierw wybiera się datę i czas, następnie źródło treningu.
4. Pierwszy widok wyboru zawiera: Własny trening, dni aktywnego planu oraz Wybierz inny plan.
5. Inny plan otwiera sheet: ostatnie, własne, biblioteka i wyszukiwanie.
6. Nie ma automatycznie zaznaczonej odpowiedzi.
7. Utworzenie historycznej sesji przechodzi przez replace do loggera używającego chrome
   `session-edit`: ChevronLeft, statyczna data i czas, bez timera, minimalizacji i mini-bara.
8. Zapis prowadzi do Historii z lekkim potwierdzeniem i krótką mikroanimacją. Może pokazać
   wykryty rekord, ale bez Done, pełnoekranowej celebracji sesji live i check-inu Ekipy.

Jeżeli istnieje sesja live, formularz nie może utworzyć kolejnej otwartej sesji. Użytkownik dostaje jasną decyzję: wróć do aktywnego treningu albo zakończ go przed dodaniem historii.

### F7. Postępy i Ciało

1. Tab Postępy otwiera podwidok Trening.
2. Segmented navigation: Trening | Ciało.
3. Filtry okresu i metryki aktualizują URL przez replace.
4. Szczegół ćwiczenia wraca do realnego źródła i zachowuje stan filtrów.
5. Ciało jest spokojnym ekranem trendu i historii pomiarów.
6. Dodaj pomiar otwiera osobny ekran focus bez bottom baru.
7. Niezapisany pomiar ma dirty guard w nawigacji wewnątrz aplikacji.
8. Szkic zapisuje się trwale i może zostać odzyskany po zamknięciu PWA albo utracie sieci.
9. Zapis przez replace wraca do Postępy / Ciało.

### F8. Ekipa

1. Tab Ekipa jest stałym domem funkcji i nie ma strzałki Back.
2. Stan pusty daje dwie jasne drogi: Utwórz ekipę albo Dołącz kodem.
3. Dołączenie zawsze pokazuje zakres udostępnianych danych i wymaga jawnej zgody.
4. Przy wielu ekipach przełącznik zachowuje ostatni wybór i używa replace.
5. Nieprzeczytane zdarzenie może pokazać kropkę na tabie.
6. Home pokazuje najwyżej jedno kontekstowe zdarzenie, a nie stałą kartę wejściową.
7. Nie dodajemy osobnego dzwonka, dopóki poza Ekipą nie ma niezależnej skrzynki o realnej wartości.

Deep link zaproszenia zachowuje kod przez logowanie i onboarding, ale nie dołącza automatycznie.

### F9. Profil i ustawienia

1. Awatar otwiera profil/ustawienia jako zadanie focus bez bottom baru.
2. Back preferuje rzeczywiste źródło, a fallbackiem jest Dziś.
3. Ustawienia natychmiastowe zapisują się od razu.
4. Pola wymagające zatwierdzenia mają jawne Zapisz, dirty guard i trwały szkic tam, gdzie
   ponowne wpisanie danych byłoby kosztowne.
5. Wylogowanie przez replace prowadzi do logowania i czyści chroniony stan nawigacji.

## 5. Kontrakt chrome i tras

Dozwolony słownik typów jest zamknięty: `hub`, `hub-subview`, `child`, `focus`,
`session-live`, `session-edit`, `session-child`, `moment` i `auth`. `child` oznacza zwykły
szczegół zachowujący chrome właściwego huba, a `session-child` ekran otwierany z loggera bez
globalnego chrome.

| Trasa / stan | Typ | Bottom bar | Aktywny tab | Nawigacja lokalna / top-left |
|---|---|---:|---|---|
| / | hub | tak | Trening | Dziś / Plany |
| /programs | hub-subview | tak | Trening | Dziś / Plany |
| /programs/[id] preset | child | tak | Trening | Back do źródła, fallback Plany |
| własny edytor planu | focus | nie | — | Back + dirty guard |
| /progress | hub | tak | Postępy | Trening / Ciało |
| /body | hub-subview | tak | Postępy | Trening / Ciało |
| /body/add | focus | nie | — | Back + dirty guard |
| /exercise/[id] z Postępów | child | tak | Postępy | Back do źródła |
| /exercise/[id] z loggera | session-child | nie | — | Back do loggera |
| /history | hub | tak | Historia | brak |
| /history/[id] | child | tak | Historia | Back z zachowaniem listy |
| /history/add | focus | nie | — | Back do Historii |
| /ekipa | hub | tak | Ekipa | brak |
| /settings | focus | nie | — | Back do źródła + dirty guard |
| /session/[id] live | session-live | nie | — | ChevronDown: minimalizuj |
| /session/[id] edit | session-edit | nie | — | ChevronLeft: Historia |
| /session/[id]/done | moment | nie | — | CTA przez replace |
| /login | auth | nie | — | brak |

Bottom bar i mini-bar sesji są dwiema niezależnymi warstwami. Typ chrome powinien być deklarowany przez trasę lub ekran, a nie wyliczany z rosnącej listy wyjątków pathname.

## 6. Reguły nawigacji

- Przełączenie głównego taba: replace.
- Zmiana filtra, okresu, ekipy lub podwidoku: replace.
- Wejście w szczegół: push.
- Terminalna akcja, po której poprzedni ekran jest martwy: replace.
- Header Back: historia Arco najpierw, logiczny fallback przy deep linku lub refreshu.
- ChevronLeft oznacza powrót, ChevronDown minimalizację, X zamknięcie lub anulowanie warstwy.
- Mobilne strzałki nie potrzebują widocznych labeli, ale target ma minimum 44×44 px i precyzyjny aria-label.
- Labele bottom baru zostają, bo nazywają równorzędne przestrzenie.
- Dirty guard obejmuje nawigację wewnątrz aplikacji, systemowy Back i `beforeunload` tam,
  gdzie środowisko pozwala go pokazać. Zamknięcia lub ubicia PWA nie da się niezawodnie
  przechwycić, dlatego bezpieczeństwo zapewnia autosave szkicu i jawny flow odzyskania.

## 7. Stany, które trzeba zaprojektować przed implementacją

Każdy główny flow musi mieć: loading, empty, error, offline, partial-data i success.

Najważniejsze przypadki:

- brak aktywnego planu;
- osiągnięty cel tygodniowy;
- istniejąca sesja live;
- dane Ekipy niedostępne;
- błąd pobrania biblioteki;
- brak wyników wyszukiwania po polskiej nazwie;
- deep link bez bezpiecznej historii;
- niezapisany formularz;
- stary cache PWA po zmianie chrome;
- długa polska nazwa i szerokość 320 px.

Błędy nie mogą być zamieniane w ciche puste stany.

## 8. Kryteria jakości i testy przekrojowe

### Kryteria produktu

- nowa osoba umie wskazać, gdzie zaczyna trening, zmienia plan, dodaje trening po fakcie, sprawdza ciało i otwiera Ekipę;
- żadne CTA nie jest zasłonięte przez bottom bar ani mini-bar;
- nie da się utworzyć dwóch otwartych sesji;
- Back zachowuje kontekst listy albo używa logicznego fallbacku;
- zakończona edycja nie tworzy nowego check-inu;
- polskie wyszukiwanie znajduje najważniejsze ćwiczenia;
- podstawowy home nie czeka na moduły poniżej folda.

### Scenariusze E2E

1. Nowe konto: onboarding → plan → start → finish → done → home.
2. Onboarding bez planu → Plany → filtr → szczegół → aktywacja.
3. Start → minimalizacja → Postępy → mini-bar → wznowienie.
4. Próba drugiego startu przy sesji live.
5. Historia z filtrem/stroną → szczegół → Back.
6. Trening po fakcie z aktywnego planu i z innego planu.
7. Edycja zakończonego treningu bez celebracji i duplikatu check-inu.
8. Postępy → Ciało → Dodaj pomiar → dirty guard → zapis.
9. Ekipa empty → utwórz/dołącz → zgoda → aktywny hub.
10. Deep link programu, ćwiczenia i zaproszenia bez historii.
11. Tryb offline podczas loggera oraz powrót po zamknięciu PWA.
12. iPhone Safari/PWA, Android/Chromium, 320 px i zoom 200%.

## 9. Decyzje zamknięte i odłożone

### Zamknięte

- cztery taby: Trening, Postępy, Historia, Ekipa;
- Ciało wewnątrz Postępów;
- Dziś i Plany wewnątrz Treningu;
- awatar zamiast koła zębatego;
- tygodniowy badge w headerze;
- jawne cele tapnięcia hero;
- brak stałej karty Ekipy na home;
- semantyczne rozdzielenie Back, minimalizacji i zamknięcia.

### Odłożone do danych

- osobne stosy historii dla każdego taba;
- pełna skrzynka/dzwonek;
- piąty tab lub dodatkowe główne przestrzenie;
- rozbudowane social, feed, komentarze i chat;
- stałe moduły insightów na home;
- harmonogramowe słowo Dziś dla treningu, dopóki model nie zna zaplanowanego dnia.

## 10. Zależności wdrożenia

Przed kodem weryfikujemy low-fi najdroższych decyzji: cztery taby, pozycję Ekipy, Dziś/Plany,
Postępy/Ciało i zachowanie aktywnej sesji. Następnie powstaje kontrakt chrome, niezmiennik
jednej sesji, terminalne redirecty oraz mechanizm szkiców. Dopiero na tej podstawie
przebudowujemy Home, Plany, Postępy, Ciało, Ekipę, Sesję i Historię. Wyszukiwarka,
dostępność i regresja PWA są osobnymi, mierzalnymi paczkami domykającymi flow.

Szczegółowa kolejność, estymaty i bramki znajdują się w plan-sprintow-2026-07.md.
