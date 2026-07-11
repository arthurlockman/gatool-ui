import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getConnectionsEventKey,
  allianceRosterToConnectionKey,
  ConnectionsApiError,
  fetchAllianceConnections,
} from "./allianceConnectionsApi";

function jsonResponse(body, { status = 200, contentType = "application/json" } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name === "content-type" ? contentType : null) },
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

describe("getConnectionsEventKey", () => {
  it("returns null when selectedEvent or selectedYear is missing", () => {
    expect(getConnectionsEventKey(null, { value: 2024 })).toBeNull();
    expect(getConnectionsEventKey({ value: { code: "NYTR" } }, null)).toBeNull();
    expect(getConnectionsEventKey({}, {})).toBeNull();
    expect(getConnectionsEventKey(undefined, undefined)).toBeNull();
  });

  it("prefers tbaEventKey when present and lowercases it", () => {
    const result = getConnectionsEventKey(
      { value: { tbaEventKey: "2024NYTR", code: "OTHER" } },
      { value: 2024 }
    );
    expect(result).toBe("2024nytr");
  });

  it("falls back to year+code lowercased when no tbaEventKey", () => {
    const result = getConnectionsEventKey(
      { value: { code: "NYTR" } },
      { value: 2024 }
    );
    expect(result).toBe("2024nytr");
  });

  it("returns null when code contains OFFLINE or PRACTICE", () => {
    expect(
      getConnectionsEventKey(
        { value: { code: "OFFLINE_TEST" } },
        { value: 2024 }
      )
    ).toBeNull();
    expect(
      getConnectionsEventKey(
        { value: { code: "PRACTICE2024" } },
        { value: 2024 }
      )
    ).toBeNull();
  });

  it("returns null when code is missing entirely (no tba, no code)", () => {
    expect(
      getConnectionsEventKey({ value: { code: "" } }, { value: 2024 })
    ).toBeNull();
    expect(
      getConnectionsEventKey({ value: {} }, { value: 2024 })
    ).toBeNull();
  });
});

describe("allianceRosterToConnectionKey", () => {
  it("returns null for null/undefined input", () => {
    expect(allianceRosterToConnectionKey(null)).toBeNull();
    expect(allianceRosterToConnectionKey(undefined)).toBeNull();
  });

  it("returns null when fewer than 2 valid teams are present", () => {
    expect(allianceRosterToConnectionKey({ picks: [254] })).toBeNull();
    expect(allianceRosterToConnectionKey({ captain: 1234 })).toBeNull();
    expect(allianceRosterToConnectionKey({})).toBeNull();
  });

  it("parses a TBA-style picks array of frcXXXX strings", () => {
    const result = allianceRosterToConnectionKey({
      picks: ["frc254", "frc1678", "frc971"],
    });
    expect(result).toBe("254,971,1678");
  });

  it("parses a numeric picks array and sorts ascending", () => {
    const result = allianceRosterToConnectionKey({
      picks: [1678, 254, 971],
    });
    expect(result).toBe("254,971,1678");
  });

  it("parses TBA team_keys array", () => {
    const result = allianceRosterToConnectionKey({
      team_keys: ["frc1678", "frc254", "frc971"],
    });
    expect(result).toBe("254,971,1678");
  });

  it("falls back to captain/round1..3 fields when picks/team_keys are absent", () => {
    const result = allianceRosterToConnectionKey({
      captain: 254,
      round1: "frc1678",
      round2: 971,
    });
    expect(result).toBe("254,971,1678");
  });

  it("supports Cheesy Arena pick1/pick2/pick3/backup fields", () => {
    const result = allianceRosterToConnectionKey({
      captain: 254,
      pick1: 1678,
      pick2: 971,
      pick3: 0,
      backup: 1323,
    });
    expect(result).toBe("254,971,1323,1678");
  });

  it("supports a TeamIds array on the fallback path", () => {
    const result = allianceRosterToConnectionKey({
      TeamIds: [254, 1678, 971],
    });
    expect(result).toBe("254,971,1678");
  });

  it("filters out zeros, negatives, NaN, empty strings, and non-numeric strings", () => {
    const result = allianceRosterToConnectionKey({
      picks: [254, 0, -5, "abc", "frcXYZ", 1678],
    });
    expect(result).toBe("254,1678");
  });

  it("de-duplicates repeated team numbers", () => {
    const result = allianceRosterToConnectionKey({
      picks: [254, 254, 1678, "frc1678"],
    });
    expect(result).toBe("254,1678");
  });

  it("ignores empty picks array and falls through to roster fields", () => {
    const result = allianceRosterToConnectionKey({
      picks: [],
      captain: 254,
      round1: 1678,
    });
    expect(result).toBe("254,1678");
  });
});

describe("ConnectionsApiError", () => {
  it("captures message, status, and detail and uses the right name", () => {
    const err = new ConnectionsApiError("boom", 503, "service down");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ConnectionsApiError");
    expect(err.message).toBe("boom");
    expect(err.status).toBe(503);
    expect(err.detail).toBe("service down");
  });

  it("defaults status and detail to null when omitted", () => {
    const err = new ConnectionsApiError("oops");
    expect(err.status).toBeNull();
    expect(err.detail).toBeNull();
  });
});

describe("fetchAllianceConnections", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns [] without calling fetch when fewer than 2 teams are provided", async () => {
    expect(await fetchAllianceConnections("2024nytr", [254])).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns [] when eventKey cannot be split into year and event code", async () => {
    expect(await fetchAllianceConnections("bad", [254, 1678])).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches matchups, dedupes/sorts team numbers, and normalizes camelCase items", async () => {
    fetch.mockResolvedValue(
      jsonResponse([
        {
          teamA: 254,
          teamB: 1678,
          teamAName: "The Cheesy Poofs",
          teamBName: "Citrus Circuits",
          partneredAt: [
            {
              eventKey: "2023gal",
              eventName: "Galileo",
              year: 2023,
              stage: "quals",
              result: "win",
            },
          ],
        },
      ])
    );

    const result = await fetchAllianceConnections("2024nytr", [1678, 254, 254]);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/2024\/matchups\/nytr\/254,1678$/),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(result).toEqual([
      {
        team_a: 254,
        team_b: 1678,
        team_a_name: "The Cheesy Poofs",
        team_b_name: "Citrus Circuits",
        partnered_at: [
          {
            event_key: "2023gal",
            event_name: "Galileo",
            year: 2023,
            stage: "quals",
            result: "win",
          },
        ],
      },
    ]);
  });

  it("accepts snake_case API payloads and data.details wrappers", async () => {
    fetch.mockResolvedValue(
      jsonResponse({
        details: [
          {
            team_a: 111,
            team_b: 222,
            team_a_name: "A",
            team_b_name: "B",
            partnered_at: [{ event_key: "2022tx", event_name: "Texas", year: 2022 }],
          },
        ],
      })
    );

    const result = await fetchAllianceConnections("2025txcmp", [222, 111]);
    expect(result[0].team_a).toBe(111);
    expect(result[0].partnered_at[0].event_key).toBe("2022tx");
  });

  it("returns [] for successful responses with no matchup items", async () => {
    fetch.mockResolvedValue(jsonResponse([]));
    expect(await fetchAllianceConnections("2024nytr", [254, 1678])).toEqual([]);
  });

  it("throws ConnectionsApiError using server detail as the message when provided", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ detail: "slow down" }, { status: 429 })
    );

    await expect(
      fetchAllianceConnections("2024nytr", [254, 1678])
    ).rejects.toMatchObject({
      name: "ConnectionsApiError",
      status: 429,
      detail: "slow down",
      message: "slow down",
    });
  });

  it("uses plain-text error bodies as the thrown message", async () => {
    vi.useFakeTimers();
    fetch.mockResolvedValue(
      jsonResponse("service unavailable", {
        status: 503,
        contentType: "text/plain",
      })
    );

    const promise = fetchAllianceConnections("2024nytr", [254, 1678]);
    const assertion = expect(promise).rejects.toMatchObject({
      status: 503,
      message: "service unavailable",
      detail: "service unavailable",
    });

    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(800);
    await vi.advanceTimersByTimeAsync(1600);
    await assertion;
  });

  it("retries transient 503 responses before succeeding", async () => {
    vi.useFakeTimers();
    fetch
      .mockResolvedValueOnce(jsonResponse(null, { status: 503, contentType: "text/plain" }))
      .mockResolvedValueOnce(jsonResponse([]));

    const promise = fetchAllianceConnections("2024nytr", [254, 1678]);
    await vi.advanceTimersByTimeAsync(400);
    const result = await promise;

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual([]);
  });

  it("retries network failures and throws ConnectionsApiError after exhausting retries", async () => {
    vi.useFakeTimers();
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const promise = fetchAllianceConnections("2024nytr", [254, 1678]);
    const assertion = expect(promise).rejects.toMatchObject({
      name: "ConnectionsApiError",
      message: expect.stringContaining("Network error"),
    });

    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(800);
    await vi.advanceTimersByTimeAsync(1600);
    await assertion;

    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("uses a generic status message when the error body has no detail", async () => {
    fetch.mockResolvedValue(jsonResponse({}, { status: 404 }));

    await expect(
      fetchAllianceConnections("2024nytr", [254, 1678])
    ).rejects.toMatchObject({
      status: 404,
      message: "Resource not found.",
    });
  });

  it("rejects when the caller aborts during a retry delay", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const promise = fetchAllianceConnections("2024nytr", [254, 1678], controller.signal);
    const assertion = expect(promise).rejects.toMatchObject({ name: "AbortError" });

    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await vi.advanceTimersByTimeAsync(300);
    await assertion;
  });
});
