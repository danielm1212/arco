"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beep, vibrate } from "@/lib/feedback";
import {
  getStretchingMinutes,
  getWarmupMinutes,
  setStretchingMinutes,
  setWarmupMinutes,
} from "@/lib/prefs";
import { cn } from "@/lib/utils";

type RoutineKind = "warmup" | "stretching";

const LIMITS: Record<RoutineKind, { min: number; max: number }> = {
  warmup: { min: 2, max: 15 },
  stretching: { min: 1, max: 10 },
};

function timerStorageKey(kind: RoutineKind, timerId: string) {
  return `arco:routineTimer:${kind}:${timerId}`;
}

function readEndAt(kind: RoutineKind, timerId: string) {
  try {
    const value = Number(window.localStorage.getItem(timerStorageKey(kind, timerId)));
    return Number.isFinite(value) && value > Date.now() ? value : null;
  } catch {
    return null;
  }
}

function writeEndAt(kind: RoutineKind, timerId: string, endAt: number | null) {
  try {
    const key = timerStorageKey(kind, timerId);
    if (endAt == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(endAt));
  } catch {
    // Timer jest wygodą urządzenia. Brak miejsca w storage nie blokuje treningu.
  }
}

export function RoutineTimer({
  kind,
  timerId,
  title,
  description,
  className,
}: {
  kind: RoutineKind;
  timerId: string;
  title: string;
  description: string;
  className?: string;
}) {
  const defaults = kind === "warmup" ? 5 : 3;
  const { min, max } = LIMITS[kind];
  const [minutes, setMinutes] = useState(defaults);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const hydrate = window.requestAnimationFrame(() => {
      const savedMinutes =
        kind === "warmup" ? getWarmupMinutes() : getStretchingMinutes();
      const savedEndAt = readEndAt(kind, timerId);
      setMinutes(savedMinutes);
      setEndAt(savedEndAt);
      setRemaining(
        savedEndAt == null
          ? 0
          : Math.max(0, Math.ceil((savedEndAt - Date.now()) / 1000)),
      );
    });
    return () => window.cancelAnimationFrame(hydrate);
  }, [kind, timerId]);

  useEffect(() => {
    if (endAt == null) return;
    firedRef.current = false;
    const tick = () => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0 && !firedRef.current) {
        firedRef.current = true;
        setEndAt(null);
        setFinished(true);
        writeEndAt(kind, timerId, null);
        beep(880);
        vibrate();
      }
    };
    tick();
    const interval = window.setInterval(tick, 250);
    const onVisibility = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endAt, kind, timerId]);

  function setPreferredMinutes(next: number) {
    const safe = Math.max(min, Math.min(max, next));
    setMinutes(safe);
    if (kind === "warmup") setWarmupMinutes(safe);
    else setStretchingMinutes(safe);
  }

  function start() {
    const nextEndAt = Date.now() + minutes * 60_000;
    firedRef.current = false;
    setFinished(false);
    setRemaining(minutes * 60);
    setEndAt(nextEndAt);
    writeEndAt(kind, timerId, nextEndAt);
  }

  function addMinute() {
    if (endAt == null) return;
    const nextEndAt = endAt + 60_000;
    setEndAt(nextEndAt);
    setRemaining(Math.max(0, Math.ceil((nextEndAt - Date.now()) / 1000)));
    writeEndAt(kind, timerId, nextEndAt);
  }

  function finishEarly() {
    setEndAt(null);
    setRemaining(0);
    setFinished(true);
    writeEndAt(kind, timerId, null);
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const running = endAt != null;

  return (
    <section
      className={cn(
        "rounded-xl border border-support/20 bg-card px-sm py-sm text-left shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2xs text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {/* Region żyje od początku — czytnik ogłasza koniec tylko wtedy, gdy live region
          istniał już przed zmianą treści. Dopisanie go dopiero na końcu bywa milczące. */}
      <p className="sr-only" role="status">
        {finished
          ? kind === "warmup"
            ? "Rozgrzewka zakończona"
            : "Rozciąganie zakończone"
          : ""}
      </p>

      {running ? (
        <div className="mt-sm flex items-center gap-xs">
          {/* Bez aria-live: licznik tyka co 250 ms, więc „polite" znaczyłoby nieprzerwane
              czytanie przez całą rozgrzewkę. Koniec ogłasza status „Gotowe" niżej. */}
          <span
            className="min-w-0 flex-1 font-mono text-xl font-semibold tabular-nums text-foreground"
            role="timer"
            aria-label={`Pozostało ${Math.floor(remaining / 60)} min ${remaining % 60} s`}
          >
            {mm}:{ss}
          </span>
          <button
            type="button"
            onClick={addMinute}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dodaj minutę"
          >
            +1
          </button>
          <Button
            type="button"
            variant="outline"
            className="min-w-0 px-sm"
            onClick={finishEarly}
          >
            Zakończ
          </Button>
        </div>
      ) : finished ? (
        <div className="mt-sm flex items-center gap-xs">
          <span className="flex min-h-11 min-w-0 flex-1 items-center gap-xs text-sm font-medium text-success">
            <Check className="size-4" aria-hidden />
            Gotowe
          </span>
          <Button type="button" variant="outline" className="px-sm" onClick={start}>
            Jeszcze raz
          </Button>
        </div>
      ) : (
        <div className="mt-sm flex items-center gap-xs">
          <div className="flex shrink-0 items-center rounded-md border border-input bg-background">
            <button
              type="button"
              onClick={() => setPreferredMinutes(minutes - 1)}
              disabled={minutes <= min}
              className="flex size-11 items-center justify-center rounded-md text-muted-foreground disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Skróć o minutę"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="min-w-14 text-center text-sm font-semibold tabular-nums text-foreground">
              {minutes} min
            </span>
            <button
              type="button"
              onClick={() => setPreferredMinutes(minutes + 1)}
              disabled={minutes >= max}
              className="flex size-11 items-center justify-center rounded-md text-muted-foreground disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Wydłuż o minutę"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <Button type="button" className="min-w-0 flex-1 px-sm" onClick={start}>
            Start
          </Button>
        </div>
      )}
    </section>
  );
}
