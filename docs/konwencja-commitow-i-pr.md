# Arco — konwencja commitów i Pull Requestów

**Data:** 2026-07-27

Ten dokument ustala **format** wiadomości commita i treści PR-a. Sam proces — gałąź →
PR → zielone CI → merge, nazewnictwo gałęzi, ochrona `main` — jest w
`workflow-zespolu.md`. Szablon pełnego wpisu wykonawczego (brief, DoR/DoD) jest
w `standard-zadania-agentow.md` §5; PR może się do niego odwołać zamiast go powtarzać.

## 0. Dlaczego ten dokument istnieje

Repo miało tę konwencję i ją zgubiło. Historia zaczyna się dobrze:

```
feat(core-0): harden facts and offline sync
fix(history): stabilize Warsaw date hydration
docs(release): finalize TRAIN-02A4 and CORE-0
```

a kończy tak:

```
SESSION-01A4: rozciaganie w treningu, mocniejszy wystrzal konfetti
```

Bez typu, po polsku, z okaleczonymi diakrytykami (ASCII zamiast UTF-8). To nie jest nowa
zasada — to przywrócenie tej, która już działała, plus mechanizm, który nie pozwoli jej
znowu wyparować (§6).

## 1. Język — commity i PR-y po angielsku, dokumenty po polsku

| Co | Język |
|---|---|
| Wiadomość commita (subject + body) | **angielski** |
| Tytuł i opis PR-a | **angielski** |
| Nazwa gałęzi (opisowa część) | **angielski** — `agent/logger-focus-trap`, nie `agent/naprawa-fokusu` |
| Pliki w `docs/`, komentarze w kodzie, treść produktu (UI, copy) | **polski** — bez zmian |

Granica jest prosta: **co widzi GitHub (log, PR-y, gałęzie) → angielski. Co widzi
repo jako projekt (dokumentacja, kod, produkt) → polski**, jak dotąd. Nie tłumaczymy
istniejących komentarzy ani `docs/*.md` przy okazji niepowiązanej zmiany — to osobne
zadanie, jeśli kiedykolwiek będzie potrzebne.

## 2. Format commita — Conventional Commits

```
<type>(<scope>): <subject>

<body — opcjonalne, po pustej linii>

<footer — opcjonalne, po pustej linii>
```

**Subject:**
- tryb rozkazujący, czas teraźniejszy: `add`, nie `added`/`adds`;
- mała litera po dwukropku, bez kropki na końcu;
- ≤ 50 znaków — twardy limit 72, bo GitHub obcina dłuższe w listach;
- mówi, co się zmieniło w zachowaniu, nie w plikach: `fix(logger): restore focus after set deletion`,
  nie `fix(logger): update SetRow.tsx`.

**Typy** (zamknięty zbiór, z `angular`/Conventional Commits — to standard branżowy, nie
wynalazek tego repo):

| Typ | Kiedy |
|---|---|
| `feat` | nowe zachowanie widoczne dla użytkownika |
| `fix` | naprawa buga |
| `docs` | wyłącznie `docs/*.md`, `CLAUDE.md`, komentarze |
| `refactor` | zmiana struktury kodu bez zmiany zachowania |
| `test` | dodanie/poprawa testów bez zmiany kodu produkcyjnego |
| `perf` | poprawa wydajności |
| `chore` | zależności, konfiguracja, sprzątanie bez wpływu na produkt |
| `ci` | workflow GitHub Actions |
| `style` | formatowanie, bez zmiany logiki (rzadkie — mamy do tego linter) |
| `revert` | cofnięcie wcześniejszego commita |

**Scope** — obszar, którego dotyczy zmiana: `logger`, `session`, `training`, `history`,
`ekipa`, `deps`, `release`, `core-0`. Nazwa featuru/katalogu, lowercase, myślnik zamiast
spacji. Opcjonalny, ale zalecany — commit bez scope'u w dużym repo jest trudny do znalezienia
w `git log --oneline`.

**Body** — tylko gdy subject nie wystarcza. Odpowiada na **dlaczego**, nie **co** (kod już
mówi co). Dokładnie ten wzorzec, który repo już stosuje w komentarzach `// SESSION-01A2: …`:

```
fix(session): focus neighbour row before deleting current one

Focus was set in requestAnimationFrame AFTER onDelete(), racing React's
commit. Passed locally three times in a row, failed on CI: the frame
sometimes landed on a node React had already detached.

Move focus synchronously BEFORE deletion — the neighbour row survives
the operation, so there's no frame to race.
```

**Footer** — trailery. `Co-Authored-By: Claude <noreply@anthropic.com>` zostaje jak jest
(już poprawny format). Breaking change (rzadkie w tym repo — wewnętrzna PWA, nie publiczne
API) zapisujemy jako:

```
BREAKING CHANGE: session_sets.set_type no longer accepts "drop"
```

## 3. Atomowość

Jeden commit = jedna logiczna zmiana, którą da się opisać jednym zdaniem bez „i". Jeśli
w opisie potrzebujesz „oraz" łączącego dwie niepowiązane rzeczy — to dwa commity.

Wyjątek, który repo już stosuje świadomie: paczka `docs(release): …` osobno od paczki
kodu, nawet w tym samym PR-ze. To nie łamie atomowości — dokumentacja stanu to inna
logiczna zmiana niż zachowanie aplikacji, i osobny commit ułatwia `git blame`, gdy ktoś
szuka, kiedy zmieniło się zachowanie, a nie kiedy zaktualizowano HANDOFF.

Nie mieszamy poprawki buga z refaktorem „skoro już tu jestem" — to dwa commity, nawet
w tym samym PR-ze.

## 4. Format Pull Requesta

**Merge = squash.** Repo używa `Squash and merge` (patrz §6) — tytuł PR-a staje się
subjectem commita w `main`, a opis PR-a jego body. To podnosi stawkę: tytuł PR-a musi
spełniać te same reguły co subject commita (§2), nie jest osobnym bytem.

**Tytuł PR-a** = format subjectu commita: `fix(logger): restore focus after set deletion`.

**Opis PR-a** — minimalny szkielet:

```md
## Summary
- co się zmienia i dlaczego (2–4 punkty, nie ściana tekstu)

## Test plan
- [ ] lint / typecheck / build zielone
- [ ] testy jednostkowe: X/X
- [ ] testy przeglądarkowe: X/X (jeśli dotyczy)
- [ ] sprawdzone ręcznie: <konkretny scenariusz>
```

Dla zmian UI dokładamy **Screenshots** (przed/po, właściwy viewport). Dla zmian dotykających
loggera, offline, PWA lub danych treningowych PR może **linkować** do pełnego release
docu w `docs/` zamiast powtarzać jego treść — tak jak `session-01a4-release-2026-07-27.md`
jest źródłem szczegółów, a opis PR-a jest jego streszczeniem.

Szablon `.github/pull_request_template.md` wypełnia się automatycznie przy `New pull request`.

**Draft PR** — gdy praca nie jest gotowa do review, ale chcesz uruchomić CI albo pokazać
kierunek. Oznacz jawnie `Draft`, nie otwieraj gotowego PR-a z `WIP` w tytule.

## 5. Przykłady

**Dobrze:**
```
feat(session): add stretching timer as last workout item
fix(prefs): guard localStorage access against Safari private mode
docs(handoff): record SESSION-01A4 as merged
test(confetti): sample full flight to catch peak-height regression
```

**Źle — i dlaczego:**
```
update files                          # nie mówi co ani dlaczego
SESSION-01A2: zwarty logger            # brak typu, brak trybu rozkazującego
Fixed a bug.                           # czas przeszły, brak scope'u, brak konkretu
naprawiono fokus po usunieciu serii    # zły język + okaleczone diakrytyki
WIP                                    # PR ma być gotowy do review, nie stan pracy
```

## 6. Egzekwowanie

Prosa nie wystarcza — dowód jest w §0. Workflow **`PR title`** (`.github/workflows/pr-title.yml`)
sprawdza automatycznie, czy tytuł PR-a pasuje do formatu z §2/§4, i blokuje merge, jeśli nie.
To jedyny punkt egzekwowania: sprawdzamy **tytuł PR-a**, nie każdy commit na gałęzi — bo przy
squash-merge to tytuł PR-a ląduje w historii `main`, a commity robocze na gałęzi (`fixup!`,
`wip`, poprawki po review) i tak znikają przy scaleniu.

## 7. Ustaw raz: squash-only

GitHub → repo → **Settings → General → Pull Requests:**
- ✅ Allow squash merging — **Default to pull request title**
- ❌ Allow merge commits
- ❌ Allow rebase merging
- ✅ Automatically delete head branches

Bez tego historia `main` miesza style scalania (merge commit vs squash) zależnie od tego,
kto kliknął merge — dokładnie to, co widać w dzisiejszej historii repo.
