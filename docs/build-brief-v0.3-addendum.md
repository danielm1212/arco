# Build Brief — Addendum v0.3 (do v0.2)

**Status:** uzupełnienie, nie zastąpienie. `build-brief-apka-treningowa-v0.2.md` zostaje źródłem prawdy dla schematu, programów i faz; ten plik **nadpisuje punktowo** decyzje, które zdezaktualizowały się w realnym użyciu i audytach.
**Data:** 2026-06-25. **Podstawa:** audyty (`usability-audit.md`, `product-audit.md`, `ux-audit-mobbin.md`) + realne sesje właściciela.

> Defekt systemowy v0.2: funkcje były specyfikowane **przez mechanizm**, nie przez **kontekst użycia** (kto / kiedy / po co). To źródło tarć poniżej.

---

## 1. Dziennik decyzji (descope / zmiany względem v0.2)

- **Plate calculator — USUNIĘTY** (commit `02fa08e`). Powód: apka jest dumbbell-first (programy FBW na hantle, akcesoria pod kickboxing). Kalkulator talerze-na-sztangę-na-stronę odpalał się dla hantli/goblet squata (bez sensu) i robił runaway przy błędnym kg (2222 → „25·25·…×44"). Usunięto `lib/plates.ts`, linię w Loggerze, ustawienia gryf/talerze.
  - Kolumny DB `user_settings.bar_weight` / `available_plates` zostają nieużywane (do zdjęcia migracją kiedyś).
  - **Gdyby wróciły programy ze sztangą:** przywrócić **warunkowo** — tylko `equipment === "barbell"`, notacja zwarta `25×N`, kontener z zawijaniem, limit wartości kg. Nigdy globalnie dla `type === "weighted"`.

## 2. Reguła nadrzędna: funkcje opisujemy przez „kto/kiedy", nie tylko „co"

Każda nowa funkcja w briefie musi odpowiadać: *dla kogo i w jakim momencie sesji*. Konsekwencje już teraz:
- **RPE** — pole opcjonalne, **domyślnie ukryte/zwinięte**, z krótką podpowiedzią („1–10, ile zostało w baku"). v0.2 zakładał, że user wie co to; właściciel nie wiedział. (audyt: product 1.3, usability §8)
- **Plate calc** — patrz §1 (warunkowo barbell albo brak).

## 3. Reguły przekrojowe (brakowało w v0.2)

- **Walidacja / limity inputów liczbowych.** Górne granice + sanity (ciężar, powt., czas). usability-audit §5 przewidział bug 99999/2222 — czyni z tego twardą regułę, nie „drobiazg".
- **Gęstość loggera / progressive disclosure.** Karta ćwiczenia ma zasadę: prymarne zawsze widoczne (seria, kg, powt., ✓, „poprzednio"), wtórne **zwijane** (hint progresji, instrukcje, opcjonalne pola). v0.2 mówił „styl Strong/BEASTLY", ale nie ustawił progu gęstości → elementy się nawarstwiły. (usability §8, product 1.3)

## 4. Repriorytetyzacja (z „nice-to-have" → pierwsza klasa)

Konkurencja ma, audyty potwierdzają, a my mamy pod to **dane i pozycjonowanie**:
- **Heatmapa partii na sylwetce** (jak Fitbod) — mamy `sets-per-muscle`; v0.2 dał tylko tekstowy „bilans serii na partię" (sekcja 8). To premium-wyróżnik, nie ozdoba. (ux-mobbin §3, product C/1.6)
- **Pętla retencji** (kalendarz + streak + „dziś dzień A/B") — v0.2 nie miał **żadnej** sekcji o „wracasz jutro"; sekcja 8 to analityka. Streak + sugestia dnia już są — domknąć kalendarzem/passą. (product 1.6)
- **„Last set" inline per WIERSZ** (Strong/Hevy: „60×8 →", tap = kopiuj) — v0.2 napisał „inline poprzedni wynik", ale interpretacja wyszła słaba (placeholder per ćwiczenie). Doprecyzowanie: wartość per seria, klikalna.

## 5. Decyzje v0.2, które ZOSTAJĄ (świadomie dobre)

- **Manualny silnik podmiany jako anty-Fitbod** (sekcja 4) — wyróżnik, nie brak. Bez AI narzucającego zmiany.
- **Out of scope** (sekcja 11): social, AI auto-programming, makro, wearables, natyw, monetyzacja — trzymamy.
- **Schema multi-user / RLS od dnia 1** — świadomy koszt pod white-label, zostaje.

## 6. Uwaga o aktualności audytów

`product-audit.md` i „Phase 5–10" oraz P1–P5 z `ux-audit-mobbin.md` powstały **przed** realizacją: bottom-nav, streak, „sugerowane dziś", live pasek sesji, nagłówki kolumn, notatki, przełącznik okresu, zakładki metryk, onboarding — **to już zrobione**. Plus pre-deploy P0/P1 (zoom, dark mode, focus-visible, confirm finish, undo-toast) i redesign „Athletic" (foundation + Home + huby). Czytaj te audyty jako mapę sprzed kilku iteracji, nie listę bieżących braków — aktualny stan trzyma `HANDOFF.md`.

---

## Kolejne kierunki (wynikające z tego addendum)
1. **Dark logger (focus mode)** + odchudzenie gęstości karty (progressive disclosure) — patrz pamięć/HANDOFF.
2. **Walidacja inputów** jako reguła globalna.
3. **Heatmapa-sylwetka** (mamy dane) i **kalendarz/streak** — wyróżniki retencyjne.
4. **„Last set" per wiersz** w loggerze.
