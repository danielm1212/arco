# Kolejka sync do Notion (NA ŻĄDANIE od 2026-07-05 — patrz CLAUDE.md)

> Domyślny tryb (od 2026-07-05): dopisuj tu operacje ZAWSZE, niezależnie od dostępności Notion MCP.
> Wypychaj do Notion TYLKO gdy Daniel poprosi („zsynchronizuj Notion") — wtedy flush całej listy → usuń wykonane → pusta sekcja „Oczekujące".
> Tablica: „ARCO — Baza pomysłów" (data source `e037aac8-6857-46b7-80ef-95d011d1816e`).

## Format wpisu

```
- [ ] UPDATE | tytuł wpisu w bazie | Etap→Do testu [Ty] | Notatka: <hash> — co zrobione, co przetestować
- [ ] CREATE | tytuł nowego wpisu | Priorytet | Kto wykonuje | Etap | Faza | Kategoria | Notatka
```

## Oczekujące

- [ ] UPDATE | Wypracować styl dużych stalowych ikon 3D (AI) | Etap→bez zmian (już „Backlog") | Notatka: dopisać wzmiankę o palecie v2 (`docs/paleta-arco-warm.md`) jeśli hex/rim-light się zmienił vs poprzednia notatka (#C63F21) — sprawdzić przy następnym sync.
- [ ] CREATE | Reskin: paleta Warm v2 (grey canvas neutralny, sand jako brand-only, powiększone logo) | Priorytet: Średni | Kto wykonuje: Claude Code | Etap: Do testu [Ty] | Faza: Faza 1 — Rdzeń | Kategoria: Wizual / brand | Notatka: Wdrożone (7910137) wg `docs/paleta-arco-warm.md` — canvas neutralny #F7F7F7 (nie kremowy), sand/krem #F6F2ED tylko jako powierzchnia brandowa (hero/celebracja/onboarding, max 1/ekran), logo w headerze powiększone h-6→h-8. Do testu na telefonie: czy separacja szary-canvas / białe tile / brandowy sand czyta się dobrze.
- [ ] CREATE | 2 autorskie programy FBW 2× (Siłownia + Dom z hantlami) dodane do biblioteki | Priorytet: Średni | Kto wykonuje: Claude Code | Etap: Do testu [Ty] | Faza: Faza 1 — Rdzeń | Kategoria: Content / treningi | Notatka: Wdrożone (e56a404) — wpięte w istniejący system programs/program_day_slots (nie nowy schemat). 3 braki 1:1 rozwiązane swapami z plików źródłowych autora (Standing DB Curl→Barbell Curl, Ab Wheel Rollout→Cable Crunch, Hollow Body Hold→Plank). Pull-up jako prawdziwy AMRAP. Zweryfikowane w Preview (oba Trening A/B poprawne). Do testu: „Ustaw jako aktywny" + start sesji na telefonie.
- [ ] UPDATE | Sync z Notion — zasada procesu | Etap→bez zmian | Notatka: Zmieniono z automatycznego (co paczkę) na na-żądanie (CLAUDE.md, 2026-07-05) — koszt tokenów. Info dla Daniela, nie wymaga osobnego wpisu w bazie pomysłów, tylko FYI przy najbliższym sync.
