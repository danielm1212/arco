# Projekt: Arco — osobista apka treningowa (web, PWA)

## Stan (2026-06)
MVP + rozszerzenia gotowe i działające: Phase 0–4 + biblioteka programów, ciało, polish, **redesign „Athletic"**, **theme toggle**, Sprint 1–2 (polish loggera + ekran po treningu + cel tygodniowy). **Nie budujemy już „fazami briefu" — pracujemy SPRINTAMI/HORYZONTAMI** wg `docs/roadmap.md`.
- Aktualny stan i „co dalej": **`docs/HANDOFF.md`**
- Plan/sprinty: **`docs/roadmap.md`** (horyzonty + długa wizja) + **`docs/sprinty-szczegolowe.md`** (podział Claude/Ty + prompty assetów)

## Źródło prawdy (w tej kolejności — addendum i roadmap EWOLUUJĄ stary brief)
1. **`docs/wizja-i-plan-produktu-v2.md`** (2026-07-08) — KANON produktowo-biznesowy: wizja, model freemium (Z1–Z3, limity+wartość, 14,99/99 zł, reverse trial 21 dni), **pody = silnik wzrostu (fast-follow po launchu)**, **warstwa trenerska ODŁOŻONA**, sekwencja Kroków 0–5, bramki B1–B4, art direction retro-analog Warm (§1.2). Nadpisuje `monetyzacja.md` (model/sekwencja/R3) i tabelę moatów z `konkurencja-hevy.md`.
2. **`docs/build-brief-v0.3-addendum.md`** — NADPISUJE brief v0.2 w wymienionych punktach (descope talerzy, reguła „kto/kiedy", repriorytety, walidacja).
3. **`docs/build-brief-apka-treningowa-v0.2.md`** — bazowa specyfikacja (model danych, programy FBW). Obowiązuje tam, gdzie addendum nie nadpisuje.
4. **`docs/roadmap.md`** — kierunek i horyzonty (zrewidowane 2026-07-08 pod wizję v2). `docs/seed-prompt-fbw.md` — seed.
> Nie traktuj briefu v0.2 jako jedynego, niezmiennego źródła — od niego się ewoluowało.
> **Mapa całej dokumentacji (kanon/plany/audyty/marketing/archiwum): `docs/README.md`** — zacznij tam, gdy szukasz właściwego pliku.

## Zasady pracy
- Phase 0–1 (STOP-y na review) dawno za nami. Teraz: sprinty wg roadmap. Przed większym kawałkiem — plan, potem kod.
- Flaguj decyzje opiniotwórcze jawnie.
- **Proaktywnie sygnalizuj ryzyka architektoniczne/długoterminowe** (zależność znikająca z npm → vendor do repo; hotlink/link-rot → backup + plan self-hostu; utrata danych/integralność; przenośność tokenów code↔Figma) — nie czekaj, aż ktoś zapyta. Tanie i bezpieczne (backup, vendor) zrób od razu; większe dopisz do roadmapy. Sygnał krótko + akcja.
- Po działającej zmianie: commit. Weryfikuj REALNIE (build + Claude Preview), sprzątaj dane testowe po testach.
- Ops/build (jeden build na raz, zatrzymaj Preview przed buildem, PATH do supabase/docker): patrz `docs/HANDOFF.md`.

## Sync z Notion (NA ŻĄDANIE — zmiana 2026-07-05, było „obowiązkowo co paczkę")
Jedna tablica prawdy dla Daniela: Notion **„ARCO — Baza pomysłów"** (data source `e037aac8-6857-46b7-80ef-95d011d1816e`, hub „🥇 ARCO — Hub"). Właściwości: Pomysł (title), Priorytet, Kto wykonuje, Etap, Faza, Kategoria, Notatki.

**Dlaczego zmiana:** wyszukiwanie/aktualizacja Notion po każdej paczce kosztowało realnie dużo tokenów (pełny fetch schematu + query całej tabeli za każdym razem). Nieproporcjonalne do wartości przy drobnych paczkach.

**Domyślnie (zawsze, tanie — bez API):**
1. Aktualizuj **lokalnie**: `docs/HANDOFF.md`, `docs/plan-sprintow-2026-07.md`.
2. Dopisz operację do `docs/notion-sync-queue.md` (format w pliku) — to jest kolejka „do wysłania", nie tylko fallback bez MCP.

**Do Notion wypychaj TYLKO gdy Daniel o to poprosi** („zsynchronizuj Notion" / „zaktualizuj Notion" / podobne). Wtedy: flush całej kolejki z `docs/notion-sync-queue.md` (wszystkie zaległe wpisy jedną turą wywołań), ustaw Etapy wg reguły (`Do testu [Ty]` / `Done` / `In Progress` / `Refinement` — jak dotychczas), wyczyść kolejkę.

## Zakres — zmienione vs brief v0.2 (żeby się nie odbijać od starego; rewizja 2026-07-08 wg wizji v2)
- **Sekwencja po H1–H2:** bramka kont+RODO (Krok 2, rozszerzona o zgodę podową/wiek 16+/e-mail) → **launch z pełnym freemium od dnia zero** (Krok 3) → **pody jako fast-follow 4–8 tyg. po launchu** (Krok 4, silnik wzrostu — już NIE Horyzont 5). Reszta socialu (stories, UGC, tablica) dalej H5.
- **Odłożone (nie skreślone):** warstwa trenerska (warunki re-otwarcia: wizja v2 §9; architektonicznie nie zamykać drogi) · natyw iOS/Android (jedyny wyjątek re-oceny: TWA, gdy iOS dusi pętlę podów).
- **Trwale poza zakresem:** AI auto-programming (manualny silnik podmiany to świadomy wyróżnik), makro/dieta, wearables/HRV, publiczny feed, komentarze, DM, marketplace programów.
- **Descoped (usunięte):** kalkulator talerzy + ustawienia gryf/talerze — apka jest dumbbell-first.
- **Zasady niepodważalne modelu (Z1–Z3, wizja v2 §2):** rdzeń pętli logowania zawsze darmowy · pody/zaproszenia/nudge zawsze darmowe · limitujemy dostęp, nie dane (nic nie kasujemy; eksport RODO zawsze darmowy). Każda decyzja produktowa/kodowa musi je respektować.

## Kierunek wizualny — „Arco Warm" (DECYZJA właściciela 2026-07-04; zastępuje „Athletic")
> **Rozszerzenie 2026-07-08 (wizja v2 §1.2): retro-analog Warm, architektura dwuwarstwowa.** Warstwa komunikacji (landing/social/momenty) = retro: ziarno, fotografia analogowa, display-typografia. Warstwa narzędzia (UI apki) = czysty minimal — ziarniste zdjęcia NIE wchodzą do UI jako tła. Ikony 3D: matowe/clay w terracotta/krem (metalik odrzucony), mały kurowany zestaw, tylko empty states/onboarding/celebracje. Zdjęcia ćwiczeń (AI-grading): ten sam warm/analog look, priorytet top ~200.
> ✅ Rozstrzygnięta decyzja wizualna. Rebranding z volt/dark na **terracotta + krem + ciepła czerń**. Kierunek lifestyle'owy, inkluzywny (nie tylko pod mężczyzn). Wdrożenie = Sprint N3 w `docs/plan-sprintow-2026-07.md`. Stary „Athletic" (volt) opisany w historii gita — nie wracać bez decyzji właściciela.
- **Paleta:** pełne rampy + mapowanie semantic w **`docs/paleta-arco-warm.md`** (źródło prawdy). Skrót: canvas aplikacji = neutralny **grey `#F7F7F7`** + białe tile; terracotta `#C63F21` (akcent, AA jako tekst na jasnych); krem `#F6F2ED` = **powierzchnia brandowa TYLKO w warstwie momentów** (pełnoekranowa celebracja/onboarding/landing — **od 2026-07-11 NIE w codziennym UI**: hero na home jest biały, hierarchia skalą typografii + jedno rust-CTA; szczegóły w `paleta-arco-warm.md`), NIE canvas; ciepła czerń `#1E1C1A` (tekst primary / canvas dark); `#DC6B45` akcent w dark.
- **Logo i favicon: `../logo/`** (siblingi folderu `arco`): `logo.svg/png` + warianty `logo-1/2`, favicon w 4 wersjach (primary/secondary/black/white), SVG + PNG 396px. Wpiąć do `public/` + manifest PWA (maskable z marginesem) + `<link rel="icon">`. Sygnet = „o"-talerz.
- **Font: DM Sans** (next/font/google, subsets latin+latin-ext, self-host przy buildzie; zmapowany w Tailwind `fontFamily.sans` przez `--font-sans`; klasa fontu NA `<body>`).
- **Font display: Gambarino** (decyzja 2026-07-11, `docs/roadmap.md`) — WYŁĄCZNIE momenty (celebracja/PR/recap/trial/hero/landing), nigdy UI narzędzia. Self-hostowany z `vendor/gambarino/` (`next/font/local`, licencja ITF FFL przez Fontshare — zweryfikowana, bez zależności od Adobe CC), token `fontFamily.display` przez `--font-display`. Jeden weight (Regular) — nie dokładać `font-bold` (faux-bold).
- **Default motyw: JASNY** (zmiana decyzji — koniec dark-as-default). Toggle jasny/ciemny/system zostaje (`next-themes`). ⚠️ Reguła „logger zawsze ciemny" jest ZAWIESZONA — zbudować logger w wersji jasnej, właściciel zdecyduje po teście na telefonie, czy forced-dark wraca jako opcja.
- **Elevation (wzorzec z inspo BytePal):** canvas = neutralny grey `#F7F7F7`, na nim białe „tile" (radius-xl, miękki cień, bez 1px ramek). Hierarchia przez jasność powierzchni, nie przez bordery. Dark lustrzanie: ink-800 → ink-700 → ink-600.
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
- **Wydajność: `docs/optymalizacja.md` = budżety i zasady twarde** (INP tapu w loggerze <100 ms; nowa paczka = ocena wagi; wąskie selecty, zero N+1, paginacja od 1. dnia na rosnących listach; sprzęt odniesienia: średni Android). Checklist §4 przy zmianach na gorących trasach.
- **Bezpieczeństwo: `docs/bezpieczenstwo.md` = zasady twarde** (RLS w tej samej migracji co tabela + test wielokontowy; service-role tylko w scripts/; pełny guard w każdej akcji; zero hurtowych DELETE; nowa powierzchnia = przegląd). Checklisty per bramka tamże.
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
Zmiana jest skończona, gdy: `npm run build` przechodzi · zweryfikowana w Claude Preview · dane testowe sprzątnięte · brak hardkodów stylów · WCAG AA · **przy zmianach UI: checklist z `docs/wytyczne-designu.md` §3** (HIG adaptowane pod PWA — decyzja 2026-07-08; hierarchia konfliktów: nasz system → wytyczne → odruchy platformy). (Acceptance Phase 0–4 z briefu: spełnione.)
