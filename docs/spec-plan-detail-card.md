# Arco — spec: karta planu (PLAN-05)

**Data:** 2026-07-27
**Status:** PLAN-05A i PLAN-05C zamknięte; NAV-01 na produkcji; następna paczka PLAN-05B
**Kontrakt:** rozszerza `R2.1` (karta = nazwa + dwa fakty) i przygotowuje grunt pod `R2.2`
**Powiązane:** `docs/spec-home-i-nawigacja.md` (HOME-NAV), `docs/plan-sprintow-2026-07.md`

## 1. Po co to robimy

Zgłoszenie właściciela 2026-07-27, z referencją do konkurencji: karta szczegółu planu ma
wyglądać znacznie lepiej — miejsce na zdjęcie, poziom w paskach, liczba treningów obok,
opis w akordeonie.

Diagnoza w kodzie (`app/programs/[id]/page.tsx`) jest ostrzejsza niż samo „mniej ładne":

1. **Trzy różne style kontenerów na przemian** — pigułki, dwie karty `tinted`
   (`border-primary/20 bg-primary/5`) i karty `shadow-sm`, bez hierarchii ważności.
2. **„Jak robić postęp" to zahardkodowany, identyczny akapit na wszystkich 15 planach** —
   nie treść planu, tylko szum powtórzony 15 razy.
3. **CTA „Ustaw jako aktywny" stoi pod trzema blokami tekstu.** Na 375 px decyzja leży
   poniżej trzech ekranów argumentów za nią.
4. **Zero miejsca na zdjęcie** — `programs` nie ma żadnej kolumny medialnej.

## 2. Decyzje właściciela (2026-07-27)

- **Zdjęcia: fallback teraz, zdjęcia później bez kolejnego redesignu.** Dodajemy nullable
  kolumnę `cover_image_url` już w tej paczce — dziś zawsze `null`, ale komponent czyta ją
  od pierwszego dnia. Realne zdjęcie wchodzi później jako `UPDATE`, nie jako zmiana kodu.
- **„Jak robić postęp": usunięte z ekranu planu**, nie zwinięte. Ta sama treść na 15 ekranach
  nie staje się bardziej wartościowa przez schowanie w akordeonie — usuwamy szum, nie
  maskujemy go.
- **Poziom w paskach + tekst**, nie same kropki (dostępność — patrz §6).
- **Funkcje ze zrzutów odrzucone**: „Add to calendar", udostępnianie, serce ulubionych.
  To nowe funkcje, nie warstwa wizualna; D-03 (Home/Arco prowadzi do treningu, nie
  prezentuje katalogu funkcji) dotyczy też tego ekranu.

## 3. Zakres

### PLAN-05A — Migracja: slot medialny (mała, samodzielna)

**Wynik:** karta planu ma skąd czytać zdjęcie, gdy ono powstanie — bez kolejnej migracji.

**Status 2026-07-30:** wdrożone na produkcję; `migration list` local == remote (61/61),
16 programów ma `cover_image_url = null`, PLAN-05B odblokowane.

- `supabase/migrations/<timestamp>_plan05_program_cover_image.sql`:
  `ALTER TABLE programs ADD COLUMN cover_image_url text NULL;`
- Bez zmiany RLS — `programs` ma już politykę na całą tabelę, nowa kolumna niczego nie
  odsłania ponad to, co już czytelne.
- Bez seeda: kolumna zostaje `null` dla wszystkich 15 programów systemowych i własnych
  użytkownika, dopóki nie powstanie realny content.

**Zależności:** brak. **Może wejść pierwsza, niezależnie od reszty.**

**Testy:** `npm run validate:training` (kontrakt katalogu bez regresji), test na świeżej
bazie zgodnie z `arco-migration`.

**Model:** Sonnet 5 — jedna kolumna, brak logiki.

---

### PLAN-05B — Komponent: `ProgramCover` (zdjęcie / fallback)

**Wynik użytkownika:** karta ma kotwicę wizualną nawet bez prawdziwego zdjęcia — nie pustkę.

**Zakres:**
- nowy `components/ProgramCover.tsx`: przyjmuje `coverImageUrl: string | null` i
  `focusKey: ProgramFocus`;
- **ze zdjęciem:** `next/image`, `aspect-[4/3]`, `object-cover`, zaokrąglone górne rogi karty;
- **bez zdjęcia (dziś zawsze):** gradient tła zależny od `focus_key`
  (`balanced` → rust-50→rust-100, `lower_body` → violet-50→violet-100, zgodnie z regułą
  „violet = prowadzenie/dane" z `paleta-arco-warm.md` §Adopcja v1.4) + wyśrodkowana istniejąca
  `MomentIcon3D name="plan"`. **Zero nowych assetów** — reużycie ikony już zatwierdzonej do
  produkcji;
- komponent jest **tym samym** w obu miejscach użycia (lista i szczegół), różni się tylko
  rozmiarem przez prop `size: "row" | "hero"`. `hero` jest szeroką okładką 4:3 na ekranie
  `/programs/[id]`, a `row` miniaturą 64×64 po lewej stronie wiersza biblioteki. Sam
  `ProgramCover` nie renderuje tytułu, faktów ani CTA — składają je dopiero PLAN-05D/05E.

**Zależności:** PLAN-05A (typ `coverImageUrl` musi istnieć w danych, choćby jako `null`
przekazywane z zapytania).

**Stany UX:** ładowanie obrazu (blur placeholder albo sam fallback jako LQIP — nie migotanie),
błąd ładowania (fallback zamiast złamanej ikony `<img>`), `prefers-reduced-motion` nie dotyczy
(statyczny element, bez animacji wejścia).

**Kryteria akceptacji:**
- [x] przy `coverImageUrl = null` renderuje się fallback, nie pusty kontener i nie błąd;
- [x] fallback nie robi sieciowego zapytania o obraz, który nie istnieje;
- [x] `focus_key = "lower_body"` i `"balanced"` dają wizualnie różne fallbacki (dowód, że
      klucz jest realnie użyty, nie zaszyty na sztywno);
- [x] `alt=""` z `aria-hidden` na fallbacku (czysto dekoracyjny), realne zdjęcie dostaje
      opisowy `alt` z nazwy planu.

**Testy:** unit na wyborze wariantu gradientu per `focus_key`; test przeglądarkowy — brak
overflow przy karcie `size="row"` w wąskiej liście na 320 px.

**Model:** Sonnet 5 — komponent prezentacyjny, zamknięty kontrakt danych.

---

### PLAN-05C — Pasek poziomu (`LevelMeter`)

**Wynik użytkownika:** poziom trudności czytam jednym rzutem oka, nie zgaduję z tekstu.

**Zakres:**
- nowy `components/LevelMeter.tsx`: `level_min`/`level_max` (już w schemacie `programs`)
  → N wypełnionych pasków z M, plus etykieta tekstowa (`level` z bazy, np.
  „Średniozaawansowany");
- **jeden komponent, dwa miejsca**: karta listy (`ProgramRow`) i szczegół planu.

**Dostępność (obowiązkowe, nie opcjonalne):**
- `role="img"` na całym komponencie, `aria-label` w pełni opisowy: np.
  „Poziom 2 z 3: średniozaawansowany" — czytnik ekranu nie ma czytać N osobnych `<div>`;
- paski różnicowane **kształtem/wypełnieniem, nie wyłącznie kolorem** (WCAG 1.4.1) — pełny
  pasek vs. pasek z obniżoną krycią, nie tylko rust vs. szary;
- rozmiar dotykowy nie dotyczy (element informacyjny, nie interaktywny) — ale kontrast
  wypełnionego paska wobec tła musi spełniać AA (weryfikacja: `arco-a11y-review`).

**Zależności:** brak — może iść równolegle z PLAN-05B.

**Kryteria akceptacji:**
- [ ] `level_min = level_max` (typowy przypadek) renderuje pojedynczy poziom, nie zakres;
- [ ] brak `level` tekstowego w danych → komponent się nie renderuje (nie pokazujemy pasków
      bez etykiety — sam pasek bez tekstu nie niesie znaczenia);
- [ ] zmierzony kontrast AA dla wypełnionego i pustego paska w light i dark.

**Testy:** unit na renderowaniu z granicznymi wartościami (`level_min/max` null, równe,
różne); przegląd `arco-a11y-review` przed merge.

**Model:** Sonnet 5.

---

### PLAN-05D — Przebudowa `/programs/[id]` (szczegół planu)

**Wynik użytkownika:** widzę zdjęcie/fallback, kluczowe fakty i mogę zacząć plan bez
przewijania przez ściany tekstu.

**Zakres — docelowa hierarchia:**

```
1. ProgramCover (size="hero") + PageHeader nad nim (Back)
2. Tytuł planu
3. Zwarty wiersz faktów: ikona hantla + liczba treningów (`program_days.length`) · ikona
   kalendarza + dni/tydz. · ikona zegara + czas. Bez nagłówków „Treningi”, „Częstotliwość”
   i „Czas”, ale z widocznymi wartościami, np. „3 treningi · 2–3 dni/tydz. · 45–60 min”.
   Ikony są dekoracyjne (`aria-hidden`), więc zrozumiałość nie zależy od ich odgadnięcia.
   `LevelMeter` z tekstową etykietą poziomu jest częścią tego bloku; na 320 px może zejść
   do drugiego wiersza zamiast ściskać trzy fakty.
4. CTA "Ustaw jako aktywny" / stan "Aktywny" — NAD zgięciem, zaraz po faktach
5. Akordeon "Opis" — domyślnie OTWARTY (opis jest jedyną treścią specyficzną dla planu)
6. Zwarta sekcja faktów: sprzęt wymagany/opcjonalny + rotacja
   (jedno zdanie ogólne + jedno spersonalizowane z `formatWeeklyRotationExample`,
   TYLKO gdy `settings.weekly_goal` istnieje)
7. Dni planu (bez zmian z dzisiejszego kodu)
8. Drugorzędne: "Duplikuj i edytuj"
```

**Usunięte:**
- karta „Jak robić postęp" (decyzja właściciela, §2);
- pięć pigułek na górze — zastąpione jednym wierszem faktów (punkt 3 powyżej); `program.goal`
  i `focus_key`-zależna etykieta „Pasuje do Twojego kierunku" (dziś na liście) **zostają**,
  ale jako część wiersza faktów, nie osobny rząd chipów.

**Poza zakresem:** zmiana treści opisów w bazie, nowe pola sprzętu, filtr „Tylko z moim
sprzętem" (to R2.2, wchodzi po tej paczce), zmiana adresu trasy.

**Zależności:** PLAN-05B, PLAN-05C. **Musi wejść po NAV-01** (patrz §4) — inaczej przepisujemy
`/programs/[id]` w strukturze, która za tydzień dostaje inny chrome (aktywny tab, pasek
zakładek).

**Stany UX:**
- plan bez opisu → akordeon się nie renderuje (nie pusta sekcja z samym nagłówkiem);
- plan bez `weekly_goal` w ustawieniach → zdanie spersonalizowane znika, zostaje ogólne;
- własny plan usera (`kind="own"`) → bez `frequency_min/max`, wiersz faktów degraduje się
  do tego, co jest (`cycle_days`, sprzęt), zgodnie z dzisiejszą logiką `ProgramRow`.

**Kryteria akceptacji:**
- [ ] CTA startu/aktywacji widoczne bez scrollowania na 375 px przy planie z opisem
      długości mediany (zmierzone, nie „wygląda dobrze");
- [ ] na 320 px trzy fakty z ikonami nie mają poziomego overflow, zachowują pełne wartości
      tekstowe, a `LevelMeter` układa się w drugim wierszu;
- [ ] usunięcie karty „Jak robić postęp" nie zostawia osieroconego importu/martwego kodu
      formatującego ten tekst;
- [ ] `formatRotationGuidance`/`formatWeeklyRotationExample` nadal używane — logika rotacji
      NIE ginie, tylko zmienia opakowanie z karty na zdanie w sekcji faktów;
- [ ] długi opis (worst-case z bazy) nie łamie layoutu akordeonu na 320 px.

**Testy:** rozszerzenie `tests/e2e/overflow.test.ts` o hierarchię nowej karty na 320/375/393;
regresja wizualna przed/po na planie z najdłuższym opisem i najkrótszym (empty-state opisu).

**Model:** Opus 5 — dotyka realnego ekranu produkcyjnego z rozgałęzieniami `kind="own"` vs
`"preset"` i logiką rotacji, którą łatwo złamać przy przenoszeniu.

---

### PLAN-05E — Lista planów: miniatura i poziom w `ProgramRow`

**Wynik użytkownika:** przeglądając bibliotekę, widzę poziom i kotwicę wizualną każdego planu
bez wchodzenia w szczegół.

**Zakres:**
- `ProgramRow` (`app/programs/page.tsx`) dostaje `ProgramCover size="row"` po lewej
  (miniatura ~64×64, fallback jak w §PLAN-05B) i `LevelMeter` w wierszu faktów.

**Świadomie NIE cofamy audytu R2.1.** Ten audyt odchudził kartę do „nazwa + dwa fakty" i to
zostaje prawdą — miniatura i poziom to **wizualne wzbogacenie tego samego minimalizmu**, nie
powrót tabeli filtrów. Nie dokładamy z powrotem sprzętu, rotacji ani minut jako osobnych
chipów na liście — to wciąż żyje wyłącznie w szczególe.

**Zależności:** PLAN-05B, PLAN-05C.

**Kryteria akceptacji:**
- [ ] lista 15 programów systemowych + rząd własnych planów mieści się bez poziomego
      overflow na 320 px z dołożoną miniaturą;
- [ ] miniatura nie spowalnia pierwszego renderu listy (leniwe ładowanie realnych zdjęć,
      gdy się pojawią — fallback nie potrzebuje `loading="lazy"`, bo nie jest siecią).

**Testy:** test przeglądarkowy listy na 320 px z pełną liczbą programów.

**Model:** Sonnet 5.

## 4. Kolejność i uzasadnienie

```
PLAN-05A ─┐
          ├→ PLAN-05B ─┐
PLAN-05C ─┘            ├→ PLAN-05D → PLAN-05E
                        │
        (NAV-01 z HOME-NAV musi być scalone przed PLAN-05D)
```

- **05A i 05C mogą wejść równolegle**, od razu — nie zależą od siebie ani od HOME-NAV.
- **05B zależy tylko od 05A** (potrzebuje pola w danych, nie potrzebuje przebudowanego ekranu).
- **05D (przebudowa szczegółu) czeka na NAV-01.** `/programs/[id]` dostanie w NAV-01 nowy
  aktywny tab i pasek zakładek Treningu — przebudowa hierarchii treści na starym chrome
  oznacza przepisanie tego samego pliku dwa razy w dwóch kolejnych sprintach.
- **05D wchodzi przed R2.2.** R2.2 dokłada filtr sprzętu do `/programs` — wpinanie filtra
  w kartę, która za tydzień zmienia układ, to ta sama pułapka co przy NAV-01/R2.2.
- **05E jest ostatnia**, bo powtarza wzorce ustalone w 05B/05C na drugim ekranie — najmniej
  ryzykowna, najlepiej robić ją mając już sprawdzony komponent z 05D.

**Zaktualizowana sekwencja główna** (dopisek do `plan-sprintow-2026-07.md`):

```
… → PLAN-Q → HOME-NAV → PLAN-05D/E → R2.2 → R4B–R4D → …
                (05A, 05B, 05C mogą wejść wcześniej, niezależnie)
```

## 5. Co to znaczy dla PLAN-Q

`plan-sprintow-2026-07.md` opisuje PLAN-Q jako obejmujące m.in. „UI" katalogu. Ta paczka
**jest** tym UI dla ekranu pojedynczego planu i listy. Żeby nie robić tego dwa razy:
PLAN-Q dostaje dopisek, że UI karty/listy programu jest zrealizowane przez PLAN-05A–E,
a PLAN-Q skupia się na treści (recepta v2, korekta 15/15, prawda sprzętowa) i gate publikacji.

## 6. Ryzyka przekrojowe

| Ryzyko | Gdzie | Mitygacja |
|---|---|---|
| Fallback wygląda jak błąd/pusty stan, nie jak świadomy design | 05B | Recenzja wizualna przed/po na obu wariantach `focus_key`, light+dark |
| Pasek poziomu nieczytelny dla czytnika ekranu | 05C | `role="img"` + pełny `aria-label`; `arco-a11y-review` obowiązkowy przed merge |
| Usunięcie „Jak robić postęp" zostawia martwy kod/i18n | 05D | Jawne kryterium akceptacji w checklist |
| Kolizja z NAV-01 (ten sam plik, równoległa praca) | 05D | Rezerwacja w `koordynacja-agentow.md`; 05D startuje dopiero po scaleniu NAV-01 |
| Migracja dodaje kolumnę, której nikt jeszcze nie wypełnia — ryzyko „martwego pola” | 05A | Udokumentowane w spec jako świadomy krok przygotowawczy (D-decyzja właściciela), nie przeoczenie |

## 7. Czego ten spec nie obejmuje

- Pozyskania i licencjonowania realnych zdjęć planów — osobne zadanie contentowe, poza tym
  sprintem; kiedy powstanie, wchodzi jako wypełnienie `cover_image_url`, bez zmiany kodu.
- Add to calendar, udostępnianie, ulubione — odrzucone w §2.
- Filtra sprzętu na liście — to R2.2.
- Zmiany treści opisów programów — to PLAN-Q / audyt treści.
