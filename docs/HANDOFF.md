# Arco — bieżący handoff

**Aktualizacja:** 2026-07-14

**Gałąź:** `main`

**Produkcja:** https://arco-olive.vercel.app

Ten plik opisuje stan na dziś. Historia zmian jest w Git, a kolejność dalszej pracy w `plan-sprintow-2026-07.md`.

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

## Technologia i dane

- Next.js 16.2, React 19.2, TypeScript, Tailwind CSS 3.
- Supabase Auth, Postgres, Storage i RLS.
- Serwist dla PWA/offline.
- Vercel w regionie zbliżonym do Supabase Frankfurt.
- Walidator potwierdza 907 ćwiczeń, 767 widocznych, 13 programów i 272 sloty. Liczby zawsze weryfikuje `npm run validate:training`.
- Publiczny signup pozostaje wyłączony. Nie traktujemy obecnej Ekipy jako funkcji gotowej do publicznego multi-user.

## Automatyczna jakość

Aktualny gate obejmuje:

- lint,
- 14 testów jednostkowych,
- walidację danych treningowych,
- walidację rekomendacji,
- build produkcyjny,
- izolowane testy integracyjne z Supabase dla treningu, offline, rekordów i RLS Ekipy.

Przed wydaniem uruchom pełny zestaw skryptem CI lub równoważny zestaw lokalny z `package.json`.

## Otwarte ryzyka

1. **Bottom sheet accessibility:** zachowanie dotykowe jest poprawione, ale własny dialog wymaga pełnego focus trapu i zwrotu fokusu do elementu otwierającego.
2. **Testy urządzeń:** potrzebna jest jedna uporządkowana macierz regresji na iPhone PWA, Safari, Chromium/Arc, Android i desktop.
3. **Backup:** brakuje udokumentowanego backupu produkcyjnej bazy i Storage oraz realnego testu odtworzenia do odizolowanego środowiska.
4. **H2:** obecne poprawki pochodzą głównie z dogfoodingu właściciela. Potrzeba testów z 3–5 osobami.
5. **Konta publiczne:** rejestracja, reset hasła, wersjonowane zgody, eksport/usunięcie danych i ochrona przed nadużyciami nie są jeszcze gotowe.
6. **Analityka:** adapter istnieje, ale produkcyjnie pozostaje no-op do czasu decyzji prawnej i produktowej.
7. **Ekipy publiczne:** przed otwarciem wymagają zgód, rate limitów, ochrony 8-znakowych kodów, rotacji zaproszeń i dogfoodingu wielokontowego.
8. **Materiały ćwiczeń:** walidator wykazuje 16 unikalnych ćwiczeń z placeholderem zdjęcia w 45 slotach programów. Należy je uzupełnić lub świadomie wyłączyć przed H2.

## Następny krok

Realizujemy Sprint 15 z `plan-sprintow-2026-07.md`: regresja PWA/bottom sheetów, dostępność dialogów, zachowanie cache po aktualizacji i pełny gate jakości. Potem bezpieczeństwo operacyjne i H2.

Nie dokładamy teraz dużej funkcji. Najpierw potwierdzamy, że rdzeń jest stabilny i zrozumiały dla osób spoza projektu.

## Operacyjnie

- Migracje tylko przez `supabase/migrations`.
- Service role nie może trafić do repo ani logów.
- Re-seed może zmienić powiązania aktywnego programu. Po seedzie zawsze zweryfikuj konto testowe.
- Produkcyjne dane treningowe usuwaj wyłącznie po jawnie znanych identyfikatorach.
- Untracked duplikaty ikon z sufiksem ` 2.png` nie są częścią obecnych zmian i wymagają osobnej decyzji właściciela.
