# Optymalizacja aplikacji — zasady + przegląd stanu

> **Data:** 2026-07-08 · **Rebaseline:** 2026-07-20. Budżety pozostają obowiązujące.
> Oznaczenia S9–S14 w historycznym przeglądzie opisują moment wykonania, nie aktualną kolejność.
> Otwarte zadania rozstrzygają `backlog-produktu.md` i `plan-sprintow-2026-07.md`.

---

## 1. Budżety (twarde progi — mierzone na sprzęcie odniesienia, mobile)

| Metryka | Budżet | Gdzie krytyczne |
|---|---|---|
| LCP | < 2,5 s | home, logger |
| INP (tap serii!) | < 200 ms; **tap ✓ w loggerze < 100 ms odczuwalnie** | logger — to jest cała obietnica |
| CLS | < 0,1 | wszędzie (skeletony S14 pomagają) |
| JS initial per trasa | < 200 KB gz | home, logger |
| Obraz ćwiczenia | < 100 KB na widoku listy/detalu | picker, detal, „jak wykonać" |
| Zapytania DB per widok | ≤ 4 (równolegle), zero per-item w pętli | home, progress |
| Lighthouse perf (mobile) | ≥ 90 na home i loggerze | R5b, H2-F i przed PAY-1 |

Pomiar: Lighthouse (DevTools, tryb mobile + throttling) przy każdej bramce; **web vitals z pola przez PostHog** od Fazy 1 instrumentacji (wbudowane — zero dodatkowej roboty). Zasada: **najpierw zmierz, potem optymalizuj** — żadnych „wydaje mi się, że wolne".

## 2. Zasady twarde (każda zmiana od dziś)

1. **Nowa zależność = ocena wagi przed instalacją** (bundlephobia / `npm i --dry-run`): >30 KB gz wymaga uzasadnienia w PR; preferuj to, co już mamy (dotąd wzorowo: zero chart-libów, własny Sparkline, vendor 100 KB).
2. **Obrazy zawsze z `width`/`height` + `loading="lazy"`** (CLS + transfer); nowe obrazy własne (placeholder, ikony clay, przyszłe zdjęcia) — WebP/AVIF w rozmiarach docelowych, nie oryginały.
3. **Wąskie selecty:** `select("kolumna, kolumna")` — `select("*")` zakazane poza detalem pojedynczego rekordu (instructions/images to ciężkie kolumny!).
4. **Zero zapytań per-item:** listy = jeden batch (RPC/`in()`).
5. **Każda lista, która rośnie z czasem, ma paginację/limit od początku.**
6. **Optymistyczny UI dla akcji loggera:** tap nie czeka na sieć, outbox godzi później.
7. **Ciężkie i rzadkie = dynamic import** (heatmapa na /progress — kandydat; przyszłe: generator karty recap, wykresy premium).
8. **Indeks razem z zapytaniem:** nowe query po nowej kolumnie = indeks w tej samej migracji (wzorzec zachowany dotąd: 13 indeksów, gin na muscles ✓); przy ekipach obowiązkowo: `activity_events (user_id, occurred_on)`, `inbox_items (user_id, read_at)`.
9. **`force-dynamic` tylko dla danych użytkownika;** decyzję cache mierzymy, nie zakładamy.
10. **Regres budżetu = stop-the-line:** Lighthouse przy bramce spada poniżej progu → naprawa przed nową funkcją.

## 3. Przegląd stanu (2026-07-08, na repo)

### ✅ Dobre (utrzymać)
Lean deps (zero wykresów z paczek, 16 zależności, vendor 100 KB) · 13 indeksów DB z sensem (`sessions_user_date_idx`, gin na `primary_muscles`) · skeletony + `loading.tsx` (S14) · picker z limitem 30 i debounce 200 ms · `next/font` self-host (DM Sans) · Serwist precache + defaultCache · optymistyczny logger z outboxem · `force-dynamic` świadomie na stronach danych usera.

### ⚠️ Findings (priorytet · co · kiedy)
| P | Finding | Akcja | Etap |
|---|---|---|---|
| **P1** | **Obrazy ćwiczeń surowym `<img>` bez wymiarów** (CLS) | ✅ wymiary/lazy oraz self-hosted obrazy; dalsza kuracja jakości jest CONTENT-01–04 | ✅ |
| **P1** | **N+1 „poprzednio"** (RPC per ćwiczenie) + **brak paginacji historii** (pobiera wszystko — z latami danych umrze) | ✅ **S9-cz.2 (2026-07-10)**: `previous_session_sets_batch` (1 RPC, LATERAL) + historia 20/kursor `?before=` (kalendarz osobnym lekkim zapytaniem) | ✅ |
| **P2** | `select("*")` na `exercises` w `substitute.ts` (ciągnęło instructions+images niepotrzebnie) | ✅ **załatane 2026-07-08** — wąski select + `Pick<>`. Korekta przeglądu: `select("*")` na `session_sets` w session page zostaje — kolumny lekkie i wszystkie używane | ✅ |
| **P2** | `Logger.tsx` 768 / `progress` 474 linii — bundle trasy + re-rendery całości przy każdej serii | ✅ **S9-cz.2 (2026-07-10)**: Logger 768→249 (5 modułów), progress 474→~100; `memo` na `ExerciseCard`+`SetRow` (komparatory pomijają funkcje) — tap ✓ renderuje 1 kartę/1 wiersz, nie listę | ✅ |
| **P3** | Heatmapa (vendor) ładowana statycznie na /progress | ✅ **S9-cz.2 (2026-07-10)**: `MuscleHeatmapLazy` (`next/dynamic`, ssr:false, fallback trzyma wysokość) — First Load /progress 98,7 kB | ✅ |
| **P3** | Detal ćwiczenia `force-dynamic`? (dane seedowe — cache'owalne) | ✅ **sprawdzone i ODRZUCONE (S9-cz.2, 2026-07-10)**: RLS `exercises_select` wymaga `authenticated` (anon nie czyta seedu) → `unstable_cache` wymagałby nowej polityki anon-read albo service-role (zakaz poza scripts/, `bezpieczenstwo.md` §1); zysk = 1 indeksowany SELECT — nieproporcjonalny do nowej powierzchni. Re-ocena przy S11, jeśli self-host obrazków i tak wprowadzi anon-read | ✅ (odrzucone) |
| **P3** | Zero pomiaru z pola | web vitals po decyzji prawnej; monitoring OPS-02 przed płatną betą | otwarte po H2-F |

**Wniosek po rebaseline:** historyczne P1–P3 zostały w większości zamknięte. Dokument utrzymuje
budżety; nową pracę otwieramy dopiero po regresie, danych H2-F albo wymaganiu OPS-02/PAY-1.

## 4. Checklist wydajności (dołącza do checklisty UI z `wytyczne-designu.md` §3)

1. Nowa paczka? — waga sprawdzona, uzasadniona.
2. Obrazy z wymiarami, lazy, właściwy rozmiar źródła?
3. Selecty wąskie, zapytania batch, indeks jeśli nowe kryterium?
4. Lista rośnie z czasem? → limit/paginacja od razu.
5. Ciężki komponent używany rzadko? → dynamic import.
6. Tap/akcja częsta → optymistyczny UI, bez czekania na sieć.
7. Po zmianie na gorącej trasie (home/logger): szybki Lighthouse — budżety §1 trzymają?

## 5. Powiązania
`plan-sprintow-2026-07.md` · `instrumentacja-metryk.md` · `wytyczne-designu.md` ·
`backlog-produktu.md` (OPS-02 i CONTENT-01–04).
