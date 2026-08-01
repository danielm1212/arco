"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STICKY_HEADER_SAFE_AREA } from "@/components/navigation/stickyHeader";
import type {
  ExerciseType,
  MechanicType,
  MovementPattern,
  SessionSet,
  TrainingPriority,
  UnitSystem,
} from "@/lib/types";
import { trainingPriorityMeta } from "@/lib/trainingPriority";
import { useWakeLock } from "@/lib/useWakeLock";
import { getKeepAwake, getLoggerHintSeen } from "@/lib/prefs";
import { ChevronDown, ChevronLeft, Dumbbell, Timer, MoreVertical, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { reorderExercise } from "@/app/actions/sets";
import { ensureOnline } from "@/lib/offlineGuard";
import { weightToDisplay } from "@/lib/format";
import { WEIGHT_REVIEW_KG, VERY_HIGH_WEIGHT_REVIEW_KG } from "@/lib/setValidation";
import { RestTimer } from "./RestTimer";
import { ExercisePicker } from "./ExercisePicker";
import { ExerciseCard } from "./ExerciseCard";
import { FinishSheet } from "./FinishSheet";
import { EmptySessionSheet } from "./EmptySessionSheet";
import type { PrevSet } from "./SetRow";
import { useRestTimer } from "./useRestTimer";
import { useSessionOutbox } from "./useSessionOutbox";
import { useSessionMutations } from "./useSessionMutations";
import { handleFinish, handleDeleteSession } from "./finish";
import { ScreenChrome } from "@/components/navigation/ScreenChrome";
import { useNavigationHistory } from "@/components/navigation/NavigationHistory";
import { recoverableCount, restoreSessionDraft } from "@/lib/outbox";
import type { SetWeightReview } from "@/lib/setValidation";
import { formatWarsawDate } from "@/lib/dateTime";
import {
  applySessionEdits,
  loggerSessionState,
  loggerSetState,
  nextIncompleteSetId,
  readSessionContinuity,
  shouldRestoreSessionPosition,
  writeSessionContinuity,
  type SessionDraftPatch,
} from "@/lib/sessionFlow";
import {
  isCompletedWorkingSet,
  isIncompleteWorkingSet,
  sumVolumeKg,
} from "@/lib/sessionSetFacts";
import { RoutineTimer } from "./RoutineTimer";
import { LoggerHint } from "./LoggerHint";

export interface LoggerExercise {
  sessionExerciseId: string;
  exerciseId: string;
  name: string;
  type: ExerciseType;
  equipment: string | null;
  category: string | null;
  mechanic: MechanicType | null;
  movementPattern: MovementPattern | null;
  slot: {
    default_exercise_id: string;
    target_sets: number;
    target_reps_min: number | null;
    target_reps_max: number | null;
    rest_seconds: number;
    notes: string | null;
  } | null;
  supersetGroup: number | null;
  notes: string | null;
  skipped: boolean;
  sets: SessionSet[];
  previous: {
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    added_weight: number | null;
  } | null;
  previousSets: PrevSet[];
  /** S12: rekordy per liczba powtórzeń (reps → najlepszy ciężar), bez bieżącej sesji. */
  repPRs: Record<number, number>;
}

/**
 * Orkiestracja loggera — S9-cz.2 paczka 3 (split bez zmiany zachowania):
 * karta → ExerciseCard · wiersz → SetRow (oba memo) · przerwa → useRestTimer ·
 * outbox → useSessionOutbox · mutacje → useSessionMutations · finish → finish.ts.
 * Inwariant handlerów (memo pomija funkcje): patrz doc-comment w useSessionMutations.
 */
export function Logger({
  sessionId,
  title,
  programName,
  isFinished,
  startedAt,
  isHistorical,
  initialElapsedSeconds,
  unit,
  defaultRest,
  trainingPriority,
  initialExercises,
}: {
  sessionId: string;
  /** Etykieta dnia ("Trening A") — tytuł główny; jedyna część odróżniająca sesje,
   *  program w trakcie treningu jest bezwartościowy (wiadomo, co się kliknęło). */
  title: string;
  programName: string | null;
  isFinished: boolean;
  startedAt: string;
  isHistorical: boolean;
  /** Liczone raz na serwerze i przekazane jako prop — pierwszy HTML klienta
   *  musi mieć ten sam zegar, inaczej bezpośrednie wejście daje hydration #418. */
  initialElapsedSeconds: number | null;
  unit: UnitSystem;
  defaultRest: number;
  trainingPriority: TrainingPriority;
  initialExercises: LoggerExercise[];
}) {
  const router = useRouter();
  const { goBack, replace } = useNavigationHistory();
  const [recoveredChanges, setRecoveredChanges] = useState(0);
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [continuityReady, setContinuityReady] = useState(false);
  const [draftEdits, setDraftEdits] = useState<Record<string, SessionDraftPatch>>({});
  const draftEditsRef = useRef(draftEdits);
  useEffect(() => {
    draftEditsRef.current = draftEdits;
  }, [draftEdits]);
  const [exercises, setExercises] = useState(initialExercises);
  // Najświeższy stan dostępny w handlerach (do złożenia pełnego wiersza przy zapisie)
  const exercisesRef = useRef(exercises);
  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  // Świeże wejście nie zaznacza serii za użytkownika. Aktywny wiersz pojawia się
  // dopiero po interakcji albo przy prawdziwym wznowieniu zapisanej ciągłości.
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [focusSetId, setFocusSetId] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const {
    rest,
    restFor,
    startRest,
    adjustRest,
    dismissRest,
    restoreRest,
    extendRest,
  } = useRestTimer(defaultRest);
  const { online, pending, quarantined, syncing, flush, saveSet, removeSet, saveNotes } =
    useSessionOutbox(sessionId);
  // Przed zaliczeniem wyniku mogącego utworzyć nieoczekiwany PR prosimy o
  // świadome potwierdzenie. Stan przechowuje pełny wiersz tylko na czas sheeta.
  const [weightReview, setWeightReview] = useState<{
    ex: LoggerExercise;
    set: SessionSet;
    review: SetWeightReview;
    mode: "complete" | "edit";
  } | null>(null);

  function handleSetCompletionChange(
    ex: LoggerExercise,
    set: SessionSet,
    completed: boolean,
  ) {
    if (!completed) {
      setActiveSetId(set.id);
      setFocusSetId(set.id);
      return;
    }
    const projected = exercisesRef.current.map((exercise) =>
      exercise.sessionExerciseId !== ex.sessionExerciseId
        ? exercise
        : {
            ...exercise,
            sets: exercise.sets.map((candidate) =>
              candidate.id === set.id ? { ...candidate, completed: true } : candidate,
            ),
          },
    );
    const nextId = nextIncompleteSetId(projected, set.id);
    setActiveSetId(nextId);
    setFocusSetId(nextId);
  }

  function clearCompletedEdit(setId: string) {
    setDraftEdits((current) => {
      if (!current[setId]) return current;
      const next = { ...current };
      delete next[setId];
      draftEditsRef.current = next;
      return next;
    });
  }

  const {
    prSets,
    patchSetLocal,
    persistNotes,
    handleAddSet,
    handleToggle,
    commitToggle,
    handleSaveCompletedEdit,
    commitCompletedEdit,
    handleTimedComplete,
    persistSet,
    handleDeleteSet,
    handleDeleteExercise,
    handleSkip,
    linkWithPartner,
    unlink,
  } = useSessionMutations({
    sessionId,
    setExercises,
    exercisesRef,
    saveSet,
    removeSet,
    saveNotes,
    startRest,
    allowRest: !isFinished,
    requestWeightReview: (request) => setWeightReview(request),
    onSetCompletionChange: handleSetCompletionChange,
    onCompletedEditSaved: clearCompletedEdit,
  });

  function patchSetFromInput(
    sessionExerciseId: string,
    setId: string,
    patch: Partial<SessionSet>,
  ) {
    const current = exercisesRef.current
      .find((exercise) => exercise.sessionExerciseId === sessionExerciseId)
      ?.sets.find((set) => set.id === setId);
    if (current?.completed) {
      const editablePatch: SessionDraftPatch = {};
      for (const key of [
        "weight",
        "reps",
        "duration_seconds",
        "added_weight",
        "rpe",
        "set_type",
      ] as const) {
        if (key in patch) editablePatch[key] = patch[key] as never;
      }
      const nextEdits = {
        ...draftEditsRef.current,
        [setId]: { ...draftEditsRef.current[setId], ...editablePatch },
      };
      draftEditsRef.current = nextEdits;
      setDraftEdits({
        ...nextEdits,
      });
    }
    patchSetLocal(sessionExerciseId, setId, patch);
    setActiveSetId(setId);
    setMinimized(false);
  }

  function persistSetFromInput(setId: string, patch: Partial<SessionSet>) {
    const current = exercisesRef.current
      .flatMap((exercise) => exercise.sets)
      .find((set) => set.id === setId);
    if (current?.completed && draftEditsRef.current[setId]) return;
    persistSet(setId, patch);
  }

  useEffect(() => {
    let restoreScroll: number | null = null;
    const hydrateContinuity = window.requestAnimationFrame(() => {
      const recovered = recoverableCount(sessionId);
      const continuity = readSessionContinuity(sessionId);
      const restoredExercises = applySessionEdits(
        restoreSessionDraft(initialExercises, sessionId),
        continuity.edits,
      );
      setRecoveredChanges(recovered);
      setRecoveryVisible(recovered > 0);
      setDraftEdits(continuity.edits);
      draftEditsRef.current = continuity.edits;
      setExercises(restoredExercises);
      exercisesRef.current = restoredExercises;
      const rememberedSet = restoredExercises
        .flatMap((exercise) => exercise.sets)
        .find((set) => set.id === continuity.activeSetId);
      const rememberedActiveRelevant =
        rememberedSet != null &&
        (!rememberedSet.completed ||
          (continuity.activeSetId != null &&
            continuity.edits[continuity.activeSetId] != null));
      const hasResumableContinuity = shouldRestoreSessionPosition(
        continuity,
        rememberedActiveRelevant,
      );
      setActiveSetId(rememberedActiveRelevant ? continuity.activeSetId : null);
      setScrollY(continuity.scrollY);
      restoreRest(isFinished || isHistorical ? null : continuity.rest);
      restoreScroll = window.requestAnimationFrame(() => {
        window.scrollTo({ top: hasResumableContinuity ? continuity.scrollY : 0 });
      });
      setContinuityReady(true);
    });
    return () => {
      window.cancelAnimationFrame(hydrateContinuity);
      if (restoreScroll != null) window.cancelAnimationFrame(restoreScroll);
    };
  }, [initialExercises, isFinished, isHistorical, restoreRest, sessionId]);

  useEffect(() => {
    let frame: number | null = null;
    const rememberScroll = () => {
      if (frame != null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener("scroll", rememberScroll, { passive: true });
    return () => {
      if (frame != null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", rememberScroll);
    };
  }, []);

  useEffect(() => {
    if (!continuityReady) return;
    writeSessionContinuity(sessionId, {
      activeSetId,
      scrollY,
      minimized,
      rest,
      edits: draftEdits,
    });
  }, [
    activeSetId,
    continuityReady,
    draftEdits,
    minimized,
    rest,
    scrollY,
    sessionId,
  ]);

  // R6b: lista nazw+grup dla pickera "Połącz w superset" w ⋯ karty. Referencyjnie
  // stabilna między toggle'ami serii (klucz = id+nazwa+grupa, nie cały `exercises`)
  // — inaczej każdy tap ✓ złamałby memo na WSZYSTKICH kartach (patrz komparator
  // w ExerciseCard.tsx).
  const summaryKey = exercises
    .map((e) => `${e.sessionExerciseId}:${e.name}:${e.supersetGroup}`)
    .join("|");
  const exerciseSummaries = useMemo(
    () => exercises.map((e) => ({ id: e.sessionExerciseId, name: e.name, group: e.supersetGroup })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summaryKey],
  );

  // R7 (audyt-loggera.md §6): przenieś ⋯ wyżej/niżej — serwer przenumerowuje
  // `position` (jednostka = ćwiczenie LUB cała grupa SS), router.refresh()
  // dociąga nowy porządek. Reorder idzie przez sieć (jak swap/skip) — offline-guard.
  function moveExercise(seId: string, direction: "up" | "down") {
    if (!ensureOnline("zmiana kolejności ćwiczeń")) return;
    reorderExercise(sessionId, seId, direction)
      .then(() => router.refresh())
      .catch(() => toast.error("Nie udało się zapisać. Sprawdź internet i spróbuj ponownie."));
  }

  // RPE domyślnie ukryte (opcjonalne) — odsłaniane per ćwiczenie na czas sesji
  const [rpeOn, setRpeOn] = useState<Record<string, boolean>>({});
  // Notatka zwinięta domyślnie (odgracenie karty) — otwarta gdy już jest treść
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  // Panel podmiany per ćwiczenie — trigger ⇄ w nagłówku karty (N2#5)
  const [swapOpen, setSwapOpen] = useState<Record<string, boolean>>({});
  // R1 (audyt-loggera.md): ⋯ sesji w headerze — dziś tylko "Usuń sesję",
  // docelowo edycja daty/reorder trafią tu też
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  // R4: finish-sheet zamiast confirm() — otwierany tylko gdy są niezaliczone serie
  const [finishSheetOpen, setFinishSheetOpen] = useState(false);
  const [emptySessionSheetOpen, setEmptySessionSheetOpen] = useState(false);
  const [deletingEmptySession, setDeletingEmptySession] = useState(false);
  // Guard in-flight: podwójny tap „Zakończ" dublował recompute_personal_records
  const [finishing, setFinishing] = useState(false);
  const confirmFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      await handleFinish({ sessionId, online, flush });
    } finally {
      setFinishing(false);
    }
  };
  // Blokada wygaszania ekranu na czas aktywnego treningu (jeśli włączona w ustawieniach)
  useWakeLock(!isFinished && getKeepAwake());

  // Licznik czasu trwania sesji (na żywo)
  const [elapsed, setElapsed] = useState(initialElapsedSeconds);
  useEffect(() => {
    if (isFinished || isHistorical) return;
    const tick = () =>
      setElapsed(
        Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)),
      );
    const kickoff = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(id);
    };
  }, [startedAt, isFinished, isHistorical]);

  // Live podsumowanie z lokalnego stanu
  const factExercises = exercises.filter((exercise) => !exercise.skipped);
  const doneSets = factExercises.reduce(
    (n, ex) => n + ex.sets.filter(isCompletedWorkingSet).length,
    0,
  );
  // SESSION-01A3: podpowiedź startowa. Stan czytamy dopiero po montażu (jak w
  // RoutineTimer), żeby serwer i pierwszy render klienta były zgodne.
  const [hintOpen, setHintOpen] = useState(false);
  useEffect(() => {
    if (isFinished || isHistorical || getLoggerHintSeen()) return;
    const frame = window.requestAnimationFrame(() => setHintOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isFinished, isHistorical]);
  const dismissHint = useCallback(() => setHintOpen(false), []);
  // Zaliczona seria jest lepszym dowodem zrozumienia niż kliknięcie „Rozumiem",
  // więc widoczność jest wyprowadzona, a nie ustawiana efektem. Zapis „widziane"
  // robi sam LoggerHint przy odmontowaniu — każde zniknięcie liczy się tak samo.
  const hintVisible = hintOpen && doneSets === 0;

  // R4: seria niezaliczone = kandydat do finish-sheeta zamiast confirm()
  const incompleteSets = factExercises.reduce(
    (n, ex) => n + ex.sets.filter(isIncompleteWorkingSet).length,
    0,
  );
  const volume = factExercises.reduce(
    (n, ex) => n + sumVolumeKg(ex.sets.filter(isCompletedWorkingSet)),
    0,
  );
  const elapsedSeconds = elapsed ?? 0;
  const hh = Math.floor(elapsedSeconds / 3600);
  const mm = Math.floor((elapsedSeconds % 3600) / 60);
  const ss = elapsedSeconds % 60;
  const elapsedStr =
    elapsed == null
      ? "–:––"
      : (hh > 0 ? `${hh}:${String(mm).padStart(2, "0")}` : `${mm}`) +
        `:${String(ss).padStart(2, "0")}`;
  const activeExercise = exercises.find((exercise) =>
    exercise.sets.some((set) => set.id === activeSetId),
  );
  const activeSet = activeExercise?.sets.find((set) => set.id === activeSetId);
  const activeSetState =
    activeExercise && activeSet
      ? loggerSetState(activeExercise.type, activeSet, !!draftEdits[activeSet.id])
      : "completed";
  const sessionState = loggerSessionState({
    setState: activeSetState,
    resting: rest != null,
    minimized,
    finishing,
  });
  const editedSetIds = Object.fromEntries(
    Object.keys(draftEdits).map((setId) => [setId, true]),
  );

  function minimizeSession() {
    const continuity = {
      activeSetId,
      scrollY: window.scrollY,
      minimized: true,
      rest,
      edits: draftEdits,
    };
    writeSessionContinuity(sessionId, continuity);
    setMinimized(true);
    replace("/");
  }

  return (
    // NIE kasuj globalnego pt-safe body ujemnym marginesem: z `-mt` naturalny top
    // headera = 0 < offset sticky (safe-area), więc sticky OD RAZU zsuwa header
    // o pas safe-area W DÓŁ — nachodząc na pierwszą treść main (bug 2026-07-22:
    // zasłonięty pas priorytetu). Bez `-mt` header zachowuje się jak PageHeader:
    // naturalna pozycja == pozycja przyklejenia, zero przesunięcia.
    <div
      className="mx-auto flex min-h-dvh max-w-md flex-col pb-28"
      data-session-state={sessionState}
    >
      <ScreenChrome
        screenType={isFinished || isHistorical ? "session-edit" : "session-live"}
        showBottomNav={false}
        activeTab={null}
        showSessionMiniBar={false}
        miniBarPosition="safe-bottom"
      />
      {/* NIE dodawaj `relative`: `cn()` = tailwind-merge, a `relative` konfliktuje z
          `sticky` w STICKY_HEADER_SAFE_AREA i zostaje wybrane jako ostatnie — usuwając
          `sticky`. To był bug „header nie przykleja się" (2026-07-22). `sticky` samo
          pozycjonuje, więc `before:absolute` i `z` działają. */}
      <header className={cn(STICKY_HEADER_SAFE_AREA, "z-10 border-b bg-background px-md py-sm")}>
        <div className="flex items-center justify-between gap-sm">
          <div className="flex min-w-0 items-center gap-2xs">
            {/* 44px pełnowymiarowy target (było: mikro-tekst "← Trening") */}
            <button
              onClick={() =>
                isFinished || isHistorical
                  ? goBack(isFinished ? `/history/${sessionId}` : "/history")
                  : minimizeSession()
              }
              aria-label={isFinished || isHistorical ? "Wróć" : "Zwiń trening"}
              className="flex size-11 shrink-0 -ml-2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isFinished || isHistorical ? (
                <ChevronLeft className="size-5" aria-hidden />
              ) : (
                <ChevronDown className="size-5" aria-hidden />
              )}
            </button>
            <div className="min-w-0">
              {/* Nazwa dnia = tytuł: jedyna część odróżniająca sesję, program
                  w trakcie treningu jest bezwartościowy — zostaje podpisem */}
              <p className="truncate font-semibold leading-tight">{title}</p>
              {programName && (
                <p className="truncate text-xs text-muted-foreground">{programName}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-sm">
            {(!online || pending > 0 || quarantined > 0) && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  !online
                    ? "bg-warning/15 text-warning"
                    : quarantined > 0
                      ? "bg-danger/10 text-danger"
                      : "bg-muted text-muted-foreground"
                }`}
                title={
                  !online
                    ? "Brak internetu. Zmiany zapiszą się po powrocie sieci"
                    : quarantined > 0
                      ? `${quarantined} zmian(y) wymaga poprawy`
                      : `${pending} zmian(y) do synchronizacji`
                }
              >
                {!online
                  ? "● offline"
                  : quarantined > 0
                    ? "wymaga poprawy"
                    : syncing
                      ? "synchronizuję…"
                      : `↑ ${pending}`}
              </span>
            )}
            {!isFinished && (
              // Nie wypełniony rust — akcją główną ekranu jest logowanie serii,
              // nie kończenie treningu (ten sam argument co V4 hero na home).
              // Siatka bezpieczeństwa na przypadkowy tap: R4 (finish-sheet).
              <Button
                size="sm"
                variant="outline"
                className="text-primary"
                disabled={finishing}
                onClick={() => {
                  if (doneSets === 0) {
                    setEmptySessionSheetOpen(true);
                  } else if (incompleteSets > 0) {
                    setFinishSheetOpen(true);
                  } else {
                    confirmFinish();
                  }
                }}
              >
                Zakończ
              </Button>
            )}
            <button
              onClick={() => setSessionMenuOpen(true)}
              aria-label="Więcej akcji dla sesji"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>
        <div className="mt-xs flex items-center gap-lg text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Timer className="size-3.5" />
            <span className="font-mono tabular-nums text-foreground">{elapsedStr}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Dumbbell className="size-3.5" />
            <span className="font-medium text-foreground">
              {Math.round(weightToDisplay(volume, unit)).toLocaleString("pl-PL")}
              {unit}
            </span>
          </span>
          <span>
            ✓ <span className="font-medium text-foreground">{doneSets}</span> serii
          </span>
        </div>
        {isHistorical && (
          <p className="mt-xs text-xs text-muted-foreground">
            Wpisujesz trening z {formatWarsawDate(startedAt)}. Czas sesji: {Math.round(elapsedSeconds / 60)} min.
          </p>
        )}
        {isFinished && (
          <p className="mt-xs text-xs text-muted-foreground">
            Edytujesz zapisany trening. Po zapisaniu zmiany aktualizują rekordy, postęp i wskazówki.
          </p>
        )}
      </header>

      {/* pb przy aktywnej przerwie — rest-bar (fixed bottom) nie zasłania dolnych wierszy (N2#9) */}
      <main className={`flex-1 space-y-md p-md ${rest ? "pb-28" : ""}`}>
        {recoveryVisible && recoveredChanges > 0 && (
          <aside
            className="flex items-start justify-between gap-sm rounded-xl border border-primary/30 bg-primary/10 p-sm"
            role="status"
          >
            <div>
              <p className="text-sm font-semibold text-primary">Odzyskaliśmy szkic treningu</p>
              <p className="mt-2xs text-xs text-muted-foreground">
                {recoveredChanges === 1
                  ? "Ostatnia zmiana była zapisana na tym urządzeniu."
                  : `${recoveredChanges} ostatnie zmiany były zapisane na tym urządzeniu.`}{" "}
                {quarantined > 0
                  ? "Co najmniej jedna wymaga poprawy; pozostałe zapisują się normalnie."
                  : online
                    ? "Synchronizujemy je z kontem."
                    : "Wyślemy je po powrocie internetu."}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => setRecoveryVisible(false)}
            >
              OK
            </Button>
          </aside>
        )}

        {!isFinished && !isHistorical && (
          <RoutineTimer
            kind="warmup"
            timerId={sessionId}
            title="Rozgrzewka"
            // Karta jest timerem, nie instruktorem: nie narzucamy formy ruchu
            // (bieżnia, rowerek, skakanka — obojętne) i nie każemy robić serii,
            // których logger i tak nie zapisze.
            description="Rozgrzej się jak lubisz — bieżnia, rowerek, skakanka."
          />
        )}
        <p className="px-2xs text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{trainingPriorityMeta(trainingPriority).label}:</span>{" "}
          {trainingPriorityMeta(trainingPriority).loggerHint}
        </p>
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.sessionExerciseId}
            ex={ex}
            index={i}
            sessionId={sessionId}
            unit={unit}
            trainingPriority={trainingPriority}
            restSeconds={restFor(ex)}
            swapOpen={!!swapOpen[ex.sessionExerciseId]}
            noteOpen={noteOpen[ex.sessionExerciseId]}
            rpeOn={!!rpeOn[ex.sessionExerciseId]}
            prSets={prSets}
            activeSetId={ex.sets.some((set) => set.id === activeSetId) ? activeSetId : null}
            focusSetId={ex.sets.some((set) => set.id === focusSetId) ? focusSetId : null}
            editedSetIds={editedSetIds}
            exerciseSummaries={exerciseSummaries}
            onToggleSwap={(id) => setSwapOpen((o) => ({ ...o, [id]: !o[id] }))}
            onCloseSwap={(id) => setSwapOpen((o) => ({ ...o, [id]: false }))}
            onSkip={handleSkip}
            onDeleteExercise={handleDeleteExercise}
            onLinkPartner={linkWithPartner}
            onUnlink={unlink}
            onMove={moveExercise}
            onAdjustRest={adjustRest}
            onOpenNote={(id) => setNoteOpen((o) => ({ ...o, [id]: true }))}
            onPersistNotes={persistNotes}
            onAddSet={(exercise) => {
              void handleAddSet(exercise).then((setId) => {
                setActiveSetId(setId);
                setFocusSetId(setId);
              });
            }}
            onToggleRpe={(id) => setRpeOn((o) => ({ ...o, [id]: !o[id] }))}
            onToggleSet={handleToggle}
            onActivateSet={(setId) => {
              setActiveSetId(setId);
              setFocusSetId(null);
              setMinimized(false);
            }}
            onSaveEditedSet={handleSaveCompletedEdit}
            onTimedComplete={handleTimedComplete}
            onPatchSet={patchSetFromInput}
            onPersistSet={persistSetFromInput}
            onDeleteSet={(sessionExerciseId, setId) => {
              clearCompletedEdit(setId);
              handleDeleteSet(sessionExerciseId, setId);
            }}
          />
        ))}

        {/* Rozciąganie jest ostatnią pozycją TRENINGU, nie ekranu podsumowania:
            na Done było już po wszystkim, a wtedy nikt do niego nie wraca.
            Stoi za ostatnim ćwiczeniem, więc dołożenie kolejnego wchodzi nad nie. */}
        {!isFinished && !isHistorical && (
          <RoutineTimer
            kind="stretching"
            timerId={sessionId}
            title="Rozciąganie"
            description="Rozciągnij spokojnie to, co dziś pracowało."
          />
        )}

        <ExercisePicker sessionId={sessionId} />
      </main>

      {hintVisible && <LoggerHint onDismiss={dismissHint} />}

      {/* R1: "Usuń sesję" — akcja raz-na-miesiąc, dawniej zawsze widoczna
          tuż pod pickerem (strefa eksploracji); teraz w ⋯ sesji z headera */}
      <BottomSheet
        open={sessionMenuOpen}
        onOpenChange={setSessionMenuOpen}
        title="Usunąć sesję?"
        description="Potwierdzenie trwałego usunięcia sesji"
      >
        <div className="space-y-md">
          <p className="text-sm text-muted-foreground">Trening i wszystkie zapisane w nim serie zostaną trwale usunięte.</p>
          <Button
            variant="destructive"
            className="w-full"
            disabled={deletingSession}
            onClick={async () => {
              setDeletingSession(true);
              const deleted = await handleDeleteSession({ sessionId, online });
              if (deleted) {
                router.replace("/");
                return;
              }
              setDeletingSession(false);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            {deletingSession ? "Usuwam…" : "Usuń sesję"}
          </Button>
          <Button variant="ghost" className="w-full" disabled={deletingSession} onClick={() => setSessionMenuOpen(false)}>Anuluj</Button>
        </div>
      </BottomSheet>

      <FinishSheet
        open={finishSheetOpen}
        onOpenChange={setFinishSheetOpen}
        doneSets={doneSets}
        incompleteSets={incompleteSets}
        minutes={Math.floor(elapsedSeconds / 60)}
        onConfirm={() => confirmFinish()}
      />

      <EmptySessionSheet
        open={emptySessionSheetOpen}
        onOpenChange={setEmptySessionSheetOpen}
        deleting={deletingEmptySession}
        onDelete={async () => {
          setDeletingEmptySession(true);
          const deleted = await handleDeleteSession({ sessionId, online });
          if (deleted) {
            router.replace("/");
            return;
          }
          setDeletingEmptySession(false);
        }}
      />

      <BottomSheet
        open={weightReview != null}
        onOpenChange={(open) => {
          if (!open) setWeightReview(null);
        }}
        title="Sprawdzić wynik?"
        description="Nietypowy wynik wymaga potwierdzenia przed zaliczeniem serii"
      >
        {weightReview && (
          <div className="space-y-md">
            <p className="text-sm text-muted-foreground">
              Chcesz zaliczyć <span className="font-semibold text-foreground">{weightToDisplay(weightReview.set.weight ?? 0, unit)} {unit} × {weightReview.set.reps ?? "—"}</span> w ćwiczeniu {weightReview.ex.name}.
            </p>
            <ul className="space-y-xs rounded-lg bg-warning/10 p-sm text-sm text-warning">
              {weightReview.review.reasons.includes("high_weight") && (
                <li>To więcej niż {weightToDisplay(WEIGHT_REVIEW_KG, unit)} {unit}. Sprawdź, czy ciężar jest wpisany poprawnie.</li>
              )}
              {weightReview.review.reasons.includes("very_high_weight") && (
                <li>To więcej niż {weightToDisplay(VERY_HIGH_WEIGHT_REVIEW_KG, unit)} {unit}. Zapisz go tylko, jeśli na pewno nie ma pomyłki.</li>
              )}
              {weightReview.review.reasons.includes("large_jump") && (
                <li>
                  To ponad 50% więcej niż Twój dotychczasowy prawidłowy wynik
                  {weightReview.review.previousWeight != null
                    ? ` (${weightToDisplay(weightReview.review.previousWeight, unit)} ${unit})`
                    : ""}.
                </li>
              )}
            </ul>
            <Button
              className="w-full"
              onClick={() => {
                if (weightReview.mode === "edit") {
                  commitCompletedEdit(weightReview.ex, weightReview.set);
                } else {
                  commitToggle(weightReview.ex, weightReview.set);
                }
                setWeightReview(null);
              }}
            >
              {weightReview.review.reasons.includes("very_high_weight")
                ? "Na pewno zapisz ten wynik"
                : weightReview.mode === "edit"
                  ? "Wynik jest poprawny, zapisz zmianę"
                  : "Wynik jest poprawny, zalicz serię"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setWeightReview(null)}>
              Wróć do edycji
            </Button>
          </div>
        )}
      </BottomSheet>

      {rest && (
        <RestTimer
          key={rest.endAt}
          endAt={rest.endAt}
          label={rest.label}
          onDone={dismissRest}
          onDismiss={dismissRest}
          onExtend={extendRest}
        />
      )}
    </div>
  );
}
