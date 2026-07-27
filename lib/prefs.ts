/** Preferencje urządzenia (localStorage, bez DB). */

const read = (key: string, def: boolean): boolean => {
  if (typeof window === "undefined") return def;
  const v = window.localStorage.getItem(key);
  return v == null ? def : v === "1";
};
const write = (key: string, val: boolean) => {
  if (typeof window !== "undefined") window.localStorage.setItem(key, val ? "1" : "0");
};
const readNumber = (key: string, def: number, min: number, max: number): number => {
  if (typeof window === "undefined") return def;
  const raw = window.localStorage.getItem(key);
  if (raw == null) return def;
  const value = Number(raw);
  return Number.isFinite(value)
    ? Math.max(min, Math.min(max, Math.round(value)))
    : def;
};
const writeNumber = (key: string, val: number, min: number, max: number) => {
  if (typeof window === "undefined") return;
  const safe = Math.max(min, Math.min(max, Math.round(val)));
  window.localStorage.setItem(key, String(safe));
};

const AUTO_REST = "arco:autoRest";
const KEEP_AWAKE = "arco:keepAwake";
const REORDER_HINT_SEEN = "arco:reorderHintSeen";
const WARMUP_MINUTES = "arco:warmupMinutes";
const STRETCHING_MINUTES = "arco:stretchingMinutes";

export const getAutoRest = () => read(AUTO_REST, true);
export const setAutoRest = (v: boolean) => write(AUTO_REST, v);
export const getKeepAwake = () => read(KEEP_AWAKE, true);
export const setKeepAwake = (v: boolean) => write(KEEP_AWAKE, v);
/** R7: jednorazowa edukacja gestu reorder po pierwszym dodaniu ćwiczenia z pickera. */
export const getReorderHintSeen = () => read(REORDER_HINT_SEEN, false);
export const setReorderHintSeen = (v: boolean) => write(REORDER_HINT_SEEN, v);
export const getWarmupMinutes = () => readNumber(WARMUP_MINUTES, 5, 2, 15);
export const setWarmupMinutes = (v: number) => writeNumber(WARMUP_MINUTES, v, 2, 15);
export const getStretchingMinutes = () => readNumber(STRETCHING_MINUTES, 3, 1, 10);
export const setStretchingMinutes = (v: number) =>
  writeNumber(STRETCHING_MINUTES, v, 1, 10);
