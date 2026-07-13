"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

/** S14: stały sygnał offline — serie i tak zapisują się lokalnie (outbox). */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    // fixed → ignoruje pt-safe na <body>; potrzebuje własnego safe-area (notch PWA)
    <div className="fixed inset-x-0 top-0 z-50 bg-warning/95 px-md pb-1.5 pt-[calc(0.375rem+env(safe-area-inset-top))] text-center text-xs font-medium text-black">
      Brak internetu. Serie zapisują się na tym urządzeniu i wyślą się po powrocie sieci.
    </div>
  );
}
