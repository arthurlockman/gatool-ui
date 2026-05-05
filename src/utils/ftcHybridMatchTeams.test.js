import {
  extractAllianceSlotTeamNumber,
  normalizeFtcGatoolAllianceRow,
  normalizeFtcHybridTeamEntry,
  normalizeFtcHybridMatch,
  normalizePlayoffScheduleApiResponse,
  hydrateFtcPlayoffTeamsFromResults,
} from "./ftcHybridMatchTeams";

describe("extractAllianceSlotTeamNumber", () => {
  it("returns null for null/undefined/empty inputs", () => {
    expect(extractAllianceSlotTeamNumber(null)).toBeNull();
    expect(extractAllianceSlotTeamNumber(undefined)).toBeNull();
    expect(extractAllianceSlotTeamNumber("")).toBeNull();
  });

  it("returns numeric scalar unchanged", () => {
    expect(extractAllianceSlotTeamNumber(254)).toBe(254);
  });

  it("parses numeric strings to integers", () => {
    expect(extractAllianceSlotTeamNumber("1234")).toBe(1234);
    expect(extractAllianceSlotTeamNumber("  42  ")).toBe(42);
  });

  it("returns non-numeric strings as-is", () => {
    expect(extractAllianceSlotTeamNumber("frc254")).toBe("frc254");
  });

  it("extracts teamNumber from object slot", () => {
    expect(
      extractAllianceSlotTeamNumber({ teamNumber: 1114, teamName: "Simbotics" })
    ).toBe(1114);
  });

  it("falls back to displayTeamNumber when teamNumber missing", () => {
    expect(
      extractAllianceSlotTeamNumber({ displayTeamNumber: "67", teamName: "HOT" })
    ).toBe(67);
  });

  it("returns null when object has neither teamNumber nor displayTeamNumber", () => {
    expect(extractAllianceSlotTeamNumber({ teamName: "Mystery" })).toBeNull();
  });

  it("returns null when teamNumber on object is empty string", () => {
    expect(extractAllianceSlotTeamNumber({ teamNumber: "" })).toBeNull();
  });

  it("treats arrays as scalar (returns through coerce path)", () => {
    const arr = [1, 2];
    expect(extractAllianceSlotTeamNumber(arr)).toBe(arr);
  });
});

describe("normalizeFtcGatoolAllianceRow", () => {
  it("returns input unchanged for null/non-object", () => {
    expect(normalizeFtcGatoolAllianceRow(null)).toBeNull();
    expect(normalizeFtcGatoolAllianceRow(undefined)).toBeUndefined();
    expect(normalizeFtcGatoolAllianceRow("nope")).toBe("nope");
  });

  it("flattens all five slot positions to scalar numbers", () => {
    const result = normalizeFtcGatoolAllianceRow({
      number: 1,
      captain: { teamNumber: 1114 },
      round1: { teamNumber: "254" },
      round2: 67,
      round3: { displayTeamNumber: "180" },
      backup: null,
    });
    expect(result).toEqual({
      number: 1,
      captain: 1114,
      round1: 254,
      round2: 67,
      round3: 180,
      backup: null,
    });
  });

  it("preserves other fields on the alliance row", () => {
    const result = normalizeFtcGatoolAllianceRow({
      number: 3,
      name: "Alliance 3",
      captain: 100,
    });
    expect(result.name).toBe("Alliance 3");
    expect(result.number).toBe(3);
  });
});

describe("normalizeFtcHybridTeamEntry", () => {
  it("returns input unchanged for null/non-object", () => {
    expect(normalizeFtcHybridTeamEntry(null)).toBeNull();
    expect(normalizeFtcHybridTeamEntry(undefined)).toBeUndefined();
    expect(normalizeFtcHybridTeamEntry(42)).toBe(42);
  });

  it("keeps existing teamNumber when present", () => {
    const result = normalizeFtcHybridTeamEntry({ teamNumber: 1234, station: "Red1" });
    expect(result.teamNumber).toBe(1234);
    expect(result.station).toBe("Red1");
  });

  it("promotes scalar `team` field to teamNumber", () => {
    const result = normalizeFtcHybridTeamEntry({ team: 567, station: "Blue2" });
    expect(result.teamNumber).toBe(567);
  });

  it("keeps nested team object as-is when no scalar id sources are above it", () => {
    const nested = { teamNumber: 8888, name: "X" };
    const result = normalizeFtcHybridTeamEntry({ team: nested });
    expect(result.teamNumber).toBe(nested);
  });

  it("falls back through TeamId, teamId, number on root", () => {
    expect(normalizeFtcHybridTeamEntry({ TeamId: 1 }).teamNumber).toBe(1);
    expect(normalizeFtcHybridTeamEntry({ teamId: 2 }).teamNumber).toBe(2);
    expect(normalizeFtcHybridTeamEntry({ number: 3 }).teamNumber).toBe(3);
  });

  it("coerces numeric string ids", () => {
    const result = normalizeFtcHybridTeamEntry({ team: "9999" });
    expect(result.teamNumber).toBe(9999);
  });

  it("returns shallow clone without teamNumber when no id source present", () => {
    const input = { station: "Red1", surrogate: false };
    const result = normalizeFtcHybridTeamEntry(input);
    expect(result).not.toBe(input);
    expect(result.teamNumber).toBeUndefined();
    expect(result.station).toBe("Red1");
  });

  it("treats empty-string team as missing", () => {
    const result = normalizeFtcHybridTeamEntry({ teamNumber: "", station: "Blue1" });
    expect(result.teamNumber).toBe("");
  });
});

describe("normalizeFtcHybridMatch", () => {
  it("returns input unchanged for null/non-object", () => {
    expect(normalizeFtcHybridMatch(null)).toBeNull();
    expect(normalizeFtcHybridMatch(undefined)).toBeUndefined();
    expect(normalizeFtcHybridMatch("nope")).toBe("nope");
  });

  it("normalizes station strings on team rows", () => {
    const result = normalizeFtcHybridMatch({
      matchNumber: 1,
      teams: [
        { teamNumber: 1, station: "red1" },
        { teamNumber: 2, station: "Red 2" },
        { teamNumber: 3, station: "BLUE1" },
        { teamNumber: 4, station: "blue 2" },
      ],
    });
    expect(result.teams.map((t) => t.station)).toEqual([
      "Red1",
      "Red2",
      "Blue1",
      "Blue2",
    ]);
  });

  it("normalizes team id fields on team rows", () => {
    const result = normalizeFtcHybridMatch({
      teams: [
        { team: 100, station: "red1" },
        { TeamId: "200", station: "blue1" },
      ],
    });
    expect(result.teams[0].teamNumber).toBe(100);
    expect(result.teams[1].teamNumber).toBe(200);
  });

  it("uses match.series when present", () => {
    const result = normalizeFtcHybridMatch({ series: 3, matchSeries: 99, teams: [] });
    expect(result.series).toBe(3);
  });

  it("falls back to matchSeries when series is missing/empty", () => {
    expect(normalizeFtcHybridMatch({ matchSeries: 5, teams: [] }).series).toBe(5);
    expect(
      normalizeFtcHybridMatch({ series: "", matchSeries: 7, teams: [] }).series
    ).toBe(7);
  });

  it("does not add series when neither field provided", () => {
    const result = normalizeFtcHybridMatch({ matchNumber: 9, teams: [] });
    expect("series" in result).toBe(false);
  });

  it("returns shallow clone when teams is missing/non-array", () => {
    const result = normalizeFtcHybridMatch({ matchNumber: 7 });
    expect(result.matchNumber).toBe(7);
    expect(result.teams).toBeUndefined();
  });

  it("preserves unknown station strings unchanged", () => {
    const result = normalizeFtcHybridMatch({
      teams: [{ teamNumber: 1, station: "GreenZone" }],
    });
    expect(result.teams[0].station).toBe("GreenZone");
  });
});

describe("normalizePlayoffScheduleApiResponse", () => {
  it("returns null/undefined unchanged", () => {
    expect(normalizePlayoffScheduleApiResponse(null)).toBeNull();
    expect(normalizePlayoffScheduleApiResponse(undefined)).toBeUndefined();
  });

  it("wraps a bare array in { schedule }", () => {
    const arr = [{ matchNumber: 1 }, { matchNumber: 2 }];
    expect(normalizePlayoffScheduleApiResponse(arr)).toEqual({ schedule: arr });
  });

  it("returns object as-is when schedule is already an array", () => {
    const obj = { schedule: [{ matchNumber: 1 }] };
    expect(normalizePlayoffScheduleApiResponse(obj)).toBe(obj);
  });

  it("promotes top-level matches array to schedule", () => {
    const matches = [{ matchNumber: 1 }];
    const result = normalizePlayoffScheduleApiResponse({ matches, extra: "x" });
    expect(result.schedule).toBe(matches);
    expect(result.matches).toBe(matches);
    expect(result.extra).toBe("x");
  });

  it("promotes nested schedule.matches to top-level schedule", () => {
    const matches = [{ matchNumber: 1 }];
    const result = normalizePlayoffScheduleApiResponse({
      schedule: { matches },
      meta: 1,
    });
    expect(result.schedule).toBe(matches);
    expect(result.meta).toBe(1);
  });

  it("returns scalars unchanged", () => {
    expect(normalizePlayoffScheduleApiResponse("hello")).toBe("hello");
    expect(normalizePlayoffScheduleApiResponse(7)).toBe(7);
  });

  it("returns object unchanged when no recognized shape", () => {
    const obj = { foo: "bar" };
    expect(normalizePlayoffScheduleApiResponse(obj)).toBe(obj);
  });
});

describe("hydrateFtcPlayoffTeamsFromResults", () => {
  it("does nothing when match is null", () => {
    expect(() => hydrateFtcPlayoffTeamsFromResults(null, { alliances: [{}, {}] })).not.toThrow();
  });

  it("does nothing when results lacks two alliances", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, { alliances: [{}] });
    expect(match.teams).toEqual([]);
  });

  it("does nothing when match already has red+blue teams populated", () => {
    const original = [
      { teamNumber: 1, station: "Red1" },
      { teamNumber: 2, station: "Red2" },
      { teamNumber: 3, station: "Blue1" },
      { teamNumber: 4, station: "Blue2" },
    ];
    const match = { teams: [...original] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { robot1: 99, robot2: 100 },
        { robot1: 101, robot2: 102 },
      ],
    });
    expect(match.teams).toEqual(original);
  });

  it("hydrates teams from robotN keys (alliances[0]=blue, [1]=red)", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { robot1: 10, robot2: 20 },
        { robot1: 30, robot2: 40 },
      ],
    });
    expect(match.teams).toEqual([
      { teamNumber: 30, station: "Red1", surrogate: false, dq: false },
      { teamNumber: 40, station: "Red2", surrogate: false, dq: false },
      { teamNumber: 10, station: "Blue1", surrogate: false, dq: false },
      { teamNumber: 20, station: "Blue2", surrogate: false, dq: false },
    ]);
  });

  it("hydrates from teamN keys", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { team1: "11", team2: "22" },
        { team1: "33", team2: "44" },
      ],
    });
    expect(match.teams.map((t) => t.teamNumber)).toEqual([33, 44, 11, 22]);
  });

  it("hydrates from a robots array on each alliance", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { robots: [{ teamNumber: 1 }, { team: 2 }] },
        { robots: [{ number: 3 }, { TeamId: 4 }] },
      ],
    });
    expect(match.teams.map((t) => t.teamNumber)).toEqual([3, 4, 1, 2]);
  });

  it("falls back to scanning scalar number fields when no robot/team keys present", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { totalPoints: 99, dq1: 0, foo: 111, bar: 222 },
        { totalPoints: 88, baz: 333, qux: 444 },
      ],
    });
    expect(match.teams.map((t) => t.teamNumber)).toEqual([333, 444, 111, 222]);
  });

  it("does not mutate match.teams when both alliances yield no team numbers", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { totalPoints: 50 },
        { totalPoints: 60 },
      ],
    });
    expect(match.teams).toEqual([]);
  });

  it("hydrates when match has only one color filled", () => {
    const match = {
      teams: [{ teamNumber: 1, station: "Red1" }],
    };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { robot1: 10, robot2: 20 },
        { robot1: 30, robot2: 40 },
      ],
    });
    expect(match.teams.map((t) => t.station)).toEqual([
      "Red1",
      "Red2",
      "Blue1",
      "Blue2",
    ]);
  });

  // FTC Championship Divisions and Einstein use 3-robot alliances; commit
  // 682b8c1 ("Restoring third Alliance member for FTC Champs Divisions and
  // Einstein") removed the previous 2-robot cap from
  // hydrateFtcPlayoffTeamsFromResults so all robots in the score breakdown
  // are reflected on the match. This test pins that intentional behavior so
  // the cap doesn't get reintroduced silently.
  it("includes all robots per alliance (3-robot FTC Champs alliances)", () => {
    const match = { teams: [] };
    hydrateFtcPlayoffTeamsFromResults(match, {
      alliances: [
        { robot1: 10, robot2: 20, robot3: 30 },
        { robot1: 40, robot2: 50, robot3: 60 },
      ],
    });
    expect(match.teams).toHaveLength(6);
    expect(match.teams.map((t) => t.teamNumber)).toEqual([
      40, 50, 60, 10, 20, 30,
    ]);
    expect(match.teams.map((t) => t.station)).toEqual([
      "Red1",
      "Red2",
      "Red3",
      "Blue1",
      "Blue2",
      "Blue3",
    ]);
  });
});
