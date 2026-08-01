"use client";

import { RouteError } from "@/components/RouteError";

/**
 * AUDIT-A4: granica błędu dla całej aplikacji (poza layoutem korzenia).
 * Łapie rzuty z RSC i z akcji serwerowych wywołanych z `<form action>` — np.
 * `ensureSession` przy starcie treningu, gdy sieć padnie w połowie.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Nie udało się wczytać tego ekranu"
      description="Dane nie doszły z serwera. Zwykle wystarczy spróbować ponownie — zapisane treningi są bezpieczne."
      reset={reset}
      digest={error.digest}
    />
  );
}
