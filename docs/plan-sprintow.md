# Arco — plan sprintów (przegląd z lotu ptaka)

> Warstwa „gdzie jesteśmy / co dalej". Szczegóły wykonawcze: `docs/sprinty-szczegolowe.md`. Wizja/horyzonty: `docs/roadmap.md`. Strategia vs Hevy: `docs/konkurencja-hevy.md`.
> Legenda: ✅ zrobione · 🔵 w toku · ⏳ w kolejce · [C] robię ja (Claude) · [Ty] Twoja decyzja/treść.
> Aktualizacja: 2026-07-01.

---

## ✅ Zrobione (Horyzont 1 — dopracowanie rdzenia)

| Sprint | Zakres | Efekt |
|---|---|---|
| **S1** | Polish loggera | fix swap-tooltip, koniec przerwy 3-2-1 + sygnał, wake lock, zwijana notatka, brak utraty danych przy „Zakończ" |
| **S2** | Celebracja + cel | ekran po treningu (hero + staty + PR), cel tygodniowy, „last set" per wiersz |
| **S3** | Retencja widoczna | kalendarz + passa na /history, anatomiczna heatmapa mięśni na /progress |
| **S4** | Picker & szybki wpis | filtry w pickerze (partia/sprzęt/wzorzec, wspólny komponent add+swap), stoper dla `timed` (plank, odliczanie do celu) |
| **S5** | Guidance rule-based (rdzeń wyróżnika „anti-Hevy") | podpowiedzi z danych: progresja, balans push/pull, staleness partii, deload — karta „Wskazówki" na home + hint w loggerze; korekty kategorii per ćwiczenie |
| **S6** *(część)* | Audyt FBW + nowy zestaw programów | `docs/audyt-fbw.md`; **6 kuratorowanych programów** (grid poziom×środowisko) zastąpiło stare 7 |

---

## 🔵 W toku — Sprint 6 (dokończenie)

**Custom ćwiczenie** [C] — tabela `user-exercises` (RLS po `user_id`), CRUD w pickerze („Add custom" à la Bevel), własny opis + **zdjęcia (Supabase Storage — nowa zależność, decyzja architektoniczna)**.
- Kandydat #1: **DB Hip Thrust** (brak w bazie free-exercise-db).
- [Ty]: dopracowanie FBW jako trener (`docs/audyt-fbw.md` §5); ew. konsultacja 5 podmian (`docs/trainings-mapowanie.md`).

---

## ⏳ Kolejka (Horyzont 1 → launch)

| Sprint | Zakres | Kto |
|---|---|---|
| **S7** | **Onboarding** doświadczenie (początkujący/średni/zaawansowany) → sugestia programu. *(„Więcej presetów" w większości zamknięte przez 6 nowych programów.)* | [C] seed/logika · [Ty] mapowanie poziom→program |
| **S8** | **Audyt bazy ćwiczeń** — duplikaty/śmieci, martwe obrazki (hotlink), jakość nazw/instrukcji; propozycja kuracji (~150–250 realnie używanych) | [C] skan · [Ty] akceptacja listy |
| **S9** | **Audyt kodu + zależności** — `npm audit`, patche minor, decyzja o dużych majorach (React 19/Next 16/Tailwind 4/TS 6 — rekomendacja: po launchu), higiena (`Logger.tsx`, N+1, paginacja) | [C] · [Ty] decyzja majory |
| **S10** | **Offline correctness + audyt longevity** — guard swap/add/skip, checklista longevity (vendored deps, backup zdjęć, integralność danych, migracje, sekrety) | [C] |
| **S11** | **Launch (Phase 10)** — deploy Vercel + Supabase cloud, HTTPS = pełne PWA, **uniezależnienie zdjęć od hotlinku** (Storage/CDN), PL instrukcje | [C] kod · [Ty] konta cloud, klucze prod, app icon/splash |

**Bramka launchu (gate S11):** powtórka checklisty longevity (S10) — must-pass.

---

## Po Horyzoncie 1 (nie teraz — świadomie odłożone)

- **H2 — Testy użytkowników** (3–5 osób) — bramka przed inwestowaniem dalej.
- **H3 — Premium look** — metaliczny/„żelazny" akcent, AI-podrasowanie zdjęć ćwiczeń.
- **🚧 BRAMKA prawna/kont** (przed H4–5) — publiczna rejestracja, Google/Apple OAuth, RODO (privacy policy, ToS, eksport/usunięcie danych, DPA Supabase, hosting EU). Szczegóły: `docs/roadmap.md`.
- **H4 — Native + monetyzacja** · **H5 — Social** (prywatne pody + reakcje/nudge, „Strava dla siłowni") — OSTATNI etap, gdy rdzeń hula + po testach.

---

## Otwarte decyzje po Twojej stronie (nie blokują [C])
1. Guidance (S5) — czy progi/agresywność `GUIDANCE` OK po realnym użyciu, zanim ew. per-user.
2. FBW/programy — uwagi trenera do 6 nowych programów + 5 podmian.
3. Custom ćwiczenie — zdjęcia teraz (Supabase Storage) czy najpierw sam opis tekstowy?
4. Duże majory zależności (S9) — teraz czy po launchu? (rekomendacja: po launchu.)
