// App-level smoke tests.
//
// Goal: catch page-level regressions (e.g. the recent CheatsheetPage
// flashcard breakage) at PR time. We mount the *real* `<App />` against the
// MSW fixture server and visit each top-level route, asserting that:
//   1. render does not throw and no Error Boundary message replaces the page
//   2. a route-specific sentinel string is present once the page settles
//
// Strategy
// --------
// App.jsx pulls auth + event selection from context. Driving those through
// the real providers requires Auth0, network refreshes, and async localforage
// hydration — all noise unrelated to "did this page render?". So we mock the
// two relevant context modules to return synchronous, stable values:
//
//   - `useAuth`  → not loading, not authenticated user
//                  (App and pages must still render in this state)
//   - `useEventSelection` → no event picked yet, FRC mode (ftcMode=null)
//
// With no event selected, every data-driven page falls back to its
// "you need to select an event" alert (or its always-rendered chrome). This
// keeps the smoke tests fast and deterministic while still exercising:
//   - the page module loading (catches broken imports — the cheatsheet bug)
//   - render of every layout, navigation, and provider wiring
//   - the route table in App.jsx
//
// MSW handlers (src/test/handlers.js) cover the event list / districts /
// announcements fetches App.jsx fires on mount; per-test handlers below
// cover the few endpoints not in defaults (`<year>/districts`).

import { http, HttpResponse } from "msw";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { server } from "./test/server";

// jsdom doesn't implement matchMedia; useDarkMode reads it on mount.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom doesn't implement Element.scrollTo; App.jsx scrolls the layout
// container on every route change.
if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
if (typeof window !== "undefined" && !window.scrollTo) {
  window.scrollTo = () => {};
}

// --- Mocks must be declared before importing App ---

let mockAuth = {
  // A non-admin authenticated user — Developer page reads
  // user["https://gatool.org/roles"] without null-checking, so we always
  // hand it a user-shaped object. Other pages don't care.
  user: { email: "test@example.com", "https://gatool.org/roles": [] },
  isAuthenticated: true,
  isLoading: false,
  lastEmail: "test@example.com",
  getAccessToken: vi.fn(async () => "fake-token"),
  getAccessTokenSilently: vi.fn(async () => ({
    id_token: "fake",
    access_token: "fake",
  })),
  refreshNow: vi.fn(async () => null),
  logout: vi.fn(async () => {}),
  openLoginModal: vi.fn(),
  openPasskeyModal: vi.fn(),
  loginWithRedirect: vi.fn(),
};

// react-loader-spinner uses framer-motion's `motion.div` API which fails to
// initialise under jsdom. The spinner is decorative — replace the (single)
// import App and its components use with a no-op component.
vi.mock("react-loader-spinner", () => ({ Blocks: () => null }));

vi.mock("./contextProviders/AuthProvider", () => ({
  useAuth: () => mockAuth,
  useAuth0: () => mockAuth,
  AuthProvider: ({ children }) => children,
  initialsAvatar: () => "",
}));

let mockSelection = {
  selectedEvent: null,
  selectedYear: null,
  ftcMode: null,
  setSelectedEvent: vi.fn(),
  setSelectedYear: vi.fn(),
  setFTCMode: vi.fn(),
};

vi.mock("./contexts/EventSelectionContext", () => ({
  useEventSelection: () => mockSelection,
  EventSelectionProvider: ({ children }) => children,
}));

// vi.mock calls are hoisted, so these imports see the mocked modules even
// though they look like normal top-level imports.
import App from "./App";
import { OnlineStatusProvider } from "./contextProviders/OnlineContext";
import { AuthClientContextProvider } from "./contextProviders/AuthClientContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { HotkeysProvider } from "react-hotkeys-hook";
import { SnackbarProvider } from "notistack";

const BASE = "https://api.gatool.org/v3";

function renderAt(route) {
  // App uses BrowserRouter, so steer the initial location via the History API
  // before mounting. Each test cleans up between renders.
  window.history.pushState({}, "", route);
  return render(
    <HotkeysProvider initiallyActiveScopes={["matchNavigation", "tabNavigation", "none"]}>
      <OnlineStatusProvider>
        <AuthClientContextProvider>
          <SnackbarProvider>
            <SettingsProvider>
              <App />
            </SettingsProvider>
          </SnackbarProvider>
        </AuthClientContextProvider>
      </OnlineStatusProvider>
    </HotkeysProvider>
  );
}

beforeEach(() => {
  // Stub endpoints App.jsx hits on mount that don't have default handlers.
  // `/<year>/districts` is fetched per supported year on bootstrap.
  server.use(
    http.get(`${BASE}/:year/districts`, () =>
      HttpResponse.json({ districts: [] })
    ),
    // useFTCOffline path uses /api/v1/events/ — only fires in FTC mode but
    // belt-and-suspenders.
    http.get("*/api/v1/events/", () =>
      HttpResponse.json({ eventCodes: [] })
    ),
    // Developer page polls sync status on mount when admin; non-admin still
    // calls `getSyncStatus` which hits this endpoint. Stub to silence MSW.
    http.get(`${BASE}/system/syncusers`, () => HttpResponse.json({}))
  );
  // Reset mocked state to defaults between tests.
  mockSelection = {
    selectedEvent: null,
    selectedYear: null,
    ftcMode: null,
    setSelectedEvent: vi.fn(),
    setSelectedYear: vi.fn(),
    setFTCMode: vi.fn(),
  };
  mockAuth = {
    ...mockAuth,
    user: { email: "test@example.com", "https://gatool.org/roles": [] },
    isAuthenticated: true,
    isLoading: false,
  };
});

// Suppress predictable jsdom CSS / unhandled-rejection chatter that the
// real-app providers generate (toast styles, animation observers). React
// error-boundary warnings are intentionally NOT suppressed — those would
// indicate the kind of regression these tests exist to catch.
const originalConsoleError = console.error;
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation((...args) => {
    const msg = String(args[0] ?? "");
    if (msg.includes("Not implemented: HTMLCanvasElement")) return;
    if (msg.includes("Could not parse CSS")) return;
    originalConsoleError.apply(console, args);
  });
});

// Each route + the sentinel that proves it rendered. Most pages share the
// "you need to select an event" alert — that's fine: the value of the smoke
// test is the *render* succeeding for each route, not asserting unique copy.
const ROUTES = [
  { path: "/", sentinel: /Choose a program\.\.\./i, name: "SetupPage" },
  {
    path: "/schedule",
    sentinel: /you need to select an event/i,
    name: "SchedulePage",
  },
  {
    path: "/teamdata",
    sentinel: /you need to select an event/i,
    name: "TeamDataPage",
  },
  { path: "/ranks", sentinel: /you need to select an event/i, name: "RanksPage" },
  {
    path: "/announce",
    sentinel: /you need to select an event/i,
    name: "AnnouncePage",
  },
  {
    path: "/playbyplay",
    sentinel: /you need to select an event/i,
    name: "PlayByPlayPage",
  },
  {
    path: "/allianceselection",
    sentinel: /you need to select an event/i,
    name: "AllianceSelectionPage",
  },
  {
    path: "/awards",
    sentinel: /you need to select an event/i,
    name: "AwardsPage",
  },
  { path: "/stats", sentinel: /you need to select an event/i, name: "StatsPage" },
  {
    path: "/cheatsheet",
    sentinel: /Download the Cheat Sheet/i,
    name: "CheatsheetPage",
  },
  { path: "/emcee", sentinel: /you need to select an event/i, name: "EmceePage" },
  {
    path: "/dev",
    // Mocked user has no admin role → page renders the unauthorized alert,
    // which still proves the page module loaded and the route resolved.
    sentinel: /not authorized to use this page/i,
    name: "Developer",
  },
];

describe("App smoke tests", () => {
  for (const { path, sentinel, name } of ROUTES) {
    it(`renders ${name} at ${path}`, async () => {
      expect(() => renderAt(path)).not.toThrow();
      const node = await screen.findByText(sentinel, undefined, {
        timeout: 5000,
      });
      expect(node).toBeInTheDocument();
      cleanup();
    });
  }
});
