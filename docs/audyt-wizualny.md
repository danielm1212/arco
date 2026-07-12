# Audyt wizualny apki — ekrany poza home/loggerem

> **Data:** 2026-07-11 · **Zakres:** done/celebracja, /progress, /history, /body, /settings, /programs, login, komponenty (kalendarz, heatmapa, chipy) — na kodzie. Home i logger mają własne dokumenty (redesign-home, audyt-loggera).
> **Werdykt:** apka NIE ma wizualnego bałaganu — ma **niedokończone rymy**. Fundamenty zdyscyplinowane: headery ekranów identyczne, akcent rzadki (0–1 użycie na ekran poza postępami), ghost-states z S14 eleganckie, heatmapa w palecie. Poniżej: co dokończyć, żeby całość mówiła jednym głosem.

---

## Findings i rekomendacje

| # | P | Co | Rekomendacja |
|---|---|---|---|
| W1 | **P1 ✅ WDROŻONE** | Liczby-bohaterowie w /progress (`Stat`) mówiły `text-xl font-bold`, a done-screen już Gambarino | `font-display text-2xl` — liczby-momenty (tonaż, delta-karty, hero done) mają teraz jeden głos w całej apce. tsc ✓ |
| W2 | **P2 — najładniejszy rym do zrobienia** | **Kalendarz historii vs FlameWeek = dwa języki „dnia treningowego"** (kółka ✓ vs płomienie) | `MonthCalendar`: dzień treningowy = mini-płomień (ten sam SVG-glif co FlameWeek, 14–16 px, wypełniony rust), „dziś" = obrys ink. Jeden symbol ognia od home przez historię po (przyszły) recap. ~0,5 wieczora |
| W3 | P2 | **Waga sans:** `font-bold` (700) w headline'ach (done „headline", Stat przed fixem, empty-states) — DM Sans 700 na mobile robi się ciężki obok lekkiego Gambarino | Propozycja normy do `wytyczne-designu.md`: **sans max `font-semibold`; 700 nie istnieje; „krzyk" robi Gambarino, nie tłuszcz**. Sweep ~20 wystąpień mechanicznie. Decyzja [Ty] |
| W4 | P3 | `PeriodTabs` (postępy) i chipy pickera to dwa osobne style pigułek | Wspólny komponent `Chip` przy najbliższej okazji dotykania któregoś z nich (nie osobny sprint) |
| W5 | P3 | Drobne radiusy poza normą (7 wystąpień `rounded-lg/sm`, np. wiersze Rekordów vs `rounded-xl` kart) | Sweep przy W3 — jedna zasada: karty xl, wiersze-w-kartach md/lg konsekwentnie |
| W6 | P3 — czeka na assety | Empty-states (progress ghost, body, historia) są tekstowe — dobre copy, zero wizualnej nagrody | Gdy powstaną ikony clay (prompty gotowe): hantel/kalendarz/waga w empty-states — dokładnie ich miejsce wg mapy użycia z `prompt-ikony-3d-clay.md` |
| W7 | **P2 — świadomie ODŁOŻONE** | Login bez charakteru („Zaloguj się, żeby trenować." na białym) — pierwsze wrażenie przy udostępnianiu linku | NIE ruszać teraz: Krok 2 (signup) i tak przeprojektuje wejście; wtedy login = mini-moment (sand + Gambarino tagline, spójnie z E0 onboardingu). Zapisane, żeby nie zginęło |
| W8 | P3 — weryfikacja na urządzeniu | Dark mode: heatmapa/MuscleSplitBars/FlameWeek — kod wygląda dobrze (tokeny), ale kontrasty na OLED trzeba obejrzeć oczami | [Ty] przy najbliższym teście na telefonie: /progress i home w dark — 2 minuty |
| W9 | P3 | done-screen: sekcja „PR-y" i statsy pod liczbą-bohaterem lekko konkurują (uppercase label + karta) | Przy okazji W3: odchudzić do jednej linii statów; celebracja = liczba + headline + jeden rząd, reszta czeka na home |

## Kolejność

1. ✅ W1 (wdrożone). 2. ✅ **Mini-sprint „rymy" WYKONANY (2026-07-11, akcept [Ty]):** W2 — kalendarz historii pokazuje dzień treningowy TYM SAMYM glifem `Flame` co home (numer w sr-only, „dziś" ring bez zmian) · W3 — sweep `font-bold`→`font-semibold` (17×; norma w wytyczne-designu §2b: „krzyk robi Gambarino, nie tłuszcz") + liczby-momenty w history/[id] i /body → `font-display` (pełny rym z done/Stat) · W5 — radiusy znormalizowane (wiersze→md, karty ProgramEditor/Picker/heatmap-skeleton→xl, mikro-paski zostają sm; norma §2b) · W9 — etykieta „Co dziś pracowało" ściszona (bez uppercase). tsc ✓; sanity: 0×font-bold, 0×rounded-lg. **Weryfikacja [Ty] w Preview:** /history (płomienie w kalendarzu!), /progress i /body (Gambarino na liczbach), celebracja, dark mode. 3. W6 po ikonach clay. 4. W7 w Kroku 2. 5. W4 oportunistycznie.

Po tym sprincie apka będzie wizualnie DOMKNIĘTA na H2 i launch: jeden glif ognia wszędzie, jeden font liczb-momentów, jedna waga nagłówków, chipy i radiusy bez wyjątków.
