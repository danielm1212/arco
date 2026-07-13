# Kolejka sync do Notion (NA ŻĄDANIE od 2026-07-05 — patrz CLAUDE.md)

> Domyślny tryb (od 2026-07-05): dopisuj tu operacje ZAWSZE, niezależnie od dostępności Notion MCP.
> Wypychaj do Notion TYLKO gdy Daniel poprosi („zsynchronizuj Notion") — wtedy flush całej listy → usuń wykonane → pusta sekcja „Oczekujące".
> Tablica: „ARCO — Baza pomysłów" (data source `e037aac8-6857-46b7-80ef-95d011d1816e`).

## Format wpisu

```
- [ ] UPDATE | tytuł wpisu w bazie | Etap→Do testu [Ty] | Notatka: <hash> — co zrobione, co przetestować
- [ ] CREATE | tytuł nowego wpisu | Priorytet | Kto wykonuje | Etap | Faza | Kategoria | Notatka
```

## Oczekujące

- [ ] UPDATE | Kuracja bazy ćwiczeń + programy startowe | Etap→Do testu [Ty] | Notatka: 2026-07-13 — Sprint P3 lokalnie gotowy: 3 nowe presety zamykają luki gridu — Intermediate Bodyweight FBW 3–4×, Advanced Home UL 4–5×, Advanced Bodyweight UL 3–4×. Biblioteka 8→11 programów, 173→246 slotów, pogrupowana poziomami; detal rozdziela cykl od częstotliwości. Macierz 36/36 ✓ z 6 nowymi exact-match; cel 2 dni nie dostaje dłuższego planu, gdy istnieje krótszy fallback. Profil „Masa ciała” jawnie zapisuje teraz wymagany drążek (`pull-up bar`). Training 0 błędów, lint/build/smoke/Preview ✓; seed zachował ID i aktywny program, remote nietknięty. QA: trudność HSPU/Nordic/One-Arm Push-up, wymaganie drążka i rolowanie cyklu 3/4 dni.

- [ ] UPDATE | Kuracja bazy ćwiczeń + programy startowe | Etap→Do testu [Ty] | Notatka: 2026-07-13 — Sprint P2 rekomendacji lokalnie gotowy: cykl planu oddzielony od częstotliwości; 8 presetów ma slug/version, środowisko, poziom, zakres 2–6 dni, czas i sprzęt. Onboarding używa scoringu poziom×środowisko×cel×sprzęt, zapisuje profil sprzętu i jawnie odróżnia exact/fallback. Macierz 36/36 ✓; advanced z celem 4–5 nie dostaje PPL 6×, dom nie dostaje siłowni. Biblioteka mobilnie sprawdzona, build/lint/training ✓. Migracje+seed tylko lokalnie, ID i aktywny program zachowane; remote nietknięty. Do testu: flow onboardingu dla exact i fallback + copy nazw „cykl N dni”.

- [ ] UPDATE | Kuracja bazy ćwiczeń + programy startowe | Etap→Do testu [Ty] | Notatka: 2026-07-13 — Sprint P1 jakości treningowej lokalnie gotowy: 907 ćwiczeń / 767 widocznych / 8 programów / 173 sloty; naprawione bridge timed-vs-reps i machine→pull, 0 widocznych ćwiczeń bez movement_pattern, domowe/bodyweight bez niedozwolonego sprzętu. FBW Home 2× skrócony 28→20 i 27→20 serii, zakresy double progression; Advanced PPL +6 serii core. Dodane Band Lat Pulldown + Single-Leg Calf Raise. `npm run validate:training`, lint, build i bezpieczny lokalny seed ✓; seed zachowuje ID i aktywny program. Do testu na telefonie: trzy zmienione presety + podmiany machine/bridge.

- [ ] CREATE | Audyt UI/UX + pływająca nawigacja i ikony 3D clay | Wysoki | Ty+Claude | Backlog | — | UX / flow | Notatka: 2026-07-13 — po pełnym audycie ekranów na telefonie przebudować 4-tabowy bottom-nav do pływającej kapsuły (safe-area, aktywna sesja, 320–430 px, dark/zoom/perf). Osobny tor: mała seria matowych ikon clay Warm dla empty states/onboardingu/celebracji; nie do codziennej nawigacji ani list. Spec i kryteria: `docs/plan-floating-nav-i-ikony-3d.md`.

- [ ] CREATE | Kolejność przed launchem + wdrożenie Ekipy | Wysoki | Ty+Claude | In Progress | — | Feature | Notatka: 2026-07-13 — decyzja właściciela: kolejność wiążąca = lint React 19 → CI/regresja → backup+restore/CSP/S11 → H2 (3–5 osób) → konta/RODO/multi-user → cichy launch freemium → Ekipa jako fast-follow. Wyjątek tej sesji: lokalne dev-v0 Ekipy jest gotowe dla kont testowych (jawny profil+zgoda, zaproszenia, check-in tylko po zakończonej sesji, home + `/ekipa`, reakcje, nudge ze skrzynką, usuwanie/wyjście). Smoke `npm run smoke:team` na 3 kontach przeszedł: RLS, brak wglądu w `sessions`, blokada ręcznego eventu i odcięcie po wyjściu. Bez publicznego signupu/RODO/push/e-mail; nie wdrażano na produkcję. Pełny plan: `docs/plan-sprintow-2026-07.md`.

- [ ] CREATE | Zastrzyk charakteru: clay → odwaga terracotty → duotone → audyt vs Revolut/Bolt/Spotify | Wysoki | Ty+Claude | Backlog | — | Wizual / brand | Notatka: 2026-07-12 — decyzja kierunkowa [Ty]: minimal à la Revolut + brand w momentach = potwierdzenie architektury dwuwarstwowej, NIE pivot; plan 5 kroków w roadmap backlog (clay W6 najpierw, audyt charakteru dopiero po assetach); ze Spotify bierzemy TYLKO personalizację jako filar charakteru; duotone ODRZUCONE (foto zostaje w retro-analog Warm — decyzja [Ty]); NIE bierzemy też dark/neon/feedu.
- [ ] CREATE | Retro-logging: dopisanie treningu po fakcie | Wysoki | Do decyzji | Backlog | — | Feature | Notatka: 2026-07-12, pomysł [Ty] oceniony TAK — dziura w dzienniku psuje passę/cel (rdzeń retencji); wejście „+ dodaj miniony trening" w /history; edycja daty już jest (S12); guard: retro check-in CICHY dla ekipy (bez powiadomień, tylko korekta passy). Spec: roadmap backlog.
- [ ] CREATE | Kreator awatara (sylwetki/fryzury/zarost, warstwowe SVG) | Niski | Do decyzji | Backlog | — | Wizual / brand | Notatka: 2026-07-12 — v1 = emoji-awatary (decyzja); kreator PO launchu (kombinatoryka assetów = przedlaunchowy scope-creep); styl clay/Warm, unisex; re-ocena po Kroku 4. Spec: roadmap backlog.
- [ ] CREATE | i18n: ekstrakcja stringów (Krok 3) + switcher języka przy ekspansji | Średni | Do decyzji | Backlog | — | Produkt | Notatka: 2026-07-12 — klin „bo po polsku" martwy (Hevy ma PL); ekstrakcja przy Kroku 3 = tanie ubezpieczenie, pełny EN z gate'em etapu 3; PL instrukcje ćwiczeń (S11) bolą bardziej i idą pierwsze. Spec: roadmap backlog.
- [ ] CREATE | Zasady motion w wytycznych designu | Średni | Claude | Done | — | UX | Notatka: 2026-07-12 — wytyczne-designu §2c: animacje tylko w momentach, UI 150–300 ms, prefers-reduced-motion, max 1 animacja spoczynkowa/ekran, bez framer-motion.
- [ ] UPDATE | Miesięczne/roczne podsumowanie (recap/wrap) | Etap→bez zmian | Notatka: 2026-07-12 — [Ty] podbił pomysł (month/year wrap, udostępnianie postępów); spec z roadmapy aktualny: monthly free po launchu, „Rok w żelazie" jako moment Coach (grudzień 2027); share-card = warstwa retro (Gambarino+ziarno) — drugi wiral obok zaproszeń ekipy.

## Ostatni flush: 2026-07-12

Wykonane (7 CREATE; 8 wpisów kolejki zmapowanych na 7 kart — dwa wpisy o Onboardingu v3 scalone w jedną kartę, wg tej samej zasady co flush 2026-07-10):
- „Rename „pody"→„Ekipa" + koncepcja ekipy" (Refinement, Feature).
- „Kalibracja guidance na literaturze" (Refinement, Feature).
- „Onboarding v3: 6 ekranów... — WDROŻONY" (Do testu [Ty], UX/flow) — scalone z projektu-DO-AKCEPTACJI i wdrożenia w jedną kartę.
- „Audyt wizualny + mini-sprint „rymy" WYKONANY" (Do testu [Ty], UX/flow).
- „Landing ZBUDOWANY" (Do testu [Ty], Biznes/strategia).
- „Audyt UX loggera" (Do testu [Ty], UX/flow).
- „Redesign home: FlameWeek + hero + guidance-chip" (Do testu [Ty], UX/flow).
- Mapowanie „Kto wykonuje": Ty+Claude→Wspólnie, Claude→Claude Code (nazwy selectów w bazie). Kategoria: Produkt→Feature, UX→UX / flow, Marketing→Biznes / strategia (najbliższe istniejące selecty, schemat NIE ruszany).

## Ostatni flush: 2026-07-10

Wykonane (17 CREATE + 13 UPDATE; uwagi mapujące kolejkę na realny stan tablicy):
- Dwa wpisy kolejki o S9-cz.2 (plan + kompletny) → scalone w JEDEN wpis „S9-cz.2: higiena kodu — KOMPLETNY" (Do testu [Ty]).
- „Plan landinga" — bez CREATE: zaktualizowany istniejący „Landing page we Framerze" → In Progress, Wysoki (plan + copy + prototyp HTML od Claude).
- „Wizja v2" — bez CREATE: istniejący „Wypracować wizję…" (In Progress) zamknięty jako Done z notą kanonu.
- „Programy zaktualizowane" — bez CREATE: zaktualizowany istniejący „Dodać treningi A i B…" (wdrożone na prod).
- „Kuracja bazy" — bez CREATE: zaktualizowany istniejący „Kuracja bazy ćwiczeń…" Refinement → Do testu [Ty] (wdrożone na prod).
- Kategorie inżynieryjne zmapowane na istniejące selecty (schemat tablicy NIE ruszany — ALTER SELECT ryzykowałby opcje/kolory).
- **Porządki („usuń niepotrzebne")** — zamknięte jako Done z adnotacją-dlaczego (nic nie skasowano twardo): „Deploy na Vercel…" (N1 done + kolejne deploye działają) · „Styl stalowych ikon 3D" (metalik odrzucony → clay) · „Font Athletics" (kierunek Athletic porzucony) · „PWA vs natywne" (rozstrzygnięte w wizji v2) · „Podzielić pracę na user flows" (zastąpione Krokami 0–5) · „Model monetyzacji" (rozstrzygnięty w wizji v2, zostaje A/B pricingu) · „Aktualizacja master promptów" (skonsumowane organicznie przez CLAUDE.md).
- Re-priorytetyzacja wg wizji v2: „Tablica aktywności (nudge)" Niski→Wysoki (ekipy = silnik wzrostu) · „Udostępnianie treningów podopiecznym" Średni→Niski (trenerska odłożona).

## Ostatni flush: 2026-07-06

Wykonane operacje (uwagi mapujące kolejkę na realny stan tablicy):
- „Wypracować styl dużych stalowych ikon 3D" — notatka uzupełniona o paletę v2 (canvas neutralny #F7F7F7, akcent bez zmian #C63F21) + info o nocie NIEAKTUALNE przy torze assetów.
- Reskin Warm v2 — **bez CREATE**: wpis „Sprint N3: reskin Arco Warm" (Do testu [Ty]) już zawierał pełną notatkę v2; zamiast tego **duplikat** „Sprint N3 — Reskin…" (Backlog) zamknięty jako Done z adnotacją DUPLIKAT.
- 2 autorskie programy — **bez CREATE**: zaktualizowano istniejący wpis „Dodać treningi A i B po weryfikacji z trenerem" → Do testu [Ty] + notatka (e56a404).
- Strategia monetyzacji — **bez CREATE**: zaktualizowano istniejący wpis „Model monetyzacji: co premium i w jakiej cenie" → Refinement, Priorytet: Wysoki, pełna notatka (kanon `docs/monetyzacja.md`, R3 rozstrzygnięte: guidance-lite free / full paid, otwarte: pricing).
- Dodatkowe porządki: „Bramka: multi-user, konta i RODO" — notatka o prerekwizycie etapu 1 monetyzacji (R4); „Analiza konkurencji: Gymshark…" → Done; „Analiza Ladder" → Done; „Możliwość wyłączenia przerw" → Do testu [Ty] (zrobione w Sprint 1).
- FYI o zasadzie sync na-żądanie przekazane w rozmowie.
