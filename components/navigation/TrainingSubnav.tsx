import { ReplaceLink } from "./ReplaceLink";

export const TRAINING_SUBVIEWS = [
  { id: "plans", href: "/programs", label: "Plany" },
  { id: "progress", href: "/progress", label: "Postępy" },
  { id: "body", href: "/body", label: "Ciało" },
  { id: "history", href: "/history", label: "Historia" },
] as const;

export type TrainingSubview = (typeof TRAINING_SUBVIEWS)[number]["id"];

export function TrainingSubnav({ active }: { active: TrainingSubview }) {
  return (
    <div className="px-md pt-md">
      <nav
        aria-label="Sekcje treningu"
        className="grid grid-cols-4 rounded-full bg-muted p-1"
      >
        {TRAINING_SUBVIEWS.map((item) => (
          <ReplaceLink
            key={item.id}
            href={item.href}
            aria-current={active === item.id ? "page" : undefined}
            className={`flex min-h-11 min-w-0 items-center justify-center rounded-full px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active === item.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </ReplaceLink>
        ))}
      </nav>
    </div>
  );
}
