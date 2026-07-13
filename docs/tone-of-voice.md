# Arco — Tone of Voice (kanon głosu marki)

> **Data:** 2026-07-08 · **Podstawa:** `wizja-i-plan-produktu-v2.md` §1–§1.2 (retro-analog Warm, kameralność, „motywator nie obciążenie") + precedensy copy już zaakceptowane (celebracja S2, empty states S14, „zadziora" z kanonu).
> **Do czego służy:** (1) kanon do recenzji każdego nowego copy; (2) gotowy prompt (§4) do wklejenia w sesję Claude Code przy pisaniu tekstów.

---

## 1. Kim jest głos Arco

**Kumpel z siłowni, który zna się na rzeczy.** Nie korpo-asystent, nie drill sergeant, nie influencer fitness. Ktoś, kto powie „dołóż 2,5 kg, dasz radę", ale też „odpuść dziś ciężary, to był długi tydzień" — i w obu przypadkach wiesz, dlaczego (jawne reguły, nie magia).

Cztery filary (wprost z wizji):

1. **Po ludzku, per „ty"** — krótkie zdania, naturalna polszczyzna, zero kalk z angielskiego („zaloguj swój workout" ❌ → „zapisz trening" ✅).
2. **Motywuje, nie ciśnie** — celebrujemy zrobione, nie wypominamy niezrobionego. Nudge od kumpla, nie wyrzut sumienia. Anty-toksyczność to filozofia produktu — copy jej nie łamie nigdy.
3. **Jawność zamiast magii** — apka zawsze mówi *dlaczego* coś sugeruje („+2,5 kg, bo dobiłeś górę zakresu"). Żadnych „algorytm przygotował", „AI uważa".
4. **Uczciwość (Z3)** — przy limitach i paywallu mówimy prawdę wprost: „wszystko tu jest, bezpieczne — premium sięga głębiej". Nigdy straszenie utratą danych, nigdy dark patterns w copy.

## 2. Dwie warstwy = dwie głośności (ta sama osobowość)

| | **Warstwa narzędzia** (UI apki: logger, listy, ustawienia, błędy) | **Warstwa komunikacji** (celebracje, onboarding, empty states, landing, e-maile, social) |
|---|---|---|
| Głośność | cicho, funkcjonalnie | pełny charakter, display-typografia |
| Długość | minimum słów, zero ozdobników | 1–2 zdania z pazurem, nie akapity |
| Zadziora | brak (dane mają być czyste) | tak, z umiarem — jedno zdanie „z charakterem" na ekran, nie trzy |
| Emoji | nie | max 1, tylko z rodziny marki (💪🔥🎯) |
| Przykład | „Seria zapisana" | „Pierwszy PR to zawsze najlepszy dzień na siłowni" |

Zasada kciuka: **im bliżej sztangi, tym mniej gadania.** W loggerze user ma ręce w magnezji — copy schodzi z drogi.

## 3. Reguły + przykłady

**Zawsze:**
- Czasowniki akcji na CTA („Zacznij trening", „Wybierz program"), nigdy rzeczowniki („Rozpoczęcie sesji" ❌).
- Obietnica wartości zamiast komunikatu o braku („Po 2 treningach zobaczysz trend" ✅, „Brak danych" ❌).
- Liczby konkretne, nie przymiotniki („4. tydzień z rzędu" ✅, „świetna passa!" ❌... chyba że celebracja — tam wolno 😉).
- Błędy: co się stało + co zrobić, bez przepraszania na kolanach („Nie zapisało się — spróbuj ponownie, dane masz lokalnie").
- Naturalna interpunkcja. W copy produktowym nie używamy długich myślników do łączenia zdań. Zamiast nich stawiamy kropkę, przecinek lub dwukropek.

**Nigdy:**
- Wykrzykniki na siłę, CAPS LOCK poza display-typografią momentów.
- Wstyd/wina („Znowu nie trenowałeś…" ❌ — nudge brzmi: „Radek przypomina Ci o treningu").
- **Groźba utraty passy** („Nie strać passy!" ❌) — loss aversion działa (patrz Duolingo), ale to presja; passa zawsze pozytywnie („4. tydzień z rzędu 🔥"), a lęk przed utratą adresuje ochrona passy (premium), nie copy. *(wniosek: inspiracje/wnioski-dla-arco.md)*
- **Curiosity gap w ekipach** („ktoś coś zrobił…" ❌) — kameralność = zawsze kto i co, wprost.
- Żargon fitness-influencerski („szmelc", „pompa gwarantowana") i anglicyzmy, gdy jest polskie słowo.
- Obietnice wyników zdrowotnych/sylwetkowych (prawnie i etycznie śliskie).
- Fake urgency: odliczania, „oferta znika za 10 minut", spin-the-wheel — dark patterns, których nie tykamy niezależnie od konwersji.

**Wzorce dla kluczowych momentów wizji v2:**

| Moment | Copy-wzorzec |
|---|---|
| Nudge (ekipa) | „Radek przypomina Ci o treningu 💪" — imię + fakt, zero presji |
| Check-in (ekipa) | „Daniel trenował dziś — 4. tydzień z rzędu" |
| Kłódka historii (fala 2) | „Wszystko tu jest, bezpieczne. Arco Coach sięga głębiej niż 12 tygodni." |
| Trigger stagnacji (fala 1) | „Push stoi w miejscu od 3 tygodni. Coach wie, jak to ruszyć →" |
| Koniec triala | „Trial się kończy — Twoje treningi i ekipy zostają za darmo, na zawsze. Coach zabiera głębię." |
| **Start triala (dzień 0, timeline)** | „Przez 21 dni masz wszystko. Dzień 18: przypomnimy, co się zmieni. Dzień 22: zostaje darmowy rdzeń — nic nie znika. **Bez karty — nie ma czego zapomnieć anulować.**" *(wzorzec Blinkist-timeline; wnioski-dla-arco P2)* |
| Pricing (subtitle pod CTA) | „Bez zobowiązań. Anuluj kiedy chcesz — dwa tapnięcia w ustawieniach." *(P3; anulowanie MUSI być realnie takie proste)* |
| Prompt instalacji (celebracja 1. treningu) | „Dodaj Arco na ekran główny — ekran nie zgaśnie przy sztandze, a kumple dadzą znać, że trenują." |

## 4. PROMPT do wklejenia (sesje copy w Claude Code)

```
Piszesz copy dla Arco — polskiej apki-dziennika siłowego (PWA). Głos: kumpel z siłowni,
który zna się na rzeczy — po ludzku, per „ty", krótko, bez kalk z angielskiego.

Zasady twarde:
1. Dwie warstwy: UI narzędzia = minimum słów, zero ozdobników i emoji („Seria zapisana");
   momenty emocjonalne (celebracja/onboarding/empty state/e-mail) = 1–2 zdania z charakterem,
   max 1 emoji z zestawu 💪🔥🎯, max jedno zdanie „z pazurem" na ekran.
2. Motywacja bez presji: celebruj zrobione, nigdy nie wypominaj niezrobionego. Nudge brzmi
   jak kumpel („Radek przypomina Ci o treningu"), nie jak wyrzut.
3. Jawność: każda sugestia z powodem („+2,5 kg, bo dobiłeś górę zakresu"). Zero „AI/algorytm".
4. Uczciwość przy paywallu (zasada Z3): dane usera nigdy nie giną — „wszystko tu jest,
   bezpieczne; premium sięga głębiej". Zero straszenia, zero dark patterns.
5. CTA = czasownik akcji. Empty state = obietnica wartości, nie komunikat o braku.
6. Bez: wykrzykników na siłę, CAPS poza display-momentami, żargonu influencerskiego,
   obietnic zdrowotnych/sylwetkowych i długich myślników łączących zdania.

Kontekst marki: retro-analog Warm (terracotta/krem/ciepła czerń), kameralność zamiast
publicznego feedu, „logger który prowadzi, loguje się sam i pilnuje Cię razem z kumplem".
Wzorce i przykłady: docs/tone-of-voice.md §3, docs/archive/empty-states-copy.md.

Dla każdego tekstu podaj: wariant główny + 1 alternatywę + (jeśli UI) limit znaków.
```

## 5. Otwarte [Ty]
1. Zadziora: obecna dawka (jedno zdanie „z charakterem" na ekran) — potwierdzić po feedbacku z H2.
2. Per „ty" lekko trenerskie — zaakceptowane warunkowo przy S14; wraca do recenzji razem z copy ekip (nowa powierzchnia: komunikaty między userami).
