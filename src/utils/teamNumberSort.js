import _ from "lodash";

/**
 * Splits a team identifier such as 841, "841", or "841B" into its numeric part and letter suffix.
 * Identifiers without a leading number sort after all numbered teams.
 * @param {number|string} identifier
 * @returns {{ number: number, suffix: string }}
 */
export function parseTeamIdentifier(identifier) {
  const text = String(identifier ?? "").trim();
  const match = text.match(/^(\d+)(.*)$/);
  if (!match) return { number: Number.POSITIVE_INFINITY, suffix: text.toUpperCase() };
  return { number: Number(match[1]), suffix: match[2].toUpperCase() };
}

/**
 * Orders rows by team number, then letter suffix (e.g. 8, 8B, 841, 841B, 2035).
 * @param {object[]} rows
 * @param {(row: object) => number|string} getIdentifier returns the displayed team identifier for a row
 * @param {"asc"|"desc"} [direction]
 * @returns {object[]}
 */
export function orderByTeamNumber(rows, getIdentifier, direction = "asc") {
  return _.orderBy(
    rows,
    [
      (row) => parseTeamIdentifier(getIdentifier(row)).number,
      (row) => parseTeamIdentifier(getIdentifier(row)).suffix,
    ],
    [direction, direction]
  );
}
