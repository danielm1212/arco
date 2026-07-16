# Dokumentacja Arco

**Aktualizacja:** 2026-07-16

## Zacznij tutaj

- `HANDOFF.md` — co działa, co jest na produkcji i jakie są aktualne ryzyka.
- `plan-sprintow-2026-07.md` — aktywny backlog i kolejność następnych sprintów.
- `userflows-docelowe-2026-07.md` — docelowa architektura informacji, przepływy i kontrakt chrome.
- `roadmap.md` — horyzonty rozwoju i bramki decyzyjne.
- `wizja-i-strategia-v3.md` — **kanon misji, person, modelu, strategii i języka marki (2026-07-16)**.
- `wizja-i-plan-produktu-v2.md` — kanon zasad Z1–Z3 oraz §4–§10: ekipa, dystrybucja, sekwencja i bramki.

Tych sześć plików jest dokumentami sterującymi bieżącą pracą. Gdy starszy dokument im przeczy, obowiązuje powyższa kolejność.

## Trwałe referencje

### Produkt i badania

- `scenariusz-h2.md` — scenariusz testów z użytkownikami.
- `feedback-uzytkownikow.md` — dziennik obserwacji i decyzji.
- `usability-audit.md` — audyt użyteczności i stan ustaleń.
- `audyt-wyszukiwarki-2026-07.md` — audyt wyszukiwania ćwiczeń; jego lokalne fazy R1–R6
  składają się na R5a aktywnego planu i blokują H2.
- `r5a-slownik-pl-propozycja.md` — propozycja `name_pl` (~205 ćwiczeń), aliasów i decyzji
  placeholderowych do przeglądu właściciela; treść wejściowa dla implementacji R5a.
- `audyt-nawigacji-2026-07.md` — docelowy kontrakt Back/Up, bottom baru, mini-bara sesji i stosu historii.
- `userflows-docelowe-2026-07.md` — decyzja nadrzędna wobec wcześniejszych wariantów IA z audytów.
- `r0-5-wynik-prototypu.md` — wynik klikalnego prototypu, przetestowane flow i decyzje przed implementacją.
- `konkurencja-hevy.md` oraz `archive/konkurencja-hevy-ux.md` — benchmark konkurencyjny.
- `monetyzacja.md` — wcześniejsza analiza; wizja v2 rozstrzyga konflikty.

### Design i komunikacja

- `paleta-arco-warm.md` — kolory i semantyka.
- `wytyczne-designu.md` — zasady interfejsu i dostępności.
- `tone-of-voice.md` — język produktu.
- `prompt-ikony-3d-clay.md` — zasady małego zestawu ikon 3D.
- `prompt-fotografia-warm.md` — system fotografii Warm dla biblioteki, landingu i momentów.
- `strategia-marketingowa.md`, `landing-plan.md`, `plan-dystrybucji.md`, `baza-contentu-instagram.md` — materiały na etap launchu.
- `audyt-paywalla-2026-07.md` — uzasadnienie modelu Coach, yearly-first i teasera stagnacji.
- `spec-status-konta-ui.md` — karta „Twój plan" w Ustawieniach i trzy stany ekranu `/coach`.

### Technologia i operacje

- `setup-local.md` — uruchomienie lokalne.
- `bezpieczenstwo.md` — zasady i bramki bezpieczeństwa.
- `optymalizacja.md` — budżety wydajności.
- `instrumentacja-metryk.md` — architektura pomiaru.
- `kalendarz-wykonawczy.md` — orientacyjny harmonogram.
- `notion-sync-queue.md` — kolejka zmian do ręcznej synchronizacji na żądanie.
- `koordynacja-agentow.md` — rezerwacja obszarów i log pracy równoległych sesji.

### Ekipy i dane

- `ekipa-koncepcja.md` — założenia produktu.
- `ekipa-blueprint-wdrozeniowy.md` — referencja techniczna; baseline v0 jest już wdrożony dla kont testowych.
- `projekt-schematu-subs-consents-pods.md` — projekt docelowego multi-user, zgód i subskrypcji; nie opisuje w całości obecnej produkcji.

### Historyczne fundamenty

- `build-brief-apka-treningowa-v0.2.md`
- `build-brief-v0.3-addendum.md`

Briefy pomagają zrozumieć decyzje i model danych, ale nie są aktywnym planem wykonawczym.

## Archiwum

`archive/` zawiera wybrane audyty i decyzje, do których nadal warto wracać. Zakończone plany wykonawcze, które tylko dublowały historię Git, zostały usunięte zamiast utrzymywania ich jako równoległe źródła prawdy.

## Zasady utrzymania

- Po zmianie stanu aktualizujemy `HANDOFF.md`.
- Po zmianie priorytetu aktualizujemy `plan-sprintow-2026-07.md`.
- Roadmapę zmieniamy tylko wtedy, gdy zmienia się kolejność horyzontów lub bramka.
- Dokument zakończonego sprintu usuwamy, gdy jego wiedza jest już w kodzie, testach i historii Git.
- Trwałą decyzję, benchmark lub wymaganie prawne zachowujemy jako referencję.
- Notion synchronizujemy wyłącznie na prośbę właściciela.
