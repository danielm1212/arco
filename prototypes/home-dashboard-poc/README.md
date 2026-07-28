# Arco — POC: Home + zwinięta nawigacja

**Status:** klikalny artefakt decyzyjny, nie kod produkcyjny
**Data:** 2026-07-27
**Decyzja do podjęcia:** czy wchodzimy w przebudowę IA, czy zostajemy przy dzisiejszej

## Cel

Prototyp pokazuje dwie rzeczy naraz, żeby dało się je ocenić razem, a nie w wyobraźni:

1. **Nowy Home** — powitanie, karta startu treningu, passa tygodniowa, podsumowanie,
   kafle okresu, postęp ćwiczeń ze sparkline i kontekstowa wskazówka.
2. **Zwiniętą nawigację** — dolny pasek `Home · Treningi · Ekipa`, a w Treningach jeden
   pasek zakładek `Plany · Postępy · Ciało · Historia`.

## Jak uruchomić

Otwórz `index.html` przez lokalny serwer statyczny (np. `npx serve .` z katalogu repo,
potem `/prototypes/home-dashboard-poc/`). Bez paczek, bazy i konta testowego.

Panel po lewej przełącza **motyw**, **szerokość** (320 / 375 / 393) i **stan konta**
(z historią / świeże konto / bez imienia). Poniżej 900 px panel znika, żeby nie zaburzał
oceny produktu.

## Co ten POC rozstrzyga

**Cztery zakładki mieszczą się na 320 px.** Zmierzone: po 76 px na zakładkę, bez ucięcia
tekstu, zero poziomego overflow. To był mój główny zarzut techniczny wobec propozycji —
odpada.

**Ciało przestaje być podstroną Postępów.** Jest równorzędną zakładką, więc pomiary i zdjęcia
nie lądują trzy poziomy w głąb pod etykietą „Treningi".

**Chrome nawigacyjny się zmniejsza, nie zwiększa.** Dziś: 4 pozycje w dolnym pasku i **dwa
różne** paski zakładek (`Dziś | Plany` oraz `Postępy | Ciało`). Tutaj: 3 pozycje i jeden pasek.

**Karta startu treningu zostaje pierwsza.** Powitanie to jedna linia nad nią, statystyki idą
pod spodem. Decyzja D-03 („Home ma jedno główne CTA startu") i audyt R2.1 zostają utrzymane —
dashboard nie spycha CTA poniżej folda.

**Brak imienia = brak powitania.** Wiersz nie istnieje, nie zostaje po nim puste miejsce.
Przełącz stan „Bez imienia", żeby zobaczyć.

**Passa jest komunikowana pozytywnie.** „4. tydzień z rzędu" i „Jeszcze jeden trening domyka
ten tydzień" — nigdy przez stratę, zgodnie z zakazem loss-aversion w `tone-of-voice.md`.

**Luka „inny trening dzisiaj".** W zakładce Plany każdy plan z biblioteki ma `Zacznij`, które
uruchamia dzień z tego planu bez zmiany aktywnego planu i bez przesuwania rotacji. Dziś w
produkcie da się tylko „Ustaw jako aktywny", co rozbija rotację A → B.

## Czego prototyp nie udaje

- Nie liczy żadnych statystyk — wszystkie liczby są zmyślone i dobrane tak, by wyglądały
  realistycznie. Produkcyjnie policzy je `app/progress/stats.ts` i `lib/week.ts`.
- Nie zapisuje niczego i nie łączy się z Supabase.
- Nie odwzorowuje przejść między ekranami, back-navigation ani zachowania PWA.
- Nie jest finalnym designem. Pokazuje hierarchię, gęstość i język.

## Decyzje właściciela (2026-07-27)

- **Gambarino na passie: zostaje.** Copy uproszczone — nagłówek niesie całą informację
  („4. tydzień passy"), opis „z rzędu z celem 3×/tydz." usunięty.
- **Budżet wydajności: przyjęty do policzenia** przed wdrożeniem.
- **Zakres treści na Home: zostaje wariant maksymalny** z tego POC.
- **Aktywny plan da się zacząć także z zakładki Plany** — karta aktywnego planu pokazuje
  następny dzień i ma własne CTA, obok „Zacznij" przy planach z biblioteki.

## Otwarte: nazwa zakładki zbiorczej

Zakładka trzyma cztery rzeczy: **Plany** (co zrobię), **Postępy** (jak idzie), **Ciało**
(moje ciało), **Historia** (co zrobiłem).

| Nazwa | Ocena |
|---|---|
| **„Treningi"** (l. mnoga) | Dwa problemy. Ciało treningiem nie jest, a liczba mnoga czyta się jako *lista odbytych treningów* — czyli zapowiada zawartość własnej podzakładki Historia. |
| **„Trening"** (l. pojedyncza) | **Rekomendacja.** Tak brzmi dziś etykieta w kodzie, a kontrakt IA nazywa tę sekcję „przestrzeń Trening". Liczba pojedyncza czyta się jako dziedzina, nie lista. Zero przyzwyczajania użytkownika od nowa. Ciało pozostaje lekkim naciągnięciem, ale przy trzech pozycjach w dolnym pasku koszt pomyłki jest znikomy — można się pomylić najwyżej dwa razy. |
| **„Moje"** | Uczciwie obejmuje wszystkie cztery (moje plany, postępy, ciało, historia) — wzorzec „You" ze Stravy. Jako samodzielna etykieta w polskim nawigatorze brzmi jednak niejasno. |
| **„Profil"** | Odpada. Koliduje z awatarem prowadzącym do ustawień, a kontrakt mówi wprost, że profil nie jest kolejnym tabem. |

**Wariant alternatywny — jeżeli Ciało pod „Treningiem" nadal uwiera.** Zamiast nazywać problem,
można go usunąć strukturalnie:

- **Home**
- **Trening** → Plany | Historia *(co zrobię / co zrobiłem)*
- **Postępy** → Trening | Ciało *(pomiar wyników / pomiar ciała — dokładnie dzisiejszy kontrakt)*
- **Ekipa**

Każda etykieta jest wtedy uczciwa, a sekcja Postępy zostaje w dokumentacji nietknięta. Koszt:
cztery pozycje w dolnym pasku i dwa paski zakładek, czyli chrome jak dziś — tracimy uproszczenie,
które jest największą zaletą wariantu z tego POC.

## Rekomendowana kolejność wdrożenia

1. **Slice 1 — bogaty Home w dzisiejszej strukturze** (jako „Dziś"): powitanie, passa,
   podsumowanie. Zero zmian tras, zero przepisywania kontraktu IA.
2. **Slice 2 — decyzja o przebudowie IA** na podstawie działającego Slice 1, nie makiety.
3. **Slice 3 — „zacznij ten trening" z dowolnego planu**; niezależne od obu powyższych.

Kontrakt IA jest w `docs/userflows-docelowe-2026-07.md` i **wymaga aktualizacji przed**
wdrożeniem czegokolwiek z tego POC — dziś wymienia „osobny blok powitania" na liście rzeczy,
które z Home znikają.
