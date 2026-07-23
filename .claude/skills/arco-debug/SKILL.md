---
name: arco-debug
description: Systematyczna diagnoza w Arco — odtwórz na właściwej powierzchni, dojdź do przyczyny (nie objawu), udowodnij naprawę i zabezpiecz klasę buga. Użyj gdy coś się psuje, gdy zgłoszenie jest niejednoznaczne, przy „nie wiem czemu to nie działa", oraz zanim napiszesz fix na podstawie zgadywania.
---

# Diagnoza w Arco

Blizny: overflow niewidoczny dla lint/build (fieldset `min-content`), sticky header
prześwitujący pas safe-area, iOS-owy `datetime-local` (chromium go nie odtwarza), wyciek
`service_role` do loga. Wspólny mianownik: **objaw ≠ przyczyna, a zielone testy ≠ brak buga.**

## Postawa

Nie zgadujesz. Nie naprawiasz objawu. **Bug bez odtworzenia to bug niezrozumiany** — a fix
napisany „w ciemno" to druga zmiana do zdebugowania. Jeśli nie umiesz odtworzyć, powiedz to
wprost i nie ukrywaj tego naprawą-na-nadzieję.

## 1. Odtwórz na WŁAŚCIWEJ powierzchni

Klasa buga wyznacza narzędzie — zielony `test:unit`/`build` NIE wystarcza dla wielu klas:

- **Dane / kontrakt / RLS** → izolowany lokalny Supabase (`supabase start` + seed), NIGDY prod.
- **Layout / overflow / gęstość** → realna przeglądarka na 320/375/393 px, nie sam CSS „w głowie".
- **PWA / iOS / safe-area / SW** → **telefon**, nie desktop Chromium (lekcja `datetime-local`:
  chromium nie odtwarza natywnych kontrolek iOS; „u mnie na desktopie działa" nic nie znaczy).
- **Regres po deployu** → świeży Service Worker + stary cache, w przeglądarce (nie curl —
  Vercel Security Checkpoint zwraca 403 i daje fałszywy alarm).

Jeśli nie potrafisz odtworzyć na właściwej powierzchni — to jest wynik sam w sobie: zgłoś, że
buga nie da się odtworzyć w dostępnym środowisku (np. iOS-only), i oddaj urządzeniowo [Ty].

## 2. Przyczyna, nie objaw

- **Zmierz, nie zgaduj.** Lekcja fieldsetu: objaw = tekst wychodzi poza ekran; realna przyczyna
  = domyślny `min-inline-size:min-content` na `<fieldset>` (zmierzone: 429 vs 361 px). Fix objawu
  (obcinanie tekstu) zamaskowałby przyczynę i wróciłby przy innym stringu.
- Zawężaj: izoluj/odejmuj, aż zostanie najmniejszy fragment, który reprodukuje. Sprawdzaj
  założenia narzędziem (`getComputedStyle`, zapytanie SQL, log, pomiar), nie pamięcią.

## 3. Napraw u źródła + udowodnij na tej samej powierzchni

Naprawa działa dopiero, gdy pokażesz brak buga **tam, gdzie się reprodukował** — nie „powinno
działać". UI → zrzut/pomiar w przeglądarce; dane → smoke/zapytanie; iOS → potwierdzenie [Ty].

## 4. Rozszerz i zabezpiecz

- **Ten sam wzorzec gdzie indziej?** `grep` po przyczynie (lekcja: sprawdzić wszystkie
  `<fieldset>`; wynieść zduplikowany `before:` do jednego `STICKY_HEADER_SAFE_AREA`). Jeden fix,
  wszystkie wystąpienia.
- **Klasa buga niewidoczna dla bramek?** Dołóż guard (lekcja `test:overflow` — realny CSS buildu
  na wąskim viewportcie łapie to, czego lint/build nie widzą; dołóż też kontrolę negatywną
  dowodzącą, że test faktycznie łapie regresję). Bug iOS-only, którego headless nie odtworzy —
  zaznacz to jawnie w teście/dzienniku, nie udawaj pokrycia.
- **Ujawnił problem systemowy?** Wpis do `koordynacja-agentow.md`, żeby następna sesja nie
  deptała tej samej miny.

## Twarde zasady

- Odtwarzanie danych tylko na lokalnym stacku; prod diagnozuje się przeglądarką, nie curl-em.
- iOS/PWA nie diagnozuje się z desktopu — kończy się to na urządzeniu [Ty].
- `service_role` nigdy w logu, repo ani zrzucie. Jeśli wyciekł — to osobny incydent (rotacja
  klucza), nie „przy okazji".
