# Scenariusz H2 — testy z użytkownikami (skrypt sesji, kompletny)

> **Data:** 2026-07-08 · **Odświeżenie:** 2026-07-16 (Sprint 17) — pod aktualny UI (onboarding v3.1) i kanon `wizja-i-strategia-v3.md`: persony Paweł/Kasia/Radek, **trzy filary premium** (cel z prognozą · diagnoza stagnacji · pełna historia), yearly-first (99/rok), teaser stagnacji. Dodana §0.5 z operacyjnymi definicjami pomiaru i dwiema bramkami.
> **Podstawa:** `wizja-i-strategia-v3.md` §2–3 (persony, model) · `wizja-i-plan-produktu-v2.md` Krok 1 + §7 (bramki) + Z1–Z3 (§2) · `usability-audit.md` §C (zadania) · `feedback-uzytkownikow.md` #1 (first-click).
> **Format:** 1 sesja moderowana × 3–5 osób, ~70 min. Moderator: Ty. Ten plik = skrypt do wydruku/drugiego ekranu.
> **Status 2026-07-16:** metodologia pozostaje ważna, ale opis kroków odzwierciedla obecny UI. Nie używać jako finalnego skryptu przed wdrożeniem R0.5–R5b; w R6 aktualizujemy nazwy, ścieżki i dane startowe pod `userflows-docelowe-2026-07.md`, a następnie wykonujemy pilot.

---

## 0. Cel i bramka

Testujemy trzy rzeczy naraz: **(a) usability rdzenia** (zadania §3), **(b) willingness-to-pay** (moduł §4), **(c) tezę ekipową** (moduł §5).

**B1 zielona = obie bramki z §0.5 zielone** (użyteczność rdzenia I wartość+ekipa). Skrót: rdzeń bez porażek/bloków S4 · **≥3/5** wskazuje prowadzenie lub dane jako „warte dychy" · **≥3/5** ma „swojego Radka".
**B1 czerwona:** czerwony rdzeń = STOP (napraw rdzeń, zanim wrócisz z testem). Czerwona wartość przy zielonym rdzeniu = iteracja **packagingu, nie ceny**, przed bramką RODO (Krok 2).

## 0.5. Definicje pomiaru i dwie bramki *(dodane 2026-07-16 — czytaj PRZED pilotem)*

n=3–5 to badanie **jakościowe**. Progi liczbowe niżej są STOP-lightami do dyskusji, nie dowodem statystycznym — jedna spójna, dosłowna wypowiedź („nie wiedziałem, czy to się zapisało") waży więcej niż słupek. Rozstrzygnięcie B1 czytasz z **wzorców i cytatów**, nie z arytmetyki na pięciu osobach.

**Wynik zadania (zapisuj dla każdego Z1–Z5):**
- ✅ **Sukces** — ukończone bez pomocy, sensowną ścieżką (niekoniecznie „naszą").
- 🟡 **Z pomocą** — ukończone dopiero po podpowiedzi (odezwałeś się po odliczeniu do 10) albo po >1 ślepej uliczce.
- ❌ **Porażka** — nie ukończył, poddał się, albo wszedł w ścieżkę, z której nie wrócił.

**Dotkliwość każdego zgrzytu (nie tylko porażki) — do triażu P0/P1 po sesjach:**
- **S1 kosmetyka** — zauważył, nie przeszkadza. · **S2 tarcie** — spowolniło, dał radę sam.
- **S3 blok odwracalny** — utknął, wyszedł tylko z pomocą/przypadkiem. · **S4 blok twardy** — nie dokończył zadania.

**Bramka A · Użyteczność rdzenia (twarda, niezależna od WTP).** Rdzeń = **Z1–Z3** (pierwszy trening, logowanie serii, podmiana) — to jest „rdzeń pętli" z Z1 zasad, świętość produktu. **Zielona:** 0 porażek i 0 problemów S4 na Z1–Z3 u **≥4/5** osób. Czerwony rdzeń unieważnia całą resztę — nie ma sensu pytać o cenę produktu, w którym nie da się zalogować serii.

**Bramka B · Wartość + ekipa (sygnał gotowości do Kroku 2).** Multi-sygnał, obie połówki muszą być zielone:
- **Wartość:** ≥3/5 w B2 (wybór wymuszony) wskazuje **prowadzenie** LUB **dane/historię** jako „warte dychy" (NIE „programy bez limitu" — to hygiena, nie hak). Wzmocnienie: mediana „okazji" z Van Westendorpa ≥ 14,99 **i** „za drogo" wyraźnie > 14,99 (cena nie odbija się od sufitu grupy).
- **Ekipa:** ≥3/5 ma konkretnego „Radka" (C1). Wzmocnienie behawioralne (mocniejsze niż deklaracja): ≥3/5 zgadza się na kontakt przy testach ekip (pytanie 3 zamknięcia).

**Gdy bramki się rozjeżdżają:** A czerwona → STOP, iteracja rdzenia. B-wartość czerwona (A zielona) → packaging wartości przed Krokiem 2 (nie ruszaj ceny — B1 czerwona w tym sensie NIE znaczy „za drogo", znaczy „nie sprzedaliśmy po co to"). B-ekipa czerwona → ekipa spada do retencji, wzrost wraca do contentu (tabela bramek `roadmap.md`).

## 1. Rekrutacja i logistyka

- **Kto (3–5 osób):** min. 1 **początkujący** (trenuje <1 rok lub wraca po przerwie), min. 2 **trenujących poważnie** (≥2 lata, zna progresję), min. 1 osoba **używająca Hevy/Stronga** (porównanie z zakotwiczenia), min. 1 **kobieta** (kierunek inkluzywny z kanonu). Nie rekrutuj wyłącznie bliskich znajomych — będą mili.
- **Sprzęt:** **telefon uczestnika** (nie Twój!), prod (arco-olive). **DWA konta per osoba** (przygotuj skryptem przed sesjami): (a) **demo** — 2–3 tyg. historii + ≥1 flaga guidance (do Z0, Z4, Z5), (b) **świeże** (do Z1–Z3).
- **⚠️ Przełączenia kont — wpisane w skrypt, robi je MODERATOR (nie uczestnik):** demo → świeże (po Z0) i świeże → demo (po Z3). Przygotuj hasła pod ręką, przećwicz na pilocie — każde przełączenie >60 s zjada bufor i rozprasza uczestnika. (Wyjście awaryjne: drugi telefon Twój z kontem demo tylko do Z4–Z5, jeśli logowanie na procie okaże się wolne.)
- **Zgody:** ustna zgoda na notatki + (jeśli nagrywasz ekran) osobna zgoda. Zero danych osobowych w notatkach — P1…P5.
- **Czas (70 min):** 5' intro · 5' first-click · 25' zadania · 15' WTP · 10' ekipy · 5' zamknięcie · 5' bufor.
- **Zasady moderacji (przeczytaj przed każdą sesją):** think-aloud („mów, co myślisz, na bieżąco"); **nie pomagaj** — przy utknięciu licz do 10, potem „co próbujesz zrobić?"; nie broń produktu, nie tłumacz „bo to działa tak…"; zapisuj cytaty dosłownie; miary: ukończone/z pomocą/porażka + miejsca wahania.

## 2. Intro (5 min) — przeczytaj

> „Testuję aplikację, nie Ciebie — nie da się tu nic zepsuć ani odpowiedzieć źle. Mów na głos wszystko, co myślisz, także (zwłaszcza!) krytykę. Nie będę podpowiadał, bo chcę zobaczyć, czy apka broni się sama."

Pytania otwarcia: Jak często trenujesz? Gdzie (siłownia/dom)? Czym dziś zapisujesz treningi (apka/notes/pamięć/nic)? *(kalibruje personę — zapisz)*

## 3. Część A — first-click + zadania rdzenia (30 min)

> **Aktualizacja 2026-07-14:** Z0 testuje aktualny produkcyjny home. Nie pokazujemy starszych makiet ani nie tłumaczymy hierarchii przed zadaniem.

### Z0 · First-click test (feedback #1) — konto DEMO
Wręcz telefon z apką otwartą na home konta demo. **Framing (ważne — to test IA „docodziennego" home, nie pierwszego kontaktu):** „Tak wygląda apka po kilku tygodniach używania. Widzisz ten ekran pierwszy raz. **Co byś zrobił(a) najpierw? Pokaż palcem, zanim klikniesz.**"
Potem: „Opisz własnymi słowami, co tu widzisz. Czego jest za dużo, czego brakuje?"
📏 Miara: czy pierwszy wybór = start treningu? · liczba elementów, które uczestnik zignorował/nie zrozumiał · cytaty. *(To walidacja feedbacku #1 — nie sugeruj „przeładowania"!)* Prawdziwy pierwszy kontakt nowego usera (onboarding → pusty home) testuje Z1 — to DWA różne testy, notuj osobno.

### Z1 · Pierwszy trening (świeże konto — przełącza moderator)
„Wyobraź sobie, że właśnie zainstalowałeś(-aś). Doprowadź do rozpoczęcia pierwszego treningu."
Oczekiwana ścieżka: onboarding (kilka ekranów, jedna decyzja na ekran — imię+jednostki, gdzie, poziom, priorytet, kierunek planu, rytm; **liczba/kolejność ekranów jest iterowana — testuj to, co jest na prodzie w dniu sesji**) → **karta planu z uzasadnieniem → „Aktywuj plan"** → mikro-potwierdzenie „Plan gotowy" → home z hero „Dziś" → **Start** → logger. 📏 Obserwuj: czy rozumie uzasadnienie planu („Wybraliśmy go, bo…") · czy po potwierdzeniu wie, że ma kliknąć „Start", a nie szuka planu dalej · gdzie się waha · czy któryś ekran wyboru go zatrzymuje. *(Dawny żółty punkt „brak mikro-potwierdzenia" naprawiony w v3.1 — H2 sprawdza, czy realnie domyka pętlę u ludzi.)*
**Z1a — pusty home + skip (krytyczna ścieżka, świeżo naprawiona w v3.1):** jeśli uczestnik trafi na E6 w gałąź BEZ sugestii (pominął „gdzie"/„poziom") — obserwuj oba wyjścia: „Przejdź do biblioteki" (MA zaprowadzić na `/programs`) i „Wybiorę później" (home, pusty stan „Zacznij od planu"). To był realny bug (etykieta prowadziła na pusty home) — H2 potwierdza fix na żywych ludziach. Jeśli klika „Pomiń" gdziekolwiek — NIE przerywaj; zanotuj krok pominięcia (feedback #1 mógł powstać właśnie tu) i czy „Pomiń" od E5 zachował jego dane. Na pustym home: „Pierwsze wrażenie — jasne, co dalej?"

### Z2 · Logowanie serii „na siłowni"
„Zrób 3 serie pierwszego ćwiczenia: pierwszą zgodnie z planem, w drugiej zmień ciężar, trzecią pomiń. Potem sprawdź, ile masz przerwy."
📏 użycie ✓/stepperów/rest · czy rozumie pre-fill („skąd te liczby?" — zapytaj!).

### Z3 · Podmiana ćwiczenia
„Nie masz dziś dostępu do [sprzęt z 2. ćwiczenia]. Zastąp je czymś sensownym."
📏 znajduje ⇄? · rozumie, czemu lista proponuje to, co proponuje? · znany żółty punkt: brak podglądu „jak wykonać" zamiennika.

### Z4 · Odczyt postępów (konto z danymi demo — wróć)
„Sprawdź, czy robisz postęp. Opowiedz, co widzisz." Potem: „Znajdź swój rekord w [ćwiczenie]."
📏 czy interpretuje trend/heatmapę bez pomocy · **cytat o tym, co uważa za najcenniejsze na tym ekranie** (paliwo do §4).

### Z5 · Wskazówki (guidance) — pomost do WTP
Pokaż kartę „Wskazówki" na home (przygotuj dane demo tak, żeby była ≥1 flaga, np. staleness).
„Co apka próbuje Ci powiedzieć? Czy to by wpłynęło na Twój najbliższy trening?"
📏 rozumie regułę („bo dobiłeś zakres")? · ufa jej? · cytaty.

## 4. Część B — moduł WTP (15 min) *(po zadaniach — user już zna produkt)*

> **Kanon v3:** premium = TRZY filary (prowadzenie · cel z prognozą · pełna historia), nie stare „guidance/analityka/programy". Testuj to, co realnie sprzedajemy. Filar „cel z prognozą" jest jeszcze **konceptem** (nie w produkcie) — opisujesz słowami; pozostałe dwa user właśnie widział (Z4 dane, Z5 wskazówki).

**B1 · Wartość otwarcie:** „Gdyby ta apka zniknęła jutro, czego brakowałoby Ci najbardziej?" *(nie podpowiadaj listą)*

**B2 · Wybór wymuszony (trzy filary premium — zadaj dosłownie):**
> „Za którą z tych trzech rzeczy zapłacił(a)byś dychę miesięcznie:
> · **apka mówi, kiedy dołożyć a kiedy odpuścić — i dlaczego** (prowadzenie; widziałeś we Wskazówkach),
> · **cel z prognozą — »przy tym tempie: setka w marcu«** (dokąd zmierzasz),
> · **pełna historia i trendy, nic nie znika** (widziałeś w Postępach)?"
📏 Zapisz wybór + uzasadnienie. Do bramki B (wartość): liczy się **prowadzenie LUB dane/historia**. „Cel z prognozą" bonusowo — sygnał, czy warto go budować szybciej.

**B2a · Teaser stagnacji (mechanizm z v3, zaakceptowany):** „Gdyby apka sama zauważyła »stoisz w miejscu na push od 3 tygodni« i pokazała pierwszą diagnozę **za darmo**, a pełny plan wyjścia był w płatnej — kusi czy irytuje?" 📏 reakcja na „pierwsza diagnoza gratis w momencie bólu" — to główny trigger fali 1.

**B3 · Van Westendorp light (4 pytania, o subskrypcji miesięcznej):**
1. „Przy jakiej cenie miesięcznie uznał(a)byś, że to **podejrzanie tanie**?"
2. „…że to **okazja/dobra cena**?"
3. „…że **drogo, ale do przemyślenia**?"
4. „…że **za drogo, odpadam**?"
📏 4 liczby per osoba (arkusz §7).

**B4 · Test kotwicy (yearly-first — v3):** „Arco Coach — **99 zł za rok** (albo 14,99 zł/mies.); logowanie i ekipy zawsze darmowe. Pierwsza reakcja?" *(obserwuj twarz zanim odpowie; kotwica prowadzi rocznym — 99/rok to ~8,25 zł/mies., ma wyglądać na okazję)*. Follow-up: „Wolałbyś płacić rok z góry czy miesięcznie?" *(v3 stawia na roczny — sprawdź, czy zobowiązanie na rok nie odstrasza początkującego)*. Jeśli zna Hevy: „Hevy Pro to ~13 zł/mies. — zmienia coś?"

**B5 · Limit historii (fala 2, uczciwy test):** „W darmowej wersji widzisz 12 ostatnich tygodni historii; starsze dane czekają nietknięte i wracają w płatnej. Fair czy wkurzające? Dlaczego?"

## 5. Część C — moduł ekipy (10 min)

**C1 · Radek (pytanie z wizji, dosłownie):** „**Z kim trenujesz albo kto miałby Cię pilnować, żebyś nie odpuszczał(a)?** Konkretna osoba — kto to jest?" 📏 **ma Radka: tak/nie** (liczy się do B1) + kim jest (partner/kumpel/siostra…).

**C2 · Koncept (przeczytaj, bez pokazywania UI):**
> „Wyobraź sobie: Ty i paru znajomych (max 6 osób w ekipie) widzicie nawzajem tylko tyle: »Radek trenował dziś, 4. tydzień z rzędu«. Możecie przybić 💪 i szturchnąć: »Ania przypomina Ci o treningu«. Żadnych ciężarów, wyników, komentarzy, feedu."
Pytania: „Kogo byś zaprosił(a)? Wyślesz takie szturchnięcie? A jak Ty je dostaniesz w słabym tygodniu — motywacja czy wyrzut?" 📏 reakcja na kameralność (czy pyta „a czemu nie widać ciężarów?" = uwaga, vanity-persona).

**C3 · Kontr-pytanie:** „Czego by musiało NIE być w takiej funkcji, żebyś jej nie wyłączył(a)?"

## 6. Zamknięcie (5 min)

1. „Jedna rzecz do naprawienia od zaraz?"
2. „Poleciłbyś(-abyś) to komuś? Komu konkretnie?" *(proto-NPS + persona ICP)*
3. „Mogę się odezwać przy testach ekip?" *(seed listy oczekujących!)*

## 7. Arkusz notatek (kopiuj per uczestnik)

| Pole | P_ |
|---|---|
| Persona: **Paweł / Kasia / inny** · staż, miejsce, czym loguje, zna Hevy? | |
| Z0 first-click: pierwszy wybór (= Start?) / cytat o home | |
| **Z1** pierwszy trening: **✅/🟡/❌** · dochodzi do loggera? gdzie się waha? | |
| Z1a pusty home / pominął onboarding (krok)? · dwa wyjścia fallbacku działają? | |
| **Z2** logowanie serii: **✅/🟡/❌** · rozumie pre-fill? · max dotkliwość **S_** | |
| **Z3** podmiana: **✅/🟡/❌** · znajduje ⇄? · max dotkliwość **S_** | |
| Z4 postępy / rekord: interpretuje bez pomocy? · co uważa za najcenniejsze? | |
| Z5 guidance: rozumie regułę? ufa? | |
| **B2 wybór (1 z 3):** prowadzenie / cel+prognoza / pełna historia — + dlaczego | |
| B2a teaser stagnacji (gratis diagnoza): kusi / irytuje / obojętne | |
| B3 VW: tanio-podejrzanie / okazja / drogo / za drogo (4 liczby) | |
| B4 reakcja na **99/rok** (i 14,99/mies): · rok czy miesiąc? | |
| B5 limit historii — fair? | |
| C1 ma Radka? kto (partner/kumpel/rodzina)? | |
| C2 reakcja na ekipę / nudge: · pytał „czemu nie widać ciężarów"? | |
| Zamknięcie: **zgoda na kontakt przy testach ekip? (tak/nie)** | |
| Cytat sesji (jeden, najmocniejszy): | |

## 8. Po sesjach — rozstrzygnięcie B1 (dwie bramki z §0.5)

**Krok 1 — Bramka A (rdzeń).** Z Z1–Z3: policz porażki i problemy S4. **Zielona:** 0 porażek + 0 S4 u ≥4/5. Czerwona → **STOP**: napraw rdzeń, dopiero potem czytaj resztę (WTP produktu, w którym nie da się zalogować serii, jest bez znaczenia).
**Krok 2 — Bramka B (wartość + ekipa), tylko jeśli A zielona.** Policz: B2 (prowadzenie LUB dane ≥3/5) · Radek C1 (≥3/5) **+** zgody na kontakt (pytanie 3 zamknięcia — sygnał behawioralny, mocniejszy niż deklaracja C2) · mediany Van Westendorpa vs 14,99/99. Obie połówki zielone = B1 zielona.
**Krok 3 — czytaj wzorce, nie tylko liczby.** Na n=5 jedna dosłowna wypowiedź waży więcej niż słupek. Wyciągnij max 5 najmocniejszych cytatów per bramka.
Wynik + surowe cytaty + lista dotkliwości (S3/S4 → P0/P1) → **`docs/wyniki-h2.md`** → decyzje: zielone = Krok 2 (konta+RODO) rusza; czerwone = ścieżki z tabeli bramek (`roadmap.md`). Feedback o home z Z0 → decyzja o hierarchii (obiecana w `feedback-uzytkownikow.md`). Sygnał z B2a (teaser stagnacji) i z filaru „cel z prognozą" → priorytet budowy tych funkcji przed launchem.

## 9. Przed pierwszą prawdziwą sesją

**Twarde prerekwizyty (blokują sesję, jeśli nie domknięte):**
- [ ] **Fix wyszukiwarki ćwiczeń** (R5a planu; lokalne fazy R1–R2 z `audyt-wyszukiwarki-2026-07.md`: `name_pl` top-200 + aliasy). **Z2/Z3 testują picker** — search tylko po nazwach EN da 0 wyników na „wyciskanie" i wywali podmianę (Z3). Bez tego Bramka A prawie na pewno czerwona z powodu, który znamy.
- [ ] **16 ćwiczeń z placeholderem zdjęcia (49 slotów)** — uzupełnić zdjęciami albo świadomie wyłączyć z widocznych programów, żeby Z3/podgląd nie trafił na pusty placeholder. Decyzja per ćwiczenie [Ty]: swap na wariant ze zdjęciem / AI-zdjęcie / hidden.
- [ ] 5 punktów P0/P1 z `usability-audit.md` §E domknięte (zoom, dark, focus-visible…).

**Przygotowanie:**
- [ ] **Pilot (sesja 0)** na życzliwej osobie — mierzy czas i łata skrypt; jej wyników nie liczysz do B1.
- [ ] Skrypt danych demo (konto z 2–3 tyg. historii + ≥1 flaga guidance/stagnacji) — [Claude, na żądanie].
- [ ] Dwa konta per osoba (demo + świeże), hasła pod ręką, przełączenia przećwiczone na pilocie.
- [ ] Wydrukowany arkusz §7 × liczba osób + ten skrypt.
