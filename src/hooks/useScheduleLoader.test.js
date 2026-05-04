// Tests for useScheduleLoader (FRC paths only).
//
// Strategy: mock useEventSelection / useSettings so each test can control
// selectedEvent + selectedYear without driving them through context state
// updates. Everything else (state, setters, refs, downstream functions) is
// passed via the deps argument, matching how App.jsx wires the hook.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { renderHook } from "@testing-library/react";
import { createTestHttpClient } from "../test/httpClient";
import { server } from "../test/server";

// Per-test mutable state for the mocked contexts.
const eventSelectionState = { selectedEvent: null, selectedYear: null, ftcMode: null };
const settingsState = { playoffCountOverride: null, autoAdvance: false, autoUpdate: false };

vi.mock("../contexts/EventSelectionContext", () => ({
  useEventSelection: () => eventSelectionState,
}));
vi.mock("../contexts/SettingsContext", () => ({
  useSettings: () => settingsState,
}));

// Import AFTER mocks are set up so the hook picks up the mocked modules.
const { useScheduleLoader } = await import("./useScheduleLoader");

const BASE = "https://api.gatool.org/v3";

function makeDeps(overrides = {}) {
  return {
    // State reads
    currentMatch: 1,
    qualSchedule: null,
    playoffSchedule: null,
    practiceSchedule: null,
    practiceFileUploaded: false,
    teamList: null,
    cheesyTeamList: [],
    cheesyArenaAvailable: false,
    FTCOfflineAvailable: false,
    FTCServerURL: undefined,
    FTCKey: null,
    useCheesyArena: false,
    useFTCOffline: false,
    teamRemappings: null,
    training: { schedule: { qual: {}, playoff: {} }, scores: { qual: {}, playoff: {} } },
    // Setters
    setQualSchedule: vi.fn(),
    setPlayoffSchedule: vi.fn(),
    setPracticeSchedule: vi.fn(),
    setQualsLength: vi.fn(),
    setCurrentMatch: vi.fn(),
    setPlayoffReserveEdits: vi.fn(),
    setCheesyTeamList: vi.fn(),
    setPracticeFileUploaded: vi.fn(),
    // Refs
    playoffReserveEditsRef: { current: {} },
    // External
    httpClient: createTestHttpClient(),
    getEventStats: vi.fn(),
    getTeamList: vi.fn(),
    getAlliances: vi.fn(),
    getRanks: vi.fn(),
    getEventSignal: () => undefined,
    ...overrides,
  };
}

function setEvent({ code = "MAWOR", name = "MAWOR Test Event", type = "Regional" } = {}) {
  eventSelectionState.selectedEvent = { value: { code, name, type } };
  eventSelectionState.selectedYear = { value: "2026" };
  eventSelectionState.ftcMode = null;
}

beforeEach(() => {
  eventSelectionState.selectedEvent = null;
  eventSelectionState.selectedYear = null;
  eventSelectionState.ftcMode = null;
  settingsState.playoffCountOverride = null;
  settingsState.autoAdvance = false;
  settingsState.autoUpdate = false;
});

describe("useScheduleLoader (FRC)", () => {
  it("returns early without fetching when no event/year is selected", async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);
    expect(deps.setQualSchedule).not.toHaveBeenCalled();
    expect(deps.setPlayoffSchedule).not.toHaveBeenCalled();
    expect(deps.setQualsLength).not.toHaveBeenCalled();
    expect(deps.getRanks).not.toHaveBeenCalled();
  });

  it("loads the practice schedule and stores it via setPracticeSchedule", async () => {
    setEvent();
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);
    await waitFor(() => expect(deps.setPracticeSchedule).toHaveBeenCalled());
    // The first call commits the loaded practice schedule. (Later calls may
    // reset it to null once the qual schedule's first match start time has
    // passed — that's covered in its own test.)
    const firstArg = deps.setPracticeSchedule.mock.calls[0][0];
    expect(firstArg).not.toBeNull();
    expect(
      Array.isArray(firstArg.schedule) || Array.isArray(firstArg.schedule?.schedule)
    ).toBe(true);
  });

  it("loads the qual schedule, merges scores, sets qualsLength, and finalizes", async () => {
    setEvent();
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);

    await waitFor(() => expect(deps.setQualSchedule).toHaveBeenCalled());
    const qual = deps.setQualSchedule.mock.calls.at(-1)[0];
    expect(Array.isArray(qual.schedule)).toBe(true);
    expect(qual.schedule.length).toBeGreaterThan(0);
    expect(qual.completedMatchCount).toBeGreaterThan(0);

    // Match 1 should have scores merged from 2026-MAWOR-scores-qual.json.
    const m1 = qual.schedule.find((m) => m.matchNumber === 1);
    expect(m1).toBeDefined();
    expect(m1.scores).toBeDefined();
    expect(m1.scoreRedFinal).toEqual(expect.any(Number));
    expect(m1.scoreBlueFinal).toEqual(expect.any(Number));
    expect(m1.winner).toBeDefined();

    expect(deps.setQualsLength).toHaveBeenCalledWith(qual.schedule.length);
    await waitFor(() => expect(deps.getRanks).toHaveBeenCalled());
    expect(deps.getEventStats).toHaveBeenCalledWith("2026", "MAWOR");
  });

  it("loads the playoff schedule and merges playoff scores", async () => {
    setEvent();
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);

    await waitFor(() => expect(deps.setPlayoffSchedule).toHaveBeenCalled());
    const playoff = deps.setPlayoffSchedule.mock.calls.at(-1)[0];
    expect(Array.isArray(playoff.schedule)).toBe(true);
    expect(playoff.schedule.length).toBeGreaterThan(0);

    // Find a match that has scores and confirm merge.
    const scored = playoff.schedule.find((m) => m.scores && m.scores.alliances);
    expect(scored).toBeDefined();
    expect(scored.scoreRedFinal).toEqual(expect.any(Number));
    expect(scored.scoreBlueFinal).toEqual(expect.any(Number));
    expect(scored.winner).toBeDefined();

    // getAlliances is called when there are playoff matches.
    await waitFor(() => expect(deps.getAlliances).toHaveBeenCalled());
  });

  it("clears practiceSchedule once qual matches have started", async () => {
    setEvent();
    // Override qual schedule so its first match startTime is in the past.
    server.use(
      http.get(`${BASE}/2026/schedule/hybrid/MAWOR/qual`, () =>
        HttpResponse.json({
          Schedule: {
            schedule: [
              {
                matchNumber: 1,
                description: "Qualification 1",
                tournamentLevel: "Qualification",
                startTime: "2000-01-01T10:00:00",
                actualStartTime: null,
                postResultTime: null,
                teams: [],
              },
            ],
          },
        })
      )
    );
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);

    await waitFor(() => expect(deps.setQualSchedule).toHaveBeenCalled());
    // setPracticeSchedule should have been called with null after qual loaded.
    const calls = deps.setPracticeSchedule.mock.calls.map((c) => c[0]);
    expect(calls).toContain(null);
  });

  it("handles an empty qual schedule without throwing and sets qualsLength to 0", async () => {
    setEvent();
    server.use(
      http.get(`${BASE}/2026/schedule/hybrid/MAWOR/qual`, () =>
        HttpResponse.json({ Schedule: { schedule: [] } })
      ),
      http.get(`${BASE}/2026/schedule/hybrid/MAWOR/practice`, () =>
        HttpResponse.json({ Schedule: { schedule: [] } })
      )
    );
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);

    await waitFor(() => expect(deps.setQualsLength).toHaveBeenCalled());
    expect(deps.setQualsLength).toHaveBeenCalledWith(0);
    // Practice was empty too, so it should not have been set.
    expect(deps.setPracticeSchedule).not.toHaveBeenCalled();
  });

  it("recovers from a 500 on qual scores by treating scores as empty", async () => {
    setEvent();
    server.use(
      http.get(`${BASE}/2026/scores/MAWOR/qual`, () =>
        new HttpResponse(null, { status: 500 })
      )
    );
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);

    await waitFor(() => expect(deps.setQualSchedule).toHaveBeenCalled());
    const qual = deps.setQualSchedule.mock.calls.at(-1)[0];
    expect(Array.isArray(qual.schedule)).toBe(true);
    expect(qual.schedule.length).toBeGreaterThan(0);
    // No scores merged in.
    qual.schedule.forEach((m) => {
      expect(m.scores).toBeUndefined();
    });
  });

  it("recovers from a 503 on the playoff schedule (treated as empty)", async () => {
    setEvent();
    server.use(
      http.get(`${BASE}/2026/schedule/hybrid/MAWOR/playoff`, () =>
        new HttpResponse(null, { status: 503 })
      )
    );
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);

    await waitFor(() => expect(deps.setPlayoffSchedule).toHaveBeenCalled());
    const playoff = deps.setPlayoffSchedule.mock.calls.at(-1)[0];
    expect(playoff.schedule).toEqual([]);
    expect(playoff.completedMatchCount).toBe(0);
    // getAlliances is gated on having playoff matches; it should not be called.
    expect(deps.getAlliances).not.toHaveBeenCalled();
    // getRanks always runs at the end.
    expect(deps.getRanks).toHaveBeenCalled();
  });

  it("epochGuard: discards stale responses and skips committing schedules", async () => {
    setEvent();
    let isCurrentReturn = false;
    const epochGuard = {
      next: () => 1,
      isCurrent: () => isCurrentReturn, // false => stale
    };
    const deps = makeDeps();
    const { result } = renderHook(() => useScheduleLoader(deps, { epochGuard }));
    await result.current.getSchedule(true);
    // Practice did set (early in flow before stale check returns), but quals
    // and playoffs should be skipped.
    expect(deps.setQualSchedule).not.toHaveBeenCalled();
    expect(deps.setPlayoffSchedule).not.toHaveBeenCalled();
    expect(deps.setQualsLength).not.toHaveBeenCalled();
    expect(deps.getRanks).not.toHaveBeenCalled();
  });

  it("auto-advances currentMatch when autoUpdate is enabled and matches have been played", async () => {
    setEvent();
    settingsState.autoUpdate = true;
    const deps = makeDeps({ currentMatch: 1 });
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(false);
    await waitFor(() => expect(deps.setQualSchedule).toHaveBeenCalled());
    // The fixture has played matches, so setCurrentMatch should be called.
    expect(deps.setCurrentMatch).toHaveBeenCalled();
    const v = deps.setCurrentMatch.mock.calls.at(-1)[0];
    expect(v).toBeGreaterThan(1);
  });

  it("does not advance currentMatch when options.updateCurrentMatch is false", async () => {
    setEvent();
    settingsState.autoUpdate = true;
    const deps = makeDeps({ currentMatch: 1 });
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(false, { updateCurrentMatch: false });
    await waitFor(() => expect(deps.setQualSchedule).toHaveBeenCalled());
    expect(deps.setCurrentMatch).not.toHaveBeenCalled();
  });

  it("uses event-scoped abort signal for fetches", async () => {
    setEvent();
    const controller = new AbortController();
    const seenSignals = [];
    server.use(
      http.get(`${BASE}/2026/schedule/hybrid/MAWOR/qual`, ({ request }) => {
        seenSignals.push(request.signal);
        return HttpResponse.json({ Schedule: { schedule: [] } });
      })
    );
    const deps = makeDeps({ getEventSignal: () => controller.signal });
    const { result } = renderHook(() => useScheduleLoader(deps));
    await result.current.getSchedule(true);
    expect(seenSignals.length).toBeGreaterThan(0);
    // The signal observed by MSW should be a real AbortSignal.
    expect(seenSignals[0]).toBeInstanceOf(AbortSignal);
  });
});
