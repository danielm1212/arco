# Arco — onboarding: Piotr

**Cześć Piotr 👋** Ten dokument ma Ci dać pełny obraz: po co to robimy, dla kogo,
jak (być może) będzie zarabiać i od czego Ty zaczynasz. Czytaj od góry — pierwsza
połowa to „dlaczego", druga to „jak wejść w kod". Na koniec masz konkretne pierwsze
zadanie. Pytania wal śmiało, nie ma głupich na starcie.

---

## 1. Po co to w ogóle robimy

Większość apek treningowych każe Ci **wpisywać wszystko od zera**, zasypuje social-feedem
i porównywaniem, albo obiecuje „AI, które ułoży Ci trening" i nie dowozi. Efekt: ludzie
wracają do notatnika w telefonie albo rzucają po dwóch tygodniach.

Arco stawia inną tezę: **trening siłowy ma być przyjemnością, a narzędzie ma prowadzić,
nie obciążać.** Trzy rzeczy razem, których nikt nie robi naraz dobrze:

- **loguje się prawie samo** (sesja pre-wypełniona, seria = jeden tap, działa offline),
- **prowadzi jawnymi regułami** (kiedy dołożyć, kiedy odpuścić — i *mówi dlaczego*),
- **daje kameralną odpowiedzialność** (paru kumpli widzi tylko: byłeś i ile tygodni ciągniesz).

To nie jest „lepszy Hevy". To produkt **dla ludzi, dla których Hevy jest za duże i za obce.**

---

## 2. Wizja i cztery filary (kanon)

> **Misja:** Trening siłowy ma być przyjemnością — narzędzie ma prowadzić, nie obciążać.
>
> **Wizja:** Arco to dziennik siłowy, który *prowadzi, loguje się sam i pilnuje Cię razem
> z kumplem* — a Twoje liczby zamienia w historię, z której jesteś dumny.

Cztery filary doświadczenia:

1. **Frictionless** — sesja pre-wypełniona, seria = tap, offline, nic nie ginie.
2. **Prowadzenie** — jawne, *nadpisywalne* reguły. Pewność zamiast zgadywania — **nie AI-magia.**
3. **Kameralna odpowiedzialność (Ekipa)** — do 6 osób widzi tylko fakt treningu i passę. Zero feedu, cyrku, porównywania.
4. **Personalizacja (charakter à la Spotify)** — liczba-bohater, cele z prognozą, „Rok w żelazie", guidance po imieniu.

**Czym NIE jesteśmy** (anty-wizja, ważne — trzyma zakres): publiczny feed, AI-coach,
apka dietetyczna, wearables, narzędzie dla trenerów (na razie), klon Hevy z innym kolorem.

---

## 3. Dla kogo (persony)

| | **Paweł, 29** — trenuje poważnie | **Kasia, 24** — zaczyna | **„Radek"** — zaproszony kumpel |
|---|---|---|---|
| Rola | ICP **płacący** | ICP **wzrostowy** (raczej nie płaci — jest paliwem pętli) | rola w pętli wiralowej |
| Ból | stagnacja, „dokładać czy deload?", dane są ale wniosków brak | paraliż: co robić, ile, czy dobrze | sam nie utrzyma rytmu, apki go nudzą |
| Hak | „Arco wie, kiedy dołożyć, a kiedy odpuścić — i mówi dlaczego" | „Nie wiesz od czego zacząć — Arco wie" | „Paweł Cię widzi. Nie ciężary — tylko czy byłeś" |

Plus **„Trener Michał"** — nie klient, tylko **kanał dystrybucji**: układa plany podopiecznym,
udostępnia link → podopieczni wchodzą jako zwykli userzy. (Warstwa trenerska sama w sobie jest
świadomie odłożona.)

---

## 4. Jak (może) będziemy zarabiać

Słowo „może" jest celowe — model jest **hipotezą do walidacji**, nie pewnikiem. Ale kierunek
jest przemyślany (po audycie paywalla) i ma twarde zasady, których nie łamiemy:

**Zasady niepodważalne:**
1. **Rdzeń logowania zawsze darmowy** (start, zapis serii, timer, offline, historia w uczciwym zakresie, eksport).
2. **Silnik wzrostu zawsze darmowy** — Ekipa, zaproszenia, reakcje, nudge nigdy za paywallem.
3. **Limitujemy dostęp do funkcji, nie dane.** Nie kasujemy historii po triacie. Płatność odblokowuje analizę i prowadzenie, nie własność danych.
4. **Prywatność wygrywa z retencją.**

**Free (na zawsze):** pełny logger, 15 programów, własne plany, 12 tyg. historii, guidance-lite,
passa, cała Ekipa, cel siłowy + pasek postępu.

**Arco Coach — 99 zł/rok (yearly-first) lub 14,99 zł/mies** — jedna obietnica:
- *wie, dokąd zmierzasz* — cele z prognozą e1RM („przy obecnym tempie: marzec"),
- *mówi, gdy schodzisz z kursu* — diagnoza stagnacji + plan wyjścia,
- *pamięta całą Twoją drogę* — pełna historia, trendy, „Rok w żelazie".

**Mechanika:** reverse trial 21 dni bez karty (start po pierwszym ukończonym treningu) →
teaser stagnacji (pierwsza diagnoza gratis, w momencie bólu) → fale konwersji.

**Uczciwie o skali:** to rynek PL-only consumer, świadomy sufit ≈ 15–30k zł MRR. To etap
**walidacji, nie meta.** Najpierw dowód, że ludzie wracają i płacą — potem rozmowa o ekspansji.
Bramka: trial→paid ≥10% w płatnej becie, i to dopiero *po* dowodzie, że trial pokazał realną wartość.

---

## 5. Twoja rola — techniczny współzałożyciel (Co-founder & CTO)

Nie wchodzisz „do jednego kawałka" — wchodzisz jako **osoba odpowiedzialna za całą stronę
techniczną Arco.** Tak to rozpisuje porozumienie i tak to traktujemy.

**Ty prowadzisz** (porozumienie §2):
- architekturę i rozwój techniczny aplikacji;
- backend, bazę danych, **bezpieczeństwo**, testy i publikowanie wersji;
- monitoring błędów, backupy, dokumentację techniczną i kontrolę jakości;
- ocenę wykonalności i rekomendowanie rozwiązań technologicznych.

**Daniel prowadzi:** wizję, strategię i priorytety produktu; UX/UI, design system, markę
i komunikację; marketing, monetyzację i rozwój biznesowy. **Wspólnie:** testy z użytkownikami,
rozwój programów treningowych, zakres kolejnych wersji i ważne decyzje produktowe. Founder
ma ostatnie słowo w strategii i produkcie; **Ty masz ostatnie słowo w bezpieczeństwie
technicznym** — zgłaszając istotne ryzyko, podajesz przyczynę i proponowaną alternatywę (§2.5).

**Uwaga o podziale:** to jest podział *odpowiedzialności i ostatniego słowa*, nie „kto może
dotykać kodu". Daniel też bierze zadania dev z tablicy (vibecoding) i sam pushuje — obaj
przypisujecie sobie issues w Linear i pracujecie na tym samym repo. Ty odpowiadasz za spójność
techniczną i jakość całości; nie znaczy to, że wszystko musi przejść przez Ciebie.

**Intencja na przyszłość (§6):** jeśli współpraca się rozwinie i powstanie spółka, intencją
Stron jest rola **Co-founder & CTO** oraz docelowy pakiet **25% udziałów**, vesting 48 miesięcy
z 12-miesięcznym cliffem, liczony od podpisania porozumienia. To zapisana zgodna intencja —
nie przyznaje udziałów dziś; szczegóły określi osobna umowa przy zakładaniu spółki. Warunki
finansowe reguluje porozumienie, nie ten dokument.

### Od czego zaczynasz — pierwsze zadania (Linear, projekt „Security & PRIV-1")

Zaczynamy od bezpieczeństwa nie dlatego, że to całość Twojej roli, tylko dlatego, że to
**najlepszy sposób, żeby poznać cały system** (audyt RLS zmusza do przejścia wszystkich tabel,
polityk, storage i RPC) — i jednocześnie odblokowuje bramkę **PRIV-1** przed publiczną rejestracją.

1. **SEC-01 · Audyt RLS wszystkich tabel** ([DAN-34]) — Twoje wejście w kod. Spróbuj dostać się
   do cudzych danych (konto A vs B), sprawdź polityki INSERT/UPDATE/DELETE, storage z bucketem
   zdjęć sylwetki i RPC. Wynik: raport luk + testy wielokontowe.
2. **SEC-02 · Abuse protection** ([DAN-35]) — rate limiting, ochrona kodów zaproszeń, blokada masowej rejestracji.
3. **OPS-01 · Zaszyfrowany backup poza laptopem + rollback** ([DAN-36]).

Dalej naturalnie wchodzisz w resztę swojego zakresu: publikowanie wersji (`arco-release`),
monitoring błędów (OPS-02), CI i architektura pod skalę.

**Dostępy (porozumienie §3):** infrastruktura (Supabase, Vercel, GitHub, domeny, konta sklepów)
pozostaje pod kontrolą Founderа; dostajesz **dostęp potrzebny do uzgodnionych zadań** — na start
lokalny stack Supabase bez sekretów proda (audyt RLS robi się w 100% lokalnie). Dostęp do proda
dochodzi wraz z zakresem, który jest już Twój (deploye, monitoring, backupy) — a gdy dotknie
danych produkcyjnych, dojdzie formalne upoważnienie RODO (art. 29). Własne loginy + 2FA, zero
przekazywania haseł/kart, żadnych płatnych usług bez zgody Founderа. Na teraz do startu
potrzebne są **tylko GitHub + Linear** — matryca i kroki nadawania dostępu: `docs/dostepy-i-role.md`.

---

## 6. Stack i architektura w pigułce

- **Frontend + backend:** Next.js 16 (App Router, React Server Components + Server Actions), React 19, TypeScript, Tailwind 3. To PWA (działa jak apka na telefonie), hostowana na Vercel.
- **Dane/auth:** Supabase — Postgres + Auth + Storage. **Bezpieczeństwo opiera się na RLS** (Row Level Security): każdy użytkownik widzi wyłącznie własne wiersze, egzekwowane na poziomie bazy. To serce Twojego pierwszego audytu.
- **Offline:** Serwist (service worker) + kolejka zapisów (outbox), żeby trening w siłowni bez zasięgu nie gubił serii.
- **Zasada bezpieczeństwa #1:** klucz `service_role` (omija RLS) występuje **wyłącznie** w skryptach i środowisku serwerowym — nigdy w kliencie, repo ani logach.
- Domena docelowa: `trainarco.com` (landing) + `app.trainarco.com` (apka). Dziś prod: `arco-olive.vercel.app`.

---

## 7. Setup lokalny (zerowej-tarcia start)

Wymagane: Node 22, Docker (dla lokalnego Supabase), git.

```bash
git clone git@github.com:danielm1212/arco.git
cd arco
npm ci
npx supabase start          # lokalny stack Supabase w Dockerze
# skopiuj klucze z outputu do .env.local (URL + anon + service_role LOKALNE)
npm run seed                # 907 ćwiczeń + 15 programów
npm run bootstrap:user      # konto testowe
npm run dev                 # http://localhost:3000
```

Weryfikacja, że wszystko gra:
```bash
npm run lint && npm run test:unit && npm run build
npm run smoke               # + smoke:phase2 / smoke:offline / smoke:team
```

Testy wielokontowe (Twój wzorzec do audytu RLS) są w `scripts/smoke-team.ts` — pokazują, jak
konto A/B/C uderza w bazę przez `supabase-js` i jak sprawdzamy, że RLS odcina obcych.

---

## 8. Jak pracujemy (reguły, które oszczędzają nerwy)

- **Źródło prawdy = repo docs.** Zacznij od `docs/README.md`, potem `HANDOFF.md` (stan na dziś),
  `wizja-i-strategia-v3.md` (kanon), `backlog-produktu.md` (pełna kolejka).
- **Zadania = Linear** (workspace `trainarco`). Flow: Backlog → Todo → In Progress → In Review
  (= do testu) → Done. Labelka **„Test urządzeniowy"** = nie zamykamy bez sprawdzenia na telefonie.
- **Koordynacja przy pracy równoległej:** `docs/koordynacja-agentow.md` — zarezerwuj obszar,
  commituj małe paczki, pushuj szybko. Nie nadpisuj cudzych niezacommitowanych zmian.
- **Twarde reguły bezpieczeństwa danych** (patrz `CLAUDE.md`): każda tabela z danymi użytkownika
  ma RLS **i test wielokontowy w tej samej zmianie**; migracje wyłącznie przez `supabase/migrations`
  (reguły w `.claude/skills/arco-migration`); nigdy nie kasujemy danych hurtowo, dane testowe
  tylko po znanych ID.
- **Deploy na prod** idzie procedurą `.claude/skills/arco-release` i wymaga sekretów właściciela —
  to nie jest krok „w ciemno".

---

## 9. Gdzie co znaleźć

| Chcę... | Plik |
|---|---|
| zrozumieć wizję i model | `docs/wizja-i-strategia-v3.md` |
| stan produktu na dziś | `docs/HANDOFF.md` |
| pełną listę zadań | `docs/backlog-produktu.md` + Linear |
| decyzje już podjęte | `docs/decyzje-produktowe.md` |
| reguły pracy z kodem | `CLAUDE.md` |
| dokumenty RODO (drafty) | `docs/legal/` |
| jak robić migracje/backup | `.claude/skills/arco-migration`, `docs/backup-i-restore.md` |

---

**Na start:** przeczytaj sekcje 1–5 tego dokumentu, postaw lokalny stack (sekcja 7), przejrzyj
`scripts/smoke-team.ts`, i weź **SEC-01 (DAN-34)**. Jak coś nie wstaje albo coś jest niejasne —
pisz. Cieszę się, że jesteś. 💪
