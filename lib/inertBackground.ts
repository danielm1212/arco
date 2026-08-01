/**
 * Wyłącza z fokusu i z drzewa dostępności wszystko poza podanym elementem.
 *
 * `aria-modal="true"` niczego nie blokuje — to deklaracja wobec czytnika, którą
 * musi pokryć implementacja (CLAUDE.md §overlaye). Bez tego Tab wychodził z
 * arkusza w listę pod spodem, również na potwierdzeniach usuwania.
 *
 * Idziemy ścieżką w górę do `<body>` i wyłączamy RODZEŃSTWO na każdym poziomie,
 * zamiast lecieć po `document.body.children`. Overlay nie zawsze jest dzieckiem
 * body: onboarding renderuje się wewnątrz kontenera strony, więc płaska pętla
 * zostawiłaby dostępną całą treść obok niego.
 *
 * `inert` jest wspierany od Safari 15.5; starsze silniki dostają `aria-hidden`
 * (klawiaturę i tak trzyma pułapka fokusu w komponencie). Elementów już
 * wyłączonych nie dotykamy — dzięki temu arkusz otwarty nad arkuszem nie
 * „odblokuje” tła przy zamykaniu tego wierzchniego.
 *
 * Zwraca funkcję przywracającą stan sprzed wywołania.
 */
export function inertOutside(element: HTMLElement | null): () => void {
  if (!element || typeof document === "undefined") return () => {};

  const supportsInert = "inert" in HTMLElement.prototype;
  const muted: HTMLElement[] = [];

  let node: HTMLElement | null = element;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    for (const sibling of Array.from(parent.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement)) continue;
      const alreadyMuted = supportsInert
        ? sibling.inert
        : sibling.getAttribute("aria-hidden") === "true";
      if (alreadyMuted) continue;
      if (supportsInert) sibling.inert = true;
      else sibling.setAttribute("aria-hidden", "true");
      muted.push(sibling);
    }
    node = parent;
  }

  return () => {
    for (const sibling of muted) {
      if (supportsInert) sibling.inert = false;
      else sibling.removeAttribute("aria-hidden");
    }
  };
}

/** Selektor elementów, które mogą dostać fokus — wspólny dla pułapek fokusu. */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Widoczne elementy fokusowalne w kontenerze.
 *
 * `getClientRects()`, nie `offsetParent`: treść overlaya siedzi w kontenerze
 * `position: fixed`, gdzie `offsetParent` bywa nullem mimo widocznego pola.
 */
export function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );
}
