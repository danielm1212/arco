# Arco — plan sprintów 2026-07 (re-priorytetyzacja po audycie z Notion)

> Wynik przeglądu backlogu właściciela (Notion: „ARCO — Baza pomysłów”) skonfrontowanego z kodem (2026-07-02).
> **Ten plik nadpisuje KOLEJNOŚĆ sprintów** z `sprinty-szczegolowe.md` (S8–S11 bez zmian merytorycznych, przesunięte w czasie).
> Zakresy szczegółowe S6/S7/S8–S11 pozostają w `sprinty-szczegolowe.md` — tu tylko delta + nowe sprinty N1–N2.
> Statusy odhaczaj tutaj ORAZ w Notion (hub „🥇 ARCO — Hub”).

## Dlaczego zmiana kolejności (TL;DR)

1. Wake lock i sygnały końca przerwy **są w kodzie**, ale nie działają po HTTP w LAN (secure context). Właściciel zgłasza je jako bugi → realny fix to **wcześniejszy deploy na HTTPS**, nie kod.
2. W notatkach właściciela jest paczka drobnych UX-owek o wysokim stosunku wartość/koszt — warto je zamknąć jednym sprintem zamiast rozmywać.
3. Decyzja wizualna (Athletic volt vs „niebieski” kierunek z inspiracji) **blokuje tor assetów** (ikony 3D, landing) — trzeba ją wymusić terminem, nie zostawiać „na kiedyś”.

## Kolejność

| # | Sprint | Status |
|---|--------|--------|
| 1 | S6-dokończenie — custom ćwiczenie (wg `sprinty-szczegolowe.md` S6) | ✅ ZROBIONE (`dbc8391`) |
| 2 | **N1 — Deploy-lite (HTTPS)** — nowy, opis niżej | ✅ ZROBIONE 2026-07-05 (`8992b56`) — https://arco-olive.vercel.app; QA na telefonie = **[Ty] do testu** |
| 3 | **N2 — Paczka UX z notatek właściciela** — nowy, opis niżej | ✅ ZROBIONE 1–6, 8–9 (`89d5725`…`3c83e7d`); #7 reorder = opc., nietknięty |
| 4 | **Decyzja wizualna** [Ty] + start toru assetów — opis niżej | ✅ ROZSTRZYGNIĘTA 2026-07-04: „Arco Warm" (terracotta `#C63F21` + krem + ciepła czerń, light default) → wchodzi **Sprint N3** (niżej) |
| 5 | S7 — presety + onboarding (**+ rozszerzenie: imię**, patrz niżej) | ✅ ZROBIONE (`3066d19`; N1 wciąż przed S8+) |
| 6 | **S12 — Sesja i rekordy** (wybrany po S7 przez [Ty], opcja A) | ✅ ZROBIONE — mini-bar (9401708), rep-PRs+hint+celebracja (b17aaca), edycja daty (49904ea); „edycja zapisanego treningu” = Refinement [Ty] |
| 7 | **S13 — Postępy jako lustro + picker** | ✅ ZROBIONE — Muscle Split (85c2cfa), delta-karty+interpretacje (33538bd), picker Recent+multi+📈 (88a8c6e); tabela setów pod heatmapą = już było (Done) |
| 8 | **S14 — Empty states + pierwsze wrażenie** | ✅ ZROBIONE (a555d18 copy+CTA wg docs/archive/empty-states-copy.md, 847e25b skeletony+offline); copy do ew. podmiany [Ty] |
| 9 | **S8 — audyt bazy ćwiczeń** | ✅ ZROBIONE (fbb45fc) + **kuracja WYKONANA 2026-07-08 i WDROŻONA lokalnie 2026-07-10** (`7a32391`: +32 ćwiczenia → 905, `hidden` na 140, programy wg zamysłu trenera, testy Preview zielone — `docs/audyt-bazy-cwiczen.md` §5; **remote deploy czeka na token [Ty]**) |
| 10 | **S9 — audyt kodu/zależności** | ✅ część 1 (0332493, `docs/audyt-kodu-zaleznosci.md`) — patche minor + smoke naprawione 3/3; majory = Refinement [Ty]; higiena (Logger split, N+1, paginacja) = część 2 |
| 11 | **N3 — Reskin „Arco Warm"** | ✅ ZROBIONE (ec10f19) — tokeny/logo/jasny default/day-pills/elevation; logger jasny → decyzja forced-dark po teście [Ty] |
| 12 | **S9-cz.2 (higiena)** | ✅ ZROBIONE W CAŁOŚCI 2026-07-10 (`a0fdecf` paczki 1–2 · `fcf8669` split Logger 768→249 + memo · `dbce3fa` split progress + dynamic heatmapa) — Lighthouse 95/95/95 ≥ budżetu, raport: HANDOFF wpis X; **push wstrzymany do migracji remote [Ty]** |
| 13 | **S10 (offline+longevity)** | ✅ ZROBIONE 2026-07-11 (`43b1792`) — offline-guardy swap/add/skip, CSP Report-Only, checklista longevity 6/6 (`sprinty-szczegolowe.md`), RLS re-check 11/11 |
| 14 | S11-domknięcie (launch) | Next 16+React 19 ✅ ZROBIONE 2026-07-12 (`97405b8`, `docs/audyt-kodu-zaleznosci.md` §2); zostają: self-host obrazków, plan backupów+test restore, CSP enforce, PL tłumaczenia, app icon |

---

## Decyzja właściciela 2026-07-13 — kolejność po przeglądzie repo

> **Wiążąca sekwencja:** najpierw jakość i ochrona danych, potem test z ludźmi, a następnie publiczny fundament kont/RODO. **Ekipa wchodzi jako Krok 4 — fast-follow po launchu**, nie jako samotna funkcja dla obecnego single-account. To zachowuje kanon `wizja-i-plan-produktu-v2.md` i nie buduje socialu bez bezpiecznego multi-user.

| Kolejność | Pakiet | Wynik / bramka |
|---|---|---|
| 1 | **Higiena React 19** | Usunąć 12 błędów lint i 3 ostrzeżenia; zachować zachowanie loggera, timerów i offline. `npm run lint` oraz build mają przechodzić. |
| 2 | **Automatyczna jakość** | ✅ GOTOWE LOKALNIE 2026-07-13. CI sprawdza lint, testy jednostkowe, bazę treningową, rekomendacje i build. Drugi tor uruchamia odizolowany Supabase oraz testuje główny przepływ, rekordy, zapis offline i RLS Ekipy. Workflow ruszy na GitHubie po wysłaniu zmian. |
| 3 | **Domknięcie S11** | Backup produkcyjny + realny test restore, CSP z Report-Only do enforce po sprawdzeniu, decyzja/wykonanie self-hostu obrazków oraz pozostałe drobne elementy launch gate. |
| 4 | **H2 — testy 3–5 osób** | Przeprowadzić scenariusz z `scenariusz-h2.md`, w tym moduł WTP i moduł „czy masz swojego Radka?”. Zsyntetyzować findings i przejść bramkę B1 przed kosztowną rozbudową. |
| 5 | **Krok 2 — konta, RODO i multi-user** | Publiczny signup/weryfikacja/reset, eksport i usunięcie danych, polityki/regulamin, limity nadużyć, audyt RLS na dwóch kontach oraz zgoda na udostępnianie aktywności w Ekipie. To twardy prerekwizyt Ekipy. |
| 6 | **Krok 3 — cichy launch freemium** | Wypuścić pełny, uczciwy model freemium; zebrać pierwsze dane o aktywacji i konwersji bez budowania dodatkowego socialu za wcześnie. |
| 7 | **Krok 4 — Ekipa** | Zbudować i dogfoodować moduł wg planu niżej; po trzech tygodniach ocenić pętlę metrykami B3. |

### Sprint „Automatyczna jakość” ✅ gotowy lokalnie 2026-07-13

- Workflow `.github/workflows/quality.yml` działa na pushach i pull requestach do `main`, a starsze uruchomienie dla tej samej gałęzi jest automatycznie anulowane.
- Tor statyczny obejmuje lint, 8 testów krytycznych reguł guidance, walidację 907 ćwiczeń i 8 planów, macierz 36 profili rekomendacji oraz build produkcyjny.
- Tor integracyjny uruchamia świeży, odizolowany Supabase i wykonuje smoke testy głównego przepływu, rekordów i zamian, kolejki offline oraz prywatności i RLS Ekipy.
- Testy integracyjne używają wyłącznie kont i danych tworzonych na czas testu. Nie łączą się z produkcją.
- Lokalnie cały zestaw smoke przeszedł poprawnie. Pierwsze wykonanie na infrastrukturze GitHub pozostaje bramką po wysłaniu zmian do repozytorium.

### Krok 4 — zakres implementacji „Ekipy”

1. **Fundament danych i prywatności:** migracje `pods`/`pod_members`/`activity_events`/reakcji/nudge, zgody oraz RLS z testami wielokontowymi. Nie odczytujemy `sessions` między użytkownikami.
2. **Rdzeń pętli:** utworzenie ekipy, zaproszenie i dołączanie, limit 6 osób/3 ekipy, automatyczny prywatny check-in po ukończeniu treningu oraz karta Ekipy na home.
3. **Miejsce w aplikacji:** ekran `/ekipa`, przełącznik ekip, emoji-awatary, czytelne stany puste/martwe i zarządzanie członkostwem zgodne z `ekipa-koncepcja.md`.
4. **Wsparcie od znajomych:** reakcje 💪🔥👏🎯 i kontekstowy nudge z limitami antyspamowymi; najpierw skrzynka w apce, później push/e-mail zgodnie ze zgodami i quiet hours.
5. **Dogfooding i decyzja:** pierwsza ekipa Daniela od dnia wdrożenia, trzy tygodnie obserwacji oraz ocena zaproszeń, aktywności i nudge'y względem B3. Bez feedu, czatu, komentarzy, porównań ciężarów ani zdjęć.

Szczegóły produktu: `ekipa-koncepcja.md`; schemat, zgody i RLS: `projekt-schematu-subs-consents-pods.md`; walidacja: `scenariusz-h2.md` i `concierge-test-ekip.md`.

### Wyjątek developerski 2026-07-13 — Ekipa przed Krokiem 2

Na polecenie właściciela zbudowano **dev-v0 Ekipy dla istniejących kont testowych**, bez otwierania rejestracji. Obejmuje: prywatne grupy, kody zaproszeń, limit 6 osób/3 ekip, jawny profil emoji i zgodę, check-in po ukończeniu treningu, reakcje, ograniczony nudge ze skrzynką odbiorcy, ekran `/ekipa`, kartę home oraz zarządzanie członkostwem. Migracje są zastosowane **wyłącznie lokalnie**. `npm run smoke:team` potwierdza lokalnie na trzech tymczasowych kontach RLS, brak odczytu `sessions`, blokadę ręcznego check-inu i natychmiastową utratę dostępu po wyjściu. Nie zmienia to sekwencji publicznej: przed deployem wieloużytkownikowym nadal trzeba dostarczyć pełne konta/RODO, rejestr zgód, rate limiting, audyt RLS na prawdziwych kontach oraz kanały dostarczania nudge.

### Sprint P1 — jakość planów i bazy ćwiczeń ✅ lokalnie 2026-07-13

- Poprawność bazy: glute bridge nie uruchamia timera; `machine` nie wpada w pull przez substring `chin`; wszystkie 767 widocznych ćwiczeń mają movement pattern.
- Poprawność presetów: sprzęt zgodny ze środowiskiem, brak fixed reps blokujących double progression, realny vertical pull w Home, wersje bodyweight bez rekordów hantlowych, core w Advanced PPL.
- Home FBW 2×: 20+20 serii zamiast 28+27, zakresy powtórzeń i realniejszy czas 45–60 min.
- Guard: `npm run validate:training` — 0 błędów, placeholdery jako jawne ostrzeżenia; lint celowany i build ✓.
- Bezpieczeństwo danych: `npm run seed` synchronizuje po istniejących pozycjach, zachowuje ID oraz aktywny program; nie wykonuje automatycznych DELETE i zatrzymuje się przy nadmiarowych dniach/slotach.
- Status: zastosowane lokalnie (907 ćwiczeń, 8 programów, 173 sloty); remote świadomie nietknięty. Następny pakiet produktowy = P2 recommendation engine po QA P1 na telefonie.

### Sprint P2 — silnik rekomendacji i metadane programów ✅ lokalnie 2026-07-13

- Model: `cycle_days` oddzielone od `frequency_min/max`; zachowane legacy `days_per_week` do stopniowej migracji konsumentów. Systemowe presety mają stabilne slugi, wersję treści, środowisko, poziom 1–3, czas i sprzęt.
- Copy/UI: nazwa opisuje cykl zamiast fałszywej recepty „N×”; biblioteka pokazuje cykl, zakres dni/tydz. oraz czas. Onboarding pokazuje „Dopasowany plan” albo uczciwe „Najbliższy plan w bibliotece”.
- Scoring: twarda zgodność środowiska; poziom + cel 2–5 + wymagany sprzęt; plan wymagający większej liczby dni niż deklarowany cel dostaje mocniejszą karę niż krótszy wariant.
- Profil: onboarding zapisuje `available_equipment` z wybranego środowiska wraz z jednostką, celem i imieniem.
- Instrumentacja: `program_recommended`, exact/fallback, `weekly_goal`, `program_slug`; aktywacja z onboardingu jest jawnie mierzona. Adapter nadal no-op poza dev do decyzji o PostHog.
- Guard: `npm run validate:recommendations` sprawdza 36 kombinacji poziom × środowisko × cel. Wynik 36/36; żaden domowy profil nie dostaje planu z siłowni, a advanced 4–5 dni nie dostaje PPL 6×.
- Weryfikacja: migracje `20260713170000` i `20260713171000` + bezpieczny seed lokalnie; 907 ćwiczeń / 8 programów / 173 sloty, aktywny program zachowany; training 0 błędów (20 znanych placeholderów), lint ✓, build ✓, główny smoke ✓, mobilny podgląd `/programs` ✓, błędy konsoli 0, konto testowe sprzątnięte. Remote nietknięty.

### Sprint P3 — domknięcie gridu programów ✅ lokalnie 2026-07-13

- Dodane 3 kuratorowane presety: Intermediate Bodyweight FBW (cykl 3 dni, 3–4×/tydz.), Advanced Home Upper/Lower (cykl 4 dni, 4–5×/tydz.) i Advanced Bodyweight Upper/Lower (cykl 4 dni, 3–4×/tydz.).
- Biblioteka: 8→11 programów, 173→246 slotów, 76→88 unikalnych ćwiczeń w presetach. UI grupuje karty na Początkujących / Średniozaawansowanych / Zaawansowanych.
- Programowanie: 21–27 serii na sesję, zakresy double progression, RIR 1–2; home obchodzi load ceiling unilateralem/tempo/pauzą, bodyweight progresuje leverage. Zaawansowane skille planche/front lever świadomie poza zakresem.
- Scoring: 6 nowych exact-match — intermediate bodyweight 3/4, advanced home 4/5, advanced bodyweight 3/4. Kara za plan wymagający więcej dni wzrosła, więc cel 2 dni wybiera bezpieczniejszy dostępny fallback.
- Semantyka: Decline Push-up, Inverted Row i Scapular Pull-up są logowane jako bodyweight, nie ćwiczenia z kilogramami. Detal planu pokazuje `cykl N dni` i niezależne `X–Y dni/tydz.`.
- Sprzęt: wybór „Masa ciała” w onboardingu jawnie zakłada drążek, zapisuje `pull-up bar`, a presety bodyweight wymagają go w metadanych; ustawienia dostały osobną pozycję „Drążek”.
- Dokumentacja źródłowa: 3 nowe pliki w `docs/trainings/`; README gridu zaktualizowany z 6 do 9 flagowych planów (11 łącznie z FBW 2-dniowymi).
- Weryfikacja lokalna: 907 ćwiczeń / 11 programów / 246 slotów / 88 ćwiczeń użytych; training 0 błędów, 43 wystąpienia placeholdera obejmujące 16 ćwiczeń; rekomendacje 36/36; lint ✓, build ✓, smoke ✓, mobilny Preview biblioteki i detalu ✓, świeży log konsoli 0 błędów. Seed zachował ID i aktywny program. Nowa migracja niepotrzebna; remote nietknięty.
- Do QA [Ty]: realność trudności Handstand Push-up, Nordic i One-Arm Push-up; komunikat o drążku; 3- vs 4-dniowe rolowanie cyklu bodyweight.

---

## Sprint N1 — Deploy-lite (HTTPS teraz, pełny launch później)

**Cel:** apka chodzi na HTTPS (Vercel + Supabase cloud), żeby odblokować wake lock, wibracje, instalację PWA i testy poza LAN. To NIE jest pełny Sprint 11 — launch gate (checklista longevity, self-host obrazków, PL tłumaczenia, app icon) zostaje w S11.

**[Ty]:**
- Konto Supabase cloud + Vercel; klucze do env prod (service-role tylko na serwerze).

**[Claude]:**
- `supabase link` → `db push` (wszystkie migracje) → seed + bootstrap usera z env prod.
- Vercel: import repo, env (`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` server-only, `ADMIN_EMAIL/PASSWORD`).
- Mini-gate bezpieczeństwa (podzbiór S10): service-role poza bundlem klienta, RLS włączone na wszystkich tabelach usera, świeży start danych.
- Obrazki: na razie zostaje hotlink (świadomie; self-host = S11).

**QA po deployu (zamyka wpisy z Notion):**
- [ ] Wake lock: ekran nie gaśnie podczas sesji na telefonie (HTTPS).
- [ ] Koniec przerwy: beep 3-2-1 + wibracja na Androidzie (iOS: brak wibracji — expected, sprawdzić czy beep wystarcza).
- [ ] Instalacja PWA + działanie offline.
- [ ] Wyszukiwarka ćwiczeń na realnych danych (limit 2 znaków, nazwy EN) — werdykt: bug czy UX do poprawy.

**Done:** apka na własnym URL HTTPS, wake lock + sygnały przerwy potwierdzone na telefonie, QA odhaczone w Notion.

**✅ Zrobione 2026-07-05 (`8992b56`):** GitHub (`danielm1212/arco`, SSH) · Supabase cloud link+migracje(14)+seed(873 ćwiczeń/8 programów)+bootstrap konta, region **eu-central-1 (Frankfurt)** · Vercel (`arcoapp/arco`, auto-deploy z GitHub, region **fra1**, 5 zmiennych prod, `ADMIN_PASSWORD` nowo wygenerowane — NIE dev). **URL: https://arco-olive.vercel.app** (zweryfikowany: /login 200, manifest 200). Ops-notatka: URL z hashem deploya jest za Vercel SSO — zawsze używać stałego aliasu `arco-olive.vercel.app`. QA checklist wyżej → 3 wpisy w Notion na „Do testu [Ty]".

---

## Sprint N2 — Paczka UX z notatek właściciela

> Źródło: notatki właściciela (Notion, Faza 1). Drobne, wysokie value/cost. Każdy punkt osobny commit + weryfikacja w Preview.

**[Claude]:**
1. ✅ (`89d5725`) **Pełna nazwa programu** — `break-words` zamiast `truncate`; zweryfikowane: żadna z 6 nazw nie ucięta.
2. ✅ (`f2b5e60`) **Podgląd ćwiczeń w programie** — widok preset pokazywał już dni+ćwiczenia; dodane ⓘ „jak wykonać" (ExerciseInfoSheet) na każdym ćwiczeniu.
3. ✅ (`cf87d88`) **Podgląd treningu bez sesji** — link „Zobacz ćwiczenia (bez startu) →" w hero + nazwa aktywnego programu jako link do read-only widoku.
4. ✅ (`3c83e7d`) **Bug ⓘ po podmianie** — hard-fix: `key={exerciseId}` na ExerciseInfoSheet (remount po swapie); zweryfikowane E2E (swap → sheet pokazuje nowe ćwiczenie).
5. ✅ (`3c83e7d`) **Swap przy nazwie** — trigger „⇄ Podmień" w nagłówku karty obok Pomiń/Usuń (SwapPanel kontrolowany), panel pod nagłówkiem.
6. ✅ **QA superserii** — E2E w Preview: łączenie (SS-badge na obu kartach) i rozłączanie czyste; nic się nie wysypało, zero zmian kodu.
7. ⏸ (opc.) **Reorder ćwiczeń w sesji** — nietknięty (świadomie; wróci przy S12 „sesja globalna" albo na życzenie).
8. ✅ **Guard porzucenia sesji** — audyt ścieżek: „Usuń sesję" ma confirm; „Zakończ" ma confirm przy niezaliczonych; wyjście „←" nie porzuca (sesja resumowalna z home „Wznów trening"). Anty-wzorca Hevy u nas nie ma — zero zmian kodu.
9. ✅ (`3c83e7d`) **Rest-timer nie blokuje edycji** — potwierdzone (bar to fixed bottom, tabela dostępna; edycja serii podczas odliczania działa) + fix: `pb-28` na main przy aktywnej przerwie, żeby bar nie zasłaniał dolnych wierszy.

**[Ty]:** szybki test na telefonie po każdej paczce; screeny do rzeczy, które nadal uwierają.

**Done:** punkty 1–6 zweryfikowane w Preview + na telefonie, wpisy w Notion na Done.

---

## Decyzja wizualna [Ty] — gate dla toru assetów

**Pytanie:** zostajemy przy „Arco Athletic” (dark + volt/lime + metalik z Horyzontu 3) czy skręcamy w kierunek z inspiracji właściciela (niebieskie kolory, duża/mała typografia, bardzo dynamiczny interfejs)?

- Architektura tokenów (primitive→semantic) robi **reskin kodu tanio** — ale **assetów AI (ikony 3D) tanio się nie przerobi**. Dlatego decyzja MUSI zapaść przed torem A assetów.
- Możliwa hybryda: zostaje dark+metalik, akcent do rozstrzygnięcia (volt vs blue) — wtedy tor ikon 3D (stal/srebro) jest bezpieczny niezależnie od akcentu.
- Po decyzji: [Claude] aktualizuje wartości tokenów (jeśli zmiana) + dopisuje werdykt do `CLAUDE.md` (sekcja „Kierunek wizualny”) i addendum v0.4.

**Done:** werdykt zapisany w `CLAUDE.md` + Notion; tor A assetów (prompty w `sprinty-szczegolowe.md`) odblokowany.

> ✅ **WERDYKT (2026-07-04):** „Arco Warm" — terracotta `#C63F21` + krem `#F6F2ED` + ciepła czerń `#1E1C1A`, **default jasny**, logo/favicon dostarczone w `../logo/`. Pełna specyfikacja: `CLAUDE.md` sekcja „Kierunek wizualny". Wdrożenie: Sprint N3 niżej. Tor ikon 3D: stal + ciepłe światło, spójne z terracottą.

---

## Sprint N3 — Reskin „Arco Warm" [Claude]

> Decyzja właściciela z 2026-07-04. Specyfikacja i paleta: `CLAUDE.md` sekcja „Kierunek wizualny". Inspo elevation/day-pills: mock BytePal od właściciela.

**[Claude]:**
1. **Tokeny:** pełne rampy primitive + mapowanie semantic są GOTOWE w **`docs/paleta-arco-warm.md`** (rust/sand/stone/ink + reguły twarde + kontrasty policzone). Wdrożyć 1:1. Zero zmian w komponentach — tylko wartości tokenów.
2. **Default motyw jasny** (`next-themes` defaultTheme) + **zdjęcie forced-dark z loggera** — logger dostaje wersję jasną; toggle zostaje.
3. **Logo + favicon z `../logo/`:** kopiowanie do `public/`, `<link rel="icon">` (SVG + PNG fallback), manifest PWA z maskable icon (wariant z marginesem), apple-touch-icon; logo do headera/login/celebracji tam, gdzie dziś tekst „Arco".
4. **Elevation rule:** canvas przyciemniony o ton względem tile'ów; tile = białe/jaśniejsze karty, radius-xl, miękki cień, bez ramek 1px. Przejść po hubach i ujednolicić.
5. **Day-pills home wg inspo:** odhaczone dni (✓), „dziś" jako filled pill, przyszłe wygaszone — minimalistycznie.
6. Weryfikacja WCAG AA po podmianie (terracotta jako tekst tylko `#C63F21`+ciemniejsze; jaśniejsze tylko jako fill).

**[Ty]:** test na telefonie (szczególnie logger w wersji jasnej — decyzja, czy forced-dark wraca jako opcja w ustawieniach); ewentualna korekta tonu canvas vs tile.

**Done:** apka w palecie Warm na wszystkich ekranach, logo/favicon wpięte, build + Preview czyste, WCAG AA, wpisy w Notion zaktualizowane.

---

## S7 — rozszerzenie zakresu (delta do `sprinty-szczegolowe.md`)

Do istniejącego zakresu (presety PPL/UL + onboarding doświadczenie → sugestia planu) **dochodzi:**
- **Imię użytkownika** w onboardingu (`user_settings.display_name`) + powitanie na home („Cześć, {imię}”).
- Cel tygodniowy ustawiany w onboardingu (dziś default 2 w `user_settings` — dać wybór przy starcie, nie tylko w ustawieniach).

---

## Delta 2026-07-02 (wieczór) — pakiety z analizy Hevy

> Po analizie `docs/konkurencja-hevy-ux.md` (ekrany + warstwa funkcjonalna) dopisane: punkty 8–9 do N2 (wyżej) oraz **trzy nowe sprinty S12–S14** (zakresy w `sprinty-szczegolowe.md`):
> - **S12 — Sesja i rekordy:** sesja jako obiekt globalny (mini-bar „Trening w toku"), rep-PRs zasilające guidance, mikro-celebracja PR w sesji, edycja daty sesji.
> - **S13 — Postępy jako lustro + picker:** nagłówki-interpretacje nad wykresami, delta-karty, Muscle Split, tabela setów pod heatmapą; picker: Recent + multi-select + link do progresu.
> - **S14 — Empty states i pierwsze wrażenie:** każdy pusty ekran = obietnica wartości + następny krok; skeletony, stan offline.
>
> **Propozycja wpięcia [Ty zatwierdzasz]:** S12 i S13 po S7 (to rdzeń wyróżnika — guidance dostaje paliwo i widoczność, spójnie z regułą „guidance przed Horyzontem 5" z roadmapy), S14 przed S11/launchem (pierwsze wrażenie musi być gotowe na testy userów H2). Audyty S8–S10 mogą iść równolegle/po — decyzja przy planowaniu po S7.
> Wpisy dodane też do Notion „ARCO — Baza pomysłów" (Backlog, z odnośnikami do numerów matrycy).

## Poza kolejnością (przypomnienia)

- **Master prompty:** project prompt w Claude do odświeżenia (kickboxing porzucony, praca sprintami, 6 programów od trenera zamiast starej matrycy). Po decyzji wizualnej → `build-brief-v0.4-addendum.md`.
- **Bramka multi-user + RODO** (roadmap) — warunek dla udostępniania podopiecznym, publicznej bazy planów, socialu i monetyzacji. Nie zaczynać, ale nie podejmować decyzji architektonicznych, które ją utrudnią.
- **Tor assetów B** (AI-podratowanie zdjęć, licencja potwierdzona: Unlicense) — wchodzi przy self-hoscie obrazków (S11/H3).
