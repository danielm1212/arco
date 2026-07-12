# Wytyczne designu — HIG jako poprzeczka jakości (adaptacja pod PWA)

> **Data:** 2026-07-08 · **Decyzja [Ty]:** trzymamy się wytycznych Apple HIG — **adaptowanych, nie kopiowanych**. Arco to PWA na dwóch platformach, a rynek PL jest Android-majority; z HIG bierzemy uniwersalną poprzeczkę jakości, pomijamy iOS-specyfikę.
> **Hierarchia rozstrzygania konfliktów:** (1) nasz system — `paleta-arco-warm.md` + `tone-of-voice.md` + wizja §1.2 → (2) zasady z tego pliku (HIG-uniwersalne + WCAG AA z Definition of Done) → (3) odruchy platformy usera (iOS/Android), gdy dotyczą zachowań systemowych.
> **Po co to:** (a) iOS to nasze najtrudniejsze środowisko (tarcie instalacji PWA) — im bardziej „natywne" czucie, tym mniejsza szansa odrzucenia; (b) dyscyplina HIG zwróci się przy ew. TWA/sklepach; (c) feedback #1 („za dużo na home") to wprost naruszenie zasad hierarchii z §1.

---

## 1. Zasady HIG, które przyjmujemy jako twarde (uniwersalne)

| Zasada (HIG) | Tłumaczenie na Arco | Stan dziś |
|---|---|---|
| **Hierarchy / Clarity** — jedna wyraźna akcja główna na ekran; treść przed dekoracją | Home: primary = start treningu; reszta (cel, wskazówki, passa) wizualnie podrzędna lub progressive disclosure | ⚠️ do decyzji po H2 (feedback #1) |
| **Deference** — UI ustępuje treści; chrom minimalny | = nasza „warstwa narzędzia" (minimal, bez ramek, elevation światłem) — HIG i wizja §1.2 mówią to samo | ✅ elevation N3 |
| **Touch targets ≥ 44×44 pt** | wszystkie interaktywne elementy, także ikonowe (✓/✕/±) | ✅ Button 44px; pilnować w nowych |
| **Czytelność / Dynamic Type** — tekst się skaluje, zoom działa | zoom NIE może być zablokowany (`maximumScale` — P0 z usability-audit!); rozmiary w rem; min. 11pt/15px dla treści | ⚠️ P0 przed H2 |
| **Safe areas** | `pt-safe` w standalone (notch/home indicator) | ✅ jest |
| **Feedback natychmiastowy** — każda akcja ma odpowiedź <100 ms | tap serii = natychmiastowy stan (optymistyczny UI + outbox); wibracja na koniec przerwy (już mamy) = HIG-owe „haptics w momentach znaczących, oszczędnie" | ✅ rdzeń; utrzymać przy nowych |
| **Modality oszczędnie** — sheet do krótkich zadań, nie zagnieżdżać modali | vaul-sheets (picker, swap) = dokładnie iOS-owy wzorzec; max 1 poziom | ✅ |
| **Nawigacja: tab bar 3–5 pozycji, stała** | BottomNav = analog tab baru; nie dokładać 6. pozycji, nowe sekcje przez hierarchię, nie nowe taby | ✅ pilnować |
| **Stany puste/ładowania/błędu zaprojektowane** | empty states S14 + skeletony + offline banner | ✅ |
| **Dark mode semantyczny** — nie inwersja, osobna semantyka | rampy ink + re-deklaracja tokenów w `.dark` | ✅ (auto z `prefers-color-scheme` — P0) |
| **Progresywne ujawnianie** — zaawansowane opcje schowane, defaulty mądre | „view all plans" na paywallu (wnioski-Mobbin P4), chipy „więcej sprzętu" w pickerze | ✅ wzorzec jest |
| **Szanuj przerwania** — stan przeżywa wyjście z apki | mini-bar sesji w toku + outbox offline | ✅ / S10 domyka |

## 2. Czego z HIG świadomie NIE bierzemy (iOS-specyfika)

- **SF Pro / SF Symbols** — mamy DM Sans + lucide (+ przyszły krój display). Spójność marki > mimikra systemu.
- **Ślepe iOS-owe wzorce na Androidzie:** back = gest/przycisk systemowy Androida musi działać (history API), nie tylko strzałka w headerze; share przez Web Share API (natywny sheet obu platform), nie własny popup.
- **Liquid Glass / najnowszy język wizualny Apple** — obserwujemy, nie kopiujemy; Arco ma własny język (Warm). Przezroczystości/blur w web = koszt wydajności na średnich Androidach.
- **Wzorce wymagające natywu** (context menus z haptic, live activities itd.) — nie udajemy; PWA robi mniej, ale to co robi, robi bez lagu.
- Prawny nawias: HIG to wytyczne Apple — stosujemy je jako dobre praktyki projektowe; nie podlegamy App Store Review (dopóki nie ma TWA w App Store).

## 2b. Normy typografii i kształtu (mini-sprint „rymy", 2026-07-11)

- **Waga sans: max `font-semibold` (600). `font-bold` nie istnieje w apce** — „krzyk" robi Gambarino (`font-display`), nie tłuszcz. Sweep wykonany (17 wystąpień).
- **Liczby-momenty = `font-display`** (Gambarino, tabular-nums): liczba-bohater done-screen, Stat na /progress, podsumowanie sesji w historii, waga na /body. Nowa duża liczba? → font-display.
- **Radiusy:** karty `rounded-xl` · wiersze-w-kartach i chipy prostokątne `rounded-md` · pigułki `rounded-full` · mikro-elementy <8 px wysokości (paski aktywności) `rounded-sm`. Innych nie używamy.
- **Glif ognia = jeden** (lucide `Flame`): FlameWeek, kalendarz historii (dzień treningowy), przyszłe recap/streak-badge. Żadnych 🔥-emoji w UI narzędzia tam, gdzie może stać glif (emoji zostaje w copy momentów).

## 3. Checklist nowego ekranu/komponentu (do review przed merge)

1. Jedna akcja główna? Co user ma zrobić najpierw — widać w 2 s?
2. Wszystkie targety ≥44 px, focus-visible, kontrast AA (tekst na kremie: tylko rust-500+)?
3. Działa z zoomem 200% i długimi stringami PL (np. „Wyciskanie hantli na ławce skośnej")?
4. Stany: pusty / ładowanie / błąd / offline zaprojektowane, nie domyślne?
5. Feedback akcji <100 ms (optymistyczny UI tam, gdzie sieć)?
6. Sheet zamiast nowej trasy dla zadań <30 s? Max 1 poziom modality?
7. Dark mode sprawdzony (tokeny semantyczne, zero magic hexów)?
8. Copy przeszło ToV (warstwa narzędzia = minimum słów)?
9. Android: gest wstecz nie wyrzuca z flow w połowie? iOS standalone: safe-area OK?
10. Czy to dokłada element do home/nav? Jeśli tak — co zabieramy w zamian (feedback #1!).

## 4. Wpięcie w proces

- Checklist §3 dołącza do **Definition of Done** (CLAUDE.md) jako odniesienie przy zmianach UI.
- Audyt istniejących ekranów pod §1: NIE robimy osobnego sprintu — punkty ⚠️ już są w P0 usability-audit (zoom, dark-auto, focus-visible), reszta łapie się przy S9-cz.2 i naturalnych iteracjach.
- Figma workstream (CLAUDE.md „Design system & Figma"): te zasady = accepance criteria komponentów przy eksporcie DS.
