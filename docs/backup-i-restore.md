# Backup i restore Arco

## Cel

Maksymalna akceptowana utrata danych przed publicznym multi-userem to 7 dni. Kopia powstaje również przed każdą migracją produkcyjną, większym seedem i zmianą polityk RLS.

Backup ma dwie niezależne części:

1. `database.dump`: schemat, dane aplikacji, konta Auth i metadane Storage.
2. `storage/`: rzeczywiste pliki z prywatnego `body-photos` i publicznego `exercise-photos`.

Biblioteka `exercise-images` jest odtwarzalna z lokalnego, niezmiennego backupu `../free-exercise-db` przez `npm run upload:exercise-images`. Nie trzeba kopiować jej co tydzień. Dump bazy nie zawiera treści plików Storage, tylko ich metadane.

## Kolejność wdrożenia self-hostu assetów (reguła po incydencie 2026-07-13)

Przejście dowolnego assetu z hotlinku (np. GitHub) na własny bucket Storage MUSI iść w kolejności:

1. **Najpierw wgraj pliki** do bucketa produkcyjnego (`CONFIRM_REMOTE_UPLOAD=… npm run upload:exercise-images`) i potwierdź, że publiczny URL zwraca `HTTP 200`.
2. **Dopiero potem** przepnij URL-e w bazie (migracja/seed/sync wskazujące na bucket).

Odwrotna kolejność = martwe assety na produkcji: baza wskazuje na bucket, którego nikt nie zapełnił. Dokładnie to zdarzyło się 2026-07-13 — migracja `20260713180000_exercise_image_cdn` stworzyła bucket i seed przepiął URL-e, ale upload plików został pominięty (dodatkowo `sync-exercise-content.ts` miał wtedy błąd składni). Objaw: wszystkie zdjęcia ćwiczeń zwracały `HTTP 400`. Naprawa: uruchomienie uploadu (URL-e w bazie już pasowały, więc obrazy wstały bez re-deployu).

Zabezpieczenie: `upload-exercise-images.ts` po wgraniu weryfikuje próbkę plików przez publiczny URL i wypisuje docelowy host na starcie — pusty/niekompletny bucket wychodzi od razu, zanim uznasz upload za zrobiony.

## Cotygodniowy backup produkcji

1. Pobierz Session pooler connection string z Supabase Dashboard, sekcja Connect.
2. Ustaw go wyłącznie w bieżącej sesji terminala jako `SUPABASE_DB_URL`. Nie zapisuj go w repo ani historii poleceń.
3. Ustaw produkcyjne `NEXT_PUBLIC_SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` przez tymczasowy, gitignorowany `.env.local`.
4. Uruchom:

```bash
npm run backup:database
npm run backup:storage
```

5. Skopiuj cały katalog z `backups/<timestamp>` do zaszyfrowanej lokalizacji poza Supabase, najlepiej na zaszyfrowany dysk oraz do drugiej lokalizacji z 2FA.
6. Usuń tymczasowe sekrety i potwierdź sumę z `manifest.sha256`.

Katalog `backups/` jest ignorowany przez Git i ma zawartość z uprawnieniami tylko dla właściciela.

## Test odtworzenia

Test nigdy nie działa na głównej bazie. Tworzy losowo nazwaną bazę wewnątrz lokalnego kontenera Supabase, odtwarza dump, sprawdza kluczowe tabele i automatycznie usuwa bazę testową.

```bash
npm run test:restore -- /pełna/ścieżka/do/database.dump
```

Po odtworzeniu porównaj co najmniej: `auth.users`, `public.exercises`, `public.sessions`, `public.pods` i `storage.objects`. Test wykonuj raz w miesiącu oraz po każdej zmianie procesu backupu.

## Odtworzenie awaryjne

1. Nie nadpisuj uszkodzonej produkcji. Najpierw utwórz nowy projekt Supabase lub przywróć kopię lokalnie do analizy.
2. Zachowaj snapshot uszkodzonego stanu i zapisz czas incydentu.
3. Odtwórz bazę, następnie rzeczywiste pliki Storage.
4. Zweryfikuj liczbę użytkowników, sesji, planów, rekordów, Ekip i obiektów Storage.
5. Dopiero po smoke testach przełącz aplikację na odzyskany projekt.

Na planach płatnych używaj również backupów platformy lub PITR. Własny dump pozostaje niezależną kopią poza dostawcą. Szczegóły platformowe: oficjalna dokumentacja Supabase „Database Backups” oraz „Backup and Restore using the CLI”.
