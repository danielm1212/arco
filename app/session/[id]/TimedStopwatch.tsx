"use client";

import { useEffect, useRef, useState } from "react";
import { beep, vibrate } from "@/lib/feedback";
import { clampNum, LIMITS } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Stoper dla ćwiczeń `timed` (plank) — odliczanie DO CELU (decyzja właściciela).
 * Cel z poprzedniej sesji (placeholder) lub wpisany; Start odlicza do 0 z sygnałem 3-2-1 + końca.
 * Zegar liczony z `endAt` (jak RestTimer) — odporny na throttling w tle.
 * Stop wcześniej = zapis faktycznie przetrwanego czasu. Pole celu zostaje jako ręczny wpis.
 */
export function TimedStopwatch({
  value,
  prev,
  completed,
  onManualPersist,
  onComplete,
}: {
  value: number | null;
  prev: number | null;
  completed: boolean;
  onManualPersist: (n: number | null) => void;
  onComplete: (seconds: number) => void;
}) {
  // Cel: zapisana wartość serii → poprzednia sesja → puste. Edytowalny przed startem.
  const [target, setTarget] = useState<number | null>(value ?? prev ?? null);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const firedRef = useRef(false);
  const lastBeepRef = useRef<number | null>(null);

  const running = endAt != null;

  useEffect(() => {
    if (endAt == null) return;
    firedRef.current = false;
    lastBeepRef.current = null;
    const tick = () => {
      const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(rem);
      if (rem <= 3 && rem > 0 && lastBeepRef.current !== rem) {
        lastBeepRef.current = rem;
        beep(660);
      }
      if (rem === 0 && !firedRef.current) {
        firedRef.current = true;
        beep(880);
        vibrate();
        setEndAt(null);
        onComplete(target ?? 0);
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  function start() {
    const t = target;
    if (!t || t <= 0) return;
    setRemaining(t);
    setEndAt(Date.now() + t * 1000);
  }

  function stopEarly() {
    if (endAt == null) return;
    const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    const elapsed = Math.max(1, (target ?? 0) - rem);
    setEndAt(null);
    onComplete(elapsed);
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const finishing = remaining <= 3;

  // Zaliczona seria — pokaż zapisany czas (✓ obok obsługuje cofnięcie).
  if (completed && !running) {
    return (
      <span className="flex-1 text-center font-medium tabular-nums">
        {value != null ? `${value} s` : "—"}
      </span>
    );
  }

  if (running) {
    return (
      <div className="flex flex-1 items-center gap-xs">
        <span
          className={`flex-1 text-center font-mono text-xl font-bold tabular-nums ${
            finishing ? "scale-110 text-primary" : ""
          }`}
        >
          {mm}:{ss}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={stopEarly}>
          Stop
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center gap-xs">
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={LIMITS.duration}
        placeholder={prev != null ? String(prev) : "cel s"}
        value={target ?? ""}
        onChange={(e) => {
          const v = e.target.value.trim();
          setTarget(v === "" ? null : clampNum(Number(v), { min: 0, max: LIMITS.duration }));
        }}
        onBlur={() => onManualPersist(target)}
        className="h-9 w-16 text-center font-medium tabular-nums"
      />
      <Button
        type="button"
        size="sm"
        className="flex-1"
        disabled={!target || target <= 0}
        onClick={start}
      >
        Start
      </Button>
    </div>
  );
}
