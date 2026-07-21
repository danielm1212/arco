# Dokumenty prawne Arco — mapa i status

**Utworzono:** 2026-07-20 · **Status: DRAFT — wymaga przeglądu prawnego przed publicznym startem.**

Drafty przygotowane pod PRIV-1 (ryzyko nr 7 w HANDOFF). Nie zaliczają bramki bez review
prawnika i działających przepływów eksportu/usunięcia. Pisane pod
stan obecny produktu (darmowa PWA, rejestracja zamknięta, bez analytics i płatności);
sekcje przyszłościowe są jawnie oznaczone jako ZAREZERWOWANE.

| Plik | Co to | Publikowany? |
|---|---|---|
| `polityka-prywatnosci.md` | Polityka prywatności (RODO) | Tak — link w stopce/onboardingu |
| `regulamin.md` | Regulamin świadczenia usługi | Tak — akceptacja przy rejestracji |
| `rejestr-czynnosci-przetwarzania.md` | Rejestr art. 30 RODO | NIE — dokument wewnętrzny |
| `zgody-onboarding.md` | Copy zgód do UI (rejestracja + zdjęcia) | Treść trafia do UI |

## Decyzje wpisane w drafty (potwierdzone przez właściciela 2026-07-20)

- **Administrator:** Daniel Muszyński, ul. Kubusia Puchatka 13, 75-710 Koszalin, NIP 6692579490.
- **Logowanie docelowe:** e-mail+hasło, Google Sign-In, **Apple Sign-In** (obowiązkowy
  w App Store przy jakimkolwiek innym logowaniu społecznościowym — to wymóg, nie opcja).
- **Analytics:** na dziś brak. Wybór narzędzia pozostaje otwarty; wymagania produktowe i
  kandydaci są w `../instrumentacja-metryk.md`. Cookieless nie rozstrzyga samodzielnie
  obowiązku zgody. Przed uruchomieniem wymagane są decyzja prawna, aktualizacja polityki,
  rejestru i store'owych privacy labels.
- **Płatności (Coach):** dokumenty nie obejmują PAY-01. Przy monetyzacji trzeba
  zaktualizować: politykę (dane rozliczeniowe, procesor płatności), regulamin
  (ceny, odstąpienie, konsument), rejestr. Pilnuje tego pozycja w `notion-sync-queue.md`.

## Checklist wdrożeniowy (poza samymi dokumentami)

- [ ] **Przegląd prawny draftów** (prawnik — przed otwarciem rejestracji).
- [ ] **Dedykowany e-mail do spraw danych** (np. alias `prywatnosc@…`) — w draftach
      tymczasowo prywatny adres właściciela; wymienić przed publikacją.
- [ ] **Region projektu Supabase** — potwierdzić w dashboardzie; jeśli poza EOG,
      w polityce uzupełnić mechanizm transferu (SCC). Draft zakłada [DO WERYFIKACJI].
- [ ] **DPA podpisane/zaakceptowane:** Supabase, Vercel, Google (przy Sign-In); Apple.
- [ ] **Usuwanie konta w aplikacji** — twardy wymóg App Store i Google Play; przepływ
      w UI + kasowanie danych (cascade w Postgres + Storage ze zdjęciami + backupy).
- [ ] **Eksport danych** (art. 20) — choćby JSON/CSV z sesjami i pomiarami.
- [ ] **App Store privacy labels + Google Play Data Safety** — wypełnić na bazie polityki.
- [ ] **Zgoda na zdjęcia sylwetki w UI** — kontekstowa, przy pierwszym dodaniu zdjęcia
      (copy w `zgody-onboarding.md`); odwoływalna w Ustawieniach.
- [ ] **Weryfikacja wieku 16+** — deklaracja przy rejestracji (copy w `zgody-onboarding.md`).
- [ ] **Retencja** — potwierdzić okresy przyjęte w polityce (usunięcie konta ≤ 30 dni
      łącznie z backupami; logi 90 dni) i odzwierciedlić w konfiguracji backupów.
