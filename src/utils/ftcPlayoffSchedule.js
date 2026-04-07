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
 * Infer FTC alliance count from schedule when it clearly matches 4-alliance bracket:
 * two round-1 series (1, 2), then lower/upper round 2 (3, 4), then finals buildup (5, 6).
 * Used when app default is 6 but schedule shape indicates 4-alliance (e.g. no teamList yet).
 * @param {Array<object>} schedule - Playoff schedule with series numbers
 * @returns {number|null} 4 if schedule looks like 4-alliance, else null
 */
function inferAllianceCountFromSchedule(schedule) {
  if (!schedule?.length) return null;
  const seriesNumbers = _.uniq(schedule.map((m) => m.series).filter((s) => s != null));
  const maxSeries = Math.max(...seriesNumbers, 0);
  const hasSeries1And2 = seriesNumbers.includes(1) && seriesNumbers.includes(2);
  const hasSeries4 = seriesNumbers.includes(4);
  // 4-alliance: round 1 = series 1, 2; round 2 = 3, 4; then 5, 6 (finals). Use maxSeries <= 6 to avoid confusing with 6-alliance or tiebreakers.
  if (hasSeries1And2 && hasSeries4 && maxSeries <= 6) return 4;
  return null;
}

/** Typical minutes between FTC playoff matches for predicted start time */
const DEFAULT_MATCH_INTERVAL_MINUTES = 6;

/**
 * Get the latest timestamp from the schedule (startTime, actualStartTime, or postResultTime).
 * @param {Array<object>} schedule - Matches with optional time fields
 * @returns {number|null} Latest time as ms since epoch, or null
 */
function getLatestScheduleTimeMs(schedule) {
  let latest = null;
  schedule.forEach((m) => {
    for (const key of ["postResultTime", "actualStartTime", "startTime"]) {
      const v = m?.[key];
      if (v != null && v !== "") {
        const ms = new Date(v).getTime();
        if (!Number.isNaN(ms) && (latest == null || ms > latest)) latest = ms;
      }
    }
  });
  return latest;
}

/**
 * Predict start time for a new match in a series that comes after the existing schedule.
 * @param {Array<object>} schedule - Original schedule (with series numbers and times)
 * @param {number} targetSeries - Series number of the new match
 * @param {number} intervalMinutes - Minutes to add per series step
 * @returns {string|null} ISO start time string or null
 */
function getPredictedStartTime(schedule, targetSeries, intervalMinutes = DEFAULT_MATCH_INTERVAL_MINUTES) {
  const maxSeriesInSchedule = Math.max(...schedule.map((m) => m.series ?? 0), 0);
  if (targetSeries <= maxSeriesInSchedule) return null;
  const latestMs = getLatestScheduleTimeMs(schedule);
  if (latestMs == null) return null;
  const steps = targetSeries - maxSeriesInSchedule;
  const predictedMs = latestMs + steps * intervalMinutes * 60 * 1000;
  return new Date(predictedMs).toISOString();
}

/**
 * Ensures there is at least one match for the given series in bySeries; if not, creates
 * one partial match and adds it. Returns the first match for that series.
 * @param {object} bySeries - Map series number -> array of matches (mutated)
 * @param {number} targetSeries - Series number
 * @param {Array<object>} matchClasses - Bracket match classes
 * @param {string|null} predictedStartTime - Optional ISO start time for new match
 */
function ensureMatchForSeries(bySeries, targetSeries, matchClasses, predictedStartTime = null) {
  let arr = bySeries[targetSeries];
  if (arr && arr.length > 0) return arr[0];
  const matchClass = matchClasses.find((mc) => mc.matchNumber === targetSeries);
  const newMatch = {
    description: matchClass?.description || `Series ${targetSeries} Match 1`,
    tournamentLevel: "PLAYOFF",
    series: targetSeries,
    matchNumber: 1,
    startTime: predictedStartTime ?? null,
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

  // If app defaulted to 6-alliance (e.g. no teamList yet), infer 4-alliance from schedule shape so we propagate to finals (series 6) correctly
  let effectiveAllianceCount = allianceCount;
  if (allianceCount === 6 && inferAllianceCountFromSchedule(schedule) === 4) {
    effectiveAllianceCount = 4;
  }

  const matchClasses = getMatchClassesForBracket(effectiveAllianceCount, ftcMode);
  if (!matchClasses || matchClasses.length === 0) return schedule;

  // Map: series number -> array of matches (only from existing schedule; we add matches only when propagating)
  const bySeries = _.groupBy(schedule, "series");

  // Only propagate from a series when the *last* match in that series has a result (decides the outcome).
  // Multiple matches in a series indicate ties/tiebreakers; we don't know the winner until the last match is played.
  const seriesNumbersWithMatches = _.keys(bySeries)
    .map(Number)
    .filter((s) => bySeries[s]?.length > 0)
    .sort((a, b) => a - b);

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

    // Propagate winner to winnerTo (create target series match if not present – e.g. Series 5 when API only has 1–4)
    if (mc.winnerTo?.matchNumber != null && mc.winnerTo?.station && winnerTeams.length > 0) {
      const targetSeries = mc.winnerTo.matchNumber;
      const targetStation = mc.winnerTo.station.toLowerCase();
      const predictedStartTime = getPredictedStartTime(schedule, targetSeries);
      const targetMatch = ensureMatchForSeries(bySeries, targetSeries, matchClasses, predictedStartTime);
      setTeamsForStation(targetMatch, targetStation, winnerTeams);
    }

    // Propagate loser to loserTo
    if (mc.loserTo?.matchNumber != null && mc.loserTo?.station && loserTeams.length > 0) {
      const targetSeries = mc.loserTo.matchNumber;
      const targetStation = mc.loserTo.station.toLowerCase();
      const predictedStartTime = getPredictedStartTime(schedule, targetSeries);
      const targetMatch = ensureMatchForSeries(bySeries, targetSeries, matchClasses, predictedStartTime);
      setTeamsForStation(targetMatch, targetStation, loserTeams);
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
