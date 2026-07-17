import { ReplaceLink } from "./ReplaceLink";

export function TrainingSubnav({ active }: { active: "today" | "plans" }) {
  return (
    <div className="px-md pt-md">
      <nav
        aria-label="Widok treningu"
        className="grid grid-cols-2 rounded-full bg-muted p-1"
      >
        <ReplaceLink
          href="/"
          aria-current={active === "today" ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-full px-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            active === "today"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dziś
        </ReplaceLink>
        <ReplaceLink
          href="/programs"
          aria-current={active === "plans" ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-full px-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            active === "plans"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Plany
        </ReplaceLink>
      </nav>
    </div>
  );
}
