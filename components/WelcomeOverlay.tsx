"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import type { UnitSystem } from "@/lib/types";

const FLAG = "arco-onboarded-v1";

/** Lekki first-run: pokazywany tylko nowemu kontu (bez sesji) i tylko raz na urządzenie. */
export function WelcomeOverlay({ eligible, unit }: { eligible: boolean; unit: UnitSystem }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [u, setU] = useState<UnitSystem>(unit);

  useEffect(() => {
    if (eligible && !localStorage.getItem(FLAG)) setShow(true);
  }, [eligible]);

  if (!show) return null;

  function finish() {
    localStorage.setItem(FLAG, "1");
    if (u !== unit) updateSettings({ unit_system: u }).catch(() => {});
    setShow(false);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background p-md">
      <div className="flex justify-end">
        <button onClick={finish} className="text-sm text-muted-foreground">
          Pomiń
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-lg">
        {step === 0 ? (
          <div className="space-y-md">
            <h1 className="text-3xl font-bold tracking-tight">Witaj w Arco 👋</h1>
            <p className="text-muted-foreground">
              Twój prosty dziennik siłowni — programy, logger serii i postępy. Działa też
              offline, więc słaby zasięg na siłowni nie przeszkadza.
            </p>
            <div className="space-y-xs">
              <p className="text-sm font-medium text-muted-foreground">Jednostki</p>
              <div className="flex gap-xs">
                {(["kg", "lbs"] as const).map((opt) => (
                  <Button
                    key={opt}
                    variant={u === opt ? "default" : "outline"}
                    onClick={() => setU(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-md">
            <h1 className="text-2xl font-bold tracking-tight">Jak zacząć</h1>
            <ol className="space-y-sm">
              <li className="flex gap-sm">
                <span className="font-bold text-primary">1</span>
                <span>Wybierz program i ustaw go jako <b>aktywny</b> (albo trenuj freestyle).</span>
              </li>
              <li className="flex gap-sm">
                <span className="font-bold text-primary">2</span>
                <span>Start dnia → zapisuj serie i zaznaczaj <b>✓</b>; rest startuje sam.</span>
              </li>
              <li className="flex gap-sm">
                <span className="font-bold text-primary">3</span>
                <span>Śledź <b>postępy</b>, rekordy i bilans partii.</span>
              </li>
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-md">
        <div className="flex justify-center gap-xs">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
        {step === 0 ? (
          <Button size="lg" className="w-full" onClick={() => setStep(1)}>
            Dalej
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={finish}>
            Zaczynam 💪
          </Button>
        )}
      </div>
    </div>
  );
}
