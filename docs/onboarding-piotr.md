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

## 5. Twoja rola — dlaczego cyberbezpieczeństwo jest tu kluczowe

Wchodzisz w **najlepiej odizolowany i najbardziej „Twój" kawałek projektu.** Arco trzyma
wrażliwe dane (historia treningów, **zdjęcia sylwetki** = potencjalnie dane o zdrowiu), a przed
otwarciem publicznej rejestracji mamy formalną bramkę **PRIV-1** (RODO + bezpieczeństwo). To jest
dokładnie Twój teren i nie koliduje z bieżącą pracą produktową.

**Twoje pierwsze trzy zadania** (w Linear, projekt „Security & PRIV-1"):
1. **SEC-01 · Audyt RLS wszystkich tabel** ([DAN-34]) — Twoje wejście. Cel: spróbować dostać
   się do cudzych danych na lokalnym stacku (konto A vs B), sprawdzić polityki INSERT/UPDATE/DELETE,
   storage z bucketem zdjęć i RPC. Wynik: raport luk + testy wielokontowe.
2. **SEC-02 · Abuse protection** ([DAN-35]) — rate limiting, ochrona kodów zaproszeń przed brute-force,
   blokada masowej rejestracji.
3. **OPS-01 · Zaszyfrowany backup poza laptopem + rollback** ([DAN-36]).

**Dostępy:** na start **minimalne — pracujesz na lokalnym stacku Supabase**, bez sekretów
produkcyjnych i bez dostępu do proda. Audyt RLS robi się w 100% lokalnie i to jest właściwe
środowisko. Gdyby kiedyś doszedł dostęp do danych produkcyjnych, dojdzie też formalne upoważnienie
RODO (art. 29) — ale to przyszłość, nie teraz.

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
