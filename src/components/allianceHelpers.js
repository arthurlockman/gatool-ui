import _ from "lodash";
import {
    compactReserveEditsForEvent,
} from "../utils/playoffReserveEdits";

// ─── Reserve helpers ──────────────────────────────────────────────────────────

/**
 * True when this alliance has a persisted `op: 'set'` overlay (user-added reserve / round3 in gatool).
 * Merged `alliances` alone mixes API + overlay; comparing to overrides on each render decides if Remove is allowed.
 */
export function hasLocalPlayoffReserveSetOverride(playoffReserveEdits, eventCode, allianceNumber) {
    if (
        !eventCode ||
        allianceNumber === undefined ||
        allianceNumber === null ||
        allianceNumber === ""
    ) {
        return false;
    }
    const raw = playoffReserveEdits?.[eventCode];
    if (!raw || typeof raw !== "object") {
        return false;
    }
    const e = compactReserveEditsForEvent(raw)[String(allianceNumber)];
    if (!e || e.op !== "set") {
        return false;
    }
    const hasRound3 =
        e.round3 !== undefined && e.round3 !== null && e.round3 !== "";
    const hasBackup =
        e.backup !== undefined && e.backup !== null && e.backup !== "";
    return hasRound3 || hasBackup;
}

export function sameAllianceRow(entry, allianceRow) {
    if (!entry || !allianceRow) return false;
    const num = allianceRow.number;
    const name = allianceRow.name;
    return (
        (num !== undefined &&
            num !== null &&
            entry.number !== undefined &&
            entry.number !== null &&
            Number(entry.number) === Number(num)) ||
        (name && entry.alliance === name)
    );
}

export function lookupTeamStillOnAllianceRoster(allianceRow, teamNum) {
    if (teamNum == null || teamNum === "") return false;
    const s = String(teamNum);
    return (
        String(allianceRow.captain) === s ||
        String(allianceRow.round1) === s ||
        String(allianceRow.round2) === s
    );
}

export function syncAllianceLookupRound3Entry(
    alliancesTemp,
    allianceRow,
    prevRound3TeamNumber,
    roundThreeRoleLabel
) {
    const lu = alliancesTemp?.Lookup;
    if (!lu || !allianceRow) return;
    const newR3 = allianceRow.round3;
    if (
        prevRound3TeamNumber != null &&
        prevRound3TeamNumber !== "" &&
        String(prevRound3TeamNumber) !== String(newR3 ?? "")
    ) {
        if (!lookupTeamStillOnAllianceRoster(allianceRow, prevRound3TeamNumber)) {
            delete lu[String(prevRound3TeamNumber)];
        }
    }
    for (const entry of Object.values(lu)) {
        if (sameAllianceRow(entry, allianceRow)) {
            entry.round3 = allianceRow.round3 ?? null;
            entry.backup = null;
            entry.backupReplaced = null;
        }
    }
    const r3 = allianceRow.round3;
    if (r3 != null && r3 !== "") {
        lu[String(r3)] = {
            role: roundThreeRoleLabel,
            alliance: allianceRow.name,
            number: allianceRow.number,
            captain: allianceRow.captain,
            round1: allianceRow.round1,
            round2: allianceRow.round2,
            round3: allianceRow.round3,
            backup: null,
            backupReplaced: null,
        };
    }
}

export function clearAllianceLookupRound3(alliancesTemp, allianceRow, removedRound3) {
    const lu = alliancesTemp?.Lookup;
    if (!lu || !allianceRow) return;
    if (removedRound3 != null && removedRound3 !== "") {
        if (!lookupTeamStillOnAllianceRoster(allianceRow, removedRound3)) {
            delete lu[String(removedRound3)];
        }
    }
    for (const entry of Object.values(lu)) {
        if (sameAllianceRow(entry, allianceRow)) {
            entry.round3 = null;
            entry.backup = null;
            entry.backupReplaced = null;
        }
    }
}

export function getAllianceIndexForMatchSide(side, matchDetails, alliancesTemp) {
    const field = matchDetails?.teams?.find(
        (t) =>
            String(t.station || "").startsWith(side) &&
            t.teamNumber != null &&
            Number(t.teamNumber) > 0
    );
    if (!field) return null;
    const lu = alliancesTemp?.Lookup?.[String(field.teamNumber)];
    if (!lu?.alliance) return null;
    const idx = _.findIndex(alliancesTemp?.alliances, { name: lu.alliance });
    if (idx < 0) return null;
    return { idx, allianceName: lu.alliance };
}

/**
 * @param {'Red'|'Blue'} side
 * @returns {null | { teamNumber: number|string, allianceName: string, allianceNumber: number|string, side: string, isPlayoffReserve: boolean }}
 */
export function getPlayoffReserveForSide(side, matchDetails, alliances, inPlayoffs) {
    if (!inPlayoffs || !matchDetails?.teams?.length || !alliances?.alliances?.length) {
        return null;
    }

    const allianceNumbersOnSide = new Set();
    if (alliances?.Lookup) {
        matchDetails.teams.forEach((t) => {
            const stationSide = String(t.station || "").startsWith("Blue") ? "Blue" : "Red";
            if (stationSide !== side) return;
            const lu = alliances.Lookup[String(t.teamNumber)];
            if (lu?.number !== undefined && lu?.number !== null && lu?.number !== "") {
                const n = Number(lu.number);
                if (Number.isFinite(n)) allianceNumbersOnSide.add(n);
            }
        });
    }
    if (allianceNumbersOnSide.size === 0) {
        const sideTeamNums = new Set(
            matchDetails.teams
                .filter((t) => String(t.station || "").startsWith(side))
                .map((t) => String(t.teamNumber))
        );
        for (const al of alliances.alliances) {
            const rosterNums = [al.captain, al.round1, al.round2, al.round3, al.backup]
                .filter((n) => n != null && n !== "")
                .map(String);
            if (rosterNums.some((n) => sideTeamNums.has(n))) {
                const alNum = Number(al.number);
                if (Number.isFinite(alNum)) allianceNumbersOnSide.add(alNum);
            }
        }
    }

    for (const al of alliances.alliances) {
        const reserveNum =
            al.round3 !== undefined && al.round3 !== null && al.round3 !== ""
                ? al.round3
                : al.backup !== undefined && al.backup !== null && al.backup !== ""
                  ? al.backup
                  : null;
        const alNum = Number(al.number);
        if (!Number.isFinite(alNum) || !allianceNumbersOnSide.has(alNum)) continue;
        if (reserveNum == null) continue;
        const isMainFieldTeam = matchDetails.teams.some(
            (t) =>
                String(t.teamNumber) === String(reserveNum) &&
                /^(Red|Blue)[123]$/.test(String(t.station || ""))
        );
        if (isMainFieldTeam) continue;
        return {
            teamNumber: reserveNum,
            allianceName: al.name,
            allianceNumber: al.number,
            side,
            isPlayoffReserve: true,
        };
    }
    return null;
}
