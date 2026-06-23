# Arco — Audyt produktu (UX/UI + kod), mapa konkurencji, roadmapa

> Stan: po Phase 0–4 + offline + fixy mobilne. Dokument roboczy do ustalenia priorytetów.
> Severity: 🔴 krytyczne · 🟠 ważne · 🟡 średnie · 🟢 nice-to-have.

---

## 1. UX / UI — audyt użyteczności

Oceniane wg heurystyk Nielsena, mobile-first i tego, że **95% czasu user spędza w loggerze**.

### 1.1 Pierwsze uruchomienie / orientacja
- 🟠 **Brak onboardingu.** Po pierwszym logowaniu user widzi listę programów bez kontekstu „co teraz". Nie ma wyjaśnienia modelu (program → dzień → sesja → logger).
- 🟠 **Wybór programu = 2 kroki, mało czytelne.** „Ustaw aktywny" → dopiero rozwijają się dni. Nie widać od razu, że to przełącznik. Brak podpowiedzi „dziś dzień A/B" (rotacja).

### 1.2 Home
- 🟢 Baner „Wznów trening" — dobry.
- 🟠 **Brak sugestii kolejnego dnia.** Przy FBW 2×/3× czy PPL user sam musi pamiętać, czy dziś A czy B. To największy „brak myślenia za usera" na home.
- 🟡 Nawigacja ikonami (świeżo naprawiona) — OK, ale bez etykiet część osób nie rozpozna „⚖ = Ciało".

### 1.3 Logger (rdzeń)
- 🟠 **Toggle serii rozgrzewkowej nieodkrywalny** — tap w numer („W"/liczba). Nikt tego nie zgadnie. Potrzebny jawny przełącznik typu serii.
- 🟠 **Brak +/- przy wartościach.** Na siłowni (spocone ręce, rękawiczki) wpisywanie z klawiatury numerycznej jest wolne. Steppery (±2.5 / ±1 powt.) byłyby szybsze.
- 🟡 **„Poprzedni wynik" tylko per ćwiczenie**, nie per seria. Strong/Hevy pokazują poprzedni wynik **inline w każdym wierszu** („last: 60×8") — to mocno przyspiesza.
- 🟡 **RPE zagęszcza wiersz** na wąskim ekranie (zawija). Rozważyć RPE jako opcjonalne/rozwijane.
- 🟡 **Brak „Next up"** przy odliczaniu przerwy (co za chwilę).
- 🟡 **Brak notatek** (per sesja / per ćwiczenie).
- 🟡 **Brak reorder ćwiczeń** w sesji (istotne we freestyle).
- 🟢 Plate calc pokazuje rozkład — dobrze; ale statycznie (z ostatniej serii), bez interakcji.

### 1.4 Rest timer
- 🟢 Wall-clock + beep/wibracja, +30s/pomiń — solidne.
- 🟡 **Brak odliczania 3-2-1** (audio/wizual) na końcu — Strong/większość to ma.
- 🟡 Nie da się ustawić innego restu „na teraz" poza +30s.

### 1.5 Podmiana ćwiczeń
- 🟢 Ranking + fallback + ostrzeżenie — wyróżnik na tle konkurencji (manualnie, nie AI).
- 🟡 **Brak podglądu „jak wykonać"** przy wyborze zamiennika (trzeba najpierw podmienić, potem sprawdzić).

### 1.6 Historia / Postępy / Ciało
- 🟢 Podsumowanie sesji (serie/objętość/czas + PR) — dobre.
- 🟠 **Brak widoku kalendarza / passy (streak)** — kluczowe pod retencję; konkurencja to ma.
- 🟡 Dashboard `/progress` płytki: brak objętości-w-czasie, brak bilansu partii w formie wizualnej (tylko lista), brak częstotliwości treningów.
- 🟢 Trend per ćwiczenie (sparkline) — dobry zalążek.

### 1.7 Builder programów
- 🟢 CRUD + duplikacja presetu — działa.
- 🟠 **Brak reorder dni/slotów** (kolejność = kolejność tworzenia).
- 🟠 **Brak konfiguracji supersetów w builderze** (tylko ad hoc w sesji).

### 1.8 Ustawienia / konto
- 🟠 **Brak edycji talerzy** (`available_plates`) — plate calc jest „w połowie podłączony".
- 🟡 Brak zmiany hasła / wylogowania ze wszystkich, brak eksportu danych, brak wymuszenia motywu jasny/ciemny.

### 1.9 Przekrojowe
- 🟠 **Brak trwałego dolnego paska nawigacji** (bottom-tab) — standard mobilny; teraz skok między sekcjami wymaga powrotu na home.
- 🟡 Brak spójnych stanów ładowania dla akcji klienckich (picker, podmiana).
- 🟡 Instrukcje ćwiczeń po angielsku (rynek PL).
- 🟡 Brak „undo" po destrukcyjnych akcjach (usunięcie serii/ćwiczenia).
- 🟢 Dostępność przyzwoita (aria-label na ikonach, 44px, rem/skalowanie); do dopięcia kontrast feedbacku i focus-visible na custom buttonach (✓/✕).

---

## 2. Mapa konkurencji

> Pozycje wg wiedzy na ~2025/2026; **ceny i szczegóły zweryfikować** przed decyzjami marketingowymi.

| App | Pozycjonowanie | Mocne | Czego się uczyć |
|---|---|---|---|
| **Strong** | Złoty standard loggera | Prostota, szybkość logowania, plate calc, supersety, RPE, Watch | Dopieszczenie loggera, inline „last set" w wierszu |
| **Hevy** | Strong + społeczność, hojny free | Świetne wykresy, rutyny, **web app**, sharing | Wykresy progresu, parytet web, UX rutyn |
| **Fitbod** | AI auto-programming + dobór wg sprzętu | Heatmapa mięśni / recovery, dobór ćwiczeń pod sprzęt | **Wizualny bilans/regeneracja partii** (Arco ma dane: sets-per-muscle) |
| **Boostcamp** | Darmowe, eksperckie programy | Biblioteka programów (PPL, 5/3/1…), UX prowadzenia po planie | Schematy progresji, „dziś robisz X" |
| **JEFIT** | Ogromna baza + community | Głębia bazy ćwiczeń | Arco ma już free-exercise-db (~873) |
| **FitNotes (Android)** | Minimalizm, offline-first, free | Szybkość, offline | Etos offline-first (Arco to robi) |
| **Caliber / Liftin' / Gymbook** | Nisze (coaching / minimalizm) | — | — |

### Gdzie Arco ma niszę (w co uderzać)
1. **Web/PWA bez app store** — wejście z dowolnego urządzenia, instant.
2. **Manualny silnik podmiany + profil sprzętu** — „override na dziś", nie AI narzucające zmiany (świadoma krytyka Fitbod z briefu).
3. **Builder własnych programów** + gotowe presety (w tym FBW pod sporty walki — Twój kąt: kickboxing).
4. **Offline-resilient logger** — realny ból na siłowni (słaby zasięg).
5. **Świeckość/uczciwość**: bez monetyzacji-na-siłę, bez social-feedu, bez „AI coacha" który zgaduje.

### Czego świadomie NIE robimy (out of scope, sekcja 11 briefu)
Social feed, AI auto-programming, makro/dieta, wearables/HRV, apki natywne, monetyzacja. To trzyma produkt skupiony.

---

## 3. Proponowane usprawnienia (pogrupowane)

- **A. Logger feel (najwyższe ROI):** inline „last set" per wiersz · steppery ±· jawny typ serii · 3-2-1 na końcu przerwy · „Next up" · notatki.
- **B. Offline correctness:** flush outboxa przed „Zakończ" · obsługa offline dla akcji strukturalnych (finish/add-exercise/swap) · fix `set_index`.
- **C. Insight/retencja:** kalendarz + streak · objętość-w-czasie · wizualny bilans partii (heatmapa) · „dziś dzień A/B".
- **D. Program UX:** reorder dni/slotów · supersety w builderze · sugestia kolejnego dnia · schematy progresji.
- **E. Polish/infra:** bottom-nav · edytor talerzy w ustawieniach · PL instrukcje · deploy + HTTPS (pełne PWA, wibracje, instalacja) · obrazki do Storage/CDN.

---

## 4. Audyt kodu (skonsolidowany)

🔴 **Bezpieczeństwo:** RLS pełne i zweryfikowane; service-role tylko serwer. Przed launchem: realne klucze chmurowe, service-role poza repo/bundlem.

🟠 **Poprawność:**
- Wyścig `finishSession` ↔ niezsynchronizowany outbox (PR-y liczone bez wiszących serii) — `app/actions/session.ts`.
- Offline tylko dla serii; `Zakończ`/`Usuń sesję`/`addSessionExercise`/swap = online, **bez sygnału błędu** przy braku sieci.
- Kolizja `set_index` po usunięciu serii (`handleAddSet` używa `length`).
- `available_plates` nieedytowalne (feature w połowie).

🟡 **Wydajność:** N+1 `previous_working_set` per ćwiczenie · historia bez paginacji · obrazki hotlinkowane z GitHuba.

🟡 **Jakość:** duplikacja `formatSet` (×3) i `Sparkline` (×2) → `lib/format.ts` + `components/Sparkline.tsx` · `Logger.tsx` 587 linii (rozbić) · ~14× `as unknown as` z zagnieżdżonych selectów.

🟢 **Dostępność:** dobra baza; dopiąć kontrast feedbacku + focus-visible.

---

## 5. Roadmapa — kolejne fazy

> Kolejność wg: (1) nie-trać-danych, (2) rdzeń się klika, (3) wracasz jutro, (4) publiczne.

### Phase 5 — Offline & logger correctness (🔴/🟠 fundament)
Flush przed finish + offline dla akcji strukturalnych · fix `set_index` · edytor talerzy. *Cel: zero utraty danych, plate calc kompletny.*

### Phase 6 — Logger feel (🟠 najwięcej „czuć")
Inline „last set" per wiersz · steppery ± · jawny typ serii · 3-2-1 na końcu przerwy · „Next up". *Cel: logowanie szybsze niż w Strong.*

### Phase 7 — Nawigacja & retencja (🟠)
Bottom-nav · kalendarz + streak · „dziś dzień A/B" · objętość-w-czasie. *Cel: wracasz codziennie, mniej myślenia.*

### Phase 8 — Insight & program UX (🟡)
Wizualny bilans partii (heatmapa) · reorder dni/slotów · supersety w builderze · schematy progresji. *Cel: produkt „rozumie" trening.*

### Phase 9 — Jakość kodu (🟡, równolegle)
Dedup (`format`, `Sparkline`) · rozbicie `Loggera` · typowane helpery zapytań. *Cel: higiena przed dalszym rozrostem.*

### Phase 10 — Launch readiness (🔴 pod publiczne)
Deploy Vercel + Supabase cloud · HTTPS (pełne PWA/SW/wibracje) · realne klucze · PL instrukcje (top ćwiczenia) · obrazki do Storage · ikona/launch/meta.

---

*Priorytet startowy: Phase 5 (nie tracimy danych) → Phase 6 (rdzeń się klika). Reszta wg feedbacku z testów.*
