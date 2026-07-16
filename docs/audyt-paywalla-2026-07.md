# Audyt paywalla i realności WTP (2026-07-16)

> **Zlecenie [Ty]:** „przeanalizuj plan biznesowy, co jest za paywallem, czy userzy będą realnie płacić, czy warto zaktualizować". **Podstawa:** wizja v2 §2–3 (model, Z1–Z3, fale konwersji), `monetyzacja.md` (benchmarki), świeży research konwersji triali (linki na dole). **Werdykt w jednym zdaniu:** model jest zdrowy i nie wymaga przebudowy — wymaga **kalibracji progu B2, jednego nowego mechanizmu (teaser stagnacji) i przestawienia komunikacji ceny na roczną**.

---

## 1. Co jest za paywallem (stan)

| Coach 14,99 zł/mc · 99 zł/rok | Ocena realnej WTP |
|---|---|
| **Guidance-full**: diagnoza stagnacji + plan wyjścia, deload, balans push/pull, staleness, kalibracja | 🟡 **Najmocniejsza obietnica, najtrudniejsza sprzedaż.** Wartość ujawnia się dopiero przy stagnacji — a tej w 21-dniowym trialu user zwykle NIE doświadczy (wykrywanie ~3 tyg.+, beginner ma newbie gains przez miesiące). Płaci Paweł w frustracji — problem: paywall spotyka go ZANIM frustracja nadejdzie (§3-A) |
| **Głęboka analityka**: trendy tonażu, muscle split w czasie, liczba-bohater w czasie | 🟡 Wspiera „dumę z liczb" (nowy komunikat Pawła) — ale sama w sobie rzadko konwertuje („ładne wykresy" to top-3 powód NIE-płacenia w fitness); działa jako część pakietu, nie driver |
| **Pełna historia** (free: 12 tyg.) | 🟢 **Najpewniejszy mechanizm** — sprawdzony wzorzec (Hevy, Strong), uderza dokładnie zaangażowanych (fala 2, mies. 3–4), a Z3 („nic nie kasujemy") czyni go uczciwym. Zostaje bez zmian |
| **Limity tworzenia** (2 programy, 10 custom) | 🟢/⚠️ Realnie dociśnie power-userów (Paweł z 3 planami) — skuteczne, ale wizerunkowo najdrażliwsze. Monitorować: jeśli `limit_hit` będzie GŁÓWNYM driverem konwersji zamiast wartości guidance — sygnał ostrzegawczy dla zdrowia marki |
| **Ochrona passy** | 🟢 drobny, lubiany perk. ⚠️ Napięcie z ToV: sprzedajemy ochronę czegoś, czym zakazaliśmy grozić — komunikować jako życzliwość („choroba nie łamie passy"), nigdy jako remedium na strach; nie eksponować w paywallu jako główny punkt |

**Free pozostaje kompletny** (logger, presety, passa, ekipa, guidance-lite) — zgodnie z Z1/Z2; Kasia nie płaci i NIE MA płacić (jest wzrostem).

## 2. Czy będą płacić — szczera odpowiedź

Tak, ale mniej licznie niż zakłada bramka i w innym momencie, niż uderza trial:
- **Benchmark konwersji triali (research 2026-07-16):** trial **bez karty (opt-in)** konwertuje ~**8,9–18,2%**; z kartą (opt-out) 31–49%. Nasz reverse trial jest bez karty (świadomie — wolumen karmi ekipę, Z2). **Próg B2 „trial→paid ≥25%" jest ponad benchmarkiem opt-in — nierealistyczny.** Drugi warunek B2 („całkowita ≥1,5%") jest zdrowy (mediana freemium 2,1%).
- **Kto płaci:** Paweł po 3+ miesiącach (kłódka historii, limit programów, stagnacja). **Kiedy NIE płaci:** dzień 21, jeśli przez trial guidance-full nie miał okazji nic mądrego powiedzieć (balans/staleness może; deload — nie zdąży).
- **Cena:** miesięczna 14,99 zł stoi wysoko przy Hevy $2.99 — ale **roczna 99 zł ≈ parytet z Hevy rocznym (~95 zł)**. Kotwica Hevy znika, gdy rozmowa toczy się o rocznym.

## 3. Rekomendacje aktualizacji (priorytetem)

**A. Teaser stagnacji — NOWY mechanizm [decyzja Daniela], najważniejsza zmiana.** Pierwsza wykryta stagnacja u KAŻDEGO usera (także free, także po trialu) → **pełna diagnoza + plan wyjścia gratis, jednorazowo**, z podpisem „tak działa Arco Coach — kolejne diagnozy w pakiecie". Rozwiązuje kluczową wadę modelu: trial kończy się, zanim produkt pokaże killer feature; teaser dostarcza próbkę **w momencie bólu** (najlepszy możliwy paywall-moment: frustracja + dowód, że apka widzi problem). Koszt: mały (flaga `first_stagnation_teaser_used`). Ryzyko kanibalizacji: pomijalne — jedna diagnoza nie zastępuje kalibracji i kolejnych cykli.

**B. Kalibracja progu B2 [decyzja Daniela].** Zielone: trial→paid **≥10%** (ambitne wobec 8,9–18,2% opt-in) LUB całkowita ≥1,5% i rośnie — zamiast obecnych 25%. Bez tej korekty w kwietniu 2027 uznamy za porażkę wynik, który jest rynkową normą.

**C. Yearly-first w komunikacji ceny [decyzja Daniela].** Paywall i landing prowadzą od **99 zł/rok** („8,25 zł/mies.") z miesięczną jako opcją — neutralizuje kotwicę Hevy (parytet roczny), podnosi LTV, zgodne z wnioskami Mobbin (tabela + „bez zobowiązań"). Test A/B na liście (14,99/99 vs 9,90/79) zostaje — dokłada tylko kolejność prezentacji.

**D. Packaging guidance-full jako JEDNA obietnica, nie lista flag.** W paywallu/landingu: „**Utknąłeś? Coach mówi dlaczego i co dalej**" (diagnoza→plan→kalibracja) zamiast wyliczanki deload/balans/staleness. Wyliczanka zostaje w tabeli porównawczej.

**E. Upsell celowany momentem, nie personą.** Kasia przez pierwsze tygodnie nie widzi promocji Coach (poza końcem triala) — jej upsell przyjdzie naturalnie z pierwszą kłódką/stagnacją. Chroni rampę wzrostu przed wrażeniem „okrojonej apki".

**F. „Rok w żelazie" jako moment Coach — potwierdzić** (już w roadmapie): trzecia, sezonowa mini-fala konwersji (grudzień), zero dodatkowego mechanizmu.

**G. NOWY feature Coach: cele siłowe z prognozą [decyzja Daniela] — rekomendacja: TAK, najlepszy WTP/koszt w backlogu.** User ustawia cel („100 kg wyciskania") → Arco śledzi trend e1RM i prognozuje („przy obecnym tempie: marzec"), a przy odchyleniu od trendu spina się z diagnozą stagnacji („oddalasz się od celu — plan wyjścia →"). Spina istniejące dane (trendy e1RM z S13), guidance i personalizację w jedną emocjonalną obietnicę, której Hevy nie ma. Koszt: regresja na liczonych już danych + ekran celu. Miejsce: fala 1 obok diagnozy; w darmowym — ustawienie celu i pasek postępu (Z-duch), prognoza i diagnoza w Coach. Kiedy: Krok 3 (split analityki) albo tuż po launchu.

**H. Kosmetyka premium (lekki dodatek, nie filar):** motywy w palecie Warm + warianty ikony apki dla subskrybentów — wzorzec Duolingo/Bear (tanie, lubiane, tożsamościowe, zero konfliktu z Z1–Z3). W paywallu jako „miły bonus" na końcu listy, nigdy argument główny. Po launchu, przy okazji toru assetów.

**Odrzucone po analizie (nie wracać bez nowych danych):** periodyzacja/mezocykle (terytorium trenera — za głębokie na persony), porównywarka zdjęć sylwetki w premium (wrażliwe dane za paywallem = zły sygnał), priorytetowe wsparcie (solo-founder), plate calc (descoped, dumbbell-first), wszystko z listy trwale-poza-zakresem. Zasada nadrzędna: **paywall ma jedną obietnicę (prowadzenie+głębia) — krótka lista mocnych rzeczy bije długą listę „featurów"**.

## 4. Czego NIE zmieniać (i dlaczego)

Z1–Z3 (fundament zaufania i wzrostu — nietykalne) · **reverse trial bez karty** (świadomy trade-off: 2–3× niższa konwersja za 2–3× większą bazę, która karmi ekipę i wirale; wniosek P6 z inspiracji stoi) · dwie fale mierzone osobno · model hybrydowy limity+wartość (R3 v2) · pełny darmowy rdzeń logowania (to nasza kontra do „wszystkiego za paywallem" u konkurencji premium).

## 5. Do naniesienia po decyzjach [Ty]

Wizja v2 §3.2 (teaser stagnacji jako element fali 1) i §7 (próg B2) · landing/paywall copy (yearly-first, packaging D) · instrumentacja: event `stagnation_teaser_shown` → konwersja z teasera jako osobna metryka.

---
**Źródła benchmarków:** [RevenueCat — State of Subscription Apps](https://www.revenuecat.com/state-of-subscription-apps) · [Kirro — Free trial conversion benchmarks 2026](https://kirro.io/free-trial-conversion-rate) · [Vmobify — trial conversion by model](https://vmobify.com/blog/free-trial-conversion-rate) · wcześniejsze: Adapty/Business of Apps w `monetyzacja.md` §2.
