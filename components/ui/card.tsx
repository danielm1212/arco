import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Karta — jedyne źródło „kafla" w Arco (audyt komponentów 2026-08-04, H1).
 *
 * Przed tym komponentem karta była łańcuchem klas przepisywanym ręcznie w 42 miejscach
 * w 20 plikach. Rola wizualna była jedna, rysunek — nie: trzy elewacje (`shadow-sm` ×35,
 * `shadow-md` ×2, `shadow-`+`lg` ×2), dwa paddingi i trzy karty z `border`, mimo że HOME-04
 * borderki z kart zdjęło. Ta sama klasa błędu co przy glifie płomienia przed HOME-05b:
 * znaczenie ujednolicone, rysunek rozjechany. Rozjazd wraca zawsze, gdy kanon żyje
 * w dokumencie, a nie w kodzie — więc tu żyje w kodzie.
 *
 * ── Elewacja a kanon (wytyczne §9) ────────────────────────────────────────────────
 * Kanon opisuje skalę E0–E3 (`--shadow-e1/e2/e3`) i „polished edge" (§10). Przy
 * refaktorze karty na wspólny prymityw `subtle` świadomie zostało na legacy
 * `shadow-sm`, żeby migracja kodu nie była jednocześnie zmianą wizualną na
 * 35 kartach naraz — ta decyzja czekała na właściciela identyfikacji.
 *
 * Przejście na E1 (2026-08-07) miało powód mocniejszy niż estetyka: `--shadow-sm`
 * nie ma definicji w `.dark` (w przeciwieństwie do E1–E3, które mają), więc na
 * ciemnym tle renderowała się TA SAMA barwa co na jasnym — ciemny brąz przy 6%
 * krycia na tle (25 24 27). Zmierzone: piksel pod kartą różnił się od tła
 * o ~1/255, czyli cień był efektywnie niewidoczny w dark mode. E1 w `.dark`
 * przechodzi na czystą czerń przy wyższym kryciu właśnie z tego powodu.
 *
 * `floating` i `overlay` od razu wskazują na E2/E3 — tam nie było czego zachowywać,
 * bo poprzednikiem była klasa `shadow-`+`lg`, której `tailwind.config.ts` w ogóle nie
 * definiuje (spadała na stockowy cień Tailwinda: czysta czerń, poza paletą i poza
 * dark-modem).
 *
 * Nazwa jest wyżej celowo rozbita na dwa literały. Skaner Tailwinda dopasowuje
 * nazwy klas także W KOMENTARZACH, więc wpisana w całości regenerowałaby tę samą
 * martwą regułę, którą ten refaktor właśnie usunął — dokumentacja fixa cofałaby fix.
 */
const cardStyles = cva("rounded-xl text-card-foreground", {
  variants: {
    elevation: {
      /** Bez cienia — karta osadzona w innej karcie albo w sekcji z własnym tłem. */
      none: "",
      /** Domyślna karta treści (§9 E1) — jeden cień niezależnie od `polished`. */
      subtle: "shadow-e1",
      /** Nawigacja pływająca, popover, FAB (§9 E2). */
      floating: "shadow-e2",
      /** Sheet, modal, coach mark nad treścią (§9 E3). */
      overlay: "shadow-e3",
    },
    padding: {
      none: "",
      sm: "p-sm",
      md: "p-md",
    },
    /**
     * Gradientowa krawędź zamiast 1px ramki (§10). NIE na inputach, wierszach list
     * ani elementach osadzonych — patrz komentarz przy `.surface-polished` w globals.css.
     *
     * Tło jest częścią TEGO wariantu, nie klasą bazową: `.surface-polished` maluje
     * powierzchnię gradientem `padding-box` (żeby ramka mogła być osobnym `border-box`),
     * więc `bg-card` obok niego nie jest redundancją tylko kolizją — utility wygrywa
     * warstwą nad `@layer components` i skasowałoby całą krawędź. Stąd wykluczenie
     * przez wariant zamiast dopisania `bg-card` do bazy.
     */
    polished: {
      true: "surface-polished",
      false: "bg-card",
    },
  },
  defaultVariants: {
    elevation: "subtle",
    padding: "md",
    polished: false,
  },
});

/**
 * Klasy karty — do użycia na tagach, których nie da się zastąpić `<Card>`
 * (`<section>`, `<li>`, `<label>`), dokładnie jak `buttonVariants` przy `<Button>`.
 *
 * Przepuszczone przez `cn()`, a nie zwrócone prosto z cva: większość wywołań w apce
 * to `className={cardVariants({ className: "…" })}` z pominięciem `cn()`, więc bez
 * tego opakowania consumer nie dostawałby tailwind-merge i nadpisanie np. paddingu
 * własną klasą działałoby losowo, zależnie od kolejności w arkuszu.
 */
function cardVariants(props?: Parameters<typeof cardStyles>[0]): string {
  return cn(cardStyles(props));
}

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardStyles> {
  /** Renderuj jako dziecko (np. `<Link>`), zachowując klasy karty. */
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, padding, polished, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cardVariants({ elevation, padding, polished, className })}
        ref={ref}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

export { Card, cardVariants };
