# Arco — koordynacja agentów

**Aktualizacja:** 2026-07-21
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
| — | Brak aktywnych rezerwacji | — | — | — |

## Ostatnie wpisy

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

### 2026-07-20 · Codex · strategia mobile i sklepy

- **Zakres:** tor STORE-00/MOBILE-0/STORE-BETA/STORE-1, porównanie Expo/React Native z lokalnym
  Capacitorem, billing sklepowy, zgodność i staged rollout.
- **Stan:** zakończone lokalnie w dokumentacji; kod, baza, konta sklepów i produkcja nietknięte.
- **Decyzja:** PWA do H2-F/PAY-01; zdalny WebView odrzucony; pełny Swift/Kotlin bez mierzalnego
  blokera odrzucony; Expo/React Native jest domyślną hipotezą do sprawdzenia pionem.
- **Następny krok:** konta sklepów można przygotować po R6; implementacja po bramce PAY-01.

### 2026-07-20 · Codex · RB0

- **Zakres:** pełna inwentaryzacja dokumentacji, nowy backlog, rejestr decyzji, standard pracy
  agentów, rebaseline planu i HANDOFF; higiena starych raportów i assetów.
- **Stan:** zakończone lokalnie; kod produktu, migracje i produkcja nietknięte.
- **Testy:** link-check dokumentacji, `git diff --check`, lint, 91 unit i build — zielone.
- **Artefakty:** dokumentacja zmniejszona z ok. 968 do 648 KB, a katalog ikon 3D z ok. 25 do 4,1 MB.
- **Następny krok:** Q1 po akceptacji właściciela; zmiany RB0 wymagają osobnego commita.

### 2026-07-20 · Codex · refinement walidacji i premium

- **Zakres:** R4 przed R3b, osobne H2-U/H2-V/H2-E, trzytygodniowe H2-F, drabina wartości,
  eksperyment importu, bramka wizualna oraz droga PRIV-1 → najmniejszy pion premium → płatna beta.
- **Stan:** zakończone lokalnie w dokumentacji; kod, baza i produkcja nietknięte.
- **Dowód:** WTP z małego wywiadu jest sygnałem; dowodem pozostaje powrót w pilocie,
  rezerwacja po poznaniu ceny i finalnie prawdziwy zakup.
- **Następny krok:** Q1 po commicie paczki dokumentacyjnej.

### 2026-07-20 · Codex · sticky logger

- **Zakres:** przywrócenie sticky nagłówka loggera przy globalnym safe area.
- **Commit:** `61717e6`, `main == origin/main`.
- **Testy:** lint, 91 unit, build, overflow 5/5.
- **Produkcja:** kod wypchnięty; checkpoint iPhone PWA pozostaje w Q1.

### 2026-07-20 · Codex · integralność i własny trening

- **Zakres:** F0.7, F0.2/F0.3, L9/L10, świadomy „Własny trening” i ochrona pustej sesji.
- **Commity:** paczka zakończona do `c996b35` oraz refinements do `aab5f1a`.
- **Baza:** migracje `20260720140000`–`20260720153000` potwierdzone local/remote.
- **Testy:** lint, 91 unit, build, smoke danych/offline/Ekipy.
- **Następny krok:** Q1, potem R2.2/R3b.

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
