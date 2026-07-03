# Arco — plan sprintów 2026-07 (re-priorytetyzacja po audycie z Notion)

> Wynik przeglądu backlogu właściciela (Notion: „ARCO — Baza pomysłów”) skonfrontowanego z kodem (2026-07-02).
> **Ten plik nadpisuje KOLEJNOŚĆ sprintów** z `sprinty-szczegolowe.md` (S8–S11 bez zmian merytorycznych, przesunięte w czasie).
> Zakresy szczegółowe S6/S7/S8–S11 pozostają w `sprinty-szczegolowe.md` — tu tylko delta + nowe sprinty N1–N2.
> Statusy odhaczaj tutaj ORAZ w Notion (hub „🥇 ARCO — Hub”).

## Dlaczego zmiana kolejności (TL;DR)

1. Wake lock i sygnały końca przerwy **są w kodzie**, ale nie działają po HTTP w LAN (secure context). Właściciel zgłasza je jako bugi → realny fix to **wcześniejszy deploy na HTTPS**, nie kod.
2. W notatkach właściciela jest paczka drobnych UX-owek o wysokim stosunku wartość/koszt — warto je zamknąć jednym sprintem zamiast rozmywać.
3. Decyzja wizualna (Athletic volt vs „niebieski” kierunek z inspiracji) **blokuje tor assetów** (ikony 3D, landing) — trzeba ją wymusić terminem, nie zostawiać „na kiedyś”.

## Kolejność

| # | Sprint | Status |
|---|--------|--------|
| 1 | S6-dokończenie — custom ćwiczenie (wg `sprinty-szczegolowe.md` S6) | ✅ ZROBIONE (`dbc8391`) |
| 2 | **N1 — Deploy-lite (HTTPS)** — nowy, opis niżej | ⏳ **czeka na [Ty]: konta Supabase cloud + Vercel** |
| 3 | **N2 — Paczka UX z notatek właściciela** — nowy, opis niżej | ✅ ZROBIONE 1–6, 8–9 (`89d5725`…`3c83e7d`); #7 reorder = opc., nietknięty |
| 4 | **Decyzja wizualna** [Ty] + start toru assetów — opis niżej | 🔜 równolegle z N1/N2 |
| 5 | S7 — presety + onboarding (**+ rozszerzenie: imię**, patrz niżej) | ✅ ZROBIONE (`3066d19`; N1 wciąż przed S8+) |
| 6 | S8 → S9 → S10 → S11-domknięcie | bez zmian |

---

## Sprint N1 — Deploy-lite (HTTPS teraz, pełny launch później)

**Cel:** apka chodzi na HTTPS (Vercel + Supabase cloud), żeby odblokować wake lock, wibracje, instalację PWA i testy poza LAN. To NIE jest pełny Sprint 11 — launch gate (checklista longevity, self-host obrazków, PL tłumaczenia, app icon) zostaje w S11.

**[Ty]:**
- Konto Supabase cloud + Vercel; klucze do env prod (service-role tylko na serwerze).

**[Claude]:**
- `supabase link` → `db push` (wszystkie migracje) → seed + bootstrap usera z env prod.
- Vercel: import repo, env (`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` server-only, `ADMIN_EMAIL/PASSWORD`).
- Mini-gate bezpieczeństwa (podzbiór S10): service-role poza bundlem klienta, RLS włączone na wszystkich tabelach usera, świeży start danych.
- Obrazki: na razie zostaje hotlink (świadomie; self-host = S11).

**QA po deployu (zamyka wpisy z Notion):**
- [ ] Wake lock: ekran nie gaśnie podczas sesji na telefonie (HTTPS).
- [ ] Koniec przerwy: beep 3-2-1 + wibracja na Androidzie (iOS: brak wibracji — expected, sprawdzić czy beep wystarcza).
- [ ] Instalacja PWA + działanie offline.
- [ ] Wyszukiwarka ćwiczeń na realnych danych (limit 2 znaków, nazwy EN) — werdykt: bug czy UX do poprawy.

**Done:** apka na własnym URL HTTPS, wake lock + sygnały przerwy potwierdzone na telefonie, QA odhaczone w Notion.

---

## Sprint N2 — Paczka UX z notatek właściciela

> Źródło: notatki właściciela (Notion, Faza 1). Drobne, wysokie value/cost. Każdy punkt osobny commit + weryfikacja w Preview.

**[Claude]:**
1. ✅ (`89d5725`) **Pełna nazwa programu** — `break-words` zamiast `truncate`; zweryfikowane: żadna z 6 nazw nie ucięta.
2. ✅ (`f2b5e60`) **Podgląd ćwiczeń w programie** — widok preset pokazywał już dni+ćwiczenia; dodane ⓘ „jak wykonać" (ExerciseInfoSheet) na każdym ćwiczeniu.
3. ✅ (`cf87d88`) **Podgląd treningu bez sesji** — link „Zobacz ćwiczenia (bez startu) →" w hero + nazwa aktywnego programu jako link do read-only widoku.
4. ✅ (`3c83e7d`) **Bug ⓘ po podmianie** — hard-fix: `key={exerciseId}` na ExerciseInfoSheet (remount po swapie); zweryfikowane E2E (swap → sheet pokazuje nowe ćwiczenie).
5. ✅ (`3c83e7d`) **Swap przy nazwie** — trigger „⇄ Podmień" w nagłówku karty obok Pomiń/Usuń (SwapPanel kontrolowany), panel pod nagłówkiem.
6. ✅ **QA superserii** — E2E w Preview: łączenie (SS-badge na obu kartach) i rozłączanie czyste; nic się nie wysypało, zero zmian kodu.
7. ⏸ (opc.) **Reorder ćwiczeń w sesji** — nietknięty (świadomie; wróci przy S12 „sesja globalna" albo na życzenie).
8. ✅ **Guard porzucenia sesji** — audyt ścieżek: „Usuń sesję" ma confirm; „Zakończ" ma confirm przy niezaliczonych; wyjście „←" nie porzuca (sesja resumowalna z home „Wznów trening"). Anty-wzorca Hevy u nas nie ma — zero zmian kodu.
9. ✅ (`3c83e7d`) **Rest-timer nie blokuje edycji** — potwierdzone (bar to fixed bottom, tabela dostępna; edycja serii podczas odliczania działa) + fix: `pb-28` na main przy aktywnej przerwie, żeby bar nie zasłaniał dolnych wierszy.

**[Ty]:** szybki test na telefonie po każdej paczce; screeny do rzeczy, które nadal uwierają.

**Done:** punkty 1–6 zweryfikowane w Preview + na telefonie, wpisy w Notion na Done.

---

## Decyzja wizualna [Ty] — gate dla toru assetów

**Pytanie:** zostajemy przy „Arco Athletic” (dark + volt/lime + metalik z Horyzontu 3) czy skręcamy w kierunek z inspiracji właściciela (niebieskie kolory, duża/mała typografia, bardzo dynamiczny interfejs)?

- Architektura tokenów (primitive→semantic) robi **reskin kodu tanio** — ale **assetów AI (ikony 3D) tanio się nie przerobi**. Dlatego decyzja MUSI zapaść przed torem A assetów.
- Możliwa hybryda: zostaje dark+metalik, akcent do rozstrzygnięcia (volt vs blue) — wtedy tor ikon 3D (stal/srebro) jest bezpieczny niezależnie od akcentu.
- Po decyzji: [Claude] aktualizuje wartości tokenów (jeśli zmiana) + dopisuje werdykt do `CLAUDE.md` (sekcja „Kierunek wizualny”) i addendum v0.4.

**Done:** werdykt zapisany w `CLAUDE.md` + Notion; tor A assetów (prompty w `sprinty-szczegolowe.md`) odblokowany.

---

## S7 — rozszerzenie zakresu (delta do `sprinty-szczegolowe.md`)

Do istniejącego zakresu (presety PPL/UL + onboarding doświadczenie → sugestia planu) **dochodzi:**
- **Imię użytkownika** w onboardingu (`user_settings.display_name`) + powitanie na home („Cześć, {imię}”).
- Cel tygodniowy ustawiany w onboardingu (dziś default 2 w `user_settings` — dać wybór przy starcie, nie tylko w ustawieniach).

---

## Delta 2026-07-02 (wieczór) — pakiety z analizy Hevy

> Po analizie `docs/konkurencja-hevy-ux.md` (ekrany + warstwa funkcjonalna) dopisane: punkty 8–9 do N2 (wyżej) oraz **trzy nowe sprinty S12–S14** (zakresy w `sprinty-szczegolowe.md`):
> - **S12 — Sesja i rekordy:** sesja jako obiekt globalny (mini-bar „Trening w toku"), rep-PRs zasilające guidance, mikro-celebracja PR w sesji, edycja daty sesji.
> - **S13 — Postępy jako lustro + picker:** nagłówki-interpretacje nad wykresami, delta-karty, Muscle Split, tabela setów pod heatmapą; picker: Recent + multi-select + link do progresu.
> - **S14 — Empty states i pierwsze wrażenie:** każdy pusty ekran = obietnica wartości + następny krok; skeletony, stan offline.
>
> **Propozycja wpięcia [Ty zatwierdzasz]:** S12 i S13 po S7 (to rdzeń wyróżnika — guidance dostaje paliwo i widoczność, spójnie z regułą „guidance przed Horyzontem 5" z roadmapy), S14 przed S11/launchem (pierwsze wrażenie musi być gotowe na testy userów H2). Audyty S8–S10 mogą iść równolegle/po — decyzja przy planowaniu po S7.
> Wpisy dodane też do Notion „ARCO — Baza pomysłów" (Backlog, z odnośnikami do numerów matrycy).

## Poza kolejnością (przypomnienia)

- **Master prompty:** project prompt w Claude do odświeżenia (kickboxing porzucony, praca sprintami, 6 programów od trenera zamiast starej matrycy). Po decyzji wizualnej → `build-brief-v0.4-addendum.md`.
- **Bramka multi-user + RODO** (roadmap) — warunek dla udostępniania podopiecznym, publicznej bazy planów, socialu i monetyzacji. Nie zaczynać, ale nie podejmować decyzji architektonicznych, które ją utrudnią.
- **Tor assetów B** (AI-podratowanie zdjęć, licencja potwierdzona: Unlicense) — wchodzi przy self-hoscie obrazków (S11/H3).
