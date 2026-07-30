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
          <div className="h-20 rounded-xl bg-muted" />
        </div>
        <div className="space-y-sm">
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
        </div>
      </main>
    </div>
  );
}
