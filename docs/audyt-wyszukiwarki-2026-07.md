# Audyt wyszukiwarki ćwiczeń (2026-07-16)

> **Zlecenie [Ty]:** audyt działania wyszukiwarki + rekomendacje. **Metoda:** analiza kodu (`ExerciseBrowser.tsx`, `lib/exerciseFilters.ts`, seed 907 ćwiczeń) — wspólny komponent dla dodawania (picker) i podmiany (swap). **Kontekst:** H2 Z2 testuje picker na żywych uczestnikach.

## 1. Jak działa dziś (stan faktyczny)

Wyszukiwanie: `ilike '%query%'` po **wyłącznie kolumnie `name`**, od 2 znaków, debounce 200 ms, limit 30, sort **alfabetyczny**. Filtry-chipy (partia / sprzęt / wzorzec, PL, z sensownym grupowaniem mięśni) składają się z query przez AND. Bez query+filtrów: „Ostatnio używane" (8, dedupe) w pickerze, rankowani kandydaci w swapie. Browse po chipach ukrywa `hidden` (kuracja S8), **search po nazwie znajduje wszystko** (świadome). Pusty wynik → CTA „Dodaj własne ćwiczenie („{query}")" z pre-fill. Multi-select ze sticky CTA, ⓘ podgląd i 📈 progres per wiersz, lazy images, targety 44 px, `aria-pressed` na chipach, race-guard na zapytaniach.

**Werdykt mechaniki: solidna.** Debounce, race-guard, recent, multi, kuracja, eskalacja custom-CTA — to jest dobrze złożony komponent. Problem leży warstwę niżej.

## 2. Znalezisko główne (P0): wyszukiwarka mówi po angielsku w polskiej apce

**Wszystkie 907 nazw ćwiczeń jest po angielsku** („Bench Press", „Ab Crunch Machine" — free-exercise-db), a search działa tylko po `name`. Konsekwencje:

1. **Kasia wpisuje „wyciskanie" → zero wyników.** Jej pierwszy kontakt z wyszukiwarką = porażka; nie zna „bench press", bo jest personą, która „nie wie, od czego zacząć".
2. **Gorzej: pusty stan AKTYWNIE zachęca do błędu** — „Nie ma ćwiczenia «wyciskanie». Możesz dodać je z własnym opisem" → user tworzy **duplikat** Bench Pressa po polsku, z pustą historią, poza guidance i mapowaniem mięśni. Feature pomyślany jako ratunek produkuje śmieci w danych.
3. PL instrukcje już częściowo są (`exercise-instructions-pl.json`), ale **nazwy nie** — „PL tłumaczenia" wiszą w S11 jako ogólny task; ten audyt podbija je do rangi blokera sensowności search.
4. Ryzyko dla H2: Z2 testuje picker — pierwszy uczestnik, który wpisze polską nazwę, „przetestuje" nam pustkę.

## 3. Pozostałe znaleziska

| # | Problem | Waga |
|---|---|---|
| W2 | **Sort alfabetyczny zamiast trafności** — szukając „row" dostajesz kolejność A–Z z 30-elementowym limitem; prefix-match („Row…") może przegrać z „Barbell Row" i odpaść za limitem przy szerokich frazach | P1 |
| W3 | **Zero aliasów/slangu** — „martwy", „OHP", „wiosłowanie", „rumuński", „ławka" to realne pierwsze frazy bywalców siłowni; żadna nie trafi | P1 (spina się z P0) |
| W4 | **Brak unaccent** — nieistotne przy EN nazwach, krytyczne PO tłumaczeniu: „ławka" wpisana jako „lawka" nie znajdzie nic (ilike jest case-, nie accent-insensitive) | P2 (warunkowe na R1) |
| W5 | **Brak instrumentacji search** — nie wiemy, czego ludzie szukają i NIE znajdują; a to najtańsze źródło słownika aliasów i priorytetów tłumaczeń | P2 |
| W6 | `%`/`_` w query nieescapowane w ilike (wpisanie „100%" psuje wzorzec) | P3 |
| W7 | „Szukam…" jako goły tekst — reszta apki ma skeletony (S14); kosmetyka spójności | P3 |

**Co świadomie zostaje bez zmian:** search znajdujący `hidden` (kuracja dotyczy browse) · limit 30 · debounce 200 ms · recent-8 · wydajność (ilike na 907 wierszach nie potrzebuje indeksu; pg_trgm rozważać dopiero przy fuzzy).

## 4. Rekomendacje (plan, priorytetem)

**R1 (P0, minimum PRZED H2): polskie nazwy jako `name_pl` + search po obu kolumnach.**
Kolumna `name_pl` (nullable) + `or(name.ilike, name_pl.ilike)`; wyświetlanie `name_pl ?? name`. Zakres etapowany: **top ~200 ćwiczeń najpierw** (ten sam priorytet co AI-zdjęcia — listy się pokrywają), reszta stopniowo. Tłumaczenia: Claude generuje hurtem → [Ty] przegląda słownik (terminologia siłowni, nie słownikowa: „uginanie ramion ze sztangą", nie „loki bicepsowe").

**R2 (P1, razem z R1): aliasy slangowe** — kolumna `search_aliases text[]` + `overlaps`/ilike po niej; startowy słownik ~50 najpopularniejszych fraz PL-siłownianych (martwy, rumuński, OHP, wiosłowanie, ławka skos, francuskie…). Tanie, a łapie realny język person.

**R3 (P1): ranking trafności zamiast alfabetu.** Quick win bez backendu: re-sort 30 wyników po stronie klienta — prefix match > początek słowa > substring; remis → alfabet. Docelowo (przy R4) RPC ze scoringiem.

**R4 (P2, po R1): unaccent** — znormalizowane kolumny (`name_norm`, `name_pl_norm`, aliasy norm.) wypełniane w seedzie + normalizacja query po stronie klienta; bez rozszerzeń DB, bez magii. „lawka" znajdzie „ławkę".

**R5 (P2): eventy** `exercise_search {len, results_count}` + `exercise_search_empty {query}` (wchodzi z instrumentacją wg jej faz i zgód) — puste frazy = automatyczna lista braków do aliasów/tłumaczeń.

**R6 (P3, przy okazji):** escape `%`/`_` · skeleton zamiast „Szukam…" · po R1 empty-state może odzyskać spokojne sumienie (CTA custom przestaje produkować duplikaty, bo PL frazy znajdują katalog).

**Kolejność wdrożenia:** R1+R2 jedną paczką (migracja + słownik + query — ~1–2 wieczory z przeglądem tłumaczeń [Ty]) → R3 (godzina) → R5 przy instrumentacji → R4/R6 przy okazji. **Bramka: R1+R2 przed sesjami H2** — inaczej Z2 przetestuje anglojęzyczną wyszukiwarkę na polskich uczestnikach i pogrzebie nam wnioski z całego modułu.

## 5. Ograniczenia

Audyt kodu, nie testów z ludźmi (H2 zweryfikuje); nie oceniałem jakości samego rankingu swapa (silnik podmiany — osobny temat, zadowalający wg wcześniejszych audytów); nie testowałem na urządzeniu (klawiatura/scroll listy w bottom sheet — pokryte świeżym sprintem sheetów).
