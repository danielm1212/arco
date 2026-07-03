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
    <div className="fixed inset-x-0 top-0 z-50 bg-warning/95 px-md py-1.5 text-center text-xs font-medium text-black">
      Jesteś offline — serie zapisują się lokalnie i zsynchronizują po powrocie sieci.
    </div>
  );
}
