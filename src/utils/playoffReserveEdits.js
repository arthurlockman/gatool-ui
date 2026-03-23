/**
 * @param {string|number|null|undefined} n
 * @returns {string|number|null}
 */
export function normalizeAllianceTeamNumber(n) {
  if (n === undefined || n === null || n === "") return null;
  const num = Number(n);
  return Number.isNaN(num) ? String(n) : num;
}

/** Keep only valid per-alliance edits: keys must be numeric alliance ids. */
export function compactReserveEditsForEvent(forEvent) {
  const out = {};
  if (!forEvent || typeof forEvent !== "object") return out;
  for (const [k, v] of Object.entries(forEvent)) {
    if (
      /^\d+$/.test(String(k)) &&
      v &&
      typeof v === "object" &&
      (v.op === "set" || v.op === "clear")
    ) {
      out[String(k)] = v;
    }
  }
  return out;
}

/**
 * Apply persisted reserve edits after each alliances fetch.
 * Storage: editsRoot[eventCode][allianceNumberString] =
 *   { op: 'set', round3 } | legacy { op: 'set', backup, backupReplaced } | { op: 'clear' }
 *
 * @returns {string[]} Edit keys to drop when a stored `clear` is redundant (API agrees).
 */
export function applyPlayoffReserveEdits(alliancesData, eventCode, editsRoot) {
  if (!alliancesData?.alliances?.length || !eventCode) return [];
  const raw = editsRoot?.[eventCode];
  const edits = compactReserveEditsForEvent(raw);
  if (Object.keys(edits).length === 0) return [];

  const pruneKeys = [];

  for (const alliance of alliancesData.alliances) {
    if (alliance.number === undefined || alliance.number === null) continue;
    const key = String(alliance.number);
    const e = edits[key];
    if (e === undefined) continue;

    if (e.op === "clear") {
      const apiR3 = normalizeAllianceTeamNumber(alliance.round3);
      const apiB = normalizeAllianceTeamNumber(alliance.backup);
      if (apiR3 == null && apiB == null) {
        pruneKeys.push(key);
      }
      alliance.round3 = null;
      alliance.backup = null;
      alliance.backupReplaced = null;
    } else if (e.op === "set") {
      const hasRound3 =
        e.round3 !== undefined && e.round3 !== null && e.round3 !== "";
      if (hasRound3) {
        alliance.round3 = e.round3;
        alliance.backup = null;
        alliance.backupReplaced = null;
      } else {
        alliance.backup = e.backup ?? null;
        alliance.backupReplaced = e.backupReplaced ?? null;
      }
    }
  }

  return [...new Set(pruneKeys)];
}

/**
 * True when the schedule row has a committed / meaningful result for gating UI and reserve overlays.
 * Do not treat `0–0` with both scores non-null as posted — hybrid feeds often expose placeholders before
 * FMS commits, which incorrectly pruned local reserve edits and hid Remove after changing matches.
 */
export function matchHasPostedResult(m) {
  if (!m || typeof m !== "object") return false;
  if (m.postResultTime != null && m.postResultTime !== "") return true;
  const red = m.scoreRedFinal;
  const blue = m.scoreBlueFinal;
  if (red == null || blue == null) return false;
  const r = Number(red);
  const b = Number(blue);
  if (Number.isNaN(r) || Number.isNaN(b)) return false;
  // Non-zero total indicates a played match when postResultTime is missing (e.g. some secondary feeds).
  return r !== 0 || b !== 0;
}

/**
 * @param {object} m Schedule match row
 * @param {object} pending From reserve edit `pendingSourceMatch`
 * @param {boolean} ftcMode
 */
function scheduleMatchMatchesPending(m, pending, ftcMode) {
  if (!m || !pending || typeof pending !== "object") return false;
  const tl1 = String(m.tournamentLevel || "").toLowerCase();
  const tl2 = String(pending.tournamentLevel || "").toLowerCase();
  if (tl1 !== tl2) return false;
  if (ftcMode) {
    const pSer = pending.series;
    const mSer = m.series;
    if (pSer != null && mSer != null && Number(pSer) !== Number(mSer)) {
      return false;
    }
    const mNum = m.originalMatchNumber ?? m.matchNumber;
    const pNum = pending.originalMatchNumber ?? pending.matchNumber;
    return Number(mNum) === Number(pNum);
  }
  return Number(m.matchNumber) === Number(pending.matchNumber);
}

/**
 * Drop `op: 'set'` reserve overlays when the playoff match they were tied to has posted.
 * @returns {{ nextRoot: object, prunedAllianceKeys: string[] }}
 */
export function prunePlayoffReserveSetsAfterPostedMatches({
  editsRoot,
  eventCode,
  playoffMatches,
  ftcMode,
}) {
  const empty = { nextRoot: editsRoot, prunedAllianceKeys: [] };
  if (!eventCode || !editsRoot?.[eventCode] || !playoffMatches?.length) {
    return empty;
  }
  const raw = editsRoot[eventCode];
  const forEv = compactReserveEditsForEvent({ ...raw });
  const prunedAllianceKeys = [];
  for (const [allianceKey, edit] of Object.entries(forEv)) {
    if (edit?.op !== "set" || !edit.pendingSourceMatch) continue;
    const posted = playoffMatches.some(
      (m) =>
        scheduleMatchMatchesPending(m, edit.pendingSourceMatch, ftcMode) &&
        matchHasPostedResult(m)
    );
    if (posted) {
      prunedAllianceKeys.push(allianceKey);
      delete forEv[allianceKey];
    }
  }
  if (prunedAllianceKeys.length === 0) return empty;
  let nextRoot;
  if (Object.keys(forEv).length === 0) {
    const { [eventCode]: _removed, ...rest } = editsRoot;
    nextRoot = rest;
  } else {
    nextRoot = { ...editsRoot, [eventCode]: forEv };
  }
  return { nextRoot, prunedAllianceKeys };
}
