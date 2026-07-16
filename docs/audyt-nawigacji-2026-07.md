# Audyt nawigacji, cofania i chrome aplikacji

**Data:** 2026-07-16

**Status:** audyt techniczny; wariant IA zastąpiony 2026-07-16 przez `userflows-docelowe-2026-07.md`

**Zakres:** wszystkie trasy App Routera, headery, bottom bar, mini-bar sesji, query state, redirecty po mutacjach i systemowy Back w PWA.

## Werdykt

Intuicja „strzałka wraca do poprzedniego widoku” jest właściwa dla aplikacji mobilnej, ale wymaga fallbacku. Docelowo:

1. Headerowy back próbuje wrócić do rzeczywistego poprzedniego widoku aplikacji wraz z query, filtrem i pozycją scrolla.
2. Gdy ekran otwarto jako deep link, po refreshu albo bez bezpiecznej historii Arco prowadzi do jawnego, logicznego rodzica.
3. Nie używamy globalnie gołego `router.back()` ani samych sztywnych linków do rodzica. Pierwsze może wyjść poza aplikację, drugie gubi kontekst.
4. Widoczny tekst „← Historia/Programy/Postępy/Trening” znika z mobilnych headerów. Zostaje ikona w targecie 44×44 px oraz pełny `aria-label`.
5. Labeli w bottom barze nie usuwamy — opisują cztery równorzędne przestrzenie i są potrzebne do orientacji.
6. Chevron w loggerze nie jest Back. Aktywny logger się minimalizuje, więc powinien używać osobnej ikony/semantyki; edycja zakończonego treningu ma natomiast zwykły Back do historii.

To rozdziela trzy różne intencje:

- `ChevronLeft` — wróć do poprzedniego widoku / fallback do rodzica,
- `ChevronDown` — zminimalizuj aktywną sesję, która nadal trwa,
- `X` — zamknij lub anuluj modalne zadanie.

## Co jest dziś niespójne

### P1 — szczegół ćwiczenia ma co najmniej dwa źródła, ale jeden sztywny powrót

`/exercise/[id]` otwiera się z Postępów oraz z pickera w aktywnym loggerze. Header zawsze prowadzi do `/progress`. Użytkownik wychodzący na trend ćwiczenia w trakcie sesji nie wraca więc do loggera. Mini-bar pozwala sesję odnaleźć, ale nie naprawia fałszywej semantyki strzałki.

### P1 — szczegół programu nie wraca tam, skąd został otwarty

`/programs/[id]` można otworzyć z biblioteki albo bezpośrednio z home („Sprawdź plan”). Header zawsze prowadzi do `/programs`. Ten sam problem dotyczy własnego programu renderowanego pod tą samą trasą jako edytor.

### P1 — sztywne linki gubią stan listy

- szczegół historii wraca do `/history`, tracąc `?before=...`, scroll i miejsce na starszej stronie;
- szczegół ćwiczenia wraca do czystego `/progress`, tracąc wybrany okres;
- szczegół programu wraca do czystego `/programs`, tracąc filtry biblioteki.

Przeglądarkowy Back zachowałby ten stan, dlatego docelowy komponent powinien preferować poprzedni wpis należący do bieżącej sesji aplikacji.

### P1 — logger miesza aktywną sesję z edycją zakończonej

Ten sam `Logger` obsługuje:

- trening w toku,
- trening historyczny w toku,
- edycję zakończonego treningu.

Top-left zawsze wykonuje `router.push("/")` i pokazuje `ChevronLeft`. Dla aktywnej sesji jest to faktycznie „minimalizuj do home”, a dla edycji zakończonego treningu — błędny powrót, bo użytkownik wszedł z `/history/[id]`.

### P1 — terminalne akcje zostawiają martwe widoki w historii

W Next.js redirect z Server Action domyślnie dodaje wpis (`push`). Obecnie dotyczy to między innymi:

- zakończenia treningu → `/session/[id]/done`,
- utworzenia sesji historycznej → `/session/[id]`,
- usunięcia programu → `/programs`,
- logowania → `/`.

Skutki:

- systemowy Back z celebracji może otworzyć zakończony logger;
- Back z loggera historycznego może wrócić do formularza, który utworzył już sesję;
- Back po usunięciu programu może próbować otworzyć nieistniejący edytor;
- Back po logowaniu może wracać do formularza logowania.

Terminalne przejścia muszą jawnie używać semantyki `replace`.

### P1 — ustawienia mogą zgubić niezapisane zmiany

`/settings` ma jawny przycisk „Zapisz”, ale bottom bar i sztywny link powrotu pozwalają opuścić ekran bez ostrzeżenia. Motyw i część preferencji zapisują się od razu, pozostałe dopiero po CTA, więc użytkownik nie ma jednego przewidywalnego modelu.

Docelowo albo wszystko zapisuje się automatycznie, albo ekran jest trybem `focus` bez bottom
baru, z ochroną dirty-state dla nawigacji wewnątrz aplikacji i systemowego Back oraz trwałym
szkicem. Zamknięcie PWA nie gwarantuje wyświetlenia ostrzeżenia, więc po ponownym uruchomieniu
aplikacja musi zaoferować odzyskanie pracy.

### P1 — `AppChrome` ma jeden boolean dla dwóch niezależnych warstw

Obecny warunek jednocześnie pokazuje/chowa `BottomNav` i `SessionMiniBar`. To uniemożliwia poprawne stany, np.:

- formularz bez bottom baru, ale z widocznym statusem aktywnej sesji,
- zwykły szczegół z bottom barem i mini-barem nad nim,
- focus bez bottom baru, gdzie mini-bar powinien zejść do safe area.

Te warstwy muszą mieć osobne decyzje oraz osobne rezerwy miejsca w layoucie.

### P2 — nie każda trasa z bottom barem należy dziś do taba

Na `/settings` i `/ekipa` bottom bar jest widoczny, ale żaden tab nie jest aktywny. To wygląda jak utrata kontekstu. Decyzja docelowa: Ustawienia są trybem `focus`, a Ekipa zastępuje Ciało jako czwarty główny tab. Ciało przechodzi pod Postępy.

### P2 — query state zaśmieca Back stack

Zmiana okresu Postępów, metryki ćwiczenia, filtrów programów albo wybranej Ekipy tworzy kolejne wpisy historii. Systemowy Back może więc długo cofać same chipy/filtry zamiast opuścić ekran. View-state zapisujemy w URL dla deep linku, ale aktualizujemy przez `replace`.

### P2 — tekstowe back-linki są wizualnie i dostępnościowo niespójne

Większość headerów używa znaku `←` w tekście, logger używa komponentu ikony. Szerokie etykiety konkurują z tytułem, powodują różną geometrię nagłówków i na czytniku tworzą nazwę w rodzaju „left arrow Historia”. Jeden wspólny komponent rozwiązuje ten problem.

## Docelowa macierz tras

| Trasa / stan | Typ | Bottom bar | Aktywny tab | Top-left / zachowanie |
|---|---|---:|---|---|
| `/` | `hub` | tak | Trening | brak |
| `/programs` | `hub-subview` | tak | Trening | lokalne Dziś / Plany |
| `/programs/[id]` — preset | `child` | tak | Trening | Back do źródła, fallback `/programs` |
| `/programs/[id]` — własny edytor | `focus` | nie | — | Back z dirty guard, fallback `/programs` |
| `/progress` | `hub` | tak | Postępy | lokalne Trening / Ciało |
| `/exercise/[id]` z Postępów | `child` | tak | Postępy | Back do źródła, fallback `/progress` |
| `/exercise/[id]` z loggera | `session-child` | nie | — | Back do loggera |
| `/history` | `hub` | tak | Historia | brak |
| `/history/[id]` | `child` | tak | Historia | Back zachowujący stronę/scroll, fallback `/history` |
| `/history/add` | `focus` | nie | — | Back do `/history`; nie wracać do formularza po utworzeniu sesji |
| `/body` — przegląd | `hub-subview` | tak | Postępy | lokalne Trening / Ciało |
| `/body/add` | `focus` | nie | — | Back z dirty guard, fallback `/body` |
| `/settings` | `focus` | nie | — | Back do źródła/fallback `/`, dirty guard |
| `/ekipa` | `hub` | tak | Ekipa | brak Back; zmiana ekipy przez `replace` |
| `/session/[id]` — aktywny | `session-live` | nie | — | `ChevronDown`: zminimalizuj do bezpiecznego źródła/home |
| `/session/[id]` — edycja zakończonego | `session-edit` | nie | — | `ChevronLeft`: Back do `/history/[id]`, fallback `/history` |
| `/session/[id]/done` | `moment` | nie | — | brak Back; CTA kończy flow przez `replace` |
| `/login` | `auth` | nie | — | po sukcesie `replace("/")` |

Bottom bar pozostaje stabilny na zwykłych widokach wewnątrz taba. Chowamy go, gdy ekran jest zadaniem wymagającym zakończenia/anulowania albo trybem sesji. To jest mniej agresywne i bardziej przewidywalne niż „bottom bar tylko na czterech rootach”.

## Reguły stosu historii

| Zdarzenie | Operacja docelowa | Powód |
|---|---|---|
| wejście w szczegół / formularz | `push` | Back ma wrócić do źródła |
| header Back | app-owned Back, fallback `replace(parent)` | zachowuje stan, ale nie wychodzi przypadkiem poza aplikację |
| zmiana taba bottom baru | `replace` w wersji v1 | top-level switch nie zaśmieca systemowego Back |
| filtr, okres, metryka, wybrana Ekipa | `replace` | to stan widoku, nie nowy ekran |
| paginacja „starsze” | `push` | Back ma wrócić do nowszej strony |
| start zwykłego treningu | `push` | systemowy Back/minimalizacja wraca do źródła |
| start treningu po fakcie | `replace` formularza loggerem | nie można wrócić do formularza tworzącego duplikat |
| zakończenie treningu | `replace` loggera celebracją | zakończony logger nie może być poprzednim ekranem |
| wyjście z celebracji | `replace` home | systemowy Back nie otwiera ponownie momentu końcowego |
| usunięcie programu/sesji | `replace` bezpiecznym rodzicem | usunięty detal jest martwy |
| sukces logowania / onboardingu | `replace` | formularz wejściowy nie wraca przez Back |

Wersja v1 nie musi implementować pełnych, osobnych stosów dla czterech tabów: Treningu, Postępów, Historii i Ekipy. Tapping taba prowadzi do jego huba. Jeżeli H2 pokaże realną potrzebę powrotu do głębokiego stanu każdego taba, wtedy dokładamy osobne stacki; nie symulujemy ich przypadkowymi wpisami historii.

## Docelowe komponenty

### `BackButton`

- target 44×44 px,
- `ChevronLeft`, bez widocznego tekstu,
- wymagany `aria-label`,
- wymagany fallback,
- opcjonalne, allowlistowane źródło dla tras wielowejściowych,
- najpierw korzysta z poprzedniego wpisu należącego do bieżącej sesji Arco; bez takiego wpisu robi `replace(fallback)`.

Nie opieramy bezpieczeństwa wyłącznie na `history.length`, bo stos może zawierać inną domenę lub wpis sprzed uruchomienia PWA. Aplikacja musi oznaczać własne wpisy albo przekazywać kontrolowany `returnTo`.

### `PageHeader`

- jedna geometria lewego targetu, tytułu i prawej akcji,
- wariant `back`, `close`, `none`,
- obsługa długiego tytułu bez przesuwania przycisku,
- sticky/safe-area według typu ekranu,
- wspólny focus-visible.

### `AppChrome`

Zamiast jednego `hide` potrzebuje co najmniej:

- `showBottomNav`,
- `activeTab`,
- `showSessionMiniBar`,
- `miniBarPosition: above-nav | safe-bottom`,
- dolnego paddingu wynikającego z faktycznie widocznych warstw.

Tryb nie może wynikać wyłącznie z pathname, bo `/programs/[id]` jest raz detalem presetu, a raz edytorem własnego programu. Ekran musi móc zadeklarować tryb chrome z poziomu layoutu/segmentu lub kontekstu.

### Dirty-state guard

Dirty guard przechwytuje w miarę możliwości:

- headerowego Back,
- bottom baru,
- systemowego Back/popstate,
- odświeżenia strony przez `beforeunload`.

Niezależny autosave zapewnia odzyskanie szkicu po zamknięciu/ubiciu PWA. Nie traktujemy
ostrzeżenia przeglądarki jako gwarancji bezpieczeństwa danych.

Dotyczy co najmniej ustawień, edytora programu i rozpoczętego formularza pomiaru ciała.

## Dodatkowy guard integralności sesji

`/history/add` jest osiągalne podczas aktywnej sesji. Formularz może utworzyć kolejną niezakończoną sesję, a mini-bar pokazuje tylko najnowszą. Przed wdrożeniem nowego chrome trzeba rozstrzygnąć:

- blokadę tworzenia treningu po fakcie, gdy istnieje sesja w toku, albo
- jawne zakończenie/porzucenie bieżącej sesji przed przejściem dalej.

Nie chowamy mini-bara w focus flow bez rozwiązania tego konfliktu, bo ukryłoby to ważny stan zamiast go naprawić.

## Kolejność wdrożenia

1. Wspólne `BackButton` i `PageHeader`; podmiana tekstowych back-linków bez zmiany tras.
2. Rozdzielenie trybów `session-live` i `session-edit` w Loggerze.
3. Naprawa terminalnych redirectów (`RedirectType.replace`) i CTA done.
4. Origin-aware powrót z `/exercise/[id]`, `/programs/[id]`, `/history/[id]`.
5. Refaktor `AppChrome`: niezależny bottom bar i mini-bar, poprawne aktywne taby.
6. Dirty-state guard oraz rozstrzygnięcie konfliktu aktywnej sesji z `/history/add`.
7. Query-state przez `replace`; test systemowego Back.

## Definition of Done

- wejście z listy z filtrem → detal → Back przywraca filtr i miejsce,
- direct link/refresh detalu → Back prowadzi do bezpiecznego rodzica,
- ćwiczenie otwarte z loggera → Back wraca do loggera,
- edycja zapisanego treningu → Back wraca do jego szczegółu historii,
- systemowy Back z done nie otwiera zakończonego loggera,
- po usunięciu programu Back nie otwiera 404,
- po logowaniu Back nie pokazuje loginu,
- zmiana kilku filtrów/metryk nie tworzy wieloelementowego stosu,
- niezapisane ustawienia/pomiar nie giną bez potwierdzenia,
- bottom bar ma zawsze aktywny tab albo jest ukryty,
- każdy target ma 44×44 px, focus-visible i poprawny `aria-label`,
- testy: iPhone PWA/Safari, Android system Back, Chromium/desktop, deep link i refresh.

## Podstawa decyzji

- Apple HIG traktuje tab bar jako nawigację między top-level sections, zaleca jego stabilną obecność wewnątrz sekcji i zachowywanie stanu nawigacji taba.
- Android rozróżnia historyczny Back od nawigacji Up oraz opisuje osobne back stacki dla bottom navigation.
- Next.js App Router: `router.push` oraz redirect z Server Action dodają wpis historii; `router.replace` i `RedirectType.replace` służą do zastąpienia wpisu.

Arco adaptuje te zasady do małej PWA: stabilne cztery taby Trening, Postępy, Historia i Ekipa, historyczny Back z fallbackiem oraz bez pełnej implementacji czterech osobnych stacków przed dowodem potrzeby z H2.
