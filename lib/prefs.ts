/**
 * Preferencje urządzenia (localStorage, bez DB).
 *
 * Każdy dostęp jest osłonięty: `localStorage` rzuca wyjątkiem w Safari w trybie
 * prywatnym, przy zapełnionym quocie i w kontekstach o zablokowanym storage.
 * To są wygody urządzenia — brak zapisu nie może wywrócić ekranu treningu
 * (ta sama zasada co w `RoutineTimer`). Odkryte przy SESSION-01A3: nieosłonięty
 * zapis w cleanupie overlaya wywalał cały komponent.
 */

const readRaw = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeRaw = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preferencja przepada, trening idzie dalej.
  }
};

const read = (key: string, def: boolean): boolean => {
  const v = readRaw(key);
  return v == null ? def : v === "1";
};
const write = (key: string, val: boolean) => writeRaw(key, val ? "1" : "0");
const readNumber = (key: string, def: number, min: number, max: number): number => {
  const raw = readRaw(key);
  if (raw == null) return def;
  const value = Number(raw);
  return Number.isFinite(value)
    ? Math.max(min, Math.min(max, Math.round(value)))
    : def;
};
const writeNumber = (key: string, val: number, min: number, max: number) => {
  writeRaw(key, String(Math.max(min, Math.min(max, Math.round(val)))));
};

const AUTO_REST = "arco:autoRest";
const KEEP_AWAKE = "arco:keepAwake";
const REORDER_HINT_SEEN = "arco:reorderHintSeen";
const LOGGER_HINT_SEEN = "arco:loggerHintSeen";
const WARMUP_MINUTES = "arco:warmupMinutes";
const STRETCHING_MINUTES = "arco:stretchingMinutes";

export const getAutoRest = () => read(AUTO_REST, true);
export const setAutoRest = (v: boolean) => write(AUTO_REST, v);
export const getKeepAwake = () => read(KEEP_AWAKE, true);
export const setKeepAwake = (v: boolean) => write(KEEP_AWAKE, v);
/** R7: jednorazowa edukacja gestu reorder po pierwszym dodaniu ćwiczenia z pickera. */
export const getReorderHintSeen = () => read(REORDER_HINT_SEEN, false);
export const setReorderHintSeen = (v: boolean) => write(REORDER_HINT_SEEN, v);
/** SESSION-01A3: jednorazowa podpowiedź „wpisz i zalicz" przy pierwszym treningu. */
export const getLoggerHintSeen = () => read(LOGGER_HINT_SEEN, false);
export const setLoggerHintSeen = (v: boolean) => write(LOGGER_HINT_SEEN, v);
export const getWarmupMinutes = () => readNumber(WARMUP_MINUTES, 5, 2, 15);
export const setWarmupMinutes = (v: number) => writeNumber(WARMUP_MINUTES, v, 2, 15);
export const getStretchingMinutes = () => readNumber(STRETCHING_MINUTES, 3, 1, 10);
export const setStretchingMinutes = (v: number) =>
  writeNumber(STRETCHING_MINUTES, v, 1, 10);
