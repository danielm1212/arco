# Nazwa funkcji „pody" — analiza i rekomendacja

> **✅ DECYZJA [Ty] (2026-07-12): EKIPA.** Sweep rename po docs/landingu wykonuje Claude Code (prompt w HANDOFF/od właściciela). Konwencja: PL „ekipa" w całym UI/copy/marketingu; techniczne EN `pods/pod_members` w schemacie DB zostają.
> **Data:** 2026-07-12 · **Impuls [Ty]:** „pody mi w ogóle nie siedzą". Słusznie — patrz §1.
> **Co nazywamy:** prywatna grupa Ty + 1–3 znajomych; widzą wyłącznie check-in („trenował dziś") i passę tygodni; reakcje 💪 i nudge „X przypomina Ci o treningu". Kameralne, pozytywne, anty-feed. Silnik wzrostu z wizji v2 §4.

## 1. Dlaczego „pod" nie działa (diagnoza)

1. **Kolizja z przyimkiem** — „pod" to jedno z najczęstszych słów polszczyzny; „w podzie", „do poda", „Radek z Twojego poda" czyta się jak błąd składu. Każde zdanie UI walczy z gramatyką.
2. **Kalka bez znaczenia** — ang. pod (stado orek / strąk / kapsuła). Dla Pawła obcy żargon, dla Kasi nic. Wymaga tłumaczenia = zły znak dla nazwy rdzenia pętli wzrostu (zaproszenie musi być zrozumiałe w 1 s, bo to wiadomość od kumpla, nie onboarding).
3. Fonetycznie mikre; liczba mnoga „pody" myli się z „pody" (jak „poddasza"?) — brak naturalnego wołacza marketingowego.

## 2. Kryteria (z ToV + roli funkcji)

Polskie lub naturalnie spolszczone · deklinacja bez bólu we WSZYSTKICH kluczowych copy (zaproszenie, check-in, nudge, pusty stan, ustawienia) · niesie „mała grupa swoich ludzi do treningu" · ton kumpla (nie korpo-„zespół", nie harcerskie) · inkluzywne (Kasia i Paweł) · nie ogranicza liczebności · bez kolizji z markami fitness PL · krótkie.

## 3. Kandydaci

| Nazwa | Copy-test: „Radek z Twojej/go ___ przypomina Ci o treningu" | Plusy | Minusy | Ocena |
|---|---|---|---|---|
| **Ekipa** | „…z Twojej ekipy" ✓ | żywy język siłowni („ekipa z siłki"), deklinacja idealna, inkluzywne, skaluje się, marketingowy wołacz („Zbierz ekipę!") | dość generyczne (ale zero bariery zrozumienia) | 🥇 |
| **Paczka** | „…z Twojej paczki" ✓ | idiom „paczka znajomych" = dokładnie 2–4 swoich ludzi; ciepłe, kameralne | „dodaj do paczki" ociera się o przesyłki/e-commerce; w naszym żargonie dev „paczka"=work package (kolizja tylko wewnętrzna) | 🥈 |
| **Skład** | „…z Twojego składu" ✓ | sportowe („skład na mecz"), zadziorne, krótkie | boiskowo-męskie — słabiej u Kasi; „skład" = też magazyn | 🥉 |
| Załoga | „…z Twojej załogi" ✓ | wspólnotowe, ciepłe | lekko harcersko-morskie, mniej siłowniane | — |
| Krąg | „…z Twojego kręgu" ✓ | kameralne | ezoteryczno-Google+Circles vibe; blade | — |
| Brygada / Wataha / Stado | ✓ | charakterne | żartobliwo-ciężkie / agresywne — łamią ToV | ✗ |
| Duet / Trójka | — | konkretne | ograniczają liczebność strukturalnie | ✗ |
| (metafora, nie nazwa) Asekuracja/spotter | — | koncepcyjnie PIĘKNE: spotter przy ławce = dokładnie rola funkcji | za długie/techniczne jako nazwa; **zachować jako język copy** („kumple od asekuracji") | 💡 |

## 4. Rekomendacja: **EKIPA**

Jedyny kandydat bez żadnej pułapki: język, którym trenujący MÓWIĄ („moja ekipa", „ekipa z siłki"), perfekcyjna odmiana, działa u obu person i w każdym copy:
- Zaproszenie: „**Radek zaprasza Cię do swojej ekipy** — trenujcie razem, pilnujcie się nawzajem."
- Check-in: „Radek z Twojej ekipy trenował dziś — 6. tydzień 🔥"
- Pusty stan: „**Zbierz ekipę.** 1–3 znajomych. Widzicie tylko: kto był i kto ciągnie serię."
- Landing (sekcja podów → ekipy): „Ty i paru kumpli. To wystarczy." — zostaje, tylko nagłówek karty „Twoja ekipa".
- Metafora-wsparcie w copy głębszym: asekuracja/spotter („ekipa Cię asekuruje").

## 5. Zakres zmiany nazwy (po decyzji [Ty])

- **Docs (sweep ~15 plików):** wizja v2 §4 (+§ nazewnictwo), projekt-schematu (nazwy tabel ZOSTAJĄ techniczne `pods/pod_members` — angielski w schemacie DB to norma; zmienia się TYLKO warstwa PL), scenariusz-h2 (moduł C), concierge-test, strategia/dystrybucja/landing/ToV/baza IG, roadmap, CLAUDE.md.
- **Landing:** nagłówek karty + 2 wystąpienia.
- **Kod:** dziś ZERO (pody nie są zbudowane — dlatego to najtańszy moment na rename w historii projektu).
- Konwencja: PL „ekipa" w całym UI/copy/marketingu; EN „pod" może zostać w nazwach technicznych (tabele, typy) — bez wpływu na userów.

~~**Decyzja [Ty]:** Ekipa / Paczka / Skład / zostajemy przy Pody?~~ → **EKIPA** (2026-07-12).
