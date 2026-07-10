# Sprint N1 — Deploy-lite (HTTPS): instrukcja [Ty] + koszty

> Cel: apka na własnym URL HTTPS (Vercel + Supabase cloud), co odblokowuje **wake lock, wibracje/beep końca przerwy i instalację PWA** na telefonie (dziś po HTTP w LAN to nie działa — secure context). To NIE jest pełny launch (self-host obrazków, PL tłumaczenia, app icon = S11).
> Zakres i QA sprintu: `plan-sprintow-2026-07.md` §N1. Data: 2026-07-03.

## TL;DR koszty

**0 zł/miesiąc na start.** Supabase Free + Vercel Hobby wystarczają nam z ogromnym zapasem (jeden user, baza rzędu megabajtów, zdjęcia hotlinkowane — nie liczą się do naszych limitów). Jedyny opcjonalny wydatek: własna domena (~60–90 zł/rok) — niepotrzebna, darmowy `*.vercel.app` ma HTTPS od ręki.

Trzy haczyki (szczegóły w §Koszty):
1. Supabase Free **pauzuje projekt po ~7 dniach bez ruchu** (dane nie giną, ale apka staje do ręcznego wznowienia) — mitygacja za 0 zł: ping raz na dobę, ustawię.
2. Free = **brak automatycznych backupów** — mitygacja za 0 zł: cykliczny dump + migracje/seed w repo.
3. Vercel Hobby = **użycie niekomercyjne** — OK aż do monetyzacji (H4).

---

## Część [Ty] — ~30–45 min, jednorazowo

### Krok 0 — GitHub (potrzebny pod Vercel)
Nasze repo jest **tylko lokalne** (brak remote), a Vercel najlepiej działa spięty z GitHubem (auto-deploy po każdym pushu).
1. Konto na github.com (jeśli nie masz).
2. New repository → nazwa `arco`, **Private**, bez README/gitignore (repo ma być puste).
3. Podaj mi URL repo w sesji — podepnę remote i wypchnę kod. Jeśli git nie ma na Macu zapisanych poświadczeń, przygotuję Ci 2 komendy do uruchomienia (`gh auth login` lub token).
> `.env.local` jest w `.gitignore` — sekrety NIE trafią na GitHub. To sprawdzam przed pushem.

### Krok 1 — Supabase cloud (baza produkcyjna)
1. supabase.com → **Sign up przez GitHub** (najprościej).
2. **New project**: nazwa `arco-prod`, plan **Free**, **Region: EU — Frankfurt (eu-central-1)** ← ważne, zgodność z kierunkiem RODO z roadmapy (hosting danych w UE).
3. **Database password**: wygeneruj silne i zapisz w menedżerze haseł (potrzebne rzadko — do linkowania CLI, nie do codziennej pracy).
4. Po utworzeniu: **Project Settings → API** — będą tam 3 rzeczy:
   - **Project URL** (`https://<ref>.supabase.co`) — możesz wkleić w czat,
   - **anon public** key — możesz wkleić w czat (jest publiczny z definicji, chroni nas RLS),
   - **service_role** key — **SECRET**: omija RLS. Trafia TYLKO do env w Vercel i (na czas seeda) do lokalnego pliku poza repo. Nie wklejaj go w żadne inne miejsce.

### Krok 2 — Vercel (hosting + HTTPS)
1. vercel.com → **Sign up przez GitHub**, plan **Hobby** ($0).
2. (po tym jak wypchnę repo) **Add New → Project** → import `arco` → Next.js wykryje się sam, niczego nie zmieniaj.
3. **Environment Variables** (środowisko Production) — wklej:
   | Nazwa | Wartość | Uwaga |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL z kroku 1 | |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public | |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role | **bez** prefiksu NEXT_PUBLIC — zostaje po stronie serwera |
   | `ADMIN_EMAIL` | Twój email logowania | |
   | `ADMIN_PASSWORD` | **NOWE, silne hasło** | prod będzie w internecie — nie używaj dev-hasła |
4. **Deploy** → dostajesz `https://arco-<coś>.vercel.app`.

### Krok 3 — przekaż mi pałeczkę
W sesji: URL Supabase (ref projektu) + potwierdzenie, że env w Vercel siedzą. Do seeda będę potrzebował `service_role` lokalnie — wkleisz go do pliku `.env.production.local` (gitignore), a po seedzie możesz go z dysku usunąć.

---

## Część [Claude] — po Twoich krokach

1. `git push` na GitHub (weryfikacja: zero sekretów w repo).
2. `supabase link --project-ref <ref>` → `supabase db push` (wszystkie migracje na prod).
3. `npm run seed` + `npm run bootstrap:user` z env prod (service-role) → świeży start danych (zero danych testowych).
4. Mini-gate bezpieczeństwa (podzbiór S10): RLS włączone na wszystkich tabelach usera, service-role poza bundlem klienta, polityka seed read-only.
5. Ping anty-pauzie (Vercel Cron albo GitHub Action raz na dobę — darmowe).
6. QA z Tobą na telefonie (checklista z `plan-sprintow-2026-07.md` N1): wake lock · beep+wibracja końca przerwy · instalacja PWA + offline · wyszukiwarka na realnych danych.

---

## Koszty — szczegóły i kiedy pojawią się pieniądze

> Ceny wg stanu 2025/26 — przy zakładaniu kont rzuć okiem, czy nie drgnęły.

| Pozycja | Plan | Koszt | Limity vs nasze użycie |
|---|---|---|---|
| Supabase | Free | **0 zł** | 500 MB bazy (my: pojedyncze MB) · 1 GB storage (nie używamy — zdjęcia hotlink z GitHuba) · ~5 GB transferu/mc (nasz ruch: znikomy) · 50k MAU (my: 1) |
| Vercel | Hobby | **0 zł** | 100 GB transferu/mc · funkcje serverless w limicie · tylko użycie niekomercyjne |
| Domena | opcjonalnie | ~60–90 zł/rok | `arco-*.vercel.app` z HTTPS jest darmowe i wystarcza do N1/H2 |

**Haczyki free tier (musisz o nich wiedzieć):**
1. **Auto-pauza Supabase Free**: projekt bez requestów przez ~7 dni jest pauzowany. Dane NIE giną, ale apka przestaje działać do ręcznego wznowienia w dashboardzie. Przy 2 treningach/tydz. sam ruch powinien wystarczyć; dla pewności stawiam dobowy ping (pkt 5 wyżej) — problem znika.
2. **Brak backupów na Free** (dzienne backupy od planu Pro). Mitygacja za 0 zł: (a) migracje + seed są w repo — środowisko odtwarzam jedną komendą; (b) Twoje realne dane treningowe są małe — ustawię cykliczny eksport/dump. Gdy danych przybędzie i staną się cenne (testy userów, H2+), wtedy rozważymy Pro.
3. **Vercel Hobby wyklucza komercję** — nas nie dotyczy do Horyzontu 4.

**Kiedy realnie zaczniesz płacić (przyszłość, nie teraz):**
- **Supabase Pro $25/mc** — gdy zechcesz automatycznych backupów/PITR i zera pauz (sensowne przy testach userów H2 / bramce multi-user).
- **Vercel Pro $20/mc** — dopiero przy monetyzacji (H4).
- **Domena** — przy publicznym launchu (S11/H3), razem z app icon i brandem.

## Bezpieczeństwo — 3 zasady

1. **`service_role` omija RLS** — żyje tylko w env serwera (Vercel) i chwilowo w lokalnym pliku poza repo. Nigdy `NEXT_PUBLIC_*`, nigdy w repo, nigdy w screenshotach.
2. **`ADMIN_PASSWORD` na prod broni realnych danych w publicznym internecie** — długie, unikalne, z menedżera haseł. Signup publiczny pozostaje wyłączony (single-account), więc hasło + RLS to cała linia obrony.
3. **Region EU (Frankfurt)** — świadomie, pod przyszłą bramkę RODO z roadmapy; przenoszenie regionu później jest drogie, dlatego decyzja zapada teraz.
