# Ikony 3D clay — źródło, kolorowanie, prompty

> **Data:** 2026-07-08 · **Podstawa:** `wizja-i-plan-produktu-v2.md` §1.2 (ikony matowe/clay w terracotta/krem, metalik odrzucony; zestaw kurowany; użycie TYLKO empty states / onboarding / celebracje — nie nawigacja) + `paleta-arco-warm.md` (wartości kolorów).
> **Status:** tor assetów [Ty]; prompty gotowe do użycia.

---

## 1. Źródło — rekomendacja: hybryda (3dicons.co + AI dla gym-setu)

**3dicons.co — zweryfikowane 2026-07-08:** licencja **CC0** (komercyjnie, bez atrybucji), ~200 ikon / 1400+ renderów, źródła Figma + Blender, **edytor online koloru i kąta** (early access). Styl już jest miękki/clay-owy — idealna baza.

- ✅ **Bierzemy z 3dicons (generyczne momenty):** Trophy (PR/celebracja), Medal (rekordy), Target (cel tygodniowy), Calendar (historia/passa), Bell/Call ringing (nudge), Lock (kłódka premium — fala 2), Rocket (onboarding/start), Gift Box (trial), Chat bubble/Thumb up (reakcje w ekipach), Fire — jeśli jest w secie (passa).
- ❌ **Czego 3dicons NIE ma:** hantel, ławka, kettlebell, talerz — zestaw jest generyczny (biuro/social/commerce). **Gym-set robimy AI** (prompty §4) i przepuszczamy przez ten sam color-pass, żeby siedział obok 3dicons bez zgrzytu.
- Alternatywy rozważone: icons8 3D (płatne/atrybucja — odpada przy CC0 na stole), Spline community (licencje mieszane — ryzyko), pełne AI (spójność z generycznymi trzeba by budować od zera). **Hybryda wygrywa:** darmowa baza + AI tylko tam, gdzie trzeba.
- Opcja ambitniejsza (później): domodelować 4 gym-obiekty w Blenderze na scenie świateł 3dicons (źródła CC0) — 100% spójności. Nie blokuje startu.

## 2. System materiałów (jeden przepis na wszystkie ikony)

**Zasada: max 2 materiały + 1 akcent na ikonę. Zero metalu, zero glossy.**

| Rola | Kolor | Token | Parametry materiału |
|---|---|---|---|
| Materiał główny (clay) | `#C63F21` | rust-500 | matowy, roughness 0.7–0.9, metalness 0 |
| Materiał drugi | `#F6F2ED` | sand | jw. |
| Detal/kontrast (oszczędnie) | `#1E1C1A` | ink | jw. |
| Tint pomocniczy (max 1 element) | `#F6DCD1` | rust-100 | jw. |
| Wariant dark mode (podmiana głównego) | `#DC6B45` | rust-400 | jw. |

Światło i kadr (spójność zestawu): jedno miękkie światło z góry-lewa + delikatne wypełnienie; kąt izometryczny ~15–25°; miękki cień pod obiektem (albo bez cienia — decyzja raz, dla wszystkich); zaokrąglenia przesadzone („nadmuchana glina" — echo zaokrągleń logotypu).

Eksport źródłowy: PNG przezroczyste **1024×1024**, obiekt ~80% kadru, nazewnictwo `icon-3d-{nazwa}-{light|dark}.png` → `assets-source/icons-3d/` poza katalogiem publicznym. Do aplikacji trafiają wyłącznie zoptymalizowane WebP 320×320 px w `public/icons-3d/production/`.

## 3. PROMPT — rekolor ikon z 3dicons (edytor online / Figma / Blender)

```
Zadanie: przemaluj ikonę 3D z 3dicons.co pod system „Arco Warm clay".

1. Materiał główny → #C63F21 (terracotta), pełny mat: roughness 0.8, metalness 0,
   bez clearcoat. Żadnych odbić środowiska (usuń/ścisz HDRI reflections).
2. Materiał drugi → #F6F2ED (krem), te same parametry matu.
3. Drobne detale (max 1–2 elementy) → #1E1C1A (ciepła czerń) lub #F6DCD1 (tint).
4. Usuń wszystkie gradienty tęczowe/neonowe z oryginału — kolor płaski w materiale,
   głębię robi światło, nie gradient.
5. Światło: jedno soft key top-left + fill; tło transparentne; miękki cień pod spodem.
6. Kąt: zostaw domyślny izometryczny 3dicons (spójność setu).
7. Wygeneruj drugi wariant z podmianą #C63F21 → #DC6B45 (dark mode).
8. Eksport źródłowy: PNG 1024×1024 transparent do `assets-source/icons-3d/`; wariant runtime przygotuj osobno jako WebP 320×320 px w `public/icons-3d/production/`.
```

## 4. PROMPT — generowanie gym-setu AI (master + 4 ikony)

Master (EN — pod generatory; Midjourney/DALL-E/Imagen):

```
Cute 3D clay icon of {OBJECT}, soft matte clay material, no metallic surfaces,
no gloss, terracotta color #C63F21 as primary material and warm cream #F6F2ED
as secondary material, tiny dark warm-black #1E1C1A details, inflated rounded
shapes with exaggerated soft edges, single soft studio light from top-left,
gentle fill light, subtle soft shadow below, isometric angle around 20 degrees,
centered, isolated on plain transparent/white background, in the visual style
of the 3dicons open-source icon library, high resolution render, minimal,
friendly, toy-like --no chrome, metal, reflections, gradients, text, background scene
```

Podstawienia `{OBJECT}` (kolejność wg użycia w apce):

1. **Hantel:** `a dumbbell with two round rubber-look plates per side, terracotta plates, cream handle`
2. **Kettlebell:** `a kettlebell with a rounded oversized handle, terracotta body, cream handle accent`
3. **Talerz (sygnet „o"!):** `a single weight plate standing upright with a visible center hole, terracotta with cream inner ring` — talerz = motyw logo; ta ikona musi rymować się z sygnetem
4. **Ławka:** `a flat gym bench with rounded legs, cream pad, terracotta frame`

Zasady serii: generuj po 4–6 wariantów na obiekt, wybieraj **jeden wspólny język brył** (grubość nóg, proporcje uchwytów) zanim zaakceptujesz całą czwórkę; wszystkie 4 finalne w JEDNEJ sesji/stylu; potem wariant dark (#DC6B45) tym samym seedem/stylem.

## 5. Mapa użycia (żeby zestaw został mały)

| Ikona | Miejsce |
|---|---|
| Hantel | empty state home „Zacznij od planu" / onboarding |
| Trophy (3dicons) | celebracja PR |
| Target (3dicons) | cel tygodniowy osiągnięty |
| Calendar/Fire (3dicons) | passa, historia empty state |
| Lock (3dicons) | kłódka historii (fala 2) — z copy z `tone-of-voice.md` §3 |
| Kettlebell / Ławka / Talerz | onboarding (wybór środowiska: dom/siłownia/masa ciała), celebracje |
| Bell (3dicons) | nudge / skrzynka (ekipy, Krok 4) |

**Twardy limit z wizji:** ikony 3D nie wchodzą do nawigacji dziennej ani list. Jak coś potrzebuje ikony w UI narzędzia → lucide (płaskie), nie clay.
