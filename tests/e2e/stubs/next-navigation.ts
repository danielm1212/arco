/** Stub `next/navigation` dla harnessów Playwrighta (esbuild `alias`).
 *  Komponenty klienckie Arco używają tylko `useRouter().replace` (czyszczenie
 *  `?trained=1`) i `useSearchParams()`. Poza App Routerem prawdziwe hooki rzucają,
 *  a harness montuje komponent przez `createRoot` — stąd ten minimalny stub. */

/* Sygnatury bezargumentowe: wywołanie `replace("/", { scroll: false })` jest
   poprawne (JS ignoruje nadmiarowe argumenty), a nie zostawiamy nieużywanych
   parametrów, które lint słusznie zgłasza. */
export function useRouter() {
  return {
    replace: () => {},
    push: () => {},
    back: () => {},
    refresh: () => {},
  };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
}

export function usePathname(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}
