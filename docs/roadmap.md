# Arco — roadmapa i wizja rozwoju

> Żywy dokument. Łączy: (1) backlog sprintów krótkoterminowych, (2) długą wizję (social/native/monetyzacja/wizual), (3) analizę konkurencji. Iterujemy na każdym etapie.
> Data: 2026-06-25 · rewizja 2026-07-08 (wizja v2).
>
> 🗓️ **Kalendarz wykonawczy z buforem: `docs/kalendarz-wykonawczy.md`** (launch: okno 2–8 sty 2027) · **Dystrybucja: `docs/plan-dystrybucji.md`** (K1 content startuje z landingiem, nie z launchem!) · **Ekipa w całości: `docs/ekipa-koncepcja.md`** (concierge-test ODWOŁANY 2026-07-12 — walidacja: H2 moduł C + dogfooding w Kroku 4 + B3).
>
> 🥇 **KANON NADRZĘDNY (2026-07-08): `wizja-i-plan-produktu-v2.md`** — wizja, model biznesowy (Z1–Z3, freemium od launchu), **ekipy jako silnik wzrostu (fast-follow po launchu, już NIE H5)**, sekwencja wykonawcza (Kroki 0–5) i bramki decyzyjne B1–B4. Ten plik pozostaje źródłem prawdy dla: sprintów H1, zakresu bramki kont+RODO (rozszerzonej — patrz niżej) i szczegółów H3/H5.
>
> ⚠️ **Ważne wobec briefu:** `build-brief-apka-treningowa-v0.2.md` ma social, monetyzację i natyw jako **out of scope**. Wizja v2 nadpisuje to sekwencją Kroków: freemium od launchu (Krok 3), ekipy fast-follow (Krok 4); natyw pozostaje odłożony bez daty.
>
> 🎯 **Wyróżnik vs Hevy (najbliższy konkurent — ~80% naszej wizji):** „anti-Hevy" = **frictionless logging + rule-based guidance** (rdzeń, podciągnięte do Sprintu 4–5 ✅) + **kameralne ekipy** (do 6 osób + reakcje/nudge, zero komentarzy — awans do rdzenia strategii wzrostu). Pełny audyt i strategia: `docs/konkurencja-hevy.md` (tabela moatów zrewidowana 2026-07-08).

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
1 sesja moderowana z 3–5 osobami. **Kompletny skrypt sesji: `docs/scenariusz-h2.md`** (2026-07-08 — zadania z `usability-audit.md` §C + first-click z feedbacku #1 + moduły WTP/ekipy + arkusz + rozstrzygnięcie B1). Bramka przed inwestowaniem w Horyzont 3+.
**Rozszerzenie 2026-07-08 (wizja v2, Krok 1 — +25 min/sesję):** (a) moduł WTP: Van Westendorp light + „za którą z trzech rzeczy zapłaciłbyś dychę: podpowiedzi / wykresy / programy bez limitu?"; (b) moduł ekipy: „z kim trenujesz albo kto miałby Cię pilnować?" — walidacja, czy ludzie mają „swojego Radka". Bramka B1 (wizja v2 §7): ≥3/5 wskazuje guidance/analitykę jako warte pieniędzy; ≥3/5 ma swojego Radka.

## HORYZONT 3 — Premium look & ekspansja treści
- **Wizual premium:** kierunek = **„Arco Warm"** w wydaniu **retro-analog** (decyzja 2026-07-08, wizja v2 §1.2): architektura dwuwarstwowa — warstwa komunikacji pełne retro (ziarno, fotografia analogowa, display-typografia), warstwa narzędzia (UI) czysty minimal; kleje = paleta Warm + radiusy echem logotypu + display-typografia w momentach. Źródła prawdy: `docs/paleta-arco-warm.md` (tokeny) + wizja v2 §1.2 (art direction).
- **Ikony 3D — re-ocena ROZSTRZYGNIĘTA (2026-07-08):** tak, ale **matowe/clay** w terracotta/krem, nie metalik (chrom = porzucony volt/Athletic). Zestaw kurowany i mały (hantel, ławka, kettlebell, talerz); użycie: empty states, onboarding, celebracje — nie nawigacja dzienna.
- **AI-podrasowanie zdjęć z bazy** (`free-exercise-db`, public domain → wolno przetwarzać) — z **warm/analogowym gradingiem marki** (wizja v2 §1.2), żeby biblioteka ćwiczeń niosła identyfikację. Priorytet: **top ~200 ćwiczeń**, spójnie z planem self-hostu obrazków (S11). Nowe ćwiczenia z kuracji 2026-07-08 mają placeholder — wchodzą do tego samego toru.
- Więcej programów, custom ćwiczenia, bogatsza biblioteka.

## 🚧 BRAMKA przed otwarciem publicznym — Konta, multi-user i zgodność prawna (RODO)
> Twarda bramka = **Krok 2 wizji v2 (blok 4–7 tygodni), prerekwizyt launchu (Krok 3)**. Dziś Arco jest **single-account** (jedno konto, bootstrap skryptem, **bez publicznego signupu**). Nie zaczynamy przedwcześnie, ale **trzeba mieć to na uwadze już przy decyzjach architektonicznych** (pamięć `proactive-architecture-review`).
> **Zakres ROZSZERZONY 2026-07-08 (wizja v2, Krok 2):** (a) **zgoda ekipowa** — granularna, odwoływalna zgoda na udostępnianie statusu aktywności i passy członkom ekipy, zaprojektowana w modelu danych już teraz; (b) **polityka wieku 16+** w regulaminie; (c) **e-mail transakcyjny/nudge** — wybór dostawcy, opt-out, rejestr RODO. Rekomendacja konsultacji prawnej (1–2,5k zł) podtrzymana.

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

## HORYZONT 4 — Monetyzacja (launch z freemium) — zrewidowany 2026-07-08
> ⚠️ **Kanon: `wizja-i-plan-produktu-v2.md` §3 i §6.** Launch publiczny (Krok 3) idzie z **pełnym freemium od dnia zero**: Arco Coach 14,99 zł/mies · 99 zł/rok, reverse trial 21 dni, model hybrydowy limity+wartość (Z1–Z3), dwie fale konwersji (dzień ~21 guidance/analityka · mies. ~3–4 limit historii). ~~Etap 2 = warstwa trenerska (docelowy silnik przychodowy)~~ → **warstwa trenerska ODŁOŻONA** (wizja v2 §9; warunki re-otwarcia tamże); kill-gate B2 prowadzi do wariantu C lub statusu side-projectu, nie do trenerów. PWA/web to atut (Stripe bez 30% prowizji App Store). **Wymaga domkniętej BRAMKI powyżej** (Krok 2).
- **Ekipy = fast-follow 4–8 tyg. po launchu (Krok 4)** — przeniesione z H5. Spec koncepcyjna: wizja v2 §4 (check-in+passa, nie logi; reakcje+nudge; kanały: push PWA → skrzynka → e-mail). Pętla instalacyjna PWA: wizja v2 §5 (prompt instalacji na celebracji 1. treningu, nie przy wejściu).
- **Native iOS/Android** — odłożony bez daty; nudge działa bez natywu (fallback chain). Jedyny wyjątek re-oceny: TWA/sklepowe opakowanie PWA, jeśli dane pokażą duszenie pętli ekip przez iOS.

## HORYZONT 5 — Social rozszerzony (OSTATNI, po tym jak rdzeń hula + testy)
> 🔄 **Rewizja 2026-07-08:** **ekipy (do 6 osób, reakcje, nudge) WYPADAJĄ z H5** — awansowały do fast-follow po launchu (H4/Krok 4, wizja v2). W H5 zostaje reszta socialu: stories, UGC, tablica aktywności.
Wizja: **„Strava dla treningu siłowego"** — luka rynkowa (Strava jest cardio-centryczna; Hevy ma social, ale ciężki od komentarzy).
- **Znajomi:** zaproszenia, „znajomy wykonał trening", wzajemna motywacja — fundament robią ekipy (już w H4).
- **Tablica aktywności społeczności** — BEZ komentarzy i DM. Tylko **reakcje emotkami** + przycisk-nudge typu Duolingo („Wyślij wiadomość" → auto: „Radosław przypomina Ci o treningu"). To świadomy wyróżnik: zero toksyczności/moderacji, niski próg, na czasie (BeReal/Duolingo).
- **Stories** (docelowo).
- **Wspólna biblioteka ćwiczeń (UGC)** — userzy dodają własne ćwiczenia (opis + zdjęcia) i **udostępniają innym**. Kolaboracyjny, nie-vanity social (pasuje do „kameralnego" kierunku) + organicznie rośnie baza. ⚠️ wymaga **moderacji** (treści/zdjęcia), Storage, modelu udostępniania. Część osobista (dodawanie dla siebie) jest wcześniej — Sprint 6.
- „Convert solo interface moments into shared ones" — momenty solo (PR, koniec treningu, streak) zamieniać na dzielone.
- **Walidacja:** Ladder już udowadnia model „TEAMMATES WORKING OUT · double-tap to send cheers" + Teams + kalendarz. Nasza intuicja (cheers, kameralność) jest z nim zbieżna funkcjonalnie (estetycznie już nie — my Warm, oni volt).
- ⚠️ Social feed bez masy krytycznej = pusty. Dlatego OSTATNI: najpierw retencja solo (Horyzont 1–3) i prawdziwi użytkownicy.

---

## Backlog feature'ów (pomysły niewpięte w horyzont — decyzja [Ty] przy planowaniu)

- **Retro display typografia jako element identyfikacji** *(dodane 2026-07-08, pomysł [Ty])* — **krój ROZSTRZYGNIĘTY 2026-07-11: Gambarino** (Indian Type Foundry, przez Fontshare). Zastosowanie zgodne z architekturą dwuwarstwową (wizja §1.2): **tylko momenty** — celebracja, PR, recap („Rok w żelazie"), koniec triala, onboarding hero, landing/social — nigdy UI narzędzia (tam zostaje DM Sans).
  - **Licencja (zweryfikowana dokładnie, pełny tekst przeczytany):** ITF Free Font License — 100% darmowa, komercyjna, bezterminowa, bez limitu skali/MAU/przychodu, jawnie dozwolone Web/Mobile/Digital/**Apps**, atrybucja nieobowiązkowa. Self-host (nie Adobe Fonts — świadomie odrzucone, bo wymagałoby wiecznej subskrypcji CC = zależność runtime, dokładnie ryzyko z `proactive-architecture-review`). Jedyne ograniczenie: nie modyfikować/redystrybuować pliku fontu — nas nie dotyczy.
  - **Polskie znaki:** potwierdzone w foncie — ą ę ć ł ń ó ś ź ż + wielkie odpowiedniki (399 glifów łącznie).
  - **Wdrożenie: ✅ ZROBIONE 2026-07-11.** `vendor/gambarino/Gambarino-Regular.woff2` (ten sam wzorzec co `react-body-highlighter`) + `next/font/local` w `app/layout.tsx` + token `--font-display` w Tailwind obok `--font-sans`. Zweryfikowane w Preview: `document.fonts.status === "loaded"`, computed `font-family` = realny Gambarino (nie fallback Georgia), polskie znaki (Ć, ż) renderują się poprawnie. Zastosowany na **1 z 3 ekranów testowych** — liczba-bohater na celebracji (`app/session/[id]/done/page.tsx`, `font-display` zamiast `font-bold` — jeden weight, faux-bold wyglądałby źle). **Pozostałe 2 ekrany testowe (kłódka premium, karta recap) nie istnieją jeszcze w produkcie** — wejdą naturalnie przy budowie Kroku 3/monthly-recap, wtedy dostają `font-display` od razu.

- **Własne przypomnienie treningowe (opt-in, kontekstowe)** *(dodane 2026-07-08, wniosek z analizy inżynierii powiadomień — `inspiracje/wnioski-dla-arco.md`)* — „przypomnij mi w porze, w której zwykle trenuję": timing z mediany `started_at` historii (wzorzec Duolingo 23,5 h — kontekst > godzina; sam timing dawał im +60% tapnięć), twardo opt-in, quiet hours, pozytywne copy (zakaz groźby utraty passy — ToV). Retencja solo niezależna od ekip. Kiedy: po Kroku 4 (wymaga infrastruktury push, która wtedy już istnieje). ⚠️ Granica: to przypomnienie, które user sam ustawił — nie marketing push.

- **„Zastrzyk charakteru" + audyt charakteru (H3, po clay)** *(dodane 2026-07-12, dyskusja [Ty]: „minimal à la Revolut/Bolt + dodatki brandingowe" + „charakterek Spotify")* — **NIE pivot kierunku** (Warm + architektura dwuwarstwowa TO JEST model Revoluta: nudny rdzeń, spektakularne momenty); to plan egzekucji charakteru w istniejącym kierunku, kolejność:
  1. **Clay ikony do empty states / onboardingu / celebracji** (W6) — największy skok „premium feel" za najmniej pracy (u Revoluta 3D renders robią 80% charakteru).
  2. **Audyt odwagi terracotty** — V4 zostawił rust na jednym CTA; minimalizm ≠ sterylność: kandydaci na więcej koloru: FlameWeek, badge passy, elementy progressu. Decyzja [Ty] po zestawieniu.
  3. **Fotografia: BEZ ZMIAN — styl retro-analog Warm z wizji §1.2** (decyzja [Ty] 2026-07-12: duotone à la Spotify ODRZUCONE — zostajemy przy naszym ziarnie i ciepłym gradingu). Fotografia = tylko warstwa komunikacji (w apce zdjęć brak — jak Revolut).
  4. **Personalizacja jako filar charakteru (wzorzec Spotify „o TOBIE"):** liczba-bohater, guidance po imieniu, recap/„Rok w żelazie" — traktować jako spójny system tożsamości marki, nie zbiór feature'ów.
  5. **Audyt charakteru:** screeny Arco obok Revolut/Bolt/Spotify (Mobbin) — dopiero PO clay ikonach (dziś = porównywanie gołego szkieletu z ubranym konkurentem). Pytanie audytu: „gdzie jesteśmy nudni w złym sensie".
  ⚠️ Czego NIE bierzemy: dark-first i neon Spotify (czwarty pivot — nie), energia feedu (anty-wizja), przezroczystości/blur (koszt na średnich Androidach — wytyczne §1).

- **Dopisanie treningu po fakcie (retro-logging)** *(dodane 2026-07-12, pomysł [Ty] — oceniony: TAK, priorytet wysoki wśród backlogu)* — wejście „+ dodaj miniony trening" w /history: sesja z datą wsteczną (edycja daty już istnieje — S12), pełny logger albo szybki wpis. Po co: dziennik z dziurami kłamie, a dziura psuje passę i cel tygodniowy = frustracja w rdzeniu retencji. **Guard (ważny po Kroku 4):** retro-sesja emituje check-in pod właściwą datą CICHO — zero powiadomień do ekipy, tylko korekta passy/celu. PR-y z retro-danych liczą się normalnie (to dziennik usera, ufamy mu). Kiedy: przed launchem albo tuż po (tanie; spina się z „edycją zapisanego treningu" z Refinement).

- **Kreator awatara (sylwetki, fryzury, zarost, kolory)** *(dodane 2026-07-12, pomysł [Ty]; v1 = emoji-awatary — decyzja 2026-07-12)* — warstwowe SVG (sylwetka × fryzura × zarost × kolor przez tokeny), styl spójny z clay/Warm, unisex od pierwszego szkicu (Kasia!). Świadomie PO launchu: kombinatoryka assetów (dziesiątki elementów w spójnym stylu) to typowy przedlaunchowy scope-creep. Kiedy: re-ocena po Kroku 4, gdy ekipa żyje i tożsamość wizualna członków zaczyna mieć realną wartość.

- **i18n / zmiana języka** *(dodane 2026-07-12, dyskusja [Ty])* — klin „bo po polsku" jest martwy (Hevy ma PL — weryfikacja 2026-07-08); PL-first zostaje charakterem, nie featurem. Plan: (1) **ekstrakcja stringów do i18n przy okazji Kroku 3** — tanie ubezpieczenie, później to refaktor całej apki; (2) switcher języka i pełny EN dopiero z decyzją o ekspansji (gate etapu 3 / B4); (3) osobny, wcześniejszy wątek: **PL tłumaczenia instrukcji ćwiczeń** (S11) — dziś apka jest PL, a instrukcje EN, co boli persony bardziej niż brak EN całości.

- **Monthly recap / Yearly recap** *(dodane 2026-07-08, pomysł [Ty])* — miesięczne/roczne podsumowanie w stylu „Spotify Wrapped": tonaż, PR-y, passa, ulubione ćwiczenie, muscle split, liczba-bohater roku. Dlaczego pasuje do kanonu: (1) to naturalna scena dla **warstwy komunikacji retro** (display-typografia, ziarno — dokładnie „momenty" z wizji §1.2); (2) „convert solo moments into shared ones" — recap jako **karta do udostępnienia** = organiczny marketing i paliwo ekip (Z2: udostępnianie darmowe); (3) packaging premium: monthly recap free (teaser rytmu), **yearly „Rok w żelazie" z pełną głębią jako moment Coach** — trzecia mini-fala konwersji (grudzień/styczeń, sezonowo najlepszy okres fitness); (4) technicznie tanie: agregacje już istnieją w /progress (S13), potrzebny ekran + generator karty-obrazka. Kiedy: po launchu (dane muszą być), yearly najwcześniej na koniec pierwszego roku z userami; monthly można prototypować przy okazji splitu analityki (Krok 3). ⚠️ Uwaga Z3: recap liczy po pełnej historii także dla free (zasada „guidance na pełnych danych" z audytu kodu §4.2).

---

## Analiza konkurencji (Mobbin, iOS)

> ⚠️ Sekcja pisana przed reskinem **„Arco Warm"** (2026-07-04). Wnioski **funkcjonalne** (wzorce, flows) aktualne; wnioski **wizualne** (dark+volt „jak my") opisują porzucony kierunek „Athletic" — nie traktować jako kierunku marki.

**Ladder** — najbliżej naszej wizji. Dark + **volt/lime** (jak my!), social „cheers" (double-tap awatara), Teams/Coach Chat, kalendarz w profilu, **metaliczny talerz 3D**, ogromna display-typografia („PUSH IT"), week-strip z ✓, onboarding „Welcome Workout to unlock". Stats: Workouts/Minutes/Calories/Cheers. → *Wzorzec nr 1 dla socialu i żelaznego looku.*

**Nike Training Club** — premium editorial. Light, **wielka ALL-CAPS typografia na pełnych zdjęciach**, karuzele treści (For You/Browse), karty z czasem+poziomem. Nav: Home/Workouts/Activity/Programs. → *Wzorzec dla biblioteki treningów i „wow" typografii.*

**Withings Health Mate** — czysty dashboard zdrowia. Karta-na-metrykę: **wielka liczba + sparkline + słowo-status** („Stable Weight", „Gaining muscle"). Trustworthy. → *Wzorzec dla Postępów/Ciała (liczba-bohater + trend).*

**Fitplan** — marketplace planów. Dark, karty-zdjęcia z metadanymi (tygodnie/częstotliwość/lokalizacja), **chipy-filtry** (Home/Gym/Single), zakładki Discover. Ma „Feed". → *Wzorzec dla biblioteki programów + filtrów.*

**Gymshark** (wcześniej) — czysty dark logger, ✓-checkboxy per seria, picker z miniaturami + zakładki (Alphabetical/Body Part/Recent), Create Superset. → *Wzorzec dla pickera z filtrami i accept-checkboxa.*

**Fitbod** (wcześniej) — coral dark logger, **heatmapa mięśni**, „Best Replacements" (miniatury), wpis przez klawiaturę. → *Wzorzec dla heatmapy i podmiany.*

### Wnioski przekrojowe dla Arco
1. ~~Dark + volt + metalik = premium-strength~~ → zastąpione przez „Arco Warm" (patrz nota wyżej).
2. **Liczba-bohater + sparkline** (Withings) — kierunek Postępów.
3. **Wielka display-typografia w momentach** (Nike/Ladder) — celebracja, nie cała apka.
4. **Picker z filtrami + miniaturami** (Gymshark/Fitplan) — Sprint 4.
5. **„Cheers"/reakcje, zero komentarzy** (Ladder/Duolingo) — model socialu Horyzontu 5.
