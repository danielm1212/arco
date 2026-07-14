# Arco — roadmapa produktu

**Aktualizacja:** 2026-07-14

Roadmapa opisuje kolejność i bramki. Konkretne zadania i statusy są w `plan-sprintow-2026-07.md`.

## Cel

Arco ma być najprostszym sposobem na konsekwentny trening siłowy: szybkie logowanie, zrozumiałe prowadzenie progresji i kameralne wsparcie ludzi, których użytkownik już zna.

## Zasady kolejności

- Najpierw stabilny rdzeń i potwierdzona użyteczność.
- Potem bezpieczeństwo danych i publiczne konta.
- Monetyzacja oraz publiczna Ekipa dopiero po przejściu właściwych bramek.
- Nie budujemy rozbudowanego socialu ani AI-programowania.

## Horyzont 0 — stabilny produkt testowy

**Status:** końcówka.

Zakres zrealizowany: logger, programy, historia, postępy, ciało, offline/PWA, edycja przeszłości, trening po fakcie, Ekipy na kontach testowych, automatyczna jakość.

Do zamknięcia:

- regresja bottom sheetów i PWA na urządzeniach,
- pełna dostępność własnego dialogu,
- backup i udowodnione odtworzenie,
- aktualizacje PWA bez starego interfejsu z cache.

**Bramka H0:** zero blockerów w głównym przepływie i udokumentowany restore.

## Horyzont 1 — walidacja z ludźmi

Testy H2 z 3–5 osobami spoza projektu. Sprawdzamy pierwsze uruchomienie, wybór programu, start treningu, logowanie serii, zakończenie, odnalezienie historii, korektę błędu, pomiar ciała i zrozumienie idei Ekipy.

**Bramka B1:** większość uczestników samodzielnie przechodzi rdzeń bez pomocy, a problemy krytyczne są poprawione i ponownie sprawdzone.

## Horyzont 2 — publiczne konta i RODO

Publiczny signup, weryfikacja e-mail, reset hasła, wersjonowane zgody, polityka prywatności i regulamin, eksport oraz usunięcie danych, wymóg wieku, limity nadużyć i audyt RLS.

**Bramka B2:** dwukontowy audyt prywatności, przetestowane usunięcie/eksport i gotowość prawna.

## Horyzont 3 — cichy launch freemium

Analityka po decyzji prawnej, prosty landing, ESP w UE, Stripe i uczciwy model freemium zgodny z Z1–Z3. Cichy start służy pomiarowi aktywacji i utrzymania, nie maksymalizacji zasięgu.

**Bramka:** mierzymy pełny lejek i potrafimy bezpiecznie wycofać zmianę.

## Horyzont 4 — publiczna Ekipa

Obecną implementację testową wzmacniamy o zgody, ochronę kodów, rate limiting, rotację zaproszeń, ustawienia prywatności i dostarczanie nudge z quiet hours. Następnie trzy tygodnie dogfoodingu na prawdziwych małych grupach.

**Bramka B3:** Ekipy zwiększają regularność lub powroty bez generowania presji, spamu i problemów z prywatnością.

## Horyzont 5 — wzrost i rozszerzenia

Po danych z launchu: recap miesięczny/roczny, karty udostępniania, dopracowanie instalacji PWA, kuracja zdjęć ćwiczeń, ewentualny wrapper sklepowy i wersja angielska.

Warstwa trenerska wraca do oceny wyłącznie po sygnale z realnego użycia. Publiczny feed, komentarze, DM, marketplace, wearables i dieta pozostają poza roadmapą.
