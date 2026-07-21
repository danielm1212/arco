# Arco

Osobista aplikacja treningowa PWA. Zacznij od `docs/README.md`; aktualny stan opisuje
`docs/HANDOFF.md`, pełną kolejkę `docs/backlog-produktu.md`, kolejność prac
`docs/plan-sprintow-2026-07.md`, a dłuższy kierunek `docs/roadmap.md`.

## Aktualny stan

- Produkcja: https://arco-olive.vercel.app
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 3, Supabase, Serwist.
- Publiczna rejestracja jest wyłączona. Ekipy działają obecnie wyłącznie na kontach testowych.
- Obrazy ćwiczeń są hostowane we własnym Supabase Storage/CDN.
- CI sprawdza lint, testy jednostkowe, dane treningowe, rekomendacje, build oraz izolowane testy integracyjne.

## Źródła prawdy

1. `docs/wizja-i-strategia-v3.md` — kanon wizji, zasad produktu, person i strategii.
2. `docs/decyzje-produktowe.md` — trwałe rozstrzygnięcia i otwarte bramki.
3. `docs/userflows-docelowe-2026-07.md` — kontrakt IA i zachowań.
4. `docs/HANDOFF.md` — stan techniczny i produktowy na dziś.
5. `docs/backlog-produktu.md` — kompletna kolejka, również rzeczy odłożone i odrzucone.
6. `docs/plan-sprintow-2026-07.md` — wyłącznie aktywna kolejność sprintów.
7. `docs/roadmap.md` — horyzonty po H2 i bramki rozwoju.

Stare audyty, briefy i archiwum nie są backlogiem ani źródłem bieżącego stanu.

## Nienaruszalne zasady produktu

- Rdzeń logowania treningu pozostaje darmowy.
- Ekipy, zaproszenia i nudge pozostają darmowe.
- Limitujemy dostęp do funkcji, nie dane użytkownika. Nie kasujemy historii z powodu planu.
- Arco prowadzi przez jawne reguły, nie przez obietnicę automatycznego planowania AI.
- Publiczny feed, komentarze, czat, dieta, wearables i marketplace programów są poza obecnym zakresem.

## Zasady pracy

- Przed większą zmianą sprawdź `docs/HANDOFF.md` i aktywny sprint.
- Każde zadanie przygotuj i domknij według `docs/standard-zadania-agentow.md`.
- Deploy na produkcję wykonuj wyłącznie procedurą z `.claude/skills/arco-release/SKILL.md` — w tym obowiązkowe smoke'i przy zmianie kontraktu danych.
- Każdą sesję zamykaj procedurą z `.claude/skills/arco-session-close/SKILL.md` — wpis w dzienniku koordynacji, HANDOFF i aktualizacja zadań w Linear.
- Migracje bazy wykonuj wyłącznie przez `supabase/migrations`, według reguł z `.claude/skills/arco-migration/SKILL.md`.
- Każda tabela z danymi użytkownika dostaje RLS i test wielokontowy w tej samej zmianie.
- Service role może występować wyłącznie w skryptach i środowisku serwerowym.
- Nigdy nie usuwaj hurtowo sesji. Dane testowe kasuj tylko po znanych identyfikatorach.
- Przy zmianach loggera i innych gorących tras stosuj budżety z `docs/optymalizacja.md`.
- Przy zmianach UI stosuj checklistę z `docs/wytyczne-designu.md`.
- Nowe funkcje muszą mieć stany pusty, ładowania, błędu i jasne CTA.
- Warstwą operacyjną zadań jest **Linear** (workspace `trainarco`, team „Daniel"; decyzja 2026-07-21 — zastąpił Notion). Źródłem prawdy pozostają repo docs (`backlog-produktu.md`, plan sprintów); w Linear aktualizuj status issue dotkniętych sesją. Notion nie synchronizujemy; `docs/notion-sync-queue.md` jest zamknięte.

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
