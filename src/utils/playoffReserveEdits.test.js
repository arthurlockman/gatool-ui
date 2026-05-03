import {
  normalizeAllianceTeamNumber,
  compactReserveEditsForEvent,
  applyPlayoffReserveEdits,
  matchHasPostedResult,
  prunePlayoffReserveSetsAfterPostedMatches,
} from "./playoffReserveEdits";

describe("normalizeAllianceTeamNumber", () => {
  it("returns null for null/undefined/empty", () => {
    expect(normalizeAllianceTeamNumber(null)).toBeNull();
    expect(normalizeAllianceTeamNumber(undefined)).toBeNull();
    expect(normalizeAllianceTeamNumber("")).toBeNull();
  });

  it("returns a Number for numeric strings or numbers", () => {
    expect(normalizeAllianceTeamNumber(254)).toBe(254);
    expect(normalizeAllianceTeamNumber("1234")).toBe(1234);
  });

  it("returns the original string when not numeric", () => {
    expect(normalizeAllianceTeamNumber("abc")).toBe("abc");
  });
});

describe("compactReserveEditsForEvent", () => {
  it("returns an empty object when the input is missing or non-object", () => {
    expect(compactReserveEditsForEvent(null)).toEqual({});
    expect(compactReserveEditsForEvent(undefined)).toEqual({});
    expect(compactReserveEditsForEvent("not-an-object")).toEqual({});
  });

  it("keeps numeric-keyed set/clear ops", () => {
    const input = {
      "1": { op: "set", round3: 254 },
      "2": { op: "clear" },
    };
    expect(compactReserveEditsForEvent(input)).toEqual(input);
  });

  it("strips non-numeric keys", () => {
    const input = {
      "abc": { op: "set", round3: 254 },
      "1": { op: "clear" },
    };
    expect(compactReserveEditsForEvent(input)).toEqual({
      "1": { op: "clear" },
    });
  });

  it("strips entries without op === set or clear", () => {
    const input = {
      "1": { op: "weird" },
      "2": { round3: 254 },
      "3": null,
      "4": "string",
      "5": { op: "set", round3: 100 },
    };
    expect(compactReserveEditsForEvent(input)).toEqual({
      "5": { op: "set", round3: 100 },
    });
  });
});

describe("applyPlayoffReserveEdits", () => {
  function makeAlliances() {
    return {
      alliances: [
        { number: 1, captain: 100, round1: 200, round2: 300, round3: 999, backup: null, backupReplaced: null },
        { number: 2, captain: 101, round1: 201, round2: 301, round3: null, backup: 888, backupReplaced: 301 },
        { number: 3, captain: 102, round1: 202, round2: 302, round3: null, backup: null, backupReplaced: null },
      ],
    };
  }

  it("returns [] when there are no alliances or no event code", () => {
    expect(applyPlayoffReserveEdits(null, "EVT", { EVT: { "1": { op: "clear" } } })).toEqual([]);
    expect(applyPlayoffReserveEdits({ alliances: [] }, "EVT", { EVT: { "1": { op: "clear" } } })).toEqual([]);
    expect(applyPlayoffReserveEdits(makeAlliances(), "", { EVT: { "1": { op: "clear" } } })).toEqual([]);
  });

  it("returns [] when there are no edits for the event", () => {
    expect(applyPlayoffReserveEdits(makeAlliances(), "EVT", null)).toEqual([]);
    expect(applyPlayoffReserveEdits(makeAlliances(), "EVT", { OTHER: { "1": { op: "clear" } } })).toEqual([]);
    expect(applyPlayoffReserveEdits(makeAlliances(), "EVT", { EVT: {} })).toEqual([]);
  });

  it("op:clear nulls out round3, backup, backupReplaced on the matching alliance", () => {
    const alliances = makeAlliances();
    const edits = { EVT: { "1": { op: "clear" } } };
    applyPlayoffReserveEdits(alliances, "EVT", edits);
    expect(alliances.alliances[0].round3).toBeNull();
    expect(alliances.alliances[0].backup).toBeNull();
    expect(alliances.alliances[0].backupReplaced).toBeNull();
    // Untouched alliances stay the same
    expect(alliances.alliances[1].backup).toBe(888);
  });

  it("op:clear returns the alliance key as prunable when API already shows no reserve", () => {
    const alliances = makeAlliances();
    // Alliance 3 already has no round3 / backup, so the clear is redundant
    const edits = { EVT: { "3": { op: "clear" } } };
    expect(applyPlayoffReserveEdits(alliances, "EVT", edits)).toEqual(["3"]);
  });

  it("op:clear does NOT return a prune key when the API still has a reserve", () => {
    const alliances = makeAlliances();
    const edits = { EVT: { "1": { op: "clear" } } };
    expect(applyPlayoffReserveEdits(alliances, "EVT", edits)).toEqual([]);
  });

  it("op:set with round3 sets round3 and clears legacy backup fields", () => {
    const alliances = makeAlliances();
    const edits = { EVT: { "2": { op: "set", round3: 555 } } };
    applyPlayoffReserveEdits(alliances, "EVT", edits);
    expect(alliances.alliances[1].round3).toBe(555);
    expect(alliances.alliances[1].backup).toBeNull();
    expect(alliances.alliances[1].backupReplaced).toBeNull();
  });

  it("op:set without round3 falls back to legacy backup/backupReplaced fields", () => {
    const alliances = makeAlliances();
    const edits = { EVT: { "1": { op: "set", backup: 777, backupReplaced: 200 } } };
    applyPlayoffReserveEdits(alliances, "EVT", edits);
    expect(alliances.alliances[0].backup).toBe(777);
    expect(alliances.alliances[0].backupReplaced).toBe(200);
    // round3 from API is preserved (not touched in legacy path)
    expect(alliances.alliances[0].round3).toBe(999);
  });

  it("treats round3 of empty string / null / undefined as legacy mode", () => {
    const alliances = makeAlliances();
    const edits = { EVT: { "1": { op: "set", round3: "", backup: 777 } } };
    applyPlayoffReserveEdits(alliances, "EVT", edits);
    expect(alliances.alliances[0].backup).toBe(777);
    expect(alliances.alliances[0].round3).toBe(999); // legacy path leaves round3 untouched
  });

  it("ignores edits for alliances missing a number", () => {
    const alliances = { alliances: [{ number: null, round3: 1 }, { number: 2, round3: 2 }] };
    const edits = { EVT: { "2": { op: "clear" } } };
    applyPlayoffReserveEdits(alliances, "EVT", edits);
    expect(alliances.alliances[1].round3).toBeNull();
  });

  it("dedupes prune keys", () => {
    const alliances = { alliances: [{ number: 5, round3: null, backup: null }, { number: 5, round3: null, backup: null }] };
    const edits = { EVT: { "5": { op: "clear" } } };
    expect(applyPlayoffReserveEdits(alliances, "EVT", edits)).toEqual(["5"]);
  });
});

describe("matchHasPostedResult", () => {
  it("is false for non-objects", () => {
    expect(matchHasPostedResult(null)).toBe(false);
    expect(matchHasPostedResult(undefined)).toBe(false);
    expect(matchHasPostedResult("nope")).toBe(false);
  });

  it("is true when postResultTime is a non-empty string", () => {
    expect(matchHasPostedResult({ postResultTime: "2026-01-01T00:00:00" })).toBe(true);
  });

  it("is false when postResultTime is null/empty AND scores are missing", () => {
    expect(matchHasPostedResult({ postResultTime: null, scoreRedFinal: null, scoreBlueFinal: null })).toBe(false);
    expect(matchHasPostedResult({ postResultTime: "", scoreRedFinal: null, scoreBlueFinal: 5 })).toBe(false);
  });

  it("is true when both final scores are present and not 0-0", () => {
    expect(matchHasPostedResult({ scoreRedFinal: 100, scoreBlueFinal: 50 })).toBe(true);
    expect(matchHasPostedResult({ scoreRedFinal: 0, scoreBlueFinal: 50 })).toBe(true);
  });

  it("is false when both scores are 0 (placeholder before FMS commits)", () => {
    expect(matchHasPostedResult({ scoreRedFinal: 0, scoreBlueFinal: 0 })).toBe(false);
  });

  it("is false when scores are non-numeric strings", () => {
    expect(matchHasPostedResult({ scoreRedFinal: "n/a", scoreBlueFinal: "n/a" })).toBe(false);
  });
});

describe("prunePlayoffReserveSetsAfterPostedMatches", () => {
  function makeRoot() {
    return {
      EVT: {
        "1": { op: "set", round3: 555, pendingSourceMatch: { tournamentLevel: "Playoff", matchNumber: 4 } },
        "2": { op: "set", round3: 666, pendingSourceMatch: { tournamentLevel: "Playoff", matchNumber: 5 } },
        "3": { op: "clear" }, // should never be pruned
      },
    };
  }

  it("returns the input root and no prunes when there are no playoff matches", () => {
    const root = makeRoot();
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: [], ftcMode: false,
    });
    expect(out.nextRoot).toBe(root);
    expect(out.prunedAllianceKeys).toEqual([]);
  });

  it("returns the input root and no prunes for a missing event code", () => {
    const root = makeRoot();
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "MISSING", playoffMatches: [{}], ftcMode: false,
    });
    expect(out.nextRoot).toBe(root);
  });

  it("prunes a set whose source match has a posted result (FRC: matchNumber match)", () => {
    const root = makeRoot();
    const playoff = [{ tournamentLevel: "Playoff", matchNumber: 4, postResultTime: "2026-01-01" }];
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: playoff, ftcMode: false,
    });
    expect(out.prunedAllianceKeys).toEqual(["1"]);
    expect(out.nextRoot.EVT["1"]).toBeUndefined();
    expect(out.nextRoot.EVT["2"]).toBeDefined();
    expect(out.nextRoot.EVT["3"]).toEqual({ op: "clear" });
  });

  it("does not prune when the matching match has no posted result", () => {
    const root = makeRoot();
    const playoff = [{ tournamentLevel: "Playoff", matchNumber: 4 }]; // no postResultTime, no scores
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: playoff, ftcMode: false,
    });
    expect(out.prunedAllianceKeys).toEqual([]);
  });

  it("does not prune op:clear edits, only op:set", () => {
    const root = {
      EVT: {
        "3": { op: "clear", pendingSourceMatch: { tournamentLevel: "Playoff", matchNumber: 1 } },
      },
    };
    const playoff = [{ tournamentLevel: "Playoff", matchNumber: 1, postResultTime: "x" }];
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: playoff, ftcMode: false,
    });
    expect(out.prunedAllianceKeys).toEqual([]);
  });

  it("does not prune when pendingSourceMatch is missing on the edit", () => {
    const root = {
      EVT: { "1": { op: "set", round3: 555 } },
    };
    const playoff = [{ tournamentLevel: "Playoff", matchNumber: 4, postResultTime: "x" }];
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: playoff, ftcMode: false,
    });
    expect(out.prunedAllianceKeys).toEqual([]);
  });

  it("FTC mode requires series + originalMatchNumber/matchNumber to match", () => {
    const root = {
      EVT: {
        "1": { op: "set", round3: 555, pendingSourceMatch: { tournamentLevel: "Playoff", series: 1, matchNumber: 2 } },
      },
    };
    const wrongSeries = [{ tournamentLevel: "Playoff", series: 2, matchNumber: 2, postResultTime: "x" }];
    const matching = [{ tournamentLevel: "Playoff", series: 1, matchNumber: 2, postResultTime: "x" }];
    expect(prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: wrongSeries, ftcMode: true,
    }).prunedAllianceKeys).toEqual([]);
    expect(prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: matching, ftcMode: true,
    }).prunedAllianceKeys).toEqual(["1"]);
  });

  it("FTC mode prefers originalMatchNumber when present", () => {
    const root = {
      EVT: {
        "1": { op: "set", round3: 555, pendingSourceMatch: { tournamentLevel: "Playoff", series: 1, originalMatchNumber: 7 } },
      },
    };
    const playoff = [{ tournamentLevel: "Playoff", series: 1, originalMatchNumber: 7, matchNumber: 99, postResultTime: "x" }];
    expect(prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: playoff, ftcMode: true,
    }).prunedAllianceKeys).toEqual(["1"]);
  });

  it("removes the eventCode entirely from the root when all edits get pruned", () => {
    const root = {
      EVT: {
        "1": { op: "set", round3: 1, pendingSourceMatch: { tournamentLevel: "Playoff", matchNumber: 1 } },
      },
      OTHER_EVT: { "1": { op: "clear" } },
    };
    const playoff = [{ tournamentLevel: "Playoff", matchNumber: 1, postResultTime: "x" }];
    const out = prunePlayoffReserveSetsAfterPostedMatches({
      editsRoot: root, eventCode: "EVT", playoffMatches: playoff, ftcMode: false,
    });
    expect(out.nextRoot.EVT).toBeUndefined();
    expect(out.nextRoot.OTHER_EVT).toEqual({ "1": { op: "clear" } });
  });
});
