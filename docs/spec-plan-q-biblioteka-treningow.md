# PLAN-Q — biblioteka treningów 10/10

**Refinement:** 2026-07-21  
**Status:** Definition of Ready; do realizacji po R4A i przed R2.2  
**Właściciele:** Codex (zatwierdzenie programowe) + agent (dane, logika, UI, testy) + [Ty] (urządzenia)  
**Cel:** osoba wybiera wykonalny plan, rozumie każdą sesję i wykonuje bezpieczną receptę,
a aplikacja nie obiecuje dopasowania, którego nie potrafi policzyć.

**Audyt programowy:** `audyt-biblioteki-programow-2026-07.md`; docelowe recepty P01–P15
zatwierdzone przez Codex, bez zewnętrznej bramki trenerskiej przed H2.

## 1. Wynik użytkownika i dowód problemu

Po PLAN-Q wszystkie 15 programów systemowych ma zweryfikowaną strukturę, realne wymagania
sprzętowe, czas dnia, poprawną kolejność ruchów, jednoznaczne cele ćwiczeń oraz bezpieczne
regresje dla ruchów technicznych. Biblioteka i detal planu pokazują dane wynikające z tej samej
recepty, a filtr sprzętu nie oznacza planu jako wykonalnego, jeśli choć jedna obowiązkowa pozycja
nie ma wykonalnej ścieżki.

Dowód problemu:

- `scripts/seed.ts` zawiera 15 programów, a `docs/trainings/` tylko 13 odpowiadających im kart;
- dokumentacja opisuje pola i zasady, których obecny kontrakt bazy nie przechowuje;
- metadane programu deklarują sprzęt zbiorczo i używają wartości `body only` oraz `other`, więc
  nie dowodzą wykonalności konkretnego dnia;
- część ćwiczeń czasowych nie ma celu w sekundach, a dni nie mają własnego czasu;
- audyt treści wykazał błędy kolejności, objętości, brak wzorca hinge, osieroconą superserię
  i brak regresji dla początkujących;
- `duplicateProgram`, start sesji i przyszły snapshot CORE-1 nie kopiują pól, których jeszcze
  nie ma w obecnym kontrakcie recepty.

## 2. Decyzje zakresowe

1. Źródłem definicji programów systemowych będzie jeden wersjonowany katalog strukturalny.
   Seed, walidator i generowane karty `docs/trainings/` korzystają z tego katalogu.
2. Migracja recepty jest addytywna. Nie usuwamy obecnych kolumn, nie zgadujemy danych własnych
   programów i nie przepisujemy historycznych sesji bez snapshotu.
3. Wykonalność liczymy per obowiązkowy slot. Alternatywa może uratować slot, opcjonalny finisher
   nie może dyskwalifikować planu.
4. RIR jest celem recepty, nie obowiązkowym polem każdej zaliczonej serii. Logowanie RIR/RPE
   pozostaje eksperymentem RIR-01.
5. Guidance nie zmienia planu automatycznie. PLAN-Q dostarcza dane wejściowe; decyzje pozostają
   w CORE-1 i podlegają D-33.
6. Nowe programy, cel 1/tydzień, rozgrzewka/schłodzenie oraz warianty Minimum/Standard/Plus
   pozostają po H2. Najpierw naprawiamy i mierzymy obecne 15 programów.

## 3. Kontrakt danych v2

### Program i dzień

- zachować istniejące stabilne ID, slug, `content_version`, częstotliwość, środowisko i poziom;
- `program_days`: dodać `estimated_minutes_min`, `estimated_minutes_max` i `emphasis_key`;
- czas programu jest wyliczanym zakresem z jego dni, a nie osobną sprzeczną deklaracją;
- dla brakujących danych programu własnego UI używa jawnego stanu legacy, nie wartości zmyślonej.

### Slot recepty

Do `program_day_slots` addytywnie dodać:

- `target_duration_min_seconds`, `target_duration_max_seconds` dla ruchów czasowych;
- `target_rir_min`, `target_rir_max` jako opcjonalny cel recepty;
- `tempo_code` jako walidowany kod prezentacyjny, bez używania go do diagnozy zmęczenia;
- `progression_mode`: `load_reps`, `duration`, `leverage` albo `quality`;
- `slot_role`: `power`, `skill`, `primary`, `accessory` albo `finisher`;
- `is_optional`, domyślnie `false`.

Nowa tabela `program_slot_alternatives` przechowuje `slot_id`, `exercise_id`, `relation_type`
(`regression`, `progression`, `equipment`), `priority` i krótką notatkę. Uprawnienia wynikają
z programu rodzica; jeżeli tabela może zawierać dane programu użytkownika, dostaje RLS oraz
test A+B/C w tej samej migracji.

### Sprzęt

- `exercises.setup_equipment text[]` przechowuje pełny zestaw potrzebny do wykonania ruchu;
- kanoniczne klucze v1: `barbell`, `dumbbell`, `kettlebell`, `cable`, `machine`, `band`,
  `pull_up_bar`, `bench`, `box_step`, `wall`, `parallel_support`, `low_bar`, `slider`,
  `nordic_anchor`, `medicine_ball`, `exercise_ball`, `ez_bar`, `foam_roller`;
- masa ciała oznacza pustą tablicę, a nie sprzęt;
- `other` i nieznane historyczne tokeny zachowujemy kompatybilnie, ale nigdy nie dają badge'a
  pełnej zgodności;
- ustawienia pozostają źródłem inwentarza. Znane stare aliasy normalizujemy, nieznanych
  wartości nie kasujemy.

## 4. Bezpieczne wdrożenie danych

1. Backup i audyt liczby 15 programów, dni, slotów, aktywnych programów oraz otwartych sesji.
2. Addytywna migracja z nullable/defaultami, RLS i testem wielokontowym.
3. Regeneracja typów bazy; odczyt nowych pól z fallbackiem dla treści legacy.
4. Przeniesienie definicji systemowych do katalogu strukturalnego i zachowanie wszystkich ID/slug.
5. Aktualizacja seeda wyłącznie przez upsert wersjonowanej treści systemowej. Zakaz kasowania
   programów własnych, aktywacji innego planu lub zmiany historii.
6. Aktualizacja `duplicateProgram`, edytora, startu sesji/RPC oraz ENGINE-01 tak, aby nowe pola
   były kopiowane lub snapshotowane zgodnie z ich semantyką.
7. Dopiero po dual-read i testach aktualizacja UI, filtra i danych produkcyjnych.
8. Usunięcie pól legacy wymaga osobnej decyzji po H2; nie należy do PLAN-Q.

## 5. Zadania wykonawcze

### TRAIN-01 — pilny patch bezpieczeństwa w Q1

**Wynik użytkownika:** obecnie dostępne plany nie ustawiają ruchów mocy/technicznych po dużym
zmęczeniu i nie zawierają oczywistej luki wzorca ruchowego.

**Zakres:**

- P11 `advanced-home-upper-lower4`, Upper B: Handstand Push-Up `3×4–10` na początku;
  dalej Incline Press/Row/Chin-Up po 3 serie, Reverse Fly/Triceps/Curl po 2 serie i usunąć
  końcowe Close-Grip Push-Up; łącznie 18 zamiast 27 serii;
- P12 `advanced-bodyweight-upper-lower4`, Upper A: Handstand Push-Up na początku;
- P12, Lower A: Jump Squat na początku, docelowo `3×3–5`, bez zakresu hipertroficznego;
- P14 `intermediate-gym-fbw2`: w A Barbell Curl zastąpić Romanian Deadlift i ustawić hinge
  przed akcesoriami; w B Hammer Curl zastąpić Lying Leg Curl;
- bump `content_version`, zgodność z zatwierdzonym audytem i kontrola aktywnych programów po seedzie.

**Poza zakresem:** schema v2, redesign kart, nowe programy i automatyczna progresja.

**Done:** kolejność, objętość i instrukcje są zgodne z wersjonowanym audytem Codex; seed zachowa
ID, aktywny plan i historię; `validate:training`, test seed/smoke i diff danych są zielone.

### TRAIN-02 — jeden katalog i parity dokumentacji

**Wynik użytkownika:** każda powierzchnia korzysta z tej samej wersji programu.

**Zakres:** modularny katalog 15 programów; seed i walidatory importują katalog; 15 kart
`docs/trainings/` jest generowanych lub sprawdzanych mechanicznie; stabilne ID/slug/version.

**Poza zakresem:** edytor treści CMS i publiczne wersjonowanie programów użytkowników.

**Done:** dokładnie 15 unikalnych ID i slug, zero ręcznego rozjazdu seed/docs, ponowne
uruchomienie seeda jest idempotentne i nie zmienia aktywnego programu użytkownika.

### TRAIN-03 — recepta v2 i kompatybilność

**Wynik użytkownika:** plan potrafi jednoznacznie powiedzieć ile, jak długo, z jaką intencją
i które elementy są opcjonalne.

**Zakres:** migracja pól i alternatyw z sekcji 3, RLS, typy, fallback legacy, kopiowanie w
`duplicateProgram`, start/RPC i kontrakt snapshotu ENGINE-01.

**Poza zakresem:** obowiązkowe logowanie RIR, automatyczny deload, usuwanie kolumn legacy.

**Done:** program własny bez nowych pól nadal działa; program skopiowany zachowuje receptę;
edycja planu po starcie nie zmienia snapshotu sesji; konto A nie odczyta alternatyw programu B.

### TRAIN-04 — korekta wszystkich 15 programów

**Wynik użytkownika:** każdy plan jest spójny z poziomem, celem, czasem i pełnym tygodniem.

**Zakres minimalny oprócz TRAIN-01:**

- wdrożyć wszystkie korekty P01–P15 z sekcji 4 `audyt-biblioteki-programow-2026-07.md`;
- P02 `beginner-gym-fbw3`: w A zastąpić drugie wyciskanie 2 seriami Cable Pull-Through,
  a w C zastąpić łydki 2 seriami Romanian Deadlift; kolejność zgodna z zatwierdzonym audytem;
- P07 `beginner-bodyweight-fbw3`: drabinki regresji dla trudnych ruchów;
- P08 `intermediate-bodyweight-fbw3`: skrócić dzień C do 18 serii — Lunge/Chin-Up/Push-Up/
  Glute Bridge po 3 oraz Pike/Scapular Pull-Up/Copenhagen po 2;
- P13 `advanced-gym-ppl6`: Push A zredukować do 17 serii (Bench 4, OHP/Lateral/Incline po 3,
  oba tricepsy po 2), Push B do 16 (Incline 4, Shoulder/Chest/Lateral/Triceps po 3) i usunąć
  nieprawdziwą notatkę `superset`, jeśli nie zostanie dodana jawna para;
- wszystkie 15: kolejność power/skill → primary → accessory, realne przerwy, zakres czasu dnia,
  cele ruchów czasowych, RIR/tempo tylko tam, gdzie pomagają, spójny język i review opisów;
- P03/P04/P10/P12/P15: poprawić prawdę sprzętową; pozostałe programy przechodzą tę samą kontrolę.

**Poza zakresem:** optymalizacja pod bodybuilding per mięsień, plan medyczny/rehabilitacyjny,
pełny model zmęczenia i dokładanie szesnastego programu.

**Done:** każdy program przechodzi checklistę i zatwierdzoną receptę z audytu Codex, ma zero
P0/P1 treści, czas wyliczony z serii/przerw mieści się w deklaracji ±20%, a początkujący ruch
techniczny ma regresję.

### TRAIN-05 — prawda sprzętowa i wykonalność

**Wynik użytkownika:** „pasuje do mojego sprzętu” znaczy, że da się wykonać wszystkie
obowiązkowe pozycje, ewentualnie przez jawny zamiennik.

**Zakres:** słownik i aliasy, `setup_equipment`, alternatywy, deterministyczna funkcja
wykonalności per slot, jej testy oraz wykorzystanie przez ranking i PLAN-01.

**Poza zakresem:** rozpoznawanie sprzętu ze zdjęcia i automatyczna podmiana bez zgody.

**Done:** brak profilu daje neutralne CTA do ustawień; pełna zgodność wymaga ścieżki dla każdego
obowiązkowego slotu; pozycja opcjonalna nie dyskwalifikuje; brak danych legacy daje stan
„sprawdź sprzęt”, a nie fałszywe potwierdzenie.

### TRAIN-06 — detal planu i edytor bez przeciążenia

**Wynik użytkownika:** przed aktywacją planu widać realny czas, wymagania i sposób progresji.

**Zakres:**

- karta: poziom, częstotliwość, czas, środowisko i stan zgodności sprzętowej;
- detal dnia: czas, akcent, serie/powtórzenia lub sekundy, przerwa i element opcjonalny;
- alternatywy w rozwijanym szczególe, bez zaśmiecania głównej listy;
- edytor: pola czasu tylko dla ruchów czasowych; RIR, tempo i rola w sekcji zaawansowanej;
- stany loading, empty, error, offline, legacy/partial-data i success.

**Poza zakresem:** nowe okładki, redesign biblioteki, pełny edytor alternatyw dla użytkownika
w pierwszym wydaniu. Alternatywy użytkownika mogą być read-only/nieobecne do osobnego testu.

**Done:** główna decyzja jest czytelna w 2 sekundy; brak nowego FAB; własne nazwy pozostają
bez zmian; długie polskie teksty nie przepełniają 320/375/393 px.

### TRAIN-07 — gate publikacji i regresja

**Wynik użytkownika:** błędny lub niekompletny program nie trafia niezauważony do produktu.

Walidator blokuje CI, gdy:

- timed slot nie ma zakresu sekund;
- trudny ruch początkujący nie ma zatwierdzonej regresji;
- plan full-body w cyklu nie obejmuje push, pull, knee-dominant i hinge;
- power/skill znajduje się po kumulującym zmęczeniu albo ma nieadekwatny zakres powtórzeń;
- `superset_group` ma mniej niż dwa sloty;
- sprzęt systemowego slotu nie ma pokrycia przez ruch podstawowy lub alternatywę;
- czas dnia odbiega od estymacji o więcej niż 20%;
- występuje niekanoniczny klucz sprzętu, ukryte ćwiczenie, duplikat ID/slug albo rozjazd docs;
- zmiana treści nie podnosi `content_version`.

**Done:** unit, migration/RLS, seed/integration, E2E biblioteki/detalu/startu sesji, lint,
walidatory i build są zielone; smoke po migracji potwierdza 15 programów, aktywne plany,
otwarte sesje i historię.

## 6. UX states i przypadki graniczne

- **Brak wybranego sprzętu:** biblioteka działa, nie ukrywa wszystkiego i prowadzi do ustawień.
- **Niepełne dane legacy:** plan jest dostępny, lecz bez badge'a pełnej zgodności; detal wyjaśnia brak.
- **Brak wykonalnej alternatywy:** plan może być widoczny w pełnej bibliotece, ale nie w filtrze
  „Tylko z moim sprzętem”; użytkownik widzi brakujący element.
- **Offline/stary cache:** zapisany plan i sesja pozostają używalne; nowa treść nie unieważnia
  rozpoczętej sesji ani szkicu.
- **Program własny:** brak nowych pól nie blokuje edycji, startu ani duplikacji.
- **Ćwiczenie opcjonalne:** pominięcie nie oznacza nieukończonego treningu; wykonanie zapisuje się
  normalnie. Semantyka finish musi wejść przed R4C.
- **Zmiana planu w trakcie sesji:** snapshot zachowuje pierwotną receptę.

## 7. Testy i dowód wizualny

**Unit:** estymator czasu, normalizacja sprzętu, wykonalność slotu/planu, walidator wzorców,
kolejności i superserii.  
**Integracja:** migracja/RLS A+B/C, idempotentny seed, zachowanie active program, duplikacja,
snapshot i program legacy.  
**E2E:** biblioteka bez profilu, filtr exact, plan z brakującym sprzętem, detal alternatywy,
aktywacja i start sesji, opcjonalny slot, powrót z zachowaniem filtra/scrolla.  
**Urządzenia:** 320/375/393 px, iPhone PWA i Android/Chromium; stary cache po aktualizacji.  
**Zrzuty przed/po:** biblioteka pełna i filtrowana, brak profilu, karta exact/partial, detal dnia,
rozwinięta alternatywa, program własny legacy, loading/error/offline.

## 8. Ryzyka i rollback

- **Utrata relacji plan–historia:** stabilne ID, addytywna migracja, backup i smoke liczności.
- **Fałszywe exact match:** nieznane dane obniżają pewność; nigdy nie zakładamy dostępności.
- **Przeciążenie loggera:** RIR/tempo nie są obowiązkowymi polami serii; UI loggera zmienia się
  tylko tam, gdzie recepta wymaga sekund lub opcjonalności.
- **Rozjazd stary cache/nowa baza:** fallback legacy, wersjonowanie treści i checkpoint PWA.
- **Niewersjonowana ocena generatywna:** publikujemy wyłącznie receptę zgodną z audytem
  `audyt-biblioteki-programow-2026-07.md`; zmiana poza audytem wymaga nowego werdyktu Codex.
- **Zakres opóźnia H2:** PLAN-Q jest jawną bramką 8–12 dni implementacji plus checkpointy
  urządzeń. Audyt programowy jest wykonany; przesuwamy H2, jeśli implementacja nie jest gotowa.

Rollback aplikacji nie cofa migracji addytywnej. Poprzednia wersja aplikacji ignoruje nowe pola,
a przywrócenie treści systemowej używa poprzedniego `content_version`; danych użytkownika ani
historii nie kasujemy.

## 9. Dokumenty po wykonaniu

- `HANDOFF.md`, `backlog-produktu.md`, `plan-sprintow-2026-07.md`, `decyzje-produktowe.md`;
- `audyt-biblioteki-programow-2026-07.md` przy każdej zmianie recepty;
- `koordynacja-agentow.md` i odpowiadające issues w Linear;
- generowane `docs/trainings/README.md` oraz 15 kart programów;
- przy zmianie migracji: dokumentacja kontraktu danych i smoke produkcyjny według procedury Arco.
