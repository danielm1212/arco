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
3. **Prywatne „pody" 1–3 znajomych** zamiast publicznego feedu — wzajemna accountability, widzicie swoje check-iny. **Omija problem sieci** (wystarczy 2–3 osoby, nie miliony).
4. **Reakcje + nudge à la Duolingo, BEZ komentarzy** — „cheers" + „Radek przypomina Ci o treningu". Świadomie anty-toksyczny, niski-nacisk. To różnica *filozofii*, nie funkcji.
   - To wciąż jest social (nadal chcemy być social!) — tylko kameralny i pozytywny, nie broadcast/vanity.

**Wsparcie (retencja, nie moat):**
5. **Charakter/marka** — celebracja po treningu, „Athletic"/żelazny look, rytuał. Hevy jest płaski.
6. **Twoje dane bez limitów** (Hevy free = 3 mies. historii).

## Ocena (uczciwie)
| Wyróżnik | Moat? | Hevy skopiuje? | Wymaga sieci? |
|---|---|---|---|
| Frictionless + rule-based guidance | 🟢 rdzeń | Nie (sprzeczne z DNA) | Nie |
| Prywatne pody (1–3) | 🟢 | Nie chcą | **Nie** |
| Reakcje + nudge, zero komentarzy | 🟢 filozofia | Trudno | Częściowo |
| Marka/celebracja | 🟡 retencja | Łatwo | Nie |
| Dane bez limitów | 🟡 nisza | Nie (to ich kasa) | Nie |

## Wpływ na roadmapę
- **Guidance + frictionless = rdzeń wyróżnika → podciągnąć wcześniej** (obszar Sprint 4–5), nie Horyzont 5.
- **Social (pody + reakcje + nudge)** zostaje naszym celem, ale jako świadomy klin — dopiero gdy rdzeń hula + po testach. Native/push wejdą razem z socialem.
- **Nie ścigaj Hevy na funkcje.** Wygrywamy filozofią (prowadzi/kameralny/motywuje) i niszą, nie liczbą feature'ów.

## Co NIE jest już naszym kątem
- **Kickboxing / sporty walki** — porzucone. Logowanie ich = za duży wysiłek od usera; nie trzymamy się tego pozycjonowania.
