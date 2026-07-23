# Linear — jak pracujemy w Arco

Ściąga dla zespołu (Daniel + Piotr). Linear działa inaczej niż Trello/Jira/Notion:
domyślnie pokazuje **listę**, nie tablicę, i jest mocno **klawiaturowy**. Jak to załapiesz,
jest szybszy niż wszystko inne. Workspace: **`trainarco`**, team: **Daniel**.

## 1. Model w 30 sekund

| Pojęcie | Co to | U nas |
|---|---|---|
| **Status** (workflow) | kolumny na boardzie | Backlog → Todo → In Progress → In Review → Done / Canceled |
| **Projekt** | duży kubełek pracy (jak lista/tablica w Trello) | Q1, R2.2, R4, R3b, R5b, Security & PRIV-1, Operacje |
| **Label** | tag na zadaniu | grupa *Obszar*: Design / Dev / Security / Ops / Content / Legal + *Do refinementu* / *Zablokowane* / *Test urządzeniowy* |
| **Issue** | pojedyncza karta | DAN-5, DAN-34… |
| **Cycle** | tygodniowy sprint (opcjonalny) | **nie używamy** na razie |

Statusy są wbudowane w Lineara — nie tworzyliśmy ich. Sami dodaliśmy tylko projekty, labelki i zadania.

## 2. Gdzie jest tablica (board)

Domyślnie widzisz listę. Żeby dostać kolumny jak w Trello:
1. Wejdź w team **Daniel** albo w konkretny projekt.
2. Prawy górny róg → **Display** → **Layout: Board**.
3. Kolumny = statusy. **Przeciągasz kartę między kolumnami = zmieniasz status.**

Ustawienie jest per-widok, więc możesz mieć projekt na boardzie, a „My Issues" na liście.

## 3. Skróty, które załatwiają 90% pracy

| Klawisz | Akcja |
|---|---|
| `C` | nowe zadanie (z dowolnego miejsca) |
| `S` | zmień **status** zaznaczonego zadania |
| `A` | przypisz **osobę** (assignee) |
| `L` | dodaj **label** |
| `P` | ustaw **priorytet** |
| `Cmd/Ctrl + K` | menu komend — zrobisz stąd wszystko, jak zapomnisz skrótu |
| `/` | szukaj |

Nie musisz ich znać na pamięć — `Cmd/Ctrl+K` pokazuje każdą akcję z nazwą i skrótem.

## 4. Nasz przepływ (konwencje zespołu)

```
Backlog ──► Todo ──► In Progress ──► In Review ──► Done
   │                                     │
(+ „Do refinementu"                  (= „do testu")         Canceled = odrzucone
 = pomysł bez opisu)
```

- **Backlog** = jest, ale nie teraz. Dodaj label **„Do refinementu"**, jeśli brakuje opisu/kryteriów.
- **Todo** = zrefinowane, „bierz i rób". **Nic nie wchodzi do Todo bez opisu i kryterium ukończenia.**
- **In Progress** = ktoś to robi (ma **assignee**).
- **In Review** = zrobione w kodzie, **do sprawdzenia/testu**. Jeśli zadanie ma label **„Test urządzeniowy"** — **nie przechodzi do Done bez sprawdzenia na telefonie** (nasza definicja Done).
- **Done** / **Canceled**.

Labelka **Obszar** (Design/Dev/Security/…) mówi *czego dotyczy* zadanie — jedno issue = jeden obszar.

## 5. Codzienne czynności

- **Biorę zadanie:** otwórz issue → `A` przypisz siebie → `S` → In Progress.
- **Nowe zadanie:** `C` → tytuł → wybierz **Projekt** + **label Obszar** + priorytet → Create.
- **Kończę:** `S` → In Review (albo Done, jeśli nie ma nic do testu).
- **Nie wiem, za co się zabrać:** sidebar → **My Issues** (wszystko przypisane do Ciebie) albo board projektu **Q1**.

## 6. Widoki warte ustawienia (raz, 2 minuty)

1. **Board projektu Q1 · Stabilizacja** — bieżący fokus; przeciągaj karty.
2. **View „Security"** — Filter → Label = `Security` → Save view. To tablica Piotra (SEC-01/02/03, OPS-01…).
3. **My Issues** przypięte w sidebarze — Twój codzienny widok.

Filtr + zapis jako View = Twoje „tablice tematyczne" (Dev / Design / Ops) bez rozbijania struktury.

## 7. Rytm dla dwóch osób

- **Praca bieżąca** żyje w projekcie **Q1** (i kolejnych R-kach, gdy ruszą).
- Raz w tygodniu krótki przegląd: co w In Review czeka na test, co przenieść z Backlog do Todo.
- **Assignee zawsze ustawiony** na tym, co w In Progress — żeby było jasne, kto co ciągnie.
- Oboje bierzemy zadania z tablicy (Daniel też koduje). Label Obszar + assignee wystarczą, żeby się nie zderować.

## 8. Higiena (żeby zmieścić się w darmowym planie)

Free = **250 aktywnych issues**. Dla dwóch osób to spokojnie wystarcza, pod warunkiem że
**od czasu do czasu archiwizujemy Done** (issue → menu → Archive; archiwum nie liczy się do limitu).

## 9. Źródło prawdy

Linear to **warstwa operacyjna** (co robimy teraz, kto). **Kanon i stan techniczny zostają w repo**:
`docs/HANDOFF.md`, `docs/backlog-produktu.md`, `docs/wizja-i-strategia-v3.md`. Gdy zadanie
z backlogu staje się aktywne — ląduje w Linear jako issue.
