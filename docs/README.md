# Mapa dokumentacji Arco

> Aktualizacja: 2026-07-13. Porządek czytania dla nowej sesji: `CLAUDE.md` (root) → `HANDOFF.md` → kanon poniżej wg potrzeby. Skonsumowane/historyczne doki żyją w `archive/` — nie kasujemy, archiwizujemy.

## 🥇 Kanon (źródła prawdy — kolejność obowiązywania)

| Plik | Co trzyma |
|---|---|
| `wizja-i-plan-produktu-v2.md` | **Kanon nadrzędny** (2026-07-08): wizja, model biznesowy Z1–Z3, ekipy, sekwencja Kroków 0–5, bramki B1–B4, art direction |
| `build-brief-v0.3-addendum.md` → `build-brief-apka-treningowa-v0.2.md` | specyfikacja bazowa (addendum nadpisuje brief) |
| `roadmap.md` | horyzonty + backlog feature'ów (recap, retro typo) — zrewidowany pod wizję v2 |
| `paleta-arco-warm.md` | tokeny kolorów (źródło prawdy dla N3+) |
| `wytyczne-designu.md` | HIG adaptowane pod PWA: zasady twarde, czego nie kopiujemy, **checklist ekranu (w DoD)** |
| `monetyzacja.md` | benchmarki i matematyka rynku (model → nadpisany przez wizję v2, bannery w pliku) |
| `konkurencja-hevy.md` | audyt Hevy + moaty (rewizja 2026-07-08: Hevy MA polski) |

## 📋 Stan i plany (żywe)

| Plik | Co trzyma |
|---|---|
| `HANDOFF.md` | gdzie jesteśmy, co dalej — czytaj po CLAUDE.md |
| `plan-sprintow-2026-07.md` | kolejność sprintów + statusy (nadpisuje kolejność z `sprinty-szczegolowe.md`) |
| `sprinty-szczegolowe.md` | zakresy sprintów + tor assetów |
| `kalendarz-wykonawczy.md` | daty Kroków 0–4 z buforem; **launch: okno 2–8 sty 2027**; reguły poślizgu |
| `notion-sync-queue.md` | kolejka wpisów do Notion (flush na żądanie) |
| `feedback-uzytkownikow.md` | log surowego feedbacku (#1: przeładowany home) |
| `plan-floating-nav-i-ikony-3d.md` | zaplanowana pływająca nawigacja i mały system ikon clay 3D; zależność od audytu UI/UX |

## 🔬 Audyty i projekty techniczne

| Plik | Co trzyma |
|---|---|
| `audyt-kodu-pod-wizje-v2.md` | wpływ wizji na kod + wycena 13–20 tyg. + decyzje §4 |
| `projekt-schematu-subs-consents-pods.md` | design schematu pod Kroki 2–4 (7 decyzji [Ty] w §6) |
| `instrumentacja-metryk.md` | taksonomia eventów pod B1–B4 + rekomendacja PostHog EU (kod: `lib/analytics.ts`) |
| `audyt-bazy-cwiczen.md` | baza ćwiczeń: audyt S8 + kuracja trenerska §5 (2026-07-08) |
| `audyt-kodu-zaleznosci.md` | zależności/higiena (wejście do S9-cz.2) |
| `bezpieczenstwo.md` | **zasady twarde + przegląd 2026-07-08** (RLS 11/11 ✓, headers załatane, findings P1–P3) + checklisty S10/S11/Krok 2/4 + proces incydentów |
| `optymalizacja.md` | **budżety wydajności** (LCP/INP/JS per trasa, sprzęt odniesienia: średni Android) + zasady twarde + przegląd (80% długu = S9-cz.2) + checklist |
| `audyt-technologiczny-2026-07.md` | werdykty stacku + wyzwalacze zmiany |
| `usability-audit.md` | heurystyki + zadania §C + checklista P0/P1 (prerekwizyt H2!) |

## 🧪 Walidacja (przed launchem)

| Plik | Co trzyma |
|---|---|
| `scenariusz-h2.md` | kompletny skrypt sesji testowych (70 min/os., progi B1) |
| `concierge-test-ekip.md` | ❌ ODWOŁANY (2026-07-12); zostaje jako spec kryteriów 🟢🟡🔴 do oceny dogfoodingu |
| `ekipa-koncepcja.md` | **ekipa w całości** (2026-07-12): audyt decyzji, konkurencja (Duolingo/Ladder/WHOOP…), mechanika (rytm tygodniowy, nudge, cykl życia), IA + UI pod Warm; decyzje [Ty] §8 |

## 📣 Marka i marketing

| Plik | Co trzyma |
|---|---|
| `tone-of-voice.md` | głos marki + prompt do sesji copy |
| `strategia-marketingowa.md` | pozycjonowanie, persony, messaging, kampania launchowa |
| `plan-dystrybucji.md` | kanały K1–K5, kadencje, pomiar (taktyka pod strategią) |
| `landing-plan.md` | landing we Framerze + lista oczekujących + test cenowy A/B |
| `baza-contentu-instagram.md` | bank ~6 mies. contentu IG (38 postów, 7 rubryk stories) |
| `prompt-ikony-3d-clay.md` | ikony 3D: 3dicons.co + AI-clay, system materiałów |

## 📚 Treść produktu i ops

| Plik | Co trzyma |
|---|---|
| `trainings/` | źródłowe programy trenera (6 plików + README) — programy w seedzie odtwarzają je 1:1 po kuracji |
| `seed-prompt-fbw.md` | historyczna specyfikacja seedu |
| `setup-local.md` | uruchomienie lokalne / ops |

## 💡 `inspiracje/` — surowe materiały zewnętrzne (transkrypcje, researche)

| Plik | Co trzyma |
|---|---|
| `inspiracje/wnioski-dla-arco.md` | **SYNTEZA obu transkrypcji**: co bierzemy (z miejscami naniesienia) / co świadomie odrzucamy / co zaparkowane — czytaj to zamiast surowych transkrypcji |
| `inspiracje/transkrypcja-enrico-notifications.md` | inżynieria powiadomień (specyficzność, loss aversion, timing 23,5 h) — surowiec do nudge/ekip (Krok 4) |
| `inspiracje/transkrypcja-mobbin-paywalls.md` | 2850 paywalli: flow nie ekran, trial-timeline, „cancel anytime", anty-wzorce — surowiec do paywalla Kroku 3 |

## 🗄️ `archive/` — skonsumowane (nie czytaj, chyba że szukasz historii)

M.in.: `audyt-biznesowy-2026-07-08.md` (geneza wizji v2), `brief-audyt-biznesowy.md`, `empty-states-copy.md` (wdrożone w S14), `start-z-claude-code.md` (bootstrap z początków), starsze audyty/plany (pełna lista w folderze).
