---
name: arco-session-start
description: Bezpieczne podjęcie pracy na repo arco przy wielu agentach równolegle (Claude, Codex, [Ty]) — sprawdzenie gałęzi, stanu Git, cudzego WIP i rezerwacji, zanim cokolwiek zmienisz. Użyj na starcie każdej sesji roboczej i przy „zacznijmy", zanim dotkniesz plików.
---

# Start sesji na repo arco

Blizny (jedna sesja, 2026-07): założenie „jestem na `main`", gdy HEAD był na gałęzi agenta;
commit dołożony do cudzego PR-a; push nie na tę gałąź; edycja pliku z aktywnym WIP-em innej
sesji. Wszystkie do uniknięcia dwoma minutami sprawdzenia na starcie.

`standard-zadania-agentow.md §2` opisuje kolejność pracy — ten skill wymusza jej pierwszy krok:
**nie ufaj założeniom o stanie repo. Sprawdź.**

## 1. Ustal, gdzie realnie jesteś (zanim cokolwiek zmienisz)

```
git rev-parse --abbrev-ref HEAD          # która gałąź NAPRAWDĘ (nie „chyba main")
git status -s                            # cudzy WIP? untracked?
git fetch origin -q && git log --oneline origin/main -5
```

- **Nie zakładaj gałęzi.** Codex pracuje na `agent/*` i merguje przez PR — HEAD bywa gdzie
  indziej, niż pamiętasz z poprzedniej tury.
- **Cudze niezacommitowane zmiany w working tree = nie Twoje.** Nie commituj ich, nie nadpisuj,
  nie rób `git checkout`/`reset`/`clean` bez stasha. `git add` tylko własne pliki; po `git status`
  sprawdź, co dokładnie wchodzi do commita.
- **Praca dłuższa niż drobny fix → własna gałąź `agent/<zakres>`**, nie bezpośrednio `main`.

## 2. Przeczytaj stan, nie pamięć

`CLAUDE.md` → `HANDOFF.md` → aktywny sprint → `koordynacja-agentow.md` (rezerwacje + ostatnie
wpisy). Repo jest źródłem prawdy; Twoja pamięć z poprzedniej sesji mogła się zdezaktualizować
(Codex działa szybko i równolegle — SHA, gałęzie i stan planu potrafią się zmienić między turami).

## 3. Zarezerwuj pas

Dopisz rezerwację w `koordynacja-agentow.md` (obszar/pliki, które ruszasz). Nie wchodź w obszar
z aktywną rezerwacją innej sesji bez uzgodnienia. Migracja = osobna rezerwacja + unikalny
timestamp (patrz `arco-migration`).

## 4. Zweryfikuj problem, zanim go „naprawisz"

Nie implementuj na podstawie samej starej notatki — potwierdź w kodzie lub na urządzeniu
(patrz `arco-debug`). Notatka mogła opisywać stan sprzed trzech merge'ów.

## Czerwone flagi — STOP i wyjaśnij, nie idź dalej

- HEAD na gałęzi, której się nie spodziewałeś; `origin/main` przesunięty od Twojego ostatniego odczytu.
- Working tree z cudzymi zmianami (`M`/`??`), których nie robiłeś w tej sesji.
- Prośba o push „na main", gdy lokalna gałąź to `agent/*` (albo odwrotnie) — potwierdź cel pushu.
- Dwie sesje w tym samym obszarze — dogadaj się w dzienniku, nie ścigaj commitami.
