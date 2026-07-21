# Dokumentacja Arco

**Aktualizacja:** 2026-07-21

## Źródła prawdy

Czytaj w tej kolejności:

1. `wizja-i-strategia-v3.md` — po co istnieje Arco, dla kogo, czego nie budujemy i jakie mamy zasady.
2. `decyzje-produktowe.md` — obowiązujące rozstrzygnięcia i pytania z bramkami.
3. `userflows-docelowe-2026-07.md` — docelowa IA, zachowanie tras i przepływów.
4. `HANDOFF.md` — co faktycznie działa na dziś i jakie są ryzyka.
5. `backlog-produktu.md` — pełna kolejka zaakceptowanych, odłożonych i odrzuconych tematów.
6. `plan-sprintow-2026-07.md` — bieżąca kolejność i Definition of Done etapów.
7. `roadmap.md` — H2-Lab/H2-Field oraz bramki prywatności, płatnej bety i wzrostu.

Jeżeli stary audyt, notatka lub komentarz przeczy tej kolejności, obowiązuje dokument wyżej.

## Praca agentów

- `standard-zadania-agentow.md` — Definition of Ready/Done i obowiązkowy brief zadania.
- `koordynacja-agentow.md` — wyłącznie aktywne rezerwacje i krótki log ostatnich zmian.
- `notion-sync-queue.md` — tylko zmiany oczekujące na ręczną synchronizację, gdy właściciel jej zażąda.

Agent zaczyna od `CLAUDE.md`, HANDOFF i aktywnego sprintu. Nie traktuje archiwum ani starego
audytu jako backlogu.

## Trwałe kontrakty

### UX/UI i treść

- `wytyczne-designu.md` — HIG/WCAG, chrome, motion i checklista ekranu.
- `paleta-arco-warm.md` — tokeny kolorów.
- `tone-of-voice.md` — język produktu.
- `prompt-ikony-3d-clay.md` — kuratorowany system 3D; inspiracja i reguły użycia.
- `prompt-fotografia-warm.md` — przyszły kierunek fotografii editorialowej.
- `r0-5-wynik-prototypu.md` — decyzje potwierdzone przez prototyp przed wdrożeniem.
- `spec-r4-logger.md` — agent-ready refinement loggera, Historii i wartości drugiego treningu.
- `audyt-core-i-plan-2026-07.md` — ocena silnika, dowody, architektura CORE-0/CORE-1 i granice pracy po H2.
- `spec-plan-q-biblioteka-treningow.md` — agent-ready kontrakt danych, treści, sprzętu, UI i walidacji 15 programów.
- `audyt-biblioteki-programow-2026-07.md` — wersjonowane zatwierdzenie recept P01–P15 i dokładna lista korekt.
- `../prototypes/product-vision-poc/README.md` — aktualny klikalny POC docelowego kręgosłupa produktu.

### Jakość, bezpieczeństwo i badania

- `macierz-regresji-urzadzen.md` — checkpointy PWA/urządzeń.
- `scenariusz-h2.md` — metodologia H2-U/H2-V/H2-E oraz protokół H2-F; finalna rewizja w R6.
- `feedback-uzytkownikow.md` — surowe obserwacje i ich status.
- `bezpieczenstwo.md` — bramki bezpieczeństwa i publicznych kont.
- `backup-i-restore.md` — procedura oraz dowód odtworzenia.
- `optymalizacja.md` — budżety gorących tras.
- `instrumentacja-metryk.md` — plan pomiaru po decyzji prawnej.

### Ćwiczenia i programy

- `audyt-bazy-cwiczen.md` — pochodzenie, ukrywanie i dotychczasowa kuracja.
- `r5a-slownik-pl-propozycja.md` — wersjonowane źródło zatwierdzonego słownika PL i aliasów.
- `review-content-01-hip-thrust-2026-07.md` — decyzje, źródła i gate publikacji wariantów Hip Thrust.
- `prompty-zdjecia-cwiczen-16.md` — materiał roboczy; prompt nie jest zatwierdzeniem techniki.
- `trainings/` — kontrakty treści programów.

### Ekipa, płatności i launch

- `legal/README.md` — mapa draftów PRIV-1; draft nie zastępuje review prawnego ani działających flow.
- `ekipa-koncepcja.md` — trwała zasada produktu i benchmark.
- `ekipa-blueprint-wdrozeniowy.md` — kontrakt danych/RLS dla v0 i publicznego hardeningu.
- `projekt-schematu-subs-consents-pods.md` — projekt przyszłych subskrypcji i zgód; migracje są prawdą dla obecnej bazy.
- `audyt-paywalla-2026-07.md`, `spec-status-konta-ui.md` — decyzje Coach po H2.
- `strategia-marketingowa.md`, `plan-dystrybucji.md`, `landing-plan.md`, `landing-copy.md` — etap launchu.

## Archiwum

`archive/` zawiera trwałe benchmarki i kontekst historyczny. Nie jest źródłem stanu ani planu.
Zakończone raporty implementacyjne i równoległe plany są usuwane, bo ich historię zachowuje Git.

## Zasady utrzymania

- Stan wdrożenia zmieniamy w HANDOFF.
- Nowy pomysł trafia najpierw do backlogu; jeśli wymaga rozstrzygnięcia, także do rejestru decyzji.
- Kolejność zmieniamy tylko w planie sprintów.
- Roadmapę zmieniamy wyłącznie przy zmianie horyzontu lub bramki.
- Log koordynacji nie jest changelogiem; przechowuje kilka ostatnich wpisów, resztę ma Git.
- Dokument zamkniętego sprintu usuwamy po migracji unikalnych ustaleń do źródeł prawdy.
- Notion nie jest źródłem prawdy i synchronizujemy go tylko na prośbę właściciela.
