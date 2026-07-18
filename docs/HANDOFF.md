# Arco — bieżący handoff

**Aktualizacja:** 2026-07-17

**Gałąź:** `main`

**Produkcja:** https://arco-olive.vercel.app

Ten plik opisuje stan na dziś. Historia zmian jest w Git, a kolejność dalszej pracy w `plan-sprintow-2026-07.md`.

## Refinement architektury i user flows (2026-07-16)

Po audycie całej aplikacji przyjęto docelową IA: bottom bar **Trening · Postępy · Historia · Ekipa**, podwidoki **Dziś | Plany** w Treningu i **Trening | Ciało** w Postępach, profil przez awatar oraz kompaktowy cel tygodniowy w headerze. Hero Home ma jawne cele tapnięcia; aktywny trening nie prowadzi do biblioteki. Back, minimalizacja sesji i zamknięcie zadania mają odrębną semantykę.

Pełny kontrakt jest w `userflows-docelowe-2026-07.md`. Aktywny plan wdrożenia to
R0–R7 z `plan-sprintow-2026-07.md`, rozbity na R0.5, R1a/R1b, R3a/R3b i R5a/R5b.
Zastępuje wcześniejszą sekwencję Sprint 17b → H2. Stan wdrożenia: R0.5 zaakceptowany,
R1a/R1b/R2 na produkcji; R2 czeka na refinement R2.1 (ryzyko 11) przed startem R3a.

## Sprint 17a — onboarding v3.1 (2026-07-16)

Zamknięte obie pułapki P1 z `docs/audyt-onboardingu-2026-07.md` przed H2: fallback E6 (brak sugestii) ma teraz dwa uczciwe wyjścia — „Przejdź do biblioteki" realnie nawiguje na `/programs` (był to znany bug od 2026-07-11), „Wybiorę później" zapisuje profil i wraca na home. Globalny „Pomiń" od E5 zapisuje zebrany profil zamiast go gubić; na E6 jest ukryty (są już dwa jawne wyjścia). Plus O3–O9: poprawna odmiana liczebnika w zdaniu-uzasadnieniu („5 treningów", nie „5 treningi"), „Pomiń ten krok" na E4, i pięć poprawek copy (żargon „deficyt", nagłówek E3, „bezpieczny"→„pasujący" plan, kontekst przy imieniu, hint o zamiennikach bez drążka). Zweryfikowane w Preview na świeżym koncie (0 sesji): pełny flow E0→E7, obie gałęzie E6, skip na każdym kroku, tsc/build czyste. O10 (test klawiatury na telefonie) zostaje przy [Ty]; O11 (a11y radiogroup) w backlogu.

## Stan produktu

Arco działa jako responsywna PWA i obsługuje pełny rdzeń treningowy:

- onboarding i logowanie na przygotowanych kontach,
- wybór oraz zmianę programu z biblioteki,
- prowadzenie treningu, timer przerwy, podmiany i własne ćwiczenia,
- zakończenie, porzucenie i wznowienie aktywnej sesji,
- dodanie zapomnianego treningu z prawdziwą datą, godziną i czasem trwania,
- edycję zakończonego treningu i korektę ciężaru lub powtórzeń,
- historię, rekordy, guidance i widoki postępów,
- pomiary ciała z wymaganą wagą, notatką i maksymalnie dwoma zdjęciami,
- Ekipę v0 na kontach testowych: kod 8 znaków, członkowie, check-iny, reakcje i nudge.

Biblioteka programów ma własny, widoczny punkt wejścia. Filtry są prezentowane jako bottom sheet. Floating navigation ma 12 px marginesu po bokach i od dolnej safe area.

## Ostatnio domknięte

- Naprawiono przepływ porzucenia treningu uruchomionego z ekranu głównego.
- Ustabilizowano bottom sheety w przeglądarce i iOS PWA: bez skoku widoku, klikania pod overlayem i przewijania tła.
- Dodano zamykanie bottom sheetu gestem przeciągnięcia w dół.
- Poprawiono safe area dla sticky barów, nagłówków i toastów.
- Dodano edycję przeszłych treningów oraz czytelny przepływ treningu po fakcie.
- Skrócono kod Ekipy do 8 znaków.
- Obrazy ćwiczeń przeniesiono z GitHuba do Supabase Storage/CDN.
- CI działa dla zmian na `main` i pull requestów.
- Dodano dwa kierunkowe plany „Pośladki i nogi" oraz doprecyzowano rytm tygodniowy i rotację wszystkich programów.
- Odświeżono scenariusz H2 i metodologię pomiaru; onboarding v3.1 usuwa znane pułapki przed testem.
- Wykonano produkcyjny backup bazy i Storage oraz pełny restore do odizolowanej bazy; dowód i liczby są w `backup-i-restore.md`.
- Wdrożono fundament nowej nawigacji: centralną macierz chrome, cztery taby
  Trening/Postępy/Historia/Ekipa, wspólny Back z fallbackiem, osobną minimalizację aktywnego
  treningu i poprawne replace dla filtrów oraz ekranów terminalnych.
- R2: header Treningu (badge celu liczący treningi + awatar), subnav Dziś | Plany, hero
  „Następny trening" z rozdzielonymi celami tapnięcia, Plany z sekcją aktywnego planu,
  odchudzony Home (bez powitania, stałych kart i pustych wskazówek), home w jednym
  równoległym batchu zapytań.
- Spokojniejszy ekran Done po feedbacku właściciela: bez ikony 3D, liczba-bohater
  animowana od 0, postęp celu jako tekst zamiast przycisku, sesja-zero bez celebracji zer.
- Polska wyszukiwarka ćwiczeń (R5a): 213 nazw `name_pl` + 94 aliasy potoczne z
  zatwierdzonego słownika, wyszukiwanie po PL/EN/aliasach z rankingiem trafności,
  polskie nazwy w pickerze, „ostatnio używanych" i kandydatach podmiany; test regresji
  krytycznych fraz w testach jednostkowych.
- Dokończenie R5a: polskie nazwy na wszystkich powierzchniach (logger, historia, program,
  hero, guidance, postępy, strona ćwiczenia) oraz wyszukiwanie bez diakrytyk (R4 audytu,
  migracja `20260717163900` — potwierdzone local == remote).
- Paczka „trwałość zapisu" z audytu kodu (P1.1+P2, commit `e0c4cbf`): uszkodzony outbox
  robi backup zamiast cichej utraty serii, pełny storage nie gubi operacji w trakcie życia
  karty (fallback w pamięci + toast), `clearDraft` nie odtwarza już skasowanego szkicu.
- Konsolidacja e1RM (audyt P1.2+P1.3, commit `37af446`): wzór Epleya i metryka per typ
  ćwiczenia żyją w jednym `lib/exerciseMetrics.ts` (były 4 kopie), `repPRs` i metryki
  mają testy jednostkowe — fundament pod prognozę Coach.
- Guidance poza LCP home + indeks `sessions(user_id, started_at desc)` (audyt P1.4,
  commit `b790a80`): hero home nie czeka już na 3 rundy DB guidance (Suspense/streaming),
  migracja `20260717213044` przetestowana na świeżej bazie. Wszystkie 4 P1 audytu zamknięte.
- Paczka P2 audytu (`ab5e3ca`, na prodzie): guard podwójnego tapu „Zakończ" w loggerze,
  `requireUser()` w akcjach podmiany, limit 100 wystąpień na stronie ćwiczenia, komentarz
  przy `TeamHomeCard`, CSP/config bez zaszłości `raw.githubusercontent.com`; sprostowanie
  audytu: polityka INSERT `activity_events` była zamknięta już 2026-07-13.
- Testy dla bibliotek bez pokrycia (`33dd58e`, lokalnie): `format`, `week`,
  `trainingPriority`, `exerciseFilters` — +26 przypadków, w tym regresja bugu strefy
  czasowej w `localDayKey`. Ostatni punkt P2 zamknięty.

## Technologia i dane

- Next.js 16.2, React 19.2, TypeScript, Tailwind CSS 3.
- Supabase Auth, Postgres, Storage i RLS.
- Serwist dla PWA/offline.
- Vercel w regionie zbliżonym do Supabase Frankfurt.
- Walidator potwierdza 907 ćwiczeń, 767 widocznych, 15 programów i 308 slotów. Liczby zawsze weryfikuje `npm run validate:training`.
- Publiczny signup pozostaje wyłączony. Nie traktujemy obecnej Ekipy jako funkcji gotowej do publicznego multi-user.

## Automatyczna jakość

Aktualny gate obejmuje:

- lint,
- 70 testów jednostkowych,
- walidację danych treningowych,
- walidację rekomendacji,
- build produkcyjny,
- izolowane testy integracyjne z Supabase dla treningu, offline, rekordów i RLS Ekipy.

Przed wydaniem uruchom pełny zestaw skryptem CI lub równoważny zestaw lokalny z `package.json`.

## Otwarte ryzyka

1. **Bottom sheet accessibility — refinement:** zachowanie funkcjonalne na PWA jest domknięte; własny dialog wymaga jeszcze pełnego focus trapu i zwrotu fokusu do elementu otwierającego.
2. **Testy urządzeń:** checkpoint iPhone PWA **ZALICZONY [Ty] 2026-07-18** (8/8 scenariuszy, zero zgłoszeń — `docs/macierz-regresji-urzadzen.md` kol. A). Zostaje: Android (świadoma luka sprzętowa) oraz powtórki macierzy po R3b i R4 zgodnie z planem.
3. **Backup poza urządzeniem:** lokalny backup i restore są zweryfikowane. Kopię trzeba jeszcze przenieść do zaszyfrowanej lokalizacji poza laptopem.
4. **H2:** obecne poprawki pochodzą głównie z dogfoodingu właściciela. Potrzeba testów z 3–5 osobami.
5. **Konta publiczne:** rejestracja, reset hasła, wersjonowane zgody, eksport/usunięcie danych i ochrona przed nadużyciami nie są jeszcze gotowe.
6. **Analityka:** adapter istnieje, ale produkcyjnie pozostaje no-op do czasu decyzji prawnej i produktowej.
7. **Ekipy publiczne:** przed otwarciem wymagają zgód, rate limitów, ochrony 8-znakowych kodów, rotacji zaproszeń i dogfoodingu wielokontowego.
8. **Materiały ćwiczeń:** walidator wykazuje 16 unikalnych ćwiczeń z placeholderem zdjęcia w 49 slotach programów. **Odroczone (2026-07-18):** po audycie [Ty] decyzja o wygenerowaniu 16 zdjęć cofnięta — wykona w innym terminie. Prompty gotowe (`prompty-zdjecia-cwiczen-16.md`). NIE blokuje R3a; pozostaje otwarte jako warunek bramki H2 (placeholdery w widocznych planach muszą mieć świadomą decyzję).
9. **Docelowa IA jest wdrożona do R2 włącznie** (chrome, integralność sesji, hub Treningu);
   huby Postępy/Ekipa i logger czekają na R3a–R4. `/history/add` nadal wymaga przebudowy
   wyboru programu oraz pełnej regresji daty i overflow na iOS.
10. **Drift danych treningowych:** w produkcji brakuje `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`; zweryfikowany restore ma 905 ćwiczeń, a lokalny zestaw 907. Przed H2 trzeba wykonać precyzyjny sync tych dwóch rekordów zamiast pełnego re-seeda.
11. **R2 Home/Plany wymaga refinementu przed R3a:** pion ma właściwy szkielet IA,
    lecz nie domyka zaakceptowanego UX/UI. Pełny `FlameWeek` nadal wyprzedza hero
    (na 320 × 568 koliduje z floating nav), badge celu nie jest klikany, hero ma
    zbyt mały target nazwy planu, loading Plany gubi chrome, a karty biblioteki są
    zbyt gęste. Zakres i Definition of Done R2.1: `audyt-r2-home-plany-2026-07-17.md`.

## Następny krok

Na produkcji są: R1a, R1b, R2, spokojniejszy ekran Done oraz **polska wyszukiwarka R5a**
(migracja `20260717130502_exercise_polish_names` — local == remote, deploy `6d7c26d`,
CI zielone). Zaakceptowane po dogfoodzie [Ty]: pion R2 i ekran Done.
**Checkpoint urządzeniowy ZALICZONY [Ty] 2026-07-18** (iPhone PWA, 8/8, zero zgłoszeń) —
bramka przed R3a zamknięta. **Następny krok kodowy: R3a (Postępy i Ciało).**
**Zdjęcia 16 placeholderów: ODROCZONE** (decyzja [Ty] 2026-07-18) — patrz ryzyko 8; nie
blokuje R3a, warunek bramki H2.
Deploy audytu kodu (P1.1–P1.4 + P2) wykonany 2026-07-17: migracja `20260717213044` na
prodzie (local == remote), kod do `0dfa7e5` na origin, CI oba joby zielone, prod
zweryfikowany w przeglądarce (świeży build, zero błędów CSP). Lokalny bucket
`exercise-images` zasiany przez `npm run upload:exercise-images` (na LOKALNY stack —
`.env.local` wskazuje dev, nie prod). **Cały audyt kodu 2026-07 jest zamknięty**
(4/4 P1, cała lista P2) poza większymi refactorami odłożonymi jako tło R3–R5
(agregaty postępów, wspólny typ joinów, formatSet w 3 miejscach, duże komponenty,
i18n komunikatów, multi-tab outbox — udokumentowane).
Commit `33dd58e` (testy libów) jest wypchnięty — `origin/main` = `c6d2bac`, całość
dorobku 2026-07-17 jest na GitHubie.
Kod: **R2.1 na produkcji** (badge celu jako akcja z sheetem tygodnia, FlameWeek poza Home,
polish hero, odchudzone karty Planów, loading z chrome, izolacja insightu per konto+program).
Przegląd [Ty] + pre-check wizualny Claude na desktopie: bez zgłoszeń. Zostaje tylko
checkpoint urządzeniowy (wyżej), potem R3a–R4. Z toru wyszukiwarki zostają R5–R6 audytu
(instrumentacja search, kosmetyka) — R4 (diakrytyki) i `name_pl` na wszystkich
powierzchniach weszły 2026-07-17 (`9eb9835`, migracja na prodzie). Audyt kodu: wszystkie
4 P1 zamknięte; zostaje P2 jako tło przy R3–R5.
Równolegle: przeniesienie zweryfikowanego backupu do zaszyfrowanej lokalizacji poza laptopem.
Procedury wydania, zamknięcia sesji i migracji są od 2026-07-17 skodyfikowane w
`.claude/skills/` (arco-release, arco-session-close, arco-migration) i wiążące przez `CLAUDE.md`.

Nie dokładamy teraz nowej funkcji. Porządkujemy istniejący rdzeń i testujemy jeden spójny model produktu.

## Operacyjnie

- Migracje tylko przez `supabase/migrations`.
- Service role nie może trafić do repo ani logów.
- Re-seed może zmienić powiązania aktywnego programu. Po seedzie zawsze zweryfikuj konto testowe.
- Produkcyjne dane treningowe usuwaj wyłącznie po jawnie znanych identyfikatorach.
- Porządki 2026-07-17: usunięto 6 duplikatów ikon ` 2.png` bitowo identycznych z oryginałami.
  Zostały 2 różniące się (`battery`, `target` — do decyzji [Ty]) oraz niepodpięty
  `app/session/[id]/done/CountUpNumber.tsx` (szkic celebracji bez importów — dokończyć lub usunąć).
