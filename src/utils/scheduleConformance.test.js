import moment from "moment";
import {
  conformCheesyArenaMatch,
  conformCheesyArenaScores,
  conformCFTCOfflineScheduleMatch,
  conformFTCOfflineScores,
  winner,
} from "./scheduleConformance";

describe("conformCheesyArenaMatch", () => {
  const sampleMatch = {
    LongName: "Qualification 12",
    Time: "2024-03-01T10:00:00Z",
    StartedAt: "2024-03-01T10:01:00Z",
    ScoreCommittedAt: "2024-03-01T10:04:00Z",
    Red1: 100, Red2: 200, Red3: 300,
    Blue1: 400, Blue2: 500, Blue3: 600,
    Red1IsSurrogate: false,
    Red2IsSurrogate: true,
    Red3IsSurrogate: false,
    Blue1IsSurrogate: false,
    Blue2IsSurrogate: false,
    Blue3IsSurrogate: true,
    Result: {
      RedSummary: { Score: 88, FoulPoints: 5, AutoPoints: 20 },
      BlueSummary: { Score: 77, FoulPoints: 0, AutoPoints: 15 },
    },
  };

  it("maps top-level fields, scores, and metadata onto the conformed shape", () => {
    const result = conformCheesyArenaMatch(sampleMatch, "Qualification", 12);
    expect(result.description).toBe("Qualification 12");
    expect(result.tournamentLevel).toBe("Qualification");
    expect(result.matchNumber).toBe(12);
    expect(result.startTime).toBe("2024-03-01T10:00:00Z");
    expect(result.actualStartTime).toBe("2024-03-01T10:01:00Z");
    expect(result.postResultTime).toBe("2024-03-01T10:04:00Z");
    expect(result.scoreRedFinal).toBe(88);
    expect(result.scoreRedFoul).toBe(5);
    expect(result.scoreRedAuto).toBe(20);
    expect(result.scoreBlueFinal).toBe(77);
    expect(result.scoreBlueFoul).toBe(0);
    expect(result.scoreBlueAuto).toBe(15);
    expect(result.winner).toEqual({ winner: "", tieWinner: "", level: 0 });
  });

  it("emits 6 teams in Red1..Blue3 station order with surrogate flags and dq=false", () => {
    const result = conformCheesyArenaMatch(sampleMatch, "Qualification", 1);
    expect(result.teams).toHaveLength(6);
    expect(result.teams.map((t) => t.station)).toEqual([
      "Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3",
    ]);
    expect(result.teams.map((t) => t.teamNumber)).toEqual([
      100, 200, 300, 400, 500, 600,
    ]);
    expect(result.teams[1].surrogate).toBe(true);
    expect(result.teams[5].surrogate).toBe(true);
    expect(result.teams.every((t) => t.dq === false)).toBe(true);
  });

  it("returns undefined fields without throwing when match is null/undefined", () => {
    const result = conformCheesyArenaMatch(undefined, "Practice", 0);
    expect(result.tournamentLevel).toBe("Practice");
    expect(result.matchNumber).toBe(0);
    expect(result.scoreRedFinal).toBeUndefined();
    expect(result.teams).toHaveLength(6);
    expect(result.teams[0].teamNumber).toBeUndefined();
  });
});

describe("conformCheesyArenaScores", () => {
  const baseMatch = (red, blue, extras = {}) => ({
    TbaMatchKey: { MatchNumber: 5 },
    RedSummary: { Score: red, CoopertitionBonus: false },
    BlueSummary: { Score: blue, CoopertitionBonus: false },
    Result: { RedScore: { foo: "r" }, BlueScore: { foo: "b" } },
    ...extras,
  });

  it("sets winningAlliance=1 when red > blue", () => {
    expect(conformCheesyArenaScores(baseMatch(50, 40), "Qualification").winningAlliance).toBe(1);
  });

  it("sets winningAlliance=2 when blue > red", () => {
    expect(conformCheesyArenaScores(baseMatch(20, 30), "Qualification").winningAlliance).toBe(2);
  });

  it("sets winningAlliance=0 on a tie", () => {
    expect(conformCheesyArenaScores(baseMatch(40, 40), "Qualification").winningAlliance).toBe(0);
  });

  it("emits tiebreaker { -1, '' } when UseTiebreakCriteria is falsy", () => {
    const r = conformCheesyArenaScores(baseMatch(10, 10), "Playoff");
    expect(r.tiebreaker).toEqual({ item1: -1, item2: "" });
  });

  it("emits tiebreaker { 1, criteria } when UseTiebreakCriteria is set", () => {
    const r = conformCheesyArenaScores(
      baseMatch(10, 10, { UseTiebreakCriteria: "auto" }),
      "Playoff"
    );
    expect(r.tiebreaker).toEqual({ item1: 1, item2: "auto" });
  });

  it("propagates coopertitionBonusAchieved if either alliance achieved it", () => {
    const r = conformCheesyArenaScores(
      baseMatch(40, 40, {
        RedSummary: { Score: 40, CoopertitionBonus: false },
        BlueSummary: { Score: 40, CoopertitionBonus: true },
      }),
      "Qualification"
    );
    expect(r.coopertitionBonusAchieved).toBe(true);
  });

  it("places blue alliance first in alliances array", () => {
    const r = conformCheesyArenaScores(baseMatch(10, 20), "Qualification");
    expect(r.alliances).toHaveLength(2);
    expect(r.alliances[0].alliance).toBe("Blue");
    expect(r.alliances[1].alliance).toBe("Red");
    expect(r.alliances[0].foo).toBe("b");
    expect(r.alliances[1].foo).toBe("r");
  });

  it("forwards matchNumber and matchLevel", () => {
    const r = conformCheesyArenaScores(baseMatch(1, 2), "Playoff");
    expect(r.matchLevel).toBe("Playoff");
    expect(r.matchNumber).toBe(5);
  });
});

describe("conformCFTCOfflineScheduleMatch", () => {
  const baseMatch = {
    matchName: "Q-3",
    field: 1,
    matchNumber: 3,
    time: "2024-09-01T12:00:00",
    finished: true,
    matchState: "COMMITTED",
    red: { team1: 1111, team2: 2222, isTeam1Surrogate: false, isTeam2Surrogate: true },
    blue: { team1: 3333, team2: 4444, isTeam1Surrogate: true, isTeam2Surrogate: false },
  };

  it("maps schedule fields with formatted timestamps when match is COMMITTED", () => {
    const result = conformCFTCOfflineScheduleMatch(baseMatch, "Qualification");
    const expected = moment(baseMatch.time).format();
    expect(result.description).toBe("Q-3");
    expect(result.matchName).toBe("Q-3");
    expect(result.tournamentLevel).toBe("Qualification");
    expect(result.field).toBe(1);
    expect(result.matchNumber).toBe(3);
    expect(result.startTime).toBe(expected);
    expect(result.actualStartTime).toBe(expected);
    expect(result.postResultTime).toBe(expected);
  });

  it("nulls actualStartTime when not finished and postResultTime when not COMMITTED", () => {
    const result = conformCFTCOfflineScheduleMatch(
      { ...baseMatch, finished: false, matchState: "AUTO" },
      "Qualification"
    );
    expect(result.actualStartTime).toBeNull();
    expect(result.postResultTime).toBeNull();
  });

  it("always nulls scoreXxx fields (filled in by merge with scores endpoint)", () => {
    const result = conformCFTCOfflineScheduleMatch(baseMatch, "Qualification");
    expect(result.scoreRedFinal).toBeNull();
    expect(result.scoreRedFoul).toBeNull();
    expect(result.scoreRedAuto).toBeNull();
    expect(result.scoreBlueFinal).toBeNull();
    expect(result.scoreBlueFoul).toBeNull();
    expect(result.scoreBlueAuto).toBeNull();
  });

  it("emits 4 teams in Red1, Red2, Blue1, Blue2 station order with surrogate flags", () => {
    const result = conformCFTCOfflineScheduleMatch(baseMatch, "Qualification");
    expect(result.teams).toHaveLength(4);
    expect(result.teams.map((t) => t.station)).toEqual(["Red1", "Red2", "Blue1", "Blue2"]);
    expect(result.teams.map((t) => t.teamNumber)).toEqual([1111, 2222, 3333, 4444]);
    expect(result.teams.map((t) => t.surrogate)).toEqual([false, true, true, false]);
    expect(result.teams.every((t) => t.dq === false)).toBe(true);
  });

  it("seeds an empty winner object", () => {
    const result = conformCFTCOfflineScheduleMatch(baseMatch, "Qualification");
    expect(result.winner).toEqual({ winner: "", tieWinner: "", level: 0 });
  });
});

describe("conformFTCOfflineScores", () => {
  const playedMatch = {
    matchBrief: { matchNumber: 7, matchState: "COMMITTED" },
    redScore: 60,
    blueScore: 45,
    red: { auto: 20, penalty: 5, foo: "r" },
    blue: { auto: 15, penalty: 0, foo: "b" },
    startTime: 1700000000000,
    resultPostedTime: 1700000060000,
  };

  it("populates score/auto/penalty fields when not UNPLAYED", () => {
    const r = conformFTCOfflineScores(playedMatch, "Qualification");
    expect(r.matchLevel).toBe("Qualification");
    expect(r.matchNumber).toBe(7);
    expect(r.redScore).toBe(60);
    expect(r.blueScore).toBe(45);
    expect(r.redAuto).toBe(20);
    expect(r.blueAuto).toBe(15);
    expect(r.redPenalty).toBe(5);
    expect(r.bluePenalty).toBe(0);
  });

  it("nulls out score/auto/penalty when matchState is UNPLAYED", () => {
    const r = conformFTCOfflineScores(
      { ...playedMatch, matchBrief: { matchNumber: 7, matchState: "UNPLAYED" } },
      "Qualification"
    );
    expect(r.redScore).toBeNull();
    expect(r.blueScore).toBeNull();
    expect(r.redAuto).toBeNull();
    expect(r.blueAuto).toBeNull();
    expect(r.redPenalty).toBeNull();
    expect(r.bluePenalty).toBeNull();
  });

  it("computes winningAlliance from raw scores (1=red, 2=blue, 0=tie)", () => {
    expect(conformFTCOfflineScores(playedMatch, "Qualification").winningAlliance).toBe(1);
    expect(
      conformFTCOfflineScores({ ...playedMatch, redScore: 10, blueScore: 99 }, "Qualification")
        .winningAlliance
    ).toBe(2);
    expect(
      conformFTCOfflineScores({ ...playedMatch, redScore: 30, blueScore: 30 }, "Qualification")
        .winningAlliance
    ).toBe(0);
  });

  it("uses fixed { -1, '' } tiebreaker and never coopertition", () => {
    const r = conformFTCOfflineScores(playedMatch, "Qualification");
    expect(r.tiebreaker).toEqual({ item1: -1, item2: "" });
    expect(r.coopertitionBonusAchieved).toBe(false);
  });

  it("places blue alliance first in alliances array", () => {
    const r = conformFTCOfflineScores(playedMatch, "Qualification");
    expect(r.alliances[0].alliance).toBe("Blue");
    expect(r.alliances[0].foo).toBe("b");
    expect(r.alliances[1].alliance).toBe("Red");
    expect(r.alliances[1].foo).toBe("r");
  });

  it("formats actualStartTime / postResultTime when timestamps are >= 0", () => {
    const r = conformFTCOfflineScores(playedMatch, "Qualification");
    expect(r.actualStartTime).toBe(moment(playedMatch.startTime).format());
    expect(r.postResultTime).toBe(moment(playedMatch.resultPostedTime).format());
  });

  it("nulls actualStartTime/postResultTime when timestamps are negative", () => {
    const r = conformFTCOfflineScores(
      { ...playedMatch, startTime: -1, resultPostedTime: -1 },
      "Qualification"
    );
    expect(r.actualStartTime).toBeNull();
    expect(r.postResultTime).toBeNull();
  });
});

describe("winner", () => {
  it("returns TBD for an empty match in FRC mode", () => {
    expect(winner({}, false)).toEqual({ winner: "TBD", tieWinner: "", level: 0 });
  });

  it("FTC mode: redWins=true → red", () => {
    expect(winner({ redWins: true, blueWins: false }, true).winner).toBe("red");
  });

  it("FTC mode: blueWins=true → blue", () => {
    expect(winner({ redWins: false, blueWins: true }, true).winner).toBe("blue");
  });

  it("FTC mode: both wins false → tie", () => {
    expect(winner({ redWins: false, blueWins: false }, true).winner).toBe("tie");
  });

  it("FRC mode: redWins=true → red regardless of scores", () => {
    expect(winner({ redWins: true, scoreRedFinal: 1, scoreBlueFinal: 100 }, false).winner).toBe("red");
  });

  it("FRC mode: blueWins=true → blue regardless of scores", () => {
    expect(winner({ blueWins: true, scoreRedFinal: 100, scoreBlueFinal: 1 }, false).winner).toBe("blue");
  });

  it("FRC mode: both wins false → tie", () => {
    expect(winner({ redWins: false, blueWins: false }, false).winner).toBe("tie");
  });

  it("FRC: red score > blue score → red", () => {
    expect(winner({ scoreRedFinal: 75, scoreBlueFinal: 60 }, false).winner).toBe("red");
  });

  it("FRC: blue score > red score → blue", () => {
    expect(winner({ scoreRedFinal: 60, scoreBlueFinal: 75 }, false).winner).toBe("blue");
  });

  it("FRC: equal scores with no winningAlliance → tie", () => {
    expect(winner({ scoreRedFinal: 40, scoreBlueFinal: 40 }, false).winner).toBe("tie");
  });

  it("FRC: tie on points with winningAlliance=1 (tiebreaker) → red", () => {
    expect(
      winner(
        { scoreRedFinal: 40, scoreBlueFinal: 40, scores: { winningAlliance: 1 } },
        false
      ).winner
    ).toBe("red");
  });

  it("FRC: tie on points with winningAlliance=2 (tiebreaker) → blue", () => {
    expect(
      winner(
        { scoreRedFinal: 40, scoreBlueFinal: 40, winningAlliance: 2 },
        false
      ).winner
    ).toBe("blue");
  });

  it("FRC: no scores yet but match committed and winningAlliance set → uses alliance", () => {
    expect(
      winner(
        {
          actualStartTime: "2024-03-01T10:00:00Z",
          WinningAlliance: 1,
        },
        false
      ).winner
    ).toBe("red");
  });

  it("FRC: no scores and no commit/scores object → TBD even with winningAlliance set", () => {
    expect(winner({ winningAlliance: 1 }, false).winner).toBe("TBD");
  });

  it("FRC: no scores and no win flags → TBD", () => {
    expect(winner({}, false).winner).toBe("TBD");
  });

  it("FRC: only red score present (blue missing) leaves winner as the empty initial value", () => {
    // Enters the `scoreRedFinal != null || scoreBlueFinal != null` branch but every
    // comparison against undefined is false, so the seeded winner ("") is returned.
    expect(winner({ scoreRedFinal: 50 }, false).winner).toBe("");
  });

  it("falsy ftcMode (undefined) treated as FRC mode", () => {
    expect(winner({ scoreRedFinal: 30, scoreBlueFinal: 20 }).winner).toBe("red");
  });

  it("FTC mode with neither win flag set falls through to score comparison", () => {
    // First branch only triggers if redWins/blueWins is explicitly true/false
    expect(winner({ scoreRedFinal: 50, scoreBlueFinal: 60 }, true).winner).toBe("blue");
  });

  it("always returns level=0 and tieWinner='' (currently unused)", () => {
    const r = winner({ redWins: true }, false);
    expect(r.level).toBe(0);
    expect(r.tieWinner).toBe("");
  });
});
