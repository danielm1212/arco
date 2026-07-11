# Arco — sprinty szczegółowe (wykonawcze)

> Rozpisanie Horyzontu 1 z `roadmap.md` na konkrety. Podział: **[Claude]** = robię ja, **[Ty]** = Daniel (decyzje/treść/assety).
> Assety (ikony, zdjęcia) mają długi lead-time — **ruszaj je równolegle już teraz** (sekcja „Tor assetów").
> Data: 2026-06-25.
> ⚠️ **Kolejność sprintów od 2026-07-02 nadpisuje `plan-sprintow-2026-07.md`** (deploy-lite N1 + paczka UX N2 wchodzą po S6, przed S7). Zakresy S6–S11 tutaj pozostają aktualne.

## Walidacja planu (zanim ruszymy)
1. **Offline-correctness niesie ryzyko utraty danych** — `product-audit` stawiał to jako Phase 5 „nie trać danych". W naszym planie to Sprint 5 (późno). **Korekta:** 2 krytyczne rzeczy (flush outboxa przed „Zakończ" + fix kolizji `set_index`) **przesuwam do Sprintu 1**. Reszta porządków kodu zostaje w Sprincie 5.
2. **Onboarding „doświadczenie → sugestia planu" (Sprint 4) jest zablokowany** dopóki nie ma więcej presetów — trzymamy oba razem; bez presetów punkt nie ma sensu.
3. **Ekran po treningu (Sprint 2)** zależy od flow „Zakończ" — sprawdzę, dokąd dziś prowadzi finish (do historii?) i wepnę ekran przed tym.
4. **Wake lock** działa na localhost (secure context), więc testowalny przed deployem; pełne PWA (wibracje/instalacja) dopiero po HTTPS (Sprint 6).
5. Kolejność reszty OK: 1 (jakość) → 2 (wow) → 3 (retencja) → 4 (głębia) → 5 (kod) → 6 (launch).

---

## Sprint 1 — ✅ ZROBIONE (`2c61bd6`)
**Cel:** logger bez ostrych kantów; zero ryzyka utraty danych przy kończeniu.
Wynik: fix tooltipa po swapie · podpis pokazuje sprzęt nowego ćwiczenia · koniec przerwy = pasek „Przerwa skończona 💪" przez 4s · wake lock + toggle · zwijana notatka · wyłączanie auto-przerwy. Poprawność (flush przed finish, max+1 set_index) już istniała (audyt nieaktualny).
**[Claude]:**
- Fix bug: tooltip ⓘ nie odświeża się po swapie (`useEffect([exerciseId])` czyści cache w `ExerciseInfoSheet`).
- Podpis ćwiczenia po swapie: pokazuj dane nowego ćwiczenia, nie stary slot-note.
- Koniec przerwy: odliczanie 3-2-1 + wyraźny sygnał „Przerwa skończona" (wizual + dźwięk/wibracja gdy app aktywna).
- Wyłączanie auto-przerw w ustawieniach (+ kolumna pref albo localStorage).
- Zwijana notatka („+ notatka" zamiast zawsze otwartego pola).
- Wake lock + toggle w ustawieniach (`navigator.wakeLock`).
- **Poprawność:** flush outboxa przed `finishSession`; fix kolizji `set_index` (`handleAddSet` używa `length` — użyć max+1).
**[Ty]:** decyzja — czy „Przerwa skończona" ma też krótki dźwięk domyślnie (czy tylko wibracja)?
**Done:** każdy punkt zweryfikowany w Preview; finish nie gubi wiszących serii.

## Sprint 2 — Celebracja + cel — ✅ ZROBIONE (`2bcee59` + `040e25c`)
Ekran po treningu (hero „tyle dziś uniosłeś" + rotujące nagłówki per stan + pasek statów + CTA), `finishSession`→/done, cel tygodniowy (migracja `weekly_goal`, wybór w Settings, postęp „X/Y 🎯" na home), **„last set" inline per wiersz** (↺ tap=kopiuj). (opc. slide-to-confirm — pominięte, niskie ROI.)
**Cel:** moment nagrody po treningu + powód, by wracać. To prototyp kierunku wizualnego.
**[Claude]:**
- **Ekran po treningu** (`/session/[id]/done` lub modal): gratulacje + 💪, wielkie dane (czas / serie / objętość / nowe PR), 1-zdaniowe podsumowanie. Wielka display-typografia (wzorzec Nike/Ladder), volt.
- Po podsumowaniu: „Wróć do Treningu" + (jeśli program) „Następny dzień".
- Ustawienie celu (np. 2 treningi/tydz.) — w ustawieniach/onboardingu; postęp na home (mamy „X/Y").
- „Last set" inline per wiersz („60×8 →", tap = kopiuj do pola) — dane są w `previousSets`.
- (opc.) slide-to-confirm „Zakończ trening" (gest + anty-mistap).
**[Ty]:**
- **Copy celebracji** (ton: motywujący, krótki, PL) — np. nagłówki przy nowym PR vs zwykłym treningu.
- Decyzja: domyślny cel tygodniowy (2? 3?).
- (opc.) assety do celebracji — patrz „Tor assetów" (3D hero / 💪).
**Done:** zakończenie treningu pokazuje ekran z danymi; cel widoczny na home.

## Sprint 3 — Retencja widoczna — ✅ ZROBIONE
**Cel:** „wracasz codziennie" + wizualny wyróżnik.
- ✅ Kalendarz miesięczny + passa (streak) na /history — `218f578` (`components/MonthCalendar`).
- ✅ Heatmapa-sylwetka na /progress — `698ea2e` (anatomiczna, `react-body-highlighter` MIT, front/tył, ostylowana na volt/dark; `lib/muscleMap` mapuje `primary_muscles`→slugi).
**[Ty] — do potwierdzenia:** mapa `primary_muscles` → mięśnie biblioteki (`lib/muscleMap.ts` `DB_MUSCLE_TO_SLUGS`). Domyślna jest sensowna; skoryguj jeśli coś nie pasuje (np. lats→upper-back).

> Strategia wyróżnika od S4: `docs/konkurencja-hevy.md`. Rdzeń „anti-Hevy" = frictionless logging + rule-based guidance + kameralny social.

## Sprint 4 — Picker & szybki wpis (frictionless) — część [Claude] ✅ ZROBIONE (`f881bb2`)
**[Claude]:**
- ✅ Filtry w pickerze: partia / sprzęt / wzorzec (chipy). **Wspólny `ExerciseBrowser`** dla add (`ExercisePicker`) i swap (`SwapPanel`). W swapie ranking `getSubstitutes` zostaje domyślny, chipy/search pozwalają wyjść poza 5 kandydatów (upgrade — wcześniej się nie dało). Mapowania w `lib/exerciseFilters.ts` (jedno źródło; biceps/triceps osobno — decyzja właściciela; sprzęt dumbbell-first).
- ✅ Stoper dla `timed` (plank): **odliczanie do celu** (decyzja właściciela) — cel z poprzedniej sesji lub wpisany, sygnał 3-2-1+koniec, zegar z `endAt` (odporny na throttling), Stop wcześniej = zapis faktycznego czasu (`TimedStopwatch` + atomowy `handleTimedComplete` w Logger).
- ✅ Frictionless: „same as last" działa jednym tapem (`handleAddSet` seeduje z ostatniej serii + „↺ {prev}" tap-to-copy w `SetRow`) — już było, potwierdzone.
**Zweryfikowane w Preview:** filtry (Nogi+Hantle=14), swap Dumbbell→Barbell Squat, stoper planku do zera → seria zaliczona + auto-przerwa. Build czysty, 0 błędów konsoli.
> Uwaga ops: lokalny `NEXT_PUBLIC_SUPABASE_URL` w `.env.local` (gitignore) zaktualizowany na bieżący LAN IP **192.168.100.53** (stary `.16` był down — `EHOSTDOWN`). Sprawdzaj `ipconfig getifaddr en0` przy zmianie sieci.
**[Ty] — do potwierdzenia:** grupowanie partii i etykiety sprzętu w `lib/exerciseFilters.ts` (np. czy `forearms`/`traps` mają zostać w „Plecy"). Łatwo edytowalne.

## Sprint 5 — Guidance rule-based (RDZEŃ wyróżnika) — Faza A ✅ ZROBIONE (`e9cb7f1`)
> Jawne, nadpisywalne reguły na TWOIM programie. NIE „AI auto-programming". Profil progów: **standardowy** (decyzja właściciela).
**[Claude] — Faza A (zrobione):**
- ✅ Rozszerzony hint progresji (`lib/guidance.ts` `progressionHint`): pełny zakres → +obciążenie; **poniżej zakresu → utrzymaj ciężar, dobij powt.**; `timed` → pobij czas. Logger czyta z lib (wspólne źródło).
- ✅ Flagi balansu push/pull (`balanceFlags`, próg <60% w bieżącym tygodniu, min 4 serie anti-noise).
- ✅ Staleness partii (`stalenessFlags`, ≥8 dni; „Nogi: 9 dni temu — czas na trening").
- ✅ Karta „Wskazówki" na home (max 2 flagi, staleness przed balansem; link na /progress). Mapowanie mięsień→kategoria w `lib/guidance.ts` `MUSCLE_CATEGORY`.
- Progi jako nazwane stałe `GUIDANCE` (zero magic numbers). Każda flaga = podpowiedź, nie blokada.
**[Claude] — Faza B ✅ ZROBIONE (`1eb6969`):**
- ✅ Sugestia deloadu (`deloadFlags`, próg `GUIDANCE.deloadSessions=3`): stagnacja metryki (e1RM/powt./czas) przez ≥3 sesje ćwiczenia → „rozważ lżejszy tydzień". Max 1 flaga (najmocniejsza), priorytet staleness>deload>balans. Ikona 📉.
- (opc., zostaje) per-user kalibracja progów (dziś profil standardowy zaszyty w `GUIDANCE`).
**[Ty]:** obserwuj flagi w realnym użyciu → powiedz czy progi/agresywność OK (czy trafne, nie męczące).
**Zweryfikowane w Preview:** staleness „Nogi 9 dni" + balans „Mało pull (6/0)" + hint „poniżej zakresu" (Faza A) · deload „Dumbbell Bench Press: 3 sesje bez postępu" + guard balansu min 4 serie (Faza B). Build czysty, 0 błędów konsoli.

## Sprint 6 — Programy startowe: audyt + nowy zestaw + custom ćwiczenie
**[Claude]:**
- ✅ **Analiza balansu FBW z danych** (`docs/audyt-fbw.md`, `d8e778a`) — push>pull, dziury (łydki/lats/glutes), stałe powt.; + flaga ślepych plam mapowania → korekty `EXERCISE_CATEGORY_OVERRIDE` (`e3887ee`).
- ✅ **Nowy kuratorowany zestaw 6 programów** (`docs/trainings/` od trenera → seed, `ce53b29`): grid poziom×środowisko (beginner gym/dom/masa · intermediate gym/dom · advanced gym). Zastąpił stare 7. Mapowanie 141 slotów + podmiany braków: `docs/trainings-mapowanie.md`. Domyka wszystkie uwagi audytu (pion pull, łydki, pośladki, zakresy powt.). Aktywny domyślnie: „Dom z hantlami".
  - ⚠️ Braki bez odpowiednika: **brak DB hip thrust** w bazie (użyto Glute Kickback bodyweight) — kandydat na custom ćwiczenie. „na czas" glute bridge też → Glute Kickback.
- ⏳ **Custom ćwiczenie** (zostaje): tabela user-exercises (`user_id`), CRUD w pickerze (jak Bevel „Add custom") — **z własnym opisem i zdjęciami** (Supabase Storage). (Udostępnianie innym = Horyzont 5.)
**[Ty]:** dopracowanie FBW jako trener (rekomendacje w `docs/audyt-fbw.md` §5); ew. konsultacja 5 podmian z trenerem (`docs/trainings-mapowanie.md`).
**[Ty]:** dopracowanie programowania FBW (jako trener) na bazie mojej analizy.
**Done:** FBW zaudytowane i poprawione; można dodać własne ćwiczenie z opisem + zdjęciami.

## Sprint 7 — Więcej presetów + onboarding — ✅ ZROBIONE (`3066d19`)
- Presety: zamknięte przez **6 programów od trenera** (S6, grid poziom×środowisko) — punkt „treść PPL/UL [Ty]" nieaktualny.
- ✅ Onboarding v2 (`WelcomeOverlay`, flag `arco-onboarded-v2`): imię+jednostki → poziom → środowisko → **polecany program z gridu** + cel tygodniowy → „Ustaw program i zaczynamy". Braki gridu wg README trainings (adv×dom → PPL ze swapami; masa ciała → FBW z twardszą progresją) jako notki przy rekomendacji.
- ✅ Delta z `plan-sprintow-2026-07.md`: **imię** (`user_settings.display_name`, powitanie „Cześć, {imię}" na home, pole w Ustawieniach) + **cel tygodniowy w onboardingu**.
- Zweryfikowane E2E na koncie testowym (admin API, dane właściciela nietknięte).
**[Ty]:** mapowanie gridu w `components/WelcomeOverlay.tsx` (`GRID`) — moja propozycja, nadpisywalna.

## Sprint 8 — Audyt bazy ćwiczeń (#5)
**[Claude]:** skan `scripts/data/exercises.json` (~800 z free-exercise-db): duplikaty/śmieci/dziwne, **martwe obrazki** (sprawdzić HTTP do raw.githubusercontent), poprawność nazw, jakość instrukcji (EN). Propozycja **kuracji** (podzbiór ~150–250 realnie używanych).
**[Ty]:** akceptacja listy do kuracji.
**Done:** baza zweryfikowana/skurowana; zero martwych obrazków w użyciu.

## Sprint 9 — Audyt kodu + zależności
> Stan (2026-06): React 18→**19**, Next 14→**16**, Tailwind 3→**4**, TS 5→**6** (duże majory za nami) + **5 podatności (1 mod, 4 high)**.
**[Claude]:**
- **Bezpieczeństwo:** `npm audit fix` (bezpieczne) + ocena reszty (czy realnie eksploatowalne u nas).
- **Patche minor (bezpieczne):** lucide-react 1.21→1.22, postcss, `@types/*`.
- **Duże majory (React 19 / Next 16 / Tailwind 4 / TS 6):** ocena + **decyzja**. Rekomendacja: **odłożyć do po-launchu** (stabilność rdzenia; brief specyfikował Next 14/React 18) albo robić deliberately jeden po drugim z weryfikacją. Świadoma decyzja, nie dryf.
- **Higiena kodu:** dedup `formatSet`/`Sparkline`; rozbicie `Logger.tsx` (~600 linii); N+1 „poprzednio" + paginacja historii; mniej `as unknown as`.
**[Ty]:** decyzja — wchodzimy w duże majory teraz czy po launchu?
**Done:** 0 known-exploitable vuln; patche minor zrobione; decyzja ws. majorów; kod odchudzony; build/lint czyste.

## Sprint 10 — Offline correctness + audyt longevity — ✅ ZROBIONY 2026-07-11
**[Claude]:**
- ✅ Offline-guard dla swap/add/skip (`lib/offlineGuard.ts`, sygnał zamiast cichego błędu — zweryfikowane w Preview: skip pokazuje toast + nie aplikuje zmiany, add-picker nie wysyła POST offline); reszta correctness (flush/`set_index`) już była.
- ✅ **Checklista audytu longevity** (wg pamięci `proactive-architecture-review`) — wszystko odhaczone 2026-07-11:
  - [x] Zależności: `react-body-highlighter` zwendorowana (`vendor/` + `file:`) ✓. `npm audit`: 5 vuln (1 mod, 4 high), bez zmian od S9 — wszystkie w `next@14`, decyzja majorów [Ty] czeka (S11).
  - [x] Assety: backup `../free-exercise-db` obecny, 197 MB, aktualny.
  - [x] Utrata danych: `smoke-offline` 3/3 zielone (idempotencja/odtwarzalność); offline-guardy dodane wyżej.
  - [x] Migracje: wszystkie 16 lokalnych = 16 na remote (`migration list` bez rozjazdu, potwierdzone przy deployu 2026-07-10).
  - [x] Sekrety: 0 wystąpień `SUPABASE_SERVICE_ROLE_KEY` poza `scripts/`; `.env*` gitignorowane; `.env.ops.local` z deployu usunięty.
  - [x] Przenośność: 0 hardkodowanych hex w komponentach (2 wyjątki uzasadnione: `theme-color` meta w `layout.tsx` musi być raw hex, wartości = dokładnie tokeny sand-100/ink-800).
  > Powtórzyć przed launchem (gate S11) i przy większych zmianach zależności/assetów.
- ✅ CSP Report-Only (`next.config.mjs`) — bonus przeniesiony z `bezpieczenstwo.md` S10-gate, bo naturalnie pasuje do tej samej paczki.
**Done:** brak utraty danych offline; checklista odhaczona. Raport pełny: `docs/bezpieczenstwo.md` §3 (S10 gate) + HANDOFF.

## Sprint 11 — Launch (Phase 10)
**[Claude]:** kod gotowy do deploya; instrukcja krok-po-kroku; PL tłumaczenia top-instrukcji; skeletony tras.
- **Gate:** powtórz checklistę audytu longevity (S10) — must-pass.
- **Uniezależnienie zdjęć od hotlinku:** obrazki na **Supabase Storage / CDN** + przepięcie `IMG_PREFIX` w `scripts/seed.ts` z `raw.githubusercontent.com/yuhonas/...` na własną kopię. Eliminuje link-rot.
**[Ty]:**
- Konto **Supabase cloud** + **Vercel** + (opc.) domena.
- Realne klucze do env prod (service-role tylko serwer).
- **App icon / splash / meta** (patrz „Tor assetów").
- (opc.) fork `yuhonas/free-exercise-db` na własny GH jako backup online.
- Akceptacja PL tłumaczeń.
**Done:** apka na HTTPS, pełne PWA (instalacja, wibracje, wake lock), świeży start danych, **zdjęcia z własnego hostingu (nie hotlink)**.

---

# Sprinty 12–14 — pakiety z analizy Hevy (2026-07-02)

> Źródło: `docs/konkurencja-hevy-ux.md` (analiza ekran-po-ekranie + warstwa funkcjonalna; numery #1–#30 = matryca rekomendacji).
> Kolejność wpięcia: **`plan-sprintow-2026-07.md`** (propozycja tam — [Ty] zatwierdzasz). Drobnica z tej analizy (guard porzucenia sesji, zasada rest-timera) dopisana do Sprintu N2 w tamtym pliku.
> Zasada przewodnia: bierzemy od Hevy ergonomię i głębię danych, NIE bierzemy filozofii (feed, komentarze, leaderboardy, formularz zamiast celebracji).

## Sprint 12 — Sesja i rekordy (Hevy-inspired core)
**Cel:** sesja jako obiekt globalny + rekordy per powtórzenia zasilające guidance. (#1, #2/#30, #24, #26)
**[Claude]:**
- **Sesja jako obiekt globalny:** mini-bar „Trening w toku · ▶ Wróć / ✕ Porzuć" nad nawigacją na każdym ekranie; sesja przeżywa nawigację i restart apki. Porzucenie zawsze z potwierdzeniem (spójnie z undo-toastami).
- **Rep-PRs:** rozszerzenie `personal_records` o wymiar liczby powtórzeń (PR dla 3/5/8/10/12…) + recompute; sekcja „Rekordy per powtórzenia" w detalu ćwiczenia (wzorzec Hevy „Set Records").
- **Guidance na rep-PRs:** `progressionHint` odwołuje się do rep-PR („rekord przy 8 powt.: 22,5 kg — dziś celuj 25").
- **Mikro-celebracja PR w sesji:** wiersz serii dostaje volt-flash + badge „PR" + haptic (po HTTPS) w momencie pobicia — 1–2 s, bez przerywania flow. Peak-end: peak dzieje się przy serii, nie na ekranie końcowym.
- **Edycja daty/czasu sesji** (logowanie po fakcie) — pole „Kiedy" na ekranie po treningu / w historii.
**[Ty]:** decyzja — czy **edycja zapisanego treningu** (serie po fakcie, #25) wchodzi tu czy osobno (koszt: recompute PR + UX edycji historii).
**Done:** sesję można zminimalizować i wrócić z każdego ekranu; PR liczone per powtórzenia i użyte w hintach; PR świętowany w momencie zdarzenia.

## Sprint 13 — Postępy jako lustro (nie rejestr) + picker
**Cel:** /progress odpowiada na pytania usera, nie renderuje tabel — najgłębsza różnica vs Hevy (#27, #7, #8, #9 + picker #4/#5/#6).
**[Claude]:**
- **Nagłówki-interpretacje** nad każdym wykresem /progress, liczone z istniejącego silnika guidance („Wolumen ↑12% vs poprzednie 30 dni — progresja działa", „Pull odstaje trzeci tydzień").
- **Delta-karty:** Treningi / Czas / Objętość / Serie z porównaniem do poprzedniego okresu (volt ↑ / neutralne →).
- **Muscle Split %** (poziome bary) w detalu treningu w historii + na ekranie celebracji — dane z `sets-per-muscle` już są.
- **Tabela setów per partia** pod heatmapą-sylwetką (kolor + liczby = pełny obraz).
- **Picker:** sekcja „Ostatnio używane" na górze · multi-select ze sticky „Dodaj N ćwiczeń" · link do progresu ćwiczenia z wiersza (ikona wykresu).
**[Ty]:** ton copy interpretacji (motywujący vs rzeczowy) + progi „co uznajemy za wzrost" (kalibracja z `GUIDANCE`).
**Done:** każdy wykres ma zdanie-wniosek; picker z Recent + multi-select; celebracja pokazuje Muscle Split.

## Sprint 14 — Empty states i pierwsze wrażenie
**Cel:** każdy pusty ekran = **obietnica wartości + jeden następny krok**, nigdy „brak danych". Hevy jest tu słabe („No data yet", pusty hub po onboardingu) — tania przewaga spójna z TTV < 2 min.
**[Claude] — inwentarz + wdrożenie:**
- **Home bez aktywnego programu / przed 1. treningiem:** hero „pierwszy krok" (wybierz program → „Sugerowane dziś"), nie pusta karta.
- **/history pusta:** kalendarz z ringiem „dziś" + „Twój pierwszy trening pojawi się tutaj" + CTA start.
- **/progress bez danych:** ghost-wykresy (szkielet z przykładowym kształtem — wzorzec „Measure progress" z onboardingu Hevy: pokaż, JAK będzie wyglądać wartość) + „po 2 treningach zobaczysz trendy"; heatmapa wyszarzona z podpisem, nie ukryta.
- **Detal ćwiczenia bez historii:** „zaloguj 2 sesje, żeby zobaczyć trend" + placeholder rep-PR — zamiast pustego wykresu.
- **Picker — brak wyników** search/filtrów: „Nie ma? Dodaj własne ćwiczenie" (CTA do custom z S6). Domyka wpis Notion o wyszukiwarce.
- **Karta wskazówek bez flag:** pozytywny stan („Wszystko na torze 💪"), nie znikająca sekcja.
- **Tech:** skeletony tras (przeniesione z opcji po-deploy) · stan offline (banner + disabled akcje wymagające sieci) · sprawdzić flashe ładowania na wolnej sieci.
**[Ty]:** copy PL wszystkich empty states (krótkie, motywujące — jak copy celebracji).
**Done:** przejście świeżego konta przez wszystkie ekrany bez ani jednego pustego/mylącego widoku; skeletony na trasach.

---

# Tor assetów (Ty, równolegle) — z promptami AI

> Te dwie rzeczy mają długi lead-time i są niezależne od kodu — **rób je już teraz**, wepnę je w Horyzoncie 3.
> ⚠️ NIEAKTUALNE (pre-Warm): ~~dark + volt lime-green (~#B9E935) + metalik~~. Od 2026-07-04 marka = **„Arco Warm"** (terracotta `#C63F21` + krem `#F6F2ED` + ciepła czerń `#1E1C1A` — `docs/paleta-arco-warm.md`). Prompty poniżej wymagają przepisania pod Warm przed użyciem; kierunek 3D ROZSTRZYGNIĘTY 2026-07-08 (wizja v2 §1.2): **matowe/clay w terracotta/krem, metalik ODRZUCONY**; zestaw kurowany (hantel, ławka, kettlebell, talerz), użycie tylko empty states/onboarding/celebracje — nie nawigacja.

## A) Ikony „żelazne/srebrne" (zestaw sprzętu)
**Cel:** spójny zestaw 3D metalicznych ikon: hantel, sztanga, kettlebell, talerz, ławeczka, drążek, guma, maszyna.
**Najważniejsze: SPÓJNOŚĆ** — generuj jednym narzędziem ze **style reference / stałym seedem**, ten sam kąt/światło dla wszystkich. Polecane: Midjourney v6 (`--sref` + `--seed`), Recraft (styl), albo Nano Banana / GPT-image z jednym „style anchor".

Prompt (per ikona, podmieniaj rzeczownik):
```
3D icon of a [dumbbell], brushed stainless steel and polished chrome with soft
studio reflections, isometric three-quarter view, centered, floating on a
transparent background, subtle lime-green (#B9E935) rim light, dark-mode friendly,
clean premium product render, high detail, consistent lighting and 35° angle,
no text, no background props.
```
Wskazówki: ustaw kwadrat (1:1), eksport PNG z alfą, trzymaj ten sam `--sref`/seed dla całego zestawu, render lekko z góry (35°). Zacznij od 6 kluczowych: hantel, sztanga, kettlebell, talerz, ławeczka, drążek.

## B) Premium „podratowanie" zdjęć ćwiczeń
**Kontekst:** baza `free-exercise-db` (public domain → wolno przetwarzać) ma amatorskie zdjęcia (czerwona ściana, słabe światło).
**Twarda zasada:** **nie wolno zmienić formy/anatomii ćwiczenia** — tylko poprawa, nie regeneracja. Inaczej zniszczymy wartość instruktażową.
**Priorytet:** zacznij od ~50–80 ćwiczeń (te z programów FBW + popularne), nie od wszystkich ~873.

**Opcja 1 — relight + upscale (zachowuje formę, polecane):** Magnific / Topaz / „enhance" przy NISKIEJ sile.
```
Enhance this gym exercise photo to a premium look: upscale and denoise, cinematic
soft studio lighting, neutral dark background, subtle cool color grade, crisp but
natural. CRITICAL: keep the person's pose, body position and exercise form exactly
as in the original — do not alter anatomy, limbs or equipment. Low creativity.
```

**Opcja 2 — podmiana tła (forma 100% nietknięta, duży skok spójności):** segmentacja sylwetki + jednolite tło.
```
Cut out the person and equipment, place on a clean dark studio gradient background
(#0b0e14 to #1a1f2b) with a subtle lime-green (#B9E935) accent glow from one side.
Keep the subject, pose and exercise unchanged. Soft contact shadow under feet.
```

**[Ty] decyzja:** Opcja 1 (relight) czy 2 (nowe tło)? Rekomenduję **2** dla spójności + bezpieczeństwa formy. Po wyborze przygotuję listę top-ćwiczeń do obróbki (z nazwami/URL-ami).

## C) (opc.) Hero 3D do ekranu po treningu / brandu
Jak metaliczny talerz Laddera — element celebracji.
```
A single chrome weight plate (gym bumper plate) floating, polished metallic with
lime-green (#B9E935) energy glow, dramatic studio lighting, dark background,
premium 3D render, centered, no text. Square, transparent or dark background.
```

## D) Launch assety (Sprint 6)
App icon (1024², metaliczny „A" / hantel na dark+volt), splash, OG image. Mogę dać osobne prompty, gdy dojdziemy do deploya.
