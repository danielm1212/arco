# Figma — karta „Następny trening" (hero Home), spec wykonawczy

Cel: przenieść do Figmy **jedną kartę** — hero z Home — z pełnym podpięciem pod
Variables, jako **bazę pod redesign** (decyzja właściciela 2026-08-04).
Reszta biblioteki komponentów: później, osobnymi etapami.

Źródło prawdy: `app/page.tsx:264–318` (stan po refaktorze kart z 2026-08-04).
Plik Figma: `HTkBggPmirjWk2ivzFX78r` (Arco).

---

## 0. Dwie decyzje wykonawcze (do obalenia jednym słowem)

1. **Ramka, nie komponent.** To punkt wyjścia do redesignu, nie zasób biblioteki —
   sztywny component set z wariantami przeszkadzałby w swobodnym iterowaniu.
   Wiązania zmiennych i tak pokazują, co jest tokenem. Komponentyzacja przyjdzie
   naturalnie, gdy redesign się ustabilizuje.
2. **Stan „pełny"** — wszystkie warunkowe węzły widoczne (nazwa planu, linia rotacji,
   meta, podgląd ćwiczeń, „Zmień"). Redesign robi się na maksimum treści, nie na
   przypadku szczęśliwym. Pusty stan („Zacznij od planu") to osobna karta — dorobić
   tylko jeśli redesign ma objąć również ją.

## 1. Czego brakuje w Figmie zanim karta powstanie

Dziś (po synchronizacji z 2026-08-04) plik ma **wyłącznie zmienne kolorów**.
Ta karta potrzebuje dodatkowo — i tylko tyle, bez reszty fundamentu:

| Potrzebne | Wartość | Status |
|---|---|---|
| `space/2xs` | 4 px | ⬜ do utworzenia |
| `space/sm` | 12 px | ⬜ |
| `space/md` | 16 px | ⬜ |
| `radius/md` | 10 px (CTA) | ⬜ |
| `radius/xl` | 20 px (karta) | ⬜ |
| Effect style `E1` | ↓ §4 | ⬜ |
| Text styles ×4 | ↓ §3 | ⬜ (istniejąca strona typografii ma BŁĘDNE wagi — patrz §6) |
| Kolory semantyczne | `color/*` | ✅ są |

## 2. Struktura i wymiary

Szerokość karty przy ekranie 390 px: **358 px**
(`<main className="p-md">` = 16 px z każdej strony → 390 − 32).

```
Karta · auto-layout PIONOWY · hug · radius/xl · overflow hidden
│  tło + krawędź: „polished" (§5) · cień: E1
│
├─ BODY · auto-layout pionowy · padding space/md (16) · gap 0*
│  ├─ Rząd nagłówka · poziomy · space-between · gap space/sm (12)
│  │   ├─ „Następny trening"      Caption · color/text-muted
│  │   └─ „FBW domowy (hantle)"   Caption/Medium · color/accent · truncate
│  ├─ „Trening A"                  Hero-24 · color/text          ↑ mt space/sm (12)
│  ├─ „Następny w rotacji A-B"     Caption · color/text-muted    ↑ mt space/2xs (4)
│  ├─ „6 ćwiczeń · ~52 min"        Label · color/text-muted      ↑ mt space/2xs (4)
│  ├─ „Wyciskanie hantli · Przysiad goblet · Wiosłowanie …"
│  │                                Caption · color/text-muted   ↑ mt space/2xs (4)
│  └─ CTA „Zacznij trening"        ↓ §7                          ↑ mt space/md (16)
│
└─ FOOTER · poziomy · align center · gap space/sm (12) · padding-x space/md (16)
   │  górna krawędź 1 px · color/border
   ├─ „Podgląd ćwiczeń"   Caption/SemiBold · color/accent · wys. min 44
   ├─ „Zmień"             Caption/SemiBold · color/accent · wys. min 44
   └─ „Własny trening" →  Caption/Medium · color/text-muted · wys. min 44 · dosunięte
                          w PRAWO (ml-auto) + ikona strzałki 14 px
```

\* odstępy pionowe w body pochodzą z marginesów poszczególnych węzłów (`mt-*`),
nie z jednego `gap` — wartości są różne (12/4/4/4/16), więc auto-layout dostaje
`gap 0`, a odstępy idą jako `itemSpacing` per węzeł albo padding-top elementów.
Przy redesignie to pierwszy kandydat do uproszczenia na jednolity rytm.

## 3. Text styles (DM Sans)

Nazwy do utworzenia — tylko te cztery, których karta używa:

| Styl | Rozmiar/interlinia | Waga | Tracking |
|---|---|---|---|
| `Caption` | 12 / 16 | Regular | 0 |
| `Caption/Medium` | 12 / 16 | Medium | 0 |
| `Caption/SemiBold` | 12 / 16 | Semi Bold | 0 |
| `Label` | 14 / 20 | Medium | 0 |
| `Hero-24` | 24 / **30** | Semi Bold | 0 |

`Hero-24` ma interlinię 30, nie 32: kod ma `leading-tight` (1,25 × 24), a nie
domyślne `text-2xl` (32). Łatwo to przeoczyć i karta wyjdzie o 2 px wyższa.

W Figmie styl nazywa się **„Semi Bold"** (ze spacją) — nie „SemiBold".

## 4. Effect style `E1`

Light (dwie warstwy, kolejność jak w CSS):
```
0  1px  2px  rgb(20 18 16 / 4%)
0  5px 14px  rgb(20 18 16 / 3.5%)
```
Dark (jedna warstwa): `0 4px 14px rgb(0 0 0 / 12%)`

## 5. Krawędź „polished" — jedyna rzecz, która NIE będzie zmienną

`.surface-polished` maluje powierzchnię gradientem `padding-box`, a krawędź osobnym
`border-box`. **Figma Variables nie przechowują gradientów**, więc rim musi być
gradientowym obrysem (albo stylem), nie zmienną — i to jedyne miejsce w tej karcie
bez wiązania do tokenu. Warto o tym pamiętać przy redesignie: jeśli krawędź ma
zostać, potrzebuje własnego stylu, żeby nie rozjechała się jak niegdyś cienie.

Gradient (light), 145°:
```
0%    #FFFFFF        100%
48%   #FFFFFF         24%
100%  #665EDB (violet-500)  16%
```
Wypełnienie powierzchni pod spodem: `color/surface`.

## 6. Uwaga: istniejąca strona typografii kłamie

Strona „Typography · DM Sans" w pliku podaje **Bold** dla Display/H1/H2. W kodzie
`font-bold` nie istnieje — `docs/wytyczne-designu.md` §2b: „Waga sans: max
`font-semibold` (600) […] »krzyk« robi Gambarino, nie tłuszcz" (świadomy sweep
17 wystąpień, 2026-07-11). Nowe style tekstu tworzymy od razu na SemiBold; korektę
istniejącej strony robimy przy etapie fundamentu, żeby nie mnożyć rozjazdu.

## 7. CTA „Zacznij trening"

Odpowiada `<Button>` w wariancie `default`, rozmiar `default`, `w-full`:

| Własność | Wartość | Token |
|---|---|---|
| wysokość | 44 px | — (h-11) |
| szerokość | fill | — |
| promień | 10 px | `radius/md` |
| tło | rust | `color/accent` |
| tekst | biel | `color/accent-contrast` |
| typografia | 14 / 20, Medium | `Label` |

Na tym etapie **nie** budujemy pełnego component setu Buttona (7 wariantów × 4
rozmiary = 28 kombinacji bez stanów, próg dzielenia to 30) — kartę składamy z jednej
instancji CTA. Pełny Button przyjdzie z etapem prymitywów.

## 8. Treść do wypełnienia (realistyczna, nie „lorem")

```
Następny trening        FBW domowy (hantle)
Trening A
Następny w rotacji A-B
6 ćwiczeń · ~52 min
Wyciskanie hantli · Przysiad goblet · Wiosłowanie hantlem …
[ Zacznij trening ]
Podgląd ćwiczeń   Zmień                      Własny trening →
```

## 9. Szacunek kosztu (limit Starter)

~12–16 wywołań `use_figma`: 1 rozpoznanie · 2 zmienne (spacing, radius) ·
1 effect style · 2 text styles · 3–4 CTA + skład karty · 2–3 walidacja
(`get_screenshot`, `get_metadata`) · zapas na poprawki.

Mieści się w jednym oknie limitu, jeśli nie robimy nic obok.
