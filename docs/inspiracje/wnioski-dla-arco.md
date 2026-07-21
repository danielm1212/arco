# Wnioski dla Arco: powiadomienia (Enrico) + paywalle (Mobbin)

> **Data:** 2026-07-08 · **Źródła:** obie transkrypcje w tym folderze. Format: co BIERZEMY (z miejscem naniesienia) / co ŚWIADOMIE ODRZUCAMY (mimo że działa) / co ZAPARKOWANE. Wszystkie naniesienia z §1–§2 są już wykonane w plikach docelowych (lista w §4).

---

## 1. BIERZEMY — powiadomienia/nudge (→ GROW-1, po danych)

| # | Wniosek | Zastosowanie w Arco | Naniesione w |
|---|---|---|---|
| N1 | **Specyficzność > personalizacja.** Konkretny szczegół („4. tydzień z rzędu"), nie imię w szablonie. | Check-in i nudge zawsze niosą konkret: passa w tygodniach, N-ty trening tygodnia. Nasz wzorzec już to robił — teraz to zasada z uzasadnieniem. | `tone-of-voice.md` §3 |
| N2 | **Kontekst > godzina.** Duolingo: 23,5 h od ostatniej sesji, cap przed 22:00; sam timing = +60% tapnięć. | (a) **Quiet hours 22:00–7:00** dla push/e-mail nudge — twarda zasada dostarczania; (b) okno dostarczenia nudge'a bliskie typowej porze treningu odbiorcy (mamy `started_at` w historii!) — tanio, bo to reguła w akcji wysyłki. | `projekt-schematu` §4 |
| N3 | **Powiadomienie = jedyna dźwignia push.** Wszystko inne czeka, aż user się znudzi. Źle zbudowane → odinstalowanie. | Potwierdza priorytet fallback chain (push→skrzynka→e-mail) i minimalizm: **jeden typ nudge'a, zero notyfikacji marketingowych** w v1. | `projekt-schematu` §4 (nota) |
| N4 | **Nawyk przez powtórzenie:** 7 dni z rzędu = 2,4× większa szansa powrotu bez pingowania. | Wzmacnia wagę passy tygodniowej i celu tygodniowego jako rdzenia retencji — bez zmian w kodzie, ale to argument za „ochroną passy" jako realną wartością premium, nie gadżetem. | (bez zmian — potwierdzenie) |
| N5 | **Warstwa AI OS-ów przepisuje powiadomienia** (Apple/Google summarization) — dopracowane copy może zostać zmielone. | Nudge pisać tak, by przetrwał streszczenie: **konkret w pierwszych słowach** („Radek: trenuj dziś 💪" > kwiecista fraza na końcu). Zasada do specu push w Kroku 4. | `projekt-schematu` §4 |

## 2. BIERZEMY — paywall (→ PAY-1) i landing

| # | Wniosek | Zastosowanie w Arco | Naniesione w |
|---|---|---|---|
| P1 | **Paywall = flow, nie ekran; decyzja zapada wcześniej.** | Sekwencja: działająca wartość → wyjaśnienie → dokładna cena. | `backlog-produktu.md` PREMIUM-01/02 |
| P2 | **Timeline triala buduje zaufanie.** | Trial startuje po pierwszym finishu: „dziś pełna wersja → dzień 18 przypomnienie → po 21 dniach zostaje darmowy rdzeń, nic nie znika”. | D-21, COMM-01, `tone-of-voice.md` §3 |
| P3 | **„Bez zobowiązań, anuluj kiedy chcesz"** — subtitle konsekwentnie podbija konwersję. | Wchodzi do copy pricing (landing §6 i paywall). U nas wzmocnione: „bez karty na start". | `landing-plan.md` §3, `tone-of-voice.md` §3 |
| P4 | **Max 2 opcje cen** + uczciwa tabela Free/Coach. | Mamy 14,99/99 jako hipotezę; roczny pierwszy, bez ukrywania miesięcznego. | PREMIUM-02 |
| P5 | **Odmowa rocznego nie uruchamia rabatowej pułapki.** | Miesięczny jest zawsze dostępną alternatywą, bez fake urgency. | COMM-01/PREMIUM-02 |
| P6 | **Friction bywa filtrem** (karta na starcie triala: −50% zapisów, +5× konwersja). | My gramy odwrotnie: bez karty i trial po pierwszym finishu. W PAY-1 niska konwersja przy dużej bazie nie musi oznaczać „produkt zły”; czytamy aktywację, wartość i zakup osobno. | Kontekst do PAY-1 |
| P7 | **Testy różnych propozycji wartości > mikro-tweaki.** | Najpierw H2-V/H2-F wybiera obietnicę; później testujemy najwyżej dwa czytelne warianty paywalla. | PAY-1 |
| P8 | **Retencja i LTV > konwersja.** „Zbuduj coś wartego płacenia." | Potwierdza gwiazdę północną (userzy ≥4 treningi/mies.) — metryka nadrzędna nad konwersją. | (bez zmian — potwierdzenie) |

## 3. ŚWIADOMIE ODRZUCAMY (działa, ale łamie Z1–Z3/ToV) + ZAPARKOWANE

**Odrzucone na piśmie (do listy „nigdy"):**
- **Groźba utraty passy jako copy** („nie strać passy!") — loss aversion działa (Duolingo), ale to presja/wstyd → łamie ToV. Passa zawsze komunikowana pozytywnie; lęk przed utratą adresujemy etycznie: **ochroną passy** (premium). → `tone-of-voice.md` §3 „Nigdy".
- **Spin-the-wheel / fake urgency / odliczania** — „users stop believing it"; Apple już odrzuca mylące wzorce. → ToV ma to w dark patterns; potwierdzone źródłem.
- **Ukryty/wieloekranowy cancel** — u nas anulowanie jest dostępne bez retencyjnego labiryntu;
  dokładny kontrakt zamyka COMM-01.
- **Curiosity gap w nudge'ach** („ktoś z Twojej ekipy coś zrobił…") — skuteczne, ale kameralność = przejrzystość: zawsze kto i co. → zasada N1.

**Zaparkowane (backlog, nie teraz):**
- **Własne przypomnienie treningowe** (opt-in!): kontekstowy timing à la Duolingo — „przypomnij mi w porze, w której zwykle trenuję" na bazie `started_at` historii. Retencja solo zanim ekipy; ale to nowa powierzchnia push → po Kroku 4. → `roadmap.md` backlog.
- **Wideo-paywall / animowany polish** paywalla — po pierwszych danych z testów P7.

## 4. Gdzie naniesione (wykonane 2026-07-08)

`projekt-schematu-subs-consents-pods.md` §4 (quiet hours + zasady dostarczania nudge) ·
`tone-of-voice.md` §3 (wzorzec „bez zobowiązań", zakaz groźby utraty passy) ·
`landing-plan.md` §3 (copy pricing) · `spec-status-konta-ui.md` (wytyczne paywalla i anulowanie)
· `roadmap.md` (bramki) · `README.md` (indeks).
