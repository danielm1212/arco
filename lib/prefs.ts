/** Preferencje urządzenia (localStorage, bez DB) — auto-przerwa i blokada wygaszania. */

const read = (key: string, def: boolean): boolean => {
  if (typeof window === "undefined") return def;
  const v = window.localStorage.getItem(key);
  return v == null ? def : v === "1";
};
const write = (key: string, val: boolean) => {
  if (typeof window !== "undefined") window.localStorage.setItem(key, val ? "1" : "0");
};

const AUTO_REST = "arco:autoRest";
const KEEP_AWAKE = "arco:keepAwake";

export const getAutoRest = () => read(AUTO_REST, true);
export const setAutoRest = (v: boolean) => write(AUTO_REST, v);
export const getKeepAwake = () => read(KEEP_AWAKE, true);
export const setKeepAwake = (v: boolean) => write(KEEP_AWAKE, v);
