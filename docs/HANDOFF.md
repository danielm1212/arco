# Arco — bieżący handoff

**Aktualizacja:** 2026-07-16

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
8. **Materiały ćwiczeń:** walidator wykazuje 16 unikalnych ćwiczeń z placeholderem zdjęcia w 49 slotach programów. Należy je uzupełnić lub świadomie wyłączyć przed H2.
9. **Docelowa IA jest wdrożona częściowo:** R0.5 jest zaakceptowany, a R1a wprowadza nowy
   kontrakt chrome i tab Ekipy. Home oraz huby nadal czekają na R2–R4; R1b musi wcześniej
   zabezpieczyć jedną aktywną sesję i szkice. `/history/add` nadal wymaga przebudowy wyboru
   programu oraz pełnej regresji daty i overflow na iOS.
10. **Drift danych treningowych:** w produkcji brakuje `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`; zweryfikowany restore ma 905 ćwiczeń, a lokalny zestaw 907. Przed H2 trzeba wykonać precyzyjny sync tych dwóch rekordów zamiast pełnego re-seeda.

## Następny krok

R1a i R1b są zakończone i **wdrożone na produkcję** (2026-07-16 wieczorem, decyzją właściciela
przed regresją urządzeniową): migracja `20260716213000_single_open_session` zastosowana na
prod (local == remote), deploy `9f65a6d` na Vercel zakończony sukcesem, strona logowania i
service worker zweryfikowane w przeglądarce bez błędów konsoli. **Zaległa pozostaje krótka
regresja [Ty] na iPhone PWA i Androidzie** — w pierwszej kolejności start/wznowienie treningu
i odzyskanie szkicu, bo niezmiennik sesji działa już na realnych danych.
Następnie R2 (Trening, Dziś i Plany), checkpoint dogfood, dalej R3–R5b, R6 i H2 w R7.
Równolegle: przegląd słownika `r5a-slownik-pl-propozycja.md` [Ty] oraz przeniesienie
zweryfikowanego backupu do zaszyfrowanej lokalizacji poza laptopem.

Nie dokładamy teraz nowej funkcji. Porządkujemy istniejący rdzeń i testujemy jeden spójny model produktu.

## Operacyjnie

- Migracje tylko przez `supabase/migrations`.
- Service role nie może trafić do repo ani logów.
- Re-seed może zmienić powiązania aktywnego programu. Po seedzie zawsze zweryfikuj konto testowe.
- Produkcyjne dane treningowe usuwaj wyłącznie po jawnie znanych identyfikatorach.
- Untracked duplikaty ikon z sufiksem ` 2.png` nie są częścią obecnych zmian i wymagają osobnej decyzji właściciela.
