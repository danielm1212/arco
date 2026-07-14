import Image from "next/image";
import { cn } from "@/lib/utils";

const MOMENT_ICONS = {
  gym: {
    light: "/icons-3d/production/gym-light.webp",
    dark: "/icons-3d/production/gym-dark.webp",
  },
  history: {
    light: "/icons-3d/production/fire-light.webp",
    dark: "/icons-3d/production/fire-dark.webp",
  },
  target: {
    light: "/icons-3d/production/target-light.webp",
    dark: "/icons-3d/production/target-dark.webp",
  },
  fire: {
    light: "/icons-3d/production/fire-light.webp",
    dark: "/icons-3d/production/fire-dark.webp",
  },
  calendar: {
    light: "/icons-3d/icon-3d-calendar-date-light.png",
    dark: "/icons-3d/icon-3d-calendar-date-dark.png",
  },
  medal: {
    light: "/icons-3d/icon-3d-medal-light.png",
    dark: "/icons-3d/icon-3d-medal-dark.png",
  },
  tick: {
    light: "/icons-3d/icon-3d-tick-light.png",
    dark: "/icons-3d/icon-3d-tick-dark.png",
  },
  rocket: {
    light: "/icons-3d/icon-3d-rocket-light.png",
    dark: "/icons-3d/icon-3d-rocket-dark.png",
  },
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
  const icon = MOMENT_ICONS[name];

  return (
    <span className={cn("relative block size-28 shrink-0", className)} aria-hidden="true">
      <Image
        src={icon.light}
        alt=""
        width={320}
        height={320}
        className="size-full object-contain dark:hidden"
        priority={priority}
        unoptimized
      />
      <Image
        src={icon.dark}
        alt=""
        width={320}
        height={320}
        className="hidden size-full object-contain dark:block"
        priority={priority}
        unoptimized
      />
    </span>
  );
}
