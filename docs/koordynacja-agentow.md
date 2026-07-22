# Arco — koordynacja agentów

**Aktualizacja:** 2026-07-22
**Rola:** aktywne rezerwacje i krótki log operacyjny. Historia pełna jest w Git.

## Zasady

1. Przed pracą przeczytaj `CLAUDE.md`, `HANDOFF.md`, aktywny sprint i
   `standard-zadania-agentow.md`.
2. Zarezerwuj tylko konkretny obszar/pliki. Rezerwacja bez aktualizacji przez 24 h wygasa.
3. Nie edytuj plików z aktywnej rezerwacji innego agenta bez uzgodnienia.
4. Migracja wymaga osobnej rezerwacji, unikalnego timestampu, RLS i smoke'a.
5. Każdy wpis końcowy podaje: zakres, commit/stan, testy, produkcję i następny krok.
6. Log przechowuje maksymalnie 10 ostatnich wpisów. Starsze usuwa się przy rebaseline; są w Git.
7. Ten plik nie jest backlogiem. Nowe pomysły trafiają do `backlog-produktu.md`.

## Aktywne rezerwacje

| Agent | Zadanie | Obszar | Od | Stan |
|---|---|---|---|---|
| — | — | — | — | brak aktywnych rezerwacji |

## Ostatnie wpisy

### 2026-07-22 · Codex · TRUST-03 i refinement CONTENT-01B

- **Zakres:** wspólny `BottomSheet`, realna regresja Chromium, plan/backlog/handoff, review
  Hip Thrust i standard rekomendowania modelu przed zadaniem.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/q1-trust-03`; inline `onOpenChange` nie
  restartuje scroll-locka, a zamknięcie przywraca dokładną pozycję i fokus. CONTENT-01B
  obejmuje finalną parę Barbell oraz pary Dumbbell/Single-Leg.
- **Dowód:** test przed poprawką odtwarzał `scrollY 1050 → 0` dla wszystkich ścieżek;
  po poprawce X, overlay, Escape, swipe i akcja przechodzą na 320/375/393 px, również po
  re-renderze otwartego sheeta, z aktywną blokadą tła i fokusem na triggerze.
- **Testy:** czyste `npm ci` (0 podatności), lint, 102/102 unit, build, walidator
  907 ćwiczeń/15 programów/307 slotów, rekomendacje 60/60 i overflow 21/21.
- **Czego nie dotknięto:** produkcji, migracji, danych, logiki treningu i assetów ćwiczeń.
- **Zaległości:** [Ty] kontrolowany release migracji Q1, następnie checkpoint iPhone
  PWA/Safari i merge po zielonym CI; potem CONTENT-01B i CORE-0.

### 2026-07-22 · Codex · SEC-02 sharp advisory

- **Zakres:** wymuszenie załatanej wersji `sharp` 0.35.3 w zależnościach produkcyjnych,
  odświeżenie lockfile oraz regresja builda i optymalizatora obrazów na gałęzi PR #4.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE**; jedna wersja `sharp` 0.35.3 korzysta z libvips
  8.18.3, a `npm audit --omit=dev` raportuje 0 podatności. Produkcja nietknięta.
- **Testy:** czyste `npm ci`, 102/102 unit, lint, build, walidator 907 ćwiczeń/15 programów/
  307 slotów, rekomendacje 60/60, overflow 5/5 i runtime smoke `/_next/image` 200 z
  faktycznym przeskalowaniem PNG 192×192 → 128×128.
- **Czego nie dotknięto:** migracji, danych użytkowników, logiki treści CONTENT-02 ani produkcji.
- **Zaległości:** zielony CI PR #4, merge [Ty], następnie kontrolowany release migracji Q1.

### 2026-07-22 · Codex · CONTENT-02 Chin-Up

- **Zakres:** wersjonowany review Chin-Up, dopracowana instrukcja PL, wycofanie dwóch
  niejednoznacznych zdjęć do placeholdera, regresja seeda, punktowa migracja i dokumentacja Q1.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/q1-content-02`; pięć slotów programowych,
  historia i parametry treningu pozostają bez zmian. Produkcja nietknięta.
- **Dowód:** źródła ACE i trzy publikacje badawcze; oba tylne kadry odrzucone, ponieważ nie
  potwierdzają jednoznacznie pełnego podchwytu ani prześwitu i neutralnej szyi na górze.
- **Testy:** świeży `db reset`, migracja na zasymulowanym starym rekordzie, seed 2×,
  102/102 unit, lint, build, 15 programów/307 slotów, rekomendacje 60/60, overflow 5/5 oraz
  smoke Phase 1/2, offline i Ekipa.
- **Czego nie dotknięto:** produkcji, slotów programowych, historii użytkowników ani nowych
  plików mediów. Lokalne konta i rekordy smoke zostały posprzątane przez skrypty.
- **Następny krok:** PR #4 jest otwarty; po zielonym CI [Ty] scalić go i wykonać
  kontrolowany release. Następnie CONTENT-01B albo CONTENT-03a.

### 2026-07-21 · Codex · CONTENT-01A Hip Thrust containment

- **Zakres:** wersjonowany review trzech wariantów Hip Thrust; twarda blokada starego
  Barbell w browse/search/swap; bezpieczny Barbell Glute Bridge w trzech slotach systemowych;
  instrukcje PL, seed, punktowy sync i dokumentacja programów.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/q1-content-01`; migracja
  `20260721233618_content01a_hip_thrust_containment.sql` zachowuje historię i ID slotów.
- **Review mediów:** stare kadry Barbell odrzucone; kandydat AI pozycji końcowej także
  odrzucony i nie trafił do repo. Dumbbell/Single-Leg pozostają na neutralnym placeholderze
  do osobnego `CONTENT-01B`.
- **Testy:** świeży `db reset`, seed 2×, migracja na odtworzonym starym stanie
  (`content_blocked=true`, 0 starych i 3 nowe sloty), 99/99 unit, lint, build, walidatory
  15 programów i 60/60 rekomendacji, overflow 5/5 oraz smoke Phase 1/2.
- **Produkcja:** nietknięta. Lokalny test wymagał jednorazowego `127.0.0.1`, ponieważ
  `.env.local` wskazuje nieaktualny adres LAN `192.168.100.16`.
- **Następny krok:** mały PR CONTENT-01A; [Ty] kontrolowany release migracji po CI; potem
  CONTENT-01B albo równoległy review CONTENT-02.

### 2026-07-21 · Codex · TRAIN-01 P11/P12/P14

- **Zakres:** pilna korekta kolejności i objętości P11/P12 oraz przywrócenie hinge/hamstrings
  w P14, bez wciągania recepty v2 i pozostałego PLAN-Q.
- **Stan:** gotowe lokalnie na `agent/q1-train-01`; seed i dwie karty planów zaktualizowane,
  wersje treści podbite, produkcja nietknięta.
- **Migracja:** `20260721223000_train01_program_safety_patch.sql` zachowuje ID niezmienionych
  slotów, odpina wycofane sloty przez istniejące `ON DELETE SET NULL` i zatrzymuje się przy
  otwartej sesji P11/P12/P14.
- **Testy:** migracja przeszła w transakcji z rollbackiem i na lokalnej bazie; seed 2× zachował
  aktywne programy i 307 slotów. Zielone: lint, build, 94/94 unit, 60/60 rekomendacji,
  walidator treści, smoke Phase 1/2 i 5/5 testów przeglądarkowych.
- **Znane ograniczenie środowiska:** lokalna kopia `restore_prod_s11` nie zawiera tabel
  `public`, więc nie mogła służyć jako drugi dowód migracji; test wykonano na wypełnionej
  lokalnej bazie. Pełny CI Supabase pozostaje bramką PR.
- **Następny krok:** review diffu i mały commit TRAIN-01; po scaleniu bazowego PR #1 otworzyć
  osobny PR, przejść CI i zastosować migrację dopiero po audycie otwartych sesji.

### 2026-07-21 · Codex · PLAN-Q i zatwierdzenie 15 programów

- **Zakres:** ponowna ocena 15 programów i 48 dni, zatwierdzenie docelowych recept P01–P15,
  domknięcie kontraktu danych/kompatybilności, TRAIN-01–07 i włączenie PLAN-Q po R4A.
- **Stan:** spec, plan, backlog, decyzje i HANDOFF zaktualizowane; kod, baza i produkcja nietknięte.
- **Decyzja:** obecne 15 programów i wykonalność per slot są bramką przed H2; nowe programy,
  rozgrzewka oraz Minimum/Standard/Plus czekają na dane po H2. Audyt Codex zatwierdza recepty;
  zewnętrzny trener może wrócić po monetyzacji i nie blokuje Done/H2.
- **Dowód:** `audyt-biblioteki-programow-2026-07.md`; 4 recepty bez zmian programowych,
  11 zatwierdzonych po dokładnie rozpisanych korektach; wspólne warunki 15/15.
- **Testy:** `git diff --check`, kontrola odwołań i `npm run validate:training` — zielone;
  walidator potwierdza 15 programów/308 slotów i raportuje 16 placeholderów w 49 slotach.
- **Linear:** issues PLAN-Q wymagają ręcznego utworzenia, ponieważ w tej sesji brak połączenia Linear.
- **Następny krok:** Q1/ TRAIN-01, następnie CORE-0 → R4A → PLAN-Q według specyfikacji.

### 2026-07-21 · Codex · audyt core i refinement sprintu

- **Zakres:** audyt integralności danych, offline, rekomendacji programu i guidance względem
  implementacji oraz literatury; włączenie CORE-0 i CORE-1 do sekwencji przed H2.
- **Stan:** plan i backlog zaktualizowane; kod, baza i produkcja nietknięte.
- **Decyzja:** CORE-0 jest bramką przed R4A, a CORE-1 po R4D i przed R4E. Pełny model
  objętości, zmęczenia/deloadu i kalibracja rekomendatora czekają na H2.
- **Dowód:** `audyt-core-i-plan-2026-07.md`; 91/91 unit, lint, walidacja treści i 60/60
  profili rekomendacji były zielone przed refinementem.
- **Następny krok:** Q1, następnie rezerwacja DATA-01 w CORE-0.

### 2026-07-21 · Codex · refinement R4 loggera

- **Zakres:** rozbicie R4 na R4A–R4E i dopisanie kontraktu aktywnej serii, guidance
  pierwszej sesji, własnego treningu, backfillu oraz wartości drugiego treningu.
- **Stan:** plan gotowy do implementacji; kod produktu, baza i produkcja nietknięte.
- **Dowód:** klikalny POC został przejrzany w pełnej ścieżce. Potwierdził prosty start,
  poprawne guardy i mini-bar, ale nie jest pełnym dowodem przejścia przez wiele serii
  oraz nie implementuje kompletnego backfillu.
- **Następny krok:** Q1, następnie rezerwacja LOG-00 + R4A według `spec-r4-logger.md`.

### 2026-07-21 · Claude · Linear jako warstwa operacyjna + dokumenty prawne + zespół

- **Zakres:** decyzje właściciela: Piotr dołącza (security, porozumienie w draftach),
  Linear zastępuje Notion. Workspace `trainarco`: labelki (grupa Obszar: Design/Dev/
  Security/Ops/Content/Legal + Do refinementu/Zablokowane/Test urządzeniowy), 7 projektów
  (Q1, R2.2, R4, R3b, R5b, Security & PRIV-1, Operacje), 40 issues DAN-5…DAN-44
  zasianych z `backlog-produktu.md` i ryzyk HANDOFF (P2/mobile/store celowo poza Linear
  do czasu aktywacji). Repo: `docs/legal/` (commity `2aa4191`, `d10e51e` — drafty RODO
  + domena trainarco.com), aktualizacja reguł Notion→Linear (CLAUDE.md, HANDOFF §7,
  zamknięcie `notion-sync-queue.md`).
- **Stan:** zakończone; kod produktu, baza i produkcja nietknięte (zmiany tylko docs+Linear).
- **Flow w Linear:** Backlog (+„Do refinementu") → Todo → In Progress → In Review
  (= do testu; „Test urządzeniowy" blokuje Done bez telefonu) → Done / Canceled.
  Grupa Obszar jest wzajemnie wykluczająca — jedno issue ma jednego właściciela obszaru.
- **Następny krok:** [Ty] push commitów docs; onboarding Piotra (porozumienie OPS-06/DAN-43,
  pierwsze zadanie SEC-01/DAN-34); statusy w Linear ewentualnie przemianować ręcznie
  (connector nie zarządza statusami).

### 2026-07-20 · Codex · Product Vision POC

- **Zakres:** pełna mapa zgłoszeń właściciela w backlogu oraz klikalny POC docelowego
  kręgosłupa Home, Planów, loggera, Historii, Postępów/Ciała i Ekipy.
- **Stan:** zakończone lokalnie; kod produkcyjny, baza i produkcja nietknięte.
- **Testy:** pełny przepływ planowanego i własnego treningu, mini-bar, finish guards,
  zapis programu, filtry sprzętu, Historia, Ekipa, szerokości 393/320 px i konsola przeglądarki.
- **Artefakt:** `prototypes/product-vision-poc/`.
- **Następny krok:** review właściciela, następnie Q1 i implementacja według R2.2 → R4 → R3b.

## Szablon rezerwacji

```md
| Agent | ID — nazwa | pliki/obszar | YYYY-MM-DD HH:MM | w toku |
```

## Szablon zamknięcia

```md
### YYYY-MM-DD · Agent · ID

- **Zakres:**
- **Commit/stan:**
- **Testy:**
- **Produkcja:** nietknięta / preview / wdrożona
- **Otwarte:**
- **Następny krok:**
```
