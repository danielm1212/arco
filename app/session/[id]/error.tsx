"use client";

import { RouteError } from "@/components/RouteError";

/**
 * AUDIT-A4: własna granica dla trasy loggera — najgorętszego ekranu aplikacji.
 *
 * Osobna od globalnej, bo tu inne jest zarówno ryzyko, jak i wyjście: użytkownik
 * stoi na siłowni w połowie treningu. Copy musi powiedzieć wprost, że serie z
 * outboxa nie zginęły (leżą w `localStorage` i wyślą się po powrocie sieci),
 * inaczej naturalnym odruchem jest zalogowanie treningu drugi raz.
 */
export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Nie udało się wczytać treningu"
      description="Serie zapisane na tym urządzeniu czekają w kolejce i wyślą się same, gdy wróci sieć. Nie trzeba ich wpisywać ponownie."
      reset={reset}
      digest={error.digest}
    />
  );
}
