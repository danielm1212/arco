# Scenariusz H2 — testy z użytkownikami (skrypt sesji, kompletny)

> **Data:** 2026-07-08 · **Refinement:** 2026-07-20. Scenariusz obejmuje aktualny UI,
> persony Paweł/Kasia/Radek, trzy filary premium, dokładną cenę i rozdzielenie H2-U/H2-V/H2-E.
> **Podstawa:** `wizja-i-strategia-v3.md`, `decyzje-produktowe.md`, `roadmap.md`,
> `userflows-docelowe-2026-07.md` i `feedback-uzytkownikow.md`. Finalną wersję pod aktualny
> interfejs przygotowujemy w R6.
> **Format docelowy:** H2-U = 5 moderowanych sesji użyteczności; H2-V = osobne 5–8
> rozmów z ICP płacącym; H2-E = 3 prawdziwe pary. Moduły poniżej można łączyć logistycznie,
> ale ich wyników nie wolno zlewać w jeden wskaźnik.
> **Status po rebaseline 2026-07-20:** metodologia pozostaje ważna, lecz dokument nie jest
> finalnym skryptem przed zamknięciem Q1–R5b. W R6 aktualizujemy nazwy, ścieżki, dane startowe
> i kanał feedbacku pod aktualny build, a następnie wykonujemy pilot.

---

## 0. Cel i bramka

Badamy trzy różne ryzyka: **(a) użyteczność rdzenia** (§3), **(b) kierunek wartości premium**
(§4) i **(c) zrozumienie Ekipy** (§5). Tylko użyteczność ma w H2-U twardą bramkę.
WTP i Ekipa generują hipotezy do H2-V, H2-E i trzytygodniowego H2-F.

## 0.5. Definicje pomiaru i dwie bramki *(dodane 2026-07-16 — czytaj PRZED pilotem)*

n=5 to badanie **jakościowe**. Progi użyteczności są STOP-lightami, nie dowodem statystycznym.
Jedna spójna, dosłowna wypowiedź („nie wiedziałem, czy to się zapisało”) waży więcej niż słupek.

**Wynik zadania (zapisuj dla każdego Z1–Z5):**
- ✅ **Sukces** — ukończone bez pomocy, sensowną ścieżką (niekoniecznie „naszą").
- 🟡 **Z pomocą** — ukończone dopiero po podpowiedzi (odezwałeś się po odliczeniu do 10) albo po >1 ślepej uliczce.
- ❌ **Porażka** — nie ukończył, poddał się, albo wszedł w ścieżkę, z której nie wrócił.

**Dotkliwość każdego zgrzytu (nie tylko porażki) — do triażu P0/P1 po sesjach:**
- **S1 kosmetyka** — zauważył, nie przeszkadza. · **S2 tarcie** — spowolniło, dał radę sam.
- **S3 blok odwracalny** — utknął, wyszedł tylko z pomocą/przypadkiem. · **S4 blok twardy** — nie dokończył zadania.

**Bramka A · Użyteczność rdzenia (twarda, niezależna od WTP).** Rdzeń = **Z1–Z3** (pierwszy trening, logowanie serii, podmiana) — to jest „rdzeń pętli" z Z1 zasad, świętość produktu. **Zielona:** 0 porażek i 0 problemów S4 na Z1–Z3 u **≥4/5** osób. Czerwony rdzeń unieważnia całą resztę — nie ma sensu pytać o cenę produktu, w którym nie da się zalogować serii.

**Sygnał B · Wartość premium.** B2, Van Westendorp i reakcja na cenę służą do wyboru
obietnicy oraz języka. Nie zatwierdzają ceny ani płatności. Prognoza pokazywana wyłącznie
jako koncept nie może samodzielnie wygrać bramki PREMIUM-01.

**Sygnał C · Ekipa.** Konkretna osoba i zgoda na dalszy kontakt pozwalają rekrutować pary do
H2-E. Dopiero realne zaproszenie, reakcja i nudge są dowodem zachowania.

**Gdy wyniki się rozjeżdżają:** A czerwona zatrzymuje interpretację WTP. A zielona i słaby
sygnał wartości oznaczają pracę nad time-to-value oraz packagingiem, nie automatyczną obniżkę
ceny. Słaba Ekipa pozostaje funkcją retencji, a nie argumentem płatnym.

## 1. Rekrutacja i logistyka

- **H2-U, 5 osób:** min. 1 początkująca lub wracająca, min. 2 regularnie trenujące,
  min. 1 używająca innego loggera i min. 1 kobieta. Nie rekrutuj wyłącznie znajomych.
- **H2-V, 5–8 innych lub wyraźnie oznaczonych osób:** trenują regularnie, zapisują wyniki
  i mają realny problem progresji. Ich odpowiedzi nie są uśredniane z początkującymi.
- **H2-E:** trzy pary, które znają się przed badaniem. Moderator nie dobiera obcych osób.
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

**B4 · Test dokładnej ceny (yearly-first — v3):** „Arco Coach — **99 zł za rok** albo
**14,99 zł miesięcznie**. Logowanie i Ekipa zostają darmowe. Pierwsza reakcja?” Obserwuj reakcję
przed follow-upem. Zapytaj: „Rok czy miesiąc i dlaczego?” Jeśli zna konkurenta, poproś o
porównanie z ceną, którą rzeczywiście zna; moderator nie podaje niezweryfikowanej kotwicy.

**B5 · Limit historii (fala 2, uczciwy test):** „W darmowej wersji widzisz 12 ostatnich tygodni historii; starsze dane czekają nietknięte i wracają w płatnej. Fair czy wkurzające? Dlaczego?"

## 5. Część C — moduł ekipy (10 min)

**C1 · Radek (pytanie z wizji, dosłownie):** „**Z kim trenujesz albo kto miałby Cię pilnować, żebyś nie odpuszczał(a)?** Konkretna osoba — kto to jest?” 📏 **ma Radka: tak/nie** + kim jest (partner/kumpel/siostra…).

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

## 8. Po sesjach — rozstrzygnięcie H2-Lab

**Krok 1 — Bramka A (rdzeń).** Z Z1–Z3: policz porażki i problemy S4. **Zielona:** 0 porażek + 0 S4 u ≥4/5. Czerwona → **STOP**: napraw rdzeń, dopiero potem czytaj resztę (WTP produktu, w którym nie da się zalogować serii, jest bez znaczenia).
**Krok 2 — kierunek wartości, tylko jeśli A zielona.** Grupuj cytaty H2-V według realnego
problemu, obietnicy, zaufania, ceny i alternatywy. Van Westendorp pozostaje opisem kierunku.
Wybierz najwyżej jedną obietnicę do dalszego pilota; nie uruchamiaj płatności.
**Krok 3 — Ekipa.** Zwerbuj trzy pary i wykonaj H2-E. Deklaracja z C1 nie zastępuje zachowania.
**Krok 4 — synteza.** Na małej próbie cytat i powtarzalny wzorzec ważą więcej niż słupek.
Wynik, cytaty i dotkliwość trafiają do **`docs/wyniki-h2.md`**. Zielona H2-U pozwala wejść
do H2-F, nie bezpośrednio do publicznych kont i płatności.

## 9. Przed pierwszą prawdziwą sesją

**Twarde prerekwizyty (blokują sesję, jeśli nie domknięte):**
- [x] **Polska wyszukiwarka ćwiczeń** — `name_pl`, aliasy, ranking i normalizacja diakrytyk
  są wdrożone. R6 aktualizuje wyłącznie dane demo i krytyczne zapytania pod bieżący build.
- [ ] **16 ćwiczeń z placeholderem zdjęcia (49 slotów)** — uzupełnić zdjęciami albo świadomie wyłączyć z widocznych programów, żeby Z3/podgląd nie trafił na pusty placeholder. Decyzja per ćwiczenie [Ty]: swap na wariant ze zdjęciem / AI-zdjęcie / hidden.
- [ ] Bramka Q1–R6 z `plan-sprintow-2026-07.md` domknięta; znane P0/P1 = 0.

**Przygotowanie:**
- [ ] **Pilot (sesja 0)** na życzliwej osobie — mierzy czas i łata skrypt; jej wyników nie liczysz do H2-U.
- [ ] Skrypt danych demo (konto z 2–3 tyg. historii + ≥1 flaga guidance/stagnacji) — [Claude, na żądanie].
- [ ] Dwa konta per osoba (demo + świeże), hasła pod ręką, przełączenia przećwiczone na pilocie.
- [ ] Wydrukowany arkusz §7 × liczba osób + ten skrypt.

## 10. H2-F — skrót protokołu terenowego

- 8–12 zarządzanych kont, trzy tygodnie i prawdziwe treningi;
- feature freeze poza P0/P1;
- cotygodniowe pytania: co pomogło, co przeszkodziło, co użytkownik zrobił poza Arco;
- notować pierwszy i drugi trening, powrót w trzecim tygodniu, użycie guidance i Ekipy;
- po minimum trzech sesjach pokazać dokładną cenę i zebrać jawną rezerwację płatnej bety;
- eksperyment importu jest fake-doorem i analizą kilku CSV, nie implementacją;
- wynik czytać według zamrożonych progów z `backlog-produktu.md`.
