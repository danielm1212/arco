# Arco — bieżący handoff

**Aktualizacja:** 2026-07-21
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

## 3. Stan planu

### Zamknięte

- R0–R3a i integralność F0;
- funkcjonalne zachowanie bottom sheetów: overlay, scroll lock, scroll wnętrza i swipe;
- iPhone checkpoint z 2026-07-18 dla wcześniejszej macierzy 8/8;
- polskie wyszukiwanie i podstawowy kontrakt treści programów.

### Częściowe

- **TRAIN-01:** P11/P12/P14 są poprawione w seedzie i chronione migracją z blokadą otwartych
  sesji oraz testami kolejności/objętości; zmiana jest lokalna na `agent/q1-train-01`, bez PR
  i bez wdrożenia produkcyjnego.
- **R3b:** istnieje dużo v0, ale hub nie ma jeszcze trwałego ostatniego wyboru, unread na tabie,
  jednego kontekstowego zdarzenia Home i finalnego dogfoodu dwóch kont.
- **R4:** rdzeń loggera, edycji i backfillu działa. Brakuje prowadzenia pierwszej sesji,
  wyróżnienia zaliczenia serii, CTA finish na dole, zapisu własnej sesji jako programu,
  pełnoekranowych mediów i części zachowania scrolla/kontekstu Historii.
- **R5b:** brakuje pełnego focus trapu/zwrotu fokusu, radiogroup oraz pełnej macierzy Android.

## 4. Otwarte ryzyka

1. **Treści i programy:** zdjęcia Barbell Hip Thrust budzą zastrzeżenia techniczne, Chin-Up
   wymaga review wariantu, a audyt 15 planów wykazał błędy kolejności/objętości, brakujące
   regresje i nieprawdziwe metadane sprzętu. Q1 zawiera pilny patch, a PLAN-Q jest pełną
   bramką treści, danych i wersjonowanego audytu Codex przed H2. Docelowe recepty 15/15 są
   zatwierdzone w `audyt-biblioteki-programow-2026-07.md`; P11/P12/P14 są gotowe lokalnie,
   a pozostałe korekty i wdrożenie produkcyjne nadal czekają.
   Walidator pokazuje 16 unikalnych placeholderów mediów użytych w 49 slotach.
2. **PWA:** ostatni fix sticky wymaga potwierdzenia na iPhone PWA i przy starym cache.
3. **Fresh account:** F0.7 wymaga krótkiej regresji nowego urządzenia, skip/finish i usunięcia historii.
4. **Android:** brak pełnego checkpointu systemowego Back/PWA.
5. **A11y:** funkcjonalne sheety nie mają jeszcze kompletnego focus trapu i zwrotu fokusu.
6. **Backup:** zweryfikowana kopia pozostaje na laptopie; potrzebna zaszyfrowana kopia poza nim.
7. **Publiczność:** signup, RODO, eksport/usunięcie, abuse protection i publiczna Ekipa są zamknięte.
8. **Badania:** większość wiedzy pochodzi z dogfoodu właściciela; wymagane są H2-Lab oraz
   trzytygodniowy H2-Field, zanim ruszą publiczne konta i premium.
9. **Prawo:** commity `2aa4191` i `d10e51e` dodały drafty w `docs/legal/` oraz docelową domenę;
   nie zaliczają PRIV-1 bez review prawnego, eksportu/usunięcia, audytu RLS i weryfikacji
   dostawców/regionu.
10. **Sklepy:** obecny dynamiczny Next.js nie jest gotowym bundle'em Capacitor. PWA pozostaje
    drogą do H2-F/PAY-01; decyzja Expo/React Native kontra lokalny Capacitor jest w MOBILE-0.

## 5. Dane i technologia

- Next.js 16.2, React 19.2, TypeScript, Tailwind CSS 3;
- Supabase Auth/Postgres/Storage/RLS, Serwist i Vercel;
- 907 rekordów ćwiczeń lokalnie; bieżące liczby potwierdza `npm run validate:training`;
- publiczna rejestracja wyłączona;
- migracje produkcyjne do `20260720153000_team_streak_warsaw.sql` zostały zastosowane.

## 6. Najbliższa praca

1. Domknąć review/CI i kontrolowaną migrację TRAIN-01; równolegle Q1: regresja sticky/F0.7
   oraz review treści Hip Thrust/Chin-Up i ruchów początkujących.
2. CORE-0: prawidłowa zakończona seria, kanoniczne jednostki, wspólna definicja faktu i odporny outbox.
3. R4A: kontrakt aktywnej serii, pętla wielu serii/ćwiczeń i nieblokujący timer.
4. PLAN-Q: jeden katalog, recepta v2, korekta 15/15 planów, prawda sprzętowa, UI i gate publikacji.
5. R2.2: filtr „Tylko z moim sprzętem” oparty na wykonalności per slot.
6. R4B–R4D: pierwsza sesja, finish, własny trening i Historia/backfill.
7. CORE-1 → R4E: wersjonowany thin slice guidance i wartość drugiego treningu.
8. R3b → R5b → R6 → H2-Lab → trzytygodniowy H2-Field.

## 7. Reguły operacyjne

- Migracje wyłącznie przez `supabase/migrations`; każda tabela użytkownika ma RLS i test wielokontowy.
- Produkcyjne dane testowe usuwamy tylko po znanych ID.
- Jeden build Next.js naraz.
- Deploy i zamknięcie sesji zgodnie z `.claude/skills/`.
- Każda zmiana stanu aktualizuje HANDOFF, backlog/plan i `koordynacja-agentow.md`.
- Warstwa operacyjna zadań: Linear (workspace `trainarco`; od 2026-07-21 zastępuje Notion). Repo docs pozostają źródłem prawdy.
