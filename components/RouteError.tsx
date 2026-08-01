"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * AUDIT-A4 (audyt 2026-07-31): wspólny stan błędu tras.
 *
 * Do tej pory aplikacja nie miała ANI JEDNEGO `error.tsx` — sześć `loading.tsx`
 * było, stanu błędu nie było w ogóle, wbrew `CLAUDE.md` („każda funkcja: pusty,
 * ładowania, błędu, jasne CTA"). Rzut w RSC albo w akcji serwerowej kończył się
 * domyślnym ekranem Next.js: angielskie „Application error", Times New Roman, bez
 * logo i bez nawigacji. W PWA standalone (bez paska adresu i przycisku Wstecz) to
 * ślepy zaułek — jedynym wyjściem jest ubicie aplikacji.
 *
 * Copy trzyma tone-of-voice: mówi, co się stało, i daje jeden konkretny ruch.
 * Bez przepraszania, bez obwiniania użytkownika, bez „coś poszło nie tak".
 * `digest` pokazujemy drobnym drukiem — to jedyny ślad, po którym da się znaleźć
 * błąd w logach, gdy właściciel zgłasza go z telefonu.
 */
export function RouteError({
  title,
  description,
  reset,
  digest,
  homeHref = "/",
  homeLabel = "Wróć na Dziś",
}: {
  title: string;
  description: string;
  /** `reset` z `error.tsx` — ponawia render segmentu bez przeładowania aplikacji. */
  reset: () => void;
  digest?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    /* Bez ikony 3D clay, choć puste stany ją mają: te PNG-i ważą ~200 KB i nie są
       optymalizowane (`unoptimized` w `MomentIcon3D`). Ekran błędu bywa ostatnią
       rzeczą, jaką aplikacja zdąży pokazać na padającej sieci — nie może zależeć
       od ciężkiego zasobu. */
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-sm p-md text-center">
      <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-sm flex w-full flex-col gap-xs">
        <Button type="button" onClick={reset} className="w-full">
          Spróbuj ponownie
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
      {digest && (
        <p className="mt-xs text-xs text-muted-foreground">
          Kod błędu: <span className="font-mono tabular-nums">{digest}</span>
        </p>
      )}
    </main>
  );
}
