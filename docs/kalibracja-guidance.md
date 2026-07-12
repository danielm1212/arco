# Kalibracja reguł guidance na literaturze

> **Data:** 2026-07-11 · **Zakres:** progi z `lib/guidance.ts` (`GUIDANCE` + logika progresji) vs aktualny stan badań (meta-analizy i RCT, weryfikacja web 2026-07). Cel: reguły-wyróżnik mają być **obronialne merytorycznie** — z jawną etykietą, co jest dowodem, a co heurystyką trenerską.
> **TL;DR:** kalibracja POTWIERDZA 3 z 4 progów bez zmian (staleness 8 dni, deload 3 sesje, balans 0,6 — ten ostatni z uczciwą etykietą „heurystyka"). Jedna propozycja korekty (R1: copy progresji dla lekkich ciężarów) + jedna reguła-kandydat na przyszłość (pasmo objętości). **Bonus: literatura wspiera nasz NAJWAŻNIEJSZY wybór projektowy** — deload wyzwalany stagnacją, nie kalendarzem.

---

## 1. Werdykty per parametr

### 1.1 `stalenessDays = 8` („partia zwietrzała") — ✅ ZOSTAJE
**Dowody:** meta-analizy częstotliwości: przy nierównanej objętości ≥2×/tydz. na grupę > 1×/tydz. dla hipertrofii (Schoenfeld/Ogborn/Krieger 2016); przy zrównanej objętości różnice znikają (Schoenfeld/Grgic/Krieger 2019), a najnowsza meta-regresja (Pelland et al. 2025, 67 badań) pokazuje: częstotliwość ma pomijalny niezależny wpływ na hipertrofię, dodatni (malejący) na siłę. Realny spadek siły z detreningu zaczyna być mierzalny po ~2–3 tygodniach (meta Bosquet 2013).
**Interpretacja:** 8 dni to nie alarm detreningu, tylko miękki nudge „spadłeś poniżej 1×/tydz." — dokładnie tak działa (severity `info`). Poniżej 7 dni flagowałby normalne układy splitów; powyżej 10 traciłby czujność.
**Werdykt:** 8 dni — trafione. Epistemika: częstotliwość=dowód mocny, próg dnia=konwencja rozsądna.

### 1.2 `deloadSessions = 3` (stagnacja → lżejszy tydzień) — ✅ ZOSTAJE + literatura WSPIERA design
**Dowody:** pierwsze RCT o deloadach (Coleman et al. 2024): **planowy** tygodniowy deload w środku 9-tyg. cyklu NIE poprawił hipertrofii u trenowanych, a siłę lekko przyhamował. Wniosek badaczy i komentatorów: deload to narzędzie zarządzania zmęczeniem/stagnacją, nie rytuał kalendarzowy.
**Interpretacja:** to jest DOKŁADNIE nasza architektura — flagujemy deload dopiero przy stagnacji metryki, nigdy „co 4 tygodnie". Rzadki przypadek, gdy literatura ex post walidacyjnie klepie decyzję projektową. Próg 3 sesji bez wzrostu ≈ 1,5–3 tyg. przy typowej częstotliwości — sensowne okno na odsianie „słabego dnia" od trendu; copy „rozważ" + max 1 flaga = właściwa pokora wobec szumu.
**Werdykt:** 3 sesje zostają (profil standardowy). **Propozycja przyszła (nie teraz):** level-aware — beginner 4 sesje (nowicjusze fluktuują techniką, false-positive'y demotywują); wchodzi razem z per-user kalibracją z roadmapy.

### 1.3 `balanceRatio = 0.6` + `balanceMinSets = 4` (push:pull) — ✅ ZOSTAJE, z etykietą „heurystyka"
**Dowody:** brak RCT/meta-analiz o docelowym stosunku serii push:pull; to heurystyka trenerska (structural balance) + przesłanki obserwacyjne o zdrowiu barku przy chronicznej przewadze pressingu. Dowód słaby — ale koszt reguły też niski (info-nudge, nie nakaz).
**Werdykt:** 0,6 (40-procentowy deficyt = wyraźny sygnał) i min 4 serie anti-noise — rozsądne. **Obowiązek uczciwości:** w przyszłym „dlaczego ta wskazówka" (tooltip/sheet) etykietować wprost: „praktyka trenerska, nie meta-analiza". To wzmacnia zaufanie do reszty reguł, które dowody MAJĄ.

### 1.4 Progresja (double progression, `inc = 2,5 kg / 5 lbs`) — ✅ zasada zostaje, **R1: korekta dla lekkich ciężarów [Ty]**
**Dowody:** progressive overload = fundament; double progression to standard praktyki (bezpośrednich RCT porównujących schematy progresji jest mało — uczciwie: konwencja poparta mechanizmem, nie metą). Problem skali: +2,5 kg przy wyciskaniu 80 kg = +3% (idealnie), ale przy uginaniu 10 kg = **+25%** — skok gwarantujący załamanie techniki/zakresu.
**R1 (propozycja, decyzja [Ty]):** w `progressionHint` dla `weighted` z `prev.weight < 20 kg` zamiast „spróbuj {+2,5}" → **„dołóż najmniejszy skok, jaki masz — albo najpierw +1 powt. ponad zakres"**. Zero nowych progów, czysta zmiana copy; respektuje realia hantli (skoki 2–2,5 kg) zamiast udawać mikrotalerze. Wdrożenie: 15 minut, po akcepcie.

### 1.5 `maxHomeFlags = 2` — ✅ zostaje (UX, nie fizjologia; poza zakresem kalibracji).

## 2. Reguła-kandydat (backlog, po H2): pasmo objętości tygodniowej
Pelland 2025: przyrosty rosną monotonicznie z objętością przy malejących zwrotach (dla siły plateau szybciej). Z drugiej strony „minimum effective dose" (Androulakis-Korakakis 2020): u trenowanych nawet niskie objętości podtrzymują siłę. Kandydat: cicha flaga `volume-low`, gdy partia trenowana, ale <4 serie/tydz. („podtrzymujesz, nie budujesz — ok, jeśli to świadome"). Górnej flagi NIE robimy (>20 serii to rzadkość u naszych person, a „za dużo" bez kontekstu regeneracji = zgadywanie). Decyzja przy per-user kalibracji.

## 3. Epistemiczna mapa reguł (do przyszłego „dlaczego" w UI)
| Reguła | Status dowodowy |
|---|---|
| Częstotliwość/staleness | meta-analizy ✔ (próg dnia: konwencja) |
| Deload przy stagnacji (nie kalendarzowy) | RCT ✔ — wspiera wprost |
| Double progression | konwencja praktyki (mechanizm ✔, brak bezpośrednich RCT) |
| Push:pull 0,6 | heurystyka trenerska — etykietować |

## 4. Źródła
- Pelland et al. 2025, *The Resistance Training Dose Response* (meta-regresja, 67 badań): [Sports Medicine](https://link.springer.com/article/10.1007/s40279-025-02344-w) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/41343037/)
- Coleman et al. 2024, deload RCT: [PeerJ](https://peerj.com/articles/16777/) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/38274324/)
- Schoenfeld, Grgic, Krieger 2019 (częstotliwość × hipertrofia, meta): [PubMed](https://pubmed.ncbi.nlm.nih.gov/30558493/)
- Grgic et al. 2018 (częstotliwość × siła): [Frontiers in Physiology](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2018.00744/full)
- Kontekst dodatkowy (z wiedzy, do weryfikacji przy użyciu): Bosquet 2013 (detrening), Androulakis-Korakakis 2020 (minimum effective dose).

## 5. Co dalej
1. [Ty] Decyzja R1 (copy progresji <20 kg) — wdrożenie 15 min po akcepcie.
2. Etykiety epistemiczne → wchodzą razem z przyszłym „dlaczego ta wskazówka" (naturalnie w Kroku 3, gdzie guidance-full dostaje głębię — sekcja §3 gotowa jako treść).
3. Level-aware deload + pasmo objętości → przy per-user kalibracji (roadmap, po H2/launchu).
4. Marketing dostaje amunicję: „reguły oparte na meta-analizach, z uczciwym oznaczeniem heurystyk" — do FAQ landinga i przyszłego artykułu K1 („Skąd Arco wie, kiedy dołożyć").
