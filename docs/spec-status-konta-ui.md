# Spec UI: status konta (free/Coach) i ekran `/coach`

> **Data:** 2026-07-16 · **Status:** zaakceptowane [Ty], etap po H2 · **Podstawa:**
> `audyt-paywalla-2026-07.md`, `wizja-i-strategia-v3.md`, wnioski Mobbin
> (`inspiracje/wnioski-dla-arco.md` P1–P5) i benchmarki z §4.
> **Decyzja w jednym zdaniu:** status planu żyje wyłącznie w Ustawieniach jako karta „Twój plan" (wzorzec Strava/Superlist); tap prowadzi na jeden ekran `/coach`, który zależnie od stanu konta jest ofertą, timeline'em triala albo zarządzaniem subskrypcją. Chrome home zostaje czysty.

## 1. Karta „Twój plan" — pierwsza sekcja profilu/ustawień

Jeden komponent na górze ekranu profilu (po R2: wejście przez awatar; do tego czasu — nad sekcją „Imię" w obecnych Ustawieniach), renderowany według stanu konta:

| Stan | Treść karty | Tap → `/coach` w wariancie |
|---|---|---|
| Trial (d0–21) | „Arco Coach — wersja pełna · zostało N dni" | timeline triala |
| Free | „Plan Darmowy — pełny dziennik, bez limitu czasu" + zużycie limitów (patrz niżej) | oferta |
| Coach | „Arco Coach · roczny — odnawia się {data} · Dziękujemy, że wspierasz Arco" | zarządzanie |
| Coach anulowany-ale-aktywny | jak Coach + „aktywny do {data}" | zarządzanie |

Zasady:
- **Nazwa planu darmowego: „Plan Darmowy"** [decyzja Ty] — darmowość to argument, nie wstyd; copy prowadzi od kompletności („pełny dziennik"), nigdy od braków (Z1, kontra do konkurencji).
- **Zużycie limitów** („Programy 1/2 · Własne ćwiczenia 3/10") — wzorzec Superlist: transparentne granice zanim zabolą, cicha świadomość Coach bez banera. **Pokazujemy dopiero, gdy user stworzył ≥1 własny program lub ćwiczenie** [decyzja Ty] — „0/2 na dzień dobry" to szum.
- Karta Coach mówi wdzięcznością (wzorzec Crouton), nie badge'em statusu.

## 2. Ekran `/coach` — jeden ekran, trzy stany

Nie budujemy osobno paywalla i osobno „manage subscription".

- **Oferta (free):** packaging D z audytu — jedna obietnica („Utknąłeś? Coach mówi dlaczego i co dalej"), yearly-first 99 zł/rok („8,25 zł/mies.") z miesięczną jako opcją (max 2 opcje, P4), „bez karty na start, anuluj kiedy chcesz" (P3), tabela porównawcza free/Coach niżej. **Wszystkie momenty konwersji (kłódka historii, limit programów, teaser stagnacji, CTA z karty) otwierają ten sam ekran** — jedna powierzchnia do testów P7 (PostHog flags).
- **Trial:** oś czasu P2 („dziś pełna wersja → d18 przypomnienie → d22 zostaje darmowy rdzeń, nic nie znika") + sekcja „co Coach już dla Ciebie zrobił" (jeśli guidance-full cokolwiek powiedział — pokazać; adresuje główną słabość: trial kończy się zanim produkt się wykaże).
- **Zarządzanie (Coach):** zmiana planu (w tym upsell monthly→yearly, wzorzec Co-Star — druga fala LTV), faktury, **anulowanie widoczne od razu** — Ustawienia → `/coach` → anuluj = 2 tapy (zasada z wniosków Mobbin).

## 3. Czego świadomie NIE robimy

- **Zero statusu planu w chrome home** (badge, obwódka, monogram). Codzienny znacznik „Free" = ciche łamanie rekomendacji E (upsell momentem, nie personą) i spokoju UI. Jedyny wyjątek: tymczasowy pasek w ostatnich dniach triala (d18+), znikający po tapnięciu.
- Żadnego przyklejonego cennika w Ustawieniach dla wszystkich (anty-wzorzec Mammoth), odliczań, fake urgency (ToV).
- „Coach" jako plakietka tożsamościowa w UI — kosmetyka premium (motywy Warm, ikony — rekomendacja H audytu) to perk, nie odznaka.

## 4. Benchmarki (Mobbin, 2026-07-16)

- Strava — wiersz w Settings i podwójne przeznaczenie: [Settings](https://mobbin.com/screens/78bae462-3c75-45cd-9e5e-a55c34531a78) · [ekran subskrybenta](https://mobbin.com/screens/062cc370-99b4-49d8-b79e-0b363eacd381) · [stan triala z datą](https://mobbin.com/screens/8c8f9cd7-6b06-4b6f-8008-9b0f372419d3)
- [Superlist — karta planu ze zużyciem limitów](https://mobbin.com/screens/0b0db02e-55b2-4e31-a113-2c2b931af542)
- [Flighty — spokojny „Current Plan"](https://mobbin.com/screens/2e31df5c-94cd-4335-b567-5168c69a001a) · [Crouton — wdzięczność zamiast badge'a](https://mobbin.com/screens/36d27a78-6c28-4648-8d3a-d6900afdcf3c)
- [Co-Star — upsell monthly→annual u subskrybenta](https://mobbin.com/screens/4e34073e-20df-46c8-bd3d-a483614a16f8) · [Hevy — Manage Subscription](https://mobbin.com/screens/0b5bea12-f9ce-47dd-8594-b0d362aee43c) · [Hevy — paywall (kotwica konkurencyjna)](https://mobbin.com/screens/63d360d1-fe60-4834-b349-832dab2a7d56)
- Anty-wzorzec: [Mammoth — cennik przyklejony w ustawieniach](https://mobbin.com/screens/cb236da8-ca17-4391-899c-be2697ba95db)

## 5. Sekwencja wdrożenia (zaktualizowana po planie R0–R7, 2026-07-16)

Profil/ustawienia przez awatar wchodzą w **R2** programu R0–R7 (`plan-sprintow-2026-07.md`) — karta „Twój plan" celuje **od razu w ekran profilu** (typ `focus`, F9 z userflows), bez etapu przejściowego w obecnym SettingsForm. Zgodnie z regułą backlogu (§9 planu) nic z tego specu nie wchodzi przed H2:

1. **R2 (tylko rezerwa miejsca, zero kodu monetyzacji):** projektując layout profilu, zostawić slot na kartę planu na górze — żeby po H2 nie przebudowywać ekranu.
2. **Po H2 → „Pomiar i cichy launch":** karta stanu free + statyczny `/coach` z listą oczekujących, potem pełne stany trial/Coach, Stripe, zarządzanie i instrumentacja. Bramka kont+RODO z `roadmap.md` pozostaje prerekwizytem płatności.
