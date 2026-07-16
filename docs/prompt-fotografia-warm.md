# Prompty: fotografia „Arco Warm retro-analog"

> **Data:** 2026-07-16 · **Zastosowania:** (1) **15 okładek programów** w bibliotece + karta planu E6, (2) **3 ujęcia landingu** (hero, ekipa, founder), (3) przyszłe social/recap. Rozszerza seed z `landing-brief-framer.md` §2.5 w pełny system.
> **Granica kanonu:** foto żyje TYLKO w warstwie komunikacji i powierzchniach editorial (landing, biblioteka, E6, momenty). **Logger i home — nigdy.** Grading: nasz retro-analog (ziarno + ciepłe światło), **NIE duotone** (odrzucone 2026-07-12).

---

## 1. Zasady stylu (niezależne od narzędzia)

- **Film, nie cyfra:** 35 mm analog, widoczne ziarno, lekko zmiękczone światła, ciepły grade — highlights wpadają w krem `#F6F2ED`, cienie w ciepłą czerń `#1E1C1A`, akcenty otoczenia w okolicach terracotty `#C63F21` (ceglana ściana, rdzawa wykładzina, drewno). Paleta MUTED — żadnych czystych nasyconych kolorów.
- **Candid, nie pozowane:** osoba w połowie ruchu (wiosłowanie, zejście do przysiadu, chwyt drążka), wzrok zasadniczo poza obiektywem, dopuszczalny lekki motion blur. W serii można użyć pojedynczych ujęć z krótkim, naturalnym kontaktem wzrokowym — zwiększają uwagę, ale nie mogą wyglądać jak pozowana reklama. Zero stock-fitness: żadnych białych zębów do kamery, flexowania na ściance, oliwy na skórze.
- **Atrakcyjni, lecz prawdziwi:** mix kobiet i mężczyzn (Kasia i Paweł!), naturalnie atrakcyjni i charyzmatyczni, o wyrazistych rysach i zdrowej, trenującej sylwetce — nie bodybuilding stage. Realistyczna tekstura skóry, bez nadmiernego beauty retuszu; ubrania zwykłe (szara/kremowa bawełna, bez neonowych legginsów i logotypów).
- **Scenografia = tam, gdzie realnie trenują persony (rewizja [Ty] 2026-07-16 — garaż WYPADA jako motyw wiodący):** trzy scenerie: (1) **współczesna, zadbana siłownia komercyjna, strefa wolnych ciężarów** — nowe, stonowane stojaki z czarnej stali, ławki, hantle, świeża gumowa podłoga; kadruj CIASNO na osobę i żelazo (szeroki kadr sali z maszynami i lustrami psuje grade i robi stock); (2) **dom = kącik w mieszkaniu** — ławka/hantle przy oknie, zwykły pokój, nie garaż; (3) **masa ciała = park street workout albo drążek w domu** — bardzo polska, autentyczna sceneria, świetna w naturalnym świetle. Wspólny mianownik: ciepłe światło (okno, wieczorne, tungsten), faktury stali i gumy. Nie: szklane premium-kluby, neony/LED-y, morze maszyn, lustra z podświetleniem ani retro/zaniedbane wnętrze.
- **Zero tekstu, logo i oznaczeń wagi obciążenia w kadrze** (typografia wchodzi later w designie okładki): talerze, hantle i sprzęt są gładkie, bez liczb, jednostek, grawerów i czytelnych symboli.

## 2. Master prompt (EN — Midjourney / Imagen / Flux itp.)

```
analog film photograph, 35mm, visible fine grain, warm evening sunlight through large windows,
naturally attractive and charismatic adult athlete with expressive features, athletic healthy appearance and realistic skin texture,
candid mid-movement in a clean, contemporary commercial gym with new premium free-weight equipment,
modern matte-black steel racks, fresh rubber flooring, neatly organized dumbbells and plates, subtle contemporary architecture,
tight framing on subject and iron, subject looking away from camera and absorbed in training, unguarded moment,
muted warm palette — terracotta, cream, warm black — gently desaturated tones,
cinematic but honest documentary sports photography, slight natural motion blur,
tactile new steel, rubber and fabric textures, authentic 1970s film stock feel applied to a present-day setting,
all weight plates and equipment are plain and unmarked: no visible weight numbers, units, labels, engravings, logos, lettering or readable symbols,
no text, no watermark, no neon, no LED-lit mirrors, no influencer-style posing,
no retro gym equipment, no vintage interior, no gritty abandoned-gym aesthetic, no excessive beauty retouching
--ar 4:5 --style raw
```

### Wariant: naturalne spojrzenie w obiektyw

Zostaw cały master prompt, a linię o wzroku podmień na:

```text
tight framing on subject and iron, subject makes brief natural eye contact with the camera while training, confident, magnetic and unforced expression, never posed,
```

Stosuj oszczędnie (np. hero, pierwsza karta karuzeli lub jedno z kilku ujęć w serii). Reszta serii powinna zachować wariant dokumentalny bez kontaktu wzrokowego.

Warianty scenerii (podmieniaj frazę o miejscu): dom → `in a bright apartment corner with a bench and dumbbells near a window`; masa ciała → `at an outdoor street workout park, steel bars, golden hour` lub `at a doorway pull-up bar in an apartment`.

**Negative / unikać:** `neon, HDR, oversharpened, studio flash, bodybuilder posing, influencer posing, exaggerated beauty retouching, glass luxury gym, retro gym equipment, vintage interior, abandoned gym, duotone, blue tones, watermark, text, logo, visible weight numbers, weight units, labels, engravings, readable symbols on plates or dumbbells`

**Spójność serii (najważniejsze!):** wybierz 1 najlepsze ujęcie jako **style anchor** i generuj resztę z `--sref <url>` + stały `--seed` (Midjourney) albo image-prompt/style-reference w innych narzędziach. Ta sama „rolka filmu" dla wszystkich 15 okładek: identyczne ziarno, temperatura światła, gęstość cieni. Ostatnie zdjęcie ma pasować do pierwszego.

## 3. Motywy okładek — matryca 15 programów

Zasada systemu: **4 scenerie (środowisko) × intensywność przez kadr i ciężar rekwizytu (poziom)**, nie 13 losowych zdjęć. Beginner = szerszy kadr, spokojny moment (przygotowanie, chwyt); advanced = ciaśniejszy kadr, moment wysiłku (mid-rep, napięcie).

| Program | Motyw (dopisz do master prompta) |
|---|---|
| Beginner · Gym FBW 2× | `wide shot, person setting up light dumbbells on a rack, calm preparation moment` |
| Beginner · Gym FBW 3× | `wide shot, person stepping toward a squat rack with empty barbell, morning window light` |
| Beginner · Hantle FBW 3× | `person seated on flat bench at home, picking up a pair of small dumbbells` |
| Beginner · Masa ciała FBW 3× | `person reaching up to grip a doorway pull-up bar at home, feet still on floor` |
| Beginner · Dom FBW 2× | `living room corner with yoga mat and two dumbbells, person kneeling to start` |
| Intermediate · Gym Upper/Lower | `medium shot, mid dumbbell row on bench, free weights area, focused, gym window light` |
| Intermediate · Hantle Upper/Lower | `medium shot, mid goblet squat with single dumbbell, apartment corner near window` |
| Intermediate · Masa ciała FBW 3× | `medium shot, mid pull-up at outdoor street workout park, chin approaching bar, golden hour` |
| Advanced · Gym PPL | `tight shot, mid heavy barbell bench press, spotter hands barely visible, chalk dust` |
| Advanced · Masa ciała U/L 4× | `tight shot, mid weighted pull-up with plate on belt at street workout park, strained` |
| Advanced · Dom U/L 4× | `tight shot, mid heavy single-arm dumbbell press in apartment, sweat, warm evening light` |
| Autorski · Siłownia FBW 2× | `medium shot, chalked hands gripping loaded barbell on floor, moment before the pull` |
| Autorski · Dom z hantlami FBW 2× | `medium shot, adjustable dumbbells and bench in apartment corner, person tightening collar` |
| Początkujący–średniozaawansowany · Siłownia · Pośladki i nogi | `medium shot, woman mid controlled barbell hip thrust on a clean gym bench, strong lower-body focus, warm side light` |
| Początkujący–średniozaawansowany · Dom z hantlami · Pośladki i nogi | `medium shot, woman mid Bulgarian split squat with dumbbells beside a bench in a bright apartment corner` |

Rotuj płeć/sylwetki między okładkami (żeby biblioteka nie wyglądała jak katalog jednego modela); w beginner-slotach częściej Kasia — to jej rampa.

## 4. Parametry techniczne pod design okładki

- **Format generacji: 4:5 pion** (kadruje się i do karty poziomej, i do E6); generuj w najwyższej rozdzielczości, docelowo eksport ≤200 KB AVIF/WebP (wzorzec z checklisty landingu).
- **Safe zone:** dolna 1/3 kadru spokojniejsza tonalnie (tam siada Gambarino z nazwą programu + metadane rytm/czas/sprzęt — wzorzec NTC) — dodaj do prompta `lower third of frame calm and dark, negative space at bottom` gdy motyw na to pozwala; alternatywnie design radzi sobie scrimem.
- **Ziarno wypiekane w pliku**, nie CSS-overlay (zasada z landing-briefu — noise na UI to brud, nie klimat).
- Hosting: Supabase Storage obok obrazków ćwiczeń (self-host, zero link-rotu).

## 5. Landing (3 ujęcia — priorytet przed okładkami)

1. **Hero:** master prompt bez zmian (osoba przy wolnych ciężarach, zwykła siłownia, ciepłe światło) — `--ar 3:2`.
2. **Sekcja ekipy:** `two friends mid fist-bump between sets, free weights area of an ordinary gym, one seated on bench, warm evening light, candid laughter` — `--ar 3:2`.
3. **Founder's note:** realne Twoje zdjęcie (autentyzm > generacja — to sekcja o zaufaniu); ewentualnie sesja telefonem wg zasad §1.

## 6. Workflow [Ty]

1. Wygeneruj 6–10 kandydatów na hero landingu → wybierz style anchor.
2. Z anchora (`--sref`/seed) → 3 ujęcia landingu → dopiero potem seria 15 okładek (batching: jedna sceneria na raz).
3. Grading finalny w jednym miejscu (Lightroom/preset albo spójny prompt) — nie mieszaj „poprawek per zdjęcie".
4. Nazewnictwo plików pod przyszły seed: `cover-{level}-{env}-{cycle}.avif` (np. `cover-beginner-gym-fbw3.avif`).
