/**
 * Błąd z bazy → komunikat dla użytkownika (D2, audyt 2026-07-31).
 *
 * Server actions zwracały wprost `error.message` z Postgresa, więc w polskim
 * toaście lądowało `new row violates row-level security policy for table
 * "pod_members"`. To jest podwójny problem: użytkownik nie wie, co zrobić, a
 * komunikat wynosi na zewnątrz nazwy tabel i polityk RLS.
 *
 * Surowy błąd zostaje w logu serwera — tam jest przydatny i nie widzi go nikt
 * poza właścicielem. Na wierzch idzie zdanie po polsku: albo znane tłumaczenie
 * kodu SQLSTATE, albo `fallback` opisujący KONKRETNĄ operację („Nie udało się
 * usunąć członka ekipy"), bo „Wystąpił błąd" nie mówi nawet, co się nie udało.
 */

/** Kody, przy których da się powiedzieć coś sensowniejszego niż fallback. */
const BY_CODE: Record<string, string> = {
  "23505": "Taki wpis już istnieje.",
  "23503": "Powiązane dane nie istnieją albo zostały już usunięte.",
  "23514": "Wartość jest poza dozwolonym zakresem.",
  "23502": "Brakuje wymaganych danych.",
  // RLS i brak uprawnień: użytkownik nie ma czego naprawiać, ale musi wiedzieć,
  // że to nie jest awaria — najczęściej to cudzy zasób albo wygasła sesja.
  "42501": "Nie masz uprawnień do tej operacji.",
  PGRST301: "Sesja wygasła. Zaloguj się ponownie.",
};

export interface DbErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
}

export function userFacingError(
  error: DbErrorLike | null | undefined,
  fallback: string,
): string {
  if (error) {
    // Log serwerowy — jedyne miejsce, gdzie surowy komunikat ma sens.
    console.error("[action]", error.code ?? "?", error.message ?? error);
  }
  const code = error?.code;
  return (code && BY_CODE[code]) || fallback;
}
