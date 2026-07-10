# Plan dystrybucji — jak ludzie dowiedzą się o Arco

> Warstwa nad tym plikiem: **`strategia-marketingowa.md`** (pozycjonowanie, persony, messaging, kampania launchowa) — ten plik to taktyka kanałów.

> **Data:** 2026-07-08 · **Powód:** dystrybucja była najsłabszym ogniwem planu (ocena 5/10 w analizie spójności) — trzy hipotezy bez planu. Ten dokument zamienia je w system: kanały, kadencja realna dla solo, pomiar, i lista rzeczy, których świadomie nie robimy.
> **Zasada nadrzędna:** po launchu **dystrybucja dostaje ≥20% budżetu czasu projektu, co tydzień, bez wyjątków.** Klasyczna śmierć solo-produktu to 100% czasu w kod — „zbuduję jeszcze jeden feature, wtedy zacznę promować". Nie.

---

## 1. Mapa kanałów (kolejność = priorytet)

### K1 · Content/SEO po polsku (jedyny kanał, który się kumuluje)
- **Co:** blog na Framer CMS przy landingu (spójny z §1 landing-planu). Frazy, na które NIKT w PL nie pisze dobrze, a my mamy realną ekspertyzę w docs: „plan treningowy FBW dla początkujących", „progresja ciężaru — kiedy dokładać", „deload co to jest", „dziennik treningowy — apka czy notes", „trening w domu z hantlami plan". Każdy artykuł = wiedza z naszych programów/guidance + naturalne CTA na listę.
- **Kadencja solo-realna:** **2 artykuły/mies.** (Claude pisze draft w ToV z materiału docs/trainings i guidance; Ty redagujesz 30–60 min). Więcej = niedowiezione; mniej = SEO nie ruszy.
- **Horyzont zwrotu:** 4–8 mies. — dlatego startuje RAZEM z landingiem, nie z launchem. To najtańsza rzecz, która procentuje w dniu premiery.

### K2 · Pętla produktu (po launchu — silnik z wizji)
- Zaproszenia do podów + prompt instalacji na celebracji + (backlog) karty recap do udostępnienia. Mierzone k-współczynnikiem z B3. To jest silnik — ale silnik nie zapala się sam: K1/K3 dostarczają pierwszych 100 userów, pętla ich mnoży (albo nie — patrz `concierge-test-podow.md` ZANIM zbudujemy).

### K3 · Społeczności PL (ręczne, taktowne)
- **Gdzie:** subreddity PL fitness, forum SFD, grupy FB („trening siłowy", „siłownia dla początkujących", grupy kobiece — kierunek inkluzywny), Wykop (#silownia).
- **Zasada 10:1** — dziesięć pomocnych odpowiedzi (bez linka!) na jedno wspomnienie Arco, i tylko gdy ktoś pyta o narzędzie. Budujesz rozpoznawalny nick, nie spam. Log aktywności: arkusz kanał/data/link/efekt (UTM!).
- **Kadencja:** 30 min × 3/tydz. — w kolejce, w autobusie. Realne.

### K4 · Build in public (JEDEN kanał, nie trzy)
- Rekomendacja: **Instagram** (fitness żyje tam, retro-analog brand ma się gdzie pokazać: karty postępu, ziarno, clay ikony — warstwa komunikacji robi za content) — albo X, jeśli wolisz tech-audience; **nie oba**. 2 posty/tydz. z życia budowy + progresu własnych treningów (dogfooding jako story).
- Uczciwie: to kanał wolny i kapryśny. Traktuj jako budowę zaplecza pod launch, nie źródło ruchu.

### K5 · Mikro-partnerstwa (po launchu, oportunistycznie)
- 3–5 małych PL twórców fitness (1–20k obs.) — barter: roczny Coach + wpływ na roadmapę za szczery test. NIE „ambasadorzy", nie płatne posty. Trenerzy personalni jako polecający (bez warstwy trenerskiej — po prostu narzędzie, które polecają podopiecznym; przy okazji sondujemy popyt z §9 wizji).
- QR w lokalnych siłowniach za zgodą właściciela (landing → lista) — test w 2–3 miejscach, zanim uznamy za kanał.

## 2. Czego NIE robimy (i dlaczego)

- **Paid ads przed PMF** — palenie pieniędzy przy nieznanej konwersji; wraca najwcześniej po zielonym B2.
- **Cold DM / masowe posty w grupach** — sprzeczne z ToV i grozi banami, które bolą latami.
- **TikTok/YouTube long-form** — koszt produkcji > pojemność solo. Re-ocena przy trakcji.
- **Product Hunt / HackerNews** — audience nie-PL; strata amunicji. Ew. przy ekspansji EN.
- **Kupowanie baz / follow-for-follow** — oczywiste, ale niech będzie na piśmie.

## 3. Pomiar (spina się z instrumentacją)

- **Każdy link ma UTM** (`utm_source` = kanał z mapy, konwencja: `blog/reddit/fb-grupy/ig/qr-<siłownia>`). PostHog na landingu → `waitlist_signup {source}`; po launchu → rejestracje per źródło.
- Przegląd **raz w miesiącu** (30 min): tabela kanał → sesje → zapisy → koszt czasu. Kanał bez sygnału przez 2 miesiące = pauza, czas idzie do zwycięzcy. Zero sentymentów.
- Cel przed launchem: **300–500 na liście** (daje ~30–75 pierwszych userów przy typowej konwersji list 10–15%). Poniżej 100 = launch cichy robimy dłużej, nie „mocniej".

## 4. Sekwencja startowa (pierwsze 6 tygodni od postawienia landinga)

1. Tydz. 1: landing live + 2 pierwsze artykuły (evergreen: FBW + progresja) + UTM/PostHog sprawdzone.
2. Tydz. 2–3: start K3 (założenie obecności, zero linków — samo pomaganie) + K4 pierwsze posty.
3. Tydz. 4–6: artykuły 3–4, pierwsze taktowne linki w K3 tam, gdzie realnie pasują, przegląd metryk #1.
4. Równolegle: uczestnicy H2 + znajomi → lista (seed ~20–30 osób, social proof „N czekających" przestaje kłamać).
