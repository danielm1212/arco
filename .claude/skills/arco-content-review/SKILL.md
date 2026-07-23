---
name: arco-content-review
description: Recenzja treści technicznej ćwiczeń w Arco (obraz + polska nazwa + instrukcja) pod kątem bezpieczeństwa i zgodności — zanim materiał trafi do widocznego planu. Użyj przy dodawaniu/zmianie zdjęć, instrukcji lub nazw ćwiczeń używanych w planach, przy review CONTENT-*, oraz gdy padnie „czy to ćwiczenie jest bezpieczne do pokazania?".
---

# Recenzja treści ćwiczeń Arco

Materiały techniczne NIE są zwykłym contentem — apka, która pokazuje złą technikę, uczy
kontuzji. Stawka to zdrowie użytkownika i odpowiedzialność, nie estetyka. Blizny: Barbell
Hip Thrust uczył ryzykownej pozycji na prodzie (2026-07); zdjęcia Chin-Up były niejednoznaczne
i trafiły na neutralny placeholder. Skill recenzuje treść ćwiczenia, nie kod.

**Źródło prawdy:** `docs/backlog-produktu.md §3` (Kontrakt jakości treści ćwiczeń) + realne
decyzje CONTENT-* w `docs/koordynacja-agentow.md`.

## Zakres

Ćwiczenia **widoczne w aktywnych planach** (zwłaszcza początkujących) i główne ruchy. Pełna
kuracja niewidocznej części bazy to osobny strumień po H2 — nie blokuje testu, jeśli nieużywane
rekordy są bezpiecznie ukryte.

## Postawa

Domyślnie wstrzymuj, nie publikuj. **W wątpliwości najsilniejszym ruchem jest placeholder**
(neutralny), nie „damy to zdjęcie, bo jest". Approve trzeba zasłużyć dowodem, nie wrażeniem.
Nie jesteś trenerem — jeśli technika jest niejednoznaczna, nie rozstrzygasz jej „na oko":
wstrzymujesz i eskalujesz do człowieka znającego technikę.

## Kontrakt (naruszenie = wstrzymanie materiału)

1. **Zgodność trójki.** Obraz, polska nazwa (`name_pl`) i instrukcja opisują DOKŁADNIE ten sam
   wariant. Rozjazd (np. zdjęcie Barbell przy instrukcji Dumbbell) = wstrzymanie.
2. **Brak techniki nie do obronienia przed trenerem.** Jeśli kadr pokazuje pozycję, której nie
   da się bronić jako bezpiecznej/neutralnej (podejrzana pozycja kręgosłupa, szyi, kolan;
   niejednoznaczny zakres ruchu, brak prześwitu/podchwytu tam, gdzie to istotne) — wstrzymaj do
   review trenera. Wątpliwość ≠ zielone.
3. **Instrukcja: start, klucz ruchu, bezpieczne zakończenie, zwięźle.** Początkujący dostaje
   krótką i bezpieczną instrukcję, nie esej. Brak fazy bezpieczeństwa = finding.
4. **Dwa statyczne obrazy jako niezawodny fallback.** Film/animacja tylko jako dodatek PO
   teście wartości i wydajności — nigdy jako jedyny nośnik techniki.
5. **Pochodzenie zapisane.** Źródło, licencja i data review przy materiale. Brak = finding.
6. **Materiał z AI wymaga review człowieka znającego technikę.** AI może przygotować propozycję
   i wykryć braki, ale NIE zatwierdza materiału technicznego. Zasada twarda (D-37).
7. **Wersjonowanie i integralność.** Zmiana treści podbija wersję; seed i migracja prowadzą do
   tego samego stanu (patrz `arco-migration`), historia i ID slotów zachowane, sloty programowe
   i parametry treningu bez przypadkowych zmian.

## Triggery — recenzuj na widok

- nowe/zmienione zdjęcie ćwiczenia używanego w planie
- zmiana instrukcji lub `name_pl` ćwiczenia widocznego w planie
- kandydat wygenerowany przez AI (obraz lub tekst) mający trafić do repo
- podmiana wariantu ćwiczenia w slocie systemowym

## Hierarchia decyzji (preferuj wcześniejsze)

1. **Placeholder neutralny** — gdy materiał jest niejednoznaczny lub ryzykowny. Bezpieczne,
   odwracalne, nie patroszy planu (dumbbell-first pokazuje placeholder, nie pustkę).
2. **Bezpieczny zamiennik wariantu** — jak Barbell Glute Bridge zamiast wstrzymanego Hip Thrust.
3. **Publikacja** — dopiero gdy trójka zgodna, technika obroniona, pochodzenie zapisane.
4. **Twarda blokada w browse/search/swap** — dla wariantu wycofanego, żeby nie wrócił bocznym
   wejściem (`content_blocked=true`).

## Wynik recenzji

Dla każdego materiału: **werdykt** (publikuj / placeholder / zamiennik / blokada) + **powód** +
**źródło i data review**. Zapis w dokumentacji CONTENT-* (i, jeśli zmienia backlog, do Linear —
tylko na prośbę właściciela). Wdrożenie zmian treści idzie przez `arco-migration` → `arco-release`.
