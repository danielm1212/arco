---
name: arco-release
description: Procedura wydania Arco na produkcję — pełny gate jakości, smoke'i przy zmianie kontraktu danych, migracje Supabase z dry-runem, deploy Vercel i weryfikacja proda w przeglądarce. Użyj przy każdym "deploy", "wydaj na prod", "push na produkcję", "release" oraz przed pushem migracji lub zmian seeda/RPC.
---

# Wydanie Arco na produkcję

Procedura obowiązuje każdą sesję (Claude, Codex, inne). Kolejność kroków jest wiążąca.
Źródła prawdy: `docs/HANDOFF.md` (stan), `docs/plan-sprintow-2026-07.md` (zakres),
`docs/koordynacja-agentow.md` (kto co robi). Przeczytaj je przed startem.

## 0. Warunki wstępne

- Sprawdź `git status`. Working tree ma zawierać wyłącznie zmiany tej sesji.
  Cudze niezacommitowane pliki = nie robisz `git pull --rebase`, nie commitujesz ich,
  odnotowujesz konflikt zakresu w `docs/koordynacja-agentow.md`.
- Zatrzymaj drugi proces Next.js. Jeden build naraz — równoległy dev server uszkadza `.next`.
- Ustal, czy zmiana dotyka **kontraktu danych**: migracje w `supabase/migrations`,
  `scripts/seed.ts`, RPC, RLS, kształt tabel lub niezmienniki (np. jedna otwarta sesja).
  Od tego zależy krok 2.

## 1. Lokalny gate jakości (zawsze)

Uruchom w tej kolejności i wymagaj zielonych wyników:

```
npm run lint
npm run test:unit
npm run validate:training
npm run validate:recommendations
npm run build
```

Oczekiwane liczby walidatora weryfikuj wyłącznie jego wyjściem (`docs/HANDOFF.md` podaje
aktualne: ćwiczenia/programy/sloty). Rozjazd liczb = stop i diagnoza, nie poprawianie doców.

## 2. Smoke'i (obowiązkowe przy zmianie kontraktu danych)

Lekcja z incydentu CI 2026-07-16: lint/testy/build **nie wykrywają** złamania kontraktu
danych. Jeśli krok 0 wykazał zmianę kontraktu — smoke'i przed pushem są obowiązkowe,
nie opcjonalne.

- Uruchamiaj na **izolowanym lokalnym Supabase** (`supabase start`), nigdy na prodzie.
- **Nie nadpisuj `.env.local`**, jeśli wskazuje prod. Konfigurację testową wstrzyknij
  osobno, wzorem CI: `supabase status -o env` z override'ami do tymczasowego pliku env.
- Kolejność jak w CI: `npm run seed` → `npm run bootstrap:user` → `npm run smoke` →
  `npm run smoke:phase2` → `npm run smoke:offline` → `npm run smoke:team`.
- Testowe sesje/rekordy blokujące niezmienniki zamykaj **punktowo po znanych ID**.
  Nigdy nie kasuj hurtowo.

## 3. Migracje na prod (jeśli są)

Kolejność wymuszona zależnością kodu od schematu: **najpierw baza, potem kod**.

1. `supabase db push --dry-run` — przeczytaj plan, żadnych niespodzianek.
2. `supabase db push`.
3. `supabase migration list` — potwierdź local == remote. Bez tego nie idziesz dalej.

Zasady twarde: migracje wyłącznie przez `supabase/migrations`; żadnego re-seeda proda —
rozjazdy danych naprawiaj punktowym syncem znanych rekordów; service role tylko w skryptach
i środowisku serwerowym, nigdy w repo ani logach.

## 4. Deploy kodu

1. `git push` na `main`.
2. GitHub Actions: oba joby workflow „Jakość" zielone.
3. Vercel: deployment dla wypchniętego SHA w stanie Ready/success.

## 5. Weryfikacja proda — tylko przeglądarką

**Nie diagnozuj proda curl-em** — Vercel Security Checkpoint zwraca 403 klientom bez JS
i daje fałszywy alarm. W realnej przeglądarce sprawdź:

- strona logowania renderuje się, konsola bez błędów,
- service worker aktywny; przeładuj stronę pod kontrolą nowego SW — bez błędów,
- jeden krytyczny przepływ dotknięty zmianą (np. start/wznowienie treningu).

## 6. Po deployu (część wydania, nie opcja)

- **Regresja urządzeniowa**: iPhone PWA i Android dla gorących ścieżek (start/wznowienie
  sesji, odzyskanie szkicu). Jeśli właściciel świadomie ją odracza — zapisz to jawnie
  w `docs/HANDOFF.md` jako pierwszy zaległy krok, z datą.
- Zaktualizuj `docs/HANDOFF.md` (sekcje „Ostatnio domknięte" i „Następny krok").
- Dopisz wpis do `docs/koordynacja-agentow.md` w formacie:
  `**data · kto (zakres): STATUS.** zakres / wynik z wynikami weryfikacji / czego nie dotknięto`.
- Jeśli zmiana dotyczy backlogu — dopisz do `docs/notion-sync-queue.md`.
  Notion synchronizuj tylko na wyraźną prośbę właściciela.
- Posprzątaj dane testowe po znanych ID i odnotuj to.

## Awaryjnie

Procedura backupu i restore: `docs/backup-i-restore.md`. Przy wątpliwościach co do danych
produkcyjnych — najpierw backup, potem zmiany. Nigdy nie usuwaj hurtowo sesji użytkownika.
