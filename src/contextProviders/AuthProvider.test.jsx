// Regression tests for AuthProvider when local storage is unavailable.
//
// Safari drops the IndexedDB connection under memory pressure, after which
// every localforage call rejects. Session persistence is a convenience, so a
// storage failure must never fail authentication: before this was handled,
// applyTokens() rejected on setItem and LoginModal reported the resulting
// throw to the user as "Network error. Please try again." on an otherwise
// successful sign-in — and the one-time OTP had already been consumed.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import localforage from "localforage";
import { server } from "../test/server";

import { AuthProvider, useAuth } from "./AuthProvider";

const BASE = "https://api.gatool.org/v3";
const REFRESH_KEY = "gatool.auth.refresh";

const TOKEN_RESPONSE = {
  accessToken: "access-token-abc",
  refreshToken: "refresh-token-def",
  expiresIn: 3600,
  email: "announcer@example.com",
  roles: ["admin"],
};

let refreshResult;

function Probe() {
  const { isAuthenticated, isLoading, user, refreshNow } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="email">{user?.email ?? ""}</span>
      <button
        onClick={async () => {
          refreshResult = await refreshNow();
        }}
      >
        refresh
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  refreshResult = undefined;
  server.use(
    http.post(`${BASE}/auth/refresh`, () => HttpResponse.json(TOKEN_RESPONSE))
  );
});

describe("AuthProvider with unavailable local storage", () => {
  it("still authenticates when the session cannot be written to storage", async () => {
    // A stored refresh token exists, but writing the new one fails.
    vi.spyOn(localforage, "getItem").mockImplementation(async (key) =>
      key === REFRESH_KEY ? "stored-refresh-token" : null
    );
    vi.spyOn(localforage, "setItem").mockRejectedValue(
      new Error("Connection to Indexed Database server lost. Refresh the page to try again")
    );

    renderAuth();

    // Bootstrap refresh runs on mount and must sign the user in regardless.
    await waitFor(() =>
      expect(screen.getByTestId("authed").textContent).toBe("true")
    );
    expect(screen.getByTestId("email").textContent).toBe(
      "announcer@example.com"
    );
  });

  it("resolves an access token instead of rejecting when storage is dead", async () => {
    vi.spyOn(localforage, "getItem").mockImplementation(async (key) =>
      key === REFRESH_KEY ? "stored-refresh-token" : null
    );
    vi.spyOn(localforage, "setItem").mockRejectedValue(
      new Error("Connection to Indexed Database server lost. Refresh the page to try again")
    );

    renderAuth();
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    await act(async () => {
      screen.getByText("refresh").click();
    });

    // Before the fix this rejected, which LoginModal surfaced as
    // "Network error. Please try again." on a successful sign-in.
    await waitFor(() => expect(refreshResult).toBe("access-token-abc"));
  });

  it("does not fail bootstrap when the stored session cannot be read", async () => {
    vi.spyOn(localforage, "getItem").mockRejectedValue(
      new Error("Connection to Indexed Database server lost. Refresh the page to try again")
    );
    vi.spyOn(localforage, "setItem").mockResolvedValue(undefined);

    renderAuth();

    // Unreadable storage means anonymous, but the app must finish loading.
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );
    expect(screen.getByTestId("authed").textContent).toBe("false");
  });
});
