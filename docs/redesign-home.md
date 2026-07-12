# Redesign home — analiza + koncept (DO AKCEPTACJI [Ty])

> **Data:** 2026-07-11 · **Impuls:** feedback #1 („ciężko się odnaleźć, za dużo się dzieje") + analiza wzorców (Hevy Workout tab, coaching-app z płomieniami dni) + pomysły [Ty]: ognie w „Ten tydzień", pytanie o sugerowany trening i o wskazówki.
> **Zasady nadrzędne:** wytyczne-designu §1 (jedna akcja główna; pkt 10: dokładasz → zabierasz), wizja §1.1 (dwie rampy: Paweł i Kasia startują z tego samego ekranu), ToV (pozytywna motywacja — ogień celebruje, nigdy nie straszy), architektura dwuwarstwowa (UI minimal; momenty mogą błysnąć).

---

## 1. Diagnoza obecnego home (z kodu, `app/page.tsx`)

 7 bloków od góry: powitanie → karta „Ten tydzień" (cel + passa + day-pills) → hero „Sugerowane dziś" (sand) → Wskazówki (pełna karta, zawsze) → **sekcja Program z listą WSZYSTKICH dni jako przyciski Start** → sekcja „Bez programu" (Start freestyle) → (globalny mini-bar).

**Sedno problemu — nie liczba elementów, tylko TRZY konkurujące paradygmaty startu:** hero mówi „startuj Dzień B", sekcja Program mówi „wybierz sam z listy", freestyle mówi „albo w ogóle bez planu". Nowy user (Z0/feedback #1) nie wie, który jest „ten właściwy". Do tego pełna karta Wskazówek przerywa drogę wzrokową między celem a startem. Duplikacja: każdy dzień da się wystartować z dwóch miejsc.

## 2. Analiza wzorców

**Hevy (Workout tab):** genialna segregacja jobs-to-be-done — Quick Start (1 tap, zawsze), Routines (zarządzanie schowane za New/Explore/foldery), karta rutyny ma JEDEN primary „Start Routine", sesja w toku = sticky bar na dole (Resume/Discard). Lekcja: **ekran startu robi jedną rzecz; zarządzanie żyje gdzie indziej.** Czego nie kopiujemy: Hevy nie prowadzi (brak guidance/sugestii — user sam wybiera rutynę); u nas prowadzenie to filar 2, więc sugestia MUSI być pierwsza.

**Coaching-app (płomienie dni):** pasek dni z płomieniami (zapalony = trenował, z numerem dnia; przyszłe wygaszone) — emocjonalny, czytelny na rzut oka, idealnie zbieżny z naszą passą 🔥 i terracottą. Hero-karty treningów z metadanymi (czas/dystans/tempo) + tag PRIORITY + zapowiedź „TOMORROW". Lekcje: **płomień jako marker dnia; hero z konkretem liczbowym; teaser następnego**. Czego nie kopiujemy: dark-gaming klimat (my Warm light), przeładowana góra z 5 ikonami-skrótami, WEEK-taby (nie mamy periodyzacji tygodniami w UI).

**Ladder/Fitbod (z wcześniejszej analizy Mobbin):** week-strip z ✓ u góry + duża typografia momentów — potwierdza kierunek.

## 3. Decyzje projektowe (odpowiedzi na Twoje pytania)

### 3.1 „Ten tydzień" z ogniami — TAK
Day-pills → **FlameWeek**: 7 płomieni z podpisem dnia.
- **done** = płomień wypełniony terracottą (rust-500; dark: rust-400) — bez ✓, sam zapał wystarczy;
- **dziś, nietrenowany** = obrys płomienia w ink, delikatny puls (jedyna animacja spoczynkowa na ekranie);
- **przyszłe** = obrys grey-300; **minione bez treningu** = obrys grey-400 — NIE czerwień, NIE „przerwany ogień" (dni odpoczynku to część planu, nie porażka — ToV!).
- W nagłówku karty zostaje: „Ten tydzień · **2 z 3** 🎯" + badge passy „🔥 4 tyg." (cel tygodniowy już jest scalony z tym kaflem — zostaje tak).
- **Moment:** odhaczenie dzisiejszego treningu = mikro-animacja zapłonu płomienia (0,6 s, ease-overshoot) — celebracja w duchu warstwy momentów, dzieje się raz, po powrocie z done-screen.

> **⚠️ Aktualizacja koloru hero (2026-07-11, decyzja [Ty] — V4 z eksploracji):** hero jest **BIAŁYM kaflem** (nie sand). Hierarchię robi: skala typografii (tytuł 22px+, ciasny tracking), pełnowymiarowe rust-CTA (jedyny wypełniony akcent na ekranie) i oddech paddingu. Sand wychodzi z codziennego UI w całości (rewizja w `paleta-arco-warm.md`) — koniec „trzech bieli" na canvasie. Dotyczy hero „Dziś", „Wznów trening" i obu wariantów pustego stanu z §3.6.

### 3.2 Sugerowany trening — ZOSTAJE i AWANSUJE (to jest hero)
Nie tylko potrzebny — to **jedyna akcja główna ekranu** (HIG hierarchy). Dla Kasi to „apka mówi, co robić" (rampa beginnera z wizji), dla Pawła — zero decyzji przed siłownią. Obecna karta sand jest dobra; rośnie o:
- pełniejszy tytuł: „**Dziś · Dzień B**" (etykieta programu małym drukiem),
- meta zostaje (N ćwiczeń · ~min · preview 3 nazw),
- stopka hero przejmuje WSZYSTKIE alternatywy jako ciche tekst-linki: „Zobacz ćwiczenia · **Inny dzień** · Freestyle" — „Inny dzień" otwiera sheet z listą dni programu (start 1 tapem stamtąd).
- „Wznów trening" (sesja otwarta) zostaje jak jest — zastępuje hero.

### 3.3 Wskazówki — NIE znikają, ale się zwijają (chip)
Guidance to filar wyróżnika i przyszły trigger fali 1 — schowanie go całkiem w Postępach osłabiłoby produkt. Ale pełna karta na home to za dużo. Kompromis:
- **GuidanceChip:** JEDNA linia pod hero — najwyższy priorytet z `homeGuidance` (już sortuje): „💡 Dołóż 2,5 kg na wyciskaniu — dobiłeś zakres →". Tap → sheet z pełną listą (ikony jak dziś) + link „Pełny bilans na Postępach".
- Brak flag → cichy jednoliniowy stan: „Wszystko na torze 💪" (decyzja S14 utrzymana, zminiaturyzowana; bez opisu-akapitu).
- Pełny widok wskazówek docelowo także jako sekcja na /progress (przy okazji Kroku 3 — tam mieszka analityka).

### 3.4 Co WYPADA z home (pkt 10 checklisty — zabieramy więcej, niż dokładamy)
- **Sekcja „Program" z listą dni** → cała funkcja przenosi się do sheeta „Inny dzień" + strona /programs (nav „Trening" już ją łapie). Największa pojedyncza redukcja szumu.
- **Sekcja „Bez programu"** → tekst-link w stopce hero.
- **Powitanie „Cześć, Daniel 👋"** → ✅ **ZOSTAJE (decyzja [Ty] 2026-07-11):** „miło przeczytać swoje imię na ekranie" — ciepło marki > minimalizm. Zostaje jako jedyny element nad FlameWeek.
- **Logout z headera** → do /settings (dwie ikony w headerze to o jedną za dużo; wylogowanie to akcja raz na kwartał).
- Empty state (brak programu): bez zmian merytorycznych — „Zacznij od planu" staje się hero.

### 3.5 Nowa hierarchia (5 elementów zamiast 7)
1. Header (logo + ustawienia)
2. **FlameWeek** (cel + passa + 7 płomieni) — kompakt, „jak mi idzie"
3. **HERO „Dziś"** (sand) — „co teraz robię" + alternatywy w stopce
4. **GuidanceChip** — „na co uważać" (1 linia)
5. BottomNav (bez zmian)
Droga wzrokowa: idzie mi → startuję → (ewentualnie) wskazówka. Koniec.

### 3.6 Pusty stan (nic nie wybrane) — dopisane 2026-07-11, pytanie [Ty]

Zasada: **pusty home jest jeszcze prostszy niż pełny** — nowy user dostaje mniej, nie więcej. Dwa warianty:

**Wariant A — po onboardingu z sugestią (ścieżka główna!):** WelcomeOverlay v2 już zna poziom+środowisko i sugeruje program — więc hero od razu pokazuje KONKRETNY plan zamiast wyboru:
- sand-hero: nadtytuł „Na start, dopasowany do Ciebie" → tytuł „**Beginner · Dom z hantlami**" → meta (3 dni/tydz. · FBW · od trenera) → **jeden CTA: „Aktywuj i zacznij Dzień A"** (aktywacja + start sesji w jednym tapie — najkrótsza droga do pierwszej wartości, jaką da się fizycznie zrobić);
- stopka hero: „Zobacz plan · Inny program" (biblioteka).

**Wariant B — bez sugestii (pominięty onboarding):** hero-wybór w duchu S14 #1:
- sand-hero: „**Zacznij od planu**" + „8 programów od trenera — wybierz swój, a apka poprowadzi Cię serię po serii." + CTA „Wybierz program";
- pod hero DWA ciche kafle à la Hevy (inspiracja [Ty]), ale zdegradowane wizualnie względem hero (białe, nie sand — hierarchia zostaje): „**Ułóż własny**" (ikona notes → builder) i „**Freestyle**" (ikona błyskawica → start bez planu). Hevy daje te kafle jako równorzędne — u nas są świadomie drugorzędne, bo rampa beginnera wymaga jednej oczywistej drogi; Paweł i tak je znajdzie.

**FlameWeek przy zerze treningów: UKRYTY.** Rząd wygaszonych płomieni na dzień dobry to smutek, nie obietnica. Kafel pojawia się po pierwszym ukończonym treningu — z momentem: wracasz z celebracji, a na home **zapala się pierwszy płomień** (animacja zapłonu z §3.1 debiutuje właśnie tu; narracyjnie: „zapaliłeś pierwszy — nie zgaś ognia" mówi WIZUALNIE, nie copy — ToV zakazuje groźby słowem, obraz sam niesie znaczenie pozytywnie). GuidanceChip: ukryty do pierwszych danych (jak dziś).

Empty-state = progressive disclosure całego home: hero → (1. trening) → +FlameWeek → (dane) → +GuidanceChip. Ekran rośnie razem z userem.

## 4. Plan wdrożenia

- **F1 — hierarchia (1 wieczór):** przestawienie/usunięcia w `page.tsx` + sheet „Inny dzień" + GuidanceChip (istniejące tokeny, zero nowych wizualiów). Największy zysk, zero ryzyka wizualnego.
- **F2 — FlameWeek (1 wieczór):** ikona płomienia (lucide `Flame` na start; docelowo własny glif rymujący się z logo — tor assetów) + stany + animacja zapłonu (`--dur`, ease-overshoot; `prefers-reduced-motion` → bez animacji).
- **F3 — pomiar:** scenariusz H2 **Z0 testuje NOWY home** (aktualizacja skryptu — testujemy to, co wypłynie, nie zabytek); po instrumentacji Fazy 1: first-tap na home jako metryka sanity.
- Checklisty: wytyczne-designu §3 + optymalizacja §4 przy obu fazach (hero = gorąca trasa).

## 5. Ryzyka i otwarte [Ty]
1. Redesign PRZED H2 = testujemy świeży układ bez baseline'u starego — świadomie OK (feedback #1 już orzekł o starym; szkoda palić 5 sesji na potwierdzanie znanego).
2. Ukrycie listy dni w sheet: power-user (Ty!) traci start-z-listy jednym scrollem — mitygacja: sheet otwiera się 1 tapem, pamięta scroll; jeśli po tygodniu dogfoodingu boli, wraca jako sekcja zwinięta.
3. Płomień dla dni minionych bez treningu — potwierdzić wygaszony neutralny (nie „przerwany"): zgodne z ToV, ale odbiera „bat"; nasz bat to ekipy, nie wstyd.
4. ~~Powitanie: usunąć vs zostawić~~ → **rozstrzygnięte: zostaje** (2026-07-11).
5. Makieta wizualna: w rozmowie (widget) — do obejrzenia przed F1; ewentualny szlif w Figmie po Twojej stronie.
