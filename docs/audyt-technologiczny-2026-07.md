# Arco — audyt technologiczny przed deployem (2026-07-03)

> **Audyt historyczny sprzed aktualizacji frameworka.** Stan Next.js 14/React 18 opisany niżej nie jest aktualnym stackiem. Obecnie obowiązują `HANDOFF.md` i `package.json`; dokument zachowujemy ze względu na argumentację i wcześniejsze decyzje migracyjne.

> Rola: architekt infrastruktury. Pytanie właściciela: „czy na pewno wybraliśmy najlepsze rozwiązanie — zanim zrobimy deploy?"
> Metoda: wymagania (§1) → każda warstwa stacku vs realne alternatywy → werdykt + **wyzwalacz zmiany** (kiedy decyzję trzeba będzie zrewidować). Oceniam pod NASZE wymagania, nie „co jest modne".
> Stan faktyczny zbadany w repo: Next 14.2.35 · React 18 · Tailwind 3.4 · Serwist 9.5 · @supabase/ssr 0.12 · supabase-js 2.108 · offline = własny outbox (`lib/outbox.ts` 66 linii + `lib/useSync.ts` 92 linie, localStorage, koalescencja per seria) · `smoke:offline` istnieje.

---

## 0. TL;DR — werdykt główny

**Stack zostaje w całości. Żadna warstwa nie wymaga wymiany przed deployem.** Migracja czegokolwiek teraz = czyste ryzyko bez zysku (wszystko działa, jest zweryfikowane E2E i tanie). Audyt znalazł natomiast:

- **2 rzeczy do zrobienia PRZY deployu N1** (nieodwracalne/tanie tylko teraz): region **EU (Frankfurt)** przy tworzeniu projektu Supabase + region funkcji Vercel **fra1** → §7.
- **1 świadomie słabszy punkt** do pilnowania z określonym wyzwalaczem upgrade'u: ręczny offline-sync → §5.
- **3 decyzje przyszłości z gotową rekomendacją**: Capacitor jako most do native (H4), Vercel Pro przy monetyzacji, majory po launchu → §3/§6/§8.

## 1. Wymagania, wobec których oceniam

| # | Wymaganie | Skąd |
|---|---|---|
| R1 | Logger na telefonie na siłowni: offline-tolerancja, wake lock, wibracje, szybkość | brief, N1 QA |
| R2 | „Zespół" = właściciel-designer + Claude Code → stack mainstream, dobrze znany LLM, mało boilerplate, weryfikowalny w Preview | tryb pracy |
| R3 | Koszt ~0 zł do Horyzontu 2, potem tanio i przewidywalnie | analiza kosztów N1 |
| R4 | Dane treningowe = święte: integralność, backup, eksport (RODO później) | roadmap, bramka |
| R5 | Droga do native iOS/Android (H4: push) i socialu (H5: realtime) nie może być zamurowana | roadmap |
| R6 | Tokeny primitive→semantic, przyszły sync z Figmą | CLAUDE.md |

## 2. Scorecard

| Warstwa | Nasz wybór | Werdykt | Główne ryzyko | Wyzwalacz rewizji |
|---|---|---|---|---|
| Framework web | Next.js 14 App Router + React 18 | ✅ zostaje | zaległe majory (14→16, 18→19) | po launchu (S9) |
| Model aplikacji | PWA (Serwist) | ✅ zostaje | limity iOS (wibracje/push) | H4: push → Capacitor |
| Backend | Supabase (Postgres+Auth+RLS+Storage) | ✅ zostaje | security = wyłącznie RLS | testerzy → audyt RLS (już w planie) |
| Offline | własny outbox (localStorage) | 🟡 zostaje warunkowo | konflikt multi-device, eviction storage | drugi device / native / utrata danych |
| Hosting | Vercel Hobby | ✅ zostaje | klauzula non-commercial | pierwszy przychód → Pro $20/mc |
| Auth | Supabase GoTrue (email+hasło) | ✅ zostaje | polityka haseł przy publicznym signupie | bramka multi-user (już w planie) |
| Styling/tokeny | Tailwind 3 + CSS vars (primitive→semantic) | ✅ zostaje | — | workstream Figma (bez zmiany archi) |
| PWA toolkit | Serwist | ✅ zostaje | — | — |

## 3. Frontend: czy PWA na Next.js było słuszne?

**Alternatywy rozważone:** Expo/React Native od 1. dnia · SvelteKit/Remix · czysty SPA (Vite).

**Werdykt: słuszne.** Uzasadnienie wprost pod R2: Next+React+shadcn to najgęściej reprezentowany stack w wiedzy LLM (mniej halucynacji, szybsze iteracje Claude Code), Claude Preview weryfikuje webową apkę natychmiast (natywnej nie), a properytarny ekosystem RN dodałby build-tooling (Xcode/EAS), którego nikt w „zespole" nie obsłuży tanio. SvelteKit/Remix — technicznie równoważne, zero przewagi wartej migracji. App Router vs Pages: server components są lekkim naddatkiem złożoności dla app-like loggera, ale działają i nie płacimy za nie realnej ceny — nie ruszać.

**Matryca możliwości urządzeń (to trzeba znać przy N1 QA):**

| Możliwość | Android Chrome | iOS Safari / PWA |
|---|---|---|
| Wake Lock API | ✅ | ✅ od 16.4 |
| Wibracje (`navigator.vibrate`) | ✅ | ❌ **nigdy — API nie istnieje na iOS** |
| Web Push | ✅ | 🟡 tylko zainstalowana na ekranie głównym, od 16.4 |
| Instalacja PWA | ✅ (prompt) | 🟡 ręcznie „Dodaj do ekranu początkowego" |
| Dźwięk (Web Audio po interakcji) | ✅ | ✅ |

Wnioski: (a) na iOS **wibracje nie zadziałają po deployu i to nie jest bug** — sygnałem końca przerwy pozostaje beep + wizual (N1 QA już to zakłada, potwierdzam architektonicznie); (b) push dla nudge'y H5 na iOS przez PWA jest kruchy → patrz niżej.

**Droga do native (H4) — rekomendacja z wyprzedzeniem:** gdy przyjdzie czas na push/store, **pierwszym krokiem jest Capacitor** (opakowanie istniejącej apki webowej w natywny kontener: pełny push, haptyka, App Store/Play — przy zachowaniu ~100% kodu), a NIE rewrite na React Native. RN rozważać dopiero, gdyby Capacitor okazał się za wolny w loggerze (mało prawdopodobne — logger to formularze, nie animacje 60 fps). Warunek trzymany już dziś: logika w `lib/` jest czysta (bez zależności od server components) — tak zostawiać. To zdejmuje strach „PWA nas zamuruje": nie zamuruje, most istnieje.

## 4. Backend: Supabase vs alternatywy

| Kryterium | **Supabase** | Firebase | PocketBase (self-host) | Neon/RDS + własny auth |
|---|---|---|---|---|
| Model danych treningowych (relacje serie→sesje→PR) | ✅ Postgres | ❌ NoSQL — agregacje PR/statystyki pod górkę | 🟡 SQLite | ✅ |
| Multi-user security | ✅ RLS wbudowane | 🟡 rules (inny paradygmat) | 🟡 własne | ❌ do napisania |
| Koszt startu | 0 zł | 0 zł | ~20 zł/mc VPS + ops | 0–20 zł |
| RODO/EU | ✅ region EU + DPA | 🟡 | ✅ (własny) | ✅ |
| Eksport/anty-lock-in | ✅ pg_dump = standard | ❌ eksport właścicielski | ✅ | ✅ |
| Przyszłość: Storage (custom ćwiczenia S6), Realtime (cheers H5) | ✅ wbudowane | ✅ | 🟡 | ❌ osobne usługi |
| Ops dla zespołu 1-osobowego | ✅ zarządzane | ✅ | ❌ patching/backup na nas | 🟡 |

**Werdykt: Supabase to była właściwa decyzja i pozostaje właściwa.** Trzy rzeczy, które przesądzają: relacyjny model (guidance i PR-y to zapytania SQL — na Firestore byłyby drogie i pokraczne), RLS jako fundament przyszłego multi-user (bramka z roadmapy) oraz **niski lock-in**: baza to standardowy Postgres (`pg_dump` i wychodzisz), auth eksportowalny, PostgREST zastępowalny. Realtime i Storage czekają gotowe na H5/S6 bez nowych vendorów.

**Ryzyko nazwane wprost:** nasz model bezpieczeństwa to **wyłącznie RLS** (klient mówi do bazy bezpośrednio przez supabase-js). Jedna brakująca polityka = wyciek cudzych danych. Dlatego audyt RLS przed wpuszczeniem testerów (jest w planie jako mini-gate S10/N1) traktować jako nienegocjowalny. Pauza Free po 7 dniach i brak backupów Free — obsłużone w instrukcji N1 (ping + rytuał dump; Pro $25/mc dopiero przy cudzych danych).

## 5. Offline — najsłabszy punkt stacku (uczciwie)

**Co mamy:** outbox w localStorage (koalescencja per seria, last-write-wins, flush przed finish), 158 linii, smoke test. **Czego nie mamy:** persistencji zapytań, sync engine, rozstrzygania konfliktów między urządzeniami, gwarancji trwałości storage (Safari potrafi eksmitować storage rzadko odwiedzanych stron; zainstalowana PWA jest bezpieczniejsza).

**Werdykt: 🟡 wystarczające i PROPORCJONALNE — nie wymieniać teraz.** Profil użycia broni tej architektury: jeden user, jeden telefon, jedna sesja naraz → konflikt multi-device w praktyce nie istnieje; outbox żyje minuty, nie tygodnie. Poważne alternatywy (PowerSync — natywnie integruje się z Supabase, ElectricSQL, Replicache) to skok złożoności o rząd wielkości, który dziś kupowałby rozwiązanie problemu, którego nie mamy.

**Wyzwalacze upgrade'u (którykolwiek):** (a) realne używanie z dwóch urządzeń naraz (web+telefon edytują tę samą sesję), (b) wejście w natyw z prawdziwym offline-first, (c) pierwszy udokumentowany przypadek utraty danych z outboxa. Wtedy pierwszy kandydat: **PowerSync** (bo Supabase-native). Do tego czasu: trzymać inwarianty z S10 (guard swap/add/skip offline) + `smoke:offline` w rytuale przed-deployowym.

## 6. Hosting: Vercel

**Werdykt: ✅ zostaje.** Zero-config dla Next (R2), Hobby wystarcza (R3), brak egzotycznych ficzerów Vercela w kodzie = przenośność zachowana. Dwie rzeczy do wiedzenia:
- **Klauzula non-commercial na Hobby** — dziś legalnie OK (projekt osobisty). Wyzwalacz: pierwszy przychód (H4) → **zapłacić $20/mc za Pro, nie przenosić się** (czas migracji na Cloudflare/OpenNext jest droższy niż $240/rok; rewizja dopiero przy realnej skali).
- **Region funkcji: ustawić `fra1`** przy imporcie projektu, żeby serwer siedział przy bazie (Frankfurt) — inaczej default `iad1` (USA) doda ~100 ms do każdego SSR-hita. Szczegół, który kosztuje 0 i daje odczuwalną szybkość.

## 7. Delta do instrukcji N1 (rzeczy, które są tanie TYLKO teraz)

1. **Region Supabase: EU (Frankfurt) — wybierany przy tworzeniu projektu i NIEZMIENIALNY później** (zmiana = nowy projekt + migracja danych). Uzasadnienie: RODO (bramka), latencja z PL, DPA. To najważniejsza pojedyncza decyzja deployu.
2. **Vercel: region funkcji `fra1`** (Settings → Functions) — kolokacja z bazą.
3. Potwierdzenie istniejących ustaleń z instrukcji: service-role wyłącznie server-side, RLS włączone na wszystkich tabelach usera przed pierwszym testerem, ping anty-pauzie, rytuał `pg_dump`.

## 8. Czego świadomie NIE robić (anty-rekomendacje)

- **Nie ruszać majorów przed launchem** (React 19 / Next 16 / Tailwind 4 / TS 6) — zero korzyści funkcjonalnej, realne ryzyko regresji; decyzję odnowić po H2, gdy pojawi się konkretny zysk produktowy.
- **Nie wchodzić w React Native/Expo teraz** — most Capacitor istnieje i jest tańszy (§3).
- **Nie wdrażać sync-engine** (PowerSync/Electric) bez wyzwalacza z §5.
- **Nie self-hostować Supabase** — ops-koszt zabija oszczędność przy naszej skali.
- **Nie budować własnego auth** (NextAuth/Lucia) — RLS wymaga JWT Supabase; rozdzielenie auth od bazy = więcej kodu i powierzchni ataku bez zysku.
- **Nie przenosić się z Vercela „bo drożej będzie kiedyś"** — patrz §6, wyzwalacz to przychód, nie strach.

## 9. Decyzje dla właściciela

Żadna nie blokuje deployu N1 (region EU/fra1 to instrukcje, nie decyzje). Dwa świadome przytaknięcia na przyszłość:
1. **Capacitor jako domyślna ścieżka do native w H4** (zamiast rewrite RN) — wpis „PWA vs aplikacje natywne" w Notion dostaje tę rekomendację (Refinement).
2. **Vercel Pro przy pierwszym przychodzie** — zapisać w założeniach modelu monetyzacji (H4).

---

*Powiązane: `roadmap.md` (bramki do publiczności) i `plan-sprintow-2026-07.md` (bieżąca kolejność). Instrukcja dawnego deployu N1 pozostaje w historii Git. Audyt powtórzyć przed wejściem w native lub push — wtedy decyzje z §3 i §6 przechodzą z „przyszłość" do „teraz".*
