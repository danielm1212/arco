import { toast } from "sonner";

/**
 * S10: guard akcji wymagających sieci (podmiana/dodanie/pomiń idą przez server
 * actions — offline kończyły się generycznym błędem). Zwraca false + czytelny
 * sygnał, gdy jesteśmy offline. Serie NIE potrzebują guarda — mają outbox.
 */
export function ensureOnline(what: string): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    toast.error(`${what.charAt(0).toUpperCase()}${what.slice(1)} wymaga internetu. Serie możesz zapisywać dalej.`);
    return false;
  }
  return true;
}
