# Arco — standard współpracy w kodzie (Daniel + Piotr)

**Data:** 2026-07-22

Obaj czasem dziubiecie w kodzie — **także obaj we froncie**, więc obszary się nakładają.
Równolegle pracują agenci (Claude, Codex). Ten standard ma jeden cel: **zmiany z dwóch stron
nie wchodzą sobie w drogę, a nic zepsutego nie trafia na produkcję.**

Nie liczymy na to, że „Piotr backend / Daniel front" załatwi kolizje — bo nie jest szczelny.
Stawiamy na **krótkie gałęzie, szybki merge i widoczność, kto co robi.**

## Zasada nr 1 — nikt nie koduje bezpośrednio na `main`

`main` = produkcja (Vercel deployuje z niego automatycznie). Każda zmiana idzie przez
**krótką gałąź → Pull Request → zielone CI → merge**. Konflikt wychodzi w PR-ze, nie na prodzie,
i osoba ucząca się gita nigdy nie wypchnie przypadkiem czegoś zepsutego na żywo.

## Codzienny cykl (happy path)

1. **Weź zadanie w Linear** — przypisz siebie, przeciągnij na *In Progress*. To Wasz „claim":
   druga osoba od razu widzi, że to robisz, zanim zacznie to samo.
2. **Świeży start:** `git checkout main && git pull`.
3. **Własna gałąź:** `git checkout -b daniel/krotki-opis` (Piotr: `piotr/...`, agent: `agent/...`).
4. **Małe commity**, jedna rzecz naraz.
5. **Push + PR:** `git push -u origin daniel/krotki-opis`, otwórz Pull Request.
6. **CI „Jakość" zielone → Merge** do `main`. Vercel zdeployuje sam.
7. **Linear → Done.**

## Pięć reguł, które tną konflikty (gdy obszary się nakładają)

1. **Małe PR-y, mergowane w godzinach, nie w tygodniu.** To główna obrona, gdy obaj ruszacie
   front. Gruba, długo żyjąca gałąź = pewny konflikt. Lepiej pięć małych PR-ów niż jeden wielki.
2. **Zobacz, zanim zaczniesz.** Linear (kto ma *In Progress*) + `git branch -a` (jakie gałęzie
   żyją). Jeśli druga osoba siedzi w pliku, który chcesz ruszyć — jedno zdanie na czacie/Linear
   oszczędza pół godziny scalania.
3. **Aktualizuj gałąź często.** Zanim otworzysz PR (albo gdy gałąź żyje dłużej):
   `git checkout main && git pull`, potem na swojej gałęzi `git merge main`. Konflikt rozwiązujesz
   na bieżąco, po kawałku — nie na końcu w jednej wielkiej kupie.
4. **Gorące wspólne pliki — heads-up.** Kilka plików rusza się często z obu stron (np.
   `app/globals.css`, wspólne `components/ui/*`, duże strony, `HANDOFF.md`). Wchodzisz w taki —
   rzuć drugiej osobie znać. To ~90% Waszych realnych kolizji.
5. **Jedna migracja bazy naraz.** Migracje to jedyne miejsce, gdzie równoległość jest groźna.
   Kto rusza schemat — mówi drugiemu i robi to sam do końca (`arco-migration`).

## Konflikt mimo wszystko? To normalne, nie awaria

Git oznaczy pliki znacznikami `<<<<<<<` / `=======` / `>>>>>>>`. Wybierasz, która wersja zostaje
(albo łączysz obie), usuwasz znaczniki, `git add` + `git commit`. Przy małych PR-ach to zwykle
1–2 miejsca, 2 minuty. Nie masz pewności — nie zgaduj, zawołaj Piotra (albo agenta).

## Ustaw raz: ochrona `main`

GitHub → repo → **Settings → Branches → Add branch protection rule → `main`:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass → workflow **„Jakość"**

Wtedy nikt (człowiek ani agent) nie ominie PR-a i zielonego CI. Deploy = **merge PR**, nie
`git push` na `main`.

## Jak to się ma do agentów (Claude / Codex)

Ten sam model. Agenci pracują na `agent/*`, rezerwują pas w `koordynacja-agentow.md` i otwierają
PR-y — dokładnie jak Wy. Różnica tylko w „claimie": Wasz to **assignee w Linear**, ich to
**wpis w dzienniku koordynacji**. Jedna gałąź `main`, jedna kolejka PR-ów dla wszystkich.
Skille `arco-session-start` i `arco-release` egzekwują to po stronie agentów.

## Nazewnictwo gałęzi

`<kto>/<krótki-opis>` — np. `daniel/fix-topbar`, `piotr/rate-limit`, `agent/q1-content-03`.
Krótko, po zadaniu, jedna gałąź = jedno zadanie.

## Ściąga (wydrukuj sobie na start)

```
main = prod, nietykalny bezpośrednio
1. Linear: assign + In Progress
2. git checkout main && git pull
3. git checkout -b daniel/opis
4. praca → małe commity
5. git push -u origin daniel/opis → PR
6. CI zielone → Merge
7. Linear → Done
Konflikt? git merge main często. Migracja? jeden naraz + gadaj.
```
