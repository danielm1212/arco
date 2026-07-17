# Arco

Osobista aplikacja treningowa PWA. Aktualny stan produktu opisuje `docs/HANDOFF.md`, kolejność prac `docs/plan-sprintow-2026-07.md`, a dłuższy kierunek `docs/roadmap.md`.

## Aktualny stan

- Produkcja: https://arco-olive.vercel.app
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 3, Supabase, Serwist.
- Publiczna rejestracja jest wyłączona. Ekipy działają obecnie wyłącznie na kontach testowych.
- Obrazy ćwiczeń są hostowane we własnym Supabase Storage/CDN.
- CI sprawdza lint, testy jednostkowe, dane treningowe, rekomendacje, build oraz izolowane testy integracyjne.

## Źródła prawdy

1. `docs/HANDOFF.md` — stan techniczny i produktowy na dziś.
2. `docs/plan-sprintow-2026-07.md` — aktywny backlog i najbliższe sprinty.
3. `docs/roadmap.md` — horyzonty, bramki i kolejność rozwoju.
4. `docs/wizja-i-strategia-v3.md` — kanon wizji, person, modelu i strategii (2026-07-16); `docs/wizja-i-plan-produktu-v2.md` — §4–§10 (ekipa, sekwencja, bramki) + Z1–Z3 (§2).
5. `docs/README.md` — mapa dokumentacji.

Briefy v0.2 i v0.3 są dokumentami historyczno-referencyjnymi. Nie mogą nadpisywać aktualnego stanu ani planu sprintów.

## Nienaruszalne zasady produktu

- Rdzeń logowania treningu pozostaje darmowy.
- Ekipy, zaproszenia i nudge pozostają darmowe.
- Limitujemy dostęp do funkcji, nie dane użytkownika. Nie kasujemy historii z powodu planu.
- Arco prowadzi przez jawne reguły, nie przez obietnicę automatycznego planowania AI.
- Publiczny feed, komentarze, czat, dieta, wearables i marketplace programów są poza obecnym zakresem.

## Zasady pracy

- Przed większą zmianą sprawdź `docs/HANDOFF.md` i aktywny sprint.
- Deploy na produkcję wykonuj wyłącznie procedurą z `.claude/skills/arco-release/SKILL.md` — w tym obowiązkowe smoke'i przy zmianie kontraktu danych.
- Każdą sesję zamykaj procedurą z `.claude/skills/arco-session-close/SKILL.md` — wpis w dzienniku koordynacji, HANDOFF i kolejka Notion.
- Migracje bazy wykonuj wyłącznie przez `supabase/migrations`, według reguł z `.claude/skills/arco-migration/SKILL.md`.
- Każda tabela z danymi użytkownika dostaje RLS i test wielokontowy w tej samej zmianie.
- Service role może występować wyłącznie w skryptach i środowisku serwerowym.
- Nigdy nie usuwaj hurtowo sesji. Dane testowe kasuj tylko po znanych identyfikatorach.
- Przy zmianach loggera i innych gorących tras stosuj budżety z `docs/optymalizacja.md`.
- Przy zmianach UI stosuj checklistę z `docs/wytyczne-designu.md`.
- Nowe funkcje muszą mieć stany pusty, ładowania, błędu i jasne CTA.
- Notion synchronizuj tylko na wyraźną prośbę. Do tego czasu aktualizuj lokalny backlog i `docs/notion-sync-queue.md`.

## Kierunek UX/UI

- System wizualny: Arco Warm, jasny domyślny interfejs, terracotta jako oszczędny akcent.
- UI narzędzia pozostaje czyste i spokojne. Retro-analogowa warstwa służy komunikacji i momentom, nie tłom codziennych ekranów.
- Ikony 3D clay stosujemy oszczędnie: onboarding, celebracje i empty states. Nie zastępują podstawowej ikonografii nawigacji.
- Floating bottom nav ma równy margines 12 px po bokach i od dołu z uwzględnieniem safe area.
- Wszystkie overlaye i bottom sheety muszą blokować interakcję oraz przewijanie tła, respektować safe area, dawać się zamknąć klawiszem Escape, overlayem i gestem w dół oraz poprawnie zarządzać fokusem.

## Jakość i definicja done

Zmiana jest skończona, gdy:

- lint, testy, walidatory i build przechodzą,
- krytyczny przepływ został sprawdzony na właściwym urządzeniu,
- nie ma regresji mobile/PWA, dostępności ani utraty danych,
- dokumentacja stanu i backlog są aktualne,
- dane testowe zostały bezpiecznie posprzątane.

Jeden build uruchamiaj naraz. Przed buildem zatrzymaj drugi proces Next.js, aby nie uszkodził `.next`.
