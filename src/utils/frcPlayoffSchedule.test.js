import {
  extendFRCPlayoffScheduleWithPartialMatches,
  playoffMatchHasDisplayableResult,
  getPlayoffScheduleRowStyles,
} from "./frcPlayoffSchedule";

function makeFrcMatch(overrides = {}) {
  return {
    matchNumber: 1,
    tournamentLevel: "PLAYOFF",
    description: "Match 1 (R1) (#1)",
    startTime: "2025-04-01T10:00:00",
    actualStartTime: "2025-04-01T10:00:00",
    postResultTime: "2025-04-01T10:05:00",
    scoreRedFinal: 100,
    scoreBlueFinal: 50,
    redWins: true,
    blueWins: false,
    teams: [
      { teamNumber: 100, station: "Red1" },
      { teamNumber: 101, station: "Red2" },
      { teamNumber: 102, station: "Red3" },
      { teamNumber: 200, station: "Blue1" },
      { teamNumber: 201, station: "Blue2" },
      { teamNumber: 202, station: "Blue3" },
    ],
    winner: { winner: "red", tieWinner: "", level: 1 },
    ...overrides,
  };
}

describe("extendFRCPlayoffScheduleWithPartialMatches", () => {
  it("returns the input unchanged when given null/empty/non-array", () => {
    expect(extendFRCPlayoffScheduleWithPartialMatches(null, 8)).toBeNull();
    expect(extendFRCPlayoffScheduleWithPartialMatches([], 8)).toEqual([]);
    expect(extendFRCPlayoffScheduleWithPartialMatches("nope", 8)).toBe("nope");
  });

  it("returns the input unchanged for an unsupported alliance count", () => {
    const schedule = [makeFrcMatch()];
    expect(extendFRCPlayoffScheduleWithPartialMatches(schedule, 5)).toBe(schedule);
  });

  it("propagates the winner alliance to winnerTo and loser alliance to loserTo (8-alliance)", () => {
    // Match 1 in 8-alliance: winnerTo M7 red, loserTo M5 red.
    const out = extendFRCPlayoffScheduleWithPartialMatches([makeFrcMatch()], 8);
    const m7 = out.find((m) => m.matchNumber === 7);
    const m5 = out.find((m) => m.matchNumber === 5);
    expect(m7).toBeDefined();
    expect(m5).toBeDefined();
    const m7Red = m7.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    const m5Red = m5.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(m7Red).toEqual([100, 101, 102]);
    expect(m5Red).toEqual([200, 201, 202]);
    // No blue teams populated yet for either downstream match
    expect(m7.teams.some((t) => t.station.startsWith("Blue"))).toBe(false);
  });

  it("creates downstream matches with predicted start times based on the latest schedule time", () => {
    const out = extendFRCPlayoffScheduleWithPartialMatches([makeFrcMatch()], 8);
    const m7 = out.find((m) => m.matchNumber === 7);
    // latest = 2025-04-01T10:05:00 local; +6 steps * 7 min = +42 min for m7
    const predicted = new Date(m7.startTime).getTime();
    const baseline = new Date("2025-04-01T10:05:00").getTime() + 6 * 7 * 60 * 1000;
    expect(predicted).toBe(baseline);
    expect(m7.tournamentLevel).toBe("PLAYOFF");
    expect(m7.description).toMatch(/Match 7/);
  });

  it("does nothing when the source match has no result signal", () => {
    const undecided = makeFrcMatch({
      scoreRedFinal: null,
      scoreBlueFinal: null,
      redWins: null,
      blueWins: null,
      postResultTime: null,
      actualStartTime: null,
      winner: { winner: "", tieWinner: "", level: 0 },
    });
    const out = extendFRCPlayoffScheduleWithPartialMatches([undecided], 8);
    expect(out.map((m) => m.matchNumber)).toEqual([1]);
  });

  it("does not create downstream matches when the result is a tie (no winner color)", () => {
    const tie = makeFrcMatch({
      redWins: false,
      blueWins: false,
      scoreRedFinal: 75,
      scoreBlueFinal: 75,
      winner: { winner: "", tieWinner: "", level: 0 },
    });
    const out = extendFRCPlayoffScheduleWithPartialMatches([tie], 8);
    expect(out.map((m) => m.matchNumber)).toEqual([1]);
  });

  it("preserves existing downstream matches and only updates the relevant station", () => {
    const existingM7 = {
      matchNumber: 7,
      tournamentLevel: "PLAYOFF",
      description: "Match 7 (R2) (#7)",
      teams: [
        { teamNumber: 999, station: "Blue1" },
        { teamNumber: 998, station: "Blue2" },
        { teamNumber: 997, station: "Blue3" },
      ],
      winner: { winner: "", tieWinner: "", level: 0 },
    };
    const out = extendFRCPlayoffScheduleWithPartialMatches([makeFrcMatch(), existingM7], 8);
    const m7 = out.find((m) => m.matchNumber === 7);
    // Blue stays untouched, Red is filled by the M1 winner
    const blue = m7.teams.filter((t) => t.station.startsWith("Blue")).map((t) => t.teamNumber).sort();
    const red = m7.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(blue).toEqual([997, 998, 999]);
    expect(red).toEqual([100, 101, 102]);
  });

  it("returns matches sorted by matchNumber", () => {
    const out = extendFRCPlayoffScheduleWithPartialMatches([makeFrcMatch()], 8);
    const nums = out.map((m) => m.matchNumber);
    const sorted = [...nums].sort((a, b) => a - b);
    expect(nums).toEqual(sorted);
  });

  it("uses winningAlliance fallback when redWins/blueWins are not set", () => {
    const m = makeFrcMatch({
      redWins: null,
      blueWins: null,
      scoreRedFinal: null,
      scoreBlueFinal: null,
      winner: { winner: "", tieWinner: "", level: 0 },
      scores: { winningAlliance: 2 }, // blue
    });
    const out = extendFRCPlayoffScheduleWithPartialMatches([m], 8);
    const m7 = out.find((m2) => m2.matchNumber === 7);
    // Blue won M1 → winnerTo M7 red is filled with blue alliance teams
    const m7Red = m7.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(m7Red).toEqual([200, 201, 202]);
  });
});

describe("playoffMatchHasDisplayableResult", () => {
  it("returns false for null / non-objects", () => {
    expect(playoffMatchHasDisplayableResult(null)).toBe(false);
    expect(playoffMatchHasDisplayableResult(undefined)).toBe(false);
    expect(playoffMatchHasDisplayableResult("nope")).toBe(false);
  });

  it("returns true when actualStartTime or postResultTime is present", () => {
    expect(playoffMatchHasDisplayableResult({ actualStartTime: "2025-01-01" })).toBe(true);
    expect(playoffMatchHasDisplayableResult({ postResultTime: "2025-01-01" })).toBe(true);
  });

  it("returns true for a winner.winner or winner.tieWinner of red/blue", () => {
    expect(playoffMatchHasDisplayableResult({ winner: { winner: "red" } })).toBe(true);
    expect(playoffMatchHasDisplayableResult({ winner: { tieWinner: "blue" } })).toBe(true);
  });

  it("returns true when redWins or blueWins is true", () => {
    expect(playoffMatchHasDisplayableResult({ redWins: true })).toBe(true);
    expect(playoffMatchHasDisplayableResult({ blueWins: true })).toBe(true);
  });

  it("returns false when nothing is set", () => {
    expect(playoffMatchHasDisplayableResult({})).toBe(false);
    expect(playoffMatchHasDisplayableResult({ actualStartTime: "", postResultTime: null })).toBe(false);
  });
});

describe("getPlayoffScheduleRowStyles", () => {
  it("marks red bold/winner when winner.winner === 'red'", () => {
    const r = getPlayoffScheduleRowStyles({ winner: { winner: "red" } }, false);
    expect(r).toEqual({ redStyle: "red bold", blueStyle: "blue", winnerStyle: "red" });
  });

  it("tieWinner takes priority over winner.winner", () => {
    const r = getPlayoffScheduleRowStyles({ winner: { winner: "red", tieWinner: "blue" } }, false);
    expect(r).toEqual({ redStyle: "red", blueStyle: "blue bold", winnerStyle: "blue" });
  });

  it("falls back to score comparison when no winner is set (FRC mode)", () => {
    const r = getPlayoffScheduleRowStyles({ scoreRedFinal: 80, scoreBlueFinal: 100 }, false);
    expect(r.winnerStyle).toBe("blue");
    expect(r.blueStyle).toBe("blue bold");
  });

  it("falls back to score comparison in FTC mode as well", () => {
    const r = getPlayoffScheduleRowStyles({ scoreRedFinal: 200, scoreBlueFinal: 100 }, true);
    expect(r.winnerStyle).toBe("red");
    expect(r.redStyle).toBe("red bold");
  });

  it("returns 'tie' when scores are equal and no winner is set", () => {
    const r = getPlayoffScheduleRowStyles({ scoreRedFinal: 50, scoreBlueFinal: 50 }, false);
    expect(r).toEqual({ redStyle: "red", blueStyle: "blue", winnerStyle: "tie" });
  });
});
