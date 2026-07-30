import {
  formatPct,
  formatVolumeCompact,
  type HomePeriodFacts,
} from "@/lib/homePeriods";
import { trainingWord } from "@/lib/streakCopy";

/**
 * HOME-02: „Podsumowanie" (trzy liczby, które mówią, czy idzie do przodu) plus
 * trzy kafle surowych liczb okresu. Renderowane pod hero, wewnątrz Suspense —
 * główne CTA nie czeka na te agregaty ani jednej rundy DB.
 *
 * Karta świadomie miesza okresy (tonaż tydzień do tygodnia, rekordy 30 dni,
 * progres 90 dni jak `/progress`) — każda komórka podaje swój okres w linii
 * szczegółu, tak jak zatwierdzony POC. Bez historii komponent nie istnieje:
 * `periods === null` zamiast kolumny zer.
 *
 * Kolor: violet/`support` = dane i prowadzenie (v1.4), rust zostaje wyłącznie
 * dla akcji, więc statystyki nie konkurują wizualnie z „Zacznij trening".
 */

function Cell({
  value,
  valueTone,
  label,
  detail,
}: {
  value: string;
  valueTone?: "support" | "neutral";
  label: string;
  detail: string;
}) {
  // `flex-1 basis-0` — równe trzy części niezależnie od treści. Bez tego długa
  // nazwa ćwiczenia rozpychała pierwszą kolumnę i ucinała dwie kolejne.
  return (
    <div className="min-w-0 flex-1 basis-0 px-sm first:pl-0 last:pr-0">
      <p
        className={`truncate text-lg font-semibold tabular-nums ${
          valueTone === "support" ? "text-support" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {/* Etykiety ZAWIJAJĄ się, nie są ucinane: na 320 px kolumna ma ~85 px,
          a „Największy progres" ucięte do „Największ…" nie znaczy już nic.
          Wysokość jest tania, czytelność nie. Nazwa ćwiczenia bywa dowolnie
          długa („Wyciskanie hantli na ławce skośnej"), więc dostaje dwie linie
          i dopiero potem wielokropek. */}
      <p className="mt-2xs text-xs font-medium leading-tight text-foreground">{label}</p>
      <p className="mt-0.5 line-clamp-3 text-xs leading-tight text-muted-foreground">{detail}</p>
    </div>
  );
}

function Tile({
  label,
  value,
  suffix,
  period,
  srValue,
}: {
  label: string;
  value: string;
  suffix?: string;
  period: string;
  /** Rozpisana wersja dla czytnika ekranu, gdy sama liczba jest niejednoznaczna. */
  srValue?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-sm text-card-foreground">
      <p className="text-xs leading-tight text-muted-foreground">{label}</p>
      <p className="mt-2xs text-xl font-semibold tabular-nums">
        {srValue ? (
          // „2/7" czytnik ogłasza jako „2 ukośnik 7", co brzmi jak „2 z 7" —
          // a to są dwa osobne okresy. Wizualnie zwarte, dla czytnika rozpisane.
          <>
            <span aria-hidden>{value}</span>
            <span className="sr-only">{srValue}</span>
          </>
        ) : (
          value
        )}
        {suffix && <span className="ml-0.5 text-xs font-medium text-muted-foreground">{suffix}</span>}
      </p>
      <p className="mt-2xs text-xs leading-tight text-muted-foreground">{period}</p>
    </div>
  );
}

export function HomeStats({ periods }: { periods: HomePeriodFacts | null }) {
  if (!periods) return null;

  const { volume7, volumePct, sessions7, sessions30, workingSets30, topProgress, prCount30, unit } =
    periods;
  const volume = formatVolumeCompact(volume7, unit);

  // Podsumowanie ma sens tylko wtedy, gdy choć jedna z trzech liczb istnieje —
  // inaczej pokazywalibyśmy trzy kreski zamiast wniosku.
  const hasSummary = topProgress !== null || volumePct !== null || prCount30 > 0;

  return (
    <div className="space-y-sm">
      {hasSummary && (
        <section
          aria-label="Podsumowanie postępu"
          className="rounded-xl border bg-card p-md text-card-foreground"
        >
          <p className="text-xs font-medium text-muted-foreground">Podsumowanie</p>
          <div className="mt-sm flex divide-x">
            {topProgress && (
              <Cell
                value={`+${topProgress.delta.toLocaleString("pl-PL")}${topProgress.suffix ? ` ${topProgress.suffix}` : ""}`}
                valueTone="support"
                label="Progres · 90 dni"
                detail={topProgress.name}
              />
            )}
            {volumePct !== null && (
              <Cell
                value={formatPct(volumePct)}
                valueTone={volumePct >= 0 ? "support" : "neutral"}
                label="Tonaż"
                detail="vs poprzedni tydzień"
              />
            )}
            {prCount30 > 0 && (
              <Cell
                value={String(prCount30)}
                label={prCount30 === 1 ? "Rekord" : "Rekordy"}
                detail="z ostatnich 30 dni"
              />
            )}
          </div>
          {/* Okno progresu nie mieści się w kafelku, ale czytnik ekranu ma znać
              podstawę liczby — bez tego „+20 kg" jest bez kontekstu. */}
          {topProgress && (
            <p className="sr-only">
              Największy progres liczony z ostatnich 90 dni, tak samo jak na ekranie Postępy.
            </p>
          )}
        </section>
      )}

      <section aria-label="Statystyki okresu" className="grid grid-cols-3 gap-sm">
        <Tile label="Tonaż" value={volume.value} suffix={volume.suffix} period="7 dni" />
        {/* „7/30 dni" zamiast „7 dni / 30 dni": wartość już jest ułamkiem 2/7,
            więc dłuższy wariant tylko się ucinał, nic nie wnosząc. */}
        <Tile
          label="Treningi"
          value={`${sessions7}/${sessions30}`}
          srValue={`${sessions7} ${trainingWord(sessions7)} w 7 dniach, ${sessions30} ${trainingWord(sessions30)} w 30 dniach`}
          period="7/30 dni"
        />
        <Tile label="Serie robocze" value={String(workingSets30)} period="30 dni" />
      </section>
    </div>
  );
}
