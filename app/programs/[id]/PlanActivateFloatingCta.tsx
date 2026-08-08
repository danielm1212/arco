"use client";

import { useEffect, useState } from "react";
import { setActiveProgram } from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { useSessionMiniVisible } from "@/components/navigation/SessionMiniVisibility";

/**
 * Floating CTA "Ustaw jako aktywny" — dubluje przycisk z hero, gdy ten
 * zjeżdża poza widok. Zgłoszenie właściciela: po przewinięciu w dół (opis,
 * szczegóły, dni planu) jedynym widocznym, klikalnym elementem zostawało
 * „Duplikuj i edytuj" na samym dole — akcja drugorzędna, która wyglądała
 * jak główna tylko dlatego, że nic innego nie było na ekranie.
 *
 * Ustępuje `SessionMiniBar` (ten sam slot „nad nawigacją", te same tokeny
 * pozycjonowania). W trakcie treningu zmiana aktywnego planu nie jest pilna
 * — górny CTA w hero zostaje jedyną ścieżką, zamiast dwóch floating barów
 * nachodzących na siebie w tym samym miejscu (decyzja właściciela 2026-08-07).
 *
 * Renderowany tylko, gdy plan NIE jest już aktywny (patrz warunek w page.tsx)
 * — inaczej `[data-program-cta]` byłby statusem „Aktywny", nie formularzem.
 */
export function PlanActivateFloatingCta({ programId }: { programId: string }) {
  const sessionMiniVisible = useSessionMiniVisible();
  const [anchorVisible, setAnchorVisible] = useState(true);

  useEffect(() => {
    const anchor = document.querySelector("[data-program-cta]");
    if (!anchor) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAnchorVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  if (anchorVisible || sessionMiniVisible) return null;

  return (
    <form
      action={setActiveProgram.bind(null, programId)}
      className="fixed inset-x-[var(--floating-nav-gap)] z-40 mx-auto max-w-[424px] bottom-[calc(var(--floating-nav-height)+var(--floating-nav-gap)+0.25rem)]"
    >
      <div className="rounded-xl bg-card p-xs shadow-e2">
        <Button type="submit" className="w-full">
          Ustaw jako aktywny
        </Button>
      </div>
    </form>
  );
}
