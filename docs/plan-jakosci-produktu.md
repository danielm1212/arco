# Arco — plan spójności i jakości produktu

**Właściciel planu:** produkt + UX + implementacja  
**Data bazowa:** 2026-07-13  
**Cel:** doprowadzić całą aplikację do jednego standardu użyteczności, wyglądu i zachowania — od pierwszego uruchomienia do podsumowania treningu.

## Zasada nadrzędna

Każdy ekran ma w ciągu 2 sekund odpowiadać na trzy pytania:

1. Gdzie jestem?
2. Co jest najważniejsze?
3. Co stanie się po tapnięciu?

Jakość wizualna nie może maskować błędnej informacji, małego celu dotykowego ani niepewnego zapisu. Dlatego kolejność prac to: poprawność → spójność interakcji → hierarchia widoków → oprawa wizualna → testy na urządzeniach.

## Etap 1 — poprawność i zaufanie

**Status: wdrożony i zweryfikowany w lokalnej wersji.**

- Podsumowanie treningu dobiera metrykę do danych: objętość, powtórzenia albo czas.
- Tekst celu tygodniowego poprawnie odmienia pozostałą liczbę treningów.
- Ustawienia pokazują prawdziwe zachowanie motywu i informują o wyniku zapisu.
- Sprzęt w Ustawieniach ma polskie, zrozumiałe etykiety.
- Pomiary akceptują polski przecinek dziesiętny.
- Onboarding nie kończy się sukcesem, jeżeli zapis się nie udał.
- Właściciel Ekipy nie może zostawić grupy bez właściciela; samotną Ekipę usuwa w całości.
- Usuwanie osoby z Ekipy, treningu i pomiaru wymaga potwierdzenia.
- Zaproszenie do Ekipy korzysta z systemowego udostępniania z kodem awaryjnym.

**Kryterium wyjścia:** brak fałszywych komunikatów sukcesu i brak destrukcyjnej operacji po pojedynczym przypadkowym tapnięciu.

## Etap 2 — jeden język interakcji

**Status: wdrożony w głównych przepływach; test na fizycznych urządzeniach pozostaje otwarty.**

- Wszystkie cele dotykowe mają co najmniej 44×44 px.
- Wszystkie niestandardowe przyciski mają widoczny focus.
- Tekst informacyjny nie schodzi poniżej 12 px; treść właściwa pozostaje większa.
- Sukces, błąd i stan oczekiwania używają jednego wzorca: natychmiastowy stan lokalny + toast, gdy potrzebne jest potwierdzenie globalne.
- Akcje destrukcyjne używają arkusza potwierdzenia, nie natywnego `confirm()`.
- Ikony sterujące pochodzą z Lucide; emoji zostają tylko w reakcjach i copy emocjonalnym.

**Kryterium wyjścia:** pełna macierz komponentów nie zawiera małego, nieopisanego lub niepotwierdzonego sterowania.

## Etap 3 — hierarchia widoków

**Status: częściowo wdrożony; główne huby są spójne, pogłębione stany wymagają kolejnego przejścia.**

### Home

- Jedna dominująca odpowiedź na pytanie „co mam zrobić teraz?”.
- Wskazówki i Ekipa pojawiają się kontekstowo; nie konkurują stale ze startem treningu.
- Aktywna sesja pozostaje najwyższym priorytetem.

### Ekipa

- Najpierw wybór „Załóż” albo „Dołącz”, potem jeden skoncentrowany formularz.
- Edycja profilu Ekipy jest dostępna po dołączeniu.
- Status członka dzieli postęp, passę i reakcje na czytelne elementy zamiast jednego ucinanego zdania.
- Przekazanie własności jest następnym krokiem przed publicznym uruchomieniem funkcji.

### Postępy

- Świeże konto nie ogląda dashboardu pełnego zer.
- Nad wykresami pojawia się krótki wniosek i następna sensowna akcja.
- Rozbudowane dane pozostają dostępne, ale nie dominują nad interpretacją.

### Ciało

- Zdjęcie otwiera się w aplikacji, w arkuszu/lightboxie.
- Dodawanie i historia pomiarów zachowują jeden rytm i jasne etykiety.

### Programy

- Wybór gotowego programu jest ścieżką główną.
- Tworzenie własnego programu jest opcją zaawansowaną i nie konkuruje z pierwszym wyborem.
- Aktywacja programu ma natychmiastową informację zwrotną.

**Kryterium wyjścia:** każdy widok ma jedną akcję główną, stan pusty, ładowanie, błąd i sensowną następną decyzję.

## Etap 4 — nawigacja i chrom aplikacji

**Status: wariant wdrożony i zweryfikowany przy 320 oraz 390 px w jasnym i ciemnym motywie.**

- Pływająca kapsuła ma cztery stałe zakładki i widoczne etykiety.
- Aktywna zakładka ma stan rozpoznawalny kolorem, kształtem i `aria-current`.
- Główne zakładki nie dublują nawigacji linkiem „← Trening”.
- Mini-bar sesji unosi się nad kapsułą i nie zasłania treści.
- Porzucenie sesji używa spójnego arkusza potwierdzenia.
- Logger i logowanie pozostają ekranami skupienia bez globalnego chromu.

**Kryterium wyjścia:** brak zasłoniętej treści na 320–430 px, w PWA i przy 200% zoomu, zarówno bez sesji, jak i z sesją w toku.

## Etap 5 — system ikon 3D

**Status: pierwsza seria produkcyjna wdrożona i zweryfikowana lokalnie.**

- 3D pojawia się wyłącznie w onboardingu, pustych stanach i celebracjach.
- Nawigacja, formularze i logger pozostają płaskie i natychmiast czytelne.
- Jeden asset na ekran, do 100 kB, bez przesunięcia układu.
- Cała seria ma jeden materiał, kąt, światło i paletę Arco Warm.
- Każdy asset ma wariant jasny/ciemny oraz zapisaną licencję/pochodzenie.

Ciężki zestaw źródłowy znajduje się poza katalogiem publicznym w `assets-source/icons-3d/` i zawiera warianty robocze, więc nie trafia do statycznej paczki aplikacji. Pierwsza seria runtime — hantel, płomień i cel, każdy w wersji jasnej i ciemnej — została wyeksportowana do WebP 320×320 px. Pojedynczy plik ma około 9–12 kB, a wspólny komponent rezerwuje stały wymiar i pokazuje wyłącznie wariant bieżącego motywu.

**Kryterium wyjścia:** ikona wzmacnia znaczenie stanu w pierwszej sekundzie i nie konkuruje z CTA.

## Etap 6 — weryfikacja końcowa

**Status: przejście przeglądarkowe zakończone; macierz fizycznych urządzeń i warunków sieciowych pozostaje do wykonania.**

### Macierz urządzeń

- 320, 360, 390 i 430 px;
- jasny, ciemny i systemowy motyw;
- iOS PWA z safe-area i Android z nawigacją gestami;
- klawiatura otwarta, 200% zoom, długie polskie nazwy;
- online, offline, powrót po utracie sieci i aktywna sesja;
- Ekipa 1/3/6 osób, wiele Ekip i długie nazwy;
- trening ciężarowy, kalisteniczny, czasowy i mieszany.

### Zadania testowe

1. Pierwsze uruchomienie i aktywacja planu.
2. Start, zapis serii offline, podmiana ćwiczenia i powrót do sesji.
3. Bezpieczne zakończenie oraz odczyt podsumowania.
4. Znalezienie trendu w Postępach i treningu w Historii.
5. Zapis `82,5`, dodanie zdjęcia i usunięcie pomiaru.
6. Założenie Ekipy, udostępnienie kodu, reakcja, sygnał wsparcia i zarządzanie członkiem.

### Definition of Done

- lint i build bez błędów;
- smoke rdzenia, offline i Ekipy przechodzą;
- brak poziomego scrolla oraz zakrytego CTA;
- pełna obsługa klawiatury i widocznego focusu;
- kontrast WCAG AA i działający zoom;
- brak błędu konsoli w kluczowych przepływach;
- test zadaniowy z 3–5 osobami po udostępnieniu wersji testowej.

## Kolejność dalszego wykonania

1. Przejść pogłębione stany: aktywny trening, szczegóły Ekipy 1/3/6 osób, długa historia i pomiary ze zdjęciem.
2. Uprościć interpretację świeżych Postępów oraz dopracować stany pusty/błąd/ładowanie w widokach szczegółowych.
3. Zatwierdzić floating nav na 360/430 px, 200% zoomie i fizycznym iOS/Androidzie.
4. Ocenić pierwszą serię 3D podczas dogfoodingu; kolejnych ikon nie dodawać bez konkretnego momentu produktowego.
5. Przejść testy offline, macierz urządzeń oraz dogfooding z 3–5 osobami.

## Zapis weryfikacji — 2026-07-13

- Przetestowane huby: Trening, Postępy, Historia, Ciało, Ekipa, Programy i Ustawienia.
- Przy 320 i 390 px: brak poziomego scrolla oraz brak wykrytych celów dotykowych poniżej 44 px w kluczowych akcjach.
- Jasny i ciemny motyw zachowują wspólną hierarchię powierzchni, kontrast stanów i pływającą nawigację.
- Edytor własnego programu przeszedł próbę utworzenia, wyświetlenia arkusza potwierdzenia i usunięcia danych testowych.
- Natywne potwierdzenia zostały zastąpione wspólnym arkuszem, a destrukcyjne copy wyjaśnia skutek operacji.
- Lint, build produkcyjny oraz smoke rdzenia, zapisu offline i Ekipy przeszły poprawnie na lokalnych danych testowych; skrypty posprzątały utworzone rekordy.
- Pierwsza seria 3D została sprawdzona na pustym Home, świeżych Postępach i pustej Historii przy 320/390 px oraz w obu motywach; brak overflow, małych targetów i konkurencji z CTA.
