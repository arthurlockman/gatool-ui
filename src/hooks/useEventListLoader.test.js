import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse, delay } from "msw";
import localforage from "localforage";
import { useEventListLoader } from "./useEventListLoader";
import { useEventSelection } from "../contexts/EventSelectionContext";
import { renderHookWithProviders } from "../test/renderHook";
import { createTestHttpClient } from "../test/httpClient";
import { server } from "../test/server";
import { loadFixture } from "../test/fixtures";

const BASE = "https://api.gatool.org/v3";

const SUPPORTED_YEARS = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
];

function setupHook(overrides = {}) {
  const httpClient = createTestHttpClient();
  const setters = {
    setEvents: vi.fn(),
    setEventsLoading: vi.fn(),
    setFTCTypes: vi.fn(),
    setEventNamesCY: vi.fn(),
    setDistricts: vi.fn(),
    updateFtcRegions: vi.fn(),
  };
  const deps = {
    httpClient,
    useFTCOffline: false,
    FTCServerURL: "",
    FTCKey: null,
    isOnline: true,
    training: { events: { events: [] } },
    supportedYears: SUPPORTED_YEARS,
    eventsLoading: "",
    eventnames: {},
    regionLookup: {},
    ...setters,
    ...overrides,
  };

  const utils = renderHookWithProviders(() => {
    const sel = useEventSelection();
    const api = useEventListLoader(deps);
    return { sel, ...api };
  });

  return { ...utils, httpClient, setters, deps };
}

async function selectYear(result, year) {
  // Flush the localforage hydration useEffect first so its delayed setValue
  // doesn't clobber our explicit setSelectedYear call.
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    result.current.sel.setSelectedYear({ value: year, label: year });
  });
}

describe("useEventListLoader", () => {
  beforeEach(async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Persistent state from prior tests can race with our setSelectedYear
    // calls (the hydration useEffect resolves *after* our explicit setter
    // and overwrites it). Clear localforage so each test starts clean.
    await localforage.clear();
  });

  it("getEvents merges FIRST and TBA offseason events (happy path)", async () => {
    const firstFixture = loadFixture("2026-events");
    const tbaFixture = loadFixture("2026-offseason-events");
    const { result, setters } = setupHook();

    await selectYear(result, "2026");
    await act(async () => {
      await result.current.getEvents();
    });

    await waitFor(() => expect(setters.setEvents).toHaveBeenCalled());

    const events = setters.setEvents.mock.calls.at(-1)[0];

    // FIRST events all present (count) + at least some TBA-only offseason additions.
    expect(events.length).toBeGreaterThan(firstFixture.events.length);

    // Pick a known offseason TBA-only event (firstEventCode: null) and
    // confirm it shows up as an OffSeason entry tagged with tbaEventKey.
    const tbaOnly = tbaFixture.events.find(
      (e) => !e.firstEventCode && e.code === "2026azdd"
    );
    const merged = events.find((m) => m.value.code === tbaOnly.code);
    expect(merged).toBeDefined();
    expect(merged.value.type).toBe("OffSeason");
    expect(merged.value.tbaEventKey).toBe("azdd");
    expect(merged.filters).toContain("offseason");
  });

  it("getEvents falls back to FIRST-only when TBA returns 500", async () => {
    server.use(
      http.get(`${BASE}/2026/offseason/events/`, () =>
        new HttpResponse(null, { status: 500 })
      )
    );
    const firstFixture = loadFixture("2026-events");
    const { result, setters } = setupHook();

    await selectYear(result, "2026");
    await act(async () => {
      await result.current.getEvents();
    });

    await waitFor(() => expect(setters.setEvents).toHaveBeenCalled());
    const events = setters.setEvents.mock.calls.at(-1)[0];

    // Should exactly equal the FIRST-only event count (training is empty).
    expect(events).toHaveLength(firstFixture.events.length);
    // None of the well-known TBA-only offseason events leaked in.
    expect(events.find((e) => e.value.code === "2026azdd")).toBeUndefined();
  });

  it("getEvents only requests events for the selected year", async () => {
    const captured = [];
    server.use(
      http.get(`${BASE}/:year/events`, ({ params }) => {
        captured.push(params.year);
        return HttpResponse.json({
          events: [
            {
              code: `EV${params.year}`,
              name: `Event ${params.year}`,
              type: "Regional",
              timezone: "Eastern Standard Time",
              dateStart: `${params.year}-03-01T00:00:00`,
              dateEnd: `${params.year}-03-04T23:59:59`,
              weekNumber: 1,
              districtCode: null,
            },
          ],
        });
      }),
      http.get(`${BASE}/:year/offseason/events/`, () =>
        HttpResponse.json({ events: [] })
      )
    );

    const { result, setters } = setupHook();
    await selectYear(result, "2025");
    await act(async () => {
      await result.current.getEvents();
    });

    await waitFor(() => expect(setters.setEvents).toHaveBeenCalled());
    expect(captured).toEqual(["2025"]);
    const events = setters.setEvents.mock.calls.at(-1)[0];
    expect(events).toHaveLength(1);
    expect(events[0].value.code).toBe("EV2025");
  });

  it("dedups TBA event matched by firstEventCode against FIRST event", async () => {
    server.use(
      http.get(`${BASE}/2026/events`, () =>
        HttpResponse.json({
          events: [
            {
              code: "TESTEV",
              name: "Test Regional",
              type: "Regional",
              timezone: "Eastern Standard Time",
              dateStart: "2026-03-01T00:00:00",
              dateEnd: "2026-03-04T23:59:59",
              weekNumber: 1,
              districtCode: null,
            },
          ],
        })
      ),
      http.get(`${BASE}/2026/offseason/events/`, () =>
        HttpResponse.json({
          events: [
            {
              code: "2026testev",
              name: "Different Name",
              firstEventCode: "TESTEV",
              type: "Preseason",
              dateStart: "2026-03-01",
              dateEnd: "2026-03-04",
            },
          ],
        })
      )
    );

    const { result, setters } = setupHook();
    await selectYear(result, "2026");
    await act(async () => {
      await result.current.getEvents();
    });

    await waitFor(() => expect(setters.setEvents).toHaveBeenCalled());
    const events = setters.setEvents.mock.calls.at(-1)[0];
    const matches = events.filter((e) => e.value.code === "TESTEV");

    // No duplicate entry; original FIRST event was tagged with the TBA key.
    expect(matches).toHaveLength(1);
    expect(matches[0].value.tbaEventKey).toBe("testev");
    // And no second entry created from the TBA payload.
    expect(events.find((e) => e.value.code === "2026testev")).toBeUndefined();
  });

  it("stale-response guard drops a slow year-A response after switching to year-B", async () => {
    // Year-A (2026) is slow. Year-B (2025) is fast. We must end up with year-B's events only.
    server.use(
      http.get(`${BASE}/2026/events`, async () => {
        await delay(150);
        return HttpResponse.json({
          events: [
            {
              code: "OLD2026",
              name: "Stale 2026",
              type: "Regional",
              timezone: "Eastern Standard Time",
              dateStart: "2026-03-01T00:00:00",
              dateEnd: "2026-03-04T23:59:59",
              weekNumber: 1,
              districtCode: null,
            },
          ],
        });
      }),
      http.get(`${BASE}/2026/offseason/events/`, async () => {
        await delay(150);
        return HttpResponse.json({ events: [] });
      }),
      http.get(`${BASE}/2025/events`, () =>
        HttpResponse.json({
          events: [
            {
              code: "FRESH2025",
              name: "Fresh 2025",
              type: "Regional",
              timezone: "Eastern Standard Time",
              dateStart: "2025-03-01T00:00:00",
              dateEnd: "2025-03-04T23:59:59",
              weekNumber: 1,
              districtCode: null,
            },
          ],
        })
      ),
      http.get(`${BASE}/2025/offseason/events/`, () =>
        HttpResponse.json({ events: [] })
      )
    );

    const { result, setters } = setupHook();

    await selectYear(result, "2026");
    let stalePromise;
    await act(async () => {
      stalePromise = result.current.getEvents();
    });

    await selectYear(result, "2025");
    await act(async () => {
      await result.current.getEvents();
      await stalePromise;
    });

    // setEvents was only called with the 2025 payload — the stale 2026 response was discarded.
    const allCalls = setters.setEvents.mock.calls.map((c) => c[0]);
    expect(allCalls.length).toBeGreaterThanOrEqual(1);
    for (const events of allCalls) {
      expect(events.find((e) => e.value.code === "OLD2026")).toBeUndefined();
      expect(events.find((e) => e.value.code === "FRESH2025")).toBeDefined();
    }
  });

  it("getDistricts maps the API response into label/value options", async () => {
    server.use(
      http.get(`${BASE}/2026/districts`, () =>
        HttpResponse.json({
          districts: [
            { name: "New England", code: "NE" },
            { name: "Pacific Northwest", code: "PNW" },
          ],
        })
      )
    );

    const { result, setters } = setupHook();
    await selectYear(result, "2026");
    await act(async () => {
      await result.current.getDistricts();
    });

    await waitFor(() => expect(setters.setDistricts).toHaveBeenCalled());
    expect(setters.setDistricts).toHaveBeenCalledWith([
      { label: "New England", value: "NE" },
      { label: "Pacific Northwest", value: "PNW" },
    ]);
  });

  it("getDistricts accepts the legacy capitalized 'Districts' key", async () => {
    server.use(
      http.get(`${BASE}/2026/districts`, () =>
        HttpResponse.json({
          Districts: [{ name: "Israel", code: "ISR" }],
        })
      )
    );

    const { result, setters } = setupHook();
    await selectYear(result, "2026");
    await act(async () => {
      await result.current.getDistricts();
    });

    await waitFor(() => expect(setters.setDistricts).toHaveBeenCalled());
    expect(setters.setDistricts).toHaveBeenCalledWith([
      { label: "Israel", value: "ISR" },
    ]);
  });
});

// (lodash import retained for potential future fixture transforms)
