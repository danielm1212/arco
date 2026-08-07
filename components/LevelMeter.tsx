import { buildLevelMeter } from "@/lib/levelMeter";

/**
 * PLAN-05C/05G: poziom trudności jako miernik + etykieta tekstowa, nie same kropki.
 * `role="img"` z pełnym `aria-label` — czytnik ekranu dostaje jedno zdanie,
 * nie N osobnych `<div>`.
 *
 * Puste segmenty w wariancie `bars` jako obrys (nie `bg-primary/20`): policzony kontrast
 * rust-500 przy 20% krycia na białej karcie wychodzi 1.34:1 — daleko poniżej progu 3:1
 * dla elementów graficznych (WCAG 1.4.11); 70% krycia by przeszło, ale wygląda już prawie
 * jak wypełniony segment. Pełny (`bg-primary`) vs pusty (obrys) różni się kształtem, nie
 * tylko kolorem — mocniejszy sygnał niż odcień, i mierzalnie zgodny: rust-500 na pełną
 * krycię ma 5.08:1 na jasnej karcie i 3.11:1 na ciemnej.
 */

/**
 * PLAN-05H: wariant listowy to trzy PIONOWE SŁUPKI ROSNĄCEJ WYSOKOŚCI (nie kropki
 * równej wielkości) — wzorzec z benchmarku (Tempo, Gymshark `▂▃`): kształt sam niesie
 * rangę, nie tylko liczba wypełnień. `items-end`, żeby słupki równały się do dołu,
 * jak słupki wykresu.
 *
 * Etykieta tekstowa jest teraz zawsze widoczna. PLAN-05G chował ją poza kartą aktywnego
 * planu, bo nagłówek grupy poziomu na liście niósł to samo słowo. PLAN-05H usuwa
 * nagłówki grup na rzecz chipów filtra u góry listy — bez nagłówka obok KAŻDEJ karty
 * nie ma już nic, co powtarzałoby etykietę, więc wraca ona jako stały element wariantu.
 *
 * Pusty segment jest wypełniony na szaro, nie obrysowany jak w `bars` — przy wąskim
 * słupku obrys czyta się jak osobny kształt, nie pusty stan tego samego elementu
 * (sprawdzone na realnym buildzie 2026-07-30 dla kropek; słupki mają ten sam problem
 * geometrii). Pełny vs pusty w dark to 2.44:1, poniżej progu 3:1 dla samodzielnej
 * grafiki (WCAG 1.4.11) — świadome odstępstwo: etykieta tekstowa stoi tuż obok i
 * `aria-label` niesie pełne zdanie, więc słupki są warstwą pomocniczą, nie jedynym
 * nośnikiem znaczenia.
 */
/**
 * Glif poziomu — JEDEN rysunek dla wszystkich trzech widoków.
 *
 * Kształt to ikona lucide `chart-no-axes-column-increasing` (v1.23.0, ISC),
 * ale ze słupkami kolorowanymi WEDŁUG POZIOMU: zapalone akcentem, wygaszone
 * neutralnie. Zwykła ikona z lucide ma jeden `currentColor` na wszystkie trzy
 * kreski i nie potrafi nieść wartości — stąd ścieżki przepisane wprost, ten sam
 * wzorzec co `StreakFlame` („glif lucide, który musi coś znaczyć").
 *
 * Wcześniej każdy widok rysował własne słupki: lista pionowe `w-2` rosnącej
 * wysokości, szczegół poziome `h-2 w-5` z obrysem, widget hero ikonę. Trzy
 * rysunki tego samego znaczenia to ta sama klasa rozjazdu, którą HOME-05b
 * likwidowało przy glifie passy.
 *
 * `strokeWidth` 3, nie 2: viewBox ma 24, a glif renderuje się w 16 px, więc
 * kreska skaluje się o 2/3. Dwójka dałaby na ekranie 1,33 px i słupki byłyby
 * cieńsze niż reszta ikonografii. 3 × (16/24) = 2 px.
 */
function LevelGlyph({ segments }: { segments: boolean[] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      {/* Kolejność ścieżek = rosnąca wysokość słupka, więc i rosnący poziom. */}
      {["M5 21v-6", "M12 21V9", "M19 21V3"].map((d, i) => (
        <path key={d} d={d} className={segments[i] ? "stroke-primary" : "stroke-border"} />
      ))}
    </svg>
  );
}

export function LevelMeter({
  levelMin,
  levelMax,
  label,
  variant = "bars",
}: {
  levelMin: number | null;
  levelMax: number | null;
  label: string | null;
  variant?: "bars" | "list" | "icon";
}) {
  const meter = buildLevelMeter(levelMin, levelMax, label);
  if (!meter) return null;

  /* Glif jest wspólny, RÓŻNI SIĘ TYLKO ETYKIETA — i to celowo.
     Na liście i w szczegółach planu liczy się NAZWA poziomu, bo porównujesz
     plany między sobą; „trudność" przy każdym z piętnastu nie niosłaby nic.
     W widgecie hero odwrotnie: nazwa poziomu jest najdłuższym słowem w wierszu
     meta i łamała go do drugiej linii, a poziom i tak nie jest tam powodem,
     dla którego patrzysz na kartę. Pełna nazwa idzie wszędzie w `aria-label`,
     więc czytnik ekranu nigdy nie dostaje samego „trudność". */
  const labelText = variant === "icon" ? "trudność" : meter.label;
  const labelClass =
    variant === "bars"
      ? "min-w-0 max-w-full break-words text-sm text-muted-foreground"
      : variant === "list"
        ? "min-w-0 break-words text-xs text-muted-foreground"
        : "";

  return (
    <span
      role="img"
      aria-label={meter.ariaLabel}
      className={
        variant === "icon"
          ? "inline-flex shrink-0 items-center gap-xs"
          : "inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-xs gap-y-2xs"
      }
    >
      <LevelGlyph segments={meter.segments} />
      <span aria-hidden className={labelClass}>
        {labelText}
      </span>
    </span>
  );
}
