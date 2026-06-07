// Tests for useRankingsAlliances — FRC paths only.
//
// Covers the FRC happy path + empty + error branches of getRanks() and
// getAlliances(), plus getDistrictRanks(). Skips Cheesy Arena, FTC offline,
// and TBA offseason branches.
import { useEffect, useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

// Prevent usePersistentState from loading stale event state from previous
// tests via localforage and overwriting Seeder-injected context values.
vi.mock("localforage", () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn().mockResolvedValue(null),
    clear: vi.fn().mockResolvedValue(null),
  },
}));

import { renderHookWithProviders } from "../test/renderHook";
import { createTestHttpClient } from "../test/httpClient";
import { server } from "../test/server";
import {
  EventSelectionProvider,
  useEventSelection,
} from "../contexts/EventSelectionContext";
import { SettingsProvider, useSettings } from "../contexts/SettingsContext";
import { useRankingsAlliances } from "./useRankingsAlliances";

const BASE = "https://api.gatool.org/v3";

// Test event/year — matches the 2026-MAWOR-* fixtures.
const MAWOR_EVENT = {
  value: {
    code: "MAWOR",
    name: "WPI District Event",
    type: "DistrictEvent",
    districtCode: "NE",
  },
  label: "WPI District Event",
};

const YEAR_2026 = { value: "2026", label: "2026" };

// Build a wrapper that mounts both contexts the hook reads from and seeds
// EventSelectionContext with the supplied event/year/ftcMode. Returns null
// until seeding has run so the hook never sees null context values.
function makeWrapper({
  selectedEvent = MAWOR_EVENT,
  selectedYear = YEAR_2026,
  ftcMode = null,
  allianceCount: allianceCountSeed = undefined,
} = {}) {
  function Seeder({ children }) {
    const ctx = useEventSelection();
    const { setAllianceCount } = useSettings();
    const [seeded, setSeeded] = useState(false);
    useEffect(() => {
      ctx.setSelectedEvent(selectedEvent);
      ctx.setSelectedYear(selectedYear);
      ctx.setFTCMode(ftcMode);
      if (allianceCountSeed !== undefined) setAllianceCount(allianceCountSeed);
      setSeeded(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (!seeded) return null;
    return children;
  }
  return function Wrapper({ children }) {
    return (
      <EventSelectionProvider>
        <SettingsProvider>
          <Seeder>{children}</Seeder>
        </SettingsProvider>
      </EventSelectionProvider>
    );
  };
}

function buildDeps(overrides = {}) {
  return {
    httpClient: createTestHttpClient(),
    teamList: { teams: [] },
    qualSchedule: { schedule: [] },
    useCheesyArena: false,
    cheesyArenaAvailable: false,
    useFTCOffline: false,
    FTCOfflineAvailable: false,
    FTCServerURL: "",
    FTCKey: { key: "" },
    remapNumberToString: (n) => `${n}`,
    playoffReserveEditsRef: { current: {} },
    setPlayoffReserveEdits: vi.fn(),
    training: { ranks: { partial: { rankings: [] }, final: { rankings: [] } }, alliances: {} },
    getEPA: vi.fn(),
    getEPAFTC: vi.fn(),
    getRegionalEventDetail: vi.fn(),
    getTeamList: vi.fn(),
    setHaveChampsTeams: vi.fn(),
    haveChampsTeams: false,
    rankings: null,
    setRankings: vi.fn(),
    alliances: null,
    setAlliances: vi.fn(),
    districtRankings: null,
    setDistrictRankings: vi.fn(),
    playoffs: false,
    setPlayoffs: vi.fn(),
    getEventSignal: () => undefined,
    ...overrides,
  };
}

async function renderRA(overrides = {}, wrapperOpts = {}) {
  const deps = buildDeps(overrides);
  const wrapper = makeWrapper(wrapperOpts);
  const utils = renderHookWithProviders(() => useRankingsAlliances(deps), {
    wrapper,
  });
  // Wait for seeder to mount the hook.
  await waitFor(() => expect(utils.result.current).toBeDefined());
  return { ...utils, deps };
}

describe("useRankingsAlliances (FRC)", () => {
  beforeEach(() => {
    // Silence noisy hook logs.
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("getRanks: happy path normalizes payload and commits via setRankings", async () => {
    // Hook's getRanks() chains to getDistrictRanks() when the event has a
    // districtCode and ranks are non-empty. Stub it so MSW doesn't warn.
    server.use(
      http.get(`${BASE}/:year/district/rankings/:district`, () =>
        HttpResponse.json({ districtRanks: [] })
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getRanks();

    await waitFor(() => expect(deps.setRankings).toHaveBeenCalledTimes(1));
    const committed = deps.setRankings.mock.calls[0][0];
    expect(Array.isArray(committed.ranks)).toBe(true);
    expect(committed.ranks.length).toBeGreaterThan(0);
    expect(committed.ranks[0]).toMatchObject({ rank: 1, teamNumber: 3467 });
    expect(committed.lastUpdate).toEqual(expect.any(String));
    // Non-empty ranks → EPA fetched, district fetched (event has districtCode),
    // and getRegionalEventDetail NOT called (because districtCode is set).
    expect(deps.getEPA).toHaveBeenCalledTimes(1);
    expect(deps.getEPAFTC).not.toHaveBeenCalled();
    expect(deps.getRegionalEventDetail).not.toHaveBeenCalled();
  });

  it("getRanks: regional event (no districtCode) triggers getRegionalEventDetail", async () => {
    const event = {
      value: { code: "MAWOR", name: "Regional", type: "Regional" },
      label: "Regional",
    };
    const { result, deps } = await renderRA({}, { selectedEvent: event });

    await result.current.getRanks();

    await waitFor(() => expect(deps.setRankings).toHaveBeenCalled());
    expect(deps.getRegionalEventDetail).toHaveBeenCalledTimes(1);
    const passedRanks = deps.getRegionalEventDetail.mock.calls[0][0];
    expect(Array.isArray(passedRanks)).toBe(true);
    expect(passedRanks.length).toBeGreaterThan(0);
  });

  it("getRanks: empty rankings (early in event) commits empty array and skips EPA/district", async () => {
    server.use(
      http.get(`${BASE}/:year/rankings/:event`, () =>
        HttpResponse.json({ rankings: { rankings: [] } })
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getRanks();

    await waitFor(() => expect(deps.setRankings).toHaveBeenCalledTimes(1));
    const committed = deps.setRankings.mock.calls[0][0];
    expect(committed.ranks).toEqual([]);
    expect(deps.getEPA).not.toHaveBeenCalled();
    expect(deps.getRegionalEventDetail).not.toHaveBeenCalled();
  });

  it("getRanks: 503 from API still commits an empty rankings shape (no throw)", async () => {
    server.use(
      http.get(`${BASE}/:year/rankings/:event`, () =>
        new HttpResponse(null, { status: 503 })
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getRanks();

    await waitFor(() => expect(deps.setRankings).toHaveBeenCalledTimes(1));
    const committed = deps.setRankings.mock.calls[0][0];
    expect(committed.ranks).toEqual([]);
    expect(deps.getEPA).not.toHaveBeenCalled();
  });

  it("getAlliances: happy path normalizes payload, builds Lookup, sets playoffs", async () => {
    const { result, deps } = await renderRA();

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalledTimes(1));
    const committed = deps.setAlliances.mock.calls[0][0];
    expect(Array.isArray(committed.alliances)).toBe(true);
    expect(committed.alliances.length).toBeGreaterThan(0);
    // FRC payload uses "alliances" (lowercased from "Alliances" if present).
    expect(committed.alliances[0]).toMatchObject({ number: 1, captain: 3467 });
    // Lookup keyed by team number → role/alliance.
    expect(committed.Lookup).toBeDefined();
    expect(committed.Lookup["3467"]).toMatchObject({
      role: "Captain",
      alliance: "Alliance 1",
      number: 1,
    });
    expect(committed.Lookup["1768"]).toMatchObject({
      role: "Round 1 Selection",
      number: 1,
    });
    expect(deps.setPlayoffs).toHaveBeenCalledWith(true);
  });

  it("getAlliances: empty/no-alliances yet does not flip playoffs", async () => {
    server.use(
      http.get(`${BASE}/:year/alliances/:event`, () =>
        HttpResponse.json({ alliances: [] })
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalledTimes(1));
    const committed = deps.setAlliances.mock.calls[0][0];
    expect(committed.alliances).toEqual([]);
    expect(deps.setPlayoffs).not.toHaveBeenCalled();
  });

  it("getAlliances: 500 from API commits an empty alliance list (no throw)", async () => {
    server.use(
      http.get(`${BASE}/:year/alliances/:event`, () =>
        new HttpResponse(null, { status: 500 })
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalledTimes(1));
    const committed = deps.setAlliances.mock.calls[0][0];
    expect(committed.alliances).toEqual([]);
    expect(deps.setPlayoffs).not.toHaveBeenCalled();
  });

  it("getRanks: uses TBA endpoint for OffSeason events", async () => {
    const tbaRankings = {
      rankings: {
        rankings: [
          { teamNumber: 1277, rank: 1, wins: 8, losses: 2, ties: 0 },
          { teamNumber: 126, rank: 2, wins: 7, losses: 3, ties: 0 },
        ],
      },
    };
    server.use(
      http.get(`${BASE}/2026/offseason/rankings/2026bcwpi/`, () =>
        HttpResponse.json(tbaRankings)
      )
    );
    const { result, deps } = await renderRA(
      {},
      {
        selectedEvent: {
          value: { code: "BCWPI", name: "BattleCry", type: "OffSeason", tbaEventKey: "2026bcwpi" },
          label: "BattleCry",
        },
      }
    );

    await result.current.getRanks();

    await waitFor(() => expect(deps.setRankings).toHaveBeenCalled());
    const committed = deps.setRankings.mock.calls.at(-1)[0];
    expect(committed.ranks).toHaveLength(2);
    expect(committed.ranks[0].teamNumber).toBe(1277);
  });

  it("getRanks: uses TBA endpoint for OffSeasonWithAzureSync events", async () => {
    const tbaRankings = {
      rankings: {
        rankings: [{ teamNumber: 190, rank: 1, wins: 9, losses: 1, ties: 0 }],
      },
    };
    server.use(
      http.get(`${BASE}/2026/offseason/rankings/2026bcwpi/`, () =>
        HttpResponse.json(tbaRankings)
      )
    );
    const { result, deps } = await renderRA(
      {},
      {
        selectedEvent: {
          value: { code: "BCWPI", name: "BattleCry", type: "OffSeasonWithAzureSync", tbaEventKey: "2026bcwpi" },
          label: "BattleCry",
        },
      }
    );

    await result.current.getRanks();

    await waitFor(() => expect(deps.setRankings).toHaveBeenCalled());
    const committed = deps.setRankings.mock.calls.at(-1)[0];
    expect(committed.ranks).toHaveLength(1);
    expect(committed.ranks[0].teamNumber).toBe(190);
  });

  it("getAlliances: uses TBA endpoint for OffSeason events", async () => {
    const tbaAlliances = {
      alliances: [
        { number: 1, name: "Alliance 1", captain: 1277, round1: 126, round2: 5494 },
        { number: 2, name: "Alliance 2", captain: 190, round1: 3467, round2: 8085 },
      ],
      count: 2,
    };
    server.use(
      http.get(`${BASE}/2026/offseason/alliances/2026bcwpi/`, () =>
        HttpResponse.json(tbaAlliances)
      )
    );
    const { result, deps } = await renderRA(
      {},
      {
        selectedEvent: {
          value: { code: "BCWPI", name: "BattleCry", type: "OffSeason", tbaEventKey: "2026bcwpi" },
          label: "BattleCry",
        },
      }
    );

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalled());
    const committed = deps.setAlliances.mock.calls.at(-1)[0];
    expect(committed.alliances).toHaveLength(2);
    expect(committed.alliances[0].captain).toBe(1277);
    expect(deps.setPlayoffs).toHaveBeenCalledWith(true);
  });

  it("getAlliances: uses TBA endpoint for OffSeasonWithAzureSync events", async () => {
    const tbaAlliances = {
      alliances: [
        { number: 1, name: "Alliance 1", captain: 190, round1: 1277, round2: 126 },
      ],
      count: 1,
    };
    server.use(
      http.get(`${BASE}/2026/offseason/alliances/2026bcwpi/`, () =>
        HttpResponse.json(tbaAlliances)
      )
    );
    const { result, deps } = await renderRA(
      {},
      {
        selectedEvent: {
          value: { code: "BCWPI", name: "BattleCry", type: "OffSeasonWithAzureSync", tbaEventKey: "2026bcwpi" },
          label: "BattleCry",
        },
      }
    );

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalled());
    const committed = deps.setAlliances.mock.calls.at(-1)[0];
    expect(committed.alliances).toHaveLength(1);
    expect(committed.alliances[0].captain).toBe(190);
    expect(deps.setPlayoffs).toHaveBeenCalledWith(true);
  });

  it("getAlliances: falls back to TBA when FRC returns fewer alliances than expected count", async () => {
    // FRC returns only 1 alliance but the event expects 4 → fall back to TBA.
    const frcIncompleteAlliances = {
      Alliances: [
        { number: 1, name: "Alliance 1", captain: 190, round1: 1277, round2: 126 },
      ],
      count: 1,
    };
    const tbaAlliances = {
      alliances: [
        { number: 1, name: "Alliance 1", captain: 190, round1: 1277, round2: 126 },
        { number: 2, name: "Alliance 2", captain: 3467, round1: 1768, round2: 5494 },
        { number: 3, name: "Alliance 3", captain: 8085, round1: 2523, round2: 6328 },
        { number: 4, name: "Alliance 4", captain: 4048, round1: 1519, round2: 2168 },
      ],
      count: 4,
    };
    server.use(
      http.get(`${BASE}/2026/alliances/BCWPI`, () =>
        HttpResponse.json(frcIncompleteAlliances)
      ),
      http.get(`${BASE}/2026/offseason/alliances/2026bcwpi/`, () =>
        HttpResponse.json(tbaAlliances)
      )
    );
    const { result, deps } = await renderRA(
      {},
      {
        selectedEvent: {
          value: { code: "BCWPI", name: "BattleCry", type: "OffSeasonWithAzureSync", tbaEventKey: "2026bcwpi" },
          label: "BattleCry",
        },
        allianceCount: { count: 4 },
      }
    );

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalled());
    const committed = deps.setAlliances.mock.calls.at(-1)[0];
    // Should have 4 alliances from TBA, not 1 from FRC.
    expect(committed.alliances).toHaveLength(4);
    expect(committed.alliances[0].captain).toBe(190);
    expect(committed.alliances[1].captain).toBe(3467);
    expect(committed.dataSource).toBe("TBA");
    expect(deps.setPlayoffs).toHaveBeenCalledWith(true);
  });

  it("getAlliances: uses FRC data when alliance count matches expected count", async () => {
    // FRC returns 4 alliances and event expects 4 → use FRC, do NOT call TBA.
    const frcAlliances = {
      Alliances: [
        { number: 1, name: "Alliance 1", captain: 190, round1: 1277, round2: 126 },
        { number: 2, name: "Alliance 2", captain: 3467, round1: 1768, round2: 5494 },
        { number: 3, name: "Alliance 3", captain: 8085, round1: 2523, round2: 6328 },
        { number: 4, name: "Alliance 4", captain: 4048, round1: 1519, round2: 2168 },
      ],
      count: 4,
    };
    const tbaSpy = vi.fn(() => HttpResponse.json({ alliances: [], count: 0 }));
    server.use(
      http.get(`${BASE}/2026/alliances/BCWPI`, () =>
        HttpResponse.json(frcAlliances)
      ),
      http.get(`${BASE}/2026/offseason/alliances/2026bcwpi/`, tbaSpy)
    );
    const { result, deps } = await renderRA(
      {},
      {
        selectedEvent: {
          value: { code: "BCWPI", name: "BattleCry", type: "OffSeasonWithAzureSync", tbaEventKey: "2026bcwpi" },
          label: "BattleCry",
        },
        allianceCount: { count: 4 },
      }
    );

    await result.current.getAlliances();

    await waitFor(() => expect(deps.setAlliances).toHaveBeenCalled());
    const committed = deps.setAlliances.mock.calls.at(-1)[0];
    // Should use FRC data (4 alliances), TBA should NOT be called.
    expect(committed.alliances).toHaveLength(4);
    expect(committed.dataSource).toBe("FRC");
    expect(tbaSpy).not.toHaveBeenCalled();
  });

  it("getDistrictRanks: fetches and commits district rankings with lastUpdate", async () => {
    const districtPayload = {
      districtRanks: [
        { teamNumber: 190, rank: 1, totalPoints: 120 },
        { teamNumber: 3467, rank: 2, totalPoints: 110 },
      ],
    };
    server.use(
      http.get(
        `${BASE}/:year/district/rankings/:district`,
        ({ params }) => {
          expect(params.year).toBe("2026");
          expect(params.district).toBe("NE");
          return HttpResponse.json(districtPayload);
        }
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getDistrictRanks();

    await waitFor(() =>
      expect(deps.setDistrictRankings).toHaveBeenCalledTimes(1)
    );
    const committed = deps.setDistrictRankings.mock.calls[0][0];
    expect(committed.districtRanks).toEqual(districtPayload.districtRanks);
    expect(committed.lastUpdate).toEqual(expect.any(String));
  });

  it("getDistrictRanks: does not commit rankings on non-200 response", async () => {
    server.use(
      http.get(
        `${BASE}/:year/district/rankings/:district`,
        () => new HttpResponse(null, { status: 404 })
      )
    );
    const { result, deps } = await renderRA();

    await result.current.getDistrictRanks();

    // Allow any pending microtasks to flush.
    await new Promise((r) => setTimeout(r, 0));
    expect(deps.setDistrictRankings).not.toHaveBeenCalled();
  });
});

describe("useRankingsAlliances – resetRankingsAlliancesState", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("clears rankings, allianceCount, rankingsOverride, alliances, playoffs, and districtRankings when preserveOfflineData is false", async () => {
    const { result, deps } = await renderRA();

    await result.current.resetRankingsAlliancesState(false);

    await new Promise((r) => setTimeout(r, 0));
    expect(deps.setRankings).toHaveBeenCalledWith(null);
    expect(deps.setAlliances).toHaveBeenCalledWith(null);
    expect(deps.setDistrictRankings).toHaveBeenCalledWith(null);
    expect(deps.setPlayoffs).toHaveBeenCalledWith(false);
  });

  it("preserves rankings and alliances (does not clear them) when preserveOfflineData is true", async () => {
    const { result, deps } = await renderRA();

    await result.current.resetRankingsAlliancesState(true);

    await new Promise((r) => setTimeout(r, 0));
    expect(deps.setRankings).not.toHaveBeenCalled();
    expect(deps.setAlliances).not.toHaveBeenCalled();
    // playoffs and districtRankings are always reset
    expect(deps.setPlayoffs).toHaveBeenCalledWith(false);
    expect(deps.setDistrictRankings).toHaveBeenCalledWith(null);
  });

  it("always resets playoffs to false regardless of preserveOfflineData", async () => {
    const { result: r1 } = await renderRA();
    const { result: r2, deps: deps2 } = await renderRA();

    await r1.current.resetRankingsAlliancesState(false);
    await r2.current.resetRankingsAlliancesState(true);

    await new Promise((r) => setTimeout(r, 0));
    expect(deps2.setPlayoffs).toHaveBeenCalledWith(false);
  });
});
