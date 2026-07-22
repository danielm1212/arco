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

### 2026-07-22 · Claude · nowy skill arco-motion-review + dogfood

- **Zakres:** analiza 3 zewnętrznych repo skilli (taste-skill/impeccable/emil) pod kątem Arco;
  nowy skill projektowy `.claude/skills/arco-motion-review/SKILL.md` (metoda review z
  `review-animations` Emila, MIT; bar z `wytyczne-designu §2c` + `optymalizacja.md` + realne
  tokeny `globals.css`/`bottom-sheet.tsx`); przegląd istniejącego ruchu tą metodą. Bez kodu apki.
- **Stan:** **ZAKOŃCZONE** (skill, commit lokalny). Wniosek z analizy: taste-skill i większość
  impeccable celują w greenfield/anti-slop i biłyby się z kanonem — pominięte; z impeccable
  ewentualnie CLI `detect` do CI (osobno). Zero vendorowania cudzego drzewa.
- **Wynik dogfoodu:** biblioteki animacji — brak (S5 ✓); `SetRow animate-pulse-once` w loggerze
  = sankcjonowany moment PR (S1 ✓, pokryty reduced-motion); `flame-*`/`pr-flash` w budżecie ✓.
  **1 FINDING (S2, do decyzji [Ty]):** `components/ui/bottom-sheet.tsx` używa
  `animate-in fade-in-0 slide-in-from-bottom-8` BEZ bramki reduced-motion — blok
  `@media (prefers-reduced-motion)` w `globals.css` pokrywa tylko `animate-flame-*`/
  `animate-pulse-once`, więc najczęstszy overlay apki animuje wejście mimo preferencji usera.
  `app/history/[id]/page.tsx` robi to dobrze (`motion-safe:`), sheet nie — niespójność.
- **Dowód:** skill odwołany do realnych tokenów (zweryfikowane w `globals.css` linie 236–281,
  `bottom-sheet.tsx` 164/182); finding potwierdzony grep-em (sheet: 0× `motion-safe`, history: 1×).
- **Następny krok:** decyzja [Ty] o fixie bottom-sheet (jednoliniowy `motion-safe:` albo dopis do
  bloku reduced-motion; zero zmiany dla userów bez reduced-motion) — shipped UI, nie ruszam bez zgody.

### 2026-07-22 · Codex · TRAIN-02A3 P11/P12

- **Zakres:** pełne korekty objętości P11/P12 po TRAIN-01, estymacje czterech dni,
  wersjonowane mapowanie ławki/drążków/podpór/kotwic i regresje integralności.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/train-02a-p11-p12`; bez SQL, bazy,
  sekretów i produkcji. A1/A2 są już na `main`.
- **Wynik:** P11 v3 ma 21/21/18/18 serii i 14 ścieżek sprzętowych; P12 v3 ma
  22/22/21/19 serii i 12 ścieżek. Częściowe zamienniki są oznaczone jawnie.
- **Dowód:** 112/112 unit, lint, build, walidator 907 ćwiczeń/15 programów/308 slotów
  oraz rekomendacje 60/60 są zielone; 17 placeholderów w 54 slotach bez wzrostu.
- **Następny krok:** zapis relacji i kanoniczna prawda sprzętowa w TRAIN-03/05; SEC-03
  wykonuje właściciel przed kontrolowanym A4, backupem i dry-runem.

### 2026-07-22 · Codex · TRAIN-02A2 P01/P03/P08

- **Zakres:** korekta źródłowych recept P01/P08, wersjonowana mapa alternatyw P03,
  walidator integralności, regresje czasu/objętości i dokumentacja trzech planów.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** i scalone do `main`; bez migracji SQL,
  bazy, sekretów i produkcji.
- **Wynik:** P01 v2 ma Lying Leg Curl i 19 serii/ok. 46 min w B; P08 v2 ma 18 serii/
  ok. 42 min w C. P03 ma trzy jawne mapowania, w tym uczciwie oznaczony częściowy Pullover.
- **Dowód:** 7/7 regresji A1/A2, walidator 907 ćwiczeń/15 programów/308 slotów,
  17 placeholderów w 54 slotach oraz rekomendacje 60/60 są zielone.
- **Następny krok:** TRAIN-02A3 dla P11/P12; zapis alternatyw P03 dopiero w TRAIN-03/05,
  a wspólny release A4 po SEC-03, backupie i dry-runie.

### 2026-07-22 · Codex · TRAIN-02A i kompletność sesji

- **Zakres:** ponowny audyt pięciu planów nieobecnych na produkcji, zależności PLAN-Q,
  rozgrzewki, zakończenia oraz hipotezy domowego programu 20–30 minut.
- **Stan:** **ZAKOŃCZONE TECHNICZNIE** na `agent/train-02a-audit`; read-only
  `audit:program-catalog` blokuje niegotowy sync. Baza, sekrety i produkcja nietknięte.
- **Wynik:** prosty sync P01/P03/P08/P11/P12 jest odrzucony. TRAIN-02A1–A3 przygotowuje
  migrację i domyka recepty bez produkcji; A4 czeka na alternatywy/prawdę sprzętową
  TRAIN-03/05, SEC-03, backup i dry-run.
- **Kompletność:** SESSION-01A dodaje po R4A małą, opcjonalną rekomendację rozgrzewki
  specyficznej i zakończenia bez obietnic regeneracji. PROGRAM-01A 20–30 minut pozostaje
  osobnym eksperymentem po sygnale H2, nie dodatkowym dniem aktywnego planu.
- **Dowód:** aktualny walidator: 907 ćwiczeń, 15 programów, 307 slotów i 17 placeholderów
  w 54 slotach; 106/106 unit, lint, build i rekomendacje 60/60 zielone; przegląd ACSM 2026
  oraz meta-analizy warm-up, stretching i split/FBW.
- **Następny krok:** agent `gpt-5.6-sol high` wykonuje A2 dla P01/P03/P08 i A3 dla P11/P12;
  [Ty] wykonuje SEC-03 po przygotowaniu A1–A3.

### 2026-07-22 · Codex · release Q1 TRAIN-01/CONTENT-01A/CONTENT-02

- **Zakres:** backup bazy i Storage, audyt otwartych sesji oraz planów, dry-run i wdrożenie
  trzech punktowych migracji produkcyjnych; niezależna kontrola danych i ekranu aplikacji.
- **Stan:** **WDROŻONE PRODUKCYJNIE**. Historia migracji lokalna/zdalna jest zgodna do
  `20260722002735_content02_chin_up_review.sql`; Vercel dla bieżącego `main` ma zielony status.
- **Dowód:** 8/8 asercji produkcyjnych: containment Barbell Hip Thrust, publikacja Glute Bridge,
  instrukcje trzech wariantów, review Chin-Up, recepta i dni P14 oraz 0 starych/3 nowe sloty.
  Ekran logowania Arco renderuje się bez błędów konsoli.
- **Backup:** baza `backups/20260722T094952Z`; Storage
  `backups/20260722T095327Z/storage` (2 `body-photos`, 0 `exercise-photos`).
- **Drift:** produkcja ma 10/15 planów systemowych, w tym brakuje P11/P12. Migracja celowo
  wykonała no-op dla nieistniejących planów; osobny TRAIN-02A zrobi audytowalny point sync.
- **Bezpieczeństwo:** CLI nieoczekiwanie wypisało legacy `service_role` do prywatnego logu.
  Klucz nie trafił do repo; SEC-03 wymaga pilnej kontrolowanej rotacji przez właściciela.
- **Następny krok:** SEC-03 → TRAIN-02A → checkpoint iPhone TRUST-01/03 + TRUST-02;
  następnie CONTENT-01B/CONTENT-03a i CORE-0.

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
