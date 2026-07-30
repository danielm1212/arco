import type { ProgramFocus } from "@/lib/programRecommendation";

type ProgramCoverFocus = ProgramFocus | null | undefined;
export type ProgramCoverSize = "row" | "hero";

/**
 * PLAN-05B: fallback musi odróżniać kierunek planu także wtedy, gdy w bazie
 * nie ma jeszcze żadnego adresu okładki. Używamy primitive palette bez
 * dokładania nowego tokenu semantycznego dla jednego, dekoracyjnego elementu.
 */
export function programCoverGradient(focusKey: ProgramCoverFocus): string {
  if (focusKey === "lower_body") {
    return "bg-gradient-to-br from-[hsl(var(--arco-violet-50))] to-[hsl(var(--arco-violet-100))] dark:from-[hsl(var(--arco-violet-900))] dark:to-[hsl(var(--arco-violet-800))]";
  }

  return "bg-gradient-to-br from-[hsl(var(--arco-rust-50))] to-[hsl(var(--arco-rust-100))] dark:from-[hsl(var(--arco-rust-900))] dark:to-[hsl(var(--arco-rust-800))]";
}

export function programCoverSizeClass(size: ProgramCoverSize): string {
  return size === "hero" ? "aspect-[4/3] w-full rounded-t-xl" : "size-16 rounded-lg";
}
