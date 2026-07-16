# Arco: aktywny backlog i plan refinementu

**Aktualizacja:** 2026-07-16

**Status:** kierunek zaakceptowany, plan dopracowany po refinements

**Źródło prawdy dla kolejności prac**

## 1. Decyzja planistyczna

Dotychczasową kolejność Sprint 17b → H2 zastępuje program **R0–R7**. Nie przebudowujemy
całej aplikacji w jednym dużym wydaniu. Każdy etap kończy się działającym pionowym wycinkiem,
testem automatycznym i krótką regresją na realnym urządzeniu.

Docelowy model produktu opisuje `userflows-docelowe-2026-07.md`:

- bottom bar: Trening · Postępy · Historia · Ekipa;
- Trening: Dziś | Plany;
- Postępy: Trening | Ciało;
- profil i ustawienia przez awatar;
- jednoznaczne CTA w hero;
- najwyżej jedna niezakończona sesja;
- Back, minimalizacja i zamknięcie jako trzy różne zachowania.

## 2. Priorytety

1. Integralność danych i spójny model mentalny.
2. Stabilność mobilnego PWA, dostępność i wydajność odczuwalna przez użytkownika.
3. Wiarygodny test H2 z osobami spoza projektu.
4. Bezpieczeństwo operacyjne, publiczne konta i zgodność prawna.
5. Pomiar, cichy launch i dopiero później publiczne skalowanie Ekipy.

## 3. Zrealizowana baza

### Sprint 15: stabilność PWA i regresja UX ✅

- zamknięte skoki i scrollowanie tła pod overlayem;
- poprawne zamykanie, swipe, sticky header, toasty, floating nav i safe area;
- focus trap, zwrot fokusu i pełna macierz urządzeń wracają w R5b.

### Sprint 16: restore i bezpieczeństwo operacyjne 🔄

- wykonany backup bazy i Storage;
- wykonany restore do odizolowanego środowiska, opisany w `backup-i-restore.md`;
- ustalony właściciel i rytm backup/restore;
- przed publicznym uruchomieniem pozostają: zaszyfrowana kopia poza laptopem, checklista
  rollbacku, CSP, zależności, buckety i pełny przegląd RLS.

### Sprint 17a: onboarding v3.1 ✅

- naprawione dwie gałęzie E6, zapis profilu przy skipie oraz copy O3–O9;
- pozostaje test klawiatury na telefonie i radiogroup/a11y w R5b.

## 4. Program refinementu R0–R7

### R0: kontrakt produktu i user flows ✅ dokumentacyjnie

**Cel:** zamknąć architekturę informacji przed zmianami kodu.

- zinwentaryzowane trasy, źródła wejścia, powroty i redirecty;
- ustalone cztery przestrzenie główne i lokalne podwidoki;
- opisana semantyka Home, Planów, Sesji, Historii, Postępów/Ciała, Ekipy i Profilu;
- ustalona macierz chrome oraz zasady push/replace/Back;
- wcześniejsze sprzeczne zalecenia oznaczone jako zastąpione.

### R0.5: prototyp i walidacja stanów ✅ zaakceptowany

**Czas:** 0,5–1 dnia [Claude + Ty]

**Cel:** sprawdzić najdroższe decyzje, zanim zaczniemy pełną przebudowę.

- klikalny low-fi dla Trening / Dziś / Plany, Postępów / Ciała, Historii i Ekipy;
- warianty: brak planu, aktywna sesja, błąd danych, offline i długa polska nazwa;
- sprawdzenie, czy Ekipa jest znajdowalna i zasługuje na główny tab;
- test na 320/393 px oraz iPhone PWA;
- szybki walkthrough: start treningu, zmiana planu, trening po fakcie, pomiar i Ekipa;
- zamrożenie nazw tabów, typów ekranów i miejsc głównych CTA.

**Done:** nie ma otwartej decyzji, która zmieniałaby strukturę routingu albo odpowiedzialność
głównych tabów w połowie implementacji.

**Stan 2026-07-16:** klikalny artefakt, testy 320/393 px oraz decyzje techniczne są gotowe.
Wynik opisuje `r0-5-wynik-prototypu.md`. Właściciel zaakceptował kierunek i przejście do
implementacji; pełny walkthrough wraca w checkpoint regresji po R1a/R1b.

### R1a: fundament chrome i nawigacji 🟡 gotowy do regresji urządzeniowej

**Czas:** 3–4 dni [Claude] + regresja na urządzeniach [Ty]

**Cel:** zbudować wspólny mechanizm bez rosnącej listy wyjątków pathname.

- deklarowany typ ekranu: `hub`, `hub-subview`, `child`, `focus`, `session-live`,
  `session-edit`, `session-child`, `moment` i `auth`;
- oddzielne sterowanie bottom barem i mini-barem aktywnej sesji;
- wspólne PageHeader i BackButton: target co najmniej 44×44 px, właściwy `aria-label`;
- history-first Back z kontrolowanym fallbackiem i źródłem dla tras wielowejściowych;
- semantyka ChevronLeft, ChevronDown i X;
- helpery push/replace dla tabów, filtrów, detali i akcji terminalnych;
- rezerwy safe area dla każdej kombinacji pływających warstw;
- centralna macierz tras oraz automatyczny test pokrycia każdej strony typem chrome.

**Done:** każda trasa ma jawny typ, właściwy aktywny tab i bezpieczny fallback po deep linku.

**Stan 2026-07-16:** wdrożono centralną macierz 14 tras, deklarowane nadpisanie trybu dla
edytora programu i widoku ćwiczenia z loggera, niezależny bottom nav/mini-bar, dynamiczną
rezerwę dolną, wspólne `PageHeader`, `BackButton` i `CloseButton`, sesyjny bezpieczny Back,
replace dla tabów, filtrów, wyboru Ekipy oraz akcji terminalnych. Logger live używa
ChevronDown, a edycja ChevronLeft. Automatyczny test wykrywa stronę bez reguły chrome.
Lokalnie: lint ✓, testy 22/22 ✓, build ✓, regresja zalogowanych tras w Chromium ✓.
Pozostaje checkpoint [Ty]: iPhone PWA/Safari oraz Android system Back.

### R1b: integralność sesji i bezpieczeństwo nawigacji

**Czas:** 2–3 dni [Claude] + test offline/PWA [Ty]

**Cel:** zabezpieczyć dane przed przebudową powierzchni, które je tworzą i edytują.

- jedna niezakończona sesja jako niezmiennik warstwy danych/serwera, nie tylko UI;
- idempotentny start: kolejna próba otwiera istniejącą sesję albo zwraca jasną decyzję;
- jeden kontrakt terminalnych redirectów dla startu, finishu, edycji i treningu po fakcie;
- guard przed drugim check-inem po edycji zakończonej sesji;
- wspólny dirty guard dla nawigacji wewnątrz aplikacji, systemowego Back i `beforeunload`
  tam, gdzie przeglądarka na to pozwala;
- trwały szkic i ekran odzyskania dla dłuższych formularzy oraz loggera;
- zamknięcie PWA, ubijanie procesu i utrata sieci nie mogą opierać bezpieczeństwa danych na
  samym oknie potwierdzenia;
- precyzyjny sync brakujących `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`, bez pełnego seeda.

**Done:** nie da się utworzyć dwóch otwartych sesji, a przerwanie aplikacji nie usuwa szkicu
ważnego zadania.

### R2: Trening, Dziś i Plany

**Czas:** 3–4 dni [Claude] + decyzje copy/wizualne [Ty]

**Cel:** Home staje się spokojnym pulpitem do rozpoczęcia kolejnej sesji.

- header: logo, kompaktowy badge celu tygodniowego i awatar;
- lokalna nawigacja Dziś | Plany;
- hero jako Następny trening, dopóki nie ma realnego harmonogramu;
- osobne cele tapnięcia: Zacznij/Wznów, nazwa aktywnego planu, podgląd i Zmień;
- Plany pokazują aktywny plan oraz bibliotekę, filtry zapisują stan przez replace;
- powrót ze szczegółu zachowuje filtry i scroll;
- aktywacja planu nie zmienia sesji w toku i terminalnie wraca do Dziś;
- usunięcie konkurencyjnych stałych kart z Home;
- kontekstowy, dismissowalny insight o przeglądzie planu;
- brak duplikacji hero Wznów i globalnego mini-bara;
- główne CTA nie czeka na moduły poniżej folda ani sekwencyjny waterfall zapytań;
- liczba zapytań jest wskaźnikiem diagnostycznym, nie sztucznym limitem akceptacyjnym.

**Done:** nowa osoba potrafi zacząć trening i znaleźć bibliotekę, a główne CTA pojawia się
stabilnie przed treściami drugorzędnymi.

### Checkpoint dogfood

**Czas:** 0,5–1 dnia [Ty + Claude]

- iPhone PWA, Safari, Arc/Chromium i jeden Android;
- start, minimalizacja, wznowienie, zmiana planu, deep link i stary cache;
- naprawiamy P0/P1 przed przejściem do kolejnych hubów.

### R3a: Postępy i Ciało

**Czas:** 2–3 dni [Claude] + regresja treści [Ty]

- Ciało jako podwidok Postępów: Trening | Ciało;
- filtry Postępów i podwidok przez replace;
- szczegół ćwiczenia z origin-aware Back;
- Ciało jako przegląd trendu;
- dodanie pomiaru jako osobny ekran `focus`;
- szkic pomiaru, dirty guard, jawny stan odzyskania i replace po zapisie;
- waga jako pole wymagane, maksymalnie dwa zdjęcia i widoczna notatka w historii.

**Done:** trend, pomiar i powrót do wcześniejszego kontekstu są zrozumiałe bez pomocy.

### R3b: Ekipa jako główna przestrzeń

**Czas:** 2–3 dni [Claude] + dogfooding kont testowych [Ty]

- Ekipa jako hub bez strzałki Back;
- empty state: Utwórz ekipę i Dołącz kodem z jasnymi CTA;
- jawna zgoda i opis zakresu udostępnianych danych;
- switcher wielu ekip przez replace i zapamiętanie ostatniej;
- kropka nieprzeczytanego stanu na tabie;
- najwyżej jedno kontekstowe zdarzenie Ekipy na Home;
- bez osobnego dzwonka na tym etapie;
- test scenariusza z co najmniej dwoma kontami testowymi.

**Uwaga:** publiczne zaproszenia, dostarczanie powiadomień i hardening pozostają za bramką H2.

### R4: Logger, Historia i trening po fakcie

**Czas:** 3–4 dni [Claude] + regresja iOS PWA [Ty]

- aktywny logger używa ChevronDown i minimalizacji;
- edycja zakończonej sesji używa ChevronLeft do szczegółu historii;
- finish live → replace Done → replace Dziś;
- zapis edycji bez Done i bez drugiego check-inu;
- Historia zachowuje stronę, filtry i scroll;
- `/history/add` bez bottom baru, poziomego overflow i rozjazdu datetime na iOS;
- progresywny wybór: Własny trening, dni aktywnego planu i Inny plan;
- sheet Inny plan: ostatnie, własne, biblioteka i wyszukiwanie;
- brak domyślnie zaznaczonej odpowiedzi i czytelny błąd pobierania;
- trening po fakcie korzysta z niezmiennika oraz szkicu wdrożonych w R1b.

**QA:** 320/375/393 px, długie nazwy, Safari/PWA, Android/Chromium, klawiatura i offline.

### R5a: polskie wyszukiwanie i treść ćwiczeń

**Czas:** 3–4 dni [Claude] + przegląd właściciela [Ty]

- zatwierdzona lista około 200 najważniejszych identyfikatorów ćwiczeń z `name_pl`;
- około 50 jawnie wersjonowanych aliasów potocznych;
- wyszukiwanie po nazwie PL/EN i aliasach;
- ranking exact > prefix > alias > substring oraz normalizacja znaków;
- stały zestaw krytycznych zapytań jako test regresji;
- rozsądny empty state, który nie zachęca do tworzenia duplikatu;
- decyzja dla 16 ćwiczeń z placeholderem występujących w 49 slotach programów:
  zdjęcie, podmiana albo świadome ukrycie.

Ten etap może zacząć przygotowanie treści równolegle po zamrożeniu schematu, ale jego integracja
wchodzi dopiero po stabilnym chrome i niezmienniku sesji.

### R5b: dostępność i regresja PWA

**Czas:** 3–4 dni [Claude] + macierz urządzeń [Ty]

- focus trap i zwrot fokusu wszystkich bottom sheetów;
- poprawne radiogroup w onboardingu i wyborach treningu;
- `focus-visible`, `aria-label`, kolejność Tab i komunikaty błędów;
- zoom 200%, 320 px, reduced motion i kontrola kontrastu;
- pełna macierz starego cache, iOS PWA/Safari, Android/Chromium i desktop;
- regresja safe area, klawiatury, overlayów, draft recovery i offline;
- pomiar czasu pojawienia się głównego CTA Home oraz wykrywanie serial waterfall.

### R6: gotowość H2 i pilot

**Czas:** 1–2 dni [Claude] + pilot [Ty]

- realistyczne dane demo i czyste konta;
- aktualizacja `scenariusz-h2.md` po zamrożeniu interfejsu;
- automatyczna regresja scenariuszy z `userflows-docelowe-2026-07.md`;
- pilot na realnym telefonie;
- poprawa instrukcji testu, bez tłumaczenia interfejsu badanym;
- freeze funkcji od pilota do końca H2, poza P0/P1.

### R7: H2 i synteza

**Czas:** 1–2 tygodnie kalendarzowo

- 3–5 sesji na realnych telefonach;
- zadania rdzenia, Postępów/Ciała, planów i koncept Ekipy;
- oddzielenie problemów użyteczności od braków funkcjonalnych;
- zapis dotkliwości i wzorców bez nadinterpretowania średniej przy małym n;
- naprawa P0/P1 i powtórzenie zmienionych przepływów;
- aktualizacja `feedback-uzytkownikow.md` oraz raportu H2;
- decyzja B1: kontynuacja, kolejna iteracja albo wstrzymanie publicznego launchu.

## 5. Kolejność, zależności i rytm dostarczania

```text
R0 → R0.5 → R1a → R1b → R2 → checkpoint → R3a → R3b → R4 → R5a → R5b → R6 → R7
```

Reguły wykonania:

- każdy etap kończy się działającym pionowym wycinkiem na preview;
- po R1a, R1b, R2, R3b i R4 wykonujemy krótką regresję urządzeniową;
- nie łączymy całej zmiany IA w jeden deploy;
- kryteria Done obejmują loading, empty, error, offline i success;
- R5a może być przygotowywany równolegle po zamrożeniu schematu wyszukiwania;
- P0/P1 zatrzymuje przejście dalej, P2 trafia do najbliższego pasującego etapu.

Szacunek R0.5–R6:

- **23–33 dni robocze sekwencyjnie**;
- **20–28 dni roboczych** przy równoległym przygotowaniu treści, design review i sprawnej
  weryfikacji właściciela;
- R7 dodatkowo zajmuje 1–2 tygodnie kalendarzowo.

## 6. Bramka wejścia do H2

- R0.5–R6 są zamknięte;
- nie ma znanego P0/P1 w głównych flow;
- działa serwerowy/danych niezmiennik jednej otwartej sesji;
- draft recovery działa po zamknięciu PWA i odzyskaniu sieci;
- każdy główny hub ma poprawne loading/empty/error/offline/success;
- polskie wyszukiwanie przechodzi stały zestaw zapytań krytycznych;
- placeholdery w widocznych planach mają świadomą decyzję;
- iPhone PWA i Android/Chromium przechodzą scenariusze rdzenia;
- stary cache nie łamie nowego chrome;
- dane demo i instrukcja moderatora są gotowe.

## 7. Po H2

### Publiczne konta i RODO

- rejestracja, weryfikacja e-mail i reset hasła;
- regulamin, polityka prywatności, wersjonowane zgody i wymagania wieku;
- eksport i usunięcie danych;
- rate limiting i ochrona przed nadużyciami;
- audyt RLS na co najmniej dwóch kontach;
- jawna zgoda na udostępnianie aktywności w Ekipie;
- kopia poza laptopem, rollback, CSP, buckety i RLS.

### Pomiar i cichy launch

- zgodna prawnie analityka;
- landing, domena i ESP w UE;
- płatności, trial i paywalle zgodne z eksperymentami;
- test rollbacku, support i monitoring;
- cichy launch do małej grupy.

### Publiczne skalowanie Ekipy

- publiczny flow zaproszeń i deep link przez auth;
- prywatność, quiet hours i dostarczanie nudge;
- rate limiting i rotacja kodów;
- trzy tygodnie dogfoodingu na realnych ekipach;
- decyzja B3 na podstawie aktywacji, powrotów i reakcji.

## 8. Backlog po bramkach

- osobne stosy historii dla tabów, tylko jeśli Back nadal jest problemem;
- pełna skrzynka i dzwonek, gdy pojawią się zdarzenia poza Ekipą;
- tłumaczenia dalszej części bazy i kalibracja rankingu z danych;
- awatary Ekipy i dalszy refinement jej stanów;
- recap miesięczny i roczny;
- karta udostępnienia treningu lub rekordu;
- lepszy prompt instalacji PWA;
- udostępnianie własnego planu;
- wrapper sklepowy, jeśli PWA ograniczy retencję.

Zaparkowane: publiczny feed, komentarze i czat, automatyczne programowanie AI, dieta i makro,
wearables/HRV, marketplace programów oraz piąty tab bez dowodu częstotliwości.

## 9. Reguła backlogu

Nowy pomysł opisuje problem, odbiorcę, spodziewany efekt i kryterium sukcesu. Przed H2 nie
wchodzi do sprintu, jeśli nie zamyka P0/P1, integralności danych albo warunku bramki.
