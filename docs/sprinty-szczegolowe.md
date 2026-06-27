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

## Sprint 2 — Celebracja + cel — ✅ w większości (`2bcee59`)
Zrobione: ekran po treningu (hero „tyle dziś uniosłeś" + rotujące nagłówki per stan + pasek statów + CTA), `finishSession`→/done, cel tygodniowy (migracja `weekly_goal`, wybór w Settings, postęp „X/Y 🎯" na home). **Zostaje:** „last set" inline per wiersz + (opc.) slide-to-confirm.
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

## Sprint 3 — Retencja widoczna
**Cel:** „wracasz codziennie" + wizualny wyróżnik.
**[Claude]:**
- Kalendarz miesięczny + passa (streak) — dni treningowe zaznaczone (dane w `sessions`).
- Heatmapa-sylwetka: SVG ciała kolorowane wg serii-na-partię (mamy `sets-per-muscle`).
**[Ty]:** akceptacja mapy mięśni → regiony sylwetki (które `primary_muscles` → która część SVG); mogę zaproponować, Ty korygujesz.
**Done:** kalendarz/streak na home lub /progress; heatmapa na /progress.

## Sprint 4 — Głębia doboru ćwiczeń
**[Claude]:**
- Filtry w pickerze: partia / sprzęt / wzorzec (chipy, jak Gymshark/Fitplan). Wspólny komponent dla add + swap.
- Stoper dla `timed` (plank): „Start" liczy w górę/do celu zamiast wpisywania sekund.
- Custom ćwiczenie: tabela user-exercises (`user_id`), CRUD w pickerze (jak Bevel „Add custom").
- Więcej presetów: PPL, Upper/Lower.
- Onboarding: doświadczenie (początkujący/średni/zaawansowany) → sugestia presetu.
**[Ty]:**
- **Treść presetów PPL/Upper-Lower** (sloty, sety×powt., wzorce) — jako trener wiesz najlepiej; ja zakoduję seed.
- Mapowanie doświadczenie → który preset.
**Done:** picker filtruje; plank ma stoper; są ≥4 presety; onboarding sugeruje.

## Sprint 5 — Poprawność + higiena kodu
**[Claude]:**
- Reszta offline-correctness (offline-guard dla swap/add/skip z sygnałem błędu).
- Dedup `formatSet`/`Sparkline`; rozbicie `Logger.tsx` (~600 linii) na podkomponenty.
- N+1 „poprzednio", paginacja historii; typowane helpery zapytań (mniej `as unknown as`).
**[Ty]:** —
**Done:** brak duplikacji; logger rozbity; build/lint czyste.

## Sprint 6 — Launch (Phase 10)
**[Claude]:** kod gotowy do deploya; instrukcja krok-po-kroku; PL tłumaczenia top-instrukcji; skeletony tras.
- **Uniezależnienie zdjęć od hotlinku:** wrzucić obrazki na **Supabase Storage / CDN** i przepiąć `IMG_PREFIX` w `scripts/seed.ts` z `raw.githubusercontent.com/yuhonas/...` na własną kopię (backup lokalny: `../free-exercise-db`). Tu też lądują wersje po AI-„podratowaniu". Eliminuje ryzyko link-rotu.
**[Ty]:**
- Konto **Supabase cloud** (nowy projekt) + **Vercel** + (opc.) domena.
- Realne klucze do env produkcyjnego (service-role tylko serwer).
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
