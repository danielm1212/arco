"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigationHistory } from "./NavigationHistory";

/** Link dla przejść terminalnych, które nie mogą wrócić przez Back do starego ekranu. */
export function ReplaceLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { markNextNavigation } = useNavigationHistory();

  return (
    <Link
      {...props}
      replace
      data-navigation-mode="replace"
      onClick={(event) => {
        markNextNavigation("replace");
        onClick?.(event);
      }}
    />
  );
}
