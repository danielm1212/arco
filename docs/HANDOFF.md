# Arco — stan projektu i handoff (do kontynuacji w nowej sesji)

> Czytaj razem z `CLAUDE.md` (źródło prawdy) i resztą `docs/`. Ten plik mówi: gdzie jesteśmy i co dalej.
> Aktualizacja: 2026-06-24.

## Gdzie jesteśmy
MVP + rozszerzenia gotowe i działające lokalnie. Zweryfikowane realnym E2E (Claude Preview):
login, home, logger (✓→rest, podmiana, supersety, notatki, live pasek), historia, postępy,
ciało (ze zdjęciami), szczegóły ćwiczenia. Zero błędów runtime.

Zrobione fazy: 0 (fundament) · 1 (logger) · 2 (głębia) · 2.5 (offline) · 3 (builder/presety/ciało)
· 4 (insighty) · biblioteka programów · zdjęcia ciała · polish P1–P5 (logger/home/postępy/ćwiczenie/onboarding).
Audyty: `docs/product-audit.md`, `docs/ux-audit-mobbin.md`, `docs/usability-audit.md`.

## DO ZROBIENIA przed pierwszym deployem (uzgodnione)
1. **Wyczyścić dane testowe** — w bazie jest dużo sesji z testów/smoke (Postępy pokazują „16 sesji/7 dni”).
   Świeży start: usuń sesje usera (np. `delete from sessions where user_id = <uid>`), potem `recompute_personal_records`.
2. **5 punktów P0/P1 z `usability-audit.md`:**
   - usuń `maximumScale`/`userScalable` z `viewport` w `app/layout.tsx` (WCAG zoom),
   - dark mode: wepnij `prefers-color-scheme` → klasa `.dark` (lub usuń warstwę dark z `globals.css`),
   - `focus-visible` na ikonowych przyciskach (`SetRow` ✓/✕, builder ↑/↓, rest ±, typ serii),
   - confirm „Zakończyć trening?” przy niezaliczonych seriach (`Logger.handleFinish`),
   - undo-toast po usunięciu serii/ćwiczenia (`Logger.handleDeleteSet/Exercise` + sonner).

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
