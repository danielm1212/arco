import { TrainingHeader } from "@/components/TrainingHeader";
import { TrainingSubnav } from "@/components/navigation/TrainingSubnav";

/**
 * NAV-01: loading Planów zachowuje wspólny chrome przestrzeni Trening —
 * header i pasek czterech zakładek nie mogą znikać przy przejściu między
 * podwidokami. Pulsuje wyłącznie treść.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TrainingHeader displayName={null} />
      <TrainingSubnav active="plans" />
      <main className="flex-1 animate-pulse space-y-lg p-md">
        <div className="space-y-sm">
          <div className="h-5 w-32 rounded bg-muted" />
          <RowSkeleton />
        </div>
        <div className="space-y-sm">
          <div className="h-5 w-44 rounded bg-muted" />
          {[0, 1, 2].map((item) => (
            <RowSkeleton key={item} />
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * PLAN-05E: skeleton odwzorowuje realny układ karty — miniatura 64×64 w lewej
 * kolumnie, treść obok i osobna stopka na poziom oraz akcję. Kształt musi się
 * zgadzać z `ProgramRow`, inaczej lista przeskakuje w momencie hydratacji.
 */
function RowSkeleton() {
  return (
    <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-sm rounded-xl border border-transparent bg-muted p-sm">
      <div className="size-16 rounded-lg bg-background/60" />
      <div className="col-start-2 row-start-1 space-y-2xs">
        <div className="h-4 w-3/5 rounded bg-background/60" />
        <div className="h-4 w-16 rounded-full bg-background/60" />
        <div className="h-3 w-4/5 rounded bg-background/60" />
      </div>
      <div className="col-start-2 row-start-2 mt-xs flex min-h-11 items-center gap-sm">
        <div className="h-4 w-24 rounded bg-background/60" />
        <div className="ml-auto h-8 w-16 rounded-md bg-background/60" />
      </div>
    </div>
  );
}
