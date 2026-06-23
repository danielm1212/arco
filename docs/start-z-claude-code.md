# Jak zacząć z Claude Code (apka treningowa)

Instrukcja odpalenia projektu z dwóch plików: `build-brief-apka-treningowa-v0.2.md` (brief) i `seed-prompt-fbw.md` (seed). Zakłada, że budujesz lokalnie w terminalu.

---

## 0. Prereki

- **Node.js 18+** (zawiera npm). Sprawdź: `node -v`.
- Konto z subskrypcją Claude (Pro/Max/Team) lub Claude Console.
- Konto Supabase (darmowy tier wystarczy) i konto Vercel na później.

## 1. Instalacja Claude Code

```bash
npm install -g @anthropic-ai/claude-code
# albo natywnie: brew install --cask claude-code  (macOS/Linux)
claude --version
```
Nie używaj `sudo`. Przy błędach uprawnień ustaw user-writable prefix npm (`~/.npm-global`).
Claude Code jest też w VS Code / JetBrains, na webie i w desktopie. CLI jest najwygodniejszy do tego typu projektu.

## 2. Szkielet repo

```bash
npx create-next-app@latest korta-trening --typescript --tailwind --app --eslint
cd korta-trening
mkdir docs
# wrzuć oba pliki .md do docs/
#   docs/build-brief-apka-treningowa-v0.2.md
#   docs/seed-prompt-fbw.md
git init && git add -A && git commit -m "init + brief"
```

## 3. Supabase (przed Phase 0)

- Utwórz projekt w Supabase, skopiuj `Project URL` i `anon key`.
- Dodaj `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
- `.env.local` ma być w `.gitignore` (Next domyślnie to robi).

## 4. CLAUDE.md (kontekst i guardraile)

Utwórz `CLAUDE.md` w rootcie repo. Claude Code czyta go automatycznie przy każdej sesji, więc to tu trzymasz reguły, a nie wkleja za każdym razem:

```markdown
# Projekt: osobista apka treningowa (web, PWA)

## Źródło prawdy
- Specyfikacja: docs/build-brief-apka-treningowa-v0.2.md
- Seed programów: docs/seed-prompt-fbw.md
Przeczytaj OBA w całości zanim cokolwiek napiszesz. Brief jest nadrzędny.

## Zasady pracy
- Buduj FAZAMI wg sekcji 6 briefu. STOP na review po Phase 0 i po Phase 1. Nie idź dalej bez mojej zgody.
- Przed kodowaniem nowej fazy: przedstaw plan i zadaj pytania o luki. Plan najpierw, kod potem.
- Out of scope (sekcja 11 briefu) jest zakazane: bez social, AI auto-programming, macro, wearables, natywu, monetyzacji.

## Techniczne
- Migracje DB tylko przez Supabase migrations, nie ad-hoc SQL.
- Auth przez @supabase/ssr (nie auth-helpers).
- PWA: zweryfikuj aktualny tooling pod App Router (Serwist), nie zakładaj next-pwa.
- Zero magic numbers w stylach. Komponenty czytają tylko semantyczne design tokeny.
- RLS po user_id na wszystkich tabelach z danymi usera.

## Definicja done
Acceptance criteria z sekcji 10 briefu. Faza jest skończona dopiero gdy je spełnia.
```

## 5. Prompt startowy (wklej w sesji `claude`)

Odpal `claude` w katalogu repo, zaloguj się, potem wklej:

```
Przeczytaj docs/build-brief-apka-treningowa-v0.2.md oraz docs/seed-prompt-fbw.md w całości.
Nie pisz jeszcze kodu.

Wejdź w tryb planowania i przedstaw plan Phase 0 (Fundament): schema + migracje + RLS,
seed bazy z free-exercise-db, seed obu programów FBW wg seed-prompt-fbw.md,
Supabase Auth (jedno konto, login bez signup), warstwa design tokenów, app shell,
konfiguracja PWA oraz spike: rest timer w tle na iOS PWA.

Wypisz: (a) założenia, (b) pytania o luki, (c) kolejność kroków.
Czekaj na moją akceptację planu. Dopiero po niej implementuj Phase 0 i zatrzymaj się na review.
```

## 6. Rytm pracy

1. **Plan** → przeczytaj, dopytaj, zaakceptuj. (To moment, w którym łapiesz złe założenia tanio.)
2. **Phase 0** → Claude implementuje, Ty robisz review. Sprawdź acceptance criteria Phase 0.
3. **Commit** po każdej działającej fazie. Łatwy revert, gdy coś pójdzie nie tak.
4. **Phase 1** → ten sam cykl: plan → kod → review. Tu masz pierwszy używalny logger.
5. Dopiero potem Phase 2 (podmiana, dashboard, supersety) i Phase 2.5 (offline).

## 7. Praktyczne wskazówki

- Claude Code prosi o zgodę przed edycją plików. Na początku zostaw tryb „pytaj", włącz „accept all" dopiero gdy mu ufasz w danym zadaniu.
- Gdy plan jest za szeroki, każ rozbić fazę na mniejsze kroki i rób je pojedynczo.
- Jak coś się rozjedzie: `git diff`, ewentualnie revert do ostatniego dobrego commita, i wróć z węższym promptem.
- Po Phase 1, jak chcesz, wyciągnę z briefu osobny, węższy prompt pod sam silnik podmiany albo pod warstwę tokenów.

---

*Kolejność jest celowa: plan przed kodem, faza przed fazą, commit po każdej. To samo tempo, które trzyma jakość, gdy budujesz z agentem.*
