# Landing — brief wykonawczy (po diagnozie prototypu)

> **⚠️ AKTUALIZACJA 2026-07-11 wieczór:** landing ZBUDOWANY przez Claude wg tego briefu → **`../landing/index.html`** (samodzielny folder: HTML + Gambarino woff2 + logo; placeholdery foto art-directed; mockupy UI wierne redesignowi; A/B cen przez `?v=b`; formularz gotowy pod ESP). Framer NIE jest już potrzebny do v1 — ten brief zostaje jako spec (§2 zasady, §4 checklist QA przed publikacją obowiązuje!). Stary prototyp → `archive/`. Hosting: osobny projekt statyczny na Vercel (NIE w `public/` apki — middleware by go zasłonił) albo import do Framera, jeśli [Ty] zechcesz.

> **Data:** 2026-07-11 · **Kontekst:** `docs/landing-prototyp.html` (Claude Code) — werdykt: **copy i architektura = 90% gotowe i dobre; warstwa wizualna = wireframe, nie landing.** Zgodnie z pierwotną decyzją (`landing-plan.md`): budowa docelowa **we Framerze [Ty]**, prototyp służy jako spec copy+IA. Ten brief = wszystko, czego potrzebujesz w Framerze, w jednym pliku.

---

## 1. Diagnoza prototypu (dlaczego wyszedł średnio)

| # | Problem (z kodu) | Dlaczego boli |
|---|---|---|
| D1 | **Zero Gambarino** — hero i nagłówki w tym samym kroju co body (`var(--font)` wszędzie) | Display-typo to podpis marki; bez niego hero = ładny akapit. A font jest już wdrożony w apce! |
| D2 | **Zero fotografii** — `.foto::after {content:"foto analogowe"}` = szary placeholder | Retro-analog bez analogu; cała identyfikacja §1.2 wizji stoi na ziarnie+foto, którego nie ma. **Główny powód „średniości"** |
| D3 | **Ziarno globalne** (fixed overlay, multiply, nad CAŁĄ stroną) | Wbrew dwuwarstwowości: noise na cenniku i formularzu = brud, nie klimat. Ziarno należy do foto i hero, nie do tabel |
| D4 | **Weights 800/900** w nagłówkach | Poza naszym systemem (dwa weighty); krzyczy „szablon z Tailwinda" |
| D5 | **Mockupy telefonu z div-ów** (setrow/tile ręcznie) | Mamy działającą apkę PO redesignie (FlameWeek, biały hero, logger po polish) — prawdziwe screeny biją każdą atrapę |
| D6 | **Dev-notki w UI**: „(prototyp: formularz podłączymy do ESP)", „placeholder — pokazywać od N ≥ 25", widoczny przełącznik cen „A B" | Słuszne jako notatki, ale czynią całość wireframe'em |
| D7 | Emoji zamiast ikon; karty ekip bez charakteru | Spójność: lucide/clay, wzorzec z makiet |

**Co prototyp zrobił DOBRZE (zachować 1:1):** kolejność sekcji zgodna z `landing-plan.md` ✓ · copy w ToV (pains! „Trzeci tydzień »od poniedziałku« sam się nie przerwie" — zostawić) ✓ · pricing z pełnym pakietem wniosków Mobbin (bez karty, cancel-2-tapy, tabela free/Coach, gwarancja ceny 12 mies.) ✓ · consent RODO przy formularzu ✓ · social proof z progiem N≥25 (mądre — pokazywać dopiero od 25 zapisów) ✓ · przygotowany wariant cen A/B ✓.

## 2. Zasady wizualne (Framer)

1. **Typografia:** Gambarino (upload woff2 z `Gambarino_Complete/`) WYŁĄCZNIE nagłówki hero/sekcji + liczba ceny; DM Sans reszta; **dwa weighty** (400/500) + Gambarino swoim ciężarem. Hero h1: duże (clamp 44–72px), interlinia ~0.98, jak w prototypie.
2. **Ziarno:** tylko na fotografiach (wgrane w plik zdjęcia, nie CSS-overlay) + ewentualnie subtelnie na tle SAMEGO hero. Sekcje produktowe/cennik/FAQ = czyste.
3. **Tła:** hero + sekcja ekip + finalne CTA = sand `#F6F2ED` (landing to warstwa momentów — tu sand gra); sekcje filarów/cennika = białe/`#F7F7F7` naprzemiennie. Rytm: moment → produkt → moment.
4. **Screeny apki zamiast atrap:** home z FlameWeek (po treningu, 2–3 zapalone płomienie), karta loggera po polish (hint progresji widoczny), makieta ekipy z rozmowy 2026-07-08. Telefon w prostej ramce, lekko obrócony (−2°), NA foto-tle lub sand.
5. **Foto (3 ujęcia, priorytet):** (a) hero — osoba przy hantlach w domowej/garażowej scenerii, ciepłe światło, ziarno; (b) sekcja ekip — dwie osoby/przybicie; (c) founder's note — Ty. Źródło: własna sesja telefonem w garażu/siłowni (autentyzm > stock!) albo AI-gen wg promptu: *"analog film photo, 35mm grain, warm tungsten light, home gym garage, person mid dumbbell row, muted terracotta and cream tones, candid, motion blur hint, no text"*. Zero stock-fitness z białymi zębami.
6. **Ikony:** lucide (outline) w kolorze ink/terracotta; clay-ikony dopiero gdy powstaną (tor assetów) — nie blokują.
7. Kursywa dev-notek znika: formularz podpinasz do ESP (MailerLite embed/API), social proof ukryty poniżej N=25 (Framer: warunek na CMS-liczbie albo po prostu ukryj do czasu), przełącznik A/B niewidoczny — warianty przez Framer A/B albo osobne strony `/a` `/b` + PostHog.

## 3. Finalne copy per sekcja (poprawione z prototypu — wklejaj 1:1)

**HERO** · h1: „Trenuj. Zapisuj **jednym tapem**. Nie odpuszczaj." („jednym tapem" w terracotcie) · sub: „Polski dziennik siłowy, który prowadzi Cię serię po serii — i pilnuje razem z kumplem." · input e-mail + CTA „Wpisz się na listę" · consent: „Chcę dostawać informacje o starcie i rozwoju Arco. [Polityka prywatności]" · po zapisie: „Sprawdź skrzynkę — potwierdź zapis jednym kliknięciem." · social proof (od N≥25): „Dołącz do {N} czekających".
**PROBLEM** · eyebrow „Znasz to?" · h2 „Trzy powody, dla których dzienniki umierają" · 3 painy jak w prototypie (bez zmian — są świetne).
**FILAR 1 · Zero tarcia** · h2 „Sesja wypełnia się sama" · lead z prototypu + caption „Logger w wersji minimal — na siłowni masz ręce w magnezji, nie w menu." · asset: screen loggera.
**FILAR 2 · Jawne reguły** · h2 „Wie, kiedy dołożyć. I mówi dlaczego." · lead z prototypu (końcówka „Jak kumpel, który zna się na rzeczy — nie jak algorytm, który wie lepiej." — zostaje, jest znakomita) · asset: screen karty Wskazówek/chipa.
**PODY (badge „wkrótce po starcie")** · h2 „Ty i paru kumpli. To wystarczy." · lead z prototypu · asset: makieta ekipy (check-iny + nudge) na foto-tle.
**CENNIK** · h2 „Rdzeń za darmo. Na zawsze." · lead + cena {wariant} + „Pierwsze 21 dni każdy dostaje pełną wersję. Bez karty — nie ma czego zapomnieć anulować." + „Bez zobowiązań. Anuluj kiedy chcesz — dwa tapnięcia w ustawieniach." · tabela free/Coach z prototypu (7 wierszy) · stopka: „Twoje dane nigdy nie znikają — eksport zawsze darmowy." + „Cena startowa — dla listy oczekujących gwarantowana przez 12 miesięcy."
**FOUNDER'S NOTE** *(brakuje w prototypie — dodać, landing-plan §3.7)* · foto + 3 zdania: „Buduję Arco sam, wieczorami, bo własny trening zasługiwał na coś lepszego niż notes. Testuję na sobie każdą serię. Jak coś nie gra — napisz, odpowiadam osobiście." + podpis.
**FAQ** *(brakuje — dodać, 4 pytania z landing-plan §3.8):* Co to PWA („apka z przeglądarki, 2 tapy, bez sklepu") · Kiedy start („okno styczniowe; lista dostaje dostęp pierwsza") · Co z moimi danymi (Z3) · iOS/Android („oba; offline wliczone").
**FOOTER** · polityka prywatności · kontakt · IG · © Arco.

## 4. Checklist QA przed publikacją

Mobile 390 px first (formularz nad zgięciem!) · LCP < 2,5 s (foto hero skompresowane AVIF/WebP ≤ 200 KB) · OG-image (hero-frame z h1) + favicon z `logo/` · PostHog embed + eventy `landing_viewed {variant}` / `waitlist_signup {variant, source}` · UTM-y działają · double opt-in przetestowany na własnym mailu · polityka prywatności podpięta (szablon ESP) · próg social proof N≥25 aktywny · dev-notek ZERO.

## 5. Kolejność pracy [Ty]

1. Assety (wieczór): 2–3 screeny apki (masz świeży redesign!) + 3 foto (sesja telefonem lub AI-gen z §2.5) + Gambarino woff2.
2. Framer (wieczór–dwa): sekcje wg §3 z zasadami §2; ESP + PostHog z §4.
3. Przed publish: checklist §4 + rzut oka od Claude (wrzuć staging-link — zrobię przegląd jak dziś loggera).
