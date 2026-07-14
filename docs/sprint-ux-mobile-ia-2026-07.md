# Sprint UX mobile, biblioteki i pomiarów — plan 2026-07-14

> **Status:** w toku lokalnie. Ten sprint bierze priorytet po domknięciu technicznych dowodów S11.
> Nie zmienia publicznej kolejności kont/RODO/Ekipy. Poprawia rdzeń jednej osoby, z którego
> będą korzystać uczestnicy H2.

## Problem, który rozwiązujemy

Arco ma dobry rdzeń loggera i cztery główne obszary nawigacji, ale obecny interfejs ma trzy
blokery jakości:

1. Na iOS elementy `fixed`/`sticky` nie zawsze respektują strefę systemową: nagłówek loggera
   oraz komunikaty mogą wejść pod status bar, a otwarcie sheetu powoduje widoczny skok layoutu.
2. Biblioteka programów istnieje pod `/programs`, lecz po wybraniu planu nie ma jej oczywistego,
   stałego wejścia. Użytkownik nie ma pewności, gdzie porównać dostępne opcje.
3. Pomiar wspiera dziś jeden plik i zapisuje notatkę, ale notatka nie jest pokazywana w historii.
   To czyni dwie wartościowe funkcje praktycznie niewidocznymi.
4. Dodanie treningu po fakcie wymagało rozpoczęcia go dzisiaj i późniejszego odnalezienia małej
   akcji zmiany daty. To nie jest ścieżka, którą użytkownik może przewidzieć.

## Wstępne ustalenia z kodu (nie zastępują testu na urządzeniu)

- Dolna nawigacja jest już pływająca i używa marginesu `12 px` (`inset-x-3`, `0.75rem` od
  dołu + safe area). Zachowujemy **12 px z lewej, prawej i od dołu**, a na iOS
  dodajemy wyłącznie rzeczywisty `safe-area-inset-bottom`.
- Logger ma `sticky top-0`, podczas gdy body ma safe-area tylko na początku dokumentu. Przy
  przewijaniu nagłówek może więc wejść pod pasek systemowy. To samo ryzyko dotyczy toastów
  Sonner pozycjonowanych jako `top-center`.
- Wspólny BottomSheet opiera się na Vaul. Najpierw mierzymy źródło skoku (blokada scrolla,
  zmiana szerokości viewportu, transform tła czy wysokość klawiatury), a potem naprawiamy go
  wspólną konfiguracją i testem regresji — nie pojedynczym CSS-em per ekran.
- `body_metrics` ma pojedyncze `photo_path`; formularz przyjmuje jeden plik. `notes` zapisuje
  się poprawnie, lecz lista historii go nie renderuje.

## Benchmark i decyzje IA

Nie kopiujemy interfejsu Hevy ani Fitbod. Bierzemy sprawdzone oczekiwania użytkownika:

| Wniosek | Co robimy w Arco |
|---|---|
| Główna nawigacja powinna prowadzić do 3–5 równorzędnych miejsc. | Zostają 4 główne zakładki: Trening, Postępy, Historia, Ciało. Nie dokładamy osobnej zakładki „Programy”. |
| Biblioteka powinna być jednoznacznie dostępna w kontekście treningu. | Na karcie Trening dodajemy stałe wejście „Przeglądaj programy”/„Zmień plan”; nie chowamy go tylko w stanie pustym. |
| Najpierw rekomendacja, potem pełna eksploracja z filtrami. | Biblioteka pokazuje najpierw 3 dopasowane opcje, potem filtry: cel, poziom i miejsce/sprzęt oraz pełną listę. |
| Ćwiczenia są narzędziem w kontekście sesji i planu, ale warto dać im spokojne miejsce do przeglądania. | Po audycie zadań wybieramy: samodzielna biblioteka ćwiczeń pod Postępami albo czytelny punkt „Ćwiczenia” w ekranie Programów. Nie dokładamy piątej zakładki bez potwierdzenia w testach. |

Hevy stosuje analogiczny model: wejście do programów z zakładki treningowej przez „Explore”,
najpierw kilka rekomendacji, potem pełna biblioteka i filtry. Biblioteka ćwiczeń jest dostępna
w kontekście treningu oraz poza nim. To dobry wzorzec mentalny, ale Arco zachowuje prostszy,
trenerski charakter i nie dodaje feedu społecznościowego.

Źródła benchmarku: [Apple HIG — tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars?changes=_1),
[Android navigation patterns](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns?hl=en),
[Hevy — biblioteka programów](https://help.hevyapp.com/hc/en-us/articles/36011518408983-How-to-Access-and-Use-Hevy-s-Routine-and-Program-Library),
[Hevy — biblioteka ćwiczeń](https://help.hevyapp.com/hc/en-us/articles/35688251991575-Hevy-Exercise-Library-400-Exercises-and-Custom-Exercises).

## Kolejność realizacji

### 0. Baseline i decyzje — przed zmianą UI

- Ujednolicić status wdrożenia/CI/S11 w `HANDOFF.md`, planie sprintów i security checklist.
- Nagrać lub zrobić screenshoty pięciu stanów na fizycznym iPhonie w Safari i PWA:
  logger po przewinięciu, toast, offline banner, BottomSheet z krótką i długą treścią, klawiatura
  w formularzu.
- Zmierzyć: czy treść nie wchodzi w safe areas, czy nic nie zmienia położenia po otwarciu sheetu,
  czy ostatni element listy pozostaje osiągalny ponad floating nav.

### 1. P0 — stabilność iOS i powierzchni nakładanych

- Stworzyć wspólny kontrakt `safe-area`: nagłówki sticky, offline banner, toasty, modal/sheet,
  rest timer i floating nav korzystają z tych samych tokenów/zmiennych.
- Zachować floating nav na 12 px w osi poziomej i pionowej, z dodatkiem safe area wyłącznie na
  urządzeniach, które jej potrzebują. Zaktualizować odstępy treści i mini-bar, aby nic się nie
  przykrywało.
- Usunąć skok przy BottomSheet po znalezieniu przyczyny; sprawdzić także ekran z długą listą,
  formularz z klawiaturą i reduced motion.
- Przenieść toasty poniżej bezpiecznej strefy status baru oraz nadać im jeden z-index kontrakt
  względem offline bannera i sheetów.

**Done:** na iPhone Safari i PWA godzina/notch oraz home indicator nie są zasłaniane; otwarcie i
zamknięcie sheetu nie przesuwa tła ani scrolla; wszystkie ważne CTA są dotykalne i widoczne.

**Stan implementacji 2026-07-14:** wspólne tokeny safe area, zachowany margines floating nav
12 px, offset toastów, sticky logger i BottomSheet są wdrożone lokalnie. Produkcyjny build jest
zielony. Pozostaje fizyczny test Safari i PWA na iPhonie, zwłaszcza po otwarciu klawiatury.

### 2. P1 — architektura informacji i biblioteka

- Na ekranie Trening dodać zawsze widoczne, jasno nazwane wejście do biblioteki, niezależne od
  tego, czy program jest aktywny: „Przeglądaj programy” oraz „Zmień aktywny plan”.
- Rozdzielić trzy intencje: **zacznij dzisiejszy trening**, **wybierz/zamień program**,
  **przeglądaj ćwiczenia**. Każda dostaje jednoznaczną ścieżkę i nie konkuruje z CTA startu.
- Przebudować bibliotekę na: dopasowane dla mnie → filtry → cała biblioteka. Karty zachowują
  cel, poziom, dostępny sprzęt, częstotliwość i czas, ale najpierw wyjaśniają „dla kogo jest ten
  plan”.
- Przeprowadzić first-click i task test na pięciu zadaniach: znaleźć alternatywny plan domowy,
  zrozumieć różnicę między dwoma planami, znaleźć ćwiczenie, rozpocząć trening bez planu,
  wrócić do przerwanego treningu.

**Done:** co najmniej 4 z 5 osób trafia do biblioteki oraz znajduje alternatywny plan bez pomocy;
nie zwiększamy liczby głównych zakładek bez danych.

**Stan implementacji 2026-07-14:** na Home z aktywnym planem jest stałe wejście „Przeglądaj
programy”, a `/programs` ma filtry miejsca, poziomu i celu w URL-ach, więc można je udostępniać
i wracać do tego samego wyboru. Dopasowane top 3 oraz test z użytkownikami pozostają otwarte.

### 3. P1 — pomiary, zdjęcia i notatki

- Dodać tabelę `body_metric_photos` z własnością/RLS, pozycją 1–2 oraz bezpiecznym czyszczeniem
  Storage przy usuwaniu pomiaru. Nie upychamy drugiego URL-a w kolumnie `body_metrics`.
- Formularz pozwala dodać maksymalnie dwa zdjęcia, pokazuje miniatury, limit i stan uploadu;
  kompresuje każde zdjęcie tak jak dziś.
- Historia pokazuje zwięzły fragment notatki oraz liczbę/miniatury zdjęć. Dotknięcie wpisu otwiera
  detal pomiaru ze zdjęciami, pełną notatką i metadanymi.
- Migracja danych zachowuje istniejące `photo_path` jako zdjęcie nr 1.

**Done:** użytkownik dodaje 0–2 zdjęcia, odnajduje własną notatkę i po usunięciu pomiaru żaden
plik nie zostaje osierocony.

**Stan implementacji 2026-07-14:** migracja `20260714120000_body_metric_photo_gallery.sql`
przenosi stare zdjęcie do pozycji 1; formularz, historia i detal obsługują do dwóch zdjęć oraz
notatkę. Migracja została zastosowana lokalnie. Smoke sprawdza notatkę, limit dwóch zdjęć,
blokadę trzeciego oraz cascade metadanych po usunięciu pomiaru.

### 4. Walidacja końcowa

- Testy jednostkowe dla limitu dwóch zdjęć, porządku, migracji starego zdjęcia i kasowania.
- Testy UI dla safe-area/tokenów oraz kluczowych task flow biblioteki.
- Ręczny matrix: iPhone Safari, iPhone PWA, mały Android Chrome, desktop; light/dark; online/offline.
- Lint, testy, build, smoke oraz aktualizacja `usability-audit.md`, `HANDOFF.md` i statusów
  S11/CI.

### 5. P1 — trening dodany po fakcie

- Z Historii prowadzi widoczna akcja „Dodaj po fakcie” do osobnego, krótkiego flow.
- Użytkownik najpierw wybiera rzeczywistą datę, godzinę i przybliżony czas treningu, a następnie
  dzień programu albo własny trening.
- Logger nie odmierza czasu od wczorajszej daty. Pokazuje czas podany przez użytkownika, a przy
  zakończeniu zapisuje właściwy `finished_at`.
- Ekipa dostaje check-in przypisany do rzeczywistego dnia treningu. Zmiana daty ukończonej sesji
  synchronizuje także jej dzienny check-in, bez usuwania aktywności, jeżeli na starej dacie
  pozostał inny ukończony trening.

**Done:** użytkownik potrafi zapisać wczorajszy trening bez tworzenia go jako dzisiejszego;
historia, postępy, rekordy, czas trwania i Ekipa wskazują ten sam dzień.

**Stan implementacji 2026-07-14:** wdrożone lokalnie przez `/history/add`, migracje
`20260714133000_historical_workout_logging.sql` i
`20260714133500_sync_team_activity_when_session_date_changes.sql`. Lokalny smoke obejmuje
zapis daty i czasu trwania zaległej sesji. Przed produkcją pozostaje ręczny test na telefonie.

## Poza zakresem tego sprintu

- publiczne konta, RODO, rate limiting i publiczna Ekipa;
- feed, czat, porównywanie wyników i zdjęcia w Ekipie;
- piąta zakładka nawigacji oraz pełna przebudowa całej aplikacji bez wyniku testów.
