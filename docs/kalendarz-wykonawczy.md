# Arco — orientacyjny kalendarz wykonawczy

**Aktualizacja:** 2026-07-14

Daty są prognozą dla pracy solo i mają ustępować jakości danych, testom i bramkom. Szczegółowy zakres jest w `plan-sprintow-2026-07.md`.

| Okres | Plan | Warunek wyjścia |
|---|---|---|
| 14–19 lipca 2026 | Sprint 15: PWA, bottom sheety, dostępność, regresja | Macierz urządzeń bez blockerów |
| 20–26 lipca 2026 | Sprint 16: backup, restore, rollback, security review | Udowodniony restore |
| 27–31 lipca 2026 | Sprint 17: przygotowanie i pilot H2 | Powtarzalny scenariusz i czyste konta |
| sierpień 2026 | Sprint 18: 3–5 sesji H2, poprawki i decyzja B1 | Rdzeń przechodzony samodzielnie |
| wrzesień–październik 2026 | Sprint 19: publiczne konta i RODO | Zielona B2 |
| listopad–grudzień 2026 | Sprint 20: pomiar, płatności i cichy launch | Stabilny lejek i rollback |
| po stabilnym launchu | Sprint 21: publiczna Ekipa i dogfooding | Zielona B3 |

## Bufor i zasady poślizgu

- Poślizg do dwóch tygodni pokrywa bufor.
- Przy większym poślizgu tniemy zakres, nie testy, RLS, backup ani poprawność zapisu treningu.
- Jeśli H2 ujawni blocker, publiczne konta czekają do poprawki i ponownego testu.
- Nie wymuszamy styczniowego okna fitness kosztem bezpieczeństwa. Styczeń 2027 pozostaje dobrym terminem publicznego pchnięcia tylko wtedy, gdy B1 i B2 są zielone.

## Prace organizacyjne z wyprzedzeniem

- Konsultację prawną i dostępność kancelarii można umawiać podczas H2, bez implementowania kont przed B1.
- Weryfikację Stripe można rozpocząć w Sprincie 19.
- Domena, ESP i materiały marketingowe nie powinny blokować Sprintów 15–18.
