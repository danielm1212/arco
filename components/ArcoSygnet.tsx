import { cn } from "@/lib/utils";

/**
 * Sygnet Arco — kompaktowy znak marki (nie wordmark z „Arco").
 *
 * ── Dlaczego inline SVG, a nie dwa pliki w `public/` ───────────────────────
 * Dostarczone warianty light/dark różnią się WYŁĄCZNIE wypełnieniem, a oba kolory
 * to nasze istniejące tokeny marki:
 *   light `#C63F21` → `--arco-rust-500` = `--color-accent` → `text-primary`
 *   dark  `#F6F2ED` → `--arco-sand-100` = `--color-text`   → `dark:text-foreground`
 *
 * UWAGA na literalne porównanie hexów: tokeny trzymamy w HSL, więc po zaokrągleniu
 * renderują się jako rgb(196 63 33) i rgb(246 243 238) — o ≤2/255 na kanał obok
 * hexów z eksportu. To nie jest błąd do „poprawienia" hexem w tym pliku: CAŁA
 * aplikacja maluje rust właśnie tak, więc to sygnet z twardym `#C63F21` byłby
 * jedynym elementem odstającym od reszty marki. Zapisanie hexów poza systemem to
 * dokładnie ten rodzaj dryfu, przez który `themeColor` w `layout.tsx` przez pół
 * roku wskazywał barwy sprzed v1.4.
 *
 * Jeden `currentColor` + `text-primary dark:text-foreground` daje ten sam efekt,
 * czyta z tokenów i znosi sztuczkę z `dark:hidden` na dwóch `<img>`. Przy okazji
 * schodzi jedno żądanie sieciowe: dotąd przeglądarka pobierała OBA logotypy,
 * żeby jeden schować CSS-em.
 *
 * To ten sam wzorzec co `StreakFlame` — znak marki, który musi reagować na motyw,
 * mieszka w komponencie, nie w pliku statycznym.
 *
 * Wordmark (`/logo.svg`) zostaje bez zmian tam, gdzie jest miejsce na pełną nazwę
 * — dziś na ekranie logowania.
 */
export function ArcoSygnet({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 198 198"
      fill="none"
      role="img"
      aria-label="Arco"
      className={cn("text-primary dark:text-foreground", className)}
    >
      <path
        fill="currentColor"
        d="M96.089 36.1421C109.806 35.2899 121.145 38.2726 132.951 45.0347L132.955 38.6128C151.241 44.8068 166.375 57.3154 173.17 75.8413C178.866 91.372 179.094 108.483 172.002 123.631C164.16 140.01 150.104 152.576 132.955 158.544L132.948 151.788C116.971 161.313 103.45 163.328 85.2989 159.582C66.8816 155.161 53.7239 145.283 43.7911 129.378L43.7745 146.23C28.1634 132.288 20.2383 115.164 21.047 93.9087C21.7382 75.6158 30.4683 62.0879 43.7706 50.1333L43.8058 66.4439C45.793 63.2965 48.0292 60.3146 50.4933 57.5259C63.063 43.3501 77.4607 37.2505 96.089 36.1421ZM132.944 82.314C124.266 67.1841 112.512 59.3637 94.6271 60.9898C84.2174 62.6605 75.6849 67.4361 69.3361 75.9722C64.4077 82.8923 60.7851 93.743 62.3956 102.172C64.528 113.356 68.0739 122.515 77.9132 129.082C96.0472 141.192 118.087 136.809 130.2 119.055C130.473 118.647 130.74 118.236 130.995 117.818L132.959 114.493L132.966 130.27C142.373 123.244 148.349 116.294 150.132 104.236C151.729 94.1441 149.175 83.8366 143.054 75.6568C140.116 71.7066 137.044 68.9663 132.962 66.2603L132.944 82.314Z"
      />
    </svg>
  );
}
