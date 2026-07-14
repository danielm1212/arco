# Bezpieczeństwo Arco

**Aktualizacja:** 2026-07-14

## Zasady twarde

1. Każda tabela z danymi użytkownika dostaje RLS i test wielokontowy w tej samej migracji.
2. Service role nie występuje w kodzie klienta. Używamy go wyłącznie w skryptach i kontrolowanym kodzie serwerowym.
3. Sekrety nie trafiają do repo, treści komend, dokumentacji ani logów.
4. Każda akcja serwerowa sprawdza użytkownika, własność zasobu, wejście i limity.
5. Nie wykonujemy hurtowego kasowania danych użytkownika. Operacja ryzykowna wymaga backupu i jawnego zakresu.
6. Treści użytkownika renderujemy jako tekst. Nie używamy `eval` ani `dangerouslySetInnerHTML` dla danych wejściowych.
7. Upload ma limit rozmiaru, kontrolę MIME, bezpieczną nazwę i właściwe polityki Storage.
8. Zbieramy wyłącznie potrzebne dane i nie wysyłamy PII do analityki.
9. Nowy webhook, signup, upload, e-mail, push lub zaproszenie przechodzi analizę nadużyć i rate limiting.
10. Incydenty opisujemy, zatrzymujemy ich skutki i obsługujemy zgodnie z RODO.

## Stan potwierdzony

- Next.js 16 i React 19 są wdrożone.
- Bazowe security headers działają na produkcji.
- CSP jest egzekwowane, a nie tylko raportowane.
- CI istnieje i obejmuje testy statyczne oraz integracyjne.
- RLS chroni dane użytkownika i baseline Ekipy; test wielokontowy jest częścią smoke.
- `body-photos` jest prywatnym bucketem z dostępem użytkownika do własnego folderu.
- Obrazy ćwiczeń są niezależne od GitHuba i hostowane w Supabase Storage/CDN.
- Publiczna rejestracja pozostaje wyłączona.

## Otwarte bramki przed publicznymi kontami

| Priorytet | Ryzyko | Wymagana akcja |
|---|---|---|
| P0 | Brak potwierdzonego restore | Backup bazy i Storage oraz realne odtworzenie do izolowanego środowiska |
| P1 | Publiczny `exercise-photos` | Zdecydować, czy bucket zostaje publiczny, czy przechodzi na signed URLs |
| P1 | Brak pełnej ochrony nadużyć | Rate limiting dla signup, resetu, uploadu, kodów Ekipy, reakcji i nudge |
| P1 | Publiczne konta | Weryfikacja e-mail, polityka haseł, eksport/usunięcie danych i wersjonowane zgody |
| P1 | Ekipy | Zgoda na udostępnianie aktywności, ochrona 8-znakowych kodów i rotacja zaproszeń |
| P2 | CSP | Po usunięciu dawnego źródła zdjęć sprawdzić i usunąć zbędne `raw.githubusercontent.com` z allowlisty |
| P2 | Operacje | Udokumentować rollback aplikacji, migracji i Storage |

## Gate Sprintu 16

- [ ] Backup bazy wykonany.
- [ ] Backup Storage wykonany.
- [ ] Restore do izolowanego środowiska zakończony sukcesem.
- [ ] Krytyczne ekrany i liczby rekordów sprawdzone po restore.
- [ ] Nagłówki i CSP sprawdzone na produkcji.
- [ ] `npm audit` przejrzany, a ryzyka zapisane lub usunięte.
- [ ] Checklistę rollbacku da się wykonać bez wiedzy z tej rozmowy.

## Gate publicznych kont i Ekipy

- Dwóch użytkowników nie widzi swoich sesji, zdjęć, ustawień ani prywatnych eventów.
- Były członek Ekipy natychmiast traci dostęp.
- Kod zaproszenia jest limitowany, rotowalny i odporny na masowe zgadywanie.
- Eksport zawiera wyłącznie dane właściciela, a usunięcie konta ma kontrolowany zakres.
- Webhooki weryfikują sygnatury i są idempotentne.
- SPF, DKIM i DMARC są skonfigurowane przed wysyłką e-maili z domeny.

## Incydent

1. Ogranicz skutki: wyłącz endpoint, rotuj klucz lub cofnij wdrożenie.
2. Zachowaj dowody i zapisz oś czasu w `docs/incydenty/`.
3. Oceń zakres danych i użytkowników.
4. Dla danych osobowych wykonaj ocenę obowiązku zgłoszenia; wymagany termin RODO może wynosić 72 godziny.
5. Po incydencie dodaj test lub zabezpieczenie, które zapobiega powtórce.
