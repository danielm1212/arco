# Zgody i oświadczenia — copy do UI

> **STATUS: DRAFT (2026-07-20) — do przeglądu prawnego razem z polityką i regulaminem.**
> Ten plik to źródło treści dla ekranów rejestracji, ustawień i pierwszego dodania
> zdjęcia. Copy pisane zgodnie z ToV Arco (`docs/tone-of-voice.md`): krótko, uczciwie,
> bez prawniczego żargonu tam, gdzie się da.

## 1. Rejestracja (checkbox wymagany)

> ☐ Akceptuję **[Regulamin]** i przyjmuję do wiadomości **[Politykę prywatności]**.

- Jeden checkbox, dwa linki. Bez domyślnego zaznaczenia.
- Zapisujemy: timestamp akceptacji + wersję dokumentów (kolumny w `user_settings`
  lub osobna tabela `consents` — decyzja przy implementacji; rekomendacja: tabela
  `consents` z typem, wersją i timestampem, bo dojdą kolejne zgody).

## 2. Rejestracja — wiek (checkbox wymagany)

> ☐ Mam ukończone 16 lat.

- Deklaracja wystarcza na start (usługa nie jest kierowana do dzieci); bez daty
  urodzenia — minimalizacja danych.

## 3. Pierwsze dodanie zdjęcia sylwetki (zgoda art. 9 — odrębna, kontekstowa)

Pokazywana jako bottom sheet przy pierwszej próbie dodania zdjęcia do pomiaru:

> **Zanim dodasz zdjęcie**
>
> Zdjęcia sylwetki to wrażliwe dane — mogą mówić coś o Twoim zdrowiu. Dlatego
> potrzebujemy Twojej wyraźnej zgody, żeby je przechowywać.
>
> Twoje zdjęcia są prywatne: widzisz je tylko Ty. Nie trafiają do Ekipy ani do
> nikogo innego. Możesz je usunąć w każdej chwili, a zgodę wycofać w Ustawieniach.
>
> ☐ Wyrażam zgodę na przetwarzanie moich zdjęć sylwetki w celu śledzenia postępów.
>
> [Zgadzam się i dodaję zdjęcie] [Nie teraz]

- „Nie teraz" wraca do pomiaru bez zdjęcia (pomiar wagi działa bez zgody).
- Zapis zgody: `consents` (typ `body_photos`, wersja, timestamp).
- Wycofanie: Ustawienia → prywatność → przełącznik; wycofanie proponuje usunięcie
  istniejących zdjęć (jasny opis skutku).

## 4. Ustawienia → sekcja „Prywatność i dane" (docelowy zakres)

- Link do Polityki prywatności i Regulaminu (z numerem wersji).
- Przełącznik zgody na zdjęcia sylwetki (stan + data udzielenia).
- **Eksport danych** (art. 20) — przycisk, JSON/CSV z treningami i pomiarami.
- **Usuń konto** — przepływ z jasnym opisem skutku (trwałe usunięcie, 30 dni
  na zniknięcie z backupów), potwierdzenie frazą lub hasłem.
  Wymóg App Store i Google Play — musi być w aplikacji, nie tylko mailowo.

## 5. Zmiany dokumentów (in-app)

Przy istotnej zmianie regulaminu/polityki: nienachalny banner/sheet z linkiem
do zmian ≥ 14 dni przed wejściem w życie; dalsze korzystanie po dacie = akceptacja
(z wyjątkiem zmian wymagających odrębnej zgody).
