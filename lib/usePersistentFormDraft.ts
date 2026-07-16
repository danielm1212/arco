"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePersistentFormDraft<T>({
  storageKey,
  value,
  enabled,
  isValid,
  onRestore,
  debounceMs = 250,
}: {
  storageKey: string;
  value: T;
  enabled: boolean;
  isValid: (candidate: unknown) => candidate is T;
  onRestore: (draft: T) => void;
  debounceMs?: number;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const restoreRef = useRef(onRestore);
  const isValidRef = useRef(isValid);
  const serialized = JSON.stringify(value);

  useEffect(() => {
    restoreRef.current = onRestore;
    isValidRef.current = isValid;
  }, [isValid, onRestore]);

  useEffect(() => {
    let active = true;
    let restoredDraft: T | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const candidate: unknown = JSON.parse(raw);
        if (isValidRef.current(candidate)) {
          restoredDraft = candidate;
        } else {
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      queueMicrotask(() => {
        if (!active) return;
        if (restoredDraft) {
          restoreRef.current(restoredDraft);
          setRecovered(true);
        }
        setHydrated(true);
      });
    }
    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      if (enabled) window.localStorage.setItem(storageKey, serialized);
      else window.localStorage.removeItem(storageKey);
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, hydrated, serialized, storageKey]);

  const clearDraft = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setRecovered(false);
  }, [storageKey]);

  return { recovered, clearDraft };
}
