import {
  getConnectionsEventKey,
  allianceRosterToConnectionKey,
  ConnectionsApiError,
} from "./allianceConnectionsApi";

// Note: fetchAllianceConnections is intentionally NOT covered here — it makes
// network calls and will be exercised at the hook level with MSW later.

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
