import { Check } from "lucide-react";
import type { WeekDay } from "@/lib/week";
import { countPl, WORDS } from "@/lib/plural";
import { formatGoalSentence } from "@/lib/programRecommendation";

/**
 * HOME-05b: JEDNA siatka siedmiu dni tygodnia dla całej aplikacji.
 *
 * To jest naprawa defektu, nie kosmetyka. HOME-05 ujednoliło semantykę symboli
 * tylko w połowie ekranu, bo siatka istniała w DWÓCH niezależnych kopiach:
 * karta na home rysowała dzień jako pełny prostokąt `h-8 bg-primary` z obrysem
 * `border-dashed` na dziś, a sheet w headerze jako kółko `size-6` z checkiem i
 * ciągłym pierścieniem. Poprawiono jedną kopię. Dopóki kopie są dwie, każde
 * „ujednolicenie" jest tymczasowe — dlatego siatka ma teraz jedno miejsce w
 * kodzie, a nie dwie zgodne implementacje.
 *
 * Język dnia (kanon):
 * - zaliczony → wypełnione kółko `bg-primary` z checkiem,
 * - dziś      → ciągły pierścień `border-2` (statyczny; puls usunięty, patrz
 *               `globals.css` §„ignite"),
 * - pusty     → `bg-muted-foreground/30`; dzień przyszły i pominięty wyglądają
 *               IDENTYCZNIE (różnica kryciem była cichą oceną — „dni odpoczynku
 *               są częścią planu", tone-of-voice.md).
 *
 * Kontrast pustego kółka wobec tła to ~1,5:1 (light) / ~1,9:1 (dark) — poniżej
 * 3:1, świadomie i niezmiennie od HOME-05: to marker rytmu, nie nośnik
 * znaczenia. Pod każdym slotem stoi litera dnia, a `sr-only` przy literze podaje
 * stan każdego z siedmiu dni.
 */
export function WeekStrip({
  week,
  weeklyGoal,
  label = "Ten tydzień",
  className,
}: {
  week: WeekDay[];
  /** Tylko do podsumowania w `aria-label` („3 z 4 treningów"). */
  weeklyGoal?: number;
  /** Nazwa okresu w `aria-label`. `/postępy` pokazuje dwa tygodnie pod sobą,
   *  więc oba nie mogą ogłaszać się jako „Ten tydzień". */
  label?: string;
  className?: string;
}) {
  const doneCount = week.filter((d) => d.on).length;
  const progressLabel =
    weeklyGoal == null
      ? countPl(doneCount, WORDS.training)
      : formatGoalSentence(doneCount, weeklyGoal);

  return (
    /* role="list" jawnie: Safari/VoiceOver zdejmuje domyślną rolę listy z <ol>,
       gdy list-style jest wyzerowany w CSS (tu przez list-none) — bez tego
       siedem kafelków ogłosiłoby się jako zwykły tekst na iPhone PWA. */
    <ol
      role="list"
      aria-label={`${label}: ${progressLabel}`}
      className={`m-0 grid list-none grid-cols-7 gap-1.5 p-0 ${className ?? ""}`}
    >
      {week.map((d) => (
        <li key={d.key} className="flex flex-col items-center gap-1.5">
          <span
            aria-hidden
            className={`grid aspect-square w-full max-w-8 place-items-center rounded-full ${
              d.on
                ? "bg-primary text-primary-foreground"
                : d.today
                  ? "border-2 border-primary text-primary"
                  : "bg-muted-foreground/30 text-transparent"
            }`}
          >
            {d.on && <Check className="size-4" strokeWidth={3} />}
          </span>
          <span
            className={`text-xs font-semibold ${
              d.today ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {d.dow}
            {/* „dziś" jest niezależne od stanu treningu — inaczej dzisiejszy
                zaliczony dzień nie ogłosiłby się jako dzisiejszy (wizualnie
                niesie to pogrubiona litera, której czytnik nie przekaże). */}
            <span className="sr-only">
              {d.today ? " dziś," : ""} {d.on ? "trening zaliczony" : "brak treningu"}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
