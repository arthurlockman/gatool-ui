import { extendFTCPlayoffScheduleWithPartialMatches } from "./ftcPlayoffSchedule";

function makeFtcMatch(series, overrides = {}) {
  return {
    series,
    matchNumber: 1,
    tournamentLevel: "PLAYOFF",
    description: `Series ${series} Match 1`,
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
      { teamNumber: 200, station: "Blue1" },
      { teamNumber: 201, station: "Blue2" },
    ],
    ...overrides,
  };
}

describe("extendFTCPlayoffScheduleWithPartialMatches", () => {
  it("returns the input unchanged when given null/empty/non-array", () => {
    expect(extendFTCPlayoffScheduleWithPartialMatches(null, 4)).toBeNull();
    expect(extendFTCPlayoffScheduleWithPartialMatches([], 4)).toEqual([]);
    expect(extendFTCPlayoffScheduleWithPartialMatches("nope", 4)).toBe("nope");
  });

  it("returns the input unchanged for an unsupported alliance count", () => {
    const schedule = [makeFtcMatch(1)];
    expect(extendFTCPlayoffScheduleWithPartialMatches(schedule, 5, true)).toBe(schedule);
  });

  it("propagates the winner alliance to winnerTo and loser alliance to loserTo (4-alliance FTC)", () => {
    // FTC 4-alliance, series 1: winnerTo S4 red, loserTo S3 red
    const out = extendFTCPlayoffScheduleWithPartialMatches([makeFtcMatch(1)], 4, true);
    const s3 = out.find((m) => m.series === 3);
    const s4 = out.find((m) => m.series === 4);
    expect(s3).toBeDefined();
    expect(s4).toBeDefined();
    const s4Red = s4.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    const s3Red = s3.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(s4Red).toEqual([100, 101]);
    expect(s3Red).toEqual([200, 201]);
  });

  it("creates downstream matches with predicted start times based on schedule cadence", () => {
    const out = extendFTCPlayoffScheduleWithPartialMatches([makeFtcMatch(1)], 4, true);
    const s4 = out.find((m) => m.series === 4);
    // latest = 10:05; +3 series steps * 6 min = +18 min
    const predicted = new Date(s4.startTime).getTime();
    const baseline = new Date("2025-04-01T10:05:00").getTime() + 3 * 6 * 60 * 1000;
    expect(predicted).toBe(baseline);
    expect(s4.tournamentLevel).toBe("PLAYOFF");
    expect(s4.matchNumber).toBe(1);
  });

  it("does not propagate when the deciding (last) match has no result", () => {
    const undecided = makeFtcMatch(1, {
      scoreRedFinal: null,
      scoreBlueFinal: null,
      redWins: null,
      blueWins: null,
      postResultTime: null,
    });
    const out = extendFTCPlayoffScheduleWithPartialMatches([undecided], 4, true);
    expect(out.map((m) => m.series)).toEqual([1]);
  });

  it("treats redWins=false && blueWins=false as a tie and does not propagate", () => {
    const tie = makeFtcMatch(1, {
      redWins: false,
      blueWins: false,
      scoreRedFinal: 50,
      scoreBlueFinal: 50,
    });
    const out = extendFTCPlayoffScheduleWithPartialMatches([tie], 4, true);
    expect(out.map((m) => m.series)).toEqual([1]);
  });

  it("uses the LAST match in a multi-match series as the deciding match", () => {
    // Series 1 has two matches; the first is a tie (false/false), the last is a red win.
    const tieFirst = makeFtcMatch(1, {
      matchNumber: 1,
      redWins: false,
      blueWins: false,
      scoreRedFinal: 50,
      scoreBlueFinal: 50,
    });
    const redWinLast = makeFtcMatch(1, {
      matchNumber: 2,
      redWins: true,
      blueWins: false,
      scoreRedFinal: 80,
      scoreBlueFinal: 50,
    });
    const out = extendFTCPlayoffScheduleWithPartialMatches([tieFirst, redWinLast], 4, true);
    const s4 = out.find((m) => m.series === 4);
    expect(s4).toBeDefined();
    const s4Red = s4.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(s4Red).toEqual([100, 101]); // red won the last match → propagated
  });

  it("preserves existing downstream matches and only fills missing stations", () => {
    const existingS4 = {
      series: 4,
      matchNumber: 1,
      tournamentLevel: "PLAYOFF",
      description: "Series 4 Match 1",
      teams: [
        { teamNumber: 999, station: "Blue1" },
        { teamNumber: 998, station: "Blue2" },
      ],
    };
    const out = extendFTCPlayoffScheduleWithPartialMatches([makeFtcMatch(1), existingS4], 4, true);
    const s4 = out.find((m) => m.series === 4);
    const blue = s4.teams.filter((t) => t.station.startsWith("Blue")).map((t) => t.teamNumber).sort();
    const red = s4.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(blue).toEqual([998, 999]);
    expect(red).toEqual([100, 101]);
  });

  it("returns matches sorted by (series, matchNumber)", () => {
    const a = makeFtcMatch(1, { matchNumber: 2 });
    const b = makeFtcMatch(1, { matchNumber: 1 });
    const c = makeFtcMatch(2, { matchNumber: 1 });
    const out = extendFTCPlayoffScheduleWithPartialMatches([a, b, c], 4, true);
    const keys = out.map((m) => `${m.series}-${m.matchNumber}`);
    // Series 1 matches must come before series 2; within series 1, match 1 before match 2.
    expect(keys.slice(0, 3)).toEqual(["1-1", "1-2", "2-1"]);
  });

  it("infers 4-alliance shape when allianceCount=6 but the schedule only matches 4-alliance", () => {
    // Schedule shape: series 1, 2, 3, 4 only (max series 4 ≤ 6) → inferred as 4-alliance.
    // With FTC 4-alliance bracket, series 1 propagates to series 4 (winner) and series 3 (loser).
    const out = extendFTCPlayoffScheduleWithPartialMatches(
      [makeFtcMatch(1), makeFtcMatch(2), makeFtcMatch(3), makeFtcMatch(4)],
      6,
      true
    );
    // Series 5 should be created as the finals destination from series 3's loserTo path,
    // proving the 4-alliance bracket was used (6-alliance would not create series 5 the same way).
    expect(out.some((m) => m.series === 5)).toBe(true);
  });

  it("respects originalMatchNumber when picking the last match in a series", () => {
    // matchNumber order is 1, 2, but originalMatchNumber inverts it: the deciding (last) match
    // should be the one with the higher originalMatchNumber (=2), which is a tie → no propagation.
    const a = makeFtcMatch(1, {
      matchNumber: 1,
      originalMatchNumber: 2,
      redWins: false,
      blueWins: false,
      scoreRedFinal: 50,
      scoreBlueFinal: 50,
    });
    const b = makeFtcMatch(1, {
      matchNumber: 2,
      originalMatchNumber: 1,
      redWins: true,
      blueWins: false,
    });
    const out = extendFTCPlayoffScheduleWithPartialMatches([a, b], 4, true);
    expect(out.some((m) => m.series === 4)).toBe(false);
    expect(out.some((m) => m.series === 3)).toBe(false);
  });

  it("uses the scoreRedFinal/scoreBlueFinal fallback when redWins/blueWins are not booleans", () => {
    const m = makeFtcMatch(1, {
      redWins: null,
      blueWins: null,
      scoreRedFinal: 30,
      scoreBlueFinal: 90,
    });
    const out = extendFTCPlayoffScheduleWithPartialMatches([m], 4, true);
    const s4 = out.find((x) => x.series === 4);
    // Blue won by score → propagated to S4 red station
    const s4Red = s4.teams.filter((t) => t.station.startsWith("Red")).map((t) => t.teamNumber).sort();
    expect(s4Red).toEqual([200, 201]);
  });
});
