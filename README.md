# Arco

[![Jakość](https://github.com/danielm1212/arco/actions/workflows/quality.yml/badge.svg)](https://github.com/danielm1212/arco/actions/workflows/quality.yml)

Arco to mobilna aplikacja treningowa do szybkiego zapisywania serii, śledzenia postępów i otrzymywania prostych, opartych na regułach wskazówek. Moduł Ekipa pozwala małym, prywatnym grupom wspierać się bez udostępniania szczegółów treningu.

## Uruchomienie lokalne

Wymagane są Node.js 22, npm oraz lokalny Supabase. Uzupełnij `.env.local`, a następnie uruchom:

```bash
npm ci
supabase start
npm run seed
npm run bootstrap:user
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## Kontrola jakości

Podstawowy zestaw przed wysłaniem zmian:

```bash
npm run lint
npm run test:unit
npm run validate:training
npm run validate:recommendations
npm run build
```

Pełna bramka na GitHubie dodatkowo uruchamia świeżą lokalną bazę oraz cztery testy integracyjne: główny przepływ, rekordy i zamiany, zapis offline oraz prywatność Ekipy.

## Dokumentacja

Aktualny stan i kolejność prac znajdują się w `docs/HANDOFF.md` oraz `docs/plan-sprintow-2026-07.md`. Mapa pozostałych dokumentów jest w `docs/README.md`.
