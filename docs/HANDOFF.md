# Arco — bieżący handoff

**Aktualizacja:** 2026-07-17

**Gałąź:** `main`

**Produkcja:** https://arco-olive.vercel.app

Ten plik opisuje stan na dziś. Historia zmian jest w Git, a kolejność dalszej pracy w `plan-sprintow-2026-07.md`.

## Refinement architektury i user flows (2026-07-16)

Po audycie całej aplikacji przyjęto docelową IA: bottom bar **Trening · Postępy · Historia · Ekipa**, podwidoki **Dziś | Plany** w Treningu i **Trening | Ciało** w Postępach, profil przez awatar oraz kompaktowy cel tygodniowy w headerze. Hero Home ma jawne cele tapnięcia; aktywny trening nie prowadzi do biblioteki. Back, minimalizacja sesji i zamknięcie zadania mają odrębną semantykę.

Pełny kontrakt jest w `userflows-docelowe-2026-07.md`. Aktywny plan wdrożenia to
R0–R7 z `plan-sprintow-2026-07.md`, rozbity na R0.5, R1a/R1b, R3a/R3b i R5a/R5b.
Zastępuje wcześniejszą sekwencję Sprint 17b → H2. R0.5 został zaakceptowany, a fundament
R1a jest wdrożony lokalnie i czeka na regresję urządzeniową przed publikacją.

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
- 23 testy jednostkowe,
- walidację danych treningowych,
- walidację rekomendacji,
- build produkcyjny,
- izolowane testy integracyjne z Supabase dla treningu, offline, rekordów i RLS Ekipy.

Przed wydaniem uruchom pełny zestaw skryptem CI lub równoważny zestaw lokalny z `package.json`.

## Otwarte ryzyka

1. **Bottom sheet accessibility — refinement:** zachowanie funkcjonalne na PWA jest domknięte; własny dialog wymaga jeszcze pełnego focus trapu i zwrotu fokusu do elementu otwierającego.
2. **Testy urządzeń:** potrzebna jest jedna uporządkowana macierz regresji na iPhone PWA, Safari, Chromium/Arc, Android i desktop.
3. **Backup poza urządzeniem:** lokalny backup i restore są zweryfikowane. Kopię trzeba jeszcze przenieść do zaszyfrowanej lokalizacji poza laptopem.
4. **H2:** obecne poprawki pochodzą głównie z dogfoodingu właściciela. Potrzeba testów z 3–5 osobami.
5. **Konta publiczne:** rejestracja, reset hasła, wersjonowane zgody, eksport/usunięcie danych i ochrona przed nadużyciami nie są jeszcze gotowe.
6. **Analityka:** adapter istnieje, ale produkcyjnie pozostaje no-op do czasu decyzji prawnej i produktowej.
7. **Ekipy publiczne:** przed otwarciem wymagają zgód, rate limitów, ochrony 8-znakowych kodów, rotacji zaproszeń i dogfoodingu wielokontowego.
8. **Materiały ćwiczeń:** walidator wykazuje 16 unikalnych ćwiczeń z placeholderem zdjęcia w 49 slotach programów. Decyzja podjęta (2026-07-17): zdjęcia dla wszystkich 16 generuje [Ty] w sobotę 2026-07-18; ryzyko zamyka się z ich uploadem.
9. **Docelowa IA jest wdrożona częściowo:** R0.5 jest zaakceptowany, a R1a wprowadza nowy
   kontrakt chrome i tab Ekipy. Home oraz huby nadal czekają na R2–R4; R1b musi wcześniej
   zabezpieczyć jedną aktywną sesję i szkice. `/history/add` nadal wymaga przebudowy wyboru
   programu oraz pełnej regresji daty i overflow na iOS.
10. **Drift danych treningowych:** w produkcji brakuje `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`; zweryfikowany restore ma 905 ćwiczeń, a lokalny zestaw 907. Przed H2 trzeba wykonać precyzyjny sync tych dwóch rekordów zamiast pełnego re-seeda.

## Następny krok

Na produkcji są: R1a, R1b, R2, spokojniejszy ekran Done oraz **polska wyszukiwarka R5a**
(migracja `20260717130502_exercise_polish_names` — local == remote, deploy `6d7c26d`,
CI zielone). Zaakceptowane po dogfoodzie [Ty]: pion R2 i ekran Done.
**Najpilniejsze [Ty]: jedna wspólna regresja urządzeniowa na iPhone PWA i Androidzie** —
start/wznowienie treningu, odzyskanie szkicu, nowy header/subnav Trening, hero, ekran Done
oraz wyszukiwarka PL w pickerze (frazy: martwy, ohp, wyciskanie, allahy).
**[Ty] sobota 2026-07-18:** zdjęcia dla 16 placeholderów — gotowe prompty per ćwiczenie
w `prompty-zdjecia-cwiczen-16.md` (rewizja 2026-07-17: dyptyk, 3:2, stała kamera; styl bazowy
`prompt-fotografia-warm.md`), upload przez `upload:exercise-images` → `sync:exercise-content`.
**[Ty] push:** lokalny commit `37af446` (konsolidacja e1RM + testy repPRs — czysty
refactor lib/testy, bez migracji) czeka na push → CI + deploy.
Kod: checkpoint dogfood po R2, potem R3a–R4. Z toru wyszukiwarki zostają R5–R6 audytu
(instrumentacja search, kosmetyka) — R4 (diakrytyki) i `name_pl` na wszystkich
powierzchniach weszły 2026-07-17 (`9eb9835`, migracja na prodzie). Z audytu kodu zostaje:
P1.4 guidance poza LCP home + indeks `sessions(user_id, started_at desc)` (wymaga
migracji — najlepiej przy najbliższym dotknięciu home/statystyk), potem reszta P2.
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
