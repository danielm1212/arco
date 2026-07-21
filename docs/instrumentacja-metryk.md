# Instrumentacja metryk — taksonomia eventów, narzędzie, plan wdrożenia

> **Data:** 2026-07-08 · **Rebaseline:** 2026-07-20 · **Powód:** bramki VAL-1, PRIV-1,
> PAY-1 i GROW-1 z `roadmap.md` wymagają danych. Adapter istnieje, ale produkcja pozostaje no-op do decyzji
> prawnej i etapu po H2; bez tego cichy launch startowałby ślepy.
> **Stan:** taksonomia + wrapper `lib/analytics.ts` (typowany, no-op bez adaptera — zero zależności, zero wysyłki dziś). Podpięcie narzędzia = decyzja [Ty] + Faza 1.

---

## 1. Zasady (niepodważalne, spójne z Z1–Z3 i RODO)

- **Zero PII w eventach.** Żadnych imion, e-maili, nazw własnych programów usera. Identyfikator = pseudonimizowany `user_id` (UUID Supabase). Ciężary/serie NIE są wysyłane — mierzymy *że* user trenuje, nie *co* dźwiga.
- **EU-hosting i cookieless-first.** Konfiguracja bez cookies trzeciej strony; kwestię zgody
  rozstrzyga konsultacja prawna w PRIV-1.
- **Mierzymy produkt, nie inwigilujemy.** Eventy odpowiadają metrykom pulpitu wizji — nic „na zapas".
- **Analityka nigdy nie blokuje UX** — wrapper jest fire-and-forget, awaria/adblock = brak danych, nie brak funkcji.

## 2. Taksonomia eventów (snake_case; właściwości minimalne)

### Faza 1 — aktywacja i retencja (wire po decyzji prawnej, przed płatną betą)
| Event | Właściwości | Metryka pulpitu |
|---|---|---|
| `onboarding_completed` | `level`, `env`, `weekly_goal`, `recommendation_kind` (exact/fallback/none), `program_slug`, `suggested_program_accepted` | lejek aktywacji + jakość dopasowania |
| `onboarding_skipped` | `step` (na którym kroku) | wyciek na starcie (feedback #1!) |
| `program_recommended` | `program_slug`, `level`, `env`, `weekly_goal`, `match` (exact/fallback) | pokrycie biblioteki i przejście rekomendacja→aktywacja |
| `program_activated` | `program_slug` (seedowe; custom = `"custom"`), `source` (onboarding/library) | lejek |
| `session_started` | `source` (program/freestyle) | lejek |
| `session_finished` | `duration_min` (bucket), `sets_completed` (bucket), `is_first` (liczy serwer — done page zna liczbę sesji) | **% userów z ukończonym 1. treningiem**; baza W1/W4 |
| `pwa_install_prompt_shown` / `pwa_install_accepted` | `platform` (android/ios/desktop), `context` (celebration) | **instalacje PWA / aktywnych** |
| `app_opened` | `standalone` (bool) | DAU/WAU, W1/W4 retencja (kohorty liczy narzędzie) |

**North Star nie jest osobnym eventem.** Liczymy ją serwerowo z niepustych zakończonych sesji,
obowiązującego wtedy celu tygodniowego i strefy `Europe/Warsaw`: użytkownik zrealizował cel w
minimum 3 z 4 ostatnich pełnych tygodni. Zmiana celu nie może przepisywać wyniku historycznego.

⚠️ **iOS nie ma eventu instalacji** (brak `beforeinstallprompt`/`appinstalled` w Safari) — `pwa_install_accepted` na iOS **wnioskujemy**: pierwszy `app_opened` ze `standalone=true` po `pwa_install_prompt_shown`. Dashboard musi liczyć iOS tą regułą, nie eventem.

### Faza 2 — monetyzacja (wire w Kroku 3)
| Event | Właściwości | Metryka |
|---|---|---|
| `trial_started` / `trial_ended` | `variant`, `activation_source: first_finish` | konwersja triala bez zużywania go przed pierwszą wartością |
| `paywall_viewed` | `trigger`: `day21` / `stagnation` / `history_lock` / `limit_programs` / `limit_custom` | skuteczność triggerów per fala |
| `history_lock_hit` | `weeks_back_attempted` (bucket) | **konwersja_historia (fala 2)** — moment pierwszego kontaktu z kłódką |
| `limit_hit` | `kind` (programs/custom) | packaging limitów |
| `checkout_started` / `subscription_activated` / `subscription_churned` | `plan` (monthly/yearly) | MRR-lejek, churn premium |
| `guidance_shown` | `kind` (progression/balance/staleness/deload), `plan` (free/coach) | paliwo fali 1 |
| `paid_beta_reserved` | `price_variant` (bez danych kontaktowych) | intencja po poznaniu ceny; nie zastępuje zakupu |
| `import_interest` | `source` (hevy/strong/csv/other) | popyt na migrację przed budową importera |

### Faza 3 — publiczne Ekipy (wire razem z publicznym kanałem dostarczania)
| Event | Właściwości | Metryka |
|---|---|---|
| `pod_created` / `pod_joined` | `pod_size` | **% aktywnych w ekipie (GROW-1)** |
| `pod_invite_sent` / `pod_invite_accepted` | — | **współczynnik zaproszeń ≥1,15 (GROW-1)** |
| `nudge_sent` / `nudge_delivered` | `channel` (push/inbox/email) | **nudge delivery rate per kanał** |
| `reaction_sent` | — | żywotność ekip |

Konwencja: nowe eventy TYLKO przez rozszerzenie unii w `lib/analytics.ts` (type-safe, jedna lista prawdy) + wiersz w tej tabeli.

## 3. Karta wyników pilota H2-F

Przed warstwą analityczną pilot zarządzanych kont może korzystać z danych produktowych,
zanonimizowanego arkusza i feedbacku. Nie instalujemy trackera tylko po to, by ominąć decyzję prawną.

| Miara | Definicja |
|---|---|
| pierwszy trening | pierwsza niepusta sesja zakończona bez interwencji moderatora |
| drugi trening w 14 dni | druga niepusta sesja uczestnika z deklarowanym rytmem minimum 2/tydzień |
| aktywny tydzień 3 | minimum jedna niepusta sesja w trzecim tygodniu kohorty |
| użycie guidance | uczestnik otworzył/odczytał wskazówkę i potrafi powiedzieć, co zmieni w treningu |
| żywa Ekipa | para bez przypomnienia moderatora wysłała reakcję albo nudge |
| rezerwacja płatnej bety | jawne „tak” po minimum trzech sesjach i pokazaniu dokładnej ceny |

Progi są w `backlog-produktu.md`. Wynik rezerwacji jest słabszy niż zakup; prawdziwy WTP mierzy
dopiero PAY-01 po gotowości prawnej.

## 4. Narzędzie — rekomendacja: PostHog Cloud EU

| | PostHog Cloud EU | Plausible/Umami | Vercel Analytics |
|---|---|---|---|
| Funnele, kohorty, retencja W1/W4 | ✅ wbudowane | ❌ page-centric, brak kohort per-user | ❌ |
| EU hosting | ✅ (Frankfurt) | ✅ | ⚠️ |
| Koszt na starcie | free tier ~1M eventów/mies. — lata zapasu | free (self-host) | w planie Vercel |
| Cookieless/anon | ✅ konfigurowalne | ✅ | ✅ |
| Feature flags / A/B (test cenowy §10.3 wizji!) | ✅ w pakiecie | ❌ | ❌ |
| Exit-ryzyko | self-host możliwy później | — | lock-in |

**Rekomendacja:** PostHog Cloud EU — z tych widełek najlepiej pokrywa PAY-1 i GROW-1, a flagi
obsłużą kontrolowany test cenowy. Plausible można dołożyć później jako lekki licznik landinga.
Decyzja [Ty] przed Fazą 1.

## 5. Wdrożenie

**Faza 0 (zrobione dziś):** `lib/analytics.ts` — typowana unia eventów + `track()`; bez adaptera loguje w dev (console.debug), w prod nic nie wysyła. Zero nowych zależności, zero wpływu na build.

**Faza 1 (po H2-F, przed płatną betą):** decyzja narzędzia → adapter w `AppChrome`/`layout`
(EU host, cookieless) → eventy Fazy 1 → dashboard aktywacji, powrotu i retencji.

**Faza 2/3:** eventy monetyzacji i ekip wchodzą RAZEM z tymi feature'ami (nie osobno).

## 6. Mapa punktów wpięcia (Faza 1)

| Event | Plik / miejsce |
|---|---|
| `onboarding_completed` / `onboarding_skipped` | `components/WelcomeOverlay.tsx` — submit kroku końcowego / handler „Pomiń" (z numerem kroku) |
| `program_recommended` | `components/WelcomeOverlay.tsx` — przejście E4→E5 po wyliczeniu wyniku |
| `program_activated` | wywołania `setActiveProgram` (`app/actions/session.ts:18`) — po stronie klienta w `/programs` |
| `session_started` | klienckie wywołania `startSession`/`startFreestyle` (home / programy) |
| `session_finished` | mały klient-komponent na `app/session/[id]/done/page.tsx` — server component przekazuje mu propsy (`duration_min`, `sets_completed`, `is_first` z count sesji, który i tak liczy do celu tygodniowego). NIE w `Logger.handleFinish` — done page ma dane policzone serwerowo i odpala się dokładnie raz |
| `pwa_install_*` | przyszły komponent CTA na `app/session/[id]/done/page.tsx`, jeśli instalacja wejdzie do aktywnego planu |
| `app_opened` | `components/AppChrome.tsx` — mount + `matchMedia('(display-mode: standalone)')` |

Uwaga architektoniczna: eventy wysyłamy **z klienta** (spójny identyfikator). **Offline-tolerancję (kolejka, retry) zapewnia adapter narzędzia (PostHog ma wbudowaną), nie nasz wrapper** — wrapper jest świadomie „głupi": typuje, filtruje środowisko, nigdy nie rzuca. Server-side capture (webhooki Stripe → `subscription_activated`) dopiero w Fazie 2 przez PostHog Node — wtedy jeden `user_id` łączy oba źródła.

## 7. Otwarte [Ty]
1. Zgoda na PostHog Cloud EU (albo wskazanie alternatywy) — blokuje Fazę 1, nie Fazę 0.
2. Baner zgody: dołączyć pytanie do konsultacji prawnej przed publicznymi kontami (cookieless ≠ automatycznie zero obowiązków).
3. Czy `app_opened` liczymy od dziś na własnym koncie (dogfooding metryk), czy dopiero od launchu.
