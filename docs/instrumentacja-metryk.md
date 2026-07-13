# Instrumentacja metryk — taksonomia eventów, narzędzie, plan wdrożenia

> **Data:** 2026-07-08 · **Powód:** bramki B1–B4 i pulpit metryk z `wizja-i-plan-produktu-v2.md` §7 wymagają danych, a w kodzie nie ma żadnego trackingu (potwierdzone audytem `audyt-kodu-pod-wizje-v2.md`). Bez tego launch startuje ślepy.
> **Stan:** taksonomia + wrapper `lib/analytics.ts` (typowany, no-op bez adaptera — zero zależności, zero wysyłki dziś). Podpięcie narzędzia = decyzja [Ty] + Faza 1.

---

## 1. Zasady (niepodważalne, spójne z Z1–Z3 i RODO)

- **Zero PII w eventach.** Żadnych imion, e-maili, nazw własnych programów usera. Identyfikator = pseudonimizowany `user_id` (UUID Supabase). Ciężary/serie NIE są wysyłane — mierzymy *że* user trenuje, nie *co* dźwiga.
- **EU-hosting i cookieless-first.** Konfiguracja bez cookies trzeciej strony; kwestia banera zgody → do konsultacji prawnej w Kroku 2 (dopisane do zakresu bramki).
- **Mierzymy produkt, nie inwigilujemy.** Eventy odpowiadają metrykom pulpitu wizji — nic „na zapas".
- **Analityka nigdy nie blokuje UX** — wrapper jest fire-and-forget, awaria/adblock = brak danych, nie brak funkcji.

## 2. Taksonomia eventów (snake_case; właściwości minimalne)

### Faza 1 — aktywacja i retencja (wire przy S11/launch gate)
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

⚠️ **iOS nie ma eventu instalacji** (brak `beforeinstallprompt`/`appinstalled` w Safari) — `pwa_install_accepted` na iOS **wnioskujemy**: pierwszy `app_opened` ze `standalone=true` po `pwa_install_prompt_shown`. Dashboard musi liczyć iOS tą regułą, nie eventem.

### Faza 2 — monetyzacja (wire w Kroku 3)
| Event | Właściwości | Metryka |
|---|---|---|
| `trial_started` / `trial_ended` | `variant` (na test A/B) | konwersja_trial (fala 1) |
| `paywall_viewed` | `trigger`: `day21` / `stagnation` / `history_lock` / `limit_programs` / `limit_custom` | skuteczność triggerów per fala |
| `history_lock_hit` | `weeks_back_attempted` (bucket) | **konwersja_historia (fala 2)** — moment pierwszego kontaktu z kłódką |
| `limit_hit` | `kind` (programs/custom) | packaging limitów |
| `checkout_started` / `subscription_activated` / `subscription_churned` | `plan` (monthly/yearly) | MRR-lejek, churn premium |
| `guidance_shown` | `kind` (progression/balance/staleness/deload), `plan` (free/coach) | paliwo fali 1 |

### Faza 3 — ekipy (wire w Kroku 4)
| Event | Właściwości | Metryka |
|---|---|---|
| `pod_created` / `pod_joined` | `pod_size` | **% aktywnych w ekipie (B3)** |
| `pod_invite_sent` / `pod_invite_accepted` | — | **współczynnik zaproszeń ≥1,15 (B3)** |
| `nudge_sent` / `nudge_delivered` | `channel` (push/inbox/email) | **nudge delivery rate per kanał** |
| `reaction_sent` | — | żywotność ekip |

Konwencja: nowe eventy TYLKO przez rozszerzenie unii w `lib/analytics.ts` (type-safe, jedna lista prawdy) + wiersz w tej tabeli.

## 3. Narzędzie — rekomendacja: PostHog Cloud EU

| | PostHog Cloud EU | Plausible/Umami | Vercel Analytics |
|---|---|---|---|
| Funnele, kohorty, retencja W1/W4 | ✅ wbudowane | ❌ page-centric, brak kohort per-user | ❌ |
| EU hosting | ✅ (Frankfurt) | ✅ | ⚠️ |
| Koszt na starcie | free tier ~1M eventów/mies. — lata zapasu | free (self-host) | w planie Vercel |
| Cookieless/anon | ✅ konfigurowalne | ✅ | ✅ |
| Feature flags / A/B (test cenowy §10.3 wizji!) | ✅ w pakiecie | ❌ | ❌ |
| Exit-ryzyko | self-host możliwy później | — | lock-in |

**Rekomendacja:** PostHog Cloud EU — jedyne z widełek, które policzy bramki B2/B3 bez dodatkowej roboty, a flagi załatwią test cenowy przy okazji. Plausible można dołożyć później jako lekki licznik landing page (inny job). Decyzja [Ty] przed Fazą 1.

## 4. Wdrożenie

**Faza 0 (zrobione dziś):** `lib/analytics.ts` — typowana unia eventów + `track()`; bez adaptera loguje w dev (console.debug), w prod nic nie wysyła. Zero nowych zależności, zero wpływu na build.

**Faza 1 (S11 / launch gate):** decyzja narzędzia → `npm i posthog-js` → adapter w `AppChrome`/`layout` (init z `NEXT_PUBLIC_POSTHOG_KEY`, EU host, cookieless) → wpięcie eventów Fazy 1 w punkty z mapy §5 → dashboard „Pulpit B1–B4" w PostHog.

**Faza 2/3:** eventy monetyzacji i ekip wchodzą RAZEM z tymi feature'ami (nie osobno).

## 5. Mapa punktów wpięcia (Faza 1)

| Event | Plik / miejsce |
|---|---|
| `onboarding_completed` / `onboarding_skipped` | `components/WelcomeOverlay.tsx` — submit kroku końcowego / handler „Pomiń" (z numerem kroku) |
| `program_recommended` | `components/WelcomeOverlay.tsx` — przejście E4→E5 po wyliczeniu wyniku |
| `program_activated` | wywołania `setActiveProgram` (`app/actions/session.ts:18`) — po stronie klienta w `/programs` |
| `session_started` | klienckie wywołania `startSession`/`startFreestyle` (home / programy) |
| `session_finished` | mały klient-komponent na `app/session/[id]/done/page.tsx` — server component przekazuje mu propsy (`duration_min`, `sets_completed`, `is_first` z count sesji, który i tak liczy do celu tygodniowego). NIE w `Logger.handleFinish` — done page ma dane policzone serwerowo i odpala się dokładnie raz |
| `pwa_install_*` | przyszły komponent CTA na `app/session/[id]/done/page.tsx` (Krok 4 §5 wizji) |
| `app_opened` | `components/AppChrome.tsx` — mount + `matchMedia('(display-mode: standalone)')` |

Uwaga architektoniczna: eventy wysyłamy **z klienta** (spójny identyfikator). **Offline-tolerancję (kolejka, retry) zapewnia adapter narzędzia (PostHog ma wbudowaną), nie nasz wrapper** — wrapper jest świadomie „głupi": typuje, filtruje środowisko, nigdy nie rzuca. Server-side capture (webhooki Stripe → `subscription_activated`) dopiero w Fazie 2 przez PostHog Node — wtedy jeden `user_id` łączy oba źródła.

## 6. Otwarte [Ty]
1. Zgoda na PostHog Cloud EU (albo wskazanie alternatywy) — blokuje Fazę 1, nie Fazę 0.
2. Baner zgody: dołączyć pytanie do konsultacji prawnej Kroku 2 (cookieless ≠ automatycznie zero obowiązków).
3. Czy `app_opened` liczymy od dziś na własnym koncie (dogfooding metryk), czy dopiero od launchu.
