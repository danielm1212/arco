# Ekipa — audyt, analiza konkurencji i koncepcja produktowa

> **Data:** 2026-07-12 · **Zlecenie [Ty]:** audyt + analiza konkurencji i rozwiązań + plan „jak to powinno u nas funkcjonować, działać i wyglądać".
> **Kontekst:** nazwa **Ekipa** jest rozstrzygnięta i wdrożona. W warstwie technicznej pozostają `pods`/`pod_members`.
> **Ten dokument NIE nadpisuje kanonu** — konsoliduje decyzje z wizji v2 §4, schematu i concierge-testu, dokłada analizę konkurencji i projektuje warstwę UX/UI, której dotąd nie było. Konflikty z kanonem: zero; nowe propozycje oznaczone „PROPOZYCJA".

---

## 1. Audyt stanu — co już jest rozstrzygnięte (i gdzie są dziury)

**Rozstrzygnięte (kanon):**
- **Definicja:** prywatna grupa Ty + 1–5 znajomych (**max 6 osób**) · user w **max 3 ekipach od v1** (obie liczby: decyzja [Ty] 2026-07-12 — było Ty+1–3 i 1 ekipa/user); zaproszenie linkiem/kodem; zero feedu, komentarzy, DM (wizja §4).
- **Widoczność:** check-in („trenował dziś") + passa tygodni + reakcje. NIE: ćwiczenia, ciężary, logi, ciało. Technicznie: `activity_events`, nigdy `sessions` (schemat §1.4).
- **Interakcje:** reakcje z whitelisty 💪🔥👏🎯 + nudge 1 tap/dzień/parę osób; trzy kanały dostarczania (push → skrzynka → e-mail), quiet hours 22–7, okno wg typowej pory treningu odbiorcy.
- **Rola strategiczna:** silnik wzrostu (Z2: w całości darmowy, na zawsze), bramka B3 (≥30% aktywnych w ekipie; k ≥1,15), fast-follow 4–8 tyg. po launchu (Krok 4).
- **Walidacja:** ~~concierge-test na WhatsAppie~~ **ODWOŁANY (decyzja [Ty] 2026-07-12 — brak możliwości organizacyjnej).** Zastępuje go: H2 moduł C (koncept-test C1–C3) + **dogfooding od dnia 1 Kroku 4** (pierwsza ekipa = Daniel + własny krąg, oceniana kryteriami 🟢🟡🔴 z concierge-doku po 3 tyg.) + bramka B3 bez zmian.
- **Model danych:** kompletny design (schemat §4–5) z RLS, anty-spamem, rotacją invite-code i pułapką rekursji rozbrojoną.
- **Onboarding z zaproszenia:** wariant „Radek Cię zaprosił" z jawną zgodą przed dołączeniem. Szczegółowy flow wraca w Sprincie 21 przed publiczną Ekipą.

**Dziury (dotąd nigdzie nie zaprojektowane) — zamyka je ten dokument:**
1. **Warstwa UX/UI:** gdzie ekipa mieszka w apce, jak wygląda ekran, karta na home, stany puste/martwe (§4–5).
2. **Rytm tygodniowy vs dzienny** — mechanika „kiedy pokazać nudge" i jak czytać ciszę (§3.2).
3. **Awatary/tożsamość** członków bez zdjęć profilowych (§5.4).
4. **Cykl życia ekipy:** martwa ekipa, wyjście, wyrzucanie, co widzi nowy członek (§3.3).
5. Pozycjonowanie względem konkurencji — czym różnimy się OD WSZYSTKICH (§2).

## 2. Analiza konkurencji i rozwiązań

| Produkt | Mechanika grupowa | Co działa | Czego świadomie NIE bierzemy |
|---|---|---|---|
| **Ladder** (Teams) | Kohorty na wspólnym programie, cheers (double-tap), selfie wall, team chat | Cheers = nasz wzorzec reakcji: jeden tap, zero tekstu; „ktoś realny widzi, że byłem" | Wspólny program (nasza ekipa jest programowo-agnostyczna — każdy trenuje swoje), selfie wall (zdjęcia = moderacja), chat (Messenger wygrywa) |
| **WHOOP** (Teams) | Leaderboardy strain/sleep/recovery, team chat, grupy publiczne | Dowód, że ludzie chcą porównywać się w małym gronie | Leaderboard = porównywanie metryk = vanity; wprost sprzeczne z decyzją „zero porównywania ciężarów" |
| **Duolingo** (Friend Streak) | Do 5 NIEZALEŻNYCH streaków 1:1; nudge po lekcji jako push OD ZNAJOMEGO z wariantowym copy | **Najważniejszy wzorzec:** powiadomienie od kumpla jest strukturalnie trudniejsze do zmutowania niż push od apki — dokładnie nasz nudge. Niezależne streaki = odporność na wypadnięcie jednej osoby | Loss aversion na passie (grożenie utratą — zakaz w ToV), streaki dzienne (siłownia żyje tygodniem, nie dniem) |
| **Hevy** (social) | Publiczny feed, follow, lajki, komentarze, pełne logi widoczne | — (nasz anty-wzorzec nr 1: default „Everyone", growth-first) | Feed, komentarze, widoczność logów. To jest nasz klin, nie ich kopia |
| **Strava** (grupy/challenges) | Kluby, segmenty, challenge publiczne | Kudos = protoplasta cheers | Skala publiczna wymaga masy krytycznej, której nie mamy i nie chcemy |
| **Motion** („pods"!) | Małe grupy, punkty zbiorowe, cele grupowe, challenge | Walidacja kategorii: małe grupy accountability to rosnący segment (i zabawne — nazywają to „pods") | Punkty/grywalizacja zbiorowa — dokłada meta-grę, my trzymamy „był / nie był" |
| **Sweatmates** (pary) | SweatCam: zdjęcie przy treningu, partner widzi natychmiast — BeReal dla siłowni | Potwierdza tezę Radka w najczystszej postaci (2 osoby, tylko obecność, zero statystyk) | Foto-weryfikacja (moderacja, tarcie); u nas check-in emituje się SAM z `finishSession` — zero wysiłku usera to nasza przewaga |
| **Fitness Pact / Goals / HabitShare** | Pakty, stawki pieniężne, wspólne nawyki, gify | Behawioralnie skuteczne (stawka = skin in the game) | Pieniądze jako bat i wstyd jako mechanika — łamią ToV („pozytywna motywacja") |

**Synteza — nasza luka rynkowa:** nikt nie robi **auto-logowanego check-inu** (zero wysiłku — emituje go zakończenie treningu) w **małej prywatnej grupie** (zero masy krytycznej potrzebnej na start) z **rytmem tygodniowym** (pasuje do siłowni 2–4×/tydz.) i **zerem treści do moderowania**. Ladder wymaga wspólnego programu, Duolingo jest 1:1 i dzienne, Sweatmates wymaga zdjęcia, WHOOP wymaga opaski, Hevy wymaga ekshibicjonizmu. Ekipa = Friend Streak Duolingo przeniesiony na tygodniowy rytm siłowni i pozbawiony loss aversion.

**Wniosek z Duolingo — ✅ ROZSTRZYGNIĘTE (decyzja [Ty] 2026-07-12):** **multi-ekipa od v1 — max 3 ekipy na usera, ekipa max 6 osób.** Niezależne kręgi (partnerka / siłka / praca) = odporność à la Duolingo Friend Streak: śmierć jednej ekipy nie zabija pętli usera. Świadomie akceptowane koszty i mitygacje:
- **Dyfuzja odpowiedzialności przy 6 osobach** (każdy myśli, że szturchnie kto inny) — mitygują: kontekstowa afordancja nudge'a (§3.2, podświetla ciszę wprost) i digest niedzielny (nikt nie znika niezauważenie). Copy zaproszenia dalej sprzedaje kameralność („paru kumpli"), nie rekrutację do 6.
- **Fan-out check-inu** do max 15 osób (3×5) — technicznie tanie (RLS `my_pod_peer_ids` już multi-ready), społecznie OK (check-in to fakt, nie treść).
- **UI wymaga switchera** ekip (§4–5) i wyboru ekipy w share-sheet zaproszenia — koszt Kroku 4 +~0,5 tyg.
- **Nudge dedupe działa globalnie** (unique `from,to,day` — para dzieląca 2 ekipy nie dostanie 2× szturchnięcia tego samego dnia) ✓ bez zmian w schemacie.

## 3. Jak to funkcjonuje i działa (mechanika)

### 3.1 Pętla rdzeniowa (bez zmian wobec kanonu — tu zebrana w całość)

1. **Trening zakończony** → `finishSession` emituje check-in (dzień + snapshot passy). User NIE robi nic.
2. **Ekipa widzi:** „Daniel trenował dziś — 4. tydzień z rzędu” (skrzynka + karta ekipy; push tylko dla reakcji/nudge, NIE dla każdego check-inu — inaczej 4 osoby × 3 treningi = spam).
3. **Reakcja** 💪🔥👏🎯 jednym tapem → adresat dostaje ją przy następnym otwarciu (skrzynka) + cichy push (batched, quiet hours).
4. **Cisza** → widoczna na karcie ekipy (wygaszony płomień tygodnia) → **nudge** jednym tapem → „Radek przypomina Ci o treningu 💪" (push → skrzynka → e-mail).
5. **Zaproszenie** → link/QR → E0 „Radek Cię zaprosił" → pierwszy trening → celebracja → prompt instalacji → własna pętla.

### 3.2 Rytm tygodniowy (kluczowa decyzja mechaniki — PROPOZYCJA)

Siłownia żyje tygodniem (cel 2–4 treningi/tydz.), nie dniem. Konsekwencje projektowe:
- **Jednostka statusu członka = bieżący tydzień**, nie dzień: „2/3 w tym tygodniu", nie kalendarz dzienny. Widok ekipy pokazuje per osoba: imię · płomienie tego tygodnia (jak FlameWeek, mini) · passa „🔥 N tyg.".
- **Afordancja nudge'a pojawia się kontekstowo, nie zawsze:** przycisk „szturchnij" przy osobie robi się aktywny, gdy (a) minęły ≥3 dni od jej ostatniego treningu ORAZ (b) jej tygodniowy cel jest zagrożony (do końca tygodnia mniej dni niż brakujących treningów). Wcześniej reakcje tak, nudge nie — szturchanie kogoś, kto trenował wczoraj, to spam społeczny. (Duolingo pokazuje nudge dopiero przy realnej ciszy — ta sama zasada.)
- **Digest tygodniowy (niedziela wieczór):** jedno zbiorcze podsumowanie ekipy — „Ania 3/3 🔥7 tyg. · Ty 2/3 · Radek 1/3". Kanał: skrzynka + (opt-in) e-mail. ✅ **W v1 (decyzja [Ty])** — najtańszy element podtrzymujący martwiejące ekipy; po odwołaniu concierge to także główna siatka bezpieczeństwa na scenariusz „ekipa żyje tylko dzięki podsumowaniom".

### 3.3 Cykl życia ekipy (edge cases — dotąd niezaprojektowane)

- **Nowy członek widzi historię OD dołączenia** (nie wstecz) — minimalizacja danych, prostsze RLS, zero zaskoczenia „obcy widzi moje pół roku".
- **Wyjście z ekipy:** self-service (delete własnego wiersza, już w RLS). Copy bez dramatu: „Wychodzisz z ekipy — Twoje check-iny znikają dla reszty". Wyjście ≠ cofnięcie zgody globalnej (schemat §3).
- **Wyrzucanie: ✅ DECYZJA [Ty] 2026-07-12 — TAK, tylko twórca** (`created_by`), bez powiadamiania usuniętego pushem (dostaje info przy otwarciu; oszczędzamy upokorzenia). Bez tego jedna toksyczna osoba zabija ekipę i nie ma wyjścia poza „wszyscy uciekają".
- **Martwa ekipa** (nikt ≥2 tyg.): NIE kasujemy, NIE wysyłamy „wasza ekipa umarła". Karta na home cichnie (przechodzi w stan „Zbierz ich z powrotem" z jednym CTA-nudge do całości). Reaktywacja = czyjkolwiek check-in.
- **Samotny w ekipie** (wszyscy wyszli): stan → empty state zaproszenia z zachowaną własną historią.
- **Usunięcie konta:** twardy cascade (schemat §1.5) — ekipa traci wpisy, przeżywa jako grupa.

### 3.4 Anty-toksyczność (zasady twarde, zebrane)

Zero pól tekstowych · whitelist emoji · nudge 1/dzień/parę · quiet hours · zakaz loss-aversion na passie (ToV) · żadnych porównań ciężarów/rankingów · brak „ktoś coś zrobił" (curiosity gap — zakaz, zawsze kto i co) · ochrona passy (premium) nie jest widoczna dla ekipy jako „oszustwo" — passa to passa.

## 4. Gdzie ekipa mieszka w apce (IA)

**✅ DECYZJA [Ty] 2026-07-12: karta ekipy na home** (4. element, pod GuidanceChip — „może coś się zmieni"). **Otwarte: miejsce w bottom-nav** — patrz niżej.
- Home: karta „Ekipa" — cicha, biała, nie konkuruje z hero (jedna akcja główna ekranu — zasada nadrzędna). Przy multi-ekipie (do 3): karta pokazuje **agregat** (awatary z aktywnością ostatnich 48 h ze wszystkich ekip + 1 highlight), nie trzy karty. Tap → `/ekipa`.
- Pełny ekran `/ekipa`: §5.2; przy >1 ekipie **segmented control / taby** u góry (switcher), ostatnio oglądana zapamiętana.
- Skrzynka (`inbox_items`): ikona dzwonka z kropką w headerze home — wchodzi RAZEM z Krokiem 4, bo bez ekipy nie ma treści do skrzynki.
- **Bottom-nav — rekomendacja: decyzja przy budowie Kroku 4, nie dziś.** Argument ZA tabem wzmocnił się po decyzji multi-3 (switcher potrzebuje domu, ekipa przestaje być pojedynczym widgetem). Argument PRZECIW: tab dodany przed danymi to najdroższa nieruchomość w apce oddana funkcji, której puls poznamy dopiero po B3; HIG-owy limit 5 pozycji nav. Praktycznie: `/ekipa` jest samodzielną trasą, więc awans karta→tab to zmiana jednej konfiguracji nav — projektujemy tak, żeby decyzję dało się podjąć po 4–6 tyg. danych (kryterium: częstotliwość wejść na /ekipa vs Historia; jeśli wyższa — tab zasłużony).

## 5. Jak to wygląda (UI pod Arco Warm)

Zasada dwuwarstwowa (wizja §1.2): **UI ekipy = warstwa narzędzia** (minimal, białe tile, zero ziarna); **momenty ekipy = warstwa momentów** (display-typografia Gambarino, mogą błysnąć): dołączenie do ekipy, pierwszy check-in widziany przez innych, reakcja która przyszła.

### 5.1 Karta na home (stan żywy)
Biały kafel (radius-xl, cień jak reszta): nagłówek „Ekipa" + rząd 2–4 awatarów (§5.4) — każdy z mini-płomieniem (terracotta = trenował dziś/wczoraj; obrys = cisza) + linia ostatniego zdarzenia. Zero liczb poza passą. Max 1 linia tekstu.

### 5.2 Ekran `/ekipa`
- **Lista członków** (wiersz per osoba): awatar · imię · mini-FlameWeek bieżącego tygodnia (te same glify co home — jeden glif ognia w całej apce, decyzja z audytu wizualnego) · badge „🔥 N tyg." · po prawej akcja kontekstowa: 💪 (reakcja na ostatni check-in) albo „szturchnij" (gdy warunki §3.2).
- **Sekcja „Ostatnio":** 5–7 ostatnich zdarzeń (check-iny + reakcje) jako ciche wiersze — NIE feed (bez scrolla w nieskończoność, bez treści, tylko fakty zdarzeniowe).
- **Stopka:** „Zaproś do ekipy" (link/QR, rotacja kodu) — widoczna dopóki <4 osób; ustawienia ekipy (nazwa opcjonalna, wyjście, [twórca:] usuwanie).
- Nagłówek z opcjonalną nazwą („Ekipa z Melonika") albo default „Twoja ekipa".

### 5.3 Stany puste i graniczne
- **Empty (bez ekipy):** clay-ikona (dzwonek/💪 z zestawu) + copy „**Zbierz ekipę.** Paru znajomych. Widzicie tylko: kto był i kto ciągnie serię." + CTA „Zaproś kumpla". Wariant momentu: pierwsze wejście po własnym 4+ tygodniu passy → „Masz passę. Miej świadków."
- **Martwa ekipa:** §3.3 — karta cichnie, jeden CTA.
- **Czekający na pierwszego zaproszonego:** „Link wysłany. Gdy Radek zrobi pierwszy trening — zobaczysz to tutaj."

### 5.4 Awatary bez zdjęć — ✅ DECYZJA [Ty] 2026-07-12: **emoji (wariant B)**
Zero uploadów zdjęć profilowych w v1 (moderacja, RODO, tarcie). User wybiera **emoji-awatar z whitelisty** (kurowany zestaw ~20–30, spójny z ToV — zwierzaki/siłownia/charaktery, zero twarzy-memów) na tle z palety ramp (deterministycznie z user_id). Strażnik ToV: zestaw kurowany tak, żeby nie wpaść w infantylność. **Docelowo (backlog): kreator awatara** — do re-oceny po launchu, nie w Kroku 4.

### 5.5 Copy (rejestr 2, przykłady do przekazania przy budowie)
Zaproszenie (share-sheet): „Radek zaprasza Cię do swojej ekipy w Arco — trenujcie razem, pilnujcie się nawzajem." · Check-in: „Radek trenował dziś — 6. tydzień 🔥" · Nudge: „Radek przypomina Ci o treningu 💪" · Digest: „Twoja ekipa w tym tygodniu: Ania 3/3 · Ty 2/3 · Radek 1/3" · Po reakcji: „Ania widziała Twój trening. 💪 od niej." Metafora-wsparcie w głębszym copy: asekuracja/spotter („ekipa Cię asekuruje").

## 6. Etapowanie (spójne z Krokami wizji)

- **v0 — walidacja:** H2 moduł C sprawdza zrozumienie i atrakcyjność koncepcji. Publiczną Ekipę dogfoodujemy przez trzy tygodnie na realnych małych grupach. Ocenimy aktywność w trzecim tygodniu względem pierwszego, spontaniczne reakcje i nudge, powroty po nudge oraz deklarację „brakowałoby mi tego". Digest pozostaje siatką bezpieczeństwa, a ryzyko rozmycia odpowiedzialności mierzymy względem rozmiaru ekipy.
- **v1 — Krok 4 (6–8 tyg., po decyzjach 2026-07-12 bliżej górnej granicy):** schemat §4 + RLS + check-in/reakcje/nudge + karta home (agregat) + `/ekipa` ze switcherem (multi-3) + wybór ekipy w zaproszeniu + emoji-awatary + skrzynka + push/e-mail + pętla instalacji + **digest tygodniowy (✅ w v1)** + eventy fazy 3 instrumentacji.
- **v1.x — po B3-danych:** kalibracja progu nudge, warianty copy nudge'a (wzorzec Duolingo: wariantowość utrzymuje świeżość), ochrona-passy × ekipa (komunikacja choroby/urlopu).
- **v2 — tylko jeśli dane każą:** matchmaking obcych (WYŁĄCZNIE jeśli dane pokażą ekipy żyjące bez wcześniejszej relacji — po odwołaniu concierge tę tezę sprawdzą dopiero metryki v1), TWA gdy iOS dusi pętlę. (Multi-ekipa przeniesiona do v1 decyzją [Ty].)

## 7. Metryki (mapowanie na istniejącą instrumentację)

Faza 3 z `instrumentacja-metryk.md` pokrywa: `pod_created/joined` (% aktywnych w ekipie — B3), `nudge_sent/delivered` (delivery rate per kanał), `reaction_sent` (żywotność). **Dodać (PROPOZYCJA):** `pod_weekly_alive` (ekipa z ≥2 aktywnymi członkami w tygodniu — realny puls B3 lepszy niż samo członkostwo) i `invite_sent → joined → first_workout` jako lejek k-współczynnika.

## 8. Decyzje — rozstrzygnięte 2026-07-12 [Ty]

1. **Digest tygodniowy w v1** — ✅ TAK (§3.2).
2. **Awatary** — ✅ emoji z kurowanej whitelisty; docelowo (backlog) kreator awatara (§5.4).
3. **Wyrzucanie przez twórcę** — ✅ TAK, cicho (§3.3).
4. **Karta ekipy na home** — ✅ TAK (z zastrzeżeniem „może coś się zmieni"); **rozmiar/liczebność:** ✅ ekipa max 6 osób, user w max 3 ekipach od v1 (§2 — koszty i mitygacje).
5. **Progi afordancji nudge** — ✅ zaakceptowane (≥3 dni + zagrożony cel); kalibracja po dogfoodingu v1.
6. **Concierge-test ODWOŁANY** — ✅ (brak możliwości organizacyjnej). Walidacja: H2 moduł C + dogfooding od dnia 1 Kroku 4 + B3. Uzasadnienie [Ty] limitów 6/3 doprecyzowane: **max 6 = sufit inkluzji** (nie rozbijać np. szóstki z klasy), nie target — realne ekipy będą 2–3-osobowe; **multi-3 = rozłączne kręgi życia** (klasa/praca/rodzina — te osoby się nie znają, jedna wspólna grupa byłaby martwa z definicji).

**Jedyna otwarta:** miejsce ekipy w bottom-nav — decyzja przy budowie Kroku 4 wg kryterium z §4 (wejścia na /ekipa vs Historia po 4–6 tyg.).
