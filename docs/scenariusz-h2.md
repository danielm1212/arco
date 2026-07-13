# Scenariusz H2 — testy z użytkownikami (skrypt sesji, kompletny)

> **Data:** 2026-07-08 · **Podstawa:** `usability-audit.md` §C (zadania) + `wizja-i-plan-produktu-v2.md` Krok 1 (moduły WTP i ekipy, +25 min) + `feedback-uzytkownikow.md` #1 (first-click test) + bramka **B1** (wizja §7).
> **Format:** 1 sesja moderowana × 3–5 osób, po ~70 min. Moderator: Ty. Ten plik = skrypt do wydruku/drugiego ekranu.

---

## 0. Cel i bramka

Testujemy trzy rzeczy naraz: **(a) usability rdzenia** (zadania §3), **(b) willingness-to-pay** (moduł §4), **(c) tezę ekipową** (moduł §5).

**B1 zielona:** zadania przechodzą bez blokerów · **≥3/5** wskazuje guidance lub analitykę jako „warte pieniędzy" · **≥3/5** ma „swojego Radka".
**B1 czerwona (guidance = „fajne, ale nie zapłacę"):** NIE ruszamy ceny — wracamy do packagingu wartości przed bramką RODO.

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

> ⚠️ **Aktualizacja 2026-07-11:** Z0 testuje home **PO redesignie** (`redesign-home.md` — FlameWeek + hero + chip), nie stary układ. Testujemy to, co wypłynie do userów.

### Z0 · First-click test (feedback #1) — konto DEMO
Wręcz telefon z apką otwartą na home konta demo. **Framing (ważne — to test IA „docodziennego" home, nie pierwszego kontaktu):** „Tak wygląda apka po kilku tygodniach używania. Widzisz ten ekran pierwszy raz. **Co byś zrobił(a) najpierw? Pokaż palcem, zanim klikniesz.**"
Potem: „Opisz własnymi słowami, co tu widzisz. Czego jest za dużo, czego brakuje?"
📏 Miara: czy pierwszy wybór = start treningu? · liczba elementów, które uczestnik zignorował/nie zrozumiał · cytaty. *(To walidacja feedbacku #1 — nie sugeruj „przeładowania"!)* Prawdziwy pierwszy kontakt nowego usera (onboarding → pusty home) testuje Z1 — to DWA różne testy, notuj osobno.

### Z1 · Pierwszy trening (świeże konto — przełącza moderator)
„Wyobraź sobie, że właśnie zainstalowałeś(-aś). Doprowadź do rozpoczęcia pierwszego treningu."
Oczekiwana ścieżka: welcome → sugestia planu → „Ustaw aktywny" → Start dnia → logger. 📏 znany żółty punkt: brak mikro-potwierdzenia po „Ustaw aktywny" — obserwuj, czy gubi.
**Z1a (dopisek z refinementu):** zanim ruszy w zadanie, na pustym home po onboardingu: „Pierwsze wrażenie — jasne, co dalej?" *(kontrapunkt do Z0: empty state #1 „Zacznij od planu" w akcji)*. Jeśli uczestnik kliknie „Pomiń" w onboardingu — NIE przerywaj, to cenna ścieżka (feedback #1 mógł powstać właśnie tu); zanotuj krok pominięcia.

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

**B1 · Wartość otwarcie:** „Gdyby ta apka zniknęła jutro, czego brakowałoby Ci najbardziej?" *(nie podpowiadaj listą)*

**B2 · Wybór wymuszony (pytanie z wizji, zadaj dosłownie):**
> „Za którą z tych trzech rzeczy zapłacił(a)byś dychę miesięcznie: **podpowiedzi, co robić na treningu** · **wykresy postępu** · **programy bez limitu**?"
📏 Zapisz wybór + uzasadnienie. To pytanie liczy się do B1 (guidance/analityka vs programy).

**B3 · Van Westendorp light (4 pytania, o subskrypcji miesięcznej):**
1. „Przy jakiej cenie miesięcznie uznał(a)byś, że to **podejrzanie tanie**?"
2. „…że to **okazja/dobra cena**?"
3. „…że **drogo, ale do przemyślenia**?"
4. „…że **za drogo, odpadam**?"
📏 4 liczby per osoba (arkusz §7).

**B4 · Test kotwicy:** „Arco Coach kosztuje **14,99 zł/mies. albo 99 zł/rok** — pełne prowadzenie i głęboka analityka; logowanie i ekipy zawsze darmowe. Pierwsza reakcja?" *(obserwuj twarz zanim odpowie)*. Follow-up jeśli zna Hevy: „Hevy Pro to ~13 zł/mies. — zmienia coś?"

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
| Persona (staż, miejsce, czym loguje, zna Hevy?) | |
| Z0 first-click: pierwszy wybór / cytat o home | |
| Z1a pusty home / pominął onboarding? (krok) | |
| Z1–Z5: ukończone / z pomocą / porażka + wahania | |
| Z5 guidance: rozumie? ufa? | |
| B2 wybór: guidance / analityka / programy | |
| B3 VW: tanio-podejrzanie / okazja / drogo / za drogo | |
| B4 reakcja na 14,99: | |
| B5 limit historii — fair? | |
| C1 ma Radka? kto? | |
| C2 reakcja na ekipę / nudge: | |
| Cytat sesji (jeden, najmocniejszy): | |

## 8. Po sesjach — rozstrzygnięcie B1

Zbierz arkusze → policz: bloki w zadaniach (0 wymagane) · ile osób w B2 wybrało guidance/analitykę (próg ≥3/5) · ile ma Radka (≥3/5) · mediany Van Westendorpa vs 14,99 · **ile osób zgodziło się na kontakt przy testach ekip (pytanie 3 zamknięcia) — to behawioralny sygnał zainteresowania ekipami, mocniejszy niż deklaracje z C2; licz go obok progu Radka**.
Wynik + surowe cytaty → **`docs/wyniki-h2.md`** → decyzje: zielone = Krok 2 rusza; czerwone = ścieżki z tabeli bramek (wizja §7). Feedback o home z Z0 → decyzja o uproszczeniu hierarchii (obiecana w `feedback-uzytkownikow.md`).

## 9. Przed pierwszą prawdziwą sesją

- [ ] **Pilot (sesja 0)** na życzliwej osobie — mierzy czas i łata skrypt; jej wyników nie liczysz do B1.
- [ ] Skrypt danych demo (konto z 2–3 tyg. historii + ≥1 flaga guidance) — [Claude, na żądanie].
- [ ] 5 punktów P0/P1 z `usability-audit.md` §E domknięte przed sesjami (zoom, dark, focus-visible…).
- [ ] Wydrukowany arkusz §7 × liczba osób + ten skrypt.
