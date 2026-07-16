"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { CalendarClock, Dumbbell, Timer } from "lucide-react";
import {
  startHistoricalSession,
  type HistoricalSessionState,
} from "@/app/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraftRecoveryNotice } from "@/components/forms/DraftRecoveryNotice";
import { useDirtyGuard } from "@/components/navigation/DirtyGuard";
import { usePersistentFormDraft } from "@/lib/usePersistentFormDraft";

export type HistoricalProgram = {
  id: string;
  name: string;
  days: { id: string; label: string }[];
};

const pad = (value: number) => String(value).padStart(2, "0");
type HistoricalDraft = {
  occurredAt: string;
  durationMinutes: string;
  programDayId: string;
};

const isHistoricalDraft = (candidate: unknown): candidate is HistoricalDraft => {
  if (!candidate || typeof candidate !== "object") return false;
  const value = candidate as Partial<HistoricalDraft>;
  return (
    typeof value.occurredAt === "string" &&
    typeof value.durationMinutes === "string" &&
    typeof value.programDayId === "string"
  );
};

function localDateTimeInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function defaultOccurredAt() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(18, 0, 0, 0);
  return localDateTimeInput(date);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Przygotowuję trening…" : "Dodaj ćwiczenia"}
    </Button>
  );
}

export function HistoricalWorkoutForm({
  programs,
  userId,
}: {
  programs: HistoricalProgram[];
  userId: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<HistoricalSessionState, FormData>(
    startHistoricalSession,
    null,
  );
  const [initial] = useState<HistoricalDraft>(() => ({
      occurredAt: defaultOccurredAt(),
      durationMinutes: "60",
      programDayId: "freestyle",
  }));
  const [occurredAt, setOccurredAt] = useState(initial.occurredAt);
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes);
  const [programDayId, setProgramDayId] = useState(initial.programDayId);
  const draft = { occurredAt, durationMinutes, programDayId };
  const dirty =
    occurredAt !== initial.occurredAt ||
    durationMinutes !== initial.durationMinutes ||
    programDayId !== initial.programDayId;
  const { recovered, clearDraft } = usePersistentFormDraft({
    storageKey: `arco-draft-historical-workout-v1:${userId}`,
    value: draft,
    enabled: dirty,
    isValid: isHistoricalDraft,
    onRestore: (saved) => {
      setOccurredAt(saved.occurredAt);
      setDurationMinutes(saved.durationMinutes);
      setProgramDayId(saved.programDayId);
    },
  });
  useDirtyGuard({
    dirty,
    onDiscard: clearDraft,
    message: "Data, czas i wybór treningu są zapisane jako szkic. Odrzucenie zmian usunie ten szkic z urządzenia.",
  });

  useEffect(() => {
    if (!state?.sessionId) return;
    clearDraft();
    router.replace(`/session/${state.sessionId}`);
  }, [clearDraft, router, state?.sessionId]);
  const maximum = localDateTimeInput(new Date());
  const occurred = new Date(occurredAt);
  const occurredAtIso = Number.isNaN(+occurred) ? "" : occurred.toISOString();

  return (
    <form action={formAction} className="space-y-lg">
      {recovered && (
        <DraftRecoveryNotice
          onClear={() => {
            setOccurredAt(initial.occurredAt);
            setDurationMinutes(initial.durationMinutes);
            setProgramDayId(initial.programDayId);
            clearDraft();
          }}
        >
          Wróciliśmy do daty, czasu i rodzaju treningu wybranego przed przerwaniem.
        </DraftRecoveryNotice>
      )}
      <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
        <div className="flex items-start gap-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <CalendarClock className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold">Kiedy trenowałeś?</h2>
            <p className="mt-2xs text-sm text-muted-foreground">
              Zapisz faktyczny dzień i godzinę. Trening od razu trafi na właściwe miejsce w historii.
            </p>
          </div>
        </div>
        <Input
          aria-label="Data i godzina treningu"
          type="datetime-local"
          value={occurredAt}
          max={maximum}
          onChange={(event) => setOccurredAt(event.target.value)}
          required
        />
        <input type="hidden" name="occurredAt" value={occurredAtIso} />
        <input type="hidden" name="occurredOn" value={occurredAt.slice(0, 10)} />
      </section>

      <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
        <div className="flex items-start gap-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Timer className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold">Ile trwał trening?</h2>
            <p className="mt-2xs text-sm text-muted-foreground">
              Podaj przybliżony czas. Nie liczymy czasu, który spędzisz teraz na wpisywaniu serii.
            </p>
          </div>
        </div>
        <label className="flex items-center gap-sm text-sm font-medium">
          <Input
            className="w-24"
            name="durationMinutes"
            type="number"
            inputMode="numeric"
            min="1"
            max="480"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            required
          />
          minut
        </label>
      </section>

      <section className="space-y-sm rounded-xl bg-card p-md shadow-sm">
        <div className="flex items-start gap-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Dumbbell className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold">Co trenowałeś?</h2>
            <p className="mt-2xs text-sm text-muted-foreground">
              Wybierz dzień z planu albo odtwórz własny trening.
            </p>
          </div>
        </div>

        <fieldset className="space-y-xs">
          <legend className="sr-only">Rodzaj treningu</legend>
          <label
            className={`flex min-h-14 cursor-pointer items-center justify-between rounded-lg border px-sm transition-colors ${
              programDayId === "freestyle"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">Własny trening</span>
              <span className="block text-xs text-muted-foreground">Dobierz ćwiczenia samodzielnie</span>
            </span>
            <input
              type="radio"
              name="programDayId"
              value="freestyle"
              checked={programDayId === "freestyle"}
              onChange={() => setProgramDayId("freestyle")}
              className="size-4 accent-primary"
            />
          </label>

          {programs.flatMap((program) =>
            program.days.map((day) => {
              const selected = programDayId === day.id;
              return (
                <label
                  key={day.id}
                  className={`flex min-h-14 cursor-pointer items-center justify-between rounded-lg border px-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{day.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{program.name}</span>
                  </span>
                  <input
                    type="radio"
                    name="programDayId"
                    value={day.id}
                    checked={selected}
                    onChange={() => setProgramDayId(day.id)}
                    className="size-4 shrink-0 accent-primary"
                  />
                </label>
              );
            }),
          )}
        </fieldset>
      </section>

      <p className="rounded-lg bg-muted px-sm py-xs text-xs leading-relaxed text-muted-foreground">
        Trening zapisze się we właściwym dniu historii. Dodanie go po fakcie nie publikuje nowego
        check-inu w Ekipie.
      </p>

      {state?.error && (
        <div className="space-y-xs rounded-lg border border-danger/30 bg-danger/5 p-sm" role="alert">
          <p className="text-sm text-danger">{state.error}</p>
          {state.activeSessionId && (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/session/${state.activeSessionId}`}>Wróć do treningu w toku</Link>
            </Button>
          )}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
