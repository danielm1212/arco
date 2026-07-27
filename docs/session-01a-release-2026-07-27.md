# SESSION-01A — release przygotowania i zakończenia sesji

**Data:** 2026-07-27
**PR:** [#25](https://github.com/danielm1212/arco/pull/25)
**Commit produkcyjny:** `47f48aee8b6ab295501d0392364973907ce9fb44`

## Wynik

SESSION-01A jest wdrożone na produkcji jako mała, pomijalna warstwa prowadzenia:

- po dłuższym bezruchu logger sugeruje 3–5 min lekkiego ruchu;
- pierwszy ciężki, power lub skill wzorzec dostaje 2 lekkie serie przygotowawcze;
- kolejny nowy wzorzec dostaje 1 krótszą serię wprowadzającą;
- CTA dodaje serie `warmup` przed roboczymi, bez zmiany numeracji 1/2/3;
- rozgrzewka nie liczy się do ukończenia, objętości, Historii, progresji ani rekordów;
- serwer nie pozwala zakończyć treningu złożonego wyłącznie z rozgrzewki;
- Done ma zwinięte, opcjonalne 2–5 min spokojnego marszu/oddechu i 1–2 pozycje
  mobilności dla komfortu, bez obietnic regeneracji i bez wpływu na zaliczenie.

Nie dodano nowego schematu ani migracji. Interaktywny rytuał SESSION-01B, nowe ćwiczenia
i zmiany recept programów pozostały poza zakresem.

## Znalezisko z dogfoodu

Natychmiastowy reload po dodaniu serii rozgrzewkowych prawidłowo odzyskiwał szkic, ale
ujawnił błąd hydratacji Reacta: licznik outboxa był czytany z `localStorage` podczas
pierwszego renderu klienta, podczas gdy serwer renderował zero. Liczniki mają teraz
deterministyczny pierwszy render i odczytują stan urządzenia dopiero po montażu; logger
korzysta ze scoped state zamiast bezpośredniego odczytu storage podczas renderu.

Powtórzony scenariusz „dodaj 2 rozgrzewkowe → natychmiast przeładuj” odzyskał oba wiersze,
zachował 5 serii roboczych i 1382 kg oraz nie zgłosił żadnego błędu konsoli.

## Walidacja

- lint i TypeScript: zielone;
- testy jednostkowe: 158/158;
- build produkcyjny: zielony;
- testy przeglądarkowe: 26/26 na 320, 375 i 393 px;
- walidator treści: 907 ćwiczeń / 15 programów / 308 slotów;
- rekomendacje: 60/60;
- CI PR i ponowne CI na `main`: oba joby „Jakość” zielone;
- Vercel dla produkcyjnego commita: `Deployment has completed`;
- publiczny ekran logowania po przeładowaniu: render poprawny, zero błędów konsoli.

Konto QA i otwarta sesja pozostają do dalszej regresji R4A. Dwie serie `warmup` utworzone
na potrzeby SESSION-01A zostały usunięte punktowo przez UI.

## Otwarte

- [Ty] checkpoint fizycznego iPhone PWA/Safari oraz starego Service Workera;
- kolejny zakres produktu: PLAN-Q.
