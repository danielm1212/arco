# Arco — aktywny plan sprintów

**Rebaseline:** 2026-07-20
**Refinement walidacji i premium:** 2026-07-20
**Status:** źródło prawdy dla kolejności wykonania
**Cel:** użyteczny i wiarygodny produkt, który najpierw dowodzi powrotów, a dopiero potem prosi o pieniądze

Kompletna kolejka jest w `backlog-produktu.md`, trwałe decyzje w `decyzje-produktowe.md`,
a aktualny stan produkcji w `HANDOFF.md`. Agent realizuje zadania według
`standard-zadania-agentow.md`.

## 1. Stan bazowy

### Dowiezione

- R0/R0.5: docelowa architektura i prototyp flow;
- R1a/R1b: kontrakt chrome, Back/replace, jedna otwarta sesja, szkice i offline;
- R2/R2.1: Home/Dziś, Plany, klikalny cel, spokojny hero i floating nav;
- R3a: Postępy/Ciało oraz osobny flow pomiaru;
- F0.1–F0.7: spójny cel, stan konta, wpływ sprzętu i badge `0/N`;
- F0.2/F0.3: bezpieczna podmiana, walidacja anomalii i wiarygodne rekordy;
- L9/L10: ten sam cel, passa i tydzień Warszawy w Ekipie;
- R5a core: polskie nazwy, aliasy, ranking i wyszukiwanie bez diakrytyk;
- UX PWA: scroll lock, swipe, safe area, bottom nav, pomiary i trening po fakcie.

### Częściowe

- R4: logger, edycja i backfill działają; brakuje prowadzenia pierwszej sesji, domknięcia
  własnego treningu, części zachowania scrolla i drabiny wartości;
- R3b: v0 Ekipy ma utworzenie/dołączenie, zgodę, multi-team UI, reakcje i nudge;
  brakuje pełnego kontraktu huba, unread, zdarzenia Home, trwałego wyboru i dogfoodu;
- R5b: sheety są funkcjonalne; pełny focus trap, radiogroup i macierz urządzeń są otwarte.

## 2. Sekwencja

```text
RB0 ✓ → Q1 → R2.2 → R4 → R3b → R5b → R6 → H2-Lab → H2-Field → PRIV-1 → COMM/PREMIUM → PAY-01 → MOBILE-0 → STORE-BETA → STORE-1
```

R4 wyprzedza R3b, ponieważ logger jest rdzeniem używanym przez każdą osobę. Publiczne konta,
płatności, Strava, warstwa trenerów i duże nowe powierzchnie nie wchodzą przed wynikiem R8.
Konta deweloperskie sklepów można przygotować administracyjnie po R6, lecz migracja UI nie
wchodzi przed dowodem PAY-01, chyba że H2-F wykaże, że PWA samo blokuje użycie lub płatność.

## RB0 — rebaseline dokumentacji i higiena repo

**Czas:** 1 dzień
**Status:** zamknięte lokalnie 2026-07-20; oczekuje na commit

**Wynik:** jeden kanon, backlog, plan, rejestr decyzji i standard pracy agentów.

**Done:** maksymalnie siedem dokumentów sterujących, brak martwych linków i sprzecznych statusów,
każde otwarte zadanie ma ID, etap i obserwowalny wynik.

## Q1 — bramka zaufania

**Czas:** 1–2 dni
**Właściciele:** agent + [Ty] dla urządzenia + trener dla treści technicznej

### Q1.1 — produkcja i konto

- TRUST-01: sticky logger na iPhone PWA po aktualizacji i starym Service Workerze;
- TRUST-02: świeże konto, skip/finish onboardingu, `0/N`, nowe urządzenie i usunięcie historii;
- potwierdzić jeden kontrakt na `main`, w migracjach i na produkcji.

**Done:** start → logowanie → minimalizacja → wznowienie → zakończenie przechodzi bez P0/P1,
a historia nie steruje stanem onboardingu.

### Q1.2 — bezpieczeństwo ćwiczeń

- CONTENT-01: wszystkie widoczne warianty Hip Thrust;
- CONTENT-02: Chin-Up, zgodność wariantu, chwytu, pozycji i kadru;
- CONTENT-03a: opisy i media z planów początkujących oraz głównych ruchów;
- wynik review zapisać jako wersjonowane dane.

**Done:** widoczne ruchy mają zgodny wariant, krótki start, klucz ruchu, bezpieczne zakończenie,
fallback, źródło i jawne review człowieka.

## R2.2 — zaufanie do Planów

**Czas:** 0,5–1 dnia

- PLAN-01: filtr „Tylko z moim sprzętem” w sheecie programów;
- ustawienia pozostają źródłem inwentarza;
- powrót z detalu zachowuje filtr i scroll;
- sprawdzić CTA własnego programu bez dokładania FAB.

**Poza zakresem:** nowe profile sprzętu, okładki i automatyczna zmiana programu.

**Done:** użytkownik rozumie wpływ sprzętu i potrafi ograniczyć wyniki do wykonalnych planów.

## R4 — Logger, Historia i drabina wartości

**Czas:** 5–6 dni + regresja PWA

### R4.1 — prowadzenie serii

- LOG-01: subtelny, jednoznaczny sygnał „Zalicz serię” i logiczny fokus;
- LOG-02: jednorazowe, pomijalne podpowiedzi pierwszego treningu;
- natychmiastowy feedback, outbox i brak autozaliczania;
- bez dekoracyjnego motion w loggerze.

### R4.2 — zakończenie i własny trening

- LOG-03: końcowe CTA na dole ze wspólnym guardem;
- LOG-04: utrzymać ochronę pustej i niepełnej sesji po stronie UI i serwera;
- LOG-05: zapis niepustej własnej sesji jako nieaktywnego jednodniowego programu z Done albo
  ze szczegółu Historii;
- ciężary nie przechodzą do szablonu jako rekomendacja.

### R4.3 — podmiana, materiały i edytor

- LOG-06: wyniki przed filtrami, szczegóły w „Więcej filtrów”;
- PLAN-03: własne ćwiczenie bez opuszczania miejsca w edytorze;
- LOG-07: dokładny powrót scrolla po sheecie;
- LOG-08: pełnoekranowe zdjęcie z prostym zamknięciem i fallbackiem.

### R4.4 — Historia i backfill

- HISTORY-01: zachować stronę, filtry i scroll;
- `/history/add`: prawdziwa data/czas i progresywny wybór źródła;
- edycja bez Done, celebracji i drugiego check-inu;
- backfill z mikro-potwierdzeniem i tylko faktycznym PR;
- HISTORY-02 pozostaje hipotezą do testu po R4.

### R4.5 — VALUE-01, drabina wartości

- po pierwszym finishu pokazać fakt i konkretny następny krok, nie sztuczną analizę;
- przy drugim treningu widocznie wykorzystać poprzedni wynik;
- guidance i prognoza mają minimalną liczbę sesji/serii oraz stan „potrzebujemy jeszcze…”;
- każda wskazówka wyjaśnia powód i pozwala użytkownikowi ją nadpisać;
- trial premium nie jest uruchamiany w tym sprincie.

**Done:** pierwsza osoba rozumie logowanie bez moderatora, może bezpiecznie zakończyć lub
poprawić trening, wraca do właściwego kontekstu i wie, co Arco da jej dziś oraz później.

## R3b — Ekipa jako prawdziwy hub

**Czas:** 3–4 dni + dogfood [Ty]

### R3b.1 — kontrakt i stany

- TEAM-01: ocenić istniejące v0, nie przepisywać go od zera;
- hub bez Back, empty z dwoma CTA, loading/error/offline/partial-data;
- jawna zgoda i opis danych; max 3 ekipy i 6 osób;
- RLS na A+B w ekipie i C poza nią.

### R3b.2 — nawigacja i aktualność

- TEAM-02: ostatnio wybrana Ekipa;
- TEAM-03: dostępna kropka unread na tabie;
- TEAM-04: najwyżej jedno istotne zdarzenie na Home, znikające po odczycie;
- brak dzwonka i stałej karty Ekipy.

### R3b.3 — tarcie i dogfood

- TEAM-05: tap w kod lub ikonę kopiuje zaproszenie i potwierdza wynik;
- w 2–3 sekundy widać, kto trenował i czy mogę wesprzeć;
- reakcja/nudge bez zawstydzającego copy;
- TEAM-06: dwa konta przechodzą cały cykl, następnie przygotowanie trzech par do H2-E;
- sprawdzić tydzień Warszawy, retry finishu i brak prywatnych danych treningowych.

**Done:** każda akcja ma skutek u właściwej osoby, a hub nie zmienia się w feed lub ranking.

## R5b — dostępność i pełna regresja PWA

**Czas:** 3–4 dni + urządzenia [Ty]

- A11Y-01: focus trap, Escape, zwrot fokusu i role/dialog dla każdego sheeta;
- A11Y-02: radiogroup i komunikaty błędów;
- A11Y-03: 200% zoom, 320 px, reduced motion, kontrast i kolejność Tab;
- PWA-01: iPhone PWA/Safari, Android/Chromium, desktop i stary Service Worker;
- PWA-02: ubity proces, offline, szkice, mini-bar i odzyskanie;
- pomiar stabilnego czasu pojawienia się głównego CTA Home.

**Done:** krytyczne flow przechodzą macierz, a znane P0/P1 wynoszą zero.

## R6 — gotowość badania i bramka wizualna

**Czas:** 3–4 dni

- TEST-01: realistyczne konto demo i czyste konto onboardingowe;
- TEST-02: aktualny scenariusz H2 i automatyczna regresja flow;
- FEEDBACK-01: prywatny feedback z numerem builda i urządzeniem;
- ONB-01: czytelny moment „Wszystko gotowe” z reduced-motion;
- ONB-04: każde pytanie onboardingu realnie zmienia rekomendację albo jest odłożone;
- VISUAL-05: plansza zrzutów onboarding, Home, Plany, logger, podmiana, Historia, Postępy
  i Ekipa na 320/375/393 px oraz urządzeniu;
- porównać hierarchię CTA, typografię, odstępy, gęstość, ikony, safe area i stany;
- poprawić tylko niespójności wpływające na zrozumienie lub jakość, bez pełnego redesignu;
- METRICS-01: zamrozić kartę wyników przed rekrutacją.

**Done:** moderator nie tłumaczy interfejsu, zrzuty potwierdzają jeden język produktu, dane są
powtarzalne, feedback ma jedno repozytorium, a progi wyniku nie mogą się przesunąć po badaniu.

## R7 — H2-Lab: użyteczność, wartość i Ekipa

**Czas:** 1–2 tygodnie kalendarzowo

### H2-U — użyteczność

- 5 osób na własnych telefonach;
- minimum jedna początkująca i minimum dwie regularnie trenujące;
- onboarding, start/logger, podmiana, finish, Historia/backfill, Postępy/Ciało i Plany;
- sukces bez pomocy, pierwszy błędny tap, czas, zawahania i cytaty;
- twarda bramka: brak S4 i minimum 4/5 przechodzi rdzeń samodzielnie;
- poprawić P0/P1 i powtórzyć zmienione zadanie.

### H2-V — wartość premium

- osobna grupa 5–8 osób z ICP płacącego, które już zapisują treningi;
- pokazać działające guidance i dane; prognozę oznaczyć jako koncept, jeśli nie działa end-to-end;
- testować trzy obietnice, dokładną cenę 99 zł/rok lub 14,99 zł/mies. i limit historii;
- Van Westendorp oraz deklaracje są materiałem jakościowym, nie dowodem sprzedaży;
- wybrać jedną najmocniejszą obietnicę do PREMIUM-01.

### H2-E — Ekipa w parze

- trzy prawdziwe pary przechodzą zaproszenie, zgodę, reakcję i nudge;
- obserwować zachowanie, nie samo „podoba mi się”;
- brak dyskomfortu prywatności i problemów S4.

**Done:** użyteczność rdzenia jest zielona, jedna obietnica premium prowadzi jakościowo, a
Ekipa ma dowód z prawdziwej relacji. Ten etap nie zatwierdza jeszcze płatności.

## R8 — H2-Field: trzytygodniowy pilot terenowy

**Czas:** 3 tygodnie kalendarzowo
**Kohorta:** 8–12 zarządzanych kont testowych

- realne treningi na własnych telefonach i własnej sieci;
- minimum 4 osoby z ICP płacącego, minimum 3 początkujące lub wracające;
- trzy pary mogą być częścią tej samej kohorty;
- feature freeze poza P0/P1; każdy fix ma powtórny checkpoint;
- cotygodniowy krótki wywiad i feedback w aplikacji;
- IMPORT-01: checkbox/landing i ręczna analiza maksymalnie 5 eksportów CSV;
- po minimum trzech sesjach pokazać dokładną cenę i zebrać jawną rezerwację płatnej bety;
- nie pobierać pieniędzy przed gotowością prawną.

**Bramka R8:** progi z `backlog-produktu.md` są zamrożone przed kohortą. Zero utraty danych,
zielony powrót do 2. i 3. treningu, brak P0/P1 oraz minimum trzy rezerwacje płatnej bety od ICP.

## 3. Po R8

### Gdy zaufanie lub użyteczność są czerwone

- zatrzymać nowe funkcje;
- naprawić rdzeń i powtórzyć właściwy fragment badania;
- nie interpretować ceny ani WTP.

### Gdy użyteczność jest zielona, ale powroty lub WTP są czerwone

- sprawdzić time-to-value, jakość guidance i obietnicę premium;
- przygotować jeden thin slice zamiast dokładania pakietu funkcji;
- nie obniżać automatycznie ceny;
- wykonać drugi, mniejszy pilot.

### Gdy R8 jest zielone

1. PRIV-1: publiczne konta, RODO, eksport/usunięcie, PRIVACY-01, OPS-01/02 i security hardening;
2. COMM-01: pełny kontrakt subskrypcji i downgrade bez utraty danych;
3. PREMIUM-01: jedna najmocniejsza płatna obietnica end-to-end;
4. PREMIUM-02: uczciwy paywall i porównanie Free/Coach;
5. PAY-01: płatna beta 10–20 osób z realnym zakupem;
6. MOBILE-0: decyzja technologiczna na działającym pionie, nie na prezentacji;
7. STORE-BETA i STORE-1: TestFlight/Google Play, billing, review i etapowe wydanie;
8. dopiero później publiczna Ekipa, udostępnianie planów, trenerzy, Strava, recap i wideo.

## 4. Tor mobilny i sklepy

### STORE-00 — przygotowanie administracyjne

**Moment:** równolegle po R6, bez zatrzymywania H2

- zweryfikować nazwę prawną, właściciela kont i preferować konto organizacji, jeśli Arco ma
  działać jako firma;
- założyć Apple Developer oraz Google Play Console, zarezerwować bundle/package ID i bezpiecznie
  rozdzielić role zamiast współdzielenia jednego hasła;
- przygotować domenę, publiczny support, politykę prywatności i adres usunięcia konta;
- rozpocząć draft App Privacy/Data Safety oraz listę SDK zbierających dane;
- zrekrutować minimum 12 osób do przyszłego testu zamkniętego Androida, jeśli konto podlega
  aktualnemu wymogowi Google 14 kolejnych dni.

### MOBILE-0 — bramka architektury

**Moment:** po PAY-01; wcześniej tylko gdy H2-F udowodni blokadę PWA
**Czas:** 5 dni, osobna gałąź, bez migracji całej aplikacji

Budujemy ten sam pion w dwóch wariantach: logowanie → Home → start/wznowienie → jedna seria
offline → timer → finish → ponowne otwarcie. Porównujemy:

1. **Expo/React Native:** nowa warstwa ekranów, współdzielone typy, reguły domenowe, Supabase,
   walidatory i testy;
2. **Capacitor:** wyłącznie lokalnie spakowany bundle. Wymaga odejścia tego pionu od cookies,
   Server Actions i dynamicznego renderowania Next.js. `server.url` do produkcji jest odrzucone.

Na iPhonie i Androidzie mierzymy: klawiaturę/fokus, scroll i sheety, safe area, systemowy Back,
cold start, offline/recovery, ubity proces, dostępność, wagę bundla i czas utrzymania. Pion zawiera
bezpieczne przechowanie sesji, deep link, lokalne powiadomienie timera oraz zakup sandboxowy.

**Domyślna rekomendacja:** Expo/React Native, jeśli pion przejdzie jakością i nie wymaga
utrzymywania podwójnej logiki. Pełny Swift/Kotlin nie jest kandydatem bez zmierzonego blokera.

**Done:** decyzja zawiera wyniki urządzeniowe, koszt migracji ekranów, mapę ponownego użycia,
ryzyka płatności/offline i plan wycofania. Sam działający build nie rozstrzyga bramki.

### STORE-BETA — dystrybucja zamknięta

- najpierw build wewnętrzny, potem TestFlight i Google Play closed testing;
- ten sam zestaw 12–20 osób przechodzi instalację, logowanie, zakup sandboxowy, restore,
  trening offline, update i usunięcie konta;
- crash-free sessions, błędy zapisu, cold start i support są monitorowane per wersja;
- Google: spełnić aktualny target API i, jeśli dotyczy konta, 12 testerów przez 14 dni;
- Apple: przekazać działające konto demo, kompletne Review Notes i brak pustych powierzchni.

### STORE-1 — wydanie etapowe

- lokalne i angielskie metadata, prawdziwe zrzuty aplikacji, age rating i dostępny support;
- App Privacy/Data Safety zgodne z kodem, zdjęciami Ciała, analityką i dostawcami;
- usunięcie konta w aplikacji oraz ścieżka webowa wymagana przez Google;
- StoreKit/Google Play Billing, restore, manage subscription, grace period, refund/support oraz
  serwerowa synchronizacja uprawnień;
- staged rollout, obserwacja minimum 72 h, gotowy rollback i zatrzymanie promocji przy P0/P1.

**Done:** użytkownik może zainstalować, kupić, odzyskać zakup, anulować i usunąć konto bez
pomocy; listing nie obiecuje niczego, czego build nie dostarcza.

## 5. Rytm realizacji

- Jeden aktywny sprint i jeden aktywny pion produktu.
- Jeden agent edytuje dany komponent lub migrację; rezerwacje są w `koordynacja-agentow.md`.
- Po Q1, R4, R3b i R5b obowiązuje checkpoint urządzeniowy.
- Każdy P0/P1 zatrzymuje przejście dalej.
- Każdy sprint aktualizuje HANDOFF, backlog, plan i koordynację.
- Pomysł trafia najpierw do backlogu i decyzji/bramki.
- R7 i R8 mają feature freeze; głosy użytkowników nie stają się funkcją bez syntezy.

## 6. Bramka wejścia do H2-Lab

- Q1–R6 zamknięte;
- zero znanego P0/P1 w głównych flow;
- widoczne materiały ćwiczeń mają review;
- jedna sesja, szkice i offline przechodzą test procesu/PWA;
- każdy hub ma loading/empty/error/offline/success;
- Ekipę sprawdzono na dwóch kontach, prywatność na trzech;
- iPhone PWA i Android/Chromium przechodzą rdzeń albo ograniczenie jest jawne;
- plansza VISUAL-05, dane demo, scenariusz i kanał feedbacku są gotowe.
