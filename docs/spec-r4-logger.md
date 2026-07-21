# R4 — refinement loggera i Historii

**Status:** gotowe do podjęcia
**Aktualizacja:** 2026-07-21
**Źródło decyzji:** `wizja-i-strategia-v3.md`, `userflows-docelowe-2026-07.md`,
`decyzje-produktowe.md`, `audyt-core-i-plan-2026-07.md`, `spec-plan-q-biblioteka-treningow.md`,
audyt klikalnego POC z 2026-07-21.

## Cel R4

Użytkownik ma wykonywać trening, a nie obsługiwać formularz. Po rozpoczęciu Arco
pokazuje dokładnie następną czynność, zachowuje prawdziwe dane i wykorzystuje je
przy kolejnym treningu. Logger pozostaje darmowym rdzeniem produktu.

Nie jest to redesign loggera ani praca nad Ekipą. Najpierw domykamy mechanikę
serii, dopiero potem backfill, podmianę i wartość drugiej sesji.

**Bramki zewnętrzne R4:** CORE-0 zamyka integralność danych przed R4A. PLAN-Q wchodzi po R4A
i przed R4B–R4D, aby finish znał opcjonalność slotu, a start/snapshot pełną receptę. CORE-1
zamyka minimalny model decyzji po R4D i przed guidance R4E. Nie wciskamy tych prac do
komponentów UI „przy okazji”, bo mają osobne migracje, testy i kryteria wycofania.

## Kontrakt loggera

1. Wynik wpisany w pola jest szkicem. Do statystyk, Historii i progresji trafia
   wyłącznie jawnie zaliczona albo zapisana zmiana serii.
2. Jedna seria jest w danym momencie jednoznacznie aktywna. Użytkownik może
   poprawić serię zaliczoną, ale zmiana ma widoczny stan zapisu.
3. Timer przerwy pomaga, ale nigdy nie blokuje wpisania następnej serii,
   przejścia do ćwiczenia ani minimalizacji sesji.
4. Planowany trening, własna sesja, backfill i edycja korzystają z tych samych
   zasad integralności danych. Różnią się chrome oraz konsekwencją po zapisie.
5. Pusta sesja nie trafia do Historii. Niepełna wymaga świadomego wyboru.
6. Ciężary są prawdziwymi danymi użytkownika, a nie częścią szablonu programu.

## Kolejność i wielkość

| Etap | Wynik użytkownika | Szacunek implementacji | Zależność |
|---|---|---:|---|
| R4A | Płynnie wpisuje kolejne serie podczas treningu | 2 dni | CORE-0 |
| R4B | Rozumie pierwszy trening i bezpiecznie nim zarządza | 1–1,5 dnia | R4A, PLAN-Q |
| R4C | Kończy, zapisuje własną sesję i dobiera ćwiczenia bez utraty kontekstu | 1–1,5 dnia | R4A, PLAN-Q |
| R4D | Dopisuje lub poprawia trening w prawdziwym dniu | 1,5 dnia | R4A, PLAN-Q, R4C |
| CORE-1 | Dane stają się wersjonowaną, wyjaśnialną decyzją | 3–4 dni | CORE-0, R4A, R4D |
| R4E | Przy drugim treningu widzi użytek z wcześniejszych danych | 1 dzień | R4A, R4D, CORE-1 |

Do tego dochodzą dwa osobne checkpointy regresji PWA: po R4A oraz przed zamknięciem
R4. To są dni testowe, a nie „ukryty” czas implementacji.

## R4A — aktywna seria i ciągłość treningu

**Mapowanie:** LOG-01 oraz techniczne doprecyzowanie istniejącego rdzenia loggera.

**Wynik użytkownika:** po każdej serii bez zastanawiania wie, co zrobić dalej,
a dane nie zapisują się przypadkiem.

### R4A-01 — kontrakt stanu sesji

**Zakres:** zweryfikować i, gdzie potrzeba, ujednolicić stany `draft`, `ready`,
`completed`, `edited`, `resting`, `minimized`, `finishing` dla planowanej i
własnej sesji. Statystyki, outbox i zapis serii mają korzystać z tego samego
źródła prawdy.

**Kryteria akceptacji:**

- zaliczona seria zwiększa wolumen i liczbę serii dokładnie raz, także po
  odświeżeniu/wznowieniu;
- wpisane, ale niezaliczone wartości nie liczą się do Historii ani postępu;
- edycja zaliczonej serii aktualizuje wolumen oraz ma jawny stan „Zapisz zmianę”;
- minimalizacja i wznowienie zachowują aktywną serię, draft, timer i pozycję;
- żadna ścieżka UI nie pozwala zapisać pustej sesji.
- przycisk zaliczenia nie przyjmuje pustego wyniku: weighted wymaga ciężaru i powtórzeń,
  bodyweight powtórzeń, timed dodatniego czasu; serwer i baza bronią tego samego kontraktu;
- statystyki globalne i cel nie traktują zakończonego wiersza otwartej sesji jak zamkniętego
  treningu; logger może pokazać go wyłącznie jako wynik prowizoryczny tej sesji.

**Poza zakresem:** nowa analityka, rekomendacje ciężaru, zmiana schematu programu.

### R4A-02 — pętla jednej serii

**Zakres:** aktywny wiersz kg/powtórzenia/zaliczenie, logiczny fokus i przejście
do następnej serii. Układ ma działać dla wielu serii i ćwiczeń, a nie tylko dla
pierwszego wiersza demonstracyjnego.

**Kryteria akceptacji:**

- po otwarciu treningu pierwsze pole jest pierwszym czytelnym celem; autofocus
  jest użyty tylko tam, gdzie nie psuje zachowania iOS;
- po ciężarze fokus przechodzi do powtórzeń; po powtórzeniach `Zalicz` staje się
  wyraźnym, 44 px+ CTA z krótkim feedbackiem i bez przesuwania layoutu;
- nie ma autozaliczania po wpisaniu liczb ani po blurze;
- po zaliczeniu następna seria staje się aktywna, poprzednia pozostaje możliwa
  do korekty, a interfejs nie skacze;
- dla kolejnej serii można pokazać poprzedni ciężar jako edytowalną sugestię
  bieżącej sesji, ale nie jako zapisany wynik;
- pełny trening z co najmniej trzema seriami i dwoma ćwiczeniami przechodzi bez
  zablokowanego wiersza lub ręcznego szukania następnego kroku.

**Decyzja UI:** tekstowa akcja ma być czytelna przy pierwszym użyciu. Nie
zastępujemy jej samą ikoną ✓; na małych ekranach skracamy etykietę do „Zalicz”,
nie touch target.

### R4A-03 — timer jako pomoc, nie bramka

**Zakres:** po zaliczeniu seria dostaje krótki feedback, a timer przerwy rusza
bez przejmowania ekranu.

**Kryteria akceptacji:**

- timer można pominąć, a etykieta jest widoczna i dostępna;
- timer nie blokuje następnego wiersza, ćwiczenia, opcji ćwiczenia ani mini-baru;
- po restarcie PWA odtwarza właściwy pozostały czas albo bezpieczny stan bez timera;
- preferencja reduced motion nie usuwa informacji ani kontroli.

## R4B — pierwszy trening i prowadzenie w kontekście

**Mapowanie:** LOG-02.

**Wynik użytkownika:** nowa osoba potrafi wykonać pierwszy trening bez instrukcji
poza aplikacją.

**Zakres:** maksymalnie pięć krótkich, jednorazowych i pomijalnych podpowiedzi:
wynik → zaliczenie serii → przerwa → opcje/podmiana → minimalizacja lub finish.
Pojawiają się w momencie użycia, nie jako długa instrukcja na starcie.

**Kryteria akceptacji:**

- każda wskazówka ma jedną czynność i można ją zamknąć;
- nie przykrywa pola, CTA, klawiatury ani safe area;
- nie wraca po zamknięciu lub wykonaniu działania;
- pierwszy trening zachowuje spokojny ton: wskazówka, nie lekcja.

**Poza zakresem:** nowy onboarding przed pierwszym ekranem Treningu, dekoracyjne
animacje i gamifikacja.

## R4C — zakończenie, własna sesja i dobór ćwiczeń

**Mapowanie:** LOG-03–LOG-08 oraz PLAN-03.

**Wynik użytkownika:** może bezpiecznie skończyć, stworzyć własny trening i
wrócić do miejsca, z którego wyszedł.

**Zakres i Done:**

- górne i dolne „Zakończ trening” używają tego samego guarda;
- pusta sesja: `Wróć` albo `Usuń`; niepełna: `Wróć` albo `Zakończ krótszy trening`;
- własny trening nie zmienia rotacji aktywnego planu; po niepustej sesji można
  go zapisać jako nieaktywny, jednodniowy program z Done lub szczegółu Historii;
- wybór ćwiczenia pokazuje wyniki przed filtrami, a filtry są w „Więcej filtrów”;
- użytkownik może utworzyć własne ćwiczenie bez opuszczania loggera/edytora;
- sheet szczegółu ćwiczenia przywraca dokładny scroll i fokus; media otwierają
  się pełnoekranowo z prostym zamknięciem i fallbackiem.

**Decyzja do dogfoodu:** potwierdzenie „Własny trening” jest obowiązkowe przy
pierwszym użyciu. Po nim sprawdzamy, czy jawne CTA i guard pustej sesji nie dają
wystarczającej ochrony bez dodatkowego kroku przy każdym kolejnym treningu.

## R4D — Historia, trening po fakcie i korekta danych

**Mapowanie:** HISTORY-01 i backfill z userflow.

**Wynik użytkownika:** może następnego dnia wpisać prawdziwy trening lub poprawić
błędny ciężar, bez utraty kontekstu i bez fałszywej celebracji.

**Kryteria akceptacji:**

- `/history/add` najpierw wymaga prawdziwej daty, czasu i czasu trwania, potem
  progresywnie pyta o źródło: własna sesja, dzień aktywnego planu albo inny plan;
- backfill używa loggera z tym samym kontraktem serii, ale bez aktywnego timera;
- zapis trafia do właściwego dnia Historii i dostaje tylko mikro-potwierdzenie,
  bez Done, celebracji i drugiego check-inu Ekipy;
- edycja zapisanej sesji pozwala skorygować serie oraz przelicza postęp, ale nie
  odpala nowej celebracji;
- powrót do Historii zachowuje stronę, filtry i scroll;
- nie ma prewybranego źródła ani domyślnie zaliczonych serii.

**Poza zakresem:** „Powtórz trening” jako nowa sesja. HISTORY-02 pozostaje
hipotezą do testu po R4.

## R4E — drugi trening jako dowód wartości

**Mapowanie:** VALUE-01.

**Zależność:** CORE-1. R4E nie buduje drugiej, komponentowej kopii logiki progresji.

**Wynik użytkownika:** po pierwszym realnym wyniku widzi przy następnym treningu,
po co zapisywał dane.

**Kryteria akceptacji:**

- po pierwszym finishu aplikacja pokazuje zapisany fakt i jeden konkretny następny krok;
- w następnym wykonaniu ćwiczenia pokazuje poprzedni wynik jako punkt odniesienia,
  np. „Poprzednio 22,5 kg × 10”, oraz krótką nadpisywalną propozycję;
- gdy danych jest za mało, Arco mówi „potrzebujemy jeszcze …”, nie udaje pewności;
- guidance wyjaśnia powód i nie zmienia wyniku ani planu bez działania użytkownika;
- decyzja ma jawną wersję, confidence i reason codes; stan insufficient-data jest pełnoprawnym
  wynikiem, a nie błędem;
- trial premium nie jest uruchamiany w R4.

## Wspólna jakość R4

- testy jednostkowe dla przejść stanów sesji i kalkulacji wolumenu;
- testy integracyjne dla zapisu, wznowienia, edycji i backfillu;
- scenariusze integralności: pusta zaliczona seria, zmiana jednostki, pominięte ćwiczenie,
  otwarta sesja, trwały błąd outboxa i edycja planu po rozpoczęciu sesji;
- regresja: 320, 375 i 393 px, Safari/iPhone PWA oraz przynajmniej jeden Android;
- smoke starego Service Workera przy pierwszym deployu R4A;
- zrzuty przed/po: draft, ready, zaliczona seria z timerem, seria po korekcie,
  mini-bar, pusta i niepełna sesja, własna sesja, backfill oraz edycja Historii;
- brak regresji sticky headera, safe area, scroll lock, focusu i offline outboxa.

## Bramka zamknięcia R4

R4 jest gotowe dopiero, gdy osoba bez pomocy wykona trening z trzema seriami i
dwoma ćwiczeniami, poprawi wynik, zminimalizuje i wznowi sesję oraz doda jeden
trening po fakcie. Na drugim treningu widzi użytek z pierwszego wyniku.
