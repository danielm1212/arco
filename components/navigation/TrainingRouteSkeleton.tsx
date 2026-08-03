import type { TrainingSubview } from "./TrainingSubnav";
import { TrainingRouteHeader } from "./TrainingRouteHeader";

/**
 * Skeleton podwidoku Treningu zachowuje nagłówek i lokalne zakładki, żeby
 * przejście między nimi nie powodowało przeskoku chrome.
 */
export function TrainingRouteSkeleton({
  active,
  title,
}: {
  active: TrainingSubview;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TrainingRouteHeader active={active} title={title} />
      <main className="flex-1 animate-pulse space-y-md p-md">
        <div className="h-28 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
        <div className="grid grid-cols-3 gap-sm">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
        <div className="h-56 rounded-xl bg-muted" />
      </main>
    </div>
  );
}
