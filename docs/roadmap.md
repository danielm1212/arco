# Arco — roadmapa produktu

**Aktualizacja:** 2026-07-21

Roadmapa opisuje kolejność i bramki. Konkretne zadania i statusy są w `plan-sprintow-2026-07.md`.

## Cel

Arco ma być najprostszym sposobem na konsekwentny trening siłowy: szybkie logowanie, zrozumiałe prowadzenie progresji i kameralne wsparcie ludzi, których użytkownik już zna.

## Metryka północna i guardraile

**North Star:** liczba użytkowników, którzy realizują własny cel tygodniowy w minimum 3 z 4
ostatnich pełnych tygodni. Łączy regularność, dopasowanie planu i realne użycie loggera, nie
nagradza pustych otwarć aplikacji.

**Metryki prowadzące:** pierwszy niepusty trening w 7 dni od konfiguracji, drugi trening w
14 dni, aktywność w trzecim tygodniu, zrozumienie guidance, żywa Ekipa i zakup po trialu.

**Guardraile:** zero utraty/pomieszania danych, zero S4 w rdzeniu, brak naruszeń prywatności,
brak wzrostu wymuszonego presją oraz support P0/P1 rozwiązany przed kolejną funkcją.

## Zasady kolejności

- Najpierw stabilny rdzeń i potwierdzona użyteczność.
- Potem bezpieczeństwo danych i publiczne konta.
- Monetyzacja oraz publiczna Ekipa dopiero po przejściu właściwych bramek.
- PWA służy do walidacji i pierwszej płatnej bety; sklep nie uzasadnia przepisywania produktu
  przed PAY-1, chyba że dane terenowe pokażą, że PWA blokuje rdzeń.
- Nie budujemy rozbudowanego socialu ani AI-programowania.

## Horyzont 0 — stabilny produkt testowy

**Status:** zamykanie bramki przed H2.

Zakres zrealizowany: logger, programy, historia, postępy, ciało, offline/PWA, edycja przeszłości, trening po fakcie, Ekipy na kontach testowych, automatyczna jakość.

Do zamknięcia zgodnie z aktualnym planem:

- Q1: regresja konta/PWA i bezpieczeństwo widocznych materiałów ćwiczeń;
- CORE-0: prawidłowa zakończona seria, kanoniczne jednostki, wspólne fakty i odporny outbox;
- PLAN-Q, R2.2, R4, CORE-1, R3b, R5b i R6: zweryfikowana biblioteka 15 programów, Plany,
  Sesja/Historia, minimalny wiarygodny silnik, Ekipa, dostępność i przygotowanie badania;
- regresja bottom sheetów i PWA na urządzeniach,
- pełna dostępność własnego dialogu,
- backup i udowodnione odtworzenie,
- aktualizacje PWA bez starego interfejsu z cache.

**Bramka H0:** Q1, CORE-0, PLAN-Q, R2.2, R4, CORE-1 oraz R3b–R6 zamknięte, zero znanego P0/P1
w głównych flow, serwerowy niezmiennik jednej otwartej sesji, odzyskiwanie szkiców,
polskie wyszukiwanie, macierz urządzeń i udokumentowany restore.

## Horyzont 1 — walidacja laboratoryjna i terenowa

Walidacja ma cztery osobne zadania:

1. H2-U: 5 osób sprawdza użyteczność rdzenia;
2. H2-V: 5–8 regularnie trenujących ocenia wartość i dokładną cenę premium;
3. H2-E: trzy prawdziwe pary sprawdzają Ekipę;
4. H2-F: 8–12 osób używa Arco przez trzy tygodnie prawdziwych treningów.

Laboratorium wykrywa problemy z interfejsem. Pilot terenowy sprawdza powrót do drugiego i
trzeciego treningu, zachowanie PWA w realnych warunkach, wartość guidance oraz jawną rezerwację
płatnej bety po poznaniu ceny.

**Bramka VAL-1:** brak P0/P1 i utraty danych, minimum 4/5 przechodzi rdzeń bez pomocy, kohorta
wraca zgodnie z zamrożoną kartą wyników, a minimum trzy osoby z ICP rezerwują płatną betę.

## Horyzont 2 — publiczne konta i RODO

Publiczny signup, weryfikacja e-mail, reset hasła, wersjonowane zgody, polityka prywatności i regulamin, eksport oraz usunięcie danych, wymóg wieku, limity nadużyć i audyt RLS.

**Bramka PRIV-1:** dwukontowy audyt prywatności, przetestowane usunięcie/eksport i gotowość prawna.

## Horyzont 3 — najmniejszy płatny pion i beta

Po zielonym pilocie wybieramy jedną obietnicę Coach na podstawie zachowania H2-V/H2-F.
Budujemy ją end-to-end, dodajemy uczciwy kontrakt subskrypcji, monitoring, landing, analitykę
po decyzji prawnej i płatną betę dla 10–20 osób. Reverse trial zaczyna się po pierwszym
ukończonym treningu. Dane pozostają własnością użytkownika również po downgrade.

**Bramka PAY-1:** prawdziwy zakup, mierzalny lejek, obsłużone restore/anulowanie/błąd płatności,
możliwość rollbacku oraz brak krytycznych problemów supportowych.

## Horyzont 4 — aplikacja mobilna i sklepy

Po PAY-1 budujemy pion referencyjny i porównujemy Expo/React Native z lokalnie spakowanym
Capacitorem. Obecny Next.js używa dynamicznych tras, cookies i Server Actions, dlatego nie
traktujemy zdalnego WebView ani prostego `server.url` jako produkcyjnej drogi do sklepów.

Domyślną hipotezą jest Expo/React Native ze współdzielonymi typami, domeną, Supabase i testami.
Warstwa widoków powstaje natywnie pionami. Potem przechodzimy TestFlight i Google Play closed
testing, wdrażamy billing sklepowy, restore, deep links, powiadomienie timera, bezpieczną sesję,
account deletion, App Privacy/Data Safety, monitoring i staged rollout.

**Bramka MOBILE-0:** działający pion na iOS i Androidzie, porównanie kosztu i jakości oraz jawna
decyzja technologiczna. **Bramka STORE-1:** instalacja, zakup, restore, anulowanie, aktualizacja
i usunięcie konta przechodzą bez P0/P1, a listing jest zgodny z buildem.

## Horyzont 5 — publiczna Ekipa

Obecną implementację testową wzmacniamy o zgody, ochronę kodów, rate limiting, rotację zaproszeń, ustawienia prywatności i dostarczanie nudge z quiet hours. Następnie trzy tygodnie dogfoodingu na prawdziwych małych grupach.

**Bramka GROW-1:** Ekipy zwiększają regularność lub powroty bez generowania presji, spamu i problemów z prywatnością.

## Horyzont 6 — wzrost i rozszerzenia

Po danych z launchu: recap miesięczny/roczny, karty udostępniania, okładki programów w bibliotece (foto w gradingu Warm; biblioteka = powierzchnia editorial, logger i home bez zdjęć — projekt [Ty]), utrzymanie PWA jako kanału webowego, rozszerzenia mediów ćwiczeń i wersja angielska. Kuracja bezpieczeństwa materiałów widocznych w planach nie czeka na ten horyzont — jest bramką Q1/H2.

Warstwa trenerska wraca do oceny wyłącznie po sygnale z realnego użycia. Publiczny feed, komentarze, DM, marketplace, wearables i dieta pozostają poza roadmapą.
