"use client";

import Link from "next/link";
import { Dumbbell, TrendingUp, History, UsersRound } from "lucide-react";
import type { AppTab } from "@/lib/appChrome";
import { useNavigationHistory } from "./navigation/NavigationHistory";

const TABS = [
  { id: "training", href: "/", label: "Trening", icon: Dumbbell },
  { id: "progress", href: "/progress", label: "Postępy", icon: TrendingUp },
  { id: "history", href: "/history", label: "Historia", icon: History },
  { id: "team", href: "/ekipa", label: "Ekipa", icon: UsersRound },
] as const;

export function BottomNav({ activeTab }: { activeTab: AppTab }) {
  const { markNextNavigation } = useNavigationHistory();
  return (
    <nav aria-label="Główna nawigacja" className="fixed inset-x-[var(--floating-nav-gap)] bottom-[var(--floating-nav-gap)] z-40 mx-auto max-w-[424px] rounded-full border border-border/70 bg-card p-1.5 shadow-lg">
      <div className="flex">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.id === activeTab;
          return (
            <Link
              key={t.href}
              href={t.href}
              replace
              onClick={() => {
                if (!on) markNextNavigation("replace");
              }}
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
