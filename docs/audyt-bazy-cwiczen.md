# Audyt bazy ćwiczeń (S8) — wynik skanu + propozycja kuracji

> Data: 2026-07-04. Skan `scripts/data/exercises.json` (873 wpisy z free-exercise-db) + weryfikacja obrazków + użycie w apce. Kuracja = **propozycja do akceptacji [Ty]** (§3); nic nie ukrywam bez zgody.

## 1. Wynik skanu — baza zdrowsza, niż zakładał plan

| Sprawdzenie | Wynik |
|---|---|
| Duplikaty nazw (po normalizacji) | **0** |
| Wpisy bez obrazków / bez partii głównej | **0 / 0** |
| Obrazki z JSON vs lokalny backup (`../free-exercise-db`, 2619 jpg) | **komplet — 0 braków** |
| Hotlinki HTTP (spot-check 12, w tym wszystkie z programów) | **12/12 → 200 OK** |
| Wpisy bez instrukcji | było 5 → **naprawione** (Iron Cross, One-Arm KB Swings, Push Press, Side Bridge, Side Jackknife — SQL + trwały `INSTRUCTION_OVERRIDES` w `seed.ts`) |
| Krótkie instrukcje (<80 znaków) | 2 (kosmetyka, zostawione) |

**Wniosek:** punktu „martwe obrazki / duplikaty / śmieci" z planu w praktyce **nie ma** — upstream jest porządny. Realny temat to **szum kategorii** w pickerze (§2) i docelowo self-host obrazków (S11, bez zmian).

## 2. Rozkład kategorii (co siedzi w 873)

| Kategoria | Ile | Ocena przydatności w loggerze serii |
|---|---|---|
| strength | 581 | ✅ rdzeń |
| stretching | 123 | ⚠️ rozciąganie + SMR/foam-roll (11) — nie loguje się jako serie×powt.; **szum** w wynikach |
| plyometrics | 61 | 🤔 box jumps itp. — logowalne (powt.), niszowe |
| powerlifting | 38 | ✅ (m.in. Barbell Hip Thrust — w programach!) |
| olympic weightlifting | 35 | ✅ realny lifting |
| strongman | 21 | 🤔 atlas stones, yoke… nisza, ale nie przeszkadza |
| cardio | 14 | ⚠️ bieganie/rower — nie pasuje do modelu serii; **szum** |

**Pułapka wykryta:** kategorie upstream bywają błędne — np. **Superman** (w naszym programie bodyweight!) ma `stretching`. Każde filtrowanie po kategorii **musi mieć whitelistę wyjątków** (min. wszystko, co używane w programach — dziś 59 ćwiczeń — i historia usera).

## 3. Propozycja kuracji — do akceptacji [Ty]

Plan mówił „podzbiór ~150–250". Po skanie rekomenduję **łagodniejszą, dwustopniową** wersję (baza nie jest śmietnikiem; twarde cięcie do 200 zabiłoby long-tail searcha, który właśnie chwaliłeś):

- **Stopień 1 (rekomendowany do wdrożenia):** picker/swap **domyślnie ukrywa** `stretching` i `cardio` (−137 wpisów szumu), z whitelistą: ćwiczenia użyte w programach + w historii usera + custom. Search po nazwie **nadal znajduje wszystko** (ukrycie działa tylko na browse/chipy).
- **Stopień 2 (później, opcjonalnie):** flaga `featured` dla ~200 najsensowniejszych — sortowanie „featured first" w wynikach (nie ukrywanie). Dopiero gdyby po Stopniu 1 wyniki nadal szumiały.
- **Nie ruszamy:** plyometrics/strongman/olympic — logowalne i nie zaśmiecają typowych zapytań (dumbbell/barbell chipy i tak je odfiltrowują).

**Decyzja [Ty]:** wchodzimy w Stopień 1? (odwracalne — to filtr w query, nie zmiana danych).

## 4. Status „Done" S8
- Baza zweryfikowana ✓ · zero martwych obrazków w użyciu ✓ (sample + komplet w backupie) · braki instrukcji załatane ✓ · kuracja: propozycja czeka na [Ty].
