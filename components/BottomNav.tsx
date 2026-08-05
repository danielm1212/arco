"use client";

import Link from "next/link";
import { Dumbbell, House, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import type { AppTab } from "@/lib/appChrome";
import { useNavigationHistory } from "./navigation/NavigationHistory";

const TABS = [
  // HOME-05: „Dziś", nie „Home" — reszta nawigacji jest po polsku („Trening",
  // „Ekipa"), a angielskie słowo w środku polskiego paska było jedynym wyjątkiem.
  // „Dziś" mówi też, czego ten ekran dotyczy: dzisiejszego treningu, nie strony głównej.
  { id: "home", href: "/", label: "Dziś", icon: House },
  { id: "training", href: "/programs", label: "Trening", icon: Dumbbell },
  { id: "team", href: "/ekipa", label: "Ekipa", icon: UsersRound },
] as const;

export function BottomNav({ activeTab }: { activeTab: AppTab }) {
  const pathname = usePathname();
  const { markNextNavigation } = useNavigationHistory();
  return (
    <nav aria-label="Główna nawigacja" className="fixed inset-x-[var(--floating-nav-gap)] bottom-[var(--floating-nav-gap)] z-40 mx-auto max-w-[424px] rounded-full border border-border/70 bg-card p-1.5 shadow-e2">
      <div className="flex">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.id === activeTab;
          return (
            <Link
              key={t.href}
              href={t.href}
              replace
              onClick={(event) => {
                const modified =
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey;
                if (!modified && t.href !== pathname) markNextNavigation("replace");
              }}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                on ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
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
