# Projekt schematu: subscriptions · consents · pods

> **Data:** 2026-07-08 · **Status:** DESIGN DOC, zero kodu i migracji — do recenzji [Ty]. Realizacja: subscriptions+consents w **Kroku 2** (bramka kont+RODO), pods w **Kroku 4** (fast-follow).
> **Podstawa:** `wizja-i-plan-produktu-v2.md` §2–§4 (Z1–Z3, reverse trial 21 dni, pod = check-in+passa NIE logi), `audyt-kodu-pod-wizje-v2.md` §4.5 (usunięcie konta vs integralność podów), konwencje istniejącego schematu (uuid pk, enumy, cascade po `user_id`, RLS wzorzec `programs`).
> **Cel dokumentu:** zamknąć decyzje modelowe TERAZ, żeby Krok 2 nie projektował pod presją — i żeby nic, co budujemy wcześniej, nie zamykało drogi.

---

## 1. Zasady projektowe (wyprowadzone z kanonu)

1. **Entitlement liczy serwer, nigdy klient.** Jedna funkcja SQL = jedna prawda; server actions i RLS czytają z niej.
2. **Trial bez karty = trial poza Stripe.** Reverse trial startuje z kontem (`auth.users.created_at + 21 dni`) — zero tabel do tego, dopóki nie ma wyjątków.
3. **Zgody: stan + audyt osobno.** Stan zgody musi być szybki do sprawdzenia (RLS!), historia append-only do RODO-rejestru.
4. **Pod widzi zdarzenia, nie treningi.** `activity_events` to OSOBNA tabela zasilana przy finish — RLS podów nie dotyka NIGDY `sessions`/`session_sets`. To jest techniczne serce decyzji „check-in i passa, nie logi".
5. **Nic nie kasujemy… oprócz konta (RODO wygrywa).** Usunięcie konta = twardy cascade wszędzie, łącznie z activity_events. Pod innych przeżywa — traci tylko wpisy usuniętego.

## 2. `subscriptions` + entitlements (Krok 2)

```sql
create type subscription_status as enum ('active', 'past_due', 'canceled', 'expired');
create type subscription_plan   as enum ('coach_monthly', 'coach_yearly');

create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  status                 subscription_status not null,
  plan                   subscription_plan not null,
  stripe_customer_id     text not null,
  stripe_subscription_id text not null unique,
  current_period_end     timestamptz not null,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
-- max jedna "żywa" subskrypcja na usera; historia zostaje w tabeli
create unique index subscriptions_one_live_idx on subscriptions (user_id)
  where status in ('active', 'past_due');

-- wyjątki od reguł: founder's edition, komp od supportu, grandfathering przy zmianie limitów
create type entitlement_override_kind as enum ('founder', 'comp', 'grandfather');
create table entitlement_overrides (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       entitlement_override_kind not null,
  until_at   timestamptz,          -- null = bezterminowo (founder)
  reason     text not null,        -- audytowalne "dlaczego"
  created_at timestamptz not null default now()
);
```

**Jedna prawda o planie** (używana przez server actions i polityki):

```sql
create or replace function get_plan(uid uuid) returns text
language sql stable security definer as $$
  select case
    when exists (select 1 from entitlement_overrides o where o.user_id = uid
                 and (o.until_at is null or o.until_at > now()))          then 'coach'
    when exists (select 1 from subscriptions s where s.user_id = uid
                 and s.status in ('active', 'past_due')                     -- grace: patrz niżej
                 and s.current_period_end > now() - interval '7 days')      then 'coach'
    when (select created_at from auth.users where id = uid)
         > now() - interval '21 days'                                      then 'coach' -- reverse trial
    else 'free'
  end;
$$;
```

**Grace period (refinement 2026-07-08):** nieudana płatność (`past_due`) NIE odcina dostępu natychmiast — 7 dni łaski od końca okresu (Stripe w tym czasie ponawia obciążenia; dunning e-mail z ToV „kumpla", nie komornika). Odcięcie w sekundę po wygaśnięciu karty = najgłupszy możliwy churn. Długość grace → decyzja #6 w §6.

**Beta-userzy H2 (refinement):** osoby z kontami założonymi PRZED launchem miałyby trial „skonsumowany" zanim się zaczął (`created_at` + 21 dni dawno minie). Rozwiązanie bez kodu: przy launchu hurtowy insert `entitlement_overrides(kind='comp', until_at=launch_date + 21 dni, reason='beta H2')`.

**Egzekwowanie limitów (Z3 — dostęp, nie dane):** w **server actions**, nie w RLS. RLS zostaje „user widzi swoje" — kłódka historii to filtr zapytania + UI, żeby (a) eksport RODO zawsze widział całość, (b) guidance/prefill liczyły po pełnych danych (decyzje z audytu §4.1–4.2), (c) odblokowanie po zakupie było natychmiastowe bez migracji. Limity tworzenia (2 programy / 10 custom) = guard `count()` w akcji + `limit_hit` event.

**Stripe:** webhooki (`checkout.session.completed`, `customer.subscription.updated/deleted`) piszą do `subscriptions` service-rolą. Tabela ma RLS `select own` (user widzi swój status), zero insert/update od klienta.

## 3. `consents` (Krok 2)

```sql
create type consent_kind as enum ('pod_activity_sharing', 'transactional_email', 'nudge_email', 'analytics');

-- STAN: szybkie "czy user ma aktywną zgodę X" (RLS-friendly)
create table consents (
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       consent_kind not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, kind)          -- revoke = DELETE wiersza (stan), historia w logu
);

-- AUDYT: append-only rejestr do RODO (nigdy nie kasowany za życia konta)
create table consent_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       consent_kind not null,
  action     text not null check (action in ('grant', 'revoke')),
  context    jsonb,                    -- np. {"pod_id": "...", "ui": "join-flow"}
  created_at timestamptz not null default now()
);
```

- **Zgoda podowa** = `pod_activity_sharing` globalnie (raz, przy pierwszym dołączeniu) + członkostwo per pod w `pod_members` (wyjście z poda ≠ cofnięcie zgody globalnej). Cofnięcie globalnej → trigger/akcja usuwa członkostwa i przestaje emitować eventy. Prosto i granularnie zarazem.
- **Wiek 16+:** `user_settings.age_confirmed_at timestamptz` (checkbox przy signup) — bez daty urodzenia (minimalizacja danych).
- **E-mail:** `transactional_email` (reset hasła itp. — podstawa prawna: umowa, zgoda niewymagana, wiersz dla porządku rejestru) vs `nudge_email` (wymaga zgody, osobny opt-out). `analytics` — na wypadek decyzji z konsultacji prawnej (instrumentacja §6.2).

## 4. `pods` (Krok 4)

```sql
create table pods (
  id          uuid primary key default gen_random_uuid(),
  name        text,                                    -- opcjonalne ("Ekipa z Melonika")
  invite_code text not null unique,                    -- patrz uwaga bezpieczeństwa niżej
  created_by  uuid references auth.users (id) on delete set null,  -- pod przeżywa twórcę
  created_at  timestamptz not null default now()
);
-- BEZPIECZEŃSTWO invite_code (refinement 2026-07-08): krótki kod = enumerowalny (brute-force
-- → wbicie się do cudzego poda i podgląd check-inów). Wymogi: ≥12 znaków losowych (base58),
-- join WYŁĄCZNIE przez server action z rate-limitem prób per IP/user, kod rotowany po każdym
-- dołączeniu lub ręcznie przez twórcę. Ładny krótki link robi warstwa URL (redirect), nie kod.

create table pod_members (
  pod_id       uuid not null references pods (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  joined_at    timestamptz not null default now(),
  consented_at timestamptz not null,                   -- potwierdzenie zgody w flow dołączenia
  primary key (pod_id, user_id)
);
-- limit 4 (Ty + 1–3): trigger before insert (count po pod_id) — nie da się wyrazić constraintem

-- CHECK-IN: jedyne, co pod widzi. Dzień, nie godzina (minimalizacja danych).
create table activity_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,  -- RODO: twardy cascade (§1.5)
  kind         text not null default 'workout_done' check (kind in ('workout_done')),
  occurred_on  date not null,
  streak_weeks integer not null default 0,             -- snapshot passy w momencie eventu
  created_at   timestamptz not null default now(),
  unique (user_id, kind, occurred_on)                  -- dedupe: 1 check-in/dzień
);

create table reactions (
  id                uuid primary key default gen_random_uuid(),
  activity_event_id uuid not null references activity_events (id) on delete cascade,
  user_id           uuid not null references auth.users (id) on delete cascade,
  emoji             text not null check (emoji in ('💪', '🔥', '👏', '🎯')),  -- whitelist = zero moderacji
  created_at        timestamptz not null default now(),
  unique (activity_event_id, user_id)
);

create table nudges (
  id           uuid primary key default gen_random_uuid(),
  pod_id       uuid not null references pods (id) on delete cascade,
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id   uuid not null references auth.users (id) on delete cascade,
  sent_on      date not null default current_date,
  created_at   timestamptz not null default now()
);
-- ANTY-SPAM (refinement 2026-07-08): nudge to szturchnięcie, nie karabin — bez tego
-- "jeden tap" umożliwia 50 nudge'y/dzień do tej samej osoby (sprzeczne z anty-toksycznością).
create unique index nudges_one_per_pair_per_day_idx on nudges (from_user_id, to_user_id, sent_on);
-- fallback chain per kanał + delivery rate do pulpitu (nudge_delivered w analytics)
create table nudge_deliveries (
  nudge_id     uuid not null references nudges (id) on delete cascade,
  channel      text not null check (channel in ('push', 'inbox', 'email')),
  status       text not null default 'pending' check (status in ('pending', 'delivered', 'failed', 'skipped')),
  delivered_at timestamptz,
  primary key (nudge_id, channel)
);
-- digest "max 1 nudge-mail/dzień": egzekwuje akcja wysyłki (query po delivered_at), nie constraint
-- ZASADY DOSTARCZANIA (wnioski z inspiracje/wnioski-dla-arco.md, N2/N3/N5):
--   1. QUIET HOURS: push/e-mail NIGDY między 22:00 a 7:00 czasu odbiorcy (skrzynka in-app zawsze);
--      nudge z nocy czeka do rana. Kontekst > godzina.
--   2. Okno preferowane: pora zbliżona do typowej pory treningu odbiorcy (mediana started_at
--      z historii) — reguła w akcji wysyłki, zero zmian w schemacie.
--   3. Copy push: konkret w PIERWSZYCH słowach ("Radek: trenuj dziś 💪") — AI-podsumowania
--      OS-ów (Apple/Google) przepisują powiadomienia; front-loading przeżywa streszczenie.
--   4. Jeden typ nudge'a, zero notyfikacji marketingowych w v1 — push to jedyna dźwignia
--      "push" produktu; spalimy ją spamem = user wyłącza wszystko.

create table inbox_items (                             -- kanał gwarantowany (skrzynka)
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('nudge', 'reaction', 'system')),
  payload    jsonb not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create table push_subscriptions (                      -- web push (VAPID)
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null,
  keys       jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);
```

**Zasilanie:** `finishSession` (server action) po sukcesie emituje `activity_events` (upsert po unique) ze snapshotem passy — JEDYNY most między światem treningów a światem podów. Kierunek danych: sessions → activity_events, nigdy odwrotnie.

## 5. RLS — wzorzec i pułapka rekursji

⚠️ **Znana pułapka Supabase:** polityka na `pod_members` odwołująca się do `pod_members` („pokaż mi członków moich podów") = nieskończona rekursja. Rozwiązanie: funkcja `security definer` omijająca RLS:

```sql
create or replace function my_pod_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select pod_id from pod_members where user_id = auth.uid();
$$;

create or replace function my_pod_peer_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select distinct m.user_id from pod_members m
  where m.pod_id in (select my_pod_ids());
$$;
```

Polityki (szkic):
- `pods`: select gdy `id in (select my_pod_ids())`; insert authenticated (twórca); update/delete tylko `created_by`.
- `pod_members`: select gdy `pod_id in (select my_pod_ids())`; insert = JOIN-flow przez server action (weryfikacja invite_code + zgody + limitu 4); delete własnego wiersza (wyjście z poda).
- `activity_events`: **select gdy `user_id = auth.uid()` OR (`user_id in (select my_pod_peer_ids())` AND właściciel ma aktywną zgodę `pod_activity_sharing`)**; insert/update tylko server action (service-side).
- `reactions`, `nudges`: select/insert w obrębie `my_pod_peer_ids()`; `inbox_items`, `push_subscriptions`: strict own.
- Do checklisty audytu RLS (Krok 2/4): test wielokontowy — userzy z RÓŻNYCH podów nie widzą się nawzajem; były członek traci widoczność natychmiast po wyjściu.

## 6. Decyzje do potwierdzenia [Ty]

| # | Decyzja | Rekomendacja |
|---|---|---|
| 1 | Ile podów na usera w v1? | **1 pod/user** — upraszcza UX, RLS i copy („Twój pod"); constraint unique na `pod_members.user_id`. Multi-pod = łatwe rozszerzenie później (drop constraint) |
| 2 | Usunięcie konta a check-iny w podzie | **twardy cascade** (jak w §1.5) — RODO czyste, pod traci wpisy usuniętego; alternatywa (anonimizacja „ktoś trenował") = więcej kodu, wątpliwa wartość przy podach 2–4 os. |
| 3 | Founder's edition | jako `entitlement_overrides(kind='founder', until_at=null)` — zero specjalnych ścieżek w kodzie płatności |
| 4 | Godzina vs dzień check-inu | **dzień** (`occurred_on date`) — minimalizacja danych; „trenował dziś" nie potrzebuje godziny |
| 5 | Emoji reakcji | whitelist 💪🔥👏🎯 (spójna z ToV; zero moderacji). Rozszerzenie = zmiana checka |
| 6 | Grace period przy `past_due` | **7 dni** od końca okresu (dunning Stripe + e-mail w ToV); alternatywy: 3 dni (ostrzej) / do końca miesiąca (miękko) |
| 7 | Retencja `inbox_items` | sprzątanie przeczytanych >90 dni (cron) — skrzynka to kanał dostarczenia, nie archiwum; bez tego rośnie bez końca |

## 7. Sekwencja wdrożenia

1. **Krok 2 (bramka):** `subscriptions`, `entitlement_overrides`, `get_plan()`, `consents`, `consent_log`, `age_confirmed_at` + RLS + webhooki Stripe + eksport RODO czytający wszystko.
2. **Krok 3:** guardy limitów w akcjach (używają `get_plan()`), kłódka historii, eventy `limit_hit`/`history_lock_hit`.
3. **Krok 4:** cały blok §4 + funkcje §5 + emisja z `finishSession` + kanały dostarczania.
4. Każdy etap: migracja → `database.types.ts` regen → audyt RLS wielokontowy → smoke.
