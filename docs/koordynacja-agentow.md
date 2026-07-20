# Arco — koordynacja agentów

**Aktualizacja:** 2026-07-20
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
