# SESSION-01A3 — jednorazowa podpowiedź startowa w loggerze

**Data:** 2026-07-27
**Gałąź:** `agent/session-01a3`
**Poprzednik:** SESSION-01A2 ([#27](https://github.com/danielm1212/arco/pull/27))

## Dlaczego

Po SESSION-01A2 wiersz serii kończy się samym checkiem, a jego kolor niesie stan
(neutralny → gotowy do zaliczenia → zaliczony). Pytanie z dogfoodu brzmiało: czy
użytkownik zrozumie, że pomarańczowy check trzeba dotknąć. Ryzyko jest umiarkowane —
check jest jedynym przyciskiem w wierszu — ale pierwsze wejście do loggera to jedyny
moment, w którym jedno zdanie realnie pomaga.

## Wynik

Popover zakotwiczony pod pierwszym wierszem serii, ze strzałką celującą w check,
na przyciemnionym tle:

> Wpisz ciężar i powtórzenia, potem zalicz serię ✓
> **[Rozumiem]**

Zasady:

- pokazywany raz na urządzenie (`prefs.loggerHintSeen`, ten sam wzorzec co R7
  `reorderHintSeen`);
- znika po „Rozumiem", Escape **albo po pierwszej zaliczonej serii** — kto zaczął
  logować, ten nie potrzebuje instrukcji;
- każde zniknięcie liczy się jako pokazana, więc podpowiedź nie wraca;
- nie pojawia się na sesji zakończonej ani historycznej.

Copy używa czasownika produktu („zalicz serię"), a nie „dotknij"/„kliknij" — ta sama
etykieta jest na przycisku (`aria-label="Zalicz serię"`), w podsumowaniu („1 seria
zaliczona") i w cofnięciu („Cofnij zaliczenie").

## Kontrakt overlayów

CLAUDE.md wymaga, żeby overlay blokował interakcję i przewijanie tła, zamykał się
Escape'em i poprawnie zarządzał fokusem. Wszystkie punkty są spełnione:

- **Portal do `body`.** Wewnątrz drzewa loggera dowolny przodek z `transform`
  (przejścia ekranów) stałby się blokiem zawierającym dla `position: fixed`
  i przyciemnienie przestałoby pokrywać cały ekran.
- **Blokada tła przez współdzielony lock.** `acquireBodyScrollLock` /
  `releaseBodyScrollLock` zostały wyciągnięte z `components/ui/bottom-sheet.tsx` do
  `lib/bodyScrollLock.ts` **bez zmiany zachowania**. Dwa niezależne liczniki referencji
  zapisywałyby style `body` nawzajem po sobie i gubiły pozycję strony — dokładnie ten
  błąd TRUST-03 już raz naprawiał dla sheet-w-sheecie.
- **Zamyka wyłącznie „Rozumiem" i Escape — świadomy wyjątek od reguły overlayów.**
  CLAUDE.md wymaga, żeby overlay dało się zamknąć także kliknięciem w tło. Tutaj tego
  celowo nie ma (decyzja właściciela, 2026-07-27): podpowiedź pokazuje się **raz w życiu**,
  więc przypadkowe muśnięcie ekranu w drodze do pierwszego pola kasowałoby ją bezpowrotnie
  w jedynym momencie, w którym była potrzebna. To odróżnia ją od funkcjonalnych sheetów,
  które użytkownik otwiera sam i może otworzyć ponownie. Escape zostaje, bo bez niego
  overlay byłby nieobsługiwalny z klawiatury. Regresję pilnuje test przeglądarkowy.
- **Pułapka fokusu** — nowy `lib/useFocusTrap.ts`: fokus wchodzi do overlaya, Tab
  i Shift+Tab krążą wewnątrz, `focusin` pilnuje ucieczek poza klawiaturą, a po
  zamknięciu fokus wraca do elementu, z którego przyszedł.

Hook jest świadomie niezależny od `BottomSheet`. HANDOFF (ryzyko 6) notuje, że
funkcjonalne sheety nie mają jeszcze kompletnego trapu — teraz istnieje gotowe
narzędzie, którym da się ten dług spłacić bez przepisywania samych arkuszy.
**Ryzyko 6 pozostaje otwarte**: hook nie został jeszcze podpięty do sheetów.

## Znalezisko: `prefs.ts` bez osłony

Nowy test przeglądarkowy montuje podpowiedź na origin bez dostępu do `localStorage`
i natychmiast wywrócił komponent: `prefs.ts` wołało `localStorage` bez `try/catch`.
To nie jest problem wyłącznie testowy — `localStorage` rzuca wyjątkiem w Safari
w trybie prywatnym, przy zapełnionej quocie i w kontekstach z zablokowanym storage.
Nieosłonięty zapis w cleanupie overlaya wywalałby cały ekran treningu.

Wszystkie dostępy w `prefs.ts` są teraz osłonięte: preferencja po cichu przepada,
trening idzie dalej — ta sama zasada, którą `RoutineTimer` stosował od SESSION-01A2
dla własnych kluczy.

## Walidacja

- lint i TypeScript: zielone;
- testy jednostkowe: **157/157** (w tym trwałość flagi i niedostępny storage);
- testy przeglądarkowe: **31/31**, w tym TRUST-03 15/15 po ekstrakcji locka;
- build produkcyjny: zielony.

Dwa nowe testy przeglądarkowe montują prawdziwy `LoggerHint`: kotwiczenie pod wierszem
serii wraz z pełnym pokryciem widoku i portalowaniem do `body` oraz kontrakt overlaya
(blokada tła, pułapka fokusu, Escape, zwrot fokusu).

### Dogfood

Konto lokalne `session01a2@arco.test`, sesja `0a371297-7c3d-4473-ba99-7f7c9b6d30ba`.
Potwierdzone pomiarem w przeglądarce: przyciemnienie `375×812 @ 0,0` przy widoku
`375×812`, rodzic overlaya to `BODY`, `body` w stanie `position: fixed`, próba
przewinięcia tła nie zmienia pozycji, fokus na „Rozumiem", trzy Taby nie wychodzą poza
overlay. Po Escape: podpowiedź znika, `body` wraca do `static`, tło znów się przewija,
flaga zapisana, a po przeładowaniu podpowiedź się nie pokazuje.

## Otwarte

- ryzyko 6 z HANDOFF: podpiąć `useFocusTrap` do `BottomSheet` i pozostałych sheetów;
- [Ty] checkpoint fizycznego iPhone PWA/Safari — wspólnie z zaległościami R4A,
  SESSION-01A i SESSION-01A2;
- kolejny zakres produktu bez zmian: PLAN-Q.
