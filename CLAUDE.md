# Projekt: Arco — osobista apka treningowa (web, PWA)

## Stan (2026-06)
MVP + rozszerzenia gotowe i działające: Phase 0–4 + biblioteka programów, ciało, polish, **redesign „Athletic"**, **theme toggle**, Sprint 1–2 (polish loggera + ekran po treningu + cel tygodniowy). **Nie budujemy już „fazami briefu" — pracujemy SPRINTAMI/HORYZONTAMI** wg `docs/roadmap.md`.
- Aktualny stan i „co dalej": **`docs/HANDOFF.md`**
- Plan/sprinty: **`docs/roadmap.md`** (horyzonty + długa wizja) + **`docs/sprinty-szczegolowe.md`** (podział Claude/Ty + prompty assetów)

## Źródło prawdy (w tej kolejności — addendum i roadmap EWOLUUJĄ stary brief)
1. **`docs/build-brief-v0.3-addendum.md`** — NADPISUJE brief v0.2 w wymienionych punktach (descope talerzy, reguła „kto/kiedy", repriorytety, walidacja). Czytaj NAJPIERW.
2. **`docs/build-brief-apka-treningowa-v0.2.md`** — bazowa specyfikacja (model danych, programy FBW). Obowiązuje tam, gdzie addendum nie nadpisuje.
3. **`docs/roadmap.md`** — kierunek i horyzonty. `docs/seed-prompt-fbw.md` — seed.
> Nie traktuj briefu v0.2 jako jedynego, niezmiennego źródła — od niego się ewoluowało.

## Zasady pracy
- Phase 0–1 (STOP-y na review) dawno za nami. Teraz: sprinty wg roadmap. Przed większym kawałkiem — plan, potem kod.
- Flaguj decyzje opiniotwórcze jawnie.
- **Proaktywnie sygnalizuj ryzyka architektoniczne/długoterminowe** (zależność znikająca z npm → vendor do repo; hotlink/link-rot → backup + plan self-hostu; utrata danych/integralność; przenośność tokenów code↔Figma) — nie czekaj, aż ktoś zapyta. Tanie i bezpieczne (backup, vendor) zrób od razu; większe dopisz do roadmapy. Sygnał krótko + akcja.
- Po działającej zmianie: commit. Weryfikuj REALNIE (build + Claude Preview), sprzątaj dane testowe po testach.
- Ops/build (jeden build na raz, zatrzymaj Preview przed buildem, PATH do supabase/docker): patrz `docs/HANDOFF.md`.

## Sync z Notion (OBOWIĄZKOWY rytuał końca sprintu/paczki)
Jedna tablica prawdy dla Daniela: Notion **„ARCO — Baza pomysłów"** (data source `e037aac8-6857-46b7-80ef-95d011d1816e`, hub „🥇 ARCO — Hub"). Właściwości: Pomysł (title), Priorytet, Kto wykonuje, Etap, Faza, Kategoria, Notatki.

**Po każdej ukończonej paczce roboty (przed zamknięciem sesji):**
1. Znajdź wpisy w bazie odpowiadające zrobionym zadaniom (`notion-search` po tytule / query po data source).
2. Ustaw **Etap** wg reguły:
   - `Do testu [Ty]` — zmiana w UI/flow wymagająca weryfikacji Daniela na telefonie (default dla features/bugfixów),
   - `Done` — audyt/QA/research bez zmian kodu albo rzecz w pełni zweryfikowana,
   - `In Progress` — rozgrzebane między sesjami,
   - `Refinement` — odkryłeś decyzję, którą musi podjąć Daniel (dopisz w Notatkach CO trzeba rozstrzygnąć).
3. W **Notatkach** dopisz: hash commita + jednozdaniowo co zrobione + co przetestować.
4. **Nowe zadania odkryte w trakcie** → nowy wpis (Etap `Backlog`/`Inbox`, wypełnij wszystkie selecty). Nie trzymaj zadań tylko w plikach — Daniel planuje z tablicy.
5. Statusy w `docs/plan-sprintow-2026-07.md` i w Notion mają się ZGADZAĆ (plik = szczegóły wykonawcze, Notion = widok właściciela).

**Fallback bez Notion MCP w sesji:** dopisz operacje do `docs/notion-sync-queue.md` (format w pliku). Każda sesja, która MA dostęp do Notion, zaczyna od flushu tej kolejki i czyszczenia pliku.

## Zakres — zmienione vs brief v0.2 (żeby się nie odbijać od starego)
- **Poza MVP, ale na DŁUGIEJ wizji (Horyzont 4–5 roadmap — NIE teraz):** social („Strava dla siłowni"), apki natywne iOS/Android, monetyzacja. To **nie jest „zakazane"** — to OSTATNI etap, dopiero gdy rdzeń hula + po testach userów. Nie zaczynaj przedwcześnie.
- **Trwale poza zakresem:** AI auto-programming (manualny silnik podmiany to świadomy wyróżnik), makro/dieta, wearables/HRV.
- **Descoped (usunięte):** kalkulator talerzy + ustawienia gryf/talerze — apka jest dumbbell-first.

## Kierunek wizualny — „Arco Warm" (DECYZJA właściciela 2026-07-04; zastępuje „Athletic")
> ✅ Rozstrzygnięta decyzja wizualna. Rebranding z volt/dark na **terracotta + krem + ciepła czerń**. Kierunek lifestyle'owy, inkluzywny (nie tylko pod mężczyzn). Wdrożenie = Sprint N3 w `docs/plan-sprintow-2026-07.md`. Stary „Athletic" (volt) opisany w historii gita — nie wracać bez decyzji właściciela.
- **Paleta brand:** terracotta `#C63F21` (akcent; na kremie ~4.6:1 → może być tekstem akcentowym) · krem `#F6F2ED` (canvas light) · ciepła czerń `#1E1C1A` (tekst primary / canvas dark) · jasna terracotta ~`#E8845C` (akcent na ciemnych tłach). Ramp primitive rust-50…900 wyprowadzić z `#C63F21`.
- **Logo i favicon: `../logo/`** (siblingi folderu `arco`): `logo.svg/png` + warianty `logo-1/2`, favicon w 4 wersjach (primary/secondary/black/white), SVG + PNG 396px. Wpiąć do `public/` + manifest PWA (maskable z marginesem) + `<link rel="icon">`. Sygnet = „o"-talerz.
- **Font: DM Sans** (next/font/google, subsets latin+latin-ext, self-host przy buildzie; zmapowany w Tailwind `fontFamily.sans` przez `--font-sans`; klasa fontu NA `<body>`).
- **Default motyw: JASNY** (zmiana decyzji — koniec dark-as-default). Toggle jasny/ciemny/system zostaje (`next-themes`). ⚠️ Reguła „logger zawsze ciemny" jest ZAWIESZONA — zbudować logger w wersji jasnej, właściciel zdecyduje po teście na telefonie, czy forced-dark wraca jako opcja.
- **Elevation (wzorzec z inspo BytePal):** canvas = delikatnie przyciemniony krem (`#F6F2ED` → ton niżej), na nim jaśniejsze/pełne białe „tile" (radius-xl, miękki cień, bez 1px ramek). Hierarchia przez jasność powierzchni, nie przez bordery.
- **Day-pills na home:** minimalistyczny pasek dni tygodnia u góry (jak inspo): odhaczone dni + „dziś" jako wypełniona pigułka (ciepła czerń/terracotta), przyszłe wygaszone. Zastępuje/upraszcza obecne day-pills.
- Liczba-bohater i celebracja w „momentach" — bez zmian. Zadziora w copy — bez zmian.
- Warstwy tokenów: primitive → semantic → most shadcn (HSL; **re-deklarowany też w `.dark`**, inaczej `var()` nie re-resolvuje się w poddrzewie) → Tailwind. **Zero magic numbers** — komponenty czytają tylko semantykę. **WCAG 2.1 AA** (tekst na kremie: terracotta tylko `#C63F21` lub ciemniejsza; jaśniejsze odcienie wyłącznie jako fill).

## Design system & Figma (przyszły workstream)
- Na pewnym etapie: **eksport design systemu + komponentów do Figmy** (tokeny, kolory, typografia, komponenty UI).
- Potem przepływ **dwukierunkowy: także Figma → code**, nie tylko code-first. Projekt w Figmie staje się równoprawnym źródłem dla UI.
- Narzędzie: **Figma MCP** (dostępny). Trzymać tokeny jako jedno źródło prawdy (semantic), żeby sync code↔Figma był tani.

## Techniczne
- Migracje DB tylko przez Supabase migrations (nie ad-hoc SQL). Auth przez `@supabase/ssr` (nie `auth-helpers`). PWA: Serwist pod App Router (nie `next-pwa`).
- RLS po `user_id` na wszystkich tabelach z danymi usera. Seed (`exercises`, `programs` z `user_id = null`) read-only dla zalogowanych.
- Preferencje urządzenia (motyw, auto-przerwa, wake lock) → `localStorage` (`lib/prefs.ts`). Ustawienia konta (jednostki, rest, cel, sprzęt) → `user_settings`.

## Stack i konfiguracja (zatwierdzone)
- Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind v3 + shadcn/ui. Hosting: Vercel (docelowo).
- Supabase: lokalny stack (CLI + Docker), migracje + seed lokalnie → `db push` na remote.
- Auth: jedno konto, email + hasło, bez publicznego signup; bootstrap skryptem (service-role) z `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- Seed ćwiczeń: `free-exercise-db` (vendor JSON: `scripts/data/exercises.json`). Obrazki dziś **hotlinkowane** (`IMG_PREFIX` w `scripts/seed.ts` → `raw.githubusercontent.com/yuhonas/free-exercise-db`) — **ryzyko link-rotu**.
  - **Backup lokalny** (poza repo, ~200 MB, 1746 jpg): `../free-exercise-db` (sibling folderu `arco`). Licencja Unlicense = public domain.
  - **Plan uniezależnienia (Horyzont 3 / launch):** fork na własny GH **albo** hostowanie obrazków (Supabase Storage/CDN) + przepięcie `IMG_PREFIX` na własną kopię. Tu też wejdą wersje po AI-„podratowaniu".
- `user_settings` defaults: `unit_system = kg`, `default_rest_seconds = 120`, `weekly_goal = 2`.
- **Vendored deps (żeby nie zniknęły z npm):** `react-body-highlighter` (heatmapa mięśni, MIT) jest skopiowany do `vendor/react-body-highlighter/` i podpięty przez `file:` w `package.json`. `npm install` bierze z naszej kopii, nie z rejestru.

## Definicja done
Zmiana jest skończona, gdy: `npm run build` przechodzi · zweryfikowana w Claude Preview · dane testowe sprzątnięte · brak hardkodów stylów · WCAG AA. (Acceptance Phase 0–4 z briefu: spełnione.)
