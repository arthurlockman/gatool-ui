import _ from "lodash";
import { matchClassesBase } from "../components/Constants";

/**
 * Returns whether a playoff match has a known result (completed).
 * @param {object} match - Playoff match object
 * @returns {boolean}
 */
function matchHasResult(match) {
  return (
    match?.scoreRedFinal != null ||
    match?.scoreBlueFinal != null ||
    match?.redWins != null ||
    match?.blueWins != null
  );
}

/**
 * Returns the winning alliance color for a completed match ("red" or "blue").
 * Returns null if no result, or if tied (series may have more matches / tiebreakers).
 * In FTC data a tie is indicated by both redWins and blueWins being false.
 * @param {object} match - Playoff match with scores
 * @returns {"red"|"blue"|null}
 */
function getMatchWinner(match) {
  if (!matchHasResult(match)) return null;
  // Tie: FTC API sets both redWins and blueWins to false when the match is tied
  if (match?.redWins === false && match?.blueWins === false) return null;
  if (match?.redWins === true) return "red";
  if (match?.blueWins === true) return "blue";
  // Fallback to scores if redWins/blueWins not set
  const red = match?.scoreRedFinal ?? 0;
  const blue = match?.scoreBlueFinal ?? 0;
  if (red > blue) return "red";
  if (blue > red) return "blue";
  return null; // tie – outcome not decided; may be a tiebreaker next
}

/**
 * Gets team entries for an alliance (red or blue) from a match.
 * FTC: Red1, Red2 or Blue1, Blue2.
 * @param {object} match - Match with teams array
 * @param {"red"|"blue"} alliance
 * @returns {Array<object>} Team objects with station, teamNumber, etc.
 */
function getTeamsForAlliance(match, alliance) {
  if (!match?.teams || !Array.isArray(match.teams)) return [];
  const prefix = alliance === "red" ? "Red" : "Blue";
  return match.teams
    .filter((t) => t?.station?.startsWith(prefix))
    .map((t) => ({ ...t }));
}

/**
 * Assigns team entries to a match at the given station (red or blue).
 * Mutates match.teams: adds or replaces Red1/Red2 or Blue1/Blue2.
 * @param {object} targetMatch - Match to update (must have teams array)
 * @param {"red"|"blue"} station - Target station color
 * @param {Array<object>} teamEntries - Team objects (will be cloned with new station)
 */
function setTeamsForStation(targetMatch, station, teamEntries) {
  if (!targetMatch.teams) targetMatch.teams = [];
  const prefix = station === "red" ? "Red" : "Blue";
  const positions = teamEntries.length >= 2 ? ["1", "2"] : ["1"];
  // Remove existing teams at this station
  targetMatch.teams = targetMatch.teams.filter(
    (t) => !t?.station?.startsWith(prefix)
  );
  teamEntries.slice(0, 2).forEach((entry, i) => {
    targetMatch.teams.push({
      ..._.cloneDeep(entry),
      station: `${prefix}${positions[i] || i + 1}`,
    });
  });
}

/**
 * Get matchClasses array for the given alliance count and FTC mode.
 * @param {number} allianceCount - 2, 4, 6, or 8
 * @param {boolean} ftcMode
 * @returns {Array<object>}
 */
function getMatchClassesForBracket(allianceCount, ftcMode) {
  const base = matchClassesBase;
  if (allianceCount === 8) return _.cloneDeep(base.eightAlliance);
  if (allianceCount === 6) return _.cloneDeep(base.sixAlliance);
  if (allianceCount === 4) return _.cloneDeep(ftcMode ? base.fourAllianceFTC : base.fourAlliance);
  return null;
}

/**
 * Ensures there is at least one match for the given series in bySeries; if not, creates
 * one partial match and adds it. Returns the first match for that series.
 * @param {object} bySeries - Map series number -> array of matches (mutated)
 * @param {number} targetSeries - Series number
 * @param {Array<object>} matchClasses - Bracket match classes
 */
function ensureMatchForSeries(bySeries, targetSeries, matchClasses) {
  let arr = bySeries[targetSeries];
  if (arr && arr.length > 0) return arr[0];
  const matchClass = matchClasses.find((mc) => mc.matchNumber === targetSeries);
  const newMatch = {
    description: matchClass?.description || `Series ${targetSeries} Match 1`,
    tournamentLevel: "PLAYOFF",
    series: targetSeries,
    matchNumber: 1,
    startTime: null,
    actualStartTime: null,
    postResultTime: null,
    scoreRedFinal: null,
    scoreBlueFinal: null,
    redWins: null,
    blueWins: null,
    teams: [],
  };
  bySeries[targetSeries] = [newMatch];
  return newMatch;
}

/**
 * Extends an FTC playoff schedule with partially populated matches by propagating
 * winners and losers from completed matches to downstream bracket positions
 * using the bracket's matchClasses (winnerTo / loserTo).
 *
 * - Preserves all existing schedule matches.
 * - Only adds a new match when an alliance advances to a series that is not yet
 *   in the schedule (i.e. we do not add empty placeholder matches for every series).
 * - For each completed match, fills in the winner at winnerTo and loser at loserTo;
 *   if that target series is missing, one match is created for it with only that
 *   station filled.
 *
 * @param {Array<object>} schedule - Playoff schedule array (each match has series, teams, etc.)
 * @param {number} allianceCount - 4, 6, or 8
 * @param {boolean} ftcMode - Use FTC bracket (e.g. fourAllianceFTC for 4-alliance)
 * @returns {Array<object>} Schedule with existing matches plus any new partial matches, sorted by (series, matchNumber)
 */
export function extendFTCPlayoffScheduleWithPartialMatches(
  schedule,
  allianceCount,
  ftcMode = true
) {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return schedule;
  }

  const matchClasses = getMatchClassesForBracket(allianceCount, ftcMode);
  if (!matchClasses || matchClasses.length === 0) return schedule;

  // Map: series number -> array of matches (only from existing schedule; we add matches only when propagating)
  const bySeries = _.groupBy(schedule, "series");

  // Do not add matches for series beyond the maximum in the original schedule (e.g. 4-alliance FTC has series 1–7; no series 8).
  const maxSeriesInSchedule = Math.max(...schedule.map((m) => m.series ?? 0), 0);

  // Only propagate from a series when the *last* match in that series has a result (decides the outcome).
  // Multiple matches in a series indicate ties/tiebreakers; we don't know the winner until the last match is played.
  const seriesNumbersWithMatches = _.keys(bySeries).map(Number).filter((s) => bySeries[s]?.length > 0);

  for (const seriesNum of seriesNumbersWithMatches) {
    const matchesInSeries = bySeries[seriesNum];
    const lastMatchInSeries = _.maxBy(
      matchesInSeries,
      (m) => m.originalMatchNumber ?? m.matchNumber ?? 0
    );
    if (!lastMatchInSeries) continue;

    // Series outcome is known only when the last (deciding) match has a result and is not a tie
    if (!matchHasResult(lastMatchInSeries)) continue;
    const winnerColor = getMatchWinner(lastMatchInSeries);
    if (!winnerColor) continue; // tie in last match – outcome not decided
    const loserColor = winnerColor === "red" ? "blue" : "red";

    const mc = matchClasses.find((m) => m.matchNumber === seriesNum);
    if (!mc) continue;

    const winnerTeams = getTeamsForAlliance(lastMatchInSeries, winnerColor);
    const loserTeams = getTeamsForAlliance(lastMatchInSeries, loserColor);
    if (winnerTeams.length === 0 && loserTeams.length === 0) continue;

    // Propagate winner to winnerTo. Do not create a new match for series beyond max in schedule (avoids extra finals tiebreaker slot when API only has 1–7).
    if (mc.winnerTo?.matchNumber != null && mc.winnerTo?.station && winnerTeams.length > 0) {
      const targetSeries = mc.winnerTo.matchNumber;
      const mayCreate = targetSeries <= maxSeriesInSchedule || (bySeries[targetSeries]?.length > 0);
      if (mayCreate) {
        const targetStation = mc.winnerTo.station.toLowerCase();
        const targetMatch = ensureMatchForSeries(bySeries, targetSeries, matchClasses);
        setTeamsForStation(targetMatch, targetStation, winnerTeams);
      }
    }

    // Propagate loser to loserTo (same: do not create series beyond max in schedule)
    if (mc.loserTo?.matchNumber != null && mc.loserTo?.station && loserTeams.length > 0) {
      const targetSeries = mc.loserTo.matchNumber;
      const mayCreate = targetSeries <= maxSeriesInSchedule || (bySeries[targetSeries]?.length > 0);
      if (mayCreate) {
        const targetStation = mc.loserTo.station.toLowerCase();
        const targetMatch = ensureMatchForSeries(bySeries, targetSeries, matchClasses);
        setTeamsForStation(targetMatch, targetStation, loserTeams);
      }
    }
  }

  // Flatten: all series that have matches (existing + any we added), sorted by series then matchNumber
  const seriesNumbers = _.keys(bySeries).map(Number).sort((a, b) => a - b);
  const result = [];
  for (const s of seriesNumbers) {
    const arr = bySeries[s];
    if (arr && arr.length > 0) {
      const sorted = _.sortBy(arr, (m) => m.originalMatchNumber ?? m.matchNumber ?? 0);
      result.push(...sorted);
    }
  }

  return result;
}
