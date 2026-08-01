/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { CacheableResponsePlugin, CacheFirst, ExpirationPlugin, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Wstrzykiwane przez @serwist/next w czasie builda.
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * AUDIT-A1 (audyt 2026-07-31): `defaultCache` z @serwist/next łapie więcej, niż
 * powinien, i nic tego nigdy nie czyściło.
 *
 * Trzy reguły odcięte i dlaczego akurat one:
 *
 * - **`cross-origin`** (NetworkFirst na KAŻDYM żądaniu spoza origin) trzymał w
 *   Cache Storage m.in. **zdjęcia sylwetki**: `app/body/page.tsx` generuje podpisane
 *   URL-e do bucketu `body-photos` na godzinę, a `BodyPhotoButton` renderuje je
 *   zwykłym `<img>`. Podpis wygasał, kopia w cache zostawała. Zamieniona na regułę
 *   celowaną WYŁĄCZNIE w publiczne obrazy ćwiczeń (`/storage/v1/object/public/`) —
 *   te są tym samym zasobem dla każdego konta, a offline w siłowni realnie się przydają.
 * - **`others`** (łapacz na każde same-origin GET spoza `/api/`) cache'ował
 *   cokolwiek, co nie trafiło we wcześniejsze reguły — bez związku z tym, czy niesie
 *   dane konta.
 * - **`apis`** — pod `/api/` nie mamy nic, co warto podawać ze starej kopii.
 *
 * **Cache stron ZOSTAJE** (`pages`, `pages-rsc`, `pages-rsc-prefetch`). To on daje
 * jedyny offline, jaki mamy przy ubitej apce: telefon bez zasięgu w siłowni potrafi
 * wrócić do loggera z ostatniej kopii, a serie i tak lecą do outboxa. Skasowanie go
 * wymieniłoby wyciek na regresję rdzenia produktu. Ryzyko międzykontowe zdejmuje
 * `clearAppCaches()` przy wylogowaniu (`lib/appCaches.ts`), nie brak cache'u.
 *
 * Wpisy BEZ `cacheName` (NetworkOnly na `/api/auth/*` i domykający łapacz, a w dev
 * cały `defaultCache`) muszą zostać — to strażnicy, nie pamięć podręczna.
 */
const DROPPED_CACHES = new Set(["cross-origin", "others", "apis"]);

const runtimeCaching: RuntimeCaching[] = [
  {
    // Obrazy ćwiczeń z własnego Supabase Storage — publiczne, niezwiązane z kontem.
    matcher: ({ url, sameOrigin }) =>
      !sameOrigin && url.pathname.startsWith("/storage/v1/object/public/"),
    method: "GET",
    handler: new CacheFirst({
      cacheName: "arco-exercise-images",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    }),
  },
  ...defaultCache.filter((entry) => {
    const cacheName = (entry.handler as { cacheName?: string }).cacheName;
    return cacheName === undefined || !DROPPED_CACHES.has(cacheName);
  }),
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();
