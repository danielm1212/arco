# Arco vs Hevy — audyt konkurencji + strategia wyróżnika

> Data: 2026-06. Powód: Hevy jest najbliżej naszej wizji „Strava dla siłowni". Ten dokument: co Hevy robi, gdzie ma strukturalną dziurę, i czym Arco realnie się różni. Decyzje właściciela zaznaczone.

## Czym jest Hevy (skrót audytu)
Dojrzały (od ~2019), cross-platform (iOS/Android/web), logger siłowy z **pełną warstwą społeczną** (feed, follow, lajki, komentarze, reakcje emotkami, zdjęcia, prywatne/publiczne treningi, auto-posty o passie). Freemium, tani: **$2.99/mc · $23.99/rok · $74.99 lifetime**. Free limituje: 4 rutyny, 7 custom ćwiczeń, 3 mies. historii. Miliony userów, efekt sieciowy, EN-first.

**Wniosek:** Hevy = ~80% naszego Horyzontu 5. Konkurowanie head-on jako „kolejny social-logger" = przegrana. Potrzebny **ostry klin, nie kopia**.

## Gdzie Hevy ma strukturalną dziurę (świadome wybory, których nie zmieni)
- **Księga, nie trener** — loguje, ale *ty* musisz wiedzieć co robić, ile dołożyć, czy odpuścić. Pasywny z wyboru.
- **Wpisujesz wszystko od zera** — wysiłek logowania co serię (a to największe tarcie każdego loggera — patrz: dlaczego nie da się sensownie logować sportów walki).
- **Social = publiczny feed + komentarze** — hałas, porównywanie, vanity; większość userów social i tak ledwo używa.
- **Neutralny, płaski emocjonalnie**, generyczny, globalny.

## 🎯 Wyróżnik Arco — „anti-Hevy"
> **Logger, który prowadzi i loguje się sam — z kameralnym socialem i charakterem.** Gdzie Hevy neutralny → my prowadzimy; gdzie publiczny → my kameralni; gdzie płaski → my motywujemy.

**Rdzeń (nie wymaga efektu sieciowego, czuć co sesję):**
1. **Logowanie bez tarcia** — pre-wypełnienie całej sesji z historii/programu; zaliczenie serii = jeden tap, korygujesz tylko różnice.
2. **Przezroczyste prowadzenie (rule-based, nie AI)** — propozycja dzisiejszych ciężarów/powt. wg jawnych, nadpisywalnych reguł („+2,5 kg, bo pełny zakres"), flagowanie braków z heatmapy („mało pull w tym tygodniu"), „nogi 9 dni temu", sugestia deloadu.
   - ⚠️ **Granica (zatwierdzona):** to reguły widoczne i nadpisywalne na TWOIM programie — NIE „AI auto-programming" (które odrzuciliśmy). Inny gatunek.
   - **Decyzja:** start od prostych reguł (progresja/braki/staleness/deload). „Prowadzenie za rękę" dla początkujących = późniejsza warstwa na tych regułach + większej bibliotece presetów. Nie wchodzimy od razu w „coacha".

**Social — TAK, ale NASZ (różny od Hevy):**
3. **Prywatne „ekipy" 1–3 znajomych** zamiast publicznego feedu — wzajemna accountability, widzicie swoje check-iny. **Omija problem sieci** (wystarczy 2–3 osoby, nie miliony).
4. **Reakcje + nudge à la Duolingo, BEZ komentarzy** — „cheers" + „Radek przypomina Ci o treningu". Świadomie anty-toksyczny, niski-nacisk. To różnica *filozofii*, nie funkcji.
   - To wciąż jest social (nadal chcemy być social!) — tylko kameralny i pozytywny, nie broadcast/vanity.

**Wsparcie (retencja, nie moat):**
5. **Charakter/marka** — celebracja po treningu, retro-analog Warm (kierunek 2026-07-08, `wizja-i-plan-produktu-v2.md` §1.2), rytuał. Hevy jest płaski.
6. **„Nic nigdy nie kasujemy"** — 🔄 rewizja 2026-07-08 (wizja v2 §8): „dane bez limitów" wypada jako wyróżnik (model hybrydowy wprowadza limit 12 tyg. historii we free). Uczciwa wersja limitu Hevy: **dane czekają w całości, premium sięga głębiej; eksport zawsze darmowy** (Z3).

## Ocena (uczciwie) — zrewidowana 2026-07-08 (wizja v2 §8)
| Wyróżnik | Moat? | Hevy skopiuje? | Wymaga sieci? |
|---|---|---|---|
| Frictionless + rule-based guidance | 🟢 rdzeń | Nie (sprzeczne z DNA) | Nie |
| Prywatne ekipy (1–3) | 🟢 **rdzeń strategii wzrostu** (awans z 🟢-przyszłość — fast-follow po launchu) | Nie chcą | **Nie** |
| Reakcje + nudge, zero komentarzy | 🟢 filozofia | Trudno | Częściowo |
| Marka/celebracja | 🟡 retencja | Łatwo | Nie |
| ~~Dane bez limitów~~ → „nic nigdy nie kasujemy" | 🟡 uczciwość komunikacji | Częściowo | Nie |

## Wpływ na roadmapę
- **Guidance + frictionless = rdzeń wyróżnika → podciągnąć wcześniej** (obszar Sprint 4–5), nie Horyzont 5. ✅ zrobione.
- **Ekipy (1–3 + reakcje + nudge)** — 🔄 awans (2026-07-08): **fast-follow 4–8 tyg. po launchu** jako silnik wzrostu (wizja v2 §4/§6), nie Horyzont 5. Nudge bez natywu: push PWA → skrzynka w apce → e-mail (fallback chain, wizja v2 §4). Reszta socialu (stories, UGC, tablica) zostaje w H5.
- **Nie ścigaj Hevy na funkcje.** Wygrywamy filozofią (prowadzi/kameralny/motywuje) i niszą — pozycjonowanie „dla kogo Hevy jest za duże, za obce i za angielskie" (wizja v2 §1).
- ⚠️ **Weryfikacja 2026-07-08: Hevy MA polską lokalizację** (polski App Store, polskie recenzje). Filar „za angielskie" w pozycjonowaniu jest **słabszy niż zakładał kanon** — przetłumaczony interfejs ≠ PL-first (copy z charakterem, polskie realia siłowni, PL support/faktury zostają nasze), ale w komunikacji landing/marketing NIE opierać klina na języku. Klin = prowadzenie + kameralne ekipy + charakter. Do naniesienia w wizji przy najbliższej rewizji.

## Co NIE jest już naszym kątem
- **Kickboxing / sporty walki** — porzucone. Logowanie ich = za duży wysiłek od usera; nie trzymamy się tego pozycjonowania.
