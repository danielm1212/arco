/**
 * Współdzielona blokada scrolla body — JEDNA na wszystkie overlaye w aplikacji.
 *
 * Sheet-w-sheecie („Podmień ćwiczenie": menu karty zamyka się i w tym samym
 * commicie Reacta otwiera się SwapPanel) to dwie różne instancje. Blokada per
 * instancja gubiła pozycję strony: cleanup pierwszego sheeta przywracał scroll
 * w rAF, a efekt drugiego czytał `window.scrollY` ZANIM ten rAF się wykonał —
 * zapamiętywał 0 i po zamknięciu drugiego arkusza strona skakała na górę.
 * Licznik referencji + jedna zapamiętana pozycja rozwiązują wyścig niezależnie
 * od kolejności montowania instancji.
 *
 * SESSION-01A3: wyciągnięte z `components/ui/bottom-sheet.tsx` bez zmiany
 * zachowania (pilnuje tego TRUST-03), żeby podpowiedź startowa loggera używała
 * TEJ SAMEJ blokady. Dwa niezależne liczniki zapisywałyby style `body`
 * nawzajem po sobie i gubiły pozycję strony.
 */

let bodyLockCount = 0;
let lockedScroll: { x: number; y: number } | null = null;
let lockedBodyStyles: Record<string, string> | null = null;
let restoreScrollFrame: number | null = null;

export function acquireBodyScrollLock() {
  bodyLockCount += 1;
  if (bodyLockCount > 1) return;
  if (restoreScrollFrame !== null) {
    // Poprzednia instancja dopiero co zwolniła blokadę; jej przywrócenie scrolla
    // wciąż wisi w rAF, a `window.scrollY` jest chwilowo wyzerowane. Przejmujemy
    // zapamiętaną pozycję zamiast utrwalić zero.
    window.cancelAnimationFrame(restoreScrollFrame);
    restoreScrollFrame = null;
  } else {
    lockedScroll = { x: window.scrollX, y: window.scrollY };
  }
  const scroll = lockedScroll ?? { x: 0, y: 0 };
  lockedBodyStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    width: document.body.style.width,
    overflow: document.body.style.overflow,
  };
  // iOS nie respektuje `overscroll-behavior` dla documentu. Bez fizycznego
  // unieruchomienia body gest z krótkiego albo przewiniętego do końca sheeta
  // przechodzi na ekran pod nim. Ujemny top zachowuje pikselową pozycję tła.
  Object.assign(document.body.style, {
    position: "fixed",
    top: `${-scroll.y}px`,
    left: `${-scroll.x}px`,
    right: "0",
    width: "100%",
    overflow: "hidden",
  });
}

export function releaseBodyScrollLock() {
  if (bodyLockCount === 0) return;
  bodyLockCount -= 1;
  if (bodyLockCount > 0) return;
  if (lockedBodyStyles) {
    Object.assign(document.body.style, lockedBodyStyles);
    lockedBodyStyles = null;
  }
  restoreScrollFrame = window.requestAnimationFrame(() => {
    restoreScrollFrame = null;
    const scroll = lockedScroll;
    lockedScroll = null;
    if (scroll) window.scrollTo(scroll.x, scroll.y);
  });
}
