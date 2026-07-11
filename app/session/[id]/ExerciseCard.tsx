"use client";

import { memo, useState } from "react";
import { ExerciseInfoSheet } from "@/components/ExerciseInfoSheet";
import { Button } from "@/components/ui/button";
import type { SessionSet, UnitSystem } from "@/lib/types";
import { progressionHint as guidanceProgressionHint } from "@/lib/guidance";
import { Lightbulb, Info, MoreHorizontal } from "lucide-react";
import { SwapPanel } from "./SwapPanel";
import { SetRow } from "./SetRow";
import { ExerciseCardMenu } from "./ExerciseCardMenu";
import type { LoggerExercise } from "./Logger";

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
  /** R6b: nazwy+grupy wszystkich ćwiczeń sesji (picker "Połącz w superset") — referencyjnie
   *  stabilne między toggle'ami serii, patrz komentarz w Logger.tsx przy useMemo. */
  exerciseSummaries: { id: string; name: string; group: number | null }[];
  onToggleSwap: (seId: string) => void;
  onCloseSwap: (seId: string) => void;
  onSkip: (seId: string, skipped: boolean) => void;
  onDeleteExercise: (seId: string) => void;
  onLinkPartner: (index: number, partnerIndex: number) => void;
  onUnlink: (index: number) => void;
  /** R7: przenieś ⋯ wyżej/niżej (jednostka = ćwiczenie lub cała grupa SS). */
  onMove: (seId: string, direction: "up" | "down") => void;
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
  exerciseSummaries,
  onToggleSwap,
  onCloseSwap,
  onSkip,
  onDeleteExercise,
  onLinkPartner,
  onUnlink,
  onMove,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const grouped = ex.supersetGroup != null;
  // Po podmianie slot-note opisuje stare ćwiczenie — wtedy pokaż sprzęt nowego
  const swapped = ex.slot != null && ex.exerciseId !== ex.slot.default_exercise_id;
  return (
    <section
      className={`space-y-sm rounded-xl bg-card p-md text-card-foreground ${
        grouped ? "border-l-4 border-l-primary" : ""
      } ${ex.skipped ? "opacity-60" : ""}`}
    >
      {/* R1+R2 (audyt-loggera.md): karta pokazuje TYLKO nazwę+ⓘ, cel, hint,
          serie, „+ seria" — wszystko inne (Podmień/Pomiń/Superset/Przerwa/
          notatka/RPE) żyje w ⋯. Agregat „Poprzednio" z nagłówka wypadł —
          zostaje reprezentacja per-wiersz (↺ + placeholder w SetRow). */}
      <div className="flex items-start justify-between gap-sm">
        <div className="min-w-0">
          {/* flex zamiast inline-w-<p>: przy długiej nazwie wcześniej zawijała się
              CAŁA linia i ⓘ+badge SS spadały pod tekst (feedback 2026-07-11) —
              teraz nazwa się truncate'uje, ⓘ i badge zawsze zostają obok.
              R5 (F7+F9): nazwa czystym tekstem — na dotyku hover nie istnieje,
              affordance robi wyłącznie ⓘ; aria-label zamiast title (tooltipy
              title= niedostępne na dotyku). */}
          <div className="flex items-center gap-xs">
            <span className="min-w-0 truncate font-medium">{ex.name}</span>
            {/* key = remount po podmianie (N2#4) — zero szans na stary cache opisu */}
            <ExerciseInfoSheet key={ex.exerciseId} exerciseId={ex.exerciseId}>
              <button
                type="button"
                aria-label="Jak wykonać"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground"
              >
                <Info className="size-3.5" aria-hidden />
              </button>
            </ExerciseInfoSheet>
            {grouped && (
              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                SS{ex.supersetGroup}
              </span>
            )}
          </div>
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
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Więcej akcji dla ćwiczenia"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <ExerciseCardMenu
        ex={ex}
        index={index}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        restSeconds={restSeconds}
        rpeOn={rpeOn}
        grouped={grouped}
        exerciseSummaries={exerciseSummaries}
        onSwap={() => onToggleSwap(ex.sessionExerciseId)}
        onSkip={() => onSkip(ex.sessionExerciseId, !ex.skipped)}
        onDeleteExercise={() => onDeleteExercise(ex.sessionExerciseId)}
        onLinkWith={(partnerIndex) => onLinkPartner(index, partnerIndex)}
        onUnlink={() => onUnlink(index)}
        onMoveUp={() => onMove(ex.sessionExerciseId, "up")}
        onMoveDown={() => onMove(ex.sessionExerciseId, "down")}
        onAdjustRest={(delta) => onAdjustRest(ex, delta)}
        onOpenNote={() => onOpenNote(ex.sessionExerciseId)}
        onToggleRpe={() => onToggleRpe(ex.sessionExerciseId)}
      />

      {!ex.skipped && (
        <SwapPanel
          sessionId={sessionId}
          sessionExerciseId={ex.sessionExerciseId}
          open={swapOpen}
          onClose={() => onCloseSwap(ex.sessionExerciseId)}
        />
      )}

      {ex.skipped ? (
        // R5 (F9): copy odświeżone pod R1 — akcja żyje teraz w ⋯, nie na karcie;
        // zniknęły też zagnieżdżone cudzysłowy z poprzedniej wersji
        <p className="text-xs italic text-muted-foreground">
          Pominięte w tej sesji — przywróć przez ⋯.
        </p>
      ) : (
        <>
          {/* Trigger otwarcia notatki żyje w ⋯ (R1) — tu tylko sam input, gdy
              user go otworzył albo notatka już ma treść z wcześniej */}
          {(noteOpen ?? !!ex.notes) && (
            <input
              defaultValue={ex.notes ?? ""}
              autoFocus={!!noteOpen}
              placeholder="Notatka do ćwiczenia…"
              onBlur={(e) => onPersistNotes(ex.sessionExerciseId, e.target.value)}
              className="w-full rounded-md border border-input bg-background px-sm py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
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
              <span className="w-9 shrink-0 text-center">#</span>
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
              {/* w-11+w-11 = dokładna szerokość ✓/✕ w SetRow (R3: oba 44×44 — nagłówek
                  KG/POWT. musi celować w środek pól, feedback 2026-07-11) */}
              <span className="w-11 shrink-0" />
              <span className="w-11 shrink-0" />
            </div>
          )}

          {/* space-y-xs (nie 2xs): 4px między wierszami z 44px checkboxem = łatwo trafić
              w sąsiedni rząd (feedback 2026-07-11); wytyczne-designu.md §touch targets */}
          <ul className="space-y-xs">
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

          {/* RPE toggle przeniesiony do ⋯ (R1) — tu tylko "+ seria", pełna szerokość */}
          <Button variant="ghost" size="sm" className="w-full" onClick={() => onAddSet(ex)}>
            + seria
          </Button>
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
  prev.exerciseSummaries === next.exerciseSummaries &&
  // PR-y: porównaj tylko wpisy dotyczące serii TEGO ćwiczenia
  next.ex.sets.every((s) => prev.prSets[s.id] === next.prSets[s.id]));
