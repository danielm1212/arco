# Arco — uruchomienie lokalne

**Aktualizacja:** 2026-07-14

## Wymagania

- Node.js 22 lub nowszy zgodny z `package.json`.
- Docker Desktop.
- Supabase CLI.
- Zmienne z `.env.local`; plik nie może trafić do Git.

## Pierwsze uruchomienie

```bash
supabase start
supabase db reset
npm install
npm run seed
npm run bootstrap:user
npm run dev
```

Po `supabase db reset` ponownie wykonaj seed i utwórz konta testowe. Seed może zmienić powiązanie aktywnego programu, dlatego po operacji sprawdź onboarding i ekran główny.

## Adresy lokalne

- Aplikacja: http://localhost:3000
- Supabase Studio: http://localhost:54323
- Mailpit: http://localhost:54324

## Jakość

Nazwy wszystkich skryptów i aktualny gate są w `package.json` oraz `.github/workflows/quality.yml`. Podstawowy zestaw obejmuje:

```bash
npm run lint
npm test
npm run validate:trainings
npm run validate:recommendations
npm run build
```

Testy przepływów danych:

```bash
npm run smoke
npm run smoke:phase2
npm run smoke:offline
npm run smoke:team
```

`smoke:team` tworzy odizolowane konta i sprawdza RLS Ekipy. Nie kieruj smoke testów na produkcję.

## Test telefonu i PWA

Do testu w sieci lokalnej uruchom aplikację na interfejsie dostępnym w LAN i ustaw `NEXT_PUBLIC_SUPABASE_URL` tak, aby telefon widział lokalny Supabase. Adres IP zmienia się między sieciami, więc nie zapisujemy go w dokumentacji.

Funkcje PWA zależne od secure context najlepiej sprawdzać na środowisku HTTPS. Dla bottom sheetów i safe area obowiązuje macierz urządzeń ze Sprintu 15.

## Ważne zasady

- Jeden proces build/Next.js naraz.
- Nie używaj produkcyjnych sekretów lokalnie.
- Nie usuwaj hurtowo sesji. Testowe rekordy kasuj tylko po znanych ID.
- Obrazy ćwiczeń są hostowane we własnym Supabase Storage/CDN; nie zakładaj zależności od GitHuba.
- Aktualne liczby ćwiczeń, programów i slotów potwierdza walidator, nie wartość wpisana w dokumentacji.
