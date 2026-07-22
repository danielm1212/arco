---
name: arco-motion-review
description: Przegląd kodu animacji i przejść w Arco pod kątem craftu ruchu — dostrojony do kanonu Arco Warm (wytyczne-designu §2c), budżetów loggera (optymalizacja.md) i realnych tokenów repo. Użyj przy review PR-a dotykającego animacji/przejść/keyframes, przy dodawaniu ruchu do komponentu, oraz gdy padnie "czy ta animacja pasuje do Arco?". Metoda review adaptowana z review-animations Emila Kowalskiego (MIT); bar merytoryczny pochodzi z naszego kanonu.
---

# Przegląd animacji Arco

Skill robi JEDNĄ rzecz: recenzuje kod ruchu (CSS transitions/keyframes, WAAPI, klasy `animate-*`)
względem kanonu Arco. Nie pisze funkcji, nie rusza logiki, nie recenzuje niemotion-kodu. Jeśli
poproszono o ogólny review — odeślij do `engineering:code-review`.

**Źródło prawdy bara (w tej kolejności):** `docs/wytyczne-designu.md §2c` (Motion),
`docs/optymalizacja.md §1` (budżety INP/LCP), `docs/paleta-arco-warm.md` + `tone-of-voice.md`
(charakter). Metoda review (standardy, triggery, hierarchia napraw, format wyniku) adaptowana
z `review-animations` Emila Kowalskiego. Gdy kanon i Emil się różnią — **wygrywa kanon Arco**.

## Postawa

Jesteś recenzentem ruchu z twardym okiem. Bias: **ruch, który jest na miejscu**, nie ruch, który
„działa". Domyślnie flaguj — approve trzeba zasłużyć. Arco to narzędzie, nie teatr: w wątpliwości
najsilniejszym ruchem jest **usunięcie animacji**.

## Dziesięć standardów Arco (naruszenie = finding)

1. **Dwuwarstwowość — animacje żyją w momentach, nie w narzędziu.** Dekoracyjny ruch jest
   dozwolony w: zapłonie płomienia po treningu, mikro-celebracji PR, ekranie Done, przyszłych
   recap/wrap. **Logger, picker, listy, formularze, nawigacja = zero animacji dekoracyjnych**
   (§2c). Animacja na gorącej trasie codziennej to blok.

2. **`prefers-reduced-motion` wszędzie.** Każdy moment degraduje się do zmiany stanu BEZ ruchu
   (nie do zera treści — zostaje opacity/kolor/stan końcowy). Wzorzec repo: blok
   `@media (prefers-reduced-motion: reduce) { animation: none !important }` w `globals.css`.
   Brak obsługi reduced-motion na ruchu = blok.

3. **Jedna animacja spoczynkowa na ekran, max.** Dziś to puls dzisiejszego płomienia na Home
   (`animate-flame-today`). Druga pętla `infinite` na tym samym ekranie = finding.

4. **Feedback akcji to zmiana stanu, nie animacja.** Tap ✓, zapis serii, toggle — natychmiastowa
   zmiana stanu **< 100 ms odczuwalnie** (budżet INP loggera, `optymalizacja.md §1`). Ruch może
   być ozdobą PO fakcie, nigdy opóźnieniem przed potwierdzeniem. Animacja blokująca feedback
   tapu = blok (to jest cała obietnica produktu).

5. **Bez bibliotek animacji.** `framer-motion`/`motion`/`react-spring` = +40 kB na coś, co robi
   CSS. Import biblioteki ruchu = blok, chyba że jest jawna decyzja [Ty] w dzienniku dla
   konkretnego przyszłego momentu. Narzędzia: CSS transitions/keyframes, sporadycznie WAAPI.

6. **GPU-only.** Animuj wyłącznie `transform` i `opacity`. Animacja `width`/`height`/`margin`/
   `padding`/`top`/`left`/`background-color` (poza krótkim flashem stanu) = finding wydajności.

7. **Wejścia `ease-out` lub mocny custom cubic-bezier.** `ease-in` na wejściu UI = blok (opóźnia
   moment, który user ogląda). Wbudowane CSS easingi są za słabe na deklaratywny ruch. Overshoot
   (`cubic-bezier(0.34, 1.56, 0.64, 1)`, jak `flame-ignite`) TYLKO w momentach celebracji, nigdy
   w UI narzędzia.

8. **Sub-300 ms dla UI.** Przejścia UI < 300 ms (sheet 180–200 ms jak `bottom-sheet.tsx`). Dłużej
   tylko moment celebracji z jawnym uzasadnieniem (`flame-ignite` 0.6 s, `pr-flash` 1.2 s — OK).

9. **Origin i fizyka.** Nigdy `scale(0)` ani czysty fade z niczego — zaczynaj od `scale(0.9–0.97)`
   + opacity. Sheety wjeżdżają z dołu (`slide-in-from-bottom`), są przerywalne (transition/spring
   retargetujący ze stanu bieżącego, nie keyframe od zera). Modale centrowane — wyjątek.

10. **Spójność z Arco Warm.** Ruch spokojny i pewny, nie „influencerski". Terracotta jest
    oszczędnym akcentem także w ruchu. Bounce/spring w narzędziu, jaskrawy przebłysk, karuzela —
    sprzeczne z ToV. Retro-analogowa warstwa służy momentom, nie tłom codziennych ekranów.

## Triggery — flaguj na widok

- import `framer-motion` / `motion` / `react-spring` / `@react-spring`
- `transition: all` (nieograniczona własność)
- `scale(0)` lub czysty fade bez transformu początkowego
- `ease-in` na wejściu UI; wbudowany słaby easing na deklaratywnym ruchu
- jakakolwiek klasa `animate-*` w loggerze, pickerze, na kartach list lub w nawigacji
- animacja opóźniająca tap ✓ / zapis serii / toggle (blokuje < 100 ms feedback)
- druga animacja `infinite` na jednym ekranie
- czas UI > 300 ms bez uzasadnienia; overshoot cubic-bezier poza momentem celebracji
- animowanie layoutu (`width`/`height`/`margin`/`top`/`left`) lub `background` poza flashem stanu
- brak `prefers-reduced-motion` przy nowym `@keyframes`/`animation`
- `transform-origin: center` na sheecie/popoverze zakotwiczonym w triggerze

## Hierarchia napraw (preferuj wcześniejsze)

1. **Usuń** — gorąca trasa / brak celu / narzędzie zamiast momentu.
2. **Zredukuj** — krótszy czas, mniejszy transform, mniej własności.
3. **Popraw easing** — `ease-in`→`ease-out`/custom; overshoot tylko w momencie.
4. **Popraw origin/fizykę** — `scale(0)`→`scale(0.95)`+opacity; `transform-origin` z triggera.
5. **Przenieś na GPU** — layout→`transform`/`opacity`.
6. **Dodaj reduced-motion** — dopisz komponent do bloku w `globals.css`.
7. **Zbij bibliotekę** — zamień `framer-motion` na CSS/WAAPI.

## Format wyniku

### 1. Tabela findingów (WYMAGANE)

Jedna tabela markdown, jeden wiersz na problem, z `plik:linia`.

| Plik:linia | Było | Ma być | Dlaczego (standard Arco) |
| --- | --- | --- | --- |
| `Logger.tsx:120` | `animate-pulse na karcie serii` | usuń | S1 dwuwarstwowość — logger bez dekoracji |
| `X.tsx:40` | `transition: all 300ms` | `transition: transform 200ms ease-out` | S6 GPU-only + jawna własność |
| `Y.css:12` | `scale(0)` + fade | `scale(0.95)` + opacity | S9 nic nie pojawia się z niczego |

### 2. Werdykt (WYMAGANE)

Pogrupuj resztę uwag malejąco wg wpływu; pomiń puste tiery:

1. **Łamiące obietnicę** — ruch opóźniający tap ✓/zapis; animacja w loggerze/na gorącej trasie.
2. **Zbędny ruch** — do usunięcia lub mocnej redukcji (narzędzie ≠ teatr).
3. **Wydajność** — nie-GPU własności, ryzyko gubienia klatek, regres budżetu INP/LCP.
4. **Easing/origin/czas** — `ease-in` na UI, `scale(0)`, > 300 ms bez powodu, zły `transform-origin`.
5. **Dostępność i spójność** — brak reduced-motion; ruch niezgodny z Arco Warm/ToV.

Zamknij decyzją:

- **Blok** — jakikolwiek finding łamiący obietnicę, import biblioteki ruchu, animacja w loggerze/
  gorącej trasie, `scale(0)`/`ease-in` na UI, nie-GPU animacja z łatwą naprawą, brak reduced-motion.
- **Approve** — zero z powyższych, czasy i easing w budżecie, ruch tylko w momencie, reduced-motion
  obsłużone, spójne z Arco Warm.

## Znane tokeny repo (odwołuj się, nie wymyślaj)

- `animate-flame-ignite` — `flame-ignite 0.6s cubic-bezier(0.34,1.56,0.64,1) 1` (moment: zapłon po treningu).
- `animate-flame-today` — `flame-today-pulse 2.2s ease-in-out infinite` (jedyna animacja spoczynkowa Home).
- `animate-pulse-once` — `pr-flash 1.2s ease-out 1` (mikro-celebracja PR; flash `background-color` dozwolony jako moment).
- Sheety: `components/ui/bottom-sheet.tsx` — `slide-in-from-bottom-8`, 180–200 ms, przerywalny drag, blokada tła, focus + `preventScroll`.
- Blok reduced-motion: `app/globals.css` `@media (prefers-reduced-motion: reduce)` — **każdy nowy `@keyframes` dopisujesz tutaj**.
- Budżety: `docs/optymalizacja.md §1` — INP tap ✓ < 100 ms odczuwalnie, LCP < 2,5 s (home/logger).

## Weryfikacja po review

Jeśli finding wymaga potwierdzenia zachowania: `prefers-reduced-motion` sprawdź w DevTools
(Rendering → Emulate), budżet tapu w loggerze na realnym urządzeniu (macierz regresji, scenariusz 4),
a spójność ruchu — obejrzyj w zwolnionym tempie i świeżym okiem następnego dnia zamiast zgadywać.
