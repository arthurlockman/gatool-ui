import {
  getPlayoffStationOrderMatchKey,
  stationOrderRank,
  canonicalAllianceStation,
  partitionMatchTeamsByAllianceColor,
  partitionPlayoffMainFieldStations,
  rebundleMatchTeamsAfterReorder,
  applyPlayoffStationOrderToMatch,
} from "./playoffStationOrderEdits";

describe("getPlayoffStationOrderMatchKey", () => {
  it("returns null for non-objects", () => {
    expect(getPlayoffStationOrderMatchKey(null, false)).toBeNull();
    expect(getPlayoffStationOrderMatchKey(undefined, false)).toBeNull();
    expect(getPlayoffStationOrderMatchKey("nope", false)).toBeNull();
  });

  it("returns null for non-playoff matches", () => {
    expect(getPlayoffStationOrderMatchKey({ tournamentLevel: "Qualification", matchNumber: 5 }, false)).toBeNull();
    expect(getPlayoffStationOrderMatchKey({ matchNumber: 5 }, false)).toBeNull();
  });

  it("FRC mode keys on matchNumber", () => {
    expect(getPlayoffStationOrderMatchKey({ tournamentLevel: "Playoff", matchNumber: 12 }, false)).toBe("frc:12");
    expect(getPlayoffStationOrderMatchKey({ tournamentLevel: "playoff", matchNumber: 1 }, false)).toBe("frc:1");
  });

  it("FRC mode returns null when matchNumber is missing/empty", () => {
    expect(getPlayoffStationOrderMatchKey({ tournamentLevel: "Playoff", matchNumber: null }, false)).toBeNull();
    expect(getPlayoffStationOrderMatchKey({ tournamentLevel: "Playoff", matchNumber: "" }, false)).toBeNull();
  });

  it("FTC mode keys on series + originalMatchNumber when present", () => {
    expect(getPlayoffStationOrderMatchKey(
      { tournamentLevel: "Playoff", series: 1, originalMatchNumber: 7, matchNumber: 99 },
      true,
    )).toBe("ftc:1:7");
  });

  it("FTC mode falls back to matchNumber when originalMatchNumber missing", () => {
    expect(getPlayoffStationOrderMatchKey(
      { tournamentLevel: "Playoff", series: 2, matchNumber: 3 },
      true,
    )).toBe("ftc:2:3");
  });

  it("FTC mode returns null when both number fields are missing", () => {
    expect(getPlayoffStationOrderMatchKey(
      { tournamentLevel: "Playoff", series: 1 },
      true,
    )).toBeNull();
  });
});

describe("stationOrderRank", () => {
  it("returns the trailing integer for valid stations", () => {
    expect(stationOrderRank("Red1")).toBe(1);
    expect(stationOrderRank("Blue3")).toBe(3);
    expect(stationOrderRank("Red12")).toBe(12);
  });

  it("returns 99 for null/empty/malformed inputs", () => {
    expect(stationOrderRank(null)).toBe(99);
    expect(stationOrderRank(undefined)).toBe(99);
    expect(stationOrderRank("")).toBe(99);
    expect(stationOrderRank("Red")).toBe(99);
    expect(stationOrderRank("123")).toBe(99);
  });
});

describe("canonicalAllianceStation", () => {
  it("returns empty string for null/undefined/empty input", () => {
    expect(canonicalAllianceStation(null)).toBe("");
    expect(canonicalAllianceStation(undefined)).toBe("");
    expect(canonicalAllianceStation("")).toBe("");
  });

  it("normalizes casing on red/blue stations", () => {
    expect(canonicalAllianceStation("red1")).toBe("Red1");
    expect(canonicalAllianceStation("RED2")).toBe("Red2");
    expect(canonicalAllianceStation("blue3")).toBe("Blue3");
    expect(canonicalAllianceStation("  Blue1  ")).toBe("Blue1");
  });

  it("returns non-matching strings unchanged (after trim is not applied to non-matches)", () => {
    expect(canonicalAllianceStation("Reserve")).toBe("Reserve");
    expect(canonicalAllianceStation("Red 1")).toBe("Red 1");
  });
});

describe("partitionMatchTeamsByAllianceColor", () => {
  it("returns empty arrays for non-array input", () => {
    expect(partitionMatchTeamsByAllianceColor(null)).toEqual({ red: [], blue: [], rest: [] });
    expect(partitionMatchTeamsByAllianceColor(undefined)).toEqual({ red: [], blue: [], rest: [] });
  });

  it("splits and sorts teams by station prefix", () => {
    const teams = [
      { station: "Blue3", teamNumber: 3 },
      { station: "Red2", teamNumber: 22 },
      { station: "Red1", teamNumber: 11 },
      { station: "Blue1", teamNumber: 1 },
      { station: "Reserve", teamNumber: 99 },
      { station: "Blue2", teamNumber: 2 },
      { station: "Red3", teamNumber: 33 },
    ];
    const { red, blue, rest } = partitionMatchTeamsByAllianceColor(teams);
    expect(red.map((t) => t.teamNumber)).toEqual([11, 22, 33]);
    expect(blue.map((t) => t.teamNumber)).toEqual([1, 2, 3]);
    expect(rest.map((t) => t.teamNumber)).toEqual([99]);
  });

  it("treats Red4 / Blue4 as part of red/blue (prefix match)", () => {
    const teams = [
      { station: "Red4", teamNumber: 4 },
      { station: "Red1", teamNumber: 1 },
    ];
    const { red, rest } = partitionMatchTeamsByAllianceColor(teams);
    expect(red.map((t) => t.teamNumber)).toEqual([1, 4]);
    expect(rest).toEqual([]);
  });
});

describe("partitionPlayoffMainFieldStations", () => {
  it("returns empty arrays for non-array input", () => {
    expect(partitionPlayoffMainFieldStations(null)).toEqual({ red: [], blue: [] });
  });

  it("only includes Red1-3 / Blue1-3, ignoring Red4/Blue4 and others", () => {
    const teams = [
      { station: "Red4", teamNumber: 4 },
      { station: "Red2", teamNumber: 22 },
      { station: "Blue1", teamNumber: 1 },
      { station: "Reserve", teamNumber: 99 },
      { station: "Red1", teamNumber: 11 },
      { station: "Blue3", teamNumber: 3 },
      { station: "Blue4", teamNumber: 44 },
      { station: "Red3", teamNumber: 33 },
      { station: "Blue2", teamNumber: 2 },
    ];
    const { red, blue } = partitionPlayoffMainFieldStations(teams);
    expect(red.map((t) => t.teamNumber)).toEqual([11, 22, 33]);
    expect(blue.map((t) => t.teamNumber)).toEqual([1, 2, 3]);
  });
});

describe("rebundleMatchTeamsAfterReorder", () => {
  it("renumbers stations to match position and appends rest", () => {
    const red = [{ teamNumber: 100 }, { teamNumber: 200 }, { teamNumber: 300 }];
    const blue = [{ teamNumber: 400 }, { teamNumber: 500 }, { teamNumber: 600 }];
    const rest = [{ station: "Reserve", teamNumber: 999 }];
    const out = rebundleMatchTeamsAfterReorder(red, blue, rest);
    expect(out).toEqual([
      { teamNumber: 100, station: "Red1" },
      { teamNumber: 200, station: "Red2" },
      { teamNumber: 300, station: "Red3" },
      { teamNumber: 400, station: "Blue1" },
      { teamNumber: 500, station: "Blue2" },
      { teamNumber: 600, station: "Blue3" },
      { station: "Reserve", teamNumber: 999 },
    ]);
  });

  it("treats null/undefined inputs as empty lists", () => {
    expect(rebundleMatchTeamsAfterReorder(null, undefined, null)).toEqual([]);
  });

  it("deep-clones inputs (does not mutate caller objects)", () => {
    const red = [{ teamNumber: 100, nested: { foo: "bar" } }];
    const out = rebundleMatchTeamsAfterReorder(red, [], []);
    out[0].nested.foo = "mutated";
    expect(red[0].nested.foo).toBe("bar");
  });
});

describe("applyPlayoffStationOrderToMatch", () => {
  function makeMatch() {
    return {
      tournamentLevel: "Playoff",
      matchNumber: 5,
      teams: [
        { station: "Red1", teamNumber: 11 },
        { station: "Red2", teamNumber: 22 },
        { station: "Red3", teamNumber: 33 },
        { station: "Blue1", teamNumber: 1 },
        { station: "Blue2", teamNumber: 2 },
        { station: "Blue3", teamNumber: 3 },
      ],
    };
  }

  it("returns the match unchanged when match is null/undefined", () => {
    expect(applyPlayoffStationOrderToMatch(null, "EVT", {}, false)).toBeNull();
    expect(applyPlayoffStationOrderToMatch(undefined, "EVT", {}, false)).toBeUndefined();
  });

  it("returns match unchanged when eventCode or editsRoot is missing/invalid", () => {
    const m = makeMatch();
    expect(applyPlayoffStationOrderToMatch(m, "", {}, false)).toBe(m);
    expect(applyPlayoffStationOrderToMatch(m, "EVT", null, false)).toBe(m);
    expect(applyPlayoffStationOrderToMatch(m, "EVT", "not-an-object", false)).toBe(m);
  });

  it("returns match unchanged for non-playoff matches (no key)", () => {
    const m = { tournamentLevel: "Qualification", matchNumber: 5, teams: [] };
    const root = { EVT: { "frc:5": { teams: [{ station: "Red1", teamNumber: 99 }] } } };
    expect(applyPlayoffStationOrderToMatch(m, "EVT", root, false)).toBe(m);
  });

  it("returns match unchanged when no entry exists for the key", () => {
    const m = makeMatch();
    expect(applyPlayoffStationOrderToMatch(m, "EVT", { EVT: {} }, false)).toBe(m);
    expect(applyPlayoffStationOrderToMatch(m, "OTHER", { EVT: { "frc:5": { teams: [{ station: "Red1", teamNumber: 99 }] } } }, false)).toBe(m);
  });

  it("returns match unchanged when stored entry has no teams", () => {
    const m = makeMatch();
    const root = { EVT: { "frc:5": { teams: [] } } };
    expect(applyPlayoffStationOrderToMatch(m, "EVT", root, false)).toBe(m);
    const root2 = { EVT: { "frc:5": {} } };
    expect(applyPlayoffStationOrderToMatch(m, "EVT", root2, false)).toBe(m);
  });

  it("applies stored station order, canonicalizing casing", () => {
    const m = makeMatch();
    const root = {
      EVT: {
        "frc:5": {
          teams: [
            { station: "red2", teamNumber: 22 },
            { station: "RED1", teamNumber: 11 },
            { station: "Red3", teamNumber: 33 },
            { station: "blue3", teamNumber: 3 },
            { station: "Blue1", teamNumber: 1 },
            { station: "Blue2", teamNumber: 2 },
          ],
        },
      },
    };
    const out = applyPlayoffStationOrderToMatch(m, "EVT", root, false);
    // Red sorted by canonical station rank; positions get renumbered to Red1/Red2/Red3
    expect(out.teams.slice(0, 3).map((t) => [t.station, t.teamNumber])).toEqual([
      ["Red1", 11],
      ["Red2", 22],
      ["Red3", 33],
    ]);
    expect(out.teams.slice(3, 6).map((t) => [t.station, t.teamNumber])).toEqual([
      ["Blue1", 1],
      ["Blue2", 2],
      ["Blue3", 3],
    ]);
    // Original match is not mutated
    expect(m.teams[0].station).toBe("Red1");
  });

  it("preserves non-Red/Blue rows from the original match (e.g. Reserve)", () => {
    const m = makeMatch();
    m.teams.push({ station: "Reserve", teamNumber: 999 });
    const root = {
      EVT: {
        "frc:5": {
          teams: [
            { station: "Red1", teamNumber: 33 },
            { station: "Red2", teamNumber: 11 },
            { station: "Red3", teamNumber: 22 },
            { station: "Blue1", teamNumber: 3 },
            { station: "Blue2", teamNumber: 1 },
            { station: "Blue3", teamNumber: 2 },
          ],
        },
      },
    };
    const out = applyPlayoffStationOrderToMatch(m, "EVT", root, false);
    expect(out.teams).toHaveLength(7);
    expect(out.teams[0]).toMatchObject({ station: "Red1", teamNumber: 33 });
    expect(out.teams[6]).toMatchObject({ station: "Reserve", teamNumber: 999 });
  });

  it("uses FTC keying when ftcMode is true", () => {
    const m = {
      tournamentLevel: "Playoff",
      series: 1,
      matchNumber: 4,
      teams: [
        { station: "Red1", teamNumber: 11 },
        { station: "Red2", teamNumber: 22 },
        { station: "Blue1", teamNumber: 1 },
        { station: "Blue2", teamNumber: 2 },
      ],
    };
    const root = {
      EVT: {
        "ftc:1:4": {
          teams: [
            { station: "Red1", teamNumber: 22 },
            { station: "Red2", teamNumber: 11 },
            { station: "Blue1", teamNumber: 2 },
            { station: "Blue2", teamNumber: 1 },
          ],
        },
      },
    };
    const out = applyPlayoffStationOrderToMatch(m, "EVT", root, true);
    expect(out.teams.map((t) => [t.station, t.teamNumber])).toEqual([
      ["Red1", 22],
      ["Red2", 11],
      ["Blue1", 2],
      ["Blue2", 1],
    ]);
  });
});
