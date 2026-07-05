# Paleta „Arco Warm" — primitives + mapowanie semantic (Sprint N3)

> Decyzja właściciela 2026-07-04 (aktualizacja: canvas aplikacji = neutralny `#F7F7F7`, krem przechodzi do roli brandowej).
> Źródło prawdy dla tokenów N3. Kontrasty policzone: ✓AA = przechodzi WCAG 2.1 AA dla normalnego tekstu.

## Logika systemu (przeczytaj najpierw)

- **grey** = baza UI aplikacji (canvas, tile, bordery, teksty wtórne). Neutralna, żeby dane i treść były czyste.
- **sand (krem)** = powierzchnia BRANDOWA, nie canvas: hero card, ekran celebracji, onboarding, empty-states, landing/marketing, kafle z logo. Ciepły moment, nie tapeta.
- **rust** = akcent (CTA, aktywne stany, liczba-bohater, PR).
- **ink** = tekst primary w light + powierzchnie dark mode.
- **stone** żyje TYLKO na powierzchniach sand (tekst wtórny na kremie). W UI na grey używamy grey-500/600 — nie mieszamy dwóch temperatur szarości na jednej powierzchni.

## Primitives

### grey (baza UI — canvas: Twój #F7F7F7 = 100)
| Stop | Hex | Rola |
|---|---|---|
| 0 | `#FFFFFF` | tile / karta |
| 50 | `#FBFBFB` | tile hover / zagnieżdżone |
| 100 | `#F7F7F7` | **canvas aplikacji (light)** |
| 200 | `#EFEFEF` | elementy wygaszone (przyszłe day-pills), wiersze zagnieżdżone |
| 300 | `#E4E4E3` | border subtelny / divider |
| 400 | `#D1D1CF` | disabled fill |
| 500 | `#9C9B98` | placeholder / muted |
| 600 | `#6F6E6B` | **tekst secondary** (na canvas 4.7:1 ✓AA) |
| 700 | `#55544F` | mocniejszy wtórny |

### rust (akcent — terracotta)
| Stop | Hex | Rola |
|---|---|---|
| 50 | `#FBEFE9` | tinted bg akcentu (badge) |
| 100 | `#F6DCD1` | tinted bg mocniejszy |
| 200 | `#EFBCA7` | — |
| 300 | `#E5977A` | — |
| 400 | `#DC6B45` | **akcent w dark mode** (na ink-800: 4.9:1 ✓AA) |
| 500 | `#C63F21` | **brand / akcent light** (na grey-100: ~4.7:1 ✓AA — może być tekstem) |
| 600 | `#A53418` | akcent hover / mocniejszy tekst |
| 700 | `#85290F` | pressed |
| 800 | `#641F0B` | tekst na rust-50/100 |
| 900 | `#451507` | tekst na rust-200 |

### sand (powierzchnie brandowe — krem)
| Stop | Hex | Rola |
|---|---|---|
| 50 | `#FBF9F5` | jaśniejszy wariant brandowy |
| 100 | `#F6F2ED` | **brand surface** (hero, celebracja, onboarding, marketing, kafle logo) |
| 200 | `#EEE8DF` | zagnieżdżenia na brand surface |
| 300 | `#E2DACD` | border na brand surface |
| 400 | `#CFC5B4` | disabled na brand surface; tekst secondary w dark |

### stone (ciepły szary — TYLKO na powierzchniach sand)
| Stop | Hex | Rola |
|---|---|---|
| 500 | `#8A8072` | caption na kremie |
| 600 | `#6E655A` | tekst secondary na kremie (5.1:1 ✓AA) |
| 700 | `#554E45` | mocniejszy wtórny na kremie |

### ink (ciepła czerń — tekst primary + powierzchnie dark)
| Stop | Hex | Rola |
|---|---|---|
| 500 | `#45413D` | border w dark |
| 600 | `#33302D` | tile hover w dark |
| 700 | `#282523` | tile / karta w dark |
| 800 | `#1E1C1A` | **canvas dark** + **tekst primary light** (na #F7F7F7: ~15:1) |
| 900 | `#141210` | głębia (modale/overlay w dark) |

## Mapowanie semantic (light / dark)

| Semantic | Light | Dark |
|---|---|---|
| canvas | grey-100 `#F7F7F7` | ink-800 |
| surface (tile) | grey-0 `#FFFFFF` | ink-700 |
| surface-hover / nested | grey-50 | ink-600 |
| surface-muted | grey-200 | ink-600 |
| border | grey-300 | ink-500 |
| **surface-brand** | sand-100 `#F6F2ED` | ink-700 + akcenty rust |
| text-primary | ink-800 | sand-50 |
| text-secondary | grey-600 (na sand: stone-600) | sand-400 |
| text-muted | grey-500 (na sand: stone-500) | grey-400/stone |
| accent | rust-500 | rust-400 |
| accent-hover | rust-600 | rust-500 |
| on-accent | grey-0 | ink-900 |
| accent-bg (tint) | rust-50 | rust-900 |

## Reguły twarde

1. **Elevation lustrzane:** light: canvas(grey-100) → tile(grey-0) → hover(grey-50); dark: canvas(ink-800) → tile(ink-700) → hover(ink-600). Jaśniejszy element na ciemniejszym tle, bez ramek 1px, radius-xl + miękki cień (wzorzec BytePal).
2. **Krem nie jest tapetą.** sand tylko na powierzchniach brandowych (hero/celebracja/onboarding/marketing) — max 1 taka powierzchnia na ekran, żeby nie zjadła neutralnej bazy.
3. **Rust jako tekst:** na jasnych tłach tylko 500+; na ciemnych tylko 400. Stopy 50–300 wyłącznie jako fill z tekstem rust-800/900.
4. **Temperatura szarości zależy od powierzchni:** na grey → grey-500/600; na sand → stone-500/600. Nigdy odwrotnie.
5. **Zero czystej czerni `#000`** — tekst primary to ink-800.
6. Kolory funkcjonalne (success/danger/warning): wyprowadzić w N3 spójnie z paletą (danger ≠ rust — musi się odróżniać od akcentu; zaproponować przed wdrożeniem).

## Kolory funkcjonalne — propozycja Claude (wdrożona 2026-07-05, DO AKCEPTACJI [Ty])
| Rola | Light | Dark | Uzasadnienie |
|---|---|---|---|
| danger | `hsl(353 65% 46%)` ≈ #C22A44 (malina) | `hsl(353 70% 62%)` | hue 353 vs rust 11–15 — wyraźnie inna barwa, nadal ciepła rodzina |
| success | `hsl(146 45% 36%)` ≈ #33875A | `hsl(146 40% 55%)` | przygaszona zieleń, nie neonowa; AA jako tekst na canvas |
| warning | `hsl(38 92% 50%)` (amber, bez zmian) | jw. | używany głównie jako badge W/nota — odróżnialny od rusta |
