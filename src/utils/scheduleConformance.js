import moment from "moment";

/**
 * Conforms a Cheesy Arena match to the internal match representation.
 * @param {object} match Match details from Cheesy Arena
 * @param {string} level Tournament Level (e.g., "Practice", "Qualification", "Playoff")
 * @param {number} index Match index (1-based)
 * @returns {object} Conformed match object
 */
export const conformCheesyArenaMatch = (match, level, index) => {
  return {
    description: match?.LongName,
    tournamentLevel: level,
    matchNumber: index,
    startTime: match?.Time,
    actualStartTime: match?.StartedAt,
    postResultTime: match?.ScoreCommittedAt,
    scoreRedFinal: match?.Result?.RedSummary?.Score,
    scoreRedFoul: match?.Result?.RedSummary?.FoulPoints,
    scoreRedAuto: match?.Result?.RedSummary?.AutoPoints,
    scoreBlueFinal: match?.Result?.BlueSummary?.Score,
    scoreBlueFoul: match?.Result?.BlueSummary?.FoulPoints,
    scoreBlueAuto: match?.Result?.BlueSummary?.AutoPoints,
    teams: [
      {
        teamNumber: match?.Red1,
        station: "Red1",
        surrogate: match?.Red1IsSurrogate,
        dq: !1,
      },
      {
        teamNumber: match?.Red2,
        station: "Red2",
        surrogate: match?.Red2IsSurrogate,
        dq: !1,
      },
      {
        teamNumber: match?.Red3,
        station: "Red3",
        surrogate: match?.Red3IsSurrogate,
        dq: !1,
      },
      {
        teamNumber: match?.Blue1,
        station: "Blue1",
        surrogate: match?.Blue1IsSurrogate,
        dq: !1,
      },
      {
        teamNumber: match?.Blue2,
        station: "Blue2",
        surrogate: match?.Blue2IsSurrogate,
        dq: !1,
      },
      {
        teamNumber: match?.Blue3,
        station: "Blue3",
        surrogate: match?.Blue3IsSurrogate,
        dq: !1,
      },
    ],
    winner: { winner: "", tieWinner: "", level: 0 },
  };
};

/**
 * Conforms Cheesy Arena scores to the internal score representation.
 * @param {object} match Match details from Cheesy Arena
 * @param {string} level Tournament Level
 * @returns {object} Conformed score object
 */
export const conformCheesyArenaScores = (match, level) => {
  return {
    matchLevel: level,
    matchNumber: match?.TbaMatchKey?.MatchNumber,
    winningAlliance:
      match?.RedSummary?.Score > match?.BlueSummary?.Score
        ? 1
        : match?.RedSummary?.Score < match?.BlueSummary?.Score
          ? 2
          : 0,
    tiebreaker: {
      item1: !match?.UseTiebreakCriteria ? -1 : 1,
      item2: match?.UseTiebreakCriteria ? match?.UseTiebreakCriteria : "",
    },
    coopertitionBonusAchieved:
      match?.RedSummary?.CoopertitionBonus ||
      match?.BlueSummary?.CoopertitionBonus,
    alliances: [
      { ...match?.Result?.BlueScore, alliance: "Blue" },
      { ...match?.Result?.RedScore, alliance: "Red" },
    ],
  };
};

/**
 * Conforms an FTC Offline Server match to the internal match representation.
 * Should be merged with /events/{{eventName}}/matches/{{matchNumber}} for full schedule.
 * @param {object} match Match details from FTC Server
 * @param {string} level Tournament Level
 * @returns {object} Conformed match object
 */
// eslint-disable-next-line
// @ts-ignore
export const conformCFTCOfflineScheduleMatch = (match, level) => {
  return {
    description: match?.matchName,
    matchName: match?.matchName,
    tournamentLevel: level,
    field: match?.field,
    matchNumber: match?.matchNumber,
    startTime: moment(match?.time).format(),
    actualStartTime: match?.finished ? moment(match?.time).format() : null,
    postResultTime:
      match?.matchState === "COMMITTED" ? moment(match?.time).format() : null,
    scoreRedFinal: null,
    scoreRedFoul: null,
    scoreRedAuto: null,
    scoreBlueFinal: null,
    scoreBlueFoul: null,
    scoreBlueAuto: null,
    teams: [
      {
        teamNumber: match?.red?.team1,
        station: "Red1",
        surrogate: match?.red?.isTeam1Surrogate,
        dq: !1,
      },
      {
        teamNumber: match?.red?.team2,
        station: "Red2",
        surrogate: match?.red?.isTeam2Surrogate,
        dq: !1,
      },
      {
        teamNumber: match?.blue?.team1,
        station: "Blue1",
        surrogate: match?.blue?.isTeam1Surrogate,
        dq: !1,
      },
      {
        teamNumber: match?.blue?.team2,
        station: "Blue2",
        surrogate: match?.blue?.isTeam2Surrogate,
        dq: !1,
      },
    ],
    winner: { winner: "", tieWinner: "", level: 0 },
  };
};

/**
 * Conforms FTC Offline Server scores to the internal score representation.
 * Use to conform match scores from /api/2025/v1/events/{code}/matches/{match}/
 * which contain technical details of the match.
 * @param {object} match Match details from FTC Server
 * @param {string} level Tournament Level
 * @returns {object} Conformed score object
 */
// eslint-disable-next-line
// @ts-ignore
export const conformFTCOfflineScores = (match, level) => {
  return {
    matchLevel: level,
    matchNumber: match?.matchBrief?.matchNumber,
    redScore:
      match?.matchBrief?.matchState !== "UNPLAYED" ? match?.redScore : null,
    blueScore:
      match?.matchBrief?.matchState !== "UNPLAYED" ? match?.blueScore : null,
    redAuto:
      match?.matchBrief?.matchState !== "UNPLAYED" ? match?.red?.auto : null,
    blueAuto:
      match?.matchBrief?.matchState !== "UNPLAYED" ? match?.blue?.auto : null,
    redPenalty:
      match?.matchBrief?.matchState !== "UNPLAYED"
        ? match?.red?.penalty
        : null,
    bluePenalty:
      match?.matchBrief?.matchState !== "UNPLAYED"
        ? match?.blue?.penalty
        : null,
    winningAlliance:
      match?.redScore > match?.blueScore
        ? 1
        : match?.redScore < match?.blueScore
          ? 2
          : 0,
    tiebreaker: {
      item1: -1, // Fix for Elims in FTC Server
      item2: "",
    },
    coopertitionBonusAchieved: false, // no coopertition in FTC
    alliances: [
      { ...match?.blue, alliance: "Blue" },
      { ...match?.red, alliance: "Red" },
    ],
    actualStartTime:
      match.startTime >= 0 ? moment(match?.startTime).format() : null,
    postResultTime:
      match?.resultPostedTime >= 0
        ? moment(match?.resultPostedTime).format()
        : null,
  };
};

/**
 * Returns the winner of a match.
 * @function winner
 * @param {object} match - The match to test
 * @param {object} ftcMode - FTC mode flag (truthy = FTC scoring, falsy = FRC scoring)
 * @returns {object} Object containing the winning alliance, and in the event of a tie, the tiebreaker level.
 */
export function winner(match, ftcMode) {
  var result = { winner: "", tieWinner: "", level: 0 };
  if (
    ftcMode &&
    (match?.redWins === true ||
      match?.blueWins === true ||
      match?.redWins === false ||
      match?.blueWins === false)
  ) {
    if (match?.redWins === true) result.winner = "red";
    else if (match?.blueWins === true) result.winner = "blue";
    else if (match?.redWins === false && match?.blueWins === false) {
      result.winner = "tie";
    } else result.winner = "TBD";
    return result;
  }
  if (match?.redWins === true) {
    result.winner = "red";
    return result;
  }
  if (match?.blueWins === true) {
    result.winner = "blue";
    return result;
  }
  if (match?.redWins === false && match?.blueWins === false) {
    result.winner = "tie";
    return result;
  }
  if (!ftcMode) {
    const wa =
      match?.scores?.winningAlliance ??
      match?.winningAlliance ??
      match?.WinningAlliance;
    const r = match?.scoreRedFinal;
    const b = match?.scoreBlueFinal;
    const hasScores = r != null && b != null;
    const tieOnPoints = hasScores && Number(r) === Number(b);
    const committed =
      (match?.actualStartTime != null && match?.actualStartTime !== "") ||
      (match?.postResultTime != null && match?.postResultTime !== "");
    if (wa === 1 || wa === 2) {
      if (
        tieOnPoints ||
        (!hasScores && (committed || match?.scores))
      ) {
        result.winner = wa === 1 ? "red" : "blue";
        return result;
      }
    }
  }
  if (match?.scoreRedFinal != null || match?.scoreBlueFinal != null) {
    if (match?.scoreRedFinal < match?.scoreBlueFinal) {
      result.winner = "blue";
    } else if (match?.scoreRedFinal > match?.scoreBlueFinal) {
      result.winner = "red";
    } else if (match?.scoreRedFinal === match?.scoreBlueFinal) {
      result.winner = "tie";
    }
  } else {
    result.winner = "TBD";
  }

  return result;
}
