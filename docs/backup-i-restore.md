# Backup i restore Arco

## Cel

Maksymalna akceptowana utrata danych przed publicznym multi-userem to 7 dni. Kopia powstaje również przed każdą migracją produkcyjną, większym seedem i zmianą polityk RLS.

Backup ma dwie niezależne części:

1. `roles.sql`, `schema.sql` i `data.sql` albo starszy `database.dump`: role, schemat, dane aplikacji, konta Auth i metadane Storage.
2. `storage/`: rzeczywiste pliki z prywatnego `body-photos` i publicznego `exercise-photos`.

Biblioteka `exercise-images` jest odtwarzalna z lokalnego, niezmiennego backupu `../free-exercise-db` przez `npm run upload:exercise-images`. Nie trzeba kopiować jej co tydzień. Dump bazy nie zawiera treści plików Storage, tylko ich metadane.

## Kolejność wdrożenia self-hostu assetów (reguła po incydencie 2026-07-13)

Przejście dowolnego assetu z hotlinku (np. GitHub) na własny bucket Storage MUSI iść w kolejności:

1. **Najpierw wgraj pliki** do bucketa produkcyjnego (`CONFIRM_REMOTE_UPLOAD=… npm run upload:exercise-images`) i potwierdź, że publiczny URL zwraca `HTTP 200`.
2. **Dopiero potem** przepnij URL-e w bazie (migracja/seed/sync wskazujące na bucket).

Dokładnie to zdarzyło się 2026-07-13. Migracja `20260713180000_exercise_image_cdn` stworzyła bucket, seed w kodzie zaczął budować URL-e do bucketa, ALE na produkcję **nie poszedł ani upload plików, ani przepięcie URL-i** — prod `exercises.images` dalej wskazywały na GitHub (`raw.githubusercontent.com`), a te zaczęły się wywalać w przeglądarce (`net::ERR…` — hotlink/ORB/sieć), przy pustym buckecie. Naprawa dwuetapowa: (1) `upload-exercise-images.ts` zapełnił prod bucket, (2) `sync-exercise-content.ts` przepiął `exercises.images` z GitHuba na bucket (`CONFIRM_REMOTE_SYNC=exercise-content`). Wniosek na przyszłość ten sam: pliki najpierw, URL-e potem — i pamiętaj, że przepięcie URL-i na prod to osobny krok od zmiany logiki seeda w kodzie.

Zabezpieczenie: `upload-exercise-images.ts` po wgraniu weryfikuje próbkę plików przez publiczny URL i wypisuje docelowy host na starcie — pusty/niekompletny bucket wychodzi od razu, zanim uznasz upload za zrobiony.

## Cotygodniowy backup produkcji

1. Użyj projektu powiązanego przez Supabase CLI. Alternatywnie pobierz Session pooler connection string z Supabase Dashboard i ustaw go wyłącznie w bieżącej sesji jako `SUPABASE_DB_URL`.
2. Nie zapisuj connection stringa w repo ani historii poleceń.
3. Ustaw produkcyjne `NEXT_PUBLIC_SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` przez gitignorowany `.env.local`.
4. Uruchom:

```bash
npm run backup:database
npm run backup:storage
```

5. Skopiuj cały katalog z `backups/<timestamp>` do zaszyfrowanej lokalizacji poza Supabase, najlepiej na zaszyfrowany dysk oraz do drugiej lokalizacji z 2FA.
6. Usuń tymczasowe sekrety i potwierdź sumę z `manifest.sha256`.

Katalog `backups/` jest ignorowany przez Git i ma zawartość z uprawnieniami tylko dla właściciela.

### Rytm i odpowiedzialność

- Właściciel procesu: Daniel.
- Backup: co 7 dni oraz przed migracją produkcyjną, większym seedem i zmianą RLS.
- Test restore: raz w miesiącu oraz po każdej zmianie skryptów backupu.
- Po udanym backupie właściciel kopiuje katalog do zaszyfrowanej lokalizacji poza laptopem i potwierdza sumy kontrolne.

## Test odtworzenia

Test nigdy nie działa na głównej bazie. Tworzy losowo nazwaną bazę wewnątrz lokalnego kontenera Supabase, odtwarza backup, sprawdza kluczowe tabele i automatycznie usuwa bazę testową.

```bash
npm run test:restore -- /pełna/ścieżka/do/katalogu-backupu
```

Skrypt obsługuje katalog z `schema.sql` i `data.sql`, pojedynczy plik SQL oraz starszy `database.dump`. Dla zestawu SQL pobiera z lokalnego kontenera wyłącznie bazowy schemat platformy `auth` i `storage`; nie kopiuje lokalnych danych ani publicznego schematu aplikacji i nie modyfikuje globalnych ról. Po odtworzeniu porównaj co najmniej: `auth.users`, `public.exercises`, `public.sessions`, `public.pods` i `storage.objects`. Test wykonuj raz w miesiącu oraz po każdej zmianie procesu backupu.

## Zweryfikowane wykonania

### 2026-07-16

- Backup bazy `backups/20260716T124816Z`: `roles.sql`, `schema.sql`, `data.sql` i `manifest.sha256`; wszystkie trzy sumy SHA-256 zweryfikowane.
- Backup Storage `backups/20260716T124921Z/storage`: 1 plik z `body-photos` (362 143 B), 0 plików z `exercise-photos`; manifest zapisany.
- Restore wykonany do losowo nazwanej bazy w lokalnym kontenerze Supabase. Wynik: `auth.users=1`, `public.exercises=905`, `public.sessions=4`, `public.pods=1`, `storage.objects=1747`.
- Restore zakończył się bez błędu, a baza testowa i pliki tymczasowe zostały automatycznie usunięte.
- Kontrola ujawniła drift: w produkcji brakuje `Band_Lat_Pulldown` i `Single_Leg_Calf_Raise`, które są w lokalnym zestawie 907 ćwiczeń. Nie należy wykonywać pełnego re-seeda produkcji; oba rekordy trzeba dosłać precyzyjnie i zweryfikować programy, które z nich korzystają.

To jest zweryfikowana kopia lokalna. Osobnym krokiem właściciela pozostaje skopiowanie jej do zaszyfrowanej lokalizacji poza laptopem; nie należy traktować kopii na jednym urządzeniu jako pełnej strategii disaster recovery.

## Odtworzenie awaryjne

1. Nie nadpisuj uszkodzonej produkcji. Najpierw utwórz nowy projekt Supabase lub przywróć kopię lokalnie do analizy.
2. Zachowaj snapshot uszkodzonego stanu i zapisz czas incydentu.
3. Odtwórz bazę, następnie rzeczywiste pliki Storage.
4. Zweryfikuj liczbę użytkowników, sesji, planów, rekordów, Ekip i obiektów Storage.
5. Dopiero po smoke testach przełącz aplikację na odzyskany projekt.

Na planach płatnych używaj również backupów platformy lub PITR. Własny dump pozostaje niezależną kopią poza dostawcą. Szczegóły platformowe: oficjalna dokumentacja Supabase „Database Backups” oraz „Backup and Restore using the CLI”.
