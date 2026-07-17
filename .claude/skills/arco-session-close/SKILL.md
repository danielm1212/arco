---
name: arco-session-close
description: Higiena zamknięcia sesji agenta na repo arco — zwolnienie pasa w dzienniku koordynacji, aktualizacja HANDOFF, kolejka Notion, sprzątanie danych testowych i jawne przekazanie zaległości właścicielowi. Użyj na koniec każdej sesji roboczej, przy "zamknij sesję", "handoff", "kończymy", oraz przed przekazaniem pracy innej sesji.
---

# Zamknięcie sesji na repo arco

Sesja nie jest skończona, gdy kod działa — jest skończona, gdy następna sesja (Claude,
Codex lub [Ty]) może przejąć pracę bez archeologii. Wykonaj wszystkie kroki; kolejność wiążąca.

## 1. Domknij stan repo

- `git status` — zostają wyłącznie świadome pozostałości, każda odnotowana w kroku 3.
  Znane wyjątki, których NIE commitujesz: duplikaty `public/icons-3d/* 2.png` (artefakt
  synca plików) i pliki otwarte przez równoległą sesję.
- Commituj małe paczki i pushuj szybko — druga sesja ma widzieć Twój stan jako
  fast-forward, nie konflikt. Deploy na prod wyłącznie procedurą `arco-release`
  (wymaga sekretów właściciela — nie rób „w ciemno").
- Zmiany niedokończone: zapisz na gałęzi albo jawnie opisz w dzienniku co i gdzie wisi.
  Nigdy nie zostawiaj niemego, niezacommitowanego stosu.

## 2. Posprzątaj dane testowe

- Sesje/rekordy testowe usuwaj lub zamykaj **punktowo po znanych ID**. Nigdy hurtowo.
- Jeśli celowo zostawiasz artefakt (np. otwartą sesję testową do weryfikacji wznowienia
  przez właściciela) — napisz to wprost w dzienniku, z identyfikatorem konta.
- Sprawdź, że service role nie trafił do repo, logów ani plików env poza serwerowymi.

## 3. Zwolnij pas — wpis w `docs/koordynacja-agentow.md`

Dopisz NA GÓRZE sekcji „Log sesji" wpis w obowiązującym formacie:

```
- **RRRR-MM-DD · kto (zakres w 3–6 słowach): STATUS.**
  Zakres: co dokładnie było dotykane (pliki/obszary).
  Wynik: co działa + wyniki weryfikacji (lint ✓, testy N/N ✓, build ✓, smoke ✓…).
  Czego nie dotknięto: pliki równoległych sesji, migracje, duplikaty ikon itd.
  Zaległości: co zostaje i dla kogo ([Ty] / następna sesja).
```

Słownik statusów: **ZAKOŃCZONE** (całość, łącznie z deployem jeśli był w zakresie),
**ZAKOŃCZONE TECHNICZNIE** (kod gotowy i zweryfikowany lokalnie; czeka regresja
urządzeniowa [Ty] lub deploy), **W TOKU** (jawnie opisz stan przerwania).
Nie zawyżaj statusu — „technicznie" to nie „zakończone".

## 4. Zaktualizuj `docs/HANDOFF.md` (jeśli zmienił się stan produktu lub techniki)

- „Ostatnio domknięte" — dopisz zwięźle co weszło.
- „Następny krok" — zaktualizuj, w tym **jawnie oznacz zadania [Ty]** (regresja
  urządzeniowa, przeglądy, decyzje). Odroczona regresja urządzeniowa zawsze ląduje tu
  jako pierwszy zaległy krok, z datą.
- „Otwarte ryzyka" — dodaj/zamknij pozycje, jeśli sesja je zmieniła.
- Zmiana czysto dokumentacyjna lub w izolowanym prototypie nie wymaga ruszania HANDOFF.

## 5. Kolejka Notion — `docs/notion-sync-queue.md`

Jeśli praca zmienia backlog, dopisz pozycję w formacie kolejki:

```
- [ ] CREATE/UPDATE | Tytuł karty | Priorytet | Kto | Status | — | Obszar | Notatka: RRRR-MM-DD — treść.
```

**Nie synchronizuj z Notion.** Sync wykonuje się wyłącznie na wyraźną prośbę właściciela.

## 6. Ostatni rzut oka

- Czy liczby w docach (testy, ćwiczenia/programy/sloty) pochodzą z realnych wyników
  walidatorów tej sesji, a nie z pamięci?
- Czy wszystkie pliki, które deklarowałeś jako „zajęte" na starcie, są zwolnione?
- Czy następna sesja wie, od czego zacząć, czytając wyłącznie dziennik + HANDOFF?

Jeśli na któreś pytanie odpowiedź brzmi „nie" — sesja nie jest zamknięta.
