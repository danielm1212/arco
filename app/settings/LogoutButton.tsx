"use client";

import { useSyncExternalStore, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { clearAppCaches } from "@/lib/appCaches";
import { pendingCount } from "@/lib/outbox";
import { setWord } from "@/lib/streakCopy";
import { logout } from "@/app/login/actions";

/**
 * AUDIT-A1 (audyt 2026-07-31): wylogowanie musi zabrać ze sobą kopie stron z
 * danymi konta (patrz `lib/appCaches.ts`), a wcześniej powiedzieć prawdę o tym,
 * co jeszcze nie doleciało na serwer.
 *
 * Dwie rzeczy, których wcześniej nie robiło:
 * 1. czyściło wyłącznie cookie — cache RSC/HTML zostawał na urządzeniu;
 * 2. milczało o niezsynchronizowanych seriach. Outbox zostaje w `localStorage` i
 *    wyśle się po ponownym zalogowaniu TEGO SAMEGO konta na TYM urządzeniu, ale
 *    użytkownik nie miał skąd tego wiedzieć — a „Wyloguj" tuż po treningu w
 *    piwnicy siłowni to realna sekwencja. Ostrzegamy, nie blokujemy: to jego dane
 *    i jego decyzja.
 */
/* `pendingCount` czyta localStorage, więc na serwerze musi zwrócić 0 — inaczej
   serwer i klient wyrenderowałyby różny tekst. `useSyncExternalStore` z migawką
   serwera to wzorzec, którego repo już używa w `OfflineBanner`; `useEffect` +
   `setState` jest tu zabronione przez `react-hooks/set-state-in-effect`.
   Kolejka zmienia się tylko w loggerze, na innej trasie — pusta subskrypcja
   wystarczy, ale reagujemy na `storage`, gdy apka jest otwarta w dwóch kartach. */
const subscribePending = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

export function LogoutButton() {
  const pending = useSyncExternalStore(subscribePending, pendingCount, () => 0);
  const [isRunning, startTransition] = useTransition();

  return (
    <div className="mt-lg space-y-sm">
      {pending > 0 && (
        <p role="status" className="text-xs text-muted-foreground">
          {/* Orzeczenie idzie za przypadkiem, nie za liczebnością: „2 serie czekają",
              ale „5 serii czeka" (dopełniacz wymusza liczbę pojedynczą). */}
          {pending} {setWord(pending)} {setWord(pending) === "serie" ? "czekają" : "czeka"} na
          wysłanie. Zostaną na tym urządzeniu i wyślą się, gdy zalogujesz się ponownie.
        </p>
      )}
      <Button
        variant="outline"
        type="button"
        className="w-full text-danger"
        disabled={isRunning}
        onClick={() => {
          startTransition(async () => {
            await clearAppCaches();
            await logout();
          });
        }}
      >
        Wyloguj
      </Button>
    </div>
  );
}
