// Tests for useTeamData (FRC paths only).
//
// useTeamData is a large domain hook that owns all team-data fetching for
// gatool. State lives in App.jsx and is passed in via deps; this hook owns
// only functions: getTeamList, getEPA, getRobotImages, getRegionalEventDetail,
// fetchTeamRemappings, resetTeamDataState (plus getEPAFTC for FTC mode,
// which we do not exercise here).
//
// We mock useEventSelection so each test can set selectedEvent / selectedYear
// / ftcMode without round-tripping through localforage. MSW serves the FRC
// fixtures; per-test handlers stub statbotics + queryAwards / queryHistory
// (no committed fixtures for those endpoints today).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { server } from "../test/server";
import { createTestHttpClient } from "../test/httpClient";
import { renderHookWithProviders } from "../test/renderHook";

let mockSelection = {
  selectedEvent: null,
  selectedYear: null,
  ftcMode: null,
};

vi.mock("../contexts/EventSelectionContext", () => ({
  useEventSelection: () => mockSelection,
  EventSelectionProvider: ({ children }) => children,
}));

// Imported AFTER the mock so the hook picks up the mocked useEventSelection.
import { useTeamData } from "./useTeamData";

const BASE = "https://api.gatool.org/v3";

function makeDeps(overrides = {}) {
  return {
    teamList: null,
    setTeamList: vi.fn(),
    teamListLoading: "",
    setTeamListLoading: vi.fn(),
    setTeamRemappings: vi.fn(),
    setRobotImages: vi.fn(),
    setEPA: vi.fn(),
    setHaveChampsTeams: vi.fn(),
    setEITeams: vi.fn(),
    setRegionalEventDetail: vi.fn(),
    httpClient: createTestHttpClient(),
    isOnline: true,
    manualOfflineMode: false,
    useFTCOffline: false,
    FTCServerURL: null,
    FTCKey: null,
    cheesyArenaAvailable: false,
    useCheesyArena: false,
    events: [],
    showBlueBanners: false,
    showDistrictChampsStats: false,
    showChampsStatsAtDistrictRegional: false,
    playoffOnly: false,
    champsStyle: false,
    eventnames: {},
    halloffame: [],
    specialAwards: [],
    training: { teams: { teams: [] } },
    requestCommunityUpdatesForTeams: vi.fn(),
    patchSelectedEvent: vi.fn(),
    getEventSignal: () => undefined,
    ...overrides,
  };
}

function setSelection({
  event = null,
  year = "2026",
  ftcMode = null,
} = {}) {
  mockSelection = {
    selectedEvent: event ? { value: event } : null,
    selectedYear: year ? { value: year } : null,
    ftcMode,
  };
}

// Default per-test stubs for the POST endpoints the hook calls during
// getTeamList. Tests can override either of these via server.use(...).
function stubAwardsAndHistoryEmpty() {
  server.use(
    http.post(`${BASE}/:year/queryAwards`, () => HttpResponse.json({})),
    http.post(`${BASE}/:year/queryHistory`, () => HttpResponse.json({}))
  );
}

beforeEach(() => {
  setSelection();
});

describe("useTeamData (FRC) — getTeamList", () => {
  it("fetches the FRC event team list and stores it via setTeamList", async () => {
    setSelection({
      event: {
        code: "MAWOR",
        name: "WPI District Event",
        type: "Regional",
        champLevel: "",
      },
    });
    stubAwardsAndHistoryEmpty();

    const deps = makeDeps();
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    await result.current.getTeamList();

    await waitFor(() => expect(deps.setTeamList).toHaveBeenCalled());

    // Loading state cycles: set to event name on entry, cleared on exit.
    expect(deps.setTeamListLoading).toHaveBeenCalledWith("WPI District Event");
    expect(deps.setTeamListLoading).toHaveBeenLastCalledWith("");

    const teams = deps.setTeamList.mock.calls[0][0];
    expect(teams.teams).toHaveLength(39);
    // Sponsor parsing should have populated derived fields on each team.
    const team97 = teams.teams.find((t) => t.teamNumber === 97);
    expect(team97).toBeDefined();
    expect(team97.organization).toBeDefined();
    expect(team97.topSponsor).toBeDefined();
    // Non-champs path still attaches a default blueBanners shape.
    expect(team97.blueBanners).toMatchObject({
      teamNumber: 97,
      blueBanners: 0,
    });
  });

  it("looks up a single team via the OFFLINE / ad-hoc path", async () => {
    setSelection({
      event: {
        code: "OFFLINE",
        name: "Offline Practice",
        type: "Regional",
        champLevel: "",
      },
    });
    stubAwardsAndHistoryEmpty();

    const deps = makeDeps();
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    await result.current.getTeamList([190]);

    await waitFor(() => expect(deps.setTeamList).toHaveBeenCalled());
    expect(deps.requestCommunityUpdatesForTeams).toHaveBeenCalledTimes(1);

    const teams = deps.setTeamList.mock.calls[0][0];
    expect(teams.teams).toHaveLength(1);
    expect(teams.teams[0]).toMatchObject({
      teamNumber: 190,
      nameShort: "Gompei and the HERD",
      city: "Worcester",
    });
  });

  it("merges queryAwards results onto the team list", async () => {
    setSelection({
      event: {
        code: "MAWOR",
        name: "WPI District Event",
        type: "Regional",
        champLevel: "",
      },
    });

    // Stub queryAwards with a payload for team 97; queryHistory empty.
    server.use(
      http.post(`${BASE}/:year/queryAwards`, async ({ request }) => {
        const body = await request.json();
        expect(body.teams).toEqual(expect.arrayContaining([97]));
        return HttpResponse.json({
          97: {
            2025: {
              awards: [
                {
                  name: "Regional Winners",
                  eventCode: "MAWOR",
                  awardId: 1,
                },
              ],
            },
          },
        });
      }),
      http.post(`${BASE}/:year/queryHistory`, () => HttpResponse.json({}))
    );

    const deps = makeDeps({
      eventnames: { 2025: { MAWOR: "WPI 2025" } },
    });
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    await result.current.getTeamList();
    await waitFor(() => expect(deps.setTeamList).toHaveBeenCalled());

    const teams = deps.setTeamList.mock.calls[0][0];
    const team97 = teams.teams.find((t) => t.teamNumber === 97);
    expect(team97.awards["2025"].awards).toHaveLength(1);
    const merged = team97.awards["2025"].awards[0];
    // Awards formatting decorates each award with year + eventName + highlight.
    expect(merged).toMatchObject({
      name: "Regional Winners",
      eventCode: "MAWOR",
      year: "2025",
      eventName: "WPI 2025",
      highlight: true,
    });
  });

  it("degrades gracefully when the FRC teams endpoint returns 503", async () => {
    setSelection({
      event: {
        code: "MAWOR",
        name: "WPI District Event",
        type: "Regional",
        champLevel: "",
      },
    });
    server.use(
      http.get(`${BASE}/:year/teams`, () => new HttpResponse(null, { status: 503 })),
      http.post(`${BASE}/:year/queryAwards`, () => HttpResponse.json({})),
      http.post(`${BASE}/:year/queryHistory`, () => HttpResponse.json({}))
    );

    const deps = makeDeps();
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    await result.current.getTeamList();

    await waitFor(() =>
      expect(deps.setTeamListLoading).toHaveBeenLastCalledWith("")
    );
    // Hook still publishes a (degenerate) teamList so consumers can react.
    expect(deps.setTeamList).toHaveBeenCalled();
    const teams = deps.setTeamList.mock.calls[0][0];
    expect(teams.teams).toEqual([]);
    expect(teams.teamCountTotal).toBe(0);
  });
});

describe("useTeamData (FRC) — getEPA (Statbotics enrichment)", () => {
  it("fans out queryStatbotics and stores the per-team EPA list", async () => {
    setSelection({
      event: {
        code: "MAWOR",
        name: "WPI District Event",
        type: "Regional",
        champLevel: "",
      },
    });

    server.use(
      http.post(`${BASE}/:year/queryStatbotics`, async ({ request }) => {
        const body = await request.json();
        expect(body.teams).toEqual([190, 1786]);
        return HttpResponse.json({
          190: { epa: { total_points: { mean: 42.5, sd: 3 } } },
          1786: { epa: { total_points: { mean: 51.2, sd: 4 } } },
        });
      })
    );

    const deps = makeDeps({
      teamList: {
        teams: [{ teamNumber: 190 }, { teamNumber: 1786 }],
      },
    });
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    await result.current.getEPA();

    await waitFor(() => expect(deps.setEPA).toHaveBeenCalled());
    const epaList = deps.setEPA.mock.calls[0][0];
    expect(epaList).toEqual([
      {
        teamNumber: 190,
        epa: { epa: { total_points: { mean: 42.5, sd: 3 } } },
      },
      {
        teamNumber: 1786,
        epa: { epa: { total_points: { mean: 51.2, sd: 4 } } },
      },
    ]);
  });

  it("swallows 500s from queryStatbotics without calling setEPA", async () => {
    setSelection({
      event: {
        code: "MAWOR",
        name: "WPI District Event",
        type: "Regional",
        champLevel: "",
      },
    });
    server.use(
      http.post(`${BASE}/:year/queryStatbotics`, () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    const deps = makeDeps({
      teamList: { teams: [{ teamNumber: 190 }] },
    });
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    await result.current.getEPA();
    expect(deps.setEPA).not.toHaveBeenCalled();
  });
});

describe("useTeamData — resetTeamDataState", () => {
  it("clears every team-related setter back to its empty value", () => {
    setSelection({
      event: {
        code: "MAWOR",
        name: "WPI District Event",
        type: "Regional",
        champLevel: "",
      },
    });
    const deps = makeDeps();
    const { result } = renderHookWithProviders(() => useTeamData(deps));

    result.current.resetTeamDataState();

    expect(deps.setTeamList).toHaveBeenCalledWith(null);
    expect(deps.setTeamListLoading).toHaveBeenCalledWith("");
    expect(deps.setTeamRemappings).toHaveBeenCalledWith(null);
    expect(deps.setRobotImages).toHaveBeenCalledWith(null);
    expect(deps.setEPA).toHaveBeenCalledWith(null);
    expect(deps.setHaveChampsTeams).toHaveBeenCalledWith(false);
    expect(deps.setEITeams).toHaveBeenCalledWith([]);
    expect(deps.setRegionalEventDetail).toHaveBeenCalledWith(null);
  });
});
