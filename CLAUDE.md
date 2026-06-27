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
- Po działającej zmianie: commit. Weryfikuj REALNIE (build + Claude Preview), sprzątaj dane testowe po testach.
- Ops/build (jeden build na raz, zatrzymaj Preview przed buildem, PATH do supabase/docker): patrz `docs/HANDOFF.md`.

## Zakres — zmienione vs brief v0.2 (żeby się nie odbijać od starego)
- **Poza MVP, ale na DŁUGIEJ wizji (Horyzont 4–5 roadmap — NIE teraz):** social („Strava dla siłowni"), apki natywne iOS/Android, monetyzacja. To **nie jest „zakazane"** — to OSTATNI etap, dopiero gdy rdzeń hula + po testach userów. Nie zaczynaj przedwcześnie.
- **Trwale poza zakresem:** AI auto-programming (manualny silnik podmiany to świadomy wyróżnik), makro/dieta, wearables/HRV.
- **Descoped (usunięte):** kalkulator talerzy + ustawienia gryf/talerze — apka jest dumbbell-first.

## Kierunek wizualny — „Arco Athletic" (OBECNY kierunek; identyfikacja może jeszcze ewoluować)
> ⚠️ To spójny, wdrożony kierunek — ale **identyfikacja wizualna nie jest ostateczna** i może się zmienić (np. metalik/„żelazny" look z Horyzontu 3, inny akcent, rebranding). Nie traktuj poniższego jak betonu; przy zmianie aktualizuj tę sekcję. Architektura tokenów (primitive→semantic) ma to umożliwiać tanim kosztem.
- Akcent: **volt / lime-green** (nie pomarańcz). Light = volt-600 (AA), dark = bright volt-400. Reguła: volt jako tekst tylko w wersji -600; jasny volt-400 wyłącznie jako fill z ciemnym tekstem.
- **Theme toggle** jasny/ciemny/system, default ciemny, przez `next-themes` (klasa `.dark` na `<html>`, zapis localStorage; **bez** `@media prefers-color-scheme`). **Logger zawsze ciemny** (focus mode).
- Tinted canvas + bento (radius-xl + miękka elewacja zamiast 1px ramek). Liczba-bohater. Celebracja w „momentach" (ekran po treningu).
- Warstwy tokenów: primitive → semantic → most shadcn (HSL; **re-deklarowany też w `.dark`**, inaczej `var()` nie re-resolvuje się w poddrzewie) → Tailwind. **Zero magic numbers** — komponenty czytają tylko semantykę. **WCAG 2.1 AA.**

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
- Seed ćwiczeń: `free-exercise-db` (vendor JSON), obrazki hotlinkowane do `raw.githubusercontent…` (premium „podratowanie" zdjęć = Horyzont 3).
- `user_settings` defaults: `unit_system = kg`, `default_rest_seconds = 120`, `weekly_goal = 2`.

## Definicja done
Zmiana jest skończona, gdy: `npm run build` przechodzi · zweryfikowana w Claude Preview · dane testowe sprzątnięte · brak hardkodów stylów · WCAG AA. (Acceptance Phase 0–4 z briefu: spełnione.)
