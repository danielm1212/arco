import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import {
  APP_ROUTE_CASES,
  UNKNOWN_CHROME,
  normalizePathname,
  resolveAppChrome,
  resolveAppChromeRouteId,
} from "../lib/appChrome";
import { TRAINING_SUBVIEWS } from "../components/navigation/TrainingSubnav";

function findPages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findPages(path);
    return entry.name === "page.tsx" ? [path] : [];
  });
}

function pagePathToRoute(pagePath: string) {
  const appDirectory = join(process.cwd(), "app");
  const directory = relative(appDirectory, join(pagePath, ".."));
  if (!directory || directory === ".") return "/";
  return `/${directory.split(sep).map((part) => part.replace(/^\[.+\]$/, "example")).join("/")}`;
}

test("każda produkcyjna strona ma jawną regułę chrome", () => {
  const routes = findPages(join(process.cwd(), "app")).map(pagePathToRoute);
  assert.ok(routes.length > 0);

  for (const route of routes) {
    assert.notEqual(resolveAppChromeRouteId(route), null, `Brak reguły chrome dla ${route}`);
  }
});

test("macierz tras zwraca oczekiwany typ ekranu i aktywny tab", () => {
  for (const [route, screenType, activeTab] of APP_ROUTE_CASES) {
    const config = resolveAppChrome(route);
    assert.equal(config.screenType, screenType, route);
    assert.equal(config.activeTab, activeTab, route);
    assert.equal(config.showBottomNav, activeTab !== null, route);
  }
});

test("bottom nav nigdy nie jest widoczny bez aktywnego taba", () => {
  for (const [route] of APP_ROUTE_CASES) {
    const config = resolveAppChrome(route);
    assert.ok(!config.showBottomNav || config.activeTab !== null, route);
  }
});

test("wszystkie przestrzenie i podwidoki Treningu pokazują mini-bar aktywnej sesji", () => {
  assert.equal(resolveAppChrome("/").showSessionMiniBar, true);
  assert.equal(resolveAppChrome("/programs").showSessionMiniBar, true);
  assert.equal(resolveAppChrome("/progress").showSessionMiniBar, true);
  assert.equal(resolveAppChrome("/body").showSessionMiniBar, true);
  assert.equal(resolveAppChrome("/history").showSessionMiniBar, true);
  assert.equal(resolveAppChrome("/ekipa").showSessionMiniBar, true);
});

test("NAV-01: cztery podwidoki dzielą aktywny tab Trening", () => {
  assert.deepEqual(
    TRAINING_SUBVIEWS.map(({ id, href, label }) => ({ id, href, label })),
    [
      { id: "plans", href: "/programs", label: "Plany" },
      { id: "progress", href: "/progress", label: "Postępy" },
      { id: "body", href: "/body", label: "Ciało" },
      { id: "history", href: "/history", label: "Historia" },
    ],
  );

  for (const { href } of TRAINING_SUBVIEWS) {
    const config = resolveAppChrome(href);
    assert.equal(config.screenType, "hub-subview", href);
    assert.equal(config.activeTab, "training", href);
  }
  assert.equal(resolveAppChrome("/").activeTab, "home");
});

test("nieznana i znormalizowana trasa zachowują się bezpiecznie", () => {
  assert.equal(normalizePathname("/programs/"), "/programs");
  assert.deepEqual(resolveAppChrome("/nieznana"), UNKNOWN_CHROME);
  assert.equal(resolveAppChrome("/nieznana").showBottomNav, false);
});
