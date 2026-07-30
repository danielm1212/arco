export type AppTab = "home" | "training" | "team";

export type ScreenType =
  | "hub"
  | "hub-subview"
  | "child"
  | "focus"
  | "session-live"
  | "session-edit"
  | "session-child"
  | "moment"
  | "auth";

export type MiniBarPosition = "above-nav" | "safe-bottom";

export interface AppChromeConfig {
  screenType: ScreenType;
  showBottomNav: boolean;
  activeTab: AppTab | null;
  showSessionMiniBar: boolean;
  miniBarPosition: MiniBarPosition;
}

interface RouteRule extends AppChromeConfig {
  id: string;
  matches: (pathname: string) => boolean;
}

const exact = (expected: string) => (pathname: string) => pathname === expected;
const segment = (prefix: string) => (pathname: string) => pathname.startsWith(`${prefix}/`);

const hub = (activeTab: AppTab): Omit<RouteRule, "id" | "matches"> => ({
  screenType: "hub",
  showBottomNav: true,
  activeTab,
  showSessionMiniBar: true,
  miniBarPosition: "above-nav",
});

const subview = (activeTab: AppTab): Omit<RouteRule, "id" | "matches"> => ({
  screenType: "hub-subview",
  showBottomNav: true,
  activeTab,
  showSessionMiniBar: true,
  miniBarPosition: "above-nav",
});

const child = (activeTab: AppTab): Omit<RouteRule, "id" | "matches"> => ({
  screenType: "child",
  showBottomNav: true,
  activeTab,
  showSessionMiniBar: true,
  miniBarPosition: "above-nav",
});

const focused = (screenType: ScreenType = "focus"): Omit<RouteRule, "id" | "matches"> => ({
  screenType,
  showBottomNav: false,
  activeTab: null,
  showSessionMiniBar: false,
  miniBarPosition: "safe-bottom",
});

/**
 * Kolejność jest istotna: dokładniejsze trasy muszą wyprzedzać dynamiczne segmenty.
 * To jest jedyne miejsce z domyślnym kontraktem chrome dla produkcyjnych stron.
 */
export const APP_ROUTE_RULES: readonly RouteRule[] = [
  { id: "home", matches: exact("/"), ...hub("home") },
  { id: "program-library", matches: exact("/programs"), ...subview("training") },
  { id: "program-detail", matches: segment("/programs"), ...child("training") },
  { id: "progress", matches: exact("/progress"), ...subview("training") },
  { id: "body", matches: exact("/body"), ...subview("training") },
  { id: "body-add", matches: exact("/body/add"), ...focused() },
  { id: "exercise-detail", matches: segment("/exercise"), ...child("training") },
  { id: "history-add", matches: exact("/history/add"), ...focused("session-edit") },
  { id: "history", matches: exact("/history"), ...subview("training") },
  { id: "history-detail", matches: segment("/history"), ...child("training") },
  { id: "team-home", matches: exact("/ekipa"), ...hub("team") },
  { id: "settings", matches: exact("/settings"), ...focused() },
  { id: "session-done", matches: (pathname) => /^\/session\/[^/]+\/done$/.test(pathname), ...focused("moment") },
  { id: "session", matches: (pathname) => /^\/session\/[^/]+$/.test(pathname), ...focused("session-live") },
  { id: "login", matches: exact("/login"), ...focused("auth") },
] as const;

export const UNKNOWN_CHROME: AppChromeConfig = focused();

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export function resolveAppChrome(pathname: string): AppChromeConfig {
  const normalized = normalizePathname(pathname);
  const rule = APP_ROUTE_RULES.find((candidate) => candidate.matches(normalized));

  if (!rule) return UNKNOWN_CHROME;

  return {
    screenType: rule.screenType,
    showBottomNav: rule.showBottomNav,
    activeTab: rule.activeTab,
    showSessionMiniBar: rule.showSessionMiniBar,
    miniBarPosition: rule.miniBarPosition,
  };
}

export function resolveAppChromeRouteId(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  return APP_ROUTE_RULES.find((candidate) => candidate.matches(normalized))?.id ?? null;
}

export const APP_ROUTE_CASES = [
  ["/", "hub", "home"],
  ["/programs", "hub-subview", "training"],
  ["/programs/example", "child", "training"],
  ["/progress", "hub-subview", "training"],
  ["/body", "hub-subview", "training"],
  ["/body/add", "focus", null],
  ["/exercise/example", "child", "training"],
  ["/history", "hub-subview", "training"],
  ["/history/example", "child", "training"],
  ["/history/add", "session-edit", null],
  ["/ekipa", "hub", "team"],
  ["/settings", "focus", null],
  ["/session/example", "session-live", null],
  ["/session/example/done", "moment", null],
  ["/login", "auth", null],
] as const satisfies readonly (readonly [string, ScreenType, AppTab | null])[];
