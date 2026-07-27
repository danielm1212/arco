# TRAIN-02A4 — kontrolowany release pięciu planów

**Data:** 2026-07-27
**Status:** wdrożone i zweryfikowane na produkcji
**Zakres:** P01, P03, P08, P11 i P12 oraz minimalny, addytywny zapis alternatyw sprzętowych

## Co weszło

- `20260727133000_train03_05_minimum_alternatives.sql` — tabela
  `program_slot_alternatives`, RLS oraz uprawnienia do odczytu dla zalogowanego użytkownika;
- `20260727134000_train02a4_required_exercises.sql` — punktowe uzupełnienie dwóch brakujących
  rekordów katalogu: `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`;
- `20260727134500_train02a4_missing_programs.sql` — idempotentny point sync pięciu planów
  systemowych, ich dni, slotów i 29 alternatyw.

Nie był to pełny seed ani migracja danych użytkownika. Sync dotyka tylko pięciu wskazanych
slugów systemowych, zachowuje istniejące identyfikatory przy ponownym uruchomieniu i kończy się
błędem przy dryfie struktury.

## Kontrola wdrożenia

1. Przed wdrożeniem wykonano backup `backups/20260727T110823Z` (`roles.sql`, `schema.sql`,
   `data.sql`); wszystkie sumy SHA-256 zostały sprawdzone.
2. Lokalny reset, seed, dry-run i testy migracji potwierdziły idempotencję, RLS A/B oraz brak
   możliwości zapisu alternatyw przez klienta.
3. Pierwsza próba produkcyjna zatrzymała się na brakujących ćwiczeniach. Blok transakcyjny
   migracji A4 wycofał się w całości — nie powstał częściowy plan ani slot.
4. Po punktowym uzupełnieniu katalogu druga próba zastosowała obie migracje pomyślnie.
   Historia migracji lokalnej i zdalnej jest zgodna do `20260727134500`.

Do wdrożenia użyto połączenia z bazą jako zalogowana rola administracyjna CLI, bez klucza
`service_role`. SEC-03 pozostaje osobnym zadaniem rotacji ujawnionego wcześniej sekretu.

## Stan produkcji po release

| Kontrola | Wynik |
|---|---:|
| Programy systemowe | 15 |
| Programy z point syncu | 5 |
| Dni w pięciu planach | 15 |
| Sloty w pięciu planach | 99 |
| Alternatywy sprzętowe | 29 |
| Duplikaty slugów systemowych | 0 |

Weryfikacja danych i odczytowy smoke aplikacji potwierdziły widoczność wszystkich 15 kart,
detale dwóch nowych planów oraz obu dodanych ćwiczeń wraz z instrukcją. Konsola aplikacji nie
zarejestrowała ostrzeżeń ani błędów.

Aktywne plany, sesje, ćwiczenia sesji, serie, rekordy i ustawienia nie zmieniły się względem
backupu. Poza zakresem migracji, między backupem a kontrolą końcową, zniknął jeden prywatny
pusty plan z jednym dniem i bez slotów. Point sync nie ma operacji `DELETE` i nie dotyka planów
z `user_id`, więc ta zmiana nie pochodzi z release'u.

## Dalsza praca

Minimalna tabela alternatyw odblokowała publikację A4, ale nie zamyka pełnego TRAIN-03/05:
kanoniczny słownik sprzętu, wykonalność per slot, rozszerzona recepta v2, snapshoty oraz UI
wariantów nadal należą do PLAN-Q. Szczegół kolejności jest w
`plan-sprintow-2026-07.md` i `spec-plan-q-biblioteka-treningow.md`.
