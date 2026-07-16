import { ReplaceLink } from "./ReplaceLink";

export function ProgressSubnav({ active }: { active: "training" | "body" }) {
  return (
    <div className="px-md pt-md">
      <nav
        aria-label="Widok postępów"
        className="grid grid-cols-2 rounded-full bg-muted p-1"
      >
        <ReplaceLink
          href="/progress"
          aria-current={active === "training" ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-full px-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            active === "training"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Trening
        </ReplaceLink>
        <ReplaceLink
          href="/body"
          aria-current={active === "body" ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-full px-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            active === "body"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ciało
        </ReplaceLink>
      </nav>
    </div>
  );
}
