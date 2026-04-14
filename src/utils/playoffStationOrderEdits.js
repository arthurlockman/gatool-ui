import _ from "lodash";
import { normalizeFtcHybridTeamEntry } from "./ftcHybridMatchTeams";

/**
 * Stable key for persisted station-order overrides (per event, per match).
 * @param {object} match Schedule row
 * @param {boolean} ftcMode
 * @returns {string|null}
 */
export function getPlayoffStationOrderMatchKey(match, ftcMode) {
  if (!match || typeof match !== "object") return null;
  const tl = String(match.tournamentLevel ?? "").toLowerCase();
  if (tl !== "playoff") return null;
  if (ftcMode) {
    const ser = match.series ?? "";
    const num = match.originalMatchNumber ?? match.matchNumber;
    if (num == null || num === "") return null;
    return `ftc:${ser}:${num}`;
  }
  if (match.matchNumber == null || match.matchNumber === "") return null;
  return `frc:${match.matchNumber}`;
}

/** Sort key for Red1 / Blue3 style station strings (exported for station-order UI). */
export function stationOrderRank(station) {
  const m = String(station || "").match(/^([A-Za-z]+)(\d+)$/);
  if (!m) return 99;
  const n = parseInt(m[2], 10);
  return Number.isNaN(n) ? 99 : n;
}

/**
 * Canonical Red1 / Blue3 casing for schedule rows (hybrid feeds sometimes use red1 / RED2).
 * Non-matching strings are returned unchanged.
 * @param {string|null|undefined} station
 * @returns {string}
 */
export function canonicalAllianceStation(station) {
  if (station == null || station === "") return "";
  const s = String(station).trim();
  const m = s.match(/^(red|blue)(\d+)$/i);
  if (!m) return s;
  const color = m[1].toLowerCase() === "red" ? "Red" : "Blue";
  return `${color}${m[2]}`;
}

/**
 * Canonical stations + `teamNumber` from `team` / `TeamId` / etc. (hybrid payloads differ from training JSON).
 */
function teamsWithCanonicalStations(teams) {
  const list = Array.isArray(teams) ? teams : [];
  return list.map((t) => {
    const n = normalizeFtcHybridTeamEntry(t);
    return {
      ...n,
      station: canonicalAllianceStation(n?.station),
    };
  });
}

/**
 * Split match.teams into red field, blue field, and any other rows.
 * @param {Array<object>|undefined} teams
 */
export function partitionMatchTeamsByAllianceColor(teams) {
  const list = Array.isArray(teams) ? teams : [];
  const red = list
    .filter((t) => String(t?.station || "").startsWith("Red"))
    .sort((a, b) => stationOrderRank(a.station) - stationOrderRank(b.station));
  const blue = list
    .filter((t) => String(t?.station || "").startsWith("Blue"))
    .sort((a, b) => stationOrderRank(a.station) - stationOrderRank(b.station));
  const rest = list.filter((t) => {
    const s = String(t?.station || "");
    return !s.startsWith("Red") && !s.startsWith("Blue");
  });
  return { red, blue, rest };
}

/**
 * Only Red1–Red3 / Blue1–Blue3 (same scope as station-order modal and rebundle output).
 * Used so multiset checks ignore Red4/Blue4 and other extra alliance station rows on the schedule.
 */
export function partitionPlayoffMainFieldStations(teams) {
  const list = Array.isArray(teams) ? teams : [];
  const red = list
    .filter((t) => /^Red[123]$/i.test(String(t?.station || "")))
    .sort((a, b) => stationOrderRank(a.station) - stationOrderRank(b.station));
  const blue = list
    .filter((t) => /^Blue[123]$/i.test(String(t?.station || "")))
    .sort((a, b) => stationOrderRank(a.station) - stationOrderRank(b.station));
  return { red, blue };
}

/**
 * Build full teams array from ordered red/blue field rows and leftover rows.
 */
export function rebundleMatchTeamsAfterReorder(redOrdered, blueOrdered, rest) {
  const out = [];
  (redOrdered || []).forEach((t, i) => {
    out.push({
      ..._.cloneDeep(t),
      station: `Red${i + 1}`,
    });
  });
  (blueOrdered || []).forEach((t, i) => {
    out.push({
      ..._.cloneDeep(t),
      station: `Blue${i + 1}`,
    });
  });
  (rest || []).forEach((t) => out.push(_.cloneDeep(t)));
  return out;
}

/**
 * Merge persisted station order into a playoff match for display.
 * When a stored entry exists for this event + match key, it is applied (Reset clears bad data).
 *
 * @param {object|null|undefined} match
 * @param {string|null|undefined} eventCode
 * @param {Record<string, Record<string, { teams: object[] }>>|null|undefined} editsRoot
 * @param {boolean} ftcMode
 * @returns {object|null|undefined}
 */
export function applyPlayoffStationOrderToMatch(
  match,
  eventCode,
  editsRoot,
  ftcMode
) {
  if (!match) return match;
  if (!eventCode || !editsRoot || typeof editsRoot !== "object") {
    return match;
  }
  const key = getPlayoffStationOrderMatchKey(match, ftcMode);
  if (!key) return match;
  const entry = editsRoot[eventCode]?.[key];
  if (!entry || !Array.isArray(entry.teams) || entry.teams.length === 0) {
    return match;
  }
  const entryNorm = teamsWithCanonicalStations(entry.teams);
  const matchNorm = teamsWithCanonicalStations(match.teams);
  const { red: rOver, blue: bOver } = partitionPlayoffMainFieldStations(entryNorm);
  const { rest: rRestBase } = partitionMatchTeamsByAllianceColor(matchNorm);

  const teams = rebundleMatchTeamsAfterReorder(rOver, bOver, rRestBase);
  return { ...match, teams };
}
