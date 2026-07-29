# PLAN-C — ślad wdrożenia biblioteki treningowej na produkcję

**Data:** 2026-07-29
**Zakres:** korekta wszystkich 15 programów systemowych + narzędzia kontroli
**Stan:** wdrożone; `migration list` potwierdza local == remote, 60 migracji, zero oczekujących

## Co weszło na produkcję

Osiem migracji, jednym ciągiem (dwie tury z powodu awarii opisanej niżej):

| Migracja | Zawartość |
|---|---|
| `20260728000000` | sprzątanie porzuconej sesji — **no-op**, warunek bezpieczeństwa odmówił (patrz §Pomyłka) |
| `20260728213337` | PLAN-C1: recepta v2.1 dla `intermediate-gym-fbw2` |
| `20260729094010` | PLAN-C1B: dociążenie dołu i łydki we flagowcu |
| `20260729102750` | PLAN-C2: ramiona w planach beginner + prawda o czasie sesji |
| `20260729110000` | sprzątanie tej samej sesji, tym razem z jawnym pinem stanu |
| `20260729142034` | PLAN-C3: brzuch i ramiona w lower-body, korekta czasu PPL |
| `20260729143423` | PLAN-C4: łydki w domowym FBW, pośladki w górze/dole |

Weryfikacja bezpośrednio w bazie produkcyjnej po wdrożeniu: 15 programów systemowych,
334 sloty, zero otwartych sesji, wszystkie deklarowane czasy zgodne z receptą.

## Efekt dla użytkownika

| | Przed | Po |
|---|---|---|
| Twarde zera pokrycia (0 bezpośrednio **i** 0 pośrednio) | 1 (`lower-body-gym3` — brzuch) | **0** |
| Dni z nieprawdziwym deklarowanym czasem | 7 planów, do 26 min rozjazdu | **0** |
| Plany bez bezpośredniej pracy ramion | 7 | 2 (kalistenika, świadomie) |
| Plany bez karty w `docs/trainings/` | 2 | **0** |

## Pomyłka, którą trzeba odnotować

Raportowałem właścicielowi, że blokująca sesja z 2026-07-19 jest pusta („7 ćwiczeń, 0 serii").
Było to nieprawdą: skrypt sprawdzający szukał w `session_sets` kolumny `session_id`, a ta tabela
wiąże się przez `session_exercise_id`. Sesja miała **26 serii, 10 zaliczonych**.

Zgoda na usunięcie została udzielona na podstawie tej błędnej informacji. Migracja
`20260728000000` **odmówiła usunięcia**, bo warunek `not exists (… session_sets …)` zadziałał —
i to jedyny powód, dla którego dane nie zostały zniszczone. Dopiero po przedstawieniu prawdziwych
liczb właściciel ponowił decyzję, a `20260729110000` wykonała usunięcie z jawnym pinem stanu
(dokładnie to ID, niezakończona, dokładnie 26 serii).

**Wniosek na przyszłość:** warunki bezpieczeństwa w SQL są warte więcej niż moja analiza stanu
przed operacją. Zapisane jako reguła w `decyzje-produktowe.md` (D-47).

## Awaria pierwszej próby pushu

Pierwsza wersja migracji sprzątającej używała bloku PL/pgSQL z `RAISE` i przewróciła się na
produkcji na błędzie, którego CLI nie pokazuje nawet z `--debug` (`LegacyDbPushApplyError`,
bez treści błędu Postgresa). Ta sama migracja przechodziła lokalnie. Wersje Postgresa identyczne
(17.6) — różnica to pooler kontra połączenie bezpośrednie.

Rozwiązanie: warunki bezpieczeństwa przeniesione do `WHERE`, jedno zdanie `DELETE`, zero
PL/pgSQL. **Produkcja nie została w stanie połowicznym** — awaria trafiła w pierwszą migrację.

## Znalezisko poza zakresem: dryf `advanced-gym-ppl6`

Porównanie seeda z produkcją po wdrożeniu pokazało jedyny rozjazd: 38 slotów w seedzie wobec
**36 na produkcji**. Brakuje pracy brzucha w obu dniach nóg:

- `Legs A · ciężki` — brak `Ab_Wheel_Rollout`
- `Legs B · objętość` — brak `Hanging_Leg_Raise`

To dryf **sprzed** PLAN-C: żadna z wdrożonych migracji nie dotykała slotów PPL, a TRAIN-02A4
point-syncował P01/P03/P08/P11/P12, nie P13. Efekt jest ten sam, który naprawialiśmy w
`lower-body-gym3`: plan bez pracy core w dniach nóg.

**Do decyzji:** punktowy sync dwóch slotów doprowadzający produkcję do seeda. Jedna mała
migracja, ten sam wzorzec co PLAN-C3/C4.

## Czego to wdrożenie nie zmienia

- **Nikt nie przetrenował tych planów.** Cała walidacja to warstwa danych.
- **Brak weryfikacji wizualnej** — ekrany planów są za loginem.
- **56 slotów używa zaślepki zdjęcia** (17 unikalnych ćwiczeń), w tym dwa we flagowcu.
- **Brak niezależnego coach sign-off**, którego audyt v2.1 wymaga jako P0 przed testami z ludźmi.
- **14% slotów ma alternatywę**; dziesięć planów nie ma ani jednej.

Lista warunków przed wpuszczeniem obcych użytkowników jest w `ocena-biblioteki-v21-2026-07.md`.
