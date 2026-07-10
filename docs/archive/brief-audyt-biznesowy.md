# Brief — Audyt biznesowy i strategiczny Arco

> **Dla:** agenta-analityka biznesowego (product/business strategist) uruchamianego na zimno.
> **Autor briefu:** sesja design-systemowa, 2026-07-07. **Zleceniodawca:** Daniel (właściciel, solo-founder + projektant UI/UX).
> **Status projektu:** rdzeń zbudowany i działa na produkcji, PRZED testami z realnymi użytkownikami. Zero realnych danych rynkowych — audyt jest **strategiczny na hipotezach**, nie na twardych metrykach użycia.

---

## 0. Twoja rola i mandat

Jesteś **starszym strategiem produktu i analitykiem biznesowym**. Współpracujesz z doświadczonym projektantem/founderem — pisz jak do partnera, bez tłumaczenia podstaw. Twoje zadanie: **bezlitośnie uczciwy audyt potencjału biznesowego Arco** i rekomendacje, co ciąć, co wdrażać, nad czym się zastanowić i czy w ogóle warto rozważyć pivot.

**Kontrakt jakości (przeczytaj zanim zaczniesz):**
- **Nie jesteś cheerleaderem.** Founder ma emocjonalny stosunek do produktu (2+ lata pracy). Twoja wartość = mówienie rzeczy niewygodnych z dowodami, nie potwierdzanie wizji. Jeśli teza „anti-Hevy" jest słaba — powiedz to i uzasadnij.
- **Każda rekomendacja z uzasadnieniem** (wzorzec z `CLAUDE.md`: **Co** / **Dlaczego** / **Kiedy/Warunki** / **Ryzyko**). Zero „bo tak się robi".
- **To projekt jednoosobowy.** Nie zakładaj zespołu, budżetu marketingowego ani nieograniczonego czasu. Każda rekomendacja musi przejść test „czy jedna osoba to udźwignie przy dziennej pracy nad kodem".
- **Rozróżniaj fakt od hipotezy.** Benchmarki z docsów (Hevy $600k/mies, konwersje freemium 2,1%) oznaczaj jako dane; własne szacunki jako założenia z jawnym uzasadnieniem.
- **Nie piszesz kodu i nie zmieniasz źródeł prawdy.** Produkujesz **osobny dokument-raport** (patrz §7). Jeśli rekomendujesz zmianę w `roadmap.md`/`monetyzacja.md`, opisz ją jako propozycję do decyzji właściciela — nie edytuj tych plików.

---

## 1. Czym jest Arco (stan faktyczny)

**Arco** = osobista apka treningowa (dziennik siłowni) — web/PWA, PL-first. Zbudowana jako Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase (Postgres + Auth + RLS). **Live na produkcji:** https://arco-olive.vercel.app (Vercel `fra1` + Supabase `eu-central-1`/Frankfurt). Dziś **single-account** (jedno konto właściciela, bez publicznej rejestracji) — apka jest w realnym codziennym użyciu przez foundera na telefonie jako PWA.

**Pozycjonowanie (teza właściciela):** „**anti-Hevy**" — logger, który *prowadzi i loguje się sam*, z kameralnym socialem i charakterem. Docelowa długa wizja: „**Strava dla treningu siłowego**". Pełne uzasadnienie: `docs/konkurencja-hevy.md`.

**Co realnie zbudowane i działa** (stan na 2026-07-07):
- Pełny dziennik: sesje, serie, historia, edycja daty/notatek, rekordy (PR-y liczone on-the-fly), mini-bar „trening w toku".
- **Frictionless logging** — pre-wypełnienie sesji z historii/programu, zaliczenie serii tapem.
- **Rule-based guidance** (rdzeń wyróżnika, NIE AI): hint progresji (pełny/poniżej zakresu), balans push/pull, staleness partii, deload wg stagnacji — jawne, nadpisywalne reguły w `lib/guidance.ts`.
- Biblioteka **8 programów** (6 kuratorowanych od trenera + 2 autorskie), 873 ćwiczeń (baza `free-exercise-db`), picker z filtrami (partia/sprzęt/wzorzec), custom ćwiczenia usera z RLS.
- Retencja: kalendarz + passa, anatomiczna heatmapa mięśni, Muscle Split %, ekran celebracji po treningu, cel tygodniowy.
- Ciało (zdjęcia sylwetki), Postępy (delta-karty, trendy), empty states, offline (outbox + banner), PWA (instalacja, wake lock, wibracje).
- Wizual: przeprojektowany na kierunek „**Arco Warm**" (terracotta + krem + ciepła czerń), DM Sans, design tokeny (primitive→semantic), świeżo wyeksportowane do Figmy (kolory + typografia).

**Czego NIE ma (świadomie):**
- Publiczna rejestracja / multi-user w praktyce (RLS jest, ale flow single-account).
- Jakikolwiek social (pody, reakcje, feed) — Horyzont 5.
- Monetyzacja / płatności — nie zaczęte.
- Native iOS/Android — tylko PWA.
- AI auto-programming, makro/dieta, wearables/HRV — **trwale poza zakresem** (świadomy wybór).

---

## 2. Źródła prawdy — przeczytaj PRZED pisaniem audytu

Kolejność odzwierciedla wagę dla audytu biznesowego. Wszystkie ścieżki względem korzenia repo (`arco/`).

**Priorytet 1 (rdzeń strategiczny — czytaj w całości):**
- `docs/monetyzacja.md` — **kanon monetyzacji**. 3 etapy (consumer premium → warstwa trenerska → gate EN/B2B), matematyka sufitu PL, benchmarki, 6 „rozjazdów" (R1–R6) z których część jest otwarta. To Twój główny punkt zaczepienia.
- `docs/konkurencja-hevy.md` — audyt Hevy + teza wyróżnika „anti-Hevy" + uczciwa tabela moatów. Zakwestionuj ją.
- `docs/roadmap.md` — horyzonty 1–5, bramka kont/RODO, długa wizja, analiza konkurencji (Mobbin: Ladder, Nike TC, Withings, Fitplan, Gymshark, Fitbod).

**Priorytet 2 (kontekst i stan):**
- `CLAUDE.md` (w korzeniu repo) — zasady projektu, zakres (co in/out), kierunek wizualny, stack.
- `docs/HANDOFF.md` — chronologiczny stan „co zrobione / co dalej"; pokazuje tempo i realny zakres wykonanej pracy.
- `docs/build-brief-v0.3-addendum.md` + `docs/build-brief-apka-treningowa-v0.2.md` — pierwotna specyfikacja (addendum nadpisuje v0.2).

**Priorytet 3 (jeśli potrzebujesz głębi w danym wątku):**
- `docs/audyt-technologiczny-2026-07.md`, `docs/audyt-kodu-zaleznosci.md`, `docs/audyt-bazy-cwiczen.md` — dług techniczny, zależności, jakość bazy ćwiczeń (istotne dla oceny „ile do launchu").
- `docs/usability-audit.md`, `docs/konkurencja-hevy-ux.md` — UX i wzorce konkurencji.
- `docs/archive/` — porzucone kierunki (kickboxing, marketplace, volt/Athletic) — pokazuje, czego już świadomie NIE robimy.

> ⚠️ Jeśli plik z „pełną analizą z liczbami" (`arco-monetyzacja-strategia.md`, sesja Cowork) nie istnieje w repo — oprzyj się na `monetyzacja.md`, który go streszcza, i oznacz brakujące źródło.

---

## 3. Zakres audytu — obszary i pytania

Nie musisz trzymać się kolejności; potraktuj to jako checklistę pokrycia. Przy każdym obszarze: **dowody → wniosek → rekomendacja z warunkami**.

### 3.1. Rynek i wielkość szansy
- Oszacuj TAM/SAM/SOM dla PL-first (dziennik siłowy + warstwa trenerska). W docsach są liczby wejściowe (~3 mln bywalców siłowni, ~7 000 trenerów, ~2 700 klubów) — zwaliduj je i zbuduj lejek.
- Czy PL-first to realna baza czy ślepy zaułek? Fitatu (~26,8 mln zł przych.) jest podawane jako dowód — ale TAM diety >> TAM dziennika siłowego. Na ile ten precedens się przenosi?
- Kiedy ekspansja EN/globalna ma sens, a kiedy to samobójcza walka z Hevy?

### 3.2. Konkurencja i pozycjonowanie
- **Zakwestionuj tezę „anti-Hevy".** Czy „prowadzenie (rule-based) + kameralny social + charakter" to realny klin, czy zestaw feature'ów, które Hevy/Strong/Boostcamp mogą dodać? Tabela moatów w `konkurencja-hevy.md` jest optymistyczna — sprawdź ją.
- Kto jest realnym konkurentem dla **warstwy trenerskiej** (docelowy silnik przychodowy)? Trainerize, TrueCoach, Indefit, Excel. Gdzie Arco ma przewagę strukturalną (podopieczny już loguje granularne dane), a gdzie przegrywa (brak ekosystemu, jednoosobowy dev)?
- Ladder jest w roadmapie jako „wzorzec nr 1 dla socialu" — czy to inspiracja, czy sygnał, że nisza jest już zajęta?

### 3.3. Model biznesowy i monetyzacja
- Oceń **realność 3 etapów** z `monetyzacja.md`. Szczególnie: czy przeskok z consumer premium (sufit 15–30k zł MRR) do warstwy trenerskiej (~55k zł MRR wg docsa) jest wykonalny dla solo-foundera? Warstwa trenerska to w praktyce **osobny produkt B2B** (dashboard, relacja trener↔podopieczny, GTM przez Instagram/kluby).
- **Rozstrzygnij lub pogłęb otwarte rozjazdy:**
  - **R2 (pricing)** — kotwica Hevy $2.99/mc (~7,5 zł) vs proponowane 14,99–19,99 zł. Premium z uzasadnieniem guidance+PL czy wolumen blisko Hevy? To decyzja otwarta [właściciel] — daj rekomendację z modelem.
  - **R3** (rozstrzygnięte: guidance-lite free / full paid; reverse trial zamiast hard paywalla) — zwaliduj, czy podział wartości free/paid jest obroniony.
- Jednostkowa ekonomia: załóż CAC (jaki kanał?), LTV (churn w kategorii, retencja przez relację z trenerem), payback. Oznacz założenia.
- Modele odrzucone (reklamy, marketplace programów, lifetime jako główny) — czy słusznie? Founder odrzucił marketplace świadomie (kanibalizacja) — nie podważaj bez mocnego argumentu, ale możesz.

### 3.4. Segmenty i ICP
- Kto jest **realnym pierwszym płacącym**? Founder buduje „dla siebie" (zaawansowany ćwiczący, dumbbell/home + siłownia). Czy ICP to on, początkujący, czy trener? Te trzy ciągną produkt w różne strony.
- Napięcie: „frictionless dla zaawansowanych, którzy wiedzą co robią" vs „prowadzenie za rękę dla początkujących" — to dwa różne produkty. Który wygrywa i dlaczego?

### 3.5. Audyt funkcji — ciąć / zostawić / dodać
- Przejrzyj zbudowane funkcje (§1) i **zaproponuj priorytetyzację** (MoSCoW lub Kano). Co jest core value, co vanity, co dług utrzymaniowy bez zwrotu?
- Kandydaci do zakwestionowania (nie przesądzaj — oceń): zdjęcia sylwetki/„Ciało", heatmapa mięśni, Muscle Split %, 8 programów vs mniej-ale-lepiej, custom ćwiczenia. Które realnie budują retencję/willingness-to-pay, a które to feature creep?
- Czego **brakuje** do pierwszego płatnego wdrożenia (poza samą monetyzacją)? Bramka kont+RODO (`roadmap.md`) to twardy prerekwizyt — oszacuj jej ciężar.

### 3.6. Analiza pivota — rozważ scenariusze
Przedstaw **3–4 warianty strategiczne** z trade-offami, nie jedną „słuszną" drogę. Punkty wyjścia do rozważenia (dodaj własne):
- **A. Status quo** — consumer solo PL-first, guidance jako klin, social później. (Ryzyko: sufit przychodowy, walka o retencję bez sieci.)
- **B. Pivot na B2B trenerski wcześniej** — warstwa trenerska jako etap 1, nie 2. Consumer staje się darmowym frontem dla podopiecznych trenera. (Ryzyko: inny produkt, inny GTM, dashboard do zbudowania.)
- **C. Wąska nisza** — np. tylko home/dumbbell-first + guidance, zero aspiracji do socialu/globalu. (Ryzyko: mały rynek; szansa: obronny, tani w utrzymaniu.)
- **D. Social-first / community** — postawić na kameralne pody wcześniej jako moat. (Ryzyko: pusty feed bez masy krytycznej — docsy same to flagują jako największe ryzyko socialu.)
Dla każdego: dla kogo, jak zarabia, co trzeba zbudować, główne ryzyko, sygnał „to działa".

### 3.7. GTM, dystrybucja, akwizycja
- Solo-founder bez budżetu marketingowego. Jakie kanały realnie? (Trenerzy na IG, społeczności siłowe PL, content, product-led?)
- PWA vs App Store dla akwizycji — PWA to atut monetyzacyjny (bez 30% prowizji), ale minus dla discovery. Jak to rozegrać?

### 3.8. Ryzyka
- **Koncentracja jednoosobowa** — bus factor 1, tempo vs wypalenie, utrzymanie po launchu.
- **Prawne/RODO** — bramka kont, DPA Supabase, prawo do usunięcia/eksportu danych; przy trenerach: zgoda podopiecznego na widoczność danych (RODO). Przy płatnościach: regulamin, VAT/OSS.
- **Techniczne** — dług (rozbicie `Logger.tsx`, N+1), hotlink zdjęć ćwiczeń (link-rot), zależność od majorów (Next 16/React 19).
- **Rynkowe** — Hevy dodaje guidance; nisza za mała; retencja bez sieci.

### 3.9. Metryki i bramki decyzyjne
- Zdefiniuj, **co musi być prawdą, żeby przejść dalej** na każdym etapie. Docsy mają zalążki (konwersja >2% = sygnał; <1,5% po 3 mies. = kill/pivot etapu 1). Rozbuduj w spójny zestaw bramek z liczbami i horyzontem czasowym.
- Jaka jest **najtańsza możliwa walidacja** kluczowych hipotez PRZED budowaniem (Horyzont 2 = testy z 3–5 osobami)? Founder ma tendencję budować przed walidacją — zaadresuj to.

---

## 4. Kluczowe napięcia do rozstrzygnięcia (nie omijaj ich)

1. **Solo vs ambicja.** Wizja (social „Strava dla siłowni" + warstwa trenerska + native + globalny) jest wieloproduktowa. Jedna osoba. Gdzie jest realistyczna granica?
2. **Build-before-validate.** Rdzeń jest bardzo dopracowany PRZED jakimkolwiek testem użytkownika. To ryzyko przeinwestowania w niezweryfikowane hipotezy — oceń, czy kolejność „buduj rdzeń → testuj (H2) → monetyzuj" jest zdrowa, czy trzeba testować wcześniej.
3. **Guidance jako moat.** Cała teza wyróżnika stoi na rule-based guidance. Czy to realnie broni się przed kopiowaniem i czy użytkownicy za to zapłacą (teza `monetyzacja.md`: „nikt nie płaci za silnik, płacą za pewność i wynik")?
4. **PL-first: fundament czy sufit.** Świadoma decyzja, ale z wbudowanym ograniczeniem skali. Kiedy przestaje służyć?
5. **Warstwa trenerska** jako „docelowy silnik przychodowy" pojawiła się późno (2026-07-06) i nie istnieje w produkcie ani modelu danych. To największa nierozpoznana szansa/ryzyko — pogłęb ją.

---

## 5. Ograniczenia i zastrzeżenia (bądź ich świadom)

- **Brak realnych danych użytkowników.** Single-account, przed H2. Nie masz retencji, konwersji, feedbacku. Każdy wniosek ilościowy = hipoteza; oznaczaj jawnie.
- **Benchmarki w docsach są z 2026-07** i mogą wymagać weryfikacji — jeśli masz dostęp do wyszukiwania, potwierdź kluczowe (Hevy MRR, konwersje freemium, rynek trenerski PL). Jeśli nie — oprzyj się na docsach i oznacz jako niezweryfikowane.
- **Nie masz dostępu do finansów foundera** — nie zakładaj runway; pytaj o próg rentowności w kategoriach „ile MRR = to ma sens jako główne zajęcie".
- **Część źródeł zewnętrznych może wymagać autoryzacji** (Notion, konektory) — jeśli niedostępne, pracuj na plikach w repo.

---

## 6. Czego NIE robić

- Nie pisz kodu, nie uruchamiaj buildów, nie zmieniaj `roadmap.md`/`monetyzacja.md`/`CLAUDE.md` — produkujesz osobny raport.
- Nie proponuj rzeczy trwale odrzuconych bez mocnego nowego argumentu: AI auto-programming, makro/dieta, wearables, marketplace programów, kickboxing (patrz `CLAUDE.md` + `docs/archive/`). Możesz je podważyć — ale świadomie i z dowodem, wiedząc, że to były przemyślane decyzje.
- Nie traktuj socialu jako łatwego — docsy słusznie flagują „pusty feed bez masy krytycznej". Nie rekomenduj go jako szybkiej wygranej.
- Nie zakładaj zespołu ani budżetu. Nie rekomenduj nic, czego solo-founder nie utrzyma.
- Nie bądź ogólnikowy („rozważ segmentację rynku") — każda rekomendacja musi być konkretna i wykonalna dla TEGO projektu.

---

## 7. Format deliverable (co masz wyprodukować)

Jeden dokument Markdown: **`docs/audyt-biznesowy-YYYY-MM-DD.md`** (użyj dzisiejszej daty). Struktura:

1. **TL;DR (max 1 strona)** — 5–7 kluczowych wniosków + jedna główna rekomendacja kierunkowa + największe ryzyko. Founder ma to przeczytać w 3 minuty i wiedzieć, co robić.
2. **Werdykt: potencjał biznesowy** — uczciwa ocena szansy (skala + uzasadnienie). Czy to lifestyle business (jedno życie utrzyma), realny startup, czy hobby z aspiracjami?
3. **Rynek i konkurencja** — TAM/SAM/SOM, pozycja vs Hevy i vs narzędzia trenerskie, obrona lub obalenie tezy „anti-Hevy".
4. **Rekomendacja modelu biznesowego** — który z 3 etapów `monetyzacja.md` i w jakiej kolejności; rozstrzygnięcie R2 (pricing) z modelem; unit economics z założeniami.
5. **Scenariusze strategiczne (A–D z §3.6)** — tabela porównawcza + rekomendowany wariant z uzasadnieniem i warunkami, w których byś go zmienił.
6. **Audyt funkcji** — tabela: funkcja → wartość/koszt utrzymania → werdykt (zostaw / wytnij / rozwiń / odłóż).
7. **Roadmapa rekomendowana** — co robić w kolejnych 3 / 6 / 12 miesiącach, z bramkami decyzyjnymi (metryki, które przełączają decyzje).
8. **Ryzyka i mitygacje** — ranking wg (prawdopodobieństwo × wpływ).
9. **Najtańsze walidacje do zrobienia TERAZ** — 3–5 eksperymentów, które za mały koszt zredukują największą niepewność, zanim founder zbuduje cokolwiek więcej.
10. **Pytania otwarte do właściciela** — decyzje, których nie rozstrzygniesz bez jego wkładu (finanse, apetyt na ryzyko, gotowość do B2B/sprzedaży trenerom, horyzont czasowy).

**Ton:** partnerski, konkretny, poparty dowodami z docsów i (jeśli masz) z rynku. Rekomendacje warunkowe („jeśli X, to Y, bo Z"), nie kategoryczne. Flaguj każdą decyzję opiniotwórczą jawnie.

---

## 8. Pierwszy krok

Zacznij od przeczytania §2 Priorytet 1 (trzy pliki) + `CLAUDE.md` + `docs/HANDOFF.md`. Dopiero potem pisz. Jeśli po lekturze uznasz, że brakuje krytycznego wejścia (np. finanse, apetyt na ryzyko właściciela) — **zbierz te pytania i zadaj je na początku**, zamiast zgadywać. Reszta audytu może iść na jawnie oznaczonych założeniach.
