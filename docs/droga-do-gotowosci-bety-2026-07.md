# Droga do 10/10 — gotowość biblioteki na obcych użytkowników

**Data:** 2026-07-29
**Ocena wyjściowa:** 4/10
**Zakres:** co musi się wydarzyć, żeby ktoś spoza właściciela mógł trenować z Arco
**Podstawa:** bramka P0 z `Audyt_programow_treningowych_Arco_v2.1.pdf` §10 + pomiary z repo

## 1. Co ta ocena mierzy, a czego nie

**Nie mierzy jakości planów.** Treść treningowa dostała osobno 6,5/10
(`ocena-biblioteki-v21-2026-07.md`). Po wdrożeniu PLAN-C biblioteka nie ma martwych partii,
nie kłamie o czasie sesji i ma policzone pokrycie mięśni.

**Mierzy dystans do bramki dostarczenia.** Bardzo dobry plan podany bez zdjęcia ćwiczenia,
bez możliwości zgłoszenia bólu i bez danych, które pokażą, że coś poszło źle, nie jest gotowy
dla obcego człowieka. Audyt v2.1 nazywa to wprost: *test użyteczności nie może być nieformalnym
testem bezpieczeństwa*.

**Dwa różne progi.** Ten dokument opisuje **zamkniętą betę** (5–8 osób na segment, konta
zakładane ręcznie) — to jest te 10/10. Publiczna rejestracja to osobna oś, opisana w §7.

## 2. Stan wyjściowy — pomiary, nie wrażenia

| Warunek P0 z audytu | Stan | Dowód |
|---|---|---|
| Stabilne `exercise_id`, swapy, **snapshot recepty** | częściowo | ID stabilne; swapy **46/336 slotów = 14%**, 10 planów bez ani jednej; snapshot nie istnieje |
| **Przegląd trenerski bazy ćwiczeń** | ✗ | **16 ćwiczeń bez zdjęcia w 51 slotach**, 14 z 15 planów dotkniętych |
| Onboarding pierwszego treningu | częściowo | jest rozgrzewka (SESSION-01A) i jedna podpowiedź o zaliczaniu serii (01A3); RIR, progresja, podmiana i timer bez prowadzenia |
| Analityka rdzenia | ✗ w praktyce | `lib/analytics.ts` istnieje, ale adapter nigdy nie jest ustawiany → **w produkcji no-op**; wpięty wyłącznie w onboarding konta |
| Safety feedback po treningu | ✗ | ekran Done nie ma **żadnego pola wejściowego**; brak tabeli; zgłaszanie bólu nie jest nawet w backlogu |

Zero warunków spełnionych w pełni. Stąd 4/10 — i to ocena raczej hojna niż surowa.

### Ćwiczenia bez zdjęcia, wg zasięgu

| Ćwiczenie | Slotów | Planów |
|---|---:|---:|
| `Bulgarian_Split_Squat` | 7 | 7 |
| `Chest-Supported_Dumbbell_Row` | 5 | 5 |
| `Hanging_Knee_Raise` | 5 | 5 |
| `Dumbbell_Hip_Thrust` | 5 | 4 |
| `Pike_Push-Up` · `Hollow_Body_Hold` · `Nordic_Hamstring_Curl` | 4 każde | 3–4 |
| `Single_Leg_Calf_Raise` · `Single-Leg_Hip_Thrust` · `Copenhagen_Plank` | 3 każde | 3 |
| `Band_Lat_Pulldown` · `Reverse_Nordic_Curl` | 2 każde | 2 |
| `L-Sit_Hold` · `Tibialis_Raise` · `Overhead_Cable_Triceps_Extension` · `Ab_Wheel_Rollout` | 1 każde | 1 |

Wszystkie mają już polską nazwę. `npm run validate:training` raportuje 17 ćwiczeń w 56 slotach —
różnica jednej pozycji wynika z innej ścieżki liczenia (przegląd treści) i wymaga uzgodnienia
przy starcie paczki mediów.

**Dobra wiadomość:** `prompty-zdjecia-cwiczen-16.md` opisuje dokładnie tę listę — system
promptów, konwencja dwóch kadrów (`0` start, `1` koniec), stała kamera, trzy scenerie, persony.
Ta praca jest już zaprojektowana, brakuje wykonania i zatwierdzenia techniki.

## 3. Model oceny

Punkty sumują się do 10. Wagi odzwierciedlają to, co realnie chroni obcego człowieka.

| Składnik | Waga | Dziś |
|---|---:|---:|
| Baza: poprawiona treść, uczciwe czasy, zmierzone pokrycie, zero martwych partii | 4,0 | **4,0** |
| Kompletne media ćwiczeń | 1,8 | 0 |
| Feedback bezpieczeństwa po sesji | 1,2 | 0 |
| Niezależne zatwierdzenie trenerskie 15 recept | 1,0 | 0 |
| Snapshot recepty (CORE-1) | 0,8 | 0 |
| Analityka rdzenia | 0,7 | 0 |
| Prowadzenie pierwszej sesji | 0,3 | 0 |
| Pokrycie zamiennikami ≥ 80% slotów obowiązkowych | 0,2 | 0 |

## 4. Co trzeba zrobić — kolejność wynika z ryzyka

### 4.1 Media ćwiczeń · +1,8 · 2–3 dni · **pierwsze**

16 ćwiczeń × 2 kadry według istniejącej specyfikacji. Nie zaczynamy od zera: prompty, styl,
kadrowanie i persony są opisane.

Kolejność wg zasięgu — `Bulgarian_Split_Squat` odblokowuje 7 planów naraz, cztery ostatnie
pozycje po 1 slocie mogą poczekać.

**Definicja gotowe:** `validate:training` raportuje zero slotów z zaślepką; każda para przeszła
`arco-content-review` (zgodność z wariantem, czytelność techniki, źródło i licencja); miniatura
44 px pozostaje rozpoznawalna.

**Dlaczego pierwsze:** to jedyny punkt, w którym zła informacja przekłada się bezpośrednio na
kontuzję. Wszystko inne to jakość produktu, to jest bezpieczeństwo.

### 4.2 Feedback bezpieczeństwa po sesji · +1,2 · 1–2 dni

Trzy pytania na ekranie Done, wszystkie opcjonalne: **trudność**, **ból lub dyskomfort**
(z opcją wskazania ćwiczenia), **czy sesja trwała tyle, ile obiecywaliśmy**.

Wymaga tabeli z RLS i testem wielokontowym w tej samej migracji, zgodnie z regułą repo.
Ekran Done ma dziś dokładnie jedną akcję i zero pól — trzeba pilnować, żeby nie zamienić
celebracji w ankietę.

**Definicja gotowe:** odpowiedzi trafiają do bazy z RLS; powtarzalny sygnał bólu przy tym samym
ćwiczeniu da się wyciągnąć jednym zapytaniem; pominięcie pytań nie blokuje zakończenia treningu.

**Dlaczego drugie:** bez tego dowiemy się o problemie dopiero wtedy, gdy ktoś przestanie wracać.
To najtańsza rzecz na całej liście w stosunku do wartości.

### 4.3 Zatwierdzenie trenerskie 15 recept · +1,0 · zewnętrzne, 1–2 tygodnie kalendarzowo

Warunek postawiony przez sam audyt v2.1 i przez D-37 odłożony do momentu monetyzacji.
Przy wpuszczaniu obcych ludzi wraca jako bramka.

Trener dostaje to, co widzi użytkownik: karty planów, zdjęcia, instrukcje, regresje — nie
Markdown z repo. Zakres: dobór i kolejność ćwiczeń, zakresy, przerwy, progresje, guardy,
kryteria wejścia do ruchów technicznych.

**Definicja gotowe:** pisemne zatwierdzenie z listą zastrzeżeń; każde zastrzeżenie zamknięte
korektą albo jawną decyzją produktową.

**Dlaczego trzecie:** wymaga gotowych mediów (§4.1), inaczej trener recenzuje coś innego niż
użytkownik zobaczy. Idzie równolegle z §4.4.

### 4.4 Snapshot recepty — CORE-1 / ENGINE-01 · +0,8 · 3–4 dni

Dziś `start_or_resume_session` kopiuje wyłącznie `slot_id`, `exercise_id`, `position`
i `superset_group`; `target_sets` służy tylko jako licznik pętli, a zakresy i przerwy czyta
się na żywo. Skutek: **każda korekta planu przepisuje cele w zakończonej historii**.

Przy jednym użytkowniku to znośne. Przy pięćdziesięciu i przy bibliotece, którą nadal
poprawiamy, to erozja zaufania do własnych danych.

Zależności z planu sprintów: po R4D, przed R4E (R4E jest tym zablokowane).

**Definicja gotowe:** sesja zapisuje receptę w momencie startu; edycja programu nie zmienia
historii; program legacy bez snapshotu działa dalej bez zgadywanego backfillu.

### 4.5 Analityka rdzenia · +0,7 · 2–3 dni po decyzji narzędzia

`lib/analytics.ts` ma już typowaną taksonomię 28 zdarzeń, ale **adapter nigdy nie jest
ustawiany**, więc w produkcji nie leci nic. Wpięcia istnieją wyłącznie w onboardingu konta.

Do bety potrzeba minimum: start i koniec sesji, czas trwania, pominięta seria, podmiana
ćwiczenia, porzucenie sesji. Trzech ostatnich nie ma nawet w taksonomii.

Blokada nie jest techniczna: `instrumentacja-metryk.md` §7 czeka na decyzję o narzędziu
(rekomendacja: PostHog Cloud EU) i na konsultację prawną.

**Definicja gotowe:** progi decyzyjne z audytu (equipment mismatch < 5%, częste swapy tego
samego ćwiczenia, sesje przekraczające deklarowany czas) da się policzyć z danych, a nie
z wywiadu.

### 4.6 Prowadzenie pierwszej sesji · +0,3 · 2–3 dni

Dziś nowy użytkownik dostaje rozgrzewkę i jedno zdanie o zaliczaniu serii. Bez wyjaśnienia
zostają: **RIR** (czym jest zapas), **timer przerwy** (startuje sam, nikt nie mówi po co),
**podmiana ćwiczenia** (istnieje, ale ukryta w menu), **progresja** (kiedy dołożyć ciężar).

To jest wprost lista z audytu. Zakres był świadomie wyłączony jako SESSION-01B i **nie ma go
w backlogu** — trzeba go tam wpisać.

**Definicja gotowe:** osoba, która pierwszy raz widzi logger, wie po jednej sesji, co to RIR,
jak zaliczyć serię, jak podmienić ćwiczenie i kiedy dołożyć ciężar. Bez wielostronicowego
samouczka — Arco prowadzi jawnymi regułami, nie kreatorami.

### 4.7 Zamienniki · +0,2 · 2–3 dni

46 slotów na 336 ma alternatywę. Dziesięć planów nie ma ani jednej. Trzy plany kalisteniczne
mają w bibliotece v2.1 wskazówki progresji zamiast zamienników, więc trzeba je napisać od zera.

Obecny kontrakt obsługuje wyłącznie trigger sprzętowy (D-43); warianty preferencyjne czekają
na `relation_type` z TRAIN-03.

**Definicja gotowe:** każdy obowiązkowy slot ma wykonalną ścieżkę albo plan jawnie znika
z filtra „tylko z moim sprzętem".

## 5. Sekwencja

```
teraz ──► 4.1 media (2–3 dni) ──┬──► 4.3 review trenerski (kalendarz 1–2 tyg.)
                                └──► 4.2 feedback (1–2 dni) ──► 4.5 analityka (2–3 dni)
                                     4.4 CORE-1 (3–4 dni, po R4D)
                                     4.6 pierwsza sesja (2–3 dni)
                                     4.7 zamienniki (2–3 dni)
```

Realny nakład: **12–18 dni roboczych**, plus kalendarz na trenera. Analityka i CORE-1 mają
zewnętrzne zależności (decyzja o narzędziu, R4D), więc nie da się ich dowolnie ścisnąć.

Punkty pośrednie: po §4.1 jest **6/10**, po §4.2 **7,2/10**, po §4.3 **8,2/10**.
Od 8 w górę zamknięta beta jest obronialna, reszta podnosi jakość wniosków z niej.

## 6. Czego świadomie nie ma na liście

- **Nowe programy.** D-36: przed H2 poprawiamy i mierzymy obecne 15.
- **Obowiązkowe logowanie RIR/RPE.** Zostaje eksperymentem RIR-01; nie obciążamy loggera.
- **Automatyczna progresja i deload.** CORE-1 dostarcza dane, decyzje zostają jawne (D-33).
- **Pełna prawda sprzętowa TRAIN-05.** Podnosi jakość filtra, nie bezpieczeństwo bety.
- **Redesign kart planów (PLAN-05/TRAIN-06).** Osobny tor, nie bramka.

## 7. Publiczna rejestracja to osobna oś

10/10 z tego dokumentu oznacza gotowość na **zamkniętą betę z kontami zakładanymi ręcznie**.
Otwarcie publicznych zapisów dokłada rzeczy, których żadna korekta treści nie załatwi:

- **PRIV-1** — review prawne, eksport i usunięcie danych, audyt RLS, weryfikacja dostawców i regionu;
- **SEC-03** — rotacja ujawnionego sekretu `service_role`, wstrzymana i wciąż otwarta;
- abuse protection i publiczna Ekipa;
- regulamin, polityka prywatności, zgody.

Kolejność jest jednoznaczna: najpierw zamknięta beta na zaproszenia, dopiero potem publiczność.

## 8. Jedna rzecz, której ten dokument nie zastąpi

Żaden punkt powyżej nie sprawdza, czy te plany **dobrze się robi**. To wychodzi dopiero, gdy
ktoś stanie pod sztangą: czy 5 serii przysiadu przed skosem to nie za dużo, czy maszyna jest
wolna, czy 58 minut to naprawdę 58 minut.

Najtańszy krok w całej tej liście kosztuje dwie sesje na siłowni i nie wymaga ode mnie ani
jednej linijki kodu.
