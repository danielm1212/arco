import React, { type AnchorHTMLAttributes, type ReactNode } from "react";

/** Stub `next/link` dla harnessów Playwrighta (esbuild `alias`) — zwykły `<a>`.
 *  Prefetch i router są nieistotne dla pomiarów layoutu/kontrastu. */
export default function Link({
  href,
  children,
  ...rest
}: { href: string; children?: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
