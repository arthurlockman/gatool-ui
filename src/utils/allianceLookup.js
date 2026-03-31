/**
 * Resolve an alliance Lookup entry for a team id, matching Bracket/Emcee behavior:
 * try raw key, then remapNumberToString(teamNumber) when remappings exist.
 * @param {Record<string, object>|null|undefined} lookup - alliances.Lookup
 * @param {*} teamNumber
 * @param {(n: *) => *} [remapNumberToString]
 * @returns {object|null}
 */
export function getAllianceLookupEntry(
  lookup,
  teamNumber,
  remapNumberToString
) {
  if (
    !lookup ||
    teamNumber === null ||
    teamNumber === undefined ||
    teamNumber === ""
  ) {
    return null;
  }
  const k1 = `${teamNumber}`;
  if (lookup[k1]) return lookup[k1];
  if (typeof remapNumberToString === "function") {
    const k2 = `${remapNumberToString(teamNumber)}`;
    if (k2 && lookup[k2]) return lookup[k2];
  }
  return null;
}
