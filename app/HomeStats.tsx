import {
  formatPct,
  formatVolumeCompact,
  type HomePeriodFacts,
} from "@/lib/homePeriods";
import { trainingWord } from "@/lib/streakCopy";

/**
 * HOME-02/04: „Podsumowanie" — liczby, które mówią, czy idzie do przodu.
 *
 * HOME-04 (zgłoszenie właściciela 2026-07-31: „te kontenery są okropnie brzydkie")
 * scala cztery osobne pudełka w JEDNĄ kartę. Poprzednia wersja dawała pięć
 * powierzchni z identycznym `rounded-xl border bg-card` — passa, podsumowanie
 * i trzy kafle krzyczały tak samo głośno, a ekran składał się z siatki kresek
 * (obrys zewnętrzny + `divide-x` + `border-t`). Hierarchię niesie teraz
 * TYPOGRAFIA I ODSTĘP, nie obrys: liczba jest treścią, więc dostaje rozmiar.
 *
 * Karta świadomie miesza okresy (tonaż 7 dni, rekordy 30 dni, progres 90 dni jak
 * `/progress`) — każda liczba podaje swój okres pod etykietą, tak jak zatwierdzony
 * POC. To NIE jest niedopatrzenie do „ujednolicenia": progres liczony w tym samym
 * oknie co `getStrengthTrends` chroni Home i Postępy przed rozjazdem na tym samym ruchu.
 *
 * Bez historii komponent nie istnieje: `periods === null` zamiast kolumny zer.
 *
 * Kolor: violet/`support` = dane i prowadzenie (v1.4), rust zostaje wyłącznie
 * dla akcji, więc statystyki nie konkurują wizualnie z „Zacznij trening".
 */

function Stat({
  value,
  unit,
  delta,
  deltaTone,
  deltaSrSuffix,
  label,
  period,
  tone,
  srValue,
}: {
  value: string;
  unit?: string;
  /** Zmiana obok wartości (np. tonaż vs poprzedni tydzień). */
  delta?: string;
  deltaTone?: "support" | "neutral";
  /** Dopowiedzenie dla czytnika — sama liczba nie mówi, wobec czego jest zmiana. */
  deltaSrSuffix?: string;
  label: string;
  period: string;
  tone?: "support" | "neutral";
  /** Rozpisana wersja dla czytnika ekranu, gdy sama liczba jest niejednoznaczna. */
  srValue?: string;
}) {
  return (
    <div className="min-w-0">
      {/* `leading-none` + jeden rozmiar dla wszystkich liczb w rzędzie: linia
          bazowa się zgadza niezależnie od tego, czy etykieta pod spodem zawija
          się do dwóch linii. Poprzednia wersja rozjeżdżała się na 320 px, bo
          „Serie robocze" zawijało i spychało swoją liczbę poniżej sąsiadów. */}
      <p
        className={`flex items-baseline gap-1.5 text-2xl font-semibold leading-none tabular-nums ${
          tone === "support" ? "text-support" : "text-foreground"
        }`}
      >
        <span className="min-w-0">
          {srValue ? (
            // „2/9" czytnik ogłasza jako „2 ukośnik 9", co brzmi jak „2 z 9" —
            // a to są dwa osobne okresy. Wizualnie zwarte, dla czytnika rozpisane.
            <>
              <span aria-hidden>{value}</span>
              <span className="sr-only">{srValue}</span>
            </>
          ) : (
            value
          )}
          {unit && (
            <span className="ml-0.5 text-sm font-medium text-muted-foreground">{unit}</span>
          )}
        </span>
        {delta && (
          <span
            className={`text-xs font-medium ${
              deltaTone === "support" ? "text-support" : "text-muted-foreground"
            }`}
          >
            {delta}
            {deltaSrSuffix && <span className="sr-only"> {deltaSrSuffix}</span>}
          </span>
        )}
      </p>
      <p className="mt-xs text-xs font-medium leading-tight text-foreground">{label}</p>
      <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{period}</p>
    </div>
  );
}

export function HomeStats({ periods }: { periods: HomePeriodFacts | null }) {
  if (!periods) return null;

  const { volume7, volumePct, sessions7, sessions30, workingSets30, topProgress, prCount30, unit } =
    periods;
  const volume = formatVolumeCompact(volume7, unit);

  /* Górny tier to WNIOSKI („czy idzie do przodu"), dolny to surowe liczby okresu
     („czy się pojawiam"). Wnioski bywają puste — świeże konto nie ma jeszcze ani
     progresu, ani rekordu — więc górny tier i kreska pod nim są warunkowe.
     Bez tego na nowym koncie zostawałaby wisząca linia nad samymi kaflami. */
  const hasConclusions = topProgress !== null || prCount30 > 0;

  return (
    <section
      aria-label="Podsumowanie postępu"
      className="rounded-xl bg-card p-md text-card-foreground shadow-sm"
    >
      <p className="text-xs font-medium text-muted-foreground">Podsumowanie</p>

      {hasConclusions && (
        <>
          <div className="mt-md grid grid-cols-2 gap-sm">
            {topProgress && (
              <Stat
                value={`+${topProgress.delta.toLocaleString("pl-PL")}`}
                unit={topProgress.suffix || undefined}
                tone="support"
                label="Progres"
                period="90 dni"
              />
            )}
            {prCount30 > 0 && (
              <Stat
                value={String(prCount30)}
                label={prCount30 === 1 ? "Rekord" : "Rekordy"}
                period="30 dni"
              />
            )}
          </div>
          {/* Nazwa ćwiczenia jako podpis pod rzędem, nie wciśnięta w komórkę:
              „Wyciskanie hantli na ławce skośnej" rozpychało pierwszą kolumnę
              na cztery linie i rozwalało równość rzędu. `line-clamp-2`, nie
              `truncate` — ucięta nazwa ćwiczenia przestaje cokolwiek znaczyć. */}
          {topProgress && (
            <p className="mt-xs line-clamp-2 text-xs leading-tight text-muted-foreground">
              {topProgress.name}
            </p>
          )}
        </>
      )}

      <div
        className={`grid grid-cols-3 gap-sm ${
          hasConclusions ? "mt-md border-t pt-md" : "mt-md"
        }`}
      >
        <Stat
          value={`${sessions7}/${sessions30}`}
          srValue={`${sessions7} ${trainingWord(sessions7)} w 7 dniach, ${sessions30} ${trainingWord(sessions30)} w 30 dniach`}
          label="Treningi"
          period="7 / 30 dni"
        />
        <Stat value={String(workingSets30)} label="Serie" period="30 dni" />
        {/* Tonaż występował dotąd DWA RAZY w sąsiednich pudełkach: raz jako
            „+12% vs poprzedni tydzień" w podsumowaniu, raz jako „12,4 t / 7 dni"
            w kaflu. Jedna metryka = jedno miejsce; zmiana wchodzi jako delta obok
            wartości, a podstawa porównania idzie do czytnika przez `sr-only`. */}
        <Stat
          value={volume.value}
          unit={volume.suffix}
          delta={volumePct !== null ? formatPct(volumePct) : undefined}
          deltaTone={volumePct !== null && volumePct >= 0 ? "support" : "neutral"}
          deltaSrSuffix="w porównaniu z poprzednim tygodniem"
          label="Tonaż"
          period="7 dni"
        />
      </div>

      {/* Okno progresu nie mieści się przy liczbie, ale czytnik ekranu ma znać
          podstawę — bez tego „+20 kg" jest bez kontekstu. */}
      {topProgress && (
        <p className="sr-only">
          Największy progres liczony z ostatnich 90 dni, tak samo jak na ekranie Postępy.
        </p>
      )}
    </section>
  );
}
