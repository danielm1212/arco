# Arco — roadmapa i wizja rozwoju

> Żywy dokument. Łączy: (1) backlog sprintów krótkoterminowych, (2) długą wizję (social/native/monetyzacja/wizual), (3) analizę konkurencji. Iterujemy na każdym etapie.
> Data: 2026-06-25.
>
> ⚠️ **Ważne wobec briefu:** `build-brief-apka-treningowa-v0.2.md` ma social, monetyzację i natyw jako **out of scope**. Horyzonty 4–5 poniżej to **świadoma przyszła re-skopizacja** — wchodzimy w nie dopiero, gdy rdzeń „hula" i przejdzie testy użytkowników. Do tego czasu brief obowiązuje.
>
> 🎯 **Wyróżnik vs Hevy (najbliższy konkurent — ~80% naszej wizji):** „anti-Hevy" = **frictionless logging + rule-based guidance** (rdzeń, podciągnąć do Sprintu 4–5, NIE Horyzont 5) + **kameralny social** (prywatne pody 1–3 + reakcje/nudge, zero komentarzy). Pełny audyt i strategia: `docs/konkurencja-hevy.md`.

---

## HORYZONT 1 — Dopracowanie rdzenia (sprinty)
Cel: produkt, który „hula jak trzeba". **Szczegółowe rozpisanie (podział Claude/Ty + prompty AI do assetów): `docs/sprinty-szczegolowe.md`.**

- **Sprint 1 — Bug + szybki polish loggera:** fix tooltipa ⓘ po swapie · podpis po swapie · koniec przerwy (3-2-1 + sygnał) · wyłączanie przerw · zwijana notatka · wake lock.
- **Sprint 2 — Celebracja + cel (warstwa „wow" na volcie):** ekran po treningu (gratulacje 💪 + wielkie dane + podsumowanie) · nawigacja po podsumowaniu · ustawienie celu (np. 2 treningi/tydz.) · „last set" per wiersz · slide-to-confirm „Zakończ".
- **Sprint 3 — Retencja widoczna:** kalendarz + passa · heatmapa-sylwetka (mamy `sets-per-muscle`).
- **Sprint 4 — Głębia doboru:** filtry w pickerze (partia/sprzęt/wzorzec) · stoper dla `timed` (plank) · custom ćwiczenie · więcej presetów (PPL/Upper-Lower) · onboarding doświadczenie→sugestia planu.
- **Sprint 5 — Poprawność + kod:** offline correctness (flush przed finish, guard swap/add/skip, fix `set_index`) · dedup/rozbicie `Logger.tsx` · N+1/paginacja.
- **Sprint 6 — Launch (Phase 10):** deploy Vercel + Supabase cloud (`db push`) · HTTPS = pełne PWA (wake lock/wibracje/instalacja) · realne klucze · PL instrukcje.

## HORYZONT 2 — Testy użytkowników
1 sesja moderowana z 3–5 osobami na zadaniach z `usability-audit.md` sekcja C. Bramka przed inwestowaniem w Horyzont 3+.

## HORYZONT 3 — Premium look & ekspansja treści
- **Wizual „żelazny/srebrny":** metaliczne akcenty na bazie dark+volt (Ladder to robi — talerz 3D). **Kompatybilne z naszym kierunkiem, nie pivot** (inaczej niż niebieski). Duże, uzupełniające ikony (hantel, ławeczka) — **kurowany** zestaw, nie losowe AI (ryzyko gimmicku).
- **AI-podrasowanie zdjęć z bazy** (`free-exercise-db`, public domain → wolno przetwarzać) na spójny premium look. Dziś zdjęcia są amatorskie (czerwona ściana). Duży skok jakości postrzeganej.
- Więcej programów, custom ćwiczenia, bogatsza biblioteka.

## 🚧 BRAMKA przed otwarciem publicznym — Konta, multi-user i zgodność prawna (RODO)
> Twarda bramka **przed** Horyzontem 4–5. Dziś Arco jest **single-account** (jedno konto, bootstrap skryptem, **bez publicznego signupu**). Otwarcie na realnych userów (warunek socialu/monetyzacji) wymaga osobno przemyślanej warstwy kont + prawa. Nie zaczynamy przedwcześnie, ale **trzeba mieć to na uwadze już przy decyzjach architektonicznych** (pamięć `proactive-architecture-review`).

**Konta i uwierzytelnianie:**
- **Publiczna rejestracja** (dziś wyłączona): signup + weryfikacja email + reset hasła + (RODO) usunięcie konta. Dziś flow „jedno konto" — trzeba świadomie włączyć i zabezpieczyć.
- **Logowanie przez Google (OAuth)** — Supabase Auth ma providerów out-of-the-box; koszt: projekt w Google Cloud + OAuth consent screen + redirect URLs (prod). Tani technicznie, ale wymaga konta Google Cloud i zgód. Rozważyć też Apple Sign-in (wymóg App Store przy natywie + innym social loginie).
- **Polityka haseł na produkcji** — dziś dev ma słabe hasło i guard min-8 w `scripts/bootstrap-user.ts`; przy publicznym signupie egzekwować realną politykę + rate limiting + ochronę przed enumeracją kont.

**Baza danych / multi-user:**
- **Dobra wiadomość:** RLS po `user_id` już jest na wszystkich tabelach z danymi usera (architektura z założenia multi-user). Seed (`exercises`/`programs` z `user_id=null`) read-only.
- **Do zrobienia przy otwarciu:** audyt RLS pod realny multi-user (czy żaden endpoint nie przecieka cudzych danych), backupy/PITR na Supabase cloud, limity/abuse, migracja danych testowych → prod (świeży start).
- **UGC (Horyzont 5)** dokłada moderację treści/zdjęć + Storage + model udostępniania — patrz H5.

**Zgodność prawna (UE/Polska — RODO/GDPR):**
- **Polityka prywatności** + **Regulamin (ToS)** — wymagane przy zbieraniu danych userów.
- **RODO:** podstawa prawna przetwarzania, zgody (granularne, nie pre-checked), **prawo do eksportu danych** i **prawo do bycia zapomnianym** (usunięcie konta + danych), retencja, rejestr czynności.
- **DPA z Supabase** jako procesorem + **hosting danych w UE** (region Supabase EU) — istotne dla RODO.
- **Cookies/consent** (jeśli analytics/marketing), informacja o przetwarzaniu, dane kontaktowe administratora.
- Przy monetyzacji: regulamin płatności, prawo odstąpienia, faktury (osobna analiza w H4).
> Rekomendacja: gdy zbliżymy się do testów z realnymi userami (Horyzont 2→4), zrobić osobny dokument `docs/legal-i-konta.md` z checklistą wdrożeniową. Część rzeczy (eksport/usuwanie danych) warto zaprojektować w modelu danych **wcześniej**, żeby nie przerabiać później.

## HORYZONT 4 — Native + monetyzacja
Wchodzi razem z socialem (push notyfikacje są kluczowe dla nudge'y, a PWA je ogranicza). **Wymaga domkniętej BRAMKI powyżej** (konta + prawo).
- **Native iOS/Android** (push, app store, mniej ograniczeń PWA).
- **Model:** freemium jak Strava (darmowy rdzeń → premium funkcje) — sieć społeczna potrzebuje darmowego progu wejścia. Alternatywa: sub 9,90 zł/mc + 2 tyg. trial. Decyzja po danych z testów.

## HORYZONT 5 — Social (OSTATNI, po tym jak rdzeń hula + testy)
Wizja: **„Strava dla treningu siłowego"** — luka rynkowa (Strava jest cardio-centryczna; Hevy ma social, ale ciężki od komentarzy).
- **Znajomi:** zaproszenia, „znajomy wykonał trening", wzajemna motywacja.
- **Tablica aktywności społeczności** — BEZ komentarzy i DM. Tylko **reakcje emotkami** + przycisk-nudge typu Duolingo („Wyślij wiadomość" → auto: „Radosław przypomina Ci o treningu"). To świadomy wyróżnik: zero toksyczności/moderacji, niski próg, na czasie (BeReal/Duolingo).
- **Stories** (docelowo).
- **Wspólna biblioteka ćwiczeń (UGC)** — userzy dodają własne ćwiczenia (opis + zdjęcia) i **udostępniają innym**. Kolaboracyjny, nie-vanity social (pasuje do „kameralnego" kierunku) + organicznie rośnie baza. ⚠️ wymaga **moderacji** (treści/zdjęcia), Storage, modelu udostępniania. Część osobista (dodawanie dla siebie) jest wcześniej — Sprint 6.
- „Convert solo interface moments into shared ones" — momenty solo (PR, koniec treningu, streak) zamieniać na dzielone.
- **Walidacja:** Ladder już udowadnia model „TEAMMATES WORKING OUT · double-tap to send cheers" + Teams + kalendarz. Nasza intuicja (volt, cheers, żelazny look) jest z nim zbieżna.
- ⚠️ Social feed bez masy krytycznej = pusty. Dlatego OSTATNI: najpierw retencja solo (Horyzont 1–3) i prawdziwi użytkownicy.

---

## Analiza konkurencji (Mobbin, iOS)

**Ladder** — najbliżej naszej wizji. Dark + **volt/lime** (jak my!), social „cheers" (double-tap awatara), Teams/Coach Chat, kalendarz w profilu, **metaliczny talerz 3D**, ogromna display-typografia („PUSH IT"), week-strip z ✓, onboarding „Welcome Workout to unlock". Stats: Workouts/Minutes/Calories/Cheers. → *Wzorzec nr 1 dla socialu i żelaznego looku.*

**Nike Training Club** — premium editorial. Light, **wielka ALL-CAPS typografia na pełnych zdjęciach**, karuzele treści (For You/Browse), karty z czasem+poziomem. Nav: Home/Workouts/Activity/Programs. → *Wzorzec dla biblioteki treningów i „wow" typografii.*

**Withings Health Mate** — czysty dashboard zdrowia. Karta-na-metrykę: **wielka liczba + sparkline + słowo-status** („Stable Weight", „Gaining muscle"). Trustworthy. → *Wzorzec dla Postępów/Ciała (liczba-bohater + trend).*

**Fitplan** — marketplace planów. Dark, karty-zdjęcia z metadanymi (tygodnie/częstotliwość/lokalizacja), **chipy-filtry** (Home/Gym/Single), zakładki Discover. Ma „Feed". → *Wzorzec dla biblioteki programów + filtrów.*

**Gymshark** (wcześniej) — czysty dark logger, ✓-checkboxy per seria, picker z miniaturami + zakładki (Alphabetical/Body Part/Recent), Create Superset. → *Wzorzec dla pickera z filtrami i accept-checkboxa.*

**Fitbod** (wcześniej) — coral dark logger, **heatmapa mięśni**, „Best Replacements" (miniatury), wpis przez klawiaturę. → *Wzorzec dla heatmapy i podmiany.*

### Wnioski przekrojowe dla Arco
1. **Dark + volt + metalik** = premium-strength, potwierdzone Ladderem.
2. **Liczba-bohater + sparkline** (Withings) — kierunek Postępów.
3. **Wielka display-typografia w momentach** (Nike/Ladder) — celebracja, nie cała apka.
4. **Picker z filtrami + miniaturami** (Gymshark/Fitplan) — Sprint 4.
5. **„Cheers"/reakcje, zero komentarzy** (Ladder/Duolingo) — model socialu Horyzontu 5.
