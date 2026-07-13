"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { beep, vibrate } from "@/lib/feedback";
import { Button } from "@/components/ui/button";

/**
 * Rest timer — wzorzec ze spike'a: liczony z zegara (endAt), odporny na throttling w tle.
 * `endAt` = znacznik czasu końca (ms). Zmiana `endAt` restartuje odliczanie.
 * 3-2-1: krótki beep co sekundę na finiszu + akcent wizualny.
 */
export function RestTimer({
  endAt,
  label,
  onDone,
  onDismiss,
  onExtend,
}: {
  endAt: number;
  label?: string | null;
  onDone: () => void;
  onDismiss: () => void;
  onExtend: (seconds: number) => void;
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.ceil((endAt - Date.now()) / 1000)),
  );
  // Po dojściu do zera pasek zostaje chwilę w stanie „skończona" (jasny sygnał),
  // potem sam znika — żeby nie zniknął bez śladu.
  const [done, setDone] = useState(false);
  const firedRef = useRef(false);
  const lastBeepRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    setRemaining(rem);

    // Odliczanie 3-2-1 — pojedynczy, wyższy beep raz na sekundę
    if (rem <= 3 && rem > 0 && lastBeepRef.current !== rem) {
      lastBeepRef.current = rem;
      beep(660);
    }

    if (rem === 0 && !firedRef.current) {
      firedRef.current = true;
      beep(880);
      vibrate();
      setDone(true);
    }
  }, [endAt]);

  useEffect(() => {
    firedRef.current = false;
    lastBeepRef.current = null;
    const kickoff = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 250);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tick]);

  // Auto-zamknięcie paska „skończona" po 4 s
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(onDone, 4000);
    return () => window.clearTimeout(t);
  }, [done, onDone]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const finishing = remaining <= 3;

  if (done) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-volt pb-[env(safe-area-inset-bottom)] text-volt-foreground">
        <div className="mx-auto flex max-w-md items-center gap-sm p-md">
          <p className="flex-1 text-base font-semibold">
            Koniec przerwy. Czas na serię! 💪
          </p>
          <Button variant="secondary" size="sm" onClick={onDone}>
            OK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur transition-colors ${
        finishing ? "bg-primary/15" : "bg-card/95"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center gap-sm p-md">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            Przerwa{label ? ` · ${label}` : ""}
          </p>
          <p
            className={`font-mono text-2xl font-semibold tabular-nums transition-transform ${
              finishing ? "scale-110 text-primary" : ""
            }`}
          >
            {mm}:{ss}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onExtend(30)}>
          +30s
        </Button>
        <Button variant="secondary" size="sm" onClick={onDismiss}>
          Pomiń
        </Button>
      </div>
    </div>
  );
}
