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
 * Kanon opisuje skalę E0–E3 (`--shadow-e1/e2/e3`) i „polished edge" (§10). W kodzie
 * skala była do dziś martwa: `shadow-e1/e2/e3` miały ZERO użyć, a `.surface-polished`
 * jedno (hero na Home). Nie przepinam całej aplikacji na E1 przy okazji refaktoru,
 * bo to zmiana WIZUALNA na 42 kartach naraz, a nie porządkowanie kodu — decyzja
 * należy do właściciela identyfikacji, nie do sprzątania.
 *
 * Dlatego `subtle` (domyślne) trzyma dziś `shadow-sm`, czyli dokładnie obecny wygląd.
 * Przejście na kanon = zmiana JEDNEJ linii niżej (`subtle: "shadow-e1"`), bo wszystkie
 * karty czytają już ten wariant. Wtedy warto też rozważyć `polished` jako domyślne.
 *
 * `floating` i `overlay` od razu wskazują na E2/E3 — tam nie ma czego zachowywać,
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
      /**
       * Domyślna karta treści. Cień NIE jest tu wpisany, bo zależy od `polished`
       * — rozstrzygają go `compoundVariants` niżej. TODO(kanon §9): docelowo E1.
       */
      subtle: "",
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
  compoundVariants: [
    // `subtle` rozstrzyga się parą reguł, a nie wartością w wariancie, bo cva
    // DOKLEJA klasy z compoundVariants zamiast je podmieniać — wpisanie `shadow-sm`
    // wyżej dawało w wariancie polished dwa cienie naraz (`shadow-sm shadow-e1`)
    // i o tym, który wygra, decydowała kolejność w arkuszu. Złapał to test kontraktu,
    // nie oko: wizualnie różnica jest o włos.
    {
      // Legacy: dzisiejszy wygląd 35 kart. Zero regresji przy refaktorze.
      polished: false,
      elevation: "subtle",
      class: "shadow-sm",
    },
    {
      // Karta „polished" jest już NA kanonie (§10 idzie w parze z §9), więc jej
      // `subtle` znaczy E1. Dzięki temu hero na Home — jedyne miejsce z gradientową
      // krawędzią — po refaktorze wygląda co do piksela tak samo jak przed nim.
      polished: true,
      elevation: "subtle",
      class: "shadow-e1",
    },
  ],
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
