# Arco — spec: Home i nowa nawigacja (HOME-NAV)

**Data:** 2026-07-27
**Status:** HOME-01…03 i NAV-01 na `main` oraz produkcji; PLAN-04 pozostaje otwarte;
checkpoint fizycznego iPhone PWA/Androida czeka na właściciela
**Kontrakt:** `userflows-docelowe-2026-07.md` (rewizja HOME-NAV)
**Decyzje:** D-38 (trzy taby), D-39 (powitanie), D-40 (wyciąg z postępów), D-41 (start dowolnego planu)
**POC:** `prototypes/home-dashboard-poc/` — klikalny, z panelem motyw/szerokość/stan

## 1. Po co to robimy

Dwa problemy, jeden zaobserwowany i jeden zgłoszony.

**Home jest chudy i nie jest frontem aplikacji.** Dolny tab nazywa się „Trening", a jego
pierwsza zakładka „Dziś" — Home jest więc podwidokiem kategorii. Ekran pokazuje kartę startu
i nic poza nią, mimo że aplikacja liczy komplet statystyk i passę, których nigdzie na wejściu
nie widać.

**Nie da się zrobić innego treningu niż z aktywnego planu.** Dziś można zmienić dzień
aktywnego planu (`DayPickerSheet`) albo zrobić trening własny (`FreestyleStartButton`).
Żeby wykonać dzień z planu domowego, trzeba **przełączyć aktywny plan** — co rozbija rotację
A → B i progresję, a potem trzeba pamiętać, żeby przełączyć z powrotem.

Chrome nawigacyjny zmniejsza się przy okazji: dziś 4 pozycje w dolnym pasku i **dwa różne**
paski zakładek (`Dziś | Plany` w `TrainingSubnav`, `Postępy | Ciało` w `ProgressSubnav`).
Docelowo 3 pozycje i jeden pasek.

## 2. Co jest już zrobione

- ✅ Kontrakt IA zaktualizowany (§1, §2, §3, §5, §9 + rewizja w nagłówku).
- ✅ Decyzje D-38…D-41 w rejestrze; D-01 i D-02 oznaczone jako zrewidowane.
- ✅ POC zatwierdzony: nazwa „Trening" (l. poj.), Gambarino na passie zostaje, zakres
  maksymalny Home zostaje, aktywny plan startowalny także z zakładki Plany.
- ✅ Zmierzone POC-em: cztery zakładki mieszczą się na 320 px (76 px każda, bez ucięć,
  zero poziomego overflow).

## 3. Paczki

Każda paczka jest osobnym PR-em i osobną sesją. Kolejność jest wiążąca (§4).

---

### HOME-01 — Powitanie i passa tygodniowa

**Wynik użytkownika:** wchodząc do aplikacji widzę, że to moja aplikacja i w którym tygodniu
passy jestem — bez wchodzenia w Postępy.

**Dowód problemu:** zgłoszenie właściciela 2026-07-27; passa jest policzona (`lib/week.ts`),
ale widoczna wyłącznie jako `2/3` w badge'u headera.

**Zakres:**
- powitanie „Cześć, {imię}" jako pierwsza linia treści Home; `display_name` już jest
  przekazywane do `app/page.tsx` — zero nowych zapytań;
- karta passy: liczba tygodni (Gambarino), siedem kafelków dni tygodnia, jedno zdanie stanu;
- karta startu treningu **zostaje pierwszym modułem** — passa wchodzi pod nią.

**Poza zakresem:** zmiany nawigacji, statystyki, podsumowanie okresu.

**Zależności:** brak. Może wejść przed NAV-01.

**Dane:** `user_settings.display_name`, `computeStreak`, `weeksMeetingGoal` (`lib/week.ts`),
`weeklyDone`/`weeklyGoal` liczone już na Home.

**Stany UX:** brak imienia → wiersz powitania **nie istnieje** (nie pusty placeholder);
brak historii → karta passy się nie renderuje (nie pokazujemy zer); tydzień bez treningu →
kafelki puste, zdanie stanu bez straszenia.

**Kryteria akceptacji:**
- [x] przy `display_name = null` w DOM nie ma węzła powitania, a karta startu jest pierwsza;
- [x] „4. tydzień passy" nie zawija się na 320 px;
- [x] copy passy nigdy nie odwołuje się do straty (zakaz z `tone-of-voice.md`);
- [x] karta startu pozostaje pierwszym modułem `main` (D-03, audyt R2.1).

**Testy:** unit na wyborze copy passy dla 0/1/N tygodni; test przeglądarkowy 320/375/393 px
z pomiarem kolejności modułów i braku overflow; przypadek „bez imienia".

**Ryzyka:** hydratacja — `display_name` idzie z serwera, więc bez ryzyka, ale passa czytana
z dowolnego stanu klienta musiałaby mieć deterministyczny pierwszy render (patrz błąd
hydratacji liczników z SESSION-01A).

**Model:** Sonnet 5 — jeden ekran, dane już policzone, brak przypadków brzegowych.

---

### HOME-02 — Podsumowanie okresu i kafle

**Wynik użytkownika:** na wejściu widzę trzy liczby, które mówią, czy idzie do przodu.

**Zakres:** karta „Podsumowanie" (największy progres / tonaż vs poprzedni tydzień / rekordy
z 30 dni) i trzy kafle okresu (tonaż 7 dni, treningi 7/30 dni, serie robocze 30 dni).

**Poza zakresem:** postęp per ćwiczenie (HOME-03), zmiany w samych Postępach.

**Zależności:** HOME-01 (wspólny layout Home).

**Dane:** `app/progress/stats.ts` — `PeriodStats` (sesje, serie, objętość, partie, push/pull),
`PrEntry`, `StrengthRow`. **Nie duplikujemy obliczeń** — wyciągamy wspólne funkcje.

**Ryzyka — najważniejsze w całym spec:**
- **Budżet gorącej trasy.** Home jest najczęściej otwieranym ekranem, a `optymalizacja.md`
  narzuca na takie trasy budżety. Podsumowanie i kafle to dodatkowe agregaty przy każdym
  otwarciu aplikacji. **Przed implementacją policz zapytania i czas do pojawienia się CTA;
  po implementacji porównaj z baseline.** Kontrakt home mówi wprost: „Home nie powinien
  czekać z głównym CTA na ciężkie moduły poniżej folda ani wykonywać ich zapytań
  w szeregowym waterfallu".
- Mitygacja: `Suspense` wokół bloków statystyk, CTA renderowane niezależnie; agregaty
  równolegle, nie kaskadowo.

**Kryteria akceptacji:**
- [x] CTA startu treningu renderuje się niezależnie od statystyk (mierzalne: opóźnienie
      statystyk nie opóźnia CTA);
- [x] liczba zapytań i czas do CTA udokumentowane przed/po w opisie PR-a;
- [x] brak historii → sekcje w ogóle się nie renderują.

**Testy:** unit na formatowaniu liczb i przypadkach zerowych/ujemnych (spadek tonażu też jest
informacją); test przeglądarkowy na 320 px.

**Model:** Opus 5 — dobór agregatów na gorącej trasie i semantyka okresów (te same pułapki
co `weeksMeetingGoal`, gdzie „tydzień z 1 z 2 wymaganych treningów NIE liczy się").

---

### HOME-03 — Postęp ćwiczeń na Home

**Wynik użytkownika:** widzę, które ćwiczenia idą do przodu, a które stoją — bez wchodzenia
w Postępy.

**Zakres:** 2–3 wiersze ćwiczeń ze sparkline, rekordem, 1RM i progresem; link „Wykresy"
do Postępów.

**Zależności:** HOME-02.

**Dane:** `StrengthRow` z `app/progress/stats.ts`, komponent `Sparkline`.

**Rozstrzygnięcie 2026-07-30:** pokazujemy maksymalnie **3 ostatnio trenowane ćwiczenia**,
które mają co najmniej dwie kwalifikowane sesje w oknie 90 dni. Home odpowiada dzięki temu
na „co teraz", a nie premiuje historycznie największego wyniku. Przy braku takich ruchów
sekcja znika bez pustego stanu. Agregacja reużywa wiersze `getHomeInsights` i nie wykonuje
żadnego dodatkowego zapytania.

**Kryteria akceptacji:**
- [x] ćwiczenie bez progresu ma neutralny, nie negatywny sygnał („bez zmian", szary sparkline);
- [x] długie polskie nazwy ćwiczeń nie rozpychają wiersza na 320 px.

**Model:** Sonnet 5 — dane z HOME-02, praca głównie prezentacyjna.

---

### NAV-01 — Trzy taby i zakładki Treningu

**Wynik użytkownika:** nawigacja ma trzy jasne miejsca, a wszystko o moim treningu jest
w jednym.

**Zakres:**
- `BottomNav`: `Home · Trening · Ekipa` (dziś: Trening/Postępy/Historia/Ekipa);
- nowy pasek zakładek Treningu: `Plany | Postępy | Ciało | Historia`;
- `TrainingSubnav` (Dziś|Plany) i `ProgressSubnav` (Postępy|Ciało) **usunięte**, zastąpione
  jednym komponentem;
- `lib/appChrome.ts` — słownik `AppTab` i mapowanie tras;
- `/` przestaje mieć pasek zakładek; `/programs`, `/progress`, `/body`, `/history` dostają
  wspólny pasek i wspólny aktywny tab `Trening`.

**Poza zakresem:** przenoszenie tras pod nowe ścieżki. **Adresy zostają bez zmian** — zmienia
się chrome, nie URL-e. To świadomie ogranicza ryzyko deep-linków, cache'u PWA i zakładek.

**Zależności:** HOME-01…03 powinny być scalone, żeby Home nie był pusty w nowej strukturze.
**Kolizja:** R2.2 (filtry sprzętu w Planach) dotyka `/programs`. **NAV-01 wchodzi przed R2.2**,
żeby R2.2 lądowało od razu w docelowej strukturze.

**Ryzyka:**
- `NavigationHistory` i `ReplaceLink` — dziś przejścia między tabami idą przez `replace`.
  Zmiana liczby tabów zmienia stosy historii; systemowy Back na Androidzie musi nadal działać.
- Stary Service Worker może serwować poprzedni chrome — regresja na starym cache jest
  obowiązkowa (ryzyko 3 z HANDOFF).
- `AppChrome`/`RouteSkeleton` — skeletony ładowania muszą pokazywać nowy pasek, inaczej
  przy przejściu widać przeskok.

**Kryteria akceptacji:**
- [x] cztery zakładki mieszczą się na 320 px bez ucięcia i bez poziomego overflow;
- [ ] systemowy Back na fizycznym Androidzie nie wypada z aplikacji ani nie cofa do usuniętego
      stanu; automatyczny przepływ `popstate` jest zielony, checkpoint urządzenia pozostaje;
- [x] deep link do `/progress`, `/body`, `/history` ustawia właściwy tab i zakładkę;
- [x] `/` nie renderuje paska zakładek.

**Testy:** rozszerzenie `tests/e2e/overflow.test.ts` o pasek czterech zakładek na 320/375/393;
przejścia tab → zakładka → child → Back; smoke na starym cache.

**Model:** Opus 5 — chrome, historia nawigacji i PWA to obszar, w którym błąd jest cichy
i wychodzi dopiero na urządzeniu.

---

### PLAN-04 — Start dowolnego planu bez zmiany aktywnego

**Wynik użytkownika:** jestem dziś w domu, więc robię dzień z planu domowego, a mój plan
siłowni czeka nietknięty.

**Dowód problemu:** `app/programs/[id]/page.tsx` ma dziś wyłącznie „Ustaw jako aktywny"
i „Duplikuj i edytuj". Jedyna droga do treningu z innego planu przechodzi przez zmianę
aktywnego planu.

**Zakres:**
- akcja „Zacznij" przy planie w bibliotece i przy dniu w szczegółe planu;
- karta aktywnego planu w zakładce Plany pokazuje następny dzień i ma własne CTA startu
  (żeby zakładka Plany była samowystarczalna — punkt 5 feedbacku);
- serwerowa akcja tworząca sesję z wskazanego dnia dowolnego programu.

**Semantyka danych (D-41) — to jest sedno paczki:**

| Pytanie | Odpowiedź |
|---|---|
| Zmienia aktywny plan? | **Nie** |
| Przesuwa rotację A → B? | **Nie** — nie wykonałeś Treningu B |
| Liczy się do celu tygodniowego? | **Tak** — wykonana praca jest wykonaną pracą |
| Trafia do Historii? | **Tak**, normalnie |
| Liczy się do rekordów i progresji ćwiczeń? | **Tak** |

Spójne z D-07 (trening własny nie zmienia rotacji) i D-10 („Powtórz trening" nie rusza rotacji).

**Zależności:** niezależna od HOME-* i NAV-01 — **może iść równolegle innym agentem**.
Nie wymaga PLAN-Q.

**Ryzyka:**
- niezmiennik jednej niezakończonej sesji musi działać także tą ścieżką, **na serwerze**;
- sesja bez powiązania z aktywnym planem nie może wywrócić statystyk, Historii ani
  `previous_working_set`;
- brak migracji, jeśli `sessions` pozwala wskazać dzień dowolnego programu — **do
  zweryfikowania w kodzie przed startem**; jeśli wymaga kolumny, paczka rośnie o migrację
  z RLS i testem wielokontowym.

**Kryteria akceptacji:**
- [ ] po sesji z innego planu `Następny trening` na Home nadal wskazuje ten sam dzień rotacji;
- [ ] cel tygodniowy rośnie;
- [ ] próba startu przy istniejącej otwartej sesji jest zablokowana po stronie serwera;
- [ ] Historia pokazuje sesję z nazwą właściwego planu, nie aktywnego.

**Testy:** unit na rotacji (sesja zastępcza nie przesuwa), test wielokontowy przy migracji,
smoke: start → zaliczenie serii → finish → Home.

**Model:** Opus 5 — semantyka danych, w której błąd jest cichy i wychodzi tydzień później.

---

## 4. Kolejność i uzasadnienie

```
HOME-01 → HOME-02 → HOME-03 → NAV-01 → R2.2 (istniejący plan)
                                   ↑
PLAN-04 ─────────────── równolegle ┘
```

1. **HOME-01…03 przed NAV-01**, bo nawigacja bez treści na Home dałaby pustą przestrzeń
   i uniemożliwiła ocenę, czy przebudowa faktycznie pomogła.
2. **NAV-01 przed R2.2**, bo obie paczki dotykają `/programs`. Odwrotna kolejność oznacza
   przepisywanie filtrów sprzętu w nowej strukturze.
3. **PLAN-04 równolegle** — nie dotyka Home ani chrome; jedyny wspólny plik to szczegół planu.
4. **PLAN-Q bez zmian** — dotyczy katalogu i recept, nie nawigacji. Nie blokuje niczego tutaj.

## 5. Ryzyka przekrojowe

| Ryzyko | Gdzie | Mitygacja |
|---|---|---|
| Budżet gorącej trasy | HOME-02, HOME-03 | Pomiar przed/po, `Suspense`, agregaty równolegle; CTA niezależne od statystyk |
| Stary Service Worker serwuje poprzedni chrome | NAV-01 | Obowiązkowa regresja na starym cache (ryzyko 3 z HANDOFF) |
| Systemowy Back na Androidzie | NAV-01 | Test przejść tab → zakładka → child → Back; `NavigationHistory` |
| Cicha zmiana rotacji | PLAN-04 | Test jednostkowy rotacji + smoke pełnego cyklu |
| Rozjazd dokumentacji | wszystkie | Kontrakt IA i rejestr decyzji **już zaktualizowane**; każda paczka aktualizuje HANDOFF i backlog |
| Dostępność nowych kontrolek | HOME-*, NAV-01 | Skill `arco-a11y-review` przed merge każdej paczki UI |

## 6. Do rozstrzygnięcia przez [Ty] w trakcie

1. ~~**Ile wierszy ćwiczeń na Home** i po czym je wybieramy.~~ Rozstrzygnięte 2026-07-30:
   maks. 3 ostatnio trenowane ruchy z co najmniej dwiema kwalifikowanymi sesjami w 90 dni.
2. **Czy Gambarino zostaje na passie** po zobaczeniu na urządzeniu — `wytyczne-designu.md`
   rezerwuje ten krój na momenty, nie na UI narzędzia. Decyzja z POC: zostaje.
3. **Ikona i etykieta taba Trening** w dolnym pasku — POC używa hantli; do sprawdzenia,
   czy nie myli się z Home.

## 7. Czego ten spec nie obejmuje

- Przenoszenia tras pod nowe adresy — URL-e zostają.
- Zmian w Ekipie, loggerze, onboardingu i celebracji.
- Nowych statystyk. Wszystko liczymy z tego, co już liczy `app/progress/stats.ts`
  i `lib/week.ts`.
- Badania H2-U. Rewizja IA przeszła bramkę low-fi klikalnym POC; H2-U pozostaje osobnym
  etapem i może ją jeszcze zakwestionować.
