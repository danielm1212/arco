# Audyt R2 — Home i Plany: refinement przed dalszymi hubami

**Data:** 2026-07-17  
**Status:** blokada jakościowa R2.1 przed przejściem do R3a  
**Zakres:** pion R2 z commitów `ac82a18` i `44d66cc`: Home/Dziś, Plany,
header Treningu, cel tygodniowy, hero, insight planu i loading tras.  
**Metoda:** przegląd kodu, ustalonego kontraktu IA oraz ręczny przegląd lokalnego
widoku mobilnego (320 × 568, 320 × 700 i 393 × 852). To nie jest pełna regresja
na zalogowanej produkcji ani test urządzeń.

## Werdykt

R2 ma **dobry szkielet informacji**, ale obecna implementacja zatrzymała się na
minimalnym pionowym wycinku. Rozwiązuje pytanie „czy da się wejść do planów i
zacząć trening?”, lecz nie doprowadza do zaakceptowanego doświadczenia „spokojny,
premium pulpit treningu”.

Najkrócej: implementacja odtwarza elementy planu, ale w kilku miejscach wybiera
najtańszy wariant techniczny zamiast domknąć jego sens produktowy i wizualny.
Nie jest to zarzut o jakość fundamentu ani powód do przebudowy od zera. Jest to
powód, by **nie nazywać R2 zamkniętym** i wykonać mały, celowany refinement R2.1
przed rozbudową kolejnych hubów.

| Obszar | Ocena | Co działa | Dlaczego nie jest jeszcze gotowe |
| --- | ---: | --- | --- |
| Architektura informacji | 8/10 | Dziś i Plany są czytelnymi podwidokami Treningu; profil wychodzi z awatara | Szczegół celu tygodniowego nie ma jeszcze miejsca docelowego |
| Hierarchia Home | 6/10 | Hero ma jedno wyraźne CTA i rozdzielone cele tapnięcia | Pełna karta tygodnia nadal wyprzedza hero i odbiera mu pierwszeństwo |
| Jakość wizualna | 6,5/10 | Spokojna baza, poprawna kolorystyka, brak horizontal overflow przy 320 px | Badge, hero i lista planów wyglądają jak poprawne komponenty, nie jak dopracowany system |
| Dostępność i interakcje | 6/10 | Subnav i większość głównych akcji mają 44 px | Badge nie jest akcją, link aktywnego planu w hero ma ok. 16 px wysokości, loading gubi kontekst |
| Gotowość do następnego sprintu | nie | Kod jest stabilnym punktem wyjścia | Najpierw trzeba domknąć R2.1 i przejść checkpoint urządzeniowy |

## Co zostało zrobione dobrze

- Wspólny header i lokalna nawigacja **Dziś | Plany** realizują właściwy model
  informacji. Biblioteka nie jest już ukryta za przypadkową kartą Home.
- Hero przestał być jednym wielkim linkiem: CTA startuje sesję, nazwa planu
  prowadzi do szczegółu, a pozostałe akcje są wydzielone.
- Z Home zniknęły powitanie, stała karta „Przeglądaj programy”, stała karta
  Ekipy i puste wskazówki. To jest właściwy kierunek redukcji szumu.
- Dane Home są pobierane równolegle; guidance nie blokuje hero.
- Aktywna sesja jest traktowana jako globalny stan z mini-barem, a nie jako
  konkurencyjna karta „Wznów” na Home.
- Brak błędów konsoli w sprawdzonym widoku oraz brak poziomego overflow przy
  320 px to pozytywna baza, nie detal do pominięcia.

## Różnice między kontraktem a implementacją

### P0 — usunąć pełną kartę tygodnia z domyślnego Home

**Stan obecny:** `app/page.tsx` nadal renderuje `FlameWeek` przed hero po
pierwszej sesji. Jest to pełna karta z siedmioma płomieniami i licznikiem passy.

**Problem:** dokument docelowego flow wprost mówi, że z domyślnego Home znika
„pełna karta tygodnia z siedmioma płomieniami”. Cel tygodniowy ma być zwarty w
headerze, a szczegół dostępny po tapnięciu. Obecna karta jest kompromisem,
który zachowuje wcześniejszy ekran zamiast rozwiązać nowy model.

**Efekt zauważalny:** na wysokości 568 px floating navigation nachodzi na CTA
hero. W sprawdzonym widoku przycisk kończył się na `y=513`, a nav zaczynał na
`y=486`. To jest regresja funkcjonalna, nie tylko kwestia estetyki.

**Doprecyzowanie:** szczegół tygodnia powinien otwierać się z badge'a w headerze
jako dostępny bottom sheet: wynik celu, krótki opis, ewentualnie unikalne dni
aktywności/passa oraz link do Historii. Nie należy przenieść całej karty tylko
niżej na tej samej stronie.

**Kryterium akceptacji:** bez aktywnej sesji hero jest pierwszym merytorycznym
modułem po subnavie na 320 × 568 i 393 × 852; jego CTA nie styka się z mini-barem
ani floating navem.

### P0 — badge celu musi być realną, dopracowaną akcją

**Stan obecny:** badge `Flame + 2/2` jest nieklikalnym elementem `span` z
`role="status"`. Wizualnie ma szare tło i mały glif; wygląda jak techniczna
etykieta, a nie świadomy element headera.

**Problem:** kontrakt Home obiecuje, że szczegół tygodnia jest dostępny po
tapnięciu. Obecna implementacja nie daje tej drogi, więc użytkownik widzi liczbę,
ale nie może jej zrozumieć ani sprawdzić postępu.

**Właściwy kierunek wizualny:** nie duża ikona 3D w chrome. Ikony 3D są
zarezerwowane dla empty states, onboardingu i celebracji. Badge powinien być małym
„momentem marki”: target co najmniej 44 × 44 px, ciepły terracotta/soft-rust
stan aktywny, czytelne `2/2`, subtelny stan „cel osiągnięty” i jasny focus state.

**Kryterium akceptacji:** tap/Enter/Space otwierają sheet; Escape, overlay i
swipe w dół go zamykają; fokus wraca na badge. Wartość ma jedną semantykę:
ukończone treningi, nie mieszankę treningów, dni i passy.

### P1 — hero wymaga drugiej warstwy polishu

**Stan obecny:** hero ma poprawną strukturę, ale język i cele pomocnicze są
nierówne. Tekst `Rotacja A → B → C · następny trening po ostatniej ukończonej
sesji` jest wewnętrzną logiką produktu, a nie pomocą dla użytkownika. Stopka ma
trzy równorzędne akcje: „Podgląd ćwiczeń”, „Inny dzień”, „Bez planu”. Link z nazwą
aktywnego planu ma w aktualnym DOM około 16 px wysokości.

**Problem:** podstawowa akcja jest dobra, ale detale komunikują „wszystkie opcje
naraz”. To osłabia jedną intencję Home. Mały target aktywnego planu nie spełnia
minimalnego standardu dotykowego.

**Doprecyzowanie implementacyjne:**

- skrócić copy do komunikatu o korzyści, np. „Następny w rotacji A → B → C”;
- nazwa planu musi być 44 px celem tapnięcia, z kontrolą długiej nazwy;
- „Inny dzień” nazwać **„Zmień”** i traktować jako jeden, przewidywalny wybór;
- ograniczyć pomocnicze akcje do hierarchii tekstowej, bez trzech równie głośnych
  decyzji w jednym rzędzie;
- pozycję i padding hero sprawdzić z globalnym chrome na małych wysokościach.

**Kryterium akceptacji:** przy pierwszym spojrzeniu użytkownik odczytuje tylko:
następny trening → liczba ćwiczeń/czas → Zacznij. Alternatywy są dostępne, ale nie
konkurują z CTA.

### P1 — lista programów jest funkcjonalna, ale zbyt „danymi w kapsułkach”

**Stan obecny:** karta programu wyświetla do sześciu chipsów metadanych plus
osobny przycisk „Ustaw”. Przy długich polskich etykietach karta rośnie pionowo i
przypomina tabelę filtrów.

**Problem:** biblioteka ma pomagać porównać programy, nie wyświetlić wszystkie
atrybuty rekordu na pierwszym poziomie. Obecny wzór jest technicznie kompletny,
ale nie ma edytorskiej hierarchii ani oddechu premium.

**Doprecyzowanie:** na karcie pozostawić nazwę, najwyżej dwie najważniejsze
informacje zależne od kontekstu (np. środowisko + częstotliwość) oraz „Pasuje do
Twojego kierunku”, jeśli dotyczy. Pełną specyfikację zostawić na szczegół programu.
Przycisk aktywacji zachować, ale wizualnie podporządkować wyborowi karty.

**Kryterium akceptacji:** użytkownik potrafi wybrać między trzema kartami po
nazwie i dwóch faktach, bez czytania ściany capsule chips.

### P1 — loading trasy Plany nie może usuwać orientacji

**Stan obecny:** `app/programs/loading.tsx` zwraca wyłącznie ogólny
`RouteSkeleton`.

**Problem:** podczas przejścia Dziś → Plany na chwilę znikają wspólny header i
subnav. To łamie wrażenie jednej przestrzeni Treningu oraz powoduje wizualne
„mrugnięcie” chrome.

**Doprecyzowanie:** skeleton Plany ma zawierać `TrainingHeader` i
`TrainingSubnav active="plans"` oraz szkielet właściwej treści; przynajmniej
stałe elementy orientacyjne nie mogą znikać.

**Kryterium akceptacji:** przełączenie Dziś/Plany zachowuje header i segmented
control w każdej fazie ładowania.

### P1 — insight o przeglądzie planu potrzebuje izolacji stanu i stabilnego renderu

**Stan obecny:** `ProgramReviewInsight` zapisuje dismiss w jednym globalnym
kluczu localStorage: `arco-program-review-dismissed`. Stan SSR ukrywa insight,
a klient może go potem dodać do już wyrenderowanej strony.

**Problem:** zamknięcie może przejść między kontami lub programami na tym samym
urządzeniu. Późniejsze pojawienie się komponentu może też przesunąć treść.
To poprawna demonstracja mechaniki, nie gotowa funkcja kontekstowa.

**Doprecyzowanie:** klucz musi być ograniczony co najmniej przez `userId` i
`programId`; widoczność należy ustalić bez zauważalnego skoku layoutu
(rezerwacja miejsca lub serwerowy stan). Dodać test progu co 12 treningów i test
izolacji dwóch programów.

### P2 — decyzje wymagające potwierdzenia, nie automatycznej interpretacji

1. **Badge na ekranie Plany:** obecnie jest celowo ukryty. To da się obronić,
   lecz header dwóch podwidoków wygląda przez to różnie. Albo badge jest trwałym
   elementem przestrzeni Trening, albo wyraźnie zostaje tylko na Dziś. Rekomendacja:
   zostawić tylko na Dziś, ale nie traktować headera Plany jako identycznego.
2. **Filtry i powrót z detalu:** query string jest zachowywany przez `replace`,
   ale nie ma automatycznego testu powrotu z listy ze scrollem. Nie można jeszcze
   uznać tego punktu R2 za zweryfikowany.
3. **Pokrycie testami R2:** zielony istniejący zestaw testów nie testuje nowych
   interakcji Home. Potrzebne są co najmniej testy komponentowe/flow dla badge'a,
   hero, insightu oraz zachowania loadingu.

## Czego nie robić w ramach refinementu

- Nie dodawać dużej ikony 3D płomienia do headera ani kolejnych ikon 3D w
  zwykłych kartach i listach. To naruszy zasadę oszczędnego użycia 3D i osłabi
  efekt ikon w stanach pustych oraz celebracjach.
- Nie przywracać pełnej karty tygodnia tylko dlatego, że zawiera pożądaną
  informację. Informację należy przenieść do interaktywnego szczegółu celu.
- Nie budować osobnego ekranu profilu, nowej analityki ani schedulera. R2.1 ma
  domknąć obecną decyzję, nie rozszerzać zakres.
- Nie przechodzić do R3a jako „kompensacji” dla niedoskonałego Home. Kolejny hub
  odziedziczy ten sam niedopracowany chrome i wzór hierarchii.

## Proponowana paczka R2.1 i kolejność

1. **Cel tygodniowy:** interaktywny badge + accessible sheet szczegółu; usunięcie
   `FlameWeek` z domyślnego Home.
2. **Hero:** poprawa hierarchii, copy, targetów dotykowych i małych wysokości.
3. **Plany:** skeleton z zachowanym chrome oraz uproszczenie kart programu.
4. **Trwałość i testy:** izolacja insightu, testy zachowań R2 oraz screenshoty
   referencyjne 320 × 568 i 393 × 852.
5. **Checkpoint właściciela:** iPhone PWA, Safari, Arc/Chromium i Android:
   Home → badge → sheet → Dziś/Plany → szczegół → Back; start/minimalizacja/
   wznowienie aktywnej sesji; stary cache po deployu.

## Definition of Done R2.1

- Home bez aktywnej sesji zaczyna się od hero, a jego CTA pozostaje w pełni
  dostępne nad floating navem na 320 × 568 oraz 393 × 852.
- Badge celu jest klikany, ma minimum 44 × 44 px i otwiera szczegół bez
  przewijania/klikania tła; jest dostępny klawiaturą i poprawnie oddaje fokus.
- Tygodniowy postęp ma jedną semantykę: ukończone treningi. Dni/passa mogą być
  objaśnieniem w szczególe, nie drugim licznikiem na Home.
- Hero ma jeden dominujący CTA, wszystkie pomocnicze cele są dotykowo poprawne,
  a copy nie opisuje wewnętrznej mechaniki rotacji.
- Karty biblioteki mają czytelną hierarchię zamiast kompletnej listy metadanych.
- Przejście Dziś/Plany nie usuwa headera ani subnavigacji w stanie ładowania.
- Insight nie przecieka między użytkownikami/programami i nie powoduje skoku
  layoutu; zachowanie ma test regresji.
- Wszystkie nowe zachowania przechodzą lint, testy, build oraz checklistę mobile/PWA.

## Źródła decyzji

- `docs/userflows-docelowe-2026-07.md`, zwłaszcza §3 „Kontrakt home” i F2–F4.
- `docs/plan-sprintow-2026-07.md`, R2.
- `docs/wytyczne-designu.md` i `docs/prompt-ikony-3d-clay.md`.
- Kod: `app/page.tsx`, `components/TrainingHeader.tsx`, `app/FlameWeek.tsx`,
  `app/programs/page.tsx`, `app/programs/loading.tsx`,
  `app/ProgramReviewInsight.tsx`.

