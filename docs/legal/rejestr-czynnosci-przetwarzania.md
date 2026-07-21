# Rejestr czynności przetwarzania (art. 30 RODO)

> **DOKUMENT WEWNĘTRZNY — nie publikować.** DRAFT 2026-07-20, do przeglądu prawnego.
> Aktualizować przy każdej zmianie zakresu przetwarzania (analytics, płatności,
> nowe funkcje społecznościowe).

**Administrator:** Daniel Muszyński, ul. Kubusia Puchatka 13, 75-710 Koszalin,
NIP 6692579490. Kontakt: prywatnosc@trainarco.com [DO URUCHOMIENIA].
Inspektor Ochrony Danych: nie wyznaczono (brak obowiązku — skala jednoosobowej
działalności; zweryfikować przy istotnym wzroście skali).

## Wspólne środki bezpieczeństwa (wszystkie czynności)

TLS w tranzycie; szyfrowanie w spoczynku (Supabase/Postgres); izolacja danych
użytkowników na poziomie wierszy (RLS + testy wielokontowe w CI); klucz service-role
wyłącznie w środowisku serwerowym; kopie zapasowe z procedurą testowanego restore
(`docs/backup-i-restore.md`); zasada minimalnych uprawnień; dane testowe usuwane
wyłącznie po znanych ID.

## Czynności przetwarzania

### 1. Prowadzenie kont użytkowników
- **Cel:** rejestracja, logowanie (e-mail/hasło, Google, Apple), obsługa konta.
- **Kategorie osób:** użytkownicy aplikacji.
- **Kategorie danych:** e-mail, skrót hasła, identyfikatory dostawców logowania,
  nazwa wyświetlana, awatar, ustawienia.
- **Podstawa:** art. 6 ust. 1 lit. b RODO.
- **Odbiorcy:** Supabase (auth/baza), Vercel (hosting), Google/Apple (logowanie).
- **Transfer poza EOG:** Vercel/Google/Apple — DPF/SCC; Supabase — [region DO WERYFIKACJI].
- **Retencja:** do usunięcia konta; backupy ≤ 30 dni po usunięciu.

### 2. Dziennik treningowy
- **Cel:** zapis i prezentacja treningów, programów, rekordów, postępów, guidance.
- **Kategorie osób:** użytkownicy.
- **Kategorie danych:** sesje, serie, ciężary, powtórzenia, notatki, programy,
  cele tygodniowe.
- **Podstawa:** art. 6 ust. 1 lit. b RODO.
- **Odbiorcy / transfer / retencja:** jak w czynności 1.

### 3. Pomiary ciała i zdjęcia sylwetki ⚠ kategoria szczególna
- **Cel:** śledzenie zmian sylwetki i masy ciała na życzenie użytkownika.
- **Kategorie osób:** użytkownicy, którzy dobrowolnie dodali pomiary/zdjęcia.
- **Kategorie danych:** masa ciała, notatki, zdjęcia sylwetki (maks. 2/pomiar) —
  potencjalnie dane o zdrowiu (art. 9).
- **Podstawa:** art. 9 ust. 2 lit. a RODO — wyraźna, odrębna, odwoływalna zgoda
  zbierana w UI przy pierwszym dodaniu zdjęcia (copy: `zgody-onboarding.md`).
- **Odbiorcy:** Supabase Storage (bucket prywatny, dostęp przez RLS/signed URL).
- **Retencja:** do usunięcia przez użytkownika / wycofania zgody / usunięcia konta.

### 4. Ekipy (funkcja społeczna)
- **Cel:** wspólna motywacja — członkostwo, check-iny po treningu, reakcje, nudge.
- **Kategorie osób:** użytkownicy, którzy dobrowolnie dołączyli kodem zaproszenia.
- **Kategorie danych:** członkostwo, check-iny (fakt ukończenia treningu + data),
  reakcje, nazwa wyświetlana, awatar.
- **Podstawa:** art. 6 ust. 1 lit. b RODO.
- **Uwaga projektowa:** członkowie Ekipy widzą wyłącznie check-iny (nie szczegóły
  treningów ani pomiary); wyjście z Ekipy natychmiast odcina widoczność (RLS).
- **Retencja:** jak w czynności 1.

### 5. Logi techniczne i bezpieczeństwo
- **Cel:** diagnostyka, bezpieczeństwo, zapobieganie nadużyciom.
- **Kategorie danych:** adres IP, logi żądań, identyfikatory sesji.
- **Podstawa:** art. 6 ust. 1 lit. f RODO (uzasadniony interes).
- **Odbiorcy:** Vercel, Supabase.
- **Retencja:** ≤ 90 dni.

### 6. [ZAREZERWOWANE] Statystyki użycia
Nieaktywne. Przed wdrożeniem analytics: dopisać czynność (narzędzie, zakres,
podstawa — przy cookieless prawdopodobnie art. 6 ust. 1 lit. f + test równowagi),
zaktualizować politykę prywatności pkt 3.6 i store'owe deklaracje.

### 7. [ZAREZERWOWANE] Płatności i rozliczenia
Nieaktywne. Przed monetyzacją: dopisać czynność (procesor płatności, dane
rozliczeniowe, obowiązki podatkowe — art. 6 ust. 1 lit. b i c), zaktualizować
politykę pkt 3.7 i regulamin §2 ust. 3.
