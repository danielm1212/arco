# Ekipa — blueprint wdrożeniowy (dev-v0 → funkcja jakości Arco)

> **Status:** dev-v0 wdrożone i lokalnie zweryfikowane 2026-07-13. Dokument pozostaje kontraktem jakości przed publicznym Krokiem 4; nie oznacza gotowości do produkcji.
>
> **Cel dev-v0:** przejść z dwoma lokalnymi kontami cały uczciwy cykl: utworzenie → zaproszenie → dołączenie ze świadomą zgodą → trening → check-in → reakcja/nudge widoczne dla odbiorcy → wyjście. Bez publicznego signupu i bez produkcyjnego deployu.

## 1. Zasada produktu

Ekipa nie jest feedem. To prywatna, mała warstwa accountability: użytkownik widzi **kto trenował**, może dać jeden sygnał wsparcia albo — gdy komuś realnie grozi niewyrobienie celu — subtelnie szturchnąć. Nigdy nie pokazujemy ćwiczeń, ciężarów, zdjęć, komentarzy ani rankingu.

**Test prostoty:** po wejściu na ekran użytkownik w 2–3 sekundy rozumie: „kto z moich ludzi był aktywny i czy mogę komuś pomóc”.

## 2. Zakresy i granice

| Warstwa | Dev-v0 (teraz) | Dopiero przed publicznym użyciem |
|---|---|---|
| Konta | ręcznie bootstrappowane konta lokalne | signup, weryfikacja e-mail, reset hasła, rate limit |
| Prywatność | jawne potwierdzenie przy stworzeniu/dołączeniu; RLS testowane na 2 kontach | rejestr zgód, eksport/usunięcie RODO, regulamin i polityka prywatności |
| Widoczność | dzień check-inu, postęp tygodnia, passa, emoji-reakcje, nudge w skrzynce | push/e-mail, quiet hours, digest niedzielny |
| Zaproszenie | długi jednorazowy kod, copy + kopiowanie | share sheet, link/QR, rotacja, rate limit |
| Administracja | opuszczenie, usunięcie przez twórcę, zmiana nazwy | pełne logowanie audytowe i obsługa konfliktów |

Nudge bez widocznego odbiorcy jest „fałszywym przyciskiem”. Dev-v0 zapisuje go w skrzynce odbiorcy, zanim dojdą push i e-mail.

## 3. Kontrakt danych i bezpieczeństwa

### Dane minimalne

- `pods`, `pod_members`: relacja grupy, rola twórcy, data dołączenia i świadoma zgoda.
- `team_profile`: wyłącznie **jawna** nazwa wyświetlana i avatar z whitelisty emoji; nigdy fallback z e-maila.
- `activity_events`: `workout_done`, lokalny dzień, snapshot passy; event powstaje tylko, gdy użytkownik ma aktywne członkostwo z zgodą.
- `reactions`: maksymalnie jedna reakcja użytkownika na event; lista emoji zamknięta.
- `nudges` + `inbox_items`: jeden nudge na parę/dzień; odbiorca widzi go po otwarciu aplikacji.

### Twarde inwarianty

1. Nowy członek nie widzi check-inów sprzed swojego dołączenia.
2. Były członek traci dostęp natychmiast.
3. Osoby z różnych ekip nie widzą się nawet przy ręcznie poznanym ID.
4. Jedyny most `sessions → activity_events` emituje fakt ukończenia treningu, nigdy jego log.
5. Zaproszenie nie daje dostępu bez świadomego potwierdzenia widoczności aktywności.
6. Reguła nudge działa na serwerze: ≥3 dni ciszy **i** zagrożony cel tygodniowy; klient tylko pokazuje wynik.

### Weryfikacja RLS

Test trzech lokalnych kont: A i B w Ekipie 1, C poza nią. A widzi B; C nie widzi ani grupy, ani eventów, ani reakcji. Po wyjściu B z Ekipy 1 A natychmiast traci widok B. Każdy przypadek sprawdzamy zarówno przez aplikację, jak i zapytanie klientem zalogowanym jako dane konto.

**Wynik 2026-07-13:** `npm run smoke:team` przeszedł lokalnie. Test tworzy i po sobie usuwa trzy tymczasowe konta; sprawdza tworzenie/dołączanie, RLS, brak dostępu do tabeli `sessions`, emisję check-inu wyłącznie przez ukończoną sesję, reakcję i wyjście z ekipy.

## 4. Przepływy UX

### A. Brak ekipy

Jedna karta, bez technicznego „kodu” na pierwszym planie:

> **Zbierz ekipę.**
> Paru znajomych. Widzicie tylko: kto był i kto ciągnie serię.

CTA główne: „Załóż ekipę”. Drugorzędne: „Mam kod zaproszenia”. Po utworzeniu od razu pokazujemy gotowe zaproszenie, a nie pusty dashboard.

### B. Utworzenie / dołączenie

1. Nazwa opcjonalna, domyślnie „Ekipa {imię}”.
2. Wybór emoji-awataru i nazwy widocznej dla ekipy.
3. Jedno jasne potwierdzenie: „Członkowie zobaczą tylko, czy trenowałeś danego dnia oraz Twoją passę. Nie zobaczą ćwiczeń ani ciężarów.”
4. Dopiero potem zapis członkostwa.

### C. Ekran Ekipy

- Nagłówek: nazwa + liczba osób + akcja zaproszenia.
- Jedna karta na członka: avatar, imię, postęp `2/3 w tym tygodniu`, passa, ostatni spokojny status.
- Tap na członka otwiera sheet z reakcją albo, gdy warunki są spełnione, nudge. Nie wciskamy czterech emoji i osobnego CTA do jednego wiersza listy.
- „Ostatnio” to krótka lista 5–7 faktów, nie scrollowany feed.
- Ustawienia na dole: nazwa, kod, wyjście; twórca dodatkowo usuwa członka.

### D. Home

Karta pod guidance jest cicha: 2–4 awatary, jeden highlight i link. Gdy brak ekipy, jest zaproszeniem do wartości — nie martwym elementem nawigacji. Stan „aktywny” oznacza ostatnie 48 h, nie „kiedykolwiek”.

### E. Język i ruch

Przyjacielski, nigdy zawstydzający: „Radek trenował dziś” / „Szturchnij” zamiast „Radek zalega”. Interfejs jest minimalny; Gambarino i celebracja tylko przy dołączeniu lub pierwszym check-inie widzianym przez ekipę. Wszystkie touch targety min. 44 px, a animacje respektują `prefers-reduced-motion`.

## 5. Plan korekt kodu

1. Zastąpić automatyczne `consented_at` flowem jawnej zgody; odseparować publiczną nazwę i emoji od e-maila.
2. Przenieść emisję check-inu do kontrolowanej funkcji serwerowej: tylko członek ze zgodą, lokalny dzień sesji, obliczona passa.
3. Rozszerzyć overview o postęp/reakcje/ostatnie zdarzenia oraz serwerowy wynik `can_nudge`.
4. Dodać skrzynkę nudge oraz usuwanie członka/edycję nazwy przez twórcę.
5. Przebudować UI do układu karta → sheet akcji; dodać wszystkie stany puste, loading i błędu.
6. Dopiero po RLS matrix: test telefonu i kontrola kontrastu/klawiatury/czytnika.

## 6. Definition of Done dev-v0

- Build, lint i migracje przechodzą.
- Dwa konta wykonują pełny happy path, trzecie konto nie ma dostępu.
- Każda akcja ma widoczny rezultat, loading i zrozumiały błąd.
- Nie ma danych treningowych, e-maili ani dowolnego tekstu w powierzchni Ekipy.
- Ekran 320–430 px nie ma poziomego scrolla ani ciasnych akcji.
- Kod i dokumentacja jawnie odróżniają dev-v0 od publicznego Kroku 4.
