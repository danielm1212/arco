import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Header przestrzeni Trening (userflows §3): logo po lewej, slot badge'a i awatar
 * po prawej. Na Dziś w slocie stoi interaktywna passa (`StreakBadge` — tap
 * otwiera szczegół tygodnia); Plany świadomie nie pokazują nic (decyzja P2
 * audytu R2 — badge odpowiada na pytanie ekranu Dziś). Awatar zastępuje koło
 * zębate; do czasu pełnego ekranu profilu prowadzi do /settings.
 *
 * HOME-05b: prop nazywał się `goalSlot`, gdy w slocie stał cel tygodnia. Nazwa
 * jest teraz neutralna — slot opisuje MIEJSCE w headerze, nie treść, więc kolejna
 * zmiana symbolu nie wymaga ruszania headera.
 */
export function TrainingHeader({
  badgeSlot,
  displayName,
}: {
  /** Interaktywny badge (Dziś: passa) albo nic (Plany). */
  badgeSlot?: ReactNode;
  displayName: string | null;
}) {
  const monogram = (displayName ?? "").trim().charAt(0).toUpperCase() || null;

  return (
    <header className="flex items-center justify-between border-b px-sm py-sm">
      <span className="pl-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Arco"
          width={690}
          height={317}
          className="h-8 w-auto dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-dark.svg"
          alt=""
          aria-hidden
          width={690}
          height={317}
          className="hidden h-8 w-auto dark:block"
        />
      </span>
      <div className="flex items-center gap-xs">
        {badgeSlot}
        <Link
          href="/settings"
          aria-label="Profil i ustawienia"
          className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {monogram ?? <span aria-hidden>•</span>}
          </span>
        </Link>
      </div>
    </header>
  );
}
