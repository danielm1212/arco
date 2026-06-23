"use client";

/**
 * SPIKE (Phase 0, brief sekcja 9) — rest timer w tle na iOS PWA.
 * Cel: zweryfikować, czy da się polegać na odliczaniu w tle. Werdykt: docs/spike-rest-timer.md.
 *
 * Wzorzec: NIE liczymy w setInterval (throttling/suspend w tle), tylko trzymamy znacznik
 * końca (wall clock). remaining = endAt - Date.now(). Po powrocie z tła wartość jest poprawna.
 * Fallback sygnału: Web Audio beep + navigator.vibrate, gdy zakładka jest aktywna.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const DURATION = 90; // s — przykładowy rest

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  } catch {
    /* audio niedostępne */
  }
}

export default function RestTimerSpike() {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(DURATION);
  const [wokeFrom, setWokeFrom] = useState<string>("—");
  const firedRef = useRef(false);

  const tick = useCallback(() => {
    if (endAt == null) return;
    const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    setRemaining(rem);
    if (rem === 0 && !firedRef.current) {
      firedRef.current = true;
      beep();
      navigator.vibrate?.([200, 100, 200]);
      setEndAt(null);
    }
  }, [endAt]);

  useEffect(() => {
    if (endAt == null) return;
    const id = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(id);
  }, [endAt, tick]);

  // Rekoncyliacja po powrocie z tła — dowód, że wall clock działa mimo throttlingu.
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible" && endAt != null) {
        setWokeFrom(new Date().toLocaleTimeString());
        tick();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [endAt, tick]);

  const start = () => {
    firedRef.current = false;
    setRemaining(DURATION);
    setEndAt(Date.now() + DURATION * 1000);
  };
  const stop = () => {
    setEndAt(null);
    setRemaining(DURATION);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-lg p-md text-center">
      <div>
        <p className="text-sm text-muted-foreground">SPIKE · rest timer (iOS PWA)</p>
        <p className="mt-xs font-mono text-6xl font-bold tabular-nums">
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </p>
      </div>

      <div className="flex gap-sm">
        <Button onClick={start} size="lg">
          Start {DURATION}s
        </Button>
        <Button onClick={stop} size="lg" variant="outline">
          Stop
        </Button>
      </div>

      <div className="space-y-2xs text-xs text-muted-foreground">
        <p>Test: wystartuj, zablokuj ekran / przełącz aplikację, wróć.</p>
        <p>Po powrocie licznik powinien być poprawny (liczony z zegara).</p>
        <p>Ostatni powrót z tła: {wokeFrom}</p>
      </div>
    </main>
  );
}
