import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { waitFor, act } from "@testing-library/react";
import localforage from "localforage";
import { server } from "../test/server";
import { createTestHttpClient } from "../test/httpClient";
import { renderHookWithProviders } from "../test/renderHook";
import { loadFixture } from "../test/fixtures";

let mockEventSelection;

vi.mock("../contexts/EventSelectionContext", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useEventSelection: () => mockEventSelection,
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { useCommunityUpdates } from "./useCommunityUpdates";

const BASE = "https://api.gatool.org/v3";

function makeDeps(overrides = {}) {
  return {
    httpClient: createTestHttpClient(),
    teamList: { teams: [{ teamNumber: 190 }, { teamNumber: 97 }] },
    isOnline: true,
    useFTCOffline: false,
    manualOfflineMode: false,
    localUpdates: [],
    EITeams: [],
    qualSchedule: { schedule: [] },
    playoffSchedule: { schedule: [] },
    getEffectiveTeamNumber: vi.fn(async (n) => n),
    cheesyArenaAvailable: false,
    useCheesyArena: false,
    ...overrides,
  };
}

beforeEach(async () => {
  await localforage.clear();
  mockEventSelection = {
    selectedEvent: { value: { code: "MAWOR", name: "WPI District" } },
    selectedYear: { value: "2026" },
    ftcMode: null,
    setSelectedEvent: vi.fn(),
    setSelectedYear: vi.fn(),
    setFTCMode: vi.fn(),
  };
});

describe("useCommunityUpdates (FRC mode)", () => {
  it("initial state is null with no loading", () => {
    mockEventSelection.selectedEvent = null;
    const deps = makeDeps({ teamList: { teams: [] } });
    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    expect(result.current.communityUpdates).toBeNull();
    expect(result.current.loadingCommunityUpdates).toBe(false);
    expect(typeof result.current.getCommunityUpdates).toBe("function");
  });

  it("does nothing when no event is selected", async () => {
    mockEventSelection.selectedEvent = null;
    const deps = makeDeps({ teamList: { teams: [] } });

    // If a fetch is attempted at all, fail loudly.
    server.use(
      http.get(`${BASE}/:year/communityUpdates/:event`, () => {
        throw new Error("Should not fetch when no event is selected");
      })
    );

    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await act(async () => {
      await result.current.getCommunityUpdates();
    });

    expect(result.current.communityUpdates).toBeNull();
    expect(result.current.loadingCommunityUpdates).toBe(false);
  });

  it("happy-path fetch loads community updates from the event endpoint", async () => {
    const deps = makeDeps();
    const fixture = loadFixture("2026-MAWOR-community-updates");

    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await waitFor(() => {
      expect(result.current.communityUpdates).not.toBeNull();
    });

    // Should be the array of team updates from the fixture, with teamNumber
    // coerced to a number.
    expect(Array.isArray(result.current.communityUpdates)).toBe(true);
    expect(result.current.communityUpdates.length).toBe(fixture.length);
    for (const team of result.current.communityUpdates) {
      expect(typeof team.teamNumber).toBe("number");
    }

    // Stamps lastUpdate on the array.
    expect(result.current.communityUpdates.lastUpdate).toEqual(
      expect.any(String)
    );

    // Loading flag returns to false when done.
    await waitFor(() =>
      expect(result.current.loadingCommunityUpdates).toBe(false)
    );
  });

  it("leaves communityUpdates null when the event endpoint returns an empty list", async () => {
    server.use(
      http.get(`${BASE}/:year/communityUpdates/:event`, () =>
        HttpResponse.json([])
      )
    );

    const deps = makeDeps();
    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    // Wait for loading flag to settle (true -> false).
    await waitFor(() =>
      expect(result.current.loadingCommunityUpdates).toBe(false)
    );

    // Empty payload short-circuits before setCommunityUpdates is called, so
    // it remains at its initial null value.
    expect(result.current.communityUpdates).toBeNull();
  });

  it("sets communityUpdates to [] when the API returns a 500 error", async () => {
    server.use(
      http.get(`${BASE}/:year/communityUpdates/:event`, () =>
        HttpResponse.json({ message: "boom" }, { status: 500 })
      )
    );

    const deps = makeDeps();
    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await waitFor(() => {
      expect(result.current.communityUpdates).toEqual([]);
    });
    expect(result.current.loadingCommunityUpdates).toBe(false);
  });

  it("sets communityUpdates to [] when the API returns a 404", async () => {
    server.use(
      http.get(`${BASE}/:year/communityUpdates/:event`, () =>
        HttpResponse.json({ message: "not found" }, { status: 404 })
      )
    );

    const deps = makeDeps();
    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await waitFor(() => {
      expect(result.current.communityUpdates).toEqual([]);
    });
  });

  it("merges localUpdates into the fetched team data", async () => {
    const localUpdates = [
      {
        teamNumber: 97,
        update: {
          teamNotesLocal: "<p>Locally edited note for 97</p>",
          robotNameLocal: "Local Override",
        },
      },
    ];
    const deps = makeDeps({ localUpdates });

    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await waitFor(() => {
      expect(result.current.communityUpdates).not.toBeNull();
    });

    const team97 = result.current.communityUpdates.find(
      (t) => t.teamNumber === 97
    );
    expect(team97).toBeDefined();
    expect(team97.updates.teamNotesLocal).toBe(
      "<p>Locally edited note for 97</p>"
    );
    expect(team97.updates.robotNameLocal).toBe("Local Override");
  });

  it("ignores localUpdates when ignoreLocalUpdates=true is passed to getCommunityUpdates", async () => {
    const localUpdates = [
      {
        teamNumber: 97,
        update: { robotNameLocal: "SHOULD NOT APPEAR" },
      },
    ];
    // Start with no teamList to suppress the auto-fetch in useEffect, then
    // call getCommunityUpdates directly with ignoreLocalUpdates=true.
    const deps = makeDeps({ localUpdates, teamList: { teams: [] } });

    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await act(async () => {
      await result.current.getCommunityUpdates(false, undefined, true);
    });

    await waitFor(() => {
      expect(result.current.communityUpdates).not.toBeNull();
    });

    const team97 = result.current.communityUpdates.find(
      (t) => t.teamNumber === 97
    );
    expect(team97).toBeDefined();
    expect(team97.updates.robotNameLocal).not.toBe("SHOULD NOT APPEAR");
  });

  it("appends EI team updates to the fetched list", async () => {
    const deps = makeDeps({
      EITeams: [{ teamNumber: 190 }],
    });

    const { result } = renderHookWithProviders(() =>
      useCommunityUpdates(deps)
    );

    await waitFor(() => {
      expect(result.current.communityUpdates).not.toBeNull();
    });

    // The team-190-updates fixture is appended at the end as an EI entry on
    // top of any existing entries from the bulk community-updates fixture.
    const eiEntries = result.current.communityUpdates.filter(
      (t) => t.teamNumber === 190
    );
    expect(eiEntries.length).toBeGreaterThanOrEqual(1);
    const ei = eiEntries[eiEntries.length - 1];
    expect(ei.updates).toBeDefined();
  });
});
