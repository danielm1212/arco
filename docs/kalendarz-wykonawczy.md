# Kalendarz wykonawczy — sekwencja z buforem (2026-07 → 2027)

> **Data:** 2026-07-08 · **Powód:** wycena z audytu (~13–20 tyg. nowej pracy) wisiała bez kalendarza — a „wykonalność solo" była oceniona 6,5/10 właśnie za brak dat i buforu. Ten plik przelicza Kroki wizji na miesiące w DWÓCH scenariuszach budżetu czasu i daje reguły na poślizg. Aktualizuj przy każdym większym odchyleniu — kalendarz kłamiący jest gorszy niż żaden.
> **Założenie bazowe [Ty — potwierdź]:** scenariusz R (realny) = **~10 h/tydz.**; scenariusz A (ambitny) = **~15 h/tydz.** Wszystkie daty niżej mają już wliczony **bufor +20%** (życie, praca, choroby, „szybkie poprawki").

---

## 1. Oś czasu

| Blok | Zakres | Scenariusz R (10 h) | Scenariusz A (15 h) |
|---|---|---|---|
| **Krok 0** — domknięcie H1 (S9-cz.2 higiena → S10 offline → S11 launch gate) | wg planu sprintów | **lip–poł. wrz 2026** (~8–9 tyg.) | lip–sie 2026 (~6 tyg.) |
| **Równolegle:** landing + K1 content start + prep H2 (pilot, dane demo, P0/P1) | landing-plan, scenariusz-h2 | sie 2026 | lip–sie 2026 |
| **H2** — sesje 3–5 osób + rozstrzygnięcie B1 | scenariusz-h2 | **poł. wrz 2026** (2 tyg. z analizą) | wrz 2026 |
| **Krok 2** — konta+RODO+Stripe (4–7 tyg. wyceny) | audyt §5, schemat | **paź–poł. lis 2026** | wrz–paź 2026 |
| **Równolegle:** concierge-test podów (3 tyg. + wnioski) | concierge-test-podow | paź 2026 | wrz–paź 2026 |
| **Krok 3** — freemium live (3–5 tyg.) | audyt §5 | **poł. lis–poł. gru 2026** | paź–lis 2026 |
| **🚀 LAUNCH cichy** (lista → społeczności) | wizja Krok 3 | **poł. gru 2026 / sty 2027*** | pocz. gru 2026 |
| **Krok 4** — pody (6–8 tyg.; JEŚLI concierge 🟢/🟡) | audyt §5, schemat §4 | **sty–lut 2027** | gru 2026–sty 2027 |
| **B2** (fala 1, 3 mies. od launchu) | wizja §7 | **~mar–kwi 2027** | ~mar 2027 |
| **B3** (pętla podów, 3 mies. od startu podów) | wizja §7 | **~mai 2027** | ~kwi 2027 |
| **B4** (próg sensu, 9–12 mies. od launchu) | wizja §7 | **~wrz–gru 2027** | ~wrz 2027 |

\* **Decyzja launchowa [Ty]:** poł. grudnia to sezonowy dołek (święta), ale **sty 1–15 to najlepsze okno roku w fitness** (postanowienia). Rekomendacja: jeśli Krok 3 domyka się w grudniu — soft-launch do listy w grudniu (test rur), **publiczne pchnięcie 2–8 stycznia 2027**. Poślizg Kroku 3 o 2 tyg. jest wtedy… korzystny. Nie planuj launchu na listopad kosztem jakości — styczniowe okno wybacza poślizg, ale nie wybacza zgubionej serii (S10!).

## 2. Reguły poślizgu (żeby kalendarz przeżył kontakt z rzeczywistością)

1. **Poślizg <2 tyg.:** nic nie robisz, od tego jest bufor.
2. **Poślizg 2–4 tyg. w bloku:** tniesz ZAKRES bloku, nie jakość rdzenia — gotowe cięcia: Krok 2 → odłóż OAuth Google (email+hasło wystarczy na start); Krok 3 → odłóż ochronę passy i ekran trial-countdown (kłódka + limity to minimum sensowne); Krok 4 → wersja 🟡 z concierge (np. bez push — skrzynka+e-mail na start; push jako fast-follow).
3. **Poślizg >4 tyg. łącznie:** przesuwasz launch na następne okno (styczeń → ew. marzec „wiosenna forma"), NIE kompresujesz S10/testów. Zasada z wizji: płacący user nie wybacza zgubionej serii.
4. **Nigdy nie tnij:** S10 (offline correctness), audytu RLS przy Kroku 2/4, double opt-in, testów wielokontowych podów.

## 3. Budżet tygodniowy po launchu (przypomnienie z planu dystrybucji)

Od launchu stały split: **≥20% dystrybucja** (K1 artykuły + K3 społeczności + przegląd metryk), ~60% produkt (Krok 4, iteracje z feedbacku), ~20% operacje (support, dunning, sprzątanie). Kalendarz Kroku 4 w tabeli już to uwzględnia.

## 4. Co może wywrócić kalendarz (nazwane wprost)

- **Konsultacja prawna (Krok 2)** — lead time kancelarii bywa 2–4 tyg.; umów w SIERPNIU, dokumenty i tak przyjdą robić się same.
- **Stripe activation + weryfikacja działalności** — załatw konto i weryfikację w Kroku 2 od pierwszego dnia, nie „jak będzie checkout".
- **Czerwone B1 w H2** — wraca packaging wartości przed Krokiem 2 (tak mówi bramka): +3–4 tyg. Kalendarz to przeżyje (launch dalej łapie styczeń w scenariuszu A / marzec w R).
- **Motywacja foundera** — najcięższy blok to Krok 2 (prawo+płatności = zero dopaminy). Plan: przeplatać z landingiem/contentem (widoczny postęp) i traktować concierge-test jako „deser" w środku.
