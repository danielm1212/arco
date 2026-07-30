import { weightToDisplay } from "@/lib/format";
import { setMetric } from "@/lib/exerciseMetrics";
import type { ExerciseType, UnitSystem } from "@/lib/types";

/**
 * HOME-02: agregaty okresu dla Home, liczone z TYCH SAMYCH wierszy, które
 * `getHomeGuidance` już pobiera (90 dni zakończonych sesji → ćwiczenia →
 * zaliczone serie robocze). Moduł jest czysty — zero zapytań, zero importów
 * Supabase — więc semantyka okresów jest testowalna bez bazy.
 *
 * Dlaczego nie `getPeriodOverview`/`periodStats` z `app/progress/stats.ts`:
 * każde okno to tam osobny 3-poziomowy waterfall, a HOME-02 potrzebuje trzech
 * okien plus trendów — zmierzone **+13 zapytań** na najgorętszej trasie wobec
 * budżetu `optymalizacja.md` §1 („≤ 4, równolegle"). Te same liczby z wierszy
 * guidance kosztują **+1** (sam licznik rekordów). Definicje trzymamy zgodne
 * z `periodStats` co do joty — patrz komentarze przy każdym agregacie.
 */

const DAY = 86_400_000;

/** Jeden zaliczony set roboczy wzbogacony o kontekst sesji i ćwiczenia. */
export interface HomeFactRow {
  /** `started_at` sesji, do której należy seria. */
  sessionDate: Date;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  type: ExerciseType;
  weight: number | null;
  reps: number | null;
  duration_seconds: number | null;
}

export interface HomeTopProgress {
  name: string;
  /** Przyrost w jednostce prezentacji (dodatni — pokazujemy tylko realny progres). */
  delta: number;
  suffix: string;
}

export interface HomePeriodFacts {
  /** Objętość 7 dni w jednostce prezentacji (kg kanoniczne → profil, DATA-02). */
  volume7: number;
  /** Zmiana objętości vs poprzedni tydzień; `null` = brak bazy do porównania. */
  volumePct: number | null;
  sessions7: number;
  sessions30: number;
  workingSets30: number;
  /** Największy przyrost siły w oknie 90 dni — to samo okno co `/progress`. */
  topProgress: HomeTopProgress | null;
  prCount30: number;
  unit: UnitSystem;
}

/** Ta sama formuła co `pct` w `app/progress/stats.ts` — jedna definicja zmiany. */
const pct = (a: number, b: number) => (b > 0 ? Math.round(((a - b) / b) * 100) : null);

/**
 * Największy przyrost per ćwiczenie w oknie 90 dni. Logika 1:1 z
 * `getStrengthTrends`: najlepsza metryka per ćwiczenie per sesja, ciąg
 * chronologiczny, `delta = ostatni − pierwszy`, minimum dwie sesje. Dzięki temu
 * Home i `/progress` nie mogą pokazać dwóch różnych liczb dla tego samego ruchu.
 */
function topProgressFrom(rows: HomeFactRow[], unit: UnitSystem): HomeTopProgress | null {
  const byExercise = new Map<
    string,
    { name: string; type: ExerciseType; perSession: Map<string, { at: number; best: number }> }
  >();

  for (const row of rows) {
    const value = setMetric(row.type, row);
    if (value == null) continue;
    let entry = byExercise.get(row.exerciseId);
    if (!entry) {
      entry = { name: row.exerciseName, type: row.type, perSession: new Map() };
      byExercise.set(row.exerciseId, entry);
    }
    const current = entry.perSession.get(row.sessionId);
    if (current == null || value > current.best) {
      entry.perSession.set(row.sessionId, { at: row.sessionDate.getTime(), best: value });
    }
  }

  let top: HomeTopProgress | null = null;
  for (const entry of byExercise.values()) {
    const series = [...entry.perSession.values()].sort((a, b) => a.at - b.at);
    if (series.length < 2) continue;
    const raw = series[series.length - 1].best - series[0].best;
    // DATA-02: konwersja dopiero na granicy prezentacji, jak w getStrengthTrends.
    const delta =
      entry.type === "weighted"
        ? Math.round((weightToDisplay(series[series.length - 1].best, unit) - weightToDisplay(series[0].best, unit)) * 10) / 10
        : Math.round(raw * 10) / 10;
    if (delta <= 0) continue;
    if (!top || delta > top.delta) {
      top = {
        name: entry.name,
        delta,
        suffix: entry.type === "weighted" ? unit : entry.type === "timed" ? "s" : "",
      };
    }
  }
  return top;
}

/**
 * `null`, gdy nie ma żadnej zakończonej sesji — Home nie renderuje wtedy sekcji
 * statystyk (kryterium akceptacji: „brak historii → sekcje w ogóle się nie
 * renderują", zero zamiast zer).
 */
export function aggregateHomePeriods({
  rows,
  sessionDates,
  prCount30,
  unit,
  now = Date.now(),
}: {
  rows: HomeFactRow[];
  /** `started_at` wszystkich zakończonych sesji w oknie 90 dni. */
  sessionDates: Date[];
  prCount30: number;
  unit: UnitSystem;
  now?: number;
}): HomePeriodFacts | null {
  if (sessionDates.length === 0) return null;

  const from7 = now - 7 * DAY;
  const from14 = now - 14 * DAY;
  const from30 = now - 30 * DAY;

  // Sesje liczymy z listy sesji, nie z serii — sesja bez zaliczonej serii nadal
  // jest sesją, dokładnie jak `periodStats.sessionCount`.
  let sessions7 = 0;
  let sessions30 = 0;
  for (const date of sessionDates) {
    const at = date.getTime();
    if (at >= from7) sessions7 += 1;
    if (at >= from30) sessions30 += 1;
  }

  let volume7Kg = 0;
  let volumePrev7Kg = 0;
  let workingSets30 = 0;
  for (const row of rows) {
    const at = row.sessionDate.getTime();
    if (at >= from30) workingSets30 += 1;
    // Objętość: iloczyn tylko gdy obie wartości istnieją — jak `periodStats`.
    if (row.weight == null || row.reps == null) continue;
    const volume = row.weight * row.reps;
    if (at >= from7) volume7Kg += volume;
    else if (at >= from14) volumePrev7Kg += volume;
  }

  return {
    volume7: weightToDisplay(volume7Kg, unit),
    volumePct: pct(volume7Kg, volumePrev7Kg),
    sessions7,
    sessions30,
    workingSets30,
    topProgress: topProgressFrom(rows, unit),
    prCount30,
    unit,
  };
}

/**
 * Objętość w kafelku jest zwarta (1/3 szerokości na 320 px), więc powyżej tysiąca
 * skracamy: kg → tony, lbs → tysiące. Sama liczba jest identyczna z `/progress`
 * (tam pełna, z grupowaniem) — różni się wyłącznie prezentacja, nie dane.
 */
export function formatVolumeCompact(
  value: number,
  unit: UnitSystem,
): { value: string; suffix: string } {
  if (value >= 1000) {
    return {
      value: (value / 1000).toLocaleString("pl-PL", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      suffix: unit === "kg" ? "t" : "k lb",
    };
  }
  return { value: Math.round(value).toLocaleString("pl-PL"), suffix: unit };
}

/** Znak zawsze jawny — spadek objętości jest informacją, nie porażką do ukrycia. */
export function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}%`;
}
