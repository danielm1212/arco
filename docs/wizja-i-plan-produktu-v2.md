# Arco — wizja produktu i plan v2

> **Data:** 2026-07-08. **Status:** kanon — nadpisuje `monetyzacja.md` w zakresie modelu, sekwencji i R3; rewiduje tabelę moatów z `konkurencja-hevy.md`; nie zmienia scope'u Horyzontu 1–2 z `roadmap.md`.
> **Geneza:** audyt biznesowy 2026-07-08 (`audyt-biznesowy-2026-07-08.md`) + decyzje właściciela z sesji tego samego dnia: (1) warstwa trenerska **odłożona** (nie skreślona) — za duży nakład dla jednej osoby; (2) ekipa awansuje z H5 na silnik wzrostu; (3) model hybrydowy limity+wartość zatwierdzony z 5 poprawkami audytora; (4) ekipa widzi check-in i passę, nie pełne logi.

---

## 1. Wizja

**Arco to dziennik siłowy, który prowadzi, loguje się sam i pilnuje Cię razem z kumplem.**

Trening ma być przyjemnością, a narzędzie — motywatorem, nie obciążeniem. Trzy filary doświadczenia:

1. **Frictionless** — sesja pre-wypełniona, seria zaliczona tapem, działa offline, nic nie ginie. Logowanie nie może kosztować uwagi, która należy się sztandze.
2. **Prowadzenie** — jawne, nadpisywalne reguły mówią, kiedy dołożyć, kiedy odpuścić, i co robić, gdy utkniesz. Pewność w momencie zwątpienia — nie AI-magia.
3. **Kameralna odpowiedzialność (ekipa)** — 1–3 znajomych widzi Twoje check-iny i passę. Nie ciężary, nie feed, nie komentarze. „Radek trenował dziś, 4. tydzień z rzędu" + cheers + nudge. Zero vanity, zero toksyczności.

Anty-wizja (czym Arco nie jest): publicznym feedem, AI auto-programmingiem, apką dietetyczną, narzędziem trenera (na razie — patrz §9), klonem Hevy z innym kolorem.

**Pozycjonowanie:** nie „lepszy Hevy", tylko „dla kogo Hevy jest za duże, za obce i za angielskie". Nisza + język + filozofia, nie wyścig na feature'y.

### 1.1 Dla kogo (decyzja kierunkowa 2026-07-08)

**Rdzeń budowany dla trenujących poważnie; wejście przyjazne początkującym.** To jedna apka z dwiema rampami, nie dwa produkty:

- **Trenujący poważnie (ICP płacący):** frictionless logging, guidance-full, głęboka analityka. To on konwertuje na premium (fala 1 i 2, §3.2) — stagnacja i głód postępu to jego problemy.
- **Początkujący (ICP wzrostowy):** wbudowane plany treningowe z opisami ćwiczeń, onboarding doświadczenie→sugestia planu (Sprint 4), guidance jako „trener-lite w kieszeni" — apka mówi, co robić, więc pierwszy trening nie przeraża. Marketingowo komunikowane wprost: „nie wiesz, od czego zacząć — Arco wie".

**Dlaczego to konieczność, nie ukłon:** pętla ekipy przyprowadza osoby o różnym poziomie — zaawansowany zaprasza kumpla, który dopiero zaczyna. Jeśli apka wystrasza początkującego, pętla wyrzuca połowę zaproszonych. Beginner-friendliness = ochrona silnika wzrostu (Z2). Granica: prowadzenie za rękę realizujemy presetami, opisami i regułami guidance — **nie** osobnym „trybem początkującego" ani AI-coachem (poza zakresem bez zmian).

### 1.2 Marka i art direction (decyzja kierunkowa 2026-07-08)

**Kierunek: retro-analog Warm.** Fotografia z ziarnem (analogowy grade, ciepłe światło, prawdziwi ludzie w ruchu — wzorce: SENDR/tempo/seekly wave), logotyp retro (zaokrąglony, „przecięte" O) w palecie terracotta + krem + ciepła czerń, spójny z `paleta-arco-warm.md`.

**Architektura dwuwarstwowa — zasada nadrzędna:**
- **Warstwa komunikacji** (landing, social, stories, marketing, ekrany-momenty): pełne retro — ziarno, fotografia, duża display-typografia.
- **Warstwa narzędzia** (UI apki): minimalistyczna, czysta, funkcjonalna. Ziarniste zdjęcia **nie wchodzą** do UI jako tła/dekoracje.
- **Kleje między warstwami:** paleta Warm, radiusy UI echem zaokrągleń logotypu, display-typografia w momentach emocjonalnych (celebracja, PR, koniec triala) — wzorzec Nike/Ladder z analizy konkurencji.

**Ikony 3D — rozstrzygnięcie re-oceny z H3:** tak, ale **matowe/clay, nie metalik**. Chrom był z porzuconego kierunku volt/Athletic i gryzie się z ziarnem; soft clay render w materiałach terracotta/krem to trzecia forma tej samej estetyki (ziarno w foto → glina w ikonach → płaski minimal w UI). Zestaw kurowany i mały (hantel, ławka, kettlebell, talerz), używany oszczędnie: empty states, onboarding, celebracje — nie w nawigacji dziennej.

**Zdjęcia ćwiczeń (spina H3):** AI-podrasowanie biblioteki `free-exercise-db` dostaje **ten sam warm/analogowy grading** co fotografia marki — biblioteka ćwiczeń staje się nośnikiem identyfikacji zamiast ją psuć. Priorytet: top ~200 ćwiczeń (spójne z self-hostem przeciw link-rot).

**Ryzyko flagowane świadomie:** analog-grain to fala 2024–2026 — dziś rezonuje i na PL jest świeża, ale będzie się starzeć razem z trendem. Mitygacja: trend nosi warstwa komunikacji (tania w podmianie), nie UI ani logo (retro-logotyp jest ponadczasowy, geometryczny minimal UI też).

---

## 2. Zasady niepodważalne modelu

Te trzy reguły są ważniejsze niż jakakolwiek optymalizacja przychodu. Zmiana którejkolwiek = świadoma decyzja właściciela z wpisem do tego dokumentu.

- **Z1. Rdzeń pętli zawsze darmowy.** Logowanie w pełnej jakości (pre-fill, tap, offline, PR-y) nigdy nie trafia za paywall ani pod limit.
- **Z2. Silnik wzrostu zawsze darmowy.** Ekipa, zaproszenia, reakcje, nudge — bez limitów, bez gwiazdek. Paywall na pętli viralowej = podcinanie gałęzi.
- **Z3. Limitujemy dostęp, nie dane.** Nic nigdy nie jest kasowane. Free widzi 12 tygodni wstecz; starsze dane czekają w całości i odblokowuje je subskrypcja. Eksport danych (RODO) darmowy zawsze — to prawo, nie feature. Grandfathering przy każdym przyszłym zaostrzeniu limitów.

---

## 3. Model biznesowy

### 3.1 Podział Free / Premium

| | **Free (na zawsze)** | **Arco Coach — 14,99 zł/mies · 99 zł/rok** |
|---|---|---|
| Logger | pełny, bez ograniczeń | = |
| Programy startowe/presety | tak | = |
| Własne programy | **2 pełne plany** (komunikacja: „u konkurencji to odpowiednik 6+ rutyn") | bez limitu |
| Custom ćwiczenia | 10 | bez limitu |
| Historia | 12 tygodni wstecz (pełny blok treningowy); starsze dane bezpieczne, zablokowane | pełna |
| Guidance | lite: hint progresji („dobiłeś zakres → dołóż") | full: diagnoza stagnacji + plan wyjścia, deload, balans push/pull, staleness, kalibracja |
| Analityka | podstawowe staty, PR-y, kalendarz+passa, heatmapa bieżąca | trendy tonażu, liczba-bohater w czasie, muscle split w czasie, delta-karty |
| Passa | tak | + ochrona passy (choroba/wyjazd nie łamie) |
| Ekipa / social | **w całości darmowe** | = |
| Eksport danych | tak (RODO) | = |

Wejście: **reverse trial 21 dni** — pełne premium od pierwszego dnia, potem łagodny spadek do free. Bez hard paywalla. Ewentualna founder's edition (249 zł, limit 100 szt.) jako test WTP przy launchu — decyzja [Ty] tuż przed.

### 3.2 Dwustopniowa rakieta konwersji (świadomie projektowana)

Model ma **dwa osobne momenty konwersji** — mierzone i optymalizowane oddzielnie:

- **Fala 1 — dzień ~21 (koniec triala):** niesie ją **guidance-full + analityka**. Dzień 22 musi być odczuwalnie ubożejszy od dnia 20. Dodatkowy trigger niezależny od kalendarza: **wykryta stagnacja** — apka pokazuje, że wie („stagnacja na push od 3 tyg."), pełna diagnoza i plan wyjścia w Coach. Moment konwersji = frustracja, nie rutyna.
- **Fala 2 — miesiąc ~3–4:** niesie ją **limit historii**. Zaangażowany user pierwszy raz chce sięgnąć za horyzont 12 tygodni i widzi kłódkę — z komunikatem „wszystko tu jest, bezpieczne; premium sięga głębiej".

Metryki: konwersja_trial (fala 1) i konwersja_historia (fala 2) raportowane osobno. Optymalizacja fali 1 = packaging guidance; fali 2 = komunikat kłódki i moment jej pierwszego kontaktu.

### 3.3 Czego nie robimy w modelu

Reklamy (nie przed etapem ekspansji, jeśli w ogóle), lifetime jako model główny, marketplace programów (decyzja właściciela — podtrzymana), limit czasowy kasujący dane (sprzeczne z Z3), gate na eksporcie danych (nielegalne w duchu RODO).

---

## 4. Ekipa — specyfikacja koncepcyjna

**Definicja:** prywatna grupa 1–3 znajomych + Ty. Zaproszenie linkiem/kodem. Brak feedu publicznego, brak komentarzy, brak DM.

**Co widzi kumpel z ekipy (decyzja właściciela 2026-07-08):** check-in („Daniel trenował dziś") + passa („4. tydzień z rzędu") + reakcje. **Nie widzi:** ćwiczeń, ciężarów, programów, logów, danych ciała. Konsekwencje tej decyzji:
- RODO: minimalna powierzchnia udostępniania danych między userami; zgoda przy dołączeniu do ekipy obejmuje wyłącznie status aktywności i passę.
- Filozofia: zero porównywania ciężarów = zero vanity — dokładnie kameralny kierunek z kanonu.
- Technicznie: udostępniany jest zdarzeniowy „activity status", nie rekordy treningowe — prostszy model danych i RLS.

**Interakcje:** reakcje emotkami na check-in + nudge jednym tapem → auto-komunikat „Radek przypomina Ci o treningu". Zero pól tekstowych = zero moderacji.

**Dostarczanie nudge'a — trójkanałowo (fallback chain):**
1. Push (PWA): Android — pełnoprawnie; iOS ≥16.4 — tylko po instalacji na ekranie głównym i zgodzie.
2. Skrzynka w apce — zawsze, kanał gwarantowany.
3. E-mail — fallback, gdy brak pushowej zgody („Radek przypomina Ci o treningu" w mailu działa i buduje charakter marki). Digest, nie spam: max 1 nudge-mail/dzień.

Akceptujemy zdegradowane doświadczenie iOS w v1. **Natyw pozostaje poza zakresem** — nudge nie jest koniem trojańskim, który go wciąga (patrz §9). Wymóg minimalny wobec iOS: nudge musi być widoczny przy następnym otwarciu apki, nawet jeśli push nie doszedł.

**Wiek:** 16+ w regulaminie (zgody rodzicielskie poniżej — poza zakresem solo-foundera).

---

## 5. Dystrybucja i instalacja PWA (najmniejsze tarcie)

Zasada nadrzędna: **nie prosimy o instalację przy pierwszym kontakcie.** Prośba o instalację przed doświadczeniem wartości = odruchowe „nie". Instalacja jest sprzedawana jako *upgrade doświadczenia*, w momencie emocjonalnego szczytu.

**Moment prośby:** ekran celebracji po **pierwszym ukończonym treningu** (już istnieje — Sprint 2). User właśnie poczuł wartość; wtedy: „Dodaj Arco na ekran główny — pełny tryb treningowy: ekran nie gaśnie, wibracje przy końcu przerwy, powiadomienia od kumpli". Instalacja opakowana jako odblokowanie funkcji (co na iOS jest zresztą prawdą techniczną: wake lock i push działają dopiero po instalacji).

**Android/Chrome:** przechwycić `beforeinstallprompt`, nie pokazywać natywnego banera od razu; własny CTA na ekranie celebracji odpala systemowy prompt jednym tapem. Tarcie: 2 tapy.

**iOS/Safari:** brak API instalacji — kontekstowy overlay z instrukcją: detekcja iOS+Safari → animowana wskazówka „Udostępnij (ikona) → Dodaj do ekranu początkowego", max 3 kroki wizualnie, przycisk „zrobione / przypomnij później". Jeśli user wszedł z innej przeglądarki na iOS (Chrome/FB in-app) → najpierw komunikat „otwórz w Safari" z przyciskiem kopiującym link. Tarcie: nieusuwalne, ale minimalizowane timingiem i grafiką. Detekcja `display-mode: standalone` — zainstalowanym nigdy nie pokazujemy promptów.

**Kanały wejścia:** link/QR wszędzie tam, gdzie jest kontekst siłowni — zaproszenie do ekipy samo w sobie jest kanałem instalacji (kumpel dostaje link → pierwszy trening → celebracja → prompt). Pętla: wartość → instalacja → ekipa → zaproszenie → wartość u kolejnej osoby.

**Backlog świadomie odłożony:** PWABuilder/TWA (opakowanie PWA do sklepów bez pełnego natywu) — do re-oceny dopiero, gdy dane pokażą, że iOS-owe tarcie instalacji realnie dusi pętlę ekipy. Nie wcześniej.

---

## 6. Sekwencja wykonawcza

**Krok 0 — teraz:** dokończenie H1 zgodnie z `roadmap.md` (S9-cz.2 → S10; Sprint 5 offline-correctness jest twardym prerekwizytem paywalla — płacący user nie wybacza zgubionej serii).

**Krok 1 — H2 (testy 3–5 osób), rozszerzony o dwa moduły (+25 min/sesję):**
- WTP: Van Westendorp light + „za którą z trzech rzeczy zapłaciłbyś dychę: podpowiedzi co robić / wykresy postępu / programy bez limitu?"
- Ekipa: „z kim trenujesz albo kto miałby Cię pilnować?" — czy ludzie w ogóle *mają* swojego Radka.

**Krok 2 — bramka kont + RODO (blok 4–7 tygodni), zakres rozszerzony względem roadmapy o:**
- zgodę na ekipę (udostępnianie statusu aktywności i passy członkom ekipy) jako granularną, odwoływalną zgodę w modelu danych;
- politykę wieku 16+;
- e-mail transakcyjny/nudge (dostawca, opt-out, RODO-rejestr);
- resztę bez zmian: signup, weryfikacja, reset, usunięcie konta, eksport, audyt RLS, polityki+ToS+regulamin płatności, Stripe+faktury, rate limiting, backupy. Rekomendacja konsultacji prawnej (1–2,5k zł) podtrzymana.

**Krok 3 — launch publiczny z pełnym freemium od dnia zero.** Struktura z §3 (trial, limity, cennik) obowiązuje od pierwszego publicznego usera — nikt nigdy niczego nie traci, bo zasady były od początku. Launch cichy: społeczności PL, landing z listy oczekujących. Cel: sygnał konwersji fali 1, nie tłum.

**Krok 4 — ekipa jako fast-follow (4–8 tygodni po launchu).** Budowa na działającym modelu płatności i pierwszych danych konwersji. Wraz z ekipą: kanały nudge (push/skrzynka/e-mail) i pętla instalacyjna z §5.

**Krok 5 — decyzja bramkowa po 3 miesiącach paywalla** (patrz §7).

---

## 7. Bramki decyzyjne

| Bramka | Kiedy | Zielone | Czerwone | Akcja przy czerwonym |
|---|---|---|---|---|
| B1: H2 + moduły | koniec H2 | zadania przechodzą; ≥3/5 osób wskazuje guidance lub analitykę jako „warte pieniędzy"; ≥3/5 ma „swojego Radka" | guidance odbierany jako „fajne, ale nie zapłacę" | nie ruszać ceny — wrócić do packagingu wartości przed bramką RODO |
| B2: fala 1 | 3 mies. od launchu | trial→paid ≥25% **lub** konwersja całkowita ≥1,5% i rośnie | <1,5% po 3 mies. uczciwej iteracji | **nowy kill-gate (rewizja kanonu):** wariant C (wąska nisza home/dumbbell) **albo** świadoma akceptacja statusu zadbanego side-projectu. Oba wyjścia honorowe; „przenieś ciężar na trenerów" przestaje być wyjściem awaryjnym (§9) |
| B3: pętla ekipy | 3 mies. od startu ekipy | ≥30% aktywnych userów w ekipie; ≥1,15 zaproszonego-który-został na zapraszającego [ZAŁOŻENIE progu — kalibrować po pierwszych danych] | ekipa martwa mimo iteracji | ekipa spada do „nice-to-have retencyjnego"; wzrost wraca do content/społeczności — i sufit rośnie, uczciwie to odnotować |
| B4: próg sensu | mies. 9–12 | MRR ≥ [próg właściciela — do wpisania, patrz pytanie otwarte] i rośnie | MRR znacząco poniżej | decyzja właścicielska: side-project / wariant C / re-otwarcie warstwy trenerskiej z pozycji większej darmowej bazy |

Metryki stałe pulpitu: W1/W4 retencja, % userów z ukończonym 1. treningiem, instalacje PWA / userów aktywnych, konwersja_trial, konwersja_historia, % w ekipach, nudge delivery rate per kanał, churn premium.

---

## 8. Rewizje kanonu wprowadzane tym dokumentem

- **R3 v2:** podział free/paid rozszerzony o limity (2 programy, 10 custom, 12 tyg. historii) — model hybrydowy limity+wartość zastępuje czysty guidance-lite/full. Zasady Z1–Z3 nadrzędne.
- **Tabela moatów (`konkurencja-hevy.md`):** wiersz „Twoje dane bez limitów" **wypada** jako wyróżnik; wchodzi „**nic nigdy nie kasujemy** — dane czekają, premium sięga głębiej" (uczciwa wersja limitu Hevy). Wiersz „prywatna ekipa" awansuje z 🟢-przyszłość na rdzeń strategii wzrostu.
- **Kill-gate etapu 1:** cel awaryjny zmieniony (B2 wyżej) — trenerzy nie są już domyślnym planem B.
- **H4/H5 (`roadmap.md`):** ekipa przesunięta z H5 do fast-follow po launchu; reszta socialu (stories, UGC, tablica) pozostaje w H5 bez zmian; natyw pozostaje odłożony bez daty.
- **H3 (`roadmap.md`) — re-ocena ikon 3D rozstrzygnięta (§1.2):** 3D tak, w wersji matowej/clay pod Warm; metalik ostatecznie odrzucony. AI-podrasowanie zdjęć ćwiczeń dostaje warm/analogowy grading marki, priorytet top ~200.
- **Do naniesienia w plikach źródłowych** (`monetyzacja.md`, `konkurencja-hevy.md`, `roadmap.md`) — decyzja i wykonanie [Ty]; ten dokument jest źródłem prawdy do czasu naniesienia.

## 9. Świadomie poza zakresem (i na jakich warunkach wraca)

- **Warstwa trenerska — odłożona, nie skreślona.** Powód: nakład (drugi produkt + rola sprzedażowa) przekracza pojemność solo przy obecnych priorytetach. Warunki re-otwarcia: (a) B2 zielona i produkt „się prowadzi sam", (b) organiczny popyt — trenerzy sami piszą „chcę widzieć klientów", (c) apetyt właściciela na sprzedaż bezpośrednią się zmienia. Decyzje architektoniczne nadal **nie zamykają drogi** (relacja trener↔podopieczny, zgody, `programs.user_id`) — zasada z R5 pozostaje w mocy. Czat trenera: nie budować nigdy w v1 czegokolwiek — Messenger wygrywa.
- **Natyw iOS/Android** — poza zakresem; jedyny uzgodniony wyjątek re-oceny: TWA/sklepowe opakowanie PWA, jeśli dane pokażą duszenie pętli ekipy przez iOS (§5).
- **Trwale poza zakresem bez zmian:** AI auto-programming, makro/dieta, wearables/HRV, kickboxing, marketplace programów, publiczny feed, komentarze, DM.

## 10. Otwarte decyzje właściciela

1. **Próg sensu (B4):** liczba MRR, przy której Arco staje się głównym zajęciem — do wpisania w §7.
2. **Founder's edition** przy launchu: tak/nie (decyzja tuż przed launchem, po danych z listy oczekujących).
3. **Test cenowy A/B** na liście oczekujących (14,99/99 vs 9,90/79) — robić czy przyjąć rekomendację bez testu.
4. **Naniesienie rewizji §8** do plików źródłowych — kiedy.
