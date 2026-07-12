# Onboarding v3 — analiza + projekt (DO AKCEPTACJI [Ty])

> **Data:** 2026-07-11 · **Baza:** audyt `WelcomeOverlay` v2 (kod) + wzorce (Fitbod-quiz, Duolingo-commitment, Opal/Blinkist outcome-first, Hevy-minimal) + kanony: wizja §1.1 (dwie rampy), ToV, redesign-home §3.6, minimalizacja danych.
> **Cel liczbowy:** od „Witaj" do aktywnego planu **≤ 60 sekund**; metryka: `onboarding_completed` rate + krok porzucenia z `onboarding_skipped {step}` (taksonomia już gotowa).

---

## 1. Audyt v2 (co jest, co kuleje)

**Dobre (zostaje):** pełny ekran; grid poziom×środowisko → program z uczciwymi notami fallbacków (adv×home, int×bodyweight); auto-przejście po wyborze kafla; skip globalny i per krok; zapis przez `updateSettings`+`setActiveProgram`; sand jako tło = zgodne z rewizją V4 (onboarding to warstwa momentów).

**Kuleje:**
| # | Problem |
|---|---|
| O1 | **Krok 0 przeładowany:** intro + imię + jednostki na jednym ekranie — problemem był intro-tekst konkurujący z pytaniami, nie same pytania. *(Rewizja [Ty] 2026-07-11: jednostki ZOSTAJĄ w E1 jako przełącznik z preselekcją kg)* |
| O2 | **Zaczyna się formularzem, nie momentem** — mamy Gambarino i zasadę „display-typo w momentach", a pierwszy kontakt z marką to input |
| O3 | Finał nie domyka pętli: po zapisie user ląduje na home bez potwierdzenia, że coś się właśnie stało („gdzie ten plan?") |
| O4 | Brak progress-kropek i „wstecz" — user nie wie, ile zostało; pomyłka w kroku = skip albo od nowa |
| O5 | `text-muted-foreground` na sand — mieszanie temperatur szarości (paleta: na sand tylko stone) |
| O6 | Zero eventów (Faza 1 instrumentacji ma gotowe `onboarding_completed/skipped`) |

**Wzorce — co bierzemy, czego nie:** Fitbod pyta o wszystko (wiek/waga/cele) — MY NIE: pytamy wyłącznie o to, co zmienia sugestię (środowisko, poziom) + minimalne personalizacje (imię, cel tyg.) — minimalizacja danych jako feature („zero ankiety o wadze"). Duolingo: commitment przez cel + primer passy — bierzemy (E4 + linijka o passie). Opal/Blinkist: outcome przed decyzją — bierzemy w E5 (karta planu sprzedaje wynik, nie formularz). Hevy: brak prowadzenia — to nasza przewaga, nie wzorzec.

## 2. Projekt v3 — 6 ekranów, jedna decyzja na ekran

**E0 · MOMENT (nowy):** pełny sand, logo, **Gambarino display: „TRENUJ. ZAPISUJ. NIE ODPUSZCZAJ."** + sub: „60 sekund i masz plan od trenera." → CTA „Zaczynamy" (+ „Pomiń" w rogu, jak dziś). Jedyny ekran bez decyzji — pierwszy kontakt z marką (retro-analog debiutuje w produkcie).
**E1 · Ty:** „Jak mamy na Ciebie wołać?" — input, opcjonalne + **jednostki: przełącznik kg/lbs z preselekcją kg** *(rewizja 2026-07-11, decyzja [Ty]: pytanie wraca — ale jako glance-confirm, nie decyzja: kg zaznaczone, lbs jeden tap)*. „Pomiń ten krok" ustawia defaulty. O1 dotyczył intro-tekstu dzielącego ekran z pytaniami — intro przejęło E0, więc para imię+jednostki jest teraz lekka.
**E2 · Gdzie trenujesz:** 3 kafle (Siłownia / Dom z hantlami / Masa ciała) z hintami jak dziś; docelowo ikony clay (tor assetów). Auto-advance.
**E3 · Doświadczenie:** 3 opcje z hintami (bez zmian merytorycznych). Auto-advance.
**E4 · Cel tygodniowy:** 2 / 3 / 4 treningi — **default wg poziomu** (beginner→2, int→3, adv→4), copy: „Ustaw życiowo, nie ambitnie — passa liczy się tygodniami, a cel podniesiesz jednym tapem."
**E5 · WYNIK (outcome-first):** karta sugerowanego programu — nazwa, „plan od trenera", meta (dni/tydz. · typ), 3 pierwsze ćwiczenia, ew. nota fallbacku → **primary „Aktywuj plan"** → mikro-potwierdzenie „✓ Plan gotowy — czeka na ekranie głównym" (0,8 s) → home z hero „Dziś · Dzień A" gotowym na Start. Secondary: „Inny program" (biblioteka) · „Zobacz cały plan".
> Świadomie NIE „Aktywuj i zacznij Dzień A": instalacja rzadko dzieje się na siłowni — auto-wrzucenie do loggera z kanapy byłoby fałszywym startem. Hero na home czeka z jednym tapem, a **home wariant A z redesign-home §3.6 obsługuje tylko ścieżkę skipa** (sugestia bez aktywacji).

**Rama:** progress-kropki (5) + strzałka wstecz od E1 (O4) · każdy krok skipowalny, skip całości → home wariant B · sand + ink/stone (O5) · `prefers-reduced-motion` · eventy: `onboarding_completed {level, env, suggested_program_accepted}` po E5, `onboarding_skipped {step}` przy każdym skipie (O6; wire = Faza 1).

## 3. Przyszłe wejścia (projektujemy furtki, nie budujemy)

- **Krok 2 (konta):** signup wchodzi PRZED E0 (konto → onboarding); flaga przenosi się z localStorage do `user_settings.onboarded_v3` (multi-urządzenie!) — dopisać do checklisty bramki.
- **Krok 4 (ekipa-invite):** wejście z zaproszenia = wariant E0: „**Radek Cię zaprosił** — 60 sekund i trenujecie razem" + po E5 auto-join poda. Najważniejszy onboarding w całej pętli wzrostu — furtka: E0 przyjmuje opcjonalny kontekst zaproszenia.
- **Reverse trial (Krok 3):** timeline triala (wnioski-Mobbin P2) NIE wchodzi do onboardingu v3 (pre-launch bez paywalla); przy Kroku 3 dostanie własny ekran po E5.

## 4. Wdrożenie i test

Refaktor `WelcomeOverlay` v2→v3 (flaga `arco-onboarded-v3`): **~1–1,5 wieczora** (E0 nowy — Gambarino już wdrożone; E1 odchudzenie; E4 defaulty; E5 rozbudowa karty + mikro-potwierdzenie; kropki/wstecz; stone na sand). Test: H2 **Z1** przechodzi przez ten flow (skrypt gotowy — notuje krok skipa, Z1a łapie pierwsze wrażenie po); dogfooding: świeże konto testowe przed sesjami. Miary po instrumentacji: completed-rate, rozkład `skipped{step}`, % akceptacji sugestii.
