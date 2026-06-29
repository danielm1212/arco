# Arco — sprinty szczegółowe (wykonawcze)

> Rozpisanie Horyzontu 1 z `roadmap.md` na konkrety. Podział: **[Claude]** = robię ja, **[Ty]** = Daniel (decyzje/treść/assety).
> Assety (ikony, zdjęcia) mają długi lead-time — **ruszaj je równolegle już teraz** (sekcja „Tor assetów").
> Data: 2026-06-25.

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

## Sprint 4 — Picker & szybki wpis (frictionless)
**[Claude]:**
- Filtry w pickerze: partia / sprzęt / wzorzec (chipy, jak Gymshark/Fitplan). Wspólny komponent dla add + swap.
- Stoper dla `timed` (plank): „Start" liczy w górę/do celu zamiast wpisywania sekund.
- Frictionless polish wpisu serii (pre-fill już jest — sprawdzić, czy „same as last" działa jednym tapem).
**Done:** picker filtruje (partia/sprzęt); plank ma stoper; wpis serii maksymalnie szybki.

## Sprint 5 — Guidance rule-based (RDZEŃ wyróżnika)
> Jawne, nadpisywalne reguły na TWOIM programie. NIE „AI auto-programming".
**[Claude]:**
- Rozszerzyć hint progresji („+2,5 kg, bo pełny zakres").
- Flagi braków z heatmapy/sets-per-muscle („mało pull w tym tygodniu", „push vs pull").
- „X dni temu trenowane" / staleness partii.
- Sugestia deloadu (prosta reguła, np. stagnacja/objętość).
**[Ty]:** akceptacja progu reguł (które flagi pokazywać, jak agresywnie).
**Done:** na home/loggerze widać proste, przejrzyste podpowiedzi; każda nadpisywalna.

## Sprint 6 — Programy startowe: audyt + dopracowanie (#4) + custom ćwiczenie
**[Claude]:**
- **Analiza balansu obecnych FBW z danych** (sets-per-muscle, push/pull/nogi/core, objętość/tydz., schemat progresji) — jako punkt wyjścia do dyskusji.
- Custom ćwiczenie: tabela user-exercises (`user_id`), CRUD w pickerze (jak Bevel „Add custom").
**[Ty]:** dopracowanie programowania FBW (jako trener) na bazie mojej analizy.
**Done:** FBW zaudytowane i poprawione; można dodać własne ćwiczenie.

## Sprint 7 — Więcej presetów + onboarding
**[Ty]:** treść presetów **PPL, Upper/Lower** (sloty, sety×powt., wzorce).
**[Claude]:** seed presetów; onboarding doświadczenie (początkujący/średni/zaawansowany) → sugestia presetu; mapowanie wg Twojej decyzji.
**Done:** ≥4 sensowne presety; onboarding sugeruje plan.

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

## Sprint 10 — Offline correctness + audyt longevity
**[Claude]:**
- Offline-guard dla swap/add/skip (z sygnałem błędu); reszta correctness (flush/`set_index` już są).
- **Checklista audytu longevity** (wg pamięci `proactive-architecture-review`):
  - [ ] Zależności: krytyczne libki zwendorowane (`vendor/`, `file:`)? `npm audit` czyste?
  - [ ] Assety: backup zdjęć (`../free-exercise-db`) aktualny + plan self-hostu gotowy?
  - [ ] Utrata danych: offline-correctness, `set_index`, recompute PR — sprawdzone?
  - [ ] Migracje: wszystkie gotowe do `db push` (skipped, weekly_goal…)?
  - [ ] Sekrety: service-role poza repo/bundlem, env prod rozdzielony?
  - [ ] Przenośność: tokeny semantic jedno źródło, zero magic numbers?
  > Powtarzać przed launchem (gate S11) i przy większych zmianach zależności/assetów.
**Done:** brak utraty danych offline; checklista odhaczona.

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

# Tor assetów (Ty, równolegle) — z promptami AI

> Te dwie rzeczy mają długi lead-time i są niezależne od kodu — **rób je już teraz**, wepnę je w Horyzoncie 3.
> Marka: **dark + volt lime-green (~#B9E935)** + metalik. Podawaj ten hex w promptach.

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
