import _ from "lodash";
import { matchClassesBase } from "../data/matchClasses";

/**
 * @param {object} match
 * @returns {boolean}
 */
function frcMatchHasResultSignal(match) {
  if (!match || typeof match !== "object") return false;
  if (match.redWins === true || match.blueWins === true) return true;
  if (match.redWins === false && match.blueWins === false) return true;
  if (match.postResultTime != null && match.postResultTime !== "") return true;
  const r = match.scoreRedFinal;
  const b = match.scoreBlueFinal;
  if (r != null && b != null) return true;
  const wa = match?.scores?.winningAlliance ?? match?.winningAlliance ?? match?.WinningAlliance;
  if (wa === 1 || wa === 2) {
    const committed =
      (match.actualStartTime != null && match.actualStartTime !== "") ||
      (match.postResultTime != null && match.postResultTime !== "");
    if (committed || match?.scores) return true;
  }
  return false;
}

/**
 * @param {object} match
 * @returns {"red"|"blue"|null}
 */
function getFrcPropagationWinnerColor(match) {
  if (!match) return null;
  const w = match.winner;
  if (w?.tieWinner === "red" || w?.tieWinner === "blue") return w.tieWinner;
  if (w?.winner === "red" || w?.winner === "blue") return w.winner;
  if (match.redWins === true) return "red";
  if (match.blueWins === true) return "blue";
  if (match.redWins === false && match.blueWins === false) return null;
  const r = match.scoreRedFinal;
  const b = match.scoreBlueFinal;
  if (r != null && b != null) {
    const rn = Number(r);
    const bn = Number(b);
    if (!Number.isNaN(rn) && !Number.isNaN(bn)) {
      if (rn > bn) return "red";
      if (bn > rn) return "blue";
    }
  }
  const wa = match?.scores?.winningAlliance ?? match?.winningAlliance ?? match?.WinningAlliance;
  if (wa === 1) return "red";
  if (wa === 2) return "blue";
  return null;
}

function getTeamsForAlliance(match, alliance) {
  if (!match?.teams || !Array.isArray(match.teams)) return [];
  const prefix = alliance === "red" ? "Red" : "Blue";
  return match.teams
    .filter((t) => t?.station?.startsWith(prefix))
    .map((t) => ({ ...t }));
}

/**
 * Fills Red1–Red3 or Blue1–Blue3 from alliance team rows (FRC triples).
 * @param {object} targetMatch
 * @param {"red"|"blue"} station
 * @param {Array<object>} teamEntries
 */
function setTeamsForStationFrc(targetMatch, station, teamEntries) {
  if (!targetMatch.teams) targetMatch.teams = [];
  const prefix = station === "red" ? "Red" : "Blue";
  targetMatch.teams = targetMatch.teams.filter(
    (t) => !t?.station?.startsWith(prefix)
  );
  const max = Math.min(teamEntries.length, 3);
  for (let i = 0; i < max; i++) {
    targetMatch.teams.push({
      ..._.cloneDeep(teamEntries[i]),
      station: `${prefix}${i + 1}`,
    });
  }
}

function getMatchClassesForFrcBracket(allianceCount) {
  const base = matchClassesBase;
  if (allianceCount === 8) return _.cloneDeep(base.eightAlliance);
  if (allianceCount === 6) return _.cloneDeep(base.sixAlliance);
  if (allianceCount === 4) return _.cloneDeep(base.fourAlliance);
  return null;
}

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

const DEFAULT_MATCH_INTERVAL_MINUTES = 7;

function getPredictedStartTime(schedule, targetMatchNumber, intervalMinutes = DEFAULT_MATCH_INTERVAL_MINUTES) {
  const maxNum = Math.max(...schedule.map((m) => m.matchNumber ?? 0), 0);
  if (targetMatchNumber <= maxNum) return null;
  const latestMs = getLatestScheduleTimeMs(schedule);
  if (latestMs == null) return null;
  const steps = targetMatchNumber - maxNum;
  const predictedMs = latestMs + steps * intervalMinutes * 60 * 1000;
  return new Date(predictedMs).toISOString();
}

/**
 * @param {Record<number, object>} byMatchNumber
 * @param {number} matchNumber
 * @param {Array<object>} matchClasses
 * @param {string|null} predictedStartTime
 */
function ensureFrcMatch(byMatchNumber, matchNumber, matchClasses, predictedStartTime = null) {
  if (byMatchNumber[matchNumber]) return byMatchNumber[matchNumber];
  const matchClass = matchClasses.find((mc) => mc.matchNumber === matchNumber);
  const newMatch = {
    description: matchClass?.description || `Match ${matchNumber}`,
    tournamentLevel: "PLAYOFF",
    matchNumber,
    startTime: predictedStartTime ?? null,
    actualStartTime: null,
    postResultTime: null,
    scoreRedFinal: null,
    scoreBlueFinal: null,
    redWins: null,
    blueWins: null,
    teams: [],
    winner: { winner: "", tieWinner: "", level: 0 },
  };
  byMatchNumber[matchNumber] = newMatch;
  return newMatch;
}

/**
 * Like FTC `extendFTCPlayoffScheduleWithPartialMatches`, but for FRC playoff match numbers (no `series`).
 * Propagates winners/losers from decided matches into downstream bracket slots when the API has not yet
 * populated those rows.
 *
 * @param {Array<object>} schedule
 * @param {number} allianceCount 4, 6, or 8
 * @returns {Array<object>}
 */
export function extendFRCPlayoffScheduleWithPartialMatches(schedule, allianceCount) {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return schedule;
  }

  const matchClasses = getMatchClassesForFrcBracket(allianceCount);
  if (!matchClasses || matchClasses.length === 0) return schedule;

  const byMatchNumber = {};
  for (const m of schedule) {
    const n = m?.matchNumber;
    if (n == null) continue;
    if (!byMatchNumber[n]) {
      byMatchNumber[n] = m;
    }
  }

  const flatSchedule = () =>
    _.sortBy(
      Object.values(byMatchNumber),
      (x) => x.matchNumber ?? 0
    );

  for (const mc of matchClasses) {
    const src = byMatchNumber[mc.matchNumber];
    if (!src || !frcMatchHasResultSignal(src)) continue;
    const winnerColor = getFrcPropagationWinnerColor(src);
    if (!winnerColor) continue;
    const loserColor = winnerColor === "red" ? "blue" : "red";
    const winnerTeams = getTeamsForAlliance(src, winnerColor);
    const loserTeams = getTeamsForAlliance(src, loserColor);
    if (winnerTeams.length === 0 && loserTeams.length === 0) continue;

    const schedSnapshot = flatSchedule();

    if (mc.winnerTo?.matchNumber != null && mc.winnerTo?.station && winnerTeams.length > 0) {
      const targetNum = mc.winnerTo.matchNumber;
      const predicted = getPredictedStartTime(schedSnapshot, targetNum);
      const target = ensureFrcMatch(byMatchNumber, targetNum, matchClasses, predicted);
      setTeamsForStationFrc(target, mc.winnerTo.station.toLowerCase(), winnerTeams);
    }

    if (mc.loserTo?.matchNumber != null && mc.loserTo?.station && loserTeams.length > 0) {
      const targetNum = mc.loserTo.matchNumber;
      const predicted = getPredictedStartTime(flatSchedule(), targetNum);
      const target = ensureFrcMatch(byMatchNumber, targetNum, matchClasses, predicted);
      setTeamsForStationFrc(target, mc.loserTo.station.toLowerCase(), loserTeams);
    }
  }

  return flatSchedule();
}

/**
 * True when we should treat a playoff match as "decided enough" to drive bracket/schedule styling.
 * @param {object} m
 */
export function playoffMatchHasDisplayableResult(m) {
  if (!m || typeof m !== "object") return false;
  if (m.actualStartTime != null && m.actualStartTime !== "") return true;
  if (m.postResultTime != null && m.postResultTime !== "") return true;
  const w = m.winner;
  if (w?.winner === "red" || w?.winner === "blue") return true;
  if (w?.tieWinner === "red" || w?.tieWinner === "blue") return true;
  if (m.redWins === true || m.blueWins === true) return true;
  return false;
}

/**
 * @param {object} match
 * @param {boolean} ftcMode
 * @returns {{ redStyle: string, blueStyle: string, winnerStyle: string }}
 */
export function getPlayoffScheduleRowStyles(match, ftcMode) {
  let redStyle = "red";
  let blueStyle = "blue";
  let winnerStyle = "tie";

  const w = match?.winner;
  const winnerSide =
    w?.tieWinner === "red" || w?.tieWinner === "blue"
      ? w.tieWinner
      : w?.winner === "red" || w?.winner === "blue"
        ? w.winner
        : null;

  if (winnerSide === "red") {
    redStyle += " bold";
    winnerStyle = "red";
  } else if (winnerSide === "blue") {
    blueStyle += " bold";
    winnerStyle = "blue";
  } else if (!ftcMode) {
    if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
      redStyle += " bold";
      winnerStyle = "red";
    } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
      blueStyle += " bold";
      winnerStyle = "blue";
    }
  } else {
    if (Number(match.scoreRedFinal) > Number(match.scoreBlueFinal)) {
      redStyle += " bold";
      winnerStyle = "red";
    } else if (Number(match.scoreBlueFinal) > Number(match.scoreRedFinal)) {
      blueStyle += " bold";
      winnerStyle = "blue";
    }
  }

  return { redStyle, blueStyle, winnerStyle };
}
