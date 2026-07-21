# Arco — audyt core i plan dopracowania silnika

**Data:** 2026-07-21
**Status:** przyjęte jako refinement przed H2; kolejność wykonawcza żyje w
`plan-sprintow-2026-07.md`, zadania w `backlog-produktu.md`
**Zakres:** logger i integralność danych, model treningowy, guidance, rekomendacje programów

## 1. Werdykt

Arco ma dobry fundament techniczny, ale obecny „silnik” jest jeszcze zbiorem kilku jawnych
heurystyk, a nie kompletnym systemem decyzyjnym. Największym ryzykiem nie jest brak kolejnej
reguły, tylko możliwość zbudowania bardziej precyzyjnej rekomendacji na niejednoznacznych danych.

Ocena stanu przed refinementem:

| Obszar | Ocena | Wniosek |
|---|---:|---|
| fundament loggera i sesji | 8/10 | utrzymać atomowy start, jedną sesję i optymistyczny zapis |
| offline i odzyskanie | 7/10 | domknąć błędy trwałe i zakres flushu, nie wymieniać stacku |
| integralność faktów treningowych | 5/10 | bramka CORE-0 przed rozwojem loggera |
| rekomendacja programu | 6/10 | dobry filtr wykonalności, wagi nie są jeszcze skalibrowane wynikiem |
| guidance i progresja | 4/10 | jawne reguły są właściwe, ale mają za mało kontekstu i pewności |
| gotowość Arco Coach | 3/10 | najpierw wiarygodny thin slice i badanie, potem pełniejszy silnik |

Weryfikacja repo przed audytem: 91/91 testów jednostkowych, lint, walidacja treści treningowej
oraz 60/60 profili rekomendacji były zielone. Te testy dowodzą zgodności z obecną polityką,
nie trafności polityki na wielotygodniowej historii użytkownika.

## 2. Co potwierdza literatura

1. **Regularność i dopasowanie wygrywają ze złożonością.** ACSM 2026 stawia wykonalny,
   indywidualny plan ponad skomplikowanymi technikami; to wzmacnia kierunek Arco „prowadzi,
   nie obciąża”.
2. **Cel zmienia receptę.** Dla siły większe znaczenie mają cięższe obciążenia i odpowiednia
   częstotliwość; dla hipertrofii rośnie znaczenie tygodniowej objętości i bliskości upadku.
3. **Objętość ma malejące zwroty.** Najnowsza meta-regresja wspiera liczenie serii
   bezpośrednich i pośrednich, zamiast pełnego punktu dla każdego mięśnia.
4. **Autoregulacja jest obiecująca, lecz sygnał RPE/RIR ma ograniczenia.** Nie może stać się
   obowiązkową precyzyjną liczbą dla początkującego bez kalibracji.
5. **Brak PR nie jest diagnozą zmęczenia.** Deload może być użyteczny jako redukcja stresu,
   ale samo porównanie trzech sesji nie uzasadnia automatycznego zalecenia.
6. **Progres ciężarem i powtórzeniami są obronialne.** Double progression zostaje, ale skok
   musi uwzględniać sprzęt, wszystkie serie i wysiłek, nie stałe `+2,5 kg` dla każdego ruchu.

Źródła główne:

- ACSM 2026, *Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical
  Performance in Healthy Adults*: https://pubmed.ncbi.nlm.nih.gov/41843416/
- Pelland et al., dose-response objętości i częstotliwości:
  https://pubmed.ncbi.nlm.nih.gov/41343037/
- Robinson et al., proximity to failure / RIR:
  https://pubmed.ncbi.nlm.nih.gov/38970765/
- Huang et al., autoregulacja siły:
  https://pubmed.ncbi.nlm.nih.gov/40791980/
- Pancar et al. 2026, deload przez redukcję objętości/częstotliwości:
  https://www.nature.com/articles/s41598-026-40612-5
- Plotkin et al., progres ciężarem kontra powtórzeniami:
  https://pubmed.ncbi.nlm.nih.gov/36199287/

## 3. Luki wymagające działania

### CORE-0 — integralność przed interfejsem

1. Serię można oznaczyć jako zakończoną bez wyniku właściwego dla typu ćwiczenia, a finish
   sprawdza wyłącznie `completed=true`.
2. `kg/lbs` jest etykietą profilu, natomiast rekord serii nie przechowuje jednostki i nie jest
   konwertowany. Zmiana ustawienia może zmienić znaczenie historii.
3. Home, Postępy, rekordy i guidance nie używają jednej definicji kwalifikowanego faktu.
   Część zapytań obejmuje sesje otwarte, część tylko zakończone.
4. Jeden trwały błąd operacji outboxa może blokować późniejsze zapisy; błąd danych jest
   traktowany jak chwilowy brak sieci.

### CORE-1 — minimum wiarygodnego silnika przed R4E

1. Sesja nie zachowuje snapshotu recepty obowiązującej przy starcie; późniejsza edycja planu
   osłabia interpretację wykonania.
2. Guidance zwraca głównie tekst, bez jawnych `reason_codes`, wersji reguły, pewności,
   wykorzystanych danych i minimalnego progu danych.
3. Priorytet siła/masa/redukcja zmienia przede wszystkim copy, nie decyzję.
4. RPE istnieje w danych, ale nie bierze udziału w decyzji. Przed H2 traktujemy RIR/RPE jako
   opcjonalny eksperyment dogfood, a nie obowiązkowy formularz każdej serii.
5. Deload jest zbyt mocną rekomendacją dla zbyt słabego sygnału. Przed pełnym klasyfikatorem
   pokazujemy obserwację plateau i bezpieczny następny krok, nie diagnozę.
6. Rekomendator programu ma sensowne ograniczenia, ale jego wagi potwierdzają nasze oczekiwanie,
   nie wynik użytkownika. Kalibracja czeka na akceptację planu i powrót do treningu w H2.

## 4. Docelowy model core

```text
Execution kernel
  sesja · aktywna seria · draft · offline · finish
          ↓ wyłącznie zweryfikowane fakty
Training model
  kanoniczne jednostki · snapshot recepty · wykonanie · historia
          ↓ cechy z jawnym pochodzeniem
Decision engine
  action · reason · confidence · evidence · rule_version · inputs
          ↓ użytkownik zawsze może nadpisać
Outcome loop
  pokazano · zrozumiano · zaakceptowano/odrzucono · wynik kolejnej sesji
```

Silnik pozostaje deterministyczny. Nie mutuje planu ani wyniku bez działania użytkownika.
Uczenie oznacza kalibrację jawnych progów na danych H2, a nie wprowadzenie black boxa.

## 5. Sekwencja w sprincie

```text
Q1
  → CORE-0 integralność danych
  → R4A pętla serii
  → R2.2 sprzęt w Planach
  → R4B–R4D pierwszy trening, finish i Historia
  → CORE-1 minimalny wiarygodny silnik
  → R4E wartość drugiego treningu
  → R3b → R5b → R6 → H2
```

Ta kolejność chroni sprint przed dwoma błędami:

- nie polerujemy loggera nad nieprawidłową definicją serii i jednostki;
- nie pokazujemy guidance drugiej sesji przed ustaleniem, z jakich faktów i według której
  wersji reguły powstało.

Pełny model objętości, klasyfikator zmęczenia/deloadu i kalibracja rekomendatora są po H2.
Przed badaniem potrzebujemy wiarygodnego thin slice, nie kompletnego Coach.

Koszt tej korekty to 5,5–7,5 dnia implementacji przed H2: 2,5–3,5 dnia CORE-0 oraz 3–4 dni
CORE-1. Termin badania ma podążyć za przejściem bramek; nie odzyskujemy kalendarza przez
obcięcie integralności danych lub wystawienie guidance bez kontraktu decyzji. Opcjonalny
RIR-01 można pominąć bez blokowania H2.

Snapshot obowiązuje dla nowych sesji. Starsza sesja bez snapshotu pozostaje prawdziwym zapisem
wykonania, ale silnik oznacza jej receptę jako nieznaną i obniża pewność zamiast odtwarzać plan
z jego dzisiejszej wersji.

## 6. Bramka 10/10 dla planu

Plan jest oceniony 10/10 jako plan wykonawczy, ponieważ spełnia pięć warunków po 2 punkty:

| Kryterium | Punkty | Dowód w planie |
|---|---:|---|
| kolejność zależności | 2/2 | fakty przed UI, model przed guidance |
| ochrona danych | 2/2 | CORE-0 jest twardą bramką, nie długiem „przy okazji” |
| pokora dowodowa | 2/2 | plateau nie udaje diagnozy, heurystyki mają confidence/evidence |
| pętla walidacji | 2/2 | R4E → H2 mierzy zrozumienie, użycie i wynik kolejnej sesji |
| kontrola zakresu | 2/2 | brak AI/ML, brak pełnego Coach i kalibracji bez danych |

Ocena 10/10 dotyczy jakości i kolejności planu, nie twierdzenia, że progi fizjologiczne są już
poznane. Ich niepewność jest jawnie częścią H2.

## 7. Czego nie robić teraz

- nie wymieniać Next.js, Supabase ani obecnego modelu PWA;
- nie wdrażać PowerSync bez realnego przypadku utraty danych lub multi-device;
- nie dodawać kolejnych flag guidance przed CORE-0/CORE-1;
- nie obiecywać prognozy siły z mniej niż jawnie ustalonego minimum danych;
- nie automatyzować deloadu ani zmiany planu;
- nie dodawać obowiązkowego RPE/RIR do każdej serii początkującego;
- nie stroić wag rekomendatora do naszych fixture'ów; stroić dopiero do wyniku użytkownika.
