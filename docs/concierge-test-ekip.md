# Concierge-test ekip — ręczna walidacja tezy Radka przed Krokiem 4

> **❌ ODWOŁANY — decyzja [Ty] 2026-07-12:** test na WhatsAppie nie zostanie przeprowadzony (brak realnej możliwości organizacyjnej). Walidacja tezy Radka przenosi się do: (1) **H2 moduł C** (pytania C1–C3 zostają — koncept-test na żywych rozmowach), (2) **dogfooding od dnia 1 Kroku 4** — pierwsza ekipa = Daniel + własny krąg na realnym produkcie, (3) **bramka B3 bez zmian** (≥30% aktywnych w ekipie, k ≥1,15). Kryteria 🟢🟡🔴 z §3 tego doku NIE przepadają — stają się ramą oceny dogfoodingu po 3 tyg. używania. Dokument zostaje jako spec kryteriów; nie planować wg §1–2.
> **Data:** 2026-07-08 · **Po co:** Krok 4 to 6–8 tygodni budowy (schema, RLS, push, e-mail, UI). Teza pod spodem — „kameralna widoczność check-inów + nudge utrzymuje ludzi w treningu" — jest niezweryfikowana. Ten test sprawdza ją **za darmo, w 3 tygodnie, na WhatsAppie**, zanim napiszemy pierwszą linijkę. Wzorzec: concierge MVP — udajemy produkt ręcznie.
> **Kiedy:** po sesjach H2 (rekrutacja stamtąd), równolegle z Krokiem 2 — wynik ma być na stole PRZED startem budowy Kroku 4.

---

## 1. Setup

- **2 ekipy × 3 osoby** (+ Ty jako „system", nie uczestnik). Skład z sesji H2 (pytanie 3 zamknięcia zbiera zgody) + Twój krąg. Idealnie: ekipa A = osoby, które się znają; ekipa B = osoby obce sobie — sprawdzamy, czy pętla wymaga istniejącej relacji (to ważne dla mechaniki zaproszeń!).
- **Kanał:** grupa WhatsApp per ekipa. Przypięta wiadomość z zasadami (niżej). Czas: **3 pełne tygodnie** (krócej = nie widać zaniku; dłużej = odpadną z grzeczności).
- **Zasady w przypiętej wiadomości (symulują UI, ToV!):**
  > „Zasady: po każdym treningu wrzucasz tu jedno 💪 (nic więcej nie trzeba). Reagować wolno, komentować nie trzeba. Raz w tygodniu podsumuję, kto ciągnie serię. Jak ktoś zniknie — można go szturchnąć: napisz »szturcham @X«, a ja przekażę."

## 2. Rola „systemu" (Ty, ~10 min/dzień)

| Co | Kiedy | Symuluje |
|---|---|---|
| Sformatowany check-in po każdym 💪: „✅ Radek trenował dziś — 3. raz w tym tygodniu" | w dniu zgłoszenia | activity_event |
| Tygodniowe podsumowanie passy per osoba („Ania: 4. tydzień z rzędu 🔥") | niedziela wieczór | streak snapshot |
| Przekazanie nudge'a: „👉 Radek przypomina Ci o treningu" (prywatnie do adresata) | na żądanie („szturcham @X") | nudge + kanał |
| NIC więcej — zero motywacyjnych spamów od Ciebie | — | anty-toksyczność |

Dyscyplina eksperymentu: **nie dopingujesz, nie łatasz ciszy.** Jeśli ekipa umiera — ma umrzeć na Twoich oczach; to jest wynik, nie porażka moderacji.

## 3. Co mierzymy (arkusz per ekipa, per tydzień)

1. **Check-in rate:** % dni treningowych zgłoszonych bez przypominania (deklarowany plan osoby vs zgłoszenia).
2. **Zanik:** check-iny tydz. 3 vs tydz. 1 (naturalny spadek <30% = dobrze).
3. **Reakcje spontaniczne:** ile 🔥/👍 na cudze check-iny bez zachęty — czy ludzie w ogóle CHCĄ reagować.
4. **Nudge:** czy ktokolwiek użył „szturcham" nieproszony (≥1 = teza nudge żyje) + reakcja adresata (trening w 48 h? uraza?).
5. **Ekipa A vs B:** czy obcy sobie ludzie w ogóle podtrzymują pętlę (wynik steruje mechaniką zaproszeń: tylko-znajomi vs matchmaking kiedyś).
6. **Exit interview (15 min/os., po 3 tyg.):** „Brakowałoby Ci tego?" · „Kogo byś dodał(a)?" · „Co było krępujące?" · „Wolał(a)byś to w apce czy na WhatsAppie?" — ostatnie pytanie jest podchwytliwe: jeśli „WhatsApp wystarcza", to sygnał, że feature musi dawać więcej niż grupka (passa liczona automatycznie, zero wpisywania — to nasze przewagi, sprawdź, czy je widzą).

## 4. Kryteria przed Krokiem 4

- 🟢 **Buduj:** ≥60% check-in rate w tyg. 3 w min. jednej ekipie · ≥1 spontaniczny nudge · w exit ≥4/6 osób „brakowałoby mi tego".
- 🟡 **Buduj zmieniony:** pętla żyje, ale tylko w ekipie znajomych → zaproszenia w v1 wyłącznie po znajomych (bez kodów publicznych); albo żyje tylko dzięki podsumowaniom tygodniowym → digest tygodniowy awansuje na rdzeń funkcji, nudge do backlogu.
- 🔴 **Nie buduj (jeszcze):** obie ekipy martwe w tyg. 3 mimo chętnej rekrutacji → ekipy wracają do „nice-to-have retencyjnego" (ścieżka czerwonego B3 z wizji — tylko że dowiedzieliśmy się za 0 zł zamiast za 8 tygodni kodu), wzrost przełącza się na content (K1) i trzeba to uczciwie odnotować w wizji.

## 5. Higiena

- To test towarzyski, nie kliniczny — nie przeważaj wniosków ponad n=6; szukamy sygnału „żyje/nie żyje", nie precyzji.
- Zgoda uczestników na notowanie zanonimizowanych obserwacji; zero danych treningowych poza „trenował/nie trenował".
- Wyniki → `docs/wyniki-concierge-ekip.md` + decyzja w HANDOFF przed Krokiem 4.
