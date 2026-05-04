// Tests for useRankingsAlliances — FRC paths only.
//
// Covers the FRC happy path + empty + error branches of getRanks() and
// getAlliances(), plus getDistrictRanks(). Skips Cheesy Arena, FTC offline,
// and TBA offseason branches.
import { useEffect, useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { renderHookWithProviders } from "../test/renderHook";
import { createTestHttpClient } from "../test/httpClient";
import { server } from "../test/server";
import {
  EventSelectionProvider,
  useEventSelection,
} from "../contexts/EventSelectionContext";
import { SettingsProvider } from "../contexts/SettingsContext";
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
} = {}) {
  function Seeder({ children }) {
    const ctx = useEventSelection();
    const [seeded, setSeeded] = useState(false);
    useEffect(() => {
      ctx.setSelectedEvent(selectedEvent);
      ctx.setSelectedYear(selectedYear);
      ctx.setFTCMode(ftcMode);
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
});
