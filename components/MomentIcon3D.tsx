import Image from "next/image";
import { cn } from "@/lib/utils";

const MOMENT_ICONS = {
  team: "/icons-3d/icon-3d-team.png",
  history: "/icons-3d/icon-3d-history.png",
  progress: "/icons-3d/icon-3d-progress.png",
  plan: "/icons-3d/icon-3d-plan.png",
  workoutComplete: "/icons-3d/icon-3d-workout-complete.png",
  bodyMeasurements: "/icons-3d/icon-3d-body-measurements.png",
  equipment: "/icons-3d/icon-3d-equipment.png",
} as const;

export type MomentIconName = keyof typeof MOMENT_ICONS;

export function MomentIcon3D({
  name,
  className,
  priority = false,
}: {
  name: MomentIconName;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative block size-28 shrink-0", className)} aria-hidden="true">
      <Image
        src={MOMENT_ICONS[name]}
        alt=""
        width={320}
        height={320}
        className="size-full object-contain"
        priority={priority}
        unoptimized
      />
    </span>
  );
}
