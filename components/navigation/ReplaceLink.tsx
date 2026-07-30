"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { useNavigationHistory } from "./NavigationHistory";

/** Link dla przejść terminalnych, które nie mogą wrócić przez Back do starego ekranu. */
export function ReplaceLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const { markNextNavigation } = useNavigationHistory();

  return (
    <Link
      {...props}
      replace
      data-navigation-mode="replace"
      onClick={(event) => {
        onClick?.(event);
        const modified =
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey;
        if (
          !event.defaultPrevented &&
          !modified &&
          event.currentTarget.pathname !== pathname
        ) {
          markNextNavigation("replace");
        }
      }}
    />
  );
}
