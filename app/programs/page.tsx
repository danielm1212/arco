import Link from "next/link";
import { CalendarDays, Check, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createProgram } from "@/app/actions/program";
import { Button } from "@/components/ui/button";
import { LevelMeter } from "@/components/LevelMeter";
import { ProgramCover } from "@/components/ProgramCover";
import {
  formatEquipment,
  missingProgramEquipment,
  type ProgramFocus,
} from "@/lib/programRecommendation";
import {
  formatProgramDuration,
  formatProgramFrequency,
  formatProgramLevelLabel,
} from "@/lib/programDetail";
import {
  formatProgramCardTitle,
  formatProgramEnvironmentTag,
  formatProgramSplitTag,
} from "@/lib/programListCard";
import { cn } from "@/lib/utils";
import { ProgramFilters } from "./ProgramFilters";
import { ProgramLevelChips } from "./ProgramLevelChips";
import { TrainingRouteHeader } from "@/components/navigation/TrainingRouteHeader";
import { FavoriteProgramButton } from "./FavoriteProgramButton";

export const dynamic = "force-dynamic";

type Prog = {
  id: string;
  name: string;
  short_name: string | null;
  split_key: string | null;
  cycle_days: number;
  user_id: string | null;
  goal: string | null;
  level: string | null;
  level_min: number | null;
  level_max: number | null;
  environment: string | null;
  focus_key: ProgramFocus;
  frequency_min: number | null;
  frequency_max: number | null;
  estimated_minutes_min: number | null;
  estimated_minutes_max: number | null;
  cover_thumbnail_url: string | null;
  required_equipment: string[];
  program_days: { id: string }[];
};

type LibraryFilters = {
  environment?: string;
  level?: string;
  goal?: string;
  focus?: string;
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<LibraryFilters>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: programs },
    { data: active },
    { data: settings },
    { data: favorites },
  ] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, short_name, split_key, cycle_days, user_id, goal, level, level_min, level_max, environment, focus_key, frequency_min, frequency_max, estimated_minutes_min, estimated_minutes_max, cover_thumbnail_url, required_equipment, program_days(id)")
      .order("user_id", { nullsFirst: true }),
    supabase.from("user_active_program").select("program_id").maybeSingle(),
    supabase.from("user_settings").select("training_focus, available_equipment").maybeSingle(),
    supabase
      .from("favorite_programs")
      .select("program_id, created_at")
      .order("created_at", { ascending: false }),
  ]);
  const activeId = active?.program_id ?? null;
  const preferredFocus = settings?.training_focus ?? "balanced";
  const availableEquipment = settings?.available_equipment ?? [];
  const allPrograms = (programs as Prog[]) ?? [];
  const programById = new Map(allPrograms.map((program) => [program.id, program]));
  const favoriteIds = new Set((favorites ?? []).map((favorite) => favorite.program_id));
  const favoritePrograms = (favorites ?? [])
    .map((favorite) => programById.get(favorite.program_id))
    .filter((program): program is Prog => !!program && program.id !== activeId);
  const activeProgram = allPrograms.find((p) => p.id === activeId) ?? null;
  const own = allPrograms.filter((p) => p.user_id === user?.id && p.id !== activeId);
  const presets = allPrograms
    .filter((p) => p.user_id === null && p.id !== activeId)
    .sort((a, b) => {
      const environmentOrder = { gym: 0, home: 1, bodyweight: 2 } as Record<string, number>;
      return (
        Number(missingProgramEquipment(a.required_equipment, availableEquipment).length > 0) -
          Number(missingProgramEquipment(b.required_equipment, availableEquipment).length > 0) ||
        (a.level_min ?? 9) - (b.level_min ?? 9) ||
        (preferredFocus === "lower_body"
          ? Number(b.focus_key === preferredFocus) - Number(a.focus_key === preferredFocus)
          : 0) ||
        (environmentOrder[a.environment ?? ""] ?? 9) - (environmentOrder[b.environment ?? ""] ?? 9) ||
        (a.frequency_min ?? 9) - (b.frequency_min ?? 9)
      );
    });
  // PLAN-05H: chipsy poziomu zastępują nagłówki grup „Początkujący”/„Średniozaawansowani”/
  // „Zaawansowani”. Lista jest teraz płaska — kolejność daje wcześniejsze sortowanie
  // `presets` (sprzęt → poziom → kierunek → środowisko → częstotliwość), więc plan
  // startowy nadal wypada przed zaawansowanym pod chipem „Wszystkie” bez osobnych koszy.
  // Plan o ZAKRESIE poziomów (`level_min < level_max`) pasuje do każdego chipa w tym
  // zakresie — dziś żaden preset takiego zakresu nie ma (ostatnie dwa zwężone do
  // pojedynczego poziomu w tej samej paczce), ale filtr zostaje na to odporny.
  const selectedLevel = Number(filters.level);
  const hasSelectedLevel = Number.isInteger(selectedLevel) && selectedLevel >= 1 && selectedLevel <= 3;
  const visiblePresets = presets.filter(
    (program) =>
      (!hasSelectedLevel ||
        (program.level_min !== null &&
          program.level_max !== null &&
          program.level_min <= selectedLevel &&
          program.level_max >= selectedLevel)) &&
      (!filters.environment || program.environment === filters.environment) &&
      (!filters.goal || program.goal === filters.goal) &&
      (!filters.focus || program.focus_key === filters.focus),
  );
  const goals = [...new Set(presets.map((program) => program.goal).filter((goal): goal is string => !!goal))].sort((a, b) => a.localeCompare(b, "pl"));

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TrainingRouteHeader active="plans" title="Plany" />

      <main className="flex-1 space-y-lg p-md">
        {activeProgram && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Aktywny plan</h2>
            <ProgramRow
              p={activeProgram}
              kind={activeProgram.user_id ? "own" : "preset"}
              isActive
              isFavorite={favoriteIds.has(activeProgram.id)}
              preferredFocus={preferredFocus}
              missingEquipment={missingProgramEquipment(activeProgram.required_equipment, availableEquipment)}
            />
          </section>
        )}

        <section className="space-y-xs">
          <p className="text-sm text-muted-foreground">Chcesz ułożyć trening po swojemu?</p>
          <form action={createProgram}>
            <Button type="submit" variant="outline" className="w-full">
              Utwórz własny program
            </Button>
          </form>
        </section>

        {favoritePrograms.length > 0 && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Ulubione</h2>
            {favoritePrograms.map((p) => (
              <ProgramRow
                key={p.id}
                p={p}
                kind={p.user_id ? "own" : "preset"}
                isActive={false}
                isFavorite
                preferredFocus={preferredFocus}
                missingEquipment={missingProgramEquipment(
                  p.required_equipment,
                  availableEquipment,
                )}
              />
            ))}
          </section>
        )}

        {own.length > 0 && (
          <section className="space-y-sm">
            <h2 className="text-base font-semibold">Moje programy</h2>
            {own.map((p) => (
              <ProgramRow
                key={p.id}
                p={p}
                kind="own"
                isActive={false}
                isFavorite={favoriteIds.has(p.id)}
                preferredFocus={preferredFocus}
              />
            ))}
          </section>
        )}

        <section className="space-y-sm">
          <div className="flex items-start justify-between gap-sm">
            <div className="space-y-2xs">
              <h2 className="text-base font-semibold">Biblioteka programów</h2>
              <p className="text-sm text-muted-foreground">Najpierw pokazujemy plany zgodne z Twoim sprzętem i tygodniem.</p>
            </div>
            <ProgramFilters filters={filters} goals={goals} />
          </div>
          <ProgramLevelChips filters={filters} />
          {/* Licznik wyników: filtr bez sprzężenia zwrotnego zostawiał wątpliwość,
              czy pusta przestrzeń to koniec listy czy błąd. Liczba mnoga po polsku
              ma trzy formy — 1 plan / 2-4 plany / 5+ planów. */}
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {visiblePresets.length}{" "}
            {visiblePresets.length === 1
              ? "plan"
              : visiblePresets.length % 10 >= 2 &&
                  visiblePresets.length % 10 <= 4 &&
                  !(visiblePresets.length % 100 >= 12 && visiblePresets.length % 100 <= 14)
                ? "plany"
                : "planów"}
          </p>
          {visiblePresets.length === 0 && (
            <div className="rounded-xl bg-muted p-md text-sm text-muted-foreground">Nie ma jeszcze planu spełniającego te warunki. Wyczyść filtr albo wybierz najbliższy wariant.</div>
          )}
          {visiblePresets.map((p) => (
            <ProgramRow
              key={p.id}
              p={p}
              kind="preset"
              isActive={false}
              isFavorite={favoriteIds.has(p.id)}
              preferredFocus={preferredFocus}
              missingEquipment={missingProgramEquipment(p.required_equipment, availableEquipment)}
            />
          ))}
        </section>

      </main>
    </div>
  );
}

function ProgramRow({
  p,
  kind,
  isActive,
  isFavorite,
  preferredFocus,
  missingEquipment = [],
}: {
  p: Prog;
  kind: "own" | "preset";
  isActive: boolean;
  isFavorite: boolean;
  preferredFocus: string;
  missingEquipment?: string[];
}) {
  const environmentTag = formatProgramEnvironmentTag(p.environment);
  // PLAN-05F: liczba RÓŻNYCH treningów w cyklu, nie sesji w tygodniu — zasila notację FBW A/B.
  const splitTag = formatProgramSplitTag(p.split_key, p.program_days?.length ?? 0);
  const matchesPreferredFocus =
    kind === "preset" && preferredFocus === "lower_body" && p.focus_key === preferredFocus;
  const frequency =
    p.frequency_min !== null && p.frequency_max !== null
      ? formatProgramFrequency(p.frequency_min, p.frequency_max)
      : null;
  const duration =
    p.estimated_minutes_min !== null && p.estimated_minutes_max !== null
      ? formatProgramDuration(p.estimated_minutes_min, p.estimated_minutes_max)
      : null;

  return (
    <article
      data-program-row
      className={cn(
        "relative grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-sm rounded-xl border bg-card p-sm text-card-foreground shadow-sm",
        // PLAN-05E: aktywny plan to stan całej karty, nie osobna pigułka obok CTA.
        // Znaczenie niesie nagłówek sekcji „Aktywny plan” i tekst „Aktywny” w stopce,
        // więc stan nie zależy od koloru (WCAG 1.4.1); obrys tylko go wzmacnia.
        // Krycie 80%, nie 40%: policzone 3.42:1 (light) i 3.92:1 (dark) wobec canvasu —
        // przy 40% obrys miał 1.71:1 i praktycznie nie było go widać (pomiar 2026-07-30).
        // Tło aktywnej karty świadomie zrównane z resztą (2026-08-08, zgłoszenie
        // właściciela): nagłówek sekcji „Aktywny plan” już oznacza wyjątkowość tej
        // karty, więc dokładanie koloru tła obok obrysu było powtórzeniem tego
        // samego sygnału. `border-transparent` na nieaktywnych: karty nie zmieniają
        // rozmiaru przy zmianie stanu.
        isActive ? "border-primary/80" : "border-transparent",
      )}
    >
      {/* Serce w prawym górnym rogu całej karty, nie w stopce (2026-08-08,
          zgłoszenie właściciela) — usunięcie „Ustaw” (aktywacja jest teraz
          wyłącznie ze szczegółu planu, `PlanActivateFloatingCta`) zostawiłoby
          serce jako jedyny element stopki, więc przenosi się wyżej, a karta
          traci całą stopkę dla nieaktywnych wierszy. Poza `<Link>` — to
          osobne zachowanie, nie wejście w szczegół planu. */}
      <div className="absolute right-xs top-xs z-10">
        <FavoriteProgramButton
          programId={p.id}
          programName={p.name}
          isFavorite={isFavorite}
        />
      </div>
      {/* PLAN-05H: miniatura wchodzi do wnętrza `<Link>` (bug z audytu 2026-07-30 —
          `ProgramCover` leżał poza linkiem jako osobne dziecko grida, więc klikanie
          w zdjęcie, najbardziej rzucający się w oczy element karty, nic nie robiło).
          `<Link>` rozciąga się na obie kolumny w rzędzie 1 i sam układa miniaturę +
          treść przez wewnętrzny grid o tym samym szablonie co `<article>`. */}
      <Link
        href={`/programs/${p.id}`}
        className="col-span-2 row-start-1 grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ProgramCover
          coverImageUrl={p.cover_thumbnail_url}
          focusKey={p.focus_key}
          size="row"
        />
        <div className="min-w-0">
          {/* PLAN-05E: tytuł prezentacyjny. Poziom, środowisko i częstotliwość mają
              na karcie własne miejsca, więc nie powtarzamy ich w nazwie — pełna nazwa
              zostaje w bazie i na `/programs/[id]`. Karta wciąż wypowiada komplet
              informacji dla czytnika (tag, fakty, `aria-label` miernika), dlatego nie
              doklejamy tu ukrytej kopii pełnej nazwy. */}
          {/* `pr-11`: rezerwuje miejsce na serce w prawym górnym rogu karty (44 px),
              żeby długi tytuł się pod nim nie chował. */}
          <p className="break-words pr-11 font-medium leading-snug">
            {formatProgramCardTitle(p.short_name, p.name)}
          </p>
          {/* PLAN-05F: dwa tagi — gdzie trenujesz + jaką metodą. Oba neutralne: violet
              jest zarezerwowany na prowadzenie/dane, ale reguła palety v1.4 zabrania
              mieszać go z rust w jednym komponencie, a karta ma już rust w kropkach
              poziomu i w „Ustaw”. Metoda i tak odróżnia się treścią, nie kolorem. */}
          {(environmentTag || splitTag || matchesPreferredFocus) && (
            <div className="mt-2xs flex flex-wrap items-center gap-2xs">
              {environmentTag && (
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {environmentTag}
                </span>
              )}
              {splitTag && (
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {splitTag}
                </span>
              )}
              {matchesPreferredFocus && (
                <span className="inline-flex rounded-full bg-support/15 px-2 py-0.5 text-xs font-medium text-support">
                  Pasuje do Twojego kierunku
                </span>
              )}
            </div>
          )}
          {/* R2.1 (audyt P1): karta = nazwa + dwa fakty, nie tabela filtrów.
              PLAN-05G: ikony jak w szczególe planu (05D) — kalendarz przy rytmie,
              zegar przy czasie. Dekoracyjne (`aria-hidden`), bo jednostka w tekście
              już mówi, co to jest; ikona tylko przyspiesza skanowanie listy. */}
          {kind === "preset" ? (
            (frequency || duration) && (
              <p className="mt-2xs flex flex-wrap items-center gap-x-sm gap-y-2xs text-xs text-muted-foreground">
                {frequency && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays aria-hidden className="size-3.5 shrink-0" />
                    {frequency}
                  </span>
                )}
                {duration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden className="size-3.5 shrink-0" />
                    {duration}
                  </span>
                )}
              </p>
            )
          ) : (
            <p className="mt-2xs break-words text-xs text-muted-foreground">
              {p.cycle_days} dni w cyklu · edytuj →
            </p>
          )}
          {/* PLAN-05H: poziom na WŁASNEJ linii, nie w stopce obok „Ustaw”. Etykieta jest
              teraz na KAŻDEJ karcie presetu (nagłówki grup zniknęły — poziom filtrują
              chipy nad listą), a `Średniozaawansowany`/`Zaawansowany` + przycisk razem
              nie mieszczą się w jednym wierszu na 320 px — brakuje ~30–40 px, więcej niż
              da się odzyskać ścieśnieniem odstępów. 10 z 15 presetów (poziom 2–3) łamało
              stopkę i rosło o 20 px (zmierzone 2026-07-31). Własna linia ma pełną
              szerokość kolumny treści, więc mieści się z zapasem — zweryfikowane dla
              najdłuższej etykiety na 320 px. */}
          {kind === "preset" && (
            <div className="mt-2xs">
              <LevelMeter
                levelMin={p.level_min}
                levelMax={p.level_max}
                label={formatProgramLevelLabel(p.level)}
                variant="list"
              />
            </div>
          )}
          {kind === "preset" && missingEquipment.length > 0 && (
            <p className="mt-2xs break-words text-xs text-amber-800 dark:text-amber-300">
              Potrzebujesz: {formatEquipment(missingEquipment, 2)}
            </p>
          )}
        </div>
      </Link>
      {/* Stopka zostaje wyłącznie dla „Aktywny” — „Ustaw” usunięte (2026-08-08,
          zgłoszenie właściciela): aktywacja jest teraz TYLKO ze szczegółu planu
          (`PlanActivateFloatingCta`), dwie równorzędne drogi do tego samego
          dublowałyby się bez potrzeby. Bez tego dla nieaktywnych kart nie ma
          już nic do pokazania w stopce — karta kończy się na treści `<Link>`. */}
      {isActive && (
        <div className="col-start-2 row-start-2 mt-xs flex min-h-11 min-w-0 items-center justify-end">
          <span className="inline-flex items-center gap-2xs px-1 text-xs font-medium text-foreground">
            <Check aria-hidden className="size-4 text-primary" />
            Aktywny
          </span>
        </div>
      )}
    </article>
  );
}
