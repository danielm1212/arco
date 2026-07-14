# Handoff sesji 2026-07-14 — deploy Ekipy v0, CI i naprawa zdjęć

> Dla następnego agenta. Zwięzły zapis co się działo 2026-07-13/14: wypchnięcie dużej
> paczki na produkcję, dwa realne bugi w CI i incydent ze zdjęciami ćwiczeń. Pełny
> kontekst produktowy: `HANDOFF.md`. Reguły ops: `backup-i-restore.md`.

## Punkt wyjścia (rano 2026-07-14)

Repo `arco` (`main`, remote `git@github.com:danielm1212/arco.git`, **publiczne**) miało
**ogromny niezacommitowany stos** z równoległej sesji (~90 zmodyfikowanych + ~30 nowych
plików): Ekipa v0 (dev), 9 nowych migracji `20260713*`, CI (`.github/workflows/quality.yml`),
skrypty ops (backup, upload/sync zdjęć), ikony 3D, P-sprinty jakości treningowej.
Zadanie właściciela: „zerknij na zmiany i wypchnij na proda".

Środowisko: brak `gh` CLI; Supabase CLI tylko przez `npx`; PATH do dockera/supabase w
`HANDOFF.md`. Lokalny `.env.local` wskazuje na LAN IP `http://192.168.100.16:54321`
(ustawione do testów PWA na telefonie — **nie** `127.0.0.1`).

## Co zostało wypchnięte na `main` (ta sesja)

| Commit | Co |
|---|---|
| `0d9e410` | docs: rename „pody" → „ekipa" (sweep PL) |
| `d9350f3` | docs: flush notion-sync-queue → 7 kart w Notion |
| `b3f0f29` | **feat: Ekipa v0 (dev)** — cała paczka (kod + 9 migracji + CI + skrypty + ikony) |
| `5a72a28` | chore: usunięcie zabłąkanego `TeamPanel 2.tsx` (duplikat sync) |
| `206229b` | **fix(ci):** domknięcie `.map()` w `sync-exercise-content.ts` (parse error blokował lint) |
| `06bc38b` | chore(assets): guard uploadu zdjęć + reguła kolejności self-hostu (+ wpis HANDOFF) |
| `225877d` | **fix(ci):** `[auth.email] enable_signup = true` (logowanie e-mailem) |
| `020d2a8` | fix(assets): `sync-exercise-content` odporny na brakujące id + korekta docs |

Przed weryfikacją każdego pushu: `tsc --noEmit` czyste, `npm run build` (webpack) czyste.

## Operacje na produkcji (poza gitem)

Prod Supabase: projekt `ktooxfgnwtwpbhnyjljf` (region eu-central-1), linked przez `supabase link`.

1. **`supabase db push --linked`** — 9 migracji `20260713*` zaaplikowanych (Ekipa v0:
   `pods`/`pod_members`/`activity_events`/`reactions`/`nudges`/`team_profiles`/`inbox_items`
   + RLS security-definer + polski copy + metadane rekomendacji + CDN bucket). Uwaga:
   `db push` rzuca nieblokujący warning pgdelta o certyfikacie — migracje i tak przechodzą.
2. **`upload-exercise-images.ts`** na prod (`CONFIRM_REMOTE_UPLOAD=exercise-images`) —
   wgrał **1746** plików do bucketa `exercise-images` ze źródła `../free-exercise-db/exercises`.
3. **`sync-exercise-content.ts`** na prod (`CONFIRM_REMOTE_SYNC=exercise-content`) —
   przepiął `exercises.images` z GitHuba na prod bucket: **905 zaktualizowanych, 2 pominięte**
   (prod ma 905 ćwiczeń, `exercises.json` 907 — 2 nowe jeszcze nie na prod).

Skrypty prodowe uruchamia właściciel (prodowy `service_role` — sekret, którego agent NIE ma
i nie dotyka). Wzorzec komendy: inline env przed `npm run …` (dotenv nie nadpisuje zmiennych
z powłoki, więc prod URL+klucz wygrywają nad `.env.local`; klucz nie zostaje w pliku).

## Bug 1 — CI job „Kod i treść" (lint)

`scripts/sync-exercise-content.ts` miał **błąd składni**: wywołanie `.map()` budujące `images`
nie miało domykającego `)` przed spreadem instrukcji. `eslint .` łapał parse error → job
padał. `tsc`/`build` NIE łapały (folder `scripts/` poza type-checkiem projektu). Fix: `206229b`.

## Bug 2 — CI job „Baza, offline i Ekipa" (smoke)

`npm run smoke` (`scripts/smoke-phase1.ts`) padał na **pierwszym kroku — logowaniu**:
`✗ login: Email logins are disabled`. Przyczyna: `supabase/config.toml` →
`[auth.email] enable_signup = false` **wyłącza cały provider e-mail** (nie tylko signup),
więc GoTrue odbija `signInWithPassword`. Publiczny signup i tak blokuje globalny
`[auth] enable_signup = false`, więc providera trzeba było włączyć. Fix: `225877d`
(`[auth.email] enable_signup = true`). Zweryfikowane po restarcie lokalnego stacku: login
e-mailem działa, publiczny signup dalej odrzucany („Signups not allowed for this instance"),
pełny smoke zielony. **Diagnoza logów bez `gh`:** repo publiczne → GitHub REST API bez auth
(`/actions/runs`, `/jobs`, `/check-runs/{id}/annotations`); surowe logi kroku są 403, ale
STRUKTURA kroków i który padł — czytelne. Ostateczną linię `✗` dał screenshot właściciela.

**Stan CI: oba joby ZIELONE** (potwierdzone dla runu commitu `225877d`).

## Incydent — zdjęcia ćwiczeń martwe na produkcji

Objaw: zdjęcia się nie ładują. Mylący trop na starcie: prod bucket `exercise-images` zwracał
`HTTP 400` (pusty). Ale **prawdziwa przyczyna** (potwierdzona URL-em z Network taba usera):
prod `exercises.images` **wciąż wskazywały na GitHub** `raw.githubusercontent.com/...`, który
wywala się w przeglądarce (`net::ERR…` — hotlink/ORB/sieć), mimo że przez `curl` z serwera
daje 200. Prod **nigdy nie został zmigrowany na bucket** — ani upload, ani przepięcie URL-i.

Zmiana logiki seeda (`IMG_PREFIX` → bucket) w kodzie ≠ przepięcie URL-i na produkcji. To
osobny krok. Naprawa dwuetapowa: (1) upload plików do bucketa, (2) `sync-exercise-content.ts`
przepiął URL-e. Po tym: zdjęcia z `ktooxfgnwtwpbhnyjljf.supabase.co/storage/...` = 200,
prod niezależny od GitHuba (spełniony plan self-hostu z `CLAUDE.md`). Reguła utrwalona w
`backup-i-restore.md`: **pliki najpierw → URL-e potem**.

## Guardy dodane

- `upload-exercise-images.ts`: po uploadzie weryfikuje próbkę plików przez publiczny URL
  (HTTP 200) i wypisuje docelowy host na starcie — pusty/zły bucket wychodzi od razu.
- `sync-exercise-content.ts`: brakujące id na produkcji = pomiń (nie przerywaj) — ochrona
  przed częściową aktualizacją przy dryfcie zestawu ćwiczeń.
- `backup-i-restore.md`: sekcja o kolejności wdrożenia self-hostu assetów.

## Otwarte / do zrobienia

1. **8 plików `public/icons-3d/icon-3d-*-light 2.png`** — untracked duplikaty konfliktów sync
   (ten sam wzorzec co usunięty `TeamPanel 2.tsx`). Do sprzątnięcia; NIE commitować. Sprawdzić
   też, czy proces sync plików (iCloud/Dropbox?) nie dokłada kolejnych ` 2.*`.
2. **Re-seed prod** gdy właściciel zechce dowieźć 2 nowe ćwiczenia (907 vs 905) i zmiany
   programów z P-sprintów (P1–P3 były „Remote nietknięty", tylko lokalnie). Seed to „safe sync"
   (upsert, zachowuje id/aktywny program). Uwaga: przy re-seedzie prod z aktualnym kodem
   `IMG_PREFIX` domyślnie ustawi URL-e na bucket — zsync zdjęć wtedy zbędny.
3. **Ekipa v0 to tryb DEV** — brak publicznego signupu, RODO, push/e-mail/digestu. Twarda
   bramka przed publicznym użyciem. Szczegóły: `ekipa-blueprint-wdrozeniowy.md`.
4. Fonty w Figmie: kolory primitive/semantic zaktualizowane; **Gambarino niedostępny w Figmie**
   (self-hosted, nie systemowy) — styl display czeka na ręczną instalację fonta.

## Gotchas do zapamiętania

- **`.env.local` lokalnie = LAN IP** `192.168.100.16:54321`, nie `127.0.0.1`. Lokalne
  `exercises.images` wskazują na ten host (testy na telefonie). Nie mylić z prod.
- **`[auth.email] enable_signup`** w `config.toml` to przełącznik PROVIDERA e-mail, nie tylko
  signupu — `false` zabija logowanie. Publiczną rejestrację blokuje `[auth] enable_signup`.
- **`scripts/` poza `tsc`/`build`** — błędy składni w skryptach łapie tylko `eslint .` (=CI lint),
  nie lokalny build. Odpalaj `npm run lint` przed pushem, jeśli ruszasz `scripts/`.
- **Restart lokalnego Supabase** (`supabase stop && start`) NIE kasuje danych (wolumeny), ale
  wczytuje aktualny `config.toml`. Długo działający stack może chodzić na starym configu.
- **GitHub raw działa przez curl, pada w przeglądarce** — nie ufaj `curl 200` jako dowodowi,
  że obrazek wstanie w UI; sprawdzaj Network tab / realny render.
