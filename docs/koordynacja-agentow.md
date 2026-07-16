# Koordynacja sesji agentów (Claude Code) na repo `arco`

> **Czytaj to na starcie sesji, jeśli pracujesz na tym repo równolegle z inną sesją.**
> Powód: 2026-07-14 dwie sesje pracowały jednocześnie i weszły sobie w drogę —
> duplikat wersji migracji (`20260714120000` × 2), zdublowany plik (`TeamPanel 2.tsx`),
> nadpisywany `smoke-team.ts`, skasowany handoff drugiej sesji. Ten plik ma temu zapobiegać.

## Zasady (twarde)

1. **Na starcie:** `git pull --rebase`, przeczytaj ten plik + `git log --oneline -15` + `git status`.
   Jeśli widzisz cudze niezacommitowane zmiany — NIE nadpisuj ich, dogadaj się tutaj.
2. **Zajmij pas** — dopisz wpis w sekcji „Log sesji" (data, kto/co, których plików/obszarów
   dotykasz). Zwolnij po skończeniu.
3. **Commituj małe paczki i pushuj SZYBKO** — żeby druga sesja widziała Twój stan jako
   fast-forward, nie jako konflikt. Nie trzymaj wielkiego stosu niezacommitowanego.
4. **Nie dotykaj plików, które druga sesja ma otwarte / zmienione** (widoczne w `git status`).
   Jeśli musisz — najpierw wpis tutaj.
5. **Migracje: UNIKALNY timestamp.** Przed nazwaniem sprawdź `ls supabase/migrations/` —
   duplikat wersji (ta sama data-godzina) łamie Supabase. Preferuj realny bieżący czas.
6. **Weryfikuj przed pushem:** `npm run lint` (łapie błędy w `scripts/`, których nie łapie
   `tsc`/`build`), `npm run build`, odpowiednie `npm run smoke*`. Migracje testuj na świeżej
   bazie (`supabase db reset`) — CI robi to samo.
7. **Jeden build naraz** (zasada z CLAUDE.md) — zatrzymaj drugi proces Next.js przed buildem.
8. **Prod (`git push`, `supabase db push`, upload/sync assetów) wymaga sekretów właściciela** —
   nie rób „w ciemno". Kod na `main` ≠ schemat na prod ≠ zapełniony bucket: to OSOBNE kroki.

## Stan zweryfikowany 2026-07-14 (sesja B)

- **HEAD = origin/main = `11a1811`** — cały kod + 6 migracji `20260714*` zacommitowane,
  wypchnięte I zaaplikowane na prod (`db push` — `local == remote` dla wszystkich migracji).
- **Weryfikacja:** `npm run build` ✓ (webpack), `smoke` + `smoke:phase2` + `smoke:offline`
  + `smoke:team` = 4/4 ✓ (m.in. dołączanie 8-znakowym kodem Crockford + sync check-inu
  przy korekcie daty). CI (`quality.yml`) był zielony na poprzednich commitach.
- **Kod zaproszeń Ekipy — NAPRAWIONY** (`20260714153000_short_team_invite_codes.sql`):
  8-znak Crockford Base32, krypto-losowość (uuid_send + modulo 32), serwerowa normalizacja
  w `join_pod_by_invite` (`translate(upper(regexp_replace(...)),'OIL','011')` + regex),
  zgodny z klienckim `normalizeTeamInviteCode`. Zastąpił zepsuty 32-znak lowercase z `132000`.
- **Nowe funkcje w tej fali:** galeria zdjęć ciała, logowanie treningów wstecz (`/history/add`),
  sync check-inów Ekipy przy zmianie daty sesji, priorytet treningowy, swipe-to-dismiss +
  scroll-lock bottom sheetów.
- **Zostało do wypchnięcia (ta paczka docs):** reorganizacja dokumentacji — skasowane
  skonsumowane doki planistyczne, przepisany `CLAUDE.md`/`HANDOFF.md`/`README.md`.

## Otwarte / uwagi

- **8× `public/icons-3d/icon-3d-*-light 2.png`** — untracked duplikaty konfliktu sync.
  NIE commitować; sprawdzić proces synchronizacji plików (iCloud/Dropbox), który je tworzy.
- Ekipa to wciąż **tryb dev** (bez publicznego signupu/RODO/push) — twarda bramka przed launchem.

## Log sesji (dopisuj na górze)

- **2026-07-16 · Codex (plany „Pośladki i nogi" + rekomendacje): ZAKOŃCZONE.**
  Zakres: `scripts/seed.ts`, `lib/programRecommendation.ts`, onboarding i ustawienia kierunku,
  biblioteka/program detail, typy/analityka, walidator rekomendacji, migracja
  `20260716120000_program_focus.sql` oraz `docs/trainings/*lower-body*` + indeks treningów.
  Nie dotykano zajętych przez drugą sesję: `docs/HANDOFF.md`, aktywnego backlogu, strategii,
  roadmapy, kolejki Notion ani pozostałych nowych dokumentów. Wynik: 15 programów, 308 slotów,
  integralność treningów ✓, macierz rekomendacji 60/60 ✓, lint ✓, testy 14/14 ✓, build ✓.
  **Deploy zakończony:** schemat `20260716120000` i data-migration
  `20260716141007_lower_body_programs.sql` są na prod; treść zgodna z seedem, bez pobierania
  service role. `origin/main = bf13afa`, Vercel production Ready, `arco-olive.vercel.app` HTTP 200.
  Nie uruchamiać ponownie seeda tylko dla tej paczki.
- **2026-07-16 · Codex (audyt koordynacji i dokumentacji):** zajęty wyłącznie
  `docs/koordynacja-agentow.md` oraz ewentualnie wpis podsumowujący w `docs/HANDOFF.md`.
  Nie dotykam aktualnie zmienionych przez inną sesję plików: `CLAUDE.md`, `docs/README.md`,
  `docs/notion-sync-queue.md`, `docs/roadmap.md`, `docs/strategia-marketingowa.md`,
  `docs/wizja-i-plan-produktu-v2.md` ani nowych dokumentów strategii/paywalla/fotografii.
  `git pull --rebase` wstrzymany, ponieważ working tree zawiera niezacommitowane zmiany innej sesji.
  **Wynik:** lint ✓, testy jednostkowe 14/14 ✓. Ocena: koordynacja i Sprint 17a są dobre,
  w szczególności usuwają znane pułapki onboardingowe przed H2. Uwagi do integracji przed
  commitem cudzej paczki: `docs/README.md` wskazuje pięć dokumentów, ale nadal mówi „Te cztery";
  v3 i v2 powinny precyzyjnie rozdzielić zakres nadpisania, bo Z1–Z3 w v2 pozostają wiążące.
  Nowe dokumenty v3/paywall/fotografia warto dopisać do mapy docs przy ich finalizacji.
- **2026-07-14 · sesja B (deploy/CI/zdjęcia + weryfikacja):** rename „pody"→„ekipa", flush Notion,
  wypchnięcie Ekipy v0 na prod, naprawa CI (lint `.map()`, `[auth.email]` provider e-mail),
  incydent zdjęć (prod wskazywał GitHub + pusty bucket → upload + sync na bucket). Zweryfikowała
  falę migracji/kodu sesji A (build+smoke), założyła ten plik, wypchnęła zaległe doki. Nie dotykała
  kodu Ekipy po odkryciu, że sesja A ma już fix zaproszeń.
- **2026-07-14 · sesja A (Ekipa quality + mobile UX):** fix kodów zaproszeń (Crockford),
  galeria zdjęć ciała, logowanie treningów wstecz, sync check-inów przy korekcie daty, priorytet
  treningowy, swipe/scroll-lock bottom sheetów, reorganizacja docs. Commity `a31464e`..`11a1811`.
