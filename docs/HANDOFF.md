# Arco — stan projektu i handoff (do kontynuacji w nowej sesji)

> Czytaj razem z `CLAUDE.md` (źródło prawdy) i resztą `docs/`. Ten plik mówi: gdzie jesteśmy i co dalej.
> Aktualizacja: 2026-06-25.

## Redesign wizualny „Arco Athletic" (w toku)
Po researchu Mobbin + audycie: stary UI był „default shadcn". Kierunek (decyzje właściciela): **akcent volt/lime-green**, **dark logger jako focus mode**, bento + elewacja zamiast 1px ramek, liczby jako bohater. Architektura tokenów bez zmian (primitive→semantic), tylko wartości/kompozycja. Pamięć: `arco-visual-redesign`.

**Zrobione (na `main`):**
- `a6d0a8b` Foundation — tokeny volt (`--arco-volt-*`), tinted canvas, `--radius-xl`, `--shadow-sm/md`, `--volt`/`--volt-foreground`. Reguła WCAG: **volt jako tekst tylko w wersji -600** (5.05:1); jasny volt-400 wyłącznie jako fill z ciemnym tekstem. Light=volt-600, dark=bright volt-400.
- `e36c9d7` Home — bento (rounded-xl + shadow), day-pills z ringiem „dziś", bright-volt hero „Sugerowane dziś", streak-pill. Zweryfikowane Preview light+dark.
- `d3df526` Spójność hubów — Postępy/Historia/Ciało/detale: karty top-level `rounded-xl shadow-sm`, wiersze zagnieżdżone `bg-muted`, staty jako bento.

**Następne fazy (wizualne):**
1. **Dark logger (focus mode)** — największy ekran (`app/session/[id]/Logger.tsx` + `SetRow`/`RestTimer`): ciemne tło zawsze, bright volt na zaliczonej serii, duże touch-targety, „live" pasek. Tu też domknie się pre-existing problem: `Button` variant=secondary renderuje się jasno w dark. + odchudzenie gęstości karty (progressive disclosure).
2. (opc.) Onboarding/login w nowym języku.

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
