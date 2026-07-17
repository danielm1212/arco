"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { isReviewDue, reviewStorageKey } from "@/lib/programReview";

const subscribeToNothing = () => () => {};

function readDismissedAt(key: string): number {
  const raw = window.localStorage.getItem(key);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Kontekstowy, dismissowalny insight o przeglądzie planu (plan §R2).
 * Stabilność renderu (R2.1): snapshot SSR zakłada „nie zamknięto" (0), więc
 * dla większości użytkowników sekcja jest w HTML od pierwszego renderu — bez
 * doklejania po hydratacji. Gdy insight był zamknięty, klient ukrywa go w
 * renderze hydratacyjnym, przed malowaniem — bez widocznego skoku layoutu.
 */
export function ProgramReviewInsight({
  userId,
  programId,
  completedSessions,
}: {
  userId: string;
  programId: string;
  completedSessions: number;
}) {
  const storageKey = reviewStorageKey(userId, programId);
  const [dismissed, setDismissed] = useState(false);
  const dismissedAt = useSyncExternalStore(
    subscribeToNothing,
    () => readDismissedAt(storageKey),
    () => 0,
  );
  const visible = !dismissed && isReviewDue(completedSessions, dismissedAt);

  if (!visible) return null;

  return (
    <section
      className="relative space-y-sm rounded-xl border border-primary/20 bg-primary/5 p-md"
      aria-label="Wskazówka o przeglądzie planu"
    >
      <button
        type="button"
        aria-label="Zamknij wskazówkę o przeglądzie planu"
        className="absolute right-2 top-2 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => {
          window.localStorage.setItem(storageKey, String(completedSessions));
          setDismissed(true);
        }}
      >
        <X className="size-4" aria-hidden />
      </button>
      <p className="pr-10 text-xs font-medium text-primary">Kolejny krok</p>
      <h2 className="pr-10 text-lg font-semibold">
        Masz już {completedSessions} treningów w tym planie
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Jeśli nadal robisz postęp i treningi mieszczą się w Twoim tygodniu, zostań przy planie.
        Jeśli od 2–3 sesji stoisz w miejscu, zrób lżejszą sesję i porównaj kolejny poziom lub
        częstotliwość.
      </p>
      <div className="grid grid-cols-2 gap-sm">
        <Button variant="outline" asChild>
          <Link href={`/programs/${programId}`}>Sprawdź plan</Link>
        </Button>
        <Button asChild>
          <Link href="/programs">Porównaj opcje</Link>
        </Button>
      </div>
    </section>
  );
}
