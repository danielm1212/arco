import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Pole tekstowe.
 *
 * Stan błędu sterowany natywnym `aria-invalid`, a NIE osobnym propem `error`.
 * Powód (audyt komponentów 2026-08-04, M3): przed tą zmianą komponent nie miał
 * żadnego wariantu błędu, a `aria-invalid` nie występowało w całej aplikacji ani
 * razu — przy sześciu ekranach z formularzami. Komunikat walidacji był więc samym
 * tekstem obok pola: widocznym dla oka, niepowiązanym programowo z polem (WCAG 3.3.1).
 *
 * Wiązanie stylu z atrybutem zamiast dublowania go propem ma jedną twardą zaletę:
 * nie da się dostać czerwonej ramki bez ogłoszenia błędu czytnikowi ani odwrotnie —
 * te dwie rzeczy nie mogą się rozjechać, bo są jedną rzeczą.
 *
 * Sam kolor nie niesie komunikatu (WCAG 1.4.1) — obok pola nadal musi stać tekst
 * błędu, podpięty przez `aria-describedby`.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 min-w-0 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Ring też w barwie błędu — inaczej fokus na błędnym polu wraca do
          // neutralnego violetu i gasi jedyny wizualny sygnał błędu dokładnie
          // w momencie, w którym użytkownik przyszedł go poprawić.
          "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
