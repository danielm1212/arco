"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { acquireBodyScrollLock, releaseBodyScrollLock } from "@/lib/bodyScrollLock";
import { setLoggerHintSeen } from "@/lib/prefs";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { cardVariants } from "@/components/ui/card";

type Anchor = { top: number; arrowLeft: number };

const MARGIN = 16;
const GAP = 12;

/**
 * SESSION-01A3: jednorazowa podpowiedź startowa loggera.
 *
 * Pokazujemy raz na urządzenie (`prefs.loggerHintSeen`) i znika także wtedy, gdy
 * użytkownik po prostu zaliczy pierwszą serię — skoro zaczął logować, to znaczy
 * że nie potrzebuje instrukcji.
 *
 * Zamyka WYŁĄCZNIE „Rozumiem" (i Escape, bo tego wymaga kontrakt overlayów oraz
 * obsługa klawiaturą). Tap w tło świadomie NIE zamyka: podpowiedź pokazuje się raz
 * w życiu, a przypadkowe muśnięcie ekranu w drodze do pierwszego pola kasowałoby ją
 * bezpowrotnie — jedyny raz, kiedy była potrzebna.
 *
 * Reszta kontraktu z CLAUDE.md bez zmian: przyciemnienie blokuje interakcję
 * i przewijanie tła, fokus wchodzi do środka i wraca na miejsce po zamknięciu.
 */
export function LoggerHint({ onDismiss }: { onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  // Kolejność efektów jest tu istotna. Blokada tła unieruchamia body przez
  // `position: fixed`, więc musi zadziałać PRZED pomiarem kotwicy i przed
  // przejęciem fokusu — inaczej pomiar opisywałby układ sprzed blokady.
  useEffect(() => {
    acquireBodyScrollLock();
    return releaseBodyScrollLock;
  }, []);

  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const measure = () => {
      // Celem jest pierwszy wiersz serii; strzałka celuje w sam check, bo to jego
      // dotyczy druga połowa zdania.
      const row = document.querySelector<HTMLElement>("li[data-set-state]");
      if (!row) return setAnchor(null);
      const rowRect = row.getBoundingClientRect();
      const check = row.querySelector<HTMLElement>(
        'button[aria-label="Zalicz serię"], button[aria-label="Cofnij zaliczenie"]',
      );
      const checkRect = check?.getBoundingClientRect();
      setAnchor({
        top: rowRect.bottom + GAP,
        arrowLeft: checkRect
          ? checkRect.left + checkRect.width / 2
          : rowRect.left + rowRect.width / 2,
      });
    };
    // Pierwszy pomiar po klatce: karty ćwiczeń montują się razem z loggerem.
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Każde zniknięcie liczy się jako pokazana: „Rozumiem", Escape, klik w tło
      // albo po prostu zaliczenie pierwszej serii. Podpowiedź ma być jednorazowa,
      // a nie natrętna przy każdym wejściu.
      setLoggerHintSeen(true);
    };
  }, [onDismiss]);

  // Portal do body — jak BottomSheet. Wewnątrz drzewa loggera dowolny przodek
  // z `transform` (przejścia ekranów) stałby się blokiem zawierającym dla
  // `position: fixed` i przyciemnienie przestałoby pokrywać cały ekran.
  return createPortal(
    <div className="fixed inset-0 z-50 touch-none overscroll-contain bg-foreground/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logger-hint-text"
        tabIndex={-1}
        style={
          anchor
            ? {
                position: "absolute",
                top: Math.round(anchor.top),
                left: MARGIN,
                right: MARGIN,
              }
            : undefined
        }
        className={
          anchor
            ? cardVariants({ elevation: "overlay", className: "focus-visible:outline-none" })
            : cardVariants({ elevation: "overlay", className: "absolute inset-x-md top-1/2 -translate-y-1/2 focus-visible:outline-none" })
        }
      >
        {anchor && (
          <span
            aria-hidden
            style={{
              left: Math.round(
                Math.min(
                  Math.max(anchor.arrowLeft - MARGIN, 12),
                  window.innerWidth - 2 * MARGIN - 12,
                ),
              ),
            }}
            className="absolute -top-1.5 size-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-card"
          />
        )}
        <p id="logger-hint-text" className="text-sm leading-relaxed text-foreground">
          Wpisz ciężar i powtórzenia, potem zalicz serię ✓
        </p>
        <Button type="button" className="mt-sm w-full" onClick={onDismiss}>
          Rozumiem
        </Button>
      </div>
    </div>,
    document.body,
  );
}
