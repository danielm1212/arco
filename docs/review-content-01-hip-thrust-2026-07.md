# CONTENT-01 — review wariantów Hip Thrust

**Wersja:** `CONTENT-01A-v1`

**Data:** 2026-07-21

**Reviewer:** Codex

**Zakres:** `Barbell_Hip_Thrust`, `Dumbbell_Hip_Thrust`, `Single-Leg_Hip_Thrust`

## Decyzja wykonawcza

- `Barbell_Hip_Thrust` jest zablokowany w katalogu i usunięty z nowych sesji programów
  systemowych. Jego stare zdjęcia nie są publikowane przez seed ani punktowy sync.
- Trzy dotychczasowe sloty systemowe używają `Barbell_Glute_Bridge`, bez zmiany liczby serii,
  zakresu powtórzeń i przerw. Sloty zachowują ID; historia i już utworzone ćwiczenia sesji
  pozostają bez zmian.
- `Dumbbell_Hip_Thrust` i `Single-Leg_Hip_Thrust` dostają zatwierdzone instrukcje tekstowe,
  ale nadal mają neutralny placeholder. Ich media pozostają otwartym `CONTENT-01B`.
- Kandydat AI dla pozycji końcowej Barbell został odrzucony: nie pokazał jednoznacznej linii
  bark–biodro–kolano i zmienił podparcie. Żaden wygenerowany kadr nie trafia do produktu.

## Dowód problemu

Dotychczasowe dwa kadry `Barbell_Hip_Thrust` nie są wystarczającym materiałem instruktażowym:
pozycja końcowa pokazuje wyraźne odchylenie głowy, ramiona są szeroko oparte na ławce zamiast
stabilizować sztangę, a talerze zasłaniają kluczowe punkty ustawienia biodra i kolana. Nie jest
to dowód, że sam Hip Thrust jest niebezpieczny; to dowód, że te fotografie nie powinny uczyć
techniki w aplikacji.

## Podstawa merytoryczna i ograniczenia

1. Analiza biomechaniczna Barbell Hip Thrust potwierdza, że jest to realnie obciążane
   wyprostowanie biodra, ale nie waliduje bezpieczeństwa konkretnych fotografii ani jednej
   uniwersalnej techniki: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8006986/>.
2. Badanie porównawcze Barbell Hip Thrust i Barbell Glute Bridge na 10 mężczyznach wykazało,
   że oba ruchy efektywnie obciążają prostowniki biodra, a Glute Bridge dawał większą aktywację
   górnej i dolnej części pośladka wielkiego. Autorzy nazywają go co najmniej odpowiednim
   zamiennikiem, lecz nie badali urazów ani długoterminowej hipertrofii:
   <https://pubmed.ncbi.nlm.nih.gov/35586943/>.
3. Wniosek o podmianie jest więc konserwatywną decyzją produktową, a nie twierdzeniem, że jeden
   ruch jest medycznie „bezpieczny”, a drugi „niebezpieczny”.

## Kryteria review techniki

- stabilna ławka lub podłoga i czytelne punkty podparcia;
- ciężar zabezpieczony i kontrolowany oburącz;
- neutralna szyja, żebra kontrolowane nad miednicą;
- kolana prowadzone zgodnie ze stopami;
- zakończenie w wyproście biodra bez pokazywania przeprostu lędźwi;
- pełny kadr pokazujący barki, biodra, kolana, stopy i sprzęt;
- dwa zgodne statyczne kadry start/koniec przed usunięciem placeholdera.

## Status wariantów

| ID | Tekst | Media | Publikacja |
|---|---|---|---|
| `Barbell_Hip_Thrust` | zatwierdzony awaryjnie | stare odrzucone | zablokowany |
| `Barbell_Glute_Bridge` | zatwierdzony | 2 istniejące kadry zaakceptowane | zamiennik programowy |
| `Dumbbell_Hip_Thrust` | zatwierdzony | placeholder | otwarte `CONTENT-01B` |
| `Single-Leg_Hip_Thrust` | zatwierdzony | placeholder | otwarte `CONTENT-01B` |

## Gate `CONTENT-01B`

Nowe media Dumbbell i Single-Leg można opublikować dopiero, gdy oba kadry każdego wariantu
przechodzą powyższą checklistę, mają zapisane źródło/licencję oraz test czytelności w pełnym
arkuszu i miniaturze 44 px. Materiał AI wymaga ponownego jawnego wpisu review; samo wygenerowanie
obrazu nie zmienia statusu.
