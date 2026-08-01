import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * AUDIT-A4: pięć tras woła `notFound()` (sesja, ekran Done, szczegół historii,
 * plan, ćwiczenie) i do tej pory każde z tych wywołań lądowało na domyślnej,
 * angielskiej stronie Next.js — bez nawigacji, w PWA bez drogi powrotu.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-sm p-md text-center">
      <h1 className="text-2xl font-semibold leading-tight">Nie ma takiej strony</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ten trening, plan albo ćwiczenie mogło zostać usunięte, albo link jest z innego konta.
      </p>
      <div className="mt-sm flex w-full flex-col gap-xs">
        <Button asChild className="w-full">
          <Link href="/">Wróć na Dziś</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/history">Otwórz historię</Link>
        </Button>
      </div>
    </main>
  );
}
