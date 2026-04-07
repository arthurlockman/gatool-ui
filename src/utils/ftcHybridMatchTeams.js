import _ from "lodash";

/**
 * Coerce FTC / hybrid API team id to a number when it is numeric.
 * @param {*} v
 * @returns {number|*}
 */
function coerceTeamNumberValue(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return v;
}

/**
 * gatool FTC `/alliances/{event}` returns captain / round1 / … as either a scalar team id or
 * `{ teamNumber, displayTeamNumber, teamName }`. The app must store scalars for Lookup keys and Bracket joins.
 * @param {*} slot
 * @returns {number|null|*}
 */
export function extractAllianceSlotTeamNumber(slot) {
  if (slot == null || slot === "") return null;
  if (typeof slot === "object" && !Array.isArray(slot)) {
    const n = slot.teamNumber ?? slot.displayTeamNumber ?? null;
    if (n == null || n === "") return null;
    return coerceTeamNumberValue(n);
  }
  return coerceTeamNumberValue(slot);
}

/**
 * Flatten nested team objects on an alliance row (FTC gatool JSON).
 * @param {object} alliance
 * @returns {object}
 */
export function normalizeFtcGatoolAllianceRow(alliance) {
  if (!alliance || typeof alliance !== "object") return alliance;
  return {
    ...alliance,
    captain: extractAllianceSlotTeamNumber(alliance.captain),
    round1: extractAllianceSlotTeamNumber(alliance.round1),
    round2: extractAllianceSlotTeamNumber(alliance.round2),
    round3: extractAllianceSlotTeamNumber(alliance.round3),
    backup: extractAllianceSlotTeamNumber(alliance.backup),
  };
}

/**
 * Normalize station strings from FTC API (e.g. "red1", "Red 1") to "Red1".
 * @param {string} station
 * @returns {string}
 */
function normalizeFtcStation(station) {
  if (station == null || typeof station !== "string") return station;
  const compact = station.replace(/\s+/g, "");
  const m = compact.match(/^(red|blue)(\d+)$/i);
  if (!m) return station;
  const color = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
  return `${color}${m[2]}`;
}

/**
 * Ensure hybrid match team row uses `teamNumber` (FTC often returns `team` or `TeamId`).
 * @param {object} team
 * @returns {object}
 */
export function normalizeFtcHybridTeamEntry(team) {
  if (!team || typeof team !== "object") return team;
  const nestedTeam =
    team.team && typeof team.team === "object"
      ? team.team.teamNumber ??
        team.team.number ??
        team.team.TeamId ??
        null
      : null;
  const raw =
    team.teamNumber ??
    team.team ??
    nestedTeam ??
    team.TeamId ??
    team.teamId ??
    team.number ??
    null;
  if (raw == null || raw === "") {
    return { ...team };
  }
  const num = coerceTeamNumberValue(raw);
  return {
    ...team,
    teamNumber: num,
  };
}

/**
 * Normalize all team rows on a schedule match (qual or playoff).
 * @param {object} match
 * @returns {object}
 */
export function normalizeFtcHybridMatch(match) {
  if (!match || typeof match !== "object") return match;
  const seriesVal =
    match.series != null && match.series !== ""
      ? match.series
      : match.matchSeries != null
        ? match.matchSeries
        : null;
  const withSeries =
    seriesVal != null && seriesVal !== ""
      ? { ...match, series: seriesVal }
      : { ...match };

  if (!withSeries.teams || !Array.isArray(withSeries.teams)) return withSeries;

  return {
    ...withSeries,
    teams: withSeries.teams.map((t) => {
      const n = normalizeFtcHybridTeamEntry(t);
      return {
        ...n,
        station: normalizeFtcStation(n.station),
      };
    }),
  };
}

/**
 * gatool hybrid playoff JSON is usually { schedule: Match[] } but some FTC payloads are
 * a bare array, { matches: [] }, or { schedule: { matches: [] } }. Normalize to { schedule: Match[] }.
 * @param {*} raw
 * @returns {object}
 */
export function normalizePlayoffScheduleApiResponse(raw) {
  if (raw == null) return raw;
  if (Array.isArray(raw)) {
    return { schedule: raw };
  }
  if (typeof raw !== "object") return raw;
  if (Array.isArray(raw.schedule)) {
    return raw;
  }
  if (Array.isArray(raw.matches)) {
    return { ...raw, schedule: raw.matches };
  }
  if (raw.schedule && typeof raw.schedule === "object") {
    if (Array.isArray(raw.schedule.matches)) {
      return { ...raw, schedule: raw.schedule.matches };
    }
  }
  return raw;
}

/**
 * Pull robot team numbers from an FTC score "alliance" object when schedule teams are missing.
 * @param {object} allianceObj
 * @returns {Array<number|*>}
 */
function extractTeamNumbersFromFtcScoreAlliance(allianceObj) {
  if (!allianceObj || typeof allianceObj !== "object") return [];
  const fromKeys = [];
  for (const [k, v] of Object.entries(allianceObj)) {
    if (!/^robot\d+$/i.test(k) && !/^team\d+$/i.test(k)) continue;
    if (v == null || v === "") continue;
    const n = coerceTeamNumberValue(v);
    if (n != null) fromKeys.push(n);
  }
  if (Array.isArray(allianceObj.robots)) {
    allianceObj.robots.forEach((r) => {
      const raw = r?.teamNumber ?? r?.team ?? r?.number ?? r?.TeamId;
      const n = coerceTeamNumberValue(raw);
      if (n != null) fromKeys.push(n);
    });
  }
  if (fromKeys.length > 0) return _.uniq(fromKeys);

  const skip = new Set([
    "totalPoints",
    "alliance",
    "dq1",
    "dq2",
    "coopertitionCriteriaMet",
    "penaltyPoints",
  ]);
  const fallback = [];
  for (const [k, v] of Object.entries(allianceObj)) {
    if (skip.has(k) || typeof v === "object") continue;
    if (typeof v === "number" && Number.isInteger(v) && v > 0 && v < 200000) {
      fallback.push(v);
    } else if (typeof v === "string" && /^\d{1,6}$/.test(v)) {
      fallback.push(parseInt(v, 10));
    }
  }
  return _.uniq(fallback);
}

/**
 * When the playoff hybrid schedule has scores but empty/missing team numbers, fill teams
 * from score breakdown (alliances[0]=blue, alliances[1]=red per gatool FTC scores).
 * Mutates match.
 * @param {object} match
 * @param {object} results - score row with alliances array
 */
export function hydrateFtcPlayoffTeamsFromResults(match, results) {
  if (!match || !results?.alliances || results.alliances.length < 2) return;

  const withNums = (match.teams || []).filter(
    (t) => t?.teamNumber != null && t?.teamNumber !== ""
  );
  const hasRed = (match.teams || []).some(
    (t) =>
      t?.station?.toLowerCase().startsWith("red") &&
      t?.teamNumber != null &&
      t?.teamNumber !== ""
  );
  const hasBlue = (match.teams || []).some(
    (t) =>
      t?.station?.toLowerCase().startsWith("blue") &&
      t?.teamNumber != null &&
      t?.teamNumber !== ""
  );
  if (withNums.length >= 2 && hasRed && hasBlue) return;

  const blueNums = extractTeamNumbersFromFtcScoreAlliance(results.alliances[0]);
  const redNums = extractTeamNumbersFromFtcScoreAlliance(results.alliances[1]);
  if (redNums.length === 0 && blueNums.length === 0) return;

  const teams = [];
  redNums.slice(0, 2).forEach((n, i) => {
    teams.push({
      teamNumber: n,
      station: `Red${i + 1}`,
      surrogate: false,
      dq: false,
    });
  });
  blueNums.slice(0, 2).forEach((n, i) => {
    teams.push({
      teamNumber: n,
      station: `Blue${i + 1}`,
      surrogate: false,
      dq: false,
    });
  });
  if (teams.length > 0) match.teams = teams;
}
