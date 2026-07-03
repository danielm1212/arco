# Arco — stan projektu i handoff (do kontynuacji w nowej sesji)

> Czytaj razem z `CLAUDE.md` (źródło prawdy) i resztą `docs/`. Ten plik mówi: gdzie jesteśmy i co dalej.
> Aktualizacja: 2026-06-26.

## ⭐ STAN NAJNOWSZY (czytaj to pierwsze)
Pracujemy **sprintami** (`docs/sprinty-szczegolowe.md` = żywy plan z podziałem Claude/Ty). Wizja + konkurencja: `docs/roadmap.md`, `docs/konkurencja-hevy.md`. Pamięć: `proactive-architecture-review`, `arco-long-term-vision`.

**Zrobione:** redesign „Athletic" + theme toggle + **Sprint 1** (polish loggera) + **Sprint 2** (ekran po treningu/celebracja + cel tygodniowy + last-set per wiersz) + **Sprint 3** (kalendarz/passa na /history + **anatomiczna heatmapa** na /progress, `react-body-highlighter` zwendorowana do `vendor/`) + **Sprint 4 [Claude]** (`f881bb2` — wspólny `ExerciseBrowser` z filtrami partia/sprzęt/wzorzec dla add+swap; **stoper `timed` z odliczaniem do celu**; mapowania w `lib/exerciseFilters.ts`).

**Zrobione (cd.): Sprint 5 KOMPLETNY** — guidance rule-based (rdzeń wyróżnika): hint progresji rozszerzony (pełny/poniżej zakresu, timed) + balans push/pull + staleness partii (Faza A `e9cb7f1`) + **deload wg stagnacji metryki** (Faza B `1eb6969`). Wszystko w karcie „Wskazówki" na home + loggerze. Progi profilu „standardowego" jako stałe w `lib/guidance.ts` (`GUIDANCE`).

**Zrobione (cd.): Sprint 6 — audyt FBW + nowy zestaw programów.** Audyt (`docs/audyt-fbw.md`) + korekty kategorii (`EXERCISE_CATEGORY_OVERRIDE`) + **6 kuratorowanych programów** (`docs/trainings/` od trenera → seed `ce53b29`, zastąpiły stare 7; mapowanie: `docs/trainings-mapowanie.md`). Aktywny: „Dom z hantlami".

**Zrobione (cd.): S6 KOMPLETNY** — custom ćwiczenie (`dbc8391`): `user_id` na `exercises` + RLS (wzorzec programs), formularz „+ Własne ćwiczenie" w pickerze (typ/sprzęt/partia/wzorzec/opis/zdjęcie → publiczny bucket `exercise-photos`), badge „własne", usuwanie w ⓘ z guardem historii/programu. Akcje zwracają `{error}` zamiast throw (Next maskuje message w prod). **N2 też ZROBIONE** (pkt 1–6, 8–9; #7 reorder opc. nietknięty) — statusy i commity w `plan-sprintow-2026-07.md`.

**⚠️ Incydent 2026-07-02 (patrz pamięć `arco-test-data-cleanup`):** hurtowe `delete from sessions` skasowało realny trening właściciela z 1.07. Odtworzony z PR-ów jako sesja-rekonstrukcja `f2e5386a` (Dzień A + 3 extra, najlepsze serie; snapshot: `backups/pr-snapshot-2026-07-02.csv`). PR-y oryginalne nietknięte.

**Zrobione (cd.): S12 KOMPLETNY (bez „edycji zapisanego treningu” — Refinement [Ty])** — mini-bar „Trening w toku” globalnie (9401708), rep-PRs on-the-fly + hint „rekord przy N powt.” + mikro-celebracja PR (volt-flash+badge, b17aaca), edycja daty sesji (49904ea). Też: Switch w ustawieniach (0bfadfd). **Sync z Notion: rytuał działa** (wpisy S12 na „Do testu [Ty]”).

**Zrobione (cd.): S13 KOMPLETNY** — Muscle Split % (historia+celebracja, `85c2cfa`), delta-karty + nagłówki-interpretacje na /progress (`33538bd`, ton/progi do kalibracji [Ty]), picker: Ostatnio używane + multi-select + 📈 do progresu (`88a8c6e`). Notion zsynchronizowany (Do testu [Ty]).

**Następny: S14 — empty states** (przed launchem) albo audyty S8–S10. **N1 deploy-lite** wciąż czeka na [Ty] (konta; przypomnienie 9:00 aktywne). Decyzja wizualna [Ty] otwarta.

**Nowe (2026-07-02): analiza UX Hevy** — `docs/konkurencja-hevy-ux.md` (ekrany + warstwa funkcjonalna, matryca #1–#30). Wynik: sprinty **S12–S14** w `sprinty-szczegolowe.md` (sesja globalna + rep-PRs · postępy-lustro + picker · empty states), punkty 8–9 dopisane do N2, 14 wpisów w Notion „Baza pomysłów" (Backlog). Kolejność wpięcia S12–S14 — propozycja w `plan-sprintow-2026-07.md`, czeka na [Ty].

**⚠️ NOWA KOLEJNOŚĆ SPRINTÓW (2026-07-02):** po S6 wchodzi **`docs/plan-sprintow-2026-07.md`** — re-priorytetyzacja po audycie backlogu właściciela (Notion „ARCO — Baza pomysłów”): N1 deploy-lite HTTPS (wake lock/wibracje to artefakty HTTP, nie bugi kodu) → N2 paczka UX z notatek → decyzja wizualna (gate toru assetów) → S7 (+imię w onboardingu) → S8–S11. Czytaj ten plik przed planowaniem kolejnego sprintu.
> Uwaga: re-seed kasuje programy z `user_id=null` (CASCADE czyści `user_active_program`) — po `npm run seed` ustaw aktywny program na nowo.
> Otwarta sprawa (Twoja): po realnym użyciu guidance — czy progi/agresywność OK (kalibracja `GUIDANCE`), zanim ew. per-user.
> Ops: lokalny LAN IP zmienił się na **192.168.100.53** — `.env.local` (gitignore) zaktualizowany. Stary `.16` był down. Sprawdzaj `ipconfig getifaddr en0` po zmianie sieci.

**Strategia:** wyróżnik vs Hevy = frictionless logging + **rule-based guidance** (jawne reguły, NIE AI) + **kameralny social** (pody + reakcje/nudge, zero komentarzy) — `docs/konkurencja-hevy.md`. Kickboxing porzucony.

**Operacyjnie (ważne):** jeden `npm run build` na raz, **zatrzymaj Claude Preview przed buildem** (równoległy psuje `.next`); login do Preview: gdy formularz nie hydratuje (submit leci jako natywny GET), fallback = **cookie auth**: w `preview_eval` fetch do GoTrue (`/auth/v1/token?grant_type=password`, anon key z bundla) → `document.cookie='sb-192-auth-token=base64-'+base64url(JSON sesji)` → nawigacja (cookie ustawiaj będąc już na `http://localhost:3000`, nie na `data:`).

**⚠️ SPRZĄTANIE DANYCH TESTOWYCH — NOWA PROCEDURA (od 2026-07-02, po incydencie):** apka jest w REALNYM użyciu na telefonie — **NIGDY hurtowe `delete from sessions`**. Kasuj wyłącznie po ID sesji utworzonych w teście (`delete from sessions where id in ('...')`), a przed kasowaniem sprawdź `select id, started_at, finished_at from sessions order by started_at` czy nie ma tam realnych treningów. `recompute_personal_records()` przez `docker exec` (superuser) **nie działa** (`auth.uid()` = null — funkcja cicho nic nie robi); PR-y przelicza apka przy `finishSession`, a ręcznie tylko z tokenem usera przez API.

---

## Redesign wizualny „Arco Athletic" (zrobione)
Po researchu Mobbin + audycie: stary UI był „default shadcn". Kierunek (decyzje właściciela): **akcent volt/lime-green**, **dark logger jako focus mode**, bento + elewacja zamiast 1px ramek, liczby jako bohater. Architektura tokenów bez zmian (primitive→semantic), tylko wartości/kompozycja. Pamięć: `arco-visual-redesign`.

**Zrobione (na `main`):**
- `a6d0a8b` Foundation — tokeny volt (`--arco-volt-*`), tinted canvas, `--radius-xl`, `--shadow-sm/md`, `--volt`/`--volt-foreground`. Reguła WCAG: **volt jako tekst tylko w wersji -600** (5.05:1); jasny volt-400 wyłącznie jako fill z ciemnym tekstem. Light=volt-600, dark=bright volt-400.
- `e36c9d7` Home — bento (rounded-xl + shadow), day-pills z ringiem „dziś", bright-volt hero „Sugerowane dziś", streak-pill. Zweryfikowane Preview light+dark.
- `d3df526` Spójność hubów — Postępy/Historia/Ciało/detale: karty top-level `rounded-xl shadow-sm`, wiersze zagnieżdżone `bg-muted`, staty jako bento.

**Zrobione (cd.):**
- `95a44ed` **Dark logger (focus mode)** — ekran sesji wymuszony `.dark`, bright volt na zaliczonej serii + „Zakończ", karty rounded-xl. **Kluczowy fix tokenów:** L3-bridge shadcn re-deklarowany w `.dark` (bez tego `var()` w moście z `:root` nie re-resolvuje się w poddrzewie `.dark` → jasne tła mimo ciemnej semantyki). Zweryfikowane Preview.

**Plan `docs/plan-theme-i-naprawy.md` — A/B/C ZROBIONE:**
- `a84e37e` **A** theme toggle 3-stan (jasny/ciemny/system, default dark, `next-themes`+localStorage; usunięto `@media prefers-color-scheme`; logger zawsze ciemny). Uwaga: klasa fontu jest na `<body>` (nie `<html>`), inaczej React zdejmuje klasę motywu przy hydracji.
- `6dc6925` **B** walidacja inputów (`clampNum`+`LIMITS` w `lib/format.ts`; koniec buga 2222 kg).
- `f1b2c4e` **C** odchudzone steppery ± w wierszu serii.

**Zostaje Faza D (funkcje, osobno, po kolei):** „last set" inline per wiersz · kalendarz/streak · heatmapa-sylwetka (mamy `sets-per-muscle`).

## Kierunki produktowe — brief v0.3 (`docs/build-brief-v0.3-addendum.md`)
Analiza jasności briefu vs audyty + konkurencja. Brief v0.2 zostaje źródłem prawdy; addendum nadpisuje punktowo. Najważniejsze:
- **Descope talerzy** (`02fa08e`) zapisany; gdyby wróciła sztanga → tylko warunkowo `equipment==="barbell"`.
- **Reguła:** funkcje przez „kto/kiedy", nie tylko „co". RPE domyślnie ukryte + tooltip.
- **Reguła przekrojowa:** walidacja/limity inputów liczbowych (koniec 2222 kg).
- **Repriorytet → pierwsza klasa:** heatmapa-sylwetka (mamy `sets-per-muscle`), kalendarz/streak, „last set" inline per wiersz.
- Audyty `product-audit`/`ux-audit-mobbin` są częściowo nieaktualne (sporo P1–P5 już zrobione) — patrz addendum §6.

## Gdzie jesteśmy
MVP + rozszerzenia gotowe i działające lokalnie. Zweryfikowane realnym E2E (Claude Preview):
login, home, logger (✓→rest, podmiana, supersety, notatki, live pasek), historia, postępy,
ciało (ze zdjęciami), szczegóły ćwiczenia. Zero błędów runtime.

Zrobione fazy: 0 (fundament) · 1 (logger) · 2 (głębia) · 2.5 (offline) · 3 (builder/presety/ciało)
· 4 (insighty) · biblioteka programów · zdjęcia ciała · polish P1–P5 (logger/home/postępy/ćwiczenie/onboarding).
Audyty: `docs/product-audit.md`, `docs/ux-audit-mobbin.md`, `docs/usability-audit.md`.

## Pre-deploy P0/P1 — ZROBIONE (commity `8e674eb` + `7a5b767`)
Wszystkie uzgodnione punkty domknięte (ta lista była wcześniej nieaktualna):
1. ✅ **Dane testowe wyczyszczone** (16 sesji/24 PR/1 pomiar/1 zdjęcie) — świeży start.
2. ✅ **5 punktów P0/P1 z `usability-audit.md`:**
   - ✅ `maximumScale`/`userScalable` usunięte z `viewport` w `app/layout.tsx` (WCAG zoom),
   - ✅ dark mode przez `prefers-color-scheme` → `app/globals.css:107`,
   - ✅ `focus-visible` na ikonowych przyciskach — globalna reguła `button/a/[role=button]:focus-visible`
     w `app/globals.css:131-136` (pokrywa SetRow ✓/✕, builder ↑/↓, rest ±; brak klikalnych nie-buttonów),
   - ✅ confirm „Zakończyć trening?” przy niezaliczonych seriach (`Logger.handleFinish`, `Logger.tsx:271`),
   - ✅ undo-toast „Cofnij” po usunięciu serii/ćwiczenia (`Logger.tsx:250`, sonner).

## Potem: Phase 10 — deploy (wymaga kont użytkownika)
- Supabase cloud: nowy projekt → `supabase link` → `supabase db push` (migracje) → seed + bootstrap usera (service-role z env produkcyjnego).
- Vercel: import repo, env `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` (prod), `SUPABASE_SERVICE_ROLE_KEY` tylko w env serwera, `ADMIN_EMAIL/PASSWORD`.
- HTTPS na Vercel → pełne PWA (instalacja, SW offline, wibracje) — dziś po http LAN to nie działa.
- Po-deploy opcje: PL tłumaczenia instrukcji, heatmapa-sylwetka, skeletony ładowania, reorder ćwiczeń w sesji.

## Jak wznowić lokalnie (środowisko)
PATH (brew zepsuty — patrz pamięć `local-toolchain-supabase-docker`):
`export PATH="$HOME/.local/share/supabase:/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:/usr/bin:/bin:$PATH"`
1. Docker Desktop uruchomiony → `supabase start` (w `Arco app/arco`).
2. Jeśli świeża baza: `supabase db reset` → `npm run seed` → `npm run bootstrap:user`.
3. Serwer do testów: **produkcyjnie** `npm run build && npx next start -H 0.0.0.0 -p 3000`
   (dev bywa niestabilny — `config.cache=false` w dev już ustawione; jeden `next` na raz).
4. Smoke: `npm run smoke`, `npm run smoke:phase2`, `npm run smoke:offline`.
5. Telefon w tej samej sieci: `NEXT_PUBLIC_SUPABASE_URL` w `.env.local` ustawione na **LAN IP Maca**
   (sprawdź `ipconfig getifaddr en0`; było `192.168.100.16`). Wejście: `http://<LAN-IP>:3000`.
   Konto dev: `daniel.muszynski98@gmail.com` / hasło z `.env.local` (`ADMIN_PASSWORD`).

## Narzędzia/MCP
- **Mobbin** (MCP) — wymaga autoryzacji per sesja: `mcp__mobbin__authenticate` → user otwiera link → tools wstają.
- **Claude Preview** — config w `<sesja-cwd>/.claude/launch.json` (serwer „arco”, `npm run start` w katalogu arco, port 3000).

## Build/commit
- Jeden `npm run build` na raz (podwójny psuł `.next`). Po dep-changes w dev: `rm -rf .next`.
- Po zmianach UI restart produkcyjnego serwera. Commituj po działającej zmianie.
