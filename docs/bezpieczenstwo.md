# Bezpieczeństwo Arco — zasady systemowe + wynik przeglądu

> **Data:** 2026-07-08 · **Zakres:** (1) zasady obowiązujące od dziś, (2) przegląd obecnego stanu (kod/konfig/RLS — wykonany na repo), (3) checklisty per etap. Uzupełnia: `audyt-kodu-zaleznosci.md` (deps), bramkę kont+RODO w `roadmap.md`, `projekt-schematu-subs-consents-pods.md` §5 (RLS podów).
> Kontekst ryzyka: dziś single-user (ekspozycja mała), ale launch = realni userzy + płatności. Zasady pisane pod docelowy stan, checklisty rozkładają je na etapy.

---

## 1. Zasady twarde (obowiązują KAŻDĄ zmianę od dziś)

1. **RLS na każdej nowej tabeli z danymi usera, w tej samej migracji co tabela.** Test wielokontowy przy każdej zmianie polityk (dwóch userów nie widzi się nawzajem). Seed (`user_id=null`) zawsze read-only.
2. **Service-role nigdy w kodzie aplikacji** — tylko `scripts/` (seed/bootstrap/smoke) i przyszłe webhooki (route handlers server-only). Każdy PR dotykający auth/DB sprawdza to grepem.
3. **Sekrety:** nigdy w repo, nigdy w literałach komend (precedens: `.env.ops.local` gitignorowany, kasowany po użyciu — N1). Rotacja przy podejrzeniu wycieku, bez dyskusji. Prod-hasła generowane, nigdy dev-owe (`arco1` = wyłącznie lokalnie).
4. **Server action = pełny guard:** auth (`getUser`), własność zasobu (`user_id`), walidacja wejścia (whitelisty enum jak w `userExercises`), limity rozmiaru/typu uploadów. Klient NIGDY nie decyduje o uprawnieniach ani planie (entitlements liczy serwer — schemat §2).
5. **Dane usera są święte:** żadnych hurtowych DELETE poza seedem `user_id=null` (incydent 2026-07-02 = pamięć instytucjonalna); backup przed każdą ryzykowną operacją na prodzie; RODO-kasowanie tylko przez zaprojektowany cascade.
6. **Zero wykonywalnego wejścia:** brak `dangerouslySetInnerHTML`/`eval` (stan: czysto — utrzymać); treści od userów renderowane jako tekst; URL-e obrazków tylko z naszych bucketów/whitelisty `remotePatterns`.
7. **Zależności:** `npm audit` przy każdym sprincie + przegląd przy dodaniu paczki (czy utrzymywana, czy potrzebna); krytyczne vulny = stop-the-line. Vendorowanie zamiast zaufania w znikające paczki (precedens: react-body-highlighter).
8. **Minimalizacja danych** (RODO by design): nie zbieramy, czego nie potrzebujemy (wzorce już przyjęte: wiek bez daty urodzenia, check-in dzień-nie-godzina, zero PII w analityce).
9. **Nowa powierzchnia = przegląd przed merge:** upload, webhook, cron, push, e-mail — każde przechodzi przez pytania: kto może wywołać? co najgorszego może wysłać? co się stanie przy 1000×/min?
10. **Uczciwość = bezpieczeństwo marki:** żadnych ciemnych wzorców także w bezpieczeństwie (nie ukrywamy incydentów przed userami — przy realnym wycieku: powiadomienie + UODO wg RODO, patrz §4).

## 2. Wynik przeglądu (2026-07-08, na repo)

### ✅ Potwierdzone dobre (utrzymać)
- **RLS: 11/11 tabel** objętych (`enable row level security` + polityki per tabela; wzorzec `programs` z ownership).
- **Storage `body-photos`: prywatny** + polityki po folderze `user_id` (select/insert/delete own).
- **Auth-guard we wszystkich server actions** (`getUser` + ownership check; akcje zwracają `{error}`, nie throw).
- **Middleware chroni wszystkie trasy** (redirect na /login; poprawny wzorzec @supabase/ssr bez logiki między createServerClient a getUser).
- **Zero service-role poza scripts/, zero dangerouslySetInnerHTML/eval, `.env*` w gitignore** (żaden .env nie jest śledzony).
- **Upload zdjęć:** limit 5 MB + kontrola `image/*` + rozszerzenie z MIME + ścieżka `{uid}/{uuid}`.
- Ops-precedensy: sekrety przez gitignorowany plik jednorazowy, świeże `ADMIN_PASSWORD` na prod.

### ⚠️ Findings (priorytet · co · kiedy)
| P | Finding | Akcja | Etap |
|---|---|---|---|
| **P1** | **Brak security headers** (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; HSTS dokłada Vercel) | ✅ **załatane 2026-07-08** — `headers()` w `next.config.mjs` (zestaw bazowy, bez CSP). Weryfikacja przy najbliższym buildzie [Ty] | teraz |
| **P1** | **CSP brak** — z Next wymaga pracy (inline/nonce) | wdrożyć jako **Report-Only** przy S10, egzekwować przed launchem | S10→S11 |
| **P2** | **Bucket `exercise-photos` publiczny** (świadoma decyzja S6; URL nieodgadywalny UUID, ale bez auth) | przy multi-user: prywatny + signed URLs albo świadome pozostawienie z zapisem w polityce prywatności (zdjęcia własnych ćwiczeń mogą być widoczne dla posiadacza linku) — **decyzja [Ty] w Kroku 2** | Krok 2 |
| **P2** | **Brak rate limitingu** naszych akcji (Supabase auth ma własne limity, akcje nie) | limity na: signup, join-pod (invite brute-force — schemat już wymaga), upload, nudge (unique-index już projektowany) | Krok 2/4 |
| **P2** | **5 vuln w next@14** (audyt S9; wszystkie w next, fix = major) | decyzja majorów [Ty] przed launchem — do checklisty S11 | S11 |
| **P3** | Backupy: darmowy tier Supabase = ograniczona retencja, brak PITR | przed launchem: plan backupów (min. cotygodniowy dump poza Supabase) + test odtworzenia | S11/Krok 2 |
| **P3** | Brak CI z `npm audit`/lint gate | przy okazji pierwszego CI (nie blokuje; zasada §1.7 ręcznie) | po launchu |

### 🔮 Nowe powierzchnie z wizji (już zaprojektowane, pilnować przy budowie)
Krok 2: Stripe webhooks (weryfikacja sygnatur!), publiczny signup (enumeracja kont, polityka haseł, weryfikacja e-mail), eksport RODO (tylko własne dane!). Krok 4: RLS podów (test wielokontowy obowiązkowy — pułapka rekursji opisana w schemacie §5), invite-code ≥12 znaków + rate limit + rotacja, push endpoints (ochrona `push_subscriptions`), e-mail (SPF/DKIM/DMARC domeny!).

## 3. Checklisty per etap

**S10 (mini-gate — rozszerzony):** service-role poza bundlem (potwierdzone, re-check) · RLS włączone wszędzie (potwierdzone, re-check po nowych migracjach) · świeży start danych · **CSP Report-Only** · przegląd logów Supabase pod nietypowe zapytania.
**S11 (launch gate):** decyzja majorów next · CSP enforce · plan backupów + test restore · `npm audit` czysty lub zaakceptowany · headers zweryfikowane na prodzie (securityheaders.com).
**Krok 2:** wszystko z bramki roadmapy + decyzja exercise-photos + rate limiting + Stripe webhook signature + polityka haseł + audyt RLS wielokontowy (scenariusze w schemacie §5).
**Krok 4:** test wielokontowy podów (różne pody nie widzą się; były członek traci dostęp natychmiast) + brute-force test invite + SPF/DKIM/DMARC.

## 4. Proces (solo-founder edition — krótko, żeby było wykonalne)

- **Incydent** (wyciek/utrata danych/przejęcie konta): (1) zatrzymaj krwawienie (rotacja kluczy, wyłączenie endpointu), (2) snapshot stanu do analizy, (3) zapisz timeline w `docs/incydenty/`, (4) jeśli dane osobowe realnych userów → obowiązek RODO: ocena, ew. zgłoszenie UODO ≤72 h + powiadomienie userów (szablon przy Kroku 2 z konsultacją prawną), (5) post-mortem = wpis do tego pliku (jak incydent 2026-07-02).
- **Dostępy:** wszystko na Twoich kontach z 2FA (GitHub, Supabase, Vercel, Stripe, ESP — włącz wszędzie, jeśli gdzieś brak). Żadnych współdzielonych haseł. Claude dostaje sekrety tylko przez pliki jednorazowe.
- **Zgłoszenia z zewnątrz:** od launchu adres security@ (alias) w stopce polityki prywatności; odpowiedź ≤7 dni, bez bug bounty (uczciwie: solo).
- **Przegląd tego pliku:** przy każdej bramce (S11, Krok 2, Krok 4) — checklisty §3 odhaczane w HANDOFF.
