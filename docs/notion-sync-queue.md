# Kolejka sync do Notion (NA ŻĄDANIE od 2026-07-05 — patrz CLAUDE.md)

> Domyślny tryb (od 2026-07-05): dopisuj tu operacje ZAWSZE, niezależnie od dostępności Notion MCP.
> Wypychaj do Notion TYLKO gdy Daniel poprosi („zsynchronizuj Notion") — wtedy flush całej listy → usuń wykonane → pusta sekcja „Oczekujące".
> Tablica: „ARCO — Baza pomysłów" (data source `e037aac8-6857-46b7-80ef-95d011d1816e`).

## Format wpisu

```
- [ ] UPDATE | tytuł wpisu w bazie | Etap→Do testu [Ty] | Notatka: <hash> — co zrobione, co przetestować
- [ ] CREATE | tytuł nowego wpisu | Priorytet | Kto wykonuje | Etap | Faza | Kategoria | Notatka
```

## Oczekujące

(puste)

## Ostatni flush: 2026-07-12

Wykonane (7 CREATE; 8 wpisów kolejki zmapowanych na 7 kart — dwa wpisy o Onboardingu v3 scalone w jedną kartę, wg tej samej zasady co flush 2026-07-10):
- „Rename „pody"→„Ekipa" + koncepcja ekipy" (Refinement, Feature).
- „Kalibracja guidance na literaturze" (Refinement, Feature).
- „Onboarding v3: 6 ekranów... — WDROŻONY" (Do testu [Ty], UX/flow) — scalone z projektu-DO-AKCEPTACJI i wdrożenia w jedną kartę.
- „Audyt wizualny + mini-sprint „rymy" WYKONANY" (Do testu [Ty], UX/flow).
- „Landing ZBUDOWANY" (Do testu [Ty], Biznes/strategia).
- „Audyt UX loggera" (Do testu [Ty], UX/flow).
- „Redesign home: FlameWeek + hero + guidance-chip" (Do testu [Ty], UX/flow).
- Mapowanie „Kto wykonuje": Ty+Claude→Wspólnie, Claude→Claude Code (nazwy selectów w bazie). Kategoria: Produkt→Feature, UX→UX / flow, Marketing→Biznes / strategia (najbliższe istniejące selecty, schemat NIE ruszany).

## Ostatni flush: 2026-07-10

Wykonane (17 CREATE + 13 UPDATE; uwagi mapujące kolejkę na realny stan tablicy):
- Dwa wpisy kolejki o S9-cz.2 (plan + kompletny) → scalone w JEDEN wpis „S9-cz.2: higiena kodu — KOMPLETNY" (Do testu [Ty]).
- „Plan landinga" — bez CREATE: zaktualizowany istniejący „Landing page we Framerze" → In Progress, Wysoki (plan + copy + prototyp HTML od Claude).
- „Wizja v2" — bez CREATE: istniejący „Wypracować wizję…" (In Progress) zamknięty jako Done z notą kanonu.
- „Programy zaktualizowane" — bez CREATE: zaktualizowany istniejący „Dodać treningi A i B…" (wdrożone na prod).
- „Kuracja bazy" — bez CREATE: zaktualizowany istniejący „Kuracja bazy ćwiczeń…" Refinement → Do testu [Ty] (wdrożone na prod).
- Kategorie inżynieryjne zmapowane na istniejące selecty (schemat tablicy NIE ruszany — ALTER SELECT ryzykowałby opcje/kolory).
- **Porządki („usuń niepotrzebne")** — zamknięte jako Done z adnotacją-dlaczego (nic nie skasowano twardo): „Deploy na Vercel…" (N1 done + kolejne deploye działają) · „Styl stalowych ikon 3D" (metalik odrzucony → clay) · „Font Athletics" (kierunek Athletic porzucony) · „PWA vs natywne" (rozstrzygnięte w wizji v2) · „Podzielić pracę na user flows" (zastąpione Krokami 0–5) · „Model monetyzacji" (rozstrzygnięty w wizji v2, zostaje A/B pricingu) · „Aktualizacja master promptów" (skonsumowane organicznie przez CLAUDE.md).
- Re-priorytetyzacja wg wizji v2: „Tablica aktywności (nudge)" Niski→Wysoki (ekipy = silnik wzrostu) · „Udostępnianie treningów podopiecznym" Średni→Niski (trenerska odłożona).

## Ostatni flush: 2026-07-06

Wykonane operacje (uwagi mapujące kolejkę na realny stan tablicy):
- „Wypracować styl dużych stalowych ikon 3D" — notatka uzupełniona o paletę v2 (canvas neutralny #F7F7F7, akcent bez zmian #C63F21) + info o nocie NIEAKTUALNE przy torze assetów.
- Reskin Warm v2 — **bez CREATE**: wpis „Sprint N3: reskin Arco Warm" (Do testu [Ty]) już zawierał pełną notatkę v2; zamiast tego **duplikat** „Sprint N3 — Reskin…" (Backlog) zamknięty jako Done z adnotacją DUPLIKAT.
- 2 autorskie programy — **bez CREATE**: zaktualizowano istniejący wpis „Dodać treningi A i B po weryfikacji z trenerem" → Do testu [Ty] + notatka (e56a404).
- Strategia monetyzacji — **bez CREATE**: zaktualizowano istniejący wpis „Model monetyzacji: co premium i w jakiej cenie" → Refinement, Priorytet: Wysoki, pełna notatka (kanon `docs/monetyzacja.md`, R3 rozstrzygnięte: guidance-lite free / full paid, otwarte: pricing).
- Dodatkowe porządki: „Bramka: multi-user, konta i RODO" — notatka o prerekwizycie etapu 1 monetyzacji (R4); „Analiza konkurencji: Gymshark…" → Done; „Analiza Ladder" → Done; „Możliwość wyłączenia przerw" → Do testu [Ty] (zrobione w Sprint 1).
- FYI o zasadzie sync na-żądanie przekazane w rozmowie.
