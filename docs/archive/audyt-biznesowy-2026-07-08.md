# Arco — audyt biznesowy i strategiczny

> **Data:** 2026-07-08 · **Autor:** agent-analityk biznesowy (brief: `brief-audyt-biznesowy.md`, 2026-07-07)
> **Podstawa:** `monetyzacja.md`, `konkurencja-hevy.md`, `roadmap.md` + weryfikacja rynkowa (web, 2026-07-08).
> **Zastrzeżenie wejściowe:** `CLAUDE.md`, `HANDOFF.md` i pliki Priorytetu 3 nie były dostępne w tej sesji — audyt opiera się na trzech plikach Priorytetu 1 i opisie stanu produktu z briefu §1. Wnioski zależne od stanu kodu/długu technicznego oznaczam jako [ZAŁOŻENIE]. Zero danych użytkowych (single-account, przed H2) — każdy wniosek ilościowy to hipoteza z jawnym uzasadnieniem.
> **Legenda oznaczeń:** [DANE] = zweryfikowane źródło zewnętrzne · [DOCS] = liczba z kanonu, niezweryfikowana niezależnie · [ZAŁOŻENIE] = mój szacunek z uzasadnieniem.

---

## 1. TL;DR

**Główna rekomendacja kierunkowa:** nie zmieniaj sekwencji budowy (H1→H2 idzie dobrze), ale **odwróć sekwencję walidacji**. Zanim zbudujesz cokolwiek pod monetyzację consumer (etap 1), przeprowadź smoke test warstwy trenerskiej — bo to ona jest jedynym elementem planu, który wychodzi ponad lifestyle business, a jednocześnie jedynym, o którym nie wiesz prawie nic. Koszt testu: ~2 tygodnie wieczorów i klikalna makieta w Figmie. Zero kodu.

Siedem kluczowych wniosków:

1. **Największa ślepa plamka kanonu: Hevy Coach istnieje.** `konkurencja-hevy.md` audytuje Hevy jako consumer-loggera i nie wspomina, że Hevy prowadzi dojrzałą platformę trenerską (Hevy Coach: 1–500 podopiecznych, 30 dni triala, podopieczny loguje w apce Hevy **za darmo** i dostaje gratis Hevy Pro) [DANE]. Teza z `monetyzacja.md`, że „strukturalna przewaga = podopieczny już loguje granularne dane", jest **dokładnie modelem Hevy Coach** — tyle że u nich działa na bazie 2M+ userów od lat. Przewaga nie jest strukturalna. Jest co najwyżej **lokalizacyjna** (Hevy Coach wspiera wyłącznie angielski [DANE], zero PL-native GTM, faktur, kontekstu VAT).
2. **Consumer premium PL to lifestyle business z twardym sufitem — i kanon ma rację, że to etap, nie destination.** Matematyka sufitu z `monetyzacja.md` (15–30k zł MRR) broni się po weryfikacji; moim zdaniem jest wręcz optymistyczna w części MAU (§3.3).
3. **Warstwa trenerska ~55k zł MRR jest policzona na nierealnym założeniu 10% penetracji.** Realistycznie, dla solo-foundera bez marki, w 24 miesiące: 2–4% × 7 000 trenerów = **11–22k zł MRR** z trenerów. Nadal najlepszy segment planu — ale to nie jest „silnik", to drugi silniczek. Razem z consumer: 25–50k zł MRR w optymistycznym scenariuszu 2–3 lat. To dobre jednoosobowe biznesowe życie, nie startup.
4. **Teza „anti-Hevy" broni się jako strategia retencji, nie jako moat płatniczy.** Guidance rule-based jest kopiowalny w jeden kwartał przez zespół Hevy (13 osób [DANE]) — tabela moatów w `konkurencja-hevy.md` zakłada „sprzeczne z DNA", ale Hevy Coach dowodzi, że Hevy wychodzi poza DNA „księgi", gdy widzi przychód. Prawdziwa obrona Arco to nisza + język + relacja z trenerem, nie feature.
5. **Build-before-validate to obecnie największe ryzyko wykonawcze** — większe niż konkurencja. Rdzeń jest dopracowany na poziomie, którego nie zweryfikował ani jeden obcy użytkownik. H2 (3–5 osób) jest zaplanowany dobrze, ale testuje usability, nie willingness-to-pay ani tezę trenerską. Trzy najtańsze walidacje (§9) redukują więcej niepewności niż kolejne 3 sprinty kodu.
6. **R2 (pricing): rekomendacja 14,99 zł/mies z kotwicą roczną 99 zł/rok, reverse trial 21 dni.** Nie schodź do poziomu Hevy — przy Twojej skali gra wolumenem jest matematycznie martwa, a 7,5 zł/mies sygnalizuje „kolejny logger". Szczegóły i model w §4.
7. **Bramka kont+RODO jest cięższa, niż wygląda w roadmapie** — szacuję 4–7 tygodni wieczorowej pracy + koszty stałe (§6). To realny argument, żeby smoke test trenerski zrobić PRZED nią, nie po.

**Największe ryzyko:** Hevy dodaje polski język do Hevy Coach (koszt dla nich: tygodnie), zanim Arco zdobędzie pierwszych 50 trenerów. Mitygacja: szybkość wejścia w relacje z trenerami + rzeczy, których globalny gracz nie zrobi (PL faktury, integracja z realiami rozliczeń trenera w PL, guidance po polsku, wsparcie po polsku).

---

## 2. Werdykt: potencjał biznesowy

**Klasyfikacja: solidny kandydat na lifestyle business (30–60k zł MRR w horyzoncie 3 lat w scenariuszu powodzenia), z opcją — nie obietnicą — czegoś większego, jeśli warstwa trenerska złapie i obroni się przed lokalizacją Hevy Coach.**

Uzasadnienie skali:

- **W górę ogranicza Cię rynek i model.** PL-first + dziennik siłowy + subskrypcja consumer to kategoria, w której nawet lider globalny (Hevy) po ~7 latach robi ~$600–800k/mies [DANE: Sensor Tower ~$600k/mies; doniesienia o ~$800k MRR na pocz. 2026] na 2M+ userach i całym świecie. Polska to ułamek tego TAM, a Ty startujesz bez efektu sieciowego i bez zespołu.
- **W dół chroni Cię koszt.** Stack (Vercel + Supabase) przy Twojej skali kosztuje grosze, akwizycja organiczna, zero payrollu. Break-even jest niski — to biznes, który może być rentowny przy 2–3k zł MRR. Wysoka odporność, niski upside: klasyczny profil bootstrap.
- **Fitatu jako precedens się broni, ale słabo transferuje.** Zweryfikowane: ~26,8 mln zł przychodu, ~2,96 mln zł zysku netto (2023) [DANE: KRS/BizRaport]. Tylko że Fitatu gra w kategorii „liczenie kalorii", gdzie (a) TAM to każdy odchudzający się Polak, nie bywalec siłowni z ambicją progresji, (b) monetyzują też reklamami, które świadomie odrzuciłeś. Fitatu dowodzi, że PL-first health app może być biznesem — nie dowodzi, że dziennik siłowy nim będzie.
- **Czy to hobby z aspiracjami?** Nie — na to produkt jest za dojrzały, a plan monetyzacji za konkretny. Ale granica między „lifestyle business" a „hobby, które zwraca koszty" przebiega dokładnie na bramce z `monetyzacja.md` (konwersja >2%) i na tym, czy znajdziesz 30 płacących trenerów w pierwszych 6 miesiącach etapu 2.

Pytanie zwrotne (patrz §10): **jaki MRR czyni to dla Ciebie sensownym głównym zajęciem** obok/zamiast kontraktu JDG? Bez tej liczby „warto/nie warto" jest niedomknięte — przy progu 20k zł/mies plan jest realistyczny; przy progu 60k zł/mies wymaga wariantu B i sporo szczęścia.

---

## 3. Rynek i konkurencja

### 3.1 Walidacja liczb wejściowych

| Liczba z docsów | Werdykt | Źródło / komentarz |
|---|---|---|
| ~3 mln regularnych bywalców siłowni | ✅ potwierdzone, dziś raczej 3,1 mln | [DANE] Polski Związek Fitness / BodyMedia 2024: 3,1 mln członków klubów (8–9% populacji); wizyty +40% vs pre-pandemia |
| ~2 700 klubów | ✅ potwierdzone (~2 760) | [DANE] jw. |
| ~7 000 trenerów personalnych | ⚠️ potwierdzone, ale to dana z 2021 | [DANE] Zawodtrener.pl/Interia. Rynek od tego czasu urósł; realna liczba dziś prawdopodobnie 8–10k [ZAŁOŻENIE], ale część to dorywczy/martwi zawodowo. 7k jako baza kalkulacji jest bezpiecznie konserwatywne |
| ~30% nowych klientów klubów bierze trenera | ⚠️ słabe źródło | Znalazłem tę liczbę tylko w treści content-marketingowej. Twardsza dana: **3–5% bywalców korzysta z trenera w danym miesiącu = 80–135k osób/mies** [DANE: Deloitte via Zawodtrener]. Do modelu używaj tej drugiej |
| Hevy ~$600k/mies | ✅ potwierdzone, możliwe że zaniżone | [DANE] Sensor Tower: ~$600k/mies; publiczne wzmianki o ~$800k MRR (pocz. 2026). 13 pracowników, bootstrap |
| Fitatu ~26,8 mln zł / ~3 mln zł | ✅ potwierdzone | [DANE] KRS 0000635344, sprawozdanie 2023 |
| Konwersje freemium 2,1% / 4,5% top | 🔶 niezweryfikowane wprost | Spójne z branżowymi raportami subskrypcyjnymi (rząd wielkości się zgadza); traktuj jako [DOCS], nie [DANE] |

### 3.2 TAM / SAM / SOM (PL-first)

**Consumer (dziennik siłowy):**
- TAM: 3,1 mln członków klubów [DANE] + szara strefa garaży/domów — zaokrąglijmy do ~3,5 mln trenujących siłowo [ZAŁOŻENIE].
- SAM: osoby, które trenują na tyle poważnie, żeby *cokolwiek* logować (papier, notatki, apka) — w badaniach zachowań siłownianych to typowo 15–25% regularnych [ZAŁOŻENIE, brak twardej PL-danej]: **~450–750k osób**.
- SOM (2–3 lata, solo, organicznie): 30–60k MAU z `monetyzacja.md` to **górna granica** SOM, nie środek. Bez budżetu marketingowego i bez efektu sieci realistyczny środek to 10–30k MAU [ZAŁOŻENIE]. Stąd moja korekta sufitu w §3.3.

**Trenerski (B2B):**
- TAM: ~7 000 aktywnych trenerów [DANE 2021] — ale uwaga: tylko część prowadzi klientów w modelu, gdzie appka ma sens (programowanie + zdalny nadzór). Trener „godzinowy na sali", który nie pisze programów, nie potrzebuje Arco.
- SAM: trenerzy prowadzący klientów programowo (online, hybrydowo, pakiety) — [ZAŁOŻENIE] 30–50% populacji trenerów: **2 100–3 500**.
- SOM (24 mies., solo GTM przez IG/kluby): 2–4% TAM = **140–280 płacących trenerów**. Przy 79 zł/mies: **11–22k zł MRR**. Docsowe 10% (700 trenerów, 55k MRR) wymaga marki, poleceń i czasu, których w 24 miesiące nie będzie — traktuj 55k jako scenariusz na rok 3–4, warunkowany sukcesem wcześniejszych etapów.

**Kiedy PL-first przestaje służyć:** w consumer — właściwie od razu jest sufitem, ale świadomie zaakceptowanym (słusznie: walidacja tanim rynkiem, który znasz). W trenerskim — PL-first jest **przewagą**, nie ograniczeniem, bo lokalność (język, faktury, VAT, relacje, kluby) to jedyna rzecz, której Hevy Coach nie ma. Ekspansja EN w consumer to walka z Hevy na jego boisku — odradzam ją w każdym horyzoncie poza „produkt sam się rozlał organicznie". Ekspansja trenerska na rynki CEE bez dobrego natywnego narzędzia (CZ/SK/RO?) to ciekawszy kierunek na etap 3 niż EN — ale to decyzja na po 50k MRR, zgodnie z kanonem.

### 3.3 Korekta matematyki sufitu consumer

Docsy: 30–60k MAU × 3% × 17 zł = 15–30k zł MRR. Dwie poprawki:
1. MAU: realistyczny środek 10–30k (jak wyżej).
2. Konwersja 3% zakłada wynik powyżej mediany kategorii (2,1% [DOCS]) od startu. Uczciwiej: 1,5–2,5% w pierwszym roku paywalla.

Skorygowany przedział: **10–30k MAU × 1,5–2,5% × 15 zł ≈ 2–11k zł MRR** w horyzoncie, w którym docsy widzą 15–30k. Wniosek kanonu („fundament walidacyjny, nie model docelowy") jest więc jeszcze bardziej prawdziwy, niż kanon sądzi. Praktyczna konsekwencja: **nie optymalizuj etapu 1 pod MRR w ogóle** — optymalizuj pod (a) sygnał konwersji, (b) budowę darmowej bazy pod trenerów, (c) nauczenie się płatności/RODO na małej skali.

### 3.4 Pozycja vs Hevy — obrona i obalenie tezy „anti-Hevy"

**Co się broni:**
- **Frictionless + guidance jako klin retencyjny** — tak, to realna różnica doświadczenia „co sesję", nie wymaga sieci, i jest zgodna z tym, czego pasywny logger nie daje. Jako powód, żeby *zostać* w Arco — mocne.
- **Kameralne pody zamiast feedu** — filozoficznie spójne i omija problem masy krytycznej. Jako przyszła warstwa retencji — OK.
- **PL-native charakter** — niedoceniane w docsach: guidance po polsku („dołóż 2,5 kg, bo pełny zakres") to inna jakość komunikatu niż angielski interfejs dla przeciętnego bywalca siłowni w PL.

**Co się nie broni:**
- **„Hevy nie skopiuje, bo sprzeczne z DNA".** Hevy Coach jest dowodem, że Hevy wychodzi poza DNA pasywnej księgi, gdy widzi segment przychodowy. Sugestie progresji to naturalny feature ich płatnego tieru; ich forum/reddit regularnie o to prosi. Zakładaj, że **guidance-podobny feature pojawi się w Hevy w horyzoncie 12–24 mies.** [ZAŁOŻENIE] i że Twoja obrona to nie funkcja, tylko nisza+język+relacje.
- **Tabela moatów przeszacowuje „dane bez limitów"** — to nie moat, to brak dźwigni cenowej Hevy u Ciebie; neutralne.
- **„Charakter/marka"** — słusznie oznaczone 🟡; przy solo-founderze to koszt utrzymania spójności, nie fosa.

**Werdykt tezy:** „anti-Hevy" jest **dobrą strategią produktową i złą strategią obronną**. Zmień ramę: nie „czym różnimy się od Hevy", tylko „dla kogo Hevy jest za duże/za obce/za angielskie". To przesuwa Cię z konkurowania na pozycjonowanie niszowe — jedyna gra, którą solo wygrywa.

### 3.5 Konkurencja warstwy trenerskiej (docelowy silnik)

| Gracz | Cena | Siła | Słabość vs Arco PL |
|---|---|---|---|
| **Hevy Coach** | wg liczby podopiecznych, klient loguje za darmo (dostaje Hevy Pro gratis) [DANE] | Dojrzały produkt, baza 2M+ userów Hevy, najlepszy logging klienta w kategorii | **Tylko angielski** [DANE], brak PL GTM, faktur, wsparcia PL |
| Trainerize | od ~$10–20/mies, szybko rośnie z klientami + płatne moduły [DANE] | Ekosystem, integracje (wearables), marka | Drogi przy skali, przeładowany, EN, nie-PL realia rozliczeń |
| TrueCoach | $26–137/mies wg klientów + **5% od płatności** [DANE] | Polish UX, marka w S&C | jw. + prowizja od płatności |
| Indefit i PL-native | ~15 zł/mies [DOCS] | Cena, język | Wg kanonu słabe produktowo [DOCS — nie weryfikowałem niezależnie; zrób to w ramach walidacji §9] |
| Excel/Kartka | 0 zł | Zero tarcia dla trenera | Zero danych zwrotnych z treningu klienta — to jest realny konkurent nr 1 |

Kluczowa obserwacja: **konkurentem nr 1 dla warstwy trenerskiej nie jest Trainerize, tylko Excel + Messenger.** GTM musi sprzedawać nie „lepsze narzędzie niż Trainerize", tylko „przestań być niewidomy między sesjami — zobacz, czy klient zrobił 3×8 przy RIR 2, zanim przyjdzie". A to jest dokładnie pitch, który Hevy Coach już opanował po angielsku. Twoje okno: polski język + polskie realia + osobista relacja. Okno się zamyka w tempie, w jakim Hevy dodaje języki.

**Ladder:** inspiracja, nie sygnał zajętej niszy — Ladder gra w „trenowanie z programów gwiazd + team accountability" (USA, wideo-first), to inna kategoria niż logger-z-guidance. Wzorce UX bierz śmiało; strategicznie nie koliduje.

---

## 4. Rekomendacja modelu biznesowego

### 4.1 Kolejność etapów — modyfikacja, nie rewolucja

Kanon: etap 1 (consumer premium) → etap 2 (trenerzy) → etap 3 (gate). Rekomendacja: **zachowaj kolejność budowy, odwróć kolejność walidacji** (pełny argument w §5, wariant B'):

1. **Teraz (przed bramką RODO):** smoke test trenerski (§9.1) + testy H2 zgodnie z planem.
2. **Potem:** bramka kont+RODO (i tak potrzebna dla obu etapów) → etap 1 consumer premium jako **maszyna do sygnału i budowy darmowej bazy**, nie do MRR.
3. **Równolegle z etapem 1:** pierwszych 5–10 trenerów na ręcznym, brzydkim MVP warstwy trenerskiej (choćby read-only dashboard podopiecznych), jeśli smoke test dał sygnał.

Uzasadnienie (Co/Dlaczego/Kiedy/Ryzyko): **Co:** walidować etap 2 przed pełnym wdrożeniem etapu 1. **Dlaczego:** etap 2 jest jedynym komponentem z upside'em, ma największą niepewność (nie istnieje w produkcie ani w danych) i najkrótsze okno konkurencyjne (lokalizacja Hevy Coach). **Kiedy:** natychmiast — koszt to rozmowy i makieta, nie kod. **Ryzyko:** rozprasza od H1/H2; mityguj timeboxem (2 tyg. wieczorów) i zakazem pisania kodu w ramach testu.

### 4.2 Rozstrzygnięcie R2 (pricing)

**Rekomendacja: 14,99 zł/mies · 99 zł/rok (≈8,25 zł/mies efektywnie) · reverse trial 21 dni. Bez lifetime na starcie (ew. founder's edition 249 zł limitowana do 100 sztuk jako test WTP i zastrzyk gotówki).**

Argumentacja:
- **Gra wolumenem jest dla Ciebie matematycznie martwa.** Przy 9,90 zł i realistycznym SOM różnica vs 14,99 zł to ~30% MRR na etapie, którego celem i tak nie jest MRR. Niska cena nie kupi Ci wolumenu — wolumen kupuje dystrybucja, której nie masz.
- **Kotwica Hevy jest realna, ale dotyczy innego produktu.** Świadomy user porównujący ceny to user, który już zna Hevy — jego i tak nie przekonasz ceną, tylko guidance po polsku i importem historii (patrz §9.4). Pozycjonuj przeciwko cenie treningu personalnego (80–120 zł/h [DANE: Superprof]), nie przeciwko Hevy: „mniej niż 1/5 jednego treningu z trenerem miesięcznie".
- **Roczny 99 zł robi robotę psychologiczną:** efektywnie zbliża Cię do kotwicy Hevy (~7,5 zł/mies) dla wrażliwych cenowo, poprawia cash flow i retencję, a miesięczny 14,99 broni pozycjonowania premium.
- **Reverse trial 21 dni** — zgodne z rozstrzygniętym R3 i z benchmarkiem [DOCS: triale 17–32 dni konwertują ~45,7%]. Po trialu spadek do free z guidance-lite; pełny guidance, głęboka analityka i nielimitowane programy w paid — podział z R3 jest dobrze zaprojektowany, walidację podziału zrobi dopiero paywall na żywo.
- **Warunek zmiany rekomendacji:** jeśli H2 + wywiady (§9.3) pokażą, że guidance nie jest odczuwalny jako „warte pieniędzy" (ludzie mówią „fajne", nikt nie mówi „za to bym zapłacił") — wtedy nie obniżaj ceny, tylko wróć do rysownicy z pakowaniem wartości. Cena nie naprawia packaging'u.

**Trenerski pricing (etap 2):** 59–99 zł/mies z kanonu jest OK jako hipoteza; sugeruję **prostą jedną cenę 79 zł/mies do 15 podopiecznych, potem 129 zł bez limitu** — trenerzy w źródłach [DANE] wprost nienawidzą pełzających progów per-client (to główny ból Trainerize/TrueCoach). „Płaska, przewidywalna cena po polsku" to sama w sobie różnica.

### 4.3 Unit economics (jawne założenia)

Consumer, scenariusz bazowy po 12 mies. paywalla: CAC ≈ 0 zł gotówki (organiczny/content/pody), ale ~realny koszt = Twój czas. ARPU ≈ 11 zł/mies (mix roczny/miesięczny) [ZAŁOŻENIE]. Churn miesięczny 6–8% (kategoria fitness, złagodzone guidance/streak) [ZAŁOŻENIE] → LTV ≈ 140–180 zł. Przy braku płatnego CAC każdy subskrybent jest rentowny od 1. miesiąca; wąskim gardłem nie jest ekonomia jednostkowa, tylko **wolumen na górze lejka** — kolejny argument, że etap 1 to nie biznes, tylko instrument.

Trener: ARPU 79 zł/mies, churn 2–3%/mies (retencję trzyma relacja z klientami w systemie) [ZAŁOŻENIE] → LTV 2 600–3 900 zł. CAC = godziny Twojego outreachu; przy 3–5h na pozyskanego trenera (DM→demo→onboarding) to ekonomia bezdyskusyjnie dodatnia. **Cała gra rozstrzyga się w pytaniu, czy chcesz robić sprzedaż bezpośrednią** (§10, pytanie 2).

### 4.4 Modele odrzucone — czy słusznie?

- **Reklamy:** słusznie odrzucone dla rdzenia. Jedna uwaga: Fitatu pokazuje, że w PL health-apps reklamy w free tier współistnieją z premium [DANE: recenzje Google Play wzmiankują reklamy]. Nie wracaj do tego przed etapem 3 — ale nie wykreślaj z wyobraźni na zawsze, jeśli darmowa baza urośnie a konwersja nie.
- **Lifetime jako model główny:** słusznie odrzucone (kanibalizuje LTV przy małej bazie). Founder's edition jak wyżej — tak.
- **Marketplace programów:** decyzja właściciela, argument kanibalizacji jest spójny — nie znajduję mocnego kontrargumentu, podtrzymuję.

---

## 5. Scenariusze strategiczne

| | **A. Status quo** | **B. Pivot trenerski (etap 2→1)** | **B'. Sekwencja z briefu + walidacja trenerska teraz** ⭐ | **C. Wąska nisza (home/dumbbell + guidance)** | **D. Social-first (pody wcześniej)** |
|---|---|---|---|---|---|
| **Dla kogo** | Poważny ćwiczący PL | Trener programujący klientów | Oba, w kolejności: ćwiczący → trener | Trenujący w domu, minimalny sprzęt | Pary/trójki znajomych z siłowni |
| **Jak zarabia** | Freemium 14,99 zł | 79 zł/mies od trenera, klient free | Etap 1 = sygnał+baza; etap 2 = przychód | Freemium, niższy sufit | Brak jasnego modelu przed masą |
| **Co budować** | Bramka RODO → paywall | Dashboard trenera, relacja w modelu danych, GTM sprzedażowy od zaraz | Nic nowego teraz; makieta + rozmowy; dashboard dopiero po sygnale | Redukcja: wyciąć heatmapy klubowe, presety pod home | Pody, zaproszenia, push (natyw!) |
| **Główne ryzyko** | Sufit 2–11k MRR; Hevy dodaje guidance | Budujesz B2B bez walidacji, że trenerzy PL zapłacą; porzucasz dopracowany consumer | Rozproszenie uwagi na 2 tygodnie | Rynek być może za mały do zmierzenia | Docsy same to flagują: pusty feed; natyw = miesiące pracy |
| **Sygnał „działa"** | Konwersja >2% po 3 mies. | 10 trenerów płaci w 90 dni | Smoke test: ≥30% rozmów kończy się „zapiszcie mnie na beta" | Retencja W4 >40% w niszy | ≥50% podów aktywnych po 4 tyg. |
| **Werdykt** | Bezpieczny, ale optymalizuje najmniejszy segment planu | Za wcześnie o jeden krok — sprzedajesz produkt, którego nie ma, i wyrzucasz przewagę zbudowanego consumer | **Rekomendowany** | Trzymaj jako plan awaryjny po nieudanym H2 | Odrzucam zgodnie z docsami |

**Rekomendacja: B'** — bo jest dominujący: zachowuje wszystko z A (H1→H2 idzie bez zmian), kupuje kluczową informację z B za ~2 tygodnie wieczorów, i niczego nieodwracalnie nie przesądza. **Warunki zmiany:** (a) smoke test trenerski wypada martwo (<10% zainteresowania po 20 rozmowach) → wracasz do czystego A z pełną świadomością, że budujesz lifestyle business consumer i sufit akceptujesz; (b) smoke test wypada gorąco (trenerzy pytają „kiedy, ile, biorę") → rozważ pełne B: przesunięcie dashboardu trenera przed consumer paywall, bo sygnał popytu bije hipotezę konwersji.

---

## 6. Audyt funkcji

Metoda: wartość dla retencji/WTP vs koszt utrzymania (solo). [ZAŁOŻENIE] tam, gdzie oceniam bez dostępu do kodu i danych użycia.

| Funkcja | Wartość | Koszt utrzymania | Werdykt |
|---|---|---|---|
| Frictionless logging (pre-fill, tap) | Rdzeń — to jest produkt | Średni | **Zostaw, pielęgnuj jako nr 1** |
| Rule-based guidance (`lib/guidance.ts`) | Rdzeń wyróżnika i przyszłego paid | Średni (reguły będą puchnąć) | **Zostaw; dyscyplina: max prostota reguł do czasu danych** |
| Kalendarz + passa | Wysoka retencja, tanie | Niski | Zostaw |
| Ekran celebracji + cel tygodniowy | Retencja emocjonalna, spójne z marką | Niski | Zostaw |
| Heatmapa mięśni + Muscle Split % | Średnia — „wow" przy demo, niejasny wpływ na retencję | Średni | **Zostaw, ale zamroź rozwój do danych z H2**; to też przyszły asset dashboardu trenera (heatmapa podopiecznego!) |
| Postępy (delta-karty, trendy) | Wysoka dla ICP zaawansowanego; przyszły paid | Średni | Zostaw; kandydat na wyróżnik paid |
| Ciało (zdjęcia sylwetki) | Niska-średnia; wrażliwe dane = koszt RODO nieproporcjonalny | Średni + ryzyko prawne (dane biometryczno-podobne, Storage, retencja) | **Odłóż/ukryj za flagą przed publicznym signupem**; wróci przy trenerach (progress-photos to standard coachingu), wtedy z pełnym RODO |
| 8 programów | OK; nie rozbudowuj | Niski | Zostaw, „mniej-ale-lepiej" wygrywa — nowe presety tylko pod onboarding (PPL/UL wystarczą) |
| 873 ćwiczeń + picker z filtrami | Baza OK; jakość zdjęć to znany dług [DOCS: hotlink/link-rot] | Średni | Zostaw; **zamknij ryzyko hotlinków przed launchem** (self-host wyselekcjonowanych ~200 najczęstszych) [ZAŁOŻENIE co do skali problemu] |
| Custom ćwiczenia | Potrzebne dla ICP | Niski | Zostaw |
| Offline/outbox, PWA, wake lock | Niewidzialny fundament zaufania | Średni | Zostaw; poprawność offline (Sprint 5) to must przed paywallem — płacący user nie wybacza zgubionej serii |
| AI-podrasowanie zdjęć (H3) | Kosmetyka | Jednorazowy, ale duży | **Odłóż za H2** — ładne zdjęcia nie zmienią żadnej metryki decyzyjnej |
| Metaliczne ikony 3D (H3, re-ocena) | Gimmick-risk, sam to flagujesz | Średni | Wytnij z planów do odwołania |

**Czego brakuje do pierwszego płatnego wdrożenia** (poza Stripe): bramka kont+RODO. Szacunek ciężaru [ZAŁOŻENIE, kalibrowany na Twoje tempo z docsów]: signup+weryfikacja+reset+usunięcie konta ~1–2 tyg.; audyt RLS pod realny multi-user ~3–5 dni; eksport danych (RODO) ~2–4 dni; polityka prywatności+ToS+regulamin płatności ~3–5 dni z szablonami + koszt konsultacji prawnej (rekomendowana, 1–2,5k zł jednorazowo); Stripe+faktury (np. przez Stripe Tax / integrację z PL fakturownią) ~1 tyg.; rate limiting, backupy/PITR ~2–3 dni. **Razem: 4–7 tygodni wieczorowej pracy.** To nie jest „checkbox przed etapem 1" — to mini-projekt. Zaplanuj go jako osobny sprint-blok i nie zaczynaj przed wynikiem H2.

---

## 7. Roadmapa rekomendowana

**0–3 miesiące (lipiec–wrzesień 2026):**
- H1 dokończ zgodnie z planem (S9-cz.2 → S10, Sprint 5 poprawność offline przed wszystkim innym płatnościowym).
- **Równolegle, timebox 2 tyg.: smoke test trenerski (§9.1).** Bez kodu.
- H2: testy z 3–5 osobami wg `usability-audit.md` + dołóż moduł wywiadu o WTP (§9.3) do tej samej sesji — masz już ludzi w pokoju, wykorzystaj ich podwójnie.
- Decyzja bramkowa #1 (koniec września): sygnał trenerski gorący/letni/martwy × wynik H2. Gorący → wciągnij minimalny dashboard trenera do planu Q4. Martwy → czyste A, akceptujesz sufit.

**3–6 miesięcy (październik–grudzień 2026):**
- Bramka kont+RODO jako dedykowany blok (4–7 tyg.).
- Etap 1: reverse trial 21 dni, 14,99/99 zł, guidance-lite/full wg R3. Launch cichy: społeczności PL (bez spektaklu — chcesz danych, nie tłumu).
- Jeśli sygnał trenerski był gorący: 5 trenerów founding-partners na ręcznym MVP (nawet read-only widok podopiecznych + Ty jako „support API"), 0 zł przez 3 mies. w zamian za feedback i case studies.
- Decyzja bramkowa #2 (koniec grudnia): trial→paid ≥25% i konwersja całkowita ≥1,5% po pierwszej iteracji → kontynuuj; poniżej → nie iteruj paywalla dłużej niż kanoniczne 3 mies.

**6–12 miesięcy (2027 H1):**
- Scenariusz „trener żyje": dashboard trenera produkcyjnie, cel 30 płacących trenerów do końca H1 2027 (to ~2,4k zł MRR z trenerów + ich podopieczni jako darmowa baza consumer). GTM: 5 DM-ów dziennie, 2 demo tygodniowo — rytm, nie kampania.
- Scenariusz „tylko consumer": optymalizacja konwersji + decyzja właścicielska o akceptacji sufitu lub wariancie C.
- Decyzja bramkowa #3 (połowa 2027): łączny MRR ≥8k zł i rosnący → to jest biznes, planuj redukcję kontraktu JDG; MRR <3k zł → produkt zostaje zadbanym side-projectem i to też jest legalny wynik.

Bramki celowo z liczbami niższymi niż kanoniczne „2%/55k" — mierzą **kierunek przy Twojej skali**, nie branżowe mediany osiągane przez firmy z zespołami.

---

## 8. Ryzyka i mitygacje (ranking: prawdopodobieństwo × wpływ)

1. **Lokalizacja Hevy Coach na PL / dodanie guidance przez Hevy** (P: średnie-wysokie w 24 mies., W: wysoki). Mitygacja: szybkość wejścia w relacje trenerskie; przewagi nie-produktowe (PL faktury, wsparcie, społeczność founding-trenerów); import z Hevy (§9.4) jako dwukierunkowa broń.
2. **Build-before-validate — kolejne pół roku polerowania bez obcego użytkownika** (P: wysokie — to Twój udokumentowany wzorzec, W: wysoki jako koszt alternatywny). Mitygacja: H2 i smoke test mają twarde daty; reguła „żaden nowy feature poza H1 przed wynikiem H2".
3. **Bus factor 1 / wypalenie po launchu** (P: średnie, W: krytyczny). Mitygacja: zakres świadomie lifestyle'owy (to zaleta wariantu B' — nie dokłada zobowiązań przed sygnałem); wsparcie ograniczone godzinowo w regulaminie; monitoring/alerty zamiast dyżurów.
4. **Bramka RODO niedoszacowana → opóźnia etap 1 o kwartał** (P: średnie, W: średni). Mitygacja: potraktuj §6-szacunek jako plan; szablony + jednorazowa konsultacja prawna zamiast samodzielnego researchu prawa.
5. **Konwersja poniżej kill-progu przy poprawnym produkcie** (P: średnie — kategoria jest brutalna, W: średni, bo plan tego nie wyklucza). Mitygacja: etap 1 zaprojektowany jako sygnał, nie przychód; decyzja bramkowa #2 z limitem iteracji.
6. **Link-rot zdjęć ćwiczeń w środku płatnego produktu** (P: wysokie kiedyś, W: niski-średni). Mitygacja: self-host top ~200 przed launchem.
7. **RODO przy trenerach: widoczność danych podopiecznego bez poprawnej zgody** (P: niskie przy świadomym designie, W: wysoki reputacyjnie). Mitygacja: zgoda podopiecznego jako first-class obiekt w modelu danych od pierwszej wersji dashboardu (masz to już zaflagowane w R5 — podtrzymuję i podbijam wagę).

---

## 9. Najtańsze walidacje do zrobienia TERAZ

1. **Smoke test trenerski (koszt: ~2 tyg. wieczorów, 0 zł).** Klikalna makieta dashboardu w Figmie (Twoja dzienna broń — masz przewagę, której 99% founderów nie ma: zrobisz makietę nieodróżnialną od produktu). 20 trenerów z IG/lokalnych klubów, DM + 15-min rozmowa: jak dziś prowadzą klientów między sesjami, co ich boli, pokaz makiety, na końcu **twarde pytanie o pieniądze**: „79 zł/mies — zapisać cię na betę?". Sygnał: liczba „tak, zapisz" / 20. Przy okazji zweryfikujesz [DOCS] o słabości Indefit — zapytaj, czego używają.
2. **Landing + lista oczekujących consumer (koszt: 1–2 wieczory, ~50 zł na domenę).** Jedna strona: obietnica („dziennik, który wie, kiedy dołożyć"), 3 screeny, zapis na betę + jedno pytanie w formularzu: „czego używasz dziś?". Wrzucona w 3–4 społeczności PL. Mierzy: czy komunikat guidance w ogóle rezonuje, zanim postawisz paywall.
3. **Moduł WTP doklejony do H2 (koszt: +20 min na sesję).** Po zadaniach usability: Van Westendorp light (4 pytania o cenę) + „która z tych trzech rzeczy jest warta pieniędzy: guidance / analityka / nielimitowane programy?". 3–5 osób to nie statystyka, ale kierunek packaging'u — tak.
4. **Import z Hevy (walidacja popytu, nie feature — koszt: 1 wieczór).** Hevy pozwala eksportować historię do CSV. Zanim to zbudujesz: wrzuć na landing checkbox „przenoszę się z Hevy — chcę import historii" i policz. Jeśli >30% zapisów go zaznacza, import staje się feature'em launchowym nr 1: neutralizuje największy switching cost i celuje dokładnie w userów, którzy już udowodnili, że logują. [Propozycja do decyzji właściciela — nie ma tego w kanonie.]
5. **Test kotwicy cenowej na liście oczekujących (koszt: 0 zł, po zebraniu ~100 zapisów).** Dwa warianty maila do bety (A: 14,99/99 zł, B: 9,90/79 zł), mierz klik „chcę trial". Tani, brudny, wystarczający do domknięcia R2 danymi zamiast opinią.

---

## 10. Pytania otwarte do właściciela

1. **Próg sensu:** przy jakim MRR Arco staje się głównym zajęciem, a przy jakim świadomie zostaje side-projectem? (Kalibruje bramkę #3 i w ogóle apetyt planu.)
2. **Apetyt na sprzedaż:** warstwa trenerska = DM-y, dema, rozmowy, follow-upy, czasem „nie". Czy to praca, którą *chcesz* wykonywać 5h/tydzień przez rok? Jeśli szczera odpowiedź brzmi „nie" — wariant B' traci silnik i wracamy do A z zaakceptowanym sufitem. To pytanie ważniejsze niż cały pricing.
3. **Horyzont i runway:** jak długo kontrakt JDG komfortowo finansuje wieczorowe tempo? Czy istnieje data, przed którą Arco „musi" coś pokazać?
4. **Granica ryzyka prawnego:** robisz RODO/regulaminy na szablonach + własnej analizie, czy budżetujesz konsultację prawną (1–2,5k zł)? Rekomenduję drugie, decyzja finansowa Twoja.
5. **Founding trainers za darmo:** zgadzasz się „płacić" produktem (3 mies. free + Twój czas supportu) za 5 trenerów-partnerów i prawo do ich case studies? To najtańszy GTM, jaki znam, ale kosztuje Twoje wieczory.
6. **Definicja „lifestyle business = sukces":** czy wynik „30k zł MRR, zero zespołu, produkt, z którego jesteś dumny" jest dla Ciebie wygraną, czy rozczarowaniem? Odpowiedź rozstrzyga, czy etap 3 (ekspansja) jest w ogóle na mapie, czy jest ozdobnikiem.

---

*Raport wyprodukowany zgodnie z §7 briefu. Żadne źródła prawdy (`roadmap.md`, `monetyzacja.md`, `CLAUDE.md`) nie zostały zmienione; wszystkie propozycje zmian w kanonie (m.in. dopisanie Hevy Coach do `konkurencja-hevy.md`, korekta matematyki sufitu i założenia 10% penetracji trenerów w `monetyzacja.md`) są do decyzji właściciela.*
