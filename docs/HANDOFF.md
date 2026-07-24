# Arco — bieżący handoff

**Aktualizacja:** 2026-07-24
**Gałąź docelowa:** `main`
**Stan Git:** dokładny SHA i różnicę względem origin sprawdzaj w Git; handoff nie utrwala dynamicznych hashy
**Produkcja:** https://arco-olive.vercel.app
**Najbliższy etap:** Q1 → CORE-0 → R4A → PLAN-Q → R2.2 → R4B–R4D → CORE-1 → R4E → R3b

Ten plik opisuje wyłącznie stan na dziś. Historia jest w Git, kolejność w
`plan-sprintow-2026-07.md`, a pełna kolejka w `backlog-produktu.md`.

## 1. Stan produktu

Arco jest działającą PWA na kontach testowych. Obsługuje:

- onboarding ze stanem ukończenia zapisanym na koncie;
- aktywację i zmianę programu, bibliotekę, filtry i własne programy;
- logger z timerem, seriami, rozgrzewką, podmianą, ćwiczeniami własnymi, offline i szkicem;
- jedną niezakończoną sesję, minimalizację, mini-bar, wznowienie, usunięcie i finish;
- świadomy start „Własnego treningu” i blokadę pustej sesji w UI oraz na serwerze;
- Historię, edycję zakończonego treningu i trening po fakcie z prawdziwą datą/czasem;
- rekordy, guidance, Postępy/Ciało oraz pomiary z wagą, notatką i maks. dwoma zdjęciami;
- polskie nazwy i aliasy wyszukiwania;
- Ekipę v0: kod 8 znaków, jawna zgoda, członkowie, wiele ekip w UI, check-iny, reakcje i nudge.

Docelowa IA działa: **Trening · Postępy · Historia · Ekipa**, lokalnie **Dziś | Plany** oraz
**Trening | Ciało**, profil przez awatar. Floating nav ma równy margines 12 px i respektuje
safe area.

## 2. Co jest wdrożone

Na `main` i w migracjach są:

- R0/R0.5, R1a/R1b, R2/R2.1 i R3a;
- F0.1–F0.7, w tym `onboarding_completed_at`, badge `0/N` i wpływ sprzętu na kolejność planów;
- F0.2/F0.3: poprzedni wynik tylko dla tego samego ćwiczenia, zakresy serii, potwierdzenie
  anomalii i e1RM tylko dla 1–10 powtórzeń;
- L9/L10: cel i passa Ekipy liczone z sesji w tygodniu `Europe/Warsaw`;
- R5a core: 213 nazw PL, 94 aliasy, normalizacja diakrytyk i ranking;
- backup bazy/Storage i zweryfikowany restore;
- self-hosted obrazy ćwiczeń w Supabase Storage/CDN;
- CI: lint, unit, walidatory, build, overflow oraz smoke bazy/offline/Ekipy.

Ostatni fix `61717e6` przywraca sticky nagłówek loggera przy globalnym safe area. Automatyczna
regresja overflow jest zielona; pozostaje krótki test iPhone PWA w Q1.

**Design system (2026-07-23, DS-UI-v1.4, working tree, niezacommitowane):** wdrożone Fazy 1–2
migracji „Arco UI v1.4" na warstwie tokenów — skala Violet + `support-*` (kolor uzupełniający:
prowadzenie/plany/dane/wykresy), `chart-*`, elevation E1–E3, role `border-*`, chłodniejsze neutrale
(canvas `#F7F7F5` / dark `#18171A`), focus ring → violet-400, `volt` usunięty (kolaps do `primary`).
Kanon: `paleta-arco-warm.md` §„Adopcja Arco UI v1.4". Build/lint/unit zielone, weryfikacja wizualna
(light+dark) OK. **Faza 3 — pierwszy slice wdrożony:** violet na `GuidanceChip`/`Sparkline`/
`MuscleHeatmap`/`ProgramReviewInsight` + `Button variant="support"`, inputy na `border-control`,
polished edge na karcie home. **Otwarte:** reszta mapowania violet per ekran; wizualna weryfikacja
violet-surfaces wymaga konta z danymi (konto testowe puste). **Env:** `node_modules` ma duplikaty
„ 2" (iCloud Desktop) — build tsc wywalał się na `@types/estree 2`, usunięte ad hoc; rozważyć
`npm ci` + wyłączenie sync. Szczegóły w dzienniku koordynacji.

**Ikony 3D (2026-07-23, PR [#13](https://github.com/danielm1212/arco/pull/13) otwarty, gałąź
`agent/icon-swap-arco-performance-objects`):** podmienione z generycznego pakietu 3dicons.co
na własny zestaw Arco Performance Objects v1.1 (`strategy/arco-3d-icon-system.md`
w `Arco-Brand-System-v1.4`) — zamyka ryzyko licencyjne `VISUAL-04`. `MomentIcon3D` uproszczony do
jednego pliku na ikonę (v1.1 nie rozróżnia light/dark). Osierocony `assets-source/icons-3d/`
(~20 MB starego pipeline'u) usunięty. Lint/build zielone, 6 z 8 ekranów
zweryfikowanych wizualnie light+dark. **[Ty]:** review + merge PR #13; doraz sprawdzić
`WelcomeOverlay` krok 8 („Plan gotowy") i baner potwierdzenia w `history/[id]` — nieodtworzone
w tej sesji. Szczegóły w dzienniku
koordynacji (2026-07-23).

## 3. Stan planu

### Zamknięte

- R0–R3a i integralność F0;
- funkcjonalne zachowanie bottom sheetów: overlay, scroll lock, scroll wnętrza i swipe;
- iPhone checkpoint z 2026-07-18 dla wcześniejszej macierzy 8/8;
- polskie wyszukiwanie i podstawowy kontrakt treści programów;
- SEC-02: `sharp` 0.35.3 z libvips 8.18.3 jest na produkcji po zielonym CI i deployu PR #4.
- TRAIN-01: migracja P11/P12/P14 została zastosowana na produkcji 2026-07-22; P14 ma
  poprawioną receptę v3, a brakujące P11/P12 nie zostały utworzone „przy okazji”.
- release CONTENT-01A/CONTENT-02: blokada starego Barbell Hip Thrust, zamiana trzech slotów,
  instrukcje wariantów i review Chin-Up są aktywne na produkcji.

### Częściowe

- **CONTENT-01:** część A jest na produkcji: Barbell Hip Thrust jest wstrzymany, systemowe sloty
  używają sprawdzonego Barbell Glute Bridge, a wszystkie trzy warianty mają poprawione
  instrukcje. CONTENT-01B obejmuje finalną parę Barbell i pary Dumbbell/Single-Leg.
- **CONTENT-02:** zmiana jest na produkcji: Chin-Up zachowuje pięć slotów, publikuje poprawioną
  instrukcję, a niejednoznaczne zdjęcia zastępuje placeholder do czasu zatwierdzenia nowej
  pary.
- **R3b:** istnieje dużo v0, ale hub nie ma jeszcze trwałego ostatniego wyboru, unread na tabie,
  jednego kontekstowego zdarzenia Home i finalnego dogfoodu dwóch kont.
- **R4:** rdzeń loggera, edycji i backfillu działa. Brakuje prowadzenia pierwszej sesji,
  wyróżnienia zaliczenia serii, CTA finish na dole, zapisu własnej sesji jako programu,
  pełnoekranowych mediów i części zachowania scrolla/kontekstu Historii.
- **R5b:** brakuje pełnego focus trapu/zwrotu fokusu, radiogroup oraz pełnej macierzy Android.
- **TRUST-03:** scalone do `main` i wdrożone: wspólny scroll-lock nie restartuje
  się po re-renderze, pozycja strony i fokus wracają dla X/overlay/Escape/swipe/akcji;
  automatyczna macierz 320/375/393 px jest zielona. Pozostaje checkpoint iPhone [Ty].
- **TRUST-02:** zweryfikowane lokalnie 2026-07-24 (fresh-account smoke F0.7), zero P0/P1.
  Pełny onboarding, skip, badge `0/N` i ustawienia trwałe po reload; kluczowa regresja
  (usunięcie treningu z Historii ponownie otwierało onboarding) nie odtwarza się —
  `completed` na Home liczy się wyłącznie z `onboarding_completed_at`. Pozostaje
  checkpoint [Ty] na fizycznym iPhone PWA (razem z TRUST-01/03).

## 4. Otwarte ryzyka

1. **Sekret serwerowy:** legacy `service_role` został niezamierzenie ujawniony w prywatnym
   logu narzędzia CLI podczas release'u. Nie trafił do repo ani dokumentów, ale należy pilnie
   utworzyć nowy sekret, podmienić go w Vercel/automatyzacjach, sprawdzić akcje serwerowe i
   dopiero wtedy odwołać stary klucz (`SEC-03`). **2026-07-24: [Ty] wstrzymuje SEC-03 na razie
   (czeka na zewnętrzne wsparcie), czas nieokreślony.** Świadoma decyzja: SEC-03 nie blokuje
   CORE-0/R4A (brak zależności technicznej — integralność danych jest osobną osią od rotacji
   sekretu), więc sprint jedzie dalej równolegle. Jedyne zadanie faktycznie zablokowane do
   odwołania: **TRAIN-02A4** (release 5 brakujących programów), bo migracja produkcyjna wymaga
   już obróconego klucza.
2. **Treści i programy:** ryzykowne zdjęcia Barbell Hip Thrust są punktowo wstrzymane na
   produkcji; nowe media Dumbbell/Single-Leg oraz zatwierdzona para Chin-Up nadal wymagają
   przygotowania,
   a audyt 15 planów wykazał błędy kolejności/objętości, brakujące
   regresje i nieprawdziwe metadane sprzętu. Q1 zawiera pilny patch, a PLAN-Q jest pełną
   bramką treści, danych i wersjonowanego audytu Codex przed H2. Docelowe recepty 15/15 są
   zatwierdzone w `audyt-biblioteki-programow-2026-07.md`. Produkcja ma obecnie 10/15 planów
   systemowych; P11/P12 nie istnieją, więc ich bezpieczna migracja prawidłowo wykonała no-op.
   Brakujące P01/P03/P08/P11/P12 nie są gotowe do prostego point syncu: wszystkie recepty
   są domknięte w TRAIN-02A2/A3, ale P03/P11/P12 czekają na zapis relacji TRAIN-03/05.
   TRAIN-02A1–A4
   rozdziela audyt, korekty i release bez pełnego reseedu oraz bez naruszania planów własnych,
   aktywnych sesji lub historii.
   Walidator pokazuje 17 unikalnych placeholderów mediów użytych w 54 slotach.
3. **PWA:** ostatni fix sticky i techniczna poprawka pozycji bottom sheeta (`TRUST-03`)
   wymagają potwierdzenia na iPhone PWA/Safari i przy starym cache.
4. **Fresh account:** F0.7 zweryfikowane lokalnie 2026-07-24 (skip/finish, `0/N`,
   usunięcie historii — zero P0/P1); brakuje wyłącznie regresji na fizycznym nowym
   urządzeniu (iPhone PWA, razem z TRUST-01/03).
5. **Android:** brak pełnego checkpointu systemowego Back/PWA.
6. **A11y:** funkcjonalne sheety nie mają jeszcze kompletnego focus trapu i zwrotu fokusu.
7. **Backup:** zweryfikowana kopia pozostaje na laptopie; potrzebna zaszyfrowana kopia poza nim.
8. **Publiczność:** signup, RODO, eksport/usunięcie, abuse protection i publiczna Ekipa są zamknięte.
9. **Badania:** większość wiedzy pochodzi z dogfoodu właściciela; wymagane są H2-Lab oraz
   trzytygodniowy H2-Field, zanim ruszą publiczne konta i premium.
10. **Prawo:** commity `2aa4191` i `d10e51e` dodały drafty w `docs/legal/` oraz docelową domenę;
   nie zaliczają PRIV-1 bez review prawnego, eksportu/usunięcia, audytu RLS i weryfikacji
   dostawców/regionu.
11. **Sklepy:** obecny dynamiczny Next.js nie jest gotowym bundle'em Capacitor. PWA pozostaje
    drogą do H2-F/PAY-01; decyzja Expo/React Native kontra lokalny Capacitor jest w MOBILE-0.

## 5. Dane i technologia

- Next.js 16.2, React 19.2, TypeScript, Tailwind CSS 3;
- Supabase Auth/Postgres/Storage/RLS, Serwist i Vercel;
- 907 rekordów ćwiczeń lokalnie; bieżące liczby potwierdza `npm run validate:training`;
- publiczna rejestracja wyłączona;
- migracje produkcyjne do `20260722002735_content02_chin_up_review.sql` zostały zastosowane;
  lokalna i zdalna historia migracji są zgodne.

## 6. Najbliższa praca

1. [Ty] SEC-03 wstrzymane na razie (czeka na zewnętrzne wsparcie) — **nie blokuje** punktów
   poniżej. Wykonać, gdy wsparcie się odblokuje: nowy sekret, Vercel/automatyzacje, smoke
   akcji serwerowych, a na końcu odwołanie starego.
2. [Codex] `TRAIN-02A1–A3` są gotowe technicznie: P01/P08 mają recepty v2, P11/P12 v3,
   a P03/P11/P12 łącznie 29 wersjonowanych ścieżek sprzętowych. SQL point syncu (`TRAIN-02A4`)
   powstaje dopiero po kontrakcie TRAIN-03/05 **i** po SEC-03 — oba warunki, więc realnie
   czeka też na odwołanie z punktu 1.
3. **CORE-0 w toku (Claude, 2026-07-24):** integralność danych nie zależy technicznie od
   SEC-03, więc jedzie równolegle. Start od DATA-01 (poprawna zakończona seria), potem
   DATA-02 (kanoniczne jednostki), DATA-03 (jedna definicja faktu) i SYNC-01 (outbox).
4. Checkpoint iPhone [Ty] TRUST-01/03 + TRUST-02 (fresh-account smoke zweryfikowany
   lokalnie; brakuje wyłącznie fizycznego urządzenia) oraz CONTENT-01B/CONTENT-03a.
5. Po CORE-0: R4A → SESSION-01A: integralność loggera i mała, opcjonalna rekomendacja
   rozgrzewki/zakończenia bez wpływu na ukończenie treningu.
6. PLAN-Q: jeden katalog, recepta v2, korekta 15/15 planów, prawda sprzętowa, UI i gate publikacji.
7. R2.2 → R4B–R4D → CORE-1 → R4E → R3b → R5b → R6 → H2. Domowy plan 20–30 minut
   (`PROGRAM-01A`) pozostaje osobnym eksperymentem po sygnale H2, nie dodatkowym dniem.

## 7. Reguły operacyjne

- Migracje wyłącznie przez `supabase/migrations`; każda tabela użytkownika ma RLS i test wielokontowy.
- Produkcyjne dane testowe usuwamy tylko po znanych ID.
- Jeden build Next.js naraz.
- Deploy i zamknięcie sesji zgodnie z `.claude/skills/`.
- Każda zmiana stanu aktualizuje HANDOFF, backlog/plan i `koordynacja-agentow.md`.
- Warstwa operacyjna zadań: Linear (workspace `trainarco`; od 2026-07-21 zastępuje Notion). Repo docs pozostają źródłem prawdy.
