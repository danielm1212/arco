/**
 * AUDIT-A1 (audyt 2026-07-31): czyszczenie Cache Storage przy wylogowaniu.
 *
 * Service worker cache'uje odpowiedzi RSC i HTML zalogowanego użytkownika
 * (`pages`, `pages-rsc`, `pages-rsc-prefetch` — zostawione świadomie, bo to jedyny
 * offline przy ubitej apce; patrz `app/sw.ts`). Wylogowanie kasowało wyłącznie
 * cookie sesji, więc kopie z imieniem w powitaniu, passą i listą treningów zostawały
 * na urządzeniu. Na telefonie dzielonym albo koncie testowym przekazanym komuś z
 * ekipy kolejna osoba mogła je zobaczyć — wystarczyło, że sieć nie odpowie i
 * NetworkFirst sięgnie po kopię.
 *
 * Kasujemy WSZYSTKIE cache, łącznie z precache statycznych zasobów. Kosztuje to
 * jedno ponowne pobranie plików buildu po następnym zalogowaniu, ale nie wymaga
 * utrzymywania listy nazw cache'u — a ta lista należy do biblioteki i zmieni się
 * bez naszego udziału (dziś `PAGES_CACHE_NAME` z @serwist/next). Lista, która
 * milcząco się zdezaktualizuje, jest tu gorsza niż nadmiarowe kasowanie.
 *
 * NIE dotykamy `localStorage`: tam siedzi outbox z niezsynchronizowanymi seriami
 * (`lib/outbox.ts`). Wyczyszczenie go przy wylogowaniu byłoby cichą utratą
 * zalogowanego treningu. Zamiast tego użytkownik dostaje ostrzeżenie przed
 * wylogowaniem (`app/settings/LogoutButton.tsx`).
 */
export async function clearAppCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    // Cache Storage bywa niedostępne (prywatne okno Safari, zablokowany storage).
    // Wylogowanie nie może się przez to zatrzymać — cookie sesji i tak znika.
  }
}
