"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Pułapka fokusu dla overlayów. Kontrakt z `wytyczne-designu.md` i CLAUDE.md:
 * overlay przejmuje fokus, Tab krąży wyłącznie w jego wnętrzu, a po zamknięciu
 * fokus wraca tam, skąd przyszedł.
 *
 * Hook jest świadomie niezależny od BottomSheeta — HANDOFF (ryzyko 6) notuje, że
 * funkcjonalne sheety nie mają jeszcze kompletnego trapu. Ten sam hook da się do
 * nich podpiąć bez przepisywania samych arkuszy.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );

    // Fokus wchodzi na pierwszy interaktywny element, a gdy overlay nie ma
    // żadnego — na sam kontener (musi mieć tabIndex={-1}).
    (focusable()[0] ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Fokus potrafi uciec poza overlay także bez Taba (klik, czytnik ekranu,
    // programowy focus() sąsiada) — pilnujemy tego niezależnie od klawiatury.
    const onFocusIn = (event: FocusEvent) => {
      if (container.contains(event.target as Node)) return;
      (focusable()[0] ?? container).focus();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
