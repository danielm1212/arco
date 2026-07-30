# PLAN-05E — handoff do Claude Code

**Data:** 2026-07-30  
**Gałąź:** `agent/plan-05e-program-list`  
**Stan:** WIP bez commita; nie otwarto PR-a i niczego nie wdrożono

## 1. Wprowadzenie

Kontynuujesz PLAN-05E: redesign wierszy na `/programs`. PLAN-05A, 05B, 05C i 05D są już
na `main` (05D przez PR #53). NAV-01 także jest na `main`, więc zachowaj wspólny chrome
Treningu. Po PLAN-05E może ruszyć R2.2.

Przed zmianami przeczytaj:

1. `CLAUDE.md`
2. `docs/HANDOFF.md`, zwłaszcza §6 pkt 6
3. `docs/spec-plan-detail-card.md`
4. `docs/wytyczne-designu.md`
5. `.claude/skills/arco-a11y-review/SKILL.md`
6. `docs/standard-zadania-agentow.md`

Nie uruchamiaj migracji ani deployu. Nie aktualizuj Lineara bez wyraźnej prośby właściciela.

## 2. Gdzie się zatrzymaliśmy

W niezatwierdzonym WIP są:

- `app/programs/page.tsx`
  - `cover_image_url` dodane do istniejącego selecta — nadal są te same trzy równoległe
    zapytania, bez dodatkowego requestu;
  - `ProgramRow` używa `ProgramCover` w rozmiarze 64×64;
  - dodane zwarte częstotliwość/czas i `LevelMeter`;
  - akcja „Ustaw” lub znacznik „Aktywny” znajduje się obecnie pod miniaturą po lewej.
- `components/LevelMeter.tsx`
  - obsługuje zawijanie długiej etykiety;
  - nadal renderuje trzy poziome pastylki, co właściciel odrzucił dla listy.
- `app/programs/loading.tsx`
  - skeleton uwzględnia miniaturę.
- `tests/e2e/overflow.test.ts`
  - test PLAN-05E renderuje pełne 15 presetów i jeden własny plan na 320 px;
  - jego HTML odwzorowuje obecną, niezaakceptowaną kompozycję, więc po redesignie trzeba
    go zaktualizować.

Obecny kod jest technicznie stabilnym checkpointem, ale nie jest gotowym UI.

## 3. Feedback właściciela — obowiązujący kierunek

1. Nazwy kart są za długie. Nie powtarzaj w tytule informacji, które karta pokazuje osobno.
2. „Początkujący” nie powinno być częścią długiego tytułu, jeśli poziom jest widoczny obok
   miernika.
3. Miernik poziomu na liście powinien wyglądać jak trzy małe pionowe, zaokrąglone słupki
   z referencji, a nie trzy poziome, rozciągnięte pastylki.
4. „Siłownia”, „Dom” i podobne środowisko pokaż jako mały tag pod tytułem, nie jako część
   pełnej nazwy.
5. „Ustaw” pod zdjęciem po lewej stronie wygląda bardzo słabo — akcja wymaga nowego miejsca
   i hierarchii.
6. Rozważ oznaczenie aktywnego planu stanem całej karty, bez osobnego przycisku „Aktywny”.
   To sugestia do dopracowania wizualnego, nie zatwierdzony gotowy wariant.
7. Zachowaj zaakceptowaną zasadę: mała miniatura po lewej, zwarte informacje obok; lista
   nie ma zmieniać się w duże hero.

Referencja właściciela:

`/var/folders/r7/xw5gfj4d3lsctrqjmvnq7n8r0000gn/T/codex-clipboard-3fa661fd-d5b2-47e9-94c2-672b54ee4f2d.png`

Referencja pokazuje krótki tytuł, osobną linię informacji i poziom jako trzy niewielkie
pionowe słupki z tekstem.

## 4. Zalecany następny przebieg

1. Otwórz realny build na 320 i 393 px przed kolejną zmianą.
2. Zaprojektuj jedną kartę presetu i aktywnego planu, zanim zaktualizujesz cały harness.
3. Dla presetów wyprowadź krótką nazwę prezentacyjną z istniejących pól/nazwy bez migracji
   i bez destrukcyjnego przepisywania danych. Pełny tytuł może pozostać nazwą dostępną dla
   czytnika lub w szczególe, jeśli będzie to potrzebne.
4. Dodaj wariant listowy do `LevelMeter`, jeśli pionowe słupki nie pasują do zatwierdzonego
   szczegółu PLAN-05D. Nie regresuj ekranu `/programs/[id]`.
5. Pokaż środowisko jako mały tag, a częstotliwość i czas jako zwarte fakty. Nie powtarzaj
   tych samych danych w tytule.
6. Dla aktywnego planu przetestuj stan całej karty: subtelny obrys/tło oraz czytelna
   informacja tekstowa dla dostępności. Nie opieraj stanu wyłącznie na kolorze.
7. Umieść „Ustaw” poza kolumną zdjęcia. Karta musi zachować jasne rozróżnienie między
   wejściem w szczegół a aktywacją planu oraz target co najmniej 44×44 px.
8. Po akceptowalnym podglądzie zaktualizuj skeleton i test PLAN-05E, uruchom lint, build,
   unit i overflow, a następnie wykonaj `arco-a11y-review`.

## 5. Dowody z obecnego checkpointu

- lint: zielony
- build produkcyjny: zielony
- testy unit: **217/217**
- testy overflow: **36/36**
- realny build: 320/375/393 px bez poziomego overflow
- lista: 15 presetów + własny plan sprawdzone
- stany: aktywny plan, własny plan, filtry i brak okładek sprawdzone
- CTA w obecnym teście: minimum 44 px
- zapytania: bez nowego zapytania; `cover_image_url` jest w istniejącym select

Wyniki potwierdzają brak regresji technicznej, nie akceptację wizualną.

## 6. Dane i higiena repo

Lokalne konto testowe `0655b7f4-1ba8-499f-961e-2664b187c790`
(`codex-plan05e@example.test`) zostało usunięte punktowo po kontroli ID i e-maila. Powiązany
własny program `c55781d0-f8d2-4ef6-96da-aa8c23d12a12` oraz aktywacja usunęły się kaskadowo.

Nie dodawaj do commita obcych, nieśledzonych plików z sufiksem ` 2`:

- `.claude/skills/* 2.md`
- `docs/* 2.*`
- `public/icons-3d/* 2.png`

Nie wykonano migracji, deployu ani aktualizacji Lineara.
