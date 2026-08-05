import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Prowadzenie/plany/dane (violet). Nie na główne CTA działania — te zostają `default` (rust).
        support: "bg-support text-support-foreground hover:bg-support/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Mobile-first: domyślny rozmiar to wygodny tap-target (44px).
        default: "h-11 px-5 py-2",
        // `sm` to GĘSTOŚĆ WIZUALNA, nie mniejszy cel dotyku (checklist §3.2: wszystkie
        // targety ≥44 px). Wcześniej było tu sztywne `h-9` = 36 px, czyli wariant
        // łamiący własną regułę — i widać było, że konsumenci to wiedzą, bo 4 z 14
        // wywołań doklejały ręcznie `min-h-11`. Łatka po stronie wywołań zawsze
        // pokrywa tylko część miejsc, więc próg wraca do wariantu.
        sm: "min-h-11 rounded-md px-3 py-1.5",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Akcja w toku: blokuje przycisk, ogłasza `aria-busy` i podmienia ikonę na spinner.
   *
   * Aplikacja stoi na Server Actions, więc stan zajętości jest wszędzie — i do audytu
   * komponentów (H4) był odtwarzany ręcznie w 15 plikach, każdy z własnym `disabled`
   * i własnym (albo żadnym) sygnałem dla czytnika ekranu. Pochodzenie stanu zostaje
   * po stronie wywołania (`useFormStatus` w formularzach, `useTransition` przy
   * mutacjach klienckich) — tu ląduje wyłącznie jego PREZENTACJA.
   *
   * Nie działa z `asChild`: Slot wymaga dokładnie jednego dziecka, a spinner byłby
   * drugim. Przy `asChild` prop steruje tylko `disabled`/`aria-busy`.
   */
  pending?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, pending = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // `disabled` nie wystarcza: czytnik ogłasza wtedy „niedostępny", a nie
        // „zajęty" — użytkownik nie wie, czy to trwa, czy się nie da.
        aria-busy={pending || undefined}
        disabled={disabled || pending}
        {...props}
      >
        {pending && !asChild ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
