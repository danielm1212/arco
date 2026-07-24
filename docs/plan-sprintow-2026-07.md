# Arco — aktywny plan sprintów

**Rebaseline:** 2026-07-20
**Refinement walidacji i premium:** 2026-07-20
**Refinement core:** 2026-07-21
**Refinement biblioteki treningów:** 2026-07-21
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
RB0 ✓ → Q1 → CORE-0 → R4A → PLAN-Q → R2.2 → R4B–R4D → CORE-1 → R4E → R3b → R5b → R6 → H2-Lab → H2-Field → PRIV-1 → COMM/PREMIUM → PAY-01 → MOBILE-0 → STORE-BETA → STORE-1
```

CORE-0 wyprzedza R4A, ponieważ interfejs aktywnej serii nie może utrwalać nieprawidłowego
kontraktu `completed`, jednostki ani statystyk. R4A wyprzedza R2.2 i R3b, ponieważ wpisanie
serii jest rdzeniem używanym przez każdą osobę w każdym treningu. CORE-1 wchodzi dopiero po
Historii/backfillu R4D, ale przed R4E: guidance drugiego treningu wymaga snapshotu recepty,
wersjonowanej decyzji i jawnego minimum danych. R2.2 pozostaje krótkim, odizolowanym etapem
zaufania do Planów po sprawdzeniu podstawowej pętli loggera. PLAN-Q wchodzi po R4A, aby nie
blokować naprawy podstawowej pętli serii, ale przed R2.2 i R4C: filtr sprzętu potrzebuje
wykonalności per slot, a finish musi znać semantykę ćwiczenia opcjonalnego.

**Wpływ na sprint:** refinement dodaje przed H2 łącznie 5,5–7,5 dnia implementacji
(CORE-0: 2,5–3,5; CORE-1: 3–4). To świadome przesunięcie startu badania, nie ukryty bufor.
Jeżeli termin rekrutacji H2 jest już umówiony, przesuwamy sesje badawcze; nie ścinamy bramek
integralności ani nie pokazujemy niesprawdzonego guidance. RIR-01 pozostaje eksperymentem
opcjonalnym i nie blokuje H2.

TRAIN-01 + PLAN-Q dodają przed H2 kolejne 8,5–13 dni implementacji plus checkpointy urządzeń.
Łączny jawny koszt refinementów CORE + biblioteka to 14–20,5 dnia. To bramka jakości obecnych
15 programów, nie sprint rozbudowy biblioteki. Audyt Codex zatwierdził docelowe recepty;
zewnętrzny trener nie blokuje wdrożenia ani H2.

Publiczne konta, płatności, Strava, warstwa trenerów i duże nowe powierzchnie nie wchodzą
przed wynikiem R8. Konta deweloperskie sklepów można przygotować administracyjnie po R6,
lecz migracja UI nie wchodzi przed dowodem PAY-01, chyba że H2-F wykaże, że PWA samo blokuje
użycie lub płatność.

## RB0 — rebaseline dokumentacji i higiena repo

**Czas:** 1 dzień
**Status:** zamknięte lokalnie 2026-07-20; oczekuje na commit

**Wynik:** jeden kanon, backlog, plan, rejestr decyzji i standard pracy agentów.

**Done:** maksymalnie siedem dokumentów sterujących, brak martwych linków i sprzecznych statusów,
każde otwarte zadanie ma ID, etap i obserwowalny wynik.

## Q1 — bramka zaufania

**Czas:** 1,5–3 dni po dodaniu TRAIN-01
**Właściciele:** Codex dla audytu treści + agent + [Ty] dla urządzenia

### Q1.1 — produkcja i konto

- TRUST-01: sticky logger na iPhone PWA po aktualizacji i starym Service Workerze;
- TRUST-02: świeże konto, skip/finish onboardingu, `0/N`, nowe urządzenie i usunięcie historii;
- TRUST-03: każdy bottom sheet zachowuje pozycję strony przy zamknięciu przez X, overlay,
  Escape, swipe i akcję; test automatyczny plus iPhone PWA obejmuje środek i dół długiej strony;
- SEC-03: obrócić legacy `service_role`, podmienić sekret w Vercel i automatyzacjach,
  wykonać smoke akcji serwerowych i dopiero wtedy odwołać stary klucz;
- potwierdzić jeden kontrakt na `main`, w migracjach i na produkcji.

**Stan TRUST-02:** zweryfikowane lokalnie 2026-07-24, zero P0/P1. Pełny onboarding
(7 kroków), skip na starcie, badge `0/N` i ustawienia (jednostki/priorytet/kierunek/cel)
trwałe po reload — potwierdzone w DOM, nie tylko wizualnie. Kluczowa regresja F0.7
(usunięcie treningu z Historii ponownie otwierało onboarding) nie odtwarza się:
`app/page.tsx` liczy `completed` wyłącznie z `user_settings.onboarding_completed_at`,
zero zależności od tabeli `sessions`. „Nowe urządzenie" sprawdzone jako proxy (druga
sesja/cookie) — pełny fizyczny checkpoint iPhone PWA zostaje z TRUST-01/03 dla [Ty].

**Stan TRUST-03:** scalone do `main` i wdrożone. Przyczyną był restart efektu
scroll-locka po zmianie referencji `onOpenChange`; wspólny komponent zachowuje teraz pozycję
i zwraca fokus. Automatyczna macierz przechodzi X/overlay/Escape/swipe/akcję na 320/375/393 px;
pozostaje checkpoint [Ty] na iPhone PWA i Safari.

**Done:** start → logowanie → minimalizacja → wznowienie → zakończenie przechodzi bez P0/P1,
a historia nie steruje stanem onboardingu, a zamknięcie sheeta nie przenosi użytkownika na górę ekranu.

### Q1.2 — bezpieczeństwo ćwiczeń

- CONTENT-01: wszystkie widoczne warianty Hip Thrust;
- CONTENT-02: Chin-Up, zgodność wariantu, chwytu, pozycji i kadru;
- CONTENT-03a: opisy i media z planów początkujących oraz głównych ruchów;
- TRAIN-01: pilny patch kolejności/objętości P11/P12 i brakującego hinge P14;
- TRAIN-02A1–A3: audyt i korekty recept brakujących P01/P03/P08/P11/P12 bez produkcji;
- TRAIN-02A4 pozostaje w PLAN-Q: point sync dopiero po TRAIN-03/05, SEC-03, backupie i dry-runie;
- wynik review zapisać jako wersjonowane dane.

**Stan TRAIN-01:** wdrożone produkcyjnie 2026-07-22 po backupie, audycie otwartych sesji,
dry-runie i zgodności historii migracji. P14 ma receptę v3. P11/P12 nie istnieją na produkcji,
więc migracja zgodnie z kontraktem wykonała dla nich no-op. Nie należy ich teraz dosiewać:
recepty P11/P12 zostały domknięte w TRAIN-02A3, ale pierwszy release nadal czeka na
TRAIN-03/05, SEC-03, backup i dry-run.

**Stan CONTENT-01:** część A jest na produkcji: ryzykowne media Barbell są zablokowane, trzy
sloty mają wersjonowany zamiennik, a instrukcje trzech wariantów są sprawdzone. Część B
obejmuje finalizację pary Barbell
(jednoznaczny pełny wyprost w prawym kadrze, zapis osobnych assetów i decyzja o odblokowaniu)
oraz nowe pary Dumbbell/Single-Leg.

**Stan CONTENT-02:** zmiana jest na produkcji: pięć slotów Chin-Up pozostaje bez zmian, tekst
przeszedł wersjonowany review, a dwa niejednoznaczne kadry zastępuje placeholder do czasu
zatwierdzonej pary start/koniec.

**Stan produkcji po release 2026-07-22:** trzy migracje Q1 są zastosowane, historia lokalna i
zdalna jest zgodna, a punktowa kontrola danych przeszła wszystkie 8 asercji. Aplikacja na Vercel
ma zielony status, ekran logowania renderuje się bez błędów konsoli. Otwarte pozostają SEC-03,
TRAIN-02A4 oraz checkpoint iPhone PWA/Safari; A1–A3 są gotowe technicznie.

**Stan TRAIN-02A1:** read-only `audit:program-catalog` i testy wykrywają dokładnie brakujące
P01/P03/P08/P11/P12, rozjazdy wersji/slugów i blokują point sync każdego niegotowego planu.
Po zakończonych A2/A3 migracja SQL celowo czeka na kontrakt alternatyw TRAIN-03/05.

**Stan TRAIN-02A2:** P01 v2 dodaje 2 serie Lying Leg Curl i redukuje łydki do 2 serii
(19 serii, ok. 46 min w B), P08 v2 redukuje C z 24 do 18 serii (ok. 42 min), a P03 ma
testowane mapowanie 3 alternatyw. Relacje P03 pozostają niepublikowane do TRAIN-03/05;
produkcja i migracje są nietknięte.

**Stan TRAIN-02A3:** P11/P12 mają recepty v3 i zatwierdzoną objętość wszystkich dni:
P11 21/21/18/18, P12 22/22/21/19. Regresje pilnują czasu i 26 przygotowanych ścieżek
sprzętowych. Relacje pozostają niepublikowane do TRAIN-03/05; produkcja i SQL są nietknięte.

**Done:** widoczne ruchy mają zgodny wariant, krótki start, klucz ruchu, bezpieczne zakończenie,
fallback, źródło i wersjonowany review Codex z dowodem wizualnym.

## CORE-0 — bramka integralności danych

**Czas:** 2,5–3,5 dnia
**Zależność:** Q1; wykonujemy przed R4A
**Spec:** `audyt-core-i-plan-2026-07.md`

**Stan:** rozpoczęte 2026-07-24 (Claude). **SEC-03 wstrzymane u [Ty]
(czeka na zewnętrzne wsparcie) nie blokuje CORE-0** — integralność danych jest osobną osią
od rotacji sekretu; jedyne zadanie realnie zablokowane przez SEC-03 to TRAIN-02A4.

**Stan DATA-01:** zaimplementowane na `agent/core-0-data-01`, PR otwarty. Wspólny guard w
trzech warstwach — `lib/setValidation.ts` (`getCompletionBlockReason`), UI
(`useSessionMutations.ts` blokuje `handleToggle`/`handleTimedComplete` z toastem), server
action (`assertCompletableSet` w `app/actions/sets.ts` dla `addSet`/`upsertSet`/`updateSet`)
i DB (trigger `assert_valid_completed_set` w nowej migracji, ostatnia linia obrony). Draft
(`completed=false`) z pustymi polami pozostaje zawsze dozwolony. Zweryfikowane: 116/116 unit
(nowy test `getCompletionBlockReason`), lint, build, `db reset` na świeżej bazie, walidatory
(907/15/308, 60/60), smoke phase1/phase2/offline zielone, ręczny SQL scratch-test triggera
(7 przypadków: weighted/bodyweight/timed × odrzucone/przyjęte + draft zawsze przechodzi,
transakcja wycofana, zero trwałych danych), oraz manualna weryfikacja w przeglądarce (toast
blokujący pustą serię, normalne zaliczenie po wpisaniu wartości). `smoke:team` nie uruchomiony
— brak lokalnego `TEAM_TEST_PASSWORD`, niezwiązane z tą zmianą.

- DATA-01: zakończona seria ma wynik wymagany przez typ ćwiczenia; ten sam guard działa
  w UI, Server Action i bazie/RPC;
- DATA-02: ciężary mają kanoniczną jednostkę w danych, a `kg/lbs` jest konwersją prezentacji;
  istniejące konta są migrowane po backupie i audycie, bez ślepego przeliczenia;
- DATA-03: jedna definicja kwalifikowanego faktu zasila Historię, cel, Ekipę, rekordy,
  Postępy i guidance; sesja otwarta może pokazać wynik prowizoryczny tylko w loggerze;
- SYNC-01: błąd trwały operacji nie blokuje całego outboxa; zachowujemy dane do odzyskania,
  odróżniamy retry od naprawy i finish rozlicza operacje bieżącej sesji.

**Poza zakresem:** nowy wygląd loggera, PowerSync, multi-device merge, nowe guidance.

**Done:** nie da się zaliczyć ani zakończyć pustej serii, zmiana jednostki nie zmienia znaczenia
historii, wszystkie pochodne liczą te same fakty, a jedna błędna operacja nie więzi kolejki.

## PLAN-Q — biblioteka treningów 10/10

**Czas:** 8–12 dni + checkpoint iPhone/Android; audyt programowy Codex jest wykonany
**Zależność:** TRAIN-01, CORE-0 i R4A; wykonujemy przed R2.2 oraz R4B–R4D
**Spec:** `spec-plan-q-biblioteka-treningow.md`

- TRAIN-02: jeden strukturalny katalog 15 programów, z którego korzystają seed, walidatory
  i karty `docs/trainings/`;
- TRAIN-03: addytywna recepta v2 — czas dnia/slotu, RIR, tempo, typ progresji, rola,
  opcjonalność i wersjonowane alternatywy; legacy działa bez zgadywanego backfillu;
- TRAIN-04: korekta wszystkich 15 programów, w tym P02/P07/P08/P13 oraz pełne review
  kolejności, wzorców, objętości, czasu, przerw i instrukcji;
- TRAIN-05: kanoniczny sprzęt, wymagania per ćwiczenie i deterministyczna wykonalność per slot;
- TRAIN-02A4: pierwsza publikacja P01/P03/P08/P11/P12 dopiero po gotowym kontrakcie
  alternatyw i prawdy sprzętowej;
- TRAIN-06: karta i detal planu pokazują realny czas, sprzęt, przerwy, opcjonalność i dostępne
  warianty bez przeciążania głównego widoku;
- TRAIN-07: walidator CI, bezpieczny seed, RLS, regresja aktywnych planów/sesji i urządzeń.
- SESSION-01A po R4A: mała, opcjonalna rekomendacja rozgrzewki specyficznej i zakończenia;
  serie `warmup` nie liczą się do objętości/ukończenia, a rozciąganie nie obiecuje regeneracji.

**Poza zakresem:** nowe programy, cel 1/tydzień, interaktywny SESSION-01B, obowiązkowe RIR,
automatyczny deload, pełny model objętości oraz warianty Minimum/Standard/Plus. PROGRAM-01A
20–30 minut pozostaje eksperymentem po sygnale H2, nie dodatkowym treningiem do aktywnego planu.

**Done:** 15/15 programów przechodzi walidator i zatwierdzony audyt Codex; seed zachowuje ID,
aktywne plany, własne programy, otwarte sesje i historię; filtr może policzyć wykonalność każdej
obowiązkowej pozycji; UI przechodzi 320/375/393 px, iPhone PWA, Android i stary cache.

## R2.2 — zaufanie do Planów

**Czas:** 1–1,5 dnia

- PLAN-01: filtr „Tylko z moim sprzętem” w sheecie programów;
- użyć wykonawczego kontraktu TRAIN-05, nie samych zbiorczych metadanych programu;
- ustawienia pozostają źródłem inwentarza;
- powrót z detalu zachowuje filtr i scroll;
- sprawdzić CTA własnego programu bez dokładania FAB.

**Poza zakresem:** okładki i automatyczna zmiana programu; nowe klucze potrzebne do prawdy
sprzętowej wchodzą w PLAN-Q, ale nowe marketingowe profile biblioteki czekają na H2.

**Done:** użytkownik rozumie wpływ sprzętu i potrafi ograniczyć wyniki do wykonalnych planów.

## R4 — Logger, Historia i drabina wartości

**Czas:** 6–7 dni implementacji R4 + 3–4 dni CORE-1 + dwa osobne checkpointy regresji PWA.

**Kolejność wykonawcza:** R4A (pętla serii) → R4B (pierwsza sesja) → R4C
(finish, własny trening i podmiana) → R4D (Historia/backfill) → CORE-1 (minimalny
wiarygodny silnik) → R4E (wartość drugiego treningu). Szczegółowy, agent-ready kontrakt
i Definition of Done są w `spec-r4-logger.md`. R4A zaczyna się po CORE-0; R2.2 nadal
wchodzi po checkpointcie R4A.

### R4.1 — prowadzenie serii

- LOG-01: subtelny, jednoznaczny sygnał „Zalicz serię” i logiczny fokus;
- LOG-02: jednorazowe, pomijalne podpowiedzi pierwszego treningu;
- aktywna seria, przejście przez wiele serii/ćwiczeń oraz nieblokujący timer są
  warunkiem Done, nie detalem POC;
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

- CORE-1 jest zamknięte przed wystawieniem guidance w R4E;
- po pierwszym finishu pokazać fakt i konkretny następny krok, nie sztuczną analizę;
- przy drugim treningu widocznie wykorzystać poprzedni wynik;
- guidance i prognoza mają minimalną liczbę sesji/serii oraz stan „potrzebujemy jeszcze…”;
- każda wskazówka wyjaśnia powód i pozwala użytkownikowi ją nadpisać;
- trial premium nie jest uruchamiany w tym sprincie.

**Done:** pierwsza osoba rozumie logowanie bez moderatora, może bezpiecznie zakończyć lub
poprawić trening, wraca do właściwego kontekstu i wie, co Arco da jej dziś oraz później.

## CORE-1 — minimalny wiarygodny silnik

**Czas:** 3–4 dni
**Zależność:** CORE-0, R4A i R4D; wykonujemy przed R4E
**Spec:** `audyt-core-i-plan-2026-07.md`

- ENGINE-01: nowa sesja zachowuje snapshot planowanych serii, zakresu, przerwy i źródła
  recepty; późniejsza edycja planu nie przepisuje kontekstu treningu; starsze sesje bez
  snapshotu mają jawny stan legacy i obniżoną pewność, bez zgadywanego backfillu;
- ENGINE-02: decyzja ma strukturę `action`, `reason_codes`, `confidence`, `evidence_level`,
  `rule_version`, `inputs` i stan insufficient-data; tekst UI jest projekcją tej decyzji;
- ENGINE-03: progresja używa wszystkich serii poprzedniej sesji, realnego najmniejszego
  skoku sprzętu i priorytetu; nie zwiększa ciężaru na podstawie jednego najlepszego wyniku;
- ENGINE-04: obecna reguła deloadu staje się obserwacją plateau z bezpiecznym następnym
  krokiem; pełny klasyfikator zmęczenia czeka na dane H2;
- ENGINE-05: macierz realistycznych historii obejmuje progres, szum, zmianę zakresu,
  brak danych, podmianę, backfill i edycję; żadna decyzja nie mutuje planu automatycznie;
- RIR-01: opcjonalny sygnał RIR/RPE trafia wyłącznie do dogfoodu/shadow mode przed decyzją,
  czy warto dodawać tarcie do loggera początkującego.

**Poza zakresem:** ML/AI, automatyczne programowanie, pełny model objętości, prognoza celu,
kalibracja wag rekomendatora i automatyczny deload.

**Done:** R4E potrafi pokazać poprzedni fakt i jedną nadpisywalną decyzję z jawnym powodem
albo uczciwy stan „potrzebujemy jeszcze…”. Ta sama historia daje tę samą wersjonowaną decyzję.

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
- PWA-01: iPhone PWA/Safari, Android/Chromium, desktop i stary Service Worker; scroll-lock
  każdego sheeta zachowuje dokładną pozycję strony po X, overlayu, Escape, swipe i akcji;
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
- 15/15 programów systemowych przechodzi walidator PLAN-Q i zatwierdzony audyt Codex;
- jedna sesja, szkice i offline przechodzą test procesu/PWA;
- każdy hub ma loading/empty/error/offline/success;
- Ekipę sprawdzono na dwóch kontach, prywatność na trzech;
- iPhone PWA i Android/Chromium przechodzą rdzeń albo ograniczenie jest jawne;
- plansza VISUAL-05, dane demo, scenariusz i kanał feedbacku są gotowe.
