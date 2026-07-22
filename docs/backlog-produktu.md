# Arco — backlog produktu

**Aktualizacja:** 2026-07-22
**Właściciel priorytetów:** [Ty]
**Rola dokumentu:** kompletna kolejka produktu. Bieżąca kolejność wykonania jest wyłącznie w `plan-sprintow-2026-07.md`.

## 1. Jak czytać backlog

- **P0** — ryzyko utraty danych, bezpieczeństwa użytkownika albo krytycznego flow; zatrzymuje kolejny etap.
- **P1** — istotna poprawa rdzenia lub bramka przed H2.
- **P2** — wartościowy rozwój po sprawdzeniu rdzenia z użytkownikami.
- **Eksperyment** — hipoteza do zweryfikowania; nie wolno jej wdrażać jako pewnika.
- **Odrzucone teraz** — pomysł może wrócić po wskazanej bramce, ale nie konkuruje z aktywnym planem.

Statusy: `gotowe`, `w sprincie`, `gotowe do podjęcia`, `wymaga decyzji`, `po H2`, `po launchu`.

Każde zadanie implementacyjne musi spełnić standard z `standard-zadania-agentow.md`.

## 2. Stan bazowy

Na produkcji działają: onboarding kont testowych, biblioteka i własne programy, logger i offline,
jedna otwarta sesja, podmiany, historia i edycja, trening po fakcie, Postępy/Ciało, pomiary,
polskie wyszukiwanie, tygodniowy cel sprzężony z planem oraz Ekipa v0. Zakończone są R0–R3a,
F0.1–F0.7, F0.2/F0.3, L9/L10 i rdzeń R5a. Szczegółowy stan: `HANDOFF.md`.

### Śledzenie zgłoszeń właściciela i dogfoodu

Ta tabela zapobiega znikaniu błędów podczas przepisywania sprintów. „Gotowe” nadal może mieć
checkpoint urządzeniowy; nie oznacza usunięcia regresji z macierzy.

| Zgłoszony obszar | Odpowiedzialność | Stan |
|---|---|---|
| Usunięcie historii ponownie otwiera onboarding | TRUST-02 / F0.7 | naprawione, Q1 re-test |
| Sticky logger, solidne tło, toast i systemowy obszar iOS | TRUST-01 + PWA-01 | fix jest, Q1/R5b re-test |
| Sheet skacze, resetuje scroll, przepuszcza tap/scroll lub źle reaguje na swipe | LOG-07 + A11Y-01 + PWA-01 | rdzeń poprawiony, pełna regresja otwarta |
| Floating nav za wysoko, kolizja z CTA/mini-barem i nierówne marginesy | R2.1 + PWA-01 | naprawione, regresja |
| Porzucenie lub wznowienie sesji z Home prowadzi do złej trasy | LOG-04 + PWA-02 | naprawione, regresja procesu i PWA |
| Biblioteka i Ciało były trudno dostępne, Home miał za dużo konkurujących bloków | R2/R3a + VISUAL-05 | przebudowane, H2-U weryfikuje |
| Badge celu nie był klikalny, ogień i Home nie miały finalnej hierarchii | D-05/D-16 + VISUAL-05 | zachowanie gotowe, bramka wizualna R6 |
| Kontenery wychodzą poza rodzica, pola nie są wyrównane, zwykłe akcje mają zbędne obramowanie | PWA-01 + VISUAL-05 | poprawki częściowe, regresja i bramka wizualna |
| Filtry programów i sprzęt nie wpływały wystarczająco na wyniki | PLAN-01 + ONB-04 | częściowo gotowe, R2.2 |
| Podmiana: filtry zasłaniają wyniki | LOG-06 | R4 |
| Kreator blokuje własne ćwiczenie | PLAN-03 | R4 |
| Użytkownik nie zauważa „Zalicz serię” lub trafia w zły wiersz | LOG-01 + LOG-02 | touch target naprawiony, prowadzenie w R4 |
| Przecinek w ciężarze | poprawka loggera + PWA-01 | naprawione, regresja urządzeń |
| Trening po fakcie, korekta ciężaru i brak ponownej celebracji | HISTORY-01 / wdrożone flow | gotowe, regresja R4 |
| Start bez planu jest nieczytelny lub przypadkowy | D-07 + wdrożony guard | gotowe |
| Pusta/niepełna sesja trafia do Historii | LOG-04 / D-08 | gotowe po UI i serwerze |
| Własny trening powinien dać się zapisać jako program | LOG-05 / D-09 | R4, Done + Historia |
| Pomiar bez wagi, brak notatki, więcej niż 2 zdjęcia, nierówne pola | R3a + PWA-01 | gotowe, regresja |
| Badge `0/N`, niespójna semantyka celu i opcja 1–7 | F0.7 + D-05/D-06 + ONB-02 | rdzeń gotowy, 1/tydzień po decyzji |
| Kod Ekipy, unread, trwały wybór i kontekst Home | TEAM-02–TEAM-06 | kod 8 znaków gotowy, reszta R3b |
| Niespójne 3D, empty states bez CTA i jakość ekranów | D-16 + VISUAL-05 | zasady gotowe, bramka R6 |
| Treści Hip Thrust, Chin-Up i opisy ćwiczeń | CONTENT-01–CONTENT-03 | CONTENT-01A i CONTENT-02 na produkcji; CONTENT-01B i CONTENT-03 nadal w Q1 |
| App Store, Google Play i decyzja o warstwie mobilnej | STORE-00, MOBILE-01–03, STORE-01–04 | po H2/PAY-01 |

## 3. P0 — zaufanie, bezpieczeństwo i bramki

| ID | Zadanie | Wynik użytkownika | Status | Etap |
|---|---|---|---|---|
| TRUST-01 | Regresja ostatniego fixa sticky loggera na iPhone PWA i starym Service Workerze | Nagłówek pozostaje widoczny, ma solidne tło, nie przepuszcza treści i nie nachodzi na status bar; toast także respektuje safe area | gotowe do podjęcia | Q1 |
| TRUST-02 | Fresh-account smoke F0.7: pełny onboarding, skip, `0/N`, nowe urządzenie, usunięcie historii | Konto nie wraca do onboardingu, a ustawienia zachowują sens | gotowe do podjęcia | Q1 |
| TRUST-03 | Zachować pozycję strony po zamknięciu każdego bottom sheeta | X, overlay, Escape, swipe i akcja wewnątrz zamykają sheet bez skoku treści do góry; tło pozostaje zablokowane, a fokus wraca bez przewinięcia | na `main` i produkcji; checkpoint iPhone [Ty] | Q1 |
| SEC-03 | Rotacja ujawnionego legacy `service_role` | Nowy sekret działa w Vercel i automatyzacjach, akcje serwerowe przechodzą smoke, a stary klucz jest odwołany dopiero na końcu | pilne działanie właściciela; sekret nie trafił do repo | Q1 |
| CONTENT-01 | Zweryfikować wszystkie widoczne warianty Hip Thrust; obecny Barbell Hip Thrust wstrzymać lub wymienić do wersjonowanego review Codex | Aplikacja nie uczy ryzykownej techniki | CONTENT-01A na produkcji; CONTENT-01B: finalna para Barbell oraz pary Dumbbell/Single-Leg | Q1 |
| CONTENT-02 | Zweryfikować zdjęcia Chin-Up względem zamierzonego wariantu i warunków drążka | Zatwierdzony tekst jest publikowany; niejednoznaczne zdjęcia zastępuje placeholder do nowej sesji | wdrożone produkcyjnie; nowa para nadal otwarta | Q1 |
| CONTENT-03 | Audyt opisów ruchów używanych w planach: start, klucz ruchu, bezpieczne zakończenie, zwięzłość | Początkujący dostaje krótką i bezpieczną instrukcję | gotowe do podjęcia | Q1 + po H2 |
| TRAIN-01 | Pilny patch P11/P12/P14 | Ruchy techniczne i mocy są przed zmęczeniem, a plan FBW ma hinge; wersja treści i zatwierdzenie Codex są jawne | wdrożone produkcyjnie 2026-07-22; P11/P12 nieobecne w prod wykonały bezpieczny no-op | Q1 |
| TRAIN-02A1 | Audyt i kontrakt point syncu pięciu brakujących planów | Read-only audit P01/P03/P08/P11/P12, stabilne slugi/wersje i jawne blockery; SQL powstaje dopiero po korektach | gotowe technicznie na `agent/train-02a-audit`; prod ma 10/15 | Q1 |
| TRAIN-02A2 | Domknąć recepty P01/P03/P08 przed pierwszą publikacją | P01/P08 dostają korekty, P03 mapowanie alternatyw oczekujące na kontrakt TRAIN-03/05 | po A1; bez produkcji | Q1 |
| TRAIN-02A3 | Domknąć recepty P11/P12 po pilnym TRAIN-01 | Pozostała objętość i czasy są zgodne z pełnym audytem; mapowanie sprzętu oczekuje na TRAIN-03/05 | po A1; bez produkcji | Q1 |
| TRAIN-02A4 | Kontrolowany release pięciu planów | Po TRAIN-03/05, SEC-03, backupie i dry-runie produkcja ma 15 planów bez zmiany własnych planów, aktywnych sesji i historii | PLAN-Q po A2/A3 |
| OPS-01 | Zaszyfrowana kopia backupu poza laptopem i checklista rollbacku | Awaria jednego urządzenia nie niszczy możliwości odtworzenia | gotowe do podjęcia | przed publicznymi kontami |
| OPS-02 | Monitoring błędów z numerem wersji, źródłami map i alertem dla zapisu sesji | Krytyczny błąd jest widoczny zanim zgłosi go płacący użytkownik | po H2 | przed płatną betą |
| PRIVACY-01 | Kontrakt zdjęć Ciała: zgoda, prywatność, retencja, pobranie i usunięcie | Wrażliwe zdjęcia mają jawny cykl życia i nie są elementem domyślnego socialu | po H2 | przed publicznymi kontami |
| SECURITY-01 | Publiczne konta: RODO, reset hasła, eksport/usunięcie, rate limits i pełny RLS audit | Drafty `docs/legal/` istnieją; review prawne i działające flow nadal wymagane | po H2-F | PRIV-1 |

### Kontrakt jakości treści ćwiczeń

Materiały techniczne nie są zwykłym contentem. Dla ruchów używanych w planach obowiązuje:

1. zgodność obrazu, polskiej nazwy i instrukcji z tym samym wariantem;
2. brak techniki sprzecznej z wersjonowanym audytem i przyjętymi kryteriami;
3. krótka instrukcja obejmująca pozycję startową, klucz ruchu i bezpieczne zakończenie;
4. dwa statyczne obrazy jako niezawodny fallback;
5. film/animacja wyłącznie jako dodatek po teście wartości i wydajności;
6. źródło, licencja i data review zapisane przy materiale;
7. materiał wygenerowany przez AI wymaga osobnego, wersjonowanego review Codex z dowodem
   wizualnym; konsultant zewnętrzny nie jest bramką przed monetyzacją.

Przed H2 audytujemy wszystkie ćwiczenia widoczne w aktywnych planach początkujących i główne
ruchy. Pełna kuracja całej bazy jest osobnym strumieniem po H2; nie blokuje testu, jeżeli
niewidoczne lub nieużywane rekordy są bezpiecznie ukryte.

## 4. P1 — rdzeń przed H2

### CORE-0 — integralność danych przed R4A

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| DATA-01 | Prawidłowa zakończona seria | Wymagane pola wg typu ćwiczenia; wspólny guard UI/server/DB; pusta seria nie kończy treningu | gotowe do podjęcia po Q1 |
| DATA-02 | Kanoniczne jednostki ciężaru | Dane w jednej jednostce, konwersja w UI, backup i jawna migracja istniejących kont | gotowe do podjęcia po DATA-01 |
| DATA-03 | Jedna definicja faktu treningowego | Zakończona sesja, prawidłowa zaliczona seria robocza, niepominięte ćwiczenie; wspólne dla wszystkich pochodnych | gotowe do podjęcia po DATA-01 |
| SYNC-01 | Trwały błąd nie blokuje outboxa | Rozróżnienie retry/quarantine, odzyskiwalny zapis błędu i flush bieżącej sesji przed finish | gotowe do podjęcia po DATA-01 |

CORE-0 jest twardą bramką przed R4A. Szczegół dowodu, architektury i ograniczeń jest w
`audyt-core-i-plan-2026-07.md`.

### PLAN-Q — biblioteka treningów 10/10 po R4A

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| TRAIN-02 | Jeden katalog 15 programów | Stabilne ID/slug/version; seed, walidatory i 15 kart dokumentacji bez rozjazdu; docelowo usuwa klasę driftu wykrytą przez TRAIN-02A1 | po TRAIN-02A1–A3 i R4A |
| TRAIN-03 | Addytywna recepta v2 | Czas dnia/slotu, RIR, tempo, progresja, rola, opcjonalność, alternatywy, RLS, legacy i snapshot | po TRAIN-02 |
| TRAIN-04 | Korekta 15/15 programów | Wzorce, kolejność, objętość, przerwy, czasy, ruchy timed, regresje i język zgodne z zatwierdzonym audytem Codex | po TRAIN-03 |
| TRAIN-05 | Prawda sprzętowa per slot | Kanoniczny słownik, wymagania ćwiczeń, aliasy i wykonalna ścieżka przez alternatywę | razem z TRAIN-03/04 |
| TRAIN-06 | Czytelna karta i detal planu | Czas, akcent, sprzęt, przerwa, opcjonalność i warianty; pełne stany UX bez redesignu | po TRAIN-03/05 |
| TRAIN-07 | Gate publikacji | Walidator CI, idempotentny seed, RLS, aktywne plany/sesje, E2E i macierz urządzeń | po TRAIN-04–06 |
| SESSION-01A | Minimalna rekomendacja przygotowania i zakończenia | Kontekstowe serie rozgrzewkowe przed ciężkim/power/skill; po finishu opcjonalne wyciszenie/mobilność bez obietnicy lepszej regeneracji | po R4A, przed H2; nie blokuje sesji |

PLAN-Q jest twardą bramką przed R2.2 i R4C. Pełny kontrakt danych, kompatybilności, testów,
rollbacku i review jest w `spec-plan-q-biblioteka-treningow.md`.

### R2.2 — zaufanie do planów

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| PLAN-01 | Filtr „Tylko z moim sprzętem” | Filtr czyta zapisany inwentarz i wynik wykonalności TRAIN-05; ustawienia pozostają źródłem prawdy; link „Zmień sprzęt” | po TRAIN-05 |
| PLAN-02 | Sprawdzić odkrywalność „Utwórz własny program” | Akcja istnieje; poprawiamy hierarchię tylko jeśli test first-click wykaże problem | eksperyment |
| PLAN-03 | Własne ćwiczenie bez opuszczania kreatora | Utworzenie ćwiczenia wraca do właściwego miejsca w edytowanym planie | R4 |

### R3b — Ekipa jako prawdziwy hub

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| TEAM-01 | Rebaseline istniejącego v0 | Sprawdzić stany empty/loading/error/offline, zgody i limit 3 ekip/6 osób | gotowe do podjęcia |
| TEAM-02 | Ostatnio wybrana Ekipa | Trwały wybór i `replace`, także po wejściu z bottom navu | gotowe do podjęcia |
| TEAM-03 | Nieprzeczytany stan na tabie | Jedna subtelna kropka, dostępna dla czytnika; znika po odczytaniu | gotowe do podjęcia |
| TEAM-04 | Jedno kontekstowe zdarzenie na Home | Tylko nowe i istotne zdarzenie; bez stałej karty i bez feedu | gotowe do podjęcia |
| TEAM-05 | Kopiowanie kodu | Tap w kod lub ikonę kopiuje 8 znaków i daje krótkie potwierdzenie | gotowe do podjęcia |
| TEAM-06 | Dogfood dwóch kont | Utworzenie → zgoda → dołączenie → trening → reakcja/nudge → wyjście | gotowe do podjęcia |

### R4 — Logger i Historia

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| LOG-00 | Kontrakt stanu aktywnej sesji | Wspólne stany draft/ready/completed/edited/rest/minimized; brak podwójnego wolumenu i utraty szkicu | gotowe do podjęcia |
| LOG-01 | Czytelny następny krok po wpisaniu wyniku | Subtelnie wyróżnić „Zalicz serię”, ustawić logiczny fokus; bez autozaliczania | gotowe do podjęcia |
| LOG-02 | Pierwszy trening w kontekście | Jednorazowe, pomijalne wskazówki: wynik, zaliczenie, timer, podmiana, minimalizacja, koniec | gotowe do podjęcia |
| LOG-03 | „Zakończ trening” na dole | Druga droga po ostatnim ćwiczeniu; używa tego samego guarda i sheetu | gotowe do podjęcia |
| LOG-04 | Potwierdzenie niepełnego/pustego treningu | Pusty: wróć/usuń; niepełny: wróć/zakończ. Serwer broni historii | gotowe |
| LOG-05 | Zapis własnej sesji jako programu | Drugorzędne CTA na Done oraz w szczególe Historii; jednodniowy edytowalny program; bez aktywacji i bez kopiowania ciężarów | gotowe do podjęcia |
| LOG-06 | Podmiana: wyniki przed filtrami | Wyszukiwarka i propozycje od razu; partie/sprzęt/wzorzec w „Więcej filtrów” | gotowe do podjęcia |
| LOG-07 | Zachowanie scrolla po sheecie | Zamknięcie szczegółu ćwiczenia wraca dokładnie do poprzedniej pozycji | gotowe do podjęcia |
| LOG-08 | Powiększenie materiału ćwiczenia | Pełnoekranowy podgląd obrazu, prosty gest zamknięcia, dostępny fallback | gotowe do podjęcia |
| VALUE-01 | Drabina wartości i minimum danych | Pierwsza sesja daje konkretny następny krok; prognoza i guidance pokazują „czego brakuje”, zamiast udawać pewność | gotowe do podjęcia |
| HISTORY-01 | Historia zachowuje kontekst | Strona, filtry i scroll po wejściu w szczegół oraz edycję | gotowe do podjęcia |
| HISTORY-02 | „Powtórz trening” | Nowa sesja na podstawie starej; domyślnie dodatkowa i bez zmiany rotacji | wymaga testu po R4 |

Pełny kontrakt, kolejność podzadań i kryteria urządzeniowe R4 są w
`spec-r4-logger.md`. LOG-00 i R4A zaczynają się po CORE-0; nie zaczynamy backfillu
przed przejściem całej pętli wielu serii i ćwiczeń ani guidance R4E przed CORE-1.

### CORE-1 — minimalny wiarygodny silnik przed R4E

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| ENGINE-01 | Snapshot recepty sesji | Planowane serie, zakres, przerwa i źródło nie zmieniają się po edycji programu; legacy bez zgadywanego backfillu | po R4D |
| ENGINE-02 | Wersjonowany kontrakt decyzji | Action, reason codes, confidence, evidence, rule version, inputs i insufficient-data | po ENGINE-01 |
| ENGINE-03 | Progresja na pełnym wyniku | Wszystkie serie, realny skok sprzętu i priorytet; brak sugestii z jednego najlepszego wyniku | po ENGINE-02 |
| ENGINE-04 | Plateau bez fałszywej diagnozy | Obserwacja i bezpieczny następny krok; brak automatycznego deloadu z trzech punktów | po ENGINE-02 |
| ENGINE-05 | Macierz historii silnika | Progres, szum, zmiana zakresu, brak danych, podmiana, backfill i edycja | razem z ENGINE-03/04 |
| RIR-01 | Dogfood RIR/RPE w shadow mode | Sprawdzić zrozumienie i tarcie; nie wymagać przy każdej serii ani nie sterować produkcją przed wynikiem | eksperyment przed H2 |

### R5b — dostępność i PWA

| ID | Zadanie | Status |
|---|---|---|
| A11Y-01 | Focus trap, Escape, zwrot fokusu i czytnik dla wszystkich sheetów | gotowe do podjęcia |
| A11Y-02 | Poprawne radiogroup w onboardingu i wyborach | gotowe do podjęcia |
| A11Y-03 | Zoom 200%, 320 px, reduced motion, kontrast i kolejność Tab | gotowe do podjęcia |
| PWA-01 | Macierz: iPhone PWA/Safari, Android/Chromium, desktop i stary cache; safe area header/toast/nav, sheet scroll-lock bez utraty pozycji, 12 px nav i brak overflow | gotowe do podjęcia |
| PWA-02 | Logger offline, draft recovery i mini-bar po ubiciu procesu | gotowe do podjęcia |

### R6 — gotowość pilota

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| TEST-01 | Dane demo i czyste konta | Stabilny stan do wszystkich zadań H2 | gotowe do podjęcia |
| TEST-02 | Odświeżyć scenariusz H2 | Aktualne nazwy tras, zero podpowiadania, osobny test zrozumiałości onboardingu | gotowe do podjęcia |
| FEEDBACK-01 | Feedback z aplikacji | Ekran, kategoria, opis, konto/test, build, urządzenie, opcjonalny załącznik, status | gotowe do podjęcia |
| ONB-01 | Moment „Wszystko gotowe” | Czytelna pauza i krótka animacja z reduced-motion; bez sztucznego blokowania | gotowe do podjęcia |
| ONB-04 | Kontrakt pytań onboardingu | Każde pytanie zmienia rekomendację albo jest odkładane; użytkownik rozumie wpływ odpowiedzi | gotowe do podjęcia |
| VISUAL-05 | Plansza jakości kluczowych flow | Zrzuty 320/375/393 px i realnych urządzeń dla onboarding, Home, Plany, logger, podmiana, Historia, Postępy i Ekipa | gotowe do podjęcia |

**Rekomendacja dla FEEDBACK-01:** dane najpierw zapisujemy w prywatnej tabeli Supabase z RLS.
Notion może być widokiem operacyjnym lub eksportem, ale nie powinien być bezpośrednią zależnością
klienta ani przechowywać sekretu w aplikacji.

## 5. P1 — walidacja przed publicznymi kontami

| ID | Zadanie | Dowód, którego szukamy | Status |
|---|---|---|---|
| VALIDATE-01 | H2-U: moderowany test użyteczności z 5 osobami | Minimum 4/5 samodzielnie przechodzi onboarding → start → seria → podmiana; brak S4 | po R6 |
| VALIDATE-02 | H2-V: osobny test wartości z 5–8 regularnie trenującymi | Wybór płatnej obietnicy, zrozumienie guidance i reakcja na dokładną cenę; wynik jakościowy, nie dowód sprzedaży | po H2-U |
| VALIDATE-03 | H2-E: trzy prawdziwe pary znajomych | Zaproszenie, zgoda, reakcja i nudge bez podpowiedzi oraz bez dyskomfortu prywatności | po R3b |
| VALIDATE-04 | H2-F: trzytygodniowy pilot terenowy 8–12 zarządzanych kont | Powrót na 2. i 3. trening, zachowanie w realnej siłowni, offline/PWA, wartość guidance i Ekipy | po poprawkach H2-U |
| METRICS-01 | Karta wyników pilota ustalona przed rekrutacją | Zero utraty danych; progi aktywacji, powrotu, użycia guidance/Ekipy i intencji płatnej nie są przesuwane po wyniku | gotowe do podjęcia |
| METRICS-02 | Historyczna wartość celu tygodniowego | Zmiana celu zapisuje okres obowiązywania lub snapshot; North Star nie przepisuje poprzednich tygodni | przed analityką PAY-01 |
| IMPORT-01 | Eksperyment importu Hevy/Strong | Checkbox/landing, 5 prawdziwych plików CSV i udział ICP deklarujący migrację; bez budowy importera przed sygnałem | eksperyment |

### Wstępne progi pilota H2-F

To wewnętrzne progi decyzyjne, nie benchmark rynku. Zamrażamy je przed startem kohorty:

1. zero utraty lub pomieszania danych i zero nierozwiązanego P0/P1;
2. co najmniej 80% uczestników kończy pierwszy prawdziwy trening bez interwencji;
3. co najmniej 60% uczestników z rytmem minimum 2/tydzień kończy drugi trening w 14 dni;
4. co najmniej połowa kohorty pozostaje aktywna w trzecim tygodniu;
5. co najmniej 3 osoby z ICP płacącego po minimum trzech sesjach jawnie rezerwują płatną betę
   przy cenie 99 zł/rok lub 14,99 zł/mies.; rezerwacja nie jest jeszcze pobraniem opłaty;
6. co najmniej dwie z trzech par używają Ekipy bez przypomnienia moderatora i bez problemu S4.

Jeśli próg użyteczności lub zaufania jest czerwony, nie interpretujemy WTP. Jeśli użyteczność
jest zielona, ale intencja płatna czerwona, poprawiamy obietnicę i thin slice premium, nie obniżamy
automatycznie ceny.

## 6. Gotowość płatnej bety po H2-F

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| COMM-01 | Kontrakt subskrypcji | Start triala po pierwszym finishu, data obciążenia, restore, anulowanie, grace period, błąd płatności i downgrade bez utraty danych | po H2-F |
| PREMIUM-01 | Najmniejszy płatny pion wartości | Jedna obietnica wybrana na podstawie H2-V/H2-F działa end-to-end na prawdziwych danych i pokazuje uzasadnienie | po H2-F |
| PREMIUM-02 | Uczciwy paywall i porównanie Free/Coach | Dokładne „co zostaje”, brak fake urgency, czytelny yearly-first i dostępny zakup | po COMM-01 |
| PAY-01 | Płatna beta 10–20 osób | Prawdziwy zakup po warstwie prawnej; mierzymy aktywację, refund, churn i support, nie zasięg | po SECURITY-01 |
| SUPPORT-01 | Operacyjny UX pomocy | Jedno wejście do pomocy, potwierdzenie zgłoszenia, build/urządzenie i jawny czas odpowiedzi bety | przed PAY-01 |

### Kontrakt PREMIUM-01

Nie rozpoczynamy zadania bez wyniku H2-V i H2-F. Wybieramy dokładnie jeden pion:

- **guidance:** wykryty stan → zalecenie → krótkie „dlaczego” → możliwość nadpisania;
- **cel z prognozą:** cel → minimum danych → przedział lub stan „jeszcze za mało danych” → zmiana
  po kolejnym treningu;
- **historia i trendy:** realny wniosek z pełnych danych → jasny zakres Free → natychmiastowy
  powrót po zakupie, bez usuwania czegokolwiek przy downgrade.

**Done:** działa na prawdziwych danych użytkownika, ma loading/insufficient-data/error/success,
nie obiecuje medycznego rezultatu, wyjaśnia regułę, ma darmowy fallback i przechodzi test
zrozumienia na minimum trzech osobach z ICP przed PAY-01.

## 7. Mobile i sklepy po dowodzie komercyjnym

| ID | Zadanie | Zakres | Status |
|---|---|---|---|
| STORE-00 | Konta i fundament administracyjny | Apple Developer/Play Console, właściciel i role, bundle/package ID, domena supportu, deletion URL, draft App Privacy/Data Safety, rekrutacja testerów | po R6, równolegle |
| MOBILE-01 | Spike Expo/React Native kontra Capacitor | Ten sam pion login → trening offline → finish na iOS/Android; lokalny bundle, bez produkcyjnego `server.url` | po PAY-01 lub wcześniej przy udowodnionej blokadzie PWA |
| MOBILE-02 | Pakiety współdzielone | Typy, reguły progresji, walidacja, warstwa Supabase, telemetryka i kontrakty offline bez importów Next/DOM | po wyborze Expo/React Native |
| MOBILE-03 | Migracja pionami | Login/onboarding → logger → Historia/Postępy → Plany → Ekipa; każdy pion zastępuje PWA dopiero po regresji danych i UX | po MOBILE-01 |
| BILLING-01 | Uprawnienia wieloplatformowe | StoreKit, Google Play Billing i web mapują się na jedno serwerowe entitlement; webhooki, restore, grace, refund i downgrade | przed STORE-BETA |
| STORE-01 | Beta sklepowa | Build wewnętrzny → TestFlight/Play internal → closed; instalacja, update, offline, purchase sandbox, restore i usunięcie konta | po MOBILE-03 core |
| STORE-02 | Zgodność i prywatność | Aktualny target SDK/API, privacy manifest, App Privacy, Data Safety, konto demo, age rating i review zależności | przed wysłaniem do review |
| STORE-03 | Listing i review | Nazwa, słowa kluczowe, opis, prawdziwe screenshoty, support, Review Notes i odpowiedzi dla review | przed STORE-1 |
| STORE-04 | Wydanie etapowe | Staged rollout, crash/error monitoring, rollback, odpowiedzi na recenzje i obserwacja minimum 72 h | STORE-1 |

### Bramka MOBILE-0

Decyzja nie jest konkursem „który framework brzmi nowocześniej”. Każdy wariant przechodzi
ten sam pion i tę samą macierz urządzeń. Porównujemy jakość loggera, zachowanie po ubiciu procesu,
offline, klawiaturę, systemowy Back, dostępność, wielkość migracji i koszt utrzymania.

- **Capacitor** pozostaje kandydatem tylko z lokalnie spakowanym buildem. Obecny dynamiczny
  Next.js wymagałby przeniesienia Server Actions, cookies i danych do klienta/API.
- **Expo/React Native** jest domyślną hipotezą długoterminową. Ponownie wykorzystujemy logikę,
  Supabase, TypeScript, teksty, tokeny i testy; ekranów DOM/Radix/Vaul nie uznajemy za przenośne.
- **Swift/Kotlin** wraca wyłącznie dla konkretnej funkcji lub po zmierzonym ograniczeniu React
  Native. AI może przygotować port i testy, ale nie zastępuje regresji urządzeniowej ani review.

## 8. P2 — po H2, jeśli dane potwierdzą wartość

| ID | Pomysł | Rekomendacja |
|---|---|---|
| ONB-02 | Cel 1 trening/tydzień | Nie dodawać jako samą liczbę. Najpierw zaprojektować uczciwy plan minimum/powrotu i przetestować komunikat |
| ONB-03 | Profile sprzętu: gumy, drążek, brak sprzętu | Rozszerzyć model dopiero z pełnym mapowaniem na plany i zamienniki |
| SESSION-01B | Interaktywna rozgrzewka i zakończenie | Rozbudować SESSION-01A dopiero, jeżeli H2 pokaże wartość; bez obowiązkowego rytuału i bez blokowania finishu |
| SESSION-02 | Warianty Minimum/Standard/Plus | Najpierw dodać tylko semantykę pozycji opcjonalnej w PLAN-Q; warianty sesji uruchomić po H2 i pomiarze ukończeń |
| PROGRAM-01A | Domowy plan 20–30 minut | Osobny program 2–3×/tydzień, nie dodatkowy dzień ponad aktywny plan; masa ciała + opcjonalnie hantle/guma, pełny gate TRAIN-07, wejście tylko po sygnale H2/danych ukończeń |
| PROGRAM-01B | Pozostałe luki biblioteki po H2 | 1×/tydzień, kettlebell, upper-focus i advanced gym tylko według danych; nie rozbudowywać katalogu przed pomiarem obecnych 15 |
| GUIDANCE-01 | Ograniczenie prowadzenia | Preferowany poziom na planie; później wyciszenie konkretnej wskazówki. Nie globalny „wyłącz wszystko” przed H2 |
| MEDIA-01 | Film/animacja ćwiczenia | Pilotaż na 5–10 trudnych ruchach; mierzyć zrozumienie, wagę i offline; zdjęcia zostają fallbackiem |
| MEDIA-02 | Media własnych ćwiczeń | Prywatne domyślnie, z limitami i bez automatycznej publikacji |
| SHARE-01 | Udostępnianie planu | V1 jako prywatna kopia-snapshot; odbiorca zna autora i wie, że późniejsze edycje się nie synchronizują |
| AVATAR-01 | Prosty awatar profilu | Kilka kuratorowanych wariantów po potwierdzeniu użycia Ekipy; bez kreatora wyglądu |
| VISUAL-01 | Editorialowe okładki programów | Po H2, gdy hierarchia biblioteki jest stabilna; logger i Home pozostają bez fotografii |
| VISUAL-03 | Synchronizacja tokenów z Figmą | Najpierw uzgodnić tokeny typografii, koloru, odstępów, stanów i komponentów; potem dopiero aktualizować plik projektowy |
| VISUAL-04 | Licencja i pochodzenie 3D | Przed publicznym użyciem potwierdzić licencję, możliwość modyfikacji i źródła; 3dicons.co pozostaje inspiracją |
| RECAP-01 | Share card po treningu | Po H2 i decyzji o prywatności; eksportowany obraz, nigdy obowiązkowy etap Done |
| TOOLS-01 | Workflow Fable dla Arco | Tworzyć dopiero, gdy powtarzalny proces prototypowania flow ma jasne wejścia/wyjścia; nie jako zadanie dla samego narzędzia |
| CONTENT-04 | Automatyczny inwentarz słabych mediów | Skrypt wykrywa placeholder, niską rozdzielczość i brak pary; decyzję techniczną zatwierdza wersjonowany review Codex |
| ENGINE-10 | Objętość bezpośrednia i pośrednia | Model per mięsień z jawnymi wagami; kalibracja na literaturze i realnych planach |
| ENGINE-11 | Klasyfikator plateau/zmęczenia | Łączy trend, wykonanie recepty, objętość i opcjonalny wysiłek; deload jest jedną z możliwych akcji |
| ENGINE-12 | Kalibracja rekomendatora programu | Strojenie do akceptacji planu, ukończenia pierwszego i powrotu do drugiego treningu, nie do fixture'ów |
| ENGINE-13 | Outcome loop guidance | Pokazano, zrozumiano, zaakceptowano/odrzucono i wynik kolejnej sesji; po decyzji prawnej o analityce |

## 9. Po launchu lub po osobnej bramce

- **Strava:** dopiero po stabilnym rdzeniu, polityce prywatności i decyzji, jakie dane eksportujemy.
- **Ścieżka trenerów:** dopiero po działającym udostępnianiu planów i pomiarze organicznego popytu.
- **Landing dopracowany przez Codex:** po H2, przed cichym launchem; zakres obejmuje copy,
  hierarchię, responsywność, dostępność, wydajność, SEO i konwersję.
- **Publiczna Ekipa:** po RODO, rate limiting, rotacji kodów, quiet hours i dogfoodingu.
- **Własne media publiczne:** wymagają moderacji, licencji i modelu prywatności.
- **Pełny kreator awatara:** dopiero po danych, że proste warianty zwiększają użycie Ekipy.

## 10. Odrzucone teraz

- **Dzwonek w top barze:** brak niezależnej skrzynki o realnej wartości; stan Ekipy obsługuje tab.
- **FAB „Zacznij trening”:** dubluje hero i zwiększa konkurencję na Home. Wraca tylko jako kontrolowany test po H2.
- **Duże ikony 3D w narzędziu:** 3D zostaje w onboardingu, empty states i momentach; nawigacja i logger używają prostych glifów.
- **Bezwarunkowa opcja celu 1/tydzień:** liczba bez odpowiedniego planu składa fałszywą obietnicę.
- **Bezpośrednia integracja klienta z Notion:** niepotrzebna zależność i ryzyko danych.
- **Niewersjonowane AI jako autorytet techniki:** automatyczny output bez źródeł, macierzy i dowodu
  wizualnego jest odrzucony; zatwierdzenie Codex działa wyłącznie przez wersjonowany audyt.
- **Produkcja w store przez zdalny WebView:** utrudnia offline, łamie rekomendowany model
  Capacitor i zwiększa ryzyko uznania aplikacji za przepakowaną stronę.
- **Pełny rewrite Swift/Kotlin „z AI”:** dwa interfejsy i dwa cykle regresji bez dowodu, że
  React Native blokuje jakość lub możliwości produktu.

## 11. Dług techniczny — tylko gdy dotykamy obszaru

- agregaty Postępów zamiast ciężkich zapytań na dużych historiach;
- dalszy podział `WelcomeOverlay` i dużych komponentów;
- centralizacja komunikatów błędów i przyszłe i18n;
- multi-tab outbox;
- spójny typ zagnieżdżonych joinów Supabase;
- instrumentacja wyszukiwania i ranking na podstawie realnych zapytań;
- pełna kuracja niewidocznej części bazy ćwiczeń.

Nie otwieramy osobnego „sprintu refactoru” bez mierzalnego problemu użytkownika, bezpieczeństwa
lub budżetu wydajności.
