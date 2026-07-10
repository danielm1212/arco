"use client";

import { memo } from "react";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { Button } from "@/components/ui/button";
import type { SessionSet, UnitSystem } from "@/lib/types";
import { progressionHint as guidanceProgressionHint } from "@/lib/guidance";
import { ArrowLeftRight, Timer, Link2, Unlink, Lightbulb, Info } from "lucide-react";
import { SwapPanel } from "./SwapPanel";
import { SetRow } from "./SetRow";
import type { LoggerExercise } from "./Logger";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function formatPrevious(ex: LoggerExercise, unit: UnitSystem): string | null {
  const p = ex.previous;
  if (!p) return null;
  if (ex.type === "timed") return p.duration_seconds != null ? `${p.duration_seconds}s` : null;
  if (ex.type === "bodyweight")
    return [
      p.reps != null ? `${p.reps} powt.` : null,
      p.added_weight ? `+${p.added_weight}${unit}` : null,
    ]
      .filter(Boolean)
      .join(" ") || null;
  return p.weight != null && p.reps != null ? `${p.weight}${unit} × ${p.reps}` : null;
}

/** Hint progresji (reguła rule-based z `lib/guidance` — pełny/poniżej zakresu, timed, rep-PR). */
function progressionHint(ex: LoggerExercise, unit: UnitSystem): string | null {
  const top = ex.slot?.target_reps_max;
  const prWeight = top != null ? ex.repPRs[top] : undefined;
  return guidanceProgressionHint({
    type: ex.type,
    unit,
    prev: ex.previous,
    targetRepsMin: ex.slot?.target_reps_min,
    targetRepsMax: ex.slot?.target_reps_max,
    repPR: top != null && prWeight != null ? { reps: top, weight: prWeight } : null,
  });
}

export interface ExerciseCardProps {
  ex: LoggerExercise;
  index: number;
  sessionId: string;
  unit: UnitSystem;
  /** restFor(ex) policzone w rodzicu — prymityw, żeby memo widziało zmianę */
  restSeconds: number;
  swapOpen: boolean;
  /** undefined = brak decyzji usera → fallback !!ex.notes (jak oryginalny Record-lookup) */
  noteOpen: boolean | undefined;
  rpeOn: boolean;
  /** setId → pobity rep-PR w tej sesji (badge). Comparator porównuje tylko wpisy tego ćwiczenia. */
  prSets: Record<string, boolean>;
  onToggleSwap: (seId: string) => void;
  onCloseSwap: (seId: string) => void;
  onSkip: (seId: string, skipped: boolean) => void;
  onDeleteExercise: (seId: string) => void;
  onLink: (index: number) => void;
  onUnlink: (index: number) => void;
  onAdjustRest: (ex: LoggerExercise, delta: number) => void;
  onOpenNote: (seId: string) => void;
  onPersistNotes: (seId: string, notes: string) => void;
  onAddSet: (ex: LoggerExercise) => void;
  onToggleRpe: (seId: string) => void;
  onToggleSet: (ex: LoggerExercise, set: SessionSet) => void;
  onTimedComplete: (ex: LoggerExercise, set: SessionSet, seconds: number) => void;
  onPatchSet: (seId: string, setId: string, patch: Partial<SessionSet>) => void;
  onPersistSet: (setId: string, patch: Partial<SessionSet>) => void;
  onDeleteSet: (seId: string, setId: string) => void;
}

/**
 * Karta ćwiczenia w loggerze — S9-cz.2 paczka 3: JSX przeniesiony 1:1 z pętli
 * w Logger.tsx. `memo` z komparatorem pomijającym propsy-funkcje: tap ✓ w jednej
 * karcie nie renderuje pozostałych. To bezpieczne, bo WSZYSTKIE handlery rodzica
 * operują na ID + funkcyjnych setState/refach (nie na złapanym w domknięciu stanie)
 * — patrz komentarz przy handlerach w Logger.tsx. Nowy handler w karcie musi
 * trzymać się tej samej zasady.
 */
export const ExerciseCard = memo(function ExerciseCard({
  ex,
  index,
  sessionId,
  unit,
  restSeconds,
  swapOpen,
  noteOpen,
  rpeOn,
  prSets,
  onToggleSwap,
  onCloseSwap,
  onSkip,
  onDeleteExercise,
  onLink,
  onUnlink,
  onAdjustRest,
  onOpenNote,
  onPersistNotes,
  onAddSet,
  onToggleRpe,
  onToggleSet,
  onTimedComplete,
  onPatchSet,
  onPersistSet,
  onDeleteSet,
}: ExerciseCardProps) {
  const prev = formatPrevious(ex, unit);
  const grouped = ex.supersetGroup != null;
  // Po podmianie slot-note opisuje stare ćwiczenie — wtedy pokaż sprzęt nowego
  const swapped = ex.slot != null && ex.exerciseId !== ex.slot.default_exercise_id;
  return (
    <section
      className={`space-y-sm rounded-xl bg-card p-md text-card-foreground ${
        grouped ? "border-l-4 border-l-primary" : ""
      } ${ex.skipped ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-sm">
        <div className="min-w-0">
          <p className="font-medium">
            {/* key = remount po podmianie (N2#4) — zero szans na stary cache opisu */}
            <ExerciseInfoSheet key={ex.exerciseId} exerciseId={ex.exerciseId}>
              <button
                type="button"
                className="text-left underline-offset-2 hover:underline"
                title="Jak wykonać"
              >
                {ex.name}{" "}
                <Info className="inline size-3.5 align-[-2px] text-muted-foreground" />
              </button>
            </ExerciseInfoSheet>
            {grouped && (
              <span className="ml-xs rounded-full bg-primary/15 px-2 py-0.5 align-middle text-xs font-medium text-primary">
                SS{ex.supersetGroup}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {ex.slot
              ? `${ex.slot.target_sets} × ${
                  ex.slot.target_reps_min ?? ""
                }${ex.slot.target_reps_max ? `-${ex.slot.target_reps_max}` : ""}${
                  swapped
                    ? ex.equipment
                      ? ` · ${ex.equipment}`
                      : ""
                    : ex.slot.notes
                      ? ` · ${ex.slot.notes}`
                      : ""
                }`
              : ex.equipment ?? "freestyle"}
          </p>
          {prev && (
            <p className="mt-2xs text-xs text-muted-foreground">
              Poprzednio: <span className="font-medium text-foreground">{prev}</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-md">
          {/* Podmiana przy nazwie (N2#5) — panel rozwija się pod nagłówkiem */}
          {!ex.skipped && (
            <button
              onClick={() => onToggleSwap(ex.sessionExerciseId)}
              className={`inline-flex items-center gap-1 text-xs ${
                swapOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Podmień ćwiczenie"
              aria-expanded={swapOpen}
              title="Podmień ćwiczenie"
            >
              <ArrowLeftRight className="size-3.5" /> Podmień
            </button>
          )}
          {ex.slot ? (
            // Ćwiczenie z programu: „Pomiń" zamiast „Usuń" — zostaje slot/progres
            <button
              onClick={() => onSkip(ex.sessionExerciseId, !ex.skipped)}
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label={ex.skipped ? "Przywróć ćwiczenie" : "Pomiń ćwiczenie"}
            >
              {ex.skipped ? "Przywróć" : "Pomiń"}
            </button>
          ) : (
            // Ćwiczenie dodane ad hoc (freestyle): twarde usunięcie OK
            <button
              onClick={() => onDeleteExercise(ex.sessionExerciseId)}
              className="text-xs text-muted-foreground hover:text-danger"
              aria-label="Usuń ćwiczenie"
            >
              Usuń
            </button>
          )}
        </div>
      </div>

      {!ex.skipped && (
        <SwapPanel
          sessionId={sessionId}
          sessionExerciseId={ex.sessionExerciseId}
          open={swapOpen}
          onClose={() => onCloseSwap(ex.sessionExerciseId)}
        />
      )}

      {ex.skipped ? (
        <p className="text-xs italic text-muted-foreground">
          Pominięte w tej sesji — tap „Przywróć”, żeby wrócić.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-md text-xs">
            {grouped ? (
              <button
                onClick={() => onUnlink(index)}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Unlink className="size-3.5" /> Rozłącz superset
              </button>
            ) : (
              index > 0 && (
                <button
                  onClick={() => onLink(index)}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Link2 className="size-3.5" /> Superset z poprzednim
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-xs text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Timer className="size-3.5" /> Przerwa
            </span>
            <button
              aria-label="krótsza przerwa"
              onClick={() => onAdjustRest(ex, -15)}
              className="h-6 w-6 rounded border border-input active:bg-muted"
            >
              −
            </button>
            <span className="w-10 text-center font-mono tabular-nums text-foreground">
              {mmss(restSeconds)}
            </span>
            <button
              aria-label="dłuższa przerwa"
              onClick={() => onAdjustRest(ex, 15)}
              className="h-6 w-6 rounded border border-input active:bg-muted"
            >
              +
            </button>
          </div>

          {noteOpen ?? !!ex.notes ? (
            <input
              defaultValue={ex.notes ?? ""}
              autoFocus={!!noteOpen}
              placeholder="Notatka do ćwiczenia…"
              onBlur={(e) => onPersistNotes(ex.sessionExerciseId, e.target.value)}
              className="w-full rounded-md border border-input bg-background px-sm py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <div>
              <button
                type="button"
                onClick={() => onOpenNote(ex.sessionExerciseId)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + notatka
              </button>
            </div>
          )}

          {(() => {
            const hint = progressionHint(ex, unit);
            return hint ? (
              <p className="flex items-start gap-1.5 rounded-md bg-success/10 px-sm py-xs text-xs text-success">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0" /> {hint}
              </p>
            ) : null;
          })()}

          {ex.sets.length > 0 && (
            <div className="flex items-center gap-xs px-px text-[10px] uppercase tracking-wide text-muted-foreground">
              <span className="w-7 shrink-0 text-center">#</span>
              {ex.type === "timed" ? (
                <span className="flex-1 text-center">czas</span>
              ) : ex.type === "bodyweight" ? (
                <>
                  <span className="flex-1 text-center">powt.</span>
                  <span className="flex-1 text-center">+{unit}</span>
                </>
              ) : (
                <>
                  <span className="flex-1 text-center">{unit}</span>
                  <span className="flex-1 text-center">powt.</span>
                </>
              )}
              {ex.type !== "timed" && rpeOn && <span className="w-16 text-center">RPE</span>}
              <span className="w-10 shrink-0" />
              <span className="w-4 shrink-0" />
            </div>
          )}

          <ul className="space-y-2xs">
            {ex.sets.map((set, i) => (
              <SetRow
                key={set.id}
                index={i + 1}
                set={set}
                prev={ex.previousSets[i] ?? null}
                type={ex.type}
                unit={unit}
                showRpe={rpeOn}
                isPr={!!prSets[set.id]}
                onPatch={(patch) => onPatchSet(ex.sessionExerciseId, set.id, patch)}
                onPersist={(patch) => onPersistSet(set.id, patch)}
                onToggle={() => onToggleSet(ex, set)}
                onDelete={() => onDeleteSet(ex.sessionExerciseId, set.id)}
                onTimedComplete={(sec) => onTimedComplete(ex, set, sec)}
              />
            ))}
          </ul>

          <div className="flex items-center gap-sm">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => onAddSet(ex)}>
              + seria
            </Button>
            {ex.type !== "timed" && (
              <button
                type="button"
                onClick={() => onToggleRpe(ex.sessionExerciseId)}
                title="RPE — ocena wysiłku 1–10 (ile powtórzeń zostało w zapasie). Opcjonalne."
                className={`shrink-0 rounded-md px-2 py-1 text-xs ${
                  rpeOn ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {rpeOn ? "RPE ✓" : "+ RPE"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
},
// Komparator: pomija propsy-funkcje (patrz doc-comment wyżej). `ex` jest referencyjnie
// stabilne dla niedotkniętych ćwiczeń (settery w Logger.tsx zwracają te same obiekty
// dla niezmienionych pozycji) — to jest właściwy sygnał „ta karta się zmieniła".
(prev, next) =>
  prev.ex === next.ex &&
  prev.index === next.index &&
  prev.unit === next.unit &&
  prev.restSeconds === next.restSeconds &&
  prev.swapOpen === next.swapOpen &&
  prev.noteOpen === next.noteOpen &&
  prev.rpeOn === next.rpeOn &&
  // PR-y: porównaj tylko wpisy dotyczące serii TEGO ćwiczenia
  next.ex.sets.every((s) => prev.prSets[s.id] === next.prSets[s.id]));
