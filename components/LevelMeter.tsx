import { buildLevelMeter } from "@/lib/levelMeter";

/**
 * PLAN-05C: poziom trudności jako pasek + etykieta tekstowa, nie same kropki.
 * `role="img"` z pełnym `aria-label` — czytnik ekranu dostaje jedno zdanie,
 * nie N osobnych `<div>`. Jeden komponent, myślany pod dwa miejsca użycia
 * (lista i szczegół planu) — wpięcie w oba ekrany jest zakresem PLAN-05D/05E.
 *
 * Puste segmenty jako obrys (nie `bg-primary/20`): policzony kontrast rust-500
 * przy 20% krycia na białej karcie wychodzi 1.34:1 — daleko poniżej progu 3:1
 * dla elementów graficznych (WCAG 1.4.11); 70% krycia by przeszło, ale wygląda
 * już prawie jak wypełniony segment. Pełny (`bg-primary`) vs pusty (obrys)
 * różni się kształtem, nie tylko kolorem — mocniejszy sygnał niż odcień, i
 * mierzalnie zgodny: rust-500 na pełną krycię ma 5.08:1 na jasnej karcie i
 * 3.11:1 na ciemnej.
 */
/**
 * PLAN-05E: wariant listowy. Szczegół planu ma miejsce na trzy szerokie pastylki,
 * wiersz biblioteki nie — tam poziom dzieli linię z akcją. Trzy małe pionowe słupki
 * o rosnącej wysokości mieszczą się w 28 px zamiast 76 px, a ranga jest czytelna
 * również z kształtu, nie z samej liczby wypełnień.
 *
 * Pusty segment jest tu WYPEŁNIONY na szaro, nie obrysowany jak w wariancie `bars`.
 * Przy 8 px szerokości obrys zamienia słupek w pierścień, który czyta się jak znak
 * „0”, nie jak pasek miernika — sprawdzone na realnym buildzie 2026-07-30.
 *
 * Świadome odstępstwo od progu z PLAN-05C, zmierzone: pełny vs pusty to 3.38:1
 * w light i **2.44:1 w dark** (poniżej 3:1). Nie traktujemy tego jako naruszenia
 * 1.4.11, bo ten próg dotyczy grafiki NIEZBĘDNEJ do zrozumienia treści — tutaj
 * poziom stoi słownie tuż obok słupków, `aria-label` niesie pełne zdanie, a rosnąca
 * wysokość koduje rangę kształtem. Podbicie krycia pustego słupka poprawia tę parę,
 * ale gubi czytelność „ile z trzech” (przy /20 pusty ma 1.54:1 wobec karty), więc
 * zostajemy przy /30. Wariant `bars` zostaje nietknięty ze zmierzonym kontrastem
 * z PLAN-05C/05D.
 */
const LIST_BAR_HEIGHTS = ["h-2", "h-3", "h-4"];

export function LevelMeter({
  levelMin,
  levelMax,
  label,
  variant = "bars",
}: {
  levelMin: number | null;
  levelMax: number | null;
  label: string | null;
  variant?: "bars" | "list";
}) {
  const meter = buildLevelMeter(levelMin, levelMax, label);
  if (!meter) return null;

  const isList = variant === "list";

  return (
    <span
      role="img"
      aria-label={meter.ariaLabel}
      className="inline-flex max-w-full flex-wrap items-center gap-x-xs gap-y-2xs"
    >
      <span aria-hidden className={`flex gap-2xs ${isList ? "items-end" : ""}`}>
        {meter.segments.map((filled, i) => (
          <span
            key={i}
            className={`rounded-full ${isList ? `w-2 ${LIST_BAR_HEIGHTS[i]}` : "h-2 w-5"} ${
              filled
                ? "bg-primary"
                : isList
                  ? "bg-muted-foreground/30"
                  : "border border-primary bg-transparent"
            }`}
          />
        ))}
      </span>
      <span
        aria-hidden
        className={`min-w-0 max-w-full break-words text-muted-foreground ${
          isList ? "text-xs" : "text-sm"
        }`}
      >
        {meter.label}
      </span>
    </span>
  );
}
