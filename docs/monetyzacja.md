# Arco — strategia monetyzacji (fundament)

> ⚠️ **AKTUALIZACJA 2026-07-08:** w zakresie **modelu (podział free/paid, cennik, trial), sekwencji wykonawczej i R3** ten dokument jest **nadpisany przez `wizja-i-plan-produktu-v2.md`** (kanon). Największe zmiany: model hybrydowy limity+wartość (R3 v2), reverse trial 21 dni, cena 14,99 zł/99 zł, **warstwa trenerska ODŁOŻONA** (nie jest już „docelowym silnikiem przychodowym" ani planem B — §9 wizji), **pody awansują na silnik wzrostu** (fast-follow po launchu). Poniżej aktualne pozostają: benchmarki (§2), matematyka sufitu (§3), teza główna (§1) i tło decyzji R1–R6.
>
> Decyzja kierunkowa właściciela 2026-07-06: **PL-first z opcją ekspansji**. Odrzucone: marketplace programów autorskich (kanibalizacja przez darmowe startery + przyszłe community). Pełna analiza z liczbami i źródłami: sesja Cowork 2026-07-06 (`arco-monetyzacja-strategia.md`).
> Status: kierunek strategiczny — **nie zmienia scope'u Horyzontu 1–2**. Rdzeń dalej ma priorytet; launch publiczny idzie z pełnym freemium od dnia zero (Krok 3 wizji v2).

---

## 1. Teza główna

**Nikt nie płaci za silnik — ludzie płacą za pewność i wynik.** Packaging: nie „silnik progresji", tylko *„Arco wie, kiedy dołożyć, a kiedy odpuścić"*. Silnik nie musi być genialny na starcie — musi bić „user zgaduje sam". Dopracowanie silnika to roadmapa płatnego tieru, nie warunek wejścia.

**W wariancie PL-first pieniądze leżą u trenera, nie u ćwiczącego.** Consumer premium w PL ma sufit ~15–30k zł MRR (matematyka §3) — to fundament walidacyjny, nie model docelowy.

## 2. Benchmarki (2026-07)

- **Hevy**: ~$600k/mies przy 2M+ userów, self-funded, freemium. Model potwierdzony — ale na skali globalnej i po ~5 latach.
- **Konwersja freemium→paid** (health&fitness): mediana 2,1%, top kwartyl 4,5%. Trial→paid: mediana ~40%; triale 17–32 dni konwertują ~45,7% vs ~26,8% przy ≤4 dniach.
- **Fitatu** (PL-first, dieta): ~26,8 mln zł przychodu, ~3 mln zł zysku — dowód, że PL-first w health apps działa; ale TAM diety >> TAM dziennika siłowego.
- **Rynek trenerski PL**: ~7 000 aktywnych trenerów personalnych, 2 700+ klubów, ~3 mln regularnych bywalców siłowni, ~30% nowych klientów klubów bierze trenera. Narzędzia PL-native tanie i słabe (Indefit 15 zł/mies), globalne drogie (Trainerize/TrueCoach $30–165/mies + 5% od płatności).

## 3. Matematyka sufitu consumer premium PL

30–60k MAU (1–2% penetracji TAM po 2–3 latach — to już sukces) × 3% konwersji × 17 zł/mies = **15–30k zł MRR (180–360k zł/rok)**. Pokrywa życie jednej osoby, nie skaluje. Wniosek: etap 1, nie destination.

## 4. Trzy etapy

### Etap 1 — Consumer premium („Arco Coach") — walidacja
> 🔄 **Wersja obowiązująca: `wizja-i-plan-produktu-v2.md` §3** (model hybrydowy limity+wartość, cennik 14,99 zł/99 zł, reverse trial 21 dni, zasady Z1–Z3, dwie fale konwersji). Poniższy opis zostawiony jako historia decyzji.
Free: pełny dziennik (frictionless logging), programy startowe, podstawowe staty, guidance-lite (patrz §5-R3). Paid: pełny guidance (deload, balans, staleness), głęboka analityka (tonaż, trendy, muscle split, liczba-bohater w czasie), nielimitowane własne programy.
Cena: **14,99–19,99 zł/mies** z trialem 14–30 dni — z zastrzeżeniem R2 (§5). Cel etapu: **sygnał**, nie MRR — czy konwersja przebija 2%. ~~Kill/pivot: <1,5% po 3 mies. uczciwej iteracji paywalla → przenieść ciężar na etap 2 szybciej.~~ **Kill-gate zrewidowany (wizja v2 §7-B2):** przy czerwonym → wariant C (wąska nisza home/dumbbell) albo świadomy status side-projectu; trenerzy nie są już wyjściem awaryjnym.

### Etap 2 — Warstwa trenerska — ⏸️ ODŁOŻONA (2026-07-08, nie skreślona)
> 🔄 **Rewizja (wizja v2 §9):** nakład (drugi produkt + rola sprzedażowa) przekracza pojemność solo-foundera. Warunki re-otwarcia: B2 zielona i produkt „się prowadzi sam" · organiczny popyt od trenerów · zmiana apetytu właściciela na sprzedaż bezpośrednią. Decyzje architektoniczne nadal **nie zamykają drogi** (R5 w mocy). Poniższa analiza zostaje jako gotowy plan na wypadek re-otwarcia.
Strukturalna przewaga: **podopieczny już loguje granularne dane** (RIR/RPE, tonaż, wzorce ruchowe, set-volume per partię) — trener w Excelu/Indefit dostaje zdjęcie kartki. Trener w Arco widzi live, czy klient zrobił 3×8 przy RIR 2.
Model: trener free do 2–3 podopiecznych (hook), potem **59–99 zł/mies**. 7 000 trenerów × 10% × 79 zł ≈ **55k zł MRR** + każdy trener przyprowadza 5–15 podopiecznych jako userów za darmo (najniższy churn w kategorii — retencję wymusza relacja z trenerem). Trener = kanał dystrybucji, nie tylko klient.
Wymaga: dashboard trenera, relacja trener↔podopieczny w modelu danych, przypisywanie programów. GTM: bezpośrednio do trenerów (Instagram/kluby), nie App Store.

### Etap 3 — Decision gate: ekspansja EN lub/i B2B wellness
Po ~50k zł MRR z etapów 1–2: consumer globalnie (walka z Hevy — trudna) vs pogłębienie PL B2B (Multisport/Medicover Sport integrują appki partnerskie; Activy zbudowało na tym biznes). Nie decydować dziś; nie zamykać drogi (i18n-ready copy i tokeny od początku).

**Odrzucone**: reklamy (zabijają premium), lifetime jako model główny (ew. limitowana founder's edition przy launchu), marketplace programów (decyzja właściciela), affiliate jako filar (ew. dyskretny dodatek później).

## 5. Rozjazdy z kanonem (wykryte 2026-07-06) — do rozstrzygnięcia / już rozstrzygnięte

**R1 — Rozprzęgnięcie H4.** `roadmap.md` H4 wiąże monetyzację z natywem i socialem. Nowy plan: consumer premium NIE potrzebuje ani natywu, ani socialu. Co więcej, **PWA/web to atut monetyzacyjny**: płatności Stripe po stronie web omijają 30% prowizji App Store. Social (H5) zostaje warstwą retencji/moat, nie warunkiem przychodu. → naniesione w `roadmap.md` H4.

**R2 — Kotwica cenowa Hevy.** `konkurencja-hevy.md`: Hevy Pro **$2.99/mies · $23.99/rok (~7,5 zł/mies) · $74.99 lifetime**. Roadmap zakładał 9,90 zł/mies; analiza rynkowa sugerowała 14,99–19,99. Świadomy user porówna. Do decyzji przy etapie 1: pozycjonować cenowo blisko Hevy (9,90–12,99) i grać wolumenem, czy premium (14,99+) z uzasadnieniem guidance+PL. **Nierozstrzygnięte — decyzja po danych z testów (H2), zgodnie z roadmapą.** Argument za premium: nie konkurujemy z Hevy na feature'y, tylko na prowadzenie; argument przeciw: PL wrażliwość cenowa.

**R3 — Paywall vs wyróżnik anti-Hevy: ✅ ROZSTRZYGNIĘTE → 🔄 R3 v2 (2026-07-08, wizja v2 §3/§8).** Czysty podział guidance-lite/full zastąpiony **modelem hybrydowym limity+wartość**: guidance-lite/full zostaje, dochodzą limity free — 2 własne programy, 10 custom ćwiczeń, 12 tygodni historii (dostęp, nie dane — Z3: nic nigdy nie jest kasowane). **Reverse trial 21 dni** zatwierdzony jako model wejścia. Zasady nadrzędne Z1–Z3 (rdzeń pętli darmowy, silnik wzrostu darmowy, limitujemy dostęp nie dane) — wizja v2 §2.

**R4 — Bramka kont+RODO przesuwa się przed etap 1.** Monetyzacja wymaga publicznego signupu, płatności (Stripe: regulamin, odstąpienie, faktury, VAT/OSS-ready przy ekspansji) — bramka z roadmapy (konta, RLS-audyt, polityki, DPA Supabase EU) staje się prerekwizytem etapu 1, nie H4. Zapowiedziany `docs/legal-i-konta.md` będzie potrzebny wcześniej.

**R5 — Warstwa trenerska nie istnieje w kanonie.** Żaden dok jej nie przewidywał. Architektonicznie sprzyja nam brief v0.2 („schema i auth od początku pod multi-user / white-label") i model `programs.user_id`. Do przemyślenia przy decyzjach architektonicznych (pamięć `proactive-architecture-review`): relacja trener↔podopieczny, udostępnianie programu innemu userowi, widoczność danych podopiecznego (RODO: zgoda!). **Nie budować teraz — nie zamykać drogi.**

**R6 — Rot dokumentacji: ✅ SPRZĄTNIĘTE (2026-07-06).** Kickboxing usunięty z briefu v0.2; plate calc oznaczony jako descoped w briefie i `setup-local.md`; volt/Athletic oznaczony jako porzucony w `roadmap.md` (H3 + analiza konkurencji) i w torze assetów `sprinty-szczegolowe.md` (prompty do przepisania pod Warm przed użyciem).

## 6. Co to zmienia TERAZ (a czego nie)

Nie zmienia: Horyzont 1–2 i bieżące sprinty (S9-cz.2 → S10) idą bez zmian. Rdzeń ma hulać — to się nie ruszyło.
Zmienia:
1. Przy decyzjach architektonicznych uwzględniać przyszłą relację trener↔podopieczny (nie budować, nie blokować) — mimo odłożenia warstwy trenerskiej (R5 w mocy).
2. Copy i tokeny projektować i18n-ready (już w duchu design-token-first).
3. `docs/legal-i-konta.md` wjedzie na roadmapę wcześniej (bramka kont+RODO = Krok 2 wizji v2, zakres rozszerzony o zgodę podową, wiek 16+, e-mail transakcyjny).
4. ~~Decyzja otwarta [Ty]: R2~~ → **R2 rozstrzygnięte w wizji v2 §3.1: 14,99 zł/mies · 99 zł/rok** (pozycjonowanie premium z uzasadnieniem guidance+PL); otwarty pozostaje ew. test A/B na liście oczekujących (wizja v2 §10.3). R3 → R3 v2 (limity+wartość, patrz §5).
