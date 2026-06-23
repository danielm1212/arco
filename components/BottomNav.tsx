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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                on ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
