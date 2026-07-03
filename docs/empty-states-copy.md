# Empty states — propozycja copy + CTA (S14, do recenzji [Ty])

> Draft Claude 2026-07-03. Zasady: (1) **obietnica wartości, nie komunikat o braku** — mówimy, co user ZOBACZY, gdy zrobi krok; (2) **dokładnie jeden CTA** (drugi max jako tekstowy link); (3) ton jak copy celebracji — krótko, po ludzku, bez wykrzykników na siłę; (4) emoji oszczędnie (max 1, tylko gdzie gra z marką: 💪🔥🎯).
> Kolumna „dziś" = faktyczny stan w kodzie. Po Twojej akceptacji wdrażam całość w S14.

| # | Ekran / stan | Dziś (anty-wzorzec) | Propozycja copy | CTA |
|---|---|---|---|---|
| 1 | **Home** — brak aktywnego programu | szara ramka „Nie masz aktywnego programu — wybierz z biblioteki →" | **„Zacznij od planu"** + „6 programów od trenera — wybierz swój, a apka poprowadzi Cię serię po serii." | Primary: **„Wybierz program →"** (/programs); link tekstowy: „albo trenuj freestyle" |
| 2 | **/history** — zero sesji | „Brak sesji. Zacznij trening na ekranie głównym." (kalendarz się nie renderuje) | Kalendarz ZOSTAJE (ring „dziś") + **„Tu zamieszka Twoja historia"** + „Każdy zakończony trening zapisze się w kalendarzu, a passa zacznie rosnąć 🔥" | **„Zacznij pierwszy trening"** (/) |
| 3a | **/progress** — świeże konto (0 sesji w ogóle) | „Brak danych w tym okresie." | **Ghost-wykres** (szary sparkline z przykładowym kształtem ↗) + „Po 2 treningach zobaczysz tu trend siły i bilans partii." Heatmapa wyszarzona z podpisem „Zapali się po pierwszym treningu" — nie ukryta. | **„Zacznij trening"** (/) |
| 3b | **/progress** — pusty OKRES, ale są starsze dane | jw. (ten sam komunikat — mylące) | „W tych {7/30} dniach pusto — Twoje dane są w szerszym zakresie." | Chip **„Pokaż wszystko"** (przełącza okres) |
| 4 | **/progress → Rekordy** — brak PR | „Brak rekordów — zakończ sesję z zaliczonymi seriami." | „Rekordy wpadną same — wystarczy zaliczać serie ✓. Pierwszy PR to zawsze najlepszy dzień na siłowni." | — (sekcja informacyjna; CTA #3a wystarczy) |
| 5a | **Detal ćwiczenia** — trend <2 sesji | „Za mało danych — potrzeba 2+ sesji." | „**Drugi trening odblokuje trend** — zobaczysz, czy siła idzie w górę." | — |
| 5b | **Detal ćwiczenia** — zero historii | „Brak zaliczonych serii tego ćwiczenia." | „Jeszcze go nie robiłeś. Dodaj do treningu, a historia i rekordy zbudują się same." | — (dodanie i tak idzie przez logger) |
| 6 | **Picker** — brak wyników search | „Brak wyników." (przycisk „+ Własne" jest, ale nie jest odpowiedzią na pustkę) | „**Nie ma „{fraza}" w bazie?** Dodaj jako własne ćwiczenie — z opisem i zdjęciem." | Istniejący przycisk „+ Własne ćwiczenie („{fraza}")" **awansuje na primary** w tym stanie |
| 7 | **Home → Wskazówki** — brak flag | sekcja ZNIKA (user nie wie, że guidance w ogóle istnieje) | Stała sekcja: „**Wszystko na torze 💪**" + „Trenuj zgodnie z planem — dam znać, gdy coś będzie wymagało uwagi (balans, przerwy, deload)." | — |
| 8 | **/body** — brak pomiarów | „Brak pomiarów. Dodaj pierwszy powyżej." | „Zważ się raz w tygodniu — po kilku wpisach zobaczysz trend, nie pojedyncze liczby." | — (formularz jest bezpośrednio nad) |
| 9 | **Onboarding pominięty** (Pomiń) | user ląduje na home #1 | pokrywa #1 — celowo spójne | jw. |

**Poza copy (część techniczna S14, bez zmian):** skeletony tras · banner offline + disabled akcje sieciowe · sprawdzenie flashy ładowania.

**Świadomie BEZ zmian:** SwapPanel „Brak kandydatów" (stan niemal nieosiągalny — fallbacki equipment) · komunikaty błędów sieci (inna kategoria, nie empty state).

## Pytania do Ciebie
1. Per „ty" i lekko trenerskie („zobaczysz", „dam znać") — OK, czy wolisz bardziej neutralnie?
2. #4 „Pierwszy PR to zawsze najlepszy dzień na siłowni" — jedyne zdanie „z charakterem"; zostawić czy uciąć?
3. #7 stała sekcja Wskazówek — zgoda, że lepsza niż znikająca? (koszt: stały element na home)
