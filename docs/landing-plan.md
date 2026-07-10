# Landing + lista oczekujących — plan

> **Data:** 2026-07-08 · **Cel:** landing = (1) lista oczekujących pod cichy launch (Krok 3 wizji), (2) poligon testu cenowego A/B (wizja §10.3), (3) **pierwszy pełny pokaz retro-analog Warm** — warstwa komunikacji dostaje wreszcie własną scenę.
> **Podstawa:** `wizja-i-plan-produktu-v2.md` §1.2/§5/§10, `tone-of-voice.md`, `prompt-ikony-3d-clay.md`, backlog (retro display typo), `instrumentacja-metryk.md`.

---

## 1. Narzędzie — Framer: TAK, z trzema warunkami

**Framer to dobry wybór dla Ciebie** — i nie mówię tego grzecznościowo:

- Jesteś projektantem — Framer daje tempo iteracji wizualnej, którego Next w repo nie da; a landing to czysta warstwa komunikacji (retro, animacje, scroll), gdzie iteracja wizualna JEST robotą.
- **Architektura dwuwarstwowa działa na Twoją korzyść:** landing poza repo = zero mieszania retro-komunikacji z minimal-narzędziem, zero utrzymania w kodzie apki, deploy niezależny od sprintów.
- Hosting/SSL/CDN/formularze/A-B testing w pakiecie; custom code wystarczy na embed PostHoga.
- Koszt (~50–130 zł/mies. zależnie od planu) < wartość Twojego czasu na budowanie tego w repo.

**Trzy warunki (bez nich Framer się zemści):**

1. **Domeny od początku pod docelową strukturę:** landing na domenie głównej (np. `arco.app` / `arcoapp.pl` — decyzja #1), apka na `app.…`. Przenosiny później = utrata SEO i QR-kodów z siłowni.
2. **E-maile listy NIE mieszkają we Framer Forms.** Lista oczekujących to aktywo biznesowe i obowiązek RODO — trzyma je dedykowany ESP z UE/DPA (rekomendacja #2 niżej); Framer form tylko POST-uje do ESP. Inaczej: eksport CSV z Framera jako „baza marketingowa" to proszenie się o kłopoty.
3. **PostHog embed od dnia zero** (custom code, cookieless) — bez tego test cenowy A/B nie ma pomiaru, a landing nie zasili pulpitu B1–B4.

Alternatywa odrzucona (świadomie): strona w repo Next/Astro — taniej o subskrypcję, ale wolniejsze iteracje, miesza warstwy i dokłada utrzymanie. Wraca na stół dopiero, gdyby Framer dusił (np. i18n przy ekspansji EN).

## 2. ESP (dokąd spadają e-maile) — rekomendacja

**MailerLite** (serwery UE, DPA, double opt-in wbudowany, darmowy do 1000 subów, automatyzacje powitalne) — najlepszy stosunek RODO/koszt/prostota dla solo. Alternatywy: Brevo (UE, mocniejsze automatyzacje, cięższy), Loops (ładny, ale US-first — wymaga SCC). Decyzja #2.

Flow zapisu: Framer form → ESP → **double opt-in** (mail potwierdzający w ToV!) → tag `waitlist` + tag wariantu cenowego → mail powitalny.

## 3. Struktura landinga (sekcje + copy kierunkowe w ToV)

Landing opowiada jedną historię: *dziennik, który prowadzi, loguje się sam i pilnuje Cię razem z kumplem* — w tej kolejności.

| # | Sekcja | Zawartość / copy kierunkowe | Assety |
|---|---|---|---|
| 1 | **Hero** | Display-typo (poligon retro typo z backlogu!): **„Trenuj. Zapisuj jednym tapem. Nie odpuszczaj."** + subline: „Polski dziennik siłowy, który prowadzi Cię serię po serii — i pilnuje razem z kumplem." + input e-mail (CTA: **„Wpisz się na listę"**) + social proof placeholder („Dołącz do N czekających") | foto z ziarnem (prawdziwi ludzie, ciepłe światło — wzorce SENDR/tempo z wizji), logo |
| 2 | **Problem** | 3 bóle, krótko, po ludzku: „Notes ginie. Apki po angielsku liczą wszystko oprócz tego, co ważne. A samemu łatwo odpuścić." | typografia na kremie |
| 3 | **Filar 1 — loguje się samo** | screen loggera (UI minimal = kontrast retro↔narzędzie, celowy!) + „Sesja wypełnia się sama z Twojej historii. Seria = jeden tap. Działa offline — nic nie ginie." | screen w ramce, subtelne ziarno tła |
| 4 | **Filar 2 — prowadzi** | „Arco wie, kiedy dołożyć, a kiedy odpuścić — i zawsze mówi dlaczego. Żadnej AI-magii: jawne reguły, które możesz nadpisać." + mini-demo hintu | screen karty Wskazówek |
| 5 | **Filar 3 — pody (teaser!)** | „Ty i 1–3 znajomych. Widzicie tylko: kto trenował i którą serię tygodni ciągnie. Zero porównywania ciężarów, zero komentarzy. 💪 i »Radek przypomina Ci o treningu« — to wszystko. I to wystarcza." + badge „wkrótce po starcie" | ikona clay (dzwonek/💪), ilustracja check-inu |
| 6 | **Pricing (A/B — patrz §4)** | „Logowanie i pody — za darmo, na zawsze. Arco Coach — pełne prowadzenie i głęboka analityka." + cena wariantu + „Pierwsze 21 dni każdy dostaje pełną wersję" + subtitle: **„Bez zobowiązań, bez karty na start. Anuluj kiedy chcesz."** + mini-tabela free/Coach (wzorce Mobbin: „no commitment" subtitle i tabela porównawcza konsekwentnie podnoszą konwersję — `inspiracje/wnioski-dla-arco.md` P3/P4) | ikony clay (hantel/talerz) |
| 7 | **Founder's note** | Zdjęcie + 3 zdania od Ciebie (autentyczność gra z retro): dlaczego budujesz, że PL-first, że sam na tym trenujesz. Podpis odręczny? | foto analogowe |
| 8 | **FAQ** | Co to PWA (bez app store — i dobrze: instalujesz z przeglądarki w 2 tapy) · kiedy start · co z moimi danymi (Z3! „nic nigdy nie kasujemy, eksport zawsze darmowy") · iOS/Android | — |
| 9 | **Footer** | Polityka prywatności (§5 — MUSI być od dnia zero), kontakt, social | — |

Zasada: **cały landing = warstwa komunikacji** (ziarno, display, krem), ale screeny produktu pokazują czysty minimal UI — ten kontrast to nie bug, to dokładnie architektura z wizji §1.2. Landing jest też poligonem dwóch backlogów: retro display typo (hero) i ikon clay (sekcje 5–6) — tanio testujemy oba zanim wejdą do apki.

## 4. Test cenowy A/B (wizja §10.3 — rozstrzygany TUTAJ)

- **Wariant A:** 14,99 zł/mies · 99 zł/rok · **Wariant B:** 9,90 zł/mies · 79 zł/rok. Split 50/50 (A/B Framera lub PostHog feature flag — jedno źródło prawdy, nie oba).
- Mierzymy: `waitlist_signup` per wariant (czy cena na landingu zmienia skłonność do zapisu) + w mailu powitalnym 1 pytanie („Co by Cię skłoniło do płacenia? guidance / wykresy / programy" — spina się z B2 ze scenariusza H2, większa próbka).
- Uczciwość: na liście oczekujących NIE obiecujemy ceny wiążąco („cena startowa, dla listy gwarantowana przez 12 mies." — grandfathering w duchu Z3). Founder's edition (249 zł, decyzja §10.2 wizji): dopiero przy launchu, do listy, nie na landing v1.
- Eventy (rozszerzenie taksonomii przy wdrożeniu): `landing_viewed {variant}`, `waitlist_signup {variant, source_utm}`, `waitlist_confirmed` (double opt-in domknięty).

## 5. RODO minimum na start (przed pełnym Krokiem 2)

- Zapis = zgoda na JEDEN cel: „informacje o starcie i rozwoju Arco" — checkbox niedomyślny, link do polityki.
- **Polityka prywatności light** (administrator = Ty/działalność, cel, podstawa: zgoda, odbiorcy: ESP z DPA, prawa: wypis jednym klikiem w każdym mailu). Szablon ESP + godzina pracy; pełna wersja i tak wjedzie w Kroku 2.
- Double opt-in obowiązkowo (czysta lista + dowód zgody). Zero dokupowania baz, zero „prześlij znajomym" z automatu.

## 6. Metryki sukcesu landinga

| Metryka | Cel (kalibracja po 2 tyg.) |
|---|---|
| Konwersja wejście→zapis | dobre landingi waitlist: 10–25%; poniżej 5% = przepisz hero |
| Potwierdzenia double opt-in | ≥70% zapisów |
| Delta A/B ceny | świadomie: brak delty też jest wynikiem (= bierz 14,99) |
| Odpowiedzi na pytanie z maila powitalnego | ≥20% — mini-WTP na dużej próbce |

## 7. Etapy i podział

1. **[Claude, na żądanie]** Pełne copy wszystkich sekcji w ToV (PL) — z wariantami do wyboru + specyfikacja eventów dla custom code.
2. **[Ty]** Decyzje #1–#3 (niżej) + zakup domeny + konto Framer/ESP.
3. **[Ty]** Design we Framerze — z gotowym copy i assetami (prompty foto/ikon/typo już są w docs); test retro typo na hero = decyzja kroju przy okazji.
4. **[Ty+Claude]** Integracje: form→ESP, double opt-in flow (copy maili — Claude), PostHog embed, polityka light.
5. **Soft-publish:** najpierw link do znajomych/uczestników H2 (sekcja 6 skryptu już zbiera zgody!), potem społeczności PL (wg zasad społeczności, bez spamu).

Kolejność względem H2: **landing może iść równolegle** — nie zależy od wyników testów; jeśli H2 zmieni packaging, na landingu zmienia się jedna sekcja, nie koncepcja.

## 8. Decyzje [Ty]

1. **Domena** — kierunek: krótko, wymawialne po polsku, `.app` (wymusza HTTPS, pasuje do PWA) lub `.pl` (PL-first sygnał). Sprawdzić kolizje znaku „Arco" (wstępny research, nie kancelaria).
2. **ESP:** MailerLite (rekomendacja) / Brevo / inny.
3. **Framer plan:** wystarczy najniższy z custom domain; A/B — sprawdzić czy w planie, fallback = PostHog flag (darmowy).
4. Founder's note — chcesz sekcję z twarzą, czy anonimowo-produktowo? (Rekomendacja: z twarzą — retro-analog + solo-founder to spójna historia.)
