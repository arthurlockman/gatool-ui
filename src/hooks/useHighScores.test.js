// Tests for useHighScores. FRC mode only — the FTC region/league code paths
// are out of scope. We mock useEventSelection so each test can drive
// selectedYear / selectedEvent / ftcMode without touching localforage.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
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

import { useHighScores } from "./useHighScores";

const BASE = "https://api.gatool.org/v3";

function setEventSelection({ year = "2026", event = null, ftcMode = false } = {}) {
  mockEventSelection = {
    selectedYear: year ? { value: year, label: year } : null,
    selectedEvent: event ? { value: event, label: event.code || "" } : null,
    ftcMode,
    setSelectedYear: vi.fn(),
    setSelectedEvent: vi.fn(),
    setFTCMode: vi.fn(),
  };
}

describe("useHighScores (FRC)", () => {
  beforeEach(async () => {
    setEventSelection({ year: "2026" });
    // usePersistentState (used internally by the hook for worldStats /
    // eventHighScores) hydrates from localforage on mount, which would
    // overwrite values set during a test with whatever a previous test left
    // behind. Clear it before each test for isolation.
    await localforage.clear();
  });

  it("starts with all high-score state set to null", () => {
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    expect(result.current.worldStats).toBeNull();
    expect(result.current.eventHighScores).toBeNull();
    expect(result.current.ftcRegionHighScores).toBeNull();
    expect(result.current.ftcLeagueHighScores).toBeNull();
    expect(result.current.frcDistrictHighScores).toBeNull();
  });

  it("getWorldStats populates worldStats from the FRC global high-scores fixture", async () => {
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getWorldStats();
    });

    await waitFor(() => expect(result.current.worldStats).not.toBeNull());
    const ws = result.current.worldStats;
    expect(ws.year).toBe("2026");
    expect(typeof ws.lastUpdate).toBe("string");
    expect(ws.highscores).toBeDefined();

    // The FRC global path keeps yearType verbatim as the key (only the
    // literal substring "FTC" would be stripped, which doesn't apply here).
    const fixture = loadFixture("2026-highscores");
    const expectedKeys = new Set(
      fixture.filter((s) => s?.matchData?.match).map((s) => String(s.yearType))
    );
    for (const key of expectedKeys) {
      expect(ws.highscores).toHaveProperty(key);
    }

    // Spot-check the 2026TBAPenaltyFreeplayoff record matches fixture details.
    const tba = ws.highscores["2026TBAPenaltyFreeplayoff"];
    expect(tba).toBeDefined();
    expect(tba.alliance).toBe("Red");
    expect(tba.matchName).toBe("Final 1");
    expect(tba.score).toBe(964);
    expect(tba.allianceMembers).toBe("4065 4414 1323");
  });

  it("getWorldStats sets worldStats to null on a 404 response", async () => {
    server.use(
      http.get(`${BASE}/:year/highscores`, () =>
        new HttpResponse(null, { status: 404 })
      )
    );
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getWorldStats();
    });

    expect(result.current.worldStats).toBeNull();
  });

  it("getWorldStats sets worldStats to null on a 500 response", async () => {
    server.use(
      http.get(`${BASE}/:year/highscores`, () =>
        new HttpResponse(null, { status: 500 })
      )
    );
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getWorldStats();
    });

    expect(result.current.worldStats).toBeNull();
  });

  it("getWorldStats handles an empty array response (no highscores)", async () => {
    server.use(
      http.get(`${BASE}/:year/highscores`, () => HttpResponse.json([]))
    );
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getWorldStats();
    });

    await waitFor(() => expect(result.current.worldStats).not.toBeNull());
    expect(result.current.worldStats.year).toBe("2026");
    expect(result.current.worldStats.highscores).toEqual({});
  });

  it("getWorldStats can fetch a prior season (2025) when year changes", async () => {
    setEventSelection({ year: "2025" });
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getWorldStats();
    });

    await waitFor(() => expect(result.current.worldStats).not.toBeNull());
    expect(result.current.worldStats.year).toBe("2025");
    // Sanity: at least one normalized score key exists.
    expect(Object.keys(result.current.worldStats.highscores).length).toBeGreaterThan(0);
  });

  it("getFrcDistrictHighScores populates frcDistrictHighScores from the district endpoint", async () => {
    setEventSelection({
      year: "2026",
      event: { code: "MAWOR", districtCode: "NE" },
    });
    server.use(
      http.get(`${BASE}/:year/highscores/district/:district`, ({ params }) => {
        expect(params.year).toBe("2026");
        expect(params.district).toBe("NE");
        return HttpResponse.json([
          {
            level: "qual",
            yearType: "FRC:district:NE2026TBAPenaltyFreequal",
            matchData: {
              event: { districtCode: "NE", eventCode: "MAWOR", type: "qual" },
              highScoreAlliance: "blue",
              match: {
                description: "Qualification 7",
                scoreRedFinal: 100,
                scoreRedFoul: 0,
                scoreBlueFinal: 250,
                scoreBlueFoul: 0,
                teams: [
                  { teamNumber: 111, station: "Red1" },
                  { teamNumber: 222, station: "Red2" },
                  { teamNumber: 333, station: "Red3" },
                  { teamNumber: 444, station: "Blue1" },
                  { teamNumber: 555, station: "Blue2" },
                  { teamNumber: 666, station: "Blue3" },
                ],
              },
            },
          },
        ]);
      })
    );
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getFrcDistrictHighScores();
    });

    await waitFor(() =>
      expect(result.current.frcDistrictHighScores).not.toBeNull()
    );
    const dh = result.current.frcDistrictHighScores;
    expect(dh.year).toBe("2026");
    // SCORE_TYPE_SUFFIXES strips the "FRC:district:NE2026" prefix and keeps "TBAPenaltyFreequal".
    expect(dh.highscores).toHaveProperty("TBAPenaltyFreequal");
    const rec = dh.highscores["TBAPenaltyFreequal"];
    expect(rec.alliance).toBe("Blue");
    expect(rec.score).toBe(250);
    expect(rec.allianceMembers).toBe("444 555 666");
    expect(rec.matchName).toBe("Qualification 7");
  });

  it("getFrcDistrictHighScores no-ops when the selected event has no districtCode", async () => {
    setEventSelection({
      year: "2026",
      event: { code: "MAWOR", districtCode: null },
    });
    let called = false;
    server.use(
      http.get(`${BASE}/:year/highscores/district/:district`, () => {
        called = true;
        return HttpResponse.json([]);
      })
    );
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getFrcDistrictHighScores();
    });

    expect(called).toBe(false);
    expect(result.current.frcDistrictHighScores).toBeNull();
  });

  it("recalculates eventHighScores from local schedules via the schedule-change effect", async () => {
    setEventSelection({
      year: "2026",
      event: { code: "MAWOR", districtCode: null },
    });
    const httpClient = createTestHttpClient();
    const qualSchedule = {
      lastUpdate: "2026-04-04T11:00:00",
      schedule: [
        {
          description: "Qualification 1",
          matchNumber: 1,
          tournamentLevel: "Qualification",
          scoreRedFinal: 120,
          scoreRedFoul: 0,
          scoreRedAuto: 30,
          scoreBlueFinal: 200,
          scoreBlueFoul: 10,
          scoreBlueAuto: 40,
          teams: [
            { teamNumber: 1, station: "Red1" },
            { teamNumber: 2, station: "Red2" },
            { teamNumber: 3, station: "Red3" },
            { teamNumber: 4, station: "Blue1" },
            { teamNumber: 5, station: "Blue2" },
            { teamNumber: 6, station: "Blue3" },
          ],
        },
      ],
    };
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await waitFor(() => expect(result.current.eventHighScores).not.toBeNull());
    const eh = result.current.eventHighScores;
    expect(eh.year).toBe("2026");
    // Overall: Blue had 200 vs Red 120 -> Blue wins overall.
    expect(eh.highscores).toHaveProperty("overallqual");
    expect(eh.highscores.overallqual.alliance).toBe("Blue");
    expect(eh.highscores.overallqual.score).toBe(200);
    expect(eh.highscores.overallqual.allianceMembers).toBe("4 5 6");
    // No penalty-free record should exist (both alliances had penalties? actually
    // red=0, blue=10 -> not penalty-free).
    expect(eh.highscores.penaltyFreequal).toBeUndefined();
    // TBAPenaltyFree: winner (blue) had penalties -> no TBA penalty-free record.
    expect(eh.highscores.TBAPenaltyFreequal).toBeUndefined();
  });

  it("getEventStats sets eventHighScores to null when there is no schedule data", async () => {
    setEventSelection({
      year: "2026",
      event: { code: "MAWOR", districtCode: null },
    });
    const httpClient = createTestHttpClient();
    const { result } = renderHookWithProviders(() =>
      useHighScores({
        httpClient,
        qualSchedule: null,
        playoffSchedule: null,
        useFTCOffline: false,
        isOnline: true,
        manualOfflineMode: false,
      })
    );

    await act(async () => {
      await result.current.getEventStats("2026", "MAWOR");
    });

    expect(result.current.eventHighScores).toBeNull();
  });
});
