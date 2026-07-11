# Audyt UX loggera — karta ćwiczenia, hierarchia, komunikaty

> **Data:** 2026-07-11 · **Zakres:** ekran sesji po splicie S9-cz.2 (`Logger.tsx` + `ExerciseCard` + `SetRow` + `RestTimer` — inwentarz z kodu) · wzorce: Hevy/Strong (klasyka loggerów), Gymshark/Fitbod (analiza Mobbin z roadmapy) · kryteria: `wytyczne-designu.md` (jedna akcja główna, 44 px, feedback <100 ms), ToV, kontekst „ręce w magnezji".
> **Werdykt ogólny:** rdzeń mechaniki jest BARDZO dobry (✓ 44 px z wypełnieniem, placeholdery z poprzedniej sesji, tap-to-fill ↺, optymistyczny zapis, offline badge, hint progresji, „Pomiń" zamiast „Usuń" dla slotów). Problem jest jeden i systemowy: **karta ćwiczenia niesie za dużo zawsze-widocznych akcji drugorzędnych** — te same 6–8 mikro-przycisków powtarza się na KAŻDEJ karcie, więc szum mnoży się przez liczbę ćwiczeń.

---

## 1. Inwentarz karty (stan z kodu)

Nagłówek: nazwa+ⓘ (sheet „jak wykonać") · badge SS · cel `4×6-8 · notatka slotu` · **„Poprzednio: 80kg×8"** | akcje: **„⇄ Podmień"** + **„Pomiń"/„Usuń"**. Dalej, zawsze widoczne: wiersz **„Superset z poprzednim"/„Rozłącz"** · wiersz **przerwy „⏱ − 2:00 +"** · **„+ notatka"** · hint progresji (zielony box) · nagłówki kolumn · wiersze serii · „+ seria" + „+ RPE".
Wiersz serii: ↺ poprzedni wynik (pełna szerokość, do czasu ✓) · toggle W/nr (28×36 px!) · pola kg/powt. (h-36 px, placeholder=poprzednio) · [PR badge] · **✓ 44×44** · ✕ (36 px szer.).
Header ekranu: ← · tytuł · offline/sync badge · **„Zakończ" (primary, top-right)** · pasek stats (czas · tonaż · ✓ serie). Stopka main: picker „+ ćwiczenie" · **„Usuń sesję" (ghost danger)**. Rest-bar: fixed bottom.

## 2. Findings (P1 = przed H2, P2 = przy okazji, P3 = backlog)

| # | P | Finding | Dlaczego to problem |
|---|---|---|---|
| F1 | **P1** | **6 zawsze-widocznych akcji drugorzędnych na każdej karcie** (Podmień, Pomiń, Superset, przerwa ±, + notatka, + RPE) | Używane raz na sesję albo rzadziej, a widoczne ZAWSZE ×N kart. Hevy/Strong chowają wszystko poza seriami w menu ⋯ per ćwiczenie — ich karta to nazwa + serie, koniec. U nas user skanujący „gdzie moja seria" przedziera się przez pas mikro-linków |
| F2 | **P1** | **„Poprzednio" w TRZECH miejscach naraz**: agregat w nagłówku karty, wiersz ↺ nad serią, placeholdery w polach | Redundancja = szum; wystarczy reprezentacja per wiersz (↺ + placeholder), agregat z nagłówka wypada |
| F3 | P2 | **Toggle typu serii (W/nr) = 28×36 px, ✕ = 36 px szer.** | Poniżej normy 44 px z wytycznych (✓ już naprawione 2026-07-11); W-toggle to najmniejszy klikalny element ekranu, a myli się z etykietą |
| F4 | P2 | **„Zakończ" = zwykły mały button w sticky headerze + natywny `confirm()`** przy niezaliczonych | Przypadkowy tap kończy trening; natywny confirm brzydki i poza ToV. Hevy: Finish w headerze, ale z arkuszem podsumowania. Nasz done-screen jest świetny — wejście do niego zasługuje na sheet, nie alert() |
| F5 | P2 | **„Usuń sesję" na dole main, tuż pod pickerem „+ ćwiczenie"** | Akcja destrukcyjna w strefie eksploracji; raz na miesiąc potrzebna, codziennie widoczna |
| F6 | P3 | Wiersz przerwy (− 2:00 +) na każdej karcie | Default z programu jest dobry w 90% przypadków; regulacja przydaje się sporadycznie. Kandydat do ⋯ lub do rest-bara (koryguj W TRAKCIE przerwy — tam już są +30 s) |
| F7 | P3 | Nazwa ćwiczenia jako przycisk z hover-underline | Na dotyku hover nie istnieje; affordance robi ⓘ — zostawić samą ikonę jako trigger, nazwa czystym tekstem |
| F8 | P3 | Brak „gdzie jestem" przy 6+ kartach | Po ✓ ostatniej serii ćwiczenia — delikatny auto-scroll do następnego niezaliczonego (Gymshark to robi); opcjonalne, do dogfoodingu |
| F9 | P3 | Copy: „Pominięte w tej sesji — tap «Przywróć»…" (zagnieżdżone cudzysłowy), tooltipy `title=` niedostępne na dotyku | Kosmetyka ToV + dostępność |

## 3. Rekomendacje (koncept „karta oddycha")

**R1 (odpowiedź na F1+F5): menu ⋯ per ćwiczenie + ⋯ sesji.** Karta pokazuje TYLKO: nazwę+ⓘ, cel, hint progresji, serie, „+ seria". Wszystko inne → ⋯ w prawym górnym rogu karty: Podmień · Pomiń · Superset z poprzednim · Przerwa dla tego ćwiczenia · Notatka · RPE. Header sesji dostaje własne ⋯: Usuń sesję (+ przyszłe: edytuj datę, reorder). Zysk: −4 zawsze-widoczne elementy na każdej karcie, zero utraty funkcji (wszystko 2 tapy).
**R2 (F2): jedno „poprzednio".** Zostaje per-wiersz (↺ tap-to-fill, znika po ✓) + placeholdery; agregat „Poprzednio:" z nagłówka karty wypada. Nagłówek = nazwa + cel, kropka.
**R3 (F3): targety.** W-toggle → h-11 (44 px) szer. ≥ 36 z hit-area; ✕ → w-11 albo hit-area paddingiem (wzorzec już zastosowany przy ✓).
**R4 (F4): finish-sheet zamiast confirm().** Tap „Zakończ" → sheet: „✓ 14 serii · 2 pominięte pola · 42 min" + primary „Zakończ trening" + ghost „Wróć do treningu". Jeden dodatkowy tap TYLKO gdy są niezaliczone serie (czysta sesja = od razu done, jak dziś). Copy w ToV, zero wykrzykników.
**R5 (F7+F9):** nazwa czystym tekstem, ⓘ jedynym triggerem sheeta; poprawki copy przy okazji.
**Świadomie BEZ zmian:** ✓ 44 px wypełniany, placeholdery, tap-to-fill, offline badge (wzorowy), hint progresji (zielony box — jedyny kolor na karcie, słusznie), border supersetu, sticky stats, rest-bar, „Pomiń nie Usuń", wake lock.

## 4. Porównanie z konkurencją (uczciwie)

Hevy/Strong: nasza mechanika serii jest równorzędna (placeholdery+✓+previous mamy; oni nie mają hintu progresji ani auto-przerwy per slot — to nasze przewagi). Przegrywamy TYLKO gęstością karty — u nich ⋯ trzyma wszystko, karta jest liczbami. Gymshark: accept-checkbox = nasz ✓ (mamy). Fitbod: swap z sugestiami — nasz SwapPanel z tier-ami jest mocniejszy merytorycznie, słabszy wizualnie (bez miniaturek — ma je ExerciseBrowser, wyrównać przy okazji R1). Wniosek: po R1–R4 karta będzie czystsza niż Hevy przy większej inteligencji.

## 5. Superset — mechanika (dopisane 2026-07-11, pytanie [Ty])

**Co działa dobrze (z kodu, `useSessionMutations`):** łączenie jest solidne — grupy numerowane, dołączenie do już-zgrupowanego partnera wpina do TEJ SAMEJ grupy (giant sety 3+ możliwe od dziś), rozłączenie sprząta osieroconą grupę. Wizual: border + badge SS.

**Trzy luki:**

| # | P | Luka |
|---|---|---|
| F10 | **P1** | **Superset jest dziś tylko wizualny — przerwa go nie rozumie.** `handleToggle` startuje przerwę po KAŻDEJ zaliczonej serii, także między partnerami pary. A sednem supersetu jest właśnie: A1 → OD RAZU B1 → dopiero teraz przerwa. Czyli apka aktywnie namawia do złamania metody, którą sama pozwala zadeklarować |
| F11 | P2 | **Brak prowadzenia naprzemienności** — nic nie wskazuje „teraz partner"; karty stoją osobno, user skacze wzrokiem między nimi |
| F12 | P2 | **Kierunek łączenia:** „Superset z poprzednim" żyje na karcie B i patrzy wstecz — a decyzja zapada przy A, czytając plan w dół. Intuicja [Ty] „z kolejnym" jest trafna co do modelu mentalnego |

**Rekomendacje (R6, dokleja się do sprintu logger polish):**
- **R6a — przerwa świadoma grupy (sedno):** po ✓ serii *k* ćwiczenia z grupy G: jeśli partner w G ma mniej zaliczonych serii → **bez przerwy**, zamiast tego mikro-hint „→ teraz: {partner}"; przerwa startuje dopiero po ostatnim ogniwie rundy, z labelem „Przerwa po supersecie". Fallback: gdy user świadomie robi inaczej, nic nie blokujemy — hint to sugestia (ToV: prowadzenie, nie nakaz).
- **R6b — łączenie kierunko-agnostyczne:** zamiast flipować „z poprzednim"→„z następnym", w menu ⋯ (R1) opcja **„Połącz w superset"** → mini-wybór partnera (lista pozostałych ćwiczeń, **domyślnie podświetlony następny**); ta sama opcja na każdej karcie, dołączenie trzeciego = ta sama ścieżka. Zero dylematu kierunku, a intuicja „z kolejnym" jest defaultem.
- **R6c (P3):** wizualne sklejenie pary — wspólny nagłówek/łącznik między kartami grupy zamiast samotnych borderów (przy okazji R1, nie osobno).

## 6. Reorder ćwiczeń w sesji (dopisane 2026-07-11, pytanie [Ty] — to N2#7, odłożone przy S6)

**Potrzeba:** dodane z pickera ćwiczenie ląduje na końcu — a często ma sens wcześniej; plus doraźne „maszyna zajęta, przestawię kolejność".
**Grunt:** `session_exercises.position` istnieje i steruje kolejnością — reorder = update pozycji, zero migracji.

**Rekomendacja R7 (v1 — do sprintu logger polish):**
- W menu ⋯ karty: **„Przenieś wyżej" / „Przenieś niżej"** — zero nowych zależności (zasada optymalizacji §2.1: dnd-lib to +30 kB i długi ogon dotykowych bugów; strzałki działają jedną ręką w magnezji), 44 px, offline-guard jak swap/add/skip (reorder wymaga sieci — sygnał, nie cichy błąd).
- **Jednostka przesunięcia = ćwiczenie LUB cała grupa supersetu** — zgrupowane przesuwają się razem (reorder nie może rozrywać pary; spójne z R6). Server action `reorderExercise(seId, direction)` zamienia pozycje sąsiadujących jednostek + `router.refresh()`.
- Mikro-detal: po dodaniu ćwiczenia z pickera toast „Dodane na końcu — przenieś ⋯, jeśli chcesz wcześniej" (jednorazowa edukacja gestu).

**v2 (P3, po dogfoodingu):** tryb „Zmień kolejność" w ⋯ sesji — karty zwinięte do kompaktowych wierszy z uchwytami (wzorzec Hevy edit-mode), dopiero jeśli strzałki okażą się męczące przy sesjach 8+ ćwiczeń. Nie zaczynać od tego.

## 7. Wdrożenie

Jeden sprint „logger polish" (~3–4 wieczory): R1+R2 (największy efekt, głównie przenosiny JSX do DropdownMenu/sheet) → **R6a+R6b (przerwa świadoma grupy + „Połącz w superset" w ⋯; ~1 wieczór)** → **R7 (reorder ⋯ wyżej/niżej z grupą jako jednostką; ~0,5 wieczora — domyka N2#7)** → R3 (30 min) → R4 (sheet + copy) → R5 (kosmetyka); R6c przy okazji lub później. Prerekwizyt: brak (split S9-cz.2 zrobił miejsce). Test: dogfooding 2–3 treningi (w tym jeden z realnym supersetem!) + Z2 w H2. Makiety „po": w rozmowie 2026-07-11.
