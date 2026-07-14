"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, TrendingUp, History, Scale } from "lucide-react";

const TABS = [
  { href: "/", label: "Trening", icon: Dumbbell, match: (p: string) => p === "/" || p.startsWith("/programs") },
  { href: "/progress", label: "Postępy", icon: TrendingUp, match: (p: string) => p.startsWith("/progress") || p.startsWith("/exercise") },
  { href: "/history", label: "Historia", icon: History, match: (p: string) => p.startsWith("/history") },
  { href: "/body", label: "Ciało", icon: Scale, match: (p: string) => p.startsWith("/body") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Główna nawigacja" className="fixed inset-x-[var(--floating-nav-gap)] bottom-[var(--floating-nav-gap)] z-40 mx-auto max-w-[424px] rounded-full border border-border/70 bg-card p-1.5 shadow-lg">
      <div className="flex">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                on ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-5" aria-hidden />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
