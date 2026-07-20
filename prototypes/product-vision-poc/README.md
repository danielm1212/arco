# Arco Product Vision POC

**Status:** klikalny artefakt decyzyjny, nie kod produkcyjny
**Aktualizacja:** 2026-07-20

## Cel

Prototyp pokazuje spójny kręgosłup produktu po rebaselinie dokumentacji. Łączy decyzje
z R2.2, R3b, R4 i R6 w jednym mobilnym przepływie, zanim powstaną osobne zadania
implementacyjne.

## Jak uruchomić

Otwórz `index.html` przez lokalny serwer statyczny. Prototyp nie wymaga instalowania paczek,
bazy ani konta testowego.

## Przepływy do oceny

1. Home: cel `0/2`, Dziś i Plany, jeden główny CTA oraz jawny trening własny.
2. Logger: prowadzenie pierwszej serii, podświetlenie `Zalicz serię`, timer, sticky header,
   minimalizacja i mini-bar.
3. Zakończenie: osobne zabezpieczenia pustej, brudnej i częściowej sesji.
4. Własny trening: świadomy start, dodanie ćwiczenia, zapis wyniku oraz zapis jako program
   po treningu i z Historii.
5. Biblioteka: sprzęt jako działający filtr, wyniki przed dodatkowymi filtrami i własny program.
6. Historia: trening po fakcie bez ponownej celebracji i edycja istniejących danych.
7. Postępy: lokalna sekcja Ciało zamiast osobnej pozycji globalnej.
8. Ekipa: kod 8 znaków, wiele ekip, nieprzeczytany stan i jawne granice prywatności.

Przycisk `Stan POC` przełącza najważniejsze stany bez wykonywania całej ścieżki. Na ekranach
do 360 px jest ukryty, żeby nie zaburzał oceny produktu.

## Co prototyp rozstrzyga

- Historia treningów nie steruje onboardingiem.
- Cel tygodniowy rośnie dopiero po ukończeniu treningu, nie po wpisaniu serii.
- Trening własny nie zmienia aktywnego planu ani rotacji.
- Zapis jako program tworzy nieaktywny program, a ciężary zostają w Historii.
- Sprzęt filtruje bibliotekę planów w miejscu, w którym użytkownik podejmuje decyzję.
- Ekipa pokazuje obecność i regularność, ale nie ciężary, notatki ani zdjęcia.
- Pełnoekranowa celebracja dotyczy świeżo zakończonego treningu. Backfill dostaje tylko
  delikatne potwierdzenie.

## Czego prototyp nie udaje

- Nie zapisuje danych po odświeżeniu.
- Nie łączy się z Supabase i nie sprawdza migracji ani RLS.
- Nie zastępuje testów na iPhone PWA, Androidzie, starym Service Workerze i z klawiaturą.
- Nie jest finalnym designem wszystkich ekranów. Pokazuje hierarchię, zachowanie i język.

Pełne śledzenie zgłoszonych błędów jest w `docs/backlog-produktu.md`, a kolejność realizacji
w `docs/plan-sprintow-2026-07.md`.
